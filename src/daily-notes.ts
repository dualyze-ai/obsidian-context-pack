import { App, TFile, moment, Notice } from 'obsidian';
import { formatForNotebookLM, type FormatOptions } from './formatter';

export interface DailyNotesConfig {
  folder: string;
  format: string;
}

export interface PackOptions {
  excludeTags: string[];
  sortOrder: 'asc' | 'desc';
}

export async function getDailyNotesSettings(app: App): Promise<DailyNotesConfig> {
  const defaults: DailyNotesConfig = { folder: '', format: 'YYYY-MM-DD' };

  // 方法①: internalPlugins API
  try {
    const plugin = (app as any).internalPlugins?.plugins?.['daily-notes'];
    const opts = plugin?.instance?.options ?? plugin?.options;
    if (opts && (opts.folder !== undefined || opts.format !== undefined)) {
      return { folder: opts.folder ?? '', format: opts.format ?? 'YYYY-MM-DD' };
    }
  } catch {}

  // 方法②: .obsidian/daily-notes.json を直接読む
  try {
    const json = await app.vault.adapter.read(`${app.vault.configDir}/daily-notes.json`);
    const config = JSON.parse(json);
    return { folder: config.folder ?? '', format: config.format ?? 'YYYY-MM-DD' };
  } catch {}

  // 方法③: Japanese Calendar プラグイン
  try {
    const json = await app.vault.adapter.read(`${app.vault.configDir}/plugins/japanese-calendar/data.json`);
    const config = JSON.parse(json);
    if (config.dailyNoteFolder !== undefined) {
      return { folder: config.dailyNoteFolder ?? '', format: config.dailyNoteFormat ?? 'YYYY-MM-DD' };
    }
  } catch {}

  // 方法④: Periodic Notes コミュニティプラグイン
  try {
    const pn = (app as any).plugins?.plugins?.['periodic-notes']?.settings?.daily;
    if (pn) return { folder: pn.folder ?? '', format: pn.format ?? 'YYYY-MM-DD' };
  } catch {}

  // 方法⑤: Vaultをスキャンして日付形式ファイルが最も多いフォルダを推定
  return inferDailyNotesFolder(app);
}

function inferDailyNotesFolder(app: App): DailyNotesConfig {
  const FORMAT = 'YYYY-MM-DD';
  const folderCount = new Map<string, number>();

  for (const file of app.vault.getMarkdownFiles()) {
    const m = moment(file.basename, FORMAT, true);
    if (!m.isValid()) continue;
    const dir = file.parent?.path ?? '';
    folderCount.set(dir, (folderCount.get(dir) ?? 0) + 1);
  }

  if (folderCount.size === 0) return { folder: '', format: FORMAT };

  // 最もファイル数が多いフォルダを返す
  let best = '';
  let bestCount = 0;
  for (const [dir, count] of folderCount) {
    if (count > bestCount) { best = dir; bestCount = count; }
  }
  return { folder: best, format: FORMAT };
}

export function parseDateFromFilename(filename: string, format: string): Date | null {
  const m = moment(filename, format, true);
  return m.isValid() ? m.toDate() : null;
}

export function getDailyNotes(app: App, config: DailyNotesConfig, startDate: Date, endDate: Date): TFile[] {
  const allFiles = app.vault.getMarkdownFiles();
  const inFolderFiles = allFiles.filter(f => {
    const dir = f.parent?.path ?? '';
    return config.folder ? dir === config.folder : dir === '' || dir === '/';
  });
  const startStr = moment(startDate).format('YYYY-MM-DD');
  const endStr = moment(endDate).format('YYYY-MM-DD');
  const debugLines: string[] = [`期間: ${startStr} ～ ${endStr}`, `フォルダ: ${config.folder}`, `フォーマット: ${config.format}`, ``];

  const files = inFolderFiles.filter(f => {
    const date = parseDateFromFilename(f.basename, config.format);
    if (!date) {
      debugLines.push(`❌ 解析失敗: ${f.basename}`);
      return false;
    }
    const inRange = date >= startDate && date <= endDate;
    debugLines.push(`${inRange ? '✅' : '⛔'} ${f.basename} → ${moment(date).format('YYYY-MM-DD')}`);
    return inRange;
  });

  app.vault.adapter.write('debug-daily-notes.md', debugLines.join('\n'));

  return files.sort((a, b) => {
    const da = parseDateFromFilename(a.basename, config.format)!.getTime();
    const db = parseDateFromFilename(b.basename, config.format)!.getTime();
    return da - db;
  });
}

export async function buildDailyPack(
  app: App,
  files: TFile[],
  config: DailyNotesConfig,
  options: PackOptions,
  formatOptions: FormatOptions,
  weeklyHeader?: string
): Promise<string> {
  const sorted = options.sortOrder === 'desc' ? [...files].reverse() : [...files];

  const excludeTags = options.excludeTags
    .map(t => t.replace(/^#/, '').trim())
    .filter(Boolean);

  const filtered: TFile[] = [];
  for (const file of sorted) {
    if (excludeTags.length > 0) {
      const cache = app.metadataCache.getFileCache(file);
      const inline = cache?.tags?.map(t => t.tag.replace('#', '')) ?? [];
      const fm = cache?.frontmatter?.tags ?? [];
      const all = [...inline, ...(Array.isArray(fm) ? fm : [fm])];
      if (excludeTags.some(tag => all.includes(tag))) continue;
    }
    filtered.push(file);
  }

  if (filtered.length === 0) return '';

  const asc = options.sortOrder === 'asc' ? filtered : [...filtered].reverse();
  const startStr = moment(parseDateFromFilename(asc[0].basename, config.format)).format('YYYY-MM-DD');
  const endStr = moment(parseDateFromFilename(asc[asc.length - 1].basename, config.format)).format('YYYY-MM-DD');
  const now = moment().format('YYYY-MM-DD HH:mm');

  const sections: string[] = [];

  if (weeklyHeader) {
    sections.push(weeklyHeader);
    sections.push('---');
  }

  sections.push(
    '# Daily Notes Context Pack',
    `期間：${startStr} 〜 ${endStr}`,
    `件数：${filtered.length}件`,
    `生成日時：${now}`
  );

  const dow = ['（日）', '（月）', '（火）', '（水）', '（木）', '（金）', '（土）'];
  for (const file of filtered) {
    const raw = await app.vault.read(file);
    const body = formatForNotebookLM(raw, formatOptions);
    const date = parseDateFromFilename(file.basename, config.format);
    const suffix = date ? dow[date.getDay()] : '';
    sections.push('---', `# ${file.basename}${suffix}`, body || '（内容なし）');
  }

  sections.push('---');
  return sections.join('\n\n');
}

export function getDateRange(preset: string): { start: Date; end: Date } {
  const today = moment().startOf('day');
  switch (preset) {
    case 'week':
      return { start: today.clone().subtract(6, 'days').toDate(), end: today.toDate() };
    case '2weeks':
      return { start: today.clone().subtract(13, 'days').toDate(), end: today.toDate() };
    case 'month':
      return { start: today.clone().subtract(29, 'days').toDate(), end: today.toDate() };
    case 'this-week':
      return { start: today.clone().startOf('isoWeek').toDate(), end: today.toDate() };
    case 'last-week': {
      const mon = today.clone().startOf('isoWeek').subtract(1, 'week');
      return { start: mon.toDate(), end: mon.clone().endOf('isoWeek').toDate() };
    }
    default:
      return { start: today.clone().subtract(6, 'days').toDate(), end: today.toDate() };
  }
}

export function buildWeeklyHeader(startDate: Date, endDate: Date, count: number): string {
  const m = moment(startDate);
  const weekNum = Math.ceil(m.date() / 7);
  const title = `${m.year()}年${m.month() + 1}月第${weekNum}週`;
  const startStr = moment(startDate).format('YYYY-MM-DD（ddd）');
  const endStr = moment(endDate).format('YYYY-MM-DD（ddd）');
  const now = moment().format('YYYY-MM-DD HH:mm');
  return [
    `# 週次サマリー：${title}`,
    `期間：${startStr} 〜 ${endStr}`,
    `Daily Notes数：${count}件`,
    `生成日時：${now}`,
  ].join('\n');
}
