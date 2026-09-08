import {useEffect,useRef,useState} from "react";
import * as THREE from "three";
import {BedroomScene} from "./scene/BedroomScene";
import {TimeSystem} from "./scene/TimeSystem";
import {SceneRenderer} from "./scene/Renderer";
import {Season,Weather,Language,RenderMode} from "./types";

const text={
 zh:{time:"时间",season:"季节",weather:"天气",light:"灯光",mode:"画风",screenshot:"截图",fullscreen:"全屏",reset:"重置视角",pause:"暂停",play:"自动",spring:"春",summer:"夏",autumn:"秋",winter:"冬",clear:"晴",cloudy:"阴",rain:"雨",snow:"雪",native:"原生 3D",pixel:"2px 像素"},
 en:{time:"TIME",season:"SEASON",weather:"WEATHER",light:"LIGHT",mode:"STYLE",screenshot:"SHOT",fullscreen:"FULL",reset:"RESET",pause:"PAUSE",play:"AUTO",spring:"SPRING",summer:"SUMMER",autumn:"AUTUMN",winter:"WINTER",clear:"CLEAR",cloudy:"CLOUDY",rain:"RAIN",snow:"SNOW",native:"NATIVE 3D",pixel:"2px PIXEL"}
};
export default function App(){
 const mount=useRef<HTMLDivElement>(null); const [time,setTime]=useState(18.5),[auto,setAuto]=useState(true);
 const [season,setSeason]=useState<Season>("spring"),[weather,setWeather]=useState<Weather>("clear"),[lang,setLang]=useState<Language>("zh"),[mode,setMode]=useState<RenderMode>("native"),[lights,setLights]=useState(true);
 const systems=useRef<{r:SceneRenderer,s:THREE.Scene,c:THREE.PerspectiveCamera,b:BedroomScene,t:TimeSystem}|null>(null);
 useEffect(()=>{if(!mount.current)return;
   const scene=new THREE.Scene(); const camera=new THREE.PerspectiveCamera(48,1,.1,100); camera.position.set(10,6,11); camera.lookAt(0,1.5,0);
   const r=new SceneRenderer(mount.current), b=new BedroomScene(scene), t=new TimeSystem(scene); scene.background=new THREE.Color(0x8ca6b2);
   const controls={drag:false,x:0,y:0,dist:15};
   const canvas=r.renderer.domElement;
   const pointer=(e:PointerEvent)=>{if(e.type==="pointerdown"){controls.drag=true;controls.x=e.clientX;controls.y=e.clientY;canvas.setPointerCapture(e.pointerId)}
     else if(e.type==="pointerup")controls.drag=false; else if(e.type==="pointermove"&&controls.drag){camera.position.applyAxisAngle(new THREE.Vector3(0,1,0),(e.clientX-controls.x)*-.006);camera.position.y=Math.max(1.2,Math.min(7,camera.position.y+(controls.y-e.clientY)*.015));camera.lookAt(0,1.5,0);controls.x=e.clientX;controls.y=e.clientY;}};
   canvas.addEventListener("pointerdown",pointer);canvas.addEventListener("pointerup",pointer);canvas.addEventListener("pointermove",pointer);
   const wheel=(e:WheelEvent)=>{const d=Math.max(7,Math.min(19,controls.dist+e.deltaY*.012));controls.dist=d;camera.position.setLength(d);camera.lookAt(0,1.5,0)};canvas.addEventListener("wheel",wheel,{passive:true});
   const resize=()=>{const w=mount.current!.clientWidth,h=mount.current!.clientHeight;camera.aspect=w/h;camera.fov=w<h?58:48;camera.updateProjectionMatrix();r.resize(w,h)};resize();window.addEventListener("resize",resize);
   let last=performance.now(),raf=0;const loop=(now:number)=>{const dt=Math.min(.05,(now-last)/1000);last=now;t.auto=auto;t.time=time;const env=t.update(dt);if(!auto)t.time=time;b.updateWeather(weather);b.updateSeason(season);b.tick(now/1000);
     const day=env.daylight, dusk=env.dusk;scene.background=new THREE.Color().lerpColors(new THREE.Color(0x10172c),new THREE.Color(0x9fc4d5),Math.min(1,day+.18)); if(dusk>.1)scene.background.lerp(new THREE.Color(0xd58c70),dusk*.65);
     if(!lights){t.main.intensity=0;t.bedside.intensity=0;t.desk.intensity=0}
     setTime(t.time);r.setPixelMode(mode==="pixel");r.render(scene,camera);raf=requestAnimationFrame(loop)};raf=requestAnimationFrame(loop);
   systems.current={r,s:scene,c:camera,b,t};return()=>{cancelAnimationFrame(raf);window.removeEventListener("resize",resize);canvas.removeEventListener("pointerdown",pointer);canvas.removeEventListener("pointerup",pointer);canvas.removeEventListener("pointermove",pointer);canvas.removeEventListener("wheel",wheel);r.renderer.dispose();mount.current?.replaceChildren()};
 },[]);
 const L=text[lang], hh=Math.floor(time).toString().padStart(2,"0"),mm=Math.floor((time%1)*60).toString().padStart(2,"0");
 const capture=()=>{const r=systems.current?.r;if(!r)return;const a=document.createElement("a");a.href=r.renderer.domElement.toDataURL("image/png");a.download=`bedroom-${hh}${mm}.png`;a.click()};
 const reset=()=>{const c=systems.current?.c;if(c){c.position.set(10,6,11);c.lookAt(0,1.5,0)}};
 const fs=()=>document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen?.();
 return <main className="app"><div ref={mount} className="scene"/>
   <header className="top"><span className="brand">QUIET ROOM</span><span>{L.time} · {hh}:{mm}</span><span>{L[season]} · {L[weather]}</span></header>
   <section className="controls">
    <div className="time"><input aria-label="time" type="range" min="0" max="24" step=".01" value={time} onChange={e=>{setAuto(false);setTime(+e.target.value)}}/><button onClick={()=>setAuto(!auto)}>{auto?L.pause:L.play}</button></div>
    <div className="row"><select value={season} onChange={e=>setSeason(e.target.value as Season)}>{(["spring","summer","autumn","winter"] as Season[]).map(x=><option key={x}>{x}</option>)}</select>
    <select value={weather} onChange={e=>setWeather(e.target.value as Weather)}>{(["clear","cloudy","rain","snow"] as Weather[]).map(x=><option key={x}>{x}</option>)}</select>
    <button className={lights?"active":""} onClick={()=>setLights(!lights)}>◐ {L.light}</button><button onClick={()=>setMode(mode==="native"?"pixel":"native")}>◈ {mode==="native"?L.native:L.pixel}</button></div>
    <div className="row"><button onClick={capture}>⌁ {L.screenshot}</button><button onClick={fs}>□ {L.fullscreen}</button><button onClick={reset}>↺ {L.reset}</button><button onClick={()=>setLang(lang==="zh"?"en":"zh")}>中 / EN</button></div>
   </section>
 </main>
}