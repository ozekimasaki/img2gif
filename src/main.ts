import './style.css';
import {
  convertToGif,
  formatFileSize,
  checkFileSizeLimit,
} from './gif-converter';
import { shareFile, downloadFile, generateGifFilename, canShare } from './share';
import {
  elements,
  setUIState,
  showPreview,
  showMessage,
  clearMessage,
  setButtonLoading,
  setDragOver,
} from './ui';

// アプリケーション状態
let currentFile: File | null = null;
let convertedBlob: Blob | null = null;
let convertedFilename: string = '';

/**
 * アプリケーション初期化
 */
function init(): void {
  setupDropZone();
  setupFileInput();
  setupActionButtons();
  setupShareButtonVisibility();
}

/**
 * ドロップゾーンのセットアップ
 */
function setupDropZone(): void {
  const dropZone = elements.dropZone();
  const fileInput = elements.fileInput();

  // クリックでファイル選択
  dropZone.addEventListener('click', () => {
    fileInput.click();
  });

  // ドラッグ&ドロップ
  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  });

  dropZone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  });

  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);

    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  });
}

/**
 * ファイル入力のセットアップ
 */
function setupFileInput(): void {
  const fileInput = elements.fileInput();

  fileInput.addEventListener('change', () => {
    const files = fileInput.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  });
}

/**
 * アクションボタンのセットアップ
 */
function setupActionButtons(): void {
  const { shareBtn, downloadBtn, resetBtn } = elements;

  shareBtn().addEventListener('click', handleShare);
  downloadBtn().addEventListener('click', handleDownload);
  resetBtn().addEventListener('click', handleReset);
}

/**
 * 共有ボタンの表示/非表示を設定
 * Web Share APIが利用できない場合は非表示
 */
function setupShareButtonVisibility(): void {
  const shareBtn = elements.shareBtn();
  if (!canShare()) {
    shareBtn.style.display = 'none';
  }
}

/**
 * ファイル処理
 */
async function handleFile(file: File): Promise<void> {
  // ファイルタイプチェック
  const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    showMessage('JPG、PNG、WebP形式の画像を選択してください。', 'error');
    return;
  }

  currentFile = file;
  clearMessage();

  // プレビュー表示
  const previewUrl = URL.createObjectURL(file);
  const info = `${file.name} (${formatFileSize(file.size)})`;
  showPreview(previewUrl, info);
  setUIState('preview');

  // 自動変換を開始
  await startConversion();
}

/**
 * GIF変換を開始
 */
async function startConversion(): Promise<void> {
  if (!currentFile) return;

  setUIState('converting');
  clearMessage();

  try {
    const dithering = elements.ditheringToggle().checked;
    const result = await convertToGif(currentFile, { dithering });

    convertedBlob = result.blob;
    convertedFilename = generateGifFilename(currentFile.name);

    // 変換後のプレビューを更新
    const previewUrl = URL.createObjectURL(result.blob);
    const info = `変換完了: ${formatFileSize(result.gifSize)} (元: ${formatFileSize(result.originalSize)})`;
    showPreview(previewUrl, info);

    // ファイルサイズチェック
    const sizeCheck = checkFileSizeLimit(result.gifSize);
    if (sizeCheck.warning) {
      showMessage(sizeCheck.warning, sizeCheck.ok ? 'warning' : 'error');
    }

    setUIState('ready');
  } catch (error) {
    console.error('Conversion error:', error);
    showMessage(
      error instanceof Error ? error.message : '変換中にエラーが発生しました。',
      'error'
    );
    setUIState('preview');
  }
}

/**
 * 共有ボタンハンドラ
 */
async function handleShare(): Promise<void> {
  if (!convertedBlob) return;

  const shareBtn = elements.shareBtn();
  setButtonLoading(shareBtn, true);

  try {
    const result = await shareFile(convertedBlob, convertedFilename);
    
    if (result.method === 'fallback') {
      showMessage('共有機能が利用できないため、ダウンロードしました。', 'warning');
    }
  } catch (error) {
    console.error('Share error:', error);
    showMessage('共有に失敗しました。ダウンロードをお試しください。', 'error');
  } finally {
    setButtonLoading(shareBtn, false);
  }
}

/**
 * ダウンロードボタンハンドラ
 */
function handleDownload(): void {
  if (!convertedBlob) return;

  const downloadBtn = elements.downloadBtn();
  setButtonLoading(downloadBtn, true);

  try {
    downloadFile(convertedBlob, convertedFilename);
    showMessage('ダウンロードを開始しました。', 'success');
  } catch (error) {
    console.error('Download error:', error);
    showMessage('ダウンロードに失敗しました。', 'error');
  } finally {
    setTimeout(() => {
      setButtonLoading(downloadBtn, false);
    }, 500);
  }
}

/**
 * リセットボタンハンドラ
 */
function handleReset(): void {
  currentFile = null;
  convertedBlob = null;
  convertedFilename = '';

  // ファイル入力をリセット
  elements.fileInput().value = '';

  clearMessage();
  setUIState('initial');
}

// DOMContentLoaded で初期化
document.addEventListener('DOMContentLoaded', init);
