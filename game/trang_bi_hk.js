/* =====================================================================
   MÀN TRANG BỊ HIỆP KHÁCH (2026-11-13, người dùng chốt theo ảnh mẫu). Vào bằng 2 cách: ô Trang Bị ở Trang chủ (G.trangBi()),
   hoặc bấm 1 trong 5 ô trang bị ở màn chi tiết hiệp khách (G.trangBi(mã, ô)).
   Bố cục: phần đầu Trang chủ; thanh Trở về / "Trang Bị" / 3 tab (Cường Hóa, Phụ Linh, Ngọc — chỉ hiện khi ô đang có đồ);
   cột trái = các hiệp khách (đội trước); cột 5 ô (Mũ, Vũ khí, Giáp, Đai, Giày); bảng phải:
     · ô TRỐNG: "Trang bị có thể dùng" (lưới đồ trong túi của ô đó, bấm để chọn) + nút Mặc Nhanh;
     · ô CÓ ĐỒ: bảng Cường Hóa (trái: món hiện tại, cấp sau, nút Cường Hóa / Cao Nhất; phải: Thăng bậc, nút Nâng Cấp);
   thanh dưới: tên bộ + cấp cường hóa + chỉ số, Cấp Dùng / Loại / Giá, nút Sử Dụng, hình món, nút Gỡ Ra (đang mặc) / Bán Ra (trong túi), nguồn.
   CHỜ NGƯỜI DÙNG HƯỚNG DẪN (nút báo "chờ chốt", số hiện tạm theo ảnh mẫu): cường hóa (+5% mỗi cấp, giá), thăng bậc (cần cường hóa 6 + 2 nguyên liệu,
   chỉ số ×1,5), bán đồ, Phụ Linh, Ngọc, nguồn + chỉ số Giày. Dữ liệu món đồ ở trang_chu.js (DO_SLOTS, DO_TIERS, doFix, doBag, doAdd).
   ===================================================================== */
const TB_ORDER = ['mu', 'vk', 'ao', 'dai', 'giay'];
let tbHero = null, tbSlot = 'vk', tbPick = null, tbTab = 'ch', tbBack = 'G.home()';

function trangBi(hero, slot) {
  if (!P) return renderTitle();
  hkEnsure(); doFix();
  if (hero !== undefined) { tbBack = hero ? `G.heroView('${hero}')` : 'G.home()'; tbPick = null; tbTab = 'ch'; }
  if (hero && P.hk[hero]) tbHero = hero;
  if (!tbHero || !P.hk[tbHero]) tbHero = (hkMembers()[0] || {}).id || Object.keys(P.hk)[0];
  if (slot) tbSlot = slot;
  closeModalSilent(); homeStyle(); if (typeof aiStyle === 'function') aiStyle(); if (typeof tcStyle === 'function') tcStyle(); tbStyle(); homeNoDrag();
  const tb = el('topbar'); if (tb) tb.classList.add('hidden');
  const h = hkGet(tbHero), S = doSlot(tbSlot), worn = h.do && h.do[tbSlot], bag = doBag(tbSlot);
  if (tbPick && !bag.some(it => it.id === tbPick)) tbPick = null;
  if (!worn && !tbPick && bag.length) tbPick = bag[0].id;
  // cột hiệp khách: đội ra trận trước
  const own = Object.keys(P.hk).filter(id => HIEP_KHACH[id]).map(hkGet).sort((a, b) => (P.doi.includes(b.id) - P.doi.includes(a.id)) || (b.q - a.q) || b.lv - a.lv);
  const heroes = own.map(x => `<button class="tc-cell tb-hero q-${HOME_Q[x.q]} ${x.id === tbHero ? 'on' : ''}" onclick="G.tbHeroSet('${x.id}')">${tcTile(x, P.doi.includes(x.id) ? '<em class="tc-doi">Đội</em>' : '')}</button>`).join('');
  // cột 5 ô
  const slots = TB_ORDER.map(k => {
    const s = doSlot(k), it = h.do && h.do[k], has = doBag(k).length;
    return `<button class="tb-slot ${k === tbSlot ? 'on' : ''}" onclick="G.tbSlotSet('${k}')">
      <span class="tb-ic ${it ? '' : 'empty'}" style="--dc:${it ? DO_TIERS[it.t - 1].color : '#555'}">[[${doIcon(s, it ? it.t : 1)}]]${it && it.cp ? `<i class="tb-cp">+${it.cp}</i>` : ''}</span>
      ${it ? `<b>${DO_TIERS[it.t - 1].name}</b>` : ''}${!it && has ? '<i class="tb-dot"></i>' : ''}</button>`;
  }).join('');
  const sel = worn || bag.find(it => it.id === tbPick) || null;   // món đang xem ở thanh dưới
  const tabs = worn ? [['ch', 'Cường Hóa'], ['pl', 'Phụ Linh'], ['ng', 'Ngọc']].map(([k, t]) => `<button class="tb-tab ${tbTab === k ? 'on' : ''}" onclick="G.tbTabSet('${k}')">${t}</button>`).join('') : '';
  show(`<div class="home tb">
    <div class="hm-bg"></div>
    ${homeHead()}
    <div class="tb-bar"><button class="al-back" onclick="${tbBack}">Trở về</button><b>Trang Bị</b><span class="tb-tabs">${tabs}</span></div>
    <div class="tb-main">
      <div class="tb-heroes hd-scroll">${heroes}</div>
      <div class="tb-panel">
        <div class="tb-slots">${slots}</div>
        <div class="tb-right">${worn ? tbWornPanel(S, worn) : tbBagPanel(S, bag)}</div>
      </div>
    </div>
    ${tbInfo(S, sel, !!worn)}
  </div>`, 'trang-bi');
}
const tbIc = (s, t, cls, extra) => `<span class="tb-ic ${cls || ''}" style="--dc:${DO_TIERS[t - 1].color}">[[${doIcon(s, t)}]]${extra || ''}</span>`;
const tbStat = (s, t, cp) => (s.st ? `${DO_ST_NAME[s.st]} +${doVal(s, t, cp).toLocaleString('vi-VN')}` : 'Chưa có chỉ số');
// ô trống: danh sách đồ có thể dùng + Mặc Nhanh
function tbBagPanel(S, bag) {
  const cells = bag.map(it => `<button class="tb-cell ${it.id === tbPick ? 'on' : ''}" onclick="G.tbPickSet(${it.id})">${tbIc(S, it.t, '', it.cp ? `<i class="tb-cp">+${it.cp}</i>` : '')}</button>`).join('');
  return `<h4>Trang Bị</h4><p class="tb-sub2">Trang bị có thể dùng</p>
    <div class="tb-grid hd-scroll">${cells || '<p class="tb-none">Chưa có trang bị loại này</p>'}</div>
    <button class="tb-btn g big" ${bag.length ? '' : 'disabled'} onclick="G.tbMacNhanh()">Mặc Nhanh</button>`;
}
// ô có đồ: bảng theo tab
function tbWornPanel(S, it) {
  if (tbTab !== 'ch') return `<h4>${tbTab === 'pl' ? 'Phụ Linh' : 'Ngọc'}</h4><p class="tb-none">Sắp mở</p>`;
  const N = DO_TIERS[it.t];
  return `<h4>Cường Hóa</h4>
    <div class="tb-ch">
      <div class="tb-col">
        <small class="tb-h">Trang Bị</small>${tbIc(S, it.t)}
        <em class="tb-rib">Cường Hóa ${it.cp}</em><b>${tbStat(S, it.t, it.cp)}</b>
        <em class="tb-rib">Cấp sau</em><b>${tbStat(S, it.t, it.cp + 1)}</b>
        <button class="tb-btn g" onclick="G.tbSoon('Cường Hóa')">Cường Hóa</button>
        <button class="tb-btn b" onclick="G.tbSoon('Cường Hóa')">Cao Nhất</button>
      </div>
      <div class="tb-col">
        <small class="tb-h">Cấp sau</small>${N ? tbIc(S, it.t + 1) : '<span class="tb-ic empty" style="--dc:#555"></span>'}
        <em class="tb-rib r">Thăng bậc</em><b>${N ? tbStat(S, it.t + 1, 0) : 'Đã cao nhất'}</b>
        <i class="tb-need">${N ? 'Cấp Cường Hóa: 6' : ''}</i>
        <button class="tb-btn n" onclick="G.tbSoon('Thăng bậc')">Nâng Cấp</button>
      </div>
    </div>`;
}
// thanh thông tin dưới
function tbInfo(S, it, worn) {
  if (!it) return `<div class="tb-foot"><div class="tb-i1"><b class="tb-nm">${S.name}</b><span>Chưa có trang bị</span></div><div class="tb-i2"></div></div>`;
  const T = DO_TIERS[it.t - 1];
  return `<div class="tb-foot">
    <div class="tb-i1"><b class="tb-nm" style="color:${T.color}">${T.name}</b><em>+${it.cp}</em><span>${tbStat(S, it.t, it.cp)}</span></div>
    <div class="tb-i2">
      <div class="tb-kv"><span><i>Cấp Dùng</i><b>1</b></span><span><i>Loại</i><b>${S.name}</b></span><span><i>Bậc</i><b>${it.t}</b></span></div>
      <button class="tb-btn g tall" ${worn ? 'disabled' : ''} onclick="G.tbMac()">Sử Dụng</button>
      ${tbIc(S, it.t, 'mid')}
      ${worn ? '<button class="tb-btn g tall" onclick="G.tbGo()">Gỡ Ra</button>' : `<button class="tb-btn g tall" onclick="G.tbSoon('Bán trang bị')">Bán Ra</button>`}
      <p class="tb-src">${it.t === 1 ? 'Nhận từ ải Giang Hồ' : `Thăng bậc từ ${S.loai} ${DO_TIERS[it.t - 2].name}`}</p>
    </div>
  </div>`;
}
function tbSave() { if (typeof saveGame === 'function') saveGame(); }
function tbWear(k, it) {   // mặc món trong túi vào ô k của hiệp khách đang chọn (món đang mặc, nếu có, trả về túi)
  const H = P.hk[tbHero]; H.do = H.do || {};
  if (H.do[k]) { const o = doAdd(k, H.do[k].t); o.cp = H.do[k].cp; }
  H.do[k] = { t: it.t, cp: it.cp };
  P.doList = P.doList.filter(x => x.id !== it.id);
}
function tbMac() {
  const it = doFix().find(x => x.id === tbPick && x.k === tbSlot); if (!it) return;
  tbWear(tbSlot, it); tbPick = null; tbSave(); trangBi();
}
// Mặc Nhanh: mọi ô đang trống của hiệp khách này mặc món tốt nhất trong túi
function tbMacNhanh() {
  const H = P.hk[tbHero]; let n = 0;
  TB_ORDER.forEach(k => { if (H.do && H.do[k]) return; const best = doBag(k)[0]; if (best) { tbWear(k, best); n++; } });
  if (!n) return toast('Không có trang bị để mặc');
  tbPick = null; tbSave(); trangBi();
}
function tbGo() {
  const H = P.hk[tbHero], it = H.do && H.do[tbSlot]; if (!it) return;
  const o = doAdd(tbSlot, it.t); o.cp = it.cp; delete H.do[tbSlot];
  tbPick = o.id; tbSave(); trangBi();
}
const tbHeroSet = id => { tbHero = id; tbPick = null; trangBi(); };
const tbSlotSet = k => { tbSlot = k; tbPick = null; tbTab = 'ch'; trangBi(); };
const tbPickSet = id => { tbPick = id; trangBi(); };
const tbTabSet = k => { tbTab = k; trangBi(); };
const tbSoon = t => toast(`${t}: sắp mở`);

function tbStyle() {
  if (document.getElementById('tb-style')) return;
  const st = document.createElement('style');
  st.id = 'tb-style';
  st.textContent = `
  .home.tb { display: flex; flex-direction: column; }
  .tb-bar { box-sizing: border-box; display: flex; align-items: flex-end; gap: 2.5cqw; padding: 2.5cqw 3cqw 0; height: 13cqw; }
  .tb-bar > b { font-size: 6.4cqw; font-weight: 800; text-shadow: 0 .3cqw 0 #000, 0 0 1cqw #000; align-self: center; }
  .tb-tabs { margin-left: auto; display: flex; gap: .8cqw; }
  .tb-tab { padding: 1.6cqw 2.2cqw 1.2cqw; border-radius: 1.6cqw 1.6cqw 0 0 !important; font: 3.9cqw 'Pattaya', serif !important; color: #fff !important; background: linear-gradient(#8a8478, #5e584e) !important; border: .5cqw solid #b8b0a0 !important; border-bottom: 0 !important; text-shadow: 0 .3cqw 0 #000; white-space: nowrap; }
  .tb-tab.on { background: linear-gradient(#f0d8a8, #c8a868) !important; border-color: #fff0c8 !important; color: #3a2410 !important; text-shadow: none; padding-bottom: 2cqw; }
  .tb-main { flex: 1; min-height: 0; display: flex; gap: 2cqw; padding: 0 2.5cqw 0 3cqw; }
  /* .hd-scroll (cần để vuốt cuộn được) có flex: 1 + padding riêng ở màn chi tiết: ghi đè lại */
  .tb-main .tb-heroes.hd-scroll { flex: none; padding: 2.5cqw 1cqw 2cqw 0; }
  .tb-main .tb-grid.hd-scroll { padding: 2cqw; }
  .tb-heroes { flex: none; width: 17cqw; overflow: hidden auto; display: flex; flex-direction: column; gap: 1.6cqw; padding: 2.5cqw 1cqw 2cqw 0; }
  .tb-hero { flex: none; width: 15cqw; height: 15cqw; min-height: 0 !important; margin-left: .6cqw; }
  .tb-hero.on { box-shadow: 0 0 0 .6cqw #ffd43b, 0 0 2cqw #ffd43b; }
  .tb-panel { flex: 1; min-width: 0; display: flex; background: #8a8478; border: .6cqw solid #b8b0a0; border-radius: 1.2cqw; box-shadow: inset 0 0 2cqw #0006, 0 .6cqw 1.2cqw #0008; }
  .tb-slots { flex: none; width: 17cqw; display: flex; flex-direction: column; justify-content: space-around; padding: 1cqw 0; }
  .tb-slot { position: relative; display: flex; flex-direction: column; align-items: center; padding: 1.2cqw 0 .6cqw 1.2cqw; border-radius: 1.2cqw 0 0 1.2cqw !important; }
  .tb-slot.on { background: linear-gradient(90deg, #f0d8a8, #d8b878) !important; box-shadow: inset 0 0 0 .5cqw #fff0c8; }
  .tb-slot b { margin-top: .4cqw; font-size: 2.9cqw; font-weight: 700; white-space: nowrap; text-shadow: 0 .3cqw 0 #000, 0 0 .6cqw #000; }
  .tb-ic { position: relative; flex: none; display: grid; place-items: center; width: 12.5cqw; height: 12.5cqw; border-radius: 1.2cqw; border: .5cqw solid var(--dc); background: #1e1812; overflow: hidden; }
  .tb-ic svg, .tb-ic .ic { width: 100%; height: 100%; }
  .tb-ic.empty { border-color: #4a463e; } .tb-ic.empty svg, .tb-ic.empty .ic { opacity: .22; filter: grayscale(1); }
  .tb-ic.mid { width: 13cqw; height: 13cqw; }
  .tb-cp { position: absolute; left: .6cqw; top: .3cqw; font: normal 800 2.8cqw/1 sans-serif; color: #7dff7a; text-shadow: 0 0 .5cqw #000, 0 .2cqw 0 #000; }
  .tb-dot { position: absolute; top: .8cqw; right: 1.2cqw; width: 2.6cqw; height: 2.6cqw; border-radius: 50%; background: #ff3a2a; border: .3cqw solid #fff; }
  .tb-right { flex: 1; min-width: 0; display: flex; flex-direction: column; align-items: center; margin: 1.2cqw 1.2cqw 1.2cqw 0; padding: 1cqw 1.2cqw 1.6cqw; background: #77716a; border: .5cqw solid #5a544c; border-radius: 1cqw; }
  .tb-right h4 { margin: 0 0 1cqw; font: 5cqw 'Pattaya', serif; color: #fff; text-shadow: 0 .3cqw 0 #000; }
  .tb-sub2 { margin: 0 0 1.2cqw; font-size: 3.6cqw; font-weight: 700; text-shadow: 0 .3cqw 0 #000; }
  .tb-none { margin: 6cqw 0; font-size: 3.6cqw; opacity: .85; text-align: center; }
  .tb-grid { flex: 1; min-height: 0; width: 100%; overflow-y: auto; display: grid; grid-template-columns: repeat(3, 1fr); grid-auto-rows: max-content; gap: 2cqw; padding: 2cqw; background: #3a3632; border-radius: .8cqw; box-shadow: inset 0 0 2cqw #000a; justify-items: center; align-content: start; }
  .tb-cell { border-radius: 1.2cqw !important; padding: .5cqw; }
  .tb-cell.on { box-shadow: 0 0 0 .6cqw #ffe45a, 0 0 2cqw #ffe45a; }
  .tb-ch { flex: 1; min-height: 0; width: 100%; display: flex; gap: 1cqw; }
  .tb-col { flex: 1; min-width: 0; display: flex; flex-direction: column; align-items: center; gap: 1.1cqw; padding: 1.2cqw .6cqw 1.6cqw; background: linear-gradient(#2a4a22, #16300f); border: .4cqw solid #10200a; border-radius: .6cqw; }
  .tb-col .tb-ic { width: 14cqw; height: 14cqw; margin-bottom: .6cqw; }
  .tb-h { font: 3.2cqw 'Pattaya', serif; }
  .tb-col b { font-size: 3.6cqw; font-weight: 700; white-space: nowrap; text-shadow: 0 .3cqw 0 #000; }
  .tb-rib { align-self: flex-start; font-style: normal; font-size: 3.2cqw; font-weight: 700; padding: .5cqw 3.4cqw .5cqw 1.6cqw; background: #b03a2a; clip-path: polygon(0 0, 88% 0, 100% 50%, 88% 100%, 0 100%); white-space: nowrap; }
  .tb-need { min-height: 4cqw; white-space: nowrap; font-style: normal; font-size: 2.9cqw; font-weight: 800; color: #ff4a3a; text-shadow: 0 .2cqw 0 #000; }
  .tb-btn { padding: 1.4cqw 2cqw; min-width: 70%; border-radius: 2cqw !important; font: 4.2cqw 'Pattaya', serif !important; color: #fff !important; background: linear-gradient(#6fcf5a, #2a7a22) !important; border: .5cqw solid #c9e08a !important; box-shadow: 0 .5cqw .9cqw #0008; text-shadow: 0 .3cqw 0 #1a4a10; white-space: nowrap; }
  .tb-btn.b { background: linear-gradient(#5aa8f0, #1e4a9a) !important; border-color: #b8d8ff !important; text-shadow: 0 .3cqw 0 #0a2050; }
  .tb-btn.n { margin-top: auto; background: linear-gradient(#3a5a8a, #1a2a4a) !important; border-color: #6a8ab0 !important; color: #b8c8e0 !important; }
  .tb-col .tb-btn.g { margin-top: auto; }
  .tb-btn.big { margin-top: 3cqw; min-width: 46%; padding: 2cqw 4cqw; font-size: 4.8cqw !important; }
  .tb-btn.tall { min-width: 0; width: 13cqw; height: 16cqw; padding: 0 1cqw; white-space: normal; line-height: 1.15; font-size: 4cqw !important; }
  .tb-btn:disabled { filter: grayscale(.8) brightness(.7); }
  .tb-foot { flex: none; margin: 1.5cqw 0 calc(2cqw + env(safe-area-inset-bottom)); background: #2a2622; border-top: .4cqw solid #5a544c; }
  .tb-i1 { box-sizing: border-box; height: 7cqw; display: flex; align-items: center; gap: 2.5cqw; white-space: nowrap; padding: .8cqw 3cqw; background: #3a342c; font-size: 3.8cqw; font-weight: 700; }
  .tb-i1 em { font-style: normal; color: #7dff7a; }
  .tb-i2 { box-sizing: border-box; display: flex; align-items: center; gap: 1.6cqw; padding: 1.4cqw 2cqw; height: 19cqw; }   /* cao cố định: có / không có đồ khung trên vẫn giữ nguyên cỡ */
  .tb-kv { flex: none; width: 27cqw; display: flex; flex-direction: column; gap: .6cqw; }
  .tb-kv span { display: flex; justify-content: space-between; gap: 1cqw; padding: .4cqw 1.4cqw; background: #1a1612; font-size: 3.5cqw; }
  .tb-kv i { font-style: normal; color: #ff9a2a; font-weight: 700; } .tb-kv b { font-weight: 700; white-space: nowrap; }
  .tb-src { flex: 1; min-width: 0; margin: 0; padding: 1.4cqw 1.6cqw; align-self: stretch; display: flex; align-items: center; background: #1a1612; font-size: 3.4cqw; font-weight: 700; line-height: 1.25; }
  `;
  document.head.appendChild(st);
}

const TRANG_BI_G = { trangBi, tbHeroSet, tbSlotSet, tbPickSet, tbTabSet, tbMac, tbMacNhanh, tbGo, tbSoon };
