const tg = window.Telegram?.WebApp || { ready:()=>{}, expand:()=>{}, HapticFeedback:{notificationOccurred:()=>{}}, showAlert:(m)=>alert(m) };
try{ tg.ready(); tg.expand(); }catch(e){}
const boardEl=document.getElementById('board'), trayEl=document.getElementById('tray');
let board=[], score=0, levelScore=0, level=1, maxUnlock=parseInt(localStorage.getItem('block_level')||1);
let isCompleting = false;
function getTarget(l){ return l*200; }
function showMonetagRewarded(){
  return new Promise((res, rej)=>{
    if(typeof show_11215599==='function'){ show_11215599('pop').then(res).catch(rej); } else { rej('no sdk'); }
  });
}
function showMonetagInterstitial(){
  if(typeof show_11215599==='function'){
    try{
      show_11215599({type:'inApp', inAppSettings:{frequency:2,capping:0.1,interval:30,timeout:1,everyPage:false}});
    }catch(e){ console.log(e); }
  }
}
function buildLevelScreen(){
  try{
    document.getElementById('highTxt').innerText=maxUnlock;
    document.getElementById('totalTxt').innerText=localStorage.getItem('block_total_score')||0;
    let overall=document.getElementById('overallProgress');
    if(overall) overall.style.width=Math.min(100,(maxUnlock/100*100))+'%';
    let grid=document.getElementById('levelGrid'); if(!grid) return; grid.innerHTML='';
    for(let i=1;i<=100;i++){
      let d=document.createElement('div');
      let unlock=i<=maxUnlock;
      let is5th=i%5===0;
      d.className='lvl '+(unlock?(i==maxUnlock?'now':(i<maxUnlock?'done':'')):'locked');
      d.innerHTML=`<b>${i<maxUnlock?'✓':i}</b><span>${i*200} pts</span><span>${unlock?(i==maxUnlock?(is5th?'PLAY 🔒':'PLAY'):'DONE'):'🔒'}</span>`;
      if(unlock) d.onclick=()=>startLevel(i);
      grid.appendChild(d);
    }
  }catch(e){ console.log('build error', e); }
}
function showLevels(){ isCompleting=false; document.getElementById('levelScreen').classList.remove('hidden'); document.getElementById('gameScreen').classList.add('hidden'); maxUnlock=parseInt(localStorage.getItem('block_level')||1); buildLevelScreen(); }
function startLevel(l){
  if(l%5===0 && l>1 && l===maxUnlock){
    if(!localStorage.getItem('unlocked_'+l)){
      showMonetagRewarded().then(()=>{ localStorage.setItem('unlocked_'+l,'1'); actuallyStartLevel(l); }).catch(()=>{ alert('Ad pura dekho level '+l+' unlock karne ke liye!'); });
      return;
    }
  }
  actuallyStartLevel(l);
}
function actuallyStartLevel(l){ level=l; levelScore=0; score=0; isCompleting=false; board=Array(10).fill().map(()=>Array(10).fill(0)); document.getElementById('levelScreen').classList.add('hidden'); document.getElementById('gameScreen').classList.remove('hidden'); document.getElementById('level').innerText=level; createBoard(); randomShapes(); updateUI(); }
const SHAPES=[[[1]],[[1,1],[1,1]],[[1,1,1]],[[1,1,1,1]],[[1,1,1],[1,0,0]],[[1,1,0],[0,1,1]],[[1,0],[1,0],[1,1]],[[1,1,1],[0,1,0]],[[1,1],[1,0],[1,0]]];
function createBoard(){ boardEl.innerHTML=''; for(let r=0;r<10;r++) for(let c=0;c<10;c++){ let d=document.createElement('div'); d.className='cell'; d.dataset.r=r; d.dataset.c=c; boardEl.appendChild(d);} paint(); }
function paint(){ document.querySelectorAll('.cell').forEach(el=>{ let r=+el.dataset.r,c=+el.dataset.c; el.className='cell'+(board[r][c]?' filled':''); }); document.getElementById('score').innerText=score; document.getElementById('targetTxt').innerText=levelScore+'/'+getTarget(level); document.getElementById('nextTxt').innerText=getTarget(level); document.getElementById('progress').style.width=Math.min(100,(levelScore/getTarget(level))*100)+'%'; if(!isCompleting && levelScore>=getTarget(level)){ levelComplete(); } }
function updateUI(){ paint(); }
function randomShapes(){ trayEl.innerHTML=''; for(let i=0;i<3;i++){ let shape=SHAPES[Math.floor(Math.random()*SHAPES.length)]; let wrap=document.createElement('div'); wrap.className='block'; wrap.style.gridTemplateColumns=`repeat(${shape[0].length},17px)`; shape.forEach(row=>row.forEach(v=>{ let cell=document.createElement('div'); cell.className=v?'block-cell':''; if(!v) cell.style.background='transparent'; wrap.appendChild(cell); })); wrap._shape=shape; addDrag(wrap); trayEl.appendChild(wrap); } }
let dragBlock=null,ghostPos=null;
function addDrag(el){ el.addEventListener('touchstart', startDrag, {passive:false}); el.addEventListener('mousedown', startDrag); }
function startDrag(e){ e.preventDefault(); dragBlock=this; this.classList.add('dragging'); let move=(ev)=>{ let x=ev.touches?ev.touches[0].clientX:ev.clientX, y=ev.touches?ev.touches[0].clientY:ev.clientY; dragBlock.style.left=x-30+'px'; dragBlock.style.top=y-30+'px'; let t=document.elementFromPoint(x,y); if(t&&t.classList.contains('cell')){ ghostPos={r:+t.dataset.r,c:+t.dataset.c}; showGhost(); } }; let end=()=>{ document.removeEventListener('touchmove',move); document.removeEventListener('mousemove',move); dragBlock.classList.remove('dragging'); dragBlock.style.left=''; dragBlock.style.top=''; if(ghostPos&&canPlace(ghostPos.r,ghostPos.c,dragBlock._shape)) place(ghostPos.r,ghostPos.c,dragBlock._shape); clearGhost(); dragBlock=null; ghostPos=null; document.removeEventListener('touchend',end); document.removeEventListener('mouseup',end); }; document.addEventListener('touchmove',move,{passive:false}); document.addEventListener('mousemove',move); document.addEventListener('touchend',end); document.addEventListener('mouseup',end); }
function showGhost(){ clearGhost(); if(!dragBlock) return; let s=dragBlock._shape; for(let r=0;r<s.length;r++) for(let c=0;c<s[0].length;c++) if(s[r][c]){ let rr=ghostPos.r+r,cc=ghostPos.c+c; if(rr<10&&cc<10){ let el=document.querySelector(`.cell[data-r="${rr}"][data-c="${cc}"]`); if(el&&!board[rr][cc]) el.classList.add('ghost'); } } }
function clearGhost(){ document.querySelectorAll('.cell.ghost').forEach(e=>e.classList.remove('ghost')); }
function canPlace(sr,sc,shape){ for(let r=0;r<shape.length;r++) for(let c=0;c<shape[0].length;c++) if(shape[r][c]){ let rr=sr+r,cc=sc+c; if(rr>=10||cc>=10||board[rr][cc]) return false; } return true; }
function place(sr,sc,shape){ for(let r=0;r<shape.length;r++) for(let c=0;c<shape[0].length;c++) if(shape[r][c]) board[sr+r][sc+c]=1; dragBlock.remove(); score+=10; levelScore+=10; checkLines(); updateUI(); if(trayEl.children.length==0) randomShapes(); checkGameOver(); }
function checkLines(){ let rows=[],cols=[]; for(let r=0;r<10;r++) if(board[r].every(v=>v)) rows.push(r); for(let c=0;c<10;c++) if(board.every(row=>row[c])) cols.push(c); if(rows.length||cols.length){ let add=(rows.length+cols.length)*100; score+=add; levelScore+=add; rows.forEach(r=>board[r]=Array(10).fill(0)); cols.forEach(c=>board.forEach(row=>row[c]=0)); } }
function levelComplete(){ if(isCompleting) return; isCompleting=true; let total=parseInt(localStorage.getItem('block_total_score')||0)+score; localStorage.setItem('block_total_score',total); if(level>=maxUnlock){ maxUnlock=level+1; if(maxUnlock>100) maxUnlock=100; localStorage.setItem('block_level',maxUnlock); } let go=()=>showLevels(); if(level%2===0){ showMonetagInterstitial(); setTimeout(go,800); } else { setTimeout(go,300); } }
function checkGameOver(){ let shapes=[...trayEl.children].map(e=>e._shape), can=false; for(let s of shapes) for(let r=0;r<10;r++) for(let c=0;c<10;c++) if(canPlace(r,c,s)) can=true; if(!can&&trayEl.children.length>0){ setTimeout(()=>{ if(!isCompleting) alert('Game Over! Restart karo'); },200); } }
function resetLevel(){ board=Array(10).fill().map(()=>Array(10).fill(0)); score=0; levelScore=0; isCompleting=false; createBoard(); randomShapes(); updateUI(); }
function watchAd(){ showMonetagRewarded().then(()=>{ score+=500; levelScore+=500; updateUI(); }).catch(()=>{ alert('Ad load nahi hua, dobara try karo'); }); }
document.addEventListener('DOMContentLoaded', buildLevelScreen);
buildLevelScreen();
