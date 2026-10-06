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

function intersects(a,b){
  return !!a && !!b && a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
}
function contained(inner,outer){
  return !!inner && !!outer && inner.left >= outer.left-1 && inner.right <= outer.right+1 && inner.top >= outer.top-1 && inner.bottom <= outer.bottom+1;
}
function R(el){
  if(!el) return null;
  const r=el.getBoundingClientRect();
  return {left:+r.left.toFixed(2),top:+r.top.toFixed(2),right:+r.right.toFixed(2),bottom:+r.bottom.toFixed(2),width:+r.width.toFixed(2),height:+r.height.toFixed(2)};
}

const browser=await chromium.launch({headless:true,executablePath:process.env.BROWSER_PATH});
const results=[];
let failed=false;

for(const vp of viewports){
  const page=await browser.newPage({viewport:{width:vp.width,height:vp.height},deviceScaleFactor:1});
  await page.goto(base+'?live-audit='+Date.now()+'-'+vp.width,{waitUntil:'networkidle',timeout:90000});
  await page.evaluate(async()=>{if(document.fonts?.ready)await document.fonts.ready;});
  await page.waitForSelector('#autor img',{state:'attached',timeout:15000});
  await page.waitForTimeout(900);
  await page.evaluate(()=>window.scrollTo(0,0));
  await page.waitForTimeout(150);

  const initialScrollY=await page.evaluate(()=>window.scrollY);
  const snapshot=await page.evaluate((vp)=>{
    const q=s=>document.querySelector(s);
    const R=el=>{if(!el)return null;const r=el.getBoundingClientRect();return {left:+r.left.toFixed(2),top:+r.top.toFixed(2),right:+r.right.toFixed(2),bottom:+r.bottom.toFixed(2),width:+r.width.toFixed(2),height:+r.height.toFixed(2)}};
    const intersects=(a,b)=>!!a&&!!b&&a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top;
    const contained=(inner,outer)=>!!inner&&!!outer&&inner.left>=outer.left-1&&inner.right<=outer.right+1&&inner.top>=outer.top-1&&inner.bottom<=outer.bottom+1;
    const topbar=q('.topbar'), hero=q('.obp-hero'), card=q('.obp-author-card'), portrait=q('.obp-author-portrait'),
      body=q('.obp-author-body'), copy=q('.obp-hero-copy'), title=q('#obp-title'), deck=q('.obp-hero-dek'),
      story=q('#relato-sonoro'), player=q('.story-player'), nav=q('.nav'), brand=q('.brand'), img=portrait?.querySelector('img');
    const RR=R;
    return {
      viewport:vp,
      scrollWidth:document.documentElement.scrollWidth,
      clientWidth:document.documentElement.clientWidth,
      topbar:RR(topbar),nav:RR(nav),brand:RR(brand),hero:RR(hero),card:RR(card),portrait:RR(portrait),body:RR(body),
      copy:RR(copy),title:RR(title),deck:RR(deck),story:RR(story),player:RR(player),
      naturalImage:{width:img?.naturalWidth||0,height:img?.naturalHeight||0,complete:!!img?.complete},
      textRedundancy:{
        oldIntro:document.body.innerText.includes('Otro Gran Programa · relato sonoro'),
        oldHeading:document.body.innerText.includes('Escucha la historia que da origen a la propuesta.'),
        oldDeck:document.body.innerText.includes('Una conversación en voz alta sobre el origen de Otro Gran Programa'),
        newDeck:document.body.innerText.includes('Una iniciativa de bienestar social nacida de la experiencia y orientada a lo que aún puede construirse.')
      },
      overlap:{
        portraitBody:intersects(RR(portrait),RR(body)),
        cardCopy:intersects(RR(card),RR(copy)),
        heroStory:intersects(RR(hero),RR(story)),
        titleOutsideCopy:!contained(RR(title),RR(copy))
      },
      css:{
        heroGrid:getComputedStyle(hero).gridTemplateColumns,
        heroMinHeight:getComputedStyle(hero).minHeight,
        heroAlignContent:getComputedStyle(hero).alignContent,
        portraitWidth:getComputedStyle(portrait).width,
        portraitHeight:getComputedStyle(portrait).height,
        cardDisplay:getComputedStyle(card).display,
        cardFlexDirection:getComputedStyle(card).flexDirection,
      portraitObjectFit:getComputedStyle(img).objectFit,
      guidePillVisible:!!document.querySelector('.guide-pill.is-visible'),
      playerTop:getComputedStyle(player).top,
        playerWidth:getComputedStyle(player).width
      }
    };
  },vp);
  snapshot.initialScrollY=initialScrollY;

  snapshot.overflowCulprits=await page.evaluate(()=>{
    const vw=document.documentElement.clientWidth;
    return [...document.querySelectorAll('body *')].map(el=>{
      const r=el.getBoundingClientRect();
      return {tag:el.tagName,cls:String(el.className||''),id:el.id||'',left:+r.left.toFixed(2),right:+r.right.toFixed(2),width:+r.width.toFixed(2)};
    }).filter(x=>x.left<-.5||x.right>vw+.5).sort((a,b)=>Math.max(b.right-vw,-b.left)-Math.max(a.right-vw,-a.left)).slice(0,12);
  });
  const resourceCheck=await page.evaluate(()=>[...document.querySelectorAll('link[rel="stylesheet"],script[src]')].map(e=>e.href||e.src).filter(u=>u.includes('story-v3')));
  snapshot.storyAssetResources=resourceCheck;

  const structural=[
    ['direct mobile entry stays at top',snapshot.initialScrollY<=2],
    ['no horizontal overflow',snapshot.scrollWidth<=snapshot.clientWidth+1],
    ['author image loaded',snapshot.naturalImage.complete&&snapshot.naturalImage.width>0],
    ['no redundant intro text',!snapshot.textRedundancy.oldIntro&&!snapshot.textRedundancy.oldHeading&&!snapshot.textRedundancy.oldDeck],
    ['new deck present',snapshot.textRedundancy.newDeck],
    ['portrait/body do not overlap',!snapshot.overlap.portraitBody],
    ['card/copy do not overlap',!snapshot.overlap.cardCopy],
    ['title stays inside hero copy',!snapshot.overlap.titleOutsideCopy],
    ['hero/story do not overlap',!snapshot.overlap.heroStory],
    ['single story-v3 resource chain',resourceCheck.length===2&&resourceCheck.filter(u=>u.includes('story-v3.css')).length===1&&resourceCheck.filter(u=>u.includes('story-v3.js')).length===1],
    ['initial hero is materially visible',snapshot.hero&&snapshot.hero.top>=0&&snapshot.hero.bottom>Math.min(vp.height,400)],
    ['guide pill hidden on initial hero',!snapshot.guidePillVisible],
    ['mobile author image is contained',vp.width>600||snapshot.css?.portraitObjectFit==='contain']
  ];

  await page.screenshot({path:'artifacts/'+vp.name+'-inicio.png',fullPage:false});

  await page.evaluate(()=>window.scrollTo(0,Math.max(0,document.querySelector('.story-player')?.getBoundingClientRect().top+window.scrollY-100)));
  await page.waitForTimeout(120);

  const sticky=await page.evaluate(()=>{
    const p=document.querySelector('.story-player'),t=document.querySelector('.topbar');
    const pr=p?.getBoundingClientRect(),tr=t?.getBoundingClientRect();
    return {
      playerTop:pr?+pr.top.toFixed(2):null,
      topbarBottom:tr?+tr.bottom.toFixed(2):null,
      playerRect:pr?{left:+pr.left.toFixed(2),right:+pr.right.toFixed(2),width:+pr.width.toFixed(2),top:+pr.top.toFixed(2),bottom:+pr.bottom.toFixed(2)}:null
    };
  });
  snapshot.sticky=sticky;
  structural.push(['sticky player clears topbar',sticky.playerTop==null||sticky.playerTop>=sticky.topbarBottom+6]);

  for(const [label,ok] of structural){
    if(!ok)failed=true;
    snapshot['PASS_'+label.replace(/[^a-z0-9]+/gi,'_')]=ok;
  }
  if(vp.width<=430){
    const target=vp.width<=340?118:126;
    structural.push(['portrait width is mobile target',Math.abs(snapshot.portrait.width-target)<=1]);
    structural.push(['mobile author card is stacked',snapshot.css.cardDisplay==='flex'&&snapshot.css.cardFlexDirection==='column']);
  }else if(vp.width<=900){
    structural.push(['portrait width is compact-tablet target',Math.abs(snapshot.portrait.width-148)<=1]);
    structural.push(['tablet author card is stacked',snapshot.css.cardDisplay==='flex'&&snapshot.css.cardFlexDirection==='column']);
  }
  for(const [label,ok] of structural.slice(-2)){
    if(!ok)failed=true;
    snapshot['PASS_'+label.replace(/[^a-z0-9]+/gi,'_')]=ok;
  }

  results.push(snapshot);
  await page.close();
}

await browser.close();
await fs.mkdir('artifacts',{recursive:true});
await fs.writeFile('artifacts/live-mobile-audit.json',JSON.stringify({base,generatedAt:new Date().toISOString(),failed,results},null,2));
console.log(JSON.stringify({failed,results},null,2));
if(failed)process.exit(1);

// final-live-check