import { render, fireEvent } from '@testing-library/vue';
import { describe, test, expect, vi, afterEach } from 'vitest';
import LandingSection from '@/components/LandingSection.vue';
import * as auth from '@/auth';
import { version } from '../../../package.json';

vi.mock('@/auth', () => ({
  getAuth: vi.fn()
}));

describe('LandingSection', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test('renders correctly', () => {
    const { getByText } = render(LandingSection);
    expect(getByText('PHONOGRAPH')).toBeTruthy();
    expect(getByText('Get Started')).toBeTruthy();
    // Use regex to match text that might be broken by newlines
    expect(getByText(/Your personal music companion\./i)).toBeTruthy();
  });

  test('Get Started button calls getAuth', async () => {
    const { getByText } = render(LandingSection);
    const getStartedButton = getByText('Get Started');
    await fireEvent.click(getStartedButton);
    expect(auth.getAuth).toHaveBeenCalled();
  });

  test('shows the NEON GRID landing pieces (#164)', () => {
    const { getByTestId, getByRole, container } = render(LandingSection);
    expect(getByTestId('landing-hud').textContent).toContain(`Sys.boot // v${version}`);
    const steps = getByTestId('landing-steps').querySelectorAll('li');
    expect(steps).toHaveLength(3);
    expect(steps[0].textContent).toContain('01');
    expect(steps[2].textContent).toContain('Press play');
    expect(getByRole('heading', { level: 1 }).classList).toContain('pg-logo--surge');
    expect(getByRole('button', { name: /Get Started/ }).classList).toContain('pg-btn--primary');
    const github = getByRole('link', { name: /Star me on GitHub/ });
    expect(github.getAttribute('href')).toBe('https://github.com/kenjiwilkins/phonograph');
    expect(github.getAttribute('rel')).toBe('noopener noreferrer');
    expect(github.classList).toContain('pg-btn--ghost');
    // The footer flows after the content instead of being fixed over it
    expect(container.querySelector('footer')?.className).not.toContain('fixed');
  });
});
