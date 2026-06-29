// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import RealTimeNotificationCenter from '@/components/RealTimeNotificationCenter';

// Control the hook's return value per test
const mockHook = vi.hoisted(() => ({
  notifications: [] as any[],
  loading: false,
  error: null as string | null,
  markAsRead: vi.fn(),
  markAllAsRead: vi.fn(),
  deleteNotification: vi.fn(),
}));

vi.mock('@/hooks/useSupabaseRealtime', () => ({
  useSupabaseRealtime: () => mockHook,
}));

// Prevent jsdom navigation errors
Object.defineProperty(window, 'location', {
  value: { href: '' },
  writable: true,
});

// ── Loading state ─────────────────────────────────────────────────────────────

describe('RealTimeNotificationCenter — loading', () => {
  it('shows loading indicator while data is loading', () => {
    mockHook.loading = true;
    mockHook.error = null;
    mockHook.notifications = [];
    render(<RealTimeNotificationCenter userId="user-1" />);
    expect(screen.getByText(/Loading notifications/i)).toBeInTheDocument();
    mockHook.loading = false;
  });
});

// ── Error state ───────────────────────────────────────────────────────────────

describe('RealTimeNotificationCenter — error', () => {
  it('shows error message when the hook reports an error', () => {
    mockHook.loading = false;
    mockHook.error = 'Connection failed';
    mockHook.notifications = [];
    render(<RealTimeNotificationCenter userId="user-1" />);
    expect(screen.getByText(/Failed to load notifications/i)).toBeInTheDocument();
    mockHook.error = null;
  });

  it('displays the error detail text', () => {
    mockHook.loading = false;
    mockHook.error = 'Network unreachable';
    mockHook.notifications = [];
    render(<RealTimeNotificationCenter userId="user-1" />);
    expect(screen.getByText('Network unreachable')).toBeInTheDocument();
    mockHook.error = null;
  });
});

// ── Loaded state ──────────────────────────────────────────────────────────────

describe('RealTimeNotificationCenter — loaded', () => {
  beforeEach(() => {
    mockHook.loading = false;
    mockHook.error = null;
  });

  it('renders the InAppNotificationCenter when loaded with no error', () => {
    mockHook.notifications = [];
    render(<RealTimeNotificationCenter userId="user-1" />);
    expect(screen.getByText('Notifications')).toBeInTheDocument();
  });

  it('passes notifications to the notification center', () => {
    mockHook.notifications = [
      {
        id: 1,
        type: 'quiz',
        title: 'Quiz Result',
        message: 'You scored 90%',
        timestamp: new Date().toISOString(),
        read: false,
      },
    ];
    render(<RealTimeNotificationCenter userId="user-1" />);
    expect(screen.getByText('Quiz Result')).toBeInTheDocument();
  });

  it('shows empty state when there are no notifications', () => {
    mockHook.notifications = [];
    render(<RealTimeNotificationCenter userId="user-1" />);
    expect(screen.getByText("You're all caught up")).toBeInTheDocument();
  });
});
