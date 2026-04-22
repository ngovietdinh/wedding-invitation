// ============================================================
// RSVP SECTION — Green Sage + White Theme
// ============================================================

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = SUPABASE_URL && SUPABASE_KEY ? createClient(SUPABASE_URL, SUPABASE_KEY) : null;

const G = {
  white:"#FFFFFF", offWhite:"#F7F9F6", greenLight:"#E8F0E8",
  greenMid:"#7FA882", green:"#4A7C59", greenDark:"#2D5A3D",
  greenDeep:"#1A3A28", sage:"#8FA892", sageLight:"#B8CCBA",
  serif:"'Playfair Display',Georgia,serif",
  sans:"'DM Sans',sans-serif",
};

function Confetti({ active }) {
  const p = Array.from({length:36},(_,i)=>({
    id:i, x:15+Math.random()*70,
    color:[G.green,G.greenMid,G.sageLight,G.greenDark,G.greenLight][i%5],
    delay:Math.random()*0.8, dur:1.2+Math.random()*1,
    size:4+Math.random()*5,
  }));
  if (!active) return null;
  return (
    <div style={{position:"absolute",inset:0,pointerEvents:"none",overflow:"hidden",zIndex:50}}>
      {p.map(x=>(
        <div key={x.id} style={{
          position:"absolute",left:`${x.x}%`,top:"-8px",
          width:`${x.size}px`,height:`${x.size}px`,
          background:x.color,
          borderRadius:Math.random()>0.5?"50%":"0",
          animation:`cf ${x.dur}s ease-in ${x.delay}s forwards`,opacity:0,
        }}/>
      ))}
      <style>{`@keyframes cf{0%{opacity:1;transform:translateY(0) rotate(0deg)}100%{opacity:0;transform:translateY(380px) rotate(680deg)}}`}</style>
    </div>
  );
}

function ProgressBar({ step, total }) {
  return (
    <div style={{width:"100%",height:"3px",background:G.greenLight,marginBottom:"2rem",borderRadius:"2px"}}>
      <div style={{
        height:"100%",borderRadius:"2px",
        background:`linear-gradient(90deg,${G.green},${G.greenMid})`,
        width:`${(step/total)*100}%`,transition:"width 0.5s ease",
      }}/>
    </div>
  );
}

function Stepper({value,onChange,min=1,max=10}) {
  const btn = (fn,label) => (
    <button onClick={fn} style={{
      width:"44px",height:"44px",
      border:`1px solid ${G.greenLight}`,background:G.offWhite,
      color:G.green,fontSize:"1.3rem",cursor:"pointer",
      fontFamily:G.sans,fontWeight:300,
      display:"flex",alignItems:"center",justifyContent:"center",
      transition:"all 0.2s",
    }}
    onMouseEnter={e=>{e.currentTarget.style.background=G.greenLight;e.currentTarget.style.borderColor=G.greenMid;}}
    onMouseLeave={e=>{e.currentTarget.style.background=G.offWhite;e.currentTarget.style.borderColor=G.greenLight;}}
    >{label}</button>
  );
  return (
    <div style={{display:"flex",alignItems:"center",gap:"1rem",justifyContent:"center"}}>
      {btn(()=>onChange(Math.max(min,value-1)),"−")}
      <span style={{fontFamily:G.serif,fontSize:"2.2rem",fontWeight:400,color:G.greenDeep,minWidth:"2ch",textAlign:"center"}}>{value}</span>
      {btn(()=>onChange(Math.min(max,value+1)),"++"[0])}
    </div>
  );
}

function Chip({label,selected,onClick,emoji}) {
  return (
    <button onClick={onClick} style={{
      padding:"0.65rem 1.2rem",
      border:`1px solid ${selected?G.green:G.greenLight}`,
      background:selected?G.green:G.white,
      color:selected?G.white:G.sage,
      fontFamily:G.sans,fontWeight:300,fontSize:"0.7rem",
      letterSpacing:"0.1em",cursor:"pointer",
      transition:"all 0.22s ease",
      display:"flex",alignItems:"center",gap:"0.45rem",
    }}
    onMouseEnter={e=>{if(!selected){e.currentTarget.style.borderColor=G.greenMid;e.currentTarget.style.color=G.green;}}}
    onMouseLeave={e=>{if(!selected){e.currentTarget.style.borderColor=G.greenLight;e.currentTarget.style.color=G.sage;}}}
    >
      {emoji&&<span style={{fontSize:"0.95rem"}}>{emoji}</span>}
      {label}
    </button>
  );
}

export default function RSVPSection() {
  const TOTAL=5;
  const [step,setStep]=useState(1);
  const [submitting,setSubmitting]=useState(false);
  const [submitted,setSubmitted]=useState(false);
  const [confetti,setConfetti]=useState(false);
  const [error,setError]=useState(null);
  const [form,setForm]=useState({name:"",attending:null,guests:1,meal:"",message:""});
  const go=n=>setStep(n);

  const submit=async()=>{
    if(!supabase){setError("Chưa kết nối Supabase. Kiểm tra file .env.local");return;}
    setSubmitting(true);setError(null);
    try{
      const{error:e}=await supabase.from("rsvp_responses").insert({
        name:form.name,attending:form.attending,
        guests_count:form.attending?form.guests:0,
        meal_preference:form.meal||null,message:form.message||null,
      });
      if(e)throw e;
      setSubmitted(true);setConfetti(true);
      setTimeout(()=>setConfetti(false),3000);
    }catch(err){setError("Lỗi: "+err.message);}
    finally{setSubmitting(false);}
  };

  const S={
    q:{fontFamily:G.serif,fontStyle:"italic",fontWeight:400,fontSize:"clamp(1.1rem,4vw,1.6rem)",color:G.greenDeep,lineHeight:1.3},
    hint:{fontFamily:G.sans,fontWeight:300,fontSize:"0.72rem",color:G.sage,lineHeight:1.6},
    input:{width:"100%",border:"none",borderBottom:`2px solid ${G.greenLight}`,background:"transparent",
      padding:"0.7rem 0",fontFamily:G.serif,fontSize:"1.2rem",color:G.greenDeep,
      textAlign:"center",outline:"none",transition:"border-color 0.2s",},
    textarea:{width:"100%",border:`1px solid ${G.greenLight}`,background:G.offWhite,
      padding:"0.9rem",fontFamily:G.sans,fontWeight:300,fontSize:"0.82rem",
      color:G.greenDeep,outline:"none",resize:"none",lineHeight:1.75,
      transition:"border-color 0.2s",},
    btnNext:{padding:"0.85rem 2.2rem",border:"none",background:G.green,color:G.white,
      fontFamily:G.sans,fontWeight:400,fontSize:"0.68rem",letterSpacing:"0.2em",
      textTransform:"uppercase",cursor:"pointer",transition:"all 0.25s",},
    btnSubmit:{width:"100%",padding:"1rem",border:"none",background:G.greenDark,
      color:G.white,fontFamily:G.sans,fontWeight:400,fontSize:"0.72rem",
      letterSpacing:"0.2em",textTransform:"uppercase",cursor:"pointer",marginTop:"0.5rem",
      transition:"all 0.25s",},
    btnBack:{background:"transparent",border:"none",fontFamily:G.sans,fontWeight:300,
      fontSize:"0.65rem",letterSpacing:"0.2em",color:G.sage,cursor:"pointer",},
    row:{display:"flex",flexDirection:"column",alignItems:"center",gap:"1.2rem",textAlign:"center"},
  };

  const steps={
    1:(
      <div style={S.row}>
        <p style={S.q}>Bạn là ai trong cuộc đời của chúng tôi?</p>
        <p style={S.hint}>Nhập tên hoặc biệt danh bạn muốn chúng tôi gọi</p>
        <input autoFocus type="text" value={form.name} placeholder="Tên của bạn..."
          onChange={e=>setForm(p=>({...p,name:e.target.value}))}
          onKeyDown={e=>e.key==="Enter"&&form.name.trim()&&go(2)}
          onFocus={e=>e.target.style.borderBottomColor=G.green}
          onBlur={e=>e.target.style.borderBottomColor=G.greenLight}
          style={S.input}/>
        <button onClick={()=>go(2)} disabled={!form.name.trim()}
          style={{...S.btnNext,opacity:form.name.trim()?1:0.4}}>Tiếp theo →</button>
      </div>
    ),
    2:(
      <div style={S.row}>
        <p style={S.q}>{form.name||"Bạn"}, có thể đến không?</p>
        <p style={S.hint}>Chúng tôi sẽ rất vui khi được gặp bạn</p>
        <div style={{display:"flex",gap:"0.8rem",flexWrap:"wrap",justifyContent:"center"}}>
          <Chip label="Tôi sẽ có mặt!" emoji="🥂" selected={form.attending===true}
            onClick={()=>{setForm(p=>({...p,attending:true}));go(3);}}/>
          <Chip label="Rất tiếc, không thể" emoji="💌" selected={form.attending===false}
            onClick={()=>{setForm(p=>({...p,attending:false}));go(5);}}/>
        </div>
        <button onClick={()=>go(1)} style={S.btnBack}>← Quay lại</button>
      </div>
    ),
    3:(
      <div style={S.row}>
        <p style={S.q}>Bạn đến cùng mấy người?</p>
        <p style={S.hint}>Bao gồm cả bạn</p>
        <Stepper value={form.guests} onChange={v=>setForm(p=>({...p,guests:v}))}/>
        <p style={{fontFamily:G.serif,fontStyle:"italic",fontSize:"0.9rem",color:G.sage}}>
          {form.guests===1?"Chỉ mình bạn":`${form.guests} người`}
        </p>
        <button onClick={()=>go(4)} style={S.btnNext}>Tiếp theo →</button>
        <button onClick={()=>go(2)} style={S.btnBack}>← Quay lại</button>
      </div>
    ),
    4:(
      <div style={S.row}>
        <p style={S.q}>Sở thích món ăn?</p>
        <p style={S.hint}>Chúng tôi muốn chuẩn bị tốt nhất cho bạn</p>
        <div style={{display:"flex",gap:"0.7rem",flexWrap:"wrap",justifyContent:"center"}}>
          {[{l:"Thịt & Hải sản",e:"🥩",v:"meat_seafood"},{l:"Chỉ Hải sản",e:"🦐",v:"seafood"},
            {l:"Chay",e:"🥗",v:"vegetarian"},{l:"Không yêu cầu",e:"✨",v:"none"}]
            .map(o=><Chip key={o.v} label={o.l} emoji={o.e} selected={form.meal===o.v}
              onClick={()=>setForm(p=>({...p,meal:o.v}))}/>)}
        </div>
        <button onClick={()=>go(5)} disabled={!form.meal}
          style={{...S.btnNext,opacity:form.meal?1:0.4}}>Tiếp theo →</button>
        <button onClick={()=>go(3)} style={S.btnBack}>← Quay lại</button>
      </div>
    ),
    5:(
      <div style={S.row}>
        <p style={S.q}>{form.attending?"Lời chúc gửi đến chúng tôi?":"Lời nhắn muốn gửi?"}</p>
        <p style={S.hint}>{form.attending?"Hãy để lại điều gì đó ấm áp — chúng tôi sẽ trân trọng mãi":"Dù không thể đến, lời chúc của bạn vẫn chạm đến trái tim"}</p>
        <div style={{position:"relative",width:"100%"}}>
          <textarea value={form.message} rows={4} style={S.textarea}
            placeholder={form.attending?"Chúc hai bạn trăm năm hạnh phúc...":"Chúc mừng ngày vui của hai bạn..."}
            onChange={e=>setForm(p=>({...p,message:e.target.value.slice(0,300)}))}
            onFocus={e=>e.target.style.borderColor=G.greenMid}
            onBlur={e=>e.target.style.borderColor=G.greenLight}/>
          <span style={{position:"absolute",bottom:"0.5rem",right:"0.7rem",fontSize:"0.58rem",color:G.sage,fontFamily:G.sans}}>
            {form.message.length}/300
          </span>
        </div>
        {error&&<p style={{color:"#c0392b",fontSize:"0.75rem",fontFamily:G.sans}}>{error}</p>}
        <button onClick={submit} disabled={submitting}
          style={{...S.btnSubmit,opacity:submitting?0.7:1}}>
          {submitting?"Đang gửi...":form.attending?"Xác nhận tham dự 🥂":"Gửi lời chúc 💌"}
        </button>
        <button onClick={()=>go(form.attending?4:2)} style={S.btnBack}>← Quay lại</button>
      </div>
    ),
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;1,400&family=DM+Sans:wght@200;300;400&display=swap');
        .step-in{animation:stepIn 0.4s ease}
        @keyframes stepIn{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        .sp{animation:sp 0.6s cubic-bezier(0.34,1.56,0.64,1)}
        @keyframes sp{from{opacity:0;transform:scale(0.88)}to{opacity:1;transform:scale(1)}}
        .btn-next-hover:hover{background:#2D5A3D !important;transform:translateY(-1px);}
        .btn-submit-hover:hover{background:#1A3A28 !important;}
      `}</style>

      <section id="rsvp" style={{background:G.white,padding:"clamp(4rem,8vw,6rem) 1.5rem",fontFamily:G.sans}}>
        <div style={{maxWidth:"540px",margin:"0 auto",display:"flex",flexDirection:"column",alignItems:"center",gap:"2rem",position:"relative"}}>
          <Confetti active={confetti}/>

          {/* Header */}
          <div style={{textAlign:"center",display:"flex",flexDirection:"column",alignItems:"center",gap:"1rem"}}>
            <div style={{display:"inline-flex",alignItems:"center",gap:"0.8rem"}}>
              <div style={{width:"30px",height:"1px",background:G.greenMid}}/>
              <span style={{fontFamily:G.sans,fontWeight:300,fontSize:"0.6rem",letterSpacing:"0.4em",textTransform:"uppercase",color:G.green}}>
                Xác nhận tham dự
              </span>
              <div style={{width:"30px",height:"1px",background:G.greenMid}}/>
            </div>
            <h2 style={{fontFamily:G.serif,fontStyle:"italic",fontWeight:400,
              fontSize:"clamp(2.5rem,10vw,4rem)",color:G.greenDeep,lineHeight:1,margin:0}}>
              RSVP
            </h2>
            <div style={{background:G.greenLight,padding:"0.5rem 1.5rem",display:"inline-block"}}>
              <p style={{fontFamily:G.sans,fontWeight:300,fontSize:"0.72rem",color:G.green,letterSpacing:"0.05em",margin:0}}>
                Vui lòng xác nhận trước ngày <strong style={{fontWeight:400}}>15 tháng Tư, 2026</strong>
              </p>
            </div>
          </div>

          {/* Card */}
          <div style={{
            width:"100%",border:`1px solid ${G.greenLight}`,
            padding:"clamp(1.5rem,6vw,2.5rem)",background:G.white,
            position:"relative",minHeight:"300px",display:"flex",flexDirection:"column",
            boxShadow:"0 4px 24px rgba(74,124,89,0.06)",
          }}>
            {submitted?(
              <div className="sp" style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"1rem",textAlign:"center",padding:"0.5rem 0"}}>
                <div style={{
                  width:"64px",height:"64px",borderRadius:"50%",
                  background:G.greenLight,border:`1px solid ${G.greenMid}`,
                  display:"flex",alignItems:"center",justifyContent:"center",
                  fontSize:"1.6rem",
                }}>{form.attending?"🥂":"💌"}</div>
                <h3 style={{fontFamily:G.serif,fontStyle:"italic",fontWeight:400,fontSize:"1.8rem",color:G.greenDeep,margin:0}}>
                  {form.attending?"Hẹn gặp bạn nhé!":"Cảm ơn bạn rất nhiều"}
                </h3>
                <p style={{fontFamily:G.sans,fontWeight:300,fontSize:"0.82rem",color:G.sage,lineHeight:1.8,maxWidth:"300px"}}>
                  {form.attending
                    ?`${form.name}, chúng tôi rất vui khi biết bạn sẽ đến. Còn ${Math.max(0,Math.ceil((new Date("2026-04-26")-new Date())/86400000))} ngày nữa thôi!`
                    :`${form.name}, dù bạn không thể đến, lời chúc của bạn là điều chúng tôi trân trọng nhất.`}
                </p>
                <div style={{width:"100%",height:"1px",background:G.greenLight,margin:"0.5rem 0"}}/>
                <p style={{fontFamily:G.serif,fontStyle:"italic",fontSize:"1rem",color:G.green}}>
                  Bảo Ngân &amp; Viết Định
                </p>
              </div>
            ):(
              <>
                <ProgressBar step={step} total={TOTAL}/>
                <p style={{fontFamily:G.sans,fontWeight:300,fontSize:"0.58rem",letterSpacing:"0.35em",
                  textTransform:"uppercase",color:G.greenMid,marginBottom:"1.2rem"}}>
                  Bước {step} / {TOTAL}
                </p>
                <div key={step} className="step-in">{steps[step]}</div>
              </>
            )}
          </div>

          {supabase&&<RSVPStats/>}
        </div>
      </section>
    </>
  );
}

function RSVPStats() {
  const [s,setS]=useState({attending:0,total:0});
  useEffect(()=>{
    const f=async()=>{
      const{data}=await supabase.from("rsvp_responses").select("attending,guests_count");
      if(data){
        const a=data.filter(r=>r.attending).reduce((acc,r)=>acc+(r.guests_count||1),0);
        setS({attending:a,total:data.length});
      }
    };
    f();
    const ch=supabase.channel("rsvp_live")
      .on("postgres_changes",{event:"INSERT",schema:"public",table:"rsvp_responses"},f)
      .subscribe();
    return()=>supabase.removeChannel(ch);
  },[]);
  if(!s.total)return null;
  return(
    <div style={{display:"flex",alignItems:"center",gap:"2rem",
      padding:"1rem 2rem",border:`1px solid #E8F0E8`,background:"#F7F9F6",width:"100%",justifyContent:"center"}}>
      {[{n:s.attending,l:"Khách xác nhận"},{n:s.total,l:"Đã phản hồi"}].map((item,i)=>(
        <>
          {i>0&&<div key={"d"+i} style={{width:"1px",height:"30px",background:"#B8CCBA"}}/>}
          <div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"0.25rem"}}>
            <strong style={{fontFamily:"'Playfair Display',serif",fontSize:"1.5rem",color:"#2D5A3D"}}>{item.n}</strong>
            <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:"0.58rem",letterSpacing:"0.25em",
              textTransform:"uppercase",color:"#8FA892"}}>{item.l}</span>
          </div>
        </>
      ))}
    </div>
  );
}
