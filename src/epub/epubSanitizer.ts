export function stripFrontmatter(markdown: string): string {
  return markdown.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '');
}

export function convertObsidianLinks(text: string): string {
  text = text.replace(/!\[\[([^\]]+)\]\]/g, '[image: $1]');
  text = text.replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, '$2');
  text = text.replace(/\[\[([^\]]+)\]\]/g, '$1');
  return text;
}

export function sanitizeFilename(title: string): string {
  return title.replace(/[/\\:*?"<>|]/g, '-').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'untitled';
}

export function stripTitleH1(markdown: string, title: string): string {
  const lines = markdown.replace(/^\uFEFF/, '').split(/\r?\n/);

  while (lines.length > 0 && lines[0].trim() === '') {
    lines.shift();
  }

  if (lines[0]?.trim() === `# ${title}`) {
    lines.shift();
  }

  return lines.join('\n').trimStart();
}

const EPUB_EXCLUDED_BRIEF_SECTIONS = new Set([
  'Suggested Prompts', '推奨プロンプト',
  'Knowledge Health', 'ナレッジヘルス',
  'Open Questions', '未解決の課題',
]);

export function stripBriefSections(markdown: string): string {
  const parts = markdown.split(/(?=^## )/m);
  return parts.filter(part => {
    const m = part.match(/^## (.+)/);
    if (!m) return true;
    return !EPUB_EXCLUDED_BRIEF_SECTIONS.has(m[1].trim());
  }).join('');
}

export function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
