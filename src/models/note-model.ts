export interface NoteModel {
  path: string;
  title: string;
  tags: string[];
  headings: string[];
  links: string[];
  backlinks: string[];
  content: string;
  wordCount: number;
}
