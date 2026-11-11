/* =====================================================================
   TẢI TRƯỚC ẢNH (2026-11-12, người dùng chốt làm 1 + 2)
   1. Màn chờ lúc mở game: chỉ tải phần cần ngay (tranh màn vào game, hình nhân vật, icon menu, tranh vùng của nhân vật đã lưu),
      có thanh tiến độ; tối đa TT.wait mili giây thì vào luôn, ảnh lỗi bỏ qua (bootLoad, engine gọi trong boot).
   2. Tải nền khi đang chơi (bgPreload, engine gọi ở renderWorld và startCombat): hình động nhân vật, ảnh hiệu ứng của các chiêu
      đang mang, pháp trận nội công, ảnh sân đấu, ảnh quái nơi đang đứng rồi tới các ngọn núi cùng vùng. Tải lần lượt (TT.par cái
      một lúc) để không giành mạng; ảnh đã tải thì trình duyệt nhớ, lần sau dùng ngay.
   Game chỉ dành cho điện thoại (người dùng chốt 2026-11-12) nên chỉ tải ảnh dọc.
   Thêm kiểu hiệu ứng chiêu dùng ảnh mới (effects.js) thì thêm dòng vào TT_FX.
   ===================================================================== */
const TT = { wait: 12000, par: 2 };
// Ảnh của từng kiểu hiệu ứng chiêu (fx.kind trong data.js; tên tệp trong game/img, bỏ đuôi .png)
const TT_FX = {
  vdq1: ['fx_vdq'], lahan: ['fx_lahan'], dailuc: ['fx_dailuc'], nhulai: ['fx_phaptran', 'fx_nhulai'],
  khongtuong: ['fx_khong_tuong'], botatan: ['fx_bo_tat_an', 'fx_bta_chuong'], minhvuong: ['fx_minh_vuong'], loiam: ['fx_loi_am', 'fx_sen'],
  songlong: ['fx_rong'], longtieu: ['fx_rong'], chienlong: ['fx_chien_long', 'fx_vong_khi'], cuonglong: ['fx_than_long', 'fx_rong', 'fx_dau_rong'],
  sohien: ['fx_tt_tay_nho', 'fx_tt_no'], sonha: ['fx_nhulai', 'fx_tt_no'], phochieu: ['fx_pho_chieu'],
  trieutong: ['fx_tt_may', 'fx_tt_tay_nho', 'fx_tt_tay_lon', 'fx_tt_no'],
};
const ttDone = new Set(), ttQueue = [];
let ttRunning = 0;

function ttLoad(src) {
  return new Promise(ok => {
    if (!src || ttDone.has(src)) return ok();
    const im = new Image();
    im.onload = im.onerror = () => { ttDone.add(src); ok(); };
    im.src = src;
  });
}
// Hàng đợi tải nền: thêm vào cuối, bỏ trùng; first = chen lên đầu (vd. vừa đổi chiêu)
function ttAdd(list, first) {
  const fresh = list.filter(s => s && !ttDone.has(s) && !ttQueue.includes(s));
  if (first) ttQueue.unshift(...fresh); else ttQueue.push(...fresh);
  while (ttRunning < TT.par && ttQueue.length) {
    ttRunning++;
    (async () => { while (ttQueue.length) await ttLoad(ttQueue.shift()); ttRunning--; })();
  }
}

/* ---------------- Danh sách ảnh ---------------- */
const ttAvatar = title => (title === 'Nữ hiệp' ? ['game/img/vo_danh_f.png'] : ['game/img/vdm.png']);
const ttMenu = () => ['nhan_vat_m', 'nhan_vat_f', 'hanh_trang', 'vo_hoc', 'nhiem_vu', 'tu_dong', 'thien_ha', 'he_thong', 'bac', 'kinh_nghiem']
  .map(n => `game/img/icon/${n}.png`);
const ttCity = loc => (typeof MAPS !== 'undefined' && MAPS[loc] ? MAPS[loc].city : loc);
function ttPlace(loc) {
  const out = [], V = typeof VUNG !== 'undefined' && VUNG[ttCity(loc)];
  if (V && V.doc) out.push(V.doc.src);
  if (typeof canhKey === 'function' && canhKey(loc)) out.push(canhSrc(loc, 'doc'));
  return out;
}
// Ảnh quái của một ngọn núi (quái thường + Tinh Anh), chỉ quái vẽ bằng ảnh (ENEMY_IMG)
function ttMobs(map) {
  const M = typeof MAPS !== 'undefined' && MAPS[map];
  if (!M) return [];
  return [...M.enemies, M.boss].map(id => ENEMIES[id] && ENEMIES[id].icon)
    .filter(ic => ic && typeof ENEMY_IMG !== 'undefined' && ENEMY_IMG[ic]).map(ic => `game/img/quai/${ic}.png`);
}
// Ảnh hiệu ứng của các chiêu đang mang + pháp trận nội công
function ttSkills() {
  if (!P) return [];
  const ids = new Set([BASIC_SKILL, ...(typeof chieuWorn === 'function' ? chieuWorn() : []), ...Object.values(P.use || {}).flat()]);
  const out = [];
  ids.forEach(id => {
    const s = id && SKILLS[id];
    if (!s) return;
    if (s.fx && TT_FX[s.fx.kind]) TT_FX[s.fx.kind].forEach(n => out.push(`game/img/${n}.png`));
    if (s.circle) out.push(s.circle);
  });
  return out;
}
function ttArena() {
  if (typeof SAN_DAU === 'undefined' || !SAN_DAU.sets) return [];
  return Object.values(SAN_DAU.sets).map(x => x.mb && x.mb.src).filter(Boolean);
}

/* ---------------- 1. Màn chờ lúc mở game ---------------- */
function bootLoad(done) {
  let sv = null;
  try { sv = readSave(); } catch (e) { /* chưa đọc được bản lưu thì thôi */ }
  const list = ['game/img/title_mobile.jpg', 'game/img/nen_trang_chu.jpg', ...['bac', 'vang', 'luong_thuc', 'cong_hien'].map(k => 'game/img/icon/khung_' + k + '.png'), ...Object.keys(typeof HERO_ROLES === 'object' ? HERO_ROLES : {}).map(k => 'game/img/icon/loai_' + k + '.png'), ...(sv ? ttAvatar(sv.title) : [...ttAvatar(''), ...ttAvatar('Nữ hiệp')]), ...ttMenu(), ...(sv ? ttPlace(sv.loc) : [])];
  const box = document.getElementById('screen');
  if (box) box.innerHTML = `<div class="tt-load"><div class="tt-name">Hiệp Khách Giang Hồ</div>
    <div class="tt-bar"><i id="tt-fill"></i></div><div class="tt-pct" id="tt-pct">Đang tải 0%</div></div>`;
  ttStyle();
  let n = 0, finished = false;
  const finish = () => { if (finished) return; finished = true; done(); };
  setTimeout(finish, TT.wait); // mạng chậm quá thì vào luôn, ảnh còn lại tải sau
  list.forEach(src => ttLoad(src).then(() => {
    n++;
    const p = Math.round(n / list.length * 100), f = document.getElementById('tt-fill'), t = document.getElementById('tt-pct');
    if (f) f.style.width = p + '%';
    if (t) t.textContent = 'Đang tải ' + p + '%';
    if (n === list.length) setTimeout(finish, 150);
  }));
}
function ttStyle() {
  if (document.getElementById('tt-style')) return;
  const st = document.createElement('style');
  st.id = 'tt-style';
  st.textContent = `.tt-load { position: fixed; inset: 0; z-index: 30; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 18px;
      background: radial-gradient(ellipse at 50% 40%, #2e2418, #120d08 70%); color: #e8d9b4; padding: 0 16px; }
    .tt-name { font-family: 'Pattaya', serif; font-size: clamp(30px, 9vw, 48px); color: #f0d48a; text-shadow: 0 2px 10px rgba(0,0,0,.7); text-align: center; }
    .tt-bar { width: min(320px, 80vw); height: 8px; border-radius: 99px; background: rgba(255,255,255,.12); overflow: hidden; border: 1px solid rgba(240,212,138,.35); }
    .tt-bar i { display: block; height: 100%; width: 0; background: linear-gradient(90deg, #b8862e, #f0d48a); transition: width .2s; }
    .tt-pct { font-size: 13px; color: #b8a888; }`;
  document.head.appendChild(st);
}

/* ---------------- 2. Tải nền khi đang chơi ---------------- */
function bgPreload() {
  if (!P) return;
  const T = P.title === 'Nữ hiệp';
  ttAdd(ttSkills(), true); // chiêu đang mang: ưu tiên nhất
  ttAdd([...(T ? ['game/img/vo_danh_f_punch.png'] : ['game/img/vdm_idle.png', 'game/img/vdm_atk.png']), ...ttArena()]);
  const city = ttCity(P.loc);
  ttAdd([...ttPlace(P.loc), ...ttMobs(P.loc)]);
  if (typeof MAPS !== 'undefined') Object.values(MAPS).filter(m => m.city === city && m.id !== P.loc).forEach(m => ttAdd([...ttPlace(m.id), ...ttMobs(m.id)]));
}
