import { App, SuggestModal } from 'obsidian';

export class FolderWorkspaceSuggest extends SuggestModal<string> {
  constructor(
    app: App,
    private folders: string[],
    private onChoose: (folder: string) => void,
  ) {
    super(app);
    this.setPlaceholder('Type to search folders...');
  }

  getSuggestions(query: string): string[] {
    const lower = query.toLowerCase();
    return this.folders.filter(f => f.toLowerCase().includes(lower));
  }

  renderSuggestion(folder: string, el: HTMLElement): void {
    el.createEl('div', { text: '📁 ' + folder });
  }

  onChooseSuggestion(folder: string): void {
    this.onChoose(folder);
  }
}
