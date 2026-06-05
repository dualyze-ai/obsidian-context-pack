import { OUTPUT_PRESETS, type OutputTarget, type OutputPreset } from './types';

export function estimateTokens(text: string): number {
  if (!text) return 0;
  const jpChars = (text.match(/[぀-鿿]/g) || []).length;
  const ratio = jpChars / text.length;
  return ratio >= 0.3
    ? Math.round(text.length * 0.7)
    : Math.round(text.length / 4);
}

export function buildTokenReport(tokenCount: number, _target: OutputTarget): string {
  const fmt = (n: number) => (n / 1000).toFixed(0) + 'K';
  const lines = Object.values(OUTPUT_PRESETS)
    .filter(p => p.target !== 'notebooklm-zip' && p.target !== 'custom' && p.target !== 'claude-code')
    .map(p => {
      const ok = tokenCount <= p.contextLimit;
      const status = ok ? '✅' : '⚠️';
      const label = p.label.padEnd(20);
      return `  ${status} ${label} (${fmt(p.contextLimit)})`;
    });

  return [
    `Estimated tokens: ~${tokenCount.toLocaleString()}`,
    '',
    ...lines,
  ].join('\n');
}

export function getTokenWarning(tokenCount: number, preset: OutputPreset): string | null {
  if (tokenCount <= preset.maxTokens) return null;
  const fmt = (n: number) => n.toLocaleString();
  return `This pack is ~${fmt(tokenCount)} tokens. The recommended limit for ${preset.label} is ${fmt(preset.maxTokens)} tokens. Consider narrowing your selection.`;
}
