const { GoogleGenerativeAI } = require('@google/generative-ai');

const generateAutocompleteSuggestion = async (req, res) => {
  try {
    const { prompt } = req.body;

    // Validate input
    if (!prompt || prompt.trim().length < 2) {
      return res.status(400).json({
        error: 'Prompt must be at least 2 characters long'
      });
    }

    // Check if Gemini API key is configured
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'Gemini API key not configured'
      });
    }

    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Prepare the prompt for Gemini
    const systemPrompt = `You are a helpful assistant that suggests car search queries. Based on the user's input, provide a single, helpful car search suggestion that would help them find relevant used cars. Keep it concise and specific to car searches. Focus on car makes, models, features, or specifications.

User input: "${prompt}"

Complete this car search query with a helpful suggestion:`;

    // Generate content using Gemini
    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const suggestion = response.text().trim();

    if (!suggestion) {
      throw new Error('No suggestion received from Gemini AI');
    }

    // Return the suggestion
    res.json({
      success: true,
      suggestion: suggestion,
      originalPrompt: prompt
    });

  } catch (error) {
    console.error('Error generating autocomplete suggestion:', error);

    // Handle different types of errors
    if (error.message?.includes('API_KEY_INVALID') || error.message?.includes('401')) {
      return res.status(500).json({
        error: 'Invalid Gemini API key'
      });
    }

    if (error.message?.includes('429') || error.message?.includes('quota')) {
      return res.status(429).json({
        error: 'Rate limit exceeded. Please try again later.'
      });
    }

    if (error.message?.includes('timeout') || error.code === 'ECONNABORTED') {
      return res.status(504).json({
        error: 'Request timeout. Please try again.'
      });
    }

    // Generic error response
    res.status(500).json({
      error: 'Failed to generate suggestion. Please try again later.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  generateAutocompleteSuggestion
};