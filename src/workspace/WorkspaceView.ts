import { ItemView, WorkspaceLeaf, Notice, moment, TFile } from 'obsidian';
import type ContextPackPlugin from '../main';
import type { WorkspaceConfig, WorkspaceState, ArtifactState } from './workspaceTypes';
import { computeWorkspaceState } from './workspaceState';
import { FolderWorkspaceSuggest } from './FolderWorkspaceSuggest';

export const WORKSPACE_VIEW_TYPE = 'ai-workspace-view';

const STATUS_ICON: Record<string, string> = {
  ready:   '✅',
  outdated: '⚠',
  missing:  '❌',
  error:    '⛔',
};

const STATUS_LABEL: Record<string, string> = {
  ready:   'Ready',
  outdated: 'Outdated',
  missing:  'Not created',
  error:    'Error',
};

const ARTIFACT_LABEL: Record<string, string> = {
  aiBrief:     'AI Brief',
  aiMoc:       'AI MOC',
  contextPack: 'Context Pack',
  epub:        'Knowledge Book',
};

export class WorkspaceView extends ItemView {
  private plugin: ContextPackPlugin;
  private states = new Map<string, WorkspaceState>();
  private loading = false;
  private refreshingAll = false;

  constructor(leaf: WorkspaceLeaf, plugin: ContextPackPlugin) {
    super(leaf);
    this.plugin = plugin;
  }

  getViewType(): string { return WORKSPACE_VIEW_TYPE; }
  getDisplayText(): string { return 'AI Workspace'; }
  getIcon(): string { return 'layout-dashboard'; }

  async onOpen(): Promise<void> { await this.refresh(); }
  async onClose(): Promise<void> {}

  async refresh(): Promise<void> {
    this.loading = true;
    this.render();

    const workspaces = this.plugin.settings.workspaces ?? [];
    this.states.clear();

    const outputFolder = this.plugin.settings.contextPackOutputFolder || this.plugin.settings.outputFolder || '';
    const packRegistry = this.plugin.settings.packRegistry;

    for (const ws of workspaces) {
      try {
        const state = await computeWorkspaceState(this.app, ws, outputFolder, packRegistry);
        this.states.set(ws.id, state);
      } catch (e) {
        console.error('[AI Workspace] Failed to compute state for', ws.name, e);
      }
    }

    this.loading = false;
    this.render();
  }

  private render(): void {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.addClass('ai-context-workspace-view');
    containerEl.removeClass('ai-context-workspace-view--dark');
    if (this.plugin.settings.workspaceViewDark) {
      containerEl.addClass('ai-context-workspace-view--dark');
    }

    const header = containerEl.createEl('div', { cls: 'ai-context-workspace-header' });
    header.createEl('span', { text: 'AI Workspace', cls: 'ai-context-workspace-title' });

    const headerActions = header.createEl('div', { cls: 'ai-context-workspace-header-actions' });

    const addBtn = headerActions.createEl('button', {
      cls: 'ai-context-workspace-button ai-context-workspace-button--secondary',
      text: '＋ Add Folder',
    });
    addBtn.addEventListener('click', () => this.openAddFolder());

    const refreshAllBtn = headerActions.createEl('button', {
      cls: 'ai-context-workspace-button',
      text: this.refreshingAll ? 'Refreshing…' : 'Refresh All',
    });
    refreshAllBtn.disabled = this.refreshingAll;
    refreshAllBtn.addEventListener('click', () => void this.refreshAll());

    const themeBtn = headerActions.createEl('button', {
      cls: 'ai-context-workspace-icon-btn',
      text: this.plugin.settings.workspaceViewDark ? '☀' : '🌙',
    });
    themeBtn.setAttribute('title', this.plugin.settings.workspaceViewDark ? 'Switch to light' : 'Switch to dark');
    themeBtn.addEventListener('click', () => {
      this.plugin.settings.workspaceViewDark = !this.plugin.settings.workspaceViewDark;
      void this.plugin.saveSettings().then(() => this.render());
    });

    if (this.loading) {
      containerEl.createEl('div', { cls: 'ai-context-workspace-loading', text: 'Loading workspaces…' });
      return;
    }

    const workspaces = this.plugin.settings.workspaces ?? [];

    if (workspaces.length === 0) {
      this.renderEmpty(containerEl);
      return;
    }

    const list = containerEl.createEl('div', { cls: 'ai-context-workspace-list' });
    for (const ws of workspaces) {
      this.renderCard(list, ws, this.states.get(ws.id));
    }
  }

  private renderEmpty(container: HTMLElement): void {
    const empty = container.createEl('div', { cls: 'ai-context-workspace-empty' });
    empty.createEl('div', { cls: 'ai-context-workspace-empty-icon', text: '🗂' });
    empty.createEl('p', { cls: 'ai-context-workspace-empty-title', text: 'No workspaces yet.' });
    empty.createEl('p', {
      cls: 'ai-context-workspace-empty-desc',
      text: 'Create a folder workspace to manage AI Briefs, AI MOCs, Context Packs, and Knowledge Books in one place.',
    });
    const btn = empty.createEl('button', {
      cls: 'ai-context-workspace-button',
      text: '＋ Add Folder Workspace',
    });
    btn.addEventListener('click', () => this.openAddFolder());
  }

  private renderCard(container: HTMLElement, ws: WorkspaceConfig, state?: WorkspaceState): void {
    const card = container.createEl('div', { cls: 'ai-context-workspace-card' });

    const titleRow = card.createEl('div', { cls: 'ai-context-workspace-card-titlerow' });
    titleRow.createEl('span', { cls: 'ai-context-workspace-card-title', text: '📁 ' + ws.name });

    const removeBtn = titleRow.createEl('button', {
      cls: 'ai-context-workspace-card-remove',
      text: '✕',
    });
    removeBtn.setAttribute('title', 'Remove workspace');
    removeBtn.addEventListener('click', () => void this.removeWorkspace(ws.id));

    if (!state) {
      card.createEl('div', { cls: 'ai-context-workspace-error', text: '⛔ Error loading workspace state.' });
      return;
    }

    if (!state.folderExists) {
      card.createEl('div', {
        cls: 'ai-context-workspace-error',
        text: `⛔ Folder not found: ${ws.sourcePath}`,
      });
      return;
    }

    const meta = card.createEl('div', { cls: 'ai-context-workspace-meta' });
    const notesLabel = `${state.notesCount} ${state.notesCount === 1 ? 'note' : 'notes'}`;
    meta.createEl('span', { text: notesLabel });
    if (state.sourceLatestMtime > 0) {
      meta.createEl('span', {
        cls: 'ai-context-workspace-meta-sep',
        text: ' · ',
      });
      meta.createEl('span', {
        cls: 'ai-context-workspace-meta-muted',
        text: 'Updated ' + moment(state.sourceLatestMtime).fromNow(),
      });
    } else {
      meta.createEl('span', { cls: 'ai-context-workspace-meta-muted', text: ' · Not generated yet' });
    }

    const grid = card.createEl('div', { cls: 'ai-context-workspace-status-grid' });
    this.renderStatusRow(grid, ARTIFACT_LABEL.aiBrief, state.aiBrief);
    this.renderStatusRow(grid, ARTIFACT_LABEL.aiMoc, state.aiMoc);
    this.renderStatusRow(grid, ARTIFACT_LABEL.contextPack, state.contextPack);
    this.renderStatusRow(grid, ARTIFACT_LABEL.epub, state.epub);

    const actions = card.createEl('div', { cls: 'ai-context-workspace-actions' });
    const hasBrief = state.aiBrief.status !== 'missing';

    if (!hasBrief) {
      const genBtn = actions.createEl('button', {
        cls: 'ai-context-workspace-button',
        text: 'Generate',
      });
      genBtn.addEventListener('click', () => void this.runRefresh(ws, state, genBtn));
    } else {
      if (state.aiBrief.filePath) {
        const openBriefBtn = actions.createEl('button', {
          cls: 'ai-context-workspace-button ai-context-workspace-button--secondary',
          text: 'Open Brief',
        });
        openBriefBtn.addEventListener('click', () => void this.openFile(state.aiBrief.filePath!));
      }

      if (state.aiMoc.filePath) {
        const openMocBtn = actions.createEl('button', {
          cls: 'ai-context-workspace-button ai-context-workspace-button--secondary',
          text: 'Open MOC',
        });
        openMocBtn.addEventListener('click', () => void this.openFile(state.aiMoc.filePath!));
      }

      const exportBtn = actions.createEl('button', {
        cls: 'ai-context-workspace-button ai-context-workspace-button--secondary',
        text: 'Export Pack',
      });
      exportBtn.addEventListener('click', () => this.plugin.workspaceExportPack(ws.sourcePath));

      const epubBtn = actions.createEl('button', {
        cls: 'ai-context-workspace-button ai-context-workspace-button--secondary',
        text: 'Create EPUB',
      });
      epubBtn.addEventListener('click', () => void this.plugin.workspaceCreateEpub(ws.sourcePath));

      const refreshBtn = actions.createEl('button', {
        cls: 'ai-context-workspace-button',
        text: 'Refresh',
      });
      refreshBtn.addEventListener('click', () => void this.runRefresh(ws, state, refreshBtn));
    }
  }

  private renderStatusRow(container: HTMLElement, label: string, artifact: ArtifactState): void {
    const row = container.createEl('div', { cls: 'ai-context-workspace-status-row' });
    row.createEl('span', { cls: 'ai-context-workspace-status-icon', text: STATUS_ICON[artifact.status] ?? '❌' });
    row.createEl('span', { cls: 'ai-context-workspace-status-label', text: label });
    row.createEl('span', {
      cls: `ai-context-workspace-badge ai-context-workspace-badge-${artifact.status}`,
      text: STATUS_LABEL[artifact.status] ?? 'Unknown',
    });
  }

  private async openFile(filePath: string): Promise<void> {
    const file = this.app.vault.getAbstractFileByPath(filePath);
    if (file instanceof TFile) {
      await this.app.workspace.getLeaf(false).openFile(file);
    } else {
      new Notice('File not found: ' + filePath);
    }
  }

  private openAddFolder(): void {
    const allFolders = this.getAllFolders();
    const existing = new Set((this.plugin.settings.workspaces ?? []).map(w => w.sourcePath));
    const available = allFolders.filter(f => !existing.has(f));

    if (available.length === 0) {
      new Notice('All available folders are already added as workspaces.');
      return;
    }

    new FolderWorkspaceSuggest(this.app, available, (folder) => {
      void this.addWorkspace(folder);
    }).open();
  }

  private async addWorkspace(folderPath: string): Promise<void> {
    const name = folderPath.split('/').pop() ?? folderPath;
    const config: WorkspaceConfig = {
      id: Date.now().toString(),
      name,
      sourceType: 'folder',
      sourcePath: folderPath,
      createdAt: Date.now(),
    };

    if (!this.plugin.settings.workspaces) {
      this.plugin.settings.workspaces = [];
    }
    this.plugin.settings.workspaces.push(config);
    await this.plugin.saveSettings();
    await this.refresh();
  }

  private async removeWorkspace(id: string): Promise<void> {
    this.plugin.settings.workspaces = (this.plugin.settings.workspaces ?? []).filter(w => w.id !== id);
    await this.plugin.saveSettings();
    this.states.delete(id);
    this.render();
  }

  private async runRefresh(ws: WorkspaceConfig, currentState: WorkspaceState, btn: HTMLButtonElement): Promise<void> {
    if (currentState.notesCount === 0) {
      new Notice(`No notes found in: ${ws.sourcePath}`);
      return;
    }

    btn.disabled = true;
    btn.setText('Working…');

    try {
      new Notice(`Refreshing ${ws.name}…`, 0);
      const briefFile = await this.plugin.workspaceRefreshBrief(ws.sourcePath);
      if (briefFile) {
        await this.plugin.workspaceRefreshMoc(briefFile);
      }

      const outputFolder = this.plugin.settings.contextPackOutputFolder || this.plugin.settings.outputFolder || '';
      const newState = await computeWorkspaceState(this.app, ws, outputFolder, this.plugin.settings.packRegistry);
      this.states.set(ws.id, newState);
      new Notice(`${ws.name} refreshed.`);
    } catch (e) {
      console.error('[AI Workspace] Refresh failed', e);
      new Notice(`Refresh failed for ${ws.name}.`);
    } finally {
      this.render();
    }
  }

  private async refreshAll(): Promise<void> {
    this.refreshingAll = true;
    this.render();

    const workspaces = this.plugin.settings.workspaces ?? [];
    let refreshed = 0;

    for (const ws of workspaces) {
      const state = this.states.get(ws.id);
      if (!state?.folderExists || state.notesCount === 0) continue;

      new Notice(`Refreshing ${ws.name}…`, 2000);

      try {
        const briefFile = await this.plugin.workspaceRefreshBrief(ws.sourcePath);
        if (briefFile) {
          await this.plugin.workspaceRefreshMoc(briefFile);
        }

        const outputFolder = this.plugin.settings.contextPackOutputFolder || this.plugin.settings.outputFolder || '';
        const newState = await computeWorkspaceState(this.app, ws, outputFolder, this.plugin.settings.packRegistry);
        this.states.set(ws.id, newState);
        refreshed++;
      } catch (e) {
        console.error('[AI Workspace] Refresh failed for', ws.name, e);
      }
    }

    new Notice(`Workspace refresh completed. (${refreshed} updated)`);
    this.refreshingAll = false;
    this.render();
  }

  private getAllFolders(): string[] {
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
