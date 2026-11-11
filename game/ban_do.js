'use strict';
/* =================================================================
   HIỆP KHÁCH GIANG HỒ — BẢN ĐỒ THẾ GIỚI
   -----------------------------------------------------------------
   Một tấm dư đồ vẽ bằng SVG (sa mạc phía tây, Thiên Sơn phía tây bắc,
   biển Đông Hải góc đông nam, rừng Miêu Cương phía tây nam...), trên đó
   là mọi địa điểm trong LOCATIONS và đường nối giữa chúng.
     - Đang đứng: cắm cờ đỏ. Nơi chưa mở: mờ, có ổ khóa.
     - Dấu nhiệm vụ: [[moi]] có việc mới, [[tra]] trả nhiệm vụ, [[muc_tieu]] mục tiêu đang làm.
     - Bấm một nơi: xem thông tin, đường đi ngắn nhất, và đi thẳng tới đó.
   Thêm địa điểm mới: ghi tọa độ vào BAN_DO.pos (khung 1000×720);
   quên ghi thì địa điểm tự xếp ở hàng dưới cùng.
   Engine gọi qua G.banDo() (nút "Bản đồ" ở mục Đi đến).
   ================================================================= */
const BAN_DO = {
  w: 1000, h: 720,
  /* Lối chơi mới (2026-10-27): chỉ vẽ 5 thành + 20 map (the_gioi.js), mỗi thành một cụm 4 map quanh nó,
     các nơi cách nhau đủ xa để vòng tròn và tên không đè lên nhau. Địa điểm cũ của cốt truyện không vẽ (banDoShown). */
  pos: {
    // Trường An (tây bắc: Thiên Sơn, Tây Vực) — map cấp 81–100
    truong_an: [240, 235], bang_nguyen: [110, 105], thien_co_cac: [330, 100], bach_da_son: [90, 300], hoang_mac: [255, 345],
    // Lạc Dương (bắc: Hoa Sơn, Tuyết Sơn) — map cấp 21–40
    lac_duong: [560, 200], hoa_son: [470, 85], tuyet_son: [650, 85], tu_qua_nhai: [445, 290], van_truong_coc: [690, 225],
    // Dương Châu (đông: Giang Nam, Đông Hải) — map cấp 1–20
    duong_chau: [830, 330], rung_truc: [900, 200], phe_trach: [895, 425], hac_phong: [800, 495], linh_xa_dao: [905, 600],
    // Tương Dương (giữa: Trung Nguyên) — map cấp 41–60
    tuong_duong: [570, 470], hai_long_dong: [690, 395], rung_sau_coc: [455, 400], mat_dao: [470, 615], huyet_ma_dan: [665, 625],
    // Thành Đô (tây nam: Miêu Cương) — map cấp 61–80
    thanh_do: [240, 555], thap_van_son: [90, 455], vuc_vo_luong: [355, 505], van_doc_lam: [100, 640], ngu_doc_dong: [345, 650],
  },
  // Thành lớn: vẽ to hơn, đường nối giữa hai thành lớn là quan lộ (nét đậm)
  cities: ['duong_chau', 'lac_duong', 'tuong_duong', 'thanh_do', 'truong_an'],
};

/* ---------------- Nền dư đồ ---------------- */
const banDoArt = (() => {
  const mt = (x, y, s, f, snow) => `<path d="M${x - 22 * s} ${y} L${x - 6 * s} ${y - 22 * s} L${x + 2 * s} ${y - 12 * s} L${x + 10 * s} ${y - 26 * s} L${x + 26 * s} ${y} Z" fill="${f}" stroke="#7a6a58" stroke-width="1.4" stroke-linejoin="round"/>`
    + (snow ? `<path d="M${x - 6 * s} ${y - 22 * s} L${x - 11 * s} ${y - 14 * s} L${x - 5 * s} ${y - 16 * s} L${x - 1 * s} ${y - 15 * s} Z M${x + 10 * s} ${y - 26 * s} L${x + 5 * s} ${y - 17 * s} L${x + 10 * s} ${y - 19 * s} L${x + 15 * s} ${y - 17 * s} Z" fill="#fff"/>` : '');
  const tree = (x, y, s) => `<path d="M${x} ${y - 16 * s} L${x - 8 * s} ${y} H${x + 8 * s} Z" fill="#7fa060" stroke="#5a7a44" stroke-width="1"/><path d="M${x - 1.2 * s} ${y} V${y + 4 * s} H${x + 1.2 * s} V${y} Z" fill="#7a5a3a"/>`;
  const dune = (x, y) => `<path d="M${x - 24} ${y} Q${x - 8} ${y - 10} ${x + 4} ${y} Q${x + 14} ${y - 7} ${x + 24} ${y}" fill="none" stroke="#c8a464" stroke-width="1.6"/>`;
  const wave = (x, y) => `<path d="M${x - 14} ${y} Q${x - 7} ${y - 5} ${x} ${y} Q${x + 7} ${y - 5} ${x + 14} ${y}" fill="none" stroke="#7fb0d0" stroke-width="1.6"/>`;
  const label = (x, y, t, size = 22) => `<text x="${x}" y="${y}" text-anchor="middle" class="bd-region" style="font-size:${size}px">${t}</text>`;
  let s = '';
  s += `<rect x="0" y="0" width="1000" height="720" fill="#efe0bf"/>`;
  // vùng
  s += `<path d="M0 230 Q90 250 160 240 Q250 230 330 262 Q350 300 330 350 Q250 390 160 380 Q70 372 0 390 Z" fill="#ecd59e" opacity="0.9"/>`;
  s += `<path d="M0 0 H380 Q390 90 350 200 Q250 225 150 210 Q60 200 0 220 Z" fill="#f4f6f4" opacity="0.95"/>`;
  s += `<path d="M0 500 Q90 470 200 500 Q300 520 370 600 Q380 680 330 720 H0 Z" fill="#c9dcae" opacity="0.9"/>`;
  s += `<path d="M1000 470 Q940 505 895 565 Q860 600 790 612 Q720 640 690 720 H1000 Z" fill="#bcd8ea"/>`;
  s += `<path d="M1000 470 Q940 505 895 565 Q860 600 790 612 Q720 640 690 720" fill="none" stroke="#8ab4cf" stroke-width="3"/>`;
  // sông: Hoàng Hà ở bắc, Trường Giang ở nam
  s += `<path d="M340 270 Q420 290 520 262 Q620 232 680 268 Q760 300 830 255 Q880 225 1000 250" fill="none" stroke="#8ab4cf" stroke-width="5" stroke-linecap="round" opacity="0.8"/>`;
  s += `<path d="M250 500 Q360 420 460 410 Q560 402 640 440 Q720 478 790 470 Q860 462 900 500" fill="none" stroke="#8ab4cf" stroke-width="6" stroke-linecap="round" opacity="0.8"/>`;
  // núi, rừng, cồn cát, sóng
  [[40, 160, 0.9], [130, 60, 1], [240, 90, 0.9], [340, 60, 0.8]].forEach(([x, y, k]) => { s += mt(x, y, k, '#dfe6ea', true); });
  [[370, 150, 1], [480, 100, 1.1], [560, 140, 0.9], [650, 90, 1], [760, 110, 1.1], [880, 150, 0.8]].forEach(([x, y, k]) => { s += mt(x, y, k, '#cfc4b0', y < 120); });
  [[560, 610, 0.9], [420, 560, 0.8], [430, 690, 0.8]].forEach(([x, y, k]) => { s += mt(x, y, k, '#c9b89a', false); });
  [[40, 560], [110, 520], [250, 640], [140, 700], [40, 620], [350, 660], [250, 520]].forEach(([x, y]) => { s += tree(x, y, 1); });
  [[120, 280], [240, 360], [60, 360], [220, 280]].forEach(([x, y]) => { s += dune(x, y); });
  [[930, 600], [820, 690], [990, 560], [760, 690], [880, 560]].forEach(([x, y]) => { s += wave(x, y); });
  // tên vùng
  s += label(110, 395, 'Tây Vực') + label(215, 40, 'Thiên Sơn') + label(470, 525, 'Trung Nguyên', 22) + label(225, 645, 'Miêu Cương')
    + label(950, 695, 'Đông Hải', 18) + label(930, 300, 'Giang Nam', 18) + label(560, 35, 'Hoa Sơn', 18) + label(790, 60, 'Tuyết Sơn', 18);
  // la bàn
  s += `<g transform="translate(955 60)" opacity="0.75"><circle r="22" fill="#f6eddb" stroke="#7a6a58" stroke-width="1.5"/><path d="M0 -20 L5 0 L0 20 L-5 0 Z" fill="#b3362b"/><path d="M-20 0 L0 -5 L20 0 L0 5 Z" fill="#7a6a58"/><text y="-25" text-anchor="middle" class="bd-small">Bắc</text></g>`;
  // khung
  s += `<rect x="6" y="6" width="988" height="708" fill="none" stroke="#8a6a3a" stroke-width="3" rx="10"/><rect x="13" y="13" width="974" height="694" fill="none" stroke="#b8975a" stroke-width="1.2" rx="7"/>`;
  return s;
})();

/* ---------------- Dữ liệu từng nơi ---------------- */
// Đường ngắn nhất (chỉ đi qua nơi đã mở)
function banDoRoute(to) {
  const prev = { [P.loc]: null }, queue = [P.loc];
  while (queue.length) {
    const cur = queue.shift();
    if (cur === to) break;
    for (const nx of LOCATIONS[cur].links) {
      if (nx in prev || !LOCATIONS[nx] || !canEnter(nx)) continue;
      prev[nx] = cur;
      queue.push(nx);
    }
  }
  if (!(to in prev)) return null;
  const path = [];
  for (let c = to; c; c = prev[c]) path.unshift(c);
  return path;
}

// Nút Bản đồ: bản đồ thiên hạ bằng tranh (THIEN_HA, cuối file)
function banDoOpen() {
  if (!P || (typeof combat !== 'undefined' && combat && !combat.over)) return;
  thOpen();
}
function banDoClose() {
  const box = document.getElementById('bando');
  if (box) box.remove();
}
// Đi theo đường ngắn nhất tới nơi đã chọn (đi đường không tốn gì, chỉ đỡ phải bấm từng chặng)
function banDoGo(id) {
  const r = banDoRoute(id);
  if (!r) return;
  if (!canLeave()) { banDoClose(); return toast('[[khoa]] ' + LOCATIONS[P.loc].leaveText); }
  for (const k of r.slice(1, -1)) if (LOCATIONS[k].leaveFlag && !P.flags[LOCATIONS[k].leaveFlag]) return toast('[[khoa]] ' + LOCATIONS[k].leaveText);
  banDoClose();
  if (r.length > 2) log(`[[la_ban]] Ngươi lên đường, đi qua ${r.slice(1, -1).map(k => locView(k).name).join(', ')}.`);
  r.slice(1, -1).forEach(k => { const L = locView(k); if (L.type === 'town' && L.inn != null) P.lastTown = k; });
  travel(id);
}
const BAN_DO_G = { banDo: banDoOpen, banDoClose, banDoGo, vungPick, vungClose, vungGo, vungLog, vungPath, vungShops, thPick, thUnpick };

/* =================================================================
   BẢN ĐỒ VÙNG (người dùng chốt 2026-11-04 theo ảnh mẫu): đứng ở thành của một vùng có tranh thì màn chính là tranh bản đồ vùng,
   thành ở giữa, các nơi luyện cấp xung quanh. Huy hiệu tròn vàng + bảng tên do game vẽ đè lên tranh (bấm được, có khóa, dấu nhiệm vụ).
   Bấm thành: thẻ có sẵn mọi nút dịch vụ (locActs trong engine). Bấm nơi luyện cấp: thẻ thông tin + Đi đến (travel → màn nơi luyện cấp).
   Ưu tiên điện thoại: màn dọc dùng tranh dọc, màn ngang dùng tranh ngang; tranh luôn hiện trọn, chỗ thừa phủ chính tranh làm mờ.
   Tranh do người dùng tạo bằng Gemini (gốc luu_tru/thanh_van/ban_do_*.png, xử lý bằng tools/xu_ly_tranh.ps1).
   pins: tọa độ huy hiệu theo % tranh [ngang, dọc] cho từng bản; mark = hình trong huy hiệu (VUNG_MARK).
   ================================================================= */
const VUNG = {
  duong_chau: {
    name: 'Thanh Vân Môn', sub: 'Núi Thiên Tuyệt',
    doc: { src: 'game/img/ban_do/tv_doc.jpg', w: 1072, h: 1920 },
    pins: {
      duong_chau: { mark: 'mon', doc: [50, 43], ngang: [50, 41] },
      hac_phong: { mark: 'lac_ha', doc: [24, 24], ngang: [21, 25] },
      linh_xa_dao: { mark: 'thong_thien', doc: [79, 21], ngang: [76, 23] },
      rung_truc: { mark: 'tieu_truc', doc: [23, 72], ngang: [20, 70] },
      phe_trach: { mark: 'dai_truc', doc: [73, 73], ngang: [80, 72] },
    },
    // Tranh cảnh từng nơi luyện cấp (game/img/canh/<tên>_doc.jpg, _ngang.jpg): màn nơi luyện cấp + nền sân đấu (bản ngang)
    canh: { rung_truc: 'tieu_truc', phe_trach: 'dai_truc', hac_phong: 'lac_ha', linh_xa_dao: 'thong_thien' },
  },
  // Sa Mạc Man Hoang (người dùng chốt 2026-11-06): giữa vùng là sào huyệt Trường Sinh Đường (hub: không tiệm, không nghỉ;
  // cách đánh diệt "bàn sau"). Tranh Gemini gốc luu_tru/man_hoang/ban_do_{doc,ngang}.png (bản dọc giữa tranh còn là ốc đảo).
  // Tranh cảnh 4 nơi mới có bản dọc (canhDoc: màn ngang dùng tạm bản dọc).
  lac_duong: {
    name: 'Sa Mạc Man Hoang', sub: 'Sào huyệt Trường Sinh Đường',
    // 2026-11-08: bản dọc làm lại theo bản ngang (giữa là sào huyệt Trường Sinh Đường, gốc luu_tru/man_hoang/ban_do_doc_2.png)
    doc: { src: 'game/img/ban_do/mh_doc.jpg', w: 1072, h: 1920 },
    canh: { van_truong_coc: 'hoang_sa', tuyet_son: 'luu_sa', tu_qua_nhai: 'lau_lan', hoa_son: 'huyet_tri' },
    canhDoc: true,
    hub: { name: 'Trường Sinh Đường', tag: 'Sào huyệt tà phái',
      desc: 'Sào huyệt của Trường Sinh Đường là tòa thành đá đỏ giữa sa mạc, trong sân là ao máu bốc hơi nghi ngút. Chúng bắt người về hút máu luyện công, mong được trường sinh bất lão. Tường cao, canh gác ngày đêm, kẻ lạ tới gần không ai trở ra.',
      lock: 'Chưa thể tấn công. Hãy luyện thành tài ở bốn nơi quanh đây trước đã.' },
    pins: {
      lac_duong: { mark: 'truong_sinh', doc: [54, 61], ngang: [54, 64] },
      tu_qua_nhai: { mark: 'lau_lan', doc: [25, 30], ngang: [22, 42] },
      hoa_son: { mark: 'huyet_tri', doc: [76, 35], ngang: [79, 50] },
      van_truong_coc: { mark: 'cat', doc: [24, 74], ngang: [25, 70] },
      tuyet_son: { mark: 'luu_sa', doc: [73, 77], ngang: [64, 73] },
    },
  },
  // Đầm Lầy Hiệp Xuyên (2026-11-08, tranh Gemini của người dùng theo luu_tru/hiep_xuyen/cau_lenh.md)
  tuong_duong: {
    name: 'Đầm Lầy Hiệp Xuyên', sub: 'Sào huyệt Vạn Độc Môn',
    doc: { src: 'game/img/ban_do/hx_doc.jpg', w: 1072, h: 1920 },
    canh: { hai_long_dong: 'chuong_khi', rung_sau_coc: 'hac_thuy', mat_dao: 'van_doc_trai', huyet_ma_dan: 'doc_long' },
    canhDoc: true, // mới có tranh cảnh bản dọc
    hub: { name: 'Vạn Độc Môn', tag: 'Sào huyệt tà phái',
      desc: 'Tổng đàn Vạn Độc Môn dựng trên hàng trăm cột gỗ giữa đầm nước đen. Trong sân là ao độc xanh sôi sục, khói độc bốc lên ngày đêm. Chúng nuôi độc vật trong vò sành, luyện cổ trùng bằng người sống, kẻ lạc vào đầm không ai toàn thây trở ra.',
      lock: 'Chưa thể tấn công. Hãy luyện thành tài ở bốn nơi quanh đây trước đã.' },
    pins: {
      tuong_duong: { mark: 'van_doc', doc: [55, 60], ngang: [52, 69] },
      mat_dao: { mark: 'doc_trai', doc: [30, 31], ngang: [24, 40] },
      huyet_ma_dan: { mark: 'doc_long', doc: [74, 33], ngang: [80, 44] },
      hai_long_dong: { mark: 'chuong_khi', doc: [24, 74], ngang: [20, 72] },
      rung_sau_coc: { mark: 'hac_thuy', doc: [73, 77], ngang: [78, 71] },
    },
  },
  // Thung Lũng Tiêu Dao (2026-11-09, tranh Gemini của người dùng theo luu_tru/tieu_dao/cau_lenh.md; mới có bản dọc)
  thanh_do: {
    name: 'Thung Lũng Tiêu Dao', sub: 'Sào huyệt Hợp Hoan Phái',
    doc: { src: 'game/img/ban_do/td_doc.jpg', w: 1072, h: 1920 },
    canh: { vuc_vo_luong: 'dao_hoa', van_doc_lam: 'on_tuyen', ngu_doc_dong: 'tieu_dao_lau', thap_van_son: 'hop_hoan_dien' },
    canhDoc: true,
    hub: { name: 'Hợp Hoan Phái', tag: 'Sào huyệt tà phái',
      desc: 'Tổng đàn Hợp Hoan Phái là tòa cung điện son đỏ trên đảo giữa hồ, chỉ một cây cầu đá nối vào bờ. Rèm lụa hồng buông kín, hương mê bay khắp thung lũng. Kẻ lạc bước vào đây quên cả đường về, cam lòng làm con rối cho chúng sai khiến.',
      lock: 'Chưa thể tấn công. Hãy luyện thành tài ở bốn nơi quanh đây trước đã.' },
    pins: {
      thanh_do: { mark: 'hop_hoan', doc: [60, 46] },
      ngu_doc_dong: { mark: 'tieu_dao_lau', doc: [24, 37] },
      thap_van_son: { mark: 'hop_hoan_dien', doc: [80, 34] },
      vuc_vo_luong: { mark: 'hoa', doc: [22, 68] },
      van_doc_lam: { mark: 'on_tuyen', doc: [76, 77] },
    },
  },
};
// Hình mực trong huy hiệu vàng (khung 48×48, một màu mực)
const VUNG_MARK = {
  mon: '<path d="M4 21c8-1 14-5 20-12 6 7 12 11 20 12-2 2-5 2.5-8 2.5H12c-3 0-6-.5-8-2.5z"/><path d="M10 25h28v3H10z"/><path d="M13 28h3.5v12H13zM31.5 28H35v12h-3.5zM20.5 31h7v9h-7z"/><path d="M7 40h34v3.5H7z"/>',
  tieu_truc: '<path d="M13 9h3v33h-3zM22.5 14h3v28h-3zM32 7h3v35h-3z"/><path d="M16 18c5-4 9-4.5 12-3.5-4 2.5-8 3.5-12 3.5zM25.5 25c4-3 8-3.5 11-2.5-3.5 2-7 2.5-11 2.5zM35 15c3-3 6-4 8.5-3-3 2-5.5 3-8.5 3zM13 28c-4-2.5-7.5-3-10-2 3 2 6.5 2.5 10 2z"/>',
  dai_truc: '<path d="M14 4h6.5v40H14zM28 8h6.5v36H28z"/><path d="M14 15h6.5M14 27h6.5M28 19h6.5M28 31h6.5" stroke="#e7c46e" stroke-width="1.8"/><path d="M20.5 12c6-5 12-6 17-4-6 3.5-11 4-17 4zM34.5 23c4-3.5 8-4 11-3-4 2.5-7 3-11 3zM14 22c-5-3.5-9-4-12-3 4 2.5 8 3 12 3z"/>',
  lac_ha: '<circle cx="35" cy="12" r="6"/><path d="M2 43l8-21 5 6 7-17 7 15 5-6 12 23z"/>',
  // bản đồ thiên hạ (tạm, tới khi có hình công trình): cát, đầm lầy, hoa, hồ
  cat: '<circle cx="34" cy="13" r="6"/><path d="M2 41c7-9 15-12 23-8 7-6 14-7 21-3v14H2z"/>',
  dam: '<path d="M12 40V15h2.5v25zM22.5 40V9H25v31zM33 40V17h2.5v23z"/><rect x="10.5" y="9" width="5.5" height="9" rx="2.7"/><rect x="21" y="3" width="5.5" height="9" rx="2.7"/><rect x="31.5" y="11" width="5.5" height="9" rx="2.7"/><path d="M3 41c5-3 9-3 14 0s9 3 14 0 9-3 14 0v4H3z"/>',
  hoa: '<circle cx="24" cy="11" r="6.5"/><circle cx="34" cy="18.3" r="6.5"/><circle cx="30.2" cy="30" r="6.5"/><circle cx="17.8" cy="30" r="6.5"/><circle cx="14" cy="18.3" r="6.5"/><circle cx="24" cy="21.5" r="4.2" fill="#e9c873"/><path d="M23 33h2.2v12H23z"/>',
  ho: '<path d="M3 27l11-17 7 9 7-12 16 20z"/><path d="M3 34c4-3 8-3 12 0s8 3 12 0 8-3 12 0 5 1.5 6 2v4c-2 0-4-1-6-2.5-4-3-8-3-12 0s-8 3-12 0-8-3-12 0z"/><path d="M8 42c4-2.5 8-2.5 12 0s8 2.5 12 0 8-2.5 12 0" fill="none" stroke="#2a1f14" stroke-width="2.4"/>',
  // Sa Mạc Man Hoang
  truong_sinh: '<path d="M24 4c7 9 13 16 13 24a13 13 0 0 1-26 0c0-8 6-15 13-24z"/><path d="M19 30a5 5 0 0 0 5 5" fill="none" stroke="#e7c46e" stroke-width="2.2" stroke-linecap="round"/>',
  lau_lan: '<path d="M16 44V12h3V8h3v4h4V8h3v4h3v32z"/><path d="M4 44v-9l4-3 3 4 3-2v10zM34 44v-7l4-4 3 3 3-1v9z"/><path d="M22 20h4v6h-4z" fill="#e7c46e"/>',
  huyet_tri: '<path d="M6 21c6-1 12-4 18-10 6 6 12 9 18 10-2 2-5 2.5-8 2.5H14c-3 0-6-.5-8-2.5z"/><path d="M11 25h3v9h-3zM34 25h3v9h-3z"/><ellipse cx="24" cy="39" rx="17" ry="5"/><ellipse cx="24" cy="38.5" rx="11" ry="2.6" fill="#b3261e"/>',
  luu_sa: '<path d="M24 24m-3 0a3 3 0 1 0 6 0a7 7 0 1 0-14 0a11 11 0 1 0 22 0a15 15 0 1 0-30 0" fill="none" stroke="#2a1f14" stroke-width="3.2" stroke-linecap="round"/>',
  // Đầm Lầy Hiệp Xuyên: vò độc, nhà sàn, hang rồng, cây chết, đầm nước đen
  van_doc: '<path d="M17 8h14v4h-2v3c6 2 10 8 10 15 0 8-6 14-15 14S9 38 9 30c0-7 4-13 10-15v-3h-2z"/><path d="M18 31c3-4 9-4 12 0s-2 8-6 6" fill="none" stroke="#e7c46e" stroke-width="2.4" stroke-linecap="round"/>',
  doc_trai: '<path d="M5 20c7 0 13-4 19-12 6 8 12 12 19 12l-2 3H7z"/><path d="M10 23h28v9H10z"/><path d="M12 32h3v12h-3zM22.5 32h3v12h-3zM33 32h3v12h-3z"/><path d="M20 25h8v7h-8z" fill="#e7c46e"/>',
  doc_long: '<path d="M3 44c0-18 9-32 21-32s21 14 21 32z"/><path d="M13 44c0-10 5-18 11-18s11 8 11 18z" fill="#e7c46e"/><path d="M15 29l3 6 2-6zM28 29l2 6 3-6z"/>',
  chuong_khi: '<path d="M22 44V28l-8-8 2-2 6 6V12h4v10l7-7 2 2-9 9v18z"/><path d="M14 20l-5-3 1-2 5 3zM33 15l3-6 2 1-3 6z"/><path d="M4 43c6-2 34-2 40 0v3H4z"/>',
  hac_thuy: '<path d="M10 22h28l-4 7H14z"/><path d="M23 9v13h2V9zM25 10l8 9h-8z"/><path d="M3 35c4-3 8-3 12 0s8 3 12 0 8-3 12 0 5 1.5 6 2v4c-2 0-4-1-6-2.5-4-3-8-3-12 0s-8 3-12 0-8-3-12 0z"/>',
  // Thung Lũng Tiêu Dao: đèn lồng (Hợp Hoan), lầu nhiều tầng, điện có rèm, suối nước nóng bốc hơi
  hop_hoan: '<path d="M22 3h4v5h-4z"/><path d="M14 10h20c5 4 7 9 7 14s-2 10-7 14H14c-5-4-7-9-7-14s2-10 7-14z"/><path d="M15 17h18M13 24h22M15 31h18" stroke="#e7c46e" stroke-width="2"/><path d="M21 38h6v4l2 4h-10l2-4z"/>',
  tieu_dao_lau: '<path d="M12 12c4 0 8-2 12-8 4 6 8 8 12 8l-2 3H14z"/><path d="M16 15h16v6H16z"/><path d="M9 25c5 0 10-2 15-6 5 4 10 6 15 6l-2 3H11z"/><path d="M14 28h20v7H14z"/><path d="M5 39c6 0 13-2 19-6 6 4 13 6 19 6l-2 3H7z"/><path d="M21 30h6v5h-6z" fill="#e7c46e"/>',
  hop_hoan_dien: '<path d="M3 17c8 0 15-3 21-11 6 8 13 11 21 11l-2 4H5z"/><path d="M8 21h32v19H8z"/><path d="M13 21c0 8 4 13 11 13s11-5 11-13z" fill="#e7c46e"/><path d="M5 40h38v4H5z"/>',
  on_tuyen: '<path d="M14 8c-4 4 4 7 0 12M24 5c-4 4 4 7 0 12M34 8c-4 4 4 7 0 12" fill="none" stroke="#2a1f14" stroke-width="3" stroke-linecap="round"/><ellipse cx="24" cy="34" rx="20" ry="9"/><ellipse cx="24" cy="33" rx="13" ry="4.5" fill="#e7c46e"/>',
  trung_nguyen: '<path d="M3 12c7 0 14-2 21-6 7 4 14 6 21 6l-2 4H5z"/><path d="M8 17h32v4H8z"/><path d="M10 21h4v22h-4zM34 21h4v22h-4zM21 21h6v6h-6z"/><path d="M5 43h38v3H5z"/>',
  nui_lua: '<path d="M2 44l15-26h14l15 26z"/><path d="M19 18c-2-5 1-9 4-11 0 3 2 4 3 2 3 2 4 6 2 9z" fill="#b3261e" stroke="#2a1f14" stroke-width="1.6"/><path d="M22 18l-4 11 5-3 2 7 3-15" fill="#e9c873"/>',
  thong_thien: '<path d="M9 44L24 3l5 14 4-4 8 31z"/><path d="M3 31c2-3 6-3.5 8.5-1.5 2-3 7.5-3 9.5 0 3-1 5.5.5 5.5 3.5H4c-1.5 0-1.8-1-1-2z" fill="#f3dfa6" stroke="#2a1f14" stroke-width="1.6"/>',
};
// Icon menu vẽ tay (người dùng tạo bằng Gemini 2026-11-04, gốc luu_tru/icon.png, cắt nền trong suốt): game/img/icon/<tên>.png
// tên: nhan_vat, hanh_trang, vo_hoc, nhiem_vu, tu_dong, thien_ha, he_thong
// Nút Nhân vật dùng chân dung kiếm hiệp theo giới tính (người dùng chốt 2026-11-04, gốc luu_tru/icon_nhan_vat.png): nhan_vat_m / nhan_vat_f
// (nhan_vat.png ngọc bội cũ không dùng nữa)
const menuIc = n => {
  if (n === 'nhan_vat') n = typeof P !== 'undefined' && P && P.title === TITLES[1] ? 'nhan_vat_f' : 'nhan_vat_m';
  return `<img class="mi" src="game/img/icon/${n}.png" alt="" draggable="false">`;
};
let vungSel = null, vungSub = null; // vungSub 'shop' = thẻ Thanh Vân đang mở lưới Cửa Hàng
let vungPanX = null, vungPanFor = null; // chỗ đang vuốt ngang của tranh ngang trên màn dọc
function vungShops(on) {
  vungSub = on ? 'shop' : null;
  if (vungSel) vungPick(vungSel);
}
const vungOn = () => true; // bản đồ tranh luôn bật (cốt truyện cũ đã bỏ)
function vungHere() { return !!P && vungOn() && !!VUNG[P.loc]; }
// Dấu nhiệm vụ trên huy hiệu: nhiệm vụ phái đã xong (về thành nộp) / nơi có quái của nhiệm vụ phái đang làm
function vungMark(id) {
  let ready = false, goal = false;
  // Thi tuyển ngoại môn Thanh Vân (mon_phai.js): đang thi lôi đài thì dấu ở sơn môn
  const t = typeof P !== 'undefined' && P && P.tv && typeof tvState === 'function' ? tvState() : null;
  if (t && t.step === 2 && id === 'duong_chau') ready = true;
  if (typeof tnGoal === 'function' && tnGoal(id)) goal = true; // Truy Nã: hào kiệt đang ẩn náu ở ngọn núi này (truy_na.js)
  if (typeof smGoal === 'function' && smGoal(id)) goal = true; // nhiệm vụ sư môn (mon_phai.js)
  if (typeof smIsReady === 'function' && smIsReady() && id === 'duong_chau') ready = true;
  if (t && t.rank === 1 && typeof nmReady === 'function' && id === 'duong_chau' && nmReady()) ready = true; // đủ điều kiện khảo hạch nội môn
  if (t && t.rank === 2 && typeof taReady === 'function' && id === 'duong_chau' && taReady()) ready = true; // đủ điều kiện lên tinh anh
  if (t && t.rank === 3 && typeof ctReady === 'function' && id === 'duong_chau' && ctReady()) ready = true; // đủ điều kiện lên chân truyền
  if (VUNG[id]) return ready ? '<i class="vg-mk ready">[[tra]]</i>' : '';
  return goal ? '<i class="vg-mk">[[muc_tieu]]</i>' : '';
}
function vungPin(id, pin, o) {
  const L = locView(id), open = canEnter(id), M = typeof MAPS !== 'undefined' && MAPS[id];
  const H = VUNG[id] && VUNG[id].hub, nm = H ? H.name : L.name, at = pin[o] || pin.doc || pin.ngang; // thiếu tọa độ bản này thì dùng bản kia
  return `<button class="vg-pin${open ? '' : ' locked'}${id === P.loc && !H ? ' here' : ''}${H ? ' hub' : ''}${vungSel === id ? ' sel' : ''}" style="left:${at[0]}%;top:${at[1]}%" onclick="G.vungPick('${id}')" aria-label="${nm}">
    <span class="vg-badge"><svg viewBox="0 0 48 48" aria-hidden="true">${VUNG_MARK[pin.mark] || ''}</svg>${open ? '' : '<i class="vg-lock">[[khoa]]</i>'}${vungMark(id)}</span>
    <span class="vg-name">${nm}${M ? `<em>Cấp ${M.lvMin}–${M.lvMax}</em>` : H ? `<em>${H.tag}</em>` : ''}</span></button>`;
}
function renderVung() {
  const k = P.loc, V = VUNG[k], L = locView(k);
  renderTop();
  if (hasSnd()) SND.music(SND.themeFor(L.bg, L.type));
  vungStyle();
  const maps = Object.keys(V.pins).map(id => typeof MAPS !== 'undefined' && MAPS[id]).filter(Boolean);
  const lv = maps.length ? ` · quái cấp ${Math.min(...maps.map(m => m.lvMin))}–${Math.max(...maps.map(m => m.lvMax))}` : '';
  const VO = o => V[o] || V.doc; // chưa có tranh ngang thì dùng tạm tranh dọc
  const art = o => `<div class="vg-art ${o}" style="aspect-ratio:${VO(o).w}/${VO(o).h};--r:${(VO(o).w / VO(o).h).toFixed(4)}">
    <img src="${VO(o).src}" alt="Bản đồ ${V.name}" draggable="false">
    ${Object.keys(V.pins).map(id => vungPin(id, V.pins[id], o)).join('')}</div>`;
  // màn dọc mà chỉ có tranh ngang (Man Hoang): tranh cao hết khoảng giữa, vuốt ngang để xem hai bên
  const wide = VO('doc').w > VO('doc').h;
  const artDoc = () => wide ? `<div class="vg-pan doc" id="vg-pan" onscroll="vungPanX=this.scrollLeft">${art('doc')}</div>` : art('doc');
  const last = worldLog.length ? worldLog[worldLog.length - 1] : '';
  if (screenKey !== 'vung:' + k) vungSel = null; // mới tới vùng: không mở sẵn thẻ cũ
  // lớp "world" để tự động luyện công và các chỗ khác nhận ra đây là màn bản đồ
  show(`<div class="world vg" id="vg">
    <div class="vg-bg doc" style="background-image:url('${V.doc.src}')"></div>
    <div class="vg-bg ngang" style="background-image:url('${VO('ngang').src}')"></div>
    ${artDoc()}${art('ngang')}
    <div class="vg-head"><b>${V.name}</b><small>${V.sub}${lv}</small></div>
    <button class="vg-world" onclick="G.banDo()" aria-label="Bản đồ thiên hạ">${menuIc('thien_ha')}<span>Thiên hạ</span></button>
    ${last ? `<button class="vg-log" onclick="G.vungLog()" aria-label="Xem nhật ký">${last}</button>` : ''}
    <nav class="vg-menu">
      <button onclick="G.menuChar()">${menuIc('nhan_vat')}<span>Nhân vật</span></button>
      <button onclick="G.menuInv()">${menuIc('hanh_trang')}<span>Hành trang</span></button>
      <button onclick="G.menuSkills()">${menuIc('vo_hoc')}<span>Võ học</span></button>
      <button onclick="G.menuQuests()">${menuIc('nhiem_vu')}<span>Nhiệm vụ</span></button>
      <button onclick="G.menuSystem()">${menuIc('he_thong')}<span>Hệ thống</span></button>
    </nav>
    <div class="vg-card" id="vg-card" onclick="if(event.target===this)G.vungClose()"></div>
  </div>`, 'vung:' + k);
  vungFit();
  const pan = document.getElementById('vg-pan');
  if (pan) {
    // lần đầu tới vùng: đặt giữa màn vào sào huyệt (huy hiệu hub); vẽ lại màn thì giữ chỗ đang xem
    if (vungPanX == null || vungPanFor !== k) {
      const hub = Object.keys(V.pins).find(id => VUNG[id] && VUNG[id].hub), at = hub && (V.pins[hub].doc || V.pins[hub].ngang);
      vungPanX = Math.max(0, pan.scrollWidth * (at ? at[0] : 50) / 100 - pan.clientWidth / 2);
      vungPanFor = k;
    }
    pan.scrollLeft = vungPanX;
  }
  if (vungSel && V.pins[vungSel]) vungPick(vungSel); // vừa dùng dịch vụ (nghỉ ngơi...) thì giữ thẻ đang mở
}
// Thẻ thông tin: thành = các nút dịch vụ; nơi luyện cấp = cấp quái, quái, Tinh Anh, nút Đi đến
function vungPick(id) {
  const box = document.getElementById('vg-card');
  if (!box) return;
  if (vungSel !== id) vungSub = null;
  vungSel = id;
  document.querySelectorAll('.vg-pin').forEach(b => b.classList.toggle('sel', b.getAttribute('onclick') === `G.vungPick('${id}')`));
  const L = locView(id), open = canEnter(id), M = typeof MAPS !== 'undefined' && MAPS[id];
  const H = VUNG[id] && VUNG[id].hub; // giữa vùng là sào huyệt tà phái (không tiệm, không nghỉ)
  let body;
  if (H) {
    // Sào huyệt có cấm địa (thi_luyen.js, CAM_DIA): đủ cấp thì có nút vào, chưa đủ thì khóa theo cấp
    const cd = typeof cdOfHub === 'function' && cdOfHub(id);
    body = `<p class="vg-desc">${H.desc}</p>${!cd ? `<div class="vg-locked">[[khoa]] ${H.lock}</div>`
      : cdOpen(cd) ? `<button class="vg-go" onclick="G.camDia('${cd}')">Vào ${CAM_DIA[cd].name}</button>`
      : `<div class="vg-locked">[[khoa]] Cần đạt cấp ${CAM_DIA[cd].minLv}</div>`}`;
  } else if (VUNG[id]) {
    body = `<div class="vg-svcs">${vungSvc(L, id)}</div>`;
  } else {
    const mobs = M ? M.enemies.map(e => `<span class="vg-mob">[[${ENEMIES[e].icon}]] ${ENEMIES[e].name}</span>`).join('') : '';
    const boss = M && ENEMIES[M.boss] ? `<span class="vg-mob elite">[[${ENEMIES[M.boss].icon}]] ${ENEMIES[M.boss].name}<em>Tinh Anh</em></span>` : '';
    let quest = '';
    if (typeof tnHereLine === 'function') quest += tnHereLine(id);
    if (typeof smHereLine === 'function') quest += smHereLine(id);
    body = `<p class="vg-desc">${L.desc}</p>
      ${mobs || boss ? `<div class="vg-mobs">${mobs}${boss}</div>` : ''}${quest}
      ${open ? `<button class="vg-go" onclick="G.vungGo('${id}')">Đi đến</button>`
        : `<div class="vg-locked">[[khoa]] ${LOCATIONS[id].lockText || 'Chưa mở.'}</div>`}`;
  }
  // Thành: đầu thẻ có tranh Chính điện (icon vẽ tay) + mô tả ngắn
  const head = H
    ? `<div class="vg-sheet-head hub"><div><b>${H.name}</b><span>${H.tag}</span></div>
      <button class="vg-x" onclick="G.vungClose()" aria-label="Đóng">✕</button></div>`
    : VUNG[id]
    ? `<div class="vg-sheet-head city"><img class="vg-hall" src="game/img/icon/chinh_dien.png" alt="" draggable="false"><div><b>${L.name}</b><span>Nơi an toàn</span><p>${L.desc}</p></div>
      <button class="vg-x" onclick="G.vungClose()" aria-label="Đóng">✕</button></div>`
    : `<div class="vg-sheet-head"><b>${L.name}</b><span>${M ? `Quái cấp ${M.lvMin}–${M.lvMax}` : 'Nơi an toàn'}</span>
      <button class="vg-x" onclick="G.vungClose()" aria-label="Đóng">✕</button></div>`;
  setHtml(box, `<div class="vg-sheet" role="dialog" aria-label="${L.name}">${head}${body}</div>`);
  box.classList.add('show');
}
// Các chức năng trong thành thành lưới icon vẽ tay (người dùng chốt 2026-11-04): bấm là dùng luôn.
// Icon: game/img/icon/{duoc_phong, trang_bi, lo_ren}.png (gốc luu_tru/icon_tiem.png); chưa có tranh thì dùng biểu tượng SVG.
// Ba đường võ học Thanh Vân (cốt truyện chương 2–3) nằm hàng đầu: hiện mới có giới thiệu, khóa tới khi làm phần thi tuyển ngoại môn (chương 3).
const VUNG_PATHS = {
  kiem: { icon: 'kiem_duong', name: 'Kiếm Pháp', head: 'Lạc Kiếm Nhất',
    text: 'Ông ít nói, ánh mắt lạnh như mũi kiếm, sáng nào cũng một mình luyện kiếm bên thác nước. Kiếm của ông nhanh tới mức tiếng nước đổ còn chưa kịp vọng lại thì kiếm đã tra vào vỏ.' },
  chuong: { icon: 'chuong_duong', name: 'Chưởng Pháp', head: 'Phổ Trí Đại Sư',
    text: 'Người hiền hòa nhất núi, gặp ai cũng cười. Nhưng khi ông xuất chưởng, cả sân luyện võ như lặng đi, tảng đá ngàn cân trước mặt vỡ đôi mà bàn tay ông không hề trầy xước.' },
  con: { icon: 'con_duong', name: 'Côn Pháp', head: 'Vương Lâm',
    text: 'Người cao lớn, tính thẳng như cây côn trong tay. Côn của ông không hoa mỹ, chỉ có quét, bổ, chọc, nhưng mỗi đòn đều nặng tựa núi đổ.' },
};
function vungPath(k) {
  const W = VUNG_PATHS[k];
  if (!W) return;
  if (typeof tvDialog === 'function') return tvDialog(k); // bái sư / thi tuyển ngoại môn (mon_phai.js)
  openModal(`<div class="dlg"><div class="dlg-portrait"><img src="game/img/icon/${W.icon}.png" alt="" style="width:100%;height:100%;object-fit:contain"></div>
    <div class="dlg-body"><div class="dlg-name">Đường ${W.name} · đứng đầu: ${W.head}</div><div class="dlg-text">${W.text}</div></div></div>
    <p class="muted">[[khoa]] Chưa mở. Đường võ này mở khi ngươi thi tuyển làm đệ tử ngoại môn Thanh Vân (chương 3).</p>`);
}
function vungSvc(L, id) {
  const pic = n => `<img src="game/img/icon/${n}.png" alt="" draggable="false">`, svg = n => `<i class="vg-svg">[[${n}]]</i>`;
  const tile = (onclick, p, name, sub, cls) => `<button class="vg-svc${cls ? ' ' + cls : ''}" onclick="${onclick}">${p}<b>${name}</b>${sub ? `<small>${sub}</small>` : ''}</button>`;
  let h = '';
  if (id === 'duong_chau') { // chỉ Thanh Vân Môn
    h += `<div class="vg-svc-lb">Ba đường võ học</div>`;
    // Ô đường võ đã mở (người dùng chốt 2026-11-05); dòng dưới cho biết trạng thái thi tuyển / đệ tử
    const t = typeof tvState === 'function' ? tvState() : {};
    ['kiem', 'chuong', 'con'].forEach(k => {
      const W = VUNG_PATHS[k], mine = t.path === k, ready = mine && t.step === 1 && t.n >= TV.need;
      const sm = mine && t.rank >= 1 && typeof smSub === 'function'; // đệ tử ngoại môn: ô đường võ của mình là nơi nhận / nộp nhiệm vụ sư môn
      const nm = mine && t.rank === 1 && typeof nmReady === 'function' && nmReady(); // đủ điều kiện khảo hạch nội môn
      const ta = mine && ((t.rank === 2 && typeof taReady === 'function' && taReady()) || (t.rank === 3 && typeof ctReady === 'function' && ctReady())); // đủ điều kiện lên tinh anh
      const sub = !mine ? W.head : nm ? `Khảo hạch nội môn ${t.nm || 0}/${NOI_MON.duels}` : ta ? 'Nhận phong tinh anh' : sm ? smSub() : t.rank >= 1 ? 'Sư môn của ngươi' : t.step === 1 ? (ready ? 'Về nộp lệnh bài' : `Vòng 1: ${t.n}/${TV.need}`) : `Lôi đài: ${t.n}/${TV.duels}`;
      const mk = ready || nm || ta || (mine && t.step === 2) || (sm && smIsReady()) ? '<i class="vg-mk ready">[[tra]]</i>' : '';
      h += tile(`G.vungPath('${k}')`, pic(W.icon) + mk, W.name, sub, t.path && !mine ? 'locked' : '');
    });
  }
  const shopPic = id => { const sh = SHOPS[id], n = sh.forge ? 'lo_ren' : id === 'tb_trang_phuc' ? 'trang_bi' : /^tb_(vu_khi|trang_suc|phu_kien)$/.test(id) ? 'tiem_' + id.slice(3) : /^duoc_phong/.test(id) ? 'duoc_phong' : null;
    return n ? pic(n) : svg(sh.icon); };
  const shopTile = id => { const sh = SHOPS[id]; return tile(`G.openShop('${id}')`, shopPic(id), sh.name, sh.forge ? 'Nâng bậc trang bị' : sh.skills ? 'Học võ công' : 'Mua bán'); };
  // Thanh Vân: các tiệm mua bán gộp vào một ô "Cửa Hàng" (người dùng chốt 2026-11-07), bấm vào mới hiện lưới các tiệm; Lò Rèn để ngoài
  const all = L.shops || [], buy = id === 'duong_chau' ? all.filter(s => !SHOPS[s].forge) : [];
  if (buy.length > 1 && vungSub === 'shop') {
    return `<button class="vg-back" onclick="G.vungShops(false)">‹ Sơn môn</button><div class="vg-svc-lb">Cửa hàng</div>${buy.map(shopTile).join('')}`;
  }
  if (id === 'duong_chau') h += `<div class="vg-svc-lb">Sơn môn</div>`;
  if (buy.length > 1) h += tile('G.vungShops(true)', `<span class="vg-mosaic">${buy.slice(0, 4).map(shopPic).join('')}</span>`, 'Cửa Hàng', `${buy.length} tiệm`);
  all.filter(s => !(buy.length > 1 && buy.includes(s))).forEach(s => { h += shopTile(s); });
  if (L.inn != null) h += tile('G.rest()', svg('nghi_ngoi'), 'Nghỉ ngơi', L.inn ? `${L.inn} lượng · hồi đầy` : 'Miễn phí');
  // Truy Nã Hiệp Khách: không còn ô ở Thanh Vân (người dùng chốt 2026-11-07), bấm avatar hào kiệt trên núi để xem + khiêu chiến (truy_na.js)
  // Thí Luyện hằng ngày (thi_luyen.js); icon ảnh Gemini của người dùng (gốc luu_tru/thi_luyen/icon_thi_luyen.png)
  if (id === 'duong_chau' && typeof thiLuyen === 'function') h += tile('G.thiLuyen()', pic('thi_luyen'), 'Thí Luyện', tlSub());
  if (typeof thapButton === 'function' && thapButton()) h += tile('G.thap()', svg('thap'), 'Trấn Ma Tháp', P.thap.run ? `Đang leo: tầng ${P.thap.run}` : `Kỷ lục tầng ${P.thap.best}`);
  return h;
}
function vungClose() {
  vungSel = null; vungSub = null;
  const box = document.getElementById('vg-card');
  if (box) box.classList.remove('show');
  document.querySelectorAll('.vg-pin.sel').forEach(b => b.classList.remove('sel'));
}
function vungGo(id) {
  vungSel = null;
  travel(id);
}
function vungLog() {
  openModal(`<h3>Nhật ký hành trình</h3><div class="log">${worldLog.map(m => `<div>${m}</div>`).join('') || '<div class="muted">Trống.</div>'}</div>`);
}
// Bản đồ nằm ngay dưới thanh nhân vật trên cùng
function vungFit() {
  const tb = document.getElementById('topbar');
  document.documentElement.style.setProperty('--vg-top', `${tb && !tb.classList.contains('hidden') ? Math.round(tb.getBoundingClientRect().bottom) : 0}px`);
  if (!vungFit.on) { vungFit.on = true; window.addEventListener('resize', () => { if (document.getElementById('vg')) vungFit(); }); }
}
function vungStyle() {
  if (document.getElementById('vg-style')) return;
  const st = document.createElement('style');
  st.id = 'vg-style';
  st.textContent = `
    .vg { position: fixed; left: 0; right: 0; top: var(--vg-top, 0px); bottom: 0; z-index: 5; overflow: hidden; background: #d9ddd6; }
    .vg-bg { position: absolute; inset: -30px; background: center / cover no-repeat; filter: blur(16px) brightness(.9); }
    .vg-art { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%);
      width: min(100%, calc((100dvh - var(--vg-top, 0px)) * var(--r))); }
    .vg-art > img { display: block; width: 100%; height: 100%; user-select: none; -webkit-user-drag: none; }
    .vg-art.ngang, .vg-bg.ngang { display: none; }
    .vg-pan { position: absolute; left: 0; right: 0; top: 76px; bottom: 84px; overflow-x: auto; overflow-y: hidden; scrollbar-width: none; overscroll-behavior-x: contain; }
    .vg-pan::-webkit-scrollbar { display: none; }
    .vg-pan > .vg-art { position: relative; left: 0; top: 0; transform: none; height: 100%; width: auto; }
    .vg-pin { position: absolute; transform: translate(-50%, -50%); display: flex; flex-direction: column; align-items: center; gap: 3px;
      padding: 0; border: 0; background: none; cursor: pointer; font: inherit; z-index: 2; }
    .vg-badge { position: relative; width: 50px; height: 50px; border-radius: 50%; display: grid; place-items: center;
      background: radial-gradient(circle at 38% 32%, #fff4cf, #e9c873 55%, #b88a35); border: 2px solid #f8e7b0;
      box-shadow: 0 0 0 2px rgba(60,40,15,.55), 0 4px 12px rgba(0,0,0,.35); transition: transform .2s, box-shadow .2s; }
    .vg-badge svg { width: 30px; height: 30px; fill: #2a1f14; }
    .vg-pin:hover .vg-badge, .vg-pin.sel .vg-badge { transform: scale(1.1); box-shadow: 0 0 0 2px #fff6d8, 0 0 18px rgba(255,220,130,.9); }
    .vg-pin.here .vg-badge::after { content: ""; position: absolute; inset: -7px; border-radius: 50%; border: 2px solid rgba(255,236,170,.9); animation: vgRing 2.2s ease-out infinite; }
    @keyframes vgRing { from { transform: scale(.9); opacity: 1; } to { transform: scale(1.35); opacity: 0; } }
    .vg-pin.locked .vg-badge { filter: grayscale(.85) brightness(.8); }
    .vg-lock { position: absolute; right: -6px; bottom: -4px; font-size: 13px; background: #2a1f14; border-radius: 50%; width: 22px; height: 22px; display: grid; place-items: center; border: 1px solid #c9a25c; }
    .vg-mk { position: absolute; right: -8px; top: -8px; font-size: 13px; width: 24px; height: 24px; display: grid; place-items: center; border-radius: 50%;
      background: #b3362b; border: 2px solid #fff3d0; animation: vgBob 1.4s ease-in-out infinite; }
    .vg-mk.ready { background: #2c7a4b; }
    @keyframes vgBob { 50% { transform: translateY(-3px); } }
    .vg-name { display: flex; flex-direction: column; align-items: center; padding: 3px 10px; border-radius: 4px; white-space: nowrap;
      background: rgba(24,26,26,.84); border: 1px solid rgba(201,162,92,.55); color: #f3efe2; font-size: 13px; font-weight: 700; line-height: 1.2; }
    .vg-name em { font-style: normal; font-weight: 400; font-size: 11px; color: #e8c27a; }
    .vg-head { position: absolute; left: 10px; top: 10px; z-index: 3; padding: 6px 14px 7px; border-radius: 6px; pointer-events: none;
      background: linear-gradient(90deg, rgba(20,22,22,.82), rgba(20,22,22,.55)); border-left: 3px solid #c9a25c; color: #f3efe2; }
    .vg-head b { display: block; font-family: 'Pattaya', serif; font-weight: normal; font-size: 24px; line-height: 1.1; color: #fff4dc; }
    .vg-head small { font-size: 12px; color: #e8c27a; }
    .vg-world { position: absolute; right: 10px; top: 10px; z-index: 3; display: flex; flex-direction: column; align-items: center; gap: 1px; min-width: 56px; min-height: 52px;
      padding: 5px 6px; border-radius: 8px; cursor: pointer; font: inherit; font-size: 22px; color: #f3efe2; background: rgba(20,22,22,.8); border: 1px solid rgba(201,162,92,.6); }
    .vg-world span { font-size: 11px; }
    .vg-log { position: absolute; left: 50%; transform: translateX(-50%); bottom: calc(84px + env(safe-area-inset-bottom, 0px)); z-index: 3; width: min(560px, calc(100% - 24px));
      padding: 6px 12px; border-radius: 6px; border: 0; cursor: pointer; text-align: left; font: inherit; font-size: 13px; line-height: 1.4; color: #f3efe2;
      background: rgba(20,22,22,.72); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .vg-menu { position: absolute; left: 50%; transform: translateX(-50%); bottom: calc(8px + env(safe-area-inset-bottom, 0px)); z-index: 3; width: min(560px, calc(100% - 16px));
      display: grid; grid-template-columns: repeat(5, 1fr); gap: 4px; padding: 5px; border-radius: 10px; background: rgba(20,22,22,.86); border: 1px solid rgba(201,162,92,.5); }
    .vg-menu button { display: flex; flex-direction: column; align-items: center; gap: 1px; min-height: 48px; padding: 4px 2px; border: 0; border-radius: 6px; background: none;
      cursor: pointer; font: inherit; font-size: 22px; color: #f3efe2; }
    .vg-menu button span { font-size: 11px; }
    .mi { display: block; object-fit: contain; filter: drop-shadow(0 2px 3px rgba(0,0,0,.55)); }
    .vg-menu .mi { width: 38px; height: 38px; }
    .vg-world .mi { width: 36px; height: 36px; }
    .vg-menu button:hover, .vg-world:hover { background: rgba(201,162,92,.18); }
    .vg-card { position: absolute; inset: 0; z-index: 6; display: none; align-items: flex-end; justify-content: center; background: rgba(15,18,18,.28); }
    .vg-card.show { display: flex; }
    .vg-sheet { width: min(560px, 100%); max-height: 78%; overflow-y: auto; padding: 14px 16px calc(16px + env(safe-area-inset-bottom, 0px));
      border-radius: 14px 14px 0 0; background: rgba(22,25,25,.96); border: 1px solid rgba(201,162,92,.55); border-bottom: 0; color: #f3efe2;
      box-shadow: 0 -10px 30px rgba(0,0,0,.4); animation: vgUp .25s ease-out; }
    @keyframes vgUp { from { transform: translateY(30px); opacity: 0; } }
    @media (orientation: landscape) and (min-width: 900px) {
      .vg-card { align-items: stretch; justify-content: flex-end; background: none; pointer-events: none; }
      .vg-sheet { pointer-events: auto; width: 380px; max-height: none; border-radius: 0; border: 0; border-left: 1px solid rgba(201,162,92,.55); padding-bottom: 90px; animation-name: vgLeft; }
      @keyframes vgLeft { from { transform: translateX(30px); opacity: 0; } }
    }
    .vg-sheet-head { display: flex; align-items: baseline; gap: 10px; padding-bottom: 8px; margin-bottom: 8px; border-bottom: 1px solid rgba(201,162,92,.35); }
    .vg-sheet-head b { font-family: 'Pattaya', serif; font-weight: normal; font-size: 26px; color: #fff4dc; }
    .vg-sheet-head span { font-size: 13px; color: #e8c27a; }
    .vg-x { margin-left: auto; width: 40px; height: 40px; border-radius: 50%; border: 1px solid rgba(201,162,92,.5); background: none; color: #f3efe2; cursor: pointer; font-size: 16px; }
    .vg-desc { margin: 0 0 10px; font-size: 14px; line-height: 1.55; color: #d9d2c0; }
    .vg-mobs { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 10px; }
    .vg-mob { display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px 4px 6px; border-radius: 999px; font-size: 13px; background: rgba(255,255,255,.07); border: 1px solid rgba(255,255,255,.12); }
    .vg-mob.elite { border-color: #c9a25c; background: rgba(201,162,92,.15); }
    .vg-mob em { font-style: normal; font-size: 11px; color: #e8c27a; margin-left: 4px; }
    .vg-quest { font-size: 13px; color: #f0b9a8; margin-bottom: 10px; }
    .vg-locked { padding: 10px 12px; border-radius: 6px; background: rgba(179,54,43,.18); color: #f3d0c8; font-size: 14px; }
    .vg-go { display: block; width: 100%; min-height: 46px; border-radius: 8px; cursor: pointer; font-family: 'Pattaya', serif; font-size: 22px; color: #1c1a17;
      background: linear-gradient(#f0d595, #c9a25c); border: 1px solid #f3e2b8; }
    .vg-sheet-head.hub > div { display: flex; flex-direction: column; min-width: 0; }
    .vg-sheet-head.hub b { line-height: 1.15; }
    .vg-sheet-head.city { align-items: flex-start; gap: 12px; }
    .vg-sheet-head.city > div { flex: 1; min-width: 0; }
    .vg-sheet-head.city b { display: block; line-height: 1.15; }
    .vg-sheet-head.city span { display: block; margin-top: 1px; }
    .vg-sheet-head.city p { margin: 4px 0 0; font-size: 12.5px; line-height: 1.45; color: #cfc6b2; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
    .vg-hall { flex: none; width: 84px; height: 84px; object-fit: contain; filter: drop-shadow(0 3px 6px rgba(0,0,0,.5)); }
    .vg-svcs { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
    .vg-svc { display: flex; flex-direction: column; align-items: center; gap: 2px; padding: 8px 4px 9px; border-radius: 10px; cursor: pointer; font: inherit; color: #f3efe2;
      background: radial-gradient(circle at 50% 35%, rgba(201,162,92,.16), rgba(255,255,255,.03) 70%); border: 1px solid rgba(201,162,92,.35); transition: border-color .2s, background .2s; }
    .vg-svc:hover { border-color: #e8c27a; background: radial-gradient(circle at 50% 35%, rgba(232,194,122,.28), rgba(255,255,255,.04) 70%); }
    .vg-svc img, .vg-svc .vg-svg { width: 64px; height: 64px; object-fit: contain; filter: drop-shadow(0 3px 5px rgba(0,0,0,.5)); }
    .vg-svc .vg-svg { display: grid; place-items: center; font-size: 46px; font-style: normal; }
    .vg-svc { position: relative; }
    .vg-svc .vg-lock { right: 6px; top: 6px; bottom: auto; }
    .vg-svc.locked img { filter: drop-shadow(0 3px 5px rgba(0,0,0,.5)) saturate(.7) brightness(.85); }
    .vg-svc-lb { grid-column: 1 / -1; margin: 2px 0 -2px; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: #c9a25c; }
    .vg-svc b { font-size: 13px; line-height: 1.25; text-align: center; }
    .vg-svc small { font-size: 11px; color: #e8c27a; text-align: center; }
    .vg-mosaic { width: 64px; height: 64px; display: grid; grid-template-columns: 1fr 1fr; gap: 1px; }
    .vg-svc .vg-mosaic img { width: 31px; height: 31px; }
    .vg-back { grid-column: 1 / -1; justify-self: start; min-height: 36px; padding: 4px 14px; border-radius: 999px; cursor: pointer; font: inherit; font-size: 13px;
      color: #f3efe2; background: rgba(255,255,255,.06); border: 1px solid rgba(201,162,92,.5); }
    .vg-back:hover { border-color: #e8c27a; }
    @media (prefers-reduced-motion: reduce) { .vg-pin.here .vg-badge::after, .vg-mk, .vg-sheet { animation: none; } }`;
  document.head.appendChild(st);
}

/* =================================================================
   MÀN NƠI LUYỆN CẤP (người dùng chọn "cách 1" 2026-11-04, theo ảnh mẫu màn chuẩn bị): tranh cảnh nơi đó làm nền,
   khung chuẩn bị (tên nơi, cấp quái, võ học đang mang, quái + Tinh Anh, nhật ký mới nhất) và nút Khởi hành = thám hiểm một lần
   (cách chơi giữ nguyên, không chặng, không thể lực). Điện thoại: tranh dọc, khung nằm dưới; máy tính ngang: tranh ngang, khung giữa.
   Bản ngang của tranh cũng là nền sân đấu (canhArt, engine renderCombat).
   ================================================================= */
function canhKey(loc) {
  const M = typeof MAPS !== 'undefined' && MAPS[loc], V = M && VUNG[M.city];
  return V && V.canh && V.canh[loc] ? V.canh[loc] : null;
}
const canhHere = () => !!P && vungOn() && !!canhKey(P.loc);
// Ảnh nền sân đấu ở nơi đang đứng (bản ngang), không có thì null
// Vùng chỉ có tranh cảnh dọc (VUNG[x].canhDoc): màn ngang dùng tạm tranh dọc, sân đấu không lấy tranh cảnh
const canhDocOnly = loc => { const M = typeof MAPS !== 'undefined' && MAPS[loc]; return !!(M && VUNG[M.city] && VUNG[M.city].canhDoc); };
// Chỉ dành cho điện thoại (người dùng chốt 2026-11-12): luôn dùng tranh dọc, tranh ngang đã gỡ
const canhSrc = loc => `game/img/canh/${canhKey(loc)}_doc.jpg`;
const canhArt = () => null; // sân đấu dùng ảnh SAN_DAU, không lấy tranh cảnh
function renderCanh() {
  const id = P.loc, k = canhKey(id), L = locView(id), M = MAPS[id], city = M.city;
  renderTop();
  if (hasSnd()) SND.music(SND.themeFor(L.bg, L.type));
  vungStyle();
  canhStyle();
  const sks = [BASIC_SKILL, ...['vocong', 'noicong', 'congphap', 'khinhcong'].flatMap(c => P.use[c] || [])].filter(x => SKILLS[x] && P.skills[x]);
  const mobs = M.enemies.map(e => `<span class="vg-mob">[[${ENEMIES[e].icon}]] ${ENEMIES[e].name}</span>`).join('')
    + (ENEMIES[M.boss] ? `<span class="vg-mob elite">[[${ENEMIES[M.boss].icon}]] ${ENEMIES[M.boss].name}<em>Tinh Anh</em></span>` : '');
  const last = worldLog.length ? worldLog[worldLog.length - 1] : '';
  const auto = typeof autoHere === 'function' && autoHere() && !(AUTO && AUTO.on);
  show(`<div class="world cn" id="cn">
    <img class="cn-art doc" src="${canhSrc(id, 'doc')}" alt="" draggable="false">
    <div class="cn-shade"></div>
    ${typeof tnSceneHtml === 'function' ? tnSceneHtml(id) : ''}
    <div class="cn-top">
      <button class="cn-back" onclick="G.travel('${city}')" aria-label="Về ${LOCATIONS[city].name}"><i>‹</i><span><small>Về</small><b>${LOCATIONS[city].name}</b></span></button>
      <div class="cn-icons">
        <button onclick="G.menuChar()">${menuIc('nhan_vat')}<span>Nhân vật</span></button>
        <button onclick="G.menuQuests()">${menuIc('nhiem_vu')}<span>Nhiệm vụ</span></button>
        <button onclick="G.menuSystem()">${menuIc('he_thong')}<span>Hệ thống</span></button>
      </div>
    </div>
    <div class="cn-panel">
      <div class="cn-head"><small>${LOCATIONS[city].name} · Luyện công</small><b>${L.name}</b><span>Quái cấp ${M.lvMin}–${M.lvMax}</span></div>
      <div class="cn-row"><span class="cn-lb">Võ học</span><div class="cn-sks">${sks.map(x => `<button class="cn-sk" onclick="G.menuSkills()" aria-label="${SKILLS[x].name}, tầng ${P.skills[x].lv}">${skIcon(x)}<i>${P.skills[x].lv}</i></button>`).join('')}</div></div>
      <div class="vg-mobs">${mobs}</div>
      ${last ? `<button class="cn-log" onclick="G.vungLog()" aria-label="Xem nhật ký">${last}</button>` : ''}
      <button class="cn-go" onclick="G.explore()">Khởi hành</button>
      <div class="cn-btns">
        ${auto ? `<button onclick="G.autoMenu()">${menuIc('tu_dong')} Tự động</button>` : ''}
        <button onclick="G.menuInv()">${menuIc('hanh_trang')} Hành trang</button>
        <button onclick="G.menuSkills()">${menuIc('vo_hoc')} Võ học</button>
      </div>
    </div>
  </div>`, 'canh:' + id);
  vungFit();
}
function canhStyle() {
  if (document.getElementById('cn-style')) return;
  const st = document.createElement('style');
  st.id = 'cn-style';
  st.textContent = `
    .cn { position: fixed; left: 0; right: 0; top: var(--vg-top, 0px); bottom: 0; z-index: 5; overflow: hidden; background: #141616; }
    .cn-art { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: center top; user-select: none; -webkit-user-drag: none; }
    .cn-art.ngang { display: none; object-position: center; }
    .cn-shade { position: absolute; inset: 0; pointer-events: none; background: linear-gradient(rgba(10,12,12,.35), transparent 22%, transparent 40%, rgba(10,12,12,.55)); }
    .cn-top { position: absolute; left: 10px; right: 10px; top: 10px; z-index: 3; display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; }
    .cn-back { display: flex; align-items: center; gap: 8px; padding: 5px 12px 6px 8px; border-radius: 6px; cursor: pointer; font: inherit; color: #f3efe2; text-align: left;
      background: rgba(20,22,22,.82); border: 1px solid rgba(201,162,92,.6); min-height: 48px; }
    .cn-back i { font-style: normal; font-size: 26px; line-height: 1; color: #e8c27a; }
    .cn-back small { display: block; font-size: 11px; color: #c9b88f; }
    .cn-back b { font-family: 'Pattaya', serif; font-weight: normal; font-size: 19px; line-height: 1.1; color: #fff4dc; }
    .cn-icons { display: flex; gap: 6px; }
    .cn-icons button { display: flex; flex-direction: column; align-items: center; gap: 1px; min-width: 52px; min-height: 48px; padding: 4px 4px; border-radius: 8px; cursor: pointer;
      font: inherit; font-size: 20px; color: #f3efe2; background: rgba(20,22,22,.8); border: 1px solid rgba(201,162,92,.55); }
    .cn-icons span { font-size: 10.5px; }
    .cn-icons .mi { width: 32px; height: 32px; }
    .cn-btns .mi { display: inline-block; width: 26px; height: 26px; vertical-align: middle; margin: -3px 2px 0 0; }
    .cn-panel { position: absolute; left: 0; right: 0; bottom: 0; z-index: 3; max-height: 66%; overflow-y: auto; padding: 14px 16px calc(14px + env(safe-area-inset-bottom, 0px));
      border-radius: 14px 14px 0 0; background: rgba(18,20,20,.93); border: 1px solid rgba(201,162,92,.5); border-bottom: 0; color: #f3efe2; box-shadow: 0 -10px 30px rgba(0,0,0,.4); }
    @media (orientation: landscape) and (min-width: 900px) {
      .cn-panel { left: 50%; top: 50%; bottom: auto; transform: translate(-50%, -46%); width: 540px; max-height: 80%; border-radius: 8px; border-bottom: 1px solid rgba(201,162,92,.5); }
    }
    .cn-head { padding-bottom: 8px; margin-bottom: 10px; border-bottom: 1px solid rgba(201,162,92,.3); }
    .cn-head small { display: block; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: #c9a25c; }
    .cn-head b { font-family: 'Pattaya', serif; font-weight: normal; font-size: 30px; line-height: 1.15; color: #fff4dc; margin-right: 10px; }
    .cn-head span { font-size: 13px; color: #e8c27a; }
    .cn-row { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
    .cn-lb { flex: none; font-size: 13px; color: #c9b88f; }
    .cn-sks { display: flex; flex-wrap: wrap; gap: 6px; }
    .cn-sk { position: relative; width: 44px; height: 44px; border-radius: 8px; cursor: pointer; display: grid; place-items: center; font-size: 28px; padding: 0;
      background: rgba(255,255,255,.06); border: 1px solid rgba(201,162,92,.45); }
    .cn-sk i { position: absolute; right: -4px; bottom: -4px; min-width: 18px; height: 18px; padding: 0 3px; border-radius: 9px; font-style: normal; font-size: 11px; line-height: 18px;
      background: #2a1f14; color: #e8c27a; border: 1px solid #c9a25c; }
    .cn-log { display: block; width: 100%; margin-bottom: 10px; padding: 6px 10px; border-radius: 6px; border: 0; cursor: pointer; text-align: left; font: inherit; font-size: 13px;
      color: #d9d2c0; background: rgba(255,255,255,.05); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .cn-go { display: block; width: 100%; min-height: 52px; border-radius: 8px; cursor: pointer; font-family: 'Pattaya', serif; font-size: 26px; color: #0f2a22;
      background: linear-gradient(#8fe3c4, #3a9c7e); border: 1px solid #d8f5e8; box-shadow: 0 0 0 1px #c9a25c, 0 6px 16px rgba(0,0,0,.35); }
    .cn-go:hover { filter: brightness(1.07); }
    .cn-btns { display: flex; gap: 6px; margin-top: 8px; }
    .cn-btns button { flex: 1; min-height: 44px; padding: 4px 6px; border-radius: 8px; cursor: pointer; font: inherit; font-size: 13.5px; white-space: nowrap; color: #f3efe2;
      background: linear-gradient(#2c6f86, #1d4d5e); border: 1px solid #7fc6dc; }
    .cn-btns button:hover { filter: brightness(1.1); }
    .sd-scene > img.sd-art { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: center 65%; }`;
  document.head.appendChild(st);
}

/* =================================================================
   BẢN ĐỒ THIÊN HẠ (người dùng chốt 2026-11-06, hướng A theo ảnh mẫu): tranh dư đồ vẽ tay (Gemini, gốc luu_tru/thien_ha/nen_{doc,ngang}.png),
   chỉ hiện các vùng; mỗi vùng là một thành cũ đổi tên (giữ mã để bản lưu không hỏng) + 4 nơi luyện cấp:
   Núi Thiên Tuyệt (duong_chau, Thanh Vân Môn) 1–20, Sa Mạc Man Hoang (lac_duong) 21–40, Đầm Lầy Hiệp Xuyên (tuong_duong) 41–60,
   Thung Lũng Tiêu Dao (thanh_do) 61–80, Hồ Kỳ Sơn (truong_an) 81–100.
   Bấm vùng: thẻ thông tin + Đi đến (banDoGo → thành của vùng; Thiên Tuyệt mở bản đồ vùng Thanh Vân Môn).
   Vùng khóa tới khi đủ cấp mở map đầu của vùng. Điện thoại: tranh dọc, danh sách vùng dưới; máy tính ngang: tranh ngang, danh sách bên phải.
   Huy hiệu tạm dùng hình mực VUNG_MARK; có hình công trình (Gemini) thì đặt vào trường img.
   ================================================================= */
const THIEN_HA = {
  doc: { src: 'game/img/ban_do/th_doc.jpg', w: 1072, h: 1920 },
  ngang: { src: 'game/img/ban_do/th_doc.jpg', w: 1072, h: 1920 }, // chỉ điện thoại: tranh ngang đã gỡ, giữ khóa cho mã cũ
  vung: [
    { id: 'duong_chau', name: 'Núi Thiên Tuyệt', short: 'Thiên Tuyệt', sub: 'Thanh Vân Môn', lv: [1, 20], img: 'game/img/ban_do/vung_thien_tuyet.png', mark: 'mon', doc: [80, 37], ngang: [64, 39],
      desc: 'Dãy núi hiểm trở phía đông, mây phủ quanh năm. Trên đỉnh là Thanh Vân Môn, sơn môn của ngươi; bốn ngọn Tiểu Trúc, Đại Trúc, Lạc Hà, Thông Thiên là nơi đệ tử rèn luyện.' },
    { id: 'lac_duong', name: 'Sa Mạc Man Hoang', short: 'Man Hoang', lv: [21, 40], img: 'game/img/ban_do/vung_man_hoang.png', mark: 'cat', doc: [21, 34], ngang: [27, 36] },
    { id: 'tuong_duong', name: 'Đầm Lầy Hiệp Xuyên', short: 'Hiệp Xuyên', lv: [41, 60], img: 'game/img/ban_do/vung_hiep_xuyen.png', mark: 'dam', doc: [22, 72], ngang: [30, 74] },
    { id: 'thanh_do', name: 'Thung Lũng Tiêu Dao', short: 'Tiêu Dao', lv: [61, 80], img: 'game/img/ban_do/vung_tieu_dao.png', mark: 'hoa', doc: [58, 20], ngang: [52, 24] },
    { id: 'truong_an', name: 'Hồ Kỳ Sơn', short: 'Kỳ Sơn', lv: [81, 100], img: 'game/img/ban_do/vung_ky_son.png', mark: 'ho', doc: [52, 47], ngang: [50, 50] },
    // Chưa có nội dung (soon: hiện trên bản đồ, khóa "Sắp mở"); người dùng thêm 2026-11-06
    { id: 'trung_nguyen', soon: true, name: 'Trung Nguyên', short: 'Trung Nguyên', sub: 'Tứ đại môn phái', img: 'game/img/ban_do/vung_trung_nguyen.png', mark: 'trung_nguyen', doc: [68, 62], ngang: [61, 65],
      desc: 'Vùng đất trung tâm thiên hạ, nơi bốn đại môn phái Thiếu Lâm, Võ Đang, Nga Mi, Cái Bang đặt sơn môn. Quan lộ từ đây tỏa đi khắp chốn; muốn bái kiến môn phái nào cũng phải qua Trung Nguyên.' },
    { id: 'hoa_diem_son', soon: true, name: 'Hỏa Diệm Sơn', short: 'Hỏa Diệm', sub: 'Tổng đàn Thất Sát Môn', img: 'game/img/ban_do/vung_hoa_diem_son.png', mark: 'nui_lua', doc: [52, 80], ngang: [48, 86],
      desc: 'Núi lửa phun khói quanh năm ở cực nam, đất nứt ra dung nham đỏ rực. Thất Sát Môn đặt tổng đàn sâu trong lòng núi, bảy đại đường canh giữ, chưa kẻ ngoài nào vào mà trở ra được.' },
  ],
};
let thSel = null;
const thOf = id => THIEN_HA.vung.find(v => v.id === id);
// Vùng đang đứng: thành của vùng hoặc một nơi luyện cấp thuộc vùng
const thHereId = () => (typeof MAPS !== 'undefined' && MAPS[P.loc] ? MAPS[P.loc].city : P.loc);
const thOpenLv = v => (v.soon ? 0 : LOCATIONS[v.id].minLv || 1); // TG_CITY_LV trong the_gioi.js
const thIsOpen = v => !v.soon && canEnter(v.id);
const thLvText = v => (v.soon ? 'Sắp mở' : `Cấp ${v.lv[0]}–${v.lv[1]}`);
function thPin(v, o) {
  const open = thIsOpen(v), here = thHereId() === v.id;
  const marks = `${open ? '' : '<i class="vg-lock">[[khoa]]</i>'}${here || v.soon ? '' : vungMark(v.id)}`;
  return `<button class="vg-pin th-pin${v.img ? ' has-img' : ''}${open ? '' : ' locked'}${here ? ' here' : ''}${thSel === v.id ? ' sel' : ''}" data-th="${v.id}" style="left:${v[o][0]}%;top:${v[o][1]}%" onclick="G.thPick('${v.id}')" aria-label="${v.name}">
    ${v.img ? `<span class="th-lm"><img src="${v.img}" alt="" draggable="false">${marks}</span>`
      : `<span class="vg-badge"><svg viewBox="0 0 48 48" aria-hidden="true">${VUNG_MARK[v.mark] || ''}</svg>${marks}</span>`}
    <span class="vg-name">${v.name}<em>${thLvText(v)}</em></span></button>`;
}
function thCard() {
  const v = thSel && thOf(thSel);
  if (!v) return '';
  const L = v.soon ? v : locView(v.id), open = thIsOpen(v), here = thHereId() === v.id;
  let act;
  if (v.soon) act = `<div class="vg-locked">[[khoa]] Vùng này chưa mở. Sẽ mở theo cốt truyện về sau.</div>`;
  else if (!open) act = `<div class="vg-locked">[[khoa]] Nguy hiểm! Cần đạt cấp ${thOpenLv(v)} mới tới được vùng này.</div>`;
  else if (P.loc === v.id) act = `<div class="th-here">[[la_ban]] Ngươi đang ở đây.</div>`;
  else act = `<button class="vg-go" onclick="G.banDoGo('${v.id}')">${here ? `Về ${L.name}` : 'Đi đến'}</button>`;
  return `<div class="vg-sheet th-sheet" role="dialog" aria-label="${v.name}">
    <div class="vg-sheet-head"><div class="th-hd"><b>${v.name}</b><span>${v.sub ? v.sub + ' · ' : ''}${v.soon ? 'Sắp mở' : `Quái cấp ${v.lv[0]}–${v.lv[1]}`}</span></div>
      <button class="vg-x" onclick="G.thUnpick()" aria-label="Đóng">✕</button></div>
    <p class="vg-desc">${v.desc || L.desc}</p>${here && P.loc !== v.id ? `<div class="th-here">[[la_ban]] Ngươi đang ở vùng này (${locView(P.loc).name}).</div>` : ''}${act}</div>`;
}
function thList() {
  return THIEN_HA.vung.map(v => {
    const open = thIsOpen(v), here = thHereId() === v.id;
    return `<button class="th-it${open ? '' : ' locked'}${here ? ' here' : ''}${thSel === v.id ? ' sel' : ''}" onclick="G.thPick('${v.id}')">
      <b><span class="full">${v.name}</span><span class="short">${v.short}</span></b><small>${open ? thLvText(v) : `[[khoa]] ${v.soon ? 'Sắp mở' : 'Cấp ' + thOpenLv(v)}`}</small></button>`;
  }).join('');
}
function thRender() {
  const box = document.getElementById('bando');
  if (!box) return;
  const T = THIEN_HA;
  const art = o => `<div class="vg-art th-art ${o}" style="aspect-ratio:${T[o].w}/${T[o].h};--r:${(T[o].w / T[o].h).toFixed(4)}">
    <img src="${T[o].src}" alt="Dư đồ thiên hạ" draggable="false">${T.vung.map(v => thPin(v, o)).join('')}</div>`;
  setHtml(box, `<div class="th-bg doc" style="background-image:url('${T.doc.src}')"></div><div class="th-bg ngang" style="background-image:url('${T.ngang.src}')"></div>
    <div class="th-stage">${art('doc')}${art('ngang')}</div>
    <div class="th-head"><b>Thiên Hạ</b><small>Chọn vùng để xem và đi tới</small></div>
    <button class="th-close" onclick="G.banDoClose()" aria-label="Đóng bản đồ">✕</button>
    <div class="th-side"><div class="th-card${thSel ? ' show' : ''}" onclick="if(event.target===this)G.thUnpick()">${thCard()}</div><nav class="th-list">${thList()}</nav></div>`);
}
function thOpen() {
  vungStyle(); thStyle();
  thSel = null;
  let box = document.getElementById('bando');
  if (!box) { box = document.createElement('div'); box.id = 'bando'; document.body.appendChild(box); }
  box.className = 'th';
  box.setAttribute('role', 'dialog'); box.setAttribute('aria-label', 'Bản đồ thiên hạ');
  thRender();
}
function thPick(id) { thSel = id; thRender(); }
function thUnpick() { thSel = null; thRender(); }
function thStyle() {
  if (document.getElementById('th-style')) return;
  const st = document.createElement('style');
  st.id = 'th-style';
  st.textContent = `
    #bando.th { position: fixed; inset: 0; z-index: 60; display: block; padding: 0; overflow: hidden; background: #2a2a22; --th-b: calc(66px + env(safe-area-inset-bottom, 0px)); }
    #bando.th .th-bg { position: absolute; inset: -30px; background: center / cover no-repeat; filter: blur(16px) brightness(.7); }
    #bando.th .th-stage { position: absolute; left: 0; right: 0; top: 0; bottom: var(--th-b); }
    #bando.th .th-art { width: min(100%, calc((100dvh - var(--th-b)) * var(--r))); box-shadow: 0 0 40px rgba(0,0,0,.45); }
    #bando.th .th-bg.ngang, #bando.th .th-art.ngang { display: none; }
    #bando.th .th-art { container-type: inline-size; }
    #bando.th .th-pin.has-img { gap: 0; }
    #bando.th .th-lm { position: relative; display: block; width: 25cqw; }
    #bando.th .th-art.ngang .th-lm { width: 11.5cqw; }
    #bando.th .th-lm img { display: block; width: 100%; height: auto; filter: drop-shadow(0 4px 5px rgba(0,0,0,.4)); transition: transform .2s, filter .2s; user-select: none; -webkit-user-drag: none; }
    #bando.th .th-pin:hover .th-lm img, #bando.th .th-pin.sel .th-lm img { transform: scale(1.07); filter: drop-shadow(0 0 6px #fff3c4) drop-shadow(0 0 14px rgba(255,214,120,.9)); }
    #bando.th .th-pin.here .th-lm img { animation: thHere 2.2s ease-in-out infinite; }
    @keyframes thHere { 0%, 100% { filter: drop-shadow(0 0 3px rgba(255,236,170,.7)) drop-shadow(0 4px 5px rgba(0,0,0,.4)); } 50% { filter: drop-shadow(0 0 9px #fff0b8) drop-shadow(0 0 18px rgba(255,214,120,.8)); } }
    #bando.th .th-pin.locked .th-lm img { filter: grayscale(.6) brightness(.8) drop-shadow(0 4px 5px rgba(0,0,0,.4)); }
    #bando.th .th-lm .vg-lock { right: 12%; bottom: 8%; }
    #bando.th .th-lm .vg-mk { right: 10%; top: 4%; }
    #bando.th .th-pin.has-img .vg-name { margin-top: -4px; }
    @media (prefers-reduced-motion: reduce) { #bando.th .th-pin.here .th-lm img { animation: none; } }
    #bando.th .th-head { position: absolute; left: 10px; top: max(10px, env(safe-area-inset-top, 0px)); z-index: 3; padding: 6px 14px 7px; border-radius: 6px; pointer-events: none;
      background: linear-gradient(90deg, rgba(20,22,22,.82), rgba(20,22,22,.5)); border-left: 3px solid #c9a25c; color: #f3efe2; }
    #bando.th .th-head b { display: block; font-family: 'Pattaya', serif; font-weight: normal; font-size: 26px; line-height: 1.1; color: #fff4dc; }
    #bando.th .th-head small { font-size: 12px; color: #e8c27a; }
    #bando.th .th-close { position: absolute; right: 10px; top: max(10px, env(safe-area-inset-top, 0px)); z-index: 3; width: 46px; height: 46px; border-radius: 50%; cursor: pointer;
      font-size: 18px; color: #f3efe2; background: rgba(20,22,22,.82); border: 1px solid rgba(201,162,92,.7); }
    #bando.th .th-side { position: absolute; inset: 0; pointer-events: none; z-index: 4; }
    #bando.th .th-list { pointer-events: auto; position: absolute; left: 0; right: 0; bottom: 0; height: var(--th-b); padding: 6px 6px calc(6px + env(safe-area-inset-bottom, 0px));
      display: flex; gap: 4px; overflow-x: auto; scrollbar-width: none; background: rgba(20,22,22,.92); border-top: 1px solid rgba(201,162,92,.5); }
    #bando.th .th-list::-webkit-scrollbar { display: none; }
    #bando.th .th-it { flex: 0 0 calc((100% - 16px) / 5); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1px; min-width: 0; padding: 2px; border-radius: 8px; cursor: pointer;
      font: inherit; color: #f3efe2; background: rgba(255,255,255,.04); border: 1px solid rgba(201,162,92,.3); }
    #bando.th .th-it b { font-size: 12.5px; line-height: 1.15; text-align: center; }
    #bando.th .th-it small { font-size: 11px; color: #e8c27a; white-space: nowrap; }
    #bando.th .th-it .full { display: none; }
    #bando.th .th-it.here { border-color: #e8c27a; background: rgba(201,162,92,.2); }
    #bando.th .th-it.sel { border-color: #fff1c4; box-shadow: 0 0 10px rgba(255,220,130,.5); }
    #bando.th .th-it.locked { opacity: .55; }
    #bando.th .th-card { position: absolute; left: 0; right: 0; top: 0; bottom: var(--th-b); display: none; align-items: flex-end; justify-content: center; background: rgba(15,18,18,.25); }
    #bando.th .th-card.show { display: flex; pointer-events: auto; }
    #bando.th .th-here { margin-bottom: 10px; font-size: 14px; color: #9fe0bd; }
    #bando.th .th-hd { display: flex; flex-direction: column; min-width: 0; }
    #bando.th .th-hd b { line-height: 1.15; }
    @media (orientation: landscape) and (min-width: 900px) {
      #bando.th { --th-b: 0px; }
      #bando.th .th-stage { right: 320px; }
      #bando.th .th-side { left: auto; width: 320px; display: flex; flex-direction: column; pointer-events: auto; background: rgba(20,22,22,.94); border-left: 1px solid rgba(201,162,92,.55); }
      #bando.th .th-close { right: 330px; }
      #bando.th .th-card { position: static; display: block; background: none; }
      #bando.th .th-card:not(.show) { display: none; }
      #bando.th .th-sheet { width: 100%; max-height: none; border: 0; border-bottom: 1px solid rgba(201,162,92,.4); border-radius: 0; box-shadow: none; padding: 14px 16px; animation: none; }
      #bando.th .th-list { position: static; height: auto; flex: 1; display: flex; flex-direction: column; gap: 6px; padding: 12px; overflow-y: auto; background: none; border: 0; }
      #bando.th .th-it { flex: none; flex-direction: row; justify-content: space-between; padding: 12px 14px; }
      #bando.th .th-it b { font-size: 16px; text-align: left; }
      #bando.th .th-it small { font-size: 13px; }
      #bando.th .th-it .full { display: inline; } #bando.th .th-it .short { display: none; }
    }`;
  document.head.appendChild(st);
}
