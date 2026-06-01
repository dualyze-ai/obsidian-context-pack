export type OutputTarget =
  | 'notebooklm-zip'
  | 'notebooklm-text'
  | 'chatgpt'
  | 'claude'
  | 'gemini'
  | 'claude-code'
  | 'custom';

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
  },
  'claude-code': {
    target: 'claude-code',
    label: 'Claude Code',
    description: 'Copy to clipboard and paste into Claude Code',
    format: 'text',
    copyToClipboard: true,
    saveToFile: true,
    maxTokens: 50000,
    contextLimit: 200000,
    aiUrl: 'https://claude.ai/code',
    available: true,
    supportsStarterPrompt: false,
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
  },
};
