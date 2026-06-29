/**
 * Post text extraction for X and Threads DOM.
 */

import { pickThreadsTextBlocks } from './post-extract-threads.js';

export function detectPlatform(hostname) {
  const host = (hostname || '').toLowerCase();
  if (host.includes('threads')) return 'threads';
  if (host === 'x.com' || host === 'twitter.com' || host.endsWith('.x.com')) return 'x';
  return 'unknown';
}

export function findPostRoot(element) {
  if (!element) return null;
  const xArticle = element.closest('article[data-testid="tweet"]');
  if (xArticle) return xArticle;
  const threadsRoot =
    element.closest('[data-pressable-container="true"]') ||
    element.closest('div[role="article"]') ||
    element.closest('article');
  return threadsRoot;
}

export function extractPostTextFromRoot(root, platform) {
  if (!root) return '';

  if (platform === 'x') {
    const parts = root.querySelectorAll('[data-testid="tweetText"]');
    if (parts.length) {
      return Array.from(parts)
        .map((el) => el.innerText || '')
        .join('\n')
        .trim();
    }
  }

  if (platform === 'threads') {
    const postText = root.querySelector('[data-testid="post-text"]');
    if (postText?.innerText?.trim()) return postText.innerText.trim();

    const autoNodes = root.querySelectorAll('div[dir="auto"]');
    const texts = Array.from(autoNodes).map((el) => el.innerText || '');
    const picked = pickThreadsTextBlocks(texts);
    if (picked) return picked;
  }

  const fallback = (root.innerText || '').trim();
  return fallback.slice(0, 4000);
}

export function extractPostTextFromElement(element, hostname) {
  const platform = detectPlatform(hostname);
  const root = findPostRoot(element);
  const text = extractPostTextFromRoot(root, platform);
  return { platform, text, root };
}