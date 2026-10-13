const ICONS=["🍎","🍊","🍋","🍇","🍓","🍒","🍉","🍍","🥝","🍑","🍐","🥭","🍌","🥥","🍈","⚽","🎃","🌸","🍩","🧁","🎮","🚀","⭐","❤️","🔥","💎"];
let level=1, tray=[], boardData=[], lastTap=0;
let unlocked=parseInt(localStorage.getItem('match3d_unlocked')||'1');
let total=parseInt(localStorage.getItem('match3d_total')||'0');
document.getElementById('totalScore').innerText=total;

function showInterstitial(){ try{TelegramAdsController.show()}catch(e){} setTimeout(()=>{try{AdsBitvex.showInterstitial()}catch(e){}},400); }
function watchRewarded(cb){ if(window.show_11215599){show_11215599().then(cb).catch(()=>{try{AdsBitvex.showRewarded(cb)}catch(e){cb()}})}else{try{AdsBitvex.showRewarded(cb)}catch(e){cb()}} }

function getLevelTileCount(lvl){ return Math.min(30, 6 + Math.floor(lvl*0.8))*3; } // lvl1=18 tiles, lvl50=90 tiles

function buildGrid(){
  const g=document.getElementById('levelGrid'); g.innerHTML='';
  for(let i=1;i<=50;i++){
    let b=document.createElement('button');
    let cnt=getLevelTileCount(i);
    if(i<=unlocked){ b.className=i==unlocked?'active':'unlocked'; b.innerHTML=`${i}<small style="display:block;font-size:8px;opacity:0.6">${cnt} tiles</small>`; b.onclick=()=>startLevel(i); }
    else{ b.className='locked'; if(i==unlocked+1){ b.innerHTML=`🔒<small style="display:block;font-size:8px">${cnt}</small>`; b.className='unlocked'; b.style.opacity='0.7'; b.onclick=()=>openLock(i);} else b.innerHTML='🔒'; }
    g.appendChild(b);
  }
}
function openLock(lvl){ document.getElementById('lockLvl').innerText=lvl; document.getElementById('lockModal').classList.add('show'); document.getElementById('unlockBtn').onclick=()=>watchRewarded(()=>{ unlocked=lvl; localStorage.setItem('match3d_unlocked',unlocked); buildGrid(); document.getElementById('lockModal').classList.remove('show'); }); }

function startLevel(lvl){
  level=lvl; tray=[]; boardData=[];
  let totalTiles=getLevelTileCount(lvl);
  let types=Math.ceil(totalTiles/3);
  let pool=[];
  for(let t=0;t<types;t++){ let icon=ICONS[t%ICONS.length]; for(let k=0;k<3;k++) pool.push(icon); }
  pool=pool.sort(()=>Math.random()-0.5);
  boardData=pool.map((icon,idx)=>({id:idx,icon}));
  document.getElementById('lvlTxt').innerText=level;
  document.getElementById('leftTxt').innerText=totalTiles;
  document.getElementById('levelScreen').classList.remove('show');
  document.getElementById('gameScreen').classList.add('show');
  renderBoard(); renderTray();
}

function renderBoard(){
  const b=document.getElementById('board'); b.innerHTML='';
  boardData.forEach(obj=>{
    let d=document.createElement('div'); d.className='tile'; d.innerText=obj.icon;
    d.onclick=()=>tapTile(obj.id);
    b.appendChild(d);
  });
  document.getElementById('leftTxt').innerText=boardData.length;
  if(boardData.length==0) levelComplete();
}
function renderTray(){
  const t=document.getElementById('tray'); t.innerHTML='';
  for(let i=0;i<7;i++){
    let s=document.createElement('div'); s.className='slot';
    if(tray[i]) s.innerText=tray[i];
    t.appendChild(s);
  }
}

function tapTile(id){
  let now=Date.now(); if(now-lastTap<250) return; lastTap=now; // double fix
  let idx=boardData.findIndex(o=>o.id==id); if(idx==-1) return;
  if(tray.length>=7) return gameOver();
  let obj=boardData.splice(idx,1)[0];
  tray.push(obj.icon);
  checkTray();
  renderBoard(); renderTray();
  if(boardData.length==0) levelComplete();
}

function checkTray(){
  // 3 same clear
  let counts={};
  tray.forEach(ic=>counts[ic]=(counts[ic]||0)+1);
  for(let ic in counts){
    if(counts[ic]>=3){
      let removed=0; tray=tray.filter(v=>{ if(v==ic && removed<3){removed++; return false;} return true; });
    }
  }
  if(tray.length>=7) gameOver();
}

function levelComplete(){
  total+=level*10; localStorage.setItem('match3d_total',total);
  if(level<50 && level>=unlocked){ unlocked=level+1; localStorage.setItem('match3d_unlocked',unlocked); }
  document.getElementById('lcLvl').innerText=level;
  document.getElementById('levelModal').classList.add('show');
  let c=3; document.getElementById('countTxt').innerText=c;
  let iv=setInterval(()=>{ c--; document.getElementById('countTxt').innerText=c; if(c<=0){ clearInterval(iv); document.getElementById('levelModal').classList.remove('show'); showInterstitial(); setTimeout(()=>{ document.getElementById('gameScreen').classList.remove('show'); document.getElementById('levelScreen').classList.add('show'); buildGrid(); document.getElementById('totalScore').innerText=total; },600); } },1000);
}
function gameOver(){ document.getElementById('overModal').classList.add('show'); }

document.getElementById('shuffleBtn').onclick=()=>watchRewarded(()=>{ boardData=boardData.sort(()=>Math.random()-0.5); renderBoard(); });
document.getElementById('hintBtn').onclick=()=>watchRewarded(()=>{
  if(boardData.length==0) return;
  let tiles=document.querySelectorAll('.tile');
  let r=Math.floor(Math.random()*tiles.length);
  tiles[r].classList.add('hint'); setTimeout(()=>tiles[r].classList.remove('hint'),2000);
});
document.getElementById('clearBtn').onclick=()=>watchRewarded(()=>{ tray.splice(0,3); renderTray(); document.getElementById('overModal').classList.remove('show'); });
document.getElementById('restartBtn').onclick=()=>{ showInterstitial(); setTimeout(()=>startLevel(level),600); };
document.getElementById('restartAdBtn').onclick=()=>{ showInterstitial(); setTimeout(()=>{ document.getElementById('overModal').classList.remove('show'); startLevel(level); },600); };
document.getElementById('overHome').onclick=()=>{ document.getElementById('overModal').classList.remove('show'); document.getElementById('gameScreen').classList.remove('show'); document.getElementById('levelScreen').classList.add('show'); buildGrid(); };
document.getElementById('goHome').onclick=()=>{ showInterstitial(); document.getElementById('gameScreen').classList.remove('show'); document.getElementById('levelScreen').classList.add('show'); buildGrid(); };
document.getElementById('lockClose').onclick=()=>document.getElementById('lockModal').classList.remove('show');

buildGrid();
