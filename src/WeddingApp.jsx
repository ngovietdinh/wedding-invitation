import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

const SB_URL = import.meta.env.VITE_SUPABASE_URL;
const SB_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const sb = SB_URL && SB_KEY ? createClient(SB_URL, SB_KEY) : null;

// ── Google Drive → direct image URL ──
function gd(url) {
  if (!url || !url.trim()) return "";
  const m = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);
  return m ? `https://lh3.googleusercontent.com/d/${m[1]}` : url;
}
// ── YouTube video ID ──
function ytId(url) {
  if (!url) return "";
  const m = url.match(/youtu\.be\/([^?&]+)/) || url.match(/[?&]v=([^&]+)/);
  return m ? m[1] : "";
}

// ── Default data ──
const DEF = {
  bride:"Bảo Ngân", groom:"Viết Định",
  wedding_date:"26.04.2026", wedding_day:"Thứ Hai",
  wedding_time:"10:00 SA",
  lunar_date:"Ngày 09 tháng 03 năm Bính Ngọ",
  venue_name:"Nhà hàng tiệc cưới",
  venue_address:"123 Đường ABC, Phường XYZ, TP. Huế",
  venue_map_url:"https://maps.google.com",
  parent_groom_label:"Nhà Trai",
  parent_groom_names:"Ông : Nguyễn Văn A\nBà : Trần Thị B",
  parent_groom_addr:"Phường ABC, TP. Huế",
  parent_bride_label:"Nhà Gái",
  parent_bride_names:"Ông : Lê Văn C\nBà : Phạm Thị D",
  parent_bride_addr:"Phường XYZ, TP. Huế",
  ceremony1_label:"Lễ Gia Tiên Nhà Trai", ceremony1_time:"07:30 SA",
  ceremony1_date:"27 . 04 . 2026", ceremony1_lunar:"10/03 Âm lịch",
  ceremony1_place:"Tại tư gia", ceremony1_addr:"Phường ABC, TP. Huế",
  ceremony2_label:"Lễ Cưới", ceremony2_time:"10:00 SA",
  ceremony2_date:"26 . 04 . 2026", ceremony2_lunar:"09/03 Âm lịch",
  ceremony2_place:"Tại nhà hàng", ceremony2_addr:"Phường XYZ, TP. Huế",
  sec_invite_title:"Thư Mời",
  sec_invite_sub:"THAM DỰ LỄ THÀNH HÔN CÙNG GIA ĐÌNH CHÚNG TÔI",
  sec_invite_body:"Chúng tôi trân trọng kính mời Quý gia đình, anh chị em và các bạn đến dự buổi tiệc mừng hôn lễ của chúng tôi. Sự hiện diện của quý vị là niềm hạnh phúc lớn nhất đối với gia đình chúng tôi.",
  sec_cal_title:"Thư Mời",
  sec_cal_sub:"THAM DỰ TIỆC MỪNG CÙNG GIA ĐÌNH CHÚNG TÔI",
  mong_text:"Rất mong được mọi người\nchung vui trong ngày hạnh phúc này",
  quote1:"Anh về hái lấy buồng cau\nTrầu têm cánh phượng đội đầu mang sang\nAnh về thưa với họ hàng\nBốn bên hai họ anh sang rước nàng",
  quote2:"Có lẽ thế gian này có vô vàn điều tươi đẹp,\nNhưng trong lòng em,\nđẹp nhất vẫn chỉ có anh",
  quote3:"Khoảnh khắc gặp được em,\nAnh đã quyết định\nsẽ cùng em đi đến hết cuộc đời.",
  quote4:"Hôn nhân là chuyện cả đời\nYêu người vừa ý — Cưới người mình thương",
  quote5:"With love ♥",
  qr_groom_bank:"Vietcombank", qr_groom_num:"0123 456 789",
  qr_groom_name:"NGUYEN VIET DINH", qr_groom_img:"",
  qr_bride_bank:"Vietcombank", qr_bride_num:"9876 543 210",
  qr_bride_name:"TRAN BAO NGAN", qr_bride_img:"",
  hero_img:"", couple_img:"", photo_large:"",
  photo_sm1:"", photo_sm2:"", photo_wide1:"",
  photo_wide2:"", photo_pair1:"", photo_pair2:"", photo_full:"",
  music_youtube:"", gallery:[],
};

// ══════════════════════════════════════════════
// GLOBAL CSS
// ══════════════════════════════════════════════
const GS = () => (
  <style>{`
@import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Cinzel:wght@400;600&family=Dancing+Script:wght@500;700&display=swap');

*{box-sizing:border-box;margin:0;padding:0;}

body{
  background:#c0d4c0;
  display:flex;justify-content:center;align-items:flex-start;
  min-height:100vh;padding:3vh 0;
  font-family:'Quicksand',sans-serif;
  -webkit-font-smoothing:antialiased;
  -webkit-tap-highlight-color:transparent;
}

/* ── WRAPPER ── */
#pw{
  width:451px;
  position:relative;
  background:#fff;
  border:1px solid #a0c0a0;
  box-shadow:0 0 50px rgba(20,50,20,.25);
  border-radius:3px;
  overflow:hidden;
  overflow-y:auto;
  max-height:94vh;
}
/* Hide scrollbar nhưng vẫn scroll được */
#pw::-webkit-scrollbar{width:0px;}
#pw{-ms-overflow-style:none;scrollbar-width:none;}

/* ── AUDIO ── */
#aud{
  position:fixed;
  right:calc(50% - 225px + 8px);
  top:calc(3vh + 8px);
  z-index:9999;
  width:34px;height:34px;
  background:rgba(44,80,44,.25);
  border-radius:50%;
  display:flex;align-items:center;justify-content:center;
  cursor:pointer;
  animation:rotBtn 5s linear infinite;
  border:1.5px solid rgba(92,130,92,.5);
  backdrop-filter:blur(6px);
}
#aud.paused{animation-play-state:paused;}
@keyframes rotBtn{to{transform:rotate(360deg);}}

/* ── SCROLL HINT ── */
#sh{
  position:fixed;bottom:calc(3vh+10px);left:50%;
  animation:shB 2.4s ease-in-out infinite;
  pointer-events:none;z-index:998;
  display:flex;flex-direction:column;align-items:center;gap:4px;
  opacity:1;transition:opacity .9s;
}
#sh.gone{opacity:0;}
.sh-t{font-size:8px;letter-spacing:.35em;text-transform:uppercase;color:rgba(92,130,92,.75);font-family:'Quicksand',sans-serif;}
.sh-m{width:19px;height:27px;border:1.5px solid rgba(92,130,92,.55);border-radius:9px;display:flex;justify-content:center;padding-top:4px;}
.sh-m::after{content:'';width:3px;height:6px;background:rgba(92,130,92,.65);border-radius:2px;animation:mDot 1.5s ease-in-out infinite;}
@keyframes shB{0%,100%{transform:translateX(-50%) translateY(0);opacity:.5;}50%{transform:translateX(-50%) translateY(5px);opacity:1;}}
@keyframes mDot{0%{opacity:1;transform:translateY(0);}100%{opacity:0;transform:translateY(8px);}}

/* ── REVEAL ANIMATIONS ── */
.rv{opacity:0;will-change:opacity,transform;}
.rv.rl{transform:translateX(-52px);}
.rv.rr{transform:translateX(52px);}
.rv.ru{transform:translateY(48px);}
.rv.rs{transform:scale(.84);}
.rv.rf{transform:none;}
.rv.show{
  opacity:1!important;transform:none!important;
  transition:opacity .88s cubic-bezier(.22,1,.36,1),transform .88s cubic-bezier(.22,1,.36,1);
}
.d1{transition-delay:.05s!important;}.d2{transition-delay:.13s!important;}
.d3{transition-delay:.22s!important;}.d4{transition-delay:.30s!important;}
.d5{transition-delay:.40s!important;}.d6{transition-delay:.52s!important;}

/* ── SPLIT TEXT ── */
.sc{display:inline-block;white-space:pre;opacity:0;
  transition:opacity .75s cubic-bezier(.22,1,.36,1),transform .75s cubic-bezier(.22,1,.36,1);}
.sc.sl{transform:translateX(-34px);}
.sc.sr{transform:translateX(34px);}
.spl-on .sc{opacity:1!important;transform:none!important;}

/* ── KEYFRAMES ── */
@keyframes hBeat{0%,100%{transform:scale(1);}14%{transform:scale(1.28);}28%{transform:scale(1);}42%{transform:scale(1.18);}70%{transform:scale(1);}}
@keyframes floatY{0%,100%{transform:translateY(0);}50%{transform:translateY(-6px);}}
@keyframes wobble{0%,100%{transform:rotate(-7deg);}50%{transform:rotate(7deg);}}
@keyframes pGlow{0%,100%{box-shadow:0 0 8px rgba(60,100,60,.5);}50%{box-shadow:0 0 22px rgba(60,100,60,.88);}}
@keyframes shimmer{0%{background-position:-200% 0;}100%{background-position:200% 0;}}

/* ── FALLING PARTICLES (tim/tuyết) ── */
.particle{
  position:fixed;
  top:-40px;
  pointer-events:none;
  z-index:9997;
  animation:fall linear infinite;
  user-select:none;
}
@keyframes fall{
  0%{transform:translateY(0) rotate(0deg) scale(1);opacity:1;}
  80%{opacity:.8;}
  100%{transform:translateY(110vh) rotate(360deg) scale(.8);opacity:0;}
}

/* ── CALENDAR ── */
.cal-d{display:flex;align-items:center;justify-content:center;aspect-ratio:1;border-radius:50%;font-size:12px;color:#444;font-family:'Quicksand',sans-serif;font-weight:500;}
.cal-d.sp{background:linear-gradient(135deg,#2a4a2a,#5c8a5c);color:#fff;font-weight:700;font-size:13px;position:relative;animation:pGlow 2.5s ease-in-out infinite;}
.cal-d.sp::before{content:'♥';position:absolute;top:-13px;left:50%;transform:translateX(-50%);font-size:10px;color:#5c8a5c;}
.cal-d.wk{color:#8a4040;}

/* ── RSVP INPUTS ── */
.rv-in{width:100%;padding:7px 9px;border:1px solid #c0d8c0;border-radius:4px;font-size:12px;margin-bottom:10px;background:#f7faf7;color:#333;font-family:'Quicksand',sans-serif;transition:border-color .22s;outline:none;}
.rv-in:focus{border-color:#5c8a5c;}
.rv-rb label{display:flex;align-items:center;gap:7px;font-size:12px;color:#444;font-family:'Quicksand',sans-serif;cursor:pointer;margin-bottom:6px;}
.rv-rb input{accent-color:#5c8a5c;}

/* ── LIGHTBOX ── */
#lb{display:none;position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.96);align-items:center;justify-content:center;}
#lb.open{display:flex;}
#lb img{max-width:92vw;max-height:88vh;object-fit:contain;}
#lb-cl{position:absolute;top:.8rem;right:.8rem;background:transparent;border:1px solid rgba(255,255,255,.35);color:rgba(255,255,255,.7);font-size:.58rem;letter-spacing:.28em;text-transform:uppercase;padding:.35rem .8rem;cursor:pointer;font-family:'Quicksand',sans-serif;}
#lb-pv,#lb-nx{position:absolute;top:50%;transform:translateY(-50%);background:rgba(92,138,92,.18);border:1px solid rgba(92,138,92,.35);color:rgba(232,244,232,.8);font-size:1.8rem;width:42px;height:64px;cursor:pointer;font-family:serif;display:flex;align-items:center;justify-content:center;}
#lb-pv{left:.8rem;}#lb-nx{right:.8rem;}

/* ── QUOTE TEXT SHADOW (chữ trên ảnh luôn đọc được) ── */
.on-photo{
  text-shadow:
    0 1px 3px rgba(0,0,0,.9),
    0 0 12px rgba(0,0,0,.7),
    0 2px 8px rgba(0,0,0,.8);
}

/* ── DIVIDER ── */
.hdiv{height:4px;background:linear-gradient(90deg,transparent,#4a7a4a,transparent);}

@media(max-width:460px){
  body{padding:0;background:#0c1a0c;}
  #pw{width:100vw;max-height:100svh;border-radius:0;}
  #aud{right:8px;}
  #sh{display:none;}
}
  `}</style>
);

// ══════════════════════════════════════════════
// HOOKS
// ══════════════════════════════════════════════
function useCd(target) {
  const [t,setT]=useState({d:0,h:0,m:0,s:0});
  useEffect(()=>{
    const c=()=>{const d=new Date(target)-new Date();if(d<=0)return;setT({d:Math.floor(d/86400000),h:Math.floor(d%86400000/3600000),m:Math.floor(d%3600000/60000),s:Math.floor(d%60000/1000)});};
    c();const id=setInterval(c,1000);return()=>clearInterval(id);
  },[target]);
  return t;
}

// ══════════════════════════════════════════════
// FALLING HEARTS / SNOW
// ══════════════════════════════════════════════
function Particles({type="hearts"}) {
  const items = Array.from({length:18},(_,i)=>i);
  const emojis = type==="hearts" ? ["❤️","💕","💖","🌸","💗"] : ["❄️","✨","⭐","🌟","💫"];
  return (
    <div aria-hidden="true">
      {items.map(i=>{
        const left = `${5+Math.random()*90}%`;
        const delay = `${Math.random()*12}s`;
        const dur   = `${8+Math.random()*10}s`;
        const size  = `${10+Math.random()*14}px`;
        const emoji = emojis[i%emojis.length];
        return(
          <div key={i} className="particle" style={{left,animationDelay:delay,animationDuration:dur,fontSize:size}}>
            {emoji}
          </div>
        );
      })}
    </div>
  );
}

// ══════════════════════════════════════════════
// MUSIC PLAYER — YouTube hidden iframe
// ══════════════════════════════════════════════
function Music({url}) {
  const [on,setOn]=useState(false);
  const [rdy,setRdy]=useState(false);
  const id=ytId(url);
  const ref=useRef(null);
  const cmd=fn=>ref.current?.contentWindow?.postMessage(JSON.stringify({event:"command",func:fn,args:[]}),"*");

  useEffect(()=>{if(id)setRdy(false);},[id]);

  const toggle=e=>{
    e.stopPropagation();
    if(!id)return;
    if(!rdy){setRdy(true);setOn(true);return;}
    on?cmd("pauseVideo"):cmd("playVideo");
    setOn(o=>!o);
  };

  useEffect(()=>{
    if(rdy&&id){const t=setTimeout(()=>cmd("playVideo"),1500);return()=>clearTimeout(t);}
  },[rdy,id]);

  return(
    <>
      {id&&rdy&&<iframe ref={ref}
        src={`https://www.youtube.com/embed/${id}?autoplay=1&loop=1&playlist=${id}&controls=0&enablejsapi=1`}
        allow="autoplay" title="music"
        style={{position:"fixed",top:"-9999px",left:"-9999px",width:"1px",height:"1px"}}/>}
      <button id="aud" className={on?"":"paused"} onClick={toggle} title={on?"Tắt nhạc":"Bật nhạc"}>
        <svg viewBox="0 0 24 24" fill="none" stroke="rgba(200,232,180,.88)" strokeWidth="1.8" strokeLinecap="round" width="16" height="16">
          <circle cx="12" cy="12" r="9"/>
          <circle cx="12" cy="12" r="3.5" fill="rgba(200,232,180,.88)" stroke="none"/>
          <line x1="12" y1="3" x2="12" y2="6.5"/><line x1="12" y1="17.5" x2="12" y2="21"/>
          <line x1="3" y1="12" x2="6.5" y2="12"/><line x1="17.5" y1="12" x2="21" y2="12"/>
        </svg>
      </button>
    </>
  );
}

// ══════════════════════════════════════════════
// SPLIT TEXT — từng ký tự bay từ 2 bên
// ══════════════════════════════════════════════
function Split({text,style={},className=""}) {
  const ref=useRef(null);
  const [vis,setVis]=useState(false);
  const chars=Array.from(String(text||""));
  const mid=Math.floor(chars.length/2);

  useEffect(()=>{
    const el=ref.current;if(!el)return;
    const pw=document.getElementById("pw");
    const obs=new IntersectionObserver(([e])=>{
      if(e.isIntersecting){setVis(true);obs.disconnect();}
    },{root:pw,threshold:0.1});
    obs.observe(el);return()=>obs.disconnect();
  },[]);

  return(
    <span ref={ref} style={{display:"inline-flex",flexWrap:"nowrap",whiteSpace:"pre",...style}}
      className={`${className}${vis?" spl-on":""}`}>
      {chars.map((ch,i)=>{
        const isL=i<mid;const dist=Math.abs(i-mid);
        return(
          <span key={i} className={`sc ${isL?"sl":"sr"}`}
            style={{transitionDelay:`${(dist*.032).toFixed(3)}s`}}>
            {ch===" "?"\u00A0":ch}
          </span>
        );
      })}
    </span>
  );
}

// ══════════════════════════════════════════════
// REVEAL — fade+slide khi scroll đến
// ══════════════════════════════════════════════
function Rv({children,dir="u",delay=0,style={},className="",tag:Tag="div"}) {
  const ref=useRef(null);
  const [vis,setVis]=useState(false);

  useEffect(()=>{
    const el=ref.current;if(!el)return;
    const pw=document.getElementById("pw");
    const obs=new IntersectionObserver(([e])=>{
      if(e.isIntersecting){setVis(true);obs.disconnect();}
    },{root:pw,threshold:0.08,rootMargin:"0px 0px -10px 0px"});
    obs.observe(el);return()=>obs.disconnect();
  },[]);

  const dirMap={u:"translateY(48px)",l:"translateX(-52px)",r:"translateX(52px)",s:"scale(.84)",f:"none"};
  return(
    <Tag ref={ref} className={className}
      style={{
        opacity:vis?1:0,
        transform:vis?"none":(dirMap[dir]||"translateY(48px)"),
        transition:`opacity .88s cubic-bezier(.22,1,.36,1) ${delay}s,transform .88s cubic-bezier(.22,1,.36,1) ${delay}s`,
        ...style,
      }}>
      {children}
    </Tag>
  );
}

// ══════════════════════════════════════════════
// PHOTO — bg-image từ Google Drive
// ══════════════════════════════════════════════
function Pho({url,style={},className=""}) {
  const src=gd(url);
  return(
    <div className={className}
      style={{backgroundImage:src?`url(${src})`:"none",backgroundSize:"cover",backgroundPosition:"center",backgroundRepeat:"no-repeat",backgroundColor:"#b8ccb8",...style}}/>
  );
}

// newlines → <br>
const nl=txt=>String(txt||"").split("\n").map((l,i,a)=><span key={i}>{l}{i<a.length-1&&<br/>}</span>);

// ══════════════════════════════════════════════
// LIGHTBOX
// ══════════════════════════════════════════════
function Lightbox({imgs,cur,onClose,onNav}) {
  useEffect(()=>{
    const fn=e=>{if(e.key==="Escape")onClose();if(e.key==="ArrowLeft")onNav(-1);if(e.key==="ArrowRight")onNav(1);};
    document.addEventListener("keydown",fn);
    return()=>document.removeEventListener("keydown",fn);
  },[onClose,onNav]);
  if(cur<0||!imgs[cur])return null;
  return(
    <div id="lb" className="open" onClick={onClose}>
      <img src={gd(imgs[cur].url)} alt={imgs[cur].caption||""} onClick={e=>e.stopPropagation()}/>
      <button id="lb-cl" onClick={onClose}>ESC ✕</button>
      {imgs.length>1&&<>
        <button id="lb-pv" onClick={e=>{e.stopPropagation();onNav(-1);}}>‹</button>
        <button id="lb-nx" onClick={e=>{e.stopPropagation();onNav(1);}}>›</button>
      </>}
    </div>
  );
}

// ══════════════════════════════════════════════
// RSVP FORM
// ══════════════════════════════════════════════
function RSVP({d}) {
  const [name,setName]=useState("");
  const [att,setAtt]=useState("yes");
  const [guests,setGuests]=useState(1);
  const [msg,setMsg]=useState("");
  const [loading,setL]=useState(false);
  const [done,setDone]=useState(false);
  const [err,setErr]=useState("");

  const submit=async()=>{
    if(!name.trim()){setErr("Vui lòng nhập tên");return;}
    setL(true);setErr("");
    if(sb){
      const{error}=await sb.from("rsvp_responses").insert({name:name.trim(),attending:att==="yes",guests_count:att==="yes"?guests:0,message:msg||null});
      if(error){setErr(error.message);setL(false);return;}
    }
    setDone(true);setL(false);
  };

  if(done) return(
    <div style={{padding:"1rem",background:"#eef7ee",borderRadius:"5px",textAlign:"center"}}>
      <p style={{fontSize:"1.5rem"}}>{att==="yes"?"🎉":"💌"}</p>
      <p style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:"15px",color:"#2a4a2a",lineHeight:1.65,marginTop:"6px"}}>
        {att==="yes"?`Cảm ơn ${name}!\nHẹn gặp bạn ngày ${d.wedding_date} ♥`:`Cảm ơn ${name}!\nRất tiếc khi bạn không thể đến.`}
      </p>
    </div>
  );

  return(
    <>
      <p style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:"19px",fontWeight:700,color:"#2a4a2a",textAlign:"center",marginBottom:"13px"}}>Xác Nhận Tham Dự</p>
      <label style={{display:"block",fontSize:"11px",fontWeight:600,color:"#444",marginBottom:"3px"}}>Họ và tên</label>
      <input className="rv-in" value={name} placeholder="Nhập tên của bạn" maxLength={80}
        onChange={e=>{setName(e.target.value);setErr("");}}
        onKeyDown={e=>e.key==="Enter"&&submit()}/>
      <label style={{display:"block",fontSize:"11px",fontWeight:600,color:"#444",marginBottom:"6px"}}>Bạn sẽ tham dự chứ?</label>
      <div className="rv-rb" style={{marginBottom:"10px"}}>
        <label><input type="radio" name="att" value="yes" checked={att==="yes"} onChange={()=>setAtt("yes")}/> Có, tôi sẽ tham dự 🎉</label>
        <label><input type="radio" name="att" value="no"  checked={att==="no"}  onChange={()=>setAtt("no")} /> Rất tiếc, tôi không thể đến</label>
      </div>
      {att==="yes"&&<>
        <label style={{display:"block",fontSize:"11px",fontWeight:600,color:"#444",marginBottom:"3px"}}>Số người tham dự</label>
        <select className="rv-in" value={guests} onChange={e=>setGuests(Number(e.target.value))}>
          {[1,2,3,4,5,6,7,8,9,10].map(n=><option key={n} value={n}>{n} người</option>)}
        </select>
      </>}
      <label style={{display:"block",fontSize:"11px",fontWeight:600,color:"#444",marginBottom:"3px"}}>Lời nhắn (tuỳ chọn)</label>
      <textarea className="rv-in" rows={2} value={msg} maxLength={300}
        placeholder="Lời chúc của bạn..." onChange={e=>setMsg(e.target.value)} style={{resize:"none"}}/>
      {err&&<p style={{color:"#c04040",fontSize:"11px",marginBottom:"7px"}}>{err}</p>}
      <button onClick={submit} disabled={loading}
        style={{background:"linear-gradient(135deg,#2a4a2a,#5c8a5c)",color:"#fff",border:"none",padding:"9px",borderRadius:"4px",fontSize:"11px",fontWeight:700,letterSpacing:".18em",textTransform:"uppercase",width:"100%",cursor:"pointer",fontFamily:"'Quicksand',sans-serif",opacity:loading?.6:1}}>
        {loading?"Đang gửi...":"Gửi xác nhận ♥"}
      </button>
    </>
  );
}

// ══════════════════════════════════════════════
// CALENDAR
// ══════════════════════════════════════════════
function Cal({day=26}) {
  // April 2026: starts Wednesday (index 3 in CN=0 grid)
  const fDay=3, total=30;
  const cells=[];
  for(let i=0;i<fDay;i++)cells.push(null);
  for(let i=1;i<=total;i++)cells.push(i);
  while(cells.length%7!==0)cells.push(null);
  return(
    <div style={{padding:"12px 14px"}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",textAlign:"center",fontWeight:700,color:"#2a4a2a",marginBottom:"8px",fontSize:"11px",fontFamily:"'Quicksand',sans-serif"}}>
        {["CN","T2","T3","T4","T5","T6","T7"].map(d=><span key={d}>{d}</span>)}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:"3px"}}>
        {cells.map((d,i)=>(
          <div key={i} className={`cal-d${d===day?" sp":""}${d&&[0,6].includes(i%7)?" wk":""}`}>{d||""}</div>
        ))}
      </div>
      <div style={{textAlign:"center",marginTop:"7px",fontSize:".9rem",color:"#5c8a5c",animation:"floatY 3s ease-in-out infinite"}}>♥</div>
    </div>
  );
}

// ══════════════════════════════════════════════
// FLOWER DECO
// ══════════════════════════════════════════════
const FL_URL="https://assets.cinelove.me/templates/assets/efd815e3-41ff-4eb3-b31b-c25b202bc08c/016b5d70-8d6b-4f3c-b16c-2d93e447544c.png";
function Fl({top,left,w,h,rot,op=0.2}) {
  return(
    <div style={{position:"absolute",top,left,width:w,height:h,
      backgroundImage:`url(${FL_URL})`,backgroundSize:"cover",backgroundPosition:"center",
      transform:`rotate(${rot}deg)`,opacity:op,
      filter:"hue-rotate(80deg) saturate(.6) brightness(1.18)",
      pointerEvents:"none",zIndex:0}}/>
  );
}

// ══════════════════════════════════════════════
// MAIN
// ══════════════════════════════════════════════
export default function WeddingApp() {
  const [d,setD]=useState(DEF);
  const [lbCur,setLbCur]=useState(-1);
  const [lbImgs,setLbImgs]=useState([]);
  const [particleType,setParticleType]=useState("hearts");
  const cd=useCd("2026-04-26T10:00:00+07:00");

  // Load Supabase config
  useEffect(()=>{
    if(!sb)return;
    sb.from("wedding_config").select("*").eq("id",1).single().then(({data})=>{
      if(!data)return;
      let gal=data.gallery;
      if(typeof gal==="string"){try{gal=JSON.parse(gal);}catch{gal=[];}}
      setD({...DEF,...data,gallery:Array.isArray(gal)?gal:[]});
    });
  },[]);

  // ── Auto scroll + pause on user interaction ──
  useEffect(()=>{
    const pw=document.getElementById("pw");
    const sh=document.getElementById("sh");
    if(!pw)return;
    let active=true,paused=false,timer=null;
    const SPEED=0.55; // px per frame

    const loop=()=>{
      if(active&&!paused){
        pw.scrollTop+=SPEED;
        if(pw.scrollTop>=pw.scrollHeight-pw.clientHeight-1)active=false;
      }
      if(active)requestAnimationFrame(loop);
    };

    // Pause khi user cuộn tay, resume sau 4s
    const stop=()=>{
      paused=true;
      if(sh)sh.classList.add("gone");
      clearTimeout(timer);
      timer=setTimeout(()=>{paused=false;},4000);
    };

    pw.addEventListener("wheel",    stop,{passive:true});
    pw.addEventListener("touchmove",stop,{passive:true});
    pw.addEventListener("touchstart",stop,{passive:true});
    pw.addEventListener("scroll",()=>{if(pw.scrollTop>60&&sh)sh.classList.add("gone");});

    // Click vào thiệp toggle pause
    pw.addEventListener("click",e=>{
      const skip=["BUTTON","A","INPUT","SELECT","TEXTAREA","LABEL"];
      if(skip.includes(e.target.tagName))return;
      paused=!paused;clearTimeout(timer);
    });

    // Bắt đầu sau 2s
    const t=setTimeout(()=>requestAnimationFrame(loop),2000);
    return()=>{clearTimeout(t);active=false;};
  },[]);

  // Trigger reveal cho elements trong viewport lúc đầu
  useEffect(()=>{
    const pw=document.getElementById("pw");if(!pw)return;
    setTimeout(()=>{
      document.querySelectorAll(".rv").forEach(el=>{
        const r=el.getBoundingClientRect();
        const pr=pw.getBoundingClientRect();
        if(r.top<pr.bottom+80){
          el.classList.add("show");
          if(el.classList.contains("spl-built"))el.classList.add("spl-on");
        }
      });
    },200);
  },[]);

  const openLb=useCallback((imgs,i)=>{setLbImgs(imgs);setLbCur(i);},[]);
  const closeLb=useCallback(()=>setLbCur(-1),[]);
  const navLb=useCallback(dir=>setLbCur(c=>(c+dir+lbImgs.length)%lbImgs.length),[lbImgs.length]);

  const galArr=Array.isArray(d.gallery)?d.gallery:[];

  // ── Quote block với nền tối để đọc rõ trên ảnh ──
  const QB=({text,fontSize=18,style={}})=>(
    <div style={{
      background:"rgba(0,0,0,.52)",
      backdropFilter:"blur(2px)",
      borderRadius:"4px",
      padding:"10px 14px",
      ...style,
    }}>
      <p style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",color:"rgba(232,244,232,.96)",textAlign:"center",lineHeight:1.6,fontSize,whiteSpace:"pre-line"}} className="on-photo">
        {text}
      </p>
    </div>
  );

  // ── Section header tiêu đề có nền trắng ──
  const SH=({title,sub,top})=>(
    <div style={{position:"absolute",top,left:0,width:"100%",background:"#fff",textAlign:"center",padding:"18px 20px 10px",zIndex:3}}>
      <Rv dir="u" delay={0}>
        <div style={{display:"inline-block",borderTop:"1px solid rgba(42,74,42,.4)",paddingTop:"7px"}}>
          <Split text={title} style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:"28px",color:"#2a4a2a"}}/>
        </div>
      </Rv>
      {sub&&<Rv dir="u" delay={0.1}><p style={{fontSize:"10px",fontWeight:700,letterSpacing:".18em",textTransform:"uppercase",color:"#444",fontFamily:"'Quicksand',sans-serif",marginTop:"4px"}}>{sub}</p></Rv>}
    </div>
  );

  return(
    <>
      <GS/>
      <Particles type={particleType}/>
      <Music url={d.music_youtube}/>
      <div id="sh"><span className="sh-t">Kéo xuống</span><div className="sh-m"/></div>

      <div id="pw">

        {/* ═══════ S1: COVER HERO ═══════ */}
        {/* === Chiều cao cố định 490px === */}
        <div style={{position:"relative",width:"100%",height:"490px",overflow:"hidden",background:"linear-gradient(148deg,#1a3820 0%,#2d5c3a 50%,#183018 100%)"}}>
          {/* Texture */}
          <div style={{position:"absolute",inset:0,opacity:.05,backgroundImage:"repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 0,transparent 50%)",backgroundSize:"15px 15px"}}/>
          <Fl top={-30} left={-90} w={280} h={370} rot={14} op={0.2}/>

          {/* Ảnh chính — trái */}
          <Rv dir="u" delay={0} style={{position:"absolute",bottom:0,left:16,width:"260px",height:"430px",zIndex:1}}>
            <Pho url={d.hero_img} style={{width:"100%",height:"100%",WebkitMaskImage:"linear-gradient(180deg,black 60%,transparent 100%)",maskImage:"linear-gradient(180deg,black 60%,transparent 100%)"}}/>
          </Rv>

          {/* Deco hoa */}
          <Rv dir="r" delay={0.15} style={{position:"absolute",top:24,left:0,width:"130px",height:"165px",backgroundImage:"url('https://assets.cinelove.me/templates/assets/efd815e3-41ff-4eb3-b31b-c25b202bc08c/1faee750-3c82-4fdb-badb-f258477bd1c4.png')",backgroundSize:"cover",opacity:.65,filter:"hue-rotate(72deg) saturate(.55) brightness(1.35)",zIndex:2}}/>
          <Rv dir="r" delay={0.2} style={{position:"absolute",top:215,left:-10,width:"105px",height:"92px",backgroundImage:"url('https://assets.cinelove.me/templates/assets/efd815e3-41ff-4eb3-b31b-c25b202bc08c/a6d0b3c8-29c5-4cfd-b056-90a77cad3837.png')",backgroundSize:"cover",opacity:.6,filter:"hue-rotate(72deg) saturate(.55)",transform:"rotate(12deg)",zIndex:2}}/>

          {/* SAVE THE DATE */}
          <Rv dir="u" delay={0} style={{position:"absolute",top:10,left:0,width:"100%",textAlign:"center",zIndex:3}}>
            <p style={{color:"rgba(210,238,210,.82)",fontSize:"11.5px",fontWeight:600,fontFamily:"'Quicksand',sans-serif",letterSpacing:".5em",textTransform:"uppercase"}}>SAVE THE DATE</p>
          </Rv>

          {/* Panel phải: ngày + lễ */}
          <Rv dir="l" delay={0.12} style={{position:"absolute",top:75,right:6,width:"162px",display:"flex",flexDirection:"column",alignItems:"center",gap:"5px",zIndex:3}}>
            {[{label:"THƯ MỜI TIỆC CƯỚI"},{day:d.wedding_day},{date:d.wedding_date},{hr:true},{label:"LỄ THÀNH HÔN",mt:5},{day:d.wedding_day},{date:d.wedding_date}].map((item,i)=>(
              item.hr ? <div key={i} style={{width:"85px",height:"1px",background:"rgba(198,232,176,.35)"}}/>:
              item.label ? <p key={i} style={{color:"rgba(210,238,210,.76)",fontSize:"11px",fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",letterSpacing:".06em",textAlign:"center",lineHeight:1.4,marginTop:item.mt||0}}>{item.label}</p>:
              item.day ? <p key={i} style={{color:"rgba(210,238,210,.68)",fontSize:"9.5px",fontWeight:600,letterSpacing:".25em",textTransform:"uppercase",fontFamily:"'Quicksand',sans-serif"}}>{item.day}</p>:
              <p key={i} style={{color:"#c6e8b0",fontSize:"13.5px",fontWeight:600,fontFamily:"'Cinzel',serif",letterSpacing:".13em"}}>{item.date}</p>
            ))}
          </Rv>

          {/* Tên cô dâu chú rể */}
          <Rv dir="l" delay={0.2} style={{position:"absolute",bottom:36,right:4,width:"168px",textAlign:"center",zIndex:3}}>
            <Split text={d.groom} style={{fontFamily:"'Dancing Script',cursive",fontWeight:700,fontSize:"28px",color:"#c6e8b0",lineHeight:1.1,textShadow:"0 2px 12px rgba(0,0,0,.45)",display:"block"}}/>
            <span style={{display:"block",fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:"14px",color:"rgba(198,232,176,.52)",margin:"2px 0"}}>&amp;</span>
            <Split text={d.bride} style={{fontFamily:"'Dancing Script',cursive",fontWeight:700,fontSize:"28px",color:"#c6e8b0",lineHeight:1.1,textShadow:"0 2px 12px rgba(0,0,0,.45)",display:"block"}}/>
          </Rv>
        </div>

        {/* ═══════ S2: TÊN + PHỤ HUYNH ═══════ */}
        <div style={{position:"relative",background:"#fff",padding:"22px 16px 18px"}}>
          <div style={{position:"absolute",top:0,left:0,right:0,height:"3px",background:"linear-gradient(90deg,transparent,#4a7a4a,transparent)"}}/>

          {/* Tim */}
          <div style={{textAlign:"center",marginBottom:"10px"}}>
            <span style={{fontSize:"20px",color:"#4a7a4a",display:"inline-block",animation:"hBeat 2.8s ease-in-out infinite"}}>♥</span>
          </div>

          {/* 2 họ */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1px 1fr",gap:"0",marginBottom:"14px"}}>
            <Rv dir="r" delay={0} style={{padding:"0 10px 0 0",textAlign:"right"}}>
              <p style={{fontSize:"18px",fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",color:"#2a4a2a",marginBottom:"4px"}}>{d.parent_groom_label}</p>
              <p style={{fontSize:"11.5px",fontFamily:"'Quicksand',sans-serif",color:"#333",lineHeight:1.78}}>{nl(d.parent_groom_names)}</p>
              <p style={{fontSize:"9.5px",fontFamily:"'Quicksand',sans-serif",color:"#777",lineHeight:1.6,marginTop:"3px"}}>{nl(d.parent_groom_addr)}</p>
            </Rv>
            <Rv dir="u" delay={0.1} style={{alignSelf:"stretch"}}>
              <div style={{width:"1px",height:"100%",background:"#5c8a5c",margin:"0 auto"}}/>
            </Rv>
            <Rv dir="l" delay={0} style={{padding:"0 0 0 10px"}}>
              <p style={{fontSize:"18px",fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",color:"#2a4a2a",marginBottom:"4px"}}>{d.parent_bride_label}</p>
              <p style={{fontSize:"11.5px",fontFamily:"'Quicksand',sans-serif",color:"#333",lineHeight:1.78}}>{nl(d.parent_bride_names)}</p>
              <p style={{fontSize:"9.5px",fontFamily:"'Quicksand',sans-serif",color:"#777",lineHeight:1.6,marginTop:"3px"}}>{nl(d.parent_bride_addr)}</p>
            </Rv>
          </div>

          {/* Tên lớn */}
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:"8px"}}>
            <Split text={d.groom} style={{fontFamily:"'Dancing Script',cursive",fontWeight:700,fontSize:"26px",color:"#2a4a2a",textShadow:"0 1px 5px rgba(42,74,42,.18)"}} className="rv rr d3"/>
            <span style={{fontSize:"16px",color:"#5c8a5c",fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic"}}>♥</span>
            <Split text={d.bride} style={{fontFamily:"'Dancing Script',cursive",fontWeight:700,fontSize:"26px",color:"#2a4a2a",textShadow:"0 1px 5px rgba(42,74,42,.18)"}} className="rv rl d3"/>
          </div>
        </div>

        {/* ═══════ S3: THƯ MỜI + ẢNH ĐÔI ═══════ */}
        <div style={{position:"relative",background:"#f7faf7",padding:"22px 18px 20px"}}>
          <div style={{position:"absolute",top:0,left:0,right:0,height:"3px",background:"linear-gradient(90deg,transparent,#4a7a4a,transparent)"}}/>
          <div style={{textAlign:"center",marginBottom:"12px"}}>
            <Rv dir="u" delay={0}>
              <span style={{display:"inline-block",borderTop:"1px solid rgba(42,74,42,.4)",paddingTop:"6px",fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:"27px",color:"#2a4a2a"}}>
                {d.sec_invite_title}
              </span>
            </Rv>
            <Rv dir="u" delay={0.1}>
              <p style={{fontSize:"10px",fontWeight:700,letterSpacing:".18em",textTransform:"uppercase",color:"#444",fontFamily:"'Quicksand',sans-serif",marginTop:"4px"}}>{d.sec_invite_sub}</p>
            </Rv>
          </div>
          <Rv dir="s" delay={0.1}>
            <Pho url={d.couple_img} style={{width:"248px",height:"210px",margin:"0 auto 14px",display:"block",boxShadow:"0 4px 20px rgba(0,0,0,.28)"}}/>
          </Rv>
          <Rv dir="u" delay={0.15}>
            <p style={{fontSize:"11.5px",fontFamily:"'Quicksand',sans-serif",fontWeight:500,color:"#444",lineHeight:1.88,textAlign:"center"}}>{nl(d.sec_invite_body)}</p>
          </Rv>
        </div>

        {/* ═══════ S4: NGÀY GIỜ ĐỊA ĐIỂM ═══════ */}
        <div style={{position:"relative",background:"#fff",padding:"22px 18px 20px",textAlign:"center"}}>
          <div style={{position:"absolute",top:0,left:0,right:0,height:"3px",background:"linear-gradient(90deg,transparent,#4a7a4a,transparent)"}}/>
          <Rv dir="u" delay={0}><p style={{fontSize:"13.5px",fontWeight:500,color:"#444",fontFamily:"'Quicksand',sans-serif",marginBottom:"8px"}}>Vào Lúc</p></Rv>
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:"0",marginBottom:"8px"}}>
            <Rv dir="r" delay={0.1}><p style={{fontSize:"18px",fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",color:"#2a4a2a",width:"82px",textAlign:"center"}}>{d.wedding_time}</p></Rv>
            <Rv dir="u" delay={0.05}><p style={{fontSize:"21px",fontFamily:"'Cinzel',serif",fontWeight:600,color:"#2a4a2a",borderLeft:"2.5px solid #5c8a5c",borderRight:"2.5px solid #5c8a5c",padding:"0 10px",letterSpacing:".06em"}}>{d.wedding_date}</p></Rv>
            <Rv dir="l" delay={0.1}><p style={{fontSize:"18px",fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",color:"#2a4a2a",width:"82px",textAlign:"center"}}>{d.wedding_day}</p></Rv>
          </div>
          <Rv dir="u" delay={0.15}><p style={{fontSize:"11.5px",color:"#666",fontFamily:"'Quicksand',sans-serif",marginBottom:"8px"}}>{d.lunar_date}</p></Rv>
          <Rv dir="u" delay={0.18}><p style={{fontSize:"12px",fontWeight:700,color:"#333",fontFamily:"'Quicksand',sans-serif",marginBottom:"4px"}}>Tại</p></Rv>
          <Rv dir="u" delay={0.2}><p style={{fontFamily:"'Dancing Script',cursive",fontWeight:700,fontSize:"21px",color:"#2a4a2a",marginBottom:"3px"}}>{d.venue_name}</p></Rv>
          <Rv dir="u" delay={0.25}><p style={{fontSize:"11.5px",color:"#666",fontFamily:"'Quicksand',sans-serif",marginBottom:"12px"}}>{d.venue_address}</p></Rv>
          <Rv dir="s" delay={0.3}>
            <a href={d.venue_map_url||"#"} target="_blank" rel="noopener noreferrer"
              style={{display:"inline-block",background:"linear-gradient(135deg,#2a4a2a,#5c8a5c)",color:"#fff",fontSize:"10px",fontWeight:600,letterSpacing:".18em",textTransform:"uppercase",fontFamily:"'Quicksand',sans-serif",textDecoration:"none",padding:"7px 22px",boxShadow:"0 2px 10px rgba(42,74,42,.35)"}}>
              📍 Xem bản đồ
            </a>
          </Rv>
        </div>

        {/* ═══════ S5: THƯ MỜI 2 + 2 LỄ ═══════ */}
        <div style={{position:"relative",background:"#f7faf7",padding:"22px 16px 20px"}}>
          <div style={{position:"absolute",top:0,left:0,right:0,height:"3px",background:"linear-gradient(90deg,transparent,#4a7a4a,transparent)"}}/>
          <div style={{textAlign:"center",marginBottom:"14px"}}>
            <Rv dir="u" delay={0}><span style={{display:"inline-block",borderTop:"1px solid rgba(42,74,42,.4)",paddingTop:"6px",fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:"27px",color:"#2a4a2a"}}>{d.sec_cal_title}</span></Rv>
            <Rv dir="u" delay={0.1}><p style={{fontSize:"10px",fontWeight:700,letterSpacing:".18em",textTransform:"uppercase",color:"#444",fontFamily:"'Quicksand',sans-serif",marginTop:"4px"}}>{d.sec_cal_sub}</p></Rv>
          </div>

          {/* 2 lễ */}
          <div style={{display:"grid",gridTemplateColumns:"1fr auto 1fr",gap:"0",marginBottom:"10px",alignItems:"start"}}>
            {/* Lễ 1 */}
            <Rv dir="r" delay={0.1}>
              <div style={{position:"relative"}}>
                <div style={{background:"linear-gradient(90deg,#2a4a2a,#5c8a5c)",padding:"6px 10px 6px 10px",marginBottom:"8px"}}>
                  <p style={{fontSize:"13px",fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",color:"#e8f4e8"}}>{d.ceremony1_label}</p>
                </div>
                <div style={{borderLeft:"2px solid #5c8a5c",paddingLeft:"8px"}}>
                  <p style={{fontSize:"11.5px",fontWeight:700,color:"#222",fontFamily:"'Quicksand',sans-serif"}}>{d.ceremony1_time}</p>
                  <p style={{fontSize:"11.5px",fontWeight:700,color:"#222",fontFamily:"'Quicksand',sans-serif"}}>{d.ceremony1_date}</p>
                  <p style={{fontSize:"11px",color:"#666",fontFamily:"'Quicksand',sans-serif"}}>{d.ceremony1_lunar}</p>
                  <p style={{fontSize:"11px",color:"#666",fontFamily:"'Quicksand',sans-serif"}}>{d.ceremony1_place}</p>
                  <span style={{display:"inline-block",marginTop:"6px",background:"#2a4a2a",color:"#fff",fontSize:"11px",fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",padding:"2px 8px"}}>{d.ceremony1_addr}</span>
                </div>
              </div>
            </Rv>
            {/* Tim giữa */}
            <div style={{display:"flex",alignItems:"center",justifyContent:"center",padding:"0 6px",fontSize:"24px",color:"rgba(92,138,92,.4)",animation:"floatY 3s ease-in-out infinite",alignSelf:"center"}}>♥</div>
            {/* Lễ 2 */}
            <Rv dir="l" delay={0.1}>
              <div style={{position:"relative"}}>
                <div style={{background:"linear-gradient(270deg,#2a4a2a,#5c8a5c)",padding:"6px 10px",marginBottom:"8px",textAlign:"right"}}>
                  <p style={{fontSize:"13px",fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",color:"#e8f4e8"}}>{d.ceremony2_label}</p>
                </div>
                <div style={{borderRight:"2px solid #5c8a5c",paddingRight:"8px",textAlign:"right"}}>
                  <p style={{fontSize:"11.5px",fontWeight:700,color:"#222",fontFamily:"'Quicksand',sans-serif"}}>{d.ceremony2_time}</p>
                  <p style={{fontSize:"11.5px",fontWeight:700,color:"#222",fontFamily:"'Quicksand',sans-serif"}}>{d.ceremony2_date}</p>
                  <p style={{fontSize:"11px",color:"#666",fontFamily:"'Quicksand',sans-serif"}}>{d.ceremony2_lunar}</p>
                  <p style={{fontSize:"11px",color:"#666",fontFamily:"'Quicksand',sans-serif"}}>{d.ceremony2_place}</p>
                  <span style={{display:"inline-block",marginTop:"6px",background:"#2a4a2a",color:"#fff",fontSize:"11px",fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",padding:"2px 8px"}}>{d.ceremony2_addr}</span>
                </div>
              </div>
            </Rv>
          </div>
        </div>

        {/* ═══════ S6: CALENDAR BANNER + COUNTDOWN ═══════ */}
        <div style={{position:"relative",background:"#fff"}}>
          <div style={{position:"absolute",top:0,left:0,right:0,height:"3px",background:"linear-gradient(90deg,transparent,#4a7a4a,transparent)"}}/>
          {/* Banner */}
          <Rv dir="u" delay={0}>
            <div style={{background:"linear-gradient(90deg,#2a4a2a,#5c8a5c,#2a4a2a)",padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <p style={{fontSize:"21px",fontFamily:"'Cinzel',serif",fontWeight:600,color:"#e8f4e8",letterSpacing:".07em"}}>Tháng 4</p>
              <p style={{fontSize:"12px",fontFamily:"'Quicksand',sans-serif",fontWeight:600,letterSpacing:".2em",color:"rgba(232,244,232,.72)"}}>2026</p>
            </div>
          </Rv>
          {/* Calendar + Countdown side by side */}
          <div style={{display:"grid",gridTemplateColumns:"1fr auto",gap:"0"}}>
            <Rv dir="s" delay={0.1} style={{overflow:"hidden"}}>
              <Cal day={26}/>
            </Rv>
            {/* Countdown dọc */}
            <Rv dir="l" delay={0.15}>
              <div style={{background:"linear-gradient(180deg,#2a4a2a,#5c8a5c)",width:"58px",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"space-around",padding:"10px 4px",boxShadow:"-2px 0 10px rgba(0,0,0,.18)"}}>
                {[{v:cd.d,l:"ngày"},{v:cd.h,l:"giờ"},{v:cd.m,l:"phút"},{v:cd.s,l:"giây"}].map(item=>(
                  <div key={item.l} style={{textAlign:"center"}}>
                    <p style={{fontSize:"18px",fontWeight:700,fontFamily:"'Cinzel',serif",color:"#fff",lineHeight:1}}>{String(item.v??0).padStart(2,"0")}</p>
                    <p style={{fontSize:"7.5px",letterSpacing:".2em",color:"rgba(232,244,232,.75)",fontFamily:"'Quicksand',sans-serif",marginTop:"2px"}}>{item.l}</p>
                  </div>
                ))}
              </div>
            </Rv>
          </div>
        </div>

        {/* ═══════ S7: ẢNH + QUOTES (dark sections) ═══════ */}
        <div className="hdiv"/>

        {/* Quote 1 + Ảnh lớn */}
        <div style={{position:"relative",background:"linear-gradient(145deg,#182818,#2d5c3a)",padding:"22px 18px 18px"}}>
          <Fl top={-40} left={-160} w={370} h={520} rot={14} op={0.18}/>
          <Rv dir="u" delay={0.1} style={{position:"relative",zIndex:1,marginBottom:"14px"}}>
            <QB text={d.quote1} fontSize={17}/>
          </Rv>
          <Rv dir="u" delay={0.05} style={{position:"relative",zIndex:1}}>
            <Pho url={d.photo_large} style={{width:"100%",height:"280px",boxShadow:"0 4px 18px rgba(0,0,0,.45)"}}/>
          </Rv>
        </div>

        <div className="hdiv"/>

        {/* Ảnh nhỏ trái + Quote 2 */}
        <div style={{position:"relative",background:"linear-gradient(145deg,#2d5c3a,#182818)",padding:"18px"}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",alignItems:"center"}}>
            <Rv dir="r" delay={0.05}>
              <Pho url={d.photo_sm1} style={{width:"100%",height:"210px",boxShadow:"0 4px 18px rgba(0,0,0,.45)"}}/>
            </Rv>
            <Rv dir="l" delay={0.1}>
              <QB text={d.quote2} fontSize={15} style={{height:"100%",display:"flex",alignItems:"center",justifyContent:"center"}}/>
            </Rv>
          </div>
        </div>

        {/* Ảnh ngang 1 */}
        <div style={{background:"#182818",padding:"0 18px 14px"}}>
          <Rv dir="s" delay={0.05}>
            <Pho url={d.photo_wide1} style={{width:"100%",height:"200px",boxShadow:"0 4px 18px rgba(0,0,0,.45)"}}/>
          </Rv>
        </div>

        <div className="hdiv"/>

        {/* Quote 3 + Ảnh nhỏ phải */}
        <div style={{position:"relative",background:"linear-gradient(145deg,#182818,#2d5c3a)",padding:"18px"}}>
          <Fl top={-60} left={-100} w={270} h={400} rot={12} op={0.16}/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",alignItems:"center"}}>
            <Rv dir="r" delay={0.1}>
              <QB text={d.quote3} fontSize={15} style={{height:"100%",display:"flex",alignItems:"center",justifyContent:"center"}}/>
            </Rv>
            <Rv dir="l" delay={0.05}>
              <Pho url={d.photo_sm2} style={{width:"100%",height:"210px",boxShadow:"0 4px 18px rgba(0,0,0,.45)"}}/>
            </Rv>
          </div>
        </div>

        {/* Quote 4 + Ảnh cặp */}
        <div style={{background:"#2d5c3a",padding:"16px 18px 18px"}}>
          <Rv dir="u" delay={0.05} style={{marginBottom:"12px"}}>
            <QB text={d.quote4} fontSize={17}/>
          </Rv>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px"}}>
            <Rv dir="r" delay={0.1}><Pho url={d.photo_pair1} style={{width:"100%",height:"220px",boxShadow:"0 4px 18px rgba(0,0,0,.45)"}}/></Rv>
            <Rv dir="l" delay={0.15}><Pho url={d.photo_pair2} style={{width:"100%",height:"220px",boxShadow:"0 4px 18px rgba(0,0,0,.45)"}}/></Rv>
          </div>
        </div>

        {/* Ảnh ngang 2 + Quote 5 */}
        <div style={{background:"linear-gradient(145deg,#182818,#2d5c3a)",padding:"14px 18px 18px"}}>
          <Rv dir="s" delay={0.05} style={{marginBottom:"12px"}}>
            <Pho url={d.photo_wide2} style={{width:"100%",height:"195px",boxShadow:"0 4px 18px rgba(0,0,0,.45)"}}/>
          </Rv>
          <Rv dir="u" delay={0.12}>
            <QB text={d.quote5} fontSize={20}/>
          </Rv>
        </div>

        {/* ═══════ GALLERY ĐỘNG ═══════ */}
        {galArr.length>0&&(
          <>
            <div className="hdiv"/>
            <div style={{background:"#182818",padding:"14px 14px 16px"}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"6px"}}>
                {galArr.map((img,i)=>(
                  <Rv key={i} dir="s" delay={i*.06} style={{overflow:"hidden",cursor:"pointer",boxShadow:"0 3px 14px rgba(0,0,0,.42)"}} onClick={()=>openLb(galArr,i)}>
                    <img src={gd(img.url)} alt={img.caption||""} loading="lazy"
                      style={{width:"100%",height:"165px",objectFit:"cover",display:"block",transition:"transform .6s ease"}}
                      onMouseEnter={e=>e.target.style.transform="scale(1.05)"}
                      onMouseLeave={e=>e.target.style.transform="scale(1)"}
                      onError={e=>{e.target.style.display="none";e.target.parentElement.style.background="#2d5c3a";}}/>
                  </Rv>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ═══════ ẢNH FULL ═══════ */}
        {d.photo_full&&(
          <>
            <div className="hdiv"/>
            <div style={{position:"relative",overflow:"hidden"}}>
              <Pho url={d.photo_full} style={{width:"100%",height:"340px"}}/>
              <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,.5)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                <p style={{fontFamily:"'Cinzel',serif",fontWeight:600,fontSize:"22px",color:"rgba(232,244,232,.2)",letterSpacing:".18em",textTransform:"uppercase",userSelect:"none"}}>LOVE</p>
              </div>
            </div>
          </>
        )}

        {/* ═══════ S8: MONG ═══════ */}
        <div className="hdiv"/>
        <div style={{background:"linear-gradient(145deg,#0c1a0c,#182818)",padding:"32px 28px",textAlign:"center",position:"relative"}}>
          <Fl top={-50} left={-80} w={260} h={355} rot={12} op={0.16}/>
          <Rv dir="u" delay={0.1} style={{position:"relative",zIndex:1}}>
            <p style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:"22px",color:"rgba(232,244,232,.92)",lineHeight:1.6,whiteSpace:"pre-line",textShadow:"0 1px 6px rgba(0,0,0,.4)"}}>{d.mong_text}</p>
          </Rv>
        </div>

        {/* ═══════ S9: RSVP ═══════ */}
        <div style={{position:"relative",background:"#f7faf7",padding:"22px 18px 20px"}}>
          <div style={{position:"absolute",top:0,left:0,right:0,height:"3px",background:"linear-gradient(90deg,transparent,#4a7a4a,transparent)"}}/>
          <Rv dir="s" delay={0.1}>
            <div style={{maxWidth:"310px",margin:"0 auto",background:"#fff",border:"1px solid #c0d8c0",borderRadius:"7px",padding:"18px",boxShadow:"0 4px 18px rgba(42,74,42,.12)"}}>
              <RSVP d={d}/>
            </div>
          </Rv>
        </div>

        {/* ═══════ S10: QR MỪNG CƯỚI ═══════ */}
        <div className="hdiv"/>
        <div style={{background:"linear-gradient(148deg,#0c1a0c,#182818)",padding:"24px 14px 22px",textAlign:"center",position:"relative"}}>
          <Fl top={-60} left={-80} w={260} h={355} rot={12} op={0.16}/>
          <Rv dir="u" delay={0} style={{position:"relative",zIndex:1}}>
            <p style={{color:"rgba(200,232,180,.82)",fontSize:"12px",fontFamily:"'Quicksand',sans-serif",fontWeight:600,textAlign:"center",marginBottom:"10px",letterSpacing:".22em",textTransform:"uppercase"}}>
              ✦ Hộp quà yêu thương ✦
            </p>
          </Rv>
          <div style={{fontSize:"58px",marginBottom:"6px",animation:"wobble 2.8s ease-in-out infinite",display:"inline-block",position:"relative",zIndex:1}}>🎁</div>
          <Rv dir="u" delay={0.1} style={{position:"relative",zIndex:1}}>
            <p style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",color:"rgba(220,238,220,.88)",fontSize:"22px",marginBottom:"16px",lineHeight:1.3}}>Mừng cưới qua QR</p>
          </Rv>
          <Rv dir="u" delay={0.15} style={{position:"relative",zIndex:1}}>
            <div style={{display:"flex",gap:"12px",justifyContent:"center",flexWrap:"wrap"}}>
              {[
                {lbl:"Chú Rể",bank:d.qr_groom_bank,num:d.qr_groom_num,name:d.qr_groom_name,img:d.qr_groom_img},
                {lbl:"Cô Dâu",bank:d.qr_bride_bank,num:d.qr_bride_num,name:d.qr_bride_name,img:d.qr_bride_img},
              ].map(qr=>(
                <div key={qr.lbl} style={{background:"rgba(255,255,255,.07)",border:"1px solid rgba(200,232,180,.22)",borderRadius:"8px",padding:"13px",textAlign:"center",flex:1,maxWidth:"185px"}}>
                  <p style={{color:"rgba(200,232,180,.72)",fontSize:"8.5px",letterSpacing:".25em",textTransform:"uppercase",marginBottom:"4px",fontFamily:"'Quicksand',sans-serif"}}>{qr.lbl}</p>
                  <p style={{color:"rgba(220,238,220,.88)",fontSize:"10px",fontFamily:"'Quicksand',sans-serif",marginBottom:"2px"}}>{qr.bank}</p>
                  <p style={{color:"#c4e8a8",fontSize:"12.5px",fontFamily:"'Cinzel',serif",marginBottom:"2px"}}>{qr.num}</p>
                  <p style={{color:"rgba(200,232,180,.6)",fontSize:"8.5px",fontFamily:"'Quicksand',sans-serif",marginBottom:"8px"}}>{qr.name}</p>
                  <div style={{width:"105px",height:"105px",margin:"0 auto",background:"#fff",borderRadius:"4px",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden"}}>
                    {gd(qr.img)?<img src={gd(qr.img)} alt="QR" style={{width:"100%",height:"100%",objectFit:"contain"}}/>:<span style={{fontSize:"8.5px",color:"#999"}}>QR Code</span>}
                  </div>
                </div>
              ))}
            </div>
          </Rv>
        </div>

        {/* FOOTER */}
        <div style={{background:"#0c1a0c",padding:"14px",textAlign:"center"}}>
          <p style={{color:"rgba(200,232,180,.3)",fontSize:"9.5px",fontFamily:"'Quicksand',sans-serif",letterSpacing:".22em"}}>
            {d.bride} &amp; {d.groom} · {d.wedding_date} · Huế
          </p>
        </div>

      </div>{/* #pw */}

      {/* Lightbox */}
      {lbCur>=0&&<Lightbox imgs={lbImgs} cur={lbCur} onClose={closeLb} onNav={navLb}/>}
    </>
  );
}
