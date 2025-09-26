const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // API calls to backend
  apiCall: (endpoint, method = 'GET', data = null) => 
    ipcRenderer.invoke('api-call', { endpoint, method, data }),

  // File operations
  readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
  writeFile: (filePath, data) => ipcRenderer.invoke('write-file', filePath, data),

  // Menu events listeners
  onMenuAction: (callback) => {
    const menuEvents = [
      'menu-new-project',
      'menu-open-project', 
      'menu-save-project',
      'menu-import-image',
      'menu-export-image',
      'menu-undo',
      'menu-redo',
      'menu-zoom-in',
      'menu-zoom-out',
      'menu-zoom-fit',
      'menu-filter-gaussian-blur',
      'menu-filter-median-blur',
      'menu-filter-unsharp-mask',
      'menu-adjust-brightness-contrast',
      'menu-adjust-hue-saturation',
      'menu-adjust-levels',
      'menu-adjust-curves',
      'menu-about'
    ];

    menuEvents.forEach(event => {
      ipcRenderer.on(event, callback);
    });

    // Return cleanup function
    return () => {
      menuEvents.forEach(event => {
        ipcRenderer.removeListener(event, callback);
      });
    };
  },

  // System info
  platform: process.platform,
  versions: process.versions
});

// Expose app info
contextBridge.exposeInMainWorld('appInfo', {
  name: 'Better GIMP',
  version: '0.1.0',
  description: 'Modern and performant image editor'
});