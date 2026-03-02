'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { API_URL } from '@/lib/api';

export default function DoctorDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [patients, setPatients] = useState<any[]>([]);
  const [recentPredictions, setRecentPredictions] = useState<any[]>([]);
  const [pendingReviews, setPendingReviews] = useState(0);
  const [highRiskCount, setHighRiskCount] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      router.push('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'doctor') {
      router.push('/login');
      return;
    }

    setUser(parsedUser);
    fetchData(token);
  }, [router]);

  const fetchData = async (token: string) => {
    try {
      // Fetch all predictions with high risk
      const response = await fetch(`${API_URL}/api/v1/predictions/all?risk_level=High&reviewed=false`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const highRisk = data.predictions?.filter((p: any) => 
          p.risk_level === 'High' || p.risk_level === 'Critical'
        ) || [];
        setHighRiskCount(highRisk.length);
        setPendingReviews(highRisk.length);
      }

      // Fetch notifications
      const notifResponse = await fetch(`${API_URL}/api/v1/notifications/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (notifResponse.ok) {
        const notifData = await notifResponse.json();
        setNotifications(notifData.notifications || []);
        setUnreadCount(notifData.notifications?.filter((n: any) => !n.is_read).length || 0);
      }

      // Fetch patients
      const patientsResponse = await fetch(`${API_URL}/api/v1/users/patients`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (patientsResponse.ok) {
        const patientsData = await patientsResponse.json();
        setPatients(patientsData.slice(0, 5)); // Show recent 5
      }

      // Fetch recent predictions with patient details
      const recentResponse = await fetch(`${API_URL}/api/v1/predictions/all?limit=5`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (recentResponse.ok) {
        const recentData = await recentResponse.json();
        setRecentPredictions(recentData.predictions || []);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
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

  const stats = [
    { title: 'Total Patients', value: patients.length, icon: '👥', color: 'blue', borderColor: 'border-blue-500', textColor: 'text-blue-600' },
    { title: 'Pending Reviews', value: pendingReviews, icon: '📋', color: 'orange', borderColor: 'border-orange-500', textColor: 'text-orange-600' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* High Risk Alert Banner */}
      {highRiskCount > 0 && (
        <div className="bg-red-600 text-white py-3 px-4 sticky top-0 z-50 shadow-lg">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="font-bold text-lg">HIGH RISK ALERT</p>
                <p className="text-sm text-red-100">
                  {highRiskCount} patient{highRiskCount > 1 ? 's' : ''} with high risk predictions require immediate attention
                </p>
              </div>
            </div>
            <Link
              href="/doctor/reviews"
              className="bg-white text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 font-semibold transition-colors flex items-center gap-2"
            >
              Review Now
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      )}

      {/* Header */}
      <header className={`bg-white shadow-sm border-b border-gray-200 sticky ${highRiskCount > 0 ? 'top-12' : 'top-0'} z-40`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-lg">D</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Doctor Dashboard</h1>
                <p className="text-xs text-gray-500">Dr. {user.full_name}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* Notification Icon */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)}></div>
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
                      <div className="p-4 border-b border-gray-200">
                        <h3 className="font-bold text-gray-900">Notifications</h3>
                        <p className="text-xs text-gray-500">{unreadCount} unread</p>
                      </div>
                      <div className="divide-y divide-gray-100">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center text-gray-500">
                            <p>No notifications</p>
                          </div>
                        ) : (
                          notifications.slice(0, 10).map((notif: any) => (
                            <div
                              key={notif.id}
                              className={`p-4 hover:bg-gray-50 cursor-pointer ${!notif.is_read ? 'bg-blue-50' : ''}`}
                              onClick={() => {
                                if (notif.type === 'high_risk') {
                                  router.push('/doctor/reviews');
                                }
                                setShowNotifications(false);
                              }}
                            >
                              <div className="flex items-start gap-3">
                                <div className={`w-2 h-2 rounded-full mt-2 ${!notif.is_read ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                                <div className="flex-1">
                                  <p className="font-semibold text-sm text-gray-900">{notif.title || 'High Risk Alert'}</p>
                                  <p className="text-xs text-gray-600 mt-1">{notif.message || notif.content}</p>
                                  <p className="text-xs text-gray-400 mt-1">
                                    {notif.created_at ? new Date(notif.created_at).toLocaleString() : 'Just now'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                      {notifications.length > 0 && (
                        <div className="p-3 border-t border-gray-200 text-center">
                          <Link
                            href="/doctor/notifications"
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                            onClick={() => setShowNotifications(false)}
                          >
                            View All Notifications
                          </Link>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              <div className="hidden md:flex items-center gap-2 text-right">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-gray-700 text-sm font-semibold">
                    {user.full_name?.charAt(0).toUpperCase() || 'D'}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Welcome back</p>
                  <p className="text-sm font-semibold text-gray-800">Dr. {user.full_name}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`bg-white border-l-4 ${stat.borderColor} rounded-xl p-6 shadow-sm hover:shadow-md transition-all`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium mb-2">{stat.title}</p>
                  <p className={`text-3xl font-bold ${stat.textColor}`}>{stat.value}</p>
                </div>
                <div className="text-4xl opacity-30">{stat.icon}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Quick Actions</h2>
              <p className="text-xs text-gray-500">Access frequently used features</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/doctor/patients"
              className="group bg-blue-50 border-2 border-blue-200 rounded-xl p-5 hover:bg-blue-100 hover:border-blue-400 transition-all"
            >
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">View Patients</h3>
              <p className="text-sm text-gray-600">Manage patient list</p>
            </Link>

            <Link
              href="/doctor/reviews"
              className="group bg-orange-50 border-2 border-orange-200 rounded-xl p-5 hover:bg-orange-100 hover:border-orange-400 transition-all relative"
            >
              {pendingReviews > 0 && (
                <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {pendingReviews}
                </span>
              )}
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Review Predictions</h3>
              <p className="text-sm text-gray-600">{pendingReviews} pending reviews</p>
            </Link>

            <Link
              href="/doctor/consultations"
              className="group bg-green-50 border-2 border-green-200 rounded-xl p-5 hover:bg-green-100 hover:border-green-400 transition-all"
            >
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Consultations</h3>
              <p className="text-sm text-gray-600">Schedule consultations</p>
            </Link>
          </div>
        </div>

        {/* Patient List */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Recent Patients</h2>
                <p className="text-xs text-gray-500">Latest patient records</p>
              </div>
            </div>
            <Link href="/doctor/patients" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View All
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase">Patient Name</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase">Condition</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase">Last Visit</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase">Risk Level</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase">Action</th>
                </tr>
              </thead>
              <tbody>
                {recentPredictions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500">
                      No patients found
                    </td>
                  </tr>
                ) : (
                  recentPredictions.map((pred: any, index: number) => {
                    const riskColors: any = {
                      High: 'bg-red-100 text-red-800 border-red-300',
                      Critical: 'bg-red-100 text-red-800 border-red-300',
                      Medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
                      Low: 'bg-green-100 text-green-800 border-green-300',
                    };
                    
                    return (
                      <tr key={pred.id || index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-4 font-medium text-gray-900">
                          {pred.patient_name || 'N/A'}
                        </td>
                        <td className="py-4 px-4 text-gray-600 capitalize">
                          {pred.disease_type?.replace('_', ' ') || '-'}
                        </td>
                        <td className="py-4 px-4 text-gray-600">
                          {pred.created_at ? new Date(pred.created_at).toLocaleDateString() : '-'}
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${riskColors[pred.risk_level] || riskColors.Medium}`}>
                            {pred.risk_level || '-'}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <Link
                            href={`/doctor/patients/${pred.user_id || ''}`}
                            className="text-blue-600 hover:text-blue-800 font-medium hover:underline flex items-center gap-1 text-sm"
                          >
                            View
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
