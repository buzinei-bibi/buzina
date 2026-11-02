(function(){
'use strict';
var $=function(s,c){return (c||document).querySelector(s)}, $$=function(s,c){return [].slice.call((c||document).querySelectorAll(s))};
var clamp=function(v,a,b){return Math.min(b,Math.max(a,v))}, lerp=function(a,b,t){return a+(b-a)*t};
var REDUCED=matchMedia('(prefers-reduced-motion: reduce)').matches, FINE=matchMedia('(pointer: fine)').matches;
var body=document.body, root=document.documentElement;

/* Lâmpadas e segmentos. */
$$('.fls').forEach(function(f){for(var i=0;i<+f.dataset.n;i++)f.appendChild(document.createElement('b'))});
$$('.segs').forEach(function(s){var f=+s.dataset.fill;for(var i=0;i<10;i++){var e=document.createElement('i');if(i<f){e.className='f';e.style.setProperty('--n',i)}s.appendChild(e)}});

/* Brilho que segue o ponteiro (sem mira). */
(function(){
  if(!FINE)return;var g=$('#glowf'),x=innerWidth/2,y=innerHeight/2,tx=x,ty=y;
  addEventListener('pointermove',function(e){tx=e.clientX;ty=e.clientY;body.classList.add('has-pointer')},{passive:true});
  (function l(){x=lerp(x,tx,.12);y=lerp(y,ty,.12);g.style.transform='translate('+x+'px,'+y+'px)';requestAnimationFrame(l)})();
})();

/* ========================= Tema (lâmpada) ========================= */
(function(){
  var btn=$('#themeBtn'),meta=document.querySelector('meta[name=theme-color]');
  function sync(){var l=root.dataset.theme==='light';btn.setAttribute('aria-pressed',l);btn.setAttribute('aria-label',l?'Mudar para o tema preto e vermelho':'Mudar para o tema branco e roxo');
    if(meta)meta.setAttribute('content',l?'#fbf9ff':'#050506')}
  function apply(){root.dataset.theme=root.dataset.theme==='light'?'dark':'light';try{localStorage.setItem('bibi-theme',root.dataset.theme)}catch(e){}sync()}
  sync();
  btn.addEventListener('click',function(){
    if(!document.startViewTransition||REDUCED||document.hidden){apply();return}
    var r=btn.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2,R=Math.hypot(Math.max(x,innerWidth-x),Math.max(y,innerHeight-y));
    var vt=document.startViewTransition(apply);[vt.finished,vt.updateCallbackDone].forEach(function(pr){pr&&pr.catch(function(){})});vt.ready.then(function(){root.animate({clipPath:['circle(0px at '+x+'px '+y+'px)','circle('+R+'px at '+x+'px '+y+'px)']},{duration:750,easing:'cubic-bezier(.76,0,.24,1)',pseudoElement:'::view-transition-new(root)'})}).catch(function(){});
  });
})();

/* ========================= Som ========================= */
var Sound=(function(){
  var ctx=null,on=false,eng=null;
  function ok(){if(!ctx){var AC=window.AudioContext||window.webkitAudioContext;if(!AC)return null;ctx=new AC()}if(ctx.state==='suspended')ctx.resume();return ctx}
  function beep(t,d){var a=ctx.createOscillator(),b=ctx.createOscillator(),g=ctx.createGain(),f=ctx.createBiquadFilter();a.type=b.type='sawtooth';a.frequency.value=440;b.frequency.value=349.2;
    f.type='lowpass';f.frequency.value=1800;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.16,t+.012);g.gain.setValueAtTime(.16,t+d-.04);g.gain.linearRampToValueAtTime(0,t+d);
    a.connect(f);b.connect(f);f.connect(g);g.connect(ctx.destination);a.start(t);b.start(t);a.stop(t+d);b.stop(t+d)}
  function engine(v){if(!ok())return;if(v&&!eng){var o=ctx.createOscillator(),g=ctx.createGain(),f=ctx.createBiquadFilter();o.type='sawtooth';o.frequency.value=48;f.type='lowpass';f.frequency.value=420;
    g.gain.value=.0001;o.connect(f);f.connect(g);g.connect(ctx.destination);o.start();eng={o:o,g:g,f:f}}if(eng)eng.g.gain.setTargetAtTime(v?.045:.0001,ctx.currentTime,.15)}
  function rev(d){if(!on||!ok())return;var t=ctx.currentTime,o=ctx.createOscillator(),g=ctx.createGain(),f=ctx.createBiquadFilter();o.type='sawtooth';
    o.frequency.setValueAtTime(50,t);o.frequency.exponentialRampToValueAtTime(280,t+d);f.type='lowpass';f.frequency.value=700;g.gain.setValueAtTime(.0001,t);
    g.gain.exponentialRampToValueAtTime(.12,t+.2);g.gain.exponentialRampToValueAtTime(.0001,t+d+.3);o.connect(f);f.connect(g);g.connect(ctx.destination);o.start(t);o.stop(t+d+.4)}
  return{toggle:function(){on=!on;engine(on);if(on)rev(1.2);return on},horn:function(){if(!on||!ok())return;var t=ctx.currentTime+.01;beep(t,.17);beep(t+.31,.18)},rev:rev,
    speed:function(k){if(!eng||!on)return;eng.o.frequency.setTargetAtTime(48+k*.9,ctx.currentTime,.08);eng.f.frequency.setTargetAtTime(420+k*5,ctx.currentTime,.08)}};
})();
$('#snd').addEventListener('click',function(){var v=Sound.toggle();this.setAttribute('aria-pressed',v);this.setAttribute('aria-label',v?'Desligar o som do motor':'Ligar o som do motor');if(v)revBurst()});

/* ========================= Texto ========================= */
$$('[data-split]').forEach(function(el){var t=el.textContent,o='';for(var i=0;i<t.length;i++)o+='<span class="ch"><i style="transition-delay:'+(i*.03)+'s">'+(t[i]===' '?'&nbsp;':t[i])+'</i></span>';el.innerHTML=o;el.setAttribute('aria-label',t)});
var GL='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/·#%&';
function scramble(el){if(REDUCED||!el)return;var fin=el.dataset.f||el.textContent;el.dataset.f=fin;var fr=0,q=fin.split('').map(function(c,i){return{c:c,s:Math.floor(i*1.1),e:Math.floor(i*1.1)+9}});
  (function r(){var o='';for(var i=0;i<q.length;i++)o+=fr>=q[i].e?q[i].c:fr>=q[i].s?GL[(Math.random()*GL.length)|0]:' ';el.textContent=o;if(++fr<34+q.length)requestAnimationFrame(r);else el.textContent=fin})()}
function countTo(el,n,d){var t0=performance.now();(function s(now){var t=clamp((now-t0)/d,0,1);el.textContent=Math.round(n*(1-Math.pow(1-t,3)));if(t<1)requestAnimationFrame(s)})(t0)}

var io=new IntersectionObserver(function(es){es.forEach(function(e){if(!e.isIntersecting)return;var el=e.target;el.classList.add('is-in');
  if(el.hasAttribute('data-scramble'))scramble(el);
  $$('[data-count]',el).forEach(function(c){countTo(c,+c.dataset.count,1300)});
  io.unobserve(el)})},{threshold:.16,rootMargin:'0px 0px -6% 0px'});
$$('.rv,[data-split],[data-scramble],.pj .card').forEach(function(el){if(!el.closest('.hero'))io.observe(el)});


/* ========================= Holofote nos cartões ========================= */
$$('[data-spot]').forEach(function(c){c.addEventListener('pointermove',function(e){var r=c.getBoundingClientRect();c.style.setProperty('--mx',(e.clientX-r.left)+'px');c.style.setProperty('--my',(e.clientY-r.top)+'px')})});
/* Inclinação 3D nas telas dos projetos. */
$$('.media').forEach(function(m){var b=$('.browser',m);if(REDUCED||!FINE)return;
  m.addEventListener('pointermove',function(e){var r=m.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;b.style.transform='rotateY('+(x*10)+'deg) rotateX('+(-y*8)+'deg) translateZ(10px)'});
  m.addEventListener('pointerleave',function(){b.style.transform=''})});
/* Botões magnéticos. */
$$('[data-mag]').forEach(function(el){if(REDUCED||!FINE)return;var base=el.classList.contains('btn')?'skewX(-12deg) ':'';
  el.addEventListener('pointermove',function(e){var r=el.getBoundingClientRect();el.style.transform=base+'translate('+((e.clientX-r.left-r.width/2)*.22)+'px,'+((e.clientY-r.top-r.height/2)*.3)+'px)'});
  el.addEventListener('pointerleave',function(){el.style.transition='transform .55s cubic-bezier(.22,1,.36,1)';el.style.transform='';setTimeout(function(){el.style.transition=''},560)})});

/* ========================= Câmbio ========================= */
var gears=$$('.gear'),pill=$('#pill'),secs=gears.map(function(g){return $(g.getAttribute('href'))}),shifting=false;
function movePill(g){if(!g)return;pill.style.width=g.offsetWidth+'px';pill.style.transform='translateX('+g.offsetLeft+'px)'}
function setActive(i){gears.forEach(function(g,k){g.classList.toggle('on',k===i)});movePill(gears[i])}
addEventListener('resize',function(){movePill($('.gear.on'))});
gears.forEach(function(g){g.addEventListener('mouseenter',function(){movePill(g)});g.addEventListener('mouseleave',function(){movePill($('.gear.on'))})});
$$('a[href^="#"]').forEach(function(a){a.addEventListener('click',function(e){var t=$(a.getAttribute('href'));if(!t)return;e.preventDefault();
  if(a.classList.contains('brand')){scrollTo({top:0,behavior:REDUCED?'auto':'smooth'});setActive(0);return}var i=secs.indexOf(t);goTo(t,i>-1?gears[i].dataset.g:'D',i)})});
function goTo(t,g,i){if(shifting)return;var y=t.getBoundingClientRect().top+scrollY-(t.id==='início'?0:70);
  if(REDUCED){scrollTo(0,y);return}shifting=true;$('#shiftG').textContent=g;var s=$('#shift');s.classList.remove('out');s.classList.add('in');revBurst();Sound.rev(.6);
  setTimeout(function(){root.style.scrollBehavior='auto';scrollTo(0,y);root.style.scrollBehavior='';if(i>-1)setActive(i)},340);
  setTimeout(function(){s.classList.remove('in');s.classList.add('out')},420);setTimeout(function(){s.classList.remove('out');shifting=false},980)}
(function(){var nav=$('#nav'),p=0;addEventListener('scroll',function(){var y=scrollY;nav.classList.toggle('is-hidden',y>p+4&&y>500&&!shifting);p=y},{passive:true})})();

/* ========================= Palco (sem carro por enquanto) ========================= */
var stage=$('#stage'),car={hv:0};
function blink(){}

/* ========================= Buzina ========================= */
var honk=$('#honk'),hdots=$$('.bw__i i',honk),hornT=[];
function bibi(){
  hornT.forEach(clearTimeout);hornT=[];var later=function(f,ms){hornT.push(setTimeout(f,ms))};
  Sound.horn();revBurst();car.hv-=REDUCED?0:7;blink();
  body.classList.add('is-honking');honk.classList.remove('on');void honk.offsetWidth;honk.classList.add('on');
  stage.classList.remove('saying');void stage.offsetWidth;stage.classList.add('saying');
  hdots.forEach(function(d){d.classList.remove('lit')});
  [[0,0,1],[180,0,0],[310,1,1],[490,1,0],[650,-1,1]].forEach(function(s){later(function(){
    if(s[1]===-1)hdots.forEach(function(d){d.classList.add('lit')});else hdots[s[1]].classList.toggle('lit',!!s[2]);
    stage.classList.toggle('flash',!!s[2])},120+s[0])});
  if(!REDUCED){var n=0,m=$('#main'),sh=setInterval(function(){m.style.transform='translate('+(Math.random()*8-4)+'px,'+(Math.random()*8-4)+'px)';if(++n>7){clearInterval(sh);m.style.transform=''}},55)}
  later(function(){honk.classList.remove('on');stage.classList.remove('flash')},1250);
  later(function(){body.classList.remove('is-honking');stage.classList.remove('saying');hdots.forEach(function(d){d.classList.remove('lit')})},1650);
}
$('#hornBtn').addEventListener('click',bibi);
addEventListener('keydown',function(e){if((e.key==='b'||e.key==='B')&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&!/input|textarea|select/i.test((document.activeElement||{}).tagName))bibi()});

/* ========================= Loop principal ========================= */
var hudFill=$('#hudFill'),hudNeedle=$('#hudNeedle'),hudNum=$('#hudNum'),hudGear=$('#hudGear'),hudDrs=$('#hudDrs'),lamps=$$('#lamps i'),pjs=$$('.pj');
var GE=['N','1','2','3','4','5','6'],lastY=scrollY,shown=0,boost=0,lastT=performance.now();
function revBurst(){boost=160}
var mqDesk=matchMedia('(min-width: 901px)');
(function loop(now){
  var dt=Math.min(now-lastT,64);lastT=now;
  var y=scrollY,d=y-lastY;lastY=y;boost*=.92;shown=lerp(shown,clamp(Math.abs(d)*2.1+boost,0,260),.14);var k=Math.round(shown);
  var docH=root.scrollHeight-innerHeight,p=docH>0?clamp(y/docH,0,1):0;
  hudFill.style.strokeDashoffset=236-236*p;hudNeedle.style.transform='rotate('+(-135+shown/260*270)+'deg)';hudNum.textContent=k;
  hudGear.textContent=GE[k<3?0:Math.min(6,1+Math.floor(k/45))];hudDrs.classList.toggle('on',k>200);Sound.speed(k);
  for(var i=0;i<lamps.length;i++)lamps[i].classList.toggle('on',p>i/lamps.length+.001);
  /* Cartões de projeto empilhando. */
  if(mqDesk.matches&&!REDUCED){for(var j=0;j<pjs.length-1;j++){var nr=pjs[j+1].getBoundingClientRect(),cr=pjs[j].getBoundingClientRect();
      var q=clamp((cr.bottom-nr.top)/cr.height,0,1);pjs[j].style.transform='scale('+(1-q*.06).toFixed(4)+')';pjs[j].style.filter='brightness('+(1-q*.45).toFixed(3)+')'}}
  else pjs.forEach(function(e){e.style.transform='';e.style.filter=''});
  if(!shifting){var best=0;for(var s=0;s<secs.length;s++)if(secs[s]&&secs[s].getBoundingClientRect().top<=innerHeight*.45)best=s;if(!gears[best].classList.contains('on'))setActive(best)}
  requestAnimationFrame(loop);
})(performance.now());

/* ========================= Largada (sem intro) ========================= */
function heroIn(){
  $$('.hero .rv').forEach(function(el,i){setTimeout(function(){el.classList.add('is-in')},350+i*120)});
}
function start(){body.classList.add('is-live');heroIn();setTimeout(function(){movePill($('.gear.on'))},600)}
if(document.readyState==='loading')addEventListener('DOMContentLoaded',start);else requestAnimationFrame(start);
})();
