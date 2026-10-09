// Русский. Plain language, formal «Вы». School and street names stay in English and are not declined
// (they follow «школа»/«школы»). Counts are written as "Закрываются школы: 14" to avoid plural agreement.
// Glossary: attendance area = школьная зона; status quo = без изменений; scenario = вариант;
// dual language immersion = программа погружения в язык; neighborhood school = районная школа;
// elementary = начальная школа; middle school = средняя школа (middle school);
// high school = старшая школа (high school); closes = закрывается; school board = Школьный совет;
// superintendent = суперинтендант (руководитель округа).
// AI-assisted translation, not yet reviewed by a native speaker.

const LANGS = { Spanish: 'испанский', Mandarin: 'китайский (мандарин)', Vietnamese: 'вьетнамский', Japanese: 'японский', Russian: 'русский' }

const strings = {
  title: 'Школьные зоны PPS',
  subtitle: 'Предлагаемые изменения в школах с осени 2027 года',
  contact: 'Автор: Jason Brown. Видите ошибку в границах или хотите задать вопрос? Пишите на',
  languageLabel: 'Язык',
  translationNote: 'Этот перевод сделан с помощью ИИ и ещё не проверен носителем языка.',
  sheetShow: 'Показать настройки карты',
  sheetHide: 'Скрыть настройки карты',
  mapLabel: 'Карта школьных зон. Нажмите на место, чтобы увидеть его школы.',

  howToTitle: 'Как пользоваться картой',
  howTo1: 'Выберите вариант: «Без изменений», «Вариант A» или «Вариант B».',
  howTo2: 'Выберите классы: K–5, 6–8 или 9–12.',
  howTo3: 'Введите свой адрес или нажмите на карту. Вы увидите свои школы в каждом варианте.',

  scenarioLabel: 'Вариант',
  'scenario.sq': 'Без изменений',
  'scenario.a': 'Вариант A',
  'scenario.b': 'Вариант B',
  'scenarioShort.sq': 'Без изм.',
  'scenarioShort.a': 'Вар. A',
  'scenarioShort.b': 'Вар. B',
  scenarioHint: 'Portland Public Schools (PPS, государственный школьный округ Портленда) предлагает два плана: варианты A и B. «Без изменений» показывает, как сейчас. Решение ещё не принято.',
  gradesLabel: 'Классы',

  compareToggle: 'Показать нынешние границы поверх (пунктиром)',
  changesToggle: 'Показать, где меняется школа и куда переходят ученики закрываемых школ',
  changesKeyHatch: 'В этой зоне будет другая школа, чем сейчас',
  changesKeyClosed: 'Школа закрывается. Пунктирные стрелки ведут к школам, которые примут её учеников.',
  programsToggle: ({ moves }) => (moves ? 'Показать программы погружения в язык и куда они переходят' : 'Показать программы погружения в язык'),
  immersionOnly: 'Только программа погружения: без районной зоны',
  programsHint: ({ moves }) =>
    `В программе погружения ученики учатся на двух языках. Кружки отмечают школы с такой программой.${moves ? ' Стрелки показывают, что программа переходит в другую школу.' : ''} Приблизьте карту, чтобы увидеть названия.`,
  programsK5Note: 'Школы Rigler, Kelly и César Chávez не закрываются. Зона César Chávez переходит к Rosa Parks. На картах PPS школы Rigler и Scott, а также Kelly и Lent, находятся внутри общих границ. PPS не уточняет, какая школа обслуживает каждую зону.',
  dliToggle: 'Погружение в испанский язык: радиус 1 миля (начальная школа)',

  'lang.Spanish': 'Испанский',
  'lang.Mandarin': 'Китайский (мандарин)',
  'lang.Vietnamese': 'Вьетнамский',
  'lang.Japanese': 'Японский',
  'lang.Russian': 'Русский',
  'lang.Deaf and Hard of Hearing': 'Для глухих и слабослышащих',
  'lang.Odyssey': 'Odyssey',

  searchLabel: 'Найти адрес',
  searchPlaceholder: 'Например: 1234 SE Division St',
  find: 'Найти',
  finding: 'Поиск…',
  searching: 'Поиск…',
  searchHint: 'Или нажмите на любое место на карте.',
  searchNoMatch: 'Мы не нашли этот адрес в Портленде. Добавьте почтовый индекс или нажмите на карту.',
  sharedLocation: 'Отправленное место',
  schoolLocation: ({ name }) => `${name} (здание школы)`,
  dataError: 'Данные о границах не загрузились. Пожалуйста, обновите страницу.',

  lookupTitle: 'Школы в этом месте',
  lookupChanged: 'Жёлтая ячейка означает, что школа будет другой, чем сейчас.',
  lookupNear: '* Это место находится на линии границы, поэтому мы показываем ближайшую зону. Пожалуйста, уточните в PPS.',
  lookupChooseScenario: 'Выберите вариант A или B, чтобы увидеть, что изменится для этих школ.',
  lookupNotesTitle: ({ scenario }) => `Что это значит: ${scenario}`,
  cellOverlap: 'Зоны пересекаются',
  cellOutside: 'Вне округа',
  cellOr: ({ a, b }) => `${a} или ${b}?`,
  cellNearTitle: 'Это место на линии границы. Мы показываем ближайшую зону.',
  cellUnclearTitle: 'На карте PPS обе школы внутри одной границы. См. примечание ниже.',

  changesTitleSq: 'Если ничего не менять',
  changesSq: ({ share }) => `Ничего не меняется. Школы не закрываются, границы остаются прежними. По прогнозу PPS, к 2031–32 году ${share} учеников будут учиться в школах достаточного размера.`,
  changesTitle: ({ scenario }) => `Что меняется: ${scenario}`,
  changesSummary: ({ closures, boundary, moving, share, sqShare }) =>
    `Закрываются школы: ${closures}. Новые границы у школ: ${boundary}. Около ${moving} учеников K–8 переходят в другую школу. По прогнозу PPS, к 2031–32 году ${share} учеников будут учиться в школах достаточного размера (без изменений: ${sqShare}).`,
  groupClosing: ({ n }) => `Закрываемые школы (${n})`,
  groupPrograms: 'Программы, которые переходят в другую школу',
  groupGrades: '6–8 классы переходят (школа становится K–5)',
  groupOther: 'Другие изменения',
  changesSource: 'По служебной записке PPS для Школьного совета и региональным обзорам от 6 октября 2026 г.',

  dliNow: ({ when }) => `В пределах 1 мили от начальной школы с погружением в испанский язык (${when})`,
  dliLost: ({ when, lost }) => `Была программа на испанском в 2022 году, но нет (${when}): ${lost}`,
  dliWhenToday: 'сейчас',
  dliWhenIn: ({ scenario }) => scenario,
  dliPeriod: 'Период',
  dliSchools: 'Школ',
  dliWithin: 'Территория PPS в пределах 1 мили',
  dliToday: 'Сейчас (2025–26)',
  dliSqMi: ({ n }) => `${n} кв. миль`,
  dliNote: 'По закону Орегона ученики начальной школы, живущие дальше 1 мили от школы, получают школьный автобус. Кружки показывают расстояние по прямой, поэтому реальный путь пешком длиннее. Кружки показывают места, а не число учеников. PPS не публикует, где живут ученики программ погружения. В старой записке PPS сказано, что автобусы программ погружения за пределами зоны школы — только для учеников, для которых испанский родной. Программа погружения в испанский язык из школы Bridger перешла в школу Lent осенью 2023 года.',

  timelineTitle: 'Что дальше',
  timeline1: ['6 октября 2026 г.:', 'PPS представляет варианты Школьному совету.'],
  timeline2: ['Октябрь–ноябрь:', 'Семьи и жители высказывают своё мнение.'],
  timeline3: ['Середина ноября:', 'Суперинтендант выбирает один план и рекомендует его.'],
  timeline4: ['Декабрь:', 'Школьный совет голосует на открытом заседании.'],
  timeline5: ['Осень 2027 г.:', 'Изменения начинаются в 2027–28 учебном году.'],
  timelineNote: 'Это планы, а не решения. PPS ещё планирует автобусы, персонал и поддержку для учеников, которые переходят в другую школу.',
  feedbackTitle: 'Скажите PPS, что Вы думаете',
  feedbackEmail: 'Пишите на',
  feedbackRsvp: 'Записаться на встречу с жителями',
  feedbackFaq: 'Вопросы и ответы PPS о Rightsizing (плане изменения числа школ)',
  feedbackFaqNote: '(есть форма для вопросов)',

  clusterTitle: 'Зона старшей школы (high school)',

  sourcesTitle: 'Источники',
  sourceBoard: 'Документы Школьного совета PPS (пункт 8; на английском)',
  sourceMap: ({ scenario, band }) => `Карта ${band}: ${scenario} (PDF, на английском)`,
  sourcePpsdataBy: 'автор Alex Meub',
  sourcePpsdataRest: 'Этот проект помог нам найти документы Школьного совета и данные о границах города Портленда, по которым мы проверили эти карты.',
  method: 'Мы перенесли границы с карт вариантов PPS (PDF). Мы разместили их по координатам, которые есть в этих PDF, поэтому линии точны до нескольких метров. Изменения в школах взяты из служебной записки PPS от 6 октября 2026 г. Нынешние зоны совпадают с данными города Портленда на 98% территории округа. Если Вы живёте рядом с границей, пожалуйста, уточните в PPS. Места по лотерее и в программах погружения распределяются иначе.',
  privacy: 'Когда Вы ищете адрес, браузер отправляет его в Esri, чтобы найти его на карте. Этот сайт адрес не сохраняет.',
  notAffiliated: 'Этот сайт не относится к PPS.',

  mapCluster: ({ name }) => `Группа школ ${name}`,
  mapSplit: ({ parts, last }) => `Старшая школа: ${parts} или ${last}, в зависимости от адреса`,
  mapOfArea: 'площади',
  mapSqMi: ({ n }) => `${n} кв. миль`,
  arrowClosure: ({ from, to, detail }) => `Школа ${from} закрывается. Ученики переходят в: ${to}.${detail ? ' ' + detail : ''}`,
  arrowProgram: ({ program, from, to }) => `Программа ${program}: ${from} → ${to}`,
  programTitle: ({ program }) => `Программа ${program}`,

  closeSelf: ({ school, to, detail }) => `Школа ${school} закрывается${to ? `. Ученики переходят в: ${to}` : ''}.${detail ? ' ' + detail : ''}`,
  closeReceives: ({ school, detail }) => `Принимает учеников закрываемой школы ${school}.${detail ? ' ' + detail : ''}`,
  programHere: ({ program, from, detail }) => `Программа ${program} переходит сюда из школы ${from}.${detail ? ' ' + detail : ''}`,
  programIts: ({ program, to, others, detail }) => `Программа ${program} этой школы переходит в школу ${to}${others ? `, вместе с программой школ ${others}` : ''}.${detail ? ' ' + detail : ''}`,
  programMove: ({ program, from, to, detail }) => `Программа ${program} переходит из школы ${from} в школу ${to}.${detail ? ' ' + detail : ''}`,
  gradesReceives: ({ school }) => `Принимает 6–8 классы из школы ${school}. Школа ${school} становится K–5.`,
  gradesSelf: ({ school, to }) => `Школа ${school} становится K–5. Её 6–8 классы переходят в школу ${to}.`,
  noteUnclear: ({ before, after, scenario }) =>
    `Школа ${before} не закрывается. На карте PPS («${scenario}») школы ${before} и ${after} находятся внутри одной границы. PPS не уточняет, какая школа будет обслуживать нынешнюю зону ${before}. Пожалуйста, спросите PPS: Rightsizing@pps.net.`,
  noteNoArea: ({ before, after, scenario, as }) =>
    `Школа ${before} не закрывается. Она остаётся открытой${as}. На карте «${scenario}» у неё нет своей районной зоны, поэтому это место относится к школе ${after}.`,
  noteNoAreaAs: ({ langs }) => ` как школа с погружением в ${langs} язык`,
}

const memo = {
  'About 70% of its area goes to Hayhurst and 30% to Rieke.': 'Около 70% её зоны переходит к школе Hayhurst и 30% — к Rieke.',
  'The Maplewood middle school area moves from Jackson to Robert Gray.': 'Зона средней школы (middle school) для Maplewood переходит от Jackson к Robert Gray.',
  'Skyline students will go to Roosevelt for high school, not Lincoln. Skyline stays K–8.': 'Ученики Skyline будут ходить в старшую школу Roosevelt, а не Lincoln. Skyline остаётся K–8.',
  'Bridlemile keeps the same middle and high schools.': 'У Bridlemile остаются те же средняя и старшая школы.',
  'MLC becomes K–8. Its 9–12 program closes. Those students go to their neighborhood high school.': 'MLC становится K–8. Программа 9–12 классов закрывается. Эти ученики пойдут в старшую школу своего района.',
  'The East Sylvan building will be empty.': 'Здание East Sylvan останется пустым.',
  'Irvington’s K–5 students go to Beverly Cleary. Its middle school area goes to Beaumont.': 'Ученики K–5 из Irvington переходят в Beverly Cleary. Её зона средней школы переходит к Beaumont.',
  'About half of its area goes to each school.': 'Примерно половина её зоны переходит к каждой из школ.',
  'Neighborhood K–5 students go to Atkinson.': 'Ученики K–5 из этого района переходят в Atkinson.',
  'The Llewellyn area goes to Hosford. The Duniway and Lewis areas go to Brentwood.': 'Зона Llewellyn переходит к Hosford. Зоны Duniway и Lewis переходят к Brentwood.',
  'Sunnyside’s special environmental program ends. It becomes a neighborhood school. It takes no new lottery students. Current lottery students can stay through 5th grade.': 'Специальная экологическая программа Sunnyside заканчивается. Школа становится районной. Новых учеников по лотерее не принимает. Нынешние ученики по лотерее могут остаться до 5 класса.',
  'Neighborhood K–5 students go to Chief Joseph.': 'Ученики K–5 из этого района переходят в Chief Joseph.',
  'Neighborhood K–5 students go to Sitton.': 'Ученики K–5 из этого района переходят в Sitton.',
  'César Chávez becomes the main K–5 Spanish immersion school. Its K–5 students who are not in immersion go to Rosa Parks.': 'César Chávez становится главной школой K–5 с погружением в испанский язык. Её ученики K–5, которые не учатся в этой программе, переходят в Rosa Parks.',
  'About 70% of its area goes to Markham and 30% to Capitol Hill.': 'Около 70% её зоны переходит к Markham и 30% — к Capitol Hill.',
  'Neighborhood K–5 students go to Scott.': 'Ученики K–5 из этого района переходят в Scott.',
  'Stephenson stays open with no changes. (It closes in Scenario A.)': 'Stephenson остаётся открытой без изменений. (В варианте A она закрывается.)',
  'Rose City Park stays open. It keeps its neighborhood area and Vietnamese immersion. (In Scenario A, both move.)': 'Rose City Park остаётся открытой. У неё остаются районная зона и программа погружения во вьетнамский язык. (В варианте A и то, и другое переходит.)',
  'Lewis stays open and gets part of Whitman’s area. (It closes in Scenario A.)': 'Lewis остаётся открытой и получает часть зоны Whitman. (В варианте A она закрывается.)',
}

// written to follow «Программа …»
const programs = {
  'Spanish immersion': 'погружения в испанский язык',
  'Spanish immersion (middle grades)': 'погружения в испанский язык (средняя школа)',
  'Chinese (Mandarin) immersion': 'погружения в китайский язык (мандарин)',
  'Vietnamese immersion': 'погружения во вьетнамский язык',
  'Deaf and Hard of Hearing program': 'для глухих и слабослышащих учеников',
  'Odyssey (K–8 focus option)': '«Odyssey» (специальная программа K–8)',
}

export default {
  name: 'Русский', locale: 'ru-RU', and: ' и ', sep: ', ', reviewed: false,
  strings, memo, programs, languages: LANGS,
  label: {
    middle: 'средняя школа', high: 'старшая школа', closed: 'школа закрыта', buildingClosed: 'здание закрыто',
    neighborhoodImmersion: 'районная и с погружением в язык', neighborhood: 'районная', focus: 'специальная программа',
    immersion: (l) => `погружение в ${LANGS[l] ?? l} язык`,
  },
}
