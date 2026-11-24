import { render } from '@testing-library/vue';
import { describe, test, expect } from 'vitest';
import PhonographLogo from '@/components/PhonographLogo.vue';

describe('PhonographLogo', () => {
  test('renders the wordmark with matching data-text', () => {
    const { getByRole } = render(PhonographLogo);
    const logo = getByRole('heading', { level: 1 });
    expect(logo.textContent?.trim()).toBe('PHONOGRAPH');
    expect(logo.getAttribute('data-text')).toBe('PHONOGRAPH');
  });

  test('defaults to md without surge', () => {
    const { getByRole } = render(PhonographLogo);
    const logo = getByRole('heading');
    expect(logo.classList).toContain('pg-logo--md');
    expect(logo.classList).not.toContain('pg-logo--xl');
    expect(logo.classList).not.toContain('pg-logo--surge');
  });

  test('applies the xl size and surge classes', () => {
    const { getByRole } = render(PhonographLogo, { props: { size: 'xl', surge: true } });
    const logo = getByRole('heading');
    expect(logo.classList).toContain('pg-logo--xl');
    expect(logo.classList).toContain('pg-logo--surge');
    expect(logo.classList).not.toContain('pg-logo--md');
  });

  test('passes through attributes such as data-testid', () => {
    const { getByTestId } = render(PhonographLogo, { attrs: { 'data-testid': 'logo' } });
    expect(getByTestId('logo').getAttribute('data-text')).toBe('PHONOGRAPH');
  });
});
