import { createPinia, setActivePinia } from 'pinia';
import {
  useLibraryTotalsStore,
  useTracksStore,
  useUserSavedAlbumsStore,
  useUserSavedPlaylistsStore
} from '@/data';

/**
 * A fresh Pinia for one story. The actions that call the Spotify API are replaced with no-ops,
 * so components show exactly what `seed` puts in the stores (`parameters.seed` of a story).
 */
export function createStoryPinia(seed?: () => void) {
  const pinia = createPinia();
  // Lets the seed functions use the stores outside a component
  setActivePinia(pinia);

  const noop = async () => {};
  useLibraryTotalsStore(pinia).fetchMissing = noop;
  const albums = useUserSavedAlbumsStore(pinia);
  albums.loadUserSavedAlbums = noop;
  albums.fetchUserSavedAlbums = noop;
  albums.fetchNextUserSavedAlbums = noop;
  albums.pickRandomAlbum = noop;
  const playlists = useUserSavedPlaylistsStore(pinia);
  playlists.fetchUserSavedPlaylists = noop;
  playlists.fetchNextUserSavedPlaylists = noop;
  const tracks = useTracksStore(pinia);
  tracks.fetchTracks = noop;
  tracks.fetchNextTracks = noop;
  tracks.pickRandomTrack = noop;

  seed?.();
  return pinia;
}
