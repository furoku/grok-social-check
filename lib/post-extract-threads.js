export function pickThreadsTextBlocks(texts) {
  const cleaned = texts
    .map((t) => t.replace(/\s+/g, ' ').trim())
    .filter((t) => t.length >= 8)
    .filter((t) => !/^[\d.,]+[KMB]?$/.test(t))
    .filter((t) => !/^(いいね|返信|再投稿|シェア|Like|Reply|Repost)/i.test(t));
  if (!cleaned.length) return '';
  cleaned.sort((a, b) => b.length - a.length);
  return cleaned[0];
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