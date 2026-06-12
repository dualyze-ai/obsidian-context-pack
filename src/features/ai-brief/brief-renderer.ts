import type { BriefModel, RelationshipPair, SimilarPair } from '../../models/brief-model';
import type { TopicCluster } from '../../models/topic-cluster';
import type { AIBriefSettings } from '../../settings';

export class BriefRenderer {
  render(model: BriefModel, settings: AIBriefSettings): string {
    const sections: string[] = ['# AI Brief', ''];
    sections.push(`_Generated: ${model.generatedAt} | ${model.noteCount} notes_`, '');

    if (settings.includeExecutiveSummary) {
      sections.push('## Executive Insight', '', model.executiveInsight, '');
      sections.push('## Executive Summary', '', model.executiveSummary, '');
    }

    if (settings.includeKeyTopics && model.keyTopics.length > 0) {
      sections.push('## Key Topics', '', this.renderKeyTopics(model), '');
    }

    if (settings.includeKnowledgeMap && model.clusters.length > 0) {
      sections.push('## Knowledge Map', '', this.renderKnowledgeMap(model, settings.enableMermaid), '');
      const isDocumentMode = model.clusters.every(c => c.notes.length === 1);
      if (isDocumentMode) {
        sections.push('## Document Structure', '', this.renderDocumentStructure(model.clusters), '');
      } else {
        sections.push('## Topic Clusters', '', this.renderTopicClusters(model.clusters), '');
      }
    }

    if (settings.includeRelationshipMap) {
      sections.push('## Relationship Map', '', this.renderRelationshipMap(model.relationships), '');
    }

    if (settings.includeSimilarNotes) {
      if (model.similarPairs.length > 0) {
        sections.push('## Similar Notes', '', this.renderPairs(model.similarPairs, true), '');
      }
      if (model.relatedPairs.length > 0) {
        sections.push('## Related Notes', '', this.renderPairs(model.relatedPairs, false), '');
      }
      if (model.similarPairs.length === 0 && model.relatedPairs.length === 0) {
        sections.push('## Similar Notes', '', '_No note pairs detected above the minimum threshold._', '');
      }
    }

    if (settings.includeKnowledgeHealth) {
      sections.push('## Knowledge Health', '', this.renderHealth(model), '');
    }

    if (settings.includeOpenQuestions) {
      sections.push('## Open Questions', '', this.renderList(model.openQuestions), '');
    }

    if (settings.includeSuggestedPrompts) {
      sections.push('## Suggested Prompts', '', this.renderList(model.suggestedPrompts), '');
    }

    return sections.join('\n');
  }

  private renderKeyTopics(model: BriefModel): string {
    return model.keyTopics.map((t, i) => `${i + 1}. **${t.name}**`).join('\n');
  }

  private renderKnowledgeMap(model: BriefModel, enableMermaid: boolean): string {
    const lines: string[] = [];

    if (enableMermaid) {
      lines.push('```mermaid');
      lines.push('%%{init: {"mindmap": {"useMaxWidth": true}}}%%');
      lines.push('mindmap');
      lines.push('  root((Knowledge Map))');
      for (const cluster of model.clusters.slice(0, 8)) {
        const safeName = cluster.name.replace(/[()[\]{}]/g, '');
        lines.push(`    ${safeName}`);
        for (const note of cluster.notes.slice(0, 4)) {
          lines.push(`      ${note.replace(/[()[\]{}]/g, '')}`);
        }
      }
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

  private renderTopicClusters(clusters: TopicCluster[]): string {
    const lines: string[] = [];

    for (const cluster of clusters) {
      lines.push(`### ${cluster.name}`, '');
      lines.push(`**Notes:** ${cluster.notes.length}`);

      if (cluster.themes.length > 0) {
        lines.push('', `**Main Themes:** ${cluster.themes.join(', ')}`);
      }

      if (cluster.representativeNotes.length > 0) {
        lines.push('', '**Representative Notes:**');
        for (const note of cluster.representativeNotes) {
          lines.push(`- ${note}`);
        }
      }

      lines.push('');
    }

    return lines.join('\n');
  }

  private renderRelationshipMap(pairs: RelationshipPair[]): string {
    if (pairs.length === 0) return '_No strong relationships detected._';
    return pairs.slice(0, 10).map(p =>
      `**${p.noteA}** ↔ **${p.noteB}**  \nScore: ${(p.score * 100).toFixed(0)}%`
    ).join('\n\n');
  }

  private renderPairs(pairs: SimilarPair[], showLevel: boolean): string {
    return pairs.slice(0, 10).map(p => {
      const label = showLevel ? ` (${p.level})` : '';
      const lines = [`- **${p.noteA}** ↔ **${p.noteB}** — ${p.score}%${label}`];
      if (p.sharedFeatures.length > 0) {
        lines.push(`  - Shared: ${p.sharedFeatures.join(', ')}`);
      }
      return lines.join('\n');
    }).join('\n');
  }

  private renderHealth(model: BriefModel): string {
    const h = model.health;
    const lines: string[] = [];

    lines.push(`**Rating: ${h.healthRating}**`, '');

    if (model.healthInsights.length > 0) {
      for (const insight of model.healthInsights) {
        lines.push(`- ${insight}`);
      }
      lines.push('');
    }

    lines.push(
      '| Metric | Value |',
      '|---|---|',
      `| Total Notes | ${h.totalNotes} |`,
      `| Total Links | ${h.totalLinks} |`,
      `| Orphan Notes | ${h.orphanNotes} |`,
      `| Duplicate Candidates | ${h.duplicateCandidates} |`,
      `| Connectivity Score | ${h.connectivityScore}/100 |`,
      `| Topic Coverage Score | ${h.topicCoverageScore}/100 — ${this.topicCoverageLabel(h.topicCoverageScore)} |`,
    );

    return lines.join('\n');
  }

  private renderDocumentStructure(clusters: TopicCluster[]): string {
    return clusters.map(c => `- ${c.notes[0]}`).join('\n');
  }

  private topicCoverageLabel(score: number): string {
    if (score >= 85) return 'High Coverage';
    if (score >= 70) return 'Good Coverage';
    if (score >= 50) return 'Moderate Coverage';
    if (score >= 30) return 'Basic Coverage';
    return 'Low Coverage';
  }

  private renderList(items: string[]): string {
    if (items.length === 0) return '_None_';
    return items.map(i => `- ${i}`).join('\n');
  }
}
