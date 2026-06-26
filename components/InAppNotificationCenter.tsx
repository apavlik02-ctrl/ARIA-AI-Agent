'use client';

import React, { useState } from 'react';

interface Notification {
  id: number;
  type: 'quiz' | 'plan' | 'progress' | 'offer' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionLabel?: string;
  actionUrl?: string;
  data?: Record<string, any>;
}

interface InAppNotificationCenterProps {
  notifications: Notification[];
  onMarkAsRead: (id: number) => void;
  onMarkAllAsRead: () => void;
  onNotificationClick?: (notification: Notification) => void;
}

export default function InAppNotificationCenter({
  notifications: initialNotifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onNotificationClick,
}: InAppNotificationCenterProps) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filteredNotifications = notifications
    .filter(n => filter === 'all' || !n.read)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = (id: number) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    onMarkAsRead(id);
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    onMarkAllAsRead();
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'quiz': return '📝';
      case 'plan': return '📅';
      case 'progress': return '📈';
      case 'offer': return '🎁';
      case 'system': return '🔔';
      default: return '📌';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  return (
    <div className="w-full max-w-md bg-[#1A120A] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#140E08]">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-lg">Notifications</h3>
          {unreadCount > 0 && (
            <div className="px-2.5 py-0.5 text-xs font-medium bg-[#C9874F] text-[#1A120A] rounded-full">
              {unreadCount} new
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-xs px-3 py-1.5 rounded-lg hover:bg-white/5 text-[#C9874F] transition-colors"
            >
              Mark all read
            </button>
          )}
          <button className="text-xs px-3 py-1.5 rounded-lg hover:bg-white/5 text-[#EDE0D4]/60 transition-colors">
            Settings
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="px-6 pt-4 flex gap-2 border-b border-white/10 pb-4">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-1.5 text-sm rounded-full transition-all ${
            filter === 'all' 
              ? 'bg-[#C9874F] text-[#1A120A] font-medium' 
              : 'bg-white/5 hover:bg-white/10'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-1.5 text-sm rounded-full transition-all flex items-center gap-2 ${
            filter === 'unread' 
              ? 'bg-[#C9874F] text-[#1A120A] font-medium' 
              : 'bg-white/5 hover:bg-white/10'
          }`}
        >
          Unread
          {unreadCount > 0 && (
            <span className="text-xs px-1.5 py-px rounded-full bg-white/20">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Notifications List */}
      <div className="max-h-[420px] overflow-y-auto">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => {
                if (!notification.read) handleMarkAsRead(notification.id);
                onNotificationClick?.(notification);
              }}
              className={`px-6 py-5 border-b border-white/10 cursor-pointer transition-all hover:bg-white/5 flex gap-4 ${
                !notification.read ? 'bg-[#C9874F]/5' : ''
              }`}
            >
              <div className="text-2xl mt-0.5 flex-shrink-0">
                {getNotificationIcon(notification.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-3">
                  <div className="font-medium text-[15px] leading-tight pr-2">
                    {notification.title}
                  </div>
                  <div className="text-xs text-[#EDE0D4]/50 whitespace-nowrap flex-shrink-0 mt-0.5">
                    {formatTimestamp(notification.timestamp)}
                  </div>
                </div>

                <p className="text-sm text-[#EDE0D4]/70 mt-1.5 leading-snug">
                  {notification.message}
                </p>

                {notification.actionLabel && (
                  <div className="mt-3">
                    <span className="inline-block text-xs px-3 py-1 rounded-full bg-[#C9874F]/20 text-[#C9874F] font-medium">
                      {notification.actionLabel}
                    </span>
                  </div>
                )}
              </div>

              {!notification.read && (
                <div className="w-2 h-2 rounded-full bg-[#C9874F] flex-shrink-0 mt-2" />
              )}
            </div>
          ))
        ) : (
          <div className="px-6 py-16 text-center">
            <div className="text-4xl mb-4 opacity-40">🔔</div>
            <div className="font-medium">You're all caught up</div>
            <p className="text-sm text-[#EDE0D4]/60 mt-1">No new notifications right now.</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-3 bg-[#140E08] border-t border-white/10 text-center">
        <button 
          onClick={() => window.location.href = '/notifications'}
          className="text-xs text-[#C9874F] hover:underline"
        >
          View all notifications →
        </button>
      </div>
    </div>
  );
}
