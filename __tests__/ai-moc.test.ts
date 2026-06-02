import { TFile } from 'obsidian';
import { buildMocContent, collectLinkedNotes, type AiMocConfig, type AiMocResult } from '../src/ai-moc';

function makeFile(basename: string, path?: string): TFile {
  const f = new TFile();
  f.basename = basename;
  f.path = path ?? `${basename}.md`;
  f.extension = 'md';
  return f;
}

beforeAll(() => {
  (global as any).window = { moment: () => ({ format: () => '2026-06-02' }) };
});

describe('buildMocContent', () => {
  const root = makeFile('MCP');

  const baseConfig: AiMocConfig = {
    rootFile: root,
    scope: 'related',
    includeBacklinksInMoc: true,
    includeBacklinksInPack: false,
    generateContextPack: false,
  };

  test('frontmatter contains required fields', () => {
    const result: AiMocResult = { root, nodes: [], backlinks: [] };
    const output = buildMocContent(result, baseConfig);
    expect(output).toContain('generatedBy: ai-context-pack');
    expect(output).toContain('generated: 2026-06-02');
    expect(output).toContain('root: MCP');
    expect(output).toContain('scope: related');
    expect(output).toContain('includeBacklinks: true');
  });

  test('outputs root as wikilink heading', () => {
    const result: AiMocResult = { root, nodes: [], backlinks: [] };
    const output = buildMocContent(result, baseConfig);
    expect(output).toContain('# [[MCP]]');
  });

  test('empty result outputs no-content message', () => {
    const result: AiMocResult = { root, nodes: [], backlinks: [] };
    const output = buildMocContent(result, baseConfig);
    expect(output).toContain('_No linked notes found._');
    expect(output).not.toContain('## Core Concepts');
    expect(output).not.toContain('## Related Notes');
    expect(output).not.toContain('## Referenced By');
  });

  test('depth=1 nodes appear in Core Concepts', () => {
    const result: AiMocResult = {
      root,
      nodes: [
        { file: makeFile('MCP Overview'), depth: 1 },
        { file: makeFile('MCP Architecture'), depth: 1 },
      ],
      backlinks: [],
    };
    const output = buildMocContent(result, baseConfig);
    expect(output).toContain('## Core Concepts');
    expect(output).toContain('- [[MCP Overview]]');
    expect(output).toContain('- [[MCP Architecture]]');
    expect(output).not.toContain('## Related Notes');
  });

  test('depth=2 nodes appear in Related Notes', () => {
    const result: AiMocResult = {
      root,
      nodes: [
        { file: makeFile('MCP Overview'), depth: 1 },
        { file: makeFile('Claude Integration'), depth: 2 },
      ],
      backlinks: [],
    };
    const output = buildMocContent(result, baseConfig);
    expect(output).toContain('## Core Concepts');
    expect(output).toContain('## Related Notes');
    expect(output).toContain('- [[Claude Integration]]');
  });

  test('Related Notes omitted when scope is direct', () => {
    const result: AiMocResult = {
      root,
      nodes: [
        { file: makeFile('MCP Overview'), depth: 1 },
        { file: makeFile('Claude Integration'), depth: 2 },
      ],
      backlinks: [],
    };
    const config = { ...baseConfig, scope: 'direct' as const };
    const output = buildMocContent(result, config);
    expect(output).toContain('## Core Concepts');
    expect(output).not.toContain('## Related Notes');
    expect(output).not.toContain('- [[Claude Integration]]');
  });

  test('backlinks appear in Referenced By when includeBacklinksInMoc=true', () => {
    const result: AiMocResult = {
      root,
      nodes: [],
      backlinks: [makeFile('AI Tools')],
    };
    const output = buildMocContent(result, baseConfig);
    expect(output).toContain('## Referenced By');
    expect(output).toContain('- [[AI Tools]]');
  });

  test('Referenced By omitted when includeBacklinksInMoc=false', () => {
    const result: AiMocResult = {
      root,
      nodes: [],
      backlinks: [makeFile('AI Tools')],
    };
    const config = { ...baseConfig, includeBacklinksInMoc: false };
    const output = buildMocContent(result, config);
    expect(output).not.toContain('## Referenced By');
  });
});

describe('collectLinkedNotes', () => {
  function makeApp(graph: Record<string, string[]>, allFiles: TFile[]): any {
    const fileByPath: Record<string, TFile> = {};
    for (const f of allFiles) fileByPath[f.path] = f;

    return {
      metadataCache: {
        getFileCache: (file: TFile) => {
          const links = (graph[file.path] ?? []).map(link => ({ link }));
          return { links };
        },
        getFirstLinkpathDest: (link: string, _sourcePath: string) => {
          return allFiles.find(f => f.basename === link) ?? null;
        },
      },
      vault: {
        getMarkdownFiles: () => allFiles,
      },
    };
  }

  test('direct scope collects only depth=1 links', async () => {
    const root = makeFile('MCP');
    const overview = makeFile('MCP Overview');
    const integration = makeFile('Claude Integration');

    const graph = {
      'MCP.md': ['MCP Overview'],
      'MCP Overview.md': ['Claude Integration'],
    };
    const app = makeApp(graph, [root, overview, integration]);

    const result = await collectLinkedNotes(app, root, 'direct');
    expect(result.nodes).toHaveLength(1);
    expect(result.nodes[0].file.basename).toBe('MCP Overview');
    expect(result.nodes[0].depth).toBe(1);
  });

  test('related scope collects depth=1 and depth=2 links', async () => {
    const root = makeFile('MCP');
    const overview = makeFile('MCP Overview');
    const integration = makeFile('Claude Integration');

    const graph = {
      'MCP.md': ['MCP Overview'],
      'MCP Overview.md': ['Claude Integration'],
    };
    const app = makeApp(graph, [root, overview, integration]);

    const result = await collectLinkedNotes(app, root, 'related');
    expect(result.nodes).toHaveLength(2);
    const depths = result.nodes.map(n => n.depth).sort();
    expect(depths).toEqual([1, 2]);
  });

  test('does not explore beyond maxDepth=2', async () => {
    const root = makeFile('A');
    const b = makeFile('B');
    const c = makeFile('C');
    const d = makeFile('D');

    const graph = {
      'A.md': ['B'],
      'B.md': ['C'],
      'C.md': ['D'],
    };
    const app = makeApp(graph, [root, b, c, d]);

    const result = await collectLinkedNotes(app, root, 'related');
    const basenames = result.nodes.map(n => n.file.basename);
    expect(basenames).toContain('B');
    expect(basenames).toContain('C');
    expect(basenames).not.toContain('D');
  });

  test('handles circular references without infinite loop', async () => {
    const a = makeFile('A');
    const b = makeFile('B');

    const graph = {
      'A.md': ['B'],
      'B.md': ['A'],
    };
    const app = makeApp(graph, [a, b]);

    const result = await collectLinkedNotes(app, a, 'related');
    expect(result.nodes).toHaveLength(1);
    expect(result.nodes[0].file.basename).toBe('B');
  });

  test('root is always included in AiMocResult', async () => {
    const root = makeFile('MCP');
    const overview = makeFile('MCP Overview');

    const graph = { 'MCP.md': ['MCP Overview'] };
    const app = makeApp(graph, [root, overview]);

    const result = await collectLinkedNotes(app, root, 'direct');
    expect(result.root.basename).toBe('MCP');
  });

  test('collects backlinks', async () => {
    const root = makeFile('MCP');
    const aiTools = makeFile('AI Tools');

    const graph = {
      'MCP.md': [],
      'AI Tools.md': ['MCP'],
    };
    const app = makeApp(graph, [root, aiTools]);

    const result = await collectLinkedNotes(app, root, 'direct');
    expect(result.backlinks).toHaveLength(1);
    expect(result.backlinks[0].basename).toBe('AI Tools');
  });
});
