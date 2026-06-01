import { App, TFile, Notice, Platform } from 'obsidian'; // Notice is used by exportSingleNote
import { zip, strToU8 } from 'fflate';
import { formatForNotebookLM, type FormatOptions } from './formatter';
import { estimateTokens } from './token-counter';
import type { OutputPreset } from './types';
import { t } from './i18n';

interface ExportOptions extends FormatOptions {
  targetFolder: string;
  outputFolder: string;
  flattenStructure: boolean;
  openAfterExport: boolean;
}

export async function exportVault(
  app: App,
  options: ExportOptions,
  onProgress?: (current: number, total: number) => void,
  signal?: AbortSignal,
  files?: TFile[]
): Promise<{ filename: string; count: number } | null> {
  const targetFiles = files ?? getMarkdownFiles(app, options.targetFolder);
  if (targetFiles.length === 0) return null;

  const zipEntries: Record<string, Uint8Array> = {};
  let count = 0;

  for (let i = 0; i < targetFiles.length; i++) {
    if (signal?.aborted) throw new DOMException('Cancelled', 'AbortError');
    const file = targetFiles[i];
    if (i % 10 === 0) {
      onProgress?.(i + 1, targetFiles.length);
      await yieldToUI();
    }

    const raw = await app.vault.read(file);
    const content = formatForNotebookLM(raw, options);
    if (!content.trim()) continue;

    const zipPath = options.flattenStructure
      ? file.path.replace(/\//g, '__')
      : file.path;

    zipEntries[zipPath] = strToU8(content);
    count++;
  }

  const date = window.moment().format('YYYYMMDD');
  const filename = `notebooklm-export-${date}.zip`;
  const blob = await new Promise<Blob>((resolve, reject) => {
    zip(zipEntries, (err, data) => {
      if (err) reject(err);
      else resolve(new Blob([data], { type: 'application/zip' }));
    });
  });

  let savedPath = filename;
  if (Platform.isDesktop && !options.outputFolder) {
    downloadBlob(blob, filename);
  } else {
    const folder = options.outputFolder || '';
    savedPath = folder ? `${folder}/${filename}` : filename;
    await saveToVault(app, folder, filename, blob);
  }

  return { filename: savedPath, count };
}

function getMarkdownFiles(app: App, targetFolder: string): TFile[] {
  const all = app.vault.getMarkdownFiles();
  if (!targetFolder) return all;
  return all.filter(f => f.path.startsWith(targetFolder + '/') || f.path === targetFolder);
}

export async function exportSingleNote(app: App, file: TFile, options: FormatOptions): Promise<void> {
  const raw = await app.vault.read(file);
  const content = formatForNotebookLM(raw, options);
  if (!content.trim()) {
    new Notice(t('notice_no_files'));
    return;
  }
  const date = window.moment().format('YYYYMMDD');
  const blob = new Blob([content], { type: 'text/markdown' });
  downloadBlob(blob, `${file.basename}-${date}.md`);
  new Notice(t('notice_done', 1), 5000);
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

export async function copyToClipboard(content: string): Promise<void> {
  await navigator.clipboard.writeText(content);
}

export async function exportAsText(
  app: App,
  content: string,
  filename: string,
  outputFolder: string
): Promise<void> {
  const blob = new Blob([content], { type: 'text/markdown' });
  if (Platform.isDesktop && !outputFolder) {
    downloadBlob(blob, filename);
  } else {
    await saveToVault(app, outputFolder, filename, blob);
  }
}

export interface AiOutputOptions {
  copyToClipboard: boolean;
  saveToFile: boolean;
  outputFolder: string;
  openAiUrl: boolean;
}

export async function buildAiOutput(
  app: App,
  content: string,
  slug: string,
  preset: OutputPreset,
  options: AiOutputOptions
): Promise<void> {
  const tokenCount = estimateTokens(content);
  const date = window.moment().format('YYYYMMDD');
  const filename = `pack-${slug}-${date}.md`;
  let savedPath = '';

  if (options.copyToClipboard && preset.copyToClipboard) {
    await copyToClipboard(content);
  }

  if (options.saveToFile && preset.saveToFile) {
    await exportAsText(app, content, filename, options.outputFolder);
    savedPath = options.outputFolder
      ? `${options.outputFolder}/${filename}`
      : filename;
  }

  if (options.copyToClipboard && preset.copyToClipboard && savedPath) {
    new Notice(t('notice_ai_done', tokenCount), 5000);
  } else if (options.copyToClipboard && preset.copyToClipboard) {
    new Notice(t('notice_ai_copied', tokenCount), 5000);
  } else if (savedPath) {
    new Notice(t('notice_ai_saved', savedPath, tokenCount), 8000);
  }

  if (options.openAiUrl && preset.aiUrl) {
    const url = preset.aiUrl;
    setTimeout(() => window.open(url, '_blank'), 800);
  }
}
