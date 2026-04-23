// ============================================================
// HERO SECTION — với Text Reveal animations
// ============================================================

import { useState, useEffect, useRef } from "react";
import {
  SplitReveal, SlideReveal, FadeWords,
  HeadingReveal, TypeReveal, ScrollLine
} from "./TextReveal";

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
      <svg viewBox="0 0 14 24" style={{ width:"100%", height:"auto" }}>
        <ellipse cx="7" cy="12" rx="5" ry="11" fill="currentColor" opacity="0.38"/>
      </svg>
    </div>
  );
}

function PetalRain() {
  const petals = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    style: {
      left: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 12}s`,
      animationDuration: `${10 + Math.random() * 8}s`,
      width: `${7 + Math.random() * 9}px`,
      color: ["#7FA882","#4A7C59","#B8CCBA","#9DB89F","#2D5A3D"][i % 5],
      transform: `rotate(${Math.random() * 360}deg)`,
    },
  }));
  return (
    <div style={{ position:"absolute", inset:0, overflow:"hidden", pointerEvents:"none", zIndex:5 }} aria-hidden="true">
      {petals.map(p => <Petal key={p.id} style={p.style} />)}
      <style>{`@keyframes petalFall{0%{top:-40px;opacity:0;transform:translateX(0) rotate(0deg)}8%{opacity:0.7}90%{opacity:0.45}100%{top:110vh;opacity:0;transform:translateX(55px) rotate(450deg)}}div[style*="top:-40px"]{animation:petalFall linear infinite}`}</style>
    </div>
  );
}

export default function HeroSection() {
  const [loaded, setLoaded] = useState(false);
  const countdown = useCountdown(WEDDING_DATE);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 120);
    return () => clearTimeout(t);
  }, []);

  // Fade up helper cho các element lúc load
  const fu = (delay) => ({
    opacity:   loaded ? 1 : 0,
    transform: loaded ? "translateY(0)" : "translateY(22px)",
    transition: `opacity 1s ease ${delay}s, transform 1s cubic-bezier(0.22,1,0.36,1) ${delay}s`,
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Jost:wght@300;400&display=swap');
        :root{
          --white:#FFFFFF;--off:#F7F9F6;--gl:#E8F0E8;
          --gm:#7FA882;--g:#4A7C59;--gd:#2D5A3D;
          --deep:#1A3A28;--sage:#8FA892;
          --serif:'Cormorant Garamond',Georgia,serif;
          --sans:'Jost',sans-serif;
        }
        body{background:var(--white);font-family:var(--sans);}

        .hero-sec{
          position:relative;min-height:100vh;
          display:flex;flex-direction:column;
          align-items:center;justify-content:center;
          overflow:hidden;background:var(--white);
        }
        .hero-bg{
          position:absolute;inset:0;z-index:0;
          background:
            radial-gradient(ellipse 75% 55% at 50% 22%,rgba(232,240,232,0.55) 0%,transparent 68%),
            radial-gradient(ellipse 45% 35% at 82% 82%,rgba(127,168,130,0.09) 0%,transparent 58%),
            #FFFFFF;
        }
        .hero-grid{
          position:absolute;inset:0;z-index:1;opacity:0.022;
          background-image:
            linear-gradient(var(--gm) 1px,transparent 1px),
            linear-gradient(90deg,var(--gm) 1px,transparent 1px);
          background-size:62px 62px;pointer-events:none;
        }
        .hero-content{
          position:relative;z-index:10;
          display:flex;flex-direction:column;
          align-items:center;text-align:center;
          padding:2rem 1.5rem;
          max-width:700px;width:100%;gap:0;
        }
        .scroll-ind{
          position:absolute;bottom:2rem;left:50%;
          transform:translateX(-50%);z-index:20;
          display:flex;flex-direction:column;align-items:center;gap:0.4rem;
          animation:scrollPulse 2.6s ease-in-out infinite;
        }
        @keyframes scrollPulse{0%,100%{opacity:0.28}50%{opacity:0.65}}
        .scroll-line{
          width:1px;height:34px;
          background:linear-gradient(180deg,var(--g) 0%,transparent 100%);
          animation:scrollLine 2.6s ease-in-out infinite;
        }
        @keyframes scrollLine{
          0%{transform:scaleY(0);transform-origin:top}
          50%{transform:scaleY(1);transform-origin:top}
          51%{transform:scaleY(1);transform-origin:bottom}
          100%{transform:scaleY(0);transform-origin:bottom}
        }
        .btn-p:hover{background:var(--gd)!important;transform:translateY(-2px);box-shadow:0 8px 22px rgba(26,58,40,0.2);}
        .btn-o:hover{background:var(--gl)!important;border-color:var(--g)!important;transform:translateY(-2px);}

        /* Corner ornaments */
        .corner{position:absolute;width:48px;height:48px;opacity:0.22;z-index:4;}
        .c-tl{top:1.4rem;left:1.4rem}
        .c-tr{top:1.4rem;right:1.4rem;transform:scaleX(-1)}
        .c-bl{bottom:1.4rem;left:1.4rem;transform:scaleY(-1)}
        .c-br{bottom:1.4rem;right:1.4rem;transform:scale(-1)}
      `}</style>

      <section className="hero-sec">
        <div className="hero-bg"/>
        <div className="hero-grid"/>
        <PetalRain/>

        {/* Corners */}
        {["c-tl","c-tr","c-bl","c-br"].map(c => (
          <svg key={c} className={`corner ${c}`} viewBox="0 0 48 48" fill="none">
            <path d="M4 4 L4 20 M4 4 L20 4" stroke="#4A7C59" strokeWidth="1"/>
            <circle cx="4" cy="4" r="1.8" fill="#4A7C59" fillOpacity="0.55"/>
          </svg>
        ))}

        <div className="hero-content">

          {/* Eyebrow tag */}
          <div style={{ ...fu(0.15), marginBottom:"1.8rem" }}>
            <span style={{
              display:"inline-flex", alignItems:"center", gap:"0.5rem",
              padding:"0.32rem 1rem",
              border:"1px solid var(--gl)", background:"var(--gl)",
              fontFamily:"var(--sans)", fontWeight:400, fontSize:"0.6rem",
              letterSpacing:"0.35em", textTransform:"uppercase", color:"var(--g)",
            }}>
              <span style={{ width:"4px", height:"4px", borderRadius:"50%", background:"var(--g)" }}/>
              Trân trọng kính mời
              <span style={{ width:"4px", height:"4px", borderRadius:"50%", background:"var(--g)" }}/>
            </span>
          </div>

          {/* ── TÊN — SplitReveal từ 2 bên ── */}
          <div style={{ marginBottom:"0.15rem" }}>
            <SplitReveal
              delay={0.3}
              duration={1.3}
              style={{
                fontFamily:"var(--serif)", fontStyle:"italic", fontWeight:300,
                fontSize:"clamp(3rem,13vw,7rem)",
                lineHeight:1.02, color:"var(--deep)",
                letterSpacing:"-0.01em",
                display:"block",
              }}
            >
              Bảo Ngân
            </SplitReveal>
          </div>

          {/* Ampersand */}
          <div style={{ display:"flex", alignItems:"center", gap:"1.2rem", margin:"0.5rem 0", ...fu(0.58) }}>
            <ScrollLine delay={0.6} duration={1} style={{ width:"55px" }}
              color="linear-gradient(90deg,transparent,#7FA882)"/>
            <span style={{
              fontFamily:"var(--serif)", fontStyle:"italic",
              fontSize:"1.3rem", color:"var(--g)", fontWeight:300,
            }}>&amp;</span>
            <ScrollLine delay={0.6} duration={1} style={{ width:"55px" }}
              color="linear-gradient(90deg,#7FA882,transparent)"/>
          </div>

          <div style={{ marginBottom:"0" }}>
            <SplitReveal
              delay={0.45}
              duration={1.3}
              style={{
                fontFamily:"var(--serif)", fontStyle:"italic", fontWeight:300,
                fontSize:"clamp(3rem,13vw,7rem)",
                lineHeight:1.02, color:"var(--deep)",
                letterSpacing:"-0.01em",
                display:"block",
              }}
            >
              Viết Định
            </SplitReveal>
          </div>

          {/* ── Date pill ── */}
          <div style={{ ...fu(0.68), margin:"2rem 0 0" }}>
            <div style={{
              display:"inline-flex", alignItems:"center", gap:"0",
              border:"1px solid var(--gl)", overflow:"hidden",
            }}>
              <div style={{
                background:"var(--g)", color:"var(--white)",
                padding:"0.65rem 1.2rem",
                fontFamily:"var(--sans)", fontWeight:400, fontSize:"0.62rem",
                letterSpacing:"0.2em", textTransform:"uppercase",
              }}>26.04.2026</div>
              <div style={{
                background:"var(--off)", color:"var(--gd)",
                padding:"0.65rem 1.2rem",
                fontFamily:"var(--sans)", fontWeight:300, fontSize:"0.62rem",
                letterSpacing:"0.2em", textTransform:"uppercase",
              }}>Huế · Việt Nam</div>
            </div>
          </div>

          {/* ── Countdown ── */}
          <div style={{
            ...fu(0.78),
            display:"flex", gap:"clamp(0.8rem,4vw,1.8rem)",
            margin:"1.8rem 0 0", alignItems:"flex-start",
          }}>
            {[
              { v:countdown.days,    l:"Ngày" },
              { v:countdown.hours,   l:"Giờ" },
              { v:countdown.minutes, l:"Phút" },
              { v:countdown.seconds, l:"Giây" },
            ].map((item, i) => (
              <div key={i} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"0.25rem" }}>
                <div style={{
                  background:"var(--off)", border:"1px solid var(--gl)",
                  width:"clamp(50px,13vw,68px)", height:"clamp(50px,13vw,68px)",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  position:"relative",
                }}>
                  <span style={{
                    fontFamily:"var(--serif)", fontWeight:300,
                    fontSize:"clamp(1.3rem,4.5vw,1.9rem)",
                    color:"var(--gd)", lineHeight:1,
                  }}>
                    {String(item.v ?? 0).padStart(2,"0")}
                  </span>
                  <span style={{ position:"absolute", top:"3px", left:"3px", width:"6px", height:"6px", borderTop:"1px solid var(--gm)", borderLeft:"1px solid var(--gm)" }}/>
                  <span style={{ position:"absolute", bottom:"3px", right:"3px", width:"6px", height:"6px", borderBottom:"1px solid var(--gm)", borderRight:"1px solid var(--gm)" }}/>
                </div>
                <span style={{ fontFamily:"var(--sans)", fontWeight:300, fontSize:"0.52rem", letterSpacing:"0.3em", textTransform:"uppercase", color:"var(--sage)" }}>
                  {item.l}
                </span>
              </div>
            ))}
          </div>

          {/* ── Tagline — FadeWords ── */}
          <div style={{ margin:"1.6rem 0 2rem" }}>
            <FadeWords
              delay={0.9}
              stagger={0.09}
              duration={0.8}
              style={{
                fontFamily:"var(--serif)", fontStyle:"italic", fontWeight:300,
                fontSize:"clamp(0.88rem,3vw,1.05rem)", color:"var(--sage)",
                lineHeight:1.85, maxWidth:"360px", display:"inline-block",
              }}
            >
              Ngày hôm đó sẽ trọn vẹn hơn khi có sự hiện diện của bạn.
            </FadeWords>
          </div>

          {/* ── CTA ── */}
          <div style={{ ...fu(1.1), display:"flex", gap:"0.8rem", flexWrap:"wrap", justifyContent:"center" }}>
            <a href="#rsvp" className="btn-p" style={{
              padding:"0.9rem 2.2rem",
              background:"var(--g)", color:"var(--white)",
              border:"none", fontFamily:"var(--sans)", fontWeight:400,
              fontSize:"0.66rem", letterSpacing:"0.25em", textTransform:"uppercase",
              cursor:"pointer", transition:"all 0.3s ease", textDecoration:"none",
              display:"inline-block",
            }}>Xác nhận tham dự</a>
            <a href="#story" className="btn-o" style={{
              padding:"0.9rem 2.2rem",
              background:"transparent", color:"var(--gd)",
              border:"1px solid var(--gm)",
              fontFamily:"var(--sans)", fontWeight:300,
              fontSize:"0.66rem", letterSpacing:"0.25em", textTransform:"uppercase",
              cursor:"pointer", transition:"all 0.3s ease", textDecoration:"none",
              display:"inline-block",
            }}>Câu chuyện của chúng tôi</a>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="scroll-ind">
          <span style={{ fontFamily:"var(--sans)", fontWeight:300, fontSize:"0.5rem", letterSpacing:"0.3em", textTransform:"uppercase", color:"var(--g)" }}>Khám phá</span>
          <div className="scroll-line"/>
        </div>
      </section>
    </>
  );
}