import type { Album, Artist, Track } from '@/types';
import { faker } from '@faker-js/faker';

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

function generateTrack(): Track {
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
