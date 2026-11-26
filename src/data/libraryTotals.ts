import { defineStore } from 'pinia';
import { getSavedAlbumsHead, getSavedPlaylistsHead } from '../api';

// The request filling in the totals; reopening the menu waits for it instead of asking again
let inFlightRequest: Promise<void> | null = null;

/**
 * How many albums and playlists the library has, for the account menu. Unlike the list stores
 * this isn't cleared when the tab changes, and `null` (unknown) is distinct from an empty library.
 */
export const useLibraryTotalsStore = defineStore('libraryTotals', {
  state: () => ({
    albums: null as number | null,
    playlists: null as number | null
  }),
  actions: {
    setAlbums(total: number) {
      this.albums = total;
    },
    setPlaylists(total: number) {
      this.playlists = total;
    },
    /** Fetches only the totals that aren't known yet; a failed one is tried again next time. */
    fetchMissing(): Promise<void> {
      if (inFlightRequest) return inFlightRequest;
      const fetchTotal = async (
        head: () => Promise<{ total: number }>,
        set: (total: number) => void
      ) => {
        try {
          set((await head()).total);
        } catch (error) {
          console.error(error);
        }
      };
      inFlightRequest = Promise.all([
        this.albums === null ? fetchTotal(getSavedAlbumsHead, this.setAlbums) : undefined,
        this.playlists === null ? fetchTotal(getSavedPlaylistsHead, this.setPlaylists) : undefined
      ]).then(() => {
        inFlightRequest = null;
      });
      return inFlightRequest;
    }
  }
});
