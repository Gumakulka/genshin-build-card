import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import vm from 'node:vm';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const paths = {
  store: 'src/js/services/store.js', player: 'src/js/services/player.js',
  tabs: 'src/js/ui/detail-tabs.js', hero: 'src/js/features/hero-art.js', farm: 'src/js/features/farm.js'
};
function context(extra = {}) {
  return vm.createContext({ console: { warn() {}, error() {} }, Headers, Response, AbortController, setTimeout, clearTimeout, setInterval, clearInterval, state: { lang: 'pl', last: null }, loadSetting: (key, fallback) => fallback, loadJsonSetting: (key, fallback) => fallback, saveJsonSetting() {}, saveSetting() {}, sanitizeList: (value, fallback) => Array.isArray(value) ? value : fallback, ...extra });
}
function load(name, ctx, transform = (s) => s) {
  vm.runInContext(transform(readFileSync(resolve(root, paths[name]), 'utf8')), ctx);
}
let passed = 0;
async function test(name, run) {
  await run();
  passed++;
  console.log('OK ' + name);
}

const s = context({ STORE_URL: 'https://example.test/', fetch: async () => new Response('{"ok":true}') });
load('store', s);
await test('safe normal icon', () => assert.equal(vm.runInContext("normIcon('/ui/UI_X.png')", s), 'UI_X'));
await test('unsafe image path', () => assert.equal(vm.runInContext("normIcon('../secret')", s), ''));
await test('non-string icon', () => assert.equal(vm.runInContext('normIcon({})', s), ''));
await test('prototype keys dropped', () => {
  const out = vm.runInContext(`normalizePfps(JSON.parse('{"__proto__":{"evil":true},"7400":{"iconPath":"/ui/X.png"}}'))`, s);
  assert.equal(Object.getPrototypeOf(out), null);
  assert.deepEqual(Object.keys(out), ['7400']);
});
await test('array costume ids validated', () => {
  const out = vm.runInContext(`normalizeCostumes([{id:'__proto__',icon:'X'},{id:200301,icon:'Y'}])`, s);
  assert.deepEqual(Object.keys(out), ['200301']);
});
await test('avatar variants excluded', () => assert.equal(vm.runInContext(`Object.keys(normalizeAvatars({'10000007-502':{},'10000091':{}})).length`, s), 1));
s.caches = { open: async () => { throw Error('denied'); } };
await test('cache open denied still fetches', async () => assert.equal((await (await vm.runInContext("cachedFetch('https://example.test/data')", s)).json()).ok, true));
s.caches = { open: async () => ({ match: async () => null, put: async () => { throw Error('quota'); } }) };
await test('cache write denied keeps network data', async () => assert.equal((await (await vm.runInContext("cachedFetch('https://example.test/data')", s)).json()).ok, true));
s.caches = { open: async () => ({ match: async () => new Response('{"old":true}', { headers: { 'x-fetched-at': '1' } }) }) };
s.fetch = async () => { throw Error('offline'); };
await test('offline uses stale store cache', async () => assert.equal((await (await vm.runInContext("cachedFetch('https://example.test/data')", s)).json()).old, true));
s.caches = undefined;
s.fetch = async () => new Response('[]');
await test('JSON arrays rejected for store', async () => assert.equal(await vm.runInContext("fetchJson('avatars.json')", s), null));

const p = context({ WORKER_URL: 'https://example.test/uid/', t: (key) => key === 'errors' ? {} : key, localStorage: { getItem() { throw Error('denied'); }, removeItem() { throw Error('denied'); }, setItem() { throw Error('denied'); } }, fetch: async () => new Response('{"playerInfo":{"nickname":"Test"}}') });
load('player', p);
await test('getCache survives denied storage', () => assert.equal(vm.runInContext("getCache('760720445')", p), null));
await test('network works with denied storage', async () => assert.equal((await vm.runInContext("fetchPlayer('760720445')", p)).playerInfo.nickname, 'Test'));
await test('array profile rejected', () => assert.equal(vm.runInContext('hasPlayerInfo({playerInfo:[]})', p), false));
await test('null avatar entry rejected', () => assert.equal(vm.runInContext("hasPlayerInfo({playerInfo:{nickname:'x'},avatarInfoList:[null]})", p), false));
await test('valid empty showcase accepted', () => assert.equal(vm.runInContext("hasPlayerInfo({playerInfo:{nickname:'x'},avatarInfoList:[]})", p), true));
await test('invalid UID rejected before fetch', async () => {
  let calls = 0;
  p.fetch = async () => { calls++; throw Error('unexpected fetch'); };
  await assert.rejects(vm.runInContext("fetchPlayer('../bad')", p));
  assert.equal(calls, 0);
});
p.fetch = async () => new Response('invalid JSON');
await test('interrupted/invalid JSON allows offline fallback', async () => {
  await assert.rejects(vm.runInContext("fetchPlayer('760720445')", p), (error) => error.network === true);
});

console.log('Passed ' + passed + ' regression tests. No browser rendering was tested.');
