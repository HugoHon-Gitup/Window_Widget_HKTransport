import { describe, it, expect } from 'vitest';
import { isSafeExternalUrl, getSafeSnapshotPath } from '../src/utils/security';
import path from 'path';

describe('Security Controls', () => {
  describe('isSafeExternalUrl', () => {
    it('allows valid HTTPS URLs', () => {
      expect(isSafeExternalUrl('https://data.gov.hk')).toBe(true);
      expect(isSafeExternalUrl('https://rt.data.gov.hk/v1/transport/mtr/getSchedule.php')).toBe(true);
      expect(isSafeExternalUrl('https://www.google.com/search?q=mtr')).toBe(true);
    });

    it('allows valid HTTP URLs', () => {
      expect(isSafeExternalUrl('http://example.com')).toBe(true);
    });

    it('strictly blocks dangerous protocols like file, cmd, powershell, javascript', () => {
      expect(isSafeExternalUrl('file:///C:/Windows/System32/cmd.exe')).toBe(false);
      expect(isSafeExternalUrl('powershell.exe -enc ...')).toBe(false);
      expect(isSafeExternalUrl('javascript:alert(1)')).toBe(false);
      expect(isSafeExternalUrl('data:text/html,<script>alert(1)</script>')).toBe(false);
      expect(isSafeExternalUrl('ms-settings:windowsupdate')).toBe(false);
      expect(isSafeExternalUrl('\\\\evil-share\\malware.exe')).toBe(false);
    });

    it('handles empty or malformed inputs gracefully', () => {
      expect(isSafeExternalUrl('')).toBe(false);
      expect(isSafeExternalUrl(null as any)).toBe(false);
      expect(isSafeExternalUrl('not a url')).toBe(false);
    });
  });

  describe('getSafeSnapshotPath', () => {
    const baseDir = path.resolve('C:/Users/test/AppData/HKTransportWidget/snapshots');

    it('allows valid alphanumeric and hyphenated snapshot IDs', () => {
      const result = getSafeSnapshotPath(baseDir, 'mtr-ISL-CEN-UP');
      expect(result).toBe(path.join(baseDir, 'mtr-ISL-CEN-UP.json'));
    });

    it('blocks directory traversal attempts', () => {
      expect(getSafeSnapshotPath(baseDir, '../evil')).toBeNull();
      expect(getSafeSnapshotPath(baseDir, '..\\evil')).toBeNull();
      expect(getSafeSnapshotPath(baseDir, '../../Windows/System32/calc')).toBeNull();
      expect(getSafeSnapshotPath(baseDir, 'route/subfolder')).toBeNull();
    });

    it('blocks special injection characters', () => {
      expect(getSafeSnapshotPath(baseDir, 'route;rm -rf')).toBeNull();
      expect(getSafeSnapshotPath(baseDir, 'route*')).toBeNull();
      expect(getSafeSnapshotPath(baseDir, 'route?test=1')).toBeNull();
    });
  });
});

