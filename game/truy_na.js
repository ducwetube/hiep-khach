'use strict';
/* =================================================================
   TRUY NÃ HIỆP KHÁCH (người dùng chốt 2026-11-06, theo ảnh mẫu "Hào Kiệt"):
   - Bảng ở Thanh Vân Môn (ô "Truy Nã" trong thẻ thành, G.truyNa): mỗi ngọn núi quanh Thanh Vân có 1 hào kiệt,
     cấp 5 / 10 / 15 / 20 (Tiểu Trúc, Đại Trúc, Lạc Hà, Thông Thiên). Đủ cấp mới nhận được.
   - Không cần nhận (người dùng chốt 2026-11-07): đủ cấp là tới ngọn núi đó sẽ thấy hào kiệt đứng trên màn hình (renderCanh trong ban_do.js gọi tnSceneHtml); bấm vào để truy bắt.
   - Tùy tùng: mỗi loại quái của ngọn núi đó một con, đánh cùng hào kiệt.
   - Mỗi hào kiệt bắt được TRUY_NA.perDay lần mỗi ngày (ngày thật). Bắt xong mà còn lượt thì hào kiệt vẫn ở đó, hết lượt thì phải đợi hôm sau.
   - Thưởng diệt (người dùng chốt): kinh nghiệm + bạc + Mảnh Nội Công + Mảnh Võ Học (vật phẩm trong data.js, để sau đổi võ học;
     chỗ đổi chưa làm). Số mảnh mỗi loại = h.manh.
   Tên theo ảnh mẫu người dùng; tội trạng, chiêu riêng do Claude đặt (chờ duyệt bản thiết kế nhân vật).
   Hình: ảnh Gemini của người dùng (game/img/quai/{su_tuyen, y_dang, cau_tam_gia, anh_dao}.png, khai báo ở ENEMY_IMG trong chibi_quai.js).
   P.tn = { day, used: { mã: số lần đã bắt hôm nay }, on: { mã: true } }
   ================================================================= */
const TRUY_NA = {
  perDay: 5,
  hp: 1.5, atk: 1.15,      // so với Tinh Anh cùng cấp (TG.boss)
  exp: 50, gold: 50,       // × kinh nghiệm / bạc của một quái thường cùng cấp (TG.mob); người dùng chốt 2026-11-10 (trước 20 / 15)
  items: ['manh_noi_so', 'manh_vo_so'], // mỗi lần bắt được: h.manh mảnh mỗi loại (người dùng chốt: để sau đổi võ học)
  /* Thiết kế nhân vật (người dùng duyệt 2026-11-06): mỗi hào kiệt một đặc điểm riêng.
     tag = đặc điểm hiện trên bảng; add = chỉ số cộng thêm; mul = nhân chỉ số; heal = chiêu hồi máu (dưới below% máu, uses lần);
     say = câu gặp mặt (hiện khi vào trận). */
  list: [
    { id: 'da_hanh', hieu: 'Hắc y đạo tặc', name: 'Sử Tuyền', lv: 5, map: 'rung_truc', art: 'su_tuyen', manh: 1,
      toi: 'Đêm đêm trèo tường trộm của nhà giàu dưới chân núi, ai bắt gặp đều bị một đao cắt cổ. Hắn trốn trong rừng trúc vì thuộc từng lối mòn.',
      tag: 'Nhanh, khó đánh trúng: tốc độ cao, né +15%', add: { dodge: 15 }, mul: { spd: 1.3 },
      say: 'Trúc này rậm thế, ngươi tìm được ta cũng giỏi đấy.',
      move: { name: 'Dạ Ảnh Tam Đao', power: 0.8, hits: 3 } },
    { id: 'lang_khach', hieu: 'Lãng nhân Đông Doanh', name: 'Y Đằng Hùng Nhị', lv: 10, map: 'phe_trach', art: 'y_dang', manh: 1,
      toi: 'Lưu lạc từ Đông Doanh sang Trung Nguyên tìm đối thủ. Thách đấu rồi chém chết ba võ sư trong trấn, chiếm luôn võ quán làm chỗ ở.',
      tag: 'Một đao định thắng thua: bạo kích +20%', add: { crit: 20 },
      say: 'Võ công Trung Nguyên… cho ta xem ngươi đáng mấy đao.',
      move: { name: 'Nhất Đao Trảm', power: 2.5, effect: { type: 'bleed', chance: 60, turns: 3, value: 0.4 } } },
    { id: 'cong_tu', hieu: 'Ác bá Lạc Hà', name: 'Cầu Tam Gia', lv: 15, map: 'hac_phong', art: 'cau_tam_gia', manh: 2,
      toi: 'Con thứ ba nhà họ Cầu giàu nhất vùng. Cấu kết với sơn tặc Lạc Hà cướp hàng của thương đoàn rồi đổ tội cho người vô can; quan phủ nhận tiền nên làm ngơ.',
      tag: 'Lì đòn: thủ cao, dưới 40% máu uống thuốc quý hồi máu một lần', mul: { def: 1.3 },
      heal: { name: 'Thiên Kim Linh Đan', value: 30, below: 40, uses: 1 },
      say: 'Bao nhiêu bạc thì Thanh Vân Môn chịu buông tha cho Cầu mỗ?',
      move: { name: 'Thiết Phiến Phong Hầu', power: 2.2, effect: { type: 'stun', chance: 25, turns: 1 } } },
    { id: 'tu_dao', hieu: 'Sát thủ Thất Sát Môn', name: 'Ảnh Đao', lv: 20, map: 'linh_xa_dao', art: 'anh_dao', manh: 2,
      toi: 'Không ai biết tên thật. Nhận lệnh Thất Sát Môn mai phục trên đường xuống núi, giết đệ tử Thanh Vân.',
      tag: 'Hút máu: mỗi đòn hồi lại 15% sát thương gây ra', add: { lifesteal: 15 },
      say: 'Thất Sát Môn muốn mạng ai, người đó không qua được đêm nay.',
      move: { name: 'Ảnh Đao Đoạt Mệnh', power: 2.4, effect: { type: 'bleed', chance: 50, turns: 3, value: 0.5 } } },
  ],
};
const tnById = id => TRUY_NA.list.find(h => h.id === id);
const tnDay = () => { const d = new Date(); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; };
function tnState() {
  if (!P.tn) P.tn = { day: tnDay(), used: {}, on: {} };
  if (P.tn.day !== tnDay()) Object.assign(P.tn, { day: tnDay(), used: {} }); // qua ngày: lượt về đầy, hào kiệt đã nhận vẫn còn
  return P.tn;
}
const tnLeft = h => TRUY_NA.perDay - (tnState().used[h.id] || 0);
// Người dùng chốt 2026-11-07: không cần nhận ở Thanh Vân, đủ cấp là hào kiệt có mặt ở ngọn núi của hắn
const tnOn = h => !!P && P.lv >= h.lv;
// Hào kiệt đang truy nã ở nơi này (còn lượt), không có thì null
const tnAt = loc => (P ? TRUY_NA.list.find(h => h.map === loc && tnOn(h) && tnLeft(h) > 0) : null) || null;
const tnBig = h => (typeof h.art === 'object'
  ? playerAvatar(h.art.sect, h.art.title, 'body', 'normal').replace('<svg class="avatar body"', '<svg class="avatar body" style="transform:scaleX(-1)"')
  // Ảnh Gemini: hiện thẳng ảnh, thu vừa khung (hình trong trận phóng 1,25 nên tràn khung bảng)
  : typeof ENEMY_IMG === 'object' && ENEMY_IMG[h.art] ? `<img class="tn-img" src="game/img/quai/${h.art}.png" alt="${h.name}">`
  : typeof enemyArtSvg === 'function' ? enemyArtSvg(h.art, 'normal') : '');
const tnFace = h => (typeof h.art === 'object' ? playerAvatar(h.art.sect, h.art.title, 'head') : `[[${h.art}]]`);
const tnExp = h => Math.round(TG.mob.exp(h.lv) * TRUY_NA.exp);
const tnGold = h => Math.round(TG.mob.gold(h.lv) * TRUY_NA.gold);
const tnFollowers = h => MAPS[h.map].enemies.map(e => ENEMIES[e].name);

/* ---------------------------- Bảng truy nã ---------------------------- */
let tnSel = null;
// one = true: chỉ hiện một hào kiệt (bấm avatar trên núi), có nút Khiêu chiến
function truyNa(id, one) {
  tnState();
  tnStyle();
  if (id) tnSel = id;
  if (!tnById(tnSel)) tnSel = (TRUY_NA.list.find(h => tnOn(h)) || TRUY_NA.list.slice().reverse().find(h => P.lv >= h.lv) || TRUY_NA.list[0]).id;
  const h = tnById(tnSel), left = tnLeft(h), M = LOCATIONS[h.map];
  const faces = TRUY_NA.list.map(x => `<button class="tn-face${x.id === tnSel ? ' sel' : ''}${P.lv < x.lv ? ' locked' : ''}" onclick="G.truyNa('${x.id}')" aria-label="${x.name}">
      <span class="tn-ring">${tnFace(x)}</span>${tnOn(x) && tnLeft(x) > 0 ? '<i class="tn-mk">[[muc_tieu]]</i>' : ''}<small>Cấp ${x.lv}</small></button>`).join('');
  const rw = [`<span class="tn-rw">[[kinh_nghiem]]<em>Kinh nghiệm</em></span>`, `<span class="tn-rw">[[bac]]<em>${tnGold(h)} lượng</em></span>`,
    ...TRUY_NA.items.map(id => `<span class="tn-rw">[[${ITEMS[id].icon}]]<em>${ITEMS[id].name} x${h.manh}</em></span>`)].join('');
  let btn;
  if (P.lv < h.lv) btn = `<button class="btn" disabled>Cần đạt cấp ${h.lv}</button>`;
  else if (left <= 0) btn = `<button class="btn" disabled>Hết lượt hôm nay</button>`;
  else if (one && P.loc === h.map) btn = `<button class="btn primary" onclick="G.tnFight('${h.id}')">Khiêu chiến</button>`;
  else btn = `<button class="btn primary" onclick="G.tnGo('${h.id}')">Đi tới ${M.name}</button>`;
  openModal(`<h3 class="tn-title">Truy Nã Hiệp Khách</h3>
    ${one ? '' : `<div class="tn-faces">${faces}</div>`}
    <div class="tn-main">
      <div class="tn-fig">${tnBig(h)}</div>
      <div class="tn-info">
        <div class="tn-name"><small>${h.hieu}</small><b>${h.name}</b></div>
        <p class="tn-toi">${h.toi}</p>
        ${h.tag ? `<p class="tn-tag">[[muc_tieu]] ${h.tag}</p>` : ''}
        <dl class="tn-dl">
          <dt>Cấp mở</dt><dd>${h.lv}</dd>
          <dt>Bản đồ</dt><dd>${M.name}</dd>
          <dt>Số lần còn</dt><dd>${Math.max(0, left)} / ${TRUY_NA.perDay}</dd>
          <dt>Tùy tùng</dt><dd class="red">Mọi quái ở ${M.name} (${tnFollowers(h).join(', ')})</dd>
          <dt>Nhận EXP</dt><dd class="red">${tnExp(h).toLocaleString('vi-VN')}</dd>
        </dl>
      </div>
    </div>
    <div class="tn-lb">Thưởng diệt</div>
    <div class="tn-rws">${rw}</div>
    <div class="row-btns">${btn}</div>`);
}
function tnGo(id) {
  const h = tnById(id);
  if (!h) return;
  closeModalSilent();
  if (typeof banDoGo === 'function') banDoGo(h.map); else travel(h.map);
}

/* ---------------------------- Trận truy bắt ---------------------------- */
function tnEnemy(h) {
  const m = tgMapOf(h.map);
  const fake = { id: 'truy_na', city: m.city, mobs: [], boss: { name: h.name, art: h.art, move: h.move } };
  const E = tgMake(fake, -1, h.lv, true);
  E.id = 'tn_' + h.id;
  E.name = `${h.name}`;
  E.tg = null; // không tính là Tinh Anh của map (không cộng thành thạo "Hạ Tinh Anh")
  E.hp = Math.round(E.hp * TRUY_NA.hp);
  E.atk = Math.round(E.atk * TRUY_NA.atk);
  E.def = Math.round(E.def * TRUY_NA.atk);
  // Đặc điểm riêng: cộng / nhân chỉ số
  for (const k in h.add || {}) E[k] = (E[k] || 0) + h.add[k];
  for (const k in h.mul || {}) E[k] = Math.round(E[k] * h.mul[k]);
  E.skills = tgArm(E);
  E.skills.unshift(Object.assign({ type: 'attack', chance: 30, mp: 0 }, h.move));
  if (h.heal) E.skills.unshift(Object.assign({ type: 'heal', mp: 0 }, h.heal));
  E.intro = `<b>${h.name}</b>: "${h.say}"`;
  return E;
}
function tnFight(id) {
  const h = tnById(id);
  if (!h || P.loc !== h.map || !tnOn(h) || tnLeft(h) <= 0 || (combat && !combat.over)) return;
  closeModalSilent();
  const m = tgMapOf(h.map), lv = MAPS[h.map];
  const list = [tnEnemy(h), ...m.mobs.map((x, j) => tgMob(h.map, j, lv.lvMin + Math.floor(Math.random() * 5)))];
  startCombat(list);
}
// Engine gọi trong onKill (khi thắng trận): hạ hào kiệt thì nhận thưởng diệt
function tnOnKill(key) {
  const h = typeof key === 'string' && key.startsWith('tn_') && tnById(key.slice(3));
  if (!h) return [];
  const t = tnState();
  t.used[h.id] = (t.used[h.id] || 0) + 1;
  const left = tnLeft(h);
  const out = [`[[muc_tieu]] Truy bắt được <b>${h.name}</b>! (còn ${left} / ${TRUY_NA.perDay} lần hôm nay)`];
  const gold = tnGold(h), exp = withBonus(tnExp(h));
  P.gold += gold;
  out.push(`[[bac]] Tiền thưởng +${gold} lượng`);
  // Mảnh nội công + mảnh võ học (để đổi võ học sau này)
  TRUY_NA.items.forEach(id => {
    addItem(id, h.manh);
    out.push(`[[nhat_duoc]] Nhặt được [[${ITEMS[id].icon}]] <b>${ITEMS[id].name}</b> x${h.manh} · có ${invCount(id)}`);
  });
  // Nhân Sâm nâng Kinh mạch (KINH_MACH.truyNa, người dùng chốt 2026-11-10)
  if (typeof KINH_MACH !== 'undefined') { addItem('nhan_sam', KINH_MACH.truyNa); out.push(`[[nhan_sam]] Nhận <b>Nhân Sâm ×${KINH_MACH.truyNa}</b>`); }
  out.push(`[[kinh_nghiem]] Thưởng truy nã +${exp} kinh nghiệm`, ...gainExp(exp));
  snd('jingle', 'quest');
  return out;
}

/* ---------------------------- Chỗ khác gọi ---------------------------- */
// Hào kiệt đứng trên màn ngọn núi (renderCanh)
function tnSceneHtml(loc) {
  const h = tnAt(loc);
  if (!h) return '';
  tnStyle();
  // Người dùng chốt: chỉ một avatar tròn nhỏ (không hiện cả người), nằm góc phải dưới hàng nút trên cùng
  return `<button class="tn-boss" onclick="G.truyNa('${h.id}', true)" aria-label="Truy nã ${h.name}">
    <span class="tn-boss-ring">${tnFace(h)}</span>
    <span class="tn-boss-tag"><em>Truy nã · cấp ${h.lv}</em><b>${h.name}</b><small>còn ${tnLeft(h)}/${TRUY_NA.perDay}</small></span></button>`;
}
// Dòng trong thẻ ngọn núi (bản đồ vùng)
function tnHereLine(loc) {
  const h = tnAt(loc);
  return h ? `<div class="vg-quest">[[muc_tieu]] Truy nã: ${h.name} đang ẩn náu ở đây</div>` : '';
}
// Dấu mục tiêu trên huy hiệu ngọn núi
const tnGoal = loc => !!tnAt(loc);
// Dòng trong menu Nhiệm vụ
function tnQuestRows() {
  if (!P) return '';
  return TRUY_NA.list.filter(h => tnOn(h) && tnLeft(h) > 0).map(h => `<div class="quest">
      <div class="q-name">[[muc_tieu]] Truy nã · ${h.name}</div>
      <div class="q-sum">Đang ẩn náu ở ${LOCATIONS[h.map].name}.</div>
      <div class="q-prog">Còn ${tnLeft(h)} / ${TRUY_NA.perDay} lần hôm nay</div>
    </div>`).join('');
}
// Phụ đề ô Truy Nã ở thẻ Thanh Vân
const tnSub = () => { const n = P ? TRUY_NA.list.filter(h => tnOn(h) && tnLeft(h) > 0).length : 0; return n ? `Còn ${n} hào kiệt` : 'Bắt hào kiệt, nhận mảnh võ'; };

function tnStyle() {
  if (document.getElementById('tn-style')) return;
  const st = document.createElement('style');
  st.id = 'tn-style';
  st.textContent = `
    .tn-faces { display: flex; gap: 10px; overflow-x: auto; padding: 8px 6px 10px; margin: 0 -4px 10px; border-radius: 10px;
      background: rgba(201,162,92,.12); border: 1px solid rgba(201,162,92,.3); scrollbar-width: thin; }
    .tn-face { position: relative; flex: none; display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 0; border: 0; background: none; cursor: pointer; font: inherit; color: var(--ink); }
    .tn-ring { width: 64px; height: 64px; border-radius: 50%; overflow: hidden; display: grid; place-items: center; font-size: 52px;
      background: radial-gradient(circle at 40% 35%, #5b4a36, #2a2017); border: 3px solid #a07a3e; box-shadow: 0 0 0 1px #3a2a18; }
    .tn-ring svg { width: 100%; height: 100%; }
    .tn-face.sel .tn-ring { border-color: #ffcf5a; box-shadow: 0 0 0 2px #ffe9a8, 0 0 16px rgba(255,190,70,.85); }
    .tn-face.locked .tn-ring { filter: grayscale(.9) brightness(.65); }
    .tn-face small { font-size: 11px; color: var(--muted); }
    .tn-mk { position: absolute; right: -4px; top: -4px; font-size: 13px; width: 22px; height: 22px; display: grid; place-items: center; border-radius: 50%; background: #b3362b; border: 2px solid #fff3d0; }
    .tn-main { display: grid; grid-template-columns: 38% 1fr; gap: 12px; align-items: start; }
    .tn-fig { aspect-ratio: 3 / 4; border-radius: 8px; display: grid; place-items: end center; overflow: hidden;
      background: radial-gradient(ellipse at 50% 85%, rgba(201,162,92,.28), transparent 60%), rgba(255,255,255,.04); border: 1px solid rgba(201,162,92,.3); }
    .tn-fig svg { width: 100%; height: 100%; }
    .tn-fig .tn-img { width: 88%; height: 88%; margin-bottom: 6%; object-fit: contain; object-position: center bottom; }
    .tn-name small { display: block; font-size: 12px; color: #e8c27a; letter-spacing: 1px; }
    .tn-name b { font-family: 'Pattaya', serif; font-weight: normal; font-size: 24px; line-height: 1.15; color: #fff4dc; }
    .tn-toi { margin: 4px 0 8px; font-size: 13px; line-height: 1.45; color: var(--muted); font-style: italic; }
    .tn-tag { margin: 0 0 8px; padding: 5px 8px; border-radius: 6px; font-size: 12.5px; line-height: 1.4; color: #ffd8a8;
      background: rgba(179,54,43,.18); border: 1px solid rgba(201,71,58,.45); }
    .tn-dl { display: grid; grid-template-columns: auto 1fr; gap: 3px 10px; margin: 0; font-size: 13.5px; }
    .tn-dl dt { color: var(--muted); white-space: nowrap; }
    .tn-dl dd { margin: 0; color: var(--ink); }
    .tn-dl dd.red { color: #ff9a8a; }
    .tn-lb { margin: 12px 0 6px; font-size: 13px; color: var(--muted); }
    .tn-rws { display: flex; flex-wrap: wrap; gap: 8px; }
    .tn-rw { display: flex; flex-direction: column; align-items: center; gap: 3px; width: 70px; padding: 6px 2px; border-radius: 8px; font-size: 30px;
      background: rgba(255,255,255,.05); border: 1px solid rgba(201,162,92,.35); }
    .tn-rw.rare { border-color: #e9c35a; box-shadow: 0 0 10px rgba(233,195,90,.35); }
    .tn-rw svg { width: 34px; height: 34px; }
    .tn-rw em { font-style: normal; font-size: 10.5px; line-height: 1.2; text-align: center; color: var(--muted); }
    .tn-note { margin: 10px 0 0; font-size: 12.5px; }
    @media (max-width: 380px) { .tn-main { grid-template-columns: 34% 1fr; gap: 8px; } .tn-dl { font-size: 12.5px; } }
    .tn-boss { position: absolute; z-index: 2; right: 12px; top: 76px; display: flex; flex-direction: column; align-items: center; gap: 0;
      padding: 0; border: 0; background: none; cursor: pointer; font: inherit; }
    .tn-boss-ring { position: relative; width: 76px; height: 76px; border-radius: 50%; overflow: hidden; display: grid; place-items: center; font-size: 66px;
      background: radial-gradient(circle at 40% 35%, #5b4a36, #2a2017); border: 3px solid #e0533f;
      box-shadow: 0 0 0 2px rgba(30,12,10,.8), 0 0 14px rgba(255,80,60,.8); animation: tnPulse 1.8s ease-in-out infinite; }
    .tn-boss-ring svg { width: 100%; height: 100%; }
    .tn-boss-tag { position: relative; z-index: 1; display: flex; flex-direction: column; align-items: center; margin-top: -8px; padding: 2px 8px 3px; border-radius: 6px; white-space: nowrap;
      background: rgba(30,12,10,.9); border: 1px solid #c9473a; color: #f3efe2; line-height: 1.15; }
    .tn-boss-tag em { font-style: normal; font-size: 9.5px; letter-spacing: .5px; color: #ff9a8a; }
    .tn-boss-tag b { font-size: 12.5px; color: #fff4dc; }
    .tn-boss-tag small { font-size: 9.5px; color: #e8c27a; }
    .tn-boss:hover .tn-boss-ring { box-shadow: 0 0 0 2px rgba(30,12,10,.8), 0 0 22px rgba(255,120,90,1); }
    @keyframes tnPulse { 50% { box-shadow: 0 0 0 2px rgba(30,12,10,.8), 0 0 4px rgba(255,80,60,.4); } }
    @media (prefers-reduced-motion: reduce) { .tn-boss-ring { animation: none; } }`;
  document.head.appendChild(st);
}

const TRUY_NA_G = { truyNa, tnGo, tnFight };
