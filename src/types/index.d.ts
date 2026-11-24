export interface User {
  // country, email, explicit_content, followers and product are no longer returned
  // for Development Mode apps since the February 2026 Web API changes
  country?: string;
  display_name: string;
  email?: string;
  explicit_content?: {
    filter_enabled: boolean;
    filter_locked: boolean;
  };
  external_urls: {
    spotify: string;
  };
  followers?: {
    href: string | null;
    total: number;
  };
  href: string;
  id: string;
  images: Image[];
  product?: string;
  type: string;
  uri: string;
}

export interface UserSavedAlbums {
  href: string;
  total: number;
  limit: number;
  offset: number;
  items: UserSavedAlbumItem[];
}

export interface UserSavedAlbumsItem {
  added_at: string;
  album: Album;
}

export interface UserSavedPlaylists {
  href: string;
  total: number;
  limit: number;
  offset: number;
  items: UserSavedPlaylistsItem[];
}

export interface UserSavedPlaylistsItem {
  added_at: string;
  playlist: Playlist;
}

export interface Device {
  id: string;
  is_active: boolean;
  is_private_session: boolean;
  is_restricted: boolean;
  name: string;
  type: string;
  volume_percent: number;
}

export interface Image {
  // Playlist images can have unknown dimensions
  height: number | null;
  url: string;
  width: number | null;
}

export interface CopyRight {
  text: string;
  type: string;
}

export interface Artist {
  id: string;
  name: string;
  type: string;
  uri: string;
  genres: string[];
  images: Image[];
}

export interface Album {
  total_tracks: number;
  id: string;
  images: Image[];
  name: string;
  external_urls: {
    spotify: string;
  };
  release_date: string;
  release_date_precision: string;
  type: 'album' | 'single';
  uri: string;
  copyrights: CopyRight[];
  genres: string[];
  label: string;
  artists: Artist[];
  tracks: {
    items: Track[];
  };
}

/** The subset of an album kept in the store. Saved album responses also carry tracks etc. */
export type AlbumSummary = Pick<
  Album,
  'id' | 'name' | 'images' | 'artists' | 'external_urls' | 'uri'
>;

export interface Track {
  id: string;
  name: string;
  type: string;
  uri: string;
  duration_ms: number;
  explicit: boolean;
  album: Album;
  artists: Artist[];
  external_urls: {
    spotify: string;
  };
}

export interface TrackResponseItem {
  // February 2026 Web API name; null for content that was removed from Spotify
  item?: Track | null;
  // Legacy name of `item`
  track?: Track | null;
  // Local files have no Spotify id and can't be opened in Spotify
  is_local?: boolean;
}

export interface PlaybackState {
  device: Device;
  repeat_state: string;
  shuffle_state: boolean;
  timestamp: number;
  progress_ms: number;
  is_playing: boolean;
  item: Track;
  currently_playing_type: string;
  actions: {
    interrupting_playback: boolean;
    pausing: boolean;
    resuming: boolean;
    seeking: boolean;
    skipping_next: boolean;
    skipping_prev: boolean;
    toggling_repeat_context: boolean;
    toggling_shuffle: boolean;
    toggling_repeat_track: boolean;
    transferring_playback: boolean;
  };
}

export interface Playlist {
  id: string;
  description: string;
  external_urls: {
    spotify: string;
  };
  images: Image[];
  name: string;
  owner: {
    display_name: string;
    external_urls: {
      spotify: string;
    };
    href: string;
    id: string;
    type: string;
    uri: string;
  };
  public: boolean;
  // February 2026 Web API: playlist contents moved from `tracks` to `items`. `items` is only
  // returned for playlists the user owns or collaborates on. `tracks` is the legacy field.
  items?: {
    href?: string;
    total: number;
  };
  tracks?: {
    href: string;
    total: number;
  };
  uri: string;
}
