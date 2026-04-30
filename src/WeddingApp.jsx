// ============================================================
// WEDDING APP v7 — React + Supabase
// 1. Ngày wedding thay đổi → calendar + text tự cập nhật
// 2. RSVP live feed cuộn lên như livestream comment
// 3. Auto-scroll mobile fix
// 4. Photo drag-to-crop: kéo để chọn vùng hiển thị
// 5. Icon nốt nhạc, auto-play mobile
// ============================================================
import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

const SB_URL = import.meta.env.VITE_SUPABASE_URL;
const SB_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const sb = SB_URL && SB_KEY ? createClient(SB_URL, SB_KEY) : null;

function gd(url) {
  if (!url?.trim()) return "";
  const m = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);
  return m ? `https://lh3.googleusercontent.com/d/${m[1]}` : url;
}
function ytId(url) {
  if (!url) return "";
  const m = url.match(/youtu\.be\/([^?&]+)/) || url.match(/[?&]v=([^&]+)/);
  return m ? m[1] : "";
}

// ── Tính thứ từ date string "DD.MM.YYYY" ──
function getWeekday(dateStr) {
  if (!dateStr) return "";
  const parts = dateStr.split(".");
  if (parts.length !== 3) return "";
  const [d, m, y] = parts.map(Number);
  if (!d || !m || !y) return "";
  const date = new Date(y, m - 1, d);
  if (isNaN(date)) return "";
  const days = ["Chủ Nhật","Thứ Hai","Thứ Ba","Thứ Tư","Thứ Năm","Thứ Sáu","Thứ Bảy"];
  return days[date.getDay()];
}

// ── Build calendar từ date string ──
function buildCalendar(dateStr) {
  const parts = dateStr?.split(".");
  if (!parts || parts.length !== 3) return null;
  const [d, m, y] = parts.map(Number);
  if (!d || !m || !y) return null;
  const date = new Date(y, m - 1, 1);
  if (isNaN(date)) return null;
  const firstDay = date.getDay(); // 0=Sun
  const daysInMonth = new Date(y, m, 0).getDate();
  return { day: d, month: m, year: y, firstDay, daysInMonth };
}

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
  ceremony1_label:"Lễ Gia Tiên Nhà Trai",ceremony1_time:"07:30 SA",
  ceremony1_date:"27.04.2026",ceremony1_lunar:"10/03 Âm lịch",
  ceremony1_place:"Tại tư gia",ceremony1_addr:"Phường ABC, TP. Huế",
  ceremony2_label:"Lễ Cưới",ceremony2_time:"10:00 SA",
  ceremony2_date:"26.04.2026",ceremony2_lunar:"09/03 Âm lịch",
  ceremony2_place:"Tại nhà hàng",ceremony2_addr:"Phường XYZ, TP. Huế",
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
  qr_groom_bank:"Vietcombank",qr_groom_num:"0123 456 789",
  qr_groom_name:"NGUYEN VIET DINH",qr_groom_img:"",
  qr_bride_bank:"Vietcombank",qr_bride_num:"9876 543 210",
  qr_bride_name:"TRAN BAO NGAN",qr_bride_img:"",
  hero_img:"",couple_img:"",photo_large:"",
  photo_sm1:"",photo_sm2:"",photo_wide1:"",
  photo_wide2:"",photo_pair1:"",photo_pair2:"",photo_full:"",
  hero_pos:"50% 50%",couple_pos:"50% 50%",large_pos:"50% 50%",
  sm1_pos:"50% 50%",sm2_pos:"50% 50%",wide1_pos:"50% 50%",
  wide2_pos:"50% 50%",pair1_pos:"50% 50%",pair2_pos:"50% 50%",full_pos:"50% 50%",
  hero_shape:"wave",couple_shape:"art",large_shape:"soft",
  sm1_shape:"wave",sm2_shape:"art",wide1_shape:"soft",
  wide2_shape:"soft",pair1_shape:"soft",pair2_shape:"soft",full_shape:"none",
  music_youtube:"",gallery:[],
};

// ══════════════════════════════════════════════
// GLOBAL CSS
// ══════════════════════════════════════════════
const GS = () => (
  <style>{`
@import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Cinzel:wght@400;600&family=Dancing+Script:wght@500;700&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
body{background:#c0a0a0;display:flex;justify-content:center;align-items:flex-start;min-height:100vh;padding:3vh 0;font-family:'Quicksand',sans-serif;-webkit-font-smoothing:antialiased;-webkit-tap-highlight-color:transparent;}
#pw{width:451px;position:relative;background:#fff;border:1px solid #c0a0a0;box-shadow:0 0 50px rgba(80,10,10,.25);border-radius:3px;overflow:hidden;overflow-y:auto;max-height:94vh;padding-bottom:38px;}
#pw::-webkit-scrollbar{width:0;}
#pw{-ms-overflow-style:none;scrollbar-width:none;}

/* ── Music ── */
#aud{position:fixed;right:calc(50% - 225px + 8px);top:calc(3vh + 8px);z-index:9999;width:38px;height:38px;background:rgba(60,10,10,.55);border-radius:50%;border:2px solid rgba(240,180,180,.5);display:flex;align-items:center;justify-content:center;cursor:pointer;backdrop-filter:blur(8px);transition:all .3s;}
#aud:hover{background:rgba(99,23,23,.75);}
#aud.on{background:linear-gradient(135deg,#631717,#9a2a2a);border-color:rgba(255,200,200,.6);box-shadow:0 0 12px rgba(99,23,23,.6);animation:audPulse 2s ease-in-out infinite;}
@keyframes audPulse{0%,100%{box-shadow:0 0 8px rgba(99,23,23,.5);}50%{box-shadow:0 0 18px rgba(99,23,23,.9);}}

/* ── Scroll hint ── */
#sh{position:fixed;bottom:calc(3vh+10px);left:50%;animation:shB 2.4s ease-in-out infinite;pointer-events:none;z-index:998;display:flex;flex-direction:column;align-items:center;gap:4px;opacity:1;transition:opacity .9s;}
#sh.gone{opacity:0;}
.sh-t{font-size:8px;letter-spacing:.35em;text-transform:uppercase;color:rgba(154,60,60,.75);}
.sh-m{width:19px;height:27px;border:1.5px solid rgba(154,60,60,.55);border-radius:9px;display:flex;justify-content:center;padding-top:4px;}
.sh-m::after{content:'';width:3px;height:6px;background:rgba(154,60,60,.65);border-radius:2px;animation:mDot 1.5s ease-in-out infinite;}
@keyframes shB{0%,100%{transform:translateX(-50%) translateY(0);opacity:.5;}50%{transform:translateX(-50%) translateY(5px);opacity:1;}}
@keyframes mDot{0%{opacity:1;transform:translateY(0);}100%{opacity:0;transform:translateY(8px);}}

/* ── Reveal ── */
.rv{opacity:0;will-change:opacity,transform;}
.rv.rl{transform:translateX(-52px);}.rv.rr{transform:translateX(52px);}
.rv.ru{transform:translateY(48px);}.rv.rs{transform:scale(.84);}
.rv.rf{transform:none;}
.rv.show{opacity:1!important;transform:none!important;transition:opacity .88s cubic-bezier(.22,1,.36,1),transform .88s cubic-bezier(.22,1,.36,1);}
.d1{transition-delay:.05s!important;}.d2{transition-delay:.13s!important;}.d3{transition-delay:.22s!important;}.d4{transition-delay:.30s!important;}

/* ── Split ── */
.sc{display:inline-block;white-space:pre;opacity:0;transition:opacity .75s cubic-bezier(.22,1,.36,1),transform .75s cubic-bezier(.22,1,.36,1);}
.sc.sl{transform:translateX(-34px);}.sc.sr{transform:translateX(34px);}
.spl-on .sc{opacity:1!important;transform:none!important;}

/* ── Keyframes ── */
@keyframes hBeat{0%,100%{transform:scale(1);}14%{transform:scale(1.28);}28%{transform:scale(1);}42%{transform:scale(1.18);}70%{transform:scale(1);}}
@keyframes floatY{0%,100%{transform:translateY(0);}50%{transform:translateY(-6px);}}
@keyframes wobble{0%,100%{transform:rotate(-7deg);}50%{transform:rotate(7deg);}}
@keyframes pGlow{0%,100%{box-shadow:0 0 8px rgba(120,30,30,.5);}50%{box-shadow:0 0 22px rgba(120,30,30,.88);}}

/* ── Particles ── */
/* Hoa/tim rơi — pure CSS, không JS, không giật */
.ptc-wrap{position:fixed;inset:0;pointer-events:none;z-index:9997;overflow:hidden;}
.ptc{
  position:absolute;top:-60px;
  pointer-events:none;user-select:none;
  animation:ptcFall linear infinite;
  will-change:transform,opacity;
}
@keyframes ptcFall{
  0%  {transform:translateY(0)     rotate(0deg)   scale(1);   opacity:0;}
  5%  {opacity:1;}
  90% {opacity:.85;}
  100%{transform:translateY(105vh) rotate(400deg) scale(.75); opacity:0;}
}

/* ── Calendar ── */
.cal-d{display:flex;align-items:center;justify-content:center;aspect-ratio:1;border-radius:50%;font-size:12px;color:#444;font-family:'Quicksand',sans-serif;font-weight:500;}
.cal-d.sp{background:linear-gradient(135deg,#631717,#9a2a2a);color:#fff;font-weight:700;font-size:13px;position:relative;animation:pGlow 2.5s ease-in-out infinite;}
.cal-d.sp::before{content:'♥';position:absolute;top:-13px;left:50%;transform:translateX(-50%);font-size:10px;color:#9a2a2a;}
.cal-d.wk{color:#4a4a8a;}

/* ── RSVP input ── */
.rv-in{width:100%;padding:7px 9px;border:1px solid #d4b8b8;border-radius:4px;font-size:12px;margin-bottom:10px;background:#fdf7f7;color:#333;font-family:'Quicksand',sans-serif;transition:border-color .22s;outline:none;}
.rv-in:focus{border-color:#631717;}
.rv-rb label{display:flex;align-items:center;gap:7px;font-size:12px;color:#444;font-family:'Quicksand',sans-serif;cursor:pointer;margin-bottom:6px;}
.rv-rb input{accent-color:#631717;}

/* ── RSVP Live Feed — Fixed bottom 20% màn hình ──
   Chữ chạy từng hàng từ dưới lên, chồng lên nội dung,
   pointer-events:none nên không ảnh hưởng gì phía sau */
#live-ticker{
  position:fixed;
  bottom:0; left:50%;
  transform:translateX(-50%);
  width:451px;
  height:20vh;          /* 20% chiều cao màn hình */
  min-height:130px;
  max-height:200px;
  z-index:8888;
  pointer-events:none;  /* xuyên qua click — không block tương tác */
  opacity:0;
  animation:tkFadeIn .8s ease 1s forwards;
}
@media(max-width:460px){#live-ticker{width:100vw;}}
@keyframes tkFadeIn{to{opacity:1;}}

/* Nền gradient từ trong suốt → đậm dần xuống dưới */
.tk-bg{
  position:absolute;inset:0;
  background:linear-gradient(
    180deg,
    transparent 0%,
    rgba(10,2,2,.55) 35%,
    rgba(15,3,3,.82) 65%,
    rgba(20,4,4,.95) 100%
  );
  backdrop-filter:blur(6px);
  -webkit-backdrop-filter:blur(6px);
}
/* Đường viền trên */
.tk-border{
  position:absolute;top:0;left:0;right:0;height:1px;
  background:linear-gradient(90deg,transparent,rgba(180,40,40,.4),transparent);
}

/* Header LIVE */
.tk-header{
  position:absolute;top:0;left:0;right:0;
  display:flex;align-items:center;gap:5px;
  padding:5px 10px 3px;
  z-index:2;
}
.tk-dot{
  width:5px;height:5px;border-radius:50%;background:#ff3333;
  box-shadow:0 0 5px #ff3333;
  animation:tkDot 1.1s ease-in-out infinite;
}
@keyframes tkDot{0%,100%{opacity:1;}50%{opacity:.25;}}
.tk-lbl{
  font-size:7.5px;font-weight:800;letter-spacing:.2em;
  color:rgba(255,170,170,.8);font-family:'Quicksand',sans-serif;
  text-transform:uppercase;
}
.tk-count{
  margin-left:auto;font-size:7.5px;
  color:rgba(255,150,150,.5);font-family:'Quicksand',sans-serif;
}

/* Container cuộn */
.tk-scroll{
  position:absolute;
  top:22px; left:0; right:0; bottom:0;
  overflow:hidden;
  z-index:2;
}
/* Inner — dịch chuyển bằng JS transform */
.tk-inner{
  position:absolute;
  bottom:0; left:0; right:0;
  display:flex;flex-direction:column;
  align-items:flex-start;
  padding:0 10px 6px;
  will-change:transform;
}
/* Mỗi hàng feed */
.tk-row{
  display:flex;align-items:baseline;
  gap:5px;
  padding:3px 0;
  flex-shrink:0;
  width:100%;
  opacity:1;
}
.tk-av{
  width:18px;height:18px;border-radius:50%;flex-shrink:0;
  background:linear-gradient(135deg,#7a1a1a,#631717);
  color:#fff;display:inline-flex;align-items:center;justify-content:center;
  font-size:8px;font-weight:700;
  border:1px solid rgba(255,130,130,.2);
}
.tk-name{
  font-size:11px;font-weight:700;flex-shrink:0;
  color:rgba(255,200,200,.95);font-family:'Quicksand',sans-serif;
  text-shadow:0 1px 3px rgba(0,0,0,.7);
}
.tk-badge{
  font-size:8px;padding:1px 5px;border-radius:99px;font-weight:600;flex-shrink:0;
}
.tk-badge.yes{background:rgba(140,20,20,.7);color:rgba(255,185,185,.95);}
.tk-badge.no {background:rgba(50,50,50,.55);color:rgba(185,185,185,.75);}
.tk-msg{
  font-size:10px;color:rgba(255,175,175,.78);
  font-family:'Quicksand',sans-serif;font-style:italic;
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
  flex:1;min-width:0;
}
/* Fade top của scroll area */
.tk-fade{
  position:absolute;top:22px;left:0;right:0;height:30px;
  background:linear-gradient(180deg,rgba(15,3,3,.9),transparent);
  z-index:3;pointer-events:none;
}

/* ── Comment Box kiểu livestream ── */
.cmtbox{
  background:#fff;
  border:1px solid #e8d0d0;
  border-radius:12px;
  overflow:hidden;
  box-shadow:0 4px 20px rgba(99,23,23,.1);
}
.cmtbox-header{
  background:linear-gradient(90deg,#631717,#9a2a2a);
  padding:8px 12px;
  display:flex;align-items:center;gap:7px;
}
.cmt-hdr-dot{width:5px;height:5px;border-radius:50%;background:#ff4444;box-shadow:0 0 5px #ff4444;animation:tkDot 1.1s ease-in-out infinite;}
.cmt-hdr-txt{font-size:11px;font-weight:700;color:rgba(255,220,220,.92);font-family:'Quicksand',sans-serif;letter-spacing:.06em;}
.cmt-hdr-cnt{margin-left:auto;font-size:9px;color:rgba(255,190,190,.6);font-family:'Quicksand',sans-serif;}

/* Danh sách comment */
.cmt-list{
  height:180px;
  overflow-y:auto;
  padding:6px 0;
  scroll-behavior:smooth;
}
.cmt-list::-webkit-scrollbar{width:3px;}
.cmt-list::-webkit-scrollbar-thumb{background:rgba(180,60,60,.25);border-radius:2px;}
.cmt-item{
  display:flex;align-items:flex-start;gap:7px;
  padding:5px 10px;
  animation:cmtIn .4s cubic-bezier(.22,1,.36,1);
}
@keyframes cmtIn{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:none;}}
.cmt-av{
  width:24px;height:24px;border-radius:50%;flex-shrink:0;
  background:linear-gradient(135deg,#7a1a1a,#631717);
  color:#fff;display:flex;align-items:center;justify-content:center;
  font-size:9px;font-weight:700;
  border:1px solid rgba(180,60,60,.2);
  margin-top:1px;
}
.cmt-body{flex:1;min-width:0;}
.cmt-meta{display:flex;align-items:center;gap:5px;flex-wrap:wrap;}
.cmt-name{font-size:11.5px;font-weight:700;color:#631717;font-family:'Quicksand',sans-serif;}
.cmt-badge{font-size:8px;padding:1px 5px;border-radius:99px;font-weight:600;}
.cmt-badge.yes{background:#fde8e8;color:#7a1a1a;}
.cmt-badge.no{background:#f0f0f0;color:#888;}
.cmt-text{font-size:11px;color:#444;font-family:'Quicksand',sans-serif;line-height:1.45;margin-top:1px;word-break:break-word;}
.cmt-time{font-size:8.5px;color:#bbb;font-family:'Quicksand',sans-serif;margin-top:2px;}

/* Input gửi comment */
.cmt-input-wrap{
  border-top:1px solid #f0e0e0;
  padding:8px 10px;
  display:flex;gap:7px;align-items:center;
  background:#fdf9f9;
}
.cmt-name-inp{
  width:90px;flex-shrink:0;
  padding:6px 8px;
  border:1.5px solid #e0c8c8;border-radius:20px;
  font-size:11px;font-family:'Quicksand',sans-serif;
  outline:none;background:#fff;color:#2a1010;
  transition:border-color .2s;
}
.cmt-name-inp:focus{border-color:#631717;}
.cmt-text-inp{
  flex:1;
  padding:6px 10px;
  border:1.5px solid #e0c8c8;border-radius:20px;
  font-size:11px;font-family:'Quicksand',sans-serif;
  outline:none;background:#fff;color:#2a1010;
  transition:border-color .2s;
}
.cmt-text-inp:focus{border-color:#631717;}
.cmt-send-btn{
  width:32px;height:32px;border-radius:50%;flex-shrink:0;
  background:linear-gradient(135deg,#631717,#9a2a2a);
  border:none;cursor:pointer;
  display:flex;align-items:center;justify-content:center;
  transition:opacity .2s;font-size:13px;
}
.cmt-send-btn:hover{opacity:.85;}
.cmt-send-btn:disabled{opacity:.45;cursor:not-allowed;}

/* ── Lightbox ── */
#lb{display:none;position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.96);align-items:center;justify-content:center;}
#lb.open{display:flex;}
#lb img{max-width:92vw;max-height:88vh;object-fit:contain;border-radius:8px;}
#lb-cl{position:absolute;top:.8rem;right:.8rem;background:transparent;border:1px solid rgba(255,255,255,.35);color:rgba(255,255,255,.7);font-size:.58rem;letter-spacing:.28em;text-transform:uppercase;padding:.35rem .8rem;cursor:pointer;font-family:'Quicksand',sans-serif;}
#lb-pv,#lb-nx{position:absolute;top:50%;transform:translateY(-50%);background:rgba(99,23,23,.25);border:1px solid rgba(240,180,180,.35);color:rgba(255,220,220,.85);font-size:1.8rem;width:42px;height:64px;cursor:pointer;font-family:serif;display:flex;align-items:center;justify-content:center;border-radius:4px;}
#lb-pv{left:.8rem;}#lb-nx{right:.8rem;}
#lb-cap{position:absolute;bottom:1rem;left:50%;transform:translateX(-50%);color:rgba(255,255,255,.55);font-size:.8rem;font-family:'Cormorant Garamond',serif;font-style:italic;}

/* ── Photo frames ── */
.pf{position:relative;overflow:hidden;}
.pf img{width:100%;height:100%;object-fit:cover;display:block;pointer-events:none;}
.pf.round-soft{border-radius:16px;}
.pf.round-art{border-radius:40% 60% 55% 45%/45% 40% 60% 55%;}
.pf.round-wave{border-radius:62% 38% 46% 54%/60% 44% 56% 40%;}
.pf.round-circle{border-radius:50%;}
.pf.round-none{border-radius:0;}
.pf::after{content:'';position:absolute;inset:0;border:1.5px solid rgba(99,23,23,.18);border-radius:inherit;pointer-events:none;}
.pf.round-none::after{display:none;}

/* ── Misc ── */
.on-photo{text-shadow:0 1px 4px rgba(0,0,0,.95),0 0 14px rgba(0,0,0,.8),0 2px 10px rgba(0,0,0,.9);}
.hdiv{height:4px;background:linear-gradient(90deg,transparent,#631717,transparent);}
.sec-dark{background:linear-gradient(145deg,#1a0808,#3d1010);}
.sec-dark2{background:linear-gradient(145deg,#2a0808,#631717);}
.sec-mid{background:linear-gradient(145deg,#631717,#1a0808);}
.sec-night{background:linear-gradient(145deg,#110404,#200808);}

@media(max-width:460px){
  body{padding:0;background:#200a0a;display:block;}
  #pw{width:100vw;max-height:none!important;height:auto!important;overflow:visible!important;overflow-y:visible!important;border-radius:0;border:none;box-shadow:none;}
  #aud{right:10px;top:10px;}
  #sh{display:none;}
}
  `}</style>
);

// ── Countdown hook ──
function useCd(dateStr) {
  const [t,setT]=useState({d:0,h:0,m:0,s:0,past:false});
  useEffect(()=>{
    const calc=()=>{
      if (!dateStr) return;
      const parts=dateStr.split(".");if(parts.length!==3)return;
      const [d,m,y]=parts.map(Number);
      const target=new Date(y,m-1,d,10,0,0);
      const diff=target-new Date();
      if(diff<=0){setT({d:0,h:0,m:0,s:0,past:true});return;}
      setT({d:Math.floor(diff/86400000),h:Math.floor(diff%86400000/3600000),m:Math.floor(diff%3600000/60000),s:Math.floor(diff%60000/1000),past:false});
    };
    calc();const id=setInterval(calc,1000);return()=>clearInterval(id);
  },[dateStr]);
  return t;
}

// ── Particles ──
// Tạo data particles 1 lần (ngoài component = không re-create)
const PARTICLE_DATA = (() => {
  const emojis = ["❤️","💕","💖","🌹","💗","🌸","✨","💝"];
  const rng = (min, max) => min + Math.floor(Math.random() * (max - min));
  return Array.from({length: 18}, (_, i) => ({
    emoji:    emojis[i % emojis.length],
    left:     `${4 + rng(0, 92)}%`,
    delay:    `${rng(0, 16)}s`,
    duration: `${9 + rng(0, 11)}s`,
    size:     `${11 + rng(0, 13)}px`,
  }));
})();

function Particles() {
  return (
    <div className="ptc-wrap" aria-hidden="true">
      {PARTICLE_DATA.map((p, i) => (
        <div key={i} className="ptc" style={{
          left:              p.left,
          animationDelay:    p.delay,
          animationDuration: p.duration,
          fontSize:          p.size,
        }}>
          {p.emoji}
        </div>
      ))}
    </div>
  );
}

// ── Music player — auto-play mobile (dùng muted iframe + gesture unlock) ──
function Music({url}) {
  const [on,setOn]       = useState(false);
  const [ready,setReady] = useState(false);
  const ifrRef           = useRef(null);
  const startedRef       = useRef(false);
  const id               = ytId(url);

  // Gửi lệnh tới YouTube player qua postMessage
  const cmd = useCallback((fn, args=[]) => {
    try {
      ifrRef.current?.contentWindow?.postMessage(
        JSON.stringify({ event:"command", func:fn, args }), "*"
      );
    } catch {}
  }, []);

  // Hàm phát thật sự (cần gesture trên mobile)
  const doPlay = useCallback(() => {
    cmd("unMute");
    cmd("playVideo");
    cmd("setVolume", [85]);
    setOn(true);
  }, [cmd]);

  // Khi iframe load xong → đánh dấu ready
  const onLoad = useCallback(() => {
    setReady(true);
    // Desktop: thử phát ngay (không cần gesture)
    if (startedRef.current) {
      setTimeout(doPlay, 500);
    }
  }, [doPlay]);

  // Lắng nghe gesture đầu tiên → phát nhạc
  useEffect(() => {
    if (!id) return;

    const unlock = () => {
      if (startedRef.current) return;
      startedRef.current = true;
      if (ready) doPlay();
      else {
        // Chưa load xong → đợi onLoad gọi doPlay
        // (onLoad sẽ check startedRef.current)
      }
    };

    // Gesture events — mobile cần touchstart, desktop cần click
    window.addEventListener("touchstart", unlock, { once: true, passive: true });
    window.addEventListener("click",      unlock, { once: true });

    // Desktop fallback: thử sau 1.2s (không cần gesture)
    const t = setTimeout(() => {
      if (!startedRef.current && ready) {
        startedRef.current = true;
        doPlay();
      }
    }, 1200);

    return () => {
      window.removeEventListener("touchstart", unlock);
      window.removeEventListener("click",      unlock);
      clearTimeout(t);
    };
  }, [id, ready, doPlay]);

  const toggle = useCallback((e) => {
    e.stopPropagation();
    if (!id) return;
    if (!startedRef.current) {
      startedRef.current = true;
      if (ready) doPlay();
      return;
    }
    if (on) { cmd("mute"); setOn(false); }
    else    { cmd("unMute"); cmd("playVideo"); setOn(true); }
  }, [id, on, ready, doPlay, cmd]);

  // iframe: load với mute=1 để vượt autoplay policy
  // playsinline=1 quan trọng cho iOS
  const ifrSrc = id
    ? `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&controls=0&enablejsapi=1&playsinline=1&rel=0`
    : "";

  return(<>
    {id && (
      <iframe ref={ifrRef} src={ifrSrc} onLoad={onLoad}
        allow="autoplay; encrypted-media; picture-in-picture"
        allowFullScreen={false} title="music"
        style={{position:"fixed",top:"-9999px",left:"-9999px",width:"1px",height:"1px",opacity:0,pointerEvents:"none",border:"none"}}/>
    )}
    <button id="aud" className={on?"on":""} onClick={toggle} aria-label={on?"Tắt nhạc":"Bật nhạc"}>
      {on?(
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
          <rect x="2" y="10" width="3" height="10" rx="1.5" fill="rgba(255,210,210,.9)">
            <animate attributeName="height" values="10;18;6;14;10" dur=".8s" repeatCount="indefinite"/>
            <animate attributeName="y" values="10;6;14;8;10" dur=".8s" repeatCount="indefinite"/>
          </rect>
          <rect x="7" y="7" width="3" height="13" rx="1.5" fill="rgba(255,210,210,.9)">
            <animate attributeName="height" values="13;6;18;10;13" dur=".8s" begin=".1s" repeatCount="indefinite"/>
            <animate attributeName="y" values="7;14;5;10;7" dur=".8s" begin=".1s" repeatCount="indefinite"/>
          </rect>
          <rect x="12" y="5" width="3" height="15" rx="1.5" fill="rgba(255,210,210,.9)">
            <animate attributeName="height" values="15;10;20;8;15" dur=".8s" begin=".2s" repeatCount="indefinite"/>
            <animate attributeName="y" values="5;10;3;12;5" dur=".8s" begin=".2s" repeatCount="indefinite"/>
          </rect>
          <rect x="17" y="8" width="3" height="12" rx="1.5" fill="rgba(255,210,210,.9)">
            <animate attributeName="height" values="12;18;7;15;12" dur=".8s" begin=".15s" repeatCount="indefinite"/>
            <animate attributeName="y" values="8;4;13;7;8" dur=".8s" begin=".15s" repeatCount="indefinite"/>
          </rect>
        </svg>
      ):(
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
          <path d="M9 18V5l12-2v13" stroke="rgba(240,190,190,.8)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="6" cy="18" r="3" fill="rgba(240,190,190,.8)"/>
          <circle cx="18" cy="16" r="3" fill="rgba(240,190,190,.8)"/>
        </svg>
      )}
    </button>
  </>);
}

// ── Split text ──
function Split({text,style={},className=""}) {
  const ref=useRef(null);const [vis,setVis]=useState(false);
  const chars=Array.from(String(text||""));const mid=Math.floor(chars.length/2);
  useEffect(()=>{
    const el=ref.current;if(!el)return;
    const obs=new IntersectionObserver(([e])=>{if(e.isIntersecting){setVis(true);obs.disconnect();}},{root:null,threshold:0.08,rootMargin:"0px 0px -5% 0px"});
    obs.observe(el);return()=>obs.disconnect();
  },[]);
  return(
    <span ref={ref} style={{display:"inline-flex",flexWrap:"nowrap",whiteSpace:"pre",...style}}
      className={`${className}${vis?" spl-on":""}`}>
      {chars.map((ch,i)=>{const isL=i<mid;const dist=Math.abs(i-mid);
        return <span key={i} className={`sc ${isL?"sl":"sr"}`} style={{transitionDelay:`${(dist*.032).toFixed(3)}s`}}>{ch===" "?"\u00A0":ch}</span>;})}
    </span>
  );
}

// ── Reveal ──
function Rv({children,dir="u",delay=0,style={},className="",tag:Tag="div"}) {
  const ref=useRef(null);const [vis,setVis]=useState(false);
  useEffect(()=>{
    const el=ref.current;if(!el)return;
    const obs=new IntersectionObserver(([e])=>{if(e.isIntersecting){setVis(true);obs.disconnect();}},{root:null,threshold:0.06,rootMargin:"0px 0px -5% 0px"});
    obs.observe(el);return()=>obs.disconnect();
  },[]);
  const dm={u:"translateY(48px)",l:"translateX(-52px)",r:"translateX(52px)",s:"scale(.84)",f:"none"};
  return(
    <Tag ref={ref} className={className}
      style={{opacity:vis?1:0,transform:vis?"none":(dm[dir]||"translateY(48px)"),
        transition:`opacity .88s cubic-bezier(.22,1,.36,1) ${delay}s,transform .88s cubic-bezier(.22,1,.36,1) ${delay}s`,...style}}>
      {children}
    </Tag>
  );
}

// ══════════════════════════════════════════════
// PHOTO COMPONENT — drag to pan (kéo để chọn vùng)
// ══════════════════════════════════════════════
function Photo({url, pos="50% 50%", shape="soft", style={}, className="", onClick}) {
  const src=gd(url);
  const shapeClass={soft:"round-soft",art:"round-art",wave:"round-wave",circle:"round-circle",none:"round-none"}[shape]||"round-soft";
  if(!src)return(
    <div className={`pf ${shapeClass} ${className}`}
      style={{backgroundColor:"#c4a0a0",display:"flex",alignItems:"center",justifyContent:"center",...style}} onClick={onClick}>
      <span style={{fontSize:"1.5rem",opacity:.35}}>🖼</span>
    </div>
  );
  return(
    <div className={`pf ${shapeClass} ${className}`} style={style} onClick={onClick}>
      <img src={src} alt="" style={{objectPosition:pos}}
        onError={e=>{e.target.style.display="none";e.target.parentElement.style.background="#c4a0a0";}}/>
    </div>
  );
}

// ── Calendar tự động theo ngày ──
function Cal({dateStr="26.04.2026"}) {
  const cal=buildCalendar(dateStr);
  if(!cal)return null;
  const {day,month,year,firstDay,daysInMonth}=cal;
  const cells=[];
  for(let i=0;i<firstDay;i++)cells.push(null);
  for(let i=1;i<=daysInMonth;i++)cells.push(i);
  while(cells.length%7!==0)cells.push(null);
  const MONTHS=["Tháng 1","Tháng 2","Tháng 3","Tháng 4","Tháng 5","Tháng 6","Tháng 7","Tháng 8","Tháng 9","Tháng 10","Tháng 11","Tháng 12"];
  return(
    <div>
      {/* Banner tháng */}
      <div style={{background:"linear-gradient(90deg,#3d0e0e,#631717,#3d0e0e)",padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <p style={{fontSize:"21px",fontFamily:"'Cinzel',serif",fontWeight:600,color:"#fde8e8",letterSpacing:".07em"}}>{MONTHS[month-1]}</p>
        <p style={{fontSize:"12px",fontFamily:"'Quicksand',sans-serif",fontWeight:600,letterSpacing:".2em",color:"rgba(253,232,232,.72)"}}>{year}</p>
      </div>
      {/* Grid */}
      <div style={{padding:"12px 14px"}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",textAlign:"center",fontWeight:700,color:"#631717",marginBottom:"8px",fontSize:"11px",fontFamily:"'Quicksand',sans-serif"}}>
          {["CN","T2","T3","T4","T5","T6","T7"].map(w=><span key={w}>{w}</span>)}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:"3px"}}>
          {cells.map((d,i)=>(
            <div key={i} className={`cal-d${d===day?" sp":""}${d&&[0,6].includes(i%7)?" wk":""}`}>{d||""}</div>
          ))}
        </div>
        <div style={{textAlign:"center",marginTop:"7px",fontSize:".9rem",color:"#9a2a2a",animation:"floatY 3s ease-in-out infinite"}}>♥</div>
      </div>
    </div>
  );
}

const nl=txt=>String(txt||"").split("\n").map((l,i,a)=><span key={i}>{l}{i<a.length-1&&<br/>}</span>);

// ── Lightbox ──
function Lightbox({imgs,cur,onClose,onNav}) {
  useEffect(()=>{
    const fn=e=>{if(e.key==="Escape")onClose();if(e.key==="ArrowLeft")onNav(-1);if(e.key==="ArrowRight")onNav(1);};
    document.addEventListener("keydown",fn);return()=>document.removeEventListener("keydown",fn);
  },[onClose,onNav]);
  if(cur<0||!imgs[cur])return null;
  return(
    <div id="lb" className="open" onClick={onClose}>
      <img src={gd(imgs[cur].url)} alt={imgs[cur].caption||""} onClick={e=>e.stopPropagation()}/>
      {imgs[cur].caption&&<div id="lb-cap">{imgs[cur].caption}</div>}
      <button id="lb-cl" onClick={onClose}>ESC ✕</button>
      {imgs.length>1&&<>
        <button id="lb-pv" onClick={e=>{e.stopPropagation();onNav(-1);}}>‹</button>
        <button id="lb-nx" onClick={e=>{e.stopPropagation();onNav(1);}}>›</button>
      </>}
    </div>
  );
}

// ── RSVP Form ──
function RSVPForm({d}) {
  const [name,setName]=useState("");const [att,setAtt]=useState("yes");
  const [guests,setGuests]=useState(1);const [msg,setMsg]=useState("");
  const [loading,setL]=useState(false);const [done,setDone]=useState(false);const [err,setErr]=useState("");
  const submit=async()=>{
    if(!name.trim()){setErr("Vui lòng nhập tên");return;}
    setL(true);setErr("");
    if(sb){const{error}=await sb.from("rsvp_responses").insert({name:name.trim(),attending:att==="yes",guests_count:att==="yes"?guests:0,message:msg||null});
      if(error){setErr(error.message);setL(false);return;}}
    setDone(true);setL(false);
  };
  if(done)return(
    <div style={{padding:"1rem",background:"#fdf0f0",borderRadius:"8px",textAlign:"center"}}>
      <p style={{fontSize:"1.5rem"}}>{att==="yes"?"🎉":"💌"}</p>
      <p style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:"15px",color:"#631717",lineHeight:1.65,marginTop:"6px",whiteSpace:"pre-line"}}>
        {att==="yes"?`Cảm ơn ${name}!\nHẹn gặp bạn ngày ${d.wedding_date} ♥`:`Cảm ơn ${name}!\nRất tiếc khi bạn không thể đến.`}
      </p>
    </div>
  );
  return(<>
    <p style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:"19px",fontWeight:700,color:"#631717",textAlign:"center",marginBottom:"13px"}}>Xác Nhận Tham Dự</p>
    <label style={{display:"block",fontSize:"11px",fontWeight:600,color:"#444",marginBottom:"3px"}}>Họ và tên</label>
    <input className="rv-in" value={name} placeholder="Nhập tên của bạn" maxLength={80}
      onChange={e=>{setName(e.target.value);setErr("");}} onKeyDown={e=>e.key==="Enter"&&submit()}/>
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
      style={{background:"linear-gradient(135deg,#3d0e0e,#631717)",color:"#fff",border:"none",padding:"9px",borderRadius:"6px",fontSize:"11px",fontWeight:700,letterSpacing:".18em",textTransform:"uppercase",width:"100%",cursor:"pointer",fontFamily:"'Quicksand',sans-serif",opacity:loading?.6:1}}>
      {loading?"Đang gửi...":"Gửi xác nhận ♥"}
    </button>
  </>);
}

// ═══════════════════════════════════════════════════
// RSVP LIVE TICKER — Fixed bottom 20vh
// Cuộn từng hàng lên liên tục, hiện đầy đủ nội dung
// ═══════════════════════════════════════════════════
function RSVPFeed() {
  const [items, setItems] = useState([]);
  const innerRef = useRef(null);
  const rafRef   = useRef(null);
  const posRef   = useRef(0);
  const SPEED    = 0.45; // px/frame

  const DEMOS = [
    {id:"d1",name:"Nguyễn Thị Lan",  attending:true, guests_count:2, message:"Chúc mừng hạnh phúc! Mong hai bạn luôn yêu thương nhau 🌹"},
    {id:"d2",name:"Trần Văn Minh",   attending:true, guests_count:3, message:"Trăm năm hạnh phúc, vạn sự như ý!"},
    {id:"d3",name:"Lê Thị Hoa",      attending:false,guests_count:0, message:"Rất tiếc không đến được, chúc hai bạn mãi hạnh phúc"},
    {id:"d4",name:"Phạm Đức Anh",    attending:true, guests_count:2, message:"Chúc mừng đám cưới, hạnh phúc bên nhau trọn đời"},
    {id:"d5",name:"Võ Thị Mai",      attending:true, guests_count:4, message:"Hạnh phúc mãi mãi nha, love you both ❤️"},
    {id:"d6",name:"Đặng Quốc Hùng",  attending:true, guests_count:2, message:"Chúc đám cưới vui vẻ và tràn đầy yêu thương"},
    {id:"d7",name:"Phùng Thị Thanh", attending:true, guests_count:3, message:"Rất vui khi được tham dự ngày trọng đại này"},
    {id:"d8",name:"Ngô Minh Tuấn",   attending:true, guests_count:1, message:"Chúc mừng! Cầu mong cuộc hôn nhân đầy niềm vui"},
  ];

  useEffect(() => {
    if (!sb) { setItems(DEMOS); return; }
    sb.from("rsvp_responses")
      .select("*").order("created_at",{ascending:true}).limit(50)
      .then(({data}) => { setItems(data && data.length >= 3 ? data : DEMOS); });
    const ch = sb.channel("rsvp_tk4")
      .on("postgres_changes",{event:"INSERT",schema:"public",table:"rsvp_responses"},(p) => {
        setItems(prev => [...prev, p.new]);
      }).subscribe();
    return () => sb.removeChannel(ch);
  }, []);

  // RAF cuộn — chạy sau khi items render xong
  useEffect(() => {
    if (!items.length) return;
    const el = innerRef.current;
    if (!el) return;

    // Reset về đầu
    posRef.current = 0;
    el.style.transform = "translateY(0px)";

    const animate = () => {
      const halfH = el.scrollHeight / 2; // items nhân đôi → scroll đúng 1/2
      posRef.current += SPEED;
      if (posRef.current >= halfH) {
        posRef.current -= halfH; // giật lùi chính xác 1 chu kỳ → liền mạch
      }
      el.style.transform = `translateY(-${posRef.current.toFixed(2)}px)`;
      rafRef.current = requestAnimationFrame(animate);
    };

    const t = setTimeout(() => {
      rafRef.current = requestAnimationFrame(animate);
    }, 600);

    return () => {
      clearTimeout(t);
      cancelAnimationFrame(rafRef.current);
    };
  }, [items]);

  const getInit = n => n ? n.trim()[0].toUpperCase() : "?";

  if (!items.length) return null;

  // Nhân đôi để loop liền mạch (khi cuộn hết nửa đầu = quay lại đúng nửa sau)
  const belt = [...items, ...items];

  return (
    <div id="live-ticker">
      <div className="tk-bg"/>
      <div className="tk-border"/>
      <div className="tk-fade"/>

      {/* Header LIVE */}
      <div className="tk-header">
        <div className="tk-dot"/>
        <span className="tk-lbl">LIVE · Xác nhận tham dự</span>
        <span className="tk-count">{items.length} người</span>
      </div>

      {/* Vùng cuộn */}
      <div className="tk-scroll">
        <div ref={innerRef} className="tk-inner">
          {belt.map((r, i) => (
            <div key={`${r.id||i}-${i}`} className="tk-row">
              <div className="tk-av">{getInit(r.name)}</div>
              <span className="tk-name">{r.name}</span>
              <span className={`tk-badge ${r.attending ? "yes" : "no"}`}>
                {r.attending ? `♥ ${r.guests_count || 1} người` : "✗ Vắng"}
              </span>
              {r.message && (
                <span className="tk-msg">— {r.message}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
// ═══════════════════════════════════════════════════
// COMMENT BOX — Ô bình luận kiểu livestream
// Nằm trong phần RSVP của thiệp
// ═══════════════════════════════════════════════════
function CommentBox() {
  const [comments, setCmts] = useState([]);
  const [name,     setName] = useState("");
  const [text,     setText] = useState("");
  const [sending,  setSend] = useState(false);
  const listRef = useRef(null);

  const DEMO_CMTS = [
    {id:"c1", name:"Minh Anh",    attending:true,  message:"Chúc mừng! Rất vui được tham dự ❤️",    created_at: new Date(Date.now()-600000).toISOString()},
    {id:"c2", name:"Quốc Bảo",   attending:true,  message:"Chúc đôi bạn trăm năm hạnh phúc!",      created_at: new Date(Date.now()-400000).toISOString()},
    {id:"c3", name:"Thu Hằng",   attending:false, message:"Tiếc quá, mình không đến được rồi 😢",   created_at: new Date(Date.now()-200000).toISOString()},
    {id:"c4", name:"Thanh Tùng", attending:true,  message:"Sẽ đến sớm! Hóng tiệc cưới 🎉",         created_at: new Date(Date.now()-60000).toISOString()},
  ];

  // Load + realtime
  useEffect(() => {
    if (!sb) { setCmts(DEMO_CMTS); return; }
    sb.from("rsvp_responses")
      .select("*").order("created_at", {ascending:true}).limit(30)
      .then(({data}) => { setCmts(data && data.length ? data : DEMO_CMTS); });
    const ch = sb.channel("cmt_box_v1")
      .on("postgres_changes", {event:"INSERT", schema:"public", table:"rsvp_responses"}, (p) => {
        setCmts(prev => [...prev, p.new]);
      }).subscribe();
    return () => sb.removeChannel(ch);
  }, []);

  // Auto scroll xuống khi có comment mới
  useEffect(() => {
    const el = listRef.current;
    if (el) {
      // Smooth scroll chỉ khi gần cuối
      const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 60;
      if (nearBottom) el.scrollTop = el.scrollHeight;
    }
  }, [comments]);

  const send = async () => {
    const n = name.trim();
    const t = text.trim();
    if (!n) { alert("Vui lòng nhập tên"); return; }
    if (!t) { alert("Vui lòng nhập bình luận"); return; }
    setSend(true);
    // Thêm vào local ngay (optimistic)
    const newCmt = {
      id: `local-${Date.now()}`,
      name: n, attending: true, guests_count: 1, message: t,
      created_at: new Date().toISOString()
    };
    setCmts(prev => [...prev, newCmt]);
    setText("");
    // Lưu Supabase
    if (sb) {
      await sb.from("rsvp_responses").insert({
        name: n, attending: true, guests_count: 1, message: t
      }).catch(() => {});
    }
    setSend(false);
  };

  const relTime = ts => {
    const d = Date.now() - new Date(ts).getTime();
    if (d < 60000)    return "vừa xong";
    if (d < 3600000)  return `${Math.floor(d/60000)} phút trước`;
    if (d < 86400000) return `${Math.floor(d/3600000)} giờ trước`;
    return `${Math.floor(d/86400000)} ngày trước`;
  };

  const getInit = n => n ? n.trim()[0].toUpperCase() : "?";

  return (
    <div className="cmtbox">
      {/* Header */}
      <div className="cmtbox-header">
        <div className="cmt-hdr-dot"/>
        <span className="cmt-hdr-txt">💬 Lời chúc &amp; Bình luận</span>
        <span className="cmt-hdr-cnt">{comments.length}</span>
      </div>

      {/* Danh sách */}
      <div className="cmt-list" ref={listRef}>
        {comments.map((r, i) => (
          <div key={r.id || i} className="cmt-item">
            <div className="cmt-av">{getInit(r.name)}</div>
            <div className="cmt-body">
              <div className="cmt-meta">
                <span className="cmt-name">{r.name}</span>
                <span className={`cmt-badge ${r.attending ? "yes" : "no"}`}>
                  {r.attending ? `♥ ${r.guests_count||1} người` : "✗ Vắng"}
                </span>
              </div>
              {r.message && <div className="cmt-text">{r.message}</div>}
              <div className="cmt-time">{relTime(r.created_at)}</div>
            </div>
          </div>
        ))}
        {comments.length === 0 && (
          <div style={{padding:"2rem",textAlign:"center",color:"#ccc",fontSize:"12px",fontStyle:"italic"}}>
            Hãy là người đầu tiên gửi lời chúc! ♥
          </div>
        )}
      </div>

      {/* Input */}
      <div className="cmt-input-wrap">
        <input
          className="cmt-name-inp"
          value={name} placeholder="Tên bạn..."
          maxLength={30}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()}
        />
        <input
          className="cmt-text-inp"
          value={text} placeholder="Gửi lời chúc..."
          maxLength={150}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()}
        />
        <button className="cmt-send-btn" onClick={send} disabled={sending} title="Gửi">
          {sending ? "⏳" : "➤"}
        </button>
      </div>
    </div>
  );
}

// Flower deco
const FL="https://assets.cinelove.me/templates/assets/efd815e3-41ff-4eb3-b31b-c25b202bc08c/016b5d70-8d6b-4f3c-b16c-2d93e447544c.png";
function Fl({top,left,w,h,rot,op=0.2}) {
  return <div style={{position:"absolute",top,left,width:w,height:h,
    backgroundImage:`url(${FL})`,backgroundSize:"cover",backgroundPosition:"center",
    transform:`rotate(${rot}deg)`,opacity:op,filter:"hue-rotate(0deg) saturate(.5) sepia(.3) brightness(1.1)",pointerEvents:"none",zIndex:0}}/>;
}

function QB({text,fontSize=17,style={}}) {
  return(
    <div style={{background:"rgba(0,0,0,.55)",backdropFilter:"blur(3px)",borderRadius:"6px",padding:"10px 14px",...style}}>
      <p className="on-photo" style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",color:"rgba(255,230,230,.97)",textAlign:"center",lineHeight:1.65,fontSize,whiteSpace:"pre-line"}}>{text}</p>
    </div>
  );
}

// ══════════════════════════════════════════════
// MAIN
// ══════════════════════════════════════════════
export default function WeddingApp() {
  const [d,setD]=useState(DEF);
  const [lbCur,setLbCur]=useState(-1);
  const [lbImgs,setLbImgs]=useState([]);

  // Tự động tính thứ từ ngày
  const weddingDay=getWeekday(d.wedding_date)||d.wedding_day;
  const cd=useCd(d.wedding_date);

  // Format ngày hiển thị đẹp: "DD . MM . YYYY"
  const fmtDate=(str)=>{
    if(!str)return str;
    const p=str.split(".");
    return p.length===3?`${p[0]} . ${p[1]} . ${p[2]}`:str;
  };

  // Load Supabase
  useEffect(()=>{
    if(!sb)return;
    sb.from("wedding_config").select("*").eq("id",1).single().then(({data})=>{
      if(!data)return;
      let gal=data.gallery;
      if(typeof gal==="string"){try{gal=JSON.parse(gal);}catch{gal=[];}}
      setD({...DEF,...data,gallery:Array.isArray(gal)?gal:[]});
    });
  },[]);

  // ── AUTO SCROLL — không giật, mobile + desktop ──
  useEffect(()=>{
    const pw = document.getElementById("pw");
    const sh = document.getElementById("sh");
    if (!pw) return;

    const SPEED    = 0.6;   // px/frame
    const RESUME   = 3000;  // ms resume sau khi user dừng
    const START_MS = 2000;  // ms delay trước khi bắt đầu

    let raf       = null;
    let running   = false;
    let paused    = false;
    let resumeTmr = null;

    // Mobile: #pw overflow:visible → scroll bằng window
    const isMob = () => window.innerWidth <= 460;
    const getTop = () => isMob() ? window.scrollY : pw.scrollTop;
    const getMax = () => isMob()
      ? document.documentElement.scrollHeight - window.innerHeight
      : pw.scrollHeight - pw.clientHeight;
    const doScroll = (n) => {
      if (isMob()) window.scrollBy(0, n);
      else pw.scrollTop += n;
    };

    // ── RAF loop ──
    const loop = () => {
      if (!running) return;
      if (!paused) {
        doScroll(SPEED);
        if (getTop() >= getMax() - 1) { running = false; return; }
      }
      raf = requestAnimationFrame(loop);
    };

    // ── Pause / Resume ──
    const pause = (hideHint = false) => {
      paused = true;
      if (hideHint && sh) sh.classList.add("gone");
      clearTimeout(resumeTmr);
      resumeTmr = setTimeout(() => { paused = false; }, RESUME);
    };
    const hardPause = () => {   // dừng hẳn, ko tự resume
      paused = true;
      clearTimeout(resumeTmr);
      if (sh) sh.classList.add("gone");
    };
    const hardResume = () => {  // resume thủ công
      paused = false;
    };

    // ── DESKTOP: wheel ──
    // Chỉ pause khi wheel, KHÔNG listen scroll event
    // (scroll event sẽ fire cả khi code tự scroll → giật)
    const onWheel = () => pause(true);

    // ── DESKTOP: keyboard (PageDown, Space, Arrow) ──
    const onKey = (e) => {
      const keys = ["ArrowDown","ArrowUp","PageDown","PageUp","Space"," "];
      if (keys.includes(e.key)) pause(false);
    };

    // ── MOBILE: touch ──
    let ty0 = 0;
    const onTS = (e) => { ty0 = e.touches[0].clientY; };
    const onTM = (e) => {
      if (Math.abs(e.touches[0].clientY - ty0) > 8) pause(true);
    };
    const onTE = () => {
      // Touch end → resume sau RESUME ms (đã set trong pause)
    };

    // ── Scroll hint ──
    // Chỉ ẩn hint bằng cách track scrollTop thủ công trong loop
    // (không dùng scroll event)
    let hintHidden = false;
    const origLoop = loop;
    const wrappedLoop = () => {
      if (!hintHidden && sh && getTop() > 80) {
        sh.classList.add("gone");
        hintHidden = true;
      }
      origLoop(); // gọi loop thật
    };

    // Thêm listeners — KHÔNG có scroll event listener
    pw.addEventListener("wheel",          onWheel, { passive: true });
    window.addEventListener("keydown",    onKey,   { passive: true });
    window.addEventListener("touchstart", onTS,    { passive: true });
    window.addEventListener("touchmove",  onTM,    { passive: true });
    window.addEventListener("touchend",   onTE,    { passive: true });

    const startTmr = setTimeout(() => {
      running = true;
      raf = requestAnimationFrame(wrappedLoop);
    }, START_MS);

    return () => {
      clearTimeout(startTmr);
      clearTimeout(resumeTmr);
      cancelAnimationFrame(raf);
      running = false;
      pw.removeEventListener("wheel",          onWheel);
      window.removeEventListener("keydown",    onKey);
      window.removeEventListener("touchstart", onTS);
      window.removeEventListener("touchmove",  onTM);
      window.removeEventListener("touchend",   onTE);
    };
  },[]);

  // Trigger reveal ban đầu
  useEffect(()=>{
    const t=setTimeout(()=>{const vh=window.innerHeight;document.querySelectorAll(".rv:not(.show)").forEach(el=>{if(el.getBoundingClientRect().top<vh*1.05)el.classList.add("show");});},250);
    return()=>clearTimeout(t);
  },[]);

  const openLb=useCallback((imgs,i)=>{setLbImgs(imgs);setLbCur(i);},[]);
  const closeLb=useCallback(()=>setLbCur(-1),[]);
  const navLb=useCallback(dir=>setLbCur(c=>(c+dir+lbImgs.length)%lbImgs.length),[lbImgs.length]);
  const galArr=Array.isArray(d.gallery)?d.gallery:[];

  // Shorthands
  const P=(props)=><Photo {...props}/>;

  return(<>
    <GS/><Particles/>
    <Music url={d.music_youtube}/>
    <div id="sh"><span className="sh-t">Kéo xuống</span><div className="sh-m"/></div>
    <div id="pw">

      {/* ═══ COVER ═══ */}
      <div style={{position:"relative",width:"100%",height:"490px",overflow:"hidden",background:"linear-gradient(148deg,#3d0e0e 0%,#631717 50%,#2a0808 100%)"}}>
        <div style={{position:"absolute",inset:0,opacity:.05,backgroundImage:"repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 0,transparent 50%)",backgroundSize:"15px 15px"}}/>
        <Fl top={-30} left={-90} w={280} h={370} rot={14} op={0.2}/>
        <Rv dir="u" delay={0} style={{position:"absolute",bottom:0,left:16,width:"262px",height:"440px",zIndex:1}}>
          <Photo url={d.hero_img} pos={d.hero_pos} shape={d.hero_shape||"wave"}
            style={{width:"100%",height:"100%",WebkitMaskImage:"linear-gradient(180deg,black 58%,transparent 100%)",maskImage:"linear-gradient(180deg,black 58%,transparent 100%)"}}/>
        </Rv>
        <Rv dir="r" delay={0.15} style={{position:"absolute",top:24,left:0,width:"130px",height:"165px",backgroundImage:"url('https://assets.cinelove.me/templates/assets/efd815e3-41ff-4eb3-b31b-c25b202bc08c/1faee750-3c82-4fdb-badb-f258477bd1c4.png')",backgroundSize:"cover",opacity:.65,filter:"hue-rotate(0deg) saturate(.4) sepia(.4) brightness(1.2)",zIndex:2}}/>
        <Rv dir="u" delay={0} style={{position:"absolute",top:10,left:0,width:"100%",textAlign:"center",zIndex:3}}>
          <p style={{color:"rgba(255,210,210,.82)",fontSize:"11.5px",fontWeight:600,fontFamily:"'Quicksand',sans-serif",letterSpacing:".5em",textTransform:"uppercase"}}>SAVE THE DATE</p>
        </Rv>
        <Rv dir="l" delay={0.12} style={{position:"absolute",top:75,right:6,width:"162px",display:"flex",flexDirection:"column",alignItems:"center",gap:"5px",zIndex:3}}>
          <p style={{color:"rgba(255,210,210,.76)",fontSize:"11px",fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",letterSpacing:".06em",textAlign:"center",lineHeight:1.4}}>THƯ MỜI TIỆC CƯỚI</p>
          <p style={{color:"rgba(255,210,210,.68)",fontSize:"9.5px",fontWeight:600,letterSpacing:".25em",textTransform:"uppercase",fontFamily:"'Quicksand',sans-serif"}}>{weddingDay}</p>
          <p style={{color:"#f0c0c0",fontSize:"13.5px",fontWeight:600,fontFamily:"'Cinzel',serif",letterSpacing:".13em"}}>{fmtDate(d.wedding_date)}</p>
          <div style={{width:"85px",height:"1px",background:"rgba(255,200,200,.35)"}}/>
          <p style={{color:"rgba(255,210,210,.76)",fontSize:"11px",fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",letterSpacing:".06em",textAlign:"center",lineHeight:1.4,marginTop:"5px"}}>LỄ THÀNH HÔN</p>
          <p style={{color:"rgba(255,210,210,.68)",fontSize:"9.5px",fontWeight:600,letterSpacing:".25em",textTransform:"uppercase",fontFamily:"'Quicksand',sans-serif"}}>{weddingDay}</p>
          <p style={{color:"#f0c0c0",fontSize:"13.5px",fontWeight:600,fontFamily:"'Cinzel',serif",letterSpacing:".13em"}}>{fmtDate(d.wedding_date)}</p>
        </Rv>
        <Rv dir="l" delay={0.2} style={{position:"absolute",bottom:36,right:4,width:"170px",textAlign:"center",zIndex:3}}>
          <Split text={d.groom} style={{fontFamily:"'Dancing Script',cursive",fontWeight:700,fontSize:"29px",color:"#f0c0c0",lineHeight:1.1,textShadow:"0 2px 12px rgba(0,0,0,.5)",display:"block"}}/>
          <span style={{display:"block",fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:"14px",color:"rgba(255,190,190,.5)",margin:"2px 0"}}>&amp;</span>
          <Split text={d.bride} style={{fontFamily:"'Dancing Script',cursive",fontWeight:700,fontSize:"29px",color:"#f0c0c0",lineHeight:1.1,textShadow:"0 2px 12px rgba(0,0,0,.5)",display:"block"}}/>
        </Rv>
      </div>

      {/* ═══ PHỤ HUYNH ═══ */}
      <div style={{position:"relative",background:"#fff",padding:"22px 16px 18px"}}>
        <div style={{position:"absolute",top:0,left:0,right:0,height:"3px",background:"linear-gradient(90deg,transparent,#631717,transparent)"}}/>
        <div style={{textAlign:"center",marginBottom:"10px"}}>
          <span style={{fontSize:"20px",color:"#7a1f1f",display:"inline-block",animation:"hBeat 2.8s ease-in-out infinite"}}>♥</span>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1px 1fr",gap:"0",marginBottom:"14px"}}>
          <Rv dir="r" delay={0} style={{padding:"0 10px 0 0",textAlign:"right"}}>
            <p style={{fontSize:"18px",fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",color:"#631717",marginBottom:"4px"}}>{d.parent_groom_label}</p>
            <p style={{fontSize:"11.5px",fontFamily:"'Quicksand',sans-serif",color:"#333",lineHeight:1.78}}>{nl(d.parent_groom_names)}</p>
            <p style={{fontSize:"9.5px",fontFamily:"'Quicksand',sans-serif",color:"#777",lineHeight:1.6,marginTop:"3px"}}>{nl(d.parent_groom_addr)}</p>
          </Rv>
          <Rv dir="u" delay={0.1} style={{alignSelf:"stretch"}}><div style={{width:"1px",height:"100%",background:"#9a2a2a",margin:"0 auto"}}/></Rv>
          <Rv dir="l" delay={0} style={{padding:"0 0 0 10px"}}>
            <p style={{fontSize:"18px",fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",color:"#631717",marginBottom:"4px"}}>{d.parent_bride_label}</p>
            <p style={{fontSize:"11.5px",fontFamily:"'Quicksand',sans-serif",color:"#333",lineHeight:1.78}}>{nl(d.parent_bride_names)}</p>
            <p style={{fontSize:"9.5px",fontFamily:"'Quicksand',sans-serif",color:"#777",lineHeight:1.6,marginTop:"3px"}}>{nl(d.parent_bride_addr)}</p>
          </Rv>
        </div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:"8px"}}>
          <Split text={d.groom} style={{fontFamily:"'Dancing Script',cursive",fontWeight:700,fontSize:"26px",color:"#631717",textShadow:"0 1px 5px rgba(99,23,23,.18)"}} className="rv rr d3"/>
          <span style={{fontSize:"16px",color:"#9a2a2a",fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic"}}>♥</span>
          <Split text={d.bride} style={{fontFamily:"'Dancing Script',cursive",fontWeight:700,fontSize:"26px",color:"#631717",textShadow:"0 1px 5px rgba(99,23,23,.18)"}} className="rv rl d3"/>
        </div>
      </div>

      {/* ═══ THƯ MỜI + ẢNH ═══ */}
      <div style={{position:"relative",background:"#fdf7f7",padding:"22px 18px 20px"}}>
        <div style={{position:"absolute",top:0,left:0,right:0,height:"3px",background:"linear-gradient(90deg,transparent,#631717,transparent)"}}/>
        <div style={{textAlign:"center",marginBottom:"12px"}}>
          <Rv dir="u" delay={0}><span style={{display:"inline-block",borderTop:"1px solid rgba(99,23,23,.4)",paddingTop:"7px",fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:"27px",color:"#631717"}}>{d.sec_invite_title}</span></Rv>
          <Rv dir="u" delay={0.1}><p style={{fontSize:"10px",fontWeight:700,letterSpacing:".18em",textTransform:"uppercase",color:"#444",fontFamily:"'Quicksand',sans-serif",marginTop:"4px"}}>{d.sec_invite_sub}</p></Rv>
        </div>
        <Rv dir="s" delay={0.1}>
          <Photo url={d.couple_img} pos={d.couple_pos} shape={d.couple_shape||"art"}
            style={{width:"220px",height:"220px",margin:"0 auto 14px",display:"block",boxShadow:"0 8px 28px rgba(99,23,23,.3)"}}/>
        </Rv>
        <Rv dir="u" delay={0.15}><p style={{fontSize:"11.5px",fontFamily:"'Quicksand',sans-serif",fontWeight:500,color:"#444",lineHeight:1.88,textAlign:"center"}}>{nl(d.sec_invite_body)}</p></Rv>
      </div>

      {/* ═══ NGÀY GIỜ ĐỊA ĐIỂM ═══ */}
      <div style={{position:"relative",background:"#fff",padding:"22px 18px 20px",textAlign:"center"}}>
        <div style={{position:"absolute",top:0,left:0,right:0,height:"3px",background:"linear-gradient(90deg,transparent,#631717,transparent)"}}/>
        <Rv dir="u" delay={0}><p style={{fontSize:"13.5px",fontWeight:500,color:"#444",fontFamily:"'Quicksand',sans-serif",marginBottom:"8px"}}>Vào Lúc</p></Rv>
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:"0",marginBottom:"8px"}}>
          <Rv dir="r" delay={0.1}><p style={{fontSize:"18px",fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",color:"#631717",width:"82px",textAlign:"center"}}>{d.wedding_time}</p></Rv>
          <Rv dir="u" delay={0.05}><p style={{fontSize:"21px",fontFamily:"'Cinzel',serif",fontWeight:600,color:"#631717",borderLeft:"2.5px solid #9a2a2a",borderRight:"2.5px solid #9a2a2a",padding:"0 10px",letterSpacing:".06em"}}>{fmtDate(d.wedding_date)}</p></Rv>
          <Rv dir="l" delay={0.1}><p style={{fontSize:"18px",fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",color:"#631717",width:"82px",textAlign:"center"}}>{weddingDay}</p></Rv>
        </div>
        <Rv dir="u" delay={0.15}><p style={{fontSize:"11.5px",color:"#666",fontFamily:"'Quicksand',sans-serif",marginBottom:"8px"}}>{d.lunar_date}</p></Rv>
        <Rv dir="u" delay={0.18}><p style={{fontSize:"12px",fontWeight:700,color:"#333",fontFamily:"'Quicksand',sans-serif",marginBottom:"4px"}}>Tại</p></Rv>
        <Rv dir="u" delay={0.2}><p style={{fontFamily:"'Dancing Script',cursive",fontWeight:700,fontSize:"21px",color:"#631717",marginBottom:"3px"}}>{d.venue_name}</p></Rv>
        <Rv dir="u" delay={0.25}><p style={{fontSize:"11.5px",color:"#666",fontFamily:"'Quicksand',sans-serif",marginBottom:"12px"}}>{d.venue_address}</p></Rv>
        <Rv dir="s" delay={0.3}>
          <a href={d.venue_map_url||"#"} target="_blank" rel="noopener noreferrer"
            style={{display:"inline-block",background:"linear-gradient(135deg,#631717,#9a2a2a)",color:"#fff",fontSize:"10px",fontWeight:600,letterSpacing:".18em",textTransform:"uppercase",fontFamily:"'Quicksand',sans-serif",textDecoration:"none",padding:"7px 22px",boxShadow:"0 2px 10px rgba(99,23,23,.35)",borderRadius:"4px"}}>
            📍 Xem bản đồ
          </a>
        </Rv>
      </div>

      {/* ═══ 2 LỄ ═══ */}
      <div style={{position:"relative",background:"#fdf7f7",padding:"22px 16px 20px"}}>
        <div style={{position:"absolute",top:0,left:0,right:0,height:"3px",background:"linear-gradient(90deg,transparent,#631717,transparent)"}}/>
        <div style={{textAlign:"center",marginBottom:"14px"}}>
          <Rv dir="u" delay={0}><span style={{display:"inline-block",borderTop:"1px solid rgba(99,23,23,.4)",paddingTop:"7px",fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:"27px",color:"#631717"}}>{d.sec_cal_title}</span></Rv>
          <Rv dir="u" delay={0.1}><p style={{fontSize:"10px",fontWeight:700,letterSpacing:".18em",textTransform:"uppercase",color:"#444",fontFamily:"'Quicksand',sans-serif",marginTop:"4px"}}>{d.sec_cal_sub}</p></Rv>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr auto 1fr",gap:"0",marginBottom:"10px",alignItems:"start"}}>
          <Rv dir="r" delay={0.1}>
            <div style={{background:"linear-gradient(90deg,#631717,#9a2a2a)",padding:"6px 10px",marginBottom:"8px",borderRadius:"4px 0 0 4px"}}>
              <p style={{fontSize:"13px",fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",color:"#fde8e8"}}>{d.ceremony1_label}</p>
            </div>
            <div style={{borderLeft:"2px solid #9a2a2a",paddingLeft:"8px"}}>
              <p style={{fontSize:"11.5px",fontWeight:700,color:"#222",fontFamily:"'Quicksand',sans-serif"}}>{d.ceremony1_time}</p>
              <p style={{fontSize:"11.5px",fontWeight:700,color:"#222",fontFamily:"'Quicksand',sans-serif"}}>{fmtDate(d.ceremony1_date)}</p>
              <p style={{fontSize:"11px",color:"#666",fontFamily:"'Quicksand',sans-serif"}}>{d.ceremony1_lunar}</p>
              <p style={{fontSize:"11px",color:"#666",fontFamily:"'Quicksand',sans-serif"}}>{d.ceremony1_place}</p>
              <span style={{display:"inline-block",marginTop:"6px",background:"#631717",color:"#fff",fontSize:"11px",fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",padding:"2px 8px",borderRadius:"3px"}}>{d.ceremony1_addr}</span>
            </div>
          </Rv>
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",padding:"0 6px",fontSize:"22px",color:"rgba(154,42,42,.4)",animation:"floatY 3s ease-in-out infinite",alignSelf:"center"}}>♥</div>
          <Rv dir="l" delay={0.1}>
            <div style={{background:"linear-gradient(270deg,#631717,#9a2a2a)",padding:"6px 10px",marginBottom:"8px",textAlign:"right",borderRadius:"0 4px 4px 0"}}>
              <p style={{fontSize:"13px",fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",color:"#fde8e8"}}>{d.ceremony2_label}</p>
            </div>
            <div style={{borderRight:"2px solid #9a2a2a",paddingRight:"8px",textAlign:"right"}}>
              <p style={{fontSize:"11.5px",fontWeight:700,color:"#222",fontFamily:"'Quicksand',sans-serif"}}>{d.ceremony2_time}</p>
              <p style={{fontSize:"11.5px",fontWeight:700,color:"#222",fontFamily:"'Quicksand',sans-serif"}}>{fmtDate(d.ceremony2_date)}</p>
              <p style={{fontSize:"11px",color:"#666",fontFamily:"'Quicksand',sans-serif"}}>{d.ceremony2_lunar}</p>
              <p style={{fontSize:"11px",color:"#666",fontFamily:"'Quicksand',sans-serif"}}>{d.ceremony2_place}</p>
              <span style={{display:"inline-block",marginTop:"6px",background:"#631717",color:"#fff",fontSize:"11px",fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",padding:"2px 8px",borderRadius:"3px"}}>{d.ceremony2_addr}</span>
            </div>
          </Rv>
        </div>
      </div>

      {/* ═══ CALENDAR + COUNTDOWN ═══ */}
      <div style={{position:"relative",background:"#fff"}}>
        <div style={{position:"absolute",top:0,left:0,right:0,height:"3px",background:"linear-gradient(90deg,transparent,#631717,transparent)"}}/>
        <Rv dir="s" delay={0.1} style={{overflow:"hidden"}}><Cal dateStr={d.wedding_date}/></Rv>
        <div style={{display:"grid",gridTemplateColumns:"1fr auto"}}>
          <div/>
          <Rv dir="l" delay={0.15}>
            <div style={{background:"linear-gradient(180deg,#3d0e0e,#631717)",width:"58px",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"space-around",padding:"10px 4px",boxShadow:"-2px 0 10px rgba(0,0,0,.18)"}}>
              {cd.past
                ? <div style={{textAlign:"center",padding:"8px 0"}}><p style={{fontSize:"16px",color:"#fde8e8",fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",lineHeight:1.3}}>Ngày<br/>trọng<br/>đại! 🎉</p></div>
                : [{v:cd.d,l:"ngày"},{v:cd.h,l:"giờ"},{v:cd.m,l:"phút"},{v:cd.s,l:"giây"}].map(item=>(
                <div key={item.l} style={{textAlign:"center"}}>
                  <p style={{fontSize:"18px",fontWeight:700,fontFamily:"'Cinzel',serif",color:"#fff",lineHeight:1}}>{String(item.v??0).padStart(2,"0")}</p>
                  <p style={{fontSize:"7.5px",letterSpacing:".2em",color:"rgba(253,232,232,.75)",fontFamily:"'Quicksand',sans-serif",marginTop:"2px"}}>{item.l}</p>
                </div>
              ))}
            </div>
          </Rv>
        </div>
      </div>

      {/* ═══ ẢNH + QUOTES ═══ */}
      <div className="hdiv"/>
      <div style={{position:"relative",padding:"22px 18px 18px"}} className="sec-dark">
        <Fl top={-40} left={-160} w={370} h={520} rot={14} op={0.15}/>
        <Rv dir="u" delay={0.1} style={{position:"relative",zIndex:1,marginBottom:"14px"}}><QB text={d.quote1} fontSize={17}/></Rv>
        <Rv dir="u" delay={0.05} style={{position:"relative",zIndex:1}}>
          <Photo url={d.photo_large} pos={d.large_pos} shape={d.large_shape||"soft"} style={{width:"100%",height:"280px",boxShadow:"0 8px 28px rgba(0,0,0,.5)"}}/>
        </Rv>
      </div>
      <div className="hdiv"/>
      <div style={{padding:"18px"}} className="sec-mid">
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",alignItems:"center"}}>
          <Rv dir="r" delay={0.05}>
            <Photo url={d.photo_sm1} pos={d.sm1_pos} shape={d.sm1_shape||"wave"} style={{width:"100%",height:"210px",boxShadow:"0 6px 22px rgba(0,0,0,.5)"}}/>
          </Rv>
          <Rv dir="l" delay={0.1}><QB text={d.quote2} fontSize={15} style={{height:"100%",display:"flex",alignItems:"center",justifyContent:"center"}}/></Rv>
        </div>
      </div>
      <div style={{padding:"0 18px 14px"}} className="sec-night">
        <Rv dir="s" delay={0.05}>
          <Photo url={d.photo_wide1} pos={d.wide1_pos} shape={d.wide1_shape||"soft"} style={{width:"100%",height:"200px",boxShadow:"0 6px 22px rgba(0,0,0,.5)"}}/>
        </Rv>
      </div>
      <div className="hdiv"/>
      <div style={{position:"relative",padding:"18px"}} className="sec-dark">
        <Fl top={-60} left={-100} w={270} h={400} rot={12} op={0.14}/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",alignItems:"center"}}>
          <Rv dir="r" delay={0.1}><QB text={d.quote3} fontSize={15} style={{height:"100%",display:"flex",alignItems:"center",justifyContent:"center"}}/></Rv>
          <Rv dir="l" delay={0.05}>
            <Photo url={d.photo_sm2} pos={d.sm2_pos} shape={d.sm2_shape||"art"} style={{width:"100%",height:"210px",boxShadow:"0 6px 22px rgba(0,0,0,.5)"}}/>
          </Rv>
        </div>
      </div>
      <div style={{padding:"16px 18px 18px"}} className="sec-mid">
        <Rv dir="u" delay={0.05} style={{marginBottom:"12px"}}><QB text={d.quote4} fontSize={17}/></Rv>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px"}}>
          <Rv dir="r" delay={0.1}>
            <Photo url={d.photo_pair1} pos={d.pair1_pos} shape={d.pair1_shape||"soft"} style={{width:"100%",height:"215px",boxShadow:"0 6px 22px rgba(0,0,0,.5)"}}/>
          </Rv>
          <Rv dir="l" delay={0.15}>
            <Photo url={d.photo_pair2} pos={d.pair2_pos} shape={d.pair2_shape||"soft"} style={{width:"100%",height:"215px",boxShadow:"0 6px 22px rgba(0,0,0,.5)"}}/>
          </Rv>
        </div>
      </div>
      <div style={{padding:"14px 18px 18px"}} className="sec-dark">
        <Rv dir="s" delay={0.05} style={{marginBottom:"12px"}}>
          <Photo url={d.photo_wide2} pos={d.wide2_pos} shape={d.wide2_shape||"soft"} style={{width:"100%",height:"195px",boxShadow:"0 6px 22px rgba(0,0,0,.5)"}}/>
        </Rv>
        <Rv dir="u" delay={0.12}><QB text={d.quote5} fontSize={20}/></Rv>
      </div>

      {/* Gallery */}
      {galArr.length>0&&(<>
        <div className="hdiv"/>
        <div style={{padding:"14px 14px 16px"}} className="sec-night">
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px"}}>
            {galArr.map((img,i)=>(
              <Rv key={i} dir="s" delay={i*.06}
                style={{overflow:"hidden",cursor:"pointer",borderRadius:"12px",boxShadow:"0 4px 16px rgba(0,0,0,.45)"}}
                onClick={()=>openLb(galArr,i)}>
                <img src={gd(img.url)} alt={img.caption||""} loading="lazy"
                  style={{width:"100%",height:"165px",objectFit:"cover",display:"block",objectPosition:img.pos||"50% 50%",borderRadius:"12px",transition:"transform .6s ease"}}
                  onMouseEnter={e=>e.target.style.transform="scale(1.05)"}
                  onMouseLeave={e=>e.target.style.transform="scale(1)"}
                  onError={e=>{e.target.style.display="none";e.target.parentElement.style.background="#2a0808";}}/>
              </Rv>
            ))}
          </div>
        </div>
      </>)}

      {d.photo_full&&(<>
        <div className="hdiv"/>
        <div style={{position:"relative",overflow:"hidden"}}>
          <Photo url={d.photo_full} pos={d.full_pos} shape="none" style={{width:"100%",height:"340px"}}/>
          <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,.48)",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <p style={{fontFamily:"'Cinzel',serif",fontWeight:600,fontSize:"22px",color:"rgba(255,210,210,.2)",letterSpacing:".18em",textTransform:"uppercase",userSelect:"none"}}>LOVE</p>
          </div>
        </div>
      </>)}

      {/* ═══ MONG ═══ */}
      <div className="hdiv"/>
      <div style={{padding:"32px 28px",textAlign:"center",position:"relative"}} className="sec-night">
        <Fl top={-50} left={-80} w={260} h={355} rot={12} op={0.14}/>
        <Rv dir="u" delay={0.1} style={{position:"relative",zIndex:1}}>
          <p style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:"22px",color:"rgba(255,220,220,.92)",lineHeight:1.65,whiteSpace:"pre-line",textShadow:"0 1px 6px rgba(0,0,0,.5)"}}>{d.mong_text}</p>
        </Rv>
      </div>

      {/* ═══ RSVP FORM + LIVE FEED ═══ */}
      <div style={{position:"relative",background:"#fdf7f7",padding:"22px 18px 20px"}}>
        <div style={{position:"absolute",top:0,left:0,right:0,height:"3px",background:"linear-gradient(90deg,transparent,#631717,transparent)"}}/>
        <Rv dir="u" delay={0} style={{textAlign:"center",marginBottom:"14px"}}>
          <span style={{display:"inline-block",borderTop:"1px solid rgba(99,23,23,.4)",paddingTop:"7px",fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:"27px",color:"#631717"}}>Xác Nhận &amp; Chúc Mừng</span>
        </Rv>

        {/* Form gửi */}
        <Rv dir="s" delay={0.1}>
          <div style={{maxWidth:"310px",margin:"0 auto",background:"#fff",border:"1px solid #d4b8b8",borderRadius:"10px",padding:"18px",boxShadow:"0 4px 18px rgba(99,23,23,.12)"}}>
            <RSVPForm d={d}/>
          </div>
        </Rv>

        {/* Comment box — bên dưới form */}
        <Rv dir="u" delay={0.15} style={{marginTop:"14px"}}>
          <CommentBox/>
        </Rv>
      </div>

      {/* ═══ QR ═══ */}
      <div className="hdiv"/>
      <div style={{padding:"24px 14px 22px",textAlign:"center",position:"relative"}} className="sec-night">
        <Fl top={-60} left={-80} w={260} h={355} rot={12} op={0.14}/>
        <Rv dir="u" delay={0} style={{position:"relative",zIndex:1}}>
          <p style={{color:"rgba(255,200,200,.82)",fontSize:"12px",fontFamily:"'Quicksand',sans-serif",fontWeight:600,marginBottom:"10px",letterSpacing:".22em",textTransform:"uppercase"}}>✦ Hộp quà yêu thương ✦</p>
        </Rv>
        <div style={{fontSize:"58px",marginBottom:"6px",animation:"wobble 2.8s ease-in-out infinite",display:"inline-block",position:"relative",zIndex:1}}>🎁</div>
        <Rv dir="u" delay={0.1} style={{position:"relative",zIndex:1}}>
          <p style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",color:"rgba(255,210,210,.88)",fontSize:"22px",marginBottom:"16px",lineHeight:1.3}}>Mừng cưới qua QR</p>
        </Rv>
        <Rv dir="u" delay={0.15} style={{position:"relative",zIndex:1}}>
          <div style={{display:"flex",gap:"12px",justifyContent:"center",flexWrap:"wrap"}}>
            {[
              {lbl:"Chú Rể",bank:d.qr_groom_bank,num:d.qr_groom_num,name:d.qr_groom_name,img:d.qr_groom_img},
              {lbl:"Cô Dâu",bank:d.qr_bride_bank,num:d.qr_bride_num,name:d.qr_bride_name,img:d.qr_bride_img},
            ].map(qr=>(
              <div key={qr.lbl} style={{background:"rgba(255,255,255,.07)",border:"1px solid rgba(255,200,200,.22)",borderRadius:"10px",padding:"13px",textAlign:"center",flex:1,maxWidth:"185px"}}>
                <p style={{color:"rgba(255,200,200,.72)",fontSize:"8.5px",letterSpacing:".25em",textTransform:"uppercase",marginBottom:"4px",fontFamily:"'Quicksand',sans-serif"}}>{qr.lbl}</p>
                <p style={{color:"rgba(255,220,220,.88)",fontSize:"10px",fontFamily:"'Quicksand',sans-serif",marginBottom:"2px"}}>{qr.bank}</p>
                <p style={{color:"#f0c0c0",fontSize:"12.5px",fontFamily:"'Cinzel',serif",marginBottom:"2px"}}>{qr.num}</p>
                <p style={{color:"rgba(255,200,200,.6)",fontSize:"8.5px",fontFamily:"'Quicksand',sans-serif",marginBottom:"8px"}}>{qr.name}</p>
                <div style={{width:"105px",height:"105px",margin:"0 auto",background:"#fff",borderRadius:"6px",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden"}}>
                  {gd(qr.img)?<img src={gd(qr.img)} alt="QR" style={{width:"100%",height:"100%",objectFit:"contain"}}/>:<span style={{fontSize:"8.5px",color:"#999"}}>QR Code</span>}
                </div>
              </div>
            ))}
          </div>
        </Rv>
      </div>

      <div style={{background:"#110404",padding:"14px",textAlign:"center"}}>
        <p style={{color:"rgba(255,200,200,.3)",fontSize:"9.5px",fontFamily:"'Quicksand',sans-serif",letterSpacing:".22em"}}>{d.bride} &amp; {d.groom} · {fmtDate(d.wedding_date)} · Huế</p>
      </div>

    </div>
    {lbCur>=0&&<Lightbox imgs={lbImgs} cur={lbCur} onClose={closeLb} onNav={navLb}/>}

    {/* ── Live Ticker — Fixed bottom, nằm ngoài #pw để position:fixed hoạt động ── */}
    <RSVPFeed/>
  </>);
}