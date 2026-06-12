export interface KnowledgeHealth {
  totalNotes: number;
  totalLinks: number;
  orphanNotes: number;
  duplicateCandidates: number;
  connectivityScore: number;
  topicCoverageScore: number;
  healthRating: string;
}
