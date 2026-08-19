# 画像→GIF変換ツール（img2gif）

X（Twitter）投稿時の画質劣化を回避するための、高画質2フレームGIF変換ツールです。画像はサーバーに送信されず、すべてブラウザ内で処理されます。

**デプロイ先**: https://img2gif.maymai.dev

## 概要

X（Twitter）に画像を投稿すると再圧縮によって画質が劣化することがあります。本ツールは画像を同じフレームを2枚並べた高画質GIFに変換することで、この劣化を抑えることを目的としたクライアントサイドのWebアプリです。

- 画像の読み込み・変換はすべてブラウザ内（Canvas + [gifenc](https://github.com/mattdesl/gifenc)）で完結します。
- 変換後は Web Share API でXアプリへ直接共有、またはダウンロードできます。
- Cloudflare の静的アセット配信（`wrangler.jsonc`）でホスティングします。

## 主な機能

- **高画質変換**: gifenc の Median Cut 量子化（256色, `rgba4444`）で高品質なパレットを生成
- **ディザリング切り替え**: Floyd–Steinberg ディザリングのオン/オフを詳細設定から選択可能
- **入力形式の検証**: JPG / PNG / WebP のみ受け付け、それ以外はエラー表示
- **ファイルサイズ警告**: 変換後サイズが 5MB 超で警告、15MB 超でXへのアップロード不可の可能性を通知
- **Xに直接共有**: Web Share API（`navigator.canShare`）で変換後すぐにXアプリへ共有、非対応環境ではダウンロードにフォールバック
- **プライバシー保護**: 画像はサーバーに送信されず、すべてブラウザ内で処理
- **PWA対応**: `vite-plugin-pwa` によりホーム画面への追加とオフライン動作に対応
- **スマホ対応**: タップ操作・ドラッグ&ドロップ対応のレスポンシブUI

## 要件

- Node.js（Vite 7 / TypeScript 5.9 が動作するバージョン。Vite 7 は Node.js 20.19+ または 22.12+ を推奨）
- npm

## インストール

```bash
npm install
```

## 使い方

1. 画像を選択（ドロップゾーンをタップ、またはドラッグ&ドロップ）
2. 自動的にGIFへ変換
3. 「Xで共有」でXアプリに直接共有、または「ダウンロード」で保存

必要に応じて「詳細設定」からディザリングのオン/オフを切り替えられます。

### 対応形式

- 入力: JPG（image/jpeg）, PNG（image/png）, WebP（image/webp）
- 出力: GIF（同一フレームを2枚並べたループGIF）

## 開発コマンド

`package.json` の scripts に定義されているコマンドは以下のとおりです。

```bash
# 開発サーバー起動
npm run dev

# 型チェック（tsc）＋本番ビルド（dist/ を生成）
npm run build

# ビルド成果物のプレビュー
npm run preview

# ビルドして Cloudflare へデプロイ
npm run deploy

# ビルドして preview 環境へデプロイ
npm run deploy:preview
```

> `npm run deploy` / `npm run deploy:preview` は Wrangler による Cloudflare へのデプロイを行うため、Cloudflare の認証（`wrangler login` など）が必要です。

## 構成

```
.
├── index.html          # エントリHTML（UI構造・SEO/OGP/PWA メタタグ）
├── src/
│   ├── main.ts         # アプリのエントリポイント（初期化・イベント配線）
│   ├── gif-converter.ts# 画像→GIF変換ロジック（gifenc）とサイズ検証
│   ├── share.ts        # Web Share API 共有・ダウンロード・ファイル名生成
│   ├── ui.ts           # DOM要素の取得とUI状態管理
│   ├── gifenc.d.ts     # gifenc の型定義
│   └── style.css       # スタイル（Tailwind CSS v4）
├── public/             # 静的アセット（favicon・アイコン）
├── vite.config.ts      # Vite 設定（Tailwind・PWA マニフェスト）
├── wrangler.jsonc      # Cloudflare 静的アセット配信設定
├── tsconfig.json       # TypeScript 設定
└── package.json
```

## 技術スタック

- Vite 7
- TypeScript 5.9
- Tailwind CSS v4（`@tailwindcss/vite`）
- gifenc（GIF生成）
- vite-plugin-pwa
- Cloudflare（静的アセット配信 / Wrangler）

## ライセンス

MIT
