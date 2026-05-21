import { App, Plugin, TFile, TFolder, SuggestModal, Notice } from 'obsidian';
import { SettingsTab, DEFAULT_SETTINGS, type PluginSettings } from './settings';
import { exportVault, downloadBlob } from './exporter';
import { buildContextPack } from './context-pack';
import { t } from './i18n';

export default class ContextPackPlugin extends Plugin {
  settings!: PluginSettings;

  async onload() {
    await this.loadSettings();
    this.addSettingTab(new SettingsTab(this.app, this));

    this.addRibbonIcon('package', t('ribbon_tooltip'), () => this.packFromFolder());

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
        if (!checking) this.runExport(file);
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
        }
        if (file instanceof TFile && file.extension === 'md') {
          menu.addItem(item => item
            .setTitle(t('menu_export_note'))
            .setIcon('download')
            .onClick(() => this.runExport(file)));
          menu.addItem(item => item
            .setTitle(t('menu_pack_moc'))
            .setIcon('list')
            .onClick(() => this.packFromMoc(file)));
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

  private async runExport(singleFile?: TFile) {
    await exportVault(this.app, {
      ...this.formatOptions(),
      targetFolder: this.settings.targetFolder,
      outputFolder: this.settings.outputFolder,
      flattenStructure: this.settings.flattenStructure,
      openAfterExport: this.settings.openAfterExport,
    }, singleFile);
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
    const notice = new Notice(t('notice_exporting'), 0);
    notice.noticeEl.addClass('cp-progress');
    const content = await buildContextPack(files, this.app, this.formatOptions(), {
      title,
      source: `folder:${folderPath}`,
    }, (cur, total) => notice.setMessage(`⏳ Context Pack を作成中 ${cur} / ${total}`));
    notice.hide();

    await this.saveContextPack(content, `folder-${title}`, files.length);
  }

  private async packFromTag() {
    const tag = await promptText(this.app, t('prompt_tag_name'));
    if (!tag) return;

    const files = this.app.vault.getMarkdownFiles().filter(f => {
      const cache = this.app.metadataCache.getFileCache(f);
      const tags = cache?.tags?.map(t => t.tag.replace('#', '')) ?? [];
      const fmTags = cache?.frontmatter?.tags ?? [];
      const allTags = [...tags, ...(Array.isArray(fmTags) ? fmTags : [fmTags])];
      return allTags.includes(tag);
    });

    if (files.length === 0) {
      new Notice(t('notice_no_files'));
      return;
    }

    const notice = new Notice(t('notice_exporting'), 0);
    notice.noticeEl.addClass('cp-progress');
    const content = await buildContextPack(files, this.app, this.formatOptions(), {
      title: tag,
      source: `tag:${tag}`,
    }, (cur, total) => notice.setMessage(`⏳ Context Pack を作成中 ${cur} / ${total}`));
    notice.hide();

    await this.saveContextPack(content, `tag-${tag}`, files.length);
  }

  private async packFromMoc(moc: TFile) {
    const cache = this.app.metadataCache.getFileCache(moc);
    const links = cache?.links?.map(l => l.link) ?? [];

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

    const notice = new Notice(t('notice_exporting'), 0);
    notice.noticeEl.addClass('cp-progress');
    const content = await buildContextPack(files, this.app, this.formatOptions(), {
      title: moc.basename,
      source: `moc:${moc.basename}`,
    }, (cur, total) => notice.setMessage(`⏳ Context Pack を作成中 ${cur} / ${total}`));
    notice.hide();

    await this.saveContextPack(content, `moc-${moc.basename}`, files.length);
  }

  private async saveContextPack(content: string, slug: string, noteCount: number): Promise<void> {
    const date = window.moment().format('YYYYMMDD');
    const filename = `pack-${slug}-${date}.md`;

    try {
      const blob = new Blob([content], { type: 'text/markdown' });
      downloadBlob(blob, filename);
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
