import { api } from '@/lib/api';

type NotificationRecord = {
  id: string;
  type?: string;
  is_read?: boolean;
  [key: string]: unknown;
};

/** Mark matching unread notifications as read and refresh sidebar badges. */
export async function markNotificationsReadOnView(
  notifications: NotificationRecord[],
  match: (n: NotificationRecord) => boolean
): Promise<NotificationRecord[]> {
  const unread = notifications.filter((n) => !n.is_read && match(n));
  if (unread.length === 0) return notifications;

  await Promise.all(unread.map((n) => api.notifications.markRead(n.id)));
  window.dispatchEvent(new Event('notifications-updated'));

  const readIds = new Set(unread.map((n) => n.id));
  return notifications.map((n) => (readIds.has(n.id) ? { ...n, is_read: true } : n));
}
