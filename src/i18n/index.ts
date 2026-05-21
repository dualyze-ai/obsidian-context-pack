import en from './en';
import ja from './ja';

const locales: Record<string, Record<string, unknown>> = { en, ja };

export function t(key: string, ...args: unknown[]): string {
  const lang = window.moment?.locale() ?? 'en';
  const val = locales[lang]?.[key] ?? locales['en'][key] ?? key;
  return typeof val === 'function' ? (val as (...a: unknown[]) => string)(...args) : String(val);
}
