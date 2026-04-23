// ============================================================
// CURTAIN INTRO — Thiệp gấp đôi, mở ra từ giữa như thiệp thật
// Lăn chuột 1 cái → 2 tờ thiệp mở ra trái/phải
// ============================================================

import { useState, useEffect } from "react";

export default function CurtainIntro({ children }) {
  const [state, setState] = useState("waiting");
  // "waiting" → "opening" → "done"

  useEffect(() => {
    if (state !== "waiting") return;
    const open = (e) => {
      if (e && e.preventDefault) e.preventDefault();
      setState("opening");
    };
    const onWheel = (e) => { e.preventDefault(); open(); };
    let startY = 0;
    const onTS = (e) => { startY = e.touches[0].clientY; };
    const onTE = (e) => { if (startY - e.changedTouches[0].clientY > 30) open(); };
    window.addEventListener("wheel",      onWheel, { passive: false });
    window.addEventListener("touchstart", onTS,    { passive: true });
    window.addEventListener("touchend",   onTE,    { passive: true });
    return () => {
      window.removeEventListener("wheel",      onWheel);
      window.removeEventListener("touchstart", onTS);
      window.removeEventListener("touchend",   onTE);
    };
  }, [state]);

  useEffect(() => {
    if (state !== "opening") return;
    const t = setTimeout(() => setState("done"), 2000);
    return () => clearTimeout(t);
  }, [state]);

  useEffect(() => {
    if (state === "waiting" || state === "opening") {
      document.body.style.overflow = "hidden";
      window.scrollTo(0, 0);
    } else {
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
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400;1,500&family=DM+Sans:wght@200;300;400&family=Great+Vibes&display=swap');

        /* ── Nền màn hình ── */
        .ci-backdrop {
          position: fixed; inset: 0; z-index: 8000;
          background: #0d1a12;
          display: flex; align-items: center; justify-content: center;
          pointer-events: ${isDone ? "none" : "all"};
          opacity: ${isDone ? 0 : 1};
          transition: ${isDone ? "opacity 0.5s ease 0.8s" : "none"};
        }

        /* ── Wrapper thiệp ── */
        .ci-card-wrap {
          position: relative;
          width: min(90vw, 800px);
          height: min(85vh, 580px);
          display: flex;
          perspective: 1400px;
          filter: drop-shadow(0 40px 80px rgba(0,0,0,0.6));
        }

        /* ── Tờ trái (nửa trái thiệp) ── */
        .ci-left-panel {
          position: relative;
          width: 50%; height: 100%;
          transform-origin: right center;
          transform-style: preserve-3d;
          transform: ${isOpen ? "rotateY(-28deg) translateX(-6px)" : "rotateY(0deg)"};
          transition: ${isOpen ? "transform 1.6s cubic-bezier(0.76,0,0.18,1)" : "none"};
          will-change: transform;
          z-index: 2;
          border-radius: 12px 0 0 12px;
          overflow: hidden;
          background: #fff;
          /* Giấy thiệp */
          background-image:
            radial-gradient(ellipse at 20% 20%, rgba(232,240,232,0.6) 0%, transparent 60%),
            linear-gradient(135deg, #ffffff 0%, #f7faf7 100%);
        }
        /* Đường gấp */
        .ci-left-panel::after {
          content: '';
          position: absolute; top: 0; right: 0; bottom: 0; width: 3px;
          background: linear-gradient(180deg,
            transparent 0%, rgba(74,124,89,0.15) 20%,
            rgba(74,124,89,0.3) 50%,
            rgba(74,124,89,0.15) 80%, transparent 100%
          );
        }
        /* Bóng đổ khi mở */
        .ci-left-panel::before {
          content: '';
          position: absolute; top: 0; right: 0; bottom: 0; width: 40px;
          background: linear-gradient(90deg, transparent, rgba(0,0,0,0.08));
          z-index: 1; pointer-events: none;
          opacity: ${isOpen ? 1 : 0};
          transition: opacity 0.5s ease 0.5s;
        }

        /* ── Tờ phải (nửa phải thiệp) ── */
        .ci-right-panel {
          position: relative;
          width: 50%; height: 100%;
          transform-origin: left center;
          transform-style: preserve-3d;
          transform: ${isOpen ? "rotateY(28deg) translateX(6px)" : "rotateY(0deg)"};
          transition: ${isOpen ? "transform 1.6s cubic-bezier(0.76,0,0.18,1)" : "none"};
          will-change: transform;
          z-index: 2;
          border-radius: 0 12px 12px 0;
          overflow: hidden;
          /* Nền xanh đậm như mẫu */
          background: linear-gradient(145deg, #2d5a3d 0%, #1a3a28 60%, #132318 100%);
        }
        .ci-right-panel::before {
          content: '';
          position: absolute; top: 0; left: 0; bottom: 0; width: 40px;
          background: linear-gradient(90deg, rgba(0,0,0,0.12), transparent);
          z-index: 1; pointer-events: none;
          opacity: ${isOpen ? 1 : 0};
          transition: opacity 0.5s ease 0.5s;
        }

        /* ── Hoa trang trí SVG ── */
        .flower-tl { position:absolute; top:-10px; left:-10px; width:120px; opacity:0.85; pointer-events:none; }
        .flower-tr { position:absolute; top:-10px; right:-10px; width:120px; opacity:0.85; pointer-events:none; transform:scaleX(-1); }
        .flower-bl { position:absolute; bottom:-10px; left:-10px; width:100px; opacity:0.7; pointer-events:none; transform:scaleY(-1); }
        .flower-br { position:absolute; bottom:-10px; right:-10px; width:100px; opacity:0.7; pointer-events:none; transform:scale(-1); }

        /* ── Nội dung tờ trái ── */
        .ci-left-content {
          position: absolute; inset: 0;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: clamp(1.2rem,4vw,2.5rem);
          text-align: center; gap: 0;
        }

        /* ── Nội dung tờ phải ── */
        .ci-right-content {
          position: absolute; inset: 0;
          display: flex; flex-direction: column;
          align-items: center; justify-content: flex-end;
          padding: clamp(1rem,3vw,2rem) clamp(1rem,3vw,2rem) clamp(1.2rem,3vw,2rem);
          gap: 0.3rem;
        }

        /* ── Animations ── */
        @keyframes itemUp {
          from { opacity:0; transform:translateY(14px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity:0; } to { opacity:1; }
        }
        @keyframes hintBounce {
          0%,100% { transform:translateX(-50%) translateY(0); }
          50%      { transform:translateX(-50%) translateY(6px); }
        }
        @keyframes shimmerGold {
          0%,100% { opacity:0.6; } 50% { opacity:1; }
        }

        .ci-hint {
          position: fixed; bottom: 2rem; left: 50%;
          transform: translateX(-50%);
          z-index: 8010; pointer-events: none;
          display: flex; flex-direction: column; align-items: center; gap: 0.4rem;
          animation: itemUp 0.8s ease 1.5s both, hintBounce 2s ease-in-out 2.3s infinite;
          opacity: ${isOpen ? 0 : 1};
          transition: opacity 0.3s ease;
        }

        .ci-skip {
          position: fixed; bottom: 1.5rem; right: 1.5rem;
          z-index: 8010;
          background: rgba(74,124,89,0.1);
          border: 1px solid rgba(127,168,130,0.25);
          color: rgba(184,204,186,0.6);
          font-family: 'DM Sans', sans-serif;
          font-size: 0.55rem; letter-spacing: 0.3em;
          text-transform: uppercase; padding: 0.45rem 1rem;
          cursor: pointer; transition: all 0.25s;
          animation: itemUp 0.8s ease 1.8s both;
          opacity: ${isOpen ? 0 : 1};
        }
        .ci-skip:hover {
          background: rgba(74,124,89,0.2);
          border-color: rgba(127,168,130,0.5);
          color: #B8CCBA;
        }

        /* Page content */
        .ci-page-content {
          opacity: ${isOpen ? 1 : 0};
          transition: ${isOpen ? "opacity 1s ease 1s" : "none"};
        }

        /* Đường kẻ trang trí */
        .deco-line {
          width: 100%; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(74,124,89,0.3), transparent);
          margin: 0.6rem 0;
        }
        .deco-line-white {
          width: 60%; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          margin: 0.5rem 0;
        }

        /* Diamond shape */
        .diamond {
          width: 44px; height: 44px;
          background: #2d5a3d;
          transform: rotate(45deg);
          display: flex; align-items: center; justify-content: center;
          margin: 0.4rem 0;
          animation: shimmerGold 3s ease-in-out infinite;
        }
        .diamond-inner {
          transform: rotate(-45deg);
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          font-weight: 500; font-size: 1rem;
          letter-spacing: 0;
        }
      `}</style>

      {/* ── Nội dung trang (ẩn cho đến khi mở) ── */}
      <div className="ci-page-content">{children}</div>

      {!isDone && (
        <div className="ci-backdrop">
          <div className="ci-card-wrap">

            {/* ══ TỜ TRÁI — Nội dung thiệp ══ */}
            <div className="ci-left-panel">
              {/* Hoa góc */}
              <FlowerSVG className="flower-tl" color="#4A7C59" />
              <FlowerSVG className="flower-tr" color="#4A7C59" />
              <FlowerSVG className="flower-bl" color="#7FA882" />
              <FlowerSVG className="flower-br" color="#7FA882" />

              <div className="ci-left-content">
                {/* Eyebrow */}
                <p style={{
                  fontFamily:"'DM Sans',sans-serif", fontWeight:300,
                  fontSize:"clamp(0.45rem,1.2vw,0.6rem)", letterSpacing:"0.4em",
                  textTransform:"uppercase", color:"#4A7C59",
                  marginBottom:"0.5rem",
                  animation:"itemUp 0.8s ease 0.2s both",
                }}>TRÂN TRỌNG KÍNH MỜI</p>

                <div className="deco-line" style={{ animation:"itemUp 0.8s ease 0.3s both" }}/>

                {/* Nội dung mời */}
                <p style={{
                  fontFamily:"'DM Sans',sans-serif", fontWeight:200,
                  fontSize:"clamp(0.5rem,1.3vw,0.65rem)", color:"#5A7A62",
                  lineHeight:1.8, letterSpacing:"0.05em",
                  animation:"itemUp 0.8s ease 0.35s both",
                  marginBottom:"0.3rem",
                }}>
                  ĐẾN DỰ BUỔI TIỆC RƯỢU<br/>
                  CHUNG VUI CÙNG GIA ĐÌNH CHÚNG TÔI TẠI
                </p>

                {/* Tên địa điểm */}
                <p style={{
                  fontFamily:"'Great Vibes',cursive",
                  fontSize:"clamp(1.4rem,4vw,2.2rem)",
                  color:"#1A3A28", lineHeight:1.1,
                  animation:"itemUp 0.9s ease 0.45s both",
                }}>Nhà hàng của chúng tôi</p>

                <p style={{
                  fontFamily:"'DM Sans',sans-serif", fontWeight:200,
                  fontSize:"clamp(0.45rem,1.1vw,0.6rem)", color:"#5A7A62",
                  lineHeight:1.7, animation:"itemUp 0.8s ease 0.5s both",
                }}>
                  123 Đường ABC, Phường XYZ<br/>
                  Quận 1, TP. Huế
                </p>

                <div className="deco-line" style={{ animation:"itemUp 0.8s ease 0.55s both" }}/>

                {/* Ngày giờ */}
                <div style={{
                  display:"flex", alignItems:"center", gap:"0.8rem",
                  animation:"itemUp 0.9s ease 0.6s both",
                  margin:"0.3rem 0",
                }}>
                  <div style={{ textAlign:"right" }}>
                    <p style={{ fontFamily:"'DM Sans',sans-serif", fontWeight:300, fontSize:"clamp(0.45rem,1.1vw,0.58rem)", color:"#5A7A62", letterSpacing:"0.2em", textTransform:"uppercase", margin:0 }}>THỨ HAI</p>
                    <p style={{ fontFamily:"'DM Sans',sans-serif", fontWeight:200, fontSize:"clamp(0.4rem,1vw,0.55rem)", color:"#7FA882", margin:0 }}>LÚC 11:00</p>
                  </div>

                  <div className="diamond">
                    <span className="diamond-inner" style={{ fontSize:"clamp(0.9rem,2.5vw,1.2rem)" }}>26</span>
                  </div>

                  <div style={{ textAlign:"left" }}>
                    <p style={{ fontFamily:"'DM Sans',sans-serif", fontWeight:300, fontSize:"clamp(0.45rem,1.1vw,0.58rem)", color:"#5A7A62", letterSpacing:"0.2em", textTransform:"uppercase", margin:0 }}>THÁNG 04</p>
                    <p style={{ fontFamily:"'DM Sans',sans-serif", fontWeight:200, fontSize:"clamp(0.4rem,1vw,0.55rem)", color:"#7FA882", margin:0 }}>NĂM 2026</p>
                  </div>
                </div>

                <div className="deco-line" style={{ animation:"itemUp 0.8s ease 0.65s both" }}/>

                <p style={{
                  fontFamily:"'DM Sans',sans-serif", fontWeight:200,
                  fontSize:"clamp(0.42rem,1vw,0.55rem)", color:"#7FA882",
                  letterSpacing:"0.08em", fontStyle:"italic",
                  animation:"itemUp 0.8s ease 0.7s both",
                }}>
                  ( NHẰM NGÀY 09 THÁNG 03 NĂM QUÝ MÃO )
                </p>

                <div className="deco-line" style={{ animation:"itemUp 0.8s ease 0.75s both" }}/>

                <p style={{
                  fontFamily:"'DM Sans',sans-serif", fontWeight:200,
                  fontSize:"clamp(0.42rem,1vw,0.55rem)", color:"#5A7A62",
                  lineHeight:1.8, letterSpacing:"0.05em",
                  animation:"itemUp 0.8s ease 0.8s both",
                }}>
                  SỰ HIỆN DIỆN CỦA .............<br/>
                  LÀ NIỀM VINH HẠNH CHO<br/>
                  GIA ĐÌNH CHÚNG TÔI.
                </p>

                <p style={{
                  fontFamily:"'Great Vibes',cursive",
                  fontSize:"clamp(1.1rem,3vw,1.5rem)",
                  color:"#4A7C59",
                  animation:"itemUp 0.9s ease 0.9s both",
                }}>Kính mời !</p>
              </div>
            </div>

            {/* ══ TỜ PHẢI — Save the Date + Hình đôi ══ */}
            <div className="ci-right-panel">
              {/* Hoa góc trắng */}
              <FlowerSVG className="flower-tl" color="rgba(255,255,255,0.7)" />
              <FlowerSVG className="flower-tr" color="rgba(255,255,255,0.7)" />
              <FlowerSVG className="flower-br" color="rgba(255,255,255,0.4)" />

              <div className="ci-right-content">
                {/* Save the Date chữ lớn */}
                <div style={{
                  position:"absolute", top:"clamp(1rem,4vh,2rem)", left:0, right:0,
                  textAlign:"left", padding:"0 clamp(1rem,3vw,2rem)",
                  animation:"itemUp 1s ease 0.4s both",
                }}>
                  <p style={{
                    fontFamily:"'Great Vibes',cursive",
                    fontSize:"clamp(1.8rem,5vw,3rem)",
                    color:"rgba(255,255,255,0.95)", lineHeight:1.1, margin:0,
                    textShadow:"0 2px 12px rgba(0,0,0,0.3)",
                  }}>Save</p>
                  <p style={{
                    fontFamily:"'Great Vibes',cursive",
                    fontSize:"clamp(1.8rem,5vw,3rem)",
                    color:"rgba(255,255,255,0.95)", lineHeight:1.1, margin:0,
                    textShadow:"0 2px 12px rgba(0,0,0,0.3)",
                  }}>the</p>
                  <p style={{
                    fontFamily:"'Great Vibes',cursive",
                    fontSize:"clamp(1.8rem,5vw,3rem)",
                    color:"rgba(255,255,255,0.95)", lineHeight:1.1, margin:0,
                    textShadow:"0 2px 12px rgba(0,0,0,0.3)",
                  }}>Date</p>
                </div>

                {/* Hình minh họa đôi uyên ương — SVG Vector */}
                <div style={{
                  width:"100%", flex:1,
                  display:"flex", alignItems:"flex-end", justifyContent:"center",
                  animation:"itemUp 1.1s ease 0.6s both",
                  paddingBottom:"1rem",
                }}>
                  <CoupleSVG />
                </div>

                {/* Tên cặp đôi */}
                <p style={{
                  fontFamily:"'Playfair Display',serif", fontStyle:"italic",
                  fontWeight:400, fontSize:"clamp(0.9rem,2.5vw,1.2rem)",
                  color:"rgba(255,255,255,0.9)", margin:"0.2rem 0",
                  textAlign:"center", letterSpacing:"0.05em",
                  animation:"itemUp 0.9s ease 0.75s both",
                }}>Bảo Ngân &amp; Viết Định</p>

                <div className="deco-line-white" style={{ animation:"itemUp 0.8s ease 0.8s both" }}/>

                <p style={{
                  fontFamily:"'DM Sans',sans-serif", fontWeight:200,
                  fontSize:"clamp(0.45rem,1.2vw,0.6rem)", letterSpacing:"0.35em",
                  textTransform:"uppercase", color:"rgba(184,204,186,0.7)",
                  animation:"itemUp 0.8s ease 0.85s both",
                }}>26 · 04 · 2026</p>
              </div>
            </div>

            {/* Bóng đổ dưới thiệp */}
            <div style={{
              position:"absolute", bottom:"-30px", left:"5%", right:"5%",
              height:"30px", borderRadius:"50%",
              background:"rgba(0,0,0,0.4)",
              filter:"blur(15px)",
              transform: isOpen ? "scaleX(1.15)" : "scaleX(1)",
              transition:"transform 1.6s ease",
            }}/>
          </div>

          {/* Hint scroll */}
          <div className="ci-hint">
            <span style={{
              fontFamily:"'DM Sans',sans-serif", fontWeight:200,
              fontSize:"0.55rem", letterSpacing:"0.35em",
              textTransform:"uppercase", color:"rgba(127,168,130,0.6)",
            }}>Lăn chuột để mở thiệp</span>
            <svg viewBox="0 0 20 20" width="16" fill="none">
              <path d="M10 3 L10 17 M4 11 L10 17 L16 11"
                stroke="rgba(127,168,130,0.55)" strokeWidth="1.2"
                strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          <button className="ci-skip" onClick={() => setState("opening")}>
            Bỏ qua →
          </button>
        </div>
      )}
    </>
  );
}

// ── SVG Hoa trang trí ──
function FlowerSVG({ className, color }) {
  return (
    <svg className={className} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Cành lá */}
      <path d="M10 110 Q30 80 60 60 Q80 45 100 20" stroke={color} strokeWidth="1.5" fill="none" opacity="0.6"/>
      <path d="M10 110 Q40 90 55 65" stroke={color} strokeWidth="1" fill="none" opacity="0.4"/>
      {/* Lá */}
      <ellipse cx="35" cy="88" rx="12" ry="6" fill={color} opacity="0.35" transform="rotate(-30 35 88)"/>
      <ellipse cx="55" cy="68" rx="14" ry="6" fill={color} opacity="0.35" transform="rotate(-45 55 68)"/>
      <ellipse cx="75" cy="45" rx="12" ry="5" fill={color} opacity="0.3" transform="rotate(-55 75 45)"/>
      {/* Hoa */}
      <circle cx="100" cy="20" r="8" fill={color} opacity="0.5"/>
      <circle cx="100" cy="20" r="4" fill={color} opacity="0.7"/>
      <circle cx="90" cy="12" r="6" fill={color} opacity="0.4"/>
      <circle cx="108" cy="14" r="5" fill={color} opacity="0.4"/>
      <circle cx="95" cy="28" r="5" fill={color} opacity="0.35"/>
      {/* Hoa nhỏ */}
      <circle cx="60" cy="60" r="5" fill={color} opacity="0.4"/>
      <circle cx="60" cy="60" r="2.5" fill={color} opacity="0.6"/>
      <circle cx="30" cy="90" r="4" fill={color} opacity="0.35"/>
    </svg>
  );
}

// ── SVG Đôi uyên ương vector ──
function CoupleSVG() {
  return (
    <svg viewBox="0 0 200 280" style={{ width:"min(65%,180px)", height:"auto" }} xmlns="http://www.w3.org/2000/svg">
      {/* === CÔ DÂU (trái) === */}
      {/* Váy */}
      <path d="M60 160 Q40 200 30 270 L95 270 Q90 220 85 160 Z" fill="white" opacity="0.92"/>
      <path d="M85 160 Q90 200 95 270 L120 270 Q105 200 95 150 Z" fill="rgba(255,255,255,0.7)"/>
      {/* Ren váy */}
      <path d="M30 270 Q62 255 95 270" stroke="rgba(255,255,255,0.5)" strokeWidth="1" fill="none"/>
      <path d="M35 250 Q65 238 92 250" stroke="rgba(255,255,255,0.35)" strokeWidth="0.8" fill="none"/>
      {/* Thân áo */}
      <path d="M65 120 Q60 140 60 160 L95 160 Q92 140 88 120 Z" fill="white" opacity="0.95"/>
      {/* Cổ tay cô dâu */}
      <path d="M62 130 Q52 145 48 155" stroke="white" strokeWidth="8" strokeLinecap="round" fill="none"/>
      <path d="M86 128 Q95 140 98 148" stroke="white" strokeWidth="7" strokeLinecap="round" fill="none"/>
      {/* Đầu cô dâu */}
      <circle cx="76" cy="100" r="18" fill="#f5e6d8"/>
      {/* Tóc */}
      <path d="M58 98 Q60 80 76 78 Q92 78 94 98" fill="#3d2b1f" opacity="0.9"/>
      <path d="M58 98 Q55 110 60 118" stroke="#3d2b1f" strokeWidth="4" fill="none" opacity="0.8"/>
      <path d="M94 98 Q97 108 95 116" stroke="#3d2b1f" strokeWidth="3" fill="none" opacity="0.6"/>
      {/* Mạng cô dâu */}
      <path d="M60 88 Q76 82 92 88 L95 78 Q76 72 57 78 Z" fill="rgba(255,255,255,0.6)"/>
      <path d="M57 78 Q76 68 95 78" stroke="rgba(255,255,255,0.8)" strokeWidth="0.8" fill="none"/>
      {/* Mặt */}
      <ellipse cx="70" cy="103" rx="2" ry="2.5" fill="#3d2b1f" opacity="0.7"/>
      <ellipse cx="82" cy="103" rx="2" ry="2.5" fill="#3d2b1f" opacity="0.7"/>
      <path d="M72 110 Q76 113 80 110" stroke="#c47a7a" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
      {/* Bó hoa */}
      <circle cx="50" cy="158" r="14" fill="rgba(255,255,255,0.4)"/>
      <circle cx="46" cy="154" r="5" fill="white" opacity="0.8"/>
      <circle cx="54" cy="153" r="5" fill="rgba(232,240,232,0.9)"/>
      <circle cx="50" cy="162" r="5" fill="white" opacity="0.75"/>
      <circle cx="43" cy="161" r="4" fill="rgba(200,230,200,0.8)"/>
      <circle cx="57" cy="161" r="4" fill="white" opacity="0.7"/>
      {/* Dải ruy băng */}
      <path d="M48 172 Q44 182 40 192" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" fill="none"/>
      <path d="M52 172 Q56 182 58 190" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" fill="none"/>

      {/* === CHÚ RỂ (phải) === */}
      {/* Quần */}
      <path d="M118 170 L112 270 L130 270 L132 200 Z" fill="#2d3748" opacity="0.85"/>
      <path d="M150 170 L156 270 L138 270 L136 200 Z" fill="#2d3748" opacity="0.85"/>
      {/* Áo vest */}
      <path d="M112 120 Q108 145 110 170 L158 170 Q160 145 156 120 Z" fill="#4a5568" opacity="0.9"/>
      {/* Cổ áo trắng */}
      <path d="M128 120 L134 138 L140 120" fill="white" opacity="0.9"/>
      {/* Nơ đen */}
      <path d="M130 122 L134 126 L138 122 L134 128 Z" fill="#1a202c"/>
      {/* Tay áo */}
      <path d="M110 122 Q100 140 98 155" stroke="#4a5568" strokeWidth="10" strokeLinecap="round" fill="none"/>
      <path d="M158 122 Q168 140 170 155" stroke="#4a5568" strokeWidth="10" strokeLinecap="round" fill="none"/>
      {/* Tay áo sơ mi */}
      <path d="M98 155 Q95 162 94 168" stroke="white" strokeWidth="7" strokeLinecap="round" fill="none"/>
      <path d="M170 155 Q173 162 174 168" stroke="white" strokeWidth="7" strokeLinecap="round" fill="none"/>
      {/* Đầu chú rể */}
      <circle cx="134" cy="98" r="19" fill="#f0d9c0"/>
      {/* Tóc */}
      <path d="M115 94 Q117 76 134 74 Q151 76 153 94" fill="#2d1f0f" opacity="0.9"/>
      {/* Kính */}
      <rect x="122" y="99" width="10" height="7" rx="3" stroke="#4a3728" strokeWidth="1.2" fill="rgba(200,230,255,0.2)"/>
      <rect x="136" y="99" width="10" height="7" rx="3" stroke="#4a3728" strokeWidth="1.2" fill="rgba(200,230,255,0.2)"/>
      <path d="M132 102 L136 102" stroke="#4a3728" strokeWidth="1" fill="none"/>
      <path d="M120 102 L118 100" stroke="#4a3728" strokeWidth="1" fill="none"/>
      <path d="M148 102 L150 100" stroke="#4a3728" strokeWidth="1" fill="none"/>
      {/* Mặt */}
      <path d="M128 109 Q134 113 140 109" stroke="#c47a7a" strokeWidth="1.2" fill="none" strokeLinecap="round"/>

      {/* === ĐƯỜNG NỐI TAY === */}
      <path d="M96 165 Q107 170 118 168" stroke="rgba(255,255,255,0.3)" strokeWidth="3" strokeLinecap="round" fill="none"/>
    </svg>
  );
}