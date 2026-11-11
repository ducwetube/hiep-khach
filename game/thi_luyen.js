'use strict';
/* =================================================================
   THÍ LUYỆN (người dùng chốt 2026-11-07): hoạt động hằng ngày kiếm bạc + kinh nghiệm, ô "Thí Luyện" ở thẻ Thanh Vân Môn (G.thiLuyen).
   Hai ải, mỗi ải THI_LUYEN.perDay lượt mỗi ngày (ngày thật), vào ải là mất một lượt (thua cũng mất).
   - Tàng Bảo Khố (bạc): 5 đợt quái liên tiếp, máu không hồi giữa các đợt (được uống thuốc), qua mỗi đợt nhận một phần bạc;
     thua giữa chừng vẫn giữ bạc các đợt đã qua. Tối đa = THI_LUYEN.bk.gold × bạc một quái thường cùng cấp độ khó.
   - Ngộ Đạo Đài (kinh nghiệm; người dùng đổi 2026-11-07): Mộc Nhân Thủ Hộ không đánh trả, đánh đủ THI_LUYEN.nd.turns lượt,
     kinh nghiệm = tổng sát thương × hệ số độ khó (cấp 10 ×1, 20 ×2 … 100 ×10).
   - Độ khó mở theo mốc 10 cấp (cấp 10, 20 … 100), quái cấp bằng mốc.
   - Quét nhanh: Tàng Bảo Khố độ khó đã thắng trọn → nhận bạc trọn; Ngộ Đạo Đài độ khó đã đánh → kỷ lục sát thương × hệ số. Vẫn tốn một lượt.
   P.tl = { day, used: { bk, nd }, best: { bk }, dmg: { độ khó: kỷ lục sát thương Ngộ Đạo } }
   ================================================================= */
const THI_LUYEN = {
  perDay: 3,
  diffs: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100], // cấp mở = cấp quái
  bk: {
    name: 'Tàng Bảo Khố', gold: 300, // người dùng chốt 2026-11-07: 100 → 200 → 300 (treo thật ~1.000 quái / giờ)
    lore: 'Kho bạc cũ của Thanh Vân bị bọn đạo tặc chiếm làm sào huyệt. Đánh bật chúng ra, bạc thu về được thì giữ.',
    waves: [2, 2, 3, 4, 5],             // số quái mỗi đợt; đợt cuối có Khố Chủ cầm đầu
    share: [10, 15, 20, 25, 30],         // % bạc tối đa nhận khi qua mỗi đợt
    grow: 0.06,                          // đạo tặc mạnh dần theo độ khó: khí huyết, công, thủ × (1 + grow × (độ khó − 1))
    mobs: [['Đạo Tặc Giữ Kho', 'son_tac_do'], ['Phi Tặc Trộm Bạc', 'thao_khau'], ['Tay Chân Đạo Tặc', 'luu_manh']],
    boss: { name: 'Khố Chủ Đạo Tặc', art: 'kho_chu', move: { name: 'Kim Tiền Phá Sơn', power: 2, effect: { type: 'stun', chance: 20, turns: 1 } } },
  },
  /* Ngộ Đạo Đài (người dùng đổi 2026-11-07): mộc nhân không đánh trả, không chết; đánh đủ turns lượt,
     kinh nghiệm = tổng sát thương × hệ số độ khó (cấp 10 ×1, cấp 20 ×2 … cấp 100 ×10).
     Bot đo (đường Chưởng, đủ đồ + võ học): 10 lượt ~4.200 sát thương ở cấp 20, 6.500 ở 40, 10.200 ở 60, 13.100 ở 90. */
  nd: {
    name: 'Ngộ Đạo Đài', turns: 10,
    lore: 'Mộc nhân do tổ sư Thanh Vân để lại, càng đánh càng ngộ ra võ lý.',
    dummy: { name: 'Mộc Nhân Thủ Hộ', art: 'moc_nhan_tl' },
  },
  card: { bk: 'game/img/thi_luyen/kho_chu.jpg', nd: 'game/img/thi_luyen/moc_nhan.jpg' }, // tranh trên bảng (ảnh Gemini người dùng)
};
const tlDiffLv = d => THI_LUYEN.diffs[d - 1];
const tlDay = () => { const d = new Date(); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; };
function tlState() {
  if (!P.tl) P.tl = { day: tlDay(), used: {}, best: {} };
  if (P.tl.day !== tlDay()) Object.assign(P.tl, { day: tlDay(), used: {} });
  return P.tl;
}
const tlLeft = k => THI_LUYEN.perDay - (tlState().used[k] || 0);
const tlBest = k => tlState().best[k] || 0;
const tlGoldMax = d => Math.round(TG.mob.gold(tlDiffLv(d)) * THI_LUYEN.bk.gold);
const tlMul = d => d; // hệ số kinh nghiệm Ngộ Đạo Đài: độ khó 1 (cấp 10) ×1 … độ khó 10 (cấp 100) ×10
const tlRec = d => (tlState().dmg || {})[d] || 0; // kỷ lục sát thương ở độ khó d (để Quét nhanh)
// Độ khó đã qua cao nhất: Tàng Bảo Khố = thắng trọn, Ngộ Đạo Đài = đã đánh xong (có kỷ lục)
const tlDone = k => (k === 'bk' ? tlBest('bk') : Math.max(0, ...Object.keys(tlState().dmg || {}).filter(d => tlRec(+d) > 0).map(Number)));
// Không nhảy cóc (người dùng chốt 2026-11-08): độ khó n cần đủ cấp và đã qua độ khó n − 1
const tlOk = (k, n) => n >= 1 && n <= THI_LUYEN.diffs.length && P.lv >= tlDiffLv(n) && n <= tlDone(k) + 1;
const tlOpenD = k => THI_LUYEN.diffs.filter((lv, i) => (k ? tlOk(k, i + 1) : P.lv >= lv)).length; // độ khó cao nhất mở được
const tlWaveGold = (d, w) => Math.round(tlGoldMax(d) * THI_LUYEN.bk.share[w - 1] / 100);
let tlTab = 'bk', tlSel = {}, tlRun = null, tlNote = '';

/* ---------------------------- Bảng Thí Luyện ---------------------------- */
function thiLuyen(tab) {
  tlState();
  tlStyle();
  if (tab) tlTab = tab;
  const k = tlTab, A = THI_LUYEN[k], open = tlOpenD(k);
  let d = tlSel[k] || (k === 'nd' ? Math.max(1, open) : Math.max(1, Math.min(open, tlBest(k) + 1)));
  if (d > Math.max(1, open)) d = Math.max(1, open);
  tlSel[k] = d;
  const lv = tlDiffLv(d), left = tlLeft(k), best = tlBest(k);
  const tabs = ['bk', 'nd'].map(x => `<button class="tl-tab${x === k ? ' on' : ''}" onclick="G.thiLuyen('${x}')">${x === 'bk' ? '[[bac]]' : '[[kinh_nghiem]]'}<b>${THI_LUYEN[x].name}</b><small>${tlLeft(x)} / ${THI_LUYEN.perDay}</small></button>`).join('');
  const vi = n => n.toLocaleString('vi-VN');
  const done = n => (k === 'bk' ? n <= best : tlRec(n) > 0);
  const chips = THI_LUYEN.diffs.map((v, i) => { const n = i + 1, lock = !tlOk(k, n);
    return `<button class="tl-d${n === d ? ' sel' : ''}${lock ? ' locked' : ''}" ${lock ? 'disabled' : `onclick="G.tlPick(${n})"`}>${done(n) ? '<i>✦</i>' : ''}Cấp ${v}</button>`; }).join('');
  const art = `<img class="tl-card" src="${THI_LUYEN.card[k]}" alt="">`;
  let steps, max, canSweep;
  if (k === 'bk') {
    steps = A.waves.map((n, i) => `<div class="tl-st"><em>Đợt ${i + 1}</em><b>${n} tên${i === A.waves.length - 1 ? ' + Khố Chủ' : ''}</b><span>[[bac]] ${vi(tlWaveGold(d, i + 1))}</span></div>`).join('');
    max = `<small>Tối đa</small>[[bac]] ${vi(tlGoldMax(d))} lượng`;
    canSweep = d <= best;
  } else {
    const rec = tlRec(d);
    steps = `<div class="tl-st"><em>Số lượt</em><b>${A.turns}</b></div><div class="tl-st"><em>Hệ số</em><b>×${tlMul(d)}</b></div>`
      + `<div class="tl-st wide"><em>Kỷ lục sát thương</em><b>${rec ? vi(rec) : 'Chưa có'}</b>${rec ? `<span>[[kinh_nghiem]] ${vi(rec * tlMul(d))}</span>` : ''}</div>`;
    max = `<small>Kinh nghiệm</small>[[kinh_nghiem]] Sát thương × ${tlMul(d)}`;
    canSweep = rec > 0;
  }
  let btns;
  if (!open) btns = `<button class="btn" disabled>Cần đạt cấp ${THI_LUYEN.diffs[0]}</button>`;
  else if (left <= 0) btns = `<button class="btn" disabled>Hết lượt hôm nay</button>`;
  else btns = `${canSweep ? `<button class="btn" onclick="G.tlSweep()">Quét nhanh</button>` : ''}<button class="btn primary" onclick="G.tlFight()">Khiêu chiến</button>`;
  openModal(`<h3 class="tl-title">Thí Luyện</h3>
    <div class="tl-tabs">${tabs}</div>
    <div class="tl-main">
      <div class="tl-fig">${art}</div>
      <div class="tl-info">
        <div class="tl-name">${A.name}</div>
        <p class="tl-lore">${A.lore}</p>
        <div class="tl-max">${max}</div>
        <div class="tl-left">Còn <b>${Math.max(0, left)} / ${THI_LUYEN.perDay}</b> lượt hôm nay</div>
      </div>
    </div>
    <div class="tl-ds">${chips}</div>
    <div class="tl-sts">${steps}</div>
    ${tlNote ? `<div class="tl-note">${tlNote}</div>` : ''}
    <div class="row-btns">${btns}</div>`);
  tlNote = '';
}
function tlPick(n) { if (tlOk(tlTab, n)) { tlSel[tlTab] = n; thiLuyen(); } }
// Quét nhanh: Tàng Bảo Khố độ khó đã thắng trọn → bạc trọn; Ngộ Đạo Đài độ khó đã có kỷ lục → kỷ lục × hệ số
function tlSweep() {
  const k = tlTab, d = tlSel[k];
  if (!d || tlLeft(k) <= 0 || (combat && !combat.over)) return;
  if (k === 'bk' ? d > tlBest(k) : !tlRec(d)) return;
  tlState().used[k] = (tlState().used[k] || 0) + 1;
  let lines;
  if (k === 'bk') { const g = tlGoldMax(d); P.gold += g; lines = [`[[bac]] Quét ${THI_LUYEN.bk.name} cấp ${tlDiffLv(d)}: +${g.toLocaleString('vi-VN')} lượng`]; }
  else { const e = withBonus(tlRec(d) * tlMul(d)); lines = [`[[kinh_nghiem]] Quét ${THI_LUYEN.nd.name} cấp ${tlDiffLv(d)}: +${e.toLocaleString('vi-VN')} kinh nghiệm`, ...gainExp(e)]; }
  log(lines.join(' · '));
  snd('jingle', 'quest');
  saveGame(true);
  renderTop();
  tlNote = lines.join('<br>');
  thiLuyen();
}
function tlFight() {
  const k = tlTab, d = tlSel[k];
  if (!d || !tlOk(k, d) || tlLeft(k) <= 0 || (combat && !combat.over)) return;
  tlState().used[k] = (tlState().used[k] || 0) + 1;
  const s = getStats();
  P.hp = s.hp; P.mp = s.mp; // vào ải hồi đầy
  closeModalSilent();
  saveGame(true);
  if (k === 'bk') { tlRun = { k, d, wave: 1, gold: 0 }; tlWave(); }
  else tlDummy(d);
}
// Bản đồ giả để dựng quái bằng tgMake (the_gioi.js)
const tlMap = () => ({ id: 'thi_luyen', city: 'duong_chau', mobs: THI_LUYEN.bk.mobs, boss: THI_LUYEN.bk.boss });
function tlMob(lv, j) {
  const E = tgMake(tlMap(), j, lv, j < 0), g = 1 + THI_LUYEN.bk.grow * (THI_LUYEN.diffs.indexOf(lv));
  ['hp', 'atk', 'def'].forEach(s => { E[s] = Math.round(E[s] * g); });
  E.id = j < 0 ? 'tl_bk_boss' : 'tl_bk_' + j;
  E.skills = tgArm(E);
  if (j < 0) {
    E.skills.unshift(Object.assign({ type: 'attack', chance: 30, mp: 0 }, THI_LUYEN.bk.boss.move));
    E.intro = `<b>${E.name}</b>: "Bạc trong kho này là của ta!"`;
  }
  return E;
}
function tlWave() {
  const R = tlRun, A = THI_LUYEN.bk, lv = tlDiffLv(R.d), n = A.waves[R.wave - 1], last = R.wave === A.waves.length;
  const list = [];
  if (last) list.push(tlMob(lv, -1));
  while (list.length < n + (last ? 1 : 0)) list.push(tlMob(lv, list.length % A.mobs.length));
  startCombat(list, { story: true, noFlee: true, noHeal: true, stageText: `${A.name} · Đợt ${R.wave}/${A.waves.length}`, onEnd: r => tlWaveEnd(r) });
}
function tlWaveEnd(result) {
  const R = tlRun, A = THI_LUYEN.bk, lines = [];
  if (result === 'win') {
    const g = tlWaveGold(R.d, R.wave);
    R.gold += g; P.gold += g;
    lines.push(`[[chien_thang]] Qua đợt <b>${R.wave}/${A.waves.length}</b>`, `[[bac]] +${g.toLocaleString('vi-VN')} lượng`);
    if (R.wave < A.waves.length) {
      R.wave++;
      return { lines, btn: `Đợt ${R.wave} ➜`, cls: 'win', keepHp: true, after: tlWave };
    }
    const t = tlState();
    if (R.d > (t.best.bk || 0)) { t.best.bk = R.d; lines.push(`✦ Thắng trọn cấp ${tlDiffLv(R.d)}: từ nay được Quét nhanh.`); }
  } else lines.push(`[[tu_vong]] Thất thủ ở đợt <b>${R.wave}</b>.`);
  lines.push(`Tổng thu: [[bac]] <b>${R.gold.toLocaleString('vi-VN')}</b> lượng`);
  log(`[[bac]] ${A.name} cấp ${tlDiffLv(R.d)}: ${result === 'win' ? 'thắng trọn' : `dừng ở đợt ${R.wave}`}, +${R.gold} lượng.`);
  tlRun = null;
  return { lines, btn: 'Về Thí Luyện', cls: result === 'win' ? 'win' : 'lose', after: tlBack };
}
// Mộc nhân: không đánh trả (idle), không chết (khí huyết rất lớn, bảng tên hiện tổng sát thương thay cho máu: dummy)
const TL_DUMMY_HP = 1e9;
function tlDummy(d) {
  const A = THI_LUYEN.nd, lv = tlDiffLv(d), Q = TG.mob, k = lv - 1;
  const E = {
    id: 'tl_nd', name: A.dummy.name, icon: A.dummy.art, lv, story: true, tg: 'thi_luyen', idle: true, dummy: true,
    hp: TL_DUMMY_HP, mp: 0, atk: 1, def: Math.round(Q.def[0] + Q.def[1] * k), spd: 1,
    crit: 0, dodge: 0, critDmg: 150, acc: Q.acc, critRes: 0, exp: 0, gold: 0, skills: [],
    intro: `Mộc nhân đứng im, chờ ngươi ra chiêu.`,
  };
  startCombat(E, { story: true, noFlee: true, survive: A.turns, survLabel: 'Lượt', stageText: `${A.name} · Cấp ${lv}`, onEnd: r => tlDummyEnd(d, r) });
}
function tlDummyEnd(d, result) {
  const A = THI_LUYEN.nd, en = combat.ens[0];
  const dmg = Math.max(0, Math.round(en.maxHp - en.hp));
  const exp = withBonus(dmg * tlMul(d));
  const t = tlState(), rec = tlRec(d);
  const lines = [`[[muc_tieu]] Tổng sát thương: <b>${dmg.toLocaleString('vi-VN')}</b> × ${tlMul(d)}`];
  if (exp) lines.push(`[[kinh_nghiem]] +${exp.toLocaleString('vi-VN')} kinh nghiệm`, ...gainExp(exp));
  if (dmg > rec) { (t.dmg || (t.dmg = {}))[d] = dmg; lines.push(`✦ Kỷ lục mới ở cấp ${tlDiffLv(d)}${rec ? ` (cũ ${rec.toLocaleString('vi-VN')})` : ''}.`); }
  log(`[[kinh_nghiem]] ${A.name} cấp ${tlDiffLv(d)}: ${dmg} sát thương, +${exp} kinh nghiệm.`);
  return { lines, btn: 'Về Thí Luyện', cls: 'win', after: tlBack };
}
function tlBack() { renderWorld(); thiLuyen(); }

/* ---------------------------- Chỗ khác gọi ---------------------------- */
// Phụ đề ô Thí Luyện ở thẻ Thanh Vân
const tlSub = () => (!P || P.lv < THI_LUYEN.diffs[0] ? `Mở ở cấp ${THI_LUYEN.diffs[0]}` : `Còn ${tlLeft('bk') + tlLeft('nd')} lượt`);
// Dòng trong menu Nhiệm vụ
function tlQuestRows() {
  if (!P || P.lv < THI_LUYEN.diffs[0]) return '';
  return ['bk', 'nd'].filter(k => tlLeft(k) > 0).map(k => `<div class="quest">
      <div class="q-name">${k === 'bk' ? '[[bac]]' : '[[kinh_nghiem]]'} Thí Luyện · ${THI_LUYEN[k].name}</div>
      <div class="q-prog">Còn ${tlLeft(k)} / ${THI_LUYEN.perDay} lượt hôm nay</div>
    </div>`).join('');
}

function tlStyle() {
  if (document.getElementById('tl-style')) return;
  const st = document.createElement('style');
  st.id = 'tl-style';
  st.textContent = `
    .tl-tabs { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 10px; }
    .tl-tab { display: grid; grid-template-columns: auto 1fr; align-items: center; column-gap: 8px; padding: 8px 10px; border-radius: 10px; cursor: pointer; font: inherit; text-align: left;
      color: var(--ink); background: rgba(255,255,255,.04); border: 1px solid rgba(201,162,92,.3); font-size: 26px; }
    .tl-tab svg { width: 30px; height: 30px; grid-row: span 2; }
    .tl-tab b { font-size: 14px; line-height: 1.2; }
    .tl-tab small { font-size: 11.5px; color: var(--muted); }
    .tl-tab.on { border-color: #ffcf5a; background: rgba(201,162,92,.18); box-shadow: 0 0 10px rgba(255,190,70,.35); }
    .tl-main { display: grid; grid-template-columns: 34% 1fr; gap: 12px; align-items: start; }
    .tl-fig { aspect-ratio: 3 / 4; border-radius: 8px; display: grid; place-items: end center; overflow: hidden;
      background: radial-gradient(ellipse at 50% 85%, rgba(201,162,92,.28), transparent 60%), rgba(255,255,255,.04); border: 1px solid rgba(201,162,92,.3); }
    .tl-fig svg { width: 100%; height: 100%; }
    .tl-fig .tl-card { width: 100%; height: 100%; object-fit: cover; display: block; }
    .tl-st.wide { grid-column: span 3; }
    .tl-name { font-family: 'Pattaya', serif; font-size: 23px; line-height: 1.15; color: #fff4dc; }
    .tl-lore { margin: 4px 0 8px; font-size: 13px; line-height: 1.45; color: var(--muted); font-style: italic; }
    .tl-max { font-size: 15px; color: #ffe0a0; }
    .tl-max small { display: block; font-size: 11px; color: var(--muted); }
    .tl-max svg { width: 20px; height: 20px; vertical-align: -4px; }
    .tl-left { margin-top: 6px; font-size: 13px; color: var(--muted); }
    .tl-left b { color: var(--ink); }
    .tl-ds { display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; margin: 12px 0 8px; }
    .tl-d { position: relative; padding: 6px 2px; border-radius: 8px; cursor: pointer; font: inherit; font-size: 12.5px; color: var(--ink);
      background: rgba(255,255,255,.05); border: 1px solid rgba(201,162,92,.35); }
    .tl-d i { position: absolute; top: -7px; right: -3px; font-style: normal; font-size: 12px; color: #ffcf5a; }
    .tl-d.sel { border-color: #ffcf5a; background: rgba(201,162,92,.28); color: #fff4dc; box-shadow: 0 0 8px rgba(255,190,70,.4); }
    .tl-d.locked { opacity: .4; cursor: default; }
    .tl-sts { display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; }
    .tl-st { display: flex; flex-direction: column; align-items: center; gap: 2px; padding: 6px 2px; border-radius: 8px; text-align: center;
      background: rgba(255,255,255,.04); border: 1px solid rgba(201,162,92,.22); }
    .tl-st em { font-style: normal; font-size: 11px; color: var(--muted); }
    .tl-st b { font-size: 11.5px; font-weight: normal; color: var(--ink); line-height: 1.2; }
    .tl-st span { font-size: 11.5px; color: #ffe0a0; white-space: nowrap; }
    .tl-st svg { width: 14px; height: 14px; vertical-align: -2px; }
    .tl-note { margin-top: 10px; padding: 6px 10px; border-radius: 8px; font-size: 13px; background: rgba(120,180,90,.14); border: 1px solid rgba(140,200,110,.4); }
    .cd-sts { grid-template-columns: repeat(3, 1fr); }
    .tl-fig .tl-card.cd-fig { object-fit: contain; padding: 6px; box-sizing: border-box; }
    .tl-d small { font-size: 10.5px; color: var(--muted); }
    @media (max-width: 380px) { .tl-st span { font-size: 10.5px; } .tl-d { font-size: 11.5px; } }`;
  document.head.appendChild(st);
}

/* =================================================================
   BẾ QUAN (thưởng khi vắng mặt, người dùng chốt 2026-11-07): thời gian từ lần lưu cuối tới lúc quay lại game
   (mở lại trang, hoặc quay lại tab sau khi để chạy nền) cộng dồn vào P.bq (phút), tối đa BE_QUAN.maxMin.
   Mỗi giờ = BE_QUAN.perHour quái thường cùng cấp nhân vật, cả kinh nghiệm lẫn bạc; không thưởng thành thạo.
   Vắng dưới BE_QUAN.minMin phút thì không tính. Nhận ở bảng hiện lúc quay lại, hoặc ở menu Nhiệm vụ.
   ================================================================= */
const BE_QUAN = { perHour: 150, maxMin: 12 * 60, minMin: 10 };
const bqExp = min => Math.round(TG.mob.exp(P.lv) * BE_QUAN.perHour * min / 60);
const bqGold = min => Math.round(TG.mob.gold(P.lv) * BE_QUAN.perHour * min / 60);
const bqTime = min => `${Math.floor(min / 60)} giờ ${min % 60} phút`;
// Cộng thời gian vắng mặt (gọi khi vào game / quay lại tab), rồi hiện bảng nếu đang rảnh
function bqCheck() {
  if (!P || !P.savedAt) return;
  const gap = Math.floor((Date.now() - P.savedAt) / 60000);
  if (gap >= BE_QUAN.minMin) {
    P.bq = Math.min(BE_QUAN.maxMin, (P.bq || 0) + gap);
    saveGame(true);
  }
  if ((P.bq || 0) >= BE_QUAN.minMin && !(combat && !combat.over) && el('modal').classList.contains('hidden') && el('screen').querySelector('.world, .home')) beQuan();
}
function beQuan() {
  const min = P.bq || 0;
  if (!min) return;
  openModal(`<h3 class="tl-title">Bế Quan Tu Luyện</h3>
    <p class="tl-lore">Trong lúc ngươi vắng mặt, ngươi đã bế quan tĩnh tu <b>${bqTime(min)}</b>${min >= BE_QUAN.maxMin ? ' (đã đầy)' : ''}.</p>
    <div class="tn-rws" style="justify-content:center">
      <span class="tn-rw" style="width:110px">[[kinh_nghiem]]<em>${withBonus(bqExp(min)).toLocaleString('vi-VN')} kinh nghiệm</em></span>
      <span class="tn-rw" style="width:110px">[[bac]]<em>${bqGold(min).toLocaleString('vi-VN')} lượng</em></span>
    </div>
    <div class="row-btns"><button class="btn primary" onclick="G.bqClaim()">Nhận</button></div>`);
  if (typeof tnStyle === 'function') tnStyle(); // dùng chung kiểu ô thưởng của Truy Nã
}
function bqClaim() {
  const min = P.bq || 0;
  if (!min) return closeModalSilent();
  const exp = withBonus(bqExp(min)), gold = bqGold(min);
  P.bq = 0;
  P.gold += gold;
  const lines = [`[[nghi_ngoi]] Bế quan ${bqTime(min)}: +${exp.toLocaleString('vi-VN')} kinh nghiệm, +${gold.toLocaleString('vi-VN')} lượng`, ...gainExp(exp)];
  log(lines.join(' · '));
  snd('jingle', 'quest');
  saveGame(true);
  closeModalSilent();
  renderTop();
  if (!(combat && !combat.over) && el('screen').querySelector('.world')) renderWorld();
  toast(lines[0]);
}
// Dòng trong menu Nhiệm vụ (còn phần thưởng bế quan chưa nhận)
function bqQuestRows() {
  if (!P || (P.bq || 0) < BE_QUAN.minMin) return '';
  return `<div class="quest"><div class="q-name">[[nghi_ngoi]] Bế quan ${bqTime(P.bq)}</div>
    <div class="row-btns left"><button class="btn small primary" onclick="G.bqClaim()">Nhận thưởng</button></div></div>`;
}
// Quay lại tab sau khi để chạy nền: rời đi thì lưu (ghi mốc giờ), quay lại thì tính thời gian vắng
document.addEventListener('visibilitychange', () => {
  if (typeof P === 'undefined' || !P || typeof saveGame !== 'function') return; // sổ tay cũng nạp file này
  if (document.hidden) saveGame(true);
  else bqCheck();
});

/* =================================================================
   CẤM ĐỊA (người dùng chốt 2026-11-08): sào huyệt giữa vùng (huy hiệu hub trên bản đồ vùng) mở thành cấm địa.
   Cấm Địa Trường Sinh Đường (Sa Mạc Man Hoang): mở ở cấp 40. Chọn 1 trong 5 độ khó (quái cấp 40 / 50 / 60 / 70 / 80),
   rồi vượt 6 ải liên tiếp: 6 đệ tử ngoại môn → 5 nội môn → 4 tinh anh → 3 chân truyền → 2 trưởng lão → Tông chủ Ngọc Dương Tử.
   Phải hạ hết quái mỗi ải; vào cấm địa hồi đầy, giữa các ải KHÔNG hồi khí huyết / nội lực; thua là hết lượt, lần sau làm lại từ ải 1.
   Claude đặt (người dùng chưa duyệt): không nhảy cóc độ khó (qua độ khó trước mới mở độ khó sau, như Thí Luyện);
   vẫn uống thuốc được trong trận; không giới hạn số lần; sức quái mỗi ải (mul), tên trưởng lão / Đường chủ, chiêu riêng;
   vượt qua bất kỳ độ khó nào là bật cờ flag (điều kiện thứ 4 lên Đệ tử tinh anh). Chưa có phần thưởng (chờ người dùng).
   P.cd = { <mã cấm địa>: { best: độ khó cao nhất đã vượt (0 = chưa) } }
   ================================================================= */
const CAM_DIA = {
  truong_sinh: {
    name: 'Cấm Địa Trường Sinh Đường', hub: 'lac_duong', minLv: 40, flag: 'cam_dia_truong_sinh',
    lore: 'Tường đá đỏ bao quanh ao máu sôi sục. Từ ngoại môn tới Tông chủ, kẻ nào trong thành cũng sống bằng máu người.',
    diffs: [['Dễ', 40], ['Thường', 50], ['Khó', 60], ['Cực Khó', 70], ['Địa Ngục', 80]],
    // Mỗi ải: tên, số quái, [tên quái, hình, hút huyết %], hệ số khí huyết / công / thủ; elite = dựng như Tinh Anh (TG.boss) kèm chiêu riêng
    stages: [
      // Hình riêng (ảnh Gemini người dùng 2026-11-08, ENEMY_IMG cd_ts_* / ngoc_duong_tu trong chibi_quai.js)
      { name: 'Ngoại môn', n: 6, mob: ['Đệ Tử Ngoại Môn', 'cd_ts_ngoai', 20], mul: 1 },
      { name: 'Nội môn', n: 5, mob: ['Đệ Tử Nội Môn', 'cd_ts_noi', 20], mul: 1.15 },
      { name: 'Tinh anh', n: 4, mob: ['Đệ Tử Tinh Anh', 'cd_ts_tinh_anh', 25], mul: 1.3 },
      { name: 'Chân truyền', n: 3, mob: ['Đệ Tử Chân Truyền', 'cd_ts_chan_truyen', 25], mul: 1.5 },
      { name: 'Trưởng lão', n: 2, elite: true, mul: 1, mobs: [['Tả Trưởng Lão', 'cd_ts_ta_truong_lao', 30], ['Hữu Trưởng Lão', 'cd_ts_huu_truong_lao', 30]],
        move: { name: 'Huyết Hải Phiên Thiên', power: 2.2, drain: 60 } },
      // Tông chủ: tên người dùng đặt 2026-11-08
      { name: 'Tông chủ', n: 1, elite: true, mul: 1.5, mobs: [['Tông Chủ Ngọc Dương Tử', 'ngoc_duong_tu', 35]],
        move: { name: 'Trường Sinh Bất Lão Công', power: 2.6, drain: 100, weakAtk: 20 },
        intro: 'Tông Chủ Ngọc Dương Tử đứng dậy khỏi ao máu: "Máu của ngươi sẽ giúp ta sống thêm trăm năm."' },
    ],
  },
  /* Hai cấm địa của khảo hạch chân truyền (người dùng chốt 2026-11-09: làm như Trường Sinh Đường, 6 ải, 5 độ khó).
     Claude đặt (người dùng chưa duyệt): cấp mở, cấp từng độ khó, tên trưởng lão / môn chủ (tạm), hình mượn quái cùng vùng,
     độc / mê hoặc theo luật của vùng. Phần tử thứ 3 của mob: số = hút huyết %, đối tượng = chỉ số cộng thêm (poisonHit, charmHit...). */
  van_doc: {
    name: 'Cấm Địa Vạn Độc Môn', hub: 'tuong_duong', minLv: 60, flag: 'cam_dia_van_doc', rank: 'chân truyền',
    lore: 'Tổng đàn dựng trên nền nhà sàn giữa đầm, vò sành nuôi độc vật xếp kín tầng hầm. Ở đây hơi thở cũng mang độc.',
    diffs: [['Dễ', 60], ['Thường', 70], ['Khó', 80], ['Cực Khó', 90], ['Địa Ngục', 100]],
    stages: [
      { name: 'Ngoại môn', n: 6, mob: ['Đệ Tử Ngoại Môn', 'de_tu_van_doc', { poisonHit: { chance: 35, turns: 3, value: 0.35 } }], mul: 1 },
      { name: 'Nội môn', n: 5, mob: ['Đệ Tử Nội Môn', 'doc_nu_van_doc', { poisonHit: { chance: 35, turns: 3, value: 0.4 } }], mul: 1.15 },
      { name: 'Tinh anh', n: 4, mob: ['Đệ Tử Tinh Anh', 'luyen_co_su', { poisonHit: { chance: 40, turns: 3, value: 0.45 } }], mul: 1.3 },
      { name: 'Chân truyền', n: 3, mob: ['Đệ Tử Chân Truyền', 'van_doc_ho_ve', { poisonHit: { chance: 40, turns: 3, value: 0.5 } }], mul: 1.5 },
      { name: 'Trưởng lão', n: 2, elite: true, mul: 1, mobs: [['Độc Tâm Trưởng Lão', 'van_doc_huong_chu', { poisonHit: { chance: 45, turns: 3, value: 0.5 } }], ['Cổ Tâm Trưởng Lão', 'van_doc_ho_phap', { poisonHit: { chance: 45, turns: 3, value: 0.5 } }]],
        move: { name: 'Vạn Cổ Phệ Tâm', power: 2.2, effect: { type: 'poison', chance: 100, turns: 4, value: 0.8 } } },
      { name: 'Môn chủ', n: 1, elite: true, mul: 1.5, mobs: [['Môn Chủ Vạn Độc Môn', 'van_doc_ho_phap', { poisonHit: { chance: 50, turns: 4, value: 0.6 } }]],
        move: { name: 'Thiên Độc Quy Nguyên', power: 2.6, effect: { type: 'poison', chance: 100, turns: 5, value: 1 } },
        intro: 'Môn Chủ Vạn Độc Môn gõ nhẹ chiếc vò sành, trăm con độc vật cùng ngóc đầu: "Vào được tới đây, ngươi cũng đáng làm phân bón cho cổ trùng của ta."' },
    ],
  },
  hop_hoan: {
    name: 'Cấm Địa Hợp Hoan Phái', hub: 'thanh_do', minLv: 80, flag: 'cam_dia_hop_hoan', rank: 'chân truyền',
    lore: 'Hậu điện Hợp Hoan Phái chìm trong khói hương mê, rèm lụa đỏ buông kín. Kẻ bước vào thường quên mất mình tới để làm gì.',
    diffs: [['Dễ', 80], ['Thường', 85], ['Khó', 90], ['Cực Khó', 95], ['Địa Ngục', 100]],
    stages: [
      { name: 'Ngoại môn', n: 6, mob: ['Đệ Tử Ngoại Môn', 'doc_nu', { charmHit: { chance: 25, turns: 2 } }], mul: 1 },
      { name: 'Nội môn', n: 5, mob: ['Đệ Tử Nội Môn', 'thien_co_ve', { charmHit: { chance: 25, turns: 2 } }], mul: 1.15 },
      { name: 'Tinh anh', n: 4, mob: ['Đệ Tử Tinh Anh', 'thien_co_sat_thu', { charmHit: { chance: 30, turns: 2 } }], mul: 1.3 },
      { name: 'Chân truyền', n: 3, mob: ['Đệ Tử Chân Truyền', 'bac_su_kiem_ve', { charmHit: { chance: 30, turns: 2 } }], mul: 1.5 },
      { name: 'Trưởng lão', n: 2, elite: true, mul: 1, mobs: [['Mị Âm Trưởng Lão', 'doc_nu', { charmHit: { chance: 35, turns: 2 }, manasteal: 20 }], ['Mị Ảnh Trưởng Lão', 'bang_tam_ma_nu', { charmHit: { chance: 35, turns: 2 }, manasteal: 20 }]],
        move: { name: 'Thiên Ma Cầm Âm', power: 2.2, weakAtk: 20, effect: { type: 'charm', chance: 100, turns: 2 } } },
      { name: 'Chưởng môn', n: 1, elite: true, mul: 1.5, mobs: [['Chưởng Môn Hợp Hoan Phái', 'cuu_vu_linh', { charmHit: { chance: 40, turns: 3 }, manasteal: 30 }]],
        move: { name: 'Hợp Hoan Đại Mê Hồn', power: 2.6, effect: { type: 'charm', chance: 100, turns: 3 } },
        intro: 'Chưởng Môn Hợp Hoan Phái vén rèm lụa, cười khẽ: "Đã tới đây rồi thì ở lại đi. Ở lại mãi mãi."' },
    ],
  },
};
let cdKey = 'truong_sinh', cdSel = {}, cdRun = null, cdNote = '';
const cdState = k => { if (!P.cd) P.cd = {}; return P.cd[k] || (P.cd[k] = { best: 0 }); };
const cdOpen = k => !!(P && CAM_DIA[k] && P.lv >= CAM_DIA[k].minLv);
const cdOk = (k, d) => cdOpen(k) && d >= 1 && d <= CAM_DIA[k].diffs.length && d <= cdState(k).best + 1;
/* Thưởng Cấm địa (người dùng chốt 2026-11-09): mỗi lần vượt trọn chắc chắn nhận 1 món Cực phẩm có 0–5 sao (GEAR_STAR trong data.js),
   tối đa 3 lần nhận mỗi ngày (ngày thật) mỗi cấm địa. Ô ngẫu nhiên trong 11 ô; vũ khí bốc ngẫu nhiên cả ba dòng găng / kiếm / côn
   (người dùng chốt, không theo đường võ). Bậc đồ mặc từ cấp mở + 1, mọi độ khó như nhau (cấp 40 → bậc 5, mặc từ cấp 41), không vượt bậc cuối của dòng. */
const CD_LOOT = { perDay: 3 };
const cdGot = k => { const s = cdState(k); return s.day === tlDay() ? s.got || 0 : 0; };
function cdLoot(d) {
  // Bậc đồ = bậc mặc từ cấp mở + 1, mọi độ khó như nhau (người dùng chốt 2026-11-09: Trường Sinh mở cấp 40 → luôn đồ mặc từ cấp 41,
  // Vạn Độc 60 → 61, Hợp Hoan 80 → 81, để lên cấp kế là mặc được ngay); độ khó cao chỉ cho tỉ lệ sao cao hơn
  const lv = CAM_DIA[cdRun ? cdRun.k : cdKey].minLv + 1, want = WEAPON_LV.filter(x => x <= lv).length;
  const slots = Object.keys(GEAR), slot = slots[rand(0, slots.length - 1)];
  let base;
  if (slot === 'weapon') {
    const kinds = Object.keys(WEAPON_LINES), line = WEAPON_LINES[kinds[rand(0, kinds.length - 1)]];
    base = line.ids[Math.min(want, line.ids.length) - 1][0];
  } else base = gearSlotId(slot, Math.min(want, GEAR[slot].ids.length));
  const r = GEAR_STAR.rate[d - 1];
  let x = rand(1, r.reduce((a, b) => a + b, 0)), star = 0;
  while (x > r[star]) { x -= r[star]; star++; }
  const id = gearId(base, 3, Array.from({ length: GEAR_QUALITY[2].lines }, () => rollLine(slot)), 0, star);
  addItem(id);
  return id;
}
// Mã cấm địa ứng với huy hiệu sào huyệt của vùng (bản đồ vùng gọi để hiện nút vào)
const cdOfHub = hub => Object.keys(CAM_DIA).find(k => CAM_DIA[k].hub === hub);
function camDia(k) {
  if (k) cdKey = k;
  const C = CAM_DIA[cdKey], s = cdState(cdKey), stg = C.stages;
  if (!cdOk(cdKey, cdSel[cdKey] || 0)) cdSel[cdKey] = Math.min(s.best + 1, C.diffs.length);
  const d = cdSel[cdKey], lv = C.diffs[d - 1][1];
  tlStyle();
  const chips = C.diffs.map(([nm, l], i) => { const n = i + 1, lock = !cdOk(cdKey, n);
    return `<button class="tl-d${n === d ? ' sel' : ''}${lock ? ' locked' : ''}" ${lock ? 'disabled' : `onclick="G.cdPick(${n})"`}>${n <= s.best ? '<i>✦</i>' : ''}${nm}<br><small>Cấp ${l}</small></button>`; }).join('');
  const steps = stg.map((x, i) => `<div class="tl-st"><em>Ải ${i + 1}</em><b>${x.n > 1 ? `${x.n} ` : ''}${x.elite && x.n === 1 ? x.mobs[0][0] : x.name}</b></div>`).join('');
  const boss = stg[stg.length - 1].mobs[0];
  openModal(`<h3 class="tl-title">${C.name}</h3>
    <div class="tl-main">
      <div class="tl-fig">${typeof ENEMY_IMG !== 'undefined' && ENEMY_IMG[boss[1]] ? `<img class="tl-card cd-fig" src="game/img/quai/${boss[1]}.png" alt="">` : typeof enemyArtSvg === 'function' ? enemyArtSvg(boss[1]) : ''}</div>
      <div class="tl-info">
        <div class="tl-name">${C.diffs[d - 1][0]} · Cấp ${lv}</div>
        <p class="tl-lore">${C.lore}</p>
        <div class="tl-left">${s.best ? `Đã vượt: <b>${C.diffs[s.best - 1][0]}</b>` : 'Chưa vượt qua'}</div>
        <div class="tl-left">Thưởng hôm nay: <b>${Math.max(0, CD_LOOT.perDay - cdGot(cdKey))} / ${CD_LOOT.perDay}</b></div>
      </div>
    </div>
    <div class="tl-ds">${chips}</div>
    <div class="tl-sts cd-sts">${steps}</div>
    ${cdNote ? `<div class="tl-note">${cdNote}</div>` : ''}
    <div class="row-btns"><button class="btn primary" onclick="G.cdFight()">Tiến vào</button></div>`);
  cdNote = '';
}
function cdPick(n) { if (cdOk(cdKey, n)) { cdSel[cdKey] = n; camDia(); } }
function cdFight() {
  const k = cdKey, d = cdSel[k];
  if (!cdOk(k, d) || (combat && !combat.over)) return;
  const s = getStats();
  P.hp = s.hp; P.mp = s.mp; // vào cấm địa hồi đầy; giữa các ải không hồi
  closeModalSilent();
  saveGame(true);
  cdRun = { k, d, stage: 1 };
  cdStage();
}
// Dựng quái một ải bằng tgMake (the_gioi.js) với bản đồ giả
function cdMob(x, row, lv, elite) {
  const ex = typeof row[2] === 'number' ? { lifesteal: row[2] } : Object.assign({}, row[2] || {}); // số = hút huyết %, đối tượng = chỉ số cộng thêm
  const m = { id: 'cam_dia', city: CAM_DIA[cdRun ? cdRun.k : cdKey].hub, mobs: [[row[0], row[1], 'bal', ex]],
    boss: { name: row[0], art: row[1], stats: ex, move: x.move } };
  const E = tgMake(m, elite ? -1 : 0, lv, elite);
  ['hp', 'atk', 'def'].forEach(s => { E[s] = Math.round(E[s] * (s === 'hp' ? x.mul : 1 + (x.mul - 1) * 0.4)); });
  E.skills = tgArm(E);
  if (x.move) E.skills.unshift(Object.assign({ type: 'attack', chance: 30, mp: 0 }, x.move));
  E.drops = [];
  E.intro = x.intro || '';
  return E;
}
function cdStage() {
  const R = cdRun, C = CAM_DIA[R.k], x = C.stages[R.stage - 1], lv = C.diffs[R.d - 1][1];
  const list = Array.from({ length: x.n }, (_, i) => cdMob(x, x.elite ? x.mobs[i % x.mobs.length] : x.mob, lv, !!x.elite));
  startCombat(list, { story: true, noFlee: true, noHeal: true, stageText: `${C.diffs[R.d - 1][0]} · Ải ${R.stage}/${C.stages.length} · ${x.name}`, onEnd: r => cdStageEnd(r) });
}
function cdStageEnd(result) {
  const R = cdRun, C = CAM_DIA[R.k], N = C.stages.length, dn = C.diffs[R.d - 1][0];
  if (result !== 'win') {
    cdRun = null;
    log(`[[tu_vong]] ${C.name} (${dn}): bại trận ở ải ${R.stage}.`);
    return { lines: [`[[tu_vong]] Bại trận ở <b>ải ${R.stage} / ${N}</b> (${C.stages[R.stage - 1].name}).`], btn: `Về ${C.name}`, cls: 'lose', after: cdBack };
  }
  // Thảo dược Kinh mạch: mỗi ải qua được KINH_MACH.camDia cây (người dùng chốt 2026-11-10), chỉ khi hôm nay còn lượt thưởng
  const herb = cdGot(R.k) < CD_LOOT.perDay && typeof kmRare === 'function' ? `[[nhan_sam]] Thảo dược: ${kmRare(KINH_MACH.camDia)}` : '';
  if (R.stage < N) {
    R.stage++;
    return { lines: [`[[chien_thang]] Qua <b>ải ${R.stage - 1} / ${N}</b>`, ...(herb ? [herb] : [])], btn: `Ải ${R.stage}: ${C.stages[R.stage - 1].name} ➜`, cls: 'win', keepHp: true, after: cdStage };
  }
  const s = cdState(R.k), lines = [`[[chien_thang]] Vượt qua <b>${C.name}</b> · ${dn}!`, ...(herb ? [herb] : [])];
  // Thưởng: 1 món Cực phẩm có sao, tối đa CD_LOOT.perDay lần mỗi ngày mỗi cấm địa (hết lượt vẫn đánh được, không rơi đồ)
  if (cdGot(R.k) < CD_LOOT.perDay) {
    s.got = cdGot(R.k) + 1; s.day = tlDay();
    const id = cdLoot(R.d), it = ITEMS[id];
    lines.push(`[[${it.icon}]] Nhận <b class="q-cuc">${it.name}</b> · thưởng hôm nay ${s.got} / ${CD_LOOT.perDay}`);
    log(`[[${it.icon}]] ${C.name}: nhận ${it.name}.`);
  } else lines.push(`Hôm nay đã nhận đủ ${CD_LOOT.perDay} lần thưởng ở cấm địa này.`);
  if (R.d > s.best) s.best = R.d;
  if (!P.flags[C.flag]) { P.flags[C.flag] = true; lines.push(`✦ Đã vượt qua cấm địa: đủ một điều kiện lên Đệ tử ${C.rank || 'tinh anh'}.`); }
  log(`[[chien_thang]] Vượt qua ${C.name} (${dn}).`);
  snd('jingle', 'quest');
  cdRun = null;
  saveGame(true);
  return { lines, btn: `Về ${C.name}`, cls: 'win', after: cdBack };
}
function cdBack() { renderWorld(); camDia(); }

const THI_LUYEN_G = { thiLuyen, tlPick, tlSweep, tlFight, beQuan, bqClaim, camDia, cdPick, cdFight };
