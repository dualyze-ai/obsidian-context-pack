import * as fs from 'fs';
import * as path from 'path';
import { formatForNotebookLM } from '../src/formatter';

const VAULT_EN = path.join(__dirname, '../samples/vault');
const VAULT_JP = path.join(__dirname, '../samples/vault-jp');

function readSample(relPath: string): string {
  return fs.readFileSync(path.join(VAULT_EN, relPath), 'utf-8');
}

function readSampleJp(relPath: string): string {
  return fs.readFileSync(path.join(VAULT_JP, relPath), 'utf-8');
}

const defaultOptions = { includeFrontmatterTitle: true, customRules: [] };

describe('formatForNotebookLM - frontmatter', () => {
  test('removes YAML frontmatter block', () => {
    const raw = '---\ntitle: Test\ntags: [foo, bar]\n---\n\nBody content here.';
    const result = formatForNotebookLM(raw, defaultOptions);
    expect(result).not.toContain('---');
    expect(result).not.toContain('tags:');
    expect(result).toContain('Body content here.');
  });

  test('includes frontmatter title when option is true', () => {
    const raw = '---\ntitle: My Title\n---\n\nContent.';
    const result = formatForNotebookLM(raw, { includeFrontmatterTitle: true, customRules: [] });
    expect(result).toContain('My Title');
  });

  test('omits frontmatter title when option is false', () => {
    const raw = '---\ntitle: My Title\n---\n\nContent.';
    const result = formatForNotebookLM(raw, { includeFrontmatterTitle: false, customRules: [] });
    expect(result).not.toContain('My Title');
  });
});

describe('formatForNotebookLM - WikiLinks', () => {
  test('converts [[Link]] to plain text', () => {
    const raw = 'See [[Some Note]] for details.';
    const result = formatForNotebookLM(raw, defaultOptions);
    expect(result).not.toContain('[[');
    expect(result).toContain('Some Note');
  });

  test('uses alias in [[Link|Alias]]', () => {
    const raw = 'See [[Some Note|this note]] for details.';
    const result = formatForNotebookLM(raw, defaultOptions);
    expect(result).toContain('this note');
    expect(result).not.toContain('Some Note');
  });
});

describe('formatForNotebookLM - Obsidian comments', () => {
  test('removes %% comment %% blocks', () => {
    const raw = 'Before. %% This is hidden %% After.';
    const result = formatForNotebookLM(raw, defaultOptions);
    expect(result).not.toContain('This is hidden');
    expect(result).toContain('Before.');
    expect(result).toContain('After.');
  });

  test('removes multiline %% blocks', () => {
    const raw = 'Start\n%% hidden\ncontent\n%%\nEnd';
    const result = formatForNotebookLM(raw, defaultOptions);
    expect(result).not.toContain('hidden');
    expect(result).toContain('Start');
    expect(result).toContain('End');
  });
});

describe('formatForNotebookLM - blank lines', () => {
  test('collapses 3+ blank lines to 2', () => {
    const raw = 'Line 1\n\n\n\nLine 2';
    const result = formatForNotebookLM(raw, defaultOptions);
    expect(result).not.toMatch(/\n{3,}/);
    expect(result).toContain('Line 1');
    expect(result).toContain('Line 2');
  });
});

describe('formatForNotebookLM - real English samples', () => {
  test('processes Blue Ocean Strategy without errors', () => {
    const raw = readSample('books/Business/Blue Ocean Strategy.md');
    const result = formatForNotebookLM(raw, defaultOptions);
    expect(result.length).toBeGreaterThan(0);
    expect(result).not.toMatch(/^---/);
  });

  test('processes all Business books', () => {
    const dir = path.join(VAULT_EN, 'books/Business');
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));
    expect(files.length).toBeGreaterThan(0);
    for (const file of files) {
      const raw = fs.readFileSync(path.join(dir, file), 'utf-8');
      const result = formatForNotebookLM(raw, defaultOptions);
      expect(result).not.toContain('%%');
    }
  });
});

describe('formatForNotebookLM - real Japanese samples', () => {
  test('processes Japanese business book without errors', () => {
    const dir = path.join(VAULT_JP, 'books/ビジネス');
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));
    expect(files.length).toBeGreaterThan(0);
    const raw = fs.readFileSync(path.join(dir, files[0]), 'utf-8');
    const result = formatForNotebookLM(raw, defaultOptions);
    expect(result.length).toBeGreaterThan(0);
    expect(result).not.toMatch(/^---/);
  });

  test('processes all Japanese recipes', () => {
    const dir = path.join(VAULT_JP, 'recipes/和食');
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));
    expect(files.length).toBeGreaterThan(0);
    for (const file of files) {
      const raw = fs.readFileSync(path.join(dir, file), 'utf-8');
      const result = formatForNotebookLM(raw, defaultOptions);
      expect(result).not.toContain('%%');
    }
  });
});
