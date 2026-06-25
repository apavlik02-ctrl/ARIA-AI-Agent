'use client';

import React from 'react';
import { useSupabaseRealtime, Notification } from '@/hooks/useSupabaseRealtime';
import InAppNotificationCenter from './InAppNotificationCenter';

interface RealTimeNotificationCenterProps {
  userId: string;
}

export default function RealTimeNotificationCenter({ userId }: RealTimeNotificationCenterProps) {
  const {
    notifications,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useSupabaseRealtime({ userId, limit: 50 });

  if (loading) {
    return (
      <div className="w-full max-w-md bg-[#1A120A] border border-white/10 rounded-2xl p-8 text-center">
        <div className="animate-pulse text-[#C9874F]">Loading notifications...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-md bg-[#1A120A] border border-red-500/30 rounded-2xl p-6 text-center">
        <div className="text-red-400 mb-2">Failed to load notifications</div>
        <div className="text-sm text-[#EDE0D4]/60">{error}</div>
      </div>
    );
  }

  return (
    <InAppNotificationCenter
      notifications={notifications}
      onMarkAsRead={markAsRead}
      onMarkAllAsRead={markAllAsRead}
      onNotificationClick={(notification) => {
        // Handle navigation based on notification type
        if (notification.type === 'quiz' && notification.data?.quizId) {
          window.location.href = `/quiz/${notification.data.quizId}`;
        }
        if (notification.type === 'progress') {
          window.location.href = '/dashboard';
        }
      }}
    />
  );
}
