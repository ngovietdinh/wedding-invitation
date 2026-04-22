// ============================================================
// MAP SECTION — Green Sage + White Theme
// ============================================================

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:"https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:"https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:"https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const greenMarker = L.divIcon({
  className:"",
  html:`<div style="width:30px;height:30px;background:#4A7C59;border:2px solid #fff;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 3px 10px rgba(26,58,40,0.3)"><div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;transform:rotate(45deg);font-size:11px;color:#fff">♥</div></div>`,
  iconSize:[30,30],iconAnchor:[15,30],popupAnchor:[0,-34],
});

const VENUES = [
  {
    id:"ceremony", name:"Lễ Cưới", venue:"Tên Nhà Hàng",
    address:"Địa chỉ nhà hàng, Huế",
    time:"11:00 · Chủ Nhật, 26/04/2026",
    lat:16.4673, lng:107.5905,
    note:"Sảnh chính", icon:"♕",
  },
  {
    id:"reception", name:"Tiệc Đãi Khách", venue:"Tên Nhà Hàng",
    address:"Địa chỉ nhà hàng, Huế",
    time:"18:30 · Chủ Nhật, 26/04/2026",
    lat:16.4683, lng:107.5915,
    note:"Sảnh tiệc", icon:"◈",
  },
];

function MapFilter() {
  const map = useMap();
  useEffect(()=>{
    map.getContainer().style.filter = "saturate(0.7) hue-rotate(30deg) brightness(1.05)";
  },[map]);
  return null;
}

function VenueCard({venue,index}) {
  const ref=useRef(null);
  useEffect(()=>{
    const el=ref.current; if(!el)return;
    const obs=new IntersectionObserver(([e])=>{
      if(e.isIntersecting){el.style.opacity="1";el.style.transform="translateY(0)";}
    },{threshold:0.2});
    obs.observe(el);
    return()=>obs.disconnect();
  },[]);
  return(
    <div ref={ref} style={{
      opacity:0,transform:`translateY(${16+index*8}px)`,
      transition:`opacity 0.7s ease ${index*0.15}s,transform 0.7s ease ${index*0.15}s`,
      border:"1px solid #E8F0E8",padding:"1.8rem",background:"#FFFFFF",flex:"1 1 240px",
      boxShadow:"0 2px 12px rgba(74,124,89,0.06)",
    }}>
      <div style={{display:"flex",gap:"1rem",alignItems:"flex-start",marginBottom:"1.2rem"}}>
        <div style={{
          width:"38px",height:"38px",flexShrink:0,
          background:"#E8F0E8",border:"1px solid #B8CCBA",
          display:"flex",alignItems:"center",justifyContent:"center",
          fontSize:"1rem",color:"#4A7C59",
        }}>{venue.icon}</div>
        <div>
          <p style={{fontFamily:"'DM Sans',sans-serif",fontWeight:300,fontSize:"0.58rem",
            letterSpacing:"0.35em",textTransform:"uppercase",color:"#7FA882",marginBottom:"0.2rem"}}>
            {venue.name}
          </p>
          <h3 style={{fontFamily:"'Playfair Display',serif",fontStyle:"italic",fontWeight:400,
            fontSize:"1.15rem",color:"#1A3A28",lineHeight:1.2,margin:0}}>
            {venue.venue}
          </h3>
        </div>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:"0.4rem",marginBottom:"1.2rem"}}>
        {[["◷",venue.time],["◎",venue.address],venue.note&&["◈",venue.note]].filter(Boolean).map(([icon,text],i)=>(
          <div key={i} style={{display:"flex",gap:"0.6rem",alignItems:"flex-start"}}>
            <span style={{color:"#7FA882",fontSize:"0.7rem",flexShrink:0,marginTop:"0.1rem"}}>{icon}</span>
            <span style={{fontFamily:"'DM Sans',sans-serif",fontWeight:300,fontSize:"0.75rem",color:"#5A7A62",lineHeight:1.5}}>
              {text}
            </span>
          </div>
        ))}
      </div>
      <a href={`https://www.google.com/maps/dir/?api=1&destination=${venue.lat},${venue.lng}`}
        target="_blank" rel="noopener noreferrer"
        style={{
          display:"inline-flex",alignItems:"center",gap:"0.4rem",
          fontFamily:"'DM Sans',sans-serif",fontWeight:400,fontSize:"0.65rem",
          letterSpacing:"0.2em",textTransform:"uppercase",
          color:"#4A7C59",textDecoration:"none",
          borderBottom:"1px solid #B8CCBA",paddingBottom:"0.15rem",
          transition:"border-color 0.2s",
        }}>
        Xem chỉ đường →
      </a>
    </div>
  );
}

export function MapSection() {
  const center=[VENUES[0].lat,VENUES[0].lng];
  return(
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;1,400&family=DM+Sans:wght@200;300;400&display=swap');
        .leaflet-popup-content-wrapper{background:#fff !important;border:1px solid #E8F0E8 !important;border-radius:0 !important;box-shadow:0 8px 24px rgba(26,58,40,0.1) !important;font-family:'DM Sans',sans-serif !important;}
        .leaflet-popup-tip{background:#fff !important;}
        .leaflet-control-zoom a{background:#fff !important;color:#1A3A28 !important;border-color:#E8F0E8 !important;}
        .leaflet-control-attribution{display:none;}
      `}</style>
      <section id="location" style={{background:"#F7F9F6",fontFamily:"'DM Sans',sans-serif"}}>
        <div style={{height:"50vh",minHeight:"280px",position:"relative"}}>
          <MapContainer center={center} zoom={15}
            style={{height:"100%",width:"100%"}} scrollWheelZoom={false}>
            <MapFilter/>
            <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" subdomains="abcd" maxZoom={20}/>
            {VENUES.map(v=>(
              <Marker key={v.id} position={[v.lat,v.lng]} icon={greenMarker}>
                <Popup>
                  <div style={{minWidth:"150px",padding:"0.2rem 0"}}>
                    <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"0.6rem",letterSpacing:"0.3em",
                      textTransform:"uppercase",color:"#7FA882",marginBottom:"0.3rem"}}>{v.name}</p>
                    <p style={{fontFamily:"'Playfair Display',serif",fontStyle:"italic",
                      fontSize:"0.95rem",color:"#1A3A28",margin:"0 0 0.25rem"}}>{v.venue}</p>
                    <p style={{fontFamily:"'DM Sans',sans-serif",fontSize:"0.7rem",color:"#5A7A62",margin:0}}>{v.time}</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        <div style={{padding:"3rem 1.5rem",maxWidth:"800px",margin:"0 auto"}}>
          <div style={{textAlign:"center",marginBottom:"2.5rem"}}>
            <div style={{display:"inline-flex",alignItems:"center",gap:"0.8rem",marginBottom:"1rem"}}>
              <div style={{width:"24px",height:"1px",background:"#7FA882"}}/>
              <span style={{fontFamily:"'DM Sans',sans-serif",fontWeight:300,fontSize:"0.6rem",
                letterSpacing:"0.4em",textTransform:"uppercase",color:"#4A7C59"}}>Địa điểm tổ chức</span>
              <div style={{width:"24px",height:"1px",background:"#7FA882"}}/>
            </div>
            <h2 style={{fontFamily:"'Playfair Display',serif",fontStyle:"italic",fontWeight:400,
              fontSize:"clamp(1.8rem,6vw,2.8rem)",color:"#1A3A28",margin:0}}>
              Hẹn gặp bạn tại đây
            </h2>
          </div>

          <div style={{display:"flex",gap:"1rem",flexWrap:"wrap"}}>
            {VENUES.map((v,i)=><VenueCard key={v.id} venue={v} index={i}/>)}
          </div>

          <div style={{display:"flex",gap:"0.8rem",flexWrap:"wrap",justifyContent:"center",marginTop:"2rem"}}>
            {[["◈","Dress Code","Sang trọng · Trang nhã"],
              ["◷","Có mặt lúc","10:30 trước lễ"],
              ["✦","Đỗ xe","Bãi xe miễn phí"]].map(([icon,label,val])=>(
              <div key={label} style={{
                display:"flex",flexDirection:"column",alignItems:"center",gap:"0.35rem",
                padding:"1rem 1.5rem",border:"1px solid #E8F0E8",background:"#fff",flex:"1",minWidth:"130px",
              }}>
                <span style={{color:"#7FA882",fontSize:"0.9rem"}}>{icon}</span>
                <span style={{fontFamily:"'DM Sans',sans-serif",fontWeight:300,fontSize:"0.58rem",
                  letterSpacing:"0.25em",textTransform:"uppercase",color:"#7FA882"}}>{label}</span>
                <span style={{fontFamily:"'Playfair Display',serif",fontStyle:"italic",
                  fontWeight:400,fontSize:"0.95rem",color:"#1A3A28"}}>{val}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export default MapSection;
