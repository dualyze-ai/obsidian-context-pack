import { App, Plugin, TFile, SuggestModal, Notice } from 'obsidian';
import { SettingsTab, DEFAULT_SETTINGS, type PluginSettings } from './settings';
import { exportVault } from './exporter';
import { buildContextPack } from './context-pack';
import { t } from './i18n';

export default class ContextPackPlugin extends Plugin {
  settings!: PluginSettings;

  async onload() {
    await this.loadSettings();
    this.addSettingTab(new SettingsTab(this.app, this));

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

  private async packFromFolder() {
    const folders = this.getFolders();
    new FolderSuggest(this.app, folders, async (folder) => {
      const files = this.app.vault.getMarkdownFiles()
        .filter(f => f.path.startsWith(folder + '/'));

      if (files.length === 0) {
        new Notice(t('notice_no_files'));
        return;
      }

      const title = folder.split('/').pop() ?? folder;
      const content = await buildContextPack(files, this.app, this.formatOptions(), {
        title,
        source: `folder:${folder}`,
      });

      await this.saveContextPack(content, `folder-${title}`);
    }).open();
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

    const content = await buildContextPack(files, this.app, this.formatOptions(), {
      title: tag,
      source: `tag:${tag}`,
    });

    await this.saveContextPack(content, `tag-${tag}`);
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

    const content = await buildContextPack(files, this.app, this.formatOptions(), {
      title: moc.basename,
      source: `moc:${moc.basename}`,
    });

    await this.saveContextPack(content, `moc-${moc.basename}`);
  }

  private async saveContextPack(content: string, slug: string): Promise<void> {
    const date = window.moment().format('YYYYMMDD');
    const filename = `pack-${slug}-${date}.md`;
    const folder = this.settings.contextPackOutputFolder || this.settings.outputFolder;
    const path = folder ? `${folder}/${filename}` : filename;

    try {
      const existing = this.app.vault.getAbstractFileByPath(path);
      if (existing instanceof TFile) {
        await this.app.vault.modify(existing, content);
      } else {
        await this.app.vault.create(path, content);
      }
      new Notice(t('notice_pack_done', content.split('\n## ').length - 1));
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
