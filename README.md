# Grok Social Check

XとThreadsの投稿を、ボタンを押したときだけGrok（xAI）へ送り、内容を整理するChrome拡張です。

> **重要:** これは公式のファクトチェック機能ではありません。表示される事実整理や政治的傾向のラベルは、AIによる参考分析であり、正確性・中立性・完全性を保証しません。

## できること

- 投稿ごとに「Grokでチェック」ボタンを表示
- 主張、根拠、注意点をファクトチェック風に整理
- 左右・イデオロギー寄りの傾向を参考ラベルとして表示
- XとThreadsの投稿画面で利用

## プライバシー

- 投稿本文は、利用者がボタンを押したときだけxAI APIへ送信します
- 投稿の自動収集やバックグラウンド送信は行いません
- xAI APIキーは拡張機能の設定画面から入力し、`chrome.storage.sync`へ保存します
- APIキーや投稿本文を開発者のサーバーへ送る仕組みはありません

詳細は [PRIVACY.md](PRIVACY.md) をご覧ください。

## 必要なもの

- Google Chrome
- xAI APIキー
- ローカルでパッケージを作成するためのNode.js / npm

## ローカルインストール

この拡張はChromeウェブストアでは配布していません。リポジトリからZIPを作成し、展開したフォルダをChromeへ読み込みます。

```bash
npm install
npm run release
```

`dist/grok-social-check-v1.0.0.zip` を展開したあと、次の手順で読み込みます。

1. Chromeで `chrome://extensions` を開く
2. 「デベロッパーモード」を有効にする
3. 「パッケージ化されていない拡張機能を読み込む」を選ぶ
4. 展開したフォルダを指定する
5. 拡張機能のオプションでxAI APIキーを保存する

## 使い方

1. XまたはThreadsを開く
2. 対象の投稿に表示される「Grokでチェック」を押す
3. AIの整理結果を、元の投稿や一次情報と照らして読む

分析結果だけで重要な判断を行わず、必要に応じて元資料や信頼できる情報源を確認してください。

## 開発・確認コマンド

| コマンド | 内容 |
| --- | --- |
| `npm run smoke` | manifest、必須ファイル、JavaScript構文の確認 |
| `npm run test` | 投稿抽出とJSON解析の単体テスト |
| `npm run check` | smokeと単体テストを実行 |
| `npm run smoke:chrome` | インストール済みPC版Chromeで拡張を読み込む確認 |
| `npm run check:pc` | ローカルPC向けの一式確認 |
| `npm run release` | 確認後に配布用ZIPを作成 |

初回にPlaywright用のChromeチャンネルが必要な場合は、次を実行します。

```bash
npx playwright install chrome
```

Chromeを利用できない環境では、次のようにブラウザ確認だけを除外できます。

```bash
GROK_CHECK_SKIP_CHROME=1 npm run check
```

## 既知の制約

- x.comやThreadsの画面構造が変わると、ボタンが表示されなくなる場合があります
- xAI APIの利用料金、モデル、応答形式は変更される場合があります
- AIの出力には誤り、抜け、偏りが含まれる可能性があります

構築時の検証目標は [`docs/LOOP_GOALS.md`](docs/LOOP_GOALS.md)、進捗記録は [`docs/progress-log.md`](docs/progress-log.md) にあります。
