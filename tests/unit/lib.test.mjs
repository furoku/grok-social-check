import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Window } from 'happy-dom';

import {
  detectPlatform,
  extractPostTextFromRoot,
  findPostRoot
} from '../../lib/post-extract.js';
import { buildAnalysisPrompt, parseAnalysisJson } from '../../lib/prompt.js';

const fixturesDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'fixtures');

function loadFixture(name) {
  const html = fs.readFileSync(path.join(fixturesDir, name), 'utf8');
  const window = new Window();
  window.document.write(html);
  return window.document;
}

test('detectPlatform', () => {
  assert.equal(detectPlatform('x.com'), 'x');
  assert.equal(detectPlatform('www.threads.com'), 'threads');
  assert.equal(detectPlatform('threads.net'), 'threads');
});

test('extract X tweet text', () => {
  const doc = loadFixture('x-tweet.html');
  const article = doc.querySelector('article[data-testid="tweet"]');
  const text = extractPostTextFromRoot(article, 'x');
  assert.match(text, /物価上昇/);
});

test('extract Threads post text', () => {
  const doc = loadFixture('threads-post.html');
  const root = doc.querySelector('[data-pressable-container="true"]');
  const text = extractPostTextFromRoot(root, 'threads');
  assert.match(text, /選挙/);
});

test('findPostRoot from inner button', () => {
  const doc = loadFixture('x-tweet.html');
  const btn = doc.querySelector('button');
  const root = findPostRoot(btn);
  assert.ok(root?.getAttribute('data-testid') === 'tweet');
});

test('parseAnalysisJson', () => {
  const raw = `前置き\n${JSON.stringify({
    summary_ja: '要約',
    fact_check: { overall: 'mixed', confidence: 'medium', claims: [] },
    political_lean: { label: 'center', confidence: 'low', note_ja: 'n' },
    caveats_ja: [],
    sources_to_verify: []
  })}`;
  const parsed = parseAnalysisJson(raw);
  assert.equal(parsed.summary_ja, '要約');
});

test('buildAnalysisPrompt includes body', () => {
  const p = buildAnalysisPrompt({ platform: 'x', postText: 'テスト本文' });
  assert.match(p, /テスト本文/);
  assert.match(p, /JSON/);
});