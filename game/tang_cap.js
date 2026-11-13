/* =====================================================================
   TĂNG CẤP HIỆP KHÁCH (2026-11-12, người dùng chốt theo ảnh mẫu)
   - Màn 1 "Chọn Võ Hiệp thăng cấp": lưới hiệp khách đang có (nhãn "Đội" nếu đang ra trận) + hiệp khách nguyên liệu (khung xanh lá).
   - Bấm một hiệp khách → màn 2 "Chọn Võ Hiệp nguyên liệu": bảng trên (chân dung, Lv hiện tại, thanh +kinh nghiệm, Lv sau khi hợp,
     chỉ số kèm mức tăng mỗi cấp), lưới nguyên liệu bấm chọn (số thứ tự trên góc), nút Hợp hiện lương thực tốn.
   - Mỗi nguyên liệu = 450 kinh nghiệm, tốn 4.500 lương thực (người dùng chốt).
   Claude đặt (chờ người dùng duyệt): kinh nghiệm lên cấp n → n+1 = 48 × n (khớp ảnh mẫu: 450 → Lv 4, 1350 → Lv 8);
   tên / hình nguyên liệu "Tân Binh" (mượn hình Tăng Nhân); nguồn: thắng tầng ải rơi 1 (tầng boss 2); nhân vật mới / bản lưu cũ tặng 10 một lần.
   Cấp hiệp khách không vượt cấp nhân vật (người dùng chốt); nhân vật lên cấp nhờ kinh nghiệm thắng ải (ai_giang_ho.js).
   ===================================================================== */
const TANG_CAP = { exp: 450, cost: 4500, gift: 10, lieu: { name: 'Tân Binh', img: 'tm_tang_tre' } };
const hkNeed = n => 48 * n;                 // kinh nghiệm cần để từ cấp n lên n + 1
// cấp và kinh nghiệm dư sau khi cộng thêm `add` kinh nghiệm
// cấp hiệp khách không vượt cấp nhân vật (người dùng chốt 2026-11-12): tới trần thì kinh nghiệm dư bỏ đi
const hkCap = () => (P ? P.lv : 1);
function hkLvAfter(lv, exp, add) {
  let e = (exp || 0) + add; const cap = hkCap();
  while (lv < cap && e >= hkNeed(lv)) { e -= hkNeed(lv); lv++; }
  if (lv >= cap) e = 0;
  return { lv, exp: e, max: lv >= cap };
}
function tcEnsure() {
  if (!P) return;
  if (P.lieu == null) P.lieu = 0;
  if (!P.lieuGift) { P.lieu += TANG_CAP.gift; P.lieuGift = 1; }
}
let tcSel = null, tcPicks = 0;

function tcHead(title, back) {
  return `${homeHead()}
    <div class="tc-bar"><button class="al-back" onclick="${back}">Trở về</button><b>${title}</b></div>`;
}
function tcTile(h, extra) {
  const H = NGU_HANH[h.hanh] || {};
  // chân dung: phóng to phần đầu của ảnh toàn thân
  const [fx, fy] = heroFace(h);
  const pt = h.art ? `<img class="art" src="${h.art}" alt="" style="left:${(50 - fx * 182).toFixed(1)}%;top:${(50 - fy * 182 * 1400 / 781).toFixed(1)}%">` : `<img src="game/img/quai/${h.img}.png" alt="">`;
  return `<span class="tc-pt">${pt}</span>${H.color ? `<i class="tc-hanh" style="--hc:${H.color}"></i>` : ''}
    <span class="tc-st">${'<i></i>'.repeat(h.star || 1)}</span>${extra || ''}`;
}
// Màn 1: chọn hiệp khách để thăng cấp
function tangCap() {
  if (!P) return renderTitle();
  hkEnsure(); tcEnsure();
  closeModalSilent(); aiStyle(); homeStyle(); tcStyle(); homeNoDrag();
  const tb = el('topbar'); if (tb) tb.classList.add('hidden');
  const own = Object.keys(P.hk).filter(id => HIEP_KHACH[id]).map(hkGet)
    .sort((a, b) => (P.doi.includes(b.id) - P.doi.includes(a.id)) || b.lv - a.lv);
  const heroes = own.map(h => `<button class="tc-cell q-${HOME_Q[h.q]}" onclick="G.tcPick('${h.id}')">${tcTile(h,
    `${P.doi.includes(h.id) ? '<em class="tc-doi">Đội</em>' : ''}<b class="tc-lv">${h.lv}</b>`)}</button>`).join('');
  const L = TANG_CAP.lieu, lieu = Array.from({ length: P.lieu }, () =>
    `<button class="tc-cell lieu" onclick="G.tcLieuInfo()">${tcTile({ img: L.img, star: 1 })}</button>`).join('');
  show(`<div class="home tc">
    <div class="hm-bg"></div>
    ${tcHead('Chọn Võ Hiệp thăng cấp', 'G.home()')}
    <div class="tc-grid hd-scroll">${heroes}${lieu}</div>
  </div>`, 'tang-cap');
}
// Màn 2: chọn nguyên liệu cho hiệp khách `id`
function tcPick(id) {
  if (id) { tcSel = id; tcPicks = 0; }
  const h = hkGet(tcSel); if (!h) return tangCap();
  tcEnsure();
  closeModalSilent(); aiStyle(); homeStyle(); tcStyle(); homeNoDrag();
  const add = tcPicks * TANG_CAP.exp, aft = hkLvAfter(h.lv, h.exp, add), st = heroSt(h, true), g = h.grow || {};
  const per = k => (g[k] ? `<small>(1 cấp +${String(g[k]).replace('.', ',')})</small>` : '');
  const need = hkNeed(aft.lv), pct = Math.min(100, (aft.exp / need) * 100);
  const L = TANG_CAP.lieu, cells = Array.from({ length: P.lieu }, (_, k) =>
    `<button class="tc-cell lieu ${k < tcPicks ? 'on' : ''}" onclick="G.tcToggle(${k})">${tcTile({ img: L.img, star: 1 },
      k < tcPicks ? `<em class="tc-num">${k + 1}</em>` : '')}</button>`).join('');
  const cost = tcPicks * TANG_CAP.cost;
  show(`<div class="home tc">
    <div class="hm-bg"></div>
    ${tcHead('Chọn Võ Hiệp nguyên liệu', 'G.tangCap()')}
    <div class="tc-panel">
      <span class="tc-big q-${HOME_Q[h.q]}">${tcTile(h)}</span>
      <div class="tc-info">
        <div class="tc-lvrow"><b>Lv. ${h.lv}</b><span class="tc-xp"><i style="width:${pct.toFixed(1)}%"></i><em>${add ? '+' + add.toLocaleString('vi-VN') : `${Math.round(h.exp || 0)}/${hkNeed(h.lv)}`}</em></span><b>Lv. ${aft.lv}${aft.max ? ' (tối đa)' : ''}</b></div>
        <div class="tc-stats"><span>Khí huyết <b>${st.hp}</b>${per('hp')}</span><span>Thủ <b>${st.def}</b>${per('def')}</span>
          <span>Công <b>${st.atk}</b>${per('atk')}</span><span>Hồi <b>${st.hoi}</b>${per('hoi')}</span></div>
      </div>
    </div>
    <div class="tc-grid hd-scroll">${cells || '<p class="tc-empty">Chưa có hiệp khách nguyên liệu. Vượt ải Giang Hồ để nhận thêm.</p>'}</div>
    <div class="tc-foot"><button class="tc-hop ${tcPicks ? '' : 'off'}" onclick="G.tcHop()"><span>${cost.toLocaleString('vi-VN')} ${homePng('khung_luong_thuc')}</span><b>Hợp</b></button></div>
  </div>`, 'tang-cap-' + tcSel);
}
// chọn theo thứ tự: bấm ô thứ k thì chọn k + 1 ô đầu; bấm ô cuối đang chọn thì bỏ nó
function tcToggle(k) {
  if (k + 1 === tcPicks) tcPicks = k;
  else if (k + 1 > tcPicks) {
    const h = hkGet(tcSel);
    if (h && hkLvAfter(h.lv, h.exp, tcPicks * TANG_CAP.exp).max) return toast(`Đã tới cấp tối đa: hiệp khách không vượt cấp nhân vật (Lv. ${hkCap()})`);
    tcPicks = k + 1;
    while (tcPicks > 1 && hkLvAfter(h.lv, h.exp, (tcPicks - 1) * TANG_CAP.exp).max) tcPicks--; // không chọn thừa
  } else tcPicks = k + 1;
  tcPick();
}
function tcHop() {
  const h = hkGet(tcSel); if (!h || !tcPicks) return;
  if (h.lv >= hkCap()) return toast(`Hiệp khách đã bằng cấp nhân vật (Lv. ${hkCap()})`);
  const cost = tcPicks * TANG_CAP.cost;
  if ((P.luongThuc || 0) < cost) return toast(`Không đủ lương thực (cần ${cost.toLocaleString('vi-VN')})`);
  const aft = hkLvAfter(h.lv, h.exp, tcPicks * TANG_CAP.exp);
  P.luongThuc -= cost; P.lieu -= tcPicks;
  P.hk[tcSel].lv = aft.lv; P.hk[tcSel].exp = aft.exp;
  tcPicks = 0;
  if (typeof saveGame === 'function') saveGame();
  if (hasSnd()) SND.jingle('levelup');
  toast(`${h.name} lên Lv. ${aft.lv}`);
  tcPick();
}
function tcStyle() {
  if (document.getElementById('tc-style')) return;
  const st = document.createElement('style');
  st.id = 'tc-style';
  st.textContent = `
  .home.tc { padding-bottom: env(safe-area-inset-bottom); }
  .tc-bar { display: flex; align-items: center; gap: 3cqw; padding: 2.5cqw 3cqw; }
  .tc-bar b { font-size: 5.6cqw; font-weight: 800; text-shadow: 0 .3cqw 0 #000, 0 0 1cqw #000; }
  .tc-grid { flex: 1; min-height: 0; overflow-y: auto; display: grid; grid-template-columns: repeat(5, 1fr); gap: 2cqw; align-content: start; padding: 1cqw 4cqw 4cqw; }
  .tc-cell { position: relative; aspect-ratio: 1; border-radius: 1.4cqw !important; overflow: hidden; background: linear-gradient(#7a4aa8, #3a1e5a) !important; border: .6cqw solid #b88ae0 !important; box-shadow: 0 .4cqw .8cqw #0008; }
  .tc-cell.q-thuong { background: linear-gradient(#4f9a3a, #1f4a14) !important; border-color: #9ad870 !important; }
  .tc-cell.q-hiem { background: linear-gradient(#3a6ac8, #1a3a6a) !important; border-color: #8ab0f0 !important; }
  .tc-cell.q-truyen { background: linear-gradient(#c8902a, #6a4010) !important; border-color: #ffd76a !important; }
  .tc-cell.lieu { background: linear-gradient(#6aa83a, #2a5a14) !important; border-color: #a8d870 !important; }
  .tc-cell.lieu.on { box-shadow: 0 0 0 .6cqw #ffd43b, 0 .4cqw .8cqw #0008; }
  .tc-pt { position: absolute; inset: 0; overflow: hidden; }
  .tc-pt img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: 50% 0; transform: scale(1.7); transform-origin: 50% 12%; }
  /* tranh có nền (art): khung đầu + vai giống cỡ chú tiểu (ô vuông rộng 55% bề ngang tranh, từ x 22%, y 12%) */
  .tc-pt img.art { inset: auto; width: 182%; height: auto; left: -40%; top: -36%; object-fit: fill; transform: none; }
  .tc-hanh { position: absolute; left: .8cqw; top: .8cqw; width: 3.6cqw; height: 3.6cqw; border-radius: 50%; background: radial-gradient(circle at 35% 30%, #fff8, var(--hc) 60%); border: .3cqw solid #fff9; }
  .tc-st { position: absolute; left: .8cqw; bottom: .6cqw; display: flex; gap: .2cqw; }
  .tc-st i { width: 2.6cqw; height: 2.6cqw; background: #ffd43b; clip-path: polygon(50% 0, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%); }
  .tc-doi { position: absolute; right: 0; top: 0; padding: .2cqw 1.4cqw; border-radius: 0 0 0 1.4cqw; font-style: normal; font-size: 2.6cqw; font-weight: 800; color: #fff; background: #3a2a10cc; }
  .tc-lv { position: absolute; right: .8cqw; bottom: .4cqw; font-size: 3cqw; font-weight: 800; color: #fff; text-shadow: 0 0 .5cqw #000, 0 .2cqw 0 #000; }
  .tc-num { position: absolute; left: .6cqw; top: .6cqw; width: 5.4cqw; height: 5.4cqw; border-radius: 50%; display: grid; place-items: center; font-style: normal; font-size: 3.2cqw; font-weight: 800; color: #fff; background: radial-gradient(circle at 40% 35%, #ff6a5a, #b0180c); border: .4cqw solid #fff; }
  .tc-panel { display: flex; gap: 2.5cqw; align-items: center; margin: 0 3cqw 2cqw; padding: 2cqw; border-radius: 1.6cqw; background: linear-gradient(#5a4632, #2e2218); border: .5cqw solid #c9a24a; }
  .tc-big { position: relative; flex: none; width: 18cqw; height: 18cqw; border-radius: 1.4cqw; overflow: hidden; border: .6cqw solid #b88ae0; background: linear-gradient(#7a4aa8, #3a1e5a); }
  .tc-info { flex: 1; min-width: 0; }
  .tc-lvrow { display: flex; align-items: center; gap: 2cqw; }
  .tc-lvrow b { flex: none; font-size: 4cqw; font-weight: 800; color: #ffcf8a; }
  .tc-xp { position: relative; flex: 1; height: 4.4cqw; border-radius: .8cqw; background: #1a120c; border: .3cqw solid #8a7a5a; overflow: hidden; }
  .tc-xp i { position: absolute; inset: 0 auto 0 0; background: linear-gradient(#7fd8f0, #2a8ab0); }
  .tc-xp em { position: absolute; inset: 0; display: grid; place-items: center; font-style: normal; font-size: 3cqw; font-weight: 800; color: #fff; text-shadow: 0 0 .4cqw #000; }
  .tc-stats { display: grid; grid-template-columns: 1fr 1fr; gap: .6cqw 2cqw; margin-top: 1.4cqw; }
  .tc-stats span { font-size: 3cqw; color: #ffb08a; white-space: nowrap; }
  .tc-stats b { color: #fff4d0; }
  .tc-stats small { font-size: 2.6cqw; color: #f06a4a; }
  .tc-empty { grid-column: 1 / -1; text-align: center; font-size: 3.6cqw; color: #f3e7c9; text-shadow: 0 0 .6cqw #000; }
  .tc-foot { display: flex; justify-content: center; padding: 2cqw 0 4cqw; }
  .tc-hop { min-width: 34cqw; padding: 1.4cqw 4cqw; border-radius: 3cqw !important; display: flex; flex-direction: column; align-items: center; background: linear-gradient(#7fd05a, #2a7a22) !important; border: .6cqw solid #d8f08a !important; box-shadow: 0 .6cqw 1cqw #0009; }
  .tc-hop span { display: flex; align-items: center; gap: 1cqw; font-size: 3.6cqw; font-weight: 800; color: #fff; }
  .tc-hop span img { width: 5cqw; height: 5cqw; object-fit: cover; object-position: 0 50%; border-radius: 50%; }
  .tc-hop b { font: 5cqw 'Pattaya', serif; color: #fff; text-shadow: 0 .3cqw 0 #1a4a10; }
  .tc-hop.off { filter: grayscale(.8) brightness(.7); }
  `;
  document.head.appendChild(st);
}
function tcLieuInfo() { toast('Nguyên liệu dùng để thăng cấp hiệp khách khác'); }
/* ---------- QUẢN LÝ VÕ HIỆP (2026-11-12, người dùng chốt theo ảnh mẫu) ----------
   Bấm "Hiệp Khách" ở thanh dưới. Phần đầu + thanh dưới giữ như Trang chủ, giữa là 8 ô (2 cột × 4 hàng).
   Kinh Mạch mở luôn (không khóa cấp 30). Icon ảnh Gemini của người dùng game/img/icon/vh_<mã>.png (gốc luu_tru/trang_chu/icon_vo_hiep.png). */
function voHiep() {
  if (!P) return renderTitle();
  hkEnsure();
  closeModalSilent(); aiStyle(); homeStyle(); tcStyle(); vhStyle(); homeNoDrag();
  const tb = el('topbar'); if (tb) tb.classList.add('hidden');
  const tiles = [
    ['G.vhList()', 'vo_hiep', 'Võ Hiệp'],
    ["G.homeSoon('Ghép mảnh')", 'ghep_manh', 'Ghép Mảnh'],
    ["G.homeSoon('Tăng sao')", 'tang_sao', 'Tăng Sao'],
    ['G.tangCap()', 'boi_duong', 'Bồi Dưỡng'],
    ["G.homeSoon('Đột phá')", 'dot_pha', 'Đột Phá'],
    ["G.homeSoon('Kỹ năng')", 'ky_nang', 'Kỹ Năng'],
    ["G.menuChar('km')", 'kinh_mach', 'Kinh Mạch'],
    ["G.homeSoon('Giang Hồ Ký')", 'giang_ho_ky', 'Giang Hồ Ký'],
  ].map(([f, ic, t]) => `<button class="vh-t" onclick="${f}"><span class="vh-disc vh-${ic}">${homePng('vh_' + ic)}</span><b>${t}</b></button>`).join('');
  show(`<div class="home tc vh">
    <div class="hm-bg"></div>
    ${tcHead('Quản lý Võ Hiệp', 'G.home()')}
    <div class="vh-grid">${tiles}</div>
    <nav class="hm-nav">${homeNav('hiep_khach')}</nav>
  </div>`, 'vo-hiep');
}
// Lưới mọi hiệp khách đang có (theo ảnh mẫu): đội ra trận trước, rồi hiệp khách nguyên liệu; sức chứa 60 (Claude đặt)
const VH_CAP = 60;
function vhList() {
  if (!P) return renderTitle();
  hkEnsure(); tcEnsure();
  closeModalSilent(); aiStyle(); homeStyle(); tcStyle(); vhStyle(); homeNoDrag();
  const tb = el('topbar'); if (tb) tb.classList.add('hidden');
  const own = Object.keys(P.hk).filter(id => HIEP_KHACH[id]).map(hkGet)
    .sort((a, b) => (P.doi.includes(b.id) - P.doi.includes(a.id)) || (b.q - a.q) || b.lv - a.lv);
  const heroes = own.map(h => `<button class="tc-cell q-${HOME_Q[h.q]}" onclick="G.heroView('${h.id}', 'vh')">${tcTile(h,
    `${P.doi.includes(h.id) ? '<em class="tc-doi">Đội</em>' : ''}<b class="tc-lv">${h.lv}</b>`)}</button>`).join('');
  const L = TANG_CAP.lieu, lieu = Array.from({ length: P.lieu }, () =>
    `<button class="tc-cell lieu" onclick="G.tcLieuInfo()">${tcTile({ img: L.img, star: 1 })}</button>`).join('');
  show(`<div class="home tc vh">
    <div class="hm-bg"></div>
    ${homeHead()}
    <div class="tc-bar"><button class="al-back" onclick="G.voHiep()">Trở về</button><b>Võ Hiệp</b><b class="vh-cnt">${own.length + P.lieu}/${VH_CAP}</b></div>
    <div class="tc-grid hd-scroll vh-list">${heroes}${lieu}</div>
    <nav class="hm-nav">${homeNav('hiep_khach')}</nav>
  </div>`, 'vh-list');
}
/* ---------- ĐỘI NGŨ (2026-11-12, theo ảnh mẫu người dùng) ----------
   5 thẻ dọc (ô trống "Chọn Tướng Ra Trận"),
   hàng Hỗ Trợ 6 ô (ô 1 mở, các ô sau mở ở cấp 27 / 36 / 45 / 54 / 63, chưa có chức năng), nút Duyên / Chỉ Số / Thần Thú (sắp mở).
   Bấm thẻ → "Chọn Võ Hiệp" (doiPick): Gỡ Ra + hiệp khách chưa ra trận, bấm là đưa vào ô đó. */
const DOI_HOTRO = [0, 27, 36, 45, 54, 63];
function doiNgu() {
  if (!P) return renderTitle();
  hkEnsure();
  closeModalSilent(); aiStyle(); homeStyle(); tcStyle(); vhStyle(); homeNoDrag();
  const tb = el('topbar'); if (tb) tb.classList.add('hidden');
  const cards = hkTeam().map((h, i) => {
    if (!h) return `<button class="dn-card empty" onclick="G.doiPick(${i})"><b>Chọn<br>Tướng<br>Ra<br>Trận</b></button>`;
    const H = NGU_HANH[h.hanh] || {};
    return `<button class="dn-card q-${HOME_Q[h.q]}" onclick="G.doiPick(${i})">
      <img class="${h.art ? 'art' : ''}" src="${heroImg(h)}" alt="" draggable="false">
      ${H.color ? `<i class="tc-hanh dn-hanh" style="--hc:${H.color}"></i>` : ''}
      <span class="dn-name">${h.name}</span>
      <span class="dn-foot"><b>${h.lv}</b><span class="tc-st">${'<i></i>'.repeat(h.star || 1)}</span></span></button>`;
  }).join('');
  const ht = DOI_HOTRO.map(lv => P.lv >= lv ? `<button class="dn-ht open" onclick="G.homeSoon('Hỗ trợ')"></button>`
    : `<span class="dn-ht"><i class="dn-lock"></i><small>Cấp ${lv} mở</small></span>`).join('');
  show(`<div class="home tc dn">
    <div class="hm-bg"></div>
    ${homeHead()}
    <div class="tc-bar"><button class="al-back" onclick="G.home()">Trở về</button><b>Đội Ngũ</b>
      <button class="dn-btn blue" onclick="G.homeSoon('Thần thú')">Thần Thú</button></div>
    <div class="dn-cards">${cards}</div>
    <div class="dn-band"><b>Hỗ Trợ</b><span>Có thể kích hoạt duyên phận</span></div>
    <div class="dn-hts">${ht}</div>
    <div class="dn-acts"><button class="dn-btn green" onclick="G.homeSoon('Duyên')">Duyên</button><button class="dn-btn blue" onclick="G.homeSoon('Chỉ số đội')">Chỉ Số</button></div>
  </div>`, 'doi-ngu');
}
let dnSlot = 0, dnSort = 'lv', dnBack = 'G.doiNgu()'; // dnBack: màn quay về sau khi chọn (Đội Ngũ hoặc Trang chủ)
function doiPick(i, sort, from) {
  if (i != null) { dnSlot = i; dnBack = from === 'home' ? 'G.home()' : 'G.doiNgu()'; }
  if (sort) dnSort = dnSort === 'lv' ? 'star' : 'lv';
  hkEnsure();
  closeModalSilent(); aiStyle(); homeStyle(); tcStyle(); vhStyle(); homeNoDrag();
  const own = Object.keys(P.hk).filter(id => HIEP_KHACH[id] && !P.doi.includes(id)).map(hkGet)
    .sort((a, b) => dnSort === 'star' ? (b.star - a.star) || b.lv - a.lv : (b.lv - a.lv) || b.star - a.star);
  const cells = own.map(h => `<div class="dn-pk"><button class="tc-cell q-${HOME_Q[h.q]}" onclick="G.doiSet('${h.id}')">${tcTile(h, `<b class="tc-lv">${h.lv}</b>`)}</button><b>${h.name}</b></div>`).join('');
  const off = P.doi[dnSlot] ? `<div class="dn-pk"><button class="tc-cell dn-off" onclick="G.doiSet(null)"><b>Gỡ Ra</b></button></div>` : '';
  show(`<div class="home tc dn">
    <div class="hm-bg"></div>
    ${homeHead()}
    <div class="tc-bar"><button class="al-back" onclick="${dnBack}">Trở về</button><b>Chọn Võ Hiệp</b>
      <button class="dn-btn green sm" onclick="G.doiPick(null, 1)">Cấp Sao</button></div>
    <div class="tc-grid hd-scroll vh-list dn-grid">${off}${cells || (off ? '' : '<p class="tc-empty">Chưa có hiệp khách nào khác. Chiêu mộ thêm để ra trận.</p>')}</div>
    <nav class="hm-nav">${homeNav('hiep_khach')}</nav>
  </div>`, 'doi-pick');
}
function doiSet(id) {
  if (!id && P.doi.filter(Boolean).length <= 1) return toast('Đội cần ít nhất một hiệp khách');
  P.doi[dnSlot] = id;
  if (typeof saveGame === 'function') saveGame();
  if (dnBack === 'G.home()') renderHome(); else doiNgu();
}
function vhStyle() {
  if (document.getElementById('vh-style')) return;
  const st = document.createElement('style');
  st.id = 'vh-style';
  st.textContent = `
  .vh-grid { flex: 1; min-height: 0; display: grid; grid-template-columns: 1fr 1fr; grid-auto-rows: 1fr; gap: 3cqw 3cqw; align-content: center; padding: 2cqw 3cqw calc(30cqw + env(safe-area-inset-bottom)); }
  .vh-t { position: relative; display: flex; align-items: center; min-width: 0; max-height: 25cqw; }
  .vh-t b { position: relative; flex: 1; margin-left: -7cqw; padding: 4.4cqw 1cqw 4.4cqw 8cqw; border-radius: 2.4cqw; text-align: center; white-space: nowrap; font-size: 4.1cqw; font-weight: 800; line-height: 1.15; color: #fff3d6; text-shadow: 0 .3cqw 0 #000, 0 0 1cqw #000;
    background: linear-gradient(#7a4a26, #4e2c12); border: .6cqw solid #3a200c; box-shadow: inset 0 .5cqw 0 #a06a3a, 0 .8cqw 1cqw #0009; }
  .vh-disc { position: relative; z-index: 1; flex: none; width: 19cqw; height: 19cqw; border-radius: 50%; display: grid; place-items: center; overflow: hidden;
    background: radial-gradient(circle at 50% 40%, #6a7a6a, #2a342c 70%); border: 1.3cqw solid #b89668; box-shadow: inset 0 0 0 .5cqw #5a3a1a, inset 0 1cqw 2cqw #0008, 0 .8cqw 1.4cqw #000a; }
  .vh-disc img, .vh-disc svg { width: 84%; height: 84%; object-fit: contain; filter: drop-shadow(0 .4cqw .6cqw #000a); }
  .vh-vo_hiep img { scale: 1.2; }
  .vh-cnt { margin-left: 4cqw; }
  .vh-sell { margin-left: auto; padding: 2cqw 5cqw; border-radius: 2.4cqw !important; font: 4.6cqw 'Pattaya', serif !important; color: #fff !important; background: linear-gradient(#5aa8e8, #1f5aa0) !important; border: .6cqw solid #a8d4ff !important; box-shadow: 0 .6cqw 1cqw #0008; }
  .vh-list { padding-bottom: calc(30cqw + env(safe-area-inset-bottom)); }
  .dn-btn { padding: 2cqw 4.5cqw; border-radius: 2.4cqw !important; font: 5cqw 'Pattaya', serif !important; color: #fff !important; box-shadow: 0 .6cqw 1cqw #0008; white-space: nowrap; text-shadow: 0 .3cqw 0 #0006; }
  .dn-btn.blue { background: linear-gradient(#5aa8e8, #1f5aa0) !important; border: .6cqw solid #a8d4ff !important; }
  .dn-btn.green { background: linear-gradient(#5fbf4a, #2a7a22) !important; border: .6cqw solid #c9e08a !important; }
  .tc-bar .dn-btn { margin-left: auto; } .dn-btn.sm { font-size: 4.4cqw !important; padding: 1.6cqw 5cqw; }
  .dn-flag { display: block; width: 9cqw; height: 6.5cqw; background: linear-gradient(#e0392b, #9a1a10); clip-path: polygon(0 0, 100% 10%, 82% 50%, 100% 90%, 0 80%); border-left: .8cqw solid #6a3a10; }
  .dn-cap { display: flex; flex-direction: column; align-items: center; margin-left: auto; }
  .dn-cap em { font-style: normal; font-size: 3cqw; font-weight: 800; color: #ffe39a; text-shadow: 0 .3cqw 0 #000; margin-top: -.6cqw; }
  .dn-cap + .dn-btn { margin-left: 3cqw; }
  .dn-cards { margin-top: 2cqw; display: grid; grid-template-columns: repeat(5, 1fr); gap: 1.4cqw; padding: 2cqw 1.4cqw; background: #0006; }
  .dn-card { position: relative; aspect-ratio: 170 / 375; border-radius: 1cqw !important; overflow: visible; padding: 0; background: linear-gradient(#8a5ad0, #3a1e6a) !important; border: .6cqw solid #c9a0ff !important; box-shadow: 0 .6cqw 1cqw #000a; }
  .dn-card.q-thuong { background: linear-gradient(#5aa83a, #1f4a14) !important; border-color: #9ad870 !important; }
  .dn-card.q-hiem { background: linear-gradient(#4a7ad8, #1a3a6a) !important; border-color: #8ab0f0 !important; }
  .dn-card.q-truyen { background: linear-gradient(#d8a03a, #6a4010) !important; border-color: #ffd76a !important; }
  .dn-card > img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: 50% 0; border-radius: .6cqw; }
  .dn-card > img:not(.art) { object-fit: contain; object-position: 50% 100%; }
  .dn-card.empty { background: radial-gradient(circle at 50% 45%, #9a9a9a, #5e5e5e) !important; border-color: #b8b8b8 !important; }
  .dn-card.empty b { font: 4cqw/1.4 'Pattaya', serif; color: #4a3a2a; text-shadow: 0 .2cqw 0 #ddd; }
  .dn-card .dn-flag { position: absolute; z-index: 3; left: 10%; top: -4cqw; transform: rotate(-14deg); }
  .dn-hanh { left: auto; right: .8cqw; top: .8cqw; width: 4.6cqw; height: 4.6cqw; z-index: 2; }
  .dn-name { position: absolute; z-index: 2; right: .6cqw; top: 7cqw; writing-mode: vertical-rl; font: 3.4cqw 'Pattaya', serif; color: #fff; text-shadow: 0 0 .6cqw #000, 0 .2cqw 0 #000; max-height: 50cqw; }
  .dn-foot { position: absolute; z-index: 2; left: 0; right: 0; bottom: 0; display: flex; align-items: center; justify-content: space-between; padding: .8cqw 1cqw; background: linear-gradient(transparent, #3a1e6acc 40%); border-radius: 0 0 .6cqw .6cqw; }
  .dn-foot b { font-size: 3.6cqw; color: #fff; text-shadow: 0 .2cqw 0 #000; }
  .dn-foot .tc-st { position: static; }
  .dn-band { display: flex; align-items: center; gap: 3cqw; margin-top: 4cqw; background: linear-gradient(90deg, #3a2410, #2a1a0ccc); border-block: .4cqw solid #8a6a3a; }
  .dn-band b { padding: 1.2cqw 6cqw 1.2cqw 3cqw; font: 4cqw 'Pattaya', serif; color: #4a2a0a; background: linear-gradient(#ffe39a, #d8a84a); clip-path: polygon(0 0, 88% 0, 100% 50%, 88% 100%, 0 100%); }
  .dn-band span { font-size: 4.2cqw; font-weight: 800; color: #f3e7c9; text-shadow: 0 .3cqw 0 #000; }
  .dn-hts { display: grid; grid-template-columns: repeat(6, 1fr); gap: 1.2cqw; padding: 1.4cqw; background: #0006; }
  .dn-ht { aspect-ratio: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: .6cqw; border-radius: 1.4cqw !important; background: linear-gradient(#8a8a8a, #5a5a5a) !important; border: .6cqw solid #b8b8b8 !important; }
  .dn-ht.open { background: linear-gradient(#b89668, #6a4a2a) !important; border-color: #ffe39a !important; }
  .dn-ht small { font-size: 2.6cqw; font-weight: 800; color: #eee; white-space: nowrap; text-shadow: 0 .2cqw 0 #000; }
  .dn-lock { width: 6cqw; height: 6cqw; border-radius: 1cqw; background: #cfcfcf; position: relative; margin-top: 2cqw; }
  .dn-lock::before { content: ''; position: absolute; left: 1.2cqw; top: -3cqw; width: 2.6cqw; height: 3cqw; border: .7cqw solid #cfcfcf; border-bottom: 0; border-radius: 2cqw 2cqw 0 0; }
  .dn-acts { display: flex; justify-content: center; gap: 8cqw; padding: 12cqw 0 calc(5cqw + env(safe-area-inset-bottom)); }
  .dn-acts .dn-btn { min-width: 26cqw; font-size: 6cqw !important; padding: 2.4cqw 4cqw; }
  .dn-pk { display: flex; flex-direction: column; min-width: 0; }
  .dn-pk > b { font-size: 3.4cqw; font-weight: 700; line-height: 1.2; margin-top: .6cqw; text-shadow: 0 .3cqw 0 #000, 0 0 .8cqw #000; }
  .dn-off { background: linear-gradient(#6a6a6a, #3a3a3a) !important; border-color: #9a9a9a !important; display: grid; place-items: center; }
  .dn-off b { font: 4.6cqw 'Pattaya', serif; color: #eee; }
  .vh-disc img.km { width: 100%; height: 100%; object-fit: cover; filter: none; }
  .vh-t:active .vh-disc { transform: scale(.95); }
  `;
  document.head.appendChild(st);
}
const TANG_CAP_G = { tangCap, tcPick, tcToggle, tcHop, tcLieuInfo, voHiep, vhList, doiNgu, doiPick, doiSet };
