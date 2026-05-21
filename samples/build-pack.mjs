import fs from 'fs';
import path from 'path';

const VAULT = 'samples/vault';
const OUT = 'samples/output';
fs.mkdirSync(OUT, { recursive: true });

function getMarkdownFiles(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) results.push(...getMarkdownFiles(full));
    else if (entry.name.endsWith('.md')) results.push(full);
  }
  return results;
}

function stripFrontmatter(content) {
  return content.replace(/^---[\s\S]*?---\n/, '').trim();
}

function buildPack(title, source, files) {
  const today = new Date().toISOString().slice(0, 10);
  const sections = [
    `# Context Pack: ${title}`,
    `Generated: ${today}`,
    `Source: ${source}`,
    `Notes: ${files.length}`,
  ];

  for (const filePath of files) {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const body = stripFrontmatter(raw);
    if (!body.trim()) continue;

    const basename = path.basename(filePath, '.md');
    const dir = path.relative(VAULT, path.dirname(filePath));
    const heading = dir ? `## ${basename}\n📁 ${dir}` : `## ${basename}`;
    sections.push('---', heading, body);
  }

  sections.push('---');
  return sections.join('\n\n');
}

const categories = [
  { name: 'recipes', title: 'レシピ集', source: 'folder:recipes' },
  { name: 'travel',  title: '旅行記録', source: 'folder:travel'  },
  { name: 'books',   title: '読書メモ', source: 'folder:books'   },
];

for (const { name, title, source } of categories) {
  const files = getMarkdownFiles(path.join(VAULT, name));
  const content = buildPack(title, source, files);
  const outPath = path.join(OUT, `pack-${name}.md`);
  fs.writeFileSync(outPath, content, 'utf-8');
  const kb = (Buffer.byteLength(content, 'utf-8') / 1024).toFixed(1);
  console.log(`✅ ${outPath}  (${files.length}件, ${kb}KB)`);
}
