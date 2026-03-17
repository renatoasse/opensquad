import{Q as G,W as I,X as B,e as _,M as k,H as O,v as A,a0 as m,T as v,aj as C,R as E,w as z,$ as U,k as w}from"./index-BGnIzGQC.js";var M=`in vec2 aPosition;
out vec2 vTextureCoord;

uniform vec4 uInputSize;
uniform vec4 uOutputFrame;
uniform vec4 uOutputTexture;

vec4 filterVertexPosition( void )
{
    vec2 position = aPosition * uOutputFrame.zw + uOutputFrame.xy;
    
    position.x = position.x * (2.0 / uOutputTexture.x) - 1.0;
    position.y = position.y * (2.0*uOutputTexture.z / uOutputTexture.y) - uOutputTexture.z;

    return vec4(position, 0.0, 1.0);
}

vec2 filterTextureCoord( void )
{
    return aPosition * (uOutputFrame.zw * uInputSize.zw);
}

void main(void)
{
    gl_Position = filterVertexPosition();
    vTextureCoord = filterTextureCoord();
}
`,V=`in vec2 vTextureCoord;
out vec4 finalColor;
uniform sampler2D uTexture;
void main() {
    finalColor = texture(uTexture, vTextureCoord);
}
`,y=`struct GlobalFilterUniforms {
  uInputSize: vec4<f32>,
  uInputPixel: vec4<f32>,
  uInputClamp: vec4<f32>,
  uOutputFrame: vec4<f32>,
  uGlobalFrame: vec4<f32>,
  uOutputTexture: vec4<f32>,
};

@group(0) @binding(0) var <uniform> gfu: GlobalFilterUniforms;
@group(0) @binding(1) var uTexture: texture_2d<f32>;
@group(0) @binding(2) var uSampler: sampler;

struct VSOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) uv: vec2<f32>
};

fn filterVertexPosition(aPosition: vec2<f32>) -> vec4<f32>
{
    var position = aPosition * gfu.uOutputFrame.zw + gfu.uOutputFrame.xy;

    position.x = position.x * (2.0 / gfu.uOutputTexture.x) - 1.0;
    position.y = position.y * (2.0 * gfu.uOutputTexture.z / gfu.uOutputTexture.y) - gfu.uOutputTexture.z;

    return vec4(position, 0.0, 1.0);
}

fn filterTextureCoord(aPosition: vec2<f32>) -> vec2<f32>
{
    return aPosition * (gfu.uOutputFrame.zw * gfu.uInputSize.zw);
}

@vertex
fn mainVertex(
  @location(0) aPosition: vec2<f32>,
) -> VSOutput {
  return VSOutput(
   filterVertexPosition(aPosition),
   filterTextureCoord(aPosition)
  );
}

@fragment
fn mainFragment(
  @location(0) uv: vec2<f32>,
) -> @location(0) vec4<f32> {
    return textureSample(uTexture, uSampler, uv);
}
`;class Y extends G{constructor(){const e=I.from({vertex:{source:y,entryPoint:"mainVertex"},fragment:{source:y,entryPoint:"mainFragment"},name:"passthrough-filter"}),t=B.from({vertex:M,fragment:V,name:"passthrough-filter"});super({gpuProgram:e,glProgram:t})}}class R{constructor(e){this._renderer=e}push(e,t,r){this._renderer.renderPipes.batch.break(r),r.add({renderPipeId:"filter",canBundle:!1,action:"pushFilter",container:t,filterEffect:e})}pop(e,t,r){this._renderer.renderPipes.batch.break(r),r.add({renderPipeId:"filter",action:"popFilter",canBundle:!1})}execute(e){e.action==="pushFilter"?this._renderer.filter.push(e):e.action==="popFilter"&&this._renderer.filter.pop()}destroy(){this._renderer=null}}R.extension={type:[_.WebGLPipes,_.WebGPUPipes,_.CanvasPipes],name:"filter"};const P=new k;function X(T,e){e.clear();const t=e.matrix;for(let r=0;r<T.length;r++){const n=T[r];if(n.globalDisplayStatus<7)continue;const i=n.renderGroup??n.parentRenderGroup;i!=null&&i.isCachedAsTexture?e.matrix=P.copyFrom(i.textureOffsetInverseTransform).append(n.worldTransform):i!=null&&i._parentCacheAsTextureRenderGroup?e.matrix=P.copyFrom(i._parentCacheAsTextureRenderGroup.inverseWorldTransform).append(n.groupTransform):e.matrix=n.worldTransform,e.addBounds(n.bounds)}return e.matrix=t,e}const q=new C({attributes:{aPosition:{buffer:new Float32Array([0,0,1,0,1,1,0,1]),format:"float32x2",stride:8,offset:0}},indexBuffer:new Uint32Array([0,1,2,0,2,3])});class W{constructor(){this.skip=!1,this.inputTexture=null,this.backTexture=null,this.filters=null,this.bounds=new U,this.container=null,this.blendRequired=!1,this.outputRenderSurface=null,this.globalFrame={x:0,y:0,width:0,height:0},this.firstEnabledIndex=-1,this.lastEnabledIndex=-1}}class S{constructor(e){this._filterStackIndex=0,this._filterStack=[],this._filterGlobalUniforms=new O({uInputSize:{value:new Float32Array(4),type:"vec4<f32>"},uInputPixel:{value:new Float32Array(4),type:"vec4<f32>"},uInputClamp:{value:new Float32Array(4),type:"vec4<f32>"},uOutputFrame:{value:new Float32Array(4),type:"vec4<f32>"},uGlobalFrame:{value:new Float32Array(4),type:"vec4<f32>"},uOutputTexture:{value:new Float32Array(4),type:"vec4<f32>"}}),this._globalFilterBindGroup=new A({}),this.renderer=e}get activeBackTexture(){var e;return(e=this._activeFilterData)==null?void 0:e.backTexture}push(e){const t=this.renderer,r=e.filterEffect.filters,n=this._pushFilterData();n.skip=!1,n.filters=r,n.container=e.container,n.outputRenderSurface=t.renderTarget.renderSurface;const i=t.renderTarget.renderTarget.colorTexture.source,o=i.resolution,s=i.antialias;if(r.every(d=>!d.enabled)){n.skip=!0;return}const c=n.bounds;if(this._calculateFilterArea(e,c),this._calculateFilterBounds(n,t.renderTarget.rootViewPort,s,o,1),n.skip)return;const u=this._getPreviousFilterData(),f=this._findFilterResolution(o);let l=0,a=0;u&&(l=u.bounds.minX,a=u.bounds.minY),this._calculateGlobalFrame(n,l,a,f,i.width,i.height),this._setupFilterTextures(n,c,t,u)}generateFilteredTexture({texture:e,filters:t}){const r=this._pushFilterData();this._activeFilterData=r,r.skip=!1,r.filters=t;const n=e.source,i=n.resolution,o=n.antialias;if(t.every(d=>!d.enabled))return r.skip=!0,e;const s=r.bounds;if(s.addRect(e.frame),this._calculateFilterBounds(r,s.rectangle,o,i,0),r.skip)return e;const c=i;this._calculateGlobalFrame(r,0,0,c,n.width,n.height),r.outputRenderSurface=m.getOptimalTexture(s.width,s.height,r.resolution,r.antialias),r.backTexture=v.EMPTY,r.inputTexture=e,this.renderer.renderTarget.finishRenderPass(),this._applyFiltersToTexture(r,!0);const a=r.outputRenderSurface;return a.source.alphaMode="premultiplied-alpha",a}pop(){const e=this.renderer,t=this._popFilterData();t.skip||(e.globalUniforms.pop(),e.renderTarget.finishRenderPass(),this._activeFilterData=t,this._applyFiltersToTexture(t,!1),t.blendRequired&&m.returnTexture(t.backTexture),m.returnTexture(t.inputTexture))}getBackTexture(e,t,r){const n=e.colorTexture.source._resolution,i=m.getOptimalTexture(t.width,t.height,n,!1);let o=t.minX,s=t.minY;r&&(o-=r.minX,s-=r.minY),o=Math.floor(o*n),s=Math.floor(s*n);const c=Math.ceil(t.width*n),u=Math.ceil(t.height*n);return this.renderer.renderTarget.copyToTexture(e,i,{x:o,y:s},{width:c,height:u},{x:0,y:0}),i}applyFilter(e,t,r,n){const i=this.renderer,o=this._activeFilterData,c=o.outputRenderSurface===r,u=i.renderTarget.rootRenderTarget.colorTexture.source._resolution,f=this._findFilterResolution(u);let l=0,a=0;if(c){const p=this._findPreviousFilterOffset();l=p.x,a=p.y}this._updateFilterUniforms(t,r,o,l,a,f,c,n);const d=e.enabled?e:this._getPassthroughFilter();this._setupBindGroupsAndRender(d,t,i)}calculateSpriteMatrix(e,t){const r=this._activeFilterData,n=e.set(r.inputTexture._source.width,0,0,r.inputTexture._source.height,r.bounds.minX,r.bounds.minY),i=t.worldTransform.copyTo(k.shared),o=t.renderGroup||t.parentRenderGroup;return o&&o.cacheToLocalTransform&&i.prepend(o.cacheToLocalTransform),i.invert(),n.prepend(i),n.scale(1/t.texture.orig.width,1/t.texture.orig.height),n.translate(t.anchor.x,t.anchor.y),n}destroy(){var e;(e=this._passthroughFilter)==null||e.destroy(!0),this._passthroughFilter=null}_getPassthroughFilter(){return this._passthroughFilter??(this._passthroughFilter=new Y),this._passthroughFilter}_setupBindGroupsAndRender(e,t,r){if(r.renderPipes.uniformBatch){const n=r.renderPipes.uniformBatch.getUboResource(this._filterGlobalUniforms);this._globalFilterBindGroup.setResource(n,0)}else this._globalFilterBindGroup.setResource(this._filterGlobalUniforms,0);this._globalFilterBindGroup.setResource(t.source,1),this._globalFilterBindGroup.setResource(t.source.style,2),e.groups[0]=this._globalFilterBindGroup,r.encoder.draw({geometry:q,shader:e,state:e._state,topology:"triangle-list"}),r.type===E.WEBGL&&r.renderTarget.finishRenderPass()}_setupFilterTextures(e,t,r,n){if(e.backTexture=v.EMPTY,e.inputTexture=m.getOptimalTexture(t.width,t.height,e.resolution,e.antialias),e.blendRequired){r.renderTarget.finishRenderPass();const i=r.renderTarget.getRenderTarget(e.outputRenderSurface);e.backTexture=this.getBackTexture(i,t,n==null?void 0:n.bounds)}r.renderTarget.bind(e.inputTexture,!0),r.globalUniforms.push({offset:t})}_calculateGlobalFrame(e,t,r,n,i,o){const s=e.globalFrame;s.x=t*n,s.y=r*n,s.width=i*n,s.height=o*n}_updateFilterUniforms(e,t,r,n,i,o,s,c){const u=this._filterGlobalUniforms.uniforms,f=u.uOutputFrame,l=u.uInputSize,a=u.uInputPixel,d=u.uInputClamp,p=u.uGlobalFrame,x=u.uOutputTexture;s?(f[0]=r.bounds.minX-n,f[1]=r.bounds.minY-i):(f[0]=0,f[1]=0),f[2]=e.frame.width,f[3]=e.frame.height,l[0]=e.source.width,l[1]=e.source.height,l[2]=1/l[0],l[3]=1/l[1],a[0]=e.source.pixelWidth,a[1]=e.source.pixelHeight,a[2]=1/a[0],a[3]=1/a[1],d[0]=.5*a[2],d[1]=.5*a[3],d[2]=e.frame.width*l[2]-.5*a[2],d[3]=e.frame.height*l[3]-.5*a[3];const b=this.renderer.renderTarget.rootRenderTarget.colorTexture;p[0]=n*o,p[1]=i*o,p[2]=b.source.width*o,p[3]=b.source.height*o,t instanceof v&&(t.source.resource=null);const g=this.renderer.renderTarget.getRenderTarget(t);this.renderer.renderTarget.bind(t,!!c),t instanceof v?(x[0]=t.frame.width,x[1]=t.frame.height):(x[0]=g.width,x[1]=g.height),x[2]=g.isRoot?-1:1,this._filterGlobalUniforms.update()}_findFilterResolution(e){let t=this._filterStackIndex-1;for(;t>0&&this._filterStack[t].skip;)--t;return t>0&&this._filterStack[t].inputTexture?this._filterStack[t].inputTexture.source._resolution:e}_findPreviousFilterOffset(){let e=0,t=0,r=this._filterStackIndex;for(;r>0;){r--;const n=this._filterStack[r];if(!n.skip){e=n.bounds.minX,t=n.bounds.minY;break}}return{x:e,y:t}}_calculateFilterArea(e,t){if(e.renderables?X(e.renderables,t):e.filterEffect.filterArea?(t.clear(),t.addRect(e.filterEffect.filterArea),t.applyMatrix(e.container.worldTransform)):e.container.getFastGlobalBounds(!0,t),e.container){const n=(e.container.renderGroup||e.container.parentRenderGroup).cacheToLocalTransform;n&&t.applyMatrix(n)}}_applyFiltersToTexture(e,t){const r=e.inputTexture,n=e.bounds,i=e.filters,o=e.firstEnabledIndex,s=e.lastEnabledIndex;if(this._globalFilterBindGroup.setResource(r.source.style,2),this._globalFilterBindGroup.setResource(e.backTexture.source,3),o===s)i[o].apply(this,r,e.outputRenderSurface,t);else{let c=e.inputTexture;const u=m.getOptimalTexture(n.width,n.height,c.source._resolution,!1);let f=u;for(let l=o;l<s;l++){const a=i[l];if(!a.enabled)continue;a.apply(this,c,f,!0);const d=c;c=f,f=d}i[s].apply(this,c,e.outputRenderSurface,t),m.returnTexture(u)}}_calculateFilterBounds(e,t,r,n,i){var g;const o=this.renderer,s=e.bounds,c=e.filters;let u=1/0,f=0,l=!0,a=!1,d=!1,p=!0,x=-1,b=-1;for(let F=0;F<c.length;F++){const h=c[F];if(!h.enabled)continue;if(x===-1&&(x=F),b=F,u=Math.min(u,h.resolution==="inherit"?n:h.resolution),f+=h.padding,h.antialias==="off"?l=!1:h.antialias==="inherit"&&l&&(l=r),h.clipToViewport||(p=!1),!!!(h.compatibleRenderers&o.type)){d=!1;break}if(h.blendRequired&&!(((g=o.backBuffer)==null?void 0:g.useBackBuffer)??!0)){z("Blend filter requires backBuffer on WebGL renderer to be enabled. Set `useBackBuffer: true` in the renderer options."),d=!1;break}d=!0,a||(a=h.blendRequired)}if(!d){e.skip=!0;return}if(p&&s.fitBounds(0,t.width/n,0,t.height/n),s.scale(u).ceil().scale(1/u).pad((f|0)*i),!s.isPositive){e.skip=!0;return}e.antialias=l,e.resolution=u,e.blendRequired=a,e.firstEnabledIndex=x,e.lastEnabledIndex=b}_popFilterData(){return this._filterStackIndex--,this._filterStack[this._filterStackIndex]}_getPreviousFilterData(){let e,t=this._filterStackIndex-1;for(;t>0&&(t--,e=this._filterStack[t],!!e.skip););return e}_pushFilterData(){let e=this._filterStack[this._filterStackIndex];return e||(e=this._filterStack[this._filterStackIndex]=new W),this._filterStackIndex++,e}}S.extension={type:[_.WebGLSystem,_.WebGPUSystem],name:"filter"};w.add(S);w.add(R);
