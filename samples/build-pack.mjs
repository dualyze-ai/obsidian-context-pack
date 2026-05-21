import fs from 'fs';
import path from 'path';

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

function buildPack(vault, title, source, files) {
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
    const dir = path.relative(vault, path.dirname(filePath));
    const heading = dir ? `## ${basename}\n📁 ${dir}` : `## ${basename}`;
    sections.push('---', heading, body);
  }

  sections.push('---');
  return sections.join('\n\n');
}

const vaults = [
  {
    vault: 'samples/vault',
    suffix: '',
    categories: [
      { name: 'recipes', title: 'Recipe Collection', source: 'folder:recipes' },
      { name: 'travel',  title: 'Travel Notes',      source: 'folder:travel'  },
      { name: 'books',   title: 'Book Summaries',    source: 'folder:books'   },
    ],
  },
  {
    vault: 'samples/vault-jp',
    suffix: '-jp',
    categories: [
      { name: 'recipes', title: 'レシピ集', source: 'folder:recipes' },
      { name: 'travel',  title: '旅行記録', source: 'folder:travel'  },
      { name: 'books',   title: '読書メモ', source: 'folder:books'   },
    ],
  },
];

for (const { vault, suffix, categories } of vaults) {
  if (!fs.existsSync(vault)) {
    console.log(`⏭  ${vault} が見つかりません。スキップします。`);
    continue;
  }
  for (const { name, title, source } of categories) {
    const dir = path.join(vault, name);
    if (!fs.existsSync(dir)) continue;
    const files = getMarkdownFiles(dir);
    const content = buildPack(vault, title, source, files);
    const outPath = path.join(OUT, `pack-${name}${suffix}.md`);
    fs.writeFileSync(outPath, content, 'utf-8');
    const kb = (Buffer.byteLength(content, 'utf-8') / 1024).toFixed(1);
    console.log(`✅ ${outPath}  (${files.length}件, ${kb}KB)`);
  }
}
