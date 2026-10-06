/* ===================================================================
   Mobile shell · v1.6.0
   TOP / SCROLLED / OPEN
   =================================================================== */
(function(){
  'use strict';
  var topbar=document.querySelector('.topbar'),trigger=document.getElementById('mobile-nav-trigger'),overlay=document.getElementById('mobile-nav-overlay');
  if(!topbar||!trigger||!overlay)return;
  var closeBtn=overlay.querySelector('.mobile-nav-close'),links=[].slice.call(overlay.querySelectorAll('a[href]')),mq=window.matchMedia?window.matchMedia('(max-width:820px)'):null;
  var scrolled=false,open=false,lastScrollY=0,restoreFocus=null,wasMobile=null;
  function isMobile(){return mq?mq.matches:window.innerWidth<=820;}
  function setScrolled(next){scrolled=!!next;document.documentElement.classList.toggle('mobile-shell-scrolled',scrolled);topbar.classList.toggle('is-collapsed',scrolled);trigger.hidden=!isMobile()||!scrolled;}
  function onScroll(){if(!isMobile())return;var y=window.scrollY||document.documentElement.scrollTop||0;setScrolled(y>8);}
  function lockScroll(){lastScrollY=window.scrollY||document.documentElement.scrollTop||0;document.body.classList.add('mobile-nav-lock');document.body.style.top=(-lastScrollY)+'px';}
  function unlockScroll(){document.body.classList.remove('mobile-nav-lock');document.body.style.top='';window.scrollTo(0,lastScrollY);}
  function focusables(){return [closeBtn].concat(links).filter(function(el){return el&&!el.disabled;});}
  function onKeydown(e){if(!open)return;if(e.key==='Escape'){e.preventDefault();close();return;}if(e.key!=='Tab')return;var els=focusables();if(!els.length)return;var first=els[0],last=els[els.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}
  function openMenu(){if(!isMobile()||open)return;open=true;restoreFocus=trigger;overlay.hidden=false;overlay.setAttribute('aria-hidden','false');trigger.setAttribute('aria-expanded','true');document.documentElement.classList.add('mobile-nav-open');lockScroll();closeBtn.focus();document.addEventListener('keydown',onKeydown,true);}
  function close(){if(!open)return;open=false;overlay.setAttribute('aria-hidden','true');overlay.hidden=true;trigger.setAttribute('aria-expanded','false');document.documentElement.classList.remove('mobile-nav-open');document.removeEventListener('keydown',onKeydown,true);unlockScroll();setScrolled(lastScrollY>8);(function restoreFocusWhenReady(attempt){if(!restoreFocus||!document.contains(restoreFocus))return;if(!restoreFocus.hidden){restoreFocus.focus({preventScroll:true});return;}if(attempt<6)setTimeout(function(){restoreFocusWhenReady(attempt+1);},16);})(0);}
  trigger.addEventListener('click',openMenu);closeBtn.addEventListener('pointerdown',function(e){e.preventDefault();close();});closeBtn.addEventListener('click',close);links.forEach(function(link){link.addEventListener('click',function(){close();});});
  function fitHeroTitle(){var h=document.getElementById('obp-title');if(!h||!isMobile())return;h.style.whiteSpace='nowrap';h.style.textWrap='nowrap';var max=76,min=12;h.style.fontSize=max+'px';while(h.scrollWidth>h.clientWidth&&max>min){max-=1;h.style.fontSize=max+'px';}if(h.scrollWidth>h.clientWidth){var tracking=parseFloat(getComputedStyle(h).letterSpacing)||0,guard=0;while(h.scrollWidth>h.clientWidth&&tracking>-2&&guard<20){tracking-=.1;h.style.letterSpacing=tracking+'px';guard++;}}}
  function viewport(){var mobile=isMobile();if(wasMobile!==mobile){wasMobile=mobile;if(!mobile&&open)close();}onScroll();fitHeroTitle();if(document.fonts&&document.fonts.ready)document.fonts.ready.then(fitHeroTitle).catch(function(){});}
  window.addEventListener('scroll',onScroll,{passive:true});window.addEventListener('resize',viewport,{passive:true});setScrolled(false);viewport();
})();