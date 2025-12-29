import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import ForceLogin from '../../../../src/app/components/force-login/ForceLogin';

// Mock jwt-decode
vi.mock('jwt-decode', () => ({
  jwtDecode: vi.fn(),
}));

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  Navigate: ({ to }: { to: string }) => <div data-testid="navigate">{to}</div>,
  useNavigate: () => mockNavigate,
}));

// Mock Auth.api
const mockRefreshToken = vi.fn();
vi.mock('../../../../src/app/services/Auth.api.ts', () => ({
  useRefreshTokenMutation: () => [mockRefreshToken],
}));

// Mock usePreferences
const mockSetApiToken = vi.fn();
const mockSetRefreshToken = vi.fn();
vi.mock('../../../../src/app/utils/usePreferences.ts', () => ({
  default: vi.fn(),
}));

import { jwtDecode } from 'jwt-decode';
import usePreferences from '../../../../src/app/utils/usePreferences';

describe('ForceLogin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
    mockSetApiToken.mockClear();
    mockSetRefreshToken.mockClear();
    mockRefreshToken.mockClear();
  });

  it('should eventually authorize valid tokens', async () => {
    // Setup: Valid token that hasn't expired
    const futureTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
    vi.mocked(jwtDecode).mockReturnValue({ exp: futureTime });
    vi.mocked(usePreferences).mockReturnValue({
      apiToken: 'valid-token',
      refreshToken: 'refresh-token',
      setApiToken: mockSetApiToken,
      setRefreshToken: mockSetRefreshToken,
      userAvatarId: '1',
      setUserAvatarId: vi.fn(),
      seenDialogs: {},
      setSeenDialog: vi.fn(),
      chatSettings: undefined,
      setChatSettings: vi.fn(),
    });

    render(
      <ForceLogin>
        <div>Protected Content</div>
      </ForceLogin>
    );

    // Component should eventually authorize and show children
    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
  });

  it('should render children when token is valid', async () => {
    // Setup: Valid token that hasn't expired
    const futureTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
    vi.mocked(jwtDecode).mockReturnValue({ exp: futureTime });
    vi.mocked(usePreferences).mockReturnValue({
      apiToken: 'valid-token',
      refreshToken: 'refresh-token',
      setApiToken: mockSetApiToken,
      setRefreshToken: mockSetRefreshToken,
      userAvatarId: '1',
      setUserAvatarId: vi.fn(),
      seenDialogs: {},
      setSeenDialog: vi.fn(),
      chatSettings: undefined,
      setChatSettings: vi.fn(),
    });

    render(
      <ForceLogin>
        <div>Protected Content</div>
      </ForceLogin>
    );

    // Wait for auth check to complete
    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
  });

  it('should redirect to login when no token exists', async () => {
    // Setup: No API token
    vi.mocked(usePreferences).mockReturnValue({
      apiToken: undefined,
      refreshToken: undefined,
      setApiToken: mockSetApiToken,
      setRefreshToken: mockSetRefreshToken,
      userAvatarId: '1',
      setUserAvatarId: vi.fn(),
      seenDialogs: {},
      setSeenDialog: vi.fn(),
      chatSettings: undefined,
      setChatSettings: vi.fn(),
    });

    render(
      <ForceLogin>
        <div>Protected Content</div>
      </ForceLogin>
    );

    // Wait for redirect
    await waitFor(() => {
      expect(screen.getByTestId('navigate')).toHaveTextContent('/login');
    });
  });
});
