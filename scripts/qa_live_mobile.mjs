import { chromium } from 'playwright-core';
import fs from 'node:fs/promises';

const base = 'https://serymente.github.io/otrobuenprograma/';
const viewports = [
  { name:'320x568', width:320, height:568 },
  { name:'360x800', width:360, height:800 },
  { name:'390x844', width:390, height:844 },
  { name:'430x932', width:430, height:932 },
  { name:'768x1024', width:768, height:1024 },
];

function round(n){ return Math.round(n*100)/100; }
function rect(el){
  const r=el.getBoundingClientRect();
  return {left:round(r.left),top:round(r.top),right:round(r.right),bottom:round(r.bottom),width:round(r.width),height:round(r.height)};
}
function intersects(a,b){
  return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
}

const browser = await chromium.launch({headless:true, executablePath:process.env.BROWSER_PATH});
const results=[];
let failed=false;

for (const vp of viewports){
  const page = await browser.newPage({ viewport:{width:vp.width,height:vp.height}, deviceScaleFactor:1 });
  const url = base + '?live-audit=' + Date.now() + '-' + vp.width;
  await page.goto(url,{waitUntil:'networkidle',timeout:90000});
  await page.evaluate(async()=>{ if(document.fonts?.ready) await document.fonts.ready; });
  await page.waitForSelector('#autor img',{state:'attached',timeout:15000});
  await page.waitForTimeout(1200);\n  await page.evaluate(()=>window.scrollTo(0,0));\n  await page.waitForTimeout(150);

  const snapshot = await page.evaluate((vp)=>{
    const el=s=>document.querySelector(s);
    const R=e=>{if(!e)return null;const r=e.getBoundingClientRect();return {left:+r.left.toFixed(2),top:+r.top.toFixed(2),right:+r.right.toFixed(2),bottom:+r.bottom.toFixed(2),width:+r.width.toFixed(2),height:+r.height.toFixed(2)}};
    const intersects=(a,b)=>a&&b&&a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top;
    const topbar=el('.topbar'), hero=el('.obp-hero'), card=el('.obp-author-card'), portrait=el('.obp-author-portrait'), body=el('.obp-author-body'), copy=el('.obp-hero-copy'), title=el('#obp-title'), deck=el('.obp-hero-dek'), story=el('#relato-sonoro'), player=el('.story-player'), nav=el('.nav'), brand=el('.brand');
    const pr=portrait?.querySelector('img');
    return {
      viewport:vp,
      scrollWidth:document.documentElement.scrollWidth,
      clientWidth:document.documentElement.clientWidth,
      topbar:R(topbar), nav:R(nav), brand:R(brand),
      hero:R(hero), card:R(card), portrait:R(portrait), body:R(body), copy:R(copy), title:R(title), deck:R(deck), story:R(story), player:R(player),
      naturalImage:{width:pr?.naturalWidth||0,height:pr?.naturalHeight||0,complete:!!pr?.complete},
      textRedundancy:{
        oldIntro:document.body.innerText.includes('Otro Gran Programa · relato sonoro'),
        oldHeading:document.body.innerText.includes('Escucha la historia que da origen a la propuesta.'),
        oldDeck:document.body.innerText.includes('Una conversación en voz alta sobre el origen de Otro Gran Programa'),
        newDeck:document.body.innerText.includes('Una iniciativa de bienestar social nacida de la experiencia y orientada a lo que aún puede construirse.')
      },
      overlap:{
        portraitBody:intersects(R(portrait),R(body)),
        cardCopy:intersects(R(card),R(copy)),
        copyTitle:intersects(R(copy),R(title)),
        heroStory:intersects(R(hero),R(story))
      },
      css:{
        heroGrid:getComputedStyle(hero).gridTemplateColumns,
        heroMinHeight:getComputedStyle(hero).minHeight,
        heroAlignContent:getComputedStyle(hero).alignContent,
        portraitWidth:getComputedStyle(portrait).width,
        portraitHeight:getComputedStyle(portrait).height,
        cardDisplay:getComputedStyle(card).display,
        cardFlexDirection:getComputedStyle(card).flexDirection,
        playerTop:getComputedStyle(player).top,
        playerWidth:getComputedStyle(player).width
      }
    };
  },vp);

  const resourceCheck = await page.evaluate(()=>{const urls=[...document.querySelectorAll('link[rel="stylesheet"],script[src]')].map(e=>e.href||e.src).filter(u=>u.includes('story-v3'));return {urls,count:urls.length};});\n  snapshot.storyAssetResources=resourceCheck;\n  structural.push(['single story-v3 resource chain', resourceCheck.count===2 && resourceCheck.urls.filter(u=>u.includes('story-v3.css')).length===1 && resourceCheck.urls.filter(u=>u.includes('story-v3.js')).length===1]);\n\n  const firstViewport = await page.screenshot({path:'artifacts/' + vp.name + '-inicio.png',fullPage:false});
  await page.evaluate(()=>window.scrollTo(0, Math.max(0, document.querySelector('.story-player')?.getBoundingClientRect().top + window.scrollY - 100)));
  await page.waitForTimeout(100);
  const sticky = await page.evaluate(()=>{
    const p=document.querySelector('.story-player'), t=document.querySelector('.topbar');
    const pr=p?.getBoundingClientRect(), tr=t?.getBoundingClientRect();
    return {playerTop:pr?+pr.top.toFixed(2):null,topbarBottom:tr?+tr.bottom.toFixed(2):null,playerRect:pr?{left:+pr.left.toFixed(2),right:+pr.right.toFixed(2),width:+pr.width.toFixed(2),top:+pr.top.toFixed(2),bottom:+pr.bottom.toFixed(2)}:null};
  });
  snapshot.sticky=sticky;\n\n  if(vp.width<=820){\n    structural.push(['initial hero visible', snapshot.hero && snapshot.hero.top >= 0 && snapshot.hero.bottom > Math.min(vp.height, 400)]);\n  }

  const structural = [\n    ['direct mobile entry stays at top', Math.abs(await page.evaluate(()=>window.scrollY)) <= 2],
    ['no horizontal overflow', snapshot.scrollWidth <= snapshot.clientWidth + 1],
    ['author image loaded', snapshot.naturalImage.complete && snapshot.naturalImage.width > 0],
    ['no redundant intro text', !snapshot.textRedundancy.oldIntro && !snapshot.textRedundancy.oldHeading && !snapshot.textRedundancy.oldDeck],
    ['new deck present', snapshot.textRedundancy.newDeck],
    ['portrait/body do not overlap', !snapshot.overlap.portraitBody],
    ['card/copy do not overlap', !snapshot.overlap.cardCopy],
    ['copy/title do not overlap', !snapshot.overlap.copyTitle],
    ['hero/story do not overlap', !snapshot.overlap.heroStory],
    ['sticky player clears topbar', snapshot.sticky.playerTop == null || snapshot.sticky.playerTop >= snapshot.sticky.topbarBottom + 6]
  ];
  if(vp.width<=430){
    structural.push(['portrait width is mobile target', Math.abs(snapshot.portrait.width - (vp.width<=340?118:126)) <= 1]);
    structural.push(['mobile author card is stacked', snapshot.css.cardDisplay==='flex' && snapshot.css.cardFlexDirection==='column']);
  }else if(vp.width<=900){
    structural.push(['portrait width is compact-tablet target', Math.abs(snapshot.portrait.width-148)<=1]);
    structural.push(['tablet author card is stacked', snapshot.css.cardDisplay==='flex' && snapshot.css.cardFlexDirection==='column']);
  }
  for(const [label,ok] of structural){
    if(!ok) failed=true;
    snapshot['PASS_'+label.replace(/[^a-z0-9]+/gi,'_')]=ok;
  }

  results.push(snapshot);
  await page.close();
}

await browser.close();
await fs.mkdir('artifacts',{recursive:true});
await fs.writeFile('artifacts/live-mobile-audit.json',JSON.stringify({base,generatedAt:new Date().toISOString(),failed,results},null,2));
console.log(JSON.stringify({failed,results},null,2));
if(failed) process.exit(1);
