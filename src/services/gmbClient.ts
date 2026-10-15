import { ArrivalItem, ArrivalSnapshot, ArrivalStatus, SavedTransportConfiguration } from '../types/transport';

export interface GMBRouteDirection {
  route_seq: number;
  orig_en: string;
  orig_tc: string;
  dest_en: string;
  dest_tc: string;
}

export interface GMBRouteItem {
  route_id: number;
  description_en: string;
  description_tc: string;
  directions: GMBRouteDirection[];
}

export interface GMBRouteStopItem {
  stop_seq: number;
  stop_id: number;
  name_en: string;
  name_tc: string;
}

export class GMBClient {
  private static instance: GMBClient;
  private baseURL = 'https://data.etagmb.gov.hk';
  private cachedRegionalRoutes: Map<string, string[]> = new Map();

  public static getInstance(): GMBClient {
    if (!GMBClient.instance) {
      GMBClient.instance = new GMBClient();
    }
    return GMBClient.instance;
  }

  public async fetchRoutes(region: string): Promise<string[]> {
    const reg = region.toUpperCase();
    if (this.cachedRegionalRoutes.has(reg)) {
      return this.cachedRegionalRoutes.get(reg)!;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
      const res = await fetch(`${this.baseURL}/route/${reg}`, {
        signal: controller.signal,
        headers: { Accept: 'application/json', 'User-Agent': 'HKTransportWidget/1.0' },
      });
      if (!res.ok) throw new Error(`Failed to fetch GMB routes for region ${reg}`);
      const json = await res.json();
      const routes: string[] = json.data?.routes || [];
      this.cachedRegionalRoutes.set(reg, routes);
      return routes;
    } finally {
      clearTimeout(timeout);
    }
  }

  public async fetchRouteDetails(region: string, routeCode: string): Promise<GMBRouteItem[]> {
    const reg = region.toUpperCase();
    const encoded = encodeURIComponent(routeCode);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
      const res = await fetch(`${this.baseURL}/route/${reg}/${encoded}`, {
        signal: controller.signal,
        headers: { Accept: 'application/json', 'User-Agent': 'HKTransportWidget/1.0' },
      });
      if (!res.ok) throw new Error(`Failed to fetch GMB route details for ${routeCode}`);
      const json = await res.json();
      return json.data || [];
    } finally {
      clearTimeout(timeout);
    }
  }

  public async fetchRouteStops(routeId: number, routeSeq: number): Promise<GMBRouteStopItem[]> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
      const res = await fetch(`${this.baseURL}/route-stop/${routeId}/${routeSeq}`, {
        signal: controller.signal,
        headers: { Accept: 'application/json', 'User-Agent': 'HKTransportWidget/1.0' },
      });
      if (!res.ok) throw new Error(`Failed to fetch GMB stops for route ${routeId} seq ${routeSeq}`);
      const json = await res.json();
      const stops: GMBRouteStopItem[] = json.data?.route_stops || [];
      return stops.sort((a, b) => a.stop_seq - b.stop_seq);
    } finally {
      clearTimeout(timeout);
    }
  }

  public async fetchArrivals(configuration: SavedTransportConfiguration): Promise<ArrivalSnapshot> {
    const { lineCode, directionCode, stopSequence } = configuration;
    if (!lineCode) {
      throw new Error('Missing GMB route_id in configuration');
    }

    const routeId = parseInt(lineCode, 10);
    const routeSeq = parseInt(directionCode, 10) || 1;
    const stopSeq = stopSequence || 1;

    const url = `${this.baseURL}/eta/route-stop/${routeId}/${routeSeq}/${stopSeq}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
      const res = await fetch(url, {
        signal: controller.signal,
        headers: { Accept: 'application/json', 'User-Agent': 'HKTransportWidget/1.0' },
      });
      if (!res.ok) throw new Error(`Server responded with ${res.status}`);
      const json = await res.json();
      return this.parseGMBETA(json, configuration);
    } finally {
      clearTimeout(timeout);
    }
  }

  public parseGMBETA(root: any, configuration: SavedTransportConfiguration): ArrivalSnapshot {
    const { id, displayDirectionEN, displayDirectionTC } = configuration;
    const now = new Date();
    const arrivalItems: ArrivalItem[] = [];

    const etaList: any[] = root.data?.eta || [];
    for (const eta of etaList) {
      let arrivalDate: Date | null = null;
      if (eta.timestamp && eta.timestamp.trim() !== '') {
        arrivalDate = new Date(eta.timestamp);
      }
      if ((!arrivalDate || isNaN(arrivalDate.getTime())) && eta.diff != null) {
        arrivalDate = new Date(now.getTime() + eta.diff * 60000);
      }
      if (!arrivalDate || isNaN(arrivalDate.getTime())) continue;

      arrivalItems.push({
        id: `gmb-${configuration.lineCode}-${eta.eta_seq || ''}-${arrivalDate.getTime()}`,
        predictedArrivalAt: arrivalDate.toISOString(),
        destinationNameEN: displayDirectionEN || '',
        destinationNameTC: displayDirectionTC || '',
        remarksEN: eta.remarks_en?.trim() ? eta.remarks_en : undefined,
        remarksTC: eta.remarks_tc?.trim() ? eta.remarks_tc : undefined,
        sequence: eta.eta_seq,
      });
    }

    arrivalItems.sort(
      (a, b) => new Date(a.predictedArrivalAt).getTime() - new Date(b.predictedArrivalAt).getTime()
    );

    const status: ArrivalStatus = arrivalItems.length === 0 ? 'noPrediction' : 'ok';

    return {
      configurationId: id,
      fetchedAt: now.toISOString(),
      providerGeneratedAt: now.toISOString(),
      arrivals: arrivalItems,
      status,
    };
  }
}

