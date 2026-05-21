import { App, TFile } from 'obsidian';
import { formatForNotebookLM, type FormatOptions } from './formatter';

export async function buildContextPack(
  files: TFile[],
  app: App,
  options: FormatOptions,
  meta: { title: string; source: string }
): Promise<string> {
  const today = window.moment().format('YYYY-MM-DD');
  const sections: string[] = [
    `# Context Pack: ${meta.title}`,
    `Generated: ${today}`,
    `Source: ${meta.source}`,
    `Notes: ${files.length}`,
  ];

  for (const file of files) {
    const raw = await app.vault.read(file);
    const body = formatForNotebookLM(raw, options);
    if (!body.trim()) continue;
    sections.push('---', `<!-- source: ${file.path} -->`, `## ${file.basename}`, body);
  }

  sections.push('---');
  return sections.join('\n\n');
}
