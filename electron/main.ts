import { app, BrowserWindow, ipcMain, shell, Tray, Menu, nativeImage, globalShortcut } from 'electron';
import path from 'path';
import fs from 'fs';

let widgetWindow: BrowserWindow | null = null;
let managerWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let isQuitting = false;

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
const appDataDir = path.join(app.getPath('appData'), 'HKTransportWidget');

if (!fs.existsSync(appDataDir)) {
  fs.mkdirSync(appDataDir, { recursive: true });
}
const snapshotsDir = path.join(appDataDir, 'snapshots');
if (!fs.existsSync(snapshotsDir)) {
  fs.mkdirSync(snapshotsDir, { recursive: true });
}

// MARK: - Security Helpers
export function isSafeExternalUrl(urlStr: string): boolean {
  try {
    const parsed = new URL(urlStr);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

export function getSafeSnapshotPath(id: string): string | null {
  if (typeof id !== 'string' || !/^[a-zA-Z0-9_\-]+$/.test(id)) {
    return null;
  }
  const resolvedDir = path.resolve(snapshotsDir);
  const targetPath = path.resolve(snapshotsDir, `${id}.json`);
  if (!targetPath.startsWith(resolvedDir + path.sep)) {
    return null;
  }
  return targetPath;
}

function secureWindowWebContents(win: BrowserWindow) {
  // Prevent renderer from spawning unauthorized popups or child windows
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (isSafeExternalUrl(url)) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  // Prevent renderer from navigating away from the local application
  win.webContents.on('will-navigate', (event, url) => {
    const isAllowed =
      url.startsWith('file://') ||
      url.startsWith('http://localhost:') ||
      url.startsWith('http://127.0.0.1:');
    if (!isAllowed) {
      event.preventDefault();
      if (isSafeExternalUrl(url)) {
        shell.openExternal(url);
      }
    }
  });
}

// Window Position Persistence
const posFilePath = path.join(appDataDir, 'widget_pos.json');
function loadWidgetBounds(): { x?: number; y?: number; width?: number; height?: number; size?: 'medium' | 'small' | 'custom' } {
  try {
    if (fs.existsSync(posFilePath)) {
      return JSON.parse(fs.readFileSync(posFilePath, 'utf8'));
    }
  } catch {}
  return {};
}

function saveWidgetBounds(bounds: { x?: number; y?: number; width?: number; height?: number; size?: 'medium' | 'small' | 'custom' }) {
  try {
    fs.writeFileSync(posFilePath, JSON.stringify(bounds, null, 2), 'utf8');
  } catch {}
}

const WIDGET_SIZES = {
  medium: { width: 380, height: 195 },
  small: { width: 195, height: 195 },
};

function toggleWidget() {
  if (!widgetWindow) {
    createWidgetWindow();
    return;
  }
  if (widgetWindow.isVisible()) {
    widgetWindow.hide();
  } else {
    widgetWindow.show();
    widgetWindow.focus();
  }
}

export function getAppIconPath(): string {
  const candidates = [
    path.join(__dirname, '../public/icon.ico'),
    path.join(__dirname, '../dist/icon.ico'),
    path.join(app.getAppPath(), 'public/icon.ico'),
    path.join(app.getAppPath(), 'dist/icon.ico'),
    path.join(__dirname, '../public/icon.png'),
    path.join(__dirname, '../dist/icon.png'),
    path.join(app.getAppPath(), 'dist/icon.png'),
    path.join(app.getAppPath(), 'public/icon.png'),
    path.join(process.resourcesPath, 'icon.ico'),
    path.join(process.resourcesPath, 'icon.png'),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) {
      return c;
    }
  }
  return path.join(__dirname, '../public/icon.ico');
}

export function getAppIcon(): Electron.NativeImage {
  const iconPath = getAppIconPath();
  if (fs.existsSync(iconPath)) {
    return nativeImage.createFromPath(iconPath);
  }
  return nativeImage.createEmpty();
}

function createWidgetWindow() {
  const saved = loadWidgetBounds();
  const currentSize = saved.size === 'small' ? 'small' : 'medium';
  const defaultBounds = WIDGET_SIZES[currentSize];
  const width = saved.width && saved.width >= 220 ? saved.width : defaultBounds.width;
  const height = saved.height && saved.height >= 140 ? saved.height : defaultBounds.height;
  const iconPath = getAppIconPath();
  const appIcon = getAppIcon();

  widgetWindow = new BrowserWindow({
    width,
    height,
    x: saved.x,
    y: saved.y,
    minWidth: 220,
    minHeight: 140,
    maxWidth: 900,
    maxHeight: 700,
    frame: false,
    transparent: true,
    hasShadow: true,
    resizable: true,
    alwaysOnTop: true,
    skipTaskbar: false,
    icon: fs.existsSync(iconPath) ? iconPath : appIcon,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
  });

  secureWindowWebContents(widgetWindow);

  widgetWindow.setAlwaysOnTop(true, 'screen-saver');

  if (isDev && process.env['VITE_DEV_SERVER_URL']) {
    widgetWindow.loadURL(`${process.env['VITE_DEV_SERVER_URL']}?view=widget`);
  } else {
    widgetWindow.loadFile(path.join(__dirname, '../dist/index.html'), {
      query: { view: 'widget' },
    });
  }

  widgetWindow.on('moved', () => {
    if (!widgetWindow) return;
    const [x, y] = widgetWindow.getPosition();
    const current = loadWidgetBounds();
    saveWidgetBounds({ ...current, x, y });
  });

  widgetWindow.on('resize', () => {
    if (!widgetWindow) return;
    const [w, h] = widgetWindow.getSize();
    const current = loadWidgetBounds();
    saveWidgetBounds({ ...current, width: w, height: h, size: 'custom' });
  });

  // Intercept close so widget hides instead of quitting
  widgetWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      widgetWindow?.hide();
    }
  });

  widgetWindow.on('closed', () => {
    widgetWindow = null;
  });
}

function createManagerWindow() {
  if (managerWindow) {
    if (managerWindow.isMinimized()) managerWindow.restore();
    managerWindow.focus();
    return;
  }

  const iconPath = getAppIconPath();
  const appIcon = getAppIcon();

  managerWindow = new BrowserWindow({
    width: 860,
    height: 700,
    minWidth: 640,
    minHeight: 500,
    title: '上車易 EasyBoard - 香港交通到站管理',
    backgroundColor: '#0f172a',
    icon: fs.existsSync(iconPath) ? iconPath : appIcon,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
  });

  secureWindowWebContents(managerWindow);

  if (isDev && process.env['VITE_DEV_SERVER_URL']) {
    managerWindow.loadURL(`${process.env['VITE_DEV_SERVER_URL']}?view=manager`);
  } else {
    managerWindow.loadFile(path.join(__dirname, '../dist/index.html'), {
      query: { view: 'manager' },
    });
  }

  managerWindow.on('closed', () => {
    managerWindow = null;
  });
}

function createTray() {
  const icon = getAppIcon();

  tray = new Tray(icon);
  tray.setToolTip('上車易 EasyBoard - 香港交通小工具 (按快捷鍵 Ctrl+Shift+W 顯示/隱藏)');

  const contextMenu = Menu.buildFromTemplate([
    {
      label: '顯示 / 隱藏小工具 (Toggle Widget) [Ctrl+Shift+W]',
      click: () => toggleWidget(),
    },
    {
      label: '管理常用路線 (Open Manager)',
      click: () => createManagerWindow(),
    },
    { type: 'separator' },
    {
      label: '下一條路線 (Next Route ▶)',
      click: () => {
        widgetWindow?.webContents.send('tray-cycle-route', 1);
      },
    },
    {
      label: '上一條路線 (Prev Route ◀)',
      click: () => {
        widgetWindow?.webContents.send('tray-cycle-route', -1);
      },
    },
    {
      label: '立即更新 (Refresh ↻)',
      click: () => {
        widgetWindow?.webContents.send('tray-refresh');
      },
    },
    { type: 'separator' },
    {
      label: '退出程式 (Exit)',
      click: () => {
        isQuitting = true;
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);
  tray.on('click', () => {
    toggleWidget();
  });
  tray.on('double-click', () => {
    toggleWidget();
  });
}

// Storage File Paths
const configsFile = path.join(appDataDir, 'saved_configurations.json');
const activeIndexFile = path.join(appDataDir, 'active_index.txt');
const settingsFile = path.join(appDataDir, 'settings.json');

// MARK: - IPC Handlers
ipcMain.on('window-minimize', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  win?.minimize();
});

ipcMain.on('window-close', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  win?.close();
});

ipcMain.on('window-hide', () => {
  widgetWindow?.hide();
});

ipcMain.on('window-show', () => {
  if (!widgetWindow) {
    createWidgetWindow();
  } else {
    widgetWindow.show();
    widgetWindow.focus();
  }
});

ipcMain.on('window-toggle-visibility', () => {
  toggleWidget();
});

ipcMain.on('window-is-visible', (event) => {
  event.returnValue = !!widgetWindow?.isVisible();
});

ipcMain.on('window-set-always-on-top', (event, flag: boolean) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  win?.setAlwaysOnTop(flag, flag ? 'screen-saver' : 'normal');
});

ipcMain.on('window-set-widget-size', (_, size: 'medium' | 'small') => {
  if (!widgetWindow) return;
  const { width, height } = WIDGET_SIZES[size];
  widgetWindow.setSize(width, height);
  const current = loadWidgetBounds();
  saveWidgetBounds({ ...current, size });
});

ipcMain.on('open-manager-window', () => {
  createManagerWindow();
});

ipcMain.on('close-manager-window', () => {
  managerWindow?.close();
});

ipcMain.on('open-external-url', (_, url: string) => {
  if (typeof url === 'string' && isSafeExternalUrl(url)) {
    shell.openExternal(url);
  } else {
    console.warn(`[Security] Blocked attempt to open unsafe URL: ${url}`);
  }
});

// Storage IPCs
ipcMain.on('storage-load-configs', (event) => {
  try {
    if (fs.existsSync(configsFile)) {
      const data = fs.readFileSync(configsFile, 'utf8');
      event.returnValue = JSON.parse(data);
      return;
    }
  } catch (e) {
    console.error('Error loading configs:', e);
  }
  event.returnValue = [];
});

ipcMain.on('storage-save-configs', (_, configs) => {
  try {
    fs.writeFileSync(configsFile, JSON.stringify(configs, null, 2), 'utf8');
    widgetWindow?.webContents.send('config-updated-broadcast');
    managerWindow?.webContents.send('config-updated-broadcast');
  } catch (e) {
    console.error('Error saving configs:', e);
  }
});

ipcMain.on('storage-get-active-index', (event) => {
  try {
    if (fs.existsSync(activeIndexFile)) {
      const val = parseInt(fs.readFileSync(activeIndexFile, 'utf8').trim(), 10);
      event.returnValue = isNaN(val) ? 0 : val;
      return;
    }
  } catch {}
  event.returnValue = 0;
});

ipcMain.on('storage-set-active-index', (_, idx: number) => {
  try {
    fs.writeFileSync(activeIndexFile, `${idx}`, 'utf8');
    widgetWindow?.webContents.send('config-updated-broadcast');
  } catch {}
});

ipcMain.on('storage-load-snapshot', (event, id: string) => {
  try {
    const file = getSafeSnapshotPath(id);
    if (file && fs.existsSync(file)) {
      event.returnValue = JSON.parse(fs.readFileSync(file, 'utf8'));
      return;
    }
  } catch (e) {
    console.error('Error loading snapshot:', e);
  }
  event.returnValue = null;
});

ipcMain.on('storage-save-snapshot', (_, snapshot) => {
  try {
    if (!snapshot?.configurationId) return;
    const file = getSafeSnapshotPath(snapshot.configurationId);
    if (!file) {
      console.warn(`[Security] Blocked unsafe snapshot ID: ${snapshot.configurationId}`);
      return;
    }
    fs.writeFileSync(file, JSON.stringify(snapshot, null, 2), 'utf8');
  } catch (e) {
    console.error('Error saving snapshot:', e);
  }
});

ipcMain.on('storage-load-settings', (event) => {
  try {
    if (fs.existsSync(settingsFile)) {
      event.returnValue = JSON.parse(fs.readFileSync(settingsFile, 'utf8'));
      return;
    }
  } catch {}
  event.returnValue = null;
});

ipcMain.on('storage-save-settings', (_, settings) => {
  try {
    fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf8');
    widgetWindow?.webContents.send('settings-updated-broadcast', settings);
    managerWindow?.webContents.send('settings-updated-broadcast', settings);
  } catch {}
});

app.whenReady().then(() => {
  if (process.platform === 'win32') {
    app.setAppUserModelId('com.easyboard.hktransportwidget');
  }
  createWidgetWindow();
  createTray();

  // Register global hotkey Ctrl+Shift+W to toggle widget anywhere
  try {
    const registered = globalShortcut.register('CommandOrControl+Shift+W', () => {
      toggleWidget();
    });
    if (!registered) {
      console.warn('Failed to register global hotkey CommandOrControl+Shift+W');
    }
  } catch (err) {
    console.error('Error registering global shortcut:', err);
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWidgetWindow();
    }
  });
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('before-quit', () => {
  isQuitting = true;
});

app.on('window-all-closed', () => {
  if (process.platform !== 'win32') {
    app.quit();
  }
});
