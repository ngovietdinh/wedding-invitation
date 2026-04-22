// ============================================================
// STORY TIMELINE — Green Sage + White Theme
// ============================================================

import { useEffect, useRef } from "react";

const MILESTONES = [
  {
    year: "2019", season: "Mùa Thu",
    title: "Lần đầu gặp nhau",
    story: "Không ai trong chúng tôi nghĩ đó là điểm khởi đầu. Chỉ là một buổi chiều bình thường — cho đến khi nhìn lại, mới thấy đó là khoảnh khắc mọi thứ bắt đầu thay đổi.",
    tag: "Chapter 01",
  },
  {
    year: "2020", season: "Mùa Đông",
    title: "Những tin nhắn lúc nửa đêm",
    story: "Thế giới bỗng dưng chậm lại. Và trong khoảng lặng yên đó, hai người lại tìm thấy nhau nhiều hơn — qua những câu chuyện nhỏ, những tiếng cười không có lý do.",
    tag: "Chapter 02",
  },
  {
    year: "2022", season: "Mùa Hè",
    title: "Chuyến đi làm thay đổi tất cả",
    story: "Đà Nẵng, 5 giờ sáng, ngồi bên bờ biển không nói gì. Có những khoảnh khắc không cần lời — chúng tôi biết, từ đây sẽ không đi một mình nữa.",
    tag: "Chapter 03",
  },
  {
    year: "2024", season: "Mùa Xuân",
    title: "Anh hỏi. Em gật đầu.",
    story: "Không có đám đông, không có ánh đèn sân khấu. Chỉ có một câu hỏi chân thành và một câu trả lời đã được biết từ trước — bằng trái tim.",
    tag: "Chapter 04",
  },
  {
    year: "2026", season: "26 · 04",
    title: "Ngày chúng ta bắt đầu",
    story: "Và giờ đây, chúng tôi mời bạn — những người đã là một phần của hành trình này — cùng chứng kiến chương tiếp theo.",
    tag: "Chapter 05",
    highlight: true,
  },
];

function TimelineItem({ m, index }) {
  const ref = useRef(null);
  const isLeft = index % 2 === 0;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { el.style.opacity="1"; el.style.transform="translateY(0)"; obs.disconnect(); } },
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} style={{
      display:"grid",
      gridTemplateColumns:"1fr 60px 1fr",
      alignItems:"start",
      marginBottom:"0",
      opacity:0,
      transform:"translateY(32px)",
      transition:`opacity 0.8s ease ${index*0.12}s, transform 0.8s ease ${index*0.12}s`,
    }}>
      {/* Left */}
      <div style={{ padding:"2rem 2.5rem 2rem 1rem", textAlign:"right" }}>
        {isLeft && <CardContent m={m} align="right" />}
      </div>

      {/* Center node */}
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", position:"relative", zIndex:2 }}>
        <div style={{
          width: m.highlight ? "40px" : "30px",
          height: m.highlight ? "40px" : "30px",
          border: `2px solid ${m.highlight ? "#4A7C59" : "#B8CCBA"}`,
          background: m.highlight ? "#4A7C59" : "#FFFFFF",
          display:"flex", alignItems:"center", justifyContent:"center",
          flexShrink:0, marginTop:"2.2rem",
          boxShadow: m.highlight ? "0 0 0 6px rgba(74,124,89,0.1)" : "none",
          transition:"all 0.3s",
        }}>
          {m.highlight
            ? <span style={{ color:"#fff", fontSize:"0.8rem" }}>♥</span>
            : <span style={{ width:"8px", height:"8px", borderRadius:"50%", background:"#7FA882", display:"block" }}/>
          }
        </div>
      </div>

      {/* Right */}
      <div style={{ padding:"2rem 1rem 2rem 2.5rem" }}>
        {!isLeft && <CardContent m={m} align="left" />}
      </div>
    </div>
  );
}

function CardContent({ m, align }) {
  return (
    <div style={{ textAlign: align }}>
      <span style={{
        display:"inline-block",
        background: m.highlight ? "#4A7C59" : "#E8F0E8",
        color: m.highlight ? "#FFFFFF" : "#4A7C59",
        fontFamily:"'DM Sans',sans-serif", fontWeight:400,
        fontSize:"0.55rem", letterSpacing:"0.3em", textTransform:"uppercase",
        padding:"0.25rem 0.7rem", marginBottom:"0.8rem",
      }}>{m.tag}</span>

      <p style={{
        fontFamily:"'DM Sans',sans-serif", fontWeight:300, fontSize:"0.65rem",
        letterSpacing:"0.25em", textTransform:"uppercase",
        color:"#8FA892", marginBottom:"0.3rem",
      }}>{m.season}</p>

      <p style={{
        fontFamily:"'Playfair Display',serif", fontWeight:400,
        fontSize:"clamp(2rem,5vw,3rem)",
        color:"#B8CCBA", lineHeight:1, marginBottom:"0.4rem",
      }}>{m.year}</p>

      <h3 style={{
        fontFamily:"'Playfair Display',serif", fontStyle:"italic",
        fontWeight:400, fontSize:"clamp(0.95rem,2.5vw,1.2rem)",
        color:"#1A3A28", marginBottom:"0.7rem", lineHeight:1.3,
      }}>{m.title}</h3>

      <p style={{
        fontFamily:"'DM Sans',sans-serif", fontWeight:300,
        fontSize:"0.78rem", color:"#5A7A62",
        lineHeight:1.85, maxWidth:"240px",
        marginLeft: align==="right" ? "auto" : "0",
      }}>{m.story}</p>
    </div>
  );
}

export default function StoryTimeline() {
  const lineRef = useRef(null);

  useEffect(() => {
    const el = lineRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) el.classList.add("line-grow"); },
      { threshold: 0.05 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;1,400&family=DM+Sans:wght@200;300;400&display=swap');
        .tl-fill { height:0%; background:linear-gradient(180deg,#4A7C59,#2D5A3D); width:100%; position:absolute; top:0; }
        .line-grow .tl-fill { animation: growLine 2s ease forwards; }
        @keyframes growLine { from{height:0%} to{height:100%} }
        @media(max-width:640px){
          .tl-grid { display:flex !important; flex-direction:column !important; padding-left:2.5rem !important; }
          .tl-center { position:absolute !important; left:0.6rem !important; }
          .tl-left-col { display:none; }
        }
      `}</style>

      <section id="story" style={{
        background:"#F7F9F6", padding:"clamp(4rem,8vw,6rem) 1.5rem",
        fontFamily:"'DM Sans',sans-serif",
      }}>
        <div style={{ maxWidth:"820px", margin:"0 auto" }}>

          {/* Header */}
          <div style={{ textAlign:"center", marginBottom:"4rem" }}>
            <div style={{ display:"inline-flex", alignItems:"center", gap:"0.8rem", marginBottom:"1.2rem" }}>
              <div style={{ width:"30px", height:"1px", background:"#7FA882" }}/>
              <span style={{ fontFamily:"'DM Sans',sans-serif", fontWeight:300,
                fontSize:"0.6rem", letterSpacing:"0.4em", textTransform:"uppercase", color:"#4A7C59" }}>
                Hành trình của chúng tôi
              </span>
              <div style={{ width:"30px", height:"1px", background:"#7FA882" }}/>
            </div>
            <h2 style={{
              fontFamily:"'Playfair Display',serif", fontStyle:"italic",
              fontWeight:400, fontSize:"clamp(2rem,7vw,3.5rem)",
              color:"#1A3A28", lineHeight:1.15, margin:0,
            }}>
              Từ lần đầu gặp gỡ<br/>đến mãi mãi
            </h2>
          </div>

          {/* Timeline */}
          <div ref={lineRef} style={{ position:"relative" }}>
            {/* Spine */}
            <div style={{
              position:"absolute", left:"calc(50% - 0.5px)", top:0,
              width:"1px", height:"100%",
              background:"#E8F0E8",
            }}>
              <div className="tl-fill"/>
            </div>

            {MILESTONES.map((m, i) => <TimelineItem key={m.year} m={m} index={i} />)}
          </div>
        </div>
      </section>
    </>
  );
}