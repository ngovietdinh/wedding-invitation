// ============================================================
// TEXT REVEAL — Hiệu ứng chữ đỉnh cao khi scroll
// ============================================================
// CÁCH DÙNG:
//
// 1. SplitReveal — chữ tách ra từ 2 bên hội tụ vào giữa
//    <SplitReveal>Bảo Ngân & Viết Định</SplitReveal>
//
// 2. SlideReveal — chữ trượt lên từ dưới (mask clip)
//    <SlideReveal>Hành trình tình yêu</SlideReveal>
//
// 3. FadeWords — từng từ fade in lần lượt
//    <FadeWords delay={0.1}>Câu chuyện của chúng tôi</FadeWords>
//
// 4. TypeReveal — chữ gõ ra từng ký tự (typewriter)
//    <TypeReveal speed={60}>26 · 04 · 2026</TypeReveal>
//
// 5. HeadingReveal — tiêu đề di chuyển nhẹ + parallax
//    <HeadingReveal>Bộ Sưu Tập</HeadingReveal>
//
// 6. GlowReveal — chữ sáng dần từ mờ lên rõ
//    <GlowReveal>Câu chuyện của chúng tôi</GlowReveal>
//
// Props chung:
//   delay     — số giây delay (default 0)
//   threshold — 0-1, % thấy mới trigger (default 0.1)
//   once      — chỉ chạy 1 lần (default true)
// ============================================================

import { useEffect, useRef, useState, useCallback } from "react";

// ── Hook dùng chung ──
function useInView(threshold = 0.12, once = true) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true);
          if (once) obs.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold, once]);
  return { ref, inView };
}

// ═══════════════════════════════════════════════
// 1. SPLIT REVEAL — chữ từ 2 bên hội tụ vào giữa
// ═══════════════════════════════════════════════
export function SplitReveal({
  children,
  delay = 0,
  duration = 1.1,
  threshold = 0.15,
  style = {},
  className = "",
}) {
  const { ref, inView } = useInView(threshold);
  const text = String(children);
  const mid  = Math.floor(text.length / 2);
  const leftChars  = text.slice(0, mid).split("");
  const rightChars = text.slice(mid).split("");

  return (
    <>
      <style>{`
        .sr-wrap { display:inline-flex; flex-wrap:wrap; overflow:hidden; }
        .sr-char {
          display:inline-block;
          transition-property: opacity, transform;
          transition-timing-function: cubic-bezier(0.22,1,0.36,1);
          will-change: transform, opacity;
        }
        .sr-char.space { width:0.28em; }
      `}</style>
      <span
        ref={ref}
        className={`sr-wrap ${className}`}
        style={{ ...style, display:'inline-flex', flexWrap:'nowrap', whiteSpace:'pre' }}
      >
        {/* Nửa trái — bay từ trái vào */}
        {leftChars.map((ch, i) => (
          <span
            key={`L${i}`}
            className={`sr-char${ch===' '?' space':''}`}
            style={{
              opacity:    inView ? 1 : 0,
              transform:  inView ? 'translateX(0)' : `translateX(${-28 - i * 2}px)`,
              transitionDuration:  `${duration}s`,
              transitionDelay:     `${delay + (mid - i - 1) * 0.025}s`,
            }}
          >{ch === ' ' ? '\u00A0' : ch}</span>
        ))}
        {/* Nửa phải — bay từ phải vào */}
        {rightChars.map((ch, i) => (
          <span
            key={`R${i}`}
            className={`sr-char${ch===' '?' space':''}`}
            style={{
              opacity:    inView ? 1 : 0,
              transform:  inView ? 'translateX(0)' : `translateX(${28 + i * 2}px)`,
              transitionDuration:  `${duration}s`,
              transitionDelay:     `${delay + i * 0.025}s`,
            }}
          >{ch === ' ' ? '\u00A0' : ch}</span>
        ))}
      </span>
    </>
  );
}

// ═══════════════════════════════════════════════
// 2. SLIDE REVEAL — chữ trượt lên từ dưới (mask)
// Hiệu ứng "curtain" rất điện ảnh
// ═══════════════════════════════════════════════
export function SlideReveal({
  children,
  delay = 0,
  duration = 0.95,
  threshold = 0.12,
  stagger = 0,   // delay giữa các dòng nếu multiline
  style = {},
  className = "",
}) {
  const { ref, inView } = useInView(threshold);
  // Tách thành mảng lines nếu children là array
  const lines = Array.isArray(children) ? children : [children];

  return (
    <>
      <style>{`
        .slide-outer {
          overflow: hidden;
          display: block;
          line-height: 1.2;
        }
        .slide-inner {
          display: block;
          will-change: transform, opacity;
          transition-property: transform, opacity;
          transition-timing-function: cubic-bezier(0.22,1,0.36,1);
        }
      `}</style>
      <span ref={ref} style={{ display:'block', ...style }} className={className}>
        {lines.map((line, i) => (
          <span key={i} className="slide-outer" style={{ display:'block' }}>
            <span
              className="slide-inner"
              style={{
                opacity:           inView ? 1 : 0,
                transform:         inView ? 'translateY(0)' : 'translateY(105%)',
                transitionDuration:`${duration}s`,
                transitionDelay:   `${delay + i * stagger}s`,
              }}
            >{line}</span>
          </span>
        ))}
      </span>
    </>
  );
}

// ═══════════════════════════════════════════════
// 3. FADE WORDS — từng từ fade in lần lượt
// ═══════════════════════════════════════════════
export function FadeWords({
  children,
  delay = 0,
  stagger = 0.08,
  duration = 0.7,
  threshold = 0.1,
  style = {},
  className = "",
}) {
  const { ref, inView } = useInView(threshold);
  const words = String(children).split(" ");

  return (
    <span ref={ref} style={{ display:'inline', ...style }} className={className}>
      {words.map((w, i) => (
        <span
          key={i}
          style={{
            display:           'inline-block',
            opacity:           inView ? 1 : 0,
            transform:         inView ? 'translateY(0)' : 'translateY(12px)',
            transition:        `opacity ${duration}s cubic-bezier(0.22,1,0.36,1) ${delay + i * stagger}s, transform ${duration}s cubic-bezier(0.22,1,0.36,1) ${delay + i * stagger}s`,
            willChange:        'opacity, transform',
            marginRight:       '0.28em',
          }}
        >{w}</span>
      ))}
    </span>
  );
}

// ═══════════════════════════════════════════════
// 4. TYPEWRITER REVEAL
// ═══════════════════════════════════════════════
export function TypeReveal({
  children,
  delay = 0,
  speed = 55,       // ms mỗi ký tự
  threshold = 0.15,
  cursor = true,
  style = {},
  className = "",
}) {
  const { ref, inView } = useInView(threshold);
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  const text = String(children);
  const started = useRef(false);

  useEffect(() => {
    if (!inView || started.current) return;
    started.current = true;
    let i = 0;
    const t = setTimeout(() => {
      const id = setInterval(() => {
        i++;
        setDisplayed(text.slice(0, i));
        if (i >= text.length) { clearInterval(id); setDone(true); }
      }, speed);
      return () => clearInterval(id);
    }, delay * 1000);
    return () => clearTimeout(t);
  }, [inView, text, speed, delay]);

  return (
    <span ref={ref} style={style} className={className}>
      {displayed}
      {cursor && !done && (
        <span style={{
          display:'inline-block', width:'2px', height:'1em',
          background:'currentColor', marginLeft:'1px',
          verticalAlign:'text-bottom',
          animation:'blink 0.8s step-end infinite',
        }}/>
      )}
      <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}`}</style>
    </span>
  );
}

// ═══════════════════════════════════════════════
// 5. HEADING REVEAL — tiêu đề section đỉnh cao
// Scale + fade + floating animation sau khi hiện
// ═══════════════════════════════════════════════
export function HeadingReveal({
  children,
  delay = 0,
  threshold = 0.12,
  float = true,     // floating nhẹ sau khi hiện
  style = {},
  className = "",
}) {
  const { ref, inView } = useInView(threshold);

  return (
    <>
      <style>{`
        .hr-el {
          will-change: transform, opacity;
          transition-property: transform, opacity;
          transition-timing-function: cubic-bezier(0.22,1,0.36,1);
        }
        .hr-el.float {
          animation: headingFloat 6s ease-in-out infinite;
        }
        @keyframes headingFloat {
          0%,100% { transform: translateY(0px) rotate(0deg); }
          33%      { transform: translateY(-4px) rotate(0.3deg); }
          66%      { transform: translateY(-2px) rotate(-0.2deg); }
        }
      `}</style>
      <span
        ref={ref}
        className={`hr-el ${inView && float ? 'float' : ''} ${className}`}
        style={{
          display:           'block',
          opacity:           inView ? 1 : 0,
          transform:         inView ? 'translateY(0) scale(1)' : 'translateY(32px) scale(0.96)',
          transitionDuration:'1.2s',
          transitionDelay:   `${delay}s`,
          ...style,
        }}
      >{children}</span>
    </>
  );
}

// ═══════════════════════════════════════════════
// 6. GLOW REVEAL — chữ sáng dần lên
// ═══════════════════════════════════════════════
export function GlowReveal({
  children,
  delay = 0,
  duration = 1.4,
  threshold = 0.1,
  color = "rgba(74,124,89,0.6)",
  style = {},
  className = "",
}) {
  const { ref, inView } = useInView(threshold);

  return (
    <span
      ref={ref}
      style={{
        display: 'block',
        opacity:    inView ? 1 : 0,
        filter:     inView
          ? 'blur(0px) brightness(1)'
          : 'blur(6px) brightness(0.3)',
        transform:  inView ? 'scale(1)' : 'scale(0.97)',
        transition: `opacity ${duration}s ease ${delay}s, filter ${duration}s ease ${delay}s, transform ${duration}s ease ${delay}s`,
        willChange: 'opacity, filter, transform',
        ...style,
      }}
      className={className}
    >{children}</span>
  );
}

// ═══════════════════════════════════════════════
// 7. CHAR STAGGER — từng chữ cái hiện lần lượt
// từ phải sang trái hoặc trái sang phải
// ═══════════════════════════════════════════════
export function CharStagger({
  children,
  delay = 0,
  stagger = 0.04,
  duration = 0.6,
  direction = "up",   // "up" | "left" | "right"
  threshold = 0.12,
  style = {},
  className = "",
}) {
  const { ref, inView } = useInView(threshold);
  const chars = String(children).split("");

  const getTransform = (visible) => {
    if (visible) return 'translate(0,0)';
    switch(direction) {
      case "left":  return 'translateX(-20px)';
      case "right": return 'translateX(20px)';
      default:      return 'translateY(18px)';
    }
  };

  return (
    <span
      ref={ref}
      style={{ display:'inline-flex', flexWrap:'wrap', ...style }}
      className={className}
    >
      {chars.map((ch, i) => (
        <span
          key={i}
          style={{
            display:    'inline-block',
            opacity:    inView ? 1 : 0,
            transform:  inView ? 'translate(0,0)' : getTransform(false),
            transition: `opacity ${duration}s cubic-bezier(0.22,1,0.36,1) ${delay + i * stagger}s, transform ${duration}s cubic-bezier(0.22,1,0.36,1) ${delay + i * stagger}s`,
            whiteSpace: 'pre',
          }}
        >{ch === ' ' ? '\u00A0' : ch}</span>
      ))}
    </span>
  );
}

// ═══════════════════════════════════════════════
// 8. SCROLL LINE — đường kẻ vẽ dần ra
// ═══════════════════════════════════════════════
export function ScrollLine({
  delay = 0,
  duration = 1.2,
  direction = "horizontal",   // "horizontal" | "vertical"
  color = "linear-gradient(90deg,transparent,#4A7C59,transparent)",
  thickness = "1px",
  threshold = 0.15,
  style = {},
}) {
  const { ref, inView } = useInView(threshold);
  const isH = direction === "horizontal";

  return (
    <div
      ref={ref}
      style={{
        overflow: 'hidden',
        width:  isH ? '100%'  : thickness,
        height: isH ? thickness : '100%',
        ...style,
      }}
    >
      <div style={{
        width:     '100%',
        height:    '100%',
        background: color,
        transform:  inView
          ? 'scaleX(1) scaleY(1)'
          : isH ? 'scaleX(0)' : 'scaleY(0)',
        transformOrigin: isH ? 'left center' : 'top center',
        transition: `transform ${duration}s cubic-bezier(0.22,1,0.36,1) ${delay}s`,
      }}/>
    </div>
  );
}

// Export default là object chứa tất cả
export default {
  SplitReveal,
  SlideReveal,
  FadeWords,
  TypeReveal,
  HeadingReveal,
  GlowReveal,
  CharStagger,
  ScrollLine,
};
