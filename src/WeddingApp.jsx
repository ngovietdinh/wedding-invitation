// ============================================================
// WEDDING APP — Cinematic Full-Scroll Style
// Bảo Ngân & Viết Định · 26/04/2026
// Inspired by cinelove.me editorial style
// Palette: Green Sage + White + Black
// ============================================================

import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

// ── Supabase ──
const SB_URL = import.meta.env.VITE_SUPABASE_URL;
const SB_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = SB_URL && SB_KEY ? createClient(SB_URL, SB_KEY) : null;

// ── Wedding data ──
const WD = {
  bride:    "Bảo Ngân",
  groom:    "Viết Định",
  date:     "26.04.2026",
  dateObj:  new Date("2026-04-26T10:00:00"),
  lunar:    "Mùng 9 tháng 3 năm Bính Ngọ",
  time:     "10:00 SA",
  venue:    "Trung tâm tiệc cưới",
  address:  "123 Đường ABC, TP. Huế",
  music:    "", // paste YouTube embed URL hoặc SoundCloud URL ở đây
};

// ── Fonts & CSS toàn cục ──
const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,200;0,300;0,400;0,600;1,200;1,300;1,400;1,600&family=Jost:wght@200;300;400;500&family=Cinzel:wght@400;600&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body {
      background: #0a0f0a;
      color: #f0f0ec;
      font-family: 'Jost', sans-serif;
      overflow-x: hidden;
      -webkit-font-smoothing: antialiased;
    }
    ::-webkit-scrollbar { width: 3px; }
    ::-webkit-scrollbar-track { background: #0a0f0a; }
    ::-webkit-scrollbar-thumb { background: #4A7C59; border-radius: 2px; }
    ::selection { background: #4A7C59; color: #fff; }

    /* ── Typography classes ── */
    .f-serif  { font-family: 'Cormorant Garamond', serif; }
    .f-sans   { font-family: 'Jost', sans-serif; }
    .f-cinzel { font-family: 'Cinzel', serif; }

    /* ── Parallax image ── */
    .parallax-img {
      position: absolute; inset: -15%;
      width: 100%; height: 130%;
      object-fit: cover;
      will-change: transform;
      transition: transform 0.05s linear;
    }

    /* ── Reveal animations ── */
    @keyframes revealUp {
      from { opacity: 0; transform: translateY(48px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes revealLeft {
      from { opacity: 0; transform: translateX(-48px); }
      to   { opacity: 1; transform: translateX(0); }
    }
    @keyframes revealRight {
      from { opacity: 0; transform: translateX(48px); }
      to   { opacity: 1; transform: translateX(0); }
    }
    @keyframes revealScale {
      from { opacity: 0; transform: scale(0.88); }
      to   { opacity: 1; transform: scale(1); }
    }
    @keyframes drawLine {
      from { transform: scaleX(0); transform-origin: left; }
      to   { transform: scaleX(1); transform-origin: left; }
    }
    @keyframes drawLineV {
      from { transform: scaleY(0); transform-origin: top; }
      to   { transform: scaleY(1); transform-origin: top; }
    }
    @keyframes float {
      0%,100% { transform: translateY(0px); }
      50%      { transform: translateY(-8px); }
    }
    @keyframes pulse {
      0%,100% { opacity: 0.6; transform: scale(1); }
      50%      { opacity: 1;   transform: scale(1.05); }
    }
    @keyframes blink {
      0%,100% { opacity: 1; } 50% { opacity: 0; }
    }
    @keyframes kenBurns {
      from { transform: scale(1.08) translate(-1%, -1%); }
      to   { transform: scale(1.0)  translate(0, 0); }
    }
    @keyframes fadeIn {
      from { opacity: 0; } to { opacity: 1; }
    }
    @keyframes slideClip {
      from { clip-path: inset(0 100% 0 0); }
      to   { clip-path: inset(0 0% 0 0); }
    }
    @keyframes countUp {
      from { opacity: 0; transform: translateY(20px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes scrollHint {
      0%,100% { opacity: 0.4; transform: translateX(-50%) translateY(0); }
      50%      { opacity: 0.9; transform: translateX(-50%) translateY(6px); }
    }

    /* ── Section reveal class (JS adds .revealed) ── */
    .reveal-el {
      opacity: 0;
      transition: opacity 0.001s; /* reset before animation */
    }
    .reveal-el.is-visible { opacity: 1; }

    /* ── Music button ── */
    .music-btn {
      position: fixed; top: 1.2rem; right: 1.2rem; z-index: 9999;
      width: 40px; height: 40px; border-radius: 50%;
      background: rgba(10,15,10,0.7);
      border: 1px solid rgba(74,124,89,0.4);
      backdrop-filter: blur(8px);
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; transition: all 0.3s ease;
    }
    .music-btn:hover { border-color: #4A7C59; background: rgba(74,124,89,0.2); }
    .music-icon { display: flex; gap: 2px; align-items: flex-end; height: 14px; }
    .music-bar {
      width: 2.5px; background: #7FA882; border-radius: 1px;
      transform-origin: bottom;
    }
    .music-bar.playing { animation: musicBar 0.8s ease-in-out infinite alternate; }
    .music-bar:nth-child(1) { height: 6px;  animation-delay: 0s; }
    .music-bar:nth-child(2) { height: 10px; animation-delay: 0.15s; }
    .music-bar:nth-child(3) { height: 7px;  animation-delay: 0.3s; }
    .music-bar:nth-child(4) { height: 12px; animation-delay: 0.1s; }
    @keyframes musicBar {
      from { transform: scaleY(0.3); } to { transform: scaleY(1.2); }
    }

    /* ── Scroll indicator ── */
    .scroll-down {
      position: absolute; bottom: 2rem; left: 50%;
      transform: translateX(-50%);
      display: flex; flex-direction: column; align-items: center; gap: 6px;
      animation: scrollHint 2.5s ease-in-out infinite;
      pointer-events: none;
    }

    /* ── RSVP ── */
    .rsvp-input {
      width: 100%; background: transparent;
      border: none; border-bottom: 1px solid rgba(127,168,130,0.4);
      padding: 0.7rem 0; color: #f0f0ec;
      font-family: 'Jost', sans-serif; font-weight: 300; font-size: 0.9rem;
      outline: none; transition: border-color 0.3s;
    }
    .rsvp-input:focus { border-bottom-color: #4A7C59; }
    .rsvp-input::placeholder { color: rgba(240,240,236,0.3); font-size: 0.82rem; }

    /* ── Calendar ── */
    .cal-day {
      width: 100%; aspect-ratio: 1;
      display: flex; align-items: center; justify-content: center;
      font-family: 'Jost', sans-serif; font-weight: 300;
      font-size: clamp(0.6rem, 1.8vw, 0.78rem);
      color: rgba(240,240,236,0.5);
      border-radius: 2px;
      transition: all 0.2s;
    }
    .cal-day.today {
      background: #4A7C59; color: #fff; font-weight: 500;
      box-shadow: 0 0 12px rgba(74,124,89,0.5);
      animation: pulse 2.5s ease-in-out infinite;
    }
    .cal-day.weekend { color: rgba(127,168,130,0.6); }
    .cal-day.other { color: rgba(240,240,236,0.2); }

    /* Nav dots */
    .nav-dots {
      position: fixed; right: 1.2rem; top: 50%;
      transform: translateY(-50%); z-index: 999;
      display: flex; flex-direction: column; gap: 8px;
    }
    .nav-dot {
      width: 6px; height: 6px; border-radius: 50%;
      background: rgba(127,168,130,0.3);
      cursor: pointer; transition: all 0.3s ease;
      border: none; padding: 0;
    }
    .nav-dot.active {
      background: #4A7C59;
      transform: scale(1.5);
      box-shadow: 0 0 6px rgba(74,124,89,0.6);
    }

    @media (max-width: 640px) {
      .nav-dots { display: none; }
      .music-btn { top: 0.8rem; right: 0.8rem; width: 36px; height: 36px; }
    }
  `}</style>
);

// ── Hooks ──
function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, inView };
}

function useParallax(speed = 0.3) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const onScroll = () => {
      const rect = el.parentElement.getBoundingClientRect();
      const img = el;
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      const offset = (rect.top / window.innerHeight) * 100 * speed;
      img.style.transform = `translateY(${offset}px)`;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [speed]);
  return ref;
}

function useCountdown(target) {
  const [t, setT] = useState({ d:0, h:0, m:0, s:0 });
  useEffect(() => {
    const calc = () => {
      const diff = target - new Date();
      if (diff <= 0) return;
      setT({ d:Math.floor(diff/86400000), h:Math.floor(diff%86400000/3600000), m:Math.floor(diff%3600000/60000), s:Math.floor(diff%60000/1000) });
    };
    calc(); const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [target]);
  return t;
}

// ── Animated text helpers ──
function BigText({ children, style, delay = 0, dir = "up", className = "" }) {
  const { ref, inView } = useInView(0.1);
  const anims = { up:"revealUp", left:"revealLeft", right:"revealRight", scale:"revealScale" };
  return (
    <span ref={ref} className={className} style={{
      display: "block",
      opacity: inView ? 1 : 0,
      animation: inView ? `${anims[dir] || "revealUp"} 1.1s cubic-bezier(0.22,1,0.36,1) ${delay}s both` : "none",
      ...style,
    }}>{children}</span>
  );
}

function SplitText({ children, style, delay = 0 }) {
  const { ref, inView } = useInView(0.1);
  const chars = String(children).split("");
  const mid = Math.floor(chars.length / 2);
  return (
    <span ref={ref} style={{ display:"inline-flex", flexWrap:"nowrap", whiteSpace:"pre", ...style }}>
      {chars.map((ch, i) => {
        const fromLeft = i < mid;
        const dist = fromLeft ? (mid - i) : (i - mid + 1);
        return (
          <span key={i} style={{
            display: "inline-block",
            opacity: inView ? 1 : 0,
            transform: inView ? "translateX(0)" : `translateX(${fromLeft ? -dist*4 : dist*4}px)`,
            transition: inView ? `opacity 0.9s ease ${delay + dist*0.03}s, transform 0.9s cubic-bezier(0.22,1,0.36,1) ${delay + dist*0.03}s` : "none",
            whiteSpace: "pre",
          }}>{ch === " " ? "\u00A0" : ch}</span>
        );
      })}
    </span>
  );
}

function LineAnim({ delay = 0, vertical = false, color = "rgba(74,124,89,0.5)", style = {} }) {
  const { ref, inView } = useInView(0.1);
  return (
    <div ref={ref} style={{
      background: color,
      animation: inView ? `${vertical ? "drawLineV" : "drawLine"} 1.2s cubic-bezier(0.22,1,0.36,1) ${delay}s both` : "none",
      opacity: inView ? 1 : 0,
      ...style,
    }}/>
  );
}

function WordReveal({ children, delay = 0, stagger = 0.08, style = {} }) {
  const { ref, inView } = useInView(0.1);
  const words = String(children).split(" ");
  return (
    <span ref={ref} style={{ display:"inline", ...style }}>
      {words.map((w, i) => (
        <span key={i} style={{
          display: "inline-block",
          marginRight: "0.3em",
          opacity: inView ? 1 : 0,
          transform: inView ? "translateY(0)" : "translateY(16px)",
          transition: inView ? `opacity 0.8s ease ${delay+i*stagger}s, transform 0.8s cubic-bezier(0.22,1,0.36,1) ${delay+i*stagger}s` : "none",
        }}>{w}</span>
      ))}
    </span>
  );
}

// ── Music Player ──
function MusicPlayer({ url }) {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef(null);

  // Nếu có URL mp3 trực tiếp
  useEffect(() => {
    if (!url || !url.endsWith(".mp3")) return;
    const audio = new Audio(url);
    audio.loop = true; audio.volume = 0.4;
    audioRef.current = audio;
    return () => { audio.pause(); };
  }, [url]);

  const toggle = () => {
    if (audioRef.current) {
      playing ? audioRef.current.pause() : audioRef.current.play();
      setPlaying(!playing);
    } else {
      setPlaying(!playing); // visual only nếu không có audio
    }
  };

  return (
    <button className="music-btn" onClick={toggle} title={playing ? "Tắt nhạc" : "Bật nhạc"}>
      <div className="music-icon">
        {[0,1,2,3].map(i => (
          <div key={i} className={`music-bar${playing ? " playing" : ""}`}
            style={{ animationDelay:`${i*0.12}s` }}/>
        ))}
      </div>
    </button>
  );
}

// ── Nav Dots ──
function NavDots({ sections, active }) {
  return (
    <div className="nav-dots">
      {sections.map((s, i) => (
        <button key={i} className={`nav-dot${i === active ? " active" : ""}`}
          onClick={() => document.getElementById(s.id)?.scrollIntoView({ behavior:"smooth" })}
          title={s.label}/>
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════
// SECTIONS
// ══════════════════════════════════════════════

// S1 — HERO / WELCOME
function SectionHero() {
  const parallax = useParallax(0.25);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { const t = setTimeout(() => setLoaded(true), 200); return () => clearTimeout(t); }, []);

  const fu = (d) => ({
    opacity: loaded ? 1 : 0,
    transform: loaded ? "translateY(0)" : "translateY(30px)",
    transition: `opacity 1.1s ease ${d}s, transform 1.1s cubic-bezier(0.22,1,0.36,1) ${d}s`,
  });

  return (
    <section id="s-hero" style={{ position:"relative", height:"100vh", display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden", background:"#0a0f0a" }}>
      {/* BG image */}
      <img ref={parallax} src="/gallery/couple-01.jpg" alt="" className="parallax-img"
        style={{ animation:"kenBurns 18s ease-in-out infinite alternate" }}
        onError={e=>e.target.style.display="none"}/>
      {/* Overlays */}
      <div style={{ position:"absolute", inset:0, background:"linear-gradient(180deg,rgba(10,15,10,0.55) 0%,rgba(10,15,10,0.3) 40%,rgba(10,15,10,0.65) 100%)" }}/>
      <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at center, transparent 30%, rgba(10,15,10,0.4) 100%)" }}/>

      {/* Content */}
      <div style={{ position:"relative", zIndex:2, textAlign:"center", padding:"0 1.5rem" }}>
        <p style={{ ...fu(0.2), fontFamily:"'Jost',sans-serif", fontWeight:200, fontSize:"clamp(0.55rem,1.5vw,0.7rem)", letterSpacing:"0.55em", textTransform:"uppercase", color:"rgba(127,168,130,0.8)", marginBottom:"2rem" }}>
          Welcome to our wedding
        </p>

        <p style={{ ...fu(0.35), fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontWeight:200, fontSize:"clamp(1rem,3vw,1.4rem)", color:"rgba(240,240,236,0.65)", marginBottom:"1.5rem", lineHeight:1.7 }}>
          I love three things in this world.<br/>
          <em>Sun, moon and you.</em>
        </p>

        <div style={{ ...fu(0.5), marginBottom:"1rem" }}>
          <p style={{ fontFamily:"'Cinzel',serif", fontWeight:400, fontSize:"clamp(2.5rem,10vw,7rem)", color:"#fff", lineHeight:1, letterSpacing:"0.08em", textShadow:"0 0 60px rgba(74,124,89,0.3)" }}>
            BẢO NGÂN
          </p>
        </div>

        <div style={{ ...fu(0.6), display:"flex", alignItems:"center", justifyContent:"center", gap:"1.5rem", marginBottom:"1rem" }}>
          <div style={{ width:"60px", height:"1px", background:"linear-gradient(90deg,transparent,rgba(127,168,130,0.6))" }}/>
          <span style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:"1.8rem", color:"rgba(127,168,130,0.8)" }}>&amp;</span>
          <div style={{ width:"60px", height:"1px", background:"linear-gradient(90deg,rgba(127,168,130,0.6),transparent)" }}/>
        </div>

        <div style={{ ...fu(0.7), marginBottom:"2.5rem" }}>
          <p style={{ fontFamily:"'Cinzel',serif", fontWeight:400, fontSize:"clamp(2.5rem,10vw,7rem)", color:"#fff", lineHeight:1, letterSpacing:"0.08em", textShadow:"0 0 60px rgba(74,124,89,0.3)" }}>
            VIẾT ĐỊNH
          </p>
        </div>

        <div style={{ ...fu(0.85) }}>
          <p style={{ fontFamily:"'Jost',sans-serif", fontWeight:200, fontSize:"clamp(0.6rem,1.5vw,0.75rem)", letterSpacing:"0.45em", textTransform:"uppercase", color:"rgba(127,168,130,0.7)" }}>
            {WD.date} &nbsp;·&nbsp; WEDDING INVITATION
          </p>
        </div>
      </div>

      {/* Scroll hint */}
      <div className="scroll-down">
        <p style={{ fontFamily:"'Jost',sans-serif", fontWeight:200, fontSize:"0.5rem", letterSpacing:"0.4em", textTransform:"uppercase", color:"rgba(127,168,130,0.5)" }}>Scroll</p>
        <svg width="16" height="24" viewBox="0 0 16 24" fill="none">
          <rect x="6" y="1" width="4" height="8" rx="2" stroke="rgba(127,168,130,0.5)" strokeWidth="1"/>
          <circle cx="8" cy="5" r="1.5" fill="rgba(127,168,130,0.6)" style={{ animation:"scrollDot 1.5s ease-in-out infinite" }}/>
          <path d="M4 16 L8 20 L12 16" stroke="rgba(127,168,130,0.5)" strokeWidth="1" strokeLinecap="round"/>
        </svg>
        <style>{`@keyframes scrollDot{0%{opacity:1;transform:translateY(0)}100%{opacity:0;transform:translateY(6px)}}`}</style>
      </div>
    </section>
  );
}

// S2 — WE GOT MARRIED
function SectionWedding() {
  const parallax = useParallax(0.2);
  return (
    <section id="s-wedding" style={{ position:"relative", height:"100vh", display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden" }}>
      <img ref={parallax} src="/gallery/couple-02.jpg" alt="" className="parallax-img" onError={e=>e.target.style.display="none"}/>
      <div style={{ position:"absolute", inset:0, background:"rgba(10,15,10,0.72)" }}/>
      <div style={{ position:"absolute", inset:0, background:"linear-gradient(135deg,rgba(26,58,40,0.4) 0%,transparent 60%,rgba(10,15,10,0.5) 100%)" }}/>

      <div style={{ position:"relative", zIndex:2, textAlign:"center", padding:"0 1.5rem", maxWidth:"800px" }}>
        <BigText delay={0} style={{ fontFamily:"'Jost',sans-serif", fontWeight:200, fontSize:"clamp(0.55rem,1.4vw,0.68rem)", letterSpacing:"0.5em", textTransform:"uppercase", color:"rgba(127,168,130,0.7)", marginBottom:"2rem" }}>
          We got married
        </BigText>

        <LineAnim delay={0.1} style={{ width:"1px", height:"60px", margin:"0 auto 2rem", background:"rgba(127,168,130,0.4)" }} vertical/>

        <BigText delay={0.2} dir="scale" style={{ fontFamily:"'Cinzel',serif", fontWeight:600, fontSize:"clamp(3rem,12vw,9rem)", color:"#fff", lineHeight:0.9, letterSpacing:"0.05em", marginBottom:"1.5rem" }}>
          WEDDING
        </BigText>

        <BigText delay={0.35} style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontWeight:200, fontSize:"clamp(1.2rem,4vw,2.5rem)", color:"rgba(240,240,236,0.75)", marginBottom:"2rem" }}>
          INVITATION
        </BigText>

        <LineAnim delay={0.45} style={{ width:"120px", height:"1px", margin:"0 auto 2rem", background:"rgba(127,168,130,0.4)" }}/>

        <WordReveal delay={0.5} stagger={0.06} style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:"clamp(0.9rem,2.5vw,1.2rem)", color:"rgba(240,240,236,0.6)", lineHeight:1.9, display:"block" }}>
          To Our Family And Friends, Thank You For Celebrating Our Special Day, Supporting Us And Sharing Our Love.
        </WordReveal>

        <BigText delay={0.8} style={{ fontFamily:"'Jost',sans-serif", fontWeight:200, fontSize:"clamp(0.52rem,1.3vw,0.65rem)", letterSpacing:"0.4em", textTransform:"uppercase", color:"rgba(127,168,130,0.55)", marginTop:"2rem" }}>
          Right love · Right reason · Right for you
        </BigText>
      </div>
    </section>
  );
}

// S3 — OUR LOVE STORY (text heavy, dark bg)
function SectionStory() {
  return (
    <section id="s-story" style={{ position:"relative", minHeight:"100vh", background:"#0d150e", display:"flex", alignItems:"center", justifyContent:"center", padding:"6rem 1.5rem", overflow:"hidden" }}>
      {/* Decorative bg text */}
      <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", fontFamily:"'Cinzel',serif", fontSize:"clamp(8rem,25vw,20rem)", color:"rgba(74,124,89,0.04)", whiteSpace:"nowrap", pointerEvents:"none", userSelect:"none", letterSpacing:"0.1em" }}>
        LOVE
      </div>

      <div style={{ position:"relative", zIndex:2, maxWidth:"820px", width:"100%", textAlign:"center" }}>
        <BigText delay={0} style={{ fontFamily:"'Jost',sans-serif", fontWeight:200, fontSize:"clamp(0.52rem,1.3vw,0.65rem)", letterSpacing:"0.5em", textTransform:"uppercase", color:"rgba(127,168,130,0.6)", marginBottom:"1.5rem" }}>
          Our Love Story
        </BigText>

        <LineAnim delay={0.1} style={{ width:"60px", height:"1px", margin:"0 auto 3rem", background:"rgba(74,124,89,0.5)" }}/>

        <BigText delay={0.15} dir="scale" style={{ fontFamily:"'Cinzel',serif", fontWeight:400, fontSize:"clamp(2rem,8vw,6rem)", color:"#fff", lineHeight:0.95, letterSpacing:"0.08em", marginBottom:"1rem" }}>
          FALL IN
        </BigText>
        <BigText delay={0.25} dir="scale" style={{ fontFamily:"'Cinzel',serif", fontWeight:600, fontSize:"clamp(2rem,8vw,6rem)", color:"#4A7C59", lineHeight:0.95, letterSpacing:"0.08em", marginBottom:"3rem" }}>
          LOVE
        </BigText>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"3rem 4rem", textAlign:"left", marginBottom:"4rem" }}>
          {[
            { year:"2019", title:"Lần đầu gặp nhau", text:"Không ai trong chúng tôi nghĩ đó là điểm khởi đầu. Chỉ là một buổi chiều bình thường — cho đến khi nhìn lại." },
            { year:"2020", title:"Những tin nhắn nửa đêm", text:"Thế giới bỗng chậm lại. Và trong khoảng lặng yên đó, hai người tìm thấy nhau nhiều hơn." },
            { year:"2022", title:"Chuyến đi thay đổi tất cả", text:"Đà Nẵng, 5 giờ sáng, bên bờ biển không nói gì. Từ đây sẽ không đi một mình nữa." },
            { year:"2024", title:"Anh hỏi. Em gật đầu.", text:"Không có đám đông. Chỉ có một câu hỏi chân thành và câu trả lời đã biết từ trước — bằng trái tim." },
          ].map((item, i) => (
            <BigText key={i} delay={0.1 + i*0.12} dir={i%2===0?"left":"right"} style={{ display:"block" }}>
              <div>
                <p style={{ fontFamily:"'Cormorant Garamond',serif", fontWeight:300, fontSize:"clamp(2rem,5vw,3.5rem)", color:"rgba(74,124,89,0.25)", lineHeight:1, marginBottom:"0.3rem" }}>{item.year}</p>
                <p style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontWeight:400, fontSize:"clamp(0.9rem,2vw,1.1rem)", color:"rgba(240,240,236,0.9)", marginBottom:"0.6rem" }}>{item.title}</p>
                <p style={{ fontFamily:"'Jost',sans-serif", fontWeight:200, fontSize:"clamp(0.65rem,1.5vw,0.78rem)", color:"rgba(240,240,236,0.45)", lineHeight:1.9 }}>{item.text}</p>
              </div>
            </BigText>
          ))}
        </div>

        <WordReveal delay={0.2} stagger={0.05} style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:"clamp(1.1rem,3vw,1.6rem)", color:"rgba(240,240,236,0.7)", lineHeight:1.8, display:"block" }}>
          Mong rằng khi ngoảnh lại, ta vẫn có nhau. Cùng nắm tay đi đến bạc đầu.
        </WordReveal>
      </div>
    </section>
  );
}

// S4 — PHOTO POEM SECTION (full screen image + quote)
function SectionPoem() {
  const parallax = useParallax(0.18);
  return (
    <section id="s-poem" style={{ position:"relative", height:"100vh", display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden" }}>
      <img ref={parallax} src="/gallery/couple-03.jpg" alt="" className="parallax-img" onError={e=>e.target.style.display="none"}/>
      <div style={{ position:"absolute", inset:0, background:"linear-gradient(180deg,rgba(10,15,10,0.3) 0%,rgba(10,15,10,0.6) 50%,rgba(10,15,10,0.85) 100%)" }}/>

      <div style={{ position:"relative", zIndex:2, textAlign:"center", padding:"0 1.5rem", maxWidth:"700px" }}>
        <BigText delay={0} dir="scale" style={{ fontFamily:"'Cinzel',serif", fontWeight:400, fontSize:"clamp(1.5rem,6vw,5rem)", color:"rgba(255,255,255,0.12)", letterSpacing:"0.15em", marginBottom:"2rem", lineHeight:1 }}>
          FOREVER AND EVER
        </BigText>

        <BigText delay={0.2} style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontWeight:200, fontSize:"clamp(1rem,3vw,1.5rem)", color:"rgba(240,240,236,0.85)", lineHeight:1.85, marginBottom:"1.5rem" }}>
          Núi biếc rừng xanh vang vọng tiếng lòng,<br/>
          Giữa thế gian rộng lớn, người chung nhịp<br/>
          vẫn tìm thấy nhau.
        </BigText>

        <LineAnim delay={0.5} style={{ width:"80px", height:"1px", margin:"0 auto 1.5rem", background:"rgba(127,168,130,0.5)" }}/>

        <BigText delay={0.6} style={{ fontFamily:"'Jost',sans-serif", fontWeight:200, fontSize:"clamp(0.52rem,1.3vw,0.65rem)", letterSpacing:"0.45em", textTransform:"uppercase", color:"rgba(127,168,130,0.6)" }}>
          Love and freedom · You and gentleness
        </BigText>
      </div>
    </section>
  );
}

// S5 — WEDDING INFO + CALENDAR + COUNTDOWN
function SectionInfo() {
  const countdown = useCountdown(WD.dateObj);
  const { ref: secRef, inView } = useInView(0.05);

  // Calendar
  const month = 4; const year = 2026; const weddingDay = 26;
  const firstDay = new Date(year, month-1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const weeks = ["CN","T2","T3","T4","T5","T6","T7"];
  const cells = [];
  for (let i=0; i<firstDay; i++) cells.push(null);
  for (let i=1; i<=daysInMonth; i++) cells.push(i);
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <section id="s-info" ref={secRef} style={{ position:"relative", minHeight:"100vh", background:"#080d08", display:"flex", alignItems:"center", justifyContent:"center", padding:"6rem 1.5rem", overflow:"hidden" }}>
      {/* Decorative */}
      <div style={{ position:"absolute", top:0, left:0, right:0, height:"1px", background:"linear-gradient(90deg,transparent,rgba(74,124,89,0.4),transparent)" }}/>
      <div style={{ position:"absolute", bottom:0, left:0, right:0, height:"1px", background:"linear-gradient(90deg,transparent,rgba(74,124,89,0.4),transparent)" }}/>

      <div style={{ maxWidth:"900px", width:"100%", position:"relative", zIndex:2 }}>
        {/* Header */}
        <div style={{ textAlign:"center", marginBottom:"4rem" }}>
          <BigText delay={0} style={{ fontFamily:"'Jost',sans-serif", fontWeight:200, fontSize:"clamp(0.52rem,1.3vw,0.65rem)", letterSpacing:"0.5em", textTransform:"uppercase", color:"rgba(127,168,130,0.6)", marginBottom:"1.5rem" }}>
            Wedding Information
          </BigText>
          <BigText delay={0.1} dir="scale" style={{ fontFamily:"'Cinzel',serif", fontWeight:400, fontSize:"clamp(2rem,7vw,5rem)", color:"#fff", letterSpacing:"0.08em", lineHeight:1 }}>
            05.20
          </BigText>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1px 1fr", gap:"0 3rem", alignItems:"start" }}>
          {/* Calendar */}
          <div>
            <BigText delay={0.15} style={{ fontFamily:"'Jost',sans-serif", fontWeight:200, fontSize:"clamp(0.5rem,1.2vw,0.6rem)", letterSpacing:"0.4em", textTransform:"uppercase", color:"rgba(127,168,130,0.55)", marginBottom:"1.5rem", textAlign:"center", display:"block" }}>
              Tháng 4 · 2026
            </BigText>
            {/* Week header */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:"2px", marginBottom:"4px" }}>
              {weeks.map(w => (
                <div key={w} style={{ textAlign:"center", fontFamily:"'Jost',sans-serif", fontWeight:300, fontSize:"clamp(0.48rem,1.1vw,0.58rem)", color:"rgba(127,168,130,0.5)", padding:"4px 0", letterSpacing:"0.05em" }}>{w}</div>
              ))}
            </div>
            {/* Calendar grid */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:"2px" }}>
              {cells.map((d, i) => (
                <div key={i} className={`cal-day${d===weddingDay?" today":""}${d && [0,6].includes(i%7)?" weekend":""}${!d?" other":""}`}>
                  {d || ""}
                </div>
              ))}
            </div>
            {/* Heart on wedding day */}
            <div style={{ textAlign:"center", marginTop:"1rem" }}>
              <span style={{ fontSize:"1.2rem", animation:"float 3s ease-in-out infinite" }}>♥</span>
            </div>
          </div>

          {/* Divider */}
          <LineAnim delay={0.2} vertical style={{ width:"1px", minHeight:"300px", background:"rgba(74,124,89,0.2)", margin:"0 auto" }}/>

          {/* Info + Countdown */}
          <div style={{ display:"flex", flexDirection:"column", gap:"2rem" }}>
            {/* Info */}
            <BigText delay={0.2} style={{ display:"block" }}>
              <div style={{ display:"flex", flexDirection:"column", gap:"1.2rem" }}>
                {[
                  { icon:"◷", label:"Thời gian", val:WD.time },
                  { icon:"◎", label:"Địa điểm", val:WD.venue },
                  { icon:"◈", label:"Địa chỉ", val:WD.address },
                  { icon:"☽", label:"Âm lịch", val:WD.lunar },
                ].map(item => (
                  <div key={item.label} style={{ display:"flex", gap:"1rem", alignItems:"flex-start" }}>
                    <span style={{ color:"#4A7C59", fontSize:"0.8rem", marginTop:"0.1rem", flexShrink:0 }}>{item.icon}</span>
                    <div>
                      <p style={{ fontFamily:"'Jost',sans-serif", fontWeight:200, fontSize:"0.55rem", letterSpacing:"0.3em", textTransform:"uppercase", color:"rgba(127,168,130,0.5)", marginBottom:"0.2rem" }}>{item.label}</p>
                      <p style={{ fontFamily:"'Cormorant Garamond',serif", fontWeight:300, fontSize:"clamp(0.85rem,2vw,1rem)", color:"rgba(240,240,236,0.85)" }}>{item.val}</p>
                    </div>
                  </div>
                ))}
              </div>
            </BigText>

            {/* Countdown */}
            <BigText delay={0.35} style={{ display:"block" }}>
              <p style={{ fontFamily:"'Jost',sans-serif", fontWeight:200, fontSize:"0.55rem", letterSpacing:"0.35em", textTransform:"uppercase", color:"rgba(127,168,130,0.5)", marginBottom:"1rem" }}>Đếm ngược</p>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"0.5rem", textAlign:"center" }}>
                {[
                  { v:countdown.d, l:"Ngày" },
                  { v:countdown.h, l:"Giờ" },
                  { v:countdown.m, l:"Phút" },
                  { v:countdown.s, l:"Giây" },
                ].map(item => (
                  <div key={item.l} style={{ border:"1px solid rgba(74,124,89,0.2)", padding:"0.8rem 0.3rem", position:"relative" }}>
                    <div style={{ position:"absolute", top:"3px", left:"3px", width:"5px", height:"5px", borderTop:"1px solid rgba(74,124,89,0.4)", borderLeft:"1px solid rgba(74,124,89,0.4)" }}/>
                    <div style={{ position:"absolute", bottom:"3px", right:"3px", width:"5px", height:"5px", borderBottom:"1px solid rgba(74,124,89,0.4)", borderRight:"1px solid rgba(74,124,89,0.4)" }}/>
                    <p style={{ fontFamily:"'Cormorant Garamond',serif", fontWeight:300, fontSize:"clamp(1.3rem,4vw,2rem)", color:"#fff", lineHeight:1 }}>
                      {String(item.v??0).padStart(2,"0")}
                    </p>
                    <p style={{ fontFamily:"'Jost',sans-serif", fontWeight:200, fontSize:"0.48rem", letterSpacing:"0.25em", textTransform:"uppercase", color:"rgba(127,168,130,0.55)", marginTop:"0.3rem" }}>
                      {item.l}
                    </p>
                  </div>
                ))}
              </div>
            </BigText>
          </div>
        </div>

        {/* Bottom quote */}
        <div style={{ textAlign:"center", marginTop:"4rem" }}>
          <LineAnim delay={0.4} style={{ width:"80px", height:"1px", margin:"0 auto 2rem", background:"rgba(74,124,89,0.35)" }}/>
          <WordReveal delay={0.3} stagger={0.06} style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:"clamp(1rem,2.5vw,1.3rem)", color:"rgba(240,240,236,0.55)", lineHeight:1.8, display:"block" }}>
            Ánh trời bừng sáng, rơi vào chốn nhân gian. Ta vượt ngàn sông núi, chỉ để cùng em đi qua bốn mùa.
          </WordReveal>
        </div>
      </div>
    </section>
  );
}

// S6 — GALLERY MOSAIC
function SectionGallery() {
  const [lbOpen, setLbOpen] = useState(null);
  const imgs = [
    "/gallery/couple-01.jpg","/gallery/couple-02.jpg","/gallery/couple-03.jpg",
    "/gallery/engagement-01.jpg","/gallery/engagement-02.jpg","/gallery/wedding-01.jpg",
    "/gallery/wedding-02.jpg","/gallery/wedding-03.jpg","/gallery/engagement-03.jpg",
  ];
  // Mosaic layout: tall-square-wide pattern
  const layout = ["tall","square","wide","square","tall","square","wide","square","square"];

  return (
    <section id="s-gallery" style={{ position:"relative", background:"#0a0f0a", padding:"6rem 1.5rem", overflow:"hidden" }}>
      <div style={{ maxWidth:"960px", margin:"0 auto" }}>
        {/* Header */}
        <div style={{ textAlign:"center", marginBottom:"3rem" }}>
          <BigText delay={0} style={{ fontFamily:"'Jost',sans-serif", fontWeight:200, fontSize:"clamp(0.52rem,1.3vw,0.65rem)", letterSpacing:"0.5em", textTransform:"uppercase", color:"rgba(127,168,130,0.6)", marginBottom:"1rem" }}>
            Our memories
          </BigText>
          <SplitText style={{ fontFamily:"'Cinzel',serif", fontWeight:400, fontSize:"clamp(2rem,7vw,5rem)", color:"#fff", letterSpacing:"0.08em", display:"block" }} delay={0.1}>
            LOVE STORY
          </SplitText>
        </div>

        {/* Masonry grid */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gridAutoRows:"180px", gap:"6px" }}>
          {imgs.map((src, i) => {
            const l = layout[i] || "square";
            return (
              <BigText key={i} delay={i*0.06} dir="scale" style={{
                gridRow:   l==="tall"  ?"span 2":"span 1",
                gridColumn:l==="wide"  ?"span 2":"span 1",
                position:"relative", overflow:"hidden",
                cursor:"pointer",
              }}>
                <div style={{ position:"relative", width:"100%", height:"100%", overflow:"hidden" }}
                  onClick={()=>setLbOpen(i)}>
                  <img src={src} alt="" style={{ width:"100%", height:"100%", objectFit:"cover", transition:"transform 0.7s cubic-bezier(0.23,1,0.32,1)", display:"block" }}
                    onMouseEnter={e=>e.currentTarget.style.transform="scale(1.08)"}
                    onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}
                    onError={e=>{ e.target.style.display="none"; e.target.parentElement.style.background="#1a2a1a"; }}/>
                  <div style={{ position:"absolute", inset:0, background:"rgba(10,15,10,0)", transition:"background 0.35s", display:"flex", alignItems:"center", justifyContent:"center" }}
                    onMouseEnter={e=>e.currentTarget.style.background="rgba(10,15,10,0.35)"}
                    onMouseLeave={e=>e.currentTarget.style.background="rgba(10,15,10,0)"}>
                    <span style={{ color:"rgba(255,255,255,0)", fontSize:"1.2rem", transition:"color 0.3s" }}
                      onMouseEnter={e=>e.currentTarget.style.color="rgba(255,255,255,0.8)"}
                      onMouseLeave={e=>e.currentTarget.style.color="rgba(255,255,255,0)"}>⤢</span>
                  </div>
                </div>
              </BigText>
            );
          })}
        </div>

        {/* Lightbox */}
        {lbOpen !== null && (
          <div style={{ position:"fixed", inset:0, zIndex:9999, background:"rgba(5,10,5,0.96)", backdropFilter:"blur(12px)", display:"flex", alignItems:"center", justifyContent:"center" }} onClick={()=>setLbOpen(null)}>
            <img src={imgs[lbOpen]} alt="" style={{ maxWidth:"90vw", maxHeight:"90vh", objectFit:"contain" }} onClick={e=>e.stopPropagation()}/>
            <button onClick={()=>setLbOpen((lbOpen-1+imgs.length)%imgs.length)} style={{ position:"absolute", left:"1rem", top:"50%", transform:"translateY(-50%)", background:"rgba(74,124,89,0.15)", border:"1px solid rgba(127,168,130,0.25)", color:"rgba(240,240,236,0.8)", fontSize:"2rem", width:"50px", height:"70px", cursor:"pointer", fontFamily:"serif" }}>‹</button>
            <button onClick={()=>setLbOpen((lbOpen+1)%imgs.length)} style={{ position:"absolute", right:"1rem", top:"50%", transform:"translateY(-50%)", background:"rgba(74,124,89,0.15)", border:"1px solid rgba(127,168,130,0.25)", color:"rgba(240,240,236,0.8)", fontSize:"2rem", width:"50px", height:"70px", cursor:"pointer", fontFamily:"serif" }}>›</button>
            <button onClick={()=>setLbOpen(null)} style={{ position:"absolute", top:"1rem", right:"1rem", background:"transparent", border:"1px solid rgba(127,168,130,0.3)", color:"rgba(240,240,236,0.6)", fontSize:"0.6rem", letterSpacing:"0.3em", textTransform:"uppercase", padding:"0.4rem 0.9rem", cursor:"pointer", fontFamily:"'Jost',sans-serif", fontWeight:300 }}>ESC ✕</button>
          </div>
        )}
      </div>
    </section>
  );
}

// S7 — RSVP
function SectionRSVP() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name:"", attending:null, guests:1, message:"" });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(null);

  const submit = async () => {
    if (!supabase) { setError("Chưa kết nối database."); return; }
    setSubmitting(true);
    try {
      const { error: e } = await supabase.from("rsvp_responses").insert({
        name: form.name, attending: form.attending,
        guests_count: form.attending ? form.guests : 0,
        message: form.message || null,
      });
      if (e) throw e;
      setDone(true);
    } catch(err) { setError(err.message); }
    finally { setSubmitting(false); }
  };

  const parallax = useParallax(0.15);

  return (
    <section id="s-rsvp" style={{ position:"relative", minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden", padding:"6rem 1.5rem" }}>
      <img ref={parallax} src="/gallery/wedding-01.jpg" alt="" className="parallax-img" onError={e=>e.target.style.display="none"}/>
      <div style={{ position:"absolute", inset:0, background:"rgba(5,10,5,0.88)" }}/>
      <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at center, rgba(26,58,40,0.2) 0%, transparent 70%)" }}/>

      <div style={{ position:"relative", zIndex:2, maxWidth:"500px", width:"100%", textAlign:"center" }}>
        <BigText delay={0} style={{ fontFamily:"'Jost',sans-serif", fontWeight:200, fontSize:"clamp(0.52rem,1.3vw,0.65rem)", letterSpacing:"0.5em", textTransform:"uppercase", color:"rgba(127,168,130,0.6)", marginBottom:"1rem" }}>
          Xác nhận tham dự
        </BigText>

        <SplitText style={{ fontFamily:"'Cinzel',serif", fontWeight:400, fontSize:"clamp(2.5rem,8vw,5rem)", color:"#fff", letterSpacing:"0.08em", display:"block", marginBottom:"0.5rem" }} delay={0.1}>
          RSVP
        </SplitText>

        <BigText delay={0.2} style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontWeight:200, fontSize:"clamp(0.85rem,2vw,1rem)", color:"rgba(240,240,236,0.5)", marginBottom:"3rem" }}>
          Vui lòng xác nhận trước <em>15 tháng Tư, 2026</em>
        </BigText>

        {done ? (
          <BigText delay={0} dir="scale" style={{ display:"block" }}>
            <div style={{ border:"1px solid rgba(74,124,89,0.3)", padding:"3rem 2rem" }}>
              <p style={{ fontSize:"2rem", marginBottom:"1rem" }}>{form.attending?"🥂":"💌"}</p>
              <p style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:"1.5rem", color:"#fff", marginBottom:"1rem" }}>
                {form.attending ? "Hẹn gặp bạn nhé!" : "Cảm ơn bạn!"}
              </p>
              <p style={{ fontFamily:"'Jost',sans-serif", fontWeight:200, fontSize:"0.78rem", color:"rgba(240,240,236,0.5)", lineHeight:1.8 }}>
                {form.attending
                  ? `${form.name}, chúng tôi rất vui khi biết bạn sẽ đến!`
                  : `${form.name}, lời chúc của bạn là điều chúng tôi trân trọng nhất.`}
              </p>
            </div>
          </BigText>
        ) : (
          <div style={{ border:"1px solid rgba(74,124,89,0.2)", padding:"2.5rem", background:"rgba(10,20,10,0.6)", backdropFilter:"blur(8px)" }}>
            {/* Progress */}
            <div style={{ height:"1px", background:"rgba(74,124,89,0.15)", marginBottom:"2rem" }}>
              <div style={{ height:"100%", background:"#4A7C59", width:`${(step/4)*100}%`, transition:"width 0.5s ease" }}/>
            </div>

            {step===1 && (
              <div style={{ display:"flex", flexDirection:"column", gap:"1.5rem" }}>
                <p style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:"1.2rem", color:"rgba(240,240,236,0.8)" }}>Bạn là ai trong cuộc đời chúng tôi?</p>
                <input className="rsvp-input" value={form.name} placeholder="Tên của bạn..."
                  onChange={e=>setForm(p=>({...p,name:e.target.value}))}
                  onKeyDown={e=>e.key==="Enter"&&form.name.trim()&&setStep(2)}/>
                <button onClick={()=>form.name.trim()&&setStep(2)} disabled={!form.name.trim()}
                  style={{ background:"transparent", border:"1px solid rgba(74,124,89,0.4)", color:"rgba(127,168,130,0.8)", fontFamily:"'Jost',sans-serif", fontWeight:300, fontSize:"0.62rem", letterSpacing:"0.3em", textTransform:"uppercase", padding:"0.8rem 2rem", cursor:"pointer", transition:"all 0.25s", opacity:form.name.trim()?1:0.4 }}>
                  Tiếp theo →
                </button>
              </div>
            )}

            {step===2 && (
              <div style={{ display:"flex", flexDirection:"column", gap:"1.5rem" }}>
                <p style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:"1.2rem", color:"rgba(240,240,236,0.8)" }}>{form.name}, có thể đến không?</p>
                <div style={{ display:"flex", gap:"1rem", justifyContent:"center" }}>
                  {[{l:"🥂 Tôi sẽ có mặt",v:true},{l:"💌 Rất tiếc",v:false}].map(opt=>(
                    <button key={String(opt.v)} onClick={()=>{ setForm(p=>({...p,attending:opt.v})); setStep(opt.v?3:4); }}
                      style={{ flex:1, padding:"0.9rem", background:form.attending===opt.v?"rgba(74,124,89,0.3)":"transparent", border:`1px solid ${form.attending===opt.v?"#4A7C59":"rgba(74,124,89,0.25)"}`, color:"rgba(240,240,236,0.8)", fontFamily:"'Jost',sans-serif", fontWeight:300, fontSize:"0.68rem", letterSpacing:"0.1em", cursor:"pointer", transition:"all 0.25s" }}>
                      {opt.l}
                    </button>
                  ))}
                </div>
                <button onClick={()=>setStep(1)} style={{ background:"transparent", border:"none", color:"rgba(127,168,130,0.5)", fontFamily:"'Jost',sans-serif", fontWeight:200, fontSize:"0.62rem", letterSpacing:"0.2em", cursor:"pointer" }}>← Quay lại</button>
              </div>
            )}

            {step===3 && (
              <div style={{ display:"flex", flexDirection:"column", gap:"1.5rem" }}>
                <p style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:"1.2rem", color:"rgba(240,240,236,0.8)" }}>Bạn đến cùng mấy người?</p>
                <div style={{ display:"flex", alignItems:"center", gap:"1.2rem", justifyContent:"center" }}>
                  <button onClick={()=>setForm(p=>({...p,guests:Math.max(1,p.guests-1)}))
                  } style={{ width:"38px", height:"38px", border:"1px solid rgba(74,124,89,0.3)", background:"transparent", color:"rgba(127,168,130,0.8)", fontSize:"1.2rem", cursor:"pointer" }}>−</button>
                  <span style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"2.5rem", fontWeight:300, color:"#fff", minWidth:"2ch", textAlign:"center" }}>{form.guests}</span>
                  <button onClick={()=>setForm(p=>({...p,guests:Math.min(10,p.guests+1)}))} style={{ width:"38px", height:"38px", border:"1px solid rgba(74,124,89,0.3)", background:"transparent", color:"rgba(127,168,130,0.8)", fontSize:"1.2rem", cursor:"pointer" }}>+</button>
                </div>
                <button onClick={()=>setStep(4)} style={{ background:"transparent", border:"1px solid rgba(74,124,89,0.4)", color:"rgba(127,168,130,0.8)", fontFamily:"'Jost',sans-serif", fontWeight:300, fontSize:"0.62rem", letterSpacing:"0.3em", textTransform:"uppercase", padding:"0.8rem 2rem", cursor:"pointer" }}>Tiếp theo →</button>
                <button onClick={()=>setStep(2)} style={{ background:"transparent", border:"none", color:"rgba(127,168,130,0.5)", fontFamily:"'Jost',sans-serif", fontWeight:200, fontSize:"0.62rem", letterSpacing:"0.2em", cursor:"pointer" }}>← Quay lại</button>
              </div>
            )}

            {step===4 && (
              <div style={{ display:"flex", flexDirection:"column", gap:"1.5rem" }}>
                <p style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:"1.2rem", color:"rgba(240,240,236,0.8)" }}>{form.attending?"Lời chúc gửi đến chúng tôi?":"Lời nhắn muốn gửi?"}</p>
                <div style={{ position:"relative" }}>
                  <textarea className="rsvp-input" value={form.message} rows={4}
                    placeholder={form.attending?"Chúc hai bạn trăm năm hạnh phúc...":"Chúc mừng ngày vui của hai bạn..."}
                    onChange={e=>setForm(p=>({...p,message:e.target.value.slice(0,300)}))}
                    style={{ resize:"none", display:"block" }}/>
                  <span style={{ position:"absolute", bottom:"0.4rem", right:"0", fontFamily:"'Jost',sans-serif", fontWeight:200, fontSize:"0.55rem", color:"rgba(127,168,130,0.4)" }}>{form.message.length}/300</span>
                </div>
                {error&&<p style={{ color:"#e57373", fontSize:"0.72rem", fontFamily:"'Jost',sans-serif" }}>{error}</p>}
                <button onClick={submit} disabled={submitting}
                  style={{ background:"#4A7C59", border:"none", color:"#fff", fontFamily:"'Jost',sans-serif", fontWeight:400, fontSize:"0.68rem", letterSpacing:"0.25em", textTransform:"uppercase", padding:"1rem 2rem", cursor:"pointer", transition:"all 0.25s", opacity:submitting?0.7:1 }}>
                  {submitting?"Đang gửi...":form.attending?"Xác nhận tham dự 🥂":"Gửi lời chúc 💌"}
                </button>
                <button onClick={()=>setStep(form.attending?3:2)} style={{ background:"transparent", border:"none", color:"rgba(127,168,130,0.5)", fontFamily:"'Jost',sans-serif", fontWeight:200, fontSize:"0.62rem", letterSpacing:"0.2em", cursor:"pointer" }}>← Quay lại</button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

// S8 — CLOSING / THANK YOU
function SectionClose() {
  const parallax = useParallax(0.2);
  return (
    <section id="s-close" style={{ position:"relative", height:"100vh", display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden" }}>
      <img ref={parallax} src="/gallery/wedding-02.jpg" alt="" className="parallax-img" style={{ animation:"kenBurns 20s ease-in-out infinite alternate" }} onError={e=>e.target.style.display="none"}/>
      <div style={{ position:"absolute", inset:0, background:"rgba(5,10,5,0.75)" }}/>

      <div style={{ position:"relative", zIndex:2, textAlign:"center", padding:"0 1.5rem", maxWidth:"600px" }}>
        <BigText delay={0} dir="scale" style={{ fontFamily:"'Cinzel',serif", fontWeight:400, fontSize:"clamp(1.5rem,6vw,4rem)", color:"rgba(255,255,255,0.12)", letterSpacing:"0.2em", marginBottom:"2rem", lineHeight:1 }}>
          LOVE YOU FOREVER
        </BigText>

        <LineAnim delay={0.15} style={{ width:"60px", height:"1px", margin:"0 auto 2rem", background:"rgba(127,168,130,0.5)" }}/>

        <BigText delay={0.2} dir="scale" style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontWeight:200, fontSize:"clamp(2rem,8vw,5rem)", color:"#fff", lineHeight:1.1, marginBottom:"0.5rem" }}>
          {WD.bride}
        </BigText>
        <BigText delay={0.3} style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:"1.2rem", color:"rgba(127,168,130,0.7)", marginBottom:"0.5rem" }}>
          &amp;
        </BigText>
        <BigText delay={0.4} dir="scale" style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontWeight:200, fontSize:"clamp(2rem,8vw,5rem)", color:"#fff", lineHeight:1.1, marginBottom:"2.5rem" }}>
          {WD.groom}
        </BigText>

        <LineAnim delay={0.5} style={{ width:"80px", height:"1px", margin:"0 auto 2rem", background:"rgba(127,168,130,0.4)" }}/>

        <WordReveal delay={0.5} stagger={0.07} style={{ fontFamily:"'Jost',sans-serif", fontWeight:200, fontSize:"clamp(0.65rem,1.5vw,0.78rem)", color:"rgba(240,240,236,0.45)", letterSpacing:"0.05em", lineHeight:1.9, display:"block", marginBottom:"2rem" }}>
          Cảm ơn gia đình và bạn bè đã luôn đồng hành. Lâu rồi không gặp, thật sự rất nhớ mọi người!
        </WordReveal>

        <BigText delay={0.7} style={{ fontFamily:"'Jost',sans-serif", fontWeight:200, fontSize:"0.55rem", letterSpacing:"0.45em", textTransform:"uppercase", color:"rgba(127,168,130,0.45)" }}>
          {WD.date} · Huế · Việt Nam
        </BigText>
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════
// MAIN APP
// ══════════════════════════════════════════════
const SECTIONS = [
  { id:"s-hero",    label:"Welcome" },
  { id:"s-wedding", label:"Wedding" },
  { id:"s-story",   label:"Our Story" },
  { id:"s-poem",    label:"Forever" },
  { id:"s-info",    label:"Info" },
  { id:"s-gallery", label:"Gallery" },
  { id:"s-rsvp",    label:"RSVP" },
  { id:"s-close",   label:"Thank You" },
];

export default function WeddingApp() {
  const [activeSection, setActive] = useState(0);

  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const idx = SECTIONS.findIndex(s => s.id === e.target.id);
          if (idx >= 0) setActive(idx);
        }
      });
    }, { threshold: 0.5 });

    SECTIONS.forEach(s => {
      const el = document.getElementById(s.id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  return (
    <>
      <GlobalStyle/>
      <MusicPlayer url={WD.music}/>
      <NavDots sections={SECTIONS} active={activeSection}/>
      <SectionHero/>
      <SectionWedding/>
      <SectionStory/>
      <SectionPoem/>
      <SectionInfo/>
      <SectionGallery/>
      <SectionRSVP/>
      <SectionClose/>
    </>
  );
}
