import { DEFAULT_MODEL, normalizeModel } from './settings.js';

export function buildChatRequest({ model = DEFAULT_MODEL, prompt }) {
  const selectedModel = normalizeModel(model);
  const body = {
    model: selectedModel,
    temperature: 0.15,
    messages: [
      {
        role: 'system',
        content:
          'You analyze social posts for fact-check hints and political framing. Respond with a single JSON object only.'
      },
      { role: 'user', content: String(prompt || '') }
    ]
  };

  if (selectedModel === 'grok-4.3') {
    body.reasoning_effort = 'none';
  }

  return body;
}
