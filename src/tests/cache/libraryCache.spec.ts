import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  readAlbumsCache,
  writeAlbumsCache,
  readPlaylistTracksCache,
  writePlaylistTracksCache,
  clearLibraryCache,
  maxCachedPlaylists
} from '@/cache/libraryCache';
import { generateAlbum, generateTrack } from '../helpers';

const fingerprint = { total: 2, firstId: 'a1', firstAddedAt: '2026-11-01T00:00:00Z' };
const albumsEntry = () => ({
  albums: [generateAlbum(), generateAlbum()],
  total: 2,
  nextUrl: 'https://api.spotify.com/v1/me/albums?offset=50&limit=50',
  fingerprint
});

describe('libraryCache (#80)', () => {
  beforeEach(() => {
    localStorage.clear();
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('saved albums', () => {
    test('round-trips per user', () => {
      const entry = albumsEntry();
      writeAlbumsCache('user-1', entry);

      expect(readAlbumsCache('user-1')).toMatchObject({
        total: 2,
        nextUrl: entry.nextUrl,
        fingerprint
      });
      expect(readAlbumsCache('user-1')?.albums.map((album) => album.id)).toEqual(
        entry.albums.map((album) => album.id)
      );
      expect(readAlbumsCache('user-2')).toBeNull();
    });

    test('expires after 7 days', () => {
      vi.useFakeTimers({ now: new Date('2026-11-01T00:00:00Z') });
      writeAlbumsCache('user-1', albumsEntry());
      vi.setSystemTime(new Date('2026-11-08T00:00:01Z'));
      expect(readAlbumsCache('user-1')).toBeNull();
    });

    test('ignores entries from another cache version or corrupted data', () => {
      writeAlbumsCache('user-1', albumsEntry());
      const key = Object.keys({ ...localStorage })[0];
      const stored = JSON.parse(localStorage.getItem(key)!);
      localStorage.setItem(key, JSON.stringify({ ...stored, version: 0 }));
      expect(readAlbumsCache('user-1')).toBeNull();

      localStorage.setItem(key, '{not json');
      expect(readAlbumsCache('user-1')).toBeNull();
    });

    test('does not throw when storage is full', () => {
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new DOMException('full', 'QuotaExceededError');
      });
      expect(() => writeAlbumsCache('user-1', albumsEntry())).not.toThrow();
    });
  });

  describe('playlist tracks', () => {
    const tracksEntry = (snapshotId: string) => ({
      snapshotId,
      tracks: [generateTrack()],
      total: 10,
      nextUrl: 'https://api.spotify.com/v1/playlists/p1/items?offset=100'
    });

    test('is only used while the playlist snapshot is unchanged', () => {
      writePlaylistTracksCache('user-1', 'p1', tracksEntry('snap-1'));

      expect(readPlaylistTracksCache('user-1', 'p1', 'snap-1')?.tracks).toHaveLength(1);
      expect(readPlaylistTracksCache('user-1', 'p1', 'snap-2')).toBeNull();
      expect(readPlaylistTracksCache('user-1', 'p1', undefined)).toBeNull();
      expect(readPlaylistTracksCache('user-2', 'p1', 'snap-1')).toBeNull();
    });

    test(`keeps at most ${maxCachedPlaylists} playlists, dropping the oldest`, () => {
      vi.useFakeTimers({ now: 0 });
      for (let i = 0; i <= maxCachedPlaylists; i++) {
        vi.setSystemTime(i * 1000);
        writePlaylistTracksCache('user-1', `p${i}`, tracksEntry('snap'));
      }
      expect(readPlaylistTracksCache('user-1', 'p0', 'snap')).toBeNull();
      expect(readPlaylistTracksCache('user-1', `p${maxCachedPlaylists}`, 'snap')).not.toBeNull();
    });
  });

  test('clearLibraryCache removes cached data but leaves other storage alone', () => {
    writeAlbumsCache('user-1', albumsEntry());
    writePlaylistTracksCache('user-1', 'p1', {
      snapshotId: 's',
      tracks: [],
      total: 0,
      nextUrl: ''
    });
    localStorage.setItem('phonograph.refreshToken', 'rt');

    clearLibraryCache();

    expect(readAlbumsCache('user-1')).toBeNull();
    expect(readPlaylistTracksCache('user-1', 'p1', 's')).toBeNull();
    expect(localStorage.getItem('phonograph.refreshToken')).toBe('rt');
  });
});
