import { render } from '@testing-library/vue';
import { describe, test, expect } from 'vitest';
import ContentImage from '@/components/ContentImage.vue';
import { faker } from '@faker-js/faker';
import { flashPromise } from '../utils';

describe('ContentImage', () => {
  test('renders correctly', async () => {
    const alt = faker.music.songName();
    const { getByTestId, container, queryByTestId } = render(ContentImage, {
      props: {
        src: faker.image.url(),
        alt: alt
      }
    });
    const img = getByTestId(`content-image-${alt}`);
    expect(img).toBeTruthy();
    container.querySelector('img')?.dispatchEvent(new Event('load'));
    await flashPromise();
    expect(queryByTestId(`content-image-placeholder-${alt}`)).not.toBeTruthy();
  });
  test('error handling', async () => {
    const alt = faker.music.songName();
    const { getByTestId, container, queryByTestId } = render(ContentImage, {
      props: {
        src: faker.lorem.word(),
        alt: alt
      }
    });
    const img = getByTestId(`content-image-${alt}`);
    expect(img).toBeTruthy();
    container.querySelector('img')?.dispatchEvent(new Event('error'));
    await flashPromise();
    expect(queryByTestId(`content-image-placeholder-${alt}`)).toBeTruthy();
  });
});
