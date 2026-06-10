const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

const ASSISTANT_SYSTEM_PROMPT = `You are ReCarNation AI Assistant.

Role:
- Answer only about used cars, vehicle ownership, maintenance basics, car-buy/sell process, and auto finance.
- Answer only about ReCarNation platform workflows and policies (account, listing, wishlist, orders, payments, verification, safety).

Hard guardrails:
- If user asks anything outside allowed scope, refuse briefly.
- Do not answer medical, legal (except basic auto-document checklist), politics, religion, coding help, general trivia, entertainment, or unrelated finance.
- Never provide illegal, unsafe, or fraudulent advice (odometer rollback, fake papers, bypassing KYC, scam tactics).
- Never invent ReCarNation policies; if unknown, say policy info is not available in current context.

Response style:
- Be concise, practical, and structured.
- If question is ambiguous, ask one clarifying question.
- For price or loan guidance, include a short risk note that rates and costs vary by profile and city.
- Keep under 140 words unless user asks for detailed steps.`;

const AUTOCOMPLETE_SYSTEM_PROMPT = `You generate one concise used-car search query.
Rules:
- Output only one search query string.
- No quotes, no bullets, no explanation.
- Focus on make/model/body type/year/budget/fuel/transmission/ownership/mileage.
- If the prompt is out of scope, return: used cars under 10 lakh`;

const OUT_OF_SCOPE_MESSAGE = 'I can only help with cars, auto-finance, and ReCarNation platform/policy questions.';

const DOMAIN_PATTERNS = [
  /\b(car|cars|vehicle|vehicles|auto|automobile|suv|sedan|hatchback|ev|electric car|hybrid|diesel|petrol|cng)\b/i,
  /\b(buy|sell|resale|used car|pre[- ]owned|test drive|rto|rc|insurance|service history|ownership transfer|loan|emi|down payment|interest rate|car finance)\b/i,
  /\b(recarnation|listing|wishlist|order|payment|profile|account|verification|kyc|seller|buyer|platform)\b/i
];

const GREETING_PATTERN = /^(hi|hello|hey|yo|good\s+(morning|afternoon|evening))\b/i;

const isInScopeQuestion = (text) => {
  if (!text) return false;
  if (GREETING_PATTERN.test(text.trim())) return true;
  return DOMAIN_PATTERNS.some((pattern) => pattern.test(text));
};

const shouldFallback = (error) => {
  const status = error?.response?.status || error?.status;
  // Fallback for: 
  // - No status (network error)
  // - 5xx (server error)
  // - 401/403 (invalid/placeholder key)
  // - 429 (rate limit)
  // - 408/Timeout
  return !status || status >= 500 || status === 401 || status === 403 || status === 429 || status === 408 || error?.code === 'ECONNABORTED';
};

const { aiQueue, aiQueueEvents } = require('../../queues/queueManager');

const callWithFallback = async (messages) => {
  const job = await aiQueue.add('ai_call', { messages });
  return await job.waitUntilFinished(aiQueueEvents);
};

const handleAiError = (error, res, fallbackMessage) => {
  const status = error.response?.status || error.status;

  if (status === 401 || status === 403) {
    return res.status(500).json({ error: 'Invalid AI API key configuration' });
  }

  if (status === 429) {
    return res.status(429).json({ error: 'Rate limit exceeded. Please try again later.' });
  }

  if (error.code === 'ECONNABORTED' || status === 408) {
    return res.status(504).json({ error: 'Request timeout. Please try again.' });
  }

  return res.status(500).json({
    error: fallbackMessage,
    details: process.env.NODE_ENV === 'development' ? (error.message || 'Unknown error') : undefined
  });
};

const generateAutocompleteSuggestion = async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt || prompt.trim().length < 2) {
      return res.status(400).json({
        error: 'Prompt must be at least 2 characters long'
      });
    }

    const safePrompt = isInScopeQuestion(prompt) ? prompt.trim() : 'used cars under 10 lakh';

    const suggestion = await callWithFallback([
      { role: 'system', content: AUTOCOMPLETE_SYSTEM_PROMPT },
      { role: 'user', content: safePrompt }
    ]);

    return res.json({
      success: true,
      suggestion: suggestion.replace(/^[-*\s"']+|[-*\s"']+$/g, ''),
      originalPrompt: prompt
    });
  } catch (error) {
    return handleAiError(error, res, 'Failed to generate suggestion. Please try again later.');
  }
};

const askAssistant = async (req, res) => {
  try {
    const { question } = req.body;

    if (!question || question.trim().length < 2) {
      return res.status(400).json({
        error: 'Question must be at least 2 characters long'
      });
    }

    if (!isInScopeQuestion(question)) {
      return res.status(200).json({
        success: true,
        answer: OUT_OF_SCOPE_MESSAGE,
        blocked: true
      });
    }

    const answer = await callWithFallback([
      { role: 'system', content: ASSISTANT_SYSTEM_PROMPT },
      { role: 'user', content: question.trim() }
    ]);

    return res.json({
      success: true,
      answer
    });
  } catch (error) {
    return handleAiError(error, res, 'Failed to generate answer. Please try again later.');
  }
};

module.exports = {
  generateAutocompleteSuggestion,
  askAssistant
};
