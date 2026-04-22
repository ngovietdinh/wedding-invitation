// ============================================================
// HERO SECTION — Green Sage + White Modern Theme
// Bảo Ngân & Viết Định
// ============================================================

import { useState, useEffect, useRef } from "react";

const WEDDING_DATE = new Date("2026-04-26T10:00:00");

function useCountdown(target) {
  const [t, setT] = useState({});
  useEffect(() => {
    const calc = () => {
      const d = target - new Date();
      if (d <= 0) return setT({ days:0, hours:0, minutes:0, seconds:0 });
      setT({
        days:    Math.floor(d / 86400000),
        hours:   Math.floor((d % 86400000) / 3600000),
        minutes: Math.floor((d % 3600000) / 60000),
        seconds: Math.floor((d % 60000) / 1000),
      });
    };
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [target]);
  return t;
}

function Petal({ style }) {
  return (
    <div style={{ position:"absolute", top:"-40px", pointerEvents:"none", ...style }}>
      <svg viewBox="0 0 16 28" style={{ width:"100%", height:"auto" }}>
        <ellipse cx="8" cy="14" rx="5.5" ry="12" fill="currentColor" opacity="0.4"/>
      </svg>
    </div>
  );
}

function PetalRain() {
  const petals = Array.from({ length: 14 }, (_, i) => ({
    id: i,
    style: {
      left: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 12}s`,
      animationDuration: `${9 + Math.random() * 8}s`,
      width: `${8 + Math.random() * 10}px`,
      color: ["#7FA882","#4A7C59","#B8CCBA","#9DB89F","#2D5A3D"][i % 5],
      transform: `rotate(${Math.random() * 360}deg)`,
    },
  }));
  return (
    <div style={{ position:"absolute", inset:0, overflow:"hidden", pointerEvents:"none", zIndex:5 }} aria-hidden="true">
      {petals.map(p => <Petal key={p.id} style={p.style} />)}
      <style>{`
        @keyframes petalFall {
          0%   { top:-40px; transform:translateX(0) rotate(0deg); opacity:0; }
          8%   { opacity:0.8; }
          90%  { opacity:0.5; }
          100% { top:110vh; transform:translateX(60px) rotate(480deg); opacity:0; }
        }
        div[style*="top:-40px"] { animation: petalFall linear infinite; }
      `}</style>
    </div>
  );
}

export default function HeroSection() {
  const [loaded, setLoaded] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const countdown = useCountdown(WEDDING_DATE);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 80);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const fn = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const fu = (delay) => ({
    opacity: loaded ? 1 : 0,
    transform: loaded ? "translateY(0)" : "translateY(24px)",
    transition: `opacity 0.9s ease ${delay}s, transform 0.9s ease ${delay}s`,
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400;1,500&family=DM+Sans:wght@200;300;400;500&display=swap');
        :root {
          --white:#FFFFFF; --off-white:#F7F9F6; --green-light:#E8F0E8;
          --green-mid:#7FA882; --green:#4A7C59; --green-dark:#2D5A3D;
          --green-deep:#1A3A28; --sage:#8FA892; --sage-light:#B8CCBA;
          --serif:'Playfair Display',Georgia,serif;
          --sans:'DM Sans',sans-serif;
        }
        body { background:var(--white); font-family:var(--sans); }

        /* Corner ornaments */
        .corner-ornament { position:absolute; width:50px; height:50px; opacity:0.25; z-index:4; }
        .co-tl { top:1.5rem; left:1.5rem; }
        .co-tr { top:1.5rem; right:1.5rem; transform:scaleX(-1); }
        .co-bl { bottom:1.5rem; left:1.5rem; transform:scaleY(-1); }
        .co-br { bottom:1.5rem; right:1.5rem; transform:scale(-1); }

        /* Scroll indicator */
        .scroll-ind {
          position:absolute; bottom:2rem; left:50%; transform:translateX(-50%);
          display:flex; flex-direction:column; align-items:center; gap:0.4rem;
          z-index:20; animation:scrollPulse 2.5s ease-in-out infinite;
        }
        @keyframes scrollPulse { 0%,100%{opacity:0.3} 50%{opacity:0.7} }
        .scroll-line {
          width:1px; height:36px;
          background:linear-gradient(180deg,var(--green) 0%,transparent 100%);
          animation:scrollLine 2.5s ease-in-out infinite;
        }
        @keyframes scrollLine {
          0%{transform:scaleY(0);transform-origin:top}
          50%{transform:scaleY(1);transform-origin:top}
          51%{transform:scaleY(1);transform-origin:bottom}
          100%{transform:scaleY(0);transform-origin:bottom}
        }

        /* Btn hover */
        .btn-primary-green:hover { background:var(--green-dark) !important; transform:translateY(-2px); box-shadow:0 8px 24px rgba(26,58,40,0.2); }
        .btn-outline-green:hover { background:var(--green-light) !important; border-color:var(--green) !important; transform:translateY(-2px); }
      `}</style>

      <section style={{
        position:"relative", minHeight:"100vh",
        background:"var(--white)",
        display:"flex", flexDirection:"column",
        alignItems:"center", justifyContent:"center",
        overflow:"hidden",
      }}>
        {/* BG gradient */}
        <div style={{
          position:"absolute", inset:0, zIndex:0,
          background:`
            radial-gradient(ellipse 70% 50% at 50% 20%, rgba(232,240,232,0.6) 0%, transparent 70%),
            radial-gradient(ellipse 40% 30% at 85% 85%, rgba(127,168,130,0.1) 0%, transparent 60%),
            #FFFFFF
          `,
        }}/>

        {/* Subtle grid texture */}
        <div style={{
          position:"absolute", inset:0, zIndex:1, opacity:0.025,
          backgroundImage:`linear-gradient(var(--green-mid) 1px, transparent 1px), linear-gradient(90deg, var(--green-mid) 1px, transparent 1px)`,
          backgroundSize:"60px 60px",
          pointerEvents:"none",
        }}/>

        <PetalRain />

        {/* Corner ornaments */}
        {[["co-tl","M4 4 L4 20 M4 4 L20 4"],["co-tr","M4 4 L4 20 M4 4 L20 4"],
          ["co-bl","M4 4 L4 20 M4 4 L20 4"],["co-br","M4 4 L4 20 M4 4 L20 4"]
        ].map(([cls, path]) => (
          <svg key={cls} className={`corner-ornament ${cls}`} viewBox="0 0 50 50" fill="none">
            <path d={path} stroke="#4A7C59" strokeWidth="1"/>
            <circle cx="4" cy="4" r="2" fill="#4A7C59" fillOpacity="0.6"/>
          </svg>
        ))}

        {/* Main content */}
        <div style={{
          position:"relative", zIndex:10,
          display:"flex", flexDirection:"column",
          alignItems:"center", textAlign:"center",
          padding:"2rem 1.5rem", maxWidth:"680px", width:"100%",
          gap:"0",
        }}>

          {/* Tag */}
          <div style={{ ...fu(0.15), marginBottom:"1.8rem" }}>
            <span style={{
              display:"inline-flex", alignItems:"center", gap:"0.5rem",
              padding:"0.35rem 1rem",
              border:"1px solid var(--green-light)",
              background:"var(--green-light)",
              fontFamily:"var(--sans)", fontWeight:400, fontSize:"0.6rem",
              letterSpacing:"0.35em", textTransform:"uppercase", color:"var(--green)",
              borderRadius:"0",
            }}>
              <span style={{ width:"5px", height:"5px", borderRadius:"50%", background:"var(--green)", display:"inline-block" }}/>
              Trân trọng kính mời
              <span style={{ width:"5px", height:"5px", borderRadius:"50%", background:"var(--green)", display:"inline-block" }}/>
            </span>
          </div>

          {/* Names */}
          <div style={{ ...fu(0.3), marginBottom:"0.2rem" }}>
            <h1 style={{
              fontFamily:"var(--serif)", fontStyle:"italic", fontWeight:400,
              fontSize:"clamp(3rem,13vw,7rem)",
              lineHeight:1, color:"var(--green-deep)",
              letterSpacing:"-0.01em", margin:0,
            }}>
              Bảo Ngân
            </h1>
          </div>

          {/* Ampersand divider */}
          <div style={{ ...fu(0.42), display:"flex", alignItems:"center", gap:"1.2rem", margin:"0.6rem 0" }}>
            <div style={{ height:"1px", width:"60px", background:`linear-gradient(90deg, transparent, var(--green-mid))` }}/>
            <span style={{
              fontFamily:"var(--serif)", fontStyle:"italic",
              fontSize:"1.4rem", color:"var(--green)", fontWeight:400,
            }}>&amp;</span>
            <div style={{ height:"1px", width:"60px", background:`linear-gradient(90deg, var(--green-mid), transparent)` }}/>
          </div>

          <div style={{ ...fu(0.52), marginBottom:"0" }}>
            <h1 style={{
              fontFamily:"var(--serif)", fontStyle:"italic", fontWeight:400,
              fontSize:"clamp(3rem,13vw,7rem)",
              lineHeight:1, color:"var(--green-deep)",
              letterSpacing:"-0.01em", margin:0,
            }}>
              Viết Định
            </h1>
          </div>

          {/* Date pill */}
          <div style={{ ...fu(0.65), margin:"2.2rem 0 0" }}>
            <div style={{
              display:"inline-flex", alignItems:"center", gap:"0",
              border:"1px solid var(--green-light)",
              overflow:"hidden",
            }}>
              <div style={{
                background:"var(--green)", color:"var(--white)",
                padding:"0.7rem 1.2rem",
                fontFamily:"var(--sans)", fontWeight:500, fontSize:"0.65rem",
                letterSpacing:"0.2em", textTransform:"uppercase",
              }}>
                26.04.2026
              </div>
              <div style={{
                background:"var(--off-white)", color:"var(--green-dark)",
                padding:"0.7rem 1.2rem",
                fontFamily:"var(--sans)", fontWeight:300, fontSize:"0.65rem",
                letterSpacing:"0.2em", textTransform:"uppercase",
              }}>
                Huế · Việt Nam
              </div>
            </div>
          </div>

          {/* Countdown */}
          <div style={{ ...fu(0.75), display:"flex", gap:"clamp(1rem,5vw,2rem)", margin:"2rem 0 0", alignItems:"flex-start" }}>
            {[
              { v:countdown.days,    l:"Ngày" },
              { v:countdown.hours,   l:"Giờ" },
              { v:countdown.minutes, l:"Phút" },
              { v:countdown.seconds, l:"Giây" },
            ].map((item, i) => (
              <div key={i} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"0.25rem" }}>
                <div style={{
                  background:"var(--off-white)",
                  border:"1px solid var(--green-light)",
                  width:"clamp(52px,14vw,70px)", height:"clamp(52px,14vw,70px)",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  position:"relative",
                }}>
                  <span style={{
                    fontFamily:"var(--serif)", fontSize:"clamp(1.4rem,5vw,2rem)",
                    fontWeight:400, color:"var(--green-dark)", lineHeight:1,
                  }}>
                    {String(item.v ?? 0).padStart(2,"0")}
                  </span>
                  {/* Corner accents */}
                  <span style={{ position:"absolute", top:"3px", left:"3px", width:"6px", height:"6px", borderTop:"1px solid var(--green-mid)", borderLeft:"1px solid var(--green-mid)" }}/>
                  <span style={{ position:"absolute", bottom:"3px", right:"3px", width:"6px", height:"6px", borderBottom:"1px solid var(--green-mid)", borderRight:"1px solid var(--green-mid)" }}/>
                </div>
                <span style={{
                  fontFamily:"var(--sans)", fontWeight:300, fontSize:"0.55rem",
                  letterSpacing:"0.3em", textTransform:"uppercase", color:"var(--sage)",
                }}>{item.l}</span>
              </div>
            ))}
          </div>

          {/* Tagline */}
          <p style={{
            ...fu(0.85),
            fontFamily:"var(--serif)", fontStyle:"italic", fontWeight:400,
            fontSize:"clamp(0.88rem,3vw,1.05rem)", color:"var(--sage)",
            lineHeight:1.8, maxWidth:"360px", margin:"1.8rem 0 2.2rem",
          }}>
            "Ngày hôm đó sẽ trọn vẹn hơn khi có sự hiện diện của bạn."
          </p>

          {/* CTAs */}
          <div style={{ ...fu(0.95), display:"flex", gap:"0.8rem", flexWrap:"wrap", justifyContent:"center" }}>
            <a href="#rsvp" className="btn-primary-green" style={{
              padding:"0.9rem 2.2rem",
              background:"var(--green)", color:"var(--white)",
              border:"none", fontFamily:"var(--sans)", fontWeight:400,
              fontSize:"0.68rem", letterSpacing:"0.25em", textTransform:"uppercase",
              cursor:"pointer", transition:"all 0.3s ease", textDecoration:"none",
              display:"inline-block",
            }}>
              Xác nhận tham dự
            </a>
            <a href="#story" className="btn-outline-green" style={{
              padding:"0.9rem 2.2rem",
              background:"transparent", color:"var(--green-dark)",
              border:"1px solid var(--green-mid)",
              fontFamily:"var(--sans)", fontWeight:300,
              fontSize:"0.68rem", letterSpacing:"0.25em", textTransform:"uppercase",
              cursor:"pointer", transition:"all 0.3s ease", textDecoration:"none",
              display:"inline-block",
            }}>
              Câu chuyện của chúng tôi
            </a>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="scroll-ind">
          <span style={{ fontFamily:"var(--sans)", fontWeight:300, fontSize:"0.5rem", letterSpacing:"0.3em", textTransform:"uppercase", color:"var(--green)" }}>Khám phá</span>
          <div className="scroll-line"/>
        </div>
      </section>
    </>
  );
}