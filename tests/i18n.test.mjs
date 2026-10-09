import { test } from 'node:test'
import assert from 'node:assert/strict'
import { STRINGS, PROGRAM_NAMES_ES } from '../src/lib/strings.mjs'
import { CHANGES } from '../src/lib/changes-data.mjs'
import { initialLang, t } from '../src/lib/i18n.mjs'

test('every English string has a Spanish version', () => {
  const missing = Object.keys(STRINGS.en).filter((k) => !(k in STRINGS.es))
  assert.deepEqual(missing, [])
  for (const e of [...CHANGES.a, ...CHANGES.b]) if (e.kind === 'program') assert(PROGRAM_NAMES_ES[e.program], `program: ${e.program}`)
})

// sample values for every template variable
const SAMPLE = { moves: true, scenario: 'Escenario A', n: 1, share: '50%', sqShare: '48%', moving: '27%', closures: 14, boundary: 38,
  program: 'inmersión en español', from: 'Scott', to: 'Rigler', school: 'Scott', before: 'Rigler', after: 'Scott', langs: 'español',
  as: ' como escuela de inmersión en español', a: 'Rigler', b: 'Scott', when: 'hoy', lost: 'Bridger', name: 'Scott', parts: 'Lincoln (54%)',
  last: 'Wells-Barnett (46%)', detail: '', others: '', band: 'K–5' }

test('Spanish follows the style guide: usted, no tú/vos', () => {
  const all = Object.values(STRINGS.es).map((v) => (typeof v === 'function' ? v(SAMPLE) : v)).flat().join(' ')
  // forms that only exist for tú/vos ("elige"/"escribe" are also third person, so they are not checked)
  for (const w of [/\btú\b/i, /\bvos\b/i, /\btienes\b/i, /\bpuedes\b/i, /\bquieres\b/i, /\beres\b/i, /\bhaz\b/i, /\btu\b/i]) assert(!w.test(all), `informal form: ${w}`)
})

test('language choice: link, then browser, then English', () => {
  assert.equal(initialLang('es', ['en-US']), 'es')
  assert.equal(initialLang(null, ['es-MX', 'en']), 'es')
  assert.equal(initialLang(null, ['en-US']), 'en')
  assert.equal(initialLang('xx', []), 'en')
  assert.equal(t('es', 'scenario.sq'), 'Sin cambios')
  assert.equal(t('es', 'no-such-key'), 'no-such-key')
})

test('PPS map labels keep school names and translate the description', async () => {
  const { mapLabel } = await import('../src/lib/i18n.mjs')
  assert.equal(mapLabel('es', 'Scott K-5 Neighborhood'), 'Scott (K-5, del vecindario)')
  assert.equal(mapLabel('es', 'Beach School Closed'), 'Beach (escuela cerrada)')
  assert.equal(mapLabel('es', 'Roseway Heights Middle School Spanish Immersion, Vietnamese Immersion'),
    'Roseway Heights (escuela intermedia, inmersión en español, inmersión en vietnamita)')
  assert.equal(mapLabel('es', 'Winterhaven K-8 Focus/ Option'), 'Winterhaven (K-8, programa especial)')
  assert.equal(mapLabel('en', 'Scott K-5 Neighborhood'), 'Scott K-5 Neighborhood')
})
