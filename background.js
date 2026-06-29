import { buildAnalysisPrompt, parseAnalysisJson } from './lib/prompt.js';
import {
  mapHttpError,
  mapParseFailure,
  messageForMissingToken
} from './lib/api-errors.js';

const DEFAULT_MODEL = 'grok-4-1-fast-non-reasoning';
const API_URL = 'https://api.x.ai/v1/chat/completions';

async function getSettings() {
  const data = await chrome.storage.sync.get({
    xaiToken: '',
    model: DEFAULT_MODEL,
    cooldownSec: 8
  });
  return data;
}

function authHeader(apiKey) {
  return 'Bearer ' + apiKey;
}

async function callGrok({ apiKey, model, prompt }) {
  if (!apiKey) {
    throw new Error(messageForMissingToken());
  }

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      Authorization: authHeader(apiKey),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: model || DEFAULT_MODEL,
      temperature: 0.15,
      messages: [
        {
          role: 'system',
          content:
            'You analyze social posts for fact-check hints and political framing. Respond with a single JSON object only.'
        },
        { role: 'user', content: prompt }
      ]
    })
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
      const settings = await getSettings();
      const prompt = buildAnalysisPrompt({
        platform: message.platform,
        postText: message.postText,
        authorHint: message.authorHint || ''
      });
      const analysis = await callGrok({
        apiKey: settings['xaiToken'],
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