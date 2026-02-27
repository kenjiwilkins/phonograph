import { render, fireEvent } from '@testing-library/vue';
import { describe, test, expect, vi, afterEach } from 'vitest';
import LandingSection from '@/components/LandingSection.vue';
import * as auth from '@/auth';

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
});
