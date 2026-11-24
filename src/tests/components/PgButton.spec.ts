import { render, fireEvent } from '@testing-library/vue';
import { describe, test, expect, vi } from 'vitest';
import PgButton from '@/components/PgButton.vue';

describe('PgButton', () => {
  test('renders a primary md <button type="button"> by default', () => {
    const { getByRole } = render(PgButton, { slots: { default: 'Play Random' } });
    const button = getByRole('button', { name: 'Play Random' });
    expect(button.tagName).toBe('BUTTON');
    expect(button.getAttribute('type')).toBe('button');
    expect(button.classList).toContain('pg-btn--primary');
    expect(button.classList).toContain('pg-btn--md');
    expect(button.hasAttribute('disabled')).toBe(false);
  });

  test.each(['primary', 'ghost', 'text'] as const)('applies the %s variant', (variant) => {
    const { getByRole } = render(PgButton, { props: { variant }, slots: { default: 'Go' } });
    expect(getByRole('button').classList).toContain(`pg-btn--${variant}`);
  });

  test('applies size and block', () => {
    const { getByRole } = render(PgButton, {
      props: { size: 'lg', block: true },
      slots: { default: 'Go' }
    });
    const button = getByRole('button');
    expect(button.classList).toContain('pg-btn--lg');
    expect(button.classList).toContain('pg-btn--block');
  });

  test('emits click when enabled', async () => {
    const onClick = vi.fn();
    const { getByRole } = render(PgButton, {
      attrs: { onClick },
      slots: { default: 'Go' }
    });
    await fireEvent.click(getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test('disabled shows static stripes', () => {
    const { getByRole } = render(PgButton, {
      props: { disabled: true },
      slots: { default: 'Unavailable' }
    });
    const button = getByRole('button', { name: 'Unavailable' });
    expect(button.hasAttribute('disabled')).toBe(true);
    expect(button.classList).toContain('pg-btn--disabled');
    expect(button.classList).not.toContain('pg-btn--loading');
  });

  test('loading replaces the label, sets aria-busy and disables', () => {
    const { getByRole, queryByText } = render(PgButton, {
      props: { loading: true },
      slots: { default: 'Play Random' }
    });
    const button = getByRole('button', { name: 'Loading' });
    expect(queryByText('Play Random')).toBeNull();
    expect(button.getAttribute('aria-busy')).toBe('true');
    expect(button.hasAttribute('disabled')).toBe(true);
    expect(button.classList).toContain('pg-btn--loading');
    expect(button.classList).toContain('pg-btn--disabled');
  });

  test('renders icon and key hint slots', () => {
    const { getByRole, getByText } = render(PgButton, {
      slots: { default: 'Get started', icon: '<svg data-testid="icon"></svg>', keyHint: '⏎' }
    });
    expect(getByRole('button').querySelector('.pg-btn__icon svg')).not.toBeNull();
    expect(getByText('⏎').classList).toContain('pg-btn__key');
  });

  test('href renders an <a>', () => {
    const { getByRole } = render(PgButton, {
      props: { href: 'https://example.com', variant: 'ghost' },
      attrs: { target: '_blank', rel: 'noopener noreferrer' },
      slots: { default: 'Star me' }
    });
    const link = getByRole('link', { name: 'Star me' });
    expect(link.tagName).toBe('A');
    expect(link.getAttribute('href')).toBe('https://example.com');
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.hasAttribute('type')).toBe(false);
  });

  test('disabled link drops its href', () => {
    const { container } = render(PgButton, {
      props: { href: 'https://example.com', disabled: true },
      slots: { default: 'Star me' }
    });
    const link = container.querySelector('a')!;
    expect(link.hasAttribute('href')).toBe(false);
    expect(link.getAttribute('aria-disabled')).toBe('true');
  });
});
