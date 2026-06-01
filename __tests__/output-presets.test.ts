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
      expect(typeof preset.supportsStarterPrompt).toBe('boolean');
    }
  });

  test('contextLimit >= maxTokens for all presets', () => {
    for (const preset of Object.values(OUTPUT_PRESETS)) {
      expect(preset.contextLimit).toBeGreaterThanOrEqual(preset.maxTokens);
    }
  });

  test('token limits are positive numbers', () => {
    for (const preset of Object.values(OUTPUT_PRESETS)) {
      expect(preset.maxTokens).toBeGreaterThan(0);
      expect(preset.contextLimit).toBeGreaterThan(0);
    }
  });

  // --- available ---

  test('notebooklm, chatgpt, claude, gemini, claude-code are available', () => {
    expect(OUTPUT_PRESETS['notebooklm-zip'].available).toBe(true);
    expect(OUTPUT_PRESETS['notebooklm-text'].available).toBe(true);
    expect(OUTPUT_PRESETS['chatgpt'].available).toBe(true);
    expect(OUTPUT_PRESETS['claude'].available).toBe(true);
    expect(OUTPUT_PRESETS['gemini'].available).toBe(true);
    expect(OUTPUT_PRESETS['claude-code'].available).toBe(true);
  });

  test('custom is not yet available', () => {
    expect(OUTPUT_PRESETS['custom'].available).toBe(false);
  });

  // --- clipboard / file ---

  test('notebooklm presets do not copy to clipboard', () => {
    expect(OUTPUT_PRESETS['notebooklm-zip'].copyToClipboard).toBe(false);
    expect(OUTPUT_PRESETS['notebooklm-text'].copyToClipboard).toBe(false);
  });

  test('chatgpt, claude, gemini, claude-code copy to clipboard', () => {
    expect(OUTPUT_PRESETS['chatgpt'].copyToClipboard).toBe(true);
    expect(OUTPUT_PRESETS['claude'].copyToClipboard).toBe(true);
    expect(OUTPUT_PRESETS['gemini'].copyToClipboard).toBe(true);
    expect(OUTPUT_PRESETS['claude-code'].copyToClipboard).toBe(true);
  });

  // --- aiUrl ---

  test('chatgpt, claude, gemini, claude-code have valid aiUrl', () => {
    for (const target of ['chatgpt', 'claude', 'gemini', 'claude-code'] as OutputTarget[]) {
      const url = OUTPUT_PRESETS[target].aiUrl;
      expect(url).toBeDefined();
      expect(url).toMatch(/^https:\/\//);
    }
  });

  test('notebooklm presets have no aiUrl', () => {
    expect(OUTPUT_PRESETS['notebooklm-zip'].aiUrl).toBeUndefined();
    expect(OUTPUT_PRESETS['notebooklm-text'].aiUrl).toBeUndefined();
  });

  // --- supportsStarterPrompt ---

  test('claude-code does not support starter prompt', () => {
    expect(OUTPUT_PRESETS['claude-code'].supportsStarterPrompt).toBe(false);
  });

  test('chatgpt, claude, gemini support starter prompt', () => {
    expect(OUTPUT_PRESETS['chatgpt'].supportsStarterPrompt).toBe(true);
    expect(OUTPUT_PRESETS['claude'].supportsStarterPrompt).toBe(true);
    expect(OUTPUT_PRESETS['gemini'].supportsStarterPrompt).toBe(true);
  });

  test('notebooklm presets support starter prompt', () => {
    expect(OUTPUT_PRESETS['notebooklm-zip'].supportsStarterPrompt).toBe(true);
    expect(OUTPUT_PRESETS['notebooklm-text'].supportsStarterPrompt).toBe(true);
  });

  // --- context limits ---

  test('gemini has the largest context limit', () => {
    const limits = Object.values(OUTPUT_PRESETS).map(p => p.contextLimit);
    expect(OUTPUT_PRESETS['gemini'].contextLimit).toBe(Math.max(...limits));
  });
});
