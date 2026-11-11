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
  const cards = HOME_TEAM.map(h => `<button class="hm-card q-${HOME_Q[h.q]}" onclick="G.homeTeam()">
      <img src="game/img/quai/${h.img}.png" alt="" draggable="false">
      <span class="hm-role">${h.role}</span>
      <span class="hm-lv">${h.lv}</span><span class="hm-star">${'<i></i>'.repeat(h.star)}</span>
      <span class="hm-nm">${h.name}</span></button>`).join('');
  const quick = [
    ['G.menuQuests()', homePng('nhiem_vu'), 'Nhiệm Vụ'],
    ['G.homeDaily()', homePng('thi_luyen'), 'Hằng Ngày'],
    ['G.beQuan()', '[[ruong]]', 'Bế Quan'],
    ['G.banDo()', homePng('thien_ha'), 'Thiên Hạ'],
    ["G.homeSoon('Hộp thư')", '[[dam_may]]', 'Hộp Thư'],
  ].map(([f, ic, t]) => `<button class="hm-q" onclick="${f}"><span class="hm-ic">${ic}</span><b>${t}</b></button>`).join('');
  const funcs = [
    ['G.homeTeam()', homePng('chinh_dien'), 'Đội Ngũ'],
    ["G.menuChar('gear')", homePng('trang_bi'), 'Trang Bị'],
    ['G.menuInv()', homePng('hanh_trang'), 'Hành Trang'],
    ['G.menuSkills()', homePng('vo_hoc'), 'Võ Học'],
    ["G.menuChar('km')", '[[noi_cong]]', 'Kinh Mạch'],
    ["G.openShop('tho_ren_dc')", homePng('lo_ren'), 'Lò Rèn'],
  ].map(([f, ic, t]) => `<button class="hm-f" onclick="${f}"><span class="hm-ic">${ic}</span><b>${t}</b></button>`).join('');
  show(`<div class="home">
    <div class="hm-bg"></div>
    <header class="hm-top">
      <button class="hm-ava" onclick="G.menuChar()">${menuIc('nhan_vat')}</button>
      <div class="hm-who"><div class="hm-row"><b class="hm-name">${esc(P.name)}</b><span class="hm-lvl">Cấp ${P.lv}</span></div>
        <div class="hm-exp"><i style="width:${pct.toFixed(1)}%"></i></div><small>${sectName(P.sect)}</small></div>
      <div class="hm-power"><small>Lực chiến</small><b>${lucChien().toLocaleString('vi-VN')}</b></div>
    </header>
    <div class="hm-res">
      <span>[[bac]]<b>${P.gold.toLocaleString('vi-VN')}</b></span>
      <span>${homePng('manh_vo_so')}<b>${invCount('manh_vo_so')}</b></span>
      <span>${homePng('manh_noi_so')}<b>${invCount('manh_noi_so')}</b></span>
    </div>
    <div class="hm-team">${cards}</div>
    <div class="hm-quick">${quick}</div>
    <div class="hm-modes">
      <button class="hm-mode side" onclick="G.homeChallenge()"><span class="hm-disc">${homePng('thi_luyen')}</span><b>Thử Thách</b></button>
      <button class="hm-mode main" onclick="G.homeGo()"><span class="hm-disc">${homePng('thien_ha')}</span><b>Hành Tẩu</b></button>
      <button class="hm-mode side" onclick="G.homeSoon('Luận Võ')"><span class="hm-disc">${homePng('kiem_duong')}</span><b>Luận Võ</b></button>
    </div>
    <div class="hm-funcs">${funcs}</div>
    <nav class="hm-nav">
      <button class="on"><span class="hm-ic">${homePng('chinh_dien')}</span><b>Trang Chủ</b></button>
      <button onclick="G.homeTeam()"><span class="hm-ic">${menuIc('nhan_vat')}</span><b>Hiệp Khách</b></button>
      <button onclick="G.homeSoon('Chiêu mộ')"><span class="hm-ic">${homePng('truy_na')}</span><b>Chiêu Mộ</b></button>
      <button onclick="G.homeShops()"><span class="hm-ic">${homePng('tiem_vu_khi')}</span><b>Cửa Tiệm</b></button>
      <button onclick="G.menuSystem()"><span class="hm-ic">${homePng('he_thong')}</span><b>Hệ Thống</b></button>
    </nav>
  </div>`, 'home');
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

function homeStyle() {
  if (document.getElementById('home-style')) return;
  const st = document.createElement('style');
  st.id = 'home-style';
  st.textContent = `
  .home { box-sizing: border-box; position: relative; min-height: 100dvh; display: flex; flex-direction: column; gap: 10px; padding: max(8px, env(safe-area-inset-top)) 10px calc(76px + env(safe-area-inset-bottom)); color: #f3e7c9; overflow: hidden; }
  .hm-bg { position: fixed; inset: 0; z-index: -1; background: linear-gradient(rgba(14,10,6,.55), rgba(14,10,6,.35) 40%, rgba(14,10,6,.8)), url(game/img/ban_do/tv_doc.jpg) center / cover; }
  .home button { font: inherit; color: inherit; cursor: pointer; background: none; border: 0; padding: 0; }
  .hm-ic img, .hm-disc img { width: 100%; height: 100%; object-fit: contain; display: block; }
  .hm-ic .ic { width: 100%; height: 100%; }
  /* thanh trên */
  .hm-top { display: flex; align-items: center; gap: 10px; padding: 8px 10px; border-radius: 14px; background: linear-gradient(#3a2a18f0, #241a10f0); border: 1px solid #c9a24a88; box-shadow: 0 4px 14px #0008; }
  .hm-ava { flex: none; width: 54px; height: 54px; border-radius: 50%; border: 2px solid #e2bd62; overflow: hidden; background: #1b130a; }
  .hm-ava img { width: 100%; height: 100%; object-fit: cover; }
  .hm-who { flex: 1; min-width: 0; }
  .hm-row { display: flex; align-items: baseline; gap: 8px; }
  .hm-name { font: 20px 'Pattaya', serif; color: #ffe39a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .hm-lvl { font-size: 12px; padding: 1px 8px; border-radius: 99px; background: #6b3d12; border: 1px solid #c9a24a; color: #ffe39a; white-space: nowrap; }
  .hm-exp { height: 6px; border-radius: 4px; background: #0008; margin: 4px 0 2px; overflow: hidden; }
  .hm-exp i { display: block; height: 100%; background: linear-gradient(90deg, #6fcf5a, #c9f07a); }
  .hm-who small { font-size: 11.5px; color: #c9b894; }
  .hm-power { flex: none; text-align: center; padding: 4px 10px; border-radius: 10px; background: radial-gradient(#7a2a12, #3a140a); border: 1px solid #e2bd62; }
  .hm-power small { display: block; font-size: 10.5px; color: #f0c989; }
  .hm-power b { font: 22px 'Pattaya', serif; color: #fff1b8; text-shadow: 0 2px 0 #000, 0 0 10px #ff9a3a; }
  /* tài nguyên */
  .hm-res { display: flex; gap: 8px; justify-content: space-between; }
  .hm-res span { flex: 1; display: flex; align-items: center; gap: 6px; padding: 3px 10px 3px 4px; border-radius: 99px; background: #0009; border: 1px solid #c9a24a55; font-size: 13.5px; min-width: 0; }
  .hm-res span > img, .hm-res .ic { width: 24px; height: 24px; flex: none; }
  .hm-res b { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  /* hàng đội hình */
  .hm-team { display: grid; grid-template-columns: repeat(5, 1fr); gap: 5px; }
  .hm-card { position: relative; aspect-ratio: 3 / 5; border-radius: 10px; overflow: hidden; border: 2px solid var(--qc); background: radial-gradient(circle at 50% 35%, var(--qg), #160f08 75%); box-shadow: 0 0 10px var(--qg); }
  .hm-card img { position: absolute; inset: 6% 4% 18%; width: 92%; height: 76%; object-fit: contain; object-position: bottom; transform: scaleX(-1); }
  .hm-card.q-thuong { --qc: #9aa3a8; --qg: #4a5257; } .hm-card.q-hiem { --qc: #4fa8ff; --qg: #1d4a7a; }
  .hm-card.q-tuyet { --qc: #b77bff; --qg: #4b2a7a; } .hm-card.q-truyen { --qc: #ffbf3a; --qg: #7a4d10; }
  .hm-role { position: absolute; top: 3px; left: 3px; font-size: 9px; padding: 0 5px; border-radius: 6px; background: #000b; color: #ffe39a; }
  .hm-lv { position: absolute; left: 4px; bottom: 15px; font-size: 13px; font-weight: 800; text-shadow: 0 1px 2px #000; }
  .hm-star { position: absolute; right: 3px; bottom: 16px; display: flex; gap: 1px; }
  .hm-star i { width: 9px; height: 9px; background: #ffd43b; clip-path: polygon(50% 0, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%); }
  .hm-nm { position: absolute; left: 0; right: 0; bottom: 0; padding: 2px 0; font-size: 10px; text-align: center; background: linear-gradient(transparent, #000d 40%); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  /* hàng nút nhanh, hàng chức năng */
  .hm-quick, .hm-funcs { display: grid; grid-template-columns: repeat(5, 1fr); gap: 4px; }
  .hm-funcs { grid-template-columns: repeat(6, 1fr); padding: 8px 4px; border-radius: 14px; background: #0a0705b3; border: 1px solid #c9a24a44; }
  .hm-q, .hm-f { display: flex; flex-direction: column; align-items: center; gap: 2px; }
  .hm-q .hm-ic { width: 44px; height: 44px; filter: drop-shadow(0 2px 3px #000a); }
  .hm-f .hm-ic { width: 40px; height: 40px; }
  .hm-q b, .hm-f b { font-size: 11px; font-weight: 700; text-shadow: 0 1px 2px #000, 0 0 4px #000; white-space: nowrap; }
  /* ba nút lớn */
  .hm-modes { display: flex; justify-content: center; align-items: flex-end; gap: 4px; margin: auto 0; padding: 6px 0; }
  .hm-mode { display: flex; flex-direction: column; align-items: center; min-width: 0; }
  .hm-disc { display: block; border-radius: 50%; padding: 12%; background: radial-gradient(circle at 50% 40%, #5a3412, #1d1008 70%); border: 3px solid #e2bd62; box-shadow: 0 0 0 3px #6b3d12, 0 0 18px #ffb84a88, inset 0 0 14px #000; }
  .hm-mode.side .hm-disc { width: 23vw; max-width: 100px; height: 23vw; max-height: 100px; }
  .hm-mode.main .hm-disc { width: 33vw; max-width: 140px; height: 33vw; max-height: 140px; animation: hmGlow 2.4s ease-in-out infinite alternate; }
  .hm-mode b { margin-top: -10px; font: 18px 'Pattaya', serif; white-space: nowrap; color: #ffe39a; text-shadow: 0 2px 0 #3a1a00, 0 0 6px #000, 0 0 2px #000; }
  .hm-mode.main b { font-size: 25px; }
  .hm-mode:active .hm-disc { transform: scale(.95); }
  @keyframes hmGlow { to { box-shadow: 0 0 0 3px #6b3d12, 0 0 30px #ffcf6aaa, inset 0 0 14px #000; } }
  @media (prefers-reduced-motion: reduce) { .hm-mode.main .hm-disc { animation: none; } }
  /* thanh dưới */
  .hm-nav { position: fixed; left: 0; right: 0; bottom: 0; z-index: 20; display: grid; grid-template-columns: repeat(5, 1fr); padding: 6px 6px calc(6px + env(safe-area-inset-bottom)); background: linear-gradient(#2c1f12, #160f08); border-top: 2px solid #c9a24a; }
  .hm-nav button { display: flex; flex-direction: column; align-items: center; gap: 1px; opacity: .85; }
  .hm-nav button.on { opacity: 1; }
  .hm-nav button.on .hm-ic { filter: drop-shadow(0 0 6px #ffcf6a); }
  .hm-nav .hm-ic { width: 38px; height: 38px; border-radius: 50%; overflow: hidden; }
  .hm-nav b { font-size: 11px; color: #ffe39a; }
  /* danh sách trong hộp thoại */
  .hm-list { display: grid; gap: 8px; }
  .hm-li { display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 12px; border: 1px solid var(--line); background: rgba(255,255,255,.04); color: inherit; font: inherit; text-align: left; cursor: pointer; }
  .hm-li > img, .hm-li > .ic, .hm-li > svg { width: 40px; height: 40px; flex: none; }
  .hm-li span { display: flex; flex-direction: column; } .hm-li small { color: var(--muted); font-size: 12px; }
  .hm-li.off { opacity: .5; cursor: default; }
  @media (min-width: 600px) { .home { max-width: 480px; margin: 0 auto; } .hm-nav { max-width: 480px; margin: 0 auto; } }
  `;
  document.head.appendChild(st);
}
const TRANG_CHU_G = { home: renderHome, homeGo, homeTeam, homeChallenge, homeDaily, homeShops, homeSoon };
