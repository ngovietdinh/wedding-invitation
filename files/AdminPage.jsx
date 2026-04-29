// ============================================================
// ADMIN PAGE — React + Supabase
// Quản lý toàn bộ nội dung thiệp cưới
// Route: /admin  (thêm vào App.jsx)
// ============================================================

import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

const SB_URL = import.meta.env.VITE_SUPABASE_URL;
const SB_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const sb = SB_URL && SB_KEY ? createClient(SB_URL, SB_KEY) : null;
const ADMIN_PASS = import.meta.env.VITE_ADMIN_PASS || "wedding2026";

// ── Chuyển Google Drive link → ảnh hiển thị ──
function gdrive(url) {
  if (!url || url.trim() === "") return "";
  const m =
    url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/) ||
    url.match(/id=([a-zA-Z0-9_-]+)/);
  if (m) return `https://lh3.googleusercontent.com/d/${m[1]}`;
  return url;
}

// ── Global styles admin ──
const AdminStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@300;400;500;600;700&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #f0f5f0; color: #1e2e1e; font-family: 'Quicksand', sans-serif; -webkit-font-smoothing: antialiased; }

    .inp, .ta, .sel {
      width: 100%; padding: .65rem .85rem;
      border: 1.5px solid #c8dec8; border-radius: 6px;
      background: #fff; color: #1e2e1e;
      font-family: 'Quicksand', sans-serif; font-weight: 400; font-size: .88rem;
      outline: none; transition: border-color .22s;
    }
    .inp:focus, .ta:focus, .sel:focus { border-color: #4a7a4a; }
    .ta { resize: vertical; min-height: 72px; }
    .inp::placeholder, .ta::placeholder { color: #9ab09a; }

    .btn-p { padding: .68rem 1.4rem; border-radius: 7px; cursor: pointer; font-family: 'Quicksand', sans-serif; font-weight: 600; font-size: .8rem; border: none; transition: all .22s; background: linear-gradient(135deg,#2a4a2a,#5c8a5c); color: #fff; }
    .btn-p:hover { opacity: .9; }
    .btn-p:disabled { opacity: .5; cursor: not-allowed; }
    .btn-o { padding: .65rem 1.3rem; border-radius: 7px; cursor: pointer; font-family: 'Quicksand', sans-serif; font-weight: 600; font-size: .78rem; background: transparent; color: #4a7a4a; border: 1.5px solid #c0d8c0; transition: all .22s; }
    .btn-o:hover { background: #eef7ee; }
    .btn-d { padding: .65rem 1.3rem; border-radius: 7px; cursor: pointer; font-family: 'Quicksand', sans-serif; font-weight: 600; font-size: .78rem; background: #dc2626; color: #fff; border: none; transition: all .22s; }
    .btn-d:hover { background: #b91c1c; }
    .btn-g { padding: .65rem 1.3rem; border-radius: 7px; cursor: pointer; font-family: 'Quicksand', sans-serif; font-weight: 600; font-size: .78rem; background: #16a34a; color: #fff; border: none; transition: all .22s; }
    .btn-g:hover { background: #15803d; }

    .card { background: #fff; border: 1px solid #d8e8d8; border-radius: 12px; padding: 1.4rem; margin-bottom: 1.1rem; }
    .card-t { font-size: .9rem; font-weight: 700; color: #2a4a2a; margin-bottom: 1rem; padding-bottom: .55rem; border-bottom: 1px solid #eaf0ea; display: flex; align-items: center; gap: .5rem; }
    .field { margin-bottom: 1rem; }
    .field label { display: block; font-size: .68rem; font-weight: 700; color: #6a8a6a; letter-spacing: .14em; text-transform: uppercase; margin-bottom: .38rem; }
    .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: .8rem; }
    @media(max-width:500px){ .field-row{grid-template-columns:1fr;} }

    .tab-btn { padding: .72rem 1rem; border: none; background: transparent; font-family: 'Quicksand', sans-serif; font-size: .8rem; font-weight: 500; color: #6a8a6a; cursor: pointer; border-bottom: 2.5px solid transparent; transition: all .2s; white-space: nowrap; }
    .tab-btn.on { color: #2a4a2a; border-bottom-color: #4a7a4a; font-weight: 700; }

    .stats { display: grid; grid-template-columns: repeat(4,1fr); gap: .7rem; margin-bottom: 1rem; }
    .stat { background: #fff; border: 1px solid #d8e8d8; border-radius: 10px; padding: 1rem .8rem; text-align: center; }
    .stat-n { font-size: 1.8rem; font-weight: 300; color: #3a6a3a; line-height: 1; }
    .stat-l { font-size: .58rem; letter-spacing: .2em; text-transform: uppercase; color: #8a9a7a; margin-top: .3rem; }
    @media(max-width:400px){ .stats{grid-template-columns:repeat(2,1fr);} }

    .rsvp-row { display: grid; grid-template-columns: 1fr auto auto; gap: .5rem; align-items: center; padding: .72rem .5rem; border-bottom: 1px solid #eaf0ea; }
    .rsvp-row:last-child { border-bottom: none; }
    .badge { padding: .18rem .55rem; border-radius: 99px; font-size: .62rem; font-weight: 600; }
    .badge-y { background: #dcfce7; color: #166534; }
    .badge-n { background: #fee2e2; color: #991b1b; }

    .gal-grid { display: grid; grid-template-columns: repeat(auto-fill,minmax(120px,1fr)); gap: .7rem; margin-top: .8rem; }
    .gal-item { position: relative; border-radius: 7px; overflow: hidden; border: 1px solid #d8e8d8; background: #f0f5f0; }
    .gal-item img { width: 100%; aspect-ratio: 1; object-fit: cover; display: block; }
    .gal-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0); display: flex; align-items: flex-end; padding: .35rem; transition: background .22s; }
    .gal-item:hover .gal-overlay { background: rgba(0,0,0,.45); }
    .gal-acts { display: flex; gap: .3rem; opacity: 0; transition: opacity .22s; width: 100%; }
    .gal-item:hover .gal-acts { opacity: 1; }
    .gal-btn { flex: 1; padding: .28rem; border: none; border-radius: 4px; font-size: .65rem; font-weight: 700; cursor: pointer; font-family: 'Quicksand', sans-serif; }

    .drop-zone { border: 2px dashed #b8d8b8; border-radius: 10px; padding: 1.5rem; text-align: center; cursor: pointer; transition: all .22s; background: #fafcfa; }
    .drop-zone:hover, .drop-zone.over { border-color: #4a7a4a; background: #f0f7f0; }
    .drop-zone input { display: none; }

    .img-slot { border: 1px solid #d8e8d8; border-radius: 8px; overflow: hidden; background: #f7faf7; }
    .img-slot .preview { width: 100%; aspect-ratio: 3/2; object-fit: cover; display: block; background: #e8f0e8; }
    .img-slot-info { padding: .65rem; }
    .img-slot-lbl { font-size: .65rem; font-weight: 700; color: #6a8a6a; letter-spacing: .12em; text-transform: uppercase; margin-bottom: .4rem; }

    .photos-grid { display: grid; grid-template-columns: repeat(auto-fill,minmax(170px,1fr)); gap: 1rem; }

    #toast { position: fixed; bottom: 1.2rem; right: 1.2rem; z-index: 9999; padding: .7rem 1.1rem; border-radius: 9px; font-size: .82rem; font-weight: 600; max-width: 270px; box-shadow: 0 4px 16px rgba(0,0,0,.15); transform: translateY(20px); opacity: 0; transition: all .28s; pointer-events: none; }
    #toast.show { transform: translateY(0); opacity: 1; }
    #toast.ok { background: #2a4a2a; color: #fff; }
    #toast.err { background: #dc2626; color: #fff; }

    .gdrive-help { background: #fef9c3; border: 1px solid #fde68a; border-radius: 8px; padding: .85rem 1rem; margin-bottom: 1rem; font-size: .75rem; color: #78350f; line-height: 1.75; }
    .gdrive-help strong { color: #92400e; }

    .img-preview-wrap { position: relative; }
    .img-preview-wrap img { width: 100%; aspect-ratio: 4/3; object-fit: cover; display: block; border-radius: 6px; border: 1px solid #d8e8d8; }
    .img-clear-btn { position: absolute; top: 4px; right: 4px; background: rgba(220,38,38,.8); color: #fff; border: none; border-radius: 4px; padding: 2px 6px; font-size: .65rem; cursor: pointer; font-family: 'Quicksand', sans-serif; font-weight: 700; }
  `}</style>
);

// ── Toast ──
function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3200); return () => clearTimeout(t); }, [onClose]);
  return <div id="toast" className={`show ${type === "error" ? "err" : "ok"}`}>{msg}</div>;
}

// ── Login page ──
function Login({ onLogin }) {
  const [pass, setPass] = useState("");
  const [err, setErr] = useState(false);
  const go = () => {
    if (pass === ADMIN_PASS) { onLogin(); sessionStorage.setItem("adm_w", "1"); }
    else { setErr(true); setTimeout(() => setErr(false), 1400); }
  };
  return (
    <div style={{ minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:"1.5rem" }}>
      <div style={{ width:"100%",maxWidth:"360px" }}>
        <div style={{ textAlign:"center",marginBottom:"1.8rem" }}>
          <div style={{ width:52,height:52,background:"#d8e8d8",borderRadius:14,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto .8rem",fontSize:"1.5rem" }}>🌿</div>
          <h1 style={{ fontSize:"1.2rem",fontWeight:700,color:"#2a4a2a" }}>Wedding Admin</h1>
          <p style={{ fontSize:".75rem",color:"#8a9a7a",marginTop:".2rem" }}>Bảo Ngân &amp; Viết Định</p>
        </div>
        <div className="card" style={{ display:"flex",flexDirection:"column",gap:".9rem" }}>
          <div className="field">
            <label>Mật khẩu</label>
            <input className="inp" type="password" value={pass} placeholder="Nhập mật khẩu..."
              style={{ borderColor: err ? "#dc2626" : undefined }}
              onChange={e => { setPass(e.target.value); setErr(false); }}
              onKeyDown={e => e.key === "Enter" && go()}/>
            {err && <p style={{ color:"#dc2626",fontSize:".72rem",marginTop:".3rem" }}>Mật khẩu không đúng</p>}
          </div>
          <button className="btn-p" onClick={go} style={{ width:"100%" }}>Đăng nhập →</button>
        </div>
        <p style={{ textAlign:"center",marginTop:"1rem",fontSize:".7rem",color:"#aaa" }}>
          Đặt mật khẩu trong .env: VITE_ADMIN_PASS=...
        </p>
        {!sb && <div style={{ marginTop:"1rem",padding:".8rem",background:"#fef2f2",border:"1px solid #fcd",borderRadius:6,fontSize:".75rem",color:"#c04040",textAlign:"center" }}>
          ⚠️ Chưa kết nối Supabase — kiểm tra .env.local
        </div>}
      </div>
    </div>
  );
}

// ── Gdrive image preview ──
function ImgPreview({ url, label, onChange }) {
  const src = gdrive(url);
  return (
    <div className="img-slot">
      {src ? (
        <div className="img-preview-wrap">
          <img src={src} alt="" onError={e => e.target.style.display="none"}/>
          <button className="img-clear-btn" onClick={() => onChange("")}>✕</button>
        </div>
      ) : (
        <div style={{ width:"100%",aspectRatio:"4/3",background:"#e8f0e8",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:".3rem" }}>
          <span style={{ fontSize:"1.4rem" }}>🖼</span>
          <span style={{ fontSize:".62rem",color:"#8a9a7a" }}>Chưa có ảnh</span>
        </div>
      )}
      <div className="img-slot-info">
        <div className="img-slot-lbl">{label}</div>
        <input className="inp" value={url} placeholder="Paste link Google Drive..."
          style={{ fontSize:".75rem" }}
          onChange={e => onChange(e.target.value)}/>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════
// MAIN ADMIN PAGE
// ══════════════════════════════════════════════
export default function AdminPage() {
  const [auth, setAuth]   = useState(() => sessionStorage.getItem("adm_w") === "1");
  const [tab, setTab]     = useState("basic");
  const [data, setData]   = useState({});
  const [saving, setSave] = useState(false);
  const [loading, setLoad]= useState(true);
  const [toast, setToast] = useState(null);
  const [rsvps, setRsvps] = useState([]);
  const [gallery, setGal] = useState([]);  // [{url, caption}]
  const [rsvpQ, setQ]     = useState("");

  const showToast = (msg, type = "ok") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500); };

  // ── Load config + RSVP ──
  useEffect(() => {
    if (!auth || !sb) { setLoad(false); return; }
    Promise.all([
      sb.from("wedding_config").select("*").eq("id", 1).single(),
      sb.from("rsvp_responses").select("*").order("created_at", { ascending: false }),
    ]).then(([cfgRes, rsvpRes]) => {
      if (cfgRes.data) {
        const d = cfgRes.data;
        setData(d);
        let gal = d.gallery;
        if (typeof gal === "string") { try { gal = JSON.parse(gal); } catch { gal = []; } }
        setGal(Array.isArray(gal) ? gal : []);
      }
      if (rsvpRes.data) setRsvps(rsvpRes.data);
      setLoad(false);
    });
  }, [auth]);

  const set = (key, val) => setData(prev => ({ ...prev, [key]: val }));

  // ── Save ──
  const save = async () => {
    if (!sb) { showToast("Chưa kết nối Supabase", "error"); return; }
    setSave(true);
    try {
      const payload = { ...data, gallery, id: 1, updated_at: new Date().toISOString() };
      const { error } = await sb.from("wedding_config").upsert(payload);
      if (error) throw error;
      showToast("✓ Đã lưu thành công!");
    } catch (e) { showToast("Lỗi: " + e.message, "error"); }
    finally { setSave(false); }
  };

  // ── Xóa RSVP ──
  const delRsvp = async (id) => {
    if (!window.confirm("Xóa phản hồi này?")) return;
    await sb.from("rsvp_responses").delete().eq("id", id);
    setRsvps(r => r.filter(x => x.id !== id));
    showToast("✓ Đã xóa");
  };

  // ── Export CSV ──
  const exportCSV = () => {
    const header = "ID,Tên,Tham dự,Số người,Lời nhắn,Thời gian\n";
    const rows = rsvps.map(r =>
      `${r.id},"${r.name}","${r.attending?"Có":"Không"}",${r.guests_count||0},"${(r.message||"").replace(/"/g,'""')}","${r.created_at}"`
    ).join("\n");
    const b = new Blob(["\uFEFF" + header + rows], { type: "text/csv;charset=utf-8" });
    const u = URL.createObjectURL(b);
    const a = document.createElement("a"); a.href = u; a.download = "rsvp.csv"; a.click();
    URL.revokeObjectURL(u);
  };

  // ── Gallery handlers ──
  const addGalleryItem = () => setGal(g => [...g, { url: "", caption: "" }]);
  const setGalItem = (i, key, val) => setGal(g => g.map((x, idx) => idx === i ? { ...x, [key]: val } : x));
  const removeGalItem = (i) => { if (window.confirm("Xóa ảnh này?")) setGal(g => g.filter((_, idx) => idx !== i)); };
  const moveGal = (i, dir) => {
    const g = [...gallery];
    const j = i + dir;
    if (j < 0 || j >= g.length) return;
    [g[i], g[j]] = [g[j], g[i]];
    setGal(g);
  };

  const filteredRsvps = rsvps.filter(r =>
    (r.name || "").toLowerCase().includes(rsvpQ.toLowerCase()) ||
    (r.message || "").toLowerCase().includes(rsvpQ.toLowerCase())
  );
  const yesCount = rsvps.filter(r => r.attending).length;
  const guestTotal = rsvps.filter(r => r.attending).reduce((s, r) => s + (r.guests_count || 1), 0);

  if (!auth) return (<><AdminStyle/><Login onLogin={() => setAuth(true)}/></>);

  // ── Các tab ──
  const TABS = [
    { id:"basic",    lbl:"👫 Cơ bản" },
    { id:"ceremony", lbl:"📅 Lịch lễ" },
    { id:"content",  lbl:"📝 Nội dung" },
    { id:"photos",   lbl:"🖼 Ảnh chính" },
    { id:"gallery",  lbl:"🎞 Gallery" },
    { id:"media",    lbl:"🎵 Media" },
    { id:"qr",       lbl:"💳 QR" },
    { id:"rsvp",     lbl:`✉️ RSVP (${rsvps.length})` },
  ];

  const F = ({ name, label, placeholder = "" }) => (
    <div className="field">
      <label>{label}</label>
      <input className="inp" value={data[name] || ""} placeholder={placeholder}
        onChange={e => set(name, e.target.value)}/>
    </div>
  );
  const TA = ({ name, label, rows = 3 }) => (
    <div className="field">
      <label>{label}</label>
      <textarea className="ta" rows={rows} value={data[name] || ""} onChange={e => set(name, e.target.value)}/>
    </div>
  );

  return (
    <>
      <AdminStyle/>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)}/>}

      {/* Header */}
      <div style={{ background:"linear-gradient(90deg,#1c3a1c,#3a6a3a)",position:"sticky",top:0,zIndex:100,padding:".8rem 1.2rem",display:"flex",alignItems:"center",justifyContent:"space-between",boxShadow:"0 2px 12px rgba(0,0,0,.2)" }}>
        <div style={{ display:"flex",alignItems:"center",gap:".7rem" }}>
          <div style={{ width:36,height:36,background:"rgba(255,255,255,.15)",borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.1rem" }}>🌿</div>
          <div>
            <p style={{ fontWeight:700,fontSize:".9rem",color:"#fff" }}>Wedding Admin</p>
            <p style={{ fontSize:".62rem",color:"rgba(255,255,255,.62)",marginTop:".05rem" }}>Bảo Ngân &amp; Viết Định · 26.04.2026</p>
          </div>
        </div>
        <div style={{ display:"flex",gap:".5rem" }}>
          <a href="/" target="_blank" style={{ textDecoration:"none" }}>
            <button style={{ padding:".45rem .85rem",borderRadius:6,background:"rgba(255,255,255,.15)",border:"none",color:"#fff",fontSize:".72rem",fontWeight:600,cursor:"pointer",fontFamily:"'Quicksand',sans-serif" }}>🌐 Xem thiệp</button>
          </a>
          <button onClick={() => { sessionStorage.removeItem("adm_w"); setAuth(false); }}
            style={{ padding:".45rem .85rem",borderRadius:6,background:"rgba(220,38,38,.7)",border:"none",color:"#fff",fontSize:".72rem",fontWeight:600,cursor:"pointer",fontFamily:"'Quicksand',sans-serif" }}>Đăng xuất</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background:"#fff",borderBottom:"1px solid #d8e8d8",display:"flex",overflowX:"auto",padding:"0 1rem",position:"sticky",top:"56px",zIndex:99 }}>
        {TABS.map(t => (
          <button key={t.id} className={`tab-btn${tab===t.id?" on":""}`} onClick={() => setTab(t.id)}>{t.lbl}</button>
        ))}
      </div>

      {/* Content */}
      <div style={{ maxWidth:700,margin:"0 auto",padding:"1.4rem 1rem 5rem" }}>
        {loading ? (
          <div style={{ textAlign:"center",padding:"3rem",color:"#8a9a7a" }}>Đang tải...</div>
        ) : !sb ? (
          <div className="card" style={{ textAlign:"center",padding:"2rem" }}>
            <p style={{ fontSize:"1.5rem",marginBottom:".5rem" }}>⚠️</p>
            <p style={{ fontSize:".85rem",color:"#c04040" }}>Chưa kết nối Supabase</p>
            <p style={{ fontSize:".75rem",color:"#8a9a7a",marginTop:".5rem" }}>Kiểm tra file .env.local — cần VITE_SUPABASE_URL và VITE_SUPABASE_ANON_KEY</p>
          </div>
        ) : (
          <>
            {/* ── TAB: CƠ BẢN ── */}
            {tab === "basic" && <>
              <div className="card">
                <div className="card-t">💍 Thông tin cặp đôi</div>
                <div className="field-row">
                  <F name="bride" label="Tên cô dâu"/>
                  <F name="groom" label="Tên chú rể"/>
                </div>
                <div className="field-row">
                  <F name="wedding_date" label="Ngày cưới" placeholder="26.04.2026"/>
                  <F name="wedding_day" label="Thứ" placeholder="Thứ Hai"/>
                </div>
                <div className="field-row">
                  <F name="wedding_time" label="Giờ cưới" placeholder="10:00 SA"/>
                  <F name="lunar_date" label="Ngày âm lịch"/>
                </div>
              </div>
              <div className="card">
                <div className="card-t">📍 Địa điểm</div>
                <F name="venue_name" label="Tên địa điểm"/>
                <F name="venue_address" label="Địa chỉ đầy đủ"/>
                <F name="venue_map_url" label="Link Google Maps" placeholder="https://maps.google.com/..."/>
              </div>
              <div className="card">
                <div className="card-t">👨‍👩‍👦 Phụ huynh</div>
                <div className="field-row">
                  <div>
                    <F name="parent_groom_label" label="Nhãn nhà trai"/>
                    <TA name="parent_groom_names" label="Tên ba mẹ chú rể" rows={2}/>
                    <F name="parent_groom_addr" label="Địa chỉ"/>
                  </div>
                  <div>
                    <F name="parent_bride_label" label="Nhãn nhà gái"/>
                    <TA name="parent_bride_names" label="Tên ba mẹ cô dâu" rows={2}/>
                    <F name="parent_bride_addr" label="Địa chỉ"/>
                  </div>
                </div>
              </div>
              <button className="btn-p" onClick={save} disabled={saving} style={{ width:"100%" }}>
                {saving ? "Đang lưu..." : "💾 Lưu thông tin cơ bản"}
              </button>
            </>}

            {/* ── TAB: LỊCH LỄ ── */}
            {tab === "ceremony" && <>
              <div className="card">
                <div className="card-t">🕐 Lễ 1</div>
                <F name="ceremony1_label" label="Tên lễ"/>
                <div className="field-row">
                  <F name="ceremony1_time" label="Thời gian" placeholder="07:30 SA - Thứ Hai"/>
                  <F name="ceremony1_date" label="Ngày" placeholder="27 . 04 . 2026"/>
                </div>
                <div className="field-row">
                  <F name="ceremony1_lunar" label="Âm lịch"/>
                  <F name="ceremony1_place" label="Nơi tổ chức"/>
                </div>
                <F name="ceremony1_addr" label="Địa chỉ"/>
              </div>
              <div className="card">
                <div className="card-t">🕙 Lễ 2</div>
                <F name="ceremony2_label" label="Tên lễ"/>
                <div className="field-row">
                  <F name="ceremony2_time" label="Thời gian" placeholder="10:00 SA - Thứ Hai"/>
                  <F name="ceremony2_date" label="Ngày" placeholder="26 . 04 . 2026"/>
                </div>
                <div className="field-row">
                  <F name="ceremony2_lunar" label="Âm lịch"/>
                  <F name="ceremony2_place" label="Nơi tổ chức"/>
                </div>
                <F name="ceremony2_addr" label="Địa chỉ"/>
              </div>
              <button className="btn-p" onClick={save} disabled={saving} style={{ width:"100%" }}>
                {saving ? "Đang lưu..." : "💾 Lưu lịch lễ"}
              </button>
            </>}

            {/* ── TAB: NỘI DUNG ── */}
            {tab === "content" && <>
              <div className="card">
                <div className="card-t">📄 Section Thư Mời</div>
                <F name="sec_invite_title" label="Tiêu đề"/>
                <F name="sec_invite_sub" label="Chú thích (IN HOA)"/>
                <TA name="sec_invite_body" label="Nội dung lời mời" rows={4}/>
              </div>
              <div className="card">
                <div className="card-t">📅 Section Lịch + Thư Mời 2</div>
                <F name="sec_cal_title" label="Tiêu đề"/>
                <F name="sec_cal_sub" label="Chú thích"/>
              </div>
              <div className="card">
                <div className="card-t">💬 Lời mong (section tối)</div>
                <TA name="mong_text" label="Nội dung (có thể xuống dòng)" rows={2}/>
              </div>
              <div className="card">
                <div className="card-t">✨ Quotes — Câu trích dẫn trên ảnh</div>
                <TA name="quote1" label="Quote 1 — Trên ảnh đôi lớn (ca dao, thơ...)" rows={3}/>
                <TA name="quote2" label="Quote 2 — Bên ảnh nhỏ trái" rows={3}/>
                <TA name="quote3" label="Quote 3 — Bên ảnh nhỏ phải" rows={3}/>
                <TA name="quote4" label="Quote 4 — Trên ảnh cặp" rows={2}/>
                <TA name="quote5" label="Quote 5 — Cuối gallery (VD: With love ♥)" rows={1}/>
              </div>
              <button className="btn-p" onClick={save} disabled={saving} style={{ width:"100%" }}>
                {saving ? "Đang lưu..." : "💾 Lưu nội dung"}
              </button>
            </>}

            {/* ── TAB: ẢNH CHÍNH ── */}
            {tab === "photos" && <>
              <div className="gdrive-help">
                <strong>📁 Cách lấy link Google Drive:</strong><br/>
                1. Upload ảnh lên Google Drive<br/>
                2. Click chuột phải → <strong>Chia sẻ</strong> → Bật "Bất kỳ ai có link"<br/>
                3. Copy link và paste vào ô bên dưới<br/>
                4. Hệ thống tự hiển thị ảnh — không cần upload lên server
              </div>
              <div className="photos-grid">
                <ImgPreview url={data.hero_img||""} label="🌟 Ảnh bìa (Hero - nền màn đầu)" onChange={v => set("hero_img", v)}/>
                <ImgPreview url={data.couple_img||""} label="👫 Ảnh đôi (section Thư Mời)" onChange={v => set("couple_img", v)}/>
                <ImgPreview url={data.photo_large||""} label="📸 Ảnh đôi lớn (gallery tối)" onChange={v => set("photo_large", v)}/>
                <ImgPreview url={data.photo_sm1||""} label="📷 Ảnh nhỏ trái (gallery)" onChange={v => set("photo_sm1", v)}/>
                <ImgPreview url={data.photo_sm2||""} label="📷 Ảnh nhỏ phải (gallery)" onChange={v => set("photo_sm2", v)}/>
                <ImgPreview url={data.photo_wide1||""} label="🏞 Ảnh ngang 1 (gallery)" onChange={v => set("photo_wide1", v)}/>
                <ImgPreview url={data.photo_wide2||""} label="🏞 Ảnh ngang 2 (gallery)" onChange={v => set("photo_wide2", v)}/>
                <ImgPreview url={data.photo_pair1||""} label="🖼 Ảnh cặp trái" onChange={v => set("photo_pair1", v)}/>
                <ImgPreview url={data.photo_pair2||""} label="🖼 Ảnh cặp phải" onChange={v => set("photo_pair2", v)}/>
                <ImgPreview url={data.photo_full||""} label="🖼 Ảnh toàn trang" onChange={v => set("photo_full", v)}/>
              </div>
              <button className="btn-p" onClick={save} disabled={saving} style={{ width:"100%",marginTop:"1rem" }}>
                {saving ? "Đang lưu..." : "💾 Lưu ảnh chính"}
              </button>
            </>}

            {/* ── TAB: GALLERY ── */}
            {tab === "gallery" && <>
              <div className="gdrive-help">
                <strong>🎞 Gallery ảnh động</strong> — hiển thị theo lưới 2 cột trong thiệp.<br/>
                Mỗi ảnh là 1 link Google Drive. Thêm caption tuỳ chọn. Dùng nút ↑↓ để sắp xếp thứ tự.
              </div>
              <div className="card">
                <div className="card-t">
                  🎞 Gallery ({gallery.length} ảnh)
                  <button className="btn-o" onClick={addGalleryItem} style={{ marginLeft:"auto",fontSize:".72rem",padding:".35rem .8rem" }}>+ Thêm ảnh</button>
                </div>
                {gallery.length === 0 ? (
                  <div style={{ textAlign:"center",padding:"2rem",color:"#8a9a7a" }}>
                    <p style={{ fontSize:"1.5rem",marginBottom:".5rem" }}>🖼</p>
                    <p style={{ fontSize:".82rem" }}>Chưa có ảnh gallery. Nhấn "+ Thêm ảnh" để bắt đầu.</p>
                  </div>
                ) : (
                  <div style={{ display:"flex",flexDirection:"column",gap:"1rem" }}>
                    {gallery.map((img, i) => (
                      <div key={i} style={{ border:"1px solid #d8e8d8",borderRadius:8,padding:".9rem",background:"#fafcfa",display:"grid",gridTemplateColumns:"auto 1fr auto",gap:".8rem",alignItems:"center" }}>
                        {/* Preview */}
                        <div style={{ width:80,height:60,borderRadius:6,overflow:"hidden",background:"#e8f0e8",flexShrink:0 }}>
                          {gdrive(img.url) ? <img src={gdrive(img.url)} alt="" style={{ width:"100%",height:"100%",objectFit:"cover" }} onError={e=>e.target.style.display="none"}/> : <div style={{ height:"100%",display:"flex",alignItems:"center",justifyContent:"center",color:"#8a9a7a",fontSize:".6rem" }}>No img</div>}
                        </div>
                        {/* Inputs */}
                        <div style={{ display:"flex",flexDirection:"column",gap:".5rem" }}>
                          <input className="inp" value={img.url} placeholder="https://drive.google.com/... (link Google Drive)"
                            style={{ fontSize:".78rem" }} onChange={e => setGalItem(i, "url", e.target.value)}/>
                          <input className="inp" value={img.caption||""} placeholder="Caption (tuỳ chọn)"
                            style={{ fontSize:".78rem" }} onChange={e => setGalItem(i, "caption", e.target.value)}/>
                        </div>
                        {/* Actions */}
                        <div style={{ display:"flex",flexDirection:"column",gap:".3rem" }}>
                          <button className="btn-o" onClick={() => moveGal(i, -1)} disabled={i===0} style={{ padding:".3rem .6rem",fontSize:".7rem" }}>↑</button>
                          <button className="btn-o" onClick={() => moveGal(i, 1)} disabled={i===gallery.length-1} style={{ padding:".3rem .6rem",fontSize:".7rem" }}>↓</button>
                          <button className="btn-d" onClick={() => removeGalItem(i)} style={{ padding:".3rem .6rem",fontSize:".7rem" }}>🗑</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button className="btn-p" onClick={save} disabled={saving} style={{ width:"100%" }}>
                {saving ? "Đang lưu..." : "💾 Lưu gallery"}
              </button>
            </>}

            {/* ── TAB: MEDIA ── */}
            {tab === "media" && <>
              <div className="card">
                <div className="card-t">🎵 Nhạc nền YouTube</div>
                <div style={{ background:"#fef9c3",border:"1px solid #fde68a",borderRadius:8,padding:".85rem",marginBottom:"1rem",fontSize:".78rem",color:"#92400e",lineHeight:1.75 }}>
                  <strong>Cách lấy link YouTube:</strong><br/>
                  Paste toàn bộ URL YouTube vào ô dưới, ví dụ:<br/>
                  <code style={{ background:"#fef3c7",padding:"1px 4px",borderRadius:3 }}>https://www.youtube.com/watch?v=dQw4w9WgXcQ</code><br/>
                  Khách nhấn nút 🌿 trên thiệp để bật/tắt nhạc.
                </div>
                <div className="field">
                  <label>Link YouTube (URL đầy đủ)</label>
                  <input className="inp" value={data.music_youtube||""} placeholder="https://www.youtube.com/watch?v=..."
                    onChange={e => set("music_youtube", e.target.value)}/>
                </div>
                {data.music_youtube && (() => {
                  const id = data.music_youtube.match(/[?&]v=([a-zA-Z0-9_-]+)/)?.[1] ||
                             data.music_youtube.match(/youtu\.be\/([a-zA-Z0-9_-]+)/)?.[1];
                  return id ? (
                    <div style={{ marginTop:".8rem" }}>
                      <p style={{ fontSize:".75rem",color:"#6a8a6a",marginBottom:".4rem" }}>Preview:</p>
                      <img src={`https://img.youtube.com/vi/${id}/mqdefault.jpg`}
                        style={{ width:"100%",maxWidth:320,borderRadius:6,border:"1px solid #d8e8d8",display:"block" }}
                        onError={e => e.target.style.display="none"}/>
                      <p style={{ fontSize:".7rem",color:"#8a9a7a",marginTop:".35rem" }}>Video ID: <strong>{id}</strong></p>
                    </div>
                  ) : null;
                })()}
              </div>
              <button className="btn-p" onClick={save} disabled={saving} style={{ width:"100%" }}>
                {saving ? "Đang lưu..." : "💾 Lưu nhạc"}
              </button>
            </>}

            {/* ── TAB: QR ── */}
            {tab === "qr" && <>
              <div className="gdrive-help">
                <strong>💳 Ảnh QR Code</strong> — Upload QR lên Google Drive, lấy link chia sẻ và paste vào ô bên dưới.<br/>
                Hệ thống tự hiển thị QR trong thiệp.
              </div>
              <div className="card">
                <div className="card-t">💳 QR Chú Rể</div>
                <div className="field-row">
                  <F name="qr_groom_bank" label="Ngân hàng"/>
                  <F name="qr_groom_num" label="Số tài khoản"/>
                </div>
                <F name="qr_groom_name" label="Tên chủ tài khoản (IN HOA)"/>
                <ImgPreview url={data.qr_groom_img||""} label="Ảnh QR Code" onChange={v => set("qr_groom_img", v)}/>
              </div>
              <div className="card">
                <div className="card-t">💳 QR Cô Dâu</div>
                <div className="field-row">
                  <F name="qr_bride_bank" label="Ngân hàng"/>
                  <F name="qr_bride_num" label="Số tài khoản"/>
                </div>
                <F name="qr_bride_name" label="Tên chủ tài khoản (IN HOA)"/>
                <ImgPreview url={data.qr_bride_img||""} label="Ảnh QR Code" onChange={v => set("qr_bride_img", v)}/>
              </div>
              <button className="btn-p" onClick={save} disabled={saving} style={{ width:"100%" }}>
                {saving ? "Đang lưu..." : "💾 Lưu QR"}
              </button>
            </>}

            {/* ── TAB: RSVP ── */}
            {tab === "rsvp" && <>
              <div className="stats">
                <div className="stat"><div className="stat-n">{rsvps.length}</div><div className="stat-l">Tổng</div></div>
                <div className="stat"><div className="stat-n">{yesCount}</div><div className="stat-l">Sẽ đến</div></div>
                <div className="stat"><div className="stat-n">{rsvps.length-yesCount}</div><div className="stat-l">Vắng</div></div>
                <div className="stat"><div className="stat-n">{guestTotal}</div><div className="stat-l">Khách</div></div>
              </div>
              <div style={{ display:"flex",gap:".6rem",marginBottom:"1rem",flexWrap:"wrap" }}>
                <input className="inp" value={rsvpQ} placeholder="🔍 Tìm kiếm tên, lời nhắn..."
                  style={{ flex:1,minWidth:150 }} onChange={e => setQ(e.target.value)}/>
                <button className="btn-g" onClick={exportCSV}>⬇ Xuất CSV</button>
                <button className="btn-o" onClick={() => {
                  sb.from("rsvp_responses").select("*").order("created_at",{ascending:false}).then(({data:r})=>{if(r)setRsvps(r);});
                }}>↻ Tải lại</button>
              </div>
              <div className="card" style={{ padding:0 }}>
                {filteredRsvps.length === 0 ? (
                  <div style={{ padding:"2rem",textAlign:"center",color:"#8a9a7a",fontSize:".85rem" }}>Chưa có phản hồi nào</div>
                ) : filteredRsvps.map(r => (
                  <div key={r.id} className="rsvp-row">
                    <div>
                      <p style={{ fontWeight:600,fontSize:".84rem",color:"#1e2e1e" }}>{r.name}</p>
                      {r.message && <p style={{ fontSize:".72rem",color:"#6a8a6a",fontStyle:"italic",marginTop:".1rem" }}>"{r.message}"</p>}
                      <p style={{ fontSize:".62rem",color:"#8a9a7a",marginTop:".15rem" }}>{r.created_at?.slice(0,16).replace("T"," ")}</p>
                    </div>
                    <span className={`badge ${r.attending?"badge-y":"badge-n"}`}>
                      {r.attending ? `✓ ${r.guests_count||1} người` : "✗ Vắng"}
                    </span>
                    <button className="btn-d" onClick={() => delRsvp(r.id)}
                      style={{ padding:".32rem .6rem",fontSize:".72rem" }}>🗑</button>
                  </div>
                ))}
              </div>
            </>}
          </>
        )}
      </div>
      <div id="toast" style={{ opacity:0,transform:"translateY(20px)",transition:"all .28s",position:"fixed",bottom:"1.2rem",right:"1.2rem",zIndex:9999,pointerEvents:"none" }}/>
    </>
  );
}
