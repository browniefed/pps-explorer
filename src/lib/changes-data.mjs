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
  { kind: 'close', school: 'Maplewood', to: ['Hayhurst', 'Rieke'], detail: 'About 70% of its area goes to Hayhurst and 30% to Rieke.', source: 'memo' },
  { kind: 'note', schools: ['Jackson', 'Robert Gray'], text: 'The Maplewood middle school area moves from Jackson to Robert Gray.', source: 'memo' },
  { kind: 'note', schools: ['Skyline', 'Lincoln', 'Roosevelt'], text: 'Skyline’s high school assignment changes from Lincoln to Roosevelt. Skyline stays K–8.', source: 'memo' },
  { kind: 'note', schools: ['Bridlemile'], text: 'Bridlemile keeps its existing pathways.', source: 'memo' },
  { kind: 'note', schools: ['Metropolitan Learning Center'], text: 'MLC becomes K–8. Its 9–12 program closes and those students move to their neighborhood high school (not counted as a school closure).', source: 'region' },
  { kind: 'program', program: 'Odyssey (K–8 focus option)', from: ['Odyssey'], to: 'Metropolitan Learning Center', detail: 'This leaves the East Sylvan building vacant.', source: 'memo' },

  // Grant / McDaniel region
  { kind: 'close', school: 'Irvington', to: ['Beverly Cleary'], detail: 'Irvington’s K–5 students go to Beverly Cleary; its middle school area is assigned to Beaumont.', source: 'memo' },
  { kind: 'grades', school: 'Beverly Cleary', to: 'Beaumont', source: 'memo' },
  { kind: 'grades', school: 'Laurelhurst', to: 'Mt. Tabor', source: 'memo' },
  { kind: 'program', program: 'Spanish immersion', from: ['Scott'], to: 'Rigler', source: 'memo' },
  { kind: 'program', program: 'Spanish immersion (middle grades)', from: ['Beaumont'], to: 'Roseway Heights', source: 'memo' },
  { kind: 'program', program: 'Chinese (Mandarin) immersion', from: ['Clark'], to: 'Woodstock', source: 'memo' },

  // Cleveland / Franklin region
  { kind: 'close', school: 'Buckman', to: ['Abernethy', 'Sunnyside Environmental'], detail: 'About half its area goes to each.', source: 'memo' },
  { kind: 'close', school: 'Creston', to: ['Atkinson'], detail: 'Neighborhood K–5 students go to Atkinson.', source: 'memo' },
  { kind: 'program', program: 'Deaf and Hard of Hearing program', from: ['Creston'], to: 'Glencoe', source: 'memo' },
  { kind: 'close', school: 'Marysville', to: ['Arleta'], source: 'memo' },
  { kind: 'close', school: 'Woodmere', to: ['Whitman'], source: 'memo' },
  { kind: 'close', school: 'Sellwood', to: ['Hosford', 'Brentwood'], detail: 'The Llewellyn area goes to Hosford; the Duniway and Lewis areas go to Brentwood.', source: 'memo' },
  { kind: 'grades', school: 'Sunnyside Environmental', to: 'Hosford', source: 'memo' },
  { kind: 'grades', school: 'Bridger Creative Science', to: 'Harrison Park', source: 'memo' },
  { kind: 'program', program: 'Spanish immersion', from: ['Atkinson'], to: 'Lent', source: 'memo' },
  { kind: 'note', schools: ['Sunnyside Environmental'], text: 'Sunnyside’s environmental focus option ends. It becomes a neighborhood school with no new lottery transfers; current lottery students can stay through 5th grade.', source: 'memo' },

  // Jefferson / Roosevelt region (same in both scenarios)
  { kind: 'close', school: 'Beach', to: ['Chief Joseph'], detail: 'Neighborhood K–5 students go to Chief Joseph.', source: 'memo' },
  { kind: 'close', school: 'James John', to: ['Sitton'], detail: 'Neighborhood K–5 students go to Sitton.', source: 'memo' },
  { kind: 'program', program: 'Spanish immersion', from: ['Beach', 'James John', 'Sitton'], to: 'César Chávez', source: 'memo' },
  { kind: 'close', school: 'Peninsula', to: ['Rosa Parks'], source: 'memo' },
  { kind: 'close', school: 'Sabin', to: ['MLK Jr.'], source: 'memo' },
  { kind: 'note', schools: ['César Chávez', 'Rosa Parks'], text: 'César Chávez becomes a K–5 Spanish immersion hub; its non-immersion K–5 students are assigned to Rosa Parks.', source: 'memo' },
  { kind: 'grades', school: 'César Chávez', to: 'George', source: 'memo' },
  { kind: 'grades', school: 'Faubion', to: 'Ockley Green', source: 'memo' },
  { kind: 'grades', school: 'Vernon', to: 'Harriet Tubman', source: 'memo' },
  { kind: 'program', program: 'Spanish immersion (middle grades)', from: ['Ockley Green'], to: 'George', source: 'memo' },
  { kind: 'program', program: 'Chinese (Mandarin) immersion', from: ['MLK Jr.'], to: 'Boise-Eliot/Humboldt', source: 'memo' },
]

export const CHANGES = {
  a: [
    ...SHARED,
    { kind: 'close', school: 'Stephenson', to: ['Markham', 'Capitol Hill'], detail: 'About 70% of its area goes to Markham and 30% to Capitol Hill.', source: 'memo' },
    { kind: 'close', school: 'Rose City Park', to: ['Scott'], detail: 'Neighborhood K–5 students go to Scott.', source: 'memo' },
    { kind: 'program', program: 'Vietnamese immersion', from: ['Rose City Park'], to: 'Vestal', source: 'memo' },
    { kind: 'close', school: 'Lewis', to: ['Duniway'], source: 'memo' },
  ],
  b: [
    ...SHARED,
    { kind: 'note', schools: ['Stephenson'], text: 'Stephenson stays open with no changes (it closes in Scenario A).', source: 'memo' },
    { kind: 'note', schools: ['Rose City Park', 'Scott', 'Vestal'], text: 'Rose City Park stays open with its neighborhood boundary and Vietnamese immersion, so Scott doesn’t take its area and Vietnamese immersion doesn’t move to Vestal (both happen in Scenario A).', source: 'memo' },
    { kind: 'note', schools: ['Lewis', 'Whitman'], text: 'Lewis stays open and receives part of Whitman’s boundary (it closes in Scenario A).', source: 'memo' },
  ],
}
