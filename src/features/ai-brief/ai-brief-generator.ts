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
import type { TopicCluster } from '../../models/topic-cluster';
import type { KnowledgeHealth } from '../../models/health-model';
import type { AIBriefSettings } from '../../settings';

const RELATED_THRESHOLD = 30;

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
    this.enrichClusters(clusters, notes);

    const keyTopics = this.structureAnalyzer.getKeyTopics(notes, settings.maxTopics);

    const allPairsAboveRelated = this.similarityAnalyzer.findSimilarPairs(notes, RELATED_THRESHOLD);
    const similarPairs: SimilarPair[] = allPairsAboveRelated
      .filter(p => p.score >= settings.similarityThreshold)
      .map(p => ({
        noteA: p.a.title,
        noteB: p.b.title,
        score: p.score,
        level: p.score >= 90 ? 'Very Similar' : p.score >= 80 ? 'Strong Candidate' : 'Review Candidate',
        sharedFeatures: this.getSharedFeatures(p.a, p.b),
      }));

    const relatedPairs: SimilarPair[] = allPairsAboveRelated
      .filter(p => p.score >= RELATED_THRESHOLD && p.score < settings.similarityThreshold)
      .slice(0, 15)
      .map(p => ({
        noteA: p.a.title,
        noteB: p.b.title,
        score: p.score,
        level: 'Potentially Related',
        sharedFeatures: this.getSharedFeatures(p.a, p.b),
      }));

    const health = this.healthAnalyzer.calculate(notes, clusters, similarPairs.length);
    const openQuestions = this.openQuestionGenerator.generate(notes, clusters, health);
    const relationships = this.computeRelationships(notes);
    const suggestedPrompts = this.buildPrompts(keyTopics, clusters);

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

    const executiveInsight = this.buildExecutiveInsight(notes, clusters, keyTopics, health);
    const healthInsights = this.buildHealthInsights(clusters, health);

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
      relatedPairs,
      health,
      openQuestions,
      suggestedPrompts,
      executiveSummary,
      executiveInsight,
      healthInsights,
    };
  }

  private isMetadataTag(tag: string): boolean {
    return tag.includes(':') || /^\d/.test(tag);
  }

  private enrichClusters(clusters: TopicCluster[], notes: NoteModel[]): void {
    const noteMap = new Map<string, NoteModel>(notes.map(n => [n.title, n]));

    for (const cluster of clusters) {
      const tagFreq = new Map<string, number>();
      for (const title of cluster.notes) {
        const note = noteMap.get(title);
        if (!note) continue;
        for (const tag of note.tags) {
          if (this.isMetadataTag(tag)) continue;
          if (tag.toLowerCase() !== cluster.name.toLowerCase()) {
            tagFreq.set(tag, (tagFreq.get(tag) ?? 0) + 1);
          }
        }
      }
      cluster.themes = Array.from(tagFreq.entries())
        .filter(([, freq]) => freq >= 2)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([tag]) => tag);

      const clusterSet = new Set(cluster.notes);
      cluster.representativeNotes = cluster.notes
        .map(title => {
          const note = noteMap.get(title);
          if (!note) return { title, w: 0 };
          const internalBL = note.backlinks.filter(bl => clusterSet.has(bl)).length;
          return { title, w: internalBL * 2 + note.backlinks.length + note.links.length };
        })
        .sort((a, b) => b.w - a.w)
        .slice(0, 3)
        .map(r => r.title);
    }
  }

  private buildExecutiveInsight(
    notes: NoteModel[],
    clusters: TopicCluster[],
    keyTopics: Array<{ name: string; score: number }>,
    health: KnowledgeHealth
  ): string {
    const nonTrivial = clusters.filter(c => c.notes.length > 1);
    const dominant = nonTrivial[0];
    const topTopic = keyTopics[0];
    const parts: string[] = [];

    if (dominant) {
      const pct = Math.round(dominant.notes.length / notes.length * 100);
      parts.push(
        `This knowledge base contains ${notes.length} notes organized into ${clusters.length} topic cluster${clusters.length > 1 ? 's' : ''}. ` +
        `"${dominant.name}" is the largest cluster, accounting for ${pct}% of all notes.`
      );
    } else {
      parts.push(`This knowledge base contains ${notes.length} notes in a single topic area.`);
    }

    if (topTopic) {
      parts.push(`"${topTopic.name}" is the most central note and serves as a primary entry point.`);
    }

    if (health.connectivityScore >= 60) {
      parts.push('The collection is well connected, with most notes linked to related content.');
    } else if (health.connectivityScore >= 30) {
      parts.push('Most notes are connected within their cluster, though cross-cluster links are limited.');
    } else {
      parts.push('Connectivity is low. Adding more links between notes would significantly improve navigability.');
    }

    if (nonTrivial.length > 1) {
      const names = nonTrivial.slice(0, 4).map(c => c.name);
      const joined = names.length > 1
        ? names.slice(0, -1).join(', ') + ' and ' + names[names.length - 1]
        : names[0];
      parts.push(`Consider adding overview or comparison notes connecting ${joined}.`);
    }

    return parts.join('\n\n');
  }

  private buildHealthInsights(clusters: TopicCluster[], health: KnowledgeHealth): string[] {
    const insights: string[] = [];
    const nonTrivial = clusters.filter(c => c.notes.length > 1);

    if (nonTrivial.length > 0) {
      const names = nonTrivial.map(c => c.name).join(', ');
      insights.push(`The vault is organized into ${nonTrivial.length} cluster${nonTrivial.length > 1 ? 's' : ''}: ${names}.`);
    }

    if (health.connectivityScore >= 60) {
      insights.push('Notes are well connected within their topic areas.');
    } else if (health.connectivityScore >= 30) {
      insights.push('Most notes are connected within their regional clusters. Cross-cluster connections are limited.');
    } else {
      insights.push('Most notes have few connections. Adding links would improve navigability.');
    }

    if (health.orphanNotes === 0) {
      insights.push('All notes are reachable via at least one link.');
    } else {
      insights.push(`${health.orphanNotes} note${health.orphanNotes > 1 ? 's are' : ' is'} not linked from any other note.`);
    }

    if (nonTrivial.length > 1) {
      const names = nonTrivial.slice(0, 4).map(c => c.name);
      const joined = names.length > 1
        ? names.slice(0, -1).join(', ') + ', and ' + names[names.length - 1]
        : names[0];
      insights.push(`Consider creating overview notes linking ${joined} to improve cross-cluster navigation.`);
    }

    return insights;
  }

  private getSharedFeatures(a: NoteModel, b: NoteModel): string[] {
    const sharedTags = a.tags.filter(t => b.tags.includes(t) && !this.isMetadataTag(t));
    const sharedHeadings = a.headings.filter(h =>
      b.headings.some(bh => bh.toLowerCase() === h.toLowerCase())
    );
    return [...sharedTags.slice(0, 3), ...sharedHeadings.slice(0, 2)];
  }

  private buildPrompts(
    keyTopics: Array<{ name: string; score: number }>,
    clusters: TopicCluster[]
  ): string[] {
    const top = keyTopics.slice(0, 3).map(t => t.name);
    const clusterNames = clusters.filter(c => c.notes.length > 1).slice(0, 3).map(c => c.name);

    const dynamic: string[] = [];
    if (top.length >= 2) dynamic.push(`Compare and contrast ${top[0]} and ${top[1]}.`);
    if (top[0])          dynamic.push(`Create a structured overview of ${top[0]}.`);
    if (clusterNames[0]) dynamic.push(`Summarize the key themes in ${clusterNames[0]}.`);
    if (clusterNames.length >= 2) {
      dynamic.push(`What are the connections between ${clusterNames[0]} and ${clusterNames[1]}?`);
    }

    const generic = [
      'Identify the most important knowledge gaps in this collection.',
      'What topics are most central to this knowledge base?',
      'Suggest how to improve the structure and connectivity of these notes.',
      'Create a learning roadmap based on the topic clusters.',
    ];

    return [...dynamic, ...generic];
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
