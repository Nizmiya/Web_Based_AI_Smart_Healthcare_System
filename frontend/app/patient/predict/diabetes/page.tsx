'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import VideoRecommendations from '@/components/VideoRecommendations';
import { API_URL } from '@/lib/api';
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

export default function DiabetesPrediction() {
  const router = useRouter();
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    pregnancies: '',
    glucose: '',
    blood_pressure: '',
    skin_thickness: '',
    insulin: '',
    bmi: '',
    diabetes_pedigree_function: '',
    age: '',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/v1/predictions/diabetes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          pregnancies: parseInt(formData.pregnancies),
          glucose: parseFloat(formData.glucose),
          blood_pressure: parseFloat(formData.blood_pressure),
          skin_thickness: parseFloat(formData.skin_thickness),
          insulin: parseFloat(formData.insulin),
          bmi: parseFloat(formData.bmi),
          diabetes_pedigree_function: parseFloat(formData.diabetes_pedigree_function),
          age: parseInt(formData.age),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setResult(data);
        // Parameters are automatically saved to patient_records by backend
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Prediction failed');
      }
    } catch (err) {
      setError('Connection error. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const riskColors: any = {
    Critical: 'from-red-500 to-red-600',
    High: 'from-orange-500 to-orange-600',
    Medium: 'from-yellow-500 to-yellow-600',
    Low: 'from-green-500 to-green-600',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-4">
      <div className="max-w-6xl mx-auto px-4">
        <Link 
          href="/patient/dashboard" 
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          {t('backToDashboard')}
        </Link>

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl">
                🩺
              </div>
              <div>
                <h1 className="text-2xl font-bold mb-1">Diabetes Risk Prediction</h1>
                <p className="text-blue-100">Enter your health parameters to assess your diabetes risk</p>
              </div>
            </div>
          </div>

          <div className="p-5">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded-lg mb-4 animate-shake">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span>{error}</span>
                </div>
              </div>
            )}

            {result ? (
              <div className="space-y-6">
                <div className={`bg-gradient-to-r ${riskColors[result.risk_level] || riskColors.Medium} text-white p-8 rounded-2xl shadow-xl`}>
                  <h2 className="text-3xl font-bold mb-6">{t('predictionResult')}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white/20 backdrop-blur-sm p-4 rounded-xl">
                      <p className="text-white/80 mb-1">{t('riskLevel')}</p>
                      <p className="text-2xl font-bold">{result.risk_level}</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm p-4 rounded-xl">
                      <p className="text-white/80 mb-1">{t('riskPercentage')}</p>
                      <p className="text-2xl font-bold">{result.risk_percentage}%</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm p-4 rounded-xl">
                      <p className="text-white/80 mb-1">{t('prediction')}</p>
                      <p className="text-2xl font-bold">{result.prediction}</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm p-4 rounded-xl">
                      <p className="text-white/80 mb-1">{t('confidence')}</p>
                      <p className="text-2xl font-bold">{result.confidence}%</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-xl">
                  <h3 className="font-bold text-lg mb-4">{t('recommendationsTitle')}</h3>
                  <ul className="list-disc pl-5 text-gray-700 space-y-2">
                    {(normalizeRecommendations(result.recommendation).length
                      ? normalizeRecommendations(result.recommendation)
                      : [t('followHealthyFallback')]
                    ).map((item: string, index: number) => (
                      <li key={`${item}-${index}`}>{item}</li>
                    ))}
                  </ul>
                </div>

                {(result as any).doctor_recommendation?.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 p-6 rounded-xl">
                    <h3 className="font-bold text-lg mb-4 text-blue-800">{t('forYourDoctor')}</h3>
                    <p className="text-sm text-blue-700 mb-3">{t('clinicalFollowUp')}</p>
                    <ul className="list-disc pl-5 text-blue-800 space-y-2">
                      {normalizeRecommendations((result as any).doctor_recommendation).map((item: string, index: number) => (
                        <li key={`dr-${index}`}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <VideoRecommendations videos={result.video_recommendations || []} />

                <button
                  onClick={() => {
                    setResult(null);
                    setFormData({
                      pregnancies: '',
                      glucose: '',
                      blood_pressure: '',
                      skin_thickness: '',
                      insulin: '',
                      bmi: '',
                      diabetes_pedigree_function: '',
                      age: '',
                    });
                  }}
                  className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition-colors font-semibold text-lg"
                >
                  {t('makeAnotherPrediction')}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Number of Pregnancies <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.pregnancies}
                      onChange={(e) => setFormData({ ...formData, pregnancies: e.target.value })}
                      required
                      min="0"
                      max="20"
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
                      placeholder="Enter number"
                    />
                    <p className="text-xs text-gray-500 mt-1">For females only</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Glucose Level (mg/dL) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.glucose}
                      onChange={(e) => setFormData({ ...formData, glucose: e.target.value })}
                      required
                      min="0"
                      max="600"
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
                      placeholder="Normal: 70-100 mg/dL"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Blood Pressure (mmHg) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.blood_pressure}
                      onChange={(e) => setFormData({ ...formData, blood_pressure: e.target.value })}
                      required
                      min="0"
                      max="200"
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
                      placeholder="Normal: 90-120 mmHg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Skin Thickness (mm) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.skin_thickness}
                      onChange={(e) => setFormData({ ...formData, skin_thickness: e.target.value })}
                      required
                      min="0"
                      max="100"
                      step="0.1"
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
                      placeholder="Triceps skinfold thickness"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Insulin Level (μU/ml) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.insulin}
                      onChange={(e) => setFormData({ ...formData, insulin: e.target.value })}
                      required
                      min="0"
                      max="846"
                      step="0.1"
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
                      placeholder="Normal: 2-25 μU/ml"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      BMI (Body Mass Index) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.bmi}
                      onChange={(e) => setFormData({ ...formData, bmi: e.target.value })}
                      required
                      min="0"
                      max="100"
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
                      placeholder="Normal: 18.5-24.9"
                    />
                    <p className="text-xs text-gray-500 mt-1">Weight (kg) / Height (m)²</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Diabetes Pedigree Function <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.001"
                      value={formData.diabetes_pedigree_function}
                      onChange={(e) => setFormData({ ...formData, diabetes_pedigree_function: e.target.value })}
                      required
                      min="0"
                      max="3"
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
                      placeholder="Family history function"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Age (years) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      required
                      min="0"
                      max="120"
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
                      placeholder="Enter your age"
                    />
                  </div>
                </div>

                <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <strong>Note:</strong> All fields are required. Please enter accurate values from your recent medical reports for best results.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg shadow-lg transition-all duration-200 transform hover:scale-[1.01] active:scale-[0.99]"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Analyzing...
                    </span>
                  ) : (
                    'Get Diabetes Risk Prediction'
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
