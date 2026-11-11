/* =====================================================================
   TRANG CHỦ (2026-11-12, người dùng chốt: chuyển sang game xếp đội, xây từng phần; phần này = màn chính sau khi vào game)
   Bố cục học theo màn chính của game xếp đội người dùng gửi làm mẫu (thanh trên, hàng đội hình, ba nút lớn, hàng chức năng,
   thanh dưới) nhưng mang màu, hình, tên của game này. Chưa có hệ đội hình / chiêu mộ thật: hàng đội hình là đội mẫu,
   các nút chưa có chức năng hiện "Sắp mở". Nút nối vào những gì game đã có (bản đồ, tháp, thí luyện, cấm địa, đồ, võ học...).
   Engine: continueGame / startNew vào renderHome; renderTop ẩn thanh trên khi đang ở trang chủ (screenKey 'home').
   ===================================================================== */
// Đội mẫu (5 ô) cho tới khi có hệ hiệp khách thật; hình chibi cao thủ có sẵn trong game
const HOME_TEAM = [
  { name: 'Lãnh Nguyệt', img: 'tm_nu_kiem_lam', role: 'Tấn công', q: 3, lv: 1, star: 2 },
  { name: 'Hàn Sơn', img: 'tm_cuong_khach', role: 'Thủ', q: 2, lv: 1, star: 1 },
  { name: 'Thanh Liên', img: 'tm_bach_lien_nu', role: 'Hỗ trợ', q: 3, lv: 1, star: 1 },
  { name: 'Mộ Thanh', img: 'tm_thanh_kiem', role: 'Kỹ năng', q: 4, lv: 1, star: 1 },
  { name: 'Hoàng Y Nữ', img: 'tm_hoang_y_kiem_nu', role: 'Tấn công', q: 2, lv: 1, star: 1 },
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

function renderHome() {
  if (!P) return renderTitle();
  combat = null;
  closeModalSilent();
  homeStyle();
  const tb = el('topbar'); if (tb) tb.classList.add('hidden');
  if (hasSnd()) SND.music('village');
  const need = expNeed(P.lv), pct = P.lv >= MAX_LV ? 100 : Math.min(100, P.exp / need * 100);
  const herbs = invCount('vo_danh_thao') + invCount('nhan_sam') + invCount('tuyet_lien_km');
  const srv = typeof curServer !== 'undefined' ? 'S' + curServer : 'S1';
  const cards = HOME_TEAM.map(h => `<button class="hm-card q-${HOME_Q[h.q]}" onclick="G.homeTeam()" aria-label="${h.name}">
      <img src="game/img/quai/${h.img}.png" alt="" draggable="false">
      <span class="hm-band"><span class="hm-lv">${h.lv}</span><span class="hm-star">${'<i></i>'.repeat(h.star)}</span></span></button>`).join('');
  // Hàng nút nhanh: 6 ô, ô thứ 4 là bóng thoại (icon tạm)
  const quick = [
    ['G.menuQuests()', homePng('nhiem_vu'), 'Nhiệm Vụ'],
    ["G.homeSoon('Hộp thư')", '[[dam_may]]', 'Hộp Thư'],
    ['G.homeDaily()', homePng('thi_luyen'), 'Sự Kiện'],
    null,
    ['G.beQuan()', '[[ruong]]', 'Bế Quan'],
    ['G.banDo()', homePng('thien_ha'), 'Thiên Hạ'],
  ].map(x => x ? `<button class="hm-q" onclick="${x[0]}"><span class="hm-ic">${x[1]}</span><b>${x[2]}</b></button>`
    : `<button class="hm-q hm-chat" onclick="G.vungLog()"><span>Nhật Ký</span></button>`).join('');
  // Dải chức năng: cuộn ngang, mũi tên bên phải cuộn tiếp
  const funcs = [
    ['G.homeTeam()', homePng('chinh_dien'), 'Đội Ngũ'],
    ['G.menuSkills()', homePng('vo_hoc'), 'Võ Học'],
    ["G.menuChar('gear')", homePng('trang_bi'), 'Trang Bị'],
    ['G.menuInv()', homePng('hanh_trang'), 'Hành Trang'],
    ["G.openShop('tho_ren_dc')", homePng('lo_ren'), 'Lò Rèn'],
    ["G.menuChar('km')", '[[noi_cong]]', 'Kinh Mạch'],
    ['G.menuChar()', menuIc('nhan_vat'), 'Nhân Vật'],
  ].map(([f, ic, t]) => `<button class="hm-f" onclick="${f}"><span class="hm-ic">${ic}</span><b>${t}</b></button>`).join('');
  const nav = [
    ['', homePng('chinh_dien'), 'Trang Chủ', true],
    ['G.homeTeam()', menuIc('nhan_vat'), 'Hiệp Khách'],
    ["G.homeSoon('Chiêu mộ')", homePng('truy_na'), 'Chiêu Mộ'],
    ["G.homeSoon('Kỳ ngộ')", homePng('tu_dong'), 'Kỳ Ngộ'],
    ['G.homeShops()', homePng('tiem_vu_khi'), 'Cửa Tiệm'],
    ['G.menuSystem()', homePng('he_thong'), 'Hệ Thống'],
  ].map(([f, ic, t, on]) => `<button class="${on ? 'on' : ''}" ${f ? `onclick="${f}"` : ''}><span class="hm-ic">${ic}</span><b>${t}</b></button>`).join('');
  const last = (worldLog[worldLog.length - 1] || '').replace(/<[^>]+>/g, '').replace(/\[\[[a-z0-9_]+\]\]/g, '');
  show(`<div class="home">
    <div class="hm-bg"></div>
    <header class="hm-top">
      <span class="hm-tl">[${srv}] [Cấp ${P.lv}]</span>
      <button class="hm-plaque" onclick="G.menuChar()"><b>${esc(P.name)}</b></button>
      <span class="hm-tr">${sectName(P.sect)}</span>
    </header>
    <div class="hm-xp"><small>Kinh nghiệm</small><div class="hm-exp"><i style="width:${pct.toFixed(1)}%"></i></div></div>
    <div class="hm-res">
      <div class="hm-col left"><span>[[bac]]<b>${P.gold.toLocaleString('vi-VN')}</b></span><span>${homePng('manh_vo_so')}<b>${invCount('manh_vo_so')}</b></span></div>
      <div class="hm-power"><small>Lực Chiến</small><div class="hm-arc">Cấp ${P.lv}</div><b>${lucChien().toLocaleString('vi-VN')}</b></div>
      <div class="hm-col right"><span><b>${invCount('manh_noi_so')}</b>${homePng('manh_noi_so')}</span><span><b>${herbs}</b>[[vo_danh_thao]]</span></div>
    </div>
    <div class="hm-team">${cards}</div>
    <div class="hm-quick">${quick}</div>
    <div class="hm-modes">
      <button class="hm-mode l" onclick="G.homeChallenge()"><span class="hm-disc">${homePng('thi_luyen')}</span><b>Thử Thách</b></button>
      <button class="hm-mode c" onclick="G.homeGo()"><span class="hm-disc">${homePng('thien_ha')}</span><b>Hành Tẩu</b></button>
      <button class="hm-mode r" onclick="G.homeSoon('Luận Võ')"><span class="hm-disc">${homePng('kiem_duong')}</span><b>Luận Võ</b></button>
    </div>
    <div class="hm-funcs"><div class="hm-fscroll" id="hm-fscroll">${funcs}</div>
      <button class="hm-more" onclick="G.homeMore()" aria-label="Xem thêm">&raquo;</button></div>
    <div class="hm-ticker">${esc(last)}</div>
    <nav class="hm-nav">${nav}</nav>
  </div>`, 'home');
}
function homeMore() { const s = document.getElementById('hm-fscroll'); if (s) s.scrollBy({ left: s.clientWidth * 0.8, behavior: 'smooth' }); }
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
  .home { box-sizing: border-box; container-type: inline-size; position: relative; min-height: 100dvh; display: flex; flex-direction: column; color: #f3e7c9; overflow: hidden;
    padding: env(safe-area-inset-top) 0 calc(24.5cqw + env(safe-area-inset-bottom)); }
  .hm-bg { position: fixed; inset: 0; z-index: -1; background: linear-gradient(rgba(10,14,10,.5), rgba(10,14,10,.25) 45%, rgba(10,14,10,.7)), url(game/img/ban_do/tv_doc.jpg) center / cover; }
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
  .hm-res { margin-top: 2.2cqw; height: 16.5cqw; display: grid; grid-template-columns: 1fr 27cqw 1fr; align-items: center; padding: 0 2.5cqw; }
  .hm-col { display: grid; gap: 1.6cqw; }
  .hm-col span { height: 5cqw; display: flex; align-items: center; gap: 1.2cqw; font-size: 3cqw; font-weight: 700; color: #fff4d0; }
  .hm-col span > img, .hm-col .ic, .hm-col svg { width: 6cqw; height: 6cqw; flex: none; filter: drop-shadow(0 .3cqw .4cqw #000); }
  .hm-col b { flex: 0 0 19.7cqw; box-sizing: border-box; height: 100%; justify-content: center; display: flex; align-items: center; padding: 0 2cqw; border-radius: 1.4cqw; background: linear-gradient(#6a4a2a, #3e2814); border: .3cqw solid #a07a3a; white-space: nowrap; overflow: hidden; }
  .hm-col.right span { justify-content: flex-end; }
  .hm-power { display: flex; flex-direction: column; align-items: center; }
  .hm-power small { font-size: 3.3cqw; font-weight: 700; }
  .hm-arc { width: 26cqw; height: 4.2cqw; margin-top: .3cqw; display: grid; place-items: center; font-size: 2.8cqw; font-weight: 700; border-radius: 0 0 13cqw 13cqw / 0 0 4.2cqw 4.2cqw; background: linear-gradient(#6fbf4a, #2f6a22); border: .4cqw solid #c9e08a; }
  .hm-power b { font: 6.3cqw/1.1 'Pattaya', serif; color: #ffd76a; text-shadow: 0 .3cqw 0 #6a2a00, 0 0 2.5cqw #ff3a1a, 0 0 1cqw #ff6a1a; }
  /* thẻ nhân vật: 460 → 945, mỗi thẻ 212 × 485 */
  .hm-team { margin-top: 1.4cqw; display: grid; grid-template-columns: repeat(5, 1fr); gap: 1.1cqw; padding: 0 .4cqw; }
  .hm-card { position: relative; height: 43.5cqw; border-radius: 1cqw; overflow: hidden; border: .6cqw solid var(--qc) !important; background: linear-gradient(var(--qg), color-mix(in srgb, var(--qg) 55%, #000)) !important; box-shadow: inset 0 0 2cqw #0008; }
  .hm-card img { position: absolute; left: 0; top: 0; width: 100%; height: calc(100% - 5.8cqw); object-fit: cover; object-position: 50% 15%; transform: scaleX(-1); }
  .hm-card.q-thuong { --qc: #4fbf5a; --qg: #1f6a2a; } .hm-card.q-hiem { --qc: #4f8aff; --qg: #1e3a8a; }
  .hm-card.q-tuyet { --qc: #b77bff; --qg: #4b2a8a; } .hm-card.q-truyen { --qc: #ffbf3a; --qg: #8a5a10; }
  .hm-band { position: absolute; left: 0; right: 0; bottom: 0; height: 5.8cqw; display: flex; align-items: center; justify-content: space-between; padding: 0 1.2cqw 0 .6cqw; background: color-mix(in srgb, var(--qc) 55%, #000); }
  .hm-lv { width: 4.6cqw; height: 4.6cqw; border-radius: 50%; display: grid; place-items: center; background: #0008; font-size: 3.2cqw; font-weight: 800; }
  .hm-star { display: flex; gap: .3cqw; }
  .hm-star i { width: 3cqw; height: 3cqw; background: #ffd43b; clip-path: polygon(50% 0, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%); }
  /* hàng nút nhanh: 960 → 1135, icon ~130 */
  .hm-quick { margin-top: 1.4cqw; display: grid; grid-template-columns: repeat(6, 1fr); align-items: end; }
  .hm-q { display: flex; flex-direction: column; align-items: center; }
  .hm-q .hm-ic { width: 11.6cqw; height: 11.6cqw; filter: drop-shadow(0 .4cqw .6cqw #000a); }
  .hm-q b { margin-top: -1.2cqw; font-size: 3.3cqw; font-weight: 700; color: #ffe39a; white-space: nowrap; }
  .hm-chat { align-self: center; }
  .hm-chat span { display: grid; place-items: center; width: 13.5cqw; height: 9cqw; border-radius: 50%; background: #f2f2f2; color: #333; font-size: 2.6cqw; font-weight: 700; text-shadow: none; position: relative; }
  .hm-chat span::after { content: ""; position: absolute; left: 1.5cqw; bottom: -1.6cqw; border: 1.6cqw solid transparent; border-top-color: #f2f2f2; border-left-color: #f2f2f2; }
  /* ba nút lớn: 1170 → 1440; rộng 195 / 245 / 215 */
  .hm-modes { margin: auto 0; display: grid; grid-template-columns: 1fr 1.2fr 1fr; align-items: end; justify-items: center; padding: 2cqw 6cqw; }
  .hm-mode { display: flex; flex-direction: column; align-items: center; }
  .hm-disc { display: block; border-radius: 50%; padding: 12%; box-sizing: border-box; background: radial-gradient(circle at 50% 40%, #6a3a12, #1d1008 70%); border: .6cqw solid #e2bd62; box-shadow: 0 0 2cqw #ffb84a88, inset 0 0 2cqw #000; }
  .hm-mode.l .hm-disc { width: 17.5cqw; height: 17.5cqw; }
  .hm-mode.c .hm-disc { width: 22cqw; height: 22cqw; animation: hmGlow 2.4s ease-in-out infinite alternate; }
  .hm-mode.r .hm-disc { width: 19.3cqw; height: 19.3cqw; }
  .hm-mode b { margin-top: -4.5cqw; font: 5cqw 'Pattaya', serif; white-space: nowrap; color: #ffe39a; text-shadow: 0 .4cqw 0 #5a2a00, 0 0 1cqw #000, 0 0 .5cqw #000; }
  .hm-mode.c b { font-size: 5.6cqw; }
  .hm-mode:active .hm-disc { transform: scale(.95); }
  @keyframes hmGlow { to { box-shadow: 0 0 4cqw #ffcf6acc, inset 0 0 2cqw #000; } }
  @media (prefers-reduced-motion: reduce) { .hm-mode.c .hm-disc { animation: none; } }
  /* dải chức năng: 1480 → 1645, icon ~120, quầng sáng sau mỗi icon; mũi tên bên phải */
  .hm-funcs { position: relative; height: 14.8cqw; background: linear-gradient(#ffffff2a, #ffffff14); border-top: .3cqw solid #ffffff33; border-bottom: .3cqw solid #ffffff22; }
  .hm-fscroll { height: 100%; display: flex; overflow-x: auto; scrollbar-width: none; padding: 0 8cqw 0 6.3cqw; scroll-padding-left: 6.3cqw; scroll-snap-type: x mandatory; }
  .hm-fscroll::-webkit-scrollbar { display: none; }
  .hm-f { flex: 0 0 17.6cqw; scroll-snap-align: start; position: relative; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; padding-bottom: .8cqw !important; }
  .hm-f::before { content: ""; position: absolute; top: 0; left: 50%; width: 15cqw; height: 100%; transform: translateX(-50%); background: linear-gradient(#ffe7a033, #ffe7a000); clip-path: polygon(30% 0, 70% 0, 100% 100%, 0 100%); }
  .hm-f .hm-ic { position: relative; width: 10.8cqw; height: 10.8cqw; filter: drop-shadow(0 .4cqw .6cqw #000a); }
  .hm-f b { position: relative; margin-top: -.8cqw; font-size: 3.2cqw; font-weight: 700; color: #fff; white-space: nowrap; }
  .hm-more { position: absolute; right: 0; top: 0; bottom: 0; width: 7cqw; font-size: 8cqw !important; line-height: 1; color: #d8d0b0 !important; background: linear-gradient(90deg, #0000, #0008) !important; }
  /* dải tối mỏng: 1650 → 1700 (dòng nhật ký mới nhất) */
  .hm-ticker { height: 4.2cqw; margin: .5cqw .4cqw 0; border-radius: 2cqw; padding: 0 3cqw; display: flex; align-items: center; background: linear-gradient(#0f2a14cc, #08180ccc); font-size: 2.8cqw; color: #c9e0b0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  /* thanh dưới: 6 vòng tròn đường kính 165 */
  .hm-nav { position: fixed; bottom: 0; left: 50%; transform: translateX(-50%); width: 100cqw; z-index: 20; box-sizing: border-box; display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); padding: 2.6cqw .8cqw calc(3.5cqw + env(safe-area-inset-bottom)); background: linear-gradient(#1c3a22, #0c1a10); }
  .hm-nav button { display: flex; flex-direction: column; align-items: center; min-width: 0; }
  .hm-nav .hm-ic { width: 14.8cqw; height: 14.8cqw; border-radius: 50%; overflow: hidden; border: .7cqw solid #d8b25a; background: radial-gradient(#5a3a1a, #1d1008); padding: 1.4cqw; box-sizing: border-box; box-shadow: 0 0 1.5cqw #0008; }
  .hm-nav button.on .hm-ic { border-color: #ffe39a; box-shadow: 0 0 2.5cqw #ffcf6a; }
  .hm-nav b { margin-top: -3cqw; font-size: 3.1cqw; font-weight: 800; color: #ffe39a; white-space: nowrap; text-transform: uppercase; margin-left: -4cqw; margin-right: -4cqw; transform: scaleX(.78); }
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

const TRANG_CHU_G = { home: renderHome, homeGo, homeTeam, homeChallenge, homeDaily, homeShops, homeSoon, homeMore };
