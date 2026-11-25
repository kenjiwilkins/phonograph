import { render } from '@testing-library/vue';
import { describe, expect, test } from 'vitest';
import SpotifyAttribution from '@/components/SpotifyAttribution.vue';

describe('SpotifyAttribution (#190)', () => {
  test('shows the Spotify logo and a link back to Spotify', () => {
    const { getByTestId, getByAltText, getByText } = render(SpotifyAttribution);
    const link = getByTestId('spotify-attribution').querySelector('a');
    expect(link?.getAttribute('href')).toBe('https://open.spotify.com');
    expect(link?.getAttribute('rel')).toContain('noopener');
    expect(getByAltText('Spotify')).toBeTruthy();
    expect(getByText('Content from Spotify')).toBeTruthy();
  });
});
