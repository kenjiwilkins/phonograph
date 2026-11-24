import { describe, test, expect } from 'vitest';
import { getImageUrl } from '@/utils';

const spotifyImages = [
  { url: 'large', width: 640, height: 640 },
  { url: 'medium', width: 300, height: 300 },
  { url: 'small', width: 64, height: 64 }
];

describe('getImageUrl (#123)', () => {
  test('picks the smallest image that covers the display size', () => {
    expect(getImageUrl(spotifyImages, 64, 1)).toBe('small');
  });

  test('accounts for the device pixel ratio', () => {
    expect(getImageUrl(spotifyImages, 64, 2)).toBe('medium');
    expect(getImageUrl(spotifyImages, 80, 3)).toBe('medium');
    expect(getImageUrl(spotifyImages, 160, 2)).toBe('large');
  });

  test('falls back to the largest image when none is big enough', () => {
    expect(getImageUrl(spotifyImages, 1000, 1)).toBe('large');
  });

  test('does not depend on the order of the images', () => {
    expect(getImageUrl([...spotifyImages].reverse(), 64, 1)).toBe('small');
  });

  test('uses the first image when sizes are unknown (e.g. playlist mosaics)', () => {
    const images = [
      { url: 'mosaic', width: null, height: null },
      { url: 'other', width: null, height: null }
    ];
    expect(getImageUrl(images as never, 64, 1)).toBe('mosaic');
  });

  test('returns undefined when there are no images', () => {
    expect(getImageUrl([], 64, 1)).toBeUndefined();
    expect(getImageUrl(null, 64, 1)).toBeUndefined();
    expect(getImageUrl(undefined, 64, 1)).toBeUndefined();
  });
});
