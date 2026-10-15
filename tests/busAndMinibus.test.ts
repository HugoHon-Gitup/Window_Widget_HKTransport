import { describe, it, expect } from 'vitest';
import { KMBClient } from '../src/services/kmbClient';
import { CitybusClient } from '../src/services/citybusClient';
import { GMBClient } from '../src/services/gmbClient';
import { SavedTransportConfiguration } from '../src/types/transport';

describe('KMB, Citybus & GMB Parsers', () => {
  it('parses KMB ETA correctly with sequence matching', () => {
    const config: SavedTransportConfiguration = {
      id: 'kmb-1',
      schemaVersion: 1,
      nickname: 'Work Bus',
      operatorType: 'kmb',
      routeNumber: '1A',
      stopId: '001234',
      stopSequence: 5,
      directionCode: 'O',
      displayLineOrRoute: '1A',
      displayBoardingStopEN: 'Nathan Road',
      displayBoardingStopTC: '彌敦道',
      displayDirectionEN: 'Towards Sau Mau Ping',
      displayDirectionTC: '往 秀茂坪',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const mockResponse = {
      type: 'ETA',
      version: '1.0',
      generated_timestamp: '2026-10-15T11:30:00+08:00',
      data: [
        {
          co: 'KMB',
          route: '1A',
          dir: 'O',
          service_type: 1,
          seq: 5,
          dest_tc: '中秀茂坪',
          dest_en: 'Sau Mau Ping (Central)',
          eta_seq: 1,
          eta: '2026-10-15T11:35:00+08:00',
          rmk_tc: '原定班次',
          rmk_en: 'Scheduled',
        },
        {
          co: 'KMB',
          route: '1A',
          dir: 'O',
          service_type: 1,
          seq: 5,
          dest_tc: '中秀茂坪',
          dest_en: 'Sau Mau Ping (Central)',
          eta_seq: 2,
          eta: '2026-10-15T11:47:00+08:00',
        },
      ],
    };

    const snapshot = KMBClient.getInstance().parseKMBETA(mockResponse, config);
    expect(snapshot.status).toBe('ok');
    expect(snapshot.arrivals.length).toBe(2);
    expect(snapshot.arrivals[0].destinationNameTC).toBe('中秀茂坪');
    expect(snapshot.arrivals[0].remarksEN).toBe('Scheduled');
  });

  it('parses KMB ETA with string vs numeric sequence types', () => {
    const config: SavedTransportConfiguration = {
      id: 'kmb-960x',
      schemaVersion: 1,
      nickname: '960X Home',
      operatorType: 'kmb',
      routeNumber: '960X',
      stopId: '5FCE752FBBAB3B14',
      stopSequence: 3,
      directionCode: 'O',
      displayLineOrRoute: '960X',
      displayBoardingStopEN: 'Model Housing Estate',
      displayBoardingStopTC: '模範邨',
      displayDirectionEN: 'Towards Hung Shui Kiu',
      displayDirectionTC: '往 洪水橋',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const mockResponseWithStringSeq = {
      type: 'ETA',
      version: '1.0',
      generated_timestamp: '2026-10-15T15:30:00+08:00',
      data: [
        {
          co: 'KMB',
          route: '960X',
          dir: 'O',
          service_type: 1,
          seq: '3', // string from API
          dest_tc: '洪水橋',
          dest_en: 'Hung Shui Kiu',
          eta_seq: 1,
          eta: '2026-10-15T15:40:00+08:00',
        },
      ],
    };

    const snapshot = KMBClient.getInstance().parseKMBETA(mockResponseWithStringSeq, config);
    expect(snapshot.status).toBe('ok');
    expect(snapshot.arrivals.length).toBe(1);
    expect(snapshot.arrivals[0].destinationNameTC).toBe('洪水橋');
  });

  it('parses Citybus ETA correctly', () => {
    const config: SavedTransportConfiguration = {
      id: 'ctb-1',
      schemaVersion: 1,
      nickname: 'CTB 788',
      operatorType: 'citybus',
      routeNumber: '788',
      stopId: '001500',
      stopSequence: 1,
      directionCode: 'O',
      displayLineOrRoute: '788',
      displayBoardingStopEN: 'Siu Sai Wan',
      displayBoardingStopTC: '小西灣',
      displayDirectionEN: 'Towards Central',
      displayDirectionTC: '往 中環',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const mockResponse = {
      type: 'CitybusETA',
      generated_timestamp: '2026-10-15T11:30:00+08:00',
      data: [
        {
          co: 'CTB',
          route: '788',
          dir: 'O',
          seq: 1,
          stop: '001500',
          dest_tc: '中環 (港澳碼頭)',
          dest_en: 'Central (Macau Ferry)',
          eta: '2026-10-15T11:36:00+08:00',
          rmk_tc: '',
          rmk_en: '',
        },
      ],
    };

    const snapshot = CitybusClient.getInstance().parseCitybusETA(mockResponse, config);
    expect(snapshot.status).toBe('ok');
    expect(snapshot.arrivals.length).toBe(1);
    expect(snapshot.arrivals[0].destinationNameTC).toBe('中環 (港澳碼頭)');
  });

  it('parses Green Minibus ETA with diff minutes fallback', () => {
    const config: SavedTransportConfiguration = {
      id: 'gmb-1',
      schemaVersion: 1,
      nickname: 'Minibus 40M',
      operatorType: 'gmb',
      lineCode: '2001',
      directionCode: '1',
      stopSequence: 3,
      displayLineOrRoute: '40M',
      displayBoardingStopEN: 'Stanley Market',
      displayBoardingStopTC: '赤柱市集',
      displayDirectionEN: 'Towards Ocean Park',
      displayDirectionTC: '往 海洋公園',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const mockResponse = {
      data: {
        eta: [
          {
            eta_seq: 1,
            diff: 4,
            remarks_tc: '即將到達',
            remarks_en: 'Arriving',
          },
        ],
      },
    };

    const snapshot = GMBClient.getInstance().parseGMBETA(mockResponse, config);
    expect(snapshot.status).toBe('ok');
    expect(snapshot.arrivals.length).toBe(1);
    expect(snapshot.arrivals[0].remarksTC).toBe('即將到達');
  });
});

