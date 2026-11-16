// Proposed changes for Scenarios A and B, transcribed from the PPS board packet for October 6, 2026:
//   memo  = "Rightsizing Update: Scenario Release" board memo (Oct 5, 2026)
//   region = regional summaries (Oct 3–4, 2026) and the district-wide comparison (Oct 4, 2026)
// and for the Superintendent's Recommendation (r):
//   rec   = "Superintendent's Rightsizing Schools Recommendation" board memo (Nov 12, 2026), region tables
//           pages 29–41, and the Recommendation Summary; `year` is the fall the change starts
// School names follow the scenario maps. Keep wording close to the source; don't infer beyond it.

export const SOURCES = {
  memo: 'PPS board memo, Rightsizing Update: Scenario Release (Oct 5, 2026)',
  region: 'PPS regional summaries and district-wide scenario comparison (Oct 3–4, 2026)',
  rec: 'PPS board memo, Superintendent’s Rightsizing Schools Recommendation (Nov 12, 2026)',
}

// District-wide figures are projections for 2031–32 (district-wide comparison).
export const SUMMARY = {
  a: { closures: 14, boundaryChanges: 38, programMoves: 13, gradeChanges: 8, studentsChangingSchools: 0.27, studentsInSustainableSchools: 0.8 },
  b: { closures: 11, boundaryChanges: 34, programMoves: 12, gradeChanges: 8, studentsChangingSchools: 0.24, studentsInSustainableSchools: 0.73 },
  // memo pages 1, 42 and 46: K-5 schools above 360 students; K-8 students who move (incl. program moves)
  r: { closures: 10, closures2027: 5, closures2028: 5, studentsChangingSchools: 0.19, k5SchoolsSustainable: 0.5, k5SchoolsSustainableSq: 0.18 },
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

// Superintendent's Recommendation (Nov 13, 2026): the final plan the board votes on Dec 15. Changes come
// in two steps, fall 2027 and fall 2028. Boundaries are from PPS's GIS layer (scripts/pipeline/rec.py).
const REC = [
  // North (Jefferson / Roosevelt) region
  { kind: 'close', year: 2027, school: 'Beach', to: ['Chief Joseph'], detail: 'Neighborhood K–5 students go to Chief Joseph.', detail_es: 'Los estudiantes de K–5 del vecindario van a Chief Joseph.', source: 'rec' },
  { kind: 'close', year: 2027, school: 'Peninsula', to: ['Rosa Parks'], detail: 'Starting in fall 2028, students from the Peninsula area go to George for middle school instead of Ockley Green.', detail_es: 'Desde el otoño de 2028, los estudiantes de la zona de Peninsula van a George para la escuela intermedia, en lugar de Ockley Green.', source: 'rec' },
  { kind: 'close', year: 2027, school: 'Sabin', to: ['MLK Jr.'], source: 'rec' },
  { kind: 'program', year: 2027, program: 'Spanish immersion', from: ['Beach', 'James John', 'Sitton'], to: 'César Chávez', source: 'rec' },
  { kind: 'note', year: 2027, schools: ['César Chávez', 'Rosa Parks'], text: 'César Chávez becomes the main K–5 Spanish immersion school. Its K–5 students who are not in immersion go to Rosa Parks.', text_es: 'César Chávez pasa a ser la escuela principal de inmersión en español de K–5. Sus estudiantes de K–5 que no están en inmersión van a Rosa Parks.', source: 'rec' },
  { kind: 'grades', year: 2027, school: 'César Chávez', to: 'George', source: 'rec' },
  { kind: 'grades', year: 2027, school: 'Faubion', to: 'Ockley Green', source: 'rec' },
  { kind: 'grades', year: 2027, school: 'Vernon', to: 'Harriet Tubman', source: 'rec' },
  { kind: 'program', year: 2027, program: 'Spanish immersion (middle grades)', from: ['Ockley Green'], to: 'George', source: 'rec' },
  { kind: 'note', year: 2027, schools: ['Faubion', 'Astor', 'Jefferson', 'Roosevelt'], text: 'The Bybee Lakes area moves from Faubion to Astor K–8, and from Jefferson to Roosevelt for high school.', text_es: 'La zona de Bybee Lakes pasa de Faubion a Astor K–8, y de Jefferson a Roosevelt para la escuela preparatoria.', source: 'rec' },

  // Northeast (Grant / McDaniel) region
  { kind: 'close', year: 2028, school: 'Irvington', to: ['Beverly Cleary'], detail: 'In fall 2027, Beverly Cleary’s K–5 students join Irvington in the Irvington building while Beverly Cleary gets earthquake upgrades. In fall 2028, the combined school moves to the Beverly Cleary building. Irvington’s middle school area goes to Beaumont.', detail_es: 'En el otoño de 2027, los estudiantes de K–5 de Beverly Cleary se unen a Irvington en el edificio de Irvington mientras refuerzan el edificio de Beverly Cleary contra terremotos. En el otoño de 2028, la escuela unida se muda al edificio de Beverly Cleary. La zona de escuela intermedia de Irvington pasa a Beaumont.', source: 'rec' },
  { kind: 'grades', year: 2027, school: 'Beverly Cleary', to: 'Beaumont', source: 'rec' },
  { kind: 'grades', year: 2027, school: 'Laurelhurst', to: 'Mt. Tabor', source: 'rec' },
  { kind: 'program', year: 2027, program: 'Spanish immersion', from: ['Scott'], to: 'Rigler', source: 'rec' },
  { kind: 'note', year: 2027, schools: ['Rigler', 'Scott'], text: 'Rigler becomes a whole-school Spanish immersion school. Its neighborhood K–5 students go to Scott.', text_es: 'Rigler pasa a ser una escuela completa de inmersión en español. Sus estudiantes de K–5 del vecindario van a Scott.', source: 'rec' },
  { kind: 'program', year: 2027, program: 'Spanish immersion (middle grades)', from: ['Beaumont'], to: 'Roseway Heights', source: 'rec' },
  { kind: 'close', year: 2028, school: 'Rose City Park', to: ['Scott'], detail: 'Neighborhood K–5 students go to Scott.', detail_es: 'Los estudiantes de K–5 del vecindario van a Scott.', source: 'rec' },
  { kind: 'program', year: 2028, program: 'Vietnamese immersion', from: ['Rose City Park'], to: 'Vestal', source: 'rec' },

  // Southeast (Cleveland / Franklin) region
  { kind: 'close', year: 2027, school: 'Buckman', to: ['Sunnyside Environmental', 'Abernethy'], detail: 'Students north of E. Burnside St. go to Sunnyside. The rest go to Abernethy.', detail_es: 'Los estudiantes al norte de E. Burnside St. van a Sunnyside. Los demás van a Abernethy.', source: 'rec' },
  { kind: 'close', year: 2027, school: 'Creston', to: ['Atkinson'], detail: 'Neighborhood K–5 students go to Atkinson.', detail_es: 'Los estudiantes de K–5 del vecindario van a Atkinson.', source: 'rec' },
  { kind: 'program', year: 2027, program: 'Deaf and Hard of Hearing program', from: ['Creston'], to: 'Glencoe', source: 'rec' },
  { kind: 'grades', year: 2027, school: 'Sunnyside Environmental', to: 'Hosford', source: 'rec' },
  { kind: 'note', year: 2027, schools: ['Sunnyside Environmental'], text: 'Sunnyside keeps its environmental focus. It becomes K–5 and still takes some students by lottery.', text_es: 'Sunnyside mantiene su enfoque en el medio ambiente. Pasa a ser K–5 y sigue recibiendo algunos estudiantes por sorteo (lotería).', source: 'rec' },
  { kind: 'program', year: 2027, program: 'Spanish immersion', from: ['Atkinson'], to: 'Lent', source: 'rec' },
  { kind: 'note', year: 2027, schools: ['Atkinson', 'Creston', 'Kellogg', 'Hosford', 'Harrison Park'], text: 'Students from the Atkinson and Creston areas go to Kellogg for middle school, starting with 6th grade.', text_es: 'Los estudiantes de las zonas de Atkinson y Creston van a Kellogg para la escuela intermedia, empezando por 6.º grado.', source: 'rec' },
  { kind: 'note', year: 2028, schools: ['Lent', 'Kelly', 'Brentwood', 'Kellogg'], text: 'Lent becomes a whole-school Spanish immersion school. PPS’s map moves Lent’s neighborhood area to Kelly for K–5 and to Brentwood for middle school.', text_es: 'Lent pasa a ser una escuela completa de inmersión en español. El mapa de PPS pasa la zona del vecindario de Lent a Kelly para K–5 y a Brentwood para la escuela intermedia.', source: 'rec' },
  { kind: 'close', year: 2028, school: 'Lewis', to: ['Duniway'], source: 'rec' },
  { kind: 'note', year: 2028, schools: ['Duniway', 'Llewellyn'], text: 'Duniway’s area west of McLoughlin Blvd. goes to Llewellyn.', text_es: 'La zona de Duniway al oeste de McLoughlin Blvd. pasa a Llewellyn.', source: 'rec' },
  { kind: 'close', year: 2028, school: 'Marysville', to: ['Arleta'], source: 'rec' },
  { kind: 'close', year: 2028, school: 'Woodmere', to: ['Whitman'], source: 'rec' },
  { kind: 'grades', year: 2028, school: 'Bridger Creative Science', to: 'Harrison Park', source: 'rec' },
  { kind: 'program', year: 2028, program: 'Chinese (Mandarin) immersion', from: ['Clark'], to: 'Woodstock', source: 'rec' },
  { kind: 'note', year: 2027, schools: ['Sunnyside Environmental', 'Woodstock', 'Franklin', 'Cleveland'], text: 'Sunnyside’s area and part of Woodstock’s go to Cleveland for high school instead of Franklin.', text_es: 'La zona de Sunnyside y parte de la de Woodstock van a Cleveland para la escuela preparatoria, en lugar de Franklin.', source: 'rec' },
  { kind: 'note', year: 2028, schools: ['Whitman', 'Franklin', 'Cleveland'], text: 'Whitman’s area goes to Franklin for high school instead of Cleveland.', text_es: 'La zona de Whitman va a Franklin para la escuela preparatoria, en lugar de Cleveland.', source: 'rec' },

  // West (Wells / Lincoln) region
  { kind: 'note', year: 2027, schools: ['Metropolitan Learning Center'], text: 'MLC becomes K–8. Its 9–12 students can go to Alliance High School, a focus option, or their neighborhood high school.', text_es: 'MLC pasa a ser K–8. Sus estudiantes de 9.º a 12.º grado pueden ir a Alliance High School, a un programa especial (focus option) o a la escuela preparatoria de su vecindario.', source: 'rec' },
  { kind: 'program', year: 2028, program: 'Odyssey (K–8 focus option)', from: ['Odyssey'], to: 'Forest Park', detail: 'The East Sylvan building will be empty.', detail_es: 'El edificio de East Sylvan quedará vacío.', source: 'rec' },

  // Changes from Scenarios A and B after community feedback
  { kind: 'note', schools: ['Sellwood', 'James John', 'Maplewood', 'Stephenson'], text: 'Sellwood, James John, Maplewood and Stephenson stay open. Scenario A or B would have closed them.', text_es: 'Sellwood, James John, Maplewood y Stephenson siguen abiertas. El escenario A o el B las habría cerrado.', source: 'rec' },
  { kind: 'note', schools: ['Skyline', 'Lincoln'], text: 'Skyline students keep going to Lincoln for high school.', text_es: 'Los estudiantes de Skyline siguen yendo a Lincoln para la escuela preparatoria.', source: 'rec' },
  { kind: 'note', schools: ['MLK Jr.'], text: 'MLK Jr. keeps its Mandarin immersion program.', text_es: 'MLK Jr. mantiene su programa de inmersión en mandarín.', source: 'rec' },
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
  r: REC,
}
