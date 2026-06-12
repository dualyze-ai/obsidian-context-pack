import type { NoteModel } from '../models/note-model';
import type { TopicCluster } from '../models/topic-cluster';
import type { KnowledgeHealth } from '../models/health-model';

export class OpenQuestionGenerator {
  generate(notes: NoteModel[], clusters: TopicCluster[], health: KnowledgeHealth): string[] {
    const questions: string[] = [];

    if (health.orphanNotes > 0) {
      questions.push(
        `${health.orphanNotes} note${health.orphanNotes > 1 ? 's are' : ' is'} isolated from the main knowledge graph.`
      );
    }

    const smallClusters = clusters.filter(c => c.notes.length === 1);
    if (smallClusters.length > 0) {
      questions.push(
        `${smallClusters.length} topic cluster${smallClusters.length > 1 ? 's lack' : ' lacks'} supporting material (single-note clusters).`
      );
    }

    if (health.duplicateCandidates > 0) {
      questions.push(
        `${health.duplicateCandidates} pair${health.duplicateCandidates > 1 ? 's' : ''} of highly similar notes may be candidates for merging.`
      );
    }

    const underDocumented = notes.filter(n => n.backlinks.length >= 3 && n.wordCount < 100);
    if (underDocumented.length > 0) {
      questions.push(
        `${underDocumented.length} frequently referenced concept${underDocumented.length > 1 ? 's have' : ' has'} limited documentation.`
      );
    }

    if (health.connectivityScore < 30) {
      questions.push(
        'The overall link density is low. Adding more connections between notes could improve knowledge navigability.'
      );
    }

    return questions;
  }
}
