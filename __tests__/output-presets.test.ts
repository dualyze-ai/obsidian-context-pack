import { OUTPUT_PRESETS, type OutputTarget } from '../src/types';

const ALL_TARGETS: OutputTarget[] = [
  'notebooklm-zip',
  'notebooklm-text',
  'chatgpt',
  'claude',
  'gemini',
  'claude-code',
  'custom',
];

describe('OUTPUT_PRESETS', () => {
  test('all targets are defined', () => {
    for (const target of ALL_TARGETS) {
      expect(OUTPUT_PRESETS[target]).toBeDefined();
    }
  });

  test('each preset has required fields', () => {
    for (const preset of Object.values(OUTPUT_PRESETS)) {
      expect(typeof preset.label).toBe('string');
      expect(typeof preset.description).toBe('string');
      expect(['zip', 'text', 'aimd']).toContain(preset.format);
      expect(typeof preset.copyToClipboard).toBe('boolean');
      expect(typeof preset.saveToFile).toBe('boolean');
      expect(typeof preset.maxTokens).toBe('number');
      expect(typeof preset.contextLimit).toBe('number');
    }
  });

  test('contextLimit >= maxTokens for all presets', () => {
    for (const preset of Object.values(OUTPUT_PRESETS)) {
      expect(preset.contextLimit).toBeGreaterThanOrEqual(preset.maxTokens);
    }
  });

  test('chatgpt has both copyToClipboard and saveToFile enabled', () => {
    expect(OUTPUT_PRESETS['chatgpt'].copyToClipboard).toBe(true);
    expect(OUTPUT_PRESETS['chatgpt'].saveToFile).toBe(true);
  });

  test('chatgpt is marked as available', () => {
    expect(OUTPUT_PRESETS['chatgpt'].available).toBe(true);
  });

  test('notebooklm-zip does not copy to clipboard', () => {
    expect(OUTPUT_PRESETS['notebooklm-zip'].copyToClipboard).toBe(false);
  });

  test('notebooklm-text does not copy to clipboard', () => {
    expect(OUTPUT_PRESETS['notebooklm-text'].copyToClipboard).toBe(false);
  });

  test('chatgpt has a valid aiUrl', () => {
    const url = OUTPUT_PRESETS['chatgpt'].aiUrl;
    expect(url).toBeDefined();
    expect(url).toMatch(/^https:\/\//);
  });

  test('claude and gemini are marked as unavailable in v2.1.0', () => {
    expect(OUTPUT_PRESETS['claude'].available).toBe(false);
    expect(OUTPUT_PRESETS['gemini'].available).toBe(false);
  });

  test('token limits are positive numbers', () => {
    for (const preset of Object.values(OUTPUT_PRESETS)) {
      expect(preset.maxTokens).toBeGreaterThan(0);
      expect(preset.contextLimit).toBeGreaterThan(0);
    }
  });
});
