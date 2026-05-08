import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, Loader2, X, Bot, User } from 'lucide-react';
import axios from 'axios';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card, CardContent } from './ui/card';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const AIAssistantWidget = () => {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const askAssistant = async () => {
    const trimmed = question.trim();
    if (!trimmed) return;

    const userMessage = { type: 'user', content: trimmed, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setQuestion('');
    setLoading(true);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/autocomplete/ask`,
        { question: trimmed },
        { withCredentials: true, timeout: 12000 }
      );

      const assistantMessage = {
        type: 'assistant',
        content: response.data?.answer || 'No response received.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      let errorMessage = 'Unable to get response right now.';
      if (err.code === 'ECONNABORTED') {
        errorMessage = 'Request timed out. Please try again.';
      } else if (err.response?.status === 429) {
        errorMessage = 'Too many requests. Please wait and retry.';
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      }

      const errorMsg = { type: 'error', content: errorMessage, timestamp: new Date() };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    askAssistant();
  };

  const clearConversation = () => {
    setMessages([]);
  };

  return (
    <div className="fixed right-5 bottom-24 z-[70]">
      {open && (
        <div className="mb-3 w-[380px] max-h-[600px] rounded-2xl border border-gray-200 bg-white shadow-2xl overflow-hidden animate-in slide-in-from-bottom-2 duration-300">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              <h3 className="text-sm font-semibold">AI Assistant</h3>
            </div>
            <div className="flex items-center gap-2">
              {messages.length > 0 && (
                <button
                  onClick={clearConversation}
                  className="text-white/70 hover:text-white text-xs"
                  title="Clear conversation"
                >
                  Clear
                </button>
              )}
              <button onClick={() => setOpen(false)} aria-label="Close assistant">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 max-h-[400px] overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <Bot className="h-12 w-12 mx-auto text-blue-500 mb-3" />
                <p className="text-sm text-gray-600">
                  Hi! I'm your AI assistant. Ask me anything about cars, buying, selling, or this platform.
                </p>
              </div>
            ) : (
              messages.map((message, index) => (
                <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex gap-2 max-w-[85%] ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      message.type === 'user'
                        ? 'bg-blue-600 text-white'
                        : message.type === 'error'
                        ? 'bg-red-100 text-red-600'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {message.type === 'user' ? (
                        <User className="h-4 w-4" />
                      ) : message.type === 'error' ? (
                        <X className="h-4 w-4" />
                      ) : (
                        <Bot className="h-4 w-4" />
                      )}
                    </div>
                    <div className={`rounded-2xl px-4 py-2 ${
                      message.type === 'user'
                        ? 'bg-blue-600 text-white'
                        : message.type === 'error'
                        ? 'bg-red-50 border border-red-200 text-red-700'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}

            {loading && (
              <div className="flex justify-start">
                <div className="flex gap-2 max-w-[85%]">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="bg-gray-100 rounded-2xl px-4 py-2">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-gray-600">Thinking...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 p-4">
            <form onSubmit={handleSubmit} className="space-y-3">
              <Textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                rows={2}
                placeholder="Ask anything about cars, buying, selling, or this platform..."
                className="resize-none border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    askAssistant();
                  }
                }}
              />
              <Button
                type="submit"
                disabled={loading || !question.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                size="sm"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Send
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`h-14 w-14 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200 flex items-center justify-center ${
          open ? 'rotate-180' : ''
        }`}
        aria-label="Open AI assistant"
      >
        <MessageCircle className="h-7 w-7" />
      </button>
    </div>
  );
};

export default AIAssistantWidget;
