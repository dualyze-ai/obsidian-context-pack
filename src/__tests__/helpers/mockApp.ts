import { TFile, TFolder } from 'obsidian';

export interface FileSpec {
  path: string;
  mtime: number;
  frontmatter?: Record<string, unknown>;
}

export interface BinaryFileSpec {
  path: string;
  mtime: number;
}

function makeTFile(path: string, mtime: number): TFile {
  const f = new TFile();
  const parts = path.split('/');
  f.name = parts[parts.length - 1];
  f.path = path;
  const dot = f.name.lastIndexOf('.');
  f.basename = dot >= 0 ? f.name.slice(0, dot) : f.name;
  f.extension = dot >= 0 ? f.name.slice(dot + 1) : '';
  f.stat = { mtime, ctime: 0, size: 0 };
  return f;
}

function makeTFolder(path: string): TFolder {
  const folder = new TFolder();
  folder.path = path;
  folder.name = path.split('/').pop() ?? path;
  return folder;
}

export function buildMockApp(spec: {
  markdownFiles?: FileSpec[];
  binaryFiles?: BinaryFileSpec[];
  folders?: string[];
}) {
  const mdFiles = (spec.markdownFiles ?? []).map(f => makeTFile(f.path, f.mtime));
  const binFiles = (spec.binaryFiles ?? []).map(f => makeTFile(f.path, f.mtime));
  const folders = (spec.folders ?? []).map(p => makeTFolder(p));

  const fmMap = new Map<string, Record<string, unknown>>();
  (spec.markdownFiles ?? []).forEach(f => {
    if (f.frontmatter) fmMap.set(f.path, f.frontmatter);
  });

  const allAbstract = [...mdFiles, ...binFiles, ...folders];

  return {
    vault: {
      getMarkdownFiles: () => mdFiles,
      getAbstractFileByPath: (path: string) =>
        allAbstract.find(f => f.path === path) ?? null,
      modify: jest.fn().mockResolvedValue(undefined),
      create: jest.fn().mockResolvedValue(makeTFile('__created__', Date.now())),
    },
    metadataCache: {
      getFileCache: (file: TFile) => {
        const fm = fmMap.get(file.path);
        return fm ? { frontmatter: fm } : null;
      },
    },
  };
}
