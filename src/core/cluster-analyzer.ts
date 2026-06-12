import type { Graph } from './link-analyzer';
import type { TopicCluster } from '../models/topic-cluster';
import type { NoteModel } from '../models/note-model';

function isMetadataTag(tag: string): boolean {
  return tag.includes(':') || /^\d/.test(tag);
}

function capitalizeLabel(label: string): string {
  return label.split(/(\s+)/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
}

export class ClusterAnalyzer {
  detect(notes: NoteModel[], graph: Graph): TopicCluster[] {
    // Strategy 1: Folder-based clustering (hierarchical vaults)
    const folderGroups = this.groupByFolder(notes);
    if (folderGroups.size > 1) {
      return this.buildFromGroups(folderGroups, graph, notes);
    }

    // Strategy 2: Tag-based clustering
    const tagGroups = this.groupByPrimaryTag(notes);
    if (tagGroups.size > 1) {
      return this.buildFromGroups(tagGroups, graph, notes);
    }

    // Strategy 3: Link connectivity (connected components)
    return this.clusterByLinks(notes, graph);
  }

  // Find the folder depth that yields the best-balanced grouping
  private groupByFolder(notes: NoteModel[]): Map<string, string[]> {
    for (let depth = 1; depth <= 4; depth++) {
      const groups = new Map<string, string[]>();

      for (const note of notes) {
        const parts = note.path.split('/');
        const dir = parts.slice(0, -1); // strip filename
        const key = depth < dir.length ? dir[depth] : dir[dir.length - 1] ?? 'root';
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key)!.push(note.title);
      }

      if (groups.size <= 1) continue;

      const maxSize = Math.max(...Array.from(groups.values()).map(g => g.length));
      if (maxSize / notes.length < 0.70) return groups;
    }

    return new Map();
  }

  // Group by the most discriminating tag per note
  private groupByPrimaryTag(notes: NoteModel[]): Map<string, string[]> {
    const tagFreq = new Map<string, number>();
    for (const note of notes) {
      for (const tag of note.tags) {
        if (isMetadataTag(tag)) continue;
        tagFreq.set(tag, (tagFreq.get(tag) ?? 0) + 1);
      }
    }

    if (tagFreq.size === 0) return new Map();

    // Tags shared by more than half the notes are too generic to discriminate
    const total = notes.length;
    const usableTags = Array.from(tagFreq.entries())
      .filter(([, freq]) => freq < total * 0.5 && freq >= 2)
      .sort((a, b) => b[1] - a[1]);

    if (usableTags.length === 0) return new Map();

    const groups = new Map<string, string[]>();
    const assigned = new Set<string>();

    for (const [tag] of usableTags) {
      const group: string[] = [];
      for (const note of notes) {
        if (!assigned.has(note.title) && note.tags.includes(tag)) {
          group.push(note.title);
          assigned.add(note.title);
        }
      }
      if (group.length > 0) groups.set(tag, group);
    }

    const untagged = notes.filter(n => !assigned.has(n.title)).map(n => n.title);
    if (untagged.length > 0) groups.set('Other', untagged);

    const maxSize = Math.max(...Array.from(groups.values()).map(g => g.length));
    if (groups.size <= 1 || maxSize / total >= 0.70) return new Map();

    return groups;
  }

  private buildFromGroups(
    groups: Map<string, string[]>,
    graph: Graph,
    notes: NoteModel[]
  ): TopicCluster[] {
    const noteMap = new Map<string, NoteModel>(notes.map(n => [n.title, n]));
    const clusters: TopicCluster[] = [];
    let i = 0;

    for (const [label, groupNotes] of groups) {
      clusters.push({
        id: `cluster-${i++}`,
        name: capitalizeLabel(label),
        notes: groupNotes,
        score: this.scoreCluster(groupNotes, graph),
        themes: [],
        representativeNotes: [],
      });
    }

    // Sort by score descending (largest/most connected first)
    return clusters.sort((a, b) => b.notes.length - a.notes.length);
  }

  private clusterByLinks(notes: NoteModel[], graph: Graph): TopicCluster[] {
    const visited = new Set<string>();
    const components: string[][] = [];

    for (const node of graph.nodes) {
      if (!visited.has(node)) {
        const component: string[] = [];
        this.bfs(node, graph, visited, component);
        components.push(component);
      }
    }

    components.sort((a, b) => b.length - a.length);
    const noteMap = new Map<string, NoteModel>(notes.map(n => [n.title, n]));

    return components.map((component, i) => ({
      id: `cluster-${i}`,
      name: this.nameByLinks(component, noteMap),
      notes: component,
      score: this.scoreCluster(component, graph),
      themes: [],
      representativeNotes: [],
    }));
  }

  private bfs(start: string, graph: Graph, visited: Set<string>, result: string[]): void {
    const queue = [start];
    visited.add(start);
    while (queue.length > 0) {
      const node = queue.shift()!;
      result.push(node);
      const neighbors = new Set<string>();
      for (const target of graph.edges.get(node) ?? []) neighbors.add(target);
      for (const [src, targets] of graph.edges) {
        if (targets.has(node)) neighbors.add(src);
      }
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);
        }
      }
    }
  }

  private nameByLinks(notes: string[], noteMap: Map<string, NoteModel>): string {
    const ranked = notes
      .map(t => ({ title: t, w: (noteMap.get(t)?.links.length ?? 0) + (noteMap.get(t)?.backlinks.length ?? 0) }))
      .sort((a, b) => b.w - a.w);
    return ranked[0]?.title ?? notes[0] ?? 'Unnamed';
  }

  private scoreCluster(notes: string[], graph: Graph): number {
    if (notes.length === 0) return 0;
    const nodeSet = new Set(notes);
    let internalEdges = 0;
    for (const node of notes) {
      for (const target of graph.edges.get(node) ?? []) {
        if (nodeSet.has(target)) internalEdges++;
      }
    }
    const maxEdges = notes.length * (notes.length - 1);
    const connectivity = maxEdges > 0 ? internalEdges / maxEdges : 0;
    return Math.round(notes.length * 0.6 + connectivity * 40);
  }
}
