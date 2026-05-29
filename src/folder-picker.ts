import { App, SuggestModal } from 'obsidian';

export class FolderPickerModal extends SuggestModal<string> {
  private folders: string[];

  constructor(app: App, placeholder: string, private onChoose: (folder: string) => void) {
    super(app);
    this.setPlaceholder(placeholder);
    const set = new Set<string>();
    for (const file of app.vault.getMarkdownFiles()) {
      const parts = file.path.split('/');
      for (let i = 1; i < parts.length; i++) {
        set.add(parts.slice(0, i).join('/'));
      }
    }
    this.folders = Array.from(set).sort();
  }

  getSuggestions(query: string): string[] {
    const lower = query.toLowerCase();
    return this.folders.filter(f => f.toLowerCase().includes(lower));
  }

  renderSuggestion(folder: string, el: HTMLElement): void {
    el.setText(folder);
  }

  onChooseSuggestion(folder: string): void {
    this.onChoose(folder);
  }
}
