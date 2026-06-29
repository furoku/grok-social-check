import {
  detectPlatform,
  extractPostTextFromElement,
  findPostRoot
} from './lib/post-extract.js';

const MARKER = '__GROK_SOCIAL_CHECK_LOADED__';
globalThis[MARKER] = true;

const lastCheckAt = new Map();

function canRun(postId) {
  const now = Date.now();
  const prev = lastCheckAt.get(postId) || 0;
  if (now - prev < 8000) return false;
  lastCheckAt.set(postId, now);
  return true;
}

function postIdFor(root) {
  if (!root) return String(Math.random());
  const link = root.querySelector('a[href*="/status/"]');
  if (link) return link.getAttribute('href') || root.innerText.slice(0, 80);
  return root.innerText.slice(0, 80) || String(Math.random());
}

function renderPanel(root, analysis, errorText) {
  let panel = root.querySelector('.grok-check-panel');
  if (!panel) {
    panel = document.createElement('div');
    panel.className = 'grok-check-panel';
    root.appendChild(panel);
  }

  if (errorText) {
    panel.innerHTML = `<div class="grok-check-error">${escapeHtml(errorText)}</div>`;
    return;
  }

  const fc = analysis.fact_check || {};
  const pl = analysis.political_lean || {};
  const claims = (fc.claims || [])
    .map(
      (c) =>
        `<li><strong>${escapeHtml(c.claim || '')}</strong> — ${escapeHtml(c.verdict || '')}<br>${escapeHtml(c.note_ja || '')}</li>`
    )
    .join('');

  const caveats = (analysis.caveats_ja || []).map((c) => `<li>${escapeHtml(c)}</li>`).join('');
  const sources = (analysis.sources_to_verify || [])
    .map((s) => `<li>${escapeHtml(s)}</li>`)
    .join('');

  panel.innerHTML = `
    <div class="grok-check-title">Grok 参考分析（公式ファクトチェックではありません）</div>
    <p>${escapeHtml(analysis.summary_ja || '')}</p>
    <div><strong>ファクト</strong>: ${escapeHtml(fc.overall || '')}（信頼度: ${escapeHtml(fc.confidence || '')}）</div>
    <ul>${claims}</ul>
    <div><strong>左右寄り（参考）</strong>: ${escapeHtml(pl.label || '')}（${escapeHtml(pl.confidence || '')}）<br>${escapeHtml(pl.note_ja || '')}</div>
    ${caveats ? `<div><strong>注意</strong><ul>${caveats}</ul></div>` : ''}
    ${sources ? `<div><strong>自分で確認するなら</strong><ul>${sources}</ul></div>` : ''}
  `;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function analyzeFromButton(btn) {
  const root = findPostRoot(btn);
  const { platform, text } = extractPostTextFromElement(btn, location.hostname);
  if (!text || text.length < 3) {
    renderPanel(root, null, '投稿本文を取得できませんでした');
    return;
  }

  const pid = postIdFor(root);
  if (!canRun(pid)) {
    renderPanel(root, null, '連続実行を抑止しています。少し待ってから再度お試しください。');
    return;
  }

  btn.disabled = true;
  btn.textContent = '分析中…';
  renderPanel(root, null, 'Grok に送信中…');

  try {
    const res = await chrome.runtime.sendMessage({
      type: 'ANALYZE_POST',
      platform,
      postText: text,
      authorHint: ''
    });
    if (!res?.ok) throw new Error(res?.error || '不明なエラー');
    renderPanel(root, res.analysis, null);
  } catch (err) {
    renderPanel(root, null, String(err?.message || err));
  } finally {
    btn.disabled = false;
    btn.textContent = 'Grokでチェック';
  }
}

function ensureButton(root) {
  if (!root || root.querySelector('.grok-check-btn')) return;
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'grok-check-btn';
  btn.textContent = 'Grokでチェック';
  btn.addEventListener('click', () => analyzeFromButton(btn));
  root.appendChild(btn);
}

function scan() {
  const platform = detectPlatform(location.hostname);
  if (platform === 'x') {
    document.querySelectorAll('article[data-testid="tweet"]').forEach(ensureButton);
  } else if (platform === 'threads') {
    document
      .querySelectorAll('[data-pressable-container="true"], div[role="article"]')
      .forEach(ensureButton);
  }
}

const observer = new MutationObserver(() => scan());
observer.observe(document.documentElement, { childList: true, subtree: true });
scan();