export const ANALYSIS_JSON_SCHEMA_HINT = `{
  "summary_ja": "string — 1〜3文の要約",
  "fact_check": {
    "overall": "supported|mixed|unclear|misleading|not_factual",
    "confidence": "low|medium|high",
    "claims": [
      {
        "claim": "string",
        "verdict": "supported|unclear|misleading|false",
        "note_ja": "string"
      }
    ]
  },
  "political_lean": {
    "label": "left|center-left|center|center-right|right|non-political|unclear",
    "confidence": "low|medium|high",
    "note_ja": "string — フレーミング・党派性の示唆（参考情報）"
  },
  "caveats_ja": ["string"],
  "sources_to_verify": ["string — ユーザーが自分で確認すべき検索キーワードや論点"]
}`;

export function buildAnalysisPrompt({ platform, postText, authorHint = '' }) {
  const platformLabel = platform === 'threads' ? 'Threads' : platform === 'x' ? 'X (Twitter)' : 'SNS';
  const trimmed = (postText || '').trim().slice(0, 6000);
  return `あなたはソーシャルメディア投稿の分析アシスタントです。公式ファクトチェッカーではありません。推論と一般知識に基づく参考分析を日本語で返してください。

プラットフォーム: ${platformLabel}
${authorHint ? `投稿者ヒント: ${authorHint}\n` : ''}
投稿本文:
---
${trimmed}
---

次のJSONのみを出力（マークダウンや前置き禁止）:
${ANALYSIS_JSON_SCHEMA_HINT}`;
}

export function parseAnalysisJson(raw) {
  const text = (raw || '').trim();
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) {
    throw new Error('モデル応答からJSONを抽出できませんでした');
  }
  const slice = text.slice(start, end + 1);
  const parsed = JSON.parse(slice);
  if (!parsed.fact_check || !parsed.political_lean) {
    throw new Error('JSONに必須フィールドがありません');
  }
  return parsed;
}