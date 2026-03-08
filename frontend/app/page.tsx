'use client';

import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSelector from '@/components/LanguageSelector';
import { useState, useEffect } from 'react';

export default function Home() {
  const { t } = useLanguage();
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'about', 'instructions'];
      const scrollPosition = window.scrollY + 200;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const heroBgImage = '/Home.jpg';

  return (
    <main className="min-h-screen bg-slate-800 relative overflow-hidden">
      {/* Hero background: hospital / medical scene */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBgImage})` }}
        aria-hidden
      />
      <div className="fixed inset-0 z-0 bg-black/35" aria-hidden />

      {/* Navigation Bar - Professional Medical Design */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-lg border-b-2 border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center shadow-md overflow-hidden bg-white p-1">
                  <img src="/hospital-svgrepo-com.svg" alt="Hospital" className="w-full h-full object-contain" />
                </div>
                <div>
                  <span className="text-gray-800 font-bold text-xl">{t('smartHealthcare')}</span>
                  <p className="text-xs text-gray-500">Medical AI Platform</p>
                </div>
              </div>
              <div className="hidden md:flex gap-8">
                <button
                  onClick={() => scrollToSection('home')}
                  className={`text-gray-700 hover:text-blue-600 transition-colors font-medium pb-1 border-b-2 ${
                    activeSection === 'home' ? 'border-blue-600 text-blue-600' : 'border-transparent'
                  }`}
                >
                  {t('home')}
                </button>
                <button
                  onClick={() => scrollToSection('about')}
                  className={`text-gray-700 hover:text-blue-600 transition-colors font-medium pb-1 border-b-2 ${
                    activeSection === 'about' ? 'border-blue-600 text-blue-600' : 'border-transparent'
                  }`}
                >
                  {t('aboutUs')}
                </button>
                <button
                  onClick={() => scrollToSection('instructions')}
                  className={`text-gray-700 hover:text-blue-600 transition-colors font-medium pb-1 border-b-2 ${
                    activeSection === 'instructions' ? 'border-blue-600 text-blue-600' : 'border-transparent'
                  }`}
                >
                  {t('instructions')}
                </button>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <LanguageSelector />
              <Link
                href="/login"
                className="bg-green-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-green-700 transition-all shadow-md hover:shadow-lg"
              >
                {t('login')}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Home Section */}
      <section id="home" className="relative z-10 min-h-screen flex items-center justify-center p-8 pt-32 scroll-mt-0">
        <div className="text-center max-w-6xl mx-auto px-6 py-10 rounded-2xl bg-black/20 backdrop-blur-sm">
          {/* Logo/Icon - Hospital Icon */}
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-28 h-28 bg-white rounded-full mb-6 shadow-2xl border-4 border-blue-100 p-4">
              <img src="/hospital-svgrepo-com.svg" alt="Hospital" className="w-full h-full object-contain" />
            </div>
          </div>

          {/* Main Heading */}
          <h1 className="text-6xl md:text-7xl font-bold mb-6 text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            {t('smartHealthcare')}
          </h1>
          <p className="text-xl md:text-2xl text-white mb-4 font-light drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
            {t('aiPowered')}
          </p>
          <p className="text-lg text-white mb-12 max-w-2xl mx-auto drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            Advanced risk assessment and personalized health recommendations for Diabetes, Heart Disease, and Kidney Disease
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <Link
            href="/login"
              className="inline-block bg-white text-blue-600 px-10 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 shadow-2xl"
          >
              {t('getStarted')} →
          </Link>
            <button
              onClick={() => scrollToSection('instructions')}
              className="inline-block bg-[#FFA500] text-white border-2 border-[#e69500] px-10 py-4 rounded-xl font-bold text-lg hover:bg-[#e69500] transition-all duration-300 transform hover:scale-105 shadow-xl"
            >
              {t('instructions')}
            </button>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            <div className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-t-4 border-blue-500">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">{t('aiPowered')}</h3>
              <p className="text-gray-600">{t('aiPoweredDesc')}</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-t-4 border-teal-500">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">{t('riskAssessment')}</h3>
              <p className="text-gray-600">{t('riskAssessmentDesc')}</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-t-4 border-green-500">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">{t('personalized')}</h3>
              <p className="text-gray-600">{t('personalizedDesc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className="relative z-10 min-h-screen flex flex-col justify-center p-6 py-16 bg-white scroll-mt-20">
        <div className="max-w-6xl mx-auto w-full">
          <div className="text-center mb-4">
            <h2 className="text-4xl font-bold text-gray-800 mb-2">{t('aboutUs')}</h2>
            <p className="text-base text-gray-600 max-w-3xl mx-auto">
              {t('aboutDesc')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-xl border-2 border-blue-200 shadow-lg">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">{t('mission')}</h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                {t('missionDesc')}
              </p>
            </div>
            <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-5 rounded-xl border-2 border-teal-200 shadow-lg">
              <div className="w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">{t('vision')}</h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                {t('visionDesc')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-xl border-2 border-green-200 shadow-lg">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mb-3">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">{t('technology')}</h3>
              <p className="text-gray-700 text-sm leading-relaxed mb-2">
                {t('technologyDesc')}
              </p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                <span className="bg-blue-600 text-white px-2 py-0.5 rounded-full text-xs font-medium">Decision Tree</span>
                <span className="bg-teal-600 text-white px-2 py-0.5 rounded-full text-xs font-medium">Gradient Boosting</span>
                <span className="bg-green-600 text-white px-2 py-0.5 rounded-full text-xs font-medium">XGBoost</span>
                <span className="bg-gray-700 text-white px-2 py-0.5 rounded-full text-xs font-medium">ML</span>
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-5 rounded-xl border-2 border-purple-200 shadow-lg">
              <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">{t('team')}</h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                {t('teamDesc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Instructions Section */}
      <section id="instructions" className="relative z-10 min-h-screen flex flex-col justify-center p-6 py-12 bg-gray-50 scroll-mt-20">
        <div className="max-w-6xl mx-auto w-full">
          <div className="text-center mb-4">
            <h2 className="text-4xl font-bold text-gray-800 mb-2">{t('instructionsTitle')}</h2>
            <p className="text-base text-gray-600 max-w-3xl mx-auto">
              {t('instructionsSubtitle')}
            </p>
          </div>

          {/* Steps */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {[
              { num: 1, title: t('instructionStep1'), desc: t('instructionStep1Desc'), icon: '📝', color: 'blue' },
              { num: 2, title: t('instructionStep2'), desc: t('instructionStep2Desc'), icon: '🔐', color: 'teal' },
              { num: 3, title: t('instructionStep3'), desc: t('instructionStep3Desc'), icon: '🩺', color: 'green' },
              { num: 4, title: t('instructionStep4'), desc: t('instructionStep4Desc'), icon: '📋', color: 'purple' },
              { num: 5, title: t('instructionStep5'), desc: t('instructionStep5Desc'), icon: '📊', color: 'indigo' },
              { num: 6, title: t('instructionStep6'), desc: t('instructionStep6Desc'), icon: '📜', color: 'blue' },
            ].map((step) => {
              const colorClasses = {
                blue: 'from-blue-500 to-blue-600 border-blue-200 bg-blue-50',
                teal: 'from-teal-500 to-teal-600 border-teal-200 bg-teal-50',
                green: 'from-green-500 to-green-600 border-green-200 bg-green-50',
                purple: 'from-purple-500 to-purple-600 border-purple-200 bg-purple-50',
                indigo: 'from-indigo-500 to-indigo-600 border-indigo-200 bg-indigo-50',
              };
              const colors = colorClasses[step.color as keyof typeof colorClasses] || colorClasses.blue;
              
              return (
                <div key={step.num} className={`bg-white p-4 rounded-xl border-2 ${colors.split(' ')[2]} shadow-lg hover:shadow-xl transition-all`}>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <div className={`w-10 h-10 bg-gradient-to-br ${colors.split(' ')[0]} ${colors.split(' ')[1]} rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md`}>
                        {step.num}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-2xl mb-1">{step.icon}</div>
                      <h3 className="text-base font-bold text-gray-800 mb-1">{step.title}</h3>
                      <p className="text-gray-600 text-xs leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Important Notes */}
          <div className="bg-amber-50 p-4 rounded-xl border-2 border-amber-200 shadow-lg mb-4">
            <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
              <span className="text-amber-600">⚠️</span>
              {t('importantNote')}
            </h3>
            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex items-start gap-2"><span className="text-amber-600 font-bold">•</span><p>{t('note1')}</p></div>
              <div className="flex items-start gap-2"><span className="text-amber-600 font-bold">•</span><p>{t('note2')}</p></div>
              <div className="flex items-start gap-2"><span className="text-amber-600 font-bold">•</span><p>{t('note3')}</p></div>
              <div className="flex items-start gap-2"><span className="text-amber-600 font-bold">•</span><p>{t('note4')}</p></div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <Link
              href="/login"
              className="inline-block bg-gradient-to-r from-blue-600 to-teal-500 text-white px-10 py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-teal-600 transition-all duration-300 transform hover:scale-105 shadow-2xl"
            >
              {t('getStarted')} →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 bg-gray-800 border-t-2 border-gray-700 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center overflow-hidden p-1">
                <img src="/hospital-svgrepo-com.svg" alt="Hospital" className="w-full h-full object-contain" />
              </div>
              <div className="text-white text-sm">
                © 2024 Smart Healthcare System. All rights reserved.
              </div>
            </div>
            <div className="flex gap-6">
            <a 
              href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/docs`} 
              target="_blank"
                className="text-gray-300 hover:text-white transition-colors text-sm"
            >
              API Documentation
            </a>
              <Link href="/login" className="text-gray-300 hover:text-white transition-colors text-sm">
                {t('login')}
            </Link>
          </div>
        </div>
      </div>
      </footer>
    </main>
  );
}

