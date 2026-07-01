type NotificationItem = {
  type?: string;
  is_read?: boolean;
};

/** Unread count for a patient sidebar link based on notification type. */
export function getPatientNavBadgeCount(
  href: string,
  notifications: NotificationItem[]
): number {
  const unread = notifications.filter((n) => !n.is_read);

  if (href === '/patient/consultations') {
    return unread.filter((n) => n.type === 'consultation').length;
  }
  if (href === '/patient/alerts') {
    return unread.filter((n) => n.type !== 'consultation').length;
  }
  return 0;
}

/** Unread count for an admin sidebar link based on notification type. */
export function getAdminNavBadgeCount(
  href: string,
  notifications: NotificationItem[]
): number {
  const unread = notifications.filter((n) => !n.is_read);

  if (href === '/admin/leaves') {
    return unread.filter((n) => n.type === 'doctor_leave').length;
  }
  if (href === '/admin/alerts') {
    return unread.filter((n) => n.type !== 'doctor_leave').length;
  }
  return 0;
}
