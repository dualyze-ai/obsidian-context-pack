import { TFile } from 'obsidian';
import { checkPack, packKey, buildPackRecord } from '../src/freshness/checker';
import type { PackRecord, FreshnessSettings } from '../src/freshness/types';

const DEFAULT_SETTINGS: FreshnessSettings = { warnThreshold: 0.01, staleThreshold: 0.20 };

function makeFile(path: string, mtime: number, size: number): TFile {
  const f = new TFile();
  f.path = path;
  f.basename = path.split('/').pop()?.replace('.md', '') ?? path;
  f.stat = { mtime, ctime: 0, size };
  return f;
}

function makeApp(files: TFile[], tagMap: Record<string, string[]> = {}): import('obsidian').App {
  return {
    vault: {
      getMarkdownFiles: () => files,
      getAbstractFileByPath: (path: string) => files.find((f) => f.path === path) ?? null,
    },
    metadataCache: {
      getFileCache: (file: TFile) => {
        const tags = tagMap[file.path];
        if (!tags) return null;
        return { tags: tags.map((tag) => ({ tag })) };
      },
      getFirstLinkpathDest: () => null,
    },
  } as unknown as import('obsidian').App;
}

function makePack(files: TFile[], sourceType: PackRecord['source']['type'] = 'folder', query = 'Notes'): PackRecord {
  return buildPackRecord('Test Pack', { type: sourceType, query }, 'claude', files);
}

describe('packKey', () => {
  test('generates deterministic key', () => {
    const key = packKey({ type: 'folder', query: 'Projects/Test' }, 'claude');
    expect(key).toBe('folder|Projects/Test|claude');
  });
});

describe('buildPackRecord', () => {
  test('snapshots file stats', () => {
    const files = [makeFile('Notes/a.md', 1000, 500)];
    const record = buildPackRecord('MyPack', { type: 'folder', query: 'Notes' }, 'chatgpt', files);
    expect(record.files).toHaveLength(1);
    expect(record.files[0]).toEqual({ path: 'Notes/a.md', mtime: 1000, size: 500 });
    expect(record.target).toBe('chatgpt');
  });
});

describe('checkPack — folder source', () => {
  test('all unchanged → fresh, score 1', async () => {
    const files = [
      makeFile('Notes/a.md', 1000, 100),
      makeFile('Notes/b.md', 2000, 200),
    ];
    const pack = makePack(files);
    const app = makeApp(files);
    const result = await checkPack(app, pack, DEFAULT_SETTINGS);

    expect(result.level).toBe('fresh');
    expect(result.freshnessScore).toBe(1);
    expect(result.unchanged).toHaveLength(2);
    expect(result.updated).toHaveLength(0);
    expect(result.added).toHaveLength(0);
    expect(result.missing).toHaveLength(0);
  });

  test('mtime advanced → file in updated', async () => {
    const original = makeFile('Notes/a.md', 1000, 100);
    const pack = makePack([original]);

    const modified = makeFile('Notes/a.md', 2000, 100); // mtime changed
    const app = makeApp([modified]);

    const result = await checkPack(app, pack, DEFAULT_SETTINGS);
    expect(result.updated).toContain('Notes/a.md');
    expect(result.unchanged).toHaveLength(0);
  });

  test('size changed with same mtime → file in updated', async () => {
    const original = makeFile('Notes/a.md', 1000, 100);
    const pack = makePack([original]);

    const modified = makeFile('Notes/a.md', 1000, 999); // size changed
    const app = makeApp([modified]);

    const result = await checkPack(app, pack, DEFAULT_SETTINGS);
    expect(result.updated).toContain('Notes/a.md');
  });

  test('new file in folder → added', async () => {
    const original = makeFile('Notes/a.md', 1000, 100);
    const pack = makePack([original]);

    const newFile = makeFile('Notes/b.md', 3000, 50);
    const app = makeApp([original, newFile]); // b.md is new

    const result = await checkPack(app, pack, DEFAULT_SETTINGS);
    expect(result.added).toContain('Notes/b.md');
    expect(result.matchedCount).toBe(2);
  });

  test('recorded file deleted → missing', async () => {
    const file = makeFile('Notes/a.md', 1000, 100);
    const pack = makePack([file]);

    const app = makeApp([]); // file no longer exists

    const result = await checkPack(app, pack, DEFAULT_SETTINGS);
    expect(result.missing).toContain('Notes/a.md');
    expect(result.level).not.toBe('fresh');
  });

  test('matchedCount 0 → no division by zero, score 1', async () => {
    const pack = makePack([]);
    const app = makeApp([]);
    const result = await checkPack(app, pack, DEFAULT_SETTINGS);
    expect(result.freshnessScore).toBe(1);
  });

  test('stale ratio above threshold → stale level', async () => {
    const files = Array.from({ length: 5 }, (_, i) => makeFile(`Notes/${i}.md`, 1000, 100));
    const pack = makePack(files);

    // Advance mtime of all 5 files → stale ratio = 100% ≥ 20%
    const updated = files.map((f) => makeFile(f.path, 9999, f.stat.size));
    const app = makeApp(updated);

    const result = await checkPack(app, pack, DEFAULT_SETTINGS);
    expect(result.level).toBe('stale');
  });

  test('only missing files → warn level (missing not in score)', async () => {
    const file = makeFile('Notes/a.md', 1000, 100);
    const pack = makePack([file]);
    const app = makeApp([]); // file missing

    const result = await checkPack(app, pack, DEFAULT_SETTINGS);
    // stale ratio = 0 (missing excluded from score), but missing.length > 0 → warn
    expect(result.level).toBe('warn');
    expect(result.freshnessScore).toBe(1);
  });
});

describe('checkPack — tag source', () => {
  test('tag files correctly resolved and tracked', async () => {
    const file = makeFile('Notes/tagged.md', 1000, 100);
    const pack = buildPackRecord('Tagged', { type: 'tag', query: 'aws' }, 'chatgpt', [file]);

    // Current vault: same file with unchanged stats, tagged with #aws
    const app = makeApp([file], { 'Notes/tagged.md': ['#aws'] });

    const result = await checkPack(app, pack, DEFAULT_SETTINGS);
    expect(result.level).toBe('fresh');
    expect(result.unchanged).toContain('Notes/tagged.md');
  });
});
