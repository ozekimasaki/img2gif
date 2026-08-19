# AGENTS.md

このリポジトリ（img2gif）で作業するコーディングエージェント向けのガイドです。画像をX（Twitter）投稿用の高画質2フレームGIFに変換する、クライアントサイドの Vite + TypeScript 製 Web アプリです。変換処理はすべてブラウザ内で完結し、バックエンドはありません（配信は Cloudflare の静的アセット）。

## プロジェクト構成

- `index.html` — アプリのエントリHTML。UI 構造、SEO/OGP/Twitter Card、PWA 関連のメタタグを含む。`<script type="module" src="/src/main.ts">` で TS を読み込む。
- `src/main.ts` — アプリのエントリポイント。`DOMContentLoaded` で初期化し、ドロップゾーン・ファイル入力・アクションボタンのイベントを配線する。変換のオーケストレーションもここ。
- `src/gif-converter.ts` — 画像→GIF 変換の中核。Canvas でピクセルを取得し、gifenc（`quantize` / `applyPalette` / `GIFEncoder`）で 2 フレーム GIF を生成。`formatFileSize` と `checkFileSizeLimit`（X 向けのサイズ検証）も提供。
- `src/share.ts` — Web Share API による共有（`shareFile` / `canShare`）、ダウンロード（`downloadFile`）、出力ファイル名生成（`generateGifFilename`）。
- `src/ui.ts` — DOM 要素の取得（`elements`）と UI 状態管理（`setUIState`、状態は `initial` / `preview` / `converting` / `ready`）。メッセージ表示等のヘルパーも含む。
- `src/style.css` — スタイル（Tailwind CSS v4）。
- `src/gifenc.d.ts` — gifenc の型定義。
- `public/` — 静的アセット（`favicon.svg`、`icons/`）。
- `vite.config.ts` — Vite 設定。`@tailwindcss/vite` と `vite-plugin-pwa`（マニフェスト・Workbox 設定）。
- `wrangler.jsonc` — Cloudflare の静的アセット配信設定（`assets.directory` は `./dist`）。
- `tsconfig.json` — TypeScript 設定（`strict`、`noUnusedLocals`、`noUnusedParameters`、`noEmit` など）。

## セットアップ

```bash
npm install
```

Node.js は Vite 7 / TypeScript 5.9 が動作するバージョンを使用してください（Vite 7 は Node.js 20.19+ または 22.12+ を推奨）。

## ビルド / 型チェック / lint / テスト

`package.json` に定義されている scripts のみが実在するコマンドです。

- 開発サーバー: `npm run dev`
- ビルド（型チェック込み）: `npm run build` — `tsc && vite build` を実行。`tsc` が `tsconfig.json` に基づく型チェックを行い（`noEmit: true`）、続けて `vite build` が `dist/` を生成する。
- 型チェック単体: 専用の script は無い。型チェックだけ行う場合は `npx tsc --noEmit` を使う（`tsconfig.json` の設定を利用）。
- プレビュー: `npm run preview`
- デプロイ: `npm run deploy` / `npm run deploy:preview`（Wrangler で Cloudflare へデプロイ。Cloudflare の認証が必要）

注意点:

- **lint 用の script は存在しない**（ESLint / Prettier 等の設定ファイルもリポジトリに無い）。
- **テストスイートは存在しない**（テストランナーやテストファイルは無い）。
- 変更後は最低限 `npm run build` を実行し、型エラーなくビルドが通ることを確認してください。`tsconfig.json` は `noUnusedLocals` / `noUnusedParameters` が有効なため、未使用の変数・引数はビルド失敗の原因になります。

## コーディング規約

- 言語は TypeScript、モジュールは ESM（`package.json` の `"type": "module"`）。`strict` モードで型を厳格に扱う。
- `tsconfig.json` は `verbatimModuleSyntax` を有効にしているため、型のみの import は `import type { ... }` を使う。
- 既存コードのスタイルに合わせる: 2 スペースインデント、シングルクォート、セミコロンあり。関数には日本語の JSDoc コメントが付いている箇所が多い。
- DOM 要素へのアクセスは `src/ui.ts` の `elements` 経由に統一する（個別に `getElementById` を散在させない）。
- UI の表示切り替えは `setUIState` を通して行い、状態は `UIState`（`initial` / `preview` / `converting` / `ready`）で管理する。
- ユーザー入力に由来する文字列を DOM に挿入する際は、`src/ui.ts` の `escapeHtml` のように XSS を避ける（`textContent` を使う等）。
- ユーザー向けメッセージ・UI 文言は日本語で統一する。

## 注意点

- **完全にクライアントサイド**。画像はサーバーに送信されず、Canvas と gifenc でブラウザ内変換される。この前提（プライバシー保護）を崩す変更をしない。
- 入力形式は `image/jpeg` / `image/png` / `image/webp` のみ許可（`src/main.ts` の `validTypes`）。
- 出力は同一フレームを 2 枚並べた GIF（`src/gif-converter.ts`）。フレーム遅延やディザリング（Floyd–Steinberg）の扱いを変更する場合は画質・サイズへの影響に注意。
- X のサイズ制限に関する閾値（5MB 警告 / 15MB 超で不可の可能性）は `checkFileSizeLimit` に定義されている。
- Web Share API は対応環境が限られるため、`canShare` で判定し、非対応時はダウンロードにフォールバックする設計を維持する。
- PWA（`vite-plugin-pwa`）を利用しているため、マニフェストや Service Worker まわりの変更は `vite.config.ts` を確認する。
- 変更は最小限・目的に沿った範囲に留める。生成物（`dist/`）や `node_modules` はコミットしない（`.gitignore` 参照）。
