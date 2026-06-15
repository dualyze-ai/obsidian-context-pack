export type OutputTarget =
  | 'notebooklm-zip'
  | 'notebooklm-text'
  | 'chatgpt'
  | 'claude'
  | 'gemini'
  | 'claude-code'
  | 'epub'
  | 'custom';

export type OutputKind = 'chat' | 'agent';

export type OutputTab = 'chatgpt' | 'claude' | 'gemini' | 'agents' | 'epub';

export type EpubSortStrategy = 'current' | 'title' | 'filename' | 'ai-brief';

export interface EpubExportOptions {
  bookTitle: string;
  includeBrief: boolean;
  includeToc: boolean;
  includeSourceNotes: boolean;
  stripFrontmatter: boolean;
  convertObsidianLinks: boolean;
  sortStrategy: EpubSortStrategy;
}

export type ChatGPTMode = 'chat' | 'projects';
export type ClaudeMode  = 'chat' | 'project';
export type GeminiMode  = 'chat' | 'notebook';
export type AgentMode   = 'claudecode' | 'notebooklm';

export interface OutputSelectorState {
  activeTab:   OutputTab;
  chatgptMode: ChatGPTMode;
  claudeMode:  ClaudeMode;
  geminiMode:  GeminiMode;
  agentMode:   AgentMode;
}

export const DEFAULT_OUTPUT_SELECTOR_STATE: OutputSelectorState = {
  activeTab:   'chatgpt',
  chatgptMode: 'chat',
  claudeMode:  'chat',
  geminiMode:  'chat',
  agentMode:   'claudecode',
};

export function getOutputTargetFromState(state: OutputSelectorState): OutputTarget {
  switch (state.activeTab) {
    case 'chatgpt': return 'chatgpt';
    case 'claude':  return 'claude';
    case 'gemini':  return 'gemini';
    case 'agents':  return state.agentMode === 'claudecode' ? 'claude-code' : 'notebooklm-text';
    case 'epub':    return 'epub';
  }
}

export interface OutputPreset {
  target: OutputTarget;
  label: string;
  description: string;
  format: 'zip' | 'text' | 'aimd';
  copyToClipboard: boolean;
  saveToFile: boolean;
  maxTokens: number;
  contextLimit: number;
  aiUrl?: string;
  available: boolean;
  supportsStarterPrompt: boolean;
  outputKind: OutputKind;
}

export interface PromptProfile {
  id: string;
  ai: OutputTarget;
  mode?: string;
  prompt: string;
}

export type ModeId = string;

export interface ModeDefinition {
  id: string;
  nameKey: string;
  descriptionKey: string;
  promptKey: string;
  category?: string;
}

export const MODES: ModeDefinition[] = [
  { id: 'none',        nameKey: 'mode_none_name',        descriptionKey: 'mode_none_desc',        promptKey: '' },
  { id: 'research',    nameKey: 'mode_research_name',    descriptionKey: 'mode_research_desc',    promptKey: 'mode_research_prompt' },
  { id: 'learning',    nameKey: 'mode_learning_name',    descriptionKey: 'mode_learning_desc',    promptKey: 'mode_learning_prompt' },
  { id: 'writing',     nameKey: 'mode_writing_name',     descriptionKey: 'mode_writing_desc',     promptKey: 'mode_writing_prompt' },
  { id: 'development', nameKey: 'mode_development_name', descriptionKey: 'mode_development_desc', promptKey: 'mode_development_prompt' },
];

export function buildProfileMap(profiles: PromptProfile[]): Record<string, PromptProfile> {
  return Object.fromEntries(profiles.map(p => [p.id, p]));
}

export const OUTPUT_PRESETS: Record<OutputTarget, OutputPreset> = {
  'notebooklm-zip': {
    target: 'notebooklm-zip',
    label: 'NotebookLM (ZIP)',
    description: 'Export as ZIP and upload to NotebookLM as a source',
    format: 'zip',
    copyToClipboard: false,
    saveToFile: true,
    maxTokens: 500000,
    contextLimit: 500000,
    available: true,
    supportsStarterPrompt: true,
    outputKind: 'chat',
  },
  'notebooklm-text': {
    target: 'notebooklm-text',
    label: 'NotebookLM (text)',
    description: 'Save as a text file and upload to NotebookLM as a source',
    format: 'text',
    copyToClipboard: false,
    saveToFile: true,
    maxTokens: 500000,
    contextLimit: 500000,
    available: true,
    supportsStarterPrompt: true,
    outputKind: 'chat',
  },
  'chatgpt': {
    target: 'chatgpt',
    label: 'ChatGPT',
    description: 'Copy to clipboard and paste into ChatGPT',
    format: 'text',
    copyToClipboard: true,
    saveToFile: true,
    maxTokens: 100000,
    contextLimit: 128000,
    aiUrl: 'https://chat.openai.com/',
    available: true,
    supportsStarterPrompt: true,
    outputKind: 'chat',
  },
  'claude': {
    target: 'claude',
    label: 'Claude',
    description: 'Copy to clipboard and paste into Claude',
    format: 'text',
    copyToClipboard: true,
    saveToFile: true,
    maxTokens: 180000,
    contextLimit: 200000,
    aiUrl: 'https://claude.ai/',
    available: true,
    supportsStarterPrompt: true,
    outputKind: 'chat',
  },
  'gemini': {
    target: 'gemini',
    label: 'Gemini',
    description: 'Copy to clipboard and paste into Gemini',
    format: 'text',
    copyToClipboard: true,
    saveToFile: true,
    maxTokens: 800000,
    contextLimit: 1000000,
    aiUrl: 'https://gemini.google.com/',
    available: true,
    supportsStarterPrompt: true,
    outputKind: 'chat',
  },
  'claude-code': {
    target: 'claude-code',
    label: 'Claude Code (Agent Context)',
    description: 'Copy to clipboard and paste into Claude Code',
    format: 'text',
    copyToClipboard: true,
    saveToFile: true,
    maxTokens: 50000,
    contextLimit: 200000,
    aiUrl: 'https://claude.ai/code',
    available: true,
    supportsStarterPrompt: true,
    outputKind: 'agent',
  },
  'epub': {
    target: 'epub',
    label: 'EPUB',
    description: 'Export as EPUB e-book (Kindle, Apple Books, Calibre)',
    format: 'text',
    copyToClipboard: false,
    saveToFile: false,
    maxTokens: 0,
    contextLimit: 0,
    available: true,
    supportsStarterPrompt: false,
    outputKind: 'chat',
  },
  'custom': {
    target: 'custom',
    label: 'Custom',
    description: 'Configure your own output format',
    format: 'text',
    copyToClipboard: true,
    saveToFile: true,
    maxTokens: 100000,
    contextLimit: 100000,
    available: false,
    supportsStarterPrompt: true,
    outputKind: 'chat',
  },
};
