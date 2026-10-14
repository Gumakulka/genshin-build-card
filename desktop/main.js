const { app, BrowserWindow, Menu, shell } = require('electron');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const ASSETS = app.isPackaged ? path.join(process.resourcesPath, 'assets') : path.join(ROOT, 'build');
const PREFERRED_PORT = 5500;
const HOSTED_URL = 'https://gumakulka.github.io/genshin-build-card/';
const ASSET_FILES = new Set(['logo.jpg', 'favicon.png']);
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg'
};
const BASE_HEADERS = {
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff'
};
const HIDE_SCROLLBAR_CSS = 'html { scrollbar-width: none; } ::-webkit-scrollbar { display: none; }';
const BACKGROUND_COLOR = '#0b0b0f';
const SHOW_FALLBACK_MS = 4000;
const MAX_CRASH_RELOADS = 3;

function resolveFile(name) {
  if (name.includes('..') || name.includes('\\')) return null;
  if (name === 'index.html') return path.join(ROOT, 'index.html');
  if (name.startsWith('src/') && TYPES[path.extname(name)]) return path.join(ROOT, name);
  if (name.startsWith('build/') && ASSET_FILES.has(name.slice(6))) return path.join(ASSETS, name.slice(6));
  return null;
}

function send(res, status, type, body) {
  res.writeHead(status, { ...BASE_HEADERS, 'Content-Type': type });
  res.end(body);
}

function listen(server, port) {
  return new Promise((resolve, reject) => {
    const onError = (error) => {
      server.removeListener('listening', onListening);
      reject(error);
    };
    const onListening = () => {
      server.removeListener('error', onError);
      resolve(server.address().port);
    };
    server.once('error', onError);
    server.once('listening', onListening);
    server.listen(port, '127.0.0.1');
  });
}

async function startServer() {
  const server = http.createServer((req, res) => {
    let name;
    try {
      const requested = new URL(req.url, 'http://127.0.0.1').pathname;
      name = decodeURIComponent(requested).replace(/^\/+/, '') || 'index.html';
    } catch (error) {
      send(res, 400, 'text/plain; charset=utf-8', 'Bad request');
      return;
    }
    const file = resolveFile(name);
    if (!file) {
      send(res, 404, 'text/plain; charset=utf-8', 'Not found');
      return;
    }
    fs.readFile(file, (error, data) => {
      if (error) {
        send(res, 404, 'text/plain; charset=utf-8', 'Not found');
        return;
      }
      send(res, 200, TYPES[path.extname(file)] || 'application/octet-stream', data);
    });
  });
  // Stały port zachowuje ten sam origin (localStorage); gdy zajęty, bierzemy wolny port systemowy.
  for (const port of [PREFERRED_PORT, 0]) {
    try {
      const actual = await listen(server, port);
      return 'http://127.0.0.1:' + actual + '/';
    } catch (error) {
      console.error(error);
    }
  }
  return null;
}

function boundsFile() {
  return path.join(app.getPath('userData'), 'window.json');
}

function loadSize() {
  try {
    const saved = JSON.parse(fs.readFileSync(boundsFile(), 'utf8'));
    if (saved.width >= 480 && saved.height >= 600) return { width: saved.width, height: saved.height };
  } catch (error) {
    return { width: 1200, height: 850 };
  }
  return { width: 1200, height: 850 };
}

function saveSize(win) {
  try {
    const { width, height } = win.getNormalBounds();
    fs.writeFileSync(boundsFile(), JSON.stringify({ width, height }));
  } catch (error) {
    console.error(error);
  }
}

function createWindow(url) {
  const size = loadSize();
  const win = new BrowserWindow({
    width: size.width,
    height: size.height,
    minWidth: 480,
    minHeight: 600,
    show: false,
    backgroundColor: BACKGROUND_COLOR,
    autoHideMenuBar: true,
    title: 'Genshin Build Card',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  const origin = new URL(url).origin;
  let crashReloads = 0;

  // Okno pokazujemy dopiero po pierwszym wyrenderowaniu (bez białego błysku); zapas na wypadek błędu.
  const showTimer = setTimeout(() => {
    if (!win.isDestroyed() && !win.isVisible()) win.show();
  }, SHOW_FALLBACK_MS);
  win.once('ready-to-show', () => {
    clearTimeout(showTimer);
    if (!win.isDestroyed()) win.show();
  });

  win.on('close', () => saveSize(win));
  win.on('closed', () => clearTimeout(showTimer));

  win.webContents.on('did-finish-load', () => {
    win.webContents.insertCSS(HIDE_SCROLLBAR_CSS).catch((error) => console.error(error));
  });

  win.webContents.on('render-process-gone', (event, details) => {
    console.error('Render process gone:', details.reason);
    if (details.reason !== 'clean-exit' && crashReloads < MAX_CRASH_RELOADS && !win.isDestroyed()) {
      crashReloads += 1;
      win.reload();
    }
  });

  win.webContents.setWindowOpenHandler(({ url: target }) => {
    if (/^https?:\/\//.test(target)) shell.openExternal(target);
    return { action: 'deny' };
  });

  win.webContents.on('will-navigate', (event, target) => {
    let targetOrigin;
    try {
      targetOrigin = new URL(target).origin;
    } catch (error) {
      event.preventDefault();
      return;
    }
    if (targetOrigin !== origin) {
      event.preventDefault();
      if (/^https?:\/\//.test(target)) shell.openExternal(target);
    }
  });

  win.loadURL(url);
  return win;
}

let mainWindow = null;

// Jedna kopia programu naraz: druga próba uruchomienia tylko przywraca istniejące okno.
if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (!mainWindow || mainWindow.isDestroyed()) return;
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  });

  app.whenReady().then(async () => {
    Menu.setApplicationMenu(null);
    const localUrl = await startServer();
    mainWindow = createWindow(localUrl || HOSTED_URL);
  });

  app.on('window-all-closed', () => {
    app.quit();
  });
}
