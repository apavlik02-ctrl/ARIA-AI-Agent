// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// ── Mock Supabase client before importing the hook ────────────────────────────
// vi.mock factories are hoisted to the top of the file, so variables must also
// be hoisted via vi.hoisted() to avoid "Cannot access before initialization" errors.

const { mockUnsubscribe, mockGetSession, mockOnAuthStateChange, mockSignOut } = vi.hoisted(() => ({
  mockUnsubscribe: vi.fn(),
  mockGetSession: vi.fn(),
  mockOnAuthStateChange: vi.fn(() => ({
    data: { subscription: { unsubscribe: vi.fn() } },
  })),
  mockSignOut: vi.fn(() => Promise.resolve()),
}));

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: mockGetSession,
      onAuthStateChange: mockOnAuthStateChange,
      signOut: mockSignOut,
    },
  },
}));

import { useAuth } from '@/hooks/useAuth';

const MOCK_USER = { id: 'user-1', email: 'test@example.com' } as any;
const MOCK_SESSION = { user: MOCK_USER, access_token: 'tok' } as any;

beforeEach(() => {
  vi.clearAllMocks();
  mockGetSession.mockResolvedValue({ data: { session: null } });
  mockOnAuthStateChange.mockReturnValue({
    data: { subscription: { unsubscribe: mockUnsubscribe } },
  });
  // jsdom doesn't allow reassigning window.location directly in strict mode
  Object.defineProperty(window, 'location', {
    configurable: true,
    writable: true,
    value: { href: '' },
  });
});

// ── Initial state ─────────────────────────────────────────────────────────────

describe('useAuth — initial state', () => {
  it('starts with loading = true', () => {
    // Don't resolve getSession yet
    mockGetSession.mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useAuth());
    expect(result.current.loading).toBe(true);
  });

  it('starts with user = null', () => {
    mockGetSession.mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useAuth());
    expect(result.current.user).toBeNull();
  });

  it('starts with session = null', () => {
    mockGetSession.mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useAuth());
    expect(result.current.session).toBeNull();
  });
});

// ── After session resolves ────────────────────────────────────────────────────

describe('useAuth — after getSession resolves', () => {
  it('sets loading to false once getSession resolves', async () => {
    mockGetSession.mockResolvedValue({ data: { session: null } });
    const { result } = renderHook(() => useAuth());
    await act(async () => {});
    expect(result.current.loading).toBe(false);
  });

  it('sets user from the resolved session', async () => {
    mockGetSession.mockResolvedValue({ data: { session: MOCK_SESSION } });
    const { result } = renderHook(() => useAuth());
    await act(async () => {});
    expect(result.current.user).toEqual(MOCK_USER);
  });

  it('sets session from the resolved session', async () => {
    mockGetSession.mockResolvedValue({ data: { session: MOCK_SESSION } });
    const { result } = renderHook(() => useAuth());
    await act(async () => {});
    expect(result.current.session).toEqual(MOCK_SESSION);
  });

  it('keeps user as null when there is no active session', async () => {
    mockGetSession.mockResolvedValue({ data: { session: null } });
    const { result } = renderHook(() => useAuth());
    await act(async () => {});
    expect(result.current.user).toBeNull();
  });
});

// ── onAuthStateChange ─────────────────────────────────────────────────────────

describe('useAuth — onAuthStateChange', () => {
  it('registers an auth state change listener on mount', async () => {
    renderHook(() => useAuth());
    await act(async () => {});
    expect(mockOnAuthStateChange).toHaveBeenCalledOnce();
  });

  it('updates user and session when auth state changes', async () => {
    let capturedCallback: (event: string, session: any) => void = () => {};
    mockOnAuthStateChange.mockImplementation((cb: any) => {
      capturedCallback = cb;
      return { data: { subscription: { unsubscribe: mockUnsubscribe } } };
    });

    const { result } = renderHook(() => useAuth());
    await act(async () => {});

    await act(async () => {
      capturedCallback('SIGNED_IN', MOCK_SESSION);
    });

    expect(result.current.user).toEqual(MOCK_USER);
    expect(result.current.session).toEqual(MOCK_SESSION);
  });

  it('clears user and session on sign-out auth state change', async () => {
    mockGetSession.mockResolvedValue({ data: { session: MOCK_SESSION } });
    let capturedCallback: (event: string, session: any) => void = () => {};
    mockOnAuthStateChange.mockImplementation((cb: any) => {
      capturedCallback = cb;
      return { data: { subscription: { unsubscribe: mockUnsubscribe } } };
    });

    const { result } = renderHook(() => useAuth());
    await act(async () => {});

    await act(async () => {
      capturedCallback('SIGNED_OUT', null);
    });

    expect(result.current.user).toBeNull();
    expect(result.current.session).toBeNull();
  });
});

// ── Cleanup ───────────────────────────────────────────────────────────────────

describe('useAuth — cleanup', () => {
  it('calls subscription.unsubscribe on unmount', async () => {
    const { unmount } = renderHook(() => useAuth());
    await act(async () => {});
    unmount();
    expect(mockUnsubscribe).toHaveBeenCalledOnce();
  });
});

// ── signOut ───────────────────────────────────────────────────────────────────

describe('useAuth — signOut', () => {
  it('calls supabase.auth.signOut', async () => {
    const { result } = renderHook(() => useAuth());
    await act(async () => {});
    await act(async () => {
      await result.current.signOut();
    });
    expect(mockSignOut).toHaveBeenCalledOnce();
  });

  it('redirects to /login after sign-out', async () => {
    const { result } = renderHook(() => useAuth());
    await act(async () => {});
    await act(async () => {
      await result.current.signOut();
    });
    expect(window.location.href).toBe('/login');
  });
});
