// ============================================================
// ADMIN PAGE v4 — Hoàn chỉnh
// Fix: con trỏ không mất, PhotoManager tích hợp,
//      upload ảnh từ máy, căn chỉnh position, chọn bo cong
// ============================================================
import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

const SB_URL = import.meta.env.VITE_SUPABASE_URL;
const SB_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const sb     = SB_URL && SB_KEY ? createClient(SB_URL, SB_KEY) : null;
const ADM_PW = import.meta.env.VITE_ADMIN_PASS || "wedding2026";

// Google Drive URL → direct image
function gd(url) {
  if (!url?.trim()) return "";
  const m = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);
  return m ? `https://lh3.googleusercontent.com/d/${m[1]}` : url;
}

// ══════════════════════════════════════════════
// ADMIN STYLES
// ══════════════════════════════════════════════
function AdminStyle() {
  return (
    <style>{`
@import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@300;400;500;600;700&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
body{background:#f5f0f0;color:#2a1010;font-family:'Quicksand',sans-serif;-webkit-font-smoothing:antialiased;}

.inp,.ta,.sel{
  width:100%;padding:.62rem .85rem;border:1.5px solid #d4b8b8;border-radius:6px;
  background:#fff;color:#2a1010;font-family:'Quicksand',sans-serif;font-weight:400;font-size:.88rem;
  outline:none;transition:border-color .22s;
}
.inp:focus,.ta:focus,.sel:focus{border-color:#631717;}
.ta{resize:vertical;min-height:72px;}
.inp::placeholder,.ta::placeholder{color:#c4a0a0;}

.btn-p{padding:.68rem 1.4rem;border-radius:7px;cursor:pointer;font-family:'Quicksand',sans-serif;font-weight:600;font-size:.8rem;border:none;transition:all .22s;background:linear-gradient(135deg,#631717,#9a2a2a);color:#fff;letter-spacing:.04em;}
.btn-p:hover{opacity:.88;transform:translateY(-1px);}
.btn-p:disabled{opacity:.5;cursor:not-allowed;transform:none;}
.btn-o{padding:.62rem 1.2rem;border-radius:7px;cursor:pointer;font-family:'Quicksand',sans-serif;font-weight:600;font-size:.78rem;background:transparent;color:#7a1f1f;border:1.5px solid #d4b8b8;transition:all .22s;}
.btn-o:hover{background:#faf0f0;border-color:#9a2a2a;}
.btn-o:disabled{opacity:.5;cursor:not-allowed;}
.btn-d{padding:.62rem 1.2rem;border-radius:7px;cursor:pointer;font-family:'Quicksand',sans-serif;font-weight:600;font-size:.78rem;background:#dc2626;color:#fff;border:none;transition:all .22s;}
.btn-d:hover{background:#b91c1c;}
.btn-g{padding:.62rem 1.2rem;border-radius:7px;cursor:pointer;font-family:'Quicksand',sans-serif;font-weight:600;font-size:.78rem;background:#16a34a;color:#fff;border:none;transition:all .22s;}
.btn-g:hover{background:#15803d;}

.card{background:#fff;border:1px solid #e8d8d8;border-radius:12px;padding:1.4rem;margin-bottom:1.1rem;}
.card-t{font-size:.9rem;font-weight:700;color:#631717;margin-bottom:1rem;padding-bottom:.55rem;border-bottom:1px solid #f0e0e0;display:flex;align-items:center;gap:.5rem;}
.field{margin-bottom:1rem;}
.field label{display:block;font-size:.68rem;font-weight:700;color:#8a5050;letter-spacing:.14em;text-transform:uppercase;margin-bottom:.38rem;}
.field-row{display:grid;grid-template-columns:1fr 1fr;gap:.8rem;}
@media(max-width:500px){.field-row{grid-template-columns:1fr;}}

.tab-btn{padding:.72rem 1rem;border:none;background:transparent;font-family:'Quicksand',sans-serif;font-size:.78rem;font-weight:500;color:#8a6060;cursor:pointer;border-bottom:2.5px solid transparent;transition:all .2s;white-space:nowrap;}
.tab-btn.on{color:#631717;border-bottom-color:#631717;font-weight:700;}
.tab-btn:hover:not(.on){color:#7a1f1f;background:#fdf5f5;}

.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:.65rem;margin-bottom:1rem;}
.stat{background:#fff;border:1px solid #e8d8d8;border-radius:10px;padding:.9rem .6rem;text-align:center;}
.stat-n{font-size:1.7rem;font-weight:300;color:#631717;line-height:1;}
.stat-l{font-size:.56rem;letter-spacing:.2em;text-transform:uppercase;color:#a08080;margin-top:.28rem;}
@media(max-width:400px){.stats{grid-template-columns:repeat(2,1fr);}}

.rsvp-row{display:grid;grid-template-columns:1fr auto auto;gap:.5rem;align-items:center;padding:.72rem .5rem;border-bottom:1px solid #f0e0e0;}
.rsvp-row:last-child{border-bottom:none;}
.badge{padding:.18rem .55rem;border-radius:99px;font-size:.62rem;font-weight:600;}
.badge-y{background:#dcfce7;color:#166534;}
.badge-n{background:#fee2e2;color:#991b1b;}

/* PhotoManager card */
.pm-card{border:1px solid #e8d8d8;border-radius:10px;overflow:hidden;background:#fdf5f5;margin-bottom:.9rem;}
.pm-preview{width:100%;aspect-ratio:4/3;background:#f0d0d0;position:relative;overflow:hidden;display:flex;align-items:center;justify-content:center;}
.pm-preview img{width:100%;height:100%;object-fit:cover;display:block;}
.pm-preview-empty{display:flex;flex-direction:column;align-items:center;gap:.3rem;color:#c4a0a0;}
.pm-preview-label{position:absolute;top:0;left:0;right:0;background:linear-gradient(180deg,rgba(60,10,10,.72),transparent);padding:6px 10px;}
.pm-preview-label span{color:#fff;font-size:.62rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;font-family:'Quicksand',sans-serif;}
.pm-preview-clear{position:absolute;top:4px;right:4px;background:rgba(200,30,30,.82);color:#fff;border:none;border-radius:4px;padding:2px 8px;font-size:.62rem;cursor:pointer;font-family:'Quicksand',sans-serif;font-weight:700;}
.pm-body{padding:.8rem;}
.pm-lbl{font-size:.62rem;font-weight:700;color:#8a5050;letter-spacing:.12em;text-transform:uppercase;margin-bottom:.35rem;display:block;}
.pm-url{width:100%;padding:.55rem .75rem;border:1.5px solid #d4b8b8;border-radius:5px;font-size:.78rem;font-family:'Quicksand',sans-serif;outline:none;transition:border-color .22s;background:#fff;color:#2a1010;margin-bottom:.55rem;}
.pm-url:focus{border-color:#631717;}
.pm-upload-row{display:flex;align-items:center;gap:.5rem;margin-bottom:.7rem;flex-wrap:wrap;}
.pos-grid{display:grid;grid-template-columns:repeat(3,30px);gap:3px;}
.pos-btn{width:30px;height:30px;border:1.5px solid #e8d8d8;border-radius:4px;background:transparent;color:#8a5050;font-size:14px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .18s;}
.pos-btn.active{background:#631717;color:#fff;border-color:#631717;font-weight:700;}
.shape-row{display:flex;gap:.4rem;flex-wrap:wrap;margin-top:.6rem;}
.shape-btn{padding:.3rem .7rem;border:1.5px solid #e8d8d8;border-radius:99px;font-size:.68rem;font-weight:600;cursor:pointer;background:transparent;color:#8a5050;font-family:'Quicksand',sans-serif;transition:all .18s;}
.shape-btn.active{background:#631717;color:#fff;border-color:#631717;}

.photos-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:1rem;}

.gal-row{border:1px solid #e8d8d8;border-radius:8px;padding:.85rem;background:#fdf5f5;display:grid;grid-template-columns:68px 1fr auto;gap:.7rem;align-items:center;}
.gal-thumb{width:68px;height:52px;border-radius:5px;overflow:hidden;background:#ecd8d8;display:flex;align-items:center;justify-content:center;font-size:.58rem;color:#a08080;flex-shrink:0;}
.gal-thumb img{width:100%;height:100%;object-fit:cover;}
.gal-inputs{display:flex;flex-direction:column;gap:.4rem;}
.gal-acts{display:flex;flex-direction:column;gap:.28rem;}

.tip{background:#fff8f0;border:1px solid #f0d8b8;border-radius:8px;padding:.85rem 1rem;margin-bottom:1rem;font-size:.75rem;color:#8a4a10;line-height:1.75;}
.tip strong{color:#6a3008;}
.tip code{background:#fef0d8;padding:1px 4px;border-radius:3px;font-size:.72rem;}

#toast{position:fixed;bottom:1.2rem;right:1.2rem;z-index:9999;padding:.7rem 1.2rem;border-radius:9px;font-size:.82rem;font-weight:600;max-width:280px;box-shadow:0 4px 16px rgba(0,0,0,.18);transform:translateY(20px);opacity:0;transition:all .28s;pointer-events:none;}
#toast.show{transform:translateY(0);opacity:1;}
#toast.ok{background:#631717;color:#fff;}
#toast.err{background:#dc2626;color:#fff;}
    `}</style>
  );
}

// ══════════════════════════════════════════════
// FIELD COMPONENTS — định nghĩa NGOÀI component
// để không bị re-create → mất con trỏ
// ══════════════════════════════════════════════
function Field({ label, name, value, onChange, placeholder = "" }) {
  return (
    <div className="field">
      <label htmlFor={name}>{label}</label>
      <input id={name} name={name} className="inp"
        value={value ?? ""} placeholder={placeholder}
        onChange={e => onChange(name, e.target.value)}
        autoComplete="off"/>
    </div>
  );
}

function TA({ label, name, value, onChange, rows = 3 }) {
  return (
    <div className="field">
      <label htmlFor={name}>{label}</label>
      <textarea id={name} name={name} className="ta" rows={rows}
        value={value ?? ""}
        onChange={e => onChange(name, e.target.value)}/>
    </div>
  );
}

// ══════════════════════════════════════════════
// PHOTO MANAGER — định nghĩa NGOÀI, đầy đủ tính năng
// ══════════════════════════════════════════════
const POS_GRID = [
  ["top left","top center","top right"],
  ["center left","center center","center right"],
  ["bottom left","bottom center","bottom right"],
];
const POS_ICON = {
  "top left":"↖","top center":"↑","top right":"↗",
  "center left":"←","center center":"·","center right":"→",
  "bottom left":"↙","bottom center":"↓","bottom right":"↘",
};
const SHAPES = [
  { key:"soft",   lbl:"Mềm" },
  { key:"art",    lbl:"Nghệ thuật" },
  { key:"wave",   lbl:"Sóng" },
  { key:"circle", lbl:"Tròn" },
  { key:"none",   lbl:"Vuông" },
];

function PhotoManager({ label, urlKey, posKey, shapeKey, data, onChange }) {
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState("");
  const fileRef = useRef(null);
  const url     = data[urlKey]   || "";
  const pos     = data[posKey]   || "center center";
  const shape   = data[shapeKey] || "soft";
  const src     = gd(url);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true); setUploadErr("");
    try {
      if (!sb) throw new Error("Chưa kết nối Supabase Storage");
      const ext  = file.name.split(".").pop().toLowerCase();
      const name = `wedding/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: upErr } = await sb.storage.from("wedding-images").upload(name, file, { upsert: true });
      if (upErr) throw upErr;
      const { data: d2 } = sb.storage.from("wedding-images").getPublicUrl(name);
      onChange(urlKey, d2.publicUrl);
    } catch (e) {
      setUploadErr(e.message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="pm-card">
      {/* Preview */}
      <div className="pm-preview">
        {src
          ? <img src={src} alt="" style={{ objectPosition: pos }}
              onError={e => e.target.style.display = "none"}/>
          : <div className="pm-preview-empty"><span style={{ fontSize:"1.8rem" }}>🖼</span><span style={{ fontSize:".65rem" }}>Chưa có ảnh</span></div>
        }
        <div className="pm-preview-label"><span>{label}</span></div>
        {src && <button className="pm-preview-clear" onClick={() => onChange(urlKey, "")}>✕</button>}
      </div>

      <div className="pm-body">
        {/* URL input */}
        <span className="pm-lbl">Link Google Drive hoặc URL ảnh</span>
        <input className="pm-url" value={url} placeholder="https://drive.google.com/... hoặc https://..."
          onChange={e => onChange(urlKey, e.target.value)} autoComplete="off"/>

        {/* Upload từ máy */}
        <div className="pm-upload-row">
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif"
            style={{ display:"none" }} onChange={handleUpload}/>
          <button className="btn-o" onClick={() => fileRef.current?.click()} disabled={uploading}
            style={{ fontSize:".72rem",padding:".35rem .85rem" }}>
            {uploading ? "⏳ Đang upload..." : "📁 Upload từ máy"}
          </button>
          {uploadErr && <span style={{ fontSize:".65rem",color:"#dc2626",flex:1 }}>{uploadErr}</span>}
        </div>

        {/* Căn chỉnh position — chỉ hiện khi có ảnh */}
        {src && (
          <>
            <span className="pm-lbl" style={{ marginTop:".4rem" }}>Căn chỉnh vị trí ảnh</span>
            <div className="pos-grid">
              {POS_GRID.flat().map(p => (
                <button key={p} className={`pos-btn${pos===p?" active":""}`}
                  title={p} onClick={() => onChange(posKey, p)}>
                  {POS_ICON[p]}
                </button>
              ))}
            </div>
            <p style={{ fontSize:".62rem",color:"#a08080",marginTop:".3rem" }}>
              Vị trí: <strong style={{ color:"#631717" }}>{pos}</strong>
            </p>

            {/* Kiểu bo cong */}
            <span className="pm-lbl" style={{ marginTop:".6rem" }}>Kiểu bo cong</span>
            <div className="shape-row">
              {SHAPES.map(s => (
                <button key={s.key} className={`shape-btn${shape===s.key?" active":""}`}
                  onClick={() => onChange(shapeKey, s.key)}>
                  {s.lbl}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════
// GALLERY ROW — định nghĩa NGOÀI để không mất focus
// ══════════════════════════════════════════════
function GalleryRow({ index, img, onChangeItem, onMove, onRemove, isFirst, isLast }) {
  const src = gd(img.url || "");
  return (
    <div className="gal-row">
      <div className="gal-thumb">
        {src
          ? <img src={src} alt="" onError={e => e.target.style.display="none"}/>
          : <span>No img</span>
        }
      </div>
      <div className="gal-inputs">
        <input className="inp" value={img.url || ""} placeholder="Link Google Drive hoặc URL ảnh..."
          style={{ fontSize:".78rem" }}
          onChange={e => onChangeItem(index, "url", e.target.value)}
          autoComplete="off"/>
        <input className="inp" value={img.caption || ""} placeholder="Caption (tuỳ chọn)"
          style={{ fontSize:".78rem" }}
          onChange={e => onChangeItem(index, "caption", e.target.value)}
          autoComplete="off"/>
      </div>
      <div className="gal-acts">
        <button className="btn-o" onClick={() => onMove(index,-1)} disabled={isFirst}
          style={{ padding:".28rem .6rem",fontSize:".7rem" }}>↑</button>
        <button className="btn-o" onClick={() => onMove(index,1)} disabled={isLast}
          style={{ padding:".28rem .6rem",fontSize:".7rem" }}>↓</button>
        <button className="btn-d" onClick={() => onRemove(index)}
          style={{ padding:".28rem .6rem",fontSize:".7rem" }}>🗑</button>
      </div>
    </div>
  );
}

// Toast
function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3200); return () => clearTimeout(t); }, [onClose]);
  return <div id="toast" className={`show ${type==="error"?"err":"ok"}`}>{msg}</div>;
}

// Login
function Login({ onLogin }) {
  const [pass, setPass] = useState("");
  const [err, setErr]   = useState(false);
  const go = () => {
    if (pass === ADM_PW) { onLogin(); sessionStorage.setItem("adm_w","1"); }
    else { setErr(true); setTimeout(()=>setErr(false),1400); }
  };
  return (
    <div style={{ minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:"1.5rem",background:"#f5f0f0" }}>
      <div style={{ width:"100%",maxWidth:"360px" }}>
        <div style={{ textAlign:"center",marginBottom:"1.8rem" }}>
          <div style={{ width:52,height:52,background:"linear-gradient(135deg,#631717,#9a2a2a)",borderRadius:14,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto .8rem",fontSize:"1.4rem" }}>🌹</div>
          <h1 style={{ fontSize:"1.15rem",fontWeight:700,color:"#631717" }}>Wedding Admin</h1>
          <p style={{ fontSize:".75rem",color:"#a08080",marginTop:".2rem" }}>Bảo Ngân &amp; Viết Định</p>
        </div>
        <div className="card">
          <div className="field">
            <label htmlFor="lpw">Mật khẩu</label>
            <input id="lpw" className="inp" type="password" value={pass}
              placeholder="Nhập mật khẩu..."
              style={{ borderColor: err?"#dc2626":undefined }}
              onChange={e=>{setPass(e.target.value);setErr(false);}}
              onKeyDown={e=>e.key==="Enter"&&go()}
              autoComplete="current-password"/>
            {err&&<p style={{ color:"#dc2626",fontSize:".72rem",marginTop:".3rem" }}>Sai mật khẩu</p>}
          </div>
          <button className="btn-p" onClick={go} style={{ width:"100%" }}>Đăng nhập →</button>
        </div>
        <p style={{ textAlign:"center",marginTop:"1rem",fontSize:".7rem",color:"#bbb" }}>
          Đặt pass trong .env: <code style={{ background:"#f0e8e8",padding:"1px 4px",borderRadius:3 }}>VITE_ADMIN_PASS=...</code>
        </p>
        {!sb&&<div style={{ marginTop:"1rem",padding:".8rem",background:"#fef2f2",border:"1px solid #fca5a5",borderRadius:6,fontSize:".75rem",color:"#c04040",textAlign:"center" }}>⚠️ Chưa kết nối Supabase — kiểm tra .env.local</div>}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════
// MAIN ADMIN PAGE
// ══════════════════════════════════════════════
export default function AdminPage() {
  const [auth, setAuth]   = useState(()=>sessionStorage.getItem("adm_w")==="1");
  const [tab, setTab]     = useState("basic");
  const [data, setData]   = useState({});
  const [gallery, setGal] = useState([]);
  const [saving, setSave] = useState(false);
  const [loading, setLoad]= useState(true);
  const [toast, setToast] = useState(null);
  const [rsvps, setRsvps] = useState([]);
  const [q, setQ]         = useState("");

  const showToast = useCallback((msg,type="ok")=>{
    setToast({msg,type}); setTimeout(()=>setToast(null),3500);
  },[]);

  // Load
  useEffect(()=>{
    if(!auth||!sb){setLoad(false);return;}
    Promise.all([
      sb.from("wedding_config").select("*").eq("id",1).single(),
      sb.from("rsvp_responses").select("*").order("created_at",{ascending:false}),
    ]).then(([c,r])=>{
      if(c.data){
        const d=c.data;
        let gal=d.gallery;
        if(typeof gal==="string"){try{gal=JSON.parse(gal);}catch{gal=[];}}
        setData(d);setGal(Array.isArray(gal)?gal:[]);
      }
      if(r.data)setRsvps(r.data);
      setLoad(false);
    });
  },[auth]);

  // handleChange — stable reference để không mất con trỏ
  const handleChange = useCallback((name,val)=>{
    setData(prev=>({...prev,[name]:val}));
  },[]);

  // Save
  const save = async()=>{
    if(!sb){showToast("Chưa kết nối Supabase","error");return;}
    setSave(true);
    try{
      const{error}=await sb.from("wedding_config").upsert({
        ...data,gallery,id:1,updated_at:new Date().toISOString()
      });
      if(error)throw error;
      showToast("✓ Đã lưu thành công!");
    }catch(e){showToast("Lỗi: "+e.message,"error");}
    finally{setSave(false);}
  };

  // RSVP
  const delRsvp=async(id)=>{
    if(!window.confirm("Xóa phản hồi này?"))return;
    await sb.from("rsvp_responses").delete().eq("id",id);
    setRsvps(r=>r.filter(x=>x.id!==id));showToast("✓ Đã xóa");
  };

  const exportCSV=()=>{
    const hdr="ID,Tên,Tham dự,Số người,Lời nhắn,Thời gian\n";
    const rows=rsvps.map(r=>`${r.id},"${r.name}","${r.attending?"Có":"Không"}",${r.guests_count||0},"${(r.message||"").replace(/"/g,'""')}","${r.created_at}"`).join("\n");
    const b=new Blob(["\uFEFF"+hdr+rows],{type:"text/csv;charset=utf-8"});
    const u=URL.createObjectURL(b);const a=document.createElement("a");
    a.href=u;a.download="rsvp.csv";a.click();URL.revokeObjectURL(u);
  };

  const reloadRsvp=()=>{
    if(!sb)return;
    sb.from("rsvp_responses").select("*").order("created_at",{ascending:false}).then(({data:r})=>{if(r)setRsvps(r);});
  };

  // Gallery
  const addGal=()=>setGal(g=>[...g,{url:"",caption:""}]);
  const setGalItem=useCallback((i,key,val)=>{
    setGal(g=>g.map((x,idx)=>idx===i?{...x,[key]:val}:x));
  },[]);
  const removeGal=(i)=>{if(window.confirm("Xóa ảnh này?"))setGal(g=>g.filter((_,idx)=>idx!==i));};
  const moveGal=(i,dir)=>{
    setGal(g=>{const a=[...g];const j=i+dir;if(j<0||j>=a.length)return a;[a[i],a[j]]=[a[j],a[i]];return a;});
  };

  const filtRsvps=rsvps.filter(r=>
    (r.name||"").toLowerCase().includes(q.toLowerCase())||
    (r.message||"").toLowerCase().includes(q.toLowerCase())
  );
  const yesCount=rsvps.filter(r=>r.attending).length;
  const guestTotal=rsvps.filter(r=>r.attending).reduce((s,r)=>s+(r.guests_count||1),0);

  const TABS=[
    {id:"basic",lbl:"👫 Cơ bản"},{id:"ceremony",lbl:"📅 Lịch lễ"},
    {id:"content",lbl:"📝 Nội dung"},{id:"photos",lbl:"🖼 Ảnh chính"},
    {id:"gallery",lbl:"🎞 Gallery"},{id:"media",lbl:"🎵 Media"},
    {id:"qr",lbl:"💳 QR"},{id:"rsvp",lbl:`✉️ RSVP (${rsvps.length})`},
  ];

  const F =(p)=><Field  {...p} onChange={handleChange}/>;
  const TF=(p)=><TA    {...p} onChange={handleChange}/>;
  const PM=(p)=><PhotoManager {...p} data={data} onChange={handleChange}/>;

  if(!auth) return(<><AdminStyle/><Login onLogin={()=>setAuth(true)}/></>);

  return(<>
    <AdminStyle/>
    {toast&&<Toast msg={toast.msg} type={toast.type} onClose={()=>setToast(null)}/>}

    {/* ── HEADER ── */}
    <div style={{ background:"linear-gradient(90deg,#3d0e0e,#7a1f1f)",position:"sticky",top:0,zIndex:100,padding:".75rem 1.2rem",display:"flex",alignItems:"center",justifyContent:"space-between",boxShadow:"0 2px 12px rgba(0,0,0,.25)" }}>
      <div style={{ display:"flex",alignItems:"center",gap:".7rem" }}>
        <div style={{ width:36,height:36,background:"rgba(255,255,255,.15)",borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.1rem" }}>🌹</div>
        <div>
          <p style={{ fontWeight:700,fontSize:".9rem",color:"#fff" }}>Wedding Admin</p>
          <p style={{ fontSize:".62rem",color:"rgba(255,255,255,.6)",marginTop:".05rem" }}>Bảo Ngân &amp; Viết Định · 26.04.2026</p>
        </div>
      </div>
      <div style={{ display:"flex",gap:".5rem" }}>
        <a href="/" target="_blank" style={{ textDecoration:"none" }}>
          <button style={{ padding:".42rem .85rem",borderRadius:6,background:"rgba(255,255,255,.15)",border:"none",color:"#fff",fontSize:".72rem",fontWeight:600,cursor:"pointer",fontFamily:"'Quicksand',sans-serif" }}>🌐 Xem thiệp</button>
        </a>
        <button onClick={()=>{sessionStorage.removeItem("adm_w");setAuth(false);}}
          style={{ padding:".42rem .85rem",borderRadius:6,background:"rgba(220,38,38,.7)",border:"none",color:"#fff",fontSize:".72rem",fontWeight:600,cursor:"pointer",fontFamily:"'Quicksand',sans-serif" }}>
          Đăng xuất
        </button>
      </div>
    </div>

    {/* ── TABS ── */}
    <div style={{ background:"#fff",borderBottom:"1px solid #e8d8d8",display:"flex",overflowX:"auto",padding:"0 1rem",position:"sticky",top:"56px",zIndex:99 }}>
      {TABS.map(t=><button key={t.id} className={`tab-btn${tab===t.id?" on":""}`} onClick={()=>setTab(t.id)}>{t.lbl}</button>)}
    </div>

    {/* ── CONTENT ── */}
    <div style={{ maxWidth:720,margin:"0 auto",padding:"1.3rem 1rem 5rem" }}>
      {loading?(
        <div style={{ textAlign:"center",padding:"3rem",color:"#a08080" }}>Đang tải...</div>
      ):!sb?(
        <div className="card" style={{ textAlign:"center",padding:"2rem" }}>
          <p style={{ fontSize:"1.5rem",marginBottom:".5rem" }}>⚠️</p>
          <p style={{ fontSize:".85rem",color:"#c04040" }}>Chưa kết nối Supabase</p>
          <p style={{ fontSize:".75rem",color:"#a08080",marginTop:".5rem" }}>Kiểm tra .env.local — cần VITE_SUPABASE_URL và VITE_SUPABASE_ANON_KEY</p>
        </div>
      ):(
        <>
          {/* ══ CƠ BẢN ══ */}
          {tab==="basic"&&(<>
            <div className="card">
              <div className="card-t">💍 Thông tin cặp đôi</div>
              <div className="field-row"><F name="bride" label="Tên cô dâu" value={data.bride} placeholder="Bảo Ngân"/><F name="groom" label="Tên chú rể" value={data.groom} placeholder="Viết Định"/></div>
              <div className="field-row"><F name="wedding_date" label="Ngày cưới" value={data.wedding_date} placeholder="26.04.2026"/><F name="wedding_day" label="Thứ" value={data.wedding_day} placeholder="Thứ Hai"/></div>
              <div className="field-row"><F name="wedding_time" label="Giờ cưới" value={data.wedding_time} placeholder="10:00 SA"/><F name="lunar_date" label="Ngày âm lịch" value={data.lunar_date}/></div>
            </div>
            <div className="card">
              <div className="card-t">📍 Địa điểm</div>
              <F name="venue_name" label="Tên địa điểm" value={data.venue_name}/>
              <F name="venue_address" label="Địa chỉ đầy đủ" value={data.venue_address}/>
              <F name="venue_map_url" label="Link Google Maps" value={data.venue_map_url} placeholder="https://maps.google.com/..."/>
            </div>
            <div className="card">
              <div className="card-t">👨‍👩‍👦 Phụ huynh</div>
              <div className="field-row">
                <div><F name="parent_groom_label" label="Nhãn nhà trai" value={data.parent_groom_label}/><TF name="parent_groom_names" label="Tên ba mẹ chú rể" value={data.parent_groom_names} rows={2}/><F name="parent_groom_addr" label="Địa chỉ" value={data.parent_groom_addr}/></div>
                <div><F name="parent_bride_label" label="Nhãn nhà gái" value={data.parent_bride_label}/><TF name="parent_bride_names" label="Tên ba mẹ cô dâu" value={data.parent_bride_names} rows={2}/><F name="parent_bride_addr" label="Địa chỉ" value={data.parent_bride_addr}/></div>
              </div>
            </div>
            <button className="btn-p" onClick={save} disabled={saving} style={{ width:"100%" }}>{saving?"Đang lưu...":"💾 Lưu thông tin cơ bản"}</button>
          </>)}

          {/* ══ LỊCH LỄ ══ */}
          {tab==="ceremony"&&(<>
            <div className="card">
              <div className="card-t">🕐 Lễ 1</div>
              <F name="ceremony1_label" label="Tên lễ" value={data.ceremony1_label}/>
              <div className="field-row"><F name="ceremony1_time" label="Thời gian" value={data.ceremony1_time} placeholder="07:30 SA"/><F name="ceremony1_date" label="Ngày" value={data.ceremony1_date} placeholder="27 . 04 . 2026"/></div>
              <div className="field-row"><F name="ceremony1_lunar" label="Âm lịch" value={data.ceremony1_lunar}/><F name="ceremony1_place" label="Nơi tổ chức" value={data.ceremony1_place}/></div>
              <F name="ceremony1_addr" label="Địa chỉ" value={data.ceremony1_addr}/>
            </div>
            <div className="card">
              <div className="card-t">🕙 Lễ 2</div>
              <F name="ceremony2_label" label="Tên lễ" value={data.ceremony2_label}/>
              <div className="field-row"><F name="ceremony2_time" label="Thời gian" value={data.ceremony2_time} placeholder="10:00 SA"/><F name="ceremony2_date" label="Ngày" value={data.ceremony2_date} placeholder="26 . 04 . 2026"/></div>
              <div className="field-row"><F name="ceremony2_lunar" label="Âm lịch" value={data.ceremony2_lunar}/><F name="ceremony2_place" label="Nơi tổ chức" value={data.ceremony2_place}/></div>
              <F name="ceremony2_addr" label="Địa chỉ" value={data.ceremony2_addr}/>
            </div>
            <button className="btn-p" onClick={save} disabled={saving} style={{ width:"100%" }}>{saving?"Đang lưu...":"💾 Lưu lịch lễ"}</button>
          </>)}

          {/* ══ NỘI DUNG ══ */}
          {tab==="content"&&(<>
            <div className="card">
              <div className="card-t">📄 Section Thư Mời</div>
              <F name="sec_invite_title" label="Tiêu đề" value={data.sec_invite_title}/>
              <F name="sec_invite_sub" label="Chú thích (IN HOA)" value={data.sec_invite_sub}/>
              <TF name="sec_invite_body" label="Nội dung lời mời" value={data.sec_invite_body} rows={4}/>
            </div>
            <div className="card">
              <div className="card-t">📅 Section Lịch</div>
              <F name="sec_cal_title" label="Tiêu đề" value={data.sec_cal_title}/>
              <F name="sec_cal_sub" label="Chú thích" value={data.sec_cal_sub}/>
            </div>
            <div className="card">
              <div className="card-t">💬 Lời mong (section tối)</div>
              <TF name="mong_text" label="Nội dung (xuống dòng = Enter)" value={data.mong_text} rows={2}/>
            </div>
            <div className="card">
              <div className="card-t">✨ Quotes trên ảnh</div>
              <TF name="quote1" label="Quote 1 — trên ảnh đôi lớn" value={data.quote1} rows={3}/>
              <TF name="quote2" label="Quote 2 — bên ảnh nhỏ trái" value={data.quote2} rows={3}/>
              <TF name="quote3" label="Quote 3 — bên ảnh nhỏ phải" value={data.quote3} rows={3}/>
              <TF name="quote4" label="Quote 4 — trên ảnh cặp" value={data.quote4} rows={2}/>
              <TF name="quote5" label="Quote 5 — cuối gallery" value={data.quote5} rows={1}/>
            </div>
            <button className="btn-p" onClick={save} disabled={saving} style={{ width:"100%" }}>{saving?"Đang lưu...":"💾 Lưu nội dung"}</button>
          </>)}

          {/* ══ ẢNH CHÍNH ══ */}
          {tab==="photos"&&(<>
            <div className="tip">
              <strong>📁 Cách dùng:</strong><br/>
              • <strong>Link Google Drive</strong>: Upload ảnh → Chia sẻ → Bất kỳ ai có link → Copy link<br/>
              • <strong>Upload trực tiếp</strong>: Nhấn "Upload từ máy" → ảnh lưu lên Supabase Storage<br/>
              • <strong>Căn chỉnh</strong>: Nhấn vào 9 điểm để chọn phần ảnh hiển thị<br/>
              • <strong>Bo cong</strong>: Chọn kiểu viền phù hợp cho từng ảnh
            </div>
            <div className="photos-grid">
              <PM label="🌟 Ảnh bìa (Hero)"       urlKey="hero_img"    posKey="hero_pos"    shapeKey="hero_shape"/>
              <PM label="👫 Ảnh đôi (Thư Mời)"    urlKey="couple_img"  posKey="couple_pos"  shapeKey="couple_shape"/>
              <PM label="📸 Ảnh lớn (gallery)"     urlKey="photo_large" posKey="large_pos"   shapeKey="large_shape"/>
              <PM label="📷 Ảnh nhỏ trái"          urlKey="photo_sm1"   posKey="sm1_pos"     shapeKey="sm1_shape"/>
              <PM label="📷 Ảnh nhỏ phải"          urlKey="photo_sm2"   posKey="sm2_pos"     shapeKey="sm2_shape"/>
              <PM label="🏞 Ảnh ngang 1"           urlKey="photo_wide1" posKey="wide1_pos"   shapeKey="wide1_shape"/>
              <PM label="🏞 Ảnh ngang 2"           urlKey="photo_wide2" posKey="wide2_pos"   shapeKey="wide2_shape"/>
              <PM label="🖼 Ảnh cặp trái"          urlKey="photo_pair1" posKey="pair1_pos"   shapeKey="pair1_shape"/>
              <PM label="🖼 Ảnh cặp phải"          urlKey="photo_pair2" posKey="pair2_pos"   shapeKey="pair2_shape"/>
              <PM label="🖼 Ảnh toàn trang"        urlKey="photo_full"  posKey="full_pos"    shapeKey="full_shape"/>
            </div>
            <button className="btn-p" onClick={save} disabled={saving} style={{ width:"100%",marginTop:"1rem" }}>{saving?"Đang lưu...":"💾 Lưu ảnh chính"}</button>
          </>)}

          {/* ══ GALLERY ══ */}
          {tab==="gallery"&&(<>
            <div className="tip">
              <strong>🎞 Gallery động</strong> — hiển thị lưới 2 cột trong thiệp.<br/>
              Mỗi ảnh là link Google Drive hoặc URL ảnh bất kỳ.<br/>
              Dùng ↑↓ để sắp xếp thứ tự. Caption hiện trong lightbox khi nhấn vào ảnh.
            </div>
            <div className="card">
              <div className="card-t">
                🎞 Gallery ({gallery.length} ảnh)
                <button className="btn-o" onClick={addGal} style={{ marginLeft:"auto",fontSize:".72rem",padding:".32rem .8rem" }}>+ Thêm ảnh</button>
              </div>
              {gallery.length===0?(
                <div style={{ textAlign:"center",padding:"2rem",color:"#a08080" }}>
                  <p style={{ fontSize:"1.4rem",marginBottom:".5rem" }}>🖼</p>
                  <p style={{ fontSize:".82rem" }}>Chưa có ảnh. Nhấn "+ Thêm ảnh" để bắt đầu.</p>
                </div>
              ):(
                <div style={{ display:"flex",flexDirection:"column",gap:".75rem" }}>
                  {gallery.map((img,i)=>(
                    <GalleryRow key={i} index={i} img={img}
                      onChangeItem={setGalItem} onMove={moveGal} onRemove={removeGal}
                      isFirst={i===0} isLast={i===gallery.length-1}/>
                  ))}
                </div>
              )}
            </div>
            <button className="btn-p" onClick={save} disabled={saving} style={{ width:"100%" }}>{saving?"Đang lưu...":"💾 Lưu gallery"}</button>
          </>)}

          {/* ══ MEDIA ══ */}
          {tab==="media"&&(<>
            <div className="card">
              <div className="card-t">🎵 Nhạc nền YouTube</div>
              <div className="tip" style={{ marginBottom:"1rem" }}>
                Paste URL YouTube bất kỳ, ví dụ:<br/>
                <code>https://www.youtube.com/watch?v=dQw4w9WgXcQ</code><br/>
                Nhạc tự động bật khi khách chạm màn hình lần đầu (kể cả mobile).<br/>
                Khách nhấn nút <strong>♩</strong> góc trên phải để bật/tắt.
              </div>
              <F name="music_youtube" label="Link YouTube (URL đầy đủ)" value={data.music_youtube} placeholder="https://www.youtube.com/watch?v=..."/>
              {data.music_youtube&&(()=>{
                const m=data.music_youtube.match(/[?&]v=([^&]+)/)||data.music_youtube.match(/youtu\.be\/([^?]+)/);
                const id=m?.[1];
                return id?(
                  <div style={{ marginTop:".8rem" }}>
                    <p style={{ fontSize:".75rem",color:"#8a5050",marginBottom:".4rem" }}>Preview:</p>
                    <img src={`https://img.youtube.com/vi/${id}/mqdefault.jpg`}
                      style={{ width:"100%",maxWidth:300,borderRadius:6,border:"1px solid #e8d8d8",display:"block" }}
                      onError={e=>e.target.style.display="none"}/>
                    <p style={{ fontSize:".7rem",color:"#a08080",marginTop:".35rem" }}>Video ID: <strong style={{ color:"#631717" }}>{id}</strong></p>
                  </div>
                ):null;
              })()}
            </div>
            <button className="btn-p" onClick={save} disabled={saving} style={{ width:"100%" }}>{saving?"Đang lưu...":"💾 Lưu nhạc"}</button>
          </>)}

          {/* ══ QR ══ */}
          {tab==="qr"&&(<>
            <div className="card">
              <div className="card-t">💳 QR Chú Rể</div>
              <div className="field-row"><F name="qr_groom_bank" label="Ngân hàng" value={data.qr_groom_bank}/><F name="qr_groom_num" label="Số tài khoản" value={data.qr_groom_num}/></div>
              <F name="qr_groom_name" label="Tên chủ tài khoản (IN HOA)" value={data.qr_groom_name}/>
              <PM label="Ảnh QR Code Chú Rể" urlKey="qr_groom_img" posKey="hero_pos" shapeKey="hero_shape"/>
            </div>
            <div className="card">
              <div className="card-t">💳 QR Cô Dâu</div>
              <div className="field-row"><F name="qr_bride_bank" label="Ngân hàng" value={data.qr_bride_bank}/><F name="qr_bride_num" label="Số tài khoản" value={data.qr_bride_num}/></div>
              <F name="qr_bride_name" label="Tên chủ tài khoản (IN HOA)" value={data.qr_bride_name}/>
              <PM label="Ảnh QR Code Cô Dâu" urlKey="qr_bride_img" posKey="hero_pos" shapeKey="hero_shape"/>
            </div>
            <button className="btn-p" onClick={save} disabled={saving} style={{ width:"100%" }}>{saving?"Đang lưu...":"💾 Lưu QR"}</button>
          </>)}

          {/* ══ RSVP ══ */}
          {tab==="rsvp"&&(<>
            <div className="stats">
              <div className="stat"><div className="stat-n">{rsvps.length}</div><div className="stat-l">Tổng</div></div>
              <div className="stat"><div className="stat-n">{yesCount}</div><div className="stat-l">Sẽ đến</div></div>
              <div className="stat"><div className="stat-n">{rsvps.length-yesCount}</div><div className="stat-l">Vắng</div></div>
              <div className="stat"><div className="stat-n">{guestTotal}</div><div className="stat-l">Khách</div></div>
            </div>
            <div style={{ display:"flex",gap:".6rem",marginBottom:"1rem",flexWrap:"wrap" }}>
              <input className="inp" value={q} placeholder="🔍 Tìm kiếm tên, lời nhắn..."
                style={{ flex:1,minWidth:150 }} onChange={e=>setQ(e.target.value)}/>
              <button className="btn-g" onClick={exportCSV}>⬇ CSV</button>
              <button className="btn-o" onClick={reloadRsvp}>↻ Tải lại</button>
            </div>
            <div className="card" style={{ padding:0 }}>
              {filtRsvps.length===0?(
                <div style={{ padding:"2rem",textAlign:"center",color:"#a08080",fontSize:".85rem" }}>Chưa có phản hồi</div>
              ):filtRsvps.map(r=>(
                <div key={r.id} className="rsvp-row">
                  <div>
                    <p style={{ fontWeight:600,fontSize:".84rem",color:"#2a1010" }}>{r.name}</p>
                    {r.message&&<p style={{ fontSize:".72rem",color:"#8a5050",fontStyle:"italic",marginTop:".1rem" }}>"{r.message}"</p>}
                    <p style={{ fontSize:".62rem",color:"#a08080",marginTop:".15rem" }}>{r.created_at?.slice(0,16).replace("T"," ")}</p>
                  </div>
                  <span className={`badge ${r.attending?"badge-y":"badge-n"}`}>{r.attending?`✓ ${r.guests_count||1} người`:"✗ Vắng"}</span>
                  <button className="btn-d" onClick={()=>delRsvp(r.id)} style={{ padding:".3rem .6rem",fontSize:".72rem" }}>🗑</button>
                </div>
              ))}
            </div>
          </>)}
        </>
      )}
    </div>
  </>);
}