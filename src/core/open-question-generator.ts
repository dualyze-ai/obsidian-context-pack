import type { NoteModel } from '../models/note-model';
import type { TopicCluster } from '../models/topic-cluster';
import type { KnowledgeHealth } from '../models/health-model';

export class OpenQuestionGenerator {
  generate(notes: NoteModel[], clusters: TopicCluster[], health: KnowledgeHealth): string[] {
    const questions: string[] = [];
    const noteMap = new Map<string, NoteModel>(notes.map(n => [n.title, n]));
    const noteSet = new Set(notes.map(n => n.title));

    // Isolated notes (no links at all)
    if (health.orphanNotes > 0) {
      questions.push(
        `${health.orphanNotes} note${health.orphanNotes > 1 ? 's are' : ' is'} isolated from the main knowledge graph.`
      );
    }

    // Single-note clusters
    const smallClusters = clusters.filter(c => c.notes.length === 1);
    if (smallClusters.length > 0) {
      questions.push(
        `${smallClusters.length} cluster${smallClusters.length > 1 ? 's contain' : ' contains'} only a single note and may need more supporting material.`
      );
    }

    // Which cluster should be primary?
    if (clusters.length > 1) {
      questions.push('Which topic cluster should be treated as the primary focus of this knowledge base?');
    }

    // One cluster dominates
    if (clusters.length > 1 && clusters[0].notes.length / notes.length > 0.5) {
      questions.push(
        `The "${clusters[0].name}" cluster contains over half of all notes. Consider breaking it into sub-topic groupings.`
      );
    }

    // Notes only connected through hub notes (no direct peer links)
    const hubThreshold = Math.max(3, notes.length * 0.15);
    const hubTitles = new Set(notes.filter(n => n.links.length >= hubThreshold).map(n => n.title));

    const peerIsolated = notes.filter(n => {
      if (hubTitles.has(n.title)) return false;
      const peerLinks = n.links.filter(l => noteSet.has(l) && !hubTitles.has(l));
      return peerLinks.length === 0;
    });
    if (peerIsolated.length / notes.length > 0.3) {
      questions.push(
        `${peerIsolated.length} notes are only connected through hub or index notes, lacking direct peer connections.`
      );
    }

    // Clusters with sparse internal connections
    const sparseClusters = clusters.filter(c => {
      if (c.notes.length < 3) return false;
      const clusterSet = new Set(c.notes);
      const totalInternalLinks = c.notes.reduce((sum, title) => {
        const n = noteMap.get(title);
        if (!n) return sum;
        return sum + n.links.filter(l => clusterSet.has(l)).length;
      }, 0);
      return totalInternalLinks / c.notes.length < 0.5;
    });
    if (sparseClusters.length > 0) {
      const names = sparseClusters.map(c => `"${c.name}"`).join(', ');
      questions.push(
        `Cluster${sparseClusters.length > 1 ? 's' : ''} ${names} have few internal connections. Consider linking related notes within the cluster.`
      );
    }

    // Cross-cluster connections missing (excluding hub notes)
    if (clusters.length > 1) {
      const clusterIndex = new Map<string, string>();
      for (const cluster of clusters) {
        for (const title of cluster.notes) clusterIndex.set(title, cluster.id);
      }
      let nonHubCrossLinks = 0;
      for (const note of notes) {
        if (hubTitles.has(note.title)) continue;
        const fromCluster = clusterIndex.get(note.title);
        for (const link of note.links) {
          const toCluster = clusterIndex.get(link);
          if (fromCluster && toCluster && fromCluster !== toCluster) nonHubCrossLinks++;
        }
      }
      if (nonHubCrossLinks === 0) {
        questions.push('No direct cross-cluster links exist between non-hub notes. Consider adding connections between related topics across clusters.');
      }
    }

    // Highly referenced but under-documented
    const underDocumented = notes.filter(n => n.backlinks.length >= 3 && n.wordCount < 100);
    if (underDocumented.length > 0) {
      questions.push(
        `${underDocumented.length} frequently referenced concept${underDocumented.length > 1 ? 's have' : ' has'} limited documentation.`
      );
    }

    // Duplicate candidates
    if (health.duplicateCandidates > 0) {
      questions.push(
        `${health.duplicateCandidates} pair${health.duplicateCandidates > 1 ? 's' : ''} of highly similar notes may be candidates for merging.`
      );
    }

    return questions;
  }
}
