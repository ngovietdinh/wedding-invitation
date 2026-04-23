// ============================================================
// GALLERY SECTION — Premium Effects Edition
// Ken Burns · Parallax · Magnetic Hover · Lightbox · Shimmer
// ============================================================

import { useState, useEffect, useRef, useCallback } from "react";

const MEDIA = [
  { id:1,  type:"image", src:"/gallery/1.jpg",    thumb:"/gallery/1.jpg",    alt:"Bảo Ngân & Viết Định", category:"couple",     size:"tall",   caption:"Lần đầu chụp ảnh cùng nhau" },
  { id:2,  type:"image", src:"/gallery/2.jpg",    thumb:"/gallery/2.jpg",    alt:"Bảo Ngân & Viết Định", category:"couple",     size:"square", caption:"" },
  { id:3,  type:"image", src:"/gallery/3.jpg",    thumb:"/gallery/3.jpg",    alt:"",                     category:"couple",     size:"wide",   caption:"Chuyến đi Đà Nẵng" },
  { id:4,  type:"image", src:"/gallery/1.jpg",thumb:"/gallery/1.jpg",alt:"Lễ đính hôn",          category:"engagement", size:"tall",   caption:"Ngày anh hỏi" },
  { id:5,  type:"image", src:"/gallery/2.jpg",thumb:"/gallery/2.jpg",alt:"Lễ đính hôn",          category:"engagement", size:"square", caption:"" },
  { id:6,  type:"image", src:"/gallery/3.jpg",thumb:"/gallery/3.jpg",alt:"Nhẫn đính hôn",        category:"engagement", size:"square", caption:"Chiếc nhẫn em đã đợi" },
  { id:7,  type:"image", src:"/gallery/1.jpg",   thumb:"/gallery/1.jpg",   alt:"Ảnh cưới",             category:"wedding",    size:"wide",   caption:"" },
  { id:8,  type:"image", src:"/gallery/2.jpg",   thumb:"/gallery/2.jpg",   alt:"Ảnh cưới",             category:"wedding",    size:"tall",   caption:"Áo dài trắng" },
  { id:9,  type:"image", src:"/gallery/3.jpg",   thumb:"/gallery/3.jpg",   alt:"Ảnh cưới",             category:"wedding",    size:"square", caption:"" },
  { id:10, type:"video", src:"/gallery/highlight.mp4",    poster:"/gallery/video-poster.jpg",alt:"Video highlight",      category:"video",      size:"wide",   caption:"Our Story — Highlight Film", duration:"3:24" },
];

const FILTERS = [
  { val:"all", label:"Tất cả" },
  { val:"couple", label:"Couple" },
  { val:"engagement", label:"Đính hôn" },
  { val:"wedding", label:"Cưới" },
  { val:"video", label:"Video" },
];

// ── Ken Burns: random direction mỗi ảnh ──
const KB_VARIANTS = [
  { from:"scale(1.08) translate(-2%,-2%)", to:"scale(1.0) translate(0,0)" },
  { from:"scale(1.08) translate(2%,-2%)",  to:"scale(1.0) translate(0,0)" },
  { from:"scale(1.08) translate(-2%,2%)",  to:"scale(1.0) translate(0,0)" },
  { from:"scale(1.10) translate(0,-3%)",   to:"scale(1.0) translate(0,0)" },
  { from:"scale(1.0)  translate(0,0)",     to:"scale(1.08) translate(-2%,-1%)" },
  { from:"scale(1.0)  translate(0,0)",     to:"scale(1.08) translate(2%,1%)" },
];

// ── Magnetic hover hook ──
function useMagnetic(strength = 0.25) {
  const ref = useRef(null);
  const handleMove = useCallback((e) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left - r.width  / 2) * strength;
    const y = (e.clientY - r.top  - r.height / 2) * strength;
    el.style.transform = `translate(${x}px,${y}px)`;
  }, [strength]);
  const handleLeave = useCallback(() => {
    const el = ref.current; if (!el) return;
    el.style.transform = "translate(0,0)";
    el.style.transition = "transform 0.5s cubic-bezier(0.23,1,0.32,1)";
    setTimeout(() => { if (el) el.style.transition = ""; }, 500);
  }, []);
  return { ref, onMouseMove: handleMove, onMouseLeave: handleLeave };
}

// ── Intersection reveal hook ──
function useReveal(threshold = 0.1) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

// ── LIGHTBOX ──
function Lightbox({ items, startIndex, onClose }) {
  const [cur, setCur] = useState(startIndex);
  const [zoomed, setZoomed] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const item = items[cur];

  const go = useCallback((next) => {
    if (transitioning) return;
    setTransitioning(true);
    setZoomed(false);
    setTimeout(() => { setCur(next); setTransitioning(false); }, 280);
  }, [transitioning]);

  const prev = useCallback(() => go((cur - 1 + items.length) % items.length), [cur, go, items.length]);
  const next = useCallback(() => go((cur + 1) % items.length), [cur, go, items.length]);

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
      background:"rgba(13,26,18,0.97)",
      backdropFilter:"blur(12px)",
      display:"flex", alignItems:"center", justifyContent:"center",
      animation:"lbIn 0.3s ease",
    }} onClick={onClose}>
      <style>{`
        @keyframes lbIn { from{opacity:0;backdrop-filter:blur(0)} to{opacity:1;backdrop-filter:blur(12px)} }
        @keyframes mediaIn { from{opacity:0;transform:scale(0.96)} to{opacity:1;transform:scale(1)} }
        .lb-media { animation: mediaIn 0.3s ease; }
      `}</style>

      <div style={{
        position:"relative", width:"100%", maxWidth:"1000px",
        display:"flex", flexDirection:"column", alignItems:"center",
        padding:"3rem 5rem 5.5rem", gap:"1rem",
      }} onClick={e => e.stopPropagation()}>

        {/* Close */}
        <button onClick={onClose} style={{
          position:"absolute", top:"0.5rem", right:"1rem",
          background:"rgba(127,168,130,0.08)", border:"1px solid rgba(127,168,130,0.2)",
          color:"rgba(184,204,186,0.7)", fontFamily:"'DM Sans',sans-serif",
          fontSize:"0.58rem", letterSpacing:"0.3em", textTransform:"uppercase",
          padding:"0.45rem 1rem", cursor:"pointer", transition:"all 0.2s",
          backdropFilter:"blur(4px)",
        }}>ESC ✕</button>

        {/* Counter */}
        <span style={{
          fontFamily:"'DM Sans',sans-serif", fontWeight:200,
          fontSize:"0.58rem", letterSpacing:"0.45em",
          textTransform:"uppercase", color:"rgba(127,168,130,0.6)",
        }}>{cur + 1} / {items.length}</span>

        {/* Media */}
        <div style={{
          display:"flex", alignItems:"center", justifyContent:"center",
          width:"100%", minHeight:"300px", overflow:"hidden",
          opacity: transitioning ? 0 : 1,
          transition:"opacity 0.28s ease",
        }}>
          {item.type === "video" ? (
            <video src={item.src} poster={item.poster} controls autoPlay
              className="lb-media"
              style={{ maxWidth:"100%", maxHeight:"76vh", outline:"none", borderRadius:"0" }}/>
          ) : (
            <img src={item.src} alt={item.alt}
              className="lb-media"
              onClick={() => setZoomed(z => !z)}
              style={{
                maxWidth:"100%", maxHeight:"76vh", objectFit:"contain",
                cursor: zoomed ? "zoom-out" : "zoom-in",
                transform: zoomed ? "scale(1.8)" : "scale(1)",
                transition:"transform 0.45s cubic-bezier(0.4,0,0.2,1)",
                imageRendering:"crisp-edges",
                WebkitFontSmoothing:"antialiased",
              }}/>
          )}
        </div>

        {/* Caption */}
        {item.caption && (
          <p style={{
            fontFamily:"'Playfair Display',serif", fontStyle:"italic",
            fontWeight:400, fontSize:"1rem", color:"rgba(184,204,186,0.75)",
            textAlign:"center", maxWidth:"420px", lineHeight:1.7,
            opacity: transitioning ? 0 : 1, transition:"opacity 0.28s ease",
          }}>{item.caption}</p>
        )}

        {/* Nav */}
        {[["left","0.5rem",prev,"‹"],["right","0.5rem",next,"›"]].map(([side,pos,fn,icon]) => (
          <button key={side} onClick={fn} style={{
            position:"absolute", [side]:pos, top:"50%", transform:"translateY(-55%)",
            background:"rgba(74,124,89,0.12)", border:"1px solid rgba(127,168,130,0.18)",
            backdropFilter:"blur(8px)",
            color:"rgba(184,204,186,0.8)", fontSize:"2.2rem",
            cursor:"pointer", width:"48px", height:"72px",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontFamily:"serif", transition:"all 0.2s",
          }}
          onMouseEnter={e => { e.currentTarget.style.background="rgba(74,124,89,0.25)"; }}
          onMouseLeave={e => { e.currentTarget.style.background="rgba(74,124,89,0.12)"; }}
          >{icon}</button>
        ))}

        {/* Thumbnail strip */}
        <div style={{
          position:"absolute", bottom:"0.6rem", left:"50%", transform:"translateX(-50%)",
          display:"flex", gap:"4px", overflowX:"auto", maxWidth:"88vw", padding:"4px",
          scrollbarWidth:"none",
        }}>
          {items.map((m, i) => (
            <div key={m.id} onClick={() => go(i)} style={{
              width:"44px", height:"44px", flexShrink:0,
              cursor:"pointer", overflow:"hidden", position:"relative",
              border: i===cur ? "2px solid #4A7C59" : "2px solid rgba(127,168,130,0.15)",
              opacity: i===cur ? 1 : 0.4,
              transition:"all 0.2s ease",
              transform: i===cur ? "scale(1.08)" : "scale(1)",
            }}>
              <img src={m.type==="video" ? m.poster : m.thumb} alt=""
                style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
              {m.type==="video" && (
                <div style={{
                  position:"absolute", inset:0, display:"flex",
                  alignItems:"center", justifyContent:"center",
                  background:"rgba(13,26,18,0.5)", color:"#fff", fontSize:"0.6rem",
                }}>▶</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── SLIDESHOW với Ken Burns ──
function SlideshowHeader() {
  const images = MEDIA.filter(m => m.type === "image");
  const [cur, setCur] = useState(0);
  const [prev2, setPrev2] = useState(null);
  const [kbIdx] = useState(() => images.map(() => Math.floor(Math.random() * KB_VARIANTS.length)));

  useEffect(() => {
    if (images.length < 2) return;
    const id = setInterval(() => {
      setCur(c => {
        setPrev2(c);
        return (c + 1) % images.length;
      });
    }, 5000);
    return () => clearInterval(id);
  }, [images.length]);

  if (!images.length) return null;
  const kb = KB_VARIANTS[kbIdx[cur] || 0];

  return (
    <div style={{
      width:"100%", height:"clamp(200px,42vw,460px)",
      position:"relative", overflow:"hidden", marginBottom:"2.5rem",
    }}>
      {/* Current image with Ken Burns */}
      <img key={cur} src={images[cur].src} alt={images[cur].alt} style={{
        position:"absolute", inset:0, width:"100%", height:"100%",
        objectFit:"cover", objectPosition:"center",
        animation:`kenBurns 5.5s ease-in-out forwards`,
        imageRendering:"auto",
      }}/>

      {/* Vignette overlay */}
      <div style={{
        position:"absolute", inset:0, pointerEvents:"none",
        background:`
          linear-gradient(180deg, rgba(13,26,18,0.15) 0%, transparent 30%, transparent 60%, rgba(13,26,18,0.6) 100%),
          radial-gradient(ellipse at center, transparent 50%, rgba(13,26,18,0.25) 100%)
        `,
      }}/>

      {/* Caption overlay */}
      {images[cur].caption && (
        <div style={{
          position:"absolute", bottom:"3.5rem", left:"2rem",
          animation:"fadeUp 0.6s ease 0.3s both",
        }}>
          <p style={{
            fontFamily:"'Playfair Display',serif", fontStyle:"italic",
            fontSize:"clamp(0.9rem,2.5vw,1.2rem)", color:"rgba(255,255,255,0.85)",
            margin:0, textShadow:"0 2px 12px rgba(0,0,0,0.4)",
          }}>{images[cur].caption}</p>
        </div>
      )}

      {/* Progress dots */}
      <div style={{
        position:"absolute", bottom:"1.2rem", left:"50%", transform:"translateX(-50%)",
        display:"flex", gap:"0.5rem", alignItems:"center",
      }}>
        {images.map((_, i) => (
          <div key={i} onClick={() => setCur(i)} style={{
            cursor:"pointer",
            width: i===cur ? "28px" : "6px",
            height:"4px", borderRadius:"2px",
            background: i===cur ? "#4A7C59" : "rgba(255,255,255,0.35)",
            transition:"all 0.45s cubic-bezier(0.4,0,0.2,1)",
            boxShadow: i===cur ? "0 0 8px rgba(74,124,89,0.6)" : "none",
          }}/>
        ))}
      </div>

      {/* Index */}
      <div style={{
        position:"absolute", top:"1rem", right:"1rem",
        background:"rgba(13,26,18,0.55)", backdropFilter:"blur(6px)",
        padding:"0.28rem 0.8rem", border:"1px solid rgba(127,168,130,0.15)",
      }}>
        <span style={{
          fontFamily:"'DM Sans',sans-serif", fontWeight:200,
          fontSize:"0.55rem", letterSpacing:"0.3em", color:"rgba(255,255,255,0.7)",
        }}>{cur+1} / {images.length}</span>
      </div>

      <style>{`
        @keyframes kenBurns {
          from { transform: ${kb.from}; opacity:0; }
          5%   { opacity:1; }
          100% { transform: ${kb.to}; opacity:1; }
        }
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(10px); }
          to   { opacity:1; transform:translateY(0); }
        }
      `}</style>
    </div>
  );
}

// ── GRID ITEM với parallax + magnetic ──
function GridItem({ item, index, onOpen, revealed }) {
  const [loaded, setLoaded] = useState(false);
  const [hovered, setHovered] = useState(false);
  const imgRef = useRef(null);
  const wrapRef = useRef(null);
  const kbVariant = KB_VARIANTS[index % KB_VARIANTS.length];

  // Parallax on hover
  const handleMouseMove = (e) => {
    const el = wrapRef.current; if (!el || !loaded) return;
    const r = el.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width  - 0.5) * 14;
    const y = ((e.clientY - r.top)  / r.height - 0.5) * 14;
    if (imgRef.current) {
      imgRef.current.style.transform = `scale(1.1) translate(${x}px,${y}px)`;
    }
  };
  const handleMouseLeave = () => {
    setHovered(false);
    if (imgRef.current) {
      imgRef.current.style.transform = "scale(1.0)";
      imgRef.current.style.transition = "transform 0.7s cubic-bezier(0.23,1,0.32,1)";
      setTimeout(() => { if (imgRef.current) imgRef.current.style.transition = ""; }, 700);
    }
  };

  const spanMap = {
    tall:   { gridRow:"span 2", gridColumn:"span 1" },
    wide:   { gridRow:"span 1", gridColumn:"span 2" },
    square: { gridRow:"span 1", gridColumn:"span 1" },
  };

  return (
    <div
      ref={wrapRef}
      onClick={() => onOpen(index)}
      onMouseEnter={() => setHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        ...spanMap[item.size] || spanMap.square,
        position:"relative", overflow:"hidden",
        cursor:"pointer", background:"#dce8dc",
        opacity: revealed ? 1 : 0,
        transform: revealed ? "translateY(0) scale(1)" : "translateY(24px) scale(0.97)",
        transition:`opacity 0.8s ease ${index*0.08}s, transform 0.8s cubic-bezier(0.23,1,0.32,1) ${index*0.08}s`,
      }}
    >
      {/* Shimmer skeleton */}
      {!loaded && (
        <div style={{
          position:"absolute", inset:0, zIndex:1,
          background:"linear-gradient(90deg,#e2ede2 25%,#eef4ee 50%,#e2ede2 75%)",
          backgroundSize:"200% 100%",
          animation:"shimmer 1.6s ease-in-out infinite",
        }}/>
      )}

      {/* Image với Ken Burns khi hover */}
      <img
        ref={imgRef}
        src={item.type==="video" ? item.poster : item.src}
        alt={item.alt}
        onLoad={() => setLoaded(true)}
        style={{
          width:"100%", height:"100%", objectFit:"cover",
          display:"block",
          opacity: loaded ? 1 : 0,
          transform: hovered ? "scale(1.1)" : "scale(1.0)",
          transition:"opacity 0.6s ease, transform 0.7s cubic-bezier(0.23,1,0.32,1)",
          willChange:"transform",
          imageRendering:"auto",
          WebkitFontSmoothing:"antialiased",
        }}
      />

      {/* Video overlay */}
      {item.type==="video" && loaded && (
        <div style={{
          position:"absolute", inset:0,
          display:"flex", flexDirection:"column",
          alignItems:"center", justifyContent:"center",
          background:"rgba(13,26,18,0.32)", gap:"0.5rem",
        }}>
          <div style={{
            width:"56px", height:"56px", borderRadius:"50%",
            border:"1.5px solid rgba(255,255,255,0.85)",
            background:"rgba(74,124,89,0.3)", backdropFilter:"blur(4px)",
            display:"flex", alignItems:"center", justifyContent:"center",
            color:"#fff", fontSize:"1.1rem", paddingLeft:"3px",
            transition:"all 0.3s ease",
            transform: hovered ? "scale(1.12)" : "scale(1)",
            boxShadow: hovered ? "0 0 24px rgba(74,124,89,0.5)" : "none",
          }}>▶</div>
          {item.duration && (
            <span style={{
              fontFamily:"'DM Sans',sans-serif", fontWeight:200,
              fontSize:"0.55rem", letterSpacing:"0.2em", color:"rgba(255,255,255,0.75)",
            }}>{item.duration}</span>
          )}
        </div>
      )}

      {/* Hover overlay — gradient + caption */}
      <div style={{
        position:"absolute", inset:0,
        background: hovered ? "linear-gradient(180deg,transparent 30%,rgba(13,26,18,0.7) 100%)" : "linear-gradient(180deg,transparent 60%,rgba(13,26,18,0.0) 100%)",
        transition:"background 0.4s ease",
        display:"flex", flexDirection:"column",
        justifyContent:"flex-end", padding:"1rem",
      }}>
        {/* Caption */}
        {item.caption && (
          <p style={{
            fontFamily:"'Playfair Display',serif", fontStyle:"italic",
            fontWeight:400, fontSize:"clamp(0.8rem,2vw,0.95rem)",
            color:"#fff", lineHeight:1.4, margin:0,
            opacity: hovered ? 1 : 0,
            transform: hovered ? "translateY(0)" : "translateY(10px)",
            transition:"opacity 0.35s ease, transform 0.35s ease",
            textShadow:"0 2px 8px rgba(0,0,0,0.5)",
          }}>{item.caption}</p>
        )}
      </div>

      {/* Category tag — top left */}
      <div style={{
        position:"absolute", top:"0.7rem", left:"0.7rem",
        background:"rgba(74,124,89,0.82)", backdropFilter:"blur(4px)",
        padding:"0.18rem 0.6rem",
        fontFamily:"'DM Sans',sans-serif", fontWeight:300,
        fontSize:"0.48rem", letterSpacing:"0.28em",
        textTransform:"uppercase", color:"rgba(255,255,255,0.9)",
        opacity: hovered ? 1 : 0,
        transform: hovered ? "translateY(0)" : "translateY(-6px)",
        transition:"all 0.3s ease",
      }}>{item.category}</div>

      {/* Zoom icon — top right */}
      <div style={{
        position:"absolute", top:"0.7rem", right:"0.7rem",
        width:"28px", height:"28px",
        border:"1px solid rgba(255,255,255,0.4)",
        background:"rgba(13,26,18,0.4)", backdropFilter:"blur(4px)",
        display:"flex", alignItems:"center", justifyContent:"center",
        color:"rgba(255,255,255,0.8)", fontSize:"0.7rem",
        opacity: hovered ? 1 : 0,
        transform: hovered ? "scale(1)" : "scale(0.7)",
        transition:"all 0.3s ease 0.05s",
      }}>⤢</div>
    </div>
  );
}

// ── CURTAIN ──
function Curtain({ revealed }) {
  return (
    <>
      <div style={{
        position:"absolute", top:0, left:0, bottom:0, width:"51%",
        background:"#F7F9F6", zIndex:20, pointerEvents:"none",
        transform: revealed ? "translateX(-102%)" : "translateX(0)",
        transition: revealed ? "transform 1.4s cubic-bezier(0.77,0,0.18,1)" : "none",
        willChange:"transform",
      }}>
        <div style={{ position:"absolute", right:0, top:0, bottom:0, width:"60px", background:"linear-gradient(90deg,transparent,rgba(74,124,89,0.08))" }}/>
      </div>
      <div style={{
        position:"absolute", top:0, right:0, bottom:0, width:"51%",
        background:"#F7F9F6", zIndex:20, pointerEvents:"none",
        transform: revealed ? "translateX(102%)" : "translateX(0)",
        transition: revealed ? "transform 1.4s cubic-bezier(0.77,0,0.18,1)" : "none",
        willChange:"transform",
      }}>
        <div style={{ position:"absolute", left:0, top:0, bottom:0, width:"60px", background:"linear-gradient(90deg,rgba(74,124,89,0.08),transparent)" }}/>
      </div>
      {!revealed && (
        <div style={{
          position:"absolute", inset:0, zIndex:21,
          display:"flex", flexDirection:"column",
          alignItems:"center", justifyContent:"center", gap:"0.8rem",
          pointerEvents:"none",
        }}>
          <span style={{ fontFamily:"'Playfair Display',serif", fontStyle:"italic", fontSize:"1.1rem", color:"#4A7C59", opacity:0.6 }}>
            Cuộn xuống để khám phá
          </span>
          <div style={{ width:"1px", height:"40px", background:"linear-gradient(180deg,#4A7C59,transparent)", animation:"scrollPulse 2s ease-in-out infinite" }}/>
        </div>
      )}
    </>
  );
}

// ── MAIN ──
export default function GallerySection() {
  const [filter, setFilter]   = useState("all");
  const [lbIndex, setLbIndex] = useState(null);
  const { ref: sectionRef, visible: revealed } = useReveal(0.08);

  const filtered = filter === "all" ? MEDIA : MEDIA.filter(m => m.category === filter);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;1,400&family=DM+Sans:wght@200;300;400&display=swap');

        @keyframes shimmer {
          0%   { background-position:200% 0; }
          100% { background-position:-200% 0; }
        }
        @keyframes scrollPulse { 0%,100%{opacity:0.3} 50%{opacity:0.85} }
        @keyframes filterIn {
          from { opacity:0; transform:translateY(6px); }
          to   { opacity:1; transform:translateY(0); }
        }

        /* Grid */
        .g-grid {
          display:grid;
          grid-template-columns:repeat(3,1fr);
          grid-auto-rows:220px;
          gap:5px;
        }
        @media(max-width:640px){
          .g-grid { grid-template-columns:repeat(2,1fr); grid-auto-rows:155px; }
        }

        /* Filter buttons */
        .f-btn {
          font-family:'DM Sans',sans-serif; font-weight:300;
          font-size:0.63rem; letter-spacing:0.22em; text-transform:uppercase;
          padding:0.55rem 1.2rem;
          border:1px solid #E8F0E8; background:#FFFFFF; color:#8FA892;
          cursor:pointer; transition:all 0.25s ease; position:relative;
          overflow:hidden;
        }
        .f-btn::after {
          content:''; position:absolute; inset:0;
          background:#4A7C59; transform:scaleX(0); transform-origin:left;
          transition:transform 0.3s ease; z-index:0;
        }
        .f-btn:hover::after, .f-btn.active::after { transform:scaleX(1); }
        .f-btn span { position:relative; z-index:1; transition:color 0.3s ease; }
        .f-btn:hover span, .f-btn.active span { color:#FFFFFF; }
        .f-btn.active { border-color:#4A7C59; }

        /* Custom scrollbar for thumb strip */
        ::-webkit-scrollbar { width:0; height:0; }
      `}</style>

      <section id="gallery" style={{
        background:"#FFFFFF",
        fontFamily:"'DM Sans',sans-serif",
        paddingTop:"clamp(4rem,8vw,6rem)",
      }}>

        {/* Header */}
        <div style={{ textAlign:"center", padding:"0 1.5rem", marginBottom:"2rem" }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:"0.8rem", marginBottom:"1.2rem" }}>
            <div style={{ height:"1px", width:"30px", background:"linear-gradient(90deg,transparent,#7FA882)" }}/>
            <span style={{
              fontFamily:"'DM Sans',sans-serif", fontWeight:300, fontSize:"0.6rem",
              letterSpacing:"0.45em", textTransform:"uppercase", color:"#4A7C59",
            }}>Khoảnh khắc của chúng tôi</span>
            <div style={{ height:"1px", width:"30px", background:"linear-gradient(90deg,#7FA882,transparent)" }}/>
          </div>
          <h2 style={{
            fontFamily:"'Playfair Display',serif", fontStyle:"italic",
            fontWeight:400, fontSize:"clamp(2rem,8vw,3.5rem)",
            color:"#1A3A28", lineHeight:1.1, margin:"0 0 0.4rem",
            letterSpacing:"-0.01em",
          }}>Bộ Sưu Tập</h2>
          <p style={{
            fontFamily:"'DM Sans',sans-serif", fontWeight:200,
            fontSize:"0.75rem", color:"#8FA892", letterSpacing:"0.05em",
          }}>
            {MEDIA.filter(m=>m.type==="image").length} ảnh &nbsp;·&nbsp; {MEDIA.filter(m=>m.type==="video").length} video
          </p>
        </div>

        {/* Slideshow Ken Burns */}
        <SlideshowHeader />

        {/* Filter */}
        <div style={{
          display:"flex", gap:"0.4rem", justifyContent:"center",
          flexWrap:"wrap", padding:"0 1.5rem", marginBottom:"1.5rem",
        }}>
          {FILTERS.map((f, i) => (
            <button key={f.val}
              className={`f-btn${filter===f.val?" active":""}`}
              onClick={() => setFilter(f.val)}
              style={{ animationDelay:`${i*0.06}s` }}>
              <span>{f.label}</span>
            </button>
          ))}
        </div>

        {/* Curtain + Grid */}
        <div ref={sectionRef} style={{ position:"relative", overflow:"hidden" }}>
          <Curtain revealed={revealed} />
          <div className="g-grid" style={{ padding:"0 5px 5px" }}>
            {filtered.map((item, i) => (
              <GridItem
                key={item.id} item={item} index={i}
                onOpen={setLbIndex} revealed={revealed}
              />
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          display:"flex", alignItems:"center", justifyContent:"space-between",
          flexWrap:"wrap", gap:"0.5rem",
          padding:"1.2rem 1.5rem",
          borderTop:"1px solid #E8F0E8",
          marginTop:"5px", background:"#F7F9F6",
        }}>
          <p style={{
            fontFamily:"'Playfair Display',serif", fontStyle:"italic",
            fontWeight:400, fontSize:"0.9rem", color:"#7FA882", margin:0,
          }}>
            {filtered.length} khoảnh khắc
          </p>
          <div style={{ display:"flex", gap:"0.3rem", flexWrap:"wrap" }}>
            {FILTERS.slice(1).map(f => {
              const count = MEDIA.filter(m => m.category===f.val).length;
              return count > 0 ? (
                <span key={f.val} style={{
                  fontFamily:"'DM Sans',sans-serif", fontWeight:200,
                  fontSize:"0.55rem", letterSpacing:"0.2em",
                  textTransform:"uppercase", color:"#8FA892",
                  padding:"0.2rem 0.6rem", border:"1px solid #E8F0E8",
                }}>
                  {f.label} {count}
                </span>
              ) : null;
            })}
          </div>
        </div>
      </section>

      {/* Lightbox */}
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