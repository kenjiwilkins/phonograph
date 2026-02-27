# Phonograph - Spotify Album Player

Phonograph is a Progressive Web Application (PWA) designed to enhance the Spotify listening experience by helping users rediscover and play full albums from their library. It focuses on the traditional "album-oriented" listening experience in an age of shuffled playlists.

## Project Overview

- **Purpose**: A specialized player for Spotify users to browse and play random albums from their saved albums or playlists.
- **Key Features**:
  - Spotify OAuth2 authentication (PKCE flow).
  - Browse saved albums and playlists.
  - Randomly pick an album to play.
  - Track listing and playback control.
  - PWA support for offline access and installability.
  - Error monitoring with Sentry.

## Tech Stack

- **Framework**: [Vue 3](https://vuejs.org/) (Composition API with `<script setup>`)
- **State Management**: [Pinia](https://pinia.vuejs.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **API Client**: [Axios](https://axios-http.com/)
- **Testing**: [Vitest](https://vitest.dev/), [Vue Test Utils](https://test-utils.vuejs.org/), [Testing Library Vue](https://testing-library.com/docs/vue-testing-library/intro/)
- **PWA**: `vite-plugin-pwa`
- **Monitoring**: [Sentry](https://sentry.io/)

## Getting Started

### Prerequisites

- [Spotify Developer Account](https://developer.spotify.com/) to obtain a Client ID and Secret.
- Node.js and Yarn.

### Installation

```bash
yarn install
```

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_APP_SPOTIFY_CLIENT_ID={your_client_id}
VITE_APP_SPOTIFY_CLIENT_SECRET={your_client_secret}
VITE_APP_DEPLOY_URL=http://localhost:5173/
SENTRY_AUTH_TOKEN={your_sentry_token}
```

### Development

```bash
yarn dev
```

### Build

```bash
# Production build
yarn build

# CI build (with test mode)
yarn build:CI
```

### Testing

```bash
# Run all tests
yarn test

# Run tests with coverage
yarn test:coverage

# Run a specific test file
yarn test src/tests/components/AlbumList.spec.ts
```

### Linting and Formatting

```bash
# Lint code
yarn lint

# Format code with Prettier
yarn prettier
```

## Project Structure

- `src/api/`: Axios instances and Spotify API endpoint definitions.
- `src/auth/`: Implementation of Spotify OAuth2 with PKCE flow.
- `src/components/`: Reusable Vue components (AppBar, AlbumList, TrackList, etc.).
- `src/data/`: Pinia stores for user data, albums, playlists, and UI state.
- `src/tests/`: Comprehensive test suite including unit and component tests.
- `src/utils/`: Utility functions for cookies, formatting, and validation.
- `src/assets/`: Static assets including icons and custom fonts (LINE Seed Sans).

## Architecture & Conventions

### Development Conventions

- **TypeScript**: Strictly typed codebase.
- **Vue Composition API**: Standardized use of `<script setup>`.
- **Surgical Updates**: When modifying components, maintain existing styling patterns (Tailwind).
- **Testing**: Every new feature or bug fix should be accompanied by a Vitest test. Tests are located in `src/tests/`.
- **Git Hooks**: Husky and commitlint are used to enforce conventional commits.

### Key Modules

- **Authentication (`src/auth/index.ts`)**: Manages the OAuth2 flow, token storage in cookies, and automatic token refreshing.
- **API Client (`src/api/index.ts`)**: Centralized Axios instance with request/response interceptors for handling authentication headers and 401 retries.
- **State Management (`src/data/`)**: Modular Pinia stores (e.g., `useUserStore`, `useUserSavedAlbumsStore`) to manage global application state.
- **Styling**: Utility-first approach using Tailwind CSS. Global styles are in `src/index.css`.
