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
    const orphanScore = totalNotes > 0 ? Math.round((1 - orphanNotes / totalNotes) * 100) : 0;
    const clusterBalance = this.calcClusterBalance(clusters, totalNotes);

    const composite = Math.round(
      connectivityScore * 0.4 +
      topicCoverageScore * 0.3 +
      orphanScore * 0.2 +
      clusterBalance * 0.1
    );
    const healthRating =
      composite >= 80 ? 'Excellent' :
      composite >= 60 ? 'Good' :
      composite >= 30 ? 'Developing' :
      'Sparse';

    return {
      totalNotes,
      totalLinks,
      orphanNotes,
      duplicateCandidates,
      connectivityScore,
      topicCoverageScore,
      healthRating,
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

  private calcClusterBalance(clusters: TopicCluster[], totalNotes: number): number {
    if (clusters.length === 0 || totalNotes === 0) return 0;
    const maxSize = Math.max(...clusters.map(c => c.notes.length));
    return Math.round((1 - maxSize / totalNotes) * 100);
  }
}
