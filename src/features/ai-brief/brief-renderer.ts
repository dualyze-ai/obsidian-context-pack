import type { BriefModel, RelationshipPair, SimilarPair } from '../../models/brief-model';
import type { TopicCluster } from '../../models/topic-cluster';
import type { AIBriefSettings } from '../../settings';
import { t } from '../../i18n';

const CLUSTER_COLORS = [
  '#A8D8EA', '#AAE3A1', '#FFD3B6', '#D6CDEA',
  '#FFEAA7', '#B8E6B8', '#F6C1C1', '#CFE8F5',
];

export class BriefRenderer {
  render(model: BriefModel, settings: AIBriefSettings): string {
    const sections: string[] = ['# AI Brief', ''];
    sections.push(t('brief_generated', model.generatedAt, model.noteCount), '');

    if (settings.includeExecutiveSummary) {
      sections.push(t('brief_h_executive_insight'), '', model.executiveInsight, '');
      sections.push(t('brief_h_executive_summary'), '', model.executiveSummary, '');
    }

    if (settings.includeKeyTopics && model.keyTopics.length > 0) {
      sections.push(t('brief_h_key_topics'), '', this.renderKeyTopics(model), '');
    }

    if (settings.includeKnowledgeMap && model.clusters.length > 0) {
      sections.push(t('brief_h_knowledge_map'), '', this.renderKnowledgeMap(model, settings.enableMermaid), '');
      const isDocumentMode = model.clusters.every(c => c.notes.length === 1);
      if (isDocumentMode) {
        sections.push(t('brief_h_document_structure'), '', this.renderDocumentStructure(model.clusters), '');
      } else {
        sections.push(t('brief_h_topic_clusters'), '', this.renderTopicClusters(model.clusters), '');
      }
    }

    if (settings.includeRelationshipMap) {
      sections.push(t('brief_h_relationship_map'), '', this.renderRelationshipMap(model.relationships), '');
    }

    if (settings.includeSimilarNotes) {
      if (model.similarPairs.length > 0) {
        sections.push(t('brief_h_similar_notes'), '', this.renderPairs(model.similarPairs, true), '');
      }
      if (model.relatedPairs.length > 0) {
        sections.push(t('brief_h_related_notes'), '', this.renderPairs(model.relatedPairs, false), '');
      }
      if (model.similarPairs.length === 0 && model.relatedPairs.length === 0) {
        sections.push(t('brief_h_similar_notes'), '', t('brief_no_pairs'), '');
      }
    }

    if (settings.includeKnowledgeHealth) {
      sections.push(t('brief_h_knowledge_health'), '', this.renderHealth(model), '');
    }

    if (settings.includeOpenQuestions) {
      sections.push(t('brief_h_open_questions'), '', this.renderList(model.openQuestions), '');
    }

    if (settings.includeSuggestedPrompts) {
      sections.push(t('brief_h_suggested_prompts'), '', this.renderList(model.suggestedPrompts), '');
    }

    return sections.join('\n');
  }

  private renderKeyTopics(model: BriefModel): string {
    return model.keyTopics.map((tp, i) => `${i + 1}. **${tp.name}**`).join('\n');
  }

  private renderKnowledgeMap(model: BriefModel, enableMermaid: boolean): string {
    const lines: string[] = [];

    if (enableMermaid) {
      const clusterList = model.clusters.slice(0, 8);
      lines.push('```mermaid');
      lines.push('graph LR');
      lines.push('  ROOT(["Knowledge Map"])');

      for (let i = 0; i < clusterList.length; i++) {
        const cluster = clusterList[i];
        const cId = `C${i}`;
        const safeName = cluster.name.replace(/"/g, '');
        lines.push(`  ROOT --> ${cId}["${safeName}"]`);
        for (let j = 0; j < Math.min(cluster.notes.length, 4); j++) {
          const safeNote = cluster.notes[j].replace(/"/g, '');
          lines.push(`  ${cId} --> N${i}x${j}["${safeNote}"]`);
        }
      }

      for (let i = 0; i < clusterList.length; i++) {
        const color = CLUSTER_COLORS[i % CLUSTER_COLORS.length];
        lines.push(`  style C${i} fill:${color},stroke:${color},color:#333`);
      }
      lines.push('  style ROOT fill:#f0f0f0,stroke:#999,color:#333');

      lines.push('```');
    } else {
      for (const cluster of model.clusters) {
        lines.push(`**${cluster.name}** (${cluster.notes.length} notes)`);
        for (const note of cluster.notes.slice(0, 5)) lines.push(`  - ${note}`);
        if (cluster.notes.length > 5) lines.push(`  - _(+${cluster.notes.length - 5} more)_`);
        lines.push('');
      }
    }

    return lines.join('\n');
  }

  private renderDocumentStructure(clusters: TopicCluster[]): string {
    return clusters.map(c => `- ${c.notes[0]}`).join('\n');
  }

  private renderTopicClusters(clusters: TopicCluster[]): string {
    const lines: string[] = [];

    for (const cluster of clusters) {
      lines.push(`### ${cluster.name}`, '');
      lines.push(t('brief_cluster_notes', cluster.notes.length));

      if (cluster.themes.length > 0) {
        lines.push('', `${t('brief_cluster_themes')} ${cluster.themes.join(', ')}`);
      }

      if (cluster.representativeNotes.length > 0) {
        lines.push('', t('brief_cluster_rep'));
        for (const note of cluster.representativeNotes) {
          lines.push(`- ${note}`);
        }
      }

      lines.push('');
    }

    return lines.join('\n');
  }

  private renderRelationshipMap(pairs: RelationshipPair[]): string {
    if (pairs.length === 0) return t('brief_no_relationships');
    return pairs.slice(0, 10).map(p =>
      `**${p.noteA}** ↔ **${p.noteB}**  \nScore: ${(p.score * 100).toFixed(0)}%`
    ).join('\n\n');
  }

  private renderPairs(pairs: SimilarPair[], showLevel: boolean): string {
    return pairs.slice(0, 10).map(p => {
      const label = showLevel ? ` (${p.level})` : '';
      const lines = [`- **${p.noteA}** ↔ **${p.noteB}** — ${p.score}%${label}`];
      if (p.sharedFeatures.length > 0) {
        lines.push(`  - ${t('brief_shared')} ${p.sharedFeatures.join(', ')}`);
      }
      return lines.join('\n');
    }).join('\n');
  }

  private renderHealth(model: BriefModel): string {
    const h = model.health;
    const lines: string[] = [];

    lines.push(t('brief_h_diagnostic_summary'), '');

    if (model.healthInsights.length > 0) {
      for (const insight of model.healthInsights) {
        lines.push(`- ${insight}`);
      }
      lines.push('');
    }

    if (h.totalLinks === 0) {
      lines.push(t('brief_health_inferred'), t('brief_health_no_links'), '');
    }

    lines.push(
      t('brief_health_col_header'),
      t('brief_health_col_sep'),
      t('brief_health_row_notes', h.totalNotes),
      t('brief_health_row_links', h.totalLinks),
      t('brief_health_row_orphans', h.orphanNotes),
      t('brief_health_row_dupes', h.duplicateCandidates),
      t('brief_health_row_conn', h.connectivityScore),
      t('brief_health_row_coverage', h.topicCoverageScore, this.topicCoverageLabel(h.topicCoverageScore)),
    );

    if (h.orphanNotes === 0 && h.connectivityScore < 50 && h.totalLinks > 0) {
      lines.push('', t('brief_health_conn_note'));
    }

    return lines.join('\n');
  }

  private topicCoverageLabel(score: number): string {
    if (score >= 85) return t('brief_coverage_high');
    if (score >= 70) return t('brief_coverage_good');
    if (score >= 50) return t('brief_coverage_moderate');
    if (score >= 30) return t('brief_coverage_basic');
    return t('brief_coverage_low');
  }

  private renderList(items: string[]): string {
    if (items.length === 0) return t('brief_none');
    return items.map(i => `- ${i}`).join('\n');
  }
}
