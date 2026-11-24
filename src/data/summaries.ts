import { markRaw } from 'vue';
import type { AlbumSummary, TrackSummary } from '@/types';

/**
 * Keep only what the UI uses (API objects also carry track lists, copyrights, etc.) and mark the
 * result raw so Vue doesn't wrap every nested object in a reactive proxy. Small summaries also
 * keep the localStorage cache (#80) well within its quota.
 */
export function toAlbumSummary({ id, name, images, artists, external_urls, uri }: AlbumSummary) {
  return markRaw<AlbumSummary>({ id, name, images, artists, external_urls, uri });
}

export function toTrackSummary({
  id,
  name,
  type,
  uri,
  external_urls,
  artists,
  album
}: TrackSummary) {
  return markRaw<TrackSummary>({
    id,
    name,
    type,
    uri,
    external_urls,
    artists,
    album: toAlbumSummary(album)
  });
}
