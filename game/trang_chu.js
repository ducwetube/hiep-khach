/* =====================================================================
   TRANG CHỦ (2026-11-12, người dùng chốt: chuyển sang game xếp đội, xây từng phần; phần này = màn chính sau khi vào game)
   Bố cục học theo màn chính của game xếp đội người dùng gửi làm mẫu (thanh trên, hàng đội hình, ba nút lớn, hàng chức năng,
   thanh dưới) nhưng mang màu, hình, tên của game này. Chưa có hệ đội hình / chiêu mộ thật: hàng đội hình là đội mẫu,
   các nút chưa có chức năng hiện "Sắp mở". Nút nối vào những gì game đã có (bản đồ, tháp, thí luyện, cấm địa, đồ, võ học...).
   Engine: continueGame / startNew vào renderHome; renderTop ẩn thanh trên khi đang ở trang chủ (screenKey 'home').
   ===================================================================== */
// Kho hiệp khách (mã → dữ liệu). 2026-11-12: người dùng chốt tạo nhân vật được tặng Đoàn Diên Khánh;
// 4 hiệp khách còn lại là mẫu cũ (số liệu tạm), chưa ai có, chờ chiêu mộ / ghép mảnh.
const HIEP_KHACH = {
  lanh_nguyet: { name: 'Lãnh Nguyệt', img: 'tm_nu_kiem_lam', role: 'cong_kich', q: 3, lv: 1, star: 2, hanh: 'thuy', tuChat: 14,
    st: { hp: 2030, atk: 2034, def: 1297, hoi: 401, spd: 51, mi: 100 },
    skill: { grade: 'S', name: 'Cửu Kiếm Quyết', desc: 'Tấn công toàn địch và tăng Chuẩn toàn đội 2 hiệp' },
    duyen: [{ name: 'Sư Đồ', desc: 'Cùng ra trận Thủ +250%', with: [], ok: true }, { name: 'Đồng Môn', desc: 'Cùng ra trận Công +15%', with: [], ok: false }] },

  han_son: { name: 'Hàn Sơn', img: 'tm_cuong_khach', role: 'ho_ve', q: 2, lv: 1, star: 1, hanh: 'tho', tuChat: 12,
    st: { hp: 4120, atk: 980, def: 2210, hoi: 350, spd: 38, mi: 300 },
    skill: { grade: 'A', name: 'Thiết Bích Quyết', desc: 'Khiêu khích toàn địch, giảm 30% sát thương nhận 2 hiệp' },
    duyen: [{ name: 'Huynh Đệ', desc: 'Cùng ra trận Khí huyết +20%', with: [], ok: true }] },

  thanh_lien: { name: 'Thanh Liên', img: 'tm_bach_lien_nu', role: 'tri_lieu', q: 3, lv: 1, star: 1, hanh: 'moc', tuChat: 13,
    st: { hp: 2450, atk: 1120, def: 1180, hoi: 860, spd: 46, mi: 80 },
    skill: { grade: 'S', name: 'Thanh Liên Hóa Vũ', desc: 'Hồi khí huyết toàn đội, giải hiệu ứng xấu' },
    duyen: [{ name: 'Tri Kỷ', desc: 'Cùng ra trận Hồi +20%', with: [], ok: true }] },
  // Hiệp khách thật đầu tiên (2026-11-12, người dùng chốt): ảnh Gemini art (tranh có nền), chỉ số cấp 1 + tăng mỗi cấp (grow),
  // suy từ ảnh mẫu cấp 23 không mặc đồ (HP 2238, Công 998, Thủ 352, Hồi 361, mỗi cấp +53,3 / 23,8 / 8,4 / 8,6);
  // ảnh cấp 16 trước đó có mặc đồ nên số cũ (1565 / 575 / 268 / 272) sai,

  doan_dien_khanh: { name: 'Đoàn Diên Khánh', img: 'tm_thanh_kiem', art: 'game/img/hk/doan_dien_khanh.jpg', face: [0.5, 0.28], sprite: 'game/img/hk/doan_dien_khanh_sd.png', hand: [0.93, 0.46], role: 'ky_nang', q: 4, lv: 1, star: 1, hanh: 'loi', tuChat: 14,
    st: { hp: 1065.4, atk: 474.8, def: 168, hoi: 172.2, spd: 43, mi: 100 }, // cấp 1 (hiện 1065 / 475 / 168 / 172)
    grow: { hp: 53.3, atk: 23.83, def: 8.4, hoi: 8.58 },
    ex: { crit: 10, critDmg: 150, acc: 100, dodge: 5 },
    skill: { grade: 'S', name: 'Đoàn Thị Chỉ Pháp', desc: 'Bắn chỉ lực vào toàn địch, mỗi kẻ trúng 4 tia (20 / 20 / 20 / 40% của tổng 70% công), gây chảy máu 2 hiệp (mỗi hiệp mất máu bằng 10% công)' },
    ult: { kind: 'all', pow: 0.7, bleed: { pct: 0.1, turns: 2 }, fx: 'chi', split: [0.2, 0.2, 0.2, 0.4] },
    // hình động làm bằng Blender (tools/blender/doan_dien_khanh.py): iw/ih = cỡ hình gốc, box = vùng xuất (px hình gốc),
    // atk: tấm tung chỉ pháp, fire = ms tới lúc giơ tay chĩa ngón, hold = khung đứng giữ thế lúc bắn; tip = đầu ngón so với `hand` (px gốc)
    anim: { iw: 446, ih: 700, box: [-110, -40, 556, 740], tip: [91, -66],
      idle: { src: 'game/img/blender/doan_idle.webp', n: 24, ms: 1300 },
      atk: { src: 'game/img/blender/doan_atk.webp', n: 26, ms: 1300, fire: 470, hold: 11.5 } },
    // Duyên (theo ảnh game mẫu người dùng gửi 2026-11-12): with = mã hiệp khách cùng ra trận, hoặc { ten, loai } cho người / bảo vật / linh thú
    // chưa có trong game; loai 'bao' / 'linh' = "Sử dụng" (trang bị bảo vật / mang linh thú). eff = mức cộng ghi sẵn, CHƯA áp vào chỉ số.
    duyen: [
      { name: 'Phụ Tử', desc: 'Cùng ra trận Công +150%', with: ['doan_du'], eff: { atk: 1.5 } },
      { name: 'Đoàn Viên', desc: 'Cùng ra trận Công +150% HP +200%', with: [{ ten: 'Đao Bạch Phượng' }], eff: { atk: 1.5, hp: 2 } },
      { name: 'Tứ Đại Ác Nhân', desc: 'Cùng ra trận Công +200% HP +300%', with: ['diep_nhi_nuong', 'van_trung_hac', 'nam_hai_ngac_than'], eff: { atk: 2, hp: 3 } },
      { name: 'Bàn Cờ', desc: 'Sử dụng HP +30%', with: [{ ten: 'Bàn Cờ', loai: 'bao' }], eff: { hp: 0.3 } },
      { name: 'Hắc Miêu', desc: 'Sử dụng Công +50%', with: [{ ten: 'Hắc Miêu', loai: 'linh' }], eff: { atk: 0.5 } },
    ] },

  // Hiệp khách thật thứ hai (2026-11-12, người dùng gửi tranh + ảnh nền đen): chỉ số cấp 1 khớp ảnh mẫu (1306 / 345 / 238 / 242, tốc 53, Mị 300),
  // mỗi cấp +5% chỉ số cấp 1; Hộ Vệ: Bạo 0, Bền 10%, Né 5%. chiêu nộ cấp 1 người dùng chốt: +55% HP, −20% Công
  nam_hai_ngac_than: { name: 'Nam Hải Ngạc Thần', img: 'tm_cuong_khach', art: 'game/img/hk/nam_hai_ngac_than.jpg', face: [0.57, 0.45], sprite: 'game/img/hk/nam_hai_ngac_than_sd.png', spFlip: true, hand: [0.88, 0.4], role: 'ho_ve', q: 4, lv: 1, star: 1, hanh: 'thuy', tuChat: 14,
    st: { hp: 1306, atk: 345, def: 238, hoi: 242, spd: 53, mi: 300 },
    grow: { hp: 65.3, atk: 17.3, def: 11.9, hoi: 12.1 },
    ex: { crit: 0, critDmg: 150, acc: 100, dodge: 5, ben: 10 },
    skill: { grade: 'S', name: 'Ngạc Thần Hộ Thể', desc: 'Tăng 55% khí huyết tối đa bản thân, giảm 20% Công của 2 kẻ địch ngẫu nhiên trong 2 hiệp' },
    ult: { kind: 'guard', selfHp: 0.55, n: 2, atkDown: 0.2, turns: 2, shield: 'nuoc' },  // shield: khiên nước xoáy (Blender) suốt lúc còn tác dụng
    spSize: [730, 700],
    // hình động Blender (tools/blender/nam_hai_ngac_than.py; ảnh gốc quay trái, trong trận lật ngang như hình tĩnh):
    // chem = đánh thường vung kích bổ xuống, hit = khung lưỡi kích trúng địch, slash = vệt chém hiện ở chỗ trúng
    anim: { iw: 730, ih: 700, box: [-170, -110, 840, 760],
      idle: { src: 'game/img/blender/nam_idle.webp', n: 24, ms: 1300 },
      chem: { src: 'game/img/blender/nam_chem.webp', n: 20, ms: 950, hit: 8, slash: 'nuoc' } },
    duyen: [   // theo ảnh game mẫu người dùng gửi 2026-11-12; eff chưa áp vào chỉ số
      { name: 'Thầy Trò', desc: 'Cùng ra trận HP +200%', with: ['doan_du'], eff: { hp: 2 } },
      { name: 'Ghen Ghét', desc: 'Cùng ra trận Thủ +200%', with: ['diep_nhi_nuong'], eff: { def: 2 } },
      { name: 'Tứ Đại Ác Nhân', desc: 'Cùng ra trận Công +200% HP +300%', with: ['doan_dien_khanh', 'diep_nhi_nuong', 'van_trung_hac'], eff: { atk: 2, hp: 3 } },
      { name: 'Tái Sinh Phù', desc: 'Sử dụng Bền +10%', with: [{ ten: 'Tái Sinh Phù', loai: 'bao' }], eff: { ben: 10 } },
      { name: 'Tiểu Thử', desc: 'Sử dụng HP +150%', with: [{ ten: 'Tiểu Thử', loai: 'linh' }], eff: { hp: 1.5 } },
    ] },

  // Hiệp khách thứ ba (2026-11-12): suy từ ảnh mẫu cấp 10 (cột Căn Cốt) + 10 sao (Cơ Bản ÷ 1,2⁹); Hỗ Trợ: Bền 5%, Né 7,5%.
  // Nộ S Hoán Hồn Khúc (người dùng chốt): +14% khí huyết tối đa toàn đội (cấp 1), ru ngủ 2 kẻ địch ngẫu nhiên 2 hiệp (như choáng, có Zzz).
  // Ngoại hình riêng của game (câu lệnh ở luu_tru/hiep_khach/cau_lenh.md), hình động + hiệu ứng làm bằng Blender (tools/blender/diep_nhi_nuong.py, fx_nguyen.py)
  diep_nhi_nuong: { name: 'Diệp Nhị Nương', img: 'tm_nu_quy', art: 'game/img/hk/diep_nhi_nuong.jpg', face: [0.56, 0.29], sprite: 'game/img/hk/diep_nhi_nuong_sd.png', hand: [0.94, 0.37], role: 'ho_tro', q: 4, lv: 1, star: 1, hanh: 'hoa', tuChat: 14,
    st: { hp: 1117.1, atk: 395.2, def: 240.1, hoi: 171.1, spd: 60, mi: 200 },
    grow: { hp: 55.86, atk: 19.76, def: 12.0, hoi: 8.56 },
    ex: { crit: 0, critDmg: 150, acc: 100, dodge: 7.5, ben: 5 },
    skill: { grade: 'S', name: 'Hoán Hồn Khúc', desc: 'Tăng 14% khí huyết tối đa toàn đội 2 hiệp, ru ngủ ngẫu nhiên 2 kẻ địch 2 hiệp' },
    ult: { kind: 'curse', teamHp: 0.14, n: 2, turns: 2, fx: 'nguyen' },
    // phep: niệm chú lắc trống; doll = khung hiện hình nộm rơm trên đầu địch, blast = khung phất tay (nổ dưới chân địch)
    anim: { iw: 555, ih: 700, box: [-90, -110, 665, 760],
      idle: { src: 'game/img/blender/diep_idle.webp', n: 24, ms: 1300 },
      phep: { src: 'game/img/blender/diep_phep.webp', n: 30, ms: 1500, doll: 7, blast: 19 },
      // đánh thường từ xa: lắc trống rồi đẩy về phía địch, khung fire = sóng âm bay ra (tran_doi.js TD_SHOT)
      danh: { src: 'game/img/blender/diep_danh.webp', n: 16, ms: 800, fire: 7, shot: 'song_am' } },
    duyen: [   // theo ảnh game mẫu người dùng gửi 2026-11-12; eff chưa áp vào chỉ số
      { name: 'Mẫu Tử', desc: 'Cùng ra trận HP +200%', with: [{ ten: 'Hư Trúc' }], eff: { hp: 2 } },
      { name: 'Ghen Ghét', desc: 'Cùng ra trận Thủ +200%', with: ['nam_hai_ngac_than'], eff: { def: 2 } },
      { name: 'Tứ Đại Ác Nhân', desc: 'Cùng ra trận Công +200% HP +300%', with: ['doan_dien_khanh', 'nam_hai_ngac_than', 'van_trung_hac'], eff: { atk: 2, hp: 3 } },
      { name: 'Kinh Vô Tự', desc: 'Sử dụng Thủ +20%', with: [{ ten: 'Kinh Vô Tự', loai: 'bao' }], eff: { def: 0.2 } },
      { name: 'Lang Báo', desc: 'Sử dụng Tốc +5%', with: [{ ten: 'Lang Báo', loai: 'linh' }], eff: { spd: 0.05 } },
    ] },

  // Hiệp khách thứ tư (2026-11-12): ảnh mẫu cấp 1 · 1 sao không đồ; Hỗ Trợ hệ Thủy. Nộ S Lăng Ba Vi Bộ: +14% Tốc toàn đội 2 hiệp
  // (người dùng chốt; Tốc CHƯA có tác dụng trong trận đội, người dùng sẽ quyết sau). Đánh thường: Lục Mạch Thần Kiếm (kiếm khí từ hai ngón tay).
  doan_du: { name: 'Đoàn Dự', img: 'tm_thanh_kiem', art: 'game/img/hk/doan_du.jpg', face: [0.52, 0.28], sprite: 'game/img/hk/doan_du_sd.png', hand: [0.906, 0.283], role: 'ho_tro', q: 4, lv: 1, star: 1, hanh: 'thuy', tuChat: 14,
    st: { hp: 1082, atk: 416, def: 221, hoi: 173, spd: 160, mi: 200 },
    grow: { hp: 54.1, atk: 20.8, def: 11.1, hoi: 8.7 },
    ex: { crit: 0, critDmg: 150, acc: 100, dodge: 7.5, ben: 5 },
    skill: { grade: 'S', name: 'Lăng Ba Vi Bộ', desc: 'Tăng 14% Tốc toàn đội trong 2 hiệp' },
    ult: { kind: 'speed', spd: 0.14, turns: 2, fx: 'langba' },
    // hình động Blender (tools/blender/doan_du.py): danh = chỉ hai ngón bắn kiếm khí (tip = đầu ngón lúc chỉ, so với `hand`, px gốc),
    // bo = lướt bước qua lại (Lăng Ba Vi Bộ), wave = khung sóng nước dậy dưới chân đồng đội
    anim: { iw: 384, ih: 700, box: [-120, -90, 520, 760],
      idle: { src: 'game/img/blender/du_idle.webp', n: 24, ms: 1300 },
      danh: { src: 'game/img/blender/du_danh.webp', n: 16, ms: 800, fire: 7, shot: 'kiem_khi', tip: [88, 72] },
      bo: { src: 'game/img/blender/du_bo.webp', n: 30, ms: 1500, wave: 24 } },
    duyen: [{ name: 'Hiệp Lữ', desc: 'Cùng ra trận HP +250%', with: [], ok: false }] },

  // Hiệp khách thứ năm (2026-11-12): từ ảnh mẫu 10 sao (Cơ Bản ÷ 1,2⁹); Công Kích hệ Thủy, chỉ số phụ theo loại Công Kích (Bạo 15, Né 2,5).
  // Nộ S Hạc Trảo Công (người dùng chốt cấp 1): 200% Công một mục tiêu, Công bản thân +5%, Thủ mục tiêu −5% trong 2 hiệp.
  van_trung_hac: { name: 'Vân Trung Hạc', img: 'tm_cuong_kiem', art: 'game/img/hk/van_trung_hac.jpg', face: [0.64, 0.23], sprite: 'game/img/hk/van_trung_hac_sd.png', hand: [0.97, 0.31], role: 'cong_kich', q: 4, lv: 1, star: 1, hanh: 'thuy', tuChat: 14,
    st: { hp: 865.2, atk: 488.0, def: 194.0, hoi: 179.1, spd: 51, mi: 100 },
    grow: { hp: 43.26, atk: 24.4, def: 9.7, hoi: 8.96 },
    ex: { crit: 15, critDmg: 150, acc: 100, dodge: 2.5 },
    skill: { grade: 'S', name: 'Hạc Trảo Công', desc: 'Tấn công một mục tiêu 200% Công, tăng 5% Công bản thân và giảm 5% Thủ mục tiêu trong 2 hiệp' },
    ult: { kind: 'claw', pow: 2.0, selfAtk: 0.05, defDown: 0.05, turns: 2 },
    // hình động Blender (tools/blender/van_trung_hac.py): chem = giơ móng cào xuống (vết cào 'cao'), vo = bật vọt lên rồi bổ xuống (khung hit chạm)
    anim: { iw: 617, ih: 700, box: [-90, -270, 720, 760],
      idle: { src: 'game/img/blender/vth_idle.webp', n: 24, ms: 1300 },
      chem: { src: 'game/img/blender/vth_danh.webp', n: 16, ms: 750, hit: 8, slash: 'cao' },
      vo: { src: 'game/img/blender/vth_vo.webp', n: 26, ms: 1300, hit: 16 } },
    duyen: [   // theo ảnh game mẫu người dùng gửi 2026-11-12; eff chưa áp vào chỉ số
      { name: 'Háo Sắc', desc: 'Cùng ra trận Công +150%', with: [{ ten: 'Vương Ngữ Yên' }], eff: { atk: 1.5 } },
      { name: 'Gian Trá', desc: 'Cùng ra trận Công +150% Thủ +150%', with: [{ ten: 'Đinh Xuân Thu' }], eff: { atk: 1.5, def: 1.5 } },
      { name: 'Tứ Đại Ác Nhân', desc: 'Cùng ra trận Công +200% HP +300%', with: ['diep_nhi_nuong', 'doan_dien_khanh', 'nam_hai_ngac_than'], eff: { atk: 2, hp: 3 } },
      { name: 'Xà Trùy', desc: 'Sử dụng Bạo +20%', with: [{ ten: 'Xà Trùy', loai: 'bao' }], eff: { crit: 20 } },
      { name: 'Xà Đảm', desc: 'Sử dụng Bạo +15%', with: [{ ten: 'Xà Đảm', loai: 'bao' }], eff: { crit: 15 } },
      { name: 'Ngũ Độc Cổ', desc: 'Sử dụng Công +50%', with: [{ ten: 'Ngũ Độc Cổ', loai: 'bao' }], eff: { atk: 0.5 } },
      { name: 'Ma Hoàng Trảo', desc: 'Sử dụng Tốc +3%', with: [{ ten: 'Ma Hoàng Trảo', loai: 'bao' }], eff: { spd: 0.03 } },
      { name: 'Hầu Tử', desc: 'Sử dụng Công +50%', with: [{ ten: 'Hầu Tử', loai: 'linh' }], eff: { atk: 0.5 } },
    ] },

  // Hiệp khách thứ sáu (2026-11-12): từ ảnh mẫu 10 sao; Công Kích hệ Ám (Bạo 15, Né 2,5).
  // Nộ S+ Trúc Hải Triều Thanh (người dùng chốt cấp 1): 170% Công một mục tiêu, Công bản thân +5% 2 hiệp.
  nham_doanh_doanh: { name: 'Nhậm Doanh Doanh', img: 'tm_nu_quy', art: 'game/img/hk/nham_doanh_doanh.jpg', face: [0.56, 0.31], sprite: 'game/img/hk/nham_doanh_doanh_sd.png', hand: [0.98, 0.34], role: 'cong_kich', q: 4, lv: 1, star: 1, hanh: 'am', tuChat: 13,
    st: { hp: 800.0, atk: 476.2, def: 170.2, hoi: 180.0, spd: 50, mi: 100 },
    grow: { hp: 40, atk: 23.81, def: 8.51, hoi: 9 },
    ex: { crit: 15, critDmg: 150, acc: 100, dodge: 2.5 },
    skill: { grade: 'S+', name: 'Trúc Hải Triều Thanh', desc: 'Tấn công mục tiêu chỉ định 170% Công, tăng 5% Công bản thân trong 2 hiệp' },
    ult: { kind: 'flute', pow: 1.7, selfAtk: 0.05, turns: 2 },
    // hình động Blender (tools/blender/nham_doanh_doanh.py): danh = thổi tiêu phất tay (nốt nhạc tím bay), tieu = thổi tiêu say sưa rồi đẩy khúc nhạc (khung fx = lốc lá trúc hiện trên mục tiêu)
    anim: { iw: 479, ih: 700, box: [-80, -90, 560, 760],
      idle: { src: 'game/img/blender/ndd_idle.webp', n: 24, ms: 1300 },
      danh: { src: 'game/img/blender/ndd_danh.webp', n: 16, ms: 800, fire: 7, shot: 'not_nhac' },
      tieu: { src: 'game/img/blender/ndd_tieu.webp', n: 30, ms: 1500, fx: 7 } },
    duyen: [   // theo ảnh game mẫu người dùng gửi 2026-11-12; người trong Thần Giáo ngoài 2 cha con là Claude đoán theo truyện
      { name: 'Nữ Kiệt', desc: 'Cùng ra trận Công +150% Thủ +200%', with: [{ ten: 'Miêu Nhược Lan' }, { ten: 'Quách Tường' }], eff: { atk: 1.5, def: 2 } },
      { name: 'Thần Giáo', desc: 'Cùng ra trận Công +200% HP +350%', with: ['nham_nga_hanh', 'huong_van_thien', 'dong_phuong', 'lenh_ho_xung'], eff: { atk: 2, hp: 3.5 } },
      { name: 'Tiếu Khán', desc: 'Cùng ra trận Công +130%', with: ['lenh_ho_xung'], eff: { atk: 1.3 } },
      { name: 'Ngọc Tiêu', desc: 'Sử dụng Công +100%', with: [{ ten: 'Ngọc Tiêu', loai: 'bao' }], eff: { atk: 1 } },
      { name: 'Hắc Mộc Lệnh', desc: 'Sử dụng Thủ +100%', with: [{ ten: 'Hắc Mộc Lệnh', loai: 'bao' }], eff: { def: 1 } },
      { name: 'Thần Lệnh', desc: 'Sử dụng HP +150%', with: [{ ten: 'Thần Lệnh', loai: 'bao' }], eff: { hp: 1.5 } },
      { name: 'Tâm Ma Ký', desc: 'Sử dụng Bạo +25%', with: [{ ten: 'Tâm Ma Ký', loai: 'bao' }], eff: { crit: 25 } },
      { name: 'Huyền Thiên Giới', desc: 'Sử dụng Bạo +30%', with: [{ ten: 'Huyền Thiên Giới', loai: 'bao' }], eff: { crit: 30 } },
      { name: 'Tiểu Giải', desc: 'Sử dụng Công +50%', with: [{ ten: 'Tiểu Giải', loai: 'linh' }], eff: { atk: 0.5 } },
    ] },

  // Hiệp khách thứ bảy (2026-11-12): từ ảnh mẫu 10 sao; Kỹ Năng hệ Ám (Bạo 10, Né 5).
  // Nộ S+ Hấp Tinh Đại Pháp (người dùng chốt cấp 1): đánh toàn địch 66% Công, Công toàn địch −7% 2 hiệp (kháng bạo toàn đội chỉ có ở sao cao).
  nham_nga_hanh: { name: 'Nhậm Ngã Hành', img: 'tm_hac_lao', art: 'game/img/hk/nham_nga_hanh.jpg', face: [0.57, 0.23], sprite: 'game/img/hk/nham_nga_hanh_sd.png', hand: [0.86, 0.3], role: 'ky_nang', q: 4, lv: 1, star: 1, hanh: 'am', tuChat: 14,
    st: { hp: 945.0, atk: 479.1, def: 179.1, hoi: 204.1, spd: 42, mi: 100 },
    grow: { hp: 47.25, atk: 23.96, def: 8.96, hoi: 10.2 },
    ex: { crit: 10, critDmg: 150, acc: 100, dodge: 5 },
    skill: { grade: 'S+', name: 'Hấp Tinh Đại Pháp', desc: 'Tấn công toàn bộ kẻ địch 66% Công, giảm 7% Công toàn bộ kẻ địch trong 2 hiệp' },
    ult: { kind: 'drain', pow: 0.66, atkDown: 0.07, turns: 2 },
    // hình động Blender (tools/blender/nham_nga_hanh.py): chem = vồ bàn tay vuốt (vết cào tím), hut = giơ tay run lên hút khí (vortex trên mọi kẻ địch, khí bay về tay; hit = khung siết tay)
    anim: { iw: 517, ih: 700, box: [-80, -90, 600, 760],
      idle: { src: 'game/img/blender/nnh_idle.webp', n: 24, ms: 1300 },
      chem: { src: 'game/img/blender/nnh_danh.webp', n: 16, ms: 750, hit: 7, slash: 'cao_tim' },
      hut: { src: 'game/img/blender/nnh_hut.webp', n: 30, ms: 1600, fx: 7, hit: 22 } },
    duyen: [
      { name: 'Đối Địch', desc: 'Cùng ra trận Công +130%', with: ['nhac_bat_quan'], eff: { atk: 1.3 } },
      { name: 'Song Đấu', desc: 'Cùng ra trận Thủ +250%', with: ['dong_phuong'], eff: { def: 2.5 } },
      { name: 'Thần Giáo', desc: 'Cùng ra trận Công +200% HP +350%', with: ['nham_doanh_doanh', 'huong_van_thien', 'dong_phuong', 'lenh_ho_xung'], eff: { atk: 2, hp: 3.5 } },
      { name: 'Hắc Mộc Lệnh', desc: 'Sử dụng Công +100%', with: [{ ten: 'Hắc Mộc Lệnh', loai: 'bao' }], eff: { atk: 1 } },
      { name: 'Hấp Tinh Phổ', desc: 'Sử dụng Bền +30%', with: [{ ten: 'Hấp Tinh Phổ', loai: 'bao' }], eff: { ben: 30 } },
      { name: 'Thần Lệnh', desc: 'Sử dụng Phá Giáp +2000', with: [{ ten: 'Thần Lệnh', loai: 'bao' }], eff: { phaGiap: 2000 } },
      { name: 'Phá Sơn Kiếm', desc: 'Sử dụng Bền +35%', with: [{ ten: 'Phá Sơn Kiếm', loai: 'bao' }], eff: { ben: 35 } },
      { name: 'Vĩnh Sinh Giới', desc: 'Sử dụng Bạo +30%', with: [{ ten: 'Vĩnh Sinh Giới', loai: 'bao' }], eff: { crit: 30 } },
      { name: 'Tiểu Điêu', desc: 'Sử dụng Phá Giáp +5000', with: [{ ten: 'Tiểu Điêu', loai: 'linh' }], eff: { phaGiap: 5000 } },
    ] },

  // Hiệp khách thứ tám (2026-11-12): từ ảnh mẫu 10 sao; Công Kích hệ Thủy. Nộ S Cửu Kiếm Quyết (người dùng chốt cấp 1):
  // đánh toàn địch 85% Công, Chuẩn toàn đội +16% 2 hiệp (Chuẩn chưa có tác dụng trong trận đội; giảm Nộ 2 địch chỉ có ở sao cao).
  lenh_ho_xung: { name: 'Lệnh Hồ Xung', img: 'tm_thanh_kiem', art: 'game/img/hk/lenh_ho_xung.jpg', face: [0.5, 0.27], sprite: 'game/img/hk/lenh_ho_xung_sd.png', hand: [0.98, 0.2], role: 'cong_kich', q: 4, lv: 1, star: 1, hanh: 'thuy', tuChat: 14,
    st: { hp: 861.1, atk: 483.2, def: 196.1, hoi: 173.1, spd: 50, mi: 100 },
    grow: { hp: 43.06, atk: 24.16, def: 9.8, hoi: 8.66 },
    ex: { crit: 15, critDmg: 150, acc: 100, dodge: 2.5 },
    skill: { grade: 'S', name: 'Cửu Kiếm Quyết', desc: 'Tấn công toàn địch 85% Công, tăng 16% Chuẩn toàn đội trong 2 hiệp' },
    ult: { kind: 'volley', pow: 0.85, shot: 'kiem_khi', per: 3, teamAcc: 0.16, turns: 2 },
    // hình động Blender (tools/blender/lenh_ho_xung.py): chem = giơ kiếm chém xuống (vệt chém nước), kiem = múa kiếm rồi chỉ kiếm (khung fire = kiếm khí bắn ra)
    anim: { iw: 459, ih: 700, box: [-90, -150, 600, 760],
      idle: { src: 'game/img/blender/lhx_idle.webp', n: 24, ms: 1300 },
      chem: { src: 'game/img/blender/lhx_danh.webp', n: 16, ms: 750, hit: 8, slash: 'nuoc' },
      volley: { src: 'game/img/blender/lhx_kiem.webp', n: 30, ms: 1500, fire: 20 } },
    duyen: [   // theo ảnh game mẫu người dùng gửi 2026-11-12
      { name: 'Sư Đồ', desc: 'Cùng ra trận Thủ +250%', with: ['nhac_bat_quan'], eff: { def: 2.5 } },
      { name: 'Thần Giáo', desc: 'Cùng ra trận Công +300% HP +300%', with: ['nham_doanh_doanh', 'huong_van_thien', 'dong_phuong', 'nham_nga_hanh'], eff: { atk: 3, hp: 3 } },
      { name: 'Tiếu Khán', desc: 'Cùng ra trận Công +130%', with: ['nham_doanh_doanh'], eff: { atk: 1.3 } },
      { name: 'Cửu Kiếm Lục', desc: 'Sử dụng Bạo +12%', with: [{ ten: 'Cửu Kiếm Lục', loai: 'bao' }], eff: { crit: 12 } },
      { name: 'Hấp Tinh Phổ', desc: 'Sử dụng Công +25%', with: [{ ten: 'Hấp Tinh Phổ', loai: 'bao' }], eff: { atk: 0.25 } },
      { name: 'Bạch Miêu', desc: 'Sử dụng Bạo Sát +35%', with: [{ ten: 'Bạch Miêu', loai: 'linh' }], eff: { critDmg: 35 } },
    ] },

  // Hiệp khách thứ chín (2026-11-12): game mẫu ghi "Đông Phương Cô Nương"; tạm dùng "Đông Phương Bất Bại" cho khớp các Duyên.
  // Từ ảnh mẫu 10 sao; Kỹ Năng hệ Ám, Tư chất 15. Nộ Quỳ Hoa Công (người dùng chốt cấp 1): đánh toàn địch 80% Công, Công bản thân +5% 2 hiệp.
  dong_phuong: { name: 'Đông Phương Bất Bại', img: 'tm_nu_quy', art: 'game/img/hk/dong_phuong.jpg', face: [0.5, 0.31], sprite: 'game/img/hk/dong_phuong_sd.png', hand: [0.82, 0.43], role: 'ky_nang', q: 4, lv: 1, star: 1, hanh: 'am', tuChat: 15,
    st: { hp: 1170.0, atk: 588.0, def: 224.0, hoi: 234.1, spd: 67, mi: 100 },
    grow: { hp: 58.5, atk: 29.4, def: 11.2, hoi: 11.7 },
    ex: { crit: 10, critDmg: 150, acc: 100, dodge: 5 },
    skill: { grade: 'S', name: 'Quỳ Hoa Công', desc: 'Tấn công toàn địch 80% Công, tăng 5% Công bản thân trong 2 hiệp' },
    ult: { kind: 'volley', pow: 0.8, shot: 'kim', per: 3, selfAtk: 0.05, turns: 2 },
    // hình động Blender (tools/blender/dong_phuong.py): danh = búng kim (khung fire), volley = xoay người rồi vung kim (khung fire = mưa kim)
    anim: { iw: 635, ih: 700, box: [-60, -90, 700, 760],
      idle: { src: 'game/img/blender/dpb_idle.webp', n: 24, ms: 1300 },
      danh: { src: 'game/img/blender/dpb_danh.webp', n: 16, ms: 800, fire: 7, shot: 'kim' },
      volley: { src: 'game/img/blender/dpb_quy.webp', n: 30, ms: 1500, fire: 20 } },
    duyen: [   // theo ảnh game mẫu; tên người trong Đệ Nhất / Tuyệt Ác chưa rõ (chờ người dùng)
      { name: 'Đệ Nhất', desc: 'Cùng ra trận Công +125% Bạo +35%', with: [{ ten: 'Chưa rõ' }, { ten: 'Chưa rõ' }, { ten: 'Chưa rõ' }, { ten: 'Chưa rõ' }], eff: { atk: 1.25, crit: 35 } },
      { name: 'Ân Cừu', desc: 'Cùng ra trận Công +100% Thủ +75%', with: ['lenh_ho_xung', 'nham_nga_hanh'], eff: { atk: 1, def: 0.75 } },
      { name: 'Tuyệt Ác', desc: 'Cùng ra trận Công +175% Bạo Sát +50%', with: [{ ten: 'Chưa rõ' }, { ten: 'Chưa rõ' }, { ten: 'Chưa rõ' }, { ten: 'Chưa rõ' }], eff: { atk: 1.75, critDmg: 50 } },
      { name: 'Dịch Cân Kinh', desc: 'Sử dụng Bạo +25%', with: [{ ten: 'Dịch Cân Kinh', loai: 'bao' }], eff: { crit: 25 } },
      { name: 'Giáng Long Châu', desc: 'Sử dụng Thủ +100%', with: [{ ten: 'Giáng Long Châu', loai: 'bao' }], eff: { def: 1 } },
      { name: 'Tử Vi Kiếm', desc: 'Sử dụng Bạo +30%', with: [{ ten: 'Tử Vi Kiếm', loai: 'bao' }], eff: { crit: 30 } },
      { name: 'Ma Hoàng Trảo', desc: 'Sử dụng Công +120%', with: [{ ten: 'Ma Hoàng Trảo', loai: 'bao' }], eff: { atk: 1.2 } },
      { name: 'Giáng Long Hoàn', desc: 'Sử dụng Phá Giáp +10000', with: [{ ten: 'Giáng Long Hoàn', loai: 'bao' }], eff: { phaGiap: 10000 } },
      { name: 'Cẩu Hùng', desc: 'Sử dụng Tốc +5%', with: [{ ten: 'Cẩu Hùng', loai: 'linh' }], eff: { spd: 0.05 } },
    ] },

  // Hiệp khách thứ mười (2026-11-12): từ ảnh mẫu 10 sao; Hộ Vệ hệ Ám, Tư chất 13 (Bạo 0, Bền 10, Né 5).
  // Nộ Hấp Công Hộ Thể (người dùng chốt cấp 1): Thủ bản thân +50% 3 hiệp (hồi toàn đội chỉ có ở cấp kỹ năng cao), khiên khí tím suốt hiệu lực.
  huong_van_thien: { name: 'Hướng Vấn Thiên', img: 'tm_cuong_khach', art: 'game/img/hk/huong_van_thien.jpg', face: [0.54, 0.28], sprite: 'game/img/hk/huong_van_thien_sd.png', hand: [0.97, 0.3], role: 'ho_ve', q: 4, lv: 1, star: 1, hanh: 'am', tuChat: 13,
    st: { hp: 1180.1, atk: 332.2, def: 232.2, hoi: 210.1, spd: 53, mi: 300 },
    grow: { hp: 59.0, atk: 16.61, def: 11.61, hoi: 10.5 },
    ex: { crit: 0, critDmg: 150, acc: 100, dodge: 5, ben: 10 },
    skill: { grade: 'S', name: 'Hấp Công Hộ Thể', desc: 'Tăng 50% Thủ bản thân trong 3 hiệp' },
    ult: { kind: 'fortify', selfDef: 0.5, turns: 3 },
    // hình động Blender (tools/blender/huong_van_thien.py): chem = tung chưởng (chưởng khí tím), ho = thủ thế gồng người (khung fx = khiên bừng lên)
    anim: { iw: 613, ih: 700, box: [-80, -90, 720, 760],
      idle: { src: 'game/img/blender/hvt_idle.webp', n: 24, ms: 1300 },
      chem: { src: 'game/img/blender/hvt_danh.webp', n: 16, ms: 750, hit: 8, slash: 'chuong' },
      ho: { src: 'game/img/blender/hvt_ho.webp', n: 24, ms: 1200, fx: 12 } },
    duyen: [   // theo ảnh game mẫu người dùng gửi 2026-11-12
      { name: 'Can Trường', desc: 'Cùng ra trận HP +250%', with: [{ ten: 'Điền Bá Quang' }], eff: { hp: 2.5 } },
      { name: 'Tả Sứ', desc: 'Cùng ra trận Thủ +250%', with: [{ ten: 'Dương Tiêu' }], eff: { def: 2.5 } },
      { name: 'Thần Giáo', desc: 'Cùng ra trận Công +300% HP +300%', with: ['nham_nga_hanh', 'nham_doanh_doanh', 'dong_phuong', 'lenh_ho_xung'], eff: { atk: 3, hp: 3 } },
      { name: 'Hắc Mộc Lệnh', desc: 'Sử dụng Đỡ Đòn +10%', with: [{ ten: 'Hắc Mộc Lệnh', loai: 'bao' }], eff: { doDon: 10 } },
      { name: 'Thần Lệnh', desc: 'Sử dụng Thủ +200%', with: [{ ten: 'Thần Lệnh', loai: 'bao' }], eff: { def: 2 } },
      { name: 'Hộ Pháp Lệnh', desc: 'Sử dụng HP +150%', with: [{ ten: 'Hộ Pháp Lệnh', loai: 'bao' }], eff: { hp: 1.5 } },
      { name: 'Áo Cà Sa', desc: 'Sử dụng Bền +30%', with: [{ ten: 'Áo Cà Sa', loai: 'bao' }], eff: { ben: 30 } },
      { name: 'Giáng Long Châu', desc: 'Sử dụng HP +200%', with: [{ ten: 'Giáng Long Châu', loai: 'bao' }], eff: { hp: 2 } },
      { name: 'Tiểu Giải', desc: 'Sử dụng Thủ +100%', with: [{ ten: 'Tiểu Giải', loai: 'linh' }], eff: { def: 1 } },
    ] },

  // Hiệp khách thứ mười một (2026-11-13): từ ảnh mẫu 10 sao; Hỗ Trợ hệ Lôi, Tư chất 13 (Bền 5, Né 7,5).
  // Nộ Diệt Tuyệt Thiên Lôi (người dùng chốt cấp 1): giảm 34% Thủ toàn địch 3 hiệp, KHÔNG gây sát thương (chỉ giáng sét).
  to_tinh_ha: { name: 'Tô Tinh Hà', img: 'tm_hac_lao', art: 'game/img/hk/to_tinh_ha.jpg', face: [0.54, 0.27], sprite: 'game/img/hk/to_tinh_ha_sd.png', hand: [0.95, 0.24], role: 'ho_tro', q: 4, lv: 1, star: 1, hanh: 'loi', tuChat: 13,
    st: { hp: 970.0, atk: 412.0, def: 206.0, hoi: 164.2, spd: 56, mi: 100 },
    grow: { hp: 48.5, atk: 20.6, def: 10.3, hoi: 8.21 },
    ex: { crit: 0, critDmg: 150, acc: 100, dodge: 7.5, ben: 5 },
    skill: { grade: 'A', name: 'Diệt Tuyệt Thiên Lôi', desc: 'Giáng sét giảm 34% Thủ toàn bộ địch trong 3 hiệp' },
    ult: { kind: 'thunder', defDown: 0.34, turns: 3 },
    // hình động Blender (tools/blender/to_tinh_ha.py): danh = búng quân cờ (khung fire), loi = giơ cờ ngắm ván cờ (khung board = ván cờ hiện), búng xuống (khung strike = sét giáng)
    anim: { iw: 518, ih: 700, box: [-80, -100, 600, 760],
      idle: { src: 'game/img/blender/tth_idle.webp', n: 24, ms: 1300 },
      danh: { src: 'game/img/blender/tth_danh.webp', n: 16, ms: 800, fire: 7, shot: 'quan_co' },
      loi: { src: 'game/img/blender/tth_loi.webp', n: 30, ms: 1600, board: 4, strike: 17 } },
    duyen: [   // người dùng chốt 2026-11-13: lấy theo ảnh 10 sao (ảnh 1 sao bị lỗi, thiếu Duyên); tên người theo ảnh 1 sao
      { name: 'Tiêu Dao', desc: 'Cùng ra trận Công +250% Thủ +350%', with: [{ ten: 'Lý Thu Thủy' }, { ten: 'Vô Nhai Tử' }, { ten: 'Thiên Sơn Đồng Lão' }], eff: { atk: 2.5, def: 3.5 } },
      { name: 'Kỳ Chức', desc: 'Cùng ra trận Thủ +250%', with: [{ ten: 'Phong Ba Ác' }], eff: { def: 2.5 } },
      { name: 'Tương Khắc', desc: 'Cùng ra trận HP +250%', with: [{ ten: 'Thiên Sơn Đồng Lão' }], eff: { hp: 2.5 } },
      { name: 'Bàn Cờ', desc: 'Sử dụng Bền +30%', with: [{ ten: 'Bàn Cờ', loai: 'bao' }], eff: { ben: 30 } },
      { name: 'Thiết Chỉ', desc: 'Sử dụng Thủ +100%', with: [{ ten: 'Thiết Chỉ', loai: 'bao' }], eff: { def: 1 } },
      { name: 'Kinh Vô Tự', desc: 'Sử dụng HP +150%', with: [{ ten: 'Kinh Vô Tự', loai: 'bao' }], eff: { hp: 1.5 } },
      { name: 'Dịch Cân Kinh', desc: 'Sử dụng Tốc +5%', with: [{ ten: 'Dịch Cân Kinh', loai: 'bao' }], eff: { spd: 0.05 } },
      { name: 'Vũ Uy Bội', desc: 'Sử dụng Bền +40%', with: [{ ten: 'Vũ Uy Bội', loai: 'bao' }], eff: { ben: 40 } },
      { name: 'Tiểu Hổ', desc: 'Sử dụng Tốc +5%', with: [{ ten: 'Tiểu Hổ', loai: 'linh' }], eff: { spd: 0.05 } },
    ] },

  // Hiệp khách thứ mười hai (2026-11-13): từ ảnh mẫu 10 sao; Kỹ Năng hệ Lôi, Tư chất 13 (Bạo 10, Né 5).
  // Nộ Tiêu Tương Dạ Vũ (người dùng chốt cấp 1): sát thương toàn địch 63% Công (giảm bạo toàn địch chỉ ở cấp cao).
  mac_dai: { name: 'Mạc Đại Tiên Sinh', img: 'tm_hac_lao', art: 'game/img/hk/mac_dai.jpg', face: [0.5, 0.27], sprite: 'game/img/hk/mac_dai_sd.png', hand: [0.93, 0.36], role: 'ky_nang', q: 4, lv: 1, star: 1, hanh: 'loi', tuChat: 13,
    st: { hp: 870.2, atk: 448.1, def: 188.2, hoi: 168.0, spd: 42, mi: 100 },
    grow: { hp: 43.51, atk: 22.4, def: 9.41, hoi: 8.4 },
    ex: { crit: 10, critDmg: 150, acc: 100, dodge: 5, ben: 0 },
    skill: { grade: 'S', name: 'Tiêu Tương Dạ Vũ', desc: 'Gây sát thương bằng 63% Công cho toàn bộ địch' },
    ult: { kind: 'rain', pow: 0.63 },
    // hình động Blender (tools/blender/mac_dai.py): danh = đâm cần đàn (kiếm giấu trong đàn), khung fire bắn kiếm khí;
    // vu = kéo đàn liên hồi (khung cloud = mây mưa kéo tới), rồi đâm cần đàn (khung strike = kiếm khí chém từng kẻ)
    anim: { iw: 516, ih: 700, box: [-90, -110, 640, 760],
      idle: { src: 'game/img/blender/md_idle.webp', n: 24, ms: 1300 },
      danh: { src: 'game/img/blender/md_danh.webp', n: 16, ms: 800, fire: 8, shot: 'kiem_khi' },
      vu: { src: 'game/img/blender/md_vu.webp', n: 30, ms: 1600, cloud: 3, strike: 19 } },
    duyen: [   // số theo ảnh 10 sao, tên người theo ảnh 1 sao (Miêu Nhân Phụng theo ảnh Duyên của Tả Lãnh Thiền)
      { name: 'Tấu Nhạc', desc: 'Cùng ra trận Công +130%', with: [{ ten: 'Đông Tà' }], eff: { atk: 1.3 } },
      { name: 'Hư Vô', desc: 'Cùng ra trận Công +150% HP +200%', with: [{ ten: 'Miêu Nhân Phụng' }, 'thien_mon'], eff: { atk: 1.5, hp: 2 } },
      { name: 'Ngũ Nhạc', desc: 'Cùng ra trận Công +250% HP +250%', with: ['nhac_bat_quan', 'ta_lanh_thien', 'thien_mon', { ten: 'Định Nhàn Sư Thái' }], eff: { atk: 2.5, hp: 2.5 } },
      { name: 'Võ Lâm Bí Sử', desc: 'Sử dụng Công +100%', with: [{ ten: 'Võ Lâm Bí Sử', loai: 'bao' }], eff: { atk: 1 } },
      { name: 'Cô Tô Bí Kỹ', desc: 'Sử dụng Phá Giáp +2000', with: [{ ten: 'Cô Tô Bí Kỹ', loai: 'bao' }], eff: { phaGiap: 2000 } },
      { name: 'Kỳ Môn Lục', desc: 'Sử dụng HP +150%', with: [{ ten: 'Kỳ Môn Lục', loai: 'bao' }], eff: { hp: 1.5 } },
      { name: 'Ma Hoàng Trảo', desc: 'Sử dụng Bạo +25%', with: [{ ten: 'Ma Hoàng Trảo', loai: 'bao' }], eff: { crit: 25 } },
      { name: 'Đằng Long Bội', desc: 'Sử dụng Bền +30%', with: [{ ten: 'Đằng Long Bội', loai: 'bao' }], eff: { ben: 30 } },
      { name: 'Dã Trư', desc: 'Sử dụng Bạo +30%', with: [{ ten: 'Dã Trư', loai: 'linh' }], eff: { crit: 30 } },
    ] },

  // Hiệp khách thứ mười ba (2026-11-13): từ ảnh mẫu (Cơ Bản ÷ 1,2⁹, khớp ảnh cấp 1 840 / 452 / 188 / 166); Công Kích hệ Thủy, Tư chất 13.
  // Nộ Hàn Băng Chưởng cấp 1: tấn công toàn địch 85% Công (tăng Công toàn đội + giảm Đỡ 1 địch chỉ ở sao cao).
  ta_lanh_thien: { name: 'Tả Lãnh Thiền', img: 'tm_hac_rau', art: 'game/img/hk/ta_lanh_thien.jpg', face: [0.54, 0.28], sprite: 'game/img/hk/ta_lanh_thien_sd.png', hand: [0.91, 0.41], role: 'cong_kich', q: 4, lv: 1, star: 1, hanh: 'thuy', tuChat: 13,
    st: { hp: 840.1, atk: 452.1, def: 188.2, hoi: 166.1, spd: 45, mi: 100 },
    grow: { hp: 42.0, atk: 22.6, def: 9.41, hoi: 8.3 },
    ex: { crit: 15, critDmg: 150, acc: 100, dodge: 2.5, ben: 0 },
    skill: { grade: 'A', name: 'Hàn Băng Chưởng', desc: 'Tấn công toàn bộ địch 85% Công' },
    ult: { kind: 'frost', pow: 0.85 },
    // hình động Blender (tools/blender/ta_lanh_thien.py): danh = phóng chưởng bắn băng tiễn (khung fire), chuong = giơ tay tụ hàn khí rồi ấn chưởng xuống đất (khung push = băng lan ra)
    anim: { iw: 485, ih: 700, box: [-90, -100, 620, 760],
      idle: { src: 'game/img/blender/tlt_idle.webp', n: 24, ms: 1300 },
      danh: { src: 'game/img/blender/tlt_danh.webp', n: 16, ms: 800, fire: 7, shot: 'bang_tien' },
      chuong: { src: 'game/img/blender/tlt_chuong.webp', n: 24, ms: 1200, push: 9 } },
    duyen: [   // theo ảnh 10 sao
      { name: 'Ảo Kiếm', desc: 'Cùng ra trận Công +130%', with: [{ ten: 'Miêu Nhân Phụng' }], eff: { atk: 1.3 } },
      { name: 'Kỳ Chức', desc: 'Cùng ra trận Thủ +250%', with: ['to_tinh_ha'], eff: { def: 2.5 } },
      { name: 'Ngũ Nhạc', desc: 'Cùng ra trận Công +250% HP +250%', with: ['nhac_bat_quan', 'thien_mon', { ten: 'Định Nhàn Sư Thái' }, 'mac_dai'], eff: { atk: 2.5, hp: 2.5 } },
      { name: 'Quỳ Hoa Lục', desc: 'Sử dụng Công +100%', with: [{ ten: 'Quỳ Hoa Lục', loai: 'bao' }], eff: { atk: 1 } },
      { name: 'Quân Tử Kiếm', desc: 'Sử dụng Bạo +25%', with: [{ ten: 'Quân Tử Kiếm', loai: 'bao' }], eff: { crit: 25 } },
      { name: 'Minh Chủ Lệnh', desc: 'Sử dụng HP +150%', with: [{ ten: 'Minh Chủ Lệnh', loai: 'bao' }], eff: { hp: 1.5 } },
      { name: 'Phá Thần Cung', desc: 'Sử dụng Tốc +5%', with: [{ ten: 'Phá Thần Cung', loai: 'bao' }], eff: { spd: 0.05 } },
      { name: 'Xích Lân Kiếm', desc: 'Sử dụng Bạo +30%', with: [{ ten: 'Xích Lân Kiếm', loai: 'bao' }], eff: { crit: 30 } },
      { name: 'Tiểu Giải', desc: 'Sử dụng Bạo +30%', with: [{ ten: 'Tiểu Giải', loai: 'linh' }], eff: { crit: 30 } },
    ] },

  // Hiệp khách thứ mười bốn (2026-11-13): từ ảnh mẫu (Cơ Bản 10 sao ÷ 1,2⁹; khớp ảnh Lv 19: Công 1176, Hồi 341); Công Kích hệ Lôi, Tư chất 14.
  // Nộ Quân Tử Kiếm cấp 1: tấn công mục tiêu 150% Công, Công bản thân +16% 2 hiệp (giảm Thủ mục tiêu chỉ ở sao cao).
  nhac_bat_quan: { name: 'Nhạc Bất Quần', img: 'tm_kiem_khach', art: 'game/img/hk/nhac_bat_quan.jpg', face: [0.5, 0.3], sprite: 'game/img/hk/nhac_bat_quan_sd.png', hand: [0.23, 0.6], role: 'cong_kich', q: 4, lv: 1, star: 1, hanh: 'loi', tuChat: 14,
    st: { hp: 1040.2, atk: 619.0, def: 194.0, hoi: 179.1, spd: 50, mi: 100 },
    grow: { hp: 52.0, atk: 30.95, def: 9.7, hoi: 8.96 },
    ex: { crit: 15, critDmg: 150, acc: 100, dodge: 2.5, ben: 0 },
    skill: { grade: 'S', name: 'Quân Tử Kiếm', desc: 'Tấn công mục tiêu 150% Công, tăng 16% Công bản thân trong 2 hiệp' },
    ult: { kind: 'blink', pow: 1.5, selfAtk: 0.16, turns: 2 },
    // hình động Blender (tools/blender/nhac_bat_quan.py): chem = chém hất kiếm (khung hit, vệt kiếm vàng tím), kiem = vung kiếm hoa lúc thuấn di tới mục tiêu
    anim: { iw: 331, ih: 700, box: [-120, -90, 470, 760],
      idle: { src: 'game/img/blender/nbq_idle.webp', n: 24, ms: 1300 },
      chem: { src: 'game/img/blender/nbq_chem.webp', n: 16, ms: 750, hit: 8, slash: 'loi' },
      kiem: { src: 'game/img/blender/nbq_kiem.webp', n: 20, ms: 1000 } },
    duyen: [   // theo ảnh 10 sao
      { name: 'Sư Đồ', desc: 'Cùng ra trận Thủ +250%', with: ['lenh_ho_xung'], eff: { def: 2.5 } },
      { name: 'Đối Địch', desc: 'Cùng ra trận Công +130%', with: ['nham_nga_hanh'], eff: { atk: 1.3 } },
      { name: 'Ngũ Nhạc', desc: 'Cùng ra trận Công +250% HP +250%', with: ['ta_lanh_thien', 'thien_mon', { ten: 'Định Nhàn Sư Thái' }, 'mac_dai'], eff: { atk: 2.5, hp: 2.5 } },
      { name: 'Quỳ Hoa Lục', desc: 'Sử dụng Công +100%', with: [{ ten: 'Quỳ Hoa Lục', loai: 'bao' }], eff: { atk: 1 } },
      { name: 'Quân Tử Kiếm', desc: 'Sử dụng Bạo +25%', with: [{ ten: 'Quân Tử Kiếm', loai: 'bao' }], eff: { crit: 25 } },
      { name: 'Hoa Sơn Lục', desc: 'Sử dụng Bạo +28%', with: [{ ten: 'Hoa Sơn Lục', loai: 'bao' }], eff: { crit: 28 } },
      { name: 'Ma Hoàng Trảo', desc: 'Sử dụng Bền +35%', with: [{ ten: 'Ma Hoàng Trảo', loai: 'bao' }], eff: { ben: 35 } },
      { name: 'Ma Hoàng Mão', desc: 'Sử dụng Bạo Sát +35%', with: [{ ten: 'Ma Hoàng Mão', loai: 'bao' }], eff: { critDmg: 35 } },
      { name: 'Đại Hổ', desc: 'Sử dụng Bạo Sát +35%', with: [{ ten: 'Đại Hổ', loai: 'linh' }], eff: { critDmg: 35 } },
    ] },

  // Hiệp khách thứ mười lăm (2026-11-13): từ ảnh mẫu (khớp ảnh cấp 1: Công 328, Thủ 232, Hồi 230, Tốc 53, Mị 300); Hộ Vệ hệ Quang, Tư chất 13.
  // Nộ Thiên Môn Thần Thuẫn cấp 1: hồi khí huyết bản thân 100% Hồi, Thủ bản thân +43% 3 hiệp (tăng HP bản thân chỉ ở sao cao).
  thien_mon: { name: 'Thiên Môn Đạo Nhân', img: 'tm_lao_dao_si', art: 'game/img/hk/thien_mon.jpg', face: [0.5, 0.31], sprite: 'game/img/hk/thien_mon_sd.png', hand: [0.79, 0.38], role: 'ho_ve', q: 4, lv: 1, star: 1, hanh: 'quang', tuChat: 13,
    st: { hp: 1190.2, atk: 328.1, def: 232.2, hoi: 230.0, spd: 53, mi: 300 },
    grow: { hp: 59.5, atk: 16.4, def: 11.6, hoi: 11.5 },
    ex: { crit: 0, critDmg: 150, acc: 100, dodge: 5, ben: 10 },
    skill: { grade: 'A', name: 'Thiên Môn Thần Thuẫn', desc: 'Hồi khí huyết bản thân bằng 100% Hồi, tăng 43% Thủ bản thân trong 3 hiệp' },
    ult: { kind: 'taiji', heal: 1.0, selfDef: 0.43, turns: 3 },
    // hình động Blender (tools/blender/thien_mon.py): chem = quất phất trần (khung hit), niem = đẩy tay bắt quyết (khung fx = tấm thái cực hiện)
    anim: { iw: 335, ih: 700, box: [-90, -90, 450, 760],
      idle: { src: 'game/img/blender/tmd_idle.webp', n: 24, ms: 1300 },
      chem: { src: 'game/img/blender/tmd_chem.webp', n: 16, ms: 750, hit: 8, slash: 'nuoc' },
      niem: { src: 'game/img/blender/tmd_niem.webp', n: 24, ms: 1300, fx: 9 } },
    duyen: [   // theo ảnh 10 sao
      { name: 'Đồng Đạo', desc: 'Cùng ra trận Thủ +250%', with: [{ ten: 'Lý Mạc Sầu' }], eff: { def: 2.5 } },
      { name: 'Hư Vô', desc: 'Cùng ra trận Công +150% HP +200%', with: [{ ten: 'Miêu Nhân Phụng' }, 'mac_dai'], eff: { atk: 1.5, hp: 2 } },
      { name: 'Ngũ Nhạc', desc: 'Cùng ra trận Công +250% HP +250%', with: ['nhac_bat_quan', 'ta_lanh_thien', { ten: 'Định Nhàn Sư Thái' }, 'mac_dai'], eff: { atk: 2.5, hp: 2.5 } },
      { name: 'Phất Trần', desc: 'Sử dụng Bền +35%', with: [{ ten: 'Phất Trần', loai: 'bao' }], eff: { ben: 35 } },
      { name: 'Lạc Anh Phổ', desc: 'Sử dụng Thủ +100%', with: [{ ten: 'Lạc Anh Phổ', loai: 'bao' }], eff: { def: 1 } },
      { name: 'Thái Cực Đồ', desc: 'Sử dụng Hồi +35%', with: [{ ten: 'Thái Cực Đồ', loai: 'bao' }], eff: { hoi: 0.35 } },
      { name: 'Tôn Sư Ký', desc: 'Sử dụng Né +35%', with: [{ ten: 'Tôn Sư Ký', loai: 'bao' }], eff: { dodge: 35 } },
      { name: 'Dịch Cân Kinh', desc: 'Sử dụng Đỡ Đòn +10%', with: [{ ten: 'Dịch Cân Kinh', loai: 'bao' }], eff: { doDon: 10 } },
      { name: 'Tiểu Hùng', desc: 'Sử dụng HP +100%', with: [{ ten: 'Tiểu Hùng', loai: 'linh' }], eff: { hp: 1 } },
    ] },

  hoang_y_nu: { name: 'Hoàng Y Nữ', img: 'tm_hoang_y_kiem_nu', role: 'ho_tro', q: 2, lv: 1, star: 1, hanh: 'hoa', tuChat: 11,
    st: { hp: 2100, atk: 1350, def: 1100, hoi: 500, spd: 55, mi: 90 },
    skill: { grade: 'A', name: 'Phượng Minh Khúc', desc: 'Tăng 20% Công toàn đội 2 hiệp' },
    duyen: [{ name: 'Tri Kỷ', desc: 'Cùng ra trận Hồi +20%', with: [], ok: true }] },
};
// 15 hiệp khách phẩm xanh lá (thấp nhất, người dùng yêu cầu 2026-11-13): cùng chỉ số theo ảnh mẫu "Đệ Tử 9 Túi"
// (cấp 1: HP 600 / Công 240 / Thủ 120 / Hồi 120, mỗi cấp +5%; Tốc 1, Mị 100, Tư chất 6, Công Kích); hình là ảnh cao thủ tháp không hào quang.
// Mỗi hệ 3 người: 2 người nộ đánh một mục tiêu 154% Công, 1 người nộ đánh toàn địch 50% Công.
const HK_XANH = [
  ['xanh_thanh_hu', 'Thanh Hư Đạo Đồng', 'tm_dao_thai_cuc', 'thuy'], ['xanh_bang_tam', 'Băng Tâm Nữ', 'tm_nu_dao', 'thuy'], ['xanh_thuy_anh', 'Thủy Ảnh Đao Khách', 'tm_song_dao', 'thuy', 1],
  ['xanh_hong_bao', 'Hồng Bào Kiếm Khách', 'tm_hong_bao', 'hoa'], ['xanh_xich_dien', 'Xích Diễm Nữ', 'tm_nu_mat_na', 'hoa'], ['xanh_xich_huyet', 'Xích Huyết Đao', 'tm_xich_mau', 'hoa', 1],
  ['xanh_kim_cuong', 'Kim Cương Tăng', 'tm_kim_tang', 'loi'], ['xanh_kim_phat', 'Kim Phát Thiếu Hiệp', 'tm_thieu_hiep_vang', 'loi'], ['xanh_loi_chuy', 'Lôi Chùy Lão', 'tm_lao_chuy', 'loi', 1],
  ['xanh_bach_sa', 'Bạch Sa Tiên Tử', 'tm_nu_sa', 'quang'], ['xanh_bach_lien', 'Bạch Liên Ca Cơ', 'tm_nu_lua', 'quang'], ['xanh_quang_minh', 'Quang Minh Lão Tăng', 'tm_lao_tang_rau', 'quang', 1],
  ['xanh_tu_kiem', 'Tử Kiếm Nữ', 'tm_kiem_tim', 'am'], ['xanh_hac_bao', 'Hắc Bào Quỷ Khách', 'tm_hac_bao', 'am'], ['xanh_tu_chu', 'Tử Chu Nữ', 'tm_nu_nhen', 'am', 1],
];
HK_XANH.forEach(([id, name, img, hanh, all]) => {
  HIEP_KHACH[id] = { name, img, role: 'cong_kich', q: 1, lv: 1, star: 1, hanh, tuChat: 6,
    st: { hp: 600, atk: 240, def: 120, hoi: 120, spd: 1, mi: 100 },
    grow: { hp: 30, atk: 12, def: 6, hoi: 6 },
    ex: { crit: 15, critDmg: 150, acc: 100, dodge: 2.5, ben: 0 },
    skill: all ? { grade: 'C', name: 'Loạn Vũ Tứ Phương', desc: 'Tấn công toàn bộ địch 50% Công' }
      : { grade: 'C', name: 'Toàn Lực Nhất Kích', desc: 'Tấn công một mục tiêu 154% Công' },
    ult: all ? { kind: 'all', pow: 0.5 } : { kind: 'one', pow: 1.54 },
    duyen: [] };
});
// Nhân vật mới được tặng sẵn (người dùng chốt 2026-11-12: Đoàn Diên Khánh + Nam Hải Ngạc Thần)
const HK_START = ['doan_dien_khanh', 'nam_hai_ngac_than', 'diep_nhi_nuong', 'doan_du', 'van_trung_hac', 'nham_doanh_doanh', 'nham_nga_hanh', 'lenh_ho_xung', 'dong_phuong', 'huong_van_thien', 'to_tinh_ha', 'mac_dai', 'ta_lanh_thien', 'nhac_bat_quan', 'thien_mon'];
// Hiệp khách đã có (P.hk[mã] = {lv, star}) + đội ra trận 5 ô (P.doi, null = ô trống). Bản lưu chưa có thì tặng Đoàn Diên Khánh.
function hkEnsure() {
  if (!P) return;
  if (!P.hk || !Object.keys(P.hk).length) { P.hk = {}; HK_START.forEach(id => { P.hk[id] = { lv: 1, star: 1 }; }); P.hkTang2 = true; P.hkTang3 = true; P.hkTang4 = true; P.hkTang5 = true; P.hkTang6 = true; P.hkTang7 = true; P.hkTang8 = true; P.hkTang9 = true; P.hkTang10 = true; }
  if (!Array.isArray(P.doi)) P.doi = HK_START.slice();
  P.doi = P.doi.slice(0, 5).map(id => (id && P.hk[id] && HIEP_KHACH[id] ? id : null));
  while (P.doi.length < 5) P.doi.push(null);
  // bản lưu đã có từ trước khi tặng Nam Hải Ngạc Thần: tặng bù một lần, xếp vào ô trống đầu tiên
  if (!P.hkTang2) {
    P.hkTang2 = true;
    if (!P.hk.nam_hai_ngac_than) P.hk.nam_hai_ngac_than = { lv: 1, star: 1 };
    const k = P.doi.indexOf(null); if (k >= 0 && !P.doi.includes('nam_hai_ngac_than')) P.doi[k] = 'nam_hai_ngac_than';
  }
  // tặng bù Diệp Nhị Nương (2026-11-12) cho bản lưu đã có, xếp vào ô trống đầu tiên
  if (!P.hkTang3) {
    P.hkTang3 = true;
    if (!P.hk.diep_nhi_nuong) P.hk.diep_nhi_nuong = { lv: 1, star: 1 };
    const k = P.doi.indexOf(null); if (k >= 0 && !P.doi.includes('diep_nhi_nuong')) P.doi[k] = 'diep_nhi_nuong';
  }
  // tặng bù Đoàn Dự (2026-11-12)
  if (!P.hkTang4) {
    P.hkTang4 = true;
    if (!P.hk.doan_du) P.hk.doan_du = { lv: 1, star: 1 };
    const k = P.doi.indexOf(null); if (k >= 0 && !P.doi.includes('doan_du')) P.doi[k] = 'doan_du';
  }
  // tặng bù Vân Trung Hạc (2026-11-12)
  if (!P.hkTang5) {
    P.hkTang5 = true;
    if (!P.hk.van_trung_hac) P.hk.van_trung_hac = { lv: 1, star: 1 };
    const k = P.doi.indexOf(null); if (k >= 0 && !P.doi.includes('van_trung_hac')) P.doi[k] = 'van_trung_hac';
  }
  // tặng bù Nhậm Doanh Doanh + Nhậm Ngã Hành (2026-11-12); đội đã đủ thì chỉ vào danh sách Võ Hiệp
  if (!P.hkTang6) {
    P.hkTang6 = true;
    ['nham_doanh_doanh', 'nham_nga_hanh'].forEach(id => {
      if (!P.hk[id]) P.hk[id] = { lv: 1, star: 1 };
      const k = P.doi.indexOf(null); if (k >= 0 && !P.doi.includes(id)) P.doi[k] = id;
    });
  }
  // tặng bù Lệnh Hồ Xung + Đông Phương Bất Bại (2026-11-12)
  if (!P.hkTang7) {
    P.hkTang7 = true;
    ['lenh_ho_xung', 'dong_phuong'].forEach(id => {
      if (!P.hk[id]) P.hk[id] = { lv: 1, star: 1 };
      const k = P.doi.indexOf(null); if (k >= 0 && !P.doi.includes(id)) P.doi[k] = id;
    });
  }
  // tặng bù Hướng Vấn Thiên (2026-11-12)
  if (!P.hkTang8) {
    P.hkTang8 = true;
    if (!P.hk.huong_van_thien) P.hk.huong_van_thien = { lv: 1, star: 1 };
    const k = P.doi.indexOf(null); if (k >= 0 && !P.doi.includes('huong_van_thien')) P.doi[k] = 'huong_van_thien';
  }
  // tặng bù Tô Tinh Hà (2026-11-13)
  if (!P.hkTang9) {
    P.hkTang9 = true;
    if (!P.hk.to_tinh_ha) P.hk.to_tinh_ha = { lv: 1, star: 1 };
    const k = P.doi.indexOf(null); if (k >= 0 && !P.doi.includes('to_tinh_ha')) P.doi[k] = 'to_tinh_ha';
  }
  // tặng bù Mạc Đại Tiên Sinh (2026-11-13)
  if (!P.hkTang10) {
    P.hkTang10 = true;
    if (!P.hk.mac_dai) P.hk.mac_dai = { lv: 1, star: 1 };
    const k = P.doi.indexOf(null); if (k >= 0 && !P.doi.includes('mac_dai')) P.doi[k] = 'mac_dai';
  }
  // tặng Tả Lãnh Thiền (2026-11-13), xếp vào ô trống nếu có
  if (!P.hkTang12) {
    P.hkTang12 = true;
    if (!P.hk.ta_lanh_thien) P.hk.ta_lanh_thien = { lv: 1, star: 1 };
    const k = P.doi.indexOf(null); if (k >= 0 && !P.doi.includes('ta_lanh_thien')) P.doi[k] = 'ta_lanh_thien';
  }
  // tặng Nhạc Bất Quần + Thiên Môn Đạo Nhân (2026-11-13), xếp vào ô trống nếu có
  if (!P.hkTang13) {
    P.hkTang13 = true;
    ['nhac_bat_quan', 'thien_mon'].forEach(id => {
      if (!P.hk[id]) P.hk[id] = { lv: 1, star: 1 };
      const k = P.doi.indexOf(null); if (k >= 0 && !P.doi.includes(id)) P.doi[k] = id;
    });
  }
  // tặng 15 hiệp khách phẩm xanh lá (2026-11-13), không xếp vào đội
  if (!P.hkTang11) {
    P.hkTang11 = true;
    HK_XANH.forEach(([id]) => { if (!P.hk[id]) P.hk[id] = { lv: 1, star: 1 }; });
  }
}
// Duyên đạt: hiệp khách đó và mọi người trong `with` đều đang ở đội ra trận; người / bảo vật / linh thú chưa có ({ ten }) thì chưa đạt
function duyenOk(id, d) {
  if (!d.with || !d.with.length) return !!d.ok;
  if (!P || !Array.isArray(P.doi) || !P.doi.includes(id)) return false;
  return d.with.every(w => typeof w === 'string' && P.doi.includes(w));
}
const hkGet = id => (id && HIEP_KHACH[id] && P.hk[id] ? Object.assign({ id }, HIEP_KHACH[id], P.hk[id]) : null);
function hkTeam() { hkEnsure(); return P.doi.map(hkGet); }        // 5 ô, có thể null
function hkMembers() { return hkTeam().filter(Boolean); }         // chỉ người có mặt
const HOME_Q = ['', 'thuong', 'hiem', 'tuyet', 'truyen']; // màu khung theo phẩm cấp (tạm)

// Ảnh thân hiệp khách: tranh riêng (art, có nền) nếu có, không thì hình cao thủ tạm
const heroImg = h => h.art || `game/img/quai/${h.img}.png`;
// Tâm mặt trên tranh (tỉ lệ ngang, dọc) để cắt chân dung; mặc định theo tranh Đoàn Diên Khánh
const heroFace = h => (h && h.face) || [0.5, 0.28];
// object-position cho ô cắt kiểu cover: dời theo tâm mặt so với tranh mặc định
const heroPos = (h, base) => { const [fx, fy] = heroFace(h); return `object-position:${Math.round(50 + (fx - 0.5) * 200)}% ${Math.round(base + (fy - 0.28) * 160)}%`; };
// Chỉ số theo cấp: gốc cấp 1 (st) + tăng mỗi cấp (grow) × (cấp − 1), làm tròn
// Chỉ số hiệp khách = gốc (theo cấp) × (1 + tổng % các Duyên đang đạt) (+ trang bị khi có).
// Người dùng chốt 2026-11-12 theo game mẫu: Duyên tính % trên chỉ số gốc, không nhân trang bị; nhiều Duyên thì CỘNG các %.
// base = true: chỉ số gốc, bỏ Duyên.
function heroSt(h, base) {
  const o = {}, g = h.grow || {}, n = (h.lv || 1) - 1, d = base ? {} : duyenBonus(h);
  Object.keys(h.st).forEach(k => { o[k] = Math.round((h.st[k] + (g[k] || 0) * n) * (1 + (d[k] || 0))); });
  return o;
}
// tổng % cộng thêm từ các Duyên đang đạt: { hp: 5, atk: 2, ... } (chỉ các chỉ số có trong st: hp, atk, def, hoi, spd)
function duyenBonus(h) {
  const o = {};
  (h.duyen || []).forEach(d => { if (d.eff && duyenOk(h.id, d)) Object.keys(d.eff).forEach(k => { o[k] = (o[k] || 0) + d.eff[k]; }); });
  return o;
}
const homePng = n => `<img src="game/img/icon/${n}.png" alt="" draggable="false">`;
// Lực chiến: tổng sức mạnh đội ra trận
const heroPower = h => { const s = heroSt(h); return Math.round(s.hp * 0.2 + s.atk * 3 + s.def * 2 + s.hoi + s.spd * 4); };
function lucChien() { return P ? hkMembers().reduce((a, h) => a + heroPower(h), 0) : 0; }
const homeSoon = what => toast(`${what}: sắp mở`);

// Phần đầu dùng chung (Trang chủ, màn chi tiết hiệp khách): băng tên, kinh nghiệm, tài nguyên + Lực Chiến
function homeHead() {
  const need = expNeed(P.lv), pct = P.lv >= MAX_LV ? 100 : Math.min(100, P.exp / need * 100);
  const pill = (k, v, side, name) => `<span class="hm-pill ${side}" title="${name}" style="background-image:url(game/img/icon/khung_${k}.png)"><b>${Number(v || 0).toLocaleString('vi-VN')}</b></span>`;
  const srv = typeof curServer !== 'undefined' ? 'S' + curServer : 'S1';
  return `    <header class="hm-top">
      <span class="hm-tl">[${srv}] [Cấp ${P.lv}]</span>
      <button class="hm-plaque" onclick="G.menuSystem()" title="Hệ thống"><b>${esc(P.name)}</b></button>
      <span class="hm-tr">${sectName(P.sect)}</span>
    </header>
    <div class="hm-xp"><small>Kinh nghiệm</small><div class="hm-exp"><i style="width:${pct.toFixed(1)}%"></i></div></div>
    <div class="hm-res">
      <div class="hm-col left">${pill('bac', P.gold, 'l', 'Bạc')}${pill('luong_thuc', P.luongThuc, 'l', 'Lương Thực')}</div>
      <div class="hm-power"><small>Thể Lực</small><div class="hm-arc">${typeof aiTL === 'function' ? aiTL() : 200}/200</div><b title="Lực chiến">${lucChien().toLocaleString('vi-VN')}</b></div>
      <div class="hm-col right">${pill('vang', P.vang, 'r', 'Kim Nguyên Bảo')}${pill('cong_hien', P.congHien, 'r', 'Cống Hiến')}</div>
    </div>`;
}
function renderHome() {
  if (!P) return renderTitle();
  if (!P.hk) { hkEnsure(); if (typeof saveGame === 'function') saveGame(); } // tạo nhân vật: tặng Đoàn Diên Khánh
  combat = null;
  closeModalSilent();
  homeStyle();
  homeNoDrag();
  const tb = el('topbar'); if (tb) tb.classList.add('hidden');
  if (hasSnd()) SND.music('village');
  const cards = hkTeam().map((h, i) => !h ? `<button class="hm-card empty" onclick="G.doiPick(${i}, 0, 'home')" aria-label="Ô trống"><i>+</i></button>` : `<button class="hm-card q-${HOME_Q[h.q]}" onclick="G.heroView('${h.id}')" aria-label="${h.name}">
      <img class="${h.art ? 'art' : ''}" src="${heroImg(h)}" alt="" draggable="false" style="${h.art ? heroPos(h, 22) : ''}">
      <span class="hm-band"><span class="hm-lv">${h.lv}</span><span class="hm-star">${'<i></i>'.repeat(h.star)}</span></span></button>`).join('');
  // Hàng nút nhanh: 4 ô (người dùng chốt 2026-11-12), icon ảnh Gemini nhanh_<mã>.png
  const quick = [
    ['G.menuQuests()', 'nhiem_vu', 'Nhiệm Vụ'],
    ['G.homeDaily()', 'su_kien', 'Sự Kiện'],
    ["G.homeSoon('Lì xì')", 'li_xi', 'Lì Xì'],
    ["G.homeSoon('Quà tặng')", 'qua_tang', 'Quà Tặng'],
  ].map(([f, ic, n]) => `<button class="hm-q" onclick="${f}"><span class="hm-ic">${homePng('nhanh_' + ic)}</span><b>${n}</b></button>`).join('');
  // Dải chức năng: cuộn ngang, mũi tên bên phải cuộn tiếp
  const funcs = [
    ['G.doiNgu()', homePng('cn_doi_ngu'), 'Đội Ngũ'],
    ['G.tangCap()', homePng('cn_tang_cap'), 'Tăng Cấp'],
    ["G.menuChar('gear')", homePng('cn_trang_bi'), 'Trang Bị'],
    ["G.homeSoon('Bảo vật')", homePng('cn_bao_vat'), 'Bảo Vật'],
    ['G.menuInv()', homePng('cn_tui_do'), 'Túi Đồ'],
  ].map(([f, ic, t]) => `<button class="hm-f" onclick="${f}"><span class="hm-ic">${ic}</span><b>${t}</b></button>`).join('');
  // Thanh dưới: icon ảnh Gemini nav_<mã>.png (2026-11-12), 5 ô (Hệ Thống mở bằng bảng tên trên cùng)
  const nav = homeNav('trang_chu');
  const last = (worldLog[worldLog.length - 1] || '').replace(/<[^>]+>/g, '').replace(/\[\[[a-z0-9_]+\]\]/g, '');
  show(`<div class="home">
    <div class="hm-bg"></div>
    ${homeHead()}
    <div class="hm-team">${cards}</div>
    <div class="hm-quick">${quick}</div>
    <div class="hm-modes">
      <button class="hm-mode l" onclick="G.homeChallenge()"><span class="hm-disc">${homePng('mode_pve')}</span><b>PVE</b></button>
      <button class="hm-mode c" onclick="G.aiMap()"><span class="hm-disc">${homePng('mode_giang_ho')}</span><b>Giang Hồ</b></button>
      <button class="hm-mode r" onclick="G.homeSoon('Tỉ Võ')"><span class="hm-disc">${homePng('mode_ti_vo')}</span><b>Tỉ Võ</b></button>
    </div>
    <div class="hm-funcs"><div class="hm-fscroll" id="hm-fscroll">${funcs}</div></div>
    <div class="hm-ticker">${esc(last)}</div>
    <nav class="hm-nav">${nav}</nav>
  </div>`, 'home');
}
// Thanh dưới dùng chung (Trang chủ, Quản lý Võ Hiệp): `on` = ô đang sáng
function homeNav(on) {
  return [
    ['G.home()', 'trang_chu', 'Trang Chủ'],
    ['G.voHiep()', 'hiep_khach', 'Hiệp Khách'],
    ["G.homeSoon('Chiêu mộ')", 'chieu_mo', 'Chiêu Mộ'],
    ["G.homeSoon('Kỳ ngộ')", 'ky_ngo', 'Kỳ Ngộ'],
    ['G.homeShops()', 'cua_tiem', 'Cửa Tiệm'],
  ].map(([f, ic, t]) => `<button class="${ic === on ? 'on' : ''}" ${ic === on ? '' : `onclick="${f}"`}><span class="hm-ic">${homePng('nav_' + ic)}</span><b>${t}</b></button>`).join('');
}
// Điện thoại (nhất là iPhone) vẫn kéo nảy cả trang dù không có gì để cuộn: chặn kéo trên Trang chủ, trừ dải chức năng vuốt ngang
function homeNoDrag() {
  if (window._hmNoDrag) return; window._hmNoDrag = 1;
  document.addEventListener('touchmove', e => {
    const t = e.target;
    if (t.closest && t.closest('.home, .td') && !t.closest('.hm-fscroll, .hd-scroll')) e.preventDefault();
  }, { passive: false });
}
function homeMore() { const s = document.getElementById('hm-fscroll'); if (s) s.scrollBy({ left: s.clientWidth * 0.8, behavior: 'smooth' }); }
/* ---------- MÀN CHI TIẾT HIỆP KHÁCH (2026-11-12, theo bản phác người dùng, khung 1116 × 2000) ----------
   Phần đầu giữ như Trang chủ (homeHead). Phần thân đặt tuyệt đối theo tọa độ bản phác (đơn vị cqw = điểm ảnh mẫu × 0,0896,
   gốc y = 390 của bản phác), phần dưới (chỉ số, tuyệt chiêu, duyên) xếp dọc và cuộn được. Không có thanh nút dưới.
   Số liệu lấy từ HIEP_KHACH + P.hk (cấp, sao); Nâng Cấp, Bảo Vật, Trang bị, Linh chưa có chức năng. */
let heroSel = null; // mã hiệp khách đang xem
let heroBack = 'G.home()'; // nút Trở về của màn chi tiết quay về đâu
function heroView(i, from) {
  if (from !== undefined) heroBack = from === 'vh' ? 'G.vhList()' : 'G.home()';
  if (!P) return renderTitle();
  const mem = hkMembers();
  heroSel = typeof i === 'string' && P.hk[i] ? i : (mem[i | 0] || mem[0]).id;
  const h = hkGet(heroSel), R = HERO_ROLES[h.role] || {}, H = NGU_HANH[h.hanh] || { name: '?', color: '#888' };
  closeModalSilent(); homeStyle(); heroStyle(); homeNoDrag();
  const tb = el('topbar'); if (tb) tb.classList.add('hidden');
  const u = v => (v * 0.0896).toFixed(2) + 'cqw';
  // Khung chính giãn theo chiều cao màn (--k, heroFit): vị trí dọc nhân --k; ô có s = true giãn cả chiều cao
  const box = (x, y, w, hh, s) => `left:${u(x)};top:calc(${u(y - 390)} * var(--k));width:${u(w)};height:${s ? `calc(${u(hh)} * var(--k))` : u(hh)}`;
  const stars = Array.from({ length: 5 }, (_, k) => `<i class="${k < h.star ? 'on' : ''}"></i>`).join('');
  const bao = [[640, 'Bảo Vật 1', ''], [905, 'Bảo Vật 2', ''], [1165, 'Bảo Vật 3', '3 sao mở']].map(([y, t, lock]) =>
    `<button class="hd-bao ${lock && h.star < 3 ? 'lock' : ''}" style="${box(92, y + 12, 200, 205, true)}" onclick="G.homeSoon('Bảo vật')"><b>${t}</b>${lock && h.star < 3 ? `<small>${lock}</small>` : ''}</button>`).join('');
  const eq = [['mu_1', 'Mũ'], ['kiem_1', 'Vũ khí'], ['ao_1', 'Giáp'], ['dai_lung_1', 'Đai lưng'], ['giay_1', 'Giày']].map(([ic, t], k) =>
    `<button class="hd-eq" style="${box(885, 572 + k * 152, 137, 137)}" onclick="G.homeSoon('Trang bị')"><span class="hd-eqi">[[${ic}]]</span><b>${t}</b></button>`).join('');
  const ST = [['hp', 'Khí huyết'], ['atk', 'Công'], ['def', 'Thủ'], ['hoi', 'Hồi'], ['spd', 'Tốc'], ['mi', 'Mị']];
  const hs = heroSt(h), sts = ST.map(([k, t]) => `<span><small>${t}</small><b>${(hs[k] || 0).toLocaleString('vi-VN')}</b></span>`).join('');
  // chân dung trong duyên: mã hiệp khách; chưa có thì mờ (vẫn hiện hình)
  // người / bảo vật / linh thú chưa có trong game ({ ten, loai }): ô mờ ghi tên
  // mỗi ô: chân dung + tên ở dưới (tự xuống dòng, không đè ô bên cạnh)
  const ava = id => {
    if (id && typeof id === 'object') return `<span class="hd-avi"><span class="hd-ava off none"><i>${id.loai === 'bao' ? 'Bảo vật' : id.loai === 'linh' ? 'Linh thú' : 'Chưa có'}</i></span><small class="off">${id.ten}</small></span>`;
    const o = HIEP_KHACH[id];
    return o ? `<span class="hd-avi"><button class="hd-ava ${P.hk[id] ? '' : 'off'}" ${P.hk[id] ? `onclick="G.heroView('${id}')"` : ''} title="${o.name}"><img class="${o.art ? 'art' : ''}" src="${heroImg(o)}" alt="" draggable="false" style="${o.art ? heroPos(o, 18) : ''}"></button><small class="${P.hk[id] ? '' : 'off'}">${o.name}</small></span>` : '';
  };
  const duyen = (h.duyen || []).map(d => { const ok = duyenOk(h.id, d); return `<div class="hd-bar hd-duyen"><b>Duyên: ${d.name}</b><span>${d.desc}</span><em class="${ok ? 'ok' : ''}">${ok ? 'Đạt' : 'Chưa đạt'}</em></div>
    <div class="hd-avas">${ava(h.id)}${(d.with || []).map(ava).join('')}</div>`; }).join('');
  show(`<div class="home hd">
    <div class="hm-bg"></div>
    ${homeHead()}
    <div class="hd-scroll">
      <div class="hd-body">
        <button class="hd-back" style="${box(18, 395, 257, 90)}" onclick="${heroBack}">Trở về</button>
        <div class="hd-lv" style="${box(420, 400, 380, 80)}"><span class="hd-stars">${stars}</span><b>Lv ${h.lv}</b></div>
        <button class="hd-up" style="${box(812, 395, 285, 90)}" onclick="G.tcPick('${h.id}')">${homePng('lo_ren')}<b>Nâng Cấp</b></button>
        <div class="hd-name" style="${box(338, 480, 464, 68)}"><i class="hd-hanh" style="--hc:${H.color}${H.name.length > 4 ? ";font-size:1.35cqw" : ""}${h.hanh === "quang" ? ";color:#5a4a20;text-shadow:none" : ""}" title="Ngũ hành: ${H.name}">${H.name}</i><b style="${h.name.length > 14 ? `font-size:${(3.4 * 14 / h.name.length).toFixed(2)}cqw` : ''}">${h.name}</b></div>
        <div class="hd-tu" style="${box(60, 500, 270, 55)}">Tư chất: ${h.tuChat}</div>
        <div class="hd-role" style="${box(60, 562, 270, 60)}"><img src="game/img/icon/loai_${h.role}.png" alt="" draggable="false"><b style="color:${R.color || '#fff'}">${R.name || ''}</b></div>
        ${bao}
        <div class="hd-art q-${HOME_Q[h.q]}" style="${box(360, 620, 440, 690, true)}"><img class="${h.art ? 'art' : ''}" src="${heroImg(h)}" alt="" draggable="false"></div>
        ${eq}
        <div class="hd-power" style="${box(362, 1338, 436, 74)}"><span>Chiến Lực:</span><b>${heroPower(h).toLocaleString('vi-VN')}</b></div>
        <button class="hd-linh" style="${box(895, 1325, 117, 117)}" onclick="G.homeSoon('Linh thú')">Linh</button>
      </div>
      <div class="hd-bar hd-stats">${sts}</div>
      <div class="hd-bar hd-skill"><i class="hd-grade">${h.skill.grade}</i><b>${h.skill.name}</b><span>${h.skill.desc}</span></div>
      ${duyen}
    </div>
  </div>`, 'hero-' + heroSel);
  heroFit();
}
// Ưu tiên khung chính (người dùng chốt): giãn khung chính cho kín màn, chỉ chừa dòng chỉ số + tuyệt chiêu; Duyên kéo xuống mới thấy
function heroFit() {
  const sc = document.querySelector('.hd-scroll'), body = sc && sc.querySelector('.hd-body');
  if (!body) return;
  body.style.setProperty('--k', 1);
  const cs = getComputedStyle(sc), padT = parseFloat(cs.paddingTop) || 0;
  const bars = [...sc.querySelectorAll('.hd-stats, .hd-skill')].reduce((a, e) => a + e.offsetHeight + (parseFloat(getComputedStyle(e).marginTop) || 0), 0);
  const avail = sc.clientHeight - padT - bars - 8, base = body.offsetHeight;
  body.style.setProperty('--k', Math.max(1, Math.min(1.25, avail / base)).toFixed(3));
}
window.addEventListener('resize', () => { if (document.querySelector('.hd-body')) heroFit(); });
function heroStyle() {
  if (document.getElementById('hero-style')) return;
  const st = document.createElement('style');
  st.id = 'hero-style';
  st.textContent = `
  .home.hd { padding-bottom: env(safe-area-inset-bottom); }
  .hd-scroll { flex: 1; min-height: 0; overflow-y: auto; overscroll-behavior: contain; scrollbar-width: none; padding: 4cqw 0 6cqw; }
  .hd-scroll::-webkit-scrollbar { display: none; }
  .hd-body { --k: 1; position: relative; height: calc(94.3cqw * var(--k)); }
  .hd-body > * { position: absolute; box-sizing: border-box; }
  .hd-back, .hd-up { white-space: nowrap; border-radius: 2cqw !important; font: 4.6cqw 'Pattaya', serif !important; display: flex; align-items: center; justify-content: center; gap: 1cqw; box-shadow: 0 .6cqw 1cqw #0008; }
  .hd-back { background: linear-gradient(#3f8a4a, #1d5426) !important; border: .5cqw solid #c9a24a !important; color: #f3e7c9 !important; }
  .hd-up { background: linear-gradient(#f2c25a, #b57a1e) !important; border: .5cqw solid #ffe39a !important; color: #3a1e05 !important; }
  .hd-up img { width: 6.5cqw; height: 6.5cqw; flex: none; }
  .hd-up b, .hd-back { text-shadow: none !important; }
  .hd-lv { display: flex; align-items: center; justify-content: center; gap: 2cqw; }
  .hd-lv b { white-space: nowrap; font-size: 4.2cqw; font-weight: 800; color: #fff4d0; }
  .hd-stars { display: flex; gap: .6cqw; }
  .hd-stars i { width: 4cqw; height: 4cqw; background: #3a3020; clip-path: polygon(50% 0, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%); }
  .hd-stars i.on { background: #ffd43b; }
  .hd-name { display: flex; align-items: center; gap: 2cqw; padding: 0 3cqw 0 1cqw; border-radius: 4cqw; background: linear-gradient(#3a2a1a, #1e140a); border: .4cqw solid #c9a24a; }
  .hd-name b { flex: 1; text-align: center; font-size: 3.4cqw; letter-spacing: -.1cqw; font-weight: 800; color: #fff4d0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .hd-hanh { flex: none; width: 5.2cqw; height: 5.2cqw; border-radius: 50%; display: grid; place-items: center; font: normal 800 1.7cqw/1 sans-serif; color: #fff; background: radial-gradient(circle at 35% 30%, #fff8, var(--hc) 60%); border: .3cqw solid #fff9; text-shadow: 0 0 .4cqw #000; }
  .hd-tu { white-space: nowrap; display: flex; align-items: center; justify-content: center; font-size: 4cqw; font-weight: 800; color: #fff4d0; }
  .hd-role { display: flex; align-items: center; justify-content: center; gap: 1.2cqw; }
  .hd-role img { width: 5.4cqw; height: 5.4cqw; border-radius: .8cqw; }
  .hd-role b { font-size: 3.8cqw; font-weight: 800; white-space: nowrap; }
  .hd-bao, .hd-eq { border-radius: 1.4cqw !important; background: linear-gradient(#4a3c2c, #2a2018) !important; border: .5cqw solid #9a7a4a !important; box-shadow: inset 0 0 2cqw #0009, 0 .4cqw .8cqw #0008; display: flex; flex-direction: column; align-items: center; justify-content: center; }
  .hd-bao b { font-size: 3.4cqw; font-weight: 800; color: #e8d8b0; }
  .hd-bao small { margin-top: .6cqw; font-size: 2.8cqw; color: #d8b070; }
  .hd-bao.lock { filter: grayscale(.7) brightness(.7); }
  .hd-eqi { width: 7.5cqw; height: 7.5cqw; opacity: .35; filter: grayscale(.4); }
  .hd-eqi svg, .hd-eqi .ic { width: 100%; height: 100%; }
  .hd-eq b { margin-top: -.6cqw; font-size: 2.6cqw; font-weight: 700; color: #e8d8b0; }
  .hd-art { border-radius: 1.6cqw; overflow: hidden; border: .6cqw solid #c9a24a; background: radial-gradient(ellipse at 50% 60%, #ffffff22, #0006 70%), linear-gradient(#2a3a30aa, #101a14cc); box-shadow: 0 .6cqw 1.6cqw #000a; }
  .hd-art img { position: absolute; left: 0; top: 0; width: 100%; height: 100%; object-fit: cover; object-position: 50% 100%; transform: scaleX(-1) scale(1.12); transform-origin: 50% 96%; }
  .hd-art img.art { object-fit: cover; object-position: 50% 40%; transform: none; }
  .hd-ava img.art { object-position: 50% 18%; transform: scale(1.6); transform-origin: 50% 20%; }
  .hd-power { display: flex; align-items: center; justify-content: center; gap: 1.6cqw; border-radius: 1.4cqw; background: linear-gradient(#3a2a1a, #1e140a); border: .4cqw solid #c9a24a; }
  .hd-power span { font-size: 4cqw; font-weight: 800; color: #fff4d0; }
  .hd-power b { font-size: 4.6cqw; font-weight: 800; color: #ffd43b; }
  .hd-linh { border-radius: 50% !important; background: radial-gradient(circle at 40% 35%, #8a5a2a, #3a2210) !important; border: .6cqw solid #d8b25a !important; font: 4.6cqw 'Pattaya', serif !important; color: #ffe39a !important; box-shadow: 0 .6cqw 1cqw #0008; }
  .hd-bar { box-sizing: border-box; margin: 1.6cqw 6.7cqw 0; border-radius: 1.4cqw; background: linear-gradient(#3a2a1acc, #1e140acc); border: .4cqw solid #9a7a4a; display: flex; align-items: center; }
  .hd-stats { min-height: 6.9cqw; justify-content: space-around; padding: .6cqw 1cqw; }
  .hd-stats span { display: flex; flex-direction: column; align-items: center; }
  .hd-stats small { font-size: 2.5cqw; color: #c8b890; }
  .hd-stats b { font-size: 3.4cqw; font-weight: 800; color: #fff4d0; }
  .hd-skill { min-height: 9cqw; gap: 1.6cqw; padding: 1cqw 2cqw; }
  .hd-grade { flex: none; font: italic 900 6cqw/1 serif; color: #ffcf3a; text-shadow: 0 .3cqw 0 #7a3a00, 0 0 1cqw #000; }
  .hd-skill b { flex: none; white-space: nowrap; font-size: 3.3cqw; font-weight: 800; color: #ffd76a; padding-right: 2cqw; border-right: .3cqw solid #9a7a4a; }
  .hd-skill span, .hd-duyen span { flex: 1; font-size: 3.1cqw; color: #f3e7c9; line-height: 1.3; }
  .hd-duyen { min-height: 7.4cqw; gap: 2cqw; padding: .8cqw 2.4cqw; }
  .hd-duyen b { flex: none; width: 27cqw; font-size: 3.6cqw; font-weight: 800; color: #fff4d0; padding-right: 2cqw; border-right: .3cqw solid #9a7a4a; }
  .hd-duyen em { flex: none; font-style: normal; font-size: 3.8cqw; font-weight: 800; color: #9a8a6a; }
  .hd-duyen em.ok { color: #ffcf3a; }
  .hd-avas { display: flex; flex-wrap: wrap; gap: 1cqw .6cqw; margin: 1.2cqw 5cqw .6cqw; }
  .hd-ava { width: 12.5cqw; height: 12.5cqw; border-radius: 1.2cqw !important; overflow: hidden; background: #2a2018 !important; border: .5cqw solid #9a7a4a !important; }
  .hd-ava.off { filter: grayscale(1) brightness(.6); }
  .hd-avi { flex: none; width: 15.5cqw; display: flex; flex-direction: column; align-items: center; gap: .6cqw; }
  .hd-avi small { width: 100%; font-size: 2.4cqw; font-weight: 700; line-height: 1.2; color: #8f8; text-align: center; text-shadow: 0 .2cqw .3cqw #000; overflow-wrap: anywhere; }
  .hd-avi small.off { color: #b8a888; }
  .hd-ava.none { display: flex; align-items: center; justify-content: center; }
  .hd-ava.none i { font-style: normal; font-size: 2.3cqw; color: #c9b48a; text-align: center; }
  .hd-ava img { width: 100%; height: 100%; object-fit: cover; object-position: 50% 12%; transform: scaleX(-1) scale(1.4); transform-origin: 50% 20%; }
  `;
  document.head.appendChild(st);
}
// Hành Tẩu: vào bản đồ (về Thanh Vân nếu đang ở nơi không còn đi được)
function homeGo() { if (!LOCATIONS[P.loc]) P.loc = START_LOC; renderWorld(); }
function homeTeam() { toast('Hệ hiệp khách đang được xây dựng: đội trên là đội mẫu'); }
// Thử Thách: Trấn Ma Tháp, Thí Luyện, ba Cấm địa
function homeChallenge() {
  const cds = typeof CAM_DIA !== 'undefined' ? Object.keys(CAM_DIA).map(k => {
    const C = CAM_DIA[k], ok = typeof cdOpen === 'function' ? cdOpen(k) : P.lv >= C.minLv;
    return `<button class="hm-li ${ok ? '' : 'off'}" onclick="${ok ? `G.camDia('${k}')` : ''}">[[tu_vong]]<span><b>${C.name}</b><small>${ok ? '6 ải · 5 độ khó' : 'Cần đạt cấp ' + C.minLv}</small></span></button>`;
  }).join('') : '';
  openModal(`<h3>Thử Thách</h3><div class="hm-list">
    <button class="hm-li" onclick="G.thap()">[[thap]]<span><b>Trấn Ma Tháp</b><small>100 tầng · kỷ lục tầng ${(P.thap && P.thap.best) || 0}</small></span></button>
    <button class="hm-li" onclick="G.thiLuyen()">${homePng('thi_luyen')}<span><b>Thí Luyện</b><small>Tàng Bảo Khố · Ngộ Đạo Đài</small></span></button>
    ${cds}</div>`);
}
// Hằng ngày: gom các việc mỗi ngày
function homeDaily() {
  openModal(`<h3>Hằng Ngày</h3><div class="hm-list">
    <button class="hm-li" onclick="G.thiLuyen()">${homePng('thi_luyen')}<span><b>Thí Luyện</b><small>Mỗi ải 3 lượt mỗi ngày</small></span></button>
    <button class="hm-li" onclick="G.beQuan()">[[ruong]]<span><b>Bế Quan</b><small>Nhận thưởng thời gian vắng mặt</small></span></button>
    <button class="hm-li" onclick="G.menuQuests()">${homePng('nhiem_vu')}<span><b>Nhiệm vụ đang làm</b><small>Sư môn, Truy Nã, khảo hạch</small></span></button>
  </div>`);
}
// Cửa tiệm: các tiệm ở Thanh Vân Môn
function homeShops() {
  const ids = (LOCATIONS[START_LOC].shops || []).filter(id => SHOPS[id] && !SHOPS[id].forge);
  openModal(`<h3>Cửa Tiệm</h3><div class="hm-list">${ids.map(id => `<button class="hm-li" onclick="G.openShop('${id}')">[[${SHOPS[id].icon}]]<span><b>${SHOPS[id].name}</b></span></button>`).join('')}</div>`);
}

// Kích thước theo bản bố cục người dùng gửi (khung 1116 × 2000): 1 điểm ảnh mẫu = 0,0896 phần trăm bề ngang (cqw)
function homeStyle() {
  if (document.getElementById('home-style')) return;
  const st = document.createElement('style');
  st.id = 'home-style';
  st.textContent = `
  html:has(.home), body:has(.home) { overflow: hidden; overscroll-behavior: none; height: 100%; }
  .home { box-sizing: border-box; container-type: inline-size; position: fixed; inset: 0; margin: 0 auto; overscroll-behavior: none; display: flex; flex-direction: column; color: #f3e7c9; overflow: hidden;
    padding: env(safe-area-inset-top) 0 calc(24.5cqw + env(safe-area-inset-bottom)); }
  .hm-bg { position: fixed; inset: 0; z-index: -1; background: linear-gradient(rgba(8,16,12,.35), rgba(8,16,12,.05) 40%, rgba(8,16,12,.15) 70%, rgba(8,16,12,.45)), url(game/img/nen_trang_chu.jpg) center / cover; }
  .home button { font: inherit; color: inherit; cursor: pointer; background: none; border: 0; padding: 0; }
  .hm-ic img, .hm-disc img { width: 100%; height: 100%; object-fit: contain; display: block; }
  .hm-ic .ic, .hm-ic svg { width: 100%; height: 100%; }
  .home b, .home small, .home span { text-shadow: 0 .2cqw 0 #000, 0 0 .5cqw #000; }
  /* băng trên: 130 */
  .hm-top { height: 11.6cqw; display: grid; grid-template-columns: 1fr 37.6cqw 1fr; align-items: center; background: linear-gradient(#2f5a3a, #183222); border-bottom: .5cqw solid #c9a24a; font-size: 3.9cqw; font-weight: 700; color: #f0d48a; }
  .hm-tl { padding-left: 2cqw; white-space: nowrap; } .hm-tr { padding-right: 2cqw; text-align: right; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .hm-plaque { height: 100%; display: grid; place-items: center; background: radial-gradient(ellipse at 50% 40%, #2a5a3a, #133020 70%) !important; border: .6cqw solid #c9a24a !important; border-top: 0 !important; border-radius: 0 0 6cqw 6cqw !important; }
  .hm-plaque b { font: 4.8cqw 'Pattaya', serif; color: #f0d48a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 34cqw; }
  /* kinh nghiệm: 160 → 245 */
  .hm-xp { margin-top: 2.6cqw; padding: 0 2.2cqw; text-align: center; }
  .hm-xp small { font-size: 3.4cqw; font-weight: 700; }
  .hm-exp { height: 3.1cqw; margin-top: .6cqw; border-radius: 2cqw; background: #0a1a0c; border: .4cqw solid #8aa04a; overflow: hidden; }
  .hm-exp i { display: block; height: 100%; background: linear-gradient(#a6e26a, #4c9a2a); }
  /* tài nguyên: 255 → 440 */
  .hm-res { margin-top: 2cqw; height: 19cqw; display: grid; grid-template-columns: 1fr 27cqw 1fr; align-items: center; padding: 0 1.5cqw; }
  .hm-col { display: grid; gap: .8cqw; } .hm-col.right { justify-items: end; }
  /* khung tài nguyên: ảnh Gemini 3:1 (vòng icon chiếm cả chiều cao), số nằm trong ô nâu */
  .hm-pill { display: flex; align-items: center; width: 27cqw; aspect-ratio: 480 / 162; background: center / 100% 100% no-repeat; filter: drop-shadow(0 .4cqw .5cqw #0009); }
  .hm-pill b { flex: 1; min-width: 0; text-align: center; font-size: 3.2cqw; font-weight: 800; color: #fff4d0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .hm-pill.l { padding: 0 10% 0 30%; } .hm-pill.r { padding: 0 29% 0 11%; } .hm-pill { box-sizing: border-box; }
  .hm-power { display: flex; flex-direction: column; align-items: center; }
  .hm-power small { font-size: 3.3cqw; font-weight: 700; }
  .hm-arc { width: 26cqw; height: 4.2cqw; margin-top: .3cqw; display: grid; place-items: center; font-size: 2.8cqw; font-weight: 700; border-radius: 0 0 13cqw 13cqw / 0 0 4.2cqw 4.2cqw; background: linear-gradient(#6fbf4a, #2f6a22); border: .4cqw solid #c9e08a; }
  .hm-power b { margin-top: 1.4cqw; font: 6.3cqw/1.1 'Pattaya', serif; color: #ffd76a; text-shadow: 0 .3cqw 0 #6a2a00, 0 0 2.5cqw #ff3a1a, 0 0 1cqw #ff6a1a; }
  /* thẻ nhân vật: 460 → 945, mỗi thẻ 212 × 485 */
  .hm-team { margin-top: 1.4cqw; display: grid; grid-template-columns: repeat(5, 1fr); gap: 1.1cqw; padding: 0 .4cqw; }
  .hm-card { position: relative; height: max(43.5cqw, calc(43.5cqw + (100dvh - 179.2cqw) * .4)); border-radius: 1cqw; overflow: hidden; border: .6cqw solid var(--qc) !important; background: linear-gradient(var(--qg), color-mix(in srgb, var(--qg) 55%, #000)) !important; box-shadow: inset 0 0 2cqw #0008; }
  .hm-card img { position: absolute; left: 0; top: 0; width: 100%; height: calc(100% - 5.8cqw); object-fit: cover; object-position: 50% 15%; transform: scaleX(-1); }
  .hm-card img.art { transform: none; object-position: 50% 22%; }
  .hm-card.empty { display: grid; place-items: center; border: .5cqw dashed #c9a24a88 !important; background: #0005 !important; box-shadow: none; }
  .hm-card.empty i { font: normal 10cqw/1 sans-serif; color: #c9a24aaa; }
  .hm-card.q-thuong { --qc: #4fbf5a; --qg: #1f6a2a; } .hm-card.q-hiem { --qc: #4f8aff; --qg: #1e3a8a; }
  .hm-card.q-tuyet { --qc: #b77bff; --qg: #4b2a8a; } .hm-card.q-truyen { --qc: #ffbf3a; --qg: #8a5a10; }
  .hm-band { position: absolute; left: 0; right: 0; bottom: 0; height: 5.8cqw; display: flex; align-items: center; justify-content: space-between; padding: 0 1.2cqw 0 .6cqw; background: color-mix(in srgb, var(--qc) 55%, #000); }
  .hm-lv { width: 4.6cqw; height: 4.6cqw; border-radius: 50%; display: grid; place-items: center; background: #0008; font-size: 3.2cqw; font-weight: 800; }
  .hm-star { display: flex; gap: .3cqw; }
  .hm-star i { width: 3cqw; height: 3cqw; background: #ffd43b; clip-path: polygon(50% 0, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%); }
  /* hàng nút nhanh: 960 → 1135, icon ~130 */
  .hm-quick { margin-top: 1.4cqw; padding: 0 3cqw; display: grid; grid-template-columns: repeat(4, 1fr); align-items: end; }
  .hm-q { display: flex; flex-direction: column; align-items: center; }
  .hm-q .hm-ic { width: 14cqw; height: 14cqw; filter: drop-shadow(0 .4cqw .6cqw #000a); }
  .hm-q b { position: relative; margin-top: .6cqw; font-size: 3.6cqw; font-weight: 700; color: #ffe39a; white-space: nowrap; }
  /* ba nút lớn: 1170 → 1440; rộng 195 / 245 / 215 */
  .hm-modes { margin: auto 0; display: grid; grid-template-columns: 1fr 1.2fr 1fr; align-items: end; justify-items: center; padding: 2cqw 6cqw; }
  .hm-mode { display: flex; flex-direction: column; align-items: center; }
  /* ba nút lớn: ảnh Gemini của người dùng mode_<mã>.png (PVE, Giang Hồ, Tỉ Võ; 2026-11-12), không còn đĩa tròn */
  .hm-disc { display: block; filter: drop-shadow(0 .6cqw 1cqw #000a); }
  .hm-mode.l .hm-disc { width: 22cqw; height: 22cqw; }
  .hm-mode.c .hm-disc { width: 28cqw; height: 28cqw; animation: hmGlow 2.4s ease-in-out infinite alternate; }
  .hm-mode.r .hm-disc { width: 23cqw; height: 23cqw; }
  .hm-mode b { position: relative; margin-top: -3.5cqw; font: 5cqw 'Pattaya', serif; white-space: nowrap; color: #ffe39a; text-shadow: 0 .4cqw 0 #5a2a00, 0 0 1cqw #000, 0 0 .5cqw #000; }
  .hm-mode.c b { font-size: 5.6cqw; }
  .hm-mode:active .hm-disc { transform: scale(.95); }
  @keyframes hmGlow { from { filter: drop-shadow(0 .6cqw 1cqw #000a) brightness(1); } to { filter: drop-shadow(0 0 2.5cqw #ffb84acc) brightness(1.08); } }
  @media (prefers-reduced-motion: reduce) { .hm-mode.c .hm-disc { animation: none; } }
  /* dải chức năng: 1480 → 1645, icon ~120, quầng sáng sau mỗi icon; mũi tên bên phải */
  .hm-funcs { position: relative; height: 14.8cqw; background: linear-gradient(#ffffff2a, #ffffff14); border-top: .3cqw solid #ffffff33; border-bottom: .3cqw solid #ffffff22; }
  .hm-fscroll { height: 100%; display: flex; justify-content: center; overflow-x: auto; scrollbar-width: none; padding: 0 3cqw; scroll-snap-type: x mandatory; }
  .hm-fscroll::-webkit-scrollbar { display: none; }
  .hm-f { flex: 0 0 17.6cqw; scroll-snap-align: start; position: relative; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; padding-bottom: .8cqw !important; }
  .hm-f::before { content: ""; position: absolute; top: 0; left: 50%; width: 15cqw; height: 100%; transform: translateX(-50%); background: linear-gradient(#ffe7a033, #ffe7a000); clip-path: polygon(30% 0, 70% 0, 100% 100%, 0 100%); }
  .hm-f .hm-ic { position: relative; width: 10.8cqw; height: 10.8cqw; filter: drop-shadow(0 .4cqw .6cqw #000a); }
  .hm-f b { position: relative; margin-top: -.8cqw; font-size: 3.2cqw; font-weight: 700; color: #fff; white-space: nowrap; }
  .hm-more { position: absolute; right: 0; top: 0; bottom: 0; width: 7cqw; font-size: 8cqw !important; line-height: 1; color: #d8d0b0 !important; background: linear-gradient(90deg, #0000, #0008) !important; }
  /* dải tối mỏng: 1650 → 1700 (dòng nhật ký mới nhất) */
  .hm-ticker { height: 4.2cqw; margin: .5cqw .4cqw 0; border-radius: 2cqw; padding: 0 3cqw; display: flex; align-items: center; background: linear-gradient(#0f2a14cc, #08180ccc); font-size: 2.8cqw; color: #c9e0b0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  /* thanh dưới: 6 vòng tròn đường kính 165 */
  .hm-nav { position: fixed; bottom: 0; left: 50%; transform: translateX(-50%); width: 100cqw; z-index: 20; box-sizing: border-box; display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); padding: 2.6cqw 2cqw calc(3.5cqw + env(safe-area-inset-bottom)); background: linear-gradient(#1c3a22, #0c1a10); }
  .hm-nav button { display: flex; flex-direction: column; align-items: center; min-width: 0; }
  .hm-nav .hm-ic { width: 18.5cqw; height: 17cqw; filter: drop-shadow(0 .4cqw .6cqw #000a); }
  .hm-nav button.on .hm-ic { filter: drop-shadow(0 0 1.6cqw #ffcf6a) brightness(1.1); }
  .hm-nav b { position: relative; margin-top: -2.6cqw; font-size: 3.1cqw; font-weight: 800; color: #ffe39a; white-space: nowrap; text-transform: uppercase; margin-left: -4cqw; margin-right: -4cqw; transform: scaleX(.84); text-shadow: 0 0 .5cqw #000, 0 .3cqw 0 #3a1e05, 0 0 1cqw #000 !important; }
  /* danh sách trong hộp thoại */
  .hm-list { display: grid; gap: 8px; }
  .hm-li { display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 12px; border: 1px solid var(--line); background: rgba(255,255,255,.04); color: inherit; font: inherit; text-align: left; cursor: pointer; }
  .hm-li > img, .hm-li > .ic, .hm-li > svg { width: 40px; height: 40px; flex: none; }
  .hm-li span { display: flex; flex-direction: column; } .hm-li small { color: var(--muted); font-size: 12px; }
  .hm-li.off { opacity: .5; cursor: default; }
  @media (min-width: 600px) { .home { max-width: 480px; margin: 0 auto; } }
  `;
  document.head.appendChild(st);
}

const TRANG_CHU_G = { home: renderHome, homeGo, homeTeam, homeChallenge, homeDaily, homeShops, homeSoon, homeMore, heroView };
