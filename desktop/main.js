const { app, BrowserWindow, Menu, shell } = require('electron');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const ASSETS = app.isPackaged ? path.join(process.resourcesPath, 'assets') : path.join(ROOT, 'build');
const PORT = 5500;
const HOSTED_URL = 'https://gumakulka.github.io/genshin-build-card/';
const FILES = new Set(['index.html', 'app.js', 'style.css', 'features.css']);
const ASSET_FILES = new Set(['logo.jpg', 'favicon.png']);
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg'
};

function resolveFile(name) {
  if (FILES.has(name)) return path.join(ROOT, name);
  if (name.startsWith('build/') && ASSET_FILES.has(name.slice(6))) return path.join(ASSETS, name.slice(6));
  return null;
}

function startServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      let name;
      try {
        const requested = new URL(req.url, 'http://127.0.0.1').pathname;
        name = decodeURIComponent(requested).replace(/^\/+/, '') || 'index.html';
      } catch (error) {
        res.writeHead(400);
        res.end('Bad request');
        return;
      }
      const file = resolveFile(name);
      if (!file) {
        res.writeHead(404);
        res.end('Not found');
        return;
      }
      fs.readFile(file, (error, data) => {
        if (error) {
          res.writeHead(404);
          res.end('Not found');
          return;
        }
        res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
        res.end(data);
      });
    });
    server.once('error', () => resolve(null));
    server.listen(PORT, '127.0.0.1', () => resolve('http://127.0.0.1:' + PORT + '/'));
  });
}

function createWindow(url) {
  const win = new BrowserWindow({
    width: 1200,
    height: 850,
    minWidth: 480,
    minHeight: 600,
    autoHideMenuBar: true,
    title: 'Genshin Build Card',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  const origin = new URL(url).origin;

  win.webContents.setWindowOpenHandler(({ url: target }) => {
    if (/^https?:\/\//.test(target)) shell.openExternal(target);
    return { action: 'deny' };
  });

  win.webContents.on('will-navigate', (event, target) => {
    if (new URL(target).origin !== origin) {
      event.preventDefault();
      if (/^https?:\/\//.test(target)) shell.openExternal(target);
    }
  });

  win.loadURL(url);
}

app.whenReady().then(async () => {
  Menu.setApplicationMenu(null);
  const localUrl = await startServer();
  createWindow(localUrl || HOSTED_URL);
});

app.on('window-all-closed', () => {
  app.quit();
});
