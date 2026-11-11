/* =====================================================================
   TRẬN ĐỘI 5 TƯỚNG (2026-11-12, người dùng chốt theo ảnh mẫu, bước đầu của hệ ải Giang Hồ)
   - Đánh theo LƯỢT PHE: lượt ta mỗi tướng còn sống ra tay 1 lần (bấm avatar = đánh thường, bấm quả cầu khi đầy Nộ = tung nộ);
     đủ 5 tướng thì tới lượt địch. Nút Treo = tự động; ô Nhanh = tốc độ x2.
   - Mỗi tầng 3 đợt địch, máu và Nộ tướng giữ nguyên giữa các đợt.
   - Đánh trúng rơi cục: cục xanh +Nộ, cục đỏ hồi máu theo chỉ số Hồi của người đánh; bay về ngẫu nhiên một người cùng phe người đánh.
   - Đòn đơn của địch luôn nhắm tướng Mị cao nhất còn sống (bằng nhau thì ngẫu nhiên).
   - Sao = 3 − số tướng chết. Đội hình 2 hàng: trước 3, sau 2 (tạm xếp theo loại, chọn chỗ đứng làm sau).
   - Kỹ Năng: Nộ luôn đầy, lượt nào cũng tung được. Hiệu ứng nộ theo loại tướng ở TD_ULT (số Claude đặt, chờ người dùng duyệt).
   ===================================================================== */
const TD = {
  orbNo: 15,          // cục xanh: +Nộ
  noMax: 100,
  crit: 0.1, critMul: 1.5,
  waves: 3,
  bg: 'game/img/san_dau/ngay.jpg',
};
// Hiệu ứng nộ theo loại tướng
const TD_ULT = {
  cong_kich: { kind: 'all', pow: 1.6, txt: 'Đánh toàn bộ kẻ địch' },
  ky_nang:   { kind: 'one', pow: 1.8, stun: 0.3, txt: 'Đánh mạnh 1 kẻ, 30% choáng' },
  ho_ve:     { kind: 'one', pow: 1.2, selfDef: 0.6, turns: 2, txt: 'Đánh 1 kẻ, tăng 60% thủ bản thân 2 hiệp' },
  tri_lieu:  { kind: 'heal', hoi: 2, atk: 0.6, txt: 'Hồi máu toàn đội' },
  ho_tro:    { kind: 'buff', atk: 0.3, turns: 2, txt: 'Tăng 30% công toàn đội 2 hiệp' },
};
// Vị trí chân (% bề ngang, % bề cao sân) theo số người một bên; hàng trước sát đối phương, hàng sau lùi lại, so le để không đè nhau
// (đội hình 6 ô cũ của san_dau.js quá sát cho 5 người: người dùng thấy đè lên nhau; theo mẫu: người nhỏ ~13% bề ngang, rải rộng)
const TD_FORM = {
  1: [[26, 76]],
  2: [[30, 66], [22, 88]],
  3: [[33, 60], [29, 78], [12, 70]],
  4: [[33, 58], [29, 78], [12, 64], [9, 84]],
  5: [[33, 58], [30, 76], [27, 94], [12, 62], [9, 80]],
};
function tdSlot(u) {
  const n = Math.min(5, tdS[u.side].length), [x, y] = (TD_FORM[n] || TD_FORM[5])[u.i] || [50, 80];
  return [u.side === 'ta' ? x : 100 - x, y];
}
// Đợt địch thử (Thanh Vân); boss ở đợt 3
const TD_TEST = {
  name: 'Trận thử',
  mobs: ['son_tac_do', 'thao_khau', 'luu_manh', 'con_do', 'de_tu_that_sat', 'sat_thu'],
  boss: 'that_sat_huong_chu',
  mob: { hp: 2400, atk: 1100, def: 900, hoi: 250, spd: 45, mi: 100 },
  waveN: [3, 4, 4],
};

let tdS = null; // trận đang đánh

function tdWait(ms) { return new Promise(r => setTimeout(r, tdS && tdS.fast ? ms / 2 : ms)); }
function tdRand(a) { return a[Math.floor(Math.random() * a.length)]; }

function tdUnit(side, i, o) {
  return Object.assign({ side, i, no: 0, buf: {}, stun: 0, dead: false, acted: false }, o, { hp: o.maxHp });
}
function tdWave(n) {
  const T = tdS.def, cnt = T.waveN[n] || 3, list = [];
  for (let i = 0; i < cnt; i++) {
    const boss = !!T.boss && n === TD.waves - 1 && i === 0;
    const k = boss ? T.boss : tdRand(T.mobs), m = T.mob, f = (1 + n * 0.12) * (T.pow || 1);
    list.push(tdUnit('dich', i, {
      name: (ENEMY_IMG[k] && ENEMY_IMG[k].label) || k, img: k, role: boss ? 'cong_kich' : null, boss,
      maxHp: Math.round(m.hp * f * (boss ? 3 : 1)), atk: Math.round(m.atk * f * (boss ? 1.4 : 1)), def: Math.round(m.def * f),
      hoi: m.hoi, spd: m.spd, mi: m.mi,
    }));
  }
  return list;
}
// Bắt đầu trận (tạm: trận thử 3 đợt; hệ ải sẽ truyền dữ liệu tầng vào đây)
function tdStart(def) {
  if (!P) return renderTitle();
  closeModalSilent();
  const front = ['ho_ve', 'cong_kich', 'ky_nang'];
  const team = HOME_TEAM.map((h, k) => ({ h, k })).sort((a, b) => (front.includes(b.h.role) - front.includes(a.h.role)) || a.k - b.k);
  tdS = {
    def: def || TD_TEST, wave: 0, round: 1, phase: 'ta', busy: false, target: 0, deaths: 0,
    auto: !!(tdS && tdS.auto), fast: !!(tdS && tdS.fast), loot: { bac: 0, luong: 0, manh: 0 }, over: null,
    ta: team.map(({ h }, i) => tdUnit('ta', i, { name: h.name, img: h.img, art: h.art, sprite: h.sprite, hand: h.hand, ult: h.ult, role: h.role, skill: h.skill,
      ...(st => ({ maxHp: st.hp, atk: st.atk, def: st.def, hoi: st.hoi, spd: st.spd, mi: st.mi }))(heroSt(h)) })),
  };
  tdS.ta.forEach(u => { if (u.role === 'ky_nang') u.no = TD.noMax; });
  const keys = typeof SAN_DAU !== 'undefined' ? Object.keys(SAN_DAU.sets) : [];
  tdS.bg = keys.length ? SAN_DAU.sets[tdRand(keys)].mb : { src: TD.bg };
  tdS.dich = tdWave(0);
  tdRender();
  homeNoDrag(); if (hasSnd()) SND.music('combat');
  tdPhaseTa();
}

/* ---------- vẽ ---------- */
function tdPortrait(img, art) {
  if (art) return `<img src="${art}" alt="" draggable="false" style="position:absolute;width:250%;left:-75%;top:-76%">`;
  const m = ENEMY_IMG[img];
  if (!m || !m.head) return `<img src="game/img/quai/${img}.png" alt="" draggable="false">`;
  const [hx, hy, hs] = m.head;
  return `<img src="game/img/quai/${img}.png" alt="" draggable="false" style="position:absolute;width:${(100 / hs).toFixed(1)}%;left:${(-hx / hs * 100).toFixed(1)}%;top:${(-(hy * m.h / m.w) / hs * 100).toFixed(1)}%">`;
}
function tdSpriteHtml(u) {
  const [x, y] = tdSlot(u), m = u.sprite ? { k: 1.55 } : (ENEMY_IMG[u.img] || { k: 1 });
  // hình cao thủ (tm_*) vẽ trên khung rộng nên trông nhỏ hơn quái: phóng thêm cho ngang cỡ
  const k = (m.k || 1) * (u.boss ? 1.2 : 1) * (!u.sprite && /^tm_/.test(u.img) ? 1.22 : 1);
  return `<div class="td-u ${u.side} ${u.dead ? 'dead' : ''}" id="td-${u.side}-${u.i}" style="left:${x}%;top:${y}%;z-index:${Math.round(y)}"
      ${u.side === 'dich' ? `onclick="G.tdPick(${u.i})"` : ''}>
    <i class="td-ring"></i><i class="td-shadow"></i>
    <img class="${u.sprite ? 'nf' : ''}" src="${u.sprite || `game/img/quai/${u.img}.png`}" alt="" draggable="false" style="height:${(k * 100).toFixed(0)}%">
    <span class="td-hb"><i style="width:${(u.hp / u.maxHp * 100).toFixed(1)}%"></i></span>
  </div>`;
}
function tdRender() {
  tdStyle();
  const s = tdS;
  const top = `<div class="td-top">
      <button class="td-gear" onclick="G.tdQuit()" title="Rời trận">[[he_thong]]</button>
      <span class="td-loot">[[bac]]<b id="td-l-bac">x${s.loot.bac}</b></span>
      <span class="td-loot">${homePng('khung_luong_thuc')}<b id="td-l-luong">x${s.loot.luong}</b></span>
      <span class="td-loot">${homePng('manh_vo_so')}<b id="td-l-manh">x${s.loot.manh}</b></span>
      <label class="td-fast" onclick="G.tdFast()"><i class="${s.fast ? 'on' : ''}"></i>Nhanh</label>
    </div>`;
  const cards = s.ta.map(u => `<button class="td-card r-${u.role}" id="td-c-${u.i}" onclick="G.tdTap(${u.i})">
      <span class="td-pt">${tdPortrait(u.img, u.art)}</span>
      <span class="td-hpn"><img src="game/img/icon/loai_${u.role}.png" alt=""><b>${Math.max(0, Math.round(u.hp))}</b></span>
      <span class="td-bar hp"><i style="width:${(u.hp / u.maxHp * 100).toFixed(1)}%"></i></span>
      <span class="td-bar no"><i style="width:${(u.no / TD.noMax * 100).toFixed(1)}%"></i></span>
    </button>`).join('');
  const orbs = s.ta.map(u => `<button class="td-orb" id="td-o-${u.i}" onclick="G.tdUlt(${u.i})" title="${u.skill ? u.skill.name : ''}"><i></i></button>`).join('');
  const bg = s.bg || { src: TD.bg };
  show(`<div class="td">
    ${top}
    <div class="td-mid">
      <div class="td-stage" id="td-field">
        <img class="td-bg" src="${bg.src}" alt="">${bg.dim ? '<i class="td-dusk"></i>' : ''}
        <div id="td-units">${s.dich.map(tdSpriteHtml).join('')}${s.ta.map(tdSpriteHtml).join('')}</div>
        <div class="td-wave" id="td-wave">${s.wave + 1}/${TD.waves}</div>
      </div>
    </div>
    <div class="td-panel">
      <button class="td-auto ${s.auto ? 'on' : ''}" id="td-auto" onclick="G.tdAuto()">Treo</button>
      <div class="td-cards">${cards}</div>
      <div class="td-orbs">${orbs}</div>
    </div>
    <div class="td-fx" id="td-fx"></div>
  </div>`, 'tran-doi');
  tdSync();
}
// cập nhật thanh máu / nộ / trạng thái mà không vẽ lại cả màn
function tdSync() {
  const s = tdS; if (!s) return;
  const all = s.ta.concat(s.dich);
  all.forEach(u => {
    const el2 = document.getElementById(`td-${u.side}-${u.i}`);
    if (el2) {
      el2.classList.toggle('dead', u.dead);
      el2.classList.toggle('tgt', u.side === 'dich' && u.i === s.target && !u.dead);
      el2.classList.toggle('stun', u.stun > 0);
      const b = el2.querySelector('.td-hb i'); if (b) b.style.width = (u.hp / u.maxHp * 100).toFixed(1) + '%';
    }
  });
  s.ta.forEach(u => {
    const c = document.getElementById('td-c-' + u.i), o = document.getElementById('td-o-' + u.i);
    if (c) {
      c.classList.toggle('dead', u.dead);
      c.classList.toggle('done', !u.dead && (u.acted || s.phase !== 'ta'));
      c.querySelector('.td-hpn b').textContent = Math.max(0, Math.round(u.hp));
      c.querySelector('.hp i').style.width = (u.hp / u.maxHp * 100).toFixed(1) + '%';
      c.querySelector('.no i').style.width = (u.no / TD.noMax * 100).toFixed(1) + '%';
    }
    if (o) o.classList.toggle('ready', !u.dead && u.no >= TD.noMax && !u.acted && s.phase === 'ta');
  });
  const w = document.getElementById('td-wave'); if (w) w.textContent = `${s.wave + 1}/${TD.waves}`;
  ['bac', 'luong', 'manh'].forEach(k => { const e = document.getElementById('td-l-' + k); if (e) e.textContent = 'x' + s.loot[k]; });
}
// tọa độ giữa thân một người (px, so với khung .td)
function tdPos(u, part) {
  const root = document.querySelector('.td'), e = part === 'card' ? document.getElementById('td-c-' + u.i) : document.getElementById(`td-${u.side}-${u.i}`);
  if (!root || !e) return { x: 0, y: 0 };
  const R = root.getBoundingClientRect(), r = (part !== 'card' && e.querySelector('img')) ? e.querySelector('img').getBoundingClientRect() : e.getBoundingClientRect();
  return { x: r.left + r.width / 2 - R.left, y: r.top + r.height * (part === 'card' ? 0.35 : 0.5) - R.top };
}
function tdPop(u, txt, cls) {
  const fx = document.getElementById('td-fx'); if (!fx) return;
  const p = tdPos(u), d = document.createElement('div');
  d.className = 'td-num ' + (cls || ''); d.textContent = txt;
  d.style.left = p.x + 'px'; d.style.top = (p.y - 20) + 'px';
  fx.appendChild(d); setTimeout(() => d.remove(), 1100);
}
function tdBanner(u, name) {
  const fx = document.getElementById('td-fx'); if (!fx) return;
  const d = document.createElement('div');
  d.className = 'td-ban ' + u.side;
  d.innerHTML = `<span class="td-ban-pt">${tdPortrait(u.img, u.art)}</span><b>${esc(name)}</b>`;
  fx.appendChild(d); setTimeout(() => d.remove(), 1300);
}
// cục khí bay từ kẻ bị đánh về người nhận (phe ta: về thẻ dưới; phe địch: về người trên sân)
function tdOrbFly(from, to, kind) {
  const fx = document.getElementById('td-fx'); if (!fx) return;
  const a = tdPos(from), b = to.side === 'ta' ? tdPos(to, 'card') : tdPos(to);
  const d = document.createElement('div');
  d.className = 'td-orbf ' + kind;
  d.style.left = (a.x + (Math.random() - 0.5) * 30) + 'px'; d.style.top = (a.y + (Math.random() - 0.5) * 30) + 'px';
  fx.appendChild(d);
  requestAnimationFrame(() => requestAnimationFrame(() => { d.style.left = b.x + 'px'; d.style.top = b.y + 'px'; d.style.opacity = .9; }));
  setTimeout(() => d.remove(), tdS && tdS.fast ? 400 : 700);
}
function tdLunge(u, tgt) {
  const e = document.getElementById(`td-${u.side}-${u.i}`); if (!e) return;
  const a = tdPos(u), b = tdPos(tgt);
  e.style.setProperty('--dx', ((b.x - a.x) * 0.55).toFixed(0) + 'px');
  e.style.setProperty('--dy', ((b.y - a.y) * 0.55).toFixed(0) + 'px');
  e.classList.add('lunge');
  setTimeout(() => e.classList.remove('lunge'), tdS && tdS.fast ? 200 : 380);
}
// Hiệu ứng "chỉ pháp" (Đoàn Thị Chỉ Pháp): tụ khí vàng ở đầu ngón tay, rồi từng tia chỉ lực vàng bắn liên tiếp tới mỗi kẻ địch,
// chạm thì nổ chùm sáng (theo đoạn phim mẫu người dùng gửi). Vẽ bằng mã, không cần ảnh.
function tdHand(u) {
  const root = document.querySelector('.td'), e = document.getElementById(`td-${u.side}-${u.i}`);
  const img = e && e.querySelector('img');
  if (!root || !img) return tdPos(u);
  const R = root.getBoundingClientRect(), r = img.getBoundingClientRect(), h = u.hand || [0.85, 0.45];
  // h = vị trí bàn tay trên ảnh quay sang phải; ảnh bị lật (quái quay trái) thì lấy đối xứng
  const frac = img.classList.contains('nf') ? h[0] : 1 - h[0];
  return { x: r.left + r.width * frac - R.left, y: r.top + r.height * h[1] - R.top };
}
async function tdChi(u, foes, onHit) {
  const box = document.getElementById('td-fx'); if (!box || !foes.length) return;
  const a = tdHand(u), fast = tdS && tdS.fast, cq = box.clientWidth / 100;
  const orb = document.createElement('div');
  orb.className = 'td-chi-orb'; orb.style.left = a.x + 'px'; orb.style.top = a.y + 'px';
  box.appendChild(orb);
  await tdWait(380);
  // mỗi kẻ địch 3 tia chỉ lực (ảnh fx_chi_luc.png, đầu tia ở mép phải ảnh), bắn tùm lum xen kẽ
  const shots = [];
  foes.forEach((t, j) => { for (let k = 0; k < 3; k++) shots.push({ t, k, at: j * 70 + k * 190 + Math.random() * 90 }); });
  const fly = fast ? 170 : 280, W = 36 * cq;
  await Promise.all(shots.map(sh => new Promise(done => setTimeout(() => {
    const s0 = { x: a.x + (Math.random() - 0.5) * 3 * cq, y: a.y + (Math.random() - 0.5) * 3 * cq };
    const b = tdPos(sh.t), e = { x: b.x + (Math.random() - 0.5) * 6 * cq, y: b.y + (Math.random() - 0.5) * 6 * cq };
    const ang = Math.atan2(e.y - s0.y, e.x - s0.x) * 180 / Math.PI;
    const img = document.createElement('img');
    img.src = 'game/img/fx_chi_luc.png'; img.className = 'td-bolt'; img.style.width = W + 'px';
    box.appendChild(img);
    const tf = (p, sc) => `translate(${p.x}px, ${p.y}px) rotate(${ang}deg) scale(${sc}) translate(-95%, -50%)`;
    let fin = false;
    const end = () => {
      if (fin) return; fin = true; img.remove();
      const hit = document.createElement('div');
      hit.className = 'td-chi-hit'; hit.style.left = e.x + 'px'; hit.style.top = e.y + 'px';
      box.appendChild(hit); setTimeout(() => hit.remove(), 600);
      if (onHit) onHit(sh.t, sh.k);
      done();
    };
    if (img.animate) img.animate([{ transform: tf(s0, 0.45), opacity: 0.4 }, { transform: tf(e, 1), opacity: 1 }], { duration: fly, easing: 'ease-in', fill: 'forwards' }).onfinish = end;
    setTimeout(end, fly + 120); // dự phòng
  }, fast ? sh.at / 2 : sh.at))));
  await tdWait(220);
  orb.remove();
}
function tdHitFx(u) {
  const e = document.getElementById(`td-${u.side}-${u.i}`); if (!e) return;
  e.classList.remove('hit'); void e.offsetWidth; e.classList.add('hit');
}

/* ---------- luật trận ---------- */
const tdAlive = side => tdS[side].filter(u => !u.dead);
const tdFoe = u => u.side === 'ta' ? 'dich' : 'ta';
function tdAtk(u) { return u.atk * (1 + (u.buf.atk ? u.buf.atk.v : 0)); }
function tdDef(u) { return u.def * (1 + (u.buf.def ? u.buf.def.v : 0)); }
function tdDmg(a, t, pow) {
  const A = tdAtk(a), D = tdDef(t);
  const crit = Math.random() < TD.crit;
  const d = A * pow * A / (A + D) * (0.92 + Math.random() * 0.16) * (crit ? TD.critMul : 1);
  return { d: Math.max(1, Math.round(d)), crit };
}
// mục tiêu đòn đơn: phe ta đánh kẻ đang chọn; phe địch luôn nhắm Mị cao nhất (bằng nhau thì ngẫu nhiên)
function tdTarget(u) {
  if (u.side === 'ta') {
    let t = tdS.dich[tdS.target];
    if (!t || t.dead) { t = tdAlive('dich')[0]; if (t) tdS.target = t.i; }
    return t;
  }
  const live = tdAlive('ta'); if (!live.length) return null;
  const top = Math.max(...live.map(x => x.mi));
  return tdRand(live.filter(x => x.mi === top));
}
function tdHurt(a, t, dmg, crit, noOrb) {
  t.hp = Math.max(0, t.hp - dmg);
  tdPop(t, (crit ? 'Bạo ' : '') + dmg.toLocaleString('vi-VN'), crit ? 'crit' : '');
  tdHitFx(t);
  // rơi cục: sát thương càng lớn rơi càng nhiều (1–3 cục), mỗi cục xanh hoặc đỏ, về ngẫu nhiên người cùng phe người đánh
  const n = noOrb ? 0 : Math.min(3, 1 + Math.floor(dmg / t.maxHp * 4));
  for (let k = 0; k < n; k++) {
    const mates = tdAlive(a.side); if (!mates.length) break;
    const r = tdRand(mates), blue = Math.random() < 0.5;
    tdOrbFly(t, r, blue ? 'blue' : 'red');
    if (blue) { if (r.role !== 'ky_nang') r.no = Math.min(TD.noMax, r.no + TD.orbNo); }
    else if (r.hp < r.maxHp) { const h = Math.round(a.hoi); r.hp = Math.min(r.maxHp, r.hp + h); setTimeout(() => tdPop(r, '+' + h, 'heal'), 350); }
  }
  if (t.hp <= 0 && !t.dead) tdKill(t);
}
function tdKill(t) {
  t.dead = true; t.no = 0;
  if (t.side === 'ta') tdS.deaths++;
  else {
    tdS.loot.bac += 20 + Math.floor(Math.random() * 20) + (t.boss ? 100 : 0);
    if (Math.random() < 0.4) tdS.loot.luong++;
    if (t.boss || Math.random() < 0.1) tdS.loot.manh++;
  }
}
async function tdNormal(u) {
  const t = tdTarget(u); if (!t) return;
  tdLunge(u, t);
  await tdWait(220);
  const r = tdDmg(u, t, 1);
  tdHurt(u, t, r.d, r.crit);
  tdSync();
  await tdWait(380);
}
async function tdUltDo(u) {
  const U = u.ult || (u.side === 'ta' ? TD_ULT[u.role] : { kind: 'one', pow: 1.6 });
  if (!U) return tdNormal(u);
  tdBanner(u, u.side === 'ta' ? (u.skill ? u.skill.name : 'Tuyệt chiêu') : u.name);
  if (u.role !== 'ky_nang') u.no = 0;
  await tdWait(500);
  if (U.kind === 'all') {
    const foes = tdAlive(tdFoe(u));
    const bleed = t => { if (U.bleed && !t.dead) { t.bleed = { v: Math.round(tdAtk(u) * U.bleed.pct), t: U.bleed.turns }; setTimeout(() => tdPop(t, 'Chảy máu', 'st'), 300); } };
    if (U.fx === 'chi') {
      // mỗi kẻ địch trúng 3 tia, sát thương của chiêu chia 3 phần; chỉ tia cuối mới rơi cục
      const plan = new Map(foes.map(t => [t, tdDmg(u, t, U.pow)]));
      await tdChi(u, foes, (t, k) => {
        if (t.dead) return;
        const r = plan.get(t), part = k < 2 ? Math.round(r.d / 3) : r.d - 2 * Math.round(r.d / 3);
        tdHurt(u, t, Math.max(1, part), r.crit, k < 2);
        if (k === 2) bleed(t);
        tdSync();
      });
    } else foes.forEach(t => { const r = tdDmg(u, t, U.pow); tdHurt(u, t, r.d, r.crit); bleed(t); });
  } else if (U.kind === 'one') {
    const t = tdTarget(u); if (t) {
      tdLunge(u, t); await tdWait(200);
      const r = tdDmg(u, t, U.pow); tdHurt(u, t, r.d, r.crit);
      if (U.stun && !t.dead && Math.random() < U.stun) { t.stun = 1; tdPop(t, 'Choáng', 'st'); }
    }
    if (U.selfDef) { u.buf.def = { v: U.selfDef, t: U.turns }; tdPop(u, 'Thủ +' + Math.round(U.selfDef * 100) + '%', 'st'); }
  } else if (U.kind === 'heal') {
    tdAlive(u.side).forEach(m => { const h = Math.round(u.hoi * U.hoi + tdAtk(u) * U.atk); m.hp = Math.min(m.maxHp, m.hp + h); tdPop(m, '+' + h, 'heal'); });
  } else if (U.kind === 'buff') {
    tdAlive(u.side).forEach(m => { m.buf.atk = { v: U.atk, t: U.turns }; tdPop(m, 'Công +' + Math.round(U.atk * 100) + '%', 'st'); });
  }
  tdSync();
  await tdWait(520);
}
// một tướng ra tay
async function tdAct(u, ult) {
  if (!tdS || tdS.busy || tdS.phase !== 'ta' || u.dead || u.acted) return;
  tdS.busy = true; u.acted = true; tdSync();
  if (ult) await tdUltDo(u); else await tdNormal(u);
  tdS.busy = false;
  await tdAfterAct();
}
async function tdAfterAct() {
  const s = tdS; if (!s || s.over) return;
  if (!tdAlive('dich').length) return tdNextWave();
  if (!tdAlive('ta').length) return tdEnd(false);
  if (tdAlive('ta').every(u => u.acted)) return tdPhaseDich();
  tdSync();
  if (s.auto) tdAutoStep();
}
function tdPhaseTa() {
  const s = tdS; s.phase = 'ta';
  s.ta.forEach(u => { u.acted = false; if (u.role === 'ky_nang' && !u.dead) u.no = TD.noMax; });
  tdSync();
  if (s.auto) tdAutoStep();
}
function tdAutoStep() {
  const s = tdS; if (!s || !s.auto || s.busy || s.phase !== 'ta' || s.over) return;
  const u = tdAlive('ta').find(x => !x.acted); if (!u) return;
  setTimeout(() => { if (tdS === s && s.auto && !s.busy) tdAct(u, u.no >= TD.noMax); }, s.fast ? 60 : 140);
}
async function tdPhaseDich() {
  const s = tdS; s.phase = 'dich'; tdSync();
  await tdWait(350);
  for (const e of s.dich) {
    if (s.over || tdS !== s) return;
    if (e.dead) continue;
    if (e.stun) { e.stun = 0; tdPop(e, 'Choáng', 'st'); tdSync(); await tdWait(350); continue; }
    if (e.no >= TD.noMax) { e.no = 0; await tdUltDo(e); } else await tdNormal(e);
    if (!tdAlive('ta').length) return tdEnd(false);
  }
  // hết hiệp: chảy máu (mất máu cố định, bỏ qua thủ), rồi giảm lượt hiệu ứng
  let bled = false;
  s.ta.concat(s.dich).forEach(u => {
    if (u.dead || !u.bleed) return;
    u.hp = Math.max(0, u.hp - u.bleed.v); tdPop(u, '-' + u.bleed.v, 'bleed'); tdHitFx(u); bled = true;
    if (--u.bleed.t <= 0) u.bleed = null;
    if (u.hp <= 0) tdKill(u);
  });
  if (bled) { tdSync(); await tdWait(450); if (!tdAlive('ta').length) return tdEnd(false); }
  // hết hiệp: giảm lượt hiệu ứng
  s.ta.concat(s.dich).forEach(u => Object.keys(u.buf).forEach(k => { if (--u.buf[k].t <= 0) delete u.buf[k]; }));
  s.round++;
  if (!tdAlive('dich').length) return tdNextWave();
  tdPhaseTa();
}
async function tdNextWave() {
  const s = tdS;
  if (s.wave + 1 >= TD.waves) return tdEnd(true);
  await tdWait(500);
  s.wave++; s.dich = tdWave(s.wave); s.target = 0;
  const box = document.getElementById('td-units');
  if (box) box.innerHTML = s.dich.map(tdSpriteHtml).join('') + s.ta.map(tdSpriteHtml).join('');
  const w = document.createElement('div'); w.className = 'td-wavebig'; w.textContent = `Đợt ${s.wave + 1}`;
  const fx = document.getElementById('td-fx'); if (fx) { fx.appendChild(w); setTimeout(() => w.remove(), 1200); }
  await tdWait(700);
  tdPhaseTa();
}
function tdEnd(win) {
  const s = tdS; if (!s || s.over) return;
  s.over = win ? 'win' : 'lose'; s.phase = 'end'; s.auto = false;
  const stars = win ? Math.max(0, 3 - s.deaths) : 0;
  s.stars = stars;
  if (win) P.gold += s.loot.bac;
  if (s.def.onEnd) s.def.onEnd(win, stars);
  if (typeof saveGame === 'function') saveGame();
  if (hasSnd()) SND.jingle(win ? 'win' : 'lose');
  tdSync();
  const box = document.createElement('div');
  box.className = 'td-end ' + s.over;
  box.innerHTML = `<div class="td-end-in">
      <b class="td-end-t">${win ? 'Chiến Thắng' : 'Thất Bại'}</b>
      ${win ? `<div class="td-stars">${[0, 1, 2].map(k => `<i class="${k < stars ? 'on' : ''}"></i>`).join('')}</div>
        <p>${s.deaths ? `${s.deaths} tướng tử trận` : 'Không tướng nào tử trận'}</p>
        <p class="td-end-loot">[[bac]] +${s.loot.bac} · Lương thực +${s.loot.luong} · Mảnh +${s.loot.manh}</p>` : '<p>Cả đội đã ngã xuống</p>'}
      <div class="td-end-btn"><button onclick="G.tdAgain()">Đánh lại</button><button onclick="G.tdQuit(true)">Trở về</button></div>
    </div>`;
  const root = document.querySelector('.td');
  if (root) { root.appendChild(box); if (typeof iconize === 'function') box.innerHTML = iconize(box.innerHTML); }
}

/* ---------- nút ---------- */
function tdTap(i) { const u = tdS && tdS.ta[i]; if (u) tdAct(u, false); }
function tdUlt(i) { const u = tdS && tdS.ta[i]; if (u && u.no >= TD.noMax) tdAct(u, true); }
function tdPick(i) { if (!tdS || !tdS.dich[i] || tdS.dich[i].dead) return; tdS.target = i; tdSync(); }
function tdAuto() {
  if (!tdS) return; tdS.auto = !tdS.auto;
  const b = document.getElementById('td-auto'); if (b) b.classList.toggle('on', tdS.auto);
  if (tdS.auto) tdAutoStep();
}
function tdFast() {
  if (!tdS) return; tdS.fast = !tdS.fast;
  const i = document.querySelector('.td-fast i'); if (i) i.classList.toggle('on', tdS.fast);
}
function tdQuit(done) {
  if (!done && tdS && !tdS.over && !confirm('Rời trận? Trận này sẽ tính là thua.')) return;
  const s = tdS; tdS = null;
  if (s) s.over = s.over || 'quit';
  if (s && s.def.back) s.def.back(); else renderHome();
}
function tdAgain() { const d = tdS && tdS.def; if (d && d.retry) d.retry(); else tdStart(d); }

function tdStyle() {
  if (document.getElementById('td-style')) return;
  const st = document.createElement('style');
  st.id = 'td-style';
  st.textContent = `
  .td { box-sizing: border-box; container-type: inline-size; position: fixed; inset: 0; margin: 0 auto; display: flex; flex-direction: column; background: #1a120c; color: #f3e7c9; overflow: hidden; user-select: none; -webkit-user-select: none; padding: env(safe-area-inset-top) 0 env(safe-area-inset-bottom); }
  @media (min-width: 600px) { .td { max-width: 480px; } }
  .td button { font: inherit; color: inherit; background: none; border: 0; padding: 0; cursor: pointer; }
  .td b, .td span, .td label { text-shadow: 0 .2cqw 0 #000, 0 0 .5cqw #000; }
  .td { background: radial-gradient(ellipse at 50% 45%, #3a2a1c, #120c08 75%); }
  .td-mid { flex: 1; min-height: 0; display: flex; }
  .td-stage { position: relative; width: 100%; flex: 1; overflow: hidden; border-top: .5cqw solid #7d6036; border-bottom: .5cqw solid #7d6036; box-shadow: 0 2cqw 4cqw #0009; }
  .td-bg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: center 60%; }
  .td-dusk { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(14,18,40,.62), rgba(14,18,40,.45) 45%, rgba(14,18,40,.28)); }
  .td-top { position: relative; z-index: 30; display: flex; align-items: center; gap: 1.6cqw; padding: 2cqw; background: linear-gradient(#2e2218, #1a120c); border-bottom: .4cqw solid #7d6036; }
  .td-gear { width: 8cqw; height: 8cqw; flex: none; }
  .td-gear .ic, .td-gear svg { width: 100%; height: 100%; }
  .td-loot { flex: 1; display: flex; align-items: center; gap: 1cqw; height: 6.5cqw; padding: 0 1.5cqw 0 .5cqw; border-radius: 1.2cqw; background: #0008; }
  .td-loot > img, .td-loot .ic, .td-loot svg { width: 5.6cqw; height: 5.6cqw; object-fit: contain; flex: none; }
  .td-loot img[src*="khung_"] { object-fit: cover; object-position: 0 50%; border-radius: 50%; }
  .td-loot b { flex: 1; text-align: center; font-size: 3.3cqw; font-weight: 800; }
  .td-fast { flex: none; display: flex; align-items: center; gap: 1cqw; font-size: 3.4cqw; font-weight: 800; cursor: pointer; }
  .td-fast i { width: 4.6cqw; height: 4.6cqw; border-radius: 1cqw; background: #0008; border: .4cqw solid #c9a24a; display: grid; place-items: center; }
  .td-fast i.on::after { content: ""; width: 2.4cqw; height: 1.2cqw; border-left: .7cqw solid #6f6; border-bottom: .7cqw solid #6f6; transform: translateY(-.4cqw) rotate(-45deg); }
  .td-u { position: absolute; width: 13%; aspect-ratio: 3 / 4; transform: translate(-50%, -100%); transition: transform .18s ease-out, opacity .4s; }
  .td-u img { position: absolute; left: 50%; bottom: 0; width: auto; max-width: 190%; object-fit: contain; object-position: 50% 100%; transform: translateX(-50%); pointer-events: none; }
  .td-u.ta img { transform: translateX(-50%) scaleX(-1); }
  .td-shadow { position: absolute; bottom: 0; left: 14%; right: 14%; height: 10%; border-radius: 50%; background: radial-gradient(closest-side, rgba(0,0,0,.55), transparent); transform: translateY(40%); }
  .td-u.dich { cursor: pointer; }
  .td-u.lunge { transform: translate(calc(-50% + var(--dx)), calc(-100% + var(--dy))); }
  .td-u.hit img { animation: tdHitE .32s; }
  .td-u.ta.hit img { animation: tdHit .32s; }
  @keyframes tdHit { 0%, 100% { filter: none; transform: translateX(-50%) scaleX(-1); } 30% { filter: brightness(2) sepia(1) hue-rotate(-30deg) saturate(4); transform: translateX(calc(-50% - 1.2cqw)) scaleX(-1); } }
  @keyframes tdHitE { 0%, 100% { filter: none; transform: translateX(-50%); } 30% { filter: brightness(2) sepia(1) hue-rotate(-30deg) saturate(4); transform: translateX(calc(-50% + 1.2cqw)); } }
  .td-u.dead { opacity: 0; pointer-events: none; }
  .td-u.stun img { filter: grayscale(.6) brightness(.8); }
  .td-hb { position: absolute; left: 10%; right: 10%; top: -12%; height: 1.2cqw; border-radius: 1cqw; background: #000b; border: .2cqw solid #0008; overflow: hidden; }
  .td-hb i { display: block; height: 100%; background: linear-gradient(#7f6, #2a2); transition: width .3s; }
  .td-u.dich .td-hb i { background: linear-gradient(#f86, #c22); }
  .td-ring { position: absolute; left: 50%; bottom: 0; width: 110%; aspect-ratio: 3 / 1; transform: translate(-50%, 42%); border-radius: 50%; border: .5cqw solid #ffd43b; box-shadow: 0 0 1.5cqw #ffd43b; opacity: 0; }
  .td-u.tgt .td-ring { opacity: 1; }
  .td-wave { position: absolute; right: 3cqw; top: 2cqw; z-index: 120; font-size: 5.5cqw; font-weight: 800; }
  .td-fx { position: absolute; inset: 0; z-index: 200; pointer-events: none; }
  .td-num { position: absolute; transform: translate(-50%, -50%); font-size: 4.6cqw; font-weight: 900; color: #fff; text-shadow: 0 0 .6cqw #000, 0 .3cqw 0 #000; animation: tdNum 1s ease-out forwards; white-space: nowrap; }
  .td-num.crit { font-size: 6.2cqw; color: #ffd43b; }
  .td-num.heal { color: #6f6; }
  .td-u.ta img.nf { transform: translateX(-50%); }
  .td-u.ta.hit img.nf { animation: tdHitE .32s; }
  .td-chi-orb { position: absolute; width: 9cqw; height: 9cqw; margin: -4.5cqw 0 0 -4.5cqw; border-radius: 50%; background: radial-gradient(circle, #fff, #fff3a0 30%, #ffc23a 55%, #ffb00000 72%); animation: tdChiOrb .5s ease-in-out infinite alternate; }
  @keyframes tdChiOrb { from { transform: scale(.6); opacity: .7; } to { transform: scale(1.25); opacity: 1; } }
  .td-bolt { position: absolute; left: 0; top: 0; height: auto; pointer-events: none; transform-origin: 0 0; filter: drop-shadow(0 0 1.5cqw #ffb000aa); }
  .td-chi { position: absolute; height: 2.2cqw; margin-top: -1.1cqw; transform-origin: 0 50%; border-radius: 2cqw; pointer-events: none;
    background: linear-gradient(90deg, #fff0, #fff6c0 18%, #ffd43b 55%, #fff 92%, #fff0); box-shadow: 0 0 2cqw #ffcf3a, 0 0 4cqw #ffa000aa; animation: tdChi .7s ease-out forwards; }
  .td-chi.thin { height: .9cqw; margin-top: -.45cqw; opacity: .8; }
  @keyframes tdChi { 0% { clip-path: inset(0 100% 0 0); opacity: 1; } 25% { clip-path: inset(0 0 0 0); opacity: 1; } 100% { clip-path: inset(0 0 0 70%); opacity: 0; } }
  .td-chi-hit { position: absolute; width: 16cqw; height: 16cqw; margin: -8cqw 0 0 -8cqw; border-radius: 50%; pointer-events: none;
    background: radial-gradient(circle, #fff, #fff3a0 22%, #ffc23a 45%, #ff8a0000 70%); animation: tdChiHit .55s ease-out forwards; }
  @keyframes tdChiHit { 0% { transform: scale(.2); opacity: 1; } 60% { opacity: .9; } 100% { transform: scale(1.4); opacity: 0; } }
  .td-num.bleed { color: #ff5a5a; }
  .td-num.st { color: #9cf; font-size: 3.8cqw; }
  @keyframes tdNum { 0% { opacity: 0; margin-top: 2cqw; } 15% { opacity: 1; margin-top: 0; } 100% { opacity: 0; margin-top: -9cqw; } }
  .td-orbf { position: absolute; width: 3.2cqw; height: 3.2cqw; margin: -1.6cqw 0 0 -1.6cqw; border-radius: 50%; transition: left .55s cubic-bezier(.3,.1,.4,1), top .55s cubic-bezier(.5,0,.6,1), opacity .55s; }
  .td-orbf.blue { background: radial-gradient(circle at 35% 35%, #fff, #4cf 45%, #06a); box-shadow: 0 0 1.8cqw #4cf; }
  .td-orbf.red { background: radial-gradient(circle at 35% 35%, #fff, #f66 45%, #a00); box-shadow: 0 0 1.8cqw #f55; }
  .td-ban { position: absolute; top: 30%; display: flex; align-items: center; gap: 2cqw; padding: 1.5cqw 5cqw 1.5cqw 1.5cqw; background: linear-gradient(90deg, #000c, #0000); animation: tdBan 1.3s ease-out forwards; }
  .td-ban.ta { right: 0; flex-direction: row-reverse; padding: 1.5cqw 1.5cqw 1.5cqw 5cqw; background: linear-gradient(270deg, #000c, #0000); }
  .td-ban.dich { left: 0; }
  .td-ban b { font: 6cqw 'Pattaya', serif; color: #ffd76a; text-shadow: 0 .4cqw 0 #5a2a00, 0 0 1.5cqw #000 !important; white-space: nowrap; }
  .td-ban-pt { position: relative; width: 14cqw; height: 14cqw; border-radius: 50%; overflow: hidden; border: .5cqw solid #ffd76a; background: #2a2018; flex: none; }
  @keyframes tdBan { 0% { opacity: 0; transform: scaleY(.3); } 12% { opacity: 1; transform: none; } 80% { opacity: 1; } 100% { opacity: 0; } }
  .td-wavebig { position: absolute; left: 50%; top: 40%; transform: translate(-50%, -50%); font: 10cqw 'Pattaya', serif; color: #ffd76a; text-shadow: 0 .5cqw 0 #5a2a00, 0 0 2cqw #000; animation: tdBan 1.2s forwards; }
  .td-panel { position: relative; flex: none; padding: 3cqw 1cqw 2cqw; background: linear-gradient(#5a4632, #2e2218); border-top: .6cqw solid #c9a24a; }
  .td-auto { position: absolute; left: 50%; top: -6cqw; transform: translateX(-50%); width: 15cqw; height: 15cqw; border-radius: 50% !important; z-index: 5; background: radial-gradient(circle at 40% 35%, #8fdc6a, #2f7a22) !important; border: .7cqw solid #d8b25a !important; font: 4.6cqw 'Pattaya', serif !important; color: #fff !important; box-shadow: 0 .5cqw 1cqw #0009; }
  .td-auto.on { background: radial-gradient(circle at 40% 35%, #ffe28a, #c88a12) !important; box-shadow: 0 0 2.5cqw #ffd43b; }
  .td-cards { display: grid; grid-template-columns: repeat(5, 1fr); gap: 1cqw; margin-top: 7cqw; }
  .td-card { display: flex; flex-direction: column; gap: .6cqw; padding: .8cqw; border-radius: 1.2cqw !important; background: linear-gradient(#7a4aa8, #3a1e5a) !important; border: .4cqw solid #b8a0e0 !important; transition: filter .2s, transform .1s; }
  .td-card.r-ho_ve { background: linear-gradient(#3a7ac8, #1a3a6a) !important; }
  .td-card.r-cong_kich { background: linear-gradient(#c85a3a, #6a2010) !important; }
  .td-card.r-tri_lieu { background: linear-gradient(#4ab85a, #1a5a22) !important; }
  .td-card.r-ho_tro { background: linear-gradient(#c8a83a, #6a5010) !important; }
  .td-card:active { transform: scale(.95); }
  .td-card.done { filter: brightness(.55); }
  .td-card.dead { filter: grayscale(1) brightness(.4); pointer-events: none; }
  .td-pt { position: relative; display: block; width: 100%; aspect-ratio: 1; overflow: hidden; border-radius: .8cqw; background: #0004; }
  .td-pt img { width: 100%; }
  .td-hpn { display: flex; align-items: center; gap: .6cqw; }
  .td-hpn img { width: 4.2cqw; height: 4.2cqw; border-radius: .6cqw; flex: none; }
  .td-hpn b { flex: 1; text-align: center; font-size: 3.2cqw; font-weight: 800; color: #9f9; }
  .td-bar { display: block; height: 1.6cqw; border-radius: 1cqw; background: #000a; overflow: hidden; }
  .td-bar i { display: block; height: 100%; transition: width .3s; }
  .td-bar.hp i { background: linear-gradient(#8f6, #3a3); }
  .td-bar.no i { background: linear-gradient(#9ef, #2ad); }
  .td-orbs { display: grid; grid-template-columns: repeat(5, 1fr); gap: 1cqw; margin-top: 2cqw; justify-items: center; }
  .td-orb { width: 15cqw; height: 15cqw; border-radius: 50% !important; background: radial-gradient(circle at 40% 35%, #8a8070, #2a2620 70%) !important; border: .8cqw solid #9a7a4a !important; box-shadow: inset 0 0 2cqw #000; display: grid; place-items: center; pointer-events: none; }
  .td-orb i { width: 60%; height: 60%; border-radius: 50%; opacity: 0; background: radial-gradient(circle, #fff, #ffe86a 35%, #fa0 60%, #fa00 72%); }
  .td-orb.ready { pointer-events: auto; border-color: #ffd43b !important; animation: tdOrb 1s ease-in-out infinite alternate; }
  .td-orb.ready i { opacity: 1; }
  @keyframes tdOrb { from { box-shadow: inset 0 0 2cqw #000, 0 0 1cqw #ffd43b; } to { box-shadow: inset 0 0 2cqw #000, 0 0 3.5cqw #ffd43b; } }
  .td-end { position: absolute; inset: 0; z-index: 300; display: grid; place-items: center; background: #000a; }
  .td-end-in { width: 80cqw; padding: 6cqw 5cqw; border-radius: 3cqw; text-align: center; background: linear-gradient(#3a2a1a, #1a120a); border: .6cqw solid #c9a24a; }
  .td-end-t { display: block; font: 10cqw 'Pattaya', serif; color: #ffd76a; }
  .td-end.lose .td-end-t { color: #c8b8a8; }
  .td-end p { margin: 2cqw 0; font-size: 3.8cqw; }
  .td-end-loot { display: flex; justify-content: center; align-items: center; gap: 1cqw; }
  .td-end-loot .ic, .td-end-loot svg { width: 5cqw; height: 5cqw; }
  .td-stars { display: flex; justify-content: center; gap: 2cqw; margin: 3cqw 0; }
  .td-stars i { width: 12cqw; height: 12cqw; background: #3a3020; clip-path: polygon(50% 0, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%); }
  .td-stars i.on { background: #ffd43b; }
  .td-end-btn { display: flex; gap: 3cqw; justify-content: center; margin-top: 4cqw; }
  .td-end-btn button { padding: 2.5cqw 5cqw; border-radius: 2cqw; font: 4.6cqw 'Pattaya', serif; background: linear-gradient(#3f8a4a, #1d5426); border: .5cqw solid #c9a24a; color: #f3e7c9; }
  `;
  document.head.appendChild(st);
}
const TRAN_DOI_G = { tdStart, tdTap, tdUlt, tdPick, tdAuto, tdFast, tdQuit, tdAgain };
