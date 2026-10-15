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
import { Train, Bus, ChevronLeft, ChevronRight, RefreshCw, Clock } from 'lucide-react';

interface SmallWidgetViewProps {
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

export const SmallWidgetView: React.FC<SmallWidgetViewProps> = ({
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

  const nextArrival = arrivals[0];
  const secondArrival = arrivals[1];

  const boardingStop = isZH
    ? configuration.displayBoardingStopTC
    : configuration.displayBoardingStopEN;
  const direction = isZH
    ? configuration.displayDirectionTC
    : configuration.displayDirectionEN;

  const isStale = snapshot ? isSnapshotStale(snapshot, new Date(), 180) : false;

  return (
    <div
      onClick={onOpenDetail}
      className="flex flex-col h-full justify-between p-3 select-none cursor-pointer"
    >
      {/* Header: Operator icon, Route, Switcher & Refresh */}
      <div className="flex items-center justify-between gap-1">
        <div className="flex items-center gap-1.5 min-w-0">
          <div
            className="flex items-center justify-center w-5 h-5 rounded text-white shadow-sm flex-shrink-0"
            style={{ backgroundColor: meta.brandColor }}
          >
            {meta.sfSymbol === 'train' ? <Train size={11} strokeWidth={2.5} /> : <Bus size={11} strokeWidth={2.5} />}
          </div>
          <span className={`font-extrabold text-[13px] truncate drop-shadow-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>
            {configuration.displayLineOrRoute}
          </span>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          {totalConfigsCount > 1 && (
            <div className={`flex items-center rounded p-0.5 border backdrop-blur-sm shadow-inner ${
              isLight ? 'bg-black/10 border-black/15 text-slate-800' : 'bg-black/40 border-white/15 text-slate-200'
            }`}>
              <button
                type="button"
                onClick={() => onCycle(-1)}
                className={`w-3.5 h-4 flex items-center justify-center transition ${isLight ? 'hover:text-black' : 'hover:text-white'}`}
                title="Prev"
              >
                <ChevronLeft size={10} strokeWidth={3} />
              </button>
              <button
                type="button"
                onClick={() => onCycle(1)}
                className={`w-3.5 h-4 flex items-center justify-center transition ${isLight ? 'hover:text-black' : 'hover:text-white'}`}
                title="Next"
              >
                <ChevronRight size={10} strokeWidth={3} />
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className={`w-5 h-5 flex items-center justify-center rounded-full transition border backdrop-blur-sm shadow-inner active:scale-95 ${
              isLight ? 'bg-black/10 hover:bg-black/20 text-slate-800 border-black/15' : 'bg-black/40 hover:bg-white/20 text-slate-200 border-white/15'
            }`}
            title="Refresh"
          >
            <RefreshCw size={9} className={isRefreshing ? 'animate-spin text-blue-500' : ''} />
          </button>
        </div>
      </div>

      {/* Boarding Stop & Direction */}
      <div className="flex flex-col my-1">
        <span className={`text-[12px] font-bold drop-shadow-sm truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
          {configuration.operatorType === 'mtr' ? boardingStop : cleanBusStopCode(boardingStop)}
        </span>
        <span className={`text-[10px] font-medium drop-shadow-sm truncate ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
          {direction}
        </span>
      </div>

      {/* Main Arrival Display */}
      {nextArrival ? (
        <div className={`flex flex-col my-auto p-1.5 rounded-xl ${
          isLight ? 'bg-black/[0.06] border border-black/10' : 'liquid-glass-card'
        }`}>
          <div className="flex items-center gap-1.5">
            <span
              className={`font-black tracking-tight text-2xl leading-none ${
                getMinutesRemaining(nextArrival) <= 5
                  ? (isLight ? 'text-rose-600' : 'text-rose-400 drop-shadow-[0_1px_6px_rgba(244,63,94,0.4)]')
                  : (isLight ? 'text-slate-900' : 'text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]')
              }`}
            >
              {formatCountdown(nextArrival, new Date(), isZH)}
            </span>

            {nextArrival.platform && (
              <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded shadow-sm border ${
                isLight ? 'bg-blue-600/20 text-blue-900 border-blue-600/40' : 'bg-blue-500/35 text-blue-200 border border-blue-400/50'
              }`}>
                {isZH ? `${nextArrival.platform}月台` : `P${nextArrival.platform}`}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-[9px] mt-1">
            <span className={`font-mono font-bold px-1.5 py-0.5 rounded border shadow-inner ${
              isLight ? 'text-slate-800 bg-black/10 border-black/10' : 'text-slate-100 bg-black/50 border-white/10'
            }`}>
              {formatTimeHHMM(nextArrival.predictedArrivalAt)}
            </span>
            {secondArrival && (
              <span className={`truncate font-semibold drop-shadow-sm ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                • {isZH ? '次班' : 'Next'}: {formatCountdown(secondArrival, new Date(), isZH)}
              </span>
            )}
          </div>
        </div>
      ) : (
        <div className={`flex flex-col items-center justify-center py-2 my-auto ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
          <Clock size={16} className="mb-0.5 opacity-70" />
          <span className="text-[10px] font-semibold">
            {isZH ? '暫無班次' : 'No arrivals'}
          </span>
        </div>
      )}

      {/* Freshness Footer */}
      {snapshot && (
        <div className={`flex items-center gap-1.5 text-[9px] pt-1 border-t ${
          isLight ? 'text-slate-600 border-black/10' : 'text-slate-300 border-white/10'
        }`}>
          <span
            className={`w-1.5 h-1.5 rounded-full shadow-sm ${
              isStale ? 'bg-amber-400' : 'bg-emerald-400 ring-2 ring-emerald-400/20'
            }`}
          />
          <span className="truncate">{getFreshnessText(snapshot, new Date(), isZH)}</span>
        </div>
      )}
    </div>
  );
};

