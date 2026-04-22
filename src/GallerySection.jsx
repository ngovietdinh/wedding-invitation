// ============================================================
// GALLERY SECTION — Green Sage + White Modern Theme
// Bảo Ngân & Viết Định
// ============================================================
// ĐẶT ẢNH VÀO: public/gallery/
// Ví dụ: public/gallery/couple-01.jpg
// ============================================================

import { useState, useEffect, useRef, useCallback } from "react";

// ============================================================
// CẬP NHẬT DANH SÁCH ẢNH/VIDEO CỦA BẠN Ở ĐÂY
// size: "tall" | "wide" | "square"
// ============================================================
const MEDIA = [
  {
    id:1, type:"image",
    src:"/gallery/2.jpg",
    thumb:"/gallery/2.jpg",
    alt:"Bảo Ngân & Viết Định",
    category:"couple", size:"tall",
    caption:"Lần đầu chụp ảnh cùng nhau",
  },
  {
    id:2, type:"image",
    src:"/gallery/1.jpg",
    thumb:"/gallery/1.jpg",
    alt:"Bảo Ngân & Viết Định",
    category:"couple", size:"square",
    caption:"",
  },
  {
    id:3, type:"image",
    src:"/gallery/3.jpg",
    thumb:"/gallery/3.jpg",
    alt:"",
    category:"couple", size:"wide",
    caption:"Chuyến đi Đà Nẵng",
  },
  {
    id:4, type:"image",
    src:"/gallery/1.jpg",
    thumb:"/gallery/1.jpg",
    alt:"Lễ đính hôn",
    category:"engagement", size:"tall",
    caption:"Ngày anh hỏi",
  },
  {
    id:5, type:"image",
    src:"/gallery/2.jpg",
    thumb:"/gallery/2.jpg",
    alt:"Lễ đính hôn",
    category:"engagement", size:"square",
    caption:"",
  },
  {
    id:6, type:"image",
    src:"/gallery/3.jpg",
    thumb:"/gallery/3.jpg",
    alt:"Nhẫn đính hôn",
    category:"engagement", size:"square",
    caption:"Chiếc nhẫn em đã đợi",
  },
  {
    id:7, type:"image",
    src:"/gallery/1.jpg",
    thumb:"/gallery/1.jpg",
    alt:"Ảnh cưới",
    category:"wedding", size:"wide",
    caption:"",
  },
  {
    id:8, type:"image",
    src:"/gallery/2.jpg",
    thumb:"/gallery/2.jpg",
    alt:"Ảnh cưới",
    category:"wedding", size:"tall",
    caption:"Áo dài trắng",
  },
  {
    id:9, type:"image",
    src:"/gallery/3.jpg",
    thumb:"/gallery/3.jpg",
    alt:"Ảnh cưới",
    category:"wedding", size:"square",
    caption:"",
  },
  {
    id:10, type:"video",
    src:"/gallery/highlight.mp4",
    poster:"/gallery/video-poster.jpg",
    alt:"Video highlight",
    category:"video", size:"wide",
    caption:"Our Story — Highlight Film",
    duration:"3:24",
  },
];

const FILTERS = [
  { val:"all",        label:"Tất cả" },
  { val:"couple",     label:"Couple" },
  { val:"engagement", label:"Đính hôn" },
  { val:"wedding",    label:"Cưới" },
  { val:"video",      label:"Video" },
];

// ============================================================
// LIGHTBOX
// ============================================================
function Lightbox({ items, startIndex, onClose }) {
  const [cur, setCur] = useState(startIndex);
  const [zoomed, setZoomed] = useState(false);
  const item = items[cur];

  const prev = useCallback(() => { setZoomed(false); setCur(c => (c - 1 + items.length) % items.length); }, [items.length]);
  const next = useCallback(() => { setZoomed(false); setCur(c => (c + 1) % items.length); }, [items.length]);

  useEffect(() => {
    const fn = (e) => {
      if (e.key === "ArrowLeft")  prev();
      if (e.key === "ArrowRight") next();
      if (e.key === "Escape")     onClose();
    };
    window.addEventListener("keydown", fn);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", fn); document.body.style.overflow = ""; };
  }, [prev, next, onClose]);

  return (
    <div style={{
      position:"fixed", inset:0, zIndex:9999,
      background:"rgba(26,58,40,0.96)",
      display:"flex", alignItems:"center", justifyContent:"center",
      animation:"lbIn 0.25s ease",
    }} onClick={onClose}>
      <style>{`@keyframes lbIn{from{opacity:0}to{opacity:1}}`}</style>

      <div style={{
        position:"relative", width:"100%", maxWidth:"960px",
        display:"flex", flexDirection:"column", alignItems:"center",
        padding:"3rem 4rem 6rem", gap:"1rem",
      }} onClick={e => e.stopPropagation()}>

        {/* Close */}
        <button onClick={onClose} style={{
          position:"absolute", top:"0.8rem", right:"1.2rem",
          background:"transparent", border:"1px solid rgba(184,204,186,0.3)",
          color:"#B8CCBA", fontSize:"1rem", cursor:"pointer",
          fontFamily:"'DM Sans',sans-serif", padding:"0.4rem 0.8rem",
          letterSpacing:"0.15em", transition:"all 0.2s",
        }}>ESC ✕</button>

        {/* Counter */}
        <span style={{
          fontFamily:"'DM Sans',sans-serif", fontWeight:300,
          fontSize:"0.6rem", letterSpacing:"0.4em",
          textTransform:"uppercase", color:"#7FA882",
        }}>{cur + 1} / {items.length}</span>

        {/* Media */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", width:"100%", overflow:"hidden", minHeight:"300px" }}>
          {item.type === "video" ? (
            <video src={item.src} poster={item.poster} controls autoPlay
              style={{ maxWidth:"100%", maxHeight:"75vh", outline:"none" }}/>
          ) : (
            <img src={item.src} alt={item.alt}
              onClick={() => setZoomed(z => !z)}
              style={{
                maxWidth:"100%", maxHeight:"75vh", objectFit:"contain",
                cursor: zoomed ? "zoom-out" : "zoom-in",
                transform: zoomed ? "scale(1.75)" : "scale(1)",
                transition:"transform 0.4s cubic-bezier(0.4,0,0.2,1)",
              }}/>
          )}
        </div>

        {/* Caption */}
        {item.caption && (
          <p style={{
            fontFamily:"'Playfair Display',serif", fontStyle:"italic",
            fontWeight:400, fontSize:"1rem", color:"#B8CCBA",
            textAlign:"center", maxWidth:"400px", lineHeight:1.6,
          }}>{item.caption}</p>
        )}

        {/* Nav buttons */}
        <button onClick={prev} style={{
          position:"absolute", left:"0.5rem", top:"50%", transform:"translateY(-50%)",
          background:"rgba(232,240,232,0.08)", border:"1px solid rgba(184,204,186,0.2)",
          color:"#B8CCBA", fontSize:"2rem", cursor:"pointer",
          width:"46px", height:"64px", display:"flex", alignItems:"center", justifyContent:"center",
          transition:"all 0.2s",
        }}>‹</button>
        <button onClick={next} style={{
          position:"absolute", right:"0.5rem", top:"50%", transform:"translateY(-50%)",
          background:"rgba(232,240,232,0.08)", border:"1px solid rgba(184,204,186,0.2)",
          color:"#B8CCBA", fontSize:"2rem", cursor:"pointer",
          width:"46px", height:"64px", display:"flex", alignItems:"center", justifyContent:"center",
          transition:"all 0.2s",
        }}>›</button>

        {/* Thumbnail strip */}
        <div style={{
          position:"absolute", bottom:"0.8rem", left:"50%", transform:"translateX(-50%)",
          display:"flex", gap:"0.4rem", overflowX:"auto", maxWidth:"90vw", padding:"0.3rem",
        }}>
          {items.map((m, i) => (
            <div key={m.id} onClick={() => { setZoomed(false); setCur(i); }} style={{
              width:"46px", height:"46px", flexShrink:0, cursor:"pointer",
              overflow:"hidden", position:"relative",
              border: i === cur ? "2px solid #4A7C59" : "2px solid transparent",
              opacity: i === cur ? 1 : 0.45,
              transition:"all 0.2s",
            }}>
              <img src={m.type==="video" ? m.poster : m.thumb} alt=""
                style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
              {m.type === "video" && (
                <div style={{
                  position:"absolute", inset:0, display:"flex",
                  alignItems:"center", justifyContent:"center",
                  background:"rgba(26,58,40,0.5)", color:"#fff", fontSize:"0.65rem",
                }}>▶</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// CURTAIN
// ============================================================
function Curtain({ revealed }) {
  const common = {
    position:"absolute", top:0, bottom:0, width:"50%",
    zIndex:10, pointerEvents:"none",
    transition:"transform 1.3s cubic-bezier(0.76,0,0.24,1)",
  };
  return (
    <>
      {/* Left curtain */}
      <div style={{
        ...common, left:0, background:"#F7F9F6",
        transform: revealed ? "translateX(-101%)" : "translateX(0)",
      }}>
        <div style={{
          position:"absolute", right:0, top:0, bottom:0, width:"32px",
          background:"linear-gradient(90deg,transparent,rgba(127,168,130,0.15))",
        }}/>
      </div>
      {/* Right curtain */}
      <div style={{
        ...common, right:0, background:"#F7F9F6",
        transform: revealed ? "translateX(101%)" : "translateX(0)",
      }}>
        <div style={{
          position:"absolute", left:0, top:0, bottom:0, width:"32px",
          background:"linear-gradient(90deg,rgba(127,168,130,0.15),transparent)",
        }}/>
      </div>
      {/* Center label before reveal */}
      {!revealed && (
        <div style={{
          position:"absolute", inset:0, zIndex:11,
          display:"flex", flexDirection:"column",
          alignItems:"center", justifyContent:"center", gap:"0.8rem",
          pointerEvents:"none",
        }}>
          <span style={{
            fontFamily:"'Playfair Display',serif", fontStyle:"italic",
            fontSize:"1.1rem", color:"#4A7C59", opacity:0.7,
          }}>Cuộn xuống để khám phá</span>
          <div style={{
            width:"1px", height:"40px",
            background:"linear-gradient(180deg,#4A7C59,transparent)",
            animation:"scrollPulse 2s ease-in-out infinite",
          }}/>
        </div>
      )}
    </>
  );
}

// ============================================================
// SLIDESHOW HEADER
// ============================================================
function SlideshowHeader() {
  const images = MEDIA.filter(m => m.type === "image");
  const [cur, setCur] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (images.length < 2) return;
    const id = setInterval(() => {
      setFading(true);
      setTimeout(() => { setCur(c => (c + 1) % images.length); setFading(false); }, 550);
    }, 4000);
    return () => clearInterval(id);
  }, [images.length]);

  if (!images.length) return null;

  return (
    <div style={{ width:"100%", height:"clamp(180px,38vw,400px)", position:"relative", overflow:"hidden", marginBottom:"2.5rem" }}>
      <img src={images[cur].src} alt={images[cur].alt} style={{
        width:"100%", height:"100%", objectFit:"cover",
        opacity: fading ? 0 : 1,
        transform: fading ? "scale(1.03)" : "scale(1)",
        transition:"opacity 0.55s ease, transform 0.55s ease",
      }}/>
      {/* Gradient overlay */}
      <div style={{
        position:"absolute", inset:0,
        background:"linear-gradient(180deg,transparent 50%,rgba(26,58,40,0.45) 100%)",
      }}/>
      {/* Dots */}
      <div style={{
        position:"absolute", bottom:"1rem", left:"50%", transform:"translateX(-50%)",
        display:"flex", gap:"0.5rem",
      }}>
        {images.map((_,i) => (
          <div key={i} onClick={() => setCur(i)} style={{
            width: i===cur ? "22px" : "6px", height:"6px",
            borderRadius:"3px", cursor:"pointer",
            background: i===cur ? "#4A7C59" : "rgba(255,255,255,0.4)",
            transition:"all 0.3s ease",
          }}/>
        ))}
      </div>
      {/* Slide counter */}
      <div style={{
        position:"absolute", top:"1rem", right:"1rem",
        background:"rgba(26,58,40,0.6)", padding:"0.3rem 0.8rem",
      }}>
        <span style={{
          fontFamily:"'DM Sans',sans-serif", fontWeight:300,
          fontSize:"0.58rem", letterSpacing:"0.3em", color:"rgba(255,255,255,0.8)",
        }}>{cur+1} / {images.length}</span>
      </div>
    </div>
  );
}

// ============================================================
// GRID ITEM
// ============================================================
function GridItem({ item, index, onOpen, revealed }) {
  const [loaded, setLoaded] = useState(false);

  const spanMap = {
    tall:   { gridRow:"span 2", gridColumn:"span 1" },
    wide:   { gridRow:"span 1", gridColumn:"span 2" },
    square: { gridRow:"span 1", gridColumn:"span 1" },
  };

  return (
    <div onClick={() => onOpen(index)} className="g-item" style={{
      ...spanMap[item.size] || spanMap.square,
      position:"relative", overflow:"hidden",
      cursor:"pointer",
      background:"#E8F0E8",
      opacity: revealed ? 1 : 0,
      transform: revealed ? "scale(1) translateY(0)" : "scale(0.97) translateY(18px)",
      transition:`opacity 0.75s ease ${index*0.07}s, transform 0.75s ease ${index*0.07}s`,
    }}>
      {/* Image */}
      <img
        src={item.type==="video" ? item.poster : item.src}
        alt={item.alt}
        onLoad={() => setLoaded(true)}
        className="g-img"
        style={{
          width:"100%", height:"100%", objectFit:"cover", display:"block",
          opacity: loaded ? 1 : 0,
          transition:"opacity 0.5s ease, transform 0.5s ease",
        }}
      />

      {/* Shimmer while loading */}
      {!loaded && (
        <div style={{
          position:"absolute", inset:0,
          background:"linear-gradient(90deg,#E8F0E8 25%,#F0F5F0 50%,#E8F0E8 75%)",
          backgroundSize:"200% 100%",
          animation:"shimmer 1.5s infinite",
        }}/>
      )}

      {/* Video badge */}
      {item.type==="video" && loaded && (
        <div style={{
          position:"absolute", inset:0,
          display:"flex", flexDirection:"column",
          alignItems:"center", justifyContent:"center",
          background:"rgba(26,58,40,0.35)", gap:"0.5rem",
        }}>
          <div style={{
            width:"52px", height:"52px", borderRadius:"50%",
            border:"1.5px solid rgba(255,255,255,0.85)",
            display:"flex", alignItems:"center", justifyContent:"center",
            color:"#fff", fontSize:"1.1rem", paddingLeft:"3px",
          }}>▶</div>
          {item.duration && (
            <span style={{
              fontFamily:"'DM Sans',sans-serif", fontWeight:300,
              fontSize:"0.58rem", letterSpacing:"0.2em",
              color:"rgba(255,255,255,0.8)",
            }}>{item.duration}</span>
          )}
        </div>
      )}

      {/* Hover overlay */}
      <div className="g-overlay" style={{
        position:"absolute", inset:0,
        background:"rgba(26,58,40,0)",
        display:"flex", alignItems:"flex-end",
        padding:"1rem",
        transition:"background 0.3s ease",
      }}>
        {item.caption && (
          <p className="g-caption" style={{
            fontFamily:"'Playfair Display',serif", fontStyle:"italic",
            fontWeight:400, fontSize:"0.88rem", color:"#fff",
            lineHeight:1.4, margin:0,
            opacity:0, transform:"translateY(8px)",
            transition:"all 0.3s ease",
          }}>{item.caption}</p>
        )}
      </div>

      {/* Category tag */}
      <div className="g-tag" style={{
        position:"absolute", top:"0.7rem", left:"0.7rem",
        background:"rgba(74,124,89,0.85)",
        padding:"0.2rem 0.6rem",
        fontFamily:"'DM Sans',sans-serif", fontWeight:300,
        fontSize:"0.5rem", letterSpacing:"0.25em",
        textTransform:"uppercase", color:"#fff",
        opacity:0, transition:"opacity 0.3s ease",
      }}>
        {item.category}
      </div>
    </div>
  );
}

// ============================================================
// MAIN GALLERY
// ============================================================
export default function GallerySection() {
  const [filter, setFilter] = useState("all");
  const [lbIndex, setLbIndex] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const el = sectionRef.current; if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setRevealed(true); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const filtered = filter === "all" ? MEDIA : MEDIA.filter(m => m.category === filter);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;1,400&family=DM+Sans:wght@200;300;400&display=swap');

        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes scrollPulse { 0%,100%{opacity:0.3} 50%{opacity:0.85} }

        /* Hover effects */
        .g-item:hover .g-overlay { background: rgba(26,58,40,0.5) !important; }
        .g-item:hover .g-caption { opacity: 1 !important; transform: translateY(0) !important; }
        .g-item:hover .g-img     { transform: scale(1.04); }
        .g-item:hover .g-tag     { opacity: 1 !important; }

        /* Grid */
        .gallery-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          grid-auto-rows: 220px;
          gap: 4px;
        }
        @media (max-width: 640px) {
          .gallery-grid {
            grid-template-columns: repeat(2, 1fr);
            grid-auto-rows: 150px;
          }
        }

        /* Filter buttons */
        .f-btn {
          font-family: 'DM Sans', sans-serif;
          font-weight: 300; font-size: 0.65rem;
          letter-spacing: 0.25em; text-transform: uppercase;
          padding: 0.55rem 1.2rem;
          border: 1px solid #E8F0E8;
          background: #FFFFFF; color: #8FA892;
          cursor: pointer; transition: all 0.22s ease;
        }
        .f-btn:hover { border-color: #7FA882; color: #4A7C59; background: #F7F9F6; }
        .f-btn.active {
          border-color: #4A7C59;
          background: #4A7C59; color: #FFFFFF;
        }
      `}</style>

      <section id="gallery" style={{
        background:"#FFFFFF",
        fontFamily:"'DM Sans',sans-serif",
        paddingTop:"clamp(4rem,8vw,6rem)",
      }}>

        {/* ── Section header ── */}
        <div style={{ textAlign:"center", padding:"0 1.5rem", marginBottom:"2rem" }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:"0.8rem", marginBottom:"1.2rem" }}>
            <div style={{ width:"30px", height:"1px", background:"#7FA882" }}/>
            <span style={{
              fontFamily:"'DM Sans',sans-serif", fontWeight:300, fontSize:"0.6rem",
              letterSpacing:"0.4em", textTransform:"uppercase", color:"#4A7C59",
            }}>Khoảnh khắc của chúng tôi</span>
            <div style={{ width:"30px", height:"1px", background:"#7FA882" }}/>
          </div>
          <h2 style={{
            fontFamily:"'Playfair Display',serif", fontStyle:"italic",
            fontWeight:400, fontSize:"clamp(2rem,8vw,3.5rem)",
            color:"#1A3A28", lineHeight:1.1, margin:"0 0 0.3rem",
          }}>Bộ Sưu Tập</h2>
          <p style={{
            fontFamily:"'DM Sans',sans-serif", fontWeight:300,
            fontSize:"0.78rem", color:"#8FA892", letterSpacing:"0.05em",
          }}>
            {MEDIA.filter(m=>m.type==="image").length} ảnh · {MEDIA.filter(m=>m.type==="video").length} video
          </p>
        </div>

        {/* ── Slideshow header ── */}
        <SlideshowHeader />

        {/* ── Filter tabs ── */}
        <div style={{
          display:"flex", gap:"0.4rem", justifyContent:"center",
          flexWrap:"wrap", padding:"0 1.5rem", marginBottom:"1.5rem",
        }}>
          {FILTERS.map(f => (
            <button key={f.val}
              className={`f-btn${filter===f.val?" active":""}`}
              onClick={() => setFilter(f.val)}>
              {f.label}
            </button>
          ))}
        </div>

        {/* ── Curtain + Grid ── */}
        <div ref={sectionRef} style={{ position:"relative", overflow:"hidden" }}>
          <Curtain revealed={revealed} />
          <div className="gallery-grid" style={{ padding:"0 4px 4px" }}>
            {filtered.map((item, i) => (
              <GridItem
                key={item.id} item={item} index={i}
                onOpen={setLbIndex} revealed={revealed}
              />
            ))}
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div style={{
          display:"flex", alignItems:"center", justifyContent:"space-between",
          padding:"1.5rem 1.5rem",
          borderTop:"1px solid #E8F0E8",
          marginTop:"4px",
          background:"#F7F9F6",
        }}>
          <p style={{
            fontFamily:"'Playfair Display',serif", fontStyle:"italic",
            fontWeight:400, fontSize:"0.9rem", color:"#7FA882", margin:0,
          }}>
            {filtered.length} khoảnh khắc
          </p>
          <div style={{ display:"flex", gap:"0.3rem" }}>
            {FILTERS.slice(1).map(f => {
              const count = MEDIA.filter(m => m.category===f.val).length;
              return count > 0 ? (
                <span key={f.val} style={{
                  fontFamily:"'DM Sans',sans-serif", fontWeight:300,
                  fontSize:"0.58rem", letterSpacing:"0.2em",
                  textTransform:"uppercase", color:"#8FA892",
                  padding:"0.2rem 0.6rem",
                  border:"1px solid #E8F0E8",
                }}>
                  {f.label} {count}
                </span>
              ) : null;
            })}
          </div>
        </div>
      </section>

      {/* ── Lightbox ── */}
      {lbIndex !== null && (
        <Lightbox
          items={filtered}
          startIndex={lbIndex}
          onClose={() => setLbIndex(null)}
        />
      )}
    </>
  );
}