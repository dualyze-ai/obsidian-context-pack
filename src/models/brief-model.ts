import type { TopicCluster } from './topic-cluster';
import type { KnowledgeHealth } from './health-model';

export interface RelationshipPair {
  noteA: string;
  noteB: string;
  score: number;
}

export interface SimilarPair {
  noteA: string;
  noteB: string;
  score: number;
  level: string;
  sharedFeatures: string[];
}

export interface BriefModel {
  title: string;
  generatedAt: string;
  noteCount: number;
  tagCount: number;
  linkCount: number;
  clusters: TopicCluster[];
  keyTopics: Array<{ name: string; score: number }>;
  relationships: RelationshipPair[];
  similarPairs: SimilarPair[];
  relatedPairs: SimilarPair[];
  health: KnowledgeHealth;
  openQuestions: string[];
  suggestedPrompts: string[];
  executiveSummary: string;
  executiveInsight: string;
  healthInsights: string[];
}
