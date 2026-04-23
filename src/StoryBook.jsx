// ============================================================
// STORY BOOK — Cuốn sổ 3D lật trang thật
// Thay thế StoryTimeline
// ============================================================

import { useState, useRef } from "react";

const PAGES = [
  // Bìa sổ — trang 0
  {
    id: 0,
    type: "cover",
    front: {
      bg: "linear-gradient(145deg,#1a3a28,#2d5a3d)",
      content: (
        <div style={{ display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100%",gap:"0.8rem",padding:"2rem",textAlign:"center" }}>
          <svg viewBox="0 0 80 80" width="60" style={{opacity:0.6}}>
            <circle cx="40" cy="40" r="30" stroke="rgba(184,204,186,0.5)" strokeWidth="1" fill="none"/>
            <path d="M25 40 Q40 20 55 40 Q40 60 25 40Z" fill="rgba(127,168,130,0.3)"/>
            <circle cx="40" cy="40" r="5" fill="rgba(127,168,130,0.6)"/>
          </svg>
          <p style={{fontFamily:"'DM Sans',sans-serif",fontWeight:200,fontSize:"0.55rem",letterSpacing:"0.4em",textTransform:"uppercase",color:"rgba(184,204,186,0.6)",margin:0}}>
            Câu chuyện của chúng tôi
          </p>
          <h2 style={{fontFamily:"'Playfair Display',serif",fontStyle:"italic",fontWeight:400,fontSize:"clamp(1.4rem,4vw,2rem)",color:"rgba(232,240,232,0.95)",lineHeight:1.2,margin:0}}>
            Bảo Ngân<br/>&amp; Viết Định
          </h2>
          <div style={{width:"40px",height:"1px",background:"rgba(127,168,130,0.4)",margin:"0.2rem 0"}}/>
          <p style={{fontFamily:"'DM Sans',sans-serif",fontWeight:200,fontSize:"0.55rem",letterSpacing:"0.3em",color:"rgba(184,204,186,0.5)",margin:0}}>
            2019 — 2026
          </p>
          <p style={{fontFamily:"'Playfair Display',serif",fontStyle:"italic",fontSize:"0.7rem",color:"rgba(127,168,130,0.6)",margin:"0.5rem 0 0",lineHeight:1.6}}>
            Lật trang để bắt đầu →
          </p>
        </div>
      ),
    },
    back: null,
  },
  {
    id: 1,
    type: "spread",
    front: {
      year: "2019",
      season: "Mùa Thu",
      chapter: "Chương 01",
      title: "Lần đầu gặp nhau",
      story: "Không ai trong chúng tôi nghĩ đó là điểm khởi đầu. Chỉ là một buổi chiều bình thường — cho đến khi nhìn lại, mới thấy đó là khoảnh khắc mọi thứ bắt đầu.",
      icon: "✦",
    },
    back: {
      year: "2020",
      season: "Mùa Đông",
      chapter: "Chương 02",
      title: "Những tin nhắn lúc nửa đêm",
      story: "Thế giới bỗng dưng chậm lại. Và trong khoảng lặng yên đó, hai người tìm thấy nhau nhiều hơn — qua những câu chuyện nhỏ và tiếng cười không có lý do.",
      icon: "◇",
      mirror: true,
    },
  },
  {
    id: 2,
    type: "spread",
    front: {
      year: "2022",
      season: "Mùa Hè",
      chapter: "Chương 03",
      title: "Chuyến đi làm thay đổi tất cả",
      story: "Đà Nẵng, 5 giờ sáng, ngồi bên bờ biển không nói gì. Có những khoảnh khắc không cần lời — chúng tôi biết, từ đây sẽ không đi một mình nữa.",
      icon: "○",
    },
    back: {
      year: "2024",
      season: "Mùa Xuân",
      chapter: "Chương 04",
      title: "Anh hỏi. Em gật đầu.",
      story: "Không có đám đông, không có ánh đèn sân khấu. Chỉ có một câu hỏi chân thành và một câu trả lời đã được biết từ trước — bằng trái tim.",
      icon: "◈",
      mirror: true,
    },
  },
  {
    id: 3,
    type: "spread",
    front: {
      year: "2026",
      season: "26 · 04",
      chapter: "Chương Cuối",
      title: "Ngày chúng ta bắt đầu",
      story: "Và giờ đây, chúng tôi mời bạn — những người đã là một phần của hành trình này — cùng chứng kiến chương tiếp theo của câu chuyện dài.",
      icon: "❋",
      highlight: true,
    },
    back: {
      type: "endpaper",
    },
  },
];

// ── Nội dung 1 trang ──
function PageContent({ data, side = "front" }) {
  if (!data) return null;

  if (data.type === "cover") {
    return data.content;
  }

  if (data.type === "endpaper") {
    return (
      <div style={{
        display:"flex", flexDirection:"column",
        alignItems:"center", justifyContent:"center",
        height:"100%", gap:"1rem", padding:"2rem", textAlign:"center",
        background:"linear-gradient(135deg,#f7faf7,#e8f0e8)",
      }}>
        <div style={{fontSize:"2rem",opacity:0.5}}>❋</div>
        <p style={{fontFamily:"'Playfair Display',serif",fontStyle:"italic",fontWeight:400,fontSize:"clamp(1rem,3vw,1.3rem)",color:"#2d5a3d",lineHeight:1.5,maxWidth:"80%"}}>
          "Hai người, một hành trình —<br/>chúng tôi muốn bắt đầu<br/>cùng sự hiện diện của bạn."
        </p>
        <div style={{width:"40px",height:"1px",background:"rgba(74,124,89,0.3)"}}/>
        <p style={{fontFamily:"'Playfair Display',serif",fontStyle:"italic",fontSize:"0.85rem",color:"#4A7C59"}}>
          Bảo Ngân &amp; Viết Định
        </p>
        <p style={{fontFamily:"'DM Sans',sans-serif",fontWeight:200,fontSize:"0.55rem",letterSpacing:"0.3em",color:"#8FA892",textTransform:"uppercase"}}>
          26 · 04 · 2026
        </p>
      </div>
    );
  }

  const isMirror = data.mirror;

  return (
    <div style={{
      height:"100%", padding:"clamp(1.2rem,4vw,2rem)",
      display:"flex", flexDirection:"column",
      justifyContent:"space-between",
      background: data.highlight
        ? "linear-gradient(135deg,#1a3a28,#2d5a3d)"
        : side==="back"
          ? "linear-gradient(135deg,#f0f5f0,#ffffff)"
          : "linear-gradient(135deg,#ffffff,#f7faf7)",
      position:"relative", overflow:"hidden",
    }}>
      {/* Số trang */}
      <div style={{
        position:"absolute", bottom:"1rem",
        [isMirror ? "left" : "right"]:"1.2rem",
        fontFamily:"'DM Sans',sans-serif", fontWeight:200,
        fontSize:"0.5rem", color: data.highlight ? "rgba(184,204,186,0.5)" : "#B8CCBA",
        letterSpacing:"0.2em",
      }}>{data.highlight ? "♥" : `— ${data.chapter?.split(" ")[1] || ""} —`}</div>

      {/* Đường kẻ trang trí */}
      <div style={{
        position:"absolute", top:0, [isMirror?"right":"left"]:0, bottom:0, width:"3px",
        background: data.highlight
          ? "linear-gradient(180deg,transparent,rgba(127,168,130,0.4),transparent)"
          : "linear-gradient(180deg,transparent,rgba(127,168,130,0.15),transparent)",
      }}/>

      <div style={{display:"flex",flexDirection:"column",gap:"0.5rem"}}>
        {/* Chapter tag */}
        <span style={{
          display:"inline-block",
          background: data.highlight ? "rgba(127,168,130,0.2)" : "#E8F0E8",
          color: data.highlight ? "rgba(184,204,186,0.9)" : "#4A7C59",
          fontFamily:"'DM Sans',sans-serif", fontWeight:300,
          fontSize:"0.5rem", letterSpacing:"0.3em",
          textTransform:"uppercase", padding:"0.2rem 0.7rem",
          alignSelf:"flex-start",
        }}>{data.chapter}</span>

        {/* Season */}
        <p style={{
          fontFamily:"'DM Sans',sans-serif", fontWeight:200,
          fontSize:"0.55rem", letterSpacing:"0.28em",
          textTransform:"uppercase",
          color: data.highlight ? "rgba(127,168,130,0.7)" : "#8FA892",
          margin:0,
        }}>{data.season}</p>

        {/* Year */}
        <p style={{
          fontFamily:"'Playfair Display',serif", fontWeight:400,
          fontSize:"clamp(2.2rem,7vw,3.5rem)",
          color: data.highlight ? "rgba(184,204,186,0.25)" : "rgba(127,168,130,0.18)",
          lineHeight:1, margin:0, letterSpacing:"-0.02em",
        }}>{data.year}</p>

        {/* Icon */}
        <div style={{
          fontSize:"1.2rem",
          color: data.highlight ? "rgba(127,168,130,0.7)" : "#7FA882",
          margin:"-0.5rem 0 -0.2rem",
        }}>{data.icon}</div>

        {/* Title */}
        <h3 style={{
          fontFamily:"'Playfair Display',serif", fontStyle:"italic",
          fontWeight:400, fontSize:"clamp(0.9rem,2.8vw,1.2rem)",
          color: data.highlight ? "rgba(232,240,232,0.95)" : "#1A3A28",
          lineHeight:1.3, margin:0,
        }}>{data.title}</h3>
      </div>

      {/* Story */}
      <p style={{
        fontFamily:"'DM Sans',sans-serif", fontWeight:200,
        fontSize:"clamp(0.62rem,1.8vw,0.78rem)",
        color: data.highlight ? "rgba(184,204,186,0.75)" : "#5A7A62",
        lineHeight:1.85, margin:"auto 0 0",
        paddingTop:"0.8rem",
      }}>{data.story}</p>
    </div>
  );
}

// ── MAIN STORYBOOK ──
export default function StoryBook() {
  const [currentPage, setCurrentPage] = useState(0);
  const [flipping, setFlipping] = useState(false);
  const [flipDir, setFlipDir] = useState(null); // "next" | "prev"
  const [showBack, setShowBack] = useState(false);

  const totalPages = PAGES.length;

  const flip = (dir) => {
    if (flipping) return;
    if (dir === "next" && currentPage >= totalPages - 1) return;
    if (dir === "prev" && currentPage <= 0) return;

    setFlipping(true);
    setFlipDir(dir);
    setShowBack(false);

    // Midpoint — hiện mặt sau
    setTimeout(() => setShowBack(true), 350);

    // Kết thúc flip
    setTimeout(() => {
      setCurrentPage(p => dir === "next" ? p + 1 : p - 1);
      setFlipping(false);
      setFlipDir(null);
      setShowBack(false);
    }, 750);
  };

  const page = PAGES[currentPage];
  const nextPage = PAGES[currentPage + 1];

  const flipStyle = flipping ? {
    transform: flipDir === "next"
      ? `rotateY(-180deg)`
      : `rotateY(180deg)`,
    transition: "transform 0.75s cubic-bezier(0.645,0.045,0.355,1.000)",
  } : {};

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;1,400&family=DM+Sans:wght@200;300;400&display=swap');

        .book-wrap {
          perspective: 2000px;
          perspective-origin: 50% 40%;
        }
        .book-inner {
          position: relative;
          width: 100%; height: 100%;
          transform-style: preserve-3d;
        }
        .page-face {
          position: absolute; inset: 0;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          overflow: hidden;
        }
        .page-front { transform: rotateY(0deg); }
        .page-back  { transform: rotateY(180deg); }

        .flip-page {
          position: absolute; inset: 0;
          transform-style: preserve-3d;
          transform-origin: left center;
          z-index: 10;
        }

        .nav-btn {
          background: rgba(74,124,89,0.08);
          border: 1px solid rgba(127,168,130,0.2);
          color: #4A7C59; cursor: pointer;
          width: 42px; height: 42px;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.1rem; transition: all 0.2s ease;
          font-family: serif;
          flex-shrink: 0;
        }
        .nav-btn:hover:not(:disabled) {
          background: rgba(74,124,89,0.18);
          border-color: rgba(74,124,89,0.4);
          transform: scale(1.05);
        }
        .nav-btn:disabled { opacity: 0.25; cursor: default; }

        .page-indicator {
          display: flex; gap: 6px; align-items: center;
        }
        .pi-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #B8CCBA; transition: all 0.3s ease;
        }
        .pi-dot.active {
          background: #4A7C59;
          transform: scale(1.3);
        }
      `}</style>

      <section id="story" style={{
        background:"#F7F9F6",
        padding:"clamp(4rem,8vw,6rem) 1.5rem",
        fontFamily:"'DM Sans',sans-serif",
      }}>
        {/* Header */}
        <div style={{ textAlign:"center", marginBottom:"2.5rem" }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:"0.8rem", marginBottom:"1rem" }}>
            <div style={{ width:"30px", height:"1px", background:"linear-gradient(90deg,transparent,#7FA882)" }}/>
            <span style={{ fontFamily:"'DM Sans',sans-serif", fontWeight:300, fontSize:"0.6rem", letterSpacing:"0.4em", textTransform:"uppercase", color:"#4A7C59" }}>
              Hành trình của chúng tôi
            </span>
            <div style={{ width:"30px", height:"1px", background:"linear-gradient(90deg,#7FA882,transparent)" }}/>
          </div>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontStyle:"italic", fontWeight:400, fontSize:"clamp(2rem,7vw,3.2rem)", color:"#1A3A28", lineHeight:1.15, margin:0 }}>
            Cuốn Sổ Tình Yêu
          </h2>
        </div>

        {/* Book */}
        <div style={{ maxWidth:"680px", margin:"0 auto" }}>
          {/* Book container */}
          <div
            className="book-wrap"
            style={{
              width:"100%",
              height:"clamp(320px,55vw,480px)",
              position:"relative",
            }}
          >
            {/* Bìa sổ - shadow */}
            <div style={{
              position:"absolute", inset:0,
              boxShadow:"0 20px 60px rgba(26,58,40,0.2), 0 8px 24px rgba(26,58,40,0.12)",
              borderRadius:"4px 8px 8px 4px",
              pointerEvents:"none", zIndex:0,
            }}/>

            {/* Gáy sổ */}
            <div style={{
              position:"absolute", left:"-10px", top:"2%", bottom:"2%",
              width:"20px", borderRadius:"4px 0 0 4px",
              background:"linear-gradient(90deg,#1a3a28,#2d5a3d)",
              boxShadow:"-4px 0 12px rgba(0,0,0,0.3)",
              zIndex:1,
            }}>
              {[20,40,60,80].map(pct => (
                <div key={pct} style={{
                  position:"absolute", left:"3px", right:"3px",
                  top:`${pct}%`, height:"1px",
                  background:"rgba(127,168,130,0.25)",
                }}/>
              ))}
            </div>

            {/* Trang hiện tại */}
            <div style={{
              position:"absolute", inset:0,
              display:"grid", gridTemplateColumns:"1fr 1fr",
              borderRadius:"0 4px 4px 0",
              overflow:"hidden",
              background:"#fff",
            }}>
              {/* Trang trái */}
              <div style={{
                borderRight:"1px solid rgba(127,168,130,0.15)",
                background:"linear-gradient(135deg,#ffffff,#f7faf7)",
                position:"relative",
              }}>
                {page?.front && <PageContent data={page.type==="cover" ? page.front : page.front} side="front"/>}
              </div>

              {/* Trang phải */}
              <div style={{ position:"relative", background:"linear-gradient(135deg,#f7faf7,#f0f5f0)" }}>
                {page?.back ? (
                  <PageContent data={page.back} side="back"/>
                ) : nextPage ? (
                  <div style={{
                    height:"100%", display:"flex",
                    alignItems:"center", justifyContent:"center",
                    opacity:0.3,
                  }}>
                    <p style={{ fontFamily:"'Playfair Display',serif", fontStyle:"italic", fontSize:"0.8rem", color:"#8FA892" }}>
                      Lật trang →
                    </p>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Flip animation overlay */}
            {flipping && (
              <div className="flip-page" style={flipStyle}>
                <div className="page-face page-front" style={{ background:"linear-gradient(135deg,#ffffff,#f7faf7)" }}>
                  {page?.front && <PageContent data={page.front} side="front"/>}
                </div>
                <div className="page-face page-back" style={{
                  background: page?.back?.highlight
                    ? "linear-gradient(135deg,#1a3a28,#2d5a3d)"
                    : "linear-gradient(135deg,#f0f5f0,#ffffff)",
                }}>
                  {showBack && page?.back && <PageContent data={page.back} side="back"/>}
                </div>
              </div>
            )}

            {/* Line ngang trang */}
            <div style={{
              position:"absolute", top:"50%", left:"10px", right:0,
              height:"1px", background:"rgba(127,168,130,0.08)",
              pointerEvents:"none",
            }}/>
          </div>

          {/* Navigation */}
          <div style={{
            display:"flex", alignItems:"center",
            justifyContent:"space-between",
            marginTop:"1.5rem", padding:"0 0.5rem",
          }}>
            <button className="nav-btn" onClick={() => flip("prev")}
              disabled={currentPage === 0 || flipping}>‹</button>

            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"0.6rem" }}>
              <div className="page-indicator">
                {PAGES.map((_, i) => (
                  <div key={i} className={`pi-dot${i===currentPage?" active":""}`}/>
                ))}
              </div>
              <p style={{
                fontFamily:"'DM Sans',sans-serif", fontWeight:200,
                fontSize:"0.58rem", letterSpacing:"0.25em",
                textTransform:"uppercase", color:"#8FA892", margin:0,
              }}>
                {currentPage === 0 ? "Bìa sổ"
                  : currentPage === PAGES.length-1 ? "Kết thúc"
                  : `Trang ${currentPage} / ${PAGES.length - 2}`}
              </p>
            </div>

            <button className="nav-btn" onClick={() => flip("next")}
              disabled={currentPage === totalPages - 1 || flipping}>›</button>
          </div>

          {/* Shortcut keys hint */}
          <p style={{
            textAlign:"center", marginTop:"0.8rem",
            fontFamily:"'DM Sans',sans-serif", fontWeight:200,
            fontSize:"0.55rem", letterSpacing:"0.2em",
            color:"#B8CCBA",
          }}>
            Nhấn ‹ › để lật trang • Vuốt trái/phải trên mobile
          </p>
        </div>
      </section>
    </>
  );
}
