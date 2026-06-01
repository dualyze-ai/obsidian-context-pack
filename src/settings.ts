import { App, PluginSettingTab, Setting } from 'obsidian';
import type ContextPackPlugin from './main';
import type { ReplacementRule } from './formatter';
import type { OutputTarget } from './types';
import { OUTPUT_PRESETS } from './types';
import { FolderPickerModal } from './folder-picker';
import { t } from './i18n';


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
};

export class SettingsTab extends PluginSettingTab {
  plugin: ContextPackPlugin;

  constructor(app: App, plugin: ContextPackPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
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

    containerEl.createEl('h3', { text: t('setting_daily_section') });

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
          new FolderPickerModal(this.app, t('daily_folder_picker'), async (folder) => {
            this.plugin.settings.dailyNotesFolder = folder;
            this.plugin.settings.dailyNotesAutoDetect = false;
            await this.plugin.saveSettings();
            this.display();
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

    containerEl.createEl('h3', { text: t('setting_output_section') });

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
        for (const preset of Object.values(OUTPUT_PRESETS)) {
          if (preset.target !== 'notebooklm-zip') {
            drop.addOption(preset.target, preset.label);
          }
        }
        drop.setValue(this.plugin.settings.defaultOutputTarget);
        drop.onChange(async value => {
          this.plugin.settings.defaultOutputTarget = value as OutputTarget;
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
      .setName(t('setting_starter_prompt_toggle'))
      .setDesc(t('setting_starter_prompt_toggle_desc'))
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.includeStarterPrompt)
        .onChange(async value => {
          this.plugin.settings.includeStarterPrompt = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName(t('setting_starter_prompt'))
      .setDesc(t('setting_starter_prompt_desc'));

    const promptArea = containerEl.createEl('textarea', { cls: 'cp-starter-prompt-area' });
    promptArea.value = this.plugin.settings.starterPrompt || t('default_starter_prompt');
    promptArea.rows = 5;
    promptArea.addEventListener('change', async () => {
      this.plugin.settings.starterPrompt = promptArea.value;
      await this.plugin.saveSettings();
    });

    containerEl.createEl('h3', { text: 'Custom replacement rules' });

    for (let i = 0; i < this.plugin.settings.customRules.length; i++) {
      this.renderRuleRow(containerEl, i);
    }

    new Setting(containerEl)
      .addButton(btn => btn
        .setButtonText('+ Add rule')
        .onClick(async () => {
          this.plugin.settings.customRules.push({ find: '', replace: '', useRegex: false, enabled: true });
          await this.plugin.saveSettings();
          this.display();
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
          this.display();
        }));

    setting.nameEl.setText(`Rule ${i + 1}`);
  }
}
