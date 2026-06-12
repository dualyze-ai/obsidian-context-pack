import type { NoteModel } from '../models/note-model';
import type { TopicCluster } from '../models/topic-cluster';
import type { KnowledgeHealth } from '../models/health-model';

export class HealthAnalyzer {
  calculate(notes: NoteModel[], clusters: TopicCluster[], duplicateCandidates: number): KnowledgeHealth {
    const totalNotes = notes.length;
    const totalLinks = notes.reduce((sum, n) => sum + n.links.length, 0);
    const orphanNotes = notes.filter(n => n.links.length === 0 && n.backlinks.length === 0).length;

    const connectivityScore = this.calcConnectivity(totalLinks, totalNotes);
    const topicCoverageScore = this.calcTopicCoverage(clusters, totalNotes);

    return {
      totalNotes,
      totalLinks,
      orphanNotes,
      duplicateCandidates,
      connectivityScore,
      topicCoverageScore,
    };
  }

  private calcConnectivity(totalLinks: number, totalNotes: number): number {
    if (totalNotes === 0) return 0;
    const ratio = totalLinks / totalNotes;
    return Math.min(100, Math.round(ratio * 20));
  }

  private calcTopicCoverage(clusters: TopicCluster[], totalNotes: number): number {
    if (clusters.length === 0 || totalNotes === 0) return 0;
    const avg = totalNotes / clusters.length;
    const sizes = clusters.map(c => c.notes.length);
    const variance = sizes.reduce((sum, s) => sum + Math.pow(s - avg, 2), 0) / clusters.length;
    const cv = avg > 0 ? Math.sqrt(variance) / avg : 0;
    return Math.round(Math.min(100, 100 / (1 + cv)));
  }

}
