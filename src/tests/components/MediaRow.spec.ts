import { render, fireEvent } from '@testing-library/vue';
import { describe, test, expect, vi } from 'vitest';
import MediaRow from '@/components/MediaRow.vue';

describe('MediaRow', () => {
  test('renders a keyboard-reachable button with title, meta and a padded index', () => {
    const { getByRole } = render(MediaRow, {
      props: {
        title: '夜行列車',
        meta: '星野 玲',
        index: 41,
        imageSrc: 'https://example.com/a.jpg'
      }
    });
    const row = getByRole('button');
    expect(row.getAttribute('type')).toBe('button');
    expect(row.textContent).toContain('夜行列車');
    expect(row.textContent).toContain('星野 玲');
    expect(row.textContent).toContain('#0042');
    expect(row.querySelector('img')?.getAttribute('alt')).toBe('夜行列車');
    expect(row.hasAttribute('aria-current')).toBe(false);
    expect(row.hasAttribute('aria-disabled')).toBe(false);
  });

  test('passes test ids to the image, title and meta', () => {
    const { getByTestId } = render(MediaRow, {
      props: {
        title: 'Signal / Noise',
        meta: 'Vera Okonkwo',
        imageSrc: 'https://example.com/a.jpg',
        imageTestId: 'img',
        titleTestId: 'name',
        metaTestId: 'artist'
      }
    });
    expect(getByTestId('img').tagName).toBe('IMG');
    expect(getByTestId('name').textContent).toBe('Signal / Noise');
    expect(getByTestId('artist').textContent).toBe('Vera Okonkwo');
  });

  test('shows the placeholder when there is no image', () => {
    const { getByRole } = render(MediaRow, { props: { title: 'Low Orbit', imageTestId: 'img' } });
    expect(getByRole('button').querySelector('img')).toBeNull();
  });

  test('current marks the row and prefixes the index', () => {
    const { getByRole } = render(MediaRow, {
      props: { title: 'Low Orbit', index: 0, current: true }
    });
    const row = getByRole('button');
    expect(row.getAttribute('aria-current')).toBe('true');
    expect(row.textContent).toContain('▶');
    expect(row.textContent).toContain('#0001');
  });

  test('disabled shows LOCKED instead of the index', () => {
    const { getByRole } = render(MediaRow, {
      props: { title: 'Shared', index: 3, disabled: true }
    });
    const row = getByRole('button');
    expect(row.getAttribute('aria-disabled')).toBe('true');
    expect(row.textContent).toContain('Locked');
    expect(row.textContent).not.toContain('#0004');
  });

  test('emits clicks to the parent', async () => {
    const onClick = vi.fn();
    const { getByRole } = render(MediaRow, { props: { title: 'Low Orbit' }, attrs: { onClick } });
    await fireEvent.click(getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
