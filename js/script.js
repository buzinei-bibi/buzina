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
  /* Buzina = a voz da bibi falando "bibi" (toca sempre que apertam o botão ou o B, mesmo com o motor mudo).
     O áudio é decodificado uma vez só e fica na memória: toca na hora, sem rebobinar nem engasgar. */
  var VOZ='audio/bibi.mp3?v=13',vozBuf=null,vozSrc=null,vozT0=-1,vozReserva=null;
  (function(){
    var OAC=window.OfflineAudioContext||window.webkitOfflineAudioContext;
    if(!OAC||!window.fetch){vozReserva=new Audio(VOZ);return}
    fetch(VOZ).then(function(r){return r.arrayBuffer()}).then(function(b){return new Promise(function(ok,erro){new OAC(1,1,44100).decodeAudioData(b,ok,erro)})})
      .then(function(buf){vozBuf=buf}).catch(function(){vozReserva=new Audio(VOZ)});
  })();
  function engine(v){if(!ok())return;if(v&&!eng){var o=ctx.createOscillator(),g=ctx.createGain(),f=ctx.createBiquadFilter();o.type='sawtooth';o.frequency.value=48;f.type='lowpass';f.frequency.value=420;
    g.gain.value=.0001;o.connect(f);f.connect(g);g.connect(ctx.destination);o.start();eng={o:o,g:g,f:f}}if(eng)eng.g.gain.setTargetAtTime(v?.045:.0001,ctx.currentTime,.15)}
  function rev(d){if(!on||!ok())return;var t=ctx.currentTime,o=ctx.createOscillator(),g=ctx.createGain(),f=ctx.createBiquadFilter();o.type='sawtooth';
    o.frequency.setValueAtTime(50,t);o.frequency.exponentialRampToValueAtTime(280,t+d);f.type='lowpass';f.frequency.value=700;g.gain.setValueAtTime(.0001,t);
    g.gain.exponentialRampToValueAtTime(.12,t+.2);g.gain.exponentialRampToValueAtTime(.0001,t+d+.3);o.connect(f);f.connect(g);g.connect(ctx.destination);o.start(t);o.stop(t+d+.4)}
  return{toggle:function(){on=!on;engine(on);if(on)rev(1.2);return on},horn:function(){
      if(vozBuf&&ok()){if(vozSrc)try{vozSrc.stop()}catch(e){}vozSrc=ctx.createBufferSource();vozSrc.buffer=vozBuf;vozSrc.connect(ctx.destination);vozSrc.start();vozT0=ctx.currentTime;return}
      if(vozReserva)try{vozReserva.currentTime=0;var p=vozReserva.play();if(p&&p.catch)p.catch(function(){})}catch(e){}},
    /* Onde a voz está agora (s), já descontando o atraso de saída do som; null se não está tocando. */
    voz:function(){if(vozT0>=0&&ctx)return ctx.currentTime-vozT0-(ctx.outputLatency||ctx.baseLatency||0);return vozReserva&&!vozReserva.paused?vozReserva.currentTime:null},rev:rev,
    speed:function(k){if(!eng||!on)return;eng.o.frequency.setTargetAtTime(48+k*.9,ctx.currentTime,.08);eng.f.frequency.setTargetAtTime(420+k*5,ctx.currentTime,.08)}};
})();
$('#snd').addEventListener('click',function(){var v=Sound.toggle();this.setAttribute('aria-pressed',v);this.setAttribute('aria-label',v?'Desligar o som do motor':'Ligar o som do motor');if(v)revBurst()});

/* ========================= Texto ========================= */
$$('[data-split]').forEach(function(el){var t=el.textContent,o='';for(var i=0;i<t.length;i++)o+='<span class="ch"><i style="transition-delay:'+(i*.03)+'s">'+(t[i]===' '?'&nbsp;':t[i])+'</i></span>';el.innerHTML=o;el.setAttribute('aria-label',t)});
function countTo(el,n,d){var t0=performance.now();(function s(now){var t=clamp((now-t0)/d,0,1);el.textContent=Math.round(n*(1-Math.pow(1-t,3)));if(t<1)requestAnimationFrame(s)})(t0)}

var io=new IntersectionObserver(function(es){es.forEach(function(e){if(!e.isIntersecting)return;var el=e.target;el.classList.add('is-in');
  $$('[data-count]',el).forEach(function(c){countTo(c,+c.dataset.count,1300)});
  io.unobserve(el)})},{threshold:.16,rootMargin:'0px 0px -6% 0px'});
$$('.rv,[data-split],.pj .card').forEach(function(el){if(!el.closest('.hero'))io.observe(el)});


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

/* ========================= Palco: a Carla chega rasgando a tela e estaciona em cima do bibi ========================= */
var stage=$('#stage'),car={hv:0};
var Carla=(function(){
  var el=$('#carla'),mola=$('#carlaMola'),lid=$('#carlaLid'),aroF=$('#aroF'),aroT=$('#aroT'),corpo=$('.carla__corpo',el),rastro=$('.carla__rastro',el),atras=$('#fumacaAtras'),frente=$('#fumacaFrente');
  /* Medidas em px da arte (1406x622): raio do pneu e pontos de onde sai fumaça. */
  var CW=1406,CH=622,PNEU=181,PF=[262,606],PT=[40,486],PC=[8,420];
  /* Chegada como carro dirigido: vem embalado (T1), freia curto e firme perto da vaga (TB) e a suspensão assenta (FIM). */
  var T1=.85,TB=.5,FIM=.75,fase='espera',x0=-1e4,V=1,A=1,ang=0,lastX=0,trava=false,acc=0,u0=0,anims=[],parou=false;
  var y=0,vy=0,tIdle=0,proxPisca=0,proxRonco=0,ronco=-1e4,vis=true;
  var rd=function(a,b){return a+Math.random()*(b-a)};
  function geo(){var r=stage.getBoundingClientRect(),w=r.width*.92,h=w*CH/CW;return{r:r,w:w,l:r.width*.04,top:r.height*.97-h,k:w/CW}}
  function pos(t){if(t<T1)return x0+V*t;var u=Math.min(t-T1,TB);return x0+V*T1+V*u-A*u*u/2}
  function vel(t){return t<T1?V:Math.max(0,V-A*(t-T1))}
  /* Uma nuvem de fumaça (textura de ruído, 4 variações): nasce pequena no pneu, gira devagar, cresce, sobe e se desfaz. */
  function puff(cam,pt,g,x,tam,dx,dy,vida,pico){
    var e=document.createElement('i'),X=g.l+x+(pt[0]+rd(-14,14))*g.k,Y=g.top+(pt[1]+rd(-8,6))*g.k,s=tam*g.k/100,r0=rd(0,360),r1=r0+rd(-55,55);
    e.className='puff p'+(1+(Math.random()*4|0));cam.appendChild(e);
    e.animate([{transform:'translate('+X+'px,'+Y+'px) rotate('+r0+'deg) scale('+(s*.22)+')',opacity:0},{opacity:pico,offset:.08},{opacity:pico*.75,offset:.45},
      {transform:'translate('+(X+dx*g.k)+'px,'+(Y+dy*g.k)+'px) rotate('+r1+'deg) scale('+s+')',opacity:0}],{duration:vida,easing:'cubic-bezier(.15,.65,.35,1)'}).onfinish=function(){e.remove()};
  }
  function pisca(dupla){
    if(REDUCED)return;
    lid.animate([{offset:.45,transform:'translateY(98px)'},{offset:.55,transform:'translateY(98px)'}],{duration:170,easing:'ease-in-out',iterations:dupla?2:1});
  }
  function chegar(){
    if(fase!=='espera')return;
    var g=geo();el.style.opacity='';
    if(REDUCED||g.r.bottom<0||g.r.top>innerHeight){fase='parada';tIdle=performance.now();return}
    x0=-(g.r.left+g.l+g.w*1.05+80);V=-x0/(T1+TB/2);A=V/TB;lastX=x0;
    ang=-(pos(T1+TB*.72)-x0)/(PNEU*g.k)*57.2958;   /* ângulo inicial calculado p/ as rodas travarem em volta completa (aro igual ao desenho, porca no lugar) */
    /* A trajetória inteira (posição, arfagem da suspensão, rastro) é calculada aqui e entregue ao compositor do navegador:
       o carro anda liso mesmo com a página ocupada animando o texto do hero. */
    var kc=[],km=[],kr=[],pp=0,vp=0,H=120,N=Math.round((T1+TB+FIM)*H);
    for(var i=0;i<=N;i++){
      var tt=i/H,k=vel(tt)/V,alvo=tt<T1?-.6:(tt<T1+TB?.9+2.4*k:0);
      vp+=(-120*(pp-alvo)-11*vp)/H;pp+=vp/H;
      kc.push({transform:'translate3d('+pos(tt).toFixed(1)+'px,0,0)'});
      km.push({transform:'translate3d(0,'+(Math.sin(tt*48)*.7*k).toFixed(2)+'px,0) rotate('+pp.toFixed(3)+'deg) scale('+(1+k*.12).toFixed(3)+',1)'});
      kr.push({opacity:+(Math.pow(k,1.3)*.95).toFixed(3)});
    }
    var op={duration:N/H*1000,easing:'linear',fill:'forwards'};
    el.style.willChange=mola.style.willChange='transform';   /* camada própria só enquanto corre */
    anims=[el.animate(kc,op),mola.animate(km,op),rastro.animate(kr,op)];
    fase='chegando';Sound.rev(1.1);
  }
  function quadro(now){
    requestAnimationFrame(quadro);
    var dt=Math.min(.05,(now-(u0||now))/1000);u0=now;
    if(!vis)return;
    var g=geo(),ey=0,road=0;
    if(fase==='espera'){el.style.transform='';el.style.opacity='.01'}     /* já desenhado no lugar (quase invisível): sem engasgo quando aparece */
    else if(fase==='chegando'){
      var t=(anims[0].currentTime||0)/1000,frear=t>=T1,v=vel(t),x=pos(t),k=v/V;
      if(frear&&t-T1>TB*.72&&!trava){trava=true;ang=Math.round(ang/360)*360}   /* trava as rodas no fim e arrasta */
      if(!trava)ang+=(x-lastX)/(PNEU*g.k)*57.2958;lastX=x;
      var naTela=g.r.left+g.l+x+PT[0]*g.k>-150;
      for(acc+=dt;acc>(frear?.022:.05);acc-=frear?.022:.05){
        if(t>=T1+TB||!naTela)continue;
        if(frear){var f=.6+k*.6;
          puff(frente,PF,g,x,rd(300,480)*f,v*.1/g.k-rd(40,180),-rd(20,120),rd(1600,2600),.6);
          puff(atras,PT,g,x,rd(360,560)*f,v*.08/g.k-rd(60,220),-rd(40,150),rd(1800,2800),.66);
        }else{
          puff(atras,PT,g,x,rd(180,300),-rd(120,280),-rd(30,100),rd(1100,1700),.42);
          puff(atras,PC,g,x,rd(160,260),-rd(140,300),-rd(20,80),rd(1000,1500),.34);
        }
      }
      if(t>=T1+TB&&!parou){parou=true;for(var i=0;i<8;i++)puff(i%2?frente:atras,i%2?PF:PT,g,0,rd(480,720),rd(-260,180),-rd(60,200),rd(2400,3200),.45)}
      if(t>=T1+TB+FIM){
        fase='parada';tIdle=now;proxPisca=now+600;proxRonco=now+5000;
        anims.forEach(function(a){a.cancel()});el.style.willChange=mola.style.willChange='';
      }
    }
    if(fase==='parada'){
      /* Motor ligado: respira, pisca de vez em quando e dá umas roncadas. */
      var ti=(now-tIdle)/1000,b=Math.sin(ti*3.3);
      ey=b*2.2*g.k*2;
      if(!REDUCED){
        if(now>proxPisca){pisca(Math.random()<.25);proxPisca=now+rd(2200,5600)}
        if(now>proxRonco){ronco=now;Sound.rev(.5);puff(atras,PC,g,0,rd(220,300),-rd(140,220),-rd(40,90),1500,.36);proxRonco=now+rd(6500,10500)}
        if(now-ronco<380)road=rd(-1,1)*2.4*(1-(now-ronco)/380);
      }else ey=0;
      /* Pulo da buzina (mola amortecida). */
      if(car.hv){vy+=car.hv*40;car.hv=0}
      vy+=(-140*y-9*vy)*dt;y+=vy*dt;
      /* Parada: só desloca, sempre caindo em pixel inteiro da tela, então o bitmap nunca é reamostrado (nítido). */
      el.style.transform='';rastro.style.opacity=0;var d=devicePixelRatio||1,rb=el.getBoundingClientRect(),ty=y+ey+road;
      mola.style.transform='translate('+(Math.round(rb.left*d)/d-rb.left).toFixed(3)+'px,'+(Math.round((rb.top+ty)*d)/d-rb.top).toFixed(3)+'px)';
    }
    var r='rotate('+ang.toFixed(1)+')';aroF.setAttribute('transform',r);aroT.setAttribute('transform',r);
  }
  new IntersectionObserver(function(es){vis=es[0].isIntersecting}).observe(stage);
  requestAnimationFrame(quadro);
  /* Renderização em alta do vetor (WebP, pré-carregado no <head>). A largada não espera: o carro nasce fora da tela
     e leva ~0,3 s para entrar, tempo de sobra para a imagem terminar de decodificar. */
  if(corpo.decode)corpo.decode().catch(function(){});
  [1,2,3,4].forEach(function(n){(new Image).src='img/carla/fumaca-'+n+'.webp?v=13'});
  return{go:chegar,pisca:pisca};
})();
function blink(){Carla.pisca()}

/* ========================= Buzina ========================= */
/* Marcas medidas no audio/bibi.mp3 (s): a fala começa em FALA e cada "bi" (início, fim) acende o pingo do seu "i" e os faróis da Carla. */
var honk=$('#honk'),hornT=[],hornN=0,FALA=1.02,SILABAS=[[1.033,1.173],[1.325,1.635]];
function bibi(){
  hornT.forEach(clearTimeout);hornT=[];body.classList.remove('bi1','bi2');stage.classList.remove('flash');var later=function(f,ms){hornT.push(setTimeout(f,ms))},vez=++hornN;
  /* Tudo segue o relógio do próprio áudio (1 s de respiro antes da fala), então pingos e faróis piscam junto com cada "bi". */
  var ev=[[FALA,efeitos]];
  SILABAS.forEach(function(s,i){
    ev.push([s[0],function(){body.classList.add('bi'+(i+1));stage.classList.add('flash')}],
            [s[1]+.04,function(){body.classList.remove('bi'+(i+1));stage.classList.remove('flash')}]);
  });
  var t0=performance.now();Sound.horn();
  (function relogio(){
    if(vez!==hornN)return;
    var t=Sound.voz();if(t===null)t=(performance.now()-t0)/1000;   /* sem áudio, segue o relógio da página */
    while(ev.length&&t>=ev[0][0])ev.shift()[1]();
    if(ev.length)requestAnimationFrame(relogio);
  })();
  function efeitos(){
    revBurst();car.hv-=REDUCED?0:7;blink();
    body.classList.add('is-honking');honk.classList.remove('on');void honk.offsetWidth;honk.classList.add('on');
    stage.classList.remove('saying');void stage.offsetWidth;stage.classList.add('saying');
    if(!REDUCED){var n=0,m=$('#main'),sh=setInterval(function(){m.style.transform='translate('+(Math.random()*8-4)+'px,'+(Math.random()*8-4)+'px)';if(++n>7){clearInterval(sh);m.style.transform=''}},55)}
    later(function(){honk.classList.remove('on');stage.classList.remove('flash')},1250);
    later(function(){body.classList.remove('is-honking','bi1','bi2');stage.classList.remove('saying')},1650);
  }
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
function start(){body.classList.add('is-live');heroIn();Carla.go();setTimeout(function(){movePill($('.gear.on'))},600)}
if(document.readyState==='loading')addEventListener('DOMContentLoaded',start);else requestAnimationFrame(start);
})();
