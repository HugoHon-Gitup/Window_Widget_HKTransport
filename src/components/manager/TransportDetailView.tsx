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
import { EditTransportStopModal } from './EditTransportStopModal';
import { AppStrings } from '../../services/localization';
import {
  Train,
  Bus,
  RefreshCw,
  ArrowLeft,
  Trash2,
  ArrowRightLeft,
  AlertTriangle,
  Clock,
} from 'lucide-react';

interface TransportDetailViewProps {
  configuration: SavedTransportConfiguration;
  isZH: boolean;
  onBack: () => void;
  onDeleted: () => void;
}

export const TransportDetailView: React.FC<TransportDetailViewProps> = ({
  configuration,
  isZH,
  onBack,
  onDeleted,
}) => {
  const [currentConfig, setCurrentConfig] = useState<SavedTransportConfiguration>(configuration);
  const [snapshot, setSnapshot] = useState<ArrivalSnapshot | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showEditStop, setShowEditStop] = useState(false);

  const storage = StorageManager.getInstance();
  const transport = TransportManager.getInstance();
  const meta = OPERATOR_METADATA[currentConfig.operatorType] || OPERATOR_METADATA.mtr;

  const loadArrivals = async (force: boolean = false) => {
    setIsRefreshing(true);
    try {
      const snap = await transport.fetchArrivals(currentConfig, force, isZH);
      setSnapshot(snap);
    } catch (e) {
      console.error(e);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    const cached = storage.loadSnapshot(currentConfig.id);
    setSnapshot(cached);
    loadArrivals();
  }, [currentConfig]);

  const handleDelete = () => {
    if (window.confirm(AppStrings.deleteConfirmTitle(isZH))) {
      storage.deleteConfiguration(currentConfig.id);
      onDeleted();
    }
  };

  const arrivals = snapshot?.arrivals?.filter(
    (a) => new Date(a.predictedArrivalAt).getTime() > Date.now() - 60000
  ) || [];

  const boarding = isZH ? currentConfig.displayBoardingStopTC : currentConfig.displayBoardingStopEN;
  const direction = isZH ? currentConfig.displayDirectionTC : currentConfig.displayDirectionEN;
  const alertMsg = isZH ? snapshot?.alertMessageTC : snapshot?.alertMessageEN;

  return (
    <div className="flex flex-col h-full overflow-y-auto p-6 space-y-6 max-w-3xl mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-700/60">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Back to Favourites"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h2 className="text-xl font-bold text-slate-100">{AppStrings.detailTitle(isZH)}</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {currentConfig.displayLineOrRoute}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => loadArrivals(true)}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow transition active:scale-95"
        >
          <RefreshCw size={12} className={isRefreshing ? 'animate-spin' : ''} />
          <span>{AppStrings.refresh(isZH)}</span>
        </button>
      </div>

      {/* Main Info Card */}
      <div className="bg-slate-850 p-5 rounded-2xl border border-slate-750 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center w-10 h-10 rounded-xl text-white font-bold shadow"
              style={{ backgroundColor: meta.brandColor }}
            >
              {meta.sfSymbol === 'train' ? <Train size={20} /> : <Bus size={20} />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg text-slate-100 tracking-tight">
                  {currentConfig.displayLineOrRoute}
                </span>
                {currentConfig.nickname && (
                  <span className="text-[11px] font-medium bg-slate-700 text-slate-300 px-2.5 py-0.5 rounded-full">
                    {currentConfig.nickname}
                  </span>
                )}
              </div>
              <span className="text-xs text-slate-400 font-medium">
                {isZH ? meta.nameTC : meta.nameEN}
              </span>
            </div>
          </div>

          {snapshot && (
            <span className="text-xs text-slate-400 font-mono">
              {getFreshnessText(snapshot, new Date(), isZH)}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-750">
          <div className="flex items-center justify-between bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">
                {AppStrings.boardingStop(isZH)}
              </span>
              <span className="font-bold text-sm text-slate-100 mt-0.5 block">
                {currentConfig.operatorType === 'mtr' ? boarding : cleanBusStopCode(boarding)}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowEditStop(true)}
              className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg transition"
            >
              <ArrowRightLeft size={11} />
              <span>{AppStrings.changeStop(isZH)}</span>
            </button>
          </div>

          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">
              {AppStrings.direction(isZH)}
            </span>
            <span className="font-semibold text-sm text-slate-300 mt-0.5 block">
              {direction}
            </span>
          </div>
        </div>
      </div>

      {/* Service Alert Banner if present */}
      {alertMsg && (
        <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
          <AlertTriangle size={16} className="flex-shrink-0 mt-0.5 text-amber-400" />
          <div className="leading-relaxed">
            <span className="font-bold block mb-0.5">交通通告 / Service Notice:</span>
            <span>{alertMsg}</span>
          </div>
        </div>
      )}

      {/* Upcoming Arrivals Section */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-300 tracking-wide uppercase">
          {AppStrings.upcomingArrivals(isZH)}
        </h3>

        {arrivals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400 bg-slate-900/40 rounded-xl border border-slate-800">
            <Clock size={28} className="text-slate-500 mb-2" />
            <span className="text-sm font-medium">{AppStrings.noArrivalsScheduled(isZH)}</span>
          </div>
        ) : (
          <div className="space-y-2">
            {arrivals.map((item, idx) => {
              const mins = getMinutesRemaining(item);
              const isUrgent = mins <= 5;
              const isPrimary = idx === 0;
              const dest = isZH ? item.destinationNameTC : item.destinationNameEN;
              const rmk = isZH ? item.remarksTC : item.remarksEN;

              return (
                <div
                  key={item.id}
                  className={`flex items-center justify-between p-3.5 rounded-xl border transition ${
                    isPrimary
                      ? 'bg-slate-800 border-slate-650 shadow-sm'
                      : 'bg-slate-850 border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-5 text-center text-xs font-mono font-bold text-slate-500">
                      #{idx + 1}
                    </span>

                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-bold text-base ${
                            isUrgent ? 'text-rose-400 font-extrabold' : 'text-slate-100'
                          }`}
                        >
                          {formatCountdown(item, new Date(), isZH)}
                        </span>

                        {item.platform && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30">
                            {AppStrings.platformSuffix(isZH, item.platform)}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                        <span className="font-medium text-slate-300">
                          {dest}
                        </span>
                        {rmk && <span className="text-amber-400/90 text-[11px]">• {rmk}</span>}
                      </div>
                    </div>
                  </div>

                  <span className="font-mono text-xs font-semibold text-slate-400 bg-slate-900/60 px-2.5 py-1 rounded-lg border border-slate-800">
                    {formatTimeHHMM(item.predictedArrivalAt)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Route Button */}
      <div className="pt-4 border-t border-slate-800">
        <button
          type="button"
          onClick={handleDelete}
          className="w-full flex items-center justify-center gap-2 p-3 text-xs font-semibold text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-600 rounded-xl transition"
        >
          <Trash2 size={14} />
          <span>{AppStrings.deleteRoute(isZH)}</span>
        </button>
      </div>

      {/* Edit Stop Modal */}
      {showEditStop && (
        <EditTransportStopModal
          configuration={currentConfig}
          isZH={isZH}
          onSave={(updated) => {
            storage.updateConfiguration(updated);
            setCurrentConfig(updated);
            setShowEditStop(false);
          }}
          onClose={() => setShowEditStop(false)}
        />
      )}
    </div>
  );
};

