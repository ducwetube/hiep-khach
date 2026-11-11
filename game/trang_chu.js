/* =====================================================================
   TRANG CHỦ (2026-11-12, người dùng chốt: chuyển sang game xếp đội, xây từng phần; phần này = màn chính sau khi vào game)
   Bố cục học theo màn chính của game xếp đội người dùng gửi làm mẫu (thanh trên, hàng đội hình, ba nút lớn, hàng chức năng,
   thanh dưới) nhưng mang màu, hình, tên của game này. Chưa có hệ đội hình / chiêu mộ thật: hàng đội hình là đội mẫu,
   các nút chưa có chức năng hiện "Sắp mở". Nút nối vào những gì game đã có (bản đồ, tháp, thí luyện, cấm địa, đồ, võ học...).
   Engine: continueGame / startNew vào renderHome; renderTop ẩn thanh trên khi đang ở trang chủ (screenKey 'home').
   ===================================================================== */
// Đội mẫu (5 ô) cho tới khi có hệ hiệp khách thật; hình chibi cao thủ có sẵn trong game
const HOME_TEAM = [
  { name: 'Lãnh Nguyệt', img: 'tm_nu_kiem_lam', role: 'cong_kich', q: 3, lv: 1, star: 2, hanh: 'thuy', tuChat: 14,
    st: { hp: 2030, atk: 2034, def: 1297, hoi: 401, spd: 51, mi: 100 },
    skill: { grade: 'S', name: 'Cửu Kiếm Quyết', desc: 'Tấn công toàn địch và tăng Chuẩn toàn đội 2 hiệp' },
    duyen: [{ name: 'Sư Đồ', desc: 'Cùng ra trận Thủ +250%', with: [3], ok: true }, { name: 'Đồng Môn', desc: 'Cùng ra trận Công +15%', with: [1, 4], ok: false }] },
  { name: 'Hàn Sơn', img: 'tm_cuong_khach', role: 'ho_ve', q: 2, lv: 1, star: 1, hanh: 'tho', tuChat: 12,
    st: { hp: 4120, atk: 980, def: 2210, hoi: 350, spd: 38, mi: 300 },
    skill: { grade: 'A', name: 'Thiết Bích Quyết', desc: 'Khiêu khích toàn địch, giảm 30% sát thương nhận 2 hiệp' },
    duyen: [{ name: 'Huynh Đệ', desc: 'Cùng ra trận Khí huyết +20%', with: [0], ok: true }] },
  { name: 'Thanh Liên', img: 'tm_bach_lien_nu', role: 'tri_lieu', q: 3, lv: 1, star: 1, hanh: 'moc', tuChat: 13,
    st: { hp: 2450, atk: 1120, def: 1180, hoi: 860, spd: 46, mi: 80 },
    skill: { grade: 'S', name: 'Thanh Liên Hóa Vũ', desc: 'Hồi khí huyết toàn đội, giải hiệu ứng xấu' },
    duyen: [{ name: 'Tri Kỷ', desc: 'Cùng ra trận Hồi +20%', with: [4], ok: true }] },
  { name: 'Mộ Thanh', img: 'tm_thanh_kiem', role: 'ky_nang', q: 4, lv: 1, star: 1, hanh: 'kim', tuChat: 15,
    st: { hp: 2280, atk: 1890, def: 1240, hoi: 420, spd: 60, mi: 120 },
    skill: { grade: 'SS', name: 'Thái Cực Kiếm Ý', desc: 'Mỗi hiệp ra chiêu, choáng 1 kẻ địch ngẫu nhiên' },
    duyen: [{ name: 'Sư Đồ', desc: 'Cùng ra trận Thủ +250%', with: [0], ok: true }] },
  { name: 'Hoàng Y Nữ', img: 'tm_hoang_y_kiem_nu', role: 'ho_tro', q: 2, lv: 1, star: 1, hanh: 'hoa', tuChat: 11,
    st: { hp: 2100, atk: 1350, def: 1100, hoi: 500, spd: 55, mi: 90 },
    skill: { grade: 'A', name: 'Phượng Minh Khúc', desc: 'Tăng 20% Công toàn đội 2 hiệp' },
    duyen: [{ name: 'Tri Kỷ', desc: 'Cùng ra trận Hồi +20%', with: [2], ok: true }] },
];
const HOME_Q = ['', 'thuong', 'hiem', 'tuyet', 'truyen']; // màu khung theo phẩm cấp (tạm)

const homePng = n => `<img src="game/img/icon/${n}.png" alt="" draggable="false">`;
// Lực chiến: một con số tổng sức mạnh (tạm tính từ chỉ số nhân vật hiện tại; có đội thật thì cộng cả đội)
function lucChien() {
  if (!P) return 0;
  const s = getStats();
  return Math.round(s.hp * 0.2 + s.mp * 0.1 + s.atk * 3 + s.def * 2 + s.spd * 4 + ((s.crit || 0) + (s.dodge || 0)) * 20);
}
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
  combat = null;
  closeModalSilent();
  homeStyle();
  homeNoDrag();
  const tb = el('topbar'); if (tb) tb.classList.add('hidden');
  if (hasSnd()) SND.music('village');
  const cards = HOME_TEAM.map((h, i) => `<button class="hm-card q-${HOME_Q[h.q]}" onclick="G.heroView(${i})" aria-label="${h.name}">
      <img src="game/img/quai/${h.img}.png" alt="" draggable="false">
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
    ['G.heroView(0)', homePng('cn_doi_ngu'), 'Đội Ngũ'],
    ["G.homeSoon('Tăng cấp')", homePng('cn_tang_cap'), 'Tăng Cấp'],
    ["G.menuChar('gear')", homePng('cn_trang_bi'), 'Trang Bị'],
    ["G.homeSoon('Bảo vật')", homePng('cn_bao_vat'), 'Bảo Vật'],
    ['G.menuInv()', homePng('cn_tui_do'), 'Túi Đồ'],
  ].map(([f, ic, t]) => `<button class="hm-f" onclick="${f}"><span class="hm-ic">${ic}</span><b>${t}</b></button>`).join('');
  // Thanh dưới: icon ảnh Gemini nav_<mã>.png (2026-11-12), 5 ô (Hệ Thống mở bằng bảng tên trên cùng)
  const nav = [
    ['', 'trang_chu', 'Trang Chủ', true],
    ['G.heroView(0)', 'hiep_khach', 'Hiệp Khách'],
    ["G.homeSoon('Chiêu mộ')", 'chieu_mo', 'Chiêu Mộ'],
    ["G.homeSoon('Kỳ ngộ')", 'ky_ngo', 'Kỳ Ngộ'],
    ['G.homeShops()', 'cua_tiem', 'Cửa Tiệm'],
  ].map(([f, ic, t, on]) => `<button class="${on ? 'on' : ''}" ${f ? `onclick="${f}"` : ''}><span class="hm-ic">${homePng('nav_' + ic)}</span><b>${t}</b></button>`).join('');
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
   Số liệu đang là đội mẫu HOME_TEAM; Nâng Cấp, Bảo Vật, Trang bị, Linh chưa có chức năng. */
let heroSel = 0;
function heroView(i) {
  if (!P) return renderTitle();
  heroSel = Math.max(0, Math.min(HOME_TEAM.length - 1, i | 0));
  const h = HOME_TEAM[heroSel], R = HERO_ROLES[h.role] || {}, H = NGU_HANH[h.hanh] || { name: '?', color: '#888' };
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
  const sts = ST.map(([k, t]) => `<span><small>${t}</small><b>${(h.st[k] || 0).toLocaleString('vi-VN')}</b></span>`).join('');
  const ava = j => { const o = HOME_TEAM[j]; return o ? `<button class="hd-ava" onclick="G.heroView(${j})" title="${o.name}"><img src="game/img/quai/${o.img}.png" alt="" draggable="false"></button>` : ''; };
  const duyen = (h.duyen || []).map(d => `<div class="hd-bar hd-duyen"><b>Duyên: ${d.name}</b><span>${d.desc}</span><em class="${d.ok ? 'ok' : ''}">${d.ok ? 'Đạt' : 'Chưa đạt'}</em></div>
    <div class="hd-avas">${ava(heroSel)}${(d.with || []).map(ava).join('')}</div>`).join('');
  show(`<div class="home hd">
    <div class="hm-bg"></div>
    ${homeHead()}
    <div class="hd-scroll">
      <div class="hd-body">
        <button class="hd-back" style="${box(18, 395, 257, 90)}" onclick="G.home()">Trở về</button>
        <div class="hd-lv" style="${box(420, 400, 380, 80)}"><span class="hd-stars">${stars}</span><b>Lv ${h.lv}</b></div>
        <button class="hd-up" style="${box(812, 395, 285, 90)}" onclick="G.homeSoon('Nâng cấp')">${homePng('lo_ren')}<b>Nâng Cấp</b></button>
        <div class="hd-name" style="${box(338, 480, 464, 68)}"><i class="hd-hanh" style="--hc:${H.color}" title="Ngũ hành: ${H.name}">${H.name}</i><b>${h.name}</b></div>
        <div class="hd-tu" style="${box(60, 500, 270, 55)}">Tư chất: ${h.tuChat}</div>
        <div class="hd-role" style="${box(60, 562, 270, 60)}"><img src="game/img/icon/loai_${h.role}.png" alt="" draggable="false"><b style="color:${R.color || '#fff'}">${R.name || ''}</b></div>
        ${bao}
        <div class="hd-art q-${HOME_Q[h.q]}" style="${box(360, 620, 440, 690, true)}"><img src="game/img/quai/${h.img}.png" alt="" draggable="false"></div>
        ${eq}
        <div class="hd-power" style="${box(362, 1338, 436, 74)}"><span>Chiến Lực:</span><b>${Object.values(h.st).reduce((a, b) => a + b, 0).toLocaleString('vi-VN')}</b></div>
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
  .hd-name b { flex: 1; text-align: center; font-size: 4.4cqw; font-weight: 800; color: #fff4d0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
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
  .hd-avas { display: flex; gap: .4cqw; margin: 1.2cqw 7.3cqw 0; }
  .hd-ava { width: 12.5cqw; height: 12.5cqw; border-radius: 1.2cqw !important; overflow: hidden; background: #2a2018 !important; border: .5cqw solid #9a7a4a !important; }
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
