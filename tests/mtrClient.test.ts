import { describe, it, expect } from 'vitest';
import { MTRClient } from '../src/services/mtrClient';
import { SavedTransportConfiguration } from '../src/types/transport';

describe('MTRClient', () => {
  const client = MTRClient.getInstance();

  const sampleConfig: SavedTransportConfiguration = {
    id: 'test-mtr-1',
    schemaVersion: 1,
    nickname: 'To Kennedy Town',
    operatorType: 'mtr',
    lineCode: 'ISL',
    stationCode: 'CAB',
    directionCode: 'DOWN',
    displayLineOrRoute: 'Island Line',
    displayBoardingStopEN: 'Causeway Bay',
    displayBoardingStopTC: '銅鑼灣',
    displayDirectionEN: 'Towards Kennedy Town',
    displayDirectionTC: '往 堅尼地城',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  it('parses valid MTR schedule correctly', () => {
    const mockData = {
      status: 1,
      message: 'successful',
      sys_time: '2026-10-15 11:30:00',
      data: {
        'ISL-CAB': {
          curr_time: '2026-10-15 11:30:00',
          DOWN: [
            {
              seq: '1',
              dest: 'KET',
              plat: '2',
              time: '2026-10-15 11:33:00',
            },
            {
              seq: '2',
              dest: 'SHW',
              plat: '2',
              time: '2026-10-15 11:38:00',
            },
          ],
        },
      },
    };

    const snapshot = client.parseMTRSchedule(mockData, sampleConfig);
    expect(snapshot.status).toBe('ok');
    expect(snapshot.arrivals.length).toBe(2);
    expect(snapshot.arrivals[0].destinationNameTC).toBe('堅尼地城');
    expect(snapshot.arrivals[0].platform).toBe('2');
    expect(snapshot.arrivals[1].destinationNameTC).toBe('上環');
  });

  it('filters by destinationFilter when specified', () => {
    const branchConfig: SavedTransportConfiguration = {
      ...sampleConfig,
      destinationFilter: 'KET',
    };

    const mockData = {
      status: 1,
      sys_time: '2026-10-15 11:30:00',
      data: {
        'ISL-CAB': {
          DOWN: [
            { seq: '1', dest: 'KET', plat: '2', time: '2026-10-15 11:33:00' },
            { seq: '2', dest: 'SHW', plat: '2', time: '2026-10-15 11:38:00' },
          ],
        },
      },
    };

    const snapshot = client.parseMTRSchedule(mockData, branchConfig);
    expect(snapshot.arrivals.length).toBe(1);
    expect(snapshot.arrivals[0].destinationCode).toBe('KET');
  });

  it('handles service alerts gracefully', () => {
    const alertData = {
      status: 0,
      message: 'Service on Island Line is delayed by 10 minutes.',
      data: {},
    };

    const snapshot = client.parseMTRSchedule(alertData, sampleConfig);
    expect(snapshot.status).toBe('providerAlert');
    expect(snapshot.alertMessageEN).toContain('delayed');
    expect(snapshot.arrivals.length).toBe(0);
  });
});

