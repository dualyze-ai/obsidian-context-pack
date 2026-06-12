import type { NoteModel } from '../models/note-model';

export interface TopicScore {
  name: string;
  score: number;
}

function isMetadataTag(tag: string): boolean {
  return tag.includes(':') || /^\d/.test(tag);
}

export class StructureAnalyzer {
  getKeyTopics(notes: NoteModel[], topN = 10): TopicScore[] {
    const headingFreq = new Map<string, number>();
    for (const note of notes) {
      for (const heading of note.headings) {
        const key = heading.toLowerCase();
        headingFreq.set(key, (headingFreq.get(key) ?? 0) + 1);
      }
    }

    const tagFreq = new Map<string, number>();
    for (const note of notes) {
      for (const tag of note.tags) {
        if (isMetadataTag(tag)) continue;
        const key = tag.toLowerCase();
        tagFreq.set(key, (tagFreq.get(key) ?? 0) + 1);
      }
    }

    const scores = new Map<string, number>();
    for (const note of notes) {
      const linkCount = note.links.length;
      const backlinkCount = note.backlinks.length;
      const topicTags = note.tags.filter(t => !isMetadataTag(t));
      const tagScore = topicTags.length > 0
        ? topicTags.reduce((sum, t) => sum + (tagFreq.get(t.toLowerCase()) ?? 1), 0) / topicTags.length
        : 0;
      const headingScore = note.headings.length > 0
        ? note.headings.reduce((sum, h) => sum + (headingFreq.get(h.toLowerCase()) ?? 1), 0) / note.headings.length
        : 0;

      scores.set(note.title, linkCount * 0.4 + backlinkCount * 0.3 + tagScore * 0.2 + headingScore * 0.1);
    }

    return Array.from(scores.entries())
      .map(([name, score]) => ({ name, score }))
      .sort((a, b) => b.score - a.score)
      .slice(0, topN);
  }
}
