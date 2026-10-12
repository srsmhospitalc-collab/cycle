// AD FALLBACK - YOUR CHAIN
async function showRewarded(){
  const s=document.getElementById('adStatus'); if(s) s.innerText='Loading...';
  try{ if(typeof show_11215599==='function'){ await show_11215599(); if(s) s.innerText='Reward!'; return true; } throw 1; }
  catch{ try{ if(window.TelegramAdsController){ await window.TelegramAdsController.triggerRewardedAd(); return true; } throw 1; }
  catch{ try{ await window.showadsbitvex(); return true; }catch{ if(s) s.innerText='Ad failed'; return false; } } }
}
async function showInterstitial(){ try{ await window.TelegramAdsController.triggerInterstitial(); }catch{ try{ await window.showadsbitvex_init(); }catch{} } }

// GAME
let cur=+localStorage.getItem('fruit_level')||1;
let max=+localStorage.getItem('fruit_max')||1;
let score=0, target=0, missed=0, isSlow=false, gameTimer=null, spawnTimer=null;

const FRUITS=[
  {emoji:'🍎',color:'red'},{emoji:'🍓',color:'red'},{emoji:'🍉',color:'red'},
  {emoji:'🍌',color:'yellow'},{emoji:'🍋',color:'yellow'},{emoji:'🥭',color:'yellow'},
  {emoji:'🍇',color:'purple'},{emoji:'🫐',color:'purple'},{emoji:'🍆',color:'purple'}
];

function mulberry32(a){return function(){var t=a+=0x6D2B79F5;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296}}

function getLevelConfig(lvl){
  const rnd=mulberry32(lvl*999);
  return {
    target:15+Math.floor(lvl*1.2),
    speed: 2.5 - Math.min(1.5, lvl*0.02), // seconds to fall
    spawn: Math.max(400, 1100 - lvl*8),
    colors: lvl<10?['red','yellow']: lvl<30?['red','yellow','purple']:['red','yellow','purple']
  };
}

function startLevel(lvl){
  cur=lvl; localStorage.setItem('fruit_level',lvl);
  document.getElementById('levelScreen').classList.remove('show');
  document.getElementById('lvl').innerText=lvl;
  const cfg=getLevelConfig(lvl); target=cfg.target; score=0; missed=0; updateUI();
  const area=document.getElementById('fallArea'); area.innerHTML='';
  clearInterval(spawnTimer); clearInterval(gameTimer);
  let count=0;
  spawnTimer=setInterval(()=>{
    if(count>=target+5) { clearInterval(spawnTimer); return; }
    spawnFruit(cfg); count++;
  }, cfg.spawn);
}

function spawnFruit(cfg){
  const area=document.getElementById('fallArea');
  const rnd=Math.random();
  let pool=FRUITS.filter(f=>cfg.colors.includes(f.color));
  const f=pool[Math.floor(rnd*pool.length)];
  const el=document.createElement('div');
  el.className='fruit';
  el.innerText=f.emoji;
  el.dataset.color=f.color;
  el.style.left=Math.random()* (area.clientWidth-56) + 'px';
  el.style.animationDuration=(isSlow? cfg.speed*2 : cfg.speed)+'s';
  el.onclick=()=> cutFruit(el);
  area.appendChild(el);
  el.addEventListener('animationend',()=>{
    if(!el.classList.contains('cut')){
      el.remove(); missed++;
      if(missed>=3) lose();
    }
  });
}

function cutFruit(el){
  if(el.classList.contains('cut')) return;
  const col=el.dataset.color;
  el.classList.add('cut');
  // blast to basket
  const basket=document.querySelector(`.basket[data-color="${col}"]`);
  if(basket){ basket.classList.add('active'); setTimeout(()=>basket.classList.remove('active'),300); }
  score++; updateUI();
  // particles
  for(let i=0;i<4;i++){
    const p=document.createElement('div');
    p.style.position='absolute'; p.style.left=el.style.left; p.style.top=el.getBoundingClientRect().top - document.getElementById('fallArea').getBoundingClientRect().top + 'px';
    p.innerText='✨'; p.style.pointerEvents='none';
    document.getElementById('fallArea').appendChild(p);
    p.animate([{transform:'translate(0,0)',opacity:1},{transform:`translate(${(Math.random()-0.5)*80}px, -60px)`,opacity:0}],{duration:400}).onfinish=()=>p.remove();
  }
  setTimeout(()=>el.remove(),350);
}

function updateUI(){
  document.getElementById('score').innerText=`${score}/${target}`;
  document.getElementById('c-red').innerText=document.querySelectorAll('.fruit[data-color="red"].cut').length || Math.floor(score/3);
  document.getElementById('prog').style.width=Math.min(100, (score/target)*100)+'%';
  if(score>=target) win();
}

function win(){
  clearInterval(spawnTimer);
  if(cur>=max){ max=Math.min(100,cur+1); localStorage.setItem('fruit_max',max); }
  showInterstitial();
  renderGrid();
  document.getElementById('levelScreen').classList.add('show');
  // ek chota win text top pe flash
  const scoreEl=document.getElementById('score');
  const old=scoreEl.innerText;
  scoreEl.innerText=`🎉 WIN!`;
  scoreEl.style.color='#00ff88';
  setTimeout(()=>{ scoreEl.innerText=old; scoreEl.style.color='#fff'; }, 1500);
}

function renderGrid(){
  const g=document.getElementById('levelGrid'); g.innerHTML='';
  for(let i=1;i<=100;i++){
    const d=document.createElement('div');
    d.className='level-cell '+(i<=max?(i<max?'completed':'unlocked'):'locked');
    d.innerHTML=`${i>max?'🔒':i}`;
    d.onclick=()=> openLevel(i);
    g.appendChild(d);
  }
}
function openLevel(lvl){
  if(lvl>max){
    document.getElementById('adTitle').innerText=`Level ${lvl} Locked`;
    document.getElementById('adModal').classList.add('show');
    document.getElementById('watchBtn').onclick=async()=>{
      const btn=document.getElementById('watchBtn'); btn.innerText='LOADING...';
      const ok=await showRewarded(); btn.innerText='📺 WATCH AD & UNLOCK';
      if(ok){ max=lvl; localStorage.setItem('fruit_max',max); document.getElementById('adModal').classList.remove('show'); startLevel(lvl); }
    }; return;
  }
  startLevel(lvl);
}

document.getElementById('gridBtn').onclick=()=>{ renderGrid(); document.getElementById('levelScreen').classList.add('show'); };
document.getElementById('playBtn').onclick=()=> document.getElementById('levelScreen').classList.remove('show');
document.getElementById('cancelBtn').onclick=()=> document.getElementById('adModal').classList.remove('show');
document.getElementById('nextBtn').onclick=()=>{ document.getElementById('winModal').classList.remove('show'); if(cur<100) startLevel(cur+1); else { renderGrid(); document.getElementById('levelScreen').classList.add('show'); } };
document.getElementById('restartBtn').onclick=()=>{ document.getElementById('loseModal').classList.remove('show'); startLevel(cur); };
document.getElementById('contBtn').onclick=async()=>{
  const ok=await showRewarded(); if(ok){ missed=0; document.getElementById('loseModal').classList.remove('show'); const cfg=getLevelConfig(cur); spawnTimer=setInterval(()=>spawnFruit(cfg), cfg.spawn); }
};
document.getElementById('slowBtn').onclick=async()=>{
  const ok=await showRewarded(); if(!ok) return;
  isSlow=true; setTimeout(()=>isSlow=false,5000);
};
document.getElementById('bombBtn').onclick=async()=>{
  const ok=await showRewarded(); if(!ok) return;
  document.querySelectorAll('.fruit').forEach(el=>{ if(!el.classList.contains('cut')) cutFruit(el); });
};

renderGrid(); startLevel(cur);
window.Telegram?.WebApp?.expand();
