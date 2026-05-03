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
  // Map
  venue_lat:"16.4637",venue_lng:"107.5909",
  venue_embed:"",           // Google Maps embed URL tuỳ chọn
  // Flip Clock
  flip_show:true,           // hiện countdown flip clock
  // Love Story
  love_story:[
    {date:"01.2022",title:"Lần đầu gặp nhau",body:"Một buổi chiều bình thường trở thành ký ức không thể quên...",emoji:"👀"},
    {date:"03.2022",title:"Hẹn hò chính thức",body:"Dưới ánh hoàng hôn Huế, anh đã nắm tay em và hỏi một câu...",emoji:"💑"},
    {date:"12.2023",title:"Những chuyến đi cùng nhau",body:"Mỗi hành trình đều trở nên ý nghĩa hơn khi có nhau bên cạnh.",emoji:"✈️"},
    {date:"02.2025",title:"Cầu hôn",body:"Giữa không gian lãng mạn, anh quỳ xuống và nói: Em có muốn làm vợ anh không?",emoji:"💍"},
    {date:"04.2026",title:"Ngày trọng đại",body:"Và hôm nay — chúng ta bắt đầu một hành trình mới, cùng nhau mãi mãi.",emoji:"💒"},
  ],
};

// ══════════════════════════════════════════════
// GLOBAL CSS
// ══════════════════════════════════════════════
const GS = () => (
  <style>{`
@import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Cinzel:wght@400;600&family=Dancing+Script:wght@500;700&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
body{background:#c0a0a0;display:flex;justify-content:center;align-items:flex-start;min-height:100vh;padding:3vh 0;font-family:'Quicksand',sans-serif;-webkit-font-smoothing:antialiased;-webkit-tap-highlight-color:transparent;}
#pw{width:451px;position:relative;background:#fff;border:1px solid #c0a0a0;box-shadow:0 0 50px rgba(80,10,10,.25);border-radius:3px;overflow:hidden;overflow-y:auto;max-height:94vh;padding-bottom:calc(20vh + 46px);}
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
/* ══ ENVELOPE SCREEN — Bìa thiệp trước khi mở ══ */
#envelope-screen{
  position:fixed;inset:0;
  z-index:99998;
  display:flex;align-items:center;justify-content:center;
  background:linear-gradient(145deg,#2d0a12 0%,#4a0e1e 45%,#3a0e18 100%);
  /* Texture nhẹ */
  overflow:hidden;
}
#envelope-screen::before{
  content:'';position:absolute;inset:0;
  background-image:
    repeating-linear-gradient(45deg,rgba(255,200,180,.03) 0,rgba(255,200,180,.03) 1px,transparent 0,transparent 50%),
    repeating-linear-gradient(-45deg,rgba(255,200,180,.03) 0,rgba(255,200,180,.03) 1px,transparent 0,transparent 50%);
  background-size:24px 24px;
}
.env-card{
  width:min(420px,90vw);
  position:relative;
  display:flex;flex-direction:column;align-items:center;
  padding:0;
}
/* Khung thiệp */
.env-frame{
  width:100%;
  background:linear-gradient(160deg,#fdf8f0 0%,#fef5ed 60%,#fdf0e8 100%);
  border-radius:4px;
  box-shadow:
    0 0 0 1px rgba(180,80,60,.25),
    0 0 0 6px rgba(140,40,30,.12),
    0 8px 40px rgba(0,0,0,.45),
    0 2px 8px rgba(0,0,0,.3);
  padding:32px 28px 28px;
  text-align:center;
  position:relative;
  overflow:hidden;
}
/* Viền hoa văn */
.env-frame::before,.env-frame::after{
  content:'';position:absolute;
  border:1.5px solid rgba(160,60,40,.2);
  border-radius:3px;
}
.env-frame::before{inset:10px;}
.env-frame::after{inset:14px;border-color:rgba(160,60,40,.1);}

/* Chữ Hỉ */
.env-hi{
  font-size:56px;line-height:1;
  margin-bottom:4px;
  background:linear-gradient(135deg,#b8341a,#d4541e,#e8803c,#d4541e,#b8341a);
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;
  background-clip:text;
  filter:drop-shadow(0 1px 2px rgba(160,40,20,.3));
  animation:envHiGlow 3s ease-in-out infinite;
}
@keyframes envHiGlow{
  0%,100%{filter:drop-shadow(0 1px 2px rgba(160,40,20,.3));}
  50%{filter:drop-shadow(0 1px 8px rgba(200,80,30,.5));}
}

/* Dải hoa văn */
.env-divider{
  width:120px;height:1.5px;margin:10px auto;
  background:linear-gradient(90deg,transparent,rgba(180,80,40,.45),transparent);
  position:relative;
}
.env-divider::after{
  content:'❋';position:absolute;top:50%;left:50%;
  transform:translate(-50%,-50%);
  font-size:12px;color:rgba(180,80,40,.6);
  background:linear-gradient(160deg,#fdf8f0,#fef5ed);
  padding:0 6px;
}

/* Kính mời */
.env-kinhmoi{
  font-size:11.5px;letter-spacing:.22em;text-transform:uppercase;
  color:rgba(100,30,20,.55);font-family:'Cinzel',serif;
  margin-bottom:10px;
}
/* Tên người mời */
.env-to{
  font-size:17px;
  font-family:'Dancing Script',cursive;font-weight:700;
  color:#7a1a2a;margin-bottom:2px;
  text-shadow:0 1px 3px rgba(100,20,30,.15);
}
/* Tham dự */
.env-attend{
  font-size:10.5px;color:rgba(100,30,20,.5);
  font-family:'Quicksand',sans-serif;
  letter-spacing:.1em;margin-bottom:14px;
}
/* Tên cô dâu chú rể */
.env-couple{
  font-family:'Cormorant Garamond',serif;font-style:italic;
  font-size:13px;color:rgba(100,30,20,.55);
  margin-bottom:4px;letter-spacing:.06em;
}
.env-names{
  font-family:'Dancing Script',cursive;font-weight:700;
  font-size:32px;color:#631717;line-height:1.15;
  text-shadow:0 1px 4px rgba(100,20,30,.18);
  margin-bottom:2px;
}
.env-amp{
  font-family:'Cormorant Garamond',serif;font-style:italic;
  font-size:18px;color:rgba(180,60,40,.5);margin:0 8px;
}
.env-date{
  font-family:'Cinzel',serif;font-size:12px;
  color:rgba(120,40,30,.6);letter-spacing:.18em;
  margin-top:8px;margin-bottom:18px;
}
/* Nút mở thiệp */
.env-open-btn{
  position:relative;z-index:1;
  width:64px;height:64px;
  background:linear-gradient(135deg,#8a1a28,#631717);
  border-radius:50%;border:none;cursor:pointer;
  display:flex;align-items:center;justify-content:center;
  box-shadow:
    0 4px 18px rgba(99,23,23,.55),
    0 0 0 6px rgba(99,23,23,.15),
    0 0 0 12px rgba(99,23,23,.07);
  transition:transform .2s, box-shadow .2s;
  animation:envBtnPulse 2.5s ease-in-out infinite;
  margin-top:-2px;
}
.env-open-btn:hover{
  transform:scale(1.08);
  box-shadow:0 6px 24px rgba(99,23,23,.65),0 0 0 8px rgba(99,23,23,.18);
}
.env-open-btn:active{transform:scale(.94);}
@keyframes envBtnPulse{
  0%,100%{box-shadow:0 4px 18px rgba(99,23,23,.55),0 0 0 6px rgba(99,23,23,.15),0 0 0 12px rgba(99,23,23,.07);}
  50%{box-shadow:0 4px 24px rgba(99,23,23,.7),0 0 0 10px rgba(99,23,23,.2),0 0 0 20px rgba(99,23,23,.05);}
}
.env-open-icon{font-size:26px;line-height:1;}
.env-hint{
  font-size:10px;color:rgba(255,180,160,.5);
  font-family:'Quicksand',sans-serif;
  margin-top:10px;letter-spacing:.12em;
  animation:floatY 2.5s ease-in-out infinite;
}
/* Particles nền envelope */
.env-ptc{
  position:absolute;pointer-events:none;
  animation:envPtcFall linear infinite;
  opacity:.35;
}
@keyframes envPtcFall{
  0%{transform:translateY(-60px) rotate(0deg);opacity:.4;}
  100%{transform:translateY(105vh) rotate(360deg);opacity:0;}
}
/* Exit animation */
#envelope-screen.closing{
  animation:envClose .7s cubic-bezier(.4,0,.2,1) forwards;
}
@keyframes envClose{
  0%{opacity:1;transform:scale(1);}
  40%{opacity:1;transform:scale(1.04);}
  100%{opacity:0;transform:scale(.92) translateY(-20px);}
}

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

/* ── RSVP Live Ticker + Comment Input — Fixed bottom ──
   pointer-events:none trên toàn bộ, EXCEPT ô input (pointer-events:auto)
   → chữ cuộn không block click, chỉ input nhận tương tác */
#live-ticker{
  position:fixed;
  bottom:0; left:50%;
  transform:translateX(-50%);
  width:451px;
  z-index:8888;
  pointer-events:none;
  opacity:0;
  animation:tkFadeIn .8s ease 1s forwards;
  display:flex;
  flex-direction:column;
}
@media(max-width:460px){#live-ticker{width:100vw;}}
@keyframes tkFadeIn{to{opacity:1;}}

/* Phần cuộn chữ — chiếm ~20vh */
.tk-scroll-area{
  height:20vh;
  min-height:110px;
  max-height:180px;
  position:relative;
  overflow:hidden;
}

/* Nền gradient từ trong suốt → đậm dần xuống dưới */
.tk-bg{
  position:absolute;inset:0;
  background:linear-gradient(
    180deg,
    transparent 0%,
    rgba(45,8,20,.7) 35%,
    rgba(50,10,22,.88) 65%,
    rgba(55,10,24,.97) 100%
  );
  backdrop-filter:blur(8px);
  -webkit-backdrop-filter:blur(8px);
}
/* Đường viền trên */
.tk-border{
  position:absolute;top:0;left:0;right:0;height:1px;
  background:linear-gradient(90deg,transparent,rgba(180,40,40,.45),transparent);
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
  /* Scroll area chiếm phần còn lại bên trong tk-scroll-area */
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
  background:linear-gradient(180deg,rgba(50,10,22,.92),transparent);
  z-index:3;pointer-events:none;
}

/* Input row gửi comment — nằm DƯỚI phần cuộn trong ticker */
.tk-input-row{
  pointer-events:auto;   /* CHỈ phần này nhận tương tác */
  display:flex;align-items:center;gap:6px;
  padding:5px 8px 6px;
  background:rgba(45,8,20,.97);
  border-top:1px solid rgba(140,30,30,.3);
  backdrop-filter:blur(10px);
  -webkit-backdrop-filter:blur(10px);
}
.tk-inp{
  flex:1;min-width:0;
  padding:5px 10px;
  border:1px solid rgba(140,40,40,.4);
  border-radius:16px;
  background:rgba(255,255,255,.08);
  color:rgba(255,210,210,.95);
  font-size:11px;
  font-family:'Quicksand',sans-serif;
  outline:none;
  transition:border-color .2s, background .2s;
}
.tk-inp:focus{
  border-color:rgba(200,60,60,.7);
  background:rgba(255,255,255,.12);
}
.tk-inp::placeholder{color:rgba(200,150,150,.45);}
.tk-inp-name{
  flex:0 0 80px;
  padding:5px 9px;
  border:1px solid rgba(140,40,40,.35);
  border-radius:16px;
  background:rgba(255,255,255,.07);
  color:rgba(255,200,200,.9);
  font-size:11px;
  font-family:'Quicksand',sans-serif;
  outline:none;
  transition:border-color .2s;
}
.tk-inp-name:focus{border-color:rgba(200,60,60,.7);}
.tk-inp-name::placeholder{color:rgba(200,150,150,.4);}
.tk-send{
  flex-shrink:0;
  width:30px;height:30px;border-radius:50%;
  background:linear-gradient(135deg,#631717,#9a2a2a);
  border:none;cursor:pointer;
  display:flex;align-items:center;justify-content:center;
  font-size:12px;
  transition:opacity .2s, transform .15s;
  pointer-events:auto;
}
.tk-send:hover{opacity:.85;transform:scale(1.08);}
.tk-send:disabled{opacity:.4;cursor:not-allowed;transform:none;}

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
#lb{display:none;position:fixed;inset:0;z-index:99999;background:rgba(25,5,14,.97);align-items:center;justify-content:center;}
#lb.open{display:flex;}
#lb img{max-width:92vw;max-height:88vh;object-fit:contain;border-radius:8px;}
#lb-cl{position:absolute;top:.8rem;right:.8rem;background:transparent;border:1px solid rgba(255,255,255,.35);color:rgba(255,255,255,.7);font-size:.58rem;letter-spacing:.28em;text-transform:uppercase;padding:.35rem .8rem;cursor:pointer;font-family:'Quicksand',sans-serif;}
#lb-pv,#lb-nx{position:absolute;top:50%;transform:translateY(-50%);background:rgba(99,23,23,.25);border:1px solid rgba(240,180,180,.35);color:rgba(255,220,220,.85);font-size:1.8rem;width:42px;height:64px;cursor:pointer;font-family:serif;display:flex;align-items:center;justify-content:center;border-radius:4px;}
#lb-pv{left:.8rem;}#lb-nx{right:.8rem;}
#lb-cap{position:absolute;bottom:1rem;left:50%;transform:translateX(-50%);color:rgba(255,255,255,.55);font-size:.8rem;font-family:'Cormorant Garamond',serif;font-style:italic;}

/* ── Gallery mosaic layout ── */
.gal-mosaic-grid{
  display:grid;
  grid-template-columns:1fr 1fr;
  grid-auto-rows:140px;
  gap:6px;
  padding:0 14px 14px;
}
.gal-cell{
  position:relative;overflow:hidden;
  cursor:pointer;
  transition:transform .3s ease, box-shadow .3s ease;
}
.gal-cell:hover{transform:scale(1.02);box-shadow:0 8px 24px rgba(0,0,0,.5);}
.gal-cell.wide{grid-column:span 2;}
.gal-cell.tall{grid-row:span 2;}
.gal-cell img{
  width:100%;height:100%;object-fit:cover;display:block;
  transition:transform .5s ease;
}
.gal-cell:hover img{transform:scale(1.06);}
.gal-cell-cap{
  position:absolute;bottom:0;left:0;right:0;
  background:linear-gradient(transparent,rgba(55,10,24,.78));
  padding:16px 8px 6px;
  font-size:10px;color:rgba(255,255,255,.85);
  font-family:'Quicksand',sans-serif;font-style:italic;
  opacity:0;transition:opacity .25s;
}
.gal-cell:hover .gal-cell-cap{opacity:1;}

/* ── QR reveal animation ── */
@keyframes qrReveal{
  from{opacity:0;transform:translateY(24px) scale(.94);}
  to{opacity:1;transform:translateY(0) scale(1);}
}
.qr-revealed{
  animation:qrReveal .5s cubic-bezier(.22,1,.36,1) forwards;
}
.gift-btn{
  background:transparent;border:none;cursor:pointer;
  font-size:64px;display:inline-block;
  animation:wobble 2.8s ease-in-out infinite;
  filter:drop-shadow(0 4px 12px rgba(0,0,0,.4));
  transition:transform .15s;
}
.gift-btn:active{transform:scale(.9);}

/* ── Copy toast ── */
.copy-toast{
  position:fixed;bottom:calc(20vh + 55px);left:50%;
  transform:translateX(-50%);
  background:rgba(55,10,24,.92);
  color:rgba(255,200,200,.95);
  font-family:'Quicksand',sans-serif;font-size:12px;font-weight:600;
  padding:7px 18px;border-radius:99px;
  z-index:9990;pointer-events:none;
  animation:copyToastAnim .25s ease;
}
@keyframes copyToastAnim{from{opacity:0;transform:translateX(-50%) translateY(8px);}to{opacity:1;transform:translateX(-50%) translateY(0);}}

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

/* ══ FLIP CLOCK COUNTDOWN ══ */
.flip-clock{
  display:flex;align-items:center;justify-content:center;
  gap:6px;padding:20px 0 8px;
}
.flip-unit{display:flex;flex-direction:column;align-items:center;gap:4px;}
.flip-cards{position:relative;width:52px;height:60px;}
.flip-card{
  width:52px;height:28px;
  background:linear-gradient(180deg,#4a0e1e 0%,#4a0e1e 49%,#3a0818 51%,#3a0818 100%);
  border-radius:4px;
  display:flex;align-items:center;justify-content:center;
  font-family:'Cinzel',serif;font-size:22px;font-weight:600;
  color:#fff;
  position:absolute;
  overflow:hidden;
  box-shadow:0 2px 6px rgba(0,0,0,.35);
  transform-origin:bottom center;
  backface-visibility:hidden;
}
.flip-card.top{top:0;border-bottom:1px solid rgba(0,0,0,.35);}
.flip-card.bot{top:32px;border-top:1px solid rgba(255,255,255,.08);}
.flip-card.anim-top{
  transform-origin:bottom center;
  animation:flipTop .3s ease-in forwards;
}
.flip-card.anim-bot{
  transform-origin:top center;
  animation:flipBot .3s ease-out forwards;
  animation-delay:.3s;
}
@keyframes flipTop{
  0%{transform:rotateX(0);}
  100%{transform:rotateX(-90deg);}
}
@keyframes flipBot{
  0%{transform:rotateX(90deg);}
  100%{transform:rotateX(0);}
}
.flip-sep{
  font-size:28px;font-weight:700;color:rgba(255,180,160,.6);
  line-height:1;margin-top:-8px;font-family:'Cinzel',serif;
}
.flip-label{
  font-size:9px;letter-spacing:.2em;text-transform:uppercase;
  color:rgba(255,180,160,.65);font-family:'Quicksand',sans-serif;
}

/* ══ MINI MAP ══ */
.map-wrap{
  position:relative;width:100%;height:280px;
  overflow:hidden;
  background:#e8d5c8;
}
.map-iframe{width:100%;height:100%;border:none;display:block;}
.map-overlay{
  position:absolute;inset:0;pointer-events:none;
  background:linear-gradient(180deg,rgba(58,14,24,.18) 0%,transparent 30%,transparent 70%,rgba(58,14,24,.22) 100%);
}
/* Pin animation */
.map-pin-wrap{
  position:absolute;top:50%;left:50%;
  transform:translate(-50%,-100%);
  z-index:5;pointer-events:none;
}
.map-pin{
  width:36px;height:36px;
  background:linear-gradient(135deg,#631717,#9a2a2a);
  border-radius:50% 50% 50% 0;
  transform:rotate(-45deg);
  box-shadow:0 4px 14px rgba(99,23,23,.55);
  animation:pinBounce 1.8s ease-in-out infinite;
  display:flex;align-items:center;justify-content:center;
  border:2px solid rgba(255,200,200,.4);
}
.map-pin::after{
  content:'';display:block;
  width:10px;height:10px;
  background:rgba(255,220,220,.9);
  border-radius:50%;
  transform:rotate(45deg);
}
@keyframes pinBounce{
  0%,100%{transform:rotate(-45deg) translateY(0);}
  50%{transform:rotate(-45deg) translateY(-5px);}
}
.map-pin-shadow{
  width:16px;height:6px;
  background:rgba(0,0,0,.22);
  border-radius:50%;
  margin:3px auto 0;
  animation:pinShadow 1.8s ease-in-out infinite;
}
@keyframes pinShadow{
  0%,100%{transform:scaleX(1);opacity:.22;}
  50%{transform:scaleX(.7);opacity:.12;}
}
/* Venue info card nổi trên map */
.map-info{
  position:absolute;bottom:0;left:0;right:0;
  background:linear-gradient(180deg,transparent,rgba(40,8,18,.95) 35%);
  padding:28px 14px 12px;
  display:flex;align-items:flex-end;justify-content:space-between;
  gap:10px;
}
.map-info-text{}
.map-venue-name{
  font-family:'Dancing Script',cursive;font-weight:700;
  font-size:19px;color:rgba(255,220,220,.95);
  text-shadow:0 1px 4px rgba(0,0,0,.5);
  margin-bottom:2px;
}
.map-venue-addr{
  font-size:10.5px;color:rgba(255,190,180,.7);
  font-family:'Quicksand',sans-serif;line-height:1.4;
}
.map-btn{
  flex-shrink:0;
  display:flex;flex-direction:column;align-items:center;gap:4px;
  background:linear-gradient(135deg,#631717,#9a2a2a);
  border:none;cursor:pointer;
  padding:8px 12px;border-radius:8px;
  box-shadow:0 3px 12px rgba(99,23,23,.45);
  transition:transform .15s,box-shadow .15s;
  text-decoration:none;
}
.map-btn:active{transform:scale(.95);}
.map-btn-icon{font-size:18px;}
.map-btn-txt{
  font-size:8.5px;font-weight:700;letter-spacing:.1em;
  color:rgba(255,220,220,.9);font-family:'Quicksand',sans-serif;
  text-transform:uppercase;
}
/* Tab switch: Bản đồ / Lịch trình */
.map-tabs{
  display:flex;border-bottom:1px solid rgba(99,23,23,.15);
  background:#fff;
}
.map-tab{
  flex:1;padding:9px 6px;border:none;background:transparent;
  font-family:'Quicksand',sans-serif;font-size:11.5px;font-weight:600;
  color:#9a6060;cursor:pointer;transition:all .2s;
  border-bottom:2.5px solid transparent;
}
.map-tab.on{color:#631717;border-bottom-color:#631717;}
/* Lịch trình */
.schedule-list{padding:12px 14px;}
.schedule-item{
  display:flex;gap:10px;padding:8px 0;
  border-bottom:1px solid rgba(99,23,23,.08);
}
.schedule-item:last-child{border-bottom:none;}
.schedule-time{
  font-family:'Cinzel',serif;font-size:11px;font-weight:600;
  color:#631717;width:62px;flex-shrink:0;padding-top:1px;
}
.schedule-dot{
  width:10px;height:10px;border-radius:50%;flex-shrink:0;margin-top:3px;
  background:linear-gradient(135deg,#631717,#9a2a2a);
  box-shadow:0 0 0 3px rgba(99,23,23,.12);
}
.schedule-body{flex:1;}
.schedule-title{font-size:12px;font-weight:700;color:#2a1010;margin-bottom:1px;}
.schedule-place{font-size:10.5px;color:#9a6060;}

/* ══ LOVE STORY TIMELINE ══ */
.love-wrap{padding:8px 0 4px;}
.love-item{
  display:flex;gap:0;
  position:relative;
  padding:0 16px 0 0;
}
/* Đường dọc */
.love-item::before{
  content:'';
  position:absolute;left:50%;top:0;bottom:0;
  width:2px;
  background:linear-gradient(180deg,rgba(99,23,23,.12),rgba(99,23,23,.25),rgba(99,23,23,.12));
  transform:translateX(-50%);
  z-index:0;
}
.love-item:last-child::before{display:none;}
/* Node trung tâm */
.love-node{
  position:absolute;left:50%;top:22px;
  transform:translate(-50%,-50%);
  width:36px;height:36px;
  background:linear-gradient(135deg,#631717,#9a2a2a);
  border-radius:50%;
  display:flex;align-items:center;justify-content:center;
  font-size:15px;z-index:1;
  box-shadow:0 2px 10px rgba(99,23,23,.35),0 0 0 4px rgba(99,23,23,.1);
}
/* Card trái / phải xen kẽ */
.love-card{
  width:calc(50% - 24px);
  background:#fff;
  border:1px solid rgba(99,23,23,.12);
  border-radius:10px;
  padding:11px 12px;
  position:relative;
  box-shadow:0 2px 10px rgba(99,23,23,.08);
}
.love-card.left{margin-right:auto;margin-left:16px;margin-bottom:28px;}
.love-card.right{margin-left:auto;margin-right:16px;margin-bottom:28px;}
/* Mũi tên card */
.love-card.left::after{
  content:'';position:absolute;right:-8px;top:18px;
  border:8px solid transparent;
  border-left:8px solid #fff;
}
.love-card.left::before{
  content:'';position:absolute;right:-10px;top:17px;
  border:9px solid transparent;
  border-left:9px solid rgba(99,23,23,.12);
}
.love-card.right::after{
  content:'';position:absolute;left:-8px;top:18px;
  border:8px solid transparent;
  border-right:8px solid #fff;
}
.love-card.right::before{
  content:'';position:absolute;left:-10px;top:17px;
  border:9px solid transparent;
  border-right:9px solid rgba(99,23,23,.12);
}
.love-date{
  font-size:9px;letter-spacing:.18em;text-transform:uppercase;
  color:#9a2a2a;font-family:'Quicksand',sans-serif;font-weight:700;
  margin-bottom:3px;
}
.love-title{
  font-family:'Cormorant Garamond',serif;font-style:italic;
  font-size:14px;font-weight:700;color:#3a0e18;margin-bottom:4px;
}
.love-body{
  font-size:10.5px;color:#6a4040;font-family:'Quicksand',sans-serif;
  line-height:1.6;
}
.sec-dark{background:linear-gradient(145deg,#3a0e18,#3d1010);}
.sec-dark2{background:linear-gradient(145deg,#2a0808,#631717);}
.sec-mid{background:linear-gradient(145deg,#7a1a2a,#3a0e18);}
.sec-night{background:linear-gradient(145deg,#2d0a12,#3d1020);}

@media(max-width:460px){
  body{
    padding:0;
    background:#3a0e18;
    /* Mobile: block layout để body scroll */
    display:block;
    /* Đủ không gian cho ticker + input ở đáy */
    padding-bottom:calc(20vh + 50px);
  }
  #pw{
    width:100vw;
    /* PHẢI overflow:visible để body scroll */
    max-height:none!important;
    height:auto!important;
    overflow:visible!important;
    overflow-y:visible!important;
    /* Bỏ padding-bottom vì body đã có */
    padding-bottom:0!important;
    border-radius:0;border:none;box-shadow:none;
  }
  #aud{right:10px;top:10px;}
  #sh{display:none;}
  /* Ticker full width trên mobile */
  #live-ticker{width:100vw;left:0;transform:none;}
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

// ── Music — Mobile-first autoplay ──
// Kỹ thuật: iframe load muted + unMute trong SYNCHRONOUS gesture handler
// Mobile browser CHỈ cho phép unMute nếu gọi TRỰC TIẾP trong touch/click handler
// KHÔNG được gọi qua async/setTimeout/Promise
function Music({url}) {
  const [on,  setOn]  = useState(false);
  const ifrRef        = useRef(null);
  const mutedRef      = useRef(true);  // iframe đang muted
  const loadedRef     = useRef(false); // iframe đã load xong
  const id            = ytId(url);

  // Gửi lệnh YT Player API
  const cmd = useCallback((fn, args=[]) => {
    try {
      ifrRef.current?.contentWindow?.postMessage(
        JSON.stringify({event:"command", func:fn, args}), "*"
      );
    } catch {}
  }, []);

  // unMute phải gọi SYNCHRONOUSLY trong event handler
  const tryUnmute = useCallback(() => {
    if (!mutedRef.current) return; // đã unmute rồi
    if (!loadedRef.current) return; // chưa load xong
    // Gọi thẳng không qua setTimeout
    cmd("unMute");
    cmd("playVideo");
    cmd("setVolume", [80]);
    mutedRef.current = false;
    setOn(true);
  }, [cmd]);

  const onIfrLoad = useCallback(() => {
    loadedRef.current = true;
    // Desktop: thử phát ngay (không cần gesture)
    // Mobile: sẽ bị block nhưng không sao, chờ touch
    cmd("playVideo");
    // Thử unmute sau 500ms — hoạt động trên desktop
    setTimeout(() => {
      if (mutedRef.current) {
        cmd("unMute");
        cmd("setVolume", [80]);
        mutedRef.current = false;
        setOn(true);
      }
    }, 500);
  }, [cmd]);

  // Lắng nghe gesture — unMute SYNCHRONOUSLY
  useEffect(() => {
    if (!id) return;
    // Hàm này PHẢI synchronous — không async, không setTimeout
    const onTouch = () => { tryUnmute(); };
    const onClick  = () => { tryUnmute(); };

    window.addEventListener("touchstart", onTouch, { once:true, passive:true });
    window.addEventListener("click",      onClick,  { once:true });

    return () => {
      window.removeEventListener("touchstart", onTouch);
      window.removeEventListener("click",      onClick);
    };
  }, [id, tryUnmute]);

  const toggle = useCallback((e) => {
    e.stopPropagation();
    if (!id) return;
    if (mutedRef.current) {
      // Lần đầu nhấn nút → unMute (gesture handler, synchronous)
      cmd("unMute"); cmd("playVideo"); cmd("setVolume",[80]);
      mutedRef.current = false; setOn(true);
    } else if (on) {
      cmd("mute"); setOn(false);
    } else {
      cmd("unMute"); cmd("playVideo"); setOn(true);
    }
  }, [id, on, cmd]);

  // src: mute=1 + autoplay=1 để buffer sẵn
  // playsinline=1 quan trọng cho iOS (không fullscreen)
  const ifrSrc = id
    ? `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&controls=0&enablejsapi=1&playsinline=1&rel=0`
    : "";

  // Expose tryUnmute để WeddingApp gọi khi mở thiệp
  Music.triggerPlay = tryUnmute;

  return(<>
    {id && (
      <iframe ref={ifrRef} src={ifrSrc} onLoad={onIfrLoad}
        allow="autoplay; encrypted-media"
        title="bg-music"
        style={{position:"fixed",top:"-9999px",left:"-9999px",
          width:"1px",height:"1px",opacity:0,pointerEvents:"none",border:"none"}}/>
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
      <div style={{background:"linear-gradient(90deg,#4a0e1e,#7a1a2a,#4a0e1e)",padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
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
  // ── TẤT CẢ HOOKS PHẢI Ở ĐẦU — Rules of Hooks ──
  const [items,   setItems]   = useState([]);
  const [cmtName, setCmtName] = useState("");
  const [cmtText, setCmtText] = useState("");
  const [sending, setSending] = useState(false);
  const innerRef = useRef(null);
  const rafRef   = useRef(null);
  const posRef   = useRef(0);
  const SPEED    = 0.45;

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

  // Load data + realtime
  useEffect(() => {
    if (!sb) { setItems(DEMOS); return; }
    sb.from("rsvp_responses")
      .select("*").order("created_at", {ascending:true}).limit(50)
      .then(({data}) => { setItems(data && data.length >= 3 ? data : DEMOS); });
    const ch = sb.channel("rsvp_tk5")
      .on("postgres_changes", {event:"INSERT", schema:"public", table:"rsvp_responses"}, (p) => {
        setItems(prev => [...prev, p.new]);
      }).subscribe();
    return () => sb.removeChannel(ch);
  }, []);

  // RAF scroll — loop liền mạch (nhân đôi items → scroll nửa)
  useEffect(() => {
    if (!items.length) return;
    const el = innerRef.current;
    if (!el) return;
    posRef.current = 0;
    el.style.transform = "translateY(0px)";
    const animate = () => {
      const halfH = el.scrollHeight / 2;
      posRef.current += SPEED;
      if (posRef.current >= halfH) posRef.current -= halfH;
      el.style.transform = `translateY(-${posRef.current.toFixed(2)}px)`;
      rafRef.current = requestAnimationFrame(animate);
    };
    const t = setTimeout(() => { rafRef.current = requestAnimationFrame(animate); }, 600);
    return () => { clearTimeout(t); cancelAnimationFrame(rafRef.current); };
  }, [items]);

  // Send comment
  const sendComment = async () => {
    const n = cmtName.trim();
    const t = cmtText.trim();
    if (!n || !t) return;
    setSending(true);
    const local = {
      id: `l${Date.now()}`, name: n,
      attending: true, guests_count: 1, message: t,
      created_at: new Date().toISOString()
    };
    setItems(prev => [...prev, local]);
    setCmtText("");
    if (sb) {
      await sb.from("rsvp_responses").insert({
        name: n, attending: true, guests_count: 1, message: t
      }).catch(() => {});
    }
    setSending(false);
  };

  const getInit = n => n ? n.trim()[0].toUpperCase() : "?";
  const belt    = [...items, ...items];

  return (
    <div id="live-ticker">
      {/* ── Phần cuộn chữ ── */}
      <div className="tk-scroll-area">
        <div className="tk-bg"/>
        <div className="tk-border"/>
        <div className="tk-fade"/>
        <div className="tk-header">
          <div className="tk-dot"/>
          <span className="tk-lbl">LIVE · Xác nhận tham dự</span>
          <span className="tk-count">{items.length} người</span>
        </div>
        <div className="tk-scroll">
          <div ref={innerRef} className="tk-inner">
            {belt.map((r, i) => (
              <div key={`${r.id||i}-${i}`} className="tk-row">
                <div className="tk-av">{getInit(r.name)}</div>
                <span className="tk-name">{r.name}</span>
                <span className={`tk-badge ${r.attending ? "yes" : "no"}`}>
                  {r.attending ? `♥ ${r.guests_count||1} người` : "✗ Vắng"}
                </span>
                {r.message && <span className="tk-msg">— {r.message}</span>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Input gửi comment ── */}
      <div className="tk-input-row">
        <input
          className="tk-inp-name"
          value={cmtName}
          placeholder="Tên bạn..."
          maxLength={25}
          onChange={e => setCmtName(e.target.value)}
          onKeyDown={e => e.key === "Enter" && sendComment()}
        />
        <input
          className="tk-inp"
          value={cmtText}
          placeholder="Gửi lời chúc... ♥"
          maxLength={120}
          onChange={e => setCmtText(e.target.value)}
          onKeyDown={e => e.key === "Enter" && sendComment()}
        />
        <button
          className="tk-send"
          onClick={sendComment}
          disabled={sending || !cmtName.trim() || !cmtText.trim()}
        >
          {sending ? "⏳" : "➤"}
        </button>
      </div>
    </div>
  );
}
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

// ══════════════════════════════════════════════════════
// FLIP CLOCK — 3D countdown đồng hồ lật
// ══════════════════════════════════════════════════════
function FlipDigit({ value }) {
  const prev  = useRef(value);
  const [flip, setFlip] = useState(false);
  const [show, setShow] = useState({ cur: value, next: value });

  useEffect(() => {
    if (value === prev.current) return;
    setShow({ cur: prev.current, next: value });
    setFlip(true);
    const t = setTimeout(() => {
      setShow({ cur: value, next: value });
      setFlip(false);
      prev.current = value;
    }, 620);
    return () => clearTimeout(t);
  }, [value]);

  const s = String(show.cur).padStart(2, "0");
  const n = String(show.next).padStart(2, "0");
  return (
    <div className="flip-cards">
      {/* Top half — số cũ */}
      <div className={`flip-card top${flip ? " anim-top" : ""}`}>
        <span style={{ transform:"translateY(-14px)", display:"block" }}>{s}</span>
      </div>
      {/* Bottom half — số mới */}
      <div className={`flip-card bot${flip ? " anim-bot" : ""}`}>
        <span style={{ transform:"translateY(14px)", display:"block" }}>{n}</span>
      </div>
    </div>
  );
}

function FlipClock({ dateStr }) {
  const cd = useCd(dateStr);

  if (cd.past) return (
    <div style={{ textAlign:"center", padding:"1.5rem 0" }}>
      <p style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic",
        fontSize:"22px", color:"rgba(255,210,200,.9)" }}>
        🎉 Hôm nay là ngày trọng đại!
      </p>
    </div>
  );

  const units = [
    { v: cd.d,  label: "Ngày" },
    { v: cd.h,  label: "Giờ" },
    { v: cd.m,  label: "Phút" },
    { v: cd.s,  label: "Giây" },
  ];

  return (
    <div className="flip-clock">
      {units.map((u, i) => (
        <div key={u.label} style={{ display:"flex", alignItems:"center", gap:"6px" }}>
          <div className="flip-unit">
            <FlipDigit value={u.v} />
            <span className="flip-label">{u.label}</span>
          </div>
          {i < units.length - 1 && (
            <span className="flip-sep" style={{ opacity: i === 0 ? 0 : 1 }}>:</span>
          )}
        </div>
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════
// MINI MAP — Tương tác + lịch trình buổi lễ
// ══════════════════════════════════════════════════════
function MiniMap({ d }) {
  const [tab, setTab] = useState("map"); // "map" | "schedule"

  // Build Google Maps embed từ toạ độ hoặc URL
  const buildEmbed = () => {
    if (d.venue_embed?.trim()) return d.venue_embed;
    const lat = parseFloat(d.venue_lat) || 16.4637;
    const lng = parseFloat(d.venue_lng) || 107.5909;
    return `https://maps.google.com/maps?q=${lat},${lng}&z=16&output=embed&hl=vi`;
  };

  // Build link dẫn đường native
  const navUrl = () => {
    const lat = parseFloat(d.venue_lat) || 16.4637;
    const lng = parseFloat(d.venue_lng) || 107.5909;
    const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
    if (isIOS) return `maps://maps.apple.com/?daddr=${lat},${lng}`;
    return `https://maps.google.com/maps?daddr=${lat},${lng}`;
  };

  const scheduleItems = [
    { time: d.ceremony1_time || "07:30 SA", title: d.ceremony1_label || "Lễ Gia Tiên", place: d.ceremony1_addr || "" },
    { time: d.ceremony2_time || "10:00 SA", title: d.ceremony2_label || "Lễ Cưới",     place: d.ceremony2_addr || "" },
    { time: d.wedding_time  || "11:00 SA", title: "Tiệc mừng",                         place: d.venue_name || "" },
  ];

  return (
    <div>
      {/* Tabs */}
      <div className="map-tabs">
        <button className={`map-tab${tab==="map"?" on":""}`} onClick={()=>setTab("map")}>📍 Địa điểm</button>
        <button className={`map-tab${tab==="schedule"?" on":""}`} onClick={()=>setTab("schedule")}>📋 Lịch trình</button>
      </div>

      {tab === "map" ? (
        <div className="map-wrap">
          {/* Google Maps iframe */}
          <iframe
            className="map-iframe"
            src={buildEmbed()}
            allowFullScreen loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Địa điểm đám cưới"
          />
          <div className="map-overlay"/>

          {/* Pin animation — chỉ hiện khi không có embed */}
          {!d.venue_embed && (
            <div className="map-pin-wrap">
              <div className="map-pin"/>
              <div className="map-pin-shadow"/>
            </div>
          )}

          {/* Info bar dưới map */}
          <div className="map-info">
            <div className="map-info-text">
              <div className="map-venue-name">{d.venue_name}</div>
              <div className="map-venue-addr">{d.venue_address}</div>
            </div>
            <a href={navUrl()} target="_blank" rel="noopener noreferrer"
              className="map-btn" onClick={e=>e.stopPropagation()}>
              <span className="map-btn-icon">🧭</span>
              <span className="map-btn-txt">Dẫn đường</span>
            </a>
          </div>
        </div>
      ) : (
        <div className="schedule-list">
          {scheduleItems.map((item, i) => (
            <div key={i} className="schedule-item">
              <div className="schedule-time">{item.time}</div>
              <div className="schedule-dot"/>
              <div className="schedule-body">
                <div className="schedule-title">{item.title}</div>
                {item.place && <div className="schedule-place">📍 {item.place}</div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════
// LOVE STORY TIMELINE — Câu chuyện tình yêu
// ══════════════════════════════════════════════════════
function LoveStory({ stories = [] }) {
  if (!stories.length) return null;

  return (
    <div className="love-wrap">
      {stories.map((s, i) => {
        const isLeft = i % 2 === 0;
        return (
          <Rv key={i} dir={isLeft ? "r" : "l"} delay={0.05} style={{ position:"relative" }}>
            {/* Item wrapper */}
            <div className="love-item">
              {/* Card */}
              <div className={`love-card ${isLeft ? "left" : "right"}`}>
                <div className="love-date">{s.date}</div>
                <div className="love-title">{s.title}</div>
                <div className="love-body">{s.body}</div>
              </div>
              {/* Node ở giữa */}
              <div className="love-node">{s.emoji || "♥"}</div>
            </div>
          </Rv>
        );
      })}
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
    <div style={{background:"rgba(45,8,20,.72)",backdropFilter:"blur(3px)",borderRadius:"6px",padding:"10px 14px",...style}}>
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
  const [copyMsg,setCopyMsg]=useState("");
  const [showQR, setShowQR] = useState(false);
  const [opened, setOpened] = useState(false);  // false = đang hiện bìa thiệp

  const copyText=useCallback((text,label="✓ Đã copy!")=>{
    navigator.clipboard.writeText(text).catch(()=>{
      const el=document.createElement("textarea");
      el.value=text;document.body.appendChild(el);el.select();document.execCommand("copy");document.body.removeChild(el);
    });
    setCopyMsg(label);setTimeout(()=>setCopyMsg(""),2000);
  },[]);

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

  // ── AUTO SCROLL ── mobile + desktop, không giật, không bị pause sớm
  useEffect(()=>{
    const pw = document.getElementById("pw");
    const sh = document.getElementById("sh");
    if (!pw) return;

    const SPEED    = 0.55;
    const RESUME   = 3500;
    const START_MS = 2500; // Đủ thời gian để page load xong

    let raf        = null;
    let running    = false;
    let paused     = false;
    let resumeTmr  = null;
    let listenReady = false; // Chỉ listen touch SAU khi scroll đã bắt đầu

    // Mobile: #pw overflow:visible → dùng window.scrollBy
    const mob    = () => window.innerWidth <= 460;
    const getTop = () => mob() ? window.scrollY : pw.scrollTop;
    const getMax = () => mob()
      ? document.documentElement.scrollHeight - window.innerHeight
      : pw.scrollHeight - pw.clientHeight;
    const doScroll = (n) => {
      if (mob()) window.scrollBy(0, n);
      else pw.scrollTop += n;
    };

    const pause = (hide=false) => {
      paused = true;
      if (hide && sh) sh.classList.add("gone");
      clearTimeout(resumeTmr);
      resumeTmr = setTimeout(() => { paused = false; }, RESUME);
    };

    // ── RAF loop ──
    const loop = () => {
      if (!running) return;
      // Ẩn scroll hint
      if (sh && getTop() > 80) sh.classList.add("gone");
      if (!paused) {
        doScroll(SPEED);
        if (getTop() >= getMax() - 1) { running = false; return; }
      }
      raf = requestAnimationFrame(loop);
    };

    // ── Desktop: wheel ──
    const onWheel = () => pause(true);

    // ── Desktop: keyboard ──
    const onKey = (e) => {
      if (["ArrowDown","ArrowUp","PageDown","PageUp"," "].includes(e.key)) pause(false);
    };

    // ── Mobile: touch ──
    // Chỉ listen SAU khi scroll đã chạy (listenReady=true)
    // → không bị pause bởi gesture mở trang
    let ty0 = 0;
    const onTS = (e) => {
      if (!listenReady) return; // bỏ qua gesture trước khi scroll bắt đầu
      ty0 = e.touches[0].clientY;
    };
    const onTM = (e) => {
      if (!listenReady) return;
      if (Math.abs(e.touches[0].clientY - ty0) > 10) pause(true);
    };

    pw.addEventListener("wheel",          onWheel, { passive:true });
    window.addEventListener("keydown",    onKey,   { passive:true });
    window.addEventListener("touchstart", onTS,    { passive:true });
    window.addEventListener("touchmove",  onTM,    { passive:true });

    // Chỉ scroll khi thiệp đã được mở (opened=true)
    // Kiểm tra DOM: #envelope-screen không còn tồn tại
    const waitOpen = (cb) => {
      const check = () => {
        const env = document.getElementById("envelope-screen");
        if (!env) cb();
        else setTimeout(check, 200);
      };
      setTimeout(check, START_MS);
    };

    const startTmr = setTimeout(() => {
      waitOpen(() => {
        running = true;
        setTimeout(() => { listenReady = true; }, 500);
        raf = requestAnimationFrame(loop);
      });
    }, 0);

    return () => {
      clearTimeout(startTmr);
      clearTimeout(resumeTmr);
      cancelAnimationFrame(raf);
      running = false;
      pw.removeEventListener("wheel",       onWheel);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("touchstart", onTS);
      window.removeEventListener("touchmove",  onTM);
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

  // Hàm mở thiệp — trigger nhạc ĐỒNG THỜI trong cùng event
  // Mobile browser CHỈ cho phép audio nếu gọi trong sync gesture handler
  const handleOpen = useCallback(() => {
    // 1. Gọi unMute ngay — vẫn đang trong click/touch event handler
    if (typeof Music.triggerPlay === "function") {
      Music.triggerPlay();
    }
    // 2. Mở thiệp
    setOpened(true);
  }, []);

  return(<>
    <GS/><Particles/>
    <Music url={d.music_youtube}/>

    {/* Bìa thiệp — hiện trước khi mở */}
    {!opened && <EnvelopeScreen d={d} onOpen={handleOpen}/>}

    <div id="sh" className={opened?"":"gone"}><span className="sh-t">Kéo xuống</span><div className="sh-m"/></div>
    <div id="pw" style={!opened?{pointerEvents:"none",userSelect:"none"}:{}}>

      {/* ═══ COVER ═══ */}
      <div style={{position:"relative",width:"100%",height:"490px",overflow:"hidden",background:"linear-gradient(148deg,#4a0e1e 0%,#6d1a28 50%,#3a0e18 100%)"}}>
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

      {/* ═══ LOVE STORY TIMELINE ═══ */}
      {Array.isArray(d.love_story)&&d.love_story.length>0&&(
        <>
          <div style={{position:"relative",background:"#fdf7f7",padding:"22px 0 4px"}}>
            <div style={{position:"absolute",top:0,left:0,right:0,height:"3px",background:"linear-gradient(90deg,transparent,#631717,transparent)"}}/>
            <div style={{textAlign:"center",marginBottom:"12px",padding:"0 16px"}}>
              <Rv dir="u" delay={0}>
                <span style={{display:"inline-block",borderTop:"1px solid rgba(99,23,23,.35)",paddingTop:"7px",
                  fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:"26px",color:"#631717"}}>
                  Hành Trình Của Chúng Tôi
                </span>
              </Rv>
              <Rv dir="u" delay={0.1}>
                <p style={{fontSize:"10px",fontWeight:700,letterSpacing:".18em",textTransform:"uppercase",
                  color:"#9a6060",fontFamily:"'Quicksand',sans-serif",marginTop:"4px"}}>
                  OUR LOVE STORY
                </p>
              </Rv>
            </div>
            <LoveStory stories={d.love_story}/>
          </div>
          <div className="hdiv"/>
        </>
      )}

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

      {/* ═══ MINI MAP TƯƠNG TÁC ═══ */}
      <div style={{position:"relative",background:"#fff"}}>
        <div style={{position:"absolute",top:0,left:0,right:0,height:"3px",background:"linear-gradient(90deg,transparent,#631717,transparent)"}}/>
        <Rv dir="u" delay={0}>
          <MiniMap d={d}/>
        </Rv>
      </div>
      <div className="hdiv"/>

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

      {/* ═══ CALENDAR + FLIP CLOCK COUNTDOWN ═══ */}
      <div style={{position:"relative",background:"#fff"}}>
        <div style={{position:"absolute",top:0,left:0,right:0,height:"3px",background:"linear-gradient(90deg,transparent,#631717,transparent)"}}/>
        {/* Calendar */}
        <Rv dir="s" delay={0.1} style={{overflow:"hidden"}}>
          <Cal dateStr={d.wedding_date}/>
        </Rv>
        {/* Flip Clock bên dưới calendar */}
        <div style={{background:"linear-gradient(145deg,#3a0e18,#631717)",paddingBottom:"14px"}}>
          <Rv dir="u" delay={0.1}>
            <p style={{textAlign:"center",paddingTop:"12px",fontSize:"10px",
              letterSpacing:".25em",textTransform:"uppercase",
              color:"rgba(255,190,180,.6)",fontFamily:"'Quicksand',sans-serif",fontWeight:600}}>
              Đếm ngược ngày cưới
            </p>
          </Rv>
          <Rv dir="s" delay={0.15}>
            <FlipClock dateStr={d.wedding_date}/>
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

      {/* Gallery — Mosaic Layout tự động theo size */}
      {galArr.length>0&&(<>
        <div className="hdiv"/>
        <div className="sec-night" style={{paddingTop:"14px",paddingBottom:"6px"}}>
          <Rv dir="u" delay={0} style={{paddingLeft:"14px",paddingRight:"14px",marginBottom:"10px"}}>
            <p style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",fontSize:"18px",color:"rgba(255,200,200,.7)",textAlign:"center"}}>✦ Bộ sưu tập hình ảnh ✦</p>
          </Rv>
          <div className="gal-mosaic-grid">
            {galArr.map((img,i)=>{
              const src=gd(img.url);
              const size=img.size||"1x1";
              return src?(
                <Rv key={i} dir="s" delay={i*.05}
                  className={`gal-cell${size==="2x1"?" wide":""}${size==="1x2"?" tall":""}`}
                  onClick={()=>openLb(galArr,i)}>
                  <img src={src} alt={img.caption||""} loading="lazy"
                    style={{objectPosition:img.pos||"50% 50%"}}
                    onError={e=>{e.target.style.display="none";e.target.parentElement.style.background="#2a0808";}}/>
                  {img.caption&&<div className="gal-cell-cap">{img.caption}</div>}
                </Rv>
              ):null;
            })}
          </div>
        </div>
      </>)}

      {d.photo_full&&(<>
        <div className="hdiv"/>
        <div style={{position:"relative",overflow:"hidden"}}>
          <Photo url={d.photo_full} pos={d.full_pos} shape="none" style={{width:"100%",height:"340px"}}/>
          <div style={{position:"absolute",inset:0,background:"rgba(40,8,18,.65)",display:"flex",alignItems:"center",justifyContent:"center"}}>
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

      </div>

      {/* ═══ QR — ẩn đến khi nhấn hộp quà ═══ */}
      <div className="hdiv"/>
      <div style={{padding:"24px 14px 22px",textAlign:"center",position:"relative"}} className="sec-night">
        <Fl top={-60} left={-80} w={260} h={355} rot={12} op={0.14}/>

        {/* Label */}
        <Rv dir="u" delay={0} style={{position:"relative",zIndex:1}}>
          <p style={{color:"rgba(255,200,200,.82)",fontSize:"12px",fontFamily:"'Quicksand',sans-serif",fontWeight:600,marginBottom:"12px",letterSpacing:".22em",textTransform:"uppercase"}}>✦ Hộp quà yêu thương ✦</p>
        </Rv>

        {/* Hộp quà — nút bấm */}
        <div style={{position:"relative",zIndex:1,marginBottom:"6px"}}>
          <button className="gift-btn" onClick={()=>setShowQR(true)}
            title="Nhấn để mở hộp quà" aria-label="Mở hộp quà mừng cưới">
            🎁
          </button>
          {!showQR&&(
            <p style={{color:"rgba(255,180,180,.55)",fontSize:"10px",fontFamily:"'Quicksand',sans-serif",fontStyle:"italic",marginTop:"4px",animation:"floatY 2.5s ease-in-out infinite"}}>
              Nhấn vào để mở ✨
            </p>
          )}
        </div>

        {/* QR cards — chỉ hiện sau khi nhấn */}
        {showQR&&(
          <div className="qr-revealed" style={{position:"relative",zIndex:1}}>
            <p style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:"italic",color:"rgba(255,210,210,.88)",fontSize:"20px",marginBottom:"14px",lineHeight:1.3}}>
              💝 Cảm ơn sự quan tâm của bạn!
            </p>
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
                    {gd(qr.img)
                      ?<img src={gd(qr.img)} alt="QR" style={{width:"100%",height:"100%",objectFit:"contain"}}/>
                      :<span style={{fontSize:"8.5px",color:"#999"}}>QR Code</span>}
                  </div>
                  <button onClick={()=>copyText(qr.num,`✓ Đã copy ${qr.num}`)}
                    style={{marginTop:"8px",width:"100%",padding:"5px 0",background:"rgba(255,255,255,.1)",border:"1px solid rgba(255,180,180,.25)",borderRadius:"5px",color:"rgba(255,195,195,.85)",fontSize:"9.5px",fontWeight:600,cursor:"pointer",fontFamily:"'Quicksand',sans-serif",letterSpacing:".08em",transition:"all .2s"}}
                    onMouseEnter={e=>{e.target.style.background="rgba(255,255,255,.18)";}}
                    onMouseLeave={e=>{e.target.style.background="rgba(255,255,255,.1)";}}>
                    📋 Copy số TK
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{background:"#2d0a12",padding:"14px",textAlign:"center"}}>
        <p style={{color:"rgba(255,200,200,.3)",fontSize:"9.5px",fontFamily:"'Quicksand',sans-serif",letterSpacing:".22em"}}>{d.bride} &amp; {d.groom} · {fmtDate(d.wedding_date)} · Huế</p>
      </div>

    </div>
    {lbCur>=0&&<Lightbox imgs={lbImgs} cur={lbCur} onClose={closeLb} onNav={navLb}/>}
    {copyMsg&&<div className="copy-toast">{copyMsg}</div>}

    {/* ── Live Ticker — Fixed bottom, nằm ngoài #pw để position:fixed hoạt động ── */}
    <RSVPFeed/>
  </>);
}// ══════════════════════════════════════════════
// ENVELOPE SCREEN — Bìa thiệp trước khi mở
// Tên người mời lấy từ URL: /TênNgười
// ══════════════════════════════════════════════
function EnvelopeScreen({ d, onOpen }) {
  const [closing, setClosing] = useState(false);

  // Lấy tên người mời từ pathname: /Anh Phú → "Anh Phú"
  const guest = (() => {
    const raw = window.location.pathname.replace(/^\//, "").trim();
    return raw ? decodeURIComponent(raw.replace(/-/g," ")) : "";
  })();

  // Particles nền envelope — static data
  const ENV_PTCS = [
    {e:"🌸",l:"8%",d:"0s",dur:"12s",s:"14px"},
    {e:"❤️",l:"22%",d:"2s",dur:"15s",s:"11px"},
    {e:"✨",l:"38%",d:"4s",dur:"11s",s:"12px"},
    {e:"🌹",l:"55%",d:"1s",dur:"14s",s:"13px"},
    {e:"💕",l:"70%",d:"3s",dur:"13s",s:"10px"},
    {e:"✨",l:"85%",d:"5s",dur:"12s",s:"11px"},
    {e:"🌸",l:"15%",d:"7s",dur:"16s",s:"12px"},
    {e:"❤️",l:"78%",d:"6s",dur:"14s",s:"10px"},
  ];

  const handleOpen = () => {
    // Gọi onOpen NGAY (để trigger nhạc trong gesture context)
    // Sau đó mới chạy animation đóng
    onOpen();  // ← music trigger xảy ra ở đây, trong sync click handler
    setClosing(true);
  };

  return (
    <div id="envelope-screen" className={closing ? "closing" : ""}>
      {/* Particles nền */}
      {ENV_PTCS.map((p,i) => (
        <div key={i} className="env-ptc" style={{
          left:p.l, fontSize:p.s,
          animationDelay:p.d, animationDuration:p.dur,
        }}>{p.e}</div>
      ))}

      <div className="env-card">
        {/* Khung thiệp giấy */}
        <div className="env-frame">
          {/* Chữ Hỉ đôi */}
          <div className="env-hi">囍</div>

          <div className="env-divider"/>

          {/* Kính mời */}
          <p className="env-kinhmoi">Trân trọng kính mời</p>

          {/* Tên người được mời */}
          {guest ? (
            <>
              <p className="env-to">{guest}</p>
              <p className="env-attend">tham dự tiệc cưới của</p>
            </>
          ) : (
            <p className="env-attend" style={{marginBottom:"14px"}}>tham dự tiệc cưới của</p>
          )}

          {/* Tên cô dâu chú rể */}
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",flexWrap:"wrap",gap:"0"}}>
            <span className="env-names">{d.groom || "Viết Định"}</span>
            <span className="env-amp">&amp;</span>
            <span className="env-names">{d.bride || "Bảo Ngân"}</span>
          </div>

          {/* Ngày */}
          <p className="env-date">
            {d.wedding_day || "Thứ Hai"} · {d.wedding_date || "26.04.2026"}
          </p>

          <div className="env-divider"/>
        </div>

        {/* Nút mở thiệp — bên dưới frame, trên nền tối */}
        <button className="env-open-btn" onClick={handleOpen} aria-label="Mở thiệp cưới">
          <span className="env-open-icon">💌</span>
        </button>
        <p className="env-hint">Nhấn để mở thiệp</p>
      </div>
    </div>
  );
}