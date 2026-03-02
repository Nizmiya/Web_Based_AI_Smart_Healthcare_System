'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSelector from '@/components/LanguageSelector';
import { API_URL } from '@/lib/api';

export default function LoginPage() {
  const { t } = useLanguage();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [role] = useState<'patient'>('patient'); // Only patient can register
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${API_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          username: email,
          password: password,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        const userRole = data.user.role;
        if (userRole === 'admin') {
          router.push('/admin/dashboard');
        } else if (userRole === 'doctor') {
          router.push('/doctor/dashboard');
        } else {
          router.push('/patient/dashboard');
        }
      } else {
        const errorData = await response.json();
        setError(errorData.detail || t('error') + ': Login failed');
      }
    } catch (err) {
      setError('Connection error. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validate password length
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }
    if (password.length > 72) {
      setError('Password cannot be longer than 72 characters');
      setLoading(false);
      return;
    }

    try {
      const requestBody = {
        email,
        password,
        full_name: fullName,
        phone,
        role: 'patient', // Always patient for registration
      };
      
      console.log('Registering user:', { ...requestBody, password: '***' });
      
      const response = await fetch(`${API_URL}/api/v1/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Registration response status:', response.status);
      console.log('Registration response headers:', response.headers);

      if (response.ok) {
        const data = await response.json();
        console.log('Registration successful:', data);
        setSuccess('Account created successfully! Please login.');
        setTimeout(() => {
          setIsRegister(false);
          setEmail('');
          setPassword('');
          setFullName('');
          setPhone('');
        }, 2000);
      } else {
        let errorData;
        try {
          errorData = await response.json();
          console.error('Registration error response:', errorData);
        } catch (parseError) {
          const text = await response.text();
          console.error('Registration error (non-JSON):', text);
          errorData = { detail: text || 'Registration failed' };
        }
        setError(errorData.detail || `Registration failed (Status: ${response.status})`);
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      if (err.message && (err.message.includes('fetch') || err.message.includes('Failed to fetch'))) {
        setError(`Cannot connect to backend. Make sure backend is running on ${API_URL}`);
      } else {
        setError('Registration failed: ' + (err.message || 'Unknown error'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 p-3">
      {/* Language Selector */}
      <div className="absolute top-4 right-4 z-50">
        <LanguageSelector />
      </div>

      <div className="absolute inset-0 bg-black opacity-10"></div>
      
      <div className="relative w-full max-w-md">
        {/* Animated Background Elements */}
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-400 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-10 -right-10 w-60 h-60 bg-purple-400 rounded-full opacity-20 animate-pulse delay-1000"></div>
        
        <div className="bg-white/95 backdrop-blur-lg p-4 rounded-2xl shadow-2xl transform transition-all duration-300 hover:scale-[1.01]">
          {/* Logo/Header */}
          <div className="text-center mb-3">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full mb-2">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-0.5">
              {isRegister ? t('signUp') : t('signIn')}
            </h1>
            <p className="text-gray-600">
              {isRegister ? 'Create your account' : 'Sign in to access your dashboard'}
            </p>
          </div>

          {/* Toggle between Login and Register */}
          <div className="flex gap-2 mb-2 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => {
                setIsRegister(false);
                setError('');
                setSuccess('');
              }}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
                !isRegister
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {t('login')}
            </button>
            <button
              onClick={() => {
                setIsRegister(true);
                setError('');
                setSuccess('');
              }}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
                isRegister
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {t('register')}
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded-lg mb-3 animate-shake">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-3 rounded-lg mb-3">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>{success}</span>
              </div>
            </div>
          )}

          {isRegister ? (
            <form onSubmit={handleRegister} className="space-y-1.5">
              <div>
                <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700 mb-0.5">
                  {t('fullName')} <span className="text-red-500">*</span>
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-gray-900"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label htmlFor="regEmail" className="block text-sm font-semibold text-gray-700 mb-0.5">
                  {t('email')} <span className="text-red-500">*</span>
                </label>
                <input
                  id="regEmail"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-gray-900"
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <label htmlFor="regPhone" className="block text-sm font-semibold text-gray-700 mb-0.5">
                  {t('phone')} <span className="text-red-500">*</span>
                </label>
                <input
                  id="regPhone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-gray-900"
                  placeholder="+1234567890"
                />
              </div>

              <div>
                <label htmlFor="regRole" className="block text-sm font-semibold text-gray-700 mb-0.5">
                  {t('role')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value="Patient"
                  disabled
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl bg-gray-100 text-gray-600 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">Only patients can register. Doctors must be added by admin.</p>
              </div>

              <div>
                <label htmlFor="regPassword" className="block text-sm font-semibold text-gray-700 mb-0.5">
                  {t('password')} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="regPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  minLength={8}
                    maxLength={72}
                  className="w-full px-4 py-2 pr-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-gray-900"
                    placeholder="At least 8 characters"
                  />
                  <p className="text-xs text-gray-500 mt-1">Password must be at least 8 characters</p>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 px-4 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] shadow-lg"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t('loading')}...
                  </span>
                ) : (
                  t('createAccount')
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-3">
              <div className="space-y-0.5">
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                  {t('email')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none text-gray-900 placeholder-gray-400"
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>

              <div className="space-y-0.5">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                  {t('password')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  className="w-full pl-10 pr-12 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none text-gray-900 placeholder-gray-400"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                <div className="text-right">
                  <Link href="/forgot-password" className="text-xs text-blue-600 hover:text-blue-800">
                    {t('forgotPassword')}
                  </Link>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 px-4 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] shadow-lg"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t('loading')}...
                  </span>
                ) : (
                  t('signIn')
                )}
              </button>
            </form>
          )}

          <div className="mt-3 text-center">
            <Link href="/" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
              ← {t('back')} to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
