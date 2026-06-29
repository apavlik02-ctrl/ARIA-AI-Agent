// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// ── Mock socket.io-client ─────────────────────────────────────────────────────

type EventHandler = (...args: any[]) => void;

function makeSocketMock() {
  const handlers: Record<string, EventHandler[]> = {};
  const socket = {
    connected: false,
    id: 'socket-id-123',
    on: vi.fn((event: string, handler: EventHandler) => {
      if (!handlers[event]) handlers[event] = [];
      handlers[event].push(handler);
    }),
    emit: vi.fn(),
    connect: vi.fn(),
    disconnect: vi.fn(() => {
      socket.connected = false;
      trigger('disconnect', 'io client disconnect');
    }),
    // Test helper: fire an event
    _trigger: (event: string, ...args: any[]) => trigger(event, ...args),
  };

  function trigger(event: string, ...args: any[]) {
    (handlers[event] || []).forEach(h => h(...args));
  }

  return socket;
}

let currentSocket: ReturnType<typeof makeSocketMock>;

vi.mock('socket.io-client', () => ({
  io: vi.fn(() => {
    currentSocket = makeSocketMock();
    return currentSocket;
  }),
}));

import { useSocketWithReconnection } from '@/hooks/useSocket-with-reconnection';
import { io } from 'socket.io-client';

beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

// ── Connection lifecycle ──────────────────────────────────────────────────────

describe('useSocketWithReconnection — connection lifecycle', () => {
  it('does NOT connect when no userId is provided', () => {
    renderHook(() => useSocketWithReconnection({}));
    expect(io).not.toHaveBeenCalled();
  });

  it('connects when a userId is provided', () => {
    renderHook(() => useSocketWithReconnection({ userId: 'user-1' }));
    expect(io).toHaveBeenCalledOnce();
  });

  it('starts with connected = false', () => {
    const { result } = renderHook(() => useSocketWithReconnection({ userId: 'user-1' }));
    expect(result.current.status.connected).toBe(false);
  });

  it('sets connected = true after the connect event fires', () => {
    const { result } = renderHook(() => useSocketWithReconnection({ userId: 'user-1' }));

    act(() => {
      currentSocket.connected = true;
      currentSocket._trigger('connect');
    });

    expect(result.current.status.connected).toBe(true);
    expect(result.current.status.error).toBeNull();
    expect(result.current.status.reconnecting).toBe(false);
  });

  it('emits join-user-room with userId after connecting', () => {
    renderHook(() => useSocketWithReconnection({ userId: 'user-42' }));

    act(() => {
      currentSocket.connected = true;
      currentSocket._trigger('connect');
    });

    expect(currentSocket.emit).toHaveBeenCalledWith('join-user-room', 'user-42');
  });

  it('sets connected = false after disconnect event', () => {
    const { result } = renderHook(() => useSocketWithReconnection({ userId: 'user-1', autoReconnect: false }));

    act(() => {
      currentSocket.connected = true;
      currentSocket._trigger('connect');
    });
    act(() => {
      currentSocket.connected = false;
      currentSocket._trigger('disconnect', 'transport close');
    });

    expect(result.current.status.connected).toBe(false);
  });

  it('disconnects the socket on unmount', () => {
    const { unmount } = renderHook(() => useSocketWithReconnection({ userId: 'user-1' }));
    unmount();
    expect(currentSocket.disconnect).toHaveBeenCalled();
  });
});

// ── Reconnection logic ────────────────────────────────────────────────────────

describe('useSocketWithReconnection — reconnection', () => {
  it('sets reconnecting = true after a connect_error', () => {
    const { result } = renderHook(() =>
      useSocketWithReconnection({ userId: 'user-1', autoReconnect: true })
    );

    act(() => {
      currentSocket._trigger('connect_error', new Error('ECONNREFUSED'));
    });

    expect(result.current.status.reconnecting).toBe(true);
    expect(result.current.status.reconnectAttempts).toBe(1);
  });

  it('increments reconnectAttempts on each connect_error', () => {
    const { result } = renderHook(() =>
      useSocketWithReconnection({ userId: 'user-1', autoReconnect: true, maxReconnectAttempts: 5 })
    );

    act(() => {
      currentSocket._trigger('connect_error', new Error('err'));
    });
    act(() => {
      vi.runAllTimers();
      currentSocket._trigger('connect_error', new Error('err'));
    });

    expect(result.current.status.reconnectAttempts).toBe(2);
  });

  it('stops reconnecting after maxReconnectAttempts', () => {
    renderHook(() =>
      useSocketWithReconnection({ userId: 'user-1', autoReconnect: true, maxReconnectAttempts: 2 })
    );

    act(() => currentSocket._trigger('connect_error', new Error('err')));
    act(() => { vi.runAllTimers(); currentSocket._trigger('connect_error', new Error('err')); });
    act(() => { vi.runAllTimers(); currentSocket._trigger('connect_error', new Error('err')); });

    // io() was called once on mount; reconnect should not call it additional times beyond max
    const ioCallCount = (io as ReturnType<typeof vi.fn>).mock.calls.length;
    expect(ioCallCount).toBe(1); // only the initial connect call
  });

  it('uses exponential backoff — 2nd attempt delay is double the 1st', () => {
    const setTimeoutSpy = vi.spyOn(global, 'setTimeout');

    renderHook(() =>
      useSocketWithReconnection({ userId: 'user-1', autoReconnect: true, maxReconnectAttempts: 5 })
    );

    act(() => currentSocket._trigger('connect_error', new Error('err')));
    const firstDelay = setTimeoutSpy.mock.calls.at(-1)?.[1] as number;

    act(() => { vi.runAllTimers(); currentSocket._trigger('connect_error', new Error('err')); });
    const secondDelay = setTimeoutSpy.mock.calls.at(-1)?.[1] as number;

    expect(secondDelay).toBe(firstDelay * 2);
  });

  it('caps reconnect delay at 30 seconds', () => {
    const setTimeoutSpy = vi.spyOn(global, 'setTimeout');

    renderHook(() =>
      useSocketWithReconnection({ userId: 'user-1', autoReconnect: true, maxReconnectAttempts: 20 })
    );

    // Fire many errors to force many backoff calculations
    for (let i = 0; i < 10; i++) {
      act(() => { currentSocket._trigger('connect_error', new Error('err')); vi.runAllTimers(); });
    }

    const delays = setTimeoutSpy.mock.calls.map(c => c[1] as number);
    expect(Math.max(...delays)).toBeLessThanOrEqual(30000);
  });

  it('does NOT reconnect when autoReconnect = false', () => {
    const { result } = renderHook(() =>
      useSocketWithReconnection({ userId: 'user-1', autoReconnect: false })
    );

    act(() => currentSocket._trigger('connect_error', new Error('err')));

    expect(result.current.status.reconnecting).toBe(false);
  });

  it('resets reconnectAttempts to 0 after a successful connect', () => {
    const { result } = renderHook(() =>
      useSocketWithReconnection({ userId: 'user-1', autoReconnect: true, maxReconnectAttempts: 5 })
    );

    act(() => currentSocket._trigger('connect_error', new Error('err')));
    expect(result.current.status.reconnectAttempts).toBe(1);

    act(() => {
      vi.runAllTimers();
      currentSocket.connected = true;
      currentSocket._trigger('connect');
    });

    expect(result.current.status.reconnectAttempts).toBe(0);
    expect(result.current.status.reconnecting).toBe(false);
  });
});

// ── manualReconnect ───────────────────────────────────────────────────────────

describe('useSocketWithReconnection — manualReconnect', () => {
  it('calling manualReconnect creates a fresh connection', () => {
    const { result } = renderHook(() => useSocketWithReconnection({ userId: 'user-1' }));

    act(() => {
      result.current.manualReconnect();
    });

    // io() should have been called a second time for the fresh connect
    expect((io as ReturnType<typeof vi.fn>).mock.calls.length).toBeGreaterThanOrEqual(2);
  });
});

// ── disconnect ────────────────────────────────────────────────────────────────

describe('useSocketWithReconnection — disconnect', () => {
  it('disconnect() resets status to all-false', () => {
    const { result } = renderHook(() => useSocketWithReconnection({ userId: 'user-1' }));

    act(() => {
      currentSocket.connected = true;
      currentSocket._trigger('connect');
    });

    act(() => {
      result.current.disconnect();
    });

    expect(result.current.status).toEqual({
      connected: false,
      reconnecting: false,
      reconnectAttempts: 0,
      error: null,
    });
  });
});
