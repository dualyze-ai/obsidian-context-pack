import type { Setting, SettingDefinitionItem } from 'obsidian';
import type { PluginSettings } from './settings';
import type { OutputSelectorState } from './types';
import { MODES, DEFAULT_OUTPUT_SELECTOR_STATE } from './types';
import { t } from './i18n';

export function selectorStateToKey(state: OutputSelectorState): string {
  const { activeTab, chatgptMode, claudeMode, geminiMode, agentMode } = state;
  if (activeTab === 'chatgpt') return `chatgpt-${chatgptMode}`;
  if (activeTab === 'claude')  return `claude-${claudeMode}`;
  if (activeTab === 'gemini')  return `gemini-${geminiMode}`;
  return `agents-${agentMode}`;
}

export function selectorStateFromKey(key: string): OutputSelectorState {
  const state = { ...DEFAULT_OUTPUT_SELECTOR_STATE };
  switch (key) {
    case 'chatgpt-chat':      state.activeTab = 'chatgpt'; state.chatgptMode = 'chat'; break;
    case 'chatgpt-projects':  state.activeTab = 'chatgpt'; state.chatgptMode = 'projects'; break;
    case 'claude-chat':       state.activeTab = 'claude';  state.claudeMode  = 'chat'; break;
    case 'claude-project':    state.activeTab = 'claude';  state.claudeMode  = 'project'; break;
    case 'gemini-chat':       state.activeTab = 'gemini';  state.geminiMode  = 'chat'; break;
    case 'gemini-notebook':   state.activeTab = 'gemini';  state.geminiMode  = 'notebook'; break;
    case 'agents-claudecode': state.activeTab = 'agents';  state.agentMode   = 'claudecode'; break;
    case 'agents-notebooklm': state.activeTab = 'agents';  state.agentMode   = 'notebooklm'; break;
  }
  return state;
}

/** Pseudo key for the combined "default output target" dropdown (stored as outputSelectorState). */
export const OUTPUT_TARGET_KEY = 'outputTarget';

type Container = Record<string, unknown>;

export function readSetting(settings: PluginSettings, key: string): unknown {
  if (key === OUTPUT_TARGET_KEY) return selectorStateToKey(settings.outputSelectorState);
  let current: unknown = settings;
  for (const part of key.split('.')) {
    if (current === null || typeof current !== 'object') return undefined;
    current = (current as Container)[part];
  }
  return current;
}

export function writeSetting(settings: PluginSettings, key: string, value: unknown): void {
  if (key === OUTPUT_TARGET_KEY) {
    settings.outputSelectorState = selectorStateFromKey(String(value));
    return;
  }
  const parts = key.split('.');
  const last = parts.pop();
  if (!last) return;
  let target: unknown = settings;
  for (const part of parts) {
    if (target === null || typeof target !== 'object') return;
    target = (target as Container)[part];
  }
  if (target === null || typeof target !== 'object') return;
  (target as Container)[last] = value;
}

export interface SettingRenderers {
  isDailyAutoDetect: () => boolean;
  renderDailyFolder: (setting: Setting) => void | (() => void);
  renderStarterPrompt: (setting: Setting) => void | (() => void);
  renderRule: (setting: Setting, index: number) => void | (() => void);
  ruleCount: () => number;
  addRule: () => void;
  deleteRule: (index: number) => void;
}

export function buildSettingDefinitions(r: SettingRenderers): SettingDefinitionItem[] {
  const outputTargets: Record<string, string> = {
    'chatgpt-chat':      `${t('tab.chatgpt')} — ${t('mode.chat')}`,
    'chatgpt-projects':  `${t('tab.chatgpt')} — ${t('mode.projects')}`,
    'claude-chat':       `${t('tab.claude')} — ${t('mode.chat')}`,
    'claude-project':    `${t('tab.claude')} — ${t('mode.project')}`,
    'gemini-chat':       `${t('tab.gemini')} — ${t('mode.chat')}`,
    'gemini-notebook':   `${t('tab.gemini')} — ${t('mode.notebook')}`,
    'agents-claudecode': t('mode.claudecode'),
    'agents-notebooklm': t('mode.notebooklm'),
  };
  const modes: Record<string, string> = {};
  for (const mode of MODES) modes[mode.id] = t(mode.nameKey);

  const ruleItems = Array.from({ length: r.ruleCount() }, (_, i) => ({
    name: `Rule ${i + 1}`,
    render: (setting: Setting) => r.renderRule(setting, i),
  }));

  return [
    {
      name: t('setting_target_folder'),
      desc: t('setting_target_folder_desc'),
      control: { type: 'text', key: 'targetFolder', placeholder: 'e.g. Notes' },
    },
    {
      name: t('setting_output_folder'),
      desc: t('setting_output_folder_desc'),
      control: { type: 'text', key: 'outputFolder', placeholder: 'e.g. Exports' },
    },
    {
      name: t('setting_flatten'),
      desc: t('setting_flatten_desc'),
      control: { type: 'toggle', key: 'flattenStructure' },
    },
    {
      name: t('setting_include_title'),
      desc: t('setting_include_title_desc'),
      control: { type: 'toggle', key: 'includeFrontmatterTitle' },
    },
    {
      name: t('setting_open_after'),
      desc: t('setting_open_after_desc'),
      control: { type: 'toggle', key: 'openAfterExport' },
    },
    {
      name: t('setting_pack_output'),
      desc: t('setting_pack_output_desc'),
      control: { type: 'text', key: 'contextPackOutputFolder', placeholder: 'e.g. ContextPacks' },
    },
    {
      type: 'group',
      heading: t('setting_daily_section'),
      items: [
        {
          name: t('setting_daily_auto'),
          desc: t('setting_daily_auto_desc'),
          control: { type: 'toggle', key: 'dailyNotesAutoDetect' },
        },
        { name: t('setting_daily_folder'), render: r.renderDailyFolder },
        {
          name: t('setting_daily_format'),
          desc: t('setting_daily_format_desc'),
          control: {
            type: 'text',
            key: 'dailyNotesFormat',
            placeholder: 'YYYY-MM-DD',
            disabled: r.isDailyAutoDetect,
          },
        },
        {
          name: t('setting_daily_range'),
          control: {
            type: 'dropdown',
            key: 'dailyNotesDefaultRange',
            options: {
              'this-week': t('daily_preset_this_week'),
              'last-week': t('daily_preset_last_week'),
              'week':      t('daily_preset_7'),
              '2weeks':    t('daily_preset_14'),
              'month':     t('daily_preset_30'),
            },
          },
        },
        {
          name: t('setting_daily_exclude'),
          desc: t('setting_daily_exclude_desc'),
          control: { type: 'text', key: 'dailyNotesExcludeTags', placeholder: '#private, #todo' },
        },
        {
          name: t('setting_daily_sort'),
          control: {
            type: 'dropdown',
            key: 'dailyNotesSortOrder',
            options: { asc: t('setting_daily_sort_asc'), desc: t('setting_daily_sort_desc') },
          },
        },
      ],
    },
    {
      type: 'group',
      heading: t('setting_output_section'),
      items: [
        {
          name: t('setting_show_modal'),
          desc: t('setting_show_modal_desc'),
          control: { type: 'toggle', key: 'showOutputModal' },
        },
        {
          name: t('setting_default_target'),
          desc: t('setting_default_target_desc'),
          control: { type: 'dropdown', key: OUTPUT_TARGET_KEY, options: outputTargets },
        },
        {
          name: t('setting_default_mode'),
          desc: t('setting_default_mode_desc'),
          control: { type: 'dropdown', key: 'defaultMode', options: modes },
        },
        {
          name: t('setting_show_tokens'),
          desc: t('setting_show_tokens_desc'),
          control: { type: 'toggle', key: 'showTokenCount' },
        },
        {
          name: t('setting_warn_tokens'),
          desc: t('setting_warn_tokens_desc'),
          control: { type: 'toggle', key: 'warnOnTokenLimit' },
        },
        {
          name: t('setting_open_url'),
          desc: t('setting_open_url_desc'),
          control: { type: 'toggle', key: 'openAiUrl' },
        },
        {
          name: t('setting_common_instructions_toggle'),
          desc: t('setting_common_instructions_toggle_desc'),
          control: { type: 'toggle', key: 'includeStarterPrompt' },
        },
        {
          name: t('setting_common_instructions'),
          desc: t('setting_common_instructions_desc'),
          render: r.renderStarterPrompt,
        },
      ],
    },
    {
      type: 'group',
      heading: t('setting_freshness_section'),
      items: [
        {
          name: t('setting_freshness_auto_check'),
          desc: t('setting_freshness_auto_check_desc'),
          control: { type: 'toggle', key: 'freshnessAutoCheck' },
        },
      ],
    },
    {
      type: 'group',
      heading: t('setting_ai_brief_section'),
      items: [
        {
          name: t('setting_ai_brief_mermaid'),
          desc: t('setting_ai_brief_mermaid_desc'),
          control: { type: 'toggle', key: 'aiBriefSettings.enableMermaid' },
        },
        {
          name: t('setting_ai_brief_max_topics'),
          desc: t('setting_ai_brief_max_topics_desc'),
          control: { type: 'slider', key: 'aiBriefSettings.maxTopics', min: 5, max: 20, step: 1 },
        },
        {
          name: t('setting_ai_brief_similarity'),
          desc: t('setting_ai_brief_similarity_desc'),
          control: { type: 'slider', key: 'aiBriefSettings.similarityThreshold', min: 50, max: 95, step: 5 },
        },
        {
          name: t('epub_sort_strategy'),
          control: {
            type: 'dropdown',
            key: 'epubSortStrategy',
            options: {
              'ai-brief': t('epub_sort_ai_brief'),
              'current':  t('epub_sort_current'),
              'title':    t('epub_sort_title'),
              'filename': t('epub_sort_filename'),
            },
          },
        },
      ],
    },
    {
      type: 'list',
      heading: 'Custom replacement rules',
      items: ruleItems,
      onDelete: r.deleteRule,
      addItem: { name: '+ Add rule', action: r.addRule },
    },
  ];
}
