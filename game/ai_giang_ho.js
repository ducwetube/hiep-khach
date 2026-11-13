/* =====================================================================
   ẢI GIANG HỒ (2026-11-12, người dùng chốt theo ảnh mẫu): nút Giang Hồ ở Trang chủ → bản đồ chương có 7 ải;
   bấm ải → danh sách tầng (tầng cao nhất ở trên); bấm cả ô tầng là đánh; nút tròn bên phải: chưa qua = Chiến, đã qua = Quét (ảnh game/img/icon/nut_{chien,quet}.png, người dùng chốt 2026-11-13).
   Mỗi ải 10 cửa (người dùng đổi 2026-11-13; trước là 3 / 4 / 5 / 6 / 7 / 8 / 10): 6 thường, 3 tinh anh (vị trí cố định khác nhau mỗi ải, aiElite), cửa 10 boss. Sao = 3 − số tướng chết (trận ở tran_doi.js, 3 đợt mỗi tầng).
   Claude đặt (chờ người dùng duyệt): tên chương / ải, tầng cuối mỗi ải là boss (10 Thể Lực, 3 lần / ngày), tầng thường 5 Thể Lực,
   Thể Lực tối đa 200, hồi 1 điểm mỗi 6 phút; trừ Thể Lực khi thắng (thua không mất); tầng mở khi đã qua tầng trước, ải mở khi qua hết ải trước;
   thưởng: bạc theo tầng; Quét = nhận thưởng như thắng 3 sao, tốn Thể Lực, không phải đánh.
   ===================================================================== */
const AI_CHUONG = [
  { name: 'Chương 1 · Đêm Trăng Máu', img: 'game/img/ai/chuong_1.jpg',
    mobs: ['son_tac_do', 'thao_khau', 'luu_manh', 'con_do', 'de_tu_that_sat', 'sat_thu'],
    // x, y: % trên tranh (dọc 1072 × 1920), theo 7 địa danh dọc con đường
    ai: [
      { name: 'Thảo Miếu Thôn', x: 78, y: 83, tang: 10, boss: 'son_tac_trai_chu' },
      { name: 'Trúc Lâm Trại', x: 22, y: 77, tang: 10, boss: 'con_do_dau_muc' },
      { name: 'Bến Đò Cổ', x: 66, y: 66, tang: 10, boss: 'son_tac_trai_chu' },
      { name: 'Thủy Liêm Động', x: 24, y: 52, tang: 10, boss: 'con_do_dau_muc' },
      { name: 'Phế Thành', x: 76, y: 38, tang: 10, boss: 'that_sat_huong_chu' },
      { name: 'Thất Sát Phân Đà', x: 24, y: 24, tang: 10, boss: 'that_sat_huong_chu' },
      { name: 'Thanh Vân Sơn Môn', x: 70, y: 10, tang: 10, boss: 'that_sat_huong_chu' },
    ],
  },
  // Map 2–5 (2026-11-13, người dùng yêu cầu; tên chương / ải, quái, boss Claude đặt, chờ duyệt; tranh nền mượn tranh bản đồ vùng cũ, chờ ảnh Gemini).
  // Chỉ khai báo tên ải + boss; vị trí ghim tự xếp chữ chi (aiAuto). Map 2, 3: 7 ải; map 4, 5: 9 ải; mỗi ải 10 cửa.
  { name: 'Chương 2 · Sa Mạc Man Hoang', img: 'game/img/ban_do/mh_doc.jpg',
    mobs: ['sa_tac_mh', 'huyet_no', 'de_tu_truong_sinh', 'huyet_anh_sat_thu', 'truong_sinh_ho_ve', 'huyet_luyen_dao_si'],
    ai: [['Hoàng Sa Cổ Đạo', 'sa_tac_dau_linh'], ['Lưu Sa Hải', 'sa_tac_dau_linh'], ['Ốc Đảo Chết', 'huyet_thi_tuong'], ['Tàn Thành Lâu Lan', 'huyet_thi_tuong'],
      ['Huyết Trì Ngoại Điện', 'truong_sinh_ho_phap'], ['Huyết Trì Nội Điện', 'truong_sinh_ho_phap'], ['Trường Sinh Đường', 'ngoc_duong_tu']] },
  { name: 'Chương 3 · Đầm Lầy Hiệp Xuyên', img: 'game/img/ban_do/hx_doc.jpg',
    mobs: ['doc_thi', 'de_tu_van_doc', 'doc_nu_van_doc', 'van_doc_ho_ve', 'luyen_co_su', 'huyet_no'],
    ai: [['Chướng Khí Lâm', 'van_doc_huong_chu'], ['Hắc Thủy Đầm', 'van_doc_huong_chu'], ['Bến Thuyền Mục', 'van_doc_huong_chu'], ['Vạn Độc Trại', 'van_doc_ho_phap'],
      ['Luyện Cổ Phòng', 'van_doc_ho_phap'], ['Độc Long Động', 'van_doc_ho_phap'], ['Vạn Độc Môn', 'van_doc_ho_phap']] },
  { name: 'Chương 4 · Thung Lũng Tiêu Dao', img: 'game/img/ban_do/td_doc.jpg',
    mobs: ['de_tu_hop_hoan', 'cam_nu', 'hop_hoan_thi_ve', 'mi_anh_sat_thu', 'thuy_mi', 'si_tinh'],
    ai: [['Đào Hoa Lâm', 'on_tuyen_thuy_mi'], ['Lạc Anh Kiều', 'on_tuyen_thuy_mi'], ['Ôn Tuyền Cốc', 'on_tuyen_thuy_mi'], ['Mê Hương Viên', 'me_am_huong_chu'], ['Tiêu Dao Lầu', 'me_am_huong_chu'],
      ['Cầm Âm Các', 'me_am_huong_chu'], ['Hợp Hoan Ngoại Điện', 'hop_hoan_ho_phap'], ['Hợp Hoan Nội Điện', 'hop_hoan_ho_phap'], ['Hợp Hoan Phái', 'hop_hoan_thanh_nu']] },
  { name: 'Chương 5 · Hồ Kỳ Sơn', img: 'game/img/ban_do/th_doc.jpg',
    mobs: ['ks_tu_si', 'ks_ma_tang', 'ks_de_tu_qvt', 'ks_cau_hon_su', 'ks_luyen_hon_su', 'ks_thuy_quy'],
    ai: [['Âm Phong Lĩnh', 'ks_thuy_quy_dau_linh'], ['Vong Hồn Than', 'ks_thuy_quy_dau_linh'], ['Quỷ Khốc Lâm', 'ks_thuy_quy_dau_linh'], ['U Minh Cốc', 'ks_phan_quan'], ['Câu Hồn Điện', 'ks_phan_quan'],
      ['Luyện Hồn Trì', 'ks_phan_quan'], ['Phong Ma Tế Đàn', 'ks_ho_phap'], ['Quỷ Vương Ngoại Điện', 'ks_ho_phap'], ['Quỷ Vương Tông', 'ks_ho_phap']] },
];
// chương khai báo gọn [tên, boss] -> đủ trường; ghim xếp chữ chi từ dưới lên
AI_CHUONG.forEach(C => { C.ai = C.ai.map((A, i, arr) => Array.isArray(A) ? { name: A[0], boss: A[1], tang: 10, x: i % 2 ? 26 : 72, y: Math.round(84 - i * 72 / (arr.length - 1)) } : A); });
// sức địch nhân theo chương (Claude đặt, chờ duyệt): mỗi chương gấp 2,5 lần chương trước; bạc gấp đôi
// Quái thường = 15 hiệp khách phẩm xanh (HK_XANH, mỗi chương một nhóm 2 hệ … trộn); tinh anh / boss = tướng thật (người dùng chốt 2026-11-14).
// AI_TUONG[c] = nhóm tướng của chương (Claude xếp theo nhóm truyện, chờ duyệt): boss ải a = nhóm[a % n], tinh anh thứ k của ải a = nhóm[(a + k + 1) % n].
const AI_TUONG = [
  ['doan_dien_khanh', 'nam_hai_ngac_than', 'diep_nhi_nuong', 'van_trung_hac', 'doan_du'],
  ['nham_nga_hanh', 'huong_van_thien', 'nham_doanh_doanh', 'lenh_ho_xung', 'dong_phuong'],
  ['ta_lanh_thien', 'mac_dai', 'thien_mon', 'dinh_nhan', 'nhac_bat_quan', 'to_tinh_ha'],
  ['dong_phuong', 'nham_nga_hanh', 'nhac_bat_quan', 'ta_lanh_thien', 'doan_dien_khanh', 'van_trung_hac', 'lenh_ho_xung', 'huong_van_thien', 'nam_hai_ngac_than'],
  ['dong_phuong', 'nhac_bat_quan', 'nham_nga_hanh', 'doan_dien_khanh', 'ta_lanh_thien', 'dinh_nhan', 'thien_mon', 'mac_dai', 'to_tinh_ha', 'doan_du', 'diep_nhi_nuong', 'nham_doanh_doanh'],
];
const aiMobs = () => HK_XANH.map(x => x[0]);
function aiTuong(c, a, t) {
  const G = AI_TUONG[c] || AI_TUONG[0];
  if (aiIsBoss(c, a, t)) return G[a % G.length];
  const k = aiElite(c, a).slice().sort((x, y) => x - y).indexOf(t);
  return k < 0 ? null : G[(a + k + 1) % G.length];
}
// Thưởng (người dùng 2026-11-14: cửa 1–2 game mẫu đã 1500–1800 bạc và lương thực, sau còn nhiều hơn): mỗi kẻ địch rơi aiLootV bạc + lương thực
// (boss / tinh anh ×4), một cửa ~7 kẻ => cửa 1 ≈ 1.600; mỗi cửa +5%, mỗi chương ×2. Quét = aiBac (ước lượng cả cửa).
const aiLootV = (c, a, t) => Math.round(125 * (1 + aiIdx(c, a, t) * 0.05) * Math.pow(2, c));
const AI_POW = [1, 2.5, 6, 15, 36];
const AI = { tlMax: 200, tlMin: 6, tlCost: 5, tlBoss: 10, bossPerDay: 3, bac: 60, expPerTL: 10,
  // địch cấp 1 của ải (đặt cho Đoàn Diên Khánh cấp 1 một mình qua được ải 1; mỗi tầng sau mạnh thêm 5%)
  mob: { hp: 430, atk: 160, def: 100, hoi: 70, spd: 40, mi: 100 } };

// Thể Lực: P.theLuc + P.tlAt (mốc thời gian đã tính hồi)
function aiTL() {
  if (P.theLuc == null) { P.theLuc = AI.tlMax; P.tlAt = Date.now(); }
  const step = AI.tlMin * 60000, now = Date.now();
  if (P.theLuc >= AI.tlMax) P.tlAt = now;
  else {
    const n = Math.floor((now - (P.tlAt || now)) / step);
    if (n > 0) { P.theLuc = Math.min(AI.tlMax, P.theLuc + n); P.tlAt = P.theLuc >= AI.tlMax ? now : P.tlAt + n * step; }
  }
  return P.theLuc;
}
function aiState() {
  if (!P.ai) P.ai = { stars: {}, day: '', used: {} };
  const d = new Date().toDateString();
  if (P.ai.day !== d) { P.ai.day = d; P.ai.used = {}; }
  return P.ai;
}
const aiKey = (c, a, t) => `${c}-${a}-${t}`;
const aiStar = (c, a, t) => aiState().stars[aiKey(c, a, t)] || 0;
function aiAiStars(c, a) { let n = 0; for (let t = 0; t < AI_CHUONG[c].ai[a].tang; t++) n += aiStar(c, a, t); return n; }
function aiAiDone(c, a) { for (let t = 0; t < AI_CHUONG[c].ai[a].tang; t++) if (!aiStar(c, a, t)) return false; return true; }
const aiAiOpen = (c, a) => a === 0 || aiAiDone(c, a - 1);
const aiTangOpen = (c, a, t) => aiAiOpen(c, a) && (t === 0 || aiStar(c, a, t - 1) > 0);
const aiIsBoss = (c, a, t) => t === AI_CHUONG[c].ai[a].tang - 1;
// Cửa tinh anh (người dùng chốt 2026-11-13): mỗi ải 10 cửa = 6 thường + 3 tinh anh + boss ở cửa 10; vị trí tinh anh "ngẫu nhiên" khác nhau mỗi ải
// nhưng cố định (bốc bằng dãy số giả ngẫu nhiên theo chương + ải, trong các cửa 2…9). Tinh anh tính như boss: 10 Thể Lực, 3 lần / ngày, rơi đá màu.
const AI_ELITE = {};
function aiElite(c, a) {
  const key = c + '-' + a;
  if (!AI_ELITE[key]) {
    let x = (c * 131 + a * 37 + 11) % 2147483647; const pool = [1, 2, 3, 4, 5, 6, 7, 8], out = [];
    while (out.length < 3) { x = (x * 48271 + 12345) % 2147483647; out.push(pool.splice(x % pool.length, 1)[0]); }
    AI_ELITE[key] = out;
  }
  return AI_ELITE[key];
}
const aiIsElite = (c, a, t) => aiElite(c, a).includes(t);
const aiSpec = (c, a, t) => aiIsBoss(c, a, t) || aiIsElite(c, a, t);
const aiCost = (c, a, t) => aiSpec(c, a, t) ? AI.tlBoss : AI.tlCost;
const aiLeft = (c, a, t) => aiSpec(c, a, t) ? AI.bossPerDay - (aiState().used[aiKey(c, a, t)] || 0) : Infinity;
// số thứ tự tầng trong cả chương (0…42) để tăng sức địch
function aiIdx(c, a, t) { let n = 0; for (let i = 0; i < a; i++) n += AI_CHUONG[c].ai[i].tang; return n + t; }
// Đồ rơi theo tầng (người dùng chốt 2026-11-13 theo ảnh mẫu: đồ chỉ ở một số tầng của chương 1, mỗi tầng một món cố định, hiện hình trên dòng tầng).
// Chỉ rơi đồ bậc 1 (Xám), bậc cao do nâng cấp (trang_chu.js DO_*). Claude đặt, chờ duyệt: tầng thường thứ 1, 2 của mỗi 3 tầng có đồ,
// lần lượt Vũ khí → Mũ → Giáp → Đai; tầng boss không rơi đồ; thắng / quét tầng đó 30% ra món đồ.
const AI_DO = { rate: 0.3 };
function aiDo(c, a, t) {
  if (c !== 0 || aiSpec(c, a, t)) return null;   // chỉ chương 1, chỉ cửa thường (tinh anh + boss rơi đá màu)
  let n = a * 6;   // số cửa thường trước đó trong chương (mỗi ải 6 cửa thường)
  for (let i = 0; i < t; i++) if (!aiSpec(c, a, i)) n++;
  return DO_SLOTS[n % 4].k;   // 4 ô đầu (Vũ khí, Mũ, Giáp, Đai); giày kiếm riêng
}
function aiDoRoll(c, a, t) {
  const k = aiDo(c, a, t); if (!k || Math.random() >= AI_DO.rate) return '';
  doAdd(k, 1);
  return `${doSlot(k).loai} ${DO_TIERS[0].name}`;
}
// Đá màu thăng bậc (người dùng chốt 2026-11-13): mỗi chương một loại, chỉ rơi ở tầng boss (và tinh anh khi có). Claude đặt: mỗi lần thắng / quét boss 1 viên.
const AI_DA = ['luc', 'lam', 'tim', 'cam', 'vang'];
function aiDaBoss(c, a, t) { const k = AI_DA[c]; if (!k || !aiSpec(c, a, t)) return ''; doDa()[k]++; return DO_DA[k]; }
function aiBac(c, a, t) { return Math.round(aiLootV(c, a, t) * (aiSpec(c, a, t) ? 17 : 13)); }   // 13 kẻ mỗi cửa thường; cửa đặc biệt 14 kẻ, một kẻ rơi ×4

/* ---------- bản đồ chương ---------- */
let aiCur = 0;
function aiMap(c) {
  if (!P) return renderTitle();
  if (c != null) aiCur = c;
  const C = AI_CHUONG[aiCur];
  closeModalSilent(); aiStyle(); homeStyle(); homeNoDrag();
  const tb = el('topbar'); if (tb) tb.classList.add('hidden');
  const pins = C.ai.map((A, a) => {
    const open = aiAiOpen(aiCur, a), st = aiAiStars(aiCur, a), max = A.tang * 3;
    return `<button class="am-pin ${open ? '' : 'lock'} ${A.x > 50 ? 'r' : ''}" style="left:${A.x}%;top:${A.y}%" onclick="G.aiList(${a})">
      <span class="am-ic">${homePng('mode_pve')}</span>
      <span class="am-tx"><b>${A.name}</b><em><i class="am-st"></i>${open ? `${st}/${max}` : 'Chưa mở'}</em></span>
    </button>`;
  }).join('');
  show(`<div class="am">
    <img class="am-bg" src="${C.img}" alt="">
    <button class="am-back" onclick="G.home()">Trở về</button>
    <span class="am-tl">Thể lực ${aiTL()}/${AI.tlMax}</span>
    ${pins}
    <div class="am-title"><button class="am-next am-prev ${aiCur > 0 ? '' : 'off'}" onclick="G.aiPrev()">&laquo;</button><b>${C.name}</b><button class="am-next ${AI_CHUONG[aiCur + 1] ? '' : 'off'}" onclick="G.aiNext()">&raquo;</button></div>
  </div>`, 'ai-map-' + aiCur);
}
function aiPrev() { if (aiCur > 0) aiMap(aiCur - 1); }
function aiNext() {
  if (AI_CHUONG[aiCur + 1] && aiAiDone(aiCur, AI_CHUONG[aiCur].ai.length - 1)) return aiMap(aiCur + 1);
  toast(AI_CHUONG[aiCur + 1] ? 'Vượt hết ải chương này để mở chương sau' : 'Chương sau sắp mở');
}

/* ---------- danh sách tầng của một ải ---------- */
let aiSel = 0;
function aiList(a) {
  if (a != null) aiSel = a;
  const c = aiCur, A = AI_CHUONG[c].ai[aiSel];
  if (!aiAiOpen(c, aiSel)) return toast('Vượt hết ải trước để mở ải này');
  closeModalSilent(); aiStyle(); homeStyle(); homeNoDrag();
  const rows = [];
  for (let t = A.tang - 1; t >= 0; t--) {
    const open = aiTangOpen(c, aiSel, t), st = aiStar(c, aiSel, t), boss = aiIsBoss(c, aiSel, t), tinh = aiIsElite(c, aiSel, t);
    const face = aiTuong(c, aiSel, t) || aiMobs()[(aiSel * 3 + t) % 15], FH = HIEP_KHACH[face];
    const left = aiLeft(c, aiSel, t);
    // bấm cả ô tầng là vào đánh; nút tròn bên phải: chưa qua = Chiến, đã qua = Quét (người dùng chốt 2026-11-13, theo ảnh mẫu)
    const btn = !open ? '<span class="al-lock">Chưa mở</span>'
      : st ? `<button class="al-rb" onclick="event.stopPropagation();G.aiSweep(${t})"><img src="game/img/icon/nut_quet.png" alt="Quét"></button>`
      : `<button class="al-rb" onclick="event.stopPropagation();G.aiFight(${t})"><img src="game/img/icon/nut_chien.png" alt="Chiến"></button>`;
    rows.push(`<div class="al-row ${open ? '' : 'lock'} ${boss ? 'boss' : tinh ? 'tinh' : ''}" ${open ? `onclick="G.aiFight(${t})"` : ''}>
      <span class="al-face">${typeof tdPortrait === 'function' ? tdPortrait(FH.img, FH.art, FH.face) : ''}</span>
      <div class="al-head"><b>${boss || tinh ? FH.name : A.name + ' ' + (t + 1)}${tinh ? ' <i class="al-tag">Tinh Anh</i>' : boss ? ' <i class="al-tag b">Boss</i>' : ''}</b>${boss || tinh ? `<em>Còn <big>${Math.max(0, left)}</big> lần</em>` : ''}</div>
      <div class="al-body">
        <div class="al-mid">
          <span class="al-tl">Thể Lực: ${aiCost(c, aiSel, t)}</span>
          <span class="al-sr"><span class="al-stars">${[0, 1, 2].map(k => `<i class="${k < st ? 'on' : ''}"></i>`).join('')}</span>${(dk => dk ? `<span class="al-do" style="--dc:${DO_TIERS[0].color}">[[${doIcon(doSlot(dk), 1)}]]</span>` : '')(aiDo(c, aiSel, t))}${(boss || tinh) && AI_DA[c] ? `<span class="al-do" style="--dc:#5a8a4a">[[da_${AI_DA[c]}]]</span>` : ''}</span>
        </div>
        ${btn}
      </div>
    </div>`);
  }
  show(`<div class="home al">
    <div class="hm-bg al-bg" style="background-image:linear-gradient(#0009,#000b),url(${AI_CHUONG[c].img})"></div>
    ${homeHead()}
    <div class="al-bar"><button class="al-back" onclick="G.aiMap()">Trở về</button><b>${A.name}</b><button class="al-back" onclick="G.home()">Trang Chủ</button></div>
    <div class="al-list hd-scroll">${rows.join('')}</div>
  </div>`, 'ai-list-' + c + '-' + aiSel);
}
function aiCheck(t) {
  const c = aiCur, a = aiSel;
  if (!aiTangOpen(c, a, t)) { toast('Chưa mở'); return false; }
  if (aiLeft(c, a, t) <= 0) { toast('Hôm nay đã hết lượt đánh tầng này'); return false; }
  if (aiTL() < aiCost(c, a, t)) { toast('Không đủ Thể Lực'); return false; }
  return true;
}
function aiFight(t) {
  if (!aiCheck(t)) return;
  const c = aiCur, a = aiSel, A = AI_CHUONG[c].ai[a], g = aiIdx(c, a, t), boss = aiIsBoss(c, a, t), tinh = aiIsElite(c, a, t);
  tdStart({
    name: `${A.name} ${t + 1}`, mobs: aiMobs(), boss: aiTuong(c, a, t), lootV: aiLootV(c, a, t),
    mob: AI.mob, waveN: boss || tinh ? [4, 5, 5] : [4, 4, 5]   /* người dùng chốt 2026-11-14: cửa nào cũng 4–5 địch mỗi đợt */, pow: (1 + g * 0.03) * (AI_POW[c] || 1), bossHp: tinh ? 2 : 3, bossAtk: tinh ? 1.2 : 1.4,   // 70 cửa: mỗi cửa +3%; tinh anh = một kẻ địch máu ×2, công ×1,2 ở đợt cuối
    onEnd(win, stars) {
      if (!win) return;
      const S = aiState(), k = aiKey(c, a, t);
      S.stars[k] = Math.max(S.stars[k] || 0, stars);
      if (boss) S.used[k] = (S.used[k] || 0) + 1;
      aiTL(); P.theLuc -= aiCost(c, a, t);
      P.lieu = (P.lieu || 0) + (boss ? 2 : 1); // hiệp khách nguyên liệu để tăng cấp (tang_cap.js)
      gainExp(aiCost(c, a, t) * AI.expPerTL); // kinh nghiệm nhân vật = Thể Lực tốn × 10 (Claude đặt)
      const roi = [aiDoRoll(c, a, t), aiDaBoss(c, a, t)].filter(Boolean).join(', '); if (roi) setTimeout(() => toast('Nhận ' + roi), 400);
    },
    back: () => aiList(a), retry: () => aiFight(t),
  });
}
function aiSweep(t) {
  const c = aiCur, a = aiSel;
  if (aiStar(c, a, t) < 3) return toast('Cần qua 3 sao mới quét được');
  if (!aiCheck(t)) return;
  aiTL(); P.theLuc -= aiCost(c, a, t);
  if (aiSpec(c, a, t)) { const S = aiState(), k = aiKey(c, a, t); S.used[k] = (S.used[k] || 0) + 1; }
  const bac = aiBac(c, a, t);
  P.gold += bac; P.luongThuc = (P.luongThuc || 0) + bac; P.lieu = (P.lieu || 0) + (aiSpec(c, a, t) ? 2 : 1); gainExp(aiCost(c, a, t) * AI.expPerTL);
  if (typeof saveGame === 'function') saveGame();
  const da = Math.random() < 0.4 ? 1 : 0; if (da) doDa().huyen += da;
  const roi = [aiDoRoll(c, a, t), aiDaBoss(c, a, t), da ? 'Huyền Thạch' : ''].filter(Boolean).join(', ');
  toast(`Quét xong: +${bac} bạc, +${bac} lương thực, +${aiSpec(c, a, t) ? 2 : 1} Tân Binh${roi ? ', ' + roi : ''}`);
  aiList(a);
}

function aiStyle() {
  if (document.getElementById('ai-style')) return;
  const st = document.createElement('style');
  st.id = 'ai-style';
  st.textContent = `
  .am { box-sizing: border-box; container-type: inline-size; position: fixed; inset: 0; margin: 0 auto; overflow: hidden; background: #1a2a1a; color: #fff; }
  @media (min-width: 600px) { .am { max-width: 480px; } }
  .am button { font: inherit; color: inherit; background: none; border: 0; padding: 0; cursor: pointer; }
  .am-bg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: 50% 30%; }
  .am-back, .al-back { padding: 2cqw 4cqw; border-radius: 2.4cqw !important; font: 4.6cqw 'Pattaya', serif !important; color: #fff !important; background: linear-gradient(#5fbf4a, #2a7a22) !important; border: .6cqw solid #c9e08a !important; box-shadow: 0 .6cqw 1cqw #0008; text-shadow: 0 .3cqw 0 #1a4a10; white-space: nowrap; }
  .am-back { position: absolute; left: 4cqw; top: calc(4cqw + env(safe-area-inset-top)); z-index: 5; }
  .am-tl { position: absolute; right: 4cqw; top: calc(5cqw + env(safe-area-inset-top)); z-index: 5; padding: 1.4cqw 3cqw; border-radius: 3cqw; background: #000a; font-size: 3.6cqw; font-weight: 800; color: #ffe39a; }
  .am-pin { position: absolute; z-index: 3; display: flex; align-items: center; transform: translate(-30%, -50%); }
  .am-pin.r { flex-direction: row-reverse; transform: translate(-70%, -50%); }
  .am-pin.r .am-tx { align-items: flex-end; margin: 0 -3cqw 0 0; border-radius: 3cqw 0 0 3cqw; background: linear-gradient(270deg, #000c, #0006 80%, #0000); }
  .am-ic { width: 13cqw; height: 13cqw; flex: none; filter: drop-shadow(0 .5cqw .8cqw #000a); position: relative; z-index: 1; }
  .am-ic img { width: 100%; height: 100%; object-fit: contain; }
  .am-tx { display: flex; flex-direction: column; align-items: flex-start; margin-left: -3cqw; padding: .8cqw 4cqw .8cqw 4cqw; border-radius: 0 3cqw 3cqw 0; background: linear-gradient(90deg, #000c, #0006 80%, #0000); }
  .am-tx b { font-size: 4cqw; font-weight: 800; white-space: nowrap; text-shadow: 0 .3cqw 0 #000, 0 0 .6cqw #000; }
  .am-tx em { white-space: nowrap; display: flex; align-items: center; gap: 1cqw; font-style: normal; font-size: 4cqw; font-weight: 800; color: #fff4d0; }
  .am-st, .al-stars i { display: inline-block; width: 4.4cqw; height: 4.4cqw; background: #ffd43b; clip-path: polygon(50% 0, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%); }
  .am-pin.lock { filter: grayscale(.9) brightness(.7); }
  .am-title { position: absolute; left: 0; right: 0; bottom: 0; z-index: 4; display: flex; align-items: center; justify-content: center; padding: 3cqw 4cqw calc(3cqw + env(safe-area-inset-bottom)); background: linear-gradient(#0000, #000b 40%); }
  .am-title b { padding: 0 9cqw; text-align: center; white-space: nowrap; font-size: 4.8cqw; font-weight: 800; text-shadow: 0 .3cqw 0 #000, 0 0 1cqw #000; }
  .am-next { position: absolute; right: 4cqw; font-size: 9cqw !important; line-height: 1; color: #ddd !important; }
  .am-prev { right: auto; left: 4cqw; }
  .am-next.off { opacity: .35; }
  .home.al { padding-bottom: env(safe-area-inset-bottom); }
  .al-bar { display: flex; align-items: center; gap: 2cqw; padding: 2.5cqw 2cqw; }
  .al-bar b { flex: 1; font-size: 6cqw; font-weight: 800; text-shadow: 0 .3cqw 0 #000, 0 0 1cqw #000; }
  .al-list { flex: 1; min-height: 0; overflow-y: auto; padding: 1cqw 2cqw 6cqw 4cqw; }
  .al-row { position: relative; margin: 0 0 3.4cqw 9cqw; border-radius: 1.6cqw; background: linear-gradient(#2a5a9a, #12305a); border: .5cqw solid #a8b8c8; box-shadow: 0 .6cqw 1.2cqw #0008; cursor: pointer; }
  .al-row.boss { background: linear-gradient(#2a5a9a, #12305a); border-color: #e8c35a; }
  .al-row.tinh { border-color: #c08aff; } .al-row.tinh .al-face { border-color: #c08aff; box-shadow: 0 0 1.4cqw #c08aff88, 0 .4cqw 1cqw #000a; }
  .al-tag { position: absolute; z-index: 3; left: -8cqw; bottom: -1.6cqw; width: 20cqw; text-align: center; white-space: nowrap; font-style: normal; font-size: 3cqw; font-weight: 800; padding: .3cqw 0; border-radius: 1cqw; background: #7a3ab8; border: .3cqw solid #e0c8ff; text-shadow: none; } .al-tag.b { background: #b8862a; }
  .al-row.lock { filter: grayscale(.8) brightness(.6); cursor: default; }
  .al-face { position: absolute; z-index: 2; left: -9cqw; top: 50%; transform: translateY(-50%); width: 22cqw; height: 22cqw; border-radius: 50%; overflow: hidden; background: #3a2a1a; border: .8cqw solid #8a7a6a; box-shadow: 0 .4cqw 1cqw #000a; }
  .al-row.boss .al-face { border-color: #e8c35a; box-shadow: 0 0 1.6cqw #e8c35a99, 0 .4cqw 1cqw #000a; }
  .al-face img { width: 100%; }
  .al-head { display: flex; align-items: center; justify-content: space-between; gap: 2cqw; padding: 1.2cqw 3cqw 1.2cqw 16cqw; border-radius: 1.2cqw 1.2cqw 0 0; background: linear-gradient(90deg, #0a1428 0%, #1a3050cc 55%, #4a78b0aa 100%); border-bottom: .3cqw solid #ffffff22; }
  .al-head b { flex: 1; min-width: 0; overflow: hidden; display: flex; align-items: center; font-size: 4.2cqw; font-weight: 800; white-space: nowrap; text-shadow: 0 .3cqw 0 #000; }
  .al-head em { flex: none; font-style: normal; font-size: 3.4cqw; font-weight: 700; color: #fff4d0; white-space: nowrap; text-shadow: 0 .3cqw 0 #000; }
  .al-head big { font-size: 4.4cqw; color: #fff; margin: 0 .6cqw; }
  .al-body { display: flex; align-items: center; min-height: 19cqw; padding: 1cqw 2cqw 1cqw 16cqw; }
  .al-mid { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 1.2cqw; }
  .al-tl { font-size: 4.4cqw; font-weight: 700; color: #fff4d0; text-shadow: 0 .3cqw 0 #000; }
  .al-sr { display: flex; align-items: center; height: 8cqw; }
  .al-do { display: inline-grid; place-items: center; width: 11cqw; height: 11cqw; margin-left: 3cqw; border-radius: 1cqw; border: .4cqw solid var(--dc); background: #1e1812; }
  .al-do svg, .al-do .ic { width: 88%; height: 88%; }
  .al-stars { display: flex; gap: 1.2cqw; }
  .al-stars i { width: 6cqw; height: 6cqw; background: #3a3a4a; }
  .al-stars i.on { background: #ffd43b; }
  .al-rb { flex: none; width: 21cqw; height: 21cqw; border-radius: 50% !important; filter: drop-shadow(0 .6cqw .8cqw #000a); }
  .al-rb img { width: 100%; height: 100%; display: block; }
  .al-rb:active { transform: scale(.94); }
  .al-lock { flex: none; width: 21cqw; text-align: center; font-size: 3.8cqw; color: #ccc; }
  `;
  document.head.appendChild(st);
}
const AI_G = { aiMap, aiNext, aiPrev, aiList, aiFight, aiSweep };
