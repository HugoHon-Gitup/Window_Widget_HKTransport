import { describe, it, expect } from 'vitest';
import {
  cleanBusStopCode,
  formatCountdown,
  getMinutesRemaining,
  isArrivalUrgent,
  ArrivalItem,
} from '../src/types/transport';

describe('Arrival Calculations & Helpers', () => {
  it('cleans technical stop codes while preserving valid parenthesized locations', () => {
    expect(cleanBusStopCode('Central Market (WT967)')).toBe('Central Market');
    expect(cleanBusStopCode('Causeway Bay (KC717)')).toBe('Causeway Bay');
    expect(cleanBusStopCode('中環 (交易廣場)')).toBe('中環 (交易廣場)');
    expect(cleanBusStopCode('旺角 (001234)')).toBe('旺角');
  });

  it('calculates minutes remaining and countdown strings', () => {
    const now = new Date('2026-10-15T11:30:00Z');
    const futureItem: ArrivalItem = {
      id: 'test-1',
      predictedArrivalAt: '2026-10-15T11:37:00Z',
      destinationNameEN: 'Central',
      destinationNameTC: '中環',
    };

    expect(getMinutesRemaining(futureItem, now)).toBe(7);
    expect(formatCountdown(futureItem, now, true)).toBe('7 分鐘');
    expect(formatCountdown(futureItem, now, false)).toBe('7 min');
    expect(isArrivalUrgent(futureItem, now)).toBe(false);

    const urgentItem: ArrivalItem = {
      id: 'test-2',
      predictedArrivalAt: '2026-10-15T11:33:00Z',
      destinationNameEN: 'Central',
      destinationNameTC: '中環',
    };

    expect(getMinutesRemaining(urgentItem, now)).toBe(3);
    expect(isArrivalUrgent(urgentItem, now)).toBe(true);

    const arrivingItem: ArrivalItem = {
      id: 'test-3',
      predictedArrivalAt: '2026-10-15T11:30:10Z',
      destinationNameEN: 'Central',
      destinationNameTC: '中環',
    };

    expect(formatCountdown(arrivingItem, now, true)).toBe('即將到達');
    expect(formatCountdown(arrivingItem, now, false)).toBe('Arriving');
  });
});

