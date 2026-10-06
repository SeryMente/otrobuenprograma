const { test, expect } = require("@playwright/test");
const URL="http://127.0.0.1:4173/";
const sizes=[[240,320],[320,568],[360,800],[390,844],[412,915],[430,932],[540,960]];
for(const [width,height] of sizes){
  test("mobile "+width+"x"+height+" — no overflow / hero composition",async({page})=>{
    await page.setViewportSize({width,height}); await page.goto(URL,{waitUntil:"domcontentloaded"});
    await expect(page.locator("#obp-title")).toHaveText("Otro Gran Programa, una propuesta");
    const m=await page.evaluate(()=>{const d=document.documentElement,t=document.querySelector("#obp-title"),a=document.querySelector(".obp-author-portrait"),cs=getComputedStyle(t),r=t.getBoundingClientRect(),ar=a.getBoundingClientRect();return {overflow:d.scrollWidth-d.clientWidth,titleOverflow:t.scrollWidth-t.clientWidth,ws:cs.whiteSpace,lines:Math.round(r.height/parseFloat(cs.lineHeight)),ratio:ar.width/ar.height};});
    expect(m.overflow).toBeLessThanOrEqual(1); expect(m.titleOverflow).toBeLessThanOrEqual(1); expect(m.ws).not.toBe("nowrap"); expect(m.ratio).toBeGreaterThan(1.55); expect(m.ratio).toBeLessThan(1.98);
    if(width===320 || width===390) expect(m.lines).toBe(4);
  });
}
test("mobile nav collapse + fullscreen focus",async({page})=>{
  await page.setViewportSize({width:390,height:844}); await page.goto(URL,{waitUntil:"domcontentloaded"});
  const trigger=page.locator("#mobile-nav-trigger"); await expect(trigger).toBeHidden(); await page.evaluate(()=>scrollTo(0,40)); await expect(trigger).toBeVisible(); await expect(page.locator(".topbar")).toHaveClass(/is-collapsed/); await trigger.click();
  const overlay=page.locator("#mobile-nav-overlay"); await expect(overlay).toBeVisible(); await expect(overlay.locator("a")).toHaveCount(3); await expect(overlay.locator(".mobile-nav-close")).toBeVisible(); await expect(page.locator("body")).toHaveClass(/mobile-nav-lock/); await expect(page.locator(".mobile-nav-close")).toBeFocused(); await page.locator(".mobile-nav-close").click(); await expect(overlay).toBeHidden(); await expect(trigger).toBeFocused();
});
test("mobile rail is fixed 5x4",async({page})=>{
  await page.setViewportSize({width:390,height:844}); await page.goto(URL,{waitUntil:"domcontentloaded"}); await page.locator("#relato-sonoro").evaluate(el=>el.scrollIntoView({block:"center"})); await expect(page.locator(".story-micro-rail")).toBeVisible(); await expect(page.locator(".story-micro-rail")).toHaveCSS("opacity","1"); await expect(page.locator(".story-micro-phase")).toHaveCount(5); await expect(page.locator(".story-micro-segment")).toHaveCount(20); expect(await page.locator(".story-micro-rail").evaluate(el=>getComputedStyle(el).position)).toBe("fixed");
});
test("desktop remains desktop",async({page})=>{
  await page.setViewportSize({width:1280,height:900}); await page.goto(URL,{waitUntil:"domcontentloaded"}); await expect(page.locator("#mobile-nav-trigger")).toBeHidden(); await expect(page.locator(".guide")).toBeVisible(); const g=await page.locator(".story-stop").first().evaluate(el=>getComputedStyle(el).gridTemplateColumns); expect(g.split(" ").length).toBe(3);
});
test("audio is configured for immediate audible best-effort",async({page})=>{
  await page.setViewportSize({width:390,height:844}); await page.goto(URL,{waitUntil:"domcontentloaded"}); await page.locator(".story-audio").waitFor({state:"attached"}); const m=await page.evaluate(()=>{const a=document.querySelector(".story-audio");return {autoplay:a.autoplay,preload:a.preload,muted:a.muted,src:!!a.src};}); expect(m.autoplay).toBe(true); expect(m.preload).toBe("auto"); expect(m.muted).toBe(false); expect(m.src).toBe(true); await page.screenshot({path:"test-results/mobile-390.png"});
});
