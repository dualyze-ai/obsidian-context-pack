import { App, TFile, Notice, Platform, activeDocument } from 'obsidian';
import { zip, strToU8 } from 'fflate';
import { formatForNotebookLM, type FormatOptions } from './formatter';
import { estimateTokens } from './token-counter';
import type { OutputPreset, OutputSelectorState } from './types';
import { t } from './i18n';

export function getProjectKnowledgeInstructions(state: OutputSelectorState): string | null {
  const { activeTab, chatgptMode, claudeMode, geminiMode, agentMode } = state;
  if (activeTab === 'chatgpt' && chatgptMode === 'projects')   return t('pk_chatgpt_projects');
  if (activeTab === 'claude'  && claudeMode  === 'project')    return t('pk_claude_project');
  if (activeTab === 'gemini'  && geminiMode  === 'notebook')   return t('pk_gemini_notebook');
  if (activeTab === 'agents'  && agentMode   === 'claudecode') return t('pk_agents_claudecode');
  return null;
}

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

    zipEntries[zipPath] = strToU8(content) as Uint8Array;
    count++;
  }

  const date = window.moment().format('YYYYMMDD');
  const filename = `notebooklm-export-${date}.zip`;
  const blob = await new Promise<Blob>((resolve, reject) => {
    zip(zipEntries, (err, data: Uint8Array) => {
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
  const doc = (activeDocument ?? window.document) as Document;
  const container = doc.body ?? doc.documentElement;
  const a = doc.createElement('a');
  a.href = url;
  a.download = filename;
  container.appendChild(a);
  a.click();
  container.removeChild(a);
  window.setTimeout(() => URL.revokeObjectURL(url), 10000);
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
  return new Promise(resolve => window.setTimeout(resolve, 0));
}

export async function copyToClipboard(content: string): Promise<void> {
  await navigator.clipboard.writeText(content);
}

export async function exportAsText(
  app: App,
  content: string,
  filename: string,
  outputFolder: string,
  forceVault = false
): Promise<string> {
  const blob = new Blob([content], { type: 'text/markdown' });
  const savedPath = outputFolder ? `${outputFolder}/${filename}` : filename;
  if (Platform.isDesktop && !outputFolder && !forceVault) {
    downloadBlob(blob, filename);
    return '';
  }
  await saveToVault(app, outputFolder, filename, blob);
  return savedPath;
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
  const aiLabel = preset.target.replace(/-text$/, '').replace(/-zip$/, '');
  const filename = `pack-${slug}-${aiLabel}-${date}.md`;
  let savedPath = '';

  if (options.copyToClipboard && preset.copyToClipboard) {
    await copyToClipboard(content);
  }

  if (options.saveToFile && preset.saveToFile) {
    // When openAiUrl is enabled, force vault save so we can await completion before opening URL
    const forceVault = !!options.openAiUrl;
    try {
      savedPath = await exportAsText(app, content, filename, options.outputFolder, forceVault);
    } catch (err) {
      new Notice(`Export failed: ${err instanceof Error ? err.message : String(err)}`, 8000);
      return;
    }
  }

  if (options.copyToClipboard && preset.copyToClipboard && savedPath) {
    new Notice(t('notice_ai_done', tokenCount), 5000);
  } else if (options.copyToClipboard && preset.copyToClipboard) {
    new Notice(t('notice_ai_copied', tokenCount), 5000);
  } else if (savedPath) {
    new Notice(t('notice_ai_saved', savedPath, tokenCount), 8000);
  }

  if (options.openAiUrl && preset.aiUrl) {
    window.open(preset.aiUrl, '_blank');
  }
}
