// Proposed changes for Scenarios A and B, transcribed from the PPS board packet for October 6, 2026:
//   memo  = "Rightsizing Update: Scenario Release" board memo (Oct 5, 2026)
//   region = regional summaries (Oct 3–4, 2026) and the district-wide comparison (Oct 4, 2026)
// School names follow the scenario maps. Keep wording close to the source; don't infer beyond it.

export const SOURCES = {
  memo: 'PPS board memo, Rightsizing Update: Scenario Release (Oct 5, 2026)',
  region: 'PPS regional summaries and district-wide scenario comparison (Oct 3–4, 2026)',
}

// District-wide figures are projections for 2031–32 (district-wide comparison).
export const SUMMARY = {
  a: { closures: 14, boundaryChanges: 38, programMoves: 13, gradeChanges: 8, studentsChangingSchools: 0.27, studentsInSustainableSchools: 0.8 },
  b: { closures: 11, boundaryChanges: 34, programMoves: 12, gradeChanges: 8, studentsChangingSchools: 0.24, studentsInSustainableSchools: 0.73 },
  sq: { closures: 0, boundaryChanges: 0, programMoves: 0, gradeChanges: 0, studentsChangingSchools: 0, studentsInSustainableSchools: 0.48 },
}

// kind: close   - school closes; `to` are receiving schools, `detail` adds splits or caveats
//       program - a program moves from `from` schools to `to`
//       grades  - a K-8 school's middle grades move to `to`; the school becomes K-5
//       note    - anything else, attached to every school in `schools`
const SHARED = [
  // Ida B. Wells / Lincoln region
  { kind: 'close', school: 'Maplewood', to: ['Hayhurst', 'Rieke'], detail: 'About 70% of its area goes to Hayhurst and 30% to Rieke.', detail_es: 'Cerca del 70% de su zona pasa a Hayhurst y el 30% a Rieke.', source: 'memo' },
  { kind: 'note', schools: ['Jackson', 'Robert Gray'], text: 'The Maplewood middle school area moves from Jackson to Robert Gray.', text_es: 'La zona de escuela intermedia (middle school) de Maplewood pasa de Jackson a Robert Gray.', source: 'memo' },
  { kind: 'note', schools: ['Skyline', 'Lincoln', 'Roosevelt'], text: 'Skyline students will go to Roosevelt for high school, not Lincoln. Skyline stays K–8.', text_es: 'Los estudiantes de Skyline irán a Roosevelt para la escuela preparatoria (high school), no a Lincoln. Skyline sigue siendo K–8.', source: 'memo' },
  { kind: 'note', schools: ['Bridlemile'], text: 'Bridlemile keeps the same middle and high schools.', text_es: 'Bridlemile mantiene las mismas escuelas intermedias y preparatorias.', source: 'memo' },
  { kind: 'note', schools: ['Metropolitan Learning Center'], text: 'MLC becomes K–8. Its 9–12 program closes. Those students go to their neighborhood high school.', text_es: 'MLC pasa a ser K–8. Su programa de 9.º a 12.º grado cierra. Esos estudiantes van a la escuela preparatoria de su vecindario.', source: 'region' },
  { kind: 'program', program: 'Odyssey (K–8 focus option)', from: ['Odyssey'], to: 'Metropolitan Learning Center', detail: 'The East Sylvan building will be empty.', detail_es: 'El edificio de East Sylvan quedará vacío.', source: 'memo' },

  // Grant / McDaniel region
  { kind: 'close', school: 'Irvington', to: ['Beverly Cleary'], detail: 'Irvington’s K–5 students go to Beverly Cleary. Its middle school area goes to Beaumont.', detail_es: 'Los estudiantes de K–5 de Irvington van a Beverly Cleary. Su zona de escuela intermedia pasa a Beaumont.', source: 'memo' },
  { kind: 'grades', school: 'Beverly Cleary', to: 'Beaumont', source: 'memo' },
  { kind: 'grades', school: 'Laurelhurst', to: 'Mt. Tabor', source: 'memo' },
  { kind: 'program', program: 'Spanish immersion', from: ['Scott'], to: 'Rigler', source: 'memo' },
  { kind: 'program', program: 'Spanish immersion (middle grades)', from: ['Beaumont'], to: 'Roseway Heights', source: 'memo' },
  { kind: 'program', program: 'Chinese (Mandarin) immersion', from: ['Clark'], to: 'Woodstock', source: 'memo' },

  // Cleveland / Franklin region
  { kind: 'close', school: 'Buckman', to: ['Abernethy', 'Sunnyside Environmental'], detail: 'About half of its area goes to each school.', detail_es: 'Cerca de la mitad de su zona pasa a cada escuela.', source: 'memo' },
  { kind: 'close', school: 'Creston', to: ['Atkinson'], detail: 'Neighborhood K–5 students go to Atkinson.', detail_es: 'Los estudiantes de K–5 del vecindario van a Atkinson.', source: 'memo' },
  { kind: 'program', program: 'Deaf and Hard of Hearing program', from: ['Creston'], to: 'Glencoe', source: 'memo' },
  { kind: 'close', school: 'Marysville', to: ['Arleta'], source: 'memo' },
  { kind: 'close', school: 'Woodmere', to: ['Whitman'], source: 'memo' },
  { kind: 'close', school: 'Sellwood', to: ['Hosford', 'Brentwood'], detail: 'The Llewellyn area goes to Hosford. The Duniway and Lewis areas go to Brentwood.', detail_es: 'La zona de Llewellyn pasa a Hosford. Las zonas de Duniway y Lewis pasan a Brentwood.', source: 'memo' },
  { kind: 'grades', school: 'Sunnyside Environmental', to: 'Hosford', source: 'memo' },
  { kind: 'grades', school: 'Bridger Creative Science', to: 'Harrison Park', source: 'memo' },
  { kind: 'program', program: 'Spanish immersion', from: ['Atkinson'], to: 'Lent', source: 'memo' },
  { kind: 'note', schools: ['Sunnyside Environmental'], text: 'Sunnyside’s special environmental program ends. It becomes a neighborhood school. It takes no new lottery students. Current lottery students can stay through 5th grade.', text_es: 'Termina el programa especial de medio ambiente de Sunnyside. Pasa a ser una escuela del vecindario. No recibe estudiantes nuevos por sorteo (lotería). Los estudiantes actuales por sorteo pueden quedarse hasta 5.º grado.', source: 'memo' },

  // Jefferson / Roosevelt region (same in both scenarios)
  { kind: 'close', school: 'Beach', to: ['Chief Joseph'], detail: 'Neighborhood K–5 students go to Chief Joseph.', detail_es: 'Los estudiantes de K–5 del vecindario van a Chief Joseph.', source: 'memo' },
  { kind: 'close', school: 'James John', to: ['Sitton'], detail: 'Neighborhood K–5 students go to Sitton.', detail_es: 'Los estudiantes de K–5 del vecindario van a Sitton.', source: 'memo' },
  { kind: 'program', program: 'Spanish immersion', from: ['Beach', 'James John', 'Sitton'], to: 'César Chávez', source: 'memo' },
  { kind: 'close', school: 'Peninsula', to: ['Rosa Parks'], source: 'memo' },
  { kind: 'close', school: 'Sabin', to: ['MLK Jr.'], source: 'memo' },
  { kind: 'note', schools: ['César Chávez', 'Rosa Parks'], text: 'César Chávez becomes the main K–5 Spanish immersion school. Its K–5 students who are not in immersion go to Rosa Parks.', text_es: 'César Chávez pasa a ser la escuela principal de inmersión en español de K–5. Sus estudiantes de K–5 que no están en inmersión van a Rosa Parks.', source: 'memo' },
  { kind: 'grades', school: 'César Chávez', to: 'George', source: 'memo' },
  { kind: 'grades', school: 'Faubion', to: 'Ockley Green', source: 'memo' },
  { kind: 'grades', school: 'Vernon', to: 'Harriet Tubman', source: 'memo' },
  { kind: 'program', program: 'Spanish immersion (middle grades)', from: ['Ockley Green'], to: 'George', source: 'memo' },
  { kind: 'program', program: 'Chinese (Mandarin) immersion', from: ['MLK Jr.'], to: 'Boise-Eliot/Humboldt', source: 'memo' },
]

export const CHANGES = {
  a: [
    ...SHARED,
    { kind: 'close', school: 'Stephenson', to: ['Markham', 'Capitol Hill'], detail: 'About 70% of its area goes to Markham and 30% to Capitol Hill.', detail_es: 'Cerca del 70% de su zona pasa a Markham y el 30% a Capitol Hill.', source: 'memo' },
    { kind: 'close', school: 'Rose City Park', to: ['Scott'], detail: 'Neighborhood K–5 students go to Scott.', detail_es: 'Los estudiantes de K–5 del vecindario van a Scott.', source: 'memo' },
    { kind: 'program', program: 'Vietnamese immersion', from: ['Rose City Park'], to: 'Vestal', source: 'memo' },
    { kind: 'close', school: 'Lewis', to: ['Duniway'], source: 'memo' },
  ],
  b: [
    ...SHARED,
    { kind: 'note', schools: ['Stephenson'], text: 'Stephenson stays open with no changes. (It closes in Scenario A.)', text_es: 'Stephenson sigue abierta y sin cambios. (Cierra en el escenario A.)', source: 'memo' },
    { kind: 'note', schools: ['Rose City Park', 'Scott', 'Vestal'], text: 'Rose City Park stays open. It keeps its neighborhood area and Vietnamese immersion. (In Scenario A, both move.)', text_es: 'Rose City Park sigue abierta. Mantiene su zona del vecindario y su inmersión en vietnamita. (En el escenario A, ambas se mudan.)', source: 'memo' },
    { kind: 'note', schools: ['Lewis', 'Whitman'], text: 'Lewis stays open and gets part of Whitman’s area. (It closes in Scenario A.)', text_es: 'Lewis sigue abierta y recibe parte de la zona de Whitman. (Cierra en el escenario A.)', source: 'memo' },
  ],
}
