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
import { t } from '../../i18n';

const RELATED_THRESHOLD = 50;

const GENERIC_HEADINGS_BRIEF = new Set([
  'overview', 'summary', 'introduction', 'conclusion', 'notes',
  'key points', 'references', 'resources', 'background', 'description',
  'details', 'examples', 'tips', 'related', 'links',
  'takeaways', 'action items', 'learnings', 'how to apply',
  'quotes', 'key quotes', 'memorable quotes', 'impressions', 'review', 'thoughts',
  'ingredients', 'instructions', 'directions', 'method', 'preparation', 'serving',
  '概要', '要約', 'まとめ', 'はじめに', '重要なポイント',
  'ポイント', 'メモ', '参考', '参考文献', 'リンク', '関連',
  '詳細', '説明', '注意', 'ヒント',
  '印象的な言葉', '学び', '学び・活かし方', '活かし方', '感想', '引用',
  '読書メモ', 'レビュー', 'アクションアイテム', '気づき',
  '材料', '調味料', '作り方', '手順', '盛り付け', '準備', '下準備',
]);

function normalizeHeadingBrief(h: string): string {
  return h.replace(/[（(][^）)]*[）)]/g, '').trim().toLowerCase();
}

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
        level: p.score >= 90 ? t('brief_level_very_similar') : p.score >= 80 ? t('brief_level_strong') : t('brief_level_review'),
        sharedFeatures: this.getSharedFeatures(p.a, p.b),
      }));

    const noteToCluster = new Map<string, string>();
    for (const cluster of clusters) {
      for (const note of cluster.notes) noteToCluster.set(note, cluster.id);
    }

    const relatedPairs: SimilarPair[] = allPairsAboveRelated
      .filter(p => {
        if (p.score >= settings.similarityThreshold) return false;
        const ca = noteToCluster.get(p.a.title);
        const cb = noteToCluster.get(p.b.title);
        return ca !== undefined && cb !== undefined && ca === cb;
      })
      .slice(0, 15)
      .map(p => ({
        noteA: p.a.title,
        noteB: p.b.title,
        score: p.score,
        level: t('brief_level_related'),
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
      ? [t('brief_exec_doc_header'), '', t('brief_exec_row_sections', clusters.length), t('brief_exec_row_tags', tagCount)].join('\n')
      : [
          t('brief_exec_kb_header'), '',
          t('brief_exec_row_notes', notes.length),
          t('brief_exec_row_links', totalLinks),
          t('brief_exec_row_tags', tagCount),
          t('brief_exec_row_clusters', clusters.length),
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

    // Absorb single-note clusters unless every cluster is single-note (Document Structure mode)
    // Exception: index/overview notes keep their own cluster with the note title as name
    const INDEX_PATTERN = /index|一覧|目次|readme|contents/i;
    const isDocMode = clusters.every(c => c.notes.length === 1);
    if (!isDocMode) {
      const singles = clusters.filter(c => c.notes.length === 1);
      if (singles.length > 0) {
        const otherName = t('cluster_other');
        let other = clusters.find(c => c.name === otherName);
        const absorbed: Set<string> = new Set();

        for (const s of singles) {
          if (INDEX_PATTERN.test(s.notes[0])) {
            s.name = s.notes[0];
          } else {
            if (!other) {
              other = { id: 'other-merged', name: otherName, notes: [], score: 0, themes: [], representativeNotes: [] };
              clusters.push(other);
            }
            other.notes.push(s.notes[0]);
            absorbed.add(s.id);
          }
        }

        if (absorbed.size > 0) {
          clusters.splice(0, clusters.length, ...clusters.filter(c => !absorbed.has(c.id)));
        }
      }
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
      const listed = this.joinList(sectionNames);
      const parts = [t('brief_insight_doc_intro', clusters.length, listed)];
      parts.push(health.connectivityScore >= 30 ? t('brief_insight_sec_conn') : t('brief_insight_sec_alone'));
      return parts.join('\n\n');
    }

    const nonTrivial = clusters.filter(c => c.notes.length > 1);
    const dominant = nonTrivial[0];
    const parts: string[] = [];

    if (dominant) {
      const pct = Math.round(dominant.notes.length / notes.length * 100);
      parts.push(t('brief_insight_kb_intro', notes.length, clusters.length) + ' ' + t('brief_insight_largest', dominant.name, pct));
    } else {
      parts.push(t('brief_insight_single', notes.length));
    }

    if (dominant) {
      const themes = dominant.themes.slice(0, 2);
      const themeStr = this.joinList(themes);
      let hubLine = themes.length > 0
        ? t('brief_insight_hub_themed', dominant.name, themeStr)
        : t('brief_insight_hub', dominant.name);
      if (nonTrivial.length > 1) {
        hubLine += t('brief_insight_second', nonTrivial[1].name, nonTrivial[1].notes.length);
      }
      parts.push(hubLine);
    }

    if (health.connectivityScore >= 60) {
      parts.push(t('brief_insight_conn_high'));
    } else if (health.connectivityScore >= 30) {
      parts.push(t('brief_insight_conn_mid'));
    } else {
      parts.push(t('brief_insight_conn_low'));
    }

    if (nonTrivial.length > 1) {
      parts.push(t('brief_insight_add_overview', this.joinList(nonTrivial.slice(0, 4).map(c => c.name))));
    }

    return parts.join('\n\n');
  }

  private buildHealthInsights(clusters: TopicCluster[], health: KnowledgeHealth): string[] {
    const insights: string[] = [];
    const isDocumentMode = clusters.length > 0 && clusters.every(c => c.notes.length === 1);
    const nonTrivial = clusters.filter(c => c.notes.length > 1);

    if (isDocumentMode) {
      insights.push(t('brief_hi_doc', clusters.length, clusters.map(c => c.notes[0]).join(t('brief_list_sep'))));
    } else if (nonTrivial.length > 0) {
      insights.push(t('brief_hi_clusters', nonTrivial.length, nonTrivial.map(c => c.name).join(t('brief_list_sep'))));
    }

    if (health.connectivityScore >= 60) {
      insights.push(t('brief_hi_conn_high'));
    } else if (health.connectivityScore >= 30) {
      insights.push(t('brief_hi_conn_mid'));
    } else {
      insights.push(t('brief_hi_conn_low'));
    }

    if (health.orphanNotes === 0) {
      insights.push(t('brief_hi_all_reach'));
    } else {
      insights.push(t('brief_hi_orphans', health.orphanNotes));
    }

    if (!isDocumentMode) {
      if (health.topicCoverageScore >= 75) {
        insights.push(t('brief_hi_coverage_high'));
      } else if (health.topicCoverageScore >= 45) {
        insights.push(t('brief_hi_coverage_mid'));
      } else {
        insights.push(t('brief_hi_coverage_low'));
      }
    }

    if (nonTrivial.length > 1) {
      insights.push(t('brief_hi_overview', this.joinList(nonTrivial.slice(0, 4).map(c => c.name))));
    }

    return insights;
  }

  private getSharedFeatures(a: NoteModel, b: NoteModel): string[] {
    const sharedTags = a.tags.filter(t => b.tags.includes(t) && !this.isMetadataTag(t));
    const sharedHeadings = a.headings.filter(h => {
      const norm = normalizeHeadingBrief(h);
      if (!norm || GENERIC_HEADINGS_BRIEF.has(norm)) return false;
      return b.headings.some(bh => normalizeHeadingBrief(bh) === norm);
    });
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
      dynamic.push(t('brief_prompt_compare', samePair[0], samePair[1]));
    } else if (top.length >= 2) {
      dynamic.push(t('brief_prompt_compare', top[0], top[1]));
    }

    if (clusterNames[0]) dynamic.push(t('brief_prompt_summarize', clusterNames[0]));
    if (top[0])          dynamic.push(t('brief_prompt_overview', top[0]));
    if (clusterNames.length >= 2) {
      dynamic.push(t('brief_prompt_connections', clusterNames[0], clusterNames[1]));
    }

    const generic = [
      t('brief_prompt_gaps'),
      t('brief_prompt_central'),
      t('brief_prompt_improve'),
      t('brief_prompt_roadmap'),
    ];

    return [...dynamic, ...generic];
  }

  private findSameClusterPair(
    keyTopics: Array<{ name: string; score: number }>,
    clusters: TopicCluster[]
  ): [string, string] | null {
    for (const cluster of clusters) {
      const clusterSet = new Set(cluster.notes);
      const matches = keyTopics.filter(tp => clusterSet.has(tp.name));
      if (matches.length >= 2) return [matches[0].name, matches[1].name];
    }
    return null;
  }

  private joinList(items: string[]): string {
    if (items.length === 0) return '';
    if (items.length === 1) return items[0];
    if (items.length === 2) return items[0] + t('brief_list_and') + items[1];
    return items.slice(0, -1).join(t('brief_list_sep')) + t('brief_list_and') + items[items.length - 1];
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
