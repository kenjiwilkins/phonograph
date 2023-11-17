export interface User {
  country: string;
  display_name: string;
  email: string;
  explicit_content: {
    filter_enabled: boolean;
    filter_locked: boolean;
  };
  external_urls: {
    spotify: string;
  };
  followers: {
    href: string | null;
    total: number;
  };
  href: string;
  id: string;
  images: Image[];
  product: string;
  type: string;
  uri: string;
}

export interface UserSavedAlbums {
  href: string;
  total: number;
  limit: number;
  offset: number;
  items: {
    added_at: string;
    album: Album;
  }[];
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
  height: number;
  url: string;
  width: number;
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
  type: "album" | "single";
  uri: string;
  copyrights: CopyRight[];
  genres: string[];
  label: string;
  artists: Artist[];
  tracks: {
    items: Track[];
  };
}

export interface Track {
  id: string;
  name: string;
  type: string;
  uri: string;
  duration_ms: number;
  explicit: boolean;
  album: Album;
  artists: Artist[];
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
