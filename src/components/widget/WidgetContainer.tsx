import React, { useEffect, useState, useCallback } from 'react';
import { AppSettings, ArrivalSnapshot, SavedTransportConfiguration } from '../../types/transport';
import { StorageManager } from '../../services/storageManager';
import { TransportManager } from '../../services/transportManager';
import { MediumWidgetView } from './MediumWidgetView';
import { SmallWidgetView } from './SmallWidgetView';
import { Pin, PinOff, ExternalLink, PlusCircle, Maximize2, Minimize2, X, Move, EyeOff } from 'lucide-react';
import { getLiquidGlassStyle, isLightGlass } from '../../utils/glassTheme';

export const WidgetContainer: React.FC = () => {
  const [configurations, setConfigurations] = useState<SavedTransportConfiguration[]>([]);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [snapshot, setSnapshot] = useState<ArrivalSnapshot | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [settings, setSettings] = useState<AppSettings>(() => StorageManager.getInstance().loadSettings());
  const [, setTick] = useState<number>(0);

  const storage = StorageManager.getInstance();
  const transport = TransportManager.getInstance();

  const loadData = useCallback(() => {
    const configs = storage.loadConfigurations();
    const idx = storage.getActiveConfigurationIndex();
    const safeIdx = configs.length > 0 && idx >= 0 && idx < configs.length ? idx : 0;
    const currentSettings = storage.loadSettings();

    setConfigurations(configs);
    setActiveIndex(safeIdx);
    setSettings(currentSettings);

    if (configs.length > 0) {
      const activeConfig = configs[safeIdx];
      const cached = storage.loadSnapshot(activeConfig.id);
      setSnapshot(cached);
    } else {
      setSnapshot(null);
    }
  }, [storage]);

  useEffect(() => {
    loadData();
    const unsubscribe = storage.subscribe(loadData);

    const onTrayCycle = (window as any).electronAPI?.onCycleRoute?.((step: number) => {
      handleCycle(step);
    });
    const onTrayRefresh = (window as any).electronAPI?.onRefresh?.(() => {
      handleRefresh();
    });
    const onConfigUpdate = (window as any).electronAPI?.onConfigChanged?.(() => {
      loadData();
    });
    const onSettingsUpdate = (window as any).electronAPI?.onSettingsChanged?.((newSettings: AppSettings) => {
      if (newSettings) {
        setSettings(newSettings);
      }
    });

    return () => {
      unsubscribe();
      onTrayCycle?.();
      onTrayRefresh?.();
      onConfigUpdate?.();
      onSettingsUpdate?.();
    };
  }, [loadData]);

  // Real-time second tick to keep countdown minutes accurate
  useEffect(() => {
    const timer = setInterval(() => {
      setTick((t) => t + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Background auto-refresh timer (e.g. 60s)
  const handleRefresh = useCallback(async () => {
    const current = storage.activeConfiguration();
    if (!current) return;

    setIsRefreshing(true);
    try {
      const fresh = await transport.fetchArrivals(current, true, settings.language === 'zh');
      setSnapshot(fresh);
    } catch (e) {
      console.error('Refresh error:', e);
    } finally {
      setIsRefreshing(false);
    }
  }, [storage, transport, settings.language]);

  useEffect(() => {
    handleRefresh();
    const intervalMs = (settings.refreshIntervalSeconds || 60) * 1000;
    const refreshTimer = setInterval(handleRefresh, intervalMs);
    return () => clearInterval(refreshTimer);
  }, [activeIndex, configurations.length, settings.refreshIntervalSeconds, handleRefresh]);

  const handleCycle = (step: number) => {
    const newIdx = storage.cycleActiveConfiguration(step);
    setActiveIndex(newIdx);
    const configs = storage.loadConfigurations();
    if (configs[newIdx]) {
      setSnapshot(storage.loadSnapshot(configs[newIdx].id));
    }
  };

  const handleToggleSize = () => {
    const nextSize: 'medium' | 'small' = settings.widgetSize === 'medium' ? 'small' : 'medium';
    const updated = { ...settings, widgetSize: nextSize };
    setSettings(updated);
    storage.saveSettings(updated);
    (window as any).electronAPI?.setWidgetSize?.(nextSize);
  };

  const handleTogglePin = () => {
    const nextPin = !settings.alwaysOnTop;
    const updated = { ...settings, alwaysOnTop: nextPin };
    setSettings(updated);
    storage.saveSettings(updated);
    (window as any).electronAPI?.setAlwaysOnTop?.(nextPin);
  };

  const handleOpenManager = () => {
    (window as any).electronAPI?.openManager?.();
  };

  const handleHide = () => {
    if ((window as any).electronAPI?.hide) {
      (window as any).electronAPI.hide();
    } else {
      (window as any).electronAPI?.close?.();
    }
  };

  const activeConfig = configurations[activeIndex];
  const isZH = settings.language === 'zh';
  const isMedium = settings.widgetSize === 'medium';
  const isLight = isLightGlass(settings.glassTheme || 'dark', settings.customGlassColor);
  const liquidStyle = getLiquidGlassStyle(settings.glassTheme || 'dark', settings.customGlassColor, settings.widgetOpacity || 0.95);

  return (
    <div
      className={`relative h-screen w-screen p-1 flex flex-col justify-between overflow-hidden select-none rounded-2xl ${
        isLight ? 'text-slate-900' : 'text-slate-100'
      } transition-colors duration-150`}
      style={liquidStyle}
    >
      {/* Top Floating Mini Drag Bar & Quick Controls */}
      <div className={`flex items-center justify-between px-2 pt-1 pb-0.5 drag-region text-[10px] ${
        isLight ? 'text-slate-600' : 'text-slate-400'
      }`}>
        {/* Drag handle hint */}
        <div className="flex items-center gap-1 opacity-70 hover:opacity-100 transition cursor-grab active:cursor-grabbing">
          <Move size={10} className="text-blue-500" />
          <span className={`font-bold tracking-wider uppercase text-[8px] ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
            上車易 EasyBoard
          </span>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1.5 no-drag">
          <button
            type="button"
            onClick={handleToggleSize}
            className={`p-0.5 rounded transition ${isLight ? 'hover:bg-black/10 hover:text-black' : 'hover:bg-white/10 hover:text-white'}`}
            title={isMedium ? (isZH ? '切換為小型卡片' : 'Switch to Small') : (isZH ? '切換為中型卡片' : 'Switch to Medium')}
          >
            {isMedium ? <Minimize2 size={11} /> : <Maximize2 size={11} />}
          </button>

          <button
            type="button"
            onClick={handleTogglePin}
            className={`p-0.5 rounded transition ${
              settings.alwaysOnTop
                ? 'text-amber-500 bg-amber-400/20'
                : isLight ? 'hover:bg-black/10 hover:text-black' : 'hover:bg-white/10 hover:text-white'
            }`}
            title={settings.alwaysOnTop ? (isZH ? '取消置頂' : 'Unpin from Top') : (isZH ? '視窗置頂' : 'Pin on Top')}
          >
            {settings.alwaysOnTop ? <Pin size={11} /> : <PinOff size={11} />}
          </button>

          <button
            type="button"
            onClick={handleOpenManager}
            className={`p-0.5 rounded transition ${isLight ? 'hover:bg-black/10 hover:text-black' : 'hover:bg-white/10 hover:text-white'}`}
            title={isZH ? '打開路線管理' : 'Open Route Manager'}
          >
            <ExternalLink size={11} />
          </button>

          <button
            type="button"
            onClick={handleHide}
            className={`p-0.5 rounded transition ${isLight ? 'hover:bg-black/10 text-blue-600' : 'hover:bg-white/10 hover:text-blue-300'}`}
            title={isZH ? '隱藏小工具 (Ctrl+Shift+W 重新顯示)' : 'Hide Widget (Ctrl+Shift+W to restore)'}
          >
            <EyeOff size={11} />
          </button>

          <button
            type="button"
            onClick={handleHide}
            className="hover:text-rose-500 p-0.5 rounded transition hover:bg-black/5"
            title={isZH ? '關閉/隱藏至系統匣' : 'Hide to Tray'}
          >
            <X size={11} />
          </button>
        </div>
      </div>

      {/* Widget Content Area */}
      <div className="flex-1 min-h-0">
        {!activeConfig ? (
          <div
            onClick={handleOpenManager}
            className={`flex flex-col items-center justify-center h-full text-center p-3 cursor-pointer rounded-xl transition ${
              isLight ? 'hover:bg-black/5' : 'hover:bg-white/5'
            }`}
          >
            <PlusCircle size={24} className="text-blue-500 mb-1.5 animate-pulse" />
            <span className={`font-semibold text-xs ${isLight ? 'text-slate-800' : 'text-slate-100'}`}>
              {isZH ? '點擊以設定交通路線' : 'Tap to set up transport route'}
            </span>
            <span className={`text-[10px] mt-0.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              {isZH ? '在管理介面中新增常用的港鐵或巴士站' : 'Add favourite MTR or bus stops'}
            </span>
          </div>
        ) : isMedium ? (
          <MediumWidgetView
            configuration={activeConfig}
            snapshot={snapshot}
            totalConfigsCount={configurations.length}
            currentIndex={activeIndex}
            isRefreshing={isRefreshing}
            isZH={isZH}
            isLight={isLight}
            onCycle={handleCycle}
            onRefresh={handleRefresh}
            onOpenDetail={handleOpenManager}
          />
        ) : (
          <SmallWidgetView
            configuration={activeConfig}
            snapshot={snapshot}
            totalConfigsCount={configurations.length}
            currentIndex={activeIndex}
            isRefreshing={isRefreshing}
            isZH={isZH}
            isLight={isLight}
            onCycle={handleCycle}
            onRefresh={handleRefresh}
            onOpenDetail={handleOpenManager}
          />
        )}
      </div>

      {/* Bottom-right Corner Resize Grip Handle */}
      <div
        className="absolute bottom-1 right-1 w-3.5 h-3.5 flex items-end justify-end pointer-events-none opacity-45 select-none"
        title="拖曳邊角縮放視窗 (Drag corner to resize)"
      >
        <svg width="10" height="10" viewBox="0 0 10 10" className={isLight ? 'text-slate-800' : 'text-slate-300'}>
          <circle cx="8" cy="8" r="1.2" fill="currentColor" />
          <circle cx="4" cy="8" r="1.2" fill="currentColor" />
          <circle cx="8" cy="4" r="1.2" fill="currentColor" />
        </svg>
      </div>
    </div>
  );
};
