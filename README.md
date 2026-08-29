# Grok Social Check

XとThreadsの投稿を、利用者がボタンを押したときだけxAI APIへ送り、主張・注意点・確認すべき情報源を整理するChrome拡張です。

> [!IMPORTANT]
> これは公式のファクトチェック機能ではありません。表示される事実整理や政治的傾向のラベルはAIによる参考分析であり、正確性・中立性・完全性を保証しません。重要な判断には一次情報を使用してください。

## 現在の状態

- Status: maintained source experiment
- Extension version: `1.0.0`
- Default model: `grok-4.20-0309-non-reasoning`
- Model and privacy review: 2026-08-30
- Distribution: source only; no Chrome Web Store release

## できること

- XとThreadsの投稿ごとに「Grokでチェック」ボタンを表示
- 主張、根拠、留保事項を参考情報として整理
- AIが推定した政治的フレーミングを参考ラベルとして表示
- 自分で確認すべき情報源の候補を表示

投稿本文は自動収集しません。利用者が対象投稿のボタンを押した場合だけ送信します。

## プライバシーとAPIキー

- APIキーはこの端末の`chrome.storage.local`へ保存します
- 保存領域はtrusted extension contextsに限定します
- 旧版の`chrome.storage.sync`に残るキーは、初回起動時にlocalへ移して同期側から削除します
- 設定画面の「APIキーを削除」で、localと旧syncの両方から削除できます
- 投稿本文とAPIキーを開発者のサーバーへ送る仕組みはありません
- 分析・テレメトリーSDKはありません

詳しくは[PRIVACY.md](PRIVACY.md)と[SECURITY.md](SECURITY.md)をご覧ください。

## モデル

既定モデルはxAI公式ドキュメントで2026年8月30日に確認した`grok-4.20-0309-non-reasoning`です。互換用に`grok-4.3`も選べ、その場合はreasoning effortを`none`へ明示します。

旧モデル`grok-4-1-fast-non-reasoning`、`grok-4-fast-non-reasoning`、`grok-3`、`grok-3-mini`の保存設定は、対応モデルへ自動移行します。

## ローカルインストール

必要なもの:

- Google Chrome
- Node.js 20以上
- xAI APIキー

```bash
git clone https://github.com/furoku/grok-social-check.git
cd grok-social-check
npm ci
npm run check
npm run package
```

`dist/grok-social-check-v1.0.0.zip`を展開し、Chromeの`chrome://extensions`でデベロッパーモードを有効にして、展開したフォルダを読み込みます。

生成ZIPはGitへコミットしません。配布物は、同じcommitから`npm run package`で再生成してください。

## 使い方

1. 拡張機能の設定画面でxAI APIキーを保存します
2. XまたはThreadsを開きます
3. 対象投稿の「Grokでチェック」を押します
4. 結果を元の投稿や一次情報と照らして読みます

## 開発・確認

| コマンド | 内容 |
| --- | --- |
| `npm run smoke` | manifest、必須ファイル、構文、保存境界、生成物追跡を確認 |
| `npm test` | 投稿抽出、JSON解析、設定移行、APIリクエストを単体テスト |
| `npm run check` | smokeと単体テスト |
| `npm run smoke:chrome` | インストール済みChromeで読み込み確認 |
| `npm run package` | 検証済みソースからZIPを生成 |

## 既知の制約

- XやThreadsの画面構造が変わると、投稿抽出が動かなくなる場合があります
- xAIのモデル、料金、API形式は変更される場合があります
- AIの出力には誤り、抜け、偏りが含まれます
- 出力は人物や組織を確定的に評価する根拠には使用できません

## ライセンス

ソースコードとこのリポジトリの自作ドキュメントは[MIT License](LICENSE)です。X、Threads、Grok、xAI、各投稿内容および各社の名称・商標は、それぞれの権利者に帰属します。
