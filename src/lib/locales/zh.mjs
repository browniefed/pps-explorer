// 简体中文. Plain language, short sentences. School and street names stay in English.
// Glossary: attendance area = 学区范围; boundary = 学区边界; status quo = 维持现状; scenario = 方案;
// dual language immersion = 双语沉浸项目; neighborhood school = 社区学校; elementary = 小学;
// middle school = 初中; high school = 高中; closes = 关闭; school board = 教育委员会;
// superintendent = 学区总监.
// AI-assisted translation. Needs review by a native Chinese speaker before it is relied on.

const LANGS = { Spanish: '西班牙语', Mandarin: '中文（普通话）', Vietnamese: '越南语', Japanese: '日语', Russian: '俄语' }

const strings = {
  title: 'PPS 学区地图',
  subtitle: '拟议的学区调整，2027 年秋季起',
  contact: '由 Jason Brown 制作。发现边界有误或有疑问？请发邮件至',
  languageLabel: '语言',
  translationNote: '本翻译借助 AI 完成，尚未经过中文母语人士审核。',
  sheetShow: '显示地图选项',
  sheetHide: '隐藏地图选项',
  mapLabel: '学区地图。点击任意位置，查看该处对应的学校。',

  howToTitle: '如何使用这张地图',
  howTo1: '选择方案：维持现状、方案 A 或方案 B。',
  howTo2: '选择年级：K–5、6–8 或 9–12。',
  howTo3: '输入您的地址，或点击地图。您会看到每个方案下对应的学校。',

  scenarioLabel: '方案',
  'scenario.sq': '维持现状',
  'scenario.a': '方案 A',
  'scenario.b': '方案 B',
  'scenarioShort.sq': '现状',
  'scenarioShort.a': '方案 A',
  'scenarioShort.b': '方案 B',
  scenarioHint: '波特兰公立学区（PPS）提出了两个方案：A 和 B。“维持现状”显示目前的情况。目前尚未做出决定。',
  gradesLabel: '年级',

  compareToggle: '叠加显示现有边界（虚线）',
  changesToggle: '显示学校有变化的区域，以及关闭学校的学生去向',
  changesKeyHatch: '该区域的学校将与现在不同',
  changesKeyClosed: '学校关闭。虚线箭头指向接收其学生的学校。',
  programsToggle: ({ moves }) => (moves ? '显示双语沉浸项目及其搬迁去向' : '显示双语沉浸项目'),
  immersionOnly: '仅设双语沉浸项目：没有社区学区范围',
  programsHint: ({ moves }) =>
    `在双语沉浸项目中，学生用两种语言学习。圆环标出设有双语沉浸项目的学校。${moves ? '箭头表示项目搬到另一所学校。' : ''}放大地图可查看校名。`,
  programsK5Note: 'Rigler、Kelly 和 César Chávez 不会关闭。César Chávez 的学区范围并入 Rosa Parks。PPS 的地图把 Rigler 和 Scott、Kelly 和 Lent 画在同一条边界内。PPS 没有说明各区域由哪所学校服务。',
  dliToggle: '西班牙语沉浸项目：1 英里范围（小学）',

  'lang.Spanish': '西班牙语',
  'lang.Mandarin': '中文（普通话）',
  'lang.Vietnamese': '越南语',
  'lang.Japanese': '日语',
  'lang.Russian': '俄语',
  'lang.Deaf and Hard of Hearing': '聋哑及听障',
  'lang.Odyssey': 'Odyssey',

  searchLabel: '查找地址',
  searchPlaceholder: '例如：1234 SE Division St',
  find: '查找',
  finding: '正在查找…',
  searching: '正在查找…',
  searchHint: '也可以直接点击地图上的任意位置。',
  searchNoMatch: '在波特兰找不到这个地址。请加上邮政编码（ZIP），或直接点击地图。',
  sharedLocation: '分享的位置',
  schoolLocation: ({ name }) => `${name}（学校位置）`,
  dataError: '边界数据无法加载。请刷新页面。',

  lookupTitle: '此位置的学校',
  lookupChanged: '黄色方框表示学校与现在不同。',
  lookupNear: '* 此位置在边界线上，因此显示最近的区域。请向 PPS 确认。',
  lookupChooseScenario: '选择方案 A 或 B，查看这些学校会有什么变化。',
  lookupNotesTitle: ({ scenario }) => `${scenario}对这里的影响`,
  cellOverlap: '区域重叠',
  cellOutside: '学区以外',
  cellOr: ({ a, b }) => `${a}还是${b}？`,
  cellNearTitle: '此位置在边界线上。显示的是最近的区域。',
  cellUnclearTitle: 'PPS 的地图把两所学校画在同一条边界内。请看下方说明。',

  changesTitleSq: '如果什么都不改变',
  changesSq: ({ share }) => `没有任何变化。不关闭学校，边界也不变。PPS 预计到 2031–32 学年，${share}的学生就读于规模合适的学校。`,
  changesTitle: ({ scenario }) => `${scenario}的变化`,
  changesSummary: ({ closures, boundary, moving, share, sqShare }) =>
    `关闭 ${closures} 所学校。${boundary} 所学校的边界有变化。约 ${moving} 的 K–8 学生将转到另一所学校。PPS 预计到 2031–32 学年，${share}的学生就读于规模合适的学校（维持现状：${sqShare}）。`,
  groupClosing: ({ n }) => `关闭的学校（${n}）`,
  groupPrograms: '搬迁的项目',
  groupGrades: '6–8 年级搬走（学校改为 K–5）',
  groupOther: '其他变化',
  changesSource: '资料来源：PPS 2026 年 10 月 6 日致教育委员会的备忘录及各区域概要。',

  dliNow: ({ when }) => `距离设有西班牙语沉浸项目的小学 1 英里以内（${when}）`,
  dliLost: ({ when, lost }) => `2022 年设有西班牙语沉浸项目、${when}不再设有的学校：${lost}`,
  dliWhenToday: '目前',
  dliWhenIn: ({ scenario }) => `在${scenario}中`,
  dliPeriod: '时期',
  dliSchools: '学校',
  dliWithin: '1 英里范围内的 PPS 区域',
  dliToday: '目前（2025–26）',
  dliSqMi: ({ n }) => `${n} 平方英里`,
  dliNote: '俄勒冈州法律规定，住处离学校超过 1 英里的小学生可以乘坐校车。圆环按直线距离计算，实际步行距离会更远。圆环显示的是区域，不是学生人数。PPS 没有公布双语沉浸项目学生的住址。PPS 早前的一份文件说，学区范围以外的双语沉浸项目校车只提供给以西班牙语为母语的学生。Bridger 的西班牙语项目已于 2023 年秋季迁到 Lent。',

  timelineTitle: '接下来的安排',
  timeline1: ['2026 年 10 月 6 日：', 'PPS 向教育委员会提交了方案。'],
  timeline2: ['10 月至 11 月：', '家庭和社区提出意见。'],
  timeline3: ['11 月中旬：', '学区总监推荐一个方案。'],
  timeline4: ['12 月：', '教育委员会在公开会议上投票。'],
  timeline5: ['2027 年秋季：', '变化从 2027–28 学年开始。'],
  timelineNote: '这些都还是方案，不是最终决定。PPS 仍在规划校车、人员安排和对转学学生的支持。',
  feedbackTitle: '向 PPS 提出您的意见',
  feedbackEmail: '发送电子邮件',
  feedbackRsvp: '报名参加社区会议',
  feedbackFaq: 'PPS 关于 Rightsizing（学校规模调整计划）的常见问题',
  feedbackFaqNote: '（附有提问表格）',

  clusterTitle: '高中学区',

  sourcesTitle: '资料来源',
  sourceBoard: 'PPS 教育委员会会议资料（第 8 项；英文）',
  sourceMap: ({ scenario, band }) => `${band} 地图 – ${scenario}（PDF，英文）`,
  sourcePpsdataBy: '作者 Alex Meub',
  sourcePpsdataRest: '该项目帮助我们找到教育委员会的资料，以及用来核对这些地图的波特兰市边界数据。',
  method: '我们从 PPS 的方案地图（PDF）中描出边界，并利用 PDF 中的坐标定位，因此线条误差在几米以内。学校的变化来自 PPS 2026 年 10 月 6 日的备忘录。现有学区范围与波特兰市数据的吻合度达到 98%。如果您住在边界附近，请向 PPS 确认。抽签和双语沉浸项目的名额另行分配。',
  privacy: '查找地址时，您的浏览器会把地址发送给 Esri 以在地图上定位。本网站不会保存地址。',
  notAffiliated: '本网站与 PPS 无关。',

  mapCluster: ({ name }) => `${name} 高中学区`,
  mapSplit: ({ parts, last }) => `高中：${parts}或${last}，视地址而定`,
  mapOfArea: '该区域',
  mapSqMi: ({ n }) => `${n} 平方英里`,
  arrowClosure: ({ from, to, detail }) => `${from}关闭。学生转到 ${to}。${detail ? detail : ''}`,
  arrowProgram: ({ program, from, to }) => `${program}：${from} → ${to}`,

  closeSelf: ({ school, to, detail }) => `${school}关闭${to ? `。学生转到 ${to}` : ''}。${detail ? detail : ''}`,
  closeReceives: ({ school, detail }) => `接收即将关闭的 ${school} 的学生。${detail ? detail : ''}`,
  programHere: ({ program, from, detail }) => `${program}从 ${from} 搬到这里。${detail ? detail : ''}`,
  programIts: ({ program, to, others, detail }) => `本校的${program}搬到 ${to}${others ? `，与 ${others} 的项目合并` : ''}。${detail ? detail : ''}`,
  programMove: ({ program, from, to, detail }) => `${program}从 ${from} 搬到 ${to}。${detail ? detail : ''}`,
  gradesReceives: ({ school }) => `接收 ${school} 的 6–8 年级学生。${school} 改为 K–5。`,
  gradesSelf: ({ school, to }) => `${school} 改为 K–5。6–8 年级转到 ${to}。`,
  noteUnclear: ({ before, after, scenario }) =>
    `${before} 不会关闭。在 PPS 的${scenario}地图上，${before} 和 ${after} 在同一条边界内。PPS 没有说明 ${before} 现有的学区范围将由哪所学校服务。请向 PPS 询问：Rightsizing@pps.net。`,
  noteNoArea: ({ before, after, scenario, as }) =>
    `${before} 不会关闭，将继续开放${as}。在${scenario}地图上，它没有自己的社区学区范围，因此这里属于 ${after}。`,
  noteNoAreaAs: ({ langs }) => `，作为${langs}双语沉浸学校`,
}

const memo = {
  'About 70% of its area goes to Hayhurst and 30% to Rieke.': '约 70% 的区域并入 Hayhurst，30% 并入 Rieke。',
  'The Maplewood middle school area moves from Jackson to Robert Gray.': 'Maplewood 的初中学区从 Jackson 改为 Robert Gray。',
  'Skyline students will go to Roosevelt for high school, not Lincoln. Skyline stays K–8.': 'Skyline 的学生高中将就读 Roosevelt，而不是 Lincoln。Skyline 仍为 K–8。',
  'Bridlemile keeps the same middle and high schools.': 'Bridlemile 的初中和高中保持不变。',
  'MLC becomes K–8. Its 9–12 program closes. Those students go to their neighborhood high school.': 'MLC 改为 K–8。其 9–12 年级项目关闭，这些学生转到所在社区的高中。',
  'The East Sylvan building will be empty.': 'East Sylvan 校舍将空置。',
  'Irvington’s K–5 students go to Beverly Cleary. Its middle school area goes to Beaumont.': 'Irvington 的 K–5 学生转到 Beverly Cleary。其初中学区并入 Beaumont。',
  'About half of its area goes to each school.': '其区域大约各有一半并入这两所学校。',
  'Neighborhood K–5 students go to Atkinson.': '社区的 K–5 学生转到 Atkinson。',
  'The Llewellyn area goes to Hosford. The Duniway and Lewis areas go to Brentwood.': 'Llewellyn 区域并入 Hosford。Duniway 和 Lewis 区域并入 Brentwood。',
  'Sunnyside’s special environmental program ends. It becomes a neighborhood school. It takes no new lottery students. Current lottery students can stay through 5th grade.': 'Sunnyside 的环境特色项目结束，学校改为社区学校，不再通过抽签招收新生。现有的抽签学生可以读到五年级。',
  'Neighborhood K–5 students go to Chief Joseph.': '社区的 K–5 学生转到 Chief Joseph。',
  'Neighborhood K–5 students go to Sitton.': '社区的 K–5 学生转到 Sitton。',
  'César Chávez becomes the main K–5 Spanish immersion school. Its K–5 students who are not in immersion go to Rosa Parks.': 'César Chávez 成为主要的 K–5 西班牙语沉浸学校。不在沉浸项目中的 K–5 学生转到 Rosa Parks。',
  'About 70% of its area goes to Markham and 30% to Capitol Hill.': '约 70% 的区域并入 Markham，30% 并入 Capitol Hill。',
  'Neighborhood K–5 students go to Scott.': '社区的 K–5 学生转到 Scott。',
  'Stephenson stays open with no changes. (It closes in Scenario A.)': 'Stephenson 继续开放，没有变化。（在方案 A 中关闭。）',
  'Rose City Park stays open. It keeps its neighborhood area and Vietnamese immersion. (In Scenario A, both move.)': 'Rose City Park 继续开放，保留社区学区范围和越南语沉浸项目。（在方案 A 中两者都会搬迁。）',
  'Lewis stays open and gets part of Whitman’s area. (It closes in Scenario A.)': 'Lewis 继续开放，并接收 Whitman 的部分区域。（在方案 A 中关闭。）',
}

const programs = {
  'Spanish immersion': '西班牙语沉浸项目',
  'Spanish immersion (middle grades)': '西班牙语沉浸项目（初中）',
  'Chinese (Mandarin) immersion': '中文（普通话）沉浸项目',
  'Vietnamese immersion': '越南语沉浸项目',
  'Deaf and Hard of Hearing program': '聋哑及听障学生项目',
  'Odyssey (K–8 focus option)': 'Odyssey（K–8 特色项目）',
}

export default {
  name: '中文', locale: 'zh-CN', and: '和', sep: '、', reviewed: false,
  strings: { ...strings, programTitle: ({ program }) => program },
  memo, programs, languages: LANGS,
  label: {
    middle: '初中', high: '高中', closed: '学校关闭', buildingClosed: '校舍关闭',
    neighborhoodImmersion: '社区及沉浸项目', neighborhood: '社区学校', focus: '特色项目',
    immersion: (l) => `${LANGS[l] ?? l}沉浸项目`,
    parens: ['（', '）'], sep: '，',
  },
}
