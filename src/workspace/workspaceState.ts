import { App, TFile, TFolder } from 'obsidian';
import type { WorkspaceConfig, WorkspaceState, ArtifactState, ArtifactStatus } from './workspaceTypes';
import { sanitizeFilename } from '../epub/epubSanitizer';
import type { PackRecord } from '../freshness/types';

function artifactFromFile(file: TFile | null, refMtime: number): ArtifactState {
  if (!file) return { status: 'missing' };
  const mtime = file.stat.mtime;
  const status: ArtifactStatus = mtime >= refMtime ? 'ready' : 'outdated';
  return { status, filePath: file.path, mtime };
}

export async function computeWorkspaceState(
  app: App,
  config: WorkspaceConfig,
  outputFolder: string,
  packRegistry?: PackRecord[],
): Promise<WorkspaceState> {
  const folderNode = app.vault.getAbstractFileByPath(config.sourcePath);
  const folderExists = folderNode instanceof TFolder;

  const sourceFiles = app.vault.getMarkdownFiles()
    .filter(f => f.path.startsWith(config.sourcePath + '/'));
  const notesCount = sourceFiles.length;
  const sourceLatestMtime = sourceFiles.reduce((max, f) => Math.max(max, f.stat.mtime), 0);

  // Find AI Brief by frontmatter
  let briefFile: TFile | null = null;
  for (const file of app.vault.getMarkdownFiles()) {
    const fm = app.metadataCache.getFileCache(file)?.frontmatter;
    if (fm?.['generatedBy'] === 'ai-brief-generator' && fm?.['sourceFolder'] === config.sourcePath) {
      briefFile = file;
      break;
    }
  }

  // Naming convention fallback
  if (!briefFile) {
    const folderName = config.sourcePath.split('/').pop() ?? config.sourcePath;
    const safe = folderName.replace(/[/\\:*?"<>|#^[\]]/g, '-').trim();
    const candidatePath = outputFolder ? `${outputFolder}/${safe}-AI-Brief.md` : `${safe}-AI-Brief.md`;
    const candidate = app.vault.getAbstractFileByPath(candidatePath);
    if (candidate instanceof TFile) briefFile = candidate;
  }

  const aiBrief = artifactFromFile(briefFile, sourceLatestMtime);

  // Downstream artifacts (MOC, Pack, EPUB) are outdated if older than
  // either the source files OR the AI Brief (whichever is newer).
  const briefMtime = briefFile?.stat.mtime ?? 0;
  const downstreamRef = Math.max(sourceLatestMtime, briefMtime);

  // AI MOC
  let mocFile: TFile | null = null;
  if (briefFile) {
    const mocPath = outputFolder
      ? `${outputFolder}/${briefFile.basename} MOC.md`
      : `${briefFile.basename} MOC.md`;
    const m = app.vault.getAbstractFileByPath(mocPath);
    if (m instanceof TFile) mocFile = m;
  }
  const aiMoc: ArtifactState = briefFile
    ? artifactFromFile(mocFile, downstreamRef)
    : { status: 'missing' };

  // Context Pack: check physical files then packRegistry
  const folderName = config.sourcePath.split('/').pop() ?? config.sourcePath;
  const packPrefix = `pack-folder-${folderName}-`;

  let latestPackFile: TFile | null = null;
  for (const file of app.vault.getMarkdownFiles()) {
    if (outputFolder && !file.path.startsWith(outputFolder + '/')) continue;
    if (file.basename.startsWith(packPrefix)) {
      if (!latestPackFile || file.stat.mtime > latestPackFile.stat.mtime) {
        latestPackFile = file;
      }
    }
  }

  let contextPack: ArtifactState;
  if (latestPackFile) {
    contextPack = artifactFromFile(latestPackFile, sourceLatestMtime);
  } else if (packRegistry) {
    const entries = packRegistry.filter(
      p => p.source.type === 'folder' && p.source.query === config.sourcePath
    );
    if (entries.length > 0) {
      const latest = entries.reduce((a, b) => a.createdAt > b.createdAt ? a : b);
      const status: ArtifactStatus = latest.createdAt >= sourceLatestMtime ? 'ready' : 'outdated';
      contextPack = { status, mtime: latest.createdAt };
    } else {
      contextPack = { status: 'missing' };
    }
  } else {
    contextPack = { status: 'missing' };
  }

  // EPUB
  let epubFile: TFile | null = null;
  if (briefFile) {
    const epubFilename = sanitizeFilename(briefFile.basename).toLowerCase() + '.epub';
    const epubPath = outputFolder ? `${outputFolder}/${epubFilename}` : epubFilename;
    const e = app.vault.getAbstractFileByPath(epubPath);
    if (e instanceof TFile) epubFile = e;
  }
  const epub: ArtifactState = briefFile
    ? artifactFromFile(epubFile, sourceLatestMtime)
    : { status: 'missing' };

  // Notion Workspace ZIP
  const notionZipName = (
    config.name
      .replace(/[/\\:*?"<>|]/g, '-')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
      .replace(/^-|-$/g, '') || 'workspace'
  ) + '-notion-workspace.zip';
  const notionZipPath = outputFolder ? `${outputFolder}/${notionZipName}` : notionZipName;
  const notionZipNode = app.vault.getAbstractFileByPath(notionZipPath);
  const notionZip: ArtifactState = notionZipNode instanceof TFile
    ? artifactFromFile(notionZipNode, sourceLatestMtime)
    : { status: 'missing' };

  return { notesCount, sourceLatestMtime, folderExists, aiBrief, aiMoc, contextPack, epub, notionZip };
}
