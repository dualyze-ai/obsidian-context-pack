import type { Graph } from './link-analyzer';
import type { TopicCluster } from '../models/topic-cluster';
import type { NoteModel } from '../models/note-model';

export class ClusterAnalyzer {
  detect(notes: NoteModel[], graph: Graph): TopicCluster[] {
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
      name: this.nameCluster(component, noteMap),
      notes: component,
      score: this.scoreCluster(component, graph),
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

  private nameCluster(notes: string[], noteMap: Map<string, NoteModel>): string {
    const ranked = notes
      .map(title => ({
        title,
        weight: (noteMap.get(title)?.links.length ?? 0) + (noteMap.get(title)?.backlinks.length ?? 0),
      }))
      .sort((a, b) => b.weight - a.weight);
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
