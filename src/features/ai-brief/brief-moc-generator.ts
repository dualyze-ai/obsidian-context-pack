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
  representativeNotes: string[];
}

export interface Relationship {
  left: string;
  right: string;
  score: string;
}

export interface BriefMocData {
  mode: 'knowledge-base' | 'document-structure';
  clusters: TopicCluster[];
  relationships: Relationship[];
  documentSections: string[];
  language: 'en' | 'ja';
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

function parseTopicClusters(content: string, language: 'en' | 'ja'): TopicCluster[] {
  const heading = language === 'ja' ? 'トピッククラスター' : 'Topic Clusters';
  const section = extractSection(content, heading);
  if (!section) return [];

  const clusters: TopicCluster[] = [];
  const parts = section.split(/\n(?=### )/);

  for (const part of parts) {
    const nameMatch = part.match(/^### (.+)/);
    if (!nameMatch) continue;
    const clusterName = nameMatch[1].trim();

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

    clusters.push({ name: clusterName, representativeNotes: notes });
  }

  return clusters;
}

function parseMermaidClusters(content: string, language: 'en' | 'ja'): TopicCluster[] {
  const heading = language === 'ja' ? 'ナレッジマップ' : 'Knowledge Map';
  const section = extractSection(content, heading);
  if (!section) return [];

  const mermaidStart = section.indexOf('```');
  if (mermaidStart === -1) return [];
  const mermaidEnd = section.indexOf('```', mermaidStart + 3);
  if (mermaidEnd === -1) return [];
  const mermaid = section.slice(mermaidStart + 3, mermaidEnd);

  const clusterNodeIds = new Map<string, string>(); // nodeId -> cluster name
  const clusterMap = new Map<string, string[]>();    // cluster name -> notes

  for (const line of mermaid.split('\n')) {
    // Cluster: ROOT --> C0["Italy"]
    const clusterDef = line.match(/ROOT\s*-->\s*(C\d+)\["([^"]+)"\]/);
    if (clusterDef) {
      const [, nodeId, name] = clusterDef;
      clusterNodeIds.set(nodeId, name);
      if (!clusterMap.has(name)) clusterMap.set(name, []);
      continue;
    }
    // Note under cluster: C0 --> N0x0["Renaissance"]
    const noteInCluster = line.match(/(C\d+)\s*-->\s*\w+\["([^"]+)"\]/);
    if (noteInCluster) {
      const [, nodeId, noteName] = noteInCluster;
      const clusterName = clusterNodeIds.get(nodeId);
      if (clusterName && !GENERIC_LABELS.has(noteName)) {
        clusterMap.get(clusterName)?.push(noteName);
      }
    }
  }

  return Array.from(clusterMap.entries()).map(([name, notes]) => ({
    name,
    representativeNotes: notes,
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

    // Relationship Map format: **Note A** ↔ **Note B**\nScore: 80%
    const mapPattern = /\*\*([^*]+)\*\*\s*↔\s*\*\*([^*]+)\*\*[\s\S]*?Score:\s*(\d+%)/g;
    let match;
    while ((match = mapPattern.exec(section)) !== null) {
      const left = match[1].trim();
      const right = match[2].trim();
      if (!GENERIC_LABELS.has(left) && !GENERIC_LABELS.has(right)) {
        relationships.push({ left, right, score: match[3] });
      }
    }

    // Similar/Related Notes format: - **A** ↔ **B** — 63%
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

  let clusters = parseTopicClusters(content, language);
  if (clusters.length === 0) clusters = parseMermaidClusters(content, language);

  return {
    mode: 'knowledge-base',
    clusters,
    relationships: parseRelationships(content, language),
    documentSections: [],
    language,
  };
}

function titleFromSourceName(sourceName: string): string {
  // Strip -AI-Brief or _AI_Brief suffix (case-insensitive)
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
    lines.push('', '## 推奨ナビゲーション', '');
    lines.push('- 利用可能であれば概要セクションを出発点にしてください。');
    lines.push('- 技術的な詳細と関連するセクションをリンクしてください。');
    lines.push('- 実装前に未解決の課題を確認してください。');
    lines.push('', '## 元のAI Brief', '', `- [[${sourceName}]]`);
  } else {
    lines.push('## Overview', '', 'This MOC was generated from an AI Brief in Document Structure Mode.', '', 'Use it as a navigation layer for the analyzed document.', '');
    lines.push('## Document Structure', '');
    for (const section of data.documentSections) lines.push(`- [[${section}]]`);
    lines.push('', '## Suggested Navigation', '');
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
  if (isJa) {
    lines.push('## 概要', '', 'このMOCはAI Briefから生成されました。', '', '分析されたナレッジベースのナビゲーション層として活用してください。', '');
    if (data.clusters.length > 0) {
      lines.push('## トピッククラスター', '');
      for (const cluster of data.clusters) {
        lines.push(`### ${cluster.name}`, '');
        for (const note of cluster.representativeNotes) lines.push(`- [[${note}]]`);
        lines.push('');
      }
    }
    if (data.relationships.length > 0) {
      lines.push('## 関係性', '');
      for (const rel of data.relationships) lines.push(`- [[${rel.left}]] ↔ [[${rel.right}]] — ${rel.score}`);
      lines.push('');
    }
    lines.push('## 推奨ナビゲーション', '');
    lines.push('- 最も大きい、または中心的なクラスターから始めてください。');
    lines.push('- 強く関連するノート同士を確認してください。');
    lines.push('- 必要に応じてクラスター間リンクを追加してください。');
    lines.push('', '## 元のAI Brief', '', `- [[${sourceName}]]`);
  } else {
    lines.push('## Overview', '', 'This MOC was generated from an AI Brief.', '', 'Use it as a navigation layer for the analyzed knowledge base.', '');
    if (data.clusters.length > 0) {
      lines.push('## Topic Clusters', '');
      for (const cluster of data.clusters) {
        lines.push(`### ${cluster.name}`, '');
        for (const note of cluster.representativeNotes) lines.push(`- [[${note}]]`);
        lines.push('');
      }
    }
    if (data.relationships.length > 0) {
      lines.push('## Relationships', '');
      for (const rel of data.relationships) lines.push(`- [[${rel.left}]] ↔ [[${rel.right}]] — ${rel.score}`);
      lines.push('');
    }
    lines.push('## Suggested Navigation', '');
    lines.push('- Start with the largest or most central cluster.');
    lines.push('- Review relationships between strongly connected notes.');
    lines.push('- Add cross-cluster links where useful.');
    lines.push('', '## Source AI Brief', '', `- [[${sourceName}]]`);
  }
}
