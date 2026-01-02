import { GIFEncoder, quantize, applyPalette } from 'gifenc';

export interface ConvertOptions {
  dithering: boolean;
}

export interface ConvertResult {
  blob: Blob;
  width: number;
  height: number;
  originalSize: number;
  gifSize: number;
}

/**
 * 画像ファイルを2フレームGIFに変換
 * X（Twitter）の画質劣化を回避するための高品質変換
 */
export async function convertToGif(
  file: File,
  options: ConvertOptions = { dithering: true }
): Promise<ConvertResult> {
  // 画像を読み込み
  const image = await loadImage(file);
  const { width, height } = image;

  // Canvasに描画してピクセルデータを取得
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(image, 0, 0);
  const imageData = ctx.getImageData(0, 0, width, height);
  const pixels = imageData.data;

  // RGBA配列を作成
  const rgba = new Uint8Array(pixels);

  // 高品質パレット生成（256色）
  // Median Cut Quantizationで最適な色を選択
  const palette = quantize(rgba, 256, {
    format: 'rgba4444', // 高品質フォーマット
    oneBitAlpha: true,
  });

  // パレットを適用してインデックス配列を生成
  const index = applyPalette(rgba, palette, options.dithering ? 'floyd-steinberg' : undefined);

  // GIFエンコーダー作成
  const gif = GIFEncoder();

  // フレーム設定
  const frameDelay = 10; // 最小遅延（10ms = 0.01秒）

  // フレーム1を追加
  gif.writeFrame(index, width, height, {
    palette,
    delay: frameDelay,
    dispose: 0, // 処理しない（前のフレームを残す）
  });

  // フレーム2を追加（同じ画像）
  gif.writeFrame(index, width, height, {
    palette,
    delay: frameDelay,
    dispose: 0,
  });

  // GIFを完成
  gif.finish();

  // Blobを作成
  const buffer = gif.bytes();
  // Uint8Arrayから新しいArrayBufferを作成してBlobに渡す
  const arrayBuffer = new Uint8Array(buffer).buffer as ArrayBuffer;
  const blob = new Blob([arrayBuffer], { type: 'image/gif' });

  return {
    blob,
    width,
    height,
    originalSize: file.size,
    gifSize: blob.size,
  };
}

/**
 * Fileから画像を読み込み
 */
function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error('画像の読み込みに失敗しました'));
    };
    img.src = URL.createObjectURL(file);
  });
}

/**
 * ファイルサイズをフォーマット
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  } else if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  } else {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }
}

/**
 * X（Twitter）のファイルサイズ制限をチェック
 * GIF: 最大15MB（モバイル）、5MB推奨
 */
export function checkFileSizeLimit(bytes: number): {
  ok: boolean;
  warning: string | null;
} {
  const MB = 1024 * 1024;
  
  if (bytes > 15 * MB) {
    return {
      ok: false,
      warning: 'ファイルサイズが15MBを超えています。Xにアップロードできない可能性があります。',
    };
  }
  
  if (bytes > 5 * MB) {
    return {
      ok: true,
      warning: 'ファイルサイズが5MBを超えています。モバイルでは表示に時間がかかる場合があります。',
    };
  }
  
  return { ok: true, warning: null };
}
