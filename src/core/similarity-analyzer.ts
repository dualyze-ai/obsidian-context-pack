import type { NoteModel } from '../models/note-model';

function jaccardSimilarity(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 1;
  let intersection = 0;
  for (const item of a) { if (b.has(item)) intersection++; }
  const union = a.size + b.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

function tokenize(text: string): string[] {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
}

function bigrams(tokens: string[]): Set<string> {
  const result = new Set<string>();
  for (let i = 0; i < tokens.length - 1; i++) {
    result.add(`${tokens[i]} ${tokens[i + 1]}`);
  }
  return result;
}

export class SimilarityAnalyzer {
  calculate(a: NoteModel, b: NoteModel): number {
    const titleSim = jaccardSimilarity(
      new Set(tokenize(a.title)),
      new Set(tokenize(b.title))
    );
    const tagSim = jaccardSimilarity(
      new Set(a.tags.map(t => t.toLowerCase())),
      new Set(b.tags.map(t => t.toLowerCase()))
    );
    const headingSim = jaccardSimilarity(
      new Set(a.headings.map(h => h.toLowerCase())),
      new Set(b.headings.map(h => h.toLowerCase()))
    );
    const linkSim = jaccardSimilarity(new Set(a.links), new Set(b.links));
    const contentSim = jaccardSimilarity(
      bigrams(tokenize(a.content.slice(0, 5000))),
      bigrams(tokenize(b.content.slice(0, 5000)))
    );

    return Math.round(titleSim * 20 + tagSim * 20 + headingSim * 20 + linkSim * 20 + contentSim * 20);
  }

  findSimilarPairs(notes: NoteModel[], threshold: number): Array<{ a: NoteModel; b: NoteModel; score: number }> {
    const pairs: Array<{ a: NoteModel; b: NoteModel; score: number }> = [];
    for (let i = 0; i < notes.length; i++) {
      for (let j = i + 1; j < notes.length; j++) {
        const score = this.calculate(notes[i], notes[j]);
        if (score >= threshold) {
          pairs.push({ a: notes[i], b: notes[j], score });
        }
      }
    }
    return pairs.sort((a, b) => b.score - a.score);
  }
}
