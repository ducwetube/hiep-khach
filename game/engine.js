'use strict';
/* =================================================================
   HIỆP KHÁCH GIANG HỒ — BỘ MÁY GAME
   File này lo phần giao diện, chiến đấu, nhiệm vụ và lưu game.
   Nội dung game (quái, đồ, lời thoại...) nằm trong data.js.
   ================================================================= */

const SAVE_KEY = 'giang_ho_hanh_save_v1';
const STAT_KEYS = ['hp', 'mp', 'atk', 'def', 'spd', 'crit', 'critDmg', 'critRes', 'critDmgRes', 'acc', 'dodge', 'lifesteal', 'manasteal', 'expBonus'];
const STAT_NAMES = {
  hp: 'Khí huyết', mp: 'Nội lực', atk: 'Công', def: 'Thủ', spd: 'Tốc độ',
  crit: 'Bạo kích', critDmg: 'Sát thương bạo kích', critRes: 'Kháng bạo kích', critDmgRes: 'Giảm sát thương bạo', acc: 'Chính xác', dodge: 'Né tránh',
  lifesteal: 'Hút huyết', manasteal: 'Hút nội lực', expBonus: 'Kinh nghiệm thêm',
};
const STAT_HINTS = {
  spd: 'Bên nhanh hơn ra tay trước; càng nhanh càng dễ bỏ chạy',
  crit: 'Tỉ lệ ra đòn bạo kích',
  critDmg: 'Sát thương của đòn bạo kích',
  critRes: 'Trừ vào tỉ lệ bạo kích của đối thủ',
  critDmgRes: 'Bị bạo kích thì sát thương bạo kích của đối thủ giảm đi bấy nhiêu',
  acc: 'Trừ vào tỉ lệ né tránh của đối thủ',
  dodge: 'Tỉ lệ né đòn',
  lifesteal: 'Phần sát thương gây ra hồi thành khí huyết',
  manasteal: 'Phần sát thương gây ra hồi thành nội lực',
  expBonus: 'Kinh nghiệm nhận thêm sau mỗi trận và nhiệm vụ',
};
const STAT_GROUPS = [
  ['Cơ bản', ['hp', 'mp', 'atk', 'def', 'spd']],
  ['Chiến đấu', ['crit', 'critDmg', 'critRes', 'critDmgRes', 'acc', 'dodge']],
  ['Đặc biệt', ['lifesteal', 'manasteal', 'expBonus']],
];
const PCT_STATS = { crit: true, critDmg: true, critRes: true, critDmgRes: true, acc: true, dodge: true, lifesteal: true, manasteal: true, expBonus: true };
// 11 ô trang bị (người dùng chốt 2026-10-28); thứ tự = thứ tự trên màn Trang bị: trái 4, phải 4, dưới 3 (EQ_LAYOUT)
const SLOT_NAMES = { weapon: 'Vũ khí', necklace: 'Dây chuyền', ring: 'Nhẫn', pendant: 'Ngọc bội', hat: 'Mũ', armor: 'Áo giáp', pants: 'Quần', shoes: 'Giày', cape: 'Phi phong', belt: 'Đai lưng', glove: 'Hộ tâm kính' };
const SLOT_ICONS = { weapon: 'thiet_kiem', necklace: 'day_chuyen', ring: 'ngoc_boi', pendant: 'bach_ngoc_boi', hat: 'non_la', armor: 'ao_vai', pants: 'quan_vai', shoes: 'giay_co', cape: 'phi_phong', belt: 'dai_lung', glove: 'htk_1' };
const EQ_LAYOUT = { L: ['weapon', 'necklace', 'ring', 'pendant'], R: ['hat', 'armor', 'pants', 'shoes'], B: ['cape', 'belt', 'glove'] };
const CAT_ICONS = { vocong: '[[vo_cong]]', noicong: '[[noi_cong]]', congphap: '[[cong_phap]]', khinhcong: '[[khinh_cong]]' };
// Biểu tượng riêng của từng võ công (icons.js vẽ sk_<mã>); thiếu thì dùng biểu tượng của loại
const skIcon = id => (typeof ICONS !== 'undefined' && ICONS['sk_' + id] ? `[[sk_${id}]]` : CAT_ICONS[SKILLS[id].cat]);
const CAT_HINTS = {
  vocong: 'Chiêu thức gây sát thương, tốn nội lực. Mỗi lần ra chiêu +1 thành thạo.',
  noicong: 'Bị động: mang theo là tăng chỉ số. Mỗi lượt trong trận +1 thành thạo.',
  congphap: 'Chiêu hỗ trợ: hồi khí huyết, tăng công, tăng thủ... Mỗi lần dùng +1 thành thạo.',
  khinhcong: 'Bị động: tăng tốc độ và né tránh. Mỗi lượt trong trận +1 thành thạo.',
};
const GRADE_ORDER = Object.keys(SKILL_GRADES);
const gradeTag = id => `<span class="tag grade-${SKILLS[id].grade}">${SKILL_GRADES[SKILLS[id].grade]}</span>`;
// Biểu tượng st_* là ảnh Gemini (icons.js, game/img/st/), hiện ở chip trên đầu nhân vật (sdChips) và nhật ký
const FX_NAMES = { poison: '[[st_trung_doc]] Trúng độc', bleed: '[[st_chay_mau]] Chảy máu', stun: '[[st_choang]] Choáng', charm: '[[st_me_hoac]] Mê hoặc', phehon: '[[st_phe_hon]] Phệ hồn', atk: '[[st_tang_cong]] Tăng công', def: '[[st_tang_thu]] Tăng thủ', dodge: '[[st_tang_toc]] Tăng né', reflect: '[[st_phan_don]] Phản đòn', hot: '[[st_hoi_phuc]] Hồi phục', dan: '[[giai_doc_dan]] Đan dược', soho: '[[st_so_ho]] Sơ hở', weak: '[[st_suy_yeu]] Suy yếu', shield: '[[st_giap_ao]] Giáp ảo', hpUp: '[[st_tang_mau]] Tăng khí huyết tối đa', crit: '[[muc_tieu]] Tăng bạo kích', critDmg: '[[tan_cong]] Tăng sát thương bạo kích', acc: '[[muc_tieu]] Tăng chính xác', spd: '[[st_tang_toc]] Tăng tốc độ', mpUp: '[[chi_so]] Tăng nội lực tối đa', noithuong: '[[st_noi_thuong]] Nội thương', reduce: '[[st_giam_st]] Giảm sát thương' };
FX_NAMES.dv = '[[lua]] Dương Viêm'; FX_NAMES.cuuNhat = '[[lua]] Cửu Nhật Lăng Không'; // bộ Đại Nhật: lửa trên người địch (số tầng), chiêu Trợ (số lượt)
FX_NAMES.chienLong = '[[sk_hl_chien_long]] Chiến Long Tại Dã'; // bộ Hàng Long: còn mấy lượt +1 Cuồng Long (giảm ở playerTurnStart)
// Hiệu ứng tăng chỉ số có hạn lượt (giảm dần ở endTurn)
const TIMED_BUFFS = ['atk', 'def', 'dodge', 'reflect', 'crit', 'critDmg', 'weak', 'hpUp', 'acc', 'spd', 'mpUp', 'reduce'];
const TITLES = ['Thiếu hiệp', 'Nữ hiệp'];
const TYPE_ORDER = { use: 0, weapon: 1, necklace: 2, ring: 3, pendant: 4, hat: 5, armor: 6, pants: 7, shoes: 8, cape: 9, belt: 10, glove: 11, book: 12, material: 13, quest: 14 };
const START_SECT = 'vo_danh'; // chỉ số gốc của nhân vật (không gia nhập phái nào; học võ phái bằng lệnh bài)
const START_LOC = 'duong_chau';
const NO_SECT_NAME = 'Giang hồ tán nhân';
// Võ học tặng sẵn khi tạo nhân vật (lối chơi mới): võ công + nội công phổ thông cùng hệ Dương
// Người dùng chốt 2026-10-27: tặng trọn bộ Vô Danh không hệ (nội công, công pháp, khinh công); Vô Danh Quyền tặng riêng (BASIC_SKILL); võ có hệ tự mua ở Võ Quán
const START_SKILLS = ['co_hong_tam_phap', 'vo_danh_cong_phap', 'co_hong_bo'];
// Lối chơi mới: chưa vào phái là "Giang hồ tán nhân"; đỗ ngoại môn Thanh Vân thì "Đệ tử ngoại môn · <đường>" (tvTitle, mon_phai.js)
const sectName = id => (id === START_SECT ? (typeof tvTitle === 'function' && tvTitle()) || NO_SECT_NAME : SECTS[id].name);
const MAX_LV = 100;
const MAX_SKILL_LV = 10;

let P = null;          // nhân vật đang chơi
let combat = null;     // trận đấu đang diễn ra
let worldLog = [];     // nhật ký hành trình
let modalFns = [];     // các nút bấm trong hộp thoại
let shopState = null;
let charTab = 'stats';
let skillTab = 'vocong';
const createSel = { name: '', title: TITLES[0], sect: START_SECT };

/* ---------------------------- Tiện ích ---------------------------- */
const el = id => document.getElementById(id);
const rand = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
const roll = pct => Math.random() * 100 < pct;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const num = v => Math.round(v * 10) / 10;

// Danh xưng môn phái cho phép (Thiếu Lâm chỉ nhận nam; Nga Mi chỉ nhận nữ)
const sectTitles = id => SECTS[id].titles || TITLES;
// Hình chibi của nhân vật (avatars.js); trả về chuỗi rỗng nếu chưa có hình
function playerAvatar(sect, title, view, face) {
  return typeof avatarSvg === 'function' ? avatarSvg(sect, title, view, face) : '';
}
// Âm thanh (audio.js); thiếu file thì game vẫn chạy, chỉ không có tiếng
const hasSnd = () => typeof SND !== 'undefined';
function snd(fn, ...args) { if (hasSnd()) SND[fn](...args); }

function esc(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function fmt(text) {
  if (!P) return text;
  return text.replace(/\{name\}/g, '<b>' + esc(P.name) + '</b>')
    .replace(/\{title\}/g, P.title)
    .replace(/\{sect\}/g, sectName(P.sect));
}
function pickWeighted(list, weightOf) {
  const total = list.reduce((s, x) => s + weightOf(x), 0);
  let r = Math.random() * total;
  for (const x of list) { r -= weightOf(x); if (r < 0) return x; }
  return list[list.length - 1];
}
function bar(label, v, max, cls) {
  const pct = max > 0 ? clamp(v / max * 100, 0, 100) : 0;
  return `<div class="bar ${cls}"><div class="fill" style="width:${pct}%"></div><span>${label} ${Math.round(v)} / ${max}</span></div>`;
}
function statText(stats) {
  return Object.entries(stats || {}).map(([k, v]) => `${STAT_NAMES[k]} +${num(v)}${PCT_STATS[k] ? '%' : ''}`).join(', ');
}
// Mọi chuỗi HTML đưa lên màn hình đều qua đây: [[tên]] thành biểu tượng (icons.js)
function setHtml(node, html) { node.innerHTML = iconize(html); }
// key: tên màn hình — chỉ cuộn lên đầu khi chuyển sang màn hình khác
let screenKey = '';
function show(html, key) {
  setHtml(el('screen'), html);
  if (key !== screenKey) window.scrollTo(0, 0);
  screenKey = key;
}
function toast(msg) {
  const t = el('toast');
  setHtml(t, msg);
  t.classList.add('show');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => t.classList.remove('show'), 2600);
}
function log(msg) {
  worldLog.push(msg);
  if (worldLog.length > 60) worldLog.shift();
}
function tabsHtml(list, current, fnName) {
  return `<div class="tabs">${list.map(([k, label]) => `<button class="${k === current ? 'on' : ''}" onclick="G.${fnName}('${k}')">${label}</button>`).join('')}</div>`;
}

/* ---------------------------- Hộp thoại ---------------------------- */
function openModal(html) {
  const box = el('modal-content');
  const wasOpen = !el('modal').classList.contains('hidden');
  const keep = wasOpen ? box.scrollTop : 0;
  setHtml(box, html);
  el('modal').classList.remove('hidden');
  box.scrollTop = openModal.keepScroll ? keep : 0;
  openModal.keepScroll = false;
}
// Mở lại cùng hộp thoại sau khi bấm nút, giữ nguyên vị trí cuộn
function reopen(fn) { openModal.keepScroll = true; fn(); }
function closeModalSilent() {
  el('modal').classList.add('hidden');
  modalFns = [];
}
function closeModal() {
  closeModalSilent();
  if (P && !combat && el('screen').querySelector('.world')) renderWorld();
}
function mfn(i) { if (modalFns[i]) modalFns[i](); }

/* ---------------------------- Nhân vật ---------------------------- */
// Kinh nghiệm cần để lên cấp tiếp theo. Hệ số (1 + cấp/12) làm mỗi cấp về sau khó hơn hẳn:
// cấp 1→2 cần 37, cấp 10→11 cần ~1.460, cấp 30→31 ~14.400, cấp 48→49 ~41.600
/* Kinh nghiệm cần để lên từ cấp lv sang lv + 1 (người dùng chốt 2026-10-27):
   30 × (cấp kế tiếp)² + 10 × (cấp kế tiếp) + kinh nghiệm cần của lần lên cấp trước; trước cấp 1 tính là 40.
   Vd. cấp 1 → 2: 30 × 4 + 20 + 40 = 180; cấp 2 → 3: 30 × 9 + 30 + 180 = 480. */
const EXP_TABLE = [40];
function expNeed(lv) {
  for (let i = EXP_TABLE.length; i <= lv; i++) EXP_TABLE[i] = 30 * (i + 1) * (i + 1) + 10 * (i + 1) + EXP_TABLE[i - 1];
  return EXP_TABLE[Math.max(0, lv)];
}
// Điểm thành thạo cần để lên tầng tiếp theo (bảng SKILL_PROF trong data.js)
// id: nhân theo phẩm chất (PROF_MULT); võ Vô Danh tặng lúc tạo nhân vật tính như Nhập môn
function profMult(id) {
  const sk = id && SKILLS[id];
  if (!sk || id === BASIC_SKILL || START_SKILLS.includes(id)) return 1;
  return PROF_MULT[sk.grade] || 1;
}
// Tầng tối đa của một môn: mặc định MAX_SKILL_LV (10); nội công kiểu mới ghi maxLv: 100 (người dùng chốt 2026-11-02)
const skMax = id => (id && SKILLS[id] && SKILLS[id].maxLv) || MAX_SKILL_LV;
// Môn 100 tầng: mỗi mốc SKILL_PROF dùng cho 10 tầng, chia 10 (tầng 91–99 dùng mốc cuối)
function profNeed(lv, id) {
  if (skMax(id) > MAX_SKILL_LV) return Math.max(1, Math.round(SKILL_PROF[Math.min(SKILL_PROF.length - 1, Math.floor((lv - 1) / 10))] / 10 * profMult(id)));
  return Math.round(SKILL_PROF[clamp(lv, 1, SKILL_PROF.length) - 1] * profMult(id));
}
function invCount(id) { return P.inv[id] || 0; }
function addItem(id, n = 1) {
  if (POTION_OFF && ITEMS[id] && ITEMS[id].type === 'use') return; // đã bỏ thuốc (POTION_OFF): mọi nguồn thuốc còn sót không cho vào túi
  P.inv[id] = (P.inv[id] || 0) + n;
}
function removeItem(id, n = 1) {
  P.inv[id] = (P.inv[id] || 0) - n;
  if (P.inv[id] <= 0) delete P.inv[id];
}
function knowsBook(itemId) {
  const sk = ITEMS[itemId].skill;
  return !!P.skills[sk] || invCount(itemId) > 0;
}
function addStats(r, st) { for (const k in st || {}) r[k] = (r[k] || 0) + st[k]; }
function passiveStats(id, lv) {
  const s = SKILLS[id], r = {};
  for (const k in s.stats) r[k] = s.stats[k] + ((s.statsUp || {})[k] || 0) * (lv - 1);
  // statsUpAt: { tầng: hệ số } — tầng đó tăng gấp hệ số lần mức thường (vd. Trường Sinh Quyết tầng 100 ×2)
  for (const t in s.statsUpAt || {}) if (lv >= +t && +t > 1) for (const k in s.statsUp || {}) r[k] = (r[k] || 0) + s.statsUp[k] * (s.statsUpAt[t] - 1);
  return r;
}
function getStats() {
  const sect = SECTS[P.sect], r = {};
  STAT_KEYS.forEach(k => {
    const b = k in sect.base ? sect.base[k] : (BASE_DEFAULT[k] || 0);
    const g = k in sect.grow ? sect.grow[k] : (GROW_DEFAULT[k] || 0);
    r[k] = b + g * (P.lv - 1);
  });
  // Lối chơi mới (người dùng chốt 2026-11-02): chính xác gốc 100, bạo kích / né / kháng bạo gốc 0, không tăng theo cấp (số ở SECTS.vo_danh)
  Object.values(P.equip).forEach(id => { if (id) addStats(r, ITEMS[id].stats); });
  usedPassives().forEach(id => addStats(r, passiveStats(id, skLv(id))));
  const pt = passiveTiers(); // mốc tầng nội công tăng % tốc độ, chính xác (vd. Cửu Âm Chân Kinh tầng 10)
  if (pt.spdPct) r.spd *= 1 + pt.spdPct / 100;
  if (pt.accPct) r.acc *= 1 + pt.accPct / 100;
  if (pt.atkPct) r.atk *= 1 + pt.atkPct / 100;
  if (pt.defPct) r.def *= 1 + pt.defPct / 100;
  if (pt.hpPct) r.hp *= 1 + pt.hpPct / 100; // vd. Thiền Định Công bậc 1 / 4 / 7
  if (pt.mpPct) r.mp *= 1 + pt.mpPct / 100; // vd. Trường Sinh Quyết bậc 2
  if (pt.critUp) r.crit += pt.critUp; // vd. Hàng Long Quyết bậc 7 / 9: bạo kích +10 / +20
  if (pt.critDmgUp) r.critDmg += pt.critDmgUp; // Hàng Long Quyết bậc 5: sát thương bạo +30%
  const kb = kmBonus(); // Kinh mạch: điểm chỉ số cộng thẳng rồi % (KINH_MACH trong data.js)
  addStats(r, kb.flat);
  for (const k in kb.pct) r[k] *= 1 + kb.pct[k] / 100;
  // Bộ Tâm Phật, bị động Tịch Diệt Gia Trì: tầng 2 thủ +5%, tầng 6 khí huyết tối đa +5%
  const tpg = P.chieu ? huLvOf('tam_phat') : 0; // Hư chiêu đang mang là Tịch Diệt Gia Trì
  if (tpg) { if (tpg >= 2) r.def *= 1.05; if (tpg >= 6) r.hp *= 1.05; }
  // Bộ Như Lai, bị động Phật Pháp Vô Biên: thủ, khí huyết tối đa theo %
  const nlg = P.chieu ? huLvOf('nhu_lai') : 0;
  if (nlg) { r.def *= 1 + NL_RULE.def(nlg) / 100; r.hp *= 1 + NL_RULE.hp(nlg) / 100; }
  if (pt.expUp) r.expBonus = (r.expBonus || 0) + pt.expUp; // vd. Vô Danh Tâm Pháp tầng 10: kinh nghiệm +30%
  STAT_KEYS.forEach(k => { r[k] = Math.round(r[k]); });
  return r;
}
function fixHpMp() {
  const s = getStats();
  P.hp = clamp(P.hp, 0, s.hp);
  P.mp = clamp(P.mp, 0, s.mp);
}
function gainExp(n) {
  const msgs = [];
  P.exp += n;
  while (P.lv < MAX_LV && P.exp >= expNeed(P.lv)) {
    P.exp -= expNeed(P.lv);
    P.lv++;
    const s = getStats();
    P.hp = s.hp;
    P.mp = s.mp;
    msgs.push(`[[thang_cap]] <b>Thăng cấp!</b> Đạt cấp <b>${P.lv}</b>, hồi phục toàn bộ.`);
  }
  if (msgs.length) setTimeout(() => snd('jingle', 'levelup'), 1300);
  return msgs;
}
function withBonus(exp) { return Math.round(exp * (1 + getStats().expBonus / 100)); }

/* ---------------------------- Võ công ---------------------------- */
// Lối chơi mới: ai cũng học được võ mọi phái (đổi lệnh bài ở Tàng Kinh Các, mon_phai.js); tuyệt học sách và võ Vô Danh không học ở đâu
function canLearn(id) {
  const sk = SKILLS[id];
  return !sk.book && !sk.story && !sk.quai && !sk.cut; // quai: võ riêng của quái; cut: võ đã bỏ (SKILL_CUT)
}
// Điều kiện tầng (req): phải luyện môn kia tới tầng lv mới học được
// Chiêu của bộ võ không còn điều kiện mở theo tầng (học bằng mảnh, người dùng chốt 2026-11-06)
const reqMet = id => { const r = SKILLS[id].req; return !r || !!SKILLS[id].bo || (P.skills[r.skill] && P.skills[r.skill].lv >= r.lv); };
const reqText = id => { const r = SKILLS[id].req; return r ? `Cần ${SKILLS[r.skill].name} tầng ${r.lv}` : ''; };
/* Hệ võ học (SKILL_ELEMS trong data.js): võ công cùng hệ với nội công đang mang thì sát thương +ELEM_BONUS%,
   mang đúng môn ghi ở elemWith thì được % riêng (lấy mức cao hơn); công pháp không còn khóa theo hệ (2026-11-07) */
const elemTag = id => (SKILLS[id].elem ? `<span class="tag elem-${SKILLS[id].elem}">${SKILL_ELEMS[SKILLS[id].elem]}</span>` : '');
function elemBonus(id, actor) {
  const s = SKILLS[id];
  if (!ELEM_BONUS) return 0; // bỏ cộng sát thương theo nội công cùng hệ (cả elemWith), người dùng chốt 2026-11-07
  if (!s.elem || s.cat !== 'vocong') return 0;
  const ncs = actor ? Object.keys(actor.skills).filter(x => SKILLS[x].cat === 'noicong') : P.use.noicong;
  let b = 0;
  ncs.forEach(nc => {
    if (SKILLS[nc].elem && SKILLS[nc].elem === s.elem) b = Math.max(b, ELEM_BONUS);
    if (s.elemWith && s.elemWith[nc]) b = Math.max(b, s.elemWith[nc]);
  });
  return b;
}
// Hệ của một bên trong trận (để tính tương khắc): người chơi = hệ các nội công đang mang, quái = ENEMIES[x].elem
const noiElems = actor => (actor ? Object.keys(actor.skills) : P.use.noicong).filter(x => SKILLS[x].cat === 'noicong' && SKILLS[x].elem).map(x => SKILLS[x].elem);
// Đòn hệ el đánh vào tgt: trả về hệ bị khắc nếu tgt mang hệ đó, không thì null
const elemKhac = (el, tgt) => (el && ELEM_KHAC[el] && (tgt.elems || []).includes(ELEM_KHAC[el]) ? ELEM_KHAC[el] : null);
// Đòn hệ el đánh vào kẻ mang hệ khắc el (vd. Dương đánh Thái Cực): trả về hệ đó, không thì null
const elemBiKhac = (el, tgt) => { if (!el) return null; const k = Object.keys(ELEM_KHAC).find(x => ELEM_KHAC[x] === el); return k && (tgt.elems || []).includes(k) ? k : null; };
// Người dùng chốt 2026-11-07: bỏ luật công pháp (chiêu hỗ trợ) phải mang nội công cùng hệ mới dùng được; giữ hàm để chỗ cũ gọi vẫn chạy
function elemOk() { return true; }
// Dòng mô tả hệ trong Võ học / cửa hàng
function elemNote(id) {
  const s = SKILLS[id];
  if (s.noElem) return `<div class="ri-elem">Không hệ: ${s.cat === 'noicong' ? 'võ công không được cộng theo hệ, nhưng không bị đòn hệ nào khắc.' : 'không được cộng theo nội công, không khắc hệ nào.'}</div>`;
  if (!s.elem) return '';
  if (s.cat === 'vocong') {
    const by = Object.keys(ELEM_KHAC).find(k => ELEM_KHAC[k] === s.elem);
    return `<div class="ri-elem">Hệ ${SKILL_ELEMS[s.elem]}: đánh hệ ${SKILL_ELEMS[ELEM_KHAC[s.elem]]} +${ELEM_KHAC_BONUS}% sát thương, đánh hệ ${SKILL_ELEMS[by]} −${ELEM_KHAC_MALUS}%.</div>`;
  }
  if (s.cat === 'congphap') return '';
  const khacBy = Object.keys(ELEM_KHAC).find(k => ELEM_KHAC[k] === s.elem);
  return `<div class="ri-elem">Nội công hệ ${SKILL_ELEMS[s.elem]}: mang nó thì mình thuộc hệ ${SKILL_ELEMS[s.elem]}.${khacBy ? ` Đòn hệ ${SKILL_ELEMS[khacBy]} đánh mình +${ELEM_KHAC_BONUS}%, đòn hệ ${SKILL_ELEMS[ELEM_KHAC[s.elem]]} đánh mình −${ELEM_KHAC_MALUS}%.` : ''}</div>`;
}
/* Mang theo võ học: mỗi loại chỉ mang được SKILL_SLOTS[loại] môn (data.js).
   P.use = { vocong: [id...], noicong: [...], congphap: [...], khinhcong: [...] } */
const emptyUse = () => Object.fromEntries(Object.keys(SKILL_CATS).map(c => [c, []]));
/* Lối chơi mới (người dùng chốt 2026-10-27): bỏ đánh thường, Vô Danh Quyền thay vào (không tốn nội lực).
   Ai cũng có, luôn dùng được, không chiếm ô mang theo; vẫn luyện tầng như võ công khác. */
const BASIC_SKILL = 'vo_danh_quyen';
const isBasic = id => !!BASIC_SKILL && id === BASIC_SKILL;
// Hình nắm đấm Vô Danh Quyền theo tầng (người dùng chốt): tầng 1 trắng, tầng 5 xanh to hơn, tầng 10 vàng to nhất
const BASIC_FX = [{ lv: 10, color: '#ffd24a', size: 1.6, big: true }, { lv: 5, color: '#5fb8ff', size: 1.3 }, { lv: 1, color: '#ffffff', size: 1 }];
const inUse = id => (isBasic(id) ? !!P.skills[id] : isChieu(id) ? chieuWorn().includes(id) : P.use[SKILLS[id].cat].includes(id));
const slotFree = cat => P.use[cat].length < SKILL_SLOTS[cat];
const usedPassives = () => ['noicong', 'khinhcong'].flatMap(c => P.use[c]);
// Môn tốt hơn đứng trước: phẩm chất cao hơn, rồi giá cao hơn
const skillRank = id => GRADE_ORDER.indexOf(SKILLS[id].grade) * 100000 + (SKILLS[id].price || 0);
// Học xong thì tự mang theo nếu còn chỗ; trả về true nếu đã mang
function giveSkill(id) {
  if (SKILLS[id].quai || SKILLS[id].cut) return false; // võ riêng của quái, võ đã bỏ
  P.skills[id] = { lv: 1, xp: 0 };
  if (SKILLS[id].setFlag) P.flags[SKILLS[id].setFlag] = true; // vd. Cửu Dương Thần Công mở đường học Càn Khôn Đại Na Di
  if (isBasic(id)) return true;
  // Chiêu của bộ võ: học từng chiêu (ghép mảnh); ô cùng loại còn trống thì tự mang
  if (isChieu(id)) { const ok = chieuPut(id); fixHpMp(); return ok; }
  const cat = SKILLS[id].cat;
  if (!slotFree(cat)) return false;
  P.use[cat].push(id);
  fixHpMp();
  return true;
}
// Nhận trọn một bộ võ (đỗ ngoại môn được sư phụ truyền cả bộ, người dùng chốt 2026-11-06); trả về số chiêu mới học
function giveBo(b) {
  let n = 0;
  // Ô không phải Thực thì thay luôn chiêu đang ở đó (vd. Vô Danh Thuẫn ở ô Trợ nhường cho phụ trợ của bộ)
  Object.values(BO_VO[b].roles).forEach(x => { if (!P.skills[x] && SKILLS[x]) { P.skills[x] = { lv: 1, xp: 0 }; n++; } chieuPut(x, chieuRole(x) === 'thuc' ? undefined : 0); });
  fixHpMp();
  return n;
}
// Ghép mảnh võ thành chiêu (đồ giám, G.ghepManh)
function ghepManh(id) {
  if (!SKILLS[id] || !SKILLS[id].bo || P.skills[id] || ((P.manh || {})[id] || 0) < CHIEU_MANH) return;
  P.manh[id] -= CHIEU_MANH;
  if (!P.manh[id]) delete P.manh[id];
  const worn = giveSkill(id);
  snd('jingle', 'quest');
  toast(`[[vo_hoc]] Ghép đủ ${CHIEU_MANH} mảnh, lĩnh ngộ <b>${SKILLS[id].name}</b>!${worn ? ' Đã mang vào ô ' + CHIEU_TAG[chieuRole(id)] + '.' : ''}`);
  log(`[[vo_hoc]] Lĩnh ngộ ${CHIEU_NAME[chieuRole(id)]} <b>${SKILLS[id].name}</b> (${BO_VO[SKILLS[id].bo].name}).`);
  saveGame(true);
  reopen(() => menuSkills('dogiam'));
}
// Nhận mảnh võ (Truy Nã Hào Kiệt và các hoạt động sau này gọi vào đây)
function addManh(id, n = 1) {
  if (!SKILLS[id] || !SKILLS[id].bo) return;
  P.manh = P.manh || {};
  P.manh[id] = (P.manh[id] || 0) + n;
}
const usedNote = id => (inUse(id) ? ' Đã mang theo.' : ` Hết chỗ mang ${SKILL_CATS[SKILLS[id].cat]}, vào [[vo_hoc]] Võ học để đổi.`);
// raw: cộng đúng n, không nhân profUp (vd. thưởng hạ Tinh Anh)
function addProf(id, n, raw) {
  const st = P.skills[id];
  const top = skMax(id);
  if (!st || st.lv >= top) return [];
  const msgs = [];
  const up = passiveTiers().profUp; // vd. Vô Danh Tâm Pháp tầng 5: thành thạo +100%
  if (up && !raw) n = Math.round(n * (1 + up / 100));
  st.xp += n;
  while (st.lv < top && st.xp >= profNeed(st.lv, id)) {
    st.xp -= profNeed(st.lv, id);
    st.lv++;
    msgs.push(`[[vo_hoc]] <b class="skill">${SKILLS[id].name}</b> đột phá lên <b>tầng ${st.lv}</b>!`);
  }
  if (st.lv >= top) st.xp = 0;
  return msgs;
}
// Hiệu ứng mốc tầng (SKILLS[x].tiers): luyện tới mốc nào thì mở mốc đó, cộng dồn các mốc đã qua
function tierFx(id, lv) {
  const r = {}, t = SKILLS[id].tiers || {};
  Object.keys(t).forEach(k => {
    if (lv < +k) return;
    for (const f in t[k]) if (f !== 'name' && f !== 'desc') r[f] = typeof t[k][f] === 'number' ? (r[f] || 0) + t[k][f] : t[k][f];
  });
  return r;
}
// Luyện với mộc nhân: tạm coi các môn có mốc tầng như đang ở tầng tryTier (không đổi bản lưu)
let tryTier = null;
const skLv = id => (tryTier && SKILLS[id].tiers ? Math.min(tryTier, skMax(id)) : P.skills[id].lv);
// Hiệu ứng mốc tầng của nội công, khinh công đang mang (hoặc của người đang được điều khiển)
function passiveTiers(A) {
  const r = {};
  if (A) Object.keys(A.skills).forEach(id => { if (SKILLS[id].type === 'passive') addStats(r, tierFx(id, A.skills[id].lv)); });
  else {
    usedPassives().forEach(id => addStats(r, tierFx(id, skLv(id))));
    addStats(r, kmBonus().pt); // Kinh mạch đủ 100 cấp: hồi máu / nội lực mỗi lượt, giảm sát thương, né đòn hồi máu, nộ lúc vào trận
  }
  return r;
}
/* ---------------- KINH MẠCH (KINH_MACH trong data.js; người dùng chốt 2026-11-10) ----------------
   P.km[mã] = { lv, xp }; xp = điểm chân khí đã nạp vào cấp kế (đủ KINH_MACH.per thì lên cấp) */
const kmOf = id => (P && P.km && P.km[id]) || { lv: 0, xp: 0 };
const kmLv = id => kmOf(id).lv;
// Mạch i mở khi đủ cấp nhân vật và mạch trước đạt cấp tối đa
const kmOpen = i => { const L = KINH_MACH.list, m = L[i]; return !!P && P.lv >= m.lv && (i === 0 || kmLv(L[i - 1].id) >= KINH_MACH.max); };
function kmBonus() {
  const r = { flat: {}, pct: {}, pt: {} };
  if (!P || !P.km) return r;
  KINH_MACH.list.forEach(m => {
    const l = kmLv(m.id);
    if (!l) return;
    if (m.noi && SKILLS[m.noi]) addStats(r.flat, passiveStats(m.noi, l)); // như nội công mẫu ở tầng l
    if (l >= KINH_MACH.max && m.full) {
      addStats(r.flat, m.full.stats);
      addStats(r.pct, m.full.pct);
      addStats(r.pt, m.full.pt);
    }
  });
  return r;
}
// Nạp thảo dược vào mạch i: herb = mã thảo dược, hoặc 'all' (dùng lần lượt từ loại rẻ tới quý tới khi hết hoặc mạch đầy)
function kmFeed(i, herb) {
  const m = KINH_MACH.list[i];
  if (!m || !kmOpen(i)) return;
  if (!P.km) P.km = {};
  const st = P.km[m.id] || (P.km[m.id] = { lv: 0, xp: 0 });
  const lv0 = st.lv;
  let used = 0;
  (herb === 'all' ? Object.keys(KINH_MACH.herbs) : [herb]).forEach(h => {
    const v = KINH_MACH.herbs[h];
    while (v && invCount(h) > 0 && st.lv < KINH_MACH.max) {
      removeItem(h);
      used++;
      st.xp += v;
      while (st.xp >= KINH_MACH.per && st.lv < KINH_MACH.max) { st.xp -= KINH_MACH.per; st.lv++; }
      if (herb !== 'all') break; // nút từng loại: mỗi lần bấm dùng 1 cây
    }
  });
  if (st.lv >= KINH_MACH.max) st.xp = 0;
  if (!used) return toast(st.lv >= KINH_MACH.max ? `${m.name} đã đạt cấp tối đa.` : 'Không còn thảo dược.');
  if (st.lv > lv0) { snd('jingle', 'levelup'); toast(`${m.name} lên cấp ${st.lv}${st.lv >= KINH_MACH.max ? ', đả thông hoàn toàn' : ''}.`); }
  fixHpMp();
  saveGame(true);
  renderTop();
  reopen(() => menuChar('km'));
}
let kmSel = null;
function kmPick(i) { kmSel = i; reopen(() => menuChar('km')); }
// Bốc n cây thảo dược quý (Nhân Sâm / Tuyết Liên theo KINH_MACH.rare), cho vào túi; trả về chuỗi "Nhân Sâm ×2, Tuyết Liên ×1"
function kmRare(n) {
  const got = { nhan_sam: 0, tuyet_lien_km: 0 };
  for (let i = 0; i < n; i++) got[roll(KINH_MACH.rare[0]) ? 'nhan_sam' : 'tuyet_lien_km']++;
  return Object.keys(got).filter(k => got[k]).map(k => { addItem(k, got[k]); return `[[${k}]] ${ITEMS[k].name} ×${got[k]}`; }).join(', ');
}
// Hình mạch i: ảnh riêng game/img/km/km_<i+1>.jpg 300×360 (2026-11-11: bỏ tấm ghép vì điện thoại người dùng hiện lệch hình)
const kmImg = i => `<img src="game/img/km/km_${i + 1}.jpg" alt="" draggable="false">`;
// Màn Kinh mạch (tab trong hộp Nhân vật): thảo dược đang có, khung chi tiết mạch đang chọn, lưới 10 mạch
function kmPanel() {
  const L = KINH_MACH.list, MX = KINH_MACH.max;
  if (kmSel == null || !L[kmSel]) { kmSel = L.findIndex((m, i) => kmOpen(i) && kmLv(m.id) < MX); if (kmSel < 0) kmSel = 0; }
  const fmt = v => Math.round(v).toLocaleString('vi-VN');
  const lineOf = (m, l) => Object.entries(passiveStats(m.noi, l)).map(([k, v]) => `${STAT_NAMES[k]} +${fmt(v)}`).join(', ');
  const upOf = m => Object.entries(SKILLS[m.noi].statsUp || {}).map(([k, v]) => `${STAT_NAMES[k]} +${String(v).replace('.', ',')}`).join(', ');
  const m = L[kmSel], st = kmOf(m.id), open = kmOpen(kmSel), full = st.lv >= MX;
  let act;
  if (full) act = '<span class="tag on">Đã đả thông</span>';
  else if (!open) act = `<span class="tag warn">${P.lv < m.lv ? `Mở ở cấp ${m.lv}` : `Cần ${L[kmSel - 1].name} đạt cấp ${MX}`}</span>`;
  // Một hàng 4 nút (người dùng chốt 2026-11-11): 3 thảo dược (mỗi lần bấm dùng 1 cây, số đang có ghi nhỏ ở góc icon) + Dùng hết;
  // bỏ hàng icon thảo dược phía trên, điểm chân khí mỗi cây đọc ở Hành trang
  else act = Object.keys(KINH_MACH.herbs).map(h => `<button class="btn small" ${invCount(h) ? '' : 'disabled'} onclick="G.kmFeed(${kmSel}, '${h}')"><span class="km-ic">[[${h}]]<i>${invCount(h)}</i></span>Dùng</button>`).join('')
    + `<button class="btn small primary" ${Object.keys(KINH_MACH.herbs).some(h => invCount(h)) ? '' : 'disabled'} onclick="G.kmFeed(${kmSel}, 'all')">Dùng hết</button>`;
  const detail = `<div class="km-d">
    <b class="km-fig">${kmImg(kmSel)}</b>
    <div class="km-info">
      <div class="km-name">${m.name}</div>
      <div class="km-lv">Cấp <b>${st.lv}</b> / ${MX}</div>
      ${full ? '' : `<div class="km-bar"><i style="width:${st.xp / KINH_MACH.per * 100}%"></i><span>${st.xp} / ${KINH_MACH.per} chân khí</span></div>`}
      <div class="km-row"><em>Mỗi cấp</em>${upOf(m)}</div>
      <div class="km-row"><em>Hiện có</em>${st.lv ? lineOf(m, st.lv) : 'Chưa khai thông'}</div>
      <div class="km-row${full ? ' on' : ''}"><em>Cấp ${MX}</em>${m.fullText}</div>
    </div></div>
    <div class="btn-row km-act${full || !open ? '' : ' km-four'}">${act}</div>`;
  const tiles = L.map((x, i) => { const l = kmLv(x.id), op = kmOpen(i);
    return `<button class="km-t${i === kmSel ? ' sel' : ''}${op || l ? '' : ' lock'}${l >= MX ? ' full' : ''}" type="button" onclick="G.kmPick(${i})">
      <b class="km-img">${kmImg(i)}</b><span>${x.name}</span><i>${op || l ? `${l}/${MX}` : `Cấp ${x.lv}`}</i></button>`; }).join('');
  return `${detail}<div class="km-grid">${tiles}</div>`;
}
/* Giá nội lực của chiêu (người dùng chốt 2026-10-27: không có thời gian chờ, chỉ nội lực giới hạn số chiêu):
   giá gốc trong SKILLS × hệ số theo cấp người ra chiêu × hệ số theo tầng chiêu. Không tính theo nội lực tối đa,
   nên ai dồn nội lực (nội công, trang bị) xả được nhiều chiêu lớn hơn. Số chỉnh ở MP_COST. */
const MP_COST = { perLv: 1 / 20, perTier: 0.06 };
const skillMpCost = (base, tier, who) => Math.round(base * (1 + (Math.max(1, who) - 1) * MP_COST.perLv) * (1 + (tier - 1) * MP_COST.perTier));
// who: cấp người ra chiêu (mặc định cấp nhân vật); quái truyền cấp của nó
function normSkill(id, lvl, who) {
  const s = SKILLS[id], k = lvl - 1;
  const r = Object.assign({}, s);
  if (s.type === 'attack') {
    r.power = s.power + (s.up || 0) * k;
    // upAt: tầng đó tăng khác mức up thường (vd. Vô Danh Quyền tầng 10 +2% thay vì +1%)
    if (s.upAt) for (const t in s.upAt) if (lvl >= +t && +t > 1) r.power += s.upAt[t] - (s.up || 0);
    const t = tierFx(id, lvl);
    if (t.critBonus) r.critBonus = (s.critBonus || 0) + t.critBonus;
    if (t.critDmg) r.critDmgUp = t.critDmg;
    if (t.hits) r.hits = (s.hits || 1) + t.hits;
    if (t.moveName) r.name = t.moveName;
    ['lastCrit', 'critStun', 'critBleed', 'execute', 'vsStatus', 'pierce', 'openStack', 'weakAtk', 'weakCrit', 'weakAcc', 'shieldPct', 'healPct', 'noiHeal', 'noiDef', 'noiN', 'noiMax', 'randHits', 'hitMp', 'lmPct', 'lmMax', 'overDrain', 'breakBuff', 'sohoBurst', 'tpBurst', 'tpBurstHeal', 'tpScale', 'clUse', 'clCrit', 'clHitX', 'nlChance', 'nlPct', 'nlScale', 'nlSpread', 'dvHit', 'dvSpread', 'dvPct', 'dvCrit', 'dvKeep', 'dvAll'].forEach(f => { if (t[f]) r[f] = t[f]; });
    if (t.dmgUp) r.power *= 1 + t.dmgUp / 100;
    if (t.drain) r.drain = (s.drain || 0) + t.drain;
    if (t.effect) r.effect = t.effect; // mốc tầng thêm hiệu ứng mới cho chiêu
    if (r.effect && (t.effChance || t.effTurns || t.effValue)) {
      r.effect = Object.assign({}, r.effect, { chance: Math.min(100, r.effect.chance + (t.effChance || 0)), turns: r.effect.turns + (t.effTurns || 0) });
      if (r.effect.value) r.effect.value *= 1 + (t.effValue || 0) / 100;
    }
  } else if (s.type !== 'passive') {
    const t = tierFx(id, lvl);
    r.value = s.value + (s.up || 0) * k + (t.valueUp || 0);
    if (t.turns) r.turns = (s.turns || 0) + t.turns;
    ['cleanse', 'hot', 'buff2', 'hpBuff', 'mpBuff', 'spdBuff', 'hotBuff', 'lm', 'reduceBuff', 'healNow'].forEach(f => { if (t[f]) r[f] = t[f]; });
    if (s.hpBuffUp && !t.hpBuff) r.hpBuff = (s.hpBuff || 0) + s.hpBuffUp * k; // khí huyết tối đa tăng theo tầng (vd. Vô Danh Thuẫn)
    // also: công pháp tăng thêm chỉ số khác cùng lúc, mỗi cái tăng theo tầng riêng (up)
    // accBuff (mốc tầng): cộng thêm vào phần tăng chính xác (vd. Phật Quang Phổ Chiếu)
    if (s.also) r.also = s.also.map(a => ({ buff: a.buff, value: a.value + (a.up || 0) * k + (a.buff === 'acc' ? t.accBuff || 0 : 0) }));
  }
  if (r.mp) {
    const t = tierFx(id, lvl);
    r.mp = s.mpTier != null ? s.mp + s.mpTier * (lvl - 1) : skillMpCost(s.mp, lvl, who != null ? who : P ? P.lv : 1);
    if (t.mpCost) r.mp = Math.round(r.mp * (1 - t.mpCost / 100));
  }
  return r;
}
// Danh sách mốc tầng của một môn: đã mở thì sáng, chưa tới thì mờ
function tierList(id, lv) {
  const t = SKILLS[id].tiers;
  if (!t) return '';
  return Object.keys(t).map(k => `<div class="ri-tier ${lv >= +k ? 'on' : ''}">${lv >= +k ? '✦' : '·'} Tầng ${k} · <b>${t[k].name}</b>: ${t[k].desc}</div>`).join('');
}
function skillInfo(id, lvl) {
  const s = normSkill(id, lvl);
  if (s.type === 'passive') return statText(passiveStats(id, lvl));
  if (s.type === 'attack') {
    let t = `${Math.round(s.power * 100)}% công`;
    if (s.hitSplit) t = `${t}, chia ${s.hits} đòn ${s.hitSplit.map(x => Math.round(x * 100) + '%').join(' / ')}`;
    else if (s.hits > 1) t = `${s.hits} đòn × ${t}`;
    if (s.critBonus) t += `, +${s.critBonus}% bạo kích`;
    if (s.critDmgUp) t += `, +${s.critDmgUp}% sát thương bạo kích`;
    if (s.noCritRes) t += `, bỏ qua kháng bạo kích`;
    if (s.drain) t += `, hút ${s.drain}% sát thương`;
    if (s.effect) t += `, ${s.effect.chance}% gây ${FX_NAMES[s.effect.type]}`;
    return 'Sát thương ' + t;
  }
  if (s.type === 'heal') return `Hồi ${num(s.value)}% khí huyết tối đa, giải độc`;
  const list = [{ buff: s.buff, value: s.value }, ...(s.also || [])];
  if (s.hpBuff) list.push({ buff: 'hpUp', value: s.hpBuff });
  if (s.reduceBuff) list.push({ buff: 'reduce', value: s.reduceBuff });
  if (s.buff2) list.push(s.buff2);
  return `${list.map(a => `${FX_NAMES[a.buff]} +${num(a.value)}%`).join(', ')} trong ${s.turns} lượt${s.healNow ? `, hồi ngay ${s.healNow}% khí huyết` : ''}`;
}
/* ---------------------------- Chiêu thức (người dùng chốt 2026-11-06) ----------------------------
   Võ học theo chiêu lẻ: 5 ô tự do, 2 Thực chiêu (đánh), 1 Hư chiêu (bị động), 1 Trợ chiêu (hỗ trợ), 1 Nộ chiêu; mỗi ô chọn chiêu
   cùng loại của bộ nào cũng được. BO_VO (data.js) chỉ còn để biết chiêu thuộc bộ nào + điểm riêng của bộ (Tâm Lực, Cuồng Long, Phật Ấn):
   chiêu nào tích / tiêu điểm thì chỉ dùng điểm của bộ mình, Hư chiêu chỉ tăng sức cho chiêu cùng bộ, nên mang đủ một bộ tự nhiên mạnh nhất.
   Học chiêu: gom đủ CHIEU_MANH mảnh (P.manh[id]) rồi ghép. Không còn điều kiện mở chiêu theo tầng.
   P.chieu = { thuc: [id|null, id|null], hu, tro, no }. */
const CHIEU_ROLE = { danh1: 'thuc', danh2: 'thuc', bidong: 'hu', phutro: 'tro', no: 'no' };
const CHIEU_SLOTS = { thuc: 2, hu: 1, tro: 1, no: 1 };
const CHIEU_TAG = { thuc: 'Thực', hu: 'Hư', tro: 'Trợ', no: 'Nộ' };
const CHIEU_NAME = { thuc: 'Thực chiêu', hu: 'Hư chiêu', tro: 'Trợ chiêu', no: 'Nộ chiêu' };
const CHIEU_HINT = { thuc: 'chiêu đánh', hu: 'bị động, luôn có tác dụng', tro: 'hỗ trợ: tăng sức, hồi phục, bảo hộ', no: 'đầy nộ mới thi triển được' };
const CHIEU_MANH = 10; // mảnh để ghép một chiêu (mọi chiêu như nhau; chiêu xịn thì mảnh hiếm rơi)
const emptyChieu = () => ({ thuc: [null, null], hu: null, tro: null, no: null });
const chieuRole = id => {
  const s = SKILLS[id];
  if (s && s.chieu) return s.chieu; // chiêu lẻ không thuộc bộ (vd. Vô Danh Thuẫn: 'tro')
  const B = s && s.bo && BO_VO[s.bo];
  const r = B && Object.keys(B.roles).find(k => B.roles[k] === id);
  return r ? CHIEU_ROLE[r] : null;
};
// Chiêu mang ở 5 ô Chiêu thức (chiêu của bộ võ + chiêu lẻ có trường chieu)
const isChieu = id => !!SKILLS[id] && (!!SKILLS[id].bo || !!SKILLS[id].chieu);
const chieuOf = () => (P && P.chieu) || emptyChieu();
// Các chiêu đang mang (đã học), theo thứ tự ô
// Ô Hư đã bỏ (người dùng chốt 2026-11-07): chỗ của nó trên vòng Xuất chiến là ô Khinh công; Hư chiêu của các bộ không còn mang được
const chieuWorn = () => { const c = chieuOf(); return [...c.thuc, c.tro, c.no].filter(id => id && P.skills[id]); };
// Chiêu đang ở ô Hư có phải bị động của bộ b không: trả về tầng (0 = không)
const huLvOf = b => { const id = chieuOf().hu; return id && P.skills[id] && BO_VO[b] && BO_VO[b].roles.bidong === id ? P.skills[id].lv : 0; };
// Bộ có điểm riêng mà đang mang ít nhất một chiêu
const chieuSets = () => [...new Set(chieuWorn().map(id => SKILLS[id].bo))].filter(b => BO_VO[b] && BO_VO[b].diem);
// Đặt chiêu vào ô (ô Thực: chỗ trống đầu tiên, đầy thì thay ô i); trả về true nếu đã mang
function chieuPut(id, i) {
  const role = chieuRole(id), c = P.chieu || (P.chieu = emptyChieu());
  if (!role || role === 'hu' || !P.skills[id]) return false;
  if (role === 'thuc') {
    if (c.thuc.includes(id)) return true;
    const k = i != null ? i : c.thuc.findIndex(x => !x || !P.skills[x]);
    if (k < 0) return false;
    c.thuc[k] = id;
    return true;
  }
  if (i == null && c[role] && P.skills[c[role]] && c[role] !== id) return false; // tự mang: chỉ khi ô còn trống
  c[role] = id;
  return true;
}
// Chiêu chủ động đang mang; Nộ chiêu chỉ có khi trong trận đã đầy nộ
const boActive = () => { const c = chieuOf(); return [...c.thuc, c.tro, c.no].filter(id => id && P.skills[id] && (!SKILLS[id].no || (combat && !combat.over && combat.pl.no >= BO_NO.max))); };
// Chiêu dùng được trong trận: chiêu của bộ võ đang mang, võ công và công pháp đang mang
function activeSkills() { return [...boActive(), ...P.use.vocong, ...P.use.congphap]; }

function freshPlayer(name, title, sect) {
  return {
    name, title, sect, lv: 1, exp: 0, gold: SECTS[sect].gold || 30, hp: 0, mp: 0,
    skills: {}, use: emptyUse(), chieu: emptyChieu(), manh: {},
    inv: POTION_OFF ? {} : { thuoc_tri_thuong: 3, hoi_khi_dan: 1 },
    // đồ khởi đầu: Mộc Kiếm, Áo Vải, Quần Vải loại Thường bậc 1; các ô khác trống (11 ô, SLOT_NAMES)
    equip: Object.assign(Object.fromEntries(Object.keys(SLOT_NAMES).map(s => [s, null])), { weapon: 'moc_kiem', armor: 'ao_vai', pants: 'quan_vai' }),
    loc: START_LOC, lastTown: START_LOC,
    flags: { loi_moi: true }, kills: {}, wins: 0,
    thap: { best: 0, run: null, v2: true }, // Thí Luyện Tháp: tầng cao nhất đã qua, tầng đang leo (thap.js)
  };
}

/* ---------------------------- Lưu game ----------------------------
   Luôn lưu trong trình duyệt. Khi chạy trên claude.ai thì lưu thêm vào
   tài khoản (bản mới nhất thắng), để chơi tiếp được trên máy khác. */
/* Máy chủ (người dùng chốt 2026-11-04): mỗi máy chủ là một ô lưu riêng, một nhân vật riêng. Chọn ở màn vào game.
   S1 dùng đúng khóa lưu cũ (nhân vật có sẵn nằm ở S1); trên tài khoản mỗi máy chủ một tài liệu save / save_s2 / save_s3. */
const SERVERS = [{ id: 1, name: 'Thanh Vân' }, { id: 2, name: 'Thiên Tuyệt' }, { id: 3, name: 'Thảo Miếu' }];
const SERVER_KEY = 'giang_ho_hanh_server';
let curServer = (() => { try { const n = +localStorage.getItem(SERVER_KEY); return SERVERS.some(s => s.id === n) ? n : 1; } catch (e) { return 1; } })();
const saveKey = (n = curServer) => (n === 1 ? SAVE_KEY : SAVE_KEY + '_s' + n);
const cloudDocName = n => (n === 1 ? 'save' : 'save_s' + n);
const serverLabel = (n = curServer) => `S${n} · ${SERVERS.find(s => s.id === n).name}`;
// cloud.doc / save / pushed: tài liệu của máy chủ đang chọn; cloud.col: thư mục riêng của người chơi; cloud.remote[n]: bản trên tài khoản của từng máy chủ
const cloud = { doc: null, col: null, remote: {}, state: 'off', timer: null, busy: false, save: null, pushed: null };

function readLocal(n = curServer) {
  try {
    const raw = localStorage.getItem(saveKey(n));
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}
function saveGame(silent) {
  if (!P) return;
  P.savedAt = Date.now();
  const json = JSON.stringify(P);
  let ok = false;
  try { localStorage.setItem(saveKey(), json); ok = true; } catch (e) { /* trình duyệt chặn lưu */ }
  if (cloud.doc) {
    cloud.save = json;
    clearTimeout(cloud.timer);
    cloud.timer = setTimeout(pushCloud, 1500);
    ok = true;
  }
  if (!silent) toast(ok ? '[[luu]] Đã lưu game.' : '[[canh_bao]] Không lưu được. Hãy dùng "Xuất mã lưu" trong [[he_thong]] Hệ thống.');
  else if (!ok && !saveGame.warned) {
    saveGame.warned = true;
    toast('[[canh_bao]] Không lưu được trên trình duyệt này. Hãy dùng "Xuất mã lưu" trong [[he_thong]] Hệ thống.');
  }
}
function readSave(n = curServer) {
  const a = readLocal(n);
  let b = null;
  const rs = n === curServer ? cloud.save : cloud.remote[n];
  try { b = rs ? JSON.parse(rs) : null; } catch (e) { b = null; }
  const d = !a ? b : !b ? a : ((b.savedAt || 0) > (a.savedAt || 0) ? b : a);
  return d && SECTS[d.sect] && saveFits(d) ? d : null;
}
// Bản lưu của lối chơi cũ (có cốt truyện) không dùng được nữa: người dùng chốt chơi lại từ đầu
const saveFits = d => !!(d.flags && d.flags.loi_moi);
const oldSaveLeft = () => { const a = readLocal(); return !!a && !saveFits(a); };
// Gửi bản lưu mới nhất lên tài khoản, mỗi lần một bản
async function pushCloud() {
  clearTimeout(cloud.timer);
  if (cloud.busy || !cloud.doc) return;
  cloud.busy = true;
  const doc = cloud.doc, srv = curServer; // đổi máy chủ giữa chừng thì dừng, không ghi nhầm sang tài liệu khác
  while (cloud.doc === doc && cloud.save && cloud.save !== cloud.pushed) {
    const body = cloud.save;
    try {
      await doc.set({ game: body, savedAt: JSON.parse(body).savedAt || 0 });
      cloud.remote[srv] = body;
      if (cloud.doc === doc) cloud.pushed = body;
      cloud.state = 'on';
    } catch (e) {
      if (e && e.code === 'unavailable') cloud.state = 'retry'; // lần lưu sau sẽ thử lại
      else { cloud.state = 'error'; cloud.doc = null; }
      break;
    }
  }
  cloud.busy = false;
}
// Chỗ lưu trên mạng: trên claude.ai dùng tài khoản claude.ai; trên bản GitHub dùng Firebase + đăng nhập Google (game/tai_khoan.js)
async function initCloud() {
  if (window.claude && typeof window.claude.use === 'function') {
    try {
      const [db, user] = await Promise.all([window.claude.use('db'), window.claude.use('user')]);
      if (!db || !user) return;
      const uid = await user.id();
      if (!uid) return;
      await cloudAttach(db.collection('data/users/' + uid));
    } catch (e) {
      cloud.state = 'error';
    }
    return;
  }
  if (typeof fbInit === 'function') fbInit(); // bản GitHub: chờ người chơi đăng nhập Google rồi mới gắn (cloudAttach)
}
// Gắn thư mục lưu của một tài khoản. col.doc(tên) có get() / set() / delete() (claude.ai db hoặc Firestore đều vậy).
// owner (Firebase): tài khoản đã đăng nhập; bản lưu trên máy thuộc tài khoản khác thì thay bằng bản của tài khoản này,
// không đẩy nhân vật của người khác lên. Bản lưu chưa từng gắn tài khoản nào thì gộp vào tài khoản (bản mới hơn thắng).
async function cloudAttach(col, owner) {
  const OWNER_KEY = SAVE_KEY + '_owner';
  let prev = null;
  try { prev = localStorage.getItem(OWNER_KEY); } catch (e) { /* bỏ qua */ }
  const other = !!owner && !!prev && prev !== owner;
  cloud.remote = {};
  // Tải sẵn bản trên tài khoản của cả 3 máy chủ một lần (song song), để đổi máy chủ không phải chờ mạng
  await Promise.all(SERVERS.map(async s => {
    try {
      const sn = await col.doc(cloudDocName(s.id)).get();
      const r = sn.exists ? sn.data() : null;
      if (r && typeof r.game === 'string') cloud.remote[s.id] = r.game;
    } catch (e) { /* máy chủ này đọc lỗi thì thôi */ }
  }));
  for (const s of SERVERS) {
    const r = cloud.remote[s.id], l = readLocal(s.id);
    try {
      if (other) { if (r) localStorage.setItem(saveKey(s.id), r); else localStorage.removeItem(saveKey(s.id)); }
      else if (s.id !== curServer && r && (!l || (l.savedAt || 0) < remoteAt(r))) localStorage.setItem(saveKey(s.id), r);
    } catch (e) { /* bỏ qua */ }
  }
  if (owner) { try { localStorage.setItem(OWNER_KEY, owner); } catch (e) { /* bỏ qua */ } }
  cloud.col = col;
  bindCloud(curServer);
  cloud.state = 'on';
  refreshTitle();
}
// Đăng xuất: thôi lưu lên mạng, bản trên máy giữ nguyên
function cloudDetach() {
  if (cloud.doc && cloud.save !== cloud.pushed) pushCloud();
  clearTimeout(cloud.timer);
  Object.assign(cloud, { doc: null, col: null, remote: {}, state: 'off', save: null, pushed: null });
  refreshTitle();
}
const remoteAt = r => { try { return JSON.parse(r).savedAt || 0; } catch (e) { return 0; } };
// Gắn tài liệu trên tài khoản của máy chủ n (dùng bản đã tải sẵn, không chờ mạng): bản nào mới hơn (máy hay tài khoản) thì thắng
function bindCloud(n) {
  const rs = cloud.remote[n] || null;
  cloud.doc = cloud.col.doc(cloudDocName(n));
  cloud.save = cloud.pushed = rs;
  const local = P || readLocal(n);
  if (local && (!rs || (local.savedAt || 0) > remoteAt(rs))) {
    cloud.save = JSON.stringify(local);
    pushCloud();
  } else if (rs) {
    try { localStorage.setItem(saveKey(n), rs); } catch (e) { /* bỏ qua */ }
  }
}
// Đổi máy chủ ở màn vào game: gửi nốt bản đang chờ của máy chủ cũ (pushCloud giữ đúng tài liệu cũ), rồi chỉ thay tên máy chủ
// và khung nhân vật tại chỗ, không vẽ lại cả màn (vẽ lại làm ảnh, mây, hoa chạy lại từ đầu, trông giật)
function pickServer(n) {
  if (P || !SERVERS.some(s => s.id === n)) return;
  if (n !== curServer) {
    if (cloud.doc && cloud.save !== cloud.pushed) pushCloud();
    curServer = n;
    try { localStorage.setItem(SERVER_KEY, String(n)); } catch (e) { /* chỉ đổi trong lần chơi này */ }
    if (cloud.col) bindCloud(n);
  }
  serverClose();
  refreshTitle();
}
// Cập nhật màn vào game tại chỗ: tên máy chủ trên khung và khung nhân vật
function refreshTitle() {
  if (P || screenKey !== 'title') return;
  const b = document.querySelector('.ts-srv b'), hero = document.querySelector('.ts-hero');
  if (!b || !hero) return renderTitle();
  b.textContent = serverLabel();
  setHtml(hero, heroCard(readSave()));
}// Bảng chọn máy chủ: vẽ ngay trên màn vào game (#ts-srvp), cùng tông giấy ngà + khung tối như khung máy chủ
function serverMenu() {
  const box = el('ts-srvp');
  if (!box) return;
  const rows = SERVERS.map(s => {
    const sv = readSave(s.id), on = s.id === curServer;
    return `<button class="srvp-row${on ? ' on' : ''}" onclick="G.pickServer(${s.id})">
      <i class="ts-srv-dot"></i><div><b>${serverLabel(s.id)}</b><small>${sv ? `${esc(sv.name)} · Cấp ${sv.lv}` : 'Chưa có nhân vật'}</small></div>
      ${on ? '<em class="srvp-cur">Đang chọn</em>' : ''}<em class="ts-srv-st">Mượt</em></button>`;
  }).join('');
  setHtml(box, `<div class="srvp-card">
    <button class="srvp-x" onclick="G.serverClose()" aria-label="Đóng">×</button>
    <div class="srvp-head"><i></i><b>Chọn máy chủ</b><i></i></div>
    <p>Mỗi máy chủ giữ một nhân vật riêng</p>
    <div class="srvp-list">${rows}</div></div>`);
  box.classList.add('show');
}
function serverClose() { const box = el('ts-srvp'); if (box) box.classList.remove('show'); }
document.addEventListener('visibilitychange', () => { if (document.hidden && cloud.save !== cloud.pushed) pushCloud(); });

// Đọc bản lưu (kể cả bản lưu của phiên bản cũ) và chuyển sang dạng mới
function loadPlayer(d) {
  P = Object.assign(freshPlayer(d.name, d.title, d.sect), d);
  delete P.quests; delete P.karma; delete P.monPhai; delete P.tieu; delete P.vt; // cốt truyện cũ, Hiệp Nghĩa / Tà Ác, nhiệm vụ phái, vận tiêu: đã bỏ
  P.thap = Object.assign({ best: 0 }, P.thap); // bản lưu trước khi có Thí Luyện Tháp
  // Tháp làm lại 2026-10-28 (cao thủ, truyền tuyệt học): tiến độ tháp cũ không còn đúng, leo lại từ tầng 1
  if (!P.thap.v2) P.thap = { best: 0, run: null, since: P.thap.since, tries: 0, v2: true };
  if (!LOCATIONS[P.loc]) P.loc = 'lac_ha';
  // Chiêu thức 5 ô (2026-11-06): bộ võ đang mang (P.bo cũ) chuyển thành các chiêu đã học vào ô; mảnh võ
  if (!P.chieu) {
    P.chieu = emptyChieu();
    const bo = P.bo && BO_VO[P.bo] ? [P.bo] : [];
    [...bo, ...Object.keys(BO_VO).filter(b => b !== P.bo)].forEach(b => Object.values(BO_VO[b].roles).forEach(x => { if (P.skills[x]) chieuPut(x); }));
  }
  delete P.bo;
  if (!Array.isArray(P.chieu.thuc)) P.chieu.thuc = [null, null];
  P.chieu.hu = null; // ô Hư đã bỏ (2026-11-07)
  // Chiêu lẻ (không thuộc bộ, có trường chieu, vd. Vô Danh Thuẫn là Trợ chiêu, 2026-11-07): rời ô công pháp, vào ô chiêu nếu trống
  Object.keys(P.skills).filter(id => SKILLS[id] && SKILLS[id].chieu).forEach(id => {
    const was = P.use[SKILLS[id].cat] && P.use[SKILLS[id].cat].includes(id);
    if (P.use[SKILLS[id].cat]) P.use[SKILLS[id].cat] = P.use[SKILLS[id].cat].filter(x => x !== id);
    if (was) chieuPut(id);
  });
  P.manh = P.manh || {};
  if (!LOCATIONS[P.lastTown]) P.lastTown = 'lac_ha';
  // Lối mới: chỉ Thanh Vân Môn có chỗ nghỉ (người dùng chốt 2026-11-06), thua trận về đó
  if (LOCATIONS[P.lastTown].inn == null) P.lastTown = START_LOC;
  // đồ rèn kiểu cũ ("mã#dòng:phẩm") không còn đọc được: đổi về đồ gốc (Thường) cùng bậc
  const gearFix = id => (!id || ITEMS[id] ? id : /[#+]/.test(id) && ITEMS_BASE[id.split(/[#+]/)[0]] ? id.split(/[#+]/)[0] : null);
  for (const id in P.inv) { const f = gearFix(id); if (f && f !== id) P.inv[f] = (P.inv[f] || 0) + P.inv[id]; if (f !== id) delete P.inv[id]; }
  for (const s in P.equip || {}) P.equip[s] = gearFix(P.equip[s]);
  // Bỏ thuốc (POTION_OFF, 2026-11-10): thuốc và đan dược còn trong túi đổi thành bạc theo giá mua
  if (POTION_OFF) {
    let g = 0;
    for (const id in P.inv) if (ITEMS[id] && ITEMS[id].type === 'use') { g += (ITEMS[id].price || 0) * P.inv[id]; delete P.inv[id]; }
    if (g) { P.gold += g; setTimeout(() => toast(`Thuốc và đan dược đã bỏ khỏi giang hồ: đổi thành ${g.toLocaleString('vi-VN')} lượng bạc.`), 600); }
  }
  // trang bị: ô "Trang sức" cũ đổi thành "Nhẫn"; thêm ô Ngọc bội
  const eq = Object.fromEntries(Object.keys(SLOT_NAMES).map(s => [s, null]));
  for (const s in P.equip) {
    const id = P.equip[s];
    if (!id || !ITEMS[id]) continue;
    const slot = ITEMS[id].type;
    if (SLOT_NAMES[slot] && !eq[slot]) eq[slot] = id; else if (SLOT_NAMES[slot]) addItem(id);
  }
  P.equip = eq;
  gangSwap(); // đệ tử đường Chưởng: kiếm đổi thành găng cùng bậc (2026-11-06)
  // võ công: tầng cũ (số) đổi thành { tầng, thành thạo }
  const sk = {};
  for (const id in P.skills) {
    if (!SKILLS[id] || SKILLS[id].quai || SKILLS[id].cut) continue; // võ riêng của quái, võ đã bỏ (SKILL_CUT): gỡ khỏi bản lưu
    const v = P.skills[id];
    sk[id] = typeof v === 'number' ? { lv: clamp(v, 1, skMax(id)), xp: 0 } : { lv: clamp(v.lv || 1, 1, skMax(id)), xp: v.xp || 0 };
  }
  P.skills = sk;
  // võ học mang theo: bản lưu cũ chưa có thì tự mang các môn tốt nhất (ưu tiên môn đang vận hành)
  const oldUse = d.use && typeof d.use === 'object' ? Object.values(d.use).filter(Array.isArray).flat() : null;
  const order = oldUse || [...Object.values(d.passive || {}), ...Object.keys(P.skills).sort((a, b) => skillRank(b) - skillRank(a))];
  P.use = emptyUse();
  order.forEach(id => { if (SKILLS[id] && P.skills[id] && !inUse(id) && slotFree(SKILLS[id].cat)) P.use[SKILLS[id].cat].push(id); });
  delete P.passive;
  delete P.points;
  // Vô Danh Quyền thay đánh thường: ai cũng có, không nằm trong ô mang theo
  if (BASIC_SKILL) {
    if (!P.skills[BASIC_SKILL]) P.skills[BASIC_SKILL] = { lv: 1, xp: 0 };
    for (const c in P.use) P.use[c] = P.use[c].filter(id => !isBasic(id));
    START_SKILLS.forEach(id => { if (SKILLS[id] && !P.skills[id]) giveSkill(id); }); // nhân vật tạo trước khi đổi quà khởi đầu
  }
  fixHpMp();
}
function exportSave() {
  saveGame(true);
  const code = btoa(unescape(encodeURIComponent(JSON.stringify(P))));
  openModal(`<h3>[[xuat]] Mã lưu game</h3>
    <p>Bấm vào ô bên dưới, nhấn <b>Ctrl+A</b> rồi <b>Ctrl+C</b> để sao chép, sau đó dán vào Notepad để cất giữ.
    Khi cần khôi phục, dùng <b>[[nhap]] Nhập mã lưu</b>.</p>
    <textarea class="code" readonly onclick="this.select()">${code}</textarea>`);
}
function importSave() {
  openModal(`<h3>[[nhap]] Nhập mã lưu</h3>
    <p>Dán mã lưu đã xuất trước đó vào ô bên dưới. <b>Lưu ý:</b> dữ liệu hiện tại sẽ bị thay thế.</p>
    <textarea class="code" id="imp-code" placeholder="Dán mã lưu vào đây..."></textarea>
    <div class="row-btns"><button class="btn primary" onclick="G.doImport()">Khôi phục</button></div>`);
}
function doImport() {
  try {
    const d = JSON.parse(decodeURIComponent(escape(atob(el('imp-code').value.trim()))));
    if (!d || !SECTS[d.sect] || !d.name || !saveFits(d)) throw new Error('bad');
    loadPlayer(d);
    saveGame(true);
    closeModalSilent();
    worldLog = [fmt('Đã khôi phục dữ liệu. Chào mừng {title} {name} trở lại!')];
    renderWorld();
  } catch (e) {
    toast('[[canh_bao]] Mã lưu không hợp lệ.');
  }
}

/* ---------------------------- Thanh trạng thái ---------------------------- */
function renderTop() {
  const tb = el('topbar');
  // Trong trận thì ẩn thanh nhân vật trên cùng: bảng thông tin của sân đấu đã có máu, nội lực (người dùng chốt)
  if (!P || combat || screenKey === 'home') { tb.classList.add('hidden'); return; } // trang chủ có thanh trên riêng
  tb.classList.remove('hidden');
  const s = getStats();
  setHtml(tb, `
    <div class="tb-info">
      <span class="tb-icon">${playerAvatar(P.sect, P.title, 'head') || ic(SECTS[P.sect].icon)}</span>
      <div><div class="tb-name">${esc(P.name)}</div>
      <div class="tb-sub">${sectName(P.sect)} · Cấp ${P.lv}</div></div>
    </div>
    <div class="tb-bars">
      ${bar('Khí huyết', P.hp, s.hp, 'hp')}
      ${bar('Nội lực', P.mp, s.mp, 'mp')}
      ${P.lv >= MAX_LV ? bar('Cấp tối đa', 1, 1, 'exp') : bar('Kinh nghiệm', P.exp, expNeed(P.lv), 'exp')}
    </div>
    <div class="tb-gold">[[bac]] ${P.gold}<small>lượng</small></div>`);
}

/* ---------------------------- Màn hình chính ---------------------------- */
function renderTitle(open) {
  P = null;
  combat = null;
  closeModalSilent();
  renderTop();
  snd('music', 'village');
  const sv = readSave();
  // Màn vào game kiểu tranh thủy mặc (người dùng chọn 2026-11-04): hai ảnh nền người dùng tạo bằng Gemini, đã có sẵn tên game
  // "Hiệp Khách Giang Hồ" + con dấu (game/img/title_mobile.jpg dọc; bản ngang title_pc.jpg đã gỡ 2026-11-12 vì chỉ chơi trên điện thoại; gốc ở luu_tru/anh_nen).
  // Chạm một lần thì hiện bảng chọn (lớp .open); mây trôi, cánh hoa rơi chạy bằng CSS khối "Màn vào game" cuối style.css
  const petals = Array.from({ length: 14 }, (_, i) => `<i style="left:${(i * 37 + 11) % 100}%;animation-delay:${-(i * 1.7) % 12}s;animation-duration:${9 + (i % 5) * 1.6}s"></i>`).join('');
  show(`<div class="ts">
    <img class="ts-art mb" src="game/img/title_mobile.jpg" alt="Hiệp Khách Giang Hồ">
    <div class="ts-mist m1"></div><div class="ts-mist m2"></div>
    <div class="ts-petals">${petals}</div>
    <div class="ts-bottom">
    <div class="ts-srv" onclick="G.serverMenu()" role="button" tabindex="0">
      <i class="ts-srv-dot"></i><div><small>Máy chủ</small><b>${serverLabel()}</b></div><em class="ts-srv-st">Mượt</em><span>Đổi ›</span>
    </div>
    <div class="ts-tap" onclick="this.closest('.ts').classList.add('open')" role="button" tabindex="0"><i></i><span>Chạm để bắt đầu</span><i></i></div>
    </div>
    <div class="ts-foot">© Hiệp Khách Giang Hồ · Bản thử nghiệm</div>
    <div class="ts-hero" onclick="if(event.target===this)this.closest('.ts').classList.remove('open')">${heroCard(sv)}</div>
    <div class="ts-srvp" id="ts-srvp" onclick="if(event.target===this)G.serverClose()"></div>
  </div>`, 'title');
  if (open) document.querySelector('.ts').classList.add('open');
}
// Khung nhân vật khi bấm "Chạm để bắt đầu" (người dùng chốt 2026-11-04): hình nhân vật + Vào game + Xóa nhân vật (để chơi lại);
// máy chủ trống thì nút Tạo nhân vật. Cùng tông giấy ngà, chữ bút lông với bảng chọn máy chủ.
function heroCard(sv) {
  const close = `this.closest('.ts').classList.remove('open')`;
  const body = sv ? `
    <div class="hero-ava">${playerAvatar(sv.sect, sv.title, 'body') || ic(SECTS[sv.sect].icon)}</div>
    <div class="hero-name">${esc(sv.name)}</div>
    <div class="hero-sub">${sv.title} · ${sectName(sv.sect)} · Cấp ${sv.lv}</div>
    <div class="hero-btns" id="hero-btns">
      <button class="hero-go" onclick="G.continueGame()">Vào game</button>
      <button class="hero-del" onclick="G.askDelete()">Xóa nhân vật</button>
    </div>` : `
    <div class="hero-ava empty">${playerAvatar(START_SECT, TITLES[0], 'body') || ''}</div>
    <div class="hero-sub">Máy chủ này chưa có nhân vật</div>
    ${oldSaveLeft() ? '<p class="hero-warn">Lối chơi đã đổi mới (bỏ cốt truyện, cấp tối đa 100), nhân vật cũ không dùng được. Hãy bắt đầu hành trình mới.</p>' : ''}
    <div class="hero-btns"><button class="hero-go" onclick="G.renderCreate()">Tạo nhân vật</button></div>`;
  return `<div class="hero-card">
    <button class="srvp-x" onclick="${close}" aria-label="Đóng">×</button>
    <div class="srvp-head"><i></i><b>Nhân vật</b><i></i></div>
    <p>${serverLabel()}</p>${body}
    ${typeof fbLine === 'function' ? fbLine() : ''}
    <div class="hero-links"><button onclick="G.help()">Hướng dẫn chơi</button><span>·</span><button onclick="G.importSave()">Nhập mã lưu</button></div>
  </div>`;
}
// Xóa nhân vật của máy chủ đang chọn: hỏi lại một lần ngay trong khung, xóa cả bản trên máy lẫn trên tài khoản
function askDelete() {
  const sv = readSave(), box = el('hero-btns');
  if (!sv || !box) return;
  setHtml(box, `<p class="hero-warn">Xóa vĩnh viễn <b>${esc(sv.name)}</b> (cấp ${sv.lv})? Nhân vật đã xóa không lấy lại được.</p>
    <button class="hero-del sure" onclick="G.deleteChar()">Xóa hẳn</button>
    <button class="hero-back" onclick="G.refreshTitle()">Thôi, giữ lại</button>`);
}
async function deleteChar() {
  if (P) return;
  if (cloud.doc) {
    clearTimeout(cloud.timer);
    try { await cloud.doc.delete(); } catch (e) { toast('[[canh_bao]] Chưa xóa được bản lưu trên tài khoản, hãy thử lại.'); return; }
    cloud.save = cloud.pushed = null;
    delete cloud.remote[curServer];
  }
  try { localStorage.removeItem(saveKey()); } catch (e) { /* bỏ qua */ }
  toast('Đã xóa nhân vật. Máy chủ ' + serverLabel() + ' giờ trống.');
  refreshTitle();
}

function continueGame() {
  const d = readSave();
  if (!d) return renderTitle();
  loadPlayer(d);
  worldLog = [fmt('Chào mừng {title} {name} trở lại giang hồ!')];
  if (typeof renderHome === 'function') renderHome(); else renderWorld(); // màn chính kiểu game xếp đội (trang_chu.js)
  if (typeof bqCheck === 'function') bqCheck(); // Bế quan: thưởng thời gian vắng mặt (thi_luyen.js)
}

// Tạo nhân vật: chỉ chọn tên và danh xưng. Môn phái sẽ chọn khi bái sư trong cốt truyện.
// Màn tạo nhân vật (người dùng chê màn cũ lệch tông, điện thoại trống phía dưới, 2026-11-04): cùng nền tranh của màn vào game,
// khung giấy ngà như khung nhân vật; hình nhân vật to ở giữa, chọn Nam / Nữ ngay dưới hình, ô tên, nút Bắt đầu hành trình.
function renderCreate() {
  show(`<div class="ts ts-create">
    <img class="ts-art mb" src="game/img/title_mobile.jpg" alt="">
    <div class="ts-mist m1"></div>
    <div class="cr-wrap"><div class="hero-card cr-card">
      <button class="cr-back" onclick="G.renderTitle()" aria-label="Quay lại">‹ Quay lại</button>
      <div class="srvp-head"><i></i><b>Tạo nhân vật</b><i></i></div>
      <p>${serverLabel()}</p>
      <div class="hero-ava cr-ava" id="cr-ava">${playerAvatar(START_SECT, createSel.title, 'body') || ''}</div>
      <div class="cr-gender" role="radiogroup" aria-label="Giới tính">${TITLES.map((t, i) =>
        `<button class="${createSel.title === t ? 'on' : ''}" role="radio" aria-checked="${createSel.title === t}" onclick="G.pickTitle(${i})">${['Nam', 'Nữ'][i]}</button>`).join('')}</div>
      <input class="cr-name" id="inp-name" maxlength="16" placeholder="Nhập tên nhân vật" aria-label="Tên nhân vật" value="${esc(createSel.name)}" oninput="G.setName(this.value)" onkeydown="if(event.key==='Enter')G.startNew()">
      <p class="cr-note">Ngươi khởi đầu ở Thanh Vân Môn. Lên bốn ngọn núi quanh sơn môn luyện công, rồi thi tuyển làm đệ tử ngoại môn.</p>
      <div class="hero-btns"><button class="hero-go" onclick="G.startNew()">Bắt đầu hành trình</button></div>
    </div></div>
  </div>`, 'create');
}
function setName(v) { createSel.name = v; }
// Đổi Nam / Nữ: chỉ thay hình và nút tại chỗ (không vẽ lại cả màn, giữ chữ đang gõ)
function pickTitle(i) {
  createSel.title = TITLES[i];
  const a = el('cr-ava');
  if (!a) return renderCreate();
  setHtml(a, playerAvatar(START_SECT, createSel.title, 'body') || '');
  document.querySelectorAll('.cr-gender button').forEach((b, k) => { b.classList.toggle('on', k === i); b.setAttribute('aria-checked', k === i); });
}

// Màn truyện có tranh (cốt truyện mới, 2026-11-04): TRUYEN[ch] trong data.js, tranh ở game/img/truyen/.
// Máy tính: tranh phủ kín, khung lời kể tối ở dưới. Điện thoại (màn dọc): tranh là khung ngang phía trên, chữ bên dưới, nền là chính tranh đó làm mờ.
// Chỉ bấm nút Tiếp tục (hoặc Enter / Space / mũi tên phải) mới sang trang; Bỏ qua ở góc trên phải.
// Tranh dọc cho điện thoại: chương có `doc: true` thì trên màn dọc dùng game/img/truyen/<img>_doc.jpg, tranh phủ kín màn, khung chữ đè dưới.
let truyenSt = null;
const truyenPhone = () => typeof matchMedia === 'function' && matchMedia('(max-aspect-ratio: 4/5)').matches;
const truyenSrc = img => `game/img/truyen/${img}${truyenSt && truyenSt.doc ? '_doc' : ''}.jpg`;
function truyenText(s) {
  const nu = P && P.title === TITLES[1];
  const w = { be: nu ? 'cô bé' : 'cậu bé', cau: nu ? 'cô' : 'cậu' };
  return esc(s || '').replace(/\{(be|cau|Be|Cau)\}/g, (m, k) => {
    const v = w[k.toLowerCase()];
    return k[0] === k[0].toUpperCase() ? v[0].toUpperCase() + v.slice(1) : v;
  });
}
function playTruyen(ch, done) {
  const T = typeof TRUYEN !== 'undefined' && TRUYEN[ch];
  if (!T) return done && done();
  truyenSt = { ch, i: 0, done, doc: !!T.doc && truyenPhone() };
  T.pages.forEach(p => { const im = new Image(); im.src = truyenSrc(p.img); }); // tải sẵn để chuyển tranh không bị trắng
  if (T.music) snd('music', T.music);
  const p0 = T.pages[0];
  show(`<div class="ts tr${truyenSt.doc ? ' doc' : ''}" id="tr">
    <div class="tr-bg" id="tr-bg" style="background-image:url('${truyenSrc(p0.img)}')"></div>
    <div class="tr-stage"><img class="tr-img on" id="tr-a" src="${truyenSrc(p0.img)}" style="object-position:${(T.focus || {})[p0.img] ?? 50}% 50%" alt=""><img class="tr-img" id="tr-b" alt=""></div>
    <div class="tr-cover" id="tr-cover"><small>${esc(T.title)}</small><b>${esc(T.name)}</b></div>
    <button class="tr-skip" onclick="G.truyenSkip()">Bỏ qua ›</button>
    <div class="tr-box" id="tr-box">
      <div class="tr-tag" id="tr-tag"></div>
      <p class="tr-text" id="tr-text"></p>
      <div class="tr-foot"><span id="tr-num"></span><button class="tr-next" id="tr-next" onclick="G.truyenNext()">Tiếp tục ›</button></div>
    </div>
  </div>`, 'truyen:' + ch);
  truyenShow();
}
function truyenShow() {
  const T = TRUYEN[truyenSt.ch], i = truyenSt.i, p = T.pages[i], last = i === T.pages.length - 1;
  const a = el('tr-a'), b = el('tr-b');
  if (!a) return;
  const cur = a.classList.contains('on') ? a : b, nxt = cur === a ? b : a, src = truyenSrc(p.img);
  const fx = (T.focus || {})[p.img];
  if (!cur.src.endsWith(src)) { // đổi tranh: ảnh mới hiện dần đè lên ảnh cũ
    nxt.src = src; nxt.style.objectPosition = fx != null ? `${fx}% 50%` : ''; nxt.classList.add('on'); cur.classList.remove('on');
    el('tr-bg').style.backgroundImage = `url('${src}')`;
  }
  el('tr').classList.toggle('is-cover', !!p.cover);
  el('tr-tag').textContent = p.who || p.scene || '';
  el('tr-tag').classList.toggle('who', !!p.who);
  const tx = el('tr-text');
  tx.innerHTML = truyenText(p.text);
  tx.classList.toggle('quote', !!p.who);
  tx.classList.remove('in'); void tx.offsetWidth; tx.classList.add('in');
  const n = T.pages.filter(q => !q.cover).length, k = T.pages.slice(0, i + 1).filter(q => !q.cover).length;
  el('tr-num').textContent = p.cover ? '' : `${k} / ${n}`;
  el('tr-next').textContent = p.cover ? 'Bắt đầu ›' : last ? 'Bước vào giang hồ ›' : 'Tiếp tục ›';
}
function truyenNext() {
  if (!truyenSt) return;
  if (truyenSt.i >= TRUYEN[truyenSt.ch].pages.length - 1) return truyenEnd();
  truyenSt.i++;
  truyenShow();
}
function truyenSkip() { if (truyenSt) truyenEnd(); }
function truyenEnd() {
  const st = truyenSt;
  truyenSt = null;
  if (P) { P.flags['truyen_' + st.ch] = true; saveGame(true); }
  if (st.done) st.done();
}
document.addEventListener('keydown', e => {
  if (!truyenSt || e.target.closest && e.target.closest('input, textarea')) return;
  if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight') { e.preventDefault(); truyenNext(); }
});

function startNew(force) {
  const name = createSel.name.trim();
  if (!name) { toast('Hãy nhập tên nhân vật!'); el('inp-name').focus(); return; }
  if (!force && readSave()) {
    modalFns = [() => { closeModalSilent(); startNew(true); }, closeModalSilent];
    openModal(`<h3>[[canh_bao]] Ghi đè dữ liệu cũ?</h3>
      <p>Bắt đầu hành trình mới sẽ <b>xóa</b> nhân vật đã lưu trước đó. Ngươi chắc chắn chứ?</p>
      <div class="row-btns"><button class="btn primary" onclick="G.mfn(0)">Xóa và chơi mới</button><button class="btn" onclick="G.mfn(1)">Hủy</button></div>`);
    return;
  }
  P = freshPlayer(name, createSel.title, START_SECT);
  const s = getStats();
  P.hp = s.hp;
  P.mp = s.mp;
  worldLog = [];
  saveGame(true);
  [BASIC_SKILL, ...START_SKILLS].forEach(id => { if (SKILLS[id]) giveSkill(id); });
  saveGame(true);
  // Chương 1 kể bằng tranh rồi mới vào game: vào Thanh Vân Môn (mã duong_chau)
  playTruyen('c1', () => {
    log(fmt('<b>{name}</b> đặt chân lên <b>Thanh Vân Môn</b>. Bốn ngọn núi quanh sơn môn là nơi luyện công, bắt đầu từ <b>Tiểu Trúc Phong</b>.'));
    if (typeof renderHome === 'function') renderHome(); else renderWorld();
  });
}

/* ---------------------------- Thế giới ---------------------------- */
function canEnter(locId) {
  const L = LOCATIONS[locId], r = L.require;
  return (!r || !!P.flags[r]) && P.lv >= (L.minLv || 0); // minLv: map/thành mở theo cấp (the_gioi.js)
}
function sectAt(locId) { return Object.keys(SECTS).find(k => SECTS[k].home === locId); }
// Địa điểm như hiện tại: khi cờ trong "alt" đã bật thì dùng mô tả, nhân vật, loại... của alt
function locView(locId) {
  const L = LOCATIONS[locId];
  return L.alt && P.flags[L.alt.flag] ? Object.assign({}, L, L.alt) : L;
}
function locTag(locId) {
  const L = locView(locId), sect = sectAt(locId);
  if (sect) return sect === P.sect ? 'Sư môn của ngươi' : 'Môn phái';
  if (L.type === 'ruin') return 'Hoang tàn';
  return L.type === 'town' ? 'An toàn' : 'Nguy hiểm · cấp ' + L.lvRange;
}

function renderWorld() {
  combat = null;
  if (typeof bgPreload === 'function') bgPreload(); // tải nền ảnh chiêu, quái, cảnh (tai_truoc.js)
  // Vùng có tranh bản đồ (VUNG trong ban_do.js, người dùng chốt 2026-11-04): đứng ở thành của vùng thì màn chính là bản đồ vùng
  if (typeof vungHere === 'function' && vungHere()) return renderVung();
  // Nơi luyện cấp có tranh cảnh (VUNG[..].canh): màn chuẩn bị kiểu ảnh mẫu, Khởi hành = thám hiểm (ban_do.js)
  if (typeof canhHere === 'function' && canhHere()) return renderCanh();
  const L = locView(P.loc);
  renderTop();
  if (hasSnd()) SND.music(SND.themeFor(L.bg, L.type));
  worldScreen(L, locActs(L));
}
// Các nút hành động ở một nơi (nhiệm vụ, thám hiểm, tự động, tháp, nhà phái, cửa hàng, nghỉ ngơi);
// dùng cho màn thế giới và thẻ thành trên bản đồ vùng
function locActs(L) {
  let acts = '';
  if (L.type === 'wild') acts += `<button class="btn act fight" onclick="G.explore()">[[giao_chien]] Thám hiểm<small>Tìm quái vật, vật phẩm</small></button>`;
  if (typeof autoButton === 'function') acts += autoButton(); // Tự động luyện công (tu_dong.js)
  // Cấm địa ở thành chưa có bản đồ vùng (vd. Hợp Hoan Phái ở Tiêu Dao); vùng có bản đồ thì vào ở huy hiệu sào huyệt
  const cdHere = typeof cdOfHub === 'function' && !(typeof VUNG !== 'undefined' && VUNG[P.loc]) && cdOfHub(P.loc);
  if (cdHere) acts += cdOpen(cdHere) ? `<button class="btn act boss" onclick="G.camDia('${cdHere}')">[[tu_vong]] ${CAM_DIA[cdHere].name}<small>6 ải · 5 độ khó</small></button>`
    : `<button class="btn act locked">[[khoa]] ${CAM_DIA[cdHere].name}<small>Cần đạt cấp ${CAM_DIA[cdHere].minLv}</small></button>`;
  if (typeof thapButton === 'function') acts += thapButton(); // Thí Luyện Tháp (thap.js)
  (L.shops || []).forEach(id => {
    const sh = SHOPS[id];
    acts += `<button class="btn act ${sh.skills ? 'learn' : ''}" onclick="G.openShop('${id}')">[[${sh.icon}]] ${sh.name}<small>${sh.skills ? 'Học võ công' : 'Mua bán'}</small></button>`;
  });
  if (L.inn != null) {
    acts += `<button class="btn act" onclick="G.rest()">[[nghi_ngoi]] Nghỉ ngơi<small>${L.inn ? L.inn + ' lượng' : 'Miễn phí'} · hồi phục toàn bộ</small></button>`;
  }
  return acts;
}
// Icon menu vẽ tay (menuIc trong ban_do.js); thiếu file đó thì dùng biểu tượng SVG cùng tên
const mIc = n => (typeof menuIc === 'function' ? menuIc(n) : `[[${n}]]`);
// Màn thế giới dạng danh sách (nơi chưa có tranh bản đồ vùng, và các nơi luyện cấp)
function worldScreen(L, acts) {
  const travel = L.links.map(id => {
    const T = LOCATIONS[id], ok = canEnter(id) && canLeave();
    return `<button class="btn act travel ${ok ? '' : 'locked'}" onclick="G.travel('${id}')">[[${T.icon}]] ${T.name}${ok ? '' : ' [[khoa]]'}
      <small>${locTag(id)}</small></button>`;
  }).join('');
  const sect = sectAt(P.loc);
  const tag = sect ? `[[mon_phai]] ${sect === P.sect ? 'Sư môn của ngươi' : 'Môn phái ' + SECTS[sect].name}`
    : L.type === 'ruin' ? '[[lua]] Hoang tàn'
    : L.type === 'town' ? '[[an_toan]] Nơi an toàn' : '[[canh_bao]] Vùng nguy hiểm · Quái cấp ' + L.lvRange;

  show(`<div class="world">
    <div class="scene scene-${L.bg}">
      <div class="scene-icon">[[${L.icon}]]</div>
      <div class="scene-text">
        <h2>${L.name}</h2>
        <div class="scene-tag ${L.type}">${tag}</div>
        <p>${L.desc}</p>
      </div>
    </div>
    <div class="log" id="wlog">${worldLog.map(m => `<div>${m}</div>`).join('') || '<div class="muted">Nhật ký hành trình trống.</div>'}</div>
    ${acts ? `<div class="section-title">Hành động</div>
    <div class="actions">${acts}</div>` : ''}
    <div class="section-title">Đi đến${typeof BAN_DO_G !== 'undefined' ? ` <button class="btn small map-btn" onclick="G.banDo()">[[ban_do]] Bản đồ</button>` : ''}</div>
    <div class="actions">${travel}</div>
    <div class="menubar">
      ${typeof renderHome === 'function' ? `<button onclick="G.home()">${mIc('chinh_dien')}<span>Trang chủ</span></button>` : ''}
      <button onclick="G.menuChar()">${mIc('nhan_vat')}<span>Nhân vật</span></button>
      <button onclick="G.menuInv()">${mIc('hanh_trang')}<span>Hành trang</span></button>
      <button onclick="G.menuSkills()">${mIc('vo_hoc')}<span>Võ học</span></button>
      <button onclick="G.menuQuests()">${mIc('nhiem_vu')}<span>Nhiệm vụ</span></button>
      <button onclick="G.menuSystem()">${mIc('he_thong')}<span>Hệ thống</span></button>
    </div>
  </div>`, 'world:' + P.loc);
  const lg = el('wlog');
  lg.scrollTop = lg.scrollHeight;
}

// Nơi có leaveFlag: chưa có cờ thì không rời đi được (vd. đáy vực khi chưa biết khinh công leo lên)
const canLeave = () => !LOCATIONS[P.loc].leaveFlag || !!P.flags[LOCATIONS[P.loc].leaveFlag];
function travel(id) {
  if (!canLeave()) return toast('[[khoa]] ' + LOCATIONS[P.loc].leaveText);
  if (!canEnter(id)) return toast('[[khoa]] ' + LOCATIONS[id].lockText);
  P.loc = id;
  const L = locView(id);
  if (L.type === 'town' && L.inn != null) P.lastTown = id; // thua trận được đưa về nơi có chỗ nghỉ (lối mới: chỉ Thanh Vân Môn)
  log(`[[la_ban]] Ngươi đi đến <b>${L.name}</b>.`);
  saveGame(true);
  renderWorld();
}

function rest() {
  const L = locView(P.loc), s = getStats();
  if (L.inn == null) return;
  if (P.hp >= s.hp && P.mp >= s.mp) return toast('Ngươi đang sung sức, không cần nghỉ ngơi.');
  if (P.gold < L.inn) return toast('Không đủ bạc để thuê phòng!');
  P.gold -= L.inn;
  P.hp = s.hp;
  P.mp = s.mp;
  log(`[[nghi_ngoi]] Ngươi nghỉ ngơi một đêm, khí huyết và nội lực hồi phục hoàn toàn.${L.inn ? ` (-${L.inn} lượng)` : ''}`);
  snd('sfx', 'heal');
  saveGame(true);
  renderWorld();
}

function explore() {
  const L = LOCATIONS[P.loc];
  snd('sfx', 'step');
  if (L.tg && typeof tgExploreRoll === 'function' && roll(L.fightChance)) return startCombat(tgExploreRoll(P.loc).list); // map: 1–6 quái hoặc Tinh Anh (the_gioi.js)
  if (roll(L.fightChance != null ? L.fightChance : 70)) return startCombat(pickWeighted(L.enemies, x => x[1])[0]);
  const e = pickWeighted(L.events.filter(ev => (!ev.once || !P.flags[ev.once]) && !ev.quest && !ev.kyngo
    && (!ev.notFlag || !P.flags[ev.notFlag])), ev => ev.w);
  let msg = '[[la]] ' + fmt(e.text);
  if (e.once) P.flags[e.once] = true;
  if (e.gold) {
    const g = rand(e.gold[0], e.gold[1]);
    P.gold += g;
    snd('sfx', 'coin');
    msg += ` <span class="gain">+${g} lượng</span>`;
  }
  if (e.item && !(POTION_OFF && ITEMS[e.item].type === 'use')) {
    addItem(e.item, e.count || 1);
    msg += ` <span class="gain">+[[${ITEMS[e.item].icon}]] ${ITEMS[e.item].name}</span>`;
  }
  // Kinh mạch: thám hiểm map không gặp quái cũng có KINH_MACH.thao % hái được Vô Danh Thảo
  if (L.tg && roll(KINH_MACH.thao)) { addItem('vo_danh_thao'); msg += ` <span class="gain">+[[vo_danh_thao]] Vô Danh Thảo</span>`; }
  if (e.heal) {
    const s = getStats();
    P.hp = Math.min(s.hp, P.hp + Math.round(s.hp * e.heal / 100));
    P.mp = Math.min(s.mp, P.mp + Math.round(s.mp * e.heal / 100));
    msg += ' <span class="gain">(hồi phục sức lực)</span>';
  }
  log(msg);
  saveGame(true);
  renderWorld();
}

// Phần thưởng (Trấn Ma Tháp...): kinh nghiệm, bạc, vật phẩm, võ học, thành thạo, cờ; các dòng thông báo thêm vào msgs
function applyReward(r, msgs) {
  if (r.gold) { P.gold += r.gold; msgs.push(`[[bac]] +${r.gold} lượng`); }
  for (const [it, n] of Object.entries(r.items || {})) {
    addItem(it, n);
    msgs.push(`[[nhat_duoc]] Nhận [[${ITEMS[it].icon}]] <b>${ITEMS[it].name}</b>${n > 1 ? ' x' + n : ''}`);
  }
  if (r.prof) {
    msgs.push(`[[vo_hoc]] Mọi võ công đã học +${r.prof} điểm thành thạo`);
    Object.keys(P.skills).forEach(sk => msgs.push(...addProf(sk, r.prof)));
  }
  (r.skills || []).forEach(sk => {
    if (P.skills[sk]) return;
    giveSkill(sk);
    msgs.push(`[[vo_hoc]] Lĩnh ngộ ${SKILL_CATS[SKILLS[sk].cat].toLowerCase()}: <b class="skill">${SKILLS[sk].name}</b>.${usedNote(sk)}`);
  });
  (r.flags || []).forEach(f => { P.flags[f] = true; });
  if (r.exp) {
    const exp = withBonus(r.exp);
    msgs.push(`[[kinh_nghiem]] +${exp} kinh nghiệm`);
    msgs.push(...gainExp(exp));
  }
}

function onKill(enemyId) {
  const msgs = [];
  if (typeof tnOnKill === 'function') msgs.push(...tnOnKill(enemyId)); // Truy Nã Hiệp Khách: thưởng diệt hào kiệt (truy_na.js)
  if (typeof smOnKill === 'function') msgs.push(...smOnKill(enemyId)); // nhiệm vụ sư môn hằng ngày (mon_phai.js)
  return msgs;
}

/* ---------------------------- Hộp thoại nhân vật ---------------------------- */
function dialog(npc, text, buttons) {
  modalFns = buttons.map(b => b.fn);
  openModal(`<div class="dlg">
      <div class="dlg-portrait">[[${npc.icon}]]</div>
      <div class="dlg-body"><div class="dlg-name">${npc.name}</div><div class="dlg-text">${text}</div></div>
    </div>
    <div class="row-btns">${buttons.map((b, i) => `<button class="btn ${i === 0 && buttons.length > 1 ? 'primary' : ''}" onclick="G.mfn(${i})">${b.label}</button>`).join('')}</div>`);
}

/* ---------------------------- Cửa hàng ---------------------------- */
function sellPrice(id) {
  const it = ITEMS[id];
  if (it.type === 'book' || it.type === 'quest') return 0;
  if (GEAR[it.type]) return Math.floor(it.price * FORGE.sellPct / 100); // trang bị bán lại 20% giá
  return it.sell != null ? it.sell : Math.floor((it.price || 0) / 2);
}
function openShop(id) {
  const sh = SHOPS[id];
  // Tiệm chia tab theo ô (the_gioi.js): Tiệm Vũ Khí mở sẵn tab vũ khí đường mình
  const cat = sh && sh.cats ? (sh.cats.some(c => c[0] === 'gang') ? pathWeapon() : sh.cats[0][0]) : null;
  shopState = { id, tab: 'buy', cat };
  renderShop();
}
function shopTab(tab) { shopState.tab = tab; shopState.sel = null; reopen(renderShop); }
function shopCat(cat) { shopState.cat = cat; shopState.sel = null; reopen(renderShop); }
function shopPick(id) { shopState.sel = shopState.sel === id ? null : id; reopen(renderShop); }
// Vũ khí: đường Chưởng dùng găng, đường Côn dùng côn, đường Kiếm và người chưa vào đường dùng kiếm
const weaponOk = it => it.type !== 'weapon' || weaponKind(it) === pathWeapon();
const WEAPON_NAME = { gang: 'găng', con: 'côn', kiem: 'kiếm' };
const PATH_NAME = { gang: 'Chưởng', con: 'Côn', kiem: 'Kiếm' };
const weaponNoText = it => (pathWeapon() !== 'kiem' && weaponKind(it) === 'kiem' ? `Đường ${PATH_NAME[pathWeapon()]} không dùng kiếm` : `Chỉ đệ tử đường ${PATH_NAME[weaponKind(it)]}`);
function renderShop() {
  const sh = SHOPS[shopState.id];
  if (sh.forge) return renderForge(sh);
  // Dạng lưới như Hành trang (người dùng chốt 2026-11-07): ô vuông + giá dưới ô, bấm ô thì khung chi tiết + nút Mua / Bán hiện trên lưới
  const cell = (id, price, n, opts = {}) => { const it = ITEMS[id]; return `<div class="shop-c">
    <button class="inv-t${shopState.sel === id ? ' sel' : ''}${opts.dim ? ' dim' : ''}" type="button" style="${GEAR[it.type] ? `--qc:var(--eq-q${it.q || 1})` : ''}" onclick="G.shopPick('${id}')" aria-label="${it.name}">
      [[${it.icon}]]${it.tier ? `<i class="tier">B${it.tier}</i>` : ''}${n > 1 ? `<i class="n">${n}</i>` : ''}</button>
    <span class="shop-p${opts.poor ? ' poor' : ''}">[[bac]] ${price.toLocaleString('vi-VN')}</span></div>`; };
  const grid = (cells, empty) => (cells ? `<div class="inv-grid shop-grid">${cells}</div>` : `<p class="muted">${empty}</p>`);
  let rows, detail = '', head = '';
  if (shopState.tab === 'buy') {
    // Không ghi quy tắc (tỉ lệ loại đồ...) trên màn tiệm: người dùng chốt 2026-11-06
    // Tiệm Trang Bị Thanh Vân bán đủ 10 bậc (người dùng chốt 2026-11-06: chỉ Thanh Vân có tiệm): hiện mọi bậc đang mặc được
    // Tiệm có tab theo ô (người dùng chốt 2026-11-06): chỉ hiện món của tab đang chọn; vũ khí khác đường xem được, không mua được
    const cat = sh.cats && (sh.cats.find(c => c[0] === shopState.cat) || sh.cats[0]);
    const shown = sh.items.filter(id => {
      const it = ITEMS[id];
      if (cat && !cat[2](it)) return false;
      if (!(GEAR[it.type] && it.tier)) return true;
      return it.tier <= upMaxTier(itLvs(it)); // dạng lưới: hiện mọi bậc đang mặc được, từ B1 (người dùng chốt 2026-11-07; trước chỉ 2 bậc cao nhất)
    });
    const catTabs = sh.cats ? tabsHtml(sh.cats.map(c => [c[0], c[1]]), cat[0], 'shopCat') : '';
    head = catTabs;
    rows = grid(shown.map(id => cell(id, ITEMS[id].price, 0, { dim: !weaponOk(ITEMS[id]), poor: P.gold < ITEMS[id].price })).join(''), 'Chưa có hàng.');
    const id = shopState.sel;
    if (id && shown.includes(id)) {
      const it = ITEMS[id];
      const btn = !weaponOk(it) ? `<span class="tag soft">${weaponNoText(it)}</span>`
        : `<button class="btn primary" ${P.gold >= it.price ? '' : 'disabled'} onclick="G.buy('${id}')">Mua · ${it.price.toLocaleString('vi-VN')} [[bac]]</button>`;
      detail = `<div class="inv-d">${itemRow(id, '', invCount(id) ? `Đang có: ${invCount(id)}` : '')}<div class="btn-row">${btn}</div></div>`;
    } else shopState.sel = null;
  } else {
    const ids = Object.keys(P.inv).filter(id => P.inv[id] > 0 && sellPrice(id) > 0).sort((a, b) => byType(a, b) || (ITEMS[b].tier || 0) - (ITEMS[a].tier || 0));
    rows = grid(ids.map(id => cell(id, sellPrice(id), P.inv[id])).join(''), 'Không có gì để bán. (Đồ đang mặc phải tháo ra mới bán được.)');
    const id = shopState.sel;
    if (id && ids.includes(id)) detail = `<div class="inv-d">${itemRow(id, '', `x${P.inv[id]}`)}<div class="btn-row"><button class="btn primary" onclick="G.sell('${id}')">Bán · ${sellPrice(id).toLocaleString('vi-VN')} [[bac]]</button></div></div>`;
    else shopState.sel = null;
  }
  openModal(`<h3>[[${sh.icon}]] ${sh.name}</h3>
    ${tabsHtml([['buy', 'Mua'], ['sell', 'Bán']], shopState.tab, 'shopTab')}
    <p class="muted">[[bac]] Ngươi đang có <b>${P.gold.toLocaleString('vi-VN')}</b> lượng bạc.</p>
    ${head}${detail}${rows}`);
}
/* ---------------------------- Thợ Rèn ----------------------------
   Người dùng chốt 2026-10-28: chỉ còn nâng bậc (đổi dòng phụ đã bỏ): giữ loại đồ + các dòng phụ, chỉ tính lại số theo bậc mới,
   giá = FORGE.upMult (2) × giá món ở bậc sẽ nâng lên, luôn thành công.
   where = 'eq' (đồ đang mặc, key = ô) hoặc 'inv' (đồ trong hành trang, key = mã đồ) */
const gearBase = id => ITEMS[id].base || id;
const rollQuality = () => pickWeighted([1, 2, 3], q => GEAR_QUALITY[q - 1].w);
const rollLine = slot => GEAR[slot].pool[rand(0, GEAR[slot].pool.length - 1)];
// Đồ mới mua: bốc loại (60 / 30 / 10%) rồi bốc dòng phụ theo loại
function rollGear(baseId) {
  const slot = ITEMS_BASE[baseId].type, q = rollQuality();
  return gearId(baseId, q, Array.from({ length: GEAR_QUALITY[q - 1].lines }, () => rollLine(slot)));
}
/* Quái ngoài map rơi trang bị (người dùng chốt 2026-11-10): tính theo trận, trận thường 15%, có Tinh Anh 50%;
   loại đồ như mua ở tiệm (60 / 30 / 10%); bậc theo cấp quái (cấp 1–10 bậc 1, 11–20 bậc 2...);
   ô ngẫu nhiên trong 11 ô, vũ khí bốc ngẫu nhiên cả găng / kiếm / côn (không theo đường võ) */
const MAP_DROP = { chance: 15, elite: 50 };
function mapLoot(lv) {
  const want = WEAPON_LV.filter(x => x <= lv).length;
  const slots = Object.keys(GEAR), slot = slots[rand(0, slots.length - 1)];
  let base;
  if (slot === 'weapon') {
    const kinds = Object.keys(WEAPON_LINES), line = WEAPON_LINES[kinds[rand(0, kinds.length - 1)]];
    base = line.ids[Math.min(want, line.ids.length) - 1][0];
  } else base = gearSlotId(slot, Math.min(want, GEAR[slot].ids.length));
  const id = rollGear(base);
  addItem(id);
  return id;
}
const upCost = it => (it.tier < itLvs(it).length ? GEAR_PRICE_X[it.tier] * FORGE.upMult : 0);
// Bậc cao nhất được nâng tới = bậc cao nhất nhân vật đang đủ cấp mặc (lvs: mốc cấp của dòng đồ, găng khác đồ thường)
const upMaxTier = (lvs = GEAR_LV) => lvs.filter(l => P.lv >= l).length;
// Đệ tử đường Chưởng dùng găng làm vũ khí (người dùng chốt 2026-11-06)
const gangPath = () => !!(P && P.tv && P.tv.path === GANG.path);
// Dòng vũ khí của nhân vật theo đường võ đã bái (gang / con / kiem)
const pathWeapon = () => (gangPath() ? 'gang' : P && P.tv && P.tv.path === CON.path ? 'con' : 'kiem');
// Đường Chưởng / Côn: kiếm đang mặc / trong hành trang đổi thành găng / côn cùng bậc, giữ loại đồ + dòng phụ
// (giữ tên gangSwap vì loadPlayer, tvTeach, bot gọi tên này)
function gangSwap() {
  const kind = pathWeapon();
  if (kind === 'kiem') return 0;
  const line = WEAPON_LINES[kind];
  let n = 0;
  const swap = id => { const it = ITEMS[id]; if (!it || it.type !== 'weapon' || weaponKind(it) === kind || !line.ids[it.tier - 1]) return null; n++; return gearId(line.ids[it.tier - 1][0], it.q || 1, it.lines || [], it.plus, it.star); };
  const w = P.equip.weapon && swap(P.equip.weapon);
  if (w) P.equip.weapon = w;
  Object.keys(P.inv).forEach(id => { const g = swap(id); if (g) { const c = P.inv[id]; delete P.inv[id]; P.inv[g] = (P.inv[g] || 0) + c; } });
  if (n) log(`[[vo_hoc]] Đệ tử đường ${PATH_NAME[kind]} không dùng kiếm: binh khí của ngươi được đổi thành ${WEAPON_NAME[kind]} cùng bậc.`);
  return n;
}
const QUAL_CLASS = ['', 'q-thuong', 'q-hiem', 'q-cuc'];
function forgeGet(where, key) { return where === 'eq' ? P.equip[key] : (invCount(key) ? key : null); }
function forgeSet(where, key, oldId, newId) {
  if (where === 'eq') P.equip[key] = newId;
  else { removeItem(oldId); addItem(newId); }
  fixHpMp();
}
// Lò Rèn có 2 tab: Nâng bậc / Cường hóa (người dùng chốt 2026-11-08)
let forgeTab = 'ch', forgeSel = null, forgeNote = '';
function forgeTabSet(t) { forgeTab = t; forgeNote = ''; reopen(renderShop); }
function forgePick(where, key) { forgeSel = forgeSel && forgeSel.where === where && forgeSel.key === key ? null : { where, key }; forgeNote = ''; reopen(renderShop); }
const chCost = it => CUONG_HOA.gold[it.plus || 0] || 0;
const chRate = it => CUONG_HOA.rate[it.plus || 0] || 0;
function renderForge(sh) {
  const tabs = tabsHtml([['ch', '[[tho_ren]] Cường hóa'], ['up', '[[thu_the]] Nâng bậc']], forgeTab, 'forgeTabSet');
  const gold = `<p class="muted">[[bac]] Ngươi đang có <b>${P.gold.toLocaleString('vi-VN')}</b> lượng bạc.</p>`;
  if (forgeTab === 'ch') return openModal(`<h3>[[${sh.icon}]] ${sh.name}</h3>${tabs}${gold}${chPanel()}`);
  const block = (where, key, id) => {
    const it = ITEMS[id];
    const L = itLvs(it);
    const up = it.tier >= L.length ? '<span class="tag on">Bậc cao nhất</span>'
      : it.tier >= upMaxTier(L) ? `<span class="tag">Bậc ${it.tier + 1} cần cấp ${L[it.tier]}</span>`
      : `<button class="btn small primary" ${P.gold >= upCost(it) ? '' : 'disabled'} onclick="G.forgeUp('${where}','${key}')">Nâng lên bậc ${it.tier + 1} · ${upCost(it)} [[bac]]</button>`;
    return `<div class="forge-item">${itemRow(id, up, where === 'eq' ? 'Đang mặc' : `x${P.inv[id]}`)}</div>`;
  };
  const worn = Object.keys(SLOT_NAMES).filter(s => P.equip[s]).map(s => block('eq', s, P.equip[s])).join('');
  const bag = Object.keys(P.inv).filter(id => SLOT_NAMES[ITEMS[id].type]).sort(byType).map(id => block('inv', id, id)).join('');
  openModal(`<h3>[[${sh.icon}]] ${sh.name}</h3>${tabs}${gold}
    ${worn ? `<h4>Đang mặc</h4>${worn}` : ''}${bag ? `<h4>Trong hành trang</h4>${bag}` : ''}
    ${worn || bag ? '' : '<p class="muted">Ngươi chưa có trang bị nào để rèn.</p>'}`);
}
// Tab Cường hóa: lưới đồ (đang mặc trước, rồi hành trang), bấm ô thì khung chi tiết: chỉ số trước → sau, tỉ lệ, giá, nút Cường Hóa
function chPanel() {
  const tile = (where, key, id) => { const it = ITEMS[id], on = forgeSel && forgeSel.where === where && forgeSel.key === key;
    return `<button class="inv-t${on ? ' sel' : ''}" type="button" style="--qc:var(--eq-q${it.q || 1})" onclick="G.forgePick('${where}','${key}')" aria-label="${it.name}">
      [[${it.icon}]]<i class="tier">B${it.tier}</i>${it.plus ? `<i class="plus">+${it.plus}</i>` : ''}${starHtml(it.star)}${where === 'eq' ? '<i class="mk">Mặc</i>' : ''}</button>`; };
  const worn = Object.keys(SLOT_NAMES).filter(s => P.equip[s]).map(s => tile('eq', s, P.equip[s])).join('');
  const bag = Object.keys(P.inv).filter(id => SLOT_NAMES[ITEMS[id].type]).sort(byType).map(id => tile('inv', id, id)).join('');
  if (!worn && !bag) return '<p class="muted">Ngươi chưa có trang bị nào để cường hóa.</p>';
  let detail = '';
  const id = forgeSel && forgeGet(forgeSel.where, forgeSel.key);
  if (!id) forgeSel = null;
  else {
    const it = ITEMS[id], p = it.plus || 0, top = p >= CUONG_HOA.max;
    const now = gearMain(it), next = top ? null : gearMain(it, p + 1);
    const rows = now.map(([k, v], i) => `<div class="ch-st"><span>${STAT_NAMES[k]}</span><b>${num(v)}</b>${next ? ` ➜ <b class="up">${num(next[i][1])}</b>` : ''}</div>`).join('');
    const cost = chCost(it);
    detail = `<div class="inv-d ch-d">${itemRow(id, '', forgeSel.where === 'eq' ? 'Đang mặc' : '')}
      <div class="ch-lv"><b>+${p}</b>${top ? '' : ` ➜ <b class="up">+${p + 1}</b>`}</div>${rows}
      ${top ? '<div class="ch-top">Đã cường hóa tối đa</div>'
        : `<div class="ch-info"><span>Tỉ lệ <b>${chRate(it)}%</b></span><span>[[bac]] <b class="${P.gold < cost ? 'poor' : ''}">${cost.toLocaleString('vi-VN')}</b></span></div>
           <div class="row-btns"><button class="btn primary" ${P.gold >= cost ? '' : 'disabled'} onclick="G.cuongHoa()">Cường Hóa</button></div>`}
      ${forgeNote ? `<div class="ch-note">${forgeNote}</div>` : ''}</div>`;
  }
  return `${detail}${worn ? `<h4>Đang mặc</h4><div class="inv-grid">${worn}</div>` : ''}${bag ? `<h4>Trong hành trang</h4><div class="inv-grid">${bag}</div>` : ''}`;
}
function cuongHoa() {
  if (!forgeSel) return;
  const { where, key } = forgeSel, id = forgeGet(where, key);
  if (!id) return;
  const it = ITEMS[id], p = it.plus || 0;
  if (p >= CUONG_HOA.max) return;
  const cost = chCost(it);
  if (P.gold < cost) return toast('Không đủ bạc!');
  P.gold -= cost;
  if (rand(1, 100) <= chRate(it)) {
    const nid = gearId(it.base || id, it.q || 1, it.lines || [], p + 1);
    forgeSet(where, key, id, nid);
    if (where === 'inv') forgeSel = { where, key: nid };
    forgeNote = `<b class="up">Thành công!</b> ${ITEMS[nid].name}`;
    log(`[[tho_ren]] Cường hóa thành công: <b>${ITEMS[nid].name}</b>.`);
    snd('sfx', 'levelup');
  } else {
    forgeNote = `<b class="down">Thất bại.</b> Mất ${cost.toLocaleString('vi-VN')} lượng bạc, giữ nguyên +${p}.`;
    snd('sfx', 'miss');
  }
  saveGame(true);
  renderTop();
  reopen(renderShop);
}
function forgeUp(where, key) {
  const id = forgeGet(where, key);
  if (!id) return;
  const it = ITEMS[id];
  const L = itLvs(it);
  if (it.tier >= L.length) return;
  if (it.tier >= upMaxTier(L)) return toast(`Bậc ${it.tier + 1} cần cấp ${L[it.tier]}, ngươi chưa đủ cấp.`);
  const cost = upCost(it);
  if (P.gold < cost) return toast('Không đủ bạc!');
  P.gold -= cost;
  const nid = gearId(gearLineId(it, it.tier + 1), it.q || 1, it.lines || [], it.plus, it.star); // giữ cấp cường hóa và sao
  forgeSet(where, key, id, nid);
  snd('sfx', 'coin');
  toast(`[[tho_ren]] Nâng bậc thành công: <b class="${QUAL_CLASS[it.q || 1]}">${ITEMS[nid].name}</b> (bậc ${it.tier + 1}).`);
  saveGame(true);
  renderTop();
  reopen(renderShop);
}
function buy(id) {
  const it = ITEMS[id];
  if (!weaponOk(it)) return toast(weaponNoText(it) + '.');
  if (P.gold < it.price) return toast('Không đủ bạc!');
  P.gold -= it.price;
  const isGear = SLOT_NAMES[it.type];
  const got = isGear ? rollGear(id) : id; // trang bị: mua xong mới biết ra loại gì
  addItem(got);
  snd('sfx', 'coin');
  const g = ITEMS[got];
  toast(`Đã mua [[${g.icon}]] <b class="${isGear ? QUAL_CLASS[g.q || 1] : ''}">${g.name}</b>${isGear ? ` · ${GEAR_QUALITY[(g.q || 1) - 1].name}` : ''}.${isGear ? (P.lv < (g.lv || 0) ? ` Cần đạt cấp ${g.lv} mới mặc được.` : ' Vào [[nhan_vat]] Nhân vật → Trang bị để mặc.') : ''}`);
  saveGame(true);
  renderTop();
  reopen(renderShop);
}function sell(id) {
  if (!invCount(id)) return;
  const price = sellPrice(id);
  removeItem(id);
  P.gold += price;
  snd('sfx', 'coin');
  toast(`Đã bán ${ITEMS[id].name}, nhận ${price} lượng.`);
  saveGame(true);
  renderTop();
  reopen(renderShop);
}

/* ---------------------------- Menu ---------------------------- */
function byType(a, b) { return TYPE_ORDER[ITEMS[a].type] - TYPE_ORDER[ITEMS[b].type]; }
// Trang bị: dòng cơ bản (đã nhân theo loại), rồi từng dòng phụ
const statPlus = (k, v) => `${STAT_NAMES[k]} +${num(v)}${PCT_STATS[k] ? '%' : ''}`;
// Sao của đồ cấm địa: hàng sao vàng nhỏ vẽ bằng CSS (không dùng ký tự sao vì bị tính là emoji)
const starHtml = n => (n > 0 ? `<i class="stars">${'<b></b>'.repeat(n)}</i>` : '');
function gearMain(it, plus) {
  const q = GEAR_QUALITY[(it.q || 1) - 1], m = CUONG_HOA.mul[plus == null ? it.plus || 0 : plus];
  return Object.entries(GEAR[it.type].base).map(([k, v]) => [k, Math.round(v[it.tier - 1] * q.mul * starMul(it.star) * m)]);
}
function gearText(it) {
  const head = gearMain(it).map(([k, v]) => statPlus(k, v)).join(', ');
  const lines = (it.lines || []).map(k => `<span class="gl">${statPlus(k, gearLineVal(k, it.tier))}</span>`);
  return [head, ...lines].join(' · ');
}
function itemDesc(it) {
  const parts = [];
  if (it.stats && GEAR[it.type] && it.tier) parts.push(gearText(it));
  else if (it.stats) parts.push(statText(it.stats));
  if (it.heal) parts.push(`Hồi ${it.heal} khí huyết`);
  if (it.mp) parts.push(`Hồi ${it.mp} nội lực`);
  if (it.cure) parts.push('Giải độc');
  if (it.regen) parts.push(`Trong trận: mỗi lượt hồi ${it.regen.hp}% khí huyết và ${it.regen.mp}% nội lực tối đa, trong ${it.regen.turns} lượt`);
  if (it.skill) parts.push(`Lĩnh ngộ: ${SKILLS[it.skill].name} — ${SKILLS[it.skill].desc}`);
  if (it.desc) parts.push(it.desc);
  return parts.join(' · ');
}
function itemRow(id, btns, extra) {
  const it = ITEMS[id];
  const slot = SLOT_NAMES[it.type];
  const n = (it.lines || []).length;
  const lvTag = it.tier ? ` <span class="tag ${P.lv < it.lv ? 'warn' : 'soft'}">Bậc ${it.tier} · Cấp ${it.lv}</span>`
    : it.lv > 1 ? ` <span class="tag ${P.lv < it.lv ? 'warn' : 'soft'}">Cấp ${it.lv}</span>` : '';
  return `<div class="row-item">
    <div class="ri-icon">[[${it.icon}]]</div>
    <div class="ri-main">
      <div class="ri-name"><span class="${GEAR[it.type] ? QUAL_CLASS[it.q || 1] : ''}">${it.name}</span>${n ? ` <span class="glines">${'✦'.repeat(n)}</span>` : ''}${slot ? ` <span class="tag">${slot}</span>` : ''}${GEAR[it.type] && it.q > 1 ? ` <span class="tag ${QUAL_CLASS[it.q]}">${GEAR_QUALITY[it.q - 1].name}</span>` : ''}${lvTag}${extra ? ` <span class="tag soft">${extra}</span>` : ''}</div>
      <div class="ri-desc">${itemDesc(it)}</div>
    </div>
    <div class="ri-btns">${btns || ''}</div>
  </div>`;
}

function menuChar(tab) {
  if (tab) charTab = tab;
  if (!tab || charTab !== 'gear') eqSel = null; // mở lại từ menu hoặc sang tab khác: đóng bảng chi tiết đồ
  const s = getStats();
  let body;
  if (charTab === 'stats') {
    body = STAT_GROUPS.map(([title, keys]) => `<h4>${title}</h4><div class="stats-grid">${keys.map(k => {
      const v = k === 'hp' ? `${P.hp} / ${s.hp}` : k === 'mp' ? `${P.mp} / ${s.mp}` : s[k] + (PCT_STATS[k] ? '%' : '');
      return `<div class="stat" title="${STAT_HINTS[k] || ''}"><span>${STAT_NAMES[k]}</span><b>${v}</b></div>`;
    }).join('')}</div>`).join('');
    const used = Object.keys(SKILL_CATS).map(c => `${SKILL_CATS[c]}: ${P.use[c].length ? P.use[c].map(id => `<b>${SKILLS[id].name}</b> (tầng ${P.skills[id].lv})`).join(', ') : '<i>chưa mang</i>'}`).join('<br>');
    body += `<h4>Võ học đang mang</h4><p class="muted">${used}</p><p class="muted">Đã chiến thắng ${P.wins} trận.</p>`;
  } else if (charTab === 'km') body = kmPanel();
  else body = eqDollHtml();
  openModal(`<h3><span class="h-ava">${playerAvatar(P.sect, P.title, 'head') || ic(SECTS[P.sect].icon)}</span> ${esc(P.name)}</h3>
    ${tabsHtml([['stats', '[[chi_so]] Chỉ số'], ['gear', '[[thu_the]] Trang bị'], ['km', '[[nhan_sam]] Kinh mạch']], charTab, 'menuChar')}
    ${body}`);
}

/* ---------------- Màn Trang bị (người dùng duyệt qua web/mau_trang_bi.html, 2026-10-28) ----------------
   Nhân vật ở giữa, 11 ô bày quanh: trái 4, phải 4, dưới 3 (EQ_LAYOUT). Khung ô theo loại đồ (trắng / tím / vàng), không ghi chữ loại;
   nhãn bậc nhỏ ở góc trên phải. Bấm ô mở bảng trượt từ dưới: chi tiết, nút "Tháo" nhỏ góc trên phải, đồ cùng loại trong hành trang. */
let eqSel = null;
const eqStatLabel = slot => Object.keys(GEAR[slot].base).map(k => STAT_NAMES[k]).join(', ');
function eqSlotHtml(slot) {
  const id = P.equip[slot], it = id && ITEMS[id];
  return `<button class="eqs${it ? '' : ' empty'}${eqSel === slot ? ' sel' : ''}" style="${it ? `--qc:var(--eq-q${it.q || 1})` : ''}" onclick="G.eqPick('${slot}')" aria-label="${SLOT_NAMES[slot]}${it ? ': ' + it.name : ', chưa mặc'}">
    <span class="box">[[${it ? it.icon : SLOT_ICONS[slot]}]]${it ? `<span class="tier">B${it.tier}</span>` : ''}${it && it.plus ? `<span class="plus">+${it.plus}</span>` : ''}${starHtml(it && it.star)}</span>
    <span class="nm">${SLOT_NAMES[slot]}<small>${eqStatLabel(slot)}</small></span></button>`;
}
function eqLines(it) {
  return `<div class="eq-lines">${gearMain(it).map(([k, v]) => `<div class="base">${statPlus(k, v)}</div>`).join('')}
    ${(it.lines || []).map(k => `<div class="sub">${statPlus(k, gearLineVal(k, it.tier))}</div>`).join('')}</div>`;
}
function eqSheetHtml(slot) {
  const id = P.equip[slot], it = id && ITEMS[id];
  const box = (x, icon) => `<span class="eqs${x ? '' : ' empty'}"><span class="box" style="${x ? `--qc:var(--eq-q${x.q || 1})` : ''}">[[${icon}]]${x ? `<span class="tier">B${x.tier}</span>` : ''}${x && x.plus ? `<span class="plus">+${x.plus}</span>` : ''}${starHtml(x && x.star)}</span></span>`;
  const head = it ? `<div class="eq-head">${box(it, it.icon)}
      <div><h3 class="${QUAL_CLASS[it.q || 1]}">${it.name}</h3><p>${SLOT_NAMES[slot]} · <b class="${QUAL_CLASS[it.q || 1]}">${GEAR_QUALITY[(it.q || 1) - 1].name}</b> · Yêu cầu cấp ${it.lv}</p></div>
      <button class="eq-off" onclick="G.unequip('${slot}')">Tháo</button></div>${eqLines(it)}`
    : `<div class="eq-head">${box(null, SLOT_ICONS[slot])}<div><h3>${SLOT_NAMES[slot]}</h3><p>Chưa mặc. Chỉ số chính: ${eqStatLabel(slot)}.</p></div></div>`;
  const main = x => gearMain(x)[0][1];
  const bag = Object.keys(P.inv).filter(x => ITEMS[x].type === slot).sort((a, b) => ITEMS[b].tier - ITEMS[a].tier || (ITEMS[b].q || 1) - (ITEMS[a].q || 1));
  const cand = bag.length ? `<h4>Trong hành trang (${bag.length})</h4>${bag.map(x => {
      const c = ITEMS[x], d = main(c) - (it ? main(it) : 0), ok = P.lv >= c.lv;
      return `<div class="eq-row"><span class="box" style="--qc:var(--eq-q${c.q || 1})">[[${c.icon}]]</span>
        <div class="t"><span class="${QUAL_CLASS[c.q || 1]}">${c.name}</span> · B${c.tier}${P.inv[x] > 1 ? ` · x${P.inv[x]}` : ''}<small>${gearMain(c).map(([k, v]) => statPlus(k, v)).join(', ')} <span class="${d >= 0 ? 'up' : 'down'}">(${d >= 0 ? '+' : ''}${d})</span>${(c.lines || []).length ? ` · ${c.lines.length} dòng phụ` : ''}${ok ? '' : ` · cần cấp ${c.lv}`}</small></div>
        <button class="btn small${ok ? ' primary' : ''}" ${ok ? '' : 'disabled'} onclick="G.equip('${x}','char')">${ok ? 'Mặc' : 'Chưa đủ cấp'}</button></div>`;
    }).join('')}` : `<p class="muted">Hành trang không có ${SLOT_NAMES[slot].toLowerCase()} nào khác. Mua ở Tiệm Trang Bị trong các thành.</p>`;
  return `<div class="eq-shade" onclick="G.eqClose()"></div><aside class="eq-sheet"><div class="grab"></div>${head}${cand}</aside>`;
}
// Ảnh toàn thân cao nhất có thể (ảnh vẽ sẵn thì dùng thẳng ảnh, không qua khung 240×320 có lề)
function eqAvatar() {
  const m = typeof avatarImgOf === 'function' && avatarImgOf(P.sect, P.title);
  return m ? `<img src="${m.src}.png" alt="">` : playerAvatar(P.sect, P.title, 'body') || ic(SECTS[P.sect].icon);
}
function eqDollHtml() {
  const tot = {};
  Object.values(P.equip).forEach(id => { if (id) addStats(tot, ITEMS[id].stats); });
  const chips = Object.entries(tot).filter(([, v]) => v).map(([k, v]) => `<span class="chip">${STAT_NAMES[k]} <b>+${num(Math.round(v * 10) / 10)}${PCT_STATS[k] ? '%' : ''}</b></span>`).join('');
  const col = side => EQ_LAYOUT[side].map(eqSlotHtml).join('');
  return `<section class="eqd">
      <div class="eqd-grid"><div class="eqd-col">${col('L')}</div>
        <div class="eqd-hero"><div class="ring"></div><div class="ava">${eqAvatar()}</div><span class="lv">${esc(P.name)} · Cấp ${P.lv}</span></div>
        <div class="eqd-col">${col('R')}</div></div>
      <div class="eqd-bot">${col('B')}</div></section>
    <div class="eq-sum"><h4>Trang bị cộng thêm</h4><div class="chips">${chips || '<span class="muted">Chưa mặc gì.</span>'}</div></div>
    ${eqSel ? eqSheetHtml(eqSel) : ''}`;
}
function eqPick(slot) { eqSel = slot; reopen(() => menuChar('gear')); }
function eqClose() { eqSel = null; reopen(() => menuChar('gear')); }
/* Hành trang dạng lưới ô, chia tab Trang bị / Dược phẩm / Võ học (+ Khác nếu có) (người dùng chốt 2026-11-06).
   Bấm ô: khung chi tiết hiện trên lưới, kèm nút Mặc vào / Dùng / Lĩnh ngộ / Ghép. Tab Võ học có cả mảnh võ (P.manh). */
let invTab = 'gear', invSel = null;
const invKind = id => { const t = ITEMS[id].type; return SLOT_NAMES[t] ? 'gear' : t === 'use' ? 'thuoc' : t === 'book' || /^(manh_noi|manh_vo)/.test(id) ? 'vo' : 'khac'; };
const INV_TABS = [['gear', 'Trang bị'], ['thuoc', 'Dược phẩm'], ['vo', 'Võ học'], ['khac', 'Khác']];
function menuInv(tab, sel) {
  if (tab) { if (tab !== invTab) invSel = null; invTab = tab; }
  if (sel !== undefined) invSel = sel;
  if (tab || sel !== undefined) invQs = 0;
  const ids = Object.keys(P.inv).filter(id => P.inv[id] > 0 && ITEMS[id]);
  const manh = Object.keys(P.manh || {}).filter(id => P.manh[id] > 0 && SKILLS[id]);
  const count = k => ids.filter(id => invKind(id) === k).length + (k === 'vo' ? manh.length : 0);
  const tabs = INV_TABS.filter(([k]) => (k !== 'khac' && !(k === 'thuoc' && POTION_OFF)) || count(k));
  if (!tabs.some(([k]) => k === invTab)) invTab = 'gear';
  const list = ids.filter(id => invKind(id) === invTab).sort((a, b) => byType(a, b) || (ITEMS[b].tier || 0) - (ITEMS[a].tier || 0) || (ITEMS[b].q || 1) - (ITEMS[a].q || 1));
  const tile = (key, icon, n, opts = {}) => `<button class="inv-t${invSel === key ? ' sel' : ''}${opts.dim ? ' dim' : ''}" type="button" style="${opts.qc ? `--qc:${opts.qc}` : ''}" onclick="G.menuInv(null,'${key}')" aria-label="${opts.name}">
    ${icon}${opts.tier ? `<i class="tier">B${opts.tier}</i>` : ''}${opts.plus ? `<i class="plus">+${opts.plus}</i>` : ''}${starHtml(opts.star)}${n > 1 || opts.always ? `<i class="n">${opts.always || n}</i>` : ''}</button>`;
  let tiles = list.map(id => { const it = ITEMS[id]; return tile(id, `[[${it.icon}]]`, P.inv[id], { name: it.name, tier: it.tier, plus: it.plus, star: it.star, qc: GEAR[it.type] ? `var(--eq-q${it.q || 1})` : '', dim: it.lv && P.lv < it.lv }); }).join('');
  if (invTab === 'vo') tiles += manh.map(id => tile('manh:' + id, `${skIcon(id)}<i class="mk">Mảnh</i>`, 0, { name: 'Mảnh ' + SKILLS[id].name, always: `${P.manh[id]}/${CHIEU_MANH}` })).join('');
  // Khung chi tiết của ô đang chọn
  let detail = '';
  if (invSel && invSel.startsWith('manh:')) {
    const id = invSel.slice(5), m = (P.manh || {})[id] || 0;
    if (SKILLS[id]) detail = `<div class="inv-d"><div class="row-item"><div class="ri-icon">${skIcon(id)}</div><div class="ri-main">
      <div class="ri-name">Mảnh ${SKILLS[id].name} ${gradeTag(id)} <span class="tag">${m} / ${CHIEU_MANH}</span></div>
      <div class="ri-desc">${BO_VO[SKILLS[id].bo].name} · ${CHIEU_NAME[chieuRole(id)]}. Gom đủ ${CHIEU_MANH} mảnh để ghép thành chiêu.</div></div></div>
      <div class="btn-row">${P.skills[id] ? '<span class="tag on">Đã học chiêu này</span>' : m >= CHIEU_MANH ? `<button class="btn primary" onclick="G.ghepManh('${id}')">Ghép chiêu</button>` : `<span class="tag soft">Còn thiếu ${CHIEU_MANH - m} mảnh</span>`}</div></div>`;
  } else if (invSel && P.inv[invSel] && invKind(invSel) === invTab) {
    const it = ITEMS[invSel];
    let btn = '';
    if (it.type === 'use') btn = `<button class="btn primary" onclick="G.useItem('${invSel}')">Dùng</button>`;
    else if (SLOT_NAMES[it.type]) btn = P.lv >= (it.lv || 1) ? `<button class="btn primary" onclick="G.equip('${invSel}')">Mặc vào</button>` : `<span class="tag warn">Cần cấp ${it.lv}</span>`;
    else if (it.type === 'book') btn = `<button class="btn primary" onclick="G.learnBook('${invSel}')">Lĩnh ngộ</button>`;
    detail = `<div class="inv-d">${itemRow(invSel, '', `x${P.inv[invSel]}`)}${btn ? `<div class="btn-row">${btn}</div>` : ''}</div>`;
  } else invSel = null;
  // Bán nhanh đồ Thường / Hiếm (người dùng chốt 2026-11-10); hỏi lại trước khi bán
  let qs = '';
  if (invTab === 'gear') {
    if (invQs) {
      const L = quickSellList(invQs), g = L.reduce((a, id) => a + sellPrice(id) * P.inv[id], 0), n = L.reduce((a, id) => a + P.inv[id], 0);
      qs = `<div class="inv-d"><p>Bán <b>${n}</b> món đồ <b class="${QUAL_CLASS[invQs]}">${GEAR_QUALITY[invQs - 1].name}</b>, được <b>${g.toLocaleString('vi-VN')}</b> [[bac]]?</p>
        <div class="btn-row"><button class="btn primary" onclick="G.quickSell(${invQs}, true)">Bán</button><button class="btn" onclick="G.quickSell(0)">Thôi</button></div></div>`;
    } else qs = `<div class="btn-row">${[1, 2].map(q => `<button class="btn small" ${quickSellList(q).length ? '' : 'disabled'} onclick="G.quickSell(${q})">Bán nhanh đồ ${GEAR_QUALITY[q - 1].name}</button>`).join('')}</div>`;
  }
  openModal(`<h3>[[hanh_trang]] Hành trang</h3><p class="muted">[[bac]] ${P.gold} lượng bạc</p>
    ${tabsHtml(tabs.map(([k, l]) => [k, `${l} (${count(k)})`]), invTab, 'menuInv')}
    ${qs}${detail || (tiles ? '<p class="muted inv-hint">Bấm vào một ô để xem.</p>' : '')}
    ${tiles ? `<div class="inv-grid">${tiles}</div>` : `<p class="muted">Chưa có gì ở mục này.</p>`}`);
}
// Bán nhanh: mọi trang bị trong hành trang đúng loại q (1 Thường, 2 Hiếm); bỏ qua đồ đã cường hóa (+N) và đồ có sao
let invQs = 0;
const quickSellList = q => Object.keys(P.inv).filter(id => { const it = P.inv[id] > 0 && ITEMS[id]; return it && GEAR[it.type] && (it.q || 1) === q && !it.plus && !it.star && sellPrice(id) > 0; });
function quickSell(q, ok) {
  if (!ok) { invQs = q || 0; return reopen(menuInv); }
  let g = 0, n = 0;
  quickSellList(q).forEach(id => { const c = P.inv[id]; g += sellPrice(id) * c; n += c; delete P.inv[id]; });
  invQs = 0; invSel = null;
  P.gold += g;
  if (n) { snd('sfx', 'coin'); toast(`Đã bán ${n} món, nhận ${g.toLocaleString('vi-VN')} lượng.`); }
  saveGame(true);
  renderTop();
  reopen(menuInv);
}
function useItem(id) {
  const s = getStats();
  const c = { hp: P.hp, maxHp: s.hp, mp: P.mp, maxMp: s.mp, fx: {} };
  const msg = applyConsumable(id, c);
  if (!msg) return;
  P.hp = c.hp;
  P.mp = c.mp;
  toast(`Dùng [[${ITEMS[id].icon}]] ${ITEMS[id].name}: ${msg}`);
  saveGame(true);
  renderTop();
  reopen(menuInv);
}
function equip(id, from) {
  const it = ITEMS[id], slot = it.type, old = P.equip[slot];
  if (!invCount(id)) return;
  if (it.lv && P.lv < it.lv) return toast(`Cần đạt cấp ${it.lv} mới mặc được ${it.name}.`);
  removeItem(id);
  if (old) addItem(old);
  P.equip[slot] = id;
  fixHpMp();
  toast(`Đã mặc [[${it.icon}]] <b>${it.name}</b>.`);
  saveGame(true);
  renderTop();
  reopen(from === 'char' ? () => menuChar('gear') : menuInv);
}
function unequip(slot) {
  const id = P.equip[slot];
  if (!id) return;
  addItem(id);
  P.equip[slot] = null;
  fixHpMp();
  saveGame(true);
  renderTop();
  reopen(() => menuChar('gear'));
}
function learnBook(id) {
  const sk = ITEMS[id].skill;
  if (P.skills[sk]) return toast('Ngươi đã lĩnh ngộ võ công này rồi.');
  giveSkill(sk);
  removeItem(id);
  log(`[[vo_hoc]] Lĩnh ngộ bí kíp: <b class="skill">${SKILLS[sk].name}</b>!`);
  toast(`[[vo_hoc]] Lĩnh ngộ <b>${SKILLS[sk].name}</b>!${usedNote(sk)}`);
  saveGame(true);
  reopen(menuInv);
}

function skillRow(id) {
  const sk = SKILLS[id], st = P.skills[id];
  const passive = sk.type === 'passive';
  const on = inUse(id);
  const btn = isBasic(id) ? '<span class="tag on">Luôn dùng</span><span class="tag soft">Thay đánh thường, không chiếm ô</span>'
    : on ? `<span class="tag on">Đang mang</span><button class="btn small" onclick="G.dropSkill('${id}')">Gỡ ra</button>`
    : `<button class="btn small primary" onclick="G.useSkill('${id}')">Mang theo</button>`;
  const prog = st.lv >= skMax(id) ? '<div class="ri-next">[[kinh_nghiem]] Đã luyện đến đại thành</div>'
    : `<div class="prof">${bar('Thành thạo', st.xp, profNeed(st.lv, id), 'prof')}</div>
       <div class="ri-next">Tầng ${st.lv + 1}: ${skillInfo(id, st.lv + 1)}</div>`;
  return `<div class="row-item ${on ? 'running' : ''}">
    <div class="ri-icon">${skIcon(id)}</div>
    <div class="ri-main">
      <div class="ri-name">${sk.name} ${gradeTag(id)} ${elemTag(id)} <span class="tag">Tầng ${st.lv}/${skMax(id)}</span>
        ${passive ? '<span class="tag soft">Bị động</span>' : `<span class="tag mp">${normSkill(id, st.lv).mp} nội lực</span>`}
        ${sk.sect && sk.sect !== P.sect ? `<span class="tag soft">${SECTS[sk.sect].name}</span>` : ''}</div>
      <div class="ri-desc">${sk.desc}</div>
      ${elemNote(id)}
      <div class="ri-stat">${skillInfo(id, st.lv)}</div>
      ${tierList(id, st.lv)}
      ${prog}
    </div>
    <div class="ri-btns">${btn}</div>
  </div>`;
}
function menuSkills(tab) {
  skillTab = tab || 'chieu'; // mở Võ học luôn vào màn Xuất chiến
  // Màn Xuất chiến gọn (người dùng chốt 2026-11-06): không dòng "Đang mang", không hàng tab; các mục khác vào bằng nút dưới vòng
  if (skillTab === 'chieu') return openModal(`<h3 class="chx-title">Võ học · Xuất chiến</h3>${chieuPanel()}`);
  if (skillTab === 'dogiam') return openModal(`<div class="dg-top"><button class="dg-back" type="button" onclick="G.menuSkills('chieu')" aria-label="Về Xuất chiến">‹</button><h3 class="chx-title">Võ học · Đồ giám</h3></div>${doGiamPanel()}`);
  if (skillTab === 'bo') skillTab = 'chieu'; // tab cũ
  const cat = skillTab;
  const loose = id => !isChieu(id); // chiêu (5 ô) chỉ hiện ở tab Chiêu thức / Đồ giám
  const nCh = chieuWorn().length;
  const tabs = [['chieu', '‹ Xuất chiến'], ['dogiam', '[[bi_kip]] Đồ giám']].concat(Object.keys(SKILL_CATS).map(c => {
    const n = Object.keys(P.skills).filter(id => SKILLS[id].cat === c && loose(id)).length;
    return [c, `${CAT_ICONS[c]} ${SKILL_CATS[c]}${n ? ` (${n})` : ''}`];
  }));
  const learned = SKILL_CATS[cat] ? Object.keys(P.skills).filter(id => SKILLS[id].cat === cat && loose(id))
    .sort((a, b) => (inUse(b) - inUse(a)) || skillRank(b) - skillRank(a)) : [];
  const slots = [`<span class="${nCh >= 5 ? 'full' : ''}">[[vo_cong]] Chiêu ${nCh}/5</span>`].concat(Object.keys(SKILL_CATS).map(c => `<span class="${P.use[c].length >= SKILL_SLOTS[c] ? 'full' : ''}">${CAT_ICONS[c]} ${P.use[c].length}/${SKILL_SLOTS[c]}</span>`)).join('');
  const body = cat === 'chieu' ? chieuPanel() : cat === 'dogiam' ? doGiamPanel()
    : `<p class="muted">${CAT_HINTS[cat]} Mang theo tối đa <b>${SKILL_SLOTS[cat]}</b> môn; muốn đổi thì gỡ bớt một môn.</p>
    ${learned.map(skillRow).join('') || `<p class="muted">Chưa học môn ${SKILL_CATS[cat].toLowerCase()} nào.</p>`}`;
  openModal(`<h3>[[vo_hoc]] Võ học</h3>
    <div class="loadout">Đang mang ${slots}</div>
    <div class="tabs wrap">${tabs.map(([k, label]) => `<button class="${k === cat ? 'on' : ''}" onclick="G.menuSkills('${k}')">${label}</button>`).join('')}</div>
    ${body}
    ${cat === 'chieu' || cat === 'dogiam' ? '' : practiceBox()}`);
}
/* Chiêu thức (5 ô) và Đồ giám (người dùng chốt 2026-11-06). Icon chiêu kèm chữ Thực / Hư / Trợ / Nộ ở góc. */
// Màn Võ học chỉ dùng khung màu theo loại chiêu (người dùng chốt 2026-11-06); chữ Thực / Hư / Trợ / Nộ chỉ hiện ở thanh chiêu trong trận
const chieuIcon = id => `<span class="ch-ic">${skIcon(id)}</span>`;
// Chi tiết một chiêu (dùng chung cho ô đang mang, danh sách chọn, đồ giám)
function chieuDetail(id) {
  const sk = SKILLS[id], st = P.skills[id], B = BO_VO[sk.bo] || { name: SKILL_GRADES[sk.grade] }, role = chieuRole(id), lv = st ? st.lv : 1;
  const info = role === 'hu' ? (B.giao || []).map((t, i) => `<div class="ri-tier ${st && st.lv > i ? 'on' : ''}">${st && st.lv > i ? '✦' : '·'} Tầng ${i + 1}: ${t}</div>`).join('')
    : sk.type === 'attack' || sk.chieu ? `<div class="ri-stat">${skillInfo(id, lv)}</div>` : '';
  const prog = !st ? '' : st.lv >= skMax(id) ? '<div class="ri-next">[[kinh_nghiem]] Đã luyện đến đại thành</div>'
    : `<div class="prof">${bar('Thành thạo', st.xp, profNeed(st.lv, id), 'prof')}</div>`;
  const cost = sk.type === 'passive' ? '' : sk.no ? '<span class="tag mp">Cần đầy nộ</span>' : `<span class="tag mp">${normSkill(id, lv).mp} nội lực</span>`;
  return `<div class="ri-name">${sk.name} <span class="tag soft">${B.name}</span> ${st ? `<span class="tag">Tầng ${st.lv}/${skMax(id)}</span>` : ''} ${cost}</div>
    <div class="ri-desc">${sk.desc}</div>${info}${prog}`;
}
/* Tab Chiêu thức kiểu "Xuất chiến" (người dùng duyệt bản thử web/thu_vo_hoc.html 2026-11-06, chọn bóng ngồi thiền):
   5 ô xếp ngũ giác quanh bóng người ngồi thiền (Thực 1 trên trái, Thực 2 trên phải, Trợ phải, Nộ dưới to nhất, Hư trái),
   pháp trận xoay chậm, Nội công + Khinh công bên dưới. Bấm một ô: bảng đổi chiêu trượt lên (máy tính: trượt từ phải). */
// Ô Hư bỏ (2026-11-07), chỗ bên trái thành ô Khinh công
const CHX_POS = [['no', null, 90, true], ['khinh', null, 162], ['thuc', 0, 234], ['thuc', 1, 306], ['tro', null, 18]];
const CHX_SIL = `<svg viewBox="0 0 200 220" aria-hidden="true"><defs><radialGradient id="chx-g" cx="50%" cy="40%" r="60%"><stop offset="0" stop-color="#f3dc9f" stop-opacity=".35"/><stop offset="1" stop-color="#f3dc9f" stop-opacity="0"/></radialGradient></defs>
  <circle cx="100" cy="95" r="95" fill="url(#chx-g)"/><g fill="#8d7c63" opacity=".85"><circle cx="100" cy="52" r="20"/><path d="M92 38c2-10 14-10 16 0z"/><circle cx="100" cy="30" r="6"/>
  <path d="M68 92c4-14 18-22 32-22s28 8 32 22l10 48H58z"/><path d="M58 138c-22 4-34 16-30 30 4 12 28 16 72 16s68-4 72-16c4-14-8-26-30-30z"/>
  <path d="M70 120c-8 10-6 22 8 24l22-6 22 6c14-2 16-14 8-24l-18 8h-24z" fill="#a99376"/></g></svg>`;
const CHX_COLOR = { thuc: '#b3261e', hu: '#2a5db0', tro: '#3f8f3a', no: '#d4a017', khinh: '#2a5db0' };
function chieuPanel() {
  const c = chieuOf(), R = 38, pos = a => [50 + R * Math.cos(a * Math.PI / 180), 50 + R * Math.sin(a * Math.PI / 180)];
  const lines = CHX_POS.map(([, , a]) => { const [x, y] = pos(a); return `<line x1="50" y1="50" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}"/>`; }).join('');
  const deco = `<svg class="chx-deco" viewBox="0 0 100 100" aria-hidden="true"><g class="chx-spin" fill="none" stroke="#d6ad62" stroke-opacity=".28">
      <circle cx="50" cy="50" r="38" stroke-width=".4" stroke-dasharray="1 1.6"/><circle cx="50" cy="50" r="24" stroke-width=".5"/><circle cx="50" cy="50" r="21" stroke-width=".25"/>
      ${Array.from({ length: 8 }, (_, k) => `<path d="M50 26 L51.6 29 L48.4 29 Z" fill="#d6ad62" fill-opacity=".3" stroke="none" transform="rotate(${k * 45} 50 50)"/>`).join('')}</g>
    <g stroke="#d6ad62" stroke-opacity=".25" stroke-width=".35">${lines}</g></svg>`;
  const slots = CHX_POS.map(([r, i, a, big]) => {
    const kh = r === 'khinh';
    const [x, y] = pos(a), id = kh ? P.use.khinhcong[0] : r === 'thuc' ? c.thuc[i] : c[r], has = id && P.skills[id], lb = kh ? 'Khinh công' : CHIEU_TAG[r] + (r === 'thuc' ? ' ' + (i + 1) : '');
    return `<button class="chx-slot${big ? ' big' : ''}" type="button" style="left:${x}%;top:${y}%;--c:${CHX_COLOR[r]}" onclick="G.chieuPick('${r}',${i === null ? 'null' : i})" aria-label="${kh ? 'Khinh công' : CHIEU_NAME[r] + (r === 'thuc' ? ' ' + (i + 1) : '')}: ${has ? SKILLS[id].name : 'ô trống'}">
      <span class="chx-disc"></span>${has ? skIcon(id) : '<span class="chx-plus">+</span>'}<span class="chx-lb"><b>${lb}</b>${has ? ' · T' + P.skills[id].lv : ''}</span></button>`;
  }).join('');
  // Ô nội công ở giữa, trên đan điền của bóng người ngồi thiền (người dùng chốt 2026-11-06)
  const noi = P.use.noicong[0];
  const mid = `<button class="chx-slot mid" type="button" style="left:50%;top:55%;--c:#7a4bb5" onclick="G.chieuPick('noi')" aria-label="Nội công: ${noi ? SKILLS[noi].name : 'ô trống'}">
    <span class="chx-disc"></span>${noi ? skIcon(noi) : '<span class="chx-plus">+</span>'}<span class="chx-lb"><b>Nội công</b>${noi ? ' · T' + P.skills[noi].lv : ''}</span></button>`;
  return `<div class="chx"><div class="chx-ring">${deco}<div class="chx-sil">${CHX_SIL}</div>${slots}${mid}</div>
    <div class="chx-pvs">
      <button class="chx-pv" type="button" onclick="G.menuSkills('dogiam')">[[bi_kip]]<span><small>Bộ võ, mảnh võ</small><b>Đồ giám</b></span></button>
      <button class="chx-pv" type="button" onclick="G.menuSkills('congphap')">${CAT_ICONS.congphap}<span><small>Võ công, công pháp lẻ</small><b>Võ học khác</b></span></button>
    </div></div>`;
}
// Ô Nội công / Khinh công trong bảng đổi (dùng chung chieuSheet): mỗi loại mang 1 môn
const CHX_CAT = { noi: { cat: 'noicong', name: 'Nội công', hint: 'tăng chỉ số, quyết định hệ của nhân vật' }, khinh: { cat: 'khinhcong', name: 'Khinh công', hint: 'tốc độ, né tránh' } };
// Bảng đổi chiêu của một ô (trượt lên trên Võ học): chi tiết chiêu đang xem, lọc theo bộ, lưới chiêu cùng loại
let chSel = null;
function chieuPick(role, i) {
  const X = CHX_CAT[role], c = chieuOf(), cur = X ? P.use[X.cat][0] : role === 'thuc' ? c.thuc[i] : c[role];
  chSel = { role, i, card: cur && P.skills[cur] ? cur : null, bo: chSel && chSel.role === role ? chSel.bo : '' };
  chieuSheet();
}
function chieuSheet() {
  if (!chSel) return;
  const { role, i, card, bo } = chSel, X = CHX_CAT[role], c = chieuOf();
  const cur = X ? P.use[X.cat][0] : role === 'thuc' ? c.thuc[i] : c[role];
  const title = X ? X.name : CHIEU_NAME[role] + (role === 'thuc' ? ' ' + (i + 1) : ''), hint = X ? X.hint : CHIEU_HINT[role];
  // Nội công / khinh công: môn lẻ đã học (không phải chiêu của bộ); chiêu thức: mọi chiêu cùng loại của các bộ
  const all = (X ? Object.keys(P.skills).filter(id => SKILLS[id].cat === X.cat && !SKILLS[id].bo && !SKILLS[id].quai && !SKILLS[id].cut)
    : [...Object.keys(BO_VO).flatMap(b => Object.values(BO_VO[b].roles)), ...Object.keys(P.skills).filter(id => SKILLS[id] && SKILLS[id].chieu)]
      .filter(id => SKILLS[id] && chieuRole(id) === role && (!bo || SKILLS[id].bo === bo)))
    .sort((a, b) => (!!P.skills[b] - !!P.skills[a]) || ((P.skills[b] || {}).lv || 0) - ((P.skills[a] || {}).lv || 0) || skillRank(b) - skillRank(a));
  const cards = all.map(id => {
    const st = P.skills[id], m = (P.manh || {})[id] || 0, sub = SKILLS[id].bo ? BO_VO[SKILLS[id].bo].name : SKILL_GRADES[SKILLS[id].grade];
    return `<button class="chx-card${st ? '' : ' lock'}${card === id ? ' sel' : ''}" type="button" onclick="G.chieuCard('${id}')">${skIcon(id)}
      <span class="t"><b>${SKILLS[id].name}</b><small>${sub}</small><small>${st ? `Tầng ${st.lv} / ${skMax(id)}` : `Mảnh ${m} / ${CHIEU_MANH}`}</small></span>${inUse(id) ? '<i class="chx-worn">Đang</i>' : ''}</button>`;
  }).join('') || `<p class="muted">Chưa có ${title.toLowerCase()} nào.</p>`;
  let detail = `<p class="muted">Chọn một môn để xem và mang vào ô này.</p>`;
  if (card) {
    const st = P.skills[card], here = cur === card, other = role === 'thuc' && !here && c.thuc.includes(card);
    const act = !st ? `<span class="tag soft">Chưa học · cần ${CHIEU_MANH} mảnh (Đồ giám)</span>`
      : here ? `<span class="tag on">Đang mang ở ô này</span>${X ? '' : '<button class="btn small" onclick="G.chieuOff()">Gỡ ra</button>'}`
      : `<button class="btn primary" onclick="G.chieuSet('${card}')">${other ? 'Đổi chỗ hai ô Thực' : 'Mang vào ô này'}</button>`;
    const sk = SKILLS[card], lv = st ? st.lv : 1;
    const body = X ? `<div class="ri-name">${sk.name} ${gradeTag(card)} ${elemTag(card)} <span class="tag">Tầng ${lv}/${skMax(card)}</span></div>
        <div class="ri-desc">${sk.desc}</div>${elemNote(card)}<div class="ri-stat">${skillInfo(card, lv)}</div>${tierList(card, lv)}` : chieuDetail(card);
    detail = `<div class="chx-detail"><div class="row-item"><div class="ri-icon">${skIcon(card)}</div><div class="ri-main">${body}</div></div><div class="btn-row">${act}</div></div>`;
  }
  let box = document.getElementById('chx-ov');
  if (!box) {
    box = document.createElement('div'); box.id = 'chx-ov'; box.className = 'chx-ov';
    box.addEventListener('click', e => { if (e.target === box) chieuClose(); });
    document.body.appendChild(box);
  }
  setHtml(box, `<section class="chx-sheet" role="dialog" aria-label="Đổi ${title}">
    <div class="chx-sh"><h3>Đổi ${title}<small>${X ? `Mang 1 môn ${X.name.toLowerCase()} (${hint})` : `Chọn ${CHIEU_NAME[role].toLowerCase()} của bộ nào cũng được (${hint})`}</small></h3>
      <button class="chx-x" type="button" onclick="G.chieuClose()" aria-label="Đóng">✕</button></div>
    ${detail}
    ${X ? '' : `<select class="chx-filter" onchange="G.chieuBo(this.value)" aria-label="Lọc theo bộ võ"><option value="">Mọi bộ võ</option>${Object.keys(BO_VO).map(b => `<option value="${b}"${bo === b ? ' selected' : ''}>${BO_VO[b].name}</option>`).join('')}</select>`}
    <div class="chx-grid">${cards}</div></section>`);
}
function chieuCard(id) { if (chSel) { chSel.card = id; chieuSheet(); } }
function chieuBo(b) { if (chSel) { chSel.bo = b; chieuSheet(); } }
function chieuClose() { const box = document.getElementById('chx-ov'); if (box) box.remove(); }
function chieuSet(id) {
  if (!chSel || !P.skills[id]) return;
  const X = CHX_CAT[chSel.role];
  if (X) { // Nội công / Khinh công: mang 1 môn, thay môn đang mang
    if (SKILLS[id].cat !== X.cat) return;
    P.use[X.cat] = [id];
    fixHpMp();
    toast(`${CAT_ICONS[X.cat]} Mang theo <b>${SKILLS[id].name}</b>.`);
    saveGame(true); renderTop(); chieuClose();
    return reopen(() => menuSkills('chieu'));
  }
  if (chieuRole(id) !== chSel.role) return;
  const { role, i } = chSel, c = P.chieu || (P.chieu = emptyChieu());
  if (role === 'thuc') { const j = c.thuc.indexOf(id); if (j >= 0 && j !== i) c.thuc[j] = c.thuc[i]; c.thuc[i] = id; } // đã ở ô kia thì đổi chỗ
  else c[role] = id;
  fixHpMp(); // Hư chiêu có thể cộng % khí huyết tối đa
  toast(`[[vo_cong]] Mang <b>${SKILLS[id].name}</b> vào ô ${CHIEU_TAG[role]}.`);
  saveGame(true); renderTop();
  chieuClose();
  reopen(() => menuSkills('chieu'));
}
function chieuOff() {
  if (!chSel) return;
  const { role, i } = chSel, c = P.chieu || (P.chieu = emptyChieu());
  if (role === 'thuc') c.thuc[i] = null; else c[role] = null;
  fixHpMp();
  saveGame(true); renderTop();
  chieuClose();
  reopen(() => menuSkills('chieu'));
}
/* Đồ giám (người dùng chốt 2026-11-07 theo ảnh mẫu): 3 tab dưới Võ Học / Nội Công / Khinh Công, lọc Toàn Bộ / Âm / Dương / Thái Cực,
   lưới "Đã có" + "Chưa có" (chiêu bộ võ chưa học, ghép bằng mảnh). Bấm một ô: bảng chi tiết (kiểu "Dưỡng Võ Học", bỏ video). */
let dgTab = 'vo', dgElem = '';
const DG_TABS = [['vo', 'Võ Học'], ['noi', 'Nội Công'], ['khinh', 'Khinh Công']];
const dgKind = id => { const s = SKILLS[id]; return s.bo || !['noicong', 'khinhcong'].includes(s.cat) ? 'vo' : s.cat === 'noicong' ? 'noi' : 'khinh'; };
const dgElemOf = id => { const s = SKILLS[id]; return s.noElem ? '' : s.elem || (s.bo && BO_VO[s.bo] ? BO_VO[s.bo].elem : '') || ''; };
const dgWorn = id => chieuWorn().includes(id) || (!isChieu(id) && inUse(id));
const DG_ELEM_SHORT = { am: 'Âm', duong: 'Dương', thaicuc: 'Thái Cực' };
function doGiamPanel() {
  const ok = id => SKILLS[id] && !SKILLS[id].quai && !SKILLS[id].cut && chieuRole(id) !== 'hu' && dgKind(id) === dgTab && (!dgElem || dgElemOf(id) === dgElem);
  const gr = id => Object.keys(SKILL_GRADES).indexOf(SKILLS[id].grade);
  const have = Object.keys(P.skills).filter(ok)
    .sort((a, b) => dgWorn(b) - dgWorn(a) || gr(b) - gr(a) || P.skills[b].lv - P.skills[a].lv);
  const not = [...new Set(Object.values(BO_VO).flatMap(B => Object.values(B.roles)))].filter(id => ok(id) && !P.skills[id])
    .sort((a, b) => ((P.manh || {})[b] || 0) - ((P.manh || {})[a] || 0));
  const tile = id => {
    const st = P.skills[id], el = dgElemOf(id), m = (P.manh || {})[id] || 0;
    return `<button class="dg-t g-${SKILLS[id].grade}${st ? '' : ' lock'}" type="button" onclick="G.dgOpen('${id}')" aria-label="${SKILLS[id].name}">
      <span class="dg-art">${skIcon(id)}${el ? `<i class="dg-el el-${el}">${DG_ELEM_SHORT[el]}</i>` : ''}${dgWorn(id) ? '<i class="dg-on">Đang mang</i>' : ''}
      <i class="dg-lv">${st ? 'T' + st.lv : `${m}/${CHIEU_MANH}`}</i>${!st && m >= CHIEU_MANH ? '<i class="dg-ready">Ghép</i>' : ''}</span>
      <b class="dg-nm">${SKILLS[id].name}</b></button>`;
  };
  const sec = (t, ids) => (ids.length ? `<div class="dg-sec"><span>${t}</span></div><div class="dg-grid">${ids.map(tile).join('')}</div>` : '');
  const filt = [['', 'Toàn Bộ'], ['am', 'Âm'], ['duong', 'Dương'], ['thaicuc', 'Thái Cực']].map(([k, l]) =>
    `<button class="dg-f${dgElem === k ? ' on' : ''}${k ? ' el-' + k : ''}" type="button" onclick="G.dgElemSet('${k}')">${l}</button>`).join('');
  return `<div class="dg"><div class="dg-fs">${filt}</div>
    <div class="dg-list">${sec('Đã có', have) + sec('Chưa có', not) || '<p class="muted dg-empty">Chưa có môn nào.</p>'}</div>
    <div class="dg-tabs">${DG_TABS.map(([k, l]) => `<button class="${dgTab === k ? 'on' : ''}" type="button" onclick="G.dgTabSet('${k}')">${l}</button>`).join('')}</div></div>`;
}
function dgTabSet(k) { dgTab = k; reopen(() => menuSkills('dogiam')); }
function dgElemSet(k) { dgElem = k; reopen(() => menuSkills('dogiam')); }
// Bảng chi tiết một võ học (trượt lên trên Đồ giám, dùng khung #chx-ov)
function dgOpen(id) {
  const sk = SKILLS[id];
  if (!sk) return;
  const st = P.skills[id], lv = st ? st.lv : 1, el = dgElemOf(id), m = (P.manh || {})[id] || 0, role = chieuRole(id);
  const B = sk.bo ? BO_VO[sk.bo] : null;
  const dv = role ? `${CHIEU_NAME[role]}${B ? ' · ' + B.name : ''}` : SKILL_CATS[sk.cat];
  const cost = sk.type === 'passive' ? 'Bị động' : sk.no ? 'Cần đầy nộ' : `${normSkill(id, lv).mp} nội lực`;
  // Hiệu quả ở tầng hiện tại + tầng kế (mọi loại: võ công, công pháp, nội công, khinh công); chiêu có kiểu riêng không mô tả được thì bỏ
  const eff = l => { try { const t = skillInfo(id, l); return t && !/undefined|NaN|\+0%/.test(t) ? t : ''; } catch (e) { return ''; } };
  const now = eff(lv), next = st && lv < skMax(id) ? eff(lv + 1) : '';
  const info = now ? `<div>${st ? `Tầng ${lv}` : 'Tầng 1'}: ${now}</div>${next && next !== now ? `<div class="dg-next">Tầng ${lv + 1}: ${next}</div>` : ''}` : '';
  const tiers = role === 'hu' ? (B.giao || []).map((t, i) => `<div class="ri-tier ${st && st.lv > i ? 'on' : ''}">${st && st.lv > i ? '✦' : '·'} Tầng ${i + 1}: ${t}</div>`).join('')
    : tierList(id, st ? st.lv : 0);
  const foot = !st
    ? `<div class="prof">${bar('Mảnh võ', Math.min(m, CHIEU_MANH), CHIEU_MANH, 'prof')}</div>
       ${sk.bo && m >= CHIEU_MANH ? `<div class="btn-row"><button class="btn primary" onclick="G.chieuClose();G.ghepManh('${id}')">Ghép chiêu</button></div>` : ''}`
    : st.lv >= skMax(id) ? '<div class="ri-next">[[kinh_nghiem]] Đã luyện đến đại thành</div>'
    : `<div class="prof">${bar('Thành thạo', st.xp, profNeed(st.lv, id), 'prof')}</div>`;
  let box = document.getElementById('chx-ov');
  if (!box) {
    box = document.createElement('div'); box.id = 'chx-ov'; box.className = 'chx-ov';
    box.addEventListener('click', e => { if (e.target === box) chieuClose(); });
    document.body.appendChild(box);
  }
  setHtml(box, `<section class="chx-sheet dg-sheet" role="dialog" aria-label="${sk.name}">
    <div class="chx-sh"><h3>Võ học</h3><button class="chx-x" type="button" onclick="G.chieuClose()" aria-label="Đóng">✕</button></div>
    <div class="dg-hd">
      <span class="dg-big g-${sk.grade}">${skIcon(id)}${el ? `<i class="dg-el el-${el}">${DG_ELEM_SHORT[el]}</i>` : ''}</span>
      <div class="dg-meta">
        <b class="dg-name g-${sk.grade}">${sk.name}</b>
        <div class="dg-row">${st ? `Tầng: ${st.lv} / ${skMax(id)}` : `Chưa học · mảnh ${m} / ${CHIEU_MANH}`}</div>
        <div class="dg-row">${gradeTag(id)} ${elemTag(id)} <span class="tag mp">${cost}</span></div>
        <div class="dg-row">Định vị: ${dv}</div>
      </div>
    </div>
    <p class="dg-desc">${sk.desc}</p>
    ${info ? `<div class="dg-h">Thuộc tính</div><div class="dg-info">${info}</div>` : ''}
    ${tiers ? `<div class="dg-h">Mốc tầng</div><div class="dg-tiers">${tiers}</div>` : ''}
    <div class="dg-foot">${foot}</div></section>`);
}
// Luyện với mộc nhân: thử ngay hiệu ứng mốc tầng của các môn đang mang, không tốn gì, không được thành thạo
function practiceBox() {
  const ids = Object.values(P.use).flat().filter(id => SKILLS[id].tiers);
  if (!ids.length) return '';
  const tiers = [...new Set(ids.flatMap(id => Object.keys(SKILLS[id].tiers).map(Number)))].sort((a, b) => a - b);
  return `<div class="practice">
    <h4>[[moc_nhan]] Luyện với mộc nhân</h4>
    <p class="muted">Đánh thử với mộc nhân bằng các môn đang mang, tạm coi các môn có mốc tầng như đã luyện tới tầng đó. Không được thành thạo, không mất gì; bấm Bỏ chạy để dừng.</p>
    <div class="btn-row"><button class="btn small" onclick="G.practice(0)">Tầng hiện tại</button>${tiers.map(t => `<button class="btn small primary" onclick="G.practice(${t})">Thử tầng ${t}</button>`).join('')}</div>
  </div>`;
}
function practice(lv) {
  if (combat && !combat.over) return;
  closeModal();
  tryTier = lv || null;
  const hp0 = P.hp, mp0 = P.mp; // luyện xong trả lại khí huyết, nội lực như trước (không dùng để hồi máu)
  startCombat('moc_nhan', { story: true, practice: true, intro: tryTier ? `Thử hiệu ứng võ công <b>tầng ${tryTier}</b>.` : '', onEnd: () => {
    tryTier = null;
    combat.pl.hp = hp0;
    combat.pl.mp = mp0;
    return { lines: ['[[moc_nhan]] Thu chiêu, kết thúc buổi luyện.'], btn: 'Về ➜', cls: 'win', keepHp: true };
  } });
}
function useSkill(id) {
  const sk = SKILLS[id];
  if (!P.skills[id] || inUse(id) || isBasic(id) || isChieu(id)) return; // chiêu mang qua 5 ô Chiêu thức (chieuSet)
  if (!slotFree(sk.cat)) return toast(`Đã mang đủ ${SKILL_SLOTS[sk.cat]} môn ${SKILL_CATS[sk.cat]}. Gỡ bớt một môn trước.`);
  P.use[sk.cat].push(id);
  fixHpMp();
  toast(`${CAT_ICONS[sk.cat]} Mang theo <b>${sk.name}</b>.`);
  saveGame(true);
  renderTop();
  reopen(() => menuSkills(sk.cat));
}
function dropSkill(id) {
  const sk = SKILLS[id];
  if (!inUse(id) || isBasic(id) || isChieu(id)) return;
  P.use[sk.cat] = P.use[sk.cat].filter(x => x !== id);
  fixHpMp();
  toast(`Đã gỡ <b>${sk.name}</b>.`);
  saveGame(true);
  renderTop();
  reopen(() => menuSkills(sk.cat));
}

function menuQuests() {
  const rows = ['tvQuestRows', 'smQuestRows', 'tnQuestRows', 'tlQuestRows', 'bqQuestRows'].map(f => (typeof window[f] === 'function' ? window[f]() : '')).join('');
  openModal(`<h3>[[nhiem_vu]] Nhiệm vụ</h3>
    <h4>Đang làm</h4>
    ${rows || '<p class="muted">Chưa có nhiệm vụ nào.</p>'}`);
}
function menuSystem() {
  const fbName = typeof fbUserName === 'function' ? fbUserName() : '';
  const where = cloud.doc
    ? (fbName ? `[[dam_may]] Game đang được lưu vào tài khoản Google <b>${esc(fbName)}</b>. Đăng nhập cùng tài khoản trên máy khác là chơi tiếp được.`
      : '[[dam_may]] Game đang được lưu vào tài khoản claude.ai của ngươi. Mở link này trên máy khác là chơi tiếp được.')
    : cloud.state === 'error'
      ? '[[canh_bao]] Không kết nối được chỗ lưu trên tài khoản, game chỉ lưu trong trình duyệt này.'
      : `[[ruong]] Game đang được lưu trong trình duyệt này.${typeof fbInit === 'function' && !window.claude ? ' Muốn lưu lên mạng thì về màn vào game, bấm Đăng nhập Google.' : ''}`;
  const speed = fxSpeed();
  const fxRow = hasFx() ? `<h4>Hiệu ứng chiêu thức</h4>
    <div class="row-btns left">${FX_SPEEDS.map(([k, t]) => `<button class="btn small ${speed === k ? 'primary' : ''}" onclick="G.setFxSpeed('${k}')">${t}</button>`).join('')}</div>
    <p class="muted">Nhanh: hiệu ứng chạy gấp đôi, hợp lúc luyện cấp. Tắt: đánh như cũ, không có hiệu ứng.</p>` : '';
  const so = hasSnd() ? SND.get() : null;
  const sndRow = so ? `<h4>Âm thanh</h4>
    <div class="row-btns left">
      <button class="btn small ${so.music ? 'primary' : ''}" onclick="G.toggleSnd('music')">Nhạc nền: ${so.music ? 'Bật' : 'Tắt'}</button>
      <button class="btn small ${so.sfx ? 'primary' : ''}" onclick="G.toggleSnd('sfx')">Tiếng động: ${so.sfx ? 'Bật' : 'Tắt'}</button>
    </div>
    <label class="snd-vol">Âm lượng nhạc <input type="range" min="0" max="1" step="0.05" value="${so.musicVol}" oninput="G.setSndVol('musicVol', this.value)"></label>
    <label class="snd-vol">Âm lượng tiếng động <input type="range" min="0" max="1" step="0.05" value="${so.sfxVol}" oninput="G.setSndVol('sfxVol', this.value)"></label>` : '';
  openModal(`<h3>[[he_thong]] Hệ thống</h3>
    <p class="muted">${where}</p>
    ${sndRow}
    ${fxRow}
    <h4>Trò chơi</h4>
    <div class="menu-col">
      <button class="btn" onclick="G.saveGame()">[[luu]] Lưu game</button>
      <button class="btn" onclick="G.exportSave()">[[xuat]] Xuất mã lưu (sao lưu dự phòng)</button>
      <button class="btn" onclick="G.importSave()">[[nhap]] Nhập mã lưu</button>
      <button class="btn" onclick="G.help()">[[huong_dan]] Hướng dẫn chơi</button>
      <button class="btn" onclick="G.toTitle()">[[nha]] Về màn hình chính</button>
    </div>
    <p class="muted">Game tự động lưu sau mỗi trận đấu, mỗi lần di chuyển hoặc mua bán.</p>`);
}
function toTitle() {
  saveGame(true);
  renderTitle();
}
function toggleSnd(k) {
  if (!hasSnd()) return;
  SND.set({ [k]: !SND.get()[k] });
  reopen(menuSystem);
}
function setSndVol(k, v) { snd('set', { [k]: +v }); }

function help() {
  openModal(`<h3>[[huong_dan]] Hướng dẫn chơi</h3>
    <div class="help">
      <p><b>[[muc_tieu]] Mục tiêu:</b> Làm theo nhiệm vụ chính ([[chinh]]) để khám phá cốt truyện và đánh bại Huyết Ma Giáo Chủ.</p>
      <p><b>[[ban_do]] Di chuyển:</b> Bấm vào các địa điểm ở mục "Đi đến". Địa điểm có [[khoa]] sẽ được mở khi làm nhiệm vụ chính.</p>
      <p><b>[[giao_chien]] Thám hiểm:</b> Ở vùng nguy hiểm, bấm "Thám hiểm" để gặp quái vật hoặc nhặt được đồ.</p>
      <p><b>[[tro_chuyen]] Nhân vật:</b> Người có dấu [[moi]] có nhiệm vụ mới, dấu [[tra]] là ngươi có thể trả nhiệm vụ.</p>
      <p><b>[[vo_hoc]] Võ học</b> có 4 loại: [[vo_cong]] <b>Võ công</b> (chiêu gây sát thương), [[noi_cong]] <b>Nội công</b> (bị động, tăng chỉ số), [[cong_phap]] <b>Công pháp</b> (hỗ trợ: hồi máu, tăng công, tăng thủ), [[khinh_cong]] <b>Khinh công</b> (bị động, tăng tốc độ và né tránh).
        Phẩm chất từ thấp đến cao: Nhập môn → Thượng thừa → Tuyệt học → Trấn phái.</p>
      <p><b>[[hanh_trang]] Mang theo:</b> Học bao nhiêu cũng được, nhưng chỉ <b>mang theo</b> được ${Object.keys(SKILL_CATS).map(c => `${SKILL_SLOTS[c]} ${SKILL_CATS[c].toLowerCase()}`).join(', ')}. Chỉ môn đang mang mới dùng được trong trận và mới cộng chỉ số. Muốn đổi thì gỡ bớt một môn.</p>
      <p><b>[[mon_phai]] Học võ:</b> Tàng Kinh Các của môn phái chỉ bán cho <b>đệ tử bản môn</b>. Võ học giang hồ bán ở võ quán và thư các, ai cũng học được. Tuyệt học chỉ lĩnh ngộ từ bí kíp thất truyền, không rơi từ quái.</p>
      <p><b>[[thanh_thao]] Thành thạo:</b> Võ công, công pháp: mỗi lần ra chiêu +1 điểm. Nội công, khinh công đang mang: mỗi lượt trong trận +1 điểm. Đủ điểm thì lên tầng (tối đa tầng 10); tầng càng cao càng cần nhiều điểm: ${SKILL_PROF.join(', ')} (Nhập môn và võ Vô Danh tặng lúc đầu); Thượng thừa cần gấp ${String(PROF_MULT.thuongthua).replace('.', ',')}, Tuyệt học và Trấn phái gấp ${PROF_MULT.tuyethoc}.</p>
      <p><b>[[vo_quan]] Chiến đấu theo lượt:</b> Bên có <b>tốc độ</b> cao hơn ra tay trước.</p>
      <ul>
        <li><b>Tấn công</b>: đánh thường, không tốn nội lực.</li>
        <li><b>Võ học</b>: dùng võ công, công pháp đang mang; tốn nội lực.</li>
        ${POTION_OFF ? '' : '<li><b>Vật phẩm</b>: dùng thuốc hồi máu, hồi nội lực, giải độc.</li>'}
        <li><b>Thủ thế</b>: giảm một nửa sát thương lượt sau và hồi 10% nội lực.</li>
        <li><b>Bỏ chạy</b>: tốc độ càng cao càng dễ thoát. Không thể chạy khỏi boss và Tinh Anh.</li>
      </ul>
      <p><b>[[chi_so]] Chỉ số:</b> Chính xác trừ vào né tránh của đối thủ, kháng bạo kích trừ vào bạo kích của đối thủ.
        Hút huyết / hút nội lực hồi lại theo sát thương ngươi gây ra.</p>
      <p><b>[[thu_the]] Trang bị:</b> ${Object.keys(SLOT_NAMES).length} ô — ${Object.values(SLOT_NAMES).join(', ')}. Vào [[nhan_vat]] Nhân vật → Trang bị để mặc.</p>
      <p><b>[[nghi_ngoi]] Hồi phục:</b> Nghỉ ngơi ở thôn, trấn hoặc môn phái để hồi đầy khí huyết và nội lực.</p>
      <p><b>[[tu_vong]] Thua trận:</b> Không mất nhân vật, chỉ mất 10% bạc và được đưa về nơi an toàn gần nhất.</p>
      <p><b>[[luu]] Lưu game:</b> Game tự lưu. Nên thỉnh thoảng vào [[he_thong]] Hệ thống → "Xuất mã lưu" để sao lưu dự phòng.</p>
    </div>`);
}

/* =================================================================
   CHIẾN ĐẤU
   ================================================================= */
const fxVal = (c, k) => (c.fx[k] ? c.fx[k].value : 0);
// Suy yếu (võ công Thiếu Lâm): giảm % công, % bạo kích, % chính xác của kẻ bị đánh trúng
const weakVal = (c, k) => (c.fx && c.fx.weak ? c.fx.weak[k] || 0 : 0);
const effAtk = c => c.atk * Math.max(0.1, 1 + (fxVal(c, 'atk') - weakVal(c, 'atk')) / 100);
// Nội thương (kiếm pháp Nga Mi): mỗi tầng giảm % thủ và % trị liệu nhận được
const noiVal = (c, k) => (c.fx && c.fx.noithuong ? c.fx.noithuong.n * c.fx.noithuong[k] : 0);
const effDef = c => c.def * Math.max(0, 1 + fxVal(c, 'def') / 100 - noiVal(c, 'def') / 100);
const effAcc = c => c.acc * (1 + fxVal(c, 'acc') / 100);
const effSpd = c => Math.round(c.spd * (1 + fxVal(c, 'spd') / 100));
const effDodge = c => c.dodge + fxVal(c, 'dodge');
function who(c) { return c.isPlayer ? `<b class="pname">${esc(c.name)}</b>` : `<b class="ename">${c.name}</b>`; }
function clog(msg) {
  combat.log.push(msg);
  if (combat.log.length > 80) combat.log.shift();
}
function float(c, text, cls) { combat.floats.push({ c, side: c.isPlayer ? 'pl' : 'en', text, cls }); }

// Độ khó (DO_KHO trong data.js): nhân thêm khí huyết, sức công của kẻ địch
// Quái thế giới mới (the_gioi.js, E.tg) dùng đúng chỉ số theo cấp người dùng chốt, không nhân độ khó
const doKho = E => (typeof DO_KHO === 'undefined' || E.tg ? { hp: 1, atk: 1 } : E.boss ? DO_KHO.boss : DO_KHO.quai);
const enHp = E => (E.hp >= 9999 ? E.hp : Math.round(E.hp * doKho(E).hp)); // 9999 = không thể đánh bại, giữ nguyên
// Nội lực của kẻ địch (E.mp nếu có ghi trong data.js, không thì theo cấp; boss gấp ba). Ra chiêu có tên tốn nội lực (enSkillMp), hết thì chỉ đánh thường.
const enMp = E => E.mp != null ? E.mp : Math.round((20 + E.lv * 8) * (E.boss ? 3 : 1));
const enSkillMp = (s, en) => (s.mp != null ? s.mp : Math.max(5, Math.round(en.maxMp * 0.2)));

/* Trận 1 đấu nhiều (người dùng chốt 2026-10-27): startCombat(quái, opts), quái là một mã trong ENEMIES, một object quái
   dựng sẵn (the_gioi.js: genEncounter), hoặc một mảng 1–6 thứ đó. combat.ens = mọi kẻ địch, combat.en = kẻ đang bị chọn
   làm mục tiêu (chạm vào quái trên sân để đổi). Mỗi vòng ai tốc độ cao ra tay trước (bằng nhau thì người chơi trước).
   Thắng khi hạ hết; thưởng = cộng từng con × hệ số theo số quái (rewardMult). Đánh xong không hồi máu.
   opts.story   — không thưởng/phạt như trận thường, kết quả do opts.onEnd quyết
   opts.noFlee  — không được bỏ chạy
   opts.survive — đỡ đủ N lượt đối thủ là thắng
   opts.actor   — người chơi điều khiển nhân vật khác (vd. Tạ Cô Hồng ở màn mở đầu)
   opts.onEnd(result) — trả về { lines, btn, cls, after } */
const enemyDef = x => (typeof x === 'string' ? ENEMIES[x] : x);
const enemyKey = x => (typeof x === 'string' ? x : x.id || null);
// Hệ số thưởng theo số quái: 1 con ×1, 2 ×1,2 … 6 ×2 (the_gioi.js có tgRewardMult thì dùng của nó)
const rewardMult = n => (typeof tgRewardMult === 'function' ? tgRewardMult(n) : 1 + 0.2 * (clamp(n, 1, 6) - 1));
function makeEnemy(x, uid) {
  const E = enemyDef(x);
  return {
    name: E.name, icon: E.icon, lv: E.lv, hp: enHp(E), maxHp: enHp(E), atk: Math.round(E.atk * doKho(E).atk), def: E.def, spd: E.spd,
    crit: E.crit || 5, critDmg: E.critDmg || 150, critRes: E.critRes != null ? E.critRes : Math.round(E.lv / 2),
    acc: E.acc != null ? E.acc : E.lv, dodge: E.dodge || 0, lifesteal: E.lifesteal || 0, manasteal: E.manasteal || 0, // hút huyết: quái Trường Sinh Đường (the_gioi.js)
    poisonHit: E.poisonHit || null, // đánh trúng có tỉ lệ gây độc: quái Đầm Lầy Hiệp Xuyên (the_gioi.js)
    charmHit: E.charmHit || null, // đánh trúng có tỉ lệ gây mê hoặc: quái Thung Lũng Tiêu Dao
    soulHit: E.soulHit || null, // đánh trúng có tỉ lệ Phệ Hồn: quái Hồ Kỳ Sơn
    mp: enMp(E), maxMp: enMp(E),
    fx: {}, isPlayer: false, boss: !!E.boss,
    elem: E.elem || null, elems: E.elem ? [E.elem] : [], // hệ của quái (tương khắc)
    E, key: enemyKey(x), uid, healsUsed: 0,
  };
}
const aliveEns = () => combat.ens.filter(e => e.hp > 0);
// Mục tiêu gục thì tự chọn con còn sống kế tiếp
function retarget() { if (combat.en.hp <= 0) combat.en = aliveEns()[0] || combat.en; }
function startCombat(enemyId, opts = {}) {
  if (typeof bgPreload === 'function') bgPreload();
  const list = Array.isArray(enemyId) ? enemyId : [enemyId], A = opts.actor;
  const s = A || getStats();
  const pl = A
    ? Object.assign({}, A, { maxHp: A.hp, maxMp: A.mp, fx: {}, isPlayer: true })
    : Object.assign({}, s, { name: P.name, icon: SECTS[P.sect].icon, lv: P.lv, hp: P.hp, maxHp: s.hp, mp: P.mp, maxMp: s.mp, fx: {}, isPlayer: true });
  pl.pt = passiveTiers(A); // hiệu ứng mốc tầng của nội công, khinh công
  pl.elems = noiElems(A); // hệ tương khắc
  // Chiêu thức: nộ và điểm riêng từng bộ (cls: Cuồng Long, Tâm Lực, Phật Ấn) chỉ tính trong trận, hết trận về 0
  pl.chieu = !A && chieuWorn().length > 0; pl.no = 0; pl.cls = {};
  if (pl.chieu && pl.pt.noStart) pl.no = Math.min(BO_NO.max, pl.pt.noStart); // Trường Sinh Quyết bậc 5: vào trận có sẵn nộ
  const ens = list.slice(0, 6).map(makeEnemy);
  combat = {
    id: enemyKey(list[0]), over: false, busy: false, menu: 'main', log: [], floats: [],
    opts, actor: A || null, survived: 0, logOpen: false, queue: [],
    stat: { turns: 0, dealt: 0, maxHit: 0, crits: 0, taken: 0, absorbed: 0, healed: 0, uses: {} }, // tổng kết trận (màn kết trận)
    ens, en: ens[0], boss: ens.some(e => e.boss),
    pl,
  };
  snd('music', (combat.boss || opts.story) && !opts.practice ? 'boss' : 'combat');
  if (combat.boss) snd('jingle', 'boss');
  ens.forEach(e => clog(`${e.boss ? '[[tu_vong]]' : '[[giao_chien]]'} ${who(e)} (cấp ${e.lv}${e.elem ? `, hệ ${SKILL_ELEMS[e.elem]}` : ''}) xuất hiện!`));
  if (ens.length > 1) clog(`[[muc_tieu]] ${ens.length} kẻ địch, thưởng ×${rewardMult(ens.length).toFixed(1).replace('.', ',')}. Chạm vào kẻ địch để chọn mục tiêu.`);
  const intro = opts.intro || ens[0].E.intro;
  if (intro) clog(`<i>${fmt(intro)}</i>`);
  if (opts.survive && !opts.survLabel) clog(`[[muc_tieu]] Đỡ được <b>${opts.survive}</b> chiêu là qua.`);
  const vc = A ? null : vanCong();
  if (vc) clog(`[[noi_cong]] Vận công <b>${vc.name}</b>${vc.lines.length ? ': ' + vc.lines.join(' · ') : ''}.`);
  // Cửu Dương Thần Công bậc 5: vào trận mọi kẻ địch nhận n tầng Dương Viêm
  if (!A && pl.pt.dvStart) { ens.forEach(e => dvAdd(e, pl.pt.dvStart)); clog(`[[lua]] Cửu Dương chân hỏa bốc lên, mọi kẻ địch nhận ${pl.pt.dvStart} tầng Dương Viêm.`); }
  newRound();
  const first = combat.queue[0];
  if (!first.isPlayer) {
    clog(`[[toc_do]] ${who(first)} tốc độ ${effSpd(first)} nhanh hơn ${who(pl)} (${effSpd(pl)}), ra tay trước!`);
    combat.busy = true;
    renderCombat();
    setTimeout(nextTurn, 900);
  } else {
    combat.queue.shift();
    clog(`[[toc_do]] ${who(pl)} tốc độ ${effSpd(pl)}, ra tay trước!`);
    renderCombat();
  }
  if (vc && fxOn() && typeof sdVanCong === 'function') sdVanCong(el('f-pl'), haloColor(), vc.name, vc.lines);
}
/* Vận công lúc vào trận (người dùng chốt 2026-10-27): hào quang sáng lên, hiện tên nội công đang mang
   và các hiệu ứng mốc tầng đang có của nội công, khinh công (giảm sát thương, thành thạo, kinh nghiệm...) */
const VC_LABELS = {
  dmgReduce: v => `Giảm sát thương ${v}%`, profUp: v => `Thành thạo +${v}%`, expUp: v => `Kinh nghiệm +${v}%`,
  regen: v => `Hồi khí huyết ${v}%/lượt`, mpRegen: v => `Hồi nội lực ${v}%/lượt`, firstStrike: v => `Chiêu đầu +${v}%`,
  thorns: v => `Phản đòn ${v}%`, manaShield: v => `Nội lực hộ thể ${v}%`, lastStand: () => 'Gượng chết 1 lần',
  amUp: v => `Âm kình +${v}%`, lowHpReduce: () => 'Càng ít máu càng lì', lowHpAtk: () => 'Càng ít máu càng mạnh',
  stunResist: v => `Kháng choáng ${v}%`, dodgeCrit: () => 'Né xong chắc bạo kích', firstDodge: () => 'Né chắc chiêu đầu',
  dodgeHeal: v => `Né đòn hồi ${v}% khí huyết`, critMp: v => `Bạo kích hồi ${v}% nội lực`, critHeal: v => `Bạo kích hút ${v}% máu`, dotUp: v => `Độc, chảy máu +${v}%`,
};
function vanCong() {
  const noi = P.use.noicong[0];
  if (!noi) return null;
  const pt = combat.pl.pt || {};
  const lines = Object.keys(VC_LABELS).filter(k => pt[k]).map(k => VC_LABELS[k](pt[k]));
  return { name: SKILLS[noi].name, lines };
}
// Màu hào quang dưới chân theo hệ nội công đang mang; không hệ thì trắng mờ
const HALO_ELEM = { duong: '#ff8a3a', am: '#8f7bff', thaicuc: '#e9e4d6' };
const haloColor = () => HALO_ELEM[noiElems()[0]] || null;
// Thứ tự ra tay trong một vòng: tốc độ cao trước, bằng nhau thì người chơi trước
function newRound() {
  combat.round = (combat.round || 0) + 1; // hiệp thứ mấy (quái dùng công pháp ở hiệp 1, 4, 7...)
  combat.queue = [combat.pl, ...aliveEns()].sort((a, b) => effSpd(b) - effSpd(a) || (a.isPlayer ? -1 : b.isPlayer ? 1 : 0));
}
// Tới lượt người kế tiếp (người chơi hoặc một kẻ địch còn sống)
function nextTurn() {
  if (!combat || combat.over) return;
  let c;
  do { if (!combat.queue.length) newRound(); c = combat.queue.shift(); } while (!c.isPlayer && c.hp <= 0);
  if (c.isPlayer) playerTurnStart(); else enemyTurn(c);
}
// Chạm vào một kẻ địch trên sân: chọn làm mục tiêu
function pickTarget(uid) {
  const e = combat && combat.ens[uid];
  if (!e || e.hp <= 0 || combat.over || e === combat.en) return;
  combat.en = e;
  const h = el('hud-en');
  if (h) setHtml(h, hudHtml(e));
  combat.ens.forEach(x => { const u = unitEl(x); if (u) u.classList.toggle('tgt', x === e); });
}

// Biểu cảm của nhân vật trong trận: vừa trúng đòn, vừa ra đòn, thắng trận...
function playerFace() {
  const { pl } = combat;
  if (combat.over) return combat.result === 'win' ? 'win' : combat.result === 'lose' ? 'hurt' : 'normal';
  if (combat.floats.some(f => f.side === 'pl' && f.cls !== 'heal' && f.cls !== 'miss')) return 'hurt';
  if (combat.floats.some(f => !f.c.isPlayer && f.cls !== 'heal')) return 'attack';
  return pl.hp < pl.maxHp * 0.25 ? 'hurt' : 'normal';
}

// Quái có hình chibi (chibi_quai.js): mặt trúng đòn khi vừa bị đánh hoặc sắp gục
function enemyFace(en = combat.en) {
  if (combat.over) return combat.result === 'win' ? 'hurt' : 'normal';
  if (combat.floats.some(f => f.c === en && f.cls !== 'heal' && f.cls !== 'miss')) return 'hurt';
  return en.hp < en.maxHp * 0.25 ? 'hurt' : 'normal';
}
function enemyArt(en = combat.en) {
  // Đối thủ là người (giang hồ khách khi vận tiêu, quái hình người): dùng hình chibi nhân vật, quay mặt lại
  const A = en.E && en.E.avatar;
  if (A) {
    const face = combat.over ? (combat.result === 'win' ? 'hurt' : 'win') : enemyFace(en);
    return playerAvatar(A.sect, A.title, 'body', face).replace('<svg class="avatar body"', '<svg class="avatar body" style="transform:scaleX(-1)"');
  }
  return typeof enemyArtSvg === 'function' ? enemyArtSvg(en.icon, enemyFace(en)) : '';
}
// Ô của một người trên sân (người chơi: f-pl; kẻ địch: f-en-<số thứ tự>)
const unitEl = c => el(c.isPlayer ? 'f-pl' : 'f-en-' + c.uid);
/* ---------------------------- Sân đấu ----------------------------
   Giao diện màn đánh nhau (người dùng duyệt qua "Sân Đấu Mẫu"): phần vẽ và hoạt cảnh nằm ở san_dau.js (hàm sd...).
   Hai bảng thông tin hai bên, sân nhìn chéo có cảnh theo nơi đang đứng, nhật ký 2 dòng, thanh chiêu (đánh thường + võ công + công pháp)
   và hàng vật phẩm (máu, nội lực, đan, bỏ chạy). Giữ id f-pl / f-en / clog cho hiệu ứng và tự động luyện công. */
const sdBar = (k, v, max) => `<div class="sd-bar ${k}">${k === 'hp' ? `<i class="g" style="width:${barPct(v, max)}%"></i>` : ''}<i class="f" style="width:${barPct(v, max)}%"></i><em>${Math.max(0, Math.round(v))} / ${Math.round(max)}</em></div>`;
const barPct = (v, max) => Math.max(0, Math.min(100, v / max * 100)).toFixed(1);
// Bảng thông tin một bên: chân dung, tên, khí huyết, nội lực (nếu có), công / thủ / tốc chỉ biểu tượng + số
// Bấm vào ảnh tròn của quái: xem võ công, nội công, công pháp nó đang mang (E.arts, E.artLv do the_gioi.js gắn)
function enemyInfo() {
  const c = combat && combat.en;
  if (!c) return;
  const E = c.E || {}, lv = E.artLv || 1, CAT = { vocong: 'Võ công', noicong: 'Nội công', congphap: 'Công pháp' };
  const arts = (E.arts || []).filter(id => SKILLS[id]);
  const rows = arts.map(id => {
    const s = SKILLS[id];
    return `<div class="ri-skill" style="margin-bottom:10px"><div><b>${CAT[s.cat] || ''}: ${s.name}</b> ${gradeTag(id)}${s.elem ? ` <i class="tag elem-${s.elem}">${SKILL_ELEMS[s.elem]}</i>` : ''} · Tầng ${lv}</div>
      <div class="muted">${skillInfo(id, lv)}</div></div>`;
  }).join('');
  openModal(`<h3>[[muc_tieu]] ${c.name} · Cấp ${c.lv}</h3>
    ${c.elems && c.elems.length ? `<p>Hệ: <b>${SKILL_ELEMS[c.elems[0]]}</b></p>` : ''}
    ${rows || '<p class="muted">Không mang võ học nào.</p>'}
    <div class="row-btns"><button class="btn" onclick="G.closeModal()">Đóng</button></div>`);
}
function hudHtml(c) {
  const E = c.E || {}, pl = c.isPlayer;
  const face = pl ? (combat.actor ? ic(c.icon) : playerAvatar(P.sect, P.title, 'head', 'normal') || ic(c.icon)) : ic(c.icon);
  // Hệ hiện ngay dưới tên (người chơi: hệ nội công đang mang; quái: hệ của quái) để biết ai khắc ai
  const he = [...new Set(c.elems || [])].map(e => `<i class="tag elem-${e}">${SKILL_ELEMS[e]}</i>`).join('');
  // Cấp nằm ngay dưới ảnh tròn (người dùng chốt 2026-10-27), cả người chơi lẫn quái
  const sub = pl ? (combat.actor ? '' : sectName(P.sect)) : E.boss ? (E.tg ? 'Tinh Anh' : 'Boss') : ''; // quái mạnh của 20 map gọi là Tinh Anh (người dùng chốt 2026-10-27)
  const faceAttr = pl ? '' : ` onclick="G.enemyInfo()" role="button" tabindex="0" title="Xem võ học" aria-label="Xem võ học của ${c.name}"`;
  return `<div class="sd-facecol"><div class="sd-face${pl ? '' : ' tap'}"${faceAttr}>${face}</div><div class="sd-flv">Cấp ${c.lv}</div></div><div class="sd-info">
    <div class="sd-who"><b>${pl ? esc(c.name) : c.name}</b>${he}<span>${sub}</span></div>
    ${E.dummy ? dummyBar(c) : sdBar('hp', c.hp, c.maxHp)}${c.maxMp ? sdBar('mp', c.mp, c.maxMp) : ''}${c.chieu || !pl ? noBar(c) : ''}
    <div class="sd-stats">${hudStats(c)}</div>${clBar(c)}</div>`;
}
// Mộc nhân không chết (E.dummy, Ngộ Đạo Đài): thanh máu thay bằng tổng sát thương đã gây
const dummyBar = c => `<div class="sd-bar hp dummy"><i class="f" style="width:100%"></i><em>Sát thương ${Math.round(c.maxHp - c.hp).toLocaleString('vi-VN')}</em></div>`;
// Thanh nộ (người chơi mang bộ võ, mọi quái/boss; đầy thì sáng nhấp nháy)
const noBar = c => `<div class="sd-bar no${(c.no || 0) >= BO_NO.max ? ' full' : ''}"><i class="f" style="width:${barPct(c.no || 0, BO_NO.max)}%"></i><em>Nộ ${Math.floor(c.no || 0)} / ${BO_NO.max}</em></div>`;
// Thanh điểm riêng của từng bộ đang mang chiêu (Cuồng Long, Tâm Lực, Phật Ấn), nằm cuối bảng tên; tên + màu lấy ở BO_VO[x].diem
const clBar = c => (c.isPlayer && c.chieu ? chieuSets() : []).map(b => {
  const d = BO_VO[b].diem, n = clOf(c, b);
  return `<div class="sd-bar cl" title="${d.name}: điểm của ${BO_VO[b].name}, ${d.tip}"><i class="f" style="width:${barPct(n, clCap(n, b))}%;background:linear-gradient(90deg,${d.color[0]},${d.color[1]})"></i><em>${d.name} ${clText(n, b)}</em></div>`;
}).join('');
// Điểm không giới hạn (Tâm Lực): thanh tính trên mốc 20 (vượt thì đầy), chữ chỉ ghi số
const clCap = (n, b) => (isFinite(clMax(b)) ? clMax(b) : Math.max(20, n));
const clText = (n, b) => (isFinite(clMax(b)) ? `${n} / ${clMax(b)}` : `${n}`);
// Điểm riêng của bộ b đang có trong trận
const clOf = (c, b) => (c && c.cls && c.cls[b]) || 0;
function clSet(c, b, v) { (c.cls || (c.cls = {}))[b] = v; }
const hudStats = c => `<span title="Công">[[tan_cong]]${Math.round(effAtk(c))}</span><span title="Thủ">[[thu_the]]${Math.round(effDef(c))}</span><span title="Tốc độ">[[toc_do]]${effSpd(c)}</span>${c.lm ? `<span title="Liên Miên: ra kiếm Võ Đang liên tiếp thì mạnh dần" class="sd-lm">Liên Miên ${c.lm}</span>` : ''}`;
// Cập nhật bảng thông tin tại chỗ (không dựng lại), để vạch máu vừa mất tụt dần
function hudSet(side, c) {
  const h = el('hud-' + side);
  if (!h) return;
  h.querySelectorAll('.sd-bar').forEach(b => {
    if (b.classList.contains('no')) { b.outerHTML = noBar(c); return; }
    if (b.classList.contains('cl')) { b.outerHTML = clBar(c); return; }
    if (b.classList.contains('dummy')) { b.outerHTML = dummyBar(c); return; }
    const mp = b.classList.contains('mp'), v = mp ? c.mp : c.hp, max = mp ? c.maxMp : c.maxHp;
    b.querySelectorAll('i').forEach(i => { i.style.width = barPct(v, max) + '%'; });
    b.querySelector('em').textContent = `${Math.max(0, Math.round(v))} / ${Math.round(max)}`;
  });
  setHtml(h.querySelector('.sd-stats'), hudStats(c));
}
// Hình trên sân: nhân vật chính ghép tách lớp (tóc bay, đầu nhún); người được điều khiển (Tạ Cô Hồng...) và quái dùng hình chibi
function unitArt(side, c) {
  if (side === 'pl') {
    const A = combat.actor;
    if (A) return `<div class="sd-breath">${(typeof ENEMY_ART !== 'undefined' && ENEMY_ART[A.icon] && enemyArtSvg(A.icon, 'normal')) || ic(A.icon)}</div>`;
    const face = playerFace(), s = typeof sdLayered === 'function' ? sdLayered(P.sect, P.title, face) : playerAvatar(P.sect, P.title, 'body', face);
    return `<div class="sd-breath layered" data-face="${face}">${s || ic(SECTS[P.sect].icon)}</div>`;
  }
  return `<div class="sd-breath" data-face="${enemyFaceKey(c)}">${enemyArt(c) || ic(c.icon)}</div>`;
}
const enemyFaceKey = en => (combat.over ? 'over-' + combat.result : enemyFace(en));
// Thanh máu nhỏ trên đầu kẻ địch khi bên đó đông người
const miniHp = c => (!c.isPlayer && combat.ens.length > 1 ? `<div class="sd-mhp"><i style="width:${barPct(c.hp, c.maxHp)}%"></i></div>` : '');
function unitHtml(c, side) {
  const many = side === 'en' && combat.ens.length > 1;
  const [x, y] = side === 'en' ? sdSlot(combat.ens.length, c.uid, true) : sdSlot(1, 0, false);
  const hc = side === 'pl' && !combat.actor ? haloColor() : null;
  // Nội công có pháp trận riêng (SKILLS[x].circle, nội công tuyệt học) thì vẽ pháp trận dưới chân thay cho hào quang tròn
  const circ = side === 'pl' && !combat.actor && P.use.noicong[0] && SKILLS[P.use.noicong[0]].circle;
  const halo = side !== 'pl' || combat.actor ? '' : circ ? `<div class="sd-circle"><div class="ci"><img src="${circ}" alt=""></div></div>`
    : `<div class="sd-halo${hc ? '' : ' faint'}"${hc ? ` style="--hc:${hc}"` : ''}></div>`;
  return `<div class="sd-unit ${side}${c.boss ? ' boss' : ''}${c.hp <= 0 ? ' dead gone' : ''}${many && c === combat.en ? ' tgt' : ''}" id="${side === 'en' ? 'f-en-' + c.uid : 'f-pl'}"
    style="left:${x}%;top:${y}%;z-index:${10 + Math.round(y / 10)}"${many ? ` onclick="G.pickTarget(${c.uid})" role="button" aria-label="Chọn ${c.name} làm mục tiêu"` : ''}>
    ${c.boss ? SD_AURA : ''}${halo}${many ? '<div class="sd-ring-tgt"></div>' : ''}<div class="sd-shadow"></div><div class="sd-tag">${miniHp(c)}${sdChips(c)}</div><div class="sd-art">${unitArt(side, c)}</div>${hasBell(c) ? BELL_HTML : ''}${hasLong(c) ? longHtml() : ''}${hasPC(c) ? PC_HTML : ''}</div>`;
}
// Phật Quang Phổ Chiếu còn tác dụng: vòng Phật quang vàng có cánh sen trùm quanh người (ảnh Gemini người dùng 2026-11-09, CSS .sd-pc trong san_dau.js)
const hasPC = c => !!(c.fx && c.fx.hpUp && c.fx.hpUp.pc);
const PC_HTML = '<div class="sd-pc"><img src="game/img/fx_pho_chieu.png" alt=""></div>';
// Minh Vương Ấn còn tác dụng: chuông đồng mờ trùm quanh người (CSS .sd-bell trong san_dau.js)
const hasBell = c => !!(c.fx && c.fx.reduce && c.fx.reduce.bell);
const BELL_HTML = '<div class="sd-bell"><img src="game/img/fx_minh_vuong.png" alt=""></div>';
// Chiến Long Tại Dã còn tác dụng (3 lượt): rồng mờ cuộn quanh người như chuông Minh Vương (người dùng chốt 2026-11-07, CSS .sd-long trong san_dau.js).
// Ảnh vòng rồng vàng (Gemini người dùng tạo, fx_chien_long.png) bóp dẹt nằm ngang thắt lưng, xoay chậm cho rồng lượn quanh người;
// hai nửa: nửa sau (.back) nằm sau lưng nhân vật, nửa trước (.front) che trước người
const CHIEN_LONG_SRC = 'game/img/fx_chien_long.png', VONG_KHI_SRC = 'game/img/fx_vong_khi.png';
// Kiểu vòng (đang cho người dùng so trên trang thử 2026-11-07): 'rong' vòng rồng; 'khi' vòng khí vàng (fx_vong_khi.png); 'ca' vòng rồng + vòng khí to hơn bao ngoài
// 'quanh' (người dùng chốt 2026-11-08, dùng trong game): vòng khí dựng đứng sau lưng, nhân vật đứng gọn bên trong vòng (.sd-lk)
let CL_MODE = 'quanh';
const clRings = () => (CL_MODE === 'khi' ? [[VONG_KHI_SRC, 'khi']] : CL_MODE === 'ca' ? [[CHIEN_LONG_SRC, ''], [VONG_KHI_SRC, 'khi outer']] : [[CHIEN_LONG_SRC, '']]);
const hasLong = c => !!(c.fx && c.fx.chienLong);
const longHtml = () => (CL_MODE === 'quanh' ? `<div class="sd-lk"><img src="${VONG_KHI_SRC}" alt=""></div>`
  : clRings().map(([src, cls]) => ['back', 'front'].map(k => `<div class="sd-lg ${k} ${cls}"><img src="${src}" alt=""></div>`).join('')).join(''));
// Rồng (hoặc chuông) lóe sáng một nhịp: trúng đòn, đầu lượt Chiến Long +1 Cuồng Long
function auraFlash(u, sel) {
  if (u) u.querySelectorAll(sel).forEach(im => im.animate && im.animate([{ filter: 'brightness(1)', opacity: 0.5 }, { filter: 'brightness(2)', opacity: 1, offset: 0.25 }, { filter: 'brightness(1)', opacity: 0.5 }], { duration: fxRate(600) }));
}
// Đổi nét mặt, hiệu ứng trên đầu, trạng thái gục của một người mà không dựng lại hình
function unitSet(c) {
  const u = unitEl(c);
  if (!u) return;
  u.classList.toggle('dead', c.hp <= 0);
  // Cửu Dương Bất Diệt vừa cứu mạng: pháp trận nội công chớp sáng một nhịp
  if (c.lastStandUsed && !c.lastStandShown) {
    c.lastStandShown = true;
    // tên hiện lên = tên bậc có lastStand của nội công đang mang (vd. Dịch Cân Kinh: Tẩy Tủy Trùng Sinh)
    const nid = c.isPlayer && P.use && (P.use.noicong || [])[0], lt = nid && SKILLS[nid] && Object.values(SKILLS[nid].tiers || {}).find(x => x.lastStand);
    if (typeof sdCircleFlash === 'function') sdCircleFlash(u, lt ? lt.name : 'Bất Diệt');
  }
  setHtml(u.querySelector('.sd-tag'), miniHp(c) + sdChips(c));
  const bell = u.querySelector('.sd-bell');
  if (hasBell(c) && !bell) u.insertAdjacentHTML('beforeend', BELL_HTML);
  else if (!hasBell(c) && bell) bell.remove();
  const lg = u.querySelectorAll('.sd-lg, .sd-lk');
  if (hasLong(c) && !lg.length) u.insertAdjacentHTML('beforeend', longHtml());
  else if (!hasLong(c) && lg.length) lg.forEach(x => x.remove());
  const pc = u.querySelector('.sd-pc');
  if (hasPC(c) && !pc) u.insertAdjacentHTML('beforeend', PC_HTML);
  else if (!hasPC(c) && pc) pc.remove();
  const br = u.querySelector('.sd-breath');
  if (!br) return;
  if (c.isPlayer) { if (!combat.actor) sdSetFace(br, P.sect, P.title, playerFace()); return; }
  const k = enemyFaceKey(c);
  if (br.dataset.face !== k) { br.dataset.face = k; setHtml(br, enemyArt(c) || ic(c.icon)); }
}
// Số bay (sát thương, hồi máu, né...) trên đầu người trúng; trúng đòn thì người đó bị đẩy bẹp xuống, hồi máu thì có tim và lửa xanh
function placeFloats() {
  const stage = el('sd-stage'), jolted = new Set();
  combat.floats.forEach((f, i) => {
    const u = unitEl(f.c);
    if (!stage || !u) return;
    sdPop(stage, u, f.text, f.cls, i);
    if (f.cls === 'heal' && /^\+/.test(f.text)) sdSparks(u);
    if (!jolted.has(f.c) && f.cls !== 'heal' && f.cls !== 'miss') {
      jolted.add(f.c); sdSquash(u.querySelector('.sd-art'), SD_SQ.hurt(f.side === 'pl' ? 1 : -1), 480);
      auraFlash(u, '.sd-bell img'); // chuông Minh Vương lóe sáng khi đỡ đòn
      auraFlash(u, '.sd-lg img, .sd-lk img'); // vòng Chiến Long cũng vậy
    }
  });
  combat.floats = [];
}
// Hiện trước con số của một đòn (đòn sớm nhất chưa hiện) trên người bị đánh; phần còn lại hiện ở liveUpdate lúc đòn cuối chạm
function popPart(tgt) {
  const stage = el('sd-stage'), u = unitEl(tgt), i = combat ? combat.floats.findIndex(f => f.c === tgt && f.cls !== 'heal') : -1;
  if (!stage || !u || i < 0) return;
  const f = combat.floats.splice(i, 1)[0];
  sdPop(stage, u, f.text, f.cls, 0);
  if (f.cls !== 'miss') sdSquash(u.querySelector('.sd-art'), SD_SQ.hurt(f.side === 'pl' ? 1 : -1), 360);
}
const logLines = () => (combat.logOpen ? combat.log : combat.log.slice(-4)).map(m => `<div>${m}</div>`).join('');
function toggleLog() {
  if (!combat) return;
  combat.logOpen = !combat.logOpen;
  const l = el('sd-log');
  if (!l) return;
  l.classList.toggle('open', combat.logOpen);
  setHtml(el('clog'), logLines());
  l.querySelector('.sd-link').textContent = combat.logOpen ? 'Thu gọn' : 'Xem hết';
  el('clog').scrollTop = 1e6;
}
// Lúc đòn chạm: cập nhật máu, nhật ký, con số mà không dựng lại cả màn hình, để hiệu ứng chạy tiếp
function liveUpdate() {
  if (!combat) return;
  const { pl, en } = combat;
  if (!combat.over && !combat.actor) { P.hp = pl.hp; P.mp = pl.mp; }
  renderTop();
  hudSet('pl', pl); hudSet('en', en);
  unitSet(pl); combat.ens.forEach(unitSet);
  const lg = el('clog');
  if (lg) { setHtml(lg, logLines()); lg.scrollTop = lg.scrollHeight; }
  placeFloats();
}
/* ---------------------------- Hiệu ứng chiêu thức ----------------------------
   effects.js vẽ hiệu ứng. Thiếu file đó hoặc người chơi tắt hiệu ứng thì trận đấu chạy như cũ. */
const FX_KEY = 'giang_ho_hanh_fx';
const FX_SPEEDS = [['full', 'Đầy đủ'], ['fast', 'Nhanh'], ['off', 'Tắt']];
const hasFx = () => typeof FX !== 'undefined';
const fxOn = () => hasFx() && !FX.isOff();
function fxSpeed() {
  const def = hasFx() ? FX.defaultSpeed() : 'off';
  try { return localStorage.getItem(FX_KEY) || def; } catch (e) { return def; }
}
function setFxSpeed(s) {
  try { localStorage.setItem(FX_KEY, s); } catch (e) { /* chỉ đổi trong lần chơi này */ }
  if (hasFx()) FX.setSpeed(s);
  reopen(menuSystem);
}
// Tiếng của một đòn: theo kiểu chiêu (audio.js), đánh trượt hết thì là tiếng né
function turnSound(user, move) {
  if (!hasSnd() || !move) return;
  const tf = combat.floats.filter(f => f.c.isPlayer !== user.isPlayer);
  if (!move.self && tf.length && tf.every(f => f.cls === 'miss')) return SND.sfx('miss');
  SND.hit(move.fx ? move.fx.kind : 'thuong', tf.some(f => f.cls === 'crit'));
}
// Võ công → ảnh tạo dáng của nhân vật dùng ảnh vẽ sẵn (AVATAR_IMG.poses); đánh thường cũng dùng 'punch'.
// Ghi riêng ở SKILL_POSE, không có thì đoán theo tên: kiếm, đao → chém; bổng, côn, gậy → gậy; còn lại (quyền, chưởng, chỉ...) → đấm.
// Nhân vật thiếu ảnh dáng nào thì đứng nguyên ảnh thường.
const SKILL_POSE = { vo_danh_quyen: 'punch', luong_nghi_con: 'staff' };
function skillPose(id) {
  if (SKILL_POSE[id]) return SKILL_POSE[id];
  const s = SKILLS[id];
  if (!s || s.cat !== 'vocong') return undefined;
  return /Kiếm|Đao/.test(s.name) ? 'slash' : /Bổng|Côn|Gậy|Cẩu|Trượng/.test(s.name) ? 'staff' : 'punch';
}
// Chạy hiệu ứng của một đòn vừa tính xong; kết quả (máu, con số) hiện đúng lúc đòn chạm.
// Đòn đánh: (tuyệt chiêu thì có cảnh tung chiêu trước) đứng tại chỗ ra chiêu, hiệu ứng bay sang đối thủ. Chiêu lên mình: co người tụ khí tại chỗ.
async function playTurnFx(user, move) {
  if (!fxOn() || !move || !move.fx) { turnSound(user, move); return; }
  const side = user.isPlayer ? 'pl' : 'en', dir = user.isPlayer ? 1 : -1;
  const tgt = move.tgt || (user.isPlayer ? combat.en : combat.pl); // người bị đánh
  const stage = el('sd-stage'), me = unitEl(user), tg = unitEl(tgt);
  if (!stage || !me) return;
  const btns = document.querySelector('.combat-actions');
  if (btns) btns.classList.add('busy');
  const from = me.querySelector('.sd-breath') || me, to = move.self || !tg ? null : tg.querySelector('.sd-art');
  if (user.isPlayer && !combat.actor) sdSetFace(from, P.sect, P.title, 'attack');
  const tf = combat.floats.filter(f => f.c === tgt);
  if (move.self) {
    turnSound(user, move);
    sdSquash(me.querySelector('.sd-art'), SD_SQ.charge(), 600);
    return FX.play(move.fx.kind, { arena: stage, from, color: move.fx.color, big: move.fx.big, name: move.name, onHit: liveUpdate });
  }
  if (move.big) await sdCutIn(stage, side, user.isPlayer ? (combat.actor ? from.innerHTML : sdLayered(P.sect, P.title, 'attack')) : enemyArt(user), move.name);
  // Nhân vật có hình động (Meowa): hạ tấn đẩy chưởng xong mới tung chiêu, giữ dáng lúc chiêu bay, rồi hạ tay về thế đứng thở
  const am = user.isPlayer && !combat.actor && typeof avatarImgOf === 'function' && avatarImgOf(P.sect, P.title);
  const anim = am && am.anim ? am : null;
  if (anim) { from.innerHTML = avatarAnimSvg(anim, 'wind'); from.dataset.face = ''; await new Promise(r => setTimeout(r, fxRate(420))); }
  // Nhân vật có ảnh tạo dáng cho đòn này (vd. đấm khi ra Vô Danh Quyền): đổi ảnh lúc lao vào, lùi về thì trả lại
  const poseSvg = !anim && user.isPlayer && !combat.actor && move.pose && typeof avatarImgPose === 'function' ? avatarImgPose(P.sect, P.title, move.pose) : '';
  const restSvg = poseSvg ? from.innerHTML : '';
  if (poseSvg) { from.innerHTML = poseSvg; from.dataset.face = ''; }
  // Hai bên đứng tại chỗ ra chiêu, không lao vào nhau (người dùng chốt): người ra chiêu chỉ nhún người ra đòn.
  if (typeof sdMotion === 'function' && sdMotion()) sdSquash(me.querySelector('.sd-art'), SD_SQ.strike(dir), 330);
  let heard = false;
  if (tf.length && tf.every(f => f.cls === 'miss')) {
    turnSound(user, move);
    await FX.dodge({ arena: stage, from, to });
    liveUpdate();
  } else {
    await FX.play(move.fx.kind, {
      arena: stage, from, to, color: move.fx.color, big: move.fx.big, size: move.fx.size, name: move.big ? '' : move.name, hits: move.hits,
      // chiêu đánh cả sân (Thiên Cổ Lôi Âm): mọi kẻ địch khác cũng rung lên khi sóng chạm
      others: (move.aoe ? combat.ens.filter(e => e !== tgt) : move.spread ? [move.spread] : []).map(e => { const u = unitEl(e); return u && u.querySelector('.sd-art'); }).filter(Boolean),
      crit: tf.some(f => f.cls === 'crit'),
      finish: user.isPlayer && tgt.boss && tgt.hp <= 0,
      onHit: () => { if (!heard) { heard = true; turnSound(user, move); } liveUpdate(); },
      onHitPart: () => { turnSound(user, move); popPart(tgt); }, // chiêu nhiều đòn (vd. La Hán Quyền): hiện số của từng đòn đúng lúc nó chạm
    });
    if (!heard) turnSound(user, move);
  }
  if (poseSvg) await new Promise(r => setTimeout(r, 180));   // giữ dáng ra đòn thêm một nhịp
  if (poseSvg && from.isConnected) { from.innerHTML = restSvg; from.dataset.face = ''; sdSetFace(from, P.sect, P.title, playerFace()); }
  if (anim && from.isConnected) {
    from.innerHTML = avatarAnimSvg(anim, 'back');
    await new Promise(r => setTimeout(r, fxRate(400)));
    if (from.isConnected) from.innerHTML = avatarAnimSvg(anim, 'idle');
  }
}
// Thời gian hoạt cảnh theo tốc độ hiệu ứng đang chọn (Nhanh = một nửa)
const fxRate = ms => (typeof FX !== 'undefined' && FX.rate ? Math.round(ms * FX.rate()) : ms);
// Sao xoay trên đầu khi vừa bị choáng
function playStunFx(user, tgt) {
  snd('sfx', 'stun');
  if (!fxOn()) return Promise.resolve();
  const stage = el('sd-stage'), me = unitEl(user), tg = unitEl(tgt || (user.isPlayer ? combat.en : combat.pl));
  return stage && me && tg ? FX.play('choang', { arena: stage, from: me.querySelector('.sd-breath') || me, to: tg.querySelector('.sd-art') }) : Promise.resolve();
}
const turnGap = slow => (fxOn() ? 300 : slow);
// Võ công đang dùng trong trận: của nhân vật, hoặc của người mình đang điều khiển
const cSkills = () => (combat.actor ? combat.actor.skills : P.skills);
const cSkillIds = () => (combat.actor ? Object.keys(combat.actor.skills).filter(id => SKILLS[id].type !== 'passive') : activeSkills());
const noFlee = () => combat.opts.noFlee || combat.boss;

// Vật phẩm trong trận: chọn loại tốt nhất đang có cho từng nút (máu / nội lực / đan dược). Đang trúng độc thì nút máu ưu tiên thuốc giải độc.
function bestItem(kind) {
  if (combat.actor) return null;
  const poisoned = !!combat.pl.fx.poison;
  const fit = it => it.type === 'use' && !(it.lv && P.lv < it.lv) && (kind === 'dan' ? !!it.regen
    : kind === 'mp' ? !!it.mp && !it.heal && !it.regen : !it.regen && (!!it.heal || (poisoned && !!it.cure)));
  const val = it => (kind === 'hp' ? (poisoned && it.cure ? 1e6 : 0) + (it.heal || 0) : kind === 'mp' ? it.mp : it.regen.hp + it.regen.mp);
  return Object.keys(P.inv).filter(id => P.inv[id] > 0 && fit(ITEMS[id])).sort((a, b) => val(ITEMS[b]) - val(ITEMS[a]))[0] || null;
}
// Thanh chiêu: hàng nút tròn (đánh thường, võ công, công pháp đang mang) và hàng vật phẩm (máu, nội lực, đan, bỏ chạy). Không còn nút thủ thế.
function combatActions() {
  const { pl } = combat, sks = cSkills();
  const basic = !combat.actor && BASIC_SKILL && P.skills[BASIC_SKILL]; // Vô Danh Quyền đứng chỗ nút đánh thường
  const ids = [...(basic ? [BASIC_SKILL] : []), ...cSkillIds().filter(id => !isBasic(id))];
  const noId = !combat.actor && pl.chieu && chieuOf().no && P.skills[chieuOf().no] ? chieuOf().no : null; // Nộ chiêu chưa đầy nộ vẫn hiện, bị khóa
  if (noId && !ids.includes(noId)) ids.push(noId);
  const skills = ids.map(id => {
    const lv = combat.actor ? sks[id].lv : skLv(id), ns = normSkill(id, lv), ok = elemOk(id, combat.actor), lack = pl.mp < ns.mp, isNo = SKILLS[id].no;
    const why = !ok ? `Cần hệ ${SKILL_ELEMS[SKILLS[id].elem]}` : isNo && pl.no < BO_NO.max ? 'Cần đầy nộ' : lack ? 'Thiếu nội lực' : '';
    return `<button class="sd-sk" type="button" ${why ? 'disabled' : ''} onclick="G.act('skill','${id}')" aria-label="${ns.name}, ${isNo ? 'chiêu nộ' : ns.mp + ' nội lực'}">
      <span class="sd-ring">${skIcon(id)}${chieuRole(id) ? `<i class="ch-tag ch-${chieuRole(id)}">${CHIEU_TAG[chieuRole(id)]}</i>` : ''}</span><span class="sd-cost">${isNo ? 'Nộ' : ns.mp}</span>${why ? `<span class="sd-why">${why}</span>` : ''}<span class="nm">${ns.name}</span></button>`;
  }).join('');
  const item = (kind, label) => {
    const id = bestItem(kind), it = id && ITEMS[id];
    return `<button class="sd-mb" type="button" ${id ? '' : 'disabled'} onclick="G.act('item','${id}')" aria-label="${label}${it ? ': ' + it.name : ''}">[[${it ? it.icon : kind === 'mp' ? 'hoi_khi_dan' : kind === 'dan' ? 'duong_khi_hoan' : 'kim_sang_duoc'}]]<span>${label}${it ? ' ×' + P.inv[id] : ''}<small>${it ? it.name : 'Hết'}</small></span></button>`;
  };
  const normal = basic ? '' : `<button class="sd-sk" type="button" onclick="G.act('attack')" aria-label="Đánh thường"><span class="sd-ring">[[tan_cong]]</span><span class="nm">Đánh thường</span></button>`;
  return `<div class="sd-skills">${normal}${skills}</div>
    <div class="sd-minor">${POTION_OFF ? '' : item('hp', 'Máu') + item('mp', 'Nội lực') + item('dan', 'Đan')}
      <button class="sd-mb" type="button" ${noFlee() ? 'disabled' : ''} onclick="G.act('flee')">[[bo_chay]]<span>Bỏ chạy<small>${noFlee() ? 'Không chạy được' : 'Thoát khỏi trận'}</small></span></button></div>`;
}
// Màn kết trận: băng rôn mực, phần thưởng (hoặc lời truyện), tổng kết trận, nút đi tiếp. Phủ cả màn hình.
function combatResult() {
  const r = combat.resultData || { cls: combat.result, lines: [], btn: 'Tiếp tục ➜' }, st = combat.stat;
  const title = r.cls === 'win' ? 'Chiến Thắng' : r.cls === 'lose' ? 'Thất Thủ' : 'Rời Trận';
  const top = Object.entries(st.uses).sort((a, b) => b[1] - a[1])[0];
  const rows = [['Số lượt', st.turns], ['Sát thương gây ra', st.dealt], ['Nhát mạnh nhất', st.maxHit], ['Số nhát bạo kích', st.crits], ['Sát thương nhận vào', st.taken]]
    .concat(st.absorbed ? [['Nội lực đã đỡ đòn', st.absorbed]] : [], [['Khí huyết hồi lại', st.healed], ['Dùng nhiều nhất', top ? `${top[0]} ×${top[1]}` : '—']]);
  return `<div class="sd-result ${r.cls}"><div class="sd-card">
    <div class="sd-banner">${sdInk(false, r.cls === 'win' ? '#b3261e' : '#4a4038')}<h2>${title}</h2></div>
    ${r.lines.length ? `<div class="sd-rew">${r.lines.map(l => `<div>${l}</div>`).join('')}</div>` : ''}
    <div class="sd-sum"><div class="hd">Tổng kết trận · ${combat.ens.length > 1 ? combat.ens.length + ' kẻ địch' : combat.en.name}</div>${rows.map(([a, b]) => `<span>${a}</span><b>${typeof b === 'number' ? b.toLocaleString('vi-VN') : b}</b>`).join('')}</div>
    <button class="btn primary big" onclick="G.leaveCombat()">${r.btn}</button></div></div>`;
}
function renderCombat() {
  if (typeof sdStyle === 'function') sdStyle();
  retarget();
  const { pl, en } = combat;
  if (!combat.over && !combat.actor) { P.hp = pl.hp; P.mp = pl.mp; }
  renderTop();
  // survLabel: đếm lượt kiểu khác (vd. Ngộ Đạo Đài "Lượt 3/10", thi_luyen.js)
  const goal = (combat.opts.survive && !combat.over ? ` · ${combat.opts.survLabel || 'Đỡ chiêu'} ${combat.survived}/${combat.opts.survive}` : '')
    + (combat.opts.stageText ? ` · ${combat.opts.stageText}` : '');
  const where = combat.actor ? `Ngươi đang điều khiển ${combat.actor.name}` : LOCATIONS[P.loc].name;
  const turn = combat.over ? 'Trận đấu kết thúc' : combat.busy ? 'Đối thủ đang ra tay…' : 'Lượt của ngươi';
  show(`<div class="sd-wrap combat-wrap">
    <div class="sd-huds"><div class="sd-hud pl" id="hud-pl">${hudHtml(pl)}</div><div class="sd-hud en" id="hud-en">${hudHtml(en)}</div></div>
    <div class="sd-stage" id="sd-stage" aria-label="Sân đấu">
      <div class="sd-scene">${typeof sanDauArt === 'function' && sanDauArt() ? sanDauHtml()
        : typeof canhArt === 'function' && canhArt(P.loc) ? (canhStyle(), `<img class="sd-art" src="${canhArt(P.loc)}" alt="">`) : sdSceneSvg(sdSceneKey(locView(P.loc).bg))}</div><div class="sd-vig"></div>
      <div class="sd-turn ${combat.over || combat.busy ? '' : 'mine'}">${combat.boss && !combat.over ? '[[tu_vong]] ' : ''}${turn}${goal && !combat.over ? goal : ''}</div>
      <div class="sd-place">${where}</div>
      ${unitHtml(pl, 'pl')}${combat.ens.map(e => unitHtml(e, 'en')).join('')}
    </div>
    ${combat.over ? combatResult() : `<div class="sd-actions combat-actions ${combat.busy ? 'busy' : ''}">${combatActions()}</div>`}
    <div class="sd-log ${combat.logOpen ? 'open' : ''}" id="sd-log"><div class="sd-lines-log" id="clog">${logLines()}</div>
      <button class="sd-link" type="button" onclick="G.toggleLog()">${combat.logOpen ? 'Thu gọn' : 'Xem hết'}</button></div>
  </div>`, 'combat');
  document.body.style.overflow = combat.over ? 'hidden' : ''; // bảng kết trận phủ màn hình: khóa cuộn để không lộ nút bên dưới
  const lg = el('clog');
  lg.scrollTop = lg.scrollHeight;
  placeFloats();
  if (combat.over && combat.result === 'win' && !combat.actor && !combat.hopped) { // thắng thì nhảy cẫng
    combat.hopped = true;
    const a = document.querySelector('#f-pl .sd-art');
    (async () => { for (let i = 0; i < 3; i++) { await sdSquash(a, SD_SQ.hop(), 620); await sdWait(120); } })();
  }
  if (typeof autoCombat === 'function') autoCombat(); // đang tự động luyện công thì tự ra chiêu (tu_dong.js)
}
function cmenu(m) {
  if (!combat || combat.busy || combat.over) return;
  combat.menu = m;
  renderCombat();
}

// Chính xác trừ vào né tránh, kháng bạo kích trừ vào bạo kích.
// o: critBonus, noCritRes (bỏ qua kháng bạo kích), critDmgUp (+% sát thương bạo kích), sureCrit (trúng là bạo kích)
const CHARM_MISS = 80; // % đòn trượt thêm khi bị mê hoặc
const PHE_HON = { step: 2, max: 10 }; // Phệ Hồn: mỗi lần mất 2% khí huyết tối đa, tối đa 10%, tới hết trận
function hitCalc(att, tgt, power, o = {}) {
  if (roll(clamp(effDodge(tgt) - (effAcc(att) - weakVal(att, 'acc')), 0, 75))) return { miss: true };
  // Mê hoặc (quái Thung Lũng Tiêu Dao, người dùng chốt 2026-11-06): tỉ lệ đánh trúng giảm 80%
  if (att.fx && att.fx.charm && roll(CHARM_MISS)) return { miss: true, charm: true };
  const d = effDef(tgt) * (1 - (o.pierce || 0) / 100); // pierce: bỏ qua một phần thủ
  // Sát thương = công × % chiêu × công ÷ (công + thủ) (người dùng chốt 2026-10-27: công 500 đánh thủ 500 thì còn một nửa)
  const A = Math.max(0, effAtk(att));
  let dmg = A * power * (A + d > 0 ? A / (A + d) : 0) * (0.9 + Math.random() * 0.2);
  const crit = o.sureCrit || roll(att.crit + fxVal(att, 'crit') - weakVal(att, 'crit') + (o.critBonus || 0) - (o.noCritRes ? 0 : tgt.critRes));
  // Sơ hở trên đối thủ (Vô Danh Kiếm Pháp tầng 5): mỗi tầng +10% sát thương bạo kích; giảm sát thương bạo của bên bị đánh
  if (crit) dmg *= Math.max(100, att.critDmg + fxVal(att, 'critDmg') + (o.critDmgUp || 0) + (tgt.fx && tgt.fx.soho ? tgt.fx.soho.n * 10 : 0) - (tgt.critDmgRes || 0)) / 100;
  if (tgt.guard) dmg *= 0.5;
  return { dmg: Math.max(1, Math.round(dmg)), crit };
}
function heal(c, n) {
  if (c.fx && c.fx.noithuong) n = Math.round(n * Math.max(0, 1 - noiVal(c, 'heal') / 100));
  // Trường Sinh Quyết: bậc 3 hồi máu +10%, bậc 9 khí huyết dưới 30% thì hồi gấp đôi
  const pt = c.pt || {};
  if (pt.healUp) n = Math.round(n * (1 + pt.healUp / 100));
  if (pt.lowHeal && c.hp < c.maxHp * 0.3) n *= 2;
  const h = Math.min(n, c.maxHp - c.hp);
  c.hp += h;
  if (c.isPlayer && combat && combat.stat) combat.stat.healed += Math.max(0, h);
  if (h > 0) float(c, '+' + h, 'heal');
  return h;
}
// Nội công/khinh công đang mang có immune: ['poison'...] thì miễn nhiễm hiệu ứng đó (vd. Chu Cáp Thần Công)
const playerImmune = type => !combat.actor && usedPassives().some(id => (SKILLS[id].immune || []).includes(type));
function applyEffect(user, tgt, e) {
  if (tgt.isPlayer && playerImmune(e.type)) { clog(`→ ${who(tgt)} bách độc bất xâm, không hề hấn gì!`); return; }
  const dotUp = 1 + ((user.pt || {}).dotUp || 0) / 100; // mốc tầng: độc, chảy máu mạnh hơn
  if (e.type === 'stun' && tgt.pt && tgt.pt.stunResist && roll(tgt.pt.stunResist)) { clog(`→ ${who(tgt)} định thần, không bị choáng!`); return; }
  if (e.type === 'poison') {
    tgt.fx.poison = { turns: e.turns, value: Math.max(1, Math.round(effAtk(user) * e.value * dotUp)) };
    clog(`→ ${who(tgt)} <b class="poison">trúng độc</b>! (${e.turns} lượt)`);
  } else if (e.type === 'stun') {
    if (tgt.justStunned) return; // vừa bị choáng xong thì miễn nhiễm một lượt
    if (tgt.boss && roll(50)) { clog(`→ ${who(tgt)} vận công kháng cự, không bị choáng!`); return; }
    tgt.fx.stun = { turns: e.turns };
    clog(`→ ${who(tgt)} bị <b class="stun">choáng</b>!`);
  } else if (e.type === 'bleed') {
    tgt.fx.bleed = { turns: e.turns, value: Math.max(1, Math.round(effAtk(user) * e.value * dotUp)) };
    clog(`→ ${who(tgt)} <b class="bleed">chảy máu</b>! (${e.turns} lượt)`);
  } else if (e.type === 'phehon') {
    // Phệ Hồn (quái Hồ Kỳ Sơn, người dùng chốt 2026-11-06): mất 2% khí huyết tối đa tới hết trận, cộng dồn tối đa 10%
    const f = tgt.fx.phehon || (tgt.fx.phehon = { n: 0, base: tgt.maxHp });
    if (f.n * PHE_HON.step >= PHE_HON.max) return;
    f.n++;
    const cut = Math.max(1, Math.round(f.base * PHE_HON.step / 100));
    tgt.maxHp = Math.max(1, tgt.maxHp - cut);
    tgt.hp = Math.min(tgt.hp, tgt.maxHp);
    clog(`→ ${who(tgt)} bị <b class="dmg">Phệ Hồn</b>, khí huyết tối đa -${cut} (đã mất ${f.n * PHE_HON.step}%).`);
  } else if (e.type === 'charm') {
    tgt.fx.charm = { turns: e.turns || 2 };
    clog(`→ ${who(tgt)} bị <b class="stun">mê hoặc</b>, tâm thần mơ hồ, khó đánh trúng! (${e.turns || 2} lượt)`);
  }
}
// Hiệu ứng mốc tầng khi một nhát bạo kích trúng (sk: chiêu đã qua normSkill, user.pt: mốc tầng bị động)
function onCrit(user, tgt, sk, dmg, done) {
  const up = user.pt || {};
  if (sk.critStun && !done.stun && tgt.hp > 0) { done.stun = true; applyEffect(user, tgt, { type: 'stun', turns: sk.critStun }); }
  if (sk.critBleed && !done.bleed && tgt.hp > 0) { done.bleed = true; applyEffect(user, tgt, { type: 'bleed', turns: sk.critBleed, value: 0.3 }); }
  if (sk.openStack && tgt.hp > 0) {
    const s = tgt.fx.soho = tgt.fx.soho || { n: 0, turns: 3 };
    s.n = Math.min(10, s.n + 1);
    s.turns = 3;
  }
  if (up.critMp && user.maxMp) {
    const m = Math.min(user.maxMp - user.mp, Math.round(user.maxMp * up.critMp / 100));
    if (m > 0) { user.mp += m; clog(`→ ${who(user)} khí hồi đan điền, hồi <b class="mpc">${m}</b> nội lực.`); }
  }
  if (up.critHeal) {
    const h = heal(user, Math.round(dmg * up.critHeal / 100));
    if (h) clog(`→ ${who(user)} huyết khí tương sinh, hồi <b class="heal">${h}</b> khí huyết.`);
  }
  // Hàng Long Quyết bậc 10: bạo kích thì thêm sát thương = critHp% khí huyết tối đa kẻ bị đánh, mỗi lần ra chiêu một lần
  // (mộc nhân Ngộ Đạo Đài khí huyết 1e9 không tính, kẻo kinh nghiệm theo sát thương bị đội lên)
  if (up.critHp && !done.critHp && tgt.hp > 0 && !(tgt.E && tgt.E.dummy)) {
    done.critHp = true;
    const x = lethalGuard(tgt, manaShield(tgt, Math.max(1, Math.round(tgt.maxHp * up.critHp / 100))));
    tgt.hp = Math.max(0, tgt.hp - x);
    if (combat && combat.stat && user.isPlayer) combat.stat.dealt += x;
    clog(`→ Long khí xuyên thấu, ${who(tgt)} mất thêm <b class="dmg">${x}</b> khí huyết.`);
    float(tgt, '-' + x, 'crit');
  }
}

// Cửu Dương Bất Diệt (lastStand): đòn nào làm chết (chiêu, đánh thường, độc, chảy máu, phản đòn...) thì còn lại 1 khí huyết, mỗi trận một lần
function lethalGuard(c, dmg) {
  if (!c.pt || !c.pt.lastStand || c.lastStandUsed || dmg < c.hp || c.hp <= 0) return dmg;
  c.lastStandUsed = true;
  clog(`→ Chân khí hộ tâm mạch, ${who(c)} gượng trụ lại với 1 khí huyết!`);
  if (c.pt.lastHeal) c.pendHeal = c.pt.lastHeal; // Thiền Định Công bậc 10: rồi hồi ngay % khí huyết tối đa (hpGates)
  return c.hp - 1;
}
// Sau khi mất khí huyết: Thiền Định Công bậc 3 / 6 / 9 (lần đầu xuống dưới 75 / 50 / 25% thì hồi ngay), bậc 10 hồi sau khi gượng
function hpGates(c) {
  if (!c || !c.pt || c.hp <= 0) return;
  if (c.pendHeal) {
    const h = heal(c, Math.round(c.maxHp * c.pendHeal / 100));
    c.pendHeal = 0;
    if (h) clog(`→ Thiền tâm bất động, ${who(c)} hồi <b class="heal">${h}</b> khí huyết.`);
  }
  [[75, 'gate75'], [50, 'gate50'], [30, 'gate30'], [25, 'gate25']].forEach(([p, k]) => { // gate30: Trường Sinh Quyết bậc 10
    if (!c.pt[k] || (c.gates || {})[p] || c.hp >= c.maxHp * p / 100) return;
    (c.gates = c.gates || {})[p] = true;
    const h = heal(c, Math.round(c.maxHp * c.pt[k] / 100));
    if (h) clog(`→ Thiền định hộ thân, ${who(c)} hồi <b class="heal">${h}</b> khí huyết.`);
  });
}
// Cửu Âm Chân Kinh tầng 10: nội lực đỡ sát thương (chiêu, đánh thường, phản đòn, độc, chảy máu);
// manaShield % trừ vào nội lực, không trừ xuống dưới 10% nội lực tối đa; trả về phần còn trừ vào khí huyết
function manaShield(c, dmg) {
  const p = (c.pt || {}).manaShield;
  if (!p || dmg <= 0 || !c.maxMp) return dmg;
  const take = Math.min(Math.round(dmg * p / 100), c.mp - Math.ceil(c.maxMp * 0.1));
  if (take <= 0) return dmg;
  c.mp -= take;
  if (c.isPlayer && combat && combat.stat) combat.stat.absorbed += take;
  clog(`→ Cửu âm chân khí hộ thể, ${who(c)} dùng <b class="mpc">${take}</b> nội lực đỡ sát thương.`);
  return dmg - take;
}
// Liên Miên (kiếm Võ Đang, mốc tầng 5): mỗi lượt ra kiếm có lmPct thì +1 tầng, mỗi tầng +lmPct% sát thương (tối đa lmMax của môn đang ra);
// ra chiêu tấn công khác (cả đánh thường) thì mất hết. Trả về phần cộng vào hệ số sát thương.
function lmUse(user, sk) {
  if (!sk.lmPct) {
    if (user.lm) { user.lm = 0; if (user.isPlayer) clog('→ Kiếm thế đứt đoạn, Liên Miên tan biến.'); }
    return 0;
  }
  const n = Math.min(user.lm || 0, sk.lmMax || 0);
  if (n) clog(`→ Kiếm thế liên miên <b>${n}</b> tầng, sát thương +${n * sk.lmPct}%.`);
  user.lm = Math.min(10, (user.lm || 0) + 1);
  return n * sk.lmPct / 100;
}
// Hút thừa thành giáp (Lưỡng Nghi, Chân Vũ tầng 10): phần hút máu không hồi được vì máu đầy thành giáp ảo, tối đa pct% khí huyết tối đa
function overDrainShield(user, extra, pct) {
  const v = Math.min(Math.round(extra), Math.round(user.maxHp * pct / 100));
  if (v <= 0 || (user.fx.shield && user.fx.shield.value >= v)) return;
  user.fx.shield = { value: v };
  clog(`→ Huyết khí tràn đầy, ngưng thành giáp ảo đỡ được <b>${v}</b> sát thương.`);
}
/* Bộ võ trong trận. Nộ: chỉ tăng khi mình gây sát thương (sát thương ÷ khí huyết tối đa × 100, mỗi chiêu tối đa BO_NO.cap).
   Hàng Long: điểm Cuồng Long (cls.hang_long); giới hạn và tác dụng theo mốc tầng 5 / 10 của từng chiêu đang mang (hlT, clMax, clBoost). */
// Tầng Hư chiêu của bộ b nếu đang mang ở ô Hư (trong trận của người chơi), không thì 0 (ô Hư đã bỏ 2026-11-07 nên luôn 0)
const huLv = b => { const pl = combat && combat.pl; return pl && pl.chieu ? huLvOf(b) : 0; };
// Như Lai: tầng Phật Pháp Vô Biên (Hư chiêu); điểm Phật Ấn (cls.nhu_lai), tối đa 10
const nlLv = () => huLv('nhu_lai');
// Tâm Phật (người dùng chỉnh trong Google Sheet 2026-11-05): tầng Tịch Diệt Gia Trì (Hư chiêu); điểm Tâm Lực (cls.tam_phat), KHÔNG giới hạn
const tdLv = () => huLv('tam_phat');
// Bồ Tát Ấn mỗi Tâm Lực +8% (tầng 4: 10%); Thiên Cổ Lôi Âm từ tầng 9 tiêu hết, mỗi Tâm Lực +15%, tầng 10 hút 10% sát thương thành khí huyết;
// phản đòn mỗi Tâm Lực 1% (tầng 3), 2% (tầng 7, thay tầng 3)
const TP_RULE = { burst: g => (g >= 4 ? 10 : 8), loiAm: 15, loiAmDrain: 10, thorns: g => (g >= 7 ? 2 : g >= 3 ? 1 : 0) };
// Giới hạn điểm riêng của bộ b: Tâm Lực không giới hạn, Phật Ấn 10, Cuồng Long theo tầng Giao Long
// Hàng Long (người dùng chốt 2026-11-07, sau khi bỏ ô Hư): tác dụng Cuồng Long nằm ở mốc tầng 5 / 10 của từng chiêu đang mang.
// hlT(role) = mốc tầng (tierFx) của chiêu ở vai đó nếu đang mang ở ô Chiêu thức, không thì {}
const boT = (b, role) => {
  const id = BO_VO[b].roles[role], pl = combat && combat.pl;
  return pl && pl.chieu && P.skills[id] && chieuWorn().includes(id) ? tierFx(id, skLv(id)) : {};
};
const hlT = role => boT('hang_long', role);
// Như Lai (làm lại 2026-11-09): Phật Quang Sơ Hiện tầng 5 nâng Phật Ấn tối đa 10 → 20
const nlT = role => boT('nhu_lai', role);
const clMax = b => {
  if (b === 'tam_phat') return Infinity;
  if (b === 'nhu_lai') return 10 + (nlT('danh1').nlMax || 0);
  return 10 + (hlT('danh1').hlMax || 0); // Song Long tầng 5 / 10: tối đa 20 / 30
};
// Phật Pháp Vô Biên: thủ +2% (tầng 1) +3% (tầng 5), khí huyết tối đa +2% (tầng 2) +3% (tầng 7), mỗi Phật Ấn giảm 2% (tầng 3) +1% (tầng 8) sát thương nhận
// (người dùng chốt 2026-11-02: tổng tối đa 30% với 10 Phật Ấn)
const NL_RULE = { def: g => (g >= 1 ? 2 : 0) + (g >= 5 ? 3 : 0), hp: g => (g >= 2 ? 2 : 0) + (g >= 7 ? 3 : 0), red: g => (g >= 3 ? 2 : 0) + (g >= 8 ? 1 : 0) };
/* Đại Nhật Thần Chưởng (người dùng chốt 2026-11-09): Dương Viêm nằm trên người địch (e.fx.dv = { n }), tối đa DV_RULE.max tầng,
   giữ tới hết trận. Đầu lượt kẻ đó (startTurn → dvTick): mỗi tầng đốt DV_RULE.pct % công người chơi (Nhật Xuất tầng 10: 10%),
   bỏ qua thủ; Cửu Nhật Lăng Không còn hiệu lực thì lửa đốt + cnUp % và (tầng 10) hồi khí huyết % lửa đốt. Kích nổ ở act (dvBurst). */
const DV_RULE = { max: 10, pct: 5 };
const dnT = role => boT('dai_nhat', role);
function dvAdd(e, n) {
  if (!e || e.isPlayer || e.hp <= 0 || !(n > 0)) return;
  const f = e.fx.dv || (e.fx.dv = { n: 0 });
  f.n = Math.min(DV_RULE.max, f.n + n);
}
function dvTick(c) {
  const f = c.fx.dv, pl = combat && combat.pl;
  if (!f || !f.n || !pl || c.isPlayer || c.hp <= 0) return;
  const pct = dnT('danh1').dvPct || DV_RULE.pct, cn = pl.fx.cuuNhat;
  const d = Math.max(1, Math.round(effAtk(pl) * f.n * pct / 100 * (1 + (cn ? cn.up : 0) / 100)));
  c.hp = Math.max(0, c.hp - d);
  if (combat.stat) combat.stat.dealt += d;
  clog(`[[lua]] Dương Viêm ${f.n} tầng thiêu đốt, ${who(c)} mất <b class="dmg">${d}</b> khí huyết.`);
  float(c, '-' + d, 'dmg');
  if (cn && cn.heal && pl.hp > 0) { const h = heal(pl, Math.round(d * cn.heal / 100)); if (h) clog(`→ Nhật hỏa dưỡng thân, ${who(pl)} hồi <b class="heal">${h}</b> khí huyết.`); }
}
// Kích nổ Dương Viêm trên e (chiêu nộ): mỗi tầng pct % công, bỏ qua thủ; keep % số tầng còn lại sau khi nổ
function dvBurst(pl, e, pct, keep) {
  const f = e.fx.dv;
  if (!f || !f.n || e.hp <= 0) return;
  const n = f.n, d = Math.max(1, Math.round(effAtk(pl) * n * pct / 100));
  e.hp = Math.max(0, e.hp - d);
  combat.stat.dealt += d; combat.stat.maxHit = Math.max(combat.stat.maxHit, d);
  clog(`→ <b>${n}</b> tầng Dương Viêm trên ${who(e)} nổ tung, mất <b class="dmg">${d}</b> khí huyết!`);
  float(e, '-' + d, 'crit');
  const k = keep ? Math.floor(n * keep / 100) : 0;
  if (k > 0) f.n = k; else delete e.fx.dv;
}
// Cửu Dương Thần Công bậc 10: kẻ địch gục khi còn Dương Viêm thì lửa truyền sang một kẻ khác ngẫu nhiên; không có thì lửa tắt
function dvDeaths() {
  if (!combat || !combat.ens) return;
  const pass = combat.pl && combat.pl.pt && combat.pl.pt.dvPass;
  combat.ens.forEach(e => {
    if (e.hp > 0 || !e.fx.dv) return;
    const n = e.fx.dv.n, live = aliveEns();
    delete e.fx.dv;
    if (pass && n && live.length) { const o = live[rand(0, live.length - 1)]; dvAdd(o, n); clog(`→ Cửu Dương bất diệt, ${n} tầng Dương Viêm truyền sang ${who(o)}!`); }
  });
}
// Kẻ địch đứng sát mục tiêu trên sân (ô kề nhau trong đội hình 6 ô), gần nhất trước, tối đa n
function nearEns(t, n) {
  if (typeof sdSlot !== 'function') return [];
  const N = combat.ens.length, [tx, ty] = sdSlot(N, t.uid, true);
  return aliveEns().filter(e => e !== t).map(e => { const [x, y] = sdSlot(N, e.uid, true); return { e, d: Math.hypot(x - tx, y - ty) }; })
    .filter(o => o.d <= 26).sort((a, b) => a.d - b.d).slice(0, n).map(o => o.e);
}
// Thêm n điểm riêng của bộ (Cuồng Long, Phật Ấn); đang có Chiến Long Tại Dã thì mỗi điểm vượt giới hạn hồi 1% bên đang thấp hơn (khí huyết hoặc nội lực)
function clAdd(c, n, b) {
  if (!c || !c.isPlayer || !c.chieu || !BO_VO[b] || !BO_VO[b].diem || n <= 0) return;
  let hh = 0, mm = 0;
  for (let i = 0; i < n; i++) {
    if (clOf(c, b) < clMax(b)) { clSet(c, b, clOf(c, b) + 1); continue; }
    if (b !== 'hang_long' || !c.fx.chienLong) continue;
    if (c.hp / c.maxHp <= c.mp / c.maxMp) hh += Math.round(c.maxHp * 0.01);
    else mm += Math.min(c.maxMp - c.mp - mm, Math.round(c.maxMp * 0.01));
  }
  const h = hh ? heal(c, hh) : 0;
  if (mm > 0) c.mp += mm;
  if (h || mm > 0) clog(`→ Long khí tràn đầy, hồi${h ? ` <b class="heal">${h}</b> khí huyết` : ''}${mm > 0 ? `${h ? ',' : ''} <b class="mpc">${mm}</b> nội lực` : ''}.`);
}
// Cuồng Long làm chiêu mạnh thêm (mốc tầng, người dùng chốt 2026-11-07): Long Tiếu tầng 5 / 10 và Loạn Vũ tầng 5 chỉ cho chính chiêu đó;
// Chiến Long tầng 10: trong 3 lượt hiệu lực (fx.chienLong), mỗi điểm +1% bạo kích cho MỌI chiêu đánh
function clBoost(pl, id, ns) {
  const B = BO_VO.hang_long.roles, cl = clOf(pl, 'hang_long');
  if (!cl || SKILLS[id].type !== 'attack') return;
  const own = [B.danh2, B.no].includes(id) ? tierFx(id, skLv(id)) : {}, all = pl.fx.chienLong ? hlT('phutro').hlCritAll || 0 : 0;
  const crit = (own.hlCrit || 0) + all, cd = own.hlCritDmg || 0;
  if (crit) ns.critBonus = (ns.critBonus || 0) + cl * crit;
  if (cd) ns.critDmgUp = (ns.critDmgUp || 0) + cl * cd;
}
function noGain(pl, dmg) {
  if ((pl.isPlayer && !pl.chieu) || dmg <= 0) return;
  pl.no = Math.min(BO_NO.max, (pl.no || 0) + Math.min(BO_NO.cap, dmg / pl.maxHp * 100));
}
// Thực hiện một chiêu (dùng chung cho người chơi và quái)
function doSkill(user, tgt, sk) {
  if (sk.type === 'attack') {
    if (sk.normal) clog(user.isPlayer ? `${who(user)} xuất chiêu tấn công.` : `${who(user)} tấn công!`);
    else if (!sk.quiet) clog(`${who(user)} thi triển <b class="skill">${sk.name}</b>!`);
    let total = 0, landed = false;
    const tp = tgt.pt || {}, up = user.pt || {}, done = {};
    let n = sk.hits || 1;
    // Thất Sát Kiếm Pháp tầng 10: chém thêm ngẫu nhiên 1 / 2 / 3 nhát (50 / 30 / 20%), mỗi nhát thêm hồi % nội lực tối đa
    if (sk.randHits) {
      const r = Math.random() * 100, add = r < 50 ? 1 : r < 80 ? 2 : 3;
      n += add;
      sk.hitsDone = n; // để hiệu ứng vẽ đúng số nhát
      const m = sk.hitMp && user.maxMp ? Math.min(user.maxMp - user.mp, Math.round(user.maxMp * sk.hitMp * add / 100)) : 0;
      if (m > 0) user.mp += m;
      clog(`→ Kiếm thế liên hoàn, chém thêm <b>${add}</b> nhát${m > 0 ? `, hồi <b class="mpc">${m}</b> nội lực` : ''}!`);
    }
    // Mốc tầng làm chiêu mạnh thêm: dmgUp (mọi đòn), execute (đối thủ dưới 30% máu), vsStatus (đối thủ đang bị độc/chảy máu/choáng),
    // lowHpAtk (mình dưới 30% máu), firstStrike (chiêu đầu tiên mỗi trận)
    let mult = 1 + (up.dmgUp || 0) / 100;
    if (sk.execute && tgt.hp < tgt.maxHp * 0.3) mult += sk.execute / 100;
    if (sk.vsStatus && (tgt.fx.poison || tgt.fx.bleed || tgt.fx.stun)) mult += sk.vsStatus / 100;
    if (up.lowHpAtk && user.hp < user.maxHp * 0.3) mult += up.lowHpAtk / 100;
    if (up.firstStrike && !user.struck) mult += up.firstStrike / 100;
    // Hệ tương khắc (ELEM_KHAC trong data.js): hệ của đòn = hệ võ công, quái thì lấy hệ của quái
    const khac = sk.noElem ? null : elemKhac(sk.elem || user.elem, tgt); // môn không hệ (Vô Danh Quyền) không khắc ai
    if (khac) mult += ELEM_KHAC_BONUS / 100;
    const biKhac = sk.noElem ? null : elemBiKhac(sk.elem || user.elem, tgt); // đánh vào hệ khắc mình: giảm sát thương
    if (biKhac) mult -= ELEM_KHAC_MALUS / 100;
    if (biKhac && !user.biKhacSaid) { user.biKhacSaid = true; clog(`→ Hệ ${SKILL_ELEMS[biKhac]} khắc hệ ${SKILL_ELEMS[sk.elem || user.elem]}, sát thương −${ELEM_KHAC_MALUS}%.`); }
    // Vô Danh Kiếm Ý tầng 5: tiêu hết Sơ hở trên đối thủ, mỗi tầng +sohoBurst% (Sơ hở vẫn tăng sát thương bạo của chính chiêu này)
    let sohoUsed = 0;
    if (sk.sohoBurst && tgt.fx.soho && tgt.fx.soho.n > 0) {
      sohoUsed = tgt.fx.soho.n;
      mult += sohoUsed * sk.sohoBurst / 100;
      clog(`→ Kiếm ý xuyên qua <b>${sohoUsed}</b> sơ hở, chiêu này mạnh thêm ${sohoUsed * sk.sohoBurst}%!`);
    }
    if (khac && !user.khacSaid) { user.khacSaid = true; clog(`→ Hệ ${SKILL_ELEMS[sk.elem || user.elem]} khắc hệ ${SKILL_ELEMS[khac]}, sát thương +${ELEM_KHAC_BONUS}%!`); }
    // Cửu Âm Chân Kinh tầng 5: võ công Âm Nhu mạnh thêm, đối thủ càng ít máu càng mạnh
    if (up.amUp && sk.elem === 'am') {
      mult += up.amUp / 100;
      if (up.amLowHp && tgt.hp < tgt.maxHp * 0.75) mult += up.amLowHp / 100;
      if (up.amLowHp && tgt.hp < tgt.maxHp * 0.5) mult += up.amLowHp / 100;
      if (up.amLowHp && tgt.hp < tgt.maxHp * 0.25) mult += up.amLowHp / 100;
    }
    if (!sk.extra) mult += lmUse(user, sk);
    // Phá Chiêu (Độc Cô Cửu Kiếm tầng 10): xóa mọi hiệu ứng tăng của đối thủ, mỗi cái +breakBuff% (tính tối đa 3)
    if (sk.breakBuff) {
      const gone = TIMED_BUFFS.filter(k => k !== 'weak' && tgt.fx[k]).concat(['shield', 'hot'].filter(k => tgt.fx[k]));
      gone.forEach(k => {
        const f = tgt.fx[k];
        if (k === 'hpUp') { tgt.maxHp -= f.add; tgt.hp = Math.min(tgt.hp, tgt.maxHp); }
        if (k === 'mpUp') { tgt.maxMp -= f.add; tgt.mp = Math.min(tgt.mp, tgt.maxMp); }
        delete tgt.fx[k];
      });
      if (gone.length) {
        mult += Math.min(3, gone.length) * sk.breakBuff / 100;
        clog(`→ Vô chiêu phá hữu chiêu: phá tan ${gone.length} hiệu ứng của ${who(tgt)}!`);
      }
    }
    // Mốc tầng khinh công "Vô Ảnh": chiêu đầu tiên của đối thủ mỗi trận chắc chắn né
    const dodgeAll = tp.firstDodge && !tgt.firstDodged;
    if (dodgeAll) { tgt.firstDodged = true; clog(`→ ${who(tgt)} thân pháp vô ảnh, né trọn chiêu đầu tiên!`); }
    for (let i = 0; i < n; i++) {
      if (tgt.hp <= 0) break;
      const sure = !!user.nextCrit || (sk.lastCrit && i === n - 1);
      const r = dodgeAll ? { miss: true }
        // hitSplit: chia sức đánh cho từng đòn (vd. La Hán 20 / 30 / 50%)
        : hitCalc(user, tgt, sk.power * mult * (sk.hitSplit ? sk.hitSplit[i] || 0 : 1), { critBonus: sk.critBonus, noCritRes: sk.noCritRes, critDmgUp: sk.critDmgUp, sureCrit: sure, pierce: sk.pierce });
      if (r.charm) { clog(`→ ${who(user)} mê man, đánh trượt!`); float(tgt, 'Trượt!', 'miss'); continue; }
      if (r.miss) {
        if (!dodgeAll) clog(`→ ${who(tgt)} né được!`);
        float(tgt, 'Né!', 'miss');
        // Mốc tầng khinh công: né được thì hồi chút khí huyết
        if (tp.dodgeHeal && tgt.hp > 0) { const h = heal(tgt, Math.round(tgt.maxHp * tp.dodgeHeal / 100)); if (h) clog(`→ ${who(tgt)} thuận thế điều tức, hồi <b class="heal">${h}</b> khí huyết.`); }
        // Mốc tầng khinh công "Thừa Hư Nhi Nhập": né được thì đòn kế tiếp chắc chắn bạo kích
        if (tp.dodgeCrit && !tgt.nextCrit) { tgt.nextCrit = true; clog(`→ ${who(tgt)} nhìn ra sơ hở, đòn kế tiếp chắc chắn bạo kích!`); }
        if (tgt.isPlayer && tgt.fx.hpUp && tgt.fx.hpUp.pcGain) clAdd(tgt, tgt.fx.hpUp.pcGain, 'nhu_lai'); // Phổ Chiếu tầng 5: trong hiệu lực né được +1 Phật Ấn
        continue;
      }
      user.nextCrit = false;
      user.struck = true;
      // mốc tầng nội công: giảm sát thương nhận (lowHpReduce: máu dưới 75% / 50% / 25% giảm thêm 5 / 5 / 10%), tối đa 50%
      let red = (tp.dmgReduce || 0) + (tgt.fx.reduce ? tgt.fx.reduce.value : 0);
      if (tp.lowHpReduce) { const f = tgt.hp / tgt.maxHp; if (f < 0.75) red += 5; if (f < 0.5) red += 5; if (f < 0.25) red += 10; }
      // Phổ Chiếu tầng 10: trong hiệu lực mỗi Phật Ấn giảm 1% sát thương nhận vào
      if (tgt.isPlayer && clOf(tgt, 'nhu_lai') && tgt.fx.hpUp && tgt.fx.hpUp.pcRed) red += clOf(tgt, 'nhu_lai') * tgt.fx.hpUp.pcRed;
      if (tgt.isPlayer && clOf(tgt, 'tam_phat') && tdLv() >= 5) red += clOf(tgt, 'tam_phat'); // Tịch Diệt Gia Trì tầng 5: mỗi Tâm Lực giảm 1%
      if (tp.conRed && sk.kieu === 'con') red += tp.conRed; // Trường Sinh Quyết bậc 2 / 4: giảm sát thương võ học Côn
      if (red) r.dmg = Math.max(1, Math.round(r.dmg * (1 - Math.min(50, red) / 100)));
      landed = true;
      total += r.dmg;
      let dealt = r.dmg;
      // Giáp ảo đỡ trước
      if (tgt.fx.shield) {
        const a = Math.min(tgt.fx.shield.value, dealt);
        tgt.fx.shield.value -= a;
        dealt -= a;
        if (tgt.fx.shield.value <= 0) { delete tgt.fx.shield; clog(`→ Giáp ảo của ${who(tgt)} đỡ ${a} sát thương rồi vỡ tan.`); }
        else clog(`→ Giáp ảo của ${who(tgt)} đỡ ${a} sát thương.`);
      }
      dealt = lethalGuard(tgt, manaShield(tgt, dealt));
      tgt.hp = Math.max(0, tgt.hp - dealt);
      if (combat && combat.stat) { // tổng kết trận
        if (user.isPlayer) { combat.stat.dealt += dealt; combat.stat.maxHit = Math.max(combat.stat.maxHit, dealt); if (r.crit) combat.stat.crits++; }
        if (tgt.isPlayer) combat.stat.taken += dealt;
      }
      clog(`→ ${who(tgt)} mất <b class="dmg">${dealt}</b> khí huyết${r.crit ? ' <b class="crit">BẠO KÍCH!</b>' : ''}`);
      float(tgt, '-' + dealt, r.crit ? 'crit' : 'dmg');
      hpGates(tgt);
      if (r.crit) onCrit(user, tgt, sk, r.dmg, done);
      // Thực chiêu 1 của bộ (vd. Song Long): mỗi đòn trúng +1 điểm của bộ mình, bạo kích +2.
      // clUse (mốc tầng, vd. Không Tướng tầng 5): ra chiêu là +clUse (cộng trong act), đòn trúng không cộng nữa; clCrit (tầng 10): bạo kích thì tổng thành clCrit
      // clHitX (Phật Quang Sơ Hiện tầng 10): nhân số điểm (trúng +2, bạo kích +4)
      if (sk.clHit) { const n = sk.clUse ? (r.crit && sk.clCrit ? sk.clCrit - sk.clUse : 0) : (r.crit ? 2 : 1) * (sk.clHitX || 1); if (n > 0) clAdd(user, n, sk.bo); }
      // Đại Nhật: trúng gắn Dương Viêm lên mục tiêu (bạo kích gấp đôi; Liệt Nhật tầng 10 bạo kích +3)
      if (user.isPlayer && (sk.dvHit || sk.dvCrit)) dvAdd(tgt, r.crit ? Math.max(sk.dvCrit || 0, (sk.dvHit || 0) * 2) : sk.dvHit || 0);
      // Nội thương: mỗi nhát trúng thêm tầng (tối đa noiMax của môn đang chém, giữ cả trận; môn thấp không làm mất tầng đã có)
      if (sk.noiN && tgt.hp > 0) {
        const nt = tgt.fx.noithuong = tgt.fx.noithuong || { n: 0 };
        nt.n = Math.max(nt.n, Math.min(sk.noiMax || 10, nt.n + sk.noiN));
        nt.heal = sk.noiHeal;
        nt.def = sk.noiDef;
      }
      // Thái Cực Quyền tầng 10: đang phản đòn mà bị đánh trúng thì thêm tầng Liên Miên
      if (tgt.fx.reflect && tgt.fx.reflect.lm && tgt.hp > 0) tgt.lm = Math.min(10, (tgt.lm || 0) + 1);
      // Phản đòn (Càn Khôn Đại Na Di): trả lại một phần sát thương cho kẻ ra đòn
      if (tgt.fx.reflect && user.hp > 0) {
        const back = lethalGuard(user, manaShield(user, Math.max(1, Math.round(r.dmg * tgt.fx.reflect.value / 100))));
        user.hp = Math.max(0, user.hp - back);
        clog(`→ ${who(tgt)} xoay chuyển chân khí, phản lại <b class="dmg">${back}</b> khí huyết!`);
        float(user, '-' + back, 'dmg');
        hpGates(user);
      }
      // Tịch Diệt Gia Trì tầng 3 / 7: mỗi Tâm Lực phản 1% / 2% sát thương nhận vào cho kẻ đánh
      // Minh Vương Ấn tầng 10 (2026-11-07): trong lúc chuông còn, mỗi Tâm Lực phản 1%
      const mvTh = (tgt.fx && tgt.fx.reduce && tgt.fx.reduce.mvThorns) || 0;
      const tpTh = tgt.isPlayer && clOf(tgt, 'tam_phat') && user.hp > 0 ? (TP_RULE.thorns(tdLv()) + mvTh) * clOf(tgt, 'tam_phat') : 0;
      if (tpTh) {
        const back = lethalGuard(user, manaShield(user, Math.max(1, Math.round(r.dmg * tpTh / 100))));
        user.hp = Math.max(0, user.hp - back);
        clog(`→ Tâm Lực hộ thân, ${who(tgt)} chấn ngược <b class="dmg">${back}</b> khí huyết!`);
        float(user, '-' + back, 'dmg');
        hpGates(user);
      }
      // Mốc tầng nội công "phản chấn": luôn dội ngược một phần sát thương
      if (tp.thorns && user.hp > 0) {
        const back = lethalGuard(user, manaShield(user, Math.max(1, Math.round(r.dmg * tp.thorns / 100))));
        user.hp = Math.max(0, user.hp - back);
        clog(`→ Nội lực hộ thể của ${who(tgt)} chấn ngược <b class="dmg">${back}</b> khí huyết!`);
        float(user, '-' + back, 'dmg');
        hpGates(user);
      }
    }
    if (landed) {
      const steal = (sk.drain || 0) + (user.lifesteal || 0);
      if (steal) {
        const amt = Math.round(total * steal / 100), room = user.maxHp - user.hp;
        const h = heal(user, amt);
        if (h) clog(`→ ${who(user)} hút <b class="heal">${h}</b> khí huyết.`);
        if (sk.overDrain) overDrainShield(user, amt - room, sk.overDrain);
      }
      if (user.manasteal && user.maxMp) {
        const m = Math.min(user.maxMp - user.mp, Math.round(total * user.manasteal / 100));
        if (m > 0) { user.mp += m; clog(`→ ${who(user)} hút <b class="mpc">${m}</b> nội lực.`); }
      }
    }
    if (landed && sk.effect && tgt.hp > 0 && roll(sk.effect.chance)) applyEffect(user, tgt, sk.effect);
    // Quái Đầm Lầy Hiệp Xuyên: mọi đòn trúng có tỉ lệ gây độc (không đè độc mạnh hơn đang có)
    else if (landed && user.poisonHit && tgt.hp > 0 && !tgt.fx.poison && roll(user.poisonHit.chance)) applyEffect(user, tgt, Object.assign({ type: 'poison' }, user.poisonHit));
    // Quái Thung Lũng Tiêu Dao: đòn trúng có tỉ lệ gây mê hoặc (đang bị thì không làm mới)
    if (landed && user.charmHit && tgt.hp > 0 && !tgt.fx.charm && !(sk.effect && sk.effect.type === 'charm') && roll(user.charmHit.chance)) applyEffect(user, tgt, { type: 'charm', turns: user.charmHit.turns });
    // Quái Hồ Kỳ Sơn: đòn trúng có tỉ lệ Phệ Hồn (cộng dồn tới trần)
    if (landed && user.soulHit && tgt.hp > 0 && !(sk.effect && sk.effect.type === 'phehon') && roll(user.soulHit.chance)) applyEffect(user, tgt, { type: 'phehon' });
    // Mốc tầng võ công Thiếu Lâm: đối thủ suy yếu trong lượt tới; giáp ảo theo sát thương gây ra; hồi khí huyết
    if (landed && tgt.hp > 0 && (sk.weakAtk || sk.weakCrit || sk.weakAcc)) {
      tgt.fx.weak = { turns: 1, atk: sk.weakAtk || 0, crit: sk.weakCrit || 0, acc: sk.weakAcc || 0 };
      clog(`→ ${who(tgt)} suy yếu: ${[sk.weakAtk && `công -${sk.weakAtk}%`, sk.weakCrit && `bạo kích -${sk.weakCrit}%`, sk.weakAcc && `chính xác -${sk.weakAcc}%`].filter(Boolean).join(', ')} trong lượt tới.`);
    }
    // Giáp ảo: chỉ giữ tới đầu lượt sau của người ra chiêu (đỡ một lượt đánh của đối thủ), không cộng dồn
    if (landed && sk.shieldPct) {
      const v = Math.round(total * sk.shieldPct / 100);
      if (v > 0) { user.fx.shield = { value: v }; clog(`→ ${who(user)} chưởng kình đọng lại thành giáp ảo, đỡ được <b>${v}</b> sát thương trong lượt tới.`); }
    }
    // Phật Động Sơn Hà: trúng thì 50% hồi 5% khí huyết tối đa; tầng 5 mỗi Phật Ấn +5% cơ hội, tầng 10 hồi 10%
    if (landed && sk.nlHeal && user.isPlayer && !sk.extra) {
      const ch = sk.nlHeal.chance + (sk.nlChance || 0) * clOf(user, 'nhu_lai');
      if (roll(ch)) { const h = heal(user, Math.round(user.maxHp * (sk.nlPct || sk.nlHeal.pct) / 100)); if (h) clog(`→ Phật lực hộ thân, ${who(user)} hồi <b class="heal">${h}</b> khí huyết.`); }
    }
    if (landed && sk.healPct) {
      const h = heal(user, Math.round(user.maxHp * sk.healPct / 100));
      if (h) clog(`→ ${who(user)} hồi <b class="heal">${h}</b> khí huyết.`);
    }
    // Đủ 10 tầng Sơ hở: đánh thêm một lần chiêu này (không tốn nội lực), xong xóa hết Sơ hở
    if (sk.openStack && !sk.extra && tgt.fx.soho && tgt.fx.soho.n >= 10 && tgt.hp > 0) {
      clog(`→ ${who(tgt)} sơ hở lộ rõ, ${who(user)} thừa thế xuất thêm một kiếm!`);
      doSkill(user, tgt, Object.assign({}, sk, { extra: true }));
      delete tgt.fx.soho;
    }
    if (sohoUsed) delete tgt.fx.soho; // Kiếm Ý đã tiêu hết Sơ hở
    // Nhật Xuất tầng 5: lửa lan sang kẻ đứng sát mục tiêu; Cửu Nhật Lăng Không: kẻ đánh trúng ngươi +1 Dương Viêm
    if (user.isPlayer && landed && sk.dvSpread && !sk.extra) nearEns(tgt, 5).forEach(o => dvAdd(o, sk.dvSpread));
    if (tgt.isPlayer && user !== tgt && landed && tgt.fx.cuuNhat) dvAdd(user, 1);
    if (tgt.isPlayer && user !== tgt && landed && tgt.fx.hpUp && tgt.fx.hpUp.pcGain) clAdd(tgt, tgt.fx.hpUp.pcGain, 'nhu_lai'); // Phổ Chiếu tầng 5: trong hiệu lực bị đánh trúng +1 Phật Ấn
    if (tgt.isPlayer && user !== tgt && landed && tgt.fx.chienLong && hlT('phutro').hlHit) clAdd(tgt, 1, 'hang_long'); // Chiến Long tầng 5: trong lúc hiệu lực bị đánh trúng +1 Cuồng Long
    // bị đánh trúng +1 Tâm Lực: Minh Vương Ấn tầng 5 trong lúc chuông còn (2026-11-07; trước là Tịch Diệt tầng 1)
    if (tgt.isPlayer && user !== tgt && landed && (tdLv() >= 1 || (tgt.fx.reduce && tgt.fx.reduce.mvHit))) clAdd(tgt, 1, 'tam_phat');
  } else if (sk.buff === 'chienLong') {
    // Chiến Long Tại Dã: ngay +1 / 2 / 3 / 4 Cuồng Long (tầng 1 / 4 / 7 / 10), rồi 3 lượt mỗi lượt +1 (playerTurnStart)
    const st = P.skills[BO_VO.hang_long.roles.phutro], n = Math.floor(((st ? st.lv : 1) - 1) / 3) + 1;
    user.fx.chienLong = { turns: sk.turns };
    clog(`${who(user)} thi triển <b class="skill">${sk.name}</b>, long khí cuộn quanh thân: +${n} Cuồng Long, ${sk.turns} lượt tới mỗi lượt +1.`);
    clAdd(user, n, 'hang_long');
  } else if (sk.buff === 'cuuNhat') {
    // Cửu Nhật Lăng Không: 3 lượt lửa đốt mỗi lượt + 20 / 30 / 40 / 50% (tầng 1 / 4 / 7 / 10); mốc tầng 5 / 10 gắn theo (giảm ở playerTurnStart)
    const st = P.skills[BO_VO.dai_nhat.roles.phutro], i = Math.min(3, Math.floor(((st ? st.lv : 1) - 1) / 3));
    const t = user.isPlayer ? dnT('phutro') : {};
    user.fx.cuuNhat = { turns: sk.turns, up: sk.cnUp[i], spread: t.cnSpread || 0, heal: t.cnHeal || 0 };
    clog(`${who(user)} vận <b class="skill">${sk.name}</b>, chín vầng mặt trời treo giữa trời: lửa đốt +${sk.cnUp[i]}% trong ${sk.turns} lượt.`);
  } else if (sk.buff === 'phoChieu') {
    // Phật Quang Phổ Chiếu (bộ Như Lai): tầng 1 / 4 / 7 / 10 khí huyết tối đa +10 / 13 / 16 / 20%, mỗi lượt hồi 5 / 6 / 7 / 8%, 3 lượt
    const st = P.skills[BO_VO.nhu_lai.roles.phutro], i = Math.min(3, Math.floor(((st ? st.lv : 1) - 1) / 3));
    if (user.fx.hpUp) { user.maxHp -= user.fx.hpUp.add; user.hp = Math.min(user.hp, user.maxHp); }
    const add = Math.round(user.maxHp * sk.pcHp[i] / 100);
    user.maxHp += add;
    user.hp += add;
    const pt = user.isPlayer ? nlT('phutro') : {}; // mốc tầng 5 / 10 gắn vào Phật quang, hết hiệu lực thì hết
    user.fx.hpUp = { turns: sk.turns, value: sk.pcHp[i], add, fresh: true, pc: true, pcGain: pt.pcGain || 0, pcRed: pt.pcRed || 0 };
    user.fx.hot = { turns: sk.turns, value: sk.pcHot[i] };
    clog(`${who(user)} vận <b class="skill">${sk.name}</b>, Phật quang bao bọc: khí huyết tối đa +${sk.pcHp[i]}% (+${add}), ${sk.turns} lượt tới mỗi lượt hồi ${sk.pcHot[i]}% khí huyết.`);
  } else if (sk.type === 'heal') {
    const h = heal(user, Math.round(user.maxHp * sk.value / 100));
    clog(`${who(user)} vận <b class="skill">${sk.name}</b>, hồi phục <b class="heal">${h}</b> khí huyết.`);
    if (user.fx.poison) { delete user.fx.poison; clog('→ Độc tố đã được hóa giải.'); }
    if (sk.cleanse && user.fx.bleed) { delete user.fx.bleed; clog('→ Vết thương đã cầm máu.'); }
    if (sk.hot) { user.fx.hot = { turns: 3, value: sk.hot }; clog(`→ Chân khí lưu chuyển, mỗi lượt hồi thêm ${sk.hot}% khí huyết trong 3 lượt.`); }
    if (sk.buff2) { user.fx[sk.buff2.buff] = { turns: sk.turns || 3, value: sk.buff2.value, fresh: true }; clog(`→ Kèm theo ${FX_NAMES[sk.buff2.buff]} ${sk.buff2.value}%.`); }
  } else if (sk.type === 'buff') {
    if (sk.buff === 'hpUp') {
      // Hiệu ứng chính là tăng % khí huyết tối đa (vd. Tĩnh Tọa Liệu Thương của quái): cộng cả khí huyết hiện có, hết thì trả lại
      if (user.fx.hpUp) { user.maxHp -= user.fx.hpUp.add; user.hp = Math.min(user.hp, user.maxHp); }
      const add = Math.round(user.maxHp * num(sk.value) / 100);
      user.maxHp += add;
      user.hp += add;
      user.fx.hpUp = { turns: sk.turns, value: num(sk.value), add, fresh: true };
    } else user.fx[sk.buff] = { turns: sk.turns, value: num(sk.value), fresh: true };
    if (sk.lm) user.fx[sk.buff].lm = 1; // Thái Cực Quyền tầng 10: bị đánh trúng thì thêm tầng Liên Miên
    clog(`${who(user)} vận <b class="skill">${sk.name}</b>: ${FX_NAMES[sk.buff]} ${num(sk.value)}% trong ${sk.turns} lượt.`);
    // Mốc tầng công pháp: hồi ngay % khí huyết tối đa
    if (sk.healNow) {
      const h = heal(user, Math.round(user.maxHp * sk.healNow / 100));
      if (h) clog(`→ Hồi <b class="heal">${h}</b> khí huyết.`);
    }
    (sk.also || []).forEach(a => {
      user.fx[a.buff] = { turns: sk.turns, value: num(a.value), fresh: true };
      clog(`→ Kèm theo ${FX_NAMES[a.buff]} ${num(a.value)}%.`);
    });
    // Mốc tầng công pháp: kèm thêm một hiệu ứng tăng thứ hai
    if (sk.buff2) {
      user.fx[sk.buff2.buff] = { turns: sk.turns, value: sk.buff2.value, fresh: true };
      clog(`→ Kèm theo ${FX_NAMES[sk.buff2.buff]} ${sk.buff2.value}%.`);
    }
    // Mốc tầng công pháp: mỗi lượt hồi % khí huyết tối đa trong thời gian hiệu lực (vd. Phật Quang Phổ Chiếu; hồi ở startTurn)
    if (sk.hotBuff) {
      user.fx.hot = { turns: sk.turns, value: sk.hotBuff };
      clog(`→ Kèm theo mỗi lượt hồi ${sk.hotBuff}% khí huyết trong ${sk.turns} lượt.`);
    }
    // Mốc tầng công pháp: tăng % tốc độ, % nội lực tối đa trong thời gian hiệu lực (vd. Phật Quang Phổ Chiếu)
    if (sk.spdBuff) {
      user.fx.spd = { turns: sk.turns, value: sk.spdBuff, fresh: true };
      clog(`→ Kèm theo ${FX_NAMES.spd} ${sk.spdBuff}%.`);
    }
    if (sk.mpBuff) {
      if (user.fx.mpUp) { user.maxMp -= user.fx.mpUp.add; user.mp = Math.min(user.mp, user.maxMp); }
      const add = Math.round(user.maxMp * sk.mpBuff / 100);
      user.maxMp += add;
      user.mp += add;
      user.fx.mpUp = { turns: sk.turns, value: sk.mpBuff, add, fresh: true };
      clog(`→ Kèm theo ${FX_NAMES.mpUp} ${sk.mpBuff}% (+${add}).`);
    }
    // Mốc tầng công pháp: tăng % khí huyết tối đa trong thời gian hiệu lực (hết thì trả lại)
    if (sk.hpBuff) {
      if (user.fx.hpUp) { user.maxHp -= user.fx.hpUp.add; user.hp = Math.min(user.hp, user.maxHp); }
      const add = Math.round(user.maxHp * sk.hpBuff / 100);
      user.maxHp += add;
      user.hp += add;
      user.fx.hpUp = { turns: sk.turns, value: sk.hpBuff, add, fresh: true };
      clog(`→ Kèm theo ${FX_NAMES.hpUp} ${sk.hpBuff}% (+${add}).`);
    }
    // Mốc tầng công pháp: giảm % sát thương nhận vào trong thời gian hiệu lực (vd. Vô Danh Công Pháp)
    if (sk.reduceBuff) {
      user.fx.reduce = { turns: sk.turns, value: sk.reduceBuff, fresh: true };
      clog(`→ Kèm theo ${FX_NAMES.reduce} ${sk.reduceBuff}%.`);
    }
  }
}

// Đầu lượt: độc phát tác, kiểm tra choáng
function startTurn(c) {
  if (c.fx.shield) { // giáp ảo chỉ giữ tới đầu lượt sau
    // Phật Pháp Vô Biên tầng 9: giáp ảo còn thừa đổi thành nội lực, 2 giáp ra 1 nội lực
    const m = c.isPlayer && nlLv() >= 9 && c.maxMp ? Math.min(c.maxMp - c.mp, Math.floor(c.fx.shield.value / 2)) : 0;
    if (m > 0) c.mp += m;
    clog(`Giáp ảo của ${who(c)} tan đi${m > 0 ? `, hóa thành <b class="mpc">${m}</b> nội lực` : ''}.`);
    delete c.fx.shield;
  }
  if (c.fx.dv) { dvTick(c); if (c.hp <= 0) { dvDeaths(); return 'dead'; } } // Dương Viêm (bộ Đại Nhật) đốt đầu lượt kẻ địch
  if (c.fx.poison) {
    const d = lethalGuard(c, manaShield(c, c.fx.poison.value));
    c.hp = Math.max(0, c.hp - d);
    if (c.isPlayer && combat && combat.stat) combat.stat.taken += d;
    clog(`[[st_trung_doc]] Độc tính phát tác, ${who(c)} mất <b class="dmg">${d}</b> khí huyết.`);
    snd('sfx', 'poison');
    float(c, '-' + d, 'poison');
    hpGates(c);
    if (--c.fx.poison.turns <= 0) delete c.fx.poison;
    if (c.hp <= 0) return 'dead';
  }
  if (c.fx.bleed) {
    const d = lethalGuard(c, manaShield(c, c.fx.bleed.value));
    c.hp = Math.max(0, c.hp - d);
    if (c.isPlayer && combat && combat.stat) combat.stat.taken += d;
    clog(`[[st_chay_mau]] Vết thương rỉ máu, ${who(c)} mất <b class="dmg">${d}</b> khí huyết.`);
    float(c, '-' + d, 'dmg');
    hpGates(c);
    if (--c.fx.bleed.turns <= 0) delete c.fx.bleed;
    if (c.hp <= 0) return 'dead';
  }
  if (c.fx.soho && --c.fx.soho.turns <= 0) { delete c.fx.soho; clog(`${who(c)} đã lấy lại thế thủ, hết sơ hở.`); }
  if (c.fx.dan) {
    const h = heal(c, Math.round(c.maxHp * c.fx.dan.hp / 100));
    const m = c.maxMp ? Math.min(c.maxMp - c.mp, Math.round(c.maxMp * c.fx.dan.mp / 100)) : 0;
    if (m > 0) c.mp += m;
    if (h || m > 0) clog(`[[giai_doc_dan]] Dược lực lan tỏa, ${who(c)} hồi${h ? ` <b class="heal">${h}</b> khí huyết` : ''}${m > 0 ? `${h ? ',' : ''} <b class="mpc">${m}</b> nội lực` : ''}.`);
    if (--c.fx.dan.turns <= 0) delete c.fx.dan;
  }
  if (c.fx.hot) {
    const h = heal(c, Math.round(c.maxHp * c.fx.hot.value / 100));
    if (h) clog(`${who(c)} hồi phục <b class="heal">${h}</b> khí huyết.`);
    if (--c.fx.hot.turns <= 0) delete c.fx.hot;
  }
  if (c.fx.stun) {
    if (--c.fx.stun.turns <= 0) delete c.fx.stun;
    c.justStunned = true;
    c.lm = 0; // bị choáng thì mất Liên Miên
    clog(`[[st_choang]] ${who(c)} bị choáng, không thể ra tay!`);
    return 'stun';
  }
  c.justStunned = false;
  return 'ok';
}
// Cuối lượt: giảm thời gian hiệu ứng tăng chỉ số
function endTurn(c) {
  // Mê hoặc: tính theo lượt ra tay của người bị mê
  if (c.fx.charm && --c.fx.charm.turns <= 0) { delete c.fx.charm; clog(`${who(c)} đã tỉnh táo lại.`); }
  TIMED_BUFFS.forEach(k => {
    const f = c.fx[k];
    if (!f) return;
    if (f.fresh) { f.fresh = false; return; }
    if (--f.turns <= 0) {
      if (k === 'hpUp') { c.maxHp -= f.add; c.hp = Math.min(c.hp, c.maxHp); } // trả lại khí huyết tối đa đã cộng
      if (k === 'mpUp') { c.maxMp -= f.add; c.mp = Math.min(c.mp, c.maxMp); }
      delete c.fx[k];
      clog(`${who(c)}: ${FX_NAMES[k]} đã hết hiệu lực.`);
    }
  });
}

function applyConsumable(id, c) {
  const it = ITEMS[id];
  if (!invCount(id)) return '';
  if (it.lv && P.lv < it.lv) { toast(`Cần đạt cấp ${it.lv} mới dùng được ${it.name}.`); return ''; }
  const parts = [];
  // Đan dược: hồi dần mỗi lượt trong trận (xử lý ở startTurn), viên mới thay viên cũ
  if (it.regen) {
    if (!combat || combat.over || c !== combat.pl) { toast('Đan dược chỉ dùng được trong trận.'); return ''; }
    c.fx.dan = { turns: it.regen.turns, hp: it.regen.hp, mp: it.regen.mp };
    parts.push(`mỗi lượt hồi ${it.regen.hp}% khí huyết, ${it.regen.mp}% nội lực trong ${it.regen.turns} lượt`);
  }
  if (it.heal && c.hp < c.maxHp) {
    // trong trận đi qua heal() để được cộng hồi máu (vd. Trường Sinh Quyết bậc 5 +30%)
    const h = c.pt ? heal(c, it.heal) : Math.min(it.heal, c.maxHp - c.hp);
    if (!c.pt) c.hp += h;
    parts.push(`+${h} khí huyết`);
  }
  if (it.mp && c.mp < c.maxMp) {
    const m = Math.min(it.mp, c.maxMp - c.mp);
    c.mp += m;
    parts.push(`+${m} nội lực`);
  }
  if (it.cure && c.fx.poison) {
    delete c.fx.poison;
    parts.push('đã giải độc');
  }
  if (!parts.length) { toast('Dùng lúc này không có tác dụng.'); return ''; }
  removeItem(id);
  return parts.join(', ');
}

async function act(kind, arg) {
  if (!combat || combat.busy || combat.over) return;
  const { pl, en } = combat;
  const stunnedBefore = !!en.fx.stun;
  let move = null; // hiệu ứng của lượt này
  if (kind === 'skill') {
    const sk = SKILLS[arg], sks = cSkills();
    if (!sks[arg] || sk.type === 'passive' || (!combat.actor && !inUse(arg))) return;
    if (sk.no && pl.no < BO_NO.max) return toast(`Chưa đủ nộ: cần ${BO_NO.max}.`);
    const lv = combat.actor ? sks[arg].lv : skLv(arg), ns = normSkill(arg, lv); // mốc tầng có thể giảm nội lực tiêu hao
    if (!elemOk(arg, combat.actor)) return toast(`Cần mang nội công hệ ${SKILL_ELEMS[sk.elem]} mới thi triển được ${sk.name}.`);
    if (pl.mp < ns.mp) return toast('Không đủ nội lực!');
    const eb = elemBonus(arg, combat.actor);
    if (eb) ns.power *= 1 + eb / 100; // võ công cùng hệ với nội công đang mang
    if (pl.chieu) clBoost(pl, arg, ns); // Cuồng Long: mốc tầng Long Tiếu / Loạn Vũ cho chính nó, Chiến Long tầng 10 cho mọi chiêu đánh (clBoost tự kiểm tra)
    if (sk.no && pl.pt && pl.pt.noUp) ns.power *= 1 + pl.pt.noUp / 100; // Thiền Định Công bậc 5: chiêu nộ +25% sát thương
    if (sk.kieu === 'quyen' && pl.pt && pl.pt.quyenUp) ns.power *= 1 + pl.pt.quyenUp / 100; // Trường Sinh Quyết bậc 1 / 3: võ học Quyền +5% / +10%
    pl.mp -= ns.mp;
    const dealt0 = combat.stat.dealt, cls0 = Object.assign({}, pl.cls);
    // Tâm Phật: Bồ Tát Ấn tiêu hết Tâm Lực, mỗi điểm +8% (bị động tầng 4: 10%); Lôi Âm từ bị động tầng 9 tiêu hết, mỗi điểm +15%
    let tpSpent = 0, mvGain = 0;
    const tp = sk.bo === 'tam_phat', td = tp ? tdLv() : 0, tpHave = clOf(pl, 'tam_phat');
    if (tp && tpHave) {
      if (ns.tpScale) { // Thiên Cổ Lôi Âm tầng 5 (người dùng chốt 2026-11-07): tiêu hết Tâm Lực, mỗi điểm +3% sát thương
        tpSpent = tpHave;
        ns.power *= 1 + tpSpent * ns.tpScale / 100;
        clog(`→ ${tpSpent} Tâm Lực hòa vào tiếng gầm, sát thương +${tpSpent * ns.tpScale}%!`);
      } else if (ns.tpBurst) { // Bồ Tát Ấn tầng 5 (người dùng chốt 2026-11-07): mỗi điểm +2%, không còn phụ thuộc bị động
        tpSpent = tpHave;
        ns.power *= 1 + tpSpent * ns.tpBurst / 100;
        clog(`→ Dồn <b>${tpSpent}</b> Tâm Lực vào ấn, chưởng này mạnh thêm ${tpSpent * ns.tpBurst}%!`);
      } else if (sk.no && td >= 9) {
        tpSpent = tpHave;
        ns.power *= 1 + tpSpent * TP_RULE.loiAm / 100;
        clog(`→ ${tpSpent} Tâm Lực hòa vào tiếng gầm, sát thương +${tpSpent * TP_RULE.loiAm}%!`);
      }
      if (tpSpent) clSet(pl, 'tam_phat', 0);
    }
    if (tp && sk.no && td >= 10) ns.drain = (ns.drain || 0) + TP_RULE.loiAmDrain; // Tịch Diệt tầng 10: Lôi Âm hồi khí huyết bằng 10% sát thương
    // Minh Vương Ấn: tầng 1 / 4 / 7 / 10 giảm 15 / 20 / 25 / 30% sát thương, +1 / 2 / 3 / 4 Tâm Lực
    if (sk.mvTier) { const i = Math.min(3, Math.floor((lv - 1) / 3)); ns.value = sk.mvTier.red[i]; mvGain = sk.mvTier.gain[i]; }
    // Vạn Phật Triều Tông tầng 5: mỗi Phật Ấn đang có +3% sát thương, không tiêu
    if (ns.nlScale && clOf(pl, 'nhu_lai')) {
      const n = clOf(pl, 'nhu_lai');
      ns.power *= 1 + n * ns.nlScale / 100;
      clog(`→ ${n} Phật Ấn hội tụ, sát thương +${n * ns.nlScale}%!`);
    }
    if (ns.clUse && sk.bo) clAdd(pl, ns.clUse, sk.bo); // Không Tướng tầng 5: ra chiêu là +2 Tâm Lực (trúng hay trượt)
    // Liệt Nhật Đương Không: mỗi tầng Dương Viêm trên mục tiêu +4% sát thương, không tiêu tầng
    if (ns.dvBonus && en.fx.dv && en.fx.dv.n) {
      ns.power *= 1 + en.fx.dv.n * ns.dvBonus / 100;
      clog(`→ ${en.fx.dv.n} tầng Dương Viêm bùng lên, sát thương +${en.fx.dv.n * ns.dvBonus}%!`);
    }
    if (ns.dvAll) ns.aoe = true; // Đại Nhật Phần Thiên tầng 10: đánh và kích nổ mọi kẻ địch
    const dvTargets = ns.dvBurst ? (ns.aoe ? aliveEns() : [en]) : [];
    doSkill(pl, en, ns);
    // Thiên Cổ Lôi Âm (aoe): đánh mọi kẻ địch còn lại trên sân, đủ sát thương
    if (ns.aoe) aliveEns().filter(e => e !== en).forEach(o => doSkill(pl, o, Object.assign({}, ns, { extra: true, quiet: true })));
    // Đại Nhật Phần Thiên: kích nổ Dương Viêm trên mục tiêu (tầng 10: mọi kẻ đã đánh), tầng 5 giữ lại nửa số tầng
    dvTargets.forEach(e => dvBurst(pl, e, ns.dvBurst, ns.dvKeep || 0));
    if (ns.tpBurstHeal && ns.tpBurst && tpSpent) { // Bồ Tát Ấn tầng 10: mỗi điểm Tâm Lực đã tiêu hồi 1% khí huyết tối đa
      const h = heal(pl, Math.round(pl.maxHp * tpSpent * ns.tpBurstHeal / 100));
      if (h) clog(`→ Bồ Tát từ bi, ${who(pl)} hồi <b class="heal">${h}</b> khí huyết.`);
    }
    if (mvGain) { // chuông đồng mờ trùm quanh người khi còn tác dụng; mốc tầng 5 / 10 gắn vào chuông
      clAdd(pl, mvGain, 'tam_phat');
      if (pl.fx.reduce) { const t = tierFx(arg, lv); Object.assign(pl.fx.reduce, { bell: true, mvHit: t.mvHit || 0, mvThorns: t.mvThorns || 0 }); }
    }
    // Cuồng Long Loạn Vũ tầng 10 (người dùng chốt 2026-11-07, trước là Giao Long tầng 10): đánh thêm một kẻ địch ngẫu nhiên khác, đủ sát thương
    let spreadTo = null; // hiệu ứng vẽ một rồng con quật sang kẻ này (K.cuonglong, c.others)
    if (sk.no && sk.bo === 'hang_long' && tierFx(arg, lv).hlSpread) {
      const others = aliveEns().filter(e => e !== en);
      if (others.length) {
        const o = spreadTo = others[rand(0, others.length - 1)];
        clog(`→ Long khí quật sang ${who(o)}!`);
        doSkill(pl, o, Object.assign({}, ns, { extra: true }));
      }
    }
    // Vạn Phật Triều Tông tầng 10: lan sang tối đa 3 kẻ đứng sát mục tiêu, mỗi kẻ 30% sát thương
    if (sk.no && sk.bo === 'nhu_lai' && ns.nlSpread) {
      const near = nearEns(en, 3);
      if (near.length) clog(`→ Phật quang lan tỏa sang ${near.map(who).join(', ')}!`);
      near.forEach(o => doSkill(pl, o, Object.assign({}, ns, { extra: true, power: ns.power * ns.nlSpread / 100, shieldPct: 0 })));
    }
    if (pl.chieu) {
      if (sk.no) pl.no = 0; else noGain(pl, combat.stat.dealt - dealt0); // nộ: chỉ tăng khi gây sát thương, dùng chiêu nộ thì về 0
      chieuSets().forEach(b => { const n = clOf(pl, b); if (n !== (cls0[b] || 0)) clog(`→ ${BO_VO[b].diem.name} <b>${clText(n, b)}</b>.`); });
    }
    if (!combat.actor && !combat.opts.practice) addProf(arg, 1).forEach(clog);
    let fx = hasFx() ? FX.forSkill(arg) : null;
    if (fx && sk.tiers) fx = Object.assign({}, fx, tierFx(arg, lv).fx, lv >= skMax(arg) ? { big: true } : {}); // hình theo mốc tầng; đại thành thì chữ to
    if (fx && isBasic(arg)) fx = Object.assign({}, fx, BASIC_FX.find(b => lv >= b.lv)); // Vô Danh Quyền: cùng nắm đấm, lên mốc thì to hơn, đổi màu
    if (fx && ns.tpBurst) fx =Object.assign({}, fx, { size: 1 + Math.min(tpSpent, 20) * 0.04 }); // Bồ Tát Ấn: dồn càng nhiều Tâm Lực ấn càng to
    if (fx && sk.no && tp) fx = Object.assign({}, fx, { size: 1 + Math.min(cls0.tam_phat || 0, 20) * 0.04 }); // Lôi Âm: Tâm Lực lúc ra chiêu càng nhiều sen càng to
    if (fx && sk.no && sk.bo === 'hang_long') fx = Object.assign({}, fx, { size: 1 + Math.min(cls0.hang_long || 0, 30) * 0.015 }); // Loạn Vũ: Cuồng Long càng nhiều rồng càng to (tối đa ×1,45)
    // cảnh tung tuyệt chiêu: võ công Trấn phái / Tuyệt học; riêng bộ võ chỉ chiêu nộ
    move = { fx, name: ns.name, self: sk.type !== 'attack', hits: ns.hitsDone || ns.hits, aoe: !!ns.aoe, spread: spreadTo, big: sk.type === 'attack' && (sk.bo ? !!sk.no : ['tranphai', 'tuyethoc'].includes(sk.grade)), pose: skillPose(arg), tgt: en };
    combat.stat.uses[ns.name] = (combat.stat.uses[ns.name] || 0) + 1;
  } else if (kind === 'attack') {
    if (!combat.actor && BASIC_SKILL && P.skills[BASIC_SKILL]) return act('skill', BASIC_SKILL); // đánh thường = Vô Danh Quyền
    doSkill(pl, en, { type: 'attack', power: 1, normal: true });
    move = { fx: { kind: 'thuong', color: '#ffffff' }, self: false, pose: 'punch', tgt: en };
    combat.stat.uses['Đánh thường'] = (combat.stat.uses['Đánh thường'] || 0) + 1;
  } else if (kind === 'guard') {
    pl.guard = true;
    const g = Math.min(pl.maxMp - pl.mp, Math.round(pl.maxMp * 0.1));
    pl.mp += g;
    clog(`${who(pl)} thủ thế điều tức${g ? `, hồi <b class="mpc">${g}</b> nội lực` : ''}.`);
  } else if (kind === 'item') {
    if (combat.actor) return;
    const msg = applyConsumable(arg, pl);
    if (!msg) return;
    clog(`${who(pl)} dùng [[${ITEMS[arg].icon}]] <b>${ITEMS[arg].name}</b>: ${msg}.`);
    combat.stat.uses[ITEMS[arg].name] = (combat.stat.uses[ITEMS[arg].name] || 0) + 1;
    float(pl, ic(ITEMS[arg].icon), 'heal');
    move = { fx: { kind: 'hoi', color: ITEMS[arg].mp && !ITEMS[arg].heal ? '#8fc7ff' : '#9be37a' }, self: true };
  } else if (kind === 'flee') {
    if (noFlee()) return toast('Không thể bỏ chạy khỏi trận chiến này!');
    const ch = clamp(50 + (effSpd(pl) - Math.max(...aliveEns().map(effSpd))) * 3, 20, 90); // so với kẻ nhanh nhất
    if (roll(ch)) {
      clog('[[bo_chay]] Ngươi thi triển khinh công, thoát thân thành công!');
      snd('sfx', 'whoosh');
      return endCombat('flee');
    }
    clog('[[bo_chay]] Bỏ chạy thất bại!');
  }
  dvDeaths(); // kẻ gục còn Dương Viêm: lửa truyền đi (Cửu Dương bậc 10) hoặc tắt
  combat.stat.turns++;
  passiveTick();
  endTurn(pl);
  combat.menu = 'main';
  combat.busy = true;
  const cb = combat;
  await playTurnFx(pl, move);
  if (!stunnedBefore && en.fx.stun) await playStunFx(pl, en);
  if (combat !== cb) return;
  if (en.hp <= 0 && aliveEns().length) clog(`[[chien_thang]] ${who(en)} gục ngã! Còn ${aliveEns().length} kẻ địch.`);
  renderCombat();
  // combat === cb: trận đã bị đóng / thay trận khác trong lúc chờ thì thôi
  if (pl.hp <= 0) return setTimeout(() => { if (combat === cb) endCombat('lose'); }, turnGap(800)); // gục vì phản đòn
  if (!aliveEns().length) return setTimeout(() => { if (combat === cb) endCombat('win'); }, turnGap(700));
  setTimeout(nextTurn, turnGap(850));
}

// Quái chọn chiêu và đánh; trả về chiêu đã dùng để vẽ hiệu ứng
function enemyAI(en = combat.en) {
  const { pl } = combat;
  const skills = en.E.skills || [];
  const hs = skills.find(s => s.type === 'heal');
  if (hs && en.hp < en.maxHp * (hs.below || 35) / 100 && en.healsUsed < (hs.uses || 1) && en.mp >= enSkillMp(hs, en)) {
    en.healsUsed++;
    en.mp -= enSkillMp(hs, en);
    doSkill(en, en, hs);
    return { s: hs, self: true };
  }
  // Công pháp của quái thế giới mới (người dùng chốt 2026-10-27): từ hiệp 1, mỗi hiệp 50% vận; vận ở hiệp X thì
  // tới hiệp X + cycle (3) mới lại thử 50% mỗi hiệp. en.cpNext = hiệp sớm nhất được thử.
  const cy = skills.find(s => s.cycle), rd = combat.round || 1;
  if (cy && rd >= (en.cpNext || 1) && en.mp >= enSkillMp(cy, en) && roll(50)) {
    en.cpNext = rd + cy.cycle;
    en.mp -= enSkillMp(cy, en);
    doSkill(en, cy.type === 'attack' ? pl : en, cy);
    return { s: cy, self: cy.type !== 'attack' };
  }
  for (const s of skills) {
    if (s.type === 'heal' || s.basic || s.cycle) continue;
    if (s.type === 'buff' && en.fx[s.buff === 'phoChieu' ? 'hpUp' : s.buff]) continue; // Phổ Chiếu lưu ở fx.hpUp
    if (en.mp < enSkillMp(s, en)) continue; // hết nội lực thì không ra chiêu này
    if (roll(s.chance)) {
      en.mp -= enSkillMp(s, en);
      doSkill(en, pl, s);
      return { s, self: s.type === 'buff' };
    }
  }
  // Quái thế giới mới: võ công basic thay cho đánh thường (the_gioi.js tgArm)
  const b = skills.find(s => s.basic);
  if (b) { doSkill(en, pl, b); return { s: b, self: false }; }
  doSkill(en, pl, { type: 'attack', power: 1, normal: true });
  return { s: null, self: false };
}

// Lượt của một kẻ địch (mặc định kẻ đang bị chọn làm mục tiêu)
async function enemyTurn(en = combat && combat.en) {
  if (!combat || combat.over) return;
  const { pl } = combat;
  const cb = combat;
  combat.busy = true;
  if (combat.opts.onEnemyTurn) combat.opts.onEnemyTurn(en); // vd. huyễn ảnh Thí Luyện Tháp cuồng nộ (thap.js)
  const st = startTurn(en);
  if (st === 'dead') {
    renderCombat();
    return setTimeout(() => (aliveEns().length ? nextTurn() : endCombat('win')), turnGap(700));
  }
  if (st === 'ok' && !en.E.idle) { // idle: không ra tay (mộc nhân Ngộ Đạo Đài, thi_luyen.js)
    const stunnedBefore = !!pl.fx.stun;
    const taken0 = combat.stat.taken;
    const m = enemyAI(en);
    noGain(en, combat.stat.taken - taken0); // nộ của quái: cùng luật với người chơi (sát thương gây ra ÷ khí huyết tối đa của nó)
    let fx = { kind: 'thuong', color: '#ff8a7a' };
    if (m.s && hasFx()) fx = Object.assign(FX.fromSkill(m.s), m.s.type === 'attack' ? { color: '#ff6b5b' } : {});
    await playTurnFx(en, { fx, name: m.s ? m.s.name : '', self: m.self, hits: m.s ? m.s.hits : 1, big: !!(m.s && en.boss && !m.self && m.s.type === 'attack' && !m.s.basic) });
    if (!stunnedBefore && pl.fx.stun) await playStunFx(en, pl);
    if (combat !== cb) return;
  }
  endTurn(en);
  dvDeaths(); // kẻ địch gục vì phản đòn mà còn Dương Viêm
  if (combat.opts.survive && pl.hp > 0) combat.survived++;
  renderCombat();
  // hẹn giờ chỉ chạy khi vẫn là trận này (trận có thể đã đóng / đổi trước khi tới giờ)
  if (pl.hp <= 0) return setTimeout(() => { if (combat === cb) endCombat('lose'); }, turnGap(800));
  if (!aliveEns().length) return setTimeout(() => { if (combat === cb) endCombat('win'); }, turnGap(700)); // gục vì bị phản đòn
  if (combat.opts.survive && combat.survived >= combat.opts.survive) return setTimeout(() => { if (combat === cb) endCombat('win'); }, turnGap(700));
  setTimeout(() => { if (combat === cb) nextTurn(); }, turnGap(combat.ens.length > 1 ? 500 : 850));
}

// Mỗi lượt của người chơi trong trận: nội công, khinh công đang mang +1 thành thạo
function passiveTick() {
  if (combat.actor || combat.opts.practice) return;
  usedPassives().forEach(id => addProf(id, 1).forEach(clog));
  const bd = combat.pl.chieu && chieuOf().hu; // Hư chiêu đang mang cũng +1 mỗi lượt
  if (bd && P.skills[bd]) addProf(bd, 1).forEach(clog);
}

function playerTurnStart() {
  if (!combat || combat.over) return;
  const pl = combat.pl;
  pl.guard = false;
  // Không tự hồi nội lực mỗi lượt (người dùng bỏ); chỉ môn võ có mốc tầng mpRegen mới hồi
  const mpRegen = (pl.pt || {}).mpRegen || 0;
  if (mpRegen) pl.mp = Math.min(pl.maxMp, pl.mp + Math.max(1, Math.round(pl.maxMp * mpRegen / 100)));
  // Mốc tầng nội công: tự hồi khí huyết mỗi lượt
  let regenExtra = 0;
  if (pl.pt && pl.pt.regen && pl.hp > 0) {
    const want = Math.round(pl.maxHp * pl.pt.regen / 100), h = heal(pl, want);
    if (h) clog(`${who(pl)} vận công hồi <b class="heal">${h}</b> khí huyết.`);
    if (pl.pt.regenShield) regenExtra = want - h; // Trường Sinh Quyết bậc 10: phần hồi dư thành giáp ảo (đặt sau startTurn, vì startTurn xóa giáp cũ)
  }
  // Chiến Long Tại Dã: mỗi lượt +1 Cuồng Long trong 3 lượt
  if (pl.fx.chienLong) {
    clAdd(pl, 1, 'hang_long');
    auraFlash(unitEl(pl), '.sd-lg img, .sd-lk img'); // vòng lóe sáng khi được +1 Cuồng Long
    if (--pl.fx.chienLong.turns <= 0) delete pl.fx.chienLong;
  }
  // Cửu Nhật Lăng Không: hết 3 lượt thì tắt; mốc tầng 5: đầu mỗi lượt còn hiệu lực, mọi kẻ địch +1 Dương Viêm
  if (pl.fx.cuuNhat) {
    if (--pl.fx.cuuNhat.turns <= 0) { delete pl.fx.cuuNhat; clog(`${who(pl)}: Cửu Nhật Lăng Không đã hết hiệu lực.`); }
    else if (pl.fx.cuuNhat.spread) { aliveEns().forEach(e => dvAdd(e, pl.fx.cuuNhat.spread)); clog('→ Cửu nhật phổ chiếu, mọi kẻ địch +1 tầng Dương Viêm.'); }
  }
  const st = startTurn(pl);
  if (st === 'dead') { renderCombat(); return setTimeout(() => endCombat('lose'), 800); }
  if (regenExtra > 0 && !(pl.fx.shield && pl.fx.shield.value >= regenExtra)) {
    pl.fx.shield = { value: regenExtra };
    clog(`→ Trường sinh chân khí dư thừa ngưng thành giáp ảo đỡ <b>${regenExtra}</b> sát thương.`);
  }
  if (st === 'stun') {
    passiveTick();
    endTurn(pl);
    renderCombat();
    return setTimeout(nextTurn, 1000);
  }
  combat.busy = false;
  renderCombat();
}

// Kết thúc trận cốt truyện: không thưởng/phạt như trận thường, hồi đầy khí huyết
// Hết trận: tắt nhạc trận, phát đoạn nhạc thắng / thua (nhạc nơi đang đứng sẽ trở lại khi rời trận)
function combatEndSound(result) {
  snd('music', null);
  if (result === 'win') snd('jingle', 'win');
  else if (result === 'lose') snd('jingle', 'lose');
}
function endStoryCombat(result) {
  combat.over = true;
  combat.result = result;
  combat.busy = false;
  combatEndSound(result);
  const r = combat.opts.onEnd ? combat.opts.onEnd(result) || {} : {};
  if (combat.actor) { /* điều khiển nhân vật khác: không đụng tới máu của ngươi */ }
  else if (r.keepHp) { P.hp = clamp(combat.pl.hp, 1, getStats().hp); P.mp = combat.pl.mp; } // giữa chuỗi trận: không hồi
  else {
    const s = getStats();
    P.hp = s.hp;
    P.mp = s.mp;
  }
  combat.after = r.after || null;
  const cls = r.cls || (result === 'win' ? 'win' : 'lose');
  combat.resultData = { cls, lines: r.lines || [], btn: r.btn || 'Tiếp tục ➜' };
  saveGame(true);
  renderCombat();
}

// Quái cao cấp hơn mình x cấp thì kinh nghiệm × (1 + x/10), chênh tối đa tính 9 cấp (người dùng chốt 2026-10-27)
const lvGapMult = elv => 1 + clamp((elv || 0) - P.lv, 0, 9) / 10;
const ELITE_PROF = 10; // thành thạo cộng cho mọi võ học đang mang khi hạ Tinh Anh của map
// Mọi võ học đang mang (cả Vô Danh Quyền) + n thành thạo; mang Vô Danh Tâm Pháp (profUp) thì được nhân như mọi nguồn khác
function wornProf(n, why) {
  const bo = chieuWorn(); // các chiêu thức đang mang (5 ô)
  const worn = [...(BASIC_SKILL && P.skills[BASIC_SKILL] ? [BASIC_SKILL] : []), ...Object.values(P.use).flat(), ...bo];
  const up = passiveTiers().profUp, shown = up ? Math.round(n * (1 + up / 100)) : n;
  const lines = [`[[vo_hoc]] ${why}: võ học đang mang +${shown} thành thạo${up ? ` <span class="muted">(Vô Danh Tâm Pháp ×${1 + up / 100})</span>` : ''}`];
  worn.forEach(id => lines.push(...addProf(id, n)));
  return lines;
}
function endCombat(result) {
  if (combat.opts.story) return endStoryCombat(result);
  const { pl, ens } = combat;
  const E = ens[0].E;
  combat.over = true;
  combat.result = result;
  combat.busy = false;
  combatEndSound(result);
  P.hp = Math.min(pl.hp, getStats().hp); // khí huyết tối đa tăng tạm trong trận (Kim Chung Tráo) không giữ lại sau trận; đánh xong không hồi máu
  P.mp = pl.mp;
  let lines, btn, cls;
  if (result === 'win') {
    P.wins++;
    // Thưởng = cộng từng con, rồi nhân hệ số theo số quái (đánh càng đông càng được nhiều)
    const mult = rewardMult(ens.length);
    let gold = 0, exp = 0;
    ens.forEach(e => {
      if (e.key) P.kills[e.key] = (P.kills[e.key] || 0) + 1;
      gold += e.E.gold ? rand(Math.round(e.E.gold * 0.9), Math.round(e.E.gold * 1.1)) : 0; // lệch ±10% (người dùng chốt)
      exp += (e.E.exp || 0) * lvGapMult(e.lv);
    });
    gold = Math.round(gold * mult);
    exp = withBonus(Math.round(exp * mult));
    P.gold += gold;
    lines = [`[[chien_thang]] Đánh bại ${ens.length > 1 ? `<b>${ens.length}</b> kẻ địch` : who(ens[0])}!`,
      `[[kinh_nghiem]] +${exp} kinh nghiệm${gold ? ` · [[bac]] +${gold} lượng` : ''}${ens.length > 1 ? ` <span class="muted">(đánh đông ×${mult.toFixed(1).replace('.', ',')})</span>` : ''}`];
    ens.forEach(e => (e.E.drops || []).forEach(([id, ch, n, quest]) => {
      if (ITEMS[id].type === 'book' && knowsBook(id)) return;
      if (quest) return; // đồ của nhiệm vụ cốt truyện cũ: không còn rơi
      if (roll(ch)) {
        addItem(id, n || 1);
        lines.push(`[[nhat_duoc]] Nhặt được [[${ITEMS[id].icon}]] <b>${ITEMS[id].name}</b>${n > 1 ? ' x' + n : ''}`);
      }
    }));
    // Quái ngoài map rơi trang bị (MAP_DROP): một lần mỗi trận, bậc theo cấp quái cao nhất trong trận
    const mapEns = typeof MAPS !== 'undefined' ? ens.filter(e => e.E.tg && MAPS[e.E.tg]) : [];
    // Tinh Anh hoặc hào kiệt Truy Nã (E.boss, E.tg = null) trong trận: tỉ lệ Tinh Anh (người dùng chốt 2026-11-10)
    if (mapEns.length && roll(ens.some(e => e.E.boss) ? MAP_DROP.elite : MAP_DROP.chance)) {
      const it = ITEMS[mapLoot(Math.max(...mapEns.map(e => e.lv || e.E.lv || 1)))];
      lines.push(`[[nhat_duoc]] Nhặt được [[${it.icon}]] <b class="${QUAL_CLASS[it.q || 1]}">${it.name}</b>`);
    }
    // Thảo dược Kinh mạch (KINH_MACH): Vô Danh Thảo 25% mỗi trận quái map, Tinh Anh của map thêm Nhân Sâm (Truy Nã cộng ở tnOnKill)
    if (mapEns.length && roll(KINH_MACH.thao)) { addItem('vo_danh_thao'); lines.push(`[[vo_danh_thao]] Hái được <b>Vô Danh Thảo</b>`); }
    if (mapEns.some(e => e.E.boss)) { addItem('nhan_sam', KINH_MACH.elite); lines.push(`[[nhan_sam]] Nhận <b>Nhân Sâm ×${KINH_MACH.elite}</b>`); }
    // Hạ Tinh Anh của map (the_gioi.js, mã là boss): mọi võ học đang mang +ELITE_PROF thành thạo (người dùng chốt 2026-10-28)
    if (ens.some(e => e.E.tg && e.E.boss)) lines.push(...wornProf(ELITE_PROF, 'Hạ Tinh Anh'));
    lines.push(...gainExp(exp));
    ens.forEach(e => { if (e.key) lines.push(...onKill(e.key)); });
    log(lines.join(' · '));
    btn = 'Tiếp tục ➜';
    cls = 'win';
  } else if (result === 'lose') {
    const lost = Math.floor(P.gold * 0.1);
    P.gold -= lost;
    const s = getStats();
    P.hp = Math.round(s.hp * 0.5);
    P.mp = Math.round(s.mp * 0.5);
    P.loc = P.lastTown;
    lines = ['[[tu_vong]] Ngươi bị trọng thương rồi ngất lịm đi...',
      `Người qua đường đưa ngươi về <b>${LOCATIONS[P.lastTown].name}</b> chữa trị.${lost ? ` Mất ${lost} lượng bạc.` : ''}`];
    log(`[[tu_vong]] Thua trận trước ${E.name}. Được đưa về ${LOCATIONS[P.lastTown].name}.`);
    btn = 'Tỉnh lại';
    cls = 'lose';
  } else {
    lines = ['[[bo_chay]] Ngươi đã thoát khỏi trận đấu.'];
    log(`[[bo_chay]] Bỏ chạy khỏi ${E.name}.`);
    btn = 'Tiếp tục';
    cls = 'flee';
  }
  combat.resultData = { cls, lines, btn };
  saveGame(true);
  renderCombat();
}

function leaveCombat() {
  document.body.style.overflow = '';
  const after = combat && combat.after;
  combat = null;
  if (after) return after();
  renderWorld();
}


/* ---------------------------- Khởi động ---------------------------- */
window.G = {
  renderTitle, renderCreate, setName, pickTitle, startNew, continueGame,
  help, importSave, doImport, exportSave, saveGame, toTitle, serverMenu, serverClose, pickServer, refreshTitle, askDelete, deleteChar,
  playTruyen, truyenNext, truyenSkip,
  explore, travel, rest, openShop, shopTab, shopCat, shopPick, buy, sell,
  menuChar, menuInv, menuSkills, menuQuests, menuSystem, quickSell, kmFeed, kmPick,
  useItem, equip, unequip, learnBook, useSkill, dropSkill, chieuPick, chieuSet, chieuOff, chieuCard, chieuBo, chieuClose, ghepManh, dgTabSet, dgElemSet, dgOpen, setFxSpeed, toggleSnd, setSndVol,
  act, cmenu, toggleLog, leaveCombat, pickTarget, enemyInfo, eqPick, eqClose, forgeUp, forgeTabSet, forgePick, cuongHoa, mfn, closeModal, practice,
  ...(typeof THAP_G !== 'undefined' ? THAP_G : {}), // Thí Luyện Tháp (thap.js)
  ...(typeof TRANG_CHU_G !== 'undefined' ? TRANG_CHU_G : {}), // trang chủ (trang_chu.js)
  ...(typeof TRAN_DOI_G !== 'undefined' ? TRAN_DOI_G : {}), // trận đội 5 tướng (tran_doi.js)
  ...(typeof AI_G !== 'undefined' ? AI_G : {}), // ải Giang Hồ (ai_giang_ho.js)
  ...(typeof TANG_CAP_G !== 'undefined' ? TANG_CAP_G : {}), // tăng cấp hiệp khách (tang_cap.js)
  ...(typeof TRANG_BI_G !== 'undefined' ? TRANG_BI_G : {}), // màn Trang Bị hiệp khách (trang_bi_hk.js)
  ...(typeof TAI_KHOAN_G !== 'undefined' ? TAI_KHOAN_G : {}), // đăng nhập Google, lưu Firebase (tai_khoan.js)
  ...(typeof MON_PHAI_G !== 'undefined' ? MON_PHAI_G : {}), // Thanh Vân: thi tuyển, khảo hạch, sư môn (mon_phai.js)
  ...(typeof TRUY_NA_G !== 'undefined' ? TRUY_NA_G : {}), // Truy Nã Hiệp Khách (truy_na.js)
  ...(typeof THI_LUYEN_G !== 'undefined' ? THI_LUYEN_G : {}), // Thí Luyện hằng ngày: Tàng Bảo Khố, Ngộ Đạo Đài (thi_luyen.js)
  ...(typeof BAN_DO_G !== 'undefined' ? BAN_DO_G : {}), // Bản đồ thế giới (ban_do.js)
  ...(typeof AUTO_G !== 'undefined' ? AUTO_G : {}), // Tự động luyện công (tu_dong.js)
};

if (hasFx()) FX.setSpeed(fxSpeed());
el('modal').addEventListener('click', e => { if (e.target.id === 'modal') closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

// Khi bản web được cập nhật trong lúc đang chơi, giữ lại nhân vật
function boot(data) {
  if (data && typeof data.save === 'string') {
    try {
      const d = JSON.parse(data.save);
      if (d && SECTS[d.sect]) {
        loadPlayer(d);
        worldLog = ['[[lam_moi]] Trò chơi vừa được cập nhật phiên bản mới.'];
        renderWorld();
        initCloud();
        return;
      }
    } catch (e) { /* bắt đầu lại từ màn hình chính */ }
  }
  // Màn chờ tải ảnh cần ngay (tai_truoc.js); trong lúc chờ mà đã có màn khác (vd. bot) thì không vẽ đè màn vào game
  const go = () => { if (!screenKey) renderTitle(); initCloud(); };
  if (typeof bootLoad === 'function') bootLoad(go); else go();
}
const hot = window.claude && window.claude.hot;
if (hot && typeof hot.snapshot === 'function') hot.snapshot(() => ({ save: P && !combat ? JSON.stringify(P) : null }));
if (hot && typeof hot.ready === 'function') hot.ready(boot);
else boot(hot && hot.data);
