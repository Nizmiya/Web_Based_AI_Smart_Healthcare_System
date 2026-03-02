'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function DoctorPatientProfilePage() {
  const router = useRouter();
  const params = useParams();
  const patientId = params?.patientId as string;
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [remark, setRemark] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingRemark, setSavingRemark] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (!token || !userData) {
      router.push('/login');
      return;
    }
    const parsed = JSON.parse(userData);
    if (parsed.role !== 'doctor' && parsed.role !== 'admin') {
      router.push('/login');
      return;
    }
    setUser(parsed);
    if (patientId) loadProfile();
  }, [router, patientId]);

  const loadProfile = async () => {
    if (!patientId) return;
    setLoading(true);
    try {
      const data = await api.users.getPatientProfile(patientId);
      setProfile(data);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to load patient profile.' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddRemark = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!remark.trim()) return;
    setSavingRemark(true);
    setMessage({ type: '', text: '' });
    try {
      await api.users.addPatientRemark(patientId, remark.trim());
      setRemark('');
      setMessage({ type: 'success', text: 'Remark added successfully.' });
      loadProfile();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to add remark.' });
    } finally {
      setSavingRemark(false);
    }
  };

  if (!user || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const list = (arr: any) => (Array.isArray(arr) ? arr : []).filter((x: any) => x);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Link href="/doctor/patients" className="text-gray-600 hover:text-gray-900">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Patient Profile</h1>
                <p className="text-sm text-gray-500">{profile?.full_name || 'Loading...'}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {message.text && (
          <div className={`p-4 rounded-lg ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
            {message.text}
          </div>
        )}

        {profile && (
          <>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Personal &amp; Medical Info</h2>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div><dt className="text-gray-500">Email</dt><dd className="font-medium text-gray-900">{profile.email || '—'}</dd></div>
                <div><dt className="text-gray-500">Phone</dt><dd className="font-medium text-gray-900">{profile.phone || '—'}</dd></div>
                <div><dt className="text-gray-500">Age</dt><dd className="font-medium text-gray-900">{profile.age ?? '—'}</dd></div>
                <div><dt className="text-gray-500">Gender</dt><dd className="font-medium text-gray-900">{profile.gender || '—'}</dd></div>
                <div className="sm:col-span-2"><dt className="text-gray-500">Address</dt><dd className="font-medium text-gray-900">{profile.address || '—'}</dd></div>
                <div className="sm:col-span-2"><dt className="text-gray-500">Emergency Contact</dt><dd className="font-medium text-gray-900">{profile.emergency_contact || '—'}</dd></div>
                <div className="sm:col-span-2"><dt className="text-gray-500">Medical History</dt><dd className="font-medium text-gray-900">{list(profile.medical_history).length ? list(profile.medical_history).join(', ') : '—'}</dd></div>
                <div className="sm:col-span-2"><dt className="text-gray-500">Allergies</dt><dd className="font-medium text-gray-900">{list(profile.allergies).length ? list(profile.allergies).join(', ') : '—'}</dd></div>
                <div className="sm:col-span-2"><dt className="text-gray-500">Current Medications</dt><dd className="font-medium text-gray-900">{list(profile.current_medications).length ? list(profile.current_medications).join(', ') : '—'}</dd></div>
              </dl>
            </div>

            {profile.doctor_remarks && profile.doctor_remarks.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Medical Remarks</h2>
                <ul className="space-y-3">
                  {profile.doctor_remarks.map((r: any, i: number) => (
                    <li key={i} className="border-l-4 border-green-500 pl-4 py-2 bg-gray-50 rounded-r">
                      <p className="text-gray-900">{r.remark}</p>
                      <p className="text-xs text-gray-500 mt-1">{r.doctor_name} · {r.created_at ? new Date(r.created_at).toLocaleString() : ''}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Add Medical Remark</h2>
              <form onSubmit={handleAddRemark} className="space-y-3">
                <textarea
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  placeholder="Enter your medical remark or note for this patient..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
                />
                <button
                  type="submit"
                  disabled={savingRemark || !remark.trim()}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {savingRemark ? 'Saving...' : 'Add Remark'}
                </button>
              </form>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
