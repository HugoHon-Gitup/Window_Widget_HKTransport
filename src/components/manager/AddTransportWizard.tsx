import React, { useState, useEffect } from 'react';
import {
  SavedTransportConfiguration,
  TransportOperator,
  OPERATOR_METADATA,
  cleanBusStopCode,
} from '../../types/transport';
import { MTR_LINES, MTRLine, MTRStation, MTRDirection } from '../../services/mtrCatalogue';
import { KMBClient, KMBRouteItem, KMBRouteStopItem } from '../../services/kmbClient';
import { CitybusClient, CitybusRouteItem, CitybusRouteStopItem } from '../../services/citybusClient';
import { GMBClient, GMBRouteItem, GMBRouteDirection, GMBRouteStopItem } from '../../services/gmbClient';
import { StorageManager } from '../../services/storageManager';
import { AppStrings } from '../../services/localization';
import { Train, Bus, Search, Check, ArrowRight, Loader2 } from 'lucide-react';

interface AddTransportWizardProps {
  isZH: boolean;
  onDone: () => void;
  onCancel: () => void;
}

export const AddTransportWizard: React.FC<AddTransportWizardProps> = ({ isZH, onDone, onCancel }) => {
  const [operator, setOperator] = useState<TransportOperator>('mtr');
  const [nickname, setNickname] = useState<string>('');

  // MTR State
  const [mtrLine, setMtrLine] = useState<MTRLine>(MTR_LINES[0]);
  const [mtrStation, setMtrStation] = useState<MTRStation>(MTR_LINES[0].stations[0]);
  const [mtrDirection, setMtrDirection] = useState<MTRDirection>(MTR_LINES[0].directions[0]);
  const [mtrBranchFilter, setMtrBranchFilter] = useState<string>('');

  // KMB State
  const [kmbRoutes, setKmbRoutes] = useState<KMBRouteItem[]>([]);
  const [kmbSearch, setKmbSearch] = useState<string>('');
  const [selectedKmbRoute, setSelectedKmbRoute] = useState<KMBRouteItem | null>(null);
  const [kmbStops, setKmbStops] = useState<KMBRouteStopItem[]>([]);
  const [kmbStopNames, setKmbStopNames] = useState<Map<string, { en: string; tc: string }>>(new Map());
  const [selectedKmbStop, setSelectedKmbStop] = useState<KMBRouteStopItem | null>(null);
  const [loadingKmbRoutes, setLoadingKmbRoutes] = useState<boolean>(false);
  const [loadingKmbStops, setLoadingKmbStops] = useState<boolean>(false);

  // Citybus State
  const [ctbRoutes, setCtbRoutes] = useState<CitybusRouteItem[]>([]);
  const [ctbSearch, setCtbSearch] = useState<string>('');
  const [selectedCtbRoute, setSelectedCtbRoute] = useState<CitybusRouteItem | null>(null);
  const [ctbDirection, setCtbDirection] = useState<string>('O');
  const [ctbStops, setCtbStops] = useState<CitybusRouteStopItem[]>([]);
  const [ctbStopNames, setCtbStopNames] = useState<Map<string, { en: string; tc: string }>>(new Map());
  const [selectedCtbStop, setSelectedCtbStop] = useState<CitybusRouteStopItem | null>(null);
  const [loadingCtbRoutes, setLoadingCtbRoutes] = useState<boolean>(false);
  const [loadingCtbStops, setLoadingCtbStops] = useState<boolean>(false);

  // GMB State
  const [gmbRegion, setGmbRegion] = useState<string>('HKI');
  const [gmbRoutes, setGmbRoutes] = useState<string[]>([]);
  const [gmbSearch, setGmbSearch] = useState<string>('');
  const [selectedGmbCode, setSelectedGmbCode] = useState<string | null>(null);
  const [gmbRouteItems, setGmbRouteItems] = useState<GMBRouteItem[]>([]);
  const [selectedGmbItem, setSelectedGmbItem] = useState<GMBRouteItem | null>(null);
  const [selectedGmbDir, setSelectedGmbDir] = useState<GMBRouteDirection | null>(null);
  const [gmbStops, setGmbStops] = useState<GMBRouteStopItem[]>([]);
  const [selectedGmbStop, setSelectedGmbStop] = useState<GMBRouteStopItem | null>(null);
  const [loadingGmbRoutes, setLoadingGmbRoutes] = useState<boolean>(false);
  const [loadingGmbStops, setLoadingGmbStops] = useState<boolean>(false);

  // Load Bus Routes on operator change
  useEffect(() => {
    if (operator === 'kmb' && kmbRoutes.length === 0) {
      setLoadingKmbRoutes(true);
      KMBClient.getInstance()
        .fetchRoutes()
        .then((r) => setKmbRoutes(r))
        .catch(console.error)
        .finally(() => setLoadingKmbRoutes(false));
    } else if (operator === 'citybus' && ctbRoutes.length === 0) {
      setLoadingCtbRoutes(true);
      CitybusClient.getInstance()
        .fetchRoutes()
        .then((r) => setCtbRoutes(r))
        .catch(console.error)
        .finally(() => setLoadingCtbRoutes(false));
    } else if (operator === 'gmb') {
      setLoadingGmbRoutes(true);
      GMBClient.getInstance()
        .fetchRoutes(gmbRegion)
        .then((r) => setGmbRoutes(r))
        .catch(console.error)
        .finally(() => setLoadingGmbRoutes(false));
    }
  }, [operator, gmbRegion]);

  // Handle KMB Route Selection
  const handleSelectKmbRoute = async (r: KMBRouteItem) => {
    setSelectedKmbRoute(r);
    setSelectedKmbStop(null);
    setLoadingKmbStops(true);
    try {
      const stops = await KMBClient.getInstance().fetchRouteStops(r.route, r.bound, r.service_type);
      setKmbStops(stops);
      if (stops.length > 0) setSelectedKmbStop(stops[0]);

      // Pre-load names
      await KMBClient.getInstance().loadAllStopNames();
      const nameMap = new Map<string, { en: string; tc: string }>();
      for (const s of stops) {
        const names = await KMBClient.getInstance().fetchStopName(s.stop);
        nameMap.set(s.stop, names);
      }
      setKmbStopNames(nameMap);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingKmbStops(false);
    }
  };

  // Handle Citybus Route Selection
  const handleSelectCtbRoute = async (r: CitybusRouteItem, dir: string) => {
    setSelectedCtbRoute(r);
    setCtbDirection(dir);
    setSelectedCtbStop(null);
    setLoadingCtbStops(true);
    try {
      const stops = await CitybusClient.getInstance().fetchRouteStops(r.route, dir);
      setCtbStops(stops);
      if (stops.length > 0) setSelectedCtbStop(stops[0]);

      const nameMap = new Map<string, { en: string; tc: string }>();
      for (const s of stops) {
        const names = await CitybusClient.getInstance().fetchStopName(s.stop);
        nameMap.set(s.stop, names);
      }
      setCtbStopNames(nameMap);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingCtbStops(false);
    }
  };

  // Handle GMB Route Selection
  const handleSelectGmbCode = async (code: string) => {
    setSelectedGmbCode(code);
    setSelectedGmbItem(null);
    setSelectedGmbDir(null);
    setSelectedGmbStop(null);
    setLoadingGmbStops(true);
    try {
      const items = await GMBClient.getInstance().fetchRouteDetails(gmbRegion, code);
      setGmbRouteItems(items);
      if (items.length > 0) {
        const first = items[0];
        setSelectedGmbItem(first);
        if (first.directions.length > 0) {
          const dir = first.directions[0];
          setSelectedGmbDir(dir);
          const stops = await GMBClient.getInstance().fetchRouteStops(first.route_id, dir.route_seq);
          setGmbStops(stops);
          if (stops.length > 0) setSelectedGmbStop(stops[0]);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingGmbStops(false);
    }
  };

  // Check form validity
  const isValid = (() => {
    if (operator === 'mtr') return !!mtrLine && !!mtrStation && !!mtrDirection;
    if (operator === 'kmb') return !!selectedKmbRoute && !!selectedKmbStop;
    if (operator === 'citybus') return !!selectedCtbRoute && !!selectedCtbStop;
    if (operator === 'gmb') return !!selectedGmbItem && !!selectedGmbDir && !!selectedGmbStop;
    return false;
  })();

  const handleSave = () => {
    if (!isValid) return;

    let newConfig: SavedTransportConfiguration;
    const now = new Date().toISOString();
    const id = (window as any).crypto?.randomUUID ? crypto.randomUUID() : `id-${Date.now()}`;

    if (operator === 'mtr') {
      const dirDest = isZH ? mtrDirection.destinationTC : mtrDirection.destinationEN;
      newConfig = {
        id,
        schemaVersion: 1,
        nickname: nickname.trim(),
        operatorType: 'mtr',
        lineCode: mtrLine.code,
        stationCode: mtrStation.code,
        destinationFilter: mtrBranchFilter || undefined,
        directionCode: mtrDirection.code,
        displayLineOrRoute: isZH ? mtrLine.nameTC : mtrLine.nameEN,
        displayBoardingStopEN: mtrStation.nameEN,
        displayBoardingStopTC: mtrStation.nameTC,
        displayDirectionEN: `Towards ${mtrDirection.destinationEN}`,
        displayDirectionTC: `往 ${mtrDirection.destinationTC}`,
        createdAt: now,
        updatedAt: now,
      };
    } else if (operator === 'kmb' && selectedKmbRoute && selectedKmbStop) {
      const names = kmbStopNames.get(selectedKmbStop.stop) || {
        en: selectedKmbStop.stop,
        tc: selectedKmbStop.stop,
      };
      newConfig = {
        id,
        schemaVersion: 1,
        nickname: nickname.trim(),
        operatorType: 'kmb',
        routeNumber: selectedKmbRoute.route,
        stopId: selectedKmbStop.stop,
        stopSequence: selectedKmbStop.seq,
        serviceType: selectedKmbRoute.service_type || '1',
        directionCode: selectedKmbRoute.bound,
        displayLineOrRoute: selectedKmbRoute.route,
        displayBoardingStopEN: names.en,
        displayBoardingStopTC: names.tc,
        displayDirectionEN: `Towards ${selectedKmbRoute.dest_en}`,
        displayDirectionTC: `往 ${selectedKmbRoute.dest_tc}`,
        createdAt: now,
        updatedAt: now,
      };
    } else if (operator === 'citybus' && selectedCtbRoute && selectedCtbStop) {
      const names = ctbStopNames.get(selectedCtbStop.stop) || {
        en: selectedCtbStop.stop,
        tc: selectedCtbStop.stop,
      };
      newConfig = {
        id,
        schemaVersion: 1,
        nickname: nickname.trim(),
        operatorType: 'citybus',
        routeNumber: selectedCtbRoute.route,
        stopId: selectedCtbStop.stop,
        stopSequence: selectedCtbStop.seq,
        directionCode: ctbDirection,
        displayLineOrRoute: selectedCtbRoute.route,
        displayBoardingStopEN: names.en,
        displayBoardingStopTC: names.tc,
        displayDirectionEN: `Towards ${selectedCtbRoute.dest_en}`,
        displayDirectionTC: `往 ${selectedCtbRoute.dest_tc}`,
        createdAt: now,
        updatedAt: now,
      };
    } else if (operator === 'gmb' && selectedGmbItem && selectedGmbDir && selectedGmbStop) {
      newConfig = {
        id,
        schemaVersion: 1,
        nickname: nickname.trim(),
        operatorType: 'gmb',
        lineCode: selectedGmbItem.route_id.toString(),
        directionCode: selectedGmbDir.route_seq.toString(),
        stopSequence: selectedGmbStop.stop_seq,
        displayLineOrRoute: selectedGmbCode || selectedGmbItem.route_id.toString(),
        displayBoardingStopEN: selectedGmbStop.name_en,
        displayBoardingStopTC: selectedGmbStop.name_tc,
        displayDirectionEN: `Towards ${selectedGmbDir.dest_en}`,
        displayDirectionTC: `往 ${selectedGmbDir.dest_tc}`,
        createdAt: now,
        updatedAt: now,
      };
    } else {
      return;
    }

    StorageManager.getInstance().addConfiguration(newConfig);
    onDone();
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto p-6 space-y-6 max-w-3xl mx-auto">
      {/* Title */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-700/60">
        <div>
          <h2 className="text-xl font-bold text-slate-100">{AppStrings.addTransport(isZH)}</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {isZH ? '選擇交通營運商並設定上車站點' : 'Select transport operator and boarding stop'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-3.5 py-1.5 text-xs font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition"
          >
            {AppStrings.cancel(isZH)}
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!isValid}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg shadow transition"
          >
            {AppStrings.save(isZH)}
          </button>
        </div>
      </div>

      {/* Operator Segmented Buttons */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
          {AppStrings.operatorHeader(isZH)}
        </label>
        <div className="grid grid-cols-4 gap-2 bg-slate-900/60 p-1.5 rounded-xl border border-slate-800">
          {(['mtr', 'kmb', 'citybus', 'gmb'] as TransportOperator[]).map((op) => {
            const meta = OPERATOR_METADATA[op];
            const isSelected = operator === op;
            return (
              <button
                key={op}
                type="button"
                onClick={() => setOperator(op)}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold transition ${
                  isSelected
                    ? 'bg-slate-800 text-white shadow-md border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <div
                  className="w-4 h-4 rounded flex items-center justify-center text-white"
                  style={{ backgroundColor: meta.brandColor }}
                >
                  {meta.sfSymbol === 'train' ? <Train size={10} /> : <Bus size={10} />}
                </div>
                <span>{isZH ? meta.nameTC : meta.nameEN}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Operator Specific Selector Forms */}
      <div className="bg-slate-850 p-5 rounded-xl border border-slate-750 space-y-4">
        {/* 1. MTR Form */}
        {operator === 'mtr' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Line */}
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1.5">
                {AppStrings.mtrLineHeader(isZH)}
              </label>
              <select
                value={mtrLine.code}
                onChange={(e) => {
                  const line = MTR_LINES.find((l) => l.code === e.target.value) || MTR_LINES[0];
                  setMtrLine(line);
                  setMtrStation(line.stations[0]);
                  setMtrDirection(line.directions[0]);
                  setMtrBranchFilter('');
                }}
                className="w-full bg-slate-800 text-slate-100 border border-slate-700 rounded-lg p-2.5 text-xs font-medium focus:ring-2 focus:ring-blue-500"
              >
                {MTR_LINES.map((line) => (
                  <option key={line.code} value={line.code}>
                    {isZH ? line.nameTC : line.nameEN}
                  </option>
                ))}
              </select>
            </div>

            {/* Station */}
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1.5">
                {AppStrings.mtrStationHeader(isZH)}
              </label>
              <select
                value={mtrStation.code}
                onChange={(e) => {
                  const sta = mtrLine.stations.find((s) => s.code === e.target.value) || mtrLine.stations[0];
                  setMtrStation(sta);
                }}
                className="w-full bg-slate-800 text-slate-100 border border-slate-700 rounded-lg p-2.5 text-xs font-medium focus:ring-2 focus:ring-blue-500"
              >
                {mtrLine.stations.map((sta) => (
                  <option key={sta.code} value={sta.code}>
                    {isZH ? sta.nameTC : sta.nameEN}
                  </option>
                ))}
              </select>
            </div>

            {/* Direction */}
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1.5">
                {AppStrings.mtrDirectionHeader(isZH)}
              </label>
              <select
                value={mtrDirection.code}
                onChange={(e) => {
                  const dir = mtrLine.directions.find((d) => d.code === e.target.value) || mtrLine.directions[0];
                  setMtrDirection(dir);
                  setMtrBranchFilter('');
                }}
                className="w-full bg-slate-800 text-slate-100 border border-slate-700 rounded-lg p-2.5 text-xs font-medium focus:ring-2 focus:ring-blue-500"
              >
                {mtrLine.directions.map((dir) => (
                  <option key={dir.code} value={dir.code}>
                    {AppStrings.towards(isZH, isZH ? dir.destinationTC : dir.destinationEN)}
                  </option>
                ))}
              </select>
            </div>

            {/* Optional Branch Filter */}
            {mtrDirection.branchTermini && mtrDirection.branchTermini.length > 0 && (
              <div className="md:col-span-3 pt-2 border-t border-slate-700/50">
                <label className="text-xs font-semibold text-slate-400 block mb-1.5">
                  {AppStrings.mtrBranchHeader(isZH)}
                </label>
                <select
                  value={mtrBranchFilter}
                  onChange={(e) => setMtrBranchFilter(e.target.value)}
                  className="w-full bg-slate-800 text-slate-100 border border-slate-700 rounded-lg p-2.5 text-xs font-medium"
                >
                  <option value="">{AppStrings.allDestinations(isZH)}</option>
                  {mtrDirection.branchTermini.map((b) => (
                    <option key={b.code} value={b.code}>
                      {isZH ? b.nameTC : b.nameEN}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        {/* 2. KMB Form */}
        {operator === 'kmb' && (
          <div className="space-y-4">
            {/* Search Route Input */}
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1.5">
                {AppStrings.kmbRouteHeader(isZH)}
              </label>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-3 text-slate-500" />
                <input
                  type="text"
                  placeholder={AppStrings.searchPlaceholder(isZH)}
                  value={kmbSearch}
                  onChange={(e) => setKmbSearch(e.target.value.toUpperCase())}
                  className="w-full bg-slate-800 pl-9 pr-3 py-2 border border-slate-700 rounded-lg text-xs text-slate-100 font-medium placeholder-slate-500 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Route Suggestion Chips */}
              {loadingKmbRoutes ? (
                <div className="flex items-center gap-2 text-xs text-slate-400 py-3">
                  <Loader2 size={13} className="animate-spin text-blue-400" />
                  <span>Loading KMB route catalogue...</span>
                </div>
              ) : (
                <div className="max-h-36 overflow-y-auto mt-2 grid grid-cols-1 sm:grid-cols-2 gap-1.5 p-1 bg-slate-900/50 rounded-lg border border-slate-800">
                  {kmbRoutes
                    .filter((r) => kmbSearch === '' || r.route.includes(kmbSearch))
                    .slice(0, 30)
                    .map((r, i) => {
                      const isSel = selectedKmbRoute?.route === r.route && selectedKmbRoute?.bound === r.bound;
                      return (
                        <button
                          key={`${r.route}-${r.bound}-${i}`}
                          type="button"
                          onClick={() => handleSelectKmbRoute(r)}
                          className={`flex items-center justify-between p-2 rounded text-left text-xs transition ${
                            isSel ? 'bg-blue-600/30 text-blue-200 border border-blue-500/50' : 'hover:bg-slate-800 text-slate-300'
                          }`}
                        >
                          <span className="font-bold text-slate-100 w-12">{r.route}</span>
                          <span className="truncate text-[11px] text-slate-400 flex-1 px-1">
                            {isZH ? `${r.orig_tc} 往 ${r.dest_tc}` : `${r.orig_en} to ${r.dest_en}`}
                          </span>
                        </button>
                      );
                    })}
                </div>
              )}
            </div>

            {/* Stop Selector */}
            {selectedKmbRoute && (
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1.5">
                  {AppStrings.selectStop(isZH)} ({kmbStops.length} stops)
                </label>
                {loadingKmbStops ? (
                  <div className="flex items-center gap-2 text-xs text-slate-400 py-2">
                    <Loader2 size={13} className="animate-spin text-blue-400" />
                    <span>Loading stops...</span>
                  </div>
                ) : (
                  <select
                    value={selectedKmbStop?.seq || 1}
                    onChange={(e) => {
                      const seq = parseInt(e.target.value, 10);
                      const s = kmbStops.find((item) => item.seq === seq) || kmbStops[0];
                      setSelectedKmbStop(s);
                    }}
                    className="w-full bg-slate-800 text-slate-100 border border-slate-700 rounded-lg p-2.5 text-xs font-medium"
                  >
                    {kmbStops.map((stop) => {
                      const name = kmbStopNames.get(stop.stop);
                      const label = name ? (isZH ? name.tc : name.en) : stop.stop;
                      return (
                        <option key={`${stop.stop}-${stop.seq}`} value={stop.seq}>
                          #{stop.seq} - {cleanBusStopCode(label)}
                        </option>
                      );
                    })}
                  </select>
                )}
              </div>
            )}
          </div>
        )}

        {/* 3. Citybus Form */}
        {operator === 'citybus' && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1.5">
                {AppStrings.citybusRouteHeader(isZH)}
              </label>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-3 text-slate-500" />
                <input
                  type="text"
                  placeholder={AppStrings.searchPlaceholder(isZH)}
                  value={ctbSearch}
                  onChange={(e) => setCtbSearch(e.target.value.toUpperCase())}
                  className="w-full bg-slate-800 pl-9 pr-3 py-2 border border-slate-700 rounded-lg text-xs text-slate-100 font-medium placeholder-slate-500"
                />
              </div>

              {loadingCtbRoutes ? (
                <div className="flex items-center gap-2 text-xs text-slate-400 py-3">
                  <Loader2 size={13} className="animate-spin text-blue-400" />
                  <span>Loading Citybus routes...</span>
                </div>
              ) : (
                <div className="max-h-36 overflow-y-auto mt-2 grid grid-cols-1 sm:grid-cols-2 gap-1.5 p-1 bg-slate-900/50 rounded-lg border border-slate-800">
                  {ctbRoutes
                    .filter((r) => ctbSearch === '' || r.route.includes(ctbSearch))
                    .slice(0, 30)
                    .map((r, i) => {
                      const isSel = selectedCtbRoute?.route === r.route;
                      return (
                        <button
                          key={`${r.route}-${i}`}
                          type="button"
                          onClick={() => handleSelectCtbRoute(r, 'O')}
                          className={`flex items-center justify-between p-2 rounded text-left text-xs transition ${
                            isSel ? 'bg-amber-600/30 text-amber-200 border border-amber-500/50' : 'hover:bg-slate-800 text-slate-300'
                          }`}
                        >
                          <span className="font-bold text-slate-100 w-12">{r.route}</span>
                          <span className="truncate text-[11px] text-slate-400 flex-1 px-1">
                            {isZH ? `${r.orig_tc} 往 ${r.dest_tc}` : `${r.orig_en} to ${r.dest_en}`}
                          </span>
                        </button>
                      );
                    })}
                </div>
              )}
            </div>

            {selectedCtbRoute && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-700/50">
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1.5">
                    {AppStrings.direction(isZH)}
                  </label>
                  <select
                    value={ctbDirection}
                    onChange={(e) => handleSelectCtbRoute(selectedCtbRoute, e.target.value)}
                    className="w-full bg-slate-800 text-slate-100 border border-slate-700 rounded-lg p-2.5 text-xs font-medium"
                  >
                    <option value="O">{AppStrings.outbound(isZH)} (往 {selectedCtbRoute.dest_tc})</option>
                    <option value="I">{AppStrings.inbound(isZH)} (往 {selectedCtbRoute.orig_tc})</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1.5">
                    {AppStrings.selectStop(isZH)}
                  </label>
                  {loadingCtbStops ? (
                    <div className="flex items-center gap-2 text-xs text-slate-400 py-2">
                      <Loader2 size={13} className="animate-spin text-blue-400" />
                      <span>Loading stops...</span>
                    </div>
                  ) : (
                    <select
                      value={selectedCtbStop?.seq || 1}
                      onChange={(e) => {
                        const seq = parseInt(e.target.value, 10);
                        const s = ctbStops.find((item) => item.seq === seq) || ctbStops[0];
                        setSelectedCtbStop(s);
                      }}
                      className="w-full bg-slate-800 text-slate-100 border border-slate-700 rounded-lg p-2.5 text-xs font-medium"
                    >
                      {ctbStops.map((stop) => {
                        const name = ctbStopNames.get(stop.stop);
                        const label = name ? (isZH ? name.tc : name.en) : stop.stop;
                        return (
                          <option key={`${stop.stop}-${stop.seq}`} value={stop.seq}>
                            #{stop.seq} - {cleanBusStopCode(label)}
                          </option>
                        );
                      })}
                    </select>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 4. GMB Form */}
        {operator === 'gmb' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Region */}
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1.5">
                  {AppStrings.gmbRegionHeader(isZH)}
                </label>
                <select
                  value={gmbRegion}
                  onChange={(e) => setGmbRegion(e.target.value)}
                  className="w-full bg-slate-800 text-slate-100 border border-slate-700 rounded-lg p-2.5 text-xs font-medium"
                >
                  <option value="HKI">{AppStrings.gmbRegionHKI(isZH)}</option>
                  <option value="KLN">{AppStrings.gmbRegionKLN(isZH)}</option>
                  <option value="NT">{AppStrings.gmbRegionNT(isZH)}</option>
                </select>
              </div>

              {/* Route Search */}
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1.5">
                  {AppStrings.gmbRouteHeader(isZH)}
                </label>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-3 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search route (e.g. 40M, 69X)"
                    value={gmbSearch}
                    onChange={(e) => setGmbSearch(e.target.value.toUpperCase())}
                    className="w-full bg-slate-800 pl-9 pr-3 py-2 border border-slate-700 rounded-lg text-xs text-slate-100 font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Route Chips */}
            <div className="max-h-28 overflow-y-auto grid grid-cols-4 sm:grid-cols-6 gap-1.5 p-1 bg-slate-900/50 rounded-lg border border-slate-800">
              {gmbRoutes
                .filter((r) => gmbSearch === '' || r.includes(gmbSearch))
                .slice(0, 36)
                .map((code) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => handleSelectGmbCode(code)}
                    className={`py-1.5 px-2 rounded font-bold text-xs transition ${
                      selectedGmbCode === code
                        ? 'bg-emerald-600 text-white shadow'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {code}
                  </button>
                ))}
            </div>

            {selectedGmbItem && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-700/50">
                {/* Direction */}
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1.5">
                    {AppStrings.direction(isZH)}
                  </label>
                  <select
                    value={selectedGmbDir?.route_seq || 1}
                    onChange={async (e) => {
                      const seq = parseInt(e.target.value, 10);
                      const d = selectedGmbItem.directions.find((x) => x.route_seq === seq);
                      if (d) {
                        setSelectedGmbDir(d);
                        const stops = await GMBClient.getInstance().fetchRouteStops(selectedGmbItem.route_id, d.route_seq);
                        setGmbStops(stops);
                        if (stops.length > 0) setSelectedGmbStop(stops[0]);
                      }
                    }}
                    className="w-full bg-slate-800 text-slate-100 border border-slate-700 rounded-lg p-2.5 text-xs font-medium"
                  >
                    {selectedGmbItem.directions.map((d) => (
                      <option key={d.route_seq} value={d.route_seq}>
                        {isZH ? `往 ${d.dest_tc}` : `Towards ${d.dest_en}`}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Stop */}
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1.5">
                    {AppStrings.selectStop(isZH)}
                  </label>
                  <select
                    value={selectedGmbStop?.stop_seq || 1}
                    onChange={(e) => {
                      const seq = parseInt(e.target.value, 10);
                      const s = gmbStops.find((item) => item.stop_seq === seq);
                      if (s) setSelectedGmbStop(s);
                    }}
                    className="w-full bg-slate-800 text-slate-100 border border-slate-700 rounded-lg p-2.5 text-xs font-medium"
                  >
                    {gmbStops.map((stop) => (
                      <option key={stop.stop_seq} value={stop.stop_seq}>
                        #{stop.stop_seq} - {isZH ? stop.name_tc : stop.name_en}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Nickname Input */}
      <div>
        <label className="text-xs font-semibold text-slate-400 block mb-1.5">
          {AppStrings.customLabelHeader(isZH)}
        </label>
        <input
          type="text"
          placeholder={AppStrings.customLabelPlaceholder(isZH)}
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          maxLength={24}
          className="w-full bg-slate-800 px-3.5 py-2.5 border border-slate-700 rounded-lg text-xs text-slate-100 font-medium placeholder-slate-500 focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
};

