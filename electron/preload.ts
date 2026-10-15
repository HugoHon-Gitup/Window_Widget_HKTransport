import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  // Window actions
  minimize: () => ipcRenderer.send('window-minimize'),
  close: () => ipcRenderer.send('window-close'),
  hide: () => ipcRenderer.send('window-hide'),
  show: () => ipcRenderer.send('window-show'),
  toggleWidget: () => ipcRenderer.send('window-toggle-visibility'),
  isWidgetVisible: () => ipcRenderer.sendSync('window-is-visible'),
  setAlwaysOnTop: (flag: boolean) => ipcRenderer.send('window-set-always-on-top', flag),
  setWidgetSize: (size: 'medium' | 'small') => ipcRenderer.send('window-set-widget-size', size),
  openManager: () => ipcRenderer.send('open-manager-window'),
  closeManager: () => ipcRenderer.send('close-manager-window'),
  openExternal: (url: string) => ipcRenderer.send('open-external-url', url),

  // Storage actions
  loadConfigs: () => ipcRenderer.sendSync('storage-load-configs'),
  saveConfigs: (configs: any) => ipcRenderer.send('storage-save-configs', configs),
  getActiveIndex: () => ipcRenderer.sendSync('storage-get-active-index'),
  setActiveIndex: (idx: number) => ipcRenderer.send('storage-set-active-index', idx),
  loadSnapshot: (id: string) => ipcRenderer.sendSync('storage-load-snapshot', id),
  saveSnapshot: (snapshot: any) => ipcRenderer.send('storage-save-snapshot', snapshot),
  loadSettings: () => ipcRenderer.sendSync('storage-load-settings'),
  saveSettings: (settings: any) => ipcRenderer.send('storage-save-settings', settings),

  // Events from Main process / Tray
  onCycleRoute: (callback: (step: number) => void) => {
    const handler = (_: any, step: number) => callback(step);
    ipcRenderer.on('tray-cycle-route', handler);
    return () => {
      ipcRenderer.removeListener('tray-cycle-route', handler);
    };
  },
  onRefresh: (callback: () => void) => {
    const handler = () => callback();
    ipcRenderer.on('tray-refresh', handler);
    return () => {
      ipcRenderer.removeListener('tray-refresh', handler);
    };
  },
  onConfigChanged: (callback: () => void) => {
    const handler = () => callback();
    ipcRenderer.on('config-updated-broadcast', handler);
    return () => {
      ipcRenderer.removeListener('config-updated-broadcast', handler);
    };
  },
  onSettingsChanged: (callback: (settings: any) => void) => {
    const handler = (_: any, settings: any) => callback(settings);
    ipcRenderer.on('settings-updated-broadcast', handler);
    return () => {
      ipcRenderer.removeListener('settings-updated-broadcast', handler);
    };
  },
});

