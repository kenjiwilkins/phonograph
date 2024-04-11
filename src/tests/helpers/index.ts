import type { Album, Artist, Track, Playlist } from '@/types';
import { faker } from '@faker-js/faker';

export function generatePlaylist(): Playlist {
  return {
    id: faker.string.uuid(),
    name: faker.music.songName(),
    uri: faker.internet.url(),
    images: [
      {
        height: 640,
        url: faker.image.url(),
        width: 640
      }
    ],
    external_urls: {
      spotify: faker.internet.url()
    },
    owner: {
      display_name: faker.person.fullName(),
      external_urls: {
        spotify: faker.internet.url()
      },
      href: faker.internet.url(),
      id: faker.string.uuid(),
      type: 'user',
      uri: faker.internet.url()
    },
    description: faker.lorem.sentence(),
    public: faker.datatype.boolean(),
    tracks: {
      href: faker.internet.url(),
      total: faker.number.int(100)
    }
  };
}

export function generatePlaylists(length: number): Playlist[] {
  return Array.from({ length }, () => generatePlaylist());
}

export function generateAlbum(): Album {
  const randomNumber = faker.number.int(10);
  return {
    total_tracks: randomNumber,
    id: faker.string.uuid(),
    images: [
      {
        height: 640,
        url: faker.image.url(),
        width: 640
      }
    ],
    name: faker.music.songName(),
    external_urls: {
      spotify: faker.internet.url()
    },
    release_date: faker.date.recent().toISOString(),
    release_date_precision: 'day',
    type: 'album',
    uri: faker.internet.url(),
    copyrights: [
      {
        text: faker.lorem.sentence(),
        type: 'C'
      }
    ],
    genres: [faker.music.genre()],
    label: faker.company.name(),
    artists: [generateArtist()],
    tracks: {
      items: Array.from({ length: randomNumber }, () => generateTrack())
    }
  };
}

export function generateAlbums(length: number): Album[] {
  return Array.from({ length }, () => generateAlbum());
}

function generateEmptyAlbum(): Album {
  return {
    total_tracks: 0,
    id: faker.string.uuid(),
    images: [
      {
        height: 640,
        url: faker.image.url(),
        width: 640
      }
    ],
    name: faker.music.songName(),
    external_urls: {
      spotify: faker.internet.url()
    },
    release_date: faker.date.recent().toISOString(),
    release_date_precision: 'day',
    type: 'album',
    uri: faker.internet.url(),
    artists: [],
    tracks: {
      items: []
    },
    copyrights: [],
    genres: [],
    label: ''
  };
}

export function generateTrack(): Track {
  return {
    id: faker.string.uuid(),
    name: faker.music.songName(),
    type: 'track',
    uri: faker.internet.url(),
    duration_ms: faker.number.int(1000),
    explicit: faker.datatype.boolean(),
    album: generateEmptyAlbum(),
    artists: [generateArtist()],
    external_urls: {
      spotify: faker.internet.url()
    }
  };
}

function generateArtist(): Artist {
  return {
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    type: 'artist',
    uri: faker.internet.url(),
    genres: [faker.music.genre()],
    images: [
      {
        height: 640,
        url: faker.image.url(),
        width: 640
      }
    ]
  };
}
