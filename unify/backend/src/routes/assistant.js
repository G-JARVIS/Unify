const router = require('express').Router();
const { requireAuth } = require('../middleware/auth');

router.post('/chat', requireAuth, async (req, res, next) => {
  const { messages } = req.body;
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > 20) {
    return res.status(400).json({ error: 'Send between 1 and 20 chat messages' });
  }

  const validMessages = messages.every((message) =>
    message &&
    (message.role === 'user' || message.role === 'assistant') &&
    typeof message.content === 'string' &&
    message.content.trim().length > 0 &&
    message.content.length <= 8000
  );
  if (!validMessages || messages[messages.length - 1].role !== 'user') {
    return res.status(400).json({ error: 'Chat messages must contain valid user and assistant text, ending with a user message' });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'The AI assistant is not configured. Set GROQ_API_KEY in the backend environment.' });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000);
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || 'openai/gpt-oss-120b',
        messages: [
          {
            role: 'system',
            content: 'You are UNIFY Assistant, a concise and professional guide to the UNIFY platform. Answer questions about procurement opportunities, company matching, collaborations, profiles, and platform features. Do not invent account-specific or live data; explain when the user should check a page in the app.',
          },
          ...messages.map(({ role, content }) => ({ role, content: content.trim() })),
        ],
        temperature: 0.3,
        max_tokens: 1200,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      console.error(`Groq chat request failed with status ${response.status}`);
      return res.status(response.status === 429 ? 503 : 502).json({
        error: response.status === 429
          ? 'The AI assistant is busy. Please try again shortly.'
          : 'The AI assistant could not complete this request. Please try again.',
      });
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content;
    if (typeof content !== 'string' || !content.trim()) {
      return res.status(502).json({ error: 'The AI assistant returned an empty response. Please try again.' });
    }
    res.json({ content: content.trim() });
  } catch (err) {
    if (err.name === 'AbortError') {
      return res.status(504).json({ error: 'The AI assistant took too long to respond. Please try again.' });
    }
    next(err);
  } finally {
    clearTimeout(timeout);
  }
});

module.exports = router;
