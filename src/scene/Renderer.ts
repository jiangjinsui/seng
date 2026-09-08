import * as THREE from "three";
export class SceneRenderer {
  renderer:THREE.WebGLRenderer; pixel=false;
  constructor(container:HTMLElement){
    this.renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.6));
    this.renderer.shadowMap.enabled=true; this.renderer.shadowMap.type=THREE.PCFSoftShadowMap;
    container.appendChild(this.renderer.domElement);
  }
  resize(w:number,h:number){ this.renderer.setSize(w,h,false); }
  setPixelMode(on:boolean){ this.pixel=on; }
  render(scene:THREE.Scene,camera:THREE.Camera){
    const old=this.renderer.getPixelRatio();
    if(this.pixel)this.renderer.setPixelRatio(Math.max(.5,Math.min(window.devicePixelRatio,1))*0.5);
    else this.renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.6));
    this.renderer.render(scene,camera); if(this.pixel)this.renderer.setPixelRatio(old);
  }
}