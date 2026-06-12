import { App, TFile } from 'obsidian';
import type { NoteModel } from '../models/note-model';

export class NoteParser {
  constructor(private app: App) {}

  async parse(file: TFile): Promise<NoteModel> {
    const cache = this.app.metadataCache.getFileCache(file);
    let content = '';
    try {
      content = await this.app.vault.cachedRead(file);
    } catch {
      // ignore unreadable files
    }

    const tags: string[] = [];
    for (const ref of cache?.tags ?? []) {
      tags.push(ref.tag.replace(/^#/, ''));
    }
    const fmTags: unknown = cache?.frontmatter?.['tags'];
    if (Array.isArray(fmTags)) {
      for (const tag of fmTags) {
        if (typeof tag === 'string') tags.push(tag.replace(/^#/, ''));
      }
    } else if (typeof fmTags === 'string' && fmTags) {
      for (const tag of fmTags.split(',')) {
        const s = tag.trim().replace(/^#/, '');
        if (s) tags.push(s);
      }
    }

    const headings = (cache?.headings ?? []).map(h => h.heading);
    const links = (cache?.links ?? []).map(l => l.link);
    const wordCount = content.split(/\s+/).filter(Boolean).length;

    return {
      path: file.path,
      title: file.basename,
      tags: [...new Set(tags)],
      headings,
      links,
      backlinks: [],
      content,
      wordCount,
    };
  }

  async parseAll(files: TFile[]): Promise<NoteModel[]> {
    return Promise.all(files.map(f => this.parse(f)));
  }
}
