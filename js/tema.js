/* Aplica o tema salvo antes de desenhar a página. */
try{var t=localStorage.getItem('bibi-theme');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t}catch(e){}
