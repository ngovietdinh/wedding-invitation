// ============================================================
// STORY BOOK — Lật trang với độ cong + tự động + tay
// Thay StoryTimeline trong App.jsx
// AUTO: 5 giây/trang — có progress bar
// ============================================================

import { useState, useEffect, useRef, useCallback } from "react";

const AUTO_DELAY = 5000;

const PAGES = [
  {
    id:0, label:'Bìa sổ',
    lBg:'linear-gradient(145deg,#132318,#1a3a28)',
    rBg:'linear-gradient(145deg,#1a3a28,#2d5a3d)',
    left:'cover-l', right:'cover-r',
  },
  {
    id:1, label:'Chương 01 — 02',
    lBg:'linear-gradient(135deg,#ffffff,#f8fbf8)',
    rBg:'linear-gradient(135deg,#f5f9f5,#eef5ee)',
    left: {ch:'Chương 01',sea:'Mùa Thu · 2019',yr:'2019',ic:'✦',ti:'Lần đầu gặp nhau',st:'Không ai trong chúng tôi nghĩ đó là điểm khởi đầu. Chỉ là một buổi chiều bình thường — cho đến khi nhìn lại, mới thấy đó là khoảnh khắc mọi thứ bắt đầu.',nm:'01'},
    right:{ch:'Chương 02',sea:'Mùa Đông · 2020',yr:'2020',ic:'◇',ti:'Những tin nhắn lúc nửa đêm',st:'Thế giới bỗng dưng chậm lại. Và trong khoảng lặng yên đó, hai người tìm thấy nhau nhiều hơn — qua những câu chuyện nhỏ và tiếng cười không lý do.',nm:'02',mir:true},
  },
  {
    id:2, label:'Chương 03 — 04',
    lBg:'linear-gradient(135deg,#f8fbf8,#f0f7f0)',
    rBg:'linear-gradient(135deg,#f0f7f0,#e8f2e8)',
    left: {ch:'Chương 03',sea:'Mùa Hè · 2022',yr:'2022',ic:'○',ti:'Chuyến đi làm thay đổi tất cả',st:'Đà Nẵng, 5 giờ sáng, ngồi bên bờ biển không nói gì. Có những khoảnh khắc không cần lời — từ đây sẽ không đi một mình nữa.',nm:'03'},
    right:{ch:'Chương 04',sea:'Mùa Xuân · 2024',yr:'2024',ic:'◈',ti:'Anh hỏi. Em gật đầu.',st:'Không có đám đông, không có ánh đèn sân khấu. Chỉ có một câu hỏi chân thành và câu trả lời đã được biết từ trước — bằng trái tim.',nm:'04',mir:true},
  },
  {
    id:3, label:'Chương Cuối',
    lBg:'linear-gradient(145deg,#1a3a28,#2d5a3d)',
    rBg:'linear-gradient(145deg,#2d5a3d,#1a3a28)',
    left: {ch:'Chương Cuối',sea:'26 · 04 · 2026',yr:'2026',ic:'❋',ti:'Ngày chúng ta bắt đầu',st:'Và giờ đây, chúng tôi mời bạn — những người đã là một phần của hành trình — cùng chứng kiến chương tiếp theo.',nm:'05',dark:true},
    right:'end',
  },
];

// ── Trang chương ──
function ChapterPage({ d }) {
  const dark = d.dark;
  const mir  = d.mir;
  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', justifyContent:'space-between', padding:'clamp(0.9rem,3.5vw,1.8rem)', position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', top:0, [mir?'right':'left']:0, bottom:0, width:'3px', background:`linear-gradient(180deg,transparent,${dark?'rgba(127,168,130,0.32)':'rgba(127,168,130,0.16)'},transparent)` }}/>
      <div style={{ position:'absolute', bottom:'0.9rem', [mir?'left':'right']:'1rem', fontFamily:"'DM Sans',sans-serif", fontWeight:200, fontSize:'10px', color: dark?'rgba(127,168,130,0.32)':'rgba(127,168,130,0.22)', letterSpacing:'0.12em' }}>— {d.nm} —</div>
      <div style={{ display:'flex', flexDirection:'column', gap:'0.32rem' }}>
        <span style={{ display:'inline-block', padding:'2px 9px', fontFamily:"'DM Sans',sans-serif", fontWeight:300, fontSize:'9px', letterSpacing:'0.26em', textTransform:'uppercase', background: dark?'rgba(127,168,130,0.18)':'#E8F0E8', color: dark?'rgba(184,204,186,0.82)':'#4A7C59', alignSelf:'flex-start' }}>{d.ch}</span>
        <p style={{ fontFamily:"'DM Sans',sans-serif", fontWeight:200, fontSize:'9px', letterSpacing:'0.2em', textTransform:'uppercase', color: dark?'rgba(184,204,186,0.68)':'#5A7A62', margin:'0.08rem 0' }}>{d.sea}</p>
        <p style={{ fontFamily:"'Playfair Display',serif", fontWeight:400, fontSize:'clamp(1.8rem,5.5vw,2.8rem)', color: dark?'rgba(127,168,130,0.16)':'rgba(127,168,130,0.13)', lineHeight:1, margin:0, letterSpacing:'-0.02em' }}>{d.yr}</p>
        <p style={{ fontSize:'0.85rem', color: dark?'rgba(127,168,130,0.55)':'#7FA882', margin:'-0.28rem 0' }}>{d.ic}</p>
        <h3 style={{ fontFamily:"'Playfair Display',serif", fontStyle:'italic', fontWeight:400, fontSize:'clamp(0.8rem,2.3vw,1.05rem)', color: dark?'rgba(232,240,232,0.95)':'#1A3A28', lineHeight:1.3, margin:0 }}>{d.ti}</h3>
      </div>
      <p style={{ fontFamily:"'DM Sans',sans-serif", fontWeight:200, fontSize:'clamp(0.6rem,1.6vw,0.74rem)', color: dark?'rgba(184,204,186,0.68)':'#5A7A62', lineHeight:1.9, margin:0 }}>{d.st}</p>
    </div>
  );
}

function CoverLeft() {
  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'0.6rem', padding:'1.4rem', textAlign:'center', background:'linear-gradient(145deg,#132318,#1a3a28)', position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', inset:0, backgroundImage:'repeating-linear-gradient(45deg,transparent 0,transparent 18px,rgba(127,168,130,0.04) 18px,rgba(127,168,130,0.04) 19px)' }}/>
      <div style={{ position:'absolute', top:10, left:10, right:10, bottom:10, border:'1px solid rgba(127,168,130,0.18)', pointerEvents:'none' }}/>
      <svg viewBox="0 0 56 56" style={{ width:'38px', opacity:0.5, position:'relative', zIndex:1 }}>
        <circle cx="28" cy="28" r="25" stroke="rgba(127,168,130,0.4)" strokeWidth="1" fill="none"/>
        <path d="M13 28 Q28 12 43 28 Q28 44 13 28Z" fill="rgba(127,168,130,0.22)"/>
        <circle cx="28" cy="28" r="4.5" fill="rgba(127,168,130,0.5)"/>
      </svg>
      <p style={{ fontFamily:"'DM Sans',sans-serif", fontWeight:200, fontSize:'9px', letterSpacing:'0.4em', textTransform:'uppercase', color:'rgba(127,168,130,0.6)', position:'relative', zIndex:1 }}>Câu chuyện của</p>
      <p style={{ fontFamily:"'Playfair Display',serif", fontStyle:'italic', fontSize:'clamp(1.1rem,3.2vw,1.5rem)', color:'rgba(232,240,232,0.95)', lineHeight:1.2, position:'relative', zIndex:1, margin:0 }}>Bảo Ngân<br/>&amp; Viết Định</p>
      <div style={{ width:'32px', height:'1px', background:'rgba(127,168,130,0.35)', position:'relative', zIndex:1 }}/>
      <p style={{ fontFamily:"'DM Sans',sans-serif", fontWeight:200, fontSize:'9px', letterSpacing:'0.3em', color:'rgba(127,168,130,0.45)', position:'relative', zIndex:1, margin:0 }}>2019 — 2026</p>
    </div>
  );
}

function CoverRight() {
  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'linear-gradient(145deg,#1a3a28,#2d5a3d)', position:'relative', overflow:'hidden', gap:'0.5rem', padding:'1rem' }}>
      <div style={{ position:'absolute', inset:0, backgroundImage:'repeating-linear-gradient(45deg,transparent 0,transparent 18px,rgba(127,168,130,0.04) 18px,rgba(127,168,130,0.04) 19px)' }}/>
      <div style={{ position:'absolute', top:10, left:10, right:10, bottom:10, border:'1px solid rgba(127,168,130,0.18)', pointerEvents:'none' }}/>
      <svg viewBox="0 0 120 155" style={{ width:'min(62%,145px)', height:'auto', position:'relative', zIndex:1 }}>
        <path d="M32 98 Q18 128 12 152 L55 152 Q50 128 48 98Z" fill="rgba(255,255,255,0.88)"/>
        <path d="M48 98 Q52 126 55 152 L68 152 Q58 123 52 93Z" fill="rgba(255,255,255,0.52)"/>
        <path d="M34 66 Q30 78 32 98 L52 98 Q50 80 46 66Z" fill="rgba(255,255,255,0.92)"/>
        <path d="M34 66 Q27 73 25 84" stroke="rgba(255,255,255,0.88)" strokeWidth="5" strokeLinecap="round" fill="none"/>
        <path d="M46 65 Q52 72 54 82" stroke="rgba(255,255,255,0.75)" strokeWidth="4" strokeLinecap="round" fill="none"/>
        <circle cx="40" cy="52" r="12" fill="#f5e0cc"/>
        <path d="M28 50 Q30 40 40 38 Q50 40 52 50" fill="#3d2b1f" opacity="0.88"/>
        <path d="M28 42 Q40 35 52 42 L54 38 Q40 31 26 38Z" fill="rgba(255,255,255,0.52)"/>
        <ellipse cx="35" cy="54" rx="1.5" ry="2" fill="#3d2b1f" opacity="0.65"/>
        <ellipse cx="45" cy="54" rx="1.5" ry="2" fill="#3d2b1f" opacity="0.65"/>
        <path d="M37 60 Q40 63 43 60" stroke="#c47a7a" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
        <circle cx="24" cy="100" r="8" fill="rgba(255,255,255,0.32)"/>
        <circle cx="21" cy="97" r="3.5" fill="white" opacity="0.8"/>
        <circle cx="27" cy="97" r="3.5" fill="rgba(220,240,220,0.85)"/>
        <circle cx="24" cy="104" r="3.5" fill="white" opacity="0.7"/>
        <path d="M65 103 L58 152 L70 152 L72 128Z" fill="#2d3748" opacity="0.85"/>
        <path d="M87 103 L94 152 L82 152 L80 128Z" fill="#2d3748" opacity="0.85"/>
        <path d="M58 68 Q55 86 56 103 L96 103 Q97 86 94 68Z" fill="#4a5568" opacity="0.88"/>
        <path d="M74 68 L77 82 L82 68" fill="rgba(255,255,255,0.9)"/>
        <path d="M75 70 L77 74 L79 70 L77 77Z" fill="#1a202c"/>
        <path d="M56 70 Q47 86 45 100" stroke="#4a5568" strokeWidth="7" strokeLinecap="round" fill="none"/>
        <path d="M96 70 Q105 86 107 100" stroke="#4a5568" strokeWidth="7" strokeLinecap="round" fill="none"/>
        <path d="M45 100 Q43 107 43 112" stroke="rgba(255,255,255,0.88)" strokeWidth="5" strokeLinecap="round" fill="none"/>
        <path d="M107 100 Q109 107 109 112" stroke="rgba(255,255,255,0.88)" strokeWidth="5" strokeLinecap="round" fill="none"/>
        <circle cx="76" cy="54" r="14" fill="#f0d5b5"/>
        <path d="M62 50 Q64 38 76 36 Q88 38 90 50" fill="#2d1f0f" opacity="0.88"/>
        <rect x="66" y="54" width="8" height="6" rx="2.5" stroke="#4a3728" strokeWidth="1" fill="rgba(200,225,255,0.18)"/>
        <rect x="78" y="54" width="8" height="6" rx="2.5" stroke="#4a3728" strokeWidth="1" fill="rgba(200,225,255,0.18)"/>
        <path d="M74 57 L78 57" stroke="#4a3728" strokeWidth="0.8" fill="none"/>
        <path d="M72 61 Q76 65 80 61" stroke="#c47a7a" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
        <path d="M54 112 Q62 116 65 114" stroke="rgba(255,255,255,0.28)" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      </svg>
      <p style={{ fontFamily:"'Playfair Display',serif", fontStyle:'italic', fontSize:'clamp(0.65rem,1.8vw,0.85rem)', color:'rgba(255,255,255,0.55)', position:'relative', zIndex:1, margin:0 }}>Lật trang để bắt đầu ›</p>
    </div>
  );
}

function EndPage() {
  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'0.8rem', padding:'1.5rem', textAlign:'center', background:'linear-gradient(145deg,#2d5a3d,#1a3a28)', position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', inset:0, backgroundImage:'repeating-linear-gradient(45deg,transparent 0,transparent 18px,rgba(127,168,130,0.04) 18px,rgba(127,168,130,0.04) 19px)' }}/>
      <p style={{ fontSize:'18px', opacity:0.45, position:'relative', zIndex:1 }}>❋</p>
      <p style={{ fontFamily:"'Playfair Display',serif", fontStyle:'italic', fontSize:'clamp(0.82rem,2.4vw,1rem)', color:'rgba(232,240,232,0.88)', lineHeight:1.7, maxWidth:'85%', position:'relative', zIndex:1 }}>
        "Hai người, một hành trình —<br/>chúng tôi muốn bắt đầu<br/>cùng sự hiện diện của bạn."
      </p>
      <div style={{ width:'32px', height:'1px', background:'rgba(127,168,130,0.35)', position:'relative', zIndex:1 }}/>
      <p style={{ fontFamily:"'Playfair Display',serif", fontStyle:'italic', fontSize:'clamp(0.78rem,2vw,0.92rem)', color:'rgba(127,168,130,0.82)', position:'relative', zIndex:1, margin:0 }}>Bảo Ngân &amp; Viết Định</p>
      <p style={{ fontFamily:"'DM Sans',sans-serif", fontWeight:200, fontSize:'9px', letterSpacing:'0.3em', color:'rgba(127,168,130,0.48)', textTransform:'uppercase', position:'relative', zIndex:1, margin:0 }}>26 · 04 · 2026 · Huế</p>
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

// ── Flip layer với độ cong ──
function FlipLayer({ visible, dir, frontPage, frontSide, backPage, backSide, onMid }) {
  const ref = useRef(null);
  const [phase, setPhase] = useState(0); // 0=idle,1=to90,2=to180

  useEffect(() => {
    if (!visible) { setPhase(0); return; }
    setPhase(0);
    const t1 = setTimeout(() => setPhase(1), 20);
    const t2 = setTimeout(() => { onMid?.(); setPhase(2); }, 480);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [visible]);

  if (!visible) return null;

  const origin = dir === 'next' ? 'left center' : 'right center';
  const angle1 = dir === 'next' ? -90 : 90;
  const angle2 = dir === 'next' ? -180 : 180;

  const transform = phase === 0 ? 'rotateY(0deg) scaleX(1)'
    : phase === 1 ? `rotateY(${angle1}deg) scaleX(0.9)`
    : `rotateY(${angle2}deg) scaleX(1)`;

  const transition = phase === 0 ? 'none'
    : phase === 1 ? 'transform 0.46s cubic-bezier(0.4,0,0.6,1)'
    : 'transform 0.44s cubic-bezier(0.2,0.8,0.35,1)';

  const pos = dir === 'next'
    ? { position:'absolute', top:0, right:0, bottom:0, width:'50%' }
    : { position:'absolute', top:0, left:0,  bottom:0, width:'50%' };

  return (
    <div style={{
      ...pos,
      transformOrigin: origin,
      transformStyle:'preserve-3d',
      transform, transition,
      zIndex:20, pointerEvents:'none',
    }}>
      {/* Mặt trước */}
      <div style={{
        position:'absolute', inset:0,
        backfaceVisibility:'hidden', WebkitBackfaceVisibility:'hidden',
        overflow:'hidden',
        background: frontPage[`${frontSide}Bg`] || '#fff',
      }}>
        <div style={{ position:'absolute', inset:0, backgroundImage:'repeating-linear-gradient(180deg,transparent 0px,transparent 27px,rgba(127,168,130,0.05) 27px,rgba(127,168,130,0.05) 28px)', backgroundPosition:'0 2.5rem' }}/>
        <PageContent page={frontPage} side={frontSide}/>
        {/* Bóng mép tạo cảm giác cong */}
        <div style={{ position:'absolute', inset:0, background: dir==='next' ? 'linear-gradient(90deg,rgba(0,0,0,0.0) 50%,rgba(0,0,0,0.22) 85%,rgba(0,0,0,0.32) 100%)' : 'linear-gradient(90deg,rgba(0,0,0,0.32) 0%,rgba(0,0,0,0.18) 15%,rgba(0,0,0,0) 50%)', opacity: phase===1?1:0, transition:'opacity 0.3s' }}/>
        <div style={{ position:'absolute', top:0, [dir==='next'?'right':'left']:0, bottom:0, width:'2px', background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.3))' }}/>
      </div>
      {/* Mặt sau */}
      <div style={{
        position:'absolute', inset:0,
        transform:'rotateY(180deg)',
        backfaceVisibility:'hidden', WebkitBackfaceVisibility:'hidden',
        overflow:'hidden',
        background: backPage[`${backSide}Bg`] || '#fff',
      }}>
        <div style={{ position:'absolute', inset:0, backgroundImage:'repeating-linear-gradient(180deg,transparent 0px,transparent 27px,rgba(127,168,130,0.05) 27px,rgba(127,168,130,0.05) 28px)', backgroundPosition:'0 2.5rem' }}/>
        <PageContent page={backPage} side={backSide}/>
        <div style={{ position:'absolute', inset:0, background: dir==='next' ? 'linear-gradient(90deg,rgba(0,0,0,0.18) 0%,rgba(0,0,0,0.04) 30%,transparent 60%)' : 'linear-gradient(90deg,transparent 40%,rgba(0,0,0,0.04) 70%,rgba(0,0,0,0.18) 100%)', opacity: phase===1?1:0, transition:'opacity 0.3s' }}/>
      </div>
    </div>
  );
}

// ── Progress bar ──
function ProgressBar({ running, duration }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    el.style.transition = 'none';
    el.style.width = '0%';
    void el.offsetWidth;
    if (running) {
      el.style.transition = `width ${duration}ms linear`;
      el.style.width = '100%';
    }
  }, [running, duration]);
  return (
    <div style={{ width:'100%', height:'2px', background:'rgba(127,168,130,0.12)', borderRadius:'1px', overflow:'hidden' }}>
      <div ref={ref} style={{ height:'100%', background:'linear-gradient(90deg,#4A7C59,#7FA882)', borderRadius:'1px', width:'0%' }}/>
    </div>
  );
}

export default function StoryBook() {
  const [cur, setCur]         = useState(0);
  const [flipping, setFlip]   = useState(false);
  const [flipData, setFD]     = useState(null);
  const [midDone, setMid]     = useState(false);
  const [autoPlay, setAuto]   = useState(true);
  const [progKey, setProgKey] = useState(0);
  const autoRef  = useRef(null);
  const touchX   = useRef(0);

  const go = useCallback((next, fromAuto=false) => {
    if (flipping || next === cur || next < 0 || next >= PAGES.length) return;
    if (!fromAuto) {
      clearTimeout(autoRef.current);
      setProgKey(k => k+1);
    }
    const dir = next > cur ? 'next' : 'prev';
    const fromP = PAGES[cur];
    const toP   = PAGES[next];
    setFD({ dir, fromP, toP, next,
      frontSide: dir==='next' ? 'right' : 'left',
      backSide:  dir==='next' ? 'left'  : 'right',
    });
    setMid(false);
    setFlip(true);
  }, [cur, flipping]);

  // Khi flip xong (mid) — cập nhật trang nền
  const [bgOverride, setBgOverride] = useState(null);
  const handleMid = useCallback(() => {
    setMid(true);
    if (!flipData) return;
    setBgOverride({ dir: flipData.dir, toP: flipData.toP });
  }, [flipData]);

  useEffect(() => {
    if (!flipping) return;
    const t = setTimeout(() => {
      if (flipData) setCur(flipData.next);
      setFlip(false);
      setFD(null);
      setMid(false);
      setBgOverride(null);
      setProgKey(k => k+1);
    }, 950);
    return () => clearTimeout(t);
  }, [flipping]);

  // Auto play
  useEffect(() => {
    if (!autoPlay || flipping) return;
    autoRef.current = setTimeout(() => {
      const next = cur < PAGES.length-1 ? cur+1 : 0;
      go(next, true);
    }, AUTO_DELAY);
    return () => clearTimeout(autoRef.current);
  }, [autoPlay, cur, flipping, go, progKey]);

  const page  = PAGES[cur];
  const lBg   = (bgOverride?.dir==='prev' ? bgOverride.toP.lBg : null) || page.lBg;
  const rBg   = (bgOverride?.dir==='next' ? bgOverride.toP.rBg : null) || page.rBg;
  const lPage = (bgOverride?.dir==='prev' && midDone) ? bgOverride.toP : page;
  const rPage = (bgOverride?.dir==='next' && midDone) ? bgOverride.toP : page;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;1,400&family=DM+Sans:wght@200;300;400&display=swap');
        .sb-nb{width:42px;height:42px;background:transparent;border:1px solid rgba(74,124,89,0.22);color:#4A7C59;font-size:1.2rem;cursor:pointer;font-family:serif;display:flex;align-items:center;justify-content:center;transition:all 0.2s;}
        .sb-nb:hover:not(:disabled){background:rgba(74,124,89,0.08);border-color:rgba(74,124,89,0.45);}
        .sb-nb:disabled{opacity:0.18;cursor:default;}
        .sb-dot{width:7px;height:7px;border-radius:50%;background:rgba(127,168,130,0.22);transition:all 0.3s;cursor:pointer;}
        .sb-dot.on{background:#4A7C59;transform:scale(1.28);}
        .sb-auto{font-family:'DM Sans',sans-serif;font-weight:300;font-size:10px;letter-spacing:0.22em;text-transform:uppercase;padding:0.32rem 0.85rem;cursor:pointer;background:transparent;border:1px solid rgba(74,124,89,0.22);color:rgba(74,124,89,0.65);transition:all 0.2s;}
        .sb-auto:hover{background:rgba(74,124,89,0.06);}
        .sb-auto.on{border-color:rgba(74,124,89,0.45);color:#4A7C59;}
        .ruled-bg{position:absolute;inset:0;background-image:repeating-linear-gradient(180deg,transparent 0px,transparent 27px,rgba(127,168,130,0.05) 27px,rgba(127,168,130,0.05) 28px);background-position:0 2.5rem;pointer-events:none;}
      `}</style>

      <section id="story" style={{ background:'#F7F9F6', padding:'clamp(4rem,8vw,6rem) 1.5rem', fontFamily:"'DM Sans',sans-serif" }}>
        {/* Header */}
        <div style={{ textAlign:'center', marginBottom:'2.5rem' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:'0.8rem', marginBottom:'1rem' }}>
            <div style={{ width:'28px', height:'1px', background:'linear-gradient(90deg,transparent,#7FA882)' }}/>
            <span style={{ fontFamily:"'DM Sans',sans-serif", fontWeight:300, fontSize:'0.6rem', letterSpacing:'0.4em', textTransform:'uppercase', color:'#4A7C59' }}>Hành trình của chúng tôi</span>
            <div style={{ width:'28px', height:'1px', background:'linear-gradient(90deg,#7FA882,transparent)' }}/>
          </div>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontStyle:'italic', fontWeight:400, fontSize:'clamp(2rem,7vw,3.2rem)', color:'#1A3A28', lineHeight:1.15, margin:0 }}>
            Cuốn Sổ Tình Yêu
          </h2>
        </div>

        <div style={{ maxWidth:'700px', margin:'0 auto', display:'flex', flexDirection:'column', gap:'1.2rem' }}>
          {/* Book */}
          <div style={{ perspective:'2000px', perspectiveOrigin:'50% 42%', width:'100%', height:'clamp(280px,48vw,420px)', position:'relative', filter:'drop-shadow(0 20px 40px rgba(26,58,40,0.2))' }}
            onTouchStart={e => { touchX.current = e.touches[0].clientX; }}
            onTouchEnd={e => {
              const dx = touchX.current - e.changedTouches[0].clientX;
              if (Math.abs(dx) > 38) dx > 0 ? go(cur+1) : go(cur-1);
            }}
          >
            {/* Gáy */}
            <div style={{ position:'absolute', left:'-12px', top:'3%', bottom:'3%', width:'24px', background:'linear-gradient(90deg,#0a1a10,#1a3a28,#0a1a10)', borderRadius:'4px 0 0 4px', boxShadow:'-4px 0 14px rgba(0,0,0,0.45)', zIndex:6 }}>
              {[0,1,2].map(i=><div key={i} style={{ position:'absolute', top:`${25+i*25}%`, left:'15%', right:'15%', height:'1px', background:'rgba(127,168,130,0.18)' }}/>)}
            </div>

            {/* Spread */}
            <div style={{ position:'absolute', inset:0, display:'grid', gridTemplateColumns:'1fr 1fr', borderRadius:'0 6px 6px 0', overflow:'hidden' }}>
              <div style={{ background:lBg, borderRight:'1px solid rgba(127,168,130,0.1)', position:'relative', overflow:'hidden' }}>
                <div className="ruled-bg"/>
                <PageContent page={lPage} side="left"/>
              </div>
              <div style={{ background:rBg, position:'relative', overflow:'hidden' }}>
                <div className="ruled-bg"/>
                <PageContent page={rPage} side="right"/>
              </div>
            </div>

            {/* Flip */}
            <FlipLayer
              visible={flipping}
              dir={flipData?.dir}
              frontPage={flipData?.fromP || page}
              frontSide={flipData?.frontSide || 'right'}
              backPage={flipData?.toP || page}
              backSide={flipData?.backSide || 'left'}
              onMid={handleMid}
            />
          </div>

          {/* Progress bar */}
          <ProgressBar key={progKey} running={autoPlay && !flipping} duration={AUTO_DELAY}/>

          {/* Nav */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 0.2rem' }}>
            <button className="sb-nb" onClick={()=>go(cur-1)} disabled={cur===0||flipping}>‹</button>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'8px' }}>
              <div style={{ display:'flex', gap:'6px' }}>
                {PAGES.map((_,i)=>(
                  <div key={i} className={`sb-dot${i===cur?' on':''}`} onClick={()=>go(i)}/>
                ))}
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:'0.7rem' }}>
                <span style={{ fontFamily:"'DM Sans',sans-serif", fontWeight:200, fontSize:'10px', letterSpacing:'0.22em', textTransform:'uppercase', color:'rgba(127,168,130,0.58)' }}>
                  {page.label}
                </span>
                <button className={`sb-auto${autoPlay?' on':''}`}
                  onClick={()=>{ setAuto(a=>!a); setProgKey(k=>k+1); }}>
                  {autoPlay ? '⏸ Tự động' : '▶ Tự động'}
                </button>
              </div>
            </div>
            <button className="sb-nb" onClick={()=>go(cur+1)} disabled={cur===PAGES.length-1||flipping}>›</button>
          </div>
        </div>
      </section>
    </>
  );
}