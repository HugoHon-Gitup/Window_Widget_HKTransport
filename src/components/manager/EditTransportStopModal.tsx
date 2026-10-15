import React, { useState, useEffect } from 'react';
import { SavedTransportConfiguration, cleanBusStopCode } from '../../types/transport';
import { MTR_LINES, getMTRLine } from '../../services/mtrCatalogue';
import { KMBClient, KMBRouteStopItem } from '../../services/kmbClient';
import { CitybusClient, CitybusRouteStopItem } from '../../services/citybusClient';
import { GMBClient, GMBRouteStopItem } from '../../services/gmbClient';
import { AppStrings } from '../../services/localization';
import { X, Check, Loader2 } from 'lucide-react';

interface EditTransportStopModalProps {
  configuration: SavedTransportConfiguration;
  isZH: boolean;
  onSave: (updated: SavedTransportConfiguration) => void;
  onClose: () => void;
}

export const EditTransportStopModal: React.FC<EditTransportStopModalProps> = ({
  configuration,
  isZH,
  onSave,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);
  const [stopList, setStopList] = useState<{ id: string; seq: number; label: string }[]>([]);
  const [selectedSeq, setSelectedSeq] = useState<number>(configuration.stopSequence || 1);
  const [selectedMtrCode, setSelectedMtrCode] = useState<string>(configuration.stationCode || '');

  useEffect(() => {
    async function load() {
      if (configuration.operatorType === 'mtr') {
        const line = getMTRLine(configuration.lineCode || '');
        if (line) {
          setStopList(
            line.stations.map((s, idx) => ({
              id: s.code,
              seq: idx,
              label: isZH ? s.nameTC : s.nameEN,
            }))
          );
        }
      } else if (configuration.operatorType === 'kmb' && configuration.routeNumber) {
        setLoading(true);
        try {
          const stops = await KMBClient.getInstance().fetchRouteStops(
            configuration.routeNumber,
            configuration.directionCode,
            configuration.serviceType || '1'
          );
          const nameMap = new Map<string, { en: string; tc: string }>();
          for (const s of stops) {
            const names = await KMBClient.getInstance().fetchStopName(s.stop);
            nameMap.set(s.stop, names);
          }
          setStopList(
            stops.map((s) => ({
              id: s.stop,
              seq: Number(s.seq),
              label: `#${s.seq} - ${
                nameMap.get(s.stop) ? (isZH ? nameMap.get(s.stop)!.tc : nameMap.get(s.stop)!.en) : s.stop
              }`,
            }))
          );
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
      } else if (configuration.operatorType === 'citybus' && configuration.routeNumber) {
        setLoading(true);
        try {
          const stops = await CitybusClient.getInstance().fetchRouteStops(
            configuration.routeNumber,
            configuration.directionCode
          );
          const nameMap = new Map<string, { en: string; tc: string }>();
          for (const s of stops) {
            const names = await CitybusClient.getInstance().fetchStopName(s.stop);
            nameMap.set(s.stop, names);
          }
          setStopList(
            stops.map((s) => ({
              id: s.stop,
              seq: Number(s.seq),
              label: `#${s.seq} - ${
                nameMap.get(s.stop) ? (isZH ? nameMap.get(s.stop)!.tc : nameMap.get(s.stop)!.en) : s.stop
              }`,
            }))
          );
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
      } else if (configuration.operatorType === 'gmb' && configuration.lineCode) {
        setLoading(true);
        try {
          const stops = await GMBClient.getInstance().fetchRouteStops(
            parseInt(configuration.lineCode, 10),
            parseInt(configuration.directionCode, 10) || 1
          );
          setStopList(
            stops.map((s) => ({
              id: s.stop_id.toString(),
              seq: s.stop_seq,
              label: `#${s.stop_seq} - ${isZH ? s.name_tc : s.name_en}`,
            }))
          );
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
      }
    }
    load();
  }, [configuration, isZH]);

  const handleConfirm = () => {
    let updated = { ...configuration, updatedAt: new Date().toISOString() };

    if (configuration.operatorType === 'mtr') {
      const line = getMTRLine(configuration.lineCode || '');
      const sta = line?.stations.find((s) => s.code === selectedMtrCode);
      if (sta) {
        updated.stationCode = sta.code;
        updated.displayBoardingStopEN = sta.nameEN;
        updated.displayBoardingStopTC = sta.nameTC;
      }
    } else {
      const match = stopList.find((s) => Number(s.seq) === Number(selectedSeq));
      if (match) {
        updated.stopId = match.id;
        updated.stopSequence = match.seq;
        // Clean up the label display
        const cleanName = match.label.replace(/^#\d+\s*-\s*/, '');
        updated.displayBoardingStopEN = cleanName;
        updated.displayBoardingStopTC = cleanName;
      }
    }

    onSave(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-750 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="font-bold text-base text-slate-100">{AppStrings.editStopTitle(isZH)}</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X size={16} />
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-8 text-slate-400">
            <Loader2 size={24} className="animate-spin text-blue-400 mb-2" />
            <span className="text-xs">Loading stops...</span>
          </div>
        ) : (
          <div className="space-y-3">
            <label className="text-xs font-semibold text-slate-400 block">
              {AppStrings.selectStop(isZH)}
            </label>

            {configuration.operatorType === 'mtr' ? (
              <select
                value={selectedMtrCode}
                onChange={(e) => setSelectedMtrCode(e.target.value)}
                className="w-full bg-slate-800 text-slate-100 border border-slate-700 rounded-lg p-2.5 text-xs font-medium"
              >
                {stopList.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            ) : (
              <select
                value={selectedSeq}
                onChange={(e) => setSelectedSeq(parseInt(e.target.value, 10))}
                className="w-full bg-slate-800 text-slate-100 border border-slate-700 rounded-lg p-2.5 text-xs font-medium focus:ring-2 focus:ring-blue-500"
              >
                {stopList.map((item) => (
                  <option key={item.seq} value={Number(item.seq)}>
                    {item.label}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition"
          >
            {AppStrings.cancel(isZH)}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow transition"
          >
            {AppStrings.saveChanges(isZH)}
          </button>
        </div>
      </div>
    </div>
  );
};

