import { escapeXml } from './epubSanitizer';

export function markdownToXhtml(markdown: string, imageMap?: Map<string, string>): string {
  const lines = markdown.split('\n');
  const blocks: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Fenced code block
    if (line.startsWith('```')) {
      const lang = line.slice(3).trim();
      i++;
      const codeLines: string[] = [];
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(escapeXml(lines[i]));
        i++;
      }
      i++; // consume closing ```
      if (lang === 'mermaid') {
        blocks.push('<p><em>[Mermaid diagram omitted in EPUB version.]</em></p>');
      } else {
        blocks.push(`<pre><code>${codeLines.join('\n')}</code></pre>`);
      }
      continue;
    }

    // Heading
    const headingMatch = line.match(/^(#{1,6})\s+(.+)/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = inlineMarkdown(headingMatch[2], imageMap);
      blocks.push(`<h${level}>${text}</h${level}>`);
      i++;
      continue;
    }

    // Horizontal rule
    if (/^[-*_]{3,}\s*$/.test(line)) {
      blocks.push('<hr/>');
      i++;
      continue;
    }

    // Table: header row followed by separator row
    if (line.includes('|') && i + 1 < lines.length && isSeparatorRow(lines[i + 1])) {
      const headerCells = parseTableRow(line);
      i += 2; // skip header and separator
      const bodyRows: string[][] = [];
      while (i < lines.length && lines[i].includes('|')) {
        bodyRows.push(parseTableRow(lines[i]));
        i++;
      }
      blocks.push(buildTable(headerCells, bodyRows));
      continue;
    }

    // Blockquote
    if (line.startsWith('>')) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].startsWith('>')) {
        quoteLines.push(lines[i].replace(/^>\s?/, ''));
        i++;
      }
      const inner = quoteLines.map(l => inlineMarkdown(l, imageMap)).join('<br/>');
      blocks.push(`<blockquote><p>${inner}</p></blockquote>`);
      continue;
    }

    // Unordered list
    if (/^\s*[*+-]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[*+-]\s+/.test(lines[i])) {
        items.push(inlineMarkdown(lines[i].replace(/^\s*[*+-]\s+/, ''), imageMap));
        i++;
      }
      blocks.push(`<ul>${items.map(it => `<li>${it}</li>`).join('')}</ul>`);
      continue;
    }

    // Ordered list
    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
        items.push(inlineMarkdown(lines[i].replace(/^\d+\.\s+/, ''), imageMap));
        i++;
      }
      blocks.push(`<ol>${items.map(it => `<li>${it}</li>`).join('')}</ol>`);
      continue;
    }

    // Empty line
    if (line.trim() === '') {
      i++;
      continue;
    }

    // Paragraph: collect non-empty, non-structural lines
    const paraLines: string[] = [];
    while (i < lines.length && !isStructuralLine(lines[i], lines[i + 1])) {
      paraLines.push(lines[i]);
      i++;
    }
    if (paraLines.length > 0) {
      blocks.push(`<p>${paraLines.map(l => inlineMarkdown(l, imageMap)).join(' ')}</p>`);
    }
  }

  return blocks.join('\n');
}

function isStructuralLine(line: string, nextLine?: string): boolean {
  if (line.trim() === '') return true;
  if (line.startsWith('#')) return true;
  if (line.startsWith('```')) return true;
  if (/^[-*_]{3,}\s*$/.test(line)) return true;
  if (/^\s*[*+-]\s+/.test(line)) return true;
  if (/^\d+\.\s+/.test(line)) return true;
  if (line.startsWith('>')) return true;
  if (line.includes('|') && nextLine && isSeparatorRow(nextLine)) return true;
  return false;
}

function isSeparatorRow(line: string): boolean {
  return /^\s*\|?[-:|\s]+\|?\s*$/.test(line) && line.includes('-');
}

function parseTableRow(line: string): string[] {
  const parts = line.split('|').map(c => c.trim());
  if (parts[0] === '') parts.shift();
  if (parts[parts.length - 1] === '') parts.pop();
  return parts;
}

function buildTable(headers: string[], rows: string[][]): string {
  const thead = `<thead><tr>${headers.map(h => `<th>${inlineMarkdown(h)}</th>`).join('')}</tr></thead>`;
  const tbody = `<tbody>${rows.map(row =>
    `<tr>${row.map(c => `<td>${inlineMarkdown(c)}</td>`).join('')}</tr>`
  ).join('')}</tbody>`;
  return `<table>${thead}${tbody}</table>`;
}

function inlineMarkdown(text: string, imageMap?: Map<string, string>): string {
  text = escapeXml(text);
  // Bold + italic
  text = text.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  // Bold
  text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  // Italic *text*
  text = text.replace(/\*([^*\s][^*]*?[^*\s]?)\*/g, '<em>$1</em>');
  // Bold __text__
  text = text.replace(/__(.+?)__/g, '<strong>$1</strong>');
  // Italic _text_ (word-boundary only)
  text = text.replace(/(?<![a-zA-Z0-9])_([^_]+?)_(?![a-zA-Z0-9])/g, '<em>$1</em>');
  // Inline code
  text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
  // Image ![alt](url) — must come before link
  text = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_: string, alt: string, escapedUrl: string) => {
    const url = escapedUrl.replace(/&amp;/g, '&').replace(/&quot;/g, '"');
    const localPath = imageMap?.get(url);
    if (localPath) {
      return `<img src="${localPath}" alt="${alt}"/>`;
    }
    return `<a href="${escapedUrl}">${alt || escapedUrl}</a>`;
  });
  // Markdown link [text](url)
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  return text;
}
