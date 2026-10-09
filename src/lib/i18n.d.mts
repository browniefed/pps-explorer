export type Lang = 'en' | 'es' | 'vi' | 'ru' | 'so' | 'zh'
export type Locale = {
  name: string; locale: string; and: string; sep: string; reviewed: boolean
  strings: Record<string, unknown>
  memo?: Record<string, string>
  programs?: Record<string, string>
  languages?: Record<string, string>
  label?: Record<string, unknown>
}
export const LOCALES: Record<Lang, Locale>
export const LANGS: Record<Lang, string>
export const DEFAULT_LANG: Lang
export function initialLang(hashLang: string | null | undefined, navigatorLanguages?: readonly string[]): Lang
export function t(lang: Lang, key: string, vars?: Record<string, unknown>): string
export function list(lang: Lang, items: string[]): string
export function pct(lang: Lang, x: number): string
export function programName(program: string, lang: Lang): string
export function languageName(language: string, lang: Lang): string
export function memoText(e: Record<string, any>, field: 'detail' | 'text', lang: Lang): string | undefined
export function mapLabel(lang: Lang, label: string): string
