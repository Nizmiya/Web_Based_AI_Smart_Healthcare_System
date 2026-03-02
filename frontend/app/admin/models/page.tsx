'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function AdminModelsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [data, setData] = useState<{ models?: string[]; path?: string } | null>(null);
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
    loadModels();
  }, [router]);

  const loadModels = async () => {
    try {
      const res = await api.admin.getModels();
      setData(res);
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

  const models = data?.models ?? [];

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
                <h1 className="text-2xl font-bold text-gray-800">ML Models</h1>
                <p className="text-sm text-gray-500">View deployed model files</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          {data?.path && (
            <p className="text-sm text-gray-500 mb-4">
              Path: <code className="bg-gray-100 px-2 py-1 rounded">{data.path}</code>
            </p>
          )}
          {models.length === 0 ? (
            <p className="text-gray-500">No model files found. Train and save models to the backend ml_models folder.</p>
          ) : (
            <ul className="space-y-2">
              {models.map((name) => (
                <li key={name} className="flex items-center gap-2 py-2 border-b border-gray-100 last:border-0">
                  <span className="text-blue-600 font-mono text-sm">{name}</span>
                  {name.endsWith('.pkl') && (
                    <span className="text-xs text-gray-400">model / scaler / encoders</span>
                  )}
                  {name === 'threshold.json' && (
                    <span className="text-xs text-gray-400">risk thresholds</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
