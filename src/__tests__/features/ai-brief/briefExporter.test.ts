import { TFile } from 'obsidian';
import { BriefExporter } from '../../../features/ai-brief/brief-exporter';

function makeMockApp(existingPath?: string) {
  const existingFile = existingPath
    ? Object.assign(new TFile(), { path: existingPath, name: existingPath.split('/').pop()! })
    : null;

  return {
    vault: {
      getAbstractFileByPath: (p: string) => (p === existingPath ? existingFile : null),
      modify: jest.fn().mockResolvedValue(undefined),
      create: jest.fn().mockImplementation((path: string, content: string) => {
        const f = new TFile();
        f.path = path;
        f.name = path.split('/').pop()!;
        return Promise.resolve(f);
      }),
    },
  };
}

describe('BriefExporter.save', () => {
  test('creates file with generatedBy frontmatter', async () => {
    const app = makeMockApp();
    const exporter = new BriefExporter(app as any);
    await exporter.save('# Content', 'travel', '', undefined);

    expect(app.vault.create).toHaveBeenCalledWith(
      'travel-AI-Brief.md',
      expect.stringContaining('generatedBy: ai-brief-generator'),
    );
  });

  test('includes sourceFolder in frontmatter when provided', async () => {
    const app = makeMockApp();
    const exporter = new BriefExporter(app as any);
    await exporter.save('# Content', 'travel', 'Output', 'travel');

    const [, content] = (app.vault.create as jest.Mock).mock.calls[0];
    expect(content).toContain('sourceFolder: travel');
    expect(content).toContain('generatedBy: ai-brief-generator');
  });

  test('omits sourceFolder line when sourceFolder is undefined', async () => {
    const app = makeMockApp();
    const exporter = new BriefExporter(app as any);
    await exporter.save('# Content', 'travel', 'Output', undefined);

    const [, content] = (app.vault.create as jest.Mock).mock.calls[0];
    expect(content).not.toContain('sourceFolder');
    expect(content).toContain('generatedBy: ai-brief-generator');
  });

  test('saves to outputFolder/name-AI-Brief.md when outputFolder is set', async () => {
    const app = makeMockApp();
    const exporter = new BriefExporter(app as any);
    await exporter.save('# Content', 'travel', 'Output', 'travel');

    const [path] = (app.vault.create as jest.Mock).mock.calls[0];
    expect(path).toBe('Output/travel-AI-Brief.md');
  });

  test('saves to root when outputFolder is empty', async () => {
    const app = makeMockApp();
    const exporter = new BriefExporter(app as any);
    await exporter.save('# Content', 'travel', '', 'travel');

    const [path] = (app.vault.create as jest.Mock).mock.calls[0];
    expect(path).toBe('travel-AI-Brief.md');
  });

  test('updates existing file instead of creating new one', async () => {
    const app = makeMockApp('Output/travel-AI-Brief.md');
    const exporter = new BriefExporter(app as any);
    await exporter.save('# Content', 'travel', 'Output', 'travel');

    expect(app.vault.modify).toHaveBeenCalled();
    expect(app.vault.create).not.toHaveBeenCalled();
  });

  test('sanitizes title with forbidden chars in filename', async () => {
    const app = makeMockApp();
    const exporter = new BriefExporter(app as any);
    await exporter.save('# Content', 'my/folder:name', 'Output', undefined);

    const [path] = (app.vault.create as jest.Mock).mock.calls[0];
    expect(path).toBe('Output/my-folder-name-AI-Brief.md');
    expect(path).not.toContain('/Output/my/');
  });
});
