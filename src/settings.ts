import { App, PluginSettingTab, Setting } from 'obsidian';
import type ContextPackPlugin from './main';
import type { ReplacementRule } from './formatter';
import type { OutputTarget, PromptProfile, OutputSelectorState } from './types';
import { MODES, DEFAULT_OUTPUT_SELECTOR_STATE } from './types';
import { FolderPickerModal } from './folder-picker';
import { t } from './i18n';
import type { PackRecord, FreshnessSettings } from './freshness/types';
import { DEFAULT_FRESHNESS_SETTINGS } from './freshness/types';

function selectorStateToKey(state: OutputSelectorState): string {
  const { activeTab, chatgptMode, claudeMode, geminiMode, agentMode } = state;
  if (activeTab === 'chatgpt') return `chatgpt-${chatgptMode}`;
  if (activeTab === 'claude')  return `claude-${claudeMode}`;
  if (activeTab === 'gemini')  return `gemini-${geminiMode}`;
  return `agents-${agentMode}`;
}

function selectorStateFromKey(key: string): OutputSelectorState {
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


export interface AIBriefSettings {
  includeExecutiveSummary: boolean;
  includeKeyTopics: boolean;
  includeKnowledgeMap: boolean;
  includeRelationshipMap: boolean;
  includeSimilarNotes: boolean;
  includeKnowledgeHealth: boolean;
  includeOpenQuestions: boolean;
  includeSuggestedPrompts: boolean;
  enableMermaid: boolean;
  maxTopics: number;
  similarityThreshold: number;
}

export const DEFAULT_AI_BRIEF_SETTINGS: AIBriefSettings = {
  includeExecutiveSummary: true,
  includeKeyTopics: true,
  includeKnowledgeMap: true,
  includeRelationshipMap: true,
  includeSimilarNotes: true,
  includeKnowledgeHealth: true,
  includeOpenQuestions: true,
  includeSuggestedPrompts: true,
  enableMermaid: true,
  maxTopics: 10,
  similarityThreshold: 70,
};

export interface PluginSettings {
  targetFolder: string;
  outputFolder: string;
  flattenStructure: boolean;
  includeFrontmatterTitle: boolean;
  openAfterExport: boolean;
  contextPackOutputFolder: string;
  customRules: ReplacementRule[];
  dailyNotesAutoDetect: boolean;
  dailyNotesFolder: string;
  dailyNotesFormat: string;
  dailyNotesDefaultRange: string;
  dailyNotesExcludeTags: string;
  dailyNotesSortOrder: string;
  defaultOutputTarget: OutputTarget;
  showOutputModal: boolean;
  showTokenCount: boolean;
  warnOnTokenLimit: boolean;
  openAiUrl: boolean;
  includeStarterPrompt: boolean;
  starterPrompt: string;
  promptProfiles: PromptProfile[];
  defaultMode: string;
  outputSelectorState: OutputSelectorState;
  packRegistry: PackRecord[];
  freshnessSettings: FreshnessSettings;
  freshnessViewDark: boolean;
  freshnessAutoCheck: boolean;
  aiBriefSettings: AIBriefSettings;
}

export const DEFAULT_SETTINGS: PluginSettings = {
  targetFolder: '',
  outputFolder: '',
  flattenStructure: false,
  includeFrontmatterTitle: true,
  openAfterExport: false,
  contextPackOutputFolder: '',
  customRules: [],
  dailyNotesAutoDetect: true,
  dailyNotesFolder: '',
  dailyNotesFormat: 'YYYY-MM-DD',
  dailyNotesDefaultRange: 'week',
  dailyNotesExcludeTags: '',
  dailyNotesSortOrder: 'asc',
  defaultOutputTarget: 'notebooklm-text',
  showOutputModal: true,
  showTokenCount: true,
  warnOnTokenLimit: true,
  openAiUrl: false,
  includeStarterPrompt: true,
  starterPrompt: '',
  promptProfiles: [],
  defaultMode: 'none',
  outputSelectorState: DEFAULT_OUTPUT_SELECTOR_STATE,
  packRegistry: [],
  freshnessSettings: DEFAULT_FRESHNESS_SETTINGS,
  freshnessViewDark: true,
  freshnessAutoCheck: false,
  aiBriefSettings: DEFAULT_AI_BRIEF_SETTINGS,
};

export class SettingsTab extends PluginSettingTab {
  plugin: ContextPackPlugin;

  constructor(app: App, plugin: ContextPackPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    this.renderSettings();
  }

  private renderSettings(): void {
    const { containerEl } = this;
    containerEl.empty();

    new Setting(containerEl)
      .setName(t('setting_target_folder'))
      .setDesc(t('setting_target_folder_desc'))
      .addText(text => text
        .setPlaceholder('e.g. Notes')
        .setValue(this.plugin.settings.targetFolder)
        .onChange(async value => {
          this.plugin.settings.targetFolder = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName(t('setting_output_folder'))
      .setDesc(t('setting_output_folder_desc'))
      .addText(text => text
        .setPlaceholder('e.g. Exports')
        .setValue(this.plugin.settings.outputFolder)
        .onChange(async value => {
          this.plugin.settings.outputFolder = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName(t('setting_flatten'))
      .setDesc(t('setting_flatten_desc'))
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.flattenStructure)
        .onChange(async value => {
          this.plugin.settings.flattenStructure = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName(t('setting_include_title'))
      .setDesc(t('setting_include_title_desc'))
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.includeFrontmatterTitle)
        .onChange(async value => {
          this.plugin.settings.includeFrontmatterTitle = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName(t('setting_open_after'))
      .setDesc(t('setting_open_after_desc'))
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.openAfterExport)
        .onChange(async value => {
          this.plugin.settings.openAfterExport = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName(t('setting_pack_output'))
      .setDesc(t('setting_pack_output_desc'))
      .addText(text => text
        .setPlaceholder('e.g. ContextPacks')
        .setValue(this.plugin.settings.contextPackOutputFolder)
        .onChange(async value => {
          this.plugin.settings.contextPackOutputFolder = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl).setName(t('setting_daily_section')).setHeading();

    let folderSetting: Setting;
    let formatSetting: Setting;

    new Setting(containerEl)
      .setName(t('setting_daily_auto'))
      .setDesc(t('setting_daily_auto_desc'))
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.dailyNotesAutoDetect)
        .onChange(async value => {
          this.plugin.settings.dailyNotesAutoDetect = value;
          await this.plugin.saveSettings();
          folderSetting.setDisabled(value);
          formatSetting.setDisabled(value);
        }));

    folderSetting = new Setting(containerEl)
      .setName(t('setting_daily_folder'))
      .setDisabled(this.plugin.settings.dailyNotesAutoDetect)
      .addText(text => {
        text.setPlaceholder('Daily Notes')
          .setValue(this.plugin.settings.dailyNotesFolder)
          .onChange(async value => {
            this.plugin.settings.dailyNotesFolder = value;
            await this.plugin.saveSettings();
          });
      })
      .addButton(btn => btn
        .setIcon('folder')
        .setTooltip(t('daily_folder_label'))
        .onClick(() => {
          new FolderPickerModal(this.app, t('daily_folder_picker'), (folder) => {
            this.plugin.settings.dailyNotesFolder = folder;
            this.plugin.settings.dailyNotesAutoDetect = false;
            void this.plugin.saveSettings().then(() => this.renderSettings());
          }).open();
        }));

    formatSetting = new Setting(containerEl)
      .setName(t('setting_daily_format'))
      .setDesc(t('setting_daily_format_desc'))
      .setDisabled(this.plugin.settings.dailyNotesAutoDetect)
      .addText(text => text
        .setPlaceholder('YYYY-MM-DD')
        .setValue(this.plugin.settings.dailyNotesFormat)
        .onChange(async value => {
          this.plugin.settings.dailyNotesFormat = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName(t('setting_daily_range'))
      .addDropdown(drop => drop
        .addOption('this-week', t('daily_preset_this_week'))
        .addOption('last-week', t('daily_preset_last_week'))
        .addOption('week',      t('daily_preset_7'))
        .addOption('2weeks',    t('daily_preset_14'))
        .addOption('month',     t('daily_preset_30'))
        .setValue(this.plugin.settings.dailyNotesDefaultRange)
        .onChange(async value => {
          this.plugin.settings.dailyNotesDefaultRange = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName(t('setting_daily_exclude'))
      .setDesc(t('setting_daily_exclude_desc'))
      .addText(text => text
        .setPlaceholder('#private, #todo')
        .setValue(this.plugin.settings.dailyNotesExcludeTags)
        .onChange(async value => {
          this.plugin.settings.dailyNotesExcludeTags = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName(t('setting_daily_sort'))
      .addDropdown(drop => drop
        .addOption('asc',  t('setting_daily_sort_asc'))
        .addOption('desc', t('setting_daily_sort_desc'))
        .setValue(this.plugin.settings.dailyNotesSortOrder)
        .onChange(async value => {
          this.plugin.settings.dailyNotesSortOrder = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl).setName(t('setting_output_section')).setHeading();

    new Setting(containerEl)
      .setName(t('setting_show_modal'))
      .setDesc(t('setting_show_modal_desc'))
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.showOutputModal)
        .onChange(async value => {
          this.plugin.settings.showOutputModal = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName(t('setting_default_target'))
      .setDesc(t('setting_default_target_desc'))
      .addDropdown(drop => {
        drop.addOption('chatgpt-chat',      `${t('tab.chatgpt')} — ${t('mode.chat')}`);
        drop.addOption('chatgpt-projects',  `${t('tab.chatgpt')} — ${t('mode.projects')}`);
        drop.addOption('claude-chat',       `${t('tab.claude')} — ${t('mode.chat')}`);
        drop.addOption('claude-project',    `${t('tab.claude')} — ${t('mode.project')}`);
        drop.addOption('gemini-chat',       `${t('tab.gemini')} — ${t('mode.chat')}`);
        drop.addOption('gemini-notebook',   `${t('tab.gemini')} — ${t('mode.notebook')}`);
        drop.addOption('agents-claudecode', t('mode.claudecode'));
        drop.addOption('agents-notebooklm', t('mode.notebooklm'));
        drop.setValue(selectorStateToKey(this.plugin.settings.outputSelectorState));
        drop.onChange(async value => {
          this.plugin.settings.outputSelectorState = selectorStateFromKey(value);
          await this.plugin.saveSettings();
        });
      });

    new Setting(containerEl)
      .setName(t('setting_default_mode'))
      .setDesc(t('setting_default_mode_desc'))
      .addDropdown(drop => {
        for (const mode of MODES) {
          drop.addOption(mode.id, t(mode.nameKey));
        }
        drop.setValue(this.plugin.settings.defaultMode);
        drop.onChange(async value => {
          this.plugin.settings.defaultMode = value;
          await this.plugin.saveSettings();
        });
      });

    new Setting(containerEl)
      .setName(t('setting_show_tokens'))
      .setDesc(t('setting_show_tokens_desc'))
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.showTokenCount)
        .onChange(async value => {
          this.plugin.settings.showTokenCount = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName(t('setting_warn_tokens'))
      .setDesc(t('setting_warn_tokens_desc'))
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.warnOnTokenLimit)
        .onChange(async value => {
          this.plugin.settings.warnOnTokenLimit = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName(t('setting_open_url'))
      .setDesc(t('setting_open_url_desc'))
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.openAiUrl)
        .onChange(async value => {
          this.plugin.settings.openAiUrl = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName(t('setting_common_instructions_toggle'))
      .setDesc(t('setting_common_instructions_toggle_desc'))
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.includeStarterPrompt)
        .onChange(async value => {
          this.plugin.settings.includeStarterPrompt = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName(t('setting_common_instructions'))
      .setDesc(t('setting_common_instructions_desc'))
      .addButton(btn => btn
        .setButtonText(t('setting_common_instructions_reset'))
        .onClick(async () => {
          this.plugin.settings.starterPrompt = '';
          await this.plugin.saveSettings();
          promptArea.value = t('default_common_instructions');
        }));

    const promptArea = containerEl.createEl('textarea', { cls: 'cp-starter-prompt-area' });
    promptArea.value = this.plugin.settings.starterPrompt || t('default_common_instructions');
    promptArea.rows = 5;
    promptArea.addEventListener('change', () => {
      this.plugin.settings.starterPrompt = promptArea.value;
      void this.plugin.saveSettings();
    });

    new Setting(containerEl).setName(t('setting_freshness_section')).setHeading();

    new Setting(containerEl)
      .setName(t('setting_freshness_auto_check'))
      .setDesc(t('setting_freshness_auto_check_desc'))
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.freshnessAutoCheck)
        .onChange(async value => {
          this.plugin.settings.freshnessAutoCheck = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl).setName(t('setting_ai_brief_section')).setHeading();

    new Setting(containerEl)
      .setName(t('setting_ai_brief_mermaid'))
      .setDesc(t('setting_ai_brief_mermaid_desc'))
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.aiBriefSettings.enableMermaid)
        .onChange(async value => {
          this.plugin.settings.aiBriefSettings.enableMermaid = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName(t('setting_ai_brief_max_topics'))
      .setDesc(t('setting_ai_brief_max_topics_desc'))
      .addSlider(slider => slider
        .setLimits(5, 20, 1)
        .setValue(this.plugin.settings.aiBriefSettings.maxTopics)
        .onChange(async value => {
          this.plugin.settings.aiBriefSettings.maxTopics = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName(t('setting_ai_brief_similarity'))
      .setDesc(t('setting_ai_brief_similarity_desc'))
      .addSlider(slider => slider
        .setLimits(50, 95, 5)
        .setValue(this.plugin.settings.aiBriefSettings.similarityThreshold)
        .onChange(async value => {
          this.plugin.settings.aiBriefSettings.similarityThreshold = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl).setName('Custom replacement rules').setHeading();

    for (let i = 0; i < this.plugin.settings.customRules.length; i++) {
      this.renderRuleRow(containerEl, i);
    }

    new Setting(containerEl)
      .addButton(btn => btn
        .setButtonText('+ Add rule')
        .onClick(async () => {
          this.plugin.settings.customRules.push({ find: '', replace: '', useRegex: false, enabled: true });
          await this.plugin.saveSettings();
          this.renderSettings();
        }));
  }

  private renderRuleRow(containerEl: HTMLElement, i: number): void {
    const rule = this.plugin.settings.customRules[i];
    const setting = new Setting(containerEl)
      .addText(text => text
        .setPlaceholder('Find')
        .setValue(rule.find)
        .onChange(async value => {
          this.plugin.settings.customRules[i].find = value;
          await this.plugin.saveSettings();
        }))
      .addText(text => text
        .setPlaceholder('Replace')
        .setValue(rule.replace)
        .onChange(async value => {
          this.plugin.settings.customRules[i].replace = value;
          await this.plugin.saveSettings();
        }))
      .addToggle(toggle => toggle
        .setTooltip('Use regex')
        .setValue(rule.useRegex)
        .onChange(async value => {
          this.plugin.settings.customRules[i].useRegex = value;
          await this.plugin.saveSettings();
        }))
      .addToggle(toggle => toggle
        .setTooltip('Enabled')
        .setValue(rule.enabled)
        .onChange(async value => {
          this.plugin.settings.customRules[i].enabled = value;
          await this.plugin.saveSettings();
        }))
      .addButton(btn => btn
        .setIcon('trash')
        .setTooltip('Remove')
        .onClick(async () => {
          this.plugin.settings.customRules.splice(i, 1);
          await this.plugin.saveSettings();
          this.renderSettings();
        }));

    setting.nameEl.setText(`Rule ${i + 1}`);
  }
}
