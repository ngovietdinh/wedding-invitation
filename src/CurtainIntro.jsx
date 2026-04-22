// ============================================================
// CURTAIN INTRO — Fixed: không nhảy trang sau khi mở rèm
// ============================================================

import { useState, useEffect } from "react";

export default function CurtainIntro({ children }) {
  const [state, setState] = useState("waiting");

  useEffect(() => {
    if (state !== "waiting") return;

    const open = (e) => {
      // Chặn scroll pass xuống trang
      if (e && e.preventDefault) e.preventDefault();
      setState("opening");
    };

    // wheel: preventDefault để không scroll trang
    const onWheel = (e) => {
      e.preventDefault();
      open();
    };

    let startY = 0;
    const onTS = (e) => { startY = e.touches[0].clientY; };
    const onTE = (e) => {
      if (startY - e.changedTouches[0].clientY > 30) open();
    };

    window.addEventListener("wheel",      onWheel, { passive: false });
    window.addEventListener("touchstart", onTS,    { passive: true  });
    window.addEventListener("touchend",   onTE,    { passive: true  });

    return () => {
      window.removeEventListener("wheel",      onWheel);
      window.removeEventListener("touchstart", onTS);
      window.removeEventListener("touchend",   onTE);
    };
  }, [state]);

  useEffect(() => {
    if (state !== "opening") return;
    const t = setTimeout(() => setState("done"), 1700);
    return () => clearTimeout(t);
  }, [state]);

  useEffect(() => {
    if (state === "waiting") {
      document.body.style.overflow = "hidden";
      // Giữ scroll position ở top
      window.scrollTo(0, 0);
    } else if (state === "opening") {
      // Vẫn giữ overflow hidden trong lúc rèm đang mở
      // để trang không nhảy
      document.body.style.overflow = "hidden";
      window.scrollTo(0, 0);
    } else {
      // done: mở scroll bình thường, vị trí vẫn ở top
      window.scrollTo(0, 0);
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [state]);

  const isOpen = state === "opening" || state === "done";
  const isDone = state === "done";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;1,400&family=DM+Sans:wght@200;300;400&display=swap');

        .ci-left {
          position:fixed; top:0; left:0; bottom:0; width:51%;
          z-index:9000; will-change:transform;
          transform:translateX(0%); transition:none;
          background:
            repeating-linear-gradient(
              90deg, transparent 0px, transparent 24px,
              rgba(255,255,255,0.022) 24px, rgba(255,255,255,0.022) 26px
            ),
            linear-gradient(168deg, #132318 0%, #2d5a3d 45%, #1a3a28 100%);
        }
        .ci-left.open {
          transform:translateX(-102%);
          transition:transform 1.5s cubic-bezier(0.76,0,0.175,1);
        }
        .ci-left::after {
          content:''; position:absolute; top:0; right:0; bottom:0; width:100px;
          background:linear-gradient(90deg,transparent,rgba(0,0,0,0.3));
          pointer-events:none;
        }
        .ci-left::before {
          content:''; position:absolute; top:0; bottom:0; left:35%; width:1px;
          background:rgba(255,255,255,0.04);
        }

        .ci-right {
          position:fixed; top:0; right:0; bottom:0; width:51%;
          z-index:9000; will-change:transform;
          transform:translateX(0%); transition:none;
          background:
            repeating-linear-gradient(
              90deg, transparent 0px, transparent 24px,
              rgba(255,255,255,0.022) 24px, rgba(255,255,255,0.022) 26px
            ),
            linear-gradient(192deg, #1a3a28 0%, #2d5a3d 45%, #132318 100%);
        }
        .ci-right.open {
          transform:translateX(102%);
          transition:transform 1.5s cubic-bezier(0.76,0,0.175,1);
        }
        .ci-right::after {
          content:''; position:absolute; top:0; left:0; bottom:0; width:100px;
          background:linear-gradient(270deg,transparent,rgba(0,0,0,0.3));
          pointer-events:none;
        }
        .ci-right::before {
          content:''; position:absolute; top:0; bottom:0; right:35%; width:1px;
          background:rgba(255,255,255,0.04);
        }

        .ci-seam {
          position:fixed; top:0; bottom:0; left:50%; transform:translateX(-50%);
          width:2px; z-index:9001; pointer-events:none;
          background:linear-gradient(
            180deg, transparent 0%, rgba(127,168,130,0.45) 15%,
            rgba(127,168,130,0.45) 85%, transparent 100%
          );
          transition:none;
        }
        .ci-seam.open { opacity:0; transition:opacity 0.2s ease 0.05s; }

        .ci-overlay {
          position:fixed; inset:0; z-index:9002;
          display:flex; align-items:center; justify-content:center;
          pointer-events:none;
        }
        .ci-logo { display:flex; flex-direction:column; align-items:center; text-align:center; transition:opacity 0.25s ease; }
        .ci-logo.open { opacity:0; }

        .ci-hint {
          position:fixed; bottom:2.5rem; left:50%; transform:translateX(-50%);
          z-index:9003; pointer-events:none;
          display:flex; flex-direction:column; align-items:center; gap:0.5rem;
          animation:fadeUp 0.8s ease 1.2s both;
          transition:opacity 0.25s ease;
        }
        .ci-hint.open { opacity:0; }

        .ci-skip {
          position:fixed; bottom:1.8rem; right:2rem; z-index:9003;
          background:transparent; border:1px solid rgba(127,168,130,0.22);
          color:rgba(184,204,186,0.55); font-family:'DM Sans',sans-serif;
          font-size:0.58rem; letter-spacing:0.28em; text-transform:uppercase;
          padding:0.5rem 1.1rem; cursor:pointer; transition:all 0.25s ease;
          animation:fadeUp 0.8s ease 1.5s both;
        }
        .ci-skip:hover { border-color:rgba(127,168,130,0.55); color:#B8CCBA; background:rgba(127,168,130,0.07); }
        .ci-skip.open { opacity:0; pointer-events:none; }

        .ci-content { opacity:0; transition:none; }
        .ci-content.open { opacity:1; transition:opacity 0.9s ease 0.9s; }

        @keyframes fadeUp {
          from { opacity:0; transform:translateX(-50%) translateY(10px); }
          to   { opacity:1; transform:translateX(-50%) translateY(0); }
        }
        @keyframes itemUp {
          from { opacity:0; transform:translateY(18px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .ci-eyebrow { animation:itemUp 0.9s ease 0.35s both; }
        .ci-n1      { animation:itemUp 1s   ease 0.5s  both; }
        .ci-amp     { animation:itemUp 1s   ease 0.58s both; }
        .ci-n2      { animation:itemUp 1s   ease 0.65s both; }
        .ci-date    { animation:itemUp 1s   ease 0.8s  both; }
        .ci-orn-t   { animation:itemUp 0.9s ease 0.25s both; }
        .ci-orn-b   { animation:itemUp 0.9s ease 0.88s both; }
        .ci-arrow   { animation:bounce 1.7s ease-in-out infinite; }
        @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(7px)} }
      `}</style>

      <div className={`ci-content${isOpen ? " open" : ""}`}>
        {children}
      </div>

      {!isDone && (
        <>
          <div className={`ci-left${isOpen  ? " open" : ""}`} />
          <div className={`ci-right${isOpen ? " open" : ""}`} />
          <div className={`ci-seam${isOpen  ? " open" : ""}`} />

          <div className="ci-overlay">
            <div className={`ci-logo${isOpen ? " open" : ""}`}>
              <div className="ci-orn-t" style={{marginBottom:"1.2rem"}}>
                <svg viewBox="0 0 160 16" width="130" style={{opacity:0.45}}>
                  <path d="M0 8 Q40 2 80 8 Q120 14 160 8" stroke="#7FA882" strokeWidth="0.8" fill="none"/>
                  <circle cx="80"  cy="8" r="3"   fill="#7FA882" fillOpacity="0.6"/>
                  <circle cx="22"  cy="8" r="1.5" fill="#7FA882" fillOpacity="0.3"/>
                  <circle cx="138" cy="8" r="1.5" fill="#7FA882" fillOpacity="0.3"/>
                </svg>
              </div>

              <p className="ci-eyebrow" style={{
                fontFamily:"'DM Sans',sans-serif", fontWeight:200,
                fontSize:"0.6rem", letterSpacing:"0.45em",
                textTransform:"uppercase", color:"rgba(127,168,130,0.7)",
                marginBottom:"1.3rem",
              }}>Trân trọng kính mời</p>

              <h1 className="ci-n1" style={{
                fontFamily:"'Playfair Display',serif", fontStyle:"italic",
                fontWeight:400, fontSize:"clamp(2.8rem,9vw,5.5rem)",
                color:"#e8f0e8", lineHeight:1.05, margin:0,
                textShadow:"0 4px 28px rgba(0,0,0,0.4)",
              }}>Bảo Ngân</h1>

              <p className="ci-amp" style={{
                fontFamily:"'Playfair Display',serif", fontStyle:"italic",
                fontSize:"clamp(1rem,3vw,1.5rem)", color:"#7FA882", margin:"0.25rem 0",
              }}>&amp;</p>

              <h1 className="ci-n2" style={{
                fontFamily:"'Playfair Display',serif", fontStyle:"italic",
                fontWeight:400, fontSize:"clamp(2.8rem,9vw,5.5rem)",
                color:"#e8f0e8", lineHeight:1.05, margin:0,
                textShadow:"0 4px 28px rgba(0,0,0,0.4)",
              }}>Viết Định</h1>

              <div className="ci-date" style={{
                marginTop:"1.6rem", border:"1px solid rgba(127,168,130,0.22)", padding:"0.45rem 1.8rem",
              }}>
                <span style={{
                  fontFamily:"'DM Sans',sans-serif", fontWeight:300,
                  fontSize:"0.65rem", letterSpacing:"0.35em",
                  textTransform:"uppercase", color:"rgba(127,168,130,0.7)",
                }}>26 · 04 · 2026 &nbsp;·&nbsp; Huế</span>
              </div>

              <div className="ci-orn-b" style={{marginTop:"1.2rem"}}>
                <svg viewBox="0 0 160 16" width="130" style={{opacity:0.45}}>
                  <path d="M0 8 Q40 14 80 8 Q120 2 160 8" stroke="#7FA882" strokeWidth="0.8" fill="none"/>
                  <circle cx="80" cy="8" r="3" fill="#7FA882" fillOpacity="0.6"/>
                </svg>
              </div>
            </div>
          </div>

          <div className={`ci-hint${isOpen ? " open" : ""}`}>
            <span style={{
              fontFamily:"'DM Sans',sans-serif", fontWeight:200,
              fontSize:"0.58rem", letterSpacing:"0.35em",
              textTransform:"uppercase", color:"rgba(127,168,130,0.6)",
            }}>Lăn chuột để mở</span>
            <div className="ci-arrow">
              <svg viewBox="0 0 20 20" width="18" fill="none">
                <path d="M10 3 L10 17 M4 11 L10 17 L16 11"
                  stroke="rgba(127,168,130,0.55)" strokeWidth="1.2"
                  strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>

          <button className={`ci-skip${isOpen ? " open" : ""}`}
            onClick={() => setState("opening")}>Bỏ qua →</button>
        </>
      )}
    </>
  );
}
