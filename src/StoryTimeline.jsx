// ============================================================
// STORY TIMELINE — với Text Reveal animations
// ============================================================

import { useEffect, useRef, useState } from "react";
import { SlideReveal, FadeWords, HeadingReveal, CharStagger, ScrollLine, GlowReveal } from "./TextReveal";

const MILESTONES = [
  { year:"2019", season:"Mùa Thu", chapter:"Chapter 01", title:"Lần đầu gặp nhau",       story:"Không ai trong chúng tôi nghĩ đó là điểm khởi đầu. Chỉ là một buổi chiều bình thường — cho đến khi nhìn lại, mới thấy đó là khoảnh khắc mọi thứ bắt đầu thay đổi.", tag:"01" },
  { year:"2020", season:"Mùa Đông", chapter:"Chapter 02", title:"Những tin nhắn lúc nửa đêm", story:"Thế giới bỗng dưng chậm lại. Và trong khoảng lặng yên đó, hai người lại tìm thấy nhau nhiều hơn — qua những câu chuyện nhỏ, những tiếng cười không có lý do.",          tag:"02" },
  { year:"2022", season:"Mùa Hè",   chapter:"Chapter 03", title:"Chuyến đi làm thay đổi tất cả", story:"Đà Nẵng, 5 giờ sáng, ngồi bên bờ biển không nói gì. Có những khoảnh khắc không cần lời — chúng tôi biết, từ đây sẽ không đi một mình nữa.",                         tag:"03" },
  { year:"2024", season:"Mùa Xuân", chapter:"Chapter 04", title:"Anh hỏi. Em gật đầu.",   story:"Không có đám đông, không có ánh đèn sân khấu. Chỉ có một câu hỏi chân thành và một câu trả lời đã được biết từ trước — bằng trái tim.",                                    tag:"04" },
  { year:"2026", season:"26 · 04",  chapter:"Chapter 05", title:"Ngày chúng ta bắt đầu",  story:"Và giờ đây, chúng tôi mời bạn — những người đã là một phần của hành trình này — cùng chứng kiến chương tiếp theo.",                                                          tag:"05", highlight:true },
];

function TimelineItem({ m, index }) {
  const ref   = useRef(null);
  const [vis, setVis] = useState(false);
  const isLeft = index % 2 === 0;

  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } },
      { threshold: 0.18 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const cardStyle = {
    opacity:   vis ? 1 : 0,
    transform: vis ? "translateX(0)" : `translateX(${isLeft ? -40 : 40}px)`,
    transition:`opacity 0.9s ease ${index*0.1}s, transform 0.9s cubic-bezier(0.22,1,0.36,1) ${index*0.1}s`,
  };

  return (
    <div ref={ref} style={{
      display:"grid",
      gridTemplateColumns:"1fr 56px 1fr",
      alignItems:"start",
      marginBottom:"0",
    }}>
      {/* Left */}
      <div style={{ padding:"2rem 2.5rem 2rem 0.5rem" }}>
        {isLeft && (
          <div style={{ textAlign:"right", ...cardStyle }}>
            <CardContent m={m} align="right"/>
          </div>
        )}
      </div>

      {/* Center node */}
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", position:"relative", zIndex:2 }}>
        <div style={{
          width:  m.highlight ? "38px" : "28px",
          height: m.highlight ? "38px" : "28px",
          border: `2px solid ${m.highlight ? "#4A7C59" : "#B8CCBA"}`,
          background: m.highlight ? "#4A7C59" : "#FFFFFF",
          display:"flex", alignItems:"center", justifyContent:"center",
          flexShrink:0, marginTop:"2.2rem",
          boxShadow: m.highlight ? "0 0 0 6px rgba(74,124,89,0.1)" : "none",
          opacity:   vis ? 1 : 0,
          transform: vis ? "scale(1)" : "scale(0.5)",
          transition:`opacity 0.6s ease ${index*0.1+0.2}s, transform 0.6s cubic-bezier(0.34,1.56,0.64,1) ${index*0.1+0.2}s`,
        }}>
          {m.highlight
            ? <span style={{ color:"#fff", fontSize:"0.75rem" }}>♥</span>
            : <span style={{ width:"7px", height:"7px", borderRadius:"50%", background:"#7FA882", display:"block" }}/>
          }
        </div>
      </div>

      {/* Right */}
      <div style={{ padding:"2rem 0.5rem 2rem 2.5rem" }}>
        {!isLeft && (
          <div style={{ ...cardStyle }}>
            <CardContent m={m} align="left"/>
          </div>
        )}
      </div>
    </div>
  );
}

function CardContent({ m, align }) {
  return (
    <div style={{ textAlign: align }}>
      {/* Chapter tag */}
      <span style={{
        display:"inline-block",
        background: m.highlight ? "#4A7C59" : "#E8F0E8",
        color:      m.highlight ? "#FFFFFF" : "#4A7C59",
        fontFamily:"'Jost',sans-serif", fontWeight:400,
        fontSize:"8.5px", letterSpacing:"0.3em", textTransform:"uppercase",
        padding:"2px 9px", marginBottom:"0.6rem",
      }}>{m.chapter}</span>

      {/* Season */}
      <p style={{
        fontFamily:"'Jost',sans-serif", fontWeight:300, fontSize:"9px",
        letterSpacing:"0.25em", textTransform:"uppercase",
        color:"#8FA892", marginBottom:"0.3rem",
      }}>{m.season}</p>

      {/* Year — CharStagger */}
      <CharStagger
        delay={0.1}
        stagger={0.06}
        direction={align === "right" ? "right" : "left"}
        style={{
          fontFamily:"'Cormorant Garamond',serif", fontWeight:300,
          fontSize:"clamp(2rem,5.5vw,3rem)",
          color:"rgba(127,168,130,0.16)", lineHeight:1,
          marginBottom:"0.3rem", display:"block",
          justifyContent: align === "right" ? "flex-end" : "flex-start",
        }}
      >{m.year}</CharStagger>

      {/* Title — SlideReveal */}
      <SlideReveal
        delay={0.15}
        style={{
          fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic",
          fontWeight:400, fontSize:"clamp(0.9rem,2.4vw,1.1rem)",
          color: m.highlight ? "#1A3A28" : "#1A3A28",
          lineHeight:1.3, marginBottom:"0.65rem",
          display:"block", textAlign:align,
        }}
      >{m.title}</SlideReveal>

      {/* Story — FadeWords */}
      <FadeWords
        delay={0.25}
        stagger={0.04}
        style={{
          fontFamily:"'Jost',sans-serif", fontWeight:300,
          fontSize:"clamp(0.62rem,1.6vw,0.75rem)",
          color:"#5A7A62", lineHeight:1.9,
          maxWidth:"240px",
          marginLeft: align === "right" ? "auto" : "0",
          display:"block", textAlign:align,
        }}
      >{m.story}</FadeWords>
    </div>
  );
}

export default function StoryTimeline() {
  const lineRef = useRef(null);
  const [lineVis, setLineVis] = useState(false);

  useEffect(() => {
    const el = lineRef.current; if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setLineVis(true); },
      { threshold: 0.05 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Jost:wght@300;400&display=swap');
        .tl-fill{height:0%;background:linear-gradient(180deg,#4A7C59,#2D5A3D);width:100%;position:absolute;top:0;}
        .line-grow .tl-fill{animation:growLine 2.5s ease forwards;}
        @keyframes growLine{from{height:0%}to{height:100%}}
        @media(max-width:640px){
          .tl-row{display:flex!important;flex-direction:column!important;padding-left:2.5rem!important;}
          .tl-center{position:absolute!important;left:0.6rem!important;}
          .tl-left-col{display:none!important;}
        }
      `}</style>

      <section id="story" style={{
        background:"#F7F9F6", padding:"clamp(4rem,8vw,6rem) 1.5rem",
        fontFamily:"'Jost',sans-serif",
      }}>
        <div style={{ maxWidth:"820px", margin:"0 auto" }}>

          {/* ── Header ── */}
          <div style={{ textAlign:"center", marginBottom:"4rem" }}>
            <div style={{ display:"inline-flex", alignItems:"center", gap:"0.8rem", marginBottom:"1.2rem" }}>
              <ScrollLine delay={0.2} duration={1.2} style={{ width:"28px" }}
                color="linear-gradient(90deg,transparent,#7FA882)"/>
              <span style={{
                fontFamily:"'Jost',sans-serif", fontWeight:300,
                fontSize:"0.6rem", letterSpacing:"0.4em",
                textTransform:"uppercase", color:"#4A7C59",
              }}>Hành trình của chúng tôi</span>
              <ScrollLine delay={0.2} duration={1.2} style={{ width:"28px" }}
                color="linear-gradient(90deg,#7FA882,transparent)"/>
            </div>

            {/* Tiêu đề — HeadingReveal + floating */}
            <HeadingReveal delay={0.1} float={true}>
              <h2 style={{
                fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic",
                fontWeight:300, fontSize:"clamp(2rem,7vw,3.5rem)",
                color:"#1A3A28", lineHeight:1.15, margin:0,
              }}>
                Từ lần đầu gặp gỡ<br/>đến mãi mãi
              </h2>
            </HeadingReveal>
          </div>

          {/* ── Timeline ── */}
          <div ref={lineRef} className={lineVis ? "line-grow" : ""} style={{ position:"relative" }}>
            {/* Spine */}
            <div style={{
              position:"absolute", left:"calc(50% - 0.5px)", top:0,
              width:"1px", height:"100%", background:"#E8F0E8",
            }}>
              <div className="tl-fill"/>
            </div>

            {MILESTONES.map((m, i) => <TimelineItem key={m.year} m={m} index={i}/>)}
          </div>
        </div>
      </section>
    </>
  );
}