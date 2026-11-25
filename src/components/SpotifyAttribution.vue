<template>
  <!-- Spotify Design & Branding Guidelines: metadata and artwork from Spotify must carry the
       Spotify logo and link back to Spotify -->
  <div class="pg-attr" data-testid="spotify-attribution">
    <a
      class="pg-attr__link"
      href="https://open.spotify.com"
      target="_blank"
      rel="noopener noreferrer"
    >
      <img :src="spotifyLogo" alt="Spotify" class="pg-attr__logo" width="80" height="22" />
      <span class="pg-hud-sm pg-attr__text">Content from Spotify</span>
    </a>
  </div>
</template>

<script setup lang="ts">
import spotifyLogo from '@assets/spotify/Spotify_Full_Logo_White.svg';
</script>

<style scoped>
.pg-attr {
  display: flex;
  padding: 8px 16px;
}

.pg-attr__link {
  display: inline-flex;
  min-height: 44px;
  align-items: center;
  /* exclusion zone: half the icon height (~11px at 80px logo width) on every side */
  gap: 12px;
  padding: 0 12px;
  text-decoration: none;
}

/* the logo is never smaller than 70px wide and is shown unaltered */
.pg-attr__logo {
  display: block;
  flex: none;
  width: 80px;
  height: auto;
}

.pg-attr__text {
  color: var(--ink-muted);
}

.pg-attr__link:is(:hover, :focus-visible) .pg-attr__text {
  color: var(--ink);
}
</style>
