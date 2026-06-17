import {
  sanitizeFilename,
  stripFrontmatter,
  convertObsidianLinks,
  stripBriefSections,
} from '../../epub/epubSanitizer';

describe('sanitizeFilename', () => {
  test('replaces forbidden chars with hyphens and strips trailing hyphens', () => {
    expect(sanitizeFilename('file/name:test?')).toBe('file-name-test');
    expect(sanitizeFilename('file?')).toBe('file');
  });

  test('collapses multiple spaces and hyphens', () => {
    expect(sanitizeFilename('hello   world')).toBe('hello-world');
    expect(sanitizeFilename('a---b')).toBe('a-b');
  });

  test('strips leading and trailing hyphens', () => {
    expect(sanitizeFilename('-hello-')).toBe('hello');
    expect(sanitizeFilename('---')).toBe('untitled');
  });

  test('Japanese characters pass through unchanged', () => {
    expect(sanitizeFilename('レシピ集')).toBe('レシピ集');
    expect(sanitizeFilename('旅行 ガイド')).toBe('旅行-ガイド');
  });

  test('empty string returns untitled', () => {
    expect(sanitizeFilename('')).toBe('untitled');
  });

  test('AI Brief basename produces consistent EPUB filename', () => {
    // This is the exact formula used in both exportAsEpub and workspaceState.ts
    const briefBasename = 'travel-AI-Brief';
    const epubFilename = sanitizeFilename(briefBasename).toLowerCase() + '.epub';
    expect(epubFilename).toBe('travel-ai-brief.epub');

    // Japanese brief
    const jpBriefBasename = 'レシピ-AI-Brief';
    const jpEpubFilename = sanitizeFilename(jpBriefBasename).toLowerCase() + '.epub';
    expect(jpEpubFilename).toBe('レシピ-ai-brief.epub');
  });
});

describe('stripFrontmatter', () => {
  test('removes YAML frontmatter block', () => {
    const md = '---\ntitle: test\n---\n# Content';
    expect(stripFrontmatter(md)).toBe('# Content');
  });

  test('leaves content without frontmatter unchanged', () => {
    const md = '# No frontmatter here';
    expect(stripFrontmatter(md)).toBe(md);
  });

  test('handles CRLF line endings', () => {
    const md = '---\r\ntitle: test\r\n---\r\n# Content';
    expect(stripFrontmatter(md)).toBe('# Content');
  });
});

describe('convertObsidianLinks', () => {
  test('converts plain wikilinks', () => {
    expect(convertObsidianLinks('See [[Tokyo]]')).toBe('See Tokyo');
  });

  test('converts aliased wikilinks to alias text', () => {
    expect(convertObsidianLinks('See [[Tokyo|東京]]')).toBe('See 東京');
  });

  test('converts image embeds', () => {
    expect(convertObsidianLinks('![[photo.png]]')).toBe('[image: photo.png]');
  });

  test('handles multiple links in one string', () => {
    const input = '[[A]] and [[B|Bee]] and ![[img.jpg]]';
    expect(convertObsidianLinks(input)).toBe('A and Bee and [image: img.jpg]');
  });
});

describe('stripBriefSections', () => {
  const md = `## Executive Summary
Content here

## Suggested Prompts
- Prompt 1

## Knowledge Health
Health data

## Topic Clusters
Cluster data
`;

  test('removes Suggested Prompts section', () => {
    const result = stripBriefSections(md);
    expect(result).not.toContain('Suggested Prompts');
    expect(result).not.toContain('Prompt 1');
  });

  test('removes Knowledge Health section', () => {
    const result = stripBriefSections(md);
    expect(result).not.toContain('Knowledge Health');
    expect(result).not.toContain('Health data');
  });

  test('preserves other sections', () => {
    const result = stripBriefSections(md);
    expect(result).toContain('Executive Summary');
    expect(result).toContain('Content here');
    expect(result).toContain('Topic Clusters');
  });
});
