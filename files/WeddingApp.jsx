// ============================================================
// WEDDING APP — React + Vite + Supabase
// Bám theo mẫu cinelove.me: scroll dài, position absolute
// Bảo Ngân & Viết Định · 26/04/2026
// ============================================================

import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

// ── Supabase ──
const SB_URL = import.meta.env.VITE_SUPABASE_URL;
const SB_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const sb = SB_URL && SB_KEY ? createClient(SB_URL, SB_KEY) : null;

// ── Chuyển Google Drive link → ảnh hiển thị ──
function gdrive(url) {
  if (!url || url.trim() === "") return "";
  const m =
    url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/) ||
    url.match(/id=([a-zA-Z0-9_-]+)/);
  if (m) return `https://lh3.googleusercontent.com/d/${m[1]}`;
  return url; // trả nguyên nếu không phải Drive
}

// ── YouTube embed ──
function ytId(url) {
  if (!url) return "";
  const m =
    url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/) ||
    url.match(/[?&]v=([a-zA-Z0-9_-]+)/) ||
    url.match(/embed\/([a-zA-Z0-9_-]+)/);
  return m ? m[1] : "";
}

// ── Default data — đọc từ Supabase khi có ──
const DEF = {
  bride: "Bảo Ngân",
  groom: "Viết Định",
  wedding_date: "26.04.2026",
  wedding_day: "Thứ Hai",
  wedding_time: "10:00 SA",
  lunar_date: "Ngày 09 tháng 03 năm Bính Ngọ",
  venue_name: "Nhà hàng tiệc cưới",
  venue_address: "123 Đường ABC, Phường XYZ, TP. Huế",
  venue_map_url: "https://maps.google.com",
  parent_groom_label: "Nhà Trai",
  parent_groom_names: "Ông : Nguyễn Văn A\nBà : Trần Thị B",
  parent_groom_addr: "Phường ABC, TP. Huế",
  parent_bride_label: "Nhà Gái",
  parent_bride_names: "Ông : Lê Văn C\nBà : Phạm Thị D",
  parent_bride_addr: "Phường XYZ, TP. Huế",
  ceremony1_label: "Lễ Gia Tiên Nhà Trai",
  ceremony1_time: "07:30 SA - Thứ Hai",
  ceremony1_date: "27 . 04 . 2026",
  ceremony1_lunar: "Nhằm 10/03 Âm lịch",
  ceremony1_place: "Tại tư gia Nhà Trai",
  ceremony1_addr: "Phường ABC, TP. Huế",
  ceremony2_label: "Lễ Cưới",
  ceremony2_time: "10:00 SA - Thứ Hai",
  ceremony2_date: "26 . 04 . 2026",
  ceremony2_lunar: "Nhằm 09/03 Âm lịch",
  ceremony2_place: "Tại nhà hàng",
  ceremony2_addr: "Phường XYZ, TP. Huế",
  quote1: "Anh về hái lấy buồng cau\nTrầu têm cánh phượng đội đầu mang sang\nAnh về thưa với họ hàng\nBốn bên hai họ anh sang rước nàng",
  quote2: "Có lẽ thế gian này có vô vàn điều tươi đẹp,\nNhưng trong lòng em,\nđẹp nhất vẫn chỉ có anh",
  quote3: "Khoảnh khắc gặp được em,\nAnh đã quyết định\nsẽ cùng em đi đến hết cuộc đời.",
  quote4: "Hôn nhân là chuyện cả đời\nYêu người vừa ý — Cưới người mình thương",
  quote5: "With love ♥",
  sec_invite_title: "Thư Mời",
  sec_invite_sub: "THAM DỰ LỄ THÀNH HÔN CÙNG GIA ĐÌNH CHÚNG TÔI",
  sec_invite_body: "Chúng tôi trân trọng kính mời Quý gia đình, anh chị em và các bạn đến dự buổi tiệc mừng hôn lễ của chúng tôi. Sự hiện diện của quý vị là niềm hạnh phúc lớn nhất đối với gia đình chúng tôi.",
  sec_cal_title: "Thư Mời",
  sec_cal_sub: "THAM DỰ TIỆC MỪNG CÙNG GIA ĐÌNH CHÚNG TÔI",
  mong_text: "Rất mong được mọi người\nchung vui trong ngày hạnh phúc này",
  qr_groom_bank: "Vietcombank",
  qr_groom_num: "0123 456 789",
  qr_groom_name: "NGUYEN VIET DINH",
  qr_groom_img: "",
  qr_bride_bank: "Vietcombank",
  qr_bride_num: "9876 543 210",
  qr_bride_name: "TRAN BAO NGAN",
  qr_bride_img: "",
  hero_img: "",
  couple_img: "",
  photo_large: "",
  photo_sm1: "",
  photo_sm2: "",
  photo_wide1: "",
  photo_wide2: "",
  photo_pair1: "",
  photo_pair2: "",
  photo_full: "",
  music_youtube: "",
  gallery: [], // array of {url, caption}
};

// ══════════════════════════════════════════════
// GLOBAL STYLES
// ══════════════════════════════════════════════
const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Cinzel:wght@400;600&family=Dancing+Script:wght@500;700&display=swap');

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      background: #c8d8c8;
      display: flex; justify-content: center; align-items: flex-start;
      min-height: 100vh; padding: 4vh 0;
      font-family: 'Quicksand', sans-serif;
      -webkit-font-smoothing: antialiased;
      -webkit-tap-highlight-color: transparent;
    }

    /* ── Page wrapper ── */
    #pw {
      width: 451px; position: relative;
      background: #fff;
      border: 1px solid #b0ccb0;
      box-shadow: 0 0 50px rgba(20,50,20,.22);
      border-radius: 3px;
      overflow: hidden; overflow-y: auto;
      max-height: 92vh; scroll-behavior: smooth;
    }
    #rp {
      width: 451px; position: relative;
      height: 6500px; background: #fff;
    }

    /* ── Audio button ── */
    #aud {
      position: fixed;
      right: calc(50% - 225px + 8px);
      top: calc(4vh + 8px);
      z-index: 9999;
      width: 32px; height: 32px;
      background: rgba(44,80,44,.22);
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer;
      animation: rotBtn 5s linear infinite;
      border: 1.5px solid rgba(92,130,92,.45);
      backdrop-filter: blur(6px);
    }
    #aud.paused { animation-play-state: paused; }
    #aud svg { width: 15px; height: 15px; }
    @keyframes rotBtn { to { transform: rotate(360deg); } }

    /* ── Scroll hint ── */
    #sh {
      position: fixed; bottom: calc(4vh+10px); left: 50%;
      animation: shBounce 2.4s ease-in-out infinite;
      pointer-events: none; z-index: 998;
      display: flex; flex-direction: column; align-items: center; gap: 5px;
      opacity: 1; transition: opacity .9s;
    }
    #sh.gone { opacity: 0; }
    .sh-t { font-size: 8.5px; letter-spacing: .35em; text-transform: uppercase; color: rgba(92,130,92,.72); }
    .sh-m { width: 20px; height: 28px; border: 1.5px solid rgba(92,130,92,.52); border-radius: 10px; display: flex; justify-content: center; padding-top: 4px; }
    .sh-m::after { content:''; width: 3px; height: 6px; background: rgba(92,130,92,.65); border-radius: 2px; animation: mDot 1.6s ease-in-out infinite; }
    @keyframes shBounce { 0%,100%{transform:translateX(-50%) translateY(0);opacity:.55;} 50%{transform:translateX(-50%) translateY(5px);opacity:1;} }
    @keyframes mDot { 0%{opacity:1;transform:translateY(0);} 100%{opacity:0;transform:translateY(8px);} }

    /* ── Scroll reveal ── */
    .rv { opacity: 0; will-change: opacity, transform; }
    .rv.rl { transform: translateX(-54px); }
    .rv.rr { transform: translateX(54px); }
    .rv.ru { transform: translateY(50px); }
    .rv.rs { transform: scale(.82); }
    .rv.rf { transform: none; }
    .rv.show {
      opacity: 1; transform: none !important;
      transition: opacity .88s cubic-bezier(.22,1,.36,1), transform .88s cubic-bezier(.22,1,.36,1);
    }
    .d1{transition-delay:.05s!important;} .d2{transition-delay:.13s!important;}
    .d3{transition-delay:.22s!important;} .d4{transition-delay:.30s!important;}
    .d5{transition-delay:.40s!important;} .d6{transition-delay:.52s!important;}

    /* ── Split text ── */
    .sc { display:inline-block; white-space:pre; opacity:0;
      transition: opacity .78s cubic-bezier(.22,1,.36,1), transform .78s cubic-bezier(.22,1,.36,1); }
    .sc.sl { transform: translateX(-36px); }
    .sc.sr { transform: translateX(36px); }
    .spl-on .sc { opacity:1!important; transform:none!important; }

    /* ── Animations ── */
    @keyframes hBeat { 0%,100%{transform:scale(1);} 14%{transform:scale(1.25);} 28%{transform:scale(1);} 42%{transform:scale(1.18);} 70%{transform:scale(1);} }
    @keyframes floatY { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-6px);} }
    @keyframes wobble { 0%,100%{transform:rotate(-6deg);} 50%{transform:rotate(6deg);} }
    @keyframes pGlow { 0%,100%{box-shadow:0 0 8px rgba(60,100,60,.5);} 50%{box-shadow:0 0 20px rgba(60,100,60,.85);} }
    @keyframes shimmer { 0%{background-position:-200% 0;} 100%{background-position:200% 0;} }

    /* Calendar */
    .cal-d { display:flex;align-items:center;justify-content:center;aspect-ratio:1;border-radius:50%;font-size:12.5px;color:#444;font-family:'Quicksand',sans-serif;font-weight:500; }
    .cal-d.sp { background:linear-gradient(135deg,#2a4a2a,#5c8a5c);color:#fff;font-weight:700;font-size:14px;position:relative;animation:pGlow 2.5s ease-in-out infinite; }
    .cal-d.sp::before { content:'♥';position:absolute;top:-13px;left:50%;transform:translateX(-50%);font-size:11px;color:#5c8a5c; }
    .cal-d.wk { color:#8a4040; }

    /* RSVP */
    .rv-in { width:100%;padding:7px 9px;border:1px solid #c0d8c0;border-radius:4px;font-size:12px;margin-bottom:11px;background:#f7faf7;color:#333;font-family:'Quicksand',sans-serif;transition:border-color .22s;outline:none; }
    .rv-in:focus { border-color:#5c8a5c; }
    .rv-rb label { display:flex;align-items:center;gap:7px;font-size:12px;color:#444;font-family:'Quicksand',sans-serif;cursor:pointer;margin-bottom:7px; }
    .rv-rb input { accent-color:#5c8a5c; }

    /* Lightbox */
    #lb { display:none;position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.96);align-items:center;justify-content:center; }
    #lb.open { display:flex; }
    #lb img { max-width:92vw;max-height:88vh;object-fit:contain; }
    #lb-cl { position:absolute;top:1rem;right:1rem;background:transparent;border:1px solid rgba(255,255,255,.35);color:rgba(255,255,255,.7);font-size:.62rem;letter-spacing:.28em;text-transform:uppercase;padding:.38rem .85rem;cursor:pointer;font-family:'Quicksand',sans-serif; }
    #lb-pv,#lb-nx { position:absolute;top:50%;transform:translateY(-50%);background:rgba(92,138,92,.18);border:1px solid rgba(92,138,92,.35);color:rgba(232,244,232,.8);font-size:1.9rem;width:44px;height:66px;cursor:pointer;font-family:serif;display:flex;align-items:center;justify-content:center; }
    #lb-pv { left:1rem; } #lb-nx { right:1rem; }

    @media(max-width:460px) {
      body { padding:0; background:#0c1a0c; }
      #pw { width:100vw; max-height:100svh; border-radius:0; }
      #rp { width:100vw; }
      #aud { right:8px; }
      #sh { display:none; }
    }
  `}</style>
);

// ══════════════════════════════════════════════
// HOOKS
// ══════════════════════════════════════════════
function useCountdown(target) {
  const [t, setT] = useState({ d: 0, h: 0, m: 0, s: 0 });
  useEffect(() => {
    const calc = () => {
      const diff = new Date(target) - new Date();
      if (diff <= 0) return;
      setT({ d: Math.floor(diff / 86400000), h: Math.floor(diff % 86400000 / 3600000), m: Math.floor(diff % 3600000 / 60000), s: Math.floor(diff % 60000 / 1000) });
    };
    calc(); const id = setInterval(calc, 1000); return () => clearInterval(id);
  }, [target]);
  return t;
}

// ══════════════════════════════════════════════
// SPLIT TEXT COMPONENT — chữ bay từ 2 bên
// ══════════════════════════════════════════════
function SplitText({ text, style = {}, className = "", onVisible }) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  const chars = Array.from(String(text || ""));
  const mid = Math.floor(chars.length / 2);

  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVis(true); obs.disconnect(); if (onVisible) onVisible(); }
    }, { threshold: 0.1 });
    obs.observe(el); return () => obs.disconnect();
  }, []);

  return (
    <span ref={ref} style={{ display: "inline-flex", flexWrap: "nowrap", whiteSpace: "pre", ...style }} className={className}>
      {chars.map((ch, i) => {
        const isLeft = i < mid;
        const dist = Math.abs(i - mid);
        return (
          <span key={i} className={`sc ${isLeft ? "sl" : "sr"}${vis ? " spl-on" : ""}`}
            style={{ transitionDelay: `${(dist * 0.034).toFixed(3)}s` }}>
            {ch === " " ? "\u00A0" : ch}
          </span>
        );
      })}
    </span>
  );
}

// ══════════════════════════════════════════════
// REVEAL ELEMENT — fade + slide khi scroll đến
// ══════════════════════════════════════════════
function Rv({ children, dir = "u", delay = 0, style = {}, className = "", tag: Tag = "div" }) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  const pw = typeof document !== "undefined" ? document.getElementById("pw") : null;

  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVis(true); obs.disconnect(); }
    }, { root: document.getElementById("pw"), threshold: 0.1, rootMargin: "0px 0px -10px 0px" });
    obs.observe(el); return () => obs.disconnect();
  }, []);

  const dirMap = { u: "translateY(50px)", l: "translateX(-54px)", r: "translateX(54px)", s: "scale(.82)", f: "none" };
  return (
    <Tag ref={ref} className={className}
      style={{
        opacity: vis ? 1 : 0,
        transform: vis ? "none" : (dirMap[dir] || "translateY(50px)"),
        transition: `opacity .88s cubic-bezier(.22,1,.36,1) ${delay}s, transform .88s cubic-bezier(.22,1,.36,1) ${delay}s`,
        ...style,
      }}>
      {children}
    </Tag>
  );
}

// ══════════════════════════════════════════════
// MUSIC PLAYER — YouTube hidden iframe
// ══════════════════════════════════════════════
function MusicPlayer({ url }) {
  const [on, setOn] = useState(false);
  const [started, setStarted] = useState(false);
  const id = ytId(url);
  const ifRef = useRef(null);

  const cmd = (fn) => {
    ifRef.current?.contentWindow?.postMessage(JSON.stringify({ event: "command", func: fn, args: [] }), "*");
  };

  const toggle = (e) => {
    e.stopPropagation();
    if (!id) return;
    if (!started) { setStarted(true); setOn(true); return; }
    if (on) { cmd("pauseVideo"); setOn(false); }
    else { cmd("playVideo"); setOn(true); }
  };

  // Phát khi user tương tác đầu tiên
  useEffect(() => {
    if (!id || !started) return;
    const t = setTimeout(() => cmd("playVideo"), 1200);
    return () => clearTimeout(t);
  }, [started]);

  return (
    <>
      {id && started && (
        <iframe ref={ifRef}
          src={`https://www.youtube.com/embed/${id}?autoplay=1&loop=1&playlist=${id}&controls=0&enablejsapi=1`}
          allow="autoplay" title="music"
          style={{ position: "fixed", top: "-9999px", left: "-9999px", width: "1px", height: "1px" }}/>
      )}
      <button id="aud" className={on ? "" : "paused"} onClick={toggle} title={on ? "Tắt nhạc" : "Bật nhạc"}>
        <svg viewBox="0 0 24 24" fill="none" stroke="rgba(198,232,176,.85)" strokeWidth="1.8" strokeLinecap="round">
          <circle cx="12" cy="12" r="9"/>
          <circle cx="12" cy="12" r="3.5" fill="rgba(198,232,176,.85)" stroke="none"/>
          <line x1="12" y1="3" x2="12" y2="6.5"/><line x1="12" y1="17.5" x2="12" y2="21"/>
          <line x1="3" y1="12" x2="6.5" y2="12"/><line x1="17.5" y1="12" x2="21" y2="12"/>
        </svg>
      </button>
    </>
  );
}

// ══════════════════════════════════════════════
// LIGHTBOX
// ══════════════════════════════════════════════
function Lightbox({ imgs, cur, onClose, onNav }) {
  useEffect(() => {
    const fn = (e) => { if (e.key === "Escape") onClose(); if (e.key === "ArrowLeft") onNav(-1); if (e.key === "ArrowRight") onNav(1); };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [onClose, onNav]);
  if (cur < 0) return null;
  return (
    <div id="lb" className="open" onClick={onClose}>
      <img src={gdrive(imgs[cur]?.url)} alt={imgs[cur]?.caption || ""} onClick={(e) => e.stopPropagation()}/>
      <button id="lb-cl" onClick={onClose}>ESC ✕</button>
      {imgs.length > 1 && <>
        <button id="lb-pv" onClick={(e) => { e.stopPropagation(); onNav(-1); }}>‹</button>
        <button id="lb-nx" onClick={(e) => { e.stopPropagation(); onNav(1); }}>›</button>
      </>}
    </div>
  );
}

// ══════════════════════════════════════════════
// RSVP SECTION
// ══════════════════════════════════════════════
function RSVPForm({ d }) {
  const [name, setName] = useState("");
  const [att, setAtt] = useState("yes");
  const [guests, setGuests] = useState(1);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");

  const submit = async () => {
    if (!name.trim()) { setErr("Vui lòng nhập tên"); return; }
    setLoading(true); setErr("");
    if (sb) {
      const { error } = await sb.from("rsvp_responses").insert({
        name: name.trim(), attending: att === "yes",
        guests_count: att === "yes" ? guests : 0, message: msg || null,
      });
      if (error) { setErr(error.message); setLoading(false); return; }
    }
    setDone(true); setLoading(false);
  };

  if (done) return (
    <div style={{ padding: "1rem", background: "#eef7ee", borderRadius: "4px", textAlign: "center" }}>
      <p style={{ fontSize: "1.5rem" }}>{att === "yes" ? "🎉" : "💌"}</p>
      <p style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", fontSize: "15px", color: "#2a4a2a", lineHeight: 1.65, marginTop: "6px" }}>
        {att === "yes" ? `Cảm ơn ${name}!\nHẹn gặp bạn ngày ${d.wedding_date} ♥` : `Cảm ơn ${name}!\nRất tiếc khi bạn không thể đến.`}
      </p>
    </div>
  );

  return (
    <>
      <p style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", fontSize: "20px", fontWeight: 700, color: "#2a4a2a", textAlign: "center", marginBottom: "14px" }}>Xác Nhận Tham Dự</p>
      <label className="rv-in" style={{ display: "block", fontSize: "11.5px", fontWeight: 600, color: "#444", marginBottom: "4px", background: "none", border: "none", padding: 0 }}>Họ và tên</label>
      <input className="rv-in" value={name} placeholder="Nhập tên của bạn" maxLength={80} onChange={e => { setName(e.target.value); setErr(""); }} onKeyDown={e => e.key === "Enter" && submit()}/>
      <label style={{ display: "block", fontSize: "11.5px", fontWeight: 600, color: "#444", marginBottom: "7px" }}>Bạn sẽ tham dự chứ?</label>
      <div className="rv-rb" style={{ marginBottom: "11px" }}>
        <label><input type="radio" name="att" value="yes" checked={att === "yes"} onChange={() => setAtt("yes")}/> Có, tôi sẽ tham dự 🎉</label>
        <label><input type="radio" name="att" value="no" checked={att === "no"} onChange={() => setAtt("no")}/> Rất tiếc, tôi không thể đến</label>
      </div>
      {att === "yes" && <>
        <label style={{ display: "block", fontSize: "11.5px", fontWeight: 600, color: "#444", marginBottom: "4px" }}>Số người tham dự</label>
        <select className="rv-in" value={guests} onChange={e => setGuests(Number(e.target.value))}>
          {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n} người</option>)}
        </select>
      </>}
      <label style={{ display: "block", fontSize: "11.5px", fontWeight: 600, color: "#444", marginBottom: "4px" }}>Lời nhắn (tuỳ chọn)</label>
      <textarea className="rv-in" rows={2} value={msg} maxLength={300} placeholder="Lời chúc của bạn..." onChange={e => setMsg(e.target.value)} style={{ resize: "none" }}/>
      {err && <p style={{ color: "#c04040", fontSize: "11px", marginBottom: "8px" }}>{err}</p>}
      <button onClick={submit} disabled={loading}
        style={{ background: "linear-gradient(135deg,#2a4a2a,#5c8a5c)", color: "#fff", border: "none", padding: "9px", borderRadius: "4px", fontSize: "11px", fontWeight: 700, letterSpacing: ".18em", textTransform: "uppercase", width: "100%", cursor: "pointer", fontFamily: "'Quicksand',sans-serif", opacity: loading ? 0.6 : 1 }}>
        {loading ? "Đang gửi..." : "Gửi xác nhận ♥"}
      </button>
    </>
  );
}

// ══════════════════════════════════════════════
// CALENDAR — Tháng 4/2026
// ══════════════════════════════════════════════
function Calendar({ weddingDay = 26 }) {
  const days = ["CN","T2","T3","T4","T5","T6","T7"];
  // Tháng 4/2026 bắt đầu thứ Tư (index 3)
  const firstDay = 3;
  const total = 30;
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let i = 1; i <= total; i++) cells.push(i);
  while (cells.length % 7 !== 0) cells.push(null);
  const isWknd = (idx) => [0, 6].includes(idx % 7);

  return (
    <div style={{ padding: "14px 16px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", textAlign: "center", fontWeight: 700, color: "#2a4a2a", marginBottom: "10px", fontSize: "11.5px", fontFamily: "'Quicksand',sans-serif" }}>
        {days.map(d => <span key={d}>{d}</span>)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: "4px" }}>
        {cells.map((d, i) => (
          <div key={i} className={`cal-d${d === weddingDay ? " sp" : ""}${d && isWknd(i) ? " wk" : ""}`}>
            {d || ""}
          </div>
        ))}
      </div>
      <div style={{ textAlign: "center", marginTop: "8px", fontSize: "1rem", color: "#5c8a5c", animation: "floatY 3s ease-in-out infinite" }}>♥</div>
    </div>
  );
}

// ══════════════════════════════════════════════
// PHOTO — hiển thị ảnh Google Drive
// ══════════════════════════════════════════════
function Photo({ url, style = {}, className = "" }) {
  const src = gdrive(url);
  if (!src) return <div style={{ background: "#c4d8c4", ...style }} className={className}/>;
  return <div style={{ backgroundImage: `url(${src})`, backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat", backgroundColor: "#c4d8c4", ...style }} className={className}/>;
}

// ══════════════════════════════════════════════
// MAIN WEDDING APP
// ══════════════════════════════════════════════
export default function WeddingApp() {
  const [d, setD] = useState(DEF);
  const [lbCur, setLbCur] = useState(-1);
  const [lbImgs, setLbImgs] = useState([]);
  const wrapRef = useRef(null);
  const cd = useCountdown("2026-04-26T10:00:00+07:00");

  // ── Load config từ Supabase ──
  useEffect(() => {
    if (!sb) return;
    sb.from("wedding_config").select("*").eq("id", 1).single().then(({ data }) => {
      if (data) {
        setD(prev => ({
          ...prev, ...data,
          gallery: Array.isArray(data.gallery) ? data.gallery : (typeof data.gallery === "string" ? JSON.parse(data.gallery || "[]") : []),
        }));
      }
    });
  }, []);

  // ── Auto scroll ──
  useEffect(() => {
    const pw = document.getElementById("pw");
    const sh = document.getElementById("sh");
    if (!pw) return;
    let on = true, paused = false, timer = null;
    const SPEED = 0.45;

    const loop = () => {
      if (on && !paused) {
        pw.scrollTop += SPEED;
        if (pw.scrollTop >= pw.scrollHeight - pw.clientHeight - 1) on = false;
      }
      requestAnimationFrame(loop);
    };

    const pause = () => {
      paused = true; if (sh) sh.classList.add("gone");
      clearTimeout(timer); timer = setTimeout(() => { paused = false; }, 4000);
    };

    pw.addEventListener("wheel", pause, { passive: true });
    pw.addEventListener("touchmove", pause, { passive: true });
    pw.addEventListener("touchstart", pause, { passive: true });
    pw.addEventListener("scroll", () => { if (pw.scrollTop > 80 && sh) sh.classList.add("gone"); });
    pw.addEventListener("click", (e) => {
      const skip = ["BUTTON", "A", "INPUT", "SELECT", "TEXTAREA", "LABEL"];
      if (skip.includes(e.target.tagName)) return;
      paused = !paused; clearTimeout(timer);
    });

    const t = setTimeout(() => requestAnimationFrame(loop), 1800);
    return () => { clearTimeout(t); on = false; };
  }, []);

  const openLb = useCallback((imgs, idx) => { setLbImgs(imgs); setLbCur(idx); }, []);
  const closeLb = useCallback(() => setLbCur(-1), []);
  const navLb = useCallback((dir) => setLbCur(c => (c + dir + lbImgs.length) % lbImgs.length), [lbImgs.length]);

  const nl = (txt) => String(txt || "").replace(/\n/g, "\n"); // giữ nguyên newline

  // ── Deco flower SVG bg ──
  const fl = (top, left, w, h, rot, opacity = 0.22) => (
    <div style={{ position: "absolute", top, left, width: w, height: h, backgroundImage: "url('https://assets.cinelove.me/templates/assets/efd815e3-41ff-4eb3-b31b-c25b202bc08c/016b5d70-8d6b-4f3c-b16c-2d93e447544c.png')", backgroundSize: "cover", backgroundPosition: "center", transform: `rotate(${rot}deg)`, opacity, filter: "hue-rotate(80deg) saturate(.6) brightness(1.18)", pointerEvents: "none" }}/>
  );

  const p = (txt) => String(txt || "").split("\n").map((line, i, arr) => (
    <span key={i}>{line}{i < arr.length - 1 && <br/>}</span>
  ));

  const galleryImgs = Array.isArray(d.gallery) ? d.gallery : [];

  return (
    <>
      <GlobalStyle/>
      <MusicPlayer url={d.music_youtube}/>

      <div id="sh">
        <span className="sh-t">Kéo xuống</span>
        <div className="sh-m"/>
      </div>

      <div id="pw" ref={wrapRef}>
        <div id="rp">

          {/* ══ S1: COVER HERO ══ */}
          <div style={{ position:"absolute",top:0,left:0,width:451,height:500,background:"linear-gradient(148deg,#1a3820 0%,#2d5c3a 50%,#183018 100%)" }}/>
          <div style={{ position:"absolute",top:0,left:0,width:451,height:500,opacity:.055,backgroundImage:"repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 0,transparent 50%)",backgroundSize:"15px 15px" }}/>
          {fl(-35, -95, 295, 390, 14, 0.22)}
          
          <Photo url={d.hero_img} style={{ position:"absolute",top:52,left:18,width:268,height:438,WebkitMaskImage:"linear-gradient(180deg,black 62%,transparent 100%)",maskImage:"linear-gradient(180deg,black 62%,transparent 100%)" }}
            className="rv ru d1"/>

          {/* Deco hoa góc */}
          <div className="rv rr d2" style={{ position:"absolute",top:26,left:0,width:134,height:168,backgroundImage:"url('https://assets.cinelove.me/templates/assets/efd815e3-41ff-4eb3-b31b-c25b202bc08c/1faee750-3c82-4fdb-badb-f258477bd1c4.png')",backgroundSize:"cover",opacity:.68,filter:"hue-rotate(72deg) saturate(.55) brightness(1.35)" }}/>
          <div className="rv rr d3" style={{ position:"absolute",top:218,left:-10,width:108,height:95,backgroundImage:"url('https://assets.cinelove.me/templates/assets/efd815e3-41ff-4eb3-b31b-c25b202bc08c/a6d0b3c8-29c5-4cfd-b056-90a77cad3837.png')",backgroundSize:"cover",opacity:.62,filter:"hue-rotate(72deg) saturate(.55)",transform:"rotate(12deg)" }}/>

          <Rv dir="u" delay={0} style={{ position:"absolute",top:11,left:0,width:451,color:"rgba(210,238,210,.82)",fontSize:"12.5px",fontWeight:600,fontFamily:"'Quicksand',sans-serif",textAlign:"center",letterSpacing:".52em",textTransform:"uppercase" }}>SAVE THE DATE</Rv>

          <Rv dir="l" delay={0.1} style={{ position:"absolute",top:78,right:8,width:162,display:"flex",flexDirection:"column",alignItems:"center",gap:6 }}>
            <span style={{ color:"rgba(210,238,210,.76)",fontSize:"11.5px",fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",letterSpacing:".06em",textAlign:"center",lineHeight:1.5 }}>THƯ MỜI TIỆC CƯỚI</span>
            <span style={{ color:"rgba(210,238,210,.68)",fontSize:"10px",fontWeight:600,letterSpacing:".25em",textTransform:"uppercase",fontFamily:"'Quicksand',sans-serif" }}>{d.wedding_day}</span>
            <span style={{ color:"#c6e8b0",fontSize:"14px",fontWeight:600,fontFamily:"'Cinzel',serif",letterSpacing:".14em" }}>{d.wedding_date}</span>
            <div style={{ width:90,height:1,background:"rgba(198,232,176,.36)" }}/>
            <span style={{ color:"rgba(210,238,210,.76)",fontSize:"11.5px",fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",letterSpacing:".06em",textAlign:"center",lineHeight:1.5,marginTop:6 }}>LỄ THÀNH HÔN</span>
            <span style={{ color:"rgba(210,238,210,.68)",fontSize:"10px",fontWeight:600,letterSpacing:".25em",textTransform:"uppercase",fontFamily:"'Quicksand',sans-serif" }}>{d.wedding_day}</span>
            <span style={{ color:"#c6e8b0",fontSize:"14px",fontWeight:600,fontFamily:"'Cinzel',serif",letterSpacing:".14em" }}>{d.wedding_date}</span>
          </Rv>

          <div className="rv rl d3" style={{ position:"absolute",bottom:40,right:6,width:170,textAlign:"center" }}>
            <SplitText text={d.groom} style={{ fontFamily:"'Dancing Script',cursive",fontWeight:700,fontSize:"30px",color:"#c6e8b0",lineHeight:1.1,textShadow:"0 2px 14px rgba(0,0,0,.4)" }}/>
            <span style={{ display:"block",fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:"15px",color:"rgba(198,232,176,.52)",margin:"3px 0" }}>&amp;</span>
            <SplitText text={d.bride} style={{ fontFamily:"'Dancing Script',cursive",fontWeight:700,fontSize:"30px",color:"#c6e8b0",lineHeight:1.1,textShadow:"0 2px 14px rgba(0,0,0,.4)" }}/>
          </div>

          {/* ══ S2: TÊN + PHỤ HUYNH ══ */}
          <div style={{ position:"absolute",top:496,left:210,width:28,height:28,fontSize:"22px",textAlign:"center",lineHeight:"28px",color:"#4a7a4a",animation:"hBeat 2.8s ease-in-out infinite" }}>♥</div>

          <Rv dir="r" delay={0} style={{ position:"absolute",top:492,left:42,width:150,fontSize:"20px",fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",color:"#2a4a2a",textAlign:"right" }}>{d.parent_groom_label}</Rv>
          <Rv dir="r" delay={0.1} style={{ position:"absolute",top:524,left:16,width:176,fontSize:"12px",fontFamily:"'Quicksand',sans-serif",color:"#333",lineHeight:1.82,textAlign:"right" }}>{p(d.parent_groom_names)}</Rv>
          <Rv dir="r" delay={0.2} style={{ position:"absolute",top:572,left:6,width:188,fontSize:"9.5px",fontFamily:"'Quicksand',sans-serif",color:"#777",lineHeight:1.65,textAlign:"right" }}>{p(d.parent_groom_addr)}</Rv>
          <Rv dir="l" delay={0} style={{ position:"absolute",top:492,left:264,fontSize:"20px",fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",color:"#2a4a2a" }}>{d.parent_bride_label}</Rv>
          <Rv dir="l" delay={0.1} style={{ position:"absolute",top:524,left:262,width:176,fontSize:"12px",fontFamily:"'Quicksand',sans-serif",color:"#333",lineHeight:1.82 }}>{p(d.parent_bride_names)}</Rv>
          <Rv dir="l" delay={0.2} style={{ position:"absolute",top:572,left:260,width:188,fontSize:"9.5px",fontFamily:"'Quicksand',sans-serif",color:"#777",lineHeight:1.65 }}>{p(d.parent_bride_addr)}</Rv>
          <Rv dir="u" delay={0.3} style={{ position:"absolute",top:522,left:222,width:1,height:70,background:"#5c8a5c" }}/>

          <div style={{ position:"absolute",top:602,left:0,width:220,textAlign:"center" }}>
            <SplitText text={d.groom} style={{ fontFamily:"'Dancing Script',cursive",fontWeight:700,fontSize:"28px",color:"#2a4a2a",textShadow:"0 1px 6px rgba(42,74,42,.18)" }} className="rv rr d3"/>
          </div>
          <div style={{ position:"absolute",top:602,left:228,width:220,textAlign:"center" }}>
            <SplitText text={d.bride} style={{ fontFamily:"'Dancing Script',cursive",fontWeight:700,fontSize:"28px",color:"#2a4a2a",textShadow:"0 1px 6px rgba(42,74,42,.18)" }} className="rv rl d3"/>
          </div>

          {/* ══ Divider ══ */}
          <Rv dir="f" style={{ position:"absolute",top:650,left:0,width:451,height:4,background:"linear-gradient(90deg,transparent,#4a7a4a,transparent)" }}/>

          {/* ══ S3: THƯ MỜI + ẢNH ══ */}
          <div style={{ position:"absolute",top:662,left:130,width:190,textAlign:"center" }}>
            <SplitText text={d.sec_invite_title} style={{ fontSize:"29px",fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",color:"#2a4a2a",borderTop:"1px solid rgba(42,74,42,.4)",paddingTop:"8px" }} className="rv ru d2"/>
          </div>
          <Rv dir="u" delay={0.1} style={{ position:"absolute",top:704,left:38,width:374,fontSize:"10.5px",fontWeight:700,letterSpacing:".18em",textTransform:"uppercase",color:"#444",fontFamily:"'Quicksand',sans-serif",textAlign:"center" }}>{d.sec_invite_sub}</Rv>
          <Photo url={d.couple_img} style={{ position:"absolute",top:732,left:96,width:258,height:218,boxShadow:"0 4px 22px rgba(0,0,0,.32)" }} className="rv rs d2"/>
          <Rv dir="u" delay={0.15} style={{ position:"absolute",top:966,left:38,width:374,fontSize:"12px",fontFamily:"'Quicksand',sans-serif",fontWeight:500,color:"#444",lineHeight:1.9,textAlign:"center" }}>{p(d.sec_invite_body)}</Rv>

          {/* ══ Divider ══ */}
          <Rv dir="f" style={{ position:"absolute",top:1064,left:0,width:451,height:4,background:"linear-gradient(90deg,transparent,#4a7a4a,transparent)" }}/>

          {/* ══ S4: NGÀY GIỜ ĐỊA ĐIỂM ══ */}
          <Rv dir="u" delay={0} style={{ position:"absolute",top:1076,left:38,width:374,fontSize:"14.5px",fontWeight:500,color:"#444",fontFamily:"'Quicksand',sans-serif",textAlign:"center" }}>Vào Lúc</Rv>
          <div style={{ position:"absolute",top:1100,left:152,width:146,textAlign:"center" }}>
            <SplitText text={d.wedding_date} style={{ fontSize:"22px",fontFamily:"'Cinzel',serif",fontWeight:600,color:"#2a4a2a",borderLeft:"2.5px solid #5c8a5c",borderRight:"2.5px solid #5c8a5c",padding:"0 10px",letterSpacing:".06em" }} className="rv ru d2"/>
          </div>
          <Rv dir="r" delay={0.1} style={{ position:"absolute",top:1103,left:60,width:90,fontSize:"20px",fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",color:"#2a4a2a",textAlign:"center" }}>{d.wedding_time}</Rv>
          <Rv dir="l" delay={0.1} style={{ position:"absolute",top:1103,left:302,width:98,fontSize:"20px",fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",color:"#2a4a2a",textAlign:"center" }}>{d.wedding_day}</Rv>
          <Rv dir="u" delay={0.2} style={{ position:"absolute",top:1136,left:38,width:374,fontSize:"12.5px",color:"#666",fontFamily:"'Quicksand',sans-serif",textAlign:"center" }}>{d.lunar_date}</Rv>
          <Rv dir="u" delay={0.2} style={{ position:"absolute",top:1162,left:38,width:374,fontSize:"12.5px",fontWeight:700,color:"#333",fontFamily:"'Quicksand',sans-serif",textAlign:"center" }}>Tại</Rv>
          <div style={{ position:"absolute",top:1188,left:38,width:374,textAlign:"center" }}>
            <SplitText text={d.venue_name} style={{ fontSize:"22px",fontFamily:"'Dancing Script',cursive",fontWeight:700,color:"#2a4a2a" }} className="rv ru d3"/>
          </div>
          <Rv dir="u" delay={0.3} style={{ position:"absolute",top:1222,left:38,width:374,fontSize:"12.5px",color:"#666",fontFamily:"'Quicksand',sans-serif",textAlign:"center" }}>{d.venue_address}</Rv>
          <Rv dir="s" delay={0.35} style={{ position:"absolute",top:1255,left:156,width:138,height:30 }}>
            <a href={d.venue_map_url || "#"} target="_blank" rel="noopener noreferrer"
              style={{ display:"flex",alignItems:"center",justifyContent:"center",height:"100%",background:"linear-gradient(135deg,#2a4a2a,#5c8a5c)",color:"#fff",fontSize:"10.5px",fontWeight:600,letterSpacing:".18em",textTransform:"uppercase",fontFamily:"'Quicksand',sans-serif",textDecoration:"none",boxShadow:"0 2px 10px rgba(42,74,42,.38)" }}>
              📍 Xem bản đồ
            </a>
          </Rv>

          {/* ══ Divider ══ */}
          <Rv dir="f" style={{ position:"absolute",top:1296,left:0,width:451,height:4,background:"linear-gradient(90deg,transparent,#4a7a4a,transparent)" }}/>

          {/* ══ S5: THƯ MỜI 2 + 2 LỄ ══ */}
          <div style={{ position:"absolute",top:1308,left:130,width:190,textAlign:"center" }}>
            <SplitText text={d.sec_cal_title} style={{ fontSize:"29px",fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",color:"#2a4a2a",borderTop:"1px solid rgba(42,74,42,.4)",paddingTop:"8px" }} className="rv ru d1"/>
          </div>
          <Rv dir="u" delay={0.1} style={{ position:"absolute",top:1350,left:38,width:374,fontSize:"10.5px",fontWeight:700,letterSpacing:".18em",textTransform:"uppercase",color:"#444",fontFamily:"'Quicksand',sans-serif",textAlign:"center" }}>{d.sec_cal_sub}</Rv>

          {/* Lễ 1 */}
          <Rv dir="r" delay={0.1} style={{ position:"absolute",top:1382,left:0,width:188,height:34,background:"linear-gradient(90deg,#2a4a2a,#5c8a5c)",boxShadow:"0 2px 10px rgba(0,0,0,.32)" }}/>
          <Rv dir="r" delay={0.15} style={{ position:"absolute",top:1388,left:8,fontSize:"14.5px",fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",color:"#e8f4e8" }}>{d.ceremony1_label}</Rv>
          <Rv dir="u" delay={0.1} style={{ position:"absolute",top:1380,left:168,width:36,height:36,background:"#2a4a2a",borderRadius:"50%",boxShadow:"0 2px 8px rgba(0,0,0,.32)" }}/>
          <Rv dir="r" delay={0.2} style={{ position:"absolute",top:1428,left:24,fontSize:"12.5px",fontWeight:700,color:"#222",fontFamily:"'Quicksand',sans-serif" }}>{d.ceremony1_time}</Rv>
          <Rv dir="r" delay={0.25} style={{ position:"absolute",top:1447,left:24,fontSize:"12.5px",fontWeight:700,color:"#222",fontFamily:"'Quicksand',sans-serif" }}>{d.ceremony1_date}</Rv>
          <Rv dir="r" delay={0.28} style={{ position:"absolute",top:1466,left:24,fontSize:"12px",color:"#666",fontFamily:"'Quicksand',sans-serif" }}>{d.ceremony1_lunar}</Rv>
          <Rv dir="r" delay={0.3} style={{ position:"absolute",top:1486,left:24,fontSize:"12px",color:"#666",fontFamily:"'Quicksand',sans-serif" }}>{d.ceremony1_place}</Rv>
          <Rv dir="r" delay={0.32} style={{ position:"absolute",top:1518,left:26,width:115,background:"#2a4a2a",color:"#fff",fontSize:"12.5px",fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",textAlign:"center",padding:"2px 6px",boxShadow:"0 2px 8px rgba(0,0,0,.3)" }}>{d.ceremony1_addr}</Rv>

          {/* Lễ 2 */}
          <Rv dir="l" delay={0.1} style={{ position:"absolute",top:1382,right:0,width:188,height:34,background:"linear-gradient(270deg,#2a4a2a,#5c8a5c)",boxShadow:"0 2px 10px rgba(0,0,0,.32)" }}/>
          <Rv dir="l" delay={0.15} style={{ position:"absolute",top:1388,right:8,fontSize:"14.5px",fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",color:"#e8f4e8" }}>{d.ceremony2_label}</Rv>
          <Rv dir="u" delay={0.1} style={{ position:"absolute",top:1380,left:246,width:36,height:36,background:"#2a4a2a",borderRadius:"50%",boxShadow:"0 2px 8px rgba(0,0,0,.32)" }}/>
          <Rv dir="l" delay={0.2} style={{ position:"absolute",top:1428,right:24,fontSize:"12.5px",fontWeight:700,color:"#222",fontFamily:"'Quicksand',sans-serif",textAlign:"right" }}>{d.ceremony2_time}</Rv>
          <Rv dir="l" delay={0.25} style={{ position:"absolute",top:1447,right:24,fontSize:"12.5px",fontWeight:700,color:"#222",fontFamily:"'Quicksand',sans-serif",textAlign:"right" }}>{d.ceremony2_date}</Rv>
          <Rv dir="l" delay={0.28} style={{ position:"absolute",top:1466,right:24,fontSize:"12px",color:"#666",fontFamily:"'Quicksand',sans-serif",textAlign:"right" }}>{d.ceremony2_lunar}</Rv>
          <Rv dir="l" delay={0.3} style={{ position:"absolute",top:1486,right:24,fontSize:"12px",color:"#666",fontFamily:"'Quicksand',sans-serif",textAlign:"right" }}>{d.ceremony2_place}</Rv>
          <Rv dir="l" delay={0.32} style={{ position:"absolute",top:1518,right:26,width:115,background:"#2a4a2a",color:"#fff",fontSize:"12.5px",fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",textAlign:"center",padding:"2px 6px",boxShadow:"0 2px 8px rgba(0,0,0,.3)" }}>{d.ceremony2_addr}</Rv>

          {/* Vline + tim giữa */}
          <Rv dir="u" delay={0.2} style={{ position:"absolute",top:1420,left:14,width:2,height:130,background:"#5c8a5c" }}/>
          <Rv dir="u" delay={0.2} style={{ position:"absolute",top:1420,left:435,width:2,height:130,background:"#5c8a5c" }}/>
          <div style={{ position:"absolute",top:1498,left:196,width:58,fontSize:"34px",textAlign:"center",lineHeight:1,color:"rgba(92,138,92,.45)",animation:"floatY 3s ease-in-out infinite" }}>♥</div>

          {/* ══ S6: CALENDAR + COUNTDOWN ══ */}
          <Rv dir="u" delay={0} style={{ position:"absolute",top:1608,left:0,width:451,height:62,background:"linear-gradient(90deg,#2a4a2a,#5c8a5c,#2a4a2a)" }}/>
          <Rv dir="r" delay={0.1} style={{ position:"absolute",top:1622,left:12,fontSize:"22px",fontFamily:"'Cinzel',serif",fontWeight:600,color:"#e8f4e8",letterSpacing:".08em" }}>Tháng 4</Rv>
          <Rv dir="l" delay={0.1} style={{ position:"absolute",top:1628,left:338,width:100,fontSize:"12px",fontFamily:"'Quicksand',sans-serif",fontWeight:600,letterSpacing:".2em",color:"rgba(232,244,232,.72)",textAlign:"right" }}>2026</Rv>
          <Rv dir="s" delay={0.15} style={{ position:"absolute",top:1670,left:0,width:451,boxShadow:"0 4px 20px rgba(0,0,0,.18)",background:"#fff",overflow:"hidden" }}>
            <Calendar weddingDay={26}/>
          </Rv>

          {/* Countdown dọc */}
          <Rv dir="l" delay={0.2} style={{ position:"absolute",top:4360,right:0,width:62,height:250,background:"linear-gradient(180deg,#2a4a2a,#5c8a5c)",borderRadius:"4px 0 0 4px",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"space-around",padding:"8px 4px",boxShadow:"-2px 0 12px rgba(0,0,0,.22)" }}>
            {[{v:cd.d,l:"ngày"},{v:cd.h,l:"giờ"},{v:cd.m,l:"phút"},{v:cd.s,l:"giây"}].map(item => (
              <div key={item.l} style={{ textAlign:"center" }}>
                <div style={{ fontSize:"19px",fontWeight:700,fontFamily:"'Cinzel',serif",color:"#fff",lineHeight:1 }}>{String(item.v??0).padStart(2,"0")}</div>
                <div style={{ fontSize:"8.5px",letterSpacing:".2em",color:"rgba(232,244,232,.75)",fontFamily:"'Quicksand',sans-serif",marginTop:2 }}>{item.l}</div>
              </div>
            ))}
          </Rv>

          {/* ══ S7: ẢNH + QUOTES (dark bg) ══ */}
          <Rv dir="f" style={{ position:"absolute",top:2000,left:0,width:451,height:4,background:"linear-gradient(90deg,#2a4a2a,#5c8a5c,#2a4a2a)" }}/>

          {/* Nền cột */}
          <div style={{ position:"absolute",top:2004,left:0,width:185,height:718,background:"linear-gradient(180deg,#182818,#2d5c3a)" }}/>
          <div style={{ position:"absolute",top:2770,left:190,width:261,height:390,background:"linear-gradient(180deg,#2d5c3a,#182818)" }}/>
          <div style={{ position:"absolute",top:3196,left:16,width:242,height:385,background:"linear-gradient(180deg,#182818,#2d5c3a)" }}/>

          {fl(2060,-175,400,550,14,0.22)}{fl(3770,-115,278,565,12,0.18)}

          {/* Quote 1 */}
          <Rv dir="u" delay={0.1} style={{ position:"absolute",top:2018,left:88,width:322,fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",color:"rgba(232,244,232,.92)",textAlign:"center",lineHeight:1.58,fontSize:"19.5px",textShadow:"0 1px 6px rgba(0,0,0,.38)",whiteSpace:"pre-line" }}>{d.quote1}</Rv>

          {/* Ảnh lớn */}
          <Photo url={d.photo_large} style={{ position:"absolute",top:2170,left:24,width:396,height:550,boxShadow:"0 4px 18px rgba(0,0,0,.45)" }} className="rv ru d1"/>

          <Rv dir="f" style={{ position:"absolute",top:2760,left:0,width:451,height:4,background:"linear-gradient(90deg,#2a4a2a,#5c8a5c,#2a4a2a)" }}/>

          {/* Ảnh nhỏ trái + Quote 2 */}
          <Photo url={d.photo_sm1} style={{ position:"absolute",top:2788,left:16,width:164,height:248,boxShadow:"0 4px 18px rgba(0,0,0,.45)" }} className="rv rr d1"/>
          <Rv dir="l" delay={0.1} style={{ position:"absolute",top:2808,left:190,width:248,fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",color:"rgba(232,244,232,.92)",textAlign:"center",lineHeight:1.58,fontSize:"18px",textShadow:"0 1px 6px rgba(0,0,0,.38)",whiteSpace:"pre-line" }}>{d.quote2}</Rv>

          {/* Ảnh ngang 1 */}
          <Photo url={d.photo_wide1} style={{ position:"absolute",top:3062,left:16,width:418,height:230,boxShadow:"0 4px 18px rgba(0,0,0,.45)" }} className="rv rs d2"/>

          <Rv dir="f" style={{ position:"absolute",top:3560,left:0,width:451,height:4,background:"linear-gradient(90deg,#2a4a2a,#5c8a5c,#2a4a2a)" }}/>

          {/* Quote 3 + Ảnh nhỏ phải */}
          <Rv dir="r" delay={0.1} style={{ position:"absolute",top:3298,left:18,width:240,fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",color:"rgba(232,244,232,.92)",textAlign:"center",lineHeight:1.58,fontSize:"18px",textShadow:"0 1px 6px rgba(0,0,0,.38)",whiteSpace:"pre-line" }}>{d.quote3}</Rv>
          <Photo url={d.photo_sm2} style={{ position:"absolute",top:3290,left:272,width:162,height:248,boxShadow:"0 4px 18px rgba(0,0,0,.45)" }} className="rv rl d1"/>

          {/* Quote 4 + Ảnh cặp */}
          <Rv dir="u" delay={0} style={{ position:"absolute",top:3588,left:4,width:442,fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",color:"rgba(232,244,232,.92)",textAlign:"center",lineHeight:1.58,fontSize:"21px",textShadow:"0 1px 6px rgba(0,0,0,.38)",whiteSpace:"pre-line" }}>{d.quote4}</Rv>
          <Photo url={d.photo_pair1} style={{ position:"absolute",top:3672,left:16,width:196,height:296,boxShadow:"0 4px 18px rgba(0,0,0,.45)" }} className="rv rr d2"/>
          <Photo url={d.photo_pair2} style={{ position:"absolute",top:3672,left:234,width:196,height:296,boxShadow:"0 4px 18px rgba(0,0,0,.45)" }} className="rv rl d3"/>

          {/* Ảnh ngang 2 */}
          <Photo url={d.photo_wide2} style={{ position:"absolute",top:3992,left:30,width:388,height:258,boxShadow:"0 4px 18px rgba(0,0,0,.45)" }} className="rv ru d1"/>

          {/* Quote 5 */}
          <Rv dir="u" delay={0.1} style={{ position:"absolute",top:4275,left:4,width:442,fontFamily:"'Dancing Script',cursive",fontSize:"22px",color:"rgba(232,244,232,.92)",textAlign:"center",lineHeight:1.58,textShadow:"0 1px 6px rgba(0,0,0,.38)" }}>{d.quote5}</Rv>

          {/* ══ GALLERY ĐỘNG ══ */}
          <Rv dir="f" style={{ position:"absolute",top:4318,left:0,width:451,height:4,background:"linear-gradient(90deg,#2a4a2a,#5c8a5c,#2a4a2a)" }}/>
          {galleryImgs.length > 0 && (
            <div style={{ position:"absolute",top:4322,left:8,width:435,display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:6 }}>
              {galleryImgs.map((img, i) => (
                <Rv key={i} dir="s" delay={i * 0.06} style={{ overflow:"hidden",cursor:"pointer",boxShadow:"0 4px 18px rgba(0,0,0,.45)" }} onClick={() => openLb(galleryImgs, i)}>
                  <img src={gdrive(img.url)} alt={img.caption || ""} loading="lazy"
                    style={{ width:"100%",height:"180px",objectFit:"cover",display:"block",transition:"transform .6s ease" }}
                    onMouseEnter={e => e.target.style.transform="scale(1.05)"}
                    onMouseLeave={e => e.target.style.transform="scale(1)"}/>
                </Rv>
              ))}
            </div>
          )}

          {/* ══ Ảnh full ══ */}
          <Photo url={d.photo_full} style={{ position:"absolute",top:4318,left:0,width:451,height:668,boxShadow:"none" }} className="rv rs d1"/>

          {/* LOVE chữ 2 bên */}
          <Rv dir="f" delay={0.1} style={{ position:"absolute",top:4998,left:-65,fontSize:"22px",fontFamily:"'Cinzel',serif",fontWeight:600,letterSpacing:".18em",color:"rgba(232,244,232,.18)",transform:"rotate(90deg)" }}>L O V E</Rv>
          <Rv dir="f" delay={0.1} style={{ position:"absolute",top:4998,left:340,fontSize:"22px",fontFamily:"'Cinzel',serif",fontWeight:600,letterSpacing:".18em",color:"rgba(232,244,232,.18)",transform:"rotate(270deg)" }}>L O V E</Rv>

          {/* ══ S8: DARK + MONG ══ */}
          <Rv dir="f" style={{ position:"absolute",top:4978,left:0,width:451,height:4,background:"linear-gradient(90deg,#2a4a2a,#5c8a5c,#2a4a2a)" }}/>
          <div style={{ position:"absolute",top:4982,left:0,width:451,height:250,background:"linear-gradient(145deg,#0c1a0c,#182818)" }}/>
          <Rv dir="u" delay={0.1} style={{ position:"absolute",top:5020,left:55,width:340,fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",color:"rgba(232,244,232,.92)",textAlign:"center",lineHeight:1.58,fontSize:"26px",whiteSpace:"pre-line" }}>{d.mong_text}</Rv>

          {/* ══ S9: RSVP ══ */}
          <Rv dir="f" style={{ position:"absolute",top:5238,left:0,width:451,height:4,background:"linear-gradient(90deg,transparent,#4a7a4a,transparent)" }}/>
          <Rv dir="s" delay={0.1} style={{ position:"absolute",top:5258,left:88,width:275,background:"#fff",border:"1px solid #c0d8c0",borderRadius:"7px",padding:"18px",boxShadow:"0 4px 20px rgba(42,74,42,.14)",zIndex:5 }}>
            <RSVPForm d={d}/>
          </Rv>

          {/* ══ S10: QR / MỪNG CƯỚI ══ */}
          {fl(5590,-82,272,368,12,0.18)}
          <Rv dir="f" style={{ position:"absolute",top:5614,left:0,width:451,height:4,background:"linear-gradient(90deg,#2a4a2a,#5c8a5c,#2a4a2a)" }}/>
          <Rv dir="u" delay={0} style={{ position:"absolute",top:5632,left:26,width:398,height:258,background:"linear-gradient(148deg,#182818,#2d5c3a)" }}/>
          <div style={{ position:"absolute",top:5678,left:178,fontSize:"65px",textAlign:"center",animation:"wobble 2.8s ease-in-out infinite",cursor:"pointer",filter:"drop-shadow(0 3px 9px rgba(0,0,0,.38))",zIndex:2 }}>🎁</div>
          <Rv dir="u" delay={0.1} style={{ position:"absolute",top:5766,left:40,width:370,fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",color:"rgba(220,238,220,.88)",textAlign:"center",lineHeight:1.3,fontSize:"26px",zIndex:2 }}>Hộp quà yêu thương</Rv>

          <Rv dir="u" delay={0.15} style={{ position:"absolute",top:5894,left:0,width:451,background:"linear-gradient(148deg,#0c1a0c,#141e14)",padding:"22px 14px",zIndex:2 }}>
            <p style={{ color:"rgba(200,232,180,.82)",fontSize:"13px",fontFamily:"'Quicksand',sans-serif",fontWeight:600,textAlign:"center",marginBottom:"16px",letterSpacing:".22em",textTransform:"uppercase" }}>✦ MỪNG CƯỚI QUA QR ✦</p>
            <div style={{ display:"flex",gap:"14px",justifyContent:"center" }}>
              {[
                { lbl:"Chú Rể", bank:d.qr_groom_bank, num:d.qr_groom_num, name:d.qr_groom_name, img:d.qr_groom_img },
                { lbl:"Cô Dâu", bank:d.qr_bride_bank, num:d.qr_bride_num, name:d.qr_bride_name, img:d.qr_bride_img },
              ].map(qr => (
                <div key={qr.lbl} style={{ background:"rgba(255,255,255,.07)",border:"1px solid rgba(200,232,180,.22)",borderRadius:8,padding:14,textAlign:"center",flex:1,maxWidth:188 }}>
                  <p style={{ color:"rgba(200,232,180,.72)",fontSize:"9px",letterSpacing:".25em",textTransform:"uppercase",marginBottom:5,fontFamily:"'Quicksand',sans-serif" }}>{qr.lbl}</p>
                  <p style={{ color:"rgba(220,238,220,.88)",fontSize:"10.5px",fontFamily:"'Quicksand',sans-serif",marginBottom:3 }}>{qr.bank}</p>
                  <p style={{ color:"#c4e8a8",fontSize:"13px",fontFamily:"'Cinzel',serif",marginBottom:3 }}>{qr.num}</p>
                  <p style={{ color:"rgba(200,232,180,.62)",fontSize:"9px",fontFamily:"'Quicksand',sans-serif",marginBottom:6 }}>{qr.name}</p>
                  <div style={{ width:112,height:112,margin:"0 auto",background:"#fff",borderRadius:4,display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden" }}>
                    {gdrive(qr.img) ? <img src={gdrive(qr.img)} alt="QR" style={{ width:"100%",height:"100%",objectFit:"contain" }}/> : <span style={{ fontSize:"9px",color:"#999" }}>QR Code</span>}
                  </div>
                </div>
              ))}
            </div>
          </Rv>

          {/* FOOTER */}
          <div style={{ position:"absolute",top:6376,left:0,width:451,background:"#0c1a0c",padding:"16px",textAlign:"center" }}>
            <p style={{ color:"rgba(200,232,180,.32)",fontSize:"10px",fontFamily:"'Quicksand',sans-serif",letterSpacing:".22em" }}>{d.bride} &amp; {d.groom} · {d.wedding_date}</p>
          </div>

        </div>
      </div>

      {/* Lightbox */}
      {lbCur >= 0 && <Lightbox imgs={galleryImgs} cur={lbCur} onClose={closeLb} onNav={navLb}/>}
    </>
  );
}
