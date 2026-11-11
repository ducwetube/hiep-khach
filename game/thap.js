'use strict';
/* =================================================================
   HIỆP KHÁCH GIANG HỒ — TRẤN MA THÁP (tên cũ Thí Luyện Tháp, đổi 2026-11-07 theo cốt truyện; làm lại 2026-10-28, người dùng chốt)
   2026-11-07: tầng 5, 15 … 95 là boss, tầng chẵn chục tông sư, mọi tầng khác tinh anh (thapKind). Mã vẫn là thap / THAP.
   Tháp 100 tầng ở Dương Châu, mỗi tầng một cao thủ võ lâm (dựng như người thật: chỉ số theo cấp tầng, mang võ công,
   nội công, công pháp thật). Cấp cao thủ = số tầng.
   - Tầng 1–30 cao thủ hệ Âm, 31–60 hệ Dương, 61–90 hệ Thái Cực, 91–100 đủ cả ba hệ.
   - Tầng 10, 20 ... 100: cao thủ Kim Dung (THAP.masters), thắng lần đầu thì truyền tuyệt học:
     10/40/70 nội công, 20/50/80 võ công, 30/60/90 công pháp (Âm / Dương / Thái Cực), 100 khinh công.
   - Leo liên tục: mỗi lượt leo bắt đầu ngay sau mốc 10 tầng cao nhất đã qua (THAP.step), vào lượt thì hồi đầy,
     các tầng trong lượt KHÔNG hồi máu, được uống thuốc. Qua tầng chẵn chục là tới mốc nghỉ, lượt leo kết thúc.
     Thua thì lượt leo hỏng, lần sau leo lại từ sau mốc cũ, không mất gì (chỉ mất thuốc đã dùng).
   - Thắng tầng nào lần đầu thì được thưởng tầng đó.
   Tiến độ: P.thap = { best: tầng cao nhất từng qua, run: tầng đang leo tới (null = chưa leo), since, tries }.
   Mốc nghỉ = best làm tròn xuống bội số của THAP.step.
   File này nạp TRƯỚC engine.js; hàm dựng võ học (thapArm) chỉ chạy được khi có engine (normSkill, passiveStats).
   ================================================================= */

const THAP_ID = 'thap_huyen_anh'; // chỗ tạm trong ENEMIES cho cao thủ của tầng đang đánh

const THAP = {
  floors: 100,
  town: 'duong_chau', // tháp đứng ở đâu
  unlock: null,       // cờ mở tháp; null = mở từ đầu
  step: 10,           // mỗi bao nhiêu tầng một mốc nghỉ (lượt leo)
  lv: f => f,         // cấp cao thủ ở tầng f
  // Hệ theo đoạn tầng; từ tầng 91 xoay vòng ba hệ
  elemOf: f => (f <= 30 ? 'am' : f <= 60 ? 'duong' : f <= 90 ? 'thaicuc' : ['am', 'duong', 'thaicuc'][f % 3]),
  // Môn phái của cao thủ thường theo hệ (để mượn hình chibi và võ bản môn cùng hệ)
  sectsOf: { am: ['nga_mi', 'cai_bang'], duong: ['thieu_lam'], thaicuc: ['vo_dang'] },
  // Hình cao thủ tầng thường theo hệ (ảnh chibi Gemini của người dùng 2026-11-09, game/img/quai/tm_*.png, khai báo ENEMY_IMG);
  // để trống thì về hình chibi môn phái như cũ
  // Tầng tinh anh từ auraFrom trở lên: hình có hào quang (không theo hệ), bốc bằng (tầng × 7) % số hình
  auraFrom: 11, // không còn dùng: hào quang tự phủ các tầng tinh anh cao nhất theo số hình có
  auraImgs: ['tm_kim_tang_phat', 'tm_kim_phi', 'tm_bich_kiem', 'tm_hac_kiem_ton', 'tm_kim_bao_quyen', 'tm_tu_phat_kiem',
    'tm_kim_lao_truong', 'tm_kim_quan_kiem', 'tm_phi_tieu_lao', 'tm_mu_nu', 'tm_phong_diep_nu', 'tm_tu_nguyet',
    'tm_lam_kiem_khach', 'tm_kim_lao_tien', 'tm_tu_kiem_quan', 'tm_truc_nu', 'tm_hac_nu', 'tm_bang_kiem',
    'tm_ho_lo_kiem', 'tm_xa_truong_lao', 'tm_kim_phat_tieu', 'tm_bang_nu', 'tm_bach_kiem_tien', 'tm_tu_lao_ma',
    'tm_tu_sa_nu', 'tm_luc_bao_phap', 'tm_hoa_hac_lao', 'tm_kim_su_vuong', 'tm_tu_y_tien', 'tm_phien_cong_tu',
    'tm_mai_xich_nu', 'tm_hong_kiem_nu', 'tm_ngu_quan', 'tm_dang_nu', 'tm_truc_thieu_hiep', 'tm_tieu_tang',
    'tm_bang_dao_khach', 'tm_xich_lien_lao', 'tm_huyet_nhan_kiem', 'tm_bach_kim_kiem', 'tm_lam_y_thieu_niem', 'tm_tieu_lao_tien',
    'tm_hong_bao_lao_tang', 'tm_truc_truong_lao', 'tm_kim_cuu_bao', 'tm_hoang_y_kiem_nu', 'tm_bich_phien_khach', 'tm_hoang_bao_phu_nhan',
    'tm_luan_tang', 'tm_lam_phat_kiem', 'tm_hong_quyen_tang', 'tm_bang_giap_kiem', 'tm_hoa_kiem_thieu', 'tm_hoa_dao_lao',
    'tm_hoa_rau_quyen', 'tm_tu_y_ma_nu', 'tm_lam_bao_phap', 'tm_kim_phien_khach', 'tm_hong_quan_nu', 'tm_bang_lao_tien',
    'tm_choi_lao_tang', 'tm_bach_lien_nu', 'tm_hoa_quyen_thieu', 'tm_hoa_long_dao', 'tm_kim_phat_bang_kiem', 'tm_hong_khan_kiem',
    'tm_lien_hoa_nu', 'tm_thai_cuc_dao_quan', 'tm_hong_cau_lao', 'tm_lam_phien_dai_han', 'tm_kim_hoan_khach', 'tm_bach_y_phi_kiem',
    'tm_tien_ong_lam', 'tm_hac_long_khach', 'tm_tu_ung_kiem', 'tm_luc_su_kiem', 'tm_hong_kim_quyen'],
  // Trấn Tháp Sứ (tầng 5, 15 … 95): hình có hào quang, bốc theo hệ bằng (tầng ÷ 10)
  bossImgs: { am: ['tm_nu_non', 'tm_mat_na_bac', 'tm_nu_song_kiem', 'tm_lao_kinh'], duong: ['tm_hoa_dao', 'tm_xich_phat', 'tm_hac_rau', 'tm_xoa_khach'],
    thaicuc: ['tm_thanh_kiem', 'tm_lam_bao', 'tm_lam_rau', 'tm_bach_y_rau'] },
  imgs: { am: ['tm_dao_si', 'tm_nu_lam', 'tm_nu_hong', 'tm_nu_dao', 'tm_an_si', 'tm_dao_khach', 'tm_song_dao', 'tm_nu_kiem_lam', 'tm_nu_mat_na', 'tm_gay_khach', 'tm_nu_do',
      'tm_nu_sa', 'tm_nu_lua', 'tm_nu_nhen', 'tm_nu_hong_y', 'tm_yeu_khach', 'tm_lao_kinh'],
    duong: ['tm_tang_tre', 'tm_lao_tang', 'tm_lao_chuy', 'tm_hong_bao', 'tm_kim_tang', 'tm_hoa_thuong_rau', 'tm_thieu_hiep_vang',
      'tm_lao_tang_rau', 'tm_cuong_kiem', 'tm_xich_mau', 'tm_ngan_phat', 'tm_hac_rau'],
    thaicuc: ['tm_lao_kiem', 'tm_kiem_khach', 'tm_dao_si', 'tm_an_si', 'tm_nu_dao', 'tm_lao_dao_quan', 'tm_kiem_tim', 'tm_kiem_den', 'tm_nu_tim',
      'tm_dao_thai_cuc', 'tm_lao_dao_si', 'tm_hac_bao', 'tm_lao_tieu', 'tm_cam_su'] },
  // Sức mạnh theo loại tầng, nhân lên chỉ số quái ngoài đồng cùng cấp (TG.mob trong the_gioi.js)
  kinds: {
    normal: { hp: 3, atk: 1.6, def: 1.5, spd: 1.2, crit: 0 },
    elite: { hp: 5, atk: 1.8, def: 1.6, spd: 1.3, crit: 5 },
    boss: { hp: 9, atk: 2.1, def: 1.8, spd: 1.6, crit: 10 },
  },
  // Càng lên cao cao thủ càng mạnh hơn quái ngoài đồng cùng cấp: khí huyết, công, thủ nhân thêm (1 + tầng / growDiv)
  // (người chơi lên cao mạnh nhanh hơn quái nhờ trang bị, võ tầng cao; tầng 100 ×1,5)
  growDiv: 200,
  // Thắng tầng f lần đầu: mọi võ học đang mang + f × profPerFloor thành thạo
  profPerFloor: 1,
  // Thưởng lần đầu vượt tầng f (người dùng chốt 2026-11-07): kinh nghiệm / bạc = quái thường cấp f × (hệ số × f)
  // vd. tinh anh tầng 2 = 20 con quái cấp 2, boss tầng 5 = 100 con quái cấp 5; tông sư tính như boss
  reward: { normal: { exp: 10, gold: 10 }, elite: { exp: 10, gold: 10 }, boss: { exp: 20, gold: 20 } },
  // Cuồng nộ: cao thủ đã ra tay quá "after" lượt thì mỗi lượt sau sức công +atk% (cộng dồn), để trận không kéo dài mãi
  enrage: { after: 30, atk: 4 },
  // Người dùng chốt 2026-11-07: tông sư KHÔNG còn truyền tuyệt học (teach giữ lại trong dữ liệu, chỉ để biết họ mang võ gì; bật lại = true)
  teachOn: false,
  // Cao thủ giữ tầng chẵn chục. teach = môn truyền lại khi thắng lần đầu (chỉ khi teachOn).
  // Hình: icon (hình chibi quái có sẵn) hoặc avatar (hình chibi môn phái). Võ học mang: vocong / noicong / congphap / khinhcong
  // (được dùng cả môn đã bỏ khỏi tay người chơi); move = chiêu riêng không có trong SKILLS.
  masters: {
    10: { name: 'Âu Dương Phong', hieu: 'Tây Độc', icon: 'tm_hac_lao', teach: 'chu_cap_cong', noicong: 'chu_cap_cong', vocong: ['ngu_doc_chuong'],
      quote: 'Cóc ngồi ba năm mới bật, một khi bật thì không ai đỡ nổi.' },
    20: { name: 'Thiên Sơn Đồng Lão', hieu: 'Linh Thứu Cung chủ', icon: 'tm_nu_lam', teach: 'chiet_mai_thu', noicong: 'bang_tam_quyet', vocong: ['chiet_mai_thu', 'han_bang_chuong'],
      quote: 'Thân hình đứa trẻ, công lực chín mươi năm. Đừng để vẻ ngoài lừa ngươi.' },
    30: { name: 'Mai Siêu Phong', hieu: 'Thiết Thi', icon: 'tm_nu_quy', teach: 'di_hon_dai_phap', noicong: 'cuu_am_chan_kinh', congphap: 'di_hon_dai_phap', vocong: ['han_bang_chuong'],
      quote: 'Nhìn vào mắt ta... ngươi sẽ quên mình đang đánh với ai.' },
    40: { name: 'Kim Luân Pháp Vương', hieu: 'Mông Cổ quốc sư', icon: 'tm_lao_tang', teach: 'long_tuong_cong', noicong: 'long_tuong_cong', vocong: ['phong_sa_dao'],
      quote: 'Long Tượng Bát Nhã Công tầng thứ mười, mỗi chưởng mang sức mười rồng mười voi.' },
    50: { name: 'Kiều Phong', hieu: 'Bắc Kiều Phong', icon: 'tm_cuong_khach', teach: 'hang_long', noicong: 'long_tuong_cong', vocong: ['hang_long', 'khang_long'],
      quote: 'Đại trượng phu đánh nhau thì đánh cho đường hoàng. Đỡ chưởng!' },
    60: { name: 'Trương Vô Kỵ', hieu: 'Minh Giáo giáo chủ', icon: 'tm_bach_bao', teach: 'can_khon_dai_na_di', noicong: 'cuu_duong_than_cong', congphap: 'can_khon_dai_na_di', vocong: ['hoa_son_kiem_phap'],
      quote: 'Ta không muốn đả thương ai. Nhưng đòn của ngươi, ta trả lại nguyên vẹn.' },
    70: { name: 'Hư Trúc', hieu: 'Tiêu Dao phái chưởng môn', icon: 'tm_tang_tre', teach: 'bac_minh_than_cong', noicong: 'bac_minh_than_cong', vocong: ['chiet_mai_thu', 'thien_son_luc_duong'],
      quote: 'A di đà Phật, tiểu tăng xin đắc tội.' },
    80: { name: 'Phong Thanh Dương', hieu: 'Hoa Sơn ẩn sĩ', icon: 'tm_lao_kiem', teach: 'doc_co_cuu_kiem', noicong: 'thuan_duong', vocong: ['doc_co_cuu_kiem'],
      quote: 'Vô chiêu thắng hữu chiêu. Ngươi có chiêu, nên ngươi thua.' },
    90: { name: 'Mộ Dung Phục', hieu: 'Nam Mộ Dung', icon: 'tm_ngan_kiem', teach: 'dau_chuyen_tinh_di', noicong: 'thuan_duong', congphap: 'dau_chuyen_tinh_di', vocong: ['phong_lang_kiem'],
      quote: 'Dĩ bỉ chi đạo, hoàn thi bỉ thân. Chiêu của ngươi, sẽ giết chính ngươi.' },
    100: { name: 'Đoàn Dự', hieu: 'Đại Lý thế tử', icon: 'tm_vuong_gia', teach: 'lang_ba_vi_bo', noicong: 'bac_minh_than_cong', khinhcong: 'lang_ba_vi_bo', vocong: [],
      move: { name: 'Lục Mạch Thần Kiếm', type: 'attack', power: 0.55, hits: 6, chance: 45, mp: 0, fx: { kind: 'cuu_kiem', color: '#d8f0ff' } },
      quote: 'Ta vốn không thích đánh nhau... nhưng lục mạch thần kiếm lúc linh lúc không, ngươi cẩn thận.' },
  },
  // Thưởng thêm khi qua tầng chẵn chục lần đầu: người dùng bỏ thuốc 2026-11-07 (bảng cũ giữ ở milestonesOld, không dùng)
  milestones: {},
  milestonesOld: {
    10: { items: { kim_sang_duoc: 5, hoi_khi_dan: 5 } }, 20: { items: { kim_sang_duoc: 8, bo_khi_dan: 5 } },
    30: { items: { dai_hoan_dan: 5, tuyet_lien: 5 } }, 40: { items: { dai_hoan_dan: 8, tuyet_lien: 8 } },
    50: { items: { cuu_chuyen_hoan: 5, tu_kim_linh_dich: 5 } }, 60: { items: { cuu_chuyen_hoan: 8, tu_kim_linh_dich: 8 } },
    70: { items: { thien_huong_cao: 5, bich_ngoc_lo: 5 } }, 80: { items: { thien_huong_cao: 8, bich_ngoc_lo: 8 } },
    90: { items: { thien_huong_cao: 10, bich_ngoc_lo: 10 } }, 100: { items: { thien_huong_cao: 15, bich_ngoc_lo: 15 } },
  },
  // Tên cao thủ vô danh ở các tầng thường, ghép theo số tầng
  names: {
    ho: ['Lãnh', 'Mạc', 'Tiêu', 'Hàn', 'Lục', 'Âu', 'Tư Mã', 'Hoa', 'Đoạn', 'Thượng Quan', 'Nam Cung', 'Liễu', 'Phương', 'Tạ', 'Công Tôn', 'Diệp'],
    ten: ['Vô Ảnh', 'Thanh Phong', 'Nhất Kiếm', 'Cô Vân', 'Hàn Sơn', 'Lăng Tiêu', 'Bạch Y', 'Thiết Thủ', 'Phi Hồng', 'Tàn Nguyệt', 'Kinh Lôi', 'Lưu Thủy', 'Tử Điện'],
    hieu: { normal: 'Cao thủ', elite: 'Tinh anh', boss: 'Trấn Tháp Sứ' }, // boss tầng 5, 15 … 95
  },
  // Danh vị trên Trấn Ma Bảng theo tầng cao nhất
  ranks: [[100, 'Tháp Chủ'], [90, 'Đại Tông Sư'], [70, 'Tông Sư'], [50, 'Cao Thủ'], [30, 'Hảo Thủ'], [10, 'Tiểu Thành'], [0, 'Sơ Nhập']],
  // Cao thủ giang hồ trên Trấn Ma Bảng: floor = tầng lúc ngươi mới tới tháp, grow = số tầng leo thêm mỗi ngày (tối đa tầng 99)
  rivals: [
    { name: 'Bạch Vân Phi', sect: 'vo_dang', floor: 92, grow: 0.1 },
    { name: 'Lãnh Nguyệt Hàn', sect: 'nga_mi', floor: 88, grow: 0.15 },
    { name: 'Pháp Không', sect: 'thieu_lam', floor: 84, grow: 0.15 },
    { name: 'Cổ Bát Đao', sect: 'cai_bang', floor: 80, grow: 0.2 },
    { name: 'Tô Thanh Liên', sect: 'nga_mi', floor: 70, grow: 0.25 },
    { name: 'Lục Trường Phong', sect: 'vo_dang', floor: 65, grow: 0.25 },
    { name: 'Mạc Tiểu Ngư', sect: 'cai_bang', floor: 60, grow: 0.3 },
    { name: 'Tịnh Trần', sect: 'thieu_lam', floor: 55, grow: 0.3 },
    { name: 'Kim Lão Tam', sect: 'cai_bang', floor: 45, grow: 0.35 },
    { name: 'Liễu Như Yên', sect: 'nga_mi', floor: 40, grow: 0.35 },
    { name: 'Trác Nhất Kiếm', sect: 'vo_dang', floor: 35, grow: 0.4 },
    { name: 'Viên Đại Lực', sect: 'thieu_lam', floor: 30, grow: 0.4 },
    { name: 'Ngô Lão Lục', sect: 'cai_bang', floor: 20, grow: 0.45 },
    { name: 'Hà Tiểu Muội', sect: 'nga_mi', floor: 15, grow: 0.45 },
    { name: 'Trịnh Thiết Ngưu', sect: 'thieu_lam', floor: 10, grow: 0.5 },
    { name: 'Lý Nhị Cẩu', sect: 'cai_bang', floor: 5, grow: 0.5 },
  ],
  intro: [
    'Ngọn tháp đá trăm tầng sừng sững bên sườn núi Thiên Tuyệt. Mỗi tầng có một cao thủ võ lâm trấn giữ, cứ năm tầng lại có một kẻ mạnh hơn hẳn; mười tầng chẵn chục là chỗ của những bậc tông sư lừng danh thiên hạ.',
    'Ai lên được tầng cao thì được khắc tên lên Trấn Ma Bảng trước cửa tháp.',
  ],
};

/* ---------------------------- Cao thủ của từng tầng ---------------------------- */
// Người dùng chốt 2026-11-07: cứ 5 tầng một boss (5, 10, 15 …; tầng chẵn chục là tông sư THAP.masters), các tầng còn lại là tinh anh
const thapKind = f => (THAP.masters[f] || f % 5 === 0 ? 'boss' : 'elite');
const THAP_KIND_NAMES = { normal: 'Cao thủ', elite: 'Tinh anh', boss: 'Trấn Tháp Sứ' };
const thapKindTag = f => (THAP.masters[f] ? `Tông sư · ${THAP.masters[f].hieu}` : THAP_KIND_NAMES[thapKind(f)]);
const thapCp = () => Math.floor((P.thap.best || 0) / THAP.step) * THAP.step; // mốc nghỉ: tầng chẵn chục cao nhất đã qua
// Môn phái (để mượn hình và võ bản môn) của cao thủ thường ở tầng f, cố định theo số tầng
const thapSect = f => { const l = THAP.sectsOf[THAP.elemOf(f)]; return l[(f * 7) % l.length]; };
function thapName(f) {
  const N = THAP.names, M = THAP.masters[f];
  // Người dùng chốt 2026-11-07: tên chỉ có họ tên (loại tầng Tinh anh / Trấn Tháp Sứ / Tông sư ghi ở dòng trên, không ghép vào tên)
  if (M) return M.name;
  return `${N.ho[(f * 5) % N.ho.length]} ${N.ten[(f * 3) % N.ten.length]}`;
}
// Chỉ số gốc (chưa gắn võ học): dùng được cả ở sổ tay (không cần engine)
function thapEnemy(f) {
  const kind = thapKind(f), lv = THAP.lv(f), M = THAP.masters[f], g = 1 + f / THAP.growDiv;
  const m0 = THAP.kinds[kind], m = Object.assign({}, m0, { hp: m0.hp * g, atk: m0.atk * g, def: m0.def * g });
  const Q = TG.mob, k = lv - 1, pct = Q.pct;
  const sect = M ? (M.avatar && M.avatar.sect) : thapSect(f);
  const title = M ? (M.avatar && M.avatar.title) : (f % 2 ? 'Thiếu hiệp' : 'Nữ hiệp');
  const bossP = !M && kind === 'boss' && THAP.bossImgs && (THAP.bossImgs[THAP.elemOf(f)] || []).filter(k => typeof ENEMY_ART !== 'undefined' && ENEMY_ART[k]);
  const own = new Set(Object.values(THAP.masters).map(m => m.icon)); // hình tông sư chỉ dùng cho tông sư
  const ok = k => typeof ENEMY_ART !== 'undefined' && ENEMY_ART[k] && !own.has(k);
  // Tầng tinh anh (80 tầng): các tầng CAO NHẤT dùng hình hào quang (mỗi hình một tầng), tầng thấp còn thiếu thì lấy hình thường
  // (THAP.imgs, bỏ trùng, theo thứ tự ghi). rank = số tầng tinh anh đứng trước tầng f. (auraFrom không còn dùng.)
  const isElite = g => !THAP.masters[g] && g % 5;
  let rank = 0, total = 0; for (let g = 1; g < THAP.floors; g++) if (isElite(g)) { if (g < f) rank++; total++; }
  const auraL = (THAP.auraImgs || []).filter(ok), cut = Math.max(0, total - auraL.length), hi = rank >= cut;
  const pool = M ? [] : hi ? auraL : [...new Set(Object.values(THAP.imgs || {}).flat())].filter(ok);
  const ai = hi ? rank - cut : rank;
  const pic = bossP && bossP.length ? bossP[Math.floor(f / 10) % bossP.length] : pool.length ? pool[ai % pool.length] : null;
  const icon = M && M.icon ? ((ENEMIES[M.icon] && ENEMIES[M.icon].icon) || M.icon) : pic || SECTS[sect].icon;
  const E = {
    name: thapName(f), icon, lv, boss: kind === 'boss', story: true, thap: kind, elem: THAP.elemOf(f),
    hp: Math.round((Q.hp[0] + Q.hp[1] * k) * m.hp), mp: Math.round((Q.mp[0] + Q.mp[1] * k) * (kind === 'normal' ? 1 : 3)),
    atk: Math.round((Q.atk[0] + Q.atk[1] * k) * m.atk), def: Math.round((Q.def[0] + Q.def[1] * k) * m.def),
    spd: Math.max(1, Math.round((Q.spd[0] + Q.spd[1] * k) * m.spd)),
    crit: pct + m.crit, dodge: pct, critDmg: 150, acc: Q.acc, critRes: pct,
    exp: 0, gold: 0, skills: [],
    intro: M ? `<b>${M.name}</b>: "${M.quote}"` : `Tầng ${f}: <b>${thapName(f)}</b> ôm quyền bước ra.`,
  };
  if (!(M && M.icon) && !pic) E.avatar = { sect, title };
  return E;
}
// Võ học mang theo của cao thủ tầng f: { vocong: [...], noicong, congphap, khinhcong, move }
function thapKit(f) {
  const M = THAP.masters[f];
  if (M) return M;
  const sect = thapSect(f), kind = thapKind(f), el = THAP.elemOf(f);
  // Phẩm chất võ bản môn theo tầng: tầng thấp nhập môn, giữa thượng thừa, cao tuyệt học
  const top = f < 20 ? 0 : f < 50 ? 1 : 2;
  const own = cat => Object.keys(SKILLS).filter(id => { const s = SKILLS[id]; return s.sect === sect && s.cat === cat && !s.story && GRADE_ORDER.indexOf(s.grade) <= top; })
    .sort((a, b) => GRADE_ORDER.indexOf(SKILLS[b].grade) - GRADE_ORDER.indexOf(SKILLS[a].grade));
  const vc = own('vocong'), noi = own('noicong').filter(id => SKILLS[id].elem === el), cp = own('congphap').filter(id => SKILLS[id].elem === el);
  return { vocong: vc.slice(0, kind === 'normal' ? 1 : 2), noicong: noi[0], congphap: cp[0] };
}
// Gắn võ học lên cao thủ (cần engine): nội công / khinh công cộng chỉ số như người chơi mang, võ công + công pháp thành chiêu
function thapArm(E, f) {
  const kit = thapKit(f), kl = Math.max(1, Math.min(MAX_SKILL_LV, Math.ceil(f / 10) + (E.boss ? 1 : 0)));
  const passive = [kit.noicong, kit.khinhcong].filter(Boolean);
  passive.forEach(id => {
    const add = passiveStats(id, kl);
    ['hp', 'mp', 'atk', 'def', 'spd', 'crit', 'dodge', 'critDmg', 'acc', 'critRes', 'lifesteal'].forEach(k => { if (add[k]) E[k] = Math.round(E[k] + add[k]); });
    const t = tierFx(id, kl);
    [['atkPct', 'atk'], ['defPct', 'def'], ['spdPct', 'spd']].forEach(([x, k]) => { if (t[x]) E[k] = Math.round(E[k] * (1 + t[x] / 100)); });
  });
  if (kit.noicong && SKILLS[kit.noicong].elem) E.elem = SKILLS[kit.noicong].elem;
  const skills = [];
  if (kit.congphap) skills.push(Object.assign(normSkill(kit.congphap, kl, E.lv), { cycle: 3 }));
  if (kit.move) skills.push(Object.assign({}, kit.move));
  (kit.vocong || []).forEach(id => skills.push(Object.assign(normSkill(id, kl, E.lv), { chance: 45 })));
  // Đòn cơ bản (không tốn nội lực) cùng hệ, khi không ra chiêu nào khác
  const basic = typeof tgPho === 'function' ? tgPho('vocong', E.elem) : null;
  if (basic) skills.push(Object.assign(normSkill(basic, kl, E.lv), { basic: true }));
  E.skills = skills;
  E.arts = [...(kit.vocong || []), kit.noicong, kit.congphap, kit.khinhcong].filter(Boolean);
  E.artLv = kl;
  return E;
}
/* Điều kiện truyền võ (người dùng chốt 2026-10-28, "cách B"): leo và đánh tông sư bình thường, nhưng tông sư chỉ truyền võ
   khi ngươi đã luyện một môn KHÁC cùng loại, cùng hệ tới tầng 10 (khinh công: một khinh công của 4 phái tầng 10).
   Thắng mà chưa đủ thì chỉ nhận kinh nghiệm, bạc, thuốc; đủ rồi thì quay lại "Thỉnh giáo" (đánh lại riêng tông sư đó). */
const THAP_REQ_LV = 10;
const THAP_REQ_SECTS = ['thieu_lam', 'vo_dang', 'nga_mi', 'cai_bang'];
function thapReqText(f) {
  const sk = SKILLS[THAP.masters[f].teach];
  return sk.elem ? `một ${SKILL_CATS[sk.cat].toLowerCase()} hệ ${SKILL_ELEMS[sk.elem]} khác đạt tầng ${THAP_REQ_LV}` : `một ${SKILL_CATS[sk.cat].toLowerCase()} của môn phái đạt tầng ${THAP_REQ_LV}`;
}
function thapReqMet(f) {
  const teach = THAP.masters[f].teach, sk = SKILLS[teach];
  return Object.keys(P.skills).some(id => {
    const s = SKILLS[id];
    // môn 100 tầng (maxLv) phải đại thành mới tính
    return id !== teach && s && s.cat === sk.cat && P.skills[id].lv >= (s.maxLv || THAP_REQ_LV) && (sk.elem ? s.elem === sk.elem : THAP_REQ_SECTS.includes(s.sect));
  });
}
// Tông sư tầng f có truyền võ cho ngươi lúc này không
const thapCanTeach = f => { const M = THAP.masters[f]; return !!(THAP.teachOn && M && M.teach && !P.skills[M.teach] && thapReqMet(f)); };
// Thưởng lần đầu vượt tầng f (teach: kèm môn võ nếu đủ điều kiện; sổ tay gọi không có P nên luôn ghi môn võ)
function thapReward(f, teach) {
  const r = THAP.reward[thapKind(f)], lv = THAP.lv(f), M = THAP.masters[f];
  const out = Object.assign({ exp: Math.round(TG.mob.exp(lv) * r.exp * f), gold: Math.round(TG.mob.gold(lv) * r.gold * f) }, THAP.milestones[f] || {});
  if (THAP.teachOn && M && M.teach && teach !== false) out.skills = [M.teach];
  return out;
}
function thapRewardText(f) {
  const r = thapReward(f), parts = [`[[kinh_nghiem]] ${r.exp} kinh nghiệm`, `[[bac]] ${r.gold} lượng`];
  (r.skills || []).forEach(id => parts.push(`[[vo_hoc]] <b>${SKILLS[id].name}</b> (${SKILL_CATS[SKILLS[id].cat]}${SKILLS[id].elem ? ' ' + SKILL_ELEMS[SKILLS[id].elem] : ''})`));
  for (const [it, n] of Object.entries(r.items || {})) parts.push(`[[${ITEMS[it].icon}]] ${ITEMS[it].name} x${n}`);
  return parts.join(' · ');
}
const thapRank = floor => THAP.ranks.find(([n]) => floor >= n)[1];

/* ---------------------------- Trấn Ma Bảng ---------------------------- */
function thapRivalFloor(rv) {
  const days = P.thap.since ? Math.max(0, (Date.now() - P.thap.since) / 86400000) : 0;
  return Math.min(THAP.floors - 1, rv.floor + Math.floor(days * rv.grow));
}
function thapBoard() {
  const list = THAP.rivals.map(rv => ({ name: rv.name, sect: rv.sect, floor: thapRivalFloor(rv) }));
  list.push({ name: P.name, sect: P.sect, floor: P.thap.best, me: true });
  return list.sort((a, b) => b.floor - a.floor || (b.me ? 1 : 0) - (a.me ? 1 : 0));
}
const thapMyRank = () => thapBoard().findIndex(x => x.me) + 1;

/* ---------------------------- Màn hình tháp ---------------------------- */
const thapOpen = () => !!P && P.loc === THAP.town && (!THAP.unlock || !!P.flags[THAP.unlock]);
// Các tầng có thể bắt đầu một lượt leo: 1, 11, 21 ... tới ngay sau mốc nghỉ (leo lại tầng thấp để cày thành thạo)
const thapStarts = () => { const out = []; for (let s = 1; s <= Math.min(thapCp() + 1, THAP.floors); s += THAP.step) out.push(s); return out; };
// P.thap.start: tầng bắt đầu đã chọn (null = ngay sau mốc nghỉ cao nhất)
// Người dùng bỏ chọn tầng bắt đầu 2026-11-07 (leo lại không còn thưởng): luôn leo tiếp sau mốc nghỉ, P.thap.start cũ bị bỏ qua
const thapStartAt = () => Math.min(THAP.floors, thapCp() + 1);
// Hết tháp để leo (đã qua tầng 100 và không chọn leo lại tầng thấp)
const thapTop = () => !P.thap.run && thapCp() >= THAP.floors;
// Tầng sẽ đánh kế tiếp: đang leo thì tầng đang tới, không thì tầng bắt đầu đã chọn
const thapNext = () => Math.min(THAP.floors, P.thap.run || thapStartAt());
function thapButton() {
  if (!thapOpen()) return '';
  const run = P.thap.run;
  return `<button class="btn act boss" onclick="G.thap()">[[thap]] Trấn Ma Tháp<small>${run ? `Đang leo: tới tầng ${run}` : `Kỷ lục tầng ${P.thap.best} · hạng ${thapMyRank()}`}</small></button>`;
}
/* Màn tháp (người dùng chốt 2026-11-07): bảng nổi 3 tab giống Thí Luyện để khỏi dài — Leo Tháp / Trấn Ma Bảng / Quy Tắc */
let thapTab = 'leo', thapView = null; // thapView: tầng đang xem trước ở tab Leo Tháp (null = tầng sắp đánh)
function thapPeek(n) { thapView = n; thapScreen(); }
// Hình toàn thân cao thủ tầng f (hình môn phái hoặc hình quái)
function thapArt(E) {
  if (E.avatar) return playerAvatar(E.avatar.sect, E.avatar.title, 'body', 'normal') || ic(E.icon);
  return (typeof ENEMY_ART !== 'undefined' && ENEMY_ART[E.icon] && enemyArtSvg(E.icon, 'normal')) || ic(E.icon);
}
function thapScreen(tab) {
  combat = null;
  if (typeof tab === 'string') { thapTab = tab; thapView = null; }
  if (!P.thap.since) { P.thap.since = Date.now(); saveGame(true); }
  renderTop();
  if (!el('screen').querySelector('.world')) renderWorld();
  thapStyle();
  const best = P.thap.best, run = P.thap.run, f = thapNext(), top = thapTop();
  const tabs = [['leo', 'thap', 'Leo Tháp'], ['bxh', 'chien_thang', 'Trấn Ma Bảng'], ['luat', 'vo_hoc', 'Quy Tắc']]
    .map(([k, icn, n]) => `<button class="tm-tab${k === thapTab ? ' on' : ''}" onclick="G.thap('${k}')">[[${icn}]]<b>${n}</b></button>`).join('');
  let body;
  if (thapTab === 'bxh') {
    body = `<div class="tm-sum"><span>Hạng <b>${thapMyRank()}</b></span><span>Kỷ lục <b>tầng ${best}</b></span><span>Danh vị <b>${thapRank(best)}</b></span></div>`
      + `<div class="tm-board">${thapBoard().map((x, i) => `<div class="row-item thap-rank ${x.me ? 'running' : ''}">
      <div class="ri-icon">${x.me ? playerAvatar(P.sect, P.title, 'head') || ic(SECTS[P.sect].icon) : ic(SECTS[x.sect].icon)}</div>
      <div class="ri-main"><div class="ri-name"><span class="thap-no">${i + 1}</span> ${x.me ? `<b>${esc(x.name)}</b> (ngươi)` : x.name}${x.me ? '' : ` <span class="tag soft">${SECTS[x.sect].name}</span>`}</div>
        <div class="ri-desc">${thapRank(x.floor)}</div></div>
      <div class="ri-btns"><b>Tầng ${x.floor}</b></div>
    </div>`).join('')}</div>`;
  } else if (thapTab === 'luat') {
    body = `${THAP.intro.map(p => `<p class="tm-p">${p}</p>`).join('')}
      <p class="tm-p">Leo liên tục: mỗi lượt leo ${THAP.step} tầng, vào lượt thì hồi đầy, giữa các tầng <b>không hồi khí huyết, nội lực</b>; không thể bỏ chạy. Qua tầng chẵn chục là tới mốc nghỉ. Thua thì lần sau leo lại từ sau mốc nghỉ, không mất gì.</p>
      <p class="tm-p">Cứ 5 tầng một boss, tầng chẵn chục là tông sư, còn lại là tinh anh. Tầng 1–30 cao thủ hệ Âm, 31–60 hệ Dương, 61–90 hệ Thái Cực. Đánh quá ${THAP.enrage.after} lượt thì cao thủ cuồng nộ, mỗi lượt mạnh thêm.</p>
      <p class="tm-p">Thắng một tầng lần đầu được kinh nghiệm, bạc và thành thạo cho mọi võ học đang mang; leo lại tầng đã qua không có thưởng.</p>
      <h4>[[vo_hoc]] Tông sư giữ tháp</h4>${thapMiles(best, run)}`;
  } else body = thapLeoTab(best, run, f, top);
  openModal(`<h3 class="tl-title">Trấn Ma Tháp</h3><div class="tm-tabs">${tabs}</div>${body}`);
}
// Tab Leo Tháp: tiến độ mười tầng đang leo, cao thủ tầng kế, thưởng lần đầu, nút leo
function thapLeoTab(best, run, f, top) {
  const s = getStats();
  const head = `<div class="tm-sum"><span>Kỷ lục <b>tầng ${best}</b></span><span>Hạng <b>${thapMyRank()}</b></span><span>Mốc nghỉ <b>tầng ${thapCp()}</b></span></div>`;
  if (top) return head + `<p class="tm-p center"><b>Ngươi đã đứng trên đỉnh Trấn Ma Tháp.</b></p>`;
  const b0 = Math.floor((f - 1) / THAP.step) * THAP.step;
  // Xem trước tầng khác trong lượt (bấm ô tầng); mặc định là tầng sắp đánh
  const v = thapView && thapView > b0 && thapView <= b0 + THAP.step ? thapView : f;
  const cells = Array.from({ length: THAP.step }, (_, i) => { const n = b0 + i + 1, k = thapKind(n);
    return `<button class="tm-c${n <= best ? ' done' : ''}${n === f ? ' cur' : ''}${n === v ? ' view' : ''}${k === 'boss' ? ' boss' : ''}" onclick="G.thapPeek(${n})">${n}</button>`; }).join('');
  // Boss sắp gặp (tầng 5 / 10 kế tiếp): dòng xem nhanh, bấm để xem chi tiết
  const nb = Math.min(THAP.floors, Math.ceil(f / 5) * 5), BE = nb !== v ? thapEnemy(nb) : null;
  const bossRow = BE ? `<button class="tm-boss" onclick="G.thapPeek(${nb})"><span class="tm-bi">${(BE.avatar && playerAvatar(BE.avatar.sect, BE.avatar.title, 'head')) || ic(BE.icon)}</span>
      <span><em>Tầng ${nb} · ${thapKindTag(nb)}</em><b>${BE.name}</b></span><span class="tm-bgo">Xem ›</span></button>` : '';
  const fn = f; // tầng sẽ đánh thật
  f = v; // thẻ bên dưới hiện tầng đang xem
  const E = thapArm(thapEnemy(f), f), kind = thapKind(f); // chỉ số đã cộng nội công / khinh công như lúc vào trận
  const bar = (k, n, v) => `<div class="tm-bar ${k}"><em>${n} ${Math.round(v).toLocaleString('vi-VN')}</em></div>`;
  const r = thapReward(f), first = f > best;
  const rw = first ? `<div class="tm-rws"><span>[[kinh_nghiem]] ${r.exp.toLocaleString('vi-VN')}</span><span>[[bac]] ${r.gold.toLocaleString('vi-VN')}</span><span>[[vo_hoc]] +${f * THAP.profPerFloor} thành thạo</span><span>[[nhan_sam]] ${f % 5 ? KINH_MACH.thap : KINH_MACH.thapBoss} thảo dược</span></div>`
    : `<div class="tm-p muted">Đã qua tầng này, không còn thưởng.</div>`;
  return `${head}
    <div class="tm-cells">${cells}</div>
    <div class="tm-main">
      <div class="tl-fig tm-fig ${kind}">${thapArt(E)}</div>
      <div class="tm-info">
        <div class="tm-kind ${kind}">Tầng ${f} · ${thapKindTag(f)}</div>
        <div class="tl-name tm-name"${E.name.length > 14 ? ` style="font-size:${E.name.length > 18 ? 16 : 18}px"` : ''}>${E.name}</div>
        <div class="tm-tags"><span class="tag">Cấp ${E.lv}</span> <span class="tag elem-${E.elem}">${SKILL_ELEMS[E.elem]}</span></div>
        ${bar('hp', 'Khí huyết', E.hp)}${bar('mp', 'Nội lực', enMp(E))}
        <div class="tm-st3"><span>[[tan_cong]] ${E.atk}</span><span>[[thu_the]] ${E.def}</span><span>[[toc_do]] ${E.spd}</span></div>
        ${run ? `<div class="tm-st">Ngươi: khí huyết ${P.hp}/${s.hp} · nội lực ${P.mp}/${s.mp}</div>` : ''}
      </div>
    </div>
    ${bossRow}
    ${first ? '<div class="tm-lb">Thưởng lần đầu</div>' : ''}${rw}
    <div class="row-btns">
      ${run ? '<button class="btn" onclick="G.thapQuit()">Dừng lượt leo</button>' : ''}
      ${typeof autoThap === 'function' ? '<button class="btn" onclick="G.autoThap()">[[tu_dong]] Tự động</button>' : ''}
      <button class="btn primary" onclick="G.thapFight()">${run ? 'Đánh tiếp' : 'Bắt đầu leo'} tầng ${fn}</button>
    </div>`;
}
function thapMiles(best, run) {
  return !THAP.teachOn
    ? Object.keys(THAP.masters).map(Number).map(m => { const M = THAP.masters[m];
      return `<div class="ri-tier ${best >= m ? 'on' : ''}">${best >= m ? '✦' : '·'} Tầng ${m} · <b>${M.hieu} ${M.name}</b></div>`; }).join('')
    : Object.keys(THAP.masters).map(Number).map(m => { const M = THAP.masters[m], sk = SKILLS[M.teach], on = best >= m, learned = !!P.skills[M.teach], ok = thapReqMet(m);
    const state = learned ? ' · <b>đã học</b>' : ok ? ' · <b>đủ điều kiện</b>' : '';
    const ask = !learned && on && ok && !run ? ` <button class="btn small primary" onclick="G.thapAsk(${m})">Thỉnh giáo</button>` : '';
    return `<div class="ri-tier ${learned ? 'on' : ''}">${learned ? '✦' : '·'} Tầng ${m} · <b>${M.hieu} ${M.name}</b> truyền <b>${sk.name}</b> (${SKILL_CATS[sk.cat]}${sk.elem ? ' · ' + SKILL_ELEMS[sk.elem] : ''})${state}${ask}
      ${learned ? '' : `<div class="muted">Điều kiện: ${thapReqText(m)}.</div>`}</div>`; }).join('');
}
function thapStyle() {
  if (typeof tlStyle === 'function') tlStyle(); // dùng chung .tl-fig, .tl-name, .tl-title của Thí Luyện
  if (document.getElementById('tm-style')) return;
  const st = document.createElement('style');
  st.id = 'tm-style';
  st.textContent = `
    .tm-tabs { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; margin-bottom: 10px; }
    .tm-tab { display: flex; flex-direction: column; align-items: center; gap: 2px; padding: 7px 4px; border-radius: 10px; cursor: pointer; font: inherit; font-size: 22px;
      color: var(--ink); background: rgba(255,255,255,.04); border: 1px solid rgba(201,162,92,.3); }
    .tm-tab svg { width: 24px; height: 24px; }
    .tm-tab b { font-size: 12.5px; line-height: 1.2; }
    .tm-tab.on { border-color: #ffcf5a; background: rgba(201,162,92,.18); box-shadow: 0 0 10px rgba(255,190,70,.35); }
    .tm-sum { display: flex; flex-wrap: wrap; justify-content: center; gap: 6px 14px; margin-bottom: 10px; font-size: 12.5px; color: var(--muted); }
    .tm-sum b { color: #ffe0a0; }
    .tm-cells { display: grid; grid-template-columns: repeat(10, 1fr); gap: 4px; margin-bottom: 10px; }
    .tm-c { font-style: normal; text-align: center; font-size: 11px; padding: 5px 0; border-radius: 6px; color: var(--muted);
      background: rgba(255,255,255,.04); border: 1px solid rgba(201,162,92,.22); }
    .tm-c.boss { border-color: rgba(214,80,64,.75); color: #ffb3a6; }
    .tm-c.done { background: rgba(201,162,92,.35); color: #2a1d10; font-weight: bold; }
    .tm-c { font: inherit; font-size: 11px; cursor: pointer; }
    .tm-c.cur { border-color: #ffcf5a; color: #fff4dc; box-shadow: 0 0 8px rgba(255,190,70,.6); }
    .tm-c.view:not(.cur) { outline: 2px solid #8fc3ff; outline-offset: 1px; }
    .tm-peek { color: #8fc3ff; font-size: 11px; }
    .tm-boss { display: flex; align-items: center; gap: 10px; width: 100%; margin-top: 10px; padding: 6px 10px; border-radius: 10px; cursor: pointer; font: inherit; text-align: left;
      color: var(--ink); background: rgba(179,54,43,.16); border: 1px solid rgba(214,80,64,.55); }
    .tm-bi { width: 38px; height: 38px; flex: none; border-radius: 50%; overflow: hidden; display: grid; place-items: center; font-size: 32px; background: rgba(0,0,0,.3); border: 2px solid #c9473a; }
    .tm-bi svg { width: 100%; height: 100%; }
    .tm-boss em { display: block; font-style: normal; font-size: 11px; color: #ff9a8a; }
    .tm-boss b { font-size: 14px; color: #fff4dc; }
    .tm-bgo { margin-left: auto; font-size: 12.5px; color: #ffb3a6; white-space: nowrap; }
    .tm-main { display: grid; grid-template-columns: 38% 1fr; gap: 12px; align-items: start; }
    .tm-fig svg, .tm-fig img { width: 100%; height: 100%; }
    .tm-fig.boss { border-color: rgba(214,80,64,.7); background: radial-gradient(ellipse at 50% 85%, rgba(214,80,64,.3), transparent 60%), rgba(255,255,255,.04); }
    .tm-kind { font-size: 12px; letter-spacing: .5px; color: #e8c27a; }
    .tm-kind.boss { color: #ff9a8a; }
    .tm-tags { margin: 4px 0 6px; }
    .tm-name { font-size: 21px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .tm-boss b { display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .tm-boss > span:nth-child(2) { min-width: 0; }
    .tm-bar { position: relative; height: 17px; margin: 0 0 4px; border-radius: 9px; border: 1px solid rgba(0,0,0,.5); box-shadow: inset 0 1px 0 rgba(255,255,255,.25); }
    .tm-bar.hp { background: linear-gradient(180deg, #e0574a, #a8281f); }
    .tm-bar.mp { background: linear-gradient(180deg, #5b8fe0, #2c5db0); }
    .tm-bar em { position: absolute; inset: 0; display: grid; place-items: center; font-style: normal; font-size: 11.5px; color: #fff; text-shadow: 0 1px 2px rgba(0,0,0,.8); }
    .tm-info .tm-st { margin-top: 4px; }
    .tm-st3 { display: flex; justify-content: center; gap: 14px; margin-top: 4px; font-size: 15px; color: var(--ink); }
    .tm-st3 span { display: inline-flex; align-items: center; gap: 3px; }
    .tm-st3 svg { width: 19px; height: 19px; }
    .tm-st { font-size: 12.5px; line-height: 1.5; color: var(--muted); }
    .tm-st svg { width: 15px; height: 15px; vertical-align: -3px; }
    .tm-lb { margin: 10px 0 5px; font-size: 12.5px; color: var(--muted); }
    .tm-rws { display: flex; flex-wrap: wrap; gap: 6px; }
    .tm-rws span { padding: 5px 9px; border-radius: 8px; font-size: 13px; color: #ffe0a0; background: rgba(255,255,255,.05); border: 1px solid rgba(201,162,92,.35); }
    .tm-rws svg { width: 17px; height: 17px; vertical-align: -4px; }
    .tm-p { font-size: 13.5px; line-height: 1.55; margin: 0 0 8px; }
    .tm-board { max-height: 55vh; overflow-y: auto; }`;
  document.head.appendChild(st);
}
function thapFight() {
  if (!thapOpen() || (combat && !combat.over)) return;
  const f = thapNext();
  if (thapTop()) return toast('Ngươi đã lên tới đỉnh tháp.');
  closeModalSilent();
  thapView = null;
  if (!P.thap.run) { // lượt leo mới: hồi đầy
    const s = getStats();
    P.hp = s.hp;
    P.mp = s.mp;
    P.thap.run = f;
  }
  ENEMIES[THAP_ID] = thapArm(thapEnemy(f), f);
  P.thap.tries = (P.thap.tries || 0) + 1;
  saveGame(true);
  startCombat(THAP_ID, { story: true, noFlee: true, noHeal: true, stageText: `Trấn Ma Tháp · Tầng ${f}`, onEnemyTurn: thapEnrage, onEnd: r => thapEnd(f, r) });
}
// Mỗi lượt của cao thủ: quá THAP.enrage.after lượt thì cuồng nộ, sức công tăng dần
function thapEnrage(en) {
  en = en || combat.en;
  const g = THAP.enrage;
  en.turns = (en.turns || 0) + 1;
  if (en.turns <= g.after) return;
  if (!en.atk0) { en.atk0 = en.atk; clog(`[[lua]] Đã quá ${g.after} lượt, cao thủ dồn hết công lực, bắt đầu <b>cuồng nộ</b>: mỗi lượt sức công +${g.atk}%!`); }
  en.atk = Math.round(en.atk0 * (1 + (en.turns - g.after) * g.atk / 100));
}
function thapEnd(f, result) {
  if (result !== 'win') {
    P.thap.run = null;
    log(`[[thap]] Thất thủ ở tầng ${f} Trấn Ma Tháp.`);
    return { lines: [`[[tu_vong]] Thất thủ ở tầng <b>${f}</b>. Ngươi được đưa ra cửa tháp.`, `Lần sau leo lại từ tầng ${thapCp() + 1}. Luyện thêm võ công, sắm thêm trang bị rồi quay lại.`], btn: 'Về tháp', cls: 'lose', after: thapScreen };
  }
  const lines = [`[[chien_thang]] Vượt qua tầng <b>${f}</b> Trấn Ma Tháp!`];
  if (f > P.thap.best) {
    // Thắng tầng lần đầu: võ học đang mang + (số tầng × THAP.profPerFloor) thành thạo (người dùng chốt 2026-11-07: chỉ lần đầu, tránh leo lại cày)
    lines.push(...wornProf(f * THAP.profPerFloor, `Qua tầng ${f}`));
    const r0 = thapMyRank(), M = THAP.masters[f];
    P.thap.best = f;
    const teach = !M || thapCanTeach(f);
    applyReward(thapReward(f, teach), lines);
    // Thảo dược Kinh mạch lần đầu qua tầng: 1 cây, tầng chia hết cho 5 được 3 cây (Nhân Sâm 60% / Tuyết Liên 40%)
    if (typeof kmRare === 'function') lines.push(`[[nhan_sam]] Thảo dược: ${kmRare(f % 5 ? KINH_MACH.thap : KINH_MACH.thapBoss)}`);
    if (THAP.teachOn && M && !teach && !P.skills[M.teach]) lines.push(`[[vo_hoc]] ${M.name}: "Căn cơ ngươi chưa đủ để học <b>${SKILLS[M.teach].name}</b>. Khi nào luyện được ${thapReqText(f)} thì quay lại thỉnh giáo."`);
    const r1 = thapMyRank();
    if (r1 < r0) lines.push(`[[chien_thang]] Trấn Ma Bảng: hạng ${r0} → <b>hạng ${r1}</b>`);
    if (f >= THAP.floors) lines.push(`[[binh_minh]] Ngươi đã lên tới đỉnh tháp! Danh vị: <b>${thapRank(f)}</b>.`);
    log(`[[thap]] Vượt tầng ${f} Trấn Ma Tháp (hạng ${r1}).`);
  }
  const rest = f % THAP.step === 0 || f >= THAP.floors;
  P.thap.run = rest ? null : f + 1;
  if (rest) lines.push(`[[nghi_ngoi]] Tới mốc nghỉ tầng ${f}. Lượt leo sau bắt đầu ở tầng ${thapStartAt()}, hồi đầy sức.`);
  // Giữa lượt leo giữ nguyên khí huyết, nội lực (không hồi); tới mốc nghỉ thì hồi đầy
  return { lines, btn: rest ? 'Về tháp ➜' : `Tầng ${f + 1} ➜`, cls: 'win', keepHp: !rest, after: rest ? thapScreen : () => { thapScreen(); } };
}
// Thỉnh giáo: đánh lại riêng tông sư tầng f (đã qua tầng đó, đủ điều kiện, chưa học), thắng thì được truyền võ
function thapAsk(f) {
  if (!thapOpen() || P.thap.run || (combat && !combat.over) || f > P.thap.best || !thapCanTeach(f)) return;
  ENEMIES[THAP_ID] = thapArm(thapEnemy(f), f);
  const s = getStats();
  P.hp = s.hp;
  P.mp = s.mp;
  startCombat(THAP_ID, { story: true, noFlee: true, stageText: `Thỉnh giáo · Tầng ${f}`, onEnemyTurn: thapEnrage, onEnd: r => {
    const M = THAP.masters[f];
    if (r !== 'win') return { lines: [`[[tu_vong]] ${M.name}: "Còn non lắm. Luyện thêm rồi hẵng tới."`], btn: 'Về tháp', cls: 'lose', after: thapScreen };
    const lines = [`[[chien_thang]] ${M.name} gật đầu: "Được, ta truyền cho ngươi."`];
    applyReward({ skills: [M.teach] }, lines);
    log(`[[thap]] Thỉnh giáo ${M.name}, học được ${SKILLS[M.teach].name}.`);
    return { lines, btn: 'Về tháp ➜', cls: 'win', after: thapScreen };
  } });
}
// Chọn tầng bắt đầu lượt leo (để leo lại tầng thấp cày thành thạo); chọn ngay sau mốc nghỉ = theo mốc cao nhất
function thapStart(s) {
  if (P.thap.run || !thapStarts().includes(s)) return;
  P.thap.start = s === thapCp() + 1 ? null : s;
  saveGame(true);
  thapScreen();
}
function thapQuit() {
  P.thap.run = null;
  saveGame(true);
  thapScreen();
}
function thapLeave() { closeModalSilent(); renderWorld(); }

// Các nút trong HTML gọi qua G (engine.js gộp vào window.G)
const THAP_G = { thap: thapScreen, thapFight, thapLeave, thapQuit, thapAsk, thapStart, thapPeek };
