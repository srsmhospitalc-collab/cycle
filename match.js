const tg = window.Telegram?.WebApp; tg?.expand();
let curLevel=+localStorage.getItem('match_level')||1;
let maxUnlock=+localStorage.getItem('match_max')||1;
let tray=[], boardTiles=[], history=[];
let icons=["🍎","🍌","🍇","🍓","🍒","🥝","🍍","🥥","🍑","🍋","🍉","🥭","🍈","🍐","🫐","🍏","⚽","🏀","🎮","🎲","🚗","🚀","⭐","❤️","🔥","💎","🎁","🍔","🍕","🧁"];

// --- ADS FALLBACK ---
async function showInterstitial(){
  try{
    if(window.TelegramAdsController?.triggerInterstitialBanner) await window.TelegramAdsController.triggerInterstitialBanner();
    else await window.TelegramAdsController.triggerNativeNotification(false);
    return true;
  }catch{ try{ await window.showadsbitvex_init(); return true; }catch{ return false; } }
}
async function showRewarded(){
  const s=document.getElementById('adStatus'); if(s) s.innerText='Loading ad...';
  try{ await window.show_11215599(); if(s) s.innerText='Reward!'; return true; }
  catch{
    try{ await window.TelegramAdsController.triggerNativeNotification(true); return true; }
    catch{ try{ await window.showadsbitvex(); return true; }catch{ if(s) s.innerText='Ad failed'; return false; } }
  }
}

// --- LEVEL GRID ---
function renderGrid(){
  const g=document.getElementById('levelGrid'); g.innerHTML='';
  for(let i=1;i<=100;i++){
    const d=document.createElement('div');
    d.className='level-cell '+(i<=maxUnlock?(i<maxUnlock?'completed':'unlocked'):'locked');
    d.innerText=i; d.onclick=()=> openLevel(i);
    g.appendChild(d);
  }
}
function openLevel(lvl){
  if(lvl>maxUnlock){
    document.getElementById('adTitle').innerText=`Level ${lvl} Locked`;
    document.getElementById('adModal').classList.add('show');
    document.getElementById('watchAdBtn').onclick=async()=>{
      const btn=document.getElementById('watchAdBtn'); btn.innerText='LOADING...';
      const ok=await showRewarded(); btn.innerText='📺 WATCH AD & UNLOCK';
      if(ok){ maxUnlock=lvl; localStorage.setItem('match_max',maxUnlock); document.getElementById('adModal').classList.remove('show'); startLevel(lvl); }
    }; return;
  }
  startLevel(lvl);
}
function startLevel(lvl){
  curLevel=lvl; localStorage.setItem('match_level',lvl);
  document.getElementById('levelModal').classList.remove('show');
  initLevel(lvl); renderGrid();
}

// --- GAME LOGIC ---
function initLevel(lvl){
  const board=document.getElementById('board'); board.innerHTML='';
  tray=[]; history=[]; boardTiles=[];
  const difficulty = Math.min(lvl, 30);
  const pairs = 6 + Math.floor(difficulty/2); // unique icons
  const totalTiles = (pairs*3) + (lvl>20? 9 : 0); // always multiple of 3
  const layers = 1 + Math.floor(lvl/15); // 3D effect

  // pick icons
  const useIcons = icons.slice(0, pairs).sort(()=>Math.random()-0.5);
  let tilePool=[];
  useIcons.forEach(ic=>{ for(let k=0;k<3;k++) tilePool.push(ic); });
  // add extra for higher levels
  if(totalTiles>tilePool.length){ while(tilePool.length<totalTiles){ const ic=useIcons[Math.floor(Math.random()*useIcons.length)]; tilePool.push(ic); } }
  tilePool = tilePool.slice(0, Math.floor(tilePool.length/3)*3).sort(()=>Math.random()-0.5);

  const W=board.clientWidth||360, H=board.clientHeight||400;
  tilePool.forEach((icon, i)=>{
    const x = 20 + (Math.random()*(W-80));
    const y = 20 + (Math.random()*(H-80));
    const layer = Math.floor(Math.random()*layers);
    const el=document.createElement('div');
    el.className='tile'; el.innerText=icon; el.style.left=x+'px'; el.style.top=y+'px'; el.style.zIndex=layer*10 + i;
    el.style.transform=`scale(${0.9+layer*0.08})`;
    el.dataset.icon=icon; el.dataset.idx=i;
    el.onclick=()=> pickTile(el, icon);
    board.appendChild(el);
    boardTiles.push({el, icon, layer, x, y});
  });
  updateLocks(); renderTray(); document.getElementById('levelLabel').innerText='LEVEL '+lvl; document.getElementById('tilesLeft').innerText=boardTiles.length+' tiles';
}
function updateLocks(){
  // simple lock: if tile overlaps 80% by higher z, lock it
  boardTiles.forEach(t=>{
    let locked=false;
    boardTiles.forEach(o=>{
      if(o===t) return;
      if(o.layer>t.layer && Math.abs(o.x-t.x)<40 && Math.abs(o.y-t.y)<40) locked=true;
    });
    t.el.classList.toggle('locked', locked);
  });
}
function pickTile(el, icon){
  if(el.classList.contains('locked')) return;
  if(tray.length>=7) return showLose();
  history.push({boardHTML: document.getElementById('board').innerHTML, tray:[...tray], tiles:[...boardTiles]});
  // move to tray
  tray.push(icon);
  el.remove();
  boardTiles = boardTiles.filter(b=>b.el!==el);
  renderTray(); updateLocks(); checkMatch(); checkWin();
  document.getElementById('tilesLeft').innerText=boardTiles.length+' tiles';
}
function renderTray(){
  const t=document.getElementById('tray'); t.innerHTML='';
  tray.forEach(ic=>{
    const d=document.createElement('div'); d.className='t-tile'; d.innerText=ic; t.appendChild(d);
  });
}
function checkMatch(){
  // count 3 same
  const counts={};
  tray.forEach(ic=> counts[ic]=(counts[ic]||0)+1);
  for(let ic in counts){
    if(counts[ic]>=3){
      // remove 3
      let removed=0;
      tray = tray.filter(c=>{ if(c===ic && removed<3){ removed++; return false; } return true; });
      renderTray();
      // sparkle effect
      if(navigator.vibrate) navigator.vibrate(30);
      setTimeout(checkMatch,150);
      break;
    }
  }
}
function checkWin(){
  if(boardTiles.length===0 && tray.length===0){
    document.getElementById('winStats').innerText=`Level ${curLevel} cleared! ${tray.length===0?'Perfect!':''}`;
    document.getElementById('winModal').classList.add('show');
    showInterstitial();
  }
}
function showLose(){ document.getElementById('loseModal').classList.add('show'); }

// --- CONTROLS ---
document.getElementById('gridBtn').onclick=()=>{ renderGrid(); document.getElementById('levelModal').classList.add('show'); };
document.getElementById('closeModal').onclick=()=> document.getElementById('levelModal').classList.remove('show');
document.getElementById('cancelAd').onclick=()=> document.getElementById('adModal').classList.remove('show');
document.getElementById('nextBtn').onclick=()=>{
  document.getElementById('winModal').classList.remove('show');
  const n=curLevel+1; if(n<=100){ if(n>maxUnlock){ maxUnlock=n; localStorage.setItem('match_max',maxUnlock);} startLevel(n); }
};
document.getElementById('restartBtn').onclick=()=>{ document.getElementById('loseModal').classList.remove('show'); startLevel(curLevel); };
document.getElementById('continueBtn').onclick=async()=>{
  const ok=await showRewarded();
  if(ok){ tray.splice(-3,3); renderTray(); document.getElementById('loseModal').classList.remove('show'); }
};
document.getElementById('undoBtn').onclick=()=>{
  if(!history.length) return;
  const h=history.pop();
  // simple undo: restore last
  tray=h.tray; renderTray();
  document.getElementById('board').innerHTML=h.boardHTML;
  // rebind clicks
  boardTiles=[]; document.querySelectorAll('.tile').forEach(el=>{
    const icon=el.dataset.icon; el.onclick=()=> pickTile(el, icon); boardTiles.push({el, icon, layer:0, x:0, y:0});
  });
  updateLocks();
};
document.getElementById('shuffleBtn').onclick=async()=>{
  const ok=await showRewarded();
  if(!ok) return;
  const board=document.getElementById('board');
  const tiles=[...board.children]; tiles.sort(()=>Math.random()-0.5);
  tiles.forEach((el,i)=>{ el.style.left=20+Math.random()*(board.clientWidth-80)+'px'; el.style.top=20+Math.random()*(board.clientHeight-80)+'px'; });
  updateLocks();
};
document.getElementById('hintBtn').onclick=async()=>{
  const ok=await showRewarded(); if(!ok) return;
  const counts={}; tray.forEach(c=> counts[c]=(counts[c]||0)+1);
  let need=null; for(let c in counts) if(counts[c]==2){ need=c; break; }
  if(!need) need=tray[0];
  const found=document.querySelectorAll('.tile');
  for(let el of found){ if(el.dataset.icon===need &&!el.classList.contains('locked')){ el.classList.add('hint'); setTimeout(()=>el.classList.remove('hint'),1500); break; } }
};

// Init
renderGrid(); startLevel(curLevel);
