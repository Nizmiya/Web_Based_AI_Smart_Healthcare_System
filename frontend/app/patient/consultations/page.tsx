'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { formatAppointmentDateTime } from '@/lib/datetime';
import { markNotificationsReadOnView } from '@/lib/notificationRead';

export default function PatientConsultationsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [consultations, setConsultations] = useState<any[]>([]);
  const [consultationAlerts, setConsultationAlerts] = useState<any[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (!token || !userData) {
      router.push('/login');
      return;
    }
    loadData();
  }, [router]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [consRes, notifRes] = await Promise.all([
        api.consultations.list(),
        api.notifications.list(),
      ]);
      setConsultations(consRes.consultations || []);
      const alerts = (notifRes.notifications || []).filter(
        (n: any) => n.type === 'consultation'
      );
      const marked = await markNotificationsReadOnView(alerts, () => true);
      setConsultationAlerts(marked);
    } catch {
      setError('Failed to load consultations. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const markAlertRead = async (id: string) => {
    try {
      await api.notifications.markRead(id);
      setConsultationAlerts((prev) =>
        prev.map((a) => (a.id === id ? { ...a, is_read: true } : a))
      );
      window.dispatchEvent(new Event('notifications-updated'));
    } catch {
      console.error('Failed to mark notification as read');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  const unreadAlerts = consultationAlerts.filter((a) => !a.is_read);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Doctor Consultant</h1>
        <p className="text-sm text-gray-600 mt-1">
          View consultations scheduled by your doctors.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      )}

      {unreadAlerts.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-semibold text-blue-900">
              New consultation alerts ({unreadAlerts.length})
            </h2>
            <Link href="/patient/alerts" className="text-sm text-blue-700 hover:underline">
              All alerts
            </Link>
          </div>
          {unreadAlerts.map((alert) => (
            <div
              key={alert.id}
              className="bg-white border border-blue-100 rounded-lg p-3 flex justify-between gap-3"
            >
              <div>
                <p className="font-medium text-gray-900">{alert.title}</p>
                <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {alert.created_at ? new Date(alert.created_at).toLocaleString() : ''}
                </p>
              </div>
              <button
                onClick={() => markAlertRead(alert.id)}
                className="text-sm text-blue-600 hover:text-blue-800 shrink-0"
              >
                Mark read
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">My Consultations</h2>
          <span className="text-sm text-gray-500">{consultations.length} total</span>
        </div>
        {consultations.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            No consultations yet. Your doctor will schedule one when needed.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase">Doctor</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase">Scheduled</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {consultations.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <p className="font-medium text-gray-900">{c.doctor_name || 'Doctor'}</p>
                      {c.doctor_specialization && (
                        <p className="text-xs text-gray-500 capitalize">{c.doctor_specialization.replace(/_/g, ' ')}</p>
                      )}
                    </td>
                    <td className="py-4 px-4 text-gray-600">
                      {formatAppointmentDateTime(c.scheduled_at)}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          c.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : c.status === 'cancelled'
                              ? 'bg-gray-100 text-gray-800'
                              : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-600 text-sm">{c.notes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
