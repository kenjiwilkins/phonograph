# Phonograph

Phonograph is a PWA to play album in your library in Spotify.
Since music streaming service got popular, people tends to listen songs in shuffled playlist rather than a whole album from begin to end.
This app aims to help user to pick an album from their liked albums and playlist etc.

## Tech stack

* build - vite
* frontend framework - vue
* state management - pinia
* styling - tailwind
* code formatter - prettier
* unit test - testing-library + vitest
* CI - GitHub Actions

## Development

If you want to run this app in your development environment, please ~~star~~ clone this repository first.
Secondary, you need to create your own spotify developer account and API Client ID and Secret from: [Spotify Developer](https://developer.spotify.com/).
Then please create a `.env` file in the root of the repo and add

```
VITE_APP_SPOTIFY_CLIENT_ID={your client ID}
VITE_APP_SPOTIFY_CLIENT_SECRET={your client secret}
VITE_APP_DEPLOY_URL=localhost:5137
```

### install

```
yarn
```

### run

```
yarn dev
```
