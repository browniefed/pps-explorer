// Interface text in English and Spanish.
//
// Plain language (both languages): about a 6th grade reading level, most important point first,
// sentences of 20 words or fewer, active voice, everyday words. Explain a term the first time it
// appears (attendance area, immersion, status quo).
//
// Spanish: formal "usted"; neutral U.S. Spanish; accents and ¿ ¡; gender-neutral wording when it
// reads naturally ("las familias"); dates as "6 de octubre de 2026". Keep in English with a short
// explanation the first time: Portland Public Schools (PPS), Rightsizing, school names, street names.
// Glossary:
//   attendance area = zona de asistencia        status quo = sin cambios
//   dual language immersion = inmersión en dos idiomas
//   neighborhood school = escuela del vecindario
//   high school = escuela preparatoria (high school)   middle school = escuela intermedia (middle school)
//   elementary = primaria                       grades 6-8 = 6.º a 8.º grado
//   closes = cierra                             receiving school = escuela que recibe
//   school board = la Junta Escolar             superintendent = la superintendente
//   lottery = sorteo (lotería)                  focus option = programa especial (focus option)

const en = {
  title: 'PPS attendance boundaries',
  subtitle: 'Proposed school changes for fall 2027',
  contact: 'Built by Jason Brown. See a wrong boundary or have a question? Email',
  languageLabel: 'Language',
  programTitle: ({ program }) => program.charAt(0).toUpperCase() + program.slice(1),
  sheetShow: 'Show map controls',
  sheetHide: 'Hide map controls',
  mapLabel: 'Map of attendance boundaries. Click to see the schools for a place.',

  howToTitle: 'How to use this map',
  howTo1: 'Pick a plan: Status quo, Scenario A, Scenario B or the Recommendation.',
  howTo2: 'Pick grades: K–5, 6–8 or 9–12.',
  howTo3: 'Type your address or click the map. You will see your schools in each scenario.',

  scenarioLabel: 'Scenario',
  'scenario.sq': 'Status quo',
  'scenario.a': 'Scenario A',
  'scenario.b': 'Scenario B',
  'scenarioShort.sq': 'Status quo',
  'scenarioShort.a': 'Scen. A',
  'scenarioShort.b': 'Scen. B',
  scenarioHint: 'Status quo means no change. Scenarios A and B were PPS’s first two plans. The Recommendation is the superintendent’s final plan. The school board votes on it December 15.',
  gradesLabel: 'Grades',

  compareToggle: 'Show today’s lines on top (dotted)',
  changesToggle: 'Show where the school changes and where students from closing schools go',
  changesKeyHatch: 'This area gets a different school than today',
  changesKeyClosed: 'School closes. Dashed arrows point to the schools that take its students.',
  programsToggle: ({ moves }) => (moves ? 'Show immersion programs and where they move' : 'Show immersion programs'),
  immersionOnly: 'Immersion only: no neighborhood area',
  programsHint: ({ moves }) =>
    `Immersion means students learn in two languages. Rings mark immersion schools.${moves ? ' Arrows show a program moving to a new school.' : ''} Zoom in to see labels.`,
  programsK5Note: 'Rigler, Kelly and César Chávez do not close. César Chávez’s area goes to Rosa Parks. PPS’s maps put Rigler and Scott, and Kelly and Lent, inside shared boundaries. PPS has not said which school serves each area.',
  dliToggle: 'Spanish immersion: 1-mile reach (elementary)',

  'lang.Spanish': 'Spanish',
  'lang.Mandarin': 'Mandarin',
  'lang.Vietnamese': 'Vietnamese',
  'lang.Japanese': 'Japanese',
  'lang.Russian': 'Russian',
  'lang.Deaf and Hard of Hearing': 'Deaf/Hard of Hearing',
  'lang.Odyssey': 'Odyssey',

  searchLabel: 'Look up an address',
  searchPlaceholder: 'Example: 1234 SE Division St',
  find: 'Find',
  finding: 'Finding…',
  searching: 'Searching…',
  searchHint: 'Or click anywhere on the map.',
  searchNoMatch: 'We could not find that address in Portland. Add the ZIP code, or click the map.',
  sharedLocation: 'Shared location',
  schoolLocation: ({ name }) => `${name} (school location)`,
  dataError: 'The boundary data did not load. Please reload the page.',

  lookupTitle: 'Schools at this spot',
  lookupChanged: 'A yellow box means the school is different from today.',
  lookupNear: '* This spot is on a boundary line, so we show the closest area. Please check with PPS.',
  lookupChooseScenario: 'Pick a scenario or the Recommendation to see what changes for these schools.',
  lookupNotesTitle: ({ scenario }) => `What this means in ${scenario}`,
  cellOverlap: 'Overlapping areas',
  cellOutside: 'Outside the district',
  cellOr: ({ a, b }) => `${a} or ${b}?`,
  cellNearTitle: 'This spot is on a boundary line. We show the closest area.',
  cellUnclearTitle: 'PPS’s map draws both schools inside one boundary. See the note below.',

  changesTitleSq: 'If nothing changes (status quo)',
  changesSq: ({ share }) => `Nothing. No schools close and no boundaries change. PPS expects ${share} of students to be in a school big enough to stay strong by 2031–32.`,
  changesTitle: ({ scenario }) => `What changes in ${scenario}`,
  changesSummary: ({ closures, boundary, moving, share, sqShare }) =>
    `${closures} schools close. ${boundary} schools get new boundaries. About ${moving} of K–8 students change schools. PPS expects ${share} of students to be in a school big enough to stay strong by 2031–32 (no change: ${sqShare}).`,
  groupClosing: ({ n }) => `Schools that close (${n})`,
  groupPrograms: 'Programs that move',
  groupGrades: 'Grades 6–8 move (the school becomes K–5)',
  groupOther: 'Other changes',
  changesSource: 'From the PPS board memo and regional summaries for October 6, 2026.',

  dliNow: ({ when }) => `Within 1 mile of a Spanish immersion elementary school ${when}`,
  dliLost: ({ when, lost }) => `Had Spanish immersion in 2022 but not ${when}: ${lost}`,
  dliWhenToday: 'today',
  dliWhenIn: ({ scenario }) => `in ${scenario}`,
  dliPeriod: 'Period',
  dliSchools: 'Schools',
  dliWithin: 'PPS land within 1 mile',
  dliToday: 'Today (2025–26)',
  dliSqMi: ({ n }) => `${n} sq mi`,
  dliNote: 'Oregon law says elementary students who live more than 1 mile from school get a school bus. The circles use straight-line distance, so real walking distance is longer. The circles show places, not numbers of students. PPS does not share where immersion students live. An older PPS note says immersion buses outside a school’s own area are only for native Spanish speakers. Bridger’s Spanish immersion moved to Lent in fall 2023.',

  timelineTitle: 'What happens next',
  timeline1: ['October 6, 2026:', 'PPS showed Scenarios A and B to the school board.'],
  timeline2: ['November 13:', 'The superintendent released her recommendation.'],
  timeline3: ['November 17 – December 3:', 'The school board discusses it. Listening sessions at Franklin High School (Nov. 19) and Grant High School (Dec. 3). Information session at McDaniel High School (Nov. 21).'],
  timeline4: ['December 15:', 'The school board votes.'],
  timeline5: ['Fall 2027:', 'The first changes start.'],
  timelineNote: 'Nothing is final until the board votes. PPS is still planning buses, staff and support for students who move.',
  feedbackTitle: 'Tell PPS what you think',
  feedbackEmail: 'Email',
  feedbackRsvp: 'Sign up for a community event',
  feedbackFaq: 'PPS rightsizing questions and answers',
  feedbackFaqNote: '(has a form for questions)',

  clusterTitle: 'High school area (cluster)',

  sourcesTitle: 'Sources',
  sourceBoard: 'PPS board documents (agenda item 8)',
  sourceMap: ({ scenario, band }) => `${scenario} ${band} map (PDF)`,
  sourcePpsdataBy: 'by Alex Meub',
  sourcePpsdataRest: 'This project pointed us to the board documents and the City of Portland boundary data we used to check these maps.',
  method: 'We traced the boundaries from PPS’s scenario maps (PDFs). We placed them using the map coordinates inside those PDFs, so lines are accurate to a few meters. School changes come from the PPS board memo for October 6, 2026. Today’s areas match City of Portland data for 98% of the district. If you live near a boundary line, please check with PPS. Lottery and immersion placements work differently.',
  privacy: 'When you search an address, your browser sends it to Esri to find it on the map. This site does not save it.',
  notAffiliated: 'This site is not part of PPS.',

  // map tooltips
  mapCluster: ({ name }) => `${name} cluster`,
  mapSplit: ({ parts, last }) => `High school: ${parts} or ${last}, depending on the address`,
  mapOfArea: 'of the area',
  mapSqMi: ({ n }) => `${n} sq mi`,
  arrowClosure: ({ from, to, detail }) => `${from} closes. Students go to ${to}.${detail ? ' ' + detail : ''}`,
  arrowProgram: ({ program, from, to }) => `${program}: ${from} → ${to}`,

  // generated notes about a school (changes.mjs)
  closeSelf: ({ school, to, detail }) => `${school} closes${to ? `. Students go to ${to}` : ''}.${detail ? ' ' + detail : ''}`,
  closeReceives: ({ school, detail }) => `Takes students from ${school}, which closes.${detail ? ' ' + detail : ''}`,
  programHere: ({ program, from, detail }) => `${program} moves here from ${from}.${detail ? ' ' + detail : ''}`,
  programIts: ({ program, to, others, detail }) => `Its ${program} moves to ${to}${others ? `, along with ${others}’s` : ''}.${detail ? ' ' + detail : ''}`,
  programMove: ({ program, from, to, detail }) => `${program} moves from ${from} to ${to}.${detail ? ' ' + detail : ''}`,
  gradesReceives: ({ school }) => `Takes grades 6–8 from ${school}. ${school} becomes K–5.`,
  gradesSelf: ({ school, to }) => `${school} becomes K–5. Its grades 6–8 move to ${to}.`,
  noteUnclear: ({ before, after, scenario }) =>
    `${before} is not closing. On PPS’s ${scenario} map, ${before} and ${after} are inside one boundary. PPS has not said which school would serve ${before}’s current area. Please ask PPS at Rightsizing@pps.net.`,
  noteNoArea: ({ before, after, scenario, as }) =>
    `${before} is not closing. It stays open${as}. On the ${scenario} map it has no neighborhood area of its own, so this spot goes to ${after}.`,
  'scenario.r': 'Recommendation',
  'scenarioShort.r': 'Recommended',
  changesSummaryRec: ({ closures, first, second, moving, share, sqShare }) =>
    `${closures} schools close: ${first} in fall 2027 and ${second} in fall 2028. About ${moving} of K–8 students change schools, counting students whose program moves. PPS expects that by 2031–32, ${share} of elementary schools will have at least 360 students (with no change: ${sqShare}).`,
  groupYear: ({ year }) => `Starting fall ${year}`,
  groupKept: 'Changed after community feedback',
  changesSourceRec: 'From the superintendent’s recommendation memo to the school board, November 12, 2026.',
  fromFall: ({ year, text }) => `Starting fall ${year}: ${text}`,
  timeline6: ['Fall 2028:', 'The rest of the changes happen.'],
  sourceRecMemo: 'Superintendent’s recommendation memo (PDF)',
  sourceRecFinder: 'PPS Rightsizing School Finder (map with the Recommendation’s boundaries)',
  methodRec: 'The Recommendation’s boundaries come from PPS’s own map data (the Rightsizing School Finder). Where that data leaves an area out, the area keeps today’s school.',
  noteNoAreaAs: ({ langs }) => ` as a ${langs} immersion school`,
}

const es = {
  title: 'Zonas de asistencia de PPS',
  subtitle: 'Cambios escolares propuestos para el otoño de 2027',
  contact: 'Creado por Jason Brown. ¿Ve un límite incorrecto o tiene una pregunta? Escriba a',
  languageLabel: 'Idioma',
  programTitle: ({ program }) => program.charAt(0).toUpperCase() + program.slice(1),
  sheetShow: 'Mostrar los controles del mapa',
  sheetHide: 'Ocultar los controles del mapa',
  mapLabel: 'Mapa de las zonas de asistencia. Haga clic para ver las escuelas de un lugar.',

  howToTitle: 'Cómo usar este mapa',
  howTo1: 'Elija un plan: Sin cambios, Escenario A, Escenario B o la Recomendación.',
  howTo2: 'Elija los grados: K–5, 6–8 o 9–12.',
  howTo3: 'Escriba su dirección o haga clic en el mapa. Verá sus escuelas en cada escenario.',

  scenarioLabel: 'Escenario',
  'scenario.sq': 'Sin cambios',
  'scenario.a': 'Escenario A',
  'scenario.b': 'Escenario B',
  'scenarioShort.sq': 'Sin cambios',
  'scenarioShort.a': 'Esc. A',
  'scenarioShort.b': 'Esc. B',
  scenarioHint: '“Sin cambios” muestra cómo es hoy. Los escenarios A y B fueron los dos primeros planes de Portland Public Schools (PPS, el distrito escolar público de Portland). La Recomendación es el plan final de la superintendente. La Junta Escolar vota el 15 de diciembre.',
  gradesLabel: 'Grados',

  compareToggle: 'Mostrar las líneas de hoy encima (punteadas)',
  changesToggle: 'Mostrar dónde cambia la escuela y adónde van los estudiantes de las escuelas que cierran',
  changesKeyHatch: 'Esta zona tendría una escuela diferente a la de hoy',
  changesKeyClosed: 'La escuela cierra. Las flechas punteadas señalan las escuelas que reciben a sus estudiantes.',
  programsToggle: ({ moves }) => (moves ? 'Mostrar los programas de inmersión y adónde se mudan' : 'Mostrar los programas de inmersión'),
  immersionOnly: 'Solo inmersión: sin zona del vecindario',
  programsHint: ({ moves }) =>
    `En un programa de inmersión en dos idiomas, los estudiantes aprenden en dos idiomas. Los círculos marcan las escuelas de inmersión.${moves ? ' Las flechas muestran un programa que se muda a otra escuela.' : ''} Acerque el mapa para ver los nombres.`,
  programsK5Note: 'Rigler, Kelly y César Chávez no cierran. La zona de César Chávez pasa a Rosa Parks. Los mapas de PPS ponen a Rigler y Scott, y a Kelly y Lent, dentro de límites compartidos. PPS no ha dicho qué escuela atiende cada zona.',
  dliToggle: 'Inmersión en español: alcance de 1 milla (primaria)',

  'lang.Spanish': 'Español',
  'lang.Mandarin': 'Mandarín',
  'lang.Vietnamese': 'Vietnamita',
  'lang.Japanese': 'Japonés',
  'lang.Russian': 'Ruso',
  'lang.Deaf and Hard of Hearing': 'Sordos o con dificultad auditiva',
  'lang.Odyssey': 'Odyssey',

  searchLabel: 'Busque una dirección',
  searchPlaceholder: 'Ejemplo: 1234 SE Division St',
  find: 'Buscar',
  finding: 'Buscando…',
  searching: 'Buscando…',
  searchHint: 'O haga clic en cualquier lugar del mapa.',
  searchNoMatch: 'No encontramos esa dirección en Portland. Agregue el código postal o haga clic en el mapa.',
  sharedLocation: 'Lugar compartido',
  schoolLocation: ({ name }) => `${name} (ubicación de la escuela)`,
  dataError: 'Los datos de las zonas no se cargaron. Por favor, vuelva a cargar la página.',

  lookupTitle: 'Escuelas en este lugar',
  lookupChanged: 'Un recuadro amarillo indica que la escuela es diferente a la de hoy.',
  lookupNear: '* Este lugar está sobre una línea de límite, así que mostramos la zona más cercana. Por favor, consulte con PPS.',
  lookupChooseScenario: 'Elija un escenario o la Recomendación para ver qué cambia en estas escuelas.',
  lookupNotesTitle: ({ scenario }) => `Qué significa en el ${scenario}`,
  cellOverlap: 'Zonas superpuestas',
  cellOutside: 'Fuera del distrito',
  cellOr: ({ a, b }) => `¿${a} o ${b}?`,
  cellNearTitle: 'Este lugar está sobre una línea de límite. Mostramos la zona más cercana.',
  cellUnclearTitle: 'El mapa de PPS dibuja las dos escuelas dentro de un mismo límite. Vea la nota de abajo.',

  changesTitleSq: 'Si no hay cambios (status quo)',
  changesSq: ({ share }) => `Nada. Ninguna escuela cierra y ningún límite cambia. PPS calcula que para 2031–32 el ${share} de los estudiantes estará en una escuela con suficientes estudiantes para funcionar bien.`,
  changesTitle: ({ scenario }) => `Qué cambia en el ${scenario}`,
  changesSummary: ({ closures, boundary, moving, share, sqShare }) =>
    `Cierran ${closures} escuelas. ${boundary} escuelas tienen límites nuevos. Cerca del ${moving} de los estudiantes de K–8 cambia de escuela. PPS calcula que para 2031–32 el ${share} de los estudiantes estará en una escuela con suficientes estudiantes para funcionar bien (sin cambios: ${sqShare}).`,
  groupClosing: ({ n }) => `Escuelas que cierran (${n})`,
  groupPrograms: 'Programas que se mudan',
  groupGrades: '6.º a 8.º grado se mudan (la escuela pasa a ser K–5)',
  groupOther: 'Otros cambios',
  changesSource: 'Según el memorando de PPS a la Junta Escolar y los resúmenes regionales del 6 de octubre de 2026.',

  dliNow: ({ when }) => `A 1 milla o menos de una primaria con inmersión en español ${when}`,
  dliLost: ({ when, lost }) => `Tenía inmersión en español en 2022, pero no ${when}: ${lost}`,
  dliWhenToday: 'hoy',
  dliWhenIn: ({ scenario }) => `en el ${scenario}`,
  dliPeriod: 'Período',
  dliSchools: 'Escuelas',
  dliWithin: 'Territorio de PPS a 1 milla o menos',
  dliToday: 'Hoy (2025–26)',
  dliSqMi: ({ n }) => `${n} mi²`,
  dliNote: 'La ley de Oregón dice que los estudiantes de primaria que viven a más de 1 milla de la escuela reciben autobús escolar. Los círculos usan distancia en línea recta, así que la distancia real a pie es mayor. Los círculos muestran lugares, no cantidades de estudiantes. PPS no publica dónde viven los estudiantes de inmersión. Una nota anterior de PPS dice que los autobuses de inmersión fuera de la zona de la escuela son solo para hablantes nativos de español. La inmersión en español de Bridger se mudó a Lent en el otoño de 2023.',

  timelineTitle: 'Qué pasa después',
  timeline1: ['6 de octubre de 2026:', 'PPS presentó los escenarios A y B a la Junta Escolar.'],
  timeline2: ['13 de noviembre:', 'La superintendente publicó su recomendación.'],
  timeline3: ['Del 17 de noviembre al 3 de diciembre:', 'La Junta Escolar la analiza. Sesiones para escuchar a la comunidad en Franklin High School (19 de nov.) y Grant High School (3 de dic.). Sesión informativa en McDaniel High School (21 de nov.).'],
  timeline4: ['15 de diciembre:', 'La Junta Escolar vota.'],
  timeline5: ['Otoño de 2027:', 'Empiezan los primeros cambios.'],
  timelineNote: 'Nada es final hasta que vote la Junta. PPS todavía planifica los autobuses, el personal y el apoyo para los estudiantes que cambien de escuela.',
  feedbackTitle: 'Dígale a PPS lo que piensa',
  feedbackEmail: 'Escriba a',
  feedbackRsvp: 'Inscríbase en un evento comunitario',
  feedbackFaq: 'Preguntas frecuentes de PPS sobre Rightsizing (el plan para ajustar el número de escuelas)',
  feedbackFaqNote: '(tiene un formulario para preguntas)',

  clusterTitle: 'Zona de la escuela preparatoria (high school)',

  sourcesTitle: 'Fuentes',
  sourceBoard: 'Documentos de la Junta Escolar de PPS (punto 8 de la agenda; en inglés)',
  sourceMap: ({ scenario, band }) => `Mapa ${band} del ${scenario} (PDF, en inglés)`,
  sourcePpsdataBy: 'de Alex Meub',
  sourcePpsdataRest: 'Este proyecto nos llevó a los documentos de la Junta Escolar y a los datos de límites de la Ciudad de Portland que usamos para revisar estos mapas.',
  method: 'Trazamos los límites a partir de los mapas de los escenarios de PPS (PDF). Los ubicamos con las coordenadas que vienen en esos PDF, así que las líneas tienen una precisión de pocos metros. Los cambios escolares vienen del memorando de PPS del 6 de octubre de 2026. Las zonas de hoy coinciden con los datos de la Ciudad de Portland en el 98% del distrito. Si vive cerca de una línea de límite, por favor consulte con PPS. Las plazas por sorteo (lotería) y de inmersión funcionan de otra manera.',
  privacy: 'Cuando busca una dirección, su navegador la envía a Esri para ubicarla en el mapa. Este sitio no la guarda.',
  notAffiliated: 'Este sitio no es parte de PPS.',

  mapCluster: ({ name }) => `Grupo de ${name}`,
  mapSplit: ({ parts, last }) => `Escuela preparatoria: ${parts} o ${last}, según la dirección`,
  mapOfArea: 'de la zona',
  mapSqMi: ({ n }) => `${n} mi²`,
  arrowClosure: ({ from, to, detail }) => `${from} cierra. Sus estudiantes van a ${to}.${detail ? ' ' + detail : ''}`,
  arrowProgram: ({ program, from, to }) => `${program}: ${from} → ${to}`,

  closeSelf: ({ school, to, detail }) => `${school} cierra${to ? `. Sus estudiantes van a ${to}` : ''}.${detail ? ' ' + detail : ''}`,
  closeReceives: ({ school, detail }) => `Recibe estudiantes de ${school}, que cierra.${detail ? ' ' + detail : ''}`,
  programHere: ({ program, from, detail }) => `${theProgram(program)} se muda aquí desde ${from}.${detail ? ' ' + detail : ''}`,
  programIts: ({ program, to, others, detail }) => `Su ${program.startsWith('programa') ? program : 'programa de ' + program} se muda a ${to}${others ? `, junto con el de ${others}` : ''}.${detail ? ' ' + detail : ''}`,
  programMove: ({ program, from, to, detail }) => `${theProgram(program)} se muda de ${from} a ${to}.${detail ? ' ' + detail : ''}`,
  gradesReceives: ({ school }) => `Recibe 6.º a 8.º grado de ${school}. ${school} pasa a ser K–5.`,
  gradesSelf: ({ school, to }) => `${school} pasa a ser K–5. Su 6.º a 8.º grado se muda a ${to}.`,
  noteUnclear: ({ before, after, scenario }) =>
    `${before} no cierra. En el mapa del ${scenario} de PPS, ${before} y ${after} están dentro de un mismo límite. PPS no ha dicho qué escuela atendería la zona actual de ${before}. Por favor, pregunte a PPS en Rightsizing@pps.net.`,
  noteNoArea: ({ before, after, scenario, as }) =>
    `${before} no cierra. Sigue abierta${as}. En el mapa del ${scenario} no tiene una zona del vecindario propia, así que este lugar pasa a ${after}.`,
  'scenario.r': 'Recomendación',
  'scenarioShort.r': 'Recomend.',
  changesSummaryRec: ({ closures, first, second, moving, share, sqShare }) =>
    `Cierran ${closures} escuelas: ${first} en el otoño de 2027 y ${second} en el otoño de 2028. Cerca del ${moving} de los estudiantes de K–8 cambia de escuela, contando a quienes cambian porque su programa se muda. PPS calcula que para 2031–32 el ${share} de las escuelas primarias tendrá al menos 360 estudiantes (sin cambios: ${sqShare}).`,
  groupYear: ({ year }) => `Desde el otoño de ${year}`,
  groupKept: 'Cambios hechos después de escuchar a la comunidad',
  changesSourceRec: 'Según el memorando de la superintendente a la Junta Escolar con su recomendación, del 12 de noviembre de 2026.',
  fromFall: ({ year, text }) => `Desde el otoño de ${year}: ${text}`,
  timeline6: ['Otoño de 2028:', 'Se hacen los demás cambios.'],
  sourceRecMemo: 'Memorando con la recomendación de la superintendente (PDF, en inglés)',
  sourceRecFinder: 'Rightsizing School Finder de PPS (mapa con los límites de la Recomendación; en inglés)',
  methodRec: 'Los límites de la Recomendación vienen de los datos de mapas de PPS (el Rightsizing School Finder). Donde esos datos no incluyen una zona, la zona mantiene su escuela de hoy.',
  noteNoAreaAs: ({ langs }) => ` como escuela de inmersión en ${langs}`,
}

// "inmersión en español" -> "El programa de inmersión en español"; names that already say "programa" keep it
function theProgram(program) {
  if (program.startsWith('programa')) return `El ${program}`
  if (program.startsWith('Odyssey')) return `El programa ${program}`
  return `El programa de ${program}`
}

// Program names from the board memo (English) -> Spanish, as used inside sentences.
export const PROGRAM_NAMES_ES = {
  'Spanish immersion': 'inmersión en español',
  'Spanish immersion (middle grades)': 'inmersión en español (escuela intermedia)',
  'Chinese (Mandarin) immersion': 'inmersión en chino (mandarín)',
  'Vietnamese immersion': 'inmersión en vietnamita',
  'Deaf and Hard of Hearing program': 'programa para estudiantes sordos o con dificultad auditiva',
  'Odyssey (K–8 focus option)': 'Odyssey (programa especial de K–8, “focus option”)',
}

export const LANGUAGE_NAMES_ES = { Spanish: 'español', Mandarin: 'mandarín', Vietnamese: 'vietnamita', Japanese: 'japonés', Russian: 'ruso' }

export const STRINGS = { en, es }
