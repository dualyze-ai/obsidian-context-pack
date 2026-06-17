import { ItemView, WorkspaceLeaf, Notice, moment, TFile, TFolder, setIcon } from 'obsidian';
import type ContextPackPlugin from '../main';
import type { WorkspaceConfig, WorkspaceState, ArtifactState } from './workspaceTypes';
import { computeWorkspaceState } from './workspaceState';
import { FolderWorkspaceSuggest } from './FolderWorkspaceSuggest';

export const WORKSPACE_VIEW_TYPE = 'ai-workspace-view';

const STATUS_ICON: Record<string, string> = {
  ready:   '✓',
  outdated: '⚠',
  missing:  '✕',
  error:    '⛔',
};

const STATUS_LABEL: Record<string, string> = {
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

  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(leaf: WorkspaceLeaf, plugin: ContextPackPlugin) {
    super(leaf);
    this.plugin = plugin;
  }

  getViewType(): string { return WORKSPACE_VIEW_TYPE; }
  getDisplayText(): string { return 'AI Workspace'; }
  getIcon(): string { return 'briefcase-business'; }

  async onOpen(): Promise<void> {
    this.registerEvent(
      this.app.vault.on('modify', (file) => {
        const workspaces = this.plugin.settings.workspaces ?? [];
        const affected = workspaces.some(ws =>
          file.path.startsWith(ws.sourcePath + '/') && file.path.endsWith('.md')
        );
        if (!affected) return;
        if (this.debounceTimer) clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => { void this.refresh(); }, 2000);
      })
    );
    await this.refresh();
  }

  async onClose(): Promise<void> {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
  }

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

    const titleRow = header.createEl('div', { cls: 'ai-context-workspace-header-titlerow' });
    const titleEl = titleRow.createEl('div', { cls: 'ai-context-workspace-title' });
    const titleIcon = titleEl.createEl('span', { cls: 'ai-context-workspace-title-icon' });
    setIcon(titleIcon, 'briefcase-business');
    titleEl.createEl('span', { text: 'AI Workspace' });

    const headerActions = titleRow.createEl('div', { cls: 'ai-context-workspace-header-actions' });

    const isEmpty = (this.plugin.settings.workspaces ?? []).length === 0;
    const addBtn = headerActions.createEl('button', {
      cls: 'ai-context-workspace-button ai-context-workspace-button--secondary' + (isEmpty ? ' ai-context-workspace-button--pulse' : ''),
      text: '＋ Add Workspace',
    });
    addBtn.addEventListener('click', () => this.openAddFolder());

    const refreshAllBtn = headerActions.createEl('button', {
      cls: 'ai-context-workspace-button',
      text: this.refreshingAll ? 'Refreshing…' : 'Refresh All',
    });
    refreshAllBtn.disabled = this.refreshingAll;
    refreshAllBtn.addEventListener('click', () => void this.refresh());

    const themeBtn = headerActions.createEl('button', {
      cls: 'ai-context-workspace-icon-btn',
      text: this.plugin.settings.workspaceViewDark ? '☀' : '🌙',
    });
    themeBtn.setAttribute('title', this.plugin.settings.workspaceViewDark ? 'Switch to light' : 'Switch to dark');
    themeBtn.addEventListener('click', () => {
      this.plugin.settings.workspaceViewDark = !this.plugin.settings.workspaceViewDark;
      void this.plugin.saveSettings().then(() => this.render());
    });

    // ⑤ Global stats (shown after loading completes)
    if (!this.loading && !isEmpty) {
      const totalNotes = Array.from(this.states.values()).reduce((s, ws) => s + ws.notesCount, 0);
      const readyOutputs = Array.from(this.states.values()).reduce((s, ws) =>
        s + [ws.aiBrief, ws.aiMoc, ws.contextPack, ws.epub].filter(a => a.status === 'ready').length, 0
      );
      const wsCount = (this.plugin.settings.workspaces ?? []).length;
      const totalOutputs = wsCount * 4;
      const pctReady = totalOutputs > 0 ? Math.round((readyOutputs / totalOutputs) * 100) : 0;
      header.createEl('div', {
        cls: 'ai-context-workspace-stats',
        text: `${wsCount} ${wsCount === 1 ? 'Workspace' : 'Workspaces'} · ${totalNotes} Notes · ${pctReady}% Ready`,
      });
    }

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
  }

  private renderCard(container: HTMLElement, ws: WorkspaceConfig, state?: WorkspaceState): void {
    const card = container.createEl('div', { cls: 'ai-context-workspace-card' });

    const titleRow = card.createEl('div', { cls: 'ai-context-workspace-card-titlerow' });
    titleRow.createEl('span', { cls: 'ai-context-workspace-card-title', text: '📁 ' + ws.name });

    const titleActions = titleRow.createEl('div', { cls: 'ai-context-workspace-card-title-actions' });

    const openFolderBtn = titleActions.createEl('button', { cls: 'ai-context-workspace-card-folder-btn' });
    setIcon(openFolderBtn, 'folder-open');
    openFolderBtn.setAttribute('title', `Open source folder: ${ws.sourcePath}`);
    openFolderBtn.addEventListener('click', () => void this.openFolderInExplorer(ws.sourcePath));

    const outputFolder = this.plugin.settings.contextPackOutputFolder || this.plugin.settings.outputFolder || '';
    if (outputFolder) {
      const openOutputBtn = titleActions.createEl('button', { cls: 'ai-context-workspace-card-folder-btn' });
      setIcon(openOutputBtn, 'folder-up');
      openOutputBtn.setAttribute('title', `Open output folder: ${outputFolder}`);
      openOutputBtn.addEventListener('click', () => void this.openFolderInExplorer(outputFolder));
    }

    const removeBtn = titleActions.createEl('button', {
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

    // Meta row: notes count + last refreshed
    const notesLabel = `${state.notesCount} ${state.notesCount === 1 ? 'note' : 'notes'}`;
    const meta = card.createEl('div', { cls: 'ai-context-workspace-meta' });
    meta.createEl('span', { text: notesLabel });
    if (state.sourceLatestMtime > 0) {
      meta.createEl('span', { cls: 'ai-context-workspace-meta-sep', text: ' · ' });
      meta.createEl('span', {
        cls: 'ai-context-workspace-meta-muted',
        text: 'Last refreshed ' + moment(state.sourceLatestMtime).fromNow(),
      });
    } else {
      meta.createEl('span', { cls: 'ai-context-workspace-meta-muted', text: ' · Not refreshed yet' });
    }

    // ③ Progress bar: X/4 outputs ready
    const artifacts = [state.aiBrief, state.aiMoc, state.contextPack, state.epub];
    const readyCount = artifacts.filter(a => a.status === 'ready').length;
    const allReady = readyCount === artifacts.length;
    const pct = Math.round((readyCount / artifacts.length) * 100);
    const progressRow = card.createEl('div', { cls: 'ai-context-workspace-progress-row' });
    const barWrap = progressRow.createEl('div', { cls: 'ai-context-workspace-progress-bar-wrap' });
    barWrap.createEl('div', {
      cls: 'ai-context-workspace-progress-bar-fill' + (allReady ? ' ai-context-workspace-progress-bar-fill--full' : ''),
      attr: { style: `width: ${pct}%` },
    });
    progressRow.createEl('span', {
      cls: 'ai-context-workspace-progress-label' + (allReady ? ' ai-context-workspace-progress-label--ready' : ''),
      text: `${readyCount}/4 outputs ready`,
    });

    // Status rows
    const grid = card.createEl('div', { cls: 'ai-context-workspace-status-grid' });
    this.renderStatusRow(grid, ARTIFACT_LABEL.aiBrief, state.aiBrief);
    this.renderStatusRow(grid, ARTIFACT_LABEL.aiMoc, state.aiMoc);
    this.renderStatusRow(grid, ARTIFACT_LABEL.contextPack, state.contextPack);
    this.renderStatusRow(grid, ARTIFACT_LABEL.epub, state.epub);

    // Buttons
    const actions = card.createEl('div', { cls: 'ai-context-workspace-actions' });
    const hasBrief = state.aiBrief.status !== 'missing';

    if (!hasBrief) {
      const allMissing = state.aiMoc.status === 'missing' &&
        state.contextPack.status === 'missing' &&
        state.epub.status === 'missing';
      const genBtn = actions.createEl('button', {
        cls: 'ai-context-workspace-button ai-context-workspace-button--block' + (allMissing ? ' ai-context-workspace-button--pulse' : ''),
        text: 'Generate Workspace',
      });
      genBtn.addEventListener('click', () => void this.runRefresh(ws, state, genBtn));
    } else {
      // ② Primary: Refresh Workspace (full-width, accent)
      const refreshBtn = actions.createEl('button', {
        cls: 'ai-context-workspace-button ai-context-workspace-button--accent ai-context-workspace-button--block',
        text: 'Refresh Workspace',
      });
      refreshBtn.addEventListener('click', () => void this.runRefresh(ws, state, refreshBtn));

      // Secondary: individual artifact actions
      actions.createEl('div', { cls: 'ai-context-workspace-actions-label', text: 'Generate Outputs' });
      const secondary = actions.createEl('div', { cls: 'ai-context-workspace-actions-secondary' });

      const exportBtn = secondary.createEl('button', {
        cls: 'ai-context-workspace-button ai-context-workspace-button--secondary',
        text: 'Export Pack',
      });
      exportBtn.addEventListener('click', () => this.plugin.workspaceExportPack(ws.sourcePath));

      const epubBtn = secondary.createEl('button', {
        cls: 'ai-context-workspace-button ai-context-workspace-button--secondary',
        text: 'Create EPUB',
      });
      epubBtn.addEventListener('click', async () => {
        epubBtn.disabled = true;
        epubBtn.setText('Creating…');
        try {
          await this.plugin.workspaceCreateEpub(ws.sourcePath);
        } finally {
          await this.refresh();
        }
      });
    }
  }

  private renderStatusRow(container: HTMLElement, label: string, artifact: ArtifactState): void {
    const row = container.createEl('div', { cls: 'ai-context-workspace-status-row' });
    row.createEl('span', {
      cls: `ai-context-workspace-status-icon ai-context-workspace-status-icon--${artifact.status}`,
      text: STATUS_ICON[artifact.status] ?? '✕',
    });
    row.createEl('span', { cls: 'ai-context-workspace-status-label', text: label });

    const right = row.createEl('div', { cls: 'ai-context-workspace-status-row-right' });
    if (artifact.filePath) {
      const openBtn = right.createEl('button', { cls: 'ai-context-workspace-open-btn', text: 'Open' });
      openBtn.addEventListener('click', () => void this.openFile(artifact.filePath!));
    }
    // ① Only show badge for non-ready statuses
    if (artifact.status !== 'ready') {
      right.createEl('span', {
        cls: `ai-context-workspace-badge ai-context-workspace-badge-${artifact.status}`,
        text: STATUS_LABEL[artifact.status] ?? 'Unknown',
      });
    }
  }

  private async openFolderInExplorer(folderPath: string): Promise<void> {
    const folder = this.app.vault.getAbstractFileByPath(folderPath);
    if (!(folder instanceof TFolder)) {
      new Notice('Folder not found: ' + folderPath);
      return;
    }
    // @ts-ignore
    const fileExpPlugin = (this.app as any).internalPlugins?.plugins?.['file-explorer'];
    if (fileExpPlugin?.enabled && fileExpPlugin.instance?.revealInFolder) {
      fileExpPlugin.instance.revealInFolder(folder);
      return;
    }
    const leaves = this.app.workspace.getLeavesOfType('file-explorer');
    if (leaves.length > 0) {
      await this.app.workspace.revealLeaf(leaves[0]);
    }
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

    const notice = new Notice(`Refreshing ${ws.name}…`, 0);
    try {
      const briefFile = await this.plugin.workspaceRefreshBrief(ws.sourcePath);
      if (briefFile) {
        await this.plugin.workspaceRefreshMoc(briefFile);
      }

      const outputFolder = this.plugin.settings.contextPackOutputFolder || this.plugin.settings.outputFolder || '';
      const newState = await computeWorkspaceState(this.app, ws, outputFolder, this.plugin.settings.packRegistry);
      this.states.set(ws.id, newState);
      notice.hide();
      new Notice(`${ws.name} refreshed.`);
    } catch (e) {
      console.error('[AI Workspace] Refresh failed', e);
      notice.hide();
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

      const wsNotice = new Notice(`Refreshing ${ws.name}…`, 0);

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
      } finally {
        wsNotice.hide();
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
