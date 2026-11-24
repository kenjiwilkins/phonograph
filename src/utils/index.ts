import type { Image, Playlist } from '@/types';

export const isDev = import.meta.env.MODE === 'development';

/**
 * Returns a random index in [0, total). When `exclude` is given and there is more than one
 * choice, that index is never returned, so the same item isn't picked twice in a row.
 */
export function randomOffset(total: number, exclude: number | null = null): number {
  if (exclude === null || exclude < 0 || exclude >= total || total <= 1) {
    return Math.floor(Math.random() * total);
  }
  const offset = Math.floor(Math.random() * (total - 1));
  return offset >= exclude ? offset + 1 : offset;
}

/**
 * Returns the smallest image that still covers `displaySize` CSS pixels on this screen.
 * Spotify returns covers at 640, 300 and 64px; lists show them at 64px, so loading the
 * largest one wastes ~10x the bandwidth.
 */
export function getImageUrl(
  images: Image[] | null | undefined,
  displaySize: number,
  pixelRatio: number = (typeof window !== 'undefined' && window.devicePixelRatio) || 1
): string | undefined {
  if (!images?.length) return undefined;
  const sized = images.filter((image) => typeof image.width === 'number');
  if (sized.length === 0) return images[0].url;
  const bySize = [...sized].sort((a, b) => (a.width as number) - (b.width as number));
  const target = displaySize * pixelRatio;
  return (bySize.find((image) => (image.width as number) >= target) ?? bySize[bySize.length - 1])
    .url;
}

const apiBaseUrl = 'https://api.spotify.com/v1';

/**
 * Where to load a playlist's contents from, or null when Spotify doesn't expose them
 * (since February 2026, only for playlists the user owns or collaborates on).
 * The URL is built from the id because the new `items` field isn't documented to carry an href.
 */
export function getPlaylistItems(playlist: Playlist): { url: string; total: number } | null {
  const contents = playlist.items ?? playlist.tracks;
  if (!contents) return null;
  return {
    url: `${apiBaseUrl}/playlists/${playlist.id}/items`,
    total: contents.total
  };
}
