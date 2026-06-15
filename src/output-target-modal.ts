import { App, Modal, Setting } from 'obsidian';
import {
  OUTPUT_PRESETS, MODES,
  getOutputTargetFromState,
  type OutputTarget, type OutputSelectorState, type OutputTab, type EpubExportOptions,
} from './types';
import { estimateTokens, getTokenWarning } from './token-counter';
import { getProjectKnowledgeInstructions } from './exporter';
import type { PluginSettings } from './settings';
import { t } from './i18n';

export interface OutputChoice {
  target: OutputTarget;
  selectorState: OutputSelectorState;
  copyToClipboard: boolean;
  saveToFile: boolean;
  includeStarterPrompt: boolean;
  openAiUrl: boolean;
  mode: string;
  epubOptions?: EpubExportOptions;
}

export class OutputTargetModal extends Modal {
  private state: OutputSelectorState;
  private doCopy: boolean;
  private doFile: boolean;
  private doPrompt: boolean;
  private doOpenUrl: boolean;
  private mode: string;
  private tokenCount: number;
  private epubState: EpubExportOptions;
  private previewEl!: HTMLElement;
  private methodEl!: HTMLElement;
  private radioEl!: HTMLElement;
  private modeContainerEl!: HTMLElement;
  private modeSelectEl!: HTMLSelectElement;
  private epubOptionsEl!: HTMLElement;
  private submitBtnEl!: HTMLButtonElement;

  constructor(
    app: App,
    private content: string,
    private settings: PluginSettings,
    private saveSettings: () => Promise<void>,
    private onSubmit: (choice: OutputChoice) => Promise<void>,
    private source = ''
  ) {
    super(app);
    this.state = { ...settings.outputSelectorState };
    this.tokenCount = estimateTokens(content);
    const preset = OUTPUT_PRESETS[getOutputTargetFromState(this.state)];
    this.doCopy = preset.copyToClipboard;
    this.doFile = preset.saveToFile;
    this.doPrompt = !this.isNotebookLM() && settings.includeStarterPrompt;
    this.doOpenUrl = !this.isNotebookLM() && settings.openAiUrl && !!preset.aiUrl;
    this.mode = settings.defaultMode ?? 'none';
    this.epubState = {
      bookTitle: source,
      includeBrief: true,
      includeToc: true,
      includeSourceNotes: true,
      stripFrontmatter: true,
      convertObsidianLinks: true,
    };
  }

  private isNotebookLM(): boolean {
    return this.state.activeTab === 'agents' && this.state.agentMode === 'notebooklm';
  }

  private isEpub(): boolean {
    return this.state.activeTab === 'epub';
  }

  onOpen() {
    this.modalEl.addClass('cp-output-modal');
    const { contentEl } = this;
    contentEl.empty();
    this.setTitle(t('modal_select_target'));

    const tabEl = contentEl.createEl('div', { cls: 'cp-output-tabs' });
    this.renderTabs(tabEl);

    this.radioEl = contentEl.createEl('div', { cls: 'cp-output-radios' });
    this.renderRadios();

    this.modeContainerEl = contentEl.createEl('div');
    this.renderModeSetting();

    this.previewEl = contentEl.createEl('div', { cls: 'cp-output-preview' });
    this.methodEl  = contentEl.createEl('div', { cls: 'cp-output-method' });
    this.epubOptionsEl = contentEl.createEl('div', { cls: 'cp-epub-options' });

    this.updatePreview();
    this.renderEpubOptions();

    const footerEl = contentEl.createEl('div', { cls: 'cp-output-footer' });
    footerEl.createEl('button', { text: t('btn_cancel'), cls: 'cp-output-cancel' })
      .addEventListener('click', () => this.close());

    this.submitBtnEl = footerEl.createEl('button', {
      text: this.isEpub() ? t('epub_btn_create') : t('modal_btn_export'),
      cls: 'cp-output-submit mod-cta',
    });
    this.submitBtnEl.addEventListener('click', () => { void this.handleSubmit(); });
  }

  onClose() {
    this.contentEl.empty();
  }

  private async handleSubmit(): Promise<void> {
    this.settings.outputSelectorState = { ...this.state };
    await this.saveSettings();
    try {
      await this.onSubmit({
        target: getOutputTargetFromState(this.state),
        selectorState: { ...this.state },
        copyToClipboard: this.doCopy,
        saveToFile: this.doFile,
        includeStarterPrompt: this.doPrompt,
        openAiUrl: this.doOpenUrl,
        mode: this.mode,
        epubOptions: this.isEpub() ? { ...this.epubState } : undefined,
      });
    } finally {
      this.close();
    }
  }

  private renderTabs(container: HTMLElement) {
    const tabs: { id: OutputTab; labelKey: string }[] = [
      { id: 'chatgpt', labelKey: 'tab.chatgpt' },
      { id: 'claude',  labelKey: 'tab.claude'  },
      { id: 'gemini',  labelKey: 'tab.gemini'  },
      { id: 'agents',  labelKey: 'tab.agents'  },
      { id: 'epub',    labelKey: 'tab.epub'    },
    ];
    for (const tab of tabs) {
      const btn = container.createEl('button', {
        cls: `cp-output-tab${this.state.activeTab === tab.id ? ' cp-output-tab-active' : ''}`,
        text: t(tab.labelKey),
      });
      btn.addEventListener('click', () => {
        this.state.activeTab = tab.id;
        container.findAll('.cp-output-tab').forEach(b => b.removeClass('cp-output-tab-active'));
        btn.addClass('cp-output-tab-active');
        this.onStateChange();
      });
    }
  }

  private renderRadios() {
    this.radioEl.empty();
    if (this.isEpub()) return;

    type RadioOpt = { value: string; labelKey: string };
    let options: RadioOpt[];
    let current: string;

    switch (this.state.activeTab) {
      case 'chatgpt':
        options = [{ value: 'chat', labelKey: 'mode.chat' }, { value: 'projects', labelKey: 'mode.projects' }];
        current = this.state.chatgptMode;
        break;
      case 'claude':
        options = [{ value: 'chat', labelKey: 'mode.chat' }, { value: 'project', labelKey: 'mode.project' }];
        current = this.state.claudeMode;
        break;
      case 'gemini':
        options = [{ value: 'chat', labelKey: 'mode.chat' }, { value: 'notebook', labelKey: 'mode.notebook' }];
        current = this.state.geminiMode;
        break;
      default:
        options = [{ value: 'claudecode', labelKey: 'mode.claudecode' }, { value: 'notebooklm', labelKey: 'mode.notebooklm' }];
        current = this.state.agentMode;
    }

    const group = this.radioEl.createEl('div', { cls: 'cp-output-radio-group' });
    for (const opt of options) {
      const label = group.createEl('label', { cls: 'cp-output-radio-row' });
      const input = label.createEl('input');
      input.type = 'radio';
      input.name = 'cp-tab-mode';
      input.value = opt.value;
      input.checked = opt.value === current;
      label.createEl('span', { text: t(opt.labelKey) });
      input.addEventListener('change', () => {
        if (!input.checked) return;
        this.applyTabMode(opt.value);
        this.onStateChange();
      });
    }
  }

  private applyTabMode(value: string) {
    switch (this.state.activeTab) {
      case 'chatgpt': this.state.chatgptMode = value as 'chat' | 'projects'; break;
      case 'claude':  this.state.claudeMode  = value as 'chat' | 'project';  break;
      case 'gemini':  this.state.geminiMode  = value as 'chat' | 'notebook'; break;
      default:        this.state.agentMode   = value as 'claudecode' | 'notebooklm'; break;
    }
  }

  private renderModeSetting() {
    this.modeContainerEl.empty();
    if (this.isEpub() || this.isNotebookLM()) return;

    new Setting(this.modeContainerEl)
      .setClass('cp-output-mode-setting')
      .setName(t('modal_mode_label'))
      .setDesc(t('modal_mode_desc'))
      .addDropdown(drop => {
        for (const m of MODES) drop.addOption(m.id, t(m.nameKey));
        drop.setValue(this.mode);
        drop.onChange(value => {
          this.mode = value;
          this.modeSelectEl = drop.selectEl;
          this.updatePreview();
        });
        this.modeSelectEl = drop.selectEl;
      });
  }

  private renderEpubOptions() {
    this.epubOptionsEl.empty();
    if (!this.isEpub()) return;

    const titleSetting = new Setting(this.epubOptionsEl)
      .setName(t('epub_book_title'))
      .addText(text => {
        text.setValue(this.epubState.bookTitle);
        text.onChange(v => { this.epubState.bookTitle = v; });
        text.inputEl.style.width = '100%';
      });
    titleSetting.settingEl.style.border = 'none';

    const checkboxDefs: { key: keyof EpubExportOptions; labelKey: string }[] = [
      { key: 'includeBrief',         labelKey: 'epub_include_brief' },
      { key: 'includeToc',           labelKey: 'epub_include_toc' },
      { key: 'includeSourceNotes',   labelKey: 'epub_include_notes' },
      { key: 'convertObsidianLinks', labelKey: 'epub_convert_links' },
      { key: 'stripFrontmatter',     labelKey: 'epub_strip_frontmatter' },
    ];

    for (const def of checkboxDefs) {
      this.renderCheckbox(
        this.epubOptionsEl,
        t(def.labelKey),
        this.epubState[def.key] as boolean,
        v => { (this.epubState[def.key] as boolean) = v; }
      );
    }
  }

  private onStateChange() {
    const isEpub = this.isEpub();
    if (!isEpub) {
      const isNlm = this.isNotebookLM();
      const preset = OUTPUT_PRESETS[getOutputTargetFromState(this.state)];
      this.doCopy    = preset.copyToClipboard;
      this.doFile    = preset.saveToFile;
      this.doPrompt  = !isNlm && this.settings.includeStarterPrompt;
      this.doOpenUrl = !isNlm && this.settings.openAiUrl && !!preset.aiUrl;
    }
    this.renderRadios();
    this.renderModeSetting();
    this.updatePreview();
    this.renderEpubOptions();
    if (this.submitBtnEl) {
      this.submitBtnEl.setText(isEpub ? t('epub_btn_create') : t('modal_btn_export'));
    }
  }

  private updatePreview() {
    const preset = OUTPUT_PRESETS[getOutputTargetFromState(this.state)];
    const isNlm = this.isNotebookLM();
    const isEpub = this.isEpub();
    this.previewEl.empty();
    this.methodEl.empty();

    if (isEpub) return;

    if (this.settings.showTokenCount) {
      const pk = getProjectKnowledgeInstructions(this.state);
      const displayTokens = this.tokenCount + (pk ? estimateTokens(pk) : 0);
      const infoEl = this.previewEl.createEl('div', { cls: 'cp-output-info' });
      infoEl.createEl('div', { cls: 'cp-output-info-tokens', text: t('modal_token_estimated', displayTokens) });
      if (this.settings.warnOnTokenLimit) {
        const warn = getTokenWarning(displayTokens, preset);
        if (warn) this.previewEl.createEl('div', { cls: 'cp-output-warning', text: warn });
      }
    }

    if (preset.copyToClipboard) {
      this.renderCheckbox(this.methodEl, t('modal_method_clipboard'), this.doCopy, v => { this.doCopy = v; });
    }
    if (preset.saveToFile) {
      const fileLabel = (this.doOpenUrl && !!preset.aiUrl) ? t('modal_method_file_vault') : t('modal_method_file');
      this.renderCheckbox(this.methodEl, fileLabel, this.doFile, v => { this.doFile = v; });
    }
    if (!!preset.aiUrl && !isNlm) {
      this.renderCheckbox(this.methodEl, t('modal_open_ai_url'), this.doOpenUrl, v => {
        this.doOpenUrl = v;
        this.updatePreview();
      });
    }
    if (!isNlm) {
      this.renderCheckbox(this.methodEl, t('modal_include_prompt'), this.doPrompt, v => { this.doPrompt = v; });
    }
  }

  private renderCheckbox(container: HTMLElement, label: string, checked: boolean, onChange: (v: boolean) => void) {
    const row = container.createEl('label', { cls: 'cp-output-check-row' });
    const input = row.createEl('input');
    input.type = 'checkbox';
    input.checked = checked;
    input.addEventListener('change', () => onChange(input.checked));
    row.createEl('span', { text: label });
  }
}
