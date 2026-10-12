// ADS CHAIN - AS PER YOUR ORDER
// Rewarded: Monetag 11215599 -> RichAds 1013423/7744 -> Adsbitvex 000468
// Interstitial: RichAds -> Adsbitvex

async function showRewarded(){
  const s=document.getElementById('adStatus'); if(s) s.innerText='Loading ad...';
  try{
    if(typeof show_11215599==='function'){ await show_11215599(); if(s) s.innerText='Reward!'; return true; }
    throw 1;
  }catch{
    try{
      if(window.TelegramAdsController){ await window.TelegramAdsController.triggerRewardedAd(); if(s) s.innerText='Reward!'; return true; }
      throw 1;
    }catch{
      try{ await window.showadsbitvex(); if(s) s.innerText='Reward!'; return true; }
      catch{ if(s) s.innerText='Ad failed, retry'; return false; }
    }
  }
}
async function showInterstitial(){
  try{ await window.TelegramAdsController.triggerInterstitial(); return true; }
  catch{ try{ await window.showadsbitvex_init(); return true; }catch{ return false; } }
}

// GAME LOGIC
let curLevel=+localStorage.getItem('toilet_level')||1;
let maxUnlock=+localStorage.getItem('toilet_max')||1;
let selectedIdx=null;

const COLORS=['blue','red','green','yellow','purple','orange'];
const EMOJI={blue:'🧑‍💼',red:'👩',green:'🧑',yellow:'👦',purple:'👧',orange:'🧔'};

function mulberry32(a){return function(){var t=a+=0x6D2B79F5;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296}}

function genLevel(lvl){
  const rnd=mulberry32(lvl*1337);
  let toiletCount=2+Math.floor(lvl/20); if(toiletCount>4) toiletCount=4;
  let queueLen=6+Math.min(8, Math.floor(lvl/8));
  let colorCount=2+Math.floor(lvl/25); if(colorCount>6) colorCount=6;
  let useColors=COLORS.slice(0,colorCount).sort(()=>rnd()-0.5);

  let queue=[];
  for(let i=0;i<queueLen;i++){
    queue.push(useColors[Math.floor(rnd()*useColors.length)]);
  }
  // ensure solvable - at least 3 of each color
  useColors.forEach(c=>{ for(let k=0;k<2;k++) queue[Math.floor(rnd()*queue.length)]=c; });

  let toilets=[];
  for(let i=0;i<toiletCount;i++){
    toilets.push({id:i, color:null, filled:[], cap:3+Math.floor(lvl/30), blockedUntil:0});
  }
  return {queue, toilets, useColors};
}

let state=null;
function startLevel(lvl){
  curLevel=lvl; localStorage.setItem('toilet_level',lvl);
  document.getElementById('levelScreen').classList.remove('show');
  state=genLevel(lvl); selectedIdx=null;
  document.getElementById('lvl').innerText=lvl;
  render();
}
function render(){
  const qEl=document.getElementById('queue'); qEl.innerHTML='';
  state.queue.forEach((col, idx)=>{
    const d=document.createElement('div');
    d.className=`person c-${col} ${selectedIdx===idx?'selected':''}`;
    d.innerHTML=`<div class="head">${EMOJI[col]||'🧑'}</div><div class="body">${col.toUpperCase()}</div>`;
    d.onclick=()=>{ selectedIdx=idx; render(); };
    qEl.appendChild(d);
  });

  const tEl=document.getElementById('toilets'); tEl.innerHTML='';
  state.toilets.forEach(t=>{
    const isBlocked=Date.now()<t.blockedUntil;
    const d=document.createElement('div');
    d.className=`toilet ${t.color?`need-${t.color}`:''} ${isBlocked?'full':''}`;
    let fillHtml=t.filled.map(c=>`<div class="dot" style="background:${getHex(c)}"></div>`).join('');
    d.innerHTML=`<div class="t-icon">${isBlocked?'🚫':'🚽'}</div><div class="t-cap">${t.color? t.color.toUpperCase()+' TOILET' : 'EMPTY'} ${t.filled.length}/${t.cap}</div><div class="t-fill">${fillHtml}</div>`;
    d.onclick=()=> sendToToilet(t.id);
    tEl.appendChild(d);
  });

  if(state.queue.length===0){ win(); }
  if(state.queue.length>12){ lose(); }
}
function getHex(c){ return {blue:'#3b82f6',red:'#ef4444',green:'#22c55e',yellow:'#eab308',purple:'#a855f7',orange:'#f97316'}[c]||'#fff'; }

function sendToToilet(tid){
  if(selectedIdx===null) return;
  const t=state.toilets[tid];
  if(Date.now()<t.blockedUntil) return;
  if(t.filled.length>=t.cap) return;

  const col=state.queue[selectedIdx];
  if(t.color && t.color!==col){
    // wrong color
    t.blockedUntil=Date.now()+2000; render(); setTimeout(render,2100);
    if(navigator.vibrate) navigator.vibrate(100);
    return;
  }
  if(!t.color) t.color=col;
  t.filled.push(col);
  state.queue.splice(selectedIdx,1);
  selectedIdx=null;
  // if toilet full, clear it after anim
  if(t.filled.length>=t.cap){
    setTimeout(()=>{ t.filled=[]; t.color=null; render(); }, 400);
  }
  render();
}

function win(){
  if(curLevel>=maxUnlock){ maxUnlock=Math.min(100,curLevel+1); localStorage.setItem('toilet_max',maxUnlock); }
  document.getElementById('winText').innerText=`Queue cleared! Level ${curLevel} done`;
  document.getElementById('winModal').classList.add('show');
  showInterstitial();
}
function lose(){ document.getElementById('loseModal').classList.add('show'); }

function renderGrid(){
  const g=document.getElementById('levelGrid'); g.innerHTML='';
  for(let i=1;i<=100;i++){
    const d=document.createElement('div');
    d.className='level-cell '+(i<=maxUnlock?(i<maxUnlock?'completed':'unlocked'):'locked');
    d.innerHTML=`${i>maxUnlock?'🔒':i}<small>${i*15}</small>`;
    d.onclick=()=> openLevel(i);
    g.appendChild(d);
  }
}
function openLevel(lvl){
  if(lvl>maxUnlock){
    document.getElementById('adTitle').innerText=`Level ${lvl} Locked`;
    document.getElementById('adDesc').innerText=`Unlock ke liye ad dekho`;
    document.getElementById('adModal').classList.add('show');
    document.getElementById('watchBtn').onclick=async()=>{
      const btn=document.getElementById('watchBtn'); btn.innerText='LOADING...';
      const ok=await showRewarded(); btn.innerText='📺 WATCH AD & UNLOCK';
      if(ok){ maxUnlock=lvl; localStorage.setItem('toilet_max',maxUnlock); document.getElementById('adModal').classList.remove('show'); startLevel(lvl); }
    };
    return;
  }
  startLevel(lvl);
}

document.getElementById('gridBtn').onclick=()=>{ renderGrid(); document.getElementById('levelScreen').classList.add('show'); };
document.getElementById('playBtn').onclick=()=> document.getElementById('levelScreen').classList.remove('show');
document.getElementById('cancelBtn').onclick=()=> document.getElementById('adModal').classList.remove('show');
document.getElementById('nextBtn').onclick=()=>{ document.getElementById('winModal').classList.remove('show'); if(curLevel<100) startLevel(curLevel+1); else { renderGrid(); document.getElementById('levelScreen').classList.add('show'); } };
document.getElementById('restartBtn').onclick=()=>{ document.getElementById('loseModal').classList.remove('show'); startLevel(curLevel); };
document.getElementById('contBtn').onclick=async()=>{
  const ok=await showRewarded();
  if(ok){ state.queue.splice(0,3); document.getElementById('loseModal').classList.remove('show'); render(); }
};
document.getElementById('shuffleBtn').onclick=async()=>{
  const ok=await showRewarded(); if(!ok) return;
  state.queue.sort(()=>Math.random()-0.5); render();
};
document.getElementById('hintBtn').onclick=async()=>{
  const ok=await showRewarded(); if(!ok) return;
  if(selectedIdx===null) selectedIdx=0;
  const col=state.queue[selectedIdx];
  const target=state.toilets.find(t=>!t.color || t.color===col);
  if(target){ document.querySelectorAll('.toilet')[target.id].classList.add('active'); setTimeout(()=>render(),1000); }
};
document.getElementById('extraBtn').onclick=async()=>{
  const ok=await showRewarded(); if(!ok) return;
  if(state.toilets.length<4){ state.toilets.push({id:state.toilets.length,color:null,filled:[],cap:3,blockedUntil:0}); render(); }
};

renderGrid(); startLevel(curLevel);
window.Telegram?.WebApp?.expand();
