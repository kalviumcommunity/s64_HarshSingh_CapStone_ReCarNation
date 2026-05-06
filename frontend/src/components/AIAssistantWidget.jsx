import React, { useState } from 'react';
import { MessageCircle, Send, Loader2, X } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const AIAssistantWidget = () => {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const askAssistant = async () => {
    const trimmed = question.trim();
    if (!trimmed) return;

    setLoading(true);
    setError('');

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/autocomplete/ask`,
        { question: trimmed },
        { withCredentials: true, timeout: 12000 }
      );

      setAnswer(response.data?.answer || 'No response received.');
    } catch (err) {
      if (err.code === 'ECONNABORTED') {
        setError('Request timed out. Please try again.');
      } else if (err.response?.status === 429) {
        setError('Too many requests. Please wait and retry.');
      } else {
        setError(err.response?.data?.error || 'Unable to get response right now.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    askAssistant();
  };

  return (
    <div className="fixed right-5 bottom-24 z-[70]">
      {open && (
        <div className="mb-3 w-[320px] rounded-2xl border border-gray-200 bg-white shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-[#0b3a63] text-white">
            <h3 className="text-sm font-semibold">AI Assistant</h3>
            <button onClick={() => setOpen(false)} aria-label="Close assistant">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="p-3 space-y-3">
            <form onSubmit={handleSubmit} className="space-y-2">
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                rows={3}
                placeholder="Ask anything about cars, buying, selling, or this platform..."
                className="w-full resize-none rounded-md border border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={loading || !question.trim()}
                className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-orange-600 px-3 py-2 text-sm font-medium text-white hover:bg-orange-500 disabled:opacity-50"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Ask
              </button>
            </form>

            {error && <p className="text-xs text-red-600">{error}</p>}

            {answer && (
              <div className="rounded-md bg-gray-50 border border-gray-200 p-2 max-h-48 overflow-auto">
                <p className="text-xs text-gray-500 mb-1">Answer</p>
                <p className="text-sm text-gray-800 whitespace-pre-wrap">{answer}</p>
              </div>
            )}
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        className="h-14 w-14 rounded-full bg-orange-600 text-white shadow-xl hover:bg-orange-500 flex items-center justify-center"
        aria-label="Open AI assistant"
      >
        <MessageCircle className="h-7 w-7" />
      </button>
    </div>
  );
};

export default AIAssistantWidget;
