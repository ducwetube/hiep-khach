'use strict';
/* =================================================================
   HIỆP KHÁCH GIANG HỒ — BIỂU TƯỢNG
   -----------------------------------------------------------------
   Mọi biểu tượng trong game là hình SVG vẽ ở đây, cùng phong cách với
   hình chibi: viền mực nâu đậm, tô màu phẳng, một vệt sáng. Khung 48×48.
   Game KHÔNG dùng emoji.

   Cách dùng:
     - Trong chuỗi HTML ghi [[tên]], ví dụ '[[bac]] 100 lượng'.
       Màn hình nào cũng tự đổi [[tên]] thành hình (hàm iconize).
     - ic('tên') trả về đúng chuỗi '[[tên]]'.
     - Trường icon trong data.js ghi tên biểu tượng, ví dụ icon: 'thiet_kiem'.
   Thêm biểu tượng mới: thêm một dòng vào ICONS bên dưới (cùng nhóm).
   Xem toàn bộ: trang "Bảng Biểu Tượng" (link trong LIEN_KET.md).
   ================================================================= */

const ICONS = (() => {
  /* ---------- Bút vẽ ---------- */
  const K = '#3a2418'; // màu mực viền
  const P = (d, f) => `<path d="${d}" fill="${f || 'none'}"/>`;
  const C = (x, y, r, f) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${f || 'none'}"/>`;
  const E = (x, y, rx, ry, f) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${f || 'none'}"/>`;
  const L = (d, col, w) => `<path d="${d}" fill="none" stroke="${col || K}" stroke-width="${w || 2}"/>`;
  const H = (d, o) => `<path d="${d}" fill="#fff" stroke="none" opacity="${o || 0.5}"/>`;   // vệt sáng
  const S = (d, o) => `<path d="${d}" fill="${K}" stroke="none" opacity="${o || 0.16}"/>`; // vệt tối
  const R = (d, col, w, o) => `<path d="${d}" fill="none" stroke="${col}" stroke-width="${w || 1.4}" opacity="${o || 1}"/>`;
  const D = (d, col, w, dash) => `<path d="${d}" fill="none" stroke="${col}" stroke-width="${w || 1.4}" stroke-dasharray="${dash || '2 2.5'}"/>`;
  const EO = (d, f) => `<path d="${d}" fill="${f}" fill-rule="evenodd"/>`;
  const G = (t, s) => `<g transform="${t}">${s}</g>`;
  const glow = (x, y, r, col, o) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${col}" stroke="none" opacity="${o || 0.45}"/>`;
  // vòng tròn rỗng (dùng với EO)
  const hole = (x, y, r) => `M${x - r} ${y} a${r} ${r} 0 1 0 ${2 * r} 0 a${r} ${r} 0 1 0 ${-2 * r} 0 Z`;
  // sao lấp lánh 4 cánh
  const spark = (x, y, r, f) => P(`M${x} ${y - r} Q${x + r * 0.22} ${y - r * 0.22} ${x + r} ${y} Q${x + r * 0.22} ${y + r * 0.22} ${x} ${y + r} Q${x - r * 0.22} ${y + r * 0.22} ${x - r} ${y} Q${x - r * 0.22} ${y - r * 0.22} ${x} ${y - r} Z`, f || '#fff6c8');
  // sao 5 cánh
  function star5(cx, cy, ro, ri) {
    let d = '';
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? ri : ro;
      d += (i ? 'L' : 'M') + (cx + r * Math.cos(a)).toFixed(1) + ' ' + (cy + r * Math.sin(a)).toFixed(1);
    }
    return d + 'Z';
  }
  // bánh răng
  function gear(cx, cy, ro, ri, n) {
    let d = '';
    for (let i = 0; i < n * 4; i++) {
      const a = (i / (n * 4)) * Math.PI * 2, r = (i % 4 < 2) ? ro : ri;
      d += (i ? 'L' : 'M') + (cx + r * Math.cos(a)).toFixed(1) + ' ' + (cy + r * Math.sin(a)).toFixed(1);
    }
    return d + 'Z';
  }

  /* ---------- Bảng màu ---------- */
  const red = '#c8402f', redD = '#8e1f1a', gold = '#e6ad35', goldL = '#f5d47a', jade = '#3f9b6e',
    blue = '#3d72b4', blueL = '#9cc3ea', steel = '#c3ccd4', iron = '#5b6570', wood = '#a0673a',
    woodD = '#6b4a2f', leather = '#8b5a35', paper = '#f4e6c4', skin = '#f3cba4', tan = '#e2a97c',
    green = '#6caa4c', greenL = '#8fd16a', greenD = '#3f7a34', pink = '#f2a7bd', purple = '#7e52a6',
    black = '#2a2228', white = '#f6f3ec', snow = '#eaf3fa', orange = '#e07a2c', roof = '#3c4a5a';

  /* ---------- Mẫu vẽ dùng chung ---------- */
  // Kiếm đặt chéo, chuôi ở góc dưới trái
  function sword(o) {
    const blade = {
      dao: 'M15.2 29.2 Q27 17 33 9 Q37 5.5 43 4.5 Q41.5 11 34.5 17 Q27 24 18.8 32.8 Z',
      broad: 'M13.8 27.8 L36.6 5 L43 5 L43 11.4 L20.2 34.2 Z',
      wood: 'M15.2 29.2 L36.8 7.6 Q40.6 4.8 42 6 Q43.2 7.4 40.4 11.2 L18.8 32.8 Z',
    }[o.kind] || 'M15.2 29.2 L36.2 8.2 L42.5 5.5 L39.8 11.8 L18.8 32.8 Z';
    const line = o.kind === 'dao' ? R('M18.5 30 Q28 21 35 11', '#fff', 1.3, 0.7)
      : o.kind === 'wood' ? R('M18 30 L37 11', '#7a4a22', 1.2, 0.6) : R('M17.6 30.4 L39.6 8.4', '#fff', 1.3, 0.75);
    return (o.tassel ? L('M7 42.5 Q4.5 45 5.5 47.5', o.tassel, 2.4) + L('M8.4 43 Q8.4 45.8 9.8 47.6', o.tassel, 2.4) : '')
      + (o.glow ? glow(30, 18, 13, o.glow, 0.35) : '')
      + P(blade, o.blade) + line
      + P('M14.2 31.2 L16.8 33.8 L10.3 40.3 L7.7 37.7 Z', o.hilt)
      + L('M12 33.4 L14.6 36', K, 1.3) + L('M9.8 35.6 L12.4 38.2', K, 1.3)
      + P(o.wide ? 'M12.8 23.8 L24.2 35.2 L21.4 38 L10 26.6 Z' : 'M13.9 25.1 L22.9 34.1 L20.1 36.9 L11.1 27.9 Z', o.guard)
      + (o.gem ? C(17, 31, 2.2, o.gem) : '')
      + C(7.2, 40.8, 2.6, o.pommel || o.guard)
      + (o.sparks ? spark(32, 26, 3.6) + spark(41, 18, 2.4) : '');
  }
  const swordR = o => G('translate(48 0) scale(-1 1)', sword(o));
  // Áo choàng cổ giao lĩnh
  function robe(body, trim, belt, extra) {
    return P('M17 6 L24 11 L31 6 L40 11 L45 22 L39 26 L35 19 L35 43 L13 43 L13 19 L9 26 L3 22 L8 11 Z', body)
      + (extra || '')
      + L('M17 6.5 L28 25', trim, 3.2) + L('M31 6.5 L24 14', trim, 3.2)
      + P('M13 26 H35 V31 H13 Z', belt)
      + L('M4.6 21 L9.6 23.8', trim, 2.4) + L('M43.4 21 L38.4 23.8', trim, 2.4)
      + H('M15 20 L16 40 L18 40 L17.4 21 Z', 0.3);
  }
  // Áo chẽn không tay (giáp mềm)
  const vest = (f, extra) => P('M15 6 L24 12 L33 6 L39 12 L37 43 H11 L9 12 Z', f) + (extra || '');
  function pants(col, band, extra) {
    return P('M12 9 H36 L39 43 H27.5 L24 21 L20.5 43 H9 Z', col) + (extra || '')
      + P('M11.6 7 H36.4 V13 H11.6 Z', band) + L('M24 13 L22 19', band, 2) + L('M24 13 L26.5 18.5', band, 2)
      + R('M10 38.5 H20.8 M27.2 38.5 H38.6', K, 1.2, 0.45) + H('M14 15 L12 36 L14 36 L16 15 Z', 0.28);
  }
  function boot(col, cuff, sole, extra) {
    return P('M14 5 H28 L29 27 Q36 29 41 31.5 Q45 34 44.5 38.5 H12 L13 24 Z', col) + (extra || '')
      + P('M13 5 H29 V11 H13 Z', cuff) + P('M11 38 H45.5 Q45.5 43 41.5 43 H11 Z', sole)
      + H('M16 13 L17 34 L19 34 L18.5 13 Z', 0.3);
  }
  // Nhẫn: vòng + đá
  function ring(band, gem, cut, extra) {
    const stone = {
      round: C(24, 15, 6.5, gem) + H('M20.5 13 Q21.5 10 25 9.8 Q21.8 12 21.8 15 Z', 0.6),
      oval: E(24, 15, 8, 6, gem) + H('M18.5 14 Q19.5 10.5 24 10 Q20.5 12 20.5 15 Z', 0.55),
      cut: P('M16.5 15 L20.5 8.5 H27.5 L31.5 15 L24 23 Z', gem) + R('M16.5 15 H31.5 M20.5 8.5 L22.5 15 L24 23 M27.5 8.5 L25.5 15 L24 23', K, 1, 0.45),
      drop: P('M24 5 Q30.5 12.5 30.5 16.5 A6.5 6.5 0 0 1 17.5 16.5 Q17.5 12.5 24 5 Z', gem) + H('M21 15 Q21 12 23.5 9.5 Q22.5 13 22.6 16 Z', 0.55),
    }[cut];
    return EO('M11 31 a13 11 0 1 0 26 0 a13 11 0 1 0 -26 0 Z M16 32 a8 6.5 0 1 0 16 0 a8 6.5 0 1 0 -16 0 Z', band)
      + H('M13.4 29 Q14.5 23.5 20 21.6 Q16 25.5 15.6 31 Z', 0.45)
      + P('M18 20 H30 L28 25 H20 Z', band) + (extra || '') + stone;
  }
  // Ngọc bội: dây treo, mặt ngọc, tua
  function pendant(jade, tassel, shape, extra) {
    const face = {
      disc: EO(hole(24, 24, 10) + hole(24, 24, 3), jade) + H('M16.5 21 Q17.5 15.5 23 14.8 Q19 18 19 22 Z', 0.55),
      shield: P('M24 13.5 L34.5 18.5 Q34.5 29.5 24 34.5 Q13.5 29.5 13.5 18.5 Z', jade) + R('M24 17.5 L30.5 20.5 Q30.5 27.5 24 30.5 Q17.5 27.5 17.5 20.5 Z', '#fff', 1.2, 0.55) + C(24, 23.5, 2.2, gold),
      open: EO(hole(24, 24, 10) + hole(24, 24, 2.4) + hole(24, 17.6, 1.8) + hole(30.4, 24, 1.8) + hole(24, 30.4, 1.8) + hole(17.6, 24, 1.8), jade) + H('M16.5 21 Q17.5 15.5 23 14.8 Q19 18 19 22 Z', 0.5),
      crystal: glow(24, 24, 15, '#cfe8ff', 0.6) + P('M24 12.5 L33.5 18 L33.5 30 L24 35.5 L14.5 30 L14.5 18 Z', jade) + R('M24 12.5 V35.5 M14.5 18 L33.5 30 M33.5 18 L14.5 30', '#fff', 1, 0.6) + spark(36, 12, 3),
    }[shape];
    return L('M24 1.5 L24 10', red, 2) + P('M24 8.2 L27 11.2 L24 14.2 L21 11.2 Z', red)
      + L('M21.6 36 L20 46.5', tassel, 2.6) + L('M24 36 L24 47', tassel, 2.6) + L('M26.4 36 L28 46.5', tassel, 2.6)
      + face + (extra || '') + C(24, 35.4, 2.6, gold);
  }
  function pill(x, y, r, col) {
    return C(x, y, r, col) + H(`M${x - r * 0.62} ${y - r * 0.2} Q${x - r * 0.5} ${y - r * 0.8} ${x + r * 0.05} ${y - r * 0.85} Q${x - r * 0.35} ${y - r * 0.45} ${x - r * 0.4} ${y + r * 0.05} Z`, 0.65);
  }
  // Đan dược hồi dần (máu + nội lực mỗi lượt): viên đan đặt trên làn mây, hai dải khí bốc lên; màu lên theo bậc
  function regenPill(col, aura, extra) {
    return glow(24, 21, 15, aura, 0.45) + R('M9 33 Q5.5 25 10 17 M39 33 Q42.5 25 38 17', aura, 2.2, 0.9)
      + cloud(24, 39, 1.15, '#f6f2e8') + pill(24, 23, 10, col) + (extra || '')
      + spark(10, 12, 2.4, aura) + spark(38.5, 11, 2.4, aura);
  }
  // giọt sương
  const drop = (x, y, s, col) => P(`M${x} ${y - 4 * s} Q${x + 3 * s} ${y} ${x} ${y + 3 * s} Q${x - 3 * s} ${y} ${x} ${y - 4 * s} Z`, col);
  // tấm da thú trải phẳng: đầu có tai, bốn chân, đuôi
  function pelt(col, mark) {
    return P('M24 47 Q22 42 23 38 H25 Q26 42 24 47 Z', col)
      + P('M19 6 L17 2 L21.5 4.6 Q24 4 26.5 4.6 L31 2 L29 6 Q33 9 32 13 Q37 13 40 9 L44 11 L39.5 17 Q37 20 36.5 24 Q37 30 39.5 33 L44 38 L40 40 Q36.5 35.5 32 35 Q30 39 24 40 Q18 39 16 35 Q11.5 35.5 8 40 L4 38 L8.5 33 Q11 30 11.5 24 Q11 20 8.5 17 L4 11 L8 9 Q11 13 16 13 Q15 9 19 6 Z', col)
      + P('M17 15 Q24 12 31 15 Q33 24 30.5 33 Q24 35.5 17.5 33 Q15 24 17 15 Z', mark)
      + R('M20 18 L19 22 M24 17 V22 M28 18 L29 22 M19.5 26 L19 30 M24 26 V31 M28.5 26 L29 30', K, 1, 0.3);
  }
  // Bí kíp: cuộn tranh treo
  function scroll(ribbon, seal) {
    return P('M10 11 H38 V37 H10 Z', paper) + R('M15 17 H33 M15 22 H33 M15 27 H26', '#8a7458', 1.4, 0.7)
      + P('M7 8 H41 Q43 9.5 41 11 H7 Q5 9.5 7 8 Z', leather) + P('M7 36 H41 Q43 37.5 41 39 H7 Q5 37.5 7 36 Z', leather)
      + P('M29 26 H35 V32 H29 Z', seal || red) + L('M24 39 L20.5 47', ribbon, 2.6) + L('M24 39 L27.5 47', ribbon, 2.6);
  }
  function pine(x, y, s, col) {
    return P(`M${x - 1.6 * s} ${y} V${y - 6 * s} H${x + 1.6 * s} V${y} Z`, woodD)
      + P(`M${x} ${y - 21 * s} L${x - 9 * s} ${y - 5 * s} H${x + 9 * s} Z`, col)
      + P(`M${x} ${y - 31 * s} L${x - 6.5 * s} ${y - 15 * s} H${x + 6.5 * s} Z`, col);
  }
  const maple = col => P('M24 4 L27 12 L33 9 L31 17 L40 15 L36 22 L42 26 L33 28 L35 35 L27 31 L25 36 H23 L21 31 L13 35 L15 28 L6 26 L12 22 L8 15 L17 17 L15 9 L21 12 Z', col)
    + R('M24 10 V33 M24 25 L33 19 M24 25 L15 19 M24 30 L31 30 M24 30 L17 30', '#9a3a16', 1.1, 0.7);
  function cloud(x, y, s, f) {
    return G(`translate(${x} ${y}) scale(${s})`, P('M-10 4 Q-15 4 -14 -1 Q-13 -5 -8 -4 Q-7 -10 0 -10 Q7 -10 8 -4 Q14 -5 14 0 Q14 4 10 4 Z', f || '#fbf8f1'));
  }
  const house = (x, y, w, h, wall, rf) => P(`M${x} ${y} H${x + w} V${y + h} H${x} Z`, wall)
    + P(`M${x - 3} ${y + 1} L${x + w / 2} ${y - h * 0.9} L${x + w + 3} ${y + 1} Z`, rf);

  /* ---------- Chân dung (NPC, quái hình người) ---------- */
  const bust = (robeCol, trim) => P('M5 48 Q6 37 24 36 Q42 37 43 48 Z', robeCol) + (trim ? L('M17 37.5 L24 46 L31 37.5', trim, 2.6) : '');
  const head = sk => E(12.6, 25, 2.2, 3.2, sk || skin) + E(35.4, 25, 2.2, 3.2, sk || skin) + E(24, 24, 11.5, 12.5, sk || skin);
  const eye = {
    dot: C(19.5, 25, 1.7, K) + C(28.5, 25, 1.7, K),
    stern: L('M16.5 21.5 L22 22.6', K, 1.8) + L('M31.5 21.5 L26 22.6', K, 1.8) + C(19.5, 25.2, 1.6, K) + C(28.5, 25.2, 1.6, K),
    old: L('M17 25 Q19.5 23.5 22 25', K, 1.6) + L('M26 25 Q28.5 23.5 31 25', K, 1.6),
    shut: L('M17 25 Q19.5 27 22 25', K, 1.6) + L('M26 25 Q28.5 27 31 25', K, 1.6),
    angry: L('M16 20 L22.5 23', K, 2.2) + L('M32 20 L25.5 23', K, 2.2) + C(19.8, 25.6, 1.6, K) + C(28.2, 25.6, 1.6, K),
    evil: L('M16 21 L22.5 23.5', K, 2) + L('M32 21 L25.5 23.5', K, 2) + P('M17.5 25.6 L22.2 24.6 L21 27.2 Z', '#ff4a32') + P('M30.5 25.6 L25.8 24.6 L27 27.2 Z', '#ff4a32'),
    lady: P('M17 25 Q19.5 22.5 22 25 Q19.5 26.6 17 25 Z', K) + P('M26 25 Q28.5 22.5 31 25 Q28.5 26.6 26 25 Z', K) + L('M16.2 24 L15 22.6', K, 1.2) + L('M31.8 24 L33 22.6', K, 1.2),
  };
  const mouth = {
    line: L('M21.5 31.2 H26.5', K, 1.6),
    smile: L('M21 30.4 Q24 33.2 27 30.4', K, 1.6),
    frown: L('M21 32.2 Q24 30.2 27 32.2', K, 1.6),
  };
  const beardLong = col => P('M16 30 Q17 44 24 46.5 Q31 44 32 30 Q28 33.5 24 33.5 Q20 33.5 16 30 Z', col);
  const beardShort = col => P('M14.5 26.5 Q15.5 37 24 38 Q32.5 37 33.5 26.5 Q30.5 32.5 24 32.5 Q17.5 32.5 14.5 26.5 Z', col);
  const mustache = col => P('M19 30.6 Q24 27.8 29 30.6 Q26.5 31.6 24 30.7 Q21.5 31.6 19 30.6 Z', col);
  const capHair = col => P('M12.5 23 Q11.5 11 24 11 Q36.5 11 35.5 23 Q33 16.5 24 16 Q15 16.5 12.5 23 Z', col);
  const hood = (col, edge) => P('M9.5 34 Q8 8 24 7.5 Q40 8 38.5 34 L34.5 33 Q34.5 15.5 24 15.5 Q13.5 15.5 13.5 33 Z', col) + (edge ? R('M13.5 33 Q13.5 15.5 24 15.5 Q34.5 15.5 34.5 33', edge, 1.6) : '');
  const maskLow = col => P('M13.4 26 Q24 29.5 34.6 26 Q34 36.5 24 37.5 Q14 36.5 13.4 26 Z', col);

  /* ---------- Thú ---------- */
  function wolf(col, light, eyeCol) {
    return P('M8 22 L3.5 31 L12.5 32 Z', col) + P('M40 22 L44.5 31 L35.5 32 Z', col)
      + P('M10.5 5 L19.5 15 L11.5 20 Z', col) + P('M37.5 5 L28.5 15 L36.5 20 Z', col)
      + P('M12.4 9.4 L17.2 15 L13.4 17 Z', '#e9b3a4') + P('M35.6 9.4 L30.8 15 L34.6 17 Z', '#e9b3a4')
      + P('M8 22 Q10 12 24 12 Q38 12 40 22 L36 34 Q30 44 24 44 Q18 44 12 34 Z', col)
      + P('M17 30 Q17 23.5 24 23.5 Q31 23.5 31 30 Q31 40.5 24 41.5 Q17 40.5 17 30 Z', light)
      + P('M21.4 29.5 H26.6 L24 32.6 Z', K) + L('M24 32.6 V35.5 M21 37 Q24 38.6 27 37', K, 1.3)
      + P('M14 21.5 L20.6 23.2 L18.4 25.8 Z', eyeCol) + P('M34 21.5 L27.4 23.2 L29.6 25.8 Z', eyeCol)
      + C(18.6, 23.8, 0.9, K) + C(29.4, 23.8, 0.9, K) + R('M24 13 V19 M21 14 L22 18 M27 14 L26 18', K, 1.1, 0.4);
  }

  // Bọ cạp nhìn từ trên: hai càng giơ trước, đuôi cong sang phải, ngòi độc chĩa vào trong
  function scorpion(col, dark, crest) {
    return R('M17 30 L8 26 M17 33 L7 34 M17 36 L9 41 M31 30 L40 26 M31 33 L41 34 M31 36 L39 41', K, 3.4)
      + R('M17 30 L8 26 M17 33 L7 34 M17 36 L9 41 M31 30 L40 26 M31 33 L41 34 M31 36 L39 41', dark, 1.8)
      + L('M24 39 Q24 46.5 32 45.5 Q42.5 44 42.5 33.5 Q42.5 25 36 21', K, 7) + L('M24 39 Q24 46.5 32 45.5 Q42.5 44 42.5 33.5 Q42.5 25 36 21', col, 4.6)
      + R('M27 45.6 L28 43 M33 45 L33.6 42.6 M38.6 42 L40.6 40.4 M41.6 36 L44 35 M41.6 30 L44 28.6', dark, 1.2)
      + P('M36.5 21.5 Q33 17.5 29.5 20 Q33 21 35.5 24.5 Z', '#7a4a10')
      + L('M20 22 L13 16 M28 22 L35 16', K, 4) + L('M20 22 L13 16 M28 22 L35 16', col, 2.4)
      + P('M14 17.5 Q6 17 6.5 9.5 Q9.5 12.5 12.5 11.5 Q10.5 7 14.5 5.5 Q17.5 11 14 17.5 Z', col)
      + P('M34 17.5 Q42 17 41.5 9.5 Q38.5 12.5 35.5 11.5 Q37.5 7 33.5 5.5 Q30.5 11 34 17.5 Z', col)
      + E(24, 32, 8.5, 9, col) + R('M16.5 29 Q24 31.5 31.5 29 M16 33.5 Q24 36 32 33.5 M17 38 Q24 40 31 38', dark, 1.2)
      + E(24, 22.5, 6, 5, col) + (crest || '') + C(22, 21.5, 1.1, K) + C(26, 21.5, 1.1, K)
      + H('M18.5 30 Q19 25.5 22.5 24.5 Q20.5 27.5 20.5 32 Z', 0.5);
  }

  // Cua nhìn từ trước: hai càng lớn giơ lên, mắt trên cuống
  function crab(col, dark, crest) {
    return R('M13 32 L5 30 M13 35 L4 38 M14 38 L7 44 M35 32 L43 30 M35 35 L44 38 M34 38 L41 44', K, 3.4)
      + R('M13 32 L5 30 M13 35 L4 38 M14 38 L7 44 M35 32 L43 30 M35 35 L44 38 M34 38 L41 44', dark, 1.8)
      + L('M15 25 L10 17 M33 25 L38 17', K, 4.2) + L('M15 25 L10 17 M33 25 L38 17', col, 2.6)
      + P('M10 18 Q2 16 3.5 8 Q7 11 10.5 10 Q8 5 12.5 3.5 Q16 9 10 18 Z', col) + P('M38 18 Q46 16 44.5 8 Q41 11 37.5 10 Q40 5 35.5 3.5 Q32 9 38 18 Z', col)
      + E(24, 31, 14.5, 10, col) + R('M14 33 Q24 38 34 33', dark, 1.3) + (crest || '')
      + L('M20 23 V17 M28 23 V17', K, 1.8) + C(20, 16, 2.2, '#fff') + C(28, 16, 2.2, '#fff') + C(20.4, 16.2, 1, K) + C(28.4, 16.2, 1, K)
      + L('M21 29 Q24 31 27 29', K, 1.4) + H('M13 29 Q15 23.5 21 22.5 Q16 26 15.5 31 Z', 0.45);
  }
  // Tằm vàng (Kim Tằm Cổ): thân đốt cong, đầu to
  function silkworm(col, dark, extra) {
    return (extra || '') + C(9, 38, 4.5, col) + C(15, 36, 5.5, col) + C(22, 33, 6.5, col) + C(29, 28, 7.5, col)
      + R('M7 42 L6 45 M14 41 L13 44.5 M21 39 L20.5 43 M28 35 L28 39', dark, 1.6)
      + C(34.5, 19.5, 9, col) + C(31, 17.5, 1.7, K) + C(38, 17.5, 1.7, K) + C(30.5, 17, 0.6, '#fff') + C(37.5, 17, 0.6, '#fff')
      + L('M32 23.5 Q34.5 25.5 37 23.5', K, 1.3) + R('M30 11 L28 6 M39 11 L41 6', dark, 1.6)
      + H('M28 14 Q29.5 10.5 34 10.5 Q30.5 13 30 18 Z', 0.55);
  }

  /* ---------- Biểu tượng võ học: mỗi môn một huy hiệu tròn ----------
     Viền theo phẩm chất (Nhập môn nâu, Thượng thừa bạc, Trấn phái đỏ, Tuyệt học vàng),
     hình giữa theo kiểu đòn (fx.kind) hoặc theo loại (nội công, khinh công), màu theo võ công,
     chấm trên = số nhát, huy hiệu nhỏ góc dưới = hiệu ứng (choáng, độc, chảy máu, hút máu). */
  const SK_MOTIF = {
    quyen: c => P('M15 21 Q15 15.5 20 15.5 H30 Q34.5 15.5 34.5 21 V27 Q34.5 33.5 28 33.5 H21 Q15 33.5 15 28 Z', c)
      + P('M15 23.5 Q10.5 23.5 10.5 27.5 Q10.5 31.5 15 31.5 Z', c) + R('M20.5 15.5 V21.5 M25.5 15.5 V21.5 M30 15.5 V21.5', K, 1.3, 0.6),
    kiem: c => P('M12 32 L29.5 12 L37.5 9.5 L35 17.5 L15.5 35.5 Z', c) + R('M14.5 32.5 L33 13', '#fff', 1.4, 0.75)
      + L('M9.5 29 L18.5 38', '#e6ad35', 3.4) + L('M8.5 38.5 L12 42', '#a0673a', 4),
    con: c => L('M11 37 L37 11', K, 5) + L('M11 37 L37 11', c, 3) + C(37, 11, 2.6, c) + C(11, 37, 2.6, c),
    chuong: c => P('M17 37 Q13.5 29 14.5 22 L15.5 14.5 Q17 12 18.5 14.5 L19.5 22 L20.5 11 Q22 8.5 23.5 11 L24 21 L25.5 11.5 Q27 9 28.5 11.5 L28.5 22 L30.5 14.5 Q32 12 33.5 14.5 L32.5 26 Q32.5 35 27 37 Z', c),
    doc: c => P('M17 37 Q13.5 29 14.5 22 L15.5 14.5 Q17 12 18.5 14.5 L19.5 22 L20.5 11 Q22 8.5 23.5 11 L24 21 L25.5 11.5 Q27 9 28.5 11.5 L28.5 22 L30.5 14.5 Q32 12 33.5 14.5 L32.5 26 Q32.5 35 27 37 Z', c)
      + P('M24 24 Q27.5 28.5 27.5 30.5 A3.5 3.5 0 0 1 20.5 30.5 Q20.5 28.5 24 24 Z', '#3f7a34'),
    hoi: c => P('M20 11 H28 V20 H37 V28 H28 V37 H20 V28 H11 V20 H20 Z', c) + H('M21 13 H24 V35 H21 Z', 0.35),
    ho: c => P('M24 10.5 L36 15 Q36 30 24 37.5 Q12 30 12 15 Z', c) + R('M24 14.5 L32 17.5 Q32 28 24 33 Q16 28 16 17.5 Z', '#fff', 1.2, 0.5),
    luc: c => P('M24 10 Q33 18 32 27 Q31 36 24 37.5 Q16.5 36 16.5 27.5 Q16.5 21 22 17 Q22 23.5 25.5 24.5 Q27.5 18 24 10 Z', c) + P('M24 25 Q28 29 27.5 32 Q26 35.5 24 35.5 Q21.5 35 21 32 Q21 29 24 25 Z', '#fff4c8'),
    ne: c => P('M14.5 37 Q12 22 31 11 Q36 19.5 27 30 Q22 35 14.5 37 Z', c) + L('M14.5 37 L29 17', K, 1.3) + R('M19 30 L23 31 M21 26 L26 27 M24 22 L28.5 23', K, 1, 0.5),
    rong: c => L('M9 33 Q15 20 21.5 28 Q28 36 34 22', K, 6) + L('M9 33 Q15 20 21.5 28 Q28 36 34 22', c, 3.8)
      + C(35.5, 18.5, 5.5, c) + C(37, 17.5, 1.1, K) + P('M37 13.5 L41 9 L39.5 14.5 Z M33 13.5 L32 8.5 L35.5 13 Z', c),
    phat_chuong: c => glow(24, 24, 15, '#fff4c8', 0.5) + SK_MOTIF_REF.chuong(c) + R('M24 6 V9 M12 10 L14 12 M36 10 L34 12', '#fff4c8', 1.6),
    cuu_kiem: c => [-30, 0, 30].map(a => G(`rotate(${a} 24 28)`, P('M21.3 34 L21.3 13 L24 7.5 L26.7 13 L26.7 34 Z', c) + L('M18.5 34 H29.5', '#e6ad35', 2.6) + L('M24 35 V40', '#a0673a', 3))).join(''),
    thai_cuc: c => C(24, 24, 12.5, '#f3ecff') + P('M24 11.5 A12.5 12.5 0 0 1 24 36.5 A6.25 6.25 0 0 1 24 24 A6.25 6.25 0 0 0 24 11.5 Z', c)
      + C(24, 17.8, 1.9, c) + C(24, 30.2, 1.9, '#f3ecff'),
    bang: c => R('M24 10 V38 M11.9 17 L36.1 31 M11.9 31 L36.1 17', c, 3) + R('M24 10 L21 13 M24 10 L27 13 M24 38 L21 35 M24 38 L27 35', c, 2) + C(24, 24, 3.2, '#fff'),
    kim_chung: c => P('M17 31 Q17 15 24 13 Q31 15 31 31 L34 34 H14 Z', c) + L('M24 9.5 V13', K, 2) + C(24, 36.5, 2.4, c) + H('M19 29 Q19 19 22.5 16 Q21 21 21 29 Z', 0.4),
    // Nội công: hình theo chỉ số chính (khí huyết = mặt trời, nội lực = giọt nước, công = lửa, thủ = núi, bạo kích = sao, hút = xoáy)
    nc_hp: (c, c2) => C(24, 24, 8, c) + R('M24 9 V13 M24 35 V39 M9 24 H13 M35 24 H39 M13.4 13.4 L16.2 16.2 M31.8 31.8 L34.6 34.6 M13.4 34.6 L16.2 31.8 M31.8 16.2 L34.6 13.4', c2, 2.4) + C(24, 24, 3.5, '#fff4c8'),
    nc_mp: (c, c2) => P('M24 9 Q35 22 35 28 A11 11 0 0 1 13 28 Q13 22 24 9 Z', c) + P('M24 18 Q29.5 25 29.5 28.5 A5.5 5.5 0 0 1 18.5 28.5 Q18.5 25 24 18 Z', c2) + H('M17 27 Q17 21 21 16.5 Q19 22 19.5 29 Z', 0.5),
    nc_atk: (c, c2) => P('M24 9 Q34 18 33 27.5 Q32 37 24 38.5 Q15.5 37 15.5 28 Q15.5 21 21.5 16.5 Q21.5 23 25.5 24 Q28 17.5 24 9 Z', c) + P('M24 25 Q28.5 29.5 28 32.5 Q26.5 36 24 36 Q21 35.5 20.5 32.5 Q20.5 29 24 25 Z', c2),
    nc_def: (c, c2) => P('M8 36 L18 17 L23 25 L29 13 L40 36 Z', c) + P('M29 13 L25.7 19.5 L28 18.5 L30.5 20.5 L32.2 18.5 Z', '#fff') + P('M10 36 Q16 31 24 33 Q32 31 38 36 Z', c2),
    nc_crit: (c, c2) => P(star5(24, 25, 13.5, 6), c) + C(24, 25, 4, c2) + spark(36, 12, 3, '#fff6c8'),
    nc_steal: (c, c2) => C(24, 24, 11.5, c2) + R('M24 24 m-7 0 a7 7 0 1 1 14 0 a5 5 0 1 1 -10 0 a3 3 0 1 1 6 0', c, 2.6) + C(24, 24, 1.6, '#fff'),
    // Khinh công: theo chỉ số chính (tốc độ = cánh, né tránh = mây, chính xác = mắt)
    kc_spd: (c, c2) => P('M9 30 Q12 16 30 12 Q38 11 39 14 Q32 15 30 18 Q36 17 38 20 Q31 21 28 24 Q33 24 34 27 Q24 30 9 30 Z', c) + R('M12 33 H22 M10 37 H18', c2, 2.2),
    kc_dodge: (c, c2) => P('M8 31 Q8 25 14 25 Q15 18 22 19 Q26 13 32 18 Q39 17 40 24 Q41 31 34 31 Z', c) + P('M13 36 Q13 33 17 33 Q19 30 23 31.5 Q27 30 28 33 Q32 33 32 36 Z', c2),
    kc_acc: (c, c2) => P('M7 24 Q24 9 41 24 Q24 39 7 24 Z', c) + C(24, 24, 7, c2) + C(24, 24, 3, '#2f2630') + C(26, 22, 1.4, '#fff'),
  };
  Object.assign(SK_MOTIF, {
    kc_wave: (c, c2) => R('M7 22 Q12 17 17 22 T27 22 T37 22 T41 21', c, 3) + R('M7 30 Q12 25 17 30 T27 30 T37 30 T41 29', c, 3) + P('M16 38 Q24 33 32 38 Z', c2),
    kc_snow: (c, c2) => P('M14.5 33 Q12 20 30 11 Q35 18.5 26.5 28 Q22 32 14.5 33 Z', c) + L('M14.5 33 L28 16', K, 1.2) + spark(34, 30, 4, '#fff') + spark(39, 21, 2.6, '#fff') + spark(29, 37, 2.2, '#fff'),
    kc_reed: (c, c2) => R('M7 33 Q15 29 24 33 T41 33', c2, 3) + L('M13 31 Q22 22 36 12', '#a0673a', 2.6) + P('M30 15 Q36 10 39 11 Q36 16 31 17 Z', c) + P('M24 21 Q30 17 32 19 Q29 23 25 23 Z', c),
    nc_lotus: (c, c2) => P('M24 13 Q30 20 24 30 Q18 20 24 13 Z', c) + P('M24 30 Q14 28 11 19 Q20 19 24 30 Z', c) + P('M24 30 Q34 28 37 19 Q28 19 24 30 Z', c) + P('M12 33 Q24 38 36 33 Q24 30 12 33 Z', c2),
    // Diệt Tuyệt Kiếm Pháp: kiếm thẳng đứng, ba vệt chém chéo, đốm nội thương tím
    diet_tuyet: c => P('M22.3 32 L22.3 12 L24 8 L25.7 12 L25.7 32 Z', c) + L('M18.5 32.5 H29.5', '#e6ad35', 2.6) + L('M24 33.5 V39', '#a0673a', 3)
      + R('M11 17 L19 13 M10 25 L19 21 M29 27 L38 23', '#fff', 2, 0.85) + C(33.5, 33.5, 4.6, '#8b5cf6') + C(33.5, 33.5, 2, '#e4d8ff'),
    // Thất Sát Kiếm Pháp: kiếm chéo giữa vòng bảy vì sao
    that_sat: c => Array.from({ length: 7 }, (_, i) => { const a = -Math.PI / 2 + i * Math.PI * 2 / 7; return spark(+(24 + Math.cos(a) * 12.5).toFixed(1), +(24 + Math.sin(a) * 12.5).toFixed(1), 3.6, i % 2 ? '#d9c9ff' : '#fff'); }).join('')
      + P('M16 31 L28.5 16.5 L33 15 L31.5 19.5 L19 34 Z', c) + R('M17.5 31.5 L30.5 16.5', '#fff', 1.2, 0.75) + L('M14 28.5 L21.5 36', '#e6ad35', 3) + L('M13.5 35.5 L16 38', '#a0673a', 3.4),
    nc_toad: (c, c2) => E(24, 28, 12, 9, c) + C(17, 20, 4, c) + C(31, 20, 4, c) + C(17, 20, 1.6, K) + C(31, 20, 1.6, K) + L('M18 30 Q24 33 30 30', K, 1.4)
      + C(19, 33, 1.3, '#ffcf5a') + C(28, 34, 1.3, '#ffcf5a') + C(24, 26, 1.2, '#ffcf5a'),
  });
  // Vài môn chọn hình, màu riêng cho hợp tên (còn lại vẽ theo kiểu đòn / chỉ số)
  const SK_PICK = { the_van_tung: 'kc_dodge', phieu_tuyet_bo: 'kc_snow', lang_ba_vi_bo: 'kc_wave', thuy_thuong_phieu: 'kc_wave', nhat_vi_do_giang: 'kc_reed',
    long_tuong_cong: 'nc_def', bang_tam_quyet: 'bang', tu_ha_cong: 'nc_lotus', chu_cap_cong: 'nc_toad', tho_nap_phap: 'nc_steal' };
  const SK_COLOR = { tu_ha_cong: '#c9a8ff', chu_cap_cong: '#e0523a', bang_tam_quyet: '#bfe6ff', thien_co_than_cong: '#e6ad35', thai_huyen_kinh: '#c9a8ff',
    lang_ba_vi_bo: '#7fd0e8', thuy_thuong_phieu: '#5ab0d0', phieu_tuyet_bo: '#e8f4ff', nhat_vi_do_giang: '#d9c890', cuu_duong_than_cong: '#ffb03a', the_van_tung: '#e8f4ff' };
  const NC_BY = { hp: 'nc_hp', mp: 'nc_mp', atk: 'nc_atk', def: 'nc_def', crit: 'nc_crit', critDmg: 'nc_crit', manasteal: 'nc_steal', lifesteal: 'nc_steal' };
  const KC_BY = { spd: 'kc_spd', dodge: 'kc_dodge', acc: 'kc_acc' };
  const SK_MOTIF_REF = SK_MOTIF; // để phat_chuong dùng lại hình bàn tay
  ['vdq1', 'vdq5', 'vdq10', 'lahan'].forEach(k => { SK_MOTIF[k] = SK_MOTIF.quyen; });
  if (SK_MOTIF.chuong) SK_MOTIF.dailuc = SK_MOTIF.chuong;
  ['songlong', 'longtieu', 'cuonglong', 'chienlong'].forEach(k => { SK_MOTIF[k] = SK_MOTIF.rong; }); // bộ Hàng Long Chưởng Pháp
  SK_PICK.hl_giao_long = 'rong';
  if (SK_MOTIF.phat_chuong) SK_MOTIF.nhulai = SK_MOTIF.phat_chuong; else if (SK_MOTIF.chuong) SK_MOTIF.nhulai = SK_MOTIF.chuong;
  // bộ Tâm Phật Chưởng (icon thật là ảnh trong SK_IMG; hình tự vẽ chỉ để dự phòng)
  if (SK_MOTIF.kim_chung) SK_MOTIF.minhvuong = SK_MOTIF.phochieu = SK_MOTIF.kim_chung;
  if (SK_MOTIF.nhulai) SK_MOTIF.sonha = SK_MOTIF.trieutong = SK_MOTIF.nhulai;
  if (SK_MOTIF.chuong) SK_MOTIF.sohien = SK_MOTIF.chuong;
  if (SK_MOTIF.phat_chuong) SK_MOTIF.loiam = SK_MOTIF.botatan = SK_MOTIF.phat_chuong;
  if (SK_MOTIF.chuong) SK_MOTIF.khongtuong = SK_MOTIF.chuong;
  const SK_GRADE = { nhapmon: '#a0673a', thuongthua: '#b8c2cc', tranphai: '#c8402f', tuyethoc: '#e6ad35' };
  const SK_STAT = { hp: '#e05a4a', mp: '#4a8ae0', atk: '#e08a2c', def: '#9aa6b2', crit: '#b05ad0', critDmg: '#d06ad0', spd: '#5ac0a0',
    dodge: '#7ad1e0', manasteal: '#5a6ae0', lifesteal: '#c03a5a', critRes: '#c9b27a', acc: '#e0c050' };
  function skillIcon(s, id) {
    const ring = SK_GRADE[s.grade] || '#a0673a';
    const stats = Object.keys(s.stats || {});
    const c = SK_COLOR[id] || (s.fx && s.fx.color) || SK_STAT[stats[0]] || '#e8c070', c2 = SK_STAT[stats[1]] || '#5a4a6a';
    // nội công / khinh công: chọn hình theo chỉ số lớn nhất (ưu tiên chỉ số đặc trưng hơn khí huyết)
    const main = stats.slice().sort((a, b) => (s.stats[b] * (b === 'hp' || b === 'mp' ? 0.1 : 1)) - (s.stats[a] * (a === 'hp' || a === 'mp' ? 0.1 : 1)))[0];
    const kind = SK_PICK[id] ? SK_PICK[id] : s.fx && SK_MOTIF[s.fx.kind] ? s.fx.kind
      : s.cat === 'khinhcong' ? KC_BY[main] || (KC_BY[stats[0]] || 'kc_spd')
      : s.cat === 'noicong' ? NC_BY[main] || NC_BY[stats[0]] || 'nc_steal' : 'quyen';
    const hits = s.hits || 1, eff = s.effect ? s.effect.type : s.drain ? 'drain' : null;
    const badge = { stun: spark(38, 38, 5.5, '#ffd84d'), poison: P('M38 31 Q42.5 36.5 42.5 39 A4.5 4.5 0 0 1 33.5 39 Q33.5 36.5 38 31 Z', '#7ad151'),
      bleed: P('M38 31 Q42.5 36.5 42.5 39 A4.5 4.5 0 0 1 33.5 39 Q33.5 36.5 38 31 Z', '#e0423a'),
      drain: P('M38 43 Q31.5 38 33 34.5 Q35 31.5 38 34.5 Q41 31.5 43 34.5 Q44.5 38 38 43 Z', '#e0423a') }[eff] || '';
    return (s.grade === 'tuyethoc' ? glow(24, 24, 23, '#ffe2a0', 0.45) : '')
      + C(24, 24, 21, ring) + C(24, 24, 17.5, '#2f2630')
      + SK_MOTIF[kind](c, c2)
      + (hits > 1 ? Array.from({ length: Math.min(hits, 5) }, (_, i) => C(24 + (i - (Math.min(hits, 5) - 1) / 2) * 4.2, 6.2, 1.5, '#fff6c8')).join('') : '')
      + badge;
  }

  // Lệnh bài môn phái (mon_phai.js): thẻ gỗ treo tua, màu và dấu khắc theo phái
  const lenhBai = (body, rim, mark) => L('M24 1.5 V7', '#2a2228', 2) + P('M21.5 1.5 H26.5 L25 4 H23 Z', red)
    + P('M13 7 H35 Q38 7 38 10 V36 Q38 39 35 40 L24 45 L13 40 Q10 39 10 36 V10 Q10 7 13 7 Z', body)
    + R('M14 11 H34 V35 L24 40 L14 35 Z', rim, 1.4, 0.8) + mark + H('M13 10 Q14 9 16 9 V33 L13 35 Z', 0.18);

  /* =================================================================
     DANH SÁCH BIỂU TƯỢNG
     ================================================================= */
  const LIST = {
    /* ===== Giao diện ===== */
    // nén bạc: thân thuyền hai đầu vểnh, giữa nhô một khối tròn
    bac: P('M3.5 17 Q9 15.5 12.5 22.5 Q15 27.5 24 27.5 Q33 27.5 35.5 22.5 Q39 15.5 44.5 17 Q45 30.5 38.5 35.5 Q32.5 40 24 40 Q15.5 40 9.5 35.5 Q3 30.5 3.5 17 Z', '#d9dee3')
      + E(24, 23, 8.5, 7.5, '#e9edf0') + H('M18.5 21 Q19.5 16.8 24.5 16.2 Q20.8 18.8 20.6 23 Z', 0.8)
      + H('M6.5 20 Q8.5 19.5 10 22.5 Q8 25 7 30 Q5.6 25 6.5 20 Z', 0.55) + S('M9.5 33 Q24 38 38.5 33 Q32 39.4 24 39.4 Q16 39.4 9.5 33 Z', 0.13),
    kinh_nghiem: spark(22, 25, 17, goldL) + spark(38, 9, 6, goldL) + spark(9, 9, 4, goldL),
    giao_chien: swordR({ blade: steel, guard: gold, hilt: redD }) + sword({ blade: steel, guard: gold, hilt: redD }),
    tan_cong: sword({ blade: steel, guard: gold, hilt: redD, tassel: red }),
    tu_vong: P('M10 22 Q10 6 24 6 Q38 6 38 22 Q38 30 33 32 V38 Q33 41 30 41 H18 Q15 41 15 38 V32 Q10 30 10 22 Z', '#efe8da')
      + P('M15 20 Q15 16 19.5 16 Q23 17 22 22 Q20 26 17 25 Q15 24 15 20 Z', K) + P('M33 20 Q33 16 28.5 16 Q25 17 26 22 Q28 26 31 25 Q33 24 33 20 Z', K)
      + P('M24 26 L22 30.5 H26 Z', K) + R('M20 34 V40 M24 34 V41 M28 34 V40', K, 1.4) + H('M13 19 Q13 10 21 8.5 Q15.5 12 15.5 18 Z', 0.6),
    canh_bao: P('M24 5 L44 41 H4 Z', gold) + P('M21.8 16 H26.2 L25.3 31 H22.7 Z', K) + C(24, 35.5, 2.3, K),
    he_thong: P(gear(24, 24, 19, 15, 8), '#b88a4a') + C(24, 24, 7, '#7a5530') + C(24, 24, 3, '#e8d5a8') + H('M12 17 Q15 11 21 9.5 Q16 14 14.5 19 Z', 0.4),
    thu_the: C(24, 24, 19.5, iron) + C(24, 24, 15.5, wood) + R('M24 9 V39 M9 24 H39', '#7a4a22', 1.4, 0.7) + C(24, 24, 5.5, steel)
      + C(24, 12, 1.4, steel) + C(24, 36, 1.4, steel) + C(12, 24, 1.4, steel) + C(36, 24, 1.4, steel) + H('M13 15 Q17 9 24 8.5 Q17 12 15 18 Z', 0.4),
    bo_chay: R('M1 15 H11 M0 22 H9 M2 29 H10', '#7fb4e6', 2.4) + boot(leather, '#e8d5a8', woodD),
    moi: P('M24 3 L42 24 L24 45 L6 24 Z', goldL) + P('M21.6 11.5 H26.4 L25.4 29 H22.6 Z', red) + C(24, 34.6, 2.7, red),
    tra: P('M24 3 L42 24 L24 45 L6 24 Z', '#a8e0bf') + L('M18.6 17.5 Q19 11 24 11 Q29.6 11 29.6 16.6 Q29.6 20.8 25.6 22.6 Q24 23.6 24 28', '#23603f', 4) + C(24, 34.6, 2.7, '#23603f'),
    xong: C(24, 24, 19, '#4caf6e') + L('M14.5 24.5 L21 31 L33.5 16.5', '#fff', 4.6) + H('M10 20 Q12 11 21 8.5 Q14 13 12.5 21 Z', 0.35),
    nhap: P('M5 27 H14 L17 32 H31 L34 27 H43 V43 H5 Z', '#c98f55') + P('M19.5 4 H28.5 V15 H35 L24 26.5 L13 15 H19.5 Z', jade),
    xuat: P('M5 27 H14 L17 32 H31 L34 27 H43 V43 H5 Z', '#c98f55') + P('M19.5 25 H28.5 V14 H35 L24 2.5 L13 14 H19.5 Z', red),
    // tay nải: bọc vải buộc nút trên đỉnh
    hanh_trang: P('M6 22 Q4 43 24 44 Q44 43 42 22 Q34 17 24 17 Q14 17 6 22 Z', '#5a6f9a')
      + R('M9 27 Q17 33 24 31 Q31 33 39 27 M13 39 Q24 35 35 39', '#3e5078', 1.4, 0.8)
      + P('M24 18 Q15 4 7.5 10 Q12 16.5 24 18 Z', '#5a6f9a') + P('M24 18 Q33 4 40.5 10 Q36 16.5 24 18 Z', '#5a6f9a')
      + E(24, 18, 4.4, 3.4, '#3e5078') + H('M9.5 26 Q11.5 21.5 17 20.5 Q12.5 24.5 12 31 Z', 0.4),
    nhan_vat: bust(red, gold) + head() + C(24, 9.5, 4.2, black) + capHair(black) + eye.dot + mouth.smile,
    huong_dan: P('M10 5 H36 Q38.5 5 38.5 7.5 V41 H10 Z', blue) + P('M10 41 H38.5 V44 H10 Z', paper) + P('M10 5 H14 V44 H10 Z', '#2f5a8a')
      + P('M20 11 H32 V24 H20 Z', paper) + R('M22.5 15 H29.5 M22.5 19 H29.5', '#8a7458', 1.3) + P('M30 40 V47 L32.5 45 L35 47 V40 Z', red),
    vo_hoc: P('M5 13 Q14 9 24 13 V40 Q14 36 5 40 Z', paper) + P('M43 13 Q34 9 24 13 V40 Q34 36 43 40 Z', '#efdfb9')
      + R('M9 18 Q14 16.5 20 18 M9 23 Q14 21.5 20 23 M9 28 Q14 26.5 20 28 M28 18 Q34 16.5 39 18 M28 23 Q34 21.5 39 23', '#8a7458', 1.3)
      + P('M33 8 H37 V22 L35 20 L33 22 Z', red),
    nhiem_vu: P('M8 15.5 H38 V32.5 H8 Z', paper) + E(38, 24, 3.6, 8.5, '#e6d3a8') + E(8, 24, 3.6, 8.5, '#e6d3a8') + E(8, 24, 1.3, 3, '#c9b28a')
      + P('M20.5 14.5 H27.5 V33.5 H20.5 Z', red) + P('M24 33 L19 42 L22.5 41 L24 44 Z', red) + P('M24 33 L29 42 L25.5 41 L24 44 Z', red)
      + H('M11 18 H36 V20 H11 Z', 0.4),
    toc_do: P('M28 3 L10 27 H22 L18 45 L38 19 H26 Z', goldL) + H('M26 7 L14 25 H18 Z', 0.5),
    nghi_ngoi: P('M27 6 A17 17 0 1 0 42 33 A14 14 0 1 1 27 6 Z', goldL) + R('M31 9 H37 L31 15 H37 M38 18 H42 L38 22 H42', K, 1.8),
    lua: P('M24 3 Q35 15 35 28 Q35 43 24 43 Q13 43 13 30 Q13 21 19.5 15 Q19.5 23 24 25.5 Q21.5 13 24 3 Z', '#f28a2e')
      + P('M24 21 Q30.5 28 29.6 34 Q28.8 40 24 40 Q18.8 40 18.8 34 Q18.8 28.6 24 21 Z', goldL),
    khoa: L('M15.5 22 V15.5 Q15.5 6.5 24 6.5 Q32.5 6.5 32.5 15.5 V22', K, 5.4) + L('M15.5 22 V15.5 Q15.5 6.5 24 6.5 Q32.5 6.5 32.5 15.5 V22', steel, 2.8)
      + P('M9.5 21 H38.5 Q40 21 40 23 V40 Q40 42 38 42 H10 Q8 42 8 40 V23 Q8 21 9.5 21 Z', '#d29a36') + C(24, 29, 3, K) + P('M23 30 H25 L26 36 H22 Z', K)
      + H('M11 24 H17 V27 H11 Z', 0.45),
    khinh_cong: R('M3 17 H13 M1 25 H9 M4 33 H11', '#7fb4e6', 2.4)
      + P('M40 5 Q21 10 13 30 L11 41 L19 36 Q35 28 40 5 Z', snow) + R('M39 7 Q24 21 12 39', blueL, 1.6) + R('M30 12 L26 20 M35 14 L28 23 M25 18 L22 26', blueL, 1.2, 0.8),
    luu: P('M18.5 3 H29.5 V8 Q29.5 12 27 14 V21 H21 V14 Q18.5 12 18.5 8 Z', wood) + P('M12 21 H36 V29 H12 Z', woodD)
      + P('M9 33 H39 V46 H9 Z', red) + R('M12.5 36 H35.5 V43 H12.5 Z', '#fff', 1.4) + C(24, 39.5, 1.8, '#fff'),
    chinh: P(star5(24, 25, 20, 8.5), goldL) + H('M24 8 L20 20 L12 20 L19 24 Z', 0.4),
    ban_do: P('M4 10 L16 6 L32 10 L44 6 V38 L32 42 L16 38 L4 42 Z', paper) + R('M16 6 V38 M32 10 V42', K, 1.1, 0.4)
      + D('M9 34 Q14 24 22 26 Q30 28 32 19', red, 1.8, '2.4 2.4') + L('M33.5 14.5 L39 20 M39 14.5 L33.5 20', red, 2.2)
      + P('M8 20 L11 15 L14 20 Z', '#8aa07a') + P('M21 16 L24 11 L27 16 Z', '#8aa07a'),
    mon_phai: P('M3 16.5 Q12 15.5 16 10 H32 Q36 15.5 45 16.5 L42 19.5 H6 Z', roof)
      + P('M10 18 H14 V44 H10 Z', red) + P('M34 18 H38 V44 H34 Z', red) + P('M7 20 H41 V24 H7 Z', red)
      + P('M18.5 23 H29.5 V30 H18.5 Z', gold) + R('M21 26.5 H27', K, 1.3) + P('M7 43 H17 V46 H7 Z M31 43 H41 V46 H31 Z', '#9a8a74'),
    chi_so: P('M7 29 H15 V42 H7 Z', red) + P('M20 17 H28 V42 H20 Z', blue) + P('M33 8 H41 V42 H33 Z', gold) + L('M4 43 H44', K, 2.2),
    nhat_duoc: C(19.5, 13.5, 4, goldL) + C(28, 11.5, 4, gold)
      + P('M14 19 Q5 30 9.5 40 Q13.5 44.5 24 44.5 Q34.5 44.5 38.5 40 Q43 30 34 19 Z', leather) + P('M16.5 14.5 H31.5 L29.5 20 H18.5 Z', leather)
      + L('M17 19.5 Q24 22.5 31 19.5', red, 2.2) + H('M13 27 Q15 22 19 21 Q15.5 25 15.5 33 Z', 0.35),
    binh_minh: P('M7 34 A17 17 0 0 1 41 34 Z', '#f39a3d') + R('M24 7 V12 M11 13 L14.5 16.5 M37 13 L33.5 16.5 M4 25 H9 M39 25 H44', '#f39a3d', 2.4)
      + P('M2 34 L12 26 L19 31 L28 22 L46 34 Z', '#5f6f8a') + R('M6 39 H20 M26 39 H42 M12 44 H36', '#7fb4e6', 2),
    muc_tieu: C(24, 24, 19, '#fbf8f1') + C(24, 24, 13, red) + C(24, 24, 7.5, '#fbf8f1') + C(24, 24, 3, red),
    noi_cong: R('M24 24 m-20 0 a20 20 0 1 0 40 0 a20 20 0 1 0 -40 0', goldL, 2.6, 0.9) + glow(24, 24, 18, goldL, 0.25)
      + P('M15.5 31 Q15.5 18 24 18 Q32.5 18 32.5 31 Z', blue) + C(24, 12, 5.2, skin) + C(24, 7.4, 2.4, black)
      + P('M7 34.5 Q24 26 41 34.5 Q39 41 24 41 Q9 41 7 34.5 Z', blue) + E(24, 31, 4, 2.4, skin),
    vo_cong: R('M3 12 L9 16 M2 24 H9 M4 35 L10 31', red, 2.4) + P('M13 17 Q13 11 18 11 H34 Q39 11 39 17 V30 Q39 40 29 40 H21 Q13 40 13 32 Z', skin)
      + R('M19 11 V21 M25 11 V21 M31 11 V21', K, 1.4) + P('M13 23 Q21 21 25 25 Q23 29.5 15 29.5 Z', '#ecb88c') + H('M15 14 Q17 11.8 22 12 Q17.5 14 16.5 18 Z', 0.45),
    cong_phap: glow(24, 26, 19, goldL, 0.4) + P('M24 40 Q11 37 6 25 Q17 26 24 40 Z', pink) + P('M24 40 Q37 37 42 25 Q31 26 24 40 Z', pink)
      + P('M24 40 Q13 29 16 14 Q25 23 24 40 Z', '#f8c4d2') + P('M24 40 Q35 29 32 14 Q23 23 24 40 Z', '#f8c4d2') + P('M24 40 Q18.5 24 24 7 Q29.5 24 24 40 Z', '#fde3ea')
      + spark(9, 11, 4) + spark(40, 9, 3.4) + E(24, 40.5, 9, 2.4, green),
    trung_doc: P('M24 3.5 Q38.5 21.5 38.5 30 A14.5 14.5 0 0 1 9.5 30 Q9.5 21.5 24 3.5 Z', '#7cc25a')
      + C(19.4, 29, 2.7, K) + C(28.6, 29, 2.7, K) + R('M20 37 L22 35.6 L24 37 L26 35.6 L28 37', K, 1.4) + H('M14.5 26 Q16 18 21.5 12 Q18.5 20 17.5 28 Z', 0.45),
    chay_mau: P('M20 5 Q33 21 33 29 A13 13 0 0 1 7 29 Q7 21 20 5 Z', '#d23a3a') + P('M37.5 24 Q44 32.5 43 36.5 A5.6 5.6 0 0 1 32 36.5 Q31 32.5 37.5 24 Z', '#d23a3a')
      + H('M12 26 Q13.5 18 18.5 12 Q16 20 15 28 Z', 0.45),
    // Mê hoặc (quái Thung Lũng Tiêu Dao): trái tim hồng có vòng xoáy mê man
    me_hoac: P('M24 41 C10 31 5 23 5 16 A9.5 9.5 0 0 1 24 12 A9.5 9.5 0 0 1 43 16 C43 23 38 31 24 41 Z', '#e8609a')
      + L('M24 23 Q24 20 27 21 Q30 23 28.5 26.5 Q26 30 21.5 28 Q17.5 25.5 19.5 20.5', '#fff', 2.4) + H('M10 17 Q11 12 16 11 Q13 14 12.5 19 Z', 0.5)
      + spark(41, 6, 3.5, '#ffd0e4') + spark(7, 34, 3, '#ffd0e4'),
    // Phệ hồn (quái Hồ Kỳ Sơn): hồn ma tím bị cắn mất một góc
    phe_hon: P('M10 42 V22 A14 14 0 0 1 38 22 V42 L33 38 L28.5 42 L24 38 L19.5 42 L15 38 Z', '#9b7ad8')
      + C(18.5, 23, 3, K) + C(29.5, 23, 3, K) + P('M21 31 Q24 28 27 31 Q24 34 21 31 Z', K)
      + P('M38 10 L44 4 L44 15 Z', '#c43a5a') + H('M14 22 Q15 14 21 11 Q17.5 16 17 24 Z', 0.45),
    choang: L('M24 24 Q24 20 28 21 Q32 23 30 28 Q27 33 21 31 Q15 28 17 21 Q20 13 29 14 Q38 16 38 26 Q37.5 37 26 39', K, 5) + L('M24 24 Q24 20 28 21 Q32 23 30 28 Q27 33 21 31 Q15 28 17 21 Q20 13 29 14 Q38 16 38 26 Q37.5 37 26 39', goldL, 2.8)
      + spark(9, 10, 4.5, goldL) + spark(41, 8, 3.5, goldL) + spark(8, 37, 3.2, goldL),
    thanh_thao: P('M24 4 L41 21 H31.5 V43 H16.5 V21 H7 Z', gold) + H('M24 8 L13 19 H18.5 V40 H20.5 V19 Z', 0.4),
    thang_cap: glow(24, 24, 20, goldL, 0.35) + P('M24 3 L41 20 H31.5 V35 H16.5 V20 H7 Z', '#5cc28a') + P('M16.5 38 H31.5 V41 H16.5 Z M16.5 43.5 H31.5 V45.5 H16.5 Z', '#5cc28a')
      + spark(8, 8, 4, goldL) + spark(41, 33, 3.6, goldL),
    tro_chuyen: P('M6 9 Q6 5.5 9.5 5.5 H38.5 Q42 5.5 42 9 V28 Q42 31.5 38.5 31.5 H20 L11 40 V31.5 H9.5 Q6 31.5 6 28 Z', paper)
      + C(16, 18.5, 2.3, K) + C(24, 18.5, 2.3, K) + C(32, 18.5, 2.3, K),
    chien_thang: L('M11 46 V4', woodD, 3) + C(11, 4, 2.2, gold) + P('M12 6 H40 L34 15 L40 24 H12 Z', red) + P(star5(23, 15, 6, 2.6), goldL),
    lam_moi: L('M38 18 A15 15 0 0 0 10 17', K, 5.4) + L('M38 18 A15 15 0 0 0 10 17', jade, 2.8) + P('M5 11 L11 22 L16 13 Z', jade)
      + L('M10 30 A15 15 0 0 0 38 31', K, 5.4) + L('M10 30 A15 15 0 0 0 38 31', jade, 2.8) + P('M43 37 L37 26 L32 35 Z', jade),
    la_ban: C(24, 24, 20, '#c08a3e') + C(24, 24, 15, paper) + R('M24 10 V14 M24 34 V38 M10 24 H14 M34 24 H38', K, 1.6)
      + P('M24 13 L28 24 H20 Z', red) + P('M24 35 L20 24 H28 Z', blue) + C(24, 24, 2.2, gold),
    an_toan: L('M24 1.5 V8', K, 2) + P('M17 8 H31 V12 H17 Z', gold) + P('M15 12 Q7.5 24 15 36 H33 Q40.5 24 33 12 Z', '#d9473a')
      + R('M20 12.6 Q16.5 24 20 35.4 M28 12.6 Q31.5 24 28 35.4', K, 1.2, 0.5) + P('M17 36 H31 V40 H17 Z', gold) + L('M24 40 V47', red, 2.4)
      + H('M16 16 Q13.5 22 15.5 30 Q14 23 18 15 Z', 0.4),
    ruong: P('M7 22 Q7 11 24 11 Q41 11 41 22 Z', '#b8793f') + P('M7 22 H41 V43 H7 Z', wood) + P('M20 11.4 H28 V43 H20 Z', '#8b5a35')
      + P('M20.5 19 H27.5 V27 H20.5 Z', gold) + C(24, 23, 1.5, K) + R('M7 22 H41', K, 2),
    dam_may: P('M12 35 Q4 35 4.6 27.6 Q5.6 21 12.6 22 Q14 12.5 23.4 12.5 Q31.6 12.5 33.6 19.6 Q42.6 18.8 43.4 27 Q43.4 35 35.4 35 Z', '#f4f8fb')
      + S('M7 31 Q14 34 24 32.6 Q34 34 41 30.5 Q40 34.2 35.4 34.4 H12 Q8 34.4 7 31 Z', 0.12),
    nha: P('M10 22 H38 V43 H10 Z', '#e8d5a8') + P('M3 23 Q11 22 15 15 L24 7 L33 15 Q37 22 45 23 L42 25.5 H6 Z', roof)
      + P('M20 30 H28 V43 H20 Z', woodD) + P('M31 28 H36 V33 H31 Z M12 28 H17 V33 H12 Z', '#f2cf6a'),
    la: R('M3 30 Q10 26 16 30', '#7fb4e6', 2) + R('M1 38 Q8 34 14 37', '#7fb4e6', 2)
      + P('M10 41 Q8 15 41 7 Q42 37 10 41 Z', '#7cc25a') + R('M11 40 Q25 26 39 9 M20 31 L18 22 M26 25 L32 23', greenD, 1.4),

    // danh tiếng

    /* ===== Loại võ học ===== */
    // vo_cong, noi_cong, cong_phap, khinh_cong ở trên

    /* ===== Môn phái ===== */
    thieu_lam: P('M20 3.5 H28 V9 H20 Z', '#a87a2a') + P('M14 12 Q24 6 34 12 L36.5 36 Q24 40.5 11.5 36 Z', '#d29a36')
      + P('M9.5 34 Q24 40 38.5 34 L38.5 38.5 Q24 44.5 9.5 38.5 Z', '#b07d26')
      + R('M14.4 18 Q24 15 33.6 18 M13.3 28.5 Q24 25.5 34.7 28.5', K, 1.2, 0.55)
      + C(18.5, 22.8, 1.4, K) + C(24, 22.2, 1.4, K) + C(29.5, 22.8, 1.4, K) + H('M16.5 15 Q17 13 20 12.4 Q18 20 17.6 33 L14.4 33 Z', 0.35),
    vo_dang: C(24, 24, 19, '#f6f3ec') + P('M24 5 A19 19 0 0 1 24 43 A9.5 9.5 0 0 1 24 24 A9.5 9.5 0 0 0 24 5 Z', '#2a2a36')
      + C(24, 14.5, 3, '#2a2a36') + C(24, 33.5, 3, '#f6f3ec') + C(24, 24, 19),
    nga_mi: C(24, 14.5, 7.4, pink) + C(33, 21.1, 7.4, pink) + C(29.6, 31.7, 7.4, pink) + C(18.4, 31.7, 7.4, pink) + C(15, 21.1, 7.4, pink)
      + C(24, 24, 5.4, goldL) + R('M24 24 L24 19 M24 24 L28.6 22.6 M24 24 L26.8 28.2 M24 24 L21.2 28.2 M24 24 L19.4 22.6', '#c06a3a', 1.2)
      + H('M20 11.5 Q22 9 25 9.5 Q21.5 11.5 21.5 15 Z', 0.55),
    cai_bang: P('M33 3.5 L37.4 5 L17.4 46 L13 44.5 Z', '#7cbf5a') + R('M30.6 9.6 L34.6 11 M24.4 22.4 L28.4 23.8 M18.4 35.2 L22.4 36.6', greenD, 1.6)
      + P('M22 8.5 H26.5 V14 H22 Z', woodD) + P('M24.2 13.5 Q19 13.5 19 18.5 Q19 21.6 21.8 22.8 Q13 26 13 34 Q13 44 24.2 44 Q35.4 44 35.4 34 Q35.4 26 26.6 22.8 Q29.4 21.6 29.4 18.5 Q29.4 13.5 24.2 13.5 Z', orange)
      + L('M20.6 22.5 Q24.2 24.4 27.8 22.5', red, 2.2) + H('M16.5 31 Q17 26.5 21.5 25 Q18.5 29 18.8 36 Z', 0.4),
    vo_danh: maple(orange) + L('M24 34 Q23.4 40 20 45', '#7a4a22', 2.2) + H('M17 18 Q19 13 22 12.5 Q19.5 16 19.5 21 Z', 0.35),

    /* ===== Địa điểm ===== */
    rung_sau_coc: P('M2 42 Q24 37 46 42 V46 H2 Z', '#6f9a4e') + pine(13, 42, 0.95, '#3f7a34') + pine(35, 42, 1.05, '#2f6a3a') + pine(24, 45, 1.25, '#4a8a3e'),
    lac_ha: C(33, 21, 9, '#f39a3d') + R('M3 14 H19 M27 9 H44', '#f7c27e', 2.2) + P('M2 33 Q14 25 26 31 Q36 25 46 31 V46 H2 Z', '#9bb36a')
      + house(6, 34, 14, 10, '#e8d5a8', '#c9a052') + P('M11 38 H15 V44 H11 Z', woodD) + house(27, 36, 13, 8, '#e8d5a8', '#b8913f') + P('M31 38.5 H36 V41.5 H31 Z', '#f2cf6a'),
    rung_truc: P('M9.5 46 V5 H13.5 V46 Z', '#8e6bb8') + P('M20 46 V10 H24 V46 Z', '#a07fcc') + P('M31 46 V2 H35 V46 Z', '#7d58a6') + P('M40 46 V14 H43.5 V46 Z', '#9575c2')
      + R('M9.5 15 H13.5 M9.5 27 H13.5 M9.5 39 H13.5 M20 20 H24 M20 32 H24 M31 12 H35 M31 25 H35 M31 38 H35 M40 26 H43.5 M40 37 H43.5', K, 1.2, 0.55)
      + P('M13.5 15 Q20 10 26 13 Q20 17 13.5 15 Z', green) + P('M24 20 Q30 16 32 20 Q28 23 24 20 Z', green) + P('M35 12 Q41 7 46 10 Q41 14 35 12 Z', green) + P('M9.5 27 Q4 23 2 27 Q6 30 9.5 27 Z', green),
    duong_chau: P('M2 28 H46 V46 H2 Z', '#b9a184') + R('M2 34 H18 M30 34 H46 M2 40 H18 M30 40 H46 M10 28 V34 M38 28 V34 M6 34 V40 M42 34 V40', K, 1.1, 0.45)
      + P('M18 46 V37 Q24 30 30 37 V46 Z', '#4a3326') + P('M12 17 H36 V28 H12 Z', red) + R('M17 18 V28 M31 18 V28', K, 1.3, 0.6)
      + P('M3 19.5 Q11 19 14 14 H34 Q37 19 45 19.5 L42 22 H6 Z', roof) + P('M15 14 Q21 13 23 7.5 H25 Q27 13 33 14 Z', roof),
    // Bốn thành lớn. Lạc Dương: cố đô, tháp chùa nhô sau tường thành
    lac_duong: P('M19.5 32 V20 H28.5 V32 Z', red) + P('M12.5 21 Q18.5 20.5 20.5 16.5 H27.5 Q29.5 20.5 35.5 21 Z', roof)
      + P('M21 16.5 V11 H27 V16.5 Z', red) + P('M15.5 11.6 Q20 11.2 21.8 8 H26.2 Q28 11.2 32.5 11.6 Z', roof) + P('M23 8 L24 2.5 L25 8 Z', gold)
      + P('M2 46 V31 H5 V27.5 H9 V31 H13 V27.5 H17 V31 H31 V27.5 H35 V31 H39 V27.5 H43 V31 H46 V46 Z', '#b9a184')
      + R('M2 36 H18 M30 36 H46 M2 41 H18 M30 41 H46 M10 31 V36 M38 31 V36 M6 36 V41 M42 36 V41', K, 1.1, 0.45)
      + P('M18 46 V38 Q24 31.5 30 38 V46 Z', '#4a3326') + H('M3 32 H16 V33.4 H3 Z', 0.35),
    // Tương Dương: thành đá xám bên sông, cổng lầu và hai lá cờ
    tuong_duong: P('M3 40 V22 H7 V19 H11 V22 H15 V19 H19 V22 H29 V19 H33 V22 H37 V19 H41 V22 H45 V40 Z', '#9a958a')
      + R('M3 27 H18 M30 27 H45 M3 33 H18 M30 33 H45 M10 22 V27 M38 22 V27 M7 27 V33 M41 27 V33', K, 1.1, 0.45)
      + P('M17.5 22 V15 H30.5 V22 Z', '#c99256') + P('M13 15.6 Q19 15.2 21 11 H27 Q29 15.2 35 15.6 Z', roof)
      + P('M19 40 V32 Q24 26 29 32 V40 Z', '#3a2a22') + L('M7 19 V7', K, 1.6) + P('M7 7 L14.5 9.2 L7 11.6 Z', red)
      + L('M41 19 V7', K, 1.6) + P('M41 7 L33.5 9.2 L41 11.6 Z', red)
      + P('M2 40 H46 V46 H2 Z', '#4f8fc0') + R('M6 43 Q9 41 12 43 M30 44 Q33 42 36 44', '#fff', 1.3, 0.8),
    // Thành Đô: quán trà đất Thục treo đèn lồng, núi xanh và trúc phía sau
    thanh_do: P('M2 34 L12 15 L20 25 L30 9 L46 34 Z', '#7fa08a') + S('M30 9 L46 34 H34 L32 22 Z', 0.14)
      + L('M5 46 V20', greenD, 2.4) + R('M5 26 L9.5 23 M5 32 L1.5 29', green, 1.6)
      + P('M8 31 H40 V46 H8 Z', '#d9c09a') + P('M20 46 V36 H28 V46 Z', woodD) + R('M14 31 V46 M34 31 V46', K, 1.3, 0.5)
      + P('M3 31.5 Q11 31 14 25.5 H34 Q37 31 45 31.5 L42.5 34 H5.5 Z', '#5a4030')
      + L('M12.5 34 V36', K, 1.2) + E(12.5, 38.8, 2.6, 3.2, red) + L('M35.5 34 V36', K, 1.2) + E(35.5, 38.8, 2.6, 3.2, red)
      + R('M10.2 38.8 H14.8 M33.2 38.8 H37.8', gold, 1),
    // Trường An: cung điện hai tầng mái ngói lưu ly, thềm đá rộng
    truong_an: P('M7 46 L11 40 H37 L41 46 Z', '#c9b28a') + R('M9.5 43 H38.5', K, 1, 0.4)
      + P('M10 27 H38 V40 H10 Z', red) + R('M15.5 28 V40 M21 28 V40 M27 28 V40 M32.5 28 V40', K, 1.3, 0.6)
      + P('M2 28 Q10 27.5 14 22.5 H34 Q38 27.5 46 28 L43.5 30.5 H4.5 Z', '#2f7a72')
      + P('M15 23 V16.5 H33 V23 Z', red) + P('M21 17.5 H27 V21 H21 Z', '#2f2a3a') + R('M22.5 19.2 H25.5', gold, 1.2)
      + P('M8 17.4 Q15 17 18 11.5 H30 Q33 17 40 17.4 Z', '#2f7a72') + L('M18 11.5 H30', K, 1.8)
      + P('M16.5 12 Q15.5 8.5 18 8 Z M31.5 12 Q32.5 8.5 30 8 Z', gold) + C(24, 9.5, 1.6, gold)
      + H('M6 27.6 Q11 27 14.5 23.4 H17 Q13 27.6 6 28.4 Z', 0.35),
    thieu_lam_tu: P('M6 42 H42 V46 H6 Z', '#c9b28a') + P('M10 26 H38 V42 H10 Z', red) + P('M20 31 H28 V42 H20 Z', '#6b3a1f')
      + R('M15 27 V42 M33 27 V42', K, 1.4, 0.6) + P('M2 27.5 Q10 27 14.5 20.5 H33.5 Q38 27 46 27.5 L43.5 30 H4.5 Z', '#d9a236')
      + P('M10 20.5 Q16 20 19 13.5 H29 Q32 20 38 20.5 Z', '#d9a236') + P('M22 13.5 L24 8 L26 13.5 Z', gold) + P('M20.5 22 H27.5 V26 H20.5 Z', '#2f2a3a'),
    vo_dang_son: P('M2 46 L15 16 L22 25 L30 12 L46 46 Z', '#8aa0b4') + S('M30 12 L46 46 H34 L33 30 Z', 0.12)
      + P('M26.5 12.5 H33.5 V16 H26.5 Z', red) + P('M24 13 Q28 12 30 6.5 Q32 12 36 13 Z', roof)
      + cloud(12, 32, 0.6) + cloud(38, 38, 0.55),
    nga_mi_son: glow(30, 12, 11, goldL, 0.6) + P('M2 46 L14 22 L20 28 L30 10 L46 46 Z', '#9a8ab8') + P('M30 10 L26.4 17.4 Q30 15.6 33.6 17.6 Z', gold)
      + P('M2 34 Q10 30 18 34 Q26 30 34 34 Q40 31 46 34 V38 H2 Z', '#f6dce6')
      + C(7, 41, 2.8, pink) + C(12, 44, 2.6, pink) + C(4.5, 46, 2.4, pink) + C(7, 41, 0.9, gold) + C(12, 44, 0.9, gold),
    cai_bang_da: P('M8 24 H40 V44 H8 Z', '#a88a66') + P('M4 25 L14 14 L20 17 L24 12 L34 15 L44 25 Z', '#7a6a58') + P('M15 17.5 H21 V21.5 H15 Z', '#c9b28a')
      + P('M19 44 V34 Q24 29 29 34 V44 Z', '#3a2a20') + L('M42 44 V6', woodD, 2.4) + P('M42 8 H47 V16 L44.5 14 L42 16 Z', red)
      + G('translate(6 18) scale(0.42)', P('M24.2 13.5 Q19 13.5 19 18.5 Q19 21.6 21.8 22.8 Q13 26 13 34 Q13 44 24.2 44 Q35.4 44 35.4 34 Q35.4 26 26.6 22.8 Q29.4 21.6 29.4 18.5 Q29.4 13.5 24.2 13.5 Z', orange)),
    hac_phong: P('M2 46 L12 21 L18 27 L28 9 L36 21 L46 46 Z', '#4a4550') + S('M28 9 L46 46 H34 L31 26 Z', 0.2)
      + R('M3 14 Q13 8 21 14 Q25 18 19 20', '#a4a4b4', 2.4) + R('M30 33 Q40 29 46 35', '#a4a4b4', 2.4)
      + L('M28 9.5 V2', K, 1.8) + P('M28 2 L37 4.2 L28 7 Z', red),
    tuyet_son: P('M2 46 L18 12 L26 22 L32 14 L46 46 Z', '#9fb8cc') + P('M18 12 L13.3 22 L16.5 20 L19.5 22.5 L22.5 19.5 L26 22 Z', '#fff')
      + P('M32 14 L27.5 20 L30 19 L32 21 L34.6 20 Z', '#fff') + S('M32 14 L46 46 H36 L34 26 Z', 0.1) + spark(7, 9, 3.4, '#fff') + spark(41, 7, 2.8, '#fff') + spark(42, 21, 2, '#fff'),
    phe_trach: P('M2 43 H46 V46 H2 Z', '#6f9a4e') + P('M4 43 V25 L12 18 L16.5 22.5 L21.5 16.5 L24 19 V43 Z', '#a8957a')
      + P('M2.5 26 L12 17 L14 19 L4.5 28 Z', '#6f6052') + P('M7.5 29 H11.5 V35 H7.5 Z M15 27 H19 V33 H15 Z', '#3a2a20')
      + L('M31.5 34 V23.5 M42.5 34 V23.5', woodD, 2.2) + P('M28.5 24.5 L37 18.5 L45.5 24.5 Z', '#6f6052')
      + P('M30 34 H44 V43 H30 Z', '#9a9a9a') + E(37, 34, 7, 2.4, '#4a4a4a') + R('M30 38 H44', K, 1.1, 0.4)
      + R('M5 43 L4 39 M8 43 L8.5 38.5 M26 43 L25 39.5 M47 43 L46 39', greenD, 1.6),
    vuc_vo_luong: P('M2 2 H15 L18 14 L13 24 L17 34 L12 46 H2 Z', '#3e4a52') + P('M46 2 H33 L30 12 L35 22 L30 34 L35 46 H46 Z', '#34404a')
      + P('M20 6 H27 V36 H20 Z', '#cde6f4') + R('M22 8 V34 M25 10 V34', '#fff', 1.2, 0.8) + E(24, 40, 12, 4, '#4a8aa8')
      + glow(24, 30, 6, '#f6f3ec', 0.5) + P('M21 31 Q24 26 27 31 V34 H21 Z', '#f6f3ec')
      + R('M4 18 Q10 16 14 18 M32 28 Q38 26 44 28', '#dfe9f0', 2, 0.7),
    mat_dao: P('M2 46 V14 H46 V46 Z', '#4a3f45') + P('M10 46 V27 Q10 18 24 18 Q38 18 38 27 V46 Z', '#1a1418')
      + R('M2 22 H10 M38 22 H46 M2 32 H10 M38 32 H46 M6 14 V22 M42 22 V32 M6 32 V40', '#2a2228', 1.4, 0.8)
      + glow(24, 40, 9, '#ff6a3a', 0.25) + P('M18 46 L21 38 H27 L30 46 Z', '#5a2a22') + C(14, 9, 2.4, '#8fb4d0') + C(33, 6, 1.6, '#8fb4d0'),
    tu_qua_nhai: P('M2 46 L9 31 L19 28 L21 13 L31 5 L46 7 V46 Z', '#8a909a') + S('M31 5 L46 7 V46 H34 L36 24 Z', 0.18)
      + E(33, 31, 5.5, 7, '#2a2228') + P('M27.5 38 H38.5 V40.5 H27.5 Z', '#6f747c') + pine(13, 30, 0.42, greenD)
      + P('M2 17 Q5 13 10 15 Q14 11 19 15 Q23 15 21.5 19 H3 Z', '#fff') + R('M24 22 L28 20 M38 15 L42 14', '#5a6068', 1.4, 0.7),
    van_truong_coc: P('M2 2 H14 L17 18 L12 34 L14 46 H2 Z', '#7d8a96') + P('M46 2 H34 L31 16 L36 30 L33 46 H46 Z', '#6f7c88')
      + P('M2 2 H14 L12 8 H2 Z M46 2 H34 L36 7 H46 Z', '#fff') + P('M8 46 Q24 34 40 46 Z', '#8fbf6a')
      + pine(24, 40, 0.42, greenD) + C(16, 41, 1.8, pink) + C(32, 42, 1.8, pink) + C(20, 44, 1.6, goldL) + C(28, 44.5, 1.6, pink)
      + glow(24, 34, 12, goldL, 0.25),
    huyet_ma_dan: C(36, 11, 7.5, '#d9473a') + P('M4 46 V26 H8 V22 H12 V26 H16 V18 H20 V14 H28 V18 H32 V26 H36 V22 H40 V26 H44 V46 Z', '#2f2833')
      + P('M20 46 V36 Q24 31 28 36 V46 Z', redD) + P('M9.5 28 H14.5 V36 L12 34 L9.5 36 Z', red) + P('M33.5 28 H38.5 V36 L36 34 L33.5 36 Z', red)
      + P('M22.5 19 H25.5 V24 H22.5 Z', '#ff8a5a'),
    // Tây Vực (Hồi 7)
    hoang_mac: glow(34, 13, 10, '#ffd77a', 0.45) + C(34, 13, 6.5, '#f5b335') + P('M2 30 Q14 20 26 28 Q36 22 46 27 V46 H2 Z', '#e6c27a')
      + P('M2 38 Q16 30 30 37 Q38 33 46 36 V46 H2 Z', '#d4a65c') + R('M4 29 Q14 22 24 27.5', '#fff3d0', 1.4, 0.7)
      + L('M10.5 38 Q6.5 36 6 32', K, 3.6) + L('M19.5 38 Q23.5 36 24 32', K, 3.6) + L('M10.5 38 Q6.5 36 6 32', '#f4efe2', 2) + L('M19.5 38 Q23.5 36 24 32', '#f4efe2', 2)
      + P('M9.5 41 Q9.5 35.5 15 35.5 Q20.5 35.5 20.5 41 Q18.5 44 15 44 Q11.5 44 9.5 41 Z', '#f4efe2') + C(13, 39.6, 1.2, K) + C(17, 39.6, 1.2, K),
    bach_da_son: P('M2 46 L14 18 L21 25 L30 9 L46 46 Z', '#9a7a5c') + S('M30 9 L46 46 H35 L33 24 Z', 0.18) + R('M10 34 L14 30 M38 30 L40 36 M22 40 L25 36', '#6a5240', 1.4, 0.7)
      + house(15, 31, 16, 9, white, '#5b6570') + P('M21 34 H25 V40 H21 Z', '#3a3438')
      + L('M37 24 V6', K, 1.6) + P('M37 6 H45 V16 L41 14 L37 16 Z', white) + R('M39 8 Q43.5 9 40.5 11 Q37.6 13 42.4 14', jade, 1.6),
    // Đông Hải (Hồi 8)
    linh_xa_dao: P('M2 37 H46 V46 H2 Z', '#4a7090') + R('M6 42 Q9 40 12 42 M30 43 Q33 41 36 43', '#a8c8dc', 1.3)
      + P('M6 39 L12 26 L18 30 L24 15 L31 27 L37 23 L43 39 Z', '#2f2a33') + S('M24 15 L43 39 H32 L29 26 Z', 0.25)
      + C(23.5, 22, 1.2, '#ff5a3a') + C(26.5, 22, 1.2, '#ff5a3a')
      + cloud(12, 18, 0.9, '#e8eef2') + cloud(36, 13, 0.75, '#e8eef2') + cloud(30, 32, 0.8, '#eef3f6'),
    hai_long_dong: P('M2 46 V20 Q2 7 24 7 Q46 7 46 20 V46 Z', '#5b6570') + P('M8 12 L4 3 L13 9 Z M40 12 L44 3 L35 9 Z', '#4a525c')
      + C(15, 14, 2.6, '#ffcf5a') + C(33, 14, 2.6, '#ffcf5a') + C(15, 14, 1, K) + C(33, 14, 1, K)
      + P('M10 46 V31 Q10 19 24 19 Q38 19 38 31 V46 Z', '#14222e') + P('M11 25 L14.5 30 L17.5 21.5 Z M30.5 21.5 L33.5 30 L37 25 Z', white)
      + P('M10 39 Q24 35 38 39 V46 H10 Z', '#3f8fb0') + R('M14 42 Q17 40.5 20 42 M27 43 Q30 41.5 33 43', '#bfe3f7', 1.3),
    // Thiên Sơn (Hồi 10)
    bang_nguyen: P('M2 26 L10 16 L16 21 L24 12 L33 22 L39 17 L46 26 Z', '#b8cadb') + P('M2 32 Q24 25 46 32 V46 H2 Z', snow)
      + R('M4 9 L14 13 M10 4 L22 9 M28 6 L40 11 M34 2 L46 7 M6 20 L14 23 M24 18 L34 22 M14 36 L24 40 M30 34 L42 39', blueL, 1.6)
      + spark(18, 28, 2.2, '#fff') + spark(38, 29, 1.8, '#fff') + spark(9, 40, 1.8, '#fff'),
    // Hoa Sơn (Hồi 11)
    hoa_son: P('M10 46 L18 6 L28 4 L36 46 Z', '#8a8f96') + S('M28 4 L36 46 H27 L26 18 Z', 0.2)
      + D('M14 44 L26 38 L16 32 L27 26 L19 20 L26 14', '#f4efe2', 1.6, '2 2')
      + P('M14 7 H32 V10 H14 Z', '#b07a4a') + R('M15 7 V3 M31 7 V3 M15 4 H31', '#6b4a2f', 1.4) + P('M21 3 L23 0.5 L25 3 Z', red)
      + cloud(7, 24, 0.8, '#fbf8f1') + cloud(42, 30, 0.8, '#fbf8f1'),
    // Thí Luyện Tháp (Dương Châu): tháp bốn tầng mái cong, đỉnh vàng
    thap: P('M2 43 H46 V46 H2 Z', '#b9a184') + P('M13 35 H35 V43 H13 Z', red) + P('M21 43 V38.5 Q24 35.5 27 38.5 V43 Z', '#4a3326')
      + P('M15.5 27.5 H32.5 V35 H15.5 Z', red) + P('M18 20.5 H30 V27.5 H18 Z', red) + P('M20 13.5 H28 V20.5 H20 Z', red)
      + P('M22.5 29.5 H25.5 V32.5 H22.5 Z M22.8 22.3 H25.2 V25.3 H22.8 Z', goldL) + H('M14 36 H16 V42.5 H14 Z M16.5 28.5 H18 V34.5 H16.5 Z', 0.3)
      + P('M6 36.5 Q12 36 14.5 32 H33.5 Q36 36 42 36.5 L39 38 H9 Z', roof) + P('M9.5 28.5 Q14.5 28 17 24.5 H31 Q33.5 28 38.5 28.5 L36 30 H12 Z', roof)
      + P('M13 21.5 Q17 21 19 18 H29 Q31 21 35 21.5 L33 23 H15 Z', roof) + P('M15.5 14.5 Q19 14 20.5 11 H27.5 Q29 14 32.5 14.5 L30.5 16 H17.5 Z', roof)
      + L('M24 11 V2.5', K, 1.6) + C(24, 7.5, 2, gold) + C(24, 3.5, 1.3, gold),
    // Tự động luyện công (tu_dong.js): hai mũi tên xoay vòng quanh thanh kiếm
    tu_dong: R('M10 21 A15 15 0 0 1 36 13', K, 6) + R('M10 21 A15 15 0 0 1 36 13', gold, 3.4) + P('M31 7.5 L41.5 11 L34.5 19 Z', gold)
      + R('M38 27 A15 15 0 0 1 12 35', K, 6) + R('M38 27 A15 15 0 0 1 12 35', jade, 3.4) + P('M17 40.5 L6.5 37 L13.5 29 Z', jade)
      + P('M23 13 L25.5 13 L26 29 L22.5 29 Z', steel) + P('M19 29 H29 V31.5 H19 Z', gold) + P('M22.6 31.5 H25.4 V37 H22.6 Z', woodD) + H('M23.6 14.5 L24.4 14.5 L24.6 27 L23.6 27 Z', 0.7),
    thien_co_cac: P('M2 46 V2 H46 V46 Z', '#4a4550') + R('M4 10 L10 14 M38 8 L44 12 M5 34 L10 38 M40 30 L45 35', '#2f2a33', 1.4)
      + P('M14 46 V8 H34 V46 Z', '#1e1a22')
      + P('M17 43 H31 V39 H17 Z M17 37 H31 V33 H17 Z M18 31 H30 V27 H18 Z M18 25 H30 V21 H18 Z M19 19 H29 V15 H19 Z M20 13 H28 V9.5 H20 Z', '#7a2a2a')
      + R('M15 39 H33 M15 33 H33 M16 27 H32 M16 21 H32 M17 15 H31 M18 9.5 H30', gold, 1.6) + P('M22 9.5 L24 5 L26 9.5 Z', gold)
      + G('translate(38 38)', P(gear(0, 0, 8, 6, 8), '#b08a3a') + C(0, 0, 2.4, '#4a4550')) + G('translate(9 20)', P(gear(0, 0, 5.5, 4, 6), '#b08a3a')),

    // Miêu Cương (Hồi 9)
    van_doc_lam: P('M2 46 V2 H46 V46 Z', '#1e2e22') + P('M4 46 L10 10 L16 46 Z', '#2f4a2a') + P('M18 46 L25 4 L32 46 Z', '#36522f') + P('M33 46 L39 14 L45 46 Z', '#2f4a2a')
      + glow(14, 34, 10, '#9ad16a', 0.35) + glow(34, 28, 9, '#9ad16a', 0.3) + cloud(14, 38, 0.9, '#b8e08a') + cloud(36, 30, 0.75, '#b8e08a')
      + C(22, 20, 1.2, '#e6f04a') + C(26, 20, 1.2, '#e6f04a'),
    ngu_doc_dong: P('M2 46 V18 Q2 4 24 4 Q46 4 46 18 V46 Z', '#4a3f45') + P('M9 46 V26 Q9 14 24 14 Q39 14 39 26 V46 Z', '#1a1418')
      + glow(24, 36, 11, '#7ad151', 0.3)
      + P('M12 46 Q10 39 13 36 H19 Q22 39 20 46 Z', '#8a5a35') + P('M13 35 H19 V37 H13 Z', '#6b4a2f')
      + P('M27 46 Q25 37 29 33 H36 Q40 37 37 46 Z', '#9a6a3a') + P('M29 32 H36 V34.5 H29 Z', '#6b4a2f')
      + R('M15 41 Q16.5 39 18 41 M30 40 L34 40 M32 38 V42', '#e6ad35', 1.3)
      + R('M13 9 Q16 6 19 9 Q22 12 25 9 M30 8 L33 6 M33 10 L36 8', '#7ad151', 1.4),

    /* ===== Cửa hàng ===== */
    tiem_thuoc: P('M14 24 Q11 16 17 11 Q20 19 17 25 Z', green) + P('M30 6.5 L35 8.5 L28 27 L24 25.5 Z', wood)
      + P('M9.5 25 H38.5 Q38.5 40 24 42 Q9.5 40 9.5 25 Z', '#a8a29a') + E(24, 25, 14.5, 3.6, '#cbc5bc') + E(24, 25, 11, 2.2, '#7a746c'),
    lo_ren: P('M37 13 L35 11 L21 25 L23 27 Z', wood) + P('M33.5 4.5 L43.5 14.5 L38.5 19.5 L28.5 9.5 Z', iron)
      + P('M4 25 Q10 25 14 23 H41 V30 H32.5 L30.5 35.5 H36.5 V41 H14 V35.5 H20 L18 30 H14 Q8 30 4 25 Z', '#59636e')
      + H('M14 24.5 H40 V26 H14 Z', 0.35) + spark(12, 14, 3.6, '#ffb347') + spark(19, 9, 2.4, '#ffb347'),
    // Thợ Rèn ở năm thành lớn: đe sắt, phôi thép đỏ rực, búa giơ cao, tia lửa
    tho_ren: glow(27, 21, 13, '#ffb347', 0.35)
      + P('M6 27 Q12 27 15 25 H41 V32 H33 L31 37 H37 V43 H14 V37 H20 L18 32 H15 Q10 32 6 27 Z', '#59636e') + H('M15 26.4 H40 V27.8 H15 Z', 0.35)
      + P('M19 22 H36 Q37.4 23.5 36 25 H19 Z', '#ff7a2c') + H('M21 22.6 H33 V23.4 H21 Z', 0.5)
      + P('M31.6 7.6 L33.8 9.2 L24.4 20.6 L22.2 19 Z', wood) + P('M29.5 2.5 L38.5 9 L35.6 12.6 L26.6 6.1 Z', iron)
      + spark(13, 15, 3.2, '#ffb347') + spark(41, 16, 2.6, '#ffd36b') + spark(20, 12, 2, '#ffd36b'),
    vo_quan: P('M18 44 H30 V47 H18 Z', woodD) + P('M19 9 Q24 4 29 9 V44 H19 Z', wood) + P('M29 15 H40 Q42 15 42 17 V18.5 H29 Z', '#c98f55')
      + P('M19 15 H8 Q6 15 6 17 V18.5 H19 Z', '#c98f55') + P('M29 27 H38 V30.5 H29 Z', '#c98f55') + R('M21 22 H27 M21 34 H27', '#7a4a22', 1.2, 0.7),
    duoc_phong: P('M7 6 H41 V45 H7 Z', '#9a6232') + R('M7 17 H41 M7 28 H41 M7 39 H41 M18.3 6 V45 M29.6 6 V45', K, 1.4)
      + C(12.6, 12, 1.3, gold) + C(24, 12, 1.3, gold) + C(35.3, 12, 1.3, gold) + C(12.6, 23, 1.3, gold) + C(24, 23, 1.3, gold) + C(35.3, 23, 1.3, gold)
      + C(12.6, 34, 1.3, gold) + C(24, 34, 1.3, gold) + C(35.3, 34, 1.3, gold) + P('M18 1.5 H30 V6 H18 Z', red),
    tang_kinh: glow(24, 20, 16, goldL, 0.45) + L('M12 46 L36 32 M36 46 L12 32', woodD, 2.8)
      + P('M5 15 Q14 11 24 15 V35 Q14 31 5 35 Z', paper) + P('M43 15 Q34 11 24 15 V35 Q34 31 43 35 Z', '#efdfb9')
      + R('M9 19.5 Q14 18 20 19.5 M9 24 Q14 22.5 20 24 M9 28.5 Q14 27 20 28.5 M28 19.5 Q34 18 39 19.5 M28 24 Q34 22.5 39 24 M28 28.5 Q34 27 39 28.5', '#8a7458', 1.2),

    /* ===== Vũ khí ===== */
    moc_kiem: sword({ kind: 'wood', blade: '#d39a5e', guard: wood, hilt: woodD, pommel: wood }),
    thiet_kiem: sword({ blade: '#b5bec6', guard: iron, hilt: leather }),
    thanh_cuong_kiem: sword({ blade: '#bcd6ea', guard: '#c08a3e', hilt: blue, tassel: blue }),
    tinh_thep_dao: sword({ kind: 'dao', blade: '#d3dbe2', guard: iron, hilt: red, tassel: red }),
    huyen_thiet_kiem: sword({ kind: 'broad', blade: '#4d5866', guard: gold, hilt: black, glow: '#7fa8ff' }) + R('M18 30 L39 9', '#9fc0ff', 1.4, 0.8),
    y_thien_kiem: sword({ blade: '#e2eef8', guard: gold, wide: true, gem: red, hilt: redD, tassel: red, glow: goldL, sparks: true }),
    bich_hai_kiem: sword({ blade: '#bfeaf2', guard: '#2f8aa0', hilt: '#1f4f6a', tassel: '#5ad0c8', gem: '#7fe0ff', glow: '#9fe8ff', sparks: true }),
    ngu_doc_kiem: sword({ blade: '#b8e08a', guard: '#5a3a7a', hilt: '#2a2228', tassel: '#7ad151', gem: '#e04a8a', glow: '#9be35a' }),
    han_bang_kiem: sword({ blade: '#e8f6ff', guard: '#9cc3ea', hilt: '#3d72b4', tassel: '#cfe8ff', gem: '#7fd0ff', glow: '#cfe8ff', sparks: true }),
    tu_ha_kiem: sword({ blade: '#e6d8ff', guard: '#7e52a6', hilt: '#3a2a5a', tassel: '#c9a8ff', gem: '#f2c14e', glow: '#d9b8ff', sparks: true }),

    /* ===== Nón ===== */
    non_la: L('M12.5 33 Q24 45 35.5 33', '#7a4a22', 1.6) + P('M3 31 L24 7 L45 31 Q24 39 3 31 Z', '#e6c47c')
      + R('M24 8.5 L13 35 M24 8.5 L24 36.6 M24 8.5 L35 35 M8.5 25.5 Q24 30.5 39.5 25.5', '#b48a3e', 1.3) + H('M24 9.5 L9.5 28 Q13 29.5 16 29.6 Z', 0.3),
    mu_da: P('M10 31 Q9 12 24 11 Q39 12 38 31 Z', '#9a6a40') + R('M24 11.5 V30', '#6e4626', 1.3) + P('M7 29 Q24 25 41 29 V35 Q24 31 7 35 Z', '#6e4626')
      + D('M9 32 Q24 28 39 32', '#e8cfa0', 1.1) + H('M14 26 Q13 15.5 22 13.4 Q16.5 18 16.2 27 Z', 0.3),
    tu_kim_quan: P('M13 34 L15 17 L20 20.5 L24 10 L28 20.5 L33 17 L35 34 Z', gold) + P('M11 33 H37 V38.5 H11 Z', purple) + C(24, 26.5, 3.4, '#a46ad8')
      + H('M23 25 Q23.5 23.5 25 23.4 Q23.8 24.6 23.8 26 Z', 0.7) + L('M4 24.5 L44 20', K, 4.2) + L('M4 24.5 L44 20', goldL, 2.2) + C(4, 24.5, 2.1, goldL) + C(44, 20, 2.1, goldL),
    ho_dau_khoi: P('M9 15 L11 5 L18 11 Z', '#e08a2c') + P('M39 15 L37 5 L30 11 Z', '#e08a2c') + P('M8 36 Q7 10 24 9 Q41 10 40 36 Z', '#e08a2c')
      + R('M24 10 V17 M16 12.5 L18.5 18.5 M32 12.5 L29.5 18.5 M9.5 22 L14.5 23.5 M38.5 22 L33.5 23.5', K, 2)
      + P('M14.5 24 Q17.8 21 21 24 Q17.8 26.4 14.5 24 Z', '#fff3c4') + P('M33.5 24 Q30.2 21 27 24 Q30.2 26.4 33.5 24 Z', '#fff3c4') + C(17.8, 24, 1.2, K) + C(30.2, 24, 1.2, K)
      + P('M21 27 H27 L24 30.4 Z', red) + P('M6.5 32 H41.5 V38.5 H6.5 Z', '#7d8a96') + C(12, 35.2, 1.1, K) + C(24, 35.2, 1.1, K) + C(36, 35.2, 1.1, K),
    bach_da_dau_can: P('M36 26 Q44 32 41 44 Q37 36 33 30 Z', '#e9e2d2') + P('M9 30 Q8 12 24 11 Q40 12 39 30 Q32 26 24 26 Q16 26 9 30 Z', '#f2ede2')
      + R('M10 22 Q24 14 38 22 M10 27 Q24 19 38 27', '#c9bfa8', 1.6) + C(24, 17, 3.2, '#39b0a0') + H('M14 18 Q16 14 21 13 Q17 17 16 22 Z', 0.5),
    hai_ngoc_quan: P('M11 34 Q10 15 24 13 Q38 15 37 34 Z', '#2f6f8a') + P('M9 33 H39 V38 H9 Z', '#1f4f6a')
      + C(24, 22, 4.2, '#eef6fb') + H('M22 20.5 Q22.6 19 24.2 18.8 Q23 20 23 21.6 Z', 0.8) + C(15.5, 26, 2, '#eef6fb') + C(32.5, 26, 2, '#eef6fb'),
    ngan_hoa_quan: P('M10 33 Q9 16 24 14 Q39 16 38 33 Z', '#2a3f6a') + P('M12 20 L15 6 L19 16 L24 3 L29 16 L33 6 L36 20 Q24 16 12 20 Z', '#e8edf2')
      + R('M15 9 V17 M24 6 V15 M33 9 V17', '#9aa6b2', 1.2) + P('M8 32 H40 V37 H8 Z', '#e8edf2') + C(16, 34.5, 1.4, red) + C(24, 34.5, 1.4, red) + C(32, 34.5, 1.4, red),
    tuyet_lien_quan: P('M10 33 Q9 16 24 14 Q39 16 38 33 Z', '#eaf3fa') + P('M24 4 Q29 10 24 18 Q19 10 24 4 Z M14 10 Q22 11 23 18 Q15 17 14 10 Z M34 10 Q26 11 25 18 Q33 17 34 10 Z', '#fff')
      + R('M24 6 V16', '#cfe0ee', 1) + P('M8 32 H40 V37 H8 Z', '#9cc3ea') + C(24, 34.5, 1.6, '#3d72b4'),
    ngoc_nu_quan: P('M11 33 Q10 15 24 13 Q38 15 37 33 Z', '#7e52a6') + P('M15 14 L24 4 L33 14 Q24 11 15 14 Z', '#e6d8ff')
      + C(24, 21, 3.4, '#f4f1ea') + H('M22.4 19.6 Q23 18.4 24.4 18.2 Q23.3 19.2 23.3 20.6 Z', 0.8) + P('M9 32 H39 V37 H9 Z', '#e6ad35'),
    // Thiên Cơ Kim Quan (bậc 10): mũ vàng viền ngọc, phía trước gắn tấm bát quái
    thien_co_quan: glow(24, 22, 17, '#ffe7a0', 0.4) + P('M12 34 L13 16 L19 21 L24 8.5 L29 21 L35 16 L36 34 Z', gold) + C(24, 8.5, 2.2, jade)
      + C(13, 16, 1.6, jade) + C(35, 16, 1.6, jade) + P('M10 32 H38 V38 H10 Z', jade) + R('M14 35 H34', '#a8e0c0', 1.2)
      + P('M21.9 20 H26.1 L29 22.9 V27.1 L26.1 30 H21.9 L19 27.1 V22.9 Z', '#f4f1ea')
      + R('M21.6 22.8 H26.4 M21.6 25 H23.4 M24.6 25 H26.4 M21.6 27.2 H26.4', K, 1.1) + H('M15 30 L15.8 19.5 L17.2 20.6 L16.6 30 Z', 0.4),

    /* ===== Y phục ===== */
    ao_vai: robe('#ece0c2', '#a0673a', leather),
    ao_da: robe('#a8744a', '#6b4528', '#4a2f1a', D('M16 33 H32 M16 38 H32', '#e8cfa0', 1.1)),
    thiet_giap: P('M14 10 Q5 11 5 22 Q10 20 14 19 Z', '#7f8c98') + P('M34 10 Q43 11 43 22 Q38 20 34 19 Z', '#7f8c98')
      + P('M14 9 Q24 5.5 34 9 L36 42 H12 Z', '#aab4bd') + R('M13.6 17 H34.4 M13.2 23 H34.8 M12.6 35 H35.4 M18 17 V23 M24 17 V23 M30 17 V23 M18 35 V42 M24 35 V42 M30 35 V42', K, 1.1, 0.5)
      + P('M18 7.4 Q24 12 30 7.4 V5.5 H18 Z', iron) + P('M12.9 28 H35.1 V32 H12.9 Z', leather) + C(24, 30, 2.4, gold) + H('M16 12 L15.5 26 L17.5 26 L18 11.5 Z', 0.35),
    kim_ti_giap: vest('#e9bf56', R('M13 21 L32 40 M13 29 L24 40 M20 16 L35 31 M28 16 L35 23 M35 21 L16 40 M35 29 L24 40 M27 16 L13 30 M19 16 L13 22', '#b8862a', 1, 0.8))
      + L('M15 6.5 L24 12 L33 6.5', '#fff3c4', 2) + H('M12 15 L13 38 L15 38 L14.5 15 Z', 0.4),
    nhuyen_vi_giap: P('M9 12 L4.5 10 L9 16.5 Z M9 20 L3.5 20.5 L9.6 24.5 Z M10 28 L4.5 30.5 L10.4 32.5 Z M39 12 L43.5 10 L39 16.5 Z M39 20 L44.5 20.5 L38.4 24.5 Z M38 28 L43.5 30.5 L37.6 32.5 Z M15 6 L12.5 1.5 L18 7.5 Z M33 6 L35.5 1.5 L30 7.5 Z', '#d6c6ae')
      + vest('#4a3b33', R('M14 19 q3 3 6 0 q3 3 6 0 q3 3 6 0 q3 3 6 0 M13 26 q3 3 6 0 q3 3 6 0 q3 3 6 0 q3 3 6 0 M13 33 q3 3 6 0 q3 3 6 0 q3 3 6 0 q3 3 6 0', '#9a8470', 1.2))
      + L('M15 6.5 L24 12 L33 6.5', red, 2),
    sa_mac_bao: robe('#e6c98c', '#b0503a', '#7a4a22', R('M15 34 H33 M15 38 H33', '#b0503a', 1.4, 0.6)),
    giao_long_giap: vest('#2f7a6a', R('M14 17 q3 3 6 0 q3 3 6 0 q3 3 6 0 q3 3 6 0 M13 24 q3 3 6 0 q3 3 6 0 q3 3 6 0 q3 3 6 0 M13 31 q3 3 6 0 q3 3 6 0 q3 3 6 0 q3 3 6 0', '#8fe0c8', 1.3))
      + L('M15 6.5 L24 12 L33 6.5', '#e6ad35', 2) + H('M12 14 L13 38 L15 38 L14.6 14 Z', 0.3),
    thien_tam_giap: glow(24, 24, 18, '#fff6d8', 0.4) + vest('#f2ecd8', R('M14 17 Q24 21 34 17 M13 24 Q24 28 35 24 M13 31 Q24 35 35 31', '#d9c890', 1.3)) + L('M15 6.5 L24 12 L33 6.5', '#e6ad35', 2),
    bang_tam_giap: glow(24, 24, 18, '#cfe8ff', 0.45) + vest('#dceefa', R('M14 17 Q24 21 34 17 M13 24 Q24 28 35 24 M13 31 Q24 35 35 31', '#9cc3ea', 1.3)) + L('M15 6.5 L24 12 L33 6.5', '#3d72b4', 2) + spark(40, 8, 2.6, '#fff'),
    tu_ha_bao: glow(24, 22, 18, '#d9b8ff', 0.4) + robe('#7e52a6', '#e6ad35', '#3a2a5a', R('M15 34 H33 M15 38 H33', '#c9a8ff', 1.4, 0.6)),

    /* ===== Quần ===== */
    quan_vai: pants('#e6d9bb', wood),
    quan_da: pants('#8f5f38', '#5c3a20'),
    quan_ho_tat: pants('#8b97a6', '#4f5966', E(15.4, 30, 4.4, 5.4, steel) + E(32.6, 30, 4.4, 5.4, steel) + C(15.4, 30, 1, K) + C(32.6, 30, 1, K)),
    ngan_ti_kho: pants('#cfd9e4', '#7f8c98', D('M17 15 L14 37 M31 15 L34 37 M21.5 15 L19 30 M26.5 15 L29 30', '#ffffff', 1.2, '1.6 2') + spark(33, 22, 2.6, '#fff')),
    sa_bao_kho: pants('#d9b77a', '#8b5a35', E(18, 30, 2, 1.5, '#7a4a22') + E(30, 24, 2, 1.5, '#7a4a22') + E(31, 34, 1.8, 1.4, '#7a4a22') + E(16, 20, 1.8, 1.4, '#7a4a22')),
    giao_tieu_kho: pants('#3f8a9a', '#1f4f6a', D('M17 15 L14 37 M31 15 L34 37', '#bfeaf2', 1.2, '1.6 2')),
    thien_tam_kho: pants('#efe7cf', '#2a3f6a', R('M14 20 Q18 22 21 20 M27 20 Q30 22 34 20', '#d9c890', 1.2)),
    tuyet_hoa_kho: pants('#eaf3fa', '#9cc3ea', spark(18, 26, 2.4, '#9cc3ea') + spark(30, 32, 2.2, '#9cc3ea')),
    tu_ha_kho: pants('#6a4596', '#e6ad35', D('M17 15 L14 37 M31 15 L34 37', '#c9a8ff', 1.2, '1.6 2')),
    // Long Lân Khố (bậc 10): xanh thẫm vân vảy rồng, viền vàng
    long_lan_kho: pants('#24407a', gold, R('M14 19 q1.5 2 3 0 q1.5 2 3 0 M27 19 q1.5 2 3 0 q1.5 2 3 0 M13.5 25 q1.5 2 3 0 q1.5 2 3 0 M28 25 q1.5 2 3 0 q1.5 2 3 0 M12.5 31 q1.5 2 3 0 q1.5 2 3 0 M29.5 31 q1.5 2 3 0 q1.5 2 3 0', '#86aee8', 1.2)
      + L('M9.4 41.4 H20.6 M27.4 41.4 H38.6', gold, 2.2)) + spark(41, 10, 2.8, '#ffe2a0'),

    /* ===== Giày ===== */
    giay_co: P('M14 8 Q24 3 34 8 Q37 24 34 40 Q24 46 14 40 Q11 24 14 8 Z', '#e3c27a')
      + R('M14 14 H34 M12.6 20 H35.4 M12.4 26 H35.6 M12.6 32 H35.4 M14 38 H34', '#b48a3e', 1.2)
      + L('M24 5.5 V14', leather, 2.4) + L('M13.6 18 Q24 12 34.4 18', leather, 2.6) + L('M12.8 28 Q24 22 35.2 28', leather, 2.6),
    giay_da_huou: boot('#c98f55', leather, '#5c3a20', C(20, 21, 1.3, '#f3dcb4') + C(23.5, 26, 1.3, '#f3dcb4') + C(19.5, 30.5, 1.3, '#f3dcb4') + C(33, 34, 1.3, '#f3dcb4')),
    truy_phong_hai: R('M1 15 H10 M0 22 H9 M2 29 H10', '#7fb4e6', 2.4) + boot(blue, '#eef4fb', '#26466e', R('M18 30 L22 22 L25 28 L29 25', '#9cc3ea', 1.4)),
    dap_tuyet_hai: glow(28, 24, 18, '#d8ecff', 0.5) + boot('#e8f1f8', blueL, '#7f8c98', R('M21.5 21 V32 M16.8 23.8 L26.2 29.2 M16.8 29.2 L26.2 23.8', '#5b8fc4', 1.4)) + spark(39, 12, 3.4) + spark(6, 30, 2.6),
    phong_sa_hai: boot('#d9b77a', '#b0503a', '#6b4a2f', R('M2 18 Q8 15 13 18 M0 26 Q6 23 11 26', '#e8c88a', 2)) + spark(40, 12, 2.6, '#ffe2a0'),
    dap_lang_hai: boot('#3f8a9a', '#bfeaf2', '#1f4f6a', R('M1 40 Q6 36 11 40 Q16 44 21 40', '#7fd0e8', 2)) + spark(40, 12, 2.6, '#bfeaf2'),
    van_doc_hai: boot('#3a5a2a', '#e8edf2', '#2a2228', C(22, 22, 2, '#9be35a') + C(18, 30, 1.6, '#9be35a')) + spark(40, 12, 2.6, '#c8f08a'),
    lang_van_hai: glow(28, 26, 16, '#e8f0ff', 0.5) + boot('#f2f4f8', '#9cc3ea', '#7f8c98', R('M2 34 Q7 30 12 34 M0 26 Q5 22 10 26', '#ffffff', 2.2)) + spark(40, 12, 3),
    van_ly_hai: glow(28, 26, 16, '#e6d8ff', 0.5) + boot('#4a3a6a', '#e6ad35', '#2a2228', R('M1 18 H12 M0 25 H10 M2 32 H11', '#c9a8ff', 2.2)) + spark(40, 12, 3, '#ffe2a0'),
    // Thanh Vân Hài (bậc 10): giày trắng vân mây xanh trời, nhẹ như mây
    thanh_van_hai: glow(28, 26, 17, '#d8ecff', 0.55) + cloud(8, 40, 0.5, '#e6f3fc')
      + boot('#f6f9fc', '#7fb8e6', '#4a7aa8', R('M16.5 20 q2 -3 4 0 q2 -3 4 0 M18.5 28 q2 -3 4 0 q2 -3 4 0 M29 34 q2 -3 4 0', '#7fb8e6', 1.4))
      + spark(40, 11, 3.2, '#ffffff') + spark(6, 22, 2.2, '#bfe0f8'),

    /* ===== Nhẫn ===== */
    ngoc_boi: ring('#cfd6dc', '#7cc79a', 'round'),
    nhan_phi_thuy: ring(gold, '#3fae6a', 'oval'),
    hong_ngoc_nhan: ring(gold, '#e0405a', 'cut'),
    huyet_ngoc_nhan: ring('#6a5a5a', '#b3121f', 'drop'),
    thong_linh_ngoc: glow(24, 15, 13, '#d9b8ff', 0.6) + ring(gold, '#9b5fd0', 'round', C(13, 33, 1.6, red) + C(35, 33, 1.6, '#3fae6a'))
      + R('M24 3 V5.5 M13 8 L15 10 M35 8 L33 10', goldL, 1.8),
    luu_ly_nhan: ring('#c0c8d0', '#39b0a0', 'cut', C(13, 33, 1.5, '#39b0a0') + C(35, 33, 1.5, '#39b0a0')),
    tran_chau_nhan: ring('#e6ad35', '#f4f1ea', 'round', C(13, 33, 1.6, '#f4f1ea') + C(35, 33, 1.6, '#f4f1ea')),
    ngu_doc_nhan: ring('#e8edf2', '#7ad151', 'drop', C(13, 33, 1.5, '#e04a8a') + C(35, 33, 1.5, '#e04a8a')),
    han_ngoc_nhan: glow(24, 15, 12, '#cfe8ff', 0.6) + ring('#c3ccd4', '#bfe6ff', 'cut'),
    thien_ha_nhan: glow(24, 15, 13, '#ffe2a0', 0.6) + ring('#e6ad35', '#7e52a6', 'cut', C(13, 33, 1.6, '#ffcf5a') + C(35, 33, 1.6, '#ffcf5a')) + spark(36, 6, 2.4, '#ffe2a0'),

    /* ===== Ngọc bội ===== */
    bach_ngoc_boi: pendant('#f3f1e8', red, 'disc'),
    thanh_ngoc_boi: pendant('#6cbf96', red, 'disc'),
    ho_tam_boi: pendant('#3f8f6a', gold, 'shield'),
    linh_lung_boi: pendant('#9fd6d0', blue, 'open'),
    han_ngoc_boi: pendant('#cfe9fb', '#d6dee6', 'crystal'),
    nguyet_thach_boi: glow(24, 24, 14, '#e8f0ff', 0.5) + pendant('#eef3fb', '#9cc3ea', 'disc'),
    san_ho_boi: pendant('#f07a6a', '#e6ad35', 'shield'),
    ngan_toa_boi: L('M24 3 V12', '#9aa6b2', 1.6) + P('M12 14 H36 Q40 14 39 20 L36 32 Q24 40 12 32 L9 20 Q8 14 12 14 Z', '#e8edf2')
      + R('M14 19 Q24 24 34 19 M15 26 Q24 31 33 26', '#9aa6b2', 1.3) + C(24, 22, 2.4, red) + L('M17 36 V44 M24 38 V46 M31 36 V44', '#9aa6b2', 1.4)
      + C(17, 45, 1.6, '#e8edf2') + C(24, 47, 1.6, '#e8edf2') + C(31, 45, 1.6, '#e8edf2'),
    tuyet_tinh_boi: glow(24, 24, 15, '#e8f6ff', 0.5) + pendant('#f4fbff', '#9cc3ea', 'crystal') + spark(36, 14, 2.4, '#fff'),
    ngoc_nu_boi: glow(24, 24, 15, '#f4e8ff', 0.5) + pendant('#f4f1ea', '#c9a8ff', 'disc'),

    /* ===== Bốn ô trang bị mới (2026-10-28): mỗi ô một hình dùng chung cho cả 10 bậc ===== */
    day_chuyen: R('M11 8 Q24 34 37 8', '#bfb6a0', 3.2) + R('M11 8 Q24 34 37 8', '#efe8d6', 1.6) + P('M24 27 L30.5 35 L24 44 L17.5 35 Z', '#7fd0e8')
      + H('M21.5 34 L24 30.5 L26 33 L23.5 35.5 Z', 0.8) + C(24, 26, 2.2, gold),
    dai_lung: P('M5 19 H43 V30 H5 Z', '#8a5a32') + R('M7 23 H41', '#b07a46', 1.5) + S('M5 27 H43 V30 H5 Z')
      + P('M18 15.5 H30 V33.5 H18 Z', '#d9a441') + C(24, 24.5, 3.6, '#4fbf8a') + H('M20 17.5 H23 V20 H20 Z', 0.7),
    phi_phong: P('M16 7 H32 L40.5 40 Q24 45.5 7.5 40 Z', '#b3362b') + R('M20 17 Q24 30 21.5 40 M28 17 Q26 30 30 40', '#7d2018', 1.5)
      + P('M16 7 Q24 14.5 32 7 L30 11.5 Q24 16 18 11.5 Z', '#e9c35a') + C(24, 11, 2.6, '#e9c35a') + H('M14 33 L17 14 L18.5 15 L16 33 Z', 0.35),
    ho_thu: P('M7 14 Q7 9.5 11.5 9.5 H20 Q23.5 9.5 23.5 14 V36 Q23.5 39.5 20 39.5 H11.5 Q7 39.5 7 35 Z', '#c8ced6')
      + P('M26.5 14 Q26.5 9.5 31 9.5 H37 Q41 9.5 41 14 V35 Q41 39.5 36.5 39.5 H30 Q26.5 39.5 26.5 36 Z', '#aeb6c0')
      + R('M7 20 H23.5 M7 27 H23.5 M26.5 20 H41 M26.5 27 H41', K, 1.4) + H('M10 13 H13 V18 H10 Z', 0.7),

    /* ===== Đan dược ===== */
    thuoc_tri_thuong: P('M24 40 Q12 30 14 11 Q26 20 24 40 Z', green) + P('M24 40 Q36 30 34 11 Q22 20 24 40 Z', '#5a9a3e') + P('M24 40 Q21.5 22 24 5 Q28.5 22 24 40 Z', '#7cc25a')
      + R('M24 38 L17 18 M24 38 L31 18 M24 38 V10', greenD, 1.1, 0.7) + L('M24 40 V46.5', greenD, 2.6) + P('M19.5 37.5 H28.5 V42 H19.5 Z', red),
    kim_sang_duoc: P('M19 14 H29 V19 Q36 23 36 32 Q36 43 24 43 Q12 43 12 32 Q12 23 19 19 Z', '#f3f1ea') + R('M13.5 27.5 Q24 31 34.5 27.5', blue, 2.2)
      + P('M20 30.5 H28 V39 H20 Z', red) + P('M18 9 H30 V14 H18 Z', red) + C(24, 7.5, 2, red) + H('M15.5 30 Q16 23 20.5 21 Q18 26 17.6 34 Z', 0.6),
    // viên đan vàng đặt trong hộp gấm đỏ
    dai_hoan_dan: P('M5 30 H43 V41 Q43 44 40 44 H8 Q5 44 5 41 Z', redD) + P('M5 30 H43 V33.5 H5 Z', red) + R('M10 38.5 H38', gold, 1.4)
      + glow(24, 21, 14, goldL, 0.5) + pill(24, 21, 10.5, '#f0b93a') + R('M17.5 21 Q24 25.5 30.5 21', '#c08a1e', 1.3, 0.8)
      + spark(40, 10, 3.4) + spark(8, 13, 2.6),
    hoi_khi_dan: pill(32, 19, 8, '#8fbdea') + pill(18.5, 29, 10, '#4f86c6'),
    tuyet_lien: P('M10 42 Q24 36 38 42 Q24 46.5 10 42 Z', green) + P('M24 40 Q12 36 8 22 Q18 24 24 40 Z', '#dce9f3') + P('M24 40 Q36 36 40 22 Q30 24 24 40 Z', '#dce9f3')
      + P('M24 40 Q14 28 18 12 Q26 22 24 40 Z', '#f4f8fb') + P('M24 40 Q34 28 30 12 Q22 22 24 40 Z', '#f4f8fb') + P('M24 40 Q19 24 24 7 Q29 24 24 40 Z', '#ffffff')
      + E(24, 34.5, 4, 2.6, '#f2cf6a'),
    giai_doc_dan: P('M7 41 Q5 17 29 9 Q31 33 7 41 Z', green) + R('M8 40 L26 13', greenD, 1.2, 0.7) + pill(29, 30, 10.5, '#c9ecae'),
    // Thuốc hồi máu bậc cao. Cửu Chuyển Hoàn: viên đan đỏ thẫm quấn vòng vàng, đặt trong đĩa
    cuu_chuyen_hoan: glow(24, 21, 16, '#ffb0a0', 0.45) + P('M5 33 Q24 30 43 33 Q41 44 24 44 Q7 44 5 33 Z', '#c9a066') + R('M9 37.5 Q24 39.5 39 37.5', '#8a6a3a', 1.2, 0.7)
      + pill(24, 21, 12, '#c0302a') + R('M13.5 18 Q24 12.5 34.5 18 M13 25 Q24 31 35 25', gold, 1.7) + R('M21.5 21.5 q2.5 -3.5 5 0 q-1 3 -3.5 2', goldL, 1.3)
      + spark(41, 9, 3, '#ffe2a0') + spark(7, 14, 2.4, '#ffe2a0'),
    // Thiên Hương Tục Mệnh Cao: hũ ngọc nhỏ đựng cao vàng đỏ, tỏa sáng nhẹ
    thien_huong_cao: glow(24, 15, 15, '#ffd27a', 0.55) + P('M15 17 Q24 7 33 17 Z', '#f08a3a') + H('M19 15 Q22 11.5 26 11.2 Q22 13.5 21 16 Z', 0.55)
      + P('M13 20 Q10.5 23 10.5 30 Q10.5 43 24 43 Q37.5 43 37.5 30 Q37.5 23 35 20 Z', jade) + P('M13.5 16 H34.5 V21 H13.5 Z', '#2f7a58')
      + R('M12 30 Q24 33 36 30', '#a8e0c0', 1.4) + H('M14 25 Q14.5 34 18.5 39 Q15.5 34.5 15.8 25 Z', 0.4) + spark(40, 9, 2.8, '#ffe2a0'),
    // Thuốc hồi nội lực. Bổ Khí Đan: đôi viên xanh lam trên chiếc lá
    bo_khi_dan: P('M5 39 Q9 17 41 11 Q39 36 5 39 Z', green) + R('M7 37 L37 14', greenD, 1.2, 0.7)
      + pill(19.5, 29, 7.5, '#4f86c6') + pill(31, 21.5, 6.5, '#8fbdea'),
    // Tử Kim Linh Dịch: lọ thon chứa nước tím ánh vàng
    tu_kim_linh_dich: glow(24, 30, 14, '#d9b8ff', 0.5) + P('M19 14 H29 V38 Q29 44 24 44 Q19 44 19 38 Z', '#eef2f6')
      + P('M19 23 H29 V38 Q29 44 24 44 Q19 44 19 38 Z', '#7e52a6') + R('M20.5 29 Q24 26 27.5 30 M20.8 35.5 Q24 32.5 27.2 36.5', gold, 1.4)
      + P('M20.5 8.5 H27.5 V14 H20.5 Z', '#eef2f6') + P('M19.6 3.5 H28.4 V8.8 H19.6 Z', wood) + H('M20.6 16 H22 V39 Q21 39 20.6 37 Z', 0.55)
      + spark(36, 12, 2.8, '#ffe2a0') + spark(11, 22, 2.2, '#e6d8ff'),
    // Bích Ngọc Thanh Tâm Lộ: bình ngọc xanh biếc, giọt sương đọng quanh
    bich_ngoc_lo: glow(24, 30, 16, '#c8f5e4', 0.5) + P('M17 16 H31 V20 Q39 24 39 32 Q39 43 24 43 Q9 43 9 32 Q9 24 17 20 Z', '#3fae8a')
      + R('M10.5 31 Q24 35 37.5 31', '#bff0e0', 1.4) + P('M18 10 H30 V16 H18 Z', '#2f7a68') + C(24, 8, 2.6, gold)
      + H('M12.5 28 Q13 35 17 39.5 Q14 35 14.4 28 Z', 0.45) + drop(41.5, 14, 1.5, '#bff0e0') + drop(6.5, 20, 1.2, '#bff0e0') + drop(36.5, 5.5, 1, '#bff0e0'),
    // Đan dược hồi dần, màu lên theo bậc
    duong_khi_hoan: regenPill('#c9ecae', '#d8f5c4'),
    hoan_duong_dan: regenPill('#f5a04a', '#ffd0a0', R('M17 21 Q24 25 31 21', '#c96a1e', 1.2, 0.7)),
    tuc_menh_dan: regenPill('#d9472f', '#ffcf7a', R('M15.5 20 Q24 15 32.5 20 M15 26 Q24 31 33 26', gold, 1.5)),
    ngoc_lo_hoan: regenPill('#f4f6f2', '#d6ecff', drop(24, 24, 1.7, '#9cc8ee')),

    /* ===== Nguyên liệu ===== */
    // hải đồ cuộn trong ống tre
    // mật rắn trắng Bạch Đà đựng trong túi da trắng

    /* ===== Đồ cốt truyện, bí kíp ===== */
    // nửa miếng ngọc tròn, nửa kia chỉ còn nét đứt

    // Thiếu Lâm: gỗ nâu cam, tràng hạt quanh bông sen
    // Võ Đang: gỗ lam xám, thái cực đồ
    // Nga Mi: gỗ tím, trăng khuyết trên đỉnh núi
    // Cái Bang: gỗ xanh lục, cây gậy trúc và hồ lô
    // bản đồ vẽ trên mảnh da dê: cồn cát, đường đi, dấu X
    // một phần tư lệnh bài ngọc đen, mép vỡ, khắc chữ ánh vàng
    bi_kip: scroll(red),
    // Truy Nã Hiệp Khách: bảng cáo thị; mảnh nội công / mảnh võ học (trang sách rách, để đổi võ học sau này)
    truy_na: P('M9 4 H39 V44 H9 Z', '#efe1bf') + P('M9 4 H39 V13 H9 Z', red) + R('M14 8.5 H34', '#f3dfa6', 2.2, 0.9)
      + C(24, 23, 5.5, '#5a4632') + P('M14.5 37 Q14.5 29 24 29 Q33.5 29 33.5 37 Z', '#5a4632') + R('M13 41 H35', red, 1.8, 0.8)
      + C(12, 7, 1.6, goldL) + C(36, 7, 1.6, goldL),
    // Kỳ ngộ Cành Mai Trong Tuyết
    // Kỳ ngộ Thạch Bích Hậu Sơn: vách đá khắc năm thanh kiếm
    // Kỳ ngộ Tiếng Tiêu Đào Hoa: ống tiêu ngọc giữa hoa đào
    // Kỳ ngộ Kim Xà Động: rắn vàng quấn quanh thanh kiếm

    /* ===== Thú ===== */
    soi_hoang: wolf('#8d8579', '#d6cdbf', '#f2cf6a'),
    tuyet_lang: wolf('#e9f0f6', '#ffffff', '#7fc4ff'),
    sa_lang: wolf('#d9b06a', '#f2e2bc', '#ff9a3a') + R('M12 14 L15 18 M36 14 L33 18', '#a8783a', 1.4),
    kim_hat: scorpion('#e6ad35', '#a8781a', ''),
    kim_hat_vuong: glow(24, 30, 18, '#ffd77a', 0.35) + scorpion('#f0b830', '#8e5a10', P('M17.5 19 L19 13 L21.5 17 L24 11.5 L26.5 17 L29 13 L30.5 19 Z', red) + C(24, 15.5, 1.3, goldL)),
    xa_doc: L('M7 42 Q22 46.5 34 40 Q43 34 32 29.5 Q20 25.5 22 19 Q24 13.5 29 12.5', K, 9.4) + L('M7 42 Q22 46.5 34 40 Q43 34 32 29.5 Q20 25.5 22 19 Q24 13.5 29 12.5', '#f2efe6', 6.2)
      + D('M7 42 Q22 46.5 34 40 Q43 34 32 29.5 Q20 25.5 22 19 Q24 13.5 29 12.5', '#c9c2b0', 2.2, '2 4')
      + P('M25.5 13.5 Q25.5 5.5 33 5.5 Q40.5 6.5 40.5 11.5 Q39.5 17 32 17 Q26.5 17 25.5 13.5 Z', '#f2efe6')
      + C(34.8, 10.2, 1.9, '#e0353b') + C(35.1, 10.2, 0.8, K) + L('M40 12.5 H44 L46.5 10.5 M44 12.5 L46.5 14.5', red, 1.4),
    tuyet_nguyen_lang: wolf('#f2f6fa', '#ffffff', '#3f9ae8') + R('M12 14 L15 18 M36 14 L33 18 M24 13 V18', blueL, 1.4) + spark(6, 8, 2.6, '#e8f4ff') + spark(43, 40, 2.2, '#e8f4ff'),
    tuyet_dieu: P('M24 22 Q12 9 1.5 13 Q7 19 5 24 Q13 22 18 29 Z', '#f2f6fa') + P('M24 22 Q36 9 46.5 13 Q41 19 43 24 Q35 22 30 29 Z', '#f2f6fa')
      + R('M6 16 L13 20 M8 21 L15 23 M42 16 L35 20 M40 21 L33 23', '#9fb8cc', 1.2)
      + P('M18 38 L24 46 L30 38 Z', '#e4ecf2') + E(24, 30, 7.5, 10, '#f6f9fb') + R('M20 28 Q24 30 28 28 M20 33 Q24 35 28 33', '#c6d4e0', 1.2)
      + C(24, 16, 6.5, '#f6f9fb') + P('M24 18 L29.5 20 Q28 23.5 24.5 22.5 Z', gold) + C(21.5, 15, 1.4, K) + C(26.5, 15, 1.4, K)
      + L('M21 40 L19 44 M27 40 L29 44', gold, 1.8),
    han_bang_quai: glow(24, 26, 20, '#bfe3f7', 0.4) + P('M6 46 L9 32 L5 24 L12 20 L16 34 L14 46 Z M42 46 L39 32 L43 24 L36 20 L32 34 L34 46 Z', '#9ccbe8')
      + P('M14 44 L12 22 L18 10 L30 10 L36 22 L34 44 Z', '#b8def2') + R('M18 10 L22 22 L14 30 M30 10 L26 22 L34 30 M22 22 H26 M20 36 L24 30 L28 36', '#7fb4d8', 1.4)
      + P('M17 18 L21 17 L21 21 L17 21 Z M27 17 L31 18 L31 21 L27 21 Z', '#1e5a88') + C(19, 19.4, 1.1, '#e8f8ff') + C(29, 19.4, 1.1, '#e8f8ff')
      + H('M16 14 L18.5 11 L16 26 Z', 0.6),
    tuyet_quai_vuong: glow(24, 26, 21, '#bfe3f7', 0.4) + P('M4 46 Q2 30 8 24 L5 18 L11 18 Q12 7 24 6 Q36 7 37 18 L43 18 L40 24 Q46 30 44 46 Z', '#f2f6fa')
      + P('M14 12 L13 3 L18 9 L21 1 L24 8 L27 1 L30 9 L35 3 L34 12 Z', '#bfe3f7')
      + P('M15 22 Q15 15 24 15 Q33 15 33 22 Q34 33 24 35 Q14 33 15 22 Z', '#a8bccc')
      + L('M15 19 L22 22 M33 19 L26 22', K, 2.4) + C(19.5, 23.5, 1.6, '#3f9ae8') + C(28.5, 23.5, 1.6, '#3f9ae8')
      + P('M18 29 Q24 33 30 29 L28 31.5 L26.5 29.8 L24 32.4 L21.5 29.8 L20 31.5 Z', '#fff') + R('M8 34 L12 32 M8 40 L12 38 M40 34 L36 32 M40 40 L36 38', '#c6d4e0', 1.4),
    cu_giai: crab('#d8483a', '#8e2a20'),
    cu_giai_vuong: glow(24, 28, 19, '#ffb08a', 0.35) + crab('#c83a2e', '#7a1e18', C(17, 23.5, 2, '#efeadc') + C(22, 22, 2.2, '#efeadc') + C(27, 22, 2, '#efeadc') + C(31.5, 23.8, 1.8, '#efeadc')),
    hai_xa: L('M7 42 Q22 46.5 34 40 Q43 34 32 29.5 Q20 25.5 22 19 Q24 13.5 29 12.5', K, 9.4) + L('M7 42 Q22 46.5 34 40 Q43 34 32 29.5 Q20 25.5 22 19 Q24 13.5 29 12.5', '#f2efe6', 6.2)
      + D('M7 42 Q22 46.5 34 40 Q43 34 32 29.5 Q20 25.5 22 19 Q24 13.5 29 12.5', '#3f6fb0', 6.2, '4 4')
      + P('M25.5 13.5 Q25.5 5.5 33 5.5 Q40.5 6.5 40.5 11.5 Q39.5 17 32 17 Q26.5 17 25.5 13.5 Z', '#3f6fb0')
      + C(34.8, 10.2, 1.8, '#f2cf6a') + C(35.1, 10.2, 0.8, K) + P('M3 41 L7 37.5 L8.5 45.5 Z', '#3f6fb0'),
    huyet_sa: P('M7 27 L1.5 16 L5 27 L1.5 38 Z', '#a8302a') + P('M21 19 L27 7 L31 19 Z', '#a8302a')
      + P('M4 27 Q15 16 31 18 Q41 19 47 26 Q41 33 31 34 Q15 36 4 27 Z', '#c8402f') + P('M12 29 Q24 35 38 31 Q30 34 22 34 Q15 33 12 29 Z', '#f2d8d0')
      + C(37, 23.5, 1.6, K) + P('M35 28.5 L37 31 L39 28.4 L41 30.6 L43 28 Z', '#fff') + R('M28 21 Q27 25 28 29 M31 21 Q30 25 31 29', '#8e2a20', 1.2)
      + H('M14 22 Q22 18 30 19 Q22 21 16 25 Z', 0.4),
    huyet_co_trung: R('M14 22 L6 18 M13 28 L4 28 M14 34 L6 39 M34 22 L42 18 M35 28 L44 28 M34 34 L42 39', K, 3)
      + R('M14 22 L6 18 M13 28 L4 28 M14 34 L6 39 M34 22 L42 18 M35 28 L44 28 M34 34 L42 39', '#7a1418', 1.6)
      + E(24, 29, 11, 14, '#b8262a') + L('M24 16 V43', K, 1.6) + R('M17 22 Q20 20 22 23 M26 23 Q28 20 31 22', '#e0505a', 1.4)
      + E(24, 13.5, 6, 4.5, '#5e1418') + L('M21 10 L17 4 M27 10 L31 4', K, 1.6) + C(21.5, 13, 1, '#ffcf5a') + C(26.5, 13, 1, '#ffcf5a')
      + H('M16 26 Q17 20 21 18 Q18.5 23 18.5 31 Z', 0.4),
    doc_chu: R('M17 24 Q8 16 4 20 M16 28 Q6 26 2 32 M17 32 Q9 36 6 44 M19 35 Q14 42 14 47 M31 24 Q40 16 44 20 M32 28 Q42 26 46 32 M31 32 Q39 36 42 44 M29 35 Q34 42 34 47', K, 2.6)
      + E(24, 31, 9, 10, '#2a2228') + C(24, 19, 6, '#2a2228') + P('M24 26 L27 30 L24 34 L21 30 Z', '#d6283a') + P('M22 34.5 L26 34.5 L24 38 Z', '#d6283a')
      + C(21.6, 18, 1.2, '#ff5a3a') + C(26.4, 18, 1.2, '#ff5a3a') + C(24, 16.4, 0.9, '#ff5a3a') + H('M18 28 Q19 23.5 22 22.5 Q20 26 20 31 Z', 0.3),
    kim_tam_co: silkworm('#f0c040', '#a8781a'),
    kim_tam_co_vuong: silkworm('#f5c83a', '#8e5a10', glow(28, 26, 19, '#ffd77a', 0.4)) + P('M29 11 L30.5 5 L33 9 L34.5 3.5 L36 9 L38.5 5 L40 11 Z', red),
    ran_doc: L('M7 42 Q22 46.5 34 40 Q43 34 32 29.5 Q20 25.5 22 19 Q24 13.5 29 12.5', K, 9.4) + L('M7 42 Q22 46.5 34 40 Q43 34 32 29.5 Q20 25.5 22 19 Q24 13.5 29 12.5', '#6cb04f', 6.2)
      + D('M7 42 Q22 46.5 34 40 Q43 34 32 29.5 Q20 25.5 22 19 Q24 13.5 29 12.5', greenD, 2.2, '2 4')
      + P('M25.5 13.5 Q25.5 5.5 33 5.5 Q40.5 6.5 40.5 11.5 Q39.5 17 32 17 Q26.5 17 25.5 13.5 Z', '#6cb04f')
      + C(34.8, 10.2, 1.8, '#f2cf6a') + C(35.1, 10.2, 0.8, K) + L('M40 12.5 H44 L46.5 10.5 M44 12.5 L46.5 14.5', red, 1.4),
    thach_mang: L('M5 44 Q20 47 34 42 Q45 36 36 29 Q24 23 26 15 Q27 9 31 8', K, 11) + L('M5 44 Q20 47 34 42 Q45 36 36 29 Q24 23 26 15 Q27 9 31 8', '#8a7a62', 8)
      + D('M5 44 Q20 47 34 42 Q45 36 36 29 Q24 23 26 15 Q27 9 31 8', '#5a4a38', 3, '3 4')
      + P('M24 9 Q24 1 33 1.5 Q42 2.5 42 8 Q41 14 33 14 Q26 14 24 9 Z', '#8a7a62')
      + P('M34 5 L38.6 6 L35.6 8.6 Z', '#f2cf6a') + C(35.8, 6.6, 0.8, K) + L('M41.4 9.6 H45.4 L47.4 8 M45.4 9.6 L47.4 11.4', red, 1.4),
    kim_dieu: P('M5 44 Q3 26 13 15 Q23 6 33 10 L43 16 Q46 22 41 25 L35 24 Q32 34 23 45 Z', '#8a5a2c')
      + P('M13 15 Q23 6 33 10 L36 17 Q26 15 16 23 Z', goldL) + R('M12 31 Q17 28 22 31 M10 37 Q16 34 21 37', '#5a3a1a', 1.4, 0.7)
      + P('M34 11.5 Q45 10.5 46 18 Q45.5 23.5 41 22.5 Q42 18.5 36.5 18.5 Z', gold) + L('M37 18.5 Q40 17.5 42 19.5', K, 1.2)
      + L('M25 13.5 L32 15.5', K, 1.9) + C(29, 18, 2.1, '#f2b83a') + C(29.2, 18, 1, K),
    bao_vang: P('M10 8 L15 16 L9 18 Z M38 8 L33 16 L39 18 Z', '#e6a838') + P('M8 22 Q9 10 24 10 Q39 10 40 22 Q40 36 32 41 Q24 45 16 41 Q8 36 8 22 Z', '#e6a838')
      + P('M17 30 Q17 24 24 24 Q31 24 31 30 Q31 39 24 40 Q17 39 17 30 Z', '#fbe6b8') + P('M21.4 29 H26.6 L24 32 Z', K)
      + C(14, 19, 1.4, '#7a4a1e') + C(34, 19, 1.4, '#7a4a1e') + C(12, 27, 1.3, '#7a4a1e') + C(36, 27, 1.3, '#7a4a1e') + C(24, 15, 1.4, '#7a4a1e') + C(19, 13, 1.2, '#7a4a1e') + C(29, 13, 1.2, '#7a4a1e')
      + P('M15 21 L20.6 22.4 L18.4 24.8 Z', '#7fd16a') + P('M33 21 L27.4 22.4 L29.6 24.8 Z', '#7fd16a') + C(18.6, 22.9, 0.8, K) + C(29.4, 22.9, 0.8, K)
      + L('M24 32 V35 M21 36.4 Q24 38 27 36.4', K, 1.3),
    bang_nhan: glow(24, 24, 20, '#cfe8ff', 0.4) + P('M14 14 L24 6 L34 14 L33 26 L24 31 L15 26 Z', '#bfe0f2')
      + P('M10 46 L13 31 L24 33 L35 31 L38 46 Z', '#a8d0ea') + R('M24 6 V31 M14 14 L33 26 M34 14 L15 26', '#fff', 1, 0.6)
      + P('M18 19 L22 20 L21 22 Z M30 19 L26 20 L27 22 Z', '#3d72b4') + L('M40 10 L33 38', '#e8f4fb', 2.4) + spark(41, 8, 3),
    gau_den: C(12, 13, 6, '#5a3c28') + C(36, 13, 6, '#5a3c28') + C(12, 13, 3, '#8b6a4a') + C(36, 13, 3, '#8b6a4a')
      + E(24, 27, 16.5, 15.5, '#5a3c28') + E(24, 33, 8.4, 6.8, '#b08960') + E(24, 30.4, 3.4, 2.3, K)
      + L('M24 32.6 V35.4 M20.6 36.6 Q24 38.8 27.4 36.6', K, 1.4) + C(17.4, 24, 1.9, K) + C(30.6, 24, 1.9, K)
      + L('M14.5 20 L20 21.6 M33.5 20 L28 21.6', K, 1.6),
    tuyet_quai: P('M6 30 L4 20 L10 18 L9 10 L16 12 L18 5 L24 9 L30 5 L32 12 L39 10 L38 18 L44 20 L42 30 L44 38 L36 40 L34 46 L24 42 L14 46 L12 40 L4 38 Z', '#eef4f9')
      + P('M14 22 Q24 16 34 22 Q36 34 24 38 Q12 34 14 22 Z', '#9fb3c6') + eye.angry
      + P('M18 31 Q24 35.5 30 31 Q24 33 18 31 Z', K) + P('M19.5 31.6 L21 36 L22.5 32.3 Z', '#fff') + P('M28.5 31.6 L27 36 L25.5 32.3 Z', '#fff'),
    moc_nhan: P('M12 42 H36 V46 H12 Z', '#7a4e2c') + P('M6 19 H19 V23.5 H6 Z', '#b07a4a') + P('M29 25 H42 V29.5 H29 Z', '#b07a4a') + P('M8 32 H19 V36 H8 Z', '#b07a4a')
      + P('M18.5 13 H29.5 V42 H18.5 Z', '#c48c58') + C(24, 8.5, 6, '#c48c58') + R('M22 17 Q23 24 21.5 31 M26.5 20 Q25.5 28 27 37', '#8a5a32', 1.2)
      + H('M20.5 15 H22.5 V39 H20.5 Z', 0.35) + H('M20.5 6.5 Q22 3.8 25 3.6 Q22 6 21.5 9 Z', 0.45),
    chim_hong: P('M20 22 L5 7 Q16 9.5 27 20 Z', '#a89a88') + P('M8 28 Q14 22 26 22 Q36 22 40 18 Q43.5 15.5 46 17.6 L42.4 21 Q38 26 30 30 Q18 34 8 28 Z', '#c9bba6')
      + P('M18 24 Q22 10 34 4 Q32.5 16 28 26 Z', '#b3a38f') + P('M8 28 L2 25.6 L3.6 31 Z', '#8f8170') + C(41.8, 18.4, 1.1, K) + P('M45.6 17.2 L48 18.6 L45 19.6 Z', gold)
      + R('M22 23 Q25 14 31 8', '#fff', 1, 0.5),

    /* ===== Nhân vật ===== */
    ta_co_hong: P('M30 13 Q43 17 39 35 Q36.5 26 30 21.5 Z', '#3b3438') + bust('#6e7f8f', '#e9dfc8') + head()
      + P('M12.5 23 Q11 10 24 10.5 Q37 10 35.5 23 Q34 17 29 15.5 Q27 19 21 17.5 Q17 18 12.5 23 Z', '#3b3438') + C(24, 8.4, 4, '#3b3438')
      + P('M27 6.5 L31.5 4 L30.4 8.6 Z', orange) + R('M19 12.4 Q24 11 29 12.4', '#a8a8b8', 1.4)
      + L('M17 22.2 L22 23', K, 1.8) + L('M31 22.2 L26 23', K, 1.8) + C(19.5, 25.4, 1.6, K) + C(28.5, 25.4, 1.6, K)
      + R('M16.5 30.5 Q24 38.5 31.5 30.5', '#7a6a5a', 2.6, 0.4) + mouth.line,
    tho_ren_dc: bust('#6b4a2f', null) + head(tan) + P('M12.6 18 Q13 10 24 10 Q35 10 35.4 18 Z', black)
      + P('M12.4 17.5 H35.6 V21.5 H12.4 Z', red) + L('M35 19 L40.5 22.5 M35 20.5 L39.5 25.5', red, 2)
      + eye.stern + beardShort(black) + mustache(black) + S('M29 27 Q32 26.5 32.6 29 Q30.5 29.6 29 27 Z', 0.35),
    diet_tuyet: bust('#7a7a80', '#4a4a52') + head() + hood('#4f4f58') + P('M14 16 H34 V19.5 H14 Z', '#e9e4d8')
      + L('M16.6 22 L22 23.6', K, 1.8) + L('M31.4 22 L26 23.6', K, 1.8) + L('M17.6 25.6 H21.6 M26.4 25.6 H30.4', K, 1.8) + mouth.frown,

    tue_nang: bust(gold, red) + L('M9 41 L31 48', red, 3) + E(12, 25, 2.4, 3.4, skin) + E(36, 25, 2.4, 3.4, skin) + E(24, 24.5, 12.6, 12.8, skin)
      + C(20.5, 14, 0.9, K) + C(24, 13.4, 0.9, K) + C(27.5, 14, 0.9, K)
      + L('M16.5 23.5 Q19.5 21 22.5 23.5', K, 1.7) + L('M25.5 23.5 Q28.5 21 31.5 23.5', K, 1.7)
      + C(15.5, 28.5, 2.4, '#f2a0a0') + C(32.5, 28.5, 2.4, '#f2a0a0') + P('M19.5 29.5 Q24 35 28.5 29.5 Z', '#fff'),
    tong_thanh_phong: bust('#4a6fa5', '#e9e4d8') + head() + C(24, 9.5, 4.2, black) + capHair(black) + P('M20.5 6.5 H27.5 V9.5 H20.5 Z', blueL)
      + L('M16.5 22.6 L22 23.4', K, 1.8) + L('M31.5 21.8 L26 23.4', K, 1.8)
      + P('M17.6 25.4 Q19.8 24 22 25.4 Q19.8 26.4 17.6 25.4 Z', K) + P('M26 25.4 Q28.2 24 30.4 25.4 Q28.2 26.4 26 25.4 Z', K)
      + L('M21 31.2 Q25 32.2 27.6 29.6', K, 1.6),
    // Bốn thành lớn: hòa thượng khất thực (Lạc Dương), lão quân giữ thành (Tương Dương),
    // bà chủ quán trà (Thành Đô), thương nhân Hồ mũ nhọn (Trường An)

    minh_chu: bust('#2f4a7a', gold) + head() + P('M12.6 24 Q12.4 17 14.4 15.4 V24 Z M35.4 24 Q35.6 17 33.6 15.4 V24 Z', '#2a2228')
      + P('M12 17.5 Q12 8 24 7.5 Q36 8 36 17.5 Q24 14.5 12 17.5 Z', '#25222a') + C(24, 11, 2, '#7cc79a')
      + L('M17 24.6 Q19.5 22.6 22 24.6', K, 1.6) + L('M26 24.6 Q28.5 22.6 31 24.6', K, 1.6)
      + P('M21.6 31.4 Q22 40.5 24 45 Q26 40.5 26.4 31.4 Q24 32.8 21.6 31.4 Z', '#2a2228')
      + L('M17.4 30 Q16.8 35 18 39 M30.6 30 Q31.2 35 30 39', '#2a2228', 1.5) + mustache('#2a2228'),
    cuu_vu_linh: P('M9 44 L11 20 Q11 8 24 8 Q37 8 37 20 L39 44 Z', '#1e1a22') + bust('#b8262a', gold) + head()
      + P('M12.5 22 Q12 10 24 10 Q36 10 35.5 22 Q31 15 26 17.5 Q22 14 12.5 22 Z', '#1e1a22') + C(24, 7.6, 4, '#1e1a22')
      + L('M27.5 6 L34 3 M28 8 L35 9', red, 2.2) + eye.lady + P('M22 31 Q24 30 26 31 Q24 32.4 22 31 Z', '#c0283a')
      + P('M24 13.4 L25.3 15.2 L24 17 L22.7 15.2 Z', red),
    // Mã lão bản: thương nhân béo, khăn xếp, tràng hạt
    // A Y Na: cô gái Tây Vực tóc xoăn, mắt xanh, khăn trùm đỏ viền tiền vàng, loan đao
    // Đô đốc Lăng: da rám nắng, mũ trụ có chùm lông đỏ
    // Thủy Linh: cô gái mò ngọc trai, tóc ướt, áo xanh, chuỗi ngọc trai
    // Mai Kiếm: nữ kiếm khách Linh Thứu Cung, áo xanh lục, trâm hoa mai
    // Lam Điệp: em gái Lam Phượng, áo chàm Miêu, mũ bạc, chuông bạc
    /* ===== Quái hình người ===== */
    son_tac: bust(leather, '#5c3a20') + head(tan) + P('M12.6 17 Q13 9 24 9 Q35 9 35.4 17 Z', black) + P('M12.4 16.6 H35.6 V20.6 H12.4 Z', red)
      + L('M35 18.6 L41 22.6 M35 20 L40 26', red, 2) + eye.angry + R('M28 19.5 L32 29', '#b0605a', 1.6) + beardShort('#3a2a22') + mouth.frown,
    // Sa Tặc: khăn quấn đầu màu cát, khăn che mặt, loan đao
    sa_tac: P('M37 47 Q46 31 40 15 Q45.5 30 39.5 47 Z', steel) + bust('#c9a46a', '#8e4a2a') + head(tan) + hood('#d9b878', '#a8823a')
      + maskLow('#b0503a') + R('M15 31 Q24 34 33 31', '#8e3a2a', 1.2, 0.7) + eye.angry,
    sa_tac_dau_muc: bust('#8e4a2a', gold) + head(tan) + P('M10.5 20 Q9.5 7 24 6.5 Q38.5 7 37.5 20 Q31 15.5 24 16 Q17 15.5 10.5 20 Z', '#3a2a22')
      + R('M12 16 Q24 9 36 16', '#5a4a3a', 1.4) + C(24, 11.6, 2.4, red) + eye.angry + R('M28 20 L32 29', '#b0605a', 1.6)
      + beardShort('#2a2228') + mustache('#2a2228') + EO(hole(12.4, 31, 2.8) + hole(12.4, 31, 1.4), gold) + EO(hole(35.6, 31, 2.8) + hole(35.6, 31, 1.4), gold),
    // Bạch Đà Sơn: áo trắng viền ngọc lam, trượng đầu rắn
    bach_da_de_tu: L('M40 47 L41 9', K, 4.2) + L('M40 47 L41 9', '#7a6a58', 2.4)
      + P('M37 10 Q37.5 3.5 43 3.5 Q47 5 45.5 9 Q42.5 12 37 10 Z', '#3f9b6e') + C(42.6, 6.4, 0.9, red) + L('M37.5 9 L34.5 10 M34.5 10 L32.5 8.6 M34.5 10 L32.8 11.6', red, 1.1)
      + bust('#f2ede2', '#39b0a0') + head() + capHair(black) + P('M12.4 17.6 H35.6 V20.4 H12.4 Z', '#f2ede2') + C(24, 19, 1.4, '#39b0a0') + eye.stern + mouth.line,
    bach_da_truong_lao: L('M8 47 L7 9', K, 4.2) + L('M8 47 L7 9', '#7a6a58', 2.4)
      + P('M11 10 Q10.5 3.5 5 3.5 Q1 5 2.5 9 Q5.5 12 11 10 Z', '#3f9b6e') + C(5.4, 6.4, 0.9, red)
      + P('M10 42 L11 20 Q11 8 24 8 Q37 8 37 20 L38 42 Z', '#eceae4') + bust('#f2ede2', '#39b0a0') + head('#e8dccb')
      + P('M12.5 22 Q12 10 24 10 Q36 10 35.5 22 Q30 13 24 16.5 Q18 13 12.5 22 Z', '#f4f2ee') + C(24, 8.6, 3.6, '#f4f2ee')
      + L('M16.5 21 L22.5 23', K, 2) + L('M31.5 21 L25.5 23', K, 2) + C(19.8, 25.4, 1.5, K) + C(28.2, 25.4, 1.5, K)
      + beardLong('#f4f2ee') + mustache('#e4e0d8'),
    // Hải tặc Đông Hải
    hai_tac: L('M40 47 Q39 30 40 22', K, 3.6) + L('M40 47 Q39 30 40 22', woodD, 2) + P('M40 22 Q44 15 38 11 Q34 10 33 14 Q37 13 38.5 16 Q39 19 37 22 Z', steel)
      + bust('#e6d9bb', '#3d72b4') + R('M10 42 H38 M8 46 H40', '#3d72b4', 2) + head(tan) + P('M12.6 17 Q13 9 24 9 Q35 9 35.4 17 Z', black)
      + P('M12.4 16.6 H35.6 V20.6 H12.4 Z', '#3d72b4') + L('M13 18.6 L7 22.6 M13 20 L8 26', '#3d72b4', 2) + eye.angry + beardShort('#3a2a22') + mouth.frown,
    thuyen_truong_ma: L('M6 46 Q4 30 10 18', K, 3.4) + L('M42 46 Q44 30 38 18', K, 3.4) + L('M6 46 Q4 30 10 18', woodD, 1.8) + L('M42 46 Q44 30 38 18', woodD, 1.8)
      + P('M10 18 Q6 11 12 8 Q16 8 16 12 Q12 11 11.5 15 Z', steel) + P('M38 18 Q42 11 36 8 Q32 8 32 12 Q36 11 36.5 15 Z', steel)
      + bust('#2a2228', gold) + head(tan) + P('M6 16 Q24 4 42 16 Q24 12 6 16 Z', '#2a2228') + P('M12 15 Q12 9 24 8 Q36 9 36 15 Z', '#2a2228')
      + L('M14 19 L34 29', K, 1.6) + P('M15.5 22 Q19.5 20 23 22.5 Q22 27 19 27 Q16 26.5 15.5 22 Z', K)
      + L('M31.5 21.5 L26 22.6', K, 1.8) + C(28.5, 25.2, 1.6, K) + beardShort('#3a2a22') + mustache('#3a2a22') + R('M30 28 L33 34', '#b0605a', 1.6),
    hai_long_bang_chung: bust('#2f3a4a', '#3f8fb0') + head(tan) + P('M13 18 Q13 9 24 9 Q35 9 35 18 Q24 14 13 18 Z', '#2a2228') + C(24, 7.5, 3, '#2a2228')
      + R('M13 27 Q15.5 24 14 21 Q13 19 15 17.5 M14.5 30 Q17 32 16 35', '#2f8a8a', 1.6) + C(15, 17.4, 0.9, '#2f8a8a')
      + eye.angry + mouth.frown + R('M10 40 Q14 37 18 40 Q22 43 26 40', '#2f8a8a', 1.6),
    hai_long_ho_phap: L('M41 47 V8', K, 3.4) + L('M41 47 V8', '#c9ced6', 1.8) + R('M35 5 V12 Q35 15 41 15 Q47 15 47 12 V5 M41 3 V15', K, 3.2)
      + R('M35 5 V12 Q35 15 41 15 Q47 15 47 12 V5 M41 3 V15', '#e6ad35', 1.6)
      + bust('#2f7a8a', gold) + R('M10 41 Q16 38 22 41 M26 41 Q32 38 38 41 M12 45 Q18 42 24 45 Q30 42 36 45', '#1e5a66', 1.3) + head(tan)
      + P('M10 22 Q9 7 24 7 Q39 7 38 22 L34 20 Q34 13 24 13 Q14 13 14 20 Z', '#2f7a8a') + P('M18 8 Q24 2 30 8 Q24 6 18 8 Z', '#e8a0b0') + eye.stern + mouth.line,
    // Miêu Cương
    co_su: P('M34 47 Q33 40 36 37 H44 Q47 40 46 47 Z', '#8a5a35') + P('M35 36.5 H45 V39 H35 Z', '#6b4a2f') + C(40, 34, 1.4, '#7ad151')
      + bust('#2a3a6a', '#c9ced6') + head(tan) + P('M10.5 20 Q9.5 7 24 6.5 Q38.5 7 37.5 20 Q31 15.5 24 16 Q17 15.5 10.5 20 Z', '#2a3a6a')
      + R('M12 16 Q24 9 36 16', '#c9ced6', 1.4) + R('M15 28 L19 29 M15 31 L19 31.5 M33 28 L29 29 M33 31 L29 31.5', red, 1.6)
      + P('M24 26 L22.5 30 H25.5 Z', '#f4efe2') + eye.stern + mouth.line,
    ac_co_su: glow(40, 38, 8, '#7ad151', 0.45) + P('M34 47 Q33 40 36 37 H44 Q47 40 46 47 Z', '#5a3a2a') + P('M35 36.5 H45 V39 H35 Z', '#3a2a22')
      + R('M38 35 Q37 31 39 28 M42 35 Q43 30 41 27', '#7ad151', 1.6)
      + bust('#1e1a2a', red) + head('#d8c2a8') + P('M9.5 30 Q8 7 24 6.5 Q40 7 38.5 30 L34.5 28 Q34.5 15 24 15 Q13.5 15 13.5 28 Z', '#1e1a2a')
      + P('M15 8 L12 1 L19 6 Z M33 8 L36 1 L29 6 Z', '#efe8da') + R('M16 27 L20 30 M16 31 L20 33 M32 27 L28 30 M32 31 L28 33', red, 1.8) + eye.evil
      + P('M21 31 Q24 33.5 27 31 Q24 32 21 31 Z', K),
    ngu_doc_ho_phap: bust('#2a3a2a', '#7ad151') + P('M5 40 Q5 35 12 36 L14 44 Z M43 40 Q43 35 36 36 L34 44 Z', '#4a5a4a') + head(tan)
      + P('M10 22 Q9 7 24 7 Q39 7 38 22 L34 20 Q34 13 24 13 Q14 13 14 20 Z', '#3a4a3a') + P('M20 9 L24 3 L28 9 Z', '#7ad151')
      + C(17, 10.5, 1.3, '#e6ad35') + C(31, 10.5, 1.3, '#e6ad35') + eye.angry + beardShort('#2a2228')
      + R('M17 41 Q20 38 23 41 Q26 44 29 41', '#7ad151', 1.6),
    // Thiên Sơn
    linh_thuu_phan_do: bust('#3f8a5a', '#e8f5ec') + head(tan) + capHair(black) + P('M12.4 17.6 H35.6 V20.4 H12.4 Z', '#2f6a44')
      + C(30, 41, 3.4, gold) + L('M28.4 38.4 L30.6 41 L29.4 43.6', K, 1.2) + eye.stern + mouth.frown,
    phan_do_thu_linh: P('M7 44 Q6 30 10 26 L14 36 Z M41 44 Q42 30 38 26 L34 36 Z', '#2a4a34') + bust('#2a5a3a', gold) + head(tan)
      + P('M12.5 19 Q12 9 24 9 Q36 9 35.5 19 Q24 15 12.5 19 Z', black) + C(24, 7.4, 3.2, black) + L('M24 5 L24 2', gold, 1.6)
      + C(30, 41, 3.4, gold) + L('M28.4 38.4 L30.6 41 L29.4 43.6', K, 1.2) + eye.angry + R('M29 19 L32 28', '#b0605a', 1.6) + beardShort('#2a2228') + mustache('#2a2228'),
    bac_su_kiem_ve: bust('#7fb4d8', '#e8f4fb') + P('M5 40 Q5 35 12 36 L14 44 Z M43 40 Q43 35 36 36 L34 44 Z', '#a8d0ea') + head(tan)
      + P('M10 22 Q9 7 24 7 Q39 7 38 22 L34 20 Q34 13 24 13 Q14 13 14 20 Z', '#8fc0e0') + P('M20 8 L24 1.5 L28 8 Z', '#e8f4fb')
      + C(24, 10, 1.8, '#3f8ab8') + eye.stern + mouth.line,
    bang_tam_ma_nu: glow(24, 26, 20, '#cfe8ff', 0.4) + P('M9 44 L11 20 Q11 8 24 8 Q37 8 37 20 L39 44 Z', '#dfeaf2') + bust('#9cc3ea', '#f4f8fb') + head('#eef4f8')
      + P('M12.5 22 Q12 10 24 10 Q36 10 35.5 22 Q31 14 24 17 Q17 14 12.5 22 Z', '#dfeaf2')
      + P('M14 12 L13 4 L18 10 L20 2 L23 9 L24 1 L25 9 L28 2 L30 10 L35 4 L34 12 Z', '#bfe3f7') + eye.lady + P('M22 31 Q24 30 26 31 Q24 32.4 22 31 Z', '#5a8ab8'),
    // Hoa Sơn
    thien_co_ve: bust('#1e1a22', gold) + head(tan) + hood('#1e1a22', gold) + maskLow('#1e1a22') + eye.stern
      + C(24, 42, 3.6, '#2a2a30') + R('M24 42 m-3.6 0 a3.6 3.6 0 1 0 7.2 0 a3.6 3.6 0 1 0 -7.2 0', gold, 1.2),
    hac_vien: P('M6 46 Q4 30 12 26 Q8 14 16 8 Q24 3 32 8 Q40 14 36 26 Q44 30 42 46 Z', '#2a2228')
      + P('M15 22 Q15 14 24 14 Q33 14 33 22 Q35 33 24 36 Q13 33 15 22 Z', '#8a6a55') + E(24, 30, 6.5, 4.5, '#a8826a')
      + L('M15 18 L22 21 M33 18 L26 21', K, 2.4) + C(19.5, 22.5, 1.6, '#ffcf5a') + C(28.5, 22.5, 1.6, '#ffcf5a') + C(19.5, 22.5, 0.7, K) + C(28.5, 22.5, 0.7, K)
      + C(22, 29, 0.9, K) + C(26, 29, 0.9, K) + P('M19 32 Q24 35 29 32 L27.5 33.5 L26 32.6 L24 34 L22 32.6 L20.5 33.5 Z', '#fff'),
    ma_kiem_khach: glow(24, 26, 20, '#7e52a6', 0.35) + L('M8 47 L40 6', K, 3.6) + L('M8 47 L40 6', '#9a8ab8', 1.8)
      + bust('#2a2230', '#7e52a6') + head('#e2d6cc') + P('M11 24 Q8 8 24 8 Q40 8 37 24 L33 17 L30 22 L27 15 L22 21 L19 15 L15 22 Z', '#1e1a22')
      + eye.evil + R('M20 31 Q24 29.5 28 31', K, 1.4),
    co_quan_nhan: P('M6 48 Q7 36 14 35 H34 Q41 36 42 48 Z', '#b08a4a') + G('translate(24 42)', P(gear(0, 0, 5.5, 4, 8), '#e0b84a') + C(0, 0, 1.8, '#6b4a2f'))
      + P('M12 10 H36 V32 H12 Z', '#c99a5a') + R('M12 16 H36 M12 27 H36', '#8a6a3a', 1.2) + C(15, 12.5, 1, '#8a6a3a') + C(33, 12.5, 1, '#8a6a3a') + C(15, 29.5, 1, '#8a6a3a') + C(33, 29.5, 1, '#8a6a3a')
      + P('M16 19 H22 V24 H16 Z M26 19 H32 V24 H26 Z', '#2a2228') + C(19, 21.5, 1.6, '#ff8a3a') + C(29, 21.5, 1.6, '#ff8a3a')
      + R('M18 29.5 H30', K, 1.6) + L('M24 10 V5', K, 1.6) + C(24, 4, 2, '#e0b84a') + R('M10 20 H6 V26 H10 M38 20 H42 V26 H38', '#8a6a3a', 1.8),
    thien_co_sat_thu: bust('#1e1a22', gold) + head('#e6d2c4')
      + P('M9 34 Q8 16 12 12 L10 2.5 L18.5 10 Q24 8 29.5 10 L38 2.5 L36 12 Q40 16 39 34 L35 33 Q35 16 24 16 Q13 16 13 33 Z', '#1e1a22')
      + maskLow('#2a2a30') + eye.evil + G('translate(24 42)', P(gear(0, 0, 3.6, 2.6, 6), gold)),
    thien_co_truong_lao: P('M10 42 L11 20 Q11 8 24 8 Q37 8 37 20 L38 42 Z', '#eceae4') + bust('#2a2228', gold) + head('#e2d6c8')
      + P('M12.5 22 Q12 10 24 10 Q36 10 35.5 22 Q30 13 24 16.5 Q18 13 12.5 22 Z', '#f4f2ee') + eye.old + beardLong('#f4f2ee') + mustache('#e4e0d8')
      + G('translate(38 38)', P('M-3.4 -8 H3.4 L8 -3.4 V3.4 L3.4 8 H-3.4 L-8 3.4 V-3.4 Z', gold) + C(0, 0, 3.6, '#2a2228') + R('M-5.6 -2 H-3.6 M3.6 2 H5.6 M-2 5.6 V3.6 M2 -5.6 V-3.6', K, 1.2)),
    nam_cung_kiem_thanh: L('M37 47 L44 10', K, 3.6) + L('M37 47 L44 10', '#e8eef2', 1.8)
      + bust('#f4f2ee', '#9cc3ea') + head('#ecd8c4') + P('M12.5 21 Q12 9 24 9 Q36 9 35.5 21 Q24 16 12.5 21 Z', '#f4f2ee') + C(24, 7.2, 3.6, '#f4f2ee')
      + L('M23 4 L27 8', '#9cc3ea', 1.4) + eye.old + beardLong('#f4f2ee') + mustache('#e4e0d8'),
    bac_dao_ba: P('M38 46 L44 10 Q47 4 43 2 L36 40 Z', '#c3ccd4') + L('M38 46 L44 10', K, 1.2)
      + bust('#6b4a2f', '#c99a5a') + P('M4 40 Q5 33 14 34 L15 44 Z M44 40 Q43 33 34 34 L33 44 Z', '#e9dcc8') + head(tan)
      + P('M9 21 Q8 5 24 5 Q40 5 39 21 Q24 15 9 21 Z', '#8a5a35') + P('M8 20 Q24 13 40 20 V23 Q24 17 8 23 Z', '#e9dcc8')
      + eye.angry + P('M13 27 Q14 43 24 44 Q34 43 35 27 Q31 33 24 33 Q17 33 13 27 Z', '#3a2a22') + P('M20 33 Q24 36.4 28 33 Z', '#fff'),
    tay_quyen_vuong: C(7, 39, 5.5, tan) + C(41, 39, 5.5, tan) + P('M6 48 Q7 34 24 33 Q41 34 42 48 Z', '#c98a5a')
      + R('M17 40 Q24 44 31 40', '#a8683a', 1.4) + head(tan)
      + C(15, 36, 1.7, woodD) + C(18.5, 38.6, 1.7, woodD) + C(22.2, 40, 1.7, woodD) + C(25.8, 40, 1.7, woodD) + C(29.5, 38.6, 1.7, woodD) + C(33, 36, 1.7, woodD)
      + eye.angry + beardShort('#3a2a22') + mustache('#3a2a22') + R('M18 15 L19 16.5 M24 14 V16 M30 15 L29 16.5', '#b07a55', 1.2),
    // Cổ Thi: xác bị cổ trùng điều khiển, băng vải, bùa vàng trên trán
    co_thi: bust('#7a7a6a', '#5a5a4a') + R('M9 42 L16 46 M30 40 L38 45', '#c9c2b0', 2) + head('#c9d0c0')
      + P('M12.5 19 Q12 9 24 9 Q36 9 35.5 19 Z', '#3a3a3a') + R('M13 23 Q24 20 35 24 M14 30 Q24 33 34 29', '#efeadc', 2.2)
      + C(19.5, 25.5, 2.4, '#2a2a2a') + C(28.5, 25.5, 2.4, '#2a2a2a') + C(19.5, 25.5, 0.9, '#9ad16a') + C(28.5, 25.5, 0.9, '#9ad16a')
      + P('M20.5 10 H27.5 V22 H20.5 Z', '#f2d36a') + R('M22.5 12.5 H25.5 M24 12.5 V20 M22.5 16.5 H25.5', red, 1.3) + L('M21 34 H27', K, 1.6),
    doc_nu: P('M9 42 L11 20 Q11 8 24 8 Q37 8 37 20 L39 42 Z', '#2d2440') + bust('#4a5aa8', purple) + head()
      + P('M12.5 22 Q12 10 24 10 Q36 10 35.5 22 Q30 14 24 18 Q18 14 12.5 22 Z', '#2d2440') + C(24, 7.6, 4, '#2d2440')
      + P('M27 6.4 L37 2 L33.6 7.2 L38.6 8.4 L31 10.2 Z', '#3d9ad1') + eye.lady + P('M21.5 31 Q24 29.4 26.5 31 Q24 33.2 21.5 31 Z', '#8a3a8a')
      + P('M24 13.6 L25.4 15.4 L24 17.2 L22.6 15.4 Z', green),
    hac_phong_lau_la: bust('#2f2a30', '#4a4550') + head() + hood('#2f2a30') + maskLow('#2f2a30') + eye.angry,
    dao_khach: bust('#3a3540', red) + head(tan) + P('M12.5 20 Q12 9 24 9 Q36 9 35.5 20 Z', black) + L('M13 16 L7 20 M13 17.5 L8 24', black, 2.4)
      + eye.stern + R('M17 19 L23 30', '#b0605a', 1.8) + R('M16.5 30.5 Q24 38 31.5 30.5', '#5a4a3a', 2.4, 0.4) + mustache(black),
    hac_phong_trai_chu: bust('#7a4a22', '#e08a2c') + head(tan) + P('M9 12 L8 3 L16 8 Z M39 12 L40 3 L32 8 Z', '#e08a2c')
      + P('M8 31 Q6 6 24 6 Q42 6 40 31 L36 29 Q36 14 24 14 Q12 14 12 29 Z', '#e08a2c') + R('M24 6.4 V12 M16 8 L18 13 M32 8 L30 13 M9 18 L13 19 M39 18 L35 19', K, 2)
      + eye.angry + P('M13 27 Q14 42 24 43 Q34 42 35 27 Q31 33 24 33 Q17 33 13 27 Z', black) + P('M20 33 Q24 36.4 28 33 Z', '#fff'),
    huyet_ma_do: bust(redD, black) + head('#e6c3a6') + hood('#b22a22') + maskLow(black) + eye.evil,
    huyet_ma_ho_phap: P('M5 41 L1.5 32 L11 37 Z M43 41 L46.5 32 L37 37 Z', '#3a3540') + bust('#7a1414', gold)
      + P('M13 15 Q5 9 7.5 1.5 Q12 8.5 17.5 11 Z M35 15 Q43 9 40.5 1.5 Q36 8.5 30.5 11 Z', '#d6c6ae') + head('#efe8da')
      + C(19.5, 24, 2.6, K) + C(28.5, 24, 2.6, K) + C(19.5, 24, 1.1, '#ff5a3a') + C(28.5, 24, 1.1, '#ff5a3a')
      + P('M24 27 L22.6 30 H25.4 Z', K) + R('M20 33 H28 M21.5 32 V34.5 M24 32 V34.5 M26.5 32 V34.5', K, 1.2) + P('M24 13 L26 15.6 L24 18.2 L22 15.6 Z', red),
    thach_nhan: P('M6 48 Q7 34 14 33 H34 Q41 34 42 48 Z', '#8a8f96') + P('M12 30 Q11 9 24 8 Q37 9 36 30 Q30 34 24 34 Q18 34 12 30 Z', '#9aa0a8')
      + R('M15 14 L19 18 M33 13 L29 19 M14 27 L18 25 M24 34 V40 M18 40 L21 44', '#5a6068', 1.4, 0.8)
      + P('M16 20 H22 V23 H16 Z M26 20 H32 V23 H26 Z', '#ff8a3a') + L('M19 29 H29', K, 2) + S('M30 9 Q37 10 36 30 L32 32 Z', 0.15),
    minh_ve: bust('#2f4a7a', goldL) + head(tan) + P('M11.5 18.5 Q11.5 9.5 24 9 Q36.5 9.5 36.5 18.5 Z', '#25222a')
      + P('M7.5 18 H40.5 V21 H7.5 Z', '#25222a') + C(24, 10.5, 2, gold) + eye.stern + mouth.line,
    minh_ve_thong_linh: bust('#2f4a7a', red) + P('M5 41 Q5 36 12 36.5 L14 44 Z M43 41 Q43 36 36 36.5 L34 44 Z', steel) + head(tan)
      + P('M11 21 Q10 7 24 7 Q38 7 37 21 L33 19 Q33 13 24 13 Q15 13 15 19 Z', iron) + P('M22.5 7.5 Q23 0.5 31 2 Q26.5 3.5 26 7.5 Z', red)
      + eye.angry + beardShort(black) + mustache(black),
    huyet_ma_ve_si: bust('#5b6570', redD) + P('M5 40 Q5 35 12 36 L14 44 Z M43 40 Q43 35 36 36 L34 44 Z', '#7f8c98')
      + P('M10 31 Q9 8 24 8 Q39 8 38 31 Z', '#a8262a') + P('M22 8.5 L24 1 L26 8.5 Z', gold)
      + P('M14 20 H34 V34 Q24 38.5 14 34 Z', iron) + P('M15 22 H33 V25.6 H15 Z', '#1a1418') + C(20, 23.8, 1.2, '#ff5a3a') + C(28, 23.8, 1.2, '#ff5a3a')
      + C(17, 30, 0.9, K) + C(31, 30, 0.9, K) + R('M24 27 V35', K, 1.2, 0.6),
    ma_anh_sat_thu: bust('#2a2230', '#5a3a7a') + head('#e6d2c4')
      + P('M9 34 Q8 16 12 12 L10 2.5 L18.5 10 Q24 8 29.5 10 L38 2.5 L36 12 Q40 16 39 34 L35 33 Q35 16 24 16 Q13 16 13 33 Z', '#2a2230')
      + maskLow('#3d2a52') + eye.evil + L('M35 38 L44 44 M34 40 L41 47', '#5a3a7a', 2.2),
    huyet_ma_truong_lao: P('M10 42 L11 20 Q11 8 24 8 Q37 8 37 20 L38 42 Z', '#eceae4') + bust('#7a1414', black) + head('#e2d6c8')
      + P('M12.5 22 Q12 10 24 10 Q36 10 35.5 22 Q30 13 24 16.5 Q18 13 12.5 22 Z', '#f4f2ee') + eye.evil
      + L('M21.5 30 Q16 33 15 41 M26.5 30 Q32 33 33 41', '#eceae4', 1.8) + P('M22 33 Q24 43 26 33 Z', '#eceae4') + P('M24 12.6 L25.6 14.8 L24 17 L22.4 14.8 Z', red),
    huyet_ma_giao_chu: P('M8 46 L10 20 Q10 7 24 7 Q38 7 38 20 L40 46 Z', '#1e1a22') + bust('#1e1a22', '#b22a22')
      + P('M11 37 L15.5 29.5 L24 38 L32.5 29.5 L37 37 Z', redD) + head('#ecdcd0')
      + P('M12.5 23 Q12 12 24 12 Q36 12 35.5 23 Q29 15 24 19 Q19 15 12.5 23 Z', '#1e1a22')
      + P('M13 15 L14 5 L19 9.5 L24 3 L29 9.5 L34 5 L35 15 Q24 12 13 15 Z', '#3a2a3a') + C(24, 10, 2.3, '#e8402e')
      + eye.evil + R('M21 31.4 Q24 32.6 27 31.4', '#a8262a', 1.6),
  };
  // Võ học có icon vẽ tay bằng ảnh (người dùng tạo bằng Gemini 2026-11-04, gốc luu_tru/icon_vo_danh.png, chỉ trắng + vàng như võ Vô Danh):
  // ảnh tròn game/img/icon/sk_<mã>.png đặt trong viền màu phẩm chất. Thêm môn mới: thêm mã vào SK_IMG và đặt ảnh cùng tên.
  const SK_IMG = ['vo_danh_quyen', 'co_hong_tam_phap', 'vo_danh_cong_phap',
    // đường Chưởng Thanh Vân (gốc luu_tru/icon_tam_phat_chuong.png, 2026-11-05)
    'truong_sinh_quyet', 'tp_khong_tuong', 'tp_bo_tat_an', 'tp_loi_am', 'tp_tich_diet', 'tp_minh_vuong',
    // bộ Hàng Long + Hàng Long Quyết (gốc luu_tru/Chuong_NoiMon/icon_hang_long.png 2×2, icon_hang_long_quyet.png, 2026-11-07)
    'hl_song_long', 'hl_long_tieu', 'hl_chien_long', 'hl_cuong_long', 'hang_long_quyet',
    // bộ Như Lai + Dịch Cân Kinh (mã cuu_duong_than_cong) (gốc luu_tru/Chuong_TinhAnh/nl_1..4.png, dich_can.png, 2026-11-09)
    'nl_so_hien', 'nl_son_ha', 'nl_pho_chieu', 'nl_trieu_tong', 'cuu_duong_than_cong'];
  // Viền theo loại chiêu như ảnh mẫu người dùng gửi (2026-11-05): chiêu đánh đỏ, nộ vàng, bị động xanh dương, phụ trợ xanh lá, nội công 100 tầng tím
  const SK_ROLE_RING = { danh1: '#b3261e', danh2: '#b3261e', no: '#d4a017', bidong: '#2a5db0', phutro: '#3f8f3a' };
  const skRing = id => {
    const s = SKILLS[id], bo = s.bo && typeof BO_VO !== 'undefined' && BO_VO[s.bo];
    const role = bo && Object.keys(bo.roles).find(r => bo.roles[r] === id);
    if (role) return SK_ROLE_RING[role];
    if (s.cat === 'noicong' && s.maxLv) return '#7a4bb5';
    return SK_GRADE[s.grade] || '#a0673a';
  };
  if (typeof SKILLS !== 'undefined') SK_IMG.forEach(id => {
    if (SKILLS[id]) LIST['sk_' + id] = C(24, 24, 22.5, skRing(id)) + `<image href="game/img/icon/sk_${id}.png" x="4" y="4" width="40" height="40"/>`;
  });
  // Võ học: mỗi môn một biểu tượng sk_<mã võ công>, vẽ tự động từ dữ liệu (môn nào đã vẽ tay thì giữ)
  if (typeof SKILLS !== 'undefined') Object.entries(SKILLS).forEach(([id, s]) => { if (!LIST['sk_' + id]) LIST['sk_' + id] = skillIcon(s, id); });
  // Võ học Quyền (SKILLS[x].kieu === 'quyen', người dùng yêu cầu 2026-11-07): huy hiệu nắm đấm nhỏ góc trên phải biểu tượng
  const FIST_BADGE = C(40, 8, 7.5, '#3a2418') + '<circle cx="40" cy="8" r="7.5" fill="none" stroke="#e6ad35" stroke-width="1.4"/>'
    + `<g transform="translate(30.5 -2.3) scale(.42)">${SK_MOTIF.quyen('#f3dc9f')}</g>`;
  if (typeof SKILLS !== 'undefined') Object.entries(SKILLS).forEach(([id, s]) => { if (s.kieu === 'quyen' && LIST['sk_' + id]) LIST['sk_' + id] += FIST_BADGE; });
  return LIST;
})();

const ic = key => `[[${key}]]`;
function icSvg(key, cls) {
  return `<svg class="ic${cls ? ' ' + cls : ''}" viewBox="0 0 48 48" aria-hidden="true"><use href="#ic-${key}"/></svg>`;
}
// Đổi mọi [[tên]] trong chuỗi HTML thành hình; tên không có thì giữ nguyên để dễ phát hiện
function iconize(html) {
  return String(html).replace(/\[\[([a-z0-9_]+)\]\]/g, (m, k) => (ICONS[k] ? icSvg(k) : m));
}
// Biểu tượng hiệu ứng trong trận bằng ảnh (người dùng tạo bằng Gemini 2026-11-06, gốc luu_tru/icon_hieu_ung.png, lưới 4×4
// cắt tròn bằng cat_luoi_tron.ps1 trong scratchpad): game/img/st/<tên>.png, dùng qua [[st_<tên>]] (FX_NAMES trong engine).
// Viền đỏ = hiệu ứng xấu, viền vàng = hiệu ứng tốt.
['choang', 'chay_mau', 'trung_doc', 'me_hoac', 'phe_hon', 'suy_yeu', 'noi_thuong', 'so_ho',
  'tang_cong', 'tang_thu', 'tang_mau', 'giap_ao', 'hoi_phuc', 'giam_st', 'phan_don', 'tang_toc'].forEach(k => {
  ICONS['st_' + k] = `<image href="game/img/st/${k}.png" x="0" y="0" width="48" height="48"/>`;
});
// Mảnh Nội Công / Mảnh Võ Học (Truy Nã Hiệp Khách): ảnh Gemini của người dùng (gốc luu_tru/manh_{noi_cong,vo_hoc}.png,
// quầng sáng trên nền trắng đổi thành trong mờ bằng hao_quang.ps1 trong scratchpad), game/img/icon/<mã>.png 256×256
['manh_noi_so', 'manh_vo_so'].forEach(k => {
  ICONS[k] = `<image href="game/img/icon/${k}.png" x="0" y="0" width="48" height="48"/>`;
});
// Thảo dược nâng Kinh mạch (2026-11-10): ảnh Gemini của người dùng (gốc luu_tru/kinh_mach/thao_duoc.png), cắt ô vuông có khung,
// ghép chung một tấm game/img/icon/thao_duoc.png 576×192 (giới hạn 512 tệp mỗi bản đăng), mỗi icon lấy một ô bằng svg lồng
['vo_danh_thao', 'nhan_sam', 'tuyet_lien_km'].forEach((k, i) => {
  ICONS[k] = `<svg x="0" y="0" width="48" height="48" viewBox="${i * 192} 0 192 192"><image href="game/img/icon/thao_duoc.png" x="0" y="0" width="576" height="192"/></svg>`;
});
// Bạc, kinh nghiệm, bảng Truy Nã: ảnh Gemini của người dùng (2026-11-06, gốc luu_tru/icon_{bac,kinh_nghiem,truy_na}.png),
// thay hình vẽ SVG ở mọi chỗ dùng [[bac]] / [[kinh_nghiem]] / [[truy_na]]. Bạc: cắt quầng sáng hao_quang.ps1 -Min 205 + vá lỗ va_lo.ps1 -R 80.
// Icon trang bị (ảnh Gemini của người dùng, mỗi ô 192×192): găng (data.js GANG, "Thập Nhị Quyền Giáp", gốc luu_tru/gang_12.png),
// kiếm (GEAR.weapon, "Thập Nhị Thần Kiếm", luu_tru/kiem_12.png, cat_kiem.ps1), côn (CON, "Thập Đại Thần Côn", luu_tru/con_10.png),
// Mũ / Áo / Quần / Giày ("Thập Nhị Đầu Giáp / Vi Y Giáp / Hạ Giáp / Bộ Giáp", luu_tru/<loại>_12.png; tờ Quần tách nền bằng cat_quan.ps1),
// Dây chuyền / Nhẫn / Ngọc bội ("Thập Nhị Diệp Chiến / Mai Chỉ / Ngọc Bội"), Phi phong / Đai lưng / Hộ tâm kính (luu_tru/{phi_phong,dai_lung,htk}_12.png).
// 2026-11-11: mỗi loại gộp thành một tấm game/img/icon/tb_<loại>.png (bản đăng claude.ai tối đa 512 tệp): ô thứ i (từ 1) ở x = (i − 1) × 200,
// giữa các ô chừa 8 điểm ảnh trống; ICONS lấy đúng ô bằng svg lồng viewBox (chép nguyên điểm ảnh, không đổi chất lượng).
// Ảnh lẻ cũ cất ở luu_tru/icon_trang_bi_le/; gộp lại bằng gop_icon.ps1 (scratchpad) nếu thêm bậc mới.
const TB_STEP = 200;
const tbIcon = (k, i, n) => `<svg x="0" y="0" width="48" height="48" viewBox="${(i - 1) * TB_STEP} 0 192 192"><image href="game/img/icon/tb_${k}.png" x="0" y="0" width="${(n - 1) * TB_STEP + 192}" height="192"/></svg>`;
[['gang', 12], ['kiem', 12], ['con', 10], ['mu', 12], ['ao', 12], ['quan', 12], ['giay', 12], ['day_chuyen', 12], ['nhan', 12], ['boi', 12], ['phi_phong', 12], ['dai_lung', 12], ['htk', 12]]
  .forEach(([k, n]) => { for (let i = 1; i <= n; i++) ICONS[k + '_' + i] = tbIcon(k, i, n); });
// Trang bị hiệp khách (game xếp đội): 10 bậc x 5 món, ảnh lẻ 192 px game/img/icon/hk_do/<loại>_<bậc>.png
['kiem', 'mu', 'ao', 'dai', 'giay'].forEach(k => { for (let i = 1; i <= 10; i++) ICONS[`hkdo_${k}_${i}`] = `<image href="game/img/icon/hk_do/${k}_${i}.png" x="0" y="0" width="48" height="48"/>`; });
['bac', 'kinh_nghiem', 'truy_na'].forEach(k => {
  ICONS[k] = `<image href="game/img/icon/${k}.png" x="0" y="0" width="48" height="48"/>`;
});
// 4 tiệm trang bị Thanh Vân (the_gioi.js): ảnh Gemini của người dùng (gốc luu_tru/icon_tiem_*.png; Trang Phục dùng trang_bi.png có sẵn)
['tiem_vu_khi', 'tiem_trang_suc', 'tiem_phu_kien', 'trang_bi'].forEach(k => {
  ICONS[k === 'trang_bi' ? 'tiem_trang_phuc' : k] = `<image href="game/img/icon/${k}.png" x="0" y="0" width="48" height="48"/>`;
});
// Quái/boss đã có hình chibi (chibi_quai.js): biểu tượng là phần đầu cắt từ hình đó
const ART_ICONS = typeof ENEMY_ART !== 'undefined' ? ENEMY_ART : {};
Object.keys(ART_ICONS).forEach(k => { if (!ICONS[k]) ICONS[k] = '<!-- hình chibi -->'; });
// Gom mọi biểu tượng thành một bảng hình ẩn đầu trang; mỗi chỗ dùng chỉ tham chiếu tới đó
(function () {
  // keepIcon: nhân vật vừa là NPC vừa là đối thủ thì giữ chân dung vẽ tay làm biểu tượng nhỏ
  const sym = Object.keys(ICONS).map(k => (ART_ICONS[k] && !ART_ICONS[k].keepIcon
    ? `<symbol id="ic-${k}" viewBox="${ART_ICONS[k].crop}">${ART_ICONS[k].body}</symbol>`
    : `<symbol id="ic-${k}" viewBox="0 0 48 48"><g fill="none" stroke="#3a2418" stroke-width="2" stroke-linejoin="round" stroke-linecap="round">${ICONS[k]}</g></symbol>`)).join('');
  const put = () => document.body.insertAdjacentHTML('afterbegin', `<svg id="icon-sprite" aria-hidden="true" style="position:absolute;width:0;height:0;overflow:hidden">${sym}</svg>`);
  if (document.body) put(); else document.addEventListener('DOMContentLoaded', put);
})();
