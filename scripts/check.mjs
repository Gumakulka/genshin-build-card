import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];

function walk(dir) {
  const out = [];
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (p.endsWith('.js')) out.push(p);
  }
  return out;
}

const jsFiles = ['src/js', 'desktop', 'worker'].flatMap((d) => walk(join(root, d)));
for (const file of jsFiles) {
  const r = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
  if (r.status !== 0) errors.push('Syntax error in ' + file + '\n' + r.stderr);
}

const jsonFiles = ['package.json', 'package-lock.json'].filter((f) => existsSync(join(root, f)));
for (const f of jsonFiles) {
  try {
    JSON.parse(readFileSync(join(root, f), 'utf8'));
  } catch (e) {
    errors.push('Invalid JSON in ' + f + ': ' + e.message);
  }
}

const html = readFileSync(join(root, 'index.html'), 'utf8');
const refs = [...html.matchAll(/\b(?:src|href)\s*=\s*["']([^"'#?]+)["']/gi)]
  .map((m) => m[1])
  .filter((u) => !/^(?:[a-z][a-z0-9+.-]*:|\/\/|data:)/i.test(u));
for (const ref of refs) {
  if (!existsSync(join(root, ref))) errors.push('index.html references missing file: ' + ref);
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log('Checked ' + jsFiles.length + ' JavaScript files, ' + jsonFiles.length + ' JSON file(s), and ' + refs.length + ' HTML references.');
