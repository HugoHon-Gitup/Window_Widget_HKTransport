import { ArrivalItem, ArrivalSnapshot, ArrivalStatus, SavedTransportConfiguration } from '../types/transport';
import { getMTRStation } from './mtrCatalogue';

export class MTRClient {
  private static instance: MTRClient;
  public static getInstance(): MTRClient {
    if (!MTRClient.instance) {
      MTRClient.instance = new MTRClient();
    }
    return MTRClient.instance;
  }

  public async fetchArrivals(configuration: SavedTransportConfiguration, isZH: boolean = true): Promise<ArrivalSnapshot> {
    const { lineCode, stationCode, directionCode, destinationFilter } = configuration;
    if (!lineCode || !stationCode) {
      throw new Error('Missing MTR line or station code');
    }

    const lang = isZH ? 'TC' : 'EN';
    const url = `https://rt.data.gov.hk/v1/transport/mtr/getSchedule.php?line=${lineCode}&sta=${stationCode}&lang=${lang}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          Accept: 'application/json',
          'User-Agent': 'HKTransportWidget/1.0',
        },
      });

      if (!response.ok) {
        throw new Error(`Server responded with status code ${response.status}`);
      }

      const json = await response.json();
      return this.parseMTRSchedule(json, configuration);
    } finally {
      clearTimeout(timeout);
    }
  }

  public parseMTRSchedule(root: any, configuration: SavedTransportConfiguration): ArrivalSnapshot {
    const { lineCode, stationCode, directionCode, destinationFilter, id } = configuration;

    // Parse provider generated time: "YYYY-MM-DD HH:mm:ss" in HKT
    let providerGeneratedAt: string | undefined;
    if (root.sys_time) {
      providerGeneratedAt = new Date(root.sys_time.replace(' ', 'T') + '+08:00').toISOString();
    }

    const pairKey = `${lineCode}-${stationCode}`;
    const stationData = root?.data?.[pairKey];

    if (!stationData) {
      const alertMsg = root?.message;
      return {
        configurationId: id,
        fetchedAt: new Date().toISOString(),
        providerGeneratedAt,
        arrivals: [],
        status: alertMsg ? 'providerAlert' : 'noPrediction',
        alertMessageEN: alertMsg,
        alertMessageTC: alertMsg,
      };
    }

    const dirKey = (directionCode || 'UP').toUpperCase();
    const rawTrains: any[] = stationData[dirKey] || [];
    const arrivalItems: ArrivalItem[] = [];

    for (const train of rawTrains) {
      if (!train.time) continue;
      // Train time format: "2026-10-15 11:35:00"
      const trainDate = new Date(train.time.replace(' ', 'T') + '+08:00');
      if (isNaN(trainDate.getTime())) continue;

      const destCode = train.dest || '';
      if (destinationFilter && destinationFilter.trim() !== '') {
        if (destCode !== destinationFilter) {
          continue;
        }
      }

      const destStation = getMTRStation(destCode);
      const destNameEN = destStation ? destStation.nameEN : destCode;
      const destNameTC = destStation ? destStation.nameTC : destCode;

      arrivalItems.push({
        id: `mtr-${destCode}-${train.time}-${train.seq || ''}`,
        predictedArrivalAt: trainDate.toISOString(),
        destinationNameEN: destNameEN,
        destinationNameTC: destNameTC,
        destinationCode: destCode,
        platform: train.plat,
        sequence: train.seq ? parseInt(train.seq, 10) : undefined,
      });
    }

    arrivalItems.sort(
      (a, b) => new Date(a.predictedArrivalAt).getTime() - new Date(b.predictedArrivalAt).getTime()
    );

    const status: ArrivalStatus = arrivalItems.length === 0 ? 'noPrediction' : 'ok';

    return {
      configurationId: id,
      fetchedAt: new Date().toISOString(),
      providerGeneratedAt,
      arrivals: arrivalItems,
      status,
    };
  }
}

