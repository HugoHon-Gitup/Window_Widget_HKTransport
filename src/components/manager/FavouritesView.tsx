import React, { useState, useEffect } from 'react';
import {
  ArrivalSnapshot,
  SavedTransportConfiguration,
  cleanBusStopCode,
  formatCountdown,
  formatTimeHHMM,
  getFreshnessText,
  getMinutesRemaining,
  OPERATOR_METADATA,
} from '../../types/transport';
import { StorageManager } from '../../services/storageManager';
import { TransportManager } from '../../services/transportManager';
import { AppStrings } from '../../services/localization';
import {
  Train,
  Bus,
  RefreshCw,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  ArrowRight,
  Clock,
  AlertTriangle,
} from 'lucide-react';

interface FavouritesViewProps {
  isZH: boolean;
  onAddNew: () => void;
  onSelectConfig: (config: SavedTransportConfiguration) => void;
}

export const FavouritesView: React.FC<FavouritesViewProps> = ({ isZH, onAddNew, onSelectConfig }) => {
  const [configurations, setConfigurations] = useState<SavedTransportConfiguration[]>([]);
  const [snapshots, setSnapshots] = useState<Map<string, ArrivalSnapshot>>(new Map());
  const [loadingMap, setLoadingMap] = useState<Map<string, boolean>>(new Map());

  const storage = StorageManager.getInstance();
  const transport = TransportManager.getInstance();

  const loadData = () => {
    const list = storage.loadConfigurations();
    setConfigurations(list);
    const snapMap = new Map<string, ArrivalSnapshot>();
    for (const c of list) {
      const snap = storage.loadSnapshot(c.id);
      if (snap) snapMap.set(c.id, snap);
    }
    setSnapshots(snapMap);
  };

  useEffect(() => {
    loadData();
    const unsub = storage.subscribe(loadData);
    return () => unsub();
  }, []);

  const refreshRoute = async (config: SavedTransportConfiguration) => {
    setLoadingMap((prev) => new Map(prev).set(config.id, true));
    try {
      const fresh = await transport.fetchArrivals(config, true, isZH);
      setSnapshots((prev) => new Map(prev).set(config.id, fresh));
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMap((prev) => new Map(prev).set(config.id, false));
    }
  };

  const refreshAll = async () => {
    for (const config of configurations) {
      await refreshRoute(config);
    }
  };

  const moveUp = (index: number) => {
    if (index <= 0) return;
    const next = [...configurations];
    const item = next.splice(index, 1)[0];
    next.splice(index - 1, 0, item);
    storage.saveConfigurations(next);
  };

  const moveDown = (index: number) => {
    if (index >= configurations.length - 1) return;
    const next = [...configurations];
    const item = next.splice(index, 1)[0];
    next.splice(index + 1, 0, item);
    storage.saveConfigurations(next);
  };

  const deleteRoute = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(AppStrings.deleteConfirmTitle(isZH))) {
      storage.deleteConfiguration(id);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto p-6 space-y-4">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100">{AppStrings.tabFavourites(isZH)}</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {isZH
              ? `已儲存 ${configurations.length} 條常用路線`
              : `${configurations.length} favourite routes saved`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {configurations.length > 0 && (
            <button
              type="button"
              onClick={refreshAll}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 active:scale-95 border border-slate-700 rounded-lg transition"
            >
              <RefreshCw size={12} />
              <span>{AppStrings.refresh(isZH)}</span>
            </button>
          )}

          <button
            type="button"
            onClick={onAddNew}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 active:scale-95 shadow-md shadow-blue-500/20 rounded-lg transition"
          >
            <Plus size={14} />
            <span>{AppStrings.addTransport(isZH)}</span>
          </button>
        </div>
      </div>

      {/* Empty State */}
      {configurations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-slate-800 rounded-2xl bg-slate-900/40 p-8 my-auto">
          <div className="w-16 h-16 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4">
            <Train size={32} />
          </div>
          <h3 className="text-base font-semibold text-slate-200">
            {AppStrings.noSavedTransportsTitle(isZH)}
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mt-1 mb-6 leading-relaxed">
            {AppStrings.noSavedTransportsDesc(isZH)}
          </p>
          <button
            type="button"
            onClick={onAddNew}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-lg shadow-blue-500/25 transition active:scale-95"
          >
            <Plus size={16} />
            <span>{AppStrings.addTransport(isZH)}</span>
          </button>
        </div>
      ) : (
        /* Routes List */
        <div className="grid grid-cols-1 gap-3">
          {configurations.map((config, index) => {
            const meta = OPERATOR_METADATA[config.operatorType] || OPERATOR_METADATA.mtr;
            const snap = snapshots.get(config.id);
            const isLoading = loadingMap.get(config.id) || false;
            const arrivals = snap?.arrivals?.filter(
              (a) => new Date(a.predictedArrivalAt).getTime() > Date.now() - 60000
            ) || [];
            const nextArrival = arrivals[0];
            const boarding = isZH ? config.displayBoardingStopTC : config.displayBoardingStopEN;
            const dir = isZH ? config.displayDirectionTC : config.displayDirectionEN;

            return (
              <div
                key={config.id}
                onClick={() => onSelectConfig(config)}
                className="group relative flex flex-col p-4 rounded-xl bg-slate-850 hover:bg-slate-800/90 border border-slate-750 hover:border-slate-650 transition cursor-pointer shadow-sm"
              >
                {/* Card Header */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="flex items-center justify-center w-8 h-8 rounded-lg text-white font-bold shadow flex-shrink-0"
                      style={{ backgroundColor: meta.brandColor }}
                    >
                      {meta.sfSymbol === 'train' ? <Train size={16} /> : <Bus size={16} />}
                    </div>

                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-base text-slate-100 tracking-tight truncate">
                          {config.displayLineOrRoute}
                        </span>
                        {config.nickname && (
                          <span className="text-[10px] font-medium bg-slate-700/80 text-slate-300 px-2 py-0.5 rounded-full truncate">
                            {config.nickname}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 font-medium truncate">
                        {isZH ? meta.nameTC : meta.nameEN}
                      </span>
                    </div>
                  </div>

                  {/* Actions (Reorder, Refresh, Delete) */}
                  <div
                    className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => moveUp(index)}
                      disabled={index === 0}
                      className="p-1 rounded text-slate-400 hover:text-slate-200 disabled:opacity-20 hover:bg-slate-700/50"
                      title="Move Up"
                    >
                      <ChevronUp size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveDown(index)}
                      disabled={index === configurations.length - 1}
                      className="p-1 rounded text-slate-400 hover:text-slate-200 disabled:opacity-20 hover:bg-slate-700/50"
                      title="Move Down"
                    >
                      <ChevronDown size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => refreshRoute(config)}
                      disabled={isLoading}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 transition"
                      title="Refresh"
                    >
                      <RefreshCw size={13} className={isLoading ? 'animate-spin text-blue-400' : ''} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => deleteRoute(config.id, e)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition ml-1"
                      title="Delete"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Stop & Direction Row */}
                <div className="grid grid-cols-2 gap-2 my-3 pt-2.5 border-t border-slate-700/40 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">
                      {AppStrings.boardingStop(isZH)}
                    </span>
                    <span className="font-medium text-slate-200 truncate block mt-0.5">
                      {config.operatorType === 'mtr' ? boarding : cleanBusStopCode(boarding)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">
                      {AppStrings.direction(isZH)}
                    </span>
                    <span className="font-medium text-slate-300 truncate block mt-0.5">
                      {dir}
                    </span>
                  </div>
                </div>

                {/* Arrivals Preview */}
                <div className="flex items-center justify-between bg-slate-900/60 rounded-lg p-2.5 border border-slate-800 text-xs">
                  {isLoading && arrivals.length === 0 ? (
                    <div className="flex items-center gap-2 text-slate-400">
                      <RefreshCw size={12} className="animate-spin text-blue-400" />
                      <span>{AppStrings.loadingArrivals(isZH)}</span>
                    </div>
                  ) : nextArrival ? (
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`font-bold text-lg ${
                            getMinutesRemaining(nextArrival) <= 5
                              ? 'text-rose-400 font-extrabold'
                              : 'text-slate-100'
                          }`}
                        >
                          {formatCountdown(nextArrival, new Date(), isZH)}
                        </span>
                        <span className="text-xs font-mono text-slate-400">
                          ({formatTimeHHMM(nextArrival.predictedArrivalAt)})
                        </span>
                      </div>

                      {nextArrival.platform && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30">
                          {AppStrings.platformSuffix(isZH, nextArrival.platform)}
                        </span>
                      )}

                      {arrivals.length > 1 && (
                        <span className="text-[11px] text-slate-400 hidden sm:inline">
                          • {isZH ? '次班' : 'Next'}: {formatCountdown(arrivals[1], new Date(), isZH)}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-slate-500">{AppStrings.noArrivalsScheduled(isZH)}</span>
                  )}

                  {snap && (
                    <span className="text-[10px] text-slate-400 font-normal">
                      {getFreshnessText(snap, new Date(), isZH)}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

