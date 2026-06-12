// Known AI Brief h2 heading names (without ## prefix)
const BRIEF_HEADINGS_EN = [
  'Executive Insight', 'Executive Summary', 'Key Topics', 'Knowledge Map',
  'Topic Clusters', 'Relationship Map', 'Related Notes', 'Similar Notes',
  'Knowledge Health', 'Open Questions', 'Suggested Prompts', 'Document Structure',
];

const BRIEF_HEADINGS_JA = [
  '全体概観', 'エグゼクティブサマリー', '主要トピック', 'ナレッジマップ',
  'トピッククラスター', '関係マップ', '類似ノート', '関連ノート',
  'ナレッジヘルス', '未解決の課題', '推奨プロンプト', 'ドキュメント構造',
];

// Heading texts that must NOT become wikilinks
const GENERIC_LABELS = new Set([
  'Knowledge Map', 'Executive Summary', 'Topic Clusters', 'Relationship Map',
  'Related Notes', 'Similar Notes', 'Open Questions', 'Suggested Prompts', 'Knowledge Health',
  'ナレッジマップ', 'エグゼクティブサマリー', 'トピッククラスター', '関係マップ',
  '関連ノート', '類似ノート', '未解決の課題', '推奨プロンプト', 'ナレッジヘルス',
]);

// All known heading names as a Set — used for fast cache-based detection
export const AI_BRIEF_HEADING_NAMES = new Set([...BRIEF_HEADINGS_EN, ...BRIEF_HEADINGS_JA]);

export interface TopicCluster {
  name: string;
  noteCount?: number;
  representativeNotes: string[];
  additionalNotes: string[];  // from Mermaid, not already in representativeNotes
}

export interface Relationship {
  left: string;
  right: string;
  score: string;
}

export interface BriefStats {
  totalNotes?: number;
  totalLinks?: number;
  clusterCount: number;
  largestClusters: { name: string; count?: number }[];
}

export interface BriefMocData {
  mode: 'knowledge-base' | 'document-structure';
  clusters: TopicCluster[];
  relationships: Relationship[];
  documentSections: string[];
  language: 'en' | 'ja';
  stats?: BriefStats;
  mermaidDiagram?: string;
}

// Check using heading names from the metadata cache (no file read needed)
export function isAiBriefByHeadings(headings: string[]): boolean {
  return headings.filter(h => AI_BRIEF_HEADING_NAMES.has(h)).length >= 2;
}

// Check using raw file content
export function isAiBrief(content: string): boolean {
  const allHeadings = [...BRIEF_HEADINGS_EN, ...BRIEF_HEADINGS_JA];
  return allHeadings.filter(h => content.includes(`## ${h}`)).length >= 2;
}

function detectLanguage(content: string): 'en' | 'ja' {
  return BRIEF_HEADINGS_JA.filter(h => content.includes(`## ${h}`)).length >= 2 ? 'ja' : 'en';
}

// Extract content between ## Heading and the next ## heading
function extractSection(content: string, heading: string): string {
  const headingLine = `## ${heading}`;
  const start = content.indexOf(headingLine);
  if (start === -1) return '';
  const afterHeading = content.indexOf('\n', start) + 1;
  const nextH2 = content.indexOf('\n## ', afterHeading);
  if (nextH2 === -1) return content.slice(afterHeading).trim();
  return content.slice(afterHeading, nextH2).trim();
}

// Parse Topic Clusters section — returns representative notes and per-cluster note count
function parseTopicClusters(
  content: string,
  language: 'en' | 'ja',
): Array<{ name: string; noteCount?: number; representativeNotes: string[] }> {
  const heading = language === 'ja' ? 'トピッククラスター' : 'Topic Clusters';
  const section = extractSection(content, heading);
  if (!section) return [];

  const result: Array<{ name: string; noteCount?: number; representativeNotes: string[] }> = [];
  const parts = section.split(/\n(?=### )/);

  for (const part of parts) {
    const nameMatch = part.match(/^### (.+)/);
    if (!nameMatch) continue;
    const clusterName = nameMatch[1].trim();

    // Parse note count: **Notes:** N  or  **ノート数：** N
    const countPattern = language === 'ja'
      ? /\*\*ノート数[：:]\*\*\s*(\d+)/
      : /\*\*Notes:\*\*\s*(\d+)/;
    const countMatch = part.match(countPattern);
    const noteCount = countMatch ? parseInt(countMatch[1], 10) : undefined;

    // Parse representative notes
    const repHeader = language === 'ja' ? '**代表ノート：**' : '**Representative Notes:**';
    const repIdx = part.indexOf(repHeader);
    const notes: string[] = [];

    if (repIdx !== -1) {
      const afterRep = part.slice(repIdx + repHeader.length);
      for (const line of afterRep.split('\n')) {
        const noteMatch = line.match(/^- (.+)/);
        if (noteMatch) {
          const name = noteMatch[1].trim();
          if (name && !GENERIC_LABELS.has(name)) notes.push(name);
        } else if (line.startsWith('**') && notes.length > 0) {
          break;
        }
      }
    }

    result.push({ name: clusterName, noteCount, representativeNotes: notes });
  }

  return result;
}

// Parse Mermaid in Knowledge Map — returns all notes per cluster (up to 4 each)
function parseMermaidClusters(
  content: string,
  language: 'en' | 'ja',
): Map<string, string[]> {
  const heading = language === 'ja' ? 'ナレッジマップ' : 'Knowledge Map';
  const section = extractSection(content, heading);
  if (!section) return new Map();

  const mermaidStart = section.indexOf('```');
  if (mermaidStart === -1) return new Map();
  const mermaidEnd = section.indexOf('```', mermaidStart + 3);
  if (mermaidEnd === -1) return new Map();
  const mermaid = section.slice(mermaidStart + 3, mermaidEnd);

  const clusterNodeIds = new Map<string, string>(); // nodeId -> cluster name
  const clusterMap = new Map<string, string[]>();    // cluster name -> notes

  for (const line of mermaid.split('\n')) {
    const clusterDef = line.match(/ROOT\s*-->\s*(C\d+)\["([^"]+)"\]/);
    if (clusterDef) {
      const [, nodeId, name] = clusterDef;
      clusterNodeIds.set(nodeId, name);
      if (!clusterMap.has(name)) clusterMap.set(name, []);
      continue;
    }
    const noteInCluster = line.match(/(C\d+)\s*-->\s*\w+\["([^"]+)"\]/);
    if (noteInCluster) {
      const [, nodeId, noteName] = noteInCluster;
      const clusterName = clusterNodeIds.get(nodeId);
      if (clusterName && !GENERIC_LABELS.has(noteName)) {
        clusterMap.get(clusterName)?.push(noteName);
      }
    }
  }

  return clusterMap;
}

// Extract the raw Mermaid code block from Knowledge Map section
function extractMermaidDiagram(content: string, language: 'en' | 'ja'): string | undefined {
  const heading = language === 'ja' ? 'ナレッジマップ' : 'Knowledge Map';
  const section = extractSection(content, heading);
  if (!section) return undefined;

  const mermaidStart = section.indexOf('```mermaid');
  if (mermaidStart === -1) return undefined;
  const mermaidEnd = section.indexOf('```', mermaidStart + 10);
  if (mermaidEnd === -1) return undefined;

  return section.slice(mermaidStart, mermaidEnd + 3);
}

// Merge Topic Clusters (representative notes) with Mermaid (all notes) into unified clusters
function buildClusters(content: string, language: 'en' | 'ja'): TopicCluster[] {
  const repClusters = parseTopicClusters(content, language);
  const mermaidMap = parseMermaidClusters(content, language);

  if (repClusters.length > 0) {
    return repClusters.map(c => {
      const mermaidNotes = mermaidMap.get(c.name) ?? [];
      const repSet = new Set(c.representativeNotes);
      return {
        name: c.name,
        noteCount: c.noteCount,
        representativeNotes: c.representativeNotes,
        additionalNotes: mermaidNotes.filter(n => !repSet.has(n)),
      };
    });
  }

  // Fallback: Mermaid only (no Topic Clusters section)
  return Array.from(mermaidMap.entries()).map(([name, notes]) => ({
    name,
    noteCount: undefined,
    representativeNotes: notes,
    additionalNotes: [],
  }));
}

function parseRelationships(content: string, language: 'en' | 'ja'): Relationship[] {
  const headings = language === 'ja'
    ? ['関係マップ', '類似ノート', '関連ノート']
    : ['Relationship Map', 'Similar Notes', 'Related Notes'];

  const relationships: Relationship[] = [];

  for (const heading of headings) {
    const section = extractSection(content, heading);
    if (!section) continue;

    // Relationship Map: **Note A** ↔ **Note B**\nScore: 80%
    const mapPattern = /\*\*([^*]+)\*\*\s*↔\s*\*\*([^*]+)\*\*[\s\S]*?Score:\s*(\d+%)/g;
    let match;
    while ((match = mapPattern.exec(section)) !== null) {
      const left = match[1].trim();
      const right = match[2].trim();
      if (!GENERIC_LABELS.has(left) && !GENERIC_LABELS.has(right)) {
        relationships.push({ left, right, score: match[3] });
      }
    }

    // Similar/Related Notes: - **A** ↔ **B** — 63%
    const pairPattern = /^- \*\*([^*]+)\*\*\s*↔\s*\*\*([^*]+)\*\*\s*[—–-]\s*(\d+%)/gm;
    while ((match = pairPattern.exec(section)) !== null) {
      const left = match[1].trim();
      const right = match[2].trim();
      if (!GENERIC_LABELS.has(left) && !GENERIC_LABELS.has(right)) {
        const exists = relationships.some(r => r.left === left && r.right === right);
        if (!exists) relationships.push({ left, right, score: match[3] });
      }
    }

    if (relationships.length > 0) break;
  }

  return relationships;
}

function parseDocumentStructure(content: string, language: 'en' | 'ja'): string[] {
  const heading = language === 'ja' ? 'ドキュメント構造' : 'Document Structure';
  const section = extractSection(content, heading);
  if (!section) return [];

  const sections: string[] = [];
  for (const line of section.split('\n')) {
    const match = line.match(/^- (.+)/);
    if (match) {
      const name = match[1].trim();
      if (name && !GENERIC_LABELS.has(name)) sections.push(name);
    }
  }
  return sections;
}

function parseStats(content: string, language: 'en' | 'ja', clusters: TopicCluster[]): BriefStats {
  let totalNotes: number | undefined;
  let totalLinks: number | undefined;

  // Parse from health table
  const healthSection = extractSection(content, language === 'ja' ? 'ナレッジヘルス' : 'Knowledge Health');
  if (healthSection) {
    const notesPattern = language === 'ja'
      ? /\|\s*ノート数\s*\|\s*(\d+)\s*\|/
      : /\|\s*Total Notes\s*\|\s*(\d+)\s*\|/;
    const linksPattern = language === 'ja'
      ? /\|\s*リンク数\s*\|\s*(\d+)\s*\|/
      : /\|\s*Total Links\s*\|\s*(\d+)\s*\|/;

    const nm = healthSection.match(notesPattern);
    if (nm) totalNotes = parseInt(nm[1], 10);
    const lm = healthSection.match(linksPattern);
    if (lm) totalLinks = parseInt(lm[1], 10);
  }

  // Sort clusters by noteCount desc for largest clusters list
  const sorted = [...clusters].sort((a, b) => {
    const ac = a.noteCount ?? (a.representativeNotes.length + a.additionalNotes.length);
    const bc = b.noteCount ?? (b.representativeNotes.length + b.additionalNotes.length);
    return bc - ac;
  });

  return {
    totalNotes,
    totalLinks,
    clusterCount: clusters.length,
    largestClusters: sorted.slice(0, 3).map(c => ({ name: c.name, count: c.noteCount })),
  };
}

export function parseBriefContent(content: string): BriefMocData | null {
  if (!isAiBrief(content)) return null;

  const language = detectLanguage(content);
  const hasDocStructure = content.includes(language === 'ja' ? '## ドキュメント構造' : '## Document Structure');

  if (hasDocStructure) {
    return {
      mode: 'document-structure',
      clusters: [],
      relationships: [],
      documentSections: parseDocumentStructure(content, language),
      language,
    };
  }

  const clusters = buildClusters(content, language);
  const relationships = parseRelationships(content, language);
  const stats = parseStats(content, language, clusters);
  const mermaidDiagram = extractMermaidDiagram(content, language);

  return {
    mode: 'knowledge-base',
    clusters,
    relationships,
    documentSections: [],
    language,
    stats,
    mermaidDiagram,
  };
}

function titleFromSourceName(sourceName: string): string {
  const base = sourceName.replace(/[-_]AI[-_]Brief$/i, '').trim();
  if (!base) return sourceName;
  return base
    .split(/[-_\s]+/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function buildBriefMocContent(data: BriefMocData, sourceName: string): string {
  const today = window.moment().format('YYYY-MM-DD');
  const isJa = data.language === 'ja';
  const titleDisplay = titleFromSourceName(sourceName);

  const frontmatter = [
    '---',
    `generated: ${today}`,
    'generatedBy: ai-context-pack',
    `source: ${sourceName}`,
    'sourceType: ai-brief',
    `mode: ${data.mode}`,
    '---',
  ].join('\n');

  const lines: string[] = [
    frontmatter,
    '',
    `# ${titleDisplay} AI Brief MOC`,
    '',
    `Generated from: [[${sourceName}]]`,
    '',
  ];

  if (data.mode === 'document-structure') {
    buildDocumentStructureSections(lines, data, sourceName, isJa);
  } else {
    buildKnowledgeBaseSections(lines, data, sourceName, isJa);
  }

  return lines.join('\n');
}

function buildOverviewSection(lines: string[], stats: BriefStats | undefined, isJa: boolean): void {
  if (isJa) {
    lines.push('## 概要', '');
    if (stats) {
      lines.push('**ナレッジベース概要**', '');
      if (stats.totalNotes !== undefined) lines.push(`- ノート：${stats.totalNotes}`);
      if (stats.totalLinks !== undefined) lines.push(`- リンク：${stats.totalLinks}`);
      lines.push(`- トピッククラスター：${stats.clusterCount}`);
      if (stats.largestClusters.length > 0) {
        lines.push('', '**主要クラスター**');
        for (const c of stats.largestClusters) lines.push(`- ${c.name}`);
      }
    } else {
      lines.push('このMOCはAI Briefから生成されました。', '', '分析されたナレッジベースのナビゲーション層として活用してください。');
    }
    lines.push('');
  } else {
    lines.push('## Overview', '');
    if (stats) {
      lines.push('**Knowledge Base Summary**', '');
      if (stats.totalNotes !== undefined) lines.push(`- Notes: ${stats.totalNotes}`);
      if (stats.totalLinks !== undefined) lines.push(`- Links: ${stats.totalLinks}`);
      lines.push(`- Topic Clusters: ${stats.clusterCount}`);
      if (stats.largestClusters.length > 0) {
        lines.push('', '**Largest Clusters**');
        for (const c of stats.largestClusters) lines.push(`- ${c.name}`);
      }
    } else {
      lines.push('This MOC was generated from an AI Brief.', '', 'Use it as a navigation layer for the analyzed knowledge base.');
    }
    lines.push('');
  }
}

// Navigation Paths: one subsection per cluster, all notes as a flat list.
// Grounded entirely in AI Brief data — no inferred Beginner/Advanced classification.
function buildNavigationPathsSection(lines: string[], clusters: TopicCluster[], isJa: boolean): void {
  if (clusters.length === 0) return;

  lines.push(isJa ? '## トピックで探索' : '## Explore by Topic', '');
  for (const cluster of clusters) {
    const allNotes = [...cluster.representativeNotes, ...cluster.additionalNotes];
    if (allNotes.length === 0) continue;
    lines.push(`### ${cluster.name}`, '');
    for (const note of allNotes) lines.push(`- [[${note}]]`);
    lines.push('');
  }
}

function buildDocumentStructureSections(
  lines: string[],
  data: BriefMocData,
  sourceName: string,
  isJa: boolean,
): void {
  if (isJa) {
    lines.push('## 概要', '', 'このMOCはAI BriefのDocument Structure Modeから生成されました。', '', 'ドキュメントのナビゲーション層として活用してください。', '');
    lines.push('## ドキュメント構造', '');
    for (const section of data.documentSections) lines.push(`- [[${section}]]`);
    lines.push('', '## トピックで探索', '');
    lines.push('- 利用可能であれば概要セクションを出発点にしてください。');
    lines.push('- 技術的な詳細と関連するセクションをリンクしてください。');
    lines.push('- 実装前に未解決の課題を確認してください。');
    lines.push('', '## 元のAI Brief', '', `- [[${sourceName}]]`);
  } else {
    lines.push('## Overview', '', 'This MOC was generated from an AI Brief in Document Structure Mode.', '', 'Use it as a navigation layer for the analyzed document.', '');
    lines.push('## Document Structure', '');
    for (const section of data.documentSections) lines.push(`- [[${section}]]`);
    lines.push('', '## Explore by Topic', '');
    lines.push('- Use overview as the entry point.');
    lines.push('- Link technical details to related screen and data sections.');
    lines.push('- Review open questions before implementation.');
    lines.push('', '## Source AI Brief', '', `- [[${sourceName}]]`);
  }
}

function buildKnowledgeBaseSections(
  lines: string[],
  data: BriefMocData,
  sourceName: string,
  isJa: boolean,
): void {
  // ① Overview with stats
  buildOverviewSection(lines, data.stats, isJa);

  // ③ Knowledge Map (Mermaid)
  if (data.mermaidDiagram) {
    lines.push(isJa ? '## ナレッジマップ' : '## Knowledge Map', '', data.mermaidDiagram, '');
  }

  // ① Topic Clusters with representative + additional notes
  if (data.clusters.length > 0) {
    lines.push(isJa ? '## トピッククラスター' : '## Topic Clusters', '');
    for (const cluster of data.clusters) {
      lines.push(`### ${cluster.name}`, '');
      if (cluster.representativeNotes.length > 0) {
        lines.push(isJa ? '**代表ノート**' : '**Representative Notes**', '');
        for (const note of cluster.representativeNotes) lines.push(`- [[${note}]]`);
        lines.push('');
      }
      if (cluster.additionalNotes.length > 0) {
        lines.push(isJa ? '**関連ノート**' : '**Related Notes**', '');
        for (const note of cluster.additionalNotes) lines.push(`- [[${note}]]`);
        lines.push('');
      }
    }
  }

  // Relationships
  if (data.relationships.length > 0) {
    lines.push(isJa ? '## 関係性' : '## Relationships', '');
    for (const rel of data.relationships) {
      lines.push(`- [[${rel.left}]] ↔ [[${rel.right}]] — ${rel.score}`);
    }
    lines.push('');
  }

  // Navigation Paths: cluster-based, no inferred classification
  buildNavigationPathsSection(lines, data.clusters, isJa);

  lines.push(isJa ? '## 元のAI Brief' : '## Source AI Brief', '', `- [[${sourceName}]]`);
}
