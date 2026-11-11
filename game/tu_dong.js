'use strict';
/* =================================================================
   HIỆP KHÁCH GIANG HỒ — TỰ ĐỘNG LUYỆN CÔNG (auto farm)
   Ở vùng nguy hiểm, bấm "Tự động luyện công": nhân vật tự thám hiểm liên tục, gặp quái thì
   tự đánh (chọn chiêu mạnh nhất đủ nội lực, máu thấp thì dùng công pháp hồi máu hoặc uống thuốc).
   Tự dừng khi: đủ số trận đã chọn, máu xuống dưới ngưỡng giữa hai trận, thua trận, gặp chuyện
   cần người chơi quyết (kỳ ngộ, lựa chọn, đoạn truyện), hoặc rời khỏi vùng nguy hiểm.
   Thanh "Đang tự động" nổi ở đáy màn hình có nút Dừng.
   Cài đặt (số trận, ngưỡng máu, dùng thuốc, tắt hiệu ứng) nhớ trong trình duyệt.
   File này nạp TRƯỚC engine.js; engine gọi autoButton() trong renderWorld và autoCombat() cuối renderCombat.
   ================================================================= */

const AUTO_KEY = 'giang_ho_hanh_auto';
const AUTO_OPTS = {
  max: [[20, '20 trận'], [50, '50 trận'], [100, '100 trận'], [0, 'Không giới hạn']],
  stopHp: [[30, 'Dưới 30%'], [50, 'Dưới 50%'], [70, 'Dưới 70%']],
};
// rest: yếu sức thì về thành gần nhất nghỉ rồi đi tiếp
// sm: tự làm nhiệm vụ sư môn hằng ngày (mon_phai.js, chỉ đệ tử ngoại môn)
const AUTO_DEF = { max: 50, stopHp: 30, pots: true, noFx: true, rest: true, sm: false };
const AUTO_LOSE_MAX = 3; // thua liền chừng này trận thì dừng hẳn (tránh chết mãi ở chỗ quá sức)
const AUTO_DELAY = { act: 350, next: 700 }; // nghỉ giữa các lượt / giữa các lần thám hiểm (mili giây)
let AUTO = null; // lượt tự động đang chạy

function autoCfg() {
  try { return Object.assign({}, AUTO_DEF, JSON.parse(localStorage.getItem(AUTO_KEY) || '{}')); } catch (e) { return Object.assign({}, AUTO_DEF); }
}
function autoSave(c) { try { localStorage.setItem(AUTO_KEY, JSON.stringify(c)); } catch (e) { /* chỉ nhớ trong lần chơi này */ } }
const autoSmOk = () => typeof smOpen === 'function' && smOpen();
const autoSm = c => !!c.sm && autoSmOk();

/* ---------------------------- Nút và hộp cài đặt ---------------------------- */
const autoWild = () => !!P && LOCATIONS[P.loc] && locView(P.loc).type === 'wild';
// Ở vùng hoang thì luyện ngay tại chỗ; ở thành thì chỉ làm nhiệm vụ phái
const autoHere = () => autoWild() || (!!P && LOCATIONS[P.loc] && locView(P.loc).type === 'town' && autoSmOk());
function autoButton() {
  if (!autoHere() || (AUTO && AUTO.on)) return '';
  return `<button class="btn act" onclick="G.autoMenu()">[[tu_dong]] Tự động luyện công<small>${autoWild() ? 'Tự thám hiểm, tự đánh' : 'Tự làm nhiệm vụ sư môn'}</small></button>`;
}
function autoMenu() {
  const c = autoCfg();
  const row = (k, list) => list.map(([v, t]) => `<button class="btn small ${c[k] === v ? 'primary' : ''}" onclick="G.autoSet('${k}', ${v})">${t}</button>`).join('');
  const tog = (k, on, off) => `<button class="btn small ${c[k] ? 'primary' : ''}" onclick="G.autoSet('${k}', ${!c[k]})">${c[k] ? on : off}</button>`;
  const smRow = autoSmOk() ? `<h4>Nhiệm vụ sư môn</h4><div class="row-btns left">${tog('sm', 'Tự làm nhiệm vụ sư môn: Có', 'Tự làm nhiệm vụ sư môn: Không')}</div>` : '';
  const where = autoSm(c) ? 'làm nhiệm vụ sư môn' : `thám hiểm ${LOCATIONS[P.loc].name}`;
  openModal(`<h3>[[tu_dong]] Tự động luyện công</h3>
    <p class="muted">Nhân vật tự ${where}, gặp quái thì tự đánh: dùng võ công mạnh nhất đủ nội lực, máu thấp thì dùng công pháp hồi máu${c.pots && !POTION_OFF ? ' hoặc uống thuốc' : ''}.
      ${c.rest ? `Thua trận thì về thành nghỉ rồi đi tiếp, thua liền ${AUTO_LOSE_MAX} trận mới dừng.` : 'Tự dừng khi thua trận.'} Bấm <b>Dừng</b> ở thanh dưới màn hình để dừng lúc nào cũng được.</p>
    ${smRow}
    <h4>Số trận</h4><div class="row-btns left">${row('max', AUTO_OPTS.max)}</div>
    <h4>Khi khí huyết hoặc nội lực giữa hai trận</h4><div class="row-btns left">${row('stopHp', AUTO_OPTS.stopHp)}</div>
    <div class="row-btns left">${tog('rest', 'Về thành gần nhất nghỉ rồi đi tiếp', 'Dừng tự động')}</div>
    <h4>Khác</h4><div class="row-btns left">${POTION_OFF ? '' : tog('pots', 'Tự uống thuốc: Có', 'Tự uống thuốc: Không')}${tog('noFx', 'Tắt hiệu ứng cho nhanh: Có', 'Tắt hiệu ứng cho nhanh: Không')}</div>
    <div class="row-btns"><button class="btn primary big" onclick="G.autoStart()">[[tu_dong]] Bắt đầu</button></div>`);
}
function autoSet(k, v) {
  const c = autoCfg();
  c[k] = v;
  autoSave(c);
  reopen(autoMenu);
}

/* ---------------------------- Chạy và dừng ---------------------------- */
function autoStart() {
  if (!autoHere() || (combat && !combat.over)) return;
  const c = autoCfg();
  if (!autoWild() && !autoSm(c)) return toast('Ở trong thành thì hãy bật nhiệm vụ sư môn, hoặc ra vùng hoang để luyện công.');
  closeModalSilent();
  AUTO = { on: true, cfg: c, sm: autoSm(c), smDone: 0, home: P.loc, at: P.loc, n: 0, wins: 0, rests: 0, task: '', exp: autoExpTotal(), gold: P.gold, lv: P.lv, fx: null };
  if (c.noFx && typeof FX !== 'undefined') { AUTO.fx = fxSpeed(); FX.setSpeed('off'); }
  log(`[[tu_dong]] Bắt đầu tự động luyện công${AUTO.sm ? ': nhiệm vụ sư môn' : ` ở <b>${LOCATIONS[P.loc].name}</b>`}.`);
  autoBar();
  autoNext();
}
// Tự động leo Thí Luyện Tháp (nút trong màn tháp, thap.js): đánh liên tục từng tầng, thua hoặc đủ số trận thì dừng
function autoThap() {
  if (typeof thapOpen !== 'function' || !thapOpen() || (combat && !combat.over)) return;
  const c = autoCfg();
  AUTO = { on: true, thap: true, cfg: c, home: P.loc, at: P.loc, n: 0, wins: 0, rests: 0, task: 'leo tháp', exp: autoExpTotal(), gold: P.gold, lv: P.lv, fx: null, floor0: P.thap.best };
  if (c.noFx && typeof FX !== 'undefined') { AUTO.fx = fxSpeed(); FX.setSpeed('off'); }
  log(`[[tu_dong]] Bắt đầu tự động leo Trấn Ma Tháp${c.pots && !POTION_OFF ? ', tự uống thuốc' : ''}.`);
  autoBar();
  autoNext();
}
// Đi thẳng tới nơi cần đến theo đường ngắn nhất (đi đường không tốn gì, không gặp quái)
function autoGo(id) {
  if (P.loc === id) return true;
  const r = typeof banDoRoute === 'function' ? banDoRoute(id) : null;
  if (!r || !canLeave()) return false;
  r.slice(1, -1).forEach(k => { const L = locView(k); if (L.type === 'town' && L.inn != null) P.lastTown = k; });
  travel(id);
  AUTO.at = P.loc;
  return P.loc === id;
}
// Thành gần nhất có nhà trọ (tìm theo số chặng đường)
function autoInn() {
  const seen = { [P.loc]: 1 }, queue = [P.loc];
  while (queue.length) {
    const cur = queue.shift(), L = locView(cur);
    if (L.type === 'town' && L.inn != null) return cur;
    for (const nx of LOCATIONS[cur].links) if (!seen[nx] && LOCATIONS[nx] && canEnter(nx)) { seen[nx] = 1; queue.push(nx); }
  }
  return null;
}
// Nhiệm vụ sư môn: về Thanh Vân nộp vòng đã xong, nhận vòng mới; trả về map cần tới (hoặc lý do dừng)
function autoSuMon(A) {
  const st = smState(), town = 'duong_chau';
  if ((st.q && st.q.n >= st.q.need) || (!st.q && st.done < SU_MON.perDay)) {
    if (P.loc !== town) { A.task = st.q ? 'về bẩm báo sư phụ' : 'về nhận nhiệm vụ sư môn'; return autoGo(town) ? { wait: 1 } : { stop: `không tìm được đường về ${LOCATIONS[town].name}` }; }
    if (st.q && smTurnIn(true)) A.smDone++;
    if (!st.q && st.done < SU_MON.perDay) smTake(true);
  }
  if (!st.q) return { stop: st.done >= SU_MON.perDay ? `xong ${SU_MON.perDay} vòng sư môn hôm nay` : 'chưa nhận được nhiệm vụ sư môn' };
  if (!canEnter(st.q.map)) return { stop: 'nhiệm vụ sư môn ở nơi chưa vào được' };
  A.task = `sư môn ${st.done + 1}/${SU_MON.perDay}: ${ENEMIES[st.q.e].name} ${st.q.n}/${st.q.need}`;
  return { map: st.q.map };
}
// Tổng kinh nghiệm tích được (cộng cả các cấp đã lên) để báo lại khi dừng
function autoExpTotal() { let s = P.exp; for (let l = 1; l < P.lv; l++) s += expNeed(l); return s; }
function autoStop(why) {
  if (!AUTO || !AUTO.on) return;
  const A = AUTO;
  A.on = false;
  if (A.fx && typeof FX !== 'undefined') FX.setSpeed(A.fx);
  const bar = document.getElementById('auto-bar');
  if (bar) bar.remove();
  const gained = [`${A.wins}/${A.n} trận thắng`, `[[kinh_nghiem]] +${autoExpTotal() - A.exp} kinh nghiệm`, `[[bac]] ${P.gold - A.gold >= 0 ? '+' : ''}${P.gold - A.gold} lượng`];
  if (A.smDone) gained.push(`xong ${A.smDone} vòng sư môn`);
  if (A.losses) gained.push(`thua ${A.losses} trận`);
  if (A.rests) gained.push(`về thành nghỉ ${A.rests} lần`);
  if (P.lv > A.lv) gained.push(`lên cấp ${P.lv}`);
  const msg = `[[tu_dong]] Dừng tự động luyện công: ${why}. ${gained.join(' · ')}.`;
  log(msg);
  toast(msg);
  saveGame(true);
  if (P && !combat && el('screen').querySelector('.world')) renderWorld();
  if (P && !combat && A.thap && typeof thapScreen === 'function') thapScreen(); // tháp giờ là bảng nổi trên bản đồ
}
// Thanh nổi ở đáy màn hình: đang tự động, số trận, nút Dừng
function autoBar() {
  let bar = document.getElementById('auto-bar');
  if (!bar) {
    bar = document.createElement('div');
    bar.id = 'auto-bar';
    document.body.appendChild(bar);
  }
  const A = AUTO;
  setHtml(bar, `<span>[[tu_dong]] Đang tự động · trận ${A.n}${A.cfg.max ? '/' + A.cfg.max : ''} · thắng ${A.wins}${A.task ? ' · ' + A.task : ''}</span>
    <button class="btn small" onclick="G.autoStop()">Dừng</button>`);
}
// Giữa hai trận: kiểm tra điều kiện dừng rồi thám hiểm tiếp
function autoNext() {
  const A = AUTO;
  if (!A || !A.on) return;
  setTimeout(() => {
    if (!AUTO || !AUTO.on || AUTO !== A) return;
    if (combat) return; // trận đang diễn ra: autoCombat lo
    if (A.thap) { // leo tháp
      if (!thapOpen() || P.loc !== A.at) return autoStop('đã rời tháp');
      if (A.cfg.max && A.n >= A.cfg.max) return autoStop(`đủ ${A.cfg.max} trận`);
      if (thapTop()) return autoStop('đã lên tới đỉnh tháp');
      A.task = `leo tháp, tầng ${thapNext()}`;
      autoBar();
      return thapFight();
    }
    if (!el('screen').querySelector('.world')) return autoStop('có chuyện cần ngươi xem');
    if (P.loc !== A.at) return autoStop('ngươi đã tự đi nơi khác');
    if (A.cfg.max && !A.sm && A.n >= A.cfg.max) return autoStop(`đủ ${A.cfg.max} trận`); // sư môn: chạy tới hết 15 vòng
    const s = getStats(), thr = A.cfg.stopHp / 100;
    if (A.mustRest || P.hp < s.hp * thr || P.mp < s.mp * thr) {
      const why = A.mustRest ? 'vừa thua trận' : `${P.hp < s.hp * thr ? 'khí huyết' : 'nội lực'} dưới ${A.cfg.stopHp}%`;
      A.mustRest = false;
      if (!A.cfg.rest) return autoStop(`${why}, hãy nghỉ ngơi`);
      const inn = autoInn();
      if (!inn) return autoStop(`${why}, không tìm được nhà trọ`);
      A.task = 'về thành nghỉ ngơi';
      autoBar();
      if (!autoGo(inn)) return autoStop(`${why}, không về được thành`);
      if (P.gold < locView(inn).inn) return autoStop(`${why}, không đủ bạc thuê phòng`);
      rest();
      A.rests++;
      return autoNext();
    }
    // Nơi cần tới: map của nhiệm vụ phái, không thì nơi bắt đầu
    let target = A.home;
    if (A.sm) {
      const r = autoSuMon(A);
      autoBar();
      if (r.stop) return autoStop(r.stop);
      if (r.wait) return autoNext();
      target = r.map;
    }
    if (P.loc !== target) {
      if (!autoGo(target)) return autoStop(`không tới được ${LOCATIONS[target].name}`);
      return autoNext();
    }
    if (!autoWild()) return autoStop('không có nơi để luyện');
    explore();
    if (!combat) autoNext(); // gặp sự kiện (nhặt đồ...) thì thám hiểm tiếp
  }, AUTO_DELAY.next);
}
// Gọi ở cuối renderCombat: tới lượt ngươi thì tự ra chiêu, hết trận thì tự rời trận
function autoCombat() {
  const A = AUTO;
  if (!A || !A.on || !combat || A.pending) return;
  if (combat.over) {
    A.pending = true;
    setTimeout(() => {
      A.pending = false;
      if (!AUTO || !AUTO.on || !combat || !combat.over) return;
      A.n++;
      const r = combat.result;
      if (r === 'win') { A.wins++; A.loseRow = 0; }
      autoBar();
      G.leaveCombat();
      if (r === 'lose' && A.thap) return autoStop(`thất thủ ở tầng ${thapNext()}`);
      if (r === 'lose') {
        // Thua thì bị đưa về thành: nghỉ cho lại sức rồi đi tiếp; thua liền AUTO_LOSE_MAX trận thì dừng hẳn
        A.losses = (A.losses || 0) + 1;
        A.loseRow = (A.loseRow || 0) + 1;
        if (!A.cfg.rest) return autoStop('thua trận');
        if (A.loseRow >= AUTO_LOSE_MAX) return autoStop(`thua liền ${A.loseRow} trận, ngươi nên mạnh lên rồi hẵng đi tiếp`);
        A.at = P.loc;
        A.mustRest = true;
      }
      autoNext();
    }, AUTO_DELAY.next);
    return;
  }
  if (combat.busy) return;
  A.pending = true;
  setTimeout(() => {
    A.pending = false;
    if (AUTO && AUTO.on && combat && !combat.over && !combat.busy) autoAct();
  }, AUTO_DELAY.act);
}
// Chọn nước đi: giải độc, hồi máu (công pháp rồi tới thuốc), tăng lực khi gặp boss, rồi võ công mạnh nhất đủ nội lực
function autoAct() {
  const pl = combat.pl, c = AUTO.cfg, E = combat.en.E, ids = activeSkills().filter(id => elemOk(id)); // công pháp sai hệ thì bỏ qua
  const ns = id => normSkill(id, skLv(id));
  const pots = c.pots ? Object.keys(P.inv).filter(id => P.inv[id] > 0 && ITEMS[id].type === 'use' && !(ITEMS[id].lv && P.lv < ITEMS[id].lv)) : [];
  if (pl.fx.poison && pl.hp < pl.maxHp * 0.6) { const cure = pots.find(id => ITEMS[id].cure); if (cure) return G.act('item', cure); }
  if (pl.hp < pl.maxHp * 0.4) {
    const hs = ids.find(id => SKILLS[id].type === 'heal' && pl.mp >= ns(id).mp);
    if (hs) return G.act('skill', hs);
    const need = pl.maxHp - pl.hp;
    const heals = pots.filter(id => ITEMS[id].heal).sort((a, b) => ITEMS[a].heal - ITEMS[b].heal);
    const pot = heals.find(id => ITEMS[id].heal >= need * 0.6) || heals[heals.length - 1];
    if (pot) return G.act('item', pot);
  }
  if (E.boss && pl.mp < 15) { const mp = pots.filter(id => ITEMS[id].mp && !ITEMS[id].heal).sort((a, b) => ITEMS[b].mp - ITEMS[a].mp)[0]; if (mp) return G.act('item', mp); }
  // đầy nộ thì ra chiêu nộ ngay (không tốn nội lực, nộ hết trận là mất)
  const no = ids.find(id => SKILLS[id].no && SKILLS[id].type === 'attack');
  if (no) return G.act('skill', no);
  // Phổ Chiếu lưu ở fx.hpUp (không phải fx.phoChieu): đọc sai tên thì tưởng chưa vận, vận lại mãi không đánh (lỗi 2026-11-10)
  const fxKey = b => (b === 'phoChieu' ? 'hpUp' : b);
  const buff = ids.find(id => SKILLS[id].type === 'buff' && !pl.fx[fxKey(SKILLS[id].buff)] && pl.mp >= ns(id).mp + 20 && E.boss);
  if (buff) return G.act('skill', buff);
  const dmg = id => { const k = ns(id); return k.power * (k.hitSplit ? 1 : k.hits || 1); }; // hitSplit: tổng các đòn = power
  const atk = ids.filter(id => SKILLS[id].type === 'attack' && pl.mp >= ns(id).mp).sort((a, b) => dmg(b) - dmg(a))[0];
  return atk ? G.act('skill', atk) : G.act('attack');
}

// Các nút trong HTML gọi qua G (engine.js gộp vào window.G)
const AUTO_G = { autoMenu, autoSet, autoStart, autoThap, autoStop: () => autoStop('ngươi bấm dừng') };
