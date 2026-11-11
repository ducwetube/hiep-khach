'use strict';
/* =================================================================
   HIỆP KHÁCH GIANG HỒ — ÂM THANH
   -----------------------------------------------------------------
   Nhạc nền và tiếng động do máy tự tạo ra bằng Web Audio, không cần
   file nhạc, chạy offline. Nhạc nền và các đoạn nhạc ngắn chỉ dùng tiếng
   sáo trúc (sáo chính dẫn giai điệu, sáo trầm thổi nhỏ làm đệm), có tiếng
   vang không gian; người chơi thấy các nhạc cụ khác khó nghe nên đã bỏ.
   Tiếng chiêu thức thì dùng thêm trống, chuông, gió...

   Mỗi bản nhạc nền là một bài soạn sẵn (giai điệu ngũ cung, nhiều đoạn:
   dạo đầu → đoạn A → đoạn B → nhắc lại → kết), dài 1–2 phút rồi mới lặp.
   Muốn sửa giai điệu: xem SONGS bên dưới. Mỗi nốt viết "Tên+quãng tám:độ dài",
   độ dài tính bằng nốt móc đơn (8 = một ô nhịp 4/4), "r" là dấu lặng.

   Cách dùng:
     SND.music('village')   chuyển nhạc nền, tự chuyển êm (null = tắt)
     SND.sfx('slash')       phát một tiếng động
     SND.jingle('win')      đoạn nhạc ngắn (thắng, thua, lên cấp...)
     SND.hit(kind, crit)    tiếng đòn theo kiểu hiệu ứng chiêu (effects.js)
     SND.themeFor(bg, type) nhạc nền hợp với nền của một địa điểm
     SND.set({ music, sfx, musicVol, sfxVol })   đổi cài đặt (tự lưu)
   Trình duyệt chỉ cho phát tiếng sau lần bấm/chạm đầu tiên của người chơi.
   ================================================================= */

/* Nhạc nền của từng nền địa điểm (trường "bg" trong LOCATIONS) */
const SND_BG_THEMES = {
  village: 'village', blossom: 'village', forest: 'forest', mist: 'forest', valley: 'forest',
  town: 'town', beggar: 'town', temple: 'temple',
  mountain: 'wild', snow: 'snow', evil: 'evil', ruin: 'ruin', abyss: 'forest',
};
/* Tiếng đòn theo kiểu hiệu ứng chiêu (FX kind trong effects.js) */
const SND_KIND = {
  thuong: 'hit', quyen: 'hit', lahan: 'heavy', dailuc: 'heavy', nhulai: 'heavy', songlong: 'heavy', longtieu: 'heavy', cuonglong: 'heavy', chienlong: 'heavy', kiem: 'slash', cuu_kiem: 'slash3', con: 'heavy', vdk5: 'slash3', vdk10: 'slash3', vdky5: 'slash', vdky10: 'slash3', diet_tuyet: 'slash3', that_sat: 'slash3',
  chuong: 'palm', phat_chuong: 'buddha', rong: 'dragon', thai_cuc: 'swirl', bang: 'ice',
  doc: 'poison', hoi: 'heal', ho: 'bell', kim_chung: 'bell', luc: 'power', ne: 'whoosh', choang: 'stun',
  minhvuong: 'bell', phochieu: 'buddha', sohien: 'palm', sonha: 'heavy', trieutong: 'buddha', loiam: 'buddha', khongtuong: 'palm', botatan: 'buddha', // bộ Tâm Phật Chưởng
};

/* ---------- Các bài nhạc nền ----------
   bpm: nhịp độ   acc: kiểu sáo trầm đệm (arp = ngân dài kèm nốt phụ, slow = chỉ ngân dài,
   pulse = thổi ngắt theo nhịp, ost = thổi nảy dồn dập), xem ACC bên dưới
   form: thứ tự các đoạn [đoạn, nhạc cụ dẫn giai điệu (luôn là flute = sáo), dịch quãng]
     dịch quãng: 12 = lên một quãng tám, -12 = xuống một quãng tám */
const SONGS = {
  village: {
    name: 'Làng quê', bpm: 76, acc: 'arp',
    A: {
      mel: 'A4:2 B4:1 D5:1 E5:3 D5:1 | B4:2 A4:2 F#4:4 | E4:2 F#4:1 A4:1 B4:2 A4:1 B4:1 | D5:6 r:2 | E5:2 F#5:1 E5:1 D5:2 B4:2 | A4:3 B4:1 A4:2 F#4:2 | E4:2 D4:1 E4:1 F#4:2 A4:2 | D4:6 r:2',
      bass: 'D3 B2 E3 D3 B2 F#2 A2 D3',
    },
    B: {
      mel: 'F#5:3 E5:1 D5:2 E5:2 | A5:4 F#5:4 | E5:2 D5:2 B4:2 D5:2 | E5:6 r:2 | D5:2 E5:1 F#5:1 A5:2 F#5:2 | E5:2 D5:2 B4:4 | A4:2 B4:1 D5:1 E5:2 F#5:1 E5:1 | D5:8',
      bass: 'D3 F#2 E3 A2 B2 E3 A2 D3',
    },
    form: [['I'], ['A', 'flute'], ['A', 'flute'], ['B', 'flute'], ['B', 'flute'], ['A', 'flute'], ['O']],
  },
  forest: {
    name: 'Rừng trúc', bpm: 66, acc: 'slow',
    A: {
      mel: 'A4:4 B4:2 A4:2 | F#4:2 E4:2 D4:4 | E4:2 F#4:2 A4:3 B4:1 | A4:8 | D5:3 B4:1 A4:2 B4:2 | D5:2 E5:2 F#5:4 | E5:2 D5:1 B4:1 A4:2 F#4:2 | E4:8',
      bass: 'D3 D3 A2 A2 B2 D3 A2 E3',
    },
    B: {
      mel: 'B4:3 D5:1 E5:4 | F#5:2 E5:2 D5:2 B4:2 | A4:4 F#4:2 A4:2 | B4:8 | D5:2 E5:2 D5:2 B4:2 | A4:3 F#4:1 E4:4 | F#4:2 A4:2 E4:2 F#4:2 | D4:8',
      bass: 'B2 D3 D3 B2 B2 E3 A2 D3',
    },
    form: [['I'], ['A', 'flute'], ['B', 'flute'], ['A', 'flute'], ['B', 'flute'], ['A', 'flute'], ['O']],
  },
  town: {
    name: 'Trấn thành', bpm: 104, acc: 'pulse',
    A: {
      mel: 'D5:1 E5:1 F#5:1 A5:1 F#5:2 E5:2 | D5:1 E5:1 D5:1 B4:1 A4:4 | B4:1 D5:1 E5:1 D5:1 B4:2 A4:2 | F#4:2 A4:2 B4:4 | D5:1 E5:1 F#5:1 A5:1 B5:2 A5:2 | F#5:1 E5:1 D5:1 E5:1 F#5:4 | E5:2 D5:1 B4:1 A4:2 F#4:1 A4:1 | D5:6 r:2',
      bass: 'D3 A2 B2 A2 D3 D3 A2 D3',
    },
    B: {
      mel: 'A5:2 F#5:1 E5:1 D5:2 E5:2 | F#5:2 A5:2 E5:4 | D5:2 B4:1 A4:1 B4:2 D5:2 | E5:4 F#5:4 | A5:1 B5:1 A5:1 F#5:1 E5:2 D5:2 | B4:2 D5:2 E5:4 | F#5:2 E5:1 D5:1 B4:2 A4:2 | D5:8',
      bass: 'D3 D3 B2 A2 F#2 E2 A2 D3',
    },
    form: [['I'], ['A', 'flute'], ['B', 'flute'], ['A', 'flute'], ['B', 'flute'], ['A', 'flute'], ['O']],
  },
  temple: {
    name: 'Chùa chiền', bpm: 58, acc: 'slow',
    A: {
      mel: 'G4:4 A4:2 B4:2 | D5:6 B4:2 | A4:2 G4:2 E4:4 | D4:8 | E4:2 G4:2 A4:4 | B4:2 A4:2 G4:4 | E4:2 D4:2 E4:2 G4:2 | G4:8',
      bass: 'G2 G2 E2 D2 E2 E2 D2 G2',
    },
    B: {
      mel: 'D5:4 E5:4 | G5:4 E5:2 D5:2 | B4:4 D5:2 B4:2 | A4:8 | G4:2 A4:2 B4:2 D5:2 | E5:4 D5:4 | B4:2 A4:2 G4:2 E4:2 | G4:8',
      bass: 'G2 E2 G2 D2 E2 A2 D2 G2',
    },
    form: [['I'], ['A', 'flute'], ['B', 'flute'], ['A', 'flute'], ['B', 'flute'], ['O']],
  },
  wild: {
    name: 'Núi hoang', bpm: 84, acc: 'slow',
    A: {
      mel: 'A4:3 C5:1 D5:2 E5:2 | D5:2 C5:2 A4:4 | G4:2 A4:2 C5:2 D5:2 | E5:8 | G5:3 E5:1 D5:2 C5:2 | D5:2 E5:2 A4:4 | C5:2 A4:1 G4:1 E4:2 G4:2 | A4:8',
      bass: 'A2 A2 G2 E2 C3 D3 E2 A2',
    },
    B: {
      mel: 'E5:2 G5:2 A5:4 | G5:2 E5:2 D5:4 | C5:2 D5:2 E5:2 G5:2 | E5:8 | D5:3 C5:1 A4:2 C5:2 | D5:2 E5:2 G4:4 | A4:2 C5:2 D5:2 E5:2 | A4:8',
      bass: 'A2 G2 A2 E2 D2 G2 D2 A2',
    },
    form: [['I'], ['A', 'flute'], ['B', 'flute'], ['A', 'flute'], ['B', 'flute'], ['A', 'flute'], ['O']],
  },
  snow: {
    name: 'Tuyết sơn', bpm: 60, acc: 'slow',
    A: {
      mel: 'B5:4 G#5:2 F#5:2 | E5:8 | C#6:2 B5:2 G#5:4 | F#5:8 | G#5:2 B5:2 C#6:2 B5:2 | G#5:4 F#5:4 | E5:2 F#5:2 G#5:2 B4:2 | E5:8',
      bass: 'E2 E2 C#2 B1 E2 C#2 B1 E2',
    },
    B: {
      mel: 'G#4:4 B4:4 | C#5:4 B4:2 G#4:2 | F#4:8 | r:8 | E4:2 F#4:2 G#4:2 B4:2 | C#5:6 B4:2 | G#4:4 F#4:4 | E4:8',
      bass: 'E2 C#2 B1 B1 E2 C#2 B1 E2',
    },
    form: [['I'], ['A', 'flute'], ['B', 'flute'], ['A', 'flute', -12], ['B', 'flute'], ['A', 'flute'], ['O']],
  },
  evil: {
    name: 'Ma giáo', bpm: 66, acc: 'slow',
    A: {
      mel: 'A4:4 Bb4:2 A4:2 | E4:6 r:2 | F4:2 E4:2 D4:2 E4:2 | A3:8 | D5:3 E5:1 F5:2 E5:2 | Bb4:4 A4:4 | F4:2 E4:2 Bb4:2 A4:2 | A4:8',
      bass: 'A1 A1 D2 A1 D2 Bb1 D2 A1',
    },
    B: {
      mel: 'E5:4 F5:2 E5:2 | D5:2 Bb4:2 A4:4 | F4:2 A4:2 Bb4:2 D5:2 | E5:8 | F5:2 E5:2 D5:2 Bb4:2 | A4:4 E4:4 | F4:2 E4:2 D4:2 Bb3:2 | A3:8',
      bass: 'A1 D2 D2 A1 Bb1 A1 D2 A1',
    },
    form: [['I'], ['A', 'flute'], ['B', 'flute'], ['A', 'flute'], ['B', 'flute'], ['O']],
  },
  ruin: {
    name: 'Phế tích', bpm: 60, acc: 'slow',
    A: {
      mel: 'E5:4 D5:2 C5:2 | A4:6 r:2 | G4:2 A4:2 C5:2 D5:2 | E5:6 r:2 | G5:3 E5:1 D5:2 E5:2 | C5:4 A4:4 | G4:2 E4:2 G4:2 A4:2 | A4:8',
      bass: 'A2 A2 G2 C3 E2 A2 E2 A2',
    },
    B: {
      mel: 'A4:4 C5:4 | D5:3 E5:1 D5:4 | C5:2 A4:2 G4:4 | E4:8 | G4:2 A4:2 C5:2 E5:2 | D5:6 C5:2 | A4:2 G4:2 E4:2 G4:2 | A4:8',
      bass: 'A2 D3 A2 E2 C3 G2 E2 A2',
    },
    form: [['I'], ['A', 'flute'], ['B', 'flute'], ['A', 'flute'], ['B', 'flute'], ['O']],
  },
  combat: {
    name: 'Giao chiến', bpm: 144, acc: 'ost',
    A: {
      mel: 'A4:2 C5:1 D5:1 E5:2 D5:1 C5:1 | D5:2 E5:2 G5:2 E5:2 | A5:3 G5:1 E5:2 D5:2 | E5:4 A4:4 | C5:1 D5:1 E5:2 G5:2 A5:2 | G5:1 E5:1 D5:2 C5:2 D5:2 | E5:2 G5:2 E5:1 D5:1 C5:2 | A4:6 r:2',
      bass: 'A2 A2 A2 E2 C3 G2 E2 A2',
    },
    B: {
      mel: 'E5:2 E5:1 G5:1 A5:4 | G5:2 E5:2 D5:4 | C5:2 C5:1 D5:1 E5:4 | D5:2 C5:2 A4:4 | A5:2 G5:1 E5:1 G5:2 A5:2 | C6:4 A5:4 | G5:1 A5:1 G5:1 E5:1 D5:2 E5:2 | A5:8',
      bass: 'C3 G2 A2 D3 A2 A2 G2 A2',
    },
    form: [['I'], ['A', 'flute'], ['A', 'flute'], ['B', 'flute'], ['B', 'flute'], ['A', 'flute']],
  },
  boss: {
    name: 'Trận boss', bpm: 152, acc: 'ost',
    A: {
      mel: 'A4:2 Bb4:2 A4:1 G4:1 F4:2 | E4:4 A4:4 | D5:2 E5:1 F5:1 E5:2 D5:2 | Bb4:4 A4:4 | A5:2 G5:1 F5:1 E5:2 F5:2 | E5:2 D5:2 Bb4:4 | A4:1 Bb4:1 A4:1 G4:1 F4:2 E4:2 | A4:8',
      bass: 'A1 A1 D2 Bb1 A1 D2 A1 A1',
    },
    B: {
      mel: 'E5:2 F5:2 A5:4 | Bb5:4 A5:4 | F5:2 E5:2 D5:2 E5:2 | A4:8 | D5:2 D5:1 E5:1 F5:2 E5:2 | D5:2 Bb4:2 A4:4 | G4:2 F4:2 E4:2 F4:2 | E4:8',
      bass: 'A1 Bb1 D2 A1 D2 Bb1 G1 E1',
    },
    form: [['I'], ['A', 'flute'], ['B', 'flute'], ['A', 'flute'], ['B', 'flute']],
  },
};

const SND = (() => {
  const KEY = 'giang_ho_hanh_audio';
  const opts = { music: true, sfx: true, musicVol: 0.6, sfxVol: 0.8 };
  try { Object.assign(opts, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) { /* không đọc được thì dùng mặc định */ }

  let ctx = null, out = null, musicBus = null, sfxBus = null, noiseBuf = null;
  let cur = null, wanted = null, timer = null;

  const rnd = (a, b) => a + Math.random() * (b - a);
  const hz = m => 440 * Math.pow(2, (m - 69) / 12);
  const PC = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  function midi(name) {
    const m = /^([A-G])([#b]?)(-?\d)$/.exec(name);
    if (!m) return null;
    return 12 * (+m[3] + 1) + PC[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
  }

  /* ---------- Khởi động ---------- */
  function impulse(sec, decay) {
    const len = Math.floor(ctx.sampleRate * sec), buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
    return buf;
  }
  function init() {
    if (ctx) return ctx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14; comp.ratio.value = 3.5;
    comp.connect(ctx.destination);
    out = ctx.createGain(); out.connect(comp);
    const verb = ctx.createConvolver(); verb.buffer = impulse(2.6, 3);
    const verbIn = ctx.createGain(); verbIn.gain.value = 1;
    verbIn.connect(verb); verb.connect(out);
    musicBus = ctx.createGain(); musicBus.connect(out);
    sfxBus = ctx.createGain(); sfxBus.connect(out);
    const ms = ctx.createGain(); ms.gain.value = 0.32; musicBus.connect(ms); ms.connect(verbIn);
    const ss = ctx.createGain(); ss.gain.value = 0.22; sfxBus.connect(ss); ss.connect(verbIn);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    applyVol();
    return ctx;
  }
  const ready = () => ctx && ctx.state === 'running';
  function applyVol() {
    if (!ctx) return;
    musicBus.gain.setTargetAtTime(opts.music ? opts.musicVol * 0.7 : 0, ctx.currentTime, 0.1);
    sfxBus.gain.setTargetAtTime(opts.sfx ? opts.sfxVol : 0, ctx.currentTime, 0.05);
  }
  function unlock() {
    if (!init()) return;
    const go = () => { if (wanted && !cur && opts.music) start(wanted); };
    if (ctx.state === 'suspended') ctx.resume().then(go); else go();
  }
  ['pointerdown', 'keydown', 'touchend'].forEach(ev => window.addEventListener(ev, unlock, { passive: true }));

  /* ---------- Khối dựng âm ---------- */
  function env(dst, t, a, peak, d) {
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + a + d);
    g.connect(dst);
    return g;
  }
  function osc(type, f, t, end, dst) {
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(f, t);
    o.connect(dst);
    o.start(t); o.stop(end);
    return o;
  }
  function noise(t, dur, dst, type, freq, q) {
    const s = ctx.createBufferSource();
    s.buffer = noiseBuf; s.loop = true;
    const fl = ctx.createBiquadFilter();
    fl.type = type; fl.frequency.setValueAtTime(freq, t); fl.Q.value = q || 0.8;
    s.connect(fl); fl.connect(dst);
    s.start(t, Math.random()); s.stop(t + dur);
    return fl;
  }
  function panner(dst, p) {
    if (!ctx.createStereoPanner) return { node: dst, pan: null };
    const sp = ctx.createStereoPanner(); sp.pan.value = p; sp.connect(dst);
    return { node: sp, pan: sp.pan };
  }

  /* ---------- Nhạc cụ ---------- */
  // Sáo trúc: tiếng tròn có chút hơi thở, rung nhẹ và muộn, không luyến
  function flute(dst, t, m, dur, vol) {
    const f = hz(m), g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.07);
    g.gain.setValueAtTime(vol * 0.9, t + Math.max(0.08, dur - 0.12));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.05);
    g.connect(dst);
    const o = osc('sine', f, t, t + dur + 0.1, g);
    const lfo = ctx.createOscillator(); lfo.frequency.value = 5;
    const lg = ctx.createGain(); lg.gain.setValueAtTime(0, t); lg.gain.setValueAtTime(0, t + Math.min(0.35, dur * 0.5)); lg.gain.linearRampToValueAtTime(f * 0.004, t + Math.min(0.8, dur));
    lfo.connect(lg); lg.connect(o.frequency); lfo.start(t); lfo.stop(t + dur + 0.1);
    const h2 = ctx.createGain(); h2.gain.value = 0.2; h2.connect(g); osc('sine', f * 2, t, t + dur + 0.1, h2);
    const br = ctx.createGain(); br.gain.value = 0.12; br.connect(g);
    noise(t, dur + 0.1, br, 'bandpass', f * 2.5, 3);
  }
  // Chuông nhỏ, khánh, cồng: nhiều sóng lệch tần nên nghe kim loại
  function bell(dst, t, f, vol, len) {
    len = len || 2.4;
    [1, 2.76, 5.4, 8.93].forEach((mm, i) => osc('sine', f * mm, t, t + len, env(dst, t, 0.004, vol / (i * 1.4 + 1), len / (i + 1))));
  }
  function drum(dst, t, vol, hi) {
    const g = env(dst, t, 0.003, vol, hi ? 0.16 : 0.5);
    const o = osc('sine', hi ? 240 : 115, t, t + 0.7, g);
    o.frequency.exponentialRampToValueAtTime(hi ? 125 : 42, t + (hi ? 0.1 : 0.35));
    noise(t, 0.09, env(dst, t, 0.002, vol * 0.4, 0.06), 'lowpass', hi ? 3200 : 900);
  }
  function wood(dst, t, vol, f) {
    f = f || 880;
    osc('sine', f, t, t + 0.12, env(dst, t, 0.002, vol, 0.07)).frequency.exponentialRampToValueAtTime(f * 0.8, t + 0.07);
  }
  function chirp(dst, t, p) {
    const n = 2 + Math.floor(Math.random() * 3), base = rnd(2400, 3600), o2 = p == null ? dst : panner(dst, p).node;
    for (let k = 0; k < n; k++) {
      const t0 = t + k * rnd(0.07, 0.11);
      osc('sine', base, t0, t0 + 0.1, env(o2, t0, 0.005, 0.04, 0.07)).frequency.exponentialRampToValueAtTime(base * rnd(1.15, 1.4), t0 + 0.06);
    }
  }

  /* ---------- Dựng bài nhạc thành danh sách nốt ---------- */
  function parseMel(str) {
    const notes = [];
    let at = 0;
    str.split(/\s+/).forEach(tok => {
      if (!tok || tok === '|') return;
      const [n, d] = tok.split(':');
      const dur = +d || 1;
      if (n !== 'r') notes.push({ at, m: midi(n), dur });
      at += dur;
    });
    return notes;
  }
  // Kiểu đệm bằng sáo trầm, mỗi nốt: [vị trí trong ô nhịp, quãng so với nốt trầm, độ dài, độ to]
  // (vị trí và độ dài tính bằng nốt móc đơn; một ô nhịp = 8)
  const ACC = {
    arp: [[0, 12, 8, 0.06], [4, 19, 4, 0.035]],
    slow: [[0, 12, 8, 0.06]],
    pulse: [[0, 12, 1.5, 0.06], [2, 19, 1, 0.035], [4, 12, 1.5, 0.06], [6, 19, 1, 0.035]],
    ost: [[0, 12, 0.8, 0.055], [1, 12, 0.8, 0.04], [2, 24, 0.8, 0.04], [3, 12, 0.8, 0.04],
      [4, 19, 0.8, 0.055], [5, 12, 0.8, 0.04], [6, 24, 0.8, 0.04], [7, 19, 0.8, 0.04]],
  };
  function buildSong(S) {
    const ev = [];
    let at = 0;
    const add = (pos, fn) => ev.push({ at: pos, fn });
    // Một ô nhịp đệm: sáo trầm thổi nhỏ theo nốt trầm của ô nhịp (ô cuối bài ngân dài gấp đôi)
    function accBar(pos, root, last) {
      const r = midi(root);
      ACC[S.acc].forEach(([k, off, len, vol]) => add(pos + k, (t, d, o) => flute(o, t, r + off, d * (last && k === 0 ? 16 : len) * 0.95, vol)));
    }
    S.form.forEach(([sec, inst, shift]) => {
      if (sec === 'I' || sec === 'O') {
        const root = S.A.bass.split(' ')[0];
        accBar(at, root); accBar(at + 8, root, sec === 'O');
        at += 16;
        return;
      }
      const P = S[sec], base = at;
      parseMel(P.mel).forEach(n => {
        const m = n.m + (shift || 0);
        add(base + n.at, (t, d, o) => flute(o, t, m, n.dur * d * 0.96, 0.16));
      });
      P.bass.split(' ').forEach((root, k) => accBar(base + k * 8, root));
      at += 64;
    });
    ev.sort((a, b) => a.at - b.at);
    return { ev, len: at };
  }
  const songCache = {};
  const song = id => songCache[id] || (songCache[id] = buildSong(SONGS[id]));

  /* ---------- Phát nhạc nền ---------- */
  function start(id) {
    const S = SONGS[id], sg = song(id);
    const bus = ctx.createGain();
    bus.gain.setValueAtTime(0.0001, ctx.currentTime);
    bus.gain.exponentialRampToValueAtTime(1, ctx.currentTime + 1.5);
    bus.connect(musicBus);
    cur = { id, S, sg, bus, d: 60 / S.bpm / 2, base: ctx.currentTime + 0.15, i: 0 };
    clearInterval(timer);
    timer = setInterval(tick, 50);
  }
  function stop() {
    if (!cur) return;
    clearInterval(timer); timer = null;
    const { bus } = cur;
    bus.gain.cancelScheduledValues(ctx.currentTime);
    bus.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.35);
    setTimeout(() => bus.disconnect(), 3000);
    cur = null;
  }
  function tick() {
    if (!cur) return;
    const now = ctx.currentTime, { sg, d } = cur;
    for (;;) {
      if (cur.i >= sg.ev.length) { cur.base += sg.len * d; cur.i = 0; }
      const e = sg.ev[cur.i], t = cur.base + e.at * d;
      if (t > now + 0.3) break;
      if (t >= now - 0.05) e.fn(t, d, cur.bus);   // nốt đã lỡ (tab bị ẩn lâu) thì bỏ qua
      cur.i++;
    }
  }
  function music(id) {
    wanted = id && SONGS[id] ? id : null;
    if (!ready() || !opts.music) return;
    if (cur && cur.id === wanted) return;
    stop();
    if (wanted) start(wanted);
  }

  /* ---------- Tiếng động ---------- */
  function sweep(t, dur, dst, type, f0, f1, q) {
    const fl = noise(t, dur, dst, type, f0, q);
    fl.frequency.exponentialRampToValueAtTime(f1, t + dur * 0.9);
    return fl;
  }
  function boom(t, vol, f0, f1, len) {
    osc('sine', f0, t, t + len + 0.1, env(sfxBus, t, 0.004, vol, len)).frequency.exponentialRampToValueAtTime(f1, t + len * 0.8);
  }
  function ring(t, freqs, vol, len, p) {
    const dst = p == null ? sfxBus : panner(sfxBus, p).node;
    freqs.forEach((f, i) => osc('sine', f, t, t + len + 0.1, env(dst, t, 0.002, vol / (i * 0.6 + 1), len / (i * 0.4 + 1))));
  }
  const SFX = {
    click: t => wood(sfxBus, t, 0.12, 1200),
    step: t => noise(t, 0.12, env(sfxBus, t, 0.01, 0.15, 0.1), 'lowpass', 700),
    // Quyền cước: tiếng "bốp" chắc nịch
    hit: t => {
      noise(t, 0.03, env(sfxBus, t, 0.001, 0.6, 0.025), 'highpass', 2500);
      boom(t, 0.9, 170, 55, 0.16);
      noise(t, 0.12, env(sfxBus, t, 0.002, 0.4, 0.1), 'lowpass', 900);
    },
    // Côn bổng: vụt gió rồi "cốp" gỗ
    heavy: t => {
      sweep(t, 0.2, env(sfxBus, t, 0.08, 0.3, 0.1), 'bandpass', 400, 2200, 1.5);
      const h = t + 0.17;
      osc('sine', 640, h, h + 0.12, env(sfxBus, h, 0.001, 0.6, 0.09)).frequency.exponentialRampToValueAtTime(470, h + 0.08);
      osc('sine', 1310, h, h + 0.08, env(sfxBus, h, 0.001, 0.25, 0.05));
      noise(h, 0.07, env(sfxBus, h, 0.001, 0.4, 0.05), 'bandpass', 1500, 4);
      boom(h, 0.7, 130, 48, 0.22);
    },
    // Kiếm: lướt gió rồi "keng" kim loại ngân dài
    slash: t => {
      const p = panner(sfxBus, -0.5);
      if (p.pan) p.pan.linearRampToValueAtTime(0.5, t + 0.15);
      sweep(t, 0.16, env(p.node, t, 0.02, 0.5, 0.12), 'bandpass', 1500, 7500, 2);
      const h = t + 0.1;
      ring(h, [2093 * rnd(0.98, 1.02), 3136, 4186, 5274, 6645], 0.09, 0.8, 0.3);
      noise(h, 0.3, env(sfxBus, h, 0.002, 0.25, 0.25), 'highpass', 6500);
    },
    slash3: t => [0, 0.13, 0.26].forEach((x, k) => {
      const h = t + x;
      sweep(h, 0.12, env(sfxBus, h, 0.01, 0.4, 0.1), 'bandpass', 1800, 8000, 2);
      ring(h + 0.07, [2349 * (1 + k * 0.12), 3520 * (1 + k * 0.12), 4699], 0.07, 0.5, k - 1);
    }),
    // Chưởng: gió tụ lực rồi nổ trầm
    palm: t => {
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.02, t); g.gain.exponentialRampToValueAtTime(0.45, t + 0.25); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.32);
      g.connect(sfxBus);
      sweep(t, 0.32, g, 'lowpass', 250, 2200);
      const h = t + 0.26;
      boom(h, 1, 95, 32, 0.75);
      noise(h, 0.7, env(sfxBus, h, 0.005, 0.55, 0.6), 'lowpass', 320);
      noise(h, 0.2, env(sfxBus, h, 0.002, 0.3, 0.15), 'bandpass', 900);
    },
    // Hàng Long: rồng gầm rồi nổ lớn
    dragon: t => {
      const g = env(sfxBus, t, 0.15, 0.32, 0.9);
      const am = ctx.createGain(); am.gain.value = 0.6; am.connect(g);
      const lfo = ctx.createOscillator(); lfo.frequency.value = 27;
      const lg = ctx.createGain(); lg.gain.value = 0.4; lfo.connect(lg); lg.connect(am.gain);
      lfo.start(t); lfo.stop(t + 1.2);
      const fm = ctx.createBiquadFilter(); fm.type = 'bandpass'; fm.Q.value = 3;
      fm.frequency.setValueAtTime(400, t); fm.frequency.linearRampToValueAtTime(950, t + 0.4); fm.frequency.linearRampToValueAtTime(500, t + 1);
      fm.connect(am);
      osc('sawtooth', 88, t, t + 1.1, fm).frequency.exponentialRampToValueAtTime(58, t + 1);
      osc('sawtooth', 131, t, t + 1.1, fm).frequency.exponentialRampToValueAtTime(87, t + 1);
      SFX.palm(t + 0.55);
    },
    // Phật chưởng: chuông vàng, dàn hợp xướng, tiếng nổ
    buddha: t => {
      bell(sfxBus, t, 196, 0.25, 3);
      [392, 494, 587, 784].forEach(f => {
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.045, t + 0.3); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.8);
        g.connect(sfxBus); osc('sine', f, t, t + 1.9, g);
      });
      boom(t + 0.3, 0.7, 90, 35, 0.6);
    },
    // Thái Cực: gió xoáy hai chiều, cồng nhẹ
    swirl: t => {
      [[-1, 1, 400, 2400], [1, -1, 2400, 400]].forEach(([p0, p1, f0, f1]) => {
        const p = panner(sfxBus, p0);
        if (p.pan) p.pan.linearRampToValueAtTime(p1, t + 0.6);
        sweep(t, 0.65, env(p.node, t, 0.2, 0.3, 0.45), 'bandpass', f0, f1, 2);
      });
      bell(sfxBus, t + 0.35, 147, 0.16, 2.2);
    },
    // Băng tuyết: leng keng pha lê, tiếng nứt lách tách
    ice: t => {
      for (let k = 0; k < 6; k++) ring(t + rnd(0, 0.3), [rnd(2000, 4500)], 0.07, 0.7, rnd(-0.8, 0.8));
      for (let k = 0; k < 10; k++) { const h = t + rnd(0, 0.28); noise(h, 0.02, env(sfxBus, h, 0.001, 0.3, 0.015), 'highpass', 4000); }
    },
    // Độc: xì xèo, sủi bọt, ọc ọc
    poison: t => {
      noise(t, 0.7, env(sfxBus, t, 0.05, 0.16, 0.6), 'highpass', 4500);
      for (let k = 0; k < 7; k++) {
        const h = t + rnd(0, 0.55), f = rnd(280, 750);
        osc('sine', f, h, h + 0.08, env(sfxBus, h, 0.004, 0.2, 0.06)).frequency.exponentialRampToValueAtTime(f * 1.9, h + 0.06);
      }
      const o = osc('sine', 85, t, t + 0.6, env(sfxBus, t, 0.05, 0.3, 0.5));
      const lfo = ctx.createOscillator(); lfo.frequency.value = 9;
      const lg = ctx.createGain(); lg.gain.value = 25; lfo.connect(lg); lg.connect(o.frequency); lfo.start(t); lfo.stop(t + 0.6);
    },
    // Hồi phục: chuỗi chuông lấp lánh đi lên
    heal: t => {
      [76, 79, 81, 83, 86, 88].forEach((m, k) => ring(t + k * 0.07, [hz(m), hz(m) * 2.01], 0.06, 1.1, (k % 2 ? 0.3 : -0.3)));
      [1760, 2217, 2637].forEach(f => {
        const g = env(sfxBus, t + 0.2, 0.2, 0.025, 0.9);
        const am = ctx.createGain(); am.gain.value = 0.5; am.connect(g);
        const lfo = ctx.createOscillator(); lfo.frequency.value = 8; const lg = ctx.createGain(); lg.gain.value = 0.5;
        lfo.connect(lg); lg.connect(am.gain); lfo.start(t); lfo.stop(t + 1.4);
        osc('sine', f, t + 0.2, t + 1.4, am);
      });
    },
    // Hộ thể (Kim Chung Tráo): chuông đồng lớn "boong"
    bell: t => { bell(sfxBus, t, 110, 0.4, 4); bell(sfxBus, t, 220, 0.12, 2.5); ring(t + 0.1, [1320, 1760], 0.03, 1.5); },
    // Tăng lực: trống dồn, khí lực dâng lên
    power: t => {
      [0, 0.14, 0.25, 0.33, 0.39].forEach(x => drum(sfxBus, t + x, 0.4, true));
      const g = ctx.createGain(); g.gain.setValueAtTime(0.02, t); g.gain.exponentialRampToValueAtTime(0.2, t + 0.42); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(300, t); lp.frequency.exponentialRampToValueAtTime(2500, t + 0.42);
      lp.connect(g); g.connect(sfxBus);
      osc('sawtooth', 80, t, t + 0.5, lp).frequency.exponentialRampToValueAtTime(240, t + 0.42);
      drum(sfxBus, t + 0.45, 0.9);
      bell(sfxBus, t + 0.45, 330, 0.08, 1.2);
    },
    // Khinh công: vút gió lướt từ trái sang phải
    whoosh: t => {
      const p = panner(sfxBus, -0.8);
      if (p.pan) p.pan.linearRampToValueAtTime(0.8, t + 0.45);
      const fl = noise(t, 0.5, env(p.node, t, 0.15, 0.4, 0.32), 'bandpass', 600, 1.5);
      fl.frequency.exponentialRampToValueAtTime(3000, t + 0.22);
      fl.frequency.exponentialRampToValueAtTime(900, t + 0.48);
    },
    miss: t => sweep(t, 0.16, env(sfxBus, t, 0.03, 0.22, 0.12), 'bandpass', 1200, 3200, 2),
    // Choáng: chim kêu quay vòng quanh đầu
    stun: t => {
      for (let k = 0; k < 6; k++) chirp(sfxBus, t + k * 0.15, k % 2 ? 0.7 : -0.7);
      const o = osc('sine', 600, t, t + 1, env(sfxBus, t, 0.05, 0.08, 0.9));
      const lfo = ctx.createOscillator(); lfo.frequency.value = 7;
      const lg = ctx.createGain(); lg.gain.value = 60; lfo.connect(lg); lg.connect(o.frequency); lfo.start(t); lfo.stop(t + 1);
    },
    // Bạo kích: nổ chát chúa, ngân sáng
    crit: t => {
      noise(t, 0.04, env(sfxBus, t, 0.001, 0.7, 0.035), 'highpass', 3000);
      boom(t, 0.9, 75, 33, 0.45);
      ring(t + 0.02, [1318, 1976, 2637], 0.12, 0.9);
    },
    coin: t => { ring(t, [1318, 3300], 0.07, 0.4); ring(t + 0.08, [1760, 4400], 0.07, 0.6); },
    gong: t => bell(sfxBus, t, 98, 0.4, 4.5),
  };
  // Đoạn nhạc ngắn thổi bằng sáo: danh sách [nốt, lúc bắt đầu (giây), độ dài (giây)]
  const tune = (t, notes) => notes.forEach(([n, at, len]) => flute(sfxBus, t + at, midi(n), len, 0.2));
  const JINGLES = {
    win: t => tune(t, [['D5', 0, 0.16], ['E5', 0.16, 0.16], ['F#5', 0.32, 0.16], ['A5', 0.48, 0.3], ['F#5', 0.8, 0.16], ['A5', 0.96, 1.1]]),
    lose: t => tune(t, [['E5', 0, 0.5], ['D5', 0.5, 0.5], ['C5', 1, 0.5], ['A4', 1.5, 1.4]]),
    levelup: t => tune(t, [['G4', 0, 0.12], ['A4', 0.12, 0.12], ['B4', 0.24, 0.12], ['D5', 0.36, 0.12], ['E5', 0.48, 0.12], ['G5', 0.6, 0.9]]),
    quest: t => tune(t, [['D5', 0, 0.22], ['A5', 0.22, 0.9]]),
    boss: t => { SFX.gong(t); drum(sfxBus, t + 0.4, 0.8); drum(sfxBus, t + 0.7, 0.8); drum(sfxBus, t + 0.85, 0.6, true); drum(sfxBus, t + 1, 0.9); },
  };
  function sfx(name) {
    if (!opts.sfx || !ready() || !SFX[name]) return;
    SFX[name](ctx.currentTime + 0.01);
  }
  function jingle(name) {
    if (!opts.sfx || !ready() || !JINGLES[name]) return;
    JINGLES[name](ctx.currentTime + 0.02);
  }
  // Từng loại tiếng trong nhạc nền, phát riêng để người chơi chỉ ra tiếng nào khó nghe
  const DEMOS = {
    fluteShort: ['Sáo chính, nốt ngắn', t => ['A4', 'B4', 'D5', 'E5', 'D5', 'B4'].forEach((n, k) => flute(musicBus, t + k * 0.3, midi(n), 0.28, 0.16))],
    fluteLong: ['Sáo chính, nốt dài', t => ['D5', 'A4', 'B4'].forEach((n, k) => flute(musicBus, t + k * 1.3, midi(n), 1.2, 0.16))],
    fluteHigh: ['Sáo chính, nốt cao', t => ['A5', 'B5', 'C#6', 'B5', 'A5'].forEach((n, k) => flute(musicBus, t + k * 0.4, midi(n), 0.38, 0.16))],
    accLong: ['Sáo trầm đệm ngân dài', t => ['D3', 'B2', 'A2'].forEach((n, k) => { flute(musicBus, t + k * 1.6, midi(n) + 12, 1.5, 0.06); flute(musicBus, t + k * 1.6 + 0.8, midi(n) + 19, 0.75, 0.035); })],
    accPulse: ['Sáo trầm đệm ngắt nhịp (trấn thành)', t => ACC.pulse.concat(ACC.pulse.map(([k, ...r]) => [k + 8, ...r])).forEach(([k, off, len, vol]) => flute(musicBus, t + k * 0.29, midi('D3') + off, len * 0.29 * 0.95, vol))],
    accOst: ['Sáo trầm thổi nảy (nhạc trận)', t => ACC.ost.concat(ACC.ost.map(([k, ...r]) => [k + 8, ...r])).forEach(([k, off, len, vol]) => flute(musicBus, t + k * 0.21, midi('A2') + off, len * 0.21 * 0.95, vol))],
  };
  function demo(name) {
    if (!ready() || !DEMOS[name]) return;
    DEMOS[name][1](ctx.currentTime + 0.02);
  }
  function hit(kind, crit) {
    sfx(SND_KIND[kind] || 'hit');
    if (crit) sfx('crit');
  }
  function themeFor(bg, type) {
    return SND_BG_THEMES[bg] || (type === 'town' ? 'town' : 'wild');
  }
  function set(o) {
    Object.assign(opts, o);
    try { localStorage.setItem(KEY, JSON.stringify(opts)); } catch (e) { /* không lưu được thì thôi */ }
    applyVol();
    if (!opts.music) stop();
    else if (wanted && ready() && !cur) start(wanted);
  }
  // Độ dài một vòng bài nhạc (giây), tính thẳng từ bản nhạc không cần máy âm thanh
  function songSeconds(id) {
    const S = SONGS[id];
    const eighths = S.form.reduce((a, f) => a + (f[0] === 'I' || f[0] === 'O' ? 16 : 64), 0);
    return Math.round(eighths * 30 / S.bpm);
  }

  return {
    music, sfx, jingle, hit, themeFor, set, demo,
    demos: () => Object.keys(DEMOS).map(id => ({ id, name: DEMOS[id][0] })),
    get: () => Object.assign({}, opts),
    playing: () => (cur ? cur.id : null),
    themes: () => Object.keys(SONGS).map(id => ({ id, name: SONGS[id].name, secs: songSeconds(id) })),
    sounds: () => Object.keys(SFX),
    jingles: () => Object.keys(JINGLES),
  };
})();
