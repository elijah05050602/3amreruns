(function(){
var P=window.POEMS, book=document.getElementById('book'), count=document.getElementById('count'),
 bar=document.getElementById('bar'), music=document.getElementById('music'), muteBtn=document.getElementById('mute');
var cur=0, started=false, W=1, dragging=null;
var COVER_IMG='img/cover.jpg';

function el(tag,cls,html){var e=document.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;return e}
function esc(s){return s.replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function store(k,v){try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v)}catch(e){}return null}

// --- personalization
var me={name:store('3am-name')||'',pro:store('3am-pro')||'they'};
var PRON={he:{they:'he',them:'him',their:'his',theirs:'his',are:'is',knows:'knows'},she:{they:'she',them:'her',their:'her',theirs:'hers',are:'is',knows:'knows'},they:{they:'they',them:'them',their:'their',theirs:'theirs',are:'are',knows:'know'}};
function cap(s){return s.charAt(0).toUpperCase()+s.slice(1)}
function fill(t){
  t=t.replace(/,?\s*\{name\}/g,function(m){return me.name?(m.indexOf(',')===0?', ':'')+me.name:''});
  return t.replace(/\{(they|them|their|theirs|are|knows)\}/gi,function(m,k){var w=PRON[me.pro][k.toLowerCase()];return k.charAt(0)===k.charAt(0).toUpperCase()&&k!==k.toLowerCase()?cap(w):w});
}

// --- pages
var defs=[{kind:'cover'},{kind:'name'},{kind:'toc'}];
var byId={};P.forEach(function(p,pi){p.pi=pi;byId[p.id]=p});
var CH=window.CHAPTERS||[{title:'Thoughts',sections:[{title:'',ids:P.map(function(p){return p.id})}]}];
(window.WHY||[]).length&&defs.push({kind:'why'});
var entries=[],ROMAN=['I','II','III','IV','V','VI','VII','VIII'];
CH.forEach(function(ch,ci){
  var ce=entries.length;entries.push({label:ch.title,kind:'chapter',idx:defs.length});
  defs.push({kind:'chapter',ch:ch,ci:ci,entry:ce,n:ch.sections.reduce(function(s,x){return s+x.ids.length},0)});
  ch.sections.forEach(function(sec){
    var se=ce;
    if(CH.length>1||sec.title){se=entries.length;entries.push({label:sec.title,kind:'section',idx:defs.length});defs.push({kind:'section',ch:ch,sec:sec,entry:se})}
    sec.ids.forEach(function(id){
      var p=byId[id],pe=entries.length;
      entries.push({label:p.title,kind:'poem',idx:defs.length});
      defs.push({kind:'title',p:p,pi:p.pi,entry:pe});
      p.lines.forEach(function(l,i){defs.push({kind:'line',p:p,pi:p.pi,raw:l,img:p.images[i],n:i+1,entry:pe})});
    });
  });
});
(window.THANKS||[]).length&&defs.push({kind:'thanks'});
defs.push({kind:'end'});
var lastBody=0;defs.forEach(function(d,i){if(d.kind==='line')lastBody=i});var FIRST=3;defs.forEach(function(d,i){if(d.kind==='chapter'&&FIRST===3)FIRST=i});lastBody=lastBody-FIRST+1; // first poem page index

book.appendChild(el('div','grain'));
document.body.appendChild(el('div','handle','@3amreruns'));
defs.forEach(function(d,i){
  var pg=el('div','page'); pg.style.zIndex=defs.length-i; d.el=pg;
  if(d.kind==='cover'){
    pg.className+=' cover';
    pg.innerHTML='<div class="pic" style="background-image:url('+COVER_IMG+')"></div><div class="shade full"></div><div class="coverText"><h1>3AM<br>Reruns</h1><p class="sub">thoughts for the hours nobody sees</p><p class="for"></p><p class="tap">tap to open</p></div>';
    d.img=null;
  }else if(d.kind==='name'){
    pg.className+=' plain';
    pg.innerHTML='<h2>Make it yours</h2><p class="small">What should these thoughts call you?</p>'+
     '<input id="nm" type="text" maxlength="20" placeholder="your name (optional)" autocomplete="given-name" enterkeyhint="done">'+
     '<p class="small">Your pronouns</p><div class="chips" id="chips"><button data-p="he">he/him</button><button data-p="she">she/her</button><button data-p="they">they/them</button></div>'+
     '<button id="go" class="big">Open the book</button><p class="small">Stays on this device only.</p>';
  }else if(d.kind==='toc'){
    pg.className+=' plain';
    pg.innerHTML='<h2>Contents</h2><div class="wheel wide" id="wheelToc"></div><p class="small">scroll, then tap</p>';
  }else if(d.kind==='chapter'){
    pg.className+=' plain title chapter';
    pg.innerHTML='<div class="num">Chapter '+(ROMAN[d.ci]||d.ci+1)+'</div><h1>'+esc(d.ch.title)+'</h1>';
  }else if(d.kind==='section'){
    pg.className+=' plain title section';
    pg.innerHTML='<div class="num">'+esc(d.ch.title)+'</div><h1>'+esc(d.sec.title)+'</h1>';
  }else if(d.kind==='title'){
    pg.className+=' plain title';
    pg.innerHTML='<h1>'+esc(d.p.title)+'</h1>';
  }else if(d.kind==='line'){
    pg.innerHTML='<div class="pic" data-src="'+d.img+'"></div><div class="shade"></div><div class="line"></div><div class="foot">'+esc(d.p.title)+' &middot; '+d.n+'/'+d.p.lines.length+'</div>';
  }else if(d.kind==='thanks'){
    pg.className+=' plain why';
    pg.innerHTML='<h2>'+esc(window.THANKS_TITLE||'Thank you')+'</h2>'+window.THANKS.map(function(t){return '<p>'+esc(t)+'</p>'}).join('');
  }else if(d.kind==='why'){
    pg.className+=' plain why';
    pg.innerHTML='<h2>'+esc(window.WHY_TITLE||'Why I made this')+'</h2>'+window.WHY.map(function(t){return '<p>'+esc(t)+'</p>'}).join('');
  }else{
    pg.className+=' plain';
    pg.innerHTML='<h2>The end</h2><p>more soon</p><p class="small">Music: &ldquo;Calmant&rdquo; by Kevin MacLeod<br><a href="https://incompetech.com" target="_blank" rel="noopener">incompetech.com</a><br>Licensed under CC BY 4.0<br><a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener">creativecommons.org/licenses/by/4.0</a></p><p class="small">Font: Shadows Into Light (OFL)</p><p class="small">@3amreruns</p>';
  }
  book.appendChild(pg);
});

function refreshText(){
  defs.forEach(function(d){ if(d.kind==='line') d.el.querySelector('.line').textContent=fill(d.raw) });
  defs[0].el.querySelector('.for').textContent=me.name?('for '+me.name):'';
}
var nm=document.getElementById('nm'), chips=document.getElementById('chips');
function setChips(){[].forEach.call(chips.children,function(b){b.classList.toggle('on',b.dataset.p===me.pro)})}
nm.value=me.name; setChips(); refreshText();
chips.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;me.pro=b.dataset.p;store('3am-pro',me.pro);setChips();refreshText()});
nm.addEventListener('input',function(){me.name=nm.value.trim();store('3am-name',me.name);refreshText()});
nm.addEventListener('keydown',function(e){e.stopPropagation();if(e.key==='Enter'){nm.blur();go(cur+1)}});
document.getElementById('go').onclick=function(){nm.blur();go(cur+1)};

function load(i){
  for(var k=i-1;k<=i+3;k++){
    var d=defs[k]; if(!d||!d.img||d.loaded)continue;
    d.loaded=true; var pic=d.el.querySelector('.pic'); pic.style.backgroundImage='url('+d.img+')';
  }
}
function render(){
  defs.forEach(function(d,i){
    d.el.classList.toggle('gone',i<cur);
    d.el.classList.toggle('active',i===cur);
    d.el.style.display=(i>=cur-2&&i<=cur+1)?'':'none';
    if(d.img&&d.loaded&&(i<cur-3||i>cur+5)){d.loaded=false;d.el.querySelector('.pic').style.backgroundImage=''}
    d.el.setAttribute('aria-hidden',i!==cur);
    d.el.style.transform='';
  });
  var k=defs[cur].kind;count.textContent=(k==='line'||k==='title'||k==='chapter'||k==='section')?(cur-FIRST+1)+' / '+lastBody:'';
  bar.classList.toggle('on',cur>0);
  document.body.classList.toggle('paper',['name','toc','why','thanks','end'].indexOf(defs[cur].kind)>=0);
  document.body.classList.toggle('onpic',defs[cur].kind==='line'||cur===0);
  load(cur);
  if(defs[cur].kind==='toc'&&typeof wToc!=='undefined')wToc.paint();
  try{history.replaceState(null,'','#'+cur)}catch(e){}
}
function go(n){
  n=Math.max(0,Math.min(defs.length-1,n)); if(n===cur)return;
  var jump=Math.abs(n-cur)>1;
  if(jump){
    defs.forEach(function(d){d.el.style.transition='none'});cur=n;render();void book.offsetWidth;
    defs.forEach(function(d){d.el.style.transition=''});
    book.classList.add('fade');setTimeout(function(){book.classList.remove('fade')},450);
  }else{
    var step=n>cur?defs[cur].el:defs[n].el;
    step.classList.add('flipping');setTimeout(function(){step.classList.remove('flipping')},950);
    cur=n;render();
  }
}
function next(){openBook();go(cur+1)}
function prev(){openBook();go(cur-1)}

function fadeVol(to,ms){
  var from=music.volume,t0=performance.now();
  (function s(t){var k=Math.min(1,(t-t0)/ms);music.volume=Math.max(0,Math.min(1,from+(to-from)*k));if(k<1)requestAnimationFrame(s);else if(to===0)music.pause()})(t0);
}
var muted=store('3am-muted')==='1';
function openBook(){
  if(started||muted)return; started=true; music.volume=0;
  var pr=music.play(); if(pr&&pr.catch)pr.catch(function(){started=false}); fadeVol(.4,2500);
}
function applyMute(){
  muteBtn.classList.toggle('off',muted);muteBtn.setAttribute('aria-pressed',muted);
  if(muted){fadeVol(0,400)}else{started=false;openBook()}
}
muteBtn.onclick=function(e){e.stopPropagation();muted=!muted;store('3am-muted',muted?'1':'0');applyMute()};
muteBtn.classList.toggle('off',muted);
// vertical wheel carousel: snap scrolling, items shrink and fade away from the centre
function glide(box,li,ms){
  var from=box.scrollTop,to=li.offsetTop-(box.clientHeight-li.offsetHeight)/2,t0=performance.now();
  box._anim=t0; box._gliding=true;
  (function s(t){
    if(box._anim!==t0)return;
    var k=Math.min(1,(t-t0)/ms),e=k<.5?4*k*k*k:1-Math.pow(-2*k+2,3)/2;
    box.scrollTop=from+(to-from)*e;
    if(k<1)requestAnimationFrame(s);else{box._gliding=false;box.style.scrollSnapType=''}
  })(t0);
}
function makeWheel(box,pick){
  var ul=el('ul'),lis=[];
  entries.forEach(function(en,k){
    var li=el('li',en.kind==='chapter'?'ch':en.kind==='section'?'sec':'poem',esc(en.label)); li.dataset.k=k; ul.appendChild(li); lis.push(li);
    li.addEventListener('click',function(){if(box._moved)return;pick(k)});
  });
  box.appendChild(ul);
  var raf=0;
  function paint(){
    raf=0; var r=box.getBoundingClientRect(),mid=r.top+r.height/2,ih=lis[0].offsetHeight||40,best=0,bd=1e9;
    lis.forEach(function(li,k){
      var b=li.getBoundingClientRect(),d=(b.top+b.height/2-mid)/ih,ad=Math.abs(d);
      li.style.transform='translateZ(0) scale('+Math.max(.7,1-ad*.07)+')';
      li.style.opacity=Math.max(.1,1-ad*.17);
      if(ad<bd){bd=ad;best=k}
    });
    box.dataset.sel=best;
    lis.forEach(function(li,k){li.classList.toggle('sel',k===best)});
  }
  box.addEventListener('scroll',function(){if(!raf)raf=requestAnimationFrame(paint)},{passive:true});
  // free scrolling (fast flicks, wheel, mouse drag); after it stops, settle softly onto the nearest title
  var idle=0;
  function nearest(){var r=box.getBoundingClientRect(),mid=r.top+r.height/2,bk=0,bd=1e9;lis.forEach(function(li,k){var b=li.getBoundingClientRect(),d=Math.abs(b.top+b.height/2-mid);if(d<bd){bd=d;bk=k}});return bk}
  box.addEventListener('scroll',function(){
    if(box._gliding||box._dragging)return;
    clearTimeout(idle);idle=setTimeout(function(){if(!box._down)glide(box,lis[nearest()],280)},130);
  },{passive:true});
  // wheel: about one title per notch, faster when spun quickly, eased not stepped
  var wt=0,wraf=0;
  box.addEventListener('wheel',function(e){
    e.preventDefault();e.stopPropagation();
    box._anim=0;box._gliding=true;clearTimeout(idle);
    var max=box.scrollHeight-box.clientHeight,d=e.deltaMode===1?e.deltaY*40:e.deltaY;
    if(!wraf)wt=box.scrollTop;
    wt=Math.max(0,Math.min(max,wt+d*.45));
    if(!wraf)wraf=requestAnimationFrame(function s(){
      var diff=wt-box.scrollTop;
      if(Math.abs(diff)<.6){box.scrollTop=wt;wraf=0;box._gliding=false;glide(box,lis[nearest()],240);return}
      box.scrollTop+=diff*.22;wraf=requestAnimationFrame(s);
    });
  },{passive:false});
  // mouse drag with momentum (touch uses native scrolling)
  var dy0=0,st0=0,lastY=0,lastT=0,vel=0;
  box.addEventListener('pointerdown',function(e){
    if(e.pointerType!=='mouse')return;
    box._down=true;box._moved=false;box._anim=0;box._gliding=false;dy0=e.clientY;st0=box.scrollTop;lastY=e.clientY;lastT=performance.now();vel=0;box._pid=e.pointerId;
  });
  box.addEventListener('pointermove',function(e){
    if(!box._down)return;var dy=e.clientY-dy0;
    if(Math.abs(dy)>5&&!box._dragging){box._moved=true;box._dragging=true;try{box.setPointerCapture(box._pid)}catch(x){}}
    if(box._dragging){var t=performance.now();vel=(lastY-e.clientY)/Math.max(1,t-lastT);lastY=e.clientY;lastT=t;box.scrollTop=st0-dy}
  });
  function release(){
    if(!box._down)return;box._down=false;
    if(!box._dragging){return}
    box._dragging=false;setTimeout(function(){box._moved=false},0);
    var v=vel*16,tok=box._fling=performance.now();
    (function f(){if(box._fling!==tok||box._down)return;box.scrollTop+=v;v*=.95;if(Math.abs(v)>.4)requestAnimationFrame(f);else glide(box,lis[nearest()],280)})();
  }
  box.addEventListener('pointerup',release);box.addEventListener('pointercancel',release);
  box.addEventListener('touchstart',function(){box._anim=0;box._gliding=false;box._fling=0},{passive:true});
  return {to:function(k){var li=lis[k];box.scrollTop=li.offsetTop-(box.clientHeight-li.offsetHeight)/2;paint()},paint:paint};
}
var menu=document.getElementById('menu');
var wToc=makeWheel(document.getElementById('wheelToc'),function(k){go(entries[k].idx)});
var wMenu=makeWheel(document.getElementById('chapters'),function(k){closeMenu();go(entries[k].idx)});
function curPoem(){var d=defs[cur];return d.entry===undefined?0:d.entry}
function openMenu(){menu.hidden=false;void menu.offsetWidth;menu.classList.add('show');wMenu.to(curPoem(),false)}
function closeMenu(){menu.classList.remove('show');setTimeout(function(){menu.hidden=true},250)}
document.getElementById('toc').onclick=function(e){e.stopPropagation();menu.hidden?openMenu():closeMenu()};
menu.addEventListener('click',function(e){e.stopPropagation();if(!e.target.closest('.sheet')||e.target.closest('h2'))closeMenu()});
document.getElementById('home').onclick=function(e){e.stopPropagation();go(0)};
document.getElementById('next').onclick=next;
document.getElementById('prev').onclick=prev;

// --- gestures with live drag
var sx=0,sy=0,down=false,axis=null,sw=1;
function setAngle(d,a,anim){d.el.style.transition=anim?'':'none';d.el.style.transform='rotateY('+a+'deg)'}
document.addEventListener('pointerdown',function(e){
  if(e.target.closest('input,button,a,#menu'))return;
  down=true;axis=null;dragging=null;sx=e.clientX;sy=e.clientY;sw=book.getBoundingClientRect().width||1;
});
document.addEventListener('pointermove',function(e){
  if(!down)return; var dx=e.clientX-sx,dy=e.clientY-sy;
  if(!axis){ if(Math.abs(dx)>10&&Math.abs(dx)>Math.abs(dy)*1.2)axis='x'; else if(Math.abs(dy)>14)axis='y'; else return }
  if(axis!=='x')return;
  if(!dragging){ dragging=dx<0?(cur<defs.length-1?{d:defs[cur],dir:1}:null):(cur>0?{d:defs[cur-1],dir:-1}:null); if(!dragging)return; dragging.d.el.classList.add('flipping') }
  var k=Math.max(0,Math.min(1,Math.abs(dx)/(sw*.9)));
  setAngle(dragging.d,dragging.dir===1?-180*k:-180*(1-k),false);
});
document.addEventListener('pointerup',function(e){
  if(!down)return; down=false;
  var dx=e.clientX-sx,dy=e.clientY-sy;
  if(dragging){
    var dg=dragging;dragging=null;
    var k=Math.abs(dx)/(sw*.9), fast=Math.abs(dx)>40;
    dg.d.el.style.transition='';dg.d.el.style.transform='';
    setTimeout(function(){dg.d.el.classList.remove('flipping')},950);
    if(fast||k>.3){openBook();cur+=dg.dir;render()} else render();
    return;
  }
  if(axis||e.target.closest('input,button,a,li'))return;
  if(Math.abs(dx)<12&&Math.abs(dy)<12){
    var r=book.getBoundingClientRect(); if(e.clientX<r.left||e.clientX>r.right)return;
    (e.clientX-r.left)<r.width*.33?prev():next();
  }
});
document.addEventListener('pointercancel',function(){down=false;if(dragging){dragging.d.el.classList.remove('flipping');dragging=null;render()}});
document.addEventListener('keydown',function(e){
  if(e.target.tagName==='INPUT')return;
  if(e.key==='Escape'&&!menu.hidden){closeMenu();return}
  if(e.key==='ArrowRight'||e.key===' '||e.key==='PageDown'){e.preventDefault();next()}
  else if(e.key==='ArrowLeft'||e.key==='PageUp'){e.preventDefault();prev()}
  else if(e.key==='Home')go(0);else if(e.key==='End')go(defs.length-1);
  else if(e.key==='m'||e.key==='M')muteBtn.click();
});
var wheelLock=false;
document.addEventListener('wheel',function(e){if(e.target.closest('.wheel'))return;if(Math.abs(e.deltaY)>40&&!wheelLock){wheelLock=true;setTimeout(function(){wheelLock=false},900);e.deltaY>0?next():prev()}},{passive:true});

// try autoplay on load; browsers usually block it, so the first touch/click/key anywhere starts the music
openBook();
['pointerdown','touchstart','mousedown','keydown'].forEach(function(ev){
  var f=function(){openBook();if(started)document.removeEventListener(ev,f,true)};
  document.addEventListener(ev,f,true);
});
var h=parseInt((location.hash||'').slice(1),10);
if(h>0&&h<defs.length)cur=h;
render();wToc.to(0,false);
window.__book={go:go,defs:defs,me:me,get cur(){return cur}};
})();
