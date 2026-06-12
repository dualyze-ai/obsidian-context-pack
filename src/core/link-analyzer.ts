import type { NoteModel } from '../models/note-model';

export interface Graph {
  nodes: Set<string>;
  edges: Map<string, Set<string>>;
}

export class LinkAnalyzer {
  buildGraph(notes: NoteModel[]): Graph {
    const nodes = new Set<string>(notes.map(n => n.title));
    const edges = new Map<string, Set<string>>();
    for (const n of notes) edges.set(n.title, new Set());

    const titleIndex = new Map<string, string>();
    for (const n of notes) titleIndex.set(n.title.toLowerCase(), n.title);

    for (const note of notes) {
      for (const link of note.links) {
        const target = this.resolveLink(link, titleIndex);
        if (target && nodes.has(target)) {
          edges.get(note.title)?.add(target);
        }
      }
    }

    return { nodes, edges };
  }

  populateBacklinks(notes: NoteModel[], graph: Graph): void {
    for (const note of notes) {
      const backlinkSet = new Set<string>();
      for (const [src, targets] of graph.edges) {
        if (targets.has(note.title)) backlinkSet.add(src);
      }
      note.backlinks = Array.from(backlinkSet);
    }
  }

  private resolveLink(link: string, titleIndex: Map<string, string>): string | null {
    const base = link.split('#')[0].split('|')[0].trim();
    const basename = base.split('/').pop() ?? base;
    return titleIndex.get(basename.toLowerCase()) ?? null;
  }
}
