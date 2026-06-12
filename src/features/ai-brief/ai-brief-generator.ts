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
    const isDocumentMode = clusters.length > 0 && clusters.every(c => c.notes.length === 1);

    const executiveSummary = isDocumentMode
      ? [
          'This document contains:',
          '',
          `- ${clusters.length} section${clusters.length !== 1 ? 's' : ''}`,
          `- ${tagCount} tags`,
        ].join('\n')
      : [
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

    // Tags on more than half the vault are too generic to be meaningful themes
    const globalTagFreq = new Map<string, number>();
    for (const note of notes) {
      for (const tag of note.tags) {
        if (!this.isMetadataTag(tag)) {
          globalTagFreq.set(tag, (globalTagFreq.get(tag) ?? 0) + 1);
        }
      }
    }
    const genericThreshold = notes.length * 0.5;

    for (const cluster of clusters) {
      const tagFreq = new Map<string, number>();
      for (const title of cluster.notes) {
        const note = noteMap.get(title);
        if (!note) continue;
        for (const tag of note.tags) {
          if (this.isMetadataTag(tag)) continue;
          if (tag.toLowerCase() === cluster.name.toLowerCase()) continue;
          if ((globalTagFreq.get(tag) ?? 0) >= genericThreshold) continue;
          tagFreq.set(tag, (tagFreq.get(tag) ?? 0) + 1);
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
    const isDocumentMode = clusters.length > 0 && clusters.every(c => c.notes.length === 1);

    if (isDocumentMode) {
      const sectionNames = clusters.map(c => c.notes[0]);
      const listed = sectionNames.length > 1
        ? sectionNames.slice(0, -1).join(', ') + ', and ' + sectionNames[sectionNames.length - 1]
        : sectionNames[0];
      const parts = [`This document contains ${clusters.length} section${clusters.length !== 1 ? 's' : ''}: ${listed}.`];
      if (health.connectivityScore >= 30) {
        parts.push('The sections are linked to each other, forming a cohesive reference structure.');
      } else {
        parts.push('Sections are relatively standalone. Adding links between them would improve navigability.');
      }
      return parts.join('\n\n');
    }

    const nonTrivial = clusters.filter(c => c.notes.length > 1);
    const dominant = nonTrivial[0];
    const parts: string[] = [];

    if (dominant) {
      const pct = Math.round(dominant.notes.length / notes.length * 100);
      parts.push(
        `This knowledge base contains ${notes.length} notes organized into ${clusters.length} topic cluster${clusters.length !== 1 ? 's' : ''}. ` +
        `"${dominant.name}" is the largest cluster, accounting for ${pct}% of all notes.`
      );
    } else {
      parts.push(`This knowledge base contains ${notes.length} notes in a single topic area.`);
    }

    if (dominant) {
      const themes = dominant.themes.slice(0, 2);
      let hubLine = `"${dominant.name}" forms the primary knowledge hub`;
      if (themes.length > 0) hubLine += `, with themes including ${themes.join(' and ')}`;
      hubLine += '.';
      if (nonTrivial.length > 1) {
        const second = nonTrivial[1];
        hubLine += ` "${second.name}" is the next developed area with ${second.notes.length} notes.`;
      }
      parts.push(hubLine);
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
    const isDocumentMode = clusters.length > 0 && clusters.every(c => c.notes.length === 1);
    const nonTrivial = clusters.filter(c => c.notes.length > 1);

    if (isDocumentMode) {
      const names = clusters.map(c => c.notes[0]).join(', ');
      insights.push(`This document is structured into ${clusters.length} section${clusters.length !== 1 ? 's' : ''}: ${names}.`);
    } else if (nonTrivial.length > 0) {
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
    const substantialClusters = clusters.filter(c => c.notes.length > 1);
    const clusterNames = substantialClusters.slice(0, 3).map(c => c.name);
    const top = keyTopics.slice(0, 3).map(t => t.name);

    const dynamic: string[] = [];

    // Prefer same-cluster pair for comparison to avoid cross-domain juxtaposition
    const samePair = this.findSameClusterPair(keyTopics, substantialClusters);
    if (samePair) {
      dynamic.push(`Compare and contrast "${samePair[0]}" and "${samePair[1]}".`);
    } else if (top.length >= 2) {
      dynamic.push(`Compare and contrast "${top[0]}" and "${top[1]}".`);
    }

    if (clusterNames[0]) dynamic.push(`Summarize the key themes in ${clusterNames[0]}.`);
    if (top[0])          dynamic.push(`Create a structured overview of "${top[0]}".`);
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

  private findSameClusterPair(
    keyTopics: Array<{ name: string; score: number }>,
    clusters: TopicCluster[]
  ): [string, string] | null {
    for (const cluster of clusters) {
      const clusterSet = new Set(cluster.notes);
      const matches = keyTopics.filter(t => clusterSet.has(t.name));
      if (matches.length >= 2) return [matches[0].name, matches[1].name];
    }
    return null;
  }

  private computeRelationships(notes: NoteModel[]): RelationshipPair[] {
    const pairs: RelationshipPair[] = [];
    for (let i = 0; i < notes.length; i++) {
      for (let j = i + 1; j < notes.length; j++) {
        const a = notes[i];
        const b = notes[j];
        const sharedTags = a.tags.filter(t => b.tags.includes(t) && !this.isMetadataTag(t)).length;
        const sharedLinks = a.links.filter(l => b.links.includes(l)).length;
        const sharedBacklinks = a.backlinks.filter(bl => b.backlinks.includes(bl)).length;
        const sharedCount = sharedTags + sharedLinks + sharedBacklinks;
        if (sharedCount < 2) continue;
        const maxPossible = Math.max(
          a.tags.filter(t => !this.isMetadataTag(t)).length + a.links.length + a.backlinks.length,
          b.tags.filter(t => !this.isMetadataTag(t)).length + b.links.length + b.backlinks.length,
          1
        );
        const score = sharedCount / maxPossible;
        if (score < 0.6) continue;
        pairs.push({ noteA: a.title, noteB: b.title, score });
      }
    }
    return pairs.sort((a, b) => b.score - a.score).slice(0, 20);
  }
}
