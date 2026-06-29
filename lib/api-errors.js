/**
 * Map xAI HTTP errors to stable Japanese user messages (D5).
 */

export function messageForMissingToken() {
  return 'xAI API キーが未設定です。拡張アイコン →「設定を開く」からキーを保存してください。';
}

export function messageForEmptyPost() {
  return '投稿本文を取得できませんでした。ページを再読み込みするか、別の投稿でお試しください。';
}

export function messageForCooldown(sec) {
  return `連続実行を抑止しています。約 ${sec} 秒待ってから再度お試しください。`;
}

export function mapHttpError(status, bodyMessage) {
  const detail = (bodyMessage || '').trim();
  if (status === 401 || status === 403) {
    return 'API キーが無効か権限がありません。xAI コンソールのキーを確認し、オプションで再保存してください。';
  }
  if (status === 429) {
    return 'レート制限に達しました。しばらく待ってから再度お試しください。';
  }
  if (status === 404) {
    return '指定モデルが見つかりません。オプションのモデル名を変更してください。';
  }
  if (status >= 500) {
    return 'xAI 側の一時障害の可能性があります。時間をおいて再試行してください。';
  }
  if (detail) return `xAI API エラー (${status}): ${detail.slice(0, 180)}`;
  return `xAI API エラー (${status})`;
}

export function mapParseFailure() {
  return 'モデル応答の形式が想定と異なります。もう一度実行するか、モデルを変更してください。';
}