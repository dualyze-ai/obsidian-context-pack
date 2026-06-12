import { App, TFile, moment } from 'obsidian';
import { NoteParser } from '../../core/note-parser';
import { LinkAnalyzer } from '../../core/link-analyzer';
import { ClusterAnalyzer } from '../../core/cluster-analyzer';
import { SimilarityAnalyzer } from '../../core/similarity-analyzer';
import { StructureAnalyzer } from '../../core/structure-analyzer';
import { HealthAnalyzer } from '../../core/health-analyzer';
import { OpenQuestionGenerator } from '../../core/open-question-generator';
import type { BriefModel, RelationshipPair, SimilarPair } from '../../models/brief-model';
import type { NoteModel } from '../../models/note-model';
import type { AIBriefSettings } from '../../settings';

const SUGGESTED_PROMPTS = [
  'Analyze the relationships between the major topic clusters in this knowledge base.',
  'What are the most critical knowledge gaps based on this structural analysis?',
  'Suggest how to improve connectivity for the isolated notes.',
  'Create a learning roadmap based on the topic clusters and their relationships.',
  'Which topics are most central to this knowledge base and why?',
  'Identify which clusters would benefit most from additional supporting notes.',
  'What patterns or themes emerge across multiple topic clusters?',
];

export class AIBriefGenerator {
  private noteParser: NoteParser;
  private linkAnalyzer: LinkAnalyzer;
  private clusterAnalyzer: ClusterAnalyzer;
  private similarityAnalyzer: SimilarityAnalyzer;
  private structureAnalyzer: StructureAnalyzer;
  private healthAnalyzer: HealthAnalyzer;
  private openQuestionGenerator: OpenQuestionGenerator;

  constructor(private app: App) {
    this.noteParser = new NoteParser(app);
    this.linkAnalyzer = new LinkAnalyzer();
    this.clusterAnalyzer = new ClusterAnalyzer();
    this.similarityAnalyzer = new SimilarityAnalyzer();
    this.structureAnalyzer = new StructureAnalyzer();
    this.healthAnalyzer = new HealthAnalyzer();
    this.openQuestionGenerator = new OpenQuestionGenerator();
  }

  async generate(files: TFile[], title: string, settings: AIBriefSettings): Promise<BriefModel> {
    const notes = await this.noteParser.parseAll(files);
    const graph = this.linkAnalyzer.buildGraph(notes);
    this.linkAnalyzer.populateBacklinks(notes, graph);

    const clusters = this.clusterAnalyzer.detect(notes, graph);
    const keyTopics = this.structureAnalyzer.getKeyTopics(notes, settings.maxTopics);

    const similarRaw = this.similarityAnalyzer.findSimilarPairs(notes, settings.similarityThreshold);
    const similarPairs: SimilarPair[] = similarRaw.map(p => ({
      noteA: p.a.title,
      noteB: p.b.title,
      score: p.score,
      level: p.score >= 90 ? 'Very Similar' : p.score >= 80 ? 'Strong Candidate' : 'Review Candidate',
    }));

    const health = this.healthAnalyzer.calculate(notes, clusters, similarPairs.length);
    const openQuestions = this.openQuestionGenerator.generate(notes, clusters, health);
    const relationships = this.computeRelationships(notes);

    const tagCount = new Set(notes.flatMap(n => n.tags)).size;
    const totalLinks = notes.reduce((sum, n) => sum + n.links.length, 0);

    const executiveSummary = [
      'This knowledge base contains:',
      '',
      `- ${notes.length} notes`,
      `- ${totalLinks} links`,
      `- ${tagCount} tags`,
      `- ${clusters.length} major topic clusters`,
    ].join('\n');

    return {
      title,
      generatedAt: moment().format('YYYY-MM-DD HH:mm'),
      noteCount: notes.length,
      tagCount,
      linkCount: totalLinks,
      clusters,
      keyTopics,
      relationships,
      similarPairs,
      health,
      openQuestions,
      suggestedPrompts: SUGGESTED_PROMPTS,
      executiveSummary,
    };
  }

  private computeRelationships(notes: NoteModel[]): RelationshipPair[] {
    const pairs: RelationshipPair[] = [];

    for (let i = 0; i < notes.length; i++) {
      for (let j = i + 1; j < notes.length; j++) {
        const a = notes[i];
        const b = notes[j];

        const sharedTags = a.tags.filter(t => b.tags.includes(t)).length;
        const sharedLinks = a.links.filter(l => b.links.includes(l)).length;
        const sharedBacklinks = a.backlinks.filter(bl => b.backlinks.includes(bl)).length;
        const total = sharedTags + sharedLinks + sharedBacklinks;

        if (total > 0) {
          const maxPossible = Math.max(
            a.tags.length + a.links.length + a.backlinks.length,
            b.tags.length + b.links.length + b.backlinks.length,
            1
          );
          pairs.push({ noteA: a.title, noteB: b.title, score: total / maxPossible });
        }
      }
    }

    return pairs.sort((a, b) => b.score - a.score).slice(0, 20);
  }
}
