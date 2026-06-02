import { App, TFile, Modal } from 'obsidian';
import { t } from './i18n';

interface LinkedNode {
  file: TFile;
  depth: number;
  parent?: TFile;
}

interface AiMocResult {
  root: TFile;
  nodes: LinkedNode[];
  backlinks: TFile[];
}

interface AiMocConfig {
  rootFile: TFile;
  scope: 'direct' | 'related';
  includeBacklinksInMoc: boolean;
  includeBacklinksInPack: boolean;
  generateContextPack: boolean;
}

async function collectLinkedNotes(
  app: App,
  rootFile: TFile,
  scope: 'direct' | 'related'
): Promise<AiMocResult> {
  const visited = new Set<string>();
  visited.add(rootFile.path);

  const maxDepth = scope === 'direct' ? 1 : 2;
  const nodes: LinkedNode[] = [];

  const queue: Array<{ file: TFile; depth: number; parent?: TFile }> = [
    { file: rootFile, depth: 0 },
  ];

  while (queue.length > 0) {
    const { file, depth } = queue.shift()!;

    if (depth >= maxDepth) continue;

    const cache = app.metadataCache.getFileCache(file);
    const links = cache?.links ?? [];

    for (const link of links) {
      const dest = app.metadataCache.getFirstLinkpathDest(link.link, file.path);
      if (!dest || dest.extension !== 'md') continue;
      if (visited.has(dest.path)) continue;

      const nextDepth = depth + 1;
      nodes.push({ file: dest, depth: nextDepth, parent: file });
      visited.add(dest.path);

      if (nextDepth < maxDepth) {
        queue.push({ file: dest, depth: nextDepth });
      }
    }
  }

  const backlinks: TFile[] = [];
  for (const file of app.vault.getMarkdownFiles()) {
    if (visited.has(file.path)) continue;
    const cache = app.metadataCache.getFileCache(file);
    const links = cache?.links ?? [];
    for (const link of links) {
      const dest = app.metadataCache.getFirstLinkpathDest(link.link, file.path);
      if (dest?.path === rootFile.path) {
        backlinks.push(file);
        break;
      }
    }
  }

  return { root: rootFile, nodes, backlinks };
}

function buildMocContent(result: AiMocResult, config: AiMocConfig): string {
  const today = window.moment().format('YYYY-MM-DD');
  const rootName = result.root.basename;

  const frontmatter = [
    '---',
    `generated: ${today}`,
    'generatedBy: ai-context-pack',
    `root: ${rootName}`,
    `scope: ${config.scope}`,
    `includeBacklinks: ${config.includeBacklinksInMoc}`,
    '---',
  ].join('\n');

  const depth1 = result.nodes.filter(n => n.depth === 1).map(n => `- [[${n.file.basename}]]`);
  const depth2plus = result.nodes.filter(n => n.depth >= 2).map(n => `- [[${n.file.basename}]]`);
  const backlinkLines = result.backlinks.map(f => `- [[${f.basename}]]`);

  const sections: string[] = [`# [[${rootName}]]`];
  let hasContent = false;

  if (depth1.length > 0) {
    sections.push('', '## Core Concepts', '', ...depth1);
    hasContent = true;
  }

  if (config.scope !== 'direct' && depth2plus.length > 0) {
    sections.push('', '## Related Notes', '', ...depth2plus);
    hasContent = true;
  }

  if (config.includeBacklinksInMoc && backlinkLines.length > 0) {
    sections.push('', '## Referenced By', '', ...backlinkLines);
    hasContent = true;
  }

  if (!hasContent) {
    sections.push('', '_No linked notes found._');
  }

  return `${frontmatter}\n\n${sections.join('\n')}`;
}

class ConfirmModal extends Modal {
  private resolve: ((value: boolean) => void) | null = null;
  private answered = false;

  constructor(app: App, private message: string) {
    super(app);
  }

  onOpen(): void {
    this.contentEl.createEl('p', { text: this.message });
    const btns = this.contentEl.createDiv({ cls: 'modal-button-container' });
    btns.createEl('button', { text: t('ai_moc_overwrite_cancel') })
      .addEventListener('click', () => { this.answer(false); this.close(); });
    btns.createEl('button', { text: t('ai_moc_overwrite_confirm'), cls: 'mod-warning' })
      .addEventListener('click', () => { this.answer(true); this.close(); });
  }

  onClose(): void {
    this.answer(false);
    this.contentEl.empty();
  }

  private answer(value: boolean): void {
    if (!this.answered) {
      this.answered = true;
      this.resolve?.(value);
    }
  }

  confirm(): Promise<boolean> {
    return new Promise(resolve => {
      this.resolve = resolve;
      this.open();
    });
  }
}

async function createAiMoc(
  app: App,
  config: AiMocConfig
): Promise<{ mocFile: TFile; packFiles: TFile[] }> {
  const result = await collectLinkedNotes(app, config.rootFile, config.scope);
  const content = buildMocContent(result, config);

  const mocFilename = `${result.root.basename} MOC.md`;
  let mocFile: TFile;

  const existing = app.vault.getAbstractFileByPath(mocFilename);
  if (existing instanceof TFile) {
    const existingCache = app.metadataCache.getFileCache(existing);
    const generatedBy = existingCache?.frontmatter?.generatedBy;

    if (generatedBy === 'ai-context-pack') {
      await app.vault.modify(existing, content);
      mocFile = existing;
    } else {
      const confirmed = await new ConfirmModal(
        app,
        t('ai_moc_overwrite_message', result.root.basename)
      ).confirm();
      if (!confirmed) throw new DOMException('Cancelled', 'AbortError');
      await app.vault.modify(existing, content);
      mocFile = existing;
    }
  } else {
    mocFile = await app.vault.create(mocFilename, content);
  }

  const allFiles = [result.root, ...result.nodes.map(n => n.file)];
  if (config.includeBacklinksInPack) allFiles.push(...result.backlinks);

  const seen = new Set<string>();
  const packFiles = allFiles.filter(f => {
    if (seen.has(f.path)) return false;
    seen.add(f.path);
    return true;
  });

  return { mocFile, packFiles };
}

export { createAiMoc, buildMocContent, collectLinkedNotes, type AiMocConfig, type AiMocResult, type LinkedNode };
