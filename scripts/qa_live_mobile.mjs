import { chromium } from 'playwright-core';
import fs from 'node:fs/promises';

const BASE='https://serymente.github.io/otrobuenprograma/';\n// design audit current public v1.5.8
const VIEWS=[
  {name:'320x568',width:320,height:568},
  {name:'390x844',width:390,height:844},
  {name:'768x1024',width:768,height:1024},
  {name:'1440x900',width:1440,height:900}
];
const SECTIONS=['.obp-hero','#relato-sonoro','#pagina-original','#proyectos','#obp','#comind','#cuentas','#voces','#gracias','#fundamentos'];

const browser=await chromium.launch({headless:true,executablePath:process.env.BROWSER_PATH});
await fs.mkdir('artifacts',{recursive:true});
let failed=false;
const all=[];

for(const vp of VIEWS){
  const page=await browser.newPage({viewport:{width:vp.width,height:vp.height},deviceScaleFactor:1});
  await page.goto(BASE+'?design-audit='+Date.now()+'-'+vp.width,{waitUntil:'networkidle',timeout:90000});
  await page.evaluate(async()=>{if(document.fonts?.ready)await document.fonts.ready;});
  await page.waitForTimeout(800);
  await page.evaluate(()=>window.scrollTo(0,0));
  await page.waitForTimeout(100);

  const first=await page.evaluate((vp)=>{
    const q=s=>document.querySelector(s);
    const R=e=>{if(!e)return null;const r=e.getBoundingClientRect();return {left:+r.left.toFixed(2),top:+r.top.toFixed(2),right:+r.right.toFixed(2),bottom:+r.bottom.toFixed(2),width:+r.width.toFixed(2),height:+r.height.toFixed(2)}};
    const els=[...document.querySelectorAll('body *')];
    const vw=document.documentElement.clientWidth;
    const overflow=els.map(e=>{const r=e.getBoundingClientRect();return {tag:e.tagName,id:e.id,cls:String(e.className||''),left:r.left,right:r.right,width:r.width}}).filter(x=>x.left<-.5||x.right>vw+.5).sort((a,b)=>Math.max(b.right-vw,-b.left)-Math.max(a.right-vw,-a.left)).slice(0,8);
    const pill=q('.guide-pill'), portrait=q('.obp-author-portrait'), card=q('.obp-author-card'), copy=q('.obp-hero-copy'), story=q('#relato-sonoro'), player=q('.story-player');
    return {
      viewport:vp,scrollY:window.scrollY,scrollWidth:document.documentElement.scrollWidth,clientWidth:vw,
      topbar:R(q('.topbar')),hero:R(q('.obp-hero')),card:R(card),portrait:R(portrait),copy:R(copy),title:R(q('#obp-title')),story:R(story),player:R(player),
      pill:R(pill),pillStyle:pill?{visibility:getComputedStyle(pill).visibility,opacity:getComputedStyle(pill).opacity,pointerEvents:getComputedStyle(pill).pointerEvents}:null,
      naturalImage:(()=>{const i=portrait?.querySelector('img');return {complete:!!i?.complete,w:i?.naturalWidth||0,h:i?.naturalHeight||0}})(),
      overflow,
      resources:[...document.querySelectorAll('link[rel="stylesheet"],script[src]')].map(e=>e.href||e.src).filter(u=>u.includes('story-v3')),
      text:document.body.innerText
    };
  },vp);

  await page.screenshot({path:'artifacts/'+vp.name+'-inicio.png',fullPage:false});
  for(const sel of SECTIONS){
    const el=await page.$(sel);
    if(!el)continue;
    const box=await el.boundingBox();
    if(!box||box.height<20)continue;
    const maxH=Math.min(box.height,Math.max(vp.height*1.15,600));
    await page.screenshot({
      path:'artifacts/'+vp.name+'-'+sel.replace(/[^a-z0-9]+/gi,'-').replace(/^-|-$/g,'')+'.png',
      clip:{x:Math.max(0,box.x),y:Math.max(0,box.y),width:Math.min(box.width,vp.width),height:maxH}
    }).catch(()=>{});
  }

  const structural=[
    ['top',first.scrollY<=2],
    ['no-overflow',first.scrollWidth<=first.clientWidth+1],
    ['real-photo',first.naturalImage.complete&&first.naturalImage.w>0],
    ['no-legacy-story-intro',!first.text.includes('Otro Gran Programa · relato sonoro')&&!first.text.includes('Escucha la historia que da origen a la propuesta.')],
    ['single-story-chain',first.resources.length===2&&first.resources.filter(u=>u.includes('story-v3.css')).length===1&&first.resources.filter(u=>u.includes('story-v3.js')).length===1]
  ];
  if(vp.width<=820)structural.push(['hero-visible',!!first.hero&&first.hero.top>=0&&first.hero.bottom>400]);
  if(vp.width<=430)structural.push(['portrait-size',Math.abs(first.portrait?.width-(vp.width<=340?118:126))<=1]);
  for(const [_,ok] of structural)if(!ok)failed=true;
  all.push({viewport:vp,checks:structural,first});
  await page.close();
}
await browser.close();
await fs.writeFile('artifacts/design-audit.json',JSON.stringify({failed,all},null,2));
console.log(JSON.stringify({failed,all:all.map(x=>({viewport:x.viewport,checks:x.checks,overflow:x.first.overflow,pill:x.first.pillStyle,resources:x.first.resources}))},null,2));
if(failed)process.exit(1);
