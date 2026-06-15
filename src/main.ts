import { App, Plugin, TFile, TFolder, TAbstractFile, SuggestModal, Notice, Menu, moment } from 'obsidian';
import { SettingsTab, DEFAULT_SETTINGS, type PluginSettings } from './settings';
import { exportVault, exportSingleNote, buildAiOutput, getProjectKnowledgeInstructions } from './exporter';
import { buildContextPack } from './context-pack';
import { getDailyNotesSettings, getDailyNotes, buildDailyPack, getDateRange, buildWeeklyHeader } from './daily-notes';
import { DailyNotesModal } from './daily-notes-modal';
import { OutputTargetModal } from './output-target-modal';
import { OUTPUT_PRESETS, MODES, buildProfileMap, getOutputTargetFromState, DEFAULT_OUTPUT_SELECTOR_STATE, type OutputTarget, type OutputSelectorState, type EpubExportOptions, type EpubSortStrategy } from './types';
import { AiMocModal } from './ai-moc-modal';
import { ConfirmModal } from './ai-moc';
import { t } from './i18n';
import { AIBriefGenerator } from './features/ai-brief/ai-brief-generator';
import { BriefRenderer } from './features/ai-brief/brief-renderer';
import { BriefExporter } from './features/ai-brief/brief-exporter';
import { isAiBriefByHeadings, isAiBriefContent, parseBriefContent, buildBriefMocContent, buildKnowledgeOverview, titleFromSourceName, type BriefMocData } from './features/ai-brief/brief-moc-generator';
import { DEFAULT_AI_BRIEF_SETTINGS } from './settings';
import { FRESHNESS_VIEW_TYPE, FreshnessView } from './freshness/FreshnessView';
import { buildPackRecord, packKey, applyRenameToRegistry } from './freshness/checker';
import type { PackRecord } from './freshness/types';
import { buildEpub } from './epub/epubBuilder';
import { sanitizeFilename } from './epub/epubSanitizer';
import type { EpubBookInput, EpubChapter, EpubCluster } from './epub/epubTypes';

interface PackMeta {
  source: PackRecord['source'];
  files: TFile[];
  name: string;
}

function stripWikilink(name: string): string {
  return name.replace(/^\[\[/, '').replace(/\]\]$/, '').split('|')[0].trim();
}

function commonFolderOfFiles(files: TFile[]): string {
  if (files.length === 0) return '';
  const parts = files[0].path.split('/');
  let common = parts.slice(0, -1);
  for (const f of files.slice(1)) {
    const fp = f.path.split('/').slice(0, -1);
    let i = 0;
    while (i < common.length && i < fp.length && common[i] === fp[i]) i++;
    common = common.slice(0, i);
  }
  return common.join('/');
}

function toFreshnessTarget(target: OutputTarget): PackRecord['target'] | null {
  if (target === 'chatgpt') return 'chatgpt';
  if (target === 'claude') return 'claude';
  if (target === 'gemini') return 'gemini';
  if (target === 'notebooklm-text' || target === 'notebooklm-zip') return 'notebooklm';
  return null;
}

export default class ContextPackPlugin extends Plugin {
  settings!: PluginSettings;

  async onload() {
    await this.loadSettings();
    this.addSettingTab(new SettingsTab(this.app, this));

    // If a previous onload() threw after registerView, Obsidian skips onunload()
    // so the type stays registered. Unregister it first.
    (this.app as unknown as { viewRegistry?: { unregisterView?: (type: string) => void } }).viewRegistry?.unregisterView?.(FRESHNESS_VIEW_TYPE);
    this.registerView(FRESHNESS_VIEW_TYPE, (leaf) => new FreshnessView(leaf, this));

    this.addRibbonIcon('boxes', 'Project Knowledge Packs', () => {
      void this.activateFreshnessView();
    });

    this.addCommand({
      id: 'open-freshness-panel',
      name: 'Open Project Knowledge Packs',
      callback: () => void this.activateFreshnessView(),
    });

    this.addRibbonIcon('package', t('ribbon_tooltip'), (evt: MouseEvent) => {
      const menu = new Menu();
      menu.addItem(item => item
        .setTitle(t('ribbon_pack_folder'))
        .setIcon('package')
        .onClick(() => this.packFromFolder()));
      menu.addItem(item => item
        .setTitle(t('ribbon_pack_tag'))
        .setIcon('tag')
        .onClick(() => this.packFromTag()));
      menu.addSeparator();
      menu.addItem(item => item
        .setTitle(t('ribbon_create_moc_tag'))
        .setIcon('map')
        .onClick(() => this.createMocFromTag()));
      menu.addItem(item => item
        .setTitle(t('ribbon_create_moc_note'))
        .setIcon('file-plus')
        .onClick(() => new AiMocModal(this.app, (files, source) => this.packFromFileList(files, source), undefined, this.settings.outputFolder).open()));
      menu.addSeparator();
      menu.addItem(item => item
        .setTitle(t('ribbon_export_vault'))
        .setIcon('archive')
        .onClick(() => this.runExport()));
      menu.addItem(item => item
        .setTitle(t('ribbon_export_folder'))
        .setIcon('folder-down')
        .onClick(() => this.exportFromFolder()));
      menu.addItem(item => item
        .setTitle(t('ribbon_export_tag'))
        .setIcon('tag')
        .onClick(() => this.exportFromTag()));
      menu.showAtMouseEvent(evt);
    });

    this.addRibbonIcon('calendar-arrow-down', t('ribbon_daily'), () => {
      new DailyNotesModal(this.app, this.settings, (result) => {
        void this.runDailyNotesPack(result.start, result.end, result.excludeTags, result.sortOrder, false, result.dnConfig);
      }, async (folder) => { this.settings.dailyNotesFolder = folder; this.settings.dailyNotesAutoDetect = false; await this.saveSettings(); }).open();
    });

    this.addCommand({
      id: 'export-vault',
      name: t('cmd_export'),
      callback: () => this.runExport(),
    });

    this.addCommand({
      id: 'export-current',
      name: t('cmd_export_current'),
      checkCallback: (checking) => {
        const file = this.app.workspace.getActiveFile();
        if (!file) return false;
        if (!checking) void exportSingleNote(this.app, file, this.formatOptions());
        return true;
      },
    });

    this.addCommand({
      id: 'pack-folder',
      name: t('cmd_pack_folder'),
      callback: () => this.packFromFolder(),
    });

    this.addCommand({
      id: 'pack-tag',
      name: t('cmd_pack_tag'),
      callback: () => this.packFromTag(),
    });

    this.addCommand({
      id: 'create-moc-tag',
      name: t('cmd_create_moc_tag'),
      callback: () => this.createMocFromTag(),
    });

    this.addCommand({
      id: 'create-ai-moc',
      name: t('cmd_create_ai_moc'),
      callback: () => new AiMocModal(this.app, (files, source) => this.packFromFileList(files, source), undefined, this.settings.outputFolder).open(),
    });

    this.addCommand({
      id: 'daily-notes-pack-default',
      name: t('cmd_daily_default'),
      callback: async () => {
        const range = getDateRange(this.settings.dailyNotesDefaultRange);
        await this.runDailyNotesPack(range.start, range.end, this.settings.dailyNotesExcludeTags, this.settings.dailyNotesSortOrder as 'asc' | 'desc');
      },
    });

    this.addCommand({
      id: 'daily-notes-pack-custom',

      name: t('cmd_daily_custom'),
      callback: () => {
        new DailyNotesModal(this.app, this.settings, (result) => {
          void this.runDailyNotesPack(result.start, result.end, result.excludeTags, result.sortOrder, false, result.dnConfig);
        }, async (folder) => { this.settings.dailyNotesFolder = folder; this.settings.dailyNotesAutoDetect = false; await this.saveSettings(); }).open();
      },
    });

    this.addCommand({
      id: 'daily-notes-weekly-summary',
      name: t('cmd_daily_weekly'),
      callback: async () => {
        const range = getDateRange('this-week');
        await this.runDailyNotesPack(range.start, range.end, this.settings.dailyNotesExcludeTags, this.settings.dailyNotesSortOrder as 'asc' | 'desc', true);
      },
    });

    this.addCommand({
      id: 'generate-brief-folder',
      name: t('cmd_generate_brief_folder'),
      callback: () => this.generateBriefFromFolder(),
    });

    this.addCommand({
      id: 'generate-brief-tag',
      name: t('cmd_generate_brief_tag'),
      callback: () => this.generateBriefFromTag(),
    });

    this.addCommand({
      id: 'generate-brief-moc',
      name: t('cmd_generate_brief_moc'),
      checkCallback: (checking) => {
        const file = this.app.workspace.getActiveFile();
        if (!file) return false;
        if (!checking) void this.generateBriefFromMoc(file);
        return true;
      },
    });

    this.addCommand({
      id: 'generate-ai-moc-from-brief',
      name: t('cmd_generate_ai_moc_from_brief'),
      checkCallback: (checking) => {
        const file = this.app.workspace.getActiveFile();
        if (!file) return false;
        const cache = this.app.metadataCache.getFileCache(file);
        const headings = (cache?.headings ?? []).map(h => h.heading);
        if (!isAiBriefByHeadings(headings)) return false;
        if (!checking) void this.generateAiMocFromBrief(file);
        return true;
      },
    });

    this.addCommand({
      id: 'pack-moc',
      name: t('cmd_pack_moc'),
      checkCallback: (checking) => {
        const file = this.app.workspace.getActiveFile();
        if (!file) return false;
        if (!checking) {
          if (this.isAiBriefFile(file)) {
            new Notice(t('notice_ai_brief_not_packable'));
            return;
          }
          void this.packFromMoc(file);
        }
        return true;
      },
    });

    this.registerEvent(
      this.app.workspace.on('file-menu', (menu, file) => {
        if (file instanceof TFolder) {
          menu.addItem(item => item
            .setTitle(t('menu_pack_folder'))
            .setIcon('package')
            .onClick(() => this.packFromFolderPath(file.path)));
          menu.addItem(item => item
            .setTitle(t('menu_create_moc'))
            .setIcon('map')
            .onClick(() => this.createMocFromFolderPath(file.path)));
          menu.addItem(item => item
            .setTitle(t('menu_export_folder'))
            .setIcon('folder-down')
            .onClick(() => this.exportFromFolderPath(file.path)));
          menu.addItem(item => item
            .setTitle(t('menu_generate_brief'))
            .setIcon('brain-circuit')
            .onClick(() => void this.generateBriefFromFolderPath(file.path)));
        }
        if (file instanceof TFile && file.extension === 'md') {
          menu.addItem(item => item
            .setTitle(t('menu_export_note'))
            .setIcon('download')
            .onClick(() => void exportSingleNote(this.app, file, this.formatOptions())));
          if (this.isAiBriefFile(file)) {
            menu.addItem(item => item
              .setTitle(t('menu_generate_ai_moc_from_brief'))
              .setIcon('layout-list')
              .onClick(() => void this.generateAiMocFromBrief(file)));
          } else {
            menu.addItem(item => item
              .setTitle(t('menu_create_ai_moc'))
              .setIcon('map')
              .onClick(() => new AiMocModal(this.app, (files, source) => this.packFromFileList(files, source), file, this.settings.outputFolder).open()));
            const cache = this.app.metadataCache.getFileCache(file);
            if ((cache?.links?.length ?? 0) > 0) {
              menu.addItem(item => item
                .setTitle(t('menu_pack_moc'))
                .setIcon('list')
                .onClick(() => void this.packFromMoc(file)));
            }
          }
        }
      })
    );

    this.registerEvent(
      this.app.vault.on('rename', (file, oldPath) => {
        void this.handleRename(file, oldPath);
      })
    );

    this.app.workspace.onLayoutReady(() => {
      if (this.settings.freshnessAutoCheck) {
        const leaves = this.app.workspace.getLeavesOfType(FRESHNESS_VIEW_TYPE);
        if (leaves.length > 0) {
          const view = leaves[0].view;
          if (view instanceof FreshnessView) {
            void view.refresh();
          }
        }
      }
    });
  }

  async loadSettings() {
    const saved = await this.loadData() as Record<string, unknown> | null;
    this.settings = Object.assign({}, DEFAULT_SETTINGS, saved);
    if (!saved?.outputSelectorState) {
      this.settings.outputSelectorState = migrateOutputTarget(this.settings.defaultOutputTarget);
    }
    if (!Array.isArray(this.settings.packRegistry)) {
      this.settings.packRegistry = [];
    }
    if (!this.settings.freshnessSettings) {
      this.settings.freshnessSettings = DEFAULT_SETTINGS.freshnessSettings;
    }
    if (!this.settings.aiBriefSettings) {
      this.settings.aiBriefSettings = DEFAULT_AI_BRIEF_SETTINGS;
    }
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  async activateFreshnessView(): Promise<void> {
    const existing = this.app.workspace.getLeavesOfType(FRESHNESS_VIEW_TYPE);
    if (existing.length > 0) {
      await this.app.workspace.revealLeaf(existing[0]);
      return;
    }
    const leaf = this.app.workspace.getRightLeaf(false);
    if (!leaf) return;
    await leaf.setViewState({ type: FRESHNESS_VIEW_TYPE, active: true });
    await this.app.workspace.revealLeaf(leaf);
  }

  async savePackRecord(meta: PackMeta, outputTarget: OutputTarget, selectorState?: OutputSelectorState): Promise<void> {
    const freshnessTarget = toFreshnessTarget(outputTarget);
    if (!freshnessTarget) return;
    const record = buildPackRecord(meta.name, meta.source, freshnessTarget, meta.files);
    if (selectorState) record.outputSelectorState = selectorState;
    const key = packKey(meta.source, freshnessTarget);
    const idx = this.settings.packRegistry.findIndex(
      (p) => packKey(p.source, p.target) === key,
    );
    if (idx >= 0) {
      this.settings.packRegistry[idx] = record;
    } else {
      this.settings.packRegistry.push(record);
    }
    await this.saveSettings();
  }

  private async handleRename(file: TAbstractFile, oldPath: string): Promise<void> {
    const changed = applyRenameToRegistry(
      this.settings.packRegistry,
      oldPath,
      file.path,
      file instanceof TFolder,
    );
    if (changed) {
      await this.saveSettings();
      this.refreshFreshnessViewIfOpen();
    }
  }

  private refreshFreshnessViewIfOpen(): void {
    for (const leaf of this.app.workspace.getLeavesOfType(FRESHNESS_VIEW_TYPE)) {
      if (leaf.view instanceof FreshnessView) {
        void leaf.view.refresh();
      }
    }
  }

  async reExportPack(pack: PackRecord): Promise<void> {
    if (pack.outputSelectorState) {
      this.settings.outputSelectorState = { ...pack.outputSelectorState };
    }
    switch (pack.source.type) {
      case 'folder':
        await this.packFromFolderPath(pack.source.query);
        break;
      case 'tag':
        await this.handlePackFromTag(pack.source.query.replace(/^#/, ''));
        break;
      case 'moc': {
        const moc = this.app.vault.getAbstractFileByPath(pack.source.query);
        if (moc instanceof TFile) await this.packFromMoc(moc);
        break;
      }
      default:
        new Notice('Re-export for this pack type is not yet supported.');
    }
  }

  private formatOptions() {
    return {
      includeFrontmatterTitle: this.settings.includeFrontmatterTitle,
      customRules: this.settings.customRules,
    };
  }

  private startProgress(initialMsg: string): {
    notice: Notice;
    controller: AbortController;
    setProgress: (msg: string) => void;
  } {
    const controller = new AbortController();
    let msgEl!: HTMLElement;
    const notice = new Notice(createFragment(frag => {
      const wrap = frag.createEl('div', { cls: 'cp-progress' });
      wrap.createEl('div', { cls: 'cp-title', text: initialMsg });
      msgEl = wrap.createEl('div', { cls: 'cp-progress-msg', text: '' });
      const btn = wrap.createEl('button', { cls: 'cp-cancel-btn', text: t('btn_cancel') });
      btn.addEventListener('click', () => controller.abort());
    }), 0);

    return { notice, controller, setProgress: (msg) => msgEl.setText(msg) };
  }

  private handlePackError(notice: Notice, err: unknown) {
    notice.hide();
    if (err instanceof DOMException && err.name === 'AbortError') {
      new Notice(t('notice_cancelled'));
    } else {
      console.error('[AI Context Pack]', err);
      new Notice(t('notice_error'));
    }
  }

  private async runExport(targetFolder?: string) {
    const options = {
      ...this.formatOptions(),
      targetFolder: targetFolder ?? this.settings.targetFolder,
      outputFolder: this.settings.outputFolder,
      flattenStructure: this.settings.flattenStructure,
      openAfterExport: this.settings.openAfterExport,
    };
    const { notice, controller, setProgress } = this.startProgress(t('notice_exporting'));
    try {
      const result = await exportVault(this.app, options,
        (cur, total) => setProgress(`${cur} / ${total}`),
        controller.signal
      );
      notice.hide();
      if (!result) {
        new Notice(t('notice_no_files'));
      } else {
        new Notice(`${t('notice_done', result.count)}\n📄 ${result.filename}`, 8000);
      }
    } catch (err) {
      this.handlePackError(notice, err);
    }
  }

  private exportFromFolder() {
    const folders = this.getFolders();
    new FolderSuggest(this.app, folders, (folder) => this.exportFromFolderPath(folder), t('folder_picker_title_export')).open();
  }

  private exportFromFolderPath(folderPath: string) {
    void this.runExport(folderPath);
  }

  private async createMocFromFolderPath(folderPath: string) {
    const files = this.app.vault.getMarkdownFiles()
      .filter(f => f.path.startsWith(folderPath + '/'));

    if (files.length === 0) {
      new Notice(t('notice_no_files'));
      return;
    }

    const folderName = folderPath.split('/').pop() ?? folderPath;

    const groups = new Map<string, TFile[]>();
    for (const file of files) {
      const rel = file.path.slice(folderPath.length + 1);
      const sub = rel.includes('/') ? rel.split('/')[0] : '';
      if (!groups.has(sub)) groups.set(sub, []);
      groups.get(sub)!.push(file);
    }

    const lines: string[] = [`# MOC: ${folderName}`, ''];
    for (const [sub, groupFiles] of groups) {
      if (sub) lines.push(`## ${sub}`, '');
      for (const file of groupFiles.sort((a, b) => a.basename.localeCompare(b.basename))) {
        lines.push(`- [[${file.basename}]]`);
      }
      lines.push('');
    }

    await this.saveMoc(`MOC-${folderName}.md`, lines.join('\n'), files.length);
  }

  private createMocFromTag() {
    new TagSuggest(this.app, this.getAllTags(), (tag) => { void this.handleMocFromTag(tag); }).open();
  }

  private async handleMocFromTag(tag: string): Promise<void> {
    const files = this.getFilesByTag(tag);
    if (files.length === 0) { new Notice(t('notice_no_files')); return; }
    const lines: string[] = [`# MOC: #${tag}`, ''];
    for (const file of files.sort((a, b) => a.basename.localeCompare(b.basename))) {
      lines.push(`- [[${file.basename}]]`);
    }
    lines.push('');
    await this.saveMoc(`MOC-tag-${tag.replace(/\//g, '-')}.md`, lines.join('\n'), files.length);
  }

  private exportFromTag() {
    new TagSuggest(this.app, this.getAllTags(), (tag) => { void this.handleExportFromTag(tag); }).open();
  }

  private async handleExportFromTag(tag: string): Promise<void> {
    const files = this.getFilesByTag(tag);
    if (files.length === 0) { new Notice(t('notice_no_files')); return; }
    const options = {
      ...this.formatOptions(),
      targetFolder: '',
      outputFolder: this.settings.outputFolder,
      flattenStructure: this.settings.flattenStructure,
      openAfterExport: this.settings.openAfterExport,
    };
    const { notice, controller, setProgress } = this.startProgress(t('notice_exporting'));
    try {
      const result = await exportVault(this.app, options,
        (cur, total) => setProgress(`${cur} / ${total}`),
        controller.signal, files
      );
      notice.hide();
      if (!result) new Notice(t('notice_no_files'));
      else new Notice(`${t('notice_done', result.count)}\n📄 ${result.filename}`, 8000);
    } catch (err) {
      this.handlePackError(notice, err);
    }
  }

  private getAllTags(): string[] {
    const tagSet = new Set<string>();
    for (const file of this.app.vault.getMarkdownFiles()) {
      const cache = this.app.metadataCache.getFileCache(file);
      if (!cache) continue;
      for (const ref of cache.tags ?? []) tagSet.add(ref.tag.replace(/^#/, ''));
      const fmTags: unknown = cache.frontmatter?.['tags'];
      if (Array.isArray(fmTags)) {
        for (const t of fmTags) { if (typeof t === 'string') tagSet.add(t.replace(/^#/, '')); }
      } else if (typeof fmTags === 'string' && fmTags) {
        for (const t of fmTags.split(',')) { const s = t.trim().replace(/^#/, ''); if (s) tagSet.add(s); }
      }
    }
    return Array.from(tagSet).sort();
  }

  private getFilesByTag(tag: string): TFile[] {
    return this.app.vault.getMarkdownFiles().filter(f => {
      const cache = this.app.metadataCache.getFileCache(f);
      const inlineTags = cache?.tags?.map(t => t.tag.replace('#', '')) ?? [];
      const fmTagsRaw: unknown = cache?.frontmatter?.['tags'];
      const fmTags: string[] = Array.isArray(fmTagsRaw) ? (fmTagsRaw as string[]) : (fmTagsRaw != null ? [String(fmTagsRaw)] : []);
      const allTags = [...inlineTags, ...fmTags];
      return allTags.includes(tag);
    });
  }

  private async saveMoc(filename: string, content: string, noteCount: number) {
    const folder = this.settings.outputFolder || '';
    const path = folder ? `${folder}/${filename}` : filename;
    const existing = this.app.vault.getAbstractFileByPath(path);
    let mocFile: TFile;
    if (existing instanceof TFile) {
      await this.app.vault.modify(existing, content);
      mocFile = existing;
    } else {
      mocFile = await this.app.vault.create(path, content);
    }
    await this.app.workspace.getLeaf().openFile(mocFile);
    new Notice(t('notice_moc_done', noteCount));
  }

  private async runDailyNotesPack(
    startDate: Date,
    endDate: Date,
    excludeTagsStr: string,
    sortOrder: 'asc' | 'desc',
    weeklySummary = false,
    resolvedConfig?: { folder: string; format: string }
  ) {
    const dnConfig = resolvedConfig ?? (
      this.settings.dailyNotesAutoDetect
        ? await getDailyNotesSettings(this.app)
        : { folder: this.settings.dailyNotesFolder, format: this.settings.dailyNotesFormat }
    );

    const files = getDailyNotes(this.app, dnConfig, startDate, endDate);

    if (files.length === 0) {
      new Notice(t('daily_notice_none'));
      return;
    }

    const { notice } = this.startProgress(t('notice_packing'));

    const excludeTags = excludeTagsStr.split(',').map(t => t.trim()).filter(Boolean);
    const options = { excludeTags, sortOrder };

    const weeklyHeader = weeklySummary
      ? buildWeeklyHeader(startDate, endDate, files.length)
      : undefined;

    try {
      const content = await buildDailyPack(
        this.app, files, dnConfig, options, this.formatOptions(), weeklyHeader
      );
      notice.hide();

      if (!content) {
        new Notice(t('daily_notice_none'));
        return;
      }

      const dateStr = moment().format('YYYYMMDD');
      const prefix = weeklySummary ? 'weekly' : 'daily';
      const startIso = moment(startDate).format('YYYY-MM-DD');
      const endIso = moment(endDate).format('YYYY-MM-DD');
      const packName = weeklySummary ? 'Weekly Notes' : 'Daily Notes';
      this.handlePackOutput(content, `${prefix}-notes-${dateStr}`, files.length, packName, {
        source: { type: 'daily', query: `${startIso}..${endIso}` },
        files,
        name: packName,
      });
    } catch (err) {
      this.handlePackError(notice, err);
    }
  }

  private packFromFolder() {
    const folders = this.getFolders();
    new FolderSuggest(this.app, folders, (folder) => { void this.packFromFolderPath(folder); }, t('folder_picker_title_pack')).open();
  }

  private async packFromFolderPath(folderPath: string) {
    const files = this.app.vault.getMarkdownFiles()
      .filter(f => f.path.startsWith(folderPath + '/'));

    if (files.length === 0) {
      new Notice(t('notice_no_files'));
      return;
    }

    const title = folderPath.split('/').pop() ?? folderPath;
    const { notice, controller, setProgress } = this.startProgress(t('notice_packing'));
    try {
      const content = await buildContextPack(files, this.app, this.formatOptions(), {
        title,
        source: `folder:${folderPath}`,
      }, (cur, total) => setProgress(`${cur} / ${total}`), controller.signal);
      notice.hide();
      this.handlePackOutput(content, `folder-${title}`, files.length, title, {
        source: { type: 'folder', query: folderPath },
        files,
        name: title,
      });
    } catch (err) {
      this.handlePackError(notice, err);
    }
  }

  private packFromTag() {
    new TagSuggest(this.app, this.getAllTags(), (tag) => { void this.handlePackFromTag(tag); }).open();
  }

  private async handlePackFromTag(tag: string): Promise<void> {
    const files = this.getFilesByTag(tag);
    if (files.length === 0) { new Notice(t('notice_no_files')); return; }
    const { notice, controller, setProgress } = this.startProgress(t('notice_packing'));
    try {
      const content = await buildContextPack(files, this.app, this.formatOptions(), {
        title: tag, source: `tag:${tag}`,
      }, (cur, total) => setProgress(`${cur} / ${total}`), controller.signal);
      notice.hide();
      this.handlePackOutput(content, `tag-${tag.replace(/\//g, '-')}`, files.length, `#${tag}`, {
        source: { type: 'tag', query: tag },
        files,
        name: `#${tag}`,
      });
    } catch (err) {
      this.handlePackError(notice, err);
    }
  }

  private async packFromMoc(moc: TFile) {
    if (this.isAiBriefFile(moc)) {
      new Notice(t('notice_ai_brief_not_packable'));
      return;
    }

    const cache = this.app.metadataCache.getFileCache(moc);
    const links = cache?.links?.map(l => l.link) ?? [];

    if (links.length === 0) {
      new Notice(t('notice_no_links'));
      return;
    }

    // Detect AI Brief-derived MOC and source folder before link resolution
    const isAiBriefMoc = cache?.frontmatter?.['sourceType'] === 'ai-brief';
    const sourceFolder = isAiBriefMoc ? (cache?.frontmatter?.['sourceFolder'] as string | undefined) : undefined;

    const seen = new Set<string>();
    const allLinkedFiles: TFile[] = [];
    for (const link of links) {
      let linked: TFile | null = null;
      if (sourceFolder) {
        const lower = link.toLowerCase();
        linked = this.app.vault.getMarkdownFiles().find(
          f => f.path.startsWith(sourceFolder + '/') && f.basename.toLowerCase() === lower
        ) ?? null;
      }
      if (!linked) {
        const resolved = this.app.metadataCache.getFirstLinkpathDest(link, moc.path);
        linked = resolved instanceof TFile ? resolved : null;
      }
      if (linked && linked.extension === 'md' && !seen.has(linked.path)) {
        seen.add(linked.path);
        allLinkedFiles.push(linked);
      }
    }

    if (allLinkedFiles.length === 0) {
      new Notice(t('notice_no_files'));
      return;
    }
    let packFiles = allLinkedFiles;
    let knowledgeOverview: string | undefined;
    let packTitle: string | undefined;
    let packDescription: string | undefined;
    let displaySource: string = moc.basename;

    if (isAiBriefMoc) {
      // Primary: resolve AI Brief file directly from MOC's `source` frontmatter
      const sourceName = cache?.frontmatter?.['source'] as string | undefined;
      const directBriefFile = sourceName
        ? this.app.metadataCache.getFirstLinkpathDest(sourceName, moc.path) ?? null
        : null;

      const aiBriefFiles: TFile[] = [];
      const packFilesList: TFile[] = [];

      for (const f of allLinkedFiles) {
        let detected = false;
        if (directBriefFile && f.path === directBriefFile.path) {
          detected = true;
        } else if (this.isAiBriefFile(f)) {
          detected = true;
        } else {
          const rawContent = await this.app.vault.read(f);
          detected = isAiBriefContent(rawContent);
        }
        if (detected) { aiBriefFiles.push(f); } else { packFilesList.push(f); }
      }
      packFiles = packFilesList;

      const briefFile = directBriefFile ?? aiBriefFiles[0];
      if (briefFile) {
        const briefContent = await this.app.vault.read(briefFile);
        const briefData = parseBriefContent(briefContent);
        if (briefData) {
          const topic = titleFromSourceName(sourceName ?? moc.basename);
          const isJa = briefData.language === 'ja';
          knowledgeOverview = buildKnowledgeOverview(briefData, topic);
          packTitle = topic;
          packDescription = isJa
            ? `${topic}に関するノートです。このノートをもとに質問にお答えします。`
            : `Notes on ${topic}. Use these notes to answer questions.`;
          displaySource = topic;
        }
      }
    }

    if (packFiles.length === 0) {
      new Notice(t('notice_no_files'));
      return;
    }

    const { notice, controller, setProgress } = this.startProgress(t('notice_packing'));
    try {
      let content = await buildContextPack(packFiles, this.app, this.formatOptions(), {
        title: moc.basename,
        source: `moc:${moc.basename}`,
        ...(isAiBriefMoc && packTitle ? { titleOverride: packTitle, omitMeta: true, description: packDescription } : {}),
      }, (cur, total) => setProgress(`${cur} / ${total}`), controller.signal);

      if (isAiBriefMoc && knowledgeOverview) {
        const sep = '\n\n---\n\n';
        const sepIdx = content.indexOf(sep);
        if (sepIdx !== -1) {
          content = content.slice(0, sepIdx) + '\n\n' + knowledgeOverview + sep + content.slice(sepIdx + sep.length);
        }
      }

      notice.hide();
      this.handlePackOutput(content, `moc-${moc.basename}`, packFiles.length, displaySource, {
        source: { type: 'moc', query: moc.path },
        files: packFiles,
        name: moc.basename,
      }, isAiBriefMoc ? true : undefined);
    } catch (err) {
      this.handlePackError(notice, err);
    }
  }

  private packFromFileList(files: TFile[], source: string): void {
    const { notice, controller, setProgress } = this.startProgress(t('notice_packing'));
    buildContextPack(files, this.app, this.formatOptions(), {
      title: source,
      source: `moc:${source}`,
    }, (cur, total) => setProgress(`${cur} / ${total}`), controller.signal)
      .then(content => {
        notice.hide();
        this.handlePackOutput(content, `ai-moc-${source}`, files.length, source, {
          source: { type: 'moc', query: source },
          files,
          name: source,
        });
      })
      .catch(err => this.handlePackError(notice, err));
  }

  private applyStarterPrompt(content: string, source: string, noteCount: number, selectorState: OutputSelectorState, mode = 'none', hasAiBrief = false): string {
    const target = getOutputTargetFromState(selectorState);
    const profileMap = buildProfileMap(this.settings.promptProfiles);
    const customProfile = profileMap[`${target}-default`];

    let prompt: string;
    if (customProfile) {
      prompt = customProfile.prompt
        .replace('{source}', source)
        .replace('{count}', String(noteCount));
    } else {
      const baseTemplate = hasAiBrief && !this.settings.starterPrompt.trim()
        ? t('default_knowledge_base_instructions')
        : (this.settings.starterPrompt.trim() || t('default_common_instructions'));
      const base = baseTemplate
        .replace('{source}', source)
        .replace('{count}', String(noteCount));
      const pkInstructions = getProjectKnowledgeInstructions(selectorState);
      const aiAddition = this.getAiAdditionForTarget(target);
      prompt = base;
      if (pkInstructions) prompt = `${prompt}\n\n${pkInstructions}`;
      if (aiAddition)     prompt = `${prompt}\n\n${aiAddition}`;
    }

    const modeText = this.getModePrompt(mode);
    if (modeText) prompt = `${prompt}\n\n${modeText}`;

    return `${prompt}\n\n---\n\n${content}`;
  }

  private getModePrompt(mode: string): string {
    const def = MODES.find(m => m.id === mode);
    return def?.promptKey ? t(def.promptKey) : '';
  }

  private isAiBriefFile(file: TFile): boolean {
    const cache = this.app.metadataCache.getFileCache(file);
    const fm = cache?.frontmatter;
    if (fm?.['generatedBy'] === 'ai-brief-generator') return true;
    if (fm?.['sourceType'] === 'ai-brief') return true;
    if (fm?.['generatedBy'] === 'ai-context-pack') return false;
    const headings = (cache?.headings ?? []).map(h => h.heading);
    return isAiBriefByHeadings(headings);
  }

  private getAiAdditionForTarget(target: OutputTarget): string {
    const keyMap: Partial<Record<OutputTarget, string>> = {
      chatgpt: 'ai_addition_chatgpt',
      claude: 'ai_addition_claude',
      gemini: 'ai_addition_gemini',
      'claude-code': 'ai_addition_claude_code',
    };
    const key = keyMap[target];
    return key ? t(key) : '';
  }

  private handlePackOutput(content: string, slug: string, noteCount: number, source: string, packMeta?: PackMeta, explicitHasAiBrief?: boolean): void {
    const hasAiBrief = explicitHasAiBrief ?? (packMeta?.files ?? []).some(f => {
      const headings = this.app.metadataCache.getFileCache(f)?.headings?.map(h => h.heading) ?? [];
      return isAiBriefByHeadings(headings);
    });

    if (this.settings.showOutputModal) {
      new OutputTargetModal(this.app, content, this.settings, () => this.saveSettings(), async (choice) => {
        if (choice.target === 'epub') {
          await this.exportAsEpub(packMeta?.files ?? [], source, choice.epubOptions ?? {
            bookTitle: source,
            includeBrief: true,
            includeToc: true,
            includeSourceNotes: true,
            stripFrontmatter: true,
            convertObsidianLinks: true,
            sortStrategy: 'ai-brief',
          });
          return;
        }
        const preset = OUTPUT_PRESETS[choice.target];
        const finalContent = (choice.includeStarterPrompt && preset.supportsStarterPrompt)
          ? this.applyStarterPrompt(content, source, noteCount, choice.selectorState, choice.mode, hasAiBrief)
          : content;
        if (choice.target === 'notebooklm-text') {
          await this.saveContextPack(finalContent, slug, noteCount);
        } else {
          await buildAiOutput(this.app, finalContent, slug, preset, {
            copyToClipboard: choice.copyToClipboard,
            saveToFile: choice.saveToFile,
            outputFolder: this.settings.contextPackOutputFolder || this.settings.outputFolder,
            openAiUrl: choice.openAiUrl,
          });
        }
        if (packMeta) {
          await this.savePackRecord(packMeta, choice.target, choice.selectorState);
          this.refreshFreshnessViewIfOpen();
        }
      }, source).open();
    } else {
      const selectorState = this.settings.outputSelectorState;
      const target = getOutputTargetFromState(selectorState);
      if (target === 'epub') {
        new Notice(t('modal_select_target'));
        return;
      }
      const preset = OUTPUT_PRESETS[target];
      const doPrompt = this.settings.includeStarterPrompt && preset.supportsStarterPrompt;
      const finalContent = doPrompt
        ? this.applyStarterPrompt(content, source, noteCount, selectorState, this.settings.defaultMode, hasAiBrief)
        : content;
      if (target === 'notebooklm-text' || target === 'notebooklm-zip') {
        void this.saveContextPack(finalContent, slug, noteCount);
      } else {
        void buildAiOutput(this.app, finalContent, slug, preset, {
          copyToClipboard: preset.copyToClipboard,
          saveToFile: preset.saveToFile,
          outputFolder: this.settings.contextPackOutputFolder || this.settings.outputFolder,
          openAiUrl: this.settings.openAiUrl,
        });
      }
      if (packMeta) {
        void this.savePackRecord(packMeta, target).then(() => this.refreshFreshnessViewIfOpen());
      }
    }
  }

  private async saveContextPack(content: string, slug: string, noteCount: number): Promise<void> {
    const date = window.moment().format('YYYYMMDD');
    const filename = `pack-${slug}-${date}.md`;

    try {
      const folder = this.settings.contextPackOutputFolder || this.settings.outputFolder || '';
      const path = folder ? `${folder}/${filename}` : filename;
      const existing = this.app.vault.getAbstractFileByPath(path);
      if (existing instanceof TFile) {
        await this.app.vault.modify(existing, content);
      } else {
        await this.app.vault.create(path, content);
      }
      new Notice(`${t('notice_pack_done', noteCount)}\n📄 ${path}`, 8000);
    } catch (err) {
      console.error('[AI Context Pack] Failed to save pack:', err);
      new Notice(t('notice_error'));
    }
  }

  private async exportAsEpub(files: TFile[], source: string, opts: EpubExportOptions): Promise<void> {
    // Identify the AI Brief file using metadata cache, with content-based fallback
    let briefFile: TFile | undefined;
    let briefMarkdown: string | undefined;
    if (opts.includeBrief) {
      briefFile = files.find(f => this.isAiBriefFile(f));
      if (!briefFile) {
        for (const f of files) {
          const raw = await this.app.vault.read(f);
          if (isAiBriefContent(raw)) { briefFile = f; briefMarkdown = raw; break; }
        }
      } else {
        briefMarkdown = await this.app.vault.read(briefFile);
      }
    }

    const sourceFiles = opts.includeSourceNotes
      ? files.filter(f => f !== briefFile)
      : [];

    if (!briefMarkdown && sourceFiles.length === 0) {
      new Notice(t('epub_notice_no_notes'));
      return;
    }

    const lang = (window.moment?.locale() === 'ja') ? 'ja' : 'en';
    const bookTitle = opts.bookTitle || source;

    // Parse AI Brief for cluster groupings and sort order
    let briefData: BriefMocData | null = null;
    if (briefMarkdown) {
      briefData = parseBriefContent(briefMarkdown);
    }

    // Sort source files according to chosen strategy
    const sortedSourceFiles = this.sortFilesForEpub(sourceFiles, opts.sortStrategy, briefData ?? undefined);

    // Build chapters from sorted files
    const chapters: EpubChapter[] = [];
    for (const file of sortedSourceFiles) {
      const md = await this.app.vault.read(file);
      chapters.push({
        id: sanitizeFilename(file.basename),
        title: file.basename,
        markdown: md,
        sourcePath: file.path,
      });
    }

    // Build clusters for grouped TOC
    let clusters: EpubCluster[] | undefined;
    if (briefData && briefData.clusters.length > 0) {
      const titleToIdx = new Map(chapters.map((ch, i) => [ch.title.toLowerCase(), i]));
      const mapped = briefData.clusters
        .map(cluster => {
          const allNotes = [...cluster.representativeNotes, ...cluster.additionalNotes];
          const seen = new Set<number>();
          const indices: number[] = [];
          for (const name of allNotes) {
            const basename = stripWikilink(name);
            const idx = titleToIdx.get(basename.toLowerCase());
            if (idx !== undefined && !seen.has(idx)) {
              seen.add(idx);
              indices.push(idx);
            }
          }
          return {
            name: cluster.name,
            chapterIndices: indices,
            representativeNotes: cluster.representativeNotes,
          };
        })
        .filter(c => c.chapterIndices.length > 0);
      if (mapped.length > 0) clusters = mapped;
    }

    const input: EpubBookInput = {
      options: {
        title: bookTitle,
        language: lang,
        includeBrief: opts.includeBrief,
        includeToc: opts.includeToc,
        includeSourceNotes: opts.includeSourceNotes,
        stripFrontmatter: opts.stripFrontmatter,
        convertObsidianLinks: opts.convertObsidianLinks,
      },
      briefMarkdown,
      chapters,
      clusters,
    };

    try {
      const data = buildEpub(input);
      const filename = sanitizeFilename(bookTitle) + '.epub';
      const outputFolder = this.settings.contextPackOutputFolder || this.settings.outputFolder || '';
      const path = outputFolder ? `${outputFolder}/${filename}` : filename;
      const ab = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer;
      const existing = this.app.vault.getAbstractFileByPath(path);
      if (existing instanceof TFile) {
        await this.app.vault.modifyBinary(existing, ab);
      } else {
        await this.app.vault.createBinary(path, ab);
      }
      new Notice(t('epub_notice_exported', filename), 8000);
    } catch (err) {
      console.error('[AI Context Pack] EPUB export failed:', err);
      new Notice(t('notice_error'));
    }
  }

  private sortFilesForEpub(files: TFile[], strategy: EpubSortStrategy, briefData?: BriefMocData): TFile[] {
    const byBasename = (a: TFile, b: TFile) =>
      a.basename.localeCompare(b.basename, undefined, { sensitivity: 'base' });
    const byFilename = (a: TFile, b: TFile) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });

    switch (strategy) {
      case 'title':
        return [...files].sort(byBasename);
      case 'filename':
        return [...files].sort(byFilename);
      case 'ai-brief':
        if (briefData && briefData.clusters.length > 0) {
          return this.sortByAiBriefOrder(files, briefData);
        }
        return [...files].sort(byBasename);
      case 'current':
      default:
        return [...files];
    }
  }

  private sortByAiBriefOrder(files: TFile[], briefData: BriefMocData): TFile[] {
    const orderedNames: string[] = [];
    const seen = new Set<string>();
    for (const cluster of briefData.clusters) {
      for (const name of [...cluster.representativeNotes, ...cluster.additionalNotes]) {
        const lower = stripWikilink(name).toLowerCase();
        if (!seen.has(lower)) {
          seen.add(lower);
          orderedNames.push(lower);
        }
      }
    }

    const nameToFile = new Map(files.map(f => [f.basename.toLowerCase(), f]));
    const usedPaths = new Set<string>();
    const sorted: TFile[] = [];

    for (const name of orderedNames) {
      const file = nameToFile.get(name);
      if (file && !usedPaths.has(file.path)) {
        sorted.push(file);
        usedPaths.add(file.path);
      }
    }

    const remaining = files
      .filter(f => !usedPaths.has(f.path))
      .sort((a, b) => a.basename.localeCompare(b.basename, undefined, { sensitivity: 'base' }));

    return [...sorted, ...remaining];
  }

  private getBriefSettings() {
    return Object.assign({}, DEFAULT_AI_BRIEF_SETTINGS, this.settings.aiBriefSettings);
  }

  private async runBriefGeneration(files: TFile[], title: string): Promise<void> {
    if (files.length === 0) { new Notice(t('notice_no_files')); return; }

    const notice = new Notice(t('notice_generating_brief'), 0);
    try {
      const briefSettings = this.getBriefSettings();
      const generator = new AIBriefGenerator(this.app);
      const renderer = new BriefRenderer();
      const exporter = new BriefExporter(this.app);

      const model = await generator.generate(files, title, briefSettings);
      const content = renderer.render(model, briefSettings);
      const outputFolder = this.settings.contextPackOutputFolder || this.settings.outputFolder || '';
      const sourceFolder = commonFolderOfFiles(files);
      const savedFile = await exporter.save(content, title, outputFolder, sourceFolder || undefined);

      notice.hide();
      new Notice(t('notice_brief_done', savedFile.path), 8000);
      await this.app.workspace.getLeaf().openFile(savedFile);
    } catch (err) {
      notice.hide();
      console.error('[AI Context Pack]', err);
      new Notice(t('notice_error'));
    }
  }

  private generateBriefFromFolder(): void {
    const folders = this.getFolders();
    new FolderSuggest(this.app, folders, (folder) => void this.generateBriefFromFolderPath(folder), t('folder_picker_title_brief')).open();
  }

  private async generateBriefFromFolderPath(folderPath: string): Promise<void> {
    const files = this.app.vault.getMarkdownFiles().filter(f => f.path.startsWith(folderPath + '/'));
    const title = folderPath.split('/').pop() ?? folderPath;
    await this.runBriefGeneration(files, title);
  }

  private generateBriefFromTag(): void {
    new TagSuggest(this.app, this.getAllTags(), (tag) => void this.runBriefGeneration(this.getFilesByTag(tag), tag)).open();
  }

  private async generateBriefFromMoc(moc: TFile): Promise<void> {
    const cache = this.app.metadataCache.getFileCache(moc);
    const links = cache?.links?.map(l => l.link) ?? [];
    const files: TFile[] = [];
    for (const link of links) {
      const linked = this.app.metadataCache.getFirstLinkpathDest(link, moc.path);
      if (linked instanceof TFile && linked.extension === 'md') files.push(linked);
    }
    if (files.length === 0) { new Notice(t('notice_no_links')); return; }
    await this.runBriefGeneration(files, moc.basename);
  }

  private async generateAiMocFromBrief(file: TFile): Promise<void> {
    const content = await this.app.vault.cachedRead(file);

    const data = parseBriefContent(content);
    if (!data) {
      new Notice(t('notice_brief_not_detected'));
      return;
    }
    if (data.clusters.length === 0 && data.relationships.length === 0 && data.documentSections.length === 0) {
      new Notice(t('notice_brief_no_structure'));
      return;
    }

    const briefCache = this.app.metadataCache.getFileCache(file);
    const sourceFolder = briefCache?.frontmatter?.['sourceFolder'] as string | undefined;
    const mocContent = buildBriefMocContent(data, file.basename, this.getBriefSettings().enableMermaid, sourceFolder);
    const folder = this.settings.contextPackOutputFolder || this.settings.outputFolder || '';
    const mocFilename = `${file.basename} MOC.md`;
    const mocPath = folder ? `${folder}/${mocFilename}` : mocFilename;

    const existing = this.app.vault.getAbstractFileByPath(mocPath);
    let mocFile: TFile;

    if (existing instanceof TFile) {
      const existingCache = this.app.metadataCache.getFileCache(existing);
      const generatedBy: unknown = existingCache?.frontmatter?.['generatedBy'];
      if (generatedBy === 'ai-context-pack') {
        await this.app.vault.modify(existing, mocContent);
        mocFile = existing;
      } else {
        const confirmed = await new ConfirmModal(
          this.app,
          t('ai_moc_overwrite_message', file.basename),
        ).confirm();
        if (!confirmed) return;
        await this.app.vault.modify(existing, mocContent);
        mocFile = existing;
      }
    } else {
      mocFile = await this.app.vault.create(mocPath, mocContent);
    }

    await this.app.workspace.getLeaf().openFile(mocFile);
    new Notice(t('notice_brief_moc_done', mocFile.path), 8000);
  }

  private getFolders(): string[] {
    const folders = new Set<string>();
    for (const file of this.app.vault.getMarkdownFiles()) {
      const parts = file.path.split('/');
      for (let i = 1; i < parts.length; i++) {
        folders.add(parts.slice(0, i).join('/'));
      }
    }
    return Array.from(folders).sort();
  }
}

class TagSuggest extends SuggestModal<string> {
  constructor(
    app: App,
    private tags: string[],
    private onChoose: (tag: string) => void
  ) {
    super(app);
  }

  getSuggestions(query: string): string[] {
    const lower = query.toLowerCase();
    const filtered = this.tags.filter(tag => tag.toLowerCase().includes(lower));
    if (query && !this.tags.includes(query)) return [query, ...filtered];
    return filtered.length > 0 ? filtered : this.tags;
  }

  renderSuggestion(tag: string, el: HTMLElement): void {
    el.setText(`#${tag}`);
  }

  onChooseSuggestion(tag: string): void {
    this.onChoose(tag);
  }
}

class FolderSuggest extends SuggestModal<string> {
  constructor(
    app: App,
    private folders: string[],
    private onChoose: (folder: string) => void,
    private title?: string
  ) {
    super(app);
    this.setPlaceholder(t('folder_search_placeholder'));
  }

  onOpen(): void {
    void super.onOpen();
    if (this.title) {
      const target = this.modalEl.querySelector('.prompt') ?? this.inputEl.parentElement;
      target?.insertAdjacentElement('beforebegin',
        createEl('div', { cls: 'cp-folder-picker-title', text: this.title })
      );
    }
  }

  getSuggestions(query: string): string[] {
    return this.folders.filter(f => f.toLowerCase().includes(query.toLowerCase()));
  }

  renderSuggestion(folder: string, el: HTMLElement): void {
    el.setText(folder);
  }

  onChooseSuggestion(folder: string): void {
    this.onChoose(folder);
  }
}

function migrateOutputTarget(target: OutputTarget): OutputSelectorState {
  const state = { ...DEFAULT_OUTPUT_SELECTOR_STATE };
  switch (target) {
    case 'claude':         state.activeTab = 'claude'; break;
    case 'gemini':         state.activeTab = 'gemini'; break;
    case 'claude-code':    state.activeTab = 'agents'; state.agentMode = 'claudecode'; break;
    case 'notebooklm-text':
    case 'notebooklm-zip': state.activeTab = 'agents'; state.agentMode = 'notebooklm'; break;
    default:               state.activeTab = 'chatgpt'; break;
  }
  return state;
}

