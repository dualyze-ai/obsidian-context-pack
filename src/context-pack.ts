import { App, TFile } from 'obsidian';
import { formatForNotebookLM, type FormatOptions } from './formatter';

export async function buildContextPack(
  files: TFile[],
  app: App,
  options: FormatOptions,
  meta: { title: string; source: string },
  onProgress?: (current: number, total: number) => void,
  signal?: AbortSignal
): Promise<string> {
  const today = window.moment().format('YYYY-MM-DD');
  const sections: string[] = [
    `# Context Pack: ${meta.title}`,
    `Generated: ${today}`,
    `Source: ${meta.source}`,
    `Notes: ${files.length}`,
  ];

  for (let i = 0; i < files.length; i++) {
    if (signal?.aborted) throw new DOMException('Cancelled', 'AbortError');
    const file = files[i];
    if (i % 10 === 0) {
      onProgress?.(i + 1, files.length);
      await new Promise(resolve => setTimeout(resolve, 0));
    }
    const raw = await app.vault.read(file);
    const body = formatForNotebookLM(raw, options);
    if (!body.trim()) continue;
    const dir = file.parent?.path;
    const heading = (dir && dir !== '/')
      ? `## ${file.basename}\n📁 ${dir}`
      : `## ${file.basename}`;
    sections.push('---', heading, body);
  }

  sections.push('---');
  return sections.join('\n\n');
}
