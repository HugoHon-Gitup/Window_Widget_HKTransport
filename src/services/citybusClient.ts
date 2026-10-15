import { ArrivalItem, ArrivalSnapshot, ArrivalStatus, SavedTransportConfiguration } from '../types/transport';

export interface CitybusRouteItem {
  co: string; // "CTB"
  route: string;
  orig_en: string;
  orig_tc: string;
  dest_en: string;
  dest_tc: string;
}

export interface CitybusRouteStopItem {
  co: string;
  route: string;
  dir: string; // "outbound" or "inbound"
  seq: number;
  stop: string;
}

export interface CitybusStopDetail {
  stop: string;
  name_en: string;
  name_tc: string;
}

export class CitybusClient {
  private static instance: CitybusClient;
  private baseURL = 'https://rt.data.gov.hk/v2/transport/citybus';
  private cachedRoutes: CitybusRouteItem[] | null = null;
  private stopNameCache: Map<string, { en: string; tc: string }> = new Map();

  public static getInstance(): CitybusClient {
    if (!CitybusClient.instance) {
      CitybusClient.instance = new CitybusClient();
    }
    return CitybusClient.instance;
  }

  public async fetchRoutes(): Promise<CitybusRouteItem[]> {
    if (this.cachedRoutes && this.cachedRoutes.length > 0) {
      return this.cachedRoutes;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    try {
      const res = await fetch(`${this.baseURL}/route/CTB`, {
        signal: controller.signal,
        headers: { Accept: 'application/json', 'User-Agent': 'HKTransportWidget/1.0' },
      });
      if (!res.ok) throw new Error('Failed to fetch Citybus routes');
      const json = await res.json();
      this.cachedRoutes = json.data || [];
      return this.cachedRoutes!;
    } finally {
      clearTimeout(timeout);
    }
  }

  public async fetchRouteStops(route: string, direction: string): Promise<CitybusRouteStopItem[]> {
    const upper = direction.toUpperCase();
    const dirParam = upper === 'O' || upper === 'OUTBOUND' ? 'outbound' : 'inbound';
    const url = `${this.baseURL}/route-stop/CTB/${route}/${dirParam}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
      const res = await fetch(url, {
        signal: controller.signal,
        headers: { Accept: 'application/json', 'User-Agent': 'HKTransportWidget/1.0' },
      });
      if (!res.ok) throw new Error('Failed to fetch Citybus route stops');
      const json = await res.json();
      const rawStops = json.data || [];
      const stops: CitybusRouteStopItem[] = rawStops.map((s: any) => ({
        ...s,
        seq: typeof s.seq === 'string' ? parseInt(s.seq, 10) : Number(s.seq),
      }));
      return stops.sort((a, b) => a.seq - b.seq);
    } finally {
      clearTimeout(timeout);
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
      // Fallback
    }

    return { en: stopId, tc: stopId };
  }

  public async fetchArrivals(configuration: SavedTransportConfiguration): Promise<ArrivalSnapshot> {
    const { routeNumber, stopId } = configuration;
    if (!routeNumber || !stopId) {
      throw new Error('Missing Citybus route or stop ID');
    }

    // Citybus API expects 6-digit zero-padded stop ID
    const paddedStopId = stopId.length < 6 ? stopId.padStart(6, '0') : stopId;
    const url = `${this.baseURL}/eta/CTB/${paddedStopId}/${routeNumber}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
      const res = await fetch(url, {
        signal: controller.signal,
        headers: { Accept: 'application/json', 'User-Agent': 'HKTransportWidget/1.0' },
      });
      if (!res.ok) throw new Error(`Server responded with ${res.status}`);
      const json = await res.json();
      return this.parseCitybusETA(json, configuration);
    } finally {
      clearTimeout(timeout);
    }
  }

  public parseCitybusETA(root: any, configuration: SavedTransportConfiguration): ArrivalSnapshot {
    const { id, directionCode, stopSequence } = configuration;
    const rawDir = (directionCode || 'O').toUpperCase();
    const targetDir = rawDir === 'OUTBOUND' || rawDir === 'O' ? 'O' : 'I';
    const targetSeq = stopSequence;

    const data: any[] = root.data || [];
    let providerGeneratedAt: string | undefined;
    if (root.generated_timestamp) {
      providerGeneratedAt = new Date(root.generated_timestamp).toISOString();
    }

    const exactItems: ArrivalItem[] = [];
    const dirMatchedItems: ArrivalItem[] = [];

    for (const record of data) {
      const recordDir = (record.dir || '').toUpperCase();
      if (!recordDir.startsWith(targetDir)) {
        continue;
      }
      if (!record.eta) continue;

      const etaDate = new Date(record.eta);
      if (isNaN(etaDate.getTime())) continue;

      const item: ArrivalItem = {
        id: `ctb-${record.stop}-${record.seq}-${record.eta_seq || ''}-${record.eta}`,
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

