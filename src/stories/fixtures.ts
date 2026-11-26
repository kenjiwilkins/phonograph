// Fixed data for the stories: screenshots are compared pixel by pixel, so nothing here may be
// random or loaded from the network.
import type { AlbumSummary, Artist, Image, Playlist, TrackSummary, User } from '@/types';

/** A flat square "cover" as an inline SVG */
export function cover(color: string, size = 640): Image {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 8 8">` +
    `<rect width="8" height="8" fill="${color}"/><circle cx="4" cy="4" r="2" fill="#05070b"/></svg>`;
  return {
    url: `data:image/svg+xml,${encodeURIComponent(svg)}`,
    width: size,
    height: size
  };
}

const colors = ['#2f6f8f', '#8f2f5a', '#4f8f2f', '#8f6a2f', '#5a2f8f'];
const link = { spotify: 'https://open.spotify.com' };

function artist(name: string): Artist {
  return { id: name, name, type: 'artist', uri: '', genres: [], images: [] };
}

const albumNames: [string, string][] = [
  ['Midnight Signals', 'The Carrier Waves'],
  ['夜明けのレコード', '蓄音機楽団'],
  ['An Exceptionally Long Album Title That Has To Be Truncated Somewhere', 'Various Artists'],
  ['Static', 'Mono'],
  ['Grid Runner', 'Neon Habit']
];

export const albums: AlbumSummary[] = albumNames.map(([name, artistName], i) => ({
  id: `album-${i}`,
  name,
  images: [cover(colors[i])],
  artists: [artist(artistName)],
  external_urls: link,
  uri: `spotify:album:${i}`
}));

export const tracks: TrackSummary[] = albums.map((album, i) => ({
  id: `track-${i}`,
  name: ['Carrier', '針を落とす', 'Interlude', 'Hiss', 'Run'][i],
  type: 'track',
  uri: `spotify:track:${i}`,
  external_urls: link,
  artists: album.artists,
  album
}));

function playlist(i: number, name: string, total?: number): Playlist {
  return {
    id: `playlist-${i}`,
    name,
    description: '',
    external_urls: link,
    images: i === 1 ? [] : [cover(colors[i])],
    owner: {
      display_name: 'Listener',
      external_urls: link,
      href: '',
      id: 'listener',
      type: 'user',
      uri: ''
    },
    public: false,
    // Without `items` Spotify doesn't expose the contents: the row is locked
    items: total === undefined ? undefined : { total },
    uri: `spotify:playlist:${i}`
  };
}

export const playlists: Playlist[] = [
  playlist(0, 'Late night drive', 42),
  playlist(1, '作業用BGM', 128),
  playlist(2, 'Someone else’s mix')
];

export const user: User = {
  display_name: 'Listener',
  external_urls: link,
  href: '',
  id: 'listener',
  images: [cover('#19e3ff', 64)],
  type: 'user',
  uri: ''
};
