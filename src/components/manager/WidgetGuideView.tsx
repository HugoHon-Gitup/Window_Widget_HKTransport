import React from 'react';
import { AppStrings } from '../../services/localization';
import { Move, Repeat, Maximize2, Zap, Pin, MousePointerClick } from 'lucide-react';

interface WidgetGuideViewProps {
  isZH: boolean;
}

export const WidgetGuideView: React.FC<WidgetGuideViewProps> = ({ isZH }) => {
  const guides = [
    {
      icon: <Move className="text-blue-400" size={22} />,
      title: AppStrings.guideFeature1Title(isZH),
      desc: AppStrings.guideFeature1Desc(isZH),
    },
    {
      icon: <Repeat className="text-emerald-400" size={22} />,
      title: AppStrings.guideFeature2Title(isZH),
      desc: AppStrings.guideFeature2Desc(isZH),
    },
    {
      icon: <Maximize2 className="text-amber-400" size={22} />,
      title: AppStrings.guideFeature3Title(isZH),
      desc: AppStrings.guideFeature3Desc(isZH),
    },
    {
      icon: <Zap className="text-purple-400" size={22} />,
      title: AppStrings.guideFeature4Title(isZH),
      desc: AppStrings.guideFeature4Desc(isZH),
    },
  ];

  return (
    <div className="flex flex-col h-full overflow-y-auto p-6 space-y-6 max-w-3xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-slate-100">{AppStrings.guideTitle(isZH)}</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          {isZH
            ? '探索 Windows 桌面小工具的懸浮、切換與即時監控技巧'
            : 'Learn how to use, pin, and cycle routes on your Windows desktop widget'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {guides.map((item, index) => (
          <div
            key={index}
            className="flex flex-col p-5 rounded-2xl bg-slate-850 border border-slate-750 space-y-2.5 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center border border-slate-700">
                {item.icon}
              </div>
              <h3 className="font-bold text-sm text-slate-200">{item.title}</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed pt-1">
              {item.desc}
            </p>
          </div>
        ))}
      </div>

      {/* System Tray Tip Card */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border border-blue-500/30 text-xs text-slate-300 space-y-2">
        <div className="flex items-center gap-2 font-bold text-blue-300">
          <MousePointerClick size={16} />
          <span>{isZH ? 'Windows 工作列常駐圖示 (System Tray)' : 'Windows System Tray Support'}</span>
        </div>
        <p className="leading-relaxed">
          {isZH
            ? '關閉小工具視窗時，程式會在 Windows 系統匣常駐運行。您可以雙擊系統匣圖示快速重開小工具，或右鍵點擊執行「切換路線」、「立即更新」與「開啟管理員」。'
            : 'The app continues running quietly in your Windows system tray. Double-click the tray icon to quickly show/hide your widget, or right-click to switch routes and trigger manual refreshes.'}
        </p>
      </div>
    </div>
  );
};

