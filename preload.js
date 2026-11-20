const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('studio', {
  platform: process.platform,
  version: '0.7.4',
  checkClaude: () => ipcRenderer.invoke('cc:check'),
  getSettings: () => ipcRenderer.invoke('settings:get'),
  setSettings: (s) => ipcRenderer.invoke('settings:set', s),
  openWorkspace: () => ipcRenderer.invoke('ws:open'),
  saveMedia: (name, bytes) => ipcRenderer.invoke('media:save', name, bytes),
  startJob: (job) => ipcRenderer.invoke('job:start', job),
  cancelJob: (id) => ipcRenderer.invoke('job:cancel', id),
  jobResult: (id) => ipcRenderer.invoke('job:result', id),
  runningJobs: () => ipcRenderer.invoke('job:running'),
  onJobEvent: (fn) => ipcRenderer.on('job:event', (_e, m) => fn(m))
});
