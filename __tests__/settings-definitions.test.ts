import type { SettingDefinitionItem } from 'obsidian';
import { DEFAULT_SETTINGS } from '../src/settings';
import type { PluginSettings } from '../src/settings';
import {
  OUTPUT_TARGET_KEY,
  buildSettingDefinitions,
  readSetting,
  selectorStateFromKey,
  selectorStateToKey,
  writeSetting,
} from '../src/settings-definitions';

// t() reads the UI language from window.moment
(global as unknown as { window: unknown }).window = {};

function freshSettings(): PluginSettings {
  return JSON.parse(JSON.stringify(DEFAULT_SETTINGS)) as PluginSettings;
}

const renderers = {
  renderDailyFolder: () => undefined,
  renderDailyFormat: () => undefined,
  renderStarterPrompt: () => undefined,
  renderRule: () => undefined,
  ruleCount: () => 2,
  addRule: () => undefined,
  deleteRule: () => undefined,
};

function collectControls(items: SettingDefinitionItem[]) {
  const controls: { key: string; type: string; options?: Record<string, string> }[] = [];
  for (const item of items) {
    if ('items' in item && item.items) {
      controls.push(...collectControls(item.items as SettingDefinitionItem[]));
    } else if ('control' in item && item.control) {
      const c = item.control;
      controls.push({ key: c.key, type: c.type, options: 'options' in c ? c.options : undefined });
    }
  }
  return controls;
}

describe('buildSettingDefinitions', () => {
  const definitions = buildSettingDefinitions(renderers);
  const controls = collectControls(definitions);

  it('every control key resolves to a value in the default settings', () => {
    const settings = freshSettings();
    for (const { key } of controls) {
      expect(readSetting(settings, key)).not.toBeUndefined();
    }
  });

  it('the default output target and default mode are valid dropdown options', () => {
    const settings = freshSettings();
    for (const key of [OUTPUT_TARGET_KEY, 'defaultMode']) {
      const control = controls.find(c => c.key === key);
      expect(control?.options).toBeDefined();
      expect(Object.keys(control?.options ?? {})).toContain(readSetting(settings, key));
    }
  });

  it('builds one list row per custom rule', () => {
    const list = definitions.find(d => 'type' in d && d.type === 'list');
    expect(list && 'items' in list ? list.items?.length : -1).toBe(2);
  });
});

describe('readSetting / writeSetting', () => {
  it('reads and writes nested keys', () => {
    const s = freshSettings();
    expect(readSetting(s, 'aiBriefSettings.maxTopics')).toBe(10);
    writeSetting(s, 'aiBriefSettings.maxTopics', 15);
    expect(s.aiBriefSettings.maxTopics).toBe(15);
  });

  it('writes plain keys', () => {
    const s = freshSettings();
    writeSetting(s, 'targetFolder', 'Notes');
    writeSetting(s, 'flattenStructure', true);
    expect(s.targetFolder).toBe('Notes');
    expect(s.flattenStructure).toBe(true);
  });

  it('ignores unknown nested paths without throwing', () => {
    const s = freshSettings();
    expect(() => writeSetting(s, 'nope.deep.key', 1)).not.toThrow();
    expect(readSetting(s, 'nope.deep.key')).toBeUndefined();
  });

  it('round-trips the output target through the selector state', () => {
    const s = freshSettings();
    for (const key of [
      'chatgpt-chat', 'chatgpt-projects', 'claude-chat', 'claude-project',
      'gemini-chat', 'gemini-notebook', 'agents-claudecode', 'agents-notebooklm',
    ]) {
      writeSetting(s, OUTPUT_TARGET_KEY, key);
      expect(readSetting(s, OUTPUT_TARGET_KEY)).toBe(key);
      expect(selectorStateToKey(selectorStateFromKey(key))).toBe(key);
    }
  });
});
