const express = require('express');
const { generateAutocompleteSuggestion } = require('./autocompleteController');

const router = express.Router();

// POST /api/autocomplete - Generate AI-powered search suggestions
router.post('/', generateAutocompleteSuggestion);

module.exports = router;