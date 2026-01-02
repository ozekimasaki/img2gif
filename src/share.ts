/**
 * Web Share API を使用してファイルを共有
 * X（Twitter）アプリに直接共有可能
 */
export async function shareFile(
  blob: Blob,
  filename: string
): Promise<{ success: boolean; method: 'share' | 'fallback' }> {
  const file = new File([blob], filename, { type: 'image/gif' });

  // Web Share API が利用可能かチェック
  if (canShare(file)) {
    try {
      await navigator.share({
        files: [file],
        title: '画像をGIFに変換しました',
      });
      return { success: true, method: 'share' };
    } catch (error) {
      // ユーザーがキャンセルした場合
      if (error instanceof Error && error.name === 'AbortError') {
        return { success: false, method: 'share' };
      }
      // その他のエラーはフォールバック
      console.warn('Web Share API failed, falling back to download:', error);
    }
  }

  // フォールバック: ダウンロード
  downloadFile(blob, filename);
  return { success: true, method: 'fallback' };
}

/**
 * Web Share API でファイル共有が可能かチェック
 */
export function canShare(file?: File): boolean {
  if (!navigator.share || !navigator.canShare) {
    return false;
  }

  if (file) {
    return navigator.canShare({ files: [file] });
  }

  // ファイルなしでの基本的なチェック
  return true;
}

/**
 * ファイルをダウンロード
 */
export function downloadFile(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * ファイル名を生成（拡張子を.gifに変更）
 */
export function generateGifFilename(originalName: string): string {
  const baseName = originalName.replace(/\.[^.]+$/, '');
  const timestamp = Date.now();
  return `${baseName}_${timestamp}.gif`;
}
