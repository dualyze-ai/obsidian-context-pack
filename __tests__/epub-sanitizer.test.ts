import { stripFrontmatter, convertObsidianLinks, stripBriefSections } from '../src/epub/epubSanitizer';

describe('stripFrontmatter', () => {
  test('removes YAML frontmatter block', () => {
    const input = '---\ntitle: Test\ngeneratedBy: ai-brief-generator\n---\n\n## Topic Clusters\n\nContent';
    expect(stripFrontmatter(input)).not.toContain('---');
    expect(stripFrontmatter(input)).toContain('## Topic Clusters');
  });

  test('returns unchanged when no frontmatter', () => {
    const input = '## Topic Clusters\n\nContent';
    expect(stripFrontmatter(input)).toBe(input);
  });
});

describe('convertObsidianLinks', () => {
  test('converts [[Note]] to Note', () => {
    expect(convertObsidianLinks('See [[My Note]] for details.')).toBe('See My Note for details.');
  });

  test('converts [[Note|Alias]] to Alias', () => {
    expect(convertObsidianLinks('See [[My Note|the note]] here.')).toBe('See the note here.');
  });

  test('converts ![[image.png]] to [image: image.png]', () => {
    expect(convertObsidianLinks('![[photo.png]]')).toBe('[image: photo.png]');
  });
});

describe('stripBriefSections', () => {
  const sampleBrief = [
    '## Executive Summary',
    '',
    'Overview of the collection.',
    '',
    '## Topic Clusters',
    '',
    '### Renaissance',
    '- [[Da Vinci]]',
    '',
    '## Knowledge Health',
    '',
    'Coverage: 80%',
    '',
    '## Open Questions',
    '',
    '- What is the significance?',
    '',
    '## Suggested Prompts',
    '',
    '- Summarize this collection.',
    '',
    '## Knowledge Map',
    '',
    'Mermaid diagram here.',
  ].join('\n');

  test('removes Knowledge Health section', () => {
    const result = stripBriefSections(sampleBrief);
    expect(result).not.toContain('## Knowledge Health');
    expect(result).not.toContain('Coverage: 80%');
  });

  test('removes Open Questions section', () => {
    const result = stripBriefSections(sampleBrief);
    expect(result).not.toContain('## Open Questions');
    expect(result).not.toContain('What is the significance?');
  });

  test('removes Suggested Prompts section', () => {
    const result = stripBriefSections(sampleBrief);
    expect(result).not.toContain('## Suggested Prompts');
    expect(result).not.toContain('Summarize this collection.');
  });

  test('keeps non-excluded sections intact', () => {
    const result = stripBriefSections(sampleBrief);
    expect(result).toContain('## Executive Summary');
    expect(result).toContain('## Topic Clusters');
    expect(result).toContain('## Knowledge Map');
    expect(result).toContain('[[Da Vinci]]');
  });

  test('removes Japanese Knowledge Health section', () => {
    const input = '## トピッククラスター\n\n内容\n\n## ナレッジヘルス\n\n網羅率: 80%\n\n## ナレッジマップ\n\n図';
    const result = stripBriefSections(input);
    expect(result).not.toContain('## ナレッジヘルス');
    expect(result).not.toContain('網羅率: 80%');
    expect(result).toContain('## トピッククラスター');
    expect(result).toContain('## ナレッジマップ');
  });

  test('removes Japanese Open Questions section', () => {
    const input = '## 概要\n\nText\n\n## 未解決の課題\n\n- 課題1\n\n## トピッククラスター\n\n内容';
    const result = stripBriefSections(input);
    expect(result).not.toContain('## 未解決の課題');
    expect(result).not.toContain('課題1');
    expect(result).toContain('## トピッククラスター');
  });

  test('removes Japanese Suggested Prompts section', () => {
    const input = '## トピッククラスター\n\n内容\n\n## 推奨プロンプト\n\n- AIに聞いてみよう\n';
    const result = stripBriefSections(input);
    expect(result).not.toContain('## 推奨プロンプト');
    expect(result).not.toContain('AIに聞いてみよう');
    expect(result).toContain('## トピッククラスター');
  });

  test('returns unchanged when no excluded sections present', () => {
    const input = '## Executive Summary\n\nOverview.\n\n## Topic Clusters\n\n### Art\n- [[Painting]]\n';
    expect(stripBriefSections(input)).toBe(input);
  });
});
