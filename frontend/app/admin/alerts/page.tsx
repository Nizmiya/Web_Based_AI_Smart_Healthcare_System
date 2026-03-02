'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function AdminAlertsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (!token || !userData) {
      router.push('/login');
      return;
    }
    fetchAlerts(token);
  }, [router]);

  const fetchAlerts = async (token: string) => {
    try {
      const data = await api.notifications.list();
      setAlerts(data.notifications || []);
    } catch (err) {
      setError('Connection error. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      await api.notifications.markRead(id);
      setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, is_read: true } : a)));
    } catch (err) {
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
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Alerts</h1>
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
              className={`border rounded-xl p-4 bg-white ${alert.is_read ? 'border-gray-200' : 'border-blue-300'}`}
            >
              <div className="flex justify-between items-start gap-4">
                <div>
                  <p className="font-semibold text-gray-900">{alert.title || 'Notification'}</p>
                  <p className="text-sm text-gray-600 mt-1">{alert.message || alert.content}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    {alert.created_at ? new Date(alert.created_at).toLocaleString() : ''}
                  </p>
                </div>
                {!alert.is_read && (
                  <button
                    onClick={() => markAsRead(alert.id)}
                    className="text-sm text-blue-600 hover:text-blue-700"
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

