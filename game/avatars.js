'use strict';
/* =================================================================
   HIỆP KHÁCH GIANG HỒ — HÌNH NHÂN VẬT CHIBI
   -----------------------------------------------------------------
   Hình nhân vật chính, vẽ bằng SVG (không cần file ảnh, chơi offline
   được). Bản thiết kế gốc nằm trên canvas "Tạo Hình Nhân Vật Chibi":
   https://claude.ai/artifact/TxQipq9pyB34R1PERkk9vh

   Mỗi tạo hình gồm các lớp, vẽ theo thứ tự từ sau ra trước:
     under    — vật phía sau lưng (kiếm, côn, nón đeo sau lưng)
     hairBack — tóc dài phía sau thân
     body     — thân, tay, chân, trang phục
     head     — đầu, tóc phía sau, khuôn mặt (chưa có mắt mũi)
     faces    — 4 biểu cảm: normal (bình thường), attack (xuất chiêu),
                hurt (trúng đòn), win (thắng trận)
     front    — tóc mái, nón... phủ lên trên mặt
   Khung vẽ toàn thân là 240×320; headBox là khung cắt riêng phần đầu.
   ================================================================= */

/* ---- Các mảnh dùng chung cho khuôn mặt ---- */
const _W = 'fill="#ffffff" stroke="none"';
function _blush(c, o) {
  return `<ellipse cx="88" cy="136" rx="9" ry="5" fill="${c}" stroke="none" opacity="${o}"/><ellipse cx="152" cy="136" rx="9" ry="5" fill="${c}" stroke="none" opacity="${o}"/>`;
}
function _blushWin(c) {
  return `<ellipse cx="88" cy="134" rx="10" ry="5.5" fill="${c}" stroke="none" opacity="0.9"/><ellipse cx="152" cy="134" rx="10" ry="5.5" fill="${c}" stroke="none" opacity="0.9"/>`;
}
function _eyeN(x, p, i, lash) {
  const s = x < 120 ? -1 : 1;
  return `<ellipse cx="${x}" cy="120" rx="9" ry="12" fill="${p}" stroke="none"/><ellipse cx="${x}" cy="124" rx="6.5" ry="7" fill="${i}" stroke="none"/>`
    + `<circle cx="${x - 3}" cy="115" r="3.6" ${_W}/><circle cx="${x + 3.5}" cy="126" r="1.6" ${_W}/>`
    + `<path d="M${x - 11} 111 Q${x} 103 ${x + 11} 111" fill="none" stroke-width="3.2"/>`
    + (lash ? `<path d="M${x + 11 * s} 111 L${x + 16 * s} 106" fill="none" stroke-width="2.6"/>` : '');
}
function _eyeA(x, p, i, lash) {
  const s = x < 120 ? -1 : 1;
  return `<ellipse cx="${x}" cy="122" rx="9" ry="10" fill="${p}" stroke="none"/><ellipse cx="${x}" cy="125" rx="6.5" ry="6" fill="${i}" stroke="none"/>`
    + `<circle cx="${x - 3}" cy="118" r="3.2" ${_W}/>`
    + `<path d="M${x + 11 * s} 110 L${x - 11 * s} 115" fill="none" stroke-width="3.4"/>`
    + (lash ? `<path d="M${x + 11 * s} 110 L${x + 16 * s} 107" fill="none" stroke-width="2.6"/>` : '');
}
const _EYES_HURT = '<path d="M89 112 L105 120 L89 128" fill="none" stroke-width="3.4"/><path d="M151 112 L135 120 L151 128" fill="none" stroke-width="3.4"/>';
const _EYE_WIN_L = '<path d="M87 122 Q97 111 107 122" fill="none" stroke-width="3.4"/>';
const _EYE_WIN_R = '<path d="M133 122 Q143 111 153 122" fill="none" stroke-width="3.4"/>';
const _MOUTH = {
  m: {
    normal: '<path d="M114 138 Q120 143 126 138" fill="none" stroke="#7a3b3b" stroke-width="2.4"/>',
    attack: '<path d="M112 136 Q120 147 128 136 Z" fill="#7a3b3b" stroke-width="2"/>',
    hurt: '<path d="M111 140 Q115.5 135 120 140 Q124.5 145 129 140" fill="none" stroke="#7a3b3b" stroke-width="2.4"/>',
    win: '<path d="M110 134 Q120 150 130 134 Z" fill="#7a3b3b" stroke-width="2"/><path d="M114.5 139.5 Q120 145 125.5 139.5 Q120 137 114.5 139.5 Z" fill="#ff8a8a" stroke="none"/>',
  },
  f: {
    normal: '<path d="M115 138 Q120 142 125 138" fill="none" stroke="#c0505a" stroke-width="2.4"/>',
    attack: '<path d="M113 136 Q120 146 127 136 Z" fill="#7a3b3b" stroke-width="2"/>',
    hurt: '<path d="M112 140 Q116 135 120 140 Q124 145 128 140" fill="none" stroke="#c0505a" stroke-width="2.4"/>',
    win: '<path d="M111 134 Q120 149 129 134 Z" fill="#7a3b3b" stroke-width="2"/><path d="M115 139.5 Q120 144.5 125 139.5 Q120 137 115 139.5 Z" fill="#ff8a8a" stroke="none"/>',
  },
};
function _sweat(x, y) {
  return `<path d="M${x} ${y} Q${x + 9} ${y + 15} ${x} ${y + 20} Q${x - 9} ${y + 15} ${x} ${y} Z" fill="#bfe3f7" stroke-width="2"/>`;
}
function _spark(x, y) {
  return `<path d="M${x} ${y - 10} L${x + 2.5} ${y - 2.5} L${x + 10} ${y} L${x + 2.5} ${y + 2.5} L${x} ${y + 10} L${x - 2.5} ${y + 2.5} L${x - 10} ${y} L${x - 2.5} ${y - 2.5} Z" fill="#d4a72c" stroke-width="1.5"/>`;
}
const _brow = (d, w) => `<path d="${d}" fill="none" stroke-width="${w}"/>`;

/* Dựng 4 biểu cảm. Mỗi biểu cảm = [phần trên mặt, phần phủ trên tóc mái] */
function _faces(o) {
  const g = o.fem ? 'f' : 'm';
  const m = Object.assign({}, _MOUTH[g], o.mouth || {});
  const bc = o.blush || '#ffab9e', bo = o.bo || 0.75, deco = o.deco || '';
  const br = o.brows;
  const put = (k, inner, over) => o.browsOver ? [inner, (br[k] || '') + (over || '')] : [inner.replace('§', br[k] || ''), over || ''];
  const n = put('normal', _blush(bc, bo) + deco + _eyeN(97, o.p, o.i, o.fem) + _eyeN(143, o.p, o.i, o.fem) + '§' + m.normal);
  const a = put('attack', _blush(bc, bo) + deco + _eyeA(97, o.p, o.i, o.fem) + _eyeA(143, o.p, o.i, o.fem) + '§' + m.attack);
  const h = put('hurt', _blush(bc, bo) + deco + _EYES_HURT + '§' + m.hurt, _sweat(o.sweat[0], o.sweat[1]));
  const winEyes = o.wink ? _EYE_WIN_L + _eyeN(143, o.p, o.i, o.fem) : _EYE_WIN_L + _EYE_WIN_R;
  const w = put('win', _blushWin(bc) + deco + winEyes + '§' + m.win, o.spark ? _spark(o.spark[0], o.spark[1]) : '');
  [n, a, h, w].forEach(f => { f[0] = f[0].replace('§', ''); });
  return { normal: n, attack: a, hurt: h, win: w };
}

/* ---- Các mảnh dùng chung cho thân ---- */
const _WIDE_SLEEVES = (c, k) =>
  `<path d="M96 168 Q74 174 66 210 Q62 234 74 246 L101 240 Q97 208 100 182 Z" fill="${c}"/><path d="M66 230 Q66 240 74 246 L101 240 L100 230 Q84 234 66 230 Z" fill="${k}"/>`
  + `<path d="M144 168 Q166 174 174 210 Q178 234 166 246 L139 240 Q143 208 140 182 Z" fill="${c}"/><path d="M174 230 Q174 240 166 246 L139 240 L140 230 Q156 234 174 230 Z" fill="${k}"/>`;
const _HANDS = '<circle cx="88" cy="248" r="7" fill="#ffe7d1"/><circle cx="152" cy="248" r="7" fill="#ffe7d1"/>';
const _COLLAR = c => `<path d="M134 162 L124 178 L118 172 L126 161 Z" fill="${c}"/><path d="M106 164 L138 212 L146 210 L116 162 Z" fill="${c}"/>`;
const _SWORD = (rot, sheath, fit, grip, wrap, tassel) => {
  const t = rot > 0 ? [210, 88, 217, 213, 204, 206] : [30, 88, 23, 27, 36, 34];
  return `<g transform="rotate(${rot} 120 190)"><rect x="113" y="122" width="14" height="160" rx="5" fill="${sheath}"/><rect x="113" y="270" width="14" height="10" fill="${fit}"/><rect x="113" y="124" width="14" height="8" fill="${fit}"/><rect x="103" y="114" width="34" height="8" rx="3" fill="${fit}"/><rect x="115" y="56" width="10" height="58" rx="3" fill="${grip}"/><path d="M115 70 L125 76 M115 82 L125 88 M115 94 L125 100" fill="none" stroke="${wrap}" stroke-width="2"/><circle cx="120" cy="50" r="6.5" fill="${fit}"/></g>`
    + `<path d="M${t[0]} ${t[1]} Q${t[2]} 102 ${t[3]} 120 L${t[4]} 120 Q${t[5]} 102 ${t[0]} ${t[1]} Z" fill="${tassel}"/><circle cx="${t[0]}" cy="89" r="3" fill="${tassel}"/>`;
};
const _LONG_HAIR = c => `<path d="M64 110 Q52 190 66 246 Q92 256 120 254 Q148 256 174 246 Q188 190 176 110 Z" fill="${c}"/>`;
const _LONG_LOCKS = c => `<path d="M64 98 Q50 150 62 186 Q70 190 74 182 Q66 150 76 114 Z" fill="${c}"/><path d="M176 98 Q190 150 178 186 Q170 190 166 182 Q174 150 164 114 Z" fill="${c}"/>`;
const _SHORT_LOCKS = c => `<path d="M64 98 Q54 132 66 160 Q72 142 76 114 Z" fill="${c}"/><path d="M176 98 Q186 132 174 160 Q168 142 164 114 Z" fill="${c}"/>`;
const _BANGS = c => `<path d="M62 112 Q56 58 120 52 Q184 58 178 112 Q172 92 160 84 Q156 96 142 98 Q146 88 138 78 Q126 94 104 97 Q110 88 108 80 Q92 88 84 100 Q78 98 74 92 Q68 100 62 112 Z" fill="${c}"/>`;
const _BANGS_SWEPT = c => `<path d="M62 114 Q56 58 120 52 Q184 58 178 114 Q170 90 150 80 Q140 92 118 98 Q128 86 126 76 Q104 92 80 100 Q72 104 62 114 Z" fill="${c}"/>`;
const _FACE = c => `<ellipse cx="120" cy="110" rx="57" ry="50" fill="${c || '#ffe7d1'}"/>`;
const _MONK_HEAD = '<ellipse cx="63" cy="118" rx="8" ry="11" fill="#ffe7d1"/><ellipse cx="177" cy="118" rx="8" ry="11" fill="#ffe7d1"/><ellipse cx="120" cy="105" rx="58" ry="55" fill="#ffe7d1"/><path d="M60 113 Q57 118 60 124" fill="none" stroke-width="1.8"/><path d="M180 113 Q183 118 180 124" fill="none" stroke-width="1.8"/>';
const _MONK_FACE = {
  p: '#3a2418', i: '#8a5a2b', sweat: [162, 98], spark: [200, 120],
  brows: {
    normal: _brow('M87 101 Q97 95 107 99', 4.2) + _brow('M133 99 Q143 95 153 101', 4.2),
    attack: _brow('M86 97 L107 104', 4.4) + _brow('M154 97 L133 104', 4.4),
    hurt: _brow('M87 104 L107 98', 4.2) + _brow('M153 104 L133 98', 4.2),
    win: _brow('M87 100 Q97 94 107 98', 4.2) + _brow('M133 98 Q143 94 153 100', 4.2),
  },
};
const _CB_BODY_ARMS = '<path d="M76 212 L74 238 L86 240 L96 212 Z" fill="#f7d6b8"/><path d="M75 226 L94 226 L92 233 L74.5 232 Z" fill="#e8dcc0"/><circle cx="80" cy="243" r="7.5" fill="#f7d6b8"/>'
  + '<path d="M96 168 Q76 174 70 196 Q68 208 74 214 L98 212 Q97 196 100 182 Z" fill="#a8885e"/><path d="M70 204 Q70 210 74 214 L98 212 L98 204 Q84 207 70 204 Z" fill="#6e5236"/><rect x="76" y="184" width="12" height="11" rx="2" fill="#c8a46a" transform="rotate(-10 82 190)"/>'
  + '<path d="M164 212 L162 240 L150 240 L144 212 Z" fill="#f7d6b8"/><path d="M145 226 L164 226 L163 233 L147 232 Z" fill="#e8dcc0"/><path d="M144 168 Q164 174 170 196 Q172 208 166 214 L142 212 Q143 196 140 182 Z" fill="#a8885e"/><path d="M170 204 Q170 210 166 214 L142 212 L142 204 Q156 207 170 204 Z" fill="#6e5236"/>'
  + '<g transform="rotate(12.9 176 167)"><rect x="172" y="33" width="8" height="268" rx="4" fill="#4fae7a"/><rect x="171" y="40" width="10" height="8" rx="2" fill="#2e7d55"/><rect x="171" y="120" width="10" height="6" rx="2" fill="#2e7d55"/><rect x="171" y="286" width="10" height="8" rx="2" fill="#2e7d55"/></g><circle cx="157" cy="244" r="7.5" fill="#f7d6b8"/>';
const _CB_BELT = '<path d="M134 162 L124 178 L118 172 L126 161 Z" fill="#6e5236"/><path d="M106 164 L138 212 L146 210 L116 162 Z" fill="#6e5236"/><path d="M85 208 Q120 214 155 208 L157 220 Q120 226 83 220 Z" fill="#d8b67a"/><path d="M92 210 L97 220 M102 211 L107 221 M112 212 L117 222 M123 212 L128 222 M133 211 L138 221 M143 210 L148 220" fill="none" stroke="#a8875a" stroke-width="1.5"/><circle cx="94" cy="216" r="4.5" fill="#d8b67a"/>'
  + '<path d="M104 221 L104 230" fill="none" stroke="#9b2226" stroke-width="2"/><circle cx="104" cy="253" r="10" fill="#e0a040"/><circle cx="104" cy="238" r="6" fill="#e0a040"/><path d="M98 245 L110 245" fill="none" stroke="#9b2226" stroke-width="3"/><rect x="101" y="228" width="6" height="5" rx="1" fill="#8a5a2b"/>';
const _CB_LEGS = y => `<rect x="101" y="${y + 2}" width="13" height="${290 - y - 2}" fill="#f7d6b8"/><rect x="126" y="${y + 2}" width="13" height="${290 - y - 2}" fill="#f7d6b8"/>`
  + `<rect x="99" y="${y - 20}" width="17" height="26" rx="4" fill="#6e5236"/><rect x="124" y="${y - 20}" width="17" height="26" rx="4" fill="#6e5236"/><rect x="98" y="${y}" width="19" height="7" rx="3" fill="#8a6c4a"/><rect x="123" y="${y}" width="19" height="7" rx="3" fill="#8a6c4a"/>`
  + '<rect x="94" y="286" width="24" height="10" rx="4" fill="#c9a86a"/><rect x="122" y="286" width="24" height="10" rx="4" fill="#c9a86a"/><path d="M99 290 L113 290 M127 290 L141 290" fill="none" stroke="#8a6a3a" stroke-width="1.8"/><rect x="111" y="148" width="18" height="20" fill="#e9bf9b"/>';
const _CB_FACE = {
  p: '#2e1f14', i: '#6a4a2a', blush: '#f29a88', bo: 0.7,
  mouth: {
    attack: '<path d="M110 134 Q120 149 130 134 Z" fill="#7a3b3b" stroke-width="2"/><path d="M113 134.5 L127 134.5 L126 137.5 L114 137.5 Z" fill="#ffffff" stroke="none"/>',
  },
};

const AVATARS = {
  /* ---------------- Võ Đang · Thiếu hiệp ---------------- */
  'vo_dang/m': {
    ink: '#3a2e3f', headBox: '44 10 152 152',
    under: _SWORD(40, '#6b4430', '#d4a72c', '#2c4f8a', '#1d3563', '#9b2226'),
    hairBack: '',
    body: '<rect x="99" y="256" width="17" height="32" rx="4" fill="#2f3e66"/><rect x="124" y="256" width="17" height="32" rx="4" fill="#2f3e66"/><rect x="92" y="283" width="27" height="13" rx="6" fill="#2a2a33"/><rect x="121" y="283" width="27" height="13" rx="6" fill="#2a2a33"/><rect x="111" y="148" width="18" height="20" fill="#f5cfae"/>'
      + '<path d="M92 166 Q120 158 148 166 L163 266 Q120 276 77 266 Z" fill="#f3f6fb"/><path d="M79 254 Q120 263 161 254 L163 266 Q120 276 77 266 Z" fill="#3d6fb6"/><path d="M139 222 L141 268" fill="none"/>' + _COLLAR('#3d6fb6')
      + '<path d="M85 208 Q120 214 155 208 L157 223 Q120 229 83 223 Z" fill="#2c4f8a"/><circle cx="120" cy="217" r="7.5" fill="#ffffff" stroke-width="1.5"/><path d="M120 209.5 A7.5 7.5 0 0 1 120 224.5 A3.75 3.75 0 0 1 120 217 A3.75 3.75 0 0 0 120 209.5 Z" fill="#2a2a33" stroke="none"/><circle cx="120" cy="213.25" r="1.3" fill="#2a2a33" stroke="none"/><circle cx="120" cy="220.75" r="1.3" fill="#ffffff" stroke="none"/>'
      + '<path d="M128 223 L123 249 L131 248 L133 224 Z" fill="#2c4f8a"/><path d="M133 224 L137 250 L143 246 L138 223 Z" fill="#2c4f8a"/>' + _HANDS + _WIDE_SLEEVES('#f3f6fb', '#3d6fb6'),
    head: '<circle cx="120" cy="32" r="18" fill="#2b2d42"/><path d="M111 24 Q116 19 124 19" fill="none" stroke="#5a5e80" stroke-width="3"/><ellipse cx="120" cy="102" rx="64" ry="56" fill="#2b2d42"/><path d="M132 46 Q156 50 166 70 Q150 62 134 54 Z" fill="#3d6fb6"/><path d="M132 50 Q150 60 152 82 Q142 68 130 56 Z" fill="#5b8bd0"/><rect x="106" y="42" width="28" height="8" rx="3" fill="#3d6fb6"/><path d="M90 26 L152 38" fill="none" stroke="#a0703f" stroke-width="4"/><circle cx="88" cy="25.5" r="4" fill="#d4a72c"/>' + _FACE(),
    faces: _faces({
      p: '#2b2d42', i: '#3d6fb6', sweat: [170, 90], spark: [182, 70],
      brows: {
        normal: _brow('M89 104 Q97 101 105 103', 2.6) + _brow('M135 103 Q143 101 151 104', 2.6),
        attack: _brow('M88 100 L106 106', 3.2) + _brow('M152 100 L134 106', 3.2),
        hurt: _brow('M89 105 L105 100', 2.6) + _brow('M151 105 L135 100', 2.6),
        win: _brow('M89 103 Q97 99 105 101', 2.6) + _brow('M135 101 Q143 99 151 103', 2.6),
      },
    }),
    front: _BANGS('#2b2d42') + _SHORT_LOCKS('#2b2d42') + '<path d="M88 66 Q102 60 118 60" fill="none" stroke="#5a5e80" stroke-width="3"/>',
  },

  /* ---------------- Võ Đang · Nữ hiệp ----------------
     Đạo bào trắng viền lam dài chấm gót, búi tóc đạo cô cài trâm gỗ + khăn lam bay,
     tóc dài sau lưng, kiếm đeo chéo lưng như sư huynh, khóa thắt lưng Thái Cực */
  'vo_dang/f': {
    ink: '#3a2e3f', headBox: '44 6 152 156',
    under: _SWORD(40, '#6b4430', '#d4a72c', '#2c4f8a', '#1d3563', '#9b2226'),
    hairBack: _LONG_HAIR('#2b2d42') + '<path d="M150 40 Q190 52 196 96 Q182 74 152 56 Z" fill="#3d6fb6"/><path d="M152 48 Q180 66 182 108 Q170 82 150 60 Z" fill="#5b8bd0"/>',
    body: '<rect x="92" y="283" width="27" height="13" rx="6" fill="#2a2a33"/><rect x="121" y="283" width="27" height="13" rx="6" fill="#2a2a33"/><rect x="111" y="148" width="18" height="20" fill="#f5cfae"/>'
      + '<path d="M92 166 Q120 158 148 166 L166 284 Q120 292 74 284 Z" fill="#f3f6fb"/><path d="M76 272 Q120 280 164 272 L166 284 Q120 292 74 284 Z" fill="#3d6fb6"/><path d="M139 222 L141 286" fill="none"/>' + _COLLAR('#3d6fb6')
      + '<path d="M85 208 Q120 214 155 208 L157 223 Q120 229 83 223 Z" fill="#2c4f8a"/><circle cx="120" cy="217" r="7.5" fill="#ffffff" stroke-width="1.5"/><path d="M120 209.5 A7.5 7.5 0 0 1 120 224.5 A3.75 3.75 0 0 1 120 217 A3.75 3.75 0 0 0 120 209.5 Z" fill="#2a2a33" stroke="none"/><circle cx="120" cy="213.25" r="1.3" fill="#2a2a33" stroke="none"/><circle cx="120" cy="220.75" r="1.3" fill="#ffffff" stroke="none"/>'
      + '<path d="M128 223 L122 256 L130 255 L133 224 Z" fill="#2c4f8a"/><path d="M133 224 L138 257 L144 253 L138 223 Z" fill="#2c4f8a"/>'
      + '<path d="M104 226 L104 236" fill="none" stroke="#3d6fb6" stroke-width="2"/><circle cx="104" cy="240" r="4.5" fill="#7cc79a" stroke-width="1.6"/><path d="M101 245 L100 256 M104 245 L104 257 M107 245 L108 256" fill="none" stroke="#3d6fb6" stroke-width="1.8"/>'
      + _HANDS + _WIDE_SLEEVES('#f3f6fb', '#3d6fb6'),
    head: '<ellipse cx="120" cy="30" rx="20" ry="17" fill="#2b2d42"/><path d="M108 22 Q115 16 126 17" fill="none" stroke="#5a5e80" stroke-width="3"/>'
      + '<path d="M104 40 Q120 30 136 40 L134 48 Q120 42 106 48 Z" fill="#3d6fb6"/><path d="M96 22 L146 34" fill="none" stroke="#a0703f" stroke-width="4"/><circle cx="94" cy="21.5" r="4" fill="#d4a72c"/><circle cx="148" cy="34.5" r="3" fill="#7cc79a"/>'
      + '<ellipse cx="120" cy="102" rx="64" ry="56" fill="#2b2d42"/>' + _FACE(),
    faces: _faces({
      p: '#2b2d42', i: '#3d6fb6', bo: 0.8, fem: true, sweat: [162, 98], spark: [188, 100],
      brows: {
        normal: _brow('M90 104 Q97 101 104 103', 2.2) + _brow('M136 103 Q143 101 150 104', 2.2),
        attack: _brow('M89 100 L105 105', 2.8) + _brow('M151 100 L135 105', 2.8),
        hurt: _brow('M90 105 L104 100', 2.2) + _brow('M150 105 L136 100', 2.2),
        win: _brow('M90 103 Q97 99 104 101', 2.2) + _brow('M136 101 Q143 99 150 103', 2.2),
      },
    }),
    front: _BANGS_SWEPT('#2b2d42') + _LONG_LOCKS('#2b2d42') + '<path d="M88 66 Q102 60 118 60" fill="none" stroke="#5a5e80" stroke-width="3"/>',
  },

  /* ---------------- Thiếu Lâm · Thiếu hiệp ---------------- */
  'thieu_lam/m': {
    ink: '#3a2e3f', headBox: '50 40 140 140',
    under: '<rect x="172" y="28" width="9" height="268" rx="4" fill="#a0703f"/><rect x="170.5" y="28" width="12" height="16" rx="3" fill="#d4a72c"/><rect x="170.5" y="280" width="12" height="16" rx="3" fill="#d4a72c"/>',
    hairBack: '',
    body: '<rect x="99" y="256" width="17" height="32" rx="4" fill="#e8d9b8"/><rect x="124" y="256" width="17" height="32" rx="4" fill="#e8d9b8"/><rect x="99" y="268" width="17" height="18" fill="#8a6a4a"/><rect x="124" y="268" width="17" height="18" fill="#8a6a4a"/><path d="M99 274 L116 279 M124 274 L141 279" fill="none" stroke="#5e4630" stroke-width="1.5"/>'
      + '<rect x="92" y="283" width="27" height="13" rx="6" fill="#3a2a20"/><rect x="121" y="283" width="27" height="13" rx="6" fill="#3a2a20"/><rect x="111" y="148" width="18" height="20" fill="#f5cfae"/>'
      + '<path d="M92 166 Q120 158 148 166 L163 266 Q120 276 77 266 Z" fill="#f0a040"/><path d="M79 254 Q120 263 161 254 L163 266 Q120 276 77 266 Z" fill="#c96a1a"/><path d="M139 222 L141 268" fill="none"/>' + _COLLAR('#c96a1a')
      + '<path d="M85 208 Q120 214 155 208 L157 223 Q120 229 83 223 Z" fill="#a8551a"/><path d="M140 164 L154 172 L100 256 L84 250 Z" fill="#b5332e"/><path d="M136 184 L148 192 M120 210 L132 218 M104 236 L116 244" fill="none" stroke="#d4a72c" stroke-width="2"/>'
      + [[96, 166], [100, 175], [106, 183], [113, 188], [127, 188], [134, 183], [140, 175], [144, 166]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4.2" fill="#7a4a2a" stroke-width="1.8"/>`).join('')
      + '<path d="M117 196 L116 207 L124 207 L123 196 Z" fill="#b5332e" stroke-width="1.8"/><circle cx="120" cy="192" r="5.5" fill="#b5332e" stroke-width="1.8"/>'
      + '<circle cx="88" cy="248" r="7" fill="#ffe7d1"/>' + _WIDE_SLEEVES('#f0a040', '#c96a1a') + '<circle cx="176" cy="238" r="7.5" fill="#ffe7d1"/>',
    head: _MONK_HEAD + '<path d="M70 88 Q76 58 120 54 Q164 58 170 88 Q150 74 120 72 Q90 74 70 88 Z" fill="#f2cdb0" stroke="none"/>'
      + [[108, 62], [120, 60], [132, 62], [110, 69], [120, 67.5], [130, 69]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.4" fill="#c9785a" stroke="none"/>`).join('')
      + '<path d="M84 70 Q94 60 106 58" fill="none" stroke="#ffffff" stroke-width="3"/>',
    faces: _faces(Object.assign({}, _MONK_FACE, { sweat: [162, 76], spark: [180, 66] })),
    front: '',
  },

  /* ---------------- Nga Mi · Nữ hiệp ---------------- */
  'nga_mi/f': {
    ink: '#3a2e3f', headBox: '44 10 152 152',
    under: _SWORD(-40, '#f2b6c8', '#d4a72c', '#b8506f', '#7a2e48', '#e88aa6'),
    hairBack: _LONG_HAIR('#3b2a3a'),
    body: '<rect x="92" y="283" width="27" height="13" rx="6" fill="#b8506f"/><rect x="121" y="283" width="27" height="13" rx="6" fill="#b8506f"/><rect x="111" y="148" width="18" height="20" fill="#f5cfae"/>'
      + '<path d="M92 166 Q120 158 148 166 L166 284 Q120 292 74 284 Z" fill="#fbf4f6"/><path d="M76 272 Q120 280 164 272 L166 284 Q120 292 74 284 Z" fill="#e88aa6"/><path d="M139 222 L141 286" fill="none"/>' + _COLLAR('#e88aa6')
      + '<path d="M85 208 Q120 214 155 208 L157 223 Q120 229 83 223 Z" fill="#e88aa6"/>'
      + [[120, 211.5], [124.3, 214.6], [122.6, 219.6], [117.4, 219.6], [115.7, 214.6]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3" fill="#ffffff" stroke-width="1.2"/>`).join('')
      + '<circle cx="120" cy="216" r="2" fill="#f2c84b" stroke="none"/><path d="M128 223 L122 256 L130 255 L133 224 Z" fill="#f2b6c8"/><path d="M133 224 L138 257 L144 253 L138 223 Z" fill="#f2b6c8"/>'
      + _HANDS + _WIDE_SLEEVES('#fbf4f6', '#e88aa6'),
    head: '<circle cx="82" cy="46" r="16" fill="#3b2a3a"/><circle cx="158" cy="46" r="16" fill="#3b2a3a"/><ellipse cx="120" cy="102" rx="64" ry="56" fill="#3b2a3a"/><path d="M70 54 Q60 72 62 96 Q70 78 78 60 Z" fill="#e88aa6"/><path d="M170 54 Q180 72 178 96 Q170 78 162 60 Z" fill="#e88aa6"/>'
      + [90, 150].map(cx => [[0, -5], [4.8, -1.5], [2.9, 4], [-2.9, 4], [-4.8, -1.5]].map(([dx, dy]) => `<circle cx="${cx + dx}" cy="${38 + dy}" r="4" fill="#f7a8c0" stroke-width="1.2"/>`).join('') + `<circle cx="${cx}" cy="38" r="2.2" fill="#f2c84b" stroke="none"/>`).join('')
      + _FACE(),
    faces: _faces({
      p: '#3b2a3a', i: '#c0587a', bo: 0.8, fem: true, sweat: [160, 104], spark: [188, 102], browsOver: true,
      brows: {
        attack: _brow('M88 104 L106 108', 2.8) + _brow('M152 104 L134 108', 2.8),
        hurt: _brow('M90 107 L104 103', 2.4) + _brow('M150 107 L136 103', 2.4),
      },
    }),
    front: '<path d="M62 112 Q56 58 120 52 Q184 58 178 112 Q174 100 166 96 L158 100 L150 94 L140 99 L130 93 L120 99 L110 93 L100 99 L90 94 L82 100 L74 96 Q66 100 62 112 Z" fill="#3b2a3a"/>'
      + _LONG_LOCKS('#3b2a3a') + '<path d="M88 66 Q102 60 118 60" fill="none" stroke="#6a5468" stroke-width="3"/>',
  },

  /* ---------------- Cái Bang · Thiếu hiệp ---------------- */
  'cai_bang/m': {
    ink: '#3a2e3f', headBox: '40 12 156 156',
    under: '',
    hairBack: '',
    body: _CB_LEGS(268)
      + '<path d="M92 166 Q120 158 148 166 L160 252 L154 260 L146 254 L138 262 L130 255 L120 263 L110 255 L102 262 L94 254 L86 260 L80 252 Z" fill="#a8885e"/><rect x="126" y="234" width="15" height="13" rx="2" fill="#7e9a5c" transform="rotate(8 133 240)"/><path d="M128 238 L139 239.5 M127.5 243 L138.5 244.5" fill="none" stroke="#4d6a35" stroke-width="1.2"/>'
      + _CB_BELT + _CB_BODY_ARMS,
    head: '<path d="M58 110 Q50 70 70 52 L64 34 L88 44 L94 22 L112 40 L124 16 L134 40 L154 24 L154 48 L178 40 L170 62 Q190 80 182 110 Z" fill="#4a3426"/>' + _FACE('#f7d6b8'),
    faces: _faces(Object.assign({}, _CB_FACE, {
      sweat: [184, 96], spark: [184, 80],
      deco: '<g transform="rotate(-20 154 130)"><rect x="145" y="126" width="18" height="8" rx="3" fill="#f2e2c0" stroke-width="1.6"/><path d="M152 128 L152 132 M156 128 L156 132" fill="none" stroke="#c9a86a" stroke-width="1.4"/></g>',
      mouth: Object.assign({}, _CB_FACE.mouth, {
        normal: '<path d="M111 135 Q120 146 129 135 Z" fill="#7a3b3b" stroke-width="2"/><path d="M122 135.5 L126 135.5 L124 139.5 Z" fill="#ffffff" stroke="none"/>',
        win: '<path d="M108 133 Q120 152 132 133 Z" fill="#7a3b3b" stroke-width="2"/><path d="M114 140 Q120 146 126 140 Q120 137 114 140 Z" fill="#ff8a8a" stroke="none"/>',
      }),
      brows: {
        normal: _brow('M88 103 Q97 99 106 101', 3.4) + _brow('M134 101 Q143 99 152 103', 3.4),
        attack: _brow('M87 101 L107 107', 3.8) + _brow('M153 101 L133 107', 3.8),
        hurt: _brow('M88 105 L106 100', 3.4) + _brow('M152 105 L134 100', 3.4),
        win: _brow('M88 102 Q97 97 106 99', 3.4) + _brow('M134 99 Q143 97 152 102', 3.4),
      },
    })),
    front: _BANGS('#4a3426') + _SHORT_LOCKS('#4a3426')
      + '<path d="M62 90 Q120 70 178 90 L177 100 Q120 80 63 100 Z" fill="#b85a3c"/><path d="M64 92 Q46 96 38 112 Q52 106 64 100 Z" fill="#b85a3c"/><path d="M64 96 Q52 108 52 126 Q60 112 66 102 Z" fill="#8f4530"/><path d="M90 66 Q102 60 116 60" fill="none" stroke="#6e5444" stroke-width="3"/>',
  },

  /* ---------------- Cái Bang · Nữ hiệp ---------------- */
  'cai_bang/f': {
    ink: '#3a2e3f', headBox: '44 12 156 156',
    under: '',
    hairBack: '',
    body: _CB_LEGS(270)
      + '<path d="M92 166 Q120 158 148 166 L162 260 L156 268 L148 262 L140 270 L130 263 L120 271 L110 263 L100 270 L92 262 L84 268 L78 260 Z" fill="#a8885e"/><rect x="126" y="238" width="15" height="13" rx="2" fill="#7e9a5c" transform="rotate(8 133 244)"/><path d="M128 242 L139 243.5 M127.5 247 L138.5 248.5" fill="none" stroke="#4d6a35" stroke-width="1.2"/>'
      + _CB_BELT + _CB_BODY_ARMS,
    head: '<path d="M150 56 Q196 52 198 100 Q200 140 184 168 Q186 130 176 100 Q168 76 150 70 Z" fill="#4a3426"/><ellipse cx="120" cy="102" rx="64" ry="56" fill="#4a3426"/><path d="M118 54 Q110 34 126 26 Q118 38 126 54 Z" fill="#4a3426"/>'
      + '<ellipse cx="162" cy="60" rx="8" ry="6" fill="#b85a3c"/><path d="M166 56 Q182 44 190 50 Q178 54 168 62 Z" fill="#b85a3c"/><path d="M166 62 Q184 62 188 74 Q176 68 166 66 Z" fill="#8f4530"/>' + _FACE('#f7d6b8'),
    faces: _faces(Object.assign({}, _CB_FACE, {
      fem: true, wink: true, sweat: [70, 72], spark: [62, 62],
      deco: '<circle cx="146" cy="133" r="1.2" fill="#c98a5a" stroke="none"/><circle cx="151" cy="130" r="1.2" fill="#c98a5a" stroke="none"/><circle cx="156" cy="133" r="1.2" fill="#c98a5a" stroke="none"/>'
        + '<g transform="rotate(18 86 131)"><rect x="77" y="127" width="18" height="8" rx="3" fill="#f2e2c0" stroke-width="1.6"/><path d="M84 129 L84 133 M88 129 L88 133" fill="none" stroke="#c9a86a" stroke-width="1.4"/></g>',
      mouth: {
        normal: '<path d="M113 136 Q120 144 127 136 Z" fill="#7a3b3b" stroke-width="2"/><path d="M121 136.5 L124.5 136.5 L122.8 139.5 Z" fill="#ffffff" stroke="none"/>',
        attack: '<path d="M111 134 Q120 148 129 134 Z" fill="#7a3b3b" stroke-width="2"/><path d="M114 134.5 L126 134.5 L125 137.5 L115 137.5 Z" fill="#ffffff" stroke="none"/>',
        hurt: '<path d="M112 140 Q116 135 120 140 Q124 145 128 140" fill="none" stroke="#7a3b3b" stroke-width="2.4"/>',
        win: _MOUTH.m.win,
      },
      brows: {
        normal: _brow('M89 104 Q97 100 105 102', 2.8) + _brow('M135 102 Q143 100 151 104', 2.8),
        attack: _brow('M88 101 L106 106', 3.2) + _brow('M152 101 L134 106', 3.2),
        hurt: _brow('M89 106 L105 101', 2.8) + _brow('M151 106 L135 101', 2.8),
        win: _brow('M89 103 Q97 98 105 100', 2.8) + _brow('M135 100 Q143 98 151 103', 2.8),
      },
    })),
    front: _BANGS('#4a3426') + _SHORT_LOCKS('#4a3426') + '<path d="M90 66 Q102 60 116 60" fill="none" stroke="#6e5444" stroke-width="3"/>',
  },

  /* ---------------- Vô Danh Phái · Thiếu hiệp ---------------- */
  'vo_danh/m': {
    ink: '#2a2430', headBox: '24 18 192 192',
    under: '<g transform="rotate(-40 120 190)"><rect x="113" y="122" width="14" height="160" rx="5" fill="#1f1c24"/><rect x="113" y="270" width="14" height="10" fill="#c9ced6"/><rect x="113" y="124" width="14" height="8" fill="#c9ced6"/><rect x="103" y="114" width="34" height="8" rx="3" fill="#c9ced6"/><rect x="115" y="56" width="10" height="58" rx="3" fill="#8e2620"/><path d="M115 70 L125 76 M115 82 L125 88 M115 94 L125 100" fill="none" stroke="#5e1a16" stroke-width="2"/><circle cx="120" cy="50" r="6.5" fill="#c9ced6"/></g><path d="M30 88 Q23 102 27 120 L36 120 Q34 102 30 88 Z" fill="#b8322a"/>',
    hairBack: '',
    body: '<rect x="99" y="262" width="17" height="30" rx="4" fill="#1f1c24"/><rect x="124" y="262" width="17" height="30" rx="4" fill="#1f1c24"/><path d="M99 268 L116 268 M124 268 L141 268" fill="none" stroke="#8a8f99" stroke-width="2"/><rect x="93" y="286" width="25" height="11" rx="5" fill="#1f1c24"/><rect x="122" y="286" width="25" height="11" rx="5" fill="#1f1c24"/><rect x="111" y="148" width="18" height="20" fill="#f5cfae"/>'
      + '<path d="M92 166 Q120 158 148 166 L164 276 Q120 284 76 276 Z" fill="#2e2a33"/><path d="M103 222 L137 222 L141 279 Q120 284 99 279 Z" fill="#b8322a"/><path d="M107 222 L133 222 L136 277 Q120 281 104 277 Z" fill="#1f1c24"/>'
      + '<path d="M110 162 L120 182 L130 162 Z" fill="#b8322a"/><path d="M134 162 L124 178 L119 173 L127 161 Z" fill="#4a4452"/><path d="M106 164 L138 208 L146 206 L116 162 Z" fill="#4a4452"/>'
      + '<path d="M85 206 Q120 212 155 206 L157 224 Q120 230 83 224 Z" fill="#1f1c24"/><path d="M86 210 Q120 216 154 210 M85 220 Q120 226 156 220" fill="none" stroke="#8a8f99" stroke-width="1.6"/><rect x="112" y="208" width="16" height="16" rx="3" fill="#c9ced6"/>'
      + '<path d="M98 226 L98 240 M142 226 L142 240" fill="none" stroke="#8a8f99" stroke-width="1.6"/><circle cx="98" cy="243" r="3" fill="#c9ced6" stroke-width="1.5"/><circle cx="142" cy="243" r="3" fill="#c9ced6" stroke-width="1.5"/><path d="M96 246 L95 256 M100 246 L101 256 M140 246 L139 256 M144 246 L145 256" fill="none" stroke="#b8322a" stroke-width="1.8"/>'
      + '<path d="M96 168 Q80 176 76 200 L74 228 L90 230 L94 200 Q98 186 100 182 Z" fill="#2e2a33"/><path d="M74 212 L91 214 L90 230 L74 228 Z" fill="#4a4452"/><path d="M74.5 218 L90.5 220" fill="none" stroke="#c9ced6" stroke-width="1.6"/><circle cx="82" cy="236" r="7.5" fill="#ffe7d1"/>'
      + '<path d="M144 168 Q160 176 164 200 L166 228 L150 230 L146 200 Q142 186 140 182 Z" fill="#2e2a33"/><path d="M149 214 L166 212 L166 228 L150 230 Z" fill="#4a4452"/><path d="M149.5 220 L165.5 218" fill="none" stroke="#c9ced6" stroke-width="1.6"/><circle cx="158" cy="236" r="7.5" fill="#ffe7d1"/>',
    head: '<path d="M66 84 Q56 130 100 163 M174 84 Q184 130 140 163" fill="none" stroke="#8a6a3a" stroke-width="2.4"/>' + _MONK_HEAD,
    faces: _faces(Object.assign({}, _MONK_FACE, { spark: null })),
    front: '<path d="M4 78 Q60 58 104 36 Q120 26 136 36 Q180 58 236 78 Q120 96 4 78 Z" fill="#d9b36a"/><path d="M40 64 Q120 82 200 64 M76 50 Q120 64 164 50" fill="none" stroke="#b88a45" stroke-width="1.4"/>'
      + '<path d="M120 30 L36 84 M120 30 L76 88 M120 30 L120 90 M120 30 L164 88 M120 30 L204 84" fill="none" stroke="#b88a45" stroke-width="1.4"/><circle cx="120" cy="30" r="5" fill="#c49a50"/><path d="M4 78 Q120 96 236 78 Q120 104 4 78 Z" fill="#b88a45"/>',
  },

  /* ---------------- Vô Danh Phái · Nữ hiệp ---------------- */
  'vo_danh/f': {
    ink: '#3a2e3f', headBox: '44 18 152 152',
    under: '<circle cx="120" cy="172" r="72" fill="#d9b36a"/><path d="M120 100 L120 150 M120 194 L120 244 M48 172 L98 172 M142 172 L192 172 M69 121 L104 156 M136 188 L171 223 M171 121 L136 156 M104 188 L69 223" fill="none" stroke="#b88a45" stroke-width="1.6"/><circle cx="120" cy="172" r="22" fill="#c9a058"/>',
    hairBack: _LONG_HAIR('#3a2a24'),
    body: '<rect x="92" y="283" width="27" height="13" rx="6" fill="#3a2a20"/><rect x="121" y="283" width="27" height="13" rx="6" fill="#3a2a20"/><rect x="111" y="148" width="18" height="20" fill="#f5cfae"/>'
      + '<path d="M92 166 Q120 158 148 166 L166 284 Q120 292 74 284 Z" fill="#f1e6d0"/><path d="M76 272 Q120 280 164 272 L166 284 Q120 292 74 284 Z" fill="#c46a2b"/><path d="M139 222 L141 286" fill="none"/>' + _COLLAR('#c46a2b')
      + '<path d="M98 170 Q120 194 142 170" fill="none" stroke="#8a6a3a" stroke-width="2.2"/><path d="M85 208 Q120 214 155 208 L157 223 Q120 229 83 223 Z" fill="#5a3b2e"/>'
      + '<path d="M128 223 L122 256 L130 255 L133 224 Z" fill="#c46a2b"/><path d="M133 224 L138 257 L144 253 L138 223 Z" fill="#c46a2b"/>'
      + '<path d="M108 224 L108 231" fill="none" stroke-width="1.8"/><path d="M102 232 L114 232 L116 248 Q108 254 100 248 Z" fill="#8a5a3a"/><path d="M101 236 L115 236" fill="none" stroke="#d4a72c" stroke-width="2"/>'
      + '<circle cx="88" cy="248" r="7.5" fill="#e8dcc0"/><path d="M82 246 L94 244 M82 251 L94 249" fill="none" stroke="#b8a88a" stroke-width="1.4"/><circle cx="152" cy="248" r="7.5" fill="#e8dcc0"/><path d="M146 244 L158 246 M146 249 L158 251" fill="none" stroke="#b8a88a" stroke-width="1.4"/>'
      + _WIDE_SLEEVES('#f1e6d0', '#c46a2b'),
    head: '<circle cx="146" cy="52" r="13" fill="#3a2a24"/><ellipse cx="120" cy="102" rx="64" ry="56" fill="#3a2a24"/><path d="M140 44 L166 34" fill="none" stroke="#a0703f" stroke-width="3.5"/><circle cx="167" cy="33.5" r="3.5" fill="#c46a2b"/>' + _FACE(),
    faces: _faces({
      p: '#3a2418', i: '#b8652a', fem: true, sweat: [164, 84], spark: null,
      brows: {
        normal: _brow('M90 104 Q97 101 104 103', 2.2) + _brow('M136 103 Q143 101 150 104', 2.2),
        attack: _brow('M89 100 L105 105', 2.8) + _brow('M151 100 L135 105', 2.8),
        hurt: _brow('M90 105 L104 100', 2.2) + _brow('M150 105 L136 100', 2.2),
        win: _brow('M90 103 Q97 99 104 101', 2.2) + _brow('M136 101 Q143 99 150 103', 2.2),
      },
    }),
    front: _BANGS_SWEPT('#3a2a24') + _LONG_LOCKS('#3a2a24') + '<path d="M88 66 Q102 60 118 60" fill="none" stroke="#6a544a" stroke-width="3"/>',
  },
};

/* Tìm tạo hình theo môn phái + danh xưng (không có thì lấy giới còn lại) */
function avatarOf(sect, title) {
  const g = title === 'Nữ hiệp' ? 'f' : 'm';
  return AVATARS[sect + '/' + g] || AVATARS[sect + '/' + (g === 'f' ? 'm' : 'f')] || null;
}

/* Nhân vật dùng ảnh vẽ sẵn (ảnh người dùng tạo bằng AI) thay cho hình vẽ khối: cả người một ảnh,
   đổi biểu cảm bằng miếng mặt dán đè (mặt bình thường = chính ảnh gốc).
   Tọa độ tính theo ảnh gốc (w × h); ảnh lưu nửa cỡ. head = khung cắt phần đầu [x, y, cỡ]. */
const AVATAR_IMG = {
  'vo_danh/f': { src: 'game/img/vo_danh_f', w: 674, h: 1445, face: [292, 346, 348, 260], head: [95, 20, 560], foot: [394, 1440],
    // Ảnh tạo dáng lúc ra đòn: foot = điểm giữa thân chạm đất trong ảnh dáng, trùng với foot của ảnh đứng; k = cỡ so với ảnh đứng
    poses: { punch: { src: 'game/img/vo_danh_f_punch.png', w: 1286, h: 1447, foot: [671, 1381], k: 0.83 } } },
  // Nam (hình động người dùng làm bằng Meowa 2026-10-31): ảnh tĩnh vdm.png = khung đầu của hình đứng thở (640 × 640).
  // anim: tờ hình nhiều khung xếp ngang (sheet), mỗi khung vuông cỡ f; đặt trong khung 240×320 ở [x, y] với cỡ d.
  //   idle: đứng thở lặp 16 khung; atk: ra đòn 11 khung (0–5 hạ tấn đẩy chưởng, giữ khung 5 lúc chiêu bay; 6–10 hạ tay về thế)
  'vo_danh/m': { src: 'game/img/vdm', w: 640, h: 640, head: [125, 5, 260], foot: [302, 620],
    anim: {
      idle: { sheet: 'game/img/vdm_idle.png', n: 16, f: 320, d: 320, x: -31, y: -5 },
      atk: { sheet: 'game/img/vdm_atk.png', n: 11, f: 480, d: 482, x: -112, y: -85, wind: 6 },
    } },
};
// Hình động trong khung 240×320: idle lặp mãi; 'wind' = hạ tấn đẩy chưởng rồi giữ; 'back' = hạ tay về thế (CSS ở style.css, khối "Hình động nhân vật")
function avatarAnimSvg(m, part) {
  const a = part === 'idle' ? m.anim.idle : m.anim.atk, f = a.f;
  const cls = part === 'idle' ? 'av-idle' : part === 'wind' ? 'av-wind' : 'av-back';
  return `<svg class="avatar body av-anim" viewBox="0 0 240 320" style="overflow:visible" aria-hidden="true"><ellipse cx="120" cy="301" rx="62" ry="9" fill="#2a1a10" opacity="0.14"/>`
    + `<svg x="${a.x}" y="${a.y}" width="${a.d}" height="${a.d}" viewBox="0 0 ${f} ${f}" overflow="hidden"><image class="${cls}" href="${a.sheet}" width="${f * a.n}" height="${f}"/></svg></svg>`;
}
// Ảnh tạo dáng (vd. đấm) trong khung 240×320, đặt sao cho chân trùng chỗ ảnh đứng; rỗng nếu không có
function avatarImgPose(sect, title, pose) {
  const m = avatarImgOf(sect, title), p = m && m.poses && m.poses[pose];
  if (!p) return '';
  const s0 = 300 / m.h, x0 = (240 - m.w * s0) / 2, s = s0 * p.k;
  const tx = x0 + m.foot[0] * s0 - p.foot[0] * s, ty = 5 + m.foot[1] * s0 - p.foot[1] * s;
  return `<svg class="avatar body" viewBox="0 0 240 320" style="overflow:visible" aria-hidden="true"><ellipse cx="120" cy="301" rx="62" ry="9" fill="#2a1a10" opacity="0.14"/>`
    + `<image href="${p.src}" transform="translate(${tx.toFixed(1)} ${ty.toFixed(1)}) scale(${s.toFixed(4)})" width="${p.w}" height="${p.h}"/></svg>`;
}
function avatarImgOf(sect, title) { return AVATAR_IMG[sect + '/' + (title === 'Nữ hiệp' ? 'f' : 'm')] || null; }
// miếng mặt theo biểu cảm (rỗng khi bình thường)
function avatarImgFace(m, face) {
  if (!face || face === 'normal' || !m.face) return '';
  const [x, y, w, h] = m.face;
  return `<image href="${m.src}_${face}.png" x="${x}" y="${y}" width="${w}" height="${h}"/>`;
}
// ảnh nhân vật trong khung 240×320 của các hình khác (chân chạm đáy như hình vẽ khối)
function avatarImgBody(m, face, cls) {
  if (m.anim) return avatarAnimSvg(m, 'idle');
  const s = 300 / m.h, x = (240 - m.w * s) / 2;
  return `<svg class="avatar body${cls ? ' ' + cls : ''}" viewBox="0 0 240 320" aria-hidden="true"><ellipse cx="120" cy="301" rx="62" ry="9" fill="#2a1a10" opacity="0.14"/>`
    + `<g class="sd-l-body"><g transform="translate(${x.toFixed(1)} 5) scale(${s.toFixed(4)})"><image href="${m.src}.png" width="${m.w}" height="${m.h}"/><g data-face="0">${avatarImgFace(m, face)}</g><g data-face="1"></g></g></g></svg>`;
}

/* Trả về thẻ <svg> của nhân vật.
   view: 'body' (toàn thân) | 'head' (chỉ phần đầu)
   face: 'normal' | 'attack' | 'hurt' | 'win' */
function avatarSvg(sect, title, view, face) {
  const m = avatarImgOf(sect, title);
  if (m) {
    if (view === 'head') {
      const [hx, hy, hs] = m.head;
      return `<svg class="avatar head" viewBox="${hx} ${hy} ${hs} ${hs}" aria-hidden="true"><image href="${m.src}.png" width="${m.w}" height="${m.h}"/>${avatarImgFace(m, face)}</svg>`;
    }
    return avatarImgBody(m, face);
  }
  const a = avatarOf(sect, title);
  if (!a) return '';
  const f = a.faces[face] || a.faces.normal;
  const g = `<g stroke="${a.ink}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round">`;
  if (view === 'head') {
    return `<svg class="avatar head" viewBox="${a.headBox}" aria-hidden="true">${g}${a.hairBack}${a.head}${f[0]}${a.front}${f[1]}</g></svg>`;
  }
  return `<svg class="avatar body" viewBox="0 0 240 320" aria-hidden="true"><ellipse cx="120" cy="301" rx="62" ry="9" fill="#2a1a10" opacity="0.14"/>`
    + `${g}${a.under}${a.hairBack}${a.body}${a.head}${f[0]}${a.front}${f[1]}</g></svg>`;
}
