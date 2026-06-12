import type { NoteModel } from '../models/note-model';
import type { TopicCluster } from '../models/topic-cluster';
import type { KnowledgeHealth } from '../models/health-model';

export class OpenQuestionGenerator {
  generate(notes: NoteModel[], clusters: TopicCluster[], health: KnowledgeHealth): string[] {
    const questions: string[] = [];
    const noteMap = new Map<string, NoteModel>(notes.map(n => [n.title, n]));

    // Isolated notes
    if (health.orphanNotes > 0) {
      questions.push(
        `${health.orphanNotes} note${health.orphanNotes > 1 ? 's are' : ' is'} isolated from the main knowledge graph.`
      );
    }

    // Single-note clusters
    const smallClusters = clusters.filter(c => c.notes.length === 1);
    if (smallClusters.length > 0) {
      questions.push(
        `${smallClusters.length} topic cluster${smallClusters.length > 1 ? 's lack' : ' lacks'} supporting material (single-note clusters).`
      );
    }

    // Duplicate candidates
    if (health.duplicateCandidates > 0) {
      questions.push(
        `${health.duplicateCandidates} pair${health.duplicateCandidates > 1 ? 's' : ''} of highly similar notes may be candidates for merging.`
      );
    }

    // Highly referenced but under-documented
    const underDocumented = notes.filter(n => n.backlinks.length >= 3 && n.wordCount < 100);
    if (underDocumented.length > 0) {
      questions.push(
        `${underDocumented.length} frequently referenced concept${underDocumented.length > 1 ? 's have' : ' has'} limited documentation.`
      );
    }

    // Low connectivity overall
    if (health.connectivityScore < 30) {
      questions.push(
        'The overall link density is low. Adding more connections between notes could improve knowledge navigability.'
      );
    }

    // No cross-cluster connections
    if (clusters.length > 1) {
      const clusterIndex = new Map<string, string>();
      for (const cluster of clusters) {
        for (const title of cluster.notes) clusterIndex.set(title, cluster.id);
      }

      let crossLinks = 0;
      for (const note of notes) {
        const fromCluster = clusterIndex.get(note.title);
        for (const link of note.links) {
          const toCluster = clusterIndex.get(link);
          if (fromCluster && toCluster && fromCluster !== toCluster) crossLinks++;
        }
      }

      if (crossLinks === 0) {
        questions.push(
          'The topic clusters have no connecting links between them. Consider adding cross-cluster references.'
        );
      }
    }

    // Clusters missing a hub or summary note
    if (clusters.length > 1) {
      const clustersWithoutHub = clusters.filter(c => {
        if (c.notes.length < 3) return false;
        return !c.notes.some(title => (noteMap.get(title)?.backlinks.length ?? 0) >= 2);
      });
      if (clustersWithoutHub.length > 0) {
        questions.push(
          `${clustersWithoutHub.length} cluster${clustersWithoutHub.length > 1 ? 's lack' : ' lacks'} a hub or index note.`
        );
      }
    }

    // Notes without headings (unstructured)
    const noHeadings = notes.filter(n => n.headings.length === 0);
    if (noHeadings.length / notes.length > 0.3) {
      questions.push(
        `${noHeadings.length} notes have no headings and may benefit from better structure.`
      );
    }

    // Notes without tags
    const noTags = notes.filter(n => n.tags.length === 0);
    if (noTags.length / notes.length > 0.3) {
      questions.push(
        `${noTags.length} notes have no tags, which may limit discovery and clustering.`
      );
    }

    return questions;
  }
}
