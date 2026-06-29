/**
 * Post text extraction for X and Threads DOM.
 * Loaded as a classic script in tests via dynamic import of duplicated logic in .mjs mirror.
 */

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
    const selectors = [
      '[data-testid="post-text"]',
      'div[dir="auto"] span',
      'div[dir="auto"]'
    ];
    for (const sel of selectors) {
      const nodes = root.querySelectorAll(sel);
      const texts = Array.from(nodes)
        .map((el) => (el.innerText || '').trim())
        .filter((t) => t.length > 0);
      if (texts.length) {
        const joined = texts.join('\n').trim();
        if (joined.length >= 3) return joined;
      }
    }
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