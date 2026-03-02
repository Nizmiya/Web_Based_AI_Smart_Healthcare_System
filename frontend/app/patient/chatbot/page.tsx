'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export default function PatientChatbotPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        'Hi! I can share general health guidance. I cannot diagnose conditions. How can I help you today?',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (!token || !userData) {
      router.push('/login');
    }
  }, [router]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    setError('');
    setLoading(true);
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: trimmed }]);

    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/chatbot/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: trimmed }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.detail || 'Failed to get response from assistant.');
      }
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.reply || 'Please try again later.' },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to reach assistant right now.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loading) {
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Health Chatbot</h2>
            <p className="text-sm text-gray-600 mt-1">
              General guidance only. For urgent symptoms, contact a healthcare professional.
            </p>
          </div>

          <div className="h-[420px] overflow-y-auto border border-gray-200 rounded-xl p-4 bg-gray-50">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 border border-gray-200'
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-4 flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about symptoms, lifestyle tips, or next steps..."
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-60"
            >
              {loading ? 'Sending...' : 'Send'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

