import { ArrivalSnapshot, SavedTransportConfiguration } from '../types/transport';
import { MTRClient } from './mtrClient';
import { KMBClient } from './kmbClient';
import { CitybusClient } from './citybusClient';
import { GMBClient } from './gmbClient';
import { StorageManager } from './storageManager';
import { isSnapshotStale } from '../types/transport';

export class TransportManager {
  private static instance: TransportManager;
  private fetchTimestamps: Map<string, number> = new Map();

  public static getInstance(): TransportManager {
    if (!TransportManager.instance) {
      TransportManager.instance = new TransportManager();
    }
    return TransportManager.instance;
  }

  public async fetchArrivals(
    configuration: SavedTransportConfiguration,
    force: boolean = false,
    isZH: boolean = true
  ): Promise<ArrivalSnapshot> {
    const storage = StorageManager.getInstance();
    const now = Date.now();
    const lastFetch = this.fetchTimestamps.get(configuration.id) || 0;

    // 5-second cooldown check to avoid rate-limiting
    if (!force && now - lastFetch < 5000) {
      const cached = storage.loadSnapshot(configuration.id);
      if (cached && cached.arrivals.length > 0) {
        return cached;
      }
    }

    try {
      let snapshot: ArrivalSnapshot;
      switch (configuration.operatorType) {
        case 'mtr':
          snapshot = await MTRClient.getInstance().fetchArrivals(configuration, isZH);
          break;
        case 'kmb':
          snapshot = await KMBClient.getInstance().fetchArrivals(configuration);
          break;
        case 'citybus':
          snapshot = await CitybusClient.getInstance().fetchArrivals(configuration);
          break;
        case 'gmb':
          snapshot = await GMBClient.getInstance().fetchArrivals(configuration);
          break;
        default:
          throw new Error(`Unsupported operator: ${configuration.operatorType}`);
      }

      this.fetchTimestamps.set(configuration.id, Date.now());
      storage.saveSnapshot(snapshot);
      return snapshot;
    } catch (err) {
      console.warn(`[TransportManager] Fetch failed for ${configuration.id}:`, err);

      const cached = storage.loadSnapshot(configuration.id);
      if (cached) {
        const isGenuinelyStale = isSnapshotStale(cached, new Date(), 300); // 5 minutes
        const hasEffectiveArrivals = cached.arrivals.some(
          (a) => new Date(a.predictedArrivalAt).getTime() > Date.now() - 60000
        );

        // If cache is still relatively fresh (< 5m) and has upcoming arrivals, return cached cleanly
        if (!isGenuinelyStale && hasEffectiveArrivals) {
          return cached;
        }

        const errorSnapshot: ArrivalSnapshot = {
          configurationId: configuration.id,
          fetchedAt: cached.fetchedAt,
          providerGeneratedAt: cached.providerGeneratedAt,
          arrivals: cached.arrivals,
          status: 'offline',
          alertMessageEN: isGenuinelyStale ? 'Offline: Showing cached data.' : undefined,
          alertMessageTC: isGenuinelyStale ? '離線：顯示快取資料。' : undefined,
        };

        storage.saveSnapshot(errorSnapshot);
        return errorSnapshot;
      }

      throw err;
    }
  }
}

