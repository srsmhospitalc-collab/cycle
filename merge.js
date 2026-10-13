const FRUITS=[
 {icon:"🍒",r:14,score:10,color:"#ff3040"},
 {icon:"🍓",r:18,score:20,color:"#ff4d6d"},
 {icon:"🍇",r:22,score:40,color:"#9b59b6"},
 {icon:"🍊",r:26,score:80,color:"#ff8c00"},
 {icon:"🍎",r:30,score:120,color:"#ff0000"},
 {icon:"🍐",r:34,score:200,color:"#a8e05f"},
 {icon:"🍑",r:40,score:300,color:"#ffad8f"},
 {icon:"🍍",r:46,score:400,color:"#ffeb3b"},
 {icon:"🍈",r:54,score:600,color:"#7bed9f"},
 {icon:"🍉",r:64,score:1000,color:"#2ed573"},
];
let level=1, score=0, melons=0, stars=0, fruits=[], nextIdx=0, timer=60, timerInt=null, gameOver=false, lastTap=0, lastMonetag=0;
let unlocked=parseInt(localStorage.getItem('merge_unlocked')||'1');
let totalStar=parseInt(localStorage.getItem('merge_stars')||'0');
const canvas=document.getElementById('gameCanvas'); const ctx=canvas.getContext('2d');

function showInterstitial(){
 try{ window.TelegramAdsController.triggerInterstitialBanner(true).then(()=>{}).catch(()=>{ try{ window.showadsbitvex_init().then(()=>{}).catch(()=>{});}catch(e){} }); }catch(e){ try{ window.showadsbitvex_init().then(()=>{}).catch(()=>{});}catch(e){} }
}
function watchRewarded(cb){
 try{ window.TelegramAdsController.triggerNativeNotification(true).then(()=>cb()).catch(()=>{
   let now=Date.now();
   if(now-lastMonetag>120000 && window.show_11215599){ show_11215599().then(()=>{ lastMonetag=Date.now(); cb(); }).catch(()=>{ try{ window.showadsbitvex().then(()=>cb()).catch(()=>cb()); }catch(e){cb();} }); }
   else{ try{ window.showadsbitvex().then(()=>cb()).catch(()=>cb()); }catch(e){cb();} }
 }); }catch(e){
   let now=Date.now();
   if(now-lastMonetag>120000 && window.show_11215599){ show_11215599().then(()=>{ lastMonetag=Date.now(); cb(); }).catch(()=>{ try{window.showadsbitvex().then(()=>cb()).catch(()=>cb());}catch(e){cb();} }); }
   else{ try{window.showadsbitvex().then(()=>cb()).catch(()=>cb());}catch(e){cb();} }
 }
}

function levelConfig(lvl){
  return {
    target: 500 + (lvl-1)*300,
    needMelon: Math.floor((lvl-1)/3)+1,
    time: Math.max(40, 90 - Math.floor(lvl/2)*5),
    maxType: Math.min(5 + Math.floor(lvl/5), 8)
  };
}

function buildGrid(){
 document.getElementById('totalStar').innerText=totalStar;
 const g=document.getElementById('levelGrid'); g.innerHTML='';
 for(let i=1;i<=50;i++){
  let cfg=levelConfig(i); let b=document.createElement('button');
  let s=parseInt(localStorage.getItem('merge_star_'+i)||'0');
  if(i<=unlocked){ b.className=i==unlocked?'active':'unlocked'; b.innerHTML=`${i}<div class="stars-small">${'⭐'.repeat(s)}${s==0?'○':''}</div><small style="display:block;font-size:7px;opacity:0.6">🎯${cfg.target}</small>`; b.onclick=()=>startLevel(i); }
  else{ b.className='locked'; b.innerHTML=`🔒<small style="display:block;font-size:7px">🎯${cfg.target}</small>`; if(i==unlocked+1) b.onclick=()=>openLock(i); }
  g.appendChild(b);
 }
}
function openLock(lvl){ document.getElementById('lockLvl').innerText=lvl; document.getElementById('lockModal').classList.add('show'); document.getElementById('unlockBtn').onclick=()=>watchRewarded(()=>{ unlocked=lvl; localStorage.setItem('merge_unlocked',unlocked); buildGrid(); document.getElementById('lockModal').classList.remove('show'); }); }

function startLevel(lvl){
 level=lvl; let cfg=levelConfig(lvl); score=0; melons=0; fruits=[]; gameOver=false; timer=cfg.time;
 document.getElementById('lvlTxt').innerText=lvl; document.getElementById('targetTxt').innerText=cfg.target;
 document.getElementById('levelScreen').classList.remove('show'); document.getElementById('gameScreen').classList.add('show');
 nextIdx=Math.floor(Math.random()*(cfg.maxType+1)); updateNext(); updateUI();
 if(timerInt) clearInterval(timerInt);
 timerInt=setInterval(()=>{ timer--; document.getElementById('timeTxt').innerText=timer; if(timer<=0) checkWin(true); },1000);
 loop();
}

function updateNext(){ document.getElementById('nextFruit').innerText=FRUITS[nextIdx].icon; }
function updateUI(){ document.getElementById('scoreTxt').innerText=score; document.getElementById('melonTxt').innerText=melons+"/"+levelConfig(level).needMelon; let s=calcStars(); document.getElementById('starTxt').innerText='⭐'.repeat(s); }
function calcStars(){
 let cfg=levelConfig(level); let st=0;
 if(score>=cfg.target) st=1;
 if(melons>=cfg.needMelon) st=Math.max(st,2);
 if(score>=cfg.target*1.5 && melons>=cfg.needMelon && timer>10) st=3;
 if(score>=cfg.target && melons>=cfg.needMelon) st=Math.max(st,2);
 return st;
}

canvas.addEventListener('click', (e)=>{
 if(gameOver) return;
 let now=Date.now(); if(now-lastTap<300) return; lastTap=now;
 let rect=canvas.getBoundingClientRect(); let x=(e.clientX-rect.left)*(canvas.width/rect.width);
 let cfg=levelConfig(level);
 fruits.push({x:x,y:30,vx:(Math.random()-0.5)*2,vy:0,type:nextIdx,r:FRUITS[nextIdx].r});
 nextIdx=Math.floor(Math.random()*(cfg.maxType+1)); updateNext();
});

function loop(){
 if(document.getElementById('gameScreen').classList.contains('show') && !gameOver){
   updatePhysics(); checkMerge(); checkTopLine(); draw(); requestAnimationFrame(loop);
 }else{ draw(); }
}
function updatePhysics(){
 for(let f of fruits){
   f.vy+=0.35; f.x+=f.vx; f.y+=f.vy;
   f.vx*=0.99;
   if(f.x-f.r<0){ f.x=f.r; f.vx*=-0.6; }
   if(f.x+f.r>canvas.width){ f.x=canvas.width-f.r; f.vx*=-0.6; }
   if(f.y+f.r>canvas.height){ f.y=canvas.height-f.r; f.vy*=-0.35; if(Math.abs(f.vy)<1) f.vy=0; f.vx*=0.85; }
 }
 for(let i=0;i<fruits.length;i++){
  for(let j=i+1;j<fruits.length;j++){
   let a=fruits[i], b=fruits[j]; let dx=b.x-a.x, dy=b.y-a.y, d=Math.sqrt(dx*dx+dy*dy), min=a.r+b.r;
   if(d<min && d>0){ let nx=dx/d, ny=dy/d, overlap=(min-d)/2; a.x-=nx*overlap; a.y-=ny*overlap; b.x+=nx*overlap; b.y+=ny*overlap; a.vx-=nx*0.5; a.vy-=ny*0.5; b.vx+=nx*0.5; b.vy+=ny*0.5; }
  }
 }
}
function checkMerge(){
 for(let i=0;i<fruits.length;i++){
  for(let j=i+1;j<fruits.length;j++){
   let a=fruits[i], b=fruits[j]; if(a.type!=b.type) continue;
   let dx=b.x-a.x, dy=b.y-a.y, d=Math.sqrt(dx*dx+dy*dy);
   if(d<a.r+b.r-4){
     let newType=Math.min(a.type+1, FRUITS.length-1);
     let nx=(a.x+b.x)/2, ny=(a.y+b.y)/2;
     fruits.splice(j,1); fruits.splice(i,1);
     fruits.push({x:nx,y:ny,vx:0,vy:-2,type:newType,r:FRUITS[newType].r});
     score+=FRUITS[newType].score;
     if(newType==9) melons++;
     updateUI(); checkWin(false); return;
   }
  }
 }
}
function checkTopLine(){
 let overCount=fruits.filter(f=>f.y-f.r<80 && Math.abs(f.vy)<0.5).length;
 if(fruits.length>12 && overCount>=3){ setTimeout(()=>{ if(fruits.filter(f=>f.y-f.r<80).length>=3) gameOver=true, showGameOver(); },800); }
}
function draw(){
 ctx.clearRect(0,0,canvas.width,canvas.height);
 ctx.strokeStyle='#333'; ctx.setLineDash([6,6]); ctx.beginPath(); ctx.moveTo(0,80); ctx.lineTo(canvas.width,80); ctx.stroke(); ctx.setLineDash([]);
 ctx.fillStyle='#ff000066'; ctx.font='10px sans-serif'; ctx.fillText('DANGER LINE',8,76);
 fruits.sort((a,b)=>a.y-b.y).forEach(f=>{ ctx.font=(f.r*1.3)+'px serif'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(FRUITS[f.type].icon,f.x,f.y); });
}

function checkWin(timeUp){
 let cfg=levelConfig(level); let s=calcStars();
 if(score>=cfg.target && melons>=cfg.needMelon){
   gameOver=true; clearInterval(timerInt);
   document.getElementById('winScore').innerText=score; document.getElementById('winTarget').innerText=cfg.target;
   document.getElementById('starBox').innerText='⭐'.repeat(s)||'○'; document.getElementById('winTitle').innerText=s==3?'PERFECT! 🎉':s==2?'LEVEL CLEAR!':'CLEAR! ⭐';
   document.getElementById('winModal').classList.add('show');
   let prev=parseInt(localStorage.getItem('merge_star_'+level)||'0'); if(s>prev){ localStorage.setItem('merge_star_'+level,s); totalStar+=s-prev; localStorage.setItem('merge_stars',totalStar); }
   if(level>=unlocked && level<50){ unlocked=level+1; localStorage.setItem('merge_unlocked',unlocked); }
   let c=3; document.getElementById('countTxt').innerText=c; let iv=setInterval(()=>{ c--; document.getElementById('countTxt').innerText=c; if(c<=0){ clearInterval(iv); document.getElementById('winModal').classList.remove('show'); showInterstitial(); setTimeout(()=>{ document.getElementById('gameScreen').classList.remove('show'); document.getElementById('levelScreen').classList.add('show'); buildGrid(); },500);} },1000);
 }else if(timeUp){
   gameOver=true; showGameOver();
 }
}
function showGameOver(){
 clearInterval(timerInt); document.getElementById('overInfo').innerText=`Score ${score} - Need ${levelConfig(level).target} & ${levelConfig(level).needMelon} 🍉`; document.getElementById('overModal').classList.add('show');
}

document.getElementById('shuffleBtn').onclick=()=>watchRewarded(()=>{ fruits.splice(0,Math.floor(fruits.length/2)); updateUI(); });
document.getElementById('hintBtn').onclick=()=>watchRewarded(()=>{ let cfg=levelConfig(level); nextIdx=Math.min(cfg.maxType, 4+Math.floor(Math.random()*3)); updateNext(); setTimeout(()=>{ nextIdx=Math.floor(Math.random()*(cfg.maxType+1)); updateNext(); },3000); });
document.getElementById('restartBtn').onclick=()=>{ showInterstitial(); setTimeout(()=>startLevel(level),500); };
document.getElementById('continueBtn').onclick=()=>watchRewarded(()=>{ fruits.splice(0,6); gameOver=false; document.getElementById('overModal').classList.remove('show'); timer=20; timerInt=setInterval(()=>{ timer--; document.getElementById('timeTxt').innerText=timer; if(timer<=0) checkWin(true); },1000); loop(); });
document.getElementById('restartAdBtn').onclick=()=>{ showInterstitial(); setTimeout(()=>{ document.getElementById('overModal').classList.remove('show'); startLevel(level); },500); };
document.getElementById('overHome').onclick=()=>{ document.getElementById('overModal').classList.remove('show'); document.getElementById('gameScreen').classList.remove('show'); document.getElementById('levelScreen').classList.add('show'); buildGrid(); };
document.getElementById('goHome').onclick=()=>{ showInterstitial(); clearInterval(timerInt); document.getElementById('gameScreen').classList.remove('show'); document.getElementById('levelScreen').classList.add('show'); buildGrid(); };
document.getElementById('lockClose').onclick=()=>document.getElementById('lockModal').classList.remove('show');
buildGrid();
