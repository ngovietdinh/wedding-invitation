// ============================================================
// SCROLL REVEAL — Hiệu ứng hiện dần khi scroll đến
// Dùng bọc ngoài bất kỳ element/section nào
// ============================================================
// CÁCH DÙNG:
//   import ScrollReveal from "./ScrollReveal";
//
//   // Mặc định: fade + slide up
//   <ScrollReveal><StoryTimeline /></ScrollReveal>
//
//   // Tùy chỉnh:
//   <ScrollReveal delay={0.15} direction="left" distance={40}>
//     <MapSection />
//   </ScrollReveal>
//
//   // Props:
//   //   delay     — giây delay trước khi chạy (default: 0)
//   //   direction — "up" | "down" | "left" | "right" | "none" (default: "up")
//   //   distance  — px dịch chuyển (default: 32)
//   //   duration  — giây (default: 0.85)
//   //   threshold — 0–1, bao nhiêu % thấy mới trigger (default: 0.12)
// ============================================================

import { useEffect, useRef, useState } from "react";

export default function ScrollReveal({
  children,
  delay     = 0,
  direction = "up",
  distance  = 32,
  duration  = 0.85,
  threshold = 0.12,
}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  // Transform ban đầu theo direction
  const getInitialTransform = () => {
    switch (direction) {
      case "up":    return `translateY(${distance}px)`;
      case "down":  return `translateY(-${distance}px)`;
      case "left":  return `translateX(${distance}px)`;
      case "right": return `translateX(-${distance}px)`;
      default:      return "none";
    }
  };

  return (
    <div
      ref={ref}
      style={{
        opacity:   visible ? 1 : 0,
        transform: visible ? "translate(0,0)" : getInitialTransform(),
        transition: visible
          ? `opacity ${duration}s ease ${delay}s, transform ${duration}s cubic-bezier(0.22,1,0.36,1) ${delay}s`
          : "none",
        willChange: "opacity, transform",
      }}
    >
      {children}
    </div>
  );
}


// ============================================================
// SCROLL REVEAL STAGGER — Hiện từng item lần lượt
// ============================================================
// CÁCH DÙNG:
//   import { StaggerReveal } from "./ScrollReveal";
//
//   <StaggerReveal stagger={0.1}>
//     <div>Item 1</div>
//     <div>Item 2</div>
//     <div>Item 3</div>
//   </StaggerReveal>
// ============================================================

export function StaggerReveal({
  children,
  stagger   = 0.1,
  direction = "up",
  distance  = 24,
  duration  = 0.75,
  threshold = 0.1,
}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  const getTransform = () => {
    switch (direction) {
      case "up":    return `translateY(${distance}px)`;
      case "down":  return `translateY(-${distance}px)`;
      case "left":  return `translateX(${distance}px)`;
      case "right": return `translateX(-${distance}px)`;
      default:      return "none";
    }
  };

  return (
    <div ref={ref}>
      {Array.isArray(children)
        ? children.map((child, i) => (
            <div
              key={i}
              style={{
                opacity:   visible ? 1 : 0,
                transform: visible ? "translate(0,0)" : getTransform(),
                transition: visible
                  ? `opacity ${duration}s ease ${i * stagger}s, transform ${duration}s cubic-bezier(0.22,1,0.36,1) ${i * stagger}s`
                  : "none",
                willChange: "opacity, transform",
              }}
            >
              {child}
            </div>
          ))
        : children
      }
    </div>
  );
}
