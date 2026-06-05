import { App, Modal, Setting, moment } from 'obsidian';
import { getDailyNotesSettings, getDailyNotes, getDateRange, type DailyNotesConfig } from './daily-notes';
import { FolderPickerModal } from './folder-picker';
import { t } from './i18n';
import type { PluginSettings } from './settings';

export interface DailyNotesModalResult {
  start: Date;
  end: Date;
  excludeTags: string;
  sortOrder: 'asc' | 'desc';
  preset: string;
  dnConfig: DailyNotesConfig;
}

export class DailyNotesModal extends Modal {
  private result: DailyNotesModalResult;
  private dnConfig: DailyNotesConfig;
  private previewEl!: HTMLElement;
  private customEl!: HTMLElement;
  private folderLabelEl!: HTMLElement;

  constructor(
    app: App,
    private settings: PluginSettings,
    private onSubmit: (result: DailyNotesModalResult) => void,
    private onSaveFolder?: (folder: string) => Promise<void>
  ) {
    super(app);
    const range = getDateRange(settings.dailyNotesDefaultRange);
    this.result = {
      preset: settings.dailyNotesDefaultRange,
      start: range.start,
      end: range.end,
      excludeTags: settings.dailyNotesExcludeTags,
      sortOrder: settings.dailyNotesSortOrder as 'asc' | 'desc',
      dnConfig: { folder: settings.dailyNotesFolder, format: settings.dailyNotesFormat },
    };
    this.dnConfig = { folder: settings.dailyNotesFolder, format: settings.dailyNotesFormat };
  }

  onOpen() {
    this.titleEl.setText(t('daily_modal_title'));
    const { contentEl } = this;

    const folderRow = contentEl.createDiv({ cls: 'cp-dn-folder-row' });
    this.folderLabelEl = folderRow.createSpan({ cls: 'cp-dn-folder-label' });
    this.updateFolderLabel();

    if (this.settings.dailyNotesAutoDetect) {
      getDailyNotesSettings(this.app).then(config => {
        this.dnConfig = config;
        this.updateFolderLabel();
        this.updatePreview();
      });
    }

    folderRow.createEl('button', { text: t('daily_folder_label'), cls: 'cp-dn-folder-btn' })
      .addEventListener('click', () => {
        new FolderPickerModal(this.app, t('daily_folder_picker'), (folder) => {
          this.dnConfig.folder = folder;
          this.updateFolderLabel();
          this.updatePreview();
          if (this.onSaveFolder) void this.onSaveFolder(folder);
        }).open();
      });

    const presets = [
      { label: t('daily_preset_this_week'), value: 'this-week' },
      { label: t('daily_preset_last_week'), value: 'last-week' },
      { label: t('daily_preset_7'),         value: 'week' },
      { label: t('daily_preset_14'),        value: '2weeks' },
      { label: t('daily_preset_30'),        value: 'month' },
      { label: t('daily_preset_custom'),    value: 'custom' },
    ];

    const btnGroup = contentEl.createDiv({ cls: 'cp-dn-presets' });
    for (const p of presets) {
      const btn = btnGroup.createEl('button', { text: p.label, cls: 'cp-dn-preset-btn' });
      if (this.result.preset === p.value) btn.addClass('active');
      btn.addEventListener('click', () => {
        btnGroup.querySelectorAll('.cp-dn-preset-btn').forEach(b => b.removeClass('active'));
        btn.addClass('active');
        this.result.preset = p.value;
        if (p.value !== 'custom') {
          const r = getDateRange(p.value);
          this.result.start = r.start;
          this.result.end = r.end;
          this.customEl.hide();
        } else {
          this.customEl.show();
        }
        this.updatePreview();
      });
    }

    this.customEl = contentEl.createDiv({ cls: 'cp-dn-custom' });
    this.customEl.toggle(this.result.preset === 'custom');

    new Setting(this.customEl)
      .setName(t('daily_start_date'))
      .addText(text => {
        text.inputEl.type = 'date';
        text.setValue(moment(this.result.start).format('YYYY-MM-DD'));
        text.onChange(v => {
          const d = new Date(v);
          if (!isNaN(d.getTime())) { this.result.start = d; this.updatePreview(); }
        });
      });

    new Setting(this.customEl)
      .setName(t('daily_end_date'))
      .addText(text => {
        text.inputEl.type = 'date';
        text.setValue(moment(this.result.end).format('YYYY-MM-DD'));
        text.onChange(v => {
          const d = new Date(v);
          if (!isNaN(d.getTime())) { this.result.end = d; this.updatePreview(); }
        });
      });

    new Setting(contentEl)
      .setName(t('daily_exclude_tags'))
      .addText(text => text
        .setPlaceholder('#private, #todo')
        .setValue(this.result.excludeTags)
        .onChange(v => { this.result.excludeTags = v; this.updatePreview(); }));

    this.previewEl = contentEl.createDiv({ cls: 'cp-dn-preview' });
    this.updatePreview();

    const btnRow = contentEl.createDiv({ cls: 'cp-dn-buttons' });
    btnRow.createEl('button', { text: t('daily_btn_cancel') })
      .addEventListener('click', () => this.close());
    btnRow.createEl('button', { text: t('daily_btn_create'), cls: 'mod-cta' })
      .addEventListener('click', () => {
        this.onSubmit({ ...this.result, dnConfig: this.dnConfig });
        this.close();
      });
  }

  private updateFolderLabel() {
    const label = this.dnConfig.folder || t('daily_vault_root');
    this.folderLabelEl.setText(`📁 ${label}`);
  }

  private updatePreview() {
    const files = getDailyNotes(this.app, this.dnConfig, this.result.start, this.result.end);
    const excludeTags = this.result.excludeTags
      .split(',').map(t => t.replace(/^#/, '').trim()).filter(Boolean);

    const count = files.filter(file => {
      if (excludeTags.length === 0) return true;
      const cache = this.app.metadataCache.getFileCache(file);
      const inline = cache?.tags?.map(t => t.tag.replace('#', '')) ?? [];
      const fmRaw: unknown = cache?.frontmatter?.['tags'];
      const fm: string[] = Array.isArray(fmRaw) ? (fmRaw as string[]) : (fmRaw != null ? [String(fmRaw)] : []);
      const all = [...inline, ...fm];
      return !excludeTags.some(tag => all.includes(tag));
    }).length;

    if (count === 0) {
      this.previewEl.setText(t('daily_preview_none'));
      this.previewEl.removeClass('cp-dn-preview-found');
      this.previewEl.addClass('cp-dn-preview-none');
    } else {
      this.previewEl.setText(t('daily_preview_found', count));
      this.previewEl.removeClass('cp-dn-preview-none');
      this.previewEl.addClass('cp-dn-preview-found');
    }
  }

  onClose() {
    this.contentEl.empty();
  }
}
