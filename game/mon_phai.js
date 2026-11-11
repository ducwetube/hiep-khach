/* =====================================================================
   THANH VÂN MÔN — BÁI SƯ (người dùng chốt 2026-11-05, theo cốt truyện chương 3)
   - 3 đường võ: Kiếm (Lạc Kiếm Nhất), Chưởng (Phổ Trí Đại Sư), Côn (Vương Lâm); ô đường võ ở thẻ Thanh Vân Môn (ban_do.js VUNG_PATHS).
   - Điều kiện: Vô Danh Quyền tầng 10 (2026-11-07; trước đó cần cả Vô Danh Tâm Pháp). Chưa đủ thì trưởng lão chê võ công quá yếu.
   - Chỉ bái được 1 đường; đã đăng ký thi đường nào thì hai đường kia từ chối.
   - Thi: lên lôi đài thắng lần lượt 9 sư huynh đệ (mỗi trận hồi đầy trước khi đánh; thua thì đánh lại đúng trận đó; trận 9 là Đại sư huynh, mạnh như Tinh Anh).
   - Xong: thành Đệ tử ngoại môn của đường đó (P.tv.rank = 1), sư phụ truyền võ học nhập môn (TV.teach; mới có đường Chưởng).
   P.tv = { path, step: 2 | null, n, rank } (rank 0 = tạp vụ, 1 = ngoại môn)
   ===================================================================== */
const TV = {
  duels: 9, req: ['vo_danh_quyen'], reqLv: 10, // 2026-11-07 người dùng chốt: chỉ cần Vô Danh Quyền tầng 10
  // 9 sư huynh đệ cùng dự tuyển (mượn hình đạo bào trắng viền lam của Võ Đang cho giống áo Thanh Vân)
  rivals: [['Sư đệ Tiểu Hổ', 'm'], ['Sư huynh Lý Mộc', 'm'], ['Sư tỷ Thanh Liên', 'f'], ['Sư huynh Triệu Phong', 'm'], ['Sư muội Bạch Vân', 'f'],
    ['Sư huynh Tôn Thạch', 'm'], ['Sư tỷ Lãnh Nguyệt', 'f'], ['Sư huynh Hàn Sơn', 'm'], ['Đại sư huynh Mộ Thanh', 'm']],
  move: { kiem: 'Thanh Vân Kiếm Quyết', chuong: 'Thanh Vân Chưởng', con: 'Thanh Vân Côn Pháp' },
  // Võ học sư phụ truyền ngay khi đỗ ngoại môn (bước 5 cốt truyện chương 3; người dùng chốt 2026-11-05). Kiếm, Côn chưa có.
  teach: { chuong: { noi: 'truong_sinh_quyet', bo: 'tp_khong_tuong', line: 'Phổ Trí Đại Sư cười hiền, đặt tay lên vai ngươi: "Chưởng mạnh nhất là chưởng không cần đánh ra. Nhẫn được, mới bộc phát được."' } },
};
// Truyền võ học nhập môn của đường đã đỗ (chưa có thì truyền; gọi khi đỗ và khi mở hộp thoại đường võ để bù bản lưu cũ)
function tvTeach() {
  const t = P.tv, T = t && t.rank >= 1 && TV.teach[t.path];
  if (!T) return [];
  if (typeof gangSwap === 'function') gangSwap(); // đường Chưởng: kiếm đổi thành găng
  const out = [];
  [T.noi, T.bo].forEach(id => {
    if (!id || !SKILLS[id] || P.skills[id]) return;
    const sk = SKILLS[id], worn = sk.bo ? (giveBo(sk.bo), true) : giveSkill(id); // đỗ ngoại môn: truyền trọn bộ (người dùng chốt 2026-11-06)
    out.push(sk.bo ? `Được truyền trọn bộ <b>${BO_VO[sk.bo].name}</b> (5 chiêu, đã mang vào ô Chiêu thức).`
      : `Được truyền nội công <b>${sk.name}</b>${worn ? ' (đã mang)' : '. Vào Võ học mang nó thay nội công đang dùng'}.`);
  });
  if (out.length) { out.unshift(T.line); out.forEach(x => log(`[[vo_hoc]] ${x}`)); fixHpMp(); saveGame(true); }
  return out;
}
function tvState() {
  if (!P.tv) P.tv = { path: null, step: null, n: 0, rank: 0 };
  if (P.tv.step === 1) Object.assign(P.tv, { step: 2, n: 0 }); // bỏ vòng 1 (2026-11-05): bản lưu đang ở vòng 1 lên thẳng lôi đài
  return P.tv;
}
const tvPathName = k => (typeof VUNG_PATHS !== 'undefined' && VUNG_PATHS[k] ? VUNG_PATHS[k].name : k);
const tvReady = () => TV.req.every(id => P.skills[id] && P.skills[id].lv >= TV.reqLv);
// Danh xưng hiện ở thanh nhân vật (sectName trong engine)
const tvTitle = () => (P && P.tv && P.tv.rank >= 1 ? `Đệ tử ${RANK_NAME[Math.min(P.tv.rank, RANK_NAME.length - 1)]} · ${tvPathName(P.tv.path)}` : '');
// Hộp thoại khi bấm ô đường võ
function tvDialog(k) {
  const W = VUNG_PATHS[k], t = tvState();
  // Người nói: trưởng lão của đường (chê võ yếu, khi đã là đệ tử) / trưởng lão khảo hạch (nhận đơn, chấm hai vòng thi, như cốt truyện)
  let text, btns = '', who = `${W.head} · Đường ${W.name}`;
  const exam = `Trưởng lão khảo hạch · Thi tuyển đường ${W.name}`;
  if (t.path && t.path !== k) {
    text = t.rank >= 1 ? `Ngươi đã là đệ tử đường ${tvPathName(t.path)} rồi. Một thân không thể thờ hai thầy.`
      : `Ngươi đang thi vào đường ${tvPathName(t.path)}, còn tới đây làm gì?`;
  } else if (t.rank >= 1) {
    const taught = [...tvTeach(), ...nmTeach(), ...taTeach(), ...(t.rank >= 4 ? teachSet(CHAN_TRUYEN.teach[t.path]) : [])]; // bản lưu đỗ trước khi có võ học nhập môn / Thượng thừa: truyền bù
    text = `Ngươi đã là đệ tử ${RANK_NAME[Math.min(t.rank, RANK_NAME.length - 1)]} đường ${W.name}. Chăm chỉ tu luyện, đừng làm mất mặt sư môn.${taught.length ? `<br>${taught.join('<br>')}` : ''}`;  } else if (!t.path) {
    if (!tvReady()) {
      const prog = TV.req.map(id => `${SKILLS[id].name} tầng ${P.skills[id] ? P.skills[id].lv : 0}/${TV.reqLv}`).join(' · ');
      text = `Võ công ngươi quá yếu, chưa đủ điều kiện làm đệ tử của ta.<br><span class="muted">Cần ${TV.req.map(id => SKILLS[id].name).join(' và ')} đạt tầng ${TV.reqLv}. Hiện: ${prog}.</span>`;
    } else {
      who = exam;
      text = `Muốn vào ngoại môn đường ${W.name} thì lên lôi đài, thắng lần lượt ${TV.duels} sư huynh đệ cùng dự tuyển.<br><span class="muted">Mỗi người chỉ được thi một đường.</span>`;
      btns = `<button class="btn primary" onclick="G.tvTake('${k}')">Ghi tên thi đường ${W.name}</button>`;
    }
  } else if (t.step === 2) {
    who = exam;
    const r = TV.rivals[t.n];
    text = `Lôi đài: đã thắng <b>${t.n} / ${TV.duels}</b> trận. Đối thủ kế tiếp: <b>${r[0]}</b>.`;
    btns = `<button class="btn primary" onclick="G.tvDuel()">Lên lôi đài (trận ${t.n + 1} / ${TV.duels})</button>`;
  }
  openModal(`<div class="dlg"><div class="dlg-portrait"><img src="game/img/icon/${W.icon}.png" alt="" style="width:100%;height:100%;object-fit:contain"></div>
    <div class="dlg-body"><div class="dlg-name">${who}</div><div class="dlg-text">${text}</div></div></div>
    ${btns ? `<div class="row-btns">${btns}</div>` : ''}${t.rank >= 1 && t.path === k ? nmSection() + taSection() + ctSection() + smSection() : ''}`);
}
function tvTake(k) {
  const t = tvState();
  if (t.path || !tvReady()) return;
  Object.assign(t, { path: k, step: 2, n: 0 }); // 2026-11-05 người dùng bỏ vòng 1 (diệt 30 Đệ Tử Thất Sát): ghi tên là lên lôi đài
  log(`[[nhiem_vu]] Đăng ký thi tuyển đệ tử ngoại môn đường <b>${tvPathName(k)}</b>: lên lôi đài thắng ${TV.duels} sư huynh đệ.`);
  saveGame(true);
  reopen(() => tvDialog(k));
  renderWorld();
}
// Một trận lôi đài: đối thủ dựng như quái cùng cấp nhân vật, mạnh dần; trận cuối như Tinh Anh
function tvDuel() {
  const t = tvState();
  if (t.step !== 2 || t.n >= TV.duels || (combat && !combat.over)) return;
  closeModalSilent();
  const i = t.n, [name, g] = TV.rivals[i], last = i === TV.duels - 1;
  const lv = Math.max(1, P.lv - 1 + Math.floor(i / 3));
  const m = { id: 'loi_dai', city: TG_MAPS[0].city, mobs: [[name, { sect: 'vo_dang', title: g }, 'bal']],
    boss: { name, art: { sect: 'vo_dang', title: g }, move: { name: TV.move[t.path] || 'Thanh Vân Kiếm Quyết', power: 1.8 } } };
  const E = tgMake(m, last ? -1 : 0, lv, last);
  E.skills = tgArm(E);
  if (last) E.skills.unshift(Object.assign({ type: 'attack', chance: 30, mp: 0 }, m.boss.move));
  E.drops = [];
  startCombat(E, {
    story: true, noFlee: true, stageText: `Lôi đài · trận ${i + 1} / ${TV.duels}`,
    intro: last ? `${name} bước lên lôi đài, cả sân luyện võ lặng ngắt.` : `${name} chắp tay: "Mời sư đệ chỉ giáo!"`,
    onEnd: res => {
      if (res !== 'win') return { lines: [`Ngươi bị ${name} đẩy văng khỏi lôi đài. Nghỉ ngơi rồi lên đấu lại trận ${i + 1}.`], btn: 'Về sơn môn', after: renderWorld };
      t.n++;
      if (t.n < TV.duels) {
        saveGame(true);
        return { lines: [`Ngươi thắng ${name}! Đã thắng ${t.n} / ${TV.duels} trận.`], btn: `Trận ${t.n + 1}: ${TV.rivals[t.n][0]}`, after: tvDuel };
      }
      Object.assign(t, { step: null, rank: 1 });
      snd('jingle', 'quest');
      log(`[[nhiem_vu]] Thắng cả ${TV.duels} trận, trở thành <b>Đệ tử ngoại môn</b> đường <b>${tvPathName(t.path)}</b> của Thanh Vân Môn!`);
      const taught = tvTeach();
      saveGame(true);
      return { lines: [`Đến trận thứ chín, cả sân lặng ngắt: đứa chẻ củi ngày nào vẫn đứng đó, còn ${name} đã bị đẩy ra khỏi lôi đài.`,
        `Từ hôm nay ngươi là <b>Đệ tử ngoại môn</b> đường <b>${tvPathName(t.path)}</b> của Thanh Vân Môn.`, ...taught], btn: 'Về sơn môn', after: renderWorld };
    },
  });
}
/* ---------- Khảo hạch đệ tử NỘI MÔN (người dùng chốt 2026-11-07, theo cốt truyện chương 4) ----------
   Điều kiện: cấp 30; nội công nhập môn + chiêu đánh 2 của bộ võ nhập môn của đường mình (TV.teach) đạt tầng tối đa;
   kỷ lục Trấn Ma Tháp tầng 30. Đủ thì lên lôi đài thắng 9 đệ tử ngoại môn cùng dự tuyển (P.tv.nm = số trận đã thắng).
   Đỗ: P.tv.rank = 2 (đệ tử nội môn). Võ học Thượng Thừa của nội môn chưa có (chờ người dùng thiết kế).
   Đối thủ (Claude đặt, người dùng chưa duyệt): cấp = cấp nhân vật, cứ 3 trận +1 cấp; khí huyết / công / thủ × NOI_MON.grow
   (mạnh hơn lôi đài ngoại môn vì họ đã luyện thành võ học nhập môn); trận 9 là Đại sư huynh ngoại môn, mạnh như Tinh Anh. */
const NOI_MON = {
  lv: 30, thap: 30, duels: 9, grow: 1.25,
  // Võ học Thượng thừa sư phụ truyền khi đỗ nội môn (người dùng chốt 2026-11-07). Kiếm, Côn chưa có.
  // Khác lúc đỗ ngoại môn: chỉ dạy (tầng 1), KHÔNG tự mang thay Tâm Phật / Trường Sinh đang luyện cao; người chơi tự vào Võ học đổi.
  teach: { chuong: { noi: 'hang_long_quyet', bo: 'hang_long', line: 'Phổ Trí Đại Sư trao cuốn chưởng phổ bìa vàng: "Hàng Long chưởng lấy cương phá cương. Nhớ kỹ: chưởng mạnh là để giữ người, không phải để giết người."' } },
  rivals: [['Sư huynh Cao Viễn', 'm', 'kiem'], ['Sư tỷ Liễu Yên', 'f', 'chuong'], ['Sư huynh Đỗ Thiết', 'm', 'con'], ['Sư muội Tô Tuyết', 'f', 'kiem'],
    ['Sư huynh Khúc Phong', 'm', 'chuong'], ['Sư tỷ Diệp Lam', 'f', 'con'], ['Sư huynh Mạc Hàn', 'm', 'kiem'], ['Sư huynh Tần Lãng', 'm', 'con'],
    ['Đại sư huynh Hoắc Vân Đình', 'm', 'chuong']],
};
// Hai môn võ phải đạt tầng tối đa: nội công nhập môn + chiêu đánh 2 của bộ võ nhập môn (đường chưa có võ học thì trả rỗng)
function nmSkills(path) {
  const T = TV.teach[path];
  if (!T) return [];
  const bo = T.bo && SKILLS[T.bo] && SKILLS[T.bo].bo, d2 = bo && BO_VO[bo] && BO_VO[bo].roles.danh2;
  return [T.noi, d2].filter(id => id && SKILLS[id]);
}
// Danh sách điều kiện [chữ, đạt chưa]
function nmConds() {
  const t = P.tv, ids = nmSkills(t.path), lvOf = id => (P.skills[id] ? P.skills[id].lv : 0);
  const best = P.thap ? P.thap.best || 0 : 0;
  const out = [[`Cấp ${NOI_MON.lv} (hiện ${P.lv})`, P.lv >= NOI_MON.lv]];
  if (!ids.length) out.push(['Võ học nhập môn của đường này chưa có', false]);
  ids.forEach(id => out.push([`${SKILLS[id].name} tầng ${skMax(id)} (hiện ${lvOf(id)})`, lvOf(id) >= skMax(id)]));
  out.push([`Trấn Ma Tháp tầng ${NOI_MON.thap} (kỷ lục ${best})`, best >= NOI_MON.thap]);
  return out;
}
const nmReady = () => nmConds().every(c => c[1]);
// Truyền võ học Thượng thừa của đường mình khi đỗ nội môn (gọi lúc đỗ và khi mở hộp thoại đường võ để bù bản lưu)
function nmTeach() {
  const t = P.tv;
  return teachSet(t && t.rank >= 2 && NOI_MON.teach[t.path]);
}
// Truyền một bộ võ (chỉ tầng 1, không tự thay chiêu đang mang) + nội công (mang nếu còn chỗ); dùng chung cho nội môn và tinh anh
function teachSet(T) {
  if (!T) return [];
  const out = [];
  if (T.bo && BO_VO[T.bo]) {
    const ids = Object.values(BO_VO[T.bo].roles).filter(id => SKILLS[id] && !P.skills[id]);
    ids.forEach(id => { P.skills[id] = { lv: 1, xp: 0 }; });
    if (ids.length) out.push(`Được truyền trọn bộ <b>${BO_VO[T.bo].name}</b>. Vào Võ học, bấm từng ô Chiêu thức để mang chiêu mới.`);
  }
  if (T.noi && SKILLS[T.noi] && !P.skills[T.noi]) {
    const worn = giveSkill(T.noi);
    out.push(`Được truyền nội công <b>${SKILLS[T.noi].name}</b>${worn ? ' (đã mang)' : '. Vào Võ học mang nó thay nội công đang dùng'}.`);
  }
  if (out.length) { out.unshift(T.line); out.forEach(x => log(`[[vo_hoc]] ${x}`)); fixHpMp(); saveGame(true); }
  return out;
}
// Phần khảo hạch nội môn trong hộp thoại đường võ (đệ tử ngoại môn của đường đó)
function nmSection() {
  const t = P.tv;
  if (!t || t.rank !== 1) return '';
  const n = t.nm || 0, ok = nmReady();
  const conds = nmConds().map(([s, d]) => `<div class="nm-c${d ? ' ok' : ''}">${d ? '✦' : '·'} ${s}</div>`).join('');
  const btn = ok ? `<div class="row-btns"><button class="btn primary" onclick="G.nmDuel()">Lên lôi đài (trận ${n + 1} / ${NOI_MON.duels}): ${NOI_MON.rivals[n][0]}</button></div>` : '';
  return `<div class="sm-box"><div class="sm-h">[[muc_tieu]] Khảo hạch nội môn${n ? ` <b>${n} / ${NOI_MON.duels}</b>` : ''}</div>${conds}${btn}</div>`;
}
// Một trận khảo hạch nội môn
function nmDuel() {
  const t = tvState(), i = t.nm || 0;
  if (t.rank !== 1 || i >= NOI_MON.duels || !nmReady() || (combat && !combat.over)) return;
  closeModalSilent();
  const [name, g, path] = NOI_MON.rivals[i], last = i === NOI_MON.duels - 1;
  const lv = P.lv + Math.floor(i / 3);
  const m = { id: 'noi_mon', city: TG_MAPS[0].city, mobs: [[name, { sect: 'vo_dang', title: g }, 'bal']],
    boss: { name, art: { sect: 'vo_dang', title: g }, move: { name: TV.move[path] || 'Thanh Vân Kiếm Quyết', power: 2.0 } } };
  const E = tgMake(m, last ? -1 : 0, lv, last);
  ['hp', 'atk', 'def'].forEach(k => { E[k] = Math.round(E[k] * NOI_MON.grow); });
  E.skills = tgArm(E);
  E.skills.unshift(Object.assign({ type: 'attack', chance: last ? 35 : 20, mp: 0 }, m.boss.move));
  E.drops = [];
  startCombat(E, {
    story: true, noFlee: true, stageText: `Khảo hạch nội môn · trận ${i + 1} / ${NOI_MON.duels}`,
    intro: last ? `${name} chậm rãi bước lên lôi đài. Cả sân luyện võ đứng dậy.` : `${name} ôm quyền: "Đắc tội rồi, sư đệ!"`,
    onEnd: res => {
      if (res !== 'win') return { lines: [`${name} đánh ngươi văng khỏi lôi đài. Nghỉ ngơi rồi lên đấu lại trận ${i + 1}.`], btn: 'Về sơn môn', after: renderWorld };
      t.nm = i + 1;
      if (t.nm < NOI_MON.duels) {
        saveGame(true);
        return { lines: [`Ngươi thắng ${name}! Đã thắng ${t.nm} / ${NOI_MON.duels} trận.`], btn: `Trận ${t.nm + 1}: ${NOI_MON.rivals[t.nm][0]}`, after: nmDuel };
      }
      t.rank = 2;
      delete t.nm;
      snd('jingle', 'quest');
      log(`[[nhiem_vu]] Thắng cả ${NOI_MON.duels} trận, trở thành <b>Đệ tử nội môn</b> đường <b>${tvPathName(t.path)}</b> của Thanh Vân Môn!`);
      const taught = nmTeach();
      saveGame(true);
      return { lines: [`Người còn đứng trên lôi đài sau trận thứ chín vẫn là ngươi.`,
        `Từ hôm nay ngươi là <b>Đệ tử nội môn</b> đường <b>${tvPathName(t.path)}</b> của Thanh Vân Môn, được bước vào Tàng Kinh Các.`, ...taught], btn: 'Về sơn môn', after: renderWorld };
    },
  });
}
/* ---------- Khảo hạch đệ tử TINH ANH (người dùng chốt 2026-11-08, theo cốt truyện chương 5) ----------
   Điều kiện: cấp 60; nội công Thượng thừa + chiêu đánh 2 của bộ võ Thượng thừa của đường mình (NOI_MON.teach) đạt tầng tối đa;
   kỷ lục Trấn Ma Tháp tầng 60; đã vượt qua Cấm địa Trường Sinh Đường (cờ TINH_ANH.flag — cấm địa chưa làm, làm ngay sau).
   Đủ cả 4 thì bấm nhận phong (không có lôi đài: người dùng chỉ ra 4 điều kiện). Đỗ: P.tv.rank = 3.
   Võ học Tuyệt Học của tinh anh chưa có (chờ người dùng thiết kế). */
const TINH_ANH = { lv: 60, thap: 60, flag: 'cam_dia_truong_sinh', flagText: 'Vượt qua Cấm địa Trường Sinh Đường',
  // Võ học Tuyệt học sư phụ truyền khi lên tinh anh (người dùng chốt 2026-11-09: bộ Như Lai Thần Chưởng + Dịch Cân Kinh (mã cuu_duong_than_cong) cho đường Chưởng).
  // Nội công Tuyệt học (người dùng chốt 2026-11-09): Dịch Cân Kinh (trước là Cửu Dương Thần Công), làm lại 100 tầng
  teach: { chuong: { noi: 'cuu_duong_than_cong', bo: 'nhu_lai', line: 'Phổ Trí Đại Sư lấy từ trong tay áo ra một cuốn kinh đã ngả vàng: "Như Lai Thần Chưởng không dạy người đánh mạnh hơn, mà dạy người đứng vững hơn. Ai còn đứng, người đó còn che chở được kẻ khác."' } } };
// Truyền võ học Tuyệt học khi lên tinh anh (gọi lúc phong và khi mở hộp thoại đường võ để bù bản lưu)
function taTeach() {
  const t = P.tv;
  return teachSet(t && t.rank >= 3 && TINH_ANH.teach[t.path]);
}
const RANK_NAME = ['', 'ngoại môn', 'nội môn', 'tinh anh'];
// Hai môn phải đạt tầng tối đa: nội công Thượng thừa + chiêu đánh 2 của bộ võ Thượng thừa (đường chưa có thì trả rỗng)
function taSkills(path) {
  const T = NOI_MON.teach[path], B = T && BO_VO[T.bo];
  if (!T) return [];
  return [T.noi, B && B.roles.danh2].filter(id => id && SKILLS[id]);
}
function taConds() {
  const t = P.tv, ids = taSkills(t.path), lvOf = id => (P.skills[id] ? P.skills[id].lv : 0);
  const best = P.thap ? P.thap.best || 0 : 0;
  const out = [[`Cấp ${TINH_ANH.lv} (hiện ${P.lv})`, P.lv >= TINH_ANH.lv]];
  if (!ids.length) out.push(['Võ học Thượng thừa của đường này chưa có', false]);
  ids.forEach(id => out.push([`${SKILLS[id].name} tầng ${skMax(id)} (hiện ${lvOf(id)})`, lvOf(id) >= skMax(id)]));
  out.push([`Trấn Ma Tháp tầng ${TINH_ANH.thap} (kỷ lục ${best})`, best >= TINH_ANH.thap]);
  out.push([TINH_ANH.flagText, !!(P.flags && P.flags[TINH_ANH.flag])]);
  return out;
}
const taReady = () => taConds().every(c => c[1]);
// Phần khảo hạch tinh anh trong hộp thoại đường võ (đệ tử nội môn của đường đó)
function taSection() {
  const t = P.tv;
  if (!t || t.rank !== 2) return '';
  const ok = taReady();
  const conds = taConds().map(([s, d]) => `<div class="nm-c${d ? ' ok' : ''}">${d ? '✦' : '·'} ${s}</div>`).join('');
  const btn = ok ? `<div class="row-btns"><button class="btn primary" onclick="G.taPromote()">Nhận phong Đệ tử tinh anh</button></div>` : '';
  return `<div class="sm-box"><div class="sm-h">[[muc_tieu]] Khảo hạch tinh anh</div>${conds}${btn}</div>`;
}
function taPromote() {
  const t = tvState();
  if (t.rank !== 2 || !taReady()) return;
  t.rank = 3;
  snd('jingle', 'quest');
  log(`[[nhiem_vu]] Trở thành <b>Đệ tử tinh anh</b> đường <b>${tvPathName(t.path)}</b> của Thanh Vân Môn!`);
  const taught = taTeach();
  saveGame(true);
  renderTop();
  reopen(() => tvDialog(t.path));
  renderWorld();
  toast(`[[nhiem_vu]] Ngươi đã là <b>Đệ tử tinh anh</b> đường ${tvPathName(t.path)}!${taught.length ? '<br>' + taught.slice(1).join('<br>') : ''}`);
}
/* ---------- Khảo hạch đệ tử CHÂN TRUYỀN (người dùng chốt 2026-11-09, theo cốt truyện chương 6) ----------
   Điều kiện: cấp 90; nội công Tuyệt học + chiêu đánh 2 của bộ võ Tuyệt học của đường mình (TINH_ANH.teach) đạt tầng tối đa;
   kỷ lục Trấn Ma Tháp tầng 90; vượt Cấm Địa Vạn Độc Môn và Cấm Địa Hợp Hoan Phái (CAM_DIA trong thi_luyen.js).
   Đủ thì nhận phong, P.tv.rank = 4. Võ học Trấn Phái của chân truyền chưa có (teach rỗng). */
const CHAN_TRUYEN = { lv: 90, thap: 90,
  flags: [['cam_dia_van_doc', 'Vượt qua Cấm Địa Vạn Độc Môn'], ['cam_dia_hop_hoan', 'Vượt qua Cấm Địa Hợp Hoan Phái']],
  // Võ học Trấn Phái (người dùng chốt 2026-11-09): đường Chưởng nhận bộ Đại Nhật Thần Chưởng + Cửu Dương Thần Công (mã cuu_duong_tp)
  teach: { chuong: { noi: 'cuu_duong_tp', bo: 'dai_nhat', line: 'Phổ Trí Đại Sư dẫn ngươi vào thạch thất sau Tàng Kinh Các, trên vách khắc chín vầng mặt trời: "Cửu Dương thuần dương chí cương. Chưởng này đánh ra là lửa, lửa không phân thiện ác, chỉ người cầm chưởng mới phân. Nhớ lấy."' } } };
RANK_NAME.push('chân truyền');
function ctConds() {
  const t = P.tv, T = TINH_ANH.teach[t.path], B = T && BO_VO[T.bo], lvOf = id => (P.skills[id] ? P.skills[id].lv : 0);
  const ids = T ? [T.noi, B && B.roles.danh2].filter(id => id && SKILLS[id]) : [];
  const best = P.thap ? P.thap.best || 0 : 0;
  const out = [[`Cấp ${CHAN_TRUYEN.lv} (hiện ${P.lv})`, P.lv >= CHAN_TRUYEN.lv]];
  if (!ids.length) out.push(['Võ học Tuyệt học của đường này chưa có', false]);
  ids.forEach(id => out.push([`${SKILLS[id].name} tầng ${skMax(id)} (hiện ${lvOf(id)})`, lvOf(id) >= skMax(id)]));
  out.push([`Trấn Ma Tháp tầng ${CHAN_TRUYEN.thap} (kỷ lục ${best})`, best >= CHAN_TRUYEN.thap]);
  CHAN_TRUYEN.flags.forEach(([f, s]) => out.push([s, !!(P.flags && P.flags[f])]));
  return out;
}
const ctReady = () => ctConds().every(c => c[1]);
function ctSection() {
  const t = P.tv;
  if (!t || t.rank !== 3) return '';
  const conds = ctConds().map(([s, d]) => `<div class="nm-c${d ? ' ok' : ''}">${d ? '✦' : '·'} ${s}</div>`).join('');
  const btn = ctReady() ? `<div class="row-btns"><button class="btn primary" onclick="G.ctPromote()">Nhận phong Đệ tử chân truyền</button></div>` : '';
  return `<div class="sm-box"><div class="sm-h">[[muc_tieu]] Khảo hạch chân truyền</div>${conds}${btn}</div>`;
}
function ctPromote() {
  const t = tvState();
  if (t.rank !== 3 || !ctReady()) return;
  t.rank = 4;
  snd('jingle', 'quest');
  log(`[[nhiem_vu]] Trở thành <b>Đệ tử chân truyền</b> đường <b>${tvPathName(t.path)}</b> của Thanh Vân Môn!`);
  const taught = teachSet(CHAN_TRUYEN.teach[t.path]);
  saveGame(true);
  renderTop();
  reopen(() => tvDialog(t.path));
  renderWorld();
  toast(`[[nhiem_vu]] Ngươi đã là <b>Đệ tử chân truyền</b> đường ${tvPathName(t.path)}!${taught.length ? '<br>' + taught.slice(1).join('<br>') : ''}`);
}
// Dòng nhiệm vụ trong menu Nhiệm vụ
function tvQuestRows() {
  const t = P.tv;
  if (t && t.rank === 3) { // đệ tử tinh anh: khảo hạch chân truyền
    const c = ctConds(), done = c.filter(x => x[1]).length, ok = done === c.length;
    return `<div class="quest">
      <div class="q-name">[[muc_tieu]] Khảo hạch chân truyền · ${tvPathName(t.path)}</div>
      <div class="q-sum">${ok ? 'Đủ điều kiện, về Thanh Vân Môn (bấm ô đường võ) nhận phong.' : c.filter(x => !x[1]).map(x => x[0]).join(' · ')}</div>
      <div class="q-prog ${ok ? 'ready' : ''}">Điều kiện: ${done} / ${c.length}</div>
    </div>`;
  }
  if (t && t.rank === 2) { // đệ tử nội môn: khảo hạch tinh anh
    const c = taConds(), done = c.filter(x => x[1]).length, ok = done === c.length;
    return `<div class="quest">
      <div class="q-name">[[muc_tieu]] Khảo hạch tinh anh · ${tvPathName(t.path)}</div>
      <div class="q-sum">${ok ? 'Đủ điều kiện, về Thanh Vân Môn (bấm ô đường võ) nhận phong.' : c.filter(x => !x[1]).map(x => x[0]).join(' · ')}</div>
      <div class="q-prog ${ok ? 'ready' : ''}">Điều kiện: ${done} / ${c.length}</div>
    </div>`;
  }
  if (t && t.rank === 1) { // đệ tử ngoại môn: khảo hạch nội môn
    const done = nmConds().filter(c => c[1]).length, all = nmConds().length, ok = done === all;
    return `<div class="quest">
      <div class="q-name">[[muc_tieu]] Khảo hạch nội môn · ${tvPathName(t.path)}</div>
      <div class="q-sum">${ok ? 'Đủ điều kiện, về Thanh Vân Môn (bấm ô đường võ) lên lôi đài.' : nmConds().filter(c => !c[1]).map(c => c[0]).join(' · ')}</div>
      <div class="q-prog ${ok ? 'ready' : ''}">${ok ? `Lôi đài: ${t.nm || 0} / ${NOI_MON.duels}` : `Điều kiện: ${done} / ${all}`}</div>
    </div>`;
  }
  if (!t || !t.step) return '';
  return `<div class="quest">
      <div class="q-name">[[nhiem_vu]] Thi tuyển ngoại môn · ${tvPathName(t.path)}</div>
      <div class="q-sum">Lên lôi đài ở Thanh Vân Môn (bấm ô đường võ).</div>
      <div class="q-prog">Thắng sư huynh đệ trên lôi đài: ${t.n} / ${TV.duels}</div>
    </div>`;
}

/* =====================================================================
   NHIỆM VỤ SƯ MÔN HẰNG NGÀY (người dùng chốt 2026-11-07)
   - Chỉ đệ tử ngoại môn (P.tv.rank >= 1) mới nhận; trưởng lão đường võ của mình giao (bấm ô đường võ ở thẻ Thanh Vân).
   - Mỗi ngày (ngày thật) tối đa SU_MON.perDay vòng. Mỗi vòng: diệt SU_MON.need con của MỘT loại quái ngẫu nhiên ở map hợp cấp.
   - Đủ số thì về Thanh Vân nộp: kinh nghiệm + bạc = SU_MON.mobs con quái thường cùng cấp nhân vật. Không có thưởng thêm khi đủ 15 vòng
     (người dùng bỏ). Tự động luyện công làm được (tu_dong.js: cfg.sm).
   P.sm = { day, done, q: {e, map, need, n} | null }. Qua ngày: số vòng về 0, vòng đang làm dở vẫn giữ.
   ===================================================================== */
const SU_MON = { perDay: 15, need: 15, mobs: 50, herb: 2 }; // herb: Tuyết Liên mỗi vòng nộp (người dùng chốt 2026-11-11)
const smDay = () => { const d = new Date(); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; };
function smState() {
  if (!P.sm) P.sm = { day: smDay(), done: 0, q: null };
  if (P.sm.day !== smDay()) Object.assign(P.sm, { day: smDay(), done: 0 });
  return P.sm;
}
const smOpen = () => !!(P && P.tv && P.tv.rank >= 1 && typeof mapForLevel === 'function');
const smExp = () => withBonus(TG.mob.exp(P.lv) * SU_MON.mobs);
const smGold = () => TG.mob.gold(P.lv) * SU_MON.mobs;
const smIsReady = () => { const q = P && P.sm && P.sm.q; return !!q && q.n >= q.need; };
const smGoal = loc => { const q = P && P.sm && P.sm.q; return !!q && q.n < q.need && q.map === loc; };
const mpMapName = id => (LOCATIONS[id] ? LOCATIONS[id].name : (MAPS[id] && MAPS[id].name) || id);
const smText = q => `Diệt <b>${q.need}</b> <b>${ENEMIES[q.e].name}</b> ở <b>${mpMapName(q.map)}</b> · ${Math.min(q.n, q.need)} / ${q.need}`;
function smNew() {
  const map = mapForLevel(P.lv), M = MAPS[map];
  const pool = ((M && M.enemies) || []).filter(e => ENEMIES[e] && e !== M.boss);
  return pool.length ? { e: pool[rand(0, pool.length - 1)], map, need: SU_MON.need, n: 0 } : null;
}
// Engine gọi trong onKill
function smOnKill(enemyId) {
  const q = P.sm && P.sm.q;
  if (!q || q.e !== enemyId || q.n >= q.need) return [];
  q.n++;
  return [`[[nhiem_vu]] Sư môn: ${ENEMIES[q.e].name} ${q.n} / ${q.need}${q.n >= q.need ? ' — <b>Đã xong!</b> Về Thanh Vân Môn bẩm báo sư phụ.' : ''}`];
}
// quiet: tự động luyện công gọi, không mở hộp thoại
function smTake(quiet) {
  const st = smState();
  if (!smOpen() || st.q || st.done >= SU_MON.perDay) return false;
  const q = smNew();
  if (!q) return false;
  st.q = q;
  log(`[[nhiem_vu]] Nhận nhiệm vụ sư môn (vòng ${st.done + 1} / ${SU_MON.perDay}): ${smText(q)}.`);
  saveGame(true);
  if (!quiet) { reopen(() => tvDialog(P.tv.path)); renderWorld(); }
  return true;
}
function smTurnIn(quiet) {
  const st = smState(), q = st.q;
  if (!q || q.n < q.need || P.loc !== 'duong_chau') return false;
  const exp = smExp(), gold = smGold();
  st.q = null;
  st.done++;
  P.gold += gold;
  if (SU_MON.herb) addItem('tuyet_lien_km', SU_MON.herb);
  const lines = [`[[nhiem_vu]] Xong nhiệm vụ sư môn vòng ${st.done} / ${SU_MON.perDay}: +${exp.toLocaleString('vi-VN')} kinh nghiệm, +${gold.toLocaleString('vi-VN')} lượng${SU_MON.herb ? `, +${SU_MON.herb} Tuyết Liên` : ''}`, ...gainExp(exp)];
  log(lines.join(' · '));
  snd('jingle', 'quest');
  saveGame(true);
  if (quiet) return true;
  toast(lines[0]);
  reopen(() => tvDialog(P.tv.path));
  renderWorld();
  return true;
}
// Phần nhiệm vụ sư môn trong hộp thoại đường võ của mình (tvDialog)
function smSection() {
  if (!smOpen()) return '';
  const st = smState(), q = st.q;
  let line, btn = '';
  if (q && q.n >= q.need) { line = `Vòng ${st.done + 1}: đã xong, bẩm báo để nhận thưởng.`; btn = `<button class="btn primary" onclick="G.smTurnIn()">Bẩm báo · nhận thưởng</button>`; }
  else if (q) line = `Vòng ${st.done + 1}: ${smText(q)}.`;
  else if (st.done >= SU_MON.perDay) line = 'Hôm nay đã xong mọi việc, mai quay lại.';
  else { line = `Vòng ${st.done + 1} / ${SU_MON.perDay}.`; btn = `<button class="btn primary" onclick="G.smTake()">Nhận nhiệm vụ</button>`; }
  if (q || st.done < SU_MON.perDay) btn += `<button class="btn" onclick="G.smAuto()">[[tu_dong]] Tự động làm</button>`;
  return `<div class="sm-box"><div class="sm-h">[[nhiem_vu]] Nhiệm vụ sư môn <b>${st.done} / ${SU_MON.perDay}</b></div>
    <div class="sm-l">${line}</div>
    <div class="sm-rw">[[kinh_nghiem]] ${smExp().toLocaleString('vi-VN')} <span>[[bac]] ${smGold().toLocaleString('vi-VN')}</span>${SU_MON.herb ? ` <span>[[tuyet_lien_km]] ${SU_MON.herb}</span>` : ''}</div>
    ${btn ? `<div class="row-btns">${btn}</div>` : ''}</div>`;
}
// Phụ đề ô đường võ của mình ở thẻ Thanh Vân
const smSub = () => { const st = smState(); return smIsReady() ? 'Về bẩm báo sư phụ' : st.q ? `Sư môn ${st.q.n}/${st.q.need}` : `Sư môn ${st.done}/${SU_MON.perDay}`; };
// Bật tự động làm nhiệm vụ sư môn (tu_dong.js)
function smAuto() {
  if (typeof autoCfg !== 'function') return;
  const c = autoCfg();
  c.sm = true;
  autoSave(c);
  autoStart();
}
// Dòng trong menu Nhiệm vụ + dòng trong thẻ ngọn núi
function smQuestRows() {
  if (!smOpen()) return '';
  const st = smState(), q = st.q;
  if (!q && st.done >= SU_MON.perDay) return '';
  return `<div class="quest">
      <div class="q-name">[[nhiem_vu]] Nhiệm vụ sư môn · vòng ${st.done + 1} / ${SU_MON.perDay}</div>
      <div class="q-sum">${q ? (q.n >= q.need ? 'Đã xong, về Thanh Vân Môn bẩm báo sư phụ.' : 'Sư phụ giao việc trừ hại.') : 'Về Thanh Vân Môn gặp sư phụ nhận việc.'}</div>
      <div class="q-rw"><b>Thưởng:</b> [[kinh_nghiem]] ${smExp().toLocaleString('vi-VN')} · [[bac]] ${smGold().toLocaleString('vi-VN')}${SU_MON.herb ? ` · [[tuyet_lien_km]] ${SU_MON.herb}` : ''}</div>
      ${q ? `<div class="q-prog ${q.n >= q.need ? 'ready' : ''}">${smText(q)}</div>` : ''}
    </div>`;
}
const smHereLine = loc => (smGoal(loc) ? `<div class="vg-quest">[[muc_tieu]] Sư môn: diệt ${ENEMIES[P.sm.q.e].name} ${P.sm.q.n} / ${P.sm.q.need}</div>` : '');

const MON_PHAI_G = { tvTake, tvDuel, nmDuel, taPromote, ctPromote, smTake: () => smTake(), smTurnIn: () => smTurnIn(), smAuto };
