import { apiClient } from './api-client';
import { API_ENDPOINTS, env } from '@repo/config';

export type Notification = {
  id: string;
  title: string;
  desc?: string;
  time: string; // e.g., '2h', '1d'
  level: 'info' | 'warning' | 'danger';
  read: boolean;
};

const mockData: Notification[] = [
  { id: 'n1', title: 'Past due payments', desc: '2 schools are past due', time: '2h', level: 'warning', read: false },
  { id: 'n2', title: 'Subscription expiring', desc: '1 subscription expires in 3 days', time: '1d', level: 'danger', read: false },
  { id: 'n3', title: 'New signup', desc: 'Hill Top School created an account', time: '3d', level: 'info', read: true },
];

export async function getNotifications(): Promise<Notification[]> {
  if (env.useApiMocks) {
    // Simulate async
    return new Promise((resolve) => setTimeout(() => resolve(mockData), 200));
  }
  try {
    const response = await apiClient.get<Notification[]>(API_ENDPOINTS.NOTIFICATIONS);
    return response.data;
  } catch {
    // Fallback gracefully if API not ready
    return mockData;
  }
}

export async function markAllNotificationsRead(): Promise<void> {
  if (env.useApiMocks) return;
  try {
    await apiClient.post(API_ENDPOINTS.NOTIFICATIONS_MARK_ALL_READ);
  } catch {
    // ignore for now
  }
}

export async function clearNotifications(): Promise<void> {
  if (env.useApiMocks) return;
  try {
    await apiClient.post(API_ENDPOINTS.NOTIFICATIONS_CLEAR);
  } catch {
    // ignore for now
  }
}

// Lightweight subscription. Uses WS if configured; otherwise, a mock interval.
export function subscribeNotifications(onMessage: (n: Notification) => void): () => void {
  if (env.useApiMocks) {
    const interval = setInterval(() => {
      const n: Notification = {
        id: `mock-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,
        title: 'Payment received',
        desc: 'Invoice paid successfully',
        time: 'now',
        level: 'info',
        read: false,
      };
      onMessage(n);
    }, 20000);
    return () => clearInterval(interval);
  }

  if (typeof window === 'undefined' || !env.wsUrl) return () => {};
  try {
    const ws = new WebSocket(`${env.wsUrl}/notifications`);
    ws.onmessage = (evt) => {
      try {
        const data = JSON.parse(evt.data);
        // Assume API sends objects compatible with Notification
        onMessage({
          id: data.id ?? `ws-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,
          title: data.title ?? 'Notification',
          desc: data.desc,
          time: data.time ?? 'now',
          level: data.level ?? 'info',
          read: false,
        });
      } catch {
        // ignore malformed messages
      }
    };
    return () => ws.close();
  } catch {
    return () => {};
  }
}
