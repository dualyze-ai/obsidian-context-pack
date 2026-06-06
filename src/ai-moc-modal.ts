import { App, Modal, SuggestModal, Notice, TFile } from 'obsidian';
import { createAiMoc, type AiMocConfig } from './ai-moc';
import { t } from './i18n';

class FileSuggest extends SuggestModal<TFile> {
  constructor(
    app: App,
    private files: TFile[],
    private onChoose: (file: TFile) => void
  ) {
    super(app);
    this.setPlaceholder(t('ai_moc_note_placeholder'));
  }

  getSuggestions(query: string): TFile[] {
    const lower = query.toLowerCase();
    return this.files.filter(f => f.basename.toLowerCase().includes(lower));
  }

  renderSuggestion(file: TFile, el: HTMLElement): void {
    el.setText(file.basename);
  }

  onChooseSuggestion(file: TFile): void {
    this.onChoose(file);
  }
}

export class AiMocModal extends Modal {
  private selectedFile: TFile | undefined;
  private scope: 'direct' | 'related' = 'related';
  private includeBacklinksInMoc = true;
  private includeBacklinksInPack = false;
  private generateContextPack = true;
  private noteInput!: HTMLInputElement;

  constructor(
    app: App,
    private onPackRequested: (files: TFile[], source: string) => void,
    initialFile?: TFile,
    private outputFolder = ''
  ) {
    super(app);
    this.selectedFile = initialFile;
  }

  onOpen(): void {
    const { contentEl } = this;
    this.titleEl.setText(t('ai_moc_modal_title'));

    // Root Note
    const noteRow = contentEl.createDiv({ cls: 'setting-item' });
    noteRow.createDiv({ cls: 'setting-item-info' })
      .createDiv({ cls: 'setting-item-name', text: 'Root Note' });
    const noteControl = noteRow.createDiv({ cls: 'setting-item-control' });
    this.noteInput = noteControl.createEl('input', {
      cls: 'cp-moc-note-input',
      attr: { type: 'text', readonly: 'true', placeholder: t('ai_moc_note_placeholder') },
    });
    this.noteInput.value = this.selectedFile?.basename ?? '';
    this.noteInput.addEventListener('click', () => this.openFileSuggest());
    noteControl.createEl('button', { text: t('ai_moc_btn_select') })
      .addEventListener('click', () => this.openFileSuggest());

    // Scope
    const scopeRow = contentEl.createDiv({ cls: 'setting-item' });
    scopeRow.createDiv({ cls: 'setting-item-info' })
      .createDiv({ cls: 'setting-item-name', text: 'Scope' });
    const scopeControl = scopeRow.createDiv({ cls: 'setting-item-control cp-moc-column-control' });

    for (const [value, label] of [['direct', t('ai_moc_scope_direct')], ['related', t('ai_moc_scope_related')]] as const) {
      const lbl = scopeControl.createEl('label', { cls: 'cp-radio-label' });
      const radio = lbl.createEl('input', { attr: { type: 'radio', name: 'cp-moc-scope', value } });
      radio.checked = this.scope === value;
      radio.addEventListener('change', () => { if (radio.checked) this.scope = value; });
      lbl.appendText(` ${label}`);
    }

    // Backlinks
    const backlinkRow = contentEl.createDiv({ cls: 'setting-item' });
    const backlinkInfo = backlinkRow.createDiv({ cls: 'setting-item-info' });
    backlinkInfo.createDiv({ cls: 'setting-item-name', text: 'Backlinks' });
    backlinkInfo.createDiv({ cls: 'setting-item-description', text: t('ai_moc_backlinks_note') });
    const backlinkControl = backlinkRow.createDiv({ cls: 'setting-item-control cp-moc-column-control' });

    for (const [field, label, defaultVal] of [
      ['moc', t('ai_moc_backlinks_moc'), this.includeBacklinksInMoc],
      ['pack', t('ai_moc_backlinks_pack'), this.includeBacklinksInPack],
    ] as const) {
      const lbl = backlinkControl.createEl('label', { cls: 'cp-checkbox-label' });
      const cb = lbl.createEl('input', { attr: { type: 'checkbox' } });
      cb.checked = Boolean(defaultVal);
      cb.addEventListener('change', () => {
        if (field === 'moc') this.includeBacklinksInMoc = cb.checked;
        else this.includeBacklinksInPack = cb.checked;
      });
      lbl.appendText(` ${label}`);
    }

    // Context Pack generation
    const packRow = contentEl.createDiv({ cls: 'setting-item' });
    const packControl = packRow.createDiv({ cls: 'setting-item-control' });
    const packLabel = packControl.createEl('label', { cls: 'cp-checkbox-label' });
    const packCb = packLabel.createEl('input', { attr: { type: 'checkbox' } });
    packCb.checked = this.generateContextPack;
    packCb.addEventListener('change', () => { this.generateContextPack = packCb.checked; });
    packLabel.appendText(` ${t('ai_moc_generate_pack')}`);

    // Buttons
    const btnRow = contentEl.createDiv({ cls: 'modal-button-container' });
    btnRow.createEl('button', { text: t('ai_moc_btn_cancel') })
      .addEventListener('click', () => this.close());
    btnRow.createEl('button', { text: t('ai_moc_btn_create'), cls: 'mod-cta' })
      .addEventListener('click', () => { void this.handleCreate(); });
  }

  onClose(): void {
    this.contentEl.empty();
  }

  private openFileSuggest(): void {
    const files = this.app.vault.getMarkdownFiles()
      .sort((a, b) => a.basename.localeCompare(b.basename));
    new FileSuggest(this.app, files, (file) => {
      this.selectedFile = file;
      this.noteInput.value = file.basename;
    }).open();
  }

  private async handleCreate(): Promise<void> {
    if (!this.selectedFile) {
      new Notice(t('ai_moc_notice_select'));
      return;
    }

    const config: AiMocConfig = {
      rootFile: this.selectedFile,
      scope: this.scope,
      includeBacklinksInMoc: this.includeBacklinksInMoc,
      includeBacklinksInPack: this.includeBacklinksInPack,
      generateContextPack: this.generateContextPack,
      outputFolder: this.outputFolder,
    };

    new Notice(t('ai_moc_notice_creating'));

    try {
      const { packFiles } = await createAiMoc(this.app, config);
      const rootName = this.selectedFile.basename;
      new Notice(t('ai_moc_notice_moc_done', rootName));

      if (config.generateContextPack) {
        this.onPackRequested(packFiles, rootName);
      }

      this.close();
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      console.error('[AI Context Pack]', err);
      new Notice(t('notice_error'));
    }
  }
}
