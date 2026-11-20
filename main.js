const { app, BrowserWindow, shell, Menu, dialog, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

// ---------- logging ----------
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

// ---------- workspace shared with Claude Code ----------
// %APPDATA%\Viral Studio\workspace holds CLAUDE.md (worker instructions), jobs/, results/ and media/.
const ws = () => path.join(app.getPath('userData'), 'workspace');
const settingsFile = () => path.join(app.getPath('userData'), 'settings.json');
const DEFAULT_SETTINGS = {
  claudeCommand: 'claude',
  permissionMode: 'auto',
  useChrome: true,
  allowedTools: 'Read Write Edit Glob Grep Bash WebFetch WebSearch',
  maxCreditsPerVideo: 150
};
function readSettings() {
  try { return { ...DEFAULT_SETTINGS, ...JSON.parse(fs.readFileSync(settingsFile(), 'utf8')) }; }
  catch (_) { return { ...DEFAULT_SETTINGS }; }
}
function writeSettings(s) {
  fs.mkdirSync(app.getPath('userData'), { recursive: true });
  fs.writeFileSync(settingsFile(), JSON.stringify({ ...readSettings(), ...s }, null, 2));
}
function prepareWorkspace() {
  const dir = ws();
  for (const d of ['jobs', 'results', 'media']) fs.mkdirSync(path.join(dir, d), { recursive: true });
  // Refresh the worker instructions on every start so app updates ship new rules.
  fs.copyFileSync(path.join(__dirname, 'worker', 'CLAUDE.md'), path.join(dir, 'CLAUDE.md'));
}

// ---------- running Claude Code ----------
const running = new Map(); // job id -> child process

function resolveClaude() {
  const cmd = readSettings().claudeCommand || 'claude';
  if (cmd !== 'claude' || process.platform !== 'win32') return cmd;
  const home = process.env.USERPROFILE || '';
  const appdata = process.env.APPDATA || '';
  const local = process.env.LOCALAPPDATA || '';
  const candidates = [
    path.join(home, '.local', 'bin', 'claude.exe'),
    path.join(appdata, 'npm', 'claude.cmd'),
    path.join(local, 'Programs', 'claude', 'claude.exe'),
    path.join(local, 'AnthropicClaude', 'claude.exe')
  ];
  for (const c of candidates) { try { if (fs.existsSync(c)) return c; } catch (_) {} }
  return cmd;
}

function quoteWin(a) { return /[\s"&|<>^()]/.test(a) ? '"' + a.replace(/"/g, '\\"') + '"' : a; }

function runClaude(args, input, onLine) {
  const s = readSettings();
  const isWin = process.platform === 'win32';
  // On Windows the CLI is often a .cmd shim, which needs a shell to start.
  const child = spawn(isWin ? quoteWin(resolveClaude()) : resolveClaude(), isWin ? args.map(quoteWin) : args, {
    cwd: ws(), shell: isWin, windowsHide: true, env: { ...process.env }
  });
  let buf = '';
  child.stdout.on('data', (d) => {
    buf += d.toString();
    let i;
    while ((i = buf.indexOf('\n')) >= 0) { const line = buf.slice(0, i).trim(); buf = buf.slice(i + 1); if (line) onLine(line); }
  });
  let err = '';
  child.stderr.on('data', (d) => { err += d.toString(); });
  if (input != null) { child.stdin.write(input); }
  child.stdin.end();
  return { child, stderr: () => err };
}

function lastText(evt) {
  // Pull a short human-readable progress line out of a stream-json event.
  try {
    if (evt.type === 'assistant' && evt.message && Array.isArray(evt.message.content)) {
      for (const c of evt.message.content.slice().reverse()) {
        if (c.type === 'text' && c.text.trim()) return c.text.trim().split('\n').pop().slice(0, 160);
        if (c.type === 'tool_use') return 'Using ' + String(c.name).replace(/^mcp__[^_]+__/, '').replace(/_/g, ' ');
      }
    }
  } catch (_) { /* ignore */ }
  return null;
}

ipcMain.handle('cc:check', async () => {
  const s = readSettings();
  return new Promise((resolve) => {
    let out = '';
    let done = false;
    const finish = (r) => { if (!done) { done = true; resolve(r); } };
    try {
      const isWin = process.platform === 'win32';
      const child = spawn(isWin ? quoteWin(resolveClaude()) : resolveClaude(), ['--version'], { shell: isWin, windowsHide: true });
      child.stdout.on('data', (d) => { out += d.toString(); });
      child.on('error', () => finish({ ok: false }));
      child.on('close', (code) => finish(code === 0 && out ? { ok: true, version: out.trim() } : { ok: false }));
      setTimeout(() => { try { child.kill(); } catch (_) {} finish({ ok: false }); }, 20000);
    } catch (_) { finish({ ok: false }); }
  });
});

ipcMain.handle('settings:get', () => ({ ...readSettings(), workspace: ws() }));
ipcMain.handle('settings:set', (_e, s) => { writeSettings(s); return readSettings(); });
ipcMain.handle('ws:open', () => shell.openPath(ws()));
ipcMain.handle('media:save', (_e, name, bytes) => {
  const safe = String(name || 'file').replace(/[^A-Za-z0-9._-]/g, '_').slice(-80);
  const fn = Date.now().toString(36) + '-' + safe;
  fs.writeFileSync(path.join(ws(), 'media', fn), Buffer.from(bytes));
  return 'media/' + fn;
});

ipcMain.handle('job:start', (e, job) => {
  const s = readSettings();
  const id = job.id;
  const wc = e.sender;
  const send = (m) => { if (!wc.isDestroyed()) wc.send('job:event', { id, ...m }); };
  fs.writeFileSync(path.join(ws(), 'jobs', id + '.json'), JSON.stringify(job, null, 2));
  const resultPath = path.join(ws(), 'results', id + '.json');
  try { fs.unlinkSync(resultPath); } catch (_) { /* no old result */ }

  const args = ['-p', '--output-format', 'stream-json', '--verbose', '--permission-mode', s.permissionMode];
  if (s.allowedTools.trim()) args.push('--allowedTools', ...s.allowedTools.trim().split(/\s+/));
  if (s.useChrome && job.type === 'scroll') args.push('--chrome');
  const prompt = `You are the Viral Studio worker. Read CLAUDE.md in this folder, then do job ${id} (jobs/${id}.json). Write results/${id}.json exactly as CLAUDE.md describes, then stop.`;

  log(`job ${id} ${job.type} start`);
  send({ kind: 'progress', text: 'Starting Claude Code…' });
  const { child, stderr } = runClaude(args, prompt, (line) => {
    try {
      const evt = JSON.parse(line);
      const t = lastText(evt);
      if (t) send({ kind: 'progress', text: t });
    } catch (_) { /* non-JSON line */ }
  });
  running.set(id, child);
  const limit = job.input && +job.input.maxMinutes;
  if (limit > 0) setTimeout(() => { if (running.get(id) === child) { log(`job ${id} time limit`); try { child.kill(); } catch (_) {} } }, (limit + 3) * 60000);
  child.on('error', (err) => {
    running.delete(id);
    log(`job ${id} spawn error ${err}`);
    send({ kind: 'done', result: { ok: false, error: "Couldn't start Claude Code. Check the Connection page." } });
  });
  child.on('close', (code) => {
    running.delete(id);
    let result;
    try { result = JSON.parse(fs.readFileSync(resultPath, 'utf8')); }
    catch (_) {
      const tail = stderr().trim().split('\n').slice(-2).join(' ').slice(0, 200);
      result = { ok: false, error: code === null ? 'Stopped.' : `Claude Code finished without a result${tail ? ': ' + tail : '.'}` };
    }
    log(`job ${id} end code=${code} ok=${result.ok}`);
    send({ kind: 'done', result });
  });
  return { started: true };
});

ipcMain.handle('job:cancel', (_e, id) => {
  const c = running.get(id);
  if (c) { try { c.kill(); } catch (_) {} }
  return true;
});

// ---------- window ----------
let win = null;
function createWindow() {
  win = new BrowserWindow({
    width: 1440, height: 900, minWidth: 1100, minHeight: 700, center: true,
    backgroundColor: '#0b0b10', title: 'Viral Studio',
    icon: path.join(__dirname, 'build', 'icon.png'),
    titleBarStyle: 'hidden',
    titleBarOverlay: { color: '#0b0b10', symbolColor: '#f2f2f7', height: 40 },
    show: true, // waiting for 'ready-to-show' can leave the window hidden on some Windows PCs
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false, sandbox: true }
  });
  win.webContents.on('did-fail-load', (_e, code, desc, url) => log(`did-fail-load ${code} ${desc} ${url}`));
  win.webContents.on('render-process-gone', (_e, details) => log('render-process-gone ' + JSON.stringify(details)));
  win.on('closed', () => { win = null; });
  // Links open in the user's browser, never inside the app.
  win.webContents.setWindowOpenHandler(({ url }) => { if (/^https?:/.test(url)) shell.openExternal(url); return { action: 'deny' }; });
  win.webContents.on('will-navigate', (e, url) => { if (/^https?:/.test(url)) { e.preventDefault(); shell.openExternal(url); } });
  win.loadFile(path.join(__dirname, 'app', 'index.html')).catch((err) => log('loadFile failed: ' + err));
}

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (!win) return createWindow();
    if (win.isMinimized()) win.restore();
    win.show(); win.focus();
  });
  Menu.setApplicationMenu(null);
  app.whenReady().then(() => {
    log(`start v${app.getVersion()} on ${process.platform} ${process.getSystemVersion()}`);
    try { prepareWorkspace(); } catch (err) { log('workspace: ' + err); }
    createWindow();
    app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
  }).catch((err) => log('whenReady failed: ' + err));
  app.on('before-quit', () => { for (const c of running.values()) { try { c.kill(); } catch (_) {} } });
  app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
}
