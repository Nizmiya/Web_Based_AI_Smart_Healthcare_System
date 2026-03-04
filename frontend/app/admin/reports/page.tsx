'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function AdminReportsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [report, setReport] = useState<any>(null);
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
    loadReport();
  }, [router]);

  const loadReport = async () => {
    try {
      const data = await api.admin.getReportsSummary();
      setReport(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!user || loading) {
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link href="/admin/dashboard" className="text-gray-600 hover:text-gray-800">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Reports &amp; Analytics</h1>
                <p className="text-sm text-gray-500">Prediction statistics and system overview</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {report ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
                <p className="text-sm text-gray-500 font-medium">Total Patients</p>
                <p className="text-3xl font-bold text-gray-900">{report.total_patients ?? 0}</p>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
                <p className="text-sm text-gray-500 font-medium">Total Doctors</p>
                <p className="text-3xl font-bold text-gray-900">{report.total_doctors ?? 0}</p>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
                <p className="text-sm text-gray-500 font-medium">Total Predictions</p>
                <p className="text-3xl font-bold text-gray-900">{report.total_predictions ?? 0}</p>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500">
                <p className="text-sm text-gray-500 font-medium">High-Risk Predictions</p>
                <p className="text-3xl font-bold text-gray-900">{report.high_risk_predictions ?? 0}</p>
              </div>
            </div>

            {(report.total_consultations != null || report.consultations_scheduled != null) && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Consultations</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Total</p>
                    <p className="text-2xl font-bold text-gray-900">{report.total_consultations ?? 0}</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-600">Completed</p>
                    <p className="text-2xl font-bold text-green-700">{report.consultations_completed ?? 0}</p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600">Scheduled</p>
                    <p className="text-2xl font-bold text-blue-700">{report.consultations_scheduled ?? 0}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Predictions by Disease</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">Diabetes</p>
                  <p className="text-2xl font-bold text-blue-700">{report.predictions_by_disease?.diabetes ?? 0}</p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <p className="text-sm text-gray-600">Heart Disease</p>
                  <p className="text-2xl font-bold text-red-700">{report.predictions_by_disease?.heart_disease ?? 0}</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">Kidney Disease</p>
                  <p className="text-2xl font-bold text-green-700">{report.predictions_by_disease?.kidney_disease ?? 0}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center text-gray-500">
            Failed to load report. Make sure backend is running.
          </div>
        )}
      </main>
    </div>
  );
}
