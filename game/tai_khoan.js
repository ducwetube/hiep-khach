/* =====================================================================
   TÀI KHOẢN — đăng nhập Google + lưu nhân vật lên Firebase (bản GitHub Pages, 2026-11-12)
   - Chỉ chạy ngoài claude.ai (trên claude.ai game lưu bằng tài khoản claude.ai như cũ) và không chạy khi mở tệp trên máy (file://).
   - Dự án Firebase "hiep-khach" (gói Spark miễn phí) của người dùng. Đoạn cấu hình dưới đây được phép công khai;
     dữ liệu được bảo vệ bằng quy tắc Firestore: users/{uid}/... chỉ chính tài khoản đó đọc / ghi.
   - Nhân vật lưu ở users/<uid>/saves/save | save_s2 | save_s3 ({game: chuỗi JSON, savedAt}), cùng cách với bản claude.ai
     (engine: cloudAttach / bindCloud / pushCloud; bản mới hơn thắng).
   - Thư viện Firebase bản "compat" nạp từ gstatic.com khi cần, không cần cài đặt gì.
   ===================================================================== */
const FB_CONFIG = {
  apiKey: 'AIzaSyC7GdGG_e7F2_aUGSAi-z-2I9tH-OkQXFo',
  authDomain: 'hiep-khach-c730b.firebaseapp.com',
  projectId: 'hiep-khach-c730b',
  storageBucket: 'hiep-khach-c730b.firebasestorage.app',
  messagingSenderId: '58307814385',
  appId: '1:58307814385:web:d7e296811d49583d70da50',
};
const FB_SDK = 'https://www.gstatic.com/firebasejs/10.12.2/';
const fb = { on: false, ready: false, user: null, busy: false, err: '' };

const fbUserName = () => (fb.user ? fb.user.displayName || fb.user.email || 'Tài khoản Google' : '');
function fbScript(src) {
  return new Promise((ok, fail) => {
    const s = document.createElement('script');
    s.src = src; s.onload = ok; s.onerror = () => fail(new Error('load ' + src));
    document.head.appendChild(s);
  });
}
async function fbInit() {
  if (fb.on || location.protocol === 'file:') return;
  fb.on = true;
  try {
    for (const f of ['firebase-app-compat.js', 'firebase-auth-compat.js', 'firebase-firestore-compat.js']) await fbScript(FB_SDK + f);
    firebase.initializeApp(FB_CONFIG);
    fb.ready = true;
    firebase.auth().onAuthStateChanged(async u => {
      fb.user = u || null;
      fb.busy = false;
      if (u) {
        cloud.state = 'loading';
        fbRefresh();
        try { await cloudAttach(firebase.firestore().collection('users/' + u.uid + '/saves'), u.uid); }
        catch (e) { cloud.state = 'error'; }
      } else cloudDetach();
      fbRefresh();
    });
  } catch (e) {
    fb.err = 'Không tải được phần đăng nhập (kiểm tra mạng).';
  }
  fbRefresh();
}
async function fbLogin() {
  if (!fb.ready || fb.busy) return;
  fb.busy = true; fb.err = ''; fbRefresh();
  const prov = new firebase.auth.GoogleAuthProvider();
  prov.setCustomParameters({ prompt: 'select_account' });
  try {
    await firebase.auth().signInWithPopup(prov);
  } catch (e) {
    fb.busy = false;
    if (e && (e.code === 'auth/popup-blocked' || e.code === 'auth/operation-not-supported-in-environment')) {
      try { await firebase.auth().signInWithRedirect(prov); return; } catch (e2) { e = e2; }
    }
    if (!(e && (e.code === 'auth/popup-closed-by-user' || e.code === 'auth/cancelled-popup-request'))) fb.err = 'Đăng nhập chưa được, hãy thử lại.';
    fbRefresh();
  }
}
function fbLogout() {
  if (!fb.ready || P) return;
  firebase.auth().signOut();
}
// Dòng tài khoản trong khung nhân vật ở màn vào game (heroCard trong engine)
function fbLine() {
  if (!fb.on) return '';
  let body;
  if (fb.err && !fb.user) body = `<span class="fb-st warn">${fb.err}</span>${fb.ready ? '<button class="fb-btn" onclick="G.fbLogin()">Thử lại</button>' : ''}`;
  else if (!fb.ready || fb.busy) body = '<span class="fb-st">Đang kết nối…</span>';
  else if (fb.user) body = `<span class="fb-st on">${cloud.state === 'loading' ? 'Đang tải nhân vật…' : `Lưu trên mạng: <b>${esc(fbUserName())}</b>`}</span><button class="fb-link" onclick="G.fbLogout()">Đăng xuất</button>`;
  else body = '<button class="fb-btn" onclick="G.fbLogin()"><i class="fb-g">G</i>Đăng nhập Google để lưu nhân vật</button><span class="fb-st">Chưa đăng nhập: chỉ lưu trên máy này</span>';
  return `<div class="fb-line" id="fb-line">${body}</div>`;
}
function fbRefresh() {
  const box = document.getElementById('fb-line');
  if (box) box.outerHTML = fbLine();
  else if (typeof refreshTitle === 'function') refreshTitle();
}
const TAI_KHOAN_G = { fbLogin, fbLogout };
