import { App, PluginSettingTab, Setting } from 'obsidian';
import type ContextPackPlugin from './main';
import type { ReplacementRule } from './formatter';
import { t } from './i18n';

export interface PluginSettings {
  targetFolder: string;
  outputFolder: string;
  flattenStructure: boolean;
  includeFrontmatterTitle: boolean;
  openAfterExport: boolean;
  contextPackOutputFolder: string;
  customRules: ReplacementRule[];
}

export const DEFAULT_SETTINGS: PluginSettings = {
  targetFolder: '',
  outputFolder: '',
  flattenStructure: false,
  includeFrontmatterTitle: true,
  openAfterExport: false,
  contextPackOutputFolder: '',
  customRules: [],
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
