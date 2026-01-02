/**
 * UI要素の取得と操作
 */

// 要素の取得
export const elements = {
  dropZone: () => document.getElementById('dropZone') as HTMLDivElement,
  dropZoneContent: () => document.getElementById('dropZoneContent') as HTMLDivElement,
  previewContainer: () => document.getElementById('previewContainer') as HTMLDivElement,
  previewImage: () => document.getElementById('previewImage') as HTMLImageElement,
  fileInfo: () => document.getElementById('fileInfo') as HTMLParagraphElement,
  fileInput: () => document.getElementById('fileInput') as HTMLInputElement,
  optionsSection: () => document.getElementById('optionsSection') as HTMLElement,
  ditheringToggle: () => document.getElementById('ditheringToggle') as HTMLInputElement,
  messageArea: () => document.getElementById('messageArea') as HTMLDivElement,
  actionButtons: () => document.getElementById('actionButtons') as HTMLElement,
  shareBtn: () => document.getElementById('shareBtn') as HTMLButtonElement,
  downloadBtn: () => document.getElementById('downloadBtn') as HTMLButtonElement,
  resetBtn: () => document.getElementById('resetBtn') as HTMLButtonElement,
  convertingIndicator: () => document.getElementById('convertingIndicator') as HTMLElement,
};

/**
 * UI状態の管理
 */
export type UIState = 'initial' | 'preview' | 'converting' | 'ready';

export function setUIState(state: UIState): void {
  const {
    dropZoneContent,
    previewContainer,
    optionsSection,
    actionButtons,
    convertingIndicator,
    dropZone,
  } = elements;

  // すべて非表示にしてからstateに応じて表示
  dropZoneContent().classList.add('hidden');
  previewContainer().classList.add('hidden');
  optionsSection().classList.add('hidden');
  actionButtons().classList.add('hidden');
  convertingIndicator().classList.add('hidden');
  dropZone().classList.remove('has-image');

  switch (state) {
    case 'initial':
      dropZoneContent().classList.remove('hidden');
      break;
    case 'preview':
      previewContainer().classList.remove('hidden');
      optionsSection().classList.remove('hidden');
      dropZone().classList.add('has-image');
      break;
    case 'converting':
      previewContainer().classList.remove('hidden');
      convertingIndicator().classList.remove('hidden');
      dropZone().classList.add('has-image');
      break;
    case 'ready':
      previewContainer().classList.remove('hidden');
      actionButtons().classList.remove('hidden');
      dropZone().classList.add('has-image');
      break;
  }
}

/**
 * プレビュー画像を表示
 */
export function showPreview(imageUrl: string, info: string): void {
  const { previewImage, fileInfo } = elements;
  previewImage().src = imageUrl;
  fileInfo().textContent = info;
}

/**
 * メッセージを表示
 */
export function showMessage(
  message: string,
  type: 'warning' | 'success' | 'error'
): void {
  const messageArea = elements.messageArea();
  messageArea.classList.remove('hidden');
  
  const className = type === 'error' ? 'warning' : type;
  messageArea.innerHTML = `<div class="${className}">${escapeHtml(message)}</div>`;
}

/**
 * メッセージをクリア
 */
export function clearMessage(): void {
  const messageArea = elements.messageArea();
  messageArea.classList.add('hidden');
  messageArea.innerHTML = '';
}

/**
 * ボタンのローディング状態を設定
 */
export function setButtonLoading(button: HTMLButtonElement, loading: boolean): void {
  if (loading) {
    button.disabled = true;
    const originalContent = button.innerHTML;
    button.dataset.originalContent = originalContent;
    button.innerHTML = '<div class="loading-spinner"></div>';
  } else {
    button.disabled = false;
    if (button.dataset.originalContent) {
      button.innerHTML = button.dataset.originalContent;
      delete button.dataset.originalContent;
    }
  }
}

/**
 * ドラッグオーバー状態の設定
 */
export function setDragOver(isDragOver: boolean): void {
  const dropZone = elements.dropZone();
  if (isDragOver) {
    dropZone.classList.add('drag-over');
  } else {
    dropZone.classList.remove('drag-over');
  }
}

/**
 * HTMLエスケープ
 */
function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
