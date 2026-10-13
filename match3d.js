const ICONS=["🍎","🍊","🍋","🍇","🍓","🍒","🍉","🍍","🥝","🍑","🍐","🥭","🍌","🥥","🍈","⚽","🎃","🌸","🍩","🧁","🎮","🚀","⭐","❤️","🔥","💎","🍪","🌽","🥑","🍔"];
let level=1, tray=[], tiles=[], lastTap=0, lastMonetag=0;
let unlocked=parseInt(localStorage.getItem('match3d_unlocked')||'1');
let total=parseInt(localStorage.getItem('match3d_total')||'0');
document.getElementById('totalScore').innerText=total;

// AD ORDER AS YOU SAID
function showInterstitial(){
  try{
    window.TelegramAdsController.triggerInterstitialBanner(true).then(()=>{}).catch(()=>{
      try{ window.showadsbitvex_init().then(()=>{}).catch(()=>{});}catch(e){}
    });
  }catch(e){ try{ window.showadsbitvex_init().then(()=>{}).catch(()=>{});}catch(e){} }
}
function watchRewarded(cb){
  try{
    window.TelegramAdsController.triggerNativeNotification(true).then(()=>cb()).catch(()=>{
      let now=Date.now();
      if(now-lastMonetag>120000 && window.show_11215599){
        show_11215599().then(()=>{ lastMonetag=Date.now(); cb(); }).catch(()=>{
          try{ window.showadsbitvex().then(()=>cb()).catch(()=>cb()); }catch(e){cb();}
        });
      }else{
        try{ window.showadsbitvex().then(()=>cb()).catch(()=>cb()); }catch(e){cb();}
      }
    });
  }catch(e){
    let now=Date.now();
    if(now-lastMonetag>120000 && window.show_11215599){
      show_11215599().then(()=>{ lastMonetag=Date.now(); cb(); }).catch(()=>{ try{window.showadsbitvex().then(()=>cb()).catch(()=>cb());}catch(e){cb();} });
    }else{ try{window.showadsbitvex().then(()=>cb()).catch(()=>cb());}catch(e){cb();} }
  }
}

function getTileCount(lvl){ return Math.min(48, 12 + Math.floor(lvl*1.2))*3; }

function buildGrid(){
  const g=document.getElementById('levelGrid'); g.innerHTML='';
  for(let i=1;i<=50;i++){
    let b=document.createElement('button'); let cnt=getTileCount(i);
    if(i<=unlocked){ b.className=i==unlocked?'active':'unlocked'; b.innerHTML=`${i}<small style="display:block;font-size:8px;opacity:0.6">${cnt}</small>`; b.onclick=()=>startLevel(i); }
    else{ b.className='locked'; if(i==unlocked+1){ b.innerHTML=`🔒<small style="display:block;font-size:8px">${cnt}</small>`; b.style.opacity='0.7'; b.onclick=()=>openLock(i);} else b.innerHTML='🔒'; }
    g.appendChild(b);
  }
}
function openLock(lvl){ document.getElementById('lockLvl').innerText=lvl; document.getElementById('lockModal').classList.add('show'); document.getElementById('unlockBtn').onclick=()=>watchRewarded(()=>{ unlocked=lvl; localStorage.setItem('match3d_unlocked',unlocked); buildGrid(); document.getElementById('lockModal').classList.remove('show'); }); }

function startLevel(lvl){
  level=lvl; tray=[]; tiles=[];
  let totalTiles=getTileCount(lvl);
  let layers = lvl<5? 2 : lvl<15? 3 : lvl<30? 4 : 5;
  let cols = lvl<10? 5 : 6, rows = 6;
  let icons = [];
  for(let t=0;t<totalTiles/3;t++){ let ic=ICONS[t%ICONS.length]; icons.push(ic,ic,ic); }
  icons=icons.sort(()=>Math.random()-0.5);

  let id=0;
  // create layered positions with half offset
  for(let z=0;z<layers;z++){
    let offset = (z%2)*18;
    let c = z==layers-1? cols-1 : cols;
    let r = z==layers-1? rows-1 : rows;
    for(let y=0;y<r;y++){
      for(let x=0;x<c;x++){
        if(id>=totalTiles) break;
        if(Math.random()<0.12 && z>0) continue; // random gaps for natural look
        tiles.push({
          id:id,
          icon:icons[id],
          x: 12 + x*54 + offset + Math.random()*4,
          y: 14 + y*52 + offset*0.6 + Math.random()*3,
          z:z,
          removed:false
        });
        id++;
      }
    }
  }
  // if less tiles, fill random
  while(id<totalTiles){
    tiles.push({id:id, icon:icons[id], x: 20+Math.random()*240, y: 20+Math.random()*300, z: Math.floor(Math.random()*layers), removed:false}); id++;
  }

  document.getElementById('lvlTxt').innerText=level;
  document.getElementById('leftTxt').innerText=tiles.filter(t=>!t.removed).length;
  document.getElementById('levelScreen').classList.remove('show');
  document.getElementById('gameScreen').classList.add('show');
  render();
}

function isBlocked(tile){
  if(tile.removed) return true;
  // check if any tile above overlaps
  for(let other of tiles){
    if(other.removed || other.z<=tile.z) continue;
    let dx=Math.abs(other.x-tile.x), dy=Math.abs(other.y-tile.y);
    if(dx<48 && dy<48) return true; // overlapped
  }
  return false;
}

function render(){
  const board=document.getElementById('board'); board.innerHTML='';
  let sorted=[...tiles].sort((a,b)=>a.z-b.z);
  sorted.forEach(t=>{
    if(t.removed) return;
    let blocked=isBlocked(t);
    let el=document.createElement('div');
    el.className='tile3d '+(blocked?'locked':'free');
    el.style.left=t.x+'px'; el.style.top=t.y+'px'; el.style.zIndex=10+t.z;
    el.innerHTML=`${t.icon}<div class="shadow"></div>`;
    if(!blocked) el.onclick=()=>tapTile(t.id);
    board.appendChild(el);
  });
  document.getElementById('leftTxt').innerText=tiles.filter(t=>!t.removed).length;
  renderTray();
  if(tiles.filter(t=>!t.removed).length==0) levelComplete();
}

function renderTray(){
  const tr=document.getElementById('tray'); tr.innerHTML='';
  document.getElementById('trayCount').innerText=tray.length;
  for(let i=0;i<7;i++){
    let d=document.createElement('div'); d.className='slot';
    if(tray[i]) d.innerText=tray[i];
    tr.appendChild(d);
  }
}

function tapTile(id){
  let now=Date.now(); if(now-lastTap<180) return; lastTap=now;
  let tile=tiles.find(t=>t.id==id); if(!tile || tile.removed || isBlocked(tile)) return;
  if(tray.length>=7) return gameOver();
  tile.removed=true; tray.push(tile.icon);
  // check 3 same
  let counts={}; tray.forEach(ic=>counts[ic]=(counts[ic]||0)+1);
  for(let ic in counts){
    if(counts[ic]>=3){
      let c=0; tray=tray.filter(v=>{ if(v==ic && c<3){c++; return false;} return true; });
    }
  }
  render();
  if(tray.length>=7) gameOver();
}

function levelComplete(){
  total+=level*10; localStorage.setItem('match3d_total',total);
  if(level<50 && level>=unlocked){ unlocked=level+1; localStorage.setItem('match3d_unlocked',unlocked); }
  document.getElementById('lcLvl').innerText=level; document.getElementById('levelModal').classList.add('show');
  let c=3; document.getElementById('countTxt').innerText=c;
  let iv=setInterval(()=>{ c--; document.getElementById('countTxt').innerText=c; if(c<=0){ clearInterval(iv); document.getElementById('levelModal').classList.remove('show'); showInterstitial(); setTimeout(()=>{ document.getElementById('gameScreen').classList.remove('show'); document.getElementById('levelScreen').classList.add('show'); buildGrid(); document.getElementById('totalScore').innerText=total; },500); } },1000);
}
function gameOver(){ document.getElementById('overModal').classList.add('show'); }

document.getElementById('shuffleBtn').onclick=()=>watchRewarded(()=>{ let avail=tiles.filter(t=>!t.removed); let icons=avail.map(t=>t.icon).sort(()=>Math.random()-0.5); avail.forEach((t,i)=>t.icon=icons[i]); render(); });
document.getElementById('hintBtn').onclick=()=>watchRewarded(()=>{
  let free=tiles.filter(t=>!t.removed &&!isBlocked(t));
  if(!free.length) return;
  // find matching pair
  let map={}; free.forEach(t=>{ map[t.icon]=map[t.icon]||[]; map[t.icon].push(t); });
  let hintTile=null; for(let k in map){ if(map[k].length>=2){ hintTile=map[k][0]; break; } }
  if(!hintTile) hintTile=free[Math.floor(Math.random()*free.length)];
  let els=document.querySelectorAll('.tile3d.free');
  // flash one
  render();
  setTimeout(()=>{
    let el=[...document.querySelectorAll('.tile3d')].find(e=>e.textContent.includes(hintTile.icon));
    if(el){ el.classList.add('hint'); setTimeout(()=>el.classList.remove('hint'),1800); }
  },50);
});
document.getElementById('clearBtn').onclick=()=>watchRewarded(()=>{ tray.splice(0,3); renderTray(); document.getElementById('overModal').classList.remove('show'); });
document.getElementById('restartBtn').onclick=()=>{ showInterstitial(); setTimeout(()=>startLevel(level),500); };
document.getElementById('restartAdBtn').onclick=()=>{ showInterstitial(); setTimeout(()=>{ document.getElementById('overModal').classList.remove('show'); startLevel(level); },500); };
document.getElementById('overHome').onclick=()=>{ document.getElementById('overModal').classList.remove('show'); document.getElementById('gameScreen').classList.remove('show'); document.getElementById('levelScreen').classList.add('show'); buildGrid(); };
document.getElementById('goHome').onclick=()=>{ showInterstitial(); document.getElementById('gameScreen').classList.remove('show'); document.getElementById('levelScreen').classList.add('show'); buildGrid(); };
document.getElementById('lockClose').onclick=()=>document.getElementById('lockModal').classList.remove('show');
buildGrid();
