import type { BriefModel, RelationshipPair, SimilarPair } from '../../models/brief-model';
import type { AIBriefSettings } from '../../settings';

export class BriefRenderer {
  render(model: BriefModel, settings: AIBriefSettings): string {
    const sections: string[] = ['# AI Brief', ''];
    sections.push(`_Generated: ${model.generatedAt} | ${model.noteCount} notes_`, '');

    if (settings.includeExecutiveSummary) {
      sections.push('## Executive Summary', '', model.executiveSummary, '');
    }

    if (settings.includeKeyTopics && model.keyTopics.length > 0) {
      sections.push('## Key Topics', '', this.renderKeyTopics(model), '');
    }

    if (settings.includeKnowledgeMap && model.clusters.length > 0) {
      sections.push('## Knowledge Map', '', this.renderKnowledgeMap(model, settings.enableMermaid), '');
    }

    if (settings.includeRelationshipMap) {
      sections.push('## Relationship Map', '', this.renderRelationshipMap(model.relationships), '');
    }

    if (settings.includeSimilarNotes) {
      sections.push('## Similar Notes', '', this.renderSimilarNotes(model.similarPairs, model.relatedPairs), '');
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

  private renderRelationshipMap(pairs: RelationshipPair[]): string {
    if (pairs.length === 0) return '_No strong relationships detected._';
    return pairs.slice(0, 10).map(p =>
      `**${p.noteA}** ↔ **${p.noteB}**  \nScore: ${(p.score * 100).toFixed(0)}%`
    ).join('\n\n');
  }

  private renderSimilarNotes(pairs: SimilarPair[], related: SimilarPair[]): string {
    const lines: string[] = [];

    if (pairs.length > 0) {
      lines.push('**Similar Notes**', '');
      for (const p of pairs.slice(0, 10)) {
        lines.push(`- **${p.noteA}** ↔ **${p.noteB}** — ${p.score}% (${p.level})`);
        if (p.sharedFeatures.length > 0) {
          lines.push(`  - Shared: ${p.sharedFeatures.join(', ')}`);
        }
      }
    } else {
      lines.push('_No notes exceed the similarity threshold._');
    }

    if (related.length > 0) {
      if (lines.length > 0) lines.push('');
      lines.push('**Potentially Related**', '');
      for (const p of related.slice(0, 10)) {
        lines.push(`- **${p.noteA}** ↔ **${p.noteB}** — ${p.score}%`);
        if (p.sharedFeatures.length > 0) {
          lines.push(`  - Shared: ${p.sharedFeatures.join(', ')}`);
        }
      }
    }

    return lines.length > 0 ? lines.join('\n') : '_No similar notes detected._';
  }

  private renderHealth(model: BriefModel): string {
    const h = model.health;
    return [
      `**Rating: ${h.healthRating}**`,
      '',
      '| Metric | Value |',
      '|---|---|',
      `| Total Notes | ${h.totalNotes} |`,
      `| Total Links | ${h.totalLinks} |`,
      `| Orphan Notes | ${h.orphanNotes} |`,
      `| Duplicate Candidates | ${h.duplicateCandidates} |`,
      `| Connectivity Score | ${h.connectivityScore}/100 |`,
      `| Topic Coverage Score | ${h.topicCoverageScore}/100 |`,
    ].join('\n');
  }

  private renderList(items: string[]): string {
    if (items.length === 0) return '_None_';
    return items.map(i => `- ${i}`).join('\n');
  }
}
