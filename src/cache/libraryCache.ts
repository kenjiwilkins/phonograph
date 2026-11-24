import type { AlbumSummary, TrackSummary } from '@/types';

/**
 * Caches the user's library in localStorage so a reload can render immediately
 * (stale-while-revalidate, #80). Callers validate the cached data with a cheap request:
 *
 * - Saved albums are ordered newest first, so any addition changes the first item and any
 *   removal changes the total. `AlbumsFingerprint` captures both.
 * - A playlist's `snapshot_id` changes whenever its contents change, so cached tracks are only
 *   used for the same snapshot.
 *
 * Entries are per user, expire after 7 days, and are dropped when the session ends.
 */

const prefix = 'phonograph.cache.';
const version = 1;
const maxAgeMs = 7 * 24 * 60 * 60 * 1000;
export const maxCachedPlaylists = 20;

export interface AlbumsFingerprint {
  total: number;
  firstId: string | null;
  firstAddedAt: string | null;
}

export interface AlbumsCacheEntry {
  albums: AlbumSummary[];
  total: number;
  nextUrl: string;
  fingerprint: AlbumsFingerprint;
}

export interface PlaylistTracksCacheEntry {
  snapshotId: string;
  tracks: TrackSummary[];
  total: number;
  nextUrl: string;
}

interface Stored<T> {
  version: number;
  savedAt: number;
  data: T;
}

const albumsKey = (userId: string) => `${prefix}${userId}.albums`;
const playlistKeyPrefix = (userId: string) => `${prefix}${userId}.playlist.`;

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

function isAlbumsEntry(data: unknown): data is AlbumsCacheEntry {
  return (
    isObject(data) &&
    Array.isArray(data.albums) &&
    typeof data.total === 'number' &&
    typeof data.nextUrl === 'string' &&
    isObject(data.fingerprint) &&
    typeof data.fingerprint.total === 'number'
  );
}

function isPlaylistTracksEntry(data: unknown): data is PlaylistTracksCacheEntry {
  return (
    isObject(data) &&
    typeof data.snapshotId === 'string' &&
    Array.isArray(data.tracks) &&
    typeof data.total === 'number' &&
    typeof data.nextUrl === 'string'
  );
}

/** Returns the cached data, or null when it is missing, expired or not in the expected shape. */
function read<T>(key: string, isValid: (data: unknown) => data is T): T | null {
  try {
    const stored: unknown = JSON.parse(localStorage.getItem(key) ?? 'null');
    if (
      !isObject(stored) ||
      stored.version !== version ||
      typeof stored.savedAt !== 'number' ||
      Date.now() - stored.savedAt > maxAgeMs ||
      !isValid(stored.data)
    ) {
      return null;
    }
    return stored.data;
  } catch {
    return null;
  }
}

function write<T>(key: string, data: T) {
  const stored: Stored<T> = { version, savedAt: Date.now(), data };
  try {
    localStorage.setItem(key, JSON.stringify(stored));
  } catch {
    // Storage is full or unavailable: the app works without the cache
    try {
      localStorage.removeItem(key);
    } catch {
      // ignore
    }
  }
}

function keys(startsWith: string): string[] {
  const result: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(startsWith)) result.push(key);
  }
  return result;
}

export function readAlbumsCache(userId: string): AlbumsCacheEntry | null {
  return read(albumsKey(userId), isAlbumsEntry);
}

export function writeAlbumsCache(userId: string, entry: AlbumsCacheEntry) {
  const albums = entry.albums.map(({ id, name, images, artists, external_urls, uri }) => ({
    id,
    name,
    images,
    artists,
    external_urls,
    uri
  }));
  write(albumsKey(userId), { ...entry, albums });
}

export function readPlaylistTracksCache(
  userId: string,
  playlistId: string,
  snapshotId: string | undefined
): PlaylistTracksCacheEntry | null {
  if (!snapshotId) return null;
  const entry = read(playlistKeyPrefix(userId) + playlistId, isPlaylistTracksEntry);
  return entry?.snapshotId === snapshotId ? entry : null;
}

export function writePlaylistTracksCache(
  userId: string,
  playlistId: string,
  entry: PlaylistTracksCacheEntry
) {
  write(playlistKeyPrefix(userId) + playlistId, entry);
  // Keep the cache bounded: drop the least recently saved playlists
  const cached = keys(playlistKeyPrefix(userId))
    .map((key) => ({ key, savedAt: savedAtOf(key) }))
    .sort((a, b) => b.savedAt - a.savedAt);
  for (const { key } of cached.slice(maxCachedPlaylists)) localStorage.removeItem(key);
}

function savedAtOf(key: string): number {
  try {
    return (JSON.parse(localStorage.getItem(key) ?? 'null') as Stored<unknown>)?.savedAt ?? 0;
  } catch {
    return 0;
  }
}

/** Removes all cached library data, e.g. when the session ends. */
export function clearLibraryCache() {
  for (const key of keys(prefix)) localStorage.removeItem(key);
}
