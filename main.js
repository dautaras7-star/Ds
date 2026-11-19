const { app, BrowserWindow, shell, Menu, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

// Write startup problems to %APPDATA%\Viral Studio\viral-studio.log so a failed launch can be diagnosed.
function log(msg) {
  try {
    fs.mkdirSync(app.getPath('userData'), { recursive: true });
    fs.appendFileSync(path.join(app.getPath('userData'), 'viral-studio.log'), `[${new Date().toISOString()}] ${msg}\n`);
  } catch (_) { /* logging must never crash the app */ }
}

process.on('uncaughtException', (err) => {
  log('uncaughtException: ' + (err && err.stack || err));
  dialog.showErrorBox('Viral Studio hit an error', String(err && err.stack || err));
});

let win = null;

function createWindow() {
  win = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1100,
    minHeight: 700,
    center: true,
    backgroundColor: '#0b0b10',
    title: 'Viral Studio',
    icon: path.join(__dirname, 'build', 'icon.png'),
    titleBarStyle: 'hidden',
    titleBarOverlay: { color: '#0b0b10', symbolColor: '#f2f2f7', height: 40 },
    // Show right away. Waiting for 'ready-to-show' can leave the window hidden forever on some Windows PCs.
    show: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  win.webContents.on('did-fail-load', (_e, code, desc, url) => log(`did-fail-load ${code} ${desc} ${url}`));
  win.webContents.on('render-process-gone', (_e, details) => log('render-process-gone ' + JSON.stringify(details)));
  win.on('closed', () => { win = null; });

  // Open external links in the user's browser, never inside the app.
  win.webContents.setWindowOpenHandler(({ url }) => { shell.openExternal(url); return { action: 'deny' }; });
  win.loadFile(path.join(__dirname, 'app', 'index.html')).catch((err) => log('loadFile failed: ' + err));
}

// One copy at a time: clicking the shortcut again brings the existing window to the front.
if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (!win) return createWindow();
    if (win.isMinimized()) win.restore();
    win.show();
    win.focus();
  });

  Menu.setApplicationMenu(null);
  app.whenReady().then(() => {
    log(`start v${app.getVersion()} on ${process.platform} ${process.getSystemVersion()}`);
    createWindow();
    app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
  }).catch((err) => log('whenReady failed: ' + err));

  app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
}
