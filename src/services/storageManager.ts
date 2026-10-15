import { AppSettings, ArrivalSnapshot, SavedTransportConfiguration } from '../types/transport';

type Listener = () => void;

export class StorageManager {
  private static instance: StorageManager;
  private listeners: Set<Listener> = new Set();

  private defaultSettings: AppSettings = {
    language: 'zh',
    appearance: 'system',
    widgetSize: 'medium',
    widgetOpacity: 0.95,
    glassTheme: 'dark',
    customGlassColor: '#0f172a',
    alwaysOnTop: true,
    refreshIntervalSeconds: 60,
  };

  public static getInstance(): StorageManager {
    if (!StorageManager.instance) {
      StorageManager.instance = new StorageManager();
    }
    return StorageManager.instance;
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    for (const listener of this.listeners) {
      try {
        listener();
      } catch (e) {
        console.error('Storage listener error:', e);
      }
    }
  }

  // MARK: - Configurations

  public loadConfigurations(): SavedTransportConfiguration[] {
    try {
      if ((window as any).electronAPI?.loadConfigs) {
        return (window as any).electronAPI.loadConfigs();
      }
      const raw = localStorage.getItem('hk_transport_configs');
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error('Failed to load configurations:', e);
      return [];
    }
  }

  public saveConfigurations(configs: SavedTransportConfiguration[]): void {
    try {
      if ((window as any).electronAPI?.saveConfigs) {
        (window as any).electronAPI.saveConfigs(configs);
      } else {
        localStorage.setItem('hk_transport_configs', JSON.stringify(configs));
      }
      this.notify();
    } catch (e) {
      console.error('Failed to save configurations:', e);
    }
  }

  public addConfiguration(config: SavedTransportConfiguration): void {
    const list = this.loadConfigurations();
    list.push(config);
    this.saveConfigurations(list);
  }

  public updateConfiguration(config: SavedTransportConfiguration): void {
    const list = this.loadConfigurations();
    const idx = list.findIndex((c) => c.id === config.id);
    if (idx !== -1) {
      list[idx] = config;
      this.saveConfigurations(list);
    }
  }

  public deleteConfiguration(id: string): void {
    let list = this.loadConfigurations();
    list = list.filter((c) => c.id !== id);
    this.saveConfigurations(list);

    const activeIdx = this.getActiveConfigurationIndex();
    if (list.length === 0) {
      this.setActiveConfigurationIndex(0);
    } else if (activeIdx >= list.length) {
      this.setActiveConfigurationIndex(0);
    }
  }

  // MARK: - Active Index

  public getActiveConfigurationIndex(): number {
    try {
      if ((window as any).electronAPI?.getActiveIndex) {
        return (window as any).electronAPI.getActiveIndex();
      }
      const raw = localStorage.getItem('hk_transport_active_idx');
      return raw ? parseInt(raw, 10) || 0 : 0;
    } catch {
      return 0;
    }
  }

  public setActiveConfigurationIndex(index: number): void {
    const clamped = Math.max(0, index);
    try {
      if ((window as any).electronAPI?.setActiveIndex) {
        (window as any).electronAPI.setActiveIndex(clamped);
      } else {
        localStorage.setItem('hk_transport_active_idx', clamped.toString());
      }
      this.notify();
    } catch (e) {
      console.error('Failed to save active index:', e);
    }
  }

  public cycleActiveConfiguration(step: number): number {
    const configs = this.loadConfigurations();
    if (configs.length === 0) return 0;

    const current = this.getActiveConfigurationIndex();
    let next = (current + step) % configs.length;
    if (next < 0) next += configs.length;

    this.setActiveConfigurationIndex(next);
    return next;
  }

  public activeConfiguration(): SavedTransportConfiguration | null {
    const configs = this.loadConfigurations();
    if (configs.length === 0) return null;
    const idx = this.getActiveConfigurationIndex();
    const safeIdx = idx >= 0 && idx < configs.length ? idx : 0;
    return configs[safeIdx];
  }

  // MARK: - Snapshots

  public loadSnapshot(configurationId: string): ArrivalSnapshot | null {
    try {
      if ((window as any).electronAPI?.loadSnapshot) {
        return (window as any).electronAPI.loadSnapshot(configurationId);
      }
      const raw = localStorage.getItem(`hk_snapshot_${configurationId}`);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  public saveSnapshot(snapshot: ArrivalSnapshot): void {
    try {
      if ((window as any).electronAPI?.saveSnapshot) {
        (window as any).electronAPI.saveSnapshot(snapshot);
      } else {
        localStorage.setItem(`hk_snapshot_${snapshot.configurationId}`, JSON.stringify(snapshot));
      }
      this.notify();
    } catch (e) {
      console.error('Failed to save snapshot:', e);
    }
  }

  // MARK: - Settings

  public loadSettings(): AppSettings {
    try {
      if ((window as any).electronAPI?.loadSettings) {
        return { ...this.defaultSettings, ...(window as any).electronAPI.loadSettings() };
      }
      const raw = localStorage.getItem('hk_transport_settings');
      return raw ? { ...this.defaultSettings, ...JSON.parse(raw) } : this.defaultSettings;
    } catch {
      return this.defaultSettings;
    }
  }

  public saveSettings(settings: AppSettings): void {
    try {
      if ((window as any).electronAPI?.saveSettings) {
        (window as any).electronAPI.saveSettings(settings);
      } else {
        localStorage.setItem('hk_transport_settings', JSON.stringify(settings));
      }
      this.notify();
    } catch (e) {
      console.error('Failed to save settings:', e);
    }
  }
}

