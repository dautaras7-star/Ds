const { app, BrowserWindow, shell, Menu, dialog, ipcMain, net } = require('electron');
const { pathToFileURL, fileURLToPath } = require('url');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const http = require('http');
const crypto = require('crypto');

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
  maxCreditsPerVideo: 150,
  upscaleMethod: 'web',
  exportDir: ''
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
  const skillsSrc = path.join(__dirname, 'worker', 'skills');
  if (fs.existsSync(skillsSrc)) fs.cpSync(skillsSrc, path.join(dir, '.claude', 'skills'), { recursive: true, force: true });
  writePlaybook();
}
function writePlaybook() {
  const pb = readSettings().playbook || '';
  fs.writeFileSync(path.join(ws(), 'PLAYBOOK.md'), pb.trim() ? pb : '(empty: no playbook yet)\n');
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

function killTree(child) {
  if (!child || child.exitCode !== null) return;
  try {
    if (process.platform === 'win32' && child.pid) spawn('taskkill', ['/pid', String(child.pid), '/T', '/F'], { windowsHide: true });
    else child.kill();
  } catch (_) { try { child.kill(); } catch (__) {} }
}
function withFfmpeg(env) {
  const bin = ffmpegPath(); if (!bin) return { ...env };
  const key = Object.keys(env).find((k) => k.toUpperCase() === 'PATH') || 'PATH';
  return { ...env, [key]: path.dirname(bin) + path.delimiter + (env[key] || ''), FFMPEG_PATH: bin };
}

function quoteWin(a) { return /[\s"&|<>^()]/.test(a) ? '"' + a.replace(/"/g, '\\"') + '"' : a; }

function runClaude(args, input, onLine) {
  const s = readSettings();
  const isWin = process.platform === 'win32';
  // On Windows the CLI is often a .cmd shim, which needs a shell to start.
  const child = spawn(isWin ? quoteWin(resolveClaude()) : resolveClaude(), isWin ? args.map(quoteWin) : args, {
    cwd: ws(), shell: isWin, windowsHide: true, env: withFfmpeg(process.env)
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
ipcMain.handle('settings:set', (_e, s) => { writeSettings(s); try { writePlaybook(); } catch (err) { log('playbook: ' + err); } return readSettings(); });
ipcMain.handle('ws:open', () => shell.openPath(ws()));

// ---------- export finals to a local folder (Google Drive for desktop backs it up to Google Photos) ----------
const exportDir = () => readSettings().exportDir || path.join(app.getPath('documents'), 'Viral Studio', 'Finals');
const clean = (t) => String(t || 'video').replace(/[<>:"/\\|?*\x00-\x1f]/g, '').replace(/\s+/g, ' ').trim().slice(0, 80) || 'video';
ipcMain.handle('export:dir', () => exportDir());
ipcMain.handle('export:open', () => { fs.mkdirSync(exportDir(), { recursive: true }); return shell.openPath(exportDir()); });
ipcMain.handle('export:pick', async () => {
  const r = await dialog.showOpenDialog({ title: 'Folder for finished videos', defaultPath: exportDir(), properties: ['openDirectory', 'createDirectory'] });
  if (r.canceled || !r.filePaths[0]) return exportDir();
  writeSettings({ exportDir: r.filePaths[0] });
  return exportDir();
});
// Work out the real video format from the file's first bytes, so the extension matches the contents.
// ---------- Google Photos (Library API, append-only) ----------
// The user creates their own OAuth "Desktop app" client in Google Cloud and pastes its id and secret.
const GP_SCOPE = 'https://www.googleapis.com/auth/photoslibrary.appendonly';
const gp = () => readSettings().gphotos || {};
const setGp = (patch) => writeSettings({ gphotos: { ...gp(), ...patch } });
let gpAccess = { token: '', exp: 0 };

async function gpToken() {
  const g = gp();
  if (!g.refreshToken) throw new Error('Google Photos is not connected. Connect it on the Connection page.');
  if (gpAccess.token && Date.now() < gpAccess.exp - 60000) return gpAccess.token;
  const res = await net.fetch('https://oauth2.googleapis.com/token', {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: g.clientId, client_secret: g.clientSecret, refresh_token: g.refreshToken, grant_type: 'refresh_token' }).toString()
  });
  const j = await res.json();
  if (!res.ok) {
    if (j.error === 'invalid_grant') { setGp({ refreshToken: '' }); throw new Error('Google Photos sign-in expired. Press Connect Google Photos again.'); }
    throw new Error('Google sign-in failed: ' + (j.error_description || j.error || res.status));
  }
  gpAccess = { token: j.access_token, exp: Date.now() + (j.expires_in || 3600) * 1000 };
  return gpAccess.token;
}

async function gpApi(url, token, body) {
  const res = await net.fetch(url, { method: 'POST', headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error('Google Photos: ' + ((j.error && j.error.message) || res.status));
  return j;
}

ipcMain.handle('gp:status', () => { const g = gp(); return { hasClient: !!(g.clientId && g.clientSecret), connected: !!g.refreshToken, account: g.account || '' }; });
ipcMain.handle('gp:setClient', (_e, { clientId, clientSecret }) => { setGp({ clientId: String(clientId || '').trim(), clientSecret: String(clientSecret || '').trim(), refreshToken: '' }); return true; });
ipcMain.handle('gp:disconnect', () => { setGp({ refreshToken: '', albums: {} }); gpAccess = { token: '', exp: 0 }; return true; });

// Sign in through the user's browser with a one-time local callback (loopback + PKCE).
ipcMain.handle('gp:connect', async () => {
  const g = gp();
  if (!g.clientId || !g.clientSecret) throw new Error('Paste the Client ID and Client secret first.');
  const verifier = crypto.randomBytes(48).toString('base64url');
  const challenge = crypto.createHash('sha256').update(verifier).digest('base64url');
  const state = crypto.randomBytes(16).toString('hex');
  return await new Promise((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      const u = new URL(req.url, 'http://127.0.0.1');
      if (u.pathname !== '/') { res.writeHead(404); return res.end(); }
      const done = (ok, msg) => { res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }); res.end(`<html><body style="font-family:sans-serif;background:#0b0b10;color:#f2f2f7;display:grid;place-items:center;height:100vh"><h2>${ok ? 'Google Photos connected. You can close this tab.' : 'Not connected: ' + msg}</h2></body></html>`); server.close(); };
      if (u.searchParams.get('state') !== state) { done(false, 'state mismatch'); return reject(new Error('Sign-in was interrupted. Try again.')); }
      if (u.searchParams.get('error')) { done(false, u.searchParams.get('error')); return reject(new Error('Google sign-in was cancelled: ' + u.searchParams.get('error'))); }
      try {
        const r = await net.fetch('https://oauth2.googleapis.com/token', {
          method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({ code: u.searchParams.get('code'), client_id: g.clientId, client_secret: g.clientSecret, redirect_uri: redirect, grant_type: 'authorization_code', code_verifier: verifier }).toString()
        });
        const j = await r.json();
        if (!r.ok || !j.refresh_token) throw new Error(j.error_description || j.error || 'No refresh token returned');
        setGp({ refreshToken: j.refresh_token, albums: {} });
        gpAccess = { token: j.access_token, exp: Date.now() + (j.expires_in || 3600) * 1000 };
        done(true); resolve(true);
      } catch (err) { done(false, String(err.message || err)); reject(err); }
    });
    let redirect = '';
    server.listen(0, '127.0.0.1', () => {
      redirect = `http://127.0.0.1:${server.address().port}`;
      const auth = 'https://accounts.google.com/o/oauth2/v2/auth?' + new URLSearchParams({
        client_id: g.clientId, redirect_uri: redirect, response_type: 'code', scope: GP_SCOPE,
        access_type: 'offline', prompt: 'consent', state, code_challenge: challenge, code_challenge_method: 'S256'
      }).toString();
      shell.openExternal(auth);
    });
    setTimeout(() => { try { server.close(); } catch (_) {} reject(new Error('Sign-in timed out after 5 minutes.')); }, 5 * 60000);
  });
});

async function gpAlbum(token, product) {
  const g = gp(); const albums = g.albums || {};
  if (albums[product]) return albums[product];
  const j = await gpApi('https://photoslibrary.googleapis.com/v1/albums', token, { album: { title: 'Viral Studio · ' + product } });
  setGp({ albums: { ...albums, [product]: j.id } });
  return j.id;
}

async function readVideo(src) {
  if (/^https?:/i.test(src)) {
    const res = await net.fetch(src);
    if (!res.ok) throw new Error('Download failed: ' + res.status);
    return Buffer.from(await res.arrayBuffer());
  }
  const from = /^file:/i.test(src) ? fileURLToPath(src) : path.join(ws(), src);
  return fs.readFileSync(from);
}

ipcMain.handle('gp:upload', async (_e, { src, product, name }) => {
  let buf = await readVideo(src);
  if (!sniffVideo(buf)) throw new Error("This clip isn't a video file.");
  try { buf = await toPhoneMp4(buf); } catch (err) { log('convert failed, uploading original: ' + err); }
  const ext = sniffVideo(buf) || 'mp4';
  const mime = ext === 'mov' ? 'video/quicktime' : ext === 'webm' ? 'video/webm' : 'video/mp4';
  const token = await gpToken();
  const up = await net.fetch('https://photoslibrary.googleapis.com/v1/uploads', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/octet-stream', 'X-Goog-Upload-Content-Type': mime, 'X-Goog-Upload-Protocol': 'raw', 'X-Goog-Upload-File-Name': `${clean(name)}.${ext}` },
    body: buf
  });
  const uploadToken = await up.text();
  if (!up.ok) throw new Error('Google Photos upload failed: ' + up.status);
  let albumId = '';
  try { albumId = await gpAlbum(token, clean(product)); } catch (err) { log('album: ' + err); }
  const body = { newMediaItems: [{ description: name, simpleMediaItem: { fileName: `${clean(name)}.${ext}`, uploadToken } }] };
  if (albumId) body.albumId = albumId;
  const j = await gpApi('https://photoslibrary.googleapis.com/v1/mediaItems:batchCreate', token, body);
  const r = (j.newMediaItemResults || [])[0] || {};
  if (r.status && r.status.code) throw new Error('Google Photos: ' + (r.status.message || 'item not created'));
  log(`gphotos uploaded ${name} (${buf.length} bytes)`);
  return { url: (r.mediaItem && r.mediaItem.productUrl) || 'https://photos.google.com/' };
});

// ---------- bundled ffmpeg (joining parts; also put on Claude's PATH) ----------
function ffmpegPath() {
  try { const p = require('ffmpeg-static'); return p ? p.replace('app.asar' + path.sep, 'app.asar.unpacked' + path.sep) : ''; } catch (_) { return ''; }
}
function runFfmpeg(args) {
  return new Promise((resolve, reject) => {
    const bin = ffmpegPath(); if (!bin) return reject(new Error('Video tool (ffmpeg) is missing from the app.'));
    const c = spawn(bin, args, { windowsHide: true }); let err = '';
    c.stderr.on('data', (d) => { err += d.toString(); if (err.length > 200000) err = err.slice(-100000); });
    c.on('error', reject);
    c.on('close', (code) => code === 0 ? resolve(err) : reject(new Error('ffmpeg failed: ' + err.split('\n').slice(-3).join(' ').slice(0, 300))));
  });
}
function ffmpegInfo(file) {
  return new Promise((resolve) => {
    const bin = ffmpegPath(); if (!bin) return resolve('');
    const c = spawn(bin, ['-hide_banner', '-i', file], { windowsHide: true }); let err = '';
    c.stderr.on('data', (d) => { err += d.toString(); });
    c.on('error', () => resolve(err));
    c.on('close', () => resolve(err));
  });
}
async function probe(file) {
  const out = await ffmpegInfo(file);
  const fps = parseFloat((out.match(/, ([\d.]+) fps/) || [])[1]) || 30;
  return { audio: /Stream #.*Audio:/.test(out), fps };
}
// Make any video phone-friendly: H.264 + AAC MP4 (adds silence if the clip has no sound).
async function toPhoneMp4(buf) {
  const tmp = path.join(ws(), 'media', 'conv-' + Date.now().toString(36) + '-' + crypto.randomBytes(3).toString('hex'));
  fs.mkdirSync(tmp, { recursive: true });
  const inp = path.join(tmp, 'in.' + (sniffVideo(buf) || 'mp4')), out = path.join(tmp, 'out.mp4');
  fs.writeFileSync(inp, buf);
  try {
    const info = await probe(inp);
    const args = ['-y', '-i', inp];
    if (!info.audio) args.push('-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=stereo');
    args.push('-map', '0:v:0', '-map', info.audio ? '0:a:0' : '1:a:0', '-shortest',
      '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-pix_fmt', 'yuv420p', '-profile:v', 'high',
      '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-ac', '2', '-movflags', '+faststart', out);
    await runFfmpeg(args);
    return fs.readFileSync(out);
  } finally { try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (_) {} }
}
// Join clips in order into one vertical 1080x1920 video, adding silence to clips without sound.
ipcMain.handle('video:join', async (_e, { srcs, product, name }) => {
  const tmp = path.join(ws(), 'media', 'join-' + Date.now().toString(36));
  fs.mkdirSync(tmp, { recursive: true });
  const inputs = [];
  for (let i = 0; i < srcs.length; i++) {
    const buf = await readVideo(srcs[i]); const ext = sniffVideo(buf) || 'mp4';
    const f = path.join(tmp, `in${i}.${ext}`); fs.writeFileSync(f, buf); inputs.push(f);
  }
  const infos = []; for (const f of inputs) infos.push(await probe(f));
  const fps = Math.min(60, Math.max(...infos.map((x) => Math.round(x.fps)), 24));
  const parts = [];
  for (let i = 0; i < inputs.length; i++) {
    const out = path.join(tmp, `part${i}.mp4`);
    const v = `scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=${fps}`;
    const args = ['-y', '-i', inputs[i]];
    if (!infos[i].audio) args.push('-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=stereo');
    args.push('-vf', v, '-map', '0:v:0', '-map', infos[i].audio ? '0:a:0' : '1:a:0', '-shortest',
      '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-ar', '48000', '-ac', '2', out);
    await runFfmpeg(args); parts.push(out);
  }
  const list = path.join(tmp, 'list.txt');
  fs.writeFileSync(list, parts.map((p) => `file '${p.replace(/\\/g, '/').replace(/'/g, "'\\''")}'`).join('\n'));
  const outName = 'media/joined-' + Date.now().toString(36) + '.mp4';
  await runFfmpeg(['-y', '-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', '-movflags', '+faststart', path.join(ws(), outName)]);
  try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (_) {}
  log(`joined ${srcs.length} clips -> ${outName}`);
  return outName;
});

function sniffVideo(buf) {
  if (buf.length > 12 && buf.toString('latin1', 4, 8) === 'ftyp') return buf.toString('latin1', 8, 12) === 'qt  ' ? 'mov' : 'mp4';
  if (buf.length > 4 && buf.readUInt32BE(0) === 0x1A45DFA3) return 'webm';
  return null;
}
ipcMain.handle('export:video', async (_e, { src, product, name }) => {
  let buf;
  if (/^https?:/i.test(src)) {
    const res = await net.fetch(src);
    if (!res.ok) throw new Error('Download failed: ' + res.status);
    buf = Buffer.from(await res.arrayBuffer());
  } else {
    const from = /^file:/i.test(src) ? fileURLToPath(src) : path.join(ws(), src);
    buf = fs.readFileSync(from);
  }
  if (!sniffVideo(buf)) throw new Error("This clip isn't a video file (" + buf.length + " bytes). Open it with Watch, or Fix it to regenerate.");
  try { buf = await toPhoneMp4(buf); } catch (err) { log('convert failed, saving original: ' + err); }
  const ext = sniffVideo(buf) || 'mp4';
  const dir = path.join(exportDir(), clean(product));
  fs.mkdirSync(dir, { recursive: true });
  let file = path.join(dir, `${clean(name)}.${ext}`), i = 2;
  while (fs.existsSync(file)) file = path.join(dir, `${clean(name)} (${i++}).${ext}`);
  fs.writeFileSync(file, buf);
  log(`exported ${file} (${ext}, ${buf.length} bytes)`);
  return file;
});
// Copy a file the user picked (by its real path) into the work folder.
ipcMain.handle('media:import', (_e, srcPath) => {
  try {
    const safe = path.basename(String(srcPath)).replace(/[^A-Za-z0-9._-]/g, '_').slice(-80);
    const fn = Date.now().toString(36) + '-' + safe;
    fs.copyFileSync(srcPath, path.join(ws(), 'media', fn));
    log('imported ' + srcPath + ' -> media/' + fn);
    return 'media/' + fn;
  } catch (err) { log('import failed ' + srcPath + ': ' + err); throw err; }
});
// Look for clips by file name in the usual folders (Downloads, Desktop, Videos, Documents), two levels deep.
ipcMain.handle('media:find', (_e, names) => {
  const key = (n) => String(n || '').toLowerCase().replace(/\.[a-z0-9]+$/, '').replace(/[\s_\-()]/g, '');
  const want = new Map((names || []).map((n) => [key(n), n]));
  const found = {};
  const roots = ['downloads', 'desktop', 'videos', 'documents'].map((k) => { try { return app.getPath(k); } catch (_) { return null; } }).filter(Boolean);
  const walk = (dir, depth) => {
    let items = [];
    try { items = fs.readdirSync(dir, { withFileTypes: true }); } catch (_) { return; }
    for (const it of items) {
      const full = path.join(dir, it.name);
      if (it.isDirectory()) { if (depth < 2 && !it.name.startsWith('.')) walk(full, depth + 1); continue; }
      if (!/\.(mp4|mov|webm|m4v)$/i.test(it.name)) continue;
      const k = key(it.name);
      if (want.has(k) && !found[want.get(k)]) found[want.get(k)] = full;
    }
  };
  for (const r of roots) walk(r, 0);
  log(`media:find looked for ${want.size}, found ${Object.keys(found).length} in ${roots.join(', ')}`);
  return found;
});
ipcMain.handle('app:log', (_e, msg) => { log('ui: ' + String(msg).slice(0, 500)); return true; });
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
  // A fix continues the Claude Code session that made the clip, so Claude remembers the script and earlier fixes.
  if (job.input && /^[A-Za-z0-9-]{8,}$/.test(job.input.resume_session || '')) args.push('--resume', job.input.resume_session);
  let sessionId = '';
  if (s.allowedTools.trim()) args.push('--allowedTools', ...s.allowedTools.trim().split(/\s+/));
  // Jobs that browse Instagram, TikTok, the web or the Higgsfield website need the user's Chrome.
  const chromeJobs = ['scroll', 'findclips', 'handles', 'usernames', 'competitors', 'recover'];
  if (s.useChrome && (chromeJobs.includes(job.type) || (job.input && job.input.useChrome))) args.push('--chrome');
  const prompt = `You are the Viral Studio worker. Read CLAUDE.md in this folder, then do job ${id} (jobs/${id}.json). Write results/${id}.json exactly as CLAUDE.md describes, then stop.`;

  log(`job ${id} ${job.type} start`);
  send({ kind: 'progress', text: 'Starting Claude Code…' });
  const { child, stderr } = runClaude(args, prompt, (line) => {
    try {
      const evt = JSON.parse(line);
      if (evt.session_id) sessionId = evt.session_id;
      const t = lastText(evt);
      if (t) send({ kind: 'progress', text: t });
    } catch (_) { /* non-JSON line */ }
  });
  running.set(id, child);
  const limit = job.input && +job.input.maxMinutes;
  if (limit > 0) setTimeout(() => { if (running.get(id) === child) { log(`job ${id} time limit`); killTree(child); } }, (limit + 3) * 60000);
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
    if (sessionId) result._session = sessionId;
    send({ kind: 'done', result });
  });
  return { started: true };
});

// Read a finished job's result from disk (for jobs that ended while the app was closed).
ipcMain.handle('job:result', (_e, id) => {
  const safe = String(id).replace(/[^A-Za-z0-9_-]/g, '');
  for (const f of [safe + '.json', safe + '.partial.json']) {
    try { return { file: f, ...JSON.parse(fs.readFileSync(path.join(ws(), 'results', f), 'utf8')) }; } catch (_) { /* not there */ }
  }
  return null;
});
ipcMain.handle('job:running', () => [...running.keys()]);
ipcMain.handle('job:cancel', (_e, id) => {
  const c = running.get(id);
  if (c) killTree(c);
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
  app.on('before-quit', () => { for (const c of running.values()) killTree(c); });
  app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
}
