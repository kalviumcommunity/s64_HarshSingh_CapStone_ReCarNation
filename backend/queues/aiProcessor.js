const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

const callGemini = async (messages) => {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key === 'your_gemini_api_key_here') {
    const err = new Error('Gemini API key not configured or is placeholder');
    err.status = 503; 
    throw err;
  }

  const genAI = new GoogleGenerativeAI(key);
  const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

  const prompt = messages
    .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
    .join('\n\n');

  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => {
      const err = new Error('Gemini API request timeout');
      err.code = 'ECONNABORTED';
      err.status = 408;
      reject(err);
    }, 12000);
  });

  const result = await Promise.race([
    model.generateContent(prompt),
    timeoutPromise
  ]);

  const response = await result.response;
  const text = response?.text?.()?.trim();

  if (!text) throw new Error('No response received from Gemini');
  return text;
};

const callGroq = async (messages) => {
  if (!process.env.GROQ_API_KEY) {
    const err = new Error('Groq API key not configured');
    err.status = 500;
    throw err;
  }

  const response = await axios.post(
    GROQ_API_URL,
    { model: GROQ_MODEL, messages, temperature: 0.3, max_tokens: 220 },
    {
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 12000
    }
  );

  const text = response.data?.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error('No response received from Groq');
  return text;
};

const shouldFallback = (error) => {
  const status = error?.response?.status || error?.status;
  return !status || status >= 500 || status === 401 || status === 403 || status === 429 || status === 408 || error?.code === 'ECONNABORTED';
};

module.exports = async (job) => {
  const { messages } = job.data;
  try {
    return await callGemini(messages);
  } catch (geminiError) {
    console.error('Gemini call failed, attempting fallback to Groq:', geminiError.message);
    if (!shouldFallback(geminiError) && process.env.GROQ_FORCE_FALLBACK !== 'true') {
      throw geminiError;
    }
    return await callGroq(messages);
  }
};
