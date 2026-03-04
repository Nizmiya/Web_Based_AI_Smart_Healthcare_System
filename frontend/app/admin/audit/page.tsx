'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function AdminAuditPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (!token || !userData) {
      router.push('/login');
      return;
    }
    const parsed = JSON.parse(userData);
    if (parsed.role !== 'admin') {
      router.push('/login');
      return;
    }
    setUser(parsed);
    loadLogs();
  }, [router]);

  const loadLogs = async () => {
    try {
      const res = await api.admin.getAuditLogs({ limit: 100 });
      setLogs(res?.logs ?? []);
      setTotal(res?.total ?? 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!user || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 space-x-3">
            <Link href="/admin/dashboard" className="text-gray-600 hover:text-gray-900">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Audit Log</h1>
              <p className="text-xs text-gray-500">Who accessed which patient data and when</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">Recent activity</h2>
            <span className="text-sm text-gray-500">Total: {total}</span>
          </div>
          {logs.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              No audit entries yet. Activity will appear when doctors or admins view patient profiles or records.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase">Time</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase">User ID</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase">Role</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase">Action</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase">Patient ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {logs.map((log: any) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {log.created_at ? new Date(log.created_at).toLocaleString() : '—'}
                      </td>
                      <td className="py-3 px-4 text-sm font-mono text-gray-800">{log.user_id?.slice(0, 8)}...</td>
                      <td className="py-3 px-4 text-sm text-gray-700">{log.role}</td>
                      <td className="py-3 px-4 text-sm text-gray-700">{log.action}</td>
                      <td className="py-3 px-4 text-sm font-mono text-gray-600">{log.patient_id || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
