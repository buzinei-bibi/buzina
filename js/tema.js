/* Aplica o tema salvo antes de desenhar a página e já pré-carrega a Carla da cor do tema (vermelha no escuro, roxa no claro). */
try{var t=localStorage.getItem('bibi-theme');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t}catch(e){}
(function(){var l=document.createElement('link');l.rel='preload';l.as='image';l.setAttribute('fetchpriority','high');
  l.href=document.documentElement.dataset.theme==='light'?'img/carla/carro-roxo.webp?v=18':'img/carla/carro.webp?v=18';document.head.appendChild(l)})();
