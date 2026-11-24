# Changelog

## [1.4.0](https://github.com/kenjiwilkins/phonograph/compare/v1.3.3...v1.4.0) (2026-11-24)


### Features

* show the cached library on reload and revalidate it cheaply ([4d028b6](https://github.com/kenjiwilkins/phonograph/commit/4d028b64e0b97fa7265d1c10ccfdb98cd31acaea))
* show the cached library on reload and revalidate it cheaply ([#149](https://github.com/kenjiwilkins/phonograph/issues/149)) ([974d13b](https://github.com/kenjiwilkins/phonograph/commit/974d13b3ba52211a3e3dd09ba040329a730fc03a))


### Bug Fixes

* **albums:** stop infinite recursion on shuffle and prevent duplicate albums ([e7793a8](https://github.com/kenjiwilkins/phonograph/commit/e7793a8dfb6e9c5a9e057a10327b81f1f6823dc1))
* **albums:** stop infinite recursion on shuffle and prevent duplicate albums ([#140](https://github.com/kenjiwilkins/phonograph/issues/140)) ([c7cb247](https://github.com/kenjiwilkins/phonograph/commit/c7cb247e65c9fa07560e95c671487d7c4433af25))
* **auth:** move tokens out of cookies and add a Content-Security-Policy ([2e32c1b](https://github.com/kenjiwilkins/phonograph/commit/2e32c1b4812fc5fcfc5435683079a002d4b9581b))
* **auth:** move tokens out of cookies and add a Content-Security-Policy ([#148](https://github.com/kenjiwilkins/phonograph/issues/148)) ([fa4610d](https://github.com/kenjiwilkins/phonograph/commit/fa4610da2357c7ca45e50f1821806d54b9a5a273))
* **cache:** drop stale playlist pages and harden cache reads ([702b10c](https://github.com/kenjiwilkins/phonograph/commit/702b10ce33327291aa7e77687d7ea4871d0212cf))
* don't crash on missing images, artists, removed tracks or local files ([1da5499](https://github.com/kenjiwilkins/phonograph/commit/1da5499e3d730b7e81a7ef7b2a50e6b74d30fe4b))
* don't crash on missing images, artists, removed tracks or local files ([#144](https://github.com/kenjiwilkins/phonograph/issues/144)) ([5cd73ce](https://github.com/kenjiwilkins/phonograph/commit/5cd73ce9bec411a503adeb328c61c2cfde5ff60e))
* keep loading pages while the list end stays visible ([08ccf3c](https://github.com/kenjiwilkins/phonograph/commit/08ccf3c2d0e3b03106b52a1dd383baea634ac3eb))
* load more albums and playlists with an IntersectionObserver ([d4f0844](https://github.com/kenjiwilkins/phonograph/commit/d4f0844cd3bf7b087d1d30ad6be8b2ae6b0ee005))
* load more albums and playlists with an IntersectionObserver ([#142](https://github.com/kenjiwilkins/phonograph/issues/142)) ([f2bd5e3](https://github.com/kenjiwilkins/phonograph/commit/f2bd5e3198fb215d0ae4e3b95084a7469e45b8ac))
* **playlists:** adapt to the February 2026 Web API playlist changes ([3693bd4](https://github.com/kenjiwilkins/phonograph/commit/3693bd4e336441e6c8c2b291989462a7b164c0e5))
* **playlists:** adapt to the February 2026 Web API playlist changes ([#145](https://github.com/kenjiwilkins/phonograph/issues/145)) ([1a1b66a](https://github.com/kenjiwilkins/phonograph/commit/1a1b66a43523b0de5928e88ae969f1f5faefd496))


### Performance Improvements

* load smaller cover images and slim down album data ([c2652b1](https://github.com/kenjiwilkins/phonograph/commit/c2652b11c33e3e5966828ce592c5304bc5fb568e))
* load smaller cover images and slim down album data ([#143](https://github.com/kenjiwilkins/phonograph/issues/143)) ([4a25085](https://github.com/kenjiwilkins/phonograph/commit/4a25085fdfd2721578544e554d35b2d8caff3325))
* pick random albums and tracks with a single request ([1c72a7f](https://github.com/kenjiwilkins/phonograph/commit/1c72a7ff59f179b2f33004d5c10eaa6f1b9d4e14))
* pick random albums and tracks with a single request ([#141](https://github.com/kenjiwilkins/phonograph/issues/141)) ([924703f](https://github.com/kenjiwilkins/phonograph/commit/924703fd54429157ec5375a22308a12d8f21b60b))

## [1.3.3](https://github.com/kenjiwilkins/phonograph/compare/v1.3.2...v1.3.3) (2026-11-24)


### Bug Fixes

* **auth:** refresh expiring tokens and retry requests on 401 ([6d9cfc8](https://github.com/kenjiwilkins/phonograph/commit/6d9cfc89bdaacccbe23af1c501a287fa789c4288))
