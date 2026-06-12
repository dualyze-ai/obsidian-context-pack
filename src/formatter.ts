export interface ReplacementRule {
  find: string;
  replace: string;
  useRegex: boolean;
  enabled: boolean;
}

export interface FormatOptions {
  includeFrontmatterTitle: boolean;
  customRules: ReplacementRule[];
}

export function formatForNotebookLM(raw: string, options: FormatOptions): string {
  const { fm, body } = parseFrontmatter(raw);

  let result = body;
  result = stripEmbeds(result);
  result = transformMermaidBlocks(result);
  result = resolveWikiLinks(result);
  result = stripObsidianComments(result);
  result = stripInlineTags(result);
  result = collapseBlankLines(result);

  if (options.includeFrontmatterTitle) {
    const header = buildHeader(fm);
    if (header) result = header + '\n\n' + result;
  }

  for (const rule of options.customRules.filter(r => r.enabled)) {
    try {
      const pattern = rule.useRegex
        ? new RegExp(rule.find, 'g')
        : new RegExp(rule.find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      result = result.replace(pattern, rule.replace);
    } catch {
      // skip rules with invalid regex
    }
  }

  return result.trim().replace(/^---+\n+/, '');
}

function parseFrontmatter(raw: string): { fm: Record<string, unknown>; body: string } {
  const match = raw.match(/^---\r?\n(?!\r?\n)([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { fm: {}, body: raw };

  const fm: Record<string, unknown> = {};
  for (const line of match[1].split('\n')) {
    const sep = line.indexOf(':');
    if (sep === -1) continue;
    const key = line.slice(0, sep).trim();
    const val = line.slice(sep + 1).trim();
    fm[key] = val.startsWith('[') ? val.slice(1, -1).split(',').map(s => s.trim()) : val;
  }
  return { fm, body: match[2] };
}

function buildHeader(fm: Record<string, unknown>): string {
  const lines: string[] = [];
  if (typeof fm.title === 'string' && fm.title) lines.push(`# ${fm.title}`);
  const tags = normalizeTags(fm.tags);
  if (tags.length > 0) lines.push(`Tags: ${tags.join(', ')}`);
  return lines.join('\n');
}

function normalizeTags(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.map(String);
  if (typeof raw === 'string') return raw.split(',').map(s => s.trim()).filter(Boolean);
  return [];
}

function stripEmbeds(text: string): string {
  // Strip Obsidian embeds ![[...]] and external markdown images ![alt](url)
  return text
    .replace(/!\[\[.*?\]\]/g, '')
    .replace(/!\[.*?\]\(https?:\/\/[^)]+\)/g, '');
}

function resolveWikiLinks(text: string): string {
  return text.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_: string, target: string, alias: string | undefined) => alias ?? target);
}

function stripObsidianComments(text: string): string {
  return text.replace(/%%[\s\S]*?%%/g, '');
}

function stripInlineTags(text: string): string {
  return text.replace(/(?<!\n)(?<!\S)#[^\s#]+/g, '').replace(/ {2,}/g, ' ');
}

function collapseBlankLines(text: string): string {
  return text.replace(/\n{3,}/g, '\n\n');
}

// Replace Mermaid code blocks with text summaries suitable for AI consumption.
// Knowledge Map Mermaid (ROOT → cluster → note structure) → "## Knowledge Map Summary" list.
// Other Mermaid diagrams → stripped (empty string).
function transformMermaidBlocks(text: string): string {
  return text.replace(/```mermaid\n([\s\S]*?)```/g, (_, mermaidBody: string) => {
    return buildKnowledgeMapSummary(mermaidBody) ?? '';
  });
}

function buildKnowledgeMapSummary(mermaid: string): string | null {
  if (!mermaid.includes('ROOT')) return null;

  const clusterNodeIds = new Map<string, string>(); // nodeId -> cluster name
  const clusterMap = new Map<string, string[]>();    // cluster name -> note names

  for (const line of mermaid.split('\n')) {
    const clusterDef = line.match(/ROOT\s*-->\s*(C\d+)\["([^"]+)"\]/);
    if (clusterDef) {
      const [, nodeId, name] = clusterDef;
      clusterNodeIds.set(nodeId, name);
      if (!clusterMap.has(name)) clusterMap.set(name, []);
      continue;
    }
    const noteDef = line.match(/(C\d+)\s*-->\s*\w+\["([^"]+)"\]/);
    if (noteDef) {
      const [, nodeId, noteName] = noteDef;
      const clusterName = clusterNodeIds.get(nodeId);
      if (clusterName) clusterMap.get(clusterName)?.push(noteName);
    }
  }

  if (clusterMap.size === 0) return null;

  const lines = ['## Knowledge Map Summary', ''];
  for (const [name, notes] of clusterMap) {
    lines.push(`- ${name}: ${notes.join(', ')}`);
  }
  return lines.join('\n');
}
