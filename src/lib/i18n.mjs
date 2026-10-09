import { LANGUAGE_NAMES_ES, PROGRAM_NAMES_ES, STRINGS } from './strings.mjs'
import ru from './locales/ru.mjs'
import so from './locales/so.mjs'
import vi from './locales/vi.mjs'
import zh from './locales/zh.mjs'

// Every language the app offers. English and Spanish live in strings.mjs (Spanish memo sentences sit
// next to the English in changes-data.mjs as detail_es / text_es); the others are one file each in
// locales/. A locale may leave any string out: t() falls back to English.
//   name      shown in the language picker, in its own language
//   locale    Intl locale for numbers and percents
//   and/sep   how lists join: "A, B and C"
//   memo      board-memo sentences, keyed by the English text in changes-data.mjs
//   programs  program names from the memo, as used inside sentences
//   languages immersion language names, as used inside sentences
//   label     words for PPS map labels ("Neighborhood", "School Closed", ...)
//   reviewed  false until a native speaker has checked it; shows strings.translationNote
export const LOCALES = {
  en: { name: 'English', locale: 'en-US', and: ' and ', sep: ', ', strings: STRINGS.en, reviewed: true },
  es: {
    name: 'Español', locale: 'es-US', and: ' y ', sep: ', ', strings: STRINGS.es, reviewed: true,
    programs: PROGRAM_NAMES_ES, languages: LANGUAGE_NAMES_ES,
    label: {
      middle: 'escuela intermedia', high: 'escuela preparatoria', closed: 'escuela cerrada', buildingClosed: 'edificio cerrado',
      neighborhoodImmersion: 'del vecindario e inmersión', neighborhood: 'del vecindario', focus: 'programa especial',
      immersion: (l) => `inmersión en ${LANGUAGE_NAMES_ES[l] ?? l}`,
    },
  },
  vi, ru, so, zh,
}

export const LANGS = Object.fromEntries(Object.entries(LOCALES).map(([k, v]) => [k, v.name]))
export const DEFAULT_LANG = 'en'

// Pick the starting language: the link's lang=, else the browser's language, else English.
export function initialLang(hashLang, navigatorLanguages = []) {
  if (hashLang && hashLang in LOCALES) return hashLang
  for (const l of navigatorLanguages) {
    const code = (l ?? '').toLowerCase().split('-')[0]
    if (code in LOCALES) return code
  }
  return DEFAULT_LANG
}

// t(lang, key, vars): look up a string (or a function of vars). Falls back to English, so a missing
// translation shows English rather than nothing.
export function t(lang, key, vars = {}) {
  const v = LOCALES[lang]?.strings?.[key] ?? STRINGS.en[key]
  if (v === undefined) return key
  return typeof v === 'function' ? v(vars) : v
}

// A list read naturally: "A, B and C" / "A, B y C" / "A、B和C"
export function list(lang, items) {
  const { and, sep } = LOCALES[lang] ?? LOCALES.en
  return items.length < 3 ? items.join(and) : `${items.slice(0, -1).join(sep)}${and}${items.at(-1)}`
}

export function pct(lang, x) {
  try {
    return new Intl.NumberFormat(LOCALES[lang]?.locale ?? 'en-US', { style: 'percent', maximumFractionDigits: 0 }).format(x)
  } catch {
    return `${Math.round(x * 100)}%`
  }
}

export const programName = (program, lang) => LOCALES[lang]?.programs?.[program] ?? program
export const languageName = (language, lang) => LOCALES[lang]?.languages?.[language] ?? language

// A translated field of a board-memo event: detail_es / text_es inline, else the locale's memo table.
export function memoText(e, field, lang) {
  const english = e[field]
  if (!english || lang === 'en') return english
  return e[`${field}_${lang}`] ?? LOCALES[lang]?.memo?.[english] ?? english
}

// PPS map labels ("Scott K-5 Neighborhood", "Beach School Closed", "Kelly K-5 Russian Immersion"):
// the school name stays; the descriptive words are translated and listed in parentheses,
// "Beach (escuela cerrada)", "Scott (K-5, del vecindario)".
const LABEL_TOKEN = /(K-5|K-8|K-12|2-8)|(Middle School)|(High School)|(School Closed)|(Building Closed)|(Neighborhood\/ ?Immersion)|(Neighborhood)|(Focus\/ ?Option)|(Spanish|Mandarin|Vietnamese|Japanese|Russian) Immersion/g
export function mapLabel(lang, label) {
  const words = LOCALES[lang]?.label
  if (!words) return label
  const first = label.search(/\s(K-5|K-8|K-12|2-8|Middle School|High School|School Closed|Building Closed|Neighborhood|Focus)\b/)
  if (first < 0) return label
  const name = label.slice(0, first)
  const parts = []
  for (const m of label.slice(first).matchAll(LABEL_TOKEN)) {
    if (m[1]) parts.push(m[1])
    else if (m[2]) parts.push(words.middle)
    else if (m[3]) parts.push(words.high)
    else if (m[4]) parts.push(words.closed)
    else if (m[5]) parts.push(words.buildingClosed)
    else if (m[6]) parts.push(words.neighborhoodImmersion)
    else if (m[7]) parts.push(words.neighborhood)
    else if (m[8]) parts.push(words.focus)
    else if (m[9]) parts.push(words.immersion(m[9]))
  }
  const [open, close] = words.parens ?? [' (', ')']
  return `${name}${open}${parts.join(words.sep ?? ', ')}${close}`
}
