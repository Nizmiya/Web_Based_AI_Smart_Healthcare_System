'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function PatientProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profile, setProfile] = useState({
    full_name: '',
    email: '',
    phone: '',
    age: '' as string | number,
    gender: '',
    address: '',
    emergency_contact: '',
    medical_history: [] as string[],
    allergies: [] as string[],
    current_medications: [] as string[],
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (!token || !userData) {
      router.push('/login');
      return;
    }
    loadProfile(token);
  }, [router]);

  const toList = (v: any): string[] =>
    Array.isArray(v) ? v.filter((x) => typeof x === 'string' && x.trim()) : [];
  const fromList = (arr: string[]) => (arr.length ? arr.join('\n') : '');

  const loadProfile = async (_token: string) => {
    try {
      const data = await api.users.profile();
      setProfile({
        full_name: data?.full_name || '',
        email: data?.email || '',
        phone: data?.phone || '',
        age: data?.age ?? '',
        gender: data?.gender || '',
        address: data?.address || '',
        emergency_contact: data?.emergency_contact || '',
        medical_history: toList(data?.medical_history),
        allergies: toList(data?.allergies),
        current_medications: toList(data?.current_medications),
      });
    } catch (err) {
      setError('Connection error. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key: string, value: string | number) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  };
  const handleListChange = (key: 'medical_history' | 'allergies' | 'current_medications', text: string) => {
    const arr = text.split(/\n/).map((s) => s.trim()).filter(Boolean);
    setProfile((prev) => ({ ...prev, [key]: arr }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      await api.users.updateProfile({
        full_name: profile.full_name,
        email: profile.email,
        phone: profile.phone,
        ...(profile.age !== '' && { age: Number(profile.age) || undefined }),
        ...(profile.gender && { gender: profile.gender }),
        address: profile.address || undefined,
        emergency_contact: profile.emergency_contact || undefined,
        medical_history: profile.medical_history,
        allergies: profile.allergies,
        current_medications: profile.current_medications,
      });
      setSuccess('Profile updated successfully');
      const userData = localStorage.getItem('user');
      if (userData) {
        const parsed = JSON.parse(userData);
        localStorage.setItem('user', JSON.stringify({
          ...parsed,
          full_name: profile.full_name,
          email: profile.email,
          phone: profile.phone,
        }));
      }
    } catch (err) {
      setError('Connection error. Make sure backend is running.');
    } finally {
      setSaving(false);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <Link
          href="/patient/dashboard"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Dashboard
        </Link>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
            <h1 className="text-2xl font-bold">Update Profile</h1>
            <p className="text-blue-100 text-sm">View and update your personal details</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-lg">
                {success}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={profile.full_name}
                onChange={(e) => handleChange('full_name', e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => handleChange('email', e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Phone
              </label>
              <input
                type="text"
                value={profile.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Age</label>
              <input
                type="number"
                min={0}
                value={profile.age === '' ? '' : profile.age}
                onChange={(e) => handleChange('age', e.target.value === '' ? '' : e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Gender</label>
              <select
                value={profile.gender}
                onChange={(e) => handleChange('gender', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-gray-900"
              >
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
              <input
                type="text"
                value={profile.address}
                onChange={(e) => handleChange('address', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Emergency Contact</label>
              <input
                type="text"
                value={profile.emergency_contact}
                onChange={(e) => handleChange('emergency_contact', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Medical History (one per line)</label>
              <textarea
                value={fromList(profile.medical_history)}
                onChange={(e) => handleListChange('medical_history', e.target.value)}
                rows={3}
                placeholder="e.g. Hypertension, Diabetes Type 2"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Allergies (one per line)</label>
              <textarea
                value={fromList(profile.allergies)}
                onChange={(e) => handleListChange('allergies', e.target.value)}
                rows={2}
                placeholder="e.g. Penicillin, Peanuts"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Current Medications (one per line)</label>
              <textarea
                value={fromList(profile.current_medications)}
                onChange={(e) => handleListChange('current_medications', e.target.value)}
                rows={2}
                placeholder="e.g. Metformin 500mg"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition-colors font-semibold text-lg disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

