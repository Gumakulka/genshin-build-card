const { app, BrowserWindow, Menu, shell } = require('electron');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PORT = 5500;
const HOSTED_URL = 'https://gumakulka.github.io/genshin-build-card/';
const FILES = new Set(['index.html', 'app.js', 'style.css', 'features.css']);
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8'
};

function startServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const requested = new URL(req.url, 'http://127.0.0.1').pathname;
      const name = decodeURIComponent(requested).replace(/^\/+/, '') || 'index.html';
      if (!FILES.has(name)) {
        res.writeHead(404);
        res.end('Not found');
        return;
      }
      fs.readFile(path.join(ROOT, name), (error, data) => {
        if (error) {
          res.writeHead(404);
          res.end('Not found');
          return;
        }
        res.writeHead(200, { 'Content-Type': TYPES[path.extname(name)] || 'application/octet-stream' });
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
