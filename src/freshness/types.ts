export interface FileRecord {
  path: string;
  mtime: number;
  size: number;
}

export interface PackRecord {
  name: string;
  source: {
    type: 'folder' | 'tag' | 'moc' | 'daily';
    query: string;
  };
  target: 'chatgpt' | 'claude' | 'gemini' | 'notebooklm';
  createdAt: number;
  files: FileRecord[];
}

export type FreshnessLevel = 'fresh' | 'warn' | 'stale';

export interface PackCheckResult {
  key: string;
  level: FreshnessLevel;
  freshnessScore: number;
  matchedCount: number;
  unchanged: string[];
  updated: string[];
  added: string[];
  missing: string[];
}

export interface FreshnessSettings {
  warnThreshold: number;
  staleThreshold: number;
}

export const DEFAULT_FRESHNESS_SETTINGS: FreshnessSettings = {
  warnThreshold: 0.01,
  staleThreshold: 0.20,
};

export const TARGET_LABEL: Record<PackRecord['target'], string> = {
  chatgpt:    'ChatGPT Projects',
  claude:     'Claude Project',
  gemini:     'Gemini',
  notebooklm: 'NotebookLM',
};
