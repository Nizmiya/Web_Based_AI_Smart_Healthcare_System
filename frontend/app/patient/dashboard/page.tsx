'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import LanguageSelector from '@/components/LanguageSelector';
import { API_URL } from '@/lib/api';
import { useLanguage } from '@/contexts/LanguageContext';

export default function PatientDashboard() {
  const router = useRouter();
  const { t } = useLanguage();
  const [user, setUser] = useState<any>(null);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [highRiskPredictions, setHighRiskPredictions] = useState<any[]>([]);
  const [highRiskAlerts, setHighRiskAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const highRiskSectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      router.push('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'patient') {
      router.push('/login');
      return;
    }

    setUser(parsedUser);
    loadPredictions(token);
  }, [router]);

  const loadPredictions = async (token: string) => {
    try {
      const response = await fetch(`${API_URL}/api/v1/predictions/history`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        const allPredictions = data.predictions || [];
        setPredictions(allPredictions);
        // Filter high risk predictions
        const highRisk = allPredictions.filter((p: any) => 
          p.risk_level === 'High' || p.risk_level === 'Critical'
        );
        setHighRiskPredictions(highRisk);
        // Alerts should clear once doctor has reviewed
        const highRiskUnreviewed = highRisk.filter((p: any) => !p.reviewed);
        setHighRiskAlerts(highRiskUnreviewed);
      }
    } catch (err) {
      console.error('Failed to load predictions');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };


  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('loading')}</p>
        </div>
      </div>
    );
  }

  const stats = [
    { title: t('totalPredictions'), value: predictions.length, color: 'border-blue-500 text-blue-600' },
    { title: t('highRisk'), value: highRiskPredictions.length, color: 'border-red-500 text-red-600' },
    { title: t('reviewed'), value: predictions.filter((p: any) => p.reviewed).length, color: 'border-green-500 text-green-600' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* High Risk Alert Banner */}
      {highRiskAlerts.length > 0 && (
        <div className="bg-red-600 text-white py-3 px-4 sticky top-0 z-50 shadow-lg">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="font-bold text-lg">{t('highRiskAlertBanner')}</p>
                <p className="text-sm text-red-100">
                  {t('highRiskAlertMessage', { count: highRiskAlerts.length })}
                </p>
              </div>
            </div>
            <Link
              href="/patient/alerts"
              className="bg-white text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 font-semibold transition-colors inline-block"
            >
              {t('viewDetails')}
            </Link>
          </div>
        </div>
      )}

      {/* Header */}
      <header className={`bg-white/80 backdrop-blur-md shadow-md sticky ${highRiskAlerts.length > 0 ? 'top-12' : 'top-0'} z-40`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">P</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{t('patientDashboard')}</h1>
                <p className="text-sm text-gray-500">{t('yourHealthAtGlance')}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:block">
                <LanguageSelector />
              </div>
              <div className="text-right hidden md:block">
                <p className="text-sm text-gray-500">{t('welcome')},</p>
                <p className="font-semibold text-gray-800">{user.full_name}</p>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors shadow-md flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                {t('logout')}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-xl p-8 mb-8 text-white">
          <h2 className="text-3xl font-bold mb-2">{t('welcomeBack')}, {user.full_name}!</h2>
          <p className="text-blue-100 text-lg">{t('takeControlHealth')}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className={`bg-white border-l-4 ${stat.color} rounded-xl p-6 shadow-sm`}>
              <p className="text-gray-500 text-sm font-medium mb-2">{stat.title}</p>
              <p className={`text-3xl font-bold ${stat.color.split(' ')[1]}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {highRiskAlerts.length > 0 && (
          <div ref={highRiskSectionRef} className="bg-red-50 border border-red-200 rounded-2xl shadow-sm p-6 mb-8">
            <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-red-600 text-xl">⚠️</span>
                <h3 className="font-bold text-lg text-red-700">{t('highRiskDetails')}</h3>
              </div>
              <Link
                href="/patient/predictions"
                className="text-sm text-red-700 hover:text-red-800 font-semibold"
              >
                {t('viewAllPredictions')}
              </Link>
            </div>
            <div className="space-y-3">
              {highRiskAlerts.map((alert: any) => (
                <div key={alert.id || alert._id} className="bg-white border border-red-100 rounded-xl p-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <p className="font-semibold text-gray-800 capitalize">
                      {alert.disease_type?.replace('_', ' ') || 'Prediction'}
                    </p>
                    <span className="text-xs text-gray-500">
                      {alert.created_at ? new Date(alert.created_at).toLocaleDateString() : ''}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {t('riskLabel')}: {alert.risk_percentage}% · {t('levelLabel')}: {alert.risk_level}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h3 className="font-bold text-lg mb-4 text-gray-800">{t('quickActions')}</h3>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/patient/predictions"
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              {t('viewPredictions')}
            </Link>
            <Link
              href="/patient/predict/diabetes"
              className="px-4 py-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
            >
              {t('newPrediction')}
            </Link>
            <Link
              href="/patient/alerts"
              className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
            >
              {t('viewAlerts')}
            </Link>
            <Link
              href="/patient/chatbot"
              className="px-4 py-2 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors"
            >
              Chatbot
            </Link>
          </div>
        </div>

        {/* Analysis */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="font-bold text-lg mb-4 text-gray-800">{t('analysis')}</h3>
          <p className="text-sm text-gray-600">
            {t('analysisPlaceholder')}
          </p>
        </div>
      </main>
    </div>
  );
}
