export interface EpubBookOptions {
  title: string;
  author?: string;
  language: string;
  includeBrief: boolean;
  includeToc: boolean;
  includeSourceNotes: boolean;
  stripFrontmatter: boolean;
  convertObsidianLinks: boolean;
}

export interface EpubChapter {
  id: string;
  title: string;
  markdown: string;
  sourcePath?: string;
}

export interface EpubBookInput {
  options: EpubBookOptions;
  briefMarkdown?: string;
  chapters: EpubChapter[];
}
