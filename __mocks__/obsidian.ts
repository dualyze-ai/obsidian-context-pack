export class App {}

export class TAbstractFile {
  path = '';
  name = '';
}

export class TFile extends TAbstractFile {
  basename = '';
  extension = 'md';
  stat = { mtime: 0, ctime: 0, size: 0 };
}

export class TFolder extends TAbstractFile {
  children: TAbstractFile[] = [];
  isRoot() { return false; }
}

export class Modal {
  app: App;
  contentEl: HTMLElement;
  titleEl: HTMLElement;
  modalEl: HTMLElement;

  constructor(app: App) {
    this.app = app;
    this.contentEl = document.createElement('div');
    this.titleEl = document.createElement('div');
    this.modalEl = document.createElement('div');
  }

  open() { this.onOpen(); }
  close() { this.onClose(); }
  onOpen() {}
  onClose() {}
  setTitle(title: string) { this.titleEl.textContent = title; return this; }
}

export class Notice {
  constructor(public message: string, public duration?: number) {}
  hide() {}
  setMessage(message: string) { this.message = message; }
}

export const Platform = {
  isDesktop: true,
  isMobile: false,
};

export class SuggestModal<T> {
  app: App;
  inputEl: HTMLInputElement;
  resultContainerEl: HTMLElement;

  constructor(app: App) {
    this.app = app;
    this.inputEl = document.createElement('input');
    this.resultContainerEl = document.createElement('div');
  }

  open() {}
  close() {}
  getSuggestions(_query: string): T[] { return []; }
  renderSuggestion(_item: T, _el: HTMLElement) {}
  onChooseSuggestion(_item: T, _evt: MouseEvent | KeyboardEvent) {}
  setPlaceholder(_placeholder: string) { return this; }
}

export class FuzzySuggestModal<T> extends SuggestModal<T> {
  getItems(): T[] { return []; }
  getItemText(_item: T): string { return ''; }
  onChooseItem(_item: T, _evt: MouseEvent | KeyboardEvent) {}
}

export class Plugin {
  app: App = new App();
  manifest = {};
  settings = {};
  addCommand(_cmd: unknown) {}
  addRibbonIcon(_icon: string, _title: string, _cb: unknown) {}
  addSettingTab(_tab: unknown) {}
  registerEvent(_evt: unknown) {}
  async loadData() { return {}; }
  async saveData(_data: unknown) {}
}

export class PluginSettingTab {
  app: App;
  containerEl: HTMLElement;

  constructor(app: App, _plugin: unknown) {
    this.app = app;
    this.containerEl = document.createElement('div');
  }

  display() {}
}

export class Setting {
  nameEl: HTMLElement;
  descEl: HTMLElement;
  settingEl: HTMLElement;

  constructor(_containerEl: HTMLElement) {
    this.nameEl = document.createElement('div');
    this.descEl = document.createElement('div');
    this.settingEl = document.createElement('div');
  }

  setName(name: string) { this.nameEl.textContent = name; return this; }
  setDesc(desc: string) { this.descEl.textContent = desc; return this; }
  setDisabled(_disabled: boolean) { return this; }
  addText(_cb: unknown) { return this; }
  addToggle(_cb: unknown) { return this; }
  addButton(_cb: unknown) { return this; }
  addDropdown(_cb: unknown) { return this; }
}

export class Menu {
  addItem(_cb: unknown) { return this; }
  addSeparator() { return this; }
  showAtMouseEvent(_evt: MouseEvent) {}
}

export function moment() {
  return {
    format: (_fmt: string) => '20260101',
  };
}

export const moment_static = moment;

export function getAllTags(cache: { tags?: Array<{ tag: string }> }): string[] {
  return cache.tags?.map((t) => t.tag) ?? [];
}

export class ItemView {
  app: App;
  containerEl: HTMLElement;
  leaf: unknown;

  constructor(leaf: unknown) {
    this.app = new App();
    this.leaf = leaf;
    this.containerEl = document.createElement('div');
  }

  getViewType(): string { return ''; }
  getDisplayText(): string { return ''; }
  getIcon(): string { return ''; }
  async onOpen(): Promise<void> {}
  async onClose(): Promise<void> {}
}

export class WorkspaceLeaf {}
