// 100 LEVELS - SEED BASED GENERATOR (no big array needed)
function mulberry32(a){return function(){var t=a+=0x6D2B79F5;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296}}

function getLevelData(lvl){
  if(lvl===1) return [{id:"p",x:0,y:2,w:2,h:1,player:true},{id:"a",x:2,y:2,w:1,h:2},{id:"b",x:4,y:1,w:2,h:1}];
  if(lvl===2) return [{id:"p",x:0,y:2,w:2,h:1,player:true},{id:"a",x:2,y:0,w:1,h:3},{id:"b",x:3,y:3,w:2,h:1},{id:"c",x:5,y:0,w:1,h:3}];
  if(lvl===3) return [{id:"p",x:1,y:2,w:2,h:1,player:true},{id:"a",x:0,y:0,w:1,h:2},{id:"b",x:3,y:2,w:1,h:3},{id:"c",x:4,y:0,w:2,h:1},{id:"d",x:4,y:4,w:2,h:1}];
  const rand=mulberry32(lvl*9973);
  let cars=[{id:"p",x:0,y:2,w:2,h:1,player:true}];
  let count=4+Math.min(7, Math.floor(lvl/10));
  let tries=0;
  while(cars.length<count+1 && tries<300){
    tries++;
    let vert=rand()>0.5;
    let w=vert?1:(rand()>0.7?3:2);
    let h=vert?(rand()>0.7?3:2):1;
    let x=Math.floor(rand()* (6-w+1));
    let y=Math.floor(rand()* (6-h+1));
    if(x<2 && y===2) continue;
    let overlap=cars.some(c=>!(x+w<=c.x||x>=c.x+c.w||y+h<=c.y||y>=c.y+c.h));
    if(!overlap) cars.push({id:"c"+cars.length,x,y,w,h,player:false});
  }
  return cars;
}

let curLevel=+localStorage.getItem('park_level')||1;
let maxUnlock=+localStorage.getItem('park_max')||1;
let moves=0, history=[], cars=[], dragging=null, dragOff={};

// ADS FALLBACK - TERA SETUP
async function showInterstitial(){ try{ await TelegramAdsController.triggerInterstitialBanner(); }catch{ try{ await showadsbitvex_init(); }catch{} } }
async function showRewarded(){
  const s=document.getElementById('adStatus'); if(s) s.innerText='Loading ad...';
  try{ await show_11215599(); if(s) s.innerText='Reward!'; return true; }
  catch{ try{ await TelegramAdsController.triggerNativeNotification(true); return true; }
  catch{ try{ await showadsbitvex(); return true; }catch{ if(s) s.innerText='Ad failed'; return false; } } }
}

function startLevel(lvl){
  curLevel=lvl; localStorage.setItem('park_level',lvl);
  document.getElementById('levelModal').classList.remove('show');
  cars=JSON.parse(JSON.stringify(getLevelData(lvl)));
  moves=0; history=[]; render(); updateUI();
}
function render(){
  const board=document.getElementById('board'); board.innerHTML='';
  const cellW=board.clientWidth/6, cellH=board.clientHeight/6;
  cars.forEach(c=>{
    const d=document.createElement('div');
    d.className='car '+(c.w>c.h?'horizontal':'vertical')+' '+(c.player?'player':'other c'+((c.x+c.y)%5+2));
    d.style.left=(c.x*cellW+2)+'px'; d.style.top=(c.y*cellH+2)+'px';
    d.style.width=(c.w*cellW-4)+'px'; d.style.height=(c.h*cellH-4)+'px';
    d.innerText=c.player?'🚗':'';
    d.addEventListener('pointerdown', e=> startDrag(e,c,cellW,cellH));
    board.appendChild(d);
  });
}
function startDrag(e, car, cellW, cellH){
  e.preventDefault(); dragging=car;
  const rect=e.currentTarget.getBoundingClientRect();
  dragOff={x:e.clientX-rect.left, y:e.clientY-rect.top, cellW, cellH};
  document.addEventListener('pointermove', onMove); document.addEventListener('pointerup', onUp);
}
function onMove(e){
  if(!dragging) return;
  const board=document.getElementById('board'); const bRect=board.getBoundingClientRect();
  let nx=Math.round((e.clientX-bRect.left-dragOff.x)/dragOff.cellW);
  let ny=Math.round((e.clientY-bRect.top-dragOff.y)/dragOff.cellH);
  nx=Math.max(0, Math.min(6-dragging.w, nx)); ny=Math.max(0, Math.min(6-dragging.h, ny));
  if(dragging.w>dragging.h) ny=dragging.y; else nx=dragging.x;
  const test={...dragging, x:nx, y:ny};
  if(!collides(test, dragging.id)){
    if(nx!==dragging.x || ny!==dragging.y) history.push(JSON.stringify(cars));
    dragging.x=nx; dragging.y=ny; moves++; render(); updateUI(); checkWin();
  }
}
function onUp(){ dragging=null; document.removeEventListener('pointermove', onMove); document.removeEventListener('pointerup', onUp); }
function collides(t, ignoreId){ return cars.some(c=> c.id!==ignoreId && !(t.x+t.w<=c.x||t.x>=c.x+c.w||t.y+t.h<=c.y||t.y>=c.y+c.h)); }
function updateUI(){ document.getElementById('levelLabel').innerText='LEVEL '+curLevel; document.getElementById('moves').innerText=moves+' moves'; }
function checkWin(){ const p=cars.find(c=>c.player); if(p.x+p.w>=6) win(); }
function win(){
  if(curLevel>=maxUnlock){ maxUnlock=Math.min(100,curLevel+1); localStorage.setItem('park_max',maxUnlock); }
  document.getElementById('winStats').innerText=`Level ${curLevel} cleared in ${moves} moves!`;
  document.getElementById('winModal').classList.add('show'); showInterstitial();
}
function renderGrid(){
  const g=document.getElementById('levelGrid'); g.innerHTML='';
  for(let i=1;i<=100;i++){ const d=document.createElement('div'); d.className='level-cell '+(i<=maxUnlock?(i<maxUnlock?'completed':'unlocked'):'locked'); d.innerText=i; d.onclick=()=> openLevel(i); g.appendChild(d); }
}
function openLevel(lvl){
  if(lvl>maxUnlock){
    document.getElementById('adTitle').innerText=`Level ${lvl} Locked`;
    document.getElementById('adModal').classList.add('show');
    document.getElementById('watchAdBtn').onclick=async()=>{
      const btn=document.getElementById('watchAdBtn'); btn.innerText='LOADING...';
      const ok=await showRewarded(); btn.innerText='📺 WATCH AD & UNLOCK';
      if(ok){ maxUnlock=lvl; localStorage.setItem('park_max',maxUnlock); document.getElementById('adModal').classList.remove('show'); startLevel(lvl); }
    }; return;
  }
  startLevel(lvl);
}
document.getElementById('gridBtn').onclick=()=>{ renderGrid(); document.getElementById('levelModal').classList.add('show'); };
document.getElementById('closeModal').onclick=()=> document.getElementById('levelModal').classList.remove('show');
document.getElementById('cancelAd').onclick=()=> document.getElementById('adModal').classList.remove('show');
document.getElementById('nextBtn').onclick=()=>{ document.getElementById('winModal').classList.remove('show'); if(curLevel<100) startLevel(curLevel+1); else { renderGrid(); document.getElementById('levelModal').classList.add('show'); } };
document.getElementById('restartBtn').onclick=()=> startLevel(curLevel);
document.getElementById('undoBtn').onclick=()=>{ if(!history.length) return; cars=JSON.parse(history.pop()); moves=Math.max(0,moves-1); render(); updateUI(); };
document.getElementById('hintBtn').onclick=async()=>{
  const ok=await showRewarded(); if(!ok) return;
  const p=cars.find(c=>c.player); const blocker=cars.find(c=>!c.player && c.y===p.y && c.x>p.x);
  if(blocker){ blocker.x=blocker.x>=4?3:5; render(); moves++; updateUI(); }
};
renderGrid(); startLevel(curLevel); window.addEventListener('resize', render);
window.Telegram?.WebApp?.expand();
