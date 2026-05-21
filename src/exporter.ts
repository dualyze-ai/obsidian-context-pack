import { App, TFile, Notice, Platform } from 'obsidian';
import JSZip from 'jszip';
import { formatForNotebookLM, type FormatOptions } from './formatter';
import { t } from './i18n';

interface ExportOptions extends FormatOptions {
  targetFolder: string;
  outputFolder: string;
  flattenStructure: boolean;
  openAfterExport: boolean;
}

export async function exportVault(app: App, options: ExportOptions, singleFile?: TFile): Promise<void> {
  const files = singleFile
    ? [singleFile]
    : getMarkdownFiles(app, options.targetFolder);

  if (files.length === 0) {
    new Notice(t('notice_no_files'));
    return;
  }

  const notice = new Notice(t('notice_exporting'), 0);

  try {
    const zip = new JSZip();
    let count = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (files.length > 1 && i % 10 === 0) {
        notice.setMessage(`⏳ ${t('notice_exporting')} ${i + 1} / ${files.length}`);
        await yieldToUI();
      }

      const raw = await app.vault.read(file);
      const content = formatForNotebookLM(raw, options);
      if (!content.trim()) continue;

      const zipPath = options.flattenStructure
        ? file.path.replace(/\//g, '__')
        : file.path;

      zip.file(zipPath, content);
      count++;
    }

    const date = window.moment().format('YYYYMMDD');
    const filename = `notebooklm-export-${date}.zip`;
    const blob = await zip.generateAsync({ type: 'blob' });

    let savedPath = filename;
    if (Platform.isDesktop && options.outputFolder) {
      savedPath = `${options.outputFolder}/${filename}`;
      await saveToVault(app, options.outputFolder, filename, blob);
    } else {
      downloadBlob(blob, filename);
    }

    notice.hide();
    new Notice(`${t('notice_done', count)}\n📄 ${savedPath}`, 8000);
  } catch (err) {
    console.error('[Context Pack] Export failed:', err);
    notice.hide();
    new Notice(t('notice_error'));
  }
}

function getMarkdownFiles(app: App, targetFolder: string): TFile[] {
  const all = app.vault.getMarkdownFiles();
  if (!targetFolder) return all;
  return all.filter(f => f.path.startsWith(targetFolder + '/') || f.path === targetFolder);
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

async function saveToVault(app: App, folder: string, filename: string, blob: Blob): Promise<void> {
  const buffer = await blob.arrayBuffer();
  const path = folder ? `${folder}/${filename}` : filename;
  const existing = app.vault.getAbstractFileByPath(path);
  if (existing && existing instanceof TFile) {
    await app.vault.modifyBinary(existing, buffer);
  } else {
    await app.vault.createBinary(path, buffer);
  }
}

function yieldToUI(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 0));
}
