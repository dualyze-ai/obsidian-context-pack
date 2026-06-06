import { ItemView, WorkspaceLeaf, Notice, moment } from 'obsidian';
import type ContextPackPlugin from '../main';
import { type PackRecord, type PackCheckResult, type FreshnessLevel, TARGET_LABEL } from './types';
import { checkAllPacks, packKey } from './checker';

export const FRESHNESS_VIEW_TYPE = 'freshness-view';

const LEVEL_LABEL: Record<FreshnessLevel, string> = {
  fresh: '最新',
  warn:  '要確認',
  stale: '古い',
};

export class FreshnessView extends ItemView {
  private plugin: ContextPackPlugin;
  private results: PackCheckResult[] = [];
  private loading = false;

  constructor(leaf: WorkspaceLeaf, plugin: ContextPackPlugin) {
    super(leaf);
    this.plugin = plugin;
  }

  getViewType(): string { return FRESHNESS_VIEW_TYPE; }
  getDisplayText(): string { return 'Project Knowledge Packs'; }
  getIcon(): string { return 'activity'; }

  async onOpen(): Promise<void> { await this.refresh(); }
  async onClose(): Promise<void> {}

  async refresh(): Promise<void> {
    this.loading = true;
    this.render();
    const packs = this.plugin.settings.packRegistry ?? [];
    this.results = await checkAllPacks(this.app, packs, this.plugin.settings.freshnessSettings);
    this.results.sort((a, b) => a.freshnessScore - b.freshnessScore);
    this.loading = false;
    this.render();
  }

  private render(): void {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.addClass('cp-freshness-view');
    containerEl.removeClass('cp-freshness-view--dark');
    if (this.plugin.settings.freshnessViewDark) {
      containerEl.addClass('cp-freshness-view--dark');
    }

    const header = containerEl.createEl('div', { cls: 'cp-freshness-header' });
    header.createEl('h4', { text: 'Project Knowledge Packs', cls: 'cp-freshness-title' });

    const controls = header.createEl('div', { cls: 'cp-freshness-controls' });

    const darkBtn = controls.createEl('button', {
      cls: 'cp-freshness-icon-btn',
      text: this.plugin.settings.freshnessViewDark ? '☀️' : '🌙',
    });
    darkBtn.setAttribute('title', this.plugin.settings.freshnessViewDark ? 'ライトモード' : 'ダークモード');
    darkBtn.addEventListener('click', async () => {
      this.plugin.settings.freshnessViewDark = !this.plugin.settings.freshnessViewDark;
      await this.plugin.saveSettings();
      this.render();
    });

    const refreshBtn = controls.createEl('button', { cls: 'cp-freshness-icon-btn', text: '↻' });
    refreshBtn.setAttribute('title', 'Refresh');
    refreshBtn.addEventListener('click', () => void this.refresh());

    if (this.loading) {
      containerEl.createEl('div', { cls: 'cp-freshness-loading', text: 'Checking freshness…' });
      return;
    }

    const packs = this.plugin.settings.packRegistry ?? [];

    if (packs.length === 0) {
      containerEl.createEl('div', {
        cls: 'cp-freshness-empty',
        text: 'No packs yet. Generate a pack to start tracking freshness.',
      });
      return;
    }

    this.renderSummary(containerEl);
    this.renderPackList(containerEl, packs);
  }

  private renderSummary(container: HTMLElement): void {
    const freshCount = this.results.filter((r) => r.level === 'fresh').length;
    const warnCount  = this.results.filter((r) => r.level === 'warn').length;
    const staleCount = this.results.filter((r) => r.level === 'stale').length;

    const summary = container.createEl('div', { cls: 'cp-freshness-summary' });
    const items: Array<{ label: string; count: number; cls: string }> = [
      { label: '最新',   count: freshCount, cls: 'fresh' },
      { label: '要確認', count: warnCount,  cls: 'warn'  },
      { label: '古い',   count: staleCount, cls: 'stale' },
    ];
    for (const item of items) {
      const chip = summary.createEl('span', { cls: `cp-freshness-chip cp-freshness-chip--${item.cls}` });
      chip.createEl('span', { cls: 'cp-freshness-chip-count', text: String(item.count) });
      chip.createEl('span', { cls: 'cp-freshness-chip-label', text: ` ${item.label}` });
    }
  }

  private renderPackList(container: HTMLElement, packs: PackRecord[]): void {
    const list = container.createEl('div', { cls: 'cp-freshness-list' });
    for (const result of this.results) {
      const pack = packs.find((p) => packKey(p.source, p.target) === result.key);
      if (!pack) continue;
      this.renderPackRow(list, pack, result);
    }
  }

  private renderPackRow(container: HTMLElement, pack: PackRecord, result: PackCheckResult): void {
    const row = container.createEl('div', { cls: `cp-freshness-row cp-freshness-row--${result.level}` });

    const border = row.createEl('div', { cls: `cp-freshness-border cp-freshness-border--${result.level}` });
    border.createEl('span', { cls: `cp-freshness-dot cp-freshness-dot--${result.level}` });

    const body = row.createEl('div', { cls: 'cp-freshness-body' });

    // ── Top line: name + target badge + level chip + delete button
    const topLine = body.createEl('div', { cls: 'cp-freshness-topline' });
    topLine.createEl('span', { cls: 'cp-freshness-pack-name', text: pack.name });

    const targetBadge = topLine.createEl('span', {
      cls: 'cp-freshness-target-badge',
      text: TARGET_LABEL[pack.target],
    });
    targetBadge.setAttribute('data-target', pack.target);

    // Per-row level chip
    topLine.createEl('span', {
      cls: `cp-freshness-row-chip cp-freshness-chip--${result.level}`,
      text: LEVEL_LABEL[result.level],
    });

    // Delete button (spacer pushes it to right)
    topLine.createEl('span', { cls: 'cp-freshness-topline-spacer' });
    const deleteBtn = topLine.createEl('button', {
      cls: 'cp-freshness-delete-btn',
      text: '✕',
    });
    deleteBtn.setAttribute('title', 'このパックを削除');
    deleteBtn.addEventListener('click', () => void this.deletePack(pack));

    // ── Count
    const countEl = body.createEl('div', { cls: 'cp-freshness-count' });
    countEl.setText(this.buildCountText(result));

    // ── Meta
    const metaLine = body.createEl('div', { cls: 'cp-freshness-meta' });
    metaLine.setText(`投入 ${moment(pack.createdAt).format('MM/DD')} ・ 現在 ${moment().format('MM/DD')}`);

    // ── Missing warning
    if (result.missing.length > 0) {
      body.createEl('div', {
        cls: 'cp-freshness-missing',
        text: `⚠ ${result.missing.length} Not Found`,
      });
    }

    // ── Actions (warn / stale only)
    if (result.level !== 'fresh') {
      const actions = body.createEl('div', { cls: 'cp-freshness-actions' });

      const diffBtn = actions.createEl('button', {
        cls: 'cp-freshness-btn cp-freshness-btn--secondary',
        text: '差分を見る',
      });
      diffBtn.addEventListener('click', () => {
        new Notice('差分表示は近日公開予定です。');
      });

      const reBtn = actions.createEl('button', {
        cls: 'cp-freshness-btn cp-freshness-btn--primary',
        text: '再エクスポート',
      });
      reBtn.addEventListener('click', () => void this.plugin.reExportPack(pack));
    }
  }

  private buildCountText(result: PackCheckResult): string {
    if (result.level === 'fresh') return `最新 / ${result.matchedCount} ノート`;

    const parts: string[] = [];
    if (result.updated.length > 0) parts.push(`${result.updated.length} 更新`);
    if (result.added.length > 0)   parts.push(`${result.added.length} 新規`);

    return `${parts.join(' ・ ')} / ${result.matchedCount} ノート`;
  }

  private async deletePack(pack: PackRecord): Promise<void> {
    const key = packKey(pack.source, pack.target);
    this.plugin.settings.packRegistry = this.plugin.settings.packRegistry.filter(
      (p) => packKey(p.source, p.target) !== key,
    );
    await this.plugin.saveSettings();
    await this.refresh();
  }
}
