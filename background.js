import { buildAnalysisPrompt, parseAnalysisJson } from './lib/prompt.js';
import {
  mapHttpError,
  mapParseFailure,
  messageForMissingToken
} from './lib/api-errors.js';
import { buildChatRequest } from './lib/api-request.js';
import { loadSettings } from './lib/settings.js';

const API_URL = 'https://api.x.ai/v1/chat/completions';

async function callGrok({ apiKey, model, prompt }) {
  if (!apiKey) {
    throw new Error(messageForMissingToken());
  }

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(buildChatRequest({ model, prompt }))
  });

  const bodyText = await response.text();
  let body;
  try {
    body = JSON.parse(bodyText);
  } catch {
    throw new Error(mapHttpError(response.status, 'invalid json'));
  }

  if (!response.ok) {
    throw new Error(mapHttpError(response.status, body?.error?.message));
  }

  const content = body?.choices?.[0]?.message?.content;
  if (!content) throw new Error('xAI API から本文が返りませんでした');
  try {
    return parseAnalysisJson(content);
  } catch {
    throw new Error(mapParseFailure());
  }
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== 'ANALYZE_POST') return false;

  (async () => {
    try {
      const settings = await loadSettings();
      const prompt = buildAnalysisPrompt({
        platform: message.platform,
        postText: message.postText,
        authorHint: message.authorHint || ''
      });
      const analysis = await callGrok({
        apiKey: settings.xaiToken,
        model: settings.model,
        prompt
      });
      sendResponse({ ok: true, analysis });
    } catch (err) {
      sendResponse({ ok: false, error: String(err?.message || err) });
    }
  })();

  return true;
});

loadSettings().catch((error) => {
  console.warn('[Grok Social Check] secure storage initialization failed', error);
});
