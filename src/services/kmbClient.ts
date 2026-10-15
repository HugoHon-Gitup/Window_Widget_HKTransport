import { ArrivalItem, ArrivalSnapshot, ArrivalStatus, SavedTransportConfiguration } from '../types/transport';

export interface KMBRouteItem {
  route: string;
  bound: string; // "O" or "I"
  service_type: string; // "1"
  orig_en: string;
  orig_tc: string;
  dest_en: string;
  dest_tc: string;
}

export interface KMBRouteStopItem {
  route: string;
  bound: string;
  service_type: string;
  seq: number;
  stop: string;
}

export interface KMBStopDetail {
  stop: string;
  name_en: string;
  name_tc: string;
  lat: string;
  long: string;
}

export class KMBClient {
  private static instance: KMBClient;
  private baseURL = 'https://data.etabus.gov.hk/v1/transport/kmb';
  private cachedRoutes: KMBRouteItem[] | null = null;
  private stopNameCache: Map<string, { en: string; tc: string }> = new Map();
  private isStopNamesLoaded: boolean = false;

  public static getInstance(): KMBClient {
    if (!KMBClient.instance) {
      KMBClient.instance = new KMBClient();
    }
    return KMBClient.instance;
  }

  public async fetchRoutes(): Promise<KMBRouteItem[]> {
    if (this.cachedRoutes && this.cachedRoutes.length > 0) {
      return this.cachedRoutes;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    try {
      const res = await fetch(`${this.baseURL}/route/`, {
        signal: controller.signal,
        headers: { Accept: 'application/json', 'User-Agent': 'HKTransportWidget/1.0' },
      });
      if (!res.ok) throw new Error('Failed to fetch KMB routes');
      const json = await res.json();
      this.cachedRoutes = json.data || [];
      return this.cachedRoutes!;
    } finally {
      clearTimeout(timeout);
    }
  }

  public async fetchRouteStops(route: string, direction: string, serviceType: string = '1'): Promise<KMBRouteStopItem[]> {
    const dir = direction.toLowerCase() === 'o' ? 'outbound' : direction.toLowerCase() === 'i' ? 'inbound' : direction.toLowerCase();
    const url = `${this.baseURL}/route-stop/${route}/${dir}/${serviceType}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
      const res = await fetch(url, {
        signal: controller.signal,
        headers: { Accept: 'application/json', 'User-Agent': 'HKTransportWidget/1.0' },
      });
      if (!res.ok) throw new Error('Failed to fetch KMB route stops');
      const json = await res.json();
      const rawStops = json.data || [];
      const stops: KMBRouteStopItem[] = rawStops.map((s: any) => ({
        ...s,
        seq: typeof s.seq === 'string' ? parseInt(s.seq, 10) : Number(s.seq),
      }));
      return stops.sort((a, b) => a.seq - b.seq);
    } finally {
      clearTimeout(timeout);
    }
  }

  public async loadAllStopNames(): Promise<void> {
    if (this.isStopNamesLoaded && this.stopNameCache.size > 0) return;

    try {
      const res = await fetch(`${this.baseURL}/stop`, {
        headers: { Accept: 'application/json', 'User-Agent': 'HKTransportWidget/1.0' },
      });
      if (!res.ok) return;
      const json = await res.json();
      const stops: KMBStopDetail[] = json.data || [];
      for (const s of stops) {
        this.stopNameCache.set(s.stop, { en: s.name_en, tc: s.name_tc });
      }
      this.isStopNamesLoaded = true;
    } catch {
      // Ignore background caching error
    }
  }

  public async fetchStopName(stopId: string): Promise<{ en: string; tc: string }> {
    if (this.stopNameCache.has(stopId)) {
      return this.stopNameCache.get(stopId)!;
    }

    try {
      const res = await fetch(`${this.baseURL}/stop/${stopId}`, {
        headers: { Accept: 'application/json', 'User-Agent': 'HKTransportWidget/1.0' },
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          const names = { en: json.data.name_en, tc: json.data.name_tc };
          this.stopNameCache.set(stopId, names);
          return names;
        }
      }
    } catch {
      // Fallback below
    }

    return { en: stopId, tc: stopId };
  }

  public async fetchArrivals(configuration: SavedTransportConfiguration): Promise<ArrivalSnapshot> {
    const { routeNumber, stopId, serviceType = '1' } = configuration;
    if (!routeNumber || !stopId) {
      throw new Error('Missing KMB route or stop ID');
    }

    const url = `${this.baseURL}/eta/${stopId}/${routeNumber}/${serviceType}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
      const res = await fetch(url, {
        signal: controller.signal,
        headers: { Accept: 'application/json', 'User-Agent': 'HKTransportWidget/1.0' },
      });
      if (!res.ok) throw new Error(`Server responded with ${res.status}`);
      const json = await res.json();
      return this.parseKMBETA(json, configuration);
    } finally {
      clearTimeout(timeout);
    }
  }

  public parseKMBETA(root: any, configuration: SavedTransportConfiguration): ArrivalSnapshot {
    const { id, directionCode, stopSequence } = configuration;
    const targetDir = (directionCode || 'O').toUpperCase();
    const targetSeq = stopSequence;

    const data: any[] = root.data || [];
    let providerGeneratedAt: string | undefined;
    if (root.generated_timestamp) {
      providerGeneratedAt = new Date(root.generated_timestamp).toISOString();
    }

    const exactItems: ArrivalItem[] = [];
    const dirMatchedItems: ArrivalItem[] = [];

    for (const record of data) {
      if (record.dir && !targetDir.startsWith(record.dir.toUpperCase().charAt(0))) {
        continue;
      }
      if (!record.eta) continue;

      const etaDate = new Date(record.eta);
      if (isNaN(etaDate.getTime())) continue;

      const item: ArrivalItem = {
        id: `kmb-${record.stop}-${record.seq}-${record.eta_seq || ''}-${record.eta}`,
        predictedArrivalAt: etaDate.toISOString(),
        destinationNameEN: record.dest_en || '',
        destinationNameTC: record.dest_tc || '',
        remarksEN: record.rmk_en?.trim() ? record.rmk_en : undefined,
        remarksTC: record.rmk_tc?.trim() ? record.rmk_tc : undefined,
        sequence: record.seq,
      };

      dirMatchedItems.push(item);

      if (targetSeq != null && Number(record.seq) === Number(targetSeq)) {
        exactItems.push(item);
      }
    }

    const effective = exactItems.length > 0 ? exactItems : dirMatchedItems;
    effective.sort(
      (a, b) => new Date(a.predictedArrivalAt).getTime() - new Date(b.predictedArrivalAt).getTime()
    );

    const status: ArrivalStatus = effective.length === 0 ? 'noPrediction' : 'ok';

    return {
      configurationId: id,
      fetchedAt: new Date().toISOString(),
      providerGeneratedAt,
      arrivals: effective,
      status,
    };
  }
}
