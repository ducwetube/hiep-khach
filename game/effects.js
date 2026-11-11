'use strict';
/* =================================================================
   HIỆP KHÁCH GIANG HỒ — HIỆU ỨNG CHIÊU THỨC
   -----------------------------------------------------------------
   Vẽ bằng SVG và hoạt ảnh của trình duyệt, không cần file ảnh,
   chạy offline, nhẹ trên điện thoại.

   Cách dùng:
     FX.play('chuong', { arena, from, to, color, name, crit, onHit })
       arena : khung chứa hai nhân vật (hiệu ứng vẽ đè lên khung này)
       from  : hình người ra chiêu      to : hình người trúng chiêu
               (bỏ trống "to" = chiêu lên chính mình: hồi máu, hộ thể)
       name  : tên chiêu hiện chữ lớn (bỏ trống với đánh thường)
       onHit : gọi đúng lúc đòn chạm địch (để hiện số sát thương)
     FX.setSpeed('full' | 'fast' | 'off')

   Võ công nào dùng hiệu ứng nào, màu gì: trường "fx" của từng võ công
   trong data.js. Võ công không ghi "fx" thì tự chọn theo loại chiêu.
   ================================================================= */

/* Kiểu hiệu ứng → tên hiển thị */
const FX_KIND_NAMES = {
  thuong: 'Đánh thường', quyen: 'Quyền cước', kiem: 'Kiếm pháp', con: 'Côn bổng', chuong: 'Chưởng pháp',
  doc: 'Độc công', hoi: 'Hồi phục', ho: 'Hộ thể', luc: 'Tăng lực', ne: 'Khinh công', choang: 'Choáng',
  rong: 'Rồng vàng', phat_chuong: 'Phật chưởng', cuu_kiem: 'Cửu kiếm liên hoàn', thai_cuc: 'Âm dương',
  bang: 'Băng tuyết', kim_chung: 'Chuông vàng',
  songlong: 'Hàng Long · Song long', longtieu: 'Hàng Long · Rồng bổ từ trời', cuonglong: 'Hàng Long · Rồng cuồng loạn vũ', chienlong: 'Hàng Long · Rồng cuộn quanh thân',
  lahan: 'La Hán Quyền · Ba quyền', dailuc: 'Kim cương chưởng', nhulai: 'Như Lai · Vạn chưởng giáng thế', vdq1: 'Vô Danh Quyền', vdq5: 'Vô Danh Quyền · Điểm Huyệt', vdq10: 'Vô Danh Quyền · Đại Thành',
  vdk5: 'Vô Danh Kiếm · Phá Sơ Hở', vdk10: 'Vô Danh Tứ Kiếm',
  vdky5: 'Kiếm Ý · Vô Hình', vdky10: 'Kiếm Ý · Đại Thành',
  diet_tuyet: 'Diệt Tuyệt Kiếm · Nội thương', that_sat: 'Thất Sát · Bảy vì sao',
  minhvuong: 'Minh Vương Ấn · Chuông đồng', phochieu: 'Phật Quang Phổ Chiếu · Vòng Phật quang', sohien: 'Phật Quang Sơ Hiện · Vòng hào quang bàn tay', sonha: 'Phật Động Sơn Hà · Bàn tay khổng lồ rơi', trieutong: 'Vạn Phật Triều Tông · Mây xoáy, mưa bàn tay', loiam: 'Thiên Cổ Lôi Âm · Bóng Phật, sen rơi',
  khongtuong: 'Không Tướng Chưởng · Ba bóng tay', botatan: 'Bồ Tát Ấn · Tâm Lực hội tụ', botatan3: 'Bồ Tát Ấn · Nghìn tay (bản thử)',
};

const FX = (() => {
  const NS = 'http://www.w3.org/2000/svg';
  let rate = 1, off = false;
  const T = t => Math.round(t * rate);
  const wait = t => new Promise(r => setTimeout(r, T(t)));
  const rnd = (a, b) => a + Math.random() * (b - a);
  // Máy bật "giảm chuyển động" thì nên mặc định tắt hiệu ứng (người chơi vẫn tự bật lại được)
  const prefersReduced = () => !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  const defaultSpeed = () => (prefersReduced() ? 'off' : 'full');

  function setSpeed(s) { off = s === 'off'; rate = s === 'fast' ? 0.5 : 1; }

  /* ---------- Hiệu ứng nào cho võ công nào ---------- */
  // Hiệu ứng của một võ công: lấy trường "fx" trong data.js; tuyệt kỹ (trấn phái, tuyệt học) chữ to hơn
  function forSkill(id) { return fromSkill(typeof SKILLS !== 'undefined' ? SKILLS[id] : null); }
  // Dùng được cả cho chiêu của quái (không có trong SKILLS)
  function fromSkill(s) {
    if (!s) return { kind: 'quyen', color: '#ffd84d' };
    if (s.fx) return Object.assign({ color: '#ffd84d', big: s.grade === 'tranphai' || s.grade === 'tuyethoc' }, s.fx);
    if (s.type === 'heal') return { kind: 'hoi', color: '#9be37a' };
    if (s.type === 'attack' && s.drain) return { kind: 'chuong', color: '#ff6b5b' };
    if (s.effect && s.effect.type === 'stun') return { kind: 'chuong', color: '#ffd84d' };
    if (s.type === 'buff') return { kind: s.buff === 'atk' ? 'luc' : s.buff === 'dodge' ? 'ne' : 'ho', color: '#ffd84d' };
    if (s.effect && s.effect.type === 'poison') return { kind: 'doc', color: '#7ad151' };
    if ((s.hits || 1) > 1) return { kind: 'kiem', color: '#cfe8ff' };
    return { kind: s.power >= 2 ? 'chuong' : 'quyen', color: '#ffd84d', big: s.grade === 'tranphai' || s.grade === 'tuyethoc' };
  }

  /* ---------- Kiểu dáng (tự chèn một lần) ---------- */
  function ensureStyle() {
    if (document.getElementById('fx-style')) return;
    const st = document.createElement('style');
    st.id = 'fx-style';
    st.textContent = `
      .fx-layer { position: absolute; left: 0; top: 0; pointer-events: none; overflow: visible; z-index: 5; }
      .fx-layer * { transform-box: fill-box; transform-origin: center; }
      .fx-layer .fx-free { transform-box: view-box; transform-origin: 0 0; }
      .fx-callout { position: absolute; left: 50%; top: 4%; z-index: 7; pointer-events: none; white-space: nowrap;
        font-family: "Palatino Linotype", "Book Antiqua", Georgia, serif; font-weight: 700; letter-spacing: 1px;
        font-size: clamp(18px, 4.2vw, 30px); color: #fff8e0;
        text-shadow: 0 0 14px var(--fx-c), 0 0 4px var(--fx-c), 0 2px 0 #000, 0 0 2px #000; }
      .fx-callout.big { font-size: clamp(22px, 5.6vw, 40px); }
      .fx-flash { position: absolute; inset: 0; pointer-events: none; z-index: 6; border-radius: 14px; }`;
    document.head.appendChild(st);
  }

  /* ---------- Công cụ vẽ ---------- */
  function stage(arena) {
    ensureStyle();
    if (getComputedStyle(arena).position === 'static') arena.style.position = 'relative';
    let svg = arena.querySelector(':scope > svg.fx-layer');
    if (!svg) {
      svg = document.createElementNS(NS, 'svg');
      svg.setAttribute('class', 'fx-layer');
      svg.innerHTML = '<defs><filter id="fxGlow" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>';
      arena.appendChild(svg);
    }
    const r = arena.getBoundingClientRect();
    svg.setAttribute('viewBox', `0 0 ${r.width} ${r.height}`);
    svg.setAttribute('width', r.width);
    svg.setAttribute('height', r.height);
    return svg;
  }
  function at(el, arena) {
    const a = arena.getBoundingClientRect(), b = el.getBoundingClientRect();
    return { x: b.left - a.left + b.width / 2, y: b.top - a.top + b.height * 0.48, w: b.width, h: b.height, top: b.top - a.top, bottom: b.bottom - a.top };
  }
  function mk(parent, tag, attrs) {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    parent.appendChild(e);
    return e;
  }
  // Hoạt ảnh xong thì báo; có đồng hồ dự phòng để trận đấu không bao giờ bị kẹt
  // (trình duyệt có thể dừng hoạt ảnh khi chuyển sang ứng dụng khác)
  function anim(el, frames, dur, o = {}) {
    const done = () => { if (o.remove) el.remove(); };
    if (!el.animate) { done(); return Promise.resolve(); }
    const a = el.animate(frames, { duration: T(dur), delay: T(o.delay || 0), easing: o.easing || 'ease-out', fill: 'both' });
    const backup = new Promise(r => setTimeout(r, T(dur) + T(o.delay || 0) + 150));
    return Promise.race([a.finished.catch(() => {}), backup]).then(done);
  }
  const move = (x, y, extra = '') => `translate(${x}px, ${y}px) ${extra}`;

  /* ---------- Mảnh hiệu ứng ---------- */
  function ring(svg, p, color, r, o = {}) {
    const c = mk(svg, 'circle', { cx: p.x, cy: p.y, r, fill: 'none', stroke: color, 'stroke-width': o.width || 4, filter: 'url(#fxGlow)' });
    return anim(c, [{ transform: 'scale(.12)', opacity: 1 }, { transform: 'scale(1)', opacity: 0 }], o.dur || 460, { delay: o.delay, remove: true });
  }
  function spikes(svg, p, color, n, r0, r1, o = {}) {
    const g = mk(svg, 'g', { filter: 'url(#fxGlow)' });
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + rnd(-0.15, 0.15), c = Math.cos(a), s = Math.sin(a);
      mk(g, 'line', { x1: p.x + c * r0, y1: p.y + s * r0, x2: p.x + c * r1 * rnd(0.75, 1.1), y2: p.y + s * r1 * rnd(0.75, 1.1), stroke: i % 2 ? '#ffffff' : color, 'stroke-width': o.width || 3, 'stroke-linecap': 'round' });
    }
    return anim(g, [{ transform: 'scale(.3)', opacity: 1 }, { transform: 'scale(1.15)', opacity: 0 }], o.dur || 340, { delay: o.delay, remove: true });
  }
  function particles(svg, p, color, n, spread, o = {}) {
    const all = [];
    for (let i = 0; i < n; i++) {
      const a = o.up ? rnd(-Math.PI * 0.85, -Math.PI * 0.15) : rnd(0, Math.PI * 2);
      const d = rnd(spread * 0.4, spread), size = rnd(2, o.size || 4);
      const x0 = p.x + (o.spreadX ? rnd(-o.spreadX, o.spreadX) : 0), y0 = p.y + (o.dy || 0);
      const c = mk(svg, 'circle', { cx: x0, cy: y0, r: size, fill: i % 3 === 0 ? '#ffffff' : color, filter: o.glow === false ? '' : 'url(#fxGlow)' });
      all.push(anim(c, [
        { transform: 'translate(0px,0px) scale(1)', opacity: 1 },
        { transform: `translate(${Math.cos(a) * d}px, ${Math.sin(a) * d - (o.up ? rnd(10, 30) : 0)}px) scale(.4)`, opacity: 0 },
      ], (o.dur || 520) * rnd(0.8, 1.2), { delay: (o.delay || 0) + rnd(0, o.stagger || 60), remove: true }));
    }
    return Promise.all(all);
  }
  function slash(svg, p, angle, len, color, o = {}) {
    const rad = angle * Math.PI / 180, dx = Math.cos(rad) * len / 2, dy = Math.sin(rad) * len / 2;
    const cx = p.x + (o.ox || 0), cy = p.y + (o.oy || 0);
    const d = `M${cx - dx} ${cy - dy} Q ${cx - dy * 0.35} ${cy + dx * 0.35} ${cx + dx} ${cy + dy}`;
    const L = len * 1.25, w = o.width || 7;
    const g = mk(svg, 'g', { filter: 'url(#fxGlow)' });
    const outer = mk(g, 'path', { d, fill: 'none', stroke: color, 'stroke-width': w, 'stroke-linecap': 'round', 'stroke-dasharray': L, 'stroke-dashoffset': L });
    const core = mk(g, 'path', { d, fill: 'none', stroke: '#ffffff', 'stroke-width': Math.max(1.5, w / 3), 'stroke-linecap': 'round', 'stroke-dasharray': L, 'stroke-dashoffset': L });
    const draw = [{ strokeDashoffset: L }, { strokeDashoffset: 0 }];
    anim(outer, draw, 150, { delay: o.delay, easing: 'ease-in' });
    anim(core, draw, 150, { delay: o.delay, easing: 'ease-in' });
    return anim(g, [{ opacity: 1 }, { opacity: 0 }], 280, { delay: (o.delay || 0) + 170, remove: true });
  }
  function orb(svg, from, to, color, r, dur, o = {}) {
    const trail = [];
    for (let i = 3; i >= 0; i--) {
      const g = mk(svg, 'g', { filter: 'url(#fxGlow)', opacity: i ? 0.35 : 1 });
      mk(g, 'circle', { cx: from.x, cy: from.y, r: r * (i ? 0.75 : 1), fill: color });
      if (!i) mk(g, 'circle', { cx: from.x, cy: from.y, r: r * 0.45, fill: '#ffffff' });
      trail.push(anim(g, [{ transform: 'translate(0px,0px) scale(.4)' }, { transform: `translate(${to.x - from.x}px, ${(to.y - from.y) + (o.arc ? -o.arc : 0)}px) scale(1)`, offset: 0.5 }, { transform: `translate(${to.x - from.x}px, ${to.y - from.y}px) scale(1.1)` }], dur, { delay: i * 35, easing: 'ease-in', remove: true }));
    }
    return trail[trail.length - 1];
  }

  /* ---------- Chuyển động nhân vật ---------- */
  function lunge(el, dir, dist = 28, dur = 340) {
    if (!el.animate) return;
    el.animate([{ transform: 'translate(0,0)' }, { transform: `translate(${dir * dist}px,-4px)`, offset: 0.35 }, { transform: 'translate(0,0)' }], { duration: T(dur), easing: 'ease-out' });
  }
  function recoil(el, dir, strong) {
    if (!el.animate) return;
    const k = strong ? 20 : 11;
    el.animate([
      { transform: 'none', filter: 'none' },
      { transform: `translate(${dir * k}px,0) rotate(${dir * 5}deg)`, filter: 'brightness(2.2) saturate(.4)', offset: 0.18 },
      { transform: `translate(${-dir * 4}px,0)`, filter: 'none', offset: 0.6 },
      { transform: 'none', filter: 'none' },
    ], { duration: T(420), easing: 'ease-out' });
  }
  function glowPulse(el, color, dur = 800) {
    if (!el.animate) return;
    el.animate([{ filter: 'drop-shadow(0 0 0 transparent)' }, { filter: `drop-shadow(0 0 16px ${color}) brightness(1.15)`, offset: 0.4 }, { filter: 'drop-shadow(0 0 0 transparent)' }], { duration: T(dur) });
  }
  function shake(arena, mag) {
    if (!arena.animate) return;
    const f = [];
    for (let i = 0; i < 7; i++) f.push({ transform: `translate(${rnd(-mag, mag)}px, ${rnd(-mag, mag) * 0.6}px)` });
    f.push({ transform: 'none' });
    arena.animate(f, { duration: T(380) });
  }
  function flash(arena, color, op = 0.5, dur = 280) {
    const d = document.createElement('div');
    d.className = 'fx-flash';
    d.style.background = color;
    arena.appendChild(d);
    anim(d, [{ opacity: op }, { opacity: 0 }], dur, { remove: true });
  }
  function callout(arena, text, color, big) {
    ensureStyle();
    const d = document.createElement('div');
    d.className = 'fx-callout' + (big ? ' big' : '');
    d.style.setProperty('--fx-c', color);
    d.textContent = text + (big ? '!' : '');
    arena.appendChild(d);
    anim(d, [
      { opacity: 0, transform: 'translateX(-50%) scale(1.7)' },
      { opacity: 1, transform: 'translateX(-50%) scale(1)', offset: 0.16 },
      { opacity: 1, transform: 'translateX(-50%) scale(1)', offset: 0.78 },
      { opacity: 0, transform: 'translateX(-50%) translateY(-10px) scale(1)' },
    ], big ? 1600 : 1200, { remove: true });
  }

  /* ---------- Từng kiểu hiệu ứng ---------- */
  const K = {};

  K.thuong = async c => {
    lunge(c.a, c.dir, 22);
    await wait(140);
    spikes(c.svg, c.Tp, '#ffffff', 6, 6, 26, { width: 2.5 });
    particles(c.svg, c.Tp, '#e8d8b8', 5, 26, { glow: false });
    c.hit();
    await wait(260);
  };

  K.quyen = async c => {
    lunge(c.a, c.dir, 32);
    await wait(150);
    ring(c.svg, c.Tp, c.color, 48, { width: 5 });
    spikes(c.svg, c.Tp, c.color, 10, 10, 44);
    particles(c.svg, { x: c.Tp.x, y: c.Tp.y + c.Tp.h * 0.3 }, '#c8b48a', 10, 46, { glow: false, size: 5 });
    c.hit();
    await wait(400);
  };

  /* ---------- Vô Danh Quyền: hình đổi theo tầng (tầng 1, 5, 10 ghi ở trường tiers trong data.js) ---------- */
  // Nắm đấm vẽ hướng sang phải, tâm ở (0,0), rộng khoảng 44 đơn vị; lật theo hướng đánh
  const FIST = 'M-16 -10 Q-16 -14 -11 -14 L8 -14 Q15 -14 15 -8 Q19 -6 15 -2 Q19 1 15 5 Q19 8 14 12 Q12 15 8 14 L-11 14 Q-16 14 -16 9 Z';
  function fist(svg, color, o = {}) {
    const g = mk(svg, 'g', { class: 'fx-free', filter: 'url(#fxGlow)', opacity: 0 });
    mk(g, 'rect', { x: -27, y: -9, width: 12, height: 18, rx: 3, fill: o.sleeve || '#2a1a10', opacity: 0.85 });
    mk(g, 'path', { d: FIST, fill: color, stroke: o.ink || '#3a2418', 'stroke-width': 2, 'stroke-linejoin': 'round', opacity: o.alpha || 1 });
    mk(g, 'path', { d: 'M5 -7 H14 M5 0 H15 M5 7 H14 M-5 13 Q3 14 6 6', fill: 'none', stroke: o.ink || '#3a2418', 'stroke-width': 1.6, 'stroke-linecap': 'round', opacity: o.alpha || 1 });
    return g;
  }
  // Bay nắm đấm từ p0 tới p1 (to dần), xong thì tan
  function fistFly(svg, p0, p1, dir, s0, s1, color, dur, o = {}) {
    const g = fist(svg, color, o);
    const tf = (p, s) => `translate(${p.x}px, ${p.y}px) scale(${dir * s}, ${s})`;
    return anim(g, [
      { transform: tf(p0, s0), opacity: 0 },
      { transform: tf(p0, s0), opacity: o.alpha || 1, offset: 0.1 },
      { transform: tf(p1, s1), opacity: o.alpha || 1, offset: 0.85 },
      { transform: tf(p1, s1 * 1.15), opacity: 0 },
    ], dur, { delay: o.delay, easing: 'ease-in', remove: true });
  }
  // Sao bốn cánh nhọn: chỗ đòn chạm
  function burstStar(svg, p, color, r, o = {}) {
    const d = `M${p.x} ${p.y - r} L${p.x + r * 0.16} ${p.y - r * 0.16} L${p.x + r} ${p.y} L${p.x + r * 0.16} ${p.y + r * 0.16} L${p.x} ${p.y + r} L${p.x - r * 0.16} ${p.y + r * 0.16} L${p.x - r} ${p.y} L${p.x - r * 0.16} ${p.y - r * 0.16} Z`;
    const s = mk(svg, 'path', { d, fill: '#ffffff', stroke: color, 'stroke-width': 3, filter: 'url(#fxGlow)' });
    return anim(s, [{ transform: 'scale(.15) rotate(-20deg)', opacity: 1 }, { transform: 'scale(1) rotate(0deg)', opacity: 1, offset: 0.4 }, { transform: 'scale(1.25) rotate(8deg)', opacity: 0 }], o.dur || 420, { delay: o.delay, remove: true });
  }
  // Vệt gió thẳng từ người ra đòn tới đối thủ
  function speedLines(svg, a, t, color, n, o = {}) {
    for (let i = 0; i < n; i++) {
      const y = t.y + rnd(-t.h * 0.18, t.h * 0.18), x0 = a.x + (t.x - a.x) * rnd(0.15, 0.35), x1 = a.x + (t.x - a.x) * rnd(0.7, 0.9);
      const l = mk(svg, 'line', { x1: x0, y1: y, x2: x1, y2: y, stroke: i % 2 ? '#ffffff' : color, 'stroke-width': o.width || 2, 'stroke-linecap': 'round', opacity: 0 });
      anim(l, [{ opacity: 0, transform: 'scaleX(.2)' }, { opacity: 0.9, transform: 'scaleX(1)', offset: 0.4 }, { opacity: 0, transform: 'scaleX(1.1)' }], o.dur || 260, { delay: (o.delay || 0) + i * 25, remove: true });
    }
  }

  // Nắm đấm ánh sáng: ảnh game/img/fx_vdq.png (ảnh Gemini người dùng tạo, nền đen đã đổi thành trong suốt; đầu nắm đấm ở 82% / 52% ảnh).
  // Màu theo mốc tầng của Vô Danh Quyền: trắng (tầng 1), xanh (tầng 5), vàng gốc (tầng 10).
  // Ảnh ánh sáng bay sang địch: src, tỉ lệ cao/rộng (ar), điểm đầu nắm đấm (hx, hy, theo phần ảnh)
  const FIST_IMG = { src: 'game/img/fx_vdq.png', ar: 307 / 550, hx: 0.82, hy: 0.52 };
  const LAHAN_IMG = { src: 'game/img/fx_lahan.png', ar: 297 / 700, hx: 0.86, hy: 0.55 };
  const DAILUC_IMG = { src: 'game/img/fx_dailuc.png', ar: 296 / 700, hx: 0.74, hy: 0.47 }; // điểm neo = tâm vòng sóng trước lòng bàn tay
  function fistImg(arena, p0, p1, dir, k, color, dur, pic = FIST_IMG) {
    const im = document.createElement('img'), W = 120 * k, H = W * pic.ar;
    im.src = pic.src; im.alt = '';
    const tint = pic !== FIST_IMG ? '' : /^#f{6}$/i.test(color) ? 'saturate(0) brightness(1.5)' : /^#5fb8ff$/i.test(color) ? 'hue-rotate(160deg) saturate(1.5)' : '';
    Object.assign(im.style, { position: 'absolute', zIndex: 150, pointerEvents: 'none', width: W + 'px', height: H + 'px',
      left: p0.x - W * pic.hx + 'px', top: p0.y - H * pic.hy + 'px', transformOrigin: `${pic.hx * 100}% ${pic.hy * 100}%`, filter: tint });
    arena.appendChild(im);
    const dx = p1.x - p0.x, dy = p1.y - p0.y, f = dir < 0 ? ' scaleX(-1)' : '';
    return anim(im, [
      { transform: `translate(0px,0px) scale(.35)${f}`, opacity: 0 },
      { transform: `translate(${dx * 0.12}px,${dy * 0.12}px) scale(.9)${f}`, opacity: 1, offset: 0.25 },
      { transform: `translate(${dx}px,${dy}px) scale(1.05)${f}`, opacity: 1 },
    ], dur, { easing: 'cubic-bezier(.35,0,.75,1)' }).then(() => {
      anim(im, [{ transform: `translate(${dx}px,${dy}px) scale(1.05)${f}`, opacity: 1 }, { transform: `translate(${dx + dir * W * 0.1}px,${dy}px) scale(1.5)${f}`, opacity: 0 }], 220, { remove: true });
    });
  }
  const NHULAI_SRC = 'game/img/fx_nhulai.png', PHAPTRAN_SRC = 'game/img/fx_phaptran.png';
  [FIST_IMG, LAHAN_IMG, DAILUC_IMG, { src: NHULAI_SRC }, { src: PHAPTRAN_SRC }].forEach(p => { new Image().src = p.src; }); // tải sẵn

  // Ảnh hiệu ứng đặt thẳng lên sân (HTML, trên lớp SVG), ở giữa điểm (x, y), cạnh s
  function fxImg(arena, src, x, y, s, z = 150) {
    const im = document.createElement('img'); im.src = src; im.alt = '';
    Object.assign(im.style, { position: 'absolute', zIndex: z, pointerEvents: 'none', width: s + 'px', height: s + 'px', left: x - s / 2 + 'px', top: y - s / 2 + 'px' });
    arena.appendChild(im);
    return im;
  }

  // Như Lai Thần Chưởng (tuyệt học, người dùng duyệt trên trang thử 2026-11-01), ba nhịp:
  // 1) pháp trận chữ Vạn (ảnh Gemini) bừng sáng nằm phẳng dưới chân kẻ bị đánh, xoay chậm
  // 2) vạn chưởng: sáu bàn tay Phật nhỏ từ nhiều hướng lần lượt lao vào địch, mỗi cái là một đòn 10% (hiện số khi chạm)
  // 3) bàn tay khổng lồ hiện trên cao, lơ lửng một nhịp rồi ập xuống người địch: đòn cuối 40%, sân rung mạnh
  K.nhulai = async c => {
    const AH = c.arena.getBoundingClientRect().height, tgt = { x: c.Tp.x, y: c.Tp.y };
    // 1) pháp trận
    const S0 = AH * 0.62, ring0 = document.createElement('div');
    // nằm dưới chân kẻ bị đánh (người dùng chốt 2026-11-01: pháp trận trấn áp đối thủ)
    Object.assign(ring0.style, { position: 'absolute', zIndex: 4, pointerEvents: 'none', width: S0 + 'px', height: S0 + 'px', left: c.Tp.x - S0 / 2 + 'px', top: c.Tp.bottom - 6 - S0 / 2 + 'px' });
    const disc = document.createElement('img'); disc.src = PHAPTRAN_SRC; disc.alt = ''; Object.assign(disc.style, { width: '100%', height: '100%', display: 'block' });
    ring0.appendChild(disc); c.arena.appendChild(ring0);
    anim(ring0, [{ opacity: 0, transform: 'scaleY(.36) scale(.3)' }, { opacity: 1, transform: 'scaleY(.36) scale(1.08)', offset: 0.7 }, { opacity: 1, transform: 'scaleY(.36) scale(1)' }], 520);
    const spin = disc.animate ? disc.animate([{ transform: 'rotate(0deg)', filter: 'brightness(1.1)' }, { transform: 'rotate(180deg)', filter: 'brightness(1.6)' }, { transform: 'rotate(360deg)', filter: 'brightness(1.1)' }], { duration: T(6000), iterations: Infinity }) : null;
    glowPulse(c.a, c.color, 900);
    await wait(800);
    // 2) vạn chưởng
    const S1 = AH * 0.36, R = AH * 0.65, angles = [-150, -100, -45, 10, 160, -10];
    const small = angles.map((deg, n) => wait(n * 320).then(() => {
      const a = deg * Math.PI / 180, sx = tgt.x + Math.cos(a) * R, sy = tgt.y + Math.sin(a) * R * 0.75;
      const im = fxImg(c.arena, NHULAI_SRC, sx, sy, S1);
      const rot = Math.atan2(tgt.y - sy, tgt.x - sx) * 180 / Math.PI + 90, dx = tgt.x - sx, dy = tgt.y - sy;
      return anim(im, [
        { transform: `translate(0px,0px) rotate(${rot}deg) scale(.5)`, opacity: 0 },
        { transform: `translate(${dx * 0.15}px,${dy * 0.15}px) rotate(${rot}deg) scale(1)`, opacity: 1, offset: 0.3 },
        { transform: `translate(${dx}px,${dy}px) rotate(${rot}deg) scale(.9)`, opacity: 1 },
      ], 700, { easing: 'ease-in' }).then(() => {
        lunge(c.t, c.dir, 10, 220);
        ring(c.svg, tgt, c.color, 22, { width: 3, dur: 260 });
        c.part(); // mỗi bàn tay nhỏ là một đòn 10%: hiện số đúng lúc chạm
        anim(im, [{ opacity: 1, filter: 'brightness(2)', transform: `translate(${dx}px,${dy}px) rotate(${rot}deg) scale(.9)` }, { opacity: 0, filter: 'brightness(3)', transform: `translate(${dx}px,${dy}px) rotate(${rot}deg) scale(1.5)` }], 280, { remove: true });
      });
    }));
    await Promise.all(small);
    await wait(120);
    // 3) bàn tay khổng lồ ập xuống
    const S2 = AH * 0.62, big = fxImg(c.arena, NHULAI_SRC, tgt.x, tgt.y - 6, S2), up = -(tgt.y + S2 * 0.15);
    await anim(big, [
      { transform: `translateY(${up}px) scale(1.35)`, opacity: 0, filter: 'brightness(1)' },
      { transform: `translateY(${up * 0.6}px) scale(1.2)`, opacity: 0.85, filter: 'brightness(1.3)', offset: 0.4 },
      { transform: `translateY(${up * 0.55}px) scale(1.18)`, opacity: 0.9, filter: 'brightness(1.5)', offset: 0.55, easing: 'cubic-bezier(.6,0,1,1)' },
      { transform: 'translateY(0px) scale(.95)', opacity: 1, filter: 'brightness(1.8)' },
    ], 1000, { easing: 'linear' });
    shake(c.arena, 10);
    ring(c.svg, tgt, c.color, 60 * c.size, { width: 6, dur: 460 });
    c.hit(true);
    anim(big, [{ transform: 'translateY(0px) scale(.95)', opacity: 1, filter: 'brightness(2.4)' }, { transform: 'translateY(0px) scale(1.35)', opacity: 0, filter: 'brightness(3)' }], 380, { remove: true });
    anim(ring0, [{ opacity: 1, transform: 'scaleY(.36) scale(1)' }, { opacity: 0, transform: 'scaleY(.36) scale(1.1)' }], 420, { delay: 200 }).then(() => { if (spin) spin.cancel(); ring0.remove(); });
    await wait(520);
  };

  /* ---------- Bộ Tâm Phật Chưởng (đường Chưởng Thanh Vân, ảnh Gemini người dùng tạo 2026-11-05) ---------- */
  const BELL_SRC = 'game/img/fx_minh_vuong.png', LOIAM_SRC = 'game/img/fx_loi_am.png', KT_SRC = 'game/img/fx_khong_tuong.png', BTA_SRC = 'game/img/fx_bo_tat_an.png';
  [BELL_SRC, LOIAM_SRC, KT_SRC, BTA_SRC].forEach(s => { new Image().src = s; });
  // Không Tướng Chưởng (người dùng chọn kiểu "nhiều bóng tay" 2026-11-05): ba bóng bàn tay ánh sáng mờ nối nhau lướt sang như ảo ảnh,
  // hai bóng phụ lệch trên / dưới rồi hội về một điểm; chạm thì gộp thành một bàn tay sáng bừng và nổ sóng
  // (ảnh fx_khong_tuong.png: thế đẩy chưởng nhìn ngang, hướng sang phải, sóng khí trước lòng bàn tay ở ~72% ngang;
  //  người dùng gửi lại ảnh 2026-11-05; đánh sang trái thì lật ngang)
  K.khongtuong = async c => {
    const AH = arenaH(c), S = AH * 0.42, fl = c.dir < 0 ? ' scaleX(-1)' : '', hp = { x: c.Tp.x, y: c.Tp.y };
    // tâm ảnh dừng lùi sau mục tiêu một đoạn để sóng khí trước lòng bàn tay chạm đúng người địch
    const p0 = { x: c.A.x + c.dir * c.A.w * 0.2, y: c.Tp.y }, p1 = { x: c.Tp.x - c.dir * S * 0.22, y: c.Tp.y };
    const dx = p1.x - p0.x, dy = p1.y - p0.y, off = AH * 0.1;
    lunge(c.a, c.dir, 18, 320);
    // [lệch dọc lúc xuất phát, độ đậm, cỡ, trễ]: bóng chính đi giữa, đậm nhất; hai bóng phụ mờ hơn, đi sau một nhịp
    const ghosts = [[0, 0.85, 1, 0], [-off, 0.45, 0.85, 90], [off, 0.45, 0.85, 170]];
    const ims = ghosts.map(([oy, op, k, d]) => {
      const im = fxImg(c.arena, KT_SRC, p0.x, p0.y + oy, S);
      im.style.opacity = 0;
      anim(im, [
        { transform: `translate(0px,0px) scale(${0.5 * k})${fl}`, opacity: 0 },
        { transform: `translate(${dx * 0.2}px,${dy * 0.2 - oy * 0.2}px) scale(${0.85 * k})${fl}`, opacity: op, offset: 0.3 },
        { transform: `translate(${dx}px,${dy - oy}px) scale(${k})${fl}`, opacity: op },
      ], 520, { delay: d, easing: 'cubic-bezier(.35,0,.75,1)' });
      return { im, oy, k };
    });
    await wait(520 + 170);
    // gộp: hai bóng phụ tan vào bóng chính, bóng chính sáng bừng rồi nổ
    ims.slice(1).forEach(g => anim(g.im, [{ opacity: 0.45 }, { opacity: 0, filter: 'brightness(2)' }], 200, { remove: true }));
    ring(c.svg, hp, '#fff1c8', 38, { width: 4, dur: 420 });
    ring(c.svg, hp, '#fff1c8', 64, { width: 2, dur: 560, delay: 90 });
    particles(c.svg, hp, '#fff6dc', 8, 46, { size: 3 });
    lunge(c.t, c.dir, 18, 300);
    c.hit();
    const m = ims[0].im;
    await anim(m, [{ transform: `translate(${dx}px,${dy}px) scale(1)${fl}`, opacity: 0.85, filter: 'brightness(1)' },
      { transform: `translate(${dx + c.dir * 6}px,${dy}px) scale(1.1)${fl}`, opacity: 1, filter: 'brightness(2.2)', offset: 0.3 },
      { transform: `translate(${dx + c.dir * 22}px,${dy}px) scale(1.3)${fl}`, opacity: 0, filter: 'brightness(2.6)' }], 380, { remove: true });
  };
  // Bồ Tát Ấn (người dùng chọn "ý 1" 2026-11-05, rồi đổi vòng đốm sáng thành bóng tay):
  // 1) ấn quyết hai tay (fx_bo_tat_an.png) bừng sáng trước ngực
  // 2) bàn tay sen vàng (fx_bta_chuong.png, ảnh người dùng gửi) bay vào địch kèm số bóng tay mờ = số Tâm Lực đã dồn (tối đa 5, người dùng chốt: nhiều quá xấu;
  //    số điểm suy từ c.size = 1 + 0,04 × điểm), các bóng hội lại gộp vào bàn tay chính khi chạm; thiếu ảnh thì vẽ tạm bằng mã
  const BTA_BEAM_SRC = 'game/img/fx_bta_chuong.png';
  let btaBeamOk = false;
  { const im = new Image(); im.onload = () => { btaBeamOk = true; }; im.src = BTA_BEAM_SRC; }
  K.botatan = async c => {
    const AH = arenaH(c), n = Math.max(0, Math.round((c.size - 1) / 0.04)), k = c.size;
    const palm = { x: c.A.x + c.dir * c.A.w * 0.38, y: c.A.y }, hp = { x: c.Tp.x, y: c.Tp.y };
    glowPulse(c.a, c.color, 900);
    // 1) ấn quyết hai tay bừng sáng trước ngực
    const MS = c.A.h * (0.85 + (k - 1) * 0.5), seal = fxImg(c.arena, BTA_SRC, palm.x, palm.y, MS);
    ring(c.svg, palm, c.color, MS * 0.45, { width: 3, dur: 420 });
    await anim(seal, [{ transform: 'scale(.4)', opacity: 0, filter: 'brightness(1)' }, { transform: 'scale(1.08)', opacity: 1, filter: 'brightness(1.8)', offset: 0.6 }, { transform: 'scale(1)', opacity: 1, filter: 'brightness(1.3)' }], 380);
    anim(seal, [{ opacity: 1 }, { opacity: 0, transform: 'scale(1.2)' }], 360, { delay: 120, remove: true });
    // 2) bàn tay sen vàng bay vào địch, mỗi điểm Tâm Lực thêm một bóng tay mờ bay theo (người dùng chốt 2026-11-05: thay vòng đốm sáng),
    //    các bóng tỏa lệch trên / dưới rồi hội về cùng một điểm, chạm thì gộp vào bàn tay chính (như ba bóng tay của Không Tướng Chưởng)
    const dy = hp.y - palm.y, fl = c.dir < 0 ? ' scaleX(-1)' : '';
    if (btaBeamOk) {
      // ảnh: bàn tay ở ~82% ngang, đuôi khí kéo về bên trái; tâm ảnh dừng lùi sau địch để bàn tay chạm đúng người địch
      const BS = AH * 0.5 * k, dx = hp.x - c.dir * BS * 0.3 - palm.x, G = Math.min(n, 5), spread = AH * 0.2;
      const fly = (oy, op, sc, d) => {
        const im = fxImg(c.arena, BTA_BEAM_SRC, palm.x, palm.y + oy, BS);
        im.style.opacity = 0;
        anim(im, [{ transform: `translate(0px,0px) scale(${0.5 * sc})${fl}`, opacity: 0 },
          { transform: `translate(${dx * 0.2}px,${dy * 0.2 - oy * 0.2}px) scale(${0.9 * sc})${fl}`, opacity: op, offset: 0.25 },
          { transform: `translate(${dx}px,${dy - oy}px) scale(${sc})${fl}`, opacity: op }], 520, { delay: d, easing: 'cubic-bezier(.35,0,.75,1)' });
        return im;
      };
      const main = fly(0, 1, 1, 0);
      const ghosts = [];
      for (let i = 0; i < G; i++) {
        const side = i % 2 ? 1 : -1, step = Math.floor(i / 2) + 1, rows = Math.ceil(G / 2);
        ghosts.push(fly(side * spread * step / rows, 0.38, 0.75, 70 + i * 45));
      }
      await wait(520 + (G ? 70 + (G - 1) * 45 : 0));
      ghosts.forEach(g => anim(g, [{ opacity: 0.38 }, { opacity: 0, filter: 'brightness(2)' }], 200, { remove: true }));
      anim(main, [{ transform: `translate(${dx}px,${dy}px) scale(1)${fl}`, opacity: 1, filter: 'brightness(1.8)' }, { transform: `translate(${dx}px,${dy}px) scale(1.5)${fl}`, opacity: 0, filter: 'brightness(2.6)' }], 320, { remove: true });
    } else await orb(c.svg, palm, hp, c.color, 12 * k, 420);
    shake(c.arena, 5 + (k - 1) * 10);
    ring(c.svg, hp, c.color, 48 * k, { width: 5, dur: 440 });
    ring(c.svg, hp, '#fff0c8', 76 * k, { width: 2, dur: 560, delay: 80 });
    particles(c.svg, hp, '#ffd890', 10, 60 * k, { size: 3 });
    lunge(c.t, c.dir, 20 + (k - 1) * 40, 460); // càng nhiều Tâm Lực địch bị đẩy lùi càng xa
    c.hit(true);
    await wait(380);
  };
  // Bồ Tát Ấn, bản thử "ý 3 · Nghìn tay Bồ Tát" (đang so với ý 1 trên trang thử): sau lưng người ra chiêu xòe ra một vòng cánh tay ánh sáng vàng
  // (ảnh bàn tay Không Tướng nhuộm vàng) như tượng Bồ Tát nghìn tay; số tay = 5 + nửa số Tâm Lực đã dồn (tối đa 15); rồi tất cả cùng đẩy chưởng vào địch
  K.botatan3 = async c => {
    const n = Math.max(0, Math.round((c.size - 1) / 0.04)), k = c.size, N = Math.min(15, 5 + Math.floor(n / 2));
    const C = { x: c.A.x - c.dir * c.A.w * 0.1, y: c.A.y - c.A.h * 0.08 }, R = c.A.h * 0.5, S = c.A.h * 0.62, hp = { x: c.Tp.x, y: c.Tp.y };
    const fl = c.dir < 0 ? ' scaleX(-1)' : '', gold = 'sepia(1) saturate(3.2) hue-rotate(-8deg) brightness(1.25)';
    glowPulse(c.a, c.color, 1200);
    const arms = [];
    for (let i = 0; i < N; i++) {
      const th = N === 1 ? 0 : -80 + (160 * i) / (N - 1), r = th * Math.PI / 180;
      const x = C.x + Math.cos(r) * R * c.dir * 0.6 - c.dir * R * 0.25, y = C.y + Math.sin(r) * R;
      const im = fxImg(c.arena, KT_SRC, x, y, S, 9); // z 9: ngay sau lưng nhân vật
      im.style.opacity = 0; im.style.filter = gold;
      const rot = c.dir * th;
      anim(im, [{ transform: `rotate(${rot}deg) scale(.4)${fl}`, opacity: 0 }, { transform: `rotate(${rot}deg) scale(1)${fl}`, opacity: 0.8 }], 300, { delay: i * 45, easing: 'ease-out' });
      arms.push({ im, x, y, rot });
    }
    await wait(300 + N * 45 + 250);
    // cả vòng tay lóe sáng một nhịp rồi cùng đẩy chưởng vào địch
    arms.forEach(a => anim(a.im, [{ filter: gold }, { filter: gold + ' brightness(1.8)' }, { filter: gold }], 260));
    await wait(260);
    const hits = arms.map((a, i) => anim(a.im, [
      { transform: `translate(0px,0px) rotate(${a.rot}deg) scale(1)${fl}`, opacity: 0.8 },
      { transform: `translate(${hp.x - a.x}px,${hp.y - a.y}px) rotate(${a.rot * 0.3}deg) scale(.8)${fl}`, opacity: 0.9 },
    ], 380, { delay: i * 25, easing: 'cubic-bezier(.5,0,1,1)' }).then(() => {
      anim(a.im, [{ opacity: 0.9, filter: gold + ' brightness(2)' }, { opacity: 0, filter: gold + ' brightness(2.6)' }], 220, { remove: true });
      if (i === 0) { lunge(c.t, c.dir, 14, 200); }
    }));
    await Promise.all(hits);
    shake(c.arena, 6 + (k - 1) * 10);
    ring(c.svg, hp, c.color, 50 * k, { width: 5, dur: 440 });
    ring(c.svg, hp, '#fff0c8', 80 * k, { width: 2, dur: 560, delay: 80 });
    particles(c.svg, hp, '#ffd890', 12, 64 * k, { size: 3 });
    lunge(c.t, c.dir, 22 + (k - 1) * 40, 460);
    c.hit(true);
    await wait(380);
  };
  // Minh Vương Ấn: chuông đồng từ trên rơi xuống úp trùm người ra chiêu, chạm đất ngân một tiếng (vòng sóng dưới chân), rồi mờ dần;
  // còn tác dụng thì chuông mờ vẫn trùm quanh người (.sd-bell trong san_dau.js), bị đánh trúng thì lóe sáng
  K.minhvuong = async c => {
    const AH = arenaH(c), S = c.A.h * 1.75, feet = { x: c.A.x, y: c.A.bottom - 4 };
    const bell = fxImg(c.arena, BELL_SRC, c.A.x, feet.y - S * 0.36, S);
    glowPulse(c.a, '#e0a85a', 900);
    await anim(bell, [
      { transform: `translateY(${-AH * 0.55}px) scale(.85)`, opacity: 0 },
      { transform: `translateY(${-AH * 0.4}px) scale(.9)`, opacity: 1, offset: 0.3 },
      { transform: 'translateY(0px) scale(1)', opacity: 1 },
    ], 520, { easing: 'cubic-bezier(.5,0,1,1)' });
    shake(c.arena, 4);
    ring(c.svg, feet, '#f0c070', S * 0.5, { width: 4, dur: 520 });
    ring(c.svg, feet, '#fff0c8', S * 0.75, { width: 2, dur: 640, delay: 90 });
    particles(c.svg, feet, '#ffd08a', 10, S * 0.4, { up: true, size: 3 });
    c.hit();
    await anim(bell, [{ opacity: 1, filter: 'brightness(1.6)' }, { opacity: 0.9, filter: 'brightness(1)', offset: 0.3 }, { opacity: 0, filter: 'brightness(1)' }], 900, { remove: true });
  };
  // Ảnh không vuông: rộng w, cao theo tỉ lệ ar (cao / rộng), tâm (x, y)
  function fxImgR(arena, src, x, y, w, ar, z = 150) {
    const h = w * ar, im = document.createElement('img'); im.src = src; im.alt = '';
    Object.assign(im.style, { position: 'absolute', zIndex: z, pointerEvents: 'none', width: w + 'px', height: h + 'px', left: x - w / 2 + 'px', top: y - h / 2 + 'px' });
    arena.appendChild(im);
    return im;
  }
  // Phật Quang Sơ Hiện (bộ Như Lai, ảnh Gemini người dùng 2026-11-09): vòng hào quang có bàn tay ánh sáng ở giữa (fx_sh_vong.png)
  // hiện trước ngực người ra chiêu, xoay nở ra, rồi bay thẳng vào địch; chạm thì vòng bừng sáng tan ra thành đốm vàng
  const SH_VONG = 'game/img/fx_sh_vong.png', SH_AR = 674 / 700;
  // (ảnh fx_sh_vong.png đã gỡ khỏi bản đăng 2026-11-10 vì giới hạn 512 tệp; K.sohienVong không còn dùng)
  // Bản 2 (người dùng chê bản vòng tròn "phèn, không hợp" 2026-11-09): dùng bàn tay ánh sáng của chiêu nộ (fx_tt_tay_nho.png, ngón chúc xuống,
  // đuôi lửa phía trên) xoay ngang cho ngón chĩa về phía địch, đuôi lửa kéo phía sau, lao vút như sao băng; chạm thì nổ chùm sáng nhỏ (fx_tt_no.png)
  K.sohien = async c => {
    const AH = arenaH(c), HW = AH * 0.2 * c.size, ar = 500 / 281; // ảnh tay cao / rộng
    const sx = c.A.x + c.dir * c.A.h * 0.3, sy = c.A.y, dx = c.Tp.x - sx, dy = c.Tp.y - sy;
    const rot = Math.atan2(dy, dx) * 180 / Math.PI - 90; // ảnh gốc ngón chúc xuống (hướng 90°)
    const im = fxImgR(c.arena, 'game/img/fx_tt_tay_nho.png', sx, sy, HW, ar);
    glowPulse(c.a, '#ffd36a', 500);
    await anim(im, [{ transform: `rotate(${rot}deg) scale(.3)`, opacity: 0, filter: 'brightness(2)' }, { transform: `rotate(${rot}deg) scale(1)`, opacity: 1, filter: 'brightness(1.3)' }], 200, { easing: 'ease-out' });
    await anim(im, [{ transform: `translate(0px,0px) rotate(${rot}deg) scale(1)` }, { transform: `translate(${dx}px,${dy}px) rotate(${rot}deg) scale(1.15)` }], 300, { easing: 'cubic-bezier(.4,0,1,1)' });
    const EW = AH * 0.55, no = fxImgR(c.arena, 'game/img/fx_tt_no.png', c.Tp.x, c.Tp.y, EW, 544 / 900, 155);
    lunge(c.t, c.dir, 16, 240);
    shake(c.arena, 3);
    c.hit();
    anim(no, [{ transform: 'scale(.3)', opacity: 0 }, { transform: 'scale(.9)', opacity: 1, offset: 0.3 }, { transform: 'scale(1)', opacity: 0 }], 520, { remove: true });
    await anim(im, [{ transform: `translate(${dx}px,${dy}px) rotate(${rot}deg) scale(1.15)`, opacity: 1, filter: 'brightness(2)' }, { transform: `translate(${dx}px,${dy}px) rotate(${rot}deg) scale(1.6)`, opacity: 0, filter: 'brightness(3)' }], 260, { remove: true });
  };
  K.sohienVong = async c => { // bản 1 (vòng tròn có bàn tay), không dùng
    const S = c.A.h * 0.8 * c.size, sx = c.A.x + c.dir * c.A.h * 0.35, sy = c.A.y, dx = c.Tp.x - sx, dy = c.Tp.y - sy;
    const v = fxImgR(c.arena, SH_VONG, sx, sy, S, SH_AR);
    glowPulse(c.a, '#ffd36a', 600);
    await anim(v, [{ transform: 'scale(.15) rotate(-160deg)', opacity: 0 }, { transform: 'scale(1.1) rotate(-15deg)', opacity: 1, filter: 'brightness(1.6)', offset: 0.75 }, { transform: 'scale(1) rotate(0deg)', opacity: 1 }], 420, { easing: 'ease-out' });
    await anim(v, [{ transform: 'translate(0px,0px) scale(1,1)' }, { transform: `translate(${dx}px,${dy}px) scale(.8,1)` }], 380, { easing: 'cubic-bezier(.5,0,1,1)' });
    ring(c.svg, { x: c.Tp.x, y: c.Tp.y }, '#ffd36a', 40, { width: 4, dur: 360 });
    particles(c.svg, { x: c.Tp.x, y: c.Tp.y }, '#ffe08a', 12, S * 0.5, { size: 3 });
    lunge(c.t, c.dir, 12, 220);
    c.hit();
    await anim(v, [{ transform: `translate(${dx}px,${dy}px) scale(.8,1)`, opacity: 1, filter: 'brightness(2)' }, { transform: `translate(${dx}px,${dy}px) scale(1.5,1.6)`, opacity: 0, filter: 'brightness(3)' }], 320, { remove: true });
  };
  // Phật Động Sơn Hà (bộ Như Lai, người dùng 2026-11-09: lấy cú bàn tay khổng lồ rơi của chiêu Như Lai cũ, chỉ cần bàn tay rơi):
  // bàn tay vàng (fx_nhulai.png) hiện trên cao, lơ lửng một nhịp rồi ập xuống người địch, sân rung, sóng loang
  K.sonha = async c => {
    const AH = arenaH(c), tgt = { x: c.Tp.x, y: c.Tp.y }, S2 = AH * 0.62 * c.size;
    const big = fxImg(c.arena, NHULAI_SRC, tgt.x, tgt.y - 6, S2), up = -(tgt.y + S2 * 0.15);
    glowPulse(c.a, c.color, 700);
    await anim(big, [
      { transform: `translateY(${up}px) scale(1.35)`, opacity: 0, filter: 'brightness(1)' },
      { transform: `translateY(${up * 0.6}px) scale(1.2)`, opacity: 0.85, filter: 'brightness(1.3)', offset: 0.4 },
      { transform: `translateY(${up * 0.55}px) scale(1.18)`, opacity: 0.9, filter: 'brightness(1.5)', offset: 0.55, easing: 'cubic-bezier(.6,0,1,1)' },
      { transform: 'translateY(0px) scale(.95)', opacity: 1, filter: 'brightness(1.8)' },
    ], 900, { easing: 'linear' });
    shake(c.arena, 9);
    // nổ chấn động vàng dưới chân như chiêu nộ (người dùng 2026-11-09); vòng sóng của ảnh nằm ở ~78% chiều cao ảnh
    { const AW = c.arena.getBoundingClientRect().width, EW = Math.min(AW * 0.85, AH * 0.95), eh = EW * 544 / 900;
      const no = fxImgR(c.arena, 'game/img/fx_tt_no.png', tgt.x, c.Tp.bottom - eh * 0.28, EW, 544 / 900, 155);
      anim(no, [{ transform: 'scale(.4)', opacity: 0 }, { transform: 'scale(1.05)', opacity: 1, offset: 0.3 }, { transform: 'scale(1.15)', opacity: 0 }], 800, { remove: true }); }
    c.hit(true);
    await anim(big, [{ transform: 'translateY(0px) scale(.95)', opacity: 1, filter: 'brightness(2.4)' }, { transform: 'translateY(0px) scale(1.35)', opacity: 0, filter: 'brightness(3)' }], 380, { remove: true });
  };
  // Vạn Phật Triều Tông (chiêu nộ bộ Như Lai, người dùng làm lại 2026-11-09, 4 ảnh Gemini): trên đầu kẻ bị đánh mở ra vòm mây xoáy
  // ánh vàng (fx_tt_may.png), từ tâm mây nhiều bàn tay vàng nhỏ (fx_tt_tay_nho.png, ngón chúc xuống) rơi liên tiếp, rồi một bàn tay
  // khổng lồ bốc lửa vàng (fx_tt_tay_lon.png) giáng xuống: nổ chấn động vàng dưới chân (fx_tt_no.png), sân rung, đó là đòn chạm (c.hit)
  const TT_MAY = ['game/img/fx_tt_may.png', 593 / 900], TT_NHO = ['game/img/fx_tt_tay_nho.png', 500 / 281],
    TT_LON = ['game/img/fx_tt_tay_lon.png', 658 / 800], TT_NO = ['game/img/fx_tt_no.png', 544 / 900];
  [TT_MAY, TT_NHO, TT_LON, TT_NO].forEach(s => { new Image().src = s[0]; });
  K.trieutong = async c => {
    const AH = arenaH(c), AW = c.arena.getBoundingClientRect().width, T0 = { x: c.Tp.x, y: c.Tp.y };
    // 1) vòm mây xoáy trên đầu kẻ bị đánh
    const CW = Math.min(AW * 0.7, AH * 0.85), CH = CW * TT_MAY[1], mx = Math.max(CW * 0.42, Math.min(AW - CW * 0.42, T0.x));
    // mép dưới mây chạm đỉnh đầu kẻ bị đánh; sân thấp thì giữ mây trong sân (có thể phủ nhẹ lên đầu)
    const my = Math.max(CH * 0.42, c.Tp.bottom - c.Tp.h - CH * 0.38);
    const may = fxImgR(c.arena, TT_MAY[0], mx, my, CW, TT_MAY[1], 6);
    await anim(may, [{ transform: 'scale(.5) rotate(-12deg)', opacity: 0 }, { transform: 'scale(1) rotate(0deg)', opacity: 0.95 }], 700, { easing: 'ease-out' });
    const pulse = may.animate ? may.animate([{ filter: 'brightness(1)' }, { filter: 'brightness(1.5)' }, { filter: 'brightness(1)' }], { duration: T(900), iterations: Infinity }) : null;
    glowPulse(c.a, '#ffd36a', 1000);
    // 2) mưa bàn tay nhỏ từ tâm mây
    const N = 8, HS = AH * 0.17;
    const rain = Array.from({ length: N }, (_, n) => wait(n * 130).then(() => {
      const tx = T0.x + (Math.random() - 0.5) * c.Tp.h * 0.7, ty = T0.y + (Math.random() - 0.5) * c.Tp.h * 0.3;
      const sx = mx + (Math.random() - 0.5) * CW * 0.25, sy = my;
      const im = fxImgR(c.arena, TT_NHO[0], sx, sy, HS / TT_NHO[1] * 1.0, TT_NHO[1]), dx = tx - sx, dy = ty - sy;
      return anim(im, [{ transform: 'translate(0px,0px) scale(.4)', opacity: 0 }, { transform: `translate(${dx * 0.15}px,${dy * 0.15}px) scale(1)`, opacity: 1, offset: 0.25 },
        { transform: `translate(${dx}px,${dy}px) scale(1)`, opacity: 1 }], 420, { easing: 'ease-in' }).then(() => {
        lunge(c.t, 0, 4, 120);
        ring(c.svg, { x: tx, y: ty }, '#ffd36a', 18, { width: 3, dur: 220 });
        anim(im, [{ transform: `translate(${dx}px,${dy}px) scale(1)`, opacity: 1, filter: 'brightness(2)' }, { transform: `translate(${dx}px,${dy}px) scale(1.4)`, opacity: 0, filter: 'brightness(3)' }], 240, { remove: true });
      });
    }));
    await Promise.all(rain);
    // 3) bàn tay khổng lồ giáng xuống
    const BW = AH * 0.62 * c.size, bh = BW * TT_LON[1], by = T0.y - bh * 0.18;
    const big = fxImgR(c.arena, TT_LON[0], T0.x, by, BW, TT_LON[1], 160), up = my - by;
    await anim(big, [
      { transform: `translateY(${up}px) scale(.5)`, opacity: 0 },
      { transform: `translateY(${up}px) scale(1.1)`, opacity: 1, filter: 'brightness(1.4)', offset: 0.35 },
      { transform: `translateY(${up * 0.9}px) scale(1.1)`, opacity: 1, filter: 'brightness(1.6)', offset: 0.55, easing: 'cubic-bezier(.6,0,1,1)' },
      { transform: 'translateY(0px) scale(1)', opacity: 1, filter: 'brightness(1.9)' },
    ], 900, { easing: 'linear' });
    // nổ chấn động dưới chân (vòng sóng của ảnh nằm ở ~78% chiều cao ảnh)
    const EW = Math.min(AW * 0.95, AH * 1.1), eh = EW * TT_NO[1];
    const no = fxImgR(c.arena, TT_NO[0], T0.x, c.Tp.bottom - eh * 0.28, EW, TT_NO[1], 155);
    shake(c.arena, 12);
    c.hit(true);
    anim(no, [{ transform: 'scale(.4)', opacity: 0 }, { transform: 'scale(1.05)', opacity: 1, offset: 0.3 }, { transform: 'scale(1.15)', opacity: 0 }], 900, { remove: true });
    anim(big, [{ opacity: 1, filter: 'brightness(2.4)', transform: 'translateY(0px) scale(1)' }, { opacity: 0, filter: 'brightness(3)', transform: 'translateY(0px) scale(1.25)' }], 420, { remove: true });
    await wait(300);
    await anim(may, [{ opacity: 0.95 }, { opacity: 0, transform: 'scale(1.15)' }], 600, { remove: true });
    if (pulse) pulse.cancel();
  };
  // (bản cũ: tượng Phật nhiều tay sau lưng + bàn tay bay ngang; người dùng thấy chưa đẹp, giữ lại để tham khảo, không dùng)
  const TT_PHAT = 'game/img/fx_tt_phat.png', TT_TAY = 'game/img/fx_tt_tay.png';
  K.trieutongPhat = async c => {
    const AH = arenaH(c), AW = c.arena.getBoundingClientRect().width, S = AH * 0.72;
    const bx = Math.max(S * 0.5, Math.min(AW - S * 0.5, c.A.x)), by = Math.max(S * 0.4, c.A.bottom - S * 0.45);
    const bud = fxImg(c.arena, TT_PHAT, bx, by, S, 5); // z 5: sau lưng nhân vật
    await anim(bud, [{ transform: 'translateY(30px) scale(.8)', opacity: 0, filter: 'brightness(1)' }, { transform: 'translateY(0px) scale(1)', opacity: 0.95, filter: 'brightness(1.3)' }], 650, { easing: 'ease-out' });
    glowPulse(c.a, '#ffd36a', 1200);
    anim(bud, [{ filter: 'brightness(1.3)' }, { filter: 'brightness(1.8)', offset: 0.3 }, { filter: 'brightness(1.2)' }], 1400);
    const tgt = { x: c.Tp.x, y: c.Tp.y }, N = 8, HS = AH * 0.2;
    // các bàn tay xuất phát quanh nửa trên tượng Phật, bay chéo về phía địch, nối nhau
    const shots = Array.from({ length: N }, (_, n) => wait(n * 150).then(() => {
      const last = n === N - 1, sx = bx + (Math.random() - 0.5) * S * 0.7, sy = by - S * (0.1 + Math.random() * 0.3);
      const sz = last ? HS * 1.8 : HS * (0.75 + Math.random() * 0.4), ty = tgt.y + (last ? 0 : (Math.random() - 0.5) * c.Tp.h * 0.5);
      const im = fxImg(c.arena, TT_TAY, sx, sy, sz), dx = tgt.x - sx, dy = ty - sy, rot = Math.atan2(dy, dx) * 180 / Math.PI + 90;
      return anim(im, [
        { transform: `translate(0px,0px) rotate(${rot}deg) scale(.4)`, opacity: 0 },
        { transform: `translate(${dx * 0.12}px,${dy * 0.12}px) rotate(${rot}deg) scale(1)`, opacity: 1, offset: 0.25 },
        { transform: `translate(${dx}px,${dy}px) rotate(${rot}deg) scale(1)`, opacity: 1 },
      ], last ? 620 : 480, { easing: 'ease-in' }).then(() => {
        if (last) { shake(c.arena, 10); ring(c.svg, tgt, c.color, 64 * c.size, { width: 6, dur: 480 }); c.hit(true); }
        else { lunge(c.t, c.dir, 6, 160); ring(c.svg, { x: tgt.x, y: ty }, c.color, 20, { width: 3, dur: 240 }); }
        anim(im, [{ opacity: 1, filter: 'brightness(2)', transform: `translate(${dx}px,${dy}px) rotate(${rot}deg) scale(1)` }, { opacity: 0, filter: 'brightness(3)', transform: `translate(${dx}px,${dy}px) rotate(${rot}deg) scale(1.5)` }], 280, { remove: true });
      });
    }));
    await Promise.all(shots);
    await anim(bud, [{ opacity: 0.95 }, { opacity: 0, transform: 'translateY(-20px) scale(1.05)' }], 600, { remove: true });
  };
  // Phật Quang Phổ Chiếu (bộ Như Lai, người dùng 2026-11-09: chỉ dùng vòng Phật quang, không chuông): vòng lửa vàng có cánh sen
  // (fx_pho_chieu.png) nở từ giữa thân, vừa xoay vừa bừng sáng rồi ôm vừa người, đúng chỗ vòng mờ .sd-pc giữ suốt 3 lượt (cạnh 1,5 × chiều cao người)
  const PC_SRC = 'game/img/fx_pho_chieu.png';
  new Image().src = PC_SRC;
  K.phochieu = async c => {
    const S = c.A.h * 1.5, cy = c.A.bottom + c.A.h * 0.16 - S / 2;
    const rg = fxImg(c.arena, PC_SRC, c.A.x, cy, S);
    glowPulse(c.a, '#ffd36a', 900);
    await anim(rg, [
      { transform: 'scale(.15) rotate(-120deg)', opacity: 0, filter: 'brightness(2)' },
      { transform: 'scale(1.12) rotate(-10deg)', opacity: 1, filter: 'brightness(1.8)', offset: 0.7 },
      { transform: 'scale(1) rotate(0deg)', opacity: 1, filter: 'brightness(1.2)' },
    ], 700, { easing: 'cubic-bezier(.2,.8,.3,1)' });
    particles(c.svg, { x: c.A.x, y: cy }, '#a8f0a0', 12, S * 0.45, { up: true, size: 3 });
    particles(c.svg, { x: c.A.x, y: cy }, '#ffd36a', 10, S * 0.5, { up: true, size: 3 });
    c.hit();
    await anim(rg, [{ opacity: 1, filter: 'brightness(1.2)' }, { opacity: 0, filter: 'brightness(1)' }], 600, { remove: true });
  };
  // Thiên Cổ Lôi Âm (chiêu nộ, đánh cả sân): bóng Phật xanh ngọc hiện lên sau lưng người ra chiêu (nhỏ vừa đủ để hiện trọn trong sân),
  // rồi hoa sen ánh sáng (fx_sen.png) từ trên trời rơi xuống đầu từng kẻ địch; sen chạm thì nở bung, kẻ đó rung lên.
  // c.size theo Tâm Lực lúc ra chiêu: càng nhiều sen càng to (người dùng chốt 2026-11-05, thay kiểu bắn sen ngang)
  const SEN_SRC = 'game/img/fx_sen.png';
  new Image().src = SEN_SRC;
  function lotusDrop(arena, svg, p, S, H, dur) {
    const im = fxImg(arena, SEN_SRC, p.x, p.y, S), up = -H * 0.5;
    return anim(im, [
      { transform: `translateY(${up}px) scale(1.2) rotate(-20deg)`, opacity: 0 },
      { transform: `translateY(${up * 0.8}px) scale(1.1) rotate(-12deg)`, opacity: 1, offset: 0.3 },
      { transform: 'translateY(0px) scale(.95) rotate(0deg)', opacity: 1 },
    ], dur, { easing: 'cubic-bezier(.55,0,1,1)' }).then(() => {
      ring(svg, p, '#5fe0c0', S * 0.55, { width: 3, dur: 380 });
      anim(im, [{ transform: 'translateY(0px) scale(.95)', opacity: 1, filter: 'brightness(1.8)' },
        { transform: 'translateY(0px) scale(1.7)', opacity: 0, filter: 'brightness(2.4)' }], 380, { remove: true });
    });
  }
  K.loiam = async c => {
    const AH = arenaH(c), AW = c.arena.getBoundingClientRect().width, S = AH * 0.6;
    const bx = Math.max(S * 0.45, Math.min(AW - S * 0.45, c.A.x)); // đứng sát mép thì bóng Phật dịch vào để không bị cắt
    const by = Math.max(S * 0.5, c.A.bottom - S * 0.5);              // đỉnh đầu Phật không vượt khỏi mép trên sân
    const bud = fxImg(c.arena, LOIAM_SRC, bx, by, S, 5); // z 5: sau lưng nhân vật
    await anim(bud, [{ transform: 'translateY(24px) scale(.8)', opacity: 0 }, { transform: 'translateY(0px) scale(1)', opacity: 0.95 }], 650, { easing: 'ease-out' });
    glowPulse(c.a, '#5fe0c0', 900);
    anim(bud, [{ filter: 'brightness(1)' }, { filter: 'brightness(1.7)', offset: 0.3 }, { filter: 'brightness(1)' }], 900);
    const LS = AH * 0.22 * c.size;
    // mục tiêu chính trước, rồi lần lượt các kẻ còn lại
    const tg = [{ el: c.t, p: c.Tp, main: true }].concat(c.others.map(el => ({ el, p: at(el, c.arena) })));
    const shots = tg.map((o, i) => wait(i * 140).then(() => lotusDrop(c.arena, c.svg, { x: o.p.x, y: o.p.y - o.p.h * 0.05 }, LS, AH, 640)).then(() => {
      if (o.main) { shake(c.arena, 7); c.hit(true); } else recoil(o.el, c.dir, true);
    }));
    await Promise.all(shots);
    await wait(260);
    await anim(bud, [{ opacity: 0.95 }, { opacity: 0, transform: 'translateY(-14px)' }], 500, { remove: true });
  };

  /* ---------- Bộ Hàng Long Chưởng Pháp: rồng ánh sáng (ảnh game/img/fx_rong.png, đầu rồng ở 86% / 32% ảnh) ---------- */
  const RONG_SRC = 'game/img/fx_rong.png', RONG_AR = 384 / 900, BLUE = 'hue-rotate(170deg) saturate(1.4) ';
  new Image().src = RONG_SRC;
  // Một con rồng bay từ p0 tới p1, xoay theo hướng bay, chạm thì lóe sáng rồi tan; o.tint đổi màu (rồng xanh)
  function dragon(arena, p0, p1, S, dur, o = {}) {
    const W = S, H = W * RONG_AR, im = document.createElement('img'), t = o.tint || '';
    im.src = RONG_SRC; im.alt = '';
    Object.assign(im.style, { position: 'absolute', zIndex: 150, pointerEvents: 'none', width: W + 'px', height: H + 'px',
      left: p0.x - W * 0.86 + 'px', top: p0.y - H * 0.32 + 'px', transformOrigin: '86% 32%' });
    arena.appendChild(im);
    const dx = p1.x - p0.x, dy = p1.y - p0.y, rot = Math.atan2(dy, dx) * 180 / Math.PI, sc = o.from || 0.4;
    const tf = (x, y, s) => `translate(${x}px,${y}px) rotate(${rot}deg) scale(${s})`;
    return anim(im, [
      { transform: tf(0, 0, sc), opacity: 0, filter: t + 'brightness(1)' },
      { transform: tf(dx * 0.1, dy * 0.1, (sc + 1) / 2), opacity: 1, filter: t + 'brightness(1.5)', offset: 0.2 },
      { transform: tf(dx, dy, 1), opacity: 1, filter: t + 'brightness(1.2)' },
    ], dur, { easing: o.ease || 'cubic-bezier(.35,0,.75,1)' }).then(() => {
      const ux = Math.cos(rot * Math.PI / 180) * W * 0.12, uy = Math.sin(rot * Math.PI / 180) * W * 0.12;
      anim(im, [{ transform: tf(dx, dy, 1), opacity: 1, filter: t + 'brightness(2.2)' }, { transform: tf(dx + ux, dy + uy, 1.2), opacity: 0, filter: t + 'brightness(3)' }], 260, { remove: true });
    });
  }
  const arenaH = c => c.arena.getBoundingClientRect().height;
  // Song Long Xuất Hải: rồng vàng rồi rồng xanh song song lao vào, mỗi con một đòn
  K.songlong = async c => {
    const H = arenaH(c), S = H * 0.6, d = H * 0.05;
    const shots = [0, 1].map(i => wait(i * 160).then(() => dragon(c.arena, { x: c.A.x, y: c.A.y + (i ? d : -d) }, { x: c.Tp.x, y: c.Tp.y + (i ? d : -d) }, S, 760, { tint: i ? BLUE : '' })).then(() => {
      burstStar(c.svg, c.Tp, i ? '#7fd0ff' : c.color, 26);
      if (i) { lunge(c.t, c.dir, 24); c.hit(); } else c.part();
    }));
    await Promise.all(shots);
    await wait(200);
  };
  // Long Tiếu Cửu Thiên: rồng vút lên trời rồi bổ thẳng xuống đầu đối thủ
  K.longtieu = async c => {
    const H = arenaH(c), S = H * 0.85, top = { x: c.A.x + (c.Tp.x - c.A.x) * 0.35, y: -H * 0.3 };
    await dragon(c.arena, c.A, top, S, 560, { from: 0.5, ease: 'ease-in' });
    await wait(150);
    await dragon(c.arena, { x: c.Tp.x + c.dir * H * 0.05, y: -H * 0.35 }, c.Tp, S * 1.05, 480, { from: 1, ease: 'cubic-bezier(.7,0,1,.6)' });
    ring(c.svg, c.Tp, c.color, 56 * c.size, { width: 5 });
    shake(c.arena, 6);
    c.hit(true);
    await wait(300);
  };
  // Cuồng Long Loạn Vũ (chiêu nộ, "Thần Long hiện thân", người dùng duyệt đề xuất 2026-11-07, 2 ảnh Gemini của người dùng):
  // 1) sân tối lại, rồng thần vàng (fx_than_long.png, khổ dọc, đầu bên phải) cuộn mình hiện sau lưng người ra chiêu rồi gầm;
  // 2) năm rồng con vàng / xanh (fx_rong.png) lần lượt lao từ thân rồng thần vào mục tiêu, mỗi con một đòn 10% (c.part);
  // 3) đầu rồng (fx_dau_rong.png, nhìn ngang hướng phải, mõm ở 90% / 56% ảnh) giáng xuống mục tiêu: đòn 50% cuối, nổ sóng, sân rung mạnh;
  // tầng 10 đánh thêm 1 kẻ (c.others, engine move.spread): một rồng con quật sang. c.size theo Cuồng Long lúc ra chiêu (engine act).
  const THAN_SRC = 'game/img/fx_than_long.png', THAN_AR = 717 / 960, DAU_SRC = 'game/img/fx_dau_rong.png';
  [THAN_SRC, DAU_SRC].forEach(s => { new Image().src = s; });
  // Đầu rồng lao từ p0 tới p1, mõm đi trước; ảnh gốc hướng phải hơi chúc xuống (~20 độ)
  function dragonHead(arena, p0, p1, S, dur) {
    const im = document.createElement('img'); im.src = DAU_SRC; im.alt = '';
    const ax = 0.9, ay = 0.56, left = p1.x < p0.x;
    Object.assign(im.style, { position: 'absolute', zIndex: 150, pointerEvents: 'none', width: S + 'px', height: S + 'px',
      left: p0.x - S * ax + 'px', top: p0.y - S * ay + 'px', transformOrigin: `${ax * 100}% ${ay * 100}%` });
    arena.appendChild(im);
    const dx = p1.x - p0.x, dy = p1.y - p0.y;
    let rot = Math.atan2(dy, dx) * 180 / Math.PI - 20;
    if (left) rot = Math.atan2(dy, -dx) * 180 / Math.PI - 20; // đánh sang trái: lật ngang rồi tính góc như đánh sang phải
    const tf = (x, y, s) => `translate(${x}px,${y}px)${left ? ' scaleX(-1)' : ''} rotate(${rot}deg) scale(${s})`;
    return anim(im, [
      { transform: tf(0, 0, 0.5), opacity: 0, filter: 'brightness(1.2)' },
      { transform: tf(dx * 0.15, dy * 0.15, 0.85), opacity: 1, filter: 'brightness(1.6)', offset: 0.25 },
      { transform: tf(dx, dy, 1), opacity: 1, filter: 'brightness(1.3)' },
    ], dur, { easing: 'cubic-bezier(.55,0,.85,.6)' }).then(() => {
      anim(im, [{ transform: tf(dx, dy, 1), opacity: 1, filter: 'brightness(2.4)' }, { transform: tf(dx, dy, 1.25), opacity: 0, filter: 'brightness(3)' }], 300, { remove: true });
    });
  }
  K.cuonglong = async c => {
    const AH = arenaH(c), AW = c.arena.getBoundingClientRect().width, k = c.size || 1;
    // màn tối: làm rồng vàng nổi bật
    const dim = document.createElement('div');
    Object.assign(dim.style, { position: 'absolute', inset: 0, zIndex: 4, pointerEvents: 'none', background: 'radial-gradient(circle at 50% 60%, rgba(30,15,0,.35), rgba(0,0,0,.6))' });
    c.arena.appendChild(dim);
    anim(dim, [{ opacity: 0 }, { opacity: 1 }], 400);
    // 1) rồng thần sau lưng (z 5: sau nhân vật), luôn nằm trọn trong sân
    const H = AH * 0.66, W = H * THAN_AR;
    const bx = Math.max(W * 0.5, Math.min(AW - W * 0.5, c.A.x - c.dir * W * 0.12)), by = Math.max(H * 0.5, c.A.bottom - H * 0.5);
    const god = document.createElement('img'); god.src = THAN_SRC; god.alt = '';
    Object.assign(god.style, { position: 'absolute', zIndex: 5, pointerEvents: 'none', width: W + 'px', height: H + 'px', left: bx - W / 2 + 'px', top: by - H / 2 + 'px' });
    const fl = c.dir < 0 ? ' scaleX(-1)' : '';
    c.arena.appendChild(god);
    await anim(god, [{ transform: `translateY(${H * 0.12}px) scale(.82)${fl}`, opacity: 0 }, { transform: `translateY(0px) scale(1)${fl}`, opacity: 0.95 }], 620, { easing: 'cubic-bezier(.2,.8,.3,1)' });
    shake(c.arena, 5);
    glowPulse(c.a, '#ffcf40', 1000);
    anim(god, [{ filter: 'brightness(1)' }, { filter: 'brightness(1.8)', offset: 0.25 }, { filter: 'brightness(1.1)' }], 800);
    particles(c.svg, { x: bx + c.dir * W * 0.3, y: by - H * 0.38 }, '#ffe08a', 14, W * 0.5, { size: 3 });
    await wait(260);
    // 2) năm rồng con lao ra từ thân rồng thần
    const small = [0, 1, 2, 3, 4].map(n => wait(n * 170).then(() => {
      const p0 = { x: bx + (n % 2 ? -1 : 1) * W * 0.18, y: by - H * 0.32 + n * H * 0.13 };
      const p1 = { x: c.Tp.x, y: c.Tp.y + (n - 2) * c.Tp.h * 0.06 };
      return dragon(c.arena, p0, p1, AH * 0.42 * k, 520, { tint: n % 2 ? BLUE : '' });
    }).then(() => { burstStar(c.svg, c.Tp, n % 2 ? '#7fd0ff' : '#ffcf40', 18); lunge(c.t, c.dir, 8, 200); c.part(); }));
    await Promise.all(small);
    // 3) đầu rồng giáng xuống mục tiêu
    const p0 = { x: bx + c.dir * W * 0.25, y: by - H * 0.42 };
    await dragonHead(c.arena, p0, { x: c.Tp.x, y: c.Tp.y }, AH * 0.55 * k, 560);
    shake(c.arena, 12);
    ring(c.svg, c.Tp, '#ffcf40', 62 * k, { width: 6, dur: 460 });
    ring(c.svg, c.Tp, '#fff4c8', 96 * k, { width: 3, dur: 600, delay: 80 });
    particles(c.svg, c.Tp, '#ffe08a', 18, 80 * k, { size: 3 });
    lunge(c.t, c.dir, 40, 520);
    c.hit(true);
    // tầng 10: một rồng con quật sang kẻ địch thứ hai
    const extra = (c.others || []).map(el => {
      const p = at(el, c.arena);
      return dragon(c.arena, { x: c.Tp.x, y: c.Tp.y - c.Tp.h * 0.2 }, p, AH * 0.42 * k, 420, { from: 0.6 }).then(() => { burstStar(c.svg, p, '#ffcf40', 22); recoil(el, c.dir, true); });
    });
    await Promise.all(extra);
    await wait(260);
    anim(dim, [{ opacity: 1 }, { opacity: 0 }], 500, { remove: true });
    await anim(god, [{ opacity: 0.95, transform: `translateY(0px)${fl}` }, { opacity: 0, transform: `translateY(-16px)${fl}` }], 520, { remove: true });
  };
  // Chiến Long Tại Dã (phụ trợ, người dùng chốt 2026-11-07 "như cái chuông Tâm Phật"): vòng rồng vàng (fx_chien_long.png, ảnh Gemini người dùng tạo)
  // từ dưới chân xoay tròn bay lên, nở to ôm ngang thắt lưng, bừng sáng một nhịp rồi mờ đi; vòng rồng mờ ở lại suốt 3 lượt là .sd-lg (engine LONG_HTML)
  // Kiểu vòng theo CL_MODE của engine ('rong' / 'khi' / 'ca'): mỗi vòng một ảnh, vòng khí quay ngược chiều, vòng ngoài to hơn
  ['game/img/fx_chien_long.png', 'game/img/fx_vong_khi.png'].forEach(s => { new Image().src = s; });
  K.chienlong = async c => {
    const feet = c.A.bottom - 4, waist = c.A.bottom - c.A.h * 0.4;
    const mode = typeof CL_MODE !== 'undefined' ? CL_MODE : 'rong';
    if (mode === 'quanh') { // vòng khí dựng đứng: từ giữa thân nở bung ra bao trọn người, vừa nở vừa xoay, bừng sáng rồi nhường chỗ vòng ở lại
      const mid = { x: c.A.x, y: c.A.bottom - c.A.h * 0.5 }, S = c.A.h * 1.25;
      const im = fxImg(c.arena, 'game/img/fx_vong_khi.png', mid.x, mid.y, S, 9); // z 9: sau nhân vật (z 10)
      glowPulse(c.a, c.color, 1200);
      particles(c.svg, mid, '#ffd86a', 14, S * 0.5, { size: 3 });
      await anim(im, [
        { transform: 'scale(.15) rotate(0deg)', opacity: 0, filter: 'brightness(1.4)' },
        { transform: 'scale(1.18) rotate(-240deg)', opacity: 1, filter: 'brightness(2.2)', offset: 0.65 },
        { transform: 'scale(1) rotate(-300deg)', opacity: 1, filter: 'brightness(1.4)' },
      ], 780, { easing: 'cubic-bezier(.2,.8,.3,1)' });
      shake(c.arena, 4);
      c.hit();
      await anim(im, [{ transform: 'scale(1) rotate(-300deg)', opacity: 1 }, { transform: 'scale(1) rotate(-340deg)', opacity: 0 }], 500, { remove: true });
      return;
    }
    const rings = mode === 'khi' ? [['game/img/fx_vong_khi.png', 1.65, -1]] : mode === 'ca' ? [['game/img/fx_chien_long.png', 1.65, 1], ['game/img/fx_vong_khi.png', 2, -1]] : [['game/img/fx_chien_long.png', 1.65, 1]];
    const tf = (dy, s, r) => `translateY(${dy}px) scale(${s}) scaleY(.3) rotate(${r}deg)`;
    glowPulse(c.a, c.color, 1200);
    particles(c.svg, { x: c.A.x, y: feet }, '#ffd86a', 12, c.A.w * 0.6, { up: true, size: 3 });
    const ims = rings.map(([src, k]) => fxImg(c.arena, src, c.A.x, waist, c.A.w * k));
    await Promise.all(ims.map((im, i) => anim(im, [
      { transform: tf(feet - waist, 0.35, 0), opacity: 0, filter: 'brightness(1.2)' },
      { transform: tf((feet - waist) * 0.5, 0.7, -200 * rings[i][2]), opacity: 1, filter: 'brightness(1.6)', offset: 0.4 },
      { transform: tf(0, 1.08, -420 * rings[i][2]), opacity: 1, filter: 'brightness(2)' },
    ], 820, { easing: 'cubic-bezier(.3,0,.4,1)', delay: i * 120 })));
    shake(c.arena, 4);
    ring(c.svg, { x: c.A.x, y: waist }, c.color, c.A.w * 0.75, { width: 4, dur: 520 });
    c.hit();
    await Promise.all(ims.map((im, i) => anim(im, [{ transform: tf(0, 1.08, -420 * rings[i][2]), opacity: 1, filter: 'brightness(2)' }, { transform: tf(0, 1, -480 * rings[i][2]), opacity: 0, filter: 'brightness(1)' }], 600, { remove: true })));
  };

  // Đại Lực Kim Cương Chưởng: một chưởng vàng góc cạnh như kim cương (ảnh Gemini người dùng tạo) bay chậm mà nặng;
  // chạm thì vòng sóng bung ra, sân rung mạnh, địch bị đẩy lùi xa
  K.dailuc = async c => {
    lunge(c.a, c.dir, 34, 420);
    const k = Math.max(0.8, Math.min(1.6, c.Tp.h / 100)) * c.size * 2;
    const p0 = { x: c.A.x + c.dir * c.A.w * 0.3, y: c.Tp.y }, p1 = { x: c.Tp.x - c.dir * c.Tp.w * 0.1, y: c.Tp.y };
    await fistImg(c.arena, p0, p1, c.dir, k, c.color, 560, DAILUC_IMG);
    ring(c.svg, p1, c.color, 44 * c.size, { width: 6, dur: 420 });
    ring(c.svg, p1, '#fff2c0', 70 * c.size, { width: 3, dur: 520, delay: 60 });
    shake(c.arena, 9);
    lunge(c.t, c.dir, 44, 560); // đẩy lùi xa
    c.hit();
    await wait(380);
  };

  // La Hán Quyền: ba nắm đấm lửa đồng đỏ (ảnh Gemini người dùng tạo) bay liền nhau, khớp 3 đòn 20% / 30% / 50% của chiêu;
  // mỗi cú chạm hiện số của đúng đòn đó (c.part), cú cuối to nhất đẩy địch lùi lại
  K.lahan = async c => {
    lunge(c.a, c.dir, 30, 300);
    const k = Math.max(0.8, Math.min(1.6, c.Tp.h / 100)) * c.size * 1.25;
    const p0 = { x: c.A.x + c.dir * c.A.w * 0.3, y: c.Tp.y }, end = { x: c.Tp.x - c.dir * c.Tp.w * 0.08, y: c.Tp.y };
    const shots = [{ s: 0.62, dy: -c.Tp.h * 0.12, dur: 300 }, { s: 0.72, dy: c.Tp.h * 0.12, dur: 300 }, { s: 1, dy: 0, dur: 420 }];
    const flights = shots.map((s, i) => wait(i * 180).then(() => {
      const last = i === shots.length - 1;
      return fistImg(c.arena, { x: p0.x, y: p0.y + s.dy }, { x: end.x, y: end.y + s.dy * 0.4 }, c.dir, k * s.s, c.color, s.dur, LAHAN_IMG).then(() => {
        const p = { x: end.x, y: end.y + s.dy * 0.4 };
        if (last) {
          burstStar(c.svg, p, c.color, 40 * c.size);
          ring(c.svg, p, c.color, 36 * c.size, { width: 5, dur: 380 });
          lunge(c.t, c.dir, 26, 420); // đẩy lùi
          c.hit();
        } else {
          ring(c.svg, p, c.color, 18, { width: 3, dur: 260 });
          lunge(c.t, c.dir, 8, 200);
          c.part(); // hiện số của đòn 1, đòn 2 đúng lúc nắm đấm chạm
        }
      });
    }));
    await Promise.all(flights);
    await wait(320);
  };

  // Tầng 1: một quyền thẳng, gọn và hiểm. Không hoa mỹ, chỉ một điểm chạm.
  K.vdq1 = async c => {
    lunge(c.a, c.dir, 36, 320);
    speedLines(c.svg, c.A, c.Tp, c.color, 4);
    const p0 = { x: c.A.x + c.dir * c.A.w * 0.3, y: c.Tp.y }, p1 = { x: c.Tp.x - c.dir * c.Tp.w * 0.12, y: c.Tp.y };
    // c.size: cỡ theo mốc tầng (Vô Danh Quyền: 1 / 1,3 / 1,6)
    const k = Math.max(0.8, Math.min(1.6, c.Tp.h / 100)) * c.size;
    await fistImg(c.arena, p0, p1, c.dir, k, c.color, 480);
    burstStar(c.svg, p1, c.color, 34 * c.size);
    ring(c.svg, p1, c.color, 30 * c.size, { width: 4 * c.size, dur: 360 });
    particles(c.svg, { x: p1.x, y: p1.y + 10 }, '#c8b48a', 6, 34, { glow: false, size: 4 });
    c.hit();
    await wait(380);
  };

  // Tầng 5 · Điểm Huyệt: ba cú điểm liên tiếp vào ba huyệt, đường kinh mạch sáng lên rồi khí nổ ra
  K.vdq5 = async c => {
    lunge(c.a, c.dir, 30, 300);
    const T0 = c.Tp, pts = [
      { x: T0.x - c.dir * T0.w * 0.08, y: T0.y - T0.h * 0.16 },
      { x: T0.x + c.dir * T0.w * 0.1, y: T0.y + T0.h * 0.02 },
      { x: T0.x - c.dir * T0.w * 0.04, y: T0.y + T0.h * 0.2 },
    ];
    const dots = [], k = Math.max(0.8, Math.min(1.6, T0.h / 100));
    for (let i = 0; i < 3; i++) {
      const p0 = { x: c.A.x + c.dir * c.A.w * 0.3, y: c.A.y + (i - 1) * 14 };
      speedLines(c.svg, c.A, { ...T0, y: pts[i].y }, c.color, 2, { dur: 200 });
      await fistFly(c.svg, p0, pts[i], c.dir, 0.6 * k, 0.85 * k, c.color, 150, { alpha: 0.9 });
      if (i < 2) lunge(c.a, c.dir, 20, 200);
      // huyệt sáng lên: quầng đỏ, nhân đỏ, tâm trắng
      [[12, '#ff5a4a', 0.35], [7, '#ff5a4a', 1], [3, '#ffffff', 1]].forEach(([r, fill, op]) => {
        const d = mk(c.svg, 'circle', { cx: pts[i].x, cy: pts[i].y, r: r * k, fill, opacity: op, filter: 'url(#fxGlow)' });
        anim(d, [{ transform: 'scale(2.2)', opacity: 0 }, { transform: 'scale(1)', opacity: op }], 160);
        dots.push([d, op]);
      });
      ring(c.svg, pts[i], '#ff5a4a', 22 * k, { width: 3, dur: 320 });
      if (i === 0) c.hit();
    }
    // Đường kinh mạch nối ba huyệt
    const d = `M${pts[0].x} ${pts[0].y} Q ${pts[1].x + c.dir * 18} ${(pts[0].y + pts[1].y) / 2} ${pts[1].x} ${pts[1].y} T ${pts[2].x} ${pts[2].y}`;
    const L = T0.h;
    const line = mk(c.svg, 'path', { d, fill: 'none', stroke: c.color, 'stroke-width': 4.5, 'stroke-linecap': 'round', 'stroke-dasharray': L, 'stroke-dashoffset': L, filter: 'url(#fxGlow)' });
    await anim(line, [{ strokeDashoffset: L }, { strokeDashoffset: 0 }], 220, { easing: 'ease-in' });
    pts.forEach((p, i) => { spikes(c.svg, p, i === 1 ? '#ff5a4a' : c.color, 8, 6, 30, { width: 2.5, delay: i * 50 }); });
    ring(c.svg, pts[1], c.color, 56, { width: 5, delay: 60 });
    shake(c.arena, 5);
    anim(line, [{ opacity: 1 }, { opacity: 0 }], 260, { delay: 120, remove: true });
    dots.forEach(([d, op]) => anim(d, [{ transform: 'scale(1)', opacity: op }, { transform: 'scale(1.8)', opacity: 0 }], 300, { delay: 80, remove: true }));
    particles(c.svg, pts[1], c.color, 10, 50, { size: 3.5, delay: 60 });
    await wait(420);
  };

  // Tầng 10 · Đại Thành: tụ khí, một quyền ảnh khổng lồ lao tới, ba vòng sóng chấn động
  K.vdq10 = async c => {
    glowPulse(c.a, c.color, 1100);
    const base = { x: c.A.x, y: c.A.bottom - 8 };
    const e = mk(c.svg, 'ellipse', { cx: base.x, cy: base.y, rx: c.A.w * 0.6, ry: 11, fill: 'none', stroke: c.color, 'stroke-width': 3, filter: 'url(#fxGlow)' });
    anim(e, [{ transform: 'scale(1.6)', opacity: 0 }, { transform: 'scale(1)', opacity: 1, offset: 0.5 }, { transform: 'scale(.8)', opacity: 0 }], 520, { remove: true });
    particles(c.svg, { x: c.A.x, y: c.A.bottom - 10 }, c.color, 14, 60, { up: true, spreadX: c.A.w * 0.4, size: 3.5, dur: 620 });
    await wait(380);
    lunge(c.a, c.dir, 44, 420);
    speedLines(c.svg, c.A, c.Tp, c.color, 7, { width: 3, dur: 320 });
    const size = Math.max(1.4, Math.min(3.2, c.Tp.h / 40));
    const p0 = { x: c.A.x + c.dir * c.A.w * 0.2, y: c.Tp.y }, p1 = { x: c.Tp.x - c.dir * c.Tp.w * 0.05, y: c.Tp.y };
    // bóng mờ đuổi theo quyền ảnh
    fistFly(c.svg, p0, p1, c.dir, size * 0.5, size * 0.9, c.color, 300, { alpha: 0.25, delay: 70 });
    fistFly(c.svg, p0, p1, c.dir, size * 0.5, size * 0.95, c.color, 300, { alpha: 0.45, delay: 35 });
    await fistFly(c.svg, p0, p1, c.dir, size * 0.55, size, c.color, 300, { alpha: 0.95 });
    flash(c.arena, '#fff3c4', 0.6, 360);
    shake(c.arena, 14);
    burstStar(c.svg, p1, c.color, c.Tp.h * 0.55, { dur: 520 });
    [0, 110, 220].forEach((d, i) => ring(c.svg, p1, i === 1 ? '#ffffff' : c.color, c.Tp.h * (0.5 + i * 0.22), { width: 6 - i, delay: d, dur: 520 }));
    spikes(c.svg, p1, c.color, 16, 20, c.Tp.h * 0.7, { width: 4, dur: 460 });
    spikes(c.svg, p1, '#2a1a10', 10, 16, c.Tp.h * 0.55, { width: 5, dur: 420, delay: 40 });
    particles(c.svg, p1, c.color, 22, 90, { size: 5, dur: 700 });
    c.hit(true);
    // dấu quyền in lại trên người đối thủ rồi tan
    const mark = fist(c.svg, c.color, { alpha: 0.5 });
    anim(mark, [
      { transform: `translate(${p1.x}px, ${p1.y}px) scale(${c.dir * size * 0.7}, ${size * 0.7})`, opacity: 0.6 },
      { transform: `translate(${p1.x}px, ${p1.y}px) scale(${c.dir * size * 0.75}, ${size * 0.75})`, opacity: 0 },
    ], 700, { delay: 120, remove: true });
    await wait(720);
  };

  K.kiem = async c => {
    lunge(c.a, c.dir, 34, 300);
    await wait(110);
    const n = Math.max(1, c.hits), angles = [-38, 32, -8, 58, -62];
    for (let i = 0; i < n; i++) {
      slash(c.svg, c.Tp, angles[i % angles.length], c.Tp.h * 1.05, c.color, { delay: i * 120, ox: rnd(-8, 8) });
      particles(c.svg, c.Tp, c.color, 5, 34, { delay: i * 120 + 120, size: 3 });
    }
    await wait(150);
    c.hit();
    await wait(120 * (n - 1) + 320);
  };

  /* ---------- Kiếm pháp Nga Mi: nội thương (vệt tím thấm vào người đối thủ) ---------- */
  // Vệt nội thương: một đốm tím mờ loang ra từ chỗ kiếm chạm rồi chìm dần vào người
  function bruise(svg, p, r, o = {}) {
    const col = o.color || '#7c3aed';
    const g = mk(svg, 'g', { filter: 'url(#fxGlow)' });
    mk(g, 'ellipse', { cx: p.x, cy: p.y, rx: r * 1.6, ry: r * 1.1, fill: col, opacity: 0.55 });
    mk(g, 'ellipse', { cx: p.x + rnd(-r * 0.3, r * 0.3), cy: p.y, rx: r * 0.8, ry: r * 0.5, fill: '#4c1d95', opacity: 0.85 });
    for (let i = 0; i < 4; i++) {
      const a = rnd(0, Math.PI * 2);
      mk(g, 'path', { d: `M${p.x} ${p.y} q ${Math.cos(a) * r} ${Math.sin(a) * r * 0.6} ${Math.cos(a) * r * 2} ${Math.sin(a) * r * 1.3}`, fill: 'none', stroke: '#a78bfa', 'stroke-width': 2, 'stroke-linecap': 'round', opacity: 0.9 });
    }
    return anim(g, [{ transform: 'scale(.2)', opacity: 0 }, { transform: 'scale(1)', opacity: 1, offset: 0.3 }, { transform: 'scale(1.15)', opacity: 0.8, offset: 0.7 }, { transform: 'scale(.6)', opacity: 0 }], o.dur || 820, { delay: o.delay, remove: true });
  }
  // Diệt Tuyệt Kiếm Pháp: ba (tầng 10: bốn) đường kiếm trắng bạc sắc lạnh chém chéo, mỗi đường để lại vệt nội thương;
  // có từ bốn nhát trở lên thì nhát cuối là một đường chém dọc lớn từ trên xuống
  K.diet_tuyet = async c => {
    glowPulse(c.a, c.color, 600);
    lunge(c.a, c.dir, 36, 300);
    await wait(100);
    const n = Math.max(1, c.hits), k = Math.max(0.8, Math.min(1.6, c.Tp.h / 100));
    const cross = n >= 4 ? n - 1 : n, angles = [-35, 35, -12];
    for (let i = 0; i < cross; i++) {
      const oy = c.Tp.h * (i - (cross - 1) / 2) * 0.14;
      slash(c.svg, c.Tp, c.dir * angles[i % angles.length], c.Tp.h * 1.15, c.color, { delay: i * 120, oy, width: 5 });
      bruise(c.svg, { x: c.Tp.x + rnd(-10, 10), y: c.Tp.y + oy }, 9 * k, { delay: i * 120 + 130 });
      particles(c.svg, { x: c.Tp.x, y: c.Tp.y + oy }, '#ffffff', 4, 28, { delay: i * 120 + 120, size: 2.5 });
    }
    await wait(140);
    c.hit();
    if (n >= 4) {
      await wait(120 * (cross - 1) + 120);
      const top = { x: c.Tp.x, y: c.Tp.top + 4 }, bot = { x: c.Tp.x, y: c.Tp.bottom - 4 }, L = (bot.y - top.y) * 1.2;
      const gl = mk(c.svg, 'g', { filter: 'url(#fxGlow)' });
      const d = `M${top.x + 6} ${top.y} Q ${top.x - 10} ${(top.y + bot.y) / 2} ${bot.x + 4} ${bot.y}`;
      [[c.color, 11], ['#ffffff', 3.5]].forEach(([stroke, w]) => {
        const e = mk(gl, 'path', { d, fill: 'none', stroke, 'stroke-width': w, 'stroke-linecap': 'round', 'stroke-dasharray': L, 'stroke-dashoffset': L });
        anim(e, [{ strokeDashoffset: L }, { strokeDashoffset: 0 }], 180, { easing: 'ease-in' });
      });
      await wait(180);
      flash(c.arena, '#efeaff', 0.45, 280);
      shake(c.arena, 8);
      bruise(c.svg, c.Tp, 16 * k, { dur: 1000 });
      spikes(c.svg, c.Tp, c.color, 12, 14, c.Tp.h * 0.5, { width: 3 });
      anim(gl, [{ opacity: 1 }, { opacity: 0 }], 320, { delay: 100, remove: true });
      await wait(520);
    } else await wait(120 * (n - 1) + 420);
  };
  // Thất Sát Kiếm Pháp: bảy vì sao hiện thành vòng quanh đối thủ, lần lượt lao vào thành bảy nhát chém từ bảy hướng;
  // các nhát chém thêm (tầng 10) là sao tím đậm hơn
  K.that_sat = async c => {
    glowPulse(c.a, c.color, 800);
    const n = Math.max(1, c.hits), base = Math.min(7, n), k = Math.max(0.8, Math.min(1.6, c.Tp.h / 100));
    const R = c.Tp.h * 0.62, stars = [];
    for (let i = 0; i < n; i++) {
      const a = -Math.PI / 2 + (i / n) * Math.PI * 2, p = { x: c.Tp.x + Math.cos(a) * R * 0.85, y: c.Tp.y + Math.sin(a) * R };
      const col = i < base ? c.color : '#6d28d9', r = (i < base ? 9 : 11) * k;
      const s = mk(c.svg, 'path', { d: `M${p.x} ${p.y - r} L${p.x + r * 0.22} ${p.y - r * 0.22} L${p.x + r} ${p.y} L${p.x + r * 0.22} ${p.y + r * 0.22} L${p.x} ${p.y + r} L${p.x - r * 0.22} ${p.y + r * 0.22} L${p.x - r} ${p.y} L${p.x - r * 0.22} ${p.y - r * 0.22} Z`, fill: '#ffffff', stroke: col, 'stroke-width': 2.5, filter: 'url(#fxGlow)', opacity: 0 });
      anim(s, [{ transform: 'scale(0) rotate(-45deg)', opacity: 0 }, { transform: 'scale(1) rotate(0deg)', opacity: 1 }], 200, { delay: i * 55 });
      stars.push({ s, a, col });
    }
    await wait(55 * n + 220);
    lunge(c.a, c.dir, 30, 280);
    for (let i = 0; i < n; i++) {
      const { s, a, col } = stars[i], d = i * 85;
      // sao lao vào giữa, để lại một nhát chém theo đúng hướng bay
      anim(s, [{ transform: 'translate(0px,0px) scale(1)', opacity: 1 }, { transform: `translate(${-Math.cos(a) * R * 0.85}px, ${-Math.sin(a) * R}px) scale(.4)`, opacity: 0.2 }], 140, { delay: d, easing: 'ease-in', remove: true });
      slash(c.svg, c.Tp, a * 180 / Math.PI + 90, c.Tp.h * 0.95, col, { delay: d + 110, width: i < base ? 4.5 : 6 });
      if (i % 2 === 0) bruise(c.svg, { x: c.Tp.x + rnd(-12, 12), y: c.Tp.y + rnd(-c.Tp.h * 0.2, c.Tp.h * 0.2) }, 8 * k, { delay: d + 150, dur: 700 });
      if (i === 0) setTimeout(() => c.hit(n > base), T(d + 140));
    }
    await wait(85 * (n - 1) + 300);
    if (n >= 7) {
      flash(c.arena, '#ede9fe', 0.4, 260);
      shake(c.arena, n > base ? 11 : 7);
      ring(c.svg, c.Tp, c.color, c.Tp.h * 0.55, { width: 4, dur: 460 });
      particles(c.svg, c.Tp, c.color, 14, 70, { size: 3.5, dur: 600 });
    }
    await wait(420);
  };

  /* ---------- Vô Danh Kiếm Pháp: hình đổi theo tầng (tiers[5].fx, tiers[10].fx trong data.js) ---------- */
  // Dấu "sơ hở": một vết nứt sáng như sứ rạn ở chỗ kiếm chạm, ánh vàng nhạt bên trong, nứt ra rồi khép lại
  function openMark(svg, p, r, o = {}) {
    const ang = rnd(-0.9, 0.9), ca = Math.cos(ang), sa = Math.sin(ang);
    const pt = (u, v) => `${(p.x + ca * u - sa * v).toFixed(1)} ${(p.y + sa * u + ca * v).toFixed(1)}`;
    // đường nứt chính gấp khúc, thêm hai nhánh nhỏ
    const len = r * 2.6, segs = 6;
    let d = `M${pt(-len / 2, 0)}`;
    for (let i = 1; i <= segs; i++) d += ` L${pt(-len / 2 + len * i / segs, i === segs ? 0 : rnd(-r * 0.35, r * 0.35))}`;
    const b1 = `M${pt(-len * 0.12, rnd(-r * 0.2, r * 0.2))} L${pt(-len * 0.02, -r * 0.7)} L${pt(len * 0.05, -r * 0.95)}`;
    const b2 = `M${pt(len * 0.18, rnd(-r * 0.2, r * 0.2))} L${pt(len * 0.26, r * 0.6)}`;
    const L = len * 1.4;
    const g = mk(svg, 'g', { filter: 'url(#fxGlow)' });
    const lines = [];
    [[d, '#ffe7a3', 4.5], [d, '#ffffff', 1.6], [b1, '#ffe7a3', 2.2], [b2, '#ffe7a3', 2.2]].forEach(([path, stroke, w]) => {
      const e = mk(g, 'path', { d: path, fill: 'none', stroke, 'stroke-width': w, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-dasharray': L, 'stroke-dashoffset': L });
      lines.push(anim(e, [{ strokeDashoffset: L }, { strokeDashoffset: 0 }], 140, { delay: o.delay, easing: 'ease-out' }));
    });
    // một chấm sáng nhỏ lóe ở giữa vết nứt
    const s = mk(g, 'circle', { cx: p.x, cy: p.y, r: r * 0.35, fill: '#fff8dc' });
    anim(s, [{ transform: 'scale(0)', opacity: 1 }, { transform: 'scale(1.6)', opacity: 0 }], 360, { delay: (o.delay || 0) + 80 });
    // giữ một lúc rồi khép lại (dẹt dần theo chiều ngang của vết nứt) và mờ đi
    return anim(g, [{ opacity: 1 }, { opacity: 1, offset: 0.6 }, { opacity: 0 }], o.dur || 900, { delay: (o.delay || 0) + 140, remove: true });
  }
  // Tầng 5 · Kiếm Phá Sơ Hở: ba vệt kiếm mảnh màu bạc; mỗi nhát để lại một dấu sơ hở đỏ trên người đối thủ
  K.vdk5 = async c => {
    lunge(c.a, c.dir, 34, 300);
    await wait(110);
    const n = Math.max(1, c.hits), angles = [-40, 30, -6, 60], k = Math.max(0.8, Math.min(1.6, c.Tp.h / 100));
    for (let i = 0; i < n; i++) {
      const ox = rnd(-c.Tp.w * 0.12, c.Tp.w * 0.12), oy = rnd(-c.Tp.h * 0.18, c.Tp.h * 0.18);
      slash(c.svg, c.Tp, angles[i % angles.length], c.Tp.h * 1.1, c.color, { delay: i * 130, ox, width: 5 });
      openMark(c.svg, { x: c.Tp.x + ox, y: c.Tp.y + oy }, 9 * k, { delay: i * 130 + 140 });
      particles(c.svg, { x: c.Tp.x + ox, y: c.Tp.y + oy }, '#ffe7a3', 4, 26, { delay: i * 130 + 140, size: 2.5 });
    }
    await wait(150);
    c.hit();
    await wait(130 * (n - 1) + 520);
  };
  // Tầng 10 · Vô Danh Tứ Kiếm: bốn vệt kiếm xòe như đôi cánh chim hồng, nhát cuối một đường kiếm lớn xé ngang khung
  K.vdk10 = async c => {
    glowPulse(c.a, c.color, 900);
    particles(c.svg, { x: c.A.x, y: c.A.bottom - 10 }, c.color, 10, 50, { up: true, spreadX: c.A.w * 0.35, size: 3, dur: 520 });
    await wait(260);
    lunge(c.a, c.dir, 40, 360);
    await wait(110);
    const n = Math.max(1, c.hits), k = Math.max(0.8, Math.min(1.6, c.Tp.h / 100));
    // các nhát đầu: xòe hai bên như hai cánh (trên trái, trên phải, dưới trái, dưới phải)
    const wing = [[-55, -0.16], [55, -0.16], [-25, 0.12], [25, 0.12]];
    for (let i = 0; i < n - 1; i++) {
      const [ang, dy] = wing[i % wing.length];
      slash(c.svg, c.Tp, c.dir * ang, c.Tp.h * 1.15, c.color, { delay: i * 110, oy: c.Tp.h * dy, width: 6 });
      openMark(c.svg, { x: c.Tp.x + rnd(-10, 10), y: c.Tp.y + c.Tp.h * dy }, 9 * k, { delay: i * 110 + 130, dur: 700 });
    }
    await wait(110 * Math.max(0, n - 1) + 80);
    c.hit();
    // nhát cuối: một đường kiếm lớn xé ngang cả khung
    const W = c.arena.getBoundingClientRect().width;
    const y = c.Tp.y, x0 = c.dir > 0 ? c.A.x : c.Tp.x + c.Tp.w * 0.6, x1 = c.dir > 0 ? Math.min(W - 6, c.Tp.x + c.Tp.w * 0.6) : c.A.x;
    const L = Math.abs(x1 - x0) * 1.1;
    const gl = mk(c.svg, 'g', { filter: 'url(#fxGlow)' });
    const outer = mk(gl, 'path', { d: `M${x0} ${y + 6} Q ${(x0 + x1) / 2} ${y - 14} ${x1} ${y - 4}`, fill: 'none', stroke: c.color, 'stroke-width': 12, 'stroke-linecap': 'round', 'stroke-dasharray': L, 'stroke-dashoffset': L });
    const core = mk(gl, 'path', { d: `M${x0} ${y + 6} Q ${(x0 + x1) / 2} ${y - 14} ${x1} ${y - 4}`, fill: 'none', stroke: '#ffffff', 'stroke-width': 4, 'stroke-linecap': 'round', 'stroke-dasharray': L, 'stroke-dashoffset': L });
    anim(outer, [{ strokeDashoffset: L }, { strokeDashoffset: 0 }], 200, { easing: 'ease-in' });
    await anim(core, [{ strokeDashoffset: L }, { strokeDashoffset: 0 }], 200, { easing: 'ease-in' });
    flash(c.arena, '#ffffff', 0.55, 300);
    shake(c.arena, 12);
    burstStar(c.svg, c.Tp, c.color, c.Tp.h * 0.5, { dur: 500 });
    ring(c.svg, c.Tp, '#fff3c4', c.Tp.h * 0.6, { width: 4, dur: 480 });
    spikes(c.svg, c.Tp, c.color, 14, 16, c.Tp.h * 0.65, { width: 3.5, dur: 440 });
    particles(c.svg, c.Tp, c.color, 18, 80, { size: 4, dur: 640 });
    anim(gl, [{ opacity: 1 }, { opacity: 0 }], 360, { delay: 120, remove: true });
    await wait(620);
  };

  /* ---------- Vô Danh Kiếm Ý: huyệt đạo phát sáng (tiers[5].fx, tiers[10].fx trong data.js) ---------- */
  // Huyệt đạo: chấm xanh ngọc, tâm trắng, một vòng nét đứt mảnh xoay quanh; hiện lên rồi giữ tới khi vỡ
  function acuPoint(svg, p, r, o = {}) {
    const col = o.color || '#ffd24a';
    const g = mk(svg, 'g', { filter: 'url(#fxGlow)' });
    mk(g, 'circle', { cx: p.x, cy: p.y, r: r * 1.6, fill: col, opacity: 0.25 });
    mk(g, 'circle', { cx: p.x, cy: p.y, r, fill: col });
    mk(g, 'circle', { cx: p.x, cy: p.y, r: r * 0.4, fill: '#ffffff' });
    const ringEl = mk(g, 'circle', { cx: p.x, cy: p.y, r: r * 2.4, fill: 'none', stroke: '#fffaf0', 'stroke-width': 1.6, 'stroke-dasharray': `${r * 1.2} ${r * 0.9}` });
    anim(ringEl, [{ transform: 'rotate(0deg)' }, { transform: 'rotate(240deg)' }], o.hold || 900, { delay: o.delay, easing: 'linear' });
    anim(g, [{ transform: 'scale(2.2)', opacity: 0 }, { transform: 'scale(1)', opacity: 1 }], 180, { delay: o.delay });
    return g;
  }
  // Huyệt vỡ: phóng to, tỏa tia rồi biến mất
  function acuBurst(svg, g, p, r, o = {}) {
    spikes(svg, p, o.color || '#ffd24a', 8, r, r * 4, { width: 2.5, delay: o.delay, dur: 320 });
    return anim(g, [{ transform: 'scale(1)', opacity: 1 }, { transform: 'scale(2)', opacity: 0 }], 260, { delay: o.delay, remove: true });
  }
  // Đường kinh mạch nối các huyệt (vẽ dần)
  function meridian(svg, pts, color, o = {}) {
    const d = 'M' + pts.map(q => `${q.x} ${q.y}`).join(' L');
    let L = 0;
    for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
    const e = mk(svg, 'path', { d, fill: 'none', stroke: color, 'stroke-width': o.width || 3, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-dasharray': L, 'stroke-dashoffset': L, filter: 'url(#fxGlow)' });
    anim(e, [{ strokeDashoffset: L }, { strokeDashoffset: 0 }], o.dur || 260, { delay: o.delay, easing: 'ease-in' });
    return e;
  }
  // Huyệt đạo của Vô Danh Kiếm Ý: vàng và trắng, xếp dọc giữa người đối thủ từ đỉnh đầu xuống đan điền
  const VDKY_GOLD = '#ffd24a', VDKY_WHITE = '#fffaf0';
  const vdkyLine = (T0, n, y0, y1) => Array.from({ length: n }, (_, i) => ({ x: T0.x, y: T0.top + T0.h * (y0 + (y1 - y0) * (n === 1 ? 0.5 : i / (n - 1))) }));
  // Tầng 5 · Kiếm Ý Vô Hình: hai đường kiếm chéo lướt qua, ba huyệt dọc giữa người sáng lên, kinh mạch chạy thẳng xuống rồi cùng vỡ
  K.vdky5 = async c => {
    lunge(c.a, c.dir, 40, 300);
    speedLines(c.svg, c.A, c.Tp, VDKY_WHITE, 5, { width: 1.5, dur: 220 });
    await wait(110);
    const T0 = c.Tp, k = Math.max(0.8, Math.min(1.6, T0.h / 100)), r = 5 * k;
    slash(c.svg, T0, c.dir * -55, T0.h * 1.15, VDKY_GOLD, { width: 5 });
    slash(c.svg, T0, c.dir * 55, T0.h * 1.15, VDKY_WHITE, { width: 4, delay: 120 });
    const pts = vdkyLine(T0, 3, 0.22, 0.62);
    const gs = pts.map((p, i) => acuPoint(c.svg, p, r, { delay: 200 + i * 110, hold: 900, color: VDKY_GOLD }));
    await wait(200 + 3 * 110 + 40);
    c.hit();
    const line = meridian(c.svg, [{ x: T0.x, y: pts[0].y - r * 2 }, ...pts, { x: T0.x, y: pts[2].y + r * 2 }], VDKY_GOLD, { width: 3, dur: 220 });
    await wait(250);
    gs.forEach((g, i) => acuBurst(c.svg, g, pts[i], r, { delay: i * 40, color: VDKY_GOLD }));
    ring(c.svg, pts[1], VDKY_WHITE, 40 * k, { width: 3 });
    anim(line, [{ opacity: 1 }, { opacity: 0 }], 260, { delay: 80, remove: true });
    particles(c.svg, pts[1], VDKY_GOLD, 10, 44, { size: 3 });
    await wait(360);
  };
  // Tầng 10 · Vô Danh Đại Thành: tụ kiếm ý; bốn đường kiếm chéo đan nhau, bảy huyệt dọc giữa người (đỉnh đầu → đan điền)
  // lần lượt sáng, kinh mạch chạy thẳng xuống, rồi một đường kiếm lớn chém dọc từ đầu tới chân qua cả bảy huyệt
  K.vdky10 = async c => {
    glowPulse(c.a, VDKY_GOLD, 1000);
    particles(c.svg, { x: c.A.x, y: c.A.bottom - 10 }, VDKY_GOLD, 12, 56, { up: true, spreadX: c.A.w * 0.4, size: 3, dur: 600 });
    await wait(300);
    lunge(c.a, c.dir, 40, 380);
    await wait(100);
    const T0 = c.Tp, k = Math.max(0.8, Math.min(1.6, T0.h / 100)), r = 4.5 * k;
    [[-60, VDKY_GOLD], [60, VDKY_WHITE], [-30, VDKY_WHITE], [30, VDKY_GOLD]].forEach(([a, col], i) =>
      slash(c.svg, T0, c.dir * a, T0.h * 1.2, col, { delay: i * 100, width: 5 }));
    const pts = vdkyLine(T0, 7, 0.14, 0.7);
    const gs = pts.map((p, i) => acuPoint(c.svg, p, r, { delay: 260 + i * 70, hold: 1500, color: VDKY_GOLD }));
    await wait(260 + 7 * 70 + 40);
    const line = meridian(c.svg, [{ x: T0.x, y: pts[0].y - r * 2 }, ...pts, { x: T0.x, y: pts[6].y + r * 2 }], VDKY_GOLD, { width: 3, dur: 360 });
    await wait(400);
    // đường kiếm lớn chém dọc từ trên đỉnh đầu xuống dưới chân, đi qua cả bảy huyệt
    const top = { x: T0.x, y: T0.top - 14 }, bot = { x: T0.x, y: T0.bottom + 14 };
    const L = (bot.y - top.y) * 1.1;
    const gl = mk(c.svg, 'g', { filter: 'url(#fxGlow)' });
    const dPath = `M${top.x} ${top.y} Q ${T0.x + c.dir * 10} ${T0.y} ${bot.x} ${bot.y}`;
    const outer = mk(gl, 'path', { d: dPath, fill: 'none', stroke: VDKY_GOLD, 'stroke-width': 12, 'stroke-linecap': 'round', 'stroke-dasharray': L, 'stroke-dashoffset': L });
    const core = mk(gl, 'path', { d: dPath, fill: 'none', stroke: VDKY_WHITE, 'stroke-width': 4, 'stroke-linecap': 'round', 'stroke-dasharray': L, 'stroke-dashoffset': L });
    anim(outer, [{ strokeDashoffset: L }, { strokeDashoffset: 0 }], 180, { easing: 'ease-in' });
    await anim(core, [{ strokeDashoffset: L }, { strokeDashoffset: 0 }], 180, { easing: 'ease-in' });
    flash(c.arena, '#fff6d8', 0.6, 320);
    shake(c.arena, 13);
    c.hit(true);
    gs.forEach((g, i) => acuBurst(c.svg, g, pts[i], r, { delay: i * 35, color: VDKY_GOLD }));
    ring(c.svg, T0, VDKY_GOLD, T0.h * 0.55, { width: 5, dur: 500 });
    ring(c.svg, T0, VDKY_WHITE, T0.h * 0.75, { width: 3, delay: 90, dur: 520 });
    particles(c.svg, T0, VDKY_GOLD, 20, 86, { size: 4, dur: 680 });
    anim(line, [{ opacity: 1 }, { opacity: 0 }], 280, { delay: 60, remove: true });
    anim(gl, [{ opacity: 1 }, { opacity: 0 }], 380, { delay: 140, remove: true });
    await wait(700);
  };
  K.con = async c => {
    lunge(c.a, c.dir, 26, 520);
    await wait(100);
    const R = c.Tp.h * 0.42;
    for (let i = 0; i < 3; i++) {
      const a0 = (-150 + i * 70) * Math.PI / 180, a1 = a0 + 2.2;
      const p0 = { x: c.Tp.x + Math.cos(a0) * R, y: c.Tp.y + Math.sin(a0) * R }, p1 = { x: c.Tp.x + Math.cos(a1) * R, y: c.Tp.y + Math.sin(a1) * R };
      const d = `M${p0.x} ${p0.y} A ${R} ${R} 0 0 1 ${p1.x} ${p1.y}`, L = R * 2.4;
      const g = mk(c.svg, 'g', { filter: 'url(#fxGlow)' });
      const arc = mk(g, 'path', { d, fill: 'none', stroke: c.color, 'stroke-width': 8, 'stroke-linecap': 'round', 'stroke-dasharray': L, 'stroke-dashoffset': L });
      anim(arc, [{ strokeDashoffset: L }, { strokeDashoffset: 0 }], 130, { delay: i * 120, easing: 'ease-in' });
      anim(g, [{ opacity: 1 }, { opacity: 0 }], 240, { delay: i * 120 + 140, remove: true });
      ring(c.svg, c.Tp, c.color, 30, { delay: i * 120 + 120, width: 3, dur: 300 });
    }
    await wait(140);
    c.hit();
    await wait(440);
  };

  K.chuong = async c => {
    lunge(c.a, c.dir, 20, 420);
    await wait(120);
    await orb(c.svg, c.A, c.Tp, c.color, 16, 360);
    ring(c.svg, c.Tp, c.color, 72, { width: 6 });
    ring(c.svg, c.Tp, '#ffffff', 44, { width: 3, delay: 70 });
    spikes(c.svg, c.Tp, c.color, 12, 18, 60);
    c.hit(true);
    await wait(420);
  };

  K.doc = async c => {
    lunge(c.a, c.dir, 18);
    await wait(100);
    await orb(c.svg, c.A, c.Tp, c.color, 11, 340, { arc: 30 });
    for (let i = 0; i < 8; i++) {
      const puff = mk(c.svg, 'circle', { cx: c.Tp.x + rnd(-c.Tp.w * 0.3, c.Tp.w * 0.3), cy: c.Tp.y + rnd(-10, 20), r: rnd(8, 15), fill: i % 2 ? c.color : '#3f8f2a', opacity: 0.7 });
      anim(puff, [{ transform: 'translate(0,0) scale(.4)', opacity: 0.8 }, { transform: `translate(${rnd(-12, 12)}px, ${-rnd(30, 60)}px) scale(1.6)`, opacity: 0 }], 900, { delay: i * 60, remove: true });
    }
    c.hit();
    await wait(650);
  };

  K.hoi = async c => {
    glowPulse(c.a, c.color, 900);
    const base = { x: c.A.x, y: c.A.bottom - 8 };
    const e = mk(c.svg, 'ellipse', { cx: base.x, cy: base.y, rx: c.A.w * 0.55, ry: 10, fill: 'none', stroke: c.color, 'stroke-width': 3, filter: 'url(#fxGlow)' });
    anim(e, [{ transform: 'scale(.2)', opacity: 1 }, { transform: 'scale(1.1)', opacity: 0 }], 700, { remove: true });
    particles(c.svg, base, c.color, 18, c.A.h * 0.9, { up: true, spreadX: c.A.w * 0.4, dur: 900, stagger: 300, size: 4 });
    await wait(300);
    c.hit();
    await wait(600);
  };

  K.ho = async c => {
    const g = mk(c.svg, 'g', { filter: 'url(#fxGlow)' });
    const rx = c.A.w * 0.62, ry = c.A.h * 0.6;
    mk(g, 'ellipse', { cx: c.A.x, cy: c.A.y, rx, ry, fill: c.color, 'fill-opacity': 0.14, stroke: c.color, 'stroke-width': 3 });
    for (let i = -1; i <= 1; i++) mk(g, 'ellipse', { cx: c.A.x, cy: c.A.y, rx: rx * (0.35 + Math.abs(i) * 0.3), ry, fill: 'none', stroke: c.color, 'stroke-width': 1.2, opacity: 0.6 });
    await anim(g, [{ transform: 'scale(.55)', opacity: 0 }, { transform: 'scale(1.06)', opacity: 1, offset: 0.35 }, { transform: 'scale(1)', opacity: 1, offset: 0.75 }, { transform: 'scale(1)', opacity: 0 }], 1000, { remove: true, easing: 'ease-out' });
    c.hit();
  };

  K.kim_chung = async c => {
    const g = mk(c.svg, 'g', { class: 'fx-free', filter: 'url(#fxGlow)' });
    const h = c.A.h * 0.8, w = c.A.w * 0.62;
    const bell = `M${-w * 0.42} ${-h * 0.32} Q ${-w * 0.45} ${-h * 0.62} 0 ${-h * 0.62} Q ${w * 0.45} ${-h * 0.62} ${w * 0.42} ${-h * 0.32} L ${w * 0.5} ${h * 0.32} Q ${w * 0.62} ${h * 0.4} ${w * 0.64} ${h * 0.46} L ${-w * 0.64} ${h * 0.46} Q ${-w * 0.62} ${h * 0.4} ${-w * 0.5} ${h * 0.32} Z`;
    mk(g, 'path', { d: bell, fill: c.color, 'fill-opacity': 0.22, stroke: c.color, 'stroke-width': 3 });
    mk(g, 'line', { x1: -w * 0.5, y1: h * 0.2, x2: w * 0.5, y2: h * 0.2, stroke: c.color, 'stroke-width': 2, opacity: 0.8 });
    mk(g, 'rect', { x: -8, y: -h * 0.74, width: 16, height: h * 0.13, rx: 4, fill: c.color });
    await anim(g, [{ transform: move(c.A.x, c.A.y - 90), opacity: 0 }, { transform: move(c.A.x, c.A.y), opacity: 1, offset: 0.4 }, { transform: move(c.A.x, c.A.y), opacity: 1, offset: 0.8 }, { transform: move(c.A.x, c.A.y), opacity: 0 }], 1100, { remove: false, easing: 'ease-in' }).then(() => g.remove());
    c.hit();
  };
  // Tiếng chuông "boong" khi chuông chạm đất
  const kimChungRings = c => { ring(c.svg, { x: c.A.x, y: c.A.bottom - 10 }, c.color, c.A.w * 0.8, { width: 3, delay: 420 }); ring(c.svg, { x: c.A.x, y: c.A.bottom - 10 }, '#ffffff', c.A.w * 0.6, { width: 2, delay: 520 }); };

  K.luc = async c => {
    glowPulse(c.a, c.color, 900);
    for (let i = 0; i < 14; i++) {
      const x = c.A.x + rnd(-c.A.w * 0.4, c.A.w * 0.4), y = c.A.bottom - rnd(4, 20);
      const f = mk(c.svg, 'ellipse', { cx: x, cy: y, rx: rnd(4, 7), ry: rnd(10, 16), fill: i % 3 ? c.color : '#ffd34d', filter: 'url(#fxGlow)' });
      anim(f, [{ transform: 'translate(0,0) scale(.5)', opacity: 0.95 }, { transform: `translate(${rnd(-6, 6)}px, ${-rnd(40, c.A.h * 0.7)}px) scale(.2)`, opacity: 0 }], 800, { delay: rnd(0, 350), remove: true });
    }
    await wait(350);
    c.hit();
    await wait(450);
  };

  K.ne = async c => {
    if (c.a.animate) {
      c.a.animate([
        { transform: 'translate(0,0)', opacity: 1 },
        { transform: 'translate(-16px,0)', opacity: 0.35, offset: 0.2 },
        { transform: 'translate(14px,0)', opacity: 0.35, offset: 0.45 },
        { transform: 'translate(-8px,0)', opacity: 0.6, offset: 0.7 },
        { transform: 'translate(0,0)', opacity: 1 },
      ], { duration: T(700) });
    }
    for (let i = 0; i < 6; i++) {
      const y = c.A.top + rnd(c.A.h * 0.15, c.A.h * 0.85), x = c.A.x + rnd(-c.A.w * 0.5, c.A.w * 0.2);
      const l = mk(c.svg, 'line', { x1: x, y1: y, x2: x + rnd(30, 60), y2: y, stroke: c.color, 'stroke-width': 2, 'stroke-linecap': 'round', filter: 'url(#fxGlow)' });
      anim(l, [{ transform: 'translateX(-20px)', opacity: 0 }, { transform: 'translateX(0)', opacity: 1, offset: 0.4 }, { transform: 'translateX(40px)', opacity: 0 }], 520, { delay: i * 70, remove: true });
    }
    await wait(300);
    c.hit();
    await wait(400);
  };

  K.choang = async c => {
    c.hit();
    const cx = c.Tp.x, cy = c.Tp.top + 8, rx = c.Tp.w * 0.32, ry = 9;
    const star = (x, y, r) => { let d = ''; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; d += (i ? 'L' : 'M') + (x + Math.cos(a) * rr) + ' ' + (y + Math.sin(a) * rr); } return d + 'Z'; };
    for (let k = 0; k < 3; k++) {
      const s = mk(c.svg, 'path', { d: star(0, 0, 7), fill: '#ffe066', stroke: '#b8860b', 'stroke-width': 1, class: 'fx-free', filter: 'url(#fxGlow)' });
      const frames = [];
      for (let i = 0; i <= 12; i++) {
        const a = (i / 12) * Math.PI * 2 * 1.5 + k * (Math.PI * 2 / 3);
        frames.push({ transform: move(cx + Math.cos(a) * rx, cy + Math.sin(a) * ry), opacity: i === 12 ? 0 : 1 });
      }
      anim(s, frames, 1300, { remove: true, easing: 'linear' });
    }
    await wait(1300);
  };

  /* ---------- Tuyệt kỹ riêng ---------- */
  K.rong = async c => {
    const g = mk(c.svg, 'g', { class: 'fx-free', filter: 'url(#fxGlow)' });
    const body = 'M-230 6 C-205 -34 -175 40 -145 4 S -88 -38 -58 2 S -22 22 0 0';
    mk(g, 'path', { d: body, fill: 'none', stroke: c.color, 'stroke-width': 18, 'stroke-linecap': 'round' });
    mk(g, 'path', { d: body, fill: 'none', stroke: '#b8860b', 'stroke-width': 9, 'stroke-dasharray': '5 9', 'stroke-linecap': 'round' });
    mk(g, 'path', { d: 'M-200 -18 L-192 -34 L-186 -16 M-150 -14 L-142 -30 L-136 -12 M-100 -20 L-92 -36 L-86 -18 M-56 -12 L-48 -28 L-42 -10', fill: 'none', stroke: c.color, 'stroke-width': 4, 'stroke-linejoin': 'round' });
    mk(g, 'path', { d: 'M-4 -16 L30 -10 L50 2 L32 12 L-4 16 L-10 0 Z', fill: c.color, stroke: '#fff3b0', 'stroke-width': 2 });
    mk(g, 'path', { d: 'M6 -14 L-8 -36 M16 -12 L8 -38', fill: 'none', stroke: c.color, 'stroke-width': 4, 'stroke-linecap': 'round' });
    mk(g, 'path', { d: 'M40 4 Q62 -12 74 6 M36 9 Q58 22 68 34', fill: 'none', stroke: '#fff3b0', 'stroke-width': 2 });
    mk(g, 'circle', { cx: 22, cy: -3, r: 3.4, fill: '#8b0000' });
    const s = Math.min(1.25, Math.max(0.65, c.svg.viewBox.baseVal.width / 720));
    const sx = c.dir * s, y0 = c.A.y - 20, mid = (c.A.x + c.Tp.x) / 2;
    await anim(g, [
      { transform: move(c.A.x - c.dir * 30, y0, `scale(${sx * 0.4}, ${s * 0.4})`), opacity: 0 },
      { transform: move(mid, y0 - 34, `scale(${sx}, ${s})`), opacity: 1, offset: 0.45 },
      { transform: move(c.Tp.x + c.dir * 20, c.Tp.y, `scale(${sx}, ${s})`), opacity: 1, offset: 0.9 },
      { transform: move(c.Tp.x + c.dir * 30, c.Tp.y, `scale(${sx * 1.1}, ${s * 1.1})`), opacity: 0 },
    ], 760, { easing: 'ease-in', remove: true });
    ring(c.svg, c.Tp, c.color, 90, { width: 7 });
    ring(c.svg, c.Tp, '#ffffff', 58, { width: 4, delay: 80 });
    ring(c.svg, c.Tp, c.color, 120, { width: 3, delay: 160, dur: 600 });
    spikes(c.svg, c.Tp, c.color, 16, 20, 80, { width: 4 });
    flash(c.arena, c.color, 0.35);
    c.hit(true);
    shake(c.arena, 9);
    await wait(500);
  };

  K.phat_chuong = async c => {
    const g = mk(c.svg, 'g', { class: 'fx-free', filter: 'url(#fxGlow)' });
    const gold = c.color, edge = '#fff3b0';
    mk(g, 'ellipse', { cx: 0, cy: -20, rx: 80, ry: 92, fill: gold, 'fill-opacity': 0.16 });
    [[-34, -78, 52], [-16, -90, 64], [2, -88, 62], [20, -76, 50]].forEach(([x, y, h]) => mk(g, 'rect', { x, y, width: 16, height: h, rx: 8, fill: gold, stroke: edge, 'stroke-width': 2 }));
    mk(g, 'rect', { x: -38, y: -32, width: 74, height: 70, rx: 22, fill: gold, stroke: edge, 'stroke-width': 2 });
    mk(g, 'rect', { x: 30, y: -14, width: 16, height: 46, rx: 8, fill: gold, stroke: edge, 'stroke-width': 2, transform: 'rotate(-38 38 9)' });
    mk(g, 'circle', { cx: -1, cy: 2, r: 9, fill: 'none', stroke: '#b8860b', 'stroke-width': 2.5 });
    const s = Math.min(1.2, Math.max(0.7, c.Tp.h / 140));
    await anim(g, [
      { transform: move(c.Tp.x, c.Tp.y - 260, `scale(${s * 1.7})`), opacity: 0 },
      { transform: move(c.Tp.x, c.Tp.y - 150, `scale(${s * 1.4})`), opacity: 1, offset: 0.35 },
      { transform: move(c.Tp.x, c.Tp.y + 10, `scale(${s})`), opacity: 1, offset: 0.85 },
      { transform: move(c.Tp.x, c.Tp.y + 10, `scale(${s * 1.05})`), opacity: 0 },
    ], 900, { easing: 'ease-in', remove: true });
    ring(c.svg, c.Tp, gold, 110, { width: 7 });
    ring(c.svg, c.Tp, '#ffffff', 70, { width: 4, delay: 80 });
    ring(c.svg, c.Tp, gold, 150, { width: 3, delay: 170, dur: 650 });
    particles(c.svg, { x: c.Tp.x, y: c.Tp.bottom - 10 }, '#c8b48a', 16, 70, { glow: false, size: 6 });
    flash(c.arena, gold, 0.4);
    c.hit(true);
    shake(c.arena, 12);
    await wait(520);
  };

  K.cuu_kiem = async c => {
    lunge(c.a, c.dir, 40, 900);
    await wait(90);
    for (let i = 0; i < 9; i++) {
      slash(c.svg, c.Tp, rnd(-80, 80), c.Tp.h * rnd(0.8, 1.15), i % 2 ? c.color : '#ffffff', { delay: i * 60, width: 5, ox: rnd(-c.Tp.w * 0.2, c.Tp.w * 0.2), oy: rnd(-c.Tp.h * 0.2, c.Tp.h * 0.2) });
      if (i === 1) setTimeout(() => c.hit(), T(i * 60 + 150));
    }
    await wait(9 * 60 + 80);
    slash(c.svg, c.Tp, -45, c.Tp.h * 1.5, '#ffffff', { width: 9 });
    slash(c.svg, c.Tp, 45, c.Tp.h * 1.5, c.color, { width: 9, delay: 60 });
    flash(c.arena, '#e8f6ff', 0.4);
    shake(c.arena, 7);
    await wait(420);
  };

  K.thai_cuc = async c => {
    const g = mk(c.svg, 'g', { class: 'fx-free', filter: 'url(#fxGlow)' });
    const r = Math.max(20, Math.min(30, c.A.w * 0.22));
    mk(g, 'circle', { cx: 0, cy: 0, r, fill: '#151515', stroke: '#ffffff', 'stroke-width': 2 });
    mk(g, 'path', { d: `M0 ${-r} A ${r} ${r} 0 0 1 0 ${r} A ${r / 2} ${r / 2} 0 0 1 0 0 A ${r / 2} ${r / 2} 0 0 0 0 ${-r} Z`, fill: '#ffffff' });
    mk(g, 'circle', { cx: 0, cy: -r / 2, r: r / 7, fill: '#151515' });
    mk(g, 'circle', { cx: 0, cy: r / 2, r: r / 7, fill: '#ffffff' });
    lunge(c.a, c.dir, 16, 600);
    await anim(g, [
      { transform: move(c.A.x, c.A.y, 'rotate(0deg) scale(.1)'), opacity: 0 },
      { transform: move(c.A.x + c.dir * 20, c.A.y, 'rotate(360deg) scale(1)'), opacity: 1, offset: 0.35 },
      { transform: move(c.Tp.x, c.Tp.y, 'rotate(900deg) scale(1.15)'), opacity: 1 },
    ], 820, { easing: 'ease-in-out', remove: true });
    ring(c.svg, c.Tp, '#ffffff', 70, { width: 5 });
    ring(c.svg, c.Tp, '#151515', 52, { width: 5, delay: 60 });
    ring(c.svg, c.Tp, c.color, 96, { width: 3, delay: 140, dur: 560 });
    c.hit(true);
    await wait(420);
  };

  K.bang = async c => {
    lunge(c.a, c.dir, 20, 520);
    await wait(80);
    const shards = [];
    for (let i = 0; i < 9; i++) {
      const p = mk(c.svg, 'polygon', { points: '0,-4 22,0 0,4 -6,0', fill: i % 2 ? c.color : '#ffffff', class: 'fx-free', filter: 'url(#fxGlow)' });
      const oy = rnd(-36, 36), ang = c.dir > 0 ? 0 : 180;
      shards.push(anim(p, [
        { transform: move(c.A.x, c.A.y + oy * 0.3, `rotate(${ang}deg)`), opacity: 0 },
        { transform: move(c.A.x + c.dir * 30, c.A.y + oy * 0.5, `rotate(${ang}deg)`), opacity: 1, offset: 0.2 },
        { transform: move(c.Tp.x - c.dir * rnd(0, 20), c.Tp.y + oy, `rotate(${ang}deg)`), opacity: 1 },
      ], 380, { delay: i * 45, easing: 'ease-in', remove: true }));
    }
    await wait(380 + 45 * 3);
    c.hit(true);
    const flake = mk(c.svg, 'g', { class: 'fx-free', filter: 'url(#fxGlow)' });
    for (let i = 0; i < 6; i++) {
      const a = i * 60;
      mk(flake, 'path', { d: 'M0 0 L0 -52 M0 -30 L-10 -40 M0 -30 L10 -40 M0 -16 L-8 -24 M0 -16 L8 -24', fill: 'none', stroke: i % 2 ? c.color : '#ffffff', 'stroke-width': 3, 'stroke-linecap': 'round', transform: `rotate(${a})` });
    }
    anim(flake, [{ transform: move(c.Tp.x, c.Tp.y, 'rotate(0deg) scale(.2)'), opacity: 1 }, { transform: move(c.Tp.x, c.Tp.y, 'rotate(60deg) scale(1)'), opacity: 1, offset: 0.5 }, { transform: move(c.Tp.x, c.Tp.y, 'rotate(90deg) scale(1.1)'), opacity: 0 }], 800, { remove: true });
    ring(c.svg, c.Tp, c.color, 80, { width: 4 });
    particles(c.svg, c.Tp, '#ffffff', 14, 60, { size: 3, dur: 800 });
    await Promise.all(shards);
    await wait(380);
  };

  /* ---------- Chạy một hiệu ứng ---------- */
  async function play(kind, o) {
    const target = o.to || o.from, self = !o.to || o.to === o.from;
    if (off || !o.arena || !o.from) { if (o.onHit) o.onHit(); return; }
    const svg = stage(o.arena);
    const A = at(o.from, o.arena), Tp = at(target, o.arena);
    const c = { svg, arena: o.arena, a: o.from, t: target, A, Tp, color: o.color || '#ffd84d', size: o.size || 1, hits: o.hits || 1, dir: self ? 1 : (Tp.x >= A.x ? 1 : -1), done: false,
      others: (o.others || []).filter(e => e && e.isConnected) }; // chiêu đánh cả sân: những kẻ bị trúng khác ngoài mục tiêu
    c.hit = strong => {
      if (c.done) return;
      c.done = true;
      if (!self) recoil(c.t, c.dir, strong || o.crit);
      if (o.crit) { shake(o.arena, 10); flash(o.arena, '#ffffff', 0.45); }
      else if (strong) shake(o.arena, 4);
      if (o.onHit) o.onHit();
    };
    c.part = () => { if (!c.done && o.onHitPart) o.onHitPart(); }; // một đòn giữa chừng chạm (chiêu nhiều đòn): hiện số của đòn đó
    if (o.name) callout(o.arena, o.name, c.color, o.big);
    const saved = rate;
    if (o.finish) {
      rate = saved * 1.7;
      flash(o.arena, '#000000', 0.45, 900);
    }
    try {
      if (kind === 'kim_chung') kimChungRings(c);
      await (K[kind] || K.quyen)(c);
    } finally {
      c.hit();
      if (o.finish) {
        flash(o.arena, '#ffffff', 0.85, 600);
        if (target.animate) await anim(target, [{ filter: 'none', opacity: 1, transform: 'none' }, { filter: 'grayscale(1)', opacity: 0.4, transform: 'rotate(-12deg) translateY(6px)' }], 900);
      }
      rate = saved;
    }
  }

  // Né đòn: người né lướt sang bên, đòn đánh trượt
  async function dodge(o) {
    if (off || !o.arena) return;
    const svg = stage(o.arena);
    const A = at(o.from, o.arena), Tp = at(o.to, o.arena), dir = Tp.x >= A.x ? 1 : -1;
    lunge(o.from, dir, 30);
    await wait(120);
    if (o.to.animate) o.to.animate([{ transform: 'none', opacity: 1 }, { transform: `translate(${dir * 26}px,-10px)`, opacity: 0.4, offset: 0.35 }, { transform: 'none', opacity: 1 }], { duration: T(460), easing: 'ease-out' });
    slash(svg, { x: Tp.x - dir * 30, y: Tp.y }, -30, Tp.h * 0.8, '#cccccc', { width: 4 });
    await wait(460);
  }

  return { play, dodge, setSpeed, forSkill, fromSkill, defaultSpeed, prefersReduced, isOff: () => off, rate: () => rate, kinds: Object.keys(K) };
})();
