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
  // rơi cục (người dùng chốt 2026-11-12): mỗi đòn trúng cứ mất 10% máu tối đa rơi 1 cục (ít nhất 1, nhiều nhất 5);
  // kẻ chết rơi thêm 3 cục + chiến lợi phẩm; mỗi cục 65% xanh (Nộ), 35% đỏ (máu)
  dropPct: 0.1, dropMax: 5, deathOrbs: 3, blueRate: 0.65,
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
  const team = hkMembers().map((h, k) => ({ h, k })).sort((a, b) => (front.includes(b.h.role) - front.includes(a.h.role)) || a.k - b.k);
  tdS = {
    def: def || TD_TEST, wave: 0, round: 1, phase: 'ta', busy: false, target: 0, deaths: 0,
    auto: !!(tdS && tdS.auto), fast: !!(tdS && tdS.fast), loot: { bac: 0, luong: 0, manh: 0 }, over: null,
    ta: team.map(({ h }, i) => tdUnit('ta', i, { name: h.name, img: h.img, art: h.art, face: h.face, sprite: h.sprite, spFlip: h.spFlip, hand: h.hand, ult: h.ult, anim: h.anim, spSize: h.spSize, role: h.role, skill: h.skill,
      ...(st => ({ maxHp: st.hp, atk: st.atk, def: st.def, hoi: st.hoi, spd: st.spd, mi: st.mi }))(heroSt(h)) })),
  };
  tdS.ta.forEach(u => { if (u.role === 'ky_nang') u.no = TD.noMax; });
  // tải trước hình động / hiệu ứng Blender của đội để lúc tung chiêu không bị trống
  tdS.ta.forEach(u => {
    const list = u.anim ? Object.values(u.anim).filter(v => v && v.src).map(v => v.src) : [];
    if (u.anim && u.anim.chem && TD_SLASH[u.anim.chem.slash]) list.push(TD_SLASH[u.anim.chem.slash].src);
    if (u.ult && u.ult.fx === 'nguyen') list.push(TD_CURSE.nom.src, TD_CURSE.no.src);
    if (u.ult && u.ult.fx === 'langba') list.push(TD_LANGBA.src);
    if (u.anim && u.anim.danh && TD_SHOT[u.anim.danh.shot]) list.push(TD_SHOT[u.anim.danh.shot].src, TD_SHOT[u.anim.danh.shot].hit.src);
    if (u.ult && u.ult.fx === 'chi') list.push(TD_BURST.src);
    if (u.ult && TD_SHIELD[u.ult.shield]) list.push(TD_SHIELD[u.ult.shield].back, TD_SHIELD[u.ult.shield].front);
    list.forEach(src => { const im = new Image(); im.src = src; });
  });
  const keys = typeof SAN_DAU !== 'undefined' ? Object.keys(SAN_DAU.sets) : [];
  tdS.bg = keys.length ? SAN_DAU.sets[tdRand(keys)].mb : { src: TD.bg };
  tdS.dich = tdWave(0);
  tdRender();
  homeNoDrag(); if (hasSnd()) SND.music('combat');
  tdPhaseTa();
}

/* ---------- vẽ ---------- */
function tdPortrait(img, art, face) {
  // tranh 781 × 1400: phóng 250%, đặt tâm mặt (face, tỉ lệ tranh) vào giữa ô
  if (art) { const [fx, fy] = face || [0.5, 0.28]; return `<img src="${art}" alt="" draggable="false" style="position:absolute;width:250%;left:${(50 - fx * 250).toFixed(1)}%;top:${(50 - fy * 250 * 1400 / 781).toFixed(1)}%">`; }
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
    <img class="${u.sprite && !u.spFlip ? 'nf' : ''}" src="${u.sprite || `game/img/quai/${u.img}.png`}" alt="" draggable="false" style="height:${(k * 100).toFixed(0)}%;animation-delay:-${((u.i * 0.53 + (u.side === 'dich' ? 0.3 : 0)) % 2.6).toFixed(2)}s">
    <span class="td-hb"><i style="width:${(u.hp / u.maxHp * 100).toFixed(1)}%"></i></span>
    <i class="td-zzz" style="bottom:${(k * 88).toFixed(0)}%"><b>Z</b><b>z</b><b>z</b></i>
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
      <span class="td-pt">${tdPortrait(u.img, u.art, u.face)}</span>
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
      el2.classList.toggle('sleep', u.sleep > 0 && !u.dead);
      const b = el2.querySelector('.td-hb i'); if (b) b.style.width = (u.hp / u.maxHp * 100).toFixed(1) + '%';
      tdFxSync(u);
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
  d.innerHTML = `<span class="td-ban-pt">${tdPortrait(u.img, u.art, u.face)}</span><b>${esc(name)}</b>`;
  fx.appendChild(d); setTimeout(() => d.remove(), 1300);
}
// cục khí bay từ kẻ bị đánh về người nhận (phe ta: về thẻ dưới; phe địch: về người trên sân)
// Hình cục rơi (người dùng yêu cầu như game mẫu): giọt nước xanh = Nộ, trái tim đỏ = máu; vẽ bằng SVG, có vệt sáng
const TD_ORB_SVG = {
  blue: `<svg viewBox="0 0 40 52"><defs><radialGradient id="tdgB" cx="38%" cy="62%" r="70%"><stop offset="0" stop-color="#d8f6ff"/><stop offset=".45" stop-color="#3fb6ff"/><stop offset="1" stop-color="#0b4fb8"/></radialGradient></defs>
    <path d="M20 2 C20 2 4 24 4 34 A16 16 0 0 0 36 34 C36 24 20 2 20 2 Z" fill="url(#tdgB)" stroke="#073a7a" stroke-width="2"/>
    <ellipse cx="13" cy="34" rx="3.5" ry="7" fill="#fff" opacity=".75" transform="rotate(-18 13 34)"/></svg>`,
  red: `<svg viewBox="0 0 48 44"><defs><radialGradient id="tdgR" cx="35%" cy="35%" r="75%"><stop offset="0" stop-color="#ffd0d0"/><stop offset=".4" stop-color="#ff3b3b"/><stop offset="1" stop-color="#9a0010"/></radialGradient></defs>
    <path d="M24 41 C10 31 3 23 3 14 A10.5 10.5 0 0 1 24 9 A10.5 10.5 0 0 1 45 14 C45 23 38 31 24 41 Z" fill="url(#tdgR)" stroke="#6a0010" stroke-width="2"/>
    <ellipse cx="13" cy="14" rx="4" ry="3" fill="#fff" opacity=".8" transform="rotate(-30 13 14)"/></svg>`,
};
function tdDrop(a, t, kind, val) {
  const s = tdS, fx = document.getElementById('td-fx'); if (!s) return;
  const p = tdPos(t), cq = fx ? fx.clientWidth / 100 : 4;
  // điểm rơi: dưới chân kẻ bị đánh, lệch ngẫu nhiên
  const g = { x: p.x + (Math.random() - 0.5) * 16 * cq, y: p.y + (6 + Math.random() * 8) * cq };
  const o = { side: a.side, kind, hoi: Math.round(a.hoi), val, el: null };
  const LOOT_IMG = { bac: 'game/img/icon/bac.png', luong: 'game/img/icon/khung_luong_thuc.png', manh: 'game/img/icon/manh_vo_so.png' };
  if (fx) {
    const d = document.createElement('div');
    d.className = 'td-orbf ' + kind + (LOOT_IMG[kind] ? ' loot' : ''); d.style.left = p.x + 'px'; d.style.top = p.y + 'px';
    if (LOOT_IMG[kind]) d.innerHTML = `<img src="${LOOT_IMG[kind]}" alt="">`;
    else d.innerHTML = TD_ORB_SVG[kind] || '';
    fx.appendChild(d); o.el = d;
    requestAnimationFrame(() => requestAnimationFrame(() => { d.style.left = g.x + 'px'; d.style.top = g.y + 'px'; d.classList.add('ground'); }));
  }
  (s.ground = s.ground || []).push(o);
}
// hết lượt một phe: các cục của phe đó bay về người nhận. Cục xanh +Nộ (không cho Kỹ Năng, vì Nộ luôn đầy),
// cục đỏ hồi máu = chỉ số Hồi của người đã đánh rơi ra cục đó (số hiện là lượng máu thực hồi được)
async function tdCollect(side) {
  const s = tdS; if (!s || !s.ground) return;
  const mine = s.ground.filter(o => o.side === side); if (!mine.length) return;
  s.ground = s.ground.filter(o => o.side !== side);
  const fast = s.fast;
  mine.forEach((o, k) => setTimeout(() => {
    if (o.val != null) { // chiến lợi phẩm: bay lên ô đếm
      const box = document.getElementById('td-l-' + o.kind), root = document.querySelector('.td');
      if (o.el && box && root) {
        const R = root.getBoundingClientRect(), r = box.getBoundingClientRect();
        o.el.classList.remove('ground'); o.el.classList.add('fly');
        o.el.style.left = (r.left - R.left + r.width * 0.2) + 'px'; o.el.style.top = (r.top - R.top + r.height / 2) + 'px';
      }
      setTimeout(() => { if (o.el) o.el.remove(); s.loot[o.kind] += o.val; tdSync(); }, fast ? 300 : 520);
      return;
    }
    const pool = o.kind === 'blue' ? tdAlive(side).filter(u => u.role !== 'ky_nang') : tdAlive(side);
    if (!pool.length || !o.el) { if (o.el) o.el.remove(); return; }
    const r = tdRand(pool), b = r.side === 'ta' ? tdPos(r, 'card') : tdPos(r);
    o.el.classList.remove('ground'); o.el.classList.add('fly');
    o.el.style.left = b.x + 'px'; o.el.style.top = b.y + 'px';
    setTimeout(() => {
      o.el.remove();
      if (o.kind === 'blue') r.no = Math.min(TD.noMax, r.no + TD.orbNo);
      else if (!r.dead && r.hp < r.maxHp) { const h = Math.min(o.hoi, Math.round(r.maxHp - r.hp)); r.hp += h; tdPop(r, '+' + h, 'heal'); }
      tdSync();
    }, fast ? 300 : 520);
  }, k * (fast ? 40 : 70)));
  await tdWait(mine.length * 70 + 650);
}
function tdClearGround() { if (tdS && tdS.ground) { tdS.ground.forEach(o => o.el && o.el.remove()); tdS.ground = []; } }
function tdLunge(u, tgt, hold) {
  const e = document.getElementById(`td-${u.side}-${u.i}`); if (!e) return;
  const a = tdPos(u), b = tdPos(tgt);
  e.style.setProperty('--dx', ((b.x - a.x) * 0.55).toFixed(0) + 'px');
  e.style.setProperty('--dy', ((b.y - a.y) * 0.55).toFixed(0) + 'px');
  e.classList.add('lunge');
  const ms = hold || 380;
  setTimeout(() => e.classList.remove('lunge'), tdS && tdS.fast ? ms / 2 : ms);
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
/* ---------- hình động + hiệu ứng làm bằng Blender (tools/blender/) ----------
   Mỗi tấm là một dải ngang N khung; phát bằng cách trượt dải theo từng khung (steps). */
const TD_SHIELD = { nuoc: { back: 'game/img/blender/fx_bl_khien_sau.webp', front: 'game/img/blender/fx_bl_khien_truoc.webp', n: 20, ms: 1000, ar: 224 / 280 } };
const TD_BURST = { src: 'game/img/blender/fx_bl_no_vang.webp', n: 16, ms: 560 };
const TD_SLASH = { nuoc: { src: 'game/img/blender/fx_bl_chem_nuoc.webp', n: 12, ms: 480 } };
// Hoán Hồn Khúc (Diệp Nhị Nương): hình nộm rơm phát sáng trên đầu đội hình địch, rồi nổ tà thuật tím dưới chân từng kẻ
const TD_CURSE = {
  nom: { src: 'game/img/blender/fx_bl_nom_rom.webp', n: 18, ms: 900 },
  no: { src: 'game/img/blender/fx_bl_no_tim.webp', n: 20, ms: 900, ar: 250 / 200, foot: 0.8 },
};
// đạn đánh thường bay từ tay tới mục tiêu (sóng âm tím của Diệp Nhị Nương); ax/ay = điểm neo đầu đạn trên tấm (tỉ lệ)
const TD_SHOT = {
  song_am: { src: 'game/img/blender/fx_bl_song_am.webp', n: 8, ms: 400, size: 17, ax: 0.2, ay: 0.5, fly: 320,
    hit: { src: 'game/img/blender/fx_bl_no_tim_nho.webp', n: 16, ms: 520, size: 18 } },
  // Lục Mạch Thần Kiếm (Đoàn Dự): kiếm khí xanh băng, tấm 2:1, mũi kiếm ở 85% ngang
  kiem_khi: { src: 'game/img/blender/fx_bl_kiem_khi.webp', n: 8, ms: 400, size: 30, ar: 0.5, ax: 0.85, ay: 0.5, fly: 240,
    hit: { src: 'game/img/blender/fx_bl_no_xanh_nho.webp', n: 16, ms: 480, size: 16 } },
};
// điểm bắn: tay (u.hand); có hình động và `tip` thì cộng đầu ngón lúc ra chiêu
function tdShotFrom(u, tip) {
  const a = tdHand(u); if (!tip) return a;
  const b = tdBody(u); if (!b) return a;
  a.x += (b.img.classList.contains('nf') ? 1 : -1) * tip[0] * b.k; a.y += tip[1] * b.k;
  return a;
}
function tdShoot(u, t, kind, from) {
  const box = document.getElementById('td-fx'), S = TD_SHOT[kind];
  if (!box || !S) return Promise.resolve();
  return new Promise(done => {
    const cq = box.clientWidth / 100, fast = tdS && tdS.fast, a = from || tdHand(u), b = tdPos(t);
    const sz = S.size * cq, sh = sz * (S.ar || 1), ang = Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI;
    const s = tdStrip(S.src, S.n, S.ms, true);
    Object.assign(s.el.style, { left: a.x - sz * S.ax + 'px', top: a.y - sh * S.ay + 'px', width: sz + 'px', height: sh + 'px', transformOrigin: `${S.ax * 100}% ${S.ay * 100}%` });
    box.appendChild(s.el);
    let fin = false;
    const end = () => {
      if (fin) return; fin = true; s.el.remove();
      const H = S.hit, hs = H.size * cq, h = tdStrip(H.src, H.n, H.ms * (fast ? 0.6 : 1), false);
      Object.assign(h.el.style, { left: b.x - hs / 2 + 'px', top: b.y - hs / 2 + 'px', width: hs + 'px', height: hs + 'px' });
      box.appendChild(h.el); setTimeout(() => h.el.remove(), H.ms + 250);
      done();
    };
    const fly = S.fly * (fast ? 0.5 : 1), dx = b.x - a.x, dy = b.y - a.y;
    if (s.el.animate) s.el.animate([{ transform: `translate(0, 0) rotate(${ang}deg) scale(.6)`, opacity: .6 }, { transform: `translate(${dx}px, ${dy}px) rotate(${ang}deg) scale(1.1)`, opacity: 1 }], { duration: fly, easing: 'ease-in', fill: 'forwards' }).onfinish = end;
    setTimeout(end, fly + 150);   // dự phòng
  });
}
// Lăng Ba Vi Bộ (Đoàn Dự): sóng nước + gió dưới chân từng đồng đội
const TD_LANGBA = { src: 'game/img/blender/fx_bl_song_nuoc.webp', n: 20, ms: 1000, ar: 250 / 200, foot: 0.8, size: 30 };
function tdGroundFx(t, N) {
  const box = document.getElementById('td-fx'); if (!box) return;
  const cq = box.clientWidth / 100, p = tdFeet(t), w = N.size * cq, h = w * N.ar;
  const s = tdStrip(N.src, N.n, N.ms * (tdS && tdS.fast ? 0.5 : 1), false);
  Object.assign(s.el.style, { left: p.x - w / 2 + 'px', top: p.y - h * N.foot + 'px', width: w + 'px', height: h + 'px' });
  box.appendChild(s.el); setTimeout(() => s.el.remove(), N.ms + 250);
}
// bóng mờ đuổi theo khi nhân vật lướt (chép hình động đang chạy, chậm hơn một nhịp)
function tdGhosts(u, which) {
  const A = u.anim && u.anim[which], e = document.getElementById(`td-${u.side}-${u.i}`);
  const body = e && e.querySelector('.td-sheet.body:not(.old)'); if (!A || !body) return;
  const k = tdS && tdS.fast ? 0.5 : 1;
  [[90, 0.4], [180, 0.22]].forEach(([d, op]) => {
    const g = tdStrip(A.src, A.n, A.ms * k, false);
    g.el.style.cssText = body.style.cssText; g.el.classList.add('ghost'); g.el.style.opacity = op;
    if (g.anim) g.anim.currentTime = -d * k;
    e.insertBefore(g.el, body); setTimeout(() => g.el.remove(), (A.ms + d) * k + 100);
  });
}
// chân một người (px, so với khung .td)
function tdFeet(t) {
  const root = document.querySelector('.td'), e = document.getElementById(`td-${t.side}-${t.i}`);
  if (!root || !e) return { x: 0, y: 0 };
  const R = root.getBoundingClientRect(), r = e.getBoundingClientRect();
  return { x: r.left + r.width / 2 - R.left, y: r.bottom - R.top };
}
async function tdCurseFx(u, foes, onBlast) {
  const box = document.getElementById('td-fx'); if (!box || !foes.length) { if (onBlast) onBlast(); return; }
  const cq = box.clientWidth / 100, fast = tdS && tdS.fast, k = fast ? 0.5 : 1;
  const A = u.anim && u.anim.phep, an = A ? tdAnimPlay(u, 'phep') : null;
  const at = f => (A ? f / A.n * A.ms : 0);
  await tdWait(A ? at(A.doll) : 250);
  // dấu ấn: hình nộm rơm lơ lửng trên đầu đội hình địch (giữa các kẻ địch, cao hơn đầu người cao nhất)
  const R = box.getBoundingClientRect();
  const tops = foes.map(t => { const e = document.getElementById(`td-${t.side}-${t.i}`), img = e && e.querySelector('img'); return img ? img.getBoundingClientRect().top - R.top : tdPos(t).y; });
  const cx = foes.reduce((s, t) => s + tdPos(t).x, 0) / foes.length, sz = 26 * cq;
  const nom = tdStrip(TD_CURSE.nom.src, TD_CURSE.nom.n, TD_CURSE.nom.ms * k, false);
  Object.assign(nom.el.style, { left: cx - sz / 2 + 'px', top: Math.max(0, Math.min(...tops) - sz * 0.85) + 'px', width: sz + 'px', height: sz + 'px' });
  box.appendChild(nom.el); setTimeout(() => nom.el.remove(), TD_CURSE.nom.ms * k + 250);
  await tdWait(A ? at(A.blast) - at(A.doll) : 600);
  // nổ tà thuật dưới chân mọi kẻ địch
  const N = TD_CURSE.no, w = 30 * cq, h = w * N.ar;
  foes.forEach((t, j) => setTimeout(() => {
    if (!box.isConnected) return;
    const p = tdFeet(t), s = tdStrip(N.src, N.n, N.ms * k, false);
    Object.assign(s.el.style, { left: p.x - w / 2 + 'px', top: p.y - h * N.foot + 'px', width: w + 'px', height: h + 'px' });
    box.appendChild(s.el); setTimeout(() => s.el.remove(), N.ms * k + 250);
  }, j * 60 * k));
  await tdWait(150);
  if (onBlast) onBlast();
  await tdWait(450);
  if (an && an.playState === 'paused') an.play();
}
// vệt chém ở chỗ trúng; người chém đứng bên phải mục tiêu thì lật ngang
function tdSlash(kind, a, t) {
  const box = document.getElementById('td-fx'), S = TD_SLASH[kind]; if (!box || !S) return;
  const p = tdPos(t), cq = box.clientWidth / 100, sz = 30 * cq;
  const s = tdStrip(S.src, S.n, S.ms * (tdS && tdS.fast ? 0.6 : 1), false);
  Object.assign(s.el.style, { left: p.x - sz / 2 + 'px', top: p.y - sz / 2 + 'px', width: sz + 'px', height: sz + 'px', transform: tdPos(a).x > p.x ? 'scaleX(-1)' : '' });
  box.appendChild(s.el);
  setTimeout(() => s.el.remove(), S.ms + 250);
}
function tdStrip(src, n, ms, loop) {
  const d = document.createElement('div'); d.className = 'td-sheet';
  const im = document.createElement('img'); im.className = 'td-strip'; im.src = src; im.alt = ''; im.draggable = false; d.appendChild(im);
  const fr = []; for (let i = 0; i < n; i++) fr.push({ transform: `translateX(${(-i * 100 / n).toFixed(3)}%)` });
  const anim = im.animate ? im.animate(fr, { duration: ms, iterations: loop ? Infinity : 1, easing: `steps(${n}, jump-none)`, fill: 'forwards' }) : null;
  return { el: d, anim };
}
// khung chứa phần hình thật của nhân vật (tọa độ trong ô .td-u), tính từ chiều cao ảnh, không cần ảnh đã tải xong
function tdBody(u) {
  const e = document.getElementById(`td-${u.side}-${u.i}`), img = e && e.querySelector('img');
  if (!img) return null;
  const R = e.getBoundingClientRect(), r = img.getBoundingClientRect();
  const [iw, ih] = u.anim ? [u.anim.iw, u.anim.ih] : (u.spSize || [img.naturalWidth || 3, img.naturalHeight || 4]);
  const h = Math.min(r.height, 1.9 * R.width * ih / iw), w = h * iw / ih;   // ảnh rộng bị bó ở 190% bề ngang ô
  const cx = r.left + r.width / 2 - R.left, bot = r.bottom - R.top;
  return { e, img, k: h / ih, x: cx - w / 2, y: bot - h, w, h, cx, bot };
}
// phát hình động 'idle' (lặp) hoặc 'atk' (một lần, xong tự về 'idle'); trả về đối tượng hoạt ảnh
function tdAnimPlay(u, which) {
  const A = u.anim, b = A && tdBody(u); if (!b) return null;
  b.e.classList.add('has-anim');
  // hình cũ giữ lại tới khi hình mới đã giải mã xong (tránh nháy trống lúc đổi động tác)
  const old = [...b.e.querySelectorAll('.td-sheet.body')];
  old.forEach(x => x.classList.add('old'));
  const S = A[which], loop = which === 'idle';
  const s = tdStrip(S.src, S.n, S.ms * (!loop && tdS && tdS.fast ? 0.5 : 1), loop);
  s.el.classList.add('body');
  const [x0, y0, x1, y1] = A.box;
  // ảnh gốc quay trái mà đứng phe ta (lật ngang như hình tĩnh) thì lật cả khung hình động, vùng xuất lấy đối xứng
  const flip = u.side === 'ta' && !b.img.classList.contains('nf');
  const left = flip ? b.x + (A.iw - x1) * b.k : b.x + x0 * b.k;
  Object.assign(s.el.style, { left: left + 'px', top: b.y + y0 * b.k + 'px', width: (x1 - x0) * b.k + 'px', height: (y1 - y0) * b.k + 'px', transform: flip ? 'scaleX(-1)' : '' });
  b.e.appendChild(s.el);
  const im = s.el.querySelector('img'), drop = () => old.forEach(x => x.remove());
  if (old.length) {
    if (im.complete && im.naturalWidth) drop();
    else { let dn = false; const go = () => { if (!dn) { dn = true; drop(); } }; (im.decode ? im.decode() : Promise.reject()).then(go, go); setTimeout(go, 400); }
  }
  if (!loop && s.anim) s.anim.onfinish = () => { if (s.el.isConnected && !u.dead) tdAnimPlay(u, 'idle'); };
  return s.anim;
}
// khiên quanh người (Ngạc Thần Hộ Thể): lớp sau lưng + lớp trước người
function tdShield(u, on) {
  const b = tdBody(u); if (!b) return;
  const cur = [...b.e.querySelectorAll('.td-sheet.shield:not(.out)')];
  if (!on) { cur.forEach(x => { x.classList.add('out'); setTimeout(() => x.remove(), 400); }); return; }
  if (cur.length) return;
  const S = TD_SHIELD[u.ult.shield]; if (!S) return;
  const H = b.h * 1.5, W = H * S.ar;
  ['back', 'front'].forEach(l => {
    const s = tdStrip(S[l], S.n, S.ms, true); s.el.classList.add('shield', l);
    Object.assign(s.el.style, { left: b.cx - W / 2 + 'px', top: b.bot - H * 0.81 + 'px', width: W + 'px', height: H + 'px' });
    b.e.appendChild(s.el);
  });
}
// gọi trong tdSync: gắn hình động / khiên cho đúng trạng thái (sau khi vẽ lại màn, qua đợt, hết hiệu lực, chết)
function tdFxSync(u) {
  const e = document.getElementById(`td-${u.side}-${u.i}`); if (!e) return;
  if (u.anim && !u.dead && !e.querySelector('.td-sheet.body')) tdAnimPlay(u, 'idle');
  if (u.ult && u.ult.shield) {
    const want = !u.dead && !!u.buf.hp, has = !!e.querySelector('.td-sheet.shield:not(.out)');
    if (want !== has) tdShield(u, want);
  }
}
function tdBurst(box, p, cq) {
  const s = tdStrip(TD_BURST.src, TD_BURST.n, TD_BURST.ms * (tdS && tdS.fast ? 0.6 : 1), false), sz = 24 * cq;
  Object.assign(s.el.style, { left: p.x - sz / 2 + 'px', top: p.y - sz / 2 + 'px', width: sz + 'px', height: sz + 'px' });
  box.appendChild(s.el);
  setTimeout(() => s.el.remove(), TD_BURST.ms + 250);
}
async function tdChi(u, foes, onHit) {
  const box = document.getElementById('td-fx'); if (!box || !foes.length) return;
  const fast = tdS && tdS.fast, cq = box.clientWidth / 100, A = u.anim;
  // có hình động: lấy đà, giơ tay chĩa ngón về phía trước, đứng giữ thế trong lúc bắn, bắn xong mới hạ tay
  const an = A && A.atk ? tdAnimPlay(u, 'atk') : null;
  if (an) await tdWait(A.atk.fire);
  const a = tdHand(u);
  if (an) { const b = tdBody(u); if (b) { a.x += (b.img.classList.contains('nf') ? 1 : -1) * A.tip[0] * b.k; a.y += A.tip[1] * b.k; } }
  const orb = document.createElement('div');
  orb.className = 'td-chi-orb'; orb.style.left = a.x + 'px'; orb.style.top = a.y + 'px';
  box.appendChild(orb);
  await tdWait(an ? 100 : 380);
  if (an) { an.pause(); an.currentTime = A.atk.hold / A.atk.n * an.effect.getTiming().duration; }
  // mỗi kẻ địch 3 tia chỉ lực (ảnh fx_chi_luc.png, đầu tia ở mép phải ảnh), bắn tùm lum xen kẽ
  const shots = [];
  foes.forEach((t, j) => { const n = (u.ult && u.ult.split || [1, 1, 1]).length; for (let k = 0; k < n; k++) shots.push({ t, k, at: j * 70 + k * 190 + Math.random() * 90 }); });
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
      tdBurst(box, e, cq);   // nổ chùm sáng vàng (Blender)
      if (onHit) onHit(sh.t, sh.k);
      done();
    };
    if (img.animate) img.animate([{ transform: tf(s0, 0.45), opacity: 0.4 }, { transform: tf(e, 1), opacity: 1 }], { duration: fly, easing: 'ease-in', fill: 'forwards' }).onfinish = end;
    setTimeout(end, fly + 120); // dự phòng
  }, fast ? sh.at / 2 : sh.at))));
  await tdWait(220);
  orb.remove();
  if (an && an.playState === 'paused') an.play();   // hạ tay về thế đứng
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
  // rơi cục xuống đất cạnh kẻ bị đánh (người dùng chốt 2026-11-12): sát thương càng lớn rơi càng nhiều (1–3 cục),
  // nằm đó tới hết lượt của phe người đánh rồi mới bay về ngẫu nhiên một người cùng phe (tdCollect)
  const n = noOrb ? 0 : Math.max(1, Math.min(TD.dropMax, Math.floor(dmg / t.maxHp / TD.dropPct)));
  for (let k = 0; k < n; k++) tdDrop(a, t, tdOrbKind());
  if (t.hp <= 0 && !t.dead) tdKill(t, a);
}
const tdOrbKind = () => (Math.random() < TD.blueRate ? 'blue' : 'red');
// a = người hạ (không có khi chết vì chảy máu: coi như phe đối diện, Hồi trung bình phe đó)
function tdKill(t, a) {
  t.dead = true; t.no = 0;
  if (!a) { const f = tdAlive(tdFoe(t)); a = { side: tdFoe(t), hoi: f.length ? f.reduce((x, u) => x + u.hoi, 0) / f.length : 0 }; }
  for (let k = 0; k < TD.deathOrbs; k++) tdDrop(a, t, tdOrbKind());
  if (t.side === 'ta') tdS.deaths++;
  else {
    // chiến lợi phẩm rơi xuống đất, hết lượt mới bay lên ô đếm trên cùng
    // bạc và lương thực cùng một mức gốc, mỗi thứ dao động riêng ±10% (người dùng chốt 2026-11-12)
    const v = 30 + (t.boss ? 100 : 0), jit = () => Math.round(v * (0.9 + Math.random() * 0.2));
    tdDrop(a, t, 'bac', jit()); tdDrop(a, t, 'luong', jit());
    if (t.boss || Math.random() < 0.1) tdDrop(a, t, 'manh', 1);
  }
}
async function tdNormal(u) {
  const t = tdTarget(u); if (!t) return;
  const C = u.anim && u.anim.chem;
  if (C) {
    // có hình động chém (Nam Hải): lao tới, vung binh khí bổ xuống, vệt chém ở chỗ trúng đúng khung lưỡi chạm
    const hitMs = C.hit / C.n * C.ms;
    tdLunge(u, t, hitMs + 260);
    tdAnimPlay(u, 'chem');
    await tdWait(hitMs - 60);
    if (C.slash) tdSlash(C.slash, u, t);
    await tdWait(60);
  } else if (u.anim && u.anim.danh) {
    // đánh từ xa (Diệp Nhị Nương): lắc trống, đẩy trống về phía địch, sóng âm bay tới, chạm thì nổ
    const D = u.anim.danh;
    tdAnimPlay(u, 'danh');
    await tdWait(D.fire / D.n * D.ms);
    await tdShoot(u, t, D.shot, tdShotFrom(u, D.tip));
  } else {
    tdLunge(u, t);
    await tdWait(220);
  }
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
        // chia sát thương của chiêu theo split (Đoàn Diên Khánh 20 / 20 / 20 / 40%); tia cuối gom phần làm tròn, rơi cục, gây chảy máu
        const sp = U.split || [1 / 3, 1 / 3, 1 / 3], last = k === sp.length - 1, r = plan.get(t);
        const part = last ? r.d - sp.slice(0, -1).reduce((a, f) => a + Math.round(r.d * f), 0) : Math.round(r.d * sp[k]);
        tdHurt(u, t, Math.max(1, part), r.crit, !last);
        if (last) bleed(t);
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
  } else if (U.kind === 'guard') {
    // Hộ Vệ (Nam Hải Ngạc Thần): tăng khí huyết TỐI ĐA bản thân theo % (máu hiện tại tăng theo) trong vài hiệp, giảm Công ngẫu nhiên N kẻ địch
    if (u.buf.hp) { u.maxHp -= u.buf.hp.add; u.hp = Math.min(u.hp, u.maxHp); }
    const add = Math.round(u.maxHp * U.selfHp);
    u.maxHp += add; u.hp += add; u.buf.hp = { v: U.selfHp, t: U.turns, add };
    if (U.shield) tdShield(u, true);
    tdPop(u, 'HP tối đa +' + Math.round(U.selfHp * 100) + '%', 'heal');
    const pool = tdAlive(tdFoe(u)).sort(() => Math.random() - 0.5).slice(0, U.n);
    await tdWait(260);
    pool.forEach(t => { t.buf.atk = { v: -U.atkDown, t: U.turns }; tdHitFx(t); tdPop(t, 'Công −' + Math.round(U.atkDown * 100) + '%', 'st'); });
  } else if (U.kind === 'curse') {
    // Hoán Hồn Khúc (Diệp Nhị Nương): nổ tà thuật lên cả đội hình địch, ru ngủ ngẫu nhiên N kẻ (mất lượt như choáng),
    // cả đội mình tăng khí huyết tối đa theo % (máu hiện tại tăng theo) trong vài hiệp
    const foes = tdAlive(tdFoe(u)), sleepers = foes.slice().sort(() => Math.random() - 0.5).slice(0, U.n);
    await tdCurseFx(u, foes, () => {
      foes.forEach(t => tdHitFx(t));
      sleepers.forEach(t => { t.sleep = Math.max(t.sleep || 0, U.turns); tdPop(t, 'Ru ngủ', 'st'); });
      tdAlive(u.side).forEach(m => {
        if (m.buf.hp2) { m.maxHp -= m.buf.hp2.add; m.hp = Math.min(m.hp, m.maxHp); }
        const add = Math.round(m.maxHp * U.teamHp);
        m.maxHp += add; m.hp += add; m.buf.hp2 = { v: U.teamHp, t: U.turns, add };
        tdPop(m, 'HP tối đa +' + Math.round(U.teamHp * 100) + '%', 'heal');
      });
      tdSync();
    });
  } else if (U.kind === 'speed') {
    // Lăng Ba Vi Bộ (Đoàn Dự): lướt bước qua lại để lại bóng mờ, sóng nước dậy dưới chân đồng đội, cả đội +Tốc vài hiệp
    // (Tốc chưa có tác dụng trong trận đội: người dùng sẽ quyết sau)
    const A = u.anim && u.anim.bo;
    if (A) { tdAnimPlay(u, 'bo'); tdGhosts(u, 'bo'); await tdWait(A.wave / A.n * A.ms); } else await tdWait(300);
    const k = tdS && tdS.fast ? 0.5 : 1;
    tdAlive(u.side).forEach((m, j) => setTimeout(() => { if (tdS) tdGroundFx(m, TD_LANGBA); }, j * 90 * k));
    await tdWait(150);
    tdAlive(u.side).forEach(m => { m.buf.spd = { v: U.spd, t: U.turns }; tdPop(m, 'Tốc +' + Math.round(U.spd * 100) + '%', 'st'); });
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
  if (!tdAlive('dich').length) { await tdCollect('ta'); return tdNextWave(); }
  if (!tdAlive('ta').length) return tdEnd(false);
  if (tdAlive('ta').every(u => u.acted)) { await tdCollect('ta'); return tdPhaseDich(); }
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
    if (e.sleep > 0) { e.sleep--; tdPop(e, 'Đang ngủ', 'st'); tdSync(); await tdWait(350); continue; }   // ru ngủ: mất lượt
    if (e.no >= TD.noMax) { e.no = 0; await tdUltDo(e); } else await tdNormal(e);
    if (!tdAlive('ta').length) return tdEnd(false);
  }
  await tdCollect('dich');
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
  s.ta.concat(s.dich).forEach(u => Object.keys(u.buf).forEach(k => {
    if (--u.buf[k].t > 0) return;
    if (u.buf[k].add) { u.maxHp -= u.buf[k].add; u.hp = Math.min(u.hp, u.maxHp); }  // hết tăng khí huyết tối đa (hp, hp2)
    delete u.buf[k];
  }));
  s.round++;
  if (!tdAlive('dich').length) { await tdCollect('ta'); return tdNextWave(); }
  tdPhaseTa();
}
async function tdNextWave() {
  const s = tdS;
  if (s.wave + 1 >= TD.waves) return tdEnd(true);
  await tdWait(500);
  tdClearGround();
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
  s.over = win ? 'win' : 'lose'; s.phase = 'end'; s.auto = false; tdClearGround();
  const stars = win ? Math.max(0, 3 - s.deaths) : 0;
  s.stars = stars;
  if (win) { P.gold += s.loot.bac; P.luongThuc = (P.luongThuc || 0) + s.loot.luong; if (s.loot.manh && typeof addItem === 'function') addItem('manh_vo_so', s.loot.manh); }
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
  .td-u img { transform-origin: 50% 100%; animation: tdBreath 2.6s ease-in-out infinite; }
  @keyframes tdBreath { 0%, 100% { scale: 1 1; } 50% { scale: 1.012 1.028; } }
  .td-u.stun img, .td-u.dead img { animation: none; }
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
  /* hình động + hiệu ứng Blender: dải khung trượt trong khung cắt */
  .td-sheet { position: absolute; overflow: hidden; pointer-events: none; }
  .td-sheet > img.td-strip, .td-u .td-sheet > img.td-strip { position: absolute; left: 0; top: 0; bottom: auto; height: 100%; width: auto; max-width: none; object-fit: fill; transform: none; animation: none; filter: none; scale: none; }
  .td-u > img { z-index: 1; }
  .td-u.has-anim > img { visibility: hidden; animation: none; }
  .td-u .td-sheet.body { z-index: 1; }
  .td-u.hit .td-sheet.body { animation: tdHitB .32s; }
  .td-u.stun .td-sheet.body { filter: grayscale(.6) brightness(.8); }
  @keyframes tdHitB { 30% { filter: brightness(2) sepia(1) hue-rotate(-30deg) saturate(4); translate: -1.2cqw 0; } }
  .td-u .td-sheet.ghost { z-index: 0; filter: brightness(1.35) saturate(.5) hue-rotate(160deg); }
  .td-u .td-sheet.shield { z-index: 0; animation: tdShIn .45s ease-out; transition: opacity .35s; }
  .td-u .td-sheet.shield.front { z-index: 2; opacity: .85; }
  .td-u .td-sheet.shield.out { opacity: 0; }
  @keyframes tdShIn { from { scale: .3; opacity: 0; } }
  .td-hb { z-index: 3; }
  .td-u.ta .td-hb { display: none; }
  /* ru ngủ: chữ Zzz bay lên trên đầu */
  .td-zzz { position: absolute; left: 62%; z-index: 4; display: none; pointer-events: none; font: italic 900 4.6cqw/1 Georgia, serif; color: #d9e6ff; text-shadow: 0 0 .5cqw #2a3a8a, 0 .2cqw 0 #1a1a3a; white-space: nowrap; }
  .td-u.sleep .td-zzz { display: block; }
  .td-zzz b { display: inline-block; animation: tdZzz 1.8s ease-in-out infinite; opacity: 0; }
  .td-zzz b:nth-child(2) { font-size: .8em; animation-delay: .6s; }
  .td-zzz b:nth-child(3) { font-size: .62em; animation-delay: 1.2s; }
  @keyframes tdZzz { 0% { opacity: 0; transform: translate(0, .8cqw); } 25% { opacity: 1; } 80% { opacity: .9; } 100% { opacity: 0; transform: translate(1.6cqw, -3.6cqw); } }
  .td-u.sleep > img, .td-u.sleep .td-sheet.body { filter: brightness(.82) saturate(.8); }   /* phe mình không hiện thanh máu trên đầu (che mặt; máu đã có ở thẻ dưới) */
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
  .td-orbf { position: absolute; width: 3.6cqw; height: 3.6cqw; margin: -1.8cqw 0 0 -1.8cqw; border-radius: 50%; transition: left .35s ease-out, top .35s cubic-bezier(.3,-.6,.7,1); }
  .td-orbf.loot { width: 5.5cqw; height: 5.5cqw; margin: -2.75cqw 0 0 -2.75cqw; border-radius: 0; }
  .td-orbf.loot img { width: 100%; height: 100%; object-fit: contain; filter: drop-shadow(0 .3cqw .4cqw #000a); }
  .td-orbf.loot img[src*="khung_"] { object-fit: cover; object-position: 0 50%; border-radius: 50%; }
  .td-orbf.ground { animation: tdOrbG 1.2s ease-in-out infinite alternate; }
  @keyframes tdOrbG { from { transform: translateY(0); } to { transform: translateY(-.8cqw); } }
  .td-orbf.fly { transition: left .5s cubic-bezier(.3,.1,.4,1), top .5s cubic-bezier(.5,0,.6,1); }
  .td-orbf.blue, .td-orbf.red { width: 4.6cqw; height: 4.6cqw; margin: -2.3cqw 0 0 -2.3cqw; border-radius: 0; }
  .td-orbf.blue svg, .td-orbf.red svg { width: 100%; height: 100%; display: block; overflow: visible; }
  .td-orbf.blue { filter: drop-shadow(0 0 1cqw #4cf) drop-shadow(0 .3cqw .3cqw #0008); }
  .td-orbf.red { filter: drop-shadow(0 0 1cqw #f55) drop-shadow(0 .3cqw .3cqw #0008); }
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
