# Supabase Realtime as Alternative to Socket.io

## Overview

Since ARIA already uses Supabase for persistence (user progress, notifications, etc.), **Supabase Realtime** is a strong alternative to Socket.io.

Supabase Realtime provides real-time database change subscriptions using WebSockets under the hood, with excellent built-in reconnection, auth, and security.

---

## Comparison: Socket.io vs Supabase Realtime

| Feature                        | Socket.io                                      | Supabase Realtime                              | Winner          |
|--------------------------------|------------------------------------------------|------------------------------------------------|-----------------|
| **Setup Complexity**           | Medium (custom server needed)                  | Very Low (already using Supabase)              | **Supabase**    |
| **Reconnection Logic**         | Manual (we built exponential backoff)          | Built-in & excellent                           | **Supabase**    |
| **Authentication**             | Manual room joining + token validation         | Native Row Level Security (RLS)                | **Supabase**    |
| **Database Integration**       | Manual sync                                  | Native (listen to INSERT/UPDATE/DELETE)        | **Supabase**    |
| **Custom Events**              | Excellent (any event name)                     | Limited (mostly DB changes)                    | **Socket.io**   |
| **Performance**                | Very good                                      | Very good                                      | Tie             |
| **Cost**                       | Self-hosted (free)                             | Included in Supabase subscription              | **Supabase**    |
| **Type Safety**                | Manual                                         | Excellent with generated types                 | **Supabase**    |
| **Browser Support**            | Excellent                                      | Excellent                                      | Tie             |

**Recommendation**: For ARIA, **Supabase Realtime is the better choice** in most cases because:
- You're already using Supabase
- Notifications can live in a database table
- Security is handled automatically via RLS
- Much less code to maintain

---

## Recommended Architecture with Supabase Realtime

### 1. Database Schema

```sql
-- Create notifications table
create table notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  type text not null,           -- 'quiz', 'progress', 'offer', 'system'
  title text not null,
  message text not null,
  data jsonb,                   -- flexible extra data
  read boolean default false,
  created_at timestamptz default now()
);

-- Enable RLS
alter table notifications enable row level security;

-- Users can only see their own notifications
create policy "Users can view own notifications"
  on notifications for select
  using (auth.uid() = user_id);

create policy "Users can update own notifications"
  on notifications for update
  using (auth.uid() = user_id);
```

### 2. React Hook for Supabase Realtime

```ts
// hooks/useRealtimeNotifications.ts
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  read: boolean;
  created_at: string;
}

export function useRealtimeNotifications(userId: string | undefined) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    // 1. Fetch initial notifications
    const fetchNotifications = async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (!error && data) {
        setNotifications(data);
      }
      setLoading(false);
    };

    fetchNotifications();

    // 2. Subscribe to real-time changes
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          setNotifications(prev => [newNotification, ...prev]);
          
          // Optional: Show browser notification
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(newNotification.title, {
              body: newNotification.message,
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const updated = payload.new as Notification;
          setNotifications(prev =>
            prev.map(n => n.id === updated.id ? updated : n)
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const markAsRead = async (id: string) => {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id);
  };

  const markAllAsRead = async () => {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);
  };

  return {
    notifications,
    loading,
    markAsRead,
    markAllAsRead,
  };
}
```

### 3. How to Send Notifications (from Backend)

When something important happens (quiz completed, readiness updated, etc.):

```ts
// Example: In an API route after quiz completion
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function sendNotification(userId: string, notification: any) {
  await supabase.from('notifications').insert({
    user_id: userId,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    data: notification.data,
  });
}

// Usage example
await sendNotification(userId, {
  type: 'progress',
  title: 'Great progress!',
  message: `Your readiness improved to ${newReadiness}%`,
  data: { newReadiness },
});
```

---

## Final Recommendation

| Use Case                              | Recommended Solution      | Reason |
|---------------------------------------|---------------------------|--------|
| Notifications + Progress updates      | **Supabase Realtime**     | Simpler, native DB integration, less code |
| Complex custom events / broadcasting  | Socket.io                 | More flexible event system |
| High-frequency real-time collaboration| Socket.io                 | Better performance for many events |
| ARIA (current needs)                  | **Supabase Realtime**     | Already using Supabase + simpler maintenance |

**For ARIA, I strongly recommend switching to Supabase Realtime.**

It reduces complexity significantly while providing excellent real-time capabilities.

---

Would you like me to:

1. Create the full `useRealtimeNotifications` hook + updated Notification Center?
2. Add database triggers (e.g., auto-create notification when readiness changes)?
3. Build both Socket.io and Supabase versions side-by-side for comparison?

Just let me know how you'd like to proceed.