'use strict';
/* =================================================================
   HIỆP KHÁCH GIANG HỒ — SÂN ĐẤU (giao diện màn đánh nhau)
   -----------------------------------------------------------------
   Người dùng duyệt qua trang "Sân Đấu Mẫu" (web/mau_tran_dau.html) rồi chốt đưa vào game.
   - Sân nhìn chéo từ trên xuống, mặt đất tự nhiên theo cảnh của nơi đang đứng (LOCATIONS[x].bg → SD_BG),
     không lát gạch, không bát quái, không dấu ô.
   - Đội hình 6 ô mỗi bên (3 "hàng" dọc × 2 ô, cột sau so le). Trận hiện tại là 1 đấu 1 nên mỗi bên đứng
     ô giữa hàng trên; SD_FILL để sẵn cho trận đông người sau này.
   - Mọi nhân vật cùng một cỡ. Nhân vật chính ghép tách lớp (thân thở, đầu nhún, tóc bay, tà áo / binh khí đung đưa).
   - Hào quang dưới chân theo màu môn phái (bên mình), vòng phép xoay dưới chân boss.
   - Lao vào đánh rồi lùi về, co giãn cả khối khi lấy đà / ra đòn / trúng đòn; cảnh tung tuyệt chiêu (Trấn phái, Tuyệt học,
     chiêu có tên của boss); chết thì tan biến.
   File này chỉ có hàm vẽ và hoạt cảnh; engine.js (renderCombat, liveUpdate, playTurnFx) gọi vào. Nạp TRƯỚC engine.js.
   ================================================================= */

/* ---------------- Cảnh nền + mặt đất (khung 1000×560) ---------------- */
function sdRng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function sdRidge(seed, base, amp, n, fill, o = {}) {
  const r = sdRng(seed); let d = `M0 560 L0 ${base}`;
  for (let i = 0; i <= n; i++) { const x = i * 1000 / n, y = base - r() * amp * (o.sharp && i % 2 ? 1.6 : 1); d += ` L${x.toFixed(0)} ${y.toFixed(0)}`; }
  return `<path d="${d} L1000 560 Z" fill="${fill}"${o.op ? ` opacity="${o.op}"` : ''}/>`;
}
const sdGrad = (id, stops) => `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">${stops.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join('')}</linearGradient>`;
function sdParticles(n, seed, col, size) {
  const r = sdRng(seed); let s = '';
  for (let i = 0; i < n; i++) s += `<circle class="sd-amb" cx="${(r() * 1000).toFixed(0)}" cy="${(r() * 300).toFixed(0)}" r="${(size * (0.5 + r())).toFixed(1)}" fill="${col}" opacity="${(0.4 + r() * 0.5).toFixed(2)}" style="--dx:${(r() * 60 - 30).toFixed(0)}px;animation-duration:${(6 + r() * 8).toFixed(1)}s;animation-delay:-${(r() * 12).toFixed(1)}s"/>`;
  return s;
}
const SD_H = 226; // chân trời
// Mặt đất: mảng loang, vết nứt (cảnh lửa nứt phát sáng), sỏi, chi tiết riêng (style), tảng đá viền hai mép
function sdGround(f, style, seed) {
  const [near, far, line, rock] = f, r = sdRng(seed), H = SD_H;
  const depth = () => Math.pow(r(), 0.8);
  const yAt = k => H + 10 + (560 - H - 10) * k;
  let s = `<defs>${sdGrad('sdg' + seed, [[0, far], [1, near]])}<linearGradient id="sdh${seed}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
    <filter id="sdLava" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="3"/></filter></defs>`;
  s += `<path d="M0 ${H} Q250 ${H - 8} 500 ${H} T1000 ${H} L1000 560 L0 560 Z" fill="url(#sdg${seed})"/><rect x="0" y="${H - 4}" width="1000" height="60" fill="url(#sdh${seed})"/>`;
  for (let i = 0; i < 16; i++) { const k = depth(), rx = (40 + r() * 110) * (0.35 + 0.65 * k); s += `<ellipse cx="${(r() * 1000).toFixed(0)}" cy="${yAt(k).toFixed(0)}" rx="${rx.toFixed(0)}" ry="${(rx * 0.2).toFixed(0)}" fill="${i % 2 ? '#000' : '#fff'}" opacity="${(0.05 + r() * 0.07).toFixed(2)}"/>`; }
  const cracks = style === 'lava' ? 14 : style === 'snow' || style === 'sand' ? 5 : 9;
  for (let i = 0; i < cracks; i++) {
    const k = depth(), sc = 0.35 + 0.65 * k; let x = r() * 1000, y = yAt(k), d = `M${x.toFixed(0)} ${y.toFixed(0)}`;
    for (let j = 0; j < 4 + r() * 4; j++) { x += (r() * 60 - 10) * sc * (r() < .5 ? -1 : 1); y += (r() * 10 - 5) * sc; d += ` L${x.toFixed(0)} ${y.toFixed(0)}`; }
    if (style === 'lava') s += `<path d="${d}" fill="none" stroke="#ff6a1a" stroke-width="${(5 * sc).toFixed(1)}" class="sd-lava" style="animation-delay:-${(r() * 3).toFixed(1)}s" filter="url(#sdLava)"/>`;
    s += `<path d="${d}" fill="none" stroke="${style === 'lava' ? '#ffb347' : line}" stroke-width="${(1.6 * sc + .4).toFixed(1)}" stroke-linejoin="round" opacity="${style === 'lava' ? .9 : .35}"/>`;
  }
  for (let i = 0; i < 28; i++) { const k = depth(), rr = (2 + r() * 5) * (0.35 + 0.65 * k); s += `<ellipse cx="${(r() * 1000).toFixed(0)}" cy="${yAt(k).toFixed(0)}" rx="${rr.toFixed(1)}" ry="${(rr * 0.6).toFixed(1)}" fill="${rock}" opacity=".55"/>`; }
  for (let i = 0; i < 18; i++) {
    const k = depth(), sc = 0.35 + 0.65 * k, x = r() * 1000, y = yAt(k);
    if (style === 'grass') s += `<path d="M${x} ${y} l${-6 * sc} ${-14 * sc} M${x} ${y} l0 ${-18 * sc} M${x} ${y} l${6 * sc} ${-14 * sc}" stroke="#6f9a4a" stroke-width="${2 * sc + .5}" stroke-linecap="round" opacity=".8"/>`;
    if (style === 'sand') s += `<path d="M${x - 50 * sc} ${y} q ${25 * sc} ${-6 * sc} ${50 * sc} 0 t ${50 * sc} 0" fill="none" stroke="${line}" stroke-width="${1.5 * sc + .5}" opacity=".45"/>`;
    if (style === 'snow') s += `<ellipse cx="${x}" cy="${y}" rx="${40 * sc}" ry="${9 * sc}" fill="#ffffff" opacity=".55"/>`;
    if (style === 'water' && i % 3 === 0) s += `<ellipse cx="${x}" cy="${y}" rx="${36 * sc}" ry="${7 * sc}" fill="#3f7f96" opacity=".55"/><ellipse cx="${x - 8 * sc}" cy="${y - 2 * sc}" rx="${12 * sc}" ry="${2 * sc}" fill="#cfefff" opacity=".6"/>`;
    if (style === 'moss') s += `<ellipse cx="${x}" cy="${y}" rx="${30 * sc}" ry="${6 * sc}" fill="#5f8a3a" opacity=".45"/>${i % 4 === 0 ? `<circle cx="${x + 8 * sc}" cy="${y - 6 * sc}" r="${3 * sc + 1}" fill="#b8f56a" opacity=".85"/>` : ''}`;
    if (style === 'stone' && i % 2 === 0) s += `<path d="M${x - 30 * sc} ${y} l${10 * sc} ${-8 * sc} l${40 * sc} ${-1 * sc} l${12 * sc} ${9 * sc} Z" fill="${line}" opacity=".18"/>`;
  }
  const boulder = (x, y, w, h) => `<path d="M${x - w / 2} ${y} Q${x - w / 2} ${y - h * 0.9} ${x - w * 0.1} ${y - h} Q${x + w * 0.4} ${y - h * 1.05} ${x + w / 2} ${y - h * 0.3} L${x + w / 2} ${y} Z" fill="${rock}"/><path d="M${x - w * 0.3} ${y - h * 0.7} Q${x - w * 0.1} ${y - h * 0.95} ${x + w * 0.2} ${y - h * 0.9}" fill="none" stroke="#fff" stroke-width="${Math.max(2, w / 30)}" opacity=".18" stroke-linecap="round"/>`;
  s += boulder(30, H + 26, 90, 50) + boulder(975, H + 30, 100, 56) + boulder(-10, 560, 200, 110) + boulder(1010, 560, 220, 120) + boulder(70, H + 120, 70, 34) + boulder(940, H + 150, 80, 38);
  return s;
}
/* Bảy kiểu cảnh: trời + mặt đất. floor = [màu gần, màu xa, màu vết nứt / nét sáng, màu đá] */
const SD_SCENES = {
  stone: { floor: ['#8b7a68', '#5a4a3e', '#e2c9a2', '#4a3a30'], style: 'stone', seed: 41, sky: () => `<defs>${sdGrad('sdk1', [[0, '#3b2a52'], [0.55, '#c8714a'], [1, '#f2b46a']])}</defs>
    <rect width="1000" height="560" fill="url(#sdk1)"/><circle cx="780" cy="150" r="56" fill="#ffd9a0" opacity=".55"/>
    ${sdRidge(3, 230, 150, 9, '#5a4a6e', { sharp: true, op: .8 })}${sdRidge(7, 250, 110, 7, '#3d3150', { sharp: true })}
    <path d="M0 200 Q200 180 420 204 T1000 192" fill="none" stroke="#f4d9c0" stroke-width="20" opacity=".16" stroke-linecap="round"/>` },
  bamboo: { floor: ['#6f7a40', '#4a5a2a', '#d9c48f', '#3a3420'], style: 'grass', seed: 42, sky: () => `<defs>${sdGrad('sdk2', [[0, '#cfe3b8'], [1, '#6f9a5c']])}</defs>
    <rect width="1000" height="560" fill="url(#sdk2)"/>
    ${(() => { const r = sdRng(9); let s = ''; for (let i = 0; i < 30; i++) { const x = r() * 1000, w = 8 + r() * 14, far = i < 16, c = far ? '#88ad72' : '#3f6b34'; s += `<rect x="${x.toFixed(0)}" y="-10" width="${w.toFixed(0)}" height="260" fill="${c}" opacity="${far ? .7 : 1}"/>`; for (let y = 30 + r() * 40; y < 240; y += 60 + r() * 30) s += `<rect x="${(x - 1).toFixed(0)}" y="${y.toFixed(0)}" width="${(w + 2).toFixed(0)}" height="4" fill="${far ? '#6f9460' : '#2c4f24'}"/>`; } return s; })()}
    ${sdParticles(18, 4, '#e8f5c8', 2.4)}` },
  snow: { floor: ['#eef3f8', '#c4d2e2', '#7f97b2', '#8a9cb2'], style: 'snow', seed: 43, sky: () => `<defs>${sdGrad('sdk3', [[0, '#8fa8c8'], [1, '#e8f0f8']])}</defs>
    <rect width="1000" height="560" fill="url(#sdk3)"/>${sdRidge(21, 220, 170, 8, '#c9d8ea', { sharp: true })}${sdRidge(23, 250, 120, 6, '#f4f8fc', { sharp: true })}
    ${sdParticles(60, 8, '#ffffff', 2.6)}` },
  sand: { floor: ['#dcb47c', '#c08a50', '#fff0c8', '#8a5a2e'], style: 'sand', seed: 44, sky: () => `<defs>${sdGrad('sdk4', [[0, '#e9823f'], [0.6, '#f6c27a'], [1, '#f8dfa8']])}</defs>
    <rect width="1000" height="560" fill="url(#sdk4)"/><circle cx="240" cy="120" r="70" fill="#fff0c0" opacity=".85"/>
    <path d="M0 220 Q180 170 380 210 T760 195 T1000 205 L1000 560 L0 560 Z" fill="#e0a45e"/>${sdParticles(16, 12, '#fff1cf', 1.8)}` },
  sea: { floor: ['#8a7a60', '#4a4a48', '#d8c8a0', '#2e3438'], style: 'water', seed: 45, sky: () => `<defs>${sdGrad('sdk5', [[0, '#0d2238'], [0.6, '#1f4f6b'], [1, '#2f7d8c']])}</defs>
    <rect width="1000" height="560" fill="url(#sdk5)"/><circle cx="800" cy="90" r="40" fill="#eaf4ff" opacity=".9"/>
    ${(() => { let s = ''; for (let i = 0; i < 6; i++) { const y = 150 + i * 18; s += `<path d="M0 ${y} Q 60 ${y - 7} 120 ${y} T 240 ${y} T 360 ${y} T 480 ${y} T 600 ${y} T 720 ${y} T 840 ${y} T 960 ${y} T 1080 ${y}" fill="none" stroke="#8fd0e0" stroke-width="2" opacity="${(0.15 + i * 0.08).toFixed(2)}"/>`; } return s; })()}
    ${sdParticles(14, 15, '#bfe9ff', 1.6)}` },
  jungle: { floor: ['#4e5e3c', '#26301c', '#a8d080', '#1e2a14'], style: 'moss', seed: 46, sky: () => `<defs>${sdGrad('sdk6', [[0, '#0f2418'], [1, '#2c4a2a']])}</defs>
    <rect width="1000" height="560" fill="url(#sdk6)"/>${sdRidge(31, 220, 80, 10, '#183522', { op: .9 })}
    <g fill="#0a180f">${[40, 190, 800, 940].map(x => `<rect x="${x}" y="-10" width="40" height="260"/><path d="M${x + 20} 40 q 70 26 96 96 q -60 -34 -96 -96 Z"/>`).join('')}</g>
    ${sdParticles(26, 19, '#b8f56a', 2.4)}` },
  lava: { floor: ['#6a2a1e', '#3a140e', '#d0453a', '#2a0e0a'], style: 'lava', seed: 47, sky: () => `<defs>${sdGrad('sdk7', [[0, '#16060a'], [1, '#4a0e12']])}</defs>
    <rect width="1000" height="560" fill="url(#sdk7)"/><circle cx="500" cy="70" r="50" fill="#c2352b" opacity=".75"/><circle cx="500" cy="70" r="76" fill="#c2352b" opacity=".18"/>
    ${[110, 270, 730, 890].map(x => `<rect x="${x - 22}" y="20" width="44" height="220" fill="#2a0e10"/><rect x="${x - 30}" y="12" width="60" height="14" fill="#3a1416"/>`).join('')}
    ${[200, 800].map(x => `<path class="sd-flick" d="M${x} 150 Q ${x + 20} 178 ${x + 11} 200 Q ${x} 207 ${x - 11} 200 Q ${x - 20} 178 ${x} 150 Z" fill="#ff7a2e"/><path class="sd-flick" d="M${x} 170 Q ${x + 9} 184 ${x + 5} 198 Q ${x} 201 ${x - 5} 198 Q ${x - 9} 184 ${x} 170 Z" fill="#ffd46a"/>`).join('')}
    ${sdParticles(22, 27, '#ff9a4a', 1.8)}` },
};
// Nền địa điểm (LOCATIONS[x].bg) → kiểu cảnh sân đấu
const SD_BG = { town: 'stone', mountain: 'stone', temple: 'stone', ruin: 'stone', snow: 'snow', forest: 'bamboo', valley: 'bamboo', village: 'bamboo',
  blossom: 'bamboo', mist: 'jungle', evil: 'lava', abyss: 'sea', beggar: 'sand' };
const sdSceneKey = bg => SD_BG[bg] || 'stone';
function sdSceneSvg(key) {
  const sc = SD_SCENES[key] || SD_SCENES.stone;
  return `<svg viewBox="0 0 1000 560" preserveAspectRatio="xMidYMax slice" aria-hidden="true">${sc.sky()}${sdGround(sc.floor, sc.style, sc.seed)}</svg>`;
}

/* ---------------- Đội hình: 6 ô mỗi bên ----------------
   Người dùng gọi mỗi cột dọc 3 ô là một "hàng": hàng trên = cột trước 0/2/4 (sát đối phương), hàng dưới = cột sau 1/3/5.
   1 người: ô giữa hàng trên; 2: ô giữa hai hàng; 3: ô giữa hàng trên + hai ô hàng dưới sát cạnh; 4: cả hàng trên + ô giữa hàng dưới;
   5: bỏ ô xa màn hình nhất của hàng dưới; 6: kín. [giữa người % bề ngang, chân chạm đất % bề cao] cho bên trái, bên phải lật ngang. */
// Đội hình 6 ô (x, y = chân, % sân). 2026-11-05: hạ xuống cho vừa sàn đá của sân đấu dùng chung (mép sau của sàn ở ~50% chiều cao),
// cũ: [[29, 50], [12, 44], [29.5, 71], [11, 65], [30, 92], [10, 86]]
const SD_SLOTS_MB = [[29, 60], [12, 55], [29.5, 77], [11, 72], [30, 94], [10, 89]];
// máy tính (khung 16:9, nhân vật to hơn so với chiều cao sân): giãn hàng ra một chút cho đỡ chồng lên nhau
const SD_SLOTS_PC = [[29, 55], [12, 49], [29.5, 74.5], [11, 68.5], [30, 94], [10, 88]];
const sdPhone = () => !!(window.matchMedia && matchMedia('(max-width: 600px)').matches);
const SD_SLOTS = new Proxy([], { get: (t, k) => (sdPhone() ? SD_SLOTS_MB : SD_SLOTS_PC)[k] });
/* Sân đấu dùng chung cho mọi trận (người dùng 2026-11-05: bỏ nền theo cảnh vì khó nhìn, cần nền làm nổi nhân vật và võ công).
   Ảnh Gemini người dùng tạo (gốc luu_tru/san_dau/): lôi đài đá trên đỉnh núi, bản đêm và bản ngày; 'vang' = bản ngày phủ tối (chạng vạng).
   mode: chế độ đang dùng ('random' = mỗi trận bốc ngẫu nhiên một sân trong `sets`); null thì dùng lại nền theo cảnh như cũ.
   Người dùng chọn chạng vạng trên trang thử 2026-11-05, rồi thêm rừng trúc cho điện thoại, ngẫu nhiên qua lại cho đỡ nhàm.
   Mỗi sân có bản điện thoại `mb` (ảnh 4:3, khung sân ≤ 600px) và bản máy tính `pc` (ảnh 16:9); dim = phủ tối kiểu chạng vạng.
   Máy tính hiện mới có lôi đài đêm 16:9 nên mọi sân dùng chung ảnh đó. */
const SAN_DAU = {
  mode: 'random',
  sets: {
    loi_dai: { mb: { src: 'game/img/san_dau/ngay.jpg', dim: true } },
    rung_truc: { mb: { src: 'game/img/san_dau/truc_dem.jpg' } },
    // người dùng duyệt trên trang thử 2026-11-05
    dam_lay: { mb: { src: 'game/img/san_dau/dam_lay.jpg' } },
    bo_song: { mb: { src: 'game/img/san_dau/bo_song.jpg' } },
    kinh_thanh: { mb: { src: 'game/img/san_dau/kinh_thanh.jpg' } },
  },
  // các kiểu dùng trên trang thử để so (không bốc ngẫu nhiên)
  modes: { dem: { mb: { src: 'game/img/san_dau/dem.jpg' } }, ngay: { mb: { src: 'game/img/san_dau/ngay.jpg' } }, vang: { mb: { src: 'game/img/san_dau/ngay.jpg', dim: true } },
    truc_ngay: { mb: { src: 'game/img/san_dau/truc_ngay.jpg' } }, truc_dem: { mb: { src: 'game/img/san_dau/truc_dem.jpg' } },
  },
};
// Sân của trận đang đánh: bốc một lần lúc vào trận (combat.sanDau), dựng lại màn không đổi sân
function sanDauArt() {
  if (!SAN_DAU.mode) return null;
  if (SAN_DAU.mode !== 'random') return SAN_DAU.modes[SAN_DAU.mode] || SAN_DAU.sets[SAN_DAU.mode] || null;
  const keys = Object.keys(SAN_DAU.sets);
  if (typeof combat !== 'undefined' && combat) {
    if (!combat.sanDau || !SAN_DAU.sets[combat.sanDau]) combat.sanDau = keys[Math.floor(Math.random() * keys.length)];
    return SAN_DAU.sets[combat.sanDau];
  }
  return SAN_DAU.sets[keys[0]];
}
function sanDauHtml() {
  const s = sanDauArt();
  if (!s) return '';
  const one = (m, cls) => (m ? `<div class="sd-bgset ${cls}"><img class="sd-bgimg" src="${m.src}" alt="">${m.dim ? '<div class="sd-dusk"></div>' : ''}</div>` : '');
  return one(s.mb, 'mb') + one(s.mb, 'pc'); // chỉ điện thoại: ảnh 16:9 đã gỡ, khung rộng cũng dùng ảnh 4:3
}
const SD_FILL = { 1: [2], 2: [2, 3], 3: [2, 3, 5], 4: [2, 0, 4, 3], 5: [2, 0, 4, 3, 5], 6: [0, 1, 2, 3, 4, 5] };
const sdSlot = (n, i, right) => { const [x, y] = SD_SLOTS[SD_FILL[n][i]]; return [right ? 100 - x : x, y]; };

/* ---------------- Nhân vật ---------------- */
const SD_HALO = { thieu_lam: '#ff9a3a', vo_dang: '#6fa8ff', nga_mi: '#ff9ac0', cai_bang: '#ffc24a', vo_danh: '#fff0b8' };
// Vận công lúc vào trận: hào quang dưới chân bừng sáng, tên nội công và các hiệu ứng đang có bay lên (không chặn lượt đánh)
function sdVanCong(unit, color, name, lines) {
  if (!unit) return;
  unit.classList.add('sd-vc');
  const box = document.createElement('div');
  box.className = 'sd-vc-txt';
  box.style.setProperty('--vc', color || '#fff6dc');
  [name, ...lines].forEach((t, i) => {
    const s = document.createElement('span');
    if (!i) s.className = 'nm';
    s.textContent = i ? t : 'Vận công · ' + t;
    s.style.animationDelay = (0.35 + i * 0.18) + 's';
    box.appendChild(s);
  });
  unit.appendChild(box);
  setTimeout(() => { box.remove(); unit.classList.remove('sd-vc'); }, 3200);
}
// Mốc tầng nội công vừa phát động (vd. Cửu Dương Bất Diệt gượng 1 khí huyết): pháp trận dưới chân chớp sáng, tên hiện lên
function sdCircleFlash(unit, text) {
  if (!unit) return;
  unit.classList.remove('sd-cflash'); void unit.offsetWidth; unit.classList.add('sd-cflash');
  const box = document.createElement('div');
  box.className = 'sd-vc-txt';
  const s = document.createElement('span'); s.className = 'nm'; s.textContent = text;
  box.appendChild(s); unit.appendChild(box);
  setTimeout(() => { box.remove(); unit.classList.remove('sd-cflash'); }, 2400);
}
const SD_AURA = `<div class="sd-aura"><div class="sd-aura-glow"></div><svg viewBox="-100 -100 200 200" aria-hidden="true">
  <circle r="94" fill="none" stroke="#fff6dc" stroke-width="5" opacity=".9"/><circle r="80" fill="none" stroke="#ffe7a8" stroke-width="2.5" opacity=".85"/>
  ${Array.from({ length: 24 }, (_, i) => `<rect x="-3" y="-90" width="6" height="${i % 3 ? 7 : 12}" fill="#fff6dc" transform="rotate(${i * 15})"/>`).join('')}
  <path d="${Array.from({ length: 16 }, (_, i) => { const a = i * Math.PI / 8 - Math.PI / 2, rr = i % 2 ? 30 : 72; return `${i ? 'L' : 'M'}${(Math.cos(a) * rr).toFixed(1)} ${(Math.sin(a) * rr).toFixed(1)}`; }).join(' ')} Z" fill="none" stroke="#fff6dc" stroke-width="2.5" opacity=".8"/>
  <circle r="24" fill="none" stroke="#ffe7a8" stroke-width="2"/></svg></div>`;
// Nhân vật chính ghép từng lớp của AVATARS để cử động riêng; hai nhóm data-face giữ khuôn mặt (đổi mặt không dựng lại hình)
function sdLayered(sect, title, face) {
  const m = typeof avatarImgOf === 'function' && avatarImgOf(sect, title);
  if (m) return avatarImgBody(m, face);                 // nhân vật ảnh vẽ sẵn: cả người thở, mặt đổi bằng miếng dán
  const a = typeof avatarOf === 'function' && avatarOf(sect, title);
  if (!a) return typeof avatarSvg === 'function' ? avatarSvg(sect, title, 'body', face) : '';
  const f = a.faces[face] || a.faces.normal;
  return `<svg class="avatar body" viewBox="0 0 240 320" aria-hidden="true"><g stroke="${a.ink}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round">
    <g class="sd-l-under">${a.under}</g><g class="sd-l-hair">${a.hairBack}</g><g class="sd-l-body">${a.body}</g>
    <g class="sd-l-head">${a.head}<g data-face="0">${f[0]}</g>${a.front}<g data-face="1">${f[1]}</g></g></g></svg>`;
}
function sdSetFace(artEl, sect, title, face) {
  const g0 = artEl && artEl.querySelector('[data-face="0"]');
  if (!g0 || artEl.dataset.face === face) return !!g0;
  const m = typeof avatarImgOf === 'function' && avatarImgOf(sect, title);
  if (m) { g0.innerHTML = avatarImgFace(m, face); artEl.dataset.face = face; return true; }
  const a = avatarOf(sect, title), f = a.faces[face] || a.faces.normal;
  g0.innerHTML = f[0];
  artEl.querySelector('[data-face="1"]').innerHTML = f[1];
  artEl.dataset.face = face;
  return true;
}
// Chip hiệu ứng trên đầu: biểu tượng (lấy từ FX_NAMES) + số lượt / số tầng
function sdChips(c) {
  const out = Object.keys(c.fx).map(k => {
    const m = /\[\[([a-z_0-9]+)\]\]/.exec(FX_NAMES[k] || ''), v = c.fx[k];
    const n = k === 'soho' || k === 'noithuong' || k === 'dv' ? '×' + v.n : k === 'phehon' ? '-' + v.n * 2 + '%' : k === 'shield' ? v.value : v.turns;
    return `<span class="sd-st sd-st-${k}" title="${(FX_NAMES[k] || k).replace(/\[\[[a-z_0-9]+\]\]\s*/, '')}">${m ? `[[${m[1]}]]` : ''}${n != null ? n : ''}</span>`;
  });
  if (c.guard) out.push('<span class="sd-st" title="Thủ thế">[[thu_the]]</span>');
  return out.join('');
}

/* ---------------- Hoạt cảnh ---------------- */
const sdMotion = () => typeof fxOn === 'function' && fxOn() && !(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
const sdWait = ms => new Promise(r => setTimeout(r, ms));
function sdSquash(artEl, frames, dur, easing = 'ease-out') {
  if (!sdMotion() || !artEl || !artEl.animate) return Promise.resolve();
  const a = artEl.animate(frames, { duration: dur, easing });
  return Promise.race([a.finished.catch(() => {}), sdWait(dur + 120)]);
}
const SD_SQ = {
  windup: d => [{ transform: 'none' }, { transform: `scale(1.12, .84) skewX(${d * 7}deg)` }],
  stretch: d => [{ transform: `scale(1.12, .84) skewX(${d * 7}deg)` }, { transform: `scale(.88, 1.14) skewX(${-d * 10}deg)`, offset: 0.4 }, { transform: `scale(.94, 1.06) skewX(${-d * 6}deg)` }],
  strike: d => [{ transform: `scale(.94, 1.06) skewX(${-d * 6}deg)` }, { transform: `scale(1.16, .86) skewX(${-d * 4}deg)`, offset: 0.25 }, { transform: `scale(.9, 1.1) skewX(${-d * 14}deg) translateX(${d * 6}%)`, offset: 0.55 }, { transform: 'none' }],
  hurt: d => [{ transform: 'none' }, { transform: `scale(1.14, .82) skewX(${-d * 9}deg) translateX(${-d * 5}%)`, offset: 0.18 }, { transform: `scale(.94, 1.07) skewX(${d * 4}deg)`, offset: 0.5 }, { transform: 'scale(1.02, .98)', offset: 0.75 }, { transform: 'none' }],
  charge: () => [{ transform: 'none' }, { transform: 'scale(1.08, .9)', offset: 0.35 }, { transform: 'scale(.95, 1.09) translateY(-3%)', offset: 0.7 }, { transform: 'none' }],
  hop: () => [{ transform: 'none' }, { transform: 'scale(1.1, .88)', offset: 0.15 }, { transform: 'scale(.92, 1.1) translateY(-14%)', offset: 0.45 }, { transform: 'scale(1.08, .92)', offset: 0.8 }, { transform: 'none' }],
};
// Lao vào đánh: chạy sang sát mục tiêu (bật nhẹ giữa đường), đánh xong lùi về chỗ cũ
async function sdDashIn(unit, target, dir) {
  if (!sdMotion() || !unit || !target) return null;
  const art = unit.querySelector('.sd-art');
  await sdSquash(art, SD_SQ.windup(dir), 150, 'ease-in');
  const a = unit.getBoundingClientRect(), b = target.getBoundingClientRect();
  const dx = (b.left + b.width / 2) - (a.left + a.width / 2) - dir * (a.width + b.width) * 0.36, dy = b.bottom - a.bottom;
  unit.style.zIndex = 160;
  sdSquash(art, SD_SQ.stretch(dir), 280);
  const base = 'translate(-50%,-100%)';
  const an = unit.animate([{ transform: base }, { transform: `${base} translate(${dx * 0.55}px, ${dy * 0.55 - a.height * 0.1}px)`, offset: 0.55 }, { transform: `${base} translate(${dx}px, ${dy}px)` }],
    { duration: 280, easing: 'cubic-bezier(.5,0,.8,.4)', fill: 'forwards' });
  await Promise.race([an.finished.catch(() => {}), sdWait(400)]);
  sdSquash(art, SD_SQ.strike(dir), 330);
  return { unit, an, dx, dy };
}
async function sdDashOut(m) {
  if (!m) return;
  const base = 'translate(-50%,-100%)';
  const back = m.unit.animate([{ transform: `${base} translate(${m.dx}px, ${m.dy}px)` }, { transform: `${base} translate(${m.dx * 0.4}px, ${m.dy * 0.4 - 12}px)`, offset: 0.5 }, { transform: base }], { duration: 340, easing: 'ease-out' });
  m.an.cancel();
  await Promise.race([back.finished.catch(() => {}), sdWait(450)]);
  sdSquash(m.unit.querySelector('.sd-art'), [{ transform: 'scale(1.1, .88)' }, { transform: 'none' }], 200);
  m.unit.style.zIndex = '';
}
// Vệt mực bút lông (khung 600×120) cho cảnh tung chiêu và băng rôn kết trận
const sdInk = (flip, seal = '#b3261e') => `<svg viewBox="0 0 600 120" preserveAspectRatio="none" aria-hidden="true"${flip ? ' style="transform:scaleX(-1)"' : ''}>
  <path d="M30 70 L60 58 L540 54 L590 44 L560 66 L596 80 L548 84 L70 90 L24 98 Z" fill="${seal}" opacity=".85"/>
  <path d="M2 54 L24 40 L52 47 L84 33 L300 30 L520 28 L560 18 L548 32 L598 36 L572 52 L600 64 L570 74 L596 92 L548 88 L320 92 L90 94 L58 86 L28 98 L12 82 L22 72 Z" fill="#0d0806"/>
  <path d="M90 40 L520 36 M110 86 L500 84 M60 62 L30 60" stroke="#3a2a22" stroke-width="2" opacity=".7"/></svg>`;
// Cảnh tung tuyệt chiêu: tối màn, chân dung lớn lướt vào, tên chiêu chữ bút lông trên vệt mực
async function sdCutIn(stage, side, artHtml, name) {
  if (!sdMotion() || !stage) return;
  const c = document.createElement('div');
  c.className = 'sd-cutin ' + side;
  c.innerHTML = `<div class="sd-lines"></div><div class="sd-who">${artHtml}</div><div class="sd-band">${sdInk(side === 'en')}<b></b></div>`;
  c.querySelector('b').textContent = name;
  stage.appendChild(c);
  const d = side === 'pl' ? 1 : -1, who = c.querySelector('.sd-who'), band = c.querySelector('.sd-band'), txt = c.querySelector('b'), lines = c.querySelector('.sd-lines');
  c.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 160, fill: 'forwards' });
  lines.animate([{ transform: 'translateX(0)' }, { transform: `translateX(${-d * 30}%)` }], { duration: 1300 });
  who.animate([{ transform: `translateX(${-d * 70}%) scale(1.15)`, opacity: 0 }, { transform: 'translateX(0) scale(1)', opacity: 1, offset: 0.22 }, { transform: `translateX(${d * 4}%) scale(1.02)`, offset: 0.8 }, { transform: `translateX(${d * 60}%)`, opacity: 0 }], { duration: 1300, easing: 'ease-out', fill: 'forwards' });
  band.animate([{ clipPath: side === 'pl' ? 'inset(0 100% 0 0)' : 'inset(0 0 0 100%)' }, { clipPath: 'inset(0 0 0 0)', offset: 0.28 }, { clipPath: 'inset(0 0 0 0)', offset: 0.82 }, { clipPath: 'inset(0 0 0 0)', opacity: 0 }], { duration: 1300, delay: 120, easing: 'ease-out', fill: 'both' });
  txt.animate([{ transform: 'scale(1.6)', opacity: 0, letterSpacing: '14px' }, { transform: 'scale(1)', opacity: 1, letterSpacing: '1px', offset: 0.35 }, { opacity: 1, offset: 0.8 }, { opacity: 0 }], { duration: 1200, delay: 260, fill: 'both' });
  await sdWait(1350);
  await Promise.race([c.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 180, fill: 'forwards' }).finished.catch(() => {}), sdWait(260)]);
  c.remove();
}
// Tim đỏ và lửa xanh bay lên quanh người khi hồi máu
const SD_HEART = '<svg viewBox="0 0 40 40"><path d="M20 34 Q4 22 6 12 Q9 4 16 6 Q19 7 20 11 Q21 7 24 6 Q31 4 34 12 Q36 22 20 34 Z" fill="#ff3a4a" stroke="#5a0a10" stroke-width="2.5"/><path d="M11 13 Q12 9 16 9" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" opacity=".8"/></svg>';
const SD_FLAME = '<svg viewBox="0 0 40 50"><path d="M20 48 Q4 42 6 28 Q8 18 16 10 Q15 20 22 22 Q20 10 28 2 Q30 16 34 24 Q38 40 20 48 Z" fill="#4aa8ff" stroke="#0a2a5a" stroke-width="2.5"/><path d="M20 44 Q12 40 14 32 Q18 36 22 30 Q28 38 20 44 Z" fill="#cfeaff"/></svg>';
function sdSparks(unit) {
  if (!sdMotion() || !unit) return;
  [[SD_HEART, 6], [SD_FLAME, 58], [SD_HEART, 34]].forEach(([s, x], i) => {
    const d = document.createElement('div');
    d.className = 'sd-spark'; d.innerHTML = s; d.style.left = x + '%'; d.style.top = (48 + i * 9) + '%'; d.style.animationDelay = (i * 0.15) + 's';
    unit.appendChild(d); setTimeout(() => d.remove(), 1900);
  });
}
// Số bay trên đầu một người (sát thương, hồi máu, né...)
function sdPop(stage, unit, html, cls, i) {
  if (!stage || !unit) return;
  const st = stage.getBoundingClientRect(), f = unit.getBoundingClientRect();
  const d = document.createElement('div');
  d.className = 'sd-pop sd-pop-' + (cls || 'dmg'); // tên riêng để không bị kiểu chữ .dmg/.heal/.crit đỏ của nhật ký đè màu
  setHtml(d, html);
  const j = (i || 0) % 4;
  d.style.left = (f.left - st.left + f.width * (0.5 + (j % 2 ? 0.18 : -0.18) * (j > 1 ? 0.5 : 1))) + 'px';
  d.style.top = (f.top - st.top + f.height * (0.3 + j * 0.06)) + 'px';
  stage.appendChild(d);
  const big = cls === 'crit';
  if (d.animate) {
    const a = d.animate([{ opacity: 0, transform: 'translate(-50%,-30%) scale(1.6)' }, { opacity: 1, transform: 'translate(-50%,-50%) scale(1)', offset: .15 }, { opacity: 1, offset: .65 }, { opacity: 0, transform: `translate(-50%, calc(-50% - ${big ? 70 : 52}px)) scale(.9)` }], { duration: big ? 1100 : 850, easing: 'ease-out' });
    a.onfinish = () => d.remove();
  }
  setTimeout(() => d.remove(), 1500);
}

/* ---------------- Kiểu dáng (tự chèn một lần) ---------------- */
function sdStyle() {
  if (document.getElementById('sd-style')) return;
  const st = document.createElement('style');
  st.id = 'sd-style';
  st.textContent = `
  .sd-wrap { --sd-u: 21%; --sd-lacquer: #24170f; --sd-lacquer2: #33221a; --sd-bronze: #c99a4b; --sd-bronze-dim: #7d6036; --sd-paper: #f3e6cc; --sd-paper-dim: #b9a88c;
    --sd-gold: #ffd46a; --sd-brush: "Pattaya", "Palatino Linotype", "Book Antiqua", Palatino, serif; /* chữ bút lông; không tải được thì dùng phông có đủ dấu tiếng Việt */ display: grid; gap: 8px; color: var(--sd-paper); max-width: 1000px; margin: 0 auto; }
  .sd-huds { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .sd-hud { min-width: 0; overflow: hidden; padding: 6px 8px; border-radius: 8px; background: var(--sd-lacquer); border: 1px solid var(--sd-bronze-dim); display: flex; gap: 8px; align-items: center; }
  .sd-hud.en { flex-direction: row-reverse; border-color: #7a3a2a; }
  .sd-face { flex: none; width: 44px; height: 44px; border-radius: 50%; background: var(--sd-lacquer2); border: 2px solid var(--sd-bronze); overflow: hidden; display: grid; place-items: center; }
  .sd-hud.en .sd-face { border-color: #c2352b; }
  .sd-face.tap { cursor: pointer; } .sd-face.tap:hover { box-shadow: 0 0 0 2px rgba(255, 210, 120, .45); }
  /* Cấp ngay dưới ảnh tròn */
  .sd-facecol { flex: none; display: flex; flex-direction: column; align-items: center; gap: 2px; }
  .sd-flv { font-size: 11px; line-height: 1.2; font-weight: 700; color: var(--sd-gold, #f0c560); white-space: nowrap; }
  .sd-hud.en .sd-flv { color: #e8a088; }
  .sd-face svg { width: 100%; height: 100%; }
  .sd-info { flex: 1; min-width: 0; display: grid; grid-template-columns: minmax(0, 1fr); gap: 2px; }
  .sd-who { display: flex; justify-content: space-between; align-items: baseline; gap: 6px; }
  .sd-hud.en .sd-who { flex-direction: row-reverse; }
  .sd-who b { font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0; }
  .sd-who span { flex: none; color: var(--sd-paper-dim); font-size: 11.5px; }
  .sd-hud.en .sd-who span { color: #e8a088; }
  .sd-who .tag { flex: none; font-style: normal; font-size: 10px; padding: 0 4px; margin: 0; }
  .sd-bar { position: relative; height: 10px; border-radius: 2px; background: #1a0d08; overflow: hidden; }
  .sd-bar i { position: absolute; inset: 0 auto 0 0; transition: width .25s; }
  .sd-bar.hp i.g { background: #f6e2b8; transition: width .7s ease .45s; }
  .sd-bar.hp i.f { background: linear-gradient(180deg, #e85a3c, #c2352b); }
  .sd-bar.mp i.f { background: linear-gradient(180deg, #6aa6ef, #3b7fd6); }
  .sd-bar.no i.f { background: linear-gradient(90deg, #ff5a1a, #ffb040); }
  .sd-bar.no.full i.f { animation: sdNoGlow .9s ease-in-out infinite alternate; }
  @keyframes sdNoGlow { to { filter: brightness(1.6); } }
  .sd-bar.cl i.f { background: linear-gradient(90deg, #c9a227, #ffe27a); }
  .sd-bar em { position: absolute; inset: 0; display: grid; place-items: center; font-style: normal; font-size: 9px; line-height: 1; font-weight: 600; color: #fff; text-shadow: 0 1px 2px #000; font-variant-numeric: tabular-nums; }
  .sd-stats { display: flex; gap: 10px; font-size: 11.5px; font-weight: 600; font-variant-numeric: tabular-nums; }
  .sd-stats span { display: inline-flex; align-items: center; gap: 2px; }
  .sd-stats .ic { width: 15px; height: 15px; }
  .sd-stage { position: relative; aspect-ratio: 16 / 9; border-radius: 10px; overflow: hidden; border: 2px solid var(--sd-bronze-dim); box-shadow: 0 10px 30px rgba(0,0,0,.55); }
  .sd-scene { position: absolute; inset: 0; }
  /* sân đấu dùng chung (SAN_DAU): ảnh 4:3 phủ kín; máy tính khung 16:9 thì cắt bớt trên / dưới, giữ sàn đá */
  .sd-bgset { position: absolute; inset: 0; }
  .sd-bgset.mb { display: none; }
  .sd-bgset img.sd-bgimg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: center 60%; }
  .sd-bgset .sd-dusk { position: absolute; inset: 0; pointer-events: none;
    background: linear-gradient(180deg, rgba(14,18,40,.62) 0%, rgba(14,18,40,.45) 45%, rgba(14,18,40,.28) 100%); }
  .sd-scene svg { width: 100%; height: 100%; display: block; }
  .sd-vig { position: absolute; inset: 0; pointer-events: none; background: radial-gradient(90% 75% at 50% 55%, transparent 55%, rgba(0,0,0,.45)); }
  .sd-turn { position: absolute; top: 3%; left: 50%; transform: translateX(-50%); z-index: 150; padding: 4px 14px; border-radius: 999px; font-size: 12.5px; font-weight: 600; background: rgba(18,12,8,.78); border: 1px solid var(--sd-bronze-dim); color: var(--sd-paper-dim); white-space: nowrap; }
  .sd-turn.mine { color: var(--sd-gold); border-color: var(--sd-bronze); }
  .sd-place { position: absolute; bottom: 2.5%; left: 50%; transform: translateX(-50%); z-index: 150; font-size: 12.5px; color: rgba(243,230,204,.75); letter-spacing: 1px; text-shadow: 0 1px 3px #000; white-space: nowrap; pointer-events: none; }
  .sd-unit { position: absolute; width: calc(var(--sd-u) * .62); aspect-ratio: 3 / 4; transform: translate(-50%, -100%); display: grid; place-items: end center; }
  .sd-shadow { position: absolute; bottom: 0; left: 14%; right: 14%; height: 10%; border-radius: 50%; background: radial-gradient(closest-side, rgba(0,0,0,.55), transparent); transform: translateY(40%); }
  .sd-halo { position: absolute; left: 50%; bottom: 0; width: 125%; aspect-ratio: 3 / 1; transform: translate(-50%, 42%); border-radius: 50%; pointer-events: none;
    background: radial-gradient(ellipse at center, #fff 0%, var(--hc, #ffd84a) 22%, transparent 72%); mix-blend-mode: screen; animation: sdHalo 2.4s ease-in-out infinite; }
  @keyframes sdHalo { 0%, 100% { opacity: .55; transform: translate(-50%, 42%) scale(.92); } 50% { opacity: 1; transform: translate(-50%, 42%) scale(1); } }
  /* nội công không hệ: hào quang trắng rất mờ */
  .sd-halo.faint { background: radial-gradient(ellipse at center, rgba(255,255,255,.45) 0%, rgba(255,255,255,.18) 25%, transparent 70%); }
  /* vận công lúc vào trận: hào quang bừng sáng, tên nội công và hiệu ứng bay lên trên đầu */
  .sd-unit.sd-vc .sd-halo { animation: sdVcHalo 1.3s ease-out 1; }
  /* pháp trận nội công tuyệt học (SKILLS[x].circle): nằm phẳng dưới chân, mờ, xoay chậm; vào trận thì bừng to; mốc tầng phát động thì chớp sáng */
  .sd-circle { position: absolute; left: 50%; bottom: 0; width: 150%; aspect-ratio: 1; transform: translate(-50%, 50%) scaleY(.36); pointer-events: none; opacity: .6; }
  .sd-circle .ci { width: 100%; height: 100%; }
  .sd-circle img { width: 100%; height: 100%; display: block; animation: sdCircSpin 14s linear infinite; }
  @keyframes sdCircSpin { to { transform: rotate(360deg); } }
  .sd-unit.sd-vc .sd-circle { animation: sdCircOp 1.8s ease-out 1; }
  .sd-unit.sd-vc .sd-circle .ci { animation: sdCircFlare 1.8s ease-out 1; }
  @keyframes sdCircOp { 0%, 60% { opacity: 1; } 100% { opacity: .6; } }
  @keyframes sdCircFlare { 0% { transform: scale(.3); filter: brightness(1); } 35% { transform: scale(1.6); filter: brightness(1.8); } 60% { transform: scale(1.5); filter: brightness(1.5); } 100% { transform: scale(1); filter: brightness(1); } }
  /* Minh Vương Ấn còn tác dụng: chuông đồng mờ trùm quanh người (ảnh fx_minh_vuong.png), thở nhẹ; trúng đòn thì engine cho lóe sáng */
  /* cùng cỡ, cùng chỗ với chuông lúc rơi xuống (K.minhvuong: cạnh ảnh = 1,75 × chiều cao người, tâm ảnh cao hơn chân 0,36 cạnh) */
  .sd-bell { position: absolute; left: 50%; bottom: -24.5%; height: 175%; aspect-ratio: 1; transform: translateX(-50%); pointer-events: none; z-index: 3; }
  .sd-bell img { width: 100%; height: 100%; display: block; opacity: .5; animation: sdBell 2.6s ease-in-out infinite; }
  @keyframes sdBell { 50% { opacity: .7; filter: brightness(1.25); } }
  /* Chiến Long Tại Dã còn tác dụng (engine LONG_HTML): vòng rồng vàng fx_chien_long.png bóp dẹt nằm ngang thắt lưng, ảnh xoay chậm nên rồng lượn
     quanh người. Hai nửa: .back cắt nửa trên của vòng (phía sau người) nằm dưới hình nhân vật, .front cắt nửa dưới (phía trước) che trước người.
     clip-path tính trước khi bóp dẹt nên "nửa trên ảnh vuông" = nửa sau của vòng. */
  .sd-lg { position: absolute; left: 50%; bottom: 40%; width: 165%; aspect-ratio: 1; transform: translate(-50%, 50%) scaleY(.3); pointer-events: none; }
  .sd-lg.back { z-index: -1; clip-path: inset(0 0 50% 0); }
  .sd-lg.front { z-index: 3; clip-path: inset(50% 0 0 0); }
  .sd-lg img { width: 100%; height: 100%; display: block; opacity: .75; animation: sdLgSpin 7s linear infinite; }
  @keyframes sdLgSpin { to { transform: rotate(-360deg); } }
  /* vòng khí vàng (fx_vong_khi.png): quay nhanh ngược chiều; .outer = to hơn, bao ngoài vòng rồng */
  .sd-lg.khi img { animation-duration: 3.2s; animation-direction: reverse; opacity: .8; }
  .sd-lg.outer { width: 200%; }
  /* kiểu 'quanh': vòng khí dựng đứng sau lưng (z -1), tâm vòng ở giữa thân, cao 125% người nên nhân vật nằm gọn bên trong; xoay chậm */
  /* Phật Quang Phổ Chiếu (bộ Như Lai) còn tác dụng: vòng Phật quang trùm người, mờ, thở chậm như chuông Minh Vương */
  .sd-pc { position: absolute; left: 50%; bottom: -16%; height: 150%; aspect-ratio: 1; transform: translateX(-50%); pointer-events: none; z-index: 3; }
  .sd-pc img { width: 100%; height: 100%; display: block; opacity: .6; animation: sdBell 2.6s ease-in-out infinite; }
  .sd-lk { position: absolute; left: 50%; bottom: -12.5%; height: 125%; aspect-ratio: 1; transform: translateX(-50%); z-index: -1; pointer-events: none; }
  .sd-lk img { width: 100%; height: 100%; display: block; opacity: .85; animation: sdLgSpin 6s linear infinite; }
  .sd-unit.sd-cflash .sd-circle { animation: sdCircOp 1.1s ease-out 1; }
  .sd-unit.sd-cflash .sd-circle .ci { animation: sdCircFlash 1.1s ease-out 1; }
  @keyframes sdCircFlash { 0% { transform: scale(1); filter: brightness(1); } 30% { transform: scale(1.35); filter: brightness(2.6); } 100% { transform: scale(1); filter: brightness(1); } }
  @keyframes sdVcHalo { 0% { opacity: .4; transform: translate(-50%, 42%) scale(.7); } 35% { opacity: 1; transform: translate(-50%, 42%) scale(1.45); filter: brightness(1.6); } 100% { opacity: .7; transform: translate(-50%, 42%) scale(1); } }
  .sd-vc-txt { position: absolute; left: 50%; bottom: 100%; z-index: 230; transform: translateX(-50%); display: flex; flex-direction: column; align-items: center; gap: 3px; pointer-events: none; }
  .sd-vc-txt span { white-space: nowrap; font-size: 12px; font-weight: 600; padding: 2px 9px; border-radius: 999px; background: rgba(18,12,8,.8); border: 1px solid var(--vc, #fff6dc); color: #fff6dc; opacity: 0;
    animation: sdVcTxt 2.4s ease-out forwards; }
  .sd-vc-txt span.nm { font-size: 13.5px; color: var(--vc, #fff6dc); }
  @keyframes sdVcTxt { 0% { opacity: 0; transform: translateY(8px); } 15% { opacity: 1; transform: translateY(0); } 80% { opacity: 1; } 100% { opacity: 0; transform: translateY(-14px); } }
  .sd-aura { position: absolute; left: 50%; bottom: 0; width: 170%; aspect-ratio: 1; transform: translate(-50%, 50%) scaleY(.32); pointer-events: none; }
  .sd-aura svg { width: 100%; height: 100%; overflow: visible; animation: sdSpin 14s linear infinite; }
  .sd-aura-glow { position: absolute; inset: 18%; border-radius: 50%; background: radial-gradient(closest-side, rgba(255,250,235,.85), rgba(255,236,190,.35) 55%, transparent); animation: sdAuraPulse 2.4s ease-in-out infinite; }
  @keyframes sdSpin { to { transform: rotate(360deg); } }
  @keyframes sdAuraPulse { 50% { opacity: .55; } }
  .sd-art { position: relative; width: 100%; height: 100%; transform-origin: 50% 96%; }
  .sd-art > svg, .sd-art .ic { width: 100%; height: 100%; display: block; }
  .sd-unit.boss .sd-art { filter: drop-shadow(0 0 14px rgba(255,80,60,.35)); }
  .sd-breath { width: 100%; height: 100%; transform-origin: 50% 96%; animation: sdBreathe 2.6s ease-in-out infinite; }
  .sd-breath > svg { width: 100%; height: 100%; display: block; }
  .sd-breath.layered { animation: none; }
  .sd-unit.en .sd-breath { animation-duration: 3.1s; animation-delay: -.8s; }
  .sd-unit.boss .sd-breath { animation-name: sdBreatheBig; }
  @keyframes sdBreathe { 0%, 100% { transform: scale(1, 1) translateY(0); } 50% { transform: scale(.985, 1.03) translateY(-1%); } }
  @keyframes sdBreatheBig { 0%, 100% { transform: scale(1, 1); } 50% { transform: scale(1.02, 1.035) translateY(-1.2%); } }
  .sd-l-body, .sd-l-head, .sd-l-hair, .sd-l-under { transform-box: fill-box; }
  .sd-l-body { transform-origin: 50% 100%; animation: sdLBreathe 2.6s ease-in-out infinite; }
  .sd-l-head { transform-origin: 50% 90%; animation: sdLBob 2.6s ease-in-out infinite; }
  .sd-l-hair { transform-origin: 50% 0%; animation: sdLSway 3.1s ease-in-out infinite; }
  .sd-l-under { transform-origin: 50% 50%; animation: sdLSwayW 2.6s ease-in-out infinite; }
  @keyframes sdLBreathe { 0%, 100% { transform: scaleY(1); } 50% { transform: scaleY(1.025) scaleX(.99); } }
  @keyframes sdLBob { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-3px) rotate(-1.2deg); } }
  @keyframes sdLSway { 0%, 100% { transform: rotate(-1.5deg); } 50% { transform: rotate(1.8deg); } }
  @keyframes sdLSwayW { 0%, 100% { transform: rotate(-1.5deg); } 50% { transform: rotate(1.5deg); } }
  .sd-unit.dead { pointer-events: none; animation: sdVanish .5s ease-in forwards; }
  /* Đã gục từ trước khi vẽ lại màn: ẩn hẳn, không chạy lại cảnh tan biến (tránh nhấp nháy mỗi lượt) */
  .sd-unit.dead.gone { animation: none; opacity: 0; visibility: hidden; }
  .sd-unit[onclick] { cursor: pointer; }
  /* Trận đông người: vòng vàng dưới chân kẻ đang bị chọn làm mục tiêu, thanh máu nhỏ trên đầu */
  .sd-ring-tgt { position: absolute; left: 50%; bottom: 0; width: 110%; aspect-ratio: 3 / 1; transform: translate(-50%, 42%); border-radius: 50%; border: 3px solid transparent; pointer-events: none; }
  .sd-unit.tgt .sd-ring-tgt { border-color: var(--sd-gold); box-shadow: 0 0 12px rgba(255,210,80,.7), inset 0 0 8px rgba(255,210,80,.5); }
  .sd-mhp { width: 46px; height: 6px; border-radius: 3px; background: rgba(18,12,8,.85); border: 1px solid rgba(0,0,0,.6); overflow: hidden; align-self: center; }
  .sd-mhp i { display: block; height: 100%; background: linear-gradient(#ff7b6b, #c92a1e); }  @keyframes sdVanish { 0% { opacity: 1; } 30% { opacity: 1; filter: brightness(2.2); } 100% { opacity: 0; visibility: hidden; filter: brightness(2.2); } }
  .sd-tag { position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%); display: flex; gap: 3px; z-index: 2; pointer-events: none; width: max-content; }
  .sd-st { display: flex; align-items: center; gap: 2px; padding: 1px 5px 1px 2px; border-radius: 999px; background: rgba(18,12,8,.85); border: 1px solid var(--sd-bronze-dim); font-size: 11px; font-weight: 700; color: var(--sd-paper); white-space: nowrap; }
  .sd-st .ic { width: 15px; height: 15px; }
  /* Biểu tượng hiệu ứng bằng ảnh (st_*, huy hiệu tròn có viền sẵn): to hơn, chip bỏ nền và viền */
  .sd-st:has(use[href^="#ic-st_"]) { padding: 0 4px 0 0; background: rgba(18,12,8,.7); border-color: transparent; font-size: 10px; }
  .sd-st:has(use[href^="#ic-st_"]) .ic { width: 17px; height: 17px; margin: -1px 0; }
  .sd-st-noithuong { border-color: #9b7bff; color: #d9ccff; }
  .sd-st-poison { border-color: #7ad151; } .sd-st-bleed, .sd-st-stun { border-color: #e0423a; }
  .sd-pop { position: absolute; z-index: 200; pointer-events: none; font-weight: 800; font-size: clamp(17px, 3.2vw, 27px); color: #ffffff; text-shadow: 0 2px 0 #000, 0 0 6px rgba(0,0,0,.9), 0 0 2px #000; transform: translate(-50%, -50%); white-space: nowrap; font-variant-numeric: tabular-nums; }
  .sd-pop.sd-pop-crit { color: var(--sd-gold); font-size: clamp(22px, 4.4vw, 38px); text-shadow: 0 2px 0 #5a3a00, 0 0 14px rgba(255,200,60,.9), 0 0 2px #000; }
  .sd-pop.sd-pop-heal { color: #b6f28f; text-shadow: 0 2px 0 #1d4a0c, 0 0 10px rgba(120,220,90,.7); }
  .sd-pop.sd-pop-miss { color: #d8e6f2; font-size: clamp(15px, 2.6vw, 21px); text-shadow: 0 2px 0 #223, 0 0 8px rgba(160,200,255,.6); }
  .sd-pop.sd-pop-poison { color: #a6ef7a; }
  .sd-pop .ic { width: 1.2em; height: 1.2em; }
  .sd-spark { position: absolute; width: 28%; pointer-events: none; z-index: 5; animation: sdRise 1.4s ease-out forwards; }
  .sd-spark svg { width: 100%; display: block; }
  @keyframes sdRise { 0% { opacity: 0; transform: translateY(0) scale(.6); } 20% { opacity: 1; transform: translateY(-8px) scale(1); } 100% { opacity: 0; transform: translateY(-70px) scale(.9); } }
  .sd-cutin { position: absolute; inset: 0; z-index: 220; overflow: hidden; pointer-events: none; background: rgba(8,4,2,.72); }
  .sd-lines { position: absolute; inset: 0; opacity: .5; background: repeating-linear-gradient(180deg, transparent 0 9px, rgba(255,255,255,.16) 9px 11px, transparent 11px 23px, rgba(255,255,255,.08) 23px 24px); }
  .sd-cutin .sd-who { position: absolute; bottom: -38%; height: 150%; aspect-ratio: 3 / 4; display: block; filter: drop-shadow(0 0 18px rgba(0,0,0,.6)); }
  .sd-cutin.pl .sd-who { left: -4%; } .sd-cutin.en .sd-who { right: -4%; }
  .sd-cutin .sd-who svg { width: 100%; height: 100%; }
  .sd-band { position: absolute; top: 54%; height: 26%; width: 92%; }
  .sd-cutin.pl .sd-band { right: -2%; } .sd-cutin.en .sd-band { left: -2%; }
  .sd-band svg { position: absolute; inset: 0; width: 100%; height: 100%; }
  .sd-band b { position: absolute; inset: 0; display: grid; place-items: center; font-family: var(--sd-brush); font-weight: 400; font-size: clamp(24px, 6vw, 50px); color: #fff8ec; white-space: nowrap; text-shadow: 0 0 2px #000, 3px 3px 0 #b3261e; }
  .sd-cutin.pl .sd-band b { padding-left: 18%; } .sd-cutin.en .sd-band b { padding-right: 18%; }
  .sd-log { display: grid; grid-template-columns: 1fr auto; gap: 10px; align-items: start; padding: 7px 12px; border-radius: 8px; background: var(--sd-lacquer); border: 1px solid #3b2a1e; }
  .sd-lines-log { min-width: 0; display: grid; gap: 1px; font-size: 12px; line-height: 1.4; color: var(--sd-paper-dim); }
  .sd-lines-log > div:last-child { color: var(--sd-paper); }
  .sd-lines-log .pname { color: #9ec8ff; } .sd-lines-log .ename { color: #ff9a7e; } .sd-lines-log .skill { color: var(--sd-gold); }
  .sd-lines-log .dmg { color: #ffb3a0; } .sd-lines-log .heal { color: #b6f28f; } .sd-lines-log .crit { color: var(--sd-gold); }
  .sd-log.open .sd-lines-log { max-height: 240px; overflow-y: auto; }
  .sd-lines-log .ic { width: 1.2em; height: 1.2em; }
  .sd-link { background: none; border: 1px solid var(--sd-bronze-dim); border-radius: 6px; padding: 3px 9px; font-size: 12px; color: var(--sd-bronze); cursor: pointer; font-family: inherit; }
  .sd-actions { display: grid; gap: 8px; padding: 10px 12px 12px; border-radius: 12px; background: linear-gradient(180deg, var(--sd-lacquer2), var(--sd-lacquer)); border: 1px solid #4a3424; }
  .sd-actions.busy button { pointer-events: none; }
  .sd-skills { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; justify-items: center; }
  .sd-sk { position: relative; width: 66px; display: grid; justify-items: center; gap: 4px; background: none; border: 0; padding: 0; cursor: pointer; color: var(--sd-paper); font-family: inherit; }
  .sd-ring { width: 54px; height: 54px; border-radius: 50%; display: grid; place-items: center; background: #1a110b; box-shadow: 0 0 0 2px var(--sd-bronze-dim), 0 4px 10px rgba(0,0,0,.5); transition: transform .12s, box-shadow .12s; }
  .sd-ring .ic { width: 48px; height: 48px; }
  .sd-sk:hover:not(:disabled) .sd-ring { transform: translateY(-3px); box-shadow: 0 0 0 2px var(--sd-gold), 0 0 18px rgba(255,200,90,.45); }
  .sd-sk:active:not(:disabled) .sd-ring { transform: scale(.96); }
  .sd-sk .nm { font-size: 11px; font-weight: 600; line-height: 1.2; text-align: center; }
  .sd-cost { position: absolute; top: 36px; right: 0; padding: 1px 6px; border-radius: 999px; background: #10284a; border: 1px solid #3b7fd6; font-size: 11px; font-weight: 700; color: #cfe3ff; }
  .sd-sk:disabled { cursor: not-allowed; }
  .sd-sk:disabled .sd-ring { filter: grayscale(.85) brightness(.55); }
  .sd-sk:disabled .nm { color: var(--sd-paper-dim); }
  .sd-why { position: absolute; top: 6px; left: 50%; transform: translateX(-50%); z-index: 1; width: 62px; padding: 2px 3px; border-radius: 6px; background: rgba(20, 10, 6, .82); font-size: 10.5px; line-height: 1.15; font-weight: 700; text-align: center; color: #ffb3a0; text-shadow: 0 1px 2px #000; }
  .sd-minor { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; }
  .sd-mb { display: flex; align-items: center; gap: 6px; padding: 7px 8px; border-radius: 8px; background: #1a110b; border: 1px solid #4a3424; font-size: 13px; font-weight: 600; cursor: pointer; text-align: left; color: var(--sd-paper); font-family: inherit; min-width: 0; }
  .sd-mb .ic { width: 22px; height: 22px; flex: none; }
  .sd-mb small { display: block; font-size: 10.5px; font-weight: 500; color: var(--sd-paper-dim); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .sd-mb > span { min-width: 0; }
  .sd-mb:hover:not(:disabled) { border-color: var(--sd-bronze); }
  .sd-mb:disabled { opacity: .45; cursor: not-allowed; }
  .sd-result { position: fixed; inset: 0; z-index: 300; display: grid; place-items: center; background: rgba(10,6,3,.97); overflow-y: auto;
    padding: calc(16px + env(safe-area-inset-top, 0px)) max(16px, env(safe-area-inset-right, 0px)) calc(16px + env(safe-area-inset-bottom, 0px)) max(16px, env(safe-area-inset-left, 0px)); }
  .sd-card { width: min(100%, 460px); display: grid; gap: 10px; justify-items: center; }
  .sd-banner { position: relative; width: 100%; height: clamp(70px, 15vw, 110px); }
  .sd-banner svg { position: absolute; inset: 0; width: 100%; height: 100%; }
  .sd-banner h2 { position: absolute; inset: 0; margin: 0; display: grid; place-items: center; font-family: var(--sd-brush); font-weight: 400; font-size: clamp(34px, 8vw, 62px); color: var(--sd-gold); text-shadow: 0 2px 0 #3a1800, 0 0 22px rgba(255,190,60,.55); }
  .sd-result.lose .sd-banner h2 { color: #efe4d8; text-shadow: 0 2px 0 #1a0000, 0 0 18px rgba(200,40,30,.6); }
  .sd-rew { width: 100%; display: grid; gap: 4px; padding: 10px 14px; border-radius: 8px; background: rgba(24,15,10,.95); border: 1px solid var(--sd-bronze); font-size: 13.5px; line-height: 1.45; color: var(--sd-paper); }
  .sd-rew .ic { width: 1.3em; height: 1.3em; }
  .sd-sum { width: 100%; display: grid; grid-template-columns: max-content 1fr; gap: 3px 16px; padding: 10px 14px; border-radius: 8px; background: rgba(24,15,10,.95); border: 1px solid var(--sd-bronze-dim); font-size: 13px; color: var(--sd-paper); }
  .sd-sum span { color: var(--sd-paper-dim); }
  .sd-sum b { text-align: right; font-variant-numeric: tabular-nums; }
  .sd-sum .hd { grid-column: 1 / -1; color: var(--sd-bronze); letter-spacing: 1px; font-size: 12.5px; border-bottom: 1px solid #3b2a1e; padding-bottom: 4px; margin-bottom: 2px; }
  .sd-amb { animation: sdDrift linear infinite; }
  @keyframes sdDrift { from { transform: translate(0, -20px); } to { transform: translate(var(--dx, 20px), 600px); } }
  .sd-flick { animation: sdFlick 1.4s ease-in-out infinite alternate; transform-origin: 50% 100%; transform-box: fill-box; }
  @keyframes sdFlick { from { transform: scaleY(.9) scaleX(1.05); opacity: .85; } to { transform: scaleY(1.12) scaleX(.95); opacity: 1; } }
  .sd-lava { animation: sdLavaPulse 3.2s ease-in-out infinite; }
  @keyframes sdLavaPulse { 0%, 100% { opacity: .35; } 50% { opacity: .85; } }
  @media (max-width: 600px) {
    .sd-wrap { --sd-u: 21%; }
    .sd-stage { aspect-ratio: 4 / 3; }
    .sd-bgset.mb { display: block; } .sd-bgset.pc { display: none; } /* sân đấu: điện thoại dùng ảnh 4:3 */
    .sd-huds { gap: 6px; }
    .sd-hud { padding: 5px 6px; gap: 6px; }
    .sd-face { width: 40px; height: 40px; }
    .sd-bar { height: 12px; }
    .sd-bar em { font-size: 10px; }
    .sd-link { min-height: 40px; padding: 6px 12px; }
    .sd-who b { font-size: 12.5px; }
    .sd-who span { display: none; }
    .sd-stats { gap: 5px; font-size: 10.5px; }
    .sd-stats span { gap: 1px; }
    .sd-stats .ic { width: 12px; height: 12px; }
    .sd-place { display: none; }
    .sd-turn { font-size: 11.5px; padding: 3px 10px; }
    .sd-mb { flex-direction: column; text-align: center; padding: 6px 4px; font-size: 12px; }
    .sd-mb small { display: none; }
  }
  @media (prefers-reduced-motion: reduce) {
    .sd-amb, .sd-flick, .sd-breath, .sd-aura svg, .sd-aura-glow, .sd-halo, .sd-circle img, .sd-bell img, .sd-pc img, .sd-lg img, .sd-lk img, .sd-l-body, .sd-l-head, .sd-l-hair, .sd-l-under, .sd-lava, .sd-spark { animation: none; }
    .sd-unit.dead { animation: none; visibility: hidden; }
    .sd-bar i { transition: none; }
  }`;
  document.head.appendChild(st);
}
