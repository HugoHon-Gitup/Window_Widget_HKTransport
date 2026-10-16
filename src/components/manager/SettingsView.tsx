import React from 'react';
import { AppSettings } from '../../types/transport';
import { StorageManager } from '../../services/storageManager';
import { AppStrings } from '../../services/localization';
import {
  Globe,
  Palette,
  Layout,
  Clock,
  ShieldCheck,
  ExternalLink,
  Info,
  Pin,
  Check,
} from 'lucide-react';
import { GLASS_PRESETS, getLiquidGlassStyle, isLightGlass } from '../../utils/glassTheme';

interface SettingsViewProps {
  settings: AppSettings;
  isZH: boolean;
  onUpdateSettings: (settings: AppSettings) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  isZH,
  onUpdateSettings,
}) => {
  const storage = StorageManager.getInstance();

  const update = (partial: Partial<AppSettings>) => {
    const updated = { ...settings, ...partial };
    storage.saveSettings(updated);
    onUpdateSettings(updated);
    if (partial.alwaysOnTop !== undefined) {
      (window as any).electronAPI?.setAlwaysOnTop?.(partial.alwaysOnTop);
    }
    if (partial.widgetSize !== undefined) {
      (window as any).electronAPI?.setWidgetSize?.(partial.widgetSize);
    }
  };

  const openUrl = (url: string) => {
    if ((window as any).electronAPI?.openExternal) {
      (window as any).electronAPI.openExternal(url);
    } else {
      window.open(url, '_blank');
    }
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto p-6 space-y-6 max-w-3xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-slate-100">{AppStrings.tabSettings(isZH)}</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          {isZH ? '管理介面語言、外觀模式及桌面小工具行為' : 'Manage language, appearance, and widget preferences'}
        </p>
      </div>

      {/* 1. Language Section */}
      <div className="bg-slate-850 p-5 rounded-2xl border border-slate-750 space-y-3">
        <div className="flex items-center gap-2 text-slate-300 font-bold text-sm">
          <Globe size={16} className="text-blue-400" />
          <span>{AppStrings.languageSection(isZH)}</span>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            onClick={() => update({ language: 'zh' })}
            className={`py-2.5 px-4 rounded-xl text-xs font-bold transition border ${
              settings.language === 'zh'
                ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/20'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
            }`}
          >
            繁體中文 (Traditional Chinese)
          </button>
          <button
            type="button"
            onClick={() => update({ language: 'en' })}
            className={`py-2.5 px-4 rounded-xl text-xs font-bold transition border ${
              settings.language === 'en'
                ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/20'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
            }`}
          >
            English
          </button>
        </div>
      </div>

      {/* 2. Desktop Widget Preferences */}
      <div className="bg-slate-850 p-5 rounded-2xl border border-slate-750 space-y-4">
        <div className="flex items-center gap-2 text-slate-300 font-bold text-sm">
          <Layout size={16} className="text-indigo-400" />
          <span>{AppStrings.widgetOptionsSection(isZH)}</span>
        </div>

        {/* Default Widget Size */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-400 block">
            {AppStrings.defaultWidgetSize(isZH)}
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => update({ widgetSize: 'medium' })}
              className={`py-2 px-3 rounded-lg text-xs font-medium border text-left transition ${
                settings.widgetSize === 'medium'
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow'
                  : 'bg-slate-800 text-slate-300 border-slate-700'
              }`}
            >
              {AppStrings.sizeMedium(isZH)}
            </button>
            <button
              type="button"
              onClick={() => update({ widgetSize: 'small' })}
              className={`py-2 px-3 rounded-lg text-xs font-medium border text-left transition ${
                settings.widgetSize === 'small'
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow'
                  : 'bg-slate-800 text-slate-300 border-slate-700'
              }`}
            >
              {AppStrings.sizeSmall(isZH)}
            </button>
          </div>
        </div>

        {/* Hotkey & Widget Visibility Toggle */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-750">
          <div>
            <span className="text-xs font-bold text-slate-200 block">
              {isZH ? '顯示 / 隱藏桌面小工具' : 'Toggle Widget Visibility'}
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5 block">
              {isZH ? '支援全域快捷鍵：' : 'Global Shortcut: '}
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-slate-800 text-blue-300 rounded border border-slate-700">
                Ctrl + Shift + W
              </kbd>
            </span>
          </div>
          <button
            type="button"
            onClick={() => (window as any).electronAPI?.toggleWidget?.()}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition shadow-sm"
          >
            {isZH ? '切換顯示 / 隱藏' : 'Show / Hide'}
          </button>
        </div>

        {/* Always on Top */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <div>
            <span className="text-xs font-semibold text-slate-200 block">
              {AppStrings.alwaysOnTop(isZH)}
            </span>
            <span className="text-[11px] text-slate-400">
              {isZH ? '小工具浮動置於所有應用程式視窗最上方' : 'Keep floating widget on top of all other windows'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => update({ alwaysOnTop: !settings.alwaysOnTop })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
              settings.alwaysOnTop ? 'bg-blue-600' : 'bg-slate-700'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                settings.alwaysOnTop ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Opacity Slider */}
        <div className="space-y-1.5 pt-2 border-t border-slate-800">
          <div className="flex justify-between text-xs">
            <span className="font-semibold text-slate-300">{AppStrings.widgetOpacity(isZH)}</span>
            <span className="font-mono text-blue-400 font-bold">
              {Math.round((settings.widgetOpacity || 0.95) * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0.2"
            max="1.0"
            step="0.02"
            value={settings.widgetOpacity || 0.95}
            onInput={(e) => update({ widgetOpacity: parseFloat((e.target as HTMLInputElement).value) })}
            onChange={(e) => update({ widgetOpacity: parseFloat((e.target as HTMLInputElement).value) })}
            className="w-full accent-blue-500 cursor-pointer"
          />
        </div>

        {/* Glass Color Tone & Custom Palette */}
        <div className="space-y-3 pt-3 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Palette size={14} className="text-pink-400" />
              <label className="text-xs font-bold text-slate-200 block">
                {isZH ? '小工具毛玻璃色調 (Glass Color Tune)' : 'Widget Glass Color Tune'}
              </label>
            </div>
            <span className="text-[11px] text-slate-400">
              {isZH ? '即時連動套用' : 'Live Realtime Sync'}
            </span>
          </div>

          {/* Preset Swatches Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {GLASS_PRESETS.map((preset) => {
              const isSelected = (settings.glassTheme || 'dark') === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => update({ glassTheme: preset.id })}
                  className={`flex items-center gap-2 p-2 rounded-xl border text-left transition ${
                    isSelected
                      ? 'border-blue-500 bg-blue-500/10 shadow-sm shadow-blue-500/10'
                      : 'border-slate-800 hover:border-slate-700 bg-slate-900/60'
                  }`}
                >
                  <div
                    className="w-5 h-5 rounded-full flex-shrink-0 border border-white/20 shadow-inner flex items-center justify-center"
                    style={{ background: preset.previewBg }}
                  >
                    {isSelected && <Check size={11} className={preset.id === 'light' ? 'text-slate-900' : 'text-white'} />}
                  </div>
                  <span className="text-xs font-medium text-slate-200 truncate">
                    {isZH ? preset.nameZH : preset.nameEN}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Custom Color Picker */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center gap-2.5">
              <label className="relative flex items-center justify-center w-8 h-8 rounded-full border border-white/20 cursor-pointer overflow-hidden shadow-inner flex-shrink-0">
                <input
                  type="color"
                  value={settings.customGlassColor || '#0f172a'}
                  onInput={(e) => update({ glassTheme: 'custom', customGlassColor: (e.target as HTMLInputElement).value })}
                  onChange={(e) => update({ glassTheme: 'custom', customGlassColor: (e.target as HTMLInputElement).value })}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <div
                  className="w-full h-full"
                  style={{ backgroundColor: settings.customGlassColor || '#0f172a' }}
                />
              </label>
              <div>
                <span className="text-xs font-semibold text-slate-200 block">
                  {isZH ? '自訂調色盤 (Custom Color Picker)' : 'Custom Color Palette'}
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  {settings.customGlassColor || '#0f172a'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => update({ glassTheme: 'custom', customGlassColor: settings.customGlassColor || '#0f172a' })}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                settings.glassTheme === 'custom'
                  ? 'bg-blue-600 text-white border-blue-500 shadow'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
              }`}
            >
              {isZH ? '套用自訂色' : 'Use Custom'}
            </button>
          </div>

          {/* Live Liquid Glass Preview */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] font-medium text-slate-400">
              {isZH ? '小工具效果即時預覽：' : 'Live Liquid Glass Preview:'}
            </span>
            <div
              className={`p-3 rounded-2xl transition-all duration-200 flex items-center justify-between ${
                isLightGlass(settings.glassTheme || 'dark', settings.customGlassColor)
                  ? 'text-slate-900'
                  : 'text-white'
              }`}
              style={getLiquidGlassStyle(settings.glassTheme || 'dark', settings.customGlassColor, settings.widgetOpacity || 0.95)}
            >
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-red-600 flex items-center justify-center text-white text-[10px] font-bold shadow-sm">
                  港
                </div>
                <div>
                  <div className="text-xs font-bold">港島線 • 金鐘</div>
                  <div className="text-[9px] opacity-70">往 柴灣</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-base font-black">2 分鐘</div>
                <div className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-black/25 border border-white/10 shadow-inner">
                  12:30
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Auto Refresh Interval */}
        <div className="space-y-1.5 pt-2 border-t border-slate-800">
          <label className="text-xs font-semibold text-slate-400 block">
            {AppStrings.refreshInterval(isZH)}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[30, 60, 120].map((sec) => (
              <button
                key={sec}
                type="button"
                onClick={() => update({ refreshIntervalSeconds: sec })}
                className={`py-1.5 px-2 rounded-lg text-xs font-medium border transition ${
                  settings.refreshIntervalSeconds === sec
                    ? 'bg-blue-600 text-white border-blue-500'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                }`}
              >
                {sec === 30 ? AppStrings.sec30(isZH) : sec === 60 ? AppStrings.sec60(isZH) : AppStrings.sec120(isZH)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Open Data & Attribution */}
      <div className="bg-slate-850 p-5 rounded-2xl border border-slate-750 space-y-3">
        <div className="flex items-center gap-2 text-slate-300 font-bold text-sm">
          <Info size={16} className="text-emerald-400" />
          <span>{AppStrings.dataSourcesSection(isZH)}</span>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          {AppStrings.dataSourcesFooter(isZH)}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
          {[
            { name: '香港政府資料一線通 (data.gov.hk)', url: 'https://data.gov.hk' },
            { name: '香港鐵路有限公司 (MTR)', url: 'https://www.mtr.com.hk' },
            { name: '九龍巴士（一九三三）有限公司 (KMB)', url: 'https://www.kmb.hk' },
            { name: '城巴有限公司 (Citybus)', url: 'https://www.citybus.com.hk' },
          ].map((item) => (
            <button
              key={item.url}
              type="button"
              onClick={() => openUrl(item.url)}
              className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs transition"
            >
              <span className="truncate">{item.name}</span>
              <ExternalLink size={12} className="text-slate-500 flex-shrink-0" />
            </button>
          ))}
        </div>
      </div>

      {/* 4. Privacy Guarantee */}
      <div className="bg-slate-850 p-5 rounded-2xl border border-slate-750 flex items-start gap-3">
        <ShieldCheck size={24} className="text-emerald-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-slate-200">{AppStrings.privacyTitle(isZH)}</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            {AppStrings.privacyDesc(isZH)}
          </p>
        </div>
      </div>

      {/* 5. Version */}
      <div className="text-center text-xs text-slate-500 py-2">
        <span>上車易 EasyBoard for Windows v1.0.1 (Build 2)</span>
      </div>
    </div>
  );
};

