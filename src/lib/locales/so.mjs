// Soomaali. Plain language, respectful and direct. School and street names stay in English.
// Glossary: attendance area = aagga dugsiga; boundary = xadka; status quo = isbeddel la'aan;
// scenario = qorshe; dual language immersion = barnaamijka laba-luqadeedka;
// neighborhood school = dugsiga xaafadda; elementary = dugsiga hoose;
// middle school = dugsiga dhexe (middle school); high school = dugsiga sare (high school);
// closes = waa la xirayaa; school board = Guddiga Waxbarashada;
// superintendent = Maamulaha Guud ee Degmada Waxbarashada.
// AI-assisted translation. Needs review by a native Somali speaker before it is relied on.

const LANGS = { Spanish: 'Isbaanish', Mandarin: 'Shiinaha (Mandarin)', Vietnamese: 'Fiyatnaamiis', Japanese: 'Jabbaaniis', Russian: 'Ruush' }

const strings = {
  title: 'Aagagga dugsiyada PPS',
  subtitle: 'Isbeddellada dugsiyada ee la soo jeediyay, dayrta 2027',
  contact: 'Waxaa sameeyay Jason Brown. Ma aragtay xad khaldan ama su’aal ma qabtaa? Iimayl u dir',
  languageLabel: 'Luqadda',
  translationNote: 'Turjumaaddan waxaa lagu sameeyay caawimaad AI ah, weli lama hubin qof Soomaali ku hadla.',
  sheetShow: 'Muuji xakameynta khariidadda',
  sheetHide: 'Qari xakameynta khariidadda',
  mapLabel: 'Khariidadda aagagga dugsiyada. Riix meel si aad u aragto dugsiyadeeda.',

  howToTitle: 'Sida loo isticmaalo khariidaddan',
  howTo1: 'Dooro qorshe: Isbeddel la’aan, Qorshaha A, Qorshaha B ama Talo-bixinta.',
  howTo2: 'Dooro fasallada: K–5, 6–8 ama 9–12.',
  howTo3: 'Qor cinwaankaaga ama riix khariidadda. Waxaad arki doontaa dugsiyadaada qorshe kasta.',

  scenarioLabel: 'Qorshaha',
  'scenario.sq': 'Isbeddel la’aan',
  'scenario.a': 'Qorshaha A',
  'scenario.b': 'Qorshaha B',
  'scenarioShort.sq': 'Isbeddel la’aan',
  'scenarioShort.a': 'Qorshe A',
  'scenarioShort.b': 'Qorshe B',
  scenarioHint: '“Isbeddel la’aan” waxay muujinaysaa sida hadda. Qorshayaasha A iyo B waxay ahaayeen labadii qorshe ee ugu horreeyay ee Portland Public Schools (PPS, degmada dugsiyada dowladda ee Portland). Talo-bixintu waa qorshaha ugu dambeeya ee Maamulaha Guud. Guddiga Waxbarashada wuxuu ku codeynayaa 15ka Diseembar.',
  gradesLabel: 'Fasallada',

  compareToggle: 'Muuji xadka hadda dusha (dhibco)',
  changesToggle: 'Muuji meesha dugsigu ka beddelmayo iyo meesha ardayda dugsiyada la xirayo ay u socdaan',
  changesKeyHatch: 'Aaggan wuxuu yeelan doonaa dugsi ka duwan kan hadda',
  changesKeyClosed: 'Dugsiga waa la xirayaa. Fallaadhaha dhibcaha ah waxay tusaan dugsiyada qaata ardaydiisa.',
  programsToggle: ({ moves }) => (moves ? 'Muuji barnaamijyada laba-luqadeedka iyo meesha ay u guurayaan' : 'Muuji barnaamijyada laba-luqadeedka'),
  immersionOnly: 'Laba-luqadeed oo keliya: aag xaafadeed ma leh',
  programsHint: ({ moves }) =>
    `Barnaamijka laba-luqadeedka, ardaydu waxay wax ku bartaan laba luqadood. Goobooyinku waxay calaamadeeyaan dugsiyada laba-luqadeedka.${moves ? ' Fallaadhuhu waxay muujinayaan barnaamij u guuraya dugsi kale.' : ''} Soo dhowee khariidadda si aad u aragto magacyada.`,
  programsK5Note: 'Rigler, Kelly iyo César Chávez lama xirayo. Aagga César Chávez wuxuu u wareegayaa Rosa Parks. Khariidadaha PPS waxay Rigler iyo Scott, iyo Kelly iyo Lent, gelinayaan xad wadaag ah. PPS ma sheegin dugsiga u adeegaya aag kasta.',
  dliToggle: 'Laba-luqadeed Isbaanish: 1 mayl (dugsiga hoose)',

  'lang.Spanish': 'Isbaanish',
  'lang.Mandarin': 'Shiinaha (Mandarin)',
  'lang.Vietnamese': 'Fiyatnaamiis',
  'lang.Japanese': 'Jabbaaniis',
  'lang.Russian': 'Ruush',
  'lang.Deaf and Hard of Hearing': 'Dhagoolaha iyo maqal-yaraha',
  'lang.Odyssey': 'Odyssey',

  searchLabel: 'Raadi cinwaan',
  searchPlaceholder: 'Tusaale: 1234 SE Division St',
  find: 'Raadi',
  finding: 'Waa la raadinayaa…',
  searching: 'Waa la raadinayaa…',
  searchHint: 'Ama riix meel kasta oo khariidadda ah.',
  searchNoMatch: 'Cinwaankaas kuma helin Portland. Ku dar lambarka boostada (ZIP), ama riix khariidadda.',
  sharedLocation: 'Meel la wadaagay',
  schoolLocation: ({ name }) => `${name} (goobta dugsiga)`,
  dataError: 'Xogta xadka ma soo dhicin. Fadlan dib u soo kici bogga.',

  lookupTitle: 'Dugsiyada meeshan',
  lookupChanged: 'Sanduuq jaalle ah wuxuu muujinayaa in dugsigu ka duwan yahay kan hadda.',
  lookupNear: '* Meeshani waxay ku taal xariiq xad, sidaas darteed waxaan muujinaynaa aagga ugu dhow. Fadlan la hubi PPS.',
  lookupChooseScenario: 'Dooro qorshe ama Talo-bixinta si aad u aragto waxa ka beddelmaya dugsiyadan.',
  lookupNotesTitle: ({ scenario }) => `Waxa ay ka dhigan tahay ${scenario}`,
  cellOverlap: 'Aagag isdul saaran',
  cellOutside: 'Degmada dibaddeeda',
  cellOr: ({ a, b }) => `${a} mise ${b}?`,
  cellNearTitle: 'Meeshani waxay ku taal xariiq xad. Waxaan muujinaynaa aagga ugu dhow.',
  cellUnclearTitle: 'Khariidadda PPS waxay labada dugsi ku sawirtay hal xad. Eeg qoraalka hoose.',

  changesTitleSq: 'Haddii aan waxba la beddelin',
  changesSq: ({ share }) => `Waxba isma beddelaan. Dugsi lama xirayo, xadna isma beddelayo. PPS waxay filaysaa in sannadka 2031–32, ${share} ardayda ay dhigtaan dugsi cabbir ku filan leh.`,
  changesTitle: ({ scenario }) => `Waxa isbeddelaya: ${scenario}`,
  changesSummary: ({ closures, boundary, moving, share, sqShare }) =>
    `Dugsiyada la xirayo: ${closures}. Dugsiyada xad cusub helaya: ${boundary}. Qiyaastii ${moving} ardayda K–8 waxay u guurayaan dugsi kale. PPS waxay filaysaa in sannadka 2031–32, ${share} ardayda ay dhigtaan dugsi cabbir ku filan leh (isbeddel la’aan: ${sqShare}).`,
  groupClosing: ({ n }) => `Dugsiyada la xirayo (${n})`,
  groupPrograms: 'Barnaamijyada guuraya',
  groupGrades: 'Fasallada 6–8 way guurayaan (dugsigu wuxuu noqonayaa K–5)',
  groupOther: 'Isbeddello kale',
  changesSource: 'Waxaa laga soo qaaday warqadda PPS ee Guddiga Waxbarashada iyo soo koobidyada gobollada, 6da Oktoobar 2026.',

  dliNow: ({ when }) => `1 mayl gudahood dugsi hoose oo leh laba-luqadeed Isbaanish (${when})`,
  dliLost: ({ when, lost }) => `Laba-luqadeed Isbaanish ayay lahaayeen 2022, laakiin ma laha (${when}): ${lost}`,
  dliWhenToday: 'hadda',
  dliWhenIn: ({ scenario }) => scenario,
  dliPeriod: 'Muddada',
  dliSchools: 'Dugsiyada',
  dliWithin: 'Dhulka PPS ee 1 mayl gudahood ah',
  dliToday: 'Hadda (2025–26)',
  dliSqMi: ({ n }) => `${n} mayl oo laba jibbaaran`,
  dliNote: 'Sharciga Oregon wuxuu dhigayaa in ardayda dugsiga hoose ee ka fog dugsiga in ka badan 1 mayl ay helaan bas dugsi. Goobooyinku waxay isticmaalaan masaafo toos ah, sidaas darteed socodka dhabta ahi waa ka dheer yahay. Goobooyinku waxay muujinayaan meelaha, ma aha tirada ardayda. PPS ma daabacdo meesha ardayda laba-luqadeedka ay ku nool yihiin. Qoraal hore oo PPS ah wuxuu sheegay in basaska laba-luqadeedka ee ka baxsan aagga dugsiga ay u yihiin oo keliya ardayda afkooda hooyo yahay Isbaanish. Barnaamijka Isbaanishka ee Bridger wuxuu u guuray Lent dayrta 2023.',

  timelineTitle: 'Waxa xiga',
  timeline1: ['6da Oktoobar 2026:', 'PPS waxay Qorshayaasha A iyo B u soo bandhigtay Guddiga Waxbarashada.'],
  timeline2: ['13ka Nofeembar:', 'Maamulaha Guud wuxuu soo saaray talo-bixinteeda.'],
  timeline3: ['17ka Nofeembar – 3da Diseembar:', 'Guddiga Waxbarashada ayaa ka doodaya. Kulamo dhageysi: Franklin High School (19ka Nof.) iyo Grant High School (3da Dis.). Kulan sharaxaad: McDaniel High School (21ka Nof.).'],
  timeline4: ['15ka Diseembar:', 'Guddiga Waxbarashada ayaa codeynaya.'],
  timeline5: ['Dayrta 2027:', 'Isbeddellada ugu horreeya ayaa bilaabmaya.'],
  timelineNote: 'Waxba go’aan ma aha ilaa Guddigu codeeyo. PPS weli waxay qorshaynaysaa basaska, shaqaalaha iyo taageerada ardayda guuraya.',
  feedbackTitle: 'U sheeg PPS fikraddaada',
  feedbackEmail: 'Iimayl u dir',
  feedbackRsvp: 'Isku diiwaangeli kulan bulsho',
  feedbackFaq: 'Su’aalaha inta badan la isweydiiyo ee PPS ee Rightsizing (qorshaha hagaajinta tirada dugsiyada)',
  feedbackFaqNote: '(waxay leedahay foom su’aalo)',

  clusterTitle: 'Aagga dugsiga sare (high school)',

  sourcesTitle: 'Ilaha',
  sourceBoard: 'Dukumentiyada Guddiga Waxbarashada PPS (qodobka 8; Ingiriis)',
  sourceMap: ({ scenario, band }) => `Khariidadda ${band} – ${scenario} (PDF, Ingiriis)`,
  sourcePpsdataBy: 'waxaa sameeyay Alex Meub',
  sourcePpsdataRest: 'Mashruucan wuxuu nagu hagay dukumentiyada Guddiga iyo xogta xadka Magaalada Portland ee aan ku hubinnay khariidadahan.',
  method: 'Xadka waxaan ka soo nuqulnay khariidadaha qorshayaasha PPS (PDF). Waxaan meel ku dhignay annagoo isticmaalayna isku-duwayaasha ku jira PDF-yadaas, sidaas darteed xariiqyadu waa sax ilaa dhawr mitir. Isbeddellada dugsiyada waxay ka yimaadeen warqadda PPS ee 6da Oktoobar 2026. Aagagga hadda waxay la mid yihiin xogta Magaalada Portland 98% degmada. Haddii aad ku nooshahay meel u dhow xad, fadlan la hubi PPS. Boosaska bakhtiyaa-nasiibka (lottery) iyo laba-luqadeedka si kale ayaa loo qaybiyaa.',
  privacy: 'Markaad raadiso cinwaan, browser-kaagu wuxuu u diraa Esri si uu khariidadda ugu helo. Boggani ma kaydiyo.',
  notAffiliated: 'Boggani ka mid ma aha PPS.',

  mapCluster: ({ name }) => `Kooxda ${name}`,
  mapSplit: ({ parts, last }) => `Dugsiga sare: ${parts} ama ${last}, iyadoo ku xiran cinwaanka`,
  mapOfArea: 'aagga',
  mapSqMi: ({ n }) => `${n} mayl oo laba jibbaaran`,
  arrowClosure: ({ from, to, detail }) => `${from} waa la xirayaa. Ardaydu waxay u guurayaan ${to}.${detail ? ' ' + detail : ''}`,
  arrowProgram: ({ program, from, to }) => `${program}: ${from} → ${to}`,

  closeSelf: ({ school, to, detail }) => `${school} waa la xirayaa${to ? `. Ardaydu waxay u guurayaan ${to}` : ''}.${detail ? ' ' + detail : ''}`,
  closeReceives: ({ school, detail }) => `Wuxuu qaataa ardayda ${school}, oo la xirayo.${detail ? ' ' + detail : ''}`,
  programHere: ({ program, from, detail }) => `Barnaamijka ${program} wuxuu halkan uga soo guurayaa ${from}.${detail ? ' ' + detail : ''}`,
  programIts: ({ program, to, others, detail }) => `Barnaamijka ${program} ee dugsigan wuxuu u guurayaa ${to}${others ? `, isagoo la socda kan ${others}` : ''}.${detail ? ' ' + detail : ''}`,
  programMove: ({ program, from, to, detail }) => `Barnaamijka ${program} wuxuu ka guurayaa ${from} una guurayaa ${to}.${detail ? ' ' + detail : ''}`,
  gradesReceives: ({ school }) => `Wuxuu qaataa fasallada 6–8 ee ${school}. ${school} wuxuu noqonayaa K–5.`,
  gradesSelf: ({ school, to }) => `${school} wuxuu noqonayaa K–5. Fasalladiisa 6–8 waxay u guurayaan ${to}.`,
  noteUnclear: ({ before, after, scenario }) =>
    `${before} lama xirayo. Khariidadda ${scenario} ee PPS, ${before} iyo ${after} waxay ku jiraan hal xad. PPS ma sheegin dugsiga u adeegi doona aagga hadda ee ${before}. Fadlan weydii PPS: Rightsizing@pps.net.`,
  noteNoArea: ({ before, after, scenario, as }) =>
    `${before} lama xirayo. Wuu furnaanayaa${as}. Khariidadda ${scenario}, ma laha aag xaafadeed u gaar ah, sidaas darteed meeshan waxay ka tirsan tahay ${after}.`,
  'scenario.r': 'Talo-bixinta',
  'scenarioShort.r': 'Talo-bixin',
  changesSummaryRec: ({ closures, first, second, moving, share, sqShare }) =>
    `Dugsiyada la xirayo: ${closures} (${first} dayrta 2027, ${second} dayrta 2028). Qiyaastii ${moving} ardayda K–8 waxay u guurayaan dugsi kale, oo ay ku jiraan ardayda barnaamijkoodu guurayo. PPS waxay filaysaa in sannadka 2031–32, ${share} dugsiyada hoose ay yeeshaan ugu yaraan 360 arday (isbeddel la’aan: ${sqShare}).`,
  groupYear: ({ year }) => `Laga bilaabo dayrta ${year}`,
  groupKept: 'Waxaa la beddelay ka dib fikradaha bulshada',
  changesSourceRec: 'Waxaa laga soo qaaday warqadda talo-bixinta ee Maamulaha Guud ee Guddiga Waxbarashada, 12ka Nofeembar 2026.',
  fromFall: ({ year, text }) => `Laga bilaabo dayrta ${year}: ${text}`,
  timeline6: ['Dayrta 2028:', 'Isbeddellada intooda kale ayaa dhacaya.'],
  sourceRecMemo: 'Warqadda talo-bixinta ee Maamulaha Guud (PDF, Ingiriis)',
  sourceRecFinder: 'Rightsizing School Finder ee PPS (khariidad leh xadka Talo-bixinta; Ingiriis)',
  methodRec: 'Xadka Talo-bixinta waxaa laga soo qaaday xogta khariidadda PPS lafteeda (Rightsizing School Finder). Meesha xogtaasi ka tagto aag, aaggaasi wuxuu haynayaa dugsiga hadda.',
  noteNoAreaAs: ({ langs }) => ` isagoo ah dugsi laba-luqadeed ${langs}`,
}

const memo = {
  'About 70% of its area goes to Hayhurst and 30% to Rieke.': 'Qiyaastii 70% aaggiisa wuxuu u wareegayaa Hayhurst, 30% na Rieke.',
  'The Maplewood middle school area moves from Jackson to Robert Gray.': 'Aagga dugsiga dhexe (middle school) ee Maplewood wuxuu Jackson uga wareegayaa Robert Gray.',
  'Skyline students will go to Roosevelt for high school, not Lincoln. Skyline stays K–8.': 'Ardayda Skyline waxay dugsiga sare u aadi doonaan Roosevelt, ma aha Lincoln. Skyline wuxuu ahaanayaa K–8.',
  'Bridlemile keeps the same middle and high schools.': 'Bridlemile wuxuu haynayaa isla dugsiyada dhexe iyo sare.',
  'MLC becomes K–8. Its 9–12 program closes. Those students go to their neighborhood high school.': 'MLC wuxuu noqonayaa K–8. Barnaamijkiisa 9–12 waa la xirayaa. Ardaydaas waxay aadayaan dugsiga sare ee xaafaddooda.',
  'The East Sylvan building will be empty.': 'Dhismaha East Sylvan wuxuu noqonayaa mid madhan.',
  'Irvington’s K–5 students go to Beverly Cleary. Its middle school area goes to Beaumont.': 'Ardayda K–5 ee Irvington waxay u guurayaan Beverly Cleary. Aaggiisa dugsiga dhexe wuxuu u wareegayaa Beaumont.',
  'About half of its area goes to each school.': 'Qiyaastii kala bar aaggiisa ayaa u wareegaya dugsi kasta.',
  'Neighborhood K–5 students go to Atkinson.': 'Ardayda K–5 ee xaafadda waxay u guurayaan Atkinson.',
  'The Llewellyn area goes to Hosford. The Duniway and Lewis areas go to Brentwood.': 'Aagga Llewellyn wuxuu u wareegayaa Hosford. Aagagga Duniway iyo Lewis waxay u wareegayaan Brentwood.',
  'Sunnyside’s special environmental program ends. It becomes a neighborhood school. It takes no new lottery students. Current lottery students can stay through 5th grade.': 'Barnaamijka gaarka ah ee deegaanka ee Sunnyside wuu dhammaanayaa. Wuxuu noqonayaa dugsi xaafadeed. Ma qaato arday cusub oo bakhtiyaa-nasiib ah. Ardayda hadda bakhtiyaa-nasiibka ku jirta way sii joogi karaan ilaa fasalka 5aad.',
  'Neighborhood K–5 students go to Chief Joseph.': 'Ardayda K–5 ee xaafadda waxay u guurayaan Chief Joseph.',
  'Neighborhood K–5 students go to Sitton.': 'Ardayda K–5 ee xaafadda waxay u guurayaan Sitton.',
  'César Chávez becomes the main K–5 Spanish immersion school. Its K–5 students who are not in immersion go to Rosa Parks.': 'César Chávez wuxuu noqonayaa dugsiga ugu weyn ee K–5 ee laba-luqadeedka Isbaanishka. Ardaydiisa K–5 ee aan ku jirin barnaamijka waxay u guurayaan Rosa Parks.',
  'About 70% of its area goes to Markham and 30% to Capitol Hill.': 'Qiyaastii 70% aaggiisa wuxuu u wareegayaa Markham, 30% na Capitol Hill.',
  'Neighborhood K–5 students go to Scott.': 'Ardayda K–5 ee xaafadda waxay u guurayaan Scott.',
  'Stephenson stays open with no changes. (It closes in Scenario A.)': 'Stephenson wuu furnaanayaa, isbeddel la’aan. (Qorshaha A waa la xirayaa.)',
  'Rose City Park stays open. It keeps its neighborhood area and Vietnamese immersion. (In Scenario A, both move.)': 'Rose City Park wuu furnaanayaa. Wuxuu haynayaa aaggiisa xaafadeed iyo laba-luqadeedka Fiyatnaamiiska. (Qorshaha A, labaduba way guurayaan.)',
  'Lewis stays open and gets part of Whitman’s area. (It closes in Scenario A.)': 'Lewis wuu furnaanayaa wuxuuna helayaa qayb ka mid ah aagga Whitman. (Qorshaha A waa la xirayaa.)',
  "Starting in fall 2028, students from the Peninsula area go to George for middle school instead of Ockley Green.": "Laga bilaabo dayrta 2028, ardayda aagga Peninsula waxay dugsiga dhexe u aadayaan George halkii ay ka aadi lahaayeen Ockley Green.",
  "The Bybee Lakes area moves from Faubion to Astor K–8, and from Jefferson to Roosevelt for high school.": "Aagga Bybee Lakes wuxuu Faubion uga wareegayaa Astor K–8, dugsiga sarena wuxuu Jefferson uga wareegayaa Roosevelt.",
  "In fall 2027, Beverly Cleary’s K–5 students join Irvington in the Irvington building while Beverly Cleary gets earthquake upgrades. In fall 2028, the combined school moves to the Beverly Cleary building. Irvington’s middle school area goes to Beaumont.": "Dayrta 2027, ardayda K–5 ee Beverly Cleary waxay ku biirayaan Irvington oo ku jira dhismaha Irvington, inta dhismaha Beverly Cleary laga xoojinayo dhulgariirka. Dayrta 2028, dugsiga la isku daray wuxuu u guurayaa dhismaha Beverly Cleary. Aagga dugsiga dhexe ee Irvington wuxuu u wareegayaa Beaumont.",
  "Rigler becomes a whole-school Spanish immersion school. Its neighborhood K–5 students go to Scott.": "Rigler wuxuu noqonayaa dugsi laba-luqadeed Isbaanish ah oo dhan. Ardayda K–5 ee xaafaddiisa waxay u guurayaan Scott.",
  "Students north of E. Burnside St. go to Sunnyside. The rest go to Abernethy.": "Ardayda ka waqooyi ah E. Burnside St. waxay u guurayaan Sunnyside. Inta kale waxay u guurayaan Abernethy.",
  "Sunnyside keeps its environmental focus. It becomes K–5 and still takes some students by lottery.": "Sunnyside wuxuu haynayaa barnaamijkiisa deegaanka. Wuxuu noqonayaa K–5 wuxuuna weli qaataa arday qaar bakhtiyaa-nasiib ah.",
  "Students from the Atkinson and Creston areas go to Kellogg for middle school, starting with 6th grade.": "Ardayda aagagga Atkinson iyo Creston waxay dugsiga dhexe u aadayaan Kellogg, laga bilaabo fasalka 6aad.",
  "Lent becomes a whole-school Spanish immersion school. PPS’s map moves Lent’s neighborhood area to Kelly for K–5 and to Brentwood for middle school.": "Lent wuxuu noqonayaa dugsi laba-luqadeed Isbaanish ah oo dhan. Khariidadda PPS waxay aagga xaafadda Lent u wareejinaysaa Kelly (K–5) iyo Brentwood (dugsiga dhexe).",
  "Duniway’s area west of McLoughlin Blvd. goes to Llewellyn.": "Aagga Duniway ee ka galbeed ah McLoughlin Blvd. wuxuu u wareegayaa Llewellyn.",
  "Sunnyside’s area and part of Woodstock’s go to Cleveland for high school instead of Franklin.": "Aagga Sunnyside iyo qayb ka mid ah aagga Woodstock waxay dugsiga sare u aadayaan Cleveland halkii Franklin.",
  "Whitman’s area goes to Franklin for high school instead of Cleveland.": "Aagga Whitman wuxuu dugsiga sare u aadayaa Franklin halkii Cleveland.",
  "MLC becomes K–8. Its 9–12 students can go to Alliance High School, a focus option, or their neighborhood high school.": "MLC wuxuu noqonayaa K–8. Ardaydiisa 9–12 waxay aadi karaan Alliance High School, barnaamij gaar ah, ama dugsiga sare ee xaafaddooda.",
  "Sellwood, James John, Maplewood and Stephenson stay open. Scenario A or B would have closed them.": "Sellwood, James John, Maplewood iyo Stephenson way furnaanayaan. Qorshaha A ama B ayaa xiri lahaa.",
  "Skyline students keep going to Lincoln for high school.": "Ardayda Skyline waxay sii wadayaan inay dugsiga sare u aadaan Lincoln.",
  "MLK Jr. keeps its Mandarin immersion program.": "MLK Jr. wuxuu haynayaa barnaamijkiisa laba-luqadeedka Shiinaha (Mandarin).",
}

// written to follow «Barnaamijka …»
const programs = {
  'Spanish immersion': 'laba-luqadeedka Isbaanishka',
  'Spanish immersion (middle grades)': 'laba-luqadeedka Isbaanishka (dugsiga dhexe)',
  'Chinese (Mandarin) immersion': 'laba-luqadeedka Shiinaha (Mandarin)',
  'Vietnamese immersion': 'laba-luqadeedka Fiyatnaamiiska',
  'Deaf and Hard of Hearing program': 'ardayda dhagoolaha iyo maqal-yaraha',
  'Odyssey (K–8 focus option)': 'Odyssey (barnaamij gaar ah oo K–8)',
}

export default {
  name: 'Soomaali', locale: 'so-SO', and: ' iyo ', sep: ', ', reviewed: false,
  strings: { ...strings, programTitle: ({ program }) => `Barnaamijka ${program}` },
  memo, programs, languages: LANGS,
  label: {
    middle: 'dugsiga dhexe', high: 'dugsiga sare', closed: 'dugsi la xiray', buildingClosed: 'dhisme la xiray',
    neighborhoodImmersion: 'xaafadeed iyo laba-luqadeed', neighborhood: 'dugsi xaafadeed', focus: 'barnaamij gaar ah',
    immersion: (l) => `laba-luqadeed ${LANGS[l] ?? l}`,
  },
}
