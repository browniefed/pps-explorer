import { STRINGS } from './strings.mjs'

export const LANGS = { en: 'English', es: 'Español' }
export const DEFAULT_LANG = 'en'

// Pick the starting language: the link's lang=, else the browser's language, else English.
export function initialLang(hashLang, navigatorLanguages = []) {
  if (hashLang && hashLang in LANGS) return hashLang
  const first = navigatorLanguages.find((l) => l) ?? ''
  return first.toLowerCase().startsWith('es') ? 'es' : DEFAULT_LANG
}

// t(lang, key, vars): look up a string (or a function of vars). Falls back to English, so a missing
// translation shows English rather than nothing.
export function t(lang, key, vars = {}) {
  const v = STRINGS[lang]?.[key] ?? STRINGS.en[key]
  if (v === undefined) return key
  return typeof v === 'function' ? v(vars) : v
}

// A list read aloud naturally: "A, B and C" / "A, B y C"
export function list(lang, items) {
  const and = lang === 'es' ? ' y ' : ' and '
  return items.length < 3 ? items.join(and) : `${items.slice(0, -1).join(', ')}${and}${items.at(-1)}`
}

// Percent and numbers in the reader's format ("80%" / "80 %")
export function pct(lang, x) {
  return new Intl.NumberFormat(lang === 'es' ? 'es-US' : 'en-US', { style: 'percent', maximumFractionDigits: 0 }).format(x)
}

// PPS map labels ("Scott K-5 Neighborhood", "Beach School Closed", "Kelly K-5 Russian Immersion"):
// school names stay as they are; the descriptive words are translated.
const LABEL_ES = [
  [/\bSchool Closed\b/, 'escuela cerrada'],
  [/\bBuilding Closed\b/, 'edificio cerrado'],
  [/\bNeighborhood\/ ?Immersion\b/, 'del vecindario e inmersión'],
  [/\bNeighborhood\b/, 'del vecindario'],
  [/\bFocus\/ ?Option\b/, 'programa especial'],
  [/\bMiddle School\b/, 'escuela intermedia'],
  [/\bHigh School\b/, 'escuela preparatoria'],
  [/\b(Spanish|Mandarin|Vietnamese|Japanese|Russian) Immersion\b/g, (_, l) => `inmersión en ${{ Spanish: 'español', Mandarin: 'mandarín', Vietnamese: 'vietnamita', Japanese: 'japonés', Russian: 'ruso' }[l]}`],
]
// "Beach School Closed" -> "Beach (escuela cerrada)", "Scott K-5 Neighborhood" -> "Scott (K-5, del vecindario)"
export function mapLabel(lang, label) {
  if (lang !== 'es') return label
  const m = label.match(/\s(K-5|K-8|K-12|2-8|Middle School|High School|School Closed|Building Closed|Neighborhood|Focus)\b/)
  if (!m) return label
  const name = label.slice(0, m.index)
  let rest = label.slice(m.index).trim()
  for (const [re, to] of LABEL_ES) rest = rest.replace(re, to)
  // one comma between descriptors: "K-5 del vecindario" -> "K-5, del vecindario"
  rest = rest.replace(/,?\s+(del vecindario|inmersión|programa especial|escuela)/g, ', $1').replace(/^, /, '')
  return `${name} (${rest})`
}
