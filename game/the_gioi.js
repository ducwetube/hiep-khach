'use strict';
/* =================================================================
   HIỆP KHÁCH GIANG HỒ — THẾ GIỚI MỚI (lối chơi farm map, cấp 1–100)
   5 thành × 4 map = 20 map, mỗi map 5 cấp quái:
     Dương Châu 1–20, Lạc Dương 21–40, Tương Dương 41–60, Thành Đô 61–80, Trường An 81–100.
   Map mở khi nhân vật đạt cấp thấp nhất của map; thành mở khi đạt cấp đầu của thành (canEnter trong engine đọc minLv).
   Map dùng lại id địa điểm cũ (giữ biểu tượng, cảnh nền); file này ghi đè LOCATIONS khi tải.
   Mỗi lần gặp quái: 1–6 con ngẫu nhiên, cấp ngẫu nhiên trong khoảng cấp của map; mỗi map một boss gặp ngẫu nhiên.
   Quái hình người mang ngẫu nhiên 1 võ công + 1 nội công + 1 công pháp phổ thông cùng hệ (SKILLS có pho: true) + 1 khinh công.
   Hàm cho nơi khác dùng:
     genEncounter(mapId)  → mảng 1–6 object quái (đủ chỉ số như ENEMIES, obj.id = mã gốc trong ENEMIES để đếm nhiệm vụ diệt)
     tgBoss(mapId)        → object boss của map
     tgExploreRoll(mapId) → { boss: true|false, list: [...] } (đã tung xúc xắc gặp boss)
     tgRewardMult(n)      → hệ số thưởng theo số quái trong trận
     mapForLevel(lv)      → id map hợp cấp (map thứ ⌈cấp/5⌉)
     MAPS[id]             → { city, idx, lvMin, lvMax, name, enemies: [mã quái], boss: mã boss }
   File này nạp SAU data.js và ban_do.js/san_dau.js, TRƯỚC engine.js; hàm dùng engine (normSkill, passiveStats) chỉ gọi khi chạy.
   ================================================================= */

const TG = {
  /* Số quái mỗi lần gặp: [số con, trọng số] (người dùng chốt 2026-10-27: map càng cao càng hay gặp đông quái).
     countLow dùng cho map đầu (cấp 1), countHigh cho map cuối (cấp 100), map giữa trộn theo tỉ lệ cấp (tgCount). */
  countLow: [[1, 55], [2, 28], [3, 12], [4, 4], [5, 1], [6, 0]],
  countHigh: [[1, 5], [2, 10], [3, 18], [4, 24], [5, 23], [6, 20]],
  bossChance: 3,    // % mỗi lần gặp quái thì gặp boss của map
  fightChance: 75,  // % thám hiểm gặp quái
  // Hệ số thưởng theo số quái (người dùng chốt): 1 con ×1, 2 ×1,2 ... 6 ×2
  rewardMult: [1, 1, 1.2, 1.4, 1.6, 1.8, 2],
  /* Sức quái tính theo "nhân vật mẫu" cùng cấp (chỉ số trung bình các phái + trang bị cơ bản bậc hợp cấp, tgRef):
     hits = số lượt nhân vật mẫu đánh thường hạ được một quái thường;
     turns = số lượt một quái thường đánh thường hạ được nhân vật mẫu.
     Vd. hits 2, turns 18: gặp 1 con mất ~11% khí huyết, 2 con ~33%, 3 con ~67%, 4 con trở lên phải dùng thuốc / hồi máu hoặc bỏ chạy.
     (Các số hits / turns / def ở đây là của cách tính cũ, không còn dùng cho chỉ số quái.) */
  /* Chỉ số quái theo cấp (người dùng chốt 2026-10-27): [cấp 1, mỗi cấp thêm].
     Chính xác 100, bạo kích / né / kháng bạo 0, không tăng theo cấp (người dùng chốt 2026-11-02, giống nhân vật).
     Kinh nghiệm: cấp 1 là 5, mỗi cấp = cấp trước + số cấp + 5 (5, 12, 20, 29, 39...).
     Bạc: cấp 1 là 5, mỗi cấp = cấp trước + số cấp (5, 7, 10, 14, 19...), lúc rơi lệch ngẫu nhiên ±10%.
     Không nhân thêm độ khó DO_KHO (con số ở đây là con số trong trận). */
  mob: {
    hp: [50, 20], mp: [30, 10], atk: [15, 4], def: [10, 2], spd: [10, 1],
    acc: 100, pct: 0,
    exp: lv => lv * (lv + 1) / 2 + 5 * lv - 1,
    gold: lv => lv * (lv + 1) / 2 + 4,
  },
  hits: 2, turns: 18,
  def: lv => 4 + 0.5 * lv,
  spd: lv => 0.95,           // tốc độ quái = × tốc độ nhân vật mẫu
  crit: lv => 5 + lv * 0.12, dodge: lv => 4 + lv * 0.08,
  // (cũ, không còn dùng: kinh nghiệm quái giờ ở TG.mob.exp; kinh nghiệm lên cấp ở expNeed của engine.js)
  expNeed: lv => Math.round(25 * Math.pow(lv, 1.5) * (1 + lv / 12) + 10),
  killsPerLv: lv => 15 + 0.35 * lv,
  gold: lv => Math.exp(1.5527 + 0.8726 * Math.log(lv)) - 1, // bạc: đường cong đo từ quái cũ cấp 1–49
  mul: { hp: 1, atk: 1, def: 1, exp: 1, gold: 1 }, // chỉnh chung cho mọi quái
  // Kiểu quái: nhân chỉ số (crit, dodge là cộng thêm)
  styles: {
    bal: {},
    tank: { hp: 1.35, atk: 0.85, def: 1.3, spd: 0.9 },
    glass: { hp: 0.8, atk: 1.2, def: 0.85, crit: 5 },
    fast: { hp: 0.9, atk: 0.95, spd: 1.3, dodge: 6 },
  },
  // Tinh Anh của map (trong mã vẫn gọi boss): người dùng chốt 2026-10-27 máu ×3, công và thủ ×1,5, tốc ×2
  boss: { hp: 3, atk: 1.5, def: 1.5, spd: 2, crit: 5, exp: 6, gold: 6 },
  // Thuốc rơi theo thành: [thuốc máu, thuốc nội lực]; quái thường rơi % dưới, boss chắc rơi 2 mỗi loại
  potions: [['thuoc_tri_thuong', 'hoi_khi_dan'], ['kim_sang_duoc', 'bo_khi_dan'], ['dai_hoan_dan', 'tuyet_lien'],
    ['cuu_chuyen_hoan', 'tu_kim_linh_dich'], ['thien_huong_cao', 'bich_ngoc_lo']],
  dropChance: [6, 5],
  elems: ['am', 'duong', 'thaicuc'],
};

// 5 thành: cấp đầu, cảnh, các thành nối với nhau
const TG_CITIES = {
  duong_chau: { idx: 0, links: ['lac_duong', 'tuong_duong'] },
  lac_duong: { idx: 1, links: ['duong_chau', 'tuong_duong', 'truong_an'] },
  tuong_duong: { idx: 2, links: ['duong_chau', 'lac_duong', 'thanh_do'] },
  thanh_do: { idx: 3, links: ['tuong_duong', 'truong_an'] },
  truong_an: { idx: 4, links: ['lac_duong', 'thanh_do'] },
};

/* 20 map. mobs: [tên, hình (khóa ENEMY_ART) hoặc {sect, title} (hình chibi môn phái), kiểu]
   boss: { name, art, move: chiêu riêng } */
const TG_MAPS = [
  // ---------------- Thanh Vân Môn (1–20) ----------------
  // Người dùng chốt 2026-11-04: Thanh Vân Môn thay Dương Châu (giữ mã duong_chau và mã 4 map cũ để bản lưu không hỏng),
  // 4 ngọn núi: Tiểu Trúc 1–5, Đại Trúc 6–10, Lạc Hà 11–15, Thông Thiên 16–20; quái do người dùng đặt, Tinh Anh Claude đặt.
  // Hình quái đang mượn tạm hình có sẵn, chờ ảnh người dùng tạo bằng Gemini.
  { id: 'rung_truc', city: 'duong_chau', name: 'Tiểu Trúc Phong', icon: 'rung_truc', bg: 'forest',
    desc: 'Ngọn núi nhỏ nhất của Thanh Vân, rừng trúc xanh phủ kín sườn núi, suối trong róc rách. Đám lục lâm thảo khấu dựng lều trong rừng trúc, chặn đường đệ tử xuống núi.',
    // Ảnh Gemini của người dùng (2026-11-06): game/img/quai/*.png, khai báo ở ENEMY_IMG (chibi_quai.js)
    mobs: [['Trúc Lâm Chùy Khách', 'tm_lao_chuy', 'tank'], ['Trúc Lâm Đạo Tặc', 'tm_an_si', 'bal'], ['Lục Lâm Kiếm Khách', 'tm_kiem_khach', 'fast']],
    boss: { name: 'Trúc Lâm Trại Chủ', art: 'tm_hac_rau', move: { name: 'Bá Vương Phá Trúc', power: 2.0, effect: { type: 'stun', chance: 20, turns: 1 } } } },
  { id: 'phe_trach', city: 'duong_chau', name: 'Đại Trúc Phong', icon: 'rung_truc', bg: 'forest',
    desc: 'Rừng trúc già cao vút, lối mòn dẫn xuống thôn trang dưới chân núi. Đám lưu manh côn đồ từ trấn trên kéo lên đây ức hiếp người hái thuốc.',
    mobs: [['Lưu Manh', 'luu_manh', 'fast'], ['Côn Đồ', 'con_do', 'bal']],
    boss: { name: 'Côn Đồ Đầu Mục', art: 'con_do_dau_muc', move: { name: 'Thiết Côn Loạn Đả', power: 0.8, hits: 3 } } },
  { id: 'hac_phong', city: 'duong_chau', name: 'Lạc Hà Phong', icon: 'hac_phong', bg: 'mountain',
    desc: 'Ngọn núi đỏ rực ráng chiều, vách đá dựng đứng, đường mòn hiểm trở. Thảo khấu, sơn tặc dựng trại trên sườn núi, chặn đường cướp hàng.',
    mobs: [['Thảo Khấu', 'thao_khau', 'tank'], ['Sơn Tặc', 'son_tac_do', 'bal']],
    boss: { name: 'Sơn Tặc Trại Chủ', art: 'son_tac_trai_chu', move: { name: 'Khai Sơn Đại Đao', power: 2.1 } } },
  { id: 'linh_xa_dao', city: 'duong_chau', name: 'Thông Thiên Phong', icon: 'hoa_son', bg: 'mountain',
    desc: 'Ngọn núi cao nhất Thiên Tuyệt, đỉnh xuyên mây. Người của Thất Sát Môn lén lút lảng vảng quanh đây, cùng đám sát thủ giang hồ nhận tiền giết người.',
    mobs: [['Đệ Tử Thất Sát', 'de_tu_that_sat', 'bal'], ['Sát Thủ Giang Hồ', 'sat_thu', 'fast']],
    boss: { name: 'Thất Sát Hương Chủ', art: 'that_sat_huong_chu', move: { name: 'Thất Sát Đoạt Mệnh', power: 1.1, hits: 2, effect: { type: 'bleed', chance: 40, turns: 3, value: 0.4 } } } },
  // ---------------- Sa Mạc Man Hoang (21–40) ----------------
  // Người dùng duyệt 2026-11-06 (Claude đề xuất tên map + quái theo cốt truyện chương 5): rìa sa mạc → sào huyệt Trường Sinh Đường.
  // Giữ mã 4 map cũ để bản lưu không hỏng. Hình quái: ảnh Gemini của người dùng (2026-11-07).
  // Phần tử thứ 4 của quái (và boss.stats) = chỉ số cộng thêm; người Trường Sinh Đường hút huyết rất mạnh (người dùng chốt: "hút máu ác").
  { id: 'van_truong_coc', city: 'lac_duong', name: 'Hoàng Sa Cổ Đạo', bg: 'mountain',
    desc: 'Con đường thương đoàn xưa xuyên qua biển cát, xương lạc đà rải dọc lối đi. Sa tặc rình sau cồn cát, đao khách lang bạt chực cướp hàng của thương đoàn.',
    // Ảnh Gemini của người dùng (2026-11-07), khai báo ở ENEMY_IMG (chibi_quai.js)
    mobs: [['Sa Tặc', 'sa_tac_mh', 'bal'], ['Sa Mạc Đao Khách', 'tm_dao_khach', 'fast'], ['Sa Mạc Côn Khách', 'tm_gay_khach', 'tank']],
    boss: { name: 'Sa Tặc Đầu Lĩnh', art: 'sa_tac_dau_linh', move: { name: 'Cuồng Sa Loạn Đao', power: 0.8, hits: 3, effect: { type: 'bleed', chance: 40, turns: 3, value: 0.4 } } } },
  { id: 'tuyet_son', city: 'lac_duong', name: 'Lưu Sa Hải', bg: 'mountain',
    desc: 'Biển cát lún mênh mông, bão cát nổi lên bất chợt nuốt trọn cả đoàn người. Kẻ ẩn cư giữa biển cát chẳng phải người lương thiện, chúng chờ ai sa chân để lột sạch của.',
    mobs: [['Lưu Sa Võ Tăng', 'tm_kim_tang', 'tank'], ['Lưu Sa Song Thứ', 'tm_song_dao', 'fast'], ['Thu Thi Nhân', 'tm_yeu_khach', 'glass']],
    boss: { name: 'Lưu Sa Quái Lão', art: 'tm_lao_kinh', move: { name: 'Lưu Sa Thôn Nhật', power: 2.0, effect: { type: 'stun', chance: 30, turns: 1 } } } },
  { id: 'tu_qua_nhai', city: 'lac_duong', name: 'Tàn Thành Lâu Lan', bg: 'ruin',
    desc: 'Thành cổ chôn vùi trong cát, chỉ còn tường đổ và tháp gãy. Trường Sinh Đường bắt người về đây lấy máu, kẻ bị hút cạn hóa thành Huyết Nô lang thang.',
    mobs: [['Huyết Nô', 'huyet_no', 'tank', { lifesteal: 15 }], ['Đệ Tử Trường Sinh Đường', 'de_tu_truong_sinh', 'bal', { lifesteal: 20 }], ['Huyết Y Nữ Ma', 'tm_nu_do', 'fast', { lifesteal: 30 }]],
    boss: { name: 'Huyết Thi Tướng Quân', art: 'huyet_thi_tuong', stats: { lifesteal: 25 }, move: { name: 'Huyết Thi Phệ Hồn', power: 2.2, drain: 60 } } },
  { id: 'hoa_son', city: 'lac_duong', name: 'Huyết Trì Ngoại Điện', bg: 'evil',
    desc: 'Điện ngoài sào huyệt Trường Sinh Đường, giữa sân là ao máu sôi sùng sục. Kẻ canh giữ nơi đây sống bằng máu người, càng đánh càng khỏe.',
    mobs: [['Huyết Ảnh Sát Thủ', 'huyet_anh_sat_thu', 'glass', { lifesteal: 25 }], ['Trường Sinh Hộ Vệ', 'truong_sinh_ho_ve', 'tank', { lifesteal: 15 }], ['Huyết Luyện Đạo Sĩ', 'huyet_luyen_dao_si', 'bal', { lifesteal: 30 }]],
    boss: { name: 'Trường Sinh Hộ Pháp', art: 'truong_sinh_ho_phap', stats: { lifesteal: 35 }, move: { name: 'Trường Sinh Huyết Ấn', power: 2.4, drain: 80, weakAtk: 20 } } },
  // ---------------- Tương Dương (41–60) ----------------
  // ---------------- Đầm Lầy Hiệp Xuyên (41–60) ----------------
  // Người dùng duyệt 2026-11-06: rìa đầm (độc vật) → sào huyệt Vạn Độc Môn. Giữ mã 4 map cũ. Hình quái: ảnh Gemini (2026-11-08, ENEMY_IMG).
  // Mọi quái ở đây đánh trúng có tỉ lệ gây độc (poisonHit: độc vật 20%, người Vạn Độc Môn 35%, 3 lượt);
  // độc chỉ giải bằng võ học, không bằng thuốc (người dùng chốt). value = mỗi lượt mất value × công của kẻ gây độc.
  { id: 'hai_long_dong', city: 'tuong_duong', name: 'Chướng Khí Lâm', bg: 'mist',
    desc: 'Rừng cây mục ở rìa đầm, chướng khí xanh lục phủ kín tán lá. Hít lâu là đầu óc choáng váng; kẻ lảng vảng ở đây đều đã quen sống chung với độc.',
    mobs: [['Chu Cơ Độc Nữ', 'tm_nu_nhen', 'fast', { poisonHit: { chance: 20, turns: 3, value: 0.3 } }],
      ['Thủy Xà Kiếm Nữ', 'tm_nu_kiem_lam', 'bal', { poisonHit: { chance: 20, turns: 3, value: 0.3 } }],
      ['Độc Đầu Đà', 'tm_hoa_thuong_rau', 'tank', { poisonHit: { chance: 20, turns: 3, value: 0.3 } }]],
    boss: { name: 'Độc Mãng Thương Vương', art: 'tm_cuong_kiem', stats: { poisonHit: { chance: 20, turns: 3, value: 0.3 } },
      move: { name: 'Độc Mãng Xuyên Tâm', power: 2.0, critBonus: 15, critStun: 1, effect: { type: 'poison', chance: 100, turns: 3, value: 0.5 } } } },
  { id: 'rung_sau_coc', city: 'tuong_duong', name: 'Hắc Thủy Đầm', bg: 'mist',
    desc: 'Đầm nước đen sâu không thấy đáy, xác người trôi lềnh bềnh. Thứ gì sống được ở đây đều đã ngấm độc tới tận xương.',
    mobs: [['Độc Thi', 'doc_thi', 'tank', { poisonHit: { chance: 20, turns: 3, value: 0.3 } }],
      ['Ngân Phát Thủy Tặc', 'tm_ngan_phat', 'glass', { poisonHit: { chance: 20, turns: 3, value: 0.3 } }],
      ['Hắc Thủy Kiếm Khách', 'tm_kiem_den', 'fast', { poisonHit: { chance: 20, turns: 3, value: 0.3 } }]],
    boss: { name: 'Hắc Thủy Bang Chủ', art: 'tm_hac_bao', stats: { poisonHit: { chance: 20, turns: 3, value: 0.3 } },
      move: { name: 'Hắc Thủy Phá Giáp', power: 2.2, weakAtk: 20 } } },
  { id: 'mat_dao', city: 'tuong_duong', name: 'Vạn Độc Trại', bg: 'mist',
    desc: 'Trại nhà sàn ngoài của Vạn Độc Môn, dưới sàn xếp đầy vò sành nuôi độc vật. Đệ tử ở đây ai cũng mang độc trên người.',
    mobs: [['Đệ Tử Vạn Độc Môn', 'de_tu_van_doc', 'bal', { poisonHit: { chance: 35, turns: 3, value: 0.35 } }],
      ['Độc Nữ Vạn Độc', 'doc_nu_van_doc', 'glass', { poisonHit: { chance: 35, turns: 3, value: 0.35 } }],
      ['Cổ Độc Kiếm Khách', 'tm_kiem_tim', 'fast', { poisonHit: { chance: 35, turns: 3, value: 0.35 } }]],
    boss: { name: 'Vạn Độc Hương Chủ', art: 'van_doc_huong_chu', stats: { poisonHit: { chance: 35, turns: 3, value: 0.35 } },
      move: { name: 'Vạn Cổ Phệ Tâm', power: 2.0, effect: { type: 'poison', chance: 100, turns: 4, value: 0.8 } } } },
  { id: 'huyet_ma_dan', city: 'tuong_duong', name: 'Độc Long Động', bg: 'evil',
    desc: 'Hang đá giữa đầm, nơi Vạn Độc Môn luyện độc công, sát cạnh tổng đàn. Hơi độc đặc quánh tới mức đuốc cháy cũng hóa xanh.',
    mobs: [['Vạn Độc Hộ Vệ', 'van_doc_ho_ve', 'tank', { poisonHit: { chance: 35, turns: 3, value: 0.35 } }],
      ['Luyện Cổ Sư', 'luyen_co_su', 'glass', { poisonHit: { chance: 35, turns: 3, value: 0.35 } }],
      ['Bạch Xà Tiên Cơ', 'tm_nu_sa', 'fast', { poisonHit: { chance: 35, turns: 3, value: 0.35 } }]],
    boss: { name: 'Vạn Độc Hộ Pháp', art: 'van_doc_ho_phap', stats: { poisonHit: { chance: 35, turns: 3, value: 0.35 } },
      move: { name: 'Vạn Độc Quy Tông', power: 0.8, hits: 3, effect: { type: 'poison', chance: 100, turns: 4, value: 0.7 } } } },
  // ---------------- Thung Lũng Tiêu Dao (61–80) ----------------
  // Người dùng duyệt 2026-11-06: rìa thung lũng (yêu thú mê hồn) → điện chính Hợp Hoan Phái. Giữ mã 4 map cũ. Hình quái mượn tạm.
  // Mọi quái ở đây đánh trúng có tỉ lệ gây Mê hoặc (charmHit: yêu thú 15%, người Hợp Hoan 25%, 2 lượt):
  // bị mê hoặc thì mỗi đòn có thêm 80% trượt (người dùng chốt, CHARM_MISS trong engine). Chiêu Tinh Anh chắc chắn gây mê hoặc.
  { id: 'vuc_vo_luong', city: 'thanh_do', name: 'Đào Hoa Lâm', bg: 'blossom',
    desc: 'Rừng hoa đào nở quanh năm, cánh hoa rơi như mưa hồng. Hương hoa ngọt tới mức kẻ đi lạc cứ ngồi cười một mình tới chết.',
    mobs: [['Mê Hồn Nữ', 'tm_nu_mat_na', 'fast', { charmHit: { chance: 15, turns: 2 } }],
      ['Hồ Điệp Tiên Tử', 'tm_nu_lua', 'glass', { charmHit: { chance: 15, turns: 2 } }],
      ['Đào Hoa Nữ Hiệp', 'tm_nu_hong_y', 'tank', { charmHit: { chance: 15, turns: 2 } }]],
    boss: { name: 'Thiên Hồ Tiên Cơ', art: 'tm_nu_tim', stats: { charmHit: { chance: 15, turns: 2 } },
      move: { name: 'Mị Nhãn Câu Hồn', power: 1.8, effect: { type: 'charm', chance: 100, turns: 2 } } } },
  { id: 'van_doc_lam', city: 'thanh_do', name: 'Ôn Tuyền Cốc', bg: 'mist',
    desc: 'Suối nước nóng giữa thung lũng, sương trắng lượn lờ không tan. Kẻ bước xuống ngâm mình hiếm ai lên lại, kẻ lên được thì không còn nhớ mình là ai.',
    mobs: [['Thủy Mị', 'thuy_mi', 'glass', { charmHit: { chance: 15, turns: 2 } }],
      ['Si Tình Đạo Sĩ', 'tm_dao_thai_cuc', 'tank', { charmHit: { chance: 15, turns: 2 } }],
      ['Hoa Xà Lang Quân', 'tm_hong_bao', 'fast', { charmHit: { chance: 15, turns: 2 } }]],
    boss: { name: 'Ôn Tuyền Thủy Mị', art: 'on_tuyen_thuy_mi', stats: { charmHit: { chance: 15, turns: 2 } },
      move: { name: 'Thủy Nguyệt Mê Tình', power: 2.2, effect: { type: 'charm', chance: 100, turns: 2 } } } },
  { id: 'ngu_doc_dong', city: 'thanh_do', name: 'Tiêu Dao Lầu', bg: 'blossom',
    desc: 'Lầu son ngoài của Hợp Hoan Phái, đèn lồng đỏ treo kín mái. Tiếng đàn và tiếng cười không dứt suốt đêm, nghe lâu là chân tự bước vào.',
    mobs: [['Đệ Tử Hợp Hoan Phái', 'de_tu_hop_hoan', 'bal', { charmHit: { chance: 25, turns: 2 } }],
      ['Mê Âm Cầm Sư', 'tm_cam_su', 'glass', { charmHit: { chance: 25, turns: 2 } }],
      ['Hợp Hoan Thị Vệ', 'hop_hoan_thi_ve', 'tank', { charmHit: { chance: 25, turns: 2 } }]],
    boss: { name: 'Mê Âm Hương Chủ', art: 'me_am_huong_chu', stats: { charmHit: { chance: 25, turns: 2 } },
      move: { name: 'Thiên Ma Cầm Âm', power: 2.0, weakAtk: 20, effect: { type: 'charm', chance: 100, turns: 2 } } } },
  { id: 'thap_van_son', city: 'thanh_do', name: 'Hợp Hoan Điện', icon: 'hoa_son', bg: 'evil',
    desc: 'Điện chính của Hợp Hoan Phái, rèm lụa đỏ buông kín, khói hương mê phủ dày. Cao thủ chính phái bị bắt về làm con rối, đứng canh cửa với đôi mắt vô hồn.',
    mobs: [['Hợp Hoan Hộ Pháp', 'hop_hoan_ho_phap', 'tank', { charmHit: { chance: 25, turns: 2 } }],
      ['Khôi Lỗi Hiệp Khách', 'tm_thieu_hiep_vang', 'bal', { charmHit: { chance: 25, turns: 2 } }],
      ['Mị Ảnh Sát Thủ', 'ks_mi_anh', 'fast', { charmHit: { chance: 25, turns: 2 } }]],
    boss: { name: 'Hợp Hoan Thánh Nữ', art: 'hop_hoan_thanh_nu', stats: { charmHit: { chance: 25, turns: 2 }, manasteal: 30 },
      move: { name: 'Hợp Hoan Đại Mê Hồn', power: 0.8, hits: 3, effect: { type: 'charm', chance: 100, turns: 3 } } } },
  // ---------------- Hồ Kỳ Sơn (81–100) ----------------
  // Người dùng duyệt 2026-11-06: bờ hồ (oan hồn) → tế đàn phong ấn Ma Vương giữa hồ, Quỷ Vương Tông. Giữ mã 4 map cũ. Hình quái mượn tạm.
  // Mọi quái ở đây đánh trúng có tỉ lệ Phệ Hồn (soulHit: hồn ma 15%, Quỷ Vương Tông 25%): mỗi lần mất 2% khí huyết tối đa
  // tới hết trận, cộng dồn tối đa 10% (người dùng chốt, PHE_HON trong engine). Chiêu Tinh Anh chắc chắn Phệ Hồn.
  { id: 'hoang_mac', city: 'truong_an', name: 'Âm Phong Lĩnh', bg: 'mountain',
    desc: 'Sườn núi quanh hồ Kỳ Sơn, gió lạnh rít qua khe đá như tiếng khóc. Người qua đây hay nghe ai đó gọi đúng tên mình.',
    mobs: [['Oan Hồn Đạo Nhân', 'tm_lao_dao_si', 'glass', { soulHit: { chance: 15 } }],
      ['Quỷ Lang Kiếm Khách', 'tm_xich_mau', 'fast', { soulHit: { chance: 15 } }],
      ['Quỷ Hỏa Đầu Đà', 'tm_lao_tang_rau', 'tank', { soulHit: { chance: 15 } }]],
    boss: { name: 'Âm Phong Lão Đạo', art: 'tm_lao_dao_quan', stats: { soulHit: { chance: 15 } },
      move: { name: 'Âm Phong Đoạt Phách', power: 2.3, effect: { type: 'phehon', chance: 100 } } } },
  { id: 'bach_da_son', city: 'truong_an', name: 'Vong Hồn Than', bg: 'abyss',
    desc: 'Bãi bờ hồ ngập xương trắng, mặt nước đen không một gợn sóng. Hồn ma không siêu thoát lang thang chờ kéo người sống xuống làm bạn.',
    mobs: [['Thủy Quỷ', 'ks_thuy_quy', 'bal', { soulHit: { chance: 15 } }],
      ['Vong Hồn Tiêu Khách', 'tm_lao_tieu', 'tank', { soulHit: { chance: 15 } }],
      ['Thuyền Phu Âm Hồn', 'ks_thuyen_phu', 'glass', { soulHit: { chance: 15 } }]],
    boss: { name: 'Thủy Quỷ Đầu Lĩnh', art: 'ks_thuy_quy_dau_linh', stats: { soulHit: { chance: 15 } },
      move: { name: 'Vong Xuyên Câu Hồn', power: 0.9, hits: 3, effect: { type: 'phehon', chance: 100 } } } },
  { id: 'bang_nguyen', city: 'truong_an', name: 'U Minh Cốc', bg: 'evil',
    desc: 'Thung lũng tối om bên hồ, đèn lồng xanh treo dọc lối. Đây là ngoại môn Quỷ Vương Tông, nơi chúng luyện hồn người thành quỷ binh.',
    mobs: [['Đệ Tử Quỷ Vương Tông', 'ks_de_tu_qvt', 'bal', { soulHit: { chance: 25 } }],
      ['Câu Hồn Sứ', 'ks_cau_hon_su', 'fast', { soulHit: { chance: 25 } }],
      ['Luyện Hồn Sư', 'ks_luyen_hon_su', 'glass', { soulHit: { chance: 25 } }]],
    boss: { name: 'Câu Hồn Phán Quan', art: 'ks_phan_quan', stats: { soulHit: { chance: 25 } },
      move: { name: 'Phán Quan Bút Câu Hồn', power: 2.8, critBonus: 15, effect: { type: 'phehon', chance: 100 } } } },
  { id: 'thien_co_cac', city: 'truong_an', name: 'Phong Ma Tế Đàn', bg: 'evil',
    desc: 'Tế đàn đá giữa hồ, nơi phong ấn Ma Vương thời thượng cổ. Ma khí rỉ ra từ từng khe đá, Quỷ Vương Tông canh giữ ngày đêm chờ ngày phá ấn.',
    mobs: [['Quỷ Vương Tử Sĩ', 'ks_tu_si', 'tank', { soulHit: { chance: 25 } }],
      ['Tế Đàn Ma Tăng', 'ks_ma_tang', 'bal', { soulHit: { chance: 25 } }],
      ['Ma Khí Ngưng Hình', 'ks_ma_khi', 'fast', { soulHit: { chance: 25 } }]],
    boss: { name: 'Quỷ Vương Hộ Pháp', art: 'ks_ho_phap', stats: { soulHit: { chance: 25 } },
      move: { name: 'Vạn Quỷ Phệ Hồn', power: 1.0, hits: 4, effect: { type: 'phehon', chance: 100 } } } },
];

/* ---------------------------- Dựng dữ liệu khi tải ---------------------------- */
const MAPS = {};
const TG_CITY_LV = c => TG_CITIES[c].idx * 20 + 1;
// Cấp cần để vào map có cấp quái thấp nhất lvMin: đầu mốc 10 cấp chứa nó (map 6–10 mở từ cấp 1, map 16–20 mở từ cấp 11...)
const tgOpenLv = lvMin => Math.floor((lvMin - 1) / 10) * 10 + 1;
(function tgBuild() {
  TG_MAPS.forEach((m, i) => {
    const lvMin = i * 5 + 1, lvMax = lvMin + 4, c = TG_CITIES[m.city];
    const enemies = m.mobs.map((x, j) => `tg_${m.id}_${j + 1}`);
    MAPS[m.id] = { id: m.id, idx: i + 1, city: m.city, lvMin, lvMax, name: m.name, enemies, boss: `tg_${m.id}_boss` };
    const pot = TG.potions[c.idx];
    // Mục ENEMIES cố định (để đếm nhiệm vụ diệt, hiện tên, sổ tay): chỉ số ở cấp giữa map, story: true để tháp không lấy
    m.mobs.forEach((x, j) => { ENEMIES[enemies[j]] = tgMake(m, j, lvMin + 2, false); });
    ENEMIES[MAPS[m.id].boss] = tgMake(m, -1, lvMax, true);
    const old = LOCATIONS[m.id] || {};
    ['require', 'lockText', 'rare', 'boss', 'alt', 'leaveFlag', 'leaveText', 'npcs', 'shops', 'inn'].forEach(k => delete old[k]);
    LOCATIONS[m.id] = Object.assign(old, {
      name: m.name, icon: m.icon || old.icon || 'rung_truc', type: 'wild', bg: m.bg || old.bg || 'mountain', desc: m.desc,
      // Mở theo mốc 10 cấp (người dùng chốt 2026-10-27): cấp 1–10 vào được map tới cấp 10, cấp 11–20 tới cấp 20...
      lvRange: `${lvMin}–${lvMax}`, minLv: tgOpenLv(lvMin), lockText: `Nguy hiểm! Cần đạt cấp ${tgOpenLv(lvMin)} mới vào được.`,
      tg: true, links: [m.city], fightChance: TG.fightChance,
      enemies: enemies.map(id => [id, 1]),
      events: [
        { w: 30, text: 'Ngươi nhặt được một túi tiền ai đó đánh rơi.', gold: [lvMin * 2 + 3, lvMax * 5 + 10] },
        { w: 15, text: 'Ngươi tìm thấy một gói thuốc kẻ nào bỏ quên.', item: pot[0] },
        { w: 10, text: 'Ngươi tìm thấy một lọ đan dược trong hốc đá.', item: pot[1] },
        { w: 10, text: 'Ngươi gặp một dòng suối mát, ngồi điều tức chốc lát.', heal: 20 },
        { w: 35, text: 'Ngươi đi một vòng, không gặp gì đặc biệt.' },
      ],
    });
  });
  // Thành: nối các thành với nhau + 4 map của thành (tọa độ trên bản đồ ở BAN_DO.pos trong ban_do.js).
  // Nhà môn phái cũ (Thiếu Lâm Tự, Võ Đang Sơn...) không còn nối vào: nhà 4 phái giờ là nút trong thành (mon_phai.js)
  Object.keys(TG_CITIES).forEach(cid => {
    const L = LOCATIONS[cid];
    // Tiệm Trang Bị (người dùng chốt 2026-10-28): đủ 11 ô, mỗi thành 2 bậc hợp cấp map quanh nó
    // (Dương Châu bậc 1–2, Lạc Dương 3–4, Tương Dương 5–6, Thành Đô 7–8, Trường An 9–10); bỏ các tiệm đồ cũ
    // Người dùng chốt 2026-11-06: tiệm và nghỉ ngơi chỉ có ở Thanh Vân Môn (giữa 4 vùng kia là sào huyệt tà phái).
    // Tiệm Trang Bị Thanh Vân bán đủ 10 bậc (renderShop hiện mọi bậc đang mặc được, từ bậc 1).
    if (cid === 'duong_chau') {
      // Người dùng chốt 2026-11-06: tách thành 4 tiệm, mỗi tiệm chia tab theo ô (cats: [mã tab, tên, hàm lọc món]).
      // Tiệm Vũ Khí: tab Găng Tay / Kiếm / Côn, ai cũng xem được cả 3 nhưng chỉ mua được vũ khí đường mình (weaponOk trong engine).
      const slotIds = (...slots) => slots.flatMap(s => GEAR[s].ids.map(x => x[0])); // vũ khí 12 bậc, đồ khác 10 bậc
      const bySlot = s => it => it.type === s;
      SHOPS.tb_vu_khi = { name: 'Tiệm Vũ Khí', icon: 'tiem_vu_khi', items: [...GANG.ids.map(x => x[0]), ...slotIds('weapon'), ...CON.ids.map(x => x[0])],
        cats: [['gang', 'Găng Tay', it => !!it.gang], ['kiem', 'Kiếm', it => it.type === 'weapon' && !it.gang && !it.con], ['con', 'Côn', it => !!it.con]] };
      SHOPS.tb_trang_suc = { name: 'Tiệm Trang Sức', icon: 'tiem_trang_suc', items: slotIds('necklace', 'ring', 'pendant'),
        cats: [['necklace', 'Dây Chuyền', bySlot('necklace')], ['ring', 'Nhẫn', bySlot('ring')], ['pendant', 'Ngọc Bội', bySlot('pendant')]] };
      SHOPS.tb_trang_phuc = { name: 'Tiệm Trang Phục', icon: 'tiem_trang_phuc', items: slotIds('hat', 'armor', 'pants', 'shoes'),
        cats: [['hat', 'Mũ', bySlot('hat')], ['armor', 'Áo', bySlot('armor')], ['pants', 'Quần', bySlot('pants')], ['shoes', 'Giày', bySlot('shoes')]] };
      SHOPS.tb_phu_kien = { name: 'Tiệm Phụ Kiện', icon: 'tiem_phu_kien', items: slotIds('cape', 'belt', 'glove'),
        cats: [['cape', 'Phi Phong', bySlot('cape')], ['belt', 'Đai Lưng', bySlot('belt')], ['glove', 'Hộ Tâm Kính', bySlot('glove')]] };
      L.shops = [...(L.shops || []).filter(s => !(SHOPS[s].items || []).some(i => ITEMS_BASE[i] && ITEMS_BASE[i].tier)), 'tb_vu_khi', 'tb_trang_suc', 'tb_trang_phuc', 'tb_phu_kien'];
    } else {
      L.shops = [];
      delete L.inn;
    }
    delete L.require;
    L.minLv = TG_CITY_LV(cid);
    L.lockText = `Đường tới ${L.name} đầy rẫy cao thủ. Cần đạt cấp ${L.minLv}.`;
    L.links = [...TG_MAPS.filter(m => m.city === cid).map(m => m.id), ...TG_CITIES[cid].links];
  });
  // Bỏ thuốc (POTION_OFF, người dùng chốt 2026-11-10): gỡ thuốc khỏi mọi tiệm, tiệm chỉ bán thuốc (Dược Phòng) thì gỡ khỏi địa điểm
  if (POTION_OFF) {
    Object.values(SHOPS).forEach(sh => { if (sh.items) sh.items = sh.items.filter(i => !(ITEMS_BASE[i] && ITEMS_BASE[i].type === 'use')); });
    Object.values(LOCATIONS).forEach(L => { if (L.shops) L.shops = L.shops.filter(s => SHOPS[s] && (SHOPS[s].forge || SHOPS[s].skills || (SHOPS[s].items || []).length)); });
  }
  // Địa điểm cũ không thuộc thế giới mới: bỏ các lối một chiều (trỏ vào map/thành mà bên kia không trỏ lại)
  Object.keys(LOCATIONS).forEach(id => {
    if (MAPS[id] || TG_CITIES[id]) return;
    LOCATIONS[id].links = (LOCATIONS[id].links || []).filter(t => LOCATIONS[t] && (LOCATIONS[t].links || []).includes(id));
  });
})();

/* ---------------------------- Chỉ số quái ---------------------------- */
// Nhân vật mẫu cấp lv: chỉ số gốc + tăng theo cấp trung bình các phái, cộng trang bị cơ bản bậc cao nhất mặc được
function tgRef(lv) {
  const memo = tgRef.memo || (tgRef.memo = {});
  if (memo[lv]) return memo[lv];
  const sects = Object.values(SECTS), r = {};
  ['hp', 'atk', 'def', 'spd'].forEach(k => {
    r[k] = sects.reduce((s, S) => s + (k in S.base ? S.base[k] : BASE_DEFAULT[k] || 0) + (k in S.grow ? S.grow[k] : GROW_DEFAULT[k] || 0) * (lv - 1), 0) / sects.length;
  });
  const best = {};
  Object.values(ITEMS_BASE).forEach(it => { if (it.tier && it.lv <= lv && (!best[it.type] || it.tier > best[it.type].tier)) best[it.type] = it; });
  Object.values(best).forEach(it => { for (const k in it.stats) if (k in r) r[k] += it.stats[k]; });
  return (memo[lv] = r);
}

// Dựng một quái: m = map trong TG_MAPS, j = số thứ tự loại quái (-1 = boss), lv = cấp
function tgMake(m, j, lv, boss) {
  const x = boss ? null : m.mobs[j], art = boss ? m.boss.art : x[1];
  // Không còn kiểu quái (trâu / hung hãn / nhanh) theo người dùng chốt 2026-10-27; boss chỉ nhân theo TG.boss (máu không nhân)
  const st = boss ? TG.boss : {}, mul = k => (st[k] || 1) * (TG.mul[k] || 1);
  const sect = typeof art === 'object' ? art.sect : null;
  const Q = TG.mob, k = lv - 1, pct = Q.pct;
  const E = {
    id: boss ? `tg_${m.id}_boss` : `tg_${m.id}_${j + 1}`,
    name: boss ? m.boss.name : x[0], icon: sect ? SECTS[sect].icon : art, lv, story: true, tg: m.id, boss: !!boss,
    // Chỉ số theo cấp (TG.mob), rồi nhân theo kiểu quái / boss
    hp: Math.max(1, Math.round((Q.hp[0] + Q.hp[1] * k) * mul('hp'))),
    mp: Math.round((Q.mp[0] + Q.mp[1] * k) * (boss ? 3 : 1)),
    atk: Math.max(1, Math.round((Q.atk[0] + Q.atk[1] * k) * mul('atk'))),
    def: Math.round((Q.def[0] + Q.def[1] * k) * mul('def')), spd: Math.max(1, Math.round((Q.spd[0] + Q.spd[1] * k) * mul('spd'))),
    crit: pct + (st.crit || 0), dodge: pct + (st.dodge || 0), critDmg: 150, acc: Q.acc, critRes: pct,
    exp: Math.round(Q.exp(lv) * (boss ? TG.boss.exp : 1) * TG.mul.exp),
    gold: Math.round(Q.gold(lv) * (boss ? TG.boss.gold : 1) * TG.mul.gold),
    skills: [],
  };
  if (sect) E.avatar = { sect, title: art.title };
  // Chỉ số riêng cộng thêm (quái: phần tử thứ 4; boss: boss.stats), vd. { lifesteal: 20 } = hút 20% sát thương thành máu
  const ex = boss ? m.boss.stats : x[3];
  if (ex) for (const s in ex) E[s] = typeof ex[s] === 'number' ? (E[s] || 0) + ex[s] : ex[s]; // poisonHit: đánh trúng có tỉ lệ gây độc
  const pot = TG.potions[TG_CITIES[m.city].idx];
  E.drops = POTION_OFF ? [] : boss ? [[pot[0], 100, 2], [pot[1], 100, 2]] : [[pot[0], TG.dropChance[0]], [pot[1], TG.dropChance[1]]]; // bỏ thuốc 2026-11-10
  if (boss) E.intro = `Tinh Anh <b>${E.name}</b> chặn ngang đường đi, sát khí bức người!`;
  return E;
}

// Võ học phổ thông theo hệ (SKILLS có pho: true; thiếu thì lấy võ nhập môn giang hồ)
function tgPho(cat, elem) {
  const all = Object.keys(SKILLS).filter(id => SKILLS[id].cat === cat);
  let pool = all.filter(id => SKILLS[id].quai); // võ riêng của quái (data.js quai: true)
  if (!pool.length) pool = all.filter(id => { const k = SKILLS[id]; return !k.sect && !k.story && !k.book && k.grade === 'nhapmon'; });
  const same = elem ? pool.filter(id => SKILLS[id].elem === elem) : pool;
  const list = same.length ? same : pool.filter(id => !SKILLS[id].elem);
  return list.length ? list[Math.floor(Math.random() * list.length)] : null;
}
// Gắn võ học ngẫu nhiên lên quái (gọi lúc chạy, cần normSkill / passiveStats của engine)
function tgArm(E) {
  const elem = TG.elems[Math.floor(Math.random() * TG.elems.length)];
  const kl = Math.max(1, Math.min(MAX_SKILL_LV, Math.ceil(E.lv / 10)));
  // Quái mang ngẫu nhiên một võ công, một nội công, một công pháp cùng hệ; không mang khinh công (người dùng chốt 2026-10-27)
  const noi = tgPho('noicong', elem), vc = tgPho('vocong', elem), cp = tgPho('congphap', elem);
  // Nội công cộng chỉ số như người chơi mang
  if (noi) {
    const add = passiveStats(noi, kl);
    ['hp', 'mp', 'atk', 'def', 'spd', 'crit', 'dodge', 'critDmg', 'acc', 'critRes', 'lifesteal'].forEach(k => { if (add[k]) E[k] = Math.round(E[k] + add[k]); });
    // Mốc tầng 5 / 10: tăng % công, thủ, tốc độ (cộng dồn)
    const t = tierFx(noi, kl);
    [['atkPct', 'atk'], ['defPct', 'def'], ['spdPct', 'spd']].forEach(([f, k]) => { if (t[f]) E[k] = Math.round(E[k] * (1 + t[f] / 100)); });
  }
  E.elem = noi ? SKILLS[noi].elem || elem : elem;
  E.arts = [vc, noi, cp].filter(Boolean); // để bấm vào ảnh quái xem võ học (enemyArts trong engine)
  E.artLv = kl;
  const skills = [];
  if (cp) skills.push(Object.assign(normSkill(cp, kl, E.lv), { cycle: 3 })); // công pháp: mỗi hiệp 50%, vận rồi thì nghỉ tới 3 hiệp sau (enemyAI)
  // Võ công thay cho đánh thường (basic: enemyAI dùng khi không ra chiêu nào khác; không tốn nội lực)
  if (vc) skills.push(Object.assign(normSkill(vc, kl, E.lv), { basic: true }));
  return skills;
}

/* ---------------------------- Gặp quái ---------------------------- */
const tgMapOf = mapId => TG_MAPS[MAPS[mapId].idx - 1];
const tgPick = list => { let t = list.reduce((s, x) => s + x[1], 0) * Math.random(); return list.find(x => (t -= x[1]) < 0) || list[list.length - 1]; };
const tgLv = mi => MAPS[mi.id].lvMin + Math.floor(Math.random() * 5);

function tgMob(mapId, j, lv) {
  const m = tgMapOf(mapId), E = tgMake(m, j, lv, false);
  E.skills = tgArm(E);
  return E;
}
function tgBoss(mapId) {
  const m = tgMapOf(mapId), E = tgMake(m, -1, MAPS[mapId].lvMax, true);
  const mv = m.boss.move;
  E.skills = tgArm(E);
  E.skills.unshift(Object.assign({ type: 'attack', chance: 30, mp: 0 }, mv)); // chiêu riêng của boss, không tốn nội lực
  return E;
}
// Bảng trọng số số quái của một map: trộn countLow → countHigh theo cấp thấp nhất của map
function tgCount(mapId) {
  const t = Math.max(0, Math.min(1, (MAPS[mapId].lvMin - 1) / 95));
  return TG.countLow.map(([n, w], i) => [n, w + (TG.countHigh[i][1] - w) * t]);
}
function genEncounter(mapId) {
  const m = tgMapOf(mapId), n = tgPick(tgCount(mapId))[0], out = [];
  for (let i = 0; i < n; i++) out.push(tgMob(mapId, Math.floor(Math.random() * m.mobs.length), tgLv(m)));
  return out;
}
function tgExploreRoll(mapId) {
  if (Math.random() * 100 < TG.bossChance) return { boss: true, list: [tgBoss(mapId)] };
  return { boss: false, list: genEncounter(mapId) };
}
const tgRewardMult = n => TG.rewardMult[Math.max(1, Math.min(6, n))];
// Map hợp cấp nhân vật: map thứ ⌈cấp/5⌉
const mapForLevel = lv => TG_MAPS[Math.max(1, Math.min(TG_MAPS.length, Math.ceil(lv / 5))) - 1].id;
