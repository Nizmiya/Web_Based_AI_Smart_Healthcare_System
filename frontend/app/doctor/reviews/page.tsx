'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { API_URL } from '@/lib/api';

const normalizeRecommendations = (value: any): string[] => {
  if (Array.isArray(value)) {
    return value.filter((item) => typeof item === 'string' && item.trim().length > 0);
  }
  if (typeof value === 'string' && value.trim().length > 0) {
    return [value.trim()];
  }
  return [];
};

export default function DoctorReviewsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'High' | 'Critical'>('all');
  const [selectedPrediction, setSelectedPrediction] = useState<any | null>(null);
  const [commentDraft, setCommentDraft] = useState('');
  const [sendToPatient, setSendToPatient] = useState(true);
  const [savingReview, setSavingReview] = useState(false);

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
    fetchPredictions(token);
  }, [router, filter]);

  const fetchPredictions = async (token: string) => {
    try {
      const riskLevel = filter === 'all' ? undefined : filter;
      const url = `${API_URL}/api/v1/predictions/all?reviewed=false${riskLevel ? `&risk_level=${riskLevel}` : ''}`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Filter for high risk only
        const highRisk = data.predictions?.filter((p: any) => 
          p.risk_level === 'High' || p.risk_level === 'Critical'
        ) || [];
        setPredictions(highRisk);
      }
    } catch (err) {
      console.error('Error fetching predictions:', err);
    } finally {
      setLoading(false);
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

  const getRiskColor = (risk: string) => {
    if (risk === 'Critical' || risk === 'High') return 'bg-red-100 text-red-800 border-red-300';
    if (risk === 'Medium') return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-green-100 text-green-800 border-green-300';
  };

  const getDiseaseName = (disease: string) => {
    return disease.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const openReviewModal = (pred: any) => {
    setSelectedPrediction(pred);
    const existing = pred.doctor_review?.comment || '';
    const recommendations = normalizeRecommendations(pred.recommendation);
    const aiDraft = recommendations.length
      ? `AI Recommendations:\n- ${recommendations.join('\n- ')}`
      : '';
    setCommentDraft(existing || aiDraft);
    setSendToPatient(true);
  };

  const closeReviewModal = () => {
    setSelectedPrediction(null);
    setCommentDraft('');
  };

  const clearDraft = () => {
    setSelectedPrediction(null);
    setCommentDraft('');
  };

  const sendReviewToPatient = async () => {
    if (!selectedPrediction) return;
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    const trimmed = commentDraft.trim();
    if (!trimmed) {
      return;
    }
    setSavingReview(true);
    try {
      const response = await fetch(
        `${API_URL}/api/v1/predictions/${selectedPrediction.id}/review`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            comment: trimmed,
            send_to_patient: sendToPatient,
          }),
        }
      );
      if (response.ok) {
        setPredictions((prev) => prev.filter((p) => p.id !== selectedPrediction.id));
        clearDraft();
      }
    } catch (err) {
      console.error('Failed to send review');
    } finally {
      setSavingReview(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* High Risk Alert Banner */}
      {predictions.length > 0 && (
        <div className="bg-red-600 text-white py-3 px-4 sticky top-0 z-50 shadow-lg">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="font-bold text-lg">HIGH RISK ALERT</p>
                <p className="text-sm text-red-100">
                  {predictions.length} patient{predictions.length > 1 ? 's' : ''} with high risk predictions require immediate review
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <header className={`bg-white shadow-sm border-b border-gray-200 sticky ${predictions.length > 0 ? 'top-12' : 'top-0'} z-40`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Link href="/doctor/dashboard" className="text-gray-600 hover:text-gray-900">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Review Predictions</h1>
                <p className="text-xs text-gray-500">High risk patient reviews</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All High Risk
              </button>
              <button
                onClick={() => setFilter('Critical')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'Critical' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Critical Only
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          {predictions.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-gray-600 text-lg font-medium">No high risk predictions to review</p>
              <p className="text-gray-500 text-sm mt-2">All patient predictions are within safe limits</p>
            </div>
          ) : (
            <div className="space-y-4">
              {predictions.map((pred: any) => (
                <div
                  key={pred.id}
                  className="border-2 border-red-200 bg-red-50 rounded-xl p-6 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getRiskColor(pred.risk_level)}`}>
                          {pred.risk_level} RISK
                        </span>
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                          {getDiseaseName(pred.disease_type)}
                        </span>
                      </div>
                      <h3 className="font-bold text-gray-900 text-lg mb-2">
                        Patient: {pred.patient_name || 'Unknown'}
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-gray-500">Risk Percentage</p>
                          <p className="font-semibold text-red-600 text-lg">{pred.risk_percentage?.toFixed(2)}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Confidence</p>
                          <p className="font-semibold text-gray-900">{pred.confidence?.toFixed(2) || 'N/A'}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Prediction</p>
                          <p className="font-semibold text-gray-900">{pred.prediction === 1 || pred.prediction === 'Positive' ? 'Positive' : 'Negative'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Date</p>
                          <p className="font-semibold text-gray-900 text-sm">
                            {pred.created_at ? new Date(pred.created_at).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                      </div>
                      {pred.patient_email && (
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Email:</span> {pred.patient_email}
                        </p>
                      )}
                    </div>
                    <div className="ml-4">
                      <button
                        onClick={() => openReviewModal(pred)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      >
                        Review & Comment
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {selectedPrediction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Review & Comment</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedPrediction.patient_name || 'Unknown'} · {getDiseaseName(selectedPrediction.disease_type)}
                </p>
              </div>
              <button
                onClick={closeReviewModal}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Risk Level</p>
                <p className="font-semibold text-gray-900">{selectedPrediction.risk_level}</p>
              </div>
              <div>
                <p className="text-gray-500">Risk Percentage</p>
                <p className="font-semibold text-gray-900">
                  {selectedPrediction.risk_percentage?.toFixed(2)}%
                </p>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Doctor Comment
              </label>
              <textarea
                value={commentDraft}
                onChange={(e) => setCommentDraft(e.target.value)}
                rows={4}
                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add your review notes and recommendations..."
              />
              <div className="mt-3 flex items-center gap-2">
                <input
                  id="sendToPatient"
                  type="checkbox"
                  checked={sendToPatient}
                  onChange={(e) => setSendToPatient(e.target.checked)}
                  className="h-4 w-4"
                />
                <label htmlFor="sendToPatient" className="text-sm text-gray-600">
                  Send to patient as notification
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                This will be saved to the database.
              </p>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={closeReviewModal}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={sendReviewToPatient}
                disabled={savingReview || !commentDraft.trim()}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {savingReview ? 'Sending...' : 'Confirm & Send'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

