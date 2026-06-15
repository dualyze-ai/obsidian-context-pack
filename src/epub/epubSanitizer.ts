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
  const lines = markdown.replace(/^﻿/, '').split(/\r?\n/);

  while (lines.length > 0 && lines[0].trim() === '') {
    lines.shift();
  }

  if (lines[0]?.trim() === `# ${title}`) {
    lines.shift();
  }

  return lines.join('\n').trimStart();
}

export function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
