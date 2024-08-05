import { render } from '@testing-library/vue';
import { beforeAll, describe, test, expect } from 'vitest';
import ContentPlaceholder from '@/components/ContentPlaceholder.vue';
import {
  contentPlaceholderHeight,
  footerHeight,
  headerHeight,
  playerControllerHeight
} from '@/constants';
const innerHeight = 400;

describe('ContentPlaceholder', () => {
  // override window.innerHeight
  beforeAll(() => {
    Object.defineProperty(globalThis, 'window', {
      value: {
        innerHeight
      }
    });
  });
  test('renders correctly', async () => {
    const itemCount = Math.ceil(
      (innerHeight - footerHeight - headerHeight - playerControllerHeight) /
        contentPlaceholderHeight
    );
    const { getByTestId, findByTestId } = render(ContentPlaceholder);
    const placeholder = getByTestId('content-placeholder');
    expect(placeholder).toBeTruthy();
    // await mounted
    for (let i = 1; i <= itemCount; i++) {
      await findByTestId(`placeholder-${i}`);
    }
  });
});
