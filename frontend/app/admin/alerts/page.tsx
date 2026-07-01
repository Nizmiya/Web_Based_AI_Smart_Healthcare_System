'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { markNotificationsReadOnView } from '@/lib/notificationRead';

const typeLabel: Record<string, string> = {
  doctor_leave: 'Doctor Leave',
  consultation: 'Consultation',
  doctor_review_admin: 'Doctor Review',
  high_risk: 'High Risk',
};

const typeLink: Record<string, string> = {
  doctor_leave: '/admin/leaves',
};

export default function AdminAlertsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (!token || !userData) {
      router.push('/login');
      return;
    }
    fetchAlerts();
  }, [router]);

  const fetchAlerts = async () => {
    try {
      const data = await api.notifications.list();
      const all = data.notifications || [];
      const marked = await markNotificationsReadOnView(
        all,
        (n) => n.type !== 'doctor_leave'
      );
      setAlerts(marked);
      setUnreadCount(marked.filter((a: any) => !a.is_read).length);
    } catch {
      setError('Connection error. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await api.notifications.markRead(id);
      setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, is_read: true } : a)));
      setUnreadCount((c) => Math.max(0, c - 1));
      window.dispatchEvent(new Event('notifications-updated'));
    } catch {
      console.error('Failed to mark as read');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Alerts</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-amber-700 mt-1">{unreadCount} unread alert(s)</p>
          )}
        </div>
        <Link href="/admin/leaves" className="text-sm text-purple-700 hover:underline">
          Doctor Leaves
        </Link>
      </div>
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}
      {alerts.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
          No alerts available.
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert: any) => (
            <div
              key={alert.id}
              className={`border rounded-xl p-4 bg-white ${alert.is_read ? 'border-gray-200' : 'border-amber-300'}`}
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-gray-900">{alert.title || 'Notification'}</p>
                    {alert.type && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                        {typeLabel[alert.type] || alert.type}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{alert.message || alert.content}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    {alert.created_at ? new Date(alert.created_at).toLocaleString() : ''}
                  </p>
                  {alert.type && typeLink[alert.type] && (
                    <Link
                      href={typeLink[alert.type]}
                      className="inline-block text-sm text-purple-700 hover:underline mt-2"
                    >
                      Manage leave
                    </Link>
                  )}
                </div>
                {!alert.is_read && (
                  <button
                    onClick={() => markAsRead(alert.id)}
                    className="text-sm text-blue-600 hover:text-blue-700 shrink-0"
                  >
                    Mark read
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
