# Grok Social Check

X と Threads の投稿に **Grok（xAI）** で参考分析を付ける Chrome 拡張（MV3）です。

- ファクトチェック風の整理（公式ファクトチェックではありません）
- 左右・イデオロギー寄りの**参考ラベル**

## セットアップ（開発）

```bash
npm install
```

拡張を Chrome で読み込む:

1. `chrome://extensions` → デベロッパーモード
2. 「パッケージ化されていない拡張機能を読み込む」→ このリポジトリのルート

オプション画面で **xAI API キー**（`xaiToken`）を保存してください。キーはリポジトリに含めません。

## スモーク / テスト（PC Chrome 想定）

| コマンド | 内容 |
|----------|------|
| `npm run smoke` | manifest・必須ファイル・JS 構文 |
| `npm run test` | 投稿抽出・JSON パース（happy-dom、ネット不要） |
| `npm run smoke:chrome` | **PC の Google Chrome** に拡張をロードし、options と x.com で content script を確認 |

初回のみ Playwright 用 Chrome チャンネル:

```bash
npx playwright install chrome
```

ヘッドレス VM など Chrome が無い環境:

```bash
GROK_CHECK_SKIP_CHROME=1 npm run check
```

ローカル PC でフル確認:

```bash
npm run check:pc
```

構築ループ・停止条件・微分目標は [`docs/LOOP_GOALS.md`](docs/LOOP_GOALS.md)。進捗は [`docs/progress-log.md`](docs/progress-log.md)。

`smoke:chrome` は `channel: 'chrome'` でインストール済み **Google Chrome** を起動します（Chromium バンドルではなくデスクトップ Chrome）。

## 注意

- 分析結果は AI の推論であり、事実認定や政治的評価の公式見解ではありません。
- x.com の DOM は変わりやすく、ボタンが出ない場合はセレクタ更新が必要です。

## ライセンス

MIT（アイコンは暫定流用の場合は差し替えてください）