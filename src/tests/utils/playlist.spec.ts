import { describe, test, expect } from 'vitest';
import { getPlaylistItems } from '@/utils';
import { generatePlaylist, toNewPlaylistShape } from '../helpers';

describe('getPlaylistItems (#131)', () => {
  test('reads the February 2026 `items` field and builds the /items endpoint', () => {
    const playlist = toNewPlaylistShape({ ...generatePlaylist(), id: 'abc' }, { total: 12 });
    expect(getPlaylistItems(playlist)).toEqual({
      url: 'https://api.spotify.com/v1/playlists/abc/items',
      total: 12
    });
  });

  test('still supports the legacy `tracks` field', () => {
    const playlist = { ...generatePlaylist(), id: 'def' };
    expect(getPlaylistItems(playlist)).toEqual({
      url: 'https://api.spotify.com/v1/playlists/def/items',
      total: playlist.tracks!.total
    });
  });

  test('returns null when the contents are not available (playlist not owned by the user)', () => {
    const playlist = toNewPlaylistShape(generatePlaylist());
    expect(getPlaylistItems(playlist)).toBeNull();
  });
});
