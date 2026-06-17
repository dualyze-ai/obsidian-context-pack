import { getOutputTargetFromState, OutputSelectorState } from '../types';

function makeState(overrides: Partial<OutputSelectorState> = {}): OutputSelectorState {
  return {
    activeTab: 'chatgpt',
    chatgptMode: 'chat',
    claudeMode: 'chat',
    geminiMode: 'chat',
    agentMode: 'claudecode',
    ...overrides,
  };
}

describe('getOutputTargetFromState', () => {
  test('chatgpt tab → chatgpt', () => {
    expect(getOutputTargetFromState(makeState({ activeTab: 'chatgpt' }))).toBe('chatgpt');
  });

  test('claude tab → claude', () => {
    expect(getOutputTargetFromState(makeState({ activeTab: 'claude' }))).toBe('claude');
  });

  test('gemini tab → gemini', () => {
    expect(getOutputTargetFromState(makeState({ activeTab: 'gemini' }))).toBe('gemini');
  });

  test('agents tab + claudecode mode → claude-code', () => {
    expect(getOutputTargetFromState(makeState({ activeTab: 'agents', agentMode: 'claudecode' }))).toBe('claude-code');
  });

  test('agents tab + notebooklm mode → notebooklm-text', () => {
    expect(getOutputTargetFromState(makeState({ activeTab: 'agents', agentMode: 'notebooklm' }))).toBe('notebooklm-text');
  });

  // Regression: invalid activeTab (e.g. "epub" stored in data.json) caused TypeError
  test('invalid activeTab falls back to chatgpt instead of returning undefined', () => {
    const state = makeState({ activeTab: 'epub' as OutputSelectorState['activeTab'] });
    const result = getOutputTargetFromState(state);
    expect(result).toBe('chatgpt');
    expect(result).not.toBeUndefined();
  });

  test('unknown activeTab never returns undefined', () => {
    const unknownValues = ['epub', 'notion', '', 'CHATGPT', null, undefined];
    for (const v of unknownValues) {
      const state = makeState({ activeTab: v as OutputSelectorState['activeTab'] });
      expect(getOutputTargetFromState(state)).toBeDefined();
    }
  });
});
