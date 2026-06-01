import { estimateTokens, buildTokenReport, getTokenWarning } from '../src/token-counter';
import { OUTPUT_PRESETS } from '../src/types';

describe('estimateTokens', () => {
  test('empty string returns 0', () => {
    expect(estimateTokens('')).toBe(0);
  });

  test('English text uses length/4 formula', () => {
    const text = 'hello world '.repeat(100);
    const expected = Math.round(text.length / 4);
    expect(estimateTokens(text)).toBe(expected);
  });

  test('Japanese text uses length*0.7 formula', () => {
    const text = 'これはテストです。'.repeat(100);
    const expected = Math.round(text.length * 0.7);
    expect(estimateTokens(text)).toBe(expected);
  });

  test('mixed text under 30% Japanese uses English formula', () => {
    const en = 'hello world '.repeat(300);
    const jp = 'あいう'.repeat(10);
    const text = en + jp;
    const jpCount = (text.match(/[぀-鿿]/g) || []).length;
    const ratio = jpCount / text.length;
    expect(ratio).toBeLessThan(0.3);
    const expected = Math.round(text.length / 4);
    expect(estimateTokens(text)).toBe(expected);
  });

  test('mixed text over 30% Japanese uses Japanese formula', () => {
    const jp = 'これはテスト'.repeat(200);
    const en = 'hello '.repeat(20);
    const text = jp + en;
    const jpCount = (text.match(/[぀-鿿]/g) || []).length;
    const ratio = jpCount / text.length;
    expect(ratio).toBeGreaterThanOrEqual(0.3);
    const expected = Math.round(text.length * 0.7);
    expect(estimateTokens(text)).toBe(expected);
  });
});

describe('buildTokenReport', () => {
  test('includes ChatGPT in report', () => {
    const report = buildTokenReport(12500, 'chatgpt');
    expect(report).toContain('~12,500');
    expect(report).toContain('ChatGPT');
  });

  test('shows checkmark when under limit', () => {
    const report = buildTokenReport(1000, 'chatgpt');
    expect(report).toContain('✅');
  });

  test('shows warning when over limit', () => {
    const report = buildTokenReport(2000000, 'chatgpt');
    expect(report).toContain('⚠️');
  });
});

describe('getTokenWarning', () => {
  const chatgptPreset = OUTPUT_PRESETS['chatgpt'];

  test('returns null when under maxTokens', () => {
    expect(getTokenWarning(50000, chatgptPreset)).toBeNull();
  });

  test('returns null at exact maxTokens', () => {
    expect(getTokenWarning(chatgptPreset.maxTokens, chatgptPreset)).toBeNull();
  });

  test('returns warning string when over maxTokens', () => {
    const result = getTokenWarning(150000, chatgptPreset);
    expect(result).not.toBeNull();
    expect(result).toContain('ChatGPT');
    expect(result).toContain('150,000');
  });
});
