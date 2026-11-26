import { render, fireEvent } from '@testing-library/vue';
import { describe, test, expect, vi, afterEach } from 'vitest';
import { nextTick } from 'vue';
import LandingSection from '@/components/LandingSection.vue';
import * as auth from '@/auth';
import { saveLogoutNotice } from '@/auth/tokenStorage';
import { version } from '../../../package.json';

vi.mock('@/auth', () => ({
  getAuth: vi.fn()
}));

describe('LandingSection', () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
    sessionStorage.clear();
  });

  test('shows no logout notice on a normal visit', () => {
    const { getByTestId } = render(LandingSection);
    const region = getByTestId('logout-toast');
    expect(region.getAttribute('role')).toBe('status');
    expect(region.getAttribute('aria-live')).toBe('polite');
    expect(region.textContent?.trim()).toBe('');
  });

  test('announces the logout once and dismisses the notice by itself (#200)', async () => {
    vi.useFakeTimers();
    saveLogoutNotice();

    const first = render(LandingSection, { global: { stubs: { transition: true } } });
    await nextTick();
    const region = first.getByTestId('logout-toast');
    expect(region.textContent).toContain('Logged out on this device');

    vi.advanceTimersByTime(5000);
    await nextTick();
    expect(region.textContent).not.toContain('Logged out');
    first.unmount();

    const second = render(LandingSection);
    await nextTick();
    expect(second.getByTestId('logout-toast').textContent?.trim()).toBe('');
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
