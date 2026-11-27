import { useLayoutEffect, useRef, useState } from 'react';
import { Monitor, Tablet, Smartphone, Maximize2, Minimize2 } from 'lucide-react';
export const DEVICE_SIZES = { desktop: [1280,800], tablet: [768,1024], mobile: [375,667] };
export function DeviceControls({device,setDevice,target}) {
 const [full,setFull]=useState(false);
 useLayoutEffect(()=>{const update=()=>setFull(document.fullscreenElement===target?.current);document.addEventListener('fullscreenchange',update);return()=>document.removeEventListener('fullscreenchange',update)},[target]);
 return <div className="flex shrink-0 items-center gap-1 rounded-lg border border-white/10 p-1">{[['desktop',Monitor],['tablet',Tablet],['mobile',Smartphone]].map(([id,Icon])=><button key={id} type="button" title={id} aria-label={`${id} preview`} aria-pressed={device===id} onClick={()=>setDevice(id)} className={`flex h-8 items-center gap-1.5 rounded px-2 text-xs ${device===id?'bg-purple-500/20 text-purple-200':'text-gray-400 hover:bg-white/10 hover:text-white'}`}><Icon size={16}/>{device===id && <span className="hidden capitalize xl:inline">{id}</span>}</button>)}<button type="button" title={full?'Exit fullscreen':'Fullscreen'} aria-label={full?'Exit fullscreen':'Fullscreen'} className="rounded p-2 text-gray-400 hover:bg-white/10" onClick={async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await target?.current?.requestFullscreen()}catch(error){console.warn(error)}}}>{full?<Minimize2 size={16}/>:<Maximize2 size={16}/>}</button></div>;
}
export default function DevicePreview({device='desktop',children}) {
 const ref=useRef(null);const [size,setSize]=useState({width:0,height:0});
 useLayoutEffect(()=>{const el=ref.current;if(!el)return;const update=()=>setSize({width:el.clientWidth,height:el.clientHeight});update();const observer=new ResizeObserver(update);observer.observe(el);return()=>observer.disconnect()},[]);
 const desktop=device==='desktop';const [w,h]=DEVICE_SIZES[device]||DEVICE_SIZES.desktop;const width=desktop?size.width:w;const height=desktop?size.height:h;
 return <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[#20202e]"><div ref={ref} className="relative min-h-0 min-w-0 flex-1 overflow-auto" >{size.width>0&&size.height>0&&<div style={{width,height,margin:desktop?0:'12px auto',overflow:'hidden',background:'white',borderRadius:desktop?0:8}}>{children({width,height})}</div>}</div><div className="flex h-7 shrink-0 items-center justify-between border-t border-white/10 bg-[#11111f] px-3 text-xs text-gray-400"><span className="capitalize">{device} viewport</span><span>{width} × {height} · 100%</span></div></div>;
}
