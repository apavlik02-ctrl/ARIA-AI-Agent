'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import RealTimeNotificationCenter from '@/components/RealTimeNotificationCenter';

export default function NotificationsPage() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      window.location.href = '/login';
    }
  }, [user, loading]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#0F0A07] flex items-center justify-center">
        <div className="text-[#EDE0D4]/60 text-sm">Loading…</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0F0A07] flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-lg">
        <h1 className="text-2xl font-semibold text-[#EDE0D4] mb-6">Notifications</h1>
        <RealTimeNotificationCenter userId={user.id} />
      </div>
    </main>
  );
}
