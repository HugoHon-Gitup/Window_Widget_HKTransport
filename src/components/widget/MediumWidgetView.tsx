import React from 'react';
import {
  ArrivalSnapshot,
  SavedTransportConfiguration,
  cleanBusStopCode,
  formatCountdown,
  formatTimeHHMM,
  getFreshnessText,
  getMinutesRemaining,
  isSnapshotStale,
  OPERATOR_METADATA,
} from '../../types/transport';
import { Train, Bus, ChevronLeft, ChevronRight, RefreshCw, AlertTriangle, Clock } from 'lucide-react';

interface MediumWidgetViewProps {
  configuration: SavedTransportConfiguration;
  snapshot: ArrivalSnapshot | null;
  totalConfigsCount: number;
  currentIndex: number;
  isRefreshing: boolean;
  isZH: boolean;
  isLight?: boolean;
  onCycle: (step: number) => void;
  onRefresh: () => void;
  onOpenDetail?: () => void;
}

export const MediumWidgetView: React.FC<MediumWidgetViewProps> = ({
  configuration,
  snapshot,
  totalConfigsCount,
  currentIndex,
  isRefreshing,
  isZH,
  isLight = false,
  onCycle,
  onRefresh,
  onOpenDetail,
}) => {
  const meta = OPERATOR_METADATA[configuration.operatorType] || OPERATOR_METADATA.mtr;
  const arrivals = snapshot?.arrivals?.filter(
    (a) => new Date(a.predictedArrivalAt).getTime() > Date.now() - 60000
  ) || [];

  const boardingStop = isZH
    ? configuration.displayBoardingStopTC
    : configuration.displayBoardingStopEN;
  const direction = isZH
    ? configuration.displayDirectionTC
    : configuration.displayDirectionEN;

  const isStale = snapshot ? isSnapshotStale(snapshot, new Date(), 180) : false;
  const isOfflineStale = snapshot?.status === 'offline' && isStale;
  const alertMsg = isZH ? snapshot?.alertMessageTC : snapshot?.alertMessageEN;

  return (
    <div
      onClick={onOpenDetail}
      className="flex flex-col h-full justify-between p-3 select-none cursor-pointer"
    >
      {/* Header Row */}
      <div className="flex items-center justify-between gap-2">
        {/* Left: Operator Icon & Route */}
        <div className="flex items-center gap-1.5 min-w-0">
          <div
            className="flex items-center justify-center w-6 h-6 rounded-md text-white shadow-md flex-shrink-0"
            style={{ backgroundColor: meta.brandColor }}
          >
            {meta.sfSymbol === 'train' ? <Train size={13} strokeWidth={2.5} /> : <Bus size={13} strokeWidth={2.5} />}
          </div>
          <span className={`font-extrabold text-[15px] tracking-tight drop-shadow-sm truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
            {configuration.displayLineOrRoute}
          </span>
        </div>

        {/* Middle: Boarding Stop & Direction */}
        <div className="flex flex-col items-end min-w-0 text-right">
          <span className={`text-[12px] font-bold tracking-tight drop-shadow-sm truncate max-w-[130px] ${isLight ? 'text-slate-900' : 'text-white'}`}>
            {configuration.operatorType === 'mtr' ? boardingStop : cleanBusStopCode(boardingStop)}
          </span>
          <span className={`text-[10px] font-medium drop-shadow-sm truncate max-w-[130px] ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
            {direction}
          </span>
        </div>

        {/* Right: Switcher & Refresh buttons */}
        <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          {totalConfigsCount > 1 && (
            <div className={`flex items-center rounded-md p-0.5 border backdrop-blur-sm shadow-inner ${
              isLight ? 'bg-black/10 border-black/15 text-slate-800' : 'bg-black/40 border-white/15 text-slate-200'
            }`}>
              <button
                type="button"
                onClick={() => onCycle(-1)}
                className={`w-4 h-5 flex items-center justify-center rounded transition ${
                  isLight ? 'hover:bg-black/10 hover:text-black' : 'hover:bg-white/15 hover:text-white'
                }`}
                title="Previous route"
              >
                <ChevronLeft size={12} strokeWidth={3} />
              </button>
              <span className="px-1 text-[9px] font-mono font-bold">
                {currentIndex + 1}/{totalConfigsCount}
              </span>
              <button
                type="button"
                onClick={() => onCycle(1)}
                className={`w-4 h-5 flex items-center justify-center rounded transition ${
                  isLight ? 'hover:bg-black/10 hover:text-black' : 'hover:bg-white/15 hover:text-white'
                }`}
                title="Next route"
              >
                <ChevronRight size={12} strokeWidth={3} />
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className={`w-6 h-6 flex items-center justify-center rounded-full transition border backdrop-blur-sm shadow-inner active:scale-95 ${
              isLight ? 'bg-black/10 hover:bg-black/20 text-slate-800 border-black/15' : 'bg-black/40 hover:bg-white/20 text-slate-200 border-white/15'
            }`}
            title="Refresh arrivals"
          >
            <RefreshCw size={11} className={isRefreshing ? 'animate-spin text-blue-500' : ''} />
          </button>
        </div>
      </div>

      <div className={`h-[1px] my-1 ${isLight ? 'bg-black/10' : 'bg-gradient-to-r from-white/5 via-white/25 to-white/5'}`} />

      {/* Middle Section: Up to 3 Upcoming Arrivals */}
      {arrivals.length === 0 ? (
        <div className={`flex flex-col items-center justify-center py-2 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
          <Clock size={18} className="mb-1 opacity-70" />
          <span className="text-xs font-semibold">
            {isZH ? '暫無到站班次' : 'No arrivals scheduled'}
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-1.5 my-auto">
          {arrivals.slice(0, 3).map((item, idx) => {
            const mins = getMinutesRemaining(item);
            const isPrimary = idx === 0;
            const isUrgent = mins <= 5;
            const dest = isZH ? item.destinationNameTC : item.destinationNameEN;

            return (
              <div
                key={item.id}
                className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition ${
                  isLight
                    ? (isPrimary ? 'bg-black/[0.08] border border-black/15 shadow-sm' : 'bg-black/[0.04] border border-black/10')
                    : (isPrimary ? 'liquid-glass-card-primary' : 'liquid-glass-card')
                }`}
              >
                {/* Platform or Destination */}
                <div className="flex items-center gap-1 max-w-full">
                  {item.platform ? (
                    <span className={`text-[8px] font-extrabold px-1.5 py-0.2 rounded-md shadow-sm border ${
                      isLight
                        ? 'bg-blue-600/20 text-blue-900 border-blue-600/40'
                        : 'bg-blue-500/35 text-blue-200 border-blue-400/50'
                    }`}>
                      {isZH ? `${item.platform}月台` : `P${item.platform}`}
                    </span>
                  ) : (
                    <span className={`text-[9px] font-semibold truncate max-w-[80px] ${isLight ? 'text-slate-700' : 'text-slate-200 drop-shadow-sm'}`}>
                      {dest}
                    </span>
                  )}
                </div>

                {/* Big Countdown */}
                <span
                  className={`font-black tracking-tight leading-tight my-0.5 ${
                    isPrimary ? 'text-[18px]' : 'text-[15px]'
                  } ${
                    isUrgent
                      ? (isLight ? 'text-rose-600' : 'text-rose-400 drop-shadow-[0_1px_6px_rgba(244,63,94,0.4)]')
                      : (isLight ? 'text-slate-900' : 'text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]')
                  }`}
                >
                  {formatCountdown(item, new Date(), isZH)}
                </span>

                {/* Scheduled Time - High Contrast Pill */}
                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border shadow-inner ${
                  isLight ? 'text-slate-800 bg-black/10 border-black/10' : 'text-slate-100 bg-black/50 border-white/10'
                }`}>
                  {formatTimeHHMM(item.predictedArrivalAt)}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer Row */}
      <div className={`flex items-center justify-between text-[9px] pt-1 border-t ${isLight ? 'border-black/10 text-slate-600' : 'border-white/10 text-slate-300'}`}>
        {alertMsg && (isOfflineStale || snapshot?.status === 'providerAlert') ? (
          <div className="flex items-center gap-1 text-amber-500 font-semibold truncate max-w-[200px] drop-shadow-sm">
            <AlertTriangle size={10} className="flex-shrink-0" />
            <span className="truncate">{alertMsg}</span>
          </div>
        ) : snapshot ? (
          <div className="flex items-center gap-1.5 font-medium">
            <span
              className={`w-1.5 h-1.5 rounded-full shadow-sm ${
                isStale ? 'bg-amber-400' : 'bg-emerald-400 ring-2 ring-emerald-400/20'
              }`}
            />
            <span>{getFreshnessText(snapshot, new Date(), isZH)}</span>
          </div>
        ) : (
          <div />
        )}

        {configuration.nickname && configuration.nickname.trim() !== '' && (
          <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] truncate max-w-[120px] shadow-sm border ${
            isLight ? 'bg-black/10 border-black/15 text-slate-800' : 'bg-black/40 border-white/15 text-slate-200'
          }`}>
            {configuration.nickname}
          </span>
        )}
      </div>
    </div>
  );
};

