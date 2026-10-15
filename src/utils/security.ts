import path from 'path';

/**
 * Validates that an external URL is strictly using safe HTTP or HTTPS protocols.
 * Rejects dangerous schemes like file://, cmd://, powershell://, javascript:, etc.
 */
export function isSafeExternalUrl(urlStr: string): boolean {
  if (!urlStr || typeof urlStr !== 'string') return false;
  try {
    const parsed = new URL(urlStr);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

/**
 * Validates and sanitizes snapshot IDs to prevent directory/path traversal.
 * Only alphanumeric, hyphens, and underscores are permitted.
 * Ensures the resolved file path stays strictly within baseDir.
 */
export function getSafeSnapshotPath(baseDir: string, id: string): string | null {
  if (!id || typeof id !== 'string' || !/^[a-zA-Z0-9_\-]+$/.test(id)) {
    return null;
  }
  const resolvedDir = path.resolve(baseDir);
  const targetPath = path.resolve(baseDir, `${id}.json`);
  if (!targetPath.startsWith(resolvedDir + path.sep)) {
    return null;
  }
  return targetPath;
}

