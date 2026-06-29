// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import InAppNotificationCenter from '@/components/InAppNotificationCenter';

// Prevent jsdom errors from window.location.href assignment
const assignMock = vi.fn();
Object.defineProperty(window, 'location', {
  value: { href: '', assign: assignMock },
  writable: true,
});

function makeNotification(overrides: Partial<{
  id: number; type: 'quiz' | 'plan' | 'progress' | 'offer' | 'system';
  title: string; message: string; timestamp: string; read: boolean;
  actionLabel?: string; actionUrl?: string;
}> = {}) {
  return {
    id: 1,
    type: 'quiz' as const,
    title: 'Quiz Complete',
    message: 'You scored 80% on your quiz.',
    timestamp: new Date().toISOString(),
    read: false,
    ...overrides,
  };
}

// ── Header ────────────────────────────────────────────────────────────────────

describe('InAppNotificationCenter — header', () => {
  it('shows "Notifications" heading', () => {
    render(
      <InAppNotificationCenter
        notifications={[]}
        onMarkAsRead={vi.fn()}
        onMarkAllAsRead={vi.fn()}
      />
    );
    expect(screen.getByText('Notifications')).toBeInTheDocument();
  });

  it('shows unread badge count when there are unread notifications', () => {
    render(
      <InAppNotificationCenter
        notifications={[makeNotification({ read: false })]}
        onMarkAsRead={vi.fn()}
        onMarkAllAsRead={vi.fn()}
      />
    );
    expect(screen.getByText('1 new')).toBeInTheDocument();
  });

  it('does not show unread badge when all notifications are read', () => {
    render(
      <InAppNotificationCenter
        notifications={[makeNotification({ read: true })]}
        onMarkAsRead={vi.fn()}
        onMarkAllAsRead={vi.fn()}
      />
    );
    expect(screen.queryByText(/new/)).not.toBeInTheDocument();
  });

  it('shows "Mark all read" button when unread notifications exist', () => {
    render(
      <InAppNotificationCenter
        notifications={[makeNotification({ read: false })]}
        onMarkAsRead={vi.fn()}
        onMarkAllAsRead={vi.fn()}
      />
    );
    expect(screen.getByRole('button', { name: /Mark all read/i })).toBeInTheDocument();
  });

  it('does not show "Mark all read" when all are read', () => {
    render(
      <InAppNotificationCenter
        notifications={[makeNotification({ read: true })]}
        onMarkAsRead={vi.fn()}
        onMarkAllAsRead={vi.fn()}
      />
    );
    expect(screen.queryByRole('button', { name: /Mark all read/i })).not.toBeInTheDocument();
  });
});

// ── Filter tabs ───────────────────────────────────────────────────────────────

describe('InAppNotificationCenter — filters', () => {
  const notifications = [
    makeNotification({ id: 1, title: 'Unread One', read: false }),
    makeNotification({ id: 2, title: 'Read One', read: true }),
  ];

  it('shows both "All" and "Unread" filter tabs', () => {
    render(
      <InAppNotificationCenter
        notifications={notifications}
        onMarkAsRead={vi.fn()}
        onMarkAllAsRead={vi.fn()}
      />
    );
    expect(screen.getByRole('button', { name: /^All$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Unread/i })).toBeInTheDocument();
  });

  it('shows all notifications by default', () => {
    render(
      <InAppNotificationCenter
        notifications={notifications}
        onMarkAsRead={vi.fn()}
        onMarkAllAsRead={vi.fn()}
      />
    );
    expect(screen.getByText('Unread One')).toBeInTheDocument();
    expect(screen.getByText('Read One')).toBeInTheDocument();
  });

  it('filters to only unread notifications when "Unread" tab is clicked', () => {
    render(
      <InAppNotificationCenter
        notifications={notifications}
        onMarkAsRead={vi.fn()}
        onMarkAllAsRead={vi.fn()}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /^Unread/i }));
    expect(screen.getByText('Unread One')).toBeInTheDocument();
    expect(screen.queryByText('Read One')).not.toBeInTheDocument();
  });
});

// ── Notification list ─────────────────────────────────────────────────────────

describe('InAppNotificationCenter — notification list', () => {
  it('renders each notification title', () => {
    render(
      <InAppNotificationCenter
        notifications={[
          makeNotification({ id: 1, title: 'Alert A' }),
          makeNotification({ id: 2, title: 'Alert B' }),
        ]}
        onMarkAsRead={vi.fn()}
        onMarkAllAsRead={vi.fn()}
      />
    );
    expect(screen.getByText('Alert A')).toBeInTheDocument();
    expect(screen.getByText('Alert B')).toBeInTheDocument();
  });

  it('renders notification message text', () => {
    render(
      <InAppNotificationCenter
        notifications={[makeNotification({ message: 'Your study plan is ready.' })]}
        onMarkAsRead={vi.fn()}
        onMarkAllAsRead={vi.fn()}
      />
    );
    expect(screen.getByText('Your study plan is ready.')).toBeInTheDocument();
  });

  it('shows empty state when there are no notifications', () => {
    render(
      <InAppNotificationCenter
        notifications={[]}
        onMarkAsRead={vi.fn()}
        onMarkAllAsRead={vi.fn()}
      />
    );
    expect(screen.getByText("You're all caught up")).toBeInTheDocument();
  });

  it('shows the action label when provided', () => {
    render(
      <InAppNotificationCenter
        notifications={[makeNotification({ actionLabel: 'Start Quiz' })]}
        onMarkAsRead={vi.fn()}
        onMarkAllAsRead={vi.fn()}
      />
    );
    expect(screen.getByText('Start Quiz')).toBeInTheDocument();
  });

  it('does not show an action label when omitted', () => {
    render(
      <InAppNotificationCenter
        notifications={[makeNotification({ actionLabel: undefined })]}
        onMarkAsRead={vi.fn()}
        onMarkAllAsRead={vi.fn()}
      />
    );
    // Absence: no extra chip elements beyond the normal notification
    expect(screen.queryByText(/^Start/)).not.toBeInTheDocument();
  });
});

// ── Interactions ──────────────────────────────────────────────────────────────

describe('InAppNotificationCenter — interactions', () => {
  it('calls onMarkAsRead when an unread notification is clicked', () => {
    const onMarkAsRead = vi.fn();
    render(
      <InAppNotificationCenter
        notifications={[makeNotification({ id: 42, read: false })]}
        onMarkAsRead={onMarkAsRead}
        onMarkAllAsRead={vi.fn()}
      />
    );
    fireEvent.click(screen.getByText('Quiz Complete'));
    expect(onMarkAsRead).toHaveBeenCalledWith(42);
  });

  it('does not call onMarkAsRead when an already-read notification is clicked', () => {
    const onMarkAsRead = vi.fn();
    render(
      <InAppNotificationCenter
        notifications={[makeNotification({ id: 99, read: true, title: 'Read Note' })]}
        onMarkAsRead={onMarkAsRead}
        onMarkAllAsRead={vi.fn()}
      />
    );
    fireEvent.click(screen.getByText('Read Note'));
    expect(onMarkAsRead).not.toHaveBeenCalled();
  });

  it('calls onNotificationClick when a notification is clicked', () => {
    const onNotificationClick = vi.fn();
    const note = makeNotification({ id: 7 });
    render(
      <InAppNotificationCenter
        notifications={[note]}
        onMarkAsRead={vi.fn()}
        onMarkAllAsRead={vi.fn()}
        onNotificationClick={onNotificationClick}
      />
    );
    fireEvent.click(screen.getByText('Quiz Complete'));
    expect(onNotificationClick).toHaveBeenCalledWith(expect.objectContaining({ id: 7 }));
  });

  it('"Mark all read" calls onMarkAllAsRead', () => {
    const onMarkAllAsRead = vi.fn();
    render(
      <InAppNotificationCenter
        notifications={[makeNotification({ read: false })]}
        onMarkAsRead={vi.fn()}
        onMarkAllAsRead={onMarkAllAsRead}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /Mark all read/i }));
    expect(onMarkAllAsRead).toHaveBeenCalledOnce();
  });

  it('"Mark all read" removes the unread badge', () => {
    render(
      <InAppNotificationCenter
        notifications={[makeNotification({ read: false })]}
        onMarkAsRead={vi.fn()}
        onMarkAllAsRead={vi.fn()}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /Mark all read/i }));
    expect(screen.queryByText(/new/)).not.toBeInTheDocument();
  });
});
