/* =================================================================
   HIỆP KHÁCH GIANG HỒ — DỮ LIỆU GAME
   -----------------------------------------------------------------
   Toàn bộ nội dung game (môn phái, võ công, vật phẩm, quái vật,
   bản đồ, NPC, nhiệm vụ, cốt truyện) nằm trong file này.
   Muốn chỉnh game dễ/khó hơn, đổi giá tiền, sửa lời thoại... chỉ cần
   sửa số hoặc chữ ở đây, lưu file rồi tải lại trang game (phím F5).

   Trong lời thoại có thể dùng:
     [[tên]] → biểu tượng (xem game/icons.js), vd. [[bac]]

   Trường icon (môn phái, vật phẩm, quái, địa điểm, NPC, cửa hàng) ghi TÊN
   biểu tượng trong game/icons.js, ví dụ icon: 'thiet_kiem'. Không dùng emoji.
   Thêm đồ/quái mới thì vẽ thêm biểu tượng trong icons.js.
     {name}  → tên nhân vật
     {title} → danh xưng (Thiếu hiệp / Nữ hiệp)
     {sect}  → tên môn phái

   Ý nghĩa chỉ số:
     hp = Khí huyết (máu)          mp = Nội lực (dùng võ công)
     atk = Công                    def = Thủ
     spd = Tốc độ (bên nhanh hơn ra tay trước, dễ bỏ chạy hơn)
     crit = % Bạo kích             critDmg = % Sát thương bạo kích (150 = gấp 1.5 lần)
     critRes = % Kháng bạo kích (trừ vào bạo kích của đối thủ)
     acc = % Chính xác (trừ vào né tránh của đối thủ)
     dodge = % Né tránh
     lifesteal = % Hút huyết (sát thương gây ra hồi thành máu)
     manasteal = % Hút nội lực (sát thương gây ra hồi thành nội lực)
     expBonus = % Kinh nghiệm nhận thêm
   ================================================================= */

/* ------------------------- MÔN PHÁI ------------------------------
   base: chỉ số ở cấp 1      grow: chỉ số tăng thêm mỗi cấp
   (chỉ số không ghi sẽ lấy theo BASE_DEFAULT / GROW_DEFAULT)
   start: võ công nhập môn được học sẵn
   home: địa điểm của môn phái (Tàng Kinh Các chỉ bán cho đệ tử bản môn)
   titles: danh xưng được chọn khi tạo nhân vật (không ghi = cả Thiếu hiệp lẫn Nữ hiệp) */
const BASE_DEFAULT = { critDmg: 150, critRes: 2, acc: 3, lifesteal: 0, manasteal: 0, expBonus: 0 };
const GROW_DEFAULT = { critRes: 0.3, acc: 0.4 };

/* ------------------------- ĐỘ KHÓ --------------------------------
   Nhân thêm vào khí huyết (hp) và sức công (atk) của kẻ địch khi vào trận.
   1 = giữ nguyên như số ghi trong ENEMIES; 1.2 = mạnh hơn 20%.
   quai: quái thường và đối thủ trong trận cốt truyện   boss: boss (có boss: true) */
const DO_KHO = {
  quai: { hp: 1.15, atk: 1.12 },
  boss: { hp: 1.25, atk: 1.12 },
};

// start: võ công nhập môn, startNoi: nội công bản môn — cả hai được truyền ngay khi bái sư
const SECTS = {
  thieu_lam: {
    name: 'Thiếu Lâm', icon: 'thieu_lam', home: 'thieu_lam_tu', start: 'la_han_quyen', startNoi: 'cuu_duong_than_cong', titles: ['Thiếu hiệp'],
    desc: 'Thiên hạ võ công xuất Thiếu Lâm. Khí huyết dồi dào, phòng thủ vững như bàn thạch, có cả võ công hồi phục.',
    base: { hp: 130, mp: 40, atk: 13, def: 10, spd: 8, crit: 5, dodge: 3, critRes: 4 },
    grow: { hp: 18, mp: 6, atk: 2.8, def: 2.5, spd: 1, crit: 0.2, dodge: 0.1, critRes: 0.4 },
  },
  vo_dang: {
    name: 'Võ Đang', icon: 'vo_dang', home: 'vo_dang_son', start: 'thai_cuc_kiem', startNoi: 'thuan_duong',
    desc: 'Lấy nhu chế cương, công thủ toàn diện. Kiếm pháp tinh diệu, khinh công cao minh.',
    base: { hp: 110, mp: 60, atk: 13, def: 7, spd: 11, crit: 7, dodge: 8, acc: 5 },
    grow: { hp: 14, mp: 8, atk: 3, def: 1.8, spd: 1.5, crit: 0.3, dodge: 0.2, acc: 0.5 },
  },
  nga_mi: {
    name: 'Nga Mi', icon: 'nga_mi', home: 'nga_mi_son', start: 'nga_mi_kiem', startNoi: 'cuu_am_chan_kinh', titles: ['Nữ hiệp'],
    desc: 'Thân pháp nhanh nhẹn, nội lực thâm hậu. Giỏi chữa thương và đánh liên hoàn nhiều đòn.',
    base: { hp: 95, mp: 80, atk: 11, def: 6, spd: 13, crit: 8, dodge: 10 },
    grow: { hp: 13, mp: 10, atk: 2.6, def: 1.5, spd: 1.8, crit: 0.3, dodge: 0.3 },
  },
  cai_bang: {
    name: 'Cái Bang', icon: 'cai_bang', home: 'cai_bang_da', start: 'da_cau_bong', startNoi: 'hon_nguyen_cong',
    desc: 'Đệ nhất đại bang trong thiên hạ. Lực công mạnh nhất, gậy pháp xảo quyệt: quật ngã đối thủ, đánh vào chỗ đã bị thương.',
    base: { hp: 120, mp: 45, atk: 14, def: 7, spd: 10, crit: 10, dodge: 5, critDmg: 160 },
    grow: { hp: 16, mp: 7, atk: 3.1, def: 1.8, spd: 1.2, crit: 0.3, dodge: 0.1 },
  },
  vo_danh: {
    name: 'Vô Danh Phái', icon: 'vo_danh',
    desc: 'Đệ tử của Tạ Cô Hồng, không thuộc đại môn phái nào. Mọi nhân vật đều khởi đầu ở đây, rồi tự chọn bái sư hay giữ con đường Vô Danh.',
    // Lối chơi mới: mọi nhân vật dùng chỉ số này (người dùng chốt 2026-10-27)
    // (người dùng chốt 2026-11-02) chính xác 100, bạo kích / né / kháng bạo 0, không tăng theo cấp
    base: { hp: 120, mp: 60, atk: 20, def: 10, spd: 10, crit: 0, dodge: 0, acc: 100, critRes: 0, critDmg: 150 },
    grow: { hp: 20, mp: 10, atk: 4, def: 2, spd: 1.5, crit: 0, dodge: 0, acc: 0, critRes: 0 },
    gold: 80,
  },
};

/* ------------------------- VÕ CÔNG -------------------------------
   sect: môn phái sở hữu (không ghi = võ công giang hồ, ai cũng học được)
   cat: loại võ học (xem SKILL_CATS)    grade: phẩm chất (xem SKILL_GRADES)
   price: giá học tại Tàng Kinh Các     mp: nội lực tiêu hao
   type: 'attack' (tấn công) | 'heal' (hồi máu) | 'buff' (tăng chỉ số)
         | 'passive' (bị động — mang theo là có tác dụng, mỗi lượt trong trận +1 thành thạo)
   power: sức mạnh (1.0 = 100% công)   up: tăng thêm mỗi tầng (tối đa tầng 10)
   hits: số đòn     drain: % sát thương hút thành máu
   critBonus: % bạo kích cộng thêm
   effect: hiệu ứng lên địch (poison = trúng độc, stun = choáng)
   buff: 'atk' | 'def' | 'dodge'   value: % tăng   turns: số lượt
   stats / statsUp: chỉ số của võ công bị động ở tầng 1 / mỗi tầng thêm
   story: true = chỉ học được qua cốt truyện (sư phụ truyền), không bán ở đâu
   fx: hiệu ứng khi ra chiêu — kind: kiểu hiệu ứng, color: màu chủ đạo
       kiểu có sẵn: quyen (quyền cước), kiem (kiếm pháp), con (côn bổng), chuong (chưởng),
       doc (độc), hoi (hồi phục), ho (hộ thể), luc (tăng lực), ne (khinh công),
       rong (rồng vàng), phat_chuong (bàn tay Phật), cuu_kiem (chín nhát kiếm),
       thai_cuc (âm dương), bang (băng tuyết), kim_chung (chuông vàng)
       Xem thử tất cả: https://claude.ai/artifact/AbmTmzqkHzZWCtWFSpivYu */
// Loại võ học
//   vocong    = Võ công: chiêu chủ động gây sát thương
//   noicong   = Nội công: bị động, tăng chỉ số
//   congphap  = Công pháp: chủ động hỗ trợ (hồi máu, tăng công, tăng thủ...)
//   khinhcong = Khinh công: bị động, tăng tốc độ và né tránh
const SKILL_CATS = { vocong: 'Võ công', noicong: 'Nội công', congphap: 'Công pháp', khinhcong: 'Khinh công' };
// Số môn được mang theo cùng lúc mỗi loại. Học thì không giới hạn,
// nhưng chỉ môn đang mang mới dùng được trong trận / mới cộng chỉ số. Muốn đổi thì gỡ bớt một môn.
const SKILL_SLOTS = { vocong: 2, noicong: 1, congphap: 2, khinhcong: 1 }; // 1 nội công để hệ của nhân vật luôn rõ (người dùng chốt 2026-10-27)
// Điểm thành thạo cần để lên từng tầng: tầng 1→2 cần 20, tầng 2→3 cần 50... tầng 9→10 cần 1500.
// Mỗi lần lên tầng thanh thành thạo về 0. Võ công, công pháp: +1 mỗi lần ra chiêu.
// Nội công, khinh công đang mang: +1 mỗi lượt trong trận.
// ===== CHẾ ĐỘ THỬ (tạm thời, người dùng yêu cầu 2026-10-25 để thử nhanh) =====
// true: mỗi tầng võ học chỉ cần 1 điểm thành thạo; tạo nhân vật mới thì bỏ qua cốt truyện tới nhiệm vụ Tìm Sư Môn (bái sư).
// Thử xong đổi thành false là game trở lại bình thường.
const TEST_MODE = false;
const SKILL_PROF = TEST_MODE ? [1, 1, 1, 1, 1, 1, 1, 1, 1] : [10, 25, 50, 100, 150, 200, 300, 400, 500];
// Thành thạo cần nhân theo phẩm chất (người dùng chốt 2026-10-28). Võ Vô Danh tặng lúc tạo nhân vật luôn tính như Nhập môn.
const PROF_MULT = { nhapmon: 1, thuongthua: 1.5, tuyethoc: 2, tranphai: 2 };
// Phẩm chất võ học, từ thấp đến cao
// Thứ tự từ thấp lên cao (người dùng chốt 2026-10-28): Nhập môn < Thượng thừa < Tuyệt học < Trấn phái
const SKILL_GRADES = { nhapmon: 'Nhập môn', thuongthua: 'Thượng thừa', tuyethoc: 'Tuyệt học', tranphai: 'Trấn phái' };
// Hệ của võ học (trường elem): võ công cùng hệ với nội công đang mang thì mạnh thêm; công pháp phải cùng hệ với nội công mới dùng được
// Mọi võ công, nội công, công pháp đều thuộc đúng một trong ba hệ (người dùng chốt 2026-10-27: không có "Vô hệ"); khinh công không cần hệ
const SKILL_ELEMS = { am: 'Âm Nhu', duong: 'Dương', thaicuc: 'Thái Cực' }; // hệ Dương (Dương Cương) chỉ hiện "Dương" (người dùng chốt)
const ELEM_BONUS = 0; // (đã bỏ 2026-11-07, người dùng chốt) trước là +10% sát thương khi mang nội công cùng hệ; elemWith cũng không còn tác dụng
// Hệ tương khắc: Dương khắc Âm, Âm khắc Thái Cực, Thái Cực khắc Dương.
// Đòn hệ A đánh vào kẻ thuộc hệ bị A khắc thì sát thương +ELEM_KHAC_BONUS%;
// đánh vào kẻ thuộc hệ khắc A thì sát thương −ELEM_KHAC_MALUS% (người dùng chốt 2026-11-07, vd. Dương đánh Thái Cực −15%).
// Hệ của người chơi = hệ các nội công đang mang; hệ của quái = trường elem trong ENEMIES (boss Phần 2 mang hệ của vùng).
const ELEM_KHAC = { duong: 'am', am: 'thaicuc', thaicuc: 'duong' };
const ELEM_KHAC_BONUS = 15;
const ELEM_KHAC_MALUS = 15;

const SKILLS = {
  // ===== Thiếu Lâm (thiết kế lại theo hệ Âm / Dương / Thái Cực, người dùng chốt 2026-10-25) =====
  // elem: hệ của võ học ('am' Âm Nhu, 'duong' Dương, 'thaicuc' Thái Cực).
  //   Võ công: mang nội công cùng hệ thì sát thương +10%; elemWith = { mã nội công: % } mang đúng môn đó thì được % ấy (thay cho 10%).
  //   Công pháp: (luật cũ, đã bỏ 2026-11-07) không còn phải mang nội công cùng hệ.
  // req: { skill, lv } = phải luyện môn kia tới tầng lv mới học được ở Tàng Kinh Các.
  la_han_quyen: { name: 'La Hán Quyền', sect: 'thieu_lam', cat: 'vocong', grade: 'nhapmon', price: 50, elem: 'duong', elemWith: { cuu_duong_than_cong: 20, thien_dinh_cong: 20 },
    mp: 5, type: 'attack', power: 1.3, up: 0.08,
    hits: 3, hitSplit: [0.2, 0.3, 0.5], // 3 đòn chia sức đánh 20% / 30% / 50% (người dùng chốt 2026-11-01), khớp 3 nắm đấm bay vào
    desc: 'Quyền pháp nhập môn của Thiếu Lâm, cương mãnh chính trực, ba quyền liên tiếp, đánh trúng làm đối thủ suy yếu.',
    fx: { kind: 'lahan', color: '#ff8a3a' } }, // ba nắm đấm lửa đồng đỏ (ảnh game/img/fx_lahan.png)
  dai_luc_kim_cuong: { name: 'Đại Lực Kim Cương Chưởng', sect: 'thieu_lam', cat: 'vocong', grade: 'thuongthua', price: 450, elem: 'duong', elemWith: { cuu_duong_than_cong: 20, thien_dinh_cong: 20 },
    req: { skill: 'la_han_quyen', lv: 10 },
    mp: 14, type: 'attack', power: 2.0, up: 0.1,
    desc: 'Chưởng lực nặng tựa núi, đánh đối thủ chùn tay, chưởng kình đọng lại thành kim cương hộ thể.',
    fx: { kind: 'dailuc', color: '#f2c14e' } }, // chưởng vàng góc cạnh (ảnh game/img/fx_dailuc.png)
  kim_chung_trao: { name: 'Kim Chung Tráo', sect: 'thieu_lam', cat: 'congphap', grade: 'thuongthua', price: 250, elem: 'duong',
    mp: 10, type: 'buff', buff: 'def', value: 50, up: 5, turns: 2,
    also: [{ buff: 'reflect', value: 15, up: 2 }],
    desc: 'Vận khí hộ thể, thân cứng như chuông vàng: tăng thủ và phản lại một phần sát thương nhận vào.',
    fx: { kind: 'kim_chung', color: '#f2c14e' } },
  nhat_vi_do_giang: { name: 'Nhất Vi Độ Giang', sect: 'thieu_lam', cat: 'khinhcong', grade: 'thuongthua', price: 300,
    type: 'passive', stats: { spd: 3, dodge: 2, acc: 2 }, statsUp: { spd: 1, dodge: 0.5, acc: 0.5 },
    desc: 'Đạt Ma tổ sư cưỡi một cành lau qua sông — khinh công bậc nhất Thiếu Lâm.' },
  nhu_lai_than_chuong: { name: 'Như Lai Thần Chưởng', sect: 'thieu_lam', cat: 'vocong', grade: 'tuyethoc', price: 1500, elem: 'duong', elemWith: { cuu_duong_than_cong: 20, thien_dinh_cong: 20 },
    req: { skill: 'dai_luc_kim_cuong', lv: 10 },
    mp: 28, type: 'attack', power: 3.0, up: 0.12, effect: { type: 'stun', chance: 25, turns: 1 },
    hits: 7, hitSplit: [0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.4], // 6 bàn tay nhỏ mỗi cái 10%, bàn tay khổng lồ 40% (người dùng chốt 2026-11-01)
    desc: 'Phật chưởng từ trên trời giáng xuống, uy lực trấn áp quần ma: vạn chưởng vây đánh tứ phía rồi một chưởng khổng lồ ập xuống.',
    fx: { kind: 'nhulai', color: '#ffd84d' } }, // pháp trận chữ Vạn + vạn chưởng + bàn tay khổng lồ (ảnh game/img/fx_phaptran.png, fx_nhulai.png)

  // ===== Võ Đang (đường kiếm hệ Thái Cực, thiết kế thiet_ke/vo_hoc_vo_dang.md, 2026-10-27) =====
  // Ít nhát mà mạnh dần qua các lượt: mốc tầng 5 mở Liên Miên (lmPct % mỗi tầng, tối đa lmMax tầng; mỗi lượt ra kiếm Võ Đang +1 tầng,
  // ra chiêu tấn công khác hoặc bị choáng thì mất hết; công pháp, thuốc thì giữ). Nhát nào cũng hút máu;
  // overDrain: máu đầy thì phần hút thừa thành giáp ảo, tối đa % khí huyết tối đa.
  thai_cuc_kiem: { name: 'Thái Cực Kiếm', sect: 'vo_dang', cat: 'vocong', grade: 'nhapmon', price: 50, elem: 'thaicuc', elemWith: { thuan_duong: 20 },
    mp: 6, type: 'attack', power: 1.4, up: 0.08,
    desc: 'Lấy nhu khắc cương, kiếm ý liên miên bất tuyệt: ra kiếm liên tiếp thì kiếm thế càng lúc càng mạnh.',
    fx: { kind: 'kiem', color: '#bfe6ff' } },
  luong_nghi_kiem: { name: 'Lưỡng Nghi Kiếm Pháp', sect: 'vo_dang', cat: 'vocong', grade: 'thuongthua', price: 450, elem: 'thaicuc', elemWith: { thuan_duong: 20 },
    req: { skill: 'thai_cuc_kiem', lv: 10 },
    mp: 14, type: 'attack', power: 1.1, up: 0.06, hits: 2, drain: 10,
    desc: 'Một kiếm âm, một kiếm dương, hai nghi tương sinh, vừa đánh vừa hút khí huyết đối thủ.',
    fx: { kind: 'kiem', color: '#d6eeff' } },
  chan_vu_that_tiet: { name: 'Chân Vũ Thất Tiệt Kiếm', sect: 'vo_dang', cat: 'vocong', grade: 'tuyethoc', price: 1500, elem: 'thaicuc', elemWith: { thuan_duong: 20 },
    req: { skill: 'luong_nghi_kiem', lv: 10 },
    mp: 26, type: 'attack', power: 1.25, up: 0.07, hits: 3, drain: 15,
    desc: 'Bảy thức tuyệt kiếm của Chân Vũ đại đế, mỗi thức nối thức trước, kiếm thế dồn lên như sóng không dứt.',
    fx: { kind: 'kiem', color: '#8fd0ff' } },
  vo_cuc_hoi_nguyen: { name: 'Vô Cực Hồi Nguyên', sect: 'vo_dang', cat: 'congphap', grade: 'thuongthua', price: 450, elem: 'thaicuc',
    mp: 20, type: 'heal', value: 25, up: 3,
    desc: 'Âm dương điều hòa, khí về đan điền, thương thế tự lành.',
    fx: { kind: 'hoi', color: '#a8e6ff' } },
  // Thái Cực Quyền: công pháp phản đòn (trước là võ công; loadPlayer chuyển bản lưu cũ)
  thai_cuc_quyen: { name: 'Thái Cực Quyền', sect: 'vo_dang', cat: 'congphap', grade: 'thuongthua', price: 450, elem: 'thaicuc',
    mp: 12, type: 'buff', buff: 'reflect', value: 25, up: 2, turns: 2,
    also: [{ buff: 'def', value: 20, up: 2 }],
    desc: 'Mượn lực đánh lực, tứ lạng bạt thiên cân: tăng thủ và trả lại một phần sát thương nhận vào.',
    fx: { kind: 'thai_cuc', color: '#e8f4ff' } },
  thuan_duong: { name: 'Thuần Dương Vô Cực Công', sect: 'vo_dang', cat: 'noicong', grade: 'tuyethoc', price: 600, elem: 'thaicuc',
    type: 'passive', stats: { hp: 120, mp: 80, atk: 10, def: 5, manasteal: 3 }, statsUp: { hp: 60, mp: 40, atk: 5, def: 2.5, manasteal: 0.3 },
    desc: 'Nội công trấn sơn của Võ Đang, nội lực thuần hậu, công thủ đều tăng, đánh trúng thì hút nội lực đối thủ. Kiếm Võ Đang mang môn này mạnh thêm 20%.' },
  the_van_tung: { name: 'Thê Vân Tung', sect: 'vo_dang', cat: 'khinhcong', grade: 'thuongthua', price: 300,
    type: 'passive', stats: { spd: 5, dodge: 5 }, statsUp: { spd: 1.2, dodge: 1 },
    desc: 'Khinh công tuyệt kỹ, thân nhẹ như mây, khó bị đánh trúng.' },

  // ===== Nga Mi (đường kiếm hệ Âm Nhu, người dùng chốt 2026-10-25; đường chưởng tạm bỏ, làm sau) =====
  // Nội thương (mốc tầng 5 các môn kiếm): mỗi nhát chém trúng thêm tầng nội thương lên đối thủ, giữ cả trận;
  // mỗi tầng giảm 5% trị liệu/hồi máu và 3% thủ; số tầng tối đa noiMax tùy môn (8 / 12 / 16), môn thấp chém vào không làm mất tầng đã có.
  nga_mi_kiem: { name: 'Nga Mi Kiếm Pháp', sect: 'nga_mi', cat: 'vocong', grade: 'nhapmon', price: 50, elem: 'am', elemWith: { cuu_am_chan_kinh: 20 },
    mp: 5, type: 'attack', power: 0.8, up: 0.05, hits: 2,
    desc: 'Kiếm pháp nhập môn của Nga Mi, một chiêu hai thức, kiếm khí âm nhu thấm vào kinh mạch đối thủ.',
    fx: { kind: 'kiem', color: '#ffb3d1' } },
  diet_tuyet_kiem: { name: 'Diệt Tuyệt Kiếm Pháp', sect: 'nga_mi', cat: 'vocong', grade: 'thuongthua', price: 450, elem: 'am', elemWith: { cuu_am_chan_kinh: 20 },
    req: { skill: 'nga_mi_kiem', lv: 10 },
    mp: 14, type: 'attack', power: 0.8, up: 0.05, hits: 3,
    desc: 'Kiếm pháp của Diệt Tuyệt Sư Thái, ba kiếm liền tay, không chừa đường lui.',
    fx: { kind: 'diet_tuyet', color: '#e9e4ff' } },
  that_sat_kiem: { name: 'Thất Sát Kiếm Pháp', sect: 'nga_mi', cat: 'vocong', grade: 'tuyethoc', price: 1500, elem: 'am', elemWith: { cuu_am_chan_kinh: 20 },
    req: { skill: 'diet_tuyet_kiem', lv: 10 },
    mp: 26, type: 'attack', power: 0.5, up: 0.025, hits: 7,
    desc: 'Bảy kiếm như bảy vì sát tinh, kiếm ảnh dày đặc, đối thủ không biết đỡ đường nào.',
    fx: { kind: 'that_sat', color: '#c9b8ff' } },
  phat_quang: { name: 'Phật Quang Phổ Chiếu', sect: 'nga_mi', cat: 'congphap', grade: 'thuongthua', price: 350, elem: 'am',
    mp: 12, type: 'buff', buff: 'atk', value: 20, up: 3, turns: 2,
    also: [{ buff: 'acc', value: 20, up: 3 }],
    desc: 'Phật quang chiếu rọi, tâm sáng kiếm nhanh: tăng công và chính xác.',
    fx: { kind: 'hoi', color: '#ffe48a' } },
  cuu_am_chan_kinh: { name: 'Cửu Âm Chân Kinh', sect: 'nga_mi', cat: 'noicong', grade: 'tuyethoc', price: 600, elem: 'am',
    type: 'passive', stats: { hp: 80, mp: 120, atk: 20 }, statsUp: { hp: 40, mp: 60, atk: 10 },
    desc: 'Chân kinh âm nhu chí cao, Quách Tương truyền lại cho Nga Mi. Võ công Âm Nhu càng đánh càng hiểm.' },
  phieu_tuyet_bo: { name: 'Phiêu Tuyết Bộ', sect: 'nga_mi', cat: 'khinhcong', grade: 'thuongthua', price: 300,
    type: 'passive', stats: { spd: 5, dodge: 5 }, statsUp: { spd: 1.2, dodge: 1 },
    desc: 'Bước chân như tuyết bay trên đỉnh Kim Đỉnh, nhẹ nhàng không dấu vết.' },

  // ===== Cái Bang (đường gậy hệ Âm Nhu, chốt 2026-10-27; thiết kế ở thiet_ke/vo_hoc_cai_bang.md) =====
  // Gậy làm đối thủ vấp ngã (choáng) và chảy máu; đánh kẻ đang chảy máu / choáng / trúng độc thì mạnh dần (vsStatus).
  // Hàng Long, Kháng Long không còn bán ở Truyền Công Đường: thành tuyệt học (book), cách lấy làm sau.
  da_cau_bong: { name: 'Đả Cẩu Bổng Pháp', sect: 'cai_bang', cat: 'vocong', grade: 'nhapmon', price: 50, elem: 'am', elemWith: { hon_nguyen_cong: 20 },
    mp: 5, type: 'attack', power: 0.5, up: 0.03, hits: 3, critBonus: 5,
    desc: 'Gậy pháp nhập môn của Cái Bang, lấy xảo thắng lực: một chiêu ba đòn, gạt chân quật ngã đối thủ.',
    fx: { kind: 'con', color: '#9ccc65' } },
  da_cau_bat_quyet: { name: 'Đả Cẩu Bát Quyết', sect: 'cai_bang', cat: 'vocong', grade: 'thuongthua', price: 450, elem: 'am', elemWith: { hon_nguyen_cong: 20 },
    req: { skill: 'da_cau_bong', lv: 10 },
    mp: 14, type: 'attack', power: 0.85, up: 0.045, hits: 3, critBonus: 10,
    desc: 'Tám chữ quyết bán, phách, triền, trạc, khiêu, dẫn, phong, chuyển. Gậy quấn lấy đối thủ, đánh vào chỗ đã bị thương.',
    fx: { kind: 'con', color: '#7cbf5a' } },
  thien_ha_vo_cau: { name: 'Thiên Hạ Vô Cẩu', sect: 'cai_bang', cat: 'vocong', grade: 'tuyethoc', price: 1500, elem: 'am', elemWith: { hon_nguyen_cong: 20 },
    req: { skill: 'da_cau_bat_quyet', lv: 10 },
    mp: 24, type: 'attack', power: 0.9, up: 0.05, hits: 4, critBonus: 15, effect: { type: 'stun', chance: 15, turns: 1 },
    desc: 'Chiêu cuối của Đả Cẩu Bổng Pháp, chỉ bang chủ đời đời truyền nhau. Bóng gậy phủ kín bốn phương, đối thủ ngã rồi không gượng dậy nổi.',
    fx: { kind: 'con', color: '#4f9a3a' } },
  tuy_quyen: { name: 'Túy Quyền', sect: 'cai_bang', cat: 'congphap', grade: 'thuongthua', price: 300, elem: 'am',
    mp: 12, type: 'buff', buff: 'atk', value: 25, up: 3, turns: 3,
    also: [{ buff: 'crit', value: 10, up: 1 }],
    desc: 'Say mà không say: tăng công và bạo kích.',
    fx: { kind: 'luc', color: '#ff8a3d' } },
  hon_nguyen_cong: { name: 'Hỗn Nguyên Công', sect: 'cai_bang', cat: 'noicong', grade: 'tuyethoc', price: 1500, elem: 'am',
    type: 'passive', stats: { hp: 100, mp: 40, atk: 14, lifesteal: 3 }, statsUp: { hp: 50, mp: 20, atk: 7, lifesteal: 0.4 },
    desc: 'Nội công hỗn nguyên nhất khí của Cái Bang, khí huyết hùng hậu, càng đánh càng lì. Vết thương gậy gây ra càng chảy máu nhiều.' },
  tieu_dao_du: { name: 'Tiêu Dao Du', sect: 'cai_bang', cat: 'khinhcong', grade: 'thuongthua', price: 300,
    type: 'passive', stats: { spd: 3, dodge: 2, critRes: 2 }, statsUp: { spd: 1, dodge: 0.5, critRes: 0.5 },
    desc: 'Bước đi lảo đảo như kẻ say, vậy mà chẳng ai chạm được vào người.' },
  // Tuyệt học hệ Dương (trước là võ công Cái Bang; người đã học vẫn giữ). Kiều bang chủ dùng trong trận cốt truyện.
  hang_long: { name: 'Hàng Long Thập Bát Chưởng', cat: 'vocong', grade: 'tuyethoc', book: true, elem: 'duong',
    mp: 20, type: 'attack', power: 2.6, up: 0.12,
    desc: 'Chưởng pháp đệ nhất thiên hạ, cương mãnh tuyệt luân. Kiều Phong giữ tầng 50 Trấn Ma Tháp truyền lại.',
    fx: { kind: 'rong', color: '#ffcf40' } },
  khang_long: { name: 'Kháng Long Hữu Hối', cat: 'vocong', grade: 'tuyethoc', book: true, elem: 'duong',
    mp: 30, type: 'attack', power: 3.5, up: 0.2, critBonus: 15,
    desc: 'Chiêu mạnh nhất trong Hàng Long Thập Bát Chưởng.',
    fx: { kind: 'rong', color: '#ff9f1c' } },

  // ===== Giang hồ (ai cũng học được) =====
  thai_to_truong_quyen: { name: 'Thái Tổ Trường Quyền', cat: 'vocong', grade: 'nhapmon', price: 40, elem: 'duong', pho: true, quai: true,
    // Võ công của quái (người dùng chốt 2026-10-27): 100% +2,5%/tầng, 1 đòn, không tốn nội lực, thay cho đánh thường, không mốc tầng
    mp: 0, type: 'attack', power: 1, up: 0.025,
    desc: 'Quyền pháp phổ thông lưu truyền khắp giang hồ, dễ học dễ dùng.',
    fx: { kind: 'quyen', color: '#e0cfa8' } },
  tho_nap_phap: { name: 'Thổ Nạp Pháp', cat: 'noicong', grade: 'nhapmon', price: 120, elem: 'thaicuc', pho: true, quai: true,
    type: 'passive', stats: { hp: 20, spd: 3 }, statsUp: { hp: 10, spd: 3 },
    desc: 'Phép hít thở điều khí căn bản, khí thông thì thân nhẹ.' },
  thiet_bo_sam: { name: 'Thiết Bố Sam', cat: 'congphap', grade: 'nhapmon', price: 200, elem: 'duong', pho: true, quai: true,
    // Công pháp của quái (người dùng chốt 2026-10-27): nội lực cố định mp + mpTier × (tầng − 1); quái dùng ở hiệp 1, 4, 7... (enemyAI)
    mp: 8, mpTier: 8, type: 'buff', buff: 'def', value: 10, up: 2, turns: 2,
    desc: 'Ngoại công luyện da thịt cứng như vải sắt.',
    fx: { kind: 'ho', color: '#c9d2dc' } },
  lieu_thuong: { name: 'Tĩnh Tọa Liệu Thương', cat: 'congphap', grade: 'nhapmon', price: 600, elem: 'thaicuc', pho: true, quai: true,
    mp: 16, mpTier: 16, type: 'buff', buff: 'hpUp', value: 10, up: 2, turns: 2,
    desc: 'Phép ngồi tĩnh tọa vận khí của giang hồ, khí huyết sung mãn.',
    fx: { kind: 'hoi', color: '#c8e6a0' } },
  bat_bo_can_thien: { name: 'Bát Bộ Cản Thiền', cat: 'khinhcong', grade: 'nhapmon', price: 150, pho: true,
    type: 'passive', stats: { spd: 2, dodge: 2 }, statsUp: { spd: 1, dodge: 0.6 },
    desc: 'Tám bước đuổi ve sầu, khinh công nhập môn của giang hồ.' },
  // Võ phổ thông (pho: true): mỗi hệ Âm / Dương / Thái Cực đủ 1 võ công, 1 nội công, 1 công pháp nhập môn, cộng vài khinh công.
  // quai: true = võ riêng của quái (người dùng chốt 2026-10-27): quái trên các map lấy ngẫu nhiên từ bộ này (game/the_gioi.js),
  // người chơi không học, không mang được (canLearn chặn, loadPlayer gỡ khỏi bản lưu). Khinh công phổ thông vẫn bán cho người chơi.
  //   Dương:    Thái Tổ Trường Quyền, Hỗn Nguyên Khí Công, Thiết Bố Sam
  //   Âm Nhu:   Tiểu Miên Chưởng, Âm Phong Tâm Pháp, Tĩnh Tâm Quyết
  //   Thái Cực: Lưỡng Nghi Côn, Thổ Nạp Pháp, Tĩnh Tọa Liệu Thương
  //   Khinh công: Bát Bộ Cản Thiền, Yến Tử Phi, Thảo Thượng Phi
  tieu_mien_chuong: { name: 'Tiểu Miên Chưởng', cat: 'vocong', grade: 'nhapmon', price: 40, elem: 'am', pho: true, quai: true,
    mp: 0, type: 'attack', power: 1, up: 0.025,
    desc: 'Chưởng pháp phổ thông, mềm như bông mà kình lực ngấm vào trong.',
    fx: { kind: 'chuong', color: '#b9c8ff' } },
  luong_nghi_con: { name: 'Lưỡng Nghi Côn', cat: 'vocong', grade: 'nhapmon', price: 40, elem: 'thaicuc', pho: true, quai: true,
    mp: 0, type: 'attack', power: 1, up: 0.025,
    desc: 'Côn pháp phổ thông, một đầu công một đầu thủ.',
    fx: { kind: 'con', color: '#d8d0b8' } },
  hon_nguyen_khi_cong: { name: 'Hỗn Nguyên Khí Công', cat: 'noicong', grade: 'nhapmon', price: 120, elem: 'duong', pho: true, quai: true,
    type: 'passive', stats: { hp: 20, def: 3 }, statsUp: { hp: 10, def: 1.5 },
    desc: 'Khí công phổ thông của giới võ biền, khí bọc thân thể, chịu đòn tốt hơn.' },
  am_phong_tam_phap: { name: 'Âm Phong Tâm Pháp', cat: 'noicong', grade: 'nhapmon', price: 120, elem: 'am', pho: true, quai: true,
    type: 'passive', stats: { hp: 20, atk: 3 }, statsUp: { hp: 10, atk: 1.5 },
    desc: 'Tâm pháp âm nhu lưu truyền trên giang hồ, ra đòn hiểm hơn.' },
  tinh_tam_quyet: { name: 'Tĩnh Tâm Quyết', cat: 'congphap', grade: 'nhapmon', price: 200, elem: 'am', pho: true, quai: true,
    mp: 8, mpTier: 8, type: 'buff', buff: 'atk', value: 10, up: 2, turns: 2,
    desc: 'Giữ tâm như nước lặng, nhìn rõ sơ hở của đối thủ: ra đòn mạnh hơn.',
    fx: { kind: 'ne', color: '#b9c8ff' } },
  yen_tu_phi: { name: 'Yến Tử Phi', cat: 'khinhcong', grade: 'nhapmon', price: 150, pho: true,
    type: 'passive', stats: { spd: 3, dodge: 1 }, statsUp: { spd: 1.2, dodge: 0.3 },
    desc: 'Nhanh như chim yến lướt mặt nước, ra tay trước đối thủ.' },
  thao_thuong_phi: { name: 'Thảo Thượng Phi', cat: 'khinhcong', grade: 'nhapmon', price: 150, pho: true,
    type: 'passive', stats: { spd: 1, dodge: 3 }, statsUp: { spd: 0.5, dodge: 0.8 },
    desc: 'Lướt trên ngọn cỏ không để dấu, khó bị đánh trúng.' },

  // ===== Vô Danh (sư phụ Tạ Cô Hồng truyền theo cốt truyện, không bán ở đâu) =====
  // Thiên về bạo kích. Võ công ít lưu truyền nên không ai biết cách khắc chế:
  // noCritRes = bỏ qua kháng bạo kích của đối thủ. Cao thủ không cần danh nên môn nào cũng mang tên "Vô Danh".
  // tiers = hiệu ứng mở thêm khi luyện tới tầng đó, cộng dồn (tầng 10 có cả hiệu ứng tầng 5):
  //   chiêu đánh: critBonus (+% bạo kích), critDmg (+% sát thương bạo kích), hits (+số nhát), lastCrit (nhát cuối chắc bạo kích),
  //               critStun (bạo kích làm choáng N lượt), critBleed (bạo kích gây chảy máu N lượt), moveName (tên chiêu mới),
  //               fx (đổi hình hiệu ứng từ mốc này, ghi đè lên fx của võ công)
  //   bị động (khi mang theo): dodgeCrit (né được thì đòn kế tiếp chắc bạo kích), firstDodge (né chắc đòn đầu mỗi trận),
  //               critMp (mỗi lần bạo kích hồi % nội lực tối đa), critHeal (bạo kích hồi máu bằng % sát thương)
  // Võ học Vô Danh thuộc hệ Thái Cực (người dùng bỏ "Vô hệ" 2026-10-27)
  vo_danh_quyen: { name: 'Vô Danh Quyền', kieu: 'quyen', sect: 'vo_danh', cat: 'vocong', grade: 'nhapmon', story: true, noElem: true, // không hệ: không cộng theo nội công, không khắc / bị khắc (người dùng chốt 2026-10-27)
    // thay cho đánh thường, không tốn nội lực, không mốc tầng, không cộng bạo kích (người dùng chốt 2026-10-27)
    // 2026-11-07 người dùng chốt: 100% ở tầng 1, mỗi tầng +1%, riêng tầng 10 +2% → tầng 10 = 110% (upAt: tầng đó tăng bao nhiêu thay cho up)
    mp: 0, type: 'attack', power: 1.0, up: 0.01, upAt: { 10: 0.02 },
    desc: 'Quyền pháp không tên, giản dị mà chắc. Ai cũng biết, dùng thay cho đánh thường, không tốn nội lực, không thuộc hệ nào.',
    fx: { kind: 'vdq1', color: '#e8c070' } },
  co_hong_bo: { name: 'Vô Danh Bộ Pháp', sect: 'vo_danh', cat: 'khinhcong', grade: 'thuongthua', story: true,
    type: 'passive', stats: { spd: 4, dodge: 3, crit: 2 }, statsUp: { spd: 1, dodge: 0.55, crit: 0.45 },
    desc: 'Bộ pháp học theo cánh chim hồng lẻ bạn: nhanh, nhẹ, khó đoán.',
    tiers: {
      5: { name: 'Thừa Hư Nhi Nhập', desc: 'Né được đòn thì đòn kế tiếp của mình chắc chắn bạo kích.', dodgeCrit: 1 },
      10: { name: 'Vô Ảnh', desc: 'Chiêu đầu tiên của đối thủ mỗi trận chắc chắn né trượt.', firstDodge: 1 },
    } },
  co_hong_tam_phap: { name: 'Vô Danh Tâm Pháp', sect: 'vo_danh', cat: 'noicong', grade: 'nhapmon', story: true, noElem: true, maxLv: 100,
    // Nội công khởi đầu (người dùng chốt 2026-11-07): 100 tầng; giữ hiệu ứng cũ ở bậc 5 (tầng 50) và bậc 10 (tầng 100)
    type: 'passive', stats: { hp: 90, mp: 60, atk: 10, def: 10 }, statsUp: { hp: 9, mp: 6, atk: 1, def: 1 },
    desc: 'Tâm pháp không tên, ai cũng biết. Không thuộc hệ nào: võ công không được cộng theo hệ, nhưng cũng không bị hệ nào khắc. Luyện tới 100 tầng.',
    tiers: {
      50: { name: 'Bậc 5 · Tâm Định', desc: 'Giảm 5% sát thương nhận vào. Thành thạo võ học nhận được tăng 100%.', dmgReduce: 5, profUp: 100 },
      100: { name: 'Bậc 10 · Tâm Thông', desc: 'Giảm thêm 10% sát thương nhận vào (tổng 15%). Kinh nghiệm nhận được tăng 30%.', dmgReduce: 10, expUp: 30 },
    } },
  // Công pháp sư phụ truyền đêm sinh nhật mười tám (nhiệm vụ Tuổi Mười Tám): cùng lúc tăng bạo kích, sát thương bạo kích và né
  // also = các chỉ số tăng thêm cùng lúc với buff chính, mỗi cái có up (tăng mỗi tầng) riêng
  // Vô Danh Thuẫn: đổi tên từ Vô Danh Công Pháp (người dùng chốt 2026-11-07, giữ mã)
  // chieu: 'tro' = Trợ chiêu lẻ, mang ở ô Trợ của 5 ô Chiêu thức (người dùng chốt 2026-11-07)
  vo_danh_cong_phap: { name: 'Vô Danh Thuẫn', sect: 'vo_danh', cat: 'congphap', chieu: 'tro', grade: 'nhapmon', story: true, noElem: true,
    // Trợ chiêu nhập môn (người dùng chốt 2026-11-07): thủ +10%, khí huyết tối đa +10%, mỗi tầng +1% mỗi thứ; không mốc tầng.
    // hpBuffUp: khí huyết tối đa tăng thêm mỗi tầng. mpTier: nội lực cố định = mp + mpTier × (tầng − 1), không tăng theo cấp nhân vật
    mp: 10, mpTier: 3, type: 'buff', buff: 'def', value: 10, up: 1, turns: 2, hpBuff: 10, hpBuffUp: 1,
    desc: 'Tâm quyết vận khí sư phụ truyền: chân khí hộ thể như tấm khiên vô hình, giữ mình trước rồi mới tính chuyện thắng.',
    fx: { kind: 'luc', color: '#ffd36b' } },
  // Đường kiếm Vô Danh: hệ Thái Cực, mang nội công Thái Cực +10%, mang nội công Vô Danh thì +20%
  co_hong_kiem: { name: 'Vô Danh Kiếm Pháp', sect: 'vo_danh', cat: 'vocong', grade: 'thuongthua', story: true,
    elem: 'thaicuc', elemWith: { co_hong_tam_phap: 20, thai_huyen_kinh: 20 },
    mp: 14, type: 'attack', power: 0.9, up: 0.055, hits: 3, critBonus: 15, noCritRes: true,
    desc: 'Kiếm pháp của Tạ Cô Hồng, ba nhát nối nhau như cánh hồng vỗ gió.',
    fx: { kind: 'kiem', color: '#e0e8ff' },
    tiers: {
      // openStack: mỗi nhát bạo kích thêm 1 tầng Sơ hở lên đối thủ (giữ 3 lượt, mỗi tầng +10% sát thương bạo kích lên đối thủ đó);
      // đủ 10 tầng thì đánh thêm một lần chiêu này (không tốn nội lực) rồi xóa hết Sơ hở
      5: { name: 'Kiếm Phá Sơ Hở', desc: 'Mỗi nhát bạo kích làm đối thủ lộ thêm 1 tầng Sơ hở (giữ 3 lượt): mỗi tầng tăng 10% sát thương bạo kích của ngươi lên đối thủ đó. Đủ 10 tầng thì thi triển thêm một lần Vô Danh Kiếm Pháp rồi xóa hết Sơ hở.', openStack: 1, fx: { kind: 'vdk5', color: '#e0e8ff' } },
      10: { name: 'Tứ Kiếm Liên Hoàn', desc: 'Thêm nhát thứ 4, nhát cuối chắc chắn bạo kích.', hits: 1, lastCrit: 1, moveName: 'Vô Danh Tứ Kiếm', fx: { kind: 'vdk10', color: '#ffd24a' } },
    } },
  vo_danh_kiem_y: { name: 'Vô Danh Kiếm Ý', sect: 'vo_danh', cat: 'vocong', grade: 'tranphai', story: true,
    elem: 'thaicuc', elemWith: { co_hong_tam_phap: 20, thai_huyen_kinh: 20 },
    mp: 30, type: 'attack', power: 3.0, up: 0.14, critBonus: 20, noCritRes: true,
    desc: 'Kiếm không chiêu, ý không tên. Tuyệt kỹ cả đời của Tạ Cô Hồng.',
    fx: { kind: 'cuu_kiem', color: '#ffffff' } },

  // ===== Tuyệt học (chỉ học từ bí kíp — cách lấy bí kíp sẽ thiết kế sau, quái không rơi) =====
  // ===== Giang hồ Phần 2 + tuyệt học (thiết kế lại 2026-10-27, thiet_ke/vo_hoc_giang_ho.md) =====
  // Mỗi vùng Phần 2 một hệ: Tây Vực Dương (đao, chảy máu), Đông Hải Thái Cực (kiếm kết liễu, tiêu), Miêu Cương Âm (độc),
  // Thiên Sơn Âm (choáng), Hoa Sơn Dương (kiếm). Giang hồ là "đường võ thứ hai" khác loại với võ bản môn.
  // Độc Cô Cửu Kiếm hệ Dương (kiếm Hoa Sơn), Thiên Cơ Thần Công hệ Âm (Tổng Cương của ma giáo).
  // Thí Luyện Tháp (người dùng chốt 2026-10-28): tầng 100, khinh công cực mạnh, Đoàn Dự truyền
  lang_ba_vi_bo: { name: 'Lăng Ba Vi Bộ', cat: 'khinhcong', grade: 'tuyethoc', book: true,
    type: 'passive', stats: { spd: 12, dodge: 10 }, statsUp: { spd: 2.5, dodge: 1.5 },
    desc: 'Bộ pháp thần kỳ theo hình quẻ Dịch, thân ảnh lướt đi như sóng nước. Đoàn Dự giữ tầng 100 Trấn Ma Tháp truyền lại.' },
  ngu_doc_chuong: { name: 'Ngũ Độc Chưởng', cat: 'vocong', grade: 'tuyethoc', book: true, elem: 'am',
    mp: 12, type: 'attack', power: 1.3, up: 0.08, effect: { type: 'poison', chance: 100, turns: 3, value: 0.6 },
    desc: 'Chưởng pháp tẩm kịch độc, đối thủ mất máu mỗi lượt.',
    fx: { kind: 'doc', color: '#7ad151' } },
  doc_co_cuu_kiem: { name: 'Độc Cô Cửu Kiếm', cat: 'vocong', grade: 'tuyethoc', book: true, elem: 'thaicuc',
    mp: 25, type: 'attack', power: 2.7, up: 0.13, critBonus: 15,
    desc: 'Vô chiêu thắng hữu chiêu, phá tận thiên hạ võ công, chuyên phá thế của kẻ đang tự cường. Phong Thanh Dương giữ tầng 80 Trấn Ma Tháp truyền lại.',
    fx: { kind: 'cuu_kiem', color: '#d8f0ff' } },
  thien_son_luc_duong: { name: 'Thiên Sơn Lục Dương Chưởng', cat: 'vocong', grade: 'tuyethoc', book: true, elem: 'thaicuc',
    mp: 24, type: 'attack', power: 2.1, up: 0.11, effect: { type: 'stun', chance: 30, turns: 1 },
    desc: 'Tàn quyển thứ hai của Thiên Cơ Bảo Lục. Chưởng lực lạnh như băng tuyết Thiên Sơn, trúng phải tê cứng cả người.',
    fx: { kind: 'bang', color: '#cfe8ff' } },
  // Nội công của Thiếu Lâm, chỉ học ở Tàng Kinh Các Thiếu Lâm (kỳ ngộ Vượn Già đã bỏ, người dùng chốt 2026-10-25)
  // setFlag: học xong thì bật cờ này (cờ 'cuu_duong' mở đường học Càn Khôn Đại Na Di ở Hồi 6)
  // Đổi tên 2026-11-09 (người dùng: thiên về hồi phục) Cửu Dương Thần Công → Dịch Cân Kinh, giữ mã cuu_duong_than_cong để không hỏng bản lưu
  cuu_duong_than_cong: { name: 'Dịch Cân Kinh', sect: 'thieu_lam', cat: 'noicong', grade: 'tuyethoc', price: 1500, book: true, // Thiền Định Công thay chỗ ở Tàng Kinh Các (2026-11-02), ai đã học vẫn giữ
    elem: 'duong', setFlag: 'cuu_duong',
    // pháp trận mặt trời fx_cuuduong.png đã chuyển sang Cửu Dương Thần Công mới (cuu_duong_tp); Dịch Cân Kinh có pháp trận ngọc bích vàng riêng
    circle: 'game/img/fx_dich_can.png', // ảnh Gemini người dùng 2026-11-09 (gốc luu_tru/Chuong_TinhAnh/dich_can_phap_tran.png)
    // Làm lại 2026-11-09 (người dùng chốt): nội công Tuyệt học đường Chưởng, 100 tầng, Phổ Trí truyền khi lên tinh anh (TINH_ANH.teach).
    // Tầng 1 khí huyết + nội lực = 800, công + thủ = 60, mỗi tầng +25% số gốc, tầng 100 gấp đôi. Mốc tầng 5 / 10 cũ (SKILL_TIERS) bị tiers dưới đây thay.
    maxLv: 100, type: 'passive', stats: { hp: 600, mp: 200, atk: 24, def: 36 }, statsUp: { hp: 150, mp: 50, atk: 6, def: 9 }, statsUpAt: { 100: 2 },
    desc: 'Kinh Phật dịch cân tẩy tủy, gân cốt đổi mới, thương thế lành nhanh, càng đánh lâu càng bền. Luyện tới 100 tầng, mỗi 10 tầng lên một bậc.',
    tiers: {
      10: { name: 'Bậc 1', desc: 'Sát thương võ học Quyền +10%.', quyenUp: 10 },
      20: { name: 'Bậc 2', desc: 'Giảm 10% sát thương nhận từ võ học Côn.', conRed: 10 },
      30: { name: 'Bậc 3', desc: 'Sát thương võ học Quyền thêm +10% (tổng 20%).', quyenUp: 10 },
      40: { name: 'Bậc 4', desc: 'Giảm thêm 10% sát thương nhận từ võ học Côn (tổng 20%).', conRed: 10 },
      50: { name: 'Bậc 5', desc: 'Mỗi lượt hồi 5% khí huyết tối đa.', regen: 5 },
      60: { name: 'Bậc 6', desc: 'Khí huyết tối đa +12,5%.', hpPct: 12.5 },
      70: { name: 'Bậc 7', desc: 'Thủ +12,5%.', defPct: 12.5 },
      80: { name: 'Bậc 8', desc: 'Khí huyết tối đa thêm +12,5% (tổng 25%).', hpPct: 12.5 },
      90: { name: 'Bậc 9', desc: 'Thủ thêm +12,5% (tổng 25%).', defPct: 12.5 },
      100: { name: 'Tẩy Tủy Trùng Sinh', desc: 'Bị đánh gục thì không chết, giữ lại 1 khí huyết rồi hồi ngay 30% khí huyết tối đa (mỗi trận một lần).', lastStand: 1, lastHeal: 30 } } },
  /* Thiền Định Công (người dùng thiết kế 2026-11-02): nội công nhập môn Thiếu Lâm, thay chỗ Cửu Dương ở Tàng Kinh Các.
     Nội công kiểu mới tối đa 100 tầng (maxLv): mỗi mốc thành thạo SKILL_PROF dùng cho 10 tầng, chia 10 (profNeed);
     cứ 10 tầng một bậc (tiers 10, 20 ... 100), cộng dồn. Trường bậc: hpPct, defPct (% khí huyết / thủ), gate75 / gate50 / gate25
     (lần đầu khí huyết xuống dưới mức đó thì hồi ngay % khí huyết tối đa), noUp (% sát thương chiêu nộ), lastStand + lastHeal
     (bị đánh gục giữ 1 khí huyết rồi hồi % khí huyết tối đa, mỗi trận một lần). */
  thien_dinh_cong: { name: 'Thiền Định Công', sect: 'thieu_lam', cat: 'noicong', grade: 'nhapmon', price: 50, elem: 'duong', maxLv: 100,
    type: 'passive', stats: { hp: 130, mp: 20, atk: 12, def: 18 }, statsUp: { hp: 15, mp: 10, atk: 2, def: 3 },
    desc: 'Tâm pháp nhập môn của Thiếu Lâm, tọa thiền định tâm, gốc rễ vững chắc. Luyện tới 100 tầng, mỗi 10 tầng lên một bậc.',
    tiers: {
      10: { name: 'Bậc 1', desc: 'Khí huyết tối đa +5%.', hpPct: 5 },
      20: { name: 'Bậc 2', desc: 'Thủ +5%.', defPct: 5 },
      30: { name: 'Bậc 3', desc: 'Lần đầu khí huyết xuống dưới 75%: hồi ngay 10% khí huyết tối đa.', gate75: 10 },
      40: { name: 'Bậc 4', desc: 'Khí huyết tối đa +5%.', hpPct: 5 },
      50: { name: 'Bậc 5', desc: 'Chiêu nộ +25% sát thương.', noUp: 25 },
      60: { name: 'Bậc 6', desc: 'Lần đầu khí huyết xuống dưới 50%: hồi ngay 10% khí huyết tối đa.', gate50: 10 },
      70: { name: 'Bậc 7', desc: 'Khí huyết tối đa +10%.', hpPct: 10 },
      80: { name: 'Bậc 8', desc: 'Thủ +5%.', defPct: 5 },
      90: { name: 'Bậc 9', desc: 'Lần đầu khí huyết xuống dưới 25%: hồi ngay 10% khí huyết tối đa.', gate25: 10 },
      100: { name: 'Bậc 10', desc: 'Bị đánh gục thì không chết, giữ lại 1 khí huyết rồi hồi ngay 20% khí huyết tối đa (mỗi trận một lần).', lastStand: 1, lastHeal: 20 } } },
  bac_minh_than_cong: { name: 'Bắc Minh Thần Công', cat: 'noicong', grade: 'tuyethoc', book: true, elem: 'thaicuc',
    type: 'passive', stats: { mp: 70, hp: 20, manasteal: 6 }, statsUp: { mp: 18, hp: 8, manasteal: 0.6 },
    desc: 'Nước trăm sông đổ về biển lớn. Hút nội lực của đối thủ làm của mình. Hư Trúc giữ tầng 70 Trấn Ma Tháp truyền lại.' },
  // ===== Phần 2 (sau phá đảo): võ công giang hồ bán ở các vùng mới =====
  phong_sa_dao: { name: 'Phong Sa Đao Pháp', cat: 'vocong', grade: 'thuongthua', price: 2600, elem: 'duong',
    mp: 18, type: 'attack', power: 0.85, up: 0.03, hits: 3, critBonus: 5,
    desc: 'Đao pháp của dân du mục Tây Vực, ba nhát liền như gió cát cuốn qua sa mạc.',
    fx: { kind: 'kiem', color: '#f2c27a' } },
  long_tuong_cong: { name: 'Long Tượng Bát Nhã Công', cat: 'noicong', grade: 'tuyethoc', book: true, elem: 'duong',
    type: 'passive', stats: { hp: 160, atk: 14, def: 6 }, statsUp: { hp: 40, atk: 3.5, def: 1.5 },
    desc: 'Nội công Mật Tông truyền từ Tây Tạng. Luyện đủ mười tầng, sức mạnh như rồng như voi. Kim Luân Pháp Vương giữ tầng 40 Trấn Ma Tháp truyền lại.' },
  phong_lang_kiem: { name: 'Phong Lãng Kiếm Pháp', cat: 'vocong', grade: 'thuongthua', price: 4200, elem: 'thaicuc',
    mp: 22, type: 'attack', power: 2.4, up: 0.12, critBonus: 5,
    desc: 'Kiếm pháp của thủy quân Tuyền Châu, mỗi nhát nặng như sóng lớn vỗ vào mạn thuyền.',
    fx: { kind: 'kiem', color: '#7fd0e8' } },
  thuy_thuong_phieu: { name: 'Thủy Thượng Phiêu', cat: 'khinhcong', grade: 'thuongthua', price: 3800,
    type: 'passive', stats: { spd: 7, dodge: 5, acc: 4 }, statsUp: { spd: 1.3, dodge: 0.9, acc: 0.6 },
    desc: 'Khinh công lướt trên mặt nước của ngư dân Đông Hải, người nhẹ như chiếc lá trôi.' },
  van_doc_thu: { name: 'Vạn Độc Thủ', cat: 'vocong', grade: 'thuongthua', price: 6000, elem: 'am',
    mp: 24, type: 'attack', power: 1.8, up: 0.09, effect: { type: 'poison', chance: 100, turns: 3, value: 0.5 },
    desc: 'Chưởng pháp tẩm độc của người Miêu, trúng phải thì độc ngấm vào máu.',
    fx: { kind: 'doc', color: '#9be35a' } },
  hoi_xuan_co: { name: 'Hồi Xuân Cổ Thuật', cat: 'congphap', grade: 'thuongthua', price: 6500, elem: 'am',
    mp: 30, type: 'heal', value: 26, up: 2.6,
    desc: 'Dùng cổ trùng lành tính chữa thương, thuật bí truyền của các cổ sư Miêu Cương chính phái. Cổ trùng chỉ sống trong chân khí âm nhu: phải mang nội công hệ Âm Nhu.',
    fx: { kind: 'hoi', color: '#b8f07a' } },
  han_bang_chuong: { name: 'Hàn Băng Miên Chưởng', cat: 'vocong', grade: 'thuongthua', price: 9000, elem: 'am',
    mp: 26, type: 'attack', power: 2.3, up: 0.12, effect: { type: 'stun', chance: 25, turns: 1 },
    desc: 'Chưởng pháp của Linh Thứu Cung, chưởng lực mềm như bông mà lạnh thấu xương, trúng phải tê cứng cả người.',
    fx: { kind: 'bang', color: '#cfe8ff' } },
  bang_tam_quyet: { name: 'Băng Tâm Quyết', cat: 'noicong', grade: 'thuongthua', price: 9500, elem: 'am',
    type: 'passive', stats: { mp: 90, hp: 120, critRes: 8 }, statsUp: { mp: 22, hp: 30, critRes: 0.8 },
    desc: 'Tâm pháp giữ lòng tĩnh như băng giữa gió tuyết Thiên Sơn. Nội lực dồi dào, khó bị đánh hiểm.' },
  hoa_son_kiem_phap: { name: 'Hoa Sơn Kiếm Pháp', cat: 'vocong', grade: 'thuongthua', price: 14000, elem: 'duong',
    mp: 30, type: 'attack', power: 1.0, up: 0.04, hits: 3, critBonus: 10,
    desc: 'Kiếm pháp chính tông của Hoa Sơn, ba thức liền như ba ngọn núi nối nhau.',
    fx: { kind: 'kiem', color: '#e0c8ff' } },
  tu_ha_cong: { name: 'Tử Hà Thần Công', cat: 'noicong', grade: 'thuongthua', price: 15000, elem: 'duong',
    type: 'passive', stats: { hp: 110, atk: 10, mp: 50 }, statsUp: { hp: 26, atk: 2.4, mp: 12 },
    desc: 'Nội công trấn sơn của Hoa Sơn. Luyện tới tầng cao, mặt tỏa ánh tím như ráng chiều.' },
  // Tuyệt học từ kỳ ngộ Phần 2
  ngu_nhac_kiem: { name: 'Ngũ Nhạc Kiếm Quyết', cat: 'vocong', grade: 'tuyethoc', book: true, elem: 'duong',
    mp: 36, type: 'attack', power: 0.6, up: 0.025, hits: 5, critBonus: 15,
    desc: 'Tinh hoa kiếm pháp năm phái Ngũ Nhạc khắc trên vách đá sau núi Hoa Sơn. Năm nhát kiếm như năm ngọn núi đổ xuống. Chỉ có được nhờ kỳ ngộ.',
    fx: { kind: 'cuu_kiem', color: '#e0c8ff' } },
  chiet_mai_thu: { name: 'Thiên Sơn Chiết Mai Thủ', cat: 'vocong', grade: 'tuyethoc', book: true, elem: 'am',
    mp: 32, type: 'attack', power: 0.9, up: 0.04, hits: 3, critBonus: 10, effect: { type: 'stun', chance: 20, turns: 1 },
    desc: 'Thủ pháp của Thiên Sơn Đồng Mỗ, ba chiêu như bẻ ba cành mai, chiêu nào cũng biến hóa theo đối thủ. Thiên Sơn Đồng Lão giữ tầng 20 Trấn Ma Tháp truyền lại.',
    fx: { kind: 'phat_chuong', color: '#ffd0e0' } },
  // immune: miễn nhiễm hiệu ứng khi đang mang (poison = không bị trúng độc)
  chu_cap_cong: { name: 'Chu Cáp Thần Công', cat: 'noicong', grade: 'tuyethoc', book: true, elem: 'am',
    type: 'passive', stats: { hp: 120, def: 6, critRes: 6 }, statsUp: { hp: 30, def: 1.5, critRes: 0.6 }, immune: ['poison'],
    desc: 'Nội công độc môn của Bạch Đà Sơn, luyện theo thế cóc ngồi. Mang môn nội công này thì bách độc bất xâm, không bao giờ trúng độc. Âu Dương Phong giữ tầng 10 Trấn Ma Tháp truyền lại.' },
  bich_hai_trieu_sinh: { name: 'Bích Hải Triều Sinh Khúc', cat: 'vocong', grade: 'tuyethoc', book: true, elem: 'thaicuc',
    mp: 26, type: 'attack', power: 1.3, up: 0.07, hits: 2, effect: { type: 'stun', chance: 35, turns: 1 },
    desc: 'Khúc tiêu học được trên một hòn đảo đầy hoa đào giữa biển Đông. Tiếng tiêu dồn dập như sóng triều, đối thủ nghe phải loạn tâm, đứng sững tại chỗ. Chỉ có được nhờ kỳ ngộ.',
    fx: { kind: 'thai_cuc', color: '#8fe0d0' } },
  kim_xa_kiem: { name: 'Kim Xà Kiếm Pháp', cat: 'vocong', grade: 'tuyethoc', book: true, elem: 'duong',
    mp: 28, type: 'attack', power: 0.75, up: 0.03, hits: 4, critBonus: 15,
    desc: 'Kiếm pháp của Kim Xà Lang Quân, giấu trong một hang đá giữa sa mạc. Bốn nhát kiếm uốn lượn như rắn vàng, hiểm hóc khôn lường. Chỉ có được nhờ kỳ ngộ.',
    fx: { kind: 'cuu_kiem', color: '#ffd24a' } },

  // Phản đòn: trong vài lượt, trả lại một phần sát thương nhận vào cho kẻ ra đòn
  can_khon_dai_na_di: { name: 'Càn Khôn Đại Na Di', cat: 'congphap', grade: 'tuyethoc', book: true, elem: 'duong',
    mp: 26, type: 'buff', buff: 'reflect', value: 25, up: 1.5, turns: 2,
    desc: 'Tâm pháp của Minh Giáo. Xoay chuyển chân khí, đòn của địch đánh vào mình lại dội ngược về. Trương Vô Kỵ giữ tầng 60 Trấn Ma Tháp truyền lại.',
    fx: { kind: 'thai_cuc', color: '#c9a8ff' } },
  // Hai công pháp mới của Thí Luyện Tháp (2026-10-28)
  di_hon_dai_phap: { name: 'Di Hồn Đại Pháp', cat: 'congphap', grade: 'tuyethoc', book: true, elem: 'am',
    mp: 26, type: 'buff', buff: 'dodge', value: 20, up: 2, turns: 2,
    also: [{ buff: 'crit', value: 10, up: 1 }],
    desc: 'Nhiếp hồn thuật trong Cửu Âm Chân Kinh: ánh mắt mê hoặc làm đối thủ đánh đâu trượt đó, còn mình ra đòn nhằm chỗ hiểm. Tăng né và bạo kích. Mai Siêu Phong giữ tầng 30 Trấn Ma Tháp truyền lại.',
    fx: { kind: 'hoi', color: '#b48cff' } },
  dau_chuyen_tinh_di: { name: 'Đẩu Chuyển Tinh Di', cat: 'congphap', grade: 'tuyethoc', book: true, elem: 'thaicuc',
    mp: 26, type: 'buff', buff: 'reflect', value: 15, up: 1, turns: 2,
    also: [{ buff: 'dodge', value: 15, up: 1.5 }],
    desc: 'Tuyệt kỹ Cô Tô Mộ Dung "dĩ bỉ chi đạo, hoàn thi bỉ thân": né đòn của địch rồi xoay chiêu ấy trả ngược về. Tăng né và phản đòn. Mộ Dung Phục giữ tầng 90 Trấn Ma Tháp truyền lại.',
    fx: { kind: 'thai_cuc', color: '#8fe0d0' } },
  thien_co_than_cong: { name: 'Thiên Cơ Thần Công', cat: 'noicong', grade: 'tuyethoc', book: true, elem: 'am',
    type: 'passive', stats: { atk: 12, hp: 100, crit: 5, critDmg: 10 }, statsUp: { atk: 2.6, hp: 24, crit: 0.5, critDmg: 2 },
    desc: 'Tổng Cương của Thiên Cơ Bảo Lục, hiện ra khi Huyết Ngọc hợp nhất trên tế đàn. Võ công mạnh nhất thiên hạ, nhưng đọc nó là bước một chân vào ma đạo.' },
  thai_huyen_kinh: { name: 'Thái Huyền Kinh', sect: 'vo_danh', cat: 'noicong', grade: 'tuyethoc', book: true, elem: 'thaicuc',
    type: 'passive', stats: { atk: 8, crit: 4, acc: 4, mp: 30, hp: 60 }, statsUp: { atk: 2.2, crit: 0.5, acc: 0.5, mp: 8, hp: 18 },
    desc: 'Bức khắc trong Thạch Động Vô Tự. Bao cao thủ đọc chữ cả đời không hiểu; chỉ kẻ bỏ chữ, nhìn nét mới ngộ ra. Riêng đường Vô Danh, có được nhờ kỳ ngộ.' },
};

/* ------------------------- MỐC TẦNG VÕ CÔNG ----------------------
   Luyện tới tầng 5 và tầng 10 thì mở thêm hiệu ứng, cộng dồn (tầng 10 có cả hiệu ứng tầng 5).
   Võ công Vô Danh ghi mốc tầng ngay trong SKILLS ở trên; các môn khác ghi ở đây.
   Mỗi phái một hướng, để có nhiều cách xây nhân vật:
     Thiếu Lâm: chống chịu + khống chế      Võ Đang: hút máu, nội lực, phản đòn
     Nga Mi: khống chế, hồi phục, né tránh   Cái Bang: sức mạnh, bạo kích, càng đánh càng lì
     Vô Danh: bạo kích                       Giang hồ / tuyệt học: mỗi môn một nét riêng
   Các trường dùng được:
   - Võ công (chiêu đánh):
       dmgUp: chiêu mạnh thêm %          pierce: bỏ qua % thủ của đối thủ
       execute: +% sát thương khi đối thủ dưới 30% máu
       vsStatus: +% sát thương khi đối thủ đang trúng độc, chảy máu hoặc choáng
       drain: +% hút máu                 critBonus / critDmg: +% bạo kích / sát thương bạo kích
       hits: thêm nhát                   lastCrit: nhát cuối chắc bạo kích
       critStun / critBleed: bạo kích làm choáng / chảy máu N lượt
       effect: thêm hiệu ứng mới cho chiêu, vd. { type: 'stun', chance: 15, turns: 1 }
       effChance / effTurns / effValue: hiệu ứng sẵn có của chiêu: +% xác suất / +lượt / độc mạnh thêm %
       mpCost: giảm % nội lực tiêu hao
   - Công pháp (hồi máu, tăng chỉ số):
       valueUp: tăng thêm giá trị        turns: thêm lượt
       cleanse: giải cả chảy máu         hot: mỗi lượt hồi thêm % khí huyết trong 3 lượt
       buff2: kèm hiệu ứng tăng thứ hai, vd. { buff: 'reflect', value: 15 }
   - Nội công, khinh công (đang mang thì có tác dụng):
       dmgReduce: giảm % sát thương nhận (tối đa 50)   thorns: dội ngược % sát thương nhận
       profUp: thành thạo võ học nhận được +%   expUp: kinh nghiệm nhận được +% (cộng vào Kinh nghiệm thêm)
       regen / mpRegen: đầu mỗi lượt hồi % khí huyết / nội lực tối đa
       dodgeHeal: né được thì hồi % khí huyết          dodgeCrit: né được thì đòn kế chắc bạo kích
       firstDodge: né chắc chiêu đầu của đối thủ mỗi trận
       dmgUp: mọi đòn mạnh thêm %        firstStrike: chiêu đầu mỗi trận mạnh thêm %
       lowHpAtk: khi dưới 30% máu, đòn mạnh thêm %     dotUp: độc, chảy máu mình gây ra mạnh thêm %
       stunResist: % kháng choáng        critMp / critHeal: bạo kích hồi % nội lực / hồi máu bằng % sát thương */
const SKILL_TIERS = {
  // ===== Thiếu Lâm: chống chịu + khống chế =====
  // weakAtk / weakCrit / weakAcc: đánh trúng thì đối thủ bị giảm % công, % bạo kích, % chính xác trong 2 lượt (đánh lại thì làm mới)
  // shieldPct: nhận giáp ảo bằng % sát thương vừa gây (đỡ sát thương tới khi vỡ)   healPct: hồi % khí huyết tối đa
  // hpBuff (công pháp): tăng % khí huyết tối đa trong thời gian hiệu lực   reduceBuff (công pháp): giảm % sát thương nhận vào trong thời gian hiệu lực
  la_han_quyen: {
    5: { name: 'La Hán Phục Hổ', desc: 'Đòn trúng làm đối thủ giảm 5% công và 5% bạo kích trong lượt tới của nó.', weakAtk: 5, weakCrit: 5 },
    10: { name: 'Thập Bát La Hán', desc: 'Giảm thêm 10% công và 5% bạo kích (tổng giảm 15% công, 10% bạo kích).', weakAtk: 10, weakCrit: 5 } },
  dai_luc_kim_cuong: {
    5: { name: 'Kim Cương Phá Khí', desc: 'Đòn trúng làm đối thủ giảm 10% công, 10% bạo kích và 10% chính xác trong lượt tới của nó.', weakAtk: 10, weakCrit: 10, weakAcc: 10 },
    10: { name: 'Kim Cương Hộ Thân', desc: 'Nhận giáp ảo bằng 20% sát thương gây ra (đỡ đòn trong lượt tới của đối thủ) và hồi 5% khí huyết tối đa.', shieldPct: 20, healPct: 5 } },
  kim_chung_trao: {
    5: { name: 'Kim Chung Hộ Mệnh', desc: 'Tăng thêm 10% khí huyết tối đa, kéo dài thêm 1 lượt.', hpBuff: 10, turns: 1 },
    10: { name: 'Kim Cương Bất Hoại', desc: 'Tăng thêm 20% khí huyết tối đa (tổng 30%), kéo dài thêm 1 lượt (tổng 4 lượt).', hpBuff: 20, turns: 1 } },
  nhat_vi_do_giang: {
    5: { name: 'Lướt Sóng', desc: 'Né được đòn thì hồi 4% khí huyết.', dodgeHeal: 4 },
    10: { name: 'Nhất Vĩ Độ Giang', desc: 'Chiêu đầu tiên mỗi trận mạnh thêm 30%.', firstStrike: 30 } },
  nhu_lai_than_chuong: {
    5: { name: 'Phật Quang Phổ Chiếu', desc: 'Đòn trúng làm đối thủ giảm 15% công, 15% bạo kích và 15% chính xác trong lượt tới của nó.', weakAtk: 15, weakCrit: 15, weakAcc: 15 },
    10: { name: 'Vạn Phật Triều Tông', desc: 'Nhận giáp ảo bằng 30% sát thương gây ra (đỡ đòn trong lượt tới của đối thủ) và hồi 7,5% khí huyết tối đa.', shieldPct: 30, healPct: 7.5 } },

  // ===== Võ Đang: hút máu, nội lực, phản đòn =====
  thai_cuc_kiem: {
    5: { name: 'Kiếm Ý Liên Miên', desc: 'Mở Liên Miên: mỗi lượt ra kiếm Võ Đang liên tiếp thêm 1 tầng, mỗi tầng +5% sát thương (tối đa 3 tầng). Ra chiêu tấn công khác hoặc bị choáng thì mất hết. Hút 10% sát thương thành khí huyết.', lmPct: 5, lmMax: 3, drain: 10 },
    10: { name: 'Liên Miên Bất Tuyệt', desc: 'Liên Miên tối đa 4 tầng (+20%), hút thêm 10% (tổng 20%).', lmMax: 1, drain: 10 } },
  luong_nghi_kiem: {
    5: { name: 'Lưỡng Nghi Tương Sinh', desc: 'Liên Miên mỗi tầng +8% sát thương (tối đa 4 tầng), hút thêm 10% (tổng 20%).', lmPct: 8, lmMax: 4, drain: 10 },
    10: { name: 'Lưỡng Nghi Hộ Thể', desc: 'Liên Miên tối đa 5 tầng (+40%), hút thêm 10% (tổng 30%). Máu đầy thì phần hút thừa thành giáp ảo, tối đa 20% khí huyết tối đa.', lmMax: 1, drain: 10, overDrain: 20 } },
  chan_vu_that_tiet: {
    5: { name: 'Chân Vũ Liên Hoàn', desc: 'Liên Miên mỗi tầng +10% sát thương (tối đa 5 tầng), hút thêm 10% (tổng 25%).', lmPct: 10, lmMax: 5, drain: 10 },
    10: { name: 'Thất Tiệt Quy Nguyên', desc: 'Liên Miên tối đa 6 tầng (+60%), hút thêm 5% (tổng 30%), hút thừa thành giáp ảo tối đa 20% khí huyết tối đa; nhát cuối chắc bạo kích, nội lực tiêu hao giảm 25%.', lmMax: 1, drain: 5, overDrain: 20, lastCrit: 1, mpCost: 25 } },
  thai_cuc_quyen: {
    5: { name: 'Tứ Lạng Bạt Thiên Cân', desc: 'Kéo dài thêm 1 lượt.', turns: 1 },
    10: { name: 'Tá Lực Đả Lực', desc: 'Phản đòn thêm 10%. Trong lúc hiệu lực, mỗi đòn đánh trúng mình thêm 1 tầng Liên Miên.', valueUp: 10, lm: 1 } },
  vo_cuc_hoi_nguyen: {
    5: { name: 'Âm Dương Điều Hòa', desc: 'Hồi máu giải cả độc lẫn chảy máu.', cleanse: 1 },
    10: { name: 'Vô Cực Sinh Thái Cực', desc: 'Sau khi hồi, mỗi lượt hồi thêm 6% khí huyết trong 3 lượt, kèm tăng thủ 20% trong 3 lượt.', hot: 6, buff2: { buff: 'def', value: 20 } } },
  thuan_duong: {
    5: { name: 'Thuần Dương Tụ Khí', desc: 'Mỗi lượt hồi thêm 3% nội lực và 2% khí huyết.', mpRegen: 3, regen: 2 },
    10: { name: 'Nhu Khắc Cương', desc: 'Dội ngược 20% sát thương nhận vào cho kẻ đánh, giảm 8% sát thương nhận.', thorns: 20, dmgReduce: 8 } },
  the_van_tung: {
    5: { name: 'Thê Vân', desc: 'Né được đòn thì hồi 5% khí huyết.', dodgeHeal: 5 },
    10: { name: 'Thang Mây', desc: 'Né được đòn thì đòn kế tiếp chắc bạo kích.', dodgeCrit: 1 } },

  // ===== Nga Mi: khống chế, hồi phục, né tránh =====
  // noiHeal / noiDef: mỗi tầng nội thương giảm % trị liệu và % thủ; noiN: số tầng mỗi nhát chém trúng (cộng dồn qua các mốc); noiMax: số tầng tối đa
  nga_mi_kiem: {
    5: { name: 'Kiếm Khí Thấu Mạch', desc: 'Mỗi nhát chém trúng gây 1 tầng nội thương (tối đa 8 tầng, giữ cả trận). Mỗi tầng giảm 5% trị liệu, hồi máu và 2% thủ của đối thủ (tối đa 40% và 16%).', noiHeal: 5, noiDef: 2, noiN: 1, noiMax: 8 },
    10: { name: 'Nga Mi Tam Thức', desc: 'Thêm nhát chém thứ 3, mỗi nhát gây 2 tầng nội thương.', hits: 1, noiN: 1 } },
  diet_tuyet_kiem: {
    5: { name: 'Tuyệt Mạch', desc: 'Mỗi nhát chém trúng gây 1 tầng nội thương (tối đa 12 tầng, giữ cả trận). Mỗi tầng giảm 5% trị liệu, hồi máu và 2% thủ của đối thủ (tối đa 60% và 24%).', noiHeal: 5, noiDef: 2, noiN: 1, noiMax: 12 },
    10: { name: 'Diệt Tuyệt Tứ Kiếm', desc: 'Thêm nhát chém thứ 4, mỗi nhát gây 2 tầng nội thương.', hits: 1, noiN: 1 } },
  that_sat_kiem: {
    5: { name: 'Sát Tinh Nhập Mạch', desc: 'Mỗi nhát chém trúng gây 1 tầng nội thương (tối đa 16 tầng, giữ cả trận). Mỗi tầng giảm 5% trị liệu, hồi máu và 2% thủ của đối thủ (tối đa 80% và 32%).', noiHeal: 5, noiDef: 2, noiN: 1, noiMax: 16 },
    10: { name: 'Thất Sát Liên Hoàn', desc: 'Chém thêm ngẫu nhiên: 50% thêm 1 nhát, 30% thêm 2 nhát, 20% thêm 3 nhát. Mỗi nhát thêm hồi 3% nội lực tối đa.', randHits: 1, hitMp: 3 } },
  phat_quang: {
    5: { name: 'Phật Quang Tăng Lực', desc: 'Tăng thêm 10% nội lực tối đa, mỗi lượt hồi 5% khí huyết tối đa trong thời gian hiệu lực, kéo dài thêm 1 lượt.', mpBuff: 10, hotBuff: 5, turns: 1 },
    10: { name: 'Phật Quang Phổ Độ', desc: 'Nội lực tối đa +20%, mỗi lượt hồi 10% khí huyết tối đa (thay mức tầng 5), kéo dài thêm 1 lượt (tổng 4 lượt).', mpBuff: 10, hotBuff: 5, turns: 1 } },
  cuu_am_chan_kinh: {
    5: { name: 'Cửu Âm Bạch Cốt', desc: 'Võ công Âm Nhu sát thương +20%; đối thủ dưới 75% khí huyết thêm 10%, dưới 50% thêm 10%, dưới 25% thêm 10% nữa (tổng tối đa 50%).', amUp: 20, amLowHp: 10 },
    10: { name: 'Cửu Âm Đại Thành', desc: 'Mỗi lượt hồi 5% nội lực tối đa. Dùng nội lực đỡ sát thương (cả đòn đánh, phản đòn, độc, chảy máu): 70% trừ vào nội lực, 30% trừ vào khí huyết. Nội lực còn dưới 10% thì không đỡ được nữa.', mpRegen: 5, manaShield: 70 } },
  phieu_tuyet_bo: {
    5: { name: 'Đạp Tuyết Vô Ngân', desc: 'Né được đòn thì hồi 5% khí huyết.', dodgeHeal: 5 },
    10: { name: 'Phiêu Tuyết', desc: 'Chiêu đầu của đối thủ mỗi trận chắc chắn né.', firstDodge: 1 } },

  // ===== Cái Bang: gậy làm vấp ngã + chảy máu, đánh kẻ đã bị thương mạnh dần; càng đánh càng lì =====
  da_cau_bong: {
    5: { name: 'Phách Tự Quyết', desc: 'Bạo kích gây chảy máu 2 lượt.', critBleed: 2 },
    10: { name: 'Bán Tự Quyết', desc: 'Đòn trúng có 15% làm đối thủ vấp ngã (choáng 1 lượt); đánh kẻ đang chảy máu, choáng hoặc trúng độc +20% sát thương.', effect: { type: 'stun', chance: 15, turns: 1 }, vsStatus: 20 } },
  da_cau_bat_quyet: {
    5: { name: 'Triền Tự Quyết', desc: 'Bạo kích gây chảy máu 3 lượt; đánh kẻ đang chảy máu, choáng hoặc trúng độc +20% sát thương.', critBleed: 3, vsStatus: 20 },
    10: { name: 'Phong Tự Quyết', desc: 'Thêm nhát thứ 4; đòn trúng có 20% làm đối thủ vấp ngã (choáng 1 lượt).', hits: 1, effect: { type: 'stun', chance: 20, turns: 1 } } },
  thien_ha_vo_cau: {
    5: { name: 'Chuyển Tự Quyết', desc: 'Bạo kích gây chảy máu 3 lượt; đánh kẻ đang chảy máu, choáng hoặc trúng độc +30% sát thương.', critBleed: 3, vsStatus: 30 },
    10: { name: 'Thiên Hạ Vô Cẩu', desc: 'Thêm nhát thứ 5; bạo kích làm đối thủ ngã choáng 1 lượt; đánh kẻ đã bị thương thêm +20% (tổng +50%).', hits: 1, critStun: 1, vsStatus: 20 } },
  tuy_quyen: {
    5: { name: 'Túy Bát Tiên', desc: 'Kèm tăng né 10%, kéo dài thêm 1 lượt.', buff2: { buff: 'dodge', value: 10 }, turns: 1 },
    10: { name: 'Túy Tiên Vọng Nguyệt', desc: 'Tăng công thêm 8%, kéo dài thêm 1 lượt (tổng 5 lượt).', turns: 1, valueUp: 8 } },
  hang_long: {
    5: { name: 'Kiến Long Tại Điền', desc: 'Bỏ qua 25% thủ của đối thủ.', pierce: 25 },
    10: { name: 'Phi Long Tại Thiên', desc: 'Bạo kích +15%, đối thủ dưới 30% máu thì +50% sát thương.', critBonus: 15, execute: 50 } },
  hon_nguyen_cong: {
    5: { name: 'Hỗn Nguyên Nhất Khí', desc: 'Dưới 30% khí huyết thì mọi đòn mạnh thêm 30%; chảy máu và độc mình gây ra mạnh thêm 30%.', lowHpAtk: 30, dotUp: 30 },
    10: { name: 'Càng Đánh Càng Lì', desc: 'Mỗi đòn bạo kích hồi khí huyết bằng 15% sát thương; giảm 8% sát thương nhận vào.', critHeal: 15, dmgReduce: 8 } },
  tieu_dao_du: {
    5: { name: 'Túy Bộ', desc: 'Né được đòn thì đòn kế tiếp chắc bạo kích.', dodgeCrit: 1 },
    10: { name: 'Tiêu Dao', desc: 'Né được đòn thì hồi 6% khí huyết.', dodgeHeal: 6 } },
  khang_long: {
    5: { name: 'Long Ngâm', desc: 'Sát thương bạo kích +20%.', critDmg: 20 },
    10: { name: 'Kháng Long Hữu Hối', desc: 'Bạo kích +20%, bạo kích làm choáng 1 lượt.', critBonus: 20, critStun: 1 } },

  // ===== Vô Danh: trấn phái =====
  vo_danh_kiem_y: {
    // sohoBurst: tiêu hết Sơ hở (do Vô Danh Kiếm Pháp tầng 5 chồng lên) trên đối thủ, mỗi tầng +% sát thương chiêu này
    5: { name: 'Kiếm Ý Vô Hình', desc: 'Bỏ qua 30% thủ của đối thủ. Tiêu hết Sơ hở trên đối thủ, mỗi tầng Sơ hở làm chiêu này mạnh thêm 8%.', pierce: 30, sohoBurst: 8, fx: { kind: 'vdky5', color: '#ffd24a' } },
    10: { name: 'Vô Danh Đại Thành', desc: 'Sát thương bạo kích +40%, đối thủ dưới 30% máu thì +40% sát thương.', critDmg: 40, execute: 40, fx: { kind: 'vdky10', color: '#ffd24a' } } },

  // ===== Giang hồ =====
  // Thái Tổ Trường Quyền, Tiểu Miên Chưởng, Lưỡng Nghi Côn (võ công của quái): không có mốc tầng (người dùng chốt 2026-10-27)
  // Nội công của quái (người dùng chốt 2026-10-27): mốc tầng tăng % chỉ số (atkPct / defPct / spdPct), cộng dồn
  tho_nap_phap: {
    5: { name: 'Điều Tức', desc: 'Tốc độ +10%.', spdPct: 10 },
    10: { name: 'Thổ Nạp Hồi Nguyên', desc: 'Tốc độ thêm +10% (tổng 20%).', spdPct: 10 } },
  thiet_bo_sam: {
    5: { name: 'Đồng Bì', desc: 'Thêm 1 lượt.', turns: 1 },
    10: { name: 'Thiết Cốt', desc: 'Kèm Phản đòn 5% trong cùng số lượt.', buff2: { buff: 'reflect', value: 5 } } },
  lieu_thuong: {
    // healNow: hồi ngay % khí huyết tối đa khi vận công pháp
    5: { name: 'Thông Kinh Lạc', desc: 'Thêm 1 lượt.', turns: 1 },
    10: { name: 'Khí Tụ Đan Điền', desc: 'Vận công xong hồi ngay 5% khí huyết tối đa.', healNow: 5 } },
  bat_bo_can_thien: {
    5: { name: 'Bát Bộ', desc: 'Né được đòn thì hồi 3% khí huyết.', dodgeHeal: 3 },
    10: { name: 'Cản Thiền', desc: 'Chiêu đầu tiên mỗi trận mạnh thêm 20%.', firstStrike: 20 } },
  hon_nguyen_khi_cong: {
    5: { name: 'Khí Quán Tứ Chi', desc: 'Thủ +5%.', defPct: 5 },
    10: { name: 'Hỗn Nguyên Hộ Thể', desc: 'Thủ thêm +5% (tổng 10%).', defPct: 5 } },
  am_phong_tam_phap: {
    5: { name: 'Âm Phong Điều Tức', desc: 'Công +5%.', atkPct: 5 },
    10: { name: 'Âm Phong Thấu Cốt', desc: 'Công thêm +5% (tổng 10%).', atkPct: 5 } },
  tinh_tam_quyet: {
    5: { name: 'Tâm Như Chỉ Thủy', desc: 'Thêm 1 lượt.', turns: 1 },
    10: { name: 'Minh Tâm Kiến Tính', desc: 'Kèm Bạo kích +5% trong cùng số lượt.', buff2: { buff: 'crit', value: 5 } } },
  yen_tu_phi: {
    5: { name: 'Yến Lược', desc: 'Chiêu đầu tiên mỗi trận mạnh thêm 15%.', firstStrike: 15 },
    10: { name: 'Yến Hồi', desc: 'Né được đòn thì hồi 3% khí huyết.', dodgeHeal: 3 } },
  thao_thuong_phi: {
    5: { name: 'Lướt Cỏ', desc: 'Né được đòn thì hồi 2% khí huyết.', dodgeHeal: 2 },
    10: { name: 'Vô Ảnh', desc: 'Giảm 5% sát thương nhận vào.', dmgReduce: 5 } },
  phong_sa_dao: {
    5: { name: 'Cát Bay Đá Chạy', desc: 'Chiêu trúng có 35% làm đối thủ chảy máu 2 lượt.', effect: { type: 'bleed', chance: 35, turns: 2, value: 0.3 } },
    10: { name: 'Bão Cát', desc: 'Bỏ qua 25% thủ, đánh kẻ đang chảy máu/độc/choáng +25% sát thương.', pierce: 25, vsStatus: 25 } },
  long_tuong_cong: {
    5: { name: 'Long Lực', desc: 'Chảy máu và độc do mình gây ra mạnh thêm 40%.', dotUp: 40 },
    10: { name: 'Tượng Lực', desc: 'Mọi đòn mạnh thêm 8%.', dmgUp: 8 } },
  phong_lang_kiem: {
    5: { name: 'Sóng Dữ', desc: 'Bỏ qua 20% thủ của đối thủ.', pierce: 20 },
    10: { name: 'Cuồng Lan', desc: 'Đối thủ dưới 30% máu thì +50% sát thương.', execute: 50 } },
  thuy_thuong_phieu: {
    5: { name: 'Lướt Trên Sóng', desc: 'Chiêu đầu tiên mỗi trận mạnh thêm 25%.', firstStrike: 25 },
    10: { name: 'Thủy Thượng Phiêu', desc: 'Né được đòn thì đòn kế tiếp chắc bạo kích.', dodgeCrit: 1 } },
  van_doc_thu: {
    5: { name: 'Độc Ngấm Tận Xương', desc: 'Độc mạnh thêm 40%.', effValue: 40 },
    10: { name: 'Vạn Độc Công Tâm', desc: 'Độc kéo dài thêm 1 lượt, đánh kẻ đang trúng độc +30% sát thương.', effTurns: 1, vsStatus: 30 } },
  hoi_xuan_co: {
    5: { name: 'Cổ Trùng Giải Độc', desc: 'Hồi máu giải cả độc lẫn chảy máu.', cleanse: 1 },
    10: { name: 'Hồi Xuân', desc: 'Sau khi hồi, mỗi lượt hồi thêm 6% khí huyết trong 3 lượt.', hot: 6 } },
  han_bang_chuong: {
    5: { name: 'Hàn Khí Thấu Cốt', desc: 'Đánh kẻ đang choáng/độc/chảy máu +25% sát thương.', vsStatus: 25 },
    10: { name: 'Băng Phong Vạn Lý', desc: 'Choáng thêm 10% (thành 35%), bỏ qua 15% thủ.', effChance: 10, pierce: 15 } },
  bang_tam_quyet: {
    5: { name: 'Băng Tâm', desc: '50% kháng choáng.', stunResist: 50 },
    10: { name: 'Tâm Như Chỉ Thủy', desc: 'Mỗi lượt hồi thêm 4% nội lực, giảm 6% sát thương nhận vào.', mpRegen: 4, dmgReduce: 6 } },
  hoa_son_kiem_phap: {
    5: { name: 'Hữu Phượng Lai Nghi', desc: 'Bạo kích gây chảy máu 2 lượt.', critBleed: 2 },
    10: { name: 'Thương Tùng Nghênh Khách', desc: 'Sát thương bạo kích +25%.', critDmg: 25 } },
  tu_ha_cong: {
    5: { name: 'Tử Khí Đông Lai', desc: 'Mọi đòn mạnh thêm 5%.', dmgUp: 5 },
    10: { name: 'Tử Hà Hộ Thể', desc: 'Dưới 30% máu thì mọi đòn mạnh thêm 25%.', lowHpAtk: 25 } },

  // ===== Tuyệt học =====
  lang_ba_vi_bo: {
    5: { name: 'Lăng Ba', desc: 'Né được đòn thì hồi 6% khí huyết và đòn kế tiếp chắc bạo kích.', dodgeHeal: 6, dodgeCrit: 1 },
    10: { name: 'Vi Bộ Sinh Trần', desc: 'Né chắc chiêu đầu của đối thủ mỗi trận, giảm 10% sát thương nhận vào.', firstDodge: 1, dmgReduce: 10 } },
  di_hon_dai_phap: {
    5: { name: 'Nhiếp Hồn', desc: 'Kéo dài thêm 1 lượt.', turns: 1 },
    10: { name: 'Di Hồn Đoạt Phách', desc: 'Kèm giảm 15% sát thương nhận vào trong cùng số lượt.', buff2: { buff: 'reduce', value: 15 } } },
  dau_chuyen_tinh_di: {
    5: { name: 'Hoán Đẩu', desc: 'Kéo dài thêm 1 lượt.', turns: 1 },
    10: { name: 'Dĩ Bỉ Chi Đạo', desc: 'Phản đòn mạnh thêm 10%, kèm tăng công 15% trong cùng số lượt.', valueUp: 10, buff2: { buff: 'atk', value: 15 } } },
  ngu_doc_chuong: {
    5: { name: 'Ngũ Độc Thấu Cốt', desc: 'Độc mạnh thêm 60%, kéo dài thêm 1 lượt.', effValue: 60, effTurns: 1 },
    10: { name: 'Vạn Độc Quy Tông', desc: 'Đánh kẻ đang trúng độc +40% sát thương.', vsStatus: 40 } },
  // breakBuff (Phá Chiêu): trước khi đánh, xóa mọi hiệu ứng tăng đang có của đối thủ (tăng chỉ số, phản đòn, giáp ảo);
  //   mỗi hiệu ứng xóa được thì chiêu mạnh thêm breakBuff %, tính tối đa 3 cái
  doc_co_cuu_kiem: {
    5: { name: 'Phá Kiếm Thức', desc: 'Bỏ qua 30% thủ của đối thủ.', pierce: 30 },
    10: { name: 'Vô Chiêu Thắng Hữu Chiêu', desc: 'Phá Chiêu: xóa mọi hiệu ứng tăng đang có của đối thủ (tăng chỉ số, phản đòn, giáp ảo), mỗi cái xóa được chiêu mạnh thêm 25% (tối đa 75%).', breakBuff: 25 } },
  thien_son_luc_duong: {
    5: { name: 'Lục Dương Hàn Khí', desc: 'Đánh kẻ đang choáng/độc/chảy máu +30% sát thương.', vsStatus: 30 },
    10: { name: 'Sinh Tử Phù', desc: 'Choáng thêm 10% (thành 40%), sát thương +10%.', effChance: 10, dmgUp: 10 } },
  cuu_duong_than_cong: {
    5: { name: 'Cửu Dương Hộ Thể', desc: 'Giảm 10% sát thương nhận vào. Khí huyết dưới 75% giảm thêm 5%, dưới 50% thêm 5%, dưới 25% thêm 10% (dưới 25% tổng cộng giảm 26%). Mỗi lượt hồi 2% nội lực.', dmgReduce: 6, lowHpReduce: 1, mpRegen: 2 },
    10: { name: 'Cửu Dương Bất Diệt', desc: 'Mỗi lượt hồi 5% khí huyết. Trúng đòn chí mạng (bất kể chiêu, đánh thường, độc hay chảy máu) thì không chết mà còn lại 1 khí huyết (mỗi trận một lần).', regen: 5, lastStand: 1 } },
  bac_minh_than_cong: {
    5: { name: 'Bắc Minh Hấp Thủy', desc: 'Mỗi lượt hồi thêm 4% nội lực.', mpRegen: 4 },
    10: { name: 'Trăm Sông Về Biển', desc: 'Mỗi đòn bạo kích hồi khí huyết bằng 10% sát thương và 6% nội lực.', critHeal: 10, critMp: 6 } },
  ngu_nhac_kiem: {
    5: { name: 'Ngũ Nhạc Quy Nhất', desc: 'Bạo kích gây chảy máu 2 lượt.', critBleed: 2 },
    10: { name: 'Ngũ Phong Đồng Áp', desc: 'Nhát cuối chắc bạo kích.', lastCrit: 1 } },
  chiet_mai_thu: {
    5: { name: 'Chiết Mai', desc: 'Choáng thêm 10% (thành 30%).', effChance: 10 },
    10: { name: 'Thiên Sơn Đồng Mỗ', desc: 'Đánh kẻ đang choáng/độc/chảy máu +30% sát thương.', vsStatus: 30 } },
  chu_cap_cong: {
    5: { name: 'Chu Cáp Độc Đan', desc: 'Dội ngược 10% sát thương nhận vào cho kẻ đánh; độc và chảy máu do mình gây ra mạnh thêm 30%.', thorns: 10, dotUp: 30 },
    10: { name: 'Vạn Độc Bất Xâm', desc: 'Giảm 8% sát thương nhận vào.', dmgReduce: 8 } },
  bich_hai_trieu_sinh: {
    5: { name: 'Loạn Tâm', desc: 'Tiếng tiêu làm đối thủ rối trí: giảm 15% chính xác và 10% bạo kích trong lượt tới của nó.', weakAcc: 15, weakCrit: 10 },
    10: { name: 'Bích Hải Triều Sinh', desc: 'Choáng thêm 10% (thành 45%), đánh kẻ đang choáng/độc/chảy máu +30% sát thương.', effChance: 10, vsStatus: 30 } },
  kim_xa_kiem: {
    5: { name: 'Kim Xà Thổ Tín', desc: 'Bạo kích gây chảy máu 3 lượt.', critBleed: 3 },
    10: { name: 'Kim Xà Vạn Biến', desc: 'Bỏ qua 30% thủ, sát thương bạo kích +20%.', pierce: 30, critDmg: 20 } },
  can_khon_dai_na_di: {
    5: { name: 'Càn Khôn Na Di', desc: 'Phản đòn mạnh thêm 10%.', valueUp: 10 },
    10: { name: 'Đại Na Di', desc: 'Thêm 1 lượt, kèm Tăng thủ 20%.', turns: 1, buff2: { buff: 'def', value: 20 } } },
  thien_co_than_cong: {
    5: { name: 'Thiên Cơ', desc: 'Mọi đòn mạnh thêm 8%.', dmgUp: 8 },
    10: { name: 'Thiên Cơ Vô Song', desc: 'Bạo kích hồi máu bằng 8% sát thương; dưới 30% máu thì mọi đòn mạnh thêm 25%.', critHeal: 8, lowHpAtk: 25 } },
  thai_huyen_kinh: {
    5: { name: 'Thái Huyền', desc: 'Né được đòn thì đòn kế tiếp chắc chắn bạo kích.', dodgeCrit: 1 },
    10: { name: 'Hiệp Khách Hành', desc: 'Mọi đòn mạnh thêm 12%, chiêu đầu mỗi trận mạnh thêm 40%.', dmgUp: 12, firstStrike: 40 } },
};
// Gắn mốc tầng vào võ công (môn nào đã có tiers riêng thì giữ nguyên)
Object.entries(SKILL_TIERS).forEach(([id, t]) => { if (SKILLS[id] && !SKILLS[id].tiers) SKILLS[id].tiers = t; });

// Võ giang hồ đã bỏ (người dùng chốt 2026-10-28 "chắt lọc võ học"): võ giang hồ chỉ còn 10 tuyệt học của Thí Luyện Tháp
// (thap.js THAP.masters); Võ Quán Giang Hồ cũng bỏ. Các môn dưới đây giữ dữ liệu nhưng không học, không mang được,
// bản lưu cũ bị gỡ (loadPlayer), giang hồ khách Vận tiêu cũng không dùng.
const SKILL_CUT = ['khang_long', 'ngu_doc_chuong', 'thien_son_luc_duong', 'phong_sa_dao', 'phong_lang_kiem', 'thuy_thuong_phieu',
  'van_doc_thu', 'hoi_xuan_co', 'han_bang_chuong', 'bang_tam_quyet', 'hoa_son_kiem_phap', 'tu_ha_cong', 'ngu_nhac_kiem',
  'bich_hai_trieu_sinh', 'kim_xa_kiem', 'thien_co_than_cong',
  'bat_bo_can_thien', 'yen_tu_phi', 'thao_thuong_phi']; // 3 khinh công Võ Quán (bỏ cùng Võ Quán, người dùng chốt 2026-10-28)
SKILL_CUT.forEach(id => { if (SKILLS[id]) SKILLS[id].cut = true; });

// Nội lực võ học 4 phái (người dùng chốt 2026-10-28): cố định theo loại + phẩm chất, = gốc + thêm × (tầng − 1),
// không tăng theo cấp nhân vật. Ghi đè mp trong từng môn ở trên.
const SECT_MP = {
  congphap: [15, 5],                                                   // mọi công pháp phái
  vocong: { nhapmon: [5, 2], thuongthua: [10, 3], tuyethoc: [15, 4] }, // võ công theo phẩm chất
};
Object.values(SKILLS).forEach(s => {
  if (!['thieu_lam', 'vo_dang', 'nga_mi', 'cai_bang'].includes(s.sect)) return;
  const m = s.cat === 'congphap' ? SECT_MP.congphap : s.cat === 'vocong' ? SECT_MP.vocong[s.grade] : null;
  if (m) { s.mp = m[0]; s.mpTier = m[1]; }
});

/* ------------------------- BỘ VÕ -------------------------
   Võ học theo bộ (người dùng chốt 2026-11-01 / 11-02): mỗi bộ 2 chiêu đánh, 1 phụ trợ, 1 bị động, 1 chiêu nộ.
   Mang 1 bộ (P.bo) cùng nội công, khinh công và Vô Danh Quyền; võ công, công pháp lẻ vẫn mang như cũ.
   Thành thạo theo từng chiêu. Mở chiêu bằng req: đánh 1 tầng 5 → đánh 2, đánh 1 tầng 10 → phụ trợ,
   đánh 2 tầng 5 → bị động, đánh 2 tầng 10 → nộ. Học chiêu đánh 1 ở Tàng Kinh Các là nhận cả bộ (chiêu sau khóa tới khi đủ tầng).
   Nộ: tối đa BO_NO.max, chỉ tăng khi mình gây sát thương = sát thương ÷ khí huyết tối đa × 100, mỗi chiêu tối đa BO_NO.cap;
   bị đánh, hết hiệp không lên; hết trận về 0; chiêu nộ không tốn nội lực, dùng xong nộ về 0. */
const BO_NO = { max: 100, cap: 50 };
const BO_ROLES = { danh1: 'Chiêu đánh 1', danh2: 'Chiêu đánh 2', phutro: 'Phụ trợ', bidong: 'Bị động', no: 'Chiêu nộ' };
const BO_VO = {
  /* Hàng Long Chưởng Pháp (người dùng chốt 2026-11-02): xoay quanh điểm Cuồng Long, tích trong trận, ra chiêu không tiêu,
     hết trận về 0. Tối đa 10 (Giao Long nâng lên). Điểm càng nhiều thì 2 chiêu đánh và chiêu nộ càng dễ bạo kích. */
  // diem: thanh điểm riêng của bộ hiện cuối bảng tên trong trận (tên, hai màu); bộ không có điểm thì bỏ trống
  hang_long: { name: 'Hàng Long Chưởng Pháp', elem: 'duong', diem: { name: 'Cuồng Long', color: ['#c9a227', '#ffe27a'], tip: 'càng nhiều càng dễ bạo kích' },
    roles: { danh1: 'hl_song_long', danh2: 'hl_long_tieu', phutro: 'hl_chien_long', bidong: 'hl_giao_long', no: 'hl_cuong_long' },
    desc: 'Chưởng pháp giáng long, càng đánh long khí càng cuồng. Song Long và Chiến Long tích điểm Cuồng Long; mốc tầng của từng chiêu biến điểm thành bạo kích, sát thương bạo.',
    // (giao: tác dụng bị động Giao Long cũ; ô Hư đã bỏ 2026-11-07 nên không còn dùng, tác dụng chuyển vào mốc tầng 5 / 10 của từng chiêu)
    // Giao Long Phiên Giang: tầng nào mở thêm cái đó, giữ các tầng trước (tầng 7 thay tầng 3); engine đọc số ở clRule()
    giao: [
      'Mỗi lần ra chiêu (chiêu gì cũng được) +1 Cuồng Long',
      'Cuồng Long tối đa 15',
      'Mỗi điểm Cuồng Long +1% bạo kích cho Song Long, Long Tiếu, Cuồng Long Loạn Vũ',
      'Cuồng Long tối đa 20',
      'Mỗi lần bị tấn công +1 Cuồng Long',
      'Cuồng Long tối đa 25',
      'Mỗi điểm Cuồng Long +2% bạo kích cho 3 chiêu trên (thay tầng 3)',
      'Mỗi điểm Cuồng Long +1% sát thương và +1% sát thương bạo cho Long Tiếu Cửu Thiên',
      'Mỗi điểm Cuồng Long +2% sát thương và +2% sát thương bạo cho Cuồng Long Loạn Vũ',
      'Cuồng Long Loạn Vũ đánh thêm một kẻ địch ngẫu nhiên khác trên sân, đủ sát thương',
    ] },
  /* Như Lai Thần Chưởng (người dùng thiết kế 2026-11-02, bảng tính tab "Như Lai Thần Chưởng"): xoay quanh điểm Phật Ấn,
     tối đa 10, chỉ tích bằng chiêu đánh 1 (trúng +1, bạo kích +2) và né đòn (bị động tầng 4); ra chiêu không tiêu, hết trận về 0.
     Thiên chống chịu: Phật Ấn giảm sát thương nhận vào, hồi máu, giáp ảo. Số của bị động ở NL_RULE trong engine. */
  nhu_lai: { name: 'Như Lai Thần Chưởng', elem: 'duong', diem: { name: 'Phật Ấn', color: ['#d98a1c', '#ffe9a8'], tip: 'càng nhiều càng chống chịu tốt' },
    roles: { danh1: 'nl_so_hien', danh2: 'nl_son_ha', phutro: 'nl_pho_chieu', bidong: 'nl_vo_bien', no: 'nl_trieu_tong' },
    desc: 'Phật pháp vô biên, càng đánh Phật Ấn càng dày. Phật Quang Sơ Hiện tích Phật Ấn; mốc tầng của từng chiêu biến Phật Ấn thành hồi máu, giảm sát thương, sức chưởng.',
    // (giao: tác dụng bị động Phật Pháp Vô Biên cũ; ô Hư đã bỏ nên không còn dùng)
    giao: [
      'Thủ +2%',
      'Khí huyết tối đa +2%',
      'Mỗi tầng Phật Ấn giảm 2% sát thương nhận vào',
      'Né được đòn thì +1 Phật Ấn',
      'Thủ +3% (cộng tầng 1 thành +5%)',
      'Phật Động Sơn Hà: mỗi tầng Phật Ấn +5% cơ hội hồi máu, lượng hồi từ 5% lên 10% khí huyết tối đa',
      'Khí huyết tối đa +3% (cộng tầng 2 thành +5%)',
      'Mỗi tầng Phật Ấn giảm thêm 1% sát thương nhận vào (cộng tầng 3 thành 3% mỗi tầng, 10 tầng giảm 30%)',
      'Đầu lượt sau, giáp ảo còn thừa đổi thành nội lực (2 giáp ảo ra 1 nội lực)',
      'Vạn Phật Triều Tông lan sang tối đa 3 kẻ địch đứng sát mục tiêu, mỗi kẻ nhận 30% sát thương',
    ] },
  /* Đại Nhật Thần Chưởng (người dùng chốt 2026-11-09): Trấn Phái đường Chưởng. Không có điểm riêng trên người chơi (không có diem):
     điểm Dương Viêm nằm trên người địch, số luật ở DV_RULE trong engine. Không có chiêu bị động (ô Hư đã bỏ). */
  dai_nhat: { name: 'Đại Nhật Thần Chưởng', elem: 'duong',
    roles: { danh1: 'dn_nhat_xuat', danh2: 'dn_liet_nhat', phutro: 'dn_cuu_nhat', no: 'dn_phan_thien' },
    desc: 'Chưởng như mặt trời. Rải Dương Viêm lên địch, lửa đốt mỗi lượt bỏ qua thủ; đầy nộ thì kích nổ toàn bộ lửa.' },
  /* Tâm Phật Chưởng (người dùng đặt tên 2026-11-05, Claude đề xuất số, người dùng chốt "dùng như đề xuất"): bộ nhập môn đường Chưởng
     Thanh Vân Môn, sư phụ Phổ Trí truyền khi đỗ ngoại môn (tvTurnIn / tvDuel trong mon_phai.js). Tinh thần "nhẫn rồi bộc phát":
     điểm Tâm Lực tích khi trúng chưởng, khi chịu đòn, khi vận Minh Vương Ấn; Bồ Tát Ấn tiêu hết để dồn sức. Số bị động ở TP_RULE (engine). */
  // Người dùng chỉnh số trong Google Sheet tab "Tâm Phật Chưởng" (2026-11-05): Tâm Lực không giới hạn, phản đòn theo Tâm Lực, Lôi Âm hút máu
  tam_phat: { name: 'Tâm Phật Chưởng', elem: 'duong', diem: { name: 'Tâm Lực', color: ['#b3261e', '#ffb07a'], tip: 'không giới hạn, tích khi chịu đòn, Bồ Tát Ấn tiêu hết để bộc phát' },
    roles: { danh1: 'tp_khong_tuong', danh2: 'tp_bo_tat_an', phutro: 'tp_minh_vuong', bidong: 'tp_tich_diet', no: 'tp_loi_am' },
    desc: 'Chưởng pháp nhập môn của đường Chưởng. Nhẫn rồi bộc phát: tích Tâm Lực (không giới hạn) khi ra chưởng, khi chịu đòn, rồi dồn hết vào Bồ Tát Ấn.',
    giao: [
      'Bị đánh trúng thì +1 Tâm Lực',
      'Thủ +5%',
      'Mỗi điểm Tâm Lực phản 1% sát thương nhận vào cho kẻ đánh',
      'Không có tác dụng (đã bỏ khi làm lại Bồ Tát Ấn)',
      'Mỗi điểm Tâm Lực đang có giảm 1% sát thương nhận vào',
      'Khí huyết tối đa +5%',
      'Mỗi điểm Tâm Lực phản 2% sát thương nhận vào cho kẻ đánh (thay tầng 3)',
      'Không có tác dụng (đã bỏ khi làm lại Bồ Tát Ấn)',
      'Thiên Cổ Lôi Âm tiêu hết Tâm Lực, mỗi điểm +15% sát thương',
      'Thiên Cổ Lôi Âm hồi khí huyết bằng 10% sát thương gây ra',
    ] },
};
// Các chiêu của bộ là võ học thường trong SKILLS (có bo: mã bộ) để dùng chung thành thạo, nội lực, hiệu ứng.
// Chỉ chiêu đánh 1 có sect (bán ở Tàng Kinh Các, giá lệnh bài theo phẩm chất).
Object.assign(SKILLS, {
  // Phẩm chất Thượng thừa cả bộ (người dùng chốt 2026-11-07; trước là Tuyệt học)
  hl_song_long: { name: 'Song Long Xuất Hải', kieu: 'quyen', bo: 'hang_long', sect: 'cai_bang', cat: 'vocong', grade: 'thuongthua', price: 600, elem: 'duong',
    // người dùng chốt 2026-11-07: 150%, mỗi tầng +3%, tầng 10 +6% → 180%; mốc tầng nâng giới hạn Cuồng Long (thay Giao Long đã bỏ cùng ô Hư)
    mp: 15, mpTier: 4, type: 'attack', power: 1.5, up: 0.03, upAt: { 10: 0.06 }, hits: 2, hitSplit: [0.5, 0.5], clHit: true,
    desc: 'Hai rồng vàng, xanh song song lao ra, mỗi con nửa sức chưởng. Mỗi con trúng +1 Cuồng Long, trúng bạo kích +2. Cuồng Long tối đa 10.',
    fx: { kind: 'songlong', color: '#ffcf40' },
    tiers: { // hlMax cộng dồn vào giới hạn 10 (engine clMax)
      5: { name: 'Long Khí Tụ Hải', desc: 'Cuồng Long tối đa 20.', hlMax: 10 },
      10: { name: 'Song Long Đằng Vân', desc: 'Cuồng Long tối đa 30.', hlMax: 10 },
    } },
  hl_long_tieu: { name: 'Long Tiếu Cửu Thiên', kieu: 'quyen', bo: 'hang_long', cat: 'vocong', grade: 'thuongthua', elem: 'duong', req: { skill: 'hl_song_long', lv: 5 },
    // người dùng chốt 2026-11-07: 180%, mỗi tầng +4%, tầng 10 +8% → 220%
    mp: 20, mpTier: 5, type: 'attack', power: 1.8, up: 0.04, upAt: { 10: 0.08 },
    desc: 'Rồng vút lên chín tầng mây rồi bổ thẳng xuống đầu đối thủ.',
    fx: { kind: 'longtieu', color: '#ffcf40' },
    tiers: { // chỉ cho chính Long Tiếu (engine clBoost)
      5: { name: 'Long Nhãn', desc: 'Mỗi điểm Cuồng Long đang có +0,5% bạo kích cho Long Tiếu Cửu Thiên.', hlCrit: 0.5 },
      10: { name: 'Long Nộ', desc: 'Mỗi điểm Cuồng Long đang có +1% sát thương bạo cho Long Tiếu Cửu Thiên.', hlCritDmg: 1 },
    } },
  hl_chien_long: { name: 'Chiến Long Tại Dã', bo: 'hang_long', cat: 'congphap', grade: 'thuongthua', elem: 'duong', req: { skill: 'hl_song_long', lv: 10 },
    mp: 15, mpTier: 5, type: 'buff', buff: 'chienLong', value: 0, up: 0, turns: 3,
    desc: 'Rồng cuộn quanh thân. Dùng là được ngay 1 / 2 / 3 / 4 Cuồng Long (tầng 1 / 4 / 7 / 10), rồi 3 lượt mỗi lượt +1. Trong 3 lượt đó mỗi điểm vượt giới hạn hồi 1% khí huyết hoặc nội lực (bên đang thấp hơn).',
    fx: { kind: 'chienlong', color: '#ffcf40' },
    tiers: { // người dùng chốt 2026-11-07
      5: { name: 'Long Lân Hộ Thể', desc: 'Trong 3 lượt hiệu lực, bị đánh trúng +1 Cuồng Long.', hlHit: 1 },
      10: { name: 'Chiến Long Uy', desc: 'Trong 3 lượt hiệu lực, mỗi điểm Cuồng Long đang có +1% bạo kích cho mọi chiêu đánh.', hlCritAll: 1 },
    } },
  hl_giao_long: { name: 'Giao Long Phiên Giang', bo: 'hang_long', cat: 'noicong', grade: 'thuongthua', elem: 'duong', req: { skill: 'hl_long_tieu', lv: 5 },
    type: 'passive', stats: {},
    desc: 'Bị động của bộ (không phải nội công). Mỗi tầng mở thêm một tác dụng cho Cuồng Long. Mỗi lượt trong trận +1 thành thạo.' },
  hl_cuong_long: { name: 'Cuồng Long Loạn Vũ', kieu: 'quyen', bo: 'hang_long', no: true, cat: 'vocong', grade: 'thuongthua', elem: 'duong', req: { skill: 'hl_long_tieu', lv: 10 },
    // người dùng chốt 2026-11-07: 250%, mỗi tầng +5%, tầng 10 +10% → 300%, 30% choáng
    mp: 0, type: 'attack', power: 2.5, up: 0.05, upAt: { 10: 0.1 }, hits: 6, hitSplit: [0.1, 0.1, 0.1, 0.1, 0.1, 0.5],
    effect: { type: 'stun', chance: 30, turns: 1 },
    desc: 'Chiêu nộ: năm rồng nhỏ vây đánh rồi một rồng lớn quật xuống, 30% làm choáng. Cần đầy nộ, không tốn nội lực.',
    fx: { kind: 'cuonglong', color: '#ffcf40' },
    tiers: {
      5: { name: 'Long Quyển Phong Vân', desc: 'Mỗi điểm Cuồng Long đang có +2% bạo kích và +2% sát thương bạo cho Cuồng Long Loạn Vũ.', hlCrit: 2, hlCritDmg: 2 },
      10: { name: 'Quần Long Loạn Vũ', desc: 'Đánh thêm một kẻ địch ngẫu nhiên khác trên sân, đủ sát thương.', hlSpread: 1 },
    } },
  // Bộ Như Lai Thần Chưởng (hệ Dương, Tuyệt học). Làm lại 2026-11-09 (người dùng chốt): Phổ Trí truyền khi lên Đệ tử tinh anh đường Chưởng
  // (TINH_ANH.teach trong mon_phai.js), story: không bán. Tác dụng Phật Pháp Vô Biên cũ chuyển vào mốc tầng 5 / 10 của từng chiêu.
  // Tên trùng võ lẻ Như Lai Thần Chưởng / công pháp Phật Quang Phổ Chiếu của Nga Mi: người dùng bảo tạm để đó.
  nl_so_hien: { name: 'Phật Quang Sơ Hiện', kieu: 'quyen', bo: 'nhu_lai', story: true, cat: 'vocong', grade: 'tuyethoc', elem: 'duong',
    // 180%, mỗi tầng +4%, tầng 10 +8% → 220%
    mp: 20, mpTier: 5, type: 'attack', power: 1.8, up: 0.04, upAt: { 10: 0.08 }, clHit: true,
    desc: 'Bắn một vòng hào quang vào đối thủ. Trúng +1 Phật Ấn, trúng bạo kích +2. Phật Ấn tối đa 10.',
    fx: { kind: 'sohien', color: '#ffd36a' }, // vòng hào quang có bàn tay (ảnh Gemini người dùng 2026-11-09)
    tiers: {
      5: { name: 'Phật Ấn Trùng Trùng', desc: 'Phật Ấn tối đa 20.', nlMax: 10 },
      10: { name: 'Phật Quang Đại Hiện', desc: 'Trúng +2 Phật Ấn, trúng bạo kích +4.', clHitX: 2 },
    } },
  nl_son_ha: { name: 'Phật Động Sơn Hà', kieu: 'quyen', bo: 'nhu_lai', story: true, cat: 'vocong', grade: 'tuyethoc', elem: 'duong',
    // 220%, mỗi tầng +5%, tầng 10 +10% → 270%
    mp: 25, mpTier: 6, type: 'attack', power: 2.2, up: 0.05, upAt: { 10: 0.1 }, nlHeal: { chance: 50, pct: 5 },
    desc: 'Phật ấn nặng tựa Thái Sơn từ trên cao giáng xuống. Trúng thì 50% cơ hội hồi 5% khí huyết tối đa.',
    fx: { kind: 'sonha', color: '#ffc04a' },
    tiers: {
      5: { name: 'Phật Tâm Từ Bi', desc: 'Mỗi Phật Ấn đang có +5% cơ hội hồi khí huyết (tối đa 100%).', nlChance: 5 },
      10: { name: 'Sơn Hà Bất Động', desc: 'Lượng hồi lên 10% khí huyết tối đa.', nlPct: 10 },
    } },
  nl_pho_chieu: { name: 'Phật Quang Phổ Chiếu', bo: 'nhu_lai', story: true, cat: 'congphap', grade: 'tuyethoc', elem: 'duong',
    mp: 20, mpTier: 5, type: 'buff', buff: 'phoChieu', value: 0, up: 0, turns: 3,
    // tầng 1 / 4 / 7 / 10: khí huyết tối đa +10 / 13 / 16 / 20%, mỗi lượt hồi 5 / 6 / 7 / 8% khí huyết tối đa
    pcHp: [10, 13, 16, 20], pcHot: [5, 6, 7, 8],
    desc: 'Vòng bảo hộ Phật quang trong 3 lượt: khí huyết tối đa +10 / 13 / 16 / 20%, mỗi lượt hồi 5 / 6 / 7 / 8% khí huyết tối đa (tầng 1 / 4 / 7 / 10).',
    fx: { kind: 'phochieu', color: '#ffd36a' }, // vòng Phật quang (người dùng 2026-11-09: không dùng chuông Kim Chung)
    tiers: { // gắn vào fx.hpUp lúc vận công (doSkill nhánh phoChieu), hết Phật quang thì hết
      5: { name: 'Phật Quang Hộ Thể', desc: 'Trong thời gian hiệu lực, né được đòn hoặc bị đánh trúng +1 Phật Ấn.', pcGain: 1 },
      10: { name: 'Kim Thân Bất Hoại', desc: 'Trong thời gian hiệu lực, mỗi Phật Ấn đang có giảm 1% sát thương nhận vào.', pcRed: 1 },
    } },
  nl_vo_bien: { name: 'Phật Pháp Vô Biên', bo: 'nhu_lai', story: true, cat: 'noicong', grade: 'tuyethoc', elem: 'duong',
    type: 'passive', stats: {},
    desc: 'Bị động của bộ (ô Hư đã bỏ nên không còn tác dụng; tác dụng đã chuyển vào mốc tầng của các chiêu).' },
  nl_trieu_tong: { name: 'Vạn Phật Triều Tông', kieu: 'quyen', bo: 'nhu_lai', story: true, no: true, cat: 'vocong', grade: 'tuyethoc', elem: 'duong',
    // 300%, mỗi tầng +6%, tầng 10 +12% → 360%
    mp: 0, type: 'attack', power: 3.0, up: 0.06, upAt: { 10: 0.12 }, shieldPct: 10,
    desc: 'Chiêu nộ: vạn Phật cùng giáng chưởng. 10% sát thương gây ra ngưng thành giáp ảo giữ tới lượt sau. Cần đầy nộ, không tốn nội lực.',
    fx: { kind: 'trieutong', color: '#ffcf40' },
    tiers: {
      5: { name: 'Vạn Phật Quy Tông', desc: 'Mỗi Phật Ấn đang có +3% sát thương (không tiêu Phật Ấn).', nlScale: 3 },
      10: { name: 'Phật Quang Phổ Độ', desc: 'Lan sang tối đa 3 kẻ địch đứng sát mục tiêu, mỗi kẻ nhận 30% sát thương.', nlSpread: 30 },
    } },
  // Bộ Đại Nhật Thần Chưởng (người dùng chốt 2026-11-09): Trấn Phái đường Chưởng, hệ Dương, sư phụ truyền khi lên Đệ tử chân truyền (CHAN_TRUYEN.teach).
  // Dương Viêm nằm TRÊN NGƯỜI ĐỊCH (en.fx.dv = { n }, tối đa DV_RULE.max), giữ tới hết trận; đầu lượt kẻ đó mỗi tầng đốt % công người chơi, bỏ qua thủ.
  // Trường: dvHit (trúng +n tầng, bạo kích gấp đôi), dvSpread (lửa lan kẻ đứng sát), dvPct (% công mỗi tầng đốt), dvBonus (% sát thương mỗi tầng trên mục tiêu),
  // dvCrit (bạo kích thì +n tầng), dvBurst (nộ: kích nổ mỗi tầng % công, bỏ qua thủ), dvKeep (nổ xong giữ % số tầng), dvAll (đánh và kích nổ mọi kẻ địch).
  // Số tầng 1 / tầng 10: Trấn Phái mạnh hơn Như Lai một bậc. Hiệu ứng hình đang dùng tạm kiểu có sẵn.
  dn_nhat_xuat: { name: 'Nhật Xuất Đông Phương', kieu: 'quyen', bo: 'dai_nhat', story: true, cat: 'vocong', grade: 'tranphai', elem: 'duong',
    // 200%, mỗi tầng +5%, tầng 10 +10% → 250%
    mp: 25, mpTier: 6, type: 'attack', power: 2.0, up: 0.05, upAt: { 10: 0.1 }, dvHit: 1,
    desc: 'Chưởng như mặt trời mọc, đánh trúng thì gắn 1 tầng Dương Viêm lên đối thủ, bạo kích gắn 2 tầng.',
    fx: { kind: 'lahan', color: '#ff7a2e' },
    tiers: {
      5: { name: 'Hỏa Lan Bát Phương', desc: 'Lửa lan: kẻ đứng sát mục tiêu cũng +1 Dương Viêm.', dvSpread: 1 },
      10: { name: 'Thái Dương Chân Hỏa', desc: 'Mỗi tầng Dương Viêm đốt 10% công thay vì 5%.', dvPct: 10 },
    } },
  dn_liet_nhat: { name: 'Liệt Nhật Đương Không', kieu: 'quyen', bo: 'dai_nhat', story: true, cat: 'vocong', grade: 'tranphai', elem: 'duong',
    // 250%, mỗi tầng +6%, tầng 10 +12% → 310%
    mp: 35, mpTier: 8, type: 'attack', power: 2.5, up: 0.06, upAt: { 10: 0.12 }, dvBonus: 4,
    desc: 'Mặt trời giữa trưa giáng xuống. Mỗi tầng Dương Viêm trên mục tiêu +4% sát thương (không tiêu tầng).',
    fx: { kind: 'dailuc', color: '#ff8a3a' },
    tiers: {
      5: { name: 'Liệt Diễm', desc: 'Đánh trúng cũng +1 Dương Viêm (bạo kích +2).', dvHit: 1 },
      10: { name: 'Nhật Trung Thiên', desc: 'Bạo kích thì mục tiêu +3 Dương Viêm.', dvCrit: 3 },
    } },
  dn_cuu_nhat: { name: 'Cửu Nhật Lăng Không', bo: 'dai_nhat', story: true, cat: 'congphap', grade: 'tranphai', elem: 'duong',
    mp: 25, mpTier: 6, type: 'buff', buff: 'cuuNhat', value: 0, up: 0, turns: 3,
    // tầng 1 / 4 / 7 / 10: lửa đốt mỗi lượt +20 / 30 / 40 / 50% (không tăng phần kích nổ)
    cnUp: [20, 30, 40, 50],
    desc: 'Chín vầng mặt trời treo giữa trời trong 3 lượt: lửa đốt mỗi lượt +20 / 30 / 40 / 50% (tầng 1 / 4 / 7 / 10), không tăng phần kích nổ. Kẻ nào đánh trúng ngươi bị +1 Dương Viêm.',
    fx: { kind: 'kim_chung', color: '#ff9a3a' },
    tiers: { // gắn vào fx.cuuNhat lúc vận công
      5: { name: 'Cửu Nhật Phổ Chiếu', desc: 'Đầu mỗi lượt còn hiệu lực, mọi kẻ địch +1 Dương Viêm.', cnSpread: 1 },
      10: { name: 'Nhật Hỏa Dưỡng Thân', desc: 'Trong hiệu lực, ngươi hồi khí huyết bằng 30% sát thương lửa đốt mỗi lượt (không tính phần kích nổ).', cnHeal: 30 },
    } },
  dn_phan_thien: { name: 'Đại Nhật Phần Thiên', kieu: 'quyen', bo: 'dai_nhat', story: true, no: true, cat: 'vocong', grade: 'tranphai', elem: 'duong',
    // 320%, mỗi tầng +8%, tầng 10 +16% → 400%
    mp: 0, type: 'attack', power: 3.2, up: 0.08, upAt: { 10: 0.16 }, dvBurst: 30,
    desc: 'Chiêu nộ: mặt trời lớn giáng xuống, kích nổ toàn bộ Dương Viêm trên mục tiêu, mỗi tầng 30% công (bỏ qua thủ), rồi xóa hết tầng. Cần đầy nộ, không tốn nội lực.',
    fx: { kind: 'nhulai', color: '#ff7a2e' },
    tiers: {
      5: { name: 'Dư Diễm Bất Tận', desc: 'Nổ xong giữ lại một nửa số tầng Dương Viêm.', dvKeep: 50 },
      10: { name: 'Đại Nhật Chiếu Thế', desc: 'Đánh và kích nổ mọi kẻ địch trên sân, mỗi kẻ nổ theo số tầng lửa trên chính nó.', dvAll: 1 },
    } },
  // Bộ Tâm Phật Chưởng (đường Chưởng Thanh Vân, nhập môn, hệ Dương). story: chỉ nhận khi đỗ ngoại môn, không bán.
  tp_khong_tuong: { name: 'Không Tướng Chưởng', kieu: 'quyen', bo: 'tam_phat', story: true, cat: 'vocong', grade: 'nhapmon', elem: 'duong',
    // người dùng chốt 2026-11-07: 130%, mỗi tầng +2%, tầng 10 +4% → 150%
    mp: 5, mpTier: 2, type: 'attack', power: 1.3, up: 0.02, upAt: { 10: 0.04 }, clHit: true,
    desc: 'Chưởng vô hình, không thấy tay ra mà kình đã tới. Trúng +1 Tâm Lực, trúng bạo kích +2. Tâm Lực không giới hạn.',
    fx: { kind: 'khongtuong', color: '#fff1c8' },
    tiers: { // người dùng chốt 2026-11-07
      5: { name: 'Tâm Lực Tự Sinh', desc: 'Mỗi lần ra chiêu +2 Tâm Lực (trúng hay trượt đều được).', clUse: 2 },
      10: { name: 'Bạo Kích Tụ Tâm', desc: 'Bạo kích thì +4 Tâm Lực.', clCrit: 4 },
    } },
  tp_bo_tat_an: { name: 'Bồ Tát Ấn', kieu: 'quyen', bo: 'tam_phat', story: true, cat: 'vocong', grade: 'nhapmon', elem: 'duong', req: { skill: 'tp_khong_tuong', lv: 5 },
    // người dùng chốt 2026-11-07: 150%, mỗi tầng +3%, tầng 10 +6% → 180%; dồn Tâm Lực mở ở tầng 5, hồi máu theo điểm đã tiêu ở tầng 10
    mp: 8, mpTier: 2, type: 'attack', power: 1.5, up: 0.03, upAt: { 10: 0.06 },
    desc: 'Kết ấn Bồ Tát, dồn sức vào một chưởng.',
    fx: { kind: 'botatan', color: '#ffb060' },
    tiers: {
      5: { name: 'Dồn Tâm Lực', desc: 'Tiêu hết Tâm Lực đang có, mỗi điểm +2% sát thương chiêu này.', tpBurst: 2 },
      10: { name: 'Bồ Tát Từ Bi', desc: 'Mỗi điểm Tâm Lực đã tiêu hồi 1% khí huyết tối đa.', tpBurstHeal: 1 },
    } },
  tp_minh_vuong: { name: 'Minh Vương Ấn', bo: 'tam_phat', story: true, cat: 'congphap', grade: 'nhapmon', elem: 'duong', req: { skill: 'tp_khong_tuong', lv: 10 },
    // tầng 1 / 4 / 7 / 10: giảm sát thương 15 / 20 / 25 / 30%, +1 / 2 / 3 / 4 Tâm Lực (engine đọc mvTier trong act)
    mp: 10, mpTier: 3, type: 'buff', buff: 'reduce', value: 15, up: 0, turns: 3, mvTier: { red: [15, 20, 25, 30], gain: [1, 2, 3, 4] },
    desc: 'Ấn Minh Vương hộ thân 3 lượt. Tầng 1 / 4 / 7 / 10: giảm sát thương nhận vào 15 / 20 / 25 / 30%, kèm +1 / 2 / 3 / 4 Tâm Lực.',
    fx: { kind: 'minhvuong', color: '#e0a85a' },
    tiers: { // người dùng chốt 2026-11-07 (chuyển từ bị động Tịch Diệt đã bỏ)
      5: { name: 'Chuông Tụ Tâm', desc: 'Trong lúc chuông còn, bị đánh trúng +1 Tâm Lực.', mvHit: 1 },
      10: { name: 'Chuông Phản Chấn', desc: 'Trong lúc chuông còn, mỗi Tâm Lực phản 1% sát thương nhận vào cho kẻ đánh.', mvThorns: 1 },
    } },
  tp_tich_diet: { name: 'Tịch Diệt Gia Trì', bo: 'tam_phat', story: true, cat: 'noicong', grade: 'nhapmon', elem: 'duong', req: { skill: 'tp_bo_tat_an', lv: 5 },
    type: 'passive', stats: {},
    desc: 'Bị động của bộ (không phải nội công). Mỗi tầng mở thêm một tác dụng cho Tâm Lực. Mỗi lượt trong trận +1 thành thạo.' },
  tp_loi_am: { name: 'Thiên Cổ Lôi Âm', kieu: 'quyen', bo: 'tam_phat', story: true, no: true, cat: 'vocong', grade: 'nhapmon', elem: 'duong', req: { skill: 'tp_bo_tat_an', lv: 10 },
    // người dùng chốt 2026-11-07: 150%, mỗi tầng +4%, tầng 10 +8% → 190%
    mp: 0, type: 'attack', power: 1.5, up: 0.04, upAt: { 10: 0.08 }, aoe: true,
    desc: 'Chiêu nộ: tiếng gầm Phật môn chấn động cả sân, đánh tất cả kẻ địch. Cần đầy nộ, không tốn nội lực.',
    fx: { kind: 'loiam', color: '#5fe0c0' },
    tiers: {
      5: { name: 'Tâm Lực Hóa Âm', desc: 'Tiêu hết Tâm Lực đang có, mỗi điểm +3% sát thương.', tpScale: 3 },
      10: { name: 'Phật Âm Hộ Thể', desc: 'Hồi khí huyết bằng 10% sát thương gây ra.', drain: 10 },
    } },
  // Nội công nhập môn đường Chưởng Thanh Vân (100 tầng, mỗi 10 tầng một bậc): bền bỉ, hồi phục dần
  // circle: pháp trận sen xanh ngọc dưới chân (ảnh Gemini người dùng tạo 2026-11-05), như pháp trận Cửu Dương
  truong_sinh_quyet: { name: 'Trường Sinh Quyết', story: true, cat: 'noicong', grade: 'nhapmon', elem: 'duong', maxLv: 100, circle: 'game/img/fx_truong_sinh.png',
    // Người dùng chốt 2026-11-07: tầng 1 khí huyết 150 / nội lực 50 / công 14 / thủ 16, mỗi tầng +22 / +7 / +2 / +2,5, riêng tầng 100 tăng gấp đôi (statsUpAt).
    // quyenUp: sát thương võ học Quyền (SKILLS[x].kieu === 'quyen'); conRed: giảm sát thương nhận từ võ học Côn (kieu === 'con'); gate30: lần đầu khí huyết dưới 30% hồi ngay
    type: 'passive', stats: { hp: 150, mp: 50, atk: 14, def: 16 }, statsUp: { hp: 22, mp: 7, atk: 2, def: 2.5 }, statsUpAt: { 100: 2 },
    desc: 'Tâm pháp nhập môn đường Chưởng Thanh Vân Môn, khí tức miên trường, càng đánh lâu càng bền. Luyện tới 100 tầng, mỗi 10 tầng lên một bậc.',
    tiers: {
      10: { name: 'Bậc 1', desc: 'Sát thương võ học Quyền +5%.', quyenUp: 5 },
      20: { name: 'Bậc 2', desc: 'Giảm 5% sát thương nhận từ võ học Côn.', conRed: 5 },
      30: { name: 'Bậc 3', desc: 'Sát thương võ học Quyền thêm +5% (tổng 10%).', quyenUp: 5 },
      40: { name: 'Bậc 4', desc: 'Giảm thêm 5% sát thương nhận từ võ học Côn (tổng 10%).', conRed: 5 },
      50: { name: 'Bậc 5', desc: 'Hồi máu từ mọi nguồn +30%.', healUp: 30 },
      60: { name: 'Bậc 6', desc: 'Khí huyết tối đa +10%.', hpPct: 10 },
      70: { name: 'Bậc 7', desc: 'Thủ +10%.', defPct: 10 },
      80: { name: 'Bậc 8', desc: 'Khí huyết tối đa thêm +10% (tổng 20%).', hpPct: 10 },
      90: { name: 'Bậc 9', desc: 'Thủ thêm +10% (tổng 20%).', defPct: 10 },
      100: { name: 'Bậc 10', desc: 'Vào trận có sẵn 50 nộ. Lần đầu khí huyết xuống dưới 30% thì hồi ngay 25% khí huyết tối đa (mỗi trận một lần).', noStart: 50, gate30: 25 } } },
  // Hàng Long Quyết (người dùng chốt số 2026-11-07): nội công Thượng thừa hệ Dương, 100 tầng. Tầng 1 khí huyết + nội lực = 400, công + thủ = 45,
  // mỗi tầng +20% số gốc, tầng 100 gấp đôi. critUp / critDmgUp: cộng thẳng vào bạo kích / sát thương bạo (getStats);
  // critHp: bạo kích thì thêm sát thương = % khí huyết tối đa của kẻ bị đánh, mỗi lần ra chiêu một lần (onCrit).
  // Phổ Trí Đại Sư truyền khi đỗ đệ tử nội môn đường Chưởng, cùng bộ Hàng Long (NOI_MON.teach trong mon_phai.js).
  // circle: pháp trận rồng vàng dưới chân (ảnh Gemini người dùng tạo 2026-11-08, gốc luu_tru/Chuong_NoiMon/hang_long_quyet_phap_tran.png)
  hang_long_quyet: { name: 'Hàng Long Quyết', story: true, cat: 'noicong', grade: 'thuongthua', elem: 'duong', maxLv: 100, circle: 'game/img/fx_hang_long_quyet.png',
    type: 'passive', stats: { hp: 300, mp: 100, atk: 25, def: 20 }, statsUp: { hp: 60, mp: 20, atk: 5, def: 4 }, statsUpAt: { 100: 2 },
    desc: 'Tâm pháp giáng long, khí như rồng cuộn, chưởng ra là bạo phát. Luyện tới 100 tầng, mỗi 10 tầng lên một bậc.',
    tiers: {
      10: { name: 'Bậc 1', desc: 'Sát thương võ học Quyền +7,5%.', quyenUp: 7.5 },
      20: { name: 'Bậc 2', desc: 'Giảm 7,5% sát thương nhận từ võ học Côn.', conRed: 7.5 },
      30: { name: 'Bậc 3', desc: 'Sát thương võ học Quyền thêm +7,5% (tổng 15%).', quyenUp: 7.5 },
      40: { name: 'Bậc 4', desc: 'Giảm thêm 7,5% sát thương nhận từ võ học Côn (tổng 15%).', conRed: 7.5 },
      50: { name: 'Bậc 5', desc: 'Sát thương bạo +30%.', critDmgUp: 30 },
      60: { name: 'Bậc 6', desc: 'Công +10%.', atkPct: 10 },
      70: { name: 'Bậc 7', desc: 'Bạo kích +10%.', critUp: 10 },
      80: { name: 'Bậc 8', desc: 'Công thêm +10% (tổng 20%).', atkPct: 10 },
      90: { name: 'Bậc 9', desc: 'Bạo kích thêm +10% (tổng 20%).', critUp: 10 },
      100: { name: 'Bậc 10', desc: 'Bạo kích thì gây thêm sát thương bằng 5% khí huyết tối đa của kẻ bị đánh (mỗi lần ra chiêu một lần).', critHp: 5 } } },
  // Cửu Dương Thần Công (người dùng chốt 2026-11-09): nội công Trấn Phái hệ Dương, 100 tầng, đi cùng bộ Đại Nhật Thần Chưởng,
  // truyền khi lên Đệ tử chân truyền đường Chưởng (CHAN_TRUYEN.teach). Mã mới cuu_duong_tp (mã cuu_duong_than_cong giờ là Dịch Cân Kinh).
  // Công thức Trấn Phái: tầng 1 khí huyết + nội lực = 1.600, công + thủ = 75; mỗi tầng +30% số gốc; tầng 100 gấp đôi.
  // dvStart: vào trận mọi kẻ địch nhận n tầng Dương Viêm; dvPass: kẻ địch gục khi còn Dương Viêm thì lửa truyền sang kẻ khác (engine dvDeaths).
  cuu_duong_tp: { name: 'Cửu Dương Thần Công', story: true, cat: 'noicong', grade: 'tranphai', elem: 'duong', maxLv: 100,
    circle: 'game/img/fx_cuuduong.png', // pháp trận mặt trời (trước gắn cho mã cũ, nay là Dịch Cân Kinh)
    type: 'passive', stats: { hp: 1200, mp: 400, atk: 50, def: 25 }, statsUp: { hp: 360, mp: 120, atk: 15, def: 7.5 }, statsUpAt: { 100: 2 },
    desc: 'Chân kinh thuần dương chí cao, chín mặt trời trong người, chưởng ra là lửa. Luyện tới 100 tầng, mỗi 10 tầng lên một bậc.',
    tiers: {
      10: { name: 'Bậc 1', desc: 'Sát thương võ học Quyền +12,5%.', quyenUp: 12.5 },
      20: { name: 'Bậc 2', desc: 'Giảm 12,5% sát thương nhận từ võ học Côn.', conRed: 12.5 },
      30: { name: 'Bậc 3', desc: 'Sát thương võ học Quyền thêm +12,5% (tổng 25%).', quyenUp: 12.5 },
      40: { name: 'Bậc 4', desc: 'Giảm thêm 12,5% sát thương nhận từ võ học Côn (tổng 25%).', conRed: 12.5 },
      50: { name: 'Bậc 5', desc: 'Vào trận, mỗi kẻ địch nhận 2 tầng Dương Viêm.', dvStart: 2 },
      60: { name: 'Bậc 6', desc: 'Công +15%.', atkPct: 15 },
      70: { name: 'Bậc 7', desc: 'Khí huyết tối đa +15%.', hpPct: 15 },
      80: { name: 'Bậc 8', desc: 'Công thêm +15% (tổng 30%).', atkPct: 15 },
      90: { name: 'Bậc 9', desc: 'Khí huyết tối đa thêm +15% (tổng 30%).', hpPct: 15 },
      100: { name: 'Cửu Dương Bất Diệt', desc: 'Kẻ địch gục khi còn Dương Viêm thì toàn bộ số tầng lửa truyền sang một kẻ địch khác ngẫu nhiên.', dvPass: 1 } } },
});

/* ------------------------- VẬT PHẨM ------------------------------
   type: 'use' (dùng được) | 'book' (bí kíp) | 'material' (nguyên liệu) | 'quest' (đồ cốt truyện)
         | trang bị: 'weapon' (binh khí) | 'hat' (nón) | 'armor' (y phục)
                     | 'pants' (quần) | 'shoes' (giày) | 'ring' (nhẫn) | 'pendant' (ngọc bội)
   price: giá mua   sell: giá bán (nếu không ghi = nửa giá mua)
   heal: hồi máu    mp: hồi nội lực    cure: giải độc
   stats: chỉ số cộng thêm khi trang bị
   Trang bị không ghi ở đây mà ở bảng GEAR bên dưới (ITEMS là ITEMS_BASE + đồ đã rèn) */
// Bỏ hẳn thuốc và đan dược (người dùng chốt 2026-11-10): không bán, không rơi, không có nút trong trận; bản lưu cũ đổi thuốc thành bạc (giá mua).
// Đặt false để bật lại. Dữ liệu thuốc bên dưới giữ nguyên.
const POTION_OFF = true;
const ITEMS_BASE = {
  // --- Thảo dược nâng Kinh mạch (KINH_MACH bên dưới; người dùng chốt 2026-11-10) ---
  vo_danh_thao: { name: 'Vô Danh Thảo', icon: 'vo_danh_thao', type: 'material', price: 0, desc: 'Cỏ dại mọc khắp giang hồ, ẩn chút linh khí. Dùng nâng Kinh mạch: 2 điểm chân khí.' },
  nhan_sam: { name: 'Nhân Sâm', icon: 'nhan_sam', type: 'material', price: 0, desc: 'Củ sâm quý, bồi nguyên cố bản. Dùng nâng Kinh mạch: 5 điểm chân khí.' },
  // mã riêng tuyet_lien_km: tuyet_lien là thuốc cũ Thiên Sơn Tuyết Liên
  tuyet_lien_km: { name: 'Tuyết Liên', icon: 'tuyet_lien_km', type: 'material', price: 0, desc: 'Sen tuyết hiếm có, khai thông kinh lạc. Dùng nâng Kinh mạch: 10 điểm chân khí.' },
  // --- Thuốc ---
  // Thuốc: hồi ngay. lv = cấp tối thiểu để dùng. Mỗi 10 cấp một bậc, mỗi bậc một bình khí huyết và một bình nội lực.
  thuoc_tri_thuong: { name: 'Thuốc Trị Thương', icon: 'thuoc_tri_thuong', type: 'use', lv: 1, price: 15, heal: 60 },
  kim_sang_duoc: { name: 'Kim Sang Dược', icon: 'kim_sang_duoc', type: 'use', lv: 10, price: 50, heal: 180 },
  dai_hoan_dan: { name: 'Đại Hoàn Đan', icon: 'dai_hoan_dan', type: 'use', lv: 20, price: 150, heal: 450 },
  cuu_chuyen_hoan: { name: 'Cửu Chuyển Hoàn', icon: 'cuu_chuyen_hoan', type: 'use', lv: 30, price: 300, heal: 700 },
  thien_huong_cao: { name: 'Thiên Hương Tục Mệnh Cao', icon: 'thien_huong_cao', type: 'use', lv: 40, price: 500, heal: 1000 },
  hoi_khi_dan: { name: 'Hồi Khí Đan', icon: 'hoi_khi_dan', type: 'use', lv: 1, price: 20, mp: 25 },
  bo_khi_dan: { name: 'Bổ Khí Đan', icon: 'bo_khi_dan', type: 'use', lv: 10, price: 60, mp: 60 },
  tuyet_lien: { name: 'Thiên Sơn Tuyết Liên', icon: 'tuyet_lien', type: 'use', lv: 20, price: 160, mp: 150 },
  tu_kim_linh_dich: { name: 'Tử Kim Linh Dịch', icon: 'tu_kim_linh_dich', type: 'use', lv: 30, price: 320, mp: 220 },
  bich_ngoc_lo: { name: 'Bích Ngọc Thanh Tâm Lộ', icon: 'bich_ngoc_lo', type: 'use', lv: 40, price: 550, mp: 300 },
  // Đan dược: chỉ dùng trong trận; đầu mỗi lượt của ngươi hồi regen.hp % khí huyết và regen.mp % nội lực tối đa, trong regen.turns lượt.
  // Uống viên mới khi viên cũ chưa hết thì viên mới thay viên cũ.
  duong_khi_hoan: { name: 'Dưỡng Khí Hoàn', icon: 'duong_khi_hoan', type: 'use', lv: 1, price: 40, regen: { hp: 4, mp: 4, turns: 5 } },
  hoan_duong_dan: { name: 'Hoàn Dương Đan', icon: 'hoan_duong_dan', type: 'use', lv: 10, price: 120, regen: { hp: 5, mp: 5, turns: 5 } },
  tuc_menh_dan: { name: 'Tục Mệnh Đan', icon: 'tuc_menh_dan', type: 'use', lv: 20, price: 300, regen: { hp: 6, mp: 6, turns: 5 } },
  // Không còn giải độc (người dùng chốt 2026-11-06: độc chỉ giải bằng võ học); chỉ còn hồi chút máu, giữ để bản lưu không hỏng
  giai_doc_dan: { name: 'Giải Độc Đan', icon: 'giai_doc_dan', type: 'use', price: 12, heal: 30 },
  // Truy Nã Hiệp Khách (truy_na.js, người dùng chốt 2026-11-06): đánh bại hào kiệt được mảnh nội công / mảnh võ học,
  // để sau này đổi võ học (chưa có chỗ đổi). Mã còn đuôi _so nhưng tên không ghi "Sơ" (người dùng chốt).
  manh_noi_so: { name: 'Mảnh Nội Công', icon: 'manh_noi_so', type: 'quest', price: 0,
    desc: 'Trang tâm pháp rách nát thu được từ tay hào kiệt bị truy nã. Gom đủ để đổi lấy nội công (sắp mở).' },
  manh_vo_so: { name: 'Mảnh Võ Học', icon: 'manh_vo_so', type: 'quest', price: 0,
    desc: 'Trang võ phổ rách nát thu được từ tay hào kiệt bị truy nã. Gom đủ để đổi lấy võ học (sắp mở).' },
};

/* ------------------------- TRANG BỊ ------------------------------
   Lối chơi mới (người dùng chốt 2026-10-28): 11 ô, mỗi ô 10 bậc; bậc t mặc từ cấp GEAR_LV[t − 1].
   - base:  chỉ số dòng cơ bản theo bậc t (đồ Thường). Cả bộ ≈ 60% công, 60% thủ, 100% khí huyết gốc ở cấp giữa bậc.
   - pool:  4 chỉ số dòng phụ của ô; mỗi dòng bốc ngẫu nhiên trong pool, ĐƯỢC TRÙNG (vd. 2 dòng Bạo kích thì cộng dồn).
   - ids:   [mã, tên, biểu tượng nếu khác mã] cho bậc 1 → 10.
   Loại đồ (GEAR_QUALITY): mua ở cửa hàng mới biết ra loại gì. Thường: chỉ số gốc, không dòng phụ;
   Hiếm: chỉ số gốc ×1,25 + 2 dòng phụ; Cực phẩm: ×1,5 + 4 dòng phụ.
   Mức mỗi dòng phụ = GEAR_LINE[chỉ số] × bậc.
   Giá mỗi món = GEAR_PRICE[bậc] (mọi ô cùng giá): bằng bạc của 100 con quái ở cấp giữa bậc (người dùng chốt 2026-10-28, sau khi thấy bạc dư nhiều). */
/* ---------------- KINH MẠCH (người dùng chốt 2026-11-10) ----------------
   10 mạch, mở lần lượt ở cấp 5, 15 … 95; mạch sau cần đủ cấp nhân vật VÀ mạch trước đạt cấp 100.
   Mỗi mạch 100 cấp, mỗi cấp cần 100 điểm chân khí (cố định). Chân khí lấy từ thảo dược: herbs (điểm mỗi cây).
   pct: % chỉ số mỗi cấp mạch; flat: điểm chỉ số mỗi cấp (bạo kích, né... tính bằng %); full: thêm khi mạch đủ 100 cấp
   (full.stats cộng thẳng, full.pct cộng %, full.pt là hiệu ứng trong trận: regen / mpRegen hồi %/lượt, dmgReduce giảm sát thương,
   dodgeHeal né đòn hồi %, noStart nộ lúc vào trận). Chỉ số do Claude đề xuất, người dùng sẽ chỉnh sau.
   Nguồn thảo dược (người dùng chốt): Vô Danh Thảo 25% mỗi lần thám hiểm / thắng trận quái map; Tinh Anh 1 Nhân Sâm, Truy Nã 2;
   Cấm địa mỗi ải 3 cây, Trấn Ma Tháp qua tầng lần đầu 1 cây (tầng 5 / 10 / 15… 3 cây), mỗi cây 60% Nhân Sâm / 40% Tuyết Liên. */
const KINH_MACH = {
  per: 100, max: 100,
  herbs: { vo_danh_thao: 2, nhan_sam: 5, tuyet_lien_km: 10 },
  thao: 25,               // % ra Vô Danh Thảo mỗi lần thám hiểm / thắng trận quái map
  elite: 1, truyNa: 2,    // Nhân Sâm từ Tinh Anh / hào kiệt Truy Nã
  camDia: 3,              // cây mỗi ải Cấm địa (trong lượt còn thưởng hôm nay)
  thap: 1, thapBoss: 3,   // cây khi qua tầng tháp lần đầu (tầng chia hết cho 5: thapBoss)
  rare: [60, 40],         // Nhân Sâm / Tuyết Liên khi bốc ở Cấm địa, tháp
  // noi: mạch cấp N cộng khí huyết / nội lực / công / thủ đúng bằng nội công đó ở tầng N (người dùng chốt 2026-11-11):
  // mạch 1–2 như Vô Danh Tâm Pháp, 3–4 nội công nhập môn, 5–6 Thượng thừa, 7–8 Tuyệt học, 9–10 Trấn phái (đổi số nội công thì mạch đổi theo)
  list: [
    { id: 'dan_dien', name: 'Đan Điền', lv: 5, noi: 'co_hong_tam_phap', full: { pt: { mpRegen: 2 } }, fullText: 'Mỗi lượt hồi 2% nội lực' },
    { id: 'minh_vi', name: 'Minh Vị', lv: 15, noi: 'co_hong_tam_phap', full: { pt: { regen: 2 } }, fullText: 'Mỗi lượt hồi 2% khí huyết' },
    { id: 'am_than', name: 'Âm Thận', lv: 25, noi: 'truong_sinh_quyet', full: { pt: { dmgReduce: 5 } }, fullText: 'Giảm 5% sát thương nhận vào' },
    { id: 'am_ty', name: 'Âm Tỳ', lv: 35, noi: 'truong_sinh_quyet', full: { pct: { atk: 5 } }, fullText: 'Công thêm 5%' },
    { id: 'duong_dam', name: 'Dương Đảm', lv: 45, noi: 'hang_long_quyet', full: { stats: { critDmg: 20 } }, fullText: 'Sát thương bạo +20%' },
    { id: 'am_phe', name: 'Âm Phế', lv: 55, noi: 'hang_long_quyet', full: { pt: { dodgeHeal: 3 } }, fullText: 'Né được đòn thì hồi 3% khí huyết' },
    { id: 'tieu_truong', name: 'Tiểu Trường', lv: 65, noi: 'cuu_duong_than_cong', full: { stats: { critDmgRes: 20 } }, fullText: 'Giảm 20% sát thương bạo phải nhận' },
    { id: 'am_can', name: 'Âm Can', lv: 75, noi: 'cuu_duong_than_cong', full: { pt: { noStart: 20 } }, fullText: 'Vào trận có sẵn 20 nộ' },
    { id: 'tam_tieu', name: 'Tam Tiêu', lv: 85, noi: 'cuu_duong_tp', full: { stats: { manasteal: 3 } }, fullText: 'Hút nội lực 3% sát thương gây ra' },
    { id: 'nham_doc', name: 'Nhâm Đốc', lv: 95, noi: 'cuu_duong_tp', full: { pct: { atk: 10, def: 10, hp: 10 } }, fullText: 'Thân thể Cương Dương: công, thủ, khí huyết +10%' },
  ],
};
const GEAR_LV = [1, 11, 21, 31, 41, 51, 61, 71, 81, 91]; // mỗi bậc 10 cấp; mốc 1, 11, 21 … (người dùng chốt 2026-11-06, cùng mốc với găng)
const GEAR_PRICE = [1900, 12400, 32900, 63400, 103900, 154400, 214900, 285400, 365900, 456400];
const GEAR_QUALITY = [
  { name: 'Thường', mul: 1, lines: 0, w: 60 },
  { name: 'Hiếm', mul: 1.25, lines: 2, w: 30 },
  { name: 'Cực phẩm', mul: 1.5, lines: 4, w: 10 },
];
const GEAR_LINE = { crit: 0.5, acc: 0.5, dodge: 0.5, critRes: 0.5, lifesteal: 0.3, critDmg: 2, critDmgRes: 2, mp: 15, hp: 20, def: 2, atk: 3 };
// Thợ Rèn chỉ nâng bậc: giá = upMult × giá món ở bậc sẽ nâng lên; bán lại = sellPct % giá (đổi dòng phụ đã bỏ 2026-10-28)
const FORGE = { upMult: 2, sellPct: 20 };
const POOL_ATK = ['crit', 'critDmg', 'acc', 'lifesteal'], POOL_ACC = ['mp', 'crit', 'critDmg', 'acc'];
const POOL_DEF = ['hp', 'critRes', 'critDmgRes', 'dodge'], POOL_HP = ['def', 'critRes', 'critDmgRes', 'dodge'];
const tierArr = f => Array.from({ length: 12 }, (_, i) => f(i + 1)); // đủ 12 bậc; số bậc thật của ô = số món trong ids
const GEAR = {
  // Vũ khí 12 bậc, mặc từ cấp 1, 11 … 111 (WEAPON_LV). Kiếm: 12 thanh "Thập Nhị Thần Kiếm" (người dùng chốt 2026-11-06, ảnh Gemini,
  // gốc luu_tru/kiem_12.png, biểu tượng game/img/icon/kiem_N.png); giữ mã cũ bậc 1–10 để bản lưu không hỏng, thêm kiem_11, kiem_12
  weapon: { base: { atk: Array.from({ length: 12 }, (_, i) => 12 * (i + 1) - 1) }, pool: POOL_ATK,
    ids: [['moc_kiem', 'Kiếm Gỗ', 'kiem_1'], ['thiet_kiem', 'Kiếm Trầm Minh', 'kiem_2'], ['thanh_cuong_kiem', 'Kiếm Cửu Chân', 'kiem_3'],
      ['tinh_thep_dao', 'Kiếm Long Uyên', 'kiem_4'], ['huyen_thiet_kiem', 'Kiếm Trường Thiên', 'kiem_5'], ['bich_hai_kiem', 'Kiếm Kiền Nguyên', 'kiem_6'],
      ['ngu_doc_kiem', 'Kiếm Vô Tình', 'kiem_7'], ['han_bang_kiem', 'Kiếm Thái Hư', 'kiem_8'], ['tu_ha_kiem', 'Kiếm Thượng Phương', 'kiem_9'],
      ['y_thien_kiem', 'Kiếm Phi Hồng', 'kiem_10'], ['kiem_11', 'Kiếm Tinh Thủy'], ['kiem_12', 'Kiếm Vô Vấn']] },
  // Dây chuyền / Nhẫn / Ngọc bội 12 bậc (người dùng chốt 2026-11-06, ảnh Gemini "Thập Nhị Diệp Chiến / Mai Chỉ / Ngọc Bội", gốc luu_tru/{day_chuyen,nhan,boi}_12.png)
  necklace: { base: { atk: tierArr(t => 4 * t) }, pool: POOL_ACC,
    ids: [['day_chuyen_1', 'Dây Chuyền Vải Thô'], ['day_chuyen_2', 'Dây Chuyền Bách Hóa'], ['day_chuyen_3', 'Dây Chuyền Đêm Thâu'], ['day_chuyen_4', 'Dây Chuyền Mông Hồi'],
      ['day_chuyen_5', 'Dây Chuyền Y Gia'], ['day_chuyen_6', 'Dây Chuyền Hộ Môn'], ['day_chuyen_7', 'Dây Chuyền Thiết Giáp'], ['day_chuyen_8', 'Dây Chuyền Cuồng Lang'],
      ['day_chuyen_9', 'Dây Chuyền Hộ Vệ'], ['day_chuyen_10', 'Dây Chuyền Long Lân'], ['day_chuyen_11', 'Dây Chuyền Thái Hư'], ['day_chuyen_12', 'Dây Chuyền Xích Luyện']] },
  ring: { base: { atk: tierArr(t => 4 * t) }, pool: POOL_ACC,
    ids: [['ngoc_boi', 'Nhẫn Vải Thô', 'nhan_1'], ['nhan_phi_thuy', 'Nhẫn Bách Hóa', 'nhan_2'], ['hong_ngoc_nhan', 'Nhẫn Đêm Thâu', 'nhan_3'], ['huyet_ngoc_nhan', 'Nhẫn Mông Hồi', 'nhan_4'],
      ['thong_linh_ngoc', 'Nhẫn Y Gia', 'nhan_5'], ['luu_ly_nhan', 'Nhẫn Hộ Môn', 'nhan_6'], ['tran_chau_nhan', 'Nhẫn Thiết Giáp', 'nhan_7'], ['ngu_doc_nhan', 'Nhẫn Cuồng Lang', 'nhan_8'],
      ['han_ngoc_nhan', 'Nhẫn Hộ Vệ', 'nhan_9'], ['thien_ha_nhan', 'Nhẫn Long Lân', 'nhan_10'], ['nhan_11', 'Nhẫn Thái Hư'], ['nhan_12', 'Nhẫn Xích Luyện']] },
  pendant: { base: { atk: tierArr(t => 4 * t) }, pool: POOL_ACC,
    ids: [['bach_ngoc_boi', 'Ngọc Bội Vải Thô', 'boi_1'], ['thanh_ngoc_boi', 'Ngọc Bội Bách Hóa', 'boi_2'], ['ho_tam_boi', 'Ngọc Bội Đêm Thâu', 'boi_3'], ['linh_lung_boi', 'Ngọc Bội Mông Hồi', 'boi_4'],
      ['han_ngoc_boi', 'Ngọc Bội Y Gia', 'boi_5'], ['nguyet_thach_boi', 'Ngọc Bội Hộ Môn', 'boi_6'], ['san_ho_boi', 'Ngọc Bội Thiết Giáp', 'boi_7'], ['ngan_toa_boi', 'Ngọc Bội Cuồng Lang', 'boi_8'],
      ['tuyet_tinh_boi', 'Ngọc Bội Hộ Vệ', 'boi_9'], ['ngoc_nu_boi', 'Ngọc Bội Long Lân', 'boi_10'], ['boi_11', 'Ngọc Bội Thái Hư'], ['boi_12', 'Ngọc Bội Xích Luyện']] },
  // Mũ / Áo / Quần / Giày 12 bậc (người dùng chốt 2026-11-06, ảnh Gemini "Thập Nhị Đầu Giáp / Vi Y Giáp / Hạ Giáp / Bộ Giáp",
  // gốc luu_tru/{mu,ao,quan,giay}_12.png, biểu tượng game/img/icon/<loại>_N.png); giữ mã cũ bậc 1–10, thêm mã bậc 11, 12
  hat: { base: { def: tierArr(t => 4 * t) }, pool: POOL_DEF,
    ids: [['non_la', 'Mũ Vải Thô', 'mu_1'], ['mu_da', 'Mũ Đấu Thảo', 'mu_2'], ['tu_kim_quan', 'Mũ Đấu Sa', 'mu_3'], ['ho_dau_khoi', 'Mũ Mông Hồi', 'mu_4'],
      ['bach_da_dau_can', 'Mũ Nho Lâm', 'mu_5'], ['hai_ngoc_quan', 'Mũ Hộ Môn', 'mu_6'], ['ngan_hoa_quan', 'Mũ Thiết Đỉnh', 'mu_7'], ['tuyet_lien_quan', 'Mũ Cuồng Lang', 'mu_8'],
      ['ngoc_nu_quan', 'Mũ Hộ Vệ', 'mu_9'], ['thien_co_quan', 'Mũ Long Lân', 'mu_10'], ['mu_11', 'Mũ Thái Hư'], ['mu_12', 'Mũ Xích Luyện']] },
  armor: { base: { def: tierArr(t => 5 * t) }, pool: POOL_DEF,
    ids: [['ao_vai', 'Áo Vải Thô', 'ao_1'], ['ao_da', 'Áo Bách Hóa', 'ao_2'], ['thiet_giap', 'Áo Đêm Thâu', 'ao_3'], ['kim_ti_giap', 'Áo Mông Hồi', 'ao_4'],
      ['nhuyen_vi_giap', 'Áo Y Gia', 'ao_5'], ['sa_mac_bao', 'Áo Hộ Môn', 'ao_6'], ['giao_long_giap', 'Áo Thiết Giáp', 'ao_7'], ['thien_tam_giap', 'Áo Cuồng Lang', 'ao_8'],
      ['bang_tam_giap', 'Áo Hộ Vệ', 'ao_9'], ['tu_ha_bao', 'Áo Long Lân', 'ao_10'], ['ao_11', 'Áo Thái Hư'], ['ao_12', 'Áo Xích Luyện']] },
  pants: { base: { def: tierArr(t => 3 * t) }, pool: POOL_DEF,
    ids: [['quan_vai', 'Quần Vải Thô', 'quan_1'], ['quan_da', 'Quần Bách Hóa', 'quan_2'], ['quan_ho_tat', 'Quần Đêm Thâu', 'quan_3'], ['ngan_ti_kho', 'Quần Mông Hồi', 'quan_4'],
      ['sa_bao_kho', 'Quần Y Gia', 'quan_5'], ['giao_tieu_kho', 'Quần Hộ Môn', 'quan_6'], ['thien_tam_kho', 'Quần Thiết Giáp', 'quan_7'], ['tuyet_hoa_kho', 'Quần Cuồng Lang', 'quan_8'],
      ['tu_ha_kho', 'Quần Hộ Vệ', 'quan_9'], ['long_lan_kho', 'Quần Long Lân', 'quan_10'], ['quan_11', 'Quần Thái Hư'], ['quan_12', 'Quần Xích Luyện']] },
  // Phi phong / Đai lưng / Hộ tâm kính 12 bậc (người dùng chốt 2026-11-06, ảnh Gemini "Thập Nhị Phi Phong / Đai Lưng / Hộ Tâm Kính",
  // gốc luu_tru/{phi_phong,dai_lung,htk}_12.png). Ô "glove" giữ mã cũ (bản lưu) nhưng giờ là Hộ Tâm Kính (thay Hộ thủ, dễ nhầm với Găng)
  cape: { base: { hp: tierArr(t => 80 * t) }, pool: POOL_HP,
    ids: [['phi_phong_1', 'Phi Phong Vải Thô'], ['phi_phong_2', 'Phi Phong Bách Hóa'], ['phi_phong_3', 'Phi Phong Đêm Thâu'], ['phi_phong_4', 'Phi Phong Mông Hồi'],
      ['phi_phong_5', 'Phi Phong Y Gia'], ['phi_phong_6', 'Phi Phong Hộ Môn'], ['phi_phong_7', 'Phi Phong Thiết Giáp'], ['phi_phong_8', 'Phi Phong Cuồng Lang'],
      ['phi_phong_9', 'Phi Phong Hộ Vệ'], ['phi_phong_10', 'Phi Phong Long Lân'], ['phi_phong_11', 'Phi Phong Thái Hư'], ['phi_phong_12', 'Phi Phong Xích Luyện']] },
  belt: { base: { hp: tierArr(t => 70 * t) }, pool: POOL_HP,
    ids: [['dai_lung_1', 'Đai Lưng Vải Thô'], ['dai_lung_2', 'Đai Lưng Bách Hóa'], ['dai_lung_3', 'Đai Lưng Đêm Thâu'], ['dai_lung_4', 'Đai Lưng Mông Hồi'],
      ['dai_lung_5', 'Đai Lưng Y Gia'], ['dai_lung_6', 'Đai Lưng Hộ Môn'], ['dai_lung_7', 'Đai Lưng Thiết Giáp'], ['dai_lung_8', 'Đai Lưng Cuồng Lang'],
      ['dai_lung_9', 'Đai Lưng Hộ Vệ'], ['dai_lung_10', 'Đai Lưng Long Lân'], ['dai_lung_11', 'Đai Lưng Thái Hư'], ['dai_lung_12', 'Đai Lưng Xích Luyện']] },
  glove: { base: { hp: tierArr(t => 50 * t) }, pool: POOL_HP,
    ids: [['ho_thu_1', 'Hộ Tâm Kính Vải Thô', 'htk_1'], ['ho_thu_2', 'Hộ Tâm Kính Bách Hóa', 'htk_2'], ['ho_thu_3', 'Hộ Tâm Kính Đêm Thâu', 'htk_3'], ['ho_thu_4', 'Hộ Tâm Kính Mông Hồi', 'htk_4'],
      ['ho_thu_5', 'Hộ Tâm Kính Y Gia', 'htk_5'], ['ho_thu_6', 'Hộ Tâm Kính Hộ Môn', 'htk_6'], ['ho_thu_7', 'Hộ Tâm Kính Thiết Giáp', 'htk_7'], ['ho_thu_8', 'Hộ Tâm Kính Cuồng Lang', 'htk_8'],
      ['ho_thu_9', 'Hộ Tâm Kính Hộ Vệ', 'htk_9'], ['ho_thu_10', 'Hộ Tâm Kính Long Lân', 'htk_10'], ['htk_11', 'Hộ Tâm Kính Thái Hư'], ['htk_12', 'Hộ Tâm Kính Xích Luyện']] },
  // Giày chỉ còn Tốc độ (người dùng bỏ dòng Né 2026-11-08, khi làm cường hóa)
  shoes: { base: { spd: tierArr(t => 3 * t) }, pool: ['def', 'hp', 'mp', 'atk'],
    ids: [['giay_co', 'Giày Vải Thô', 'giay_1'], ['giay_da_huou', 'Giày Bách Hóa', 'giay_2'], ['truy_phong_hai', 'Giày Đêm Thâu', 'giay_3'], ['dap_tuyet_hai', 'Giày Mông Hồi', 'giay_4'],
      ['phong_sa_hai', 'Giày Y Gia', 'giay_5'], ['dap_lang_hai', 'Giày Hộ Môn', 'giay_6'], ['van_doc_hai', 'Giày Thiết Giáp', 'giay_7'], ['lang_van_hai', 'Giày Cuồng Lang', 'giay_8'],
      ['van_ly_hai', 'Giày Hộ Vệ', 'giay_9'], ['thanh_van_hai', 'Giày Long Lân', 'giay_10'], ['giay_11', 'Giày Thái Hư'], ['giay_12', 'Giày Xích Luyện']] },
};
const gearBaseStats = (slot, tier) => Object.fromEntries(Object.entries(GEAR[slot].base).map(([k, v]) => [k, v[tier - 1]]));
// Vũ khí (kiếm, găng) 12 bậc: mặc từ cấp 1, 11, 21 … 111; giá bậc 11–12 theo cùng công thức (bạc 100 quái cấp 105 / 115)
const WEAPON_LV = Array.from({ length: 12 }, (_, i) => 1 + 10 * i);
const GEAR_PRICE_X = [...GEAR_PRICE, 556900, 667400];
Object.entries(GEAR).forEach(([slot, g]) => g.ids.forEach(([id, name, icon], t) => {
  ITEMS_BASE[id] = { name, icon: icon || id, type: slot, tier: t + 1, lv: WEAPON_LV[t], price: GEAR_PRICE_X[t], q: 1, lines: [], stats: gearBaseStats(slot, t + 1) };
}));
/* GĂNG — vũ khí của đường Chưởng (người dùng chốt 2026-11-06, ảnh Gemini "Thập Nhị Quyền Giáp", gốc luu_tru/gang_12.png):
   12 bậc, mặc từ cấp 1, 11, 21 … 111 (GANG_LV; cấp tối đa hiện là 100 nên bậc 11, 12 chưa mặc được).
   Chỉ số như vũ khí cùng bậc (công 12 × bậc − 1), giá bậc 1–10 như GEAR_PRICE, bậc 11–12 theo cùng công thức (bạc 100 quái cấp 105 / 115).
   Đệ tử đường Chưởng: tiệm chỉ bán găng (không bán kiếm), kiếm đang có tự đổi thành găng cùng bậc, giữ loại + dòng phụ (gangSwap trong engine). */
const GANG_LV = WEAPON_LV;
const GANG = {
  path: 'chuong',
  ids: [['gang_1', 'Găng Vải'], ['gang_2', 'Găng Bát Quái'], ['gang_3', 'Găng Cửu Thiên'], ['gang_4', 'Găng Không Minh'],
    ['gang_5', 'Găng Ngũ Hành'], ['gang_6', 'Găng Long Linh'], ['gang_7', 'Găng Phục Hổ'], ['gang_8', 'Găng Thái Đẩu'],
    ['gang_9', 'Găng Kim Vàng'], ['gang_10', 'Găng Quyền Sáo'], ['gang_11', 'Găng Người Tuyết'], ['gang_12', 'Găng Xích Luyện']],
};
GANG.ids.forEach(([id, name], t) => {
  ITEMS_BASE[id] = { name, icon: id, type: 'weapon', tier: t + 1, lv: GANG_LV[t], price: GEAR_PRICE_X[t], q: 1, lines: [], stats: gearBaseStats('weapon', t + 1), gang: true };
});
/* CÔN — vũ khí của đường Côn (người dùng chốt 2026-11-06, ảnh Gemini "Thập Đại Thần Côn", gốc luu_tru/con_10.png):
   mới có 10 bậc (cấp 1 … 91), chỉ số / giá như vũ khí cùng bậc. Đệ tử đường Côn: chỉ mua côn, kiếm đang có tự đổi thành côn cùng bậc. */
const CON = {
  path: 'con',
  ids: [['con_1', 'Côn Gỗ'], ['con_2', 'Trường Sinh Trượng'], ['con_3', 'Tề Minh Trượng'], ['con_4', 'Từ Bi Côn'], ['con_5', 'Thiên Cương Côn'],
    ['con_6', 'Thanh Long Côn'], ['con_7', 'Hạc Lệ Côn'], ['con_8', 'Bàn Long Thiết Côn'], ['con_9', 'Bàn Long Cực Côn'], ['con_10', 'Lưu Nghệ Chúc']],
};
CON.ids.forEach(([id, name], t) => {
  ITEMS_BASE[id] = { name, icon: id, type: 'weapon', tier: t + 1, lv: WEAPON_LV[t], price: GEAR_PRICE_X[t], q: 1, lines: [], stats: gearBaseStats('weapon', t + 1), con: true };
});
// Dòng vũ khí theo đường: găng (Chưởng), côn (Côn), còn lại kiếm (đường Kiếm và người chưa vào đường)
const WEAPON_LINES = { gang: GANG, con: CON, kiem: { path: 'kiem', ids: GEAR.weapon.ids } };
const weaponKind = it => (it.gang ? 'gang' : it.con ? 'con' : 'kiem');
// Mốc cấp mặc theo dòng đồ của món (vũ khí: WEAPON_LV, số bậc theo dòng; đồ khác: GEAR_LV 10 bậc); mã món bậc t cùng dòng
const itLvs = it => !it ? GEAR_LV : WEAPON_LV.slice(0, (it && it.type === 'weapon' ? WEAPON_LINES[weaponKind(it)] : GEAR[it.type]).ids.length);
const gearLineId = (it, tier) => (it.type === 'weapon' ? WEAPON_LINES[weaponKind(it)].ids[tier - 1][0] : gearSlotId(it.type, tier));
const GEAR_FLAT = ['hp', 'mp', 'def', 'atk', 'spd'];
const gearLineVal = (k, tier) => Math.round(GEAR_LINE[k] * tier * 10) / 10;
/* CƯỜNG HÓA (người dùng chốt 2026-11-08) ở Lò Rèn: mỗi món tối đa +15, cấp cường hóa đi theo món đồ (nâng bậc vẫn giữ).
   - Mỗi cấp nhân dòng chính (không nhân dòng phụ): +1…+5 thêm 10%, +6…+10 thêm 15%, +11…+15 thêm 20% so với cấp trước
     (+10 = ×3,24, +15 = ×8,06).
   - Tỉ lệ thành công khi lên cấp n: rate[n − 1] %. Hỏng thì mất bạc, KHÔNG tụt cấp.
   - Chỉ tốn bạc, không theo bậc đồ (để không lách bằng cách cường hóa đồ bậc 1 rồi nâng bậc):
     bạc mỗi lần lên cấp n = gold[n − 1]; +1 = 1.000, +2 = 2.000, sau đó mỗi cấp = tổng hai cấp trước. */
const CUONG_HOA = {
  max: 15,
  rate: [100, 90, 80, 70, 60, 50, 40, 30, 20, 10, 8, 6, 4, 2, 1],
  step: n => (n <= 5 ? 0.1 : n <= 10 ? 0.15 : 0.2), // phần trăm thêm khi lên cấp n
  gold: [1000, 2000],
};
for (let i = 2; i < CUONG_HOA.max; i++) CUONG_HOA.gold[i] = CUONG_HOA.gold[i - 1] + CUONG_HOA.gold[i - 2];
CUONG_HOA.mul = [1];
for (let n = 1; n <= CUONG_HOA.max; n++) CUONG_HOA.mul[n] = CUONG_HOA.mul[n - 1] * (1 + CUONG_HOA.step(n));
/* Đồ Hiếm / Cực phẩm có mã dạng "mã_bậc#loại|dòng,dòng,..." (loại 2 = Hiếm, 3 = Cực phẩm), vd. "bich_hai_kiem#3|crit,crit,acc,lifesteal".
   Đồ đã cường hóa thêm đuôi "+N", vd. "bich_hai_kiem+7", "bich_hai_kiem#3|crit,crit,acc,lifesteal+12".
   Đồ Thường chưa cường hóa là mã gốc. ITEMS[mã] tự tính ra món đồ; Object.keys(ITEMS) chỉ liệt kê đồ gốc (loại Thường). */
/* SAO (người dùng chốt 2026-11-09): đồ rơi ở Cấm địa là Cực phẩm có 0–5 sao, mã thêm "*S" trước đuôi cường hóa, vd. "ao_vai#3|hp,hp,dodge,def*3+5".
   Mỗi sao nhân dòng chính thêm 10% (nhân với hệ số loại đồ: Cực phẩm 5 sao = ×1,5 × 1,5 = ×2,25), không nhân dòng phụ. Tỉ lệ sao theo độ khó cấm địa ở rate. */
const GEAR_STAR = { max: 5, per: 0.1,
  rate: [[60, 40], [50, 35, 15], [50, 30, 15, 5], [45, 30, 15, 5, 5], [45, 30, 10, 5, 5, 5]] }; // [0 sao, 1 sao, ...] theo độ khó Dễ … Địa Ngục
const starMul = s => 1 + (s || 0) * GEAR_STAR.per;
const gearId = (baseId, q, lines, plus, star) => (q > 1 ? `${baseId}#${q}|${lines.join(',')}` : baseId) + (star > 0 ? `*${star}` : '') + (plus > 0 ? `+${plus}` : '');
const gearSlotId = (slot, tier) => GEAR[slot].ids[tier - 1][0];
const FORGED_CACHE = {};
function forgedItem(id) {
  if (FORGED_CACHE[id]) return FORGED_CACHE[id];
  const m = /^([^#+*]+)(?:#([23])\|([a-zA-Z,]*))?(?:\*([1-5]))?(?:\+(\d{1,2}))?$/.exec(id);
  const b = m && ITEMS_BASE[m[1]];
  if (!b || !GEAR[b.type] || (!m[2] && !m[4] && !m[5])) return undefined;
  const q = +(m[2] || 1), lines = (m[3] || '').split(',').filter(Boolean), star = +(m[4] || 0), plus = +(m[5] || 0);
  if (plus < 0 || plus > CUONG_HOA.max || (m[5] && !plus)) return undefined;
  if (lines.length !== GEAR_QUALITY[q - 1].lines || lines.some(k => !GEAR[b.type].pool.includes(k))) return undefined;
  const stats = {};
  for (const k in b.stats) stats[k] = Math.round(b.stats[k] * GEAR_QUALITY[q - 1].mul * starMul(star) * CUONG_HOA.mul[plus]);
  lines.forEach(k => { stats[k] = Math.round(((stats[k] || 0) + gearLineVal(k, b.tier)) * 10) / 10; });
  return (FORGED_CACHE[id] = Object.assign({}, b, { base: m[1], q, lines, stats, plus, star, name: b.name + (star ? ` ${star} sao` : '') + (plus ? ` +${plus}` : '') }));
}
const ITEMS = new Proxy(ITEMS_BASE, {
  get: (t, k) => (typeof k === 'string' && !(k in t) && (k.includes('#') || k.includes('+') || k.includes('*')) ? forgedItem(k) : t[k]),
});
/* ------------------------- QUÁI VẬT ------------------------------
   exp: kinh nghiệm   gold: bạc rơi ra   boss: true = không bỏ chạy được
   acc / critRes: nếu không ghi sẽ tự tính theo cấp
   drops: [mã vật phẩm, % rơi, số lượng, nhiệm vụ] — có ghi nhiệm vụ thì chỉ rơi khi đang làm nhiệm vụ đó
   skills: chiêu thức của quái, chance = % dùng mỗi lượt
     type 'heal': value = % máu hồi, below = dùng khi máu dưới %, uses = số lần */
const ENEMIES = {
  // Luyện thử hiệu ứng tầng võ công (Võ học → Luyện với mộc nhân): đánh nhẹ, nhiều máu, không thưởng
  moc_nhan: { name: 'Mộc Nhân', icon: 'moc_nhan', lv: 1, story: true,
    hp: 4500, atk: 10, def: 12, spd: 3, crit: 2, critRes: 0, acc: 0, dodge: 2, exp: 0, gold: 0, skills: [],
    intro: 'Mộc nhân gỗ lim đứng sừng sững, mấy cánh tay gỗ xoay vù vù.' },
};

/* ------------------------- BẢN ĐỒ --------------------------------
   type: 'town' (an toàn) | 'wild' (có quái)      inn: giá nghỉ trọ      shops: cửa hàng ở đó   */
const LOCATIONS = {
  // Giữ mã cũ để bản lưu không hỏng. 20 ngọn núi luyện cấp: the_gioi.js ghi đè tên, mô tả, quái, sự kiện; ở đây chỉ còn biểu tượng + cảnh nền.
  // 5 vùng (thành): tên, mô tả; chỉ Thanh Vân Môn (duong_chau) có tiệm và nhà trọ.
  rung_sau_coc: { icon: "rung_sau_coc", bg: "forest" },
  phe_trach: { icon: "phe_trach", bg: "ruin" },
  rung_truc: { icon: "rung_truc", bg: "forest" },
  duong_chau: {
    name: "Thanh Vân Môn", icon: "duong_chau", type: 'town', bg: "town",
    desc: "Sơn môn Thanh Vân trên đỉnh núi Thiên Tuyệt, mây trắng vờn quanh những mái điện ngói xám. Từ quảng trường trước điện chính, bốn con đường đá tỏa ra bốn ngọn núi: Tiểu Trúc Phong, Đại Trúc Phong, Lạc Hà Phong và Thông Thiên Phong.",
    shops: ["duoc_phong_dc", "tho_ren_dc"],
    inn: 15,
  },
  lac_duong: {
    name: "Sa Mạc Man Hoang", icon: "lac_duong", type: 'town', bg: "town",
    desc: "Biển cát mênh mông phía tây, gió nóng thổi suốt ngày đêm. Giữa sa mạc, quanh ốc đảo duy nhất, là sào huyệt Trường Sinh Đường: kẻ nào uống nước ở đây đều phải trả bằng máu.",
  },
  tuong_duong: {
    name: "Đầm Lầy Hiệp Xuyên", icon: "tuong_duong", type: 'town', bg: "town",
    desc: "Chướng khí xanh lục phủ quanh năm, bùn sâu không thấy đáy. Trấn nhà sàn ở mép đầm là nơi duy nhất còn bóng người. Độc ở đây không thuốc nào giải nổi, chỉ người có công phu mới tự bức được độc ra. Sâu trong đầm là sào huyệt Vạn Độc Môn.",
  },
  thanh_do: {
    name: "Thung Lũng Tiêu Dao", icon: "thanh_do", type: 'town', bg: "town",
    desc: "Thung lũng hoa nở bốn mùa, suối ấm chảy quanh, tiếng đàn văng vẳng. Cảnh đẹp tới mê lòng người, nhưng kẻ lạc vào sâu ít ai trở ra. Hợp Hoan Phái chiếm cứ nơi này.",
  },
  truong_an: {
    name: "Hồ Kỳ Sơn", icon: "truong_an", type: 'town', bg: "town",
    desc: "Hồ nước xanh thẳm giữa thiên hạ, quanh hồ núi non kỳ dị. Tương truyền đáy hồ phong ấn Ma Vương thời thượng cổ. Đệ tử Quỷ Vương Tông lảng vảng quanh đây.",
  },
  hoang_mac: { icon: "hoang_mac", bg: "mountain" },
  bach_da_son: { icon: "bach_da_son", bg: "mountain" },
  linh_xa_dao: { icon: "linh_xa_dao", bg: "forest" },
  hai_long_dong: { icon: "hai_long_dong", bg: "abyss" },
  van_doc_lam: { icon: "van_doc_lam", bg: "forest" },
  ngu_doc_dong: { icon: "ngu_doc_dong", bg: "evil" },
  bang_nguyen: { icon: "bang_nguyen", bg: "snow" },
  hoa_son: { icon: "hoa_son", bg: "mountain" },
  thien_co_cac: { icon: "thien_co_cac", bg: "evil" },
  tu_qua_nhai: { icon: "tu_qua_nhai", bg: "mountain" },
  hac_phong: { icon: "hac_phong", bg: "mountain" },
  vuc_vo_luong: { icon: "vuc_vo_luong", bg: "abyss" },
  tuyet_son: { icon: "tuyet_son", bg: "snow" },
  van_truong_coc: { icon: "van_truong_coc", bg: "valley" },
  mat_dao: { icon: "mat_dao", bg: "evil" },
  huyet_ma_dan: { icon: "huyet_ma_dan", bg: "evil" },
};

/* ------------------------- CỬA HÀNG ------------------------------
   items: bán vật phẩm      skills: bán võ công (Tàng Kinh Các)     */
const SHOPS = {
  // Không bán Giải Độc Đan (người dùng chốt 2026-11-06: độc là một tính năng, chỉ giải bằng võ học, không bằng thuốc)
  duoc_phong_dc: { name: 'Hồi Xuân Dược Phòng', icon: 'duoc_phong',
    // Thuốc cho cả 5 vùng (chỉ Thanh Vân có tiệm, người dùng chốt 2026-11-06)
    items: ['thuoc_tri_thuong', 'kim_sang_duoc', 'dai_hoan_dan', 'cuu_chuyen_hoan', 'thien_huong_cao', 'hoi_khi_dan', 'bo_khi_dan', 'tuyet_lien', 'tu_kim_linh_dich', 'bich_ngoc_lo', 'duong_khi_hoan', 'hoan_duong_dan', 'tuc_menh_dan'] },
  // Thợ Rèn: rèn thêm dòng phụ và tôi luyện trang bị (FORGE), mỗi thành lớn một người
  tho_ren_dc: { name: 'Lò Rèn Thanh Vân', icon: 'tho_ren', forge: true },
};

/* ============================================================
   TRUYỆN CÓ TRANH (cốt truyện mới, 2026-11-04)
   Mỗi chương là một chuỗi trang: img = tranh trong game/img/truyen/ (bỏ đuôi .jpg),
   scene = tên phân cảnh (hiện nhỏ trên khung chữ), who = người nói (thay tên phân cảnh), text = lời kể.
   Trang có cover: true là bìa chương (tên chương to giữa tranh).
   focus: chỗ đặt tâm tranh theo chiều ngang (%) khi khung bị cắt bớt hai bên (điện thoại khung vuông), để không mất nhân vật.
   Đổi giới tính trong lời kể: {be} cậu bé / cô bé, {cau} cậu / cô; viết hoa chữ đầu ({Be}, {Cau}) thì ra chữ hoa.
   ============================================================ */
const TRUYEN = {
  c1: {
    title: 'Chương 1', name: 'Đêm trăng máu ở Thảo Miếu Thôn', music: 'ruin',
    focus: { c1_0: 64, c1_1: 74, c1_2: 62, c1_3: 46, c1_4: 54, c1_5: 46, c1_6: 46, c1_7: 34 },
    pages: [
      { img: 'c1_0', cover: true },
      { img: 'c1_1', scene: 'Thảo Miếu Thôn', text: 'Dưới chân núi Thiên Tuyệt, nơi mây trắng quanh năm vờn quanh những vách đá dựng đứng, có một ngôi làng nhỏ tên là Thảo Miếu Thôn. Làng chỉ vài chục nóc nhà tranh, người dân sống bằng nghề đốn củi, hái thuốc; chiều chiều khói bếp bay lên, hòa vào sương núi.' },
      { img: 'c1_1', scene: 'Thảo Miếu Thôn', text: 'Trong làng có một {be} sáu tuổi, ngày theo cha mẹ lên rừng, tối về nằm nghe ông trưởng thôn kể chuyện các cao thủ Thanh Vân Môn trên đỉnh núi, kiếm chém đá vỡ, chưởng làm rung cả vách núi. {Cau} chưa từng nghĩ có ngày chính mình sẽ bước lên con đường ấy.' },
      { img: 'c1_2', scene: 'Đêm trăng máu', text: 'Đêm ấy trăng tròn mà đỏ quạch như nhuốm máu. Cả thôn đã chìm trong giấc ngủ thì một bóng người áo xám loạng choạng bước vào đầu làng.' },
      { img: 'c1_2', scene: 'Đêm trăng máu', text: 'Đó là Vô Danh Tăng, một cao thủ võ lâm từng khiến giang hồ nể phục, nay trúng phải kịch độc của Thất Sát Môn. Độc ngấm vào kinh mạch, chân khí đảo loạn, thần trí ông chìm trong tẩu hỏa nhập ma.' },
      { img: 'c1_2', scene: 'Đêm trăng máu', text: 'Tiếng thét đầu tiên xé toang màn đêm, rồi tiếng chó sủa, tiếng trẻ khóc, tiếng mái tranh bốc cháy. Chưởng phong của kẻ điên loạn quét tới đâu, nơi đó không còn ai đứng dậy.' },
      { img: 'c1_3', scene: 'Đôi mắt ngây thơ', text: '{Be} nấp sau chum nước trong gian bếp đổ nát, run rẩy nhìn bóng người đẫm máu tiến lại gần. Bàn tay nhuốm đỏ giơ lên, chỉ còn cách đỉnh đầu {cau} một tấc.' },
      { img: 'c1_3', scene: 'Đôi mắt ngây thơ', text: '{Cau} không khóc, cũng không chạy, chỉ ngước đôi mắt trong veo nhìn thẳng vào ông. Trong đôi mắt ấy không có oán hận, chỉ có nỗi sợ và sự ngơ ngác của một đứa trẻ chưa hiểu chuyện gì đang xảy ra.' },
      { img: 'c1_3', scene: 'Đôi mắt ngây thơ', text: 'Bàn tay khựng lại giữa không trung. Ánh đỏ trong mắt Vô Danh Tăng tan dần, thần trí ông bừng tỉnh. Ông nhìn quanh: cả ngôi làng đã chìm trong biển lửa.' },
      { img: 'c1_4', scene: 'Truyền công', text: 'Vô Danh Tăng quỳ sụp xuống giữa tro tàn. Ông biết độc đã ăn vào tâm mạch, mình không sống qua nổi đêm nay, còn món nợ máu với cả Thảo Miếu Thôn thì có chết trăm lần cũng không trả hết.' },
      { img: 'c1_4', scene: 'Truyền công', text: 'Đứa trẻ trước mặt là người duy nhất còn sống. Ông đặt bàn tay lên đỉnh đầu {cau}, dồn hết chân khí cả đời truyền vào: một môn nội công không tên và một bộ quyền pháp không tên, Vô Danh Tâm Pháp và Vô Danh Quyền.' },
      { img: 'c1_4', who: 'Vô Danh Tăng', text: '"Ta không có tên, võ của ta cũng không có tên. Sau này con muốn gọi ta là kẻ thù hay ân nhân, tùy con."' },
      { img: 'c1_4', scene: 'Truyền công', text: 'Nói xong, ông gục xuống và không bao giờ tỉnh lại nữa.' },
      { img: 'c1_5', scene: 'Thanh Vân xuống núi', text: 'Ánh lửa từ Thảo Miếu Thôn soi đỏ cả sườn núi Thiên Tuyệt. Trên đỉnh núi, Thanh Vân Môn thấy điềm chẳng lành, lập tức cử đệ tử xuống núi. Khi họ tới nơi thì trời vừa hửng sáng, cả làng chỉ còn tro tàn và xác người.' },
      { img: 'c1_5', scene: 'Thanh Vân xuống núi', text: 'Giữa đống đổ nát, họ tìm thấy một {be} ngồi lặng bên thi thể một vị tăng áo xám, đôi mắt khô khốc, không còn giọt nước mắt nào. Họ chôn cất dân làng dưới chân núi, đắp cho vị tăng một nấm mộ không tên, rồi đưa {be} đi.' },
      { img: 'c1_6', scene: 'Tạp vụ Thanh Vân Môn', text: 'Các đệ tử đưa {be} về Thanh Vân Môn. Chưởng môn nghe chuyện thì thở dài, thấy {cau} không còn nơi nương tựa nên cho ở lại.' },
      { img: 'c1_6', scene: 'Tạp vụ Thanh Vân Môn', text: 'Nhưng {cau} không có căn cốt nào khiến trưởng lão để mắt, cũng chẳng ai biết trong người {cau} đang ngủ yên một luồng chân khí kỳ lạ. Thế là {cau} được nhận làm tạp vụ: gánh nước, chẻ củi, quét sân, những việc đệ tử chính thức chẳng ai muốn làm.' },
      { img: 'c1_7', scene: 'Tạp vụ Thanh Vân Môn', text: 'Đêm đêm, khi cả môn phái đã say ngủ, {cau} lại ngồi một mình, nhớ câu nói cuối cùng của vị tăng không tên.' },
      { img: 'c1_7', scene: 'Hành trình bắt đầu', text: 'Tro tàn của Thảo Miếu Thôn đã nguội, nhưng những câu hỏi trong lòng {be} thì chưa. Thất Sát Môn là ai, vì sao lại hạ độc Vô Danh Tăng? Luồng chân khí không tên trong người rồi sẽ đưa {cau} tới đâu?' },
      { img: 'c1_7', scene: 'Hành trình bắt đầu', text: 'Từ gian phòng tạp vụ nhỏ bé của Thanh Vân Môn, một con đường giang hồ dài đằng đẵng đang chờ phía trước.' },
    ],
  },
  /* Chương 2: tranh c2_0 … c2_8 (chưa có, chờ người dùng tạo bằng Gemini; câu lệnh ở luu_tru/cot_truyen/cau_lenh_chuong_2.md).
     Phân cảnh 6 và 7 dùng chung tranh c2_6. Chưa gắn vào luồng game. Có tranh rồi thì thêm focus như c1. */
  c2: {
    title: 'Chương 2', name: 'Tìm hiểu Thanh Vân Môn', music: 'temple',
    pages: [
      { img: 'c2_0', cover: true },
      { img: 'c2_1', scene: 'Những ngày đầu trên núi', text: 'Những ngày đầu ở Thanh Vân Môn, {be} dậy từ lúc trời còn tối, gánh nước từ suối lên, quét sạch bậc đá trước điện chính rồi mới được ăn bữa sáng. Vừa làm, {cau} vừa lặng lẽ quan sát.' },
      { img: 'c2_1', scene: 'Những ngày đầu trên núi', text: '{Cau} dần hiểu rằng Thanh Vân Môn là một môn phái ẩn thế: không tranh danh, không đoạt lợi, không bước chân vào những cuộc phân tranh của giang hồ. Người dưới núi gọi họ là những cao thủ tuyệt thế, nhưng trên núi chỉ có những con người lặng lẽ luyện võ giữa mây trời.' },
      { img: 'c2_2', scene: 'Đạo Huyền Chân Nhân', text: 'Đứng đầu môn phái là Đạo Huyền Chân Nhân. Ông đã sống cả đời trên đỉnh Thiên Tuyệt, chưa từng xuống núi tranh hùng, nhưng giang hồ ai cũng biết ông là một trong những người thấu hiểu sự tuyệt diệu của võ học nhất thiên hạ.' },
      { img: 'c2_2', scene: 'Đạo Huyền Chân Nhân', text: '{Be} chỉ thấy ông đôi lần, khi ông chắp tay đứng trên vách đá nhìn mây trôi suốt cả buổi chiều. Có lần ông dừng chân trước khoảng sân {cau} đang quét, nhìn {cau} rất lâu, rồi lặng lẽ bỏ đi mà không nói một lời.' },
      { img: 'c2_3', scene: 'Kiếm của Lạc Kiếm Nhất', text: 'Thanh Vân Môn có ba đường võ học chính. Đường thứ nhất là Kiếm Pháp, do Lạc Kiếm Nhất đứng đầu. Ông ít nói, ánh mắt lạnh như mũi kiếm, sáng nào cũng một mình luyện kiếm bên thác nước.' },
      { img: 'c2_3', scene: 'Kiếm của Lạc Kiếm Nhất', text: '{Be} từng nấp sau gốc tùng nhìn trộm: kiếm của ông nhanh tới mức tiếng nước đổ còn chưa kịp vọng lại thì kiếm đã tra vào vỏ.' },
      { img: 'c2_4', scene: 'Chưởng của Phổ Trí Đại Sư', text: 'Đường thứ hai là Chưởng Pháp, do Phổ Trí Đại Sư đứng đầu. Ông là người hiền hòa nhất núi, gặp ai cũng cười, đôi khi còn dúi cho {be} tạp vụ một chiếc bánh chay.' },
      { img: 'c2_4', scene: 'Chưởng của Phổ Trí Đại Sư', text: 'Nhưng khi ông xuất chưởng, cả sân luyện võ như lặng đi, tảng đá ngàn cân trước mặt vỡ đôi mà bàn tay ông không hề trầy xước.' },
      { img: 'c2_5', scene: 'Côn của Vương Lâm', text: 'Đường thứ ba là Côn Pháp, do Vương Lâm đứng đầu. Ông người cao lớn, tính thẳng như cây côn trong tay, mắng đệ tử oang oang khắp núi.' },
      { img: 'c2_5', scene: 'Côn của Vương Lâm', text: 'Côn của ông không hoa mỹ, chỉ có quét, bổ, chọc, nhưng mỗi đòn đều nặng tựa núi đổ; mười đệ tử vây đánh cũng không ai trụ nổi quá ba chiêu.' },
      { img: 'c2_6', scene: 'Bốn bậc đệ tử', text: 'Ở Thanh Vân Môn, đường võ học nào cũng chia thành bốn bậc đệ tử. Thấp nhất là đệ tử ngoại môn, chỉ được học những thế căn bản và gánh đủ việc nặng trong môn. Vượt qua khảo hạch mới lên đệ tử nội môn, được bước vào Tàng Kinh Các đọc võ phổ.' },
      { img: 'c2_6', scene: 'Bốn bậc đệ tử', text: 'Trên nữa là tinh anh đệ tử, những người được trưởng lão đích thân chỉ điểm. Cao nhất là chân truyền đệ tử, người được trao lại tinh túy của cả một đường võ, mỗi đời chỉ vài người.' },
      { img: 'c2_6', scene: 'Bốn bậc đệ tử', text: 'Mỗi lần lên bậc là một vòng tuyển chọn khắt khe, trăm người dự thi may ra vài người lọt qua. Còn {be}, một tạp vụ, thậm chí còn chưa đứng được ở bậc thấp nhất.' },
      { img: 'c2_6', scene: 'Môn phái suy vi', text: 'Ba vị trưởng lão là ba ngọn núi của Thanh Vân Môn, nhưng dưới bóng họ lại là một khoảng trống. Nhiều đời đệ tử gần đây, dù chăm chỉ đến đâu, cũng không lĩnh hội nổi tinh túy võ học của sư môn.' },
      { img: 'c2_6', scene: 'Môn phái suy vi', text: 'Kiếm phổ, chưởng quyết, côn kinh vẫn nằm nguyên trong Tàng Kinh Các, mà người đọc hiểu được thì mỗi năm một ít đi. Những đêm khuya, {be} hay nghe các sư huynh thở dài: Thanh Vân Môn rồi sẽ ra sao khi ba vị trưởng lão không còn nữa?' },
      { img: 'c2_7', scene: 'Thất Sát Môn', text: 'Rồi {cau} nghe tới cái tên đã ám ảnh mình từ đêm trăng máu: Thất Sát Môn. Đó là kẻ thù truyền kiếp của Thanh Vân Môn, đứng đầu là Sát Thiên Mạch, một cao thủ khét tiếng tàn ác, giết người không ghê tay.' },
      { img: 'c2_7', scene: 'Thất Sát Môn', text: 'Thấy Thanh Vân Môn ngày một suy yếu, Thất Sát Môn nhiều lần kéo tới chân núi gây sự, buông lời đòi diệt môn. {Be} siết chặt cây chổi trong tay.' },
      { img: 'c2_7', scene: 'Thất Sát Môn', text: 'Kẻ đã hạ độc Vô Danh Tăng, kẻ đã gián tiếp thiêu rụi Thảo Miếu Thôn, hóa ra cũng chính là mối họa lớn nhất của nơi đã cưu mang {cau}.' },
      { img: 'c2_8', scene: 'Lời thề dưới trăng', text: 'Đêm ấy, khi cả núi đã chìm vào giấc ngủ, {be} lẻn ra sau núi. Dưới ánh trăng, {cau} nhắm mắt, để luồng chân khí vô danh chảy chầm chậm trong kinh mạch, rồi tung ra từng quyền vụng về của Vô Danh Quyền.' },
      { img: 'c2_8', scene: 'Lời thề dưới trăng', text: 'Con đường phía trước còn rất xa: từ tạp vụ lên ngoại môn, nội môn, tinh anh rồi chân truyền, mỗi bước là một kỳ tuyển chọn khắc nghiệt.' },
      { img: 'c2_8', scene: 'Lời thề dưới trăng', text: '{Cau} chưa biết mình sẽ đi theo kiếm, chưởng hay côn, nhưng {cau} biết một điều: sẽ có một ngày Thất Sát Môn phải trả giá.' },
    ],
  },
};

/* =====================================================================
   LOẠI HIỆP KHÁCH (2026-11-12, người dùng chốt 5 loại cho game xếp đội; chức năng làm sau)
   icon: game/img/icon/loai_<mã>.png (ảnh Gemini của người dùng, gốc luu_tru/trang_chu/loai_tuong_icon.png)
   ===================================================================== */
const HERO_ROLES = {
  ho_ve:     { name: 'Hộ Vệ',     color: '#4aa8ff', desc: 'Thiên về Thủ, Khí huyết, Né; bị ưu tiên tấn công' },
  cong_kich: { name: 'Công Kích', color: '#ff7a3a', desc: 'Thiên về lực Công, kỹ năng sát thương cao' },
  ho_tro:    { name: 'Hỗ Trợ',    color: '#ffd23a', desc: 'Thiên về hỗ trợ, tăng sức chiến đấu cho toàn đội' },
  tri_lieu:  { name: 'Trị Liệu',  color: '#5fe04a', desc: 'Có năng lực hồi phục Khí huyết cao' },
  ky_nang:   { name: 'Kỹ Năng',   color: '#c86aff', desc: 'Nộ khí luôn đầy' },
};

/* NGŨ HÀNH của hiệp khách (2026-11-12, người dùng chốt: dùng để khắc hệ, luật khắc làm sau). Chưa có icon ảnh: vẽ tạm vòng tròn màu */
const NGU_HANH = {
  kim:  { name: 'Kim',  color: '#e8c35a' },
  moc:  { name: 'Mộc',  color: '#4fbf5a' },
  thuy: { name: 'Thủy', color: '#3a8cff' },
  hoa:  { name: 'Hỏa',  color: '#ff5a3a' },
  tho:  { name: 'Thổ',  color: '#b07a3a' },
  am:   { name: 'Ám',   color: '#9a5aff' },   // hệ thứ sáu (vòng tím trong game mẫu; Nhậm Doanh Doanh, Nhậm Ngã Hành), người dùng đặt tên 2026-11-12
};
