// Tiếng Việt. Plain language, polite "quý vị". School and street names stay in English.
// Glossary: attendance area = khu vực ghi danh; status quo = không thay đổi; scenario = phương án;
// dual language immersion = chương trình song ngữ; neighborhood school = trường khu phố;
// elementary = tiểu học; middle school = trung học cơ sở; high school = trung học phổ thông;
// closes = đóng cửa; school board = Hội đồng Giáo dục; superintendent = Tổng Giám đốc Học khu.
// AI-assisted translation, not yet reviewed by a native speaker.

const LANGS = { Spanish: 'tiếng Tây Ban Nha', Mandarin: 'tiếng Quan Thoại', Vietnamese: 'tiếng Việt', Japanese: 'tiếng Nhật', Russian: 'tiếng Nga' }

const strings = {
  title: 'Khu vực ghi danh của PPS',
  subtitle: 'Đề xuất thay đổi trường học cho mùa thu 2027',
  contact: 'Do Jason Brown thực hiện. Quý vị thấy ranh giới sai hoặc có câu hỏi? Gửi email đến',
  languageLabel: 'Ngôn ngữ',
  translationNote: 'Bản dịch này được làm với sự hỗ trợ của AI và chưa được người bản ngữ kiểm tra.',
  sheetShow: 'Hiện các nút điều khiển bản đồ',
  sheetHide: 'Ẩn các nút điều khiển bản đồ',
  mapLabel: 'Bản đồ khu vực ghi danh. Bấm vào một nơi để xem các trường của nơi đó.',

  howToTitle: 'Cách dùng bản đồ này',
  howTo1: 'Chọn một phương án: Không thay đổi, Phương án A hoặc Phương án B.',
  howTo2: 'Chọn khối lớp: K–5, 6–8 hoặc 9–12.',
  howTo3: 'Nhập địa chỉ của quý vị hoặc bấm vào bản đồ. Quý vị sẽ thấy các trường trong từng phương án.',

  scenarioLabel: 'Phương án',
  'scenario.sq': 'Không thay đổi',
  'scenario.a': 'Phương án A',
  'scenario.b': 'Phương án B',
  'scenarioShort.sq': 'Không đổi',
  'scenarioShort.a': 'P.án A',
  'scenarioShort.b': 'P.án B',
  scenarioHint: 'Portland Public Schools (PPS, học khu công lập Portland) đề xuất hai kế hoạch: Phương án A và B. “Không thay đổi” cho thấy tình hình hiện nay. Chưa có gì là quyết định cuối cùng.',
  gradesLabel: 'Khối lớp',

  compareToggle: 'Hiện ranh giới hiện nay ở trên (nét chấm)',
  changesToggle: 'Hiện nơi đổi trường và nơi học sinh của các trường đóng cửa sẽ đến',
  changesKeyHatch: 'Khu vực này sẽ có trường khác với hiện nay',
  changesKeyClosed: 'Trường đóng cửa. Mũi tên nét đứt chỉ đến các trường nhận học sinh.',
  programsToggle: ({ moves }) => (moves ? 'Hiện chương trình song ngữ và nơi chương trình chuyển đến' : 'Hiện chương trình song ngữ'),
  immersionOnly: 'Chỉ có song ngữ: không có khu vực khu phố',
  programsHint: ({ moves }) =>
    `Trong chương trình song ngữ, học sinh học bằng hai ngôn ngữ. Vòng tròn đánh dấu trường song ngữ.${moves ? ' Mũi tên cho thấy chương trình chuyển sang trường khác.' : ''} Phóng to để xem tên.`,
  programsK5Note: 'Rigler, Kelly và César Chávez không đóng cửa. Khu vực của César Chávez chuyển sang Rosa Parks. Bản đồ của PPS đặt Rigler và Scott, Kelly và Lent trong ranh giới chung. PPS chưa nói trường nào phụ trách từng khu vực.',
  dliToggle: 'Song ngữ tiếng Tây Ban Nha: phạm vi 1 dặm (tiểu học)',

  'lang.Spanish': 'Tây Ban Nha',
  'lang.Mandarin': 'Quan Thoại',
  'lang.Vietnamese': 'Việt',
  'lang.Japanese': 'Nhật',
  'lang.Russian': 'Nga',
  'lang.Deaf and Hard of Hearing': 'Khiếm thính',
  'lang.Odyssey': 'Odyssey',

  searchLabel: 'Tìm một địa chỉ',
  searchPlaceholder: 'Ví dụ: 1234 SE Division St',
  find: 'Tìm',
  finding: 'Đang tìm…',
  searching: 'Đang tìm…',
  searchHint: 'Hoặc bấm vào bất kỳ chỗ nào trên bản đồ.',
  searchNoMatch: 'Chúng tôi không tìm thấy địa chỉ đó ở Portland. Hãy thêm mã bưu chính, hoặc bấm vào bản đồ.',
  sharedLocation: 'Vị trí được chia sẻ',
  schoolLocation: ({ name }) => `${name} (vị trí trường)`,
  dataError: 'Dữ liệu ranh giới chưa tải được. Xin vui lòng tải lại trang.',

  lookupTitle: 'Các trường tại nơi này',
  lookupChanged: 'Ô màu vàng nghĩa là trường khác với hiện nay.',
  lookupNear: '* Nơi này nằm trên đường ranh giới, nên chúng tôi hiện khu vực gần nhất. Xin vui lòng hỏi lại PPS.',
  lookupChooseScenario: 'Chọn Phương án A hoặc B để xem các trường này thay đổi thế nào.',
  lookupNotesTitle: ({ scenario }) => `Ý nghĩa trong ${scenario}`,
  cellOverlap: 'Khu vực chồng lên nhau',
  cellOutside: 'Ngoài học khu',
  cellOr: ({ a, b }) => `${a} hay ${b}?`,
  cellNearTitle: 'Nơi này nằm trên đường ranh giới. Chúng tôi hiện khu vực gần nhất.',
  cellUnclearTitle: 'Bản đồ của PPS vẽ cả hai trường trong cùng một ranh giới. Xem ghi chú bên dưới.',

  changesTitleSq: 'Nếu không thay đổi gì',
  changesSq: ({ share }) => `Không có gì thay đổi. Không trường nào đóng cửa và không ranh giới nào thay đổi. PPS dự kiến đến 2031–32 có ${share} học sinh học ở trường đủ lớn để hoạt động tốt.`,
  changesTitle: ({ scenario }) => `Những thay đổi trong ${scenario}`,
  changesSummary: ({ closures, boundary, moving, share, sqShare }) =>
    `${closures} trường đóng cửa. ${boundary} trường có ranh giới mới. Khoảng ${moving} học sinh K–8 đổi trường. PPS dự kiến đến 2031–32 có ${share} học sinh học ở trường đủ lớn để hoạt động tốt (nếu không thay đổi: ${sqShare}).`,
  groupClosing: ({ n }) => `Các trường đóng cửa (${n})`,
  groupPrograms: 'Các chương trình chuyển trường',
  groupGrades: 'Lớp 6–8 chuyển đi (trường chỉ còn K–5)',
  groupOther: 'Các thay đổi khác',
  changesSource: 'Theo bản ghi nhớ của PPS gửi Hội đồng Giáo dục và các bản tóm tắt khu vực ngày 6 tháng 10 năm 2026.',

  dliNow: ({ when }) => `Trong vòng 1 dặm từ một trường tiểu học song ngữ tiếng Tây Ban Nha ${when}`,
  dliLost: ({ when, lost }) => `Có song ngữ tiếng Tây Ban Nha năm 2022 nhưng không có ${when}: ${lost}`,
  dliWhenToday: 'hiện nay',
  dliWhenIn: ({ scenario }) => `trong ${scenario}`,
  dliPeriod: 'Thời gian',
  dliSchools: 'Số trường',
  dliWithin: 'Phần đất của PPS trong vòng 1 dặm',
  dliToday: 'Hiện nay (2025–26)',
  dliSqMi: ({ n }) => `${n} dặm vuông`,
  dliNote: 'Luật Oregon quy định học sinh tiểu học sống cách trường hơn 1 dặm được đi xe buýt trường. Vòng tròn dùng khoảng cách đường thẳng, nên quãng đường đi bộ thật dài hơn. Vòng tròn cho thấy địa điểm, không phải số học sinh. PPS không công bố nơi học sinh song ngữ sinh sống. Một ghi chú cũ của PPS nói xe buýt song ngữ ngoài khu vực của trường chỉ dành cho học sinh nói tiếng Tây Ban Nha là tiếng mẹ đẻ. Chương trình song ngữ tiếng Tây Ban Nha của Bridger đã chuyển sang Lent vào mùa thu 2023.',

  timelineTitle: 'Bước tiếp theo',
  timeline1: ['Ngày 6 tháng 10 năm 2026:', 'PPS trình bày các phương án cho Hội đồng Giáo dục.'],
  timeline2: ['Tháng 10–11:', 'Các gia đình và cộng đồng góp ý.'],
  timeline3: ['Giữa tháng 11:', 'Tổng Giám đốc Học khu chọn một kế hoạch để đề nghị.'],
  timeline4: ['Tháng 12:', 'Hội đồng Giáo dục biểu quyết trong một buổi họp công khai.'],
  timeline5: ['Mùa thu 2027:', 'Các thay đổi bắt đầu trong năm học 2027–28.'],
  timelineNote: 'Đây là kế hoạch, chưa phải quyết định. PPS vẫn đang lên kế hoạch về xe buýt, nhân viên và hỗ trợ cho học sinh phải đổi trường.',
  feedbackTitle: 'Cho PPS biết ý kiến của quý vị',
  feedbackEmail: 'Gửi email đến',
  feedbackRsvp: 'Đăng ký dự một buổi họp cộng đồng',
  feedbackFaq: 'Câu hỏi thường gặp của PPS về Rightsizing (kế hoạch điều chỉnh số trường)',
  feedbackFaqNote: '(có mẫu để gửi câu hỏi)',

  clusterTitle: 'Khu vực trường trung học phổ thông (high school)',

  sourcesTitle: 'Nguồn tài liệu',
  sourceBoard: 'Tài liệu của Hội đồng Giáo dục PPS (mục 8; tiếng Anh)',
  sourceMap: ({ scenario, band }) => `Bản đồ ${band} – ${scenario} (PDF, tiếng Anh)`,
  sourcePpsdataBy: 'của Alex Meub',
  sourcePpsdataRest: 'Dự án này giúp chúng tôi tìm các tài liệu của Hội đồng Giáo dục và dữ liệu ranh giới của Thành phố Portland để kiểm tra các bản đồ này.',
  method: 'Chúng tôi vẽ lại ranh giới từ các bản đồ phương án của PPS (PDF). Chúng tôi đặt chúng đúng vị trí bằng tọa độ có sẵn trong các tệp PDF đó, nên các đường sai lệch chỉ vài mét. Các thay đổi trường học lấy từ bản ghi nhớ của PPS ngày 6 tháng 10 năm 2026. Khu vực hiện nay khớp với dữ liệu của Thành phố Portland ở 98% học khu. Nếu quý vị sống gần đường ranh giới, xin vui lòng hỏi lại PPS. Chỗ học theo bốc thăm và chương trình song ngữ được xếp theo cách khác.',
  privacy: 'Khi quý vị tìm một địa chỉ, trình duyệt gửi địa chỉ đó đến Esri để tìm trên bản đồ. Trang này không lưu địa chỉ.',
  notAffiliated: 'Trang này không thuộc PPS.',

  mapCluster: ({ name }) => `Cụm trường ${name}`,
  mapSplit: ({ parts, last }) => `Trung học phổ thông: ${parts} hoặc ${last}, tùy theo địa chỉ`,
  mapOfArea: 'diện tích',
  mapSqMi: ({ n }) => `${n} dặm vuông`,
  arrowClosure: ({ from, to, detail }) => `${from} đóng cửa. Học sinh chuyển đến ${to}.${detail ? ' ' + detail : ''}`,
  arrowProgram: ({ program, from, to }) => `${program}: ${from} → ${to}`,

  closeSelf: ({ school, to, detail }) => `${school} đóng cửa${to ? `. Học sinh chuyển đến ${to}` : ''}.${detail ? ' ' + detail : ''}`,
  closeReceives: ({ school, detail }) => `Nhận học sinh từ ${school}, trường này đóng cửa.${detail ? ' ' + detail : ''}`,
  programHere: ({ program, from, detail }) => `Chương trình ${program} chuyển đến đây từ ${from}.${detail ? ' ' + detail : ''}`,
  programIts: ({ program, to, others, detail }) => `Chương trình ${program} của trường chuyển đến ${to}${others ? `, cùng với chương trình của ${others}` : ''}.${detail ? ' ' + detail : ''}`,
  programMove: ({ program, from, to, detail }) => `Chương trình ${program} chuyển từ ${from} đến ${to}.${detail ? ' ' + detail : ''}`,
  gradesReceives: ({ school }) => `Nhận lớp 6–8 từ ${school}. ${school} chỉ còn K–5.`,
  gradesSelf: ({ school, to }) => `${school} chỉ còn K–5. Lớp 6–8 chuyển đến ${to}.`,
  noteUnclear: ({ before, after, scenario }) =>
    `${before} không đóng cửa. Trên bản đồ ${scenario} của PPS, ${before} và ${after} nằm trong cùng một ranh giới. PPS chưa nói trường nào sẽ phụ trách khu vực hiện nay của ${before}. Xin vui lòng hỏi PPS qua Rightsizing@pps.net.`,
  noteNoArea: ({ before, after, scenario, as }) =>
    `${before} không đóng cửa. Trường vẫn mở${as}. Trên bản đồ ${scenario}, trường không có khu vực khu phố riêng, nên nơi này thuộc ${after}.`,
  noteNoAreaAs: ({ langs }) => ` như một trường song ngữ ${langs}`,
}

const memo = {
  'About 70% of its area goes to Hayhurst and 30% to Rieke.': 'Khoảng 70% khu vực của trường chuyển sang Hayhurst và 30% sang Rieke.',
  'The Maplewood middle school area moves from Jackson to Robert Gray.': 'Khu vực trung học cơ sở (middle school) của Maplewood chuyển từ Jackson sang Robert Gray.',
  'Skyline students will go to Roosevelt for high school, not Lincoln. Skyline stays K–8.': 'Học sinh Skyline sẽ học trung học phổ thông ở Roosevelt, không phải Lincoln. Skyline vẫn là K–8.',
  'Bridlemile keeps the same middle and high schools.': 'Bridlemile giữ nguyên các trường trung học cơ sở và trung học phổ thông.',
  'MLC becomes K–8. Its 9–12 program closes. Those students go to their neighborhood high school.': 'MLC trở thành K–8. Chương trình lớp 9–12 đóng cửa. Những học sinh đó sẽ học trường trung học phổ thông khu phố của mình.',
  'The East Sylvan building will be empty.': 'Tòa nhà East Sylvan sẽ bỏ trống.',
  'Irvington’s K–5 students go to Beverly Cleary. Its middle school area goes to Beaumont.': 'Học sinh K–5 của Irvington chuyển đến Beverly Cleary. Khu vực trung học cơ sở của trường chuyển sang Beaumont.',
  'About half of its area goes to each school.': 'Khoảng một nửa khu vực của trường chuyển sang mỗi trường.',
  'Neighborhood K–5 students go to Atkinson.': 'Học sinh K–5 trong khu phố chuyển đến Atkinson.',
  'The Llewellyn area goes to Hosford. The Duniway and Lewis areas go to Brentwood.': 'Khu vực Llewellyn chuyển sang Hosford. Khu vực Duniway và Lewis chuyển sang Brentwood.',
  'Sunnyside’s special environmental program ends. It becomes a neighborhood school. It takes no new lottery students. Current lottery students can stay through 5th grade.': 'Chương trình môi trường đặc biệt của Sunnyside kết thúc. Trường trở thành trường khu phố. Trường không nhận học sinh mới qua bốc thăm. Học sinh bốc thăm hiện tại có thể học đến hết lớp 5.',
  'Neighborhood K–5 students go to Chief Joseph.': 'Học sinh K–5 trong khu phố chuyển đến Chief Joseph.',
  'Neighborhood K–5 students go to Sitton.': 'Học sinh K–5 trong khu phố chuyển đến Sitton.',
  'César Chávez becomes the main K–5 Spanish immersion school. Its K–5 students who are not in immersion go to Rosa Parks.': 'César Chávez trở thành trường song ngữ tiếng Tây Ban Nha chính cho K–5. Học sinh K–5 không học song ngữ chuyển đến Rosa Parks.',
  'About 70% of its area goes to Markham and 30% to Capitol Hill.': 'Khoảng 70% khu vực của trường chuyển sang Markham và 30% sang Capitol Hill.',
  'Neighborhood K–5 students go to Scott.': 'Học sinh K–5 trong khu phố chuyển đến Scott.',
  'Stephenson stays open with no changes. (It closes in Scenario A.)': 'Stephenson vẫn mở và không thay đổi. (Trường đóng cửa trong Phương án A.)',
  'Rose City Park stays open. It keeps its neighborhood area and Vietnamese immersion. (In Scenario A, both move.)': 'Rose City Park vẫn mở. Trường giữ khu vực khu phố và chương trình song ngữ tiếng Việt. (Trong Phương án A, cả hai đều chuyển đi.)',
  'Lewis stays open and gets part of Whitman’s area. (It closes in Scenario A.)': 'Lewis vẫn mở và nhận một phần khu vực của Whitman. (Trường đóng cửa trong Phương án A.)',
}

const programs = {
  'Spanish immersion': 'song ngữ tiếng Tây Ban Nha',
  'Spanish immersion (middle grades)': 'song ngữ tiếng Tây Ban Nha (trung học cơ sở)',
  'Chinese (Mandarin) immersion': 'song ngữ tiếng Hoa (Quan Thoại)',
  'Vietnamese immersion': 'song ngữ tiếng Việt',
  'Deaf and Hard of Hearing program': 'dành cho học sinh khiếm thính',
  'Odyssey (K–8 focus option)': 'Odyssey (chương trình đặc biệt K–8)',
}

export default {
  name: 'Tiếng Việt', locale: 'vi-VN', and: ' và ', sep: ', ', reviewed: false,
  strings: { ...strings, programTitle: ({ program }) => `Chương trình ${program}` },
  memo, programs, languages: LANGS,
  label: {
    middle: 'trung học cơ sở', high: 'trung học phổ thông', closed: 'trường đóng cửa', buildingClosed: 'tòa nhà đóng cửa',
    neighborhoodImmersion: 'khu phố và song ngữ', neighborhood: 'trường khu phố', focus: 'chương trình đặc biệt',
    immersion: (l) => `song ngữ ${LANGS[l] ?? l}`,
  },
}
