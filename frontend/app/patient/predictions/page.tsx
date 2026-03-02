'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useLanguage } from '@/contexts/LanguageContext';

const normalizeRecommendations = (value: any): string[] => {
  if (Array.isArray(value)) {
    return value.filter((item) => typeof item === 'string' && item.trim().length > 0);
  }
  if (typeof value === 'string' && value.trim().length > 0) {
    return [value.trim()];
  }
  return [];
};

export default function PatientPredictionsPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const DISEASE_FILTER_OPTIONS = [
    { value: '', label: t('all') },
    { value: 'diabetes', label: t('diabetes') },
    { value: 'heart_disease', label: t('heartDisease') },
    { value: 'kidney_disease', label: t('kidneyDisease') },
  ];
  const [error, setError] = useState('');
  const [predictions, setPredictions] = useState<any[]>([]);
  const [diseaseFilter, setDiseaseFilter] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (!token || !userData) {
      router.push('/login');
      return;
    }
    fetchPredictions(token);
  }, [router, diseaseFilter]);

  const fetchPredictions = async (token: string) => {
    setLoading(true);
    try {
      const data = await api.predictions.history(diseaseFilter || undefined);
      setPredictions(data.predictions || []);
    } catch (err) {
      setError('Connection error. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('myPredictions')}</h1>
          <p className="text-sm text-gray-500">{t('yourRecentRisk')}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-sm text-gray-600">{t('filterByDisease')}</label>
          <select
            value={diseaseFilter}
            onChange={(e) => setDiseaseFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 text-sm"
          >
            {DISEASE_FILTER_OPTIONS.map((opt) => (
              <option key={opt.value || 'all'} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <Link
            href="/patient/predict/diabetes"
            className="px-3 py-2 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700"
          >
            {t('newPrediction')}
          </Link>
        </div>
      </div>

      {/* Quick Prediction Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          {
            title: t('diabetes'),
            description: t('checkYourRisk') + ' - ' + t('diabetes'),
            href: '/patient/predict/diabetes',
            icon: '🩺',
            gradient: 'from-blue-500 to-blue-600',
          },
          {
            title: t('heartDisease'),
            description: t('checkYourRisk') + ' - ' + t('heartDisease'),
            href: '/patient/predict/heart',
            icon: '❤️',
            gradient: 'from-red-500 to-red-600',
          },
          {
            title: t('kidneyDisease'),
            description: t('checkYourRisk') + ' - ' + t('kidneyDisease'),
            href: '/patient/predict/kidney',
            icon: '🔬',
            gradient: 'from-green-500 to-green-600',
          },
        ].map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className={`bg-gradient-to-br ${card.gradient} text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all`}
          >
            <div className="text-4xl mb-4">{card.icon}</div>
            <h3 className="text-xl font-bold mb-1">{card.title} Prediction</h3>
            <p className="text-white/80 text-sm">{card.description}</p>
          </Link>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* High Risk Details */}
      {predictions.filter((p) => p.risk_level === 'High' || p.risk_level === 'Critical').length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-red-200">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-red-600 text-xl">⚠️</span>
            <h2 className="text-2xl font-bold text-gray-800">High Risk Details</h2>
          </div>
          <p className="text-sm text-gray-600 mb-6">
            These predictions are marked High/Critical. Please consult a doctor for professional advice.
          </p>
          <div className="space-y-4">
            {predictions
              .filter((p) => p.risk_level === 'High' || p.risk_level === 'Critical')
              .map((pred: any) => (
                <div key={pred.id} className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold capitalize text-gray-800">
                        {pred.disease_type.replace('_', ' ')}
                      </p>
                      <p className="text-sm text-gray-600">
                        Risk: {pred.risk_percentage}% · Level: {pred.risk_level}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(pred.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="mt-3 text-sm text-gray-700">
                    <p className="font-semibold">Recommendations:</p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      {(normalizeRecommendations(pred.recommendation).length
                        ? normalizeRecommendations(pred.recommendation)
                        : ['Follow medical advice and monitor your health closely.']
                      ).map((item: string, index: number) => (
                        <li key={`${item}-${index}`}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  {pred.doctor_review?.comment && (
                    <div className="mt-3 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg p-3">
                      <p className="font-semibold text-gray-800">
                        Doctor Review {pred.doctor_review?.doctor_name ? `by ${pred.doctor_review.doctor_name}` : ''}
                      </p>
                      <p className="mt-1">{pred.doctor_review.comment}</p>
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}

      {predictions.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
          No predictions yet. Make your first prediction to get started.
        </div>
      ) : (
        <div className="space-y-4">
          {predictions.map((pred: any) => (
            <div key={pred.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold capitalize text-gray-800">
                    {pred.disease_type.replace('_', ' ')}
                  </p>
                  <p className="text-sm text-gray-600">
                    Risk: {pred.risk_percentage}% · Level: {pred.risk_level}
                  </p>
                </div>
                <span className="text-xs text-gray-500">
                  {pred.created_at ? new Date(pred.created_at).toLocaleDateString() : ''}
                </span>
              </div>
              <div className="mt-3 text-sm text-gray-700">
                <p className="font-semibold">Recommendations:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  {(normalizeRecommendations(pred.recommendation).length
                    ? normalizeRecommendations(pred.recommendation)
                    : ['Follow medical advice and monitor your health closely.']
                  ).map((item: string, index: number) => (
                    <li key={`${item}-${index}`}>{item}</li>
                  ))}
                </ul>
              </div>
              {pred.doctor_review?.comment && (
                <div className="mt-3 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <p className="font-semibold text-gray-800">
                    Doctor Review {pred.doctor_review?.doctor_name ? `by ${pred.doctor_review.doctor_name}` : ''}
                  </p>
                  <p className="mt-1">{pred.doctor_review.comment}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

