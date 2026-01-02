# 画像→GIF変換ツール

X（Twitter）投稿時の画質劣化を回避するための、高画質2フレームGIF変換ツールです。

## 特徴

- **高画質変換**: gifencによる高品質パレット生成で画質を維持
- **スマホ対応**: タップで簡単操作、レスポンシブUI
- **Xに直接共有**: Web Share APIで変換後すぐにXアプリへ共有
- **プライバシー保護**: 画像はサーバーに送信されず、すべてブラウザ内で処理
- **PWA対応**: ホーム画面に追加してアプリのように使用可能
- **オフライン対応**: Service Workerによるオフライン動作

## 技術スタック

- Vite 7
- TypeScript
- Tailwind CSS v4
- gifenc（GIF生成）
- vite-plugin-pwa
- Cloudflare Workers Static Assets

## 開発

```bash
# 依存関係のインストール
npm install

# 開発サーバー起動
npm run dev

# ビルド
npm run build

# プレビュー
npm run preview
```

## デプロイ

Cloudflare Pagesへのデプロイ：

```bash
# Wranglerのインストール（初回のみ）
npm install -g wrangler

# Cloudflareにログイン
wrangler login

# デプロイ
npm run deploy
```

**デプロイ先**: https://img2gif.maymai.dev

## 使い方

1. 画像を選択（タップまたはドラッグ&ドロップ）
2. 自動的にGIFに変換
3. 「Xで共有」ボタンでXアプリに直接共有、または「ダウンロード」で保存

## 対応形式

- 入力: JPG, PNG, WebP
- 出力: GIF（2フレームループ）

## ライセンス

MIT
