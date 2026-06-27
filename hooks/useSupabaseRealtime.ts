export interface Notification {
  id: number;
  user_id: string;
  title: string;
  message: string;
  type: 'quiz' | 'plan' | 'progress' | 'offer' | 'system';
  read: boolean;
  created_at: string;
  timestamp: string;
  actionLabel?: string;
  actionUrl?: string;
  data?: Record<string, any>;
}

export function useSupabaseRealtime({ userId, limit }: { userId: string; limit?: number }) {
  return {
    notifications: [] as Notification[],
    loading: false,
    error: null as string | null,
    markAsRead: async (_id: number) => {},
    markAllAsRead: async () => {},
    deleteNotification: async (_id: string) => {},
  };
}
