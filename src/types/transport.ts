export type TransportOperator = 'mtr' | 'kmb' | 'citybus' | 'gmb';

export type ArrivalStatus = 
  | 'ok' 
  | 'noPrediction' 
  | 'providerAlert' 
  | 'offline' 
  | 'stale' 
  | 'error';

export interface ArrivalItem {
  id: string;
  predictedArrivalAt: string; // ISO string
  destinationNameEN: string;
  destinationNameTC: string;
  destinationCode?: string;
  platform?: string;
  remarksEN?: string;
  remarksTC?: string;
  sequence?: number;
}

export interface ArrivalSnapshot {
  configurationId: string;
  fetchedAt: string; // ISO string
  providerGeneratedAt?: string;
  arrivals: ArrivalItem[];
  status: ArrivalStatus;
  alertMessageEN?: string;
  alertMessageTC?: string;
}

export interface SavedTransportConfiguration {
  id: string;
  schemaVersion: number;
  nickname: string;
  operatorType: TransportOperator;

  // MTR specific
  lineCode?: string;
  stationCode?: string;
  destinationFilter?: string;

  // Bus specific
  routeNumber?: string;
  stopId?: string;
  stopSequence?: number;
  serviceType?: string;

  // Shared display fields
  directionCode: string;
  displayLineOrRoute: string;
  displayBoardingStopEN: string;
  displayBoardingStopTC: string;
  displayDirectionEN: string;
  displayDirectionTC: string;

  createdAt: string;
  updatedAt: string;
}

export type GlassTheme = 'dark' | 'light' | 'blue' | 'emerald' | 'purple' | 'amber' | 'custom';

export interface AppSettings {
  language: 'zh' | 'en';
  appearance: 'system' | 'light' | 'dark';
  widgetSize: 'medium' | 'small' | 'custom';
  widgetWidth?: number;
  widgetHeight?: number;
  widgetOpacity: number; // 0.2 to 1.0
  glassTheme: GlassTheme;
  customGlassColor?: string; // hex code like '#0f172a'
  alwaysOnTop: boolean;
  refreshIntervalSeconds: number; // e.g. 60
}

export const OPERATOR_METADATA: Record<
  TransportOperator,
  {
    nameEN: string;
    nameTC: string;
    brandColor: string;
    badgeBg: string;
    sfSymbol: 'train' | 'bus';
  }
> = {
  mtr: {
    nameEN: 'MTR',
    nameTC: '港鐵',
    brandColor: '#C41E3A',
    badgeBg: 'bg-[#C41E3A]',
    sfSymbol: 'train',
  },
  kmb: {
    nameEN: 'KMB',
    nameTC: '九巴',
    brandColor: '#E3262E',
    badgeBg: 'bg-[#E3262E]',
    sfSymbol: 'bus',
  },
  citybus: {
    nameEN: 'Citybus',
    nameTC: '城巴',
    brandColor: '#F5B814',
    badgeBg: 'bg-[#F5B814]',
    sfSymbol: 'bus',
  },
  gmb: {
    nameEN: 'Green Minibus',
    nameTC: '專線小巴',
    brandColor: '#0E8C48',
    badgeBg: 'bg-[#0E8C48]',
    sfSymbol: 'bus',
  },
};

// MARK: - Calculations and Formatting Helpers

export function getMinutesRemaining(item: ArrivalItem, now: Date = new Date()): number {
  const target = new Date(item.predictedArrivalAt).getTime();
  const diffMs = target - now.getTime();
  return Math.max(0, Math.round(diffMs / 60000));
}

export function isArrivalExpired(item: ArrivalItem, now: Date = new Date()): boolean {
  const target = new Date(item.predictedArrivalAt).getTime();
  return target - now.getTime() < -60000; // > 1 minute past
}

export function isArrivalUrgent(item: ArrivalItem, now: Date = new Date()): boolean {
  return getMinutesRemaining(item, now) <= 5;
}

export function formatTimeHHMM(dateString: string): string {
  const d = new Date(dateString);
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function formatCountdown(
  item: ArrivalItem,
  now: Date = new Date(),
  isZH: boolean = true
): string {
  const mins = getMinutesRemaining(item, now);
  if (mins <= 0) {
    return isZH ? '即將到達' : 'Arriving';
  }
  return isZH ? `${mins} 分鐘` : `${mins} min`;
}

export function cleanBusStopCode(name: string): string {
  if (!name) return '';
  // Removes trailing parenthesized alphanumeric/dash codes without whitespace, e.g. " (WT967)"
  return name.replace(/\s*\([A-Za-z0-9\-]{2,10}\)\s*$/, '').trim();
}

export function isSnapshotStale(
  snapshot: ArrivalSnapshot,
  now: Date = new Date(),
  thresholdSeconds: number = 180
): boolean {
  const diffSec = (now.getTime() - new Date(snapshot.fetchedAt).getTime()) / 1000;
  return diffSec > thresholdSeconds;
}

export function getFreshnessText(
  snapshot: ArrivalSnapshot,
  now: Date = new Date(),
  isZH: boolean = true
): string {
  const fetched = new Date(snapshot.fetchedAt);
  const diffSec = Math.max(0, Math.floor((now.getTime() - fetched.getTime()) / 1000));
  const minutes = Math.floor(diffSec / 60);
  const timeString = formatTimeHHMM(snapshot.fetchedAt);

  if (minutes < 1) {
    return isZH ? `剛剛更新 (${timeString})` : `Just now (${timeString})`;
  } else if (minutes < 60) {
    return isZH ? `${minutes} 分鐘前更新 (${timeString})` : `Updated ${minutes}m ago (${timeString})`;
  } else {
    return isZH ? `最後更新 ${timeString}` : `Updated at ${timeString}`;
  }
}

