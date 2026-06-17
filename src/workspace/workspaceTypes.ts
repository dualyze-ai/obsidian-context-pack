export interface WorkspaceConfig {
  id: string;
  name: string;
  sourceType: 'folder';
  sourcePath: string;
  createdAt: number;
}

export type ArtifactStatus = 'ready' | 'outdated' | 'missing' | 'error';

export interface ArtifactState {
  status: ArtifactStatus;
  filePath?: string;
  mtime?: number;
}

export interface WorkspaceState {
  notesCount: number;
  sourceLatestMtime: number;
  folderExists: boolean;
  aiBrief: ArtifactState;
  aiMoc: ArtifactState;
  contextPack: ArtifactState;
  epub: ArtifactState;
}
