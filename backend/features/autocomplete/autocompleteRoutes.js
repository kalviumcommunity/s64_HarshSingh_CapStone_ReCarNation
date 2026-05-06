const express = require('express');
const { generateAutocompleteSuggestion, askAssistant } = require('./autocompleteController');

const router = express.Router();

// POST /api/autocomplete - Generate AI-powered search suggestions
router.post('/', generateAutocompleteSuggestion);
router.post('/ask', askAssistant);

module.exports = router;
