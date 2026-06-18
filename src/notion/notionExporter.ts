import { App, TFile } from 'obsidian';
import { zipSync, strToU8 } from 'fflate';
import type { Zippable } from 'fflate';
import type { WorkspaceConfig } from '../workspace/workspaceTypes';
import { convertForNotion } from './notionConverter';
import type { ImageRef } from './notionConverter';

function safeZipName(name: string): string {
  return (
    name
      .replace(/[/\\:*?"<>|]/g, '-')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
      .replace(/^-|-$/g, '') || 'workspace'
  );
}

function buildReadmeMd(workspaceName: string, hasBrief: boolean, hasMoc: boolean): string {
  const lines: string[] = [
    `# ${workspaceName}`,
    '',
    'This Notion-ready workspace was exported from AI Context Pack.',
    '',
    '## Start Here',
    '',
  ];

  let step = 1;
  if (hasBrief) lines.push(`${step++}. Open **AI Brief**`);
  if (hasMoc)   lines.push(`${step++}. Open **AI MOC**`);
  lines.push(`${step}. Browse individual notes in **Notes**`);

  lines.push(
    '',
    '## How to Import into Notion',
    '',
    '1. Open Notion',
    '2. Go to **Settings → Import**',
    '3. Choose **ZIP**',
    '4. Upload this ZIP file',
    '',
    'You can also type `/zip` inside any Notion page and upload this file.',
  );

  return lines.join('\n');
}

async function resolveImageFile(
  app: App,
  ref: ImageRef,
): Promise<TFile | null> {
  // Direct vault path
  const direct = app.vault.getAbstractFileByPath(ref.linkpath);
  if (direct instanceof TFile) return direct;

  // Metadata cache resolution (handles wikilink-style paths)
  const resolved = app.metadataCache.getFirstLinkpathDest(ref.linkpath, ref.noteVaultPath);
  if (resolved instanceof TFile) return resolved;

  // Relative to note's folder
  const noteFolder = ref.noteVaultPath.includes('/')
    ? ref.noteVaultPath.substring(0, ref.noteVaultPath.lastIndexOf('/'))
    : '';
  if (noteFolder) {
    const rel = app.vault.getAbstractFileByPath(noteFolder + '/' + ref.linkpath);
    if (rel instanceof TFile) return rel;
  }

  // Last resort: match by basename
  const basename = ref.proposedAssetName;
  return app.vault.getFiles().find(f => f.name === basename) ?? null;
}

export async function buildNotionZip(
  app: App,
  config: WorkspaceConfig,
  outputFolder: string,
  briefFilePath: string | undefined,
  mocFilePath: string | undefined,
): Promise<string> {
  const sourceNotes = app.vault.getMarkdownFiles()
    .filter(f => f.path.startsWith(config.sourcePath + '/'));

  if (sourceNotes.length === 0) {
    throw new Error('no-notes');
  }

  const zipBaseName = safeZipName(config.name) + '-notion-workspace';
  const root = zipBaseName + '/';

  const allImageRefs: ImageRef[] = [];
  const files: Zippable = {};

  // Source notes → Notes/
  for (const note of sourceNotes) {
    const relPath = note.path.slice(config.sourcePath.length + 1);
    const content = await app.vault.read(note);
    const { markdown, imageRefs } = convertForNotion(content, note.path, '../assets/');
    allImageRefs.push(...imageRefs);
    files[root + 'Notes/' + relPath] = strToU8(markdown);
  }

  // AI Brief
  let hasBrief = false;
  if (briefFilePath) {
    const f = app.vault.getAbstractFileByPath(briefFilePath);
    if (f instanceof TFile) {
      const content = await app.vault.read(f);
      const { markdown, imageRefs } = convertForNotion(content, f.path, 'assets/');
      allImageRefs.push(...imageRefs);
      files[root + 'AI Brief.md'] = strToU8(markdown);
      hasBrief = true;
    }
  }

  // AI MOC
  let hasMoc = false;
  if (mocFilePath) {
    const f = app.vault.getAbstractFileByPath(mocFilePath);
    if (f instanceof TFile) {
      const content = await app.vault.read(f);
      const { markdown, imageRefs } = convertForNotion(content, f.path, 'assets/');
      allImageRefs.push(...imageRefs);
      files[root + 'AI MOC.md'] = strToU8(markdown);
      hasMoc = true;
    }
  }

  // Collect images — deduplicate by proposed asset name
  const seenAssets = new Map<string, boolean>();
  for (const ref of allImageRefs) {
    const assetName = ref.proposedAssetName;
    if (seenAssets.has(assetName)) continue;
    seenAssets.set(assetName, true);

    const imageFile = await resolveImageFile(app, ref);
    if (!imageFile) continue;

    try {
      const data = await app.vault.readBinary(imageFile);
      files[root + 'assets/' + assetName] = new Uint8Array(data);
    } catch {
      // skip unreadable image
    }
  }

  // README
  files[root + 'README.md'] = strToU8(buildReadmeMd(config.name, hasBrief, hasMoc));

  // Build ZIP
  const zipData: Uint8Array = zipSync(files);
  const ab = new ArrayBuffer(zipData.byteLength);
  new Uint8Array(ab).set(zipData);

  // Save to vault
  const filename = zipBaseName + '.zip';
  const savePath = outputFolder ? `${outputFolder}/${filename}` : filename;
  const existing = app.vault.getAbstractFileByPath(savePath);
  if (existing instanceof TFile) {
    await app.vault.modifyBinary(existing, ab);
  } else {
    await app.vault.createBinary(savePath, ab);
  }

  return filename;
}
