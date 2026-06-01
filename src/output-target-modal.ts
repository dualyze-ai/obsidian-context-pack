import { App, Modal } from 'obsidian';
import { OUTPUT_PRESETS, type OutputTarget, type OutputPreset } from './types';
import { estimateTokens, getTokenWarning } from './token-counter';
import type { PluginSettings } from './settings';
import { t } from './i18n';

export interface OutputChoice {
  target: OutputTarget;
  copyToClipboard: boolean;
  saveToFile: boolean;
  includeStarterPrompt: boolean;
}

export class OutputTargetModal extends Modal {
  private selected: OutputTarget;
  private doCopy: boolean;
  private doFile: boolean;
  private doPrompt: boolean;
  private tokenCount: number;
  private previewEl!: HTMLElement;
  private methodEl!: HTMLElement;

  constructor(
    app: App,
    private content: string,
    private settings: PluginSettings,
    private onSubmit: (choice: OutputChoice) => Promise<void>
  ) {
    super(app);
    this.selected = settings.defaultOutputTarget !== 'notebooklm-zip'
      ? settings.defaultOutputTarget
      : 'notebooklm-text';
    this.tokenCount = estimateTokens(content);
    const preset = OUTPUT_PRESETS[this.selected];
    this.doCopy = preset.copyToClipboard;
    this.doFile = preset.saveToFile;
    this.doPrompt = settings.includeStarterPrompt;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    this.setTitle(t('modal_select_target'));

    const presetsEl = contentEl.createEl('div', { cls: 'cp-output-presets' });

    for (const preset of Object.values(OUTPUT_PRESETS)) {
      if (preset.target === 'notebooklm-zip') continue;
      this.renderPresetBtn(presetsEl, preset);
    }

    this.previewEl = contentEl.createEl('div', { cls: 'cp-output-preview' });
    this.methodEl = contentEl.createEl('div', { cls: 'cp-output-method' });
    this.updatePreview();

    const footerEl = contentEl.createEl('div', { cls: 'cp-output-footer' });
    footerEl.createEl('button', { text: t('btn_cancel'), cls: 'cp-output-cancel' })
      .addEventListener('click', () => this.close());

    const exportBtn = footerEl.createEl('button', { text: t('modal_btn_export'), cls: 'cp-output-submit mod-cta' });
    exportBtn.addEventListener('click', async () => {
      this.close();
      await this.onSubmit({
        target: this.selected,
        copyToClipboard: this.doCopy,
        saveToFile: this.doFile,
        includeStarterPrompt: this.doPrompt,
      });
    });
  }

  onClose() {
    this.contentEl.empty();
  }

  private renderPresetBtn(container: HTMLElement, preset: OutputPreset) {
    const btn = container.createEl('div', {
      cls: `cp-output-preset-btn${!preset.available ? ' cp-output-disabled' : ''}${preset.target === this.selected ? ' cp-output-preset-active' : ''}`,
    });
    btn.createEl('span', { cls: 'cp-output-preset-label', text: preset.label });
    btn.createEl('span', { cls: 'cp-output-preset-desc', text: preset.available ? preset.description : t('modal_coming_soon') });

    if (!preset.available) return;

    btn.addEventListener('click', () => {
      container.findAll('.cp-output-preset-btn').forEach(b => b.removeClass('cp-output-preset-active'));
      btn.addClass('cp-output-preset-active');
      this.selected = preset.target;
      this.doCopy = preset.copyToClipboard;
      this.doFile = preset.saveToFile;
      this.updatePreview();
    });
  }

  private updatePreview() {
    const preset = OUTPUT_PRESETS[this.selected];
    this.previewEl.empty();
    this.methodEl.empty();

    if (this.settings.showTokenCount) {
      const tokenEl = this.previewEl.createEl('div', { cls: 'cp-output-tokens' });
      tokenEl.setText(t('modal_token_estimated', this.tokenCount));

      if (this.settings.warnOnTokenLimit) {
        const warning = getTokenWarning(this.tokenCount, preset);
        if (warning) {
          this.previewEl.createEl('div', { cls: 'cp-output-warning', text: warning });
        }
      }
    }

    if (preset.copyToClipboard || preset.saveToFile) {
      this.methodEl.createEl('div', { cls: 'cp-output-method-label', text: t('modal_method_label') });

      if (preset.copyToClipboard) {
        this.renderCheckbox(this.methodEl, t('modal_method_clipboard'), this.doCopy, val => { this.doCopy = val; });
      }
      if (preset.saveToFile) {
        this.renderCheckbox(this.methodEl, t('modal_method_file'), this.doFile, val => { this.doFile = val; });
      }
    }

    this.renderCheckbox(this.methodEl, t('modal_include_prompt'), this.doPrompt, val => { this.doPrompt = val; });
  }

  private renderCheckbox(container: HTMLElement, label: string, checked: boolean, onChange: (val: boolean) => void) {
    const row = container.createEl('label', { cls: 'cp-output-check-row' });
    const input = row.createEl('input');
    input.type = 'checkbox';
    input.checked = checked;
    input.addEventListener('change', () => onChange(input.checked));
    row.createEl('span', { text: label });
  }
}
