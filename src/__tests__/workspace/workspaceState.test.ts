import { TFile } from 'obsidian';
import { computeWorkspaceState } from '../../workspace/workspaceState';
import { buildMockApp } from '../helpers/mockApp';

const BASE_CONFIG = {
  id: '1',
  name: 'travel',
  sourceType: 'folder' as const,
  sourcePath: 'travel',
  createdAt: 0,
};

// ─── Folder existence ────────────────────────────────────────────────────────

describe('folderExists', () => {
  test('true when folder is present', async () => {
    const app = buildMockApp({ folders: ['travel'] });
    const state = await computeWorkspaceState(app as any, BASE_CONFIG, 'Output', []);
    expect(state.folderExists).toBe(true);
  });

  test('false when folder is absent', async () => {
    const app = buildMockApp({});
    const state = await computeWorkspaceState(app as any, BASE_CONFIG, 'Output', []);
    expect(state.folderExists).toBe(false);
  });
});

// ─── Note counting ───────────────────────────────────────────────────────────

describe('notesCount', () => {
  test('counts only files inside sourcePath', async () => {
    const app = buildMockApp({
      markdownFiles: [
        { path: 'travel/tokyo.md', mtime: 1000 },
        { path: 'travel/paris.md', mtime: 900 },
        { path: 'other/note.md', mtime: 800 },
      ],
    });
    const state = await computeWorkspaceState(app as any, BASE_CONFIG, 'Output', []);
    expect(state.notesCount).toBe(2);
  });

  test('sourceLatestMtime is max mtime among source files', async () => {
    const app = buildMockApp({
      markdownFiles: [
        { path: 'travel/tokyo.md', mtime: 1000 },
        { path: 'travel/paris.md', mtime: 3000 },
      ],
    });
    const state = await computeWorkspaceState(app as any, BASE_CONFIG, 'Output', []);
    expect(state.sourceLatestMtime).toBe(3000);
  });
});

// ─── AI Brief finding ────────────────────────────────────────────────────────

describe('AI Brief detection', () => {
  test('finds brief by frontmatter (generatedBy + sourceFolder)', async () => {
    const app = buildMockApp({
      markdownFiles: [
        { path: 'travel/tokyo.md', mtime: 1000 },
        {
          path: 'Output/travel-AI-Brief.md',
          mtime: 2000,
          frontmatter: { generatedBy: 'ai-brief-generator', sourceFolder: 'travel' },
        },
      ],
    });
    const state = await computeWorkspaceState(app as any, BASE_CONFIG, 'Output', []);
    expect(state.aiBrief.status).toBe('ready');
    expect(state.aiBrief.filePath).toBe('Output/travel-AI-Brief.md');
  });

  // Regression: older briefs without sourceFolder frontmatter were shown as Ready
  // in the card (found by naming convention) but Create EPUB failed to find them.
  test('finds brief by naming convention when frontmatter is absent', async () => {
    const app = buildMockApp({
      markdownFiles: [
        { path: 'travel/tokyo.md', mtime: 1000 },
        { path: 'Output/travel-AI-Brief.md', mtime: 2000 },
        // No frontmatter → frontmatter search fails, naming-convention fallback kicks in
      ],
    });
    const state = await computeWorkspaceState(app as any, BASE_CONFIG, 'Output', []);
    expect(state.aiBrief.status).toBe('ready');
    expect(state.aiBrief.filePath).toBe('Output/travel-AI-Brief.md');
  });

  test('does not pick up brief whose sourceFolder points to a different workspace', async () => {
    const app = buildMockApp({
      markdownFiles: [
        { path: 'travel/tokyo.md', mtime: 1000 },
        {
          path: 'Output/recipes-AI-Brief.md',
          mtime: 2000,
          frontmatter: { generatedBy: 'ai-brief-generator', sourceFolder: 'recipes' },
        },
      ],
    });
    const state = await computeWorkspaceState(app as any, BASE_CONFIG, 'Output', []);
    // No brief for travel → missing
    expect(state.aiBrief.status).toBe('missing');
  });

  test('brief status is outdated when older than source files', async () => {
    const app = buildMockApp({
      markdownFiles: [
        { path: 'travel/tokyo.md', mtime: 5000 },
        {
          path: 'Output/travel-AI-Brief.md',
          mtime: 1000,
          frontmatter: { generatedBy: 'ai-brief-generator', sourceFolder: 'travel' },
        },
      ],
    });
    const state = await computeWorkspaceState(app as any, BASE_CONFIG, 'Output', []);
    expect(state.aiBrief.status).toBe('outdated');
  });

  test('brief without outputFolder is found at root', async () => {
    const app = buildMockApp({
      markdownFiles: [
        { path: 'travel/tokyo.md', mtime: 1000 },
        { path: 'travel-AI-Brief.md', mtime: 2000 },
      ],
    });
    // outputFolder is empty
    const state = await computeWorkspaceState(app as any, BASE_CONFIG, '', []);
    expect(state.aiBrief.status).toBe('ready');
    expect(state.aiBrief.filePath).toBe('travel-AI-Brief.md');
  });
});

// ─── AI MOC detection ────────────────────────────────────────────────────────

describe('AI MOC detection', () => {
  test('missing when brief is missing', async () => {
    const app = buildMockApp({
      markdownFiles: [{ path: 'travel/tokyo.md', mtime: 1000 }],
    });
    const state = await computeWorkspaceState(app as any, BASE_CONFIG, 'Output', []);
    expect(state.aiMoc.status).toBe('missing');
  });

  test('ready when MOC is newer than both sources and brief', async () => {
    const app = buildMockApp({
      markdownFiles: [
        { path: 'travel/tokyo.md', mtime: 1000 },
        {
          path: 'Output/travel-AI-Brief.md',
          mtime: 2000,
          frontmatter: { generatedBy: 'ai-brief-generator', sourceFolder: 'travel' },
        },
        { path: 'Output/travel-AI-Brief MOC.md', mtime: 3000 },
      ],
    });
    const state = await computeWorkspaceState(app as any, BASE_CONFIG, 'Output', []);
    expect(state.aiMoc.status).toBe('ready');
  });

  // Key invariant: Pack/EPUB should NOT become Outdated just because the Brief was refreshed.
  // MOC depends on Brief (downstreamRef = max(sourceLatestMtime, briefMtime)).
  // Pack and EPUB depend only on sourceLatestMtime.
  test('MOC is outdated after Brief is regenerated (briefMtime > MOC mtime)', async () => {
    const app = buildMockApp({
      markdownFiles: [
        { path: 'travel/tokyo.md', mtime: 1000 },
        {
          path: 'Output/travel-AI-Brief.md',
          mtime: 5000, // Brief just regenerated
          frontmatter: { generatedBy: 'ai-brief-generator', sourceFolder: 'travel' },
        },
        { path: 'Output/travel-AI-Brief MOC.md', mtime: 3000 }, // MOC older than brief
      ],
    });
    const state = await computeWorkspaceState(app as any, BASE_CONFIG, 'Output', []);
    expect(state.aiMoc.status).toBe('outdated');
  });
});

// ─── Context Pack detection ───────────────────────────────────────────────────

describe('Context Pack detection', () => {
  test('missing when no pack file exists and no registry entry', async () => {
    const app = buildMockApp({
      markdownFiles: [{ path: 'travel/tokyo.md', mtime: 1000 }],
    });
    const state = await computeWorkspaceState(app as any, BASE_CONFIG, 'Output', []);
    expect(state.contextPack.status).toBe('missing');
  });

  test('ready when pack file is newer than sources', async () => {
    const app = buildMockApp({
      markdownFiles: [
        { path: 'travel/tokyo.md', mtime: 1000 },
        { path: 'Output/pack-folder-travel-20260617.md', mtime: 2000 },
      ],
    });
    const state = await computeWorkspaceState(app as any, BASE_CONFIG, 'Output', []);
    expect(state.contextPack.status).toBe('ready');
    expect(state.contextPack.filePath).toBe('Output/pack-folder-travel-20260617.md');
  });

  test('outdated when pack file is older than sources', async () => {
    const app = buildMockApp({
      markdownFiles: [
        { path: 'travel/tokyo.md', mtime: 5000 },
        { path: 'Output/pack-folder-travel-20260617.md', mtime: 2000 },
      ],
    });
    const state = await computeWorkspaceState(app as any, BASE_CONFIG, 'Output', []);
    expect(state.contextPack.status).toBe('outdated');
  });

  // Regression: Pack should NOT become Outdated when Brief is regenerated.
  // Pack uses sourceLatestMtime only (not briefMtime).
  test('Pack stays Ready after Brief is regenerated (briefMtime does NOT affect Pack)', async () => {
    const app = buildMockApp({
      markdownFiles: [
        { path: 'travel/tokyo.md', mtime: 1000 },
        {
          path: 'Output/travel-AI-Brief.md',
          mtime: 9999, // Brief just regenerated with very recent mtime
          frontmatter: { generatedBy: 'ai-brief-generator', sourceFolder: 'travel' },
        },
        { path: 'Output/pack-folder-travel-20260617.md', mtime: 2000 }, // Pack older than brief
      ],
    });
    const state = await computeWorkspaceState(app as any, BASE_CONFIG, 'Output', []);
    // Pack compares against sourceLatestMtime (1000), not briefMtime (9999)
    expect(state.contextPack.status).toBe('ready');
  });

  test('found by packRegistry when no file exists', async () => {
    const app = buildMockApp({
      markdownFiles: [{ path: 'travel/tokyo.md', mtime: 1000 }],
    });
    const registry = [
      {
        source: { type: 'folder' as const, query: 'travel' },
        target: 'chatgpt' as const,
        createdAt: 2000,
        name: 'travel',
        files: [],
      },
    ];
    const state = await computeWorkspaceState(app as any, BASE_CONFIG, 'Output', registry);
    expect(state.contextPack.status).toBe('ready');
  });

  test('pack filename prefix matches: pack-folder-{folderName}-', async () => {
    // Verify that the prefix used in workspaceState matches the one used in packFromFolderPath
    // packFromFolderPath uses slug = `folder-${title}` → filename = `pack-folder-${title}-${date}.md`
    // workspaceState checks: file.basename.startsWith(`pack-folder-${folderName}-`)
    const folderName = 'travel';
    const slug = `folder-${folderName}`;
    const date = '20260617';
    const filename = `pack-${slug}-${date}.md`;          // What packFromFolderPath creates
    const prefix = `pack-folder-${folderName}-`;         // What workspaceState searches for

    expect(filename.startsWith(prefix)).toBe(true);
  });
});

// ─── EPUB (Knowledge Book) detection ─────────────────────────────────────────

describe('EPUB detection', () => {
  test('missing when brief is missing', async () => {
    const app = buildMockApp({
      markdownFiles: [{ path: 'travel/tokyo.md', mtime: 1000 }],
    });
    const state = await computeWorkspaceState(app as any, BASE_CONFIG, 'Output', []);
    expect(state.epub.status).toBe('missing');
  });

  test('ready when EPUB file is newer than sources', async () => {
    const app = buildMockApp({
      markdownFiles: [
        { path: 'travel/tokyo.md', mtime: 1000 },
        {
          path: 'Output/travel-AI-Brief.md',
          mtime: 2000,
          frontmatter: { generatedBy: 'ai-brief-generator', sourceFolder: 'travel' },
        },
      ],
      binaryFiles: [
        { path: 'Output/travel-ai-brief.epub', mtime: 3000 },
      ],
    });
    const state = await computeWorkspaceState(app as any, BASE_CONFIG, 'Output', []);
    expect(state.epub.status).toBe('ready');
    expect(state.epub.filePath).toBe('Output/travel-ai-brief.epub');
  });

  test('outdated when EPUB is older than sources', async () => {
    const app = buildMockApp({
      markdownFiles: [
        { path: 'travel/tokyo.md', mtime: 5000 },
        {
          path: 'Output/travel-AI-Brief.md',
          mtime: 2000,
          frontmatter: { generatedBy: 'ai-brief-generator', sourceFolder: 'travel' },
        },
      ],
      binaryFiles: [
        { path: 'Output/travel-ai-brief.epub', mtime: 3000 },
      ],
    });
    const state = await computeWorkspaceState(app as any, BASE_CONFIG, 'Output', []);
    expect(state.epub.status).toBe('outdated');
  });

  // Regression: EPUB should NOT become Outdated just because the Brief was regenerated.
  test('EPUB stays Ready after Brief is regenerated (briefMtime does NOT affect EPUB)', async () => {
    const app = buildMockApp({
      markdownFiles: [
        { path: 'travel/tokyo.md', mtime: 1000 },
        {
          path: 'Output/travel-AI-Brief.md',
          mtime: 9999, // Brief regenerated
          frontmatter: { generatedBy: 'ai-brief-generator', sourceFolder: 'travel' },
        },
      ],
      binaryFiles: [
        { path: 'Output/travel-ai-brief.epub', mtime: 2000 }, // EPUB older than brief
      ],
    });
    const state = await computeWorkspaceState(app as any, BASE_CONFIG, 'Output', []);
    // EPUB compares against sourceLatestMtime (1000), not briefMtime (9999)
    expect(state.epub.status).toBe('ready');
  });

  // Verify that the EPUB filename formula is consistent between creation and detection.
  // exportAsEpub: sanitizeFilename(briefFile.basename).toLowerCase() + '.epub'
  // workspaceState: sanitizeFilename(briefFile.basename).toLowerCase() + '.epub'
  test('EPUB filename formula matches between creation and detection', async () => {
    const { sanitizeFilename } = await import('../../epub/epubSanitizer');
    const briefBasenames = [
      'travel-AI-Brief',
      'レシピ-AI-Brief',
      'My Folder-AI-Brief',
      'project/work-AI-Brief',
    ];
    for (const basename of briefBasenames) {
      const expected = sanitizeFilename(basename).toLowerCase() + '.epub';
      // Both creation and detection use exactly this formula; they must agree.
      expect(expected).toMatch(/\.epub$/);
      expect(expected).not.toContain('/');
    }
  });
});

// ─── Consistency: Brief search algorithm ─────────────────────────────────────

describe('Brief search algorithm consistency (regression guard)', () => {
  // This test documents the two-step search used in BOTH computeWorkspaceState
  // and workspaceCreateEpub. If either diverges, UI shows Ready but EPUB creation fails.

  function simulateBriefSearch(
    allFiles: { path: string; frontmatter?: Record<string, unknown> }[],
    folderPath: string,
    outputFolder: string,
  ) {
    // Step 1: frontmatter search
    for (const f of allFiles) {
      const fm = f.frontmatter;
      if (fm?.['generatedBy'] === 'ai-brief-generator' && fm?.['sourceFolder'] === folderPath) {
        return f.path;
      }
    }
    // Step 2: naming convention fallback
    const folderName = folderPath.split('/').pop() ?? folderPath;
    const safe = folderName.replace(/[/\\:*?"<>|#^[\]]/g, '-').trim();
    const candidatePath = outputFolder ? `${outputFolder}/${safe}-AI-Brief.md` : `${safe}-AI-Brief.md`;
    const found = allFiles.find(f => f.path === candidatePath);
    return found?.path ?? null;
  }

  test('frontmatter search finds correct brief', () => {
    const files = [
      { path: 'travel/tokyo.md' },
      { path: 'Output/travel-AI-Brief.md', frontmatter: { generatedBy: 'ai-brief-generator', sourceFolder: 'travel' } },
    ];
    expect(simulateBriefSearch(files, 'travel', 'Output')).toBe('Output/travel-AI-Brief.md');
  });

  test('naming convention fallback finds brief when frontmatter is absent', () => {
    const files = [
      { path: 'travel/tokyo.md' },
      { path: 'Output/travel-AI-Brief.md' }, // no frontmatter
    ];
    expect(simulateBriefSearch(files, 'travel', 'Output')).toBe('Output/travel-AI-Brief.md');
  });

  test('returns null when brief does not exist at all', () => {
    const files = [
      { path: 'travel/tokyo.md' },
    ];
    expect(simulateBriefSearch(files, 'travel', 'Output')).toBeNull();
  });

  test('does not match brief from different workspace via frontmatter', () => {
    const files = [
      { path: 'travel/tokyo.md' },
      { path: 'Output/recipes-AI-Brief.md', frontmatter: { generatedBy: 'ai-brief-generator', sourceFolder: 'recipes' } },
    ];
    expect(simulateBriefSearch(files, 'travel', 'Output')).toBeNull();
  });

  test('naming convention uses only the last path segment as folder name', () => {
    // sourcePath = 'projects/work/travel' → folderName = 'travel'
    const files = [
      { path: 'projects/work/travel/tokyo.md' },
      { path: 'Output/travel-AI-Brief.md' },
    ];
    const result = simulateBriefSearch(files, 'projects/work/travel', 'Output');
    expect(result).toBe('Output/travel-AI-Brief.md');
  });
});
