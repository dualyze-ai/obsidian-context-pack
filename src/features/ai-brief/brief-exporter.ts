import { App, TFile } from 'obsidian';

export class BriefExporter {
  constructor(private app: App) {}

  async save(content: string, title: string, outputFolder: string, sourceFolder?: string): Promise<TFile> {
    const safe = title.replace(/[/\\:*?"<>|#^[\]]/g, '-').trim();
    const filename = `${safe}-AI-Brief.md`;
    const path = outputFolder ? `${outputFolder}/${filename}` : filename;

    const fmLines = ['---', 'generatedBy: ai-brief-generator'];
    if (sourceFolder) fmLines.push(`sourceFolder: ${sourceFolder}`);
    fmLines.push('---', '');
    const fullContent = fmLines.join('\n') + content;

    const existing = this.app.vault.getAbstractFileByPath(path);
    if (existing instanceof TFile) {
      await this.app.vault.modify(existing, fullContent);
      return existing;
    }
    return this.app.vault.create(path, fullContent);
  }
}
