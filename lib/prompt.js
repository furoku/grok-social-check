export const ANALYSIS_JSON_SCHEMA_HINT = `{
  "summary_ja": "string — 1〜3文。投稿の主旨を中立に",
  "fact_check": {
    "overall": "supported|mixed|unclear|misleading|not_factual",
    "confidence": "low|medium|high",
    "claims": [
      {
        "claim": "string — 検証可能な主張に分解",
        "verdict": "supported|unclear|misleading|false",
        "note_ja": "string — 根拠・反証の可能性（断定しない）"
      }
    ]
  },
  "political_lean": {
    "label": "left|center-left|center|center-right|right|non-political|unclear",
    "confidence": "low|medium|high",
    "note_ja": "string — イデオロギーは参考ラベル。不確実なら unclear と低信頼"
  },
  "caveats_ja": ["string — AI分析の限界を1〜2条"],
  "sources_to_verify": ["string — ユーザーが自分で調べる検索語や公式統計名"]
}`;

export function buildAnalysisPrompt({ platform, postText, authorHint = '' }) {
  const platformLabel = platform === 'threads' ? 'Threads' : platform === 'x' ? 'X (Twitter)' : 'SNS';
  const trimmed = (postText || '').trim().slice(0, 6000);
  return `あなたはソーシャルメディア投稿の分析アシスタントです。公式ファクトチェッカーではありません。
推論と一般知識に基づく「参考分析」のみを日本語で返してください。確信が低い場合は unclear / low を選び、caveats_ja に理由を書いてください。

ルール:
- 主張は最大5件に分解
- 数値・事件・政策は「要原典確認」と明記しうる
- 左右判定は煽り・フレーミング・党派性の示唆に限定。人物攻撃のラベル付けはしない
- 出力は JSON のみ（コードブロック・前置き禁止）

プラットフォーム: ${platformLabel}
${authorHint ? `投稿者ヒント: ${authorHint}\n` : ''}
投稿本文:
---
${trimmed}
---

JSON:
${ANALYSIS_JSON_SCHEMA_HINT}`;
}

export function parseAnalysisJson(raw) {
  const text = (raw || '').trim();
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1].trim() : text;
  const start = candidate.indexOf('{');
  const end = candidate.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) {
    throw new Error('モデル応答からJSONを抽出できませんでした');
  }
  const slice = candidate.slice(start, end + 1);
  const parsed = JSON.parse(slice);
  if (!parsed.fact_check || !parsed.political_lean) {
    throw new Error('JSONに必須フィールドがありません');
  }
  if (!Array.isArray(parsed.caveats_ja)) parsed.caveats_ja = [];
  if (!Array.isArray(parsed.sources_to_verify)) parsed.sources_to_verify = [];
  return parsed;
}