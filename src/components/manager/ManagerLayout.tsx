import React, { useState } from 'react';
import { AppSettings, SavedTransportConfiguration } from '../../types/transport';
import { StorageManager } from '../../services/storageManager';
import { AppStrings } from '../../services/localization';
import { FavouritesView } from './FavouritesView';
import { AddTransportWizard } from './AddTransportWizard';
import { TransportDetailView } from './TransportDetailView';
import { WidgetGuideView } from './WidgetGuideView';
import { SettingsView } from './SettingsView';
import { Train, Bookmark, PlusCircle, HelpCircle, Settings } from 'lucide-react';

export const ManagerLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'favourites' | 'add' | 'detail' | 'guide' | 'settings'>('favourites');
  const [selectedConfig, setSelectedConfig] = useState<SavedTransportConfiguration | null>(null);
  const [settings, setSettings] = useState<AppSettings>(() => StorageManager.getInstance().loadSettings());

  const isZH = settings.language === 'zh';

  const navItems = [
    { id: 'favourites' as const, label: AppStrings.tabFavourites(isZH), icon: <Bookmark size={15} /> },
    { id: 'add' as const, label: AppStrings.tabAddTransport(isZH), icon: <PlusCircle size={15} /> },
    { id: 'guide' as const, label: AppStrings.tabGuide(isZH), icon: <HelpCircle size={15} /> },
    { id: 'settings' as const, label: AppStrings.tabSettings(isZH), icon: <Settings size={15} /> },
  ];

  return (
    <div className="flex h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <div className="w-56 bg-slate-900 border-r border-slate-800 flex flex-col justify-between p-4 flex-shrink-0">
        <div className="space-y-6">
          {/* Logo / Brand Header */}
          <div className="flex items-center gap-2.5 px-2 pt-1">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/30">
              <Train size={18} />
            </div>
            <div>
              <h1 className="font-extrabold text-sm tracking-tight text-slate-100">
                {AppStrings.appTitle(isZH)}
              </h1>
              <span className="text-[10px] text-slate-400 block font-medium">
                {AppStrings.appSubtitle(isZH)}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id || (activeTab === 'detail' && item.id === 'favourites');
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    if (item.id === 'favourites') setSelectedConfig(null);
                    setActiveTab(item.id);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Status / App Info */}
        <div className="p-3 rounded-xl bg-slate-850/60 border border-slate-800 text-[11px] text-slate-400 space-y-1">
          <div className="flex items-center justify-between text-slate-300 font-semibold">
            <span>EasyBoard</span>
            <span className="text-[10px] bg-slate-700 px-1.5 py-0.2 rounded text-slate-300">v1.0</span>
          </div>
          <p className="text-[10px] text-slate-500">
            {isZH ? '香港公共交通到站小工具' : 'Hong Kong Transit Desktop Widget'}
          </p>
        </div>
      </div>

      {/* Main Content Pane */}
      <div className="flex-1 h-full bg-slate-925 overflow-hidden">
        {activeTab === 'favourites' && (
          <FavouritesView
            isZH={isZH}
            onAddNew={() => setActiveTab('add')}
            onSelectConfig={(cfg) => {
              setSelectedConfig(cfg);
              setActiveTab('detail');
            }}
          />
        )}

        {activeTab === 'add' && (
          <AddTransportWizard
            isZH={isZH}
            onDone={() => setActiveTab('favourites')}
            onCancel={() => setActiveTab('favourites')}
          />
        )}

        {activeTab === 'detail' && selectedConfig && (
          <TransportDetailView
            configuration={selectedConfig}
            isZH={isZH}
            onBack={() => {
              setSelectedConfig(null);
              setActiveTab('favourites');
            }}
            onDeleted={() => {
              setSelectedConfig(null);
              setActiveTab('favourites');
            }}
          />
        )}

        {activeTab === 'guide' && <WidgetGuideView isZH={isZH} />}

        {activeTab === 'settings' && (
          <SettingsView
            settings={settings}
            isZH={isZH}
            onUpdateSettings={(updated) => setSettings(updated)}
          />
        )}
      </div>
    </div>
  );
};

