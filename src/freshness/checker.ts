import { App, TFile, getAllTags } from 'obsidian';
import { getDailyNotes, getDailyNotesSettings } from '../daily-notes';
import { type PackRecord, type PackCheckResult, type FreshnessSettings, type FreshnessLevel } from './types';

export function packKey(source: PackRecord['source'], target: PackRecord['target']): string {
  return `${source.type}|${source.query}|${target}`;
}

export function buildPackRecord(
  name: string,
  source: PackRecord['source'],
  target: PackRecord['target'],
  files: TFile[],
): PackRecord {
  return {
    name,
    source,
    target,
    createdAt: Date.now(),
    files: files.map((f) => ({
      path: f.path,
      mtime: f.stat.mtime,
      size: f.stat.size,
    })),
  };
}

async function resolveCurrentFiles(app: App, source: PackRecord['source']): Promise<TFile[]> {
  switch (source.type) {
    case 'folder': {
      const prefix = source.query.endsWith('/') ? source.query : source.query + '/';
      return app.vault.getMarkdownFiles().filter(
        (f) => f.path === source.query || f.path.startsWith(prefix),
      );
    }
    case 'tag': {
      const tag = source.query.startsWith('#') ? source.query : '#' + source.query;
      return app.vault.getMarkdownFiles().filter((f) => {
        const cache = app.metadataCache.getFileCache(f);
        const tags = cache ? getAllTags(cache) : null;
        return tags?.includes(tag) ?? false;
      });
    }
    case 'moc': {
      return resolveMocFiles(app, source.query);
    }
    case 'daily': {
      return resolveDailyFiles(app, source.query);
    }
  }
}

function resolveMocFiles(app: App, mocPath: string): TFile[] {
  const moc = app.vault.getAbstractFileByPath(mocPath);
  if (!(moc instanceof TFile)) return [];
  const cache = app.metadataCache.getFileCache(moc);
  const links = cache?.links?.map((l) => l.link) ?? [];
  const files: TFile[] = [];
  for (const link of links) {
    const linked = app.metadataCache.getFirstLinkpathDest(link, mocPath);
    if (linked instanceof TFile && linked.extension === 'md') {
      files.push(linked);
    }
  }
  return files;
}

async function resolveDailyFiles(app: App, query: string): Promise<TFile[]> {
  const [startStr, endStr] = query.split('..');
  if (!startStr || !endStr) return [];
  const start = new Date(startStr);
  const end = new Date(endStr);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return [];
  // TODO: getDailyNotesSettings is not available synchronously; using autodetect
  const config = await getDailyNotesSettings(app);
  return getDailyNotes(app, config, start, end);
}

export async function checkPack(
  app: App,
  pack: PackRecord,
  settings: FreshnessSettings,
): Promise<PackCheckResult> {
  const current = await resolveCurrentFiles(app, pack.source);
  const currentByPath = new Map(current.map((f) => [f.path, f]));
  const recordedByPath = new Map(pack.files.map((r) => [r.path, r]));

  const unchanged: string[] = [];
  const updated: string[] = [];
  const missing: string[] = [];
  const added: string[] = [];

  for (const rec of pack.files) {
    const file = currentByPath.get(rec.path);
    if (!file) {
      missing.push(rec.path);
      continue;
    }
    const changed = file.stat.mtime > rec.mtime || file.stat.size !== rec.size;
    (changed ? updated : unchanged).push(rec.path);
  }

  for (const f of current) {
    if (!recordedByPath.has(f.path)) added.push(f.path);
  }

  const matchedCount = current.length;
  const staleCount = updated.length + added.length;
  const freshnessScore = matchedCount > 0 ? (matchedCount - staleCount) / matchedCount : 1;

  const staleRatio = 1 - freshnessScore;
  let level: FreshnessLevel = 'fresh';
  if (staleRatio >= settings.staleThreshold) level = 'stale';
  else if (staleRatio > settings.warnThreshold || missing.length > 0) level = 'warn';

  return {
    key: packKey(pack.source, pack.target),
    level,
    freshnessScore,
    matchedCount,
    unchanged,
    updated,
    added,
    missing,
  };
}

export async function checkAllPacks(
  app: App,
  packs: PackRecord[],
  settings: FreshnessSettings,
): Promise<PackCheckResult[]> {
  return Promise.all(packs.map((p) => checkPack(app, p, settings)));
}

/** ファイル/フォルダのリネーム・移動に合わせて PackRecord 群を更新する（破壊的）。変更があれば true を返す。 */
export function applyRenameToRegistry(
  packs: PackRecord[],
  oldPath: string,
  newPath: string,
  isFolder: boolean,
): boolean {
  let changed = false;

  for (const pack of packs) {
    // source.query の更新
    if (isFolder && pack.source.type === 'folder') {
      if (pack.source.query === oldPath) {
        pack.source.query = newPath;
        changed = true;
      } else if (pack.source.query.startsWith(oldPath + '/')) {
        pack.source.query = newPath + pack.source.query.slice(oldPath.length);
        changed = true;
      }
    }
    if (!isFolder && pack.source.type === 'moc' && pack.source.query === oldPath) {
      pack.source.query = newPath;
      changed = true;
    }

    // files[].path の更新
    for (const rec of pack.files) {
      if (rec.path === oldPath) {
        rec.path = newPath;
        changed = true;
      } else if (isFolder && rec.path.startsWith(oldPath + '/')) {
        rec.path = newPath + rec.path.slice(oldPath.length);
        changed = true;
      }
    }
  }

  return changed;
}
