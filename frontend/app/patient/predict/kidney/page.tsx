'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import VideoRecommendations from '@/components/VideoRecommendations';
import { API_URL } from '@/lib/api';
import { useLanguage } from '@/contexts/LanguageContext';
import { validateRequiredNumber, firstError } from '@/lib/validations';
import { showSuccess, showError } from '@/lib/alerts';

const normalizeRecommendations = (value: any): string[] => {
  if (Array.isArray(value)) {
    return value.filter((item) => typeof item === 'string' && item.trim().length > 0);
  }
  if (typeof value === 'string' && value.trim().length > 0) {
    return [value.trim()];
  }
  return [];
};

export default function KidneyDiseasePrediction() {
  const router = useRouter();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    age: '',
    blood_pressure: '',
    specific_gravity: '',
    albumin: '',
    sugar: '',
    red_blood_cells: 'normal',
    pus_cell: 'normal',
    pus_cell_clumps: 'notpresent',
    bacteria: 'notpresent',
    blood_glucose_random: '',
    blood_urea: '',
    serum_creatinine: '',
    sodium: '140.0',
    potassium: '4.0',
    hemoglobin: '15.0',
    packed_cell_volume: '45.0',
    white_blood_cell_count: '8000.0',
    red_blood_cell_count: '5.0',
    hypertension: 'no',
    diabetes_mellitus: 'no',
    coronary_artery_disease: 'no',
    appetite: 'good',
    pedal_edema: 'no',
    anemia: 'no',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const validationErr = firstError(
      validateRequiredNumber(formData.age, 'Age', 1, 120),
      validateRequiredNumber(formData.blood_pressure, 'Blood pressure', 0, 300),
      validateRequiredNumber(formData.specific_gravity, 'Specific gravity', 0, 10),
      validateRequiredNumber(formData.albumin, 'Albumin', 0, 10),
      validateRequiredNumber(formData.sugar, 'Sugar', 0, 10),
      validateRequiredNumber(formData.blood_glucose_random, 'Blood glucose random', 0, 500),
      validateRequiredNumber(formData.blood_urea, 'Blood urea', 0, 500),
      validateRequiredNumber(formData.serum_creatinine, 'Serum creatinine', 0, 100),
    );
    if (validationErr) {
      setError(validationErr);
      await showError('Please fill all required fields', validationErr);
      return;
    }
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/v1/predictions/kidney-disease`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          age: parseInt(formData.age),
          blood_pressure: parseFloat(formData.blood_pressure),
          specific_gravity: parseFloat(formData.specific_gravity),
          albumin: parseFloat(formData.albumin),
          sugar: parseFloat(formData.sugar),
          red_blood_cells: formData.red_blood_cells,
          pus_cell: formData.pus_cell,
          pus_cell_clumps: formData.pus_cell_clumps,
          bacteria: formData.bacteria,
          blood_glucose_random: parseFloat(formData.blood_glucose_random),
          blood_urea: parseFloat(formData.blood_urea),
          serum_creatinine: parseFloat(formData.serum_creatinine),
          sodium: parseFloat(formData.sodium),
          potassium: parseFloat(formData.potassium),
          hemoglobin: parseFloat(formData.hemoglobin),
          packed_cell_volume: parseFloat(formData.packed_cell_volume),
          white_blood_cell_count: parseFloat(formData.white_blood_cell_count),
          red_blood_cell_count: parseFloat(formData.red_blood_cell_count),
          hypertension: formData.hypertension,
          diabetes_mellitus: formData.diabetes_mellitus,
          coronary_artery_disease: formData.coronary_artery_disease,
          appetite: formData.appetite,
          pedal_edema: formData.pedal_edema,
          anemia: formData.anemia,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setResult(data);
        await showSuccess('Prediction completed', 'Your kidney disease risk assessment result is ready.');
      } else {
        const errorData = await response.json();
        const msg = errorData.detail || 'Prediction failed';
        setError(msg);
        await showError('Prediction failed', msg);
      }
    } catch (err) {
      const msg = 'Connection error. Make sure backend is running.';
      setError(msg);
      await showError('Connection error', msg);
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <Link 
          href="/patient/dashboard" 
          className="inline-flex items-center gap-2 text-green-600 hover:text-green-800 mb-6 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          {t('backToDashboard')}
        </Link>

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-3xl">
                🔬
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">Kidney Disease Risk Prediction</h1>
                <p className="text-green-100">Enter your kidney function parameters to assess your kidney disease risk</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6 animate-shake">
                {error}
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
                  onClick={() => setResult(null)}
                  className="w-full bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 transition-colors font-semibold text-lg"
                >
                  {t('makeAnotherPrediction')}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-green-200">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Age <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={formData.age}
                        onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                        required
                        min="0"
                        max="120"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-gray-900"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Blood Pressure (mmHg) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={formData.blood_pressure}
                        onChange={(e) => setFormData({ ...formData, blood_pressure: e.target.value })}
                        required
                        min="0"
                        max="300"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-gray-900"
                        placeholder="Normal: 90-120 mmHg"
                      />
                    </div>
                  </div>
                </div>

                {/* Urine Analysis */}
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-green-200">Urine Analysis</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Specific Gravity <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.001"
                        value={formData.specific_gravity}
                        onChange={(e) => setFormData({ ...formData, specific_gravity: e.target.value })}
                        required
                        min="1.0"
                        max="1.05"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-gray-900"
                        placeholder="Normal: 1.005-1.030"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Albumin <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={formData.albumin}
                        onChange={(e) => setFormData({ ...formData, albumin: e.target.value })}
                        required
                        min="0"
                        max="5"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-gray-900"
                        placeholder="0-5"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Sugar <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={formData.sugar}
                        onChange={(e) => setFormData({ ...formData, sugar: e.target.value })}
                        required
                        min="0"
                        max="5"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-gray-900"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Red Blood Cells <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.red_blood_cells}
                        onChange={(e) => setFormData({ ...formData, red_blood_cells: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-gray-900"
                      >
                        <option value="normal">Normal</option>
                        <option value="abnormal">Abnormal</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Pus Cell <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.pus_cell}
                        onChange={(e) => setFormData({ ...formData, pus_cell: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-gray-900"
                      >
                        <option value="normal">Normal</option>
                        <option value="abnormal">Abnormal</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Pus Cell Clumps <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.pus_cell_clumps}
                        onChange={(e) => setFormData({ ...formData, pus_cell_clumps: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-gray-900"
                      >
                        <option value="notpresent">Not Present</option>
                        <option value="present">Present</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Bacteria <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.bacteria}
                        onChange={(e) => setFormData({ ...formData, bacteria: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-gray-900"
                      >
                      <option value="notpresent">Not Present</option>
                      <option value="present">Present</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Blood Tests */}
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-green-200">Blood Tests</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Blood Glucose Random (mg/dl) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={formData.blood_glucose_random}
                        onChange={(e) => setFormData({ ...formData, blood_glucose_random: e.target.value })}
                        required
                        min="0"
                        max="600"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-gray-900"
                        placeholder="Normal: 70-100 mg/dl"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Blood Urea (mg/dl) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={formData.blood_urea}
                        onChange={(e) => setFormData({ ...formData, blood_urea: e.target.value })}
                        required
                        min="0"
                        max="200"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-gray-900"
                        placeholder="Normal: 7-20 mg/dl"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Serum Creatinine (mg/dl) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.serum_creatinine}
                        onChange={(e) => setFormData({ ...formData, serum_creatinine: e.target.value })}
                        required
                        min="0"
                        max="10"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-gray-900"
                        placeholder="Normal: 0.6-1.2 mg/dl"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Sodium (mEq/L) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.sodium}
                        onChange={(e) => setFormData({ ...formData, sodium: e.target.value })}
                        required
                        min="0"
                        max="200"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-gray-900"
                        placeholder="Normal: 135-145 mEq/L"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Potassium (mEq/L) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.potassium}
                        onChange={(e) => setFormData({ ...formData, potassium: e.target.value })}
                        required
                        min="0"
                        max="10"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-gray-900"
                        placeholder="Normal: 3.5-5.0 mEq/L"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Hemoglobin (g/dl) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.hemoglobin}
                        onChange={(e) => setFormData({ ...formData, hemoglobin: e.target.value })}
                        required
                        min="0"
                        max="20"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-gray-900"
                        placeholder="Normal: 12-16 g/dl"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Packed Cell Volume (%) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.packed_cell_volume}
                        onChange={(e) => setFormData({ ...formData, packed_cell_volume: e.target.value })}
                        required
                        min="0"
                        max="100"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-gray-900"
                        placeholder="Normal: 36-46%"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        White Blood Cell Count <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.white_blood_cell_count}
                        onChange={(e) => setFormData({ ...formData, white_blood_cell_count: e.target.value })}
                        required
                        min="0"
                        max="20000"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-gray-900"
                        placeholder="Normal: 4000-11000"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Red Blood Cell Count (millions/cmm) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.red_blood_cell_count}
                        onChange={(e) => setFormData({ ...formData, red_blood_cell_count: e.target.value })}
                        required
                        min="0"
                        max="10"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-gray-900"
                        placeholder="Normal: 4.5-5.5 millions/cmm"
                      />
                    </div>
                  </div>
                </div>

                {/* Medical History */}
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-green-200">Medical History</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Hypertension
                      </label>
                      <select
                        value={formData.hypertension}
                        onChange={(e) => setFormData({ ...formData, hypertension: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-gray-900"
                      >
                        <option value="no">No</option>
                        <option value="yes">Yes</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Diabetes Mellitus
                      </label>
                      <select
                        value={formData.diabetes_mellitus}
                        onChange={(e) => setFormData({ ...formData, diabetes_mellitus: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-gray-900"
                      >
                        <option value="no">No</option>
                        <option value="yes">Yes</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Coronary Artery Disease
                      </label>
                      <select
                        value={formData.coronary_artery_disease}
                        onChange={(e) => setFormData({ ...formData, coronary_artery_disease: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-gray-900"
                      >
                        <option value="no">No</option>
                        <option value="yes">Yes</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Appetite
                      </label>
                      <select
                        value={formData.appetite}
                        onChange={(e) => setFormData({ ...formData, appetite: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-gray-900"
                      >
                        <option value="good">Good</option>
                        <option value="poor">Poor</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Pedal Edema
                      </label>
                      <select
                        value={formData.pedal_edema}
                        onChange={(e) => setFormData({ ...formData, pedal_edema: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-gray-900"
                      >
                        <option value="no">No</option>
                        <option value="yes">Yes</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Anemia
                      </label>
                      <select
                        value={formData.anemia}
                        onChange={(e) => setFormData({ ...formData, anemia: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-gray-900"
                      >
                        <option value="no">No</option>
                        <option value="yes">Yes</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <strong>Note:</strong> Some fields have default values. Modify them based on your actual test results for accurate prediction.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-xl hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95"
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
                    'Get Kidney Disease Risk Prediction'
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
