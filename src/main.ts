import { App, Plugin, TFile, TFolder, SuggestModal, Notice, Menu, Platform } from 'obsidian';
import { SettingsTab, DEFAULT_SETTINGS, type PluginSettings } from './settings';
import { exportVault, exportSingleNote, downloadBlob } from './exporter';
import { buildContextPack } from './context-pack';
import { t } from './i18n';

export default class ContextPackPlugin extends Plugin {
  settings!: PluginSettings;

  async onload() {
    await this.loadSettings();
    this.addSettingTab(new SettingsTab(this.app, this));

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
        if (!checking) exportSingleNote(this.app, file, this.formatOptions());
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
      id: 'pack-moc',
      name: t('cmd_pack_moc'),
      checkCallback: (checking) => {
        const file = this.app.workspace.getActiveFile();
        if (!file) return false;
        if (!checking) this.packFromMoc(file);
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
        }
        if (file instanceof TFile && file.extension === 'md') {
          menu.addItem(item => item
            .setTitle(t('menu_export_note'))
            .setIcon('download')
            .onClick(() => exportSingleNote(this.app, file, this.formatOptions())));
          const cache = this.app.metadataCache.getFileCache(file);
          if ((cache?.links?.length ?? 0) > 0) {
            menu.addItem(item => item
              .setTitle(t('menu_pack_moc'))
              .setIcon('list')
              .onClick(() => this.packFromMoc(file)));
          }
        }
      })
    );
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
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
    const notice = new Notice('', 0);
    notice.noticeEl.addClass('cp-progress');
    notice.noticeEl.empty();

    notice.noticeEl.createEl('div', { cls: 'cp-title', text: initialMsg });
    const msgEl = notice.noticeEl.createEl('div', { cls: 'cp-progress-msg', text: '' });
    const btn = notice.noticeEl.createEl('button', { cls: 'cp-cancel-btn', text: t('btn_cancel') });
    btn.addEventListener('click', () => controller.abort());

    return { notice, controller, setProgress: (msg) => msgEl.setText(msg) };
  }

  private handlePackError(notice: Notice, err: unknown) {
    notice.hide();
    if (err instanceof DOMException && err.name === 'AbortError') {
      new Notice(t('notice_cancelled'));
    } else {
      console.error('[Context Pack]', err);
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
        (cur, total) => setProgress(`⏳ ${cur} / ${total}`),
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
    new FolderSuggest(this.app, folders, (folder) => this.exportFromFolderPath(folder)).open();
  }

  private exportFromFolderPath(folderPath: string) {
    this.runExport(folderPath);
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
    new TagSuggest(this.app, this.getAllTags(), async (tag) => {
      const files = this.getFilesByTag(tag);
      if (files.length === 0) { new Notice(t('notice_no_files')); return; }
      const lines: string[] = [`# MOC: #${tag}`, ''];
      for (const file of files.sort((a, b) => a.basename.localeCompare(b.basename))) {
        lines.push(`- [[${file.basename}]]`);
      }
      lines.push('');
      await this.saveMoc(`MOC-tag-${tag}.md`, lines.join('\n'), files.length);
    }).open();
  }

  private exportFromTag() {
    new TagSuggest(this.app, this.getAllTags(), async (tag) => {
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
          (cur, total) => setProgress(`⏳ ${cur} / ${total}`),
          controller.signal, files
        );
        notice.hide();
        if (!result) new Notice(t('notice_no_files'));
        else new Notice(`${t('notice_done', result.count)}\n📄 ${result.filename}`, 8000);
      } catch (err) {
        this.handlePackError(notice, err);
      }
    }).open();
  }

  private getAllTags(): string[] {
    return Object.keys(this.app.metadataCache.getTags())
      .map(tag => tag.replace(/^#/, ''))
      .sort();
  }

  private getFilesByTag(tag: string): TFile[] {
    return this.app.vault.getMarkdownFiles().filter(f => {
      const cache = this.app.metadataCache.getFileCache(f);
      const inlineTags = cache?.tags?.map(t => t.tag.replace('#', '')) ?? [];
      const fmTags = cache?.frontmatter?.tags ?? [];
      const allTags = [...inlineTags, ...(Array.isArray(fmTags) ? fmTags : [fmTags])];
      return allTags.includes(tag);
    });
  }

  private async saveMoc(filename: string, content: string, noteCount: number) {
    const existing = this.app.vault.getAbstractFileByPath(filename);
    let mocFile: TFile;
    if (existing instanceof TFile) {
      await this.app.vault.modify(existing, content);
      mocFile = existing;
    } else {
      mocFile = await this.app.vault.create(filename, content);
    }
    await this.app.workspace.getLeaf().openFile(mocFile);
    new Notice(t('notice_moc_done', noteCount));
  }

  private packFromFolder() {
    const folders = this.getFolders();
    new FolderSuggest(this.app, folders, (folder) => this.packFromFolderPath(folder)).open();
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
      }, (cur, total) => setProgress(`⏳ ${cur} / ${total}`), controller.signal);
      notice.hide();
      await this.saveContextPack(content, `folder-${title}`, files.length);
    } catch (err) {
      this.handlePackError(notice, err);
    }
  }

  private packFromTag() {
    new TagSuggest(this.app, this.getAllTags(), async (tag) => {
      const files = this.getFilesByTag(tag);
      if (files.length === 0) { new Notice(t('notice_no_files')); return; }
      const { notice, controller, setProgress } = this.startProgress(t('notice_packing'));
      try {
        const content = await buildContextPack(files, this.app, this.formatOptions(), {
          title: tag, source: `tag:${tag}`,
        }, (cur, total) => setProgress(`⏳ ${cur} / ${total}`), controller.signal);
        notice.hide();
        await this.saveContextPack(content, `tag-${tag}`, files.length);
      } catch (err) {
        this.handlePackError(notice, err);
      }
    }).open();
  }

  private async packFromMoc(moc: TFile) {
    const cache = this.app.metadataCache.getFileCache(moc);
    const links = cache?.links?.map(l => l.link) ?? [];

    if (links.length === 0) {
      new Notice(t('notice_no_links'));
      return;
    }

    const files: TFile[] = [];
    for (const link of links) {
      const linked = this.app.metadataCache.getFirstLinkpathDest(link, moc.path);
      if (linked instanceof TFile && linked.extension === 'md') {
        files.push(linked);
      }
    }

    if (files.length === 0) {
      new Notice(t('notice_no_files'));
      return;
    }

    const { notice, controller, setProgress } = this.startProgress(t('notice_packing'));
    try {
      const content = await buildContextPack(files, this.app, this.formatOptions(), {
        title: moc.basename,
        source: `moc:${moc.basename}`,
      }, (cur, total) => setProgress(`⏳ ${cur} / ${total}`), controller.signal);
      notice.hide();
      await this.saveContextPack(content, `moc-${moc.basename}`, files.length);
    } catch (err) {
      this.handlePackError(notice, err);
    }
  }

  private async saveContextPack(content: string, slug: string, noteCount: number): Promise<void> {
    const date = window.moment().format('YYYYMMDD');
    const filename = `pack-${slug}-${date}.md`;

    try {
      const blob = new Blob([content], { type: 'text/markdown' });
      if (Platform.isDesktop && !this.settings.outputFolder) {
        downloadBlob(blob, filename);
      } else {
        const folder = this.settings.outputFolder || '';
        const path = folder ? `${folder}/${filename}` : filename;
        const existing = this.app.vault.getAbstractFileByPath(path);
        if (existing instanceof TFile) {
          await this.app.vault.modify(existing, content);
        } else {
          await this.app.vault.create(path, content);
        }
        new Notice(`${t('notice_pack_done', noteCount)}\n📄 ${path}`, 8000);
        return;
      }
      new Notice(t('notice_pack_done', noteCount), 5000);
    } catch (err) {
      console.error('[Context Pack] Failed to save pack:', err);
      new Notice(t('notice_error'));
    }
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
    private onChoose: (folder: string) => void
  ) {
    super(app);
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

function promptText(app: App, placeholder: string): Promise<string | null> {
  return new Promise(resolve => {
    const modal = new class extends SuggestModal<string> {
      getSuggestions(query: string): string[] { return query ? [query] : []; }
      renderSuggestion(val: string, el: HTMLElement): void { el.setText(val); }
      onChooseSuggestion(val: string): void { resolve(val); }
      onClose(): void { resolve(null); }
    }(app);
    modal.setPlaceholder(placeholder);
    modal.open();
  });
}
