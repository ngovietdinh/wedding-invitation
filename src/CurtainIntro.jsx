// ============================================================
// CURTAIN INTRO v4 — Chuyển giao mượt hoàn toàn
// Fix: content luôn render sẵn dưới rèm, không re-mount
// Thiệp mở → rèm fade → content hiện lên không bị giật
// ============================================================

import { useState, useEffect, useRef } from "react";

export default function CurtainIntro({ children }) {
  const [phase, setPhase] = useState("idle");
  // idle → ready → opening → done

  const leftRef    = useRef(null);
  const rightRef   = useRef(null);
  const foldRef    = useRef(null);
  const backdropRef= useRef(null);
  const rafRef     = useRef(null);

  // Bước 1: mount xong → phase "ready" (tránh flash)
  useEffect(() => {
    const t = requestAnimationFrame(() => setPhase("ready"));
    return () => cancelAnimationFrame(t);
  }, []);

  // Bước 2: lock scroll khi chưa mở
  useEffect(() => {
    if (phase === "idle" || phase === "ready") {
      document.body.style.overflow = "hidden";
      window.scrollTo(0, 0);
    } else if (phase === "done") {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [phase]);

  // Bước 3: listen trigger
  useEffect(() => {
    if (phase !== "ready") return;
    const open = () => setPhase("opening");
    const onWheel = (e) => { e.preventDefault(); open(); };
    let sy = 0;
    const onTS = (e) => { sy = e.touches[0].clientY; };
    const onTE = (e) => { if (sy - e.changedTouches[0].clientY > 24) open(); };
    window.addEventListener("wheel",      onWheel, { passive: false });
    window.addEventListener("touchstart", onTS,    { passive: true  });
    window.addEventListener("touchend",   onTE,    { passive: true  });
    return () => {
      window.removeEventListener("wheel",      onWheel);
      window.removeEventListener("touchstart", onTS);
      window.removeEventListener("touchend",   onTE);
    };
  }, [phase]);

  // Bước 4: RAF animation khi opening
  useEffect(() => {
    if (phase !== "opening") return;
    const L  = leftRef.current;
    const R  = rightRef.current;
    const F  = foldRef.current;
    const BD = backdropRef.current;
    if (!L || !R || !BD) return;

    const OPEN_DUR   = 1400; // ms mở thiệp
    const FADE_START = 0.52; // bắt đầu fade backdrop khi thiệp mở 52%
    const FADE_DUR   = 0.48; // phần còn lại dành cho fade
    const start = performance.now();

    cancelAnimationFrame(rafRef.current);

    function easeInOutCubic(t) {
      return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2;
    }
    function easeOutQuart(t) {
      return 1 - Math.pow(1-t, 4);
    }

    function frame(now) {
      const t    = Math.min((now - start) / OPEN_DUR, 1);
      const ease = easeInOutCubic(t);

      // === Thiệp mở ===
      const angle = ease * 65;
      const tx    = ease * 10;
      const sy2   = 1 - ease * 0.012;
      L.style.transform = `rotateY(-${angle}deg) translateX(-${tx}px) scaleY(${sy2})`;
      R.style.transform = `rotateY(${angle}deg) translateX(${tx}px) scaleY(${sy2})`;

      // Bóng mép
      const sh = Math.min(ease * 1.8, 1);
      L.style.setProperty("--sh", String(sh));
      R.style.setProperty("--sh", String(sh));

      // Fold line ẩn dần
      if (F) F.style.opacity = String(Math.max(0, 1 - ease * 3));

      // === Fade backdrop khi thiệp đã mở đủ ===
      if (t > FADE_START) {
        const ft   = (t - FADE_START) / FADE_DUR;
        const fEase = easeOutQuart(Math.min(ft, 1));
        // Backdrop mờ dần
        BD.style.opacity = String(1 - fEase);
      }

      if (t < 1) {
        rafRef.current = requestAnimationFrame(frame);
      } else {
        // Done — xóa rèm khỏi DOM
        setPhase("done");
        // Unlock scroll
        document.body.style.overflow = "";
        window.scrollTo(0, 0);
      }
    }

    rafRef.current = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafRef.current);
  }, [phase]);

  const isDone  = phase === "done";
  const isReady = phase === "ready";
  const isOpening = phase === "opening";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Jost:wght@300;400&family=Great+Vibes&display=swap');

        /* ── Content luôn ở dưới, không bị layout shift ── */
        .ci-page {
          position: relative;
          z-index: 0;
        }

        /* ── Backdrop cố định phía trên ── */
        .ci-bd {
          position: fixed; inset: 0; z-index: 9000;
          background: #0a1510;
          display: flex; align-items: center; justify-content: center;
          will-change: opacity;
          pointer-events: all;
        }
        .ci-bd.done {
          pointer-events: none;
          display: none;
        }

        /* ── Wrapper thiệp ── */
        .ci-wrap {
          position: relative;
          width: min(88vw, 780px);
          height: min(82vh, 560px);
          display: flex;
          perspective: 1800px;
          perspective-origin: 50% 46%;
        }

        /* ── Tờ trái ── */
        .ci-L {
          position: relative; width: 50%; height: 100%;
          transform-origin: right center;
          will-change: transform;
          border-radius: 10px 0 0 10px;
          overflow: hidden;
          background:
            radial-gradient(ellipse 80% 60% at 22% 28%, rgba(232,240,232,0.5) 0%, transparent 65%),
            linear-gradient(150deg, #ffffff 0%, #f5f9f5 100%);
          box-shadow: inset -1px 0 0 rgba(74,124,89,0.15);
        }
        .ci-L::after {
          content: ''; position: absolute; top: 0; right: 0; bottom: 0; width: 55px;
          background: linear-gradient(90deg, transparent, rgba(0,0,0,calc(var(--sh,0) * 0.13)));
          pointer-events: none; z-index: 5;
        }

        /* ── Tờ phải ── */
        .ci-R {
          position: relative; width: 50%; height: 100%;
          transform-origin: left center;
          will-change: transform;
          border-radius: 0 10px 10px 0;
          overflow: hidden;
          background: linear-gradient(155deg, #1e4230 0%, #2d5a3d 45%, #1a3828 100%);
          box-shadow: inset 1px 0 0 rgba(127,168,130,0.15);
        }
        .ci-R::after {
          content: ''; position: absolute; top: 0; left: 0; bottom: 0; width: 55px;
          background: linear-gradient(90deg, rgba(0,0,0,calc(var(--sh,0) * 0.15)), transparent);
          pointer-events: none; z-index: 5;
        }

        /* ── Gáy thiệp ── */
        .ci-fold {
          position: absolute; top: 0; bottom: 0;
          left: calc(50% - 1px); width: 2px; z-index: 20;
          background: linear-gradient(180deg,
            transparent 0%, rgba(127,168,130,0.3) 20%,
            rgba(127,168,130,0.45) 50%,
            rgba(127,168,130,0.3) 80%, transparent 100%
          );
          pointer-events: none;
          will-change: opacity;
        }

        /* ── Shadow dưới thiệp ── */
        .ci-shadow {
          position: absolute; bottom: -18px; left: 8%; right: 8%;
          height: 18px; border-radius: 50%;
          background: rgba(0,0,0,0.38);
          filter: blur(11px);
        }

        /* ── Nội dung thiệp ── */
        .ci-lc {
          position: absolute; inset: 0;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: clamp(1.2rem,5vw,2.8rem);
          text-align: center; gap: 0;
        }
        .ci-rc {
          position: absolute; inset: 0;
          display: flex; flex-direction: column;
          align-items: center; justify-content: flex-end;
          padding: clamp(1rem,3vw,2rem);
          gap: 0.3rem;
        }

        /* ── Vân nền ── */
        .ci-tex {
          position: absolute; inset: 0; pointer-events: none;
          background-image: repeating-linear-gradient(
            45deg, transparent 0, transparent 17px,
            rgba(127,168,130,0.028) 17px, rgba(127,168,130,0.028) 18px
          );
        }
        .ci-bord {
          position: absolute; top: 10px; left: 10px; right: 10px; bottom: 10px;
          border: 1px solid rgba(127,168,130,0.2); pointer-events: none;
        }

        /* ── Hint & Skip ── */
        .ci-hint {
          position: fixed; bottom: 2.2rem; left: 50%;
          transform: translateX(-50%);
          z-index: 9010; pointer-events: none;
          display: flex; flex-direction: column;
          align-items: center; gap: 0.45rem;
          animation: hintIn 0.9s ease 1.4s both;
        }
        @keyframes hintIn {
          from { opacity: 0; transform: translateX(-50%) translateY(8px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        .ci-arrow { animation: bounce 1.8s ease-in-out infinite; }
        @keyframes bounce {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(6px); }
        }
        .ci-skip {
          position: fixed; bottom: 1.6rem; right: 1.6rem;
          z-index: 9010;
          background: rgba(127,168,130,0.08);
          border: 1px solid rgba(127,168,130,0.2);
          color: rgba(184,204,186,0.58);
          font-family: 'Jost', sans-serif; font-weight: 300;
          font-size: 9.5px; letter-spacing: 0.28em; text-transform: uppercase;
          padding: 0.42rem 1rem; cursor: pointer; transition: all 0.22s;
          animation: hintIn 0.9s ease 1.8s both;
        }
        .ci-skip:hover {
          background: rgba(127,168,130,0.16);
          color: #B8CCBA; border-color: rgba(127,168,130,0.4);
        }

        /* ── Item animations ── */
        @keyframes itemUp {
          from { opacity: 0; transform: translateY(13px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .a1 { animation: itemUp 0.85s ease 0.2s  both; }
        .a2 { animation: itemUp 0.85s ease 0.35s both; }
        .a3 { animation: itemUp 0.9s  ease 0.5s  both; }
        .a4 { animation: itemUp 0.85s ease 0.62s both; }
        .a5 { animation: itemUp 0.85s ease 0.75s both; }
        .a6 { animation: itemUp 0.85s ease 0.88s both; }
        .a7 { animation: itemUp 0.9s  ease 1.02s both; }

        /* ── Deco ── */
        .dl  { width:100%; height:1px; background:linear-gradient(90deg,transparent,rgba(74,124,89,0.22),transparent); }
        .dlw { width:55%;  height:1px; background:linear-gradient(90deg,transparent,rgba(255,255,255,0.28),transparent); }
        .diamond { width:40px; height:40px; background:#2d5a3d; transform:rotate(45deg); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .diamond-n { transform:rotate(-45deg); font-family:'Cormorant Garamond',serif; font-weight:400; font-size:clamp(0.85rem,2.2vw,1.05rem); color:#fff; }
      `}</style>

      {/* ─── Content luôn render sẵn — KHÔNG bị unmount ─── */}
      <div className="ci-page">
        {children}
      </div>

      {/* ─── Rèm phủ lên — chỉ xóa khi done ─── */}
      {!isDone && (
        <div
          className="ci-bd"
          ref={backdropRef}
          style={{ opacity: 1 }}
        >
          <div className="ci-wrap">
            <div className="ci-shadow"/>

            {/* TỜ TRÁI */}
            <div className="ci-L" ref={leftRef}>
              <Flower pos="tl" c="#4A7C59"/><Flower pos="tr" c="#4A7C59"/>
              <Flower pos="bl" c="#7FA882"/><Flower pos="br" c="#7FA882"/>
              <div className="ci-lc">
                <p className="a1" style={S.eyebrow}>TRÂN TRỌNG KÍNH MỜI</p>
                <div className="a2 dl" style={{marginBottom:'0.5rem'}}/>
                <p className="a2" style={S.body}>ĐẾN DỰ BUỔI TIỆC RƯỢU<br/>CHUNG VUI CÙNG GIA ĐÌNH CHÚNG TÔI TẠI</p>
                <p className="a3" style={S.script}>Nhà hàng của chúng tôi</p>
                <p className="a3" style={{...S.body,marginBottom:'0.3rem'}}>123 Đường ABC, Phường XYZ<br/>Quận 1, TP. Huế</p>
                <div className="a4 dl" style={{margin:'0.32rem 0'}}/>
                <div className="a4" style={{display:'flex',alignItems:'center',gap:'0.7rem',margin:'0.28rem 0'}}>
                  <div style={{textAlign:'right'}}>
                    <p style={S.tag}>THỨ HAI</p>
                    <p style={S.tagSub}>LÚC 11:00</p>
                  </div>
                  <div className="diamond"><span className="diamond-n">26</span></div>
                  <div style={{textAlign:'left'}}>
                    <p style={S.tag}>THÁNG 04</p>
                    <p style={S.tagSub}>NĂM 2026</p>
                  </div>
                </div>
                <div className="a5 dl" style={{margin:'0.32rem 0'}}/>
                <p className="a5" style={{...S.body,fontStyle:'italic',color:'#7FA882',marginBottom:'0.32rem'}}>
                  ( NHẰM NGÀY 09 THÁNG 03 NĂM QUÝ MÃO )
                </p>
                <div className="a6 dl" style={{marginBottom:'0.32rem'}}/>
                <p className="a6" style={{...S.body,marginBottom:'0.28rem'}}>
                  SỰ HIỆN DIỆN CỦA .............<br/>LÀ NIỀM VINH HẠNH CHO<br/>GIA ĐÌNH CHÚNG TÔI.
                </p>
                <p className="a7" style={S.script}>Kính mời !</p>
              </div>
            </div>

            {/* Gáy */}
            <div className="ci-fold" ref={foldRef}/>

            {/* TỜ PHẢI */}
            <div className="ci-R" ref={rightRef}>
              <div className="ci-tex"/><div className="ci-bord"/>
              <FlowerW pos="tl"/><FlowerW pos="tr"/>
              <div style={{position:'absolute',top:'clamp(0.8rem,3.5vh,1.8rem)',left:'clamp(0.8rem,3vw,1.5rem)'}}>
                {['Save','the','Date'].map((w,i)=>(
                  <p key={w} className={`a${i+2}`} style={S.saveDate}>{w}</p>
                ))}
              </div>
              <div className="ci-rc">
                <div className="a3" style={{flex:1,display:'flex',alignItems:'flex-end',justifyContent:'center'}}>
                  <CoupleSVG/>
                </div>
                <p className="a5" style={S.coupleName}>Bảo Ngân &amp; Viết Định</p>
                <div className="a6 dlw" style={{alignSelf:'center'}}/>
                <p className="a7" style={S.coupleDate}>26 · 04 · 2026</p>
              </div>
            </div>
          </div>

          {/* Hint & Skip — chỉ show khi ready */}
          {isReady && (
            <>
              <div className="ci-hint">
                <span style={S.hint}>Lăn chuột để mở thiệp</span>
                <div className="ci-arrow">
                  <svg viewBox="0 0 18 18" width="15" fill="none">
                    <path d="M9 2.5L9 15.5M3.5 10L9 15.5L14.5 10"
                      stroke="rgba(127,168,130,0.5)" strokeWidth="1.2"
                      strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
              <button className="ci-skip" onClick={() => setPhase("opening")}>
                Bỏ qua →
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}

// ── Styles ──
const S = {
  eyebrow:  { fontFamily:"'Jost',sans-serif", fontWeight:300, fontSize:'clamp(0.42rem,1.1vw,0.58rem)', letterSpacing:'0.42em', textTransform:'uppercase', color:'#4A7C59', marginBottom:'0.5rem' },
  body:     { fontFamily:"'Jost',sans-serif", fontWeight:300, fontSize:'clamp(0.4rem,1vw,0.55rem)', color:'#5A7A62', lineHeight:1.85, letterSpacing:'0.05em' },
  script:   { fontFamily:"'Great Vibes',cursive", fontSize:'clamp(1.2rem,3.5vw,1.9rem)', color:'#1A3A28', lineHeight:1.15, marginBottom:'0.25rem' },
  tag:      { fontFamily:"'Jost',sans-serif", fontWeight:300, fontSize:'clamp(0.4rem,0.95vw,0.54rem)', color:'#5A7A62', letterSpacing:'0.22em', textTransform:'uppercase', margin:0 },
  tagSub:   { fontFamily:"'Jost',sans-serif", fontWeight:300, fontSize:'clamp(0.36rem,0.85vw,0.48rem)', color:'#7FA882', margin:0 },
  saveDate: { fontFamily:"'Great Vibes',cursive", fontSize:'clamp(1.5rem,4.2vw,2.6rem)', color:'rgba(255,255,255,0.95)', lineHeight:1.12, margin:0, textShadow:'0 2px 14px rgba(0,0,0,0.28)' },
  coupleName:{ fontFamily:"'Cormorant Garamond',serif", fontStyle:'italic', fontWeight:300, fontSize:'clamp(0.82rem,2.2vw,1.1rem)', color:'rgba(255,255,255,0.88)', margin:0, letterSpacing:'0.05em' },
  coupleDate:{ fontFamily:"'Jost',sans-serif", fontWeight:300, fontSize:'clamp(0.4rem,1vw,0.55rem)', letterSpacing:'0.32em', textTransform:'uppercase', color:'rgba(184,204,186,0.65)', margin:0 },
  hint:     { fontFamily:"'Jost',sans-serif", fontWeight:300, fontSize:'9px', letterSpacing:'0.32em', textTransform:'uppercase', color:'rgba(127,168,130,0.55)' },
};

// ── SVG Hoa ──
function Flower({ pos, c }) {
  const base = { position:'absolute', pointerEvents:'none' };
  const P = {
    tl:{ ...base, top:'-8px',    left:'-8px',  width:'108px', opacity:0.82 },
    tr:{ ...base, top:'-8px',    right:'-8px', width:'108px', opacity:0.82, transform:'scaleX(-1)' },
    bl:{ ...base, bottom:'-8px', left:'-8px',  width:'88px',  opacity:0.62, transform:'scaleY(-1)' },
    br:{ ...base, bottom:'-8px', right:'-8px', width:'88px',  opacity:0.62, transform:'scale(-1)' },
  };
  return (
    <svg style={P[pos]} viewBox="0 0 120 120" fill="none">
      <path d="M10 110 Q32 78 62 58 Q82 44 102 18" stroke={c} strokeWidth="1.3" fill="none" opacity="0.52"/>
      <ellipse cx="36" cy="86" rx="11" ry="5" fill={c} opacity="0.28" transform="rotate(-32 36 86)"/>
      <ellipse cx="56" cy="66" rx="12" ry="5" fill={c} opacity="0.28" transform="rotate(-46 56 66)"/>
      <ellipse cx="76" cy="44" rx="10" ry="4" fill={c} opacity="0.24" transform="rotate(-56 76 44)"/>
      <circle cx="102" cy="18" r="7.5" fill={c} opacity="0.42"/>
      <circle cx="102" cy="18" r="3.8" fill={c} opacity="0.62"/>
      <circle cx="92"  cy="10" r="5.2" fill={c} opacity="0.35"/>
      <circle cx="110" cy="12" r="4.2" fill={c} opacity="0.32"/>
      <circle cx="97"  cy="27" r="4.2" fill={c} opacity="0.3"/>
      <circle cx="60"  cy="58" r="4.2" fill={c} opacity="0.35"/>
      <circle cx="60"  cy="58" r="2"   fill={c} opacity="0.55"/>
    </svg>
  );
}

function FlowerW({ pos }) {
  const base = { position:'absolute', pointerEvents:'none' };
  const P = {
    tl:{ ...base, top:'-8px', left:'-8px',  width:'96px', opacity:0.62 },
    tr:{ ...base, top:'-8px', right:'-8px', width:'96px', opacity:0.62, transform:'scaleX(-1)' },
  };
  return (
    <svg style={P[pos]} viewBox="0 0 120 120" fill="none">
      <path d="M10 110 Q32 78 62 58 Q82 44 102 18" stroke="rgba(255,255,255,0.6)" strokeWidth="1.1" fill="none" opacity="0.52"/>
      <ellipse cx="36" cy="86" rx="11" ry="5" fill="rgba(255,255,255,0.32)" transform="rotate(-32 36 86)"/>
      <ellipse cx="56" cy="66" rx="12" ry="5" fill="rgba(255,255,255,0.28)" transform="rotate(-46 56 66)"/>
      <circle cx="102" cy="18" r="7.5" fill="rgba(255,255,255,0.46)"/>
      <circle cx="102" cy="18" r="3.8" fill="rgba(255,255,255,0.65)"/>
      <circle cx="92"  cy="10" r="5"   fill="rgba(255,255,255,0.35)"/>
      <circle cx="110" cy="12" r="4"   fill="rgba(255,255,255,0.32)"/>
      <circle cx="97"  cy="27" r="4"   fill="rgba(255,255,255,0.28)"/>
    </svg>
  );
}

// ── SVG Đôi uyên ương ──
function CoupleSVG() {
  return (
    <svg viewBox="0 0 200 272" style={{width:'min(62%,168px)',height:'auto'}}>
      <path d="M60 156 Q40 196 30 266 L93 266 Q88 216 83 156Z" fill="rgba(255,255,255,0.9)"/>
      <path d="M83 156 Q88 196 93 266 L116 266 Q103 196 93 146Z" fill="rgba(255,255,255,0.62)"/>
      <path d="M63 116 Q59 136 60 156 L93 156 Q90 136 86 116Z" fill="rgba(255,255,255,0.93)"/>
      <path d="M61 126 Q51 141 47 151" stroke="rgba(255,255,255,0.9)" strokeWidth="7" strokeLinecap="round" fill="none"/>
      <path d="M85 124 Q94 136 96 145" stroke="rgba(255,255,255,0.76)" strokeWidth="6" strokeLinecap="round" fill="none"/>
      <circle cx="74" cy="96" r="16.5" fill="#f5e6d8"/>
      <path d="M57 94 Q59 76 74 74 Q89 76 91 94" fill="#3d2b1f" opacity="0.87"/>
      <path d="M57 94 Q54 106 59 114" stroke="#3d2b1f" strokeWidth="3.2" fill="none" opacity="0.68"/>
      <path d="M91 94 Q94 104 92 112" stroke="#3d2b1f" strokeWidth="2.4" fill="none" opacity="0.52"/>
      <path d="M58 84 Q74 78 90 84 L93 74 Q74 68 55 74Z" fill="rgba(255,255,255,0.56)"/>
      <ellipse cx="68" cy="99" rx="1.7" ry="2.2" fill="#3d2b1f" opacity="0.63"/>
      <ellipse cx="80" cy="99" rx="1.7" ry="2.2" fill="#3d2b1f" opacity="0.63"/>
      <path d="M70 106 Q74 109 78 106" stroke="#c47a7a" strokeWidth="1.15" fill="none" strokeLinecap="round"/>
      <circle cx="48" cy="154" r="12.5" fill="rgba(255,255,255,0.36)"/>
      <circle cx="44" cy="150" r="4.2" fill="white" opacity="0.82"/>
      <circle cx="52" cy="149" r="4.2" fill="rgba(232,242,232,0.9)"/>
      <circle cx="48" cy="158" r="4.2" fill="white" opacity="0.74)"/>
      <circle cx="41" cy="157" r="3.3" fill="rgba(210,235,210,0.78)"/>
      <circle cx="55" cy="157" r="3.3" fill="white" opacity="0.68"/>
      <path d="M46 168 Q42 178 38 188" stroke="rgba(255,255,255,0.42)" strokeWidth="1.3" fill="none"/>
      <path d="M50 168 Q54 178 56 186" stroke="rgba(255,255,255,0.42)" strokeWidth="1.3" fill="none"/>
      <path d="M116 166 L110 266 L128 266 L130 196Z" fill="#2d3748" opacity="0.83"/>
      <path d="M148 166 L154 266 L136 266 L134 196Z" fill="#2d3748" opacity="0.83"/>
      <path d="M110 116 Q107 140 109 166 L155 166 Q157 140 154 116Z" fill="#4a5568" opacity="0.87"/>
      <path d="M126 116 L132 134 L138 116" fill="rgba(255,255,255,0.9)"/>
      <path d="M128 118 L132 122 L136 118 L132 125Z" fill="#1a202c"/>
      <path d="M108 118 Q99 136 96 151" stroke="#4a5568" strokeWidth="9" strokeLinecap="round" fill="none"/>
      <path d="M156 118 Q165 136 167 151" stroke="#4a5568" strokeWidth="9" strokeLinecap="round" fill="none"/>
      <path d="M96 151 Q93 158 92 164" stroke="rgba(255,255,255,0.9)" strokeWidth="6" strokeLinecap="round" fill="none"/>
      <path d="M167 151 Q170 158 171 164" stroke="rgba(255,255,255,0.9)" strokeWidth="6" strokeLinecap="round" fill="none"/>
      <circle cx="132" cy="94" r="17.5" fill="#f0d9c0"/>
      <path d="M114 90 Q116 72 132 70 Q148 72 150 90" fill="#2d1f0f" opacity="0.87"/>
      <rect x="120" y="95" width="9.5" height="6.5" rx="2.8" stroke="#4a3728" strokeWidth="1" fill="rgba(200,228,255,0.18)"/>
      <rect x="134" y="95" width="9.5" height="6.5" rx="2.8" stroke="#4a3728" strokeWidth="1" fill="rgba(200,228,255,0.18)"/>
      <path d="M130 98 L134 98" stroke="#4a3728" strokeWidth="0.85" fill="none"/>
      <path d="M126 105 Q132 109 138 105" stroke="#c47a7a" strokeWidth="1.15" fill="none" strokeLinecap="round"/>
      <path d="M93 163 Q104 167 115 165" stroke="rgba(255,255,255,0.26)" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
    </svg>
  );
}