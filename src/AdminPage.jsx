// ============================================================
// ADMIN PAGE v4 — Hoàn chỉnh
// Fix: con trỏ không mất, PhotoManager tích hợp,
//      upload ảnh từ máy, căn chỉnh position, chọn bo cong
// ============================================================
import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

const SB_URL = import.meta.env.VITE_SUPABASE_URL;
const SB_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const sb = SB_URL && SB_KEY ? createClient(SB_URL, SB_KEY, {
  auth: { persistSession: true, storageKey: "wedding-sb-auth" }
}) : null;
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
.pm-preview:active{cursor:grabbing!important;}
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

/* Gallery card mới — dạng ảnh lớn với drag-to-pan */
.gal-card{
  border:1px solid #e8d8d8;border-radius:10px;
  overflow:hidden;background:#fdf5f5;
  position:relative;
}
.gal-card-preview{
  width:100%;aspect-ratio:4/3;
  background:#f0d0d0;
  position:relative;overflow:hidden;
  display:flex;align-items:center;justify-content:center;
  cursor:grab;user-select:none;touch-action:none;
}
.gal-card-preview:active{cursor:grabbing;}
.gal-card-preview img{
  width:100%;height:100%;object-fit:cover;display:block;pointer-events:none;
}
.gal-card-preview-empty{
  display:flex;flex-direction:column;align-items:center;gap:.4rem;color:#c4a0a0;
}
.gal-card-order{
  position:absolute;top:5px;left:5px;
  background:rgba(99,23,23,.75);color:#fff;
  font-size:9px;font-weight:700;padding:2px 7px;border-radius:99px;
  font-family:'Quicksand',sans-serif;
}
.gal-card-size{
  position:absolute;top:5px;right:5px;
  background:rgba(0,0,0,.5);color:rgba(255,255,255,.85);
  font-size:8px;padding:2px 6px;border-radius:4px;
  font-family:'Quicksand',sans-serif;
}
.gal-card-actions{
  position:absolute;bottom:0;left:0;right:0;
  background:linear-gradient(transparent,rgba(0,0,0,.6));
  padding:20px 6px 6px;
  display:flex;gap:4px;
  opacity:0;transition:opacity .2s;
}
.gal-card:hover .gal-card-actions{opacity:1;}
.gal-card-body{padding:.65rem;}
.gal-caption-inp{
  width:100%;padding:5px 8px;font-size:.78rem;
  border:1.5px solid #e0c8c8;border-radius:5px;
  font-family:'Quicksand',sans-serif;outline:none;background:#fff;color:#2a1010;
  transition:border-color .2s;margin-bottom:.45rem;
}
.gal-caption-inp:focus{border-color:#631717;}
.gal-caption-inp::placeholder{color:#c4a0a0;}
.gal-card-btns{display:flex;gap:.3rem;flex-wrap:wrap;}

/* Upload drop zone */
.gal-dropzone{
  border:2px dashed #d4b0b0;border-radius:10px;
  padding:1.4rem;text-align:center;cursor:pointer;
  transition:all .22s;background:#fdf5f5;margin-bottom:1rem;
}
.gal-dropzone:hover,.gal-dropzone.over{border-color:#631717;background:#fdf0f0;}
.gal-dropzone input{display:none;}

/* Masonry preview grid */
.gal-mosaic{
  display:grid;
  grid-template-columns:repeat(auto-fill,minmax(160px,1fr));
  gap:.75rem;
}

/* Copy button */
.copy-btn{
  display:inline-flex;align-items:center;gap:4px;
  padding:.3rem .75rem;border-radius:20px;
  background:rgba(99,23,23,.1);border:1px solid rgba(99,23,23,.25);
  color:#631717;font-size:.7rem;font-weight:600;
  font-family:'Quicksand',sans-serif;cursor:pointer;
  transition:all .2s;
}
.copy-btn:hover{background:rgba(99,23,23,.18);border-color:#631717;}
.copy-btn.copied{background:#631717;color:#fff;border-color:#631717;}

.tip{background:#fff8f0;border:1px solid #f0d8b8;border-radius:8px;padding:.85rem 1rem;margin-bottom:1rem;font-size:.75rem;color:#8a4a10;line-height:1.75;}
.tip strong{color:#6a3008;}
.tip code{background:#fef0d8;padding:1px 4px;border-radius:3px;font-size:.72rem;}

/* Love Story editor */
.story-card{border:1px solid #e8d8d8;border-radius:10px;padding:1rem;background:#fdf5f5;margin-bottom:.8rem;}
.story-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:.75rem;}
.story-num{font-size:.72rem;font-weight:700;color:#631717;background:#fde8e8;padding:2px 9px;border-radius:99px;}
.story-fields{display:flex;flex-direction:column;gap:.55rem;}
.story-row{display:grid;grid-template-columns:80px 80px 1fr;gap:.5rem;}

/* Map preview */
.map-preview-box{width:100%;height:220px;border-radius:8px;overflow:hidden;border:1.5px solid #e8d8d8;background:#e8d0c8;position:relative;}
.map-preview-box iframe{width:100%;height:100%;border:none;display:block;}

/* Coordinate inputs */
.coord-row{display:grid;grid-template-columns:1fr 1fr;gap:.6rem;margin-bottom:.7rem;}

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
  const fileRef    = useRef(null);
  const previewRef = useRef(null);
  const dragRef    = useRef({dragging:false,startX:0,startY:0,startPX:0,startPY:0});
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

  // Drag to pan — kéo để căn chỉnh vùng hiển thị
  const parsePct = (posStr) => {
    const p = (posStr||"50% 50%").trim().split(/\s+/);
    return [parseFloat(p[0])||50, parseFloat(p[1])||50];
  };

  const onMouseDown = (e) => {
    if (!src) return;
    e.preventDefault();
    const [px,py] = parsePct(pos);
    dragRef.current = {dragging:true,startX:e.clientX,startY:e.clientY,startPX:px,startPY:py};
    const onMove = (em) => {
      if (!dragRef.current.dragging) return;
      const box = previewRef.current?.getBoundingClientRect();
      if (!box) return;
      const dx = (em.clientX - dragRef.current.startX) / box.width  * 100;
      const dy = (em.clientY - dragRef.current.startY) / box.height * 100;
      const nx = Math.max(0,Math.min(100, dragRef.current.startPX - dx));
      const ny = Math.max(0,Math.min(100, dragRef.current.startPY - dy));
      onChange(posKey, `${nx.toFixed(1)}% ${ny.toFixed(1)}%`);
    };
    const onUp = () => { dragRef.current.dragging=false; window.removeEventListener("mousemove",onMove); window.removeEventListener("mouseup",onUp); };
    window.addEventListener("mousemove",onMove);
    window.addEventListener("mouseup",onUp);
  };

  const onTouchStart = (e) => {
    if (!src) return;
    const touch = e.touches[0];
    const [px,py] = parsePct(pos);
    dragRef.current = {dragging:true,startX:touch.clientX,startY:touch.clientY,startPX:px,startPY:py};
  };
  const onTouchMove = (e) => {
    if (!dragRef.current.dragging||!src) return;
    e.preventDefault();
    const touch = e.touches[0];
    const box = previewRef.current?.getBoundingClientRect();
    if (!box) return;
    const dx = (touch.clientX - dragRef.current.startX) / box.width  * 100;
    const dy = (touch.clientY - dragRef.current.startY) / box.height * 100;
    const nx = Math.max(0,Math.min(100, dragRef.current.startPX - dx));
    const ny = Math.max(0,Math.min(100, dragRef.current.startPY - dy));
    onChange(posKey, `${nx.toFixed(1)}% ${ny.toFixed(1)}%`);
  };

  return (
    <div className="pm-card">
      {/* Preview — kéo để pan */}
      <div className="pm-preview" ref={previewRef}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        style={{cursor:src?"grab":"default",userSelect:"none",touchAction:"none"}}>
        {src
          ? <img src={src} alt="" style={{ objectPosition: pos, width:"100%", height:"100%", objectFit:"cover", display:"block", pointerEvents:"none" }}
              onError={e => e.target.style.display = "none"}/>
          : <div className="pm-preview-empty"><span style={{ fontSize:"1.8rem" }}>🖼</span><span style={{ fontSize:".65rem" }}>Chưa có ảnh</span></div>
        }
        <div className="pm-preview-label"><span>{label}</span>{src&&<span style={{fontSize:".58rem",opacity:.8,marginLeft:"4px"}}>✥ Kéo để căn</span>}</div>
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
            <p style={{ fontSize:".62rem",color:"#a08080",marginTop:".2rem",marginBottom:".5rem" }}>
              ✥ <strong>Kéo ảnh</strong> để căn chỉnh vùng hiển thị &nbsp;|&nbsp; Vị trí: <strong style={{ color:"#631717" }}>{pos}</strong>
            </p>
            {/* Reset về center */}
            <button className="btn-o" onClick={() => onChange(posKey,"50% 50%")}
              style={{ fontSize:".65rem",padding:".28rem .7rem",marginBottom:".6rem" }}>
              ↺ Reset về giữa
            </button>

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
// Upload ảnh gallery lên Supabase Storage
async function uploadGalImg(file, showToast) {
  if (!sb) throw new Error("Chưa kết nối Supabase");
  const ext  = file.name.split(".").pop().toLowerCase();
  const name = `gallery/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await sb.storage.from("wedding-images").upload(name, file, { upsert:true });
  if (error) throw error;
  const { data } = sb.storage.from("wedding-images").getPublicUrl(name);
  return data.publicUrl;
}

// GalleryCard — định nghĩa NGOÀI để không mất con trỏ
function GalleryCard({ index, img, total, onChangeItem, onMove, onRemove, showToast }) {
  const [uploading, setUploading] = useState(false);
  const fileRef    = useRef(null);
  const previewRef = useRef(null);
  const dragRef    = useRef({ dragging:false, sx:0, sy:0, spx:50, spy:50 });

  const src = gd(img.url || "");
  const pos = img.pos || "50% 50%";

  // Parse "X% Y%"
  const parsePct = (p) => {
    const parts = (p || "50% 50%").trim().split(/\s+/);
    return [parseFloat(parts[0])||50, parseFloat(parts[1])||50];
  };

  // Drag-to-pan
  const onMD = (e) => {
    if (!src) return;
    e.preventDefault();
    const [px, py] = parsePct(pos);
    dragRef.current = { dragging:true, sx:e.clientX, sy:e.clientY, spx:px, spy:py };
    const onMove = (em) => {
      if (!dragRef.current.dragging) return;
      const box = previewRef.current?.getBoundingClientRect();
      if (!box) return;
      const dx = (em.clientX - dragRef.current.sx) / box.width  * 100;
      const dy = (em.clientY - dragRef.current.sy) / box.height * 100;
      const nx = Math.max(0, Math.min(100, dragRef.current.spx - dx));
      const ny = Math.max(0, Math.min(100, dragRef.current.spy - dy));
      onChangeItem(index, "pos", `${nx.toFixed(1)}% ${ny.toFixed(1)}%`);
    };
    const onUp = () => { dragRef.current.dragging=false; window.removeEventListener("mousemove",onMove); window.removeEventListener("mouseup",onUp); };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup",   onUp);
  };

  // Touch drag
  const [touch0, setTouch0] = useState(null);
  const onTS = (e) => {
    if (!src) return;
    const t = e.touches[0];
    const [px, py] = parsePct(pos);
    dragRef.current = { dragging:true, sx:t.clientX, sy:t.clientY, spx:px, spy:py };
    setTouch0({ x:t.clientX, y:t.clientY });
  };
  const onTM = (e) => {
    if (!dragRef.current.dragging||!src) return;
    e.preventDefault();
    const t = e.touches[0];
    const box = previewRef.current?.getBoundingClientRect();
    if (!box) return;
    const dx = (t.clientX - dragRef.current.sx) / box.width  * 100;
    const dy = (t.clientY - dragRef.current.sy) / box.height * 100;
    const nx = Math.max(0, Math.min(100, dragRef.current.spx - dx));
    const ny = Math.max(0, Math.min(100, dragRef.current.spy - dy));
    onChangeItem(index, "pos", `${nx.toFixed(1)}% ${ny.toFixed(1)}%`);
  };

  // Upload
  const handleUpload = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true);
    try {
      const url = await uploadGalImg(file, showToast);
      onChangeItem(index, "url", url);
      showToast("✓ Upload thành công!");
    } catch(err) {
      showToast("Lỗi upload: " + err.message, "error");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  // Size options để tạo layout mosaic
  const SIZE_OPTS = [
    { key:"1x1", lbl:"Vuông" },
    { key:"2x1", lbl:"Ngang" },
    { key:"1x2", lbl:"Dọc" },
  ];

  return (
    <div className="gal-card">
      {/* Preview + drag */}
      <div ref={previewRef} className="gal-card-preview"
        onMouseDown={onMD} onTouchStart={onTS} onTouchMove={onTM}
        style={{ touchAction:"none" }}>
        {src
          ? <img src={src} alt="" style={{ objectPosition: pos }} onError={e=>e.target.style.display="none"}/>
          : <div className="gal-card-preview-empty"><span style={{fontSize:"1.8rem"}}>🖼</span><span style={{fontSize:".65rem"}}>Chưa có ảnh — Kéo để căn chỉnh</span></div>
        }
        <div className="gal-card-order">#{index+1}</div>
        {src && <div className="gal-card-size">{img.size||"1x1"} · {pos}</div>}
        {/* Actions overlay */}
        <div className="gal-card-actions">
          <button onClick={()=>onMove(index,-1)} disabled={index===0}
            style={{flex:1,padding:"3px",background:"rgba(255,255,255,.18)",border:"none",color:"#fff",borderRadius:4,cursor:"pointer",fontSize:".65rem",fontWeight:700}}>↑</button>
          <button onClick={()=>onMove(index,1)} disabled={index===total-1}
            style={{flex:1,padding:"3px",background:"rgba(255,255,255,.18)",border:"none",color:"#fff",borderRadius:4,cursor:"pointer",fontSize:".65rem",fontWeight:700}}>↓</button>
          <button onClick={()=>onRemove(index)}
            style={{flex:1,padding:"3px",background:"rgba(220,38,38,.7)",border:"none",color:"#fff",borderRadius:4,cursor:"pointer",fontSize:".65rem",fontWeight:700}}>🗑</button>
        </div>
      </div>

      <div className="gal-card-body">
        {/* URL input */}
        <input className="gal-caption-inp" value={img.url||""} placeholder="Link Google Drive hoặc URL ảnh..."
          onChange={e=>onChangeItem(index,"url",e.target.value)} autoComplete="off"/>

        {/* Caption */}
        <input className="gal-caption-inp" value={img.caption||""} placeholder="Caption (tuỳ chọn)..."
          onChange={e=>onChangeItem(index,"caption",e.target.value)} autoComplete="off"/>

        {/* Buttons */}
        <div className="gal-card-btns">
          <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={handleUpload}/>
          <button className="btn-o" onClick={()=>fileRef.current?.click()} disabled={uploading}
            style={{fontSize:".68rem",padding:".3rem .75rem"}}>
            {uploading?"⏳ Upload...":"📁 Upload"}
          </button>
          {src&&<button className="btn-o" onClick={()=>onChangeItem(index,"pos","50% 50%")}
            style={{fontSize:".68rem",padding:".3rem .75rem"}}>↺ Reset vị trí</button>}
          {/* Size chọn layout */}
          {SIZE_OPTS.map(s=>(
            <button key={s.key}
              onClick={()=>onChangeItem(index,"size",s.key)}
              style={{fontSize:".65rem",padding:".25rem .6rem",borderRadius:99,border:"1.5px solid",
                borderColor:(img.size||"1x1")===s.key?"#631717":"#e0c8c8",
                background:(img.size||"1x1")===s.key?"#631717":"transparent",
                color:(img.size||"1x1")===s.key?"#fff":"#8a5050",
                cursor:"pointer",fontFamily:"'Quicksand',sans-serif",fontWeight:600}}>
              {s.lbl}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── LoveStoryCard — định nghĩa NGOÀI để không mất con trỏ ──
function LoveStoryCard({ index, story, onChange, onRemove, onMove, isFirst, isLast }) {
  const EMOJIS = ["❤️","💑","💍","✈️","🌹","🎉","💒","🥂","📸","🌙","⭐","🎶"];
  return (
    <div className="story-card">
      <div className="story-header">
        <span className="story-num">Mốc #{index + 1}</span>
        <div style={{display:"flex",gap:".3rem"}}>
          <button className="btn-o" onClick={()=>onMove(index,-1)} disabled={isFirst}
            style={{padding:".25rem .55rem",fontSize:".7rem"}}>↑</button>
          <button className="btn-o" onClick={()=>onMove(index,1)} disabled={isLast}
            style={{padding:".25rem .55rem",fontSize:".7rem"}}>↓</button>
          <button className="btn-d" onClick={()=>onRemove(index)}
            style={{padding:".25rem .55rem",fontSize:".7rem"}}>🗑</button>
        </div>
      </div>
      <div className="story-fields">
        {/* Row 1: date + emoji + title */}
        <div className="story-row">
          <div>
            <label style={{display:"block",fontSize:".62rem",fontWeight:700,color:"#8a5050",letterSpacing:".1em",textTransform:"uppercase",marginBottom:".3rem"}}>Thời gian</label>
            <input className="inp" value={story.date||""} placeholder="01.2022"
              style={{fontSize:".78rem"}} autoComplete="off"
              onChange={e=>onChange(index,"date",e.target.value)}/>
          </div>
          <div>
            <label style={{display:"block",fontSize:".62rem",fontWeight:700,color:"#8a5050",letterSpacing:".1em",textTransform:"uppercase",marginBottom:".3rem"}}>Emoji</label>
            <select className="sel" value={story.emoji||"❤️"} style={{fontSize:".82rem"}}
              onChange={e=>onChange(index,"emoji",e.target.value)}>
              {EMOJIS.map(e=><option key={e} value={e}>{e}</option>)}
            </select>
          </div>
          <div>
            <label style={{display:"block",fontSize:".62rem",fontWeight:700,color:"#8a5050",letterSpacing:".1em",textTransform:"uppercase",marginBottom:".3rem"}}>Tiêu đề</label>
            <input className="inp" value={story.title||""} placeholder="Lần đầu gặp nhau..."
              style={{fontSize:".78rem"}} autoComplete="off"
              onChange={e=>onChange(index,"title",e.target.value)}/>
          </div>
        </div>
        {/* Row 2: nội dung */}
        <div>
          <label style={{display:"block",fontSize:".62rem",fontWeight:700,color:"#8a5050",letterSpacing:".1em",textTransform:"uppercase",marginBottom:".3rem"}}>Câu chuyện</label>
          <textarea className="ta" rows={2} value={story.body||""}
            placeholder="Kể câu chuyện về mốc này..."
            onChange={e=>onChange(index,"body",e.target.value)}/>
        </div>
      </div>
    </div>
  );
}

// ── GalleryDropzone — kéo thả hoặc chọn nhiều ảnh ──
function GalleryDropzone({ onAddItems, showToast }) {
  const [over, setOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const processFiles = async (files) => {
    if (!files || !files.length) return;
    setUploading(true);
    const newItems = [];
    for (const file of Array.from(files)) {
      try {
        if (!sb) {
          // Không có Supabase — dùng URL object preview tạm
          const url = URL.createObjectURL(file);
          newItems.push({ url, caption: file.name.replace(/\.[^.]+$/, ""), pos:"50% 50%", size:"1x1" });
        } else {
          const ext  = file.name.split(".").pop().toLowerCase();
          const name = `gallery/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
          const { error } = await sb.storage.from("wedding-images").upload(name, file, { upsert:true });
          if (error) throw error;
          const { data } = sb.storage.from("wedding-images").getPublicUrl(name);
          newItems.push({ url: data.publicUrl, caption: "", pos:"50% 50%", size:"1x1" });
        }
      } catch(err) {
        showToast("Lỗi upload: " + err.message, "error");
      }
    }
    if (newItems.length) {
      onAddItems(newItems);
      showToast(`✓ Đã thêm ${newItems.length} ảnh!`);
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className={`gal-dropzone${over?" over":""}`}
      onDragOver={e=>{e.preventDefault();setOver(true);}}
      onDragLeave={()=>setOver(false)}
      onDrop={e=>{e.preventDefault();setOver(false);processFiles(e.dataTransfer.files);}}
      onClick={()=>fileRef.current?.click()}>
      <input ref={fileRef} type="file" accept="image/*" multiple onChange={e=>processFiles(e.target.files)}/>
      <div style={{fontSize:"2rem",marginBottom:".4rem"}}>{uploading?"⏳":"📁"}</div>
      <p style={{fontSize:".82rem",fontWeight:600,color:"#7a4040",marginBottom:".2rem"}}>
        {uploading?"Đang upload ảnh...":"Kéo thả ảnh vào đây để upload"}
      </p>
      <p style={{fontSize:".72rem",color:"#a08080"}}>Hỗ trợ JPG, PNG, WebP · Chọn nhiều ảnh cùng lúc</p>
    </div>
  );
}

// ── CopyRow — nút copy số tài khoản ──
function CopyRow({ label, text }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(()=>{
      setCopied(true);
      setTimeout(()=>setCopied(false), 2000);
    }).catch(()=>{
      // Fallback
      const el = document.createElement("textarea");
      el.value = text; document.body.appendChild(el);
      el.select(); document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(()=>setCopied(false), 2000);
    });
  };
  return (
    <div style={{display:"flex",alignItems:"center",gap:".5rem",marginBottom:".8rem"}}>
      <code style={{flex:1,padding:".4rem .75rem",background:"#fdf5f5",border:"1px solid #e8d8d8",borderRadius:6,fontSize:".82rem",color:"#631717",fontWeight:700,letterSpacing:".05em"}}>{text}</code>
      <button className={`copy-btn${copied?" copied":""}`} onClick={copy}>
        {copied?"✓ Đã copy":"📋 Copy"}
      </button>
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
        // Parse gallery
        let gal=d.gallery;
        if(typeof gal==="string"){try{gal=JSON.parse(gal);}catch{gal=[];}}
        // Parse love_story
        let ls=d.love_story;
        if(typeof ls==="string"){try{ls=JSON.parse(ls);}catch{ls=[];}}
        setData({...d, love_story:Array.isArray(ls)?ls:[]});
        setGal(Array.isArray(gal)?gal:[]);
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
      const payload = {
        ...data,
        gallery,
        id: 1,
        updated_at: new Date().toISOString(),
        // Đảm bảo JSONB fields là array
        love_story: Array.isArray(data.love_story) ? data.love_story : [],
      };
      const{error}=await sb.from("wedding_config").upsert(payload);
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
    {id:"basic",    lbl:"👫 Cơ bản"},
    {id:"ceremony", lbl:"📅 Lịch lễ"},
    {id:"content",  lbl:"📝 Nội dung"},
    {id:"photos",   lbl:"🖼 Ảnh"},
    {id:"gallery",  lbl:"🎞 Gallery"},
    {id:"lovemap",  lbl:"💑 Chuyện tình"},
    {id:"media",    lbl:"🎵 Media"},
    {id:"qr",       lbl:"💳 QR"},
    {id:"rsvp",     lbl:`✉️ RSVP (${rsvps.length})`},
  ];

  // KHÔNG dùng shorthand inline vì tạo mới function mỗi render → mất focus
  // Dùng trực tiếp với handleChange stable

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
              <div className="field-row"><Field name="bride" label="Tên cô dâu" value={data.bride} placeholder="Bảo Ngân" onChange={handleChange}/><Field name="groom" label="Tên chú rể" value={data.groom} placeholder="Viết Định" onChange={handleChange}/></div>
              <div className="field-row"><Field name="wedding_date" label="Ngày cưới" value={data.wedding_date} placeholder="26.04.2026" onChange={handleChange}/><Field name="wedding_day" label="Thứ" value={data.wedding_day} placeholder="Thứ Hai" onChange={handleChange}/></div>
              <div className="field-row"><Field name="wedding_time" label="Giờ cưới" value={data.wedding_time} placeholder="10:00 SA" onChange={handleChange}/><Field name="lunar_date" label="Ngày âm lịch" value={data.lunar_date} onChange={handleChange}/></div>
            </div>
            <div className="card">
              <div className="card-t">📍 Địa điểm</div>
              <Field name="venue_name" label="Tên địa điểm" value={data.venue_name} onChange={handleChange}/>
              <Field name="venue_address" label="Địa chỉ đầy đủ" value={data.venue_address} onChange={handleChange}/>
              <Field name="venue_map_url" label="Link Google Maps" value={data.venue_map_url} placeholder="https://maps.google.com/..." onChange={handleChange}/>
            </div>
            <div className="card">
              <div className="card-t">👨‍👩‍👦 Phụ huynh</div>
              <div className="field-row">
                <div><Field name="parent_groom_label" label="Nhãn nhà trai" value={data.parent_groom_label} onChange={handleChange}/><TA name="parent_groom_names" label="Tên ba mẹ chú rể" value={data.parent_groom_names} rows={2} onChange={handleChange}/><Field name="parent_groom_addr" label="Địa chỉ" value={data.parent_groom_addr} onChange={handleChange}/></div>
                <div><Field name="parent_bride_label" label="Nhãn nhà gái" value={data.parent_bride_label} onChange={handleChange}/><TA name="parent_bride_names" label="Tên ba mẹ cô dâu" value={data.parent_bride_names} rows={2} onChange={handleChange}/><Field name="parent_bride_addr" label="Địa chỉ" value={data.parent_bride_addr} onChange={handleChange}/></div>
              </div>
            </div>
            <button className="btn-p" onClick={save} disabled={saving} style={{ width:"100%" }}>{saving?"Đang lưu...":"💾 Lưu thông tin cơ bản"}</button>
          </>)}

          {/* ══ LỊCH LỄ ══ */}
          {tab==="ceremony"&&(<>
            <div className="card">
              <div className="card-t">🕐 Lễ 1</div>
              <Field name="ceremony1_label" label="Tên lễ" value={data.ceremony1_label} onChange={handleChange}/>
              <div className="field-row"><Field name="ceremony1_time" label="Thời gian" value={data.ceremony1_time} placeholder="07:30 SA" onChange={handleChange}/><Field name="ceremony1_date" label="Ngày" value={data.ceremony1_date} placeholder="27 . 04 . 2026" onChange={handleChange}/></div>
              <div className="field-row"><Field name="ceremony1_lunar" label="Âm lịch" value={data.ceremony1_lunar} onChange={handleChange}/><Field name="ceremony1_place" label="Nơi tổ chức" value={data.ceremony1_place} onChange={handleChange}/></div>
              <Field name="ceremony1_addr" label="Địa chỉ" value={data.ceremony1_addr} onChange={handleChange}/>
            </div>
            <div className="card">
              <div className="card-t">🕙 Lễ 2</div>
              <Field name="ceremony2_label" label="Tên lễ" value={data.ceremony2_label} onChange={handleChange}/>
              <div className="field-row"><Field name="ceremony2_time" label="Thời gian" value={data.ceremony2_time} placeholder="10:00 SA" onChange={handleChange}/><Field name="ceremony2_date" label="Ngày" value={data.ceremony2_date} placeholder="26 . 04 . 2026" onChange={handleChange}/></div>
              <div className="field-row"><Field name="ceremony2_lunar" label="Âm lịch" value={data.ceremony2_lunar} onChange={handleChange}/><Field name="ceremony2_place" label="Nơi tổ chức" value={data.ceremony2_place} onChange={handleChange}/></div>
              <Field name="ceremony2_addr" label="Địa chỉ" value={data.ceremony2_addr} onChange={handleChange}/>
            </div>
            <button className="btn-p" onClick={save} disabled={saving} style={{ width:"100%" }}>{saving?"Đang lưu...":"💾 Lưu lịch lễ"}</button>
          </>)}

          {/* ══ NỘI DUNG ══ */}
          {tab==="content"&&(<>
            <div className="card">
              <div className="card-t">📄 Section Thư Mời</div>
              <Field name="sec_invite_title" label="Tiêu đề" value={data.sec_invite_title} onChange={handleChange}/>
              <Field name="sec_invite_sub" label="Chú thích (IN HOA)" value={data.sec_invite_sub} onChange={handleChange}/>
              <TA name="sec_invite_body" label="Nội dung lời mời" value={data.sec_invite_body} rows={4} onChange={handleChange}/>
            </div>
            <div className="card">
              <div className="card-t">📅 Section Lịch</div>
              <Field name="sec_cal_title" label="Tiêu đề" value={data.sec_cal_title} onChange={handleChange}/>
              <Field name="sec_cal_sub" label="Chú thích" value={data.sec_cal_sub} onChange={handleChange}/>
            </div>
            <div className="card">
              <div className="card-t">💬 Lời mong (section tối)</div>
              <TA name="mong_text" label="Nội dung (xuống dòng = Enter)" value={data.mong_text} rows={2} onChange={handleChange}/>
            </div>
            <div className="card">
              <div className="card-t">✨ Quotes trên ảnh</div>
              <TA name="quote1" label="Quote 1 — trên ảnh đôi lớn" value={data.quote1} rows={3} onChange={handleChange}/>
              <TA name="quote2" label="Quote 2 — bên ảnh nhỏ trái" value={data.quote2} rows={3} onChange={handleChange}/>
              <TA name="quote3" label="Quote 3 — bên ảnh nhỏ phải" value={data.quote3} rows={3} onChange={handleChange}/>
              <TA name="quote4" label="Quote 4 — trên ảnh cặp" value={data.quote4} rows={2} onChange={handleChange}/>
              <TA name="quote5" label="Quote 5 — cuối gallery" value={data.quote5} rows={1} onChange={handleChange}/>
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
              <PhotoManager data={data} onChange={handleChange} label="🌟 Ảnh bìa (Hero)"       urlKey="hero_img"    posKey="hero_pos"    shapeKey="hero_shape"/>
              <PhotoManager data={data} onChange={handleChange} label="👫 Ảnh đôi (Thư Mời)"    urlKey="couple_img"  posKey="couple_pos"  shapeKey="couple_shape"/>
              <PhotoManager data={data} onChange={handleChange} label="📸 Ảnh lớn (gallery)"     urlKey="photo_large" posKey="large_pos"   shapeKey="large_shape"/>
              <PhotoManager data={data} onChange={handleChange} label="📷 Ảnh nhỏ trái"          urlKey="photo_sm1"   posKey="sm1_pos"     shapeKey="sm1_shape"/>
              <PhotoManager data={data} onChange={handleChange} label="📷 Ảnh nhỏ phải"          urlKey="photo_sm2"   posKey="sm2_pos"     shapeKey="sm2_shape"/>
              <PhotoManager data={data} onChange={handleChange} label="🏞 Ảnh ngang 1"           urlKey="photo_wide1" posKey="wide1_pos"   shapeKey="wide1_shape"/>
              <PhotoManager data={data} onChange={handleChange} label="🏞 Ảnh ngang 2"           urlKey="photo_wide2" posKey="wide2_pos"   shapeKey="wide2_shape"/>
              <PhotoManager data={data} onChange={handleChange} label="🖼 Ảnh cặp trái"          urlKey="photo_pair1" posKey="pair1_pos"   shapeKey="pair1_shape"/>
              <PhotoManager data={data} onChange={handleChange} label="🖼 Ảnh cặp phải"          urlKey="photo_pair2" posKey="pair2_pos"   shapeKey="pair2_shape"/>
              <PhotoManager data={data} onChange={handleChange} label="🖼 Ảnh toàn trang"        urlKey="photo_full"  posKey="full_pos"    shapeKey="full_shape"/>
            </div>
            <button className="btn-p" onClick={save} disabled={saving} style={{ width:"100%",marginTop:"1rem" }}>{saving?"Đang lưu...":"💾 Lưu ảnh chính"}</button>
          </>)}

          {/* ══ GALLERY ══ */}
          {tab==="gallery"&&(<>
            {/* Dropzone upload nhiều ảnh từ máy */}
            <GalleryDropzone onAddItems={(newItems)=>setGal(g=>[...g,...newItems])} showToast={showToast}/>

            <div className="card">
              <div className="card-t">
                🎞 Gallery ({gallery.length} ảnh)
                <div style={{display:"flex",gap:".4rem",marginLeft:"auto"}}>
                  <button className="btn-o" onClick={addGal} style={{fontSize:".7rem",padding:".3rem .75rem"}}>+ Link/URL</button>
                </div>
              </div>
              <div className="tip" style={{marginBottom:".8rem",fontSize:".72rem"}}>
                📌 <strong>Kéo ảnh</strong> để căn chỉnh vùng hiển thị &nbsp;|&nbsp;
                Chọn <strong>Vuông/Ngang/Dọc</strong> để tạo layout mosaic nghệ thuật &nbsp;|&nbsp;
                Ảnh sẽ tự sắp xếp theo kích thước đã chọn
              </div>
              {gallery.length===0?(
                <div style={{textAlign:"center",padding:"2rem",color:"#a08080"}}>
                  <p style={{fontSize:"1.8rem",marginBottom:".5rem"}}>🖼</p>
                  <p style={{fontSize:".82rem"}}>Kéo thả ảnh vào ô trên, hoặc nhấn "+ Link/URL" để thêm</p>
                </div>
              ):(
                <div className="gal-mosaic">
                  {gallery.map((img,i)=>(
                    <GalleryCard key={`gal-${i}`} index={i} img={img} total={gallery.length}
                      onChangeItem={setGalItem} onMove={moveGal} onRemove={removeGal}
                      showToast={showToast}/>
                  ))}
                </div>
              )}
            </div>
            <button className="btn-p" onClick={save} disabled={saving} style={{width:"100%"}}>{saving?"Đang lưu...":"💾 Lưu gallery"}</button>
          </>)}

          {/* ══ MEDIA ══ */}
          {/* ══ CHUYỆN TÌNH + BẢN ĐỒ + FLIP CLOCK ══ */}
          {tab==="lovemap"&&(<>

            {/* ─── LOVE STORY ─── */}
            <div className="card">
              <div className="card-t">
                💑 Hành trình tình yêu
                <button className="btn-o" style={{marginLeft:"auto",fontSize:".7rem",padding:".3rem .75rem"}}
                  onClick={()=>{
                    const stories = Array.isArray(data.love_story) ? data.love_story : [];
                    handleChange("love_story", [...stories, {
                      date: "MM.YYYY", title: "Tiêu đề mốc", body: "Kể câu chuyện...", emoji: "❤️"
                    }]);
                  }}>
                  + Thêm mốc
                </button>
              </div>
              <div className="tip">
                Mỗi mốc là 1 sự kiện quan trọng trong chuyện tình — hiện dạng timeline xen kẽ trái/phải trong thiệp.
                Emoji hiện ở nút tròn giữa timeline.
              </div>
              {(Array.isArray(data.love_story) ? data.love_story : []).map((s, i) => (
                <LoveStoryCard key={i} index={i} story={s}
                  onChange={(stIdx, key, val) => {
                    const arr = [...(data.love_story || [])];
                    arr[stIdx] = { ...arr[stIdx], [key]: val };
                    handleChange("love_story", arr);
                  }}
                  onRemove={(stIdx) => {
                    const arr = (data.love_story || []).filter((_, j) => j !== stIdx);
                    handleChange("love_story", arr);
                  }}
                  onMove={(stIdx, dir) => {
                    const arr = [...(data.love_story || [])];
                    const j2 = stIdx + dir;
                    if (j2 < 0 || j2 >= arr.length) return;
                    [arr[stIdx], arr[j2]] = [arr[j2], arr[stIdx]];
                    handleChange("love_story", arr);
                  }}
                  isFirst={i === 0}
                  isLast={i === (data.love_story?.length || 0) - 1}
                />
              ))}
            </div>

            {/* ─── MINI MAP ─── */}
            <div className="card">
              <div className="card-t">📍 Bản đồ địa điểm</div>
              <div className="tip">
                Nhập toạ độ GPS của địa điểm — dùng <strong>Google Maps</strong>: tìm địa điểm → chuột phải → copy toạ độ.<br/>
                Hoặc paste <strong>Google Maps Embed URL</strong> (Share → Embed a map → copy src="...")
              </div>

              {/* Toạ độ */}
              <div className="coord-row">
                <Field name="venue_lat" label="Latitude (vĩ độ)" value={data.venue_lat} onChange={handleChange} placeholder="16.4637"/>
                <Field name="venue_lng" label="Longitude (kinh độ)" value={data.venue_lng} onChange={handleChange} placeholder="107.5909"/>
              </div>

              {/* Embed URL tuỳ chọn */}
              <Field name="venue_embed" label="Google Maps Embed URL (tuỳ chọn — thay thế toạ độ)" value={data.venue_embed} onChange={handleChange}
                placeholder="https://maps.google.com/maps?q=...&output=embed"/>

              {/* Preview map */}
              {(data.venue_lat || data.venue_embed) && (
                <div className="map-preview-box" style={{marginTop:".8rem"}}>
                  <iframe
                    src={data.venue_embed?.trim() ||
                      `https://maps.google.com/maps?q=${data.venue_lat||"16.4637"},${data.venue_lng||"107.5909"}&z=16&output=embed&hl=vi`}
                    allowFullScreen loading="lazy" title="Preview map"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              )}

              <div className="tip" style={{marginTop:".8rem"}}>
                <strong>Lịch trình</strong> được tự động lấy từ tab <em>Lịch lễ</em> — không cần nhập lại.
              </div>
            </div>

            <button className="btn-p" onClick={save} disabled={saving} style={{width:"100%"}}>
              {saving ? "Đang lưu..." : "💾 Lưu chuyện tình + bản đồ"}
            </button>
          </>)}

          {tab==="media"&&(<>
            <div className="card">
              <div className="card-t">🎵 Nhạc nền YouTube</div>
              <div className="tip" style={{ marginBottom:"1rem" }}>
                Paste URL YouTube bất kỳ, ví dụ:<br/>
                <code>https://www.youtube.com/watch?v=dQw4w9WgXcQ</code><br/>
                Nhạc tự động bật khi khách chạm màn hình lần đầu (kể cả mobile).<br/>
                Khách nhấn nút <strong>♩</strong> góc trên phải để bật/tắt.
              </div>
              <Field name="music_youtube" label="Link YouTube (URL đầy đủ)" value={data.music_youtube} placeholder="https://www.youtube.com/watch?v=..." onChange={handleChange}/>
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
              <div className="field-row"><Field name="qr_groom_bank" label="Ngân hàng" value={data.qr_groom_bank} onChange={handleChange}/><Field name="qr_groom_num" label="Số tài khoản" value={data.qr_groom_num} onChange={handleChange}/></div>
              <Field name="qr_groom_name" label="Tên chủ tài khoản (IN HOA)" value={data.qr_groom_name} onChange={handleChange}/>
              {data.qr_groom_num&&<CopyRow label="Copy số TK" text={data.qr_groom_num}/>}
              <PhotoManager data={data} onChange={handleChange} label="Ảnh QR Code Chú Rể" urlKey="qr_groom_img" posKey="hero_pos" shapeKey="hero_shape"/>
            </div>
            <div className="card">
              <div className="card-t">💳 QR Cô Dâu</div>
              <div className="field-row"><Field name="qr_bride_bank" label="Ngân hàng" value={data.qr_bride_bank} onChange={handleChange}/><Field name="qr_bride_num" label="Số tài khoản" value={data.qr_bride_num} onChange={handleChange}/></div>
              <Field name="qr_bride_name" label="Tên chủ tài khoản (IN HOA)" value={data.qr_bride_name} onChange={handleChange}/>
              {data.qr_bride_num&&<CopyRow label="Copy số TK" text={data.qr_bride_num}/>}
              <PhotoManager data={data} onChange={handleChange} label="Ảnh QR Code Cô Dâu" urlKey="qr_bride_img" posKey="hero_pos" shapeKey="hero_shape"/>
            </div>
            <button className="btn-p" onClick={save} disabled={saving} style={{width:"100%"}}>{saving?"Đang lưu...":"💾 Lưu QR"}</button>
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