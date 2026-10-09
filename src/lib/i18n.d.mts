export type Lang = 'en' | 'es'
export const LANGS: Record<Lang, string>
export const DEFAULT_LANG: Lang
export function initialLang(hashLang: string | null | undefined, navigatorLanguages?: readonly string[]): Lang
export function t(lang: Lang, key: string, vars?: Record<string, unknown>): string
export function list(lang: Lang, items: string[]): string
export function pct(lang: Lang, x: number): string
export function mapLabel(lang: Lang, label: string): string
