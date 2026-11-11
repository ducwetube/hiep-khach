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
  const pt = h.art ? `<img class="art" src="${h.art}" alt="">` : `<img src="game/img/quai/${h.img}.png" alt="">`;
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
  const add = tcPicks * TANG_CAP.exp, aft = hkLvAfter(h.lv, h.exp, add), st = heroSt(h), g = h.grow || {};
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
const TANG_CAP_G = { tangCap, tcPick, tcToggle, tcHop, tcLieuInfo };
