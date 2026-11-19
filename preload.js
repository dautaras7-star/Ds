const { contextBridge } = require('electron');
contextBridge.exposeInMainWorld('studio', { platform: process.platform, version: '0.2.0' });
