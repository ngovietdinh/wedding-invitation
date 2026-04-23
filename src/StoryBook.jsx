// ============================================================
// STORY BOOK — Final version
// - Font đồng nhất Cormorant Garamond + Jost weight 300/400
// - Lật trang RAF custom easing — scaleX cong, bóng sống động
// - Click vào sách = pause/resume auto
// - Auto 5.8s/trang, progress bar
// ============================================================

import { useState, useEffect, useRef, useCallback } from "react";

const DELAY = 5800;

// ── Typography styles — đồng nhất toàn bộ ──
const T = {
  tag:   { fontFamily:"'Jost',sans-serif",             fontWeight:400, fontSize:'8.5px', letterSpacing:'.32em', textTransform:'uppercase' },
  sea:   { fontFamily:"'Jost',sans-serif",             fontWeight:300, fontSize:'9px',   letterSpacing:'.2em',  textTransform:'uppercase' },
  yr:    { fontFamily:"'Cormorant Garamond',serif",    fontWeight:300, fontSize:'clamp(1.7rem,5vw,2.6rem)', lineHeight:1, letterSpacing:'-.02em' },
  title: { fontFamily:"'Cormorant Garamond',serif",    fontStyle:'italic', fontWeight:400, fontSize:'clamp(.82rem,2.3vw,1.05rem)', lineHeight:1.35 },
  story: { fontFamily:"'Jost',sans-serif",             fontWeight:300, fontSize:'clamp(.62rem,1.55vw,.74rem)', lineHeight:1.92 },
  pnum:  { fontFamily:"'Jost',sans-serif",             fontWeight:300, fontSize:'9.5px', letterSpacing:'.14em' },
  cvSub: { fontFamily:"'Jost',sans-serif",             fontWeight:300, fontSize:'9px',   letterSpacing:'.38em', textTransform:'uppercase' },
  cvNm:  { fontFamily:"'Cormorant Garamond',serif",    fontStyle:'italic', fontWeight:300, fontSize:'clamp(1.05rem,3vw,1.45rem)', lineHeight:1.2 },
  cvDt:  { fontFamily:"'Jost',sans-serif",             fontWeight:300, fontSize:'9px',   letterSpacing:'.28em' },
};

const CD = {
  dark:{ tc:'rgba(232,240,232,.95)', sc:'rgba(184,204,186,.68)', yc:'rgba(127,168,130,.15)', tb:'rgba(127,168,130,.18)', tl:'rgba(184,204,186,.82)', sa:'rgba(127,168,130,.28)', nm:'rgba(127,168,130,.28)' },
  lite:{ tc:'#1A3A28', sc:'#5A7A62', yc:'rgba(74,124,89,.12)', tb:'#E8F0E8', tl:'#4A7C59', sa:'rgba(74,124,89,.15)', nm:'rgba(127,168,130,.2)' },
};

const PAGES = [
  { id:0, label:'Bìa sổ',
    lBg:'linear-gradient(148deg,#121f16,#1a3828)', rBg:'linear-gradient(148deg,#1a3828,#2d5a3d)',
    left:'cover-l', right:'cover-r' },
  { id:1, label:'Chương 01 — 02',
    lBg:'linear-gradient(135deg,#fff,#f8fbf8)', rBg:'linear-gradient(135deg,#f5f9f5,#edf4ed)',
    left: {ch:'Chương 01',sea:'Mùa Thu · 2019',yr:'2019',ic:'✦',ti:'Lần đầu gặp nhau',st:'Không ai trong chúng tôi nghĩ đó là điểm khởi đầu. Chỉ là một buổi chiều bình thường — cho đến khi nhìn lại, mới thấy đó là khoảnh khắc mọi thứ bắt đầu thay đổi.',nm:'01'},
    right:{ch:'Chương 02',sea:'Mùa Đông · 2020',yr:'2020',ic:'◇',ti:'Những tin nhắn lúc nửa đêm',st:'Thế giới bỗng dưng chậm lại. Và trong khoảng lặng yên đó, hai người tìm thấy nhau nhiều hơn — qua những câu chuyện nhỏ và tiếng cười không lý do.',nm:'02',mir:true} },
  { id:2, label:'Chương 03 — 04',
    lBg:'linear-gradient(135deg,#f8fbf8,#f0f7f0)', rBg:'linear-gradient(135deg,#f0f7f0,#e8f2e8)',
    left: {ch:'Chương 03',sea:'Mùa Hè · 2022',yr:'2022',ic:'○',ti:'Chuyến đi làm thay đổi tất cả',st:'Đà Nẵng, 5 giờ sáng, ngồi bên bờ biển không nói gì. Có những khoảnh khắc không cần lời — từ đây sẽ không đi một mình nữa.',nm:'03'},
    right:{ch:'Chương 04',sea:'Mùa Xuân · 2024',yr:'2024',ic:'◈',ti:'Anh hỏi. Em gật đầu.',st:'Không có đám đông, không có ánh đèn. Chỉ có một câu hỏi chân thành và một câu trả lời đã được biết từ trước — bằng trái tim.',nm:'04',mir:true} },
  { id:3, label:'Chương Cuối',
    lBg:'linear-gradient(148deg,#1a3828,#2d5a3d)', rBg:'linear-gradient(148deg,#2d5a3d,#1a3828)',
    left: {ch:'Chương Cuối',sea:'26 · 04 · 2026',yr:'2026',ic:'❋',ti:'Ngày chúng ta bắt đầu',st:'Và giờ đây, chúng tôi mời bạn — những người đã là một phần của hành trình — cùng chứng kiến chương tiếp theo.',nm:'05',dark:true},
    right:'end' },
];

// ── Components ──
function ChapterPage({ d }) {
  const c = d.dark ? CD.dark : CD.lite;
  const mir = d.mir;
  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', justifyContent:'space-between', padding:'clamp(1rem,3.8vw,1.9rem)', position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', top:0, [mir?'right':'left']:0, bottom:0, width:'2.5px', background:`linear-gradient(180deg,transparent,${c.sa},transparent)` }}/>
      <div style={{ position:'absolute', bottom:'.85rem', [mir?'left':'right']:'1rem', ...T.pnum, color:c.nm }}>— {d.nm} —</div>
      <div style={{ display:'flex', flexDirection:'column', gap:'.3rem' }}>
        <span style={{ ...T.tag, display:'inline-block', padding:'2px 9px', background:c.tb, color:c.tl, alignSelf:'flex-start' }}>{d.ch}</span>
        <p style={{ ...T.sea, color:c.sc, margin:'.06rem 0' }}>{d.sea}</p>
        <p style={{ ...T.yr, color:c.yc, margin:0 }}>{d.yr}</p>
        <p style={{ fontSize:'.8rem', color:d.dark?'rgba(127,168,130,.52)':'#7FA882', margin:'-.25rem 0' }}>{d.ic}</p>
        <h3 style={{ ...T.title, color:c.tc, margin:0 }}>{d.ti}</h3>
      </div>
      <p style={{ ...T.story, color:c.sc, margin:0 }}>{d.st}</p>
    </div>
  );
}

function CoverLeft() {
  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'.55rem', padding:'1.4rem', textAlign:'center', background:'linear-gradient(148deg,#121f16,#1a3828)', position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', inset:0, backgroundImage:'repeating-linear-gradient(45deg,transparent 0,transparent 16px,rgba(127,168,130,.03) 16px,rgba(127,168,130,.03) 17px)' }}/>
      <div style={{ position:'absolute', top:9, left:9, right:9, bottom:9, border:'1px solid rgba(127,168,130,.2)', pointerEvents:'none' }}/>
      <svg viewBox="0 0 52 52" style={{ width:'36px', opacity:.48, position:'relative', zIndex:1 }}>
        <circle cx="26" cy="26" r="23" stroke="rgba(127,168,130,.38)" strokeWidth="1" fill="none"/>
        <path d="M11 26 Q26 10 41 26 Q26 42 11 26Z" fill="rgba(127,168,130,.2)"/>
        <circle cx="26" cy="26" r="4" fill="rgba(127,168,130,.48)"/>
      </svg>
      <p style={{ ...T.cvSub, color:'rgba(127,168,130,.55)', position:'relative', zIndex:1 }}>Câu chuyện của</p>
      <p style={{ ...T.cvNm, color:'rgba(232,240,232,.95)', position:'relative', zIndex:1, margin:0 }}>Bảo Ngân<br/>&amp; Viết Định</p>
      <div style={{ width:'28px', height:'1px', background:'rgba(127,168,130,.32)', position:'relative', zIndex:1 }}/>
      <p style={{ ...T.cvDt, color:'rgba(127,168,130,.42)', position:'relative', zIndex:1, margin:0 }}>2019 — 2026</p>
    </div>
  );
}

function CoverRight() {
  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'linear-gradient(148deg,#1a3828,#2d5a3d)', position:'relative', overflow:'hidden', gap:'.5rem', padding:'1rem' }}>
      <div style={{ position:'absolute', inset:0, backgroundImage:'repeating-linear-gradient(45deg,transparent 0,transparent 16px,rgba(127,168,130,.03) 16px,rgba(127,168,130,.03) 17px)' }}/>
      <div style={{ position:'absolute', top:9, left:9, right:9, bottom:9, border:'1px solid rgba(127,168,130,.2)', pointerEvents:'none' }}/>
      <svg viewBox="0 0 110 148" style={{ width:'min(60%,132px)', height:'auto', position:'relative', zIndex:1 }}>
        <path d="M29 94 Q16 122 11 145 L51 145 Q47 122 45 94Z" fill="rgba(255,255,255,.87)"/>
        <path d="M45 94 Q49 120 51 145 L64 145 Q55 118 50 90Z" fill="rgba(255,255,255,.5)"/>
        <path d="M31 63 Q28 75 29 94 L49 94 Q47 77 44 63Z" fill="rgba(255,255,255,.91)"/>
        <path d="M31 63 Q25 70 23 80" stroke="rgba(255,255,255,.87)" strokeWidth="4.5" strokeLinecap="round" fill="none"/>
        <path d="M44 62 Q50 69 52 78" stroke="rgba(255,255,255,.72)" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
        <circle cx="38" cy="49" r="11" fill="#f5e0cc"/>
        <path d="M27 47 Q29 38 38 36 Q47 38 49 47" fill="#3d2b1f" opacity=".87"/>
        <path d="M27 39 Q38 33 49 39 L51 35 Q38 29 25 35Z" fill="rgba(255,255,255,.5)"/>
        <ellipse cx="33" cy="51" rx="1.4" ry="1.9" fill="#3d2b1f" opacity=".62"/>
        <ellipse cx="43" cy="51" rx="1.4" ry="1.9" fill="#3d2b1f" opacity=".62"/>
        <path d="M35 57 Q38 60 41 57" stroke="#c47a7a" strokeWidth="1.1" fill="none" strokeLinecap="round"/>
        <circle cx="21" cy="96" r="7.5" fill="rgba(255,255,255,.3)"/>
        <circle cx="18" cy="93" r="3.2" fill="white" opacity=".78"/>
        <circle cx="24" cy="93" r="3.2" fill="rgba(220,240,220,.82)"/>
        <circle cx="21" cy="100" r="3.2" fill="white" opacity=".68"/>
        <path d="M61 99 L55 145 L66 145 L68 123Z" fill="#2d3748" opacity=".84"/>
        <path d="M83 99 L90 145 L79 145 L77 123Z" fill="#2d3748" opacity=".84"/>
        <path d="M55 65 Q52 82 53 99 L92 99 Q93 82 90 65Z" fill="#4a5568" opacity=".87"/>
        <path d="M70 65 L73 79 L78 65" fill="rgba(255,255,255,.9)"/>
        <path d="M71 67 L73 71 L75 67 L73 74Z" fill="#1a202c"/>
        <path d="M53 67 Q45 82 43 96" stroke="#4a5568" strokeWidth="6.5" strokeLinecap="round" fill="none"/>
        <path d="M92 67 Q100 82 102 96" stroke="#4a5568" strokeWidth="6.5" strokeLinecap="round" fill="none"/>
        <path d="M43 96 Q41 103 41 108" stroke="rgba(255,255,255,.87)" strokeWidth="4.5" strokeLinecap="round" fill="none"/>
        <path d="M102 96 Q104 103 104 108" stroke="rgba(255,255,255,.87)" strokeWidth="4.5" strokeLinecap="round" fill="none"/>
        <circle cx="72" cy="51" r="13" fill="#f0d5b5"/>
        <path d="M59 47 Q61 36 72 34 Q83 36 85 47" fill="#2d1f0f" opacity=".87"/>
        <rect x="63" y="51" width="7.5" height="5.5" rx="2.2" stroke="#4a3728" strokeWidth=".9" fill="rgba(200,225,255,.16)"/>
        <rect x="74" y="51" width="7.5" height="5.5" rx="2.2" stroke="#4a3728" strokeWidth=".9" fill="rgba(200,225,255,.16)"/>
        <path d="M71 54 L74 54" stroke="#4a3728" strokeWidth=".7" fill="none"/>
        <path d="M69 58 Q72 62 75 58" stroke="#c47a7a" strokeWidth="1.1" fill="none" strokeLinecap="round"/>
      </svg>
      <p style={{ ...T.cvDt, color:'rgba(255,255,255,.48)', position:'relative', zIndex:1, margin:'.3rem 0 0' }}>Lật trang để bắt đầu ›</p>
    </div>
  );
}

function EndPage() {
  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'.8rem', padding:'1.5rem', textAlign:'center', background:'linear-gradient(148deg,#2d5a3d,#1a3828)', position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', inset:0, backgroundImage:'repeating-linear-gradient(45deg,transparent 0,transparent 16px,rgba(127,168,130,.03) 16px,rgba(127,168,130,.03) 17px)' }}/>
      <p style={{ fontSize:'16px', opacity:.42, position:'relative', zIndex:1 }}>❋</p>
      <p style={{ ...T.title, color:'rgba(232,240,232,.88)', lineHeight:1.72, maxWidth:'84%', position:'relative', zIndex:1 }}>
        "Hai người, một hành trình —<br/>chúng tôi muốn bắt đầu<br/>cùng sự hiện diện của bạn."
      </p>
      <div style={{ width:'28px', height:'1px', background:'rgba(127,168,130,.32)', position:'relative', zIndex:1 }}/>
      <p style={{ ...T.title, color:'rgba(127,168,130,.78)', position:'relative', zIndex:1, margin:0 }}>Bảo Ngân &amp; Viết Định</p>
      <p style={{ ...T.cvDt, color:'rgba(127,168,130,.42)', position:'relative', zIndex:1, margin:0 }}>26 · 04 · 2026 · Huế</p>
    </div>
  );
}

function PageContent({ page, side }) {
  const d = page[side];
  if (d === 'cover-l') return <CoverLeft/>;
  if (d === 'cover-r') return <CoverRight/>;
  if (d === 'end')     return <EndPage/>;
  return <ChapterPage d={d}/>;
}

// ── Flip Layer — RAF custom easing ──
function FlipLayer({ state, dir, frontPage, frontSide, backPage, backSide }) {
  const wrapRef  = useRef(null);
  const shRRef   = useRef(null);
  const shLRef   = useRef(null);
  const rafRef   = useRef(null);

  useEffect(() => {
    if (!state || !wrapRef.current) return;
    const wrap = wrapRef.current;
    const shR  = shRRef.current;
    const shL  = shLRef.current;
    const TOTAL = 920;
    const start = performance.now();
    const finalAngle = dir === 'next' ? -180 : 180;

    cancelAnimationFrame(rafRef.current);

    function frame(now) {
      const t = Math.min((now - start) / TOTAL, 1);
      let angle, sx;

      if (t < 0.46) {
        const t1 = t / 0.46;
        const ease1 = t1 * t1 * (3 - 2 * t1);
        angle = (dir === 'next' ? -1 : 1) * ease1 * 90;
        sx = 1 - ease1 * 0.05;
        if (shR) shR.style.opacity = String(ease1 * 0.9);
        if (shL) shL.style.opacity = '0';
      } else {
        const t2 = (t - 0.46) / 0.54;
        const ease2 = 1 - Math.pow(1 - t2, 2.4);
        angle = (dir === 'next' ? -1 : 1) * (90 + ease2 * 90);
        sx = 1 - (1 - Math.abs(t2 - 0.5) * 2) * 0.04;
        if (shR) shR.style.opacity = String(Math.max(0, (1 - t2 * 1.5) * 0.8));
        if (shL) shL.style.opacity = String(t2 * 0.55);
      }

      wrap.style.transform = `rotateY(${angle}deg) scaleX(${sx})`;
      if (t < 1) rafRef.current = requestAnimationFrame(frame);
    }

    rafRef.current = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafRef.current);
  }, [state, dir]);

  if (!state) return null;

  const pos = dir === 'next'
    ? { position:'absolute', top:0, right:0, bottom:0, width:'50%' }
    : { position:'absolute', top:0, left:0,  bottom:0, width:'50%' };

  return (
    <div ref={wrapRef} style={{
      ...pos,
      transformOrigin: dir === 'next' ? 'left center' : 'right center',
      transformStyle:'preserve-3d',
      transform:'rotateY(0deg)',
      zIndex:20, pointerEvents:'none',
    }}>
      {/* Mặt trước */}
      <div style={{
        position:'absolute', inset:0,
        backfaceVisibility:'hidden', WebkitBackfaceVisibility:'hidden',
        overflow:'hidden', background: frontPage[`${frontSide}Bg`] || '#fff',
      }}>
        <div style={{ position:'absolute', inset:0, backgroundImage:'repeating-linear-gradient(180deg,transparent 0,transparent 28px,rgba(127,168,130,.045) 28px,rgba(127,168,130,.045) 29px)', backgroundPosition:'0 3rem', pointerEvents:'none' }}/>
        <PageContent page={frontPage} side={frontSide}/>
        <div ref={shRRef} style={{ position:'absolute', inset:0, background:'linear-gradient(90deg,transparent 40%,rgba(0,0,0,0) 58%,rgba(0,0,0,.18) 80%,rgba(0,0,0,.36) 100%)', opacity:0, pointerEvents:'none', zIndex:2 }}/>
        <div style={{ position:'absolute', top:0, right:0, bottom:0, width:'2px', background:'linear-gradient(90deg,transparent,rgba(255,255,255,.38))', zIndex:3 }}/>
      </div>
      {/* Mặt sau */}
      <div style={{
        position:'absolute', inset:0,
        transform:'rotateY(180deg)',
        backfaceVisibility:'hidden', WebkitBackfaceVisibility:'hidden',
        overflow:'hidden', background: backPage[`${backSide}Bg`] || '#fff',
      }}>
        <div style={{ position:'absolute', inset:0, backgroundImage:'repeating-linear-gradient(180deg,transparent 0,transparent 28px,rgba(127,168,130,.045) 28px,rgba(127,168,130,.045) 29px)', backgroundPosition:'0 3rem', pointerEvents:'none' }}/>
        <PageContent page={backPage} side={backSide}/>
        <div ref={shLRef} style={{ position:'absolute', inset:0, background:'linear-gradient(90deg,rgba(0,0,0,.32) 0%,rgba(0,0,0,.16) 20%,rgba(0,0,0,0) 42%,transparent 60%)', opacity:0, pointerEvents:'none', zIndex:2 }}/>
        <div style={{ position:'absolute', top:0, left:0, bottom:0, width:'2px', background:'linear-gradient(90deg,rgba(255,255,255,.28),transparent)', zIndex:3 }}/>
      </div>
    </div>
  );
}

// ── Progress bar ──
function ProgBar({ running, delay, resetKey }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    el.style.transition = 'none'; el.style.width = '0%';
    void el.offsetWidth;
    if (running) {
      el.style.transition = `width ${delay}ms linear`;
      el.style.width = '100%';
    }
  }, [running, delay, resetKey]);
  return (
    <div style={{ width:'100%', height:'2px', background:'rgba(127,168,130,.1)', borderRadius:'1px', overflow:'hidden' }}>
      <div ref={ref} style={{ height:'100%', background:'linear-gradient(90deg,#4A7C59,#7FA882)', borderRadius:'1px' }}/>
    </div>
  );
}

// ── MAIN ──
export default function StoryBook() {
  const [cur, setCur]       = useState(0);
  const [flipping, setFlip] = useState(false);
  const [flipInfo, setFI]   = useState(null);
  const [bgOver, setBgO]    = useState(null);
  const [autoOn, setAuto]   = useState(true);
  const [progKey, setPK]    = useState(0);
  const autoRef  = useRef(null);
  const touchX   = useRef(0);
  const busyRef  = useRef(false);

  const go = useCallback((next, fromAuto = false) => {
    if (busyRef.current || next === cur || next < 0 || next >= PAGES.length) return;
    if (!fromAuto) { clearTimeout(autoRef.current); setPK(k => k + 1); }
    busyRef.current = true;
    const dir = next > cur ? 'next' : 'prev';
    const fp = PAGES[cur], tp = PAGES[next];
    const fs = dir === 'next' ? 'right' : 'left';
    const bs = dir === 'next' ? 'left'  : 'right';
    setFI({ dir, fp, tp, next, fs, bs });
    setFlip(true);
    setBgO(null);

    // Cập nhật trang nền ở điểm giữa
    setTimeout(() => {
      setBgO({ dir, tp });
    }, 430);

    setTimeout(() => {
      setCur(next);
      setFlip(false);
      setFI(null);
      setBgO(null);
      busyRef.current = false;
      setPK(k => k + 1);
    }, 950);
  }, [cur]);

  // Auto play
  useEffect(() => {
    if (!autoOn || flipping) return;
    autoRef.current = setTimeout(() => {
      const next = cur < PAGES.length - 1 ? cur + 1 : 0;
      go(next, true);
    }, DELAY);
    return () => clearTimeout(autoRef.current);
  }, [autoOn, cur, flipping, go, progKey]);

  const page = PAGES[cur];
  const lBg  = (bgOver?.dir === 'prev' ? bgOver.tp.lBg : null) || page.lBg;
  const rBg  = (bgOver?.dir === 'next' ? bgOver.tp.rBg : null) || page.rBg;
  const lPg  = bgOver?.dir === 'prev' ? bgOver.tp : page;
  const rPg  = bgOver?.dir === 'next' ? bgOver.tp : page;

  const ruled = { position:'absolute', inset:0, pointerEvents:'none', backgroundImage:'repeating-linear-gradient(180deg,transparent 0,transparent 28px,rgba(127,168,130,.045) 28px,rgba(127,168,130,.045) 29px)', backgroundPosition:'0 3rem' };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Jost:wght@300;400&display=swap');
        .sb-nb{width:42px;height:42px;background:transparent;border:1px solid rgba(74,124,89,.2);color:#4A7C59;font-size:1.2rem;cursor:pointer;font-family:serif;display:flex;align-items:center;justify-content:center;transition:all .22s;user-select:none;}
        .sb-nb:hover:not(:disabled){background:rgba(74,124,89,.07);border-color:rgba(74,124,89,.42);}
        .sb-nb:disabled{opacity:.15;cursor:default;}
        .sb-dot{width:6px;height:6px;border-radius:50%;background:rgba(127,168,130,.22);transition:all .28s;cursor:pointer;}
        .sb-dot.on{background:#4A7C59;transform:scale(1.35);}
        .sb-ab{font-family:'Jost',sans-serif;font-weight:300;font-size:9.5px;letter-spacing:.22em;text-transform:uppercase;padding:.3rem .85rem;cursor:pointer;background:transparent;border:1px solid rgba(74,124,89,.2);color:rgba(74,124,89,.6);transition:all .22s;}
        .sb-ab:hover{background:rgba(74,124,89,.06);}
        .sb-ab.on{border-color:rgba(74,124,89,.42);color:#4A7C59;}
      `}</style>

      <section id="story" style={{ background:'#F7F9F6', padding:'clamp(4rem,8vw,6rem) 1.5rem', fontFamily:"'Jost',sans-serif" }}>
        <div style={{ textAlign:'center', marginBottom:'2.5rem' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:'.8rem', marginBottom:'1rem' }}>
            <div style={{ width:'28px', height:'1px', background:'linear-gradient(90deg,transparent,#7FA882)' }}/>
            <span style={{ fontFamily:"'Jost',sans-serif", fontWeight:300, fontSize:'.6rem', letterSpacing:'.4em', textTransform:'uppercase', color:'#4A7C59' }}>Hành trình của chúng tôi</span>
            <div style={{ width:'28px', height:'1px', background:'linear-gradient(90deg,#7FA882,transparent)' }}/>
          </div>
          <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:'italic', fontWeight:300, fontSize:'clamp(2rem,7vw,3.2rem)', color:'#1A3A28', lineHeight:1.15, margin:0 }}>
            Cuốn Sổ Tình Yêu
          </h2>
        </div>

        <div style={{ maxWidth:'680px', margin:'0 auto', display:'flex', flexDirection:'column', gap:'1rem' }}>
          {/* Book */}
          <div
            style={{ perspective:'2200px', perspectiveOrigin:'50% 38%', width:'100%', height:'clamp(270px,46vw,400px)', position:'relative', filter:'drop-shadow(0 18px 36px rgba(26,58,40,.18))', cursor:'pointer' }}
            onClick={() => { setAuto(a => { if (!a) { setPK(k=>k+1); } return !a; }); clearTimeout(autoRef.current); }}
            onTouchStart={e => { touchX.current = e.touches[0].clientX; }}
            onTouchEnd={e => {
              const dx = touchX.current - e.changedTouches[0].clientX;
              if (Math.abs(dx) > 36) { e.stopPropagation(); dx > 0 ? go(cur+1) : go(cur-1); }
            }}
          >
            {/* Gáy */}
            <div style={{ position:'absolute', left:'-11px', top:'4%', bottom:'4%', width:'22px', background:'linear-gradient(90deg,#0a1810,#1a3828,#0d2018)', borderRadius:'3px 0 0 3px', boxShadow:'-3px 0 12px rgba(0,0,0,.5)', zIndex:8 }}>
              <div style={{ position:'absolute', top:0, right:0, bottom:0, width:'4px', background:'linear-gradient(90deg,transparent,rgba(127,168,130,.12))' }}/>
            </div>

            {/* Spread */}
            <div style={{ position:'absolute', inset:0, display:'grid', gridTemplateColumns:'1fr 1fr', borderRadius:'0 5px 5px 0', overflow:'hidden', boxShadow:'2px 0 20px rgba(0,0,0,.1)' }}>
              <div style={{ background:lBg, borderRight:'1px solid rgba(127,168,130,.1)', position:'relative', overflow:'hidden' }}>
                <div style={ruled}/>
                <PageContent page={lPg} side="left"/>
              </div>
              <div style={{ background:rBg, position:'relative', overflow:'hidden' }}>
                <div style={ruled}/>
                <PageContent page={rPg} side="right"/>
              </div>
            </div>

            {/* Flip */}
            <FlipLayer
              state={flipping}
              dir={flipInfo?.dir}
              frontPage={flipInfo?.fp || page}
              frontSide={flipInfo?.fs || 'right'}
              backPage={flipInfo?.tp || page}
              backSide={flipInfo?.bs || 'left'}
            />
          </div>

          <ProgBar running={autoOn && !flipping} delay={DELAY} resetKey={progKey}/>

          {/* Nav */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 .2rem' }}>
            <button className="sb-nb" onClick={e => { e.stopPropagation(); go(cur-1); }} disabled={cur===0||flipping}>‹</button>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'8px' }}>
              <div style={{ display:'flex', gap:'6px' }}>
                {PAGES.map((_,i) => <div key={i} className={`sb-dot${i===cur?' on':''}`} onClick={e => { e.stopPropagation(); go(i); }}/>)}
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:'.7rem' }}>
                <span style={{ fontFamily:"'Jost',sans-serif", fontWeight:300, fontSize:'9.5px', letterSpacing:'.2em', textTransform:'uppercase', color:'rgba(127,168,130,.55)' }}>{page.label}</span>
                <button className={`sb-ab${autoOn?' on':''}`} onClick={e => { e.stopPropagation(); setAuto(a => !a); clearTimeout(autoRef.current); setPK(k=>k+1); }}>
                  {autoOn ? '⏸ Tự động' : '▶ Tự động'}
                </button>
              </div>
            </div>
            <button className="sb-nb" onClick={e => { e.stopPropagation(); go(cur+1); }} disabled={cur===PAGES.length-1||flipping}>›</button>
          </div>
          <p style={{ textAlign:'center', fontFamily:"'Jost',sans-serif", fontWeight:300, fontSize:'9px', letterSpacing:'.18em', color:'rgba(127,168,130,.38)' }}>
            Click vào sổ để tạm dừng · Vuốt trái/phải trên mobile
          </p>
        </div>
      </section>
    </>
  );
}
