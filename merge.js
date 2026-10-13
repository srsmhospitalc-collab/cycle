const canvas=document.getElementById('game'), ctx=canvas.getContext('2d');
const levelScreen=document.getElementById('levelScreen'), gameScreen=document.getElementById('gameScreen');
const lvlTxt=document.getElementById('lvlTxt'), scoreTxt=document.getElementById('scoreTxt'), totalScoreEl=document.getElementById('totalScore');
const progBar=document.getElementById('progBar'), nextEl=document.getElementById('nextFruit');

const FRUITS=[
  {r:14,c:"#ff4d4d",e:"🍒",s:20},{r:19,c:"#ff8a5b",e:"🍓",s:30},{r:26,c:"#a86bff",e:"🍇",s:40},
  {r:31,c:"#ffcc00",e:"🍋",s:50},{r:37,c:"#ff6a00",e:"🍊",s:60},{r:43,c:"#ff2d2d",e:"🍎",s:80},
  {r:50,c:"#ffeb3b",e:"🍍",s:100},{r:58,c:"#4caf50",e:"🍈",s:140},{r:68,c:"#2ecc71",e:"🍉",s:220},
];

let fruits=[], nextType=0, score=0, level=1, gameOver=false, dropX=180;
const LEVEL_TARGET = 500; // 500 SCORE PER LEVEL
let totalScore=parseInt(localStorage.getItem('merge_total')||'0');
let unlocked=parseInt(localStorage.getItem('merge_unlocked')||'1');
if(totalScoreEl) totalScoreEl.innerText=totalScore;

// ---- ADS FIX ----
function showInterstitial(){
  console.log("Showing Interstitial Ad");
  try{ if(window.TelegramAdsController) TelegramAdsController.show(); }catch(e){console.log(e)}
  setTimeout(()=>{
    try{ if(window.AdsBitvex) AdsBitvex.showInterstitial(); }catch(e){}
    try{ if(window.show_11215599) show_11215599({type:'interstitial'}); }catch(e){}
  },100);
}
function watchRewarded(cb){
  console.log("Rewarded Ad requested");
  if(window.show_11215599){
    show_11215599().then(()=>{
      console.log("Monetag rewarded done");
      cb();
    }).catch(()=>{
      try{ AdsBitvex.showRewarded(()=>{cb()}); }catch(e){cb();}
    });
  }else{
    try{ AdsBitvex.showRewarded(()=>{cb()}); }catch(e){cb();}
  }
}

function buildGrid(){
  const grid=document.getElementById('levelGrid');
  if(!grid) return;
  grid.innerHTML='';
  for(let i=1;i<=50;i++){
    let b=document.createElement('button');
    if(i<=unlocked){
      b.className = (i==unlocked)?'active':'unlocked';
      b.innerHTML=`${i}<small>${LEVEL_TARGET}</small>`;
      b.onclick=()=>startLevel(i);
    }else{
      b.className='locked';
      if(i%5==1 && i==unlocked+1){
        b.innerHTML=`🔒<small>AD UNLOCK</small>`;
        b.className='unlocked';
        b.style.opacity='0.8';
        b.onclick=()=>openLock(i);
      }else{
        b.innerHTML=`🔒`;
      }
    }
    grid.appendChild(b);
  }
}
function openLock(lvl){
  document.getElementById('lockLvl').innerText=lvl;
  document.getElementById('lockModal').classList.add('show');
  document.getElementById('unlockBtn').onclick=()=> watchRewarded(()=>{
    unlocked=lvl;
    localStorage.setItem('merge_unlocked',unlocked);
    buildGrid();
    document.getElementById('lockModal').classList.remove('show');
  });
}
function startLevel(lvl){
  level=lvl; score=0; fruits=[]; gameOver=false;
  lvlTxt.innerText=level; scoreTxt.innerText=`0/${LEVEL_TARGET}`; progBar.style.width='0%';
  levelScreen.classList.remove('show'); gameScreen.classList.add('show');
  randomNext(); update();
}
function goToLevels(){
  levelScreen.classList.add('show'); gameScreen.classList.remove('show');
  buildGrid(); if(totalScoreEl) totalScoreEl.innerText=totalScore;
}
function randomNext(){ nextType=Math.floor(Math.random()*4); nextEl.innerText=FRUITS[nextType].e; }
function spawn(x){
  // Exact tap position pe girana
  let clampedX = Math.max(FRUITS[nextType].r+2, Math.min(360-FRUITS[nextType].r-2, x));
  fruits.push({x:clampedX,y:30,vx:(Math.random()-0.5)*0.8,vy:0,type:nextType,r:FRUITS[nextType].r,stable:0});
  randomNext();
}

function checkLevelComplete(){
  if(score>=LEVEL_TARGET){
    totalScore+=score; localStorage.setItem('merge_total',totalScore);
    if(level<50 && level>=unlocked){ unlocked=level+1; localStorage.setItem('merge_unlocked',unlocked); }
    document.getElementById('lcLvl').innerText=level;
    document.getElementById('levelModal').classList.add('show');
    let c=3; document.getElementById('countTxt').innerText=c;
    let iv=setInterval(()=>{
      c--; document.getElementById('countTxt').innerText=c;
      if(c<=0){
        clearInterval(iv);
        document.getElementById('levelModal').classList.remove('show');
        showInterstitial();
        setTimeout(()=>goToLevels(),600);
      }
    },1000);
    gameOver=true;
  }
}
function update(){
  if(gameOver) return;
  ctx.clearRect(0,0,360,520);
  ctx.fillStyle="#ffffff06"; ctx.fillRect(0,0,360,520);
  ctx.strokeStyle="#2a2a2a"; ctx.lineWidth=2; ctx.strokeRect(1,1,358,518);
  ctx.fillStyle="#ff444422"; ctx.fillRect(0,0,360,85);
  for(let f of fruits){
    f.vy+=0.3; f.x+=f.vx; f.y+=f.vy; f.vx*=0.99;
    if(f.x-f.r<2){f.x=2+f.r;f.vx*=-0.5} if(f.x+f.r>358){f.x=358-f.r;f.vx*=-0.5}
    if(f.y+f.r>518){f.y=518-f.r;f.vy*=-0.25;f.vx*=0.8; if(Math.abs(f.vy)<0.8)f.vy=0}
    for(let o of fruits){
      if(f==o) continue;
      let dx=o.x-f.x, dy=o.y-f.y, d=Math.hypot(dx,dy), minR=f.r+o.r;
      if(d<minR && d>1){
        if(f.type==o.type && f.type<FRUITS.length-1){
          let nt=f.type+1; score+=FRUITS[nt].s; scoreTxt.innerText=score+`/${LEVEL_TARGET}`; progBar.style.width=Math.min(100,score/LEVEL_TARGET*100)+"%"; checkLevelComplete();
          fruits=fruits.filter(p=>p!=f&&p!=o);
          fruits.push({x:(f.x+o.x)/2,y:(f.y+o.y)/2,vx:0,vy:-1,type:nt,r:FRUITS[nt].r,stable:0}); break;
        }else{ let ov=(minR-d)/2, nx=dx/d, ny=dy/d; f.x-=nx*ov; f.y-=ny*ov; o.x+=nx*ov; o.y+=ny*ov; }
      }
    }
  }
  for(let f of fruits){
    ctx.shadowColor=f.r>40?FRUITS[f.type].c+"66":"transparent"; ctx.shadowBlur=8;
    ctx.beginPath(); ctx.arc(f.x,f.y,f.r,0,Math.PI*2); ctx.fillStyle=FRUITS[f.type].c; ctx.fill(); ctx.shadowBlur=0;
    ctx.fillStyle="#000"; ctx.font=`bold ${f.r*0.7}px sans-serif`; ctx.textAlign="center"; ctx.textBaseline="middle"; ctx.fillText(FRUITS[f.type].e,f.x,f.y+1);
  }
  // Tap indicator line
  ctx.setLineDash([4,4]); ctx.strokeStyle="#ffffff22"; ctx.beginPath(); ctx.moveTo(dropX,0); ctx.lineTo(dropX,520); ctx.stroke(); ctx.setLineDash([]);

  let danger=0; for(let f of fruits){ if(f.y<85 && Math.abs(f.vy)<0.3){ f.stable++; if(f.stable>70) danger++; } else f.stable=0; }
  if(danger>=2) endGame();
  requestAnimationFrame(update);
}
function endGame(){
  gameOver=true; document.getElementById('overLvl').innerText=level; document.getElementById('overModal').classList.add('show');
}

// --- FIXED TAP LOGIC ---
function getX(e){
  let r=canvas.getBoundingClientRect();
  let clientX = e.touches? e.touches[0].clientX : e.clientX;
  let x = (clientX - r.left) * (360 / r.width);
  return x;
}
canvas.addEventListener('pointermove',e=>{ dropX = getX(e); });
canvas.addEventListener('touchmove',e=>{ dropX = getX(e); e.preventDefault(); },{passive:false});
canvas.addEventListener('pointerdown',e=>{
  if(gameOver) return;
  let x = getX(e);
  dropX = x;
  spawn(x); // WAHI GIREGA JAHA TAP KIYA
});
canvas.addEventListener('touchstart',e=>{
  if(gameOver) return;
  let x = getX(e);
  dropX = x;
  spawn(x);
  e.preventDefault();
},{passive:false});

document.getElementById('undoBtn').onclick=()=> watchRewarded(()=>{ if(fruits.length) fruits.pop(); });
document.getElementById('restartBtn').onclick=()=>{ showInterstitial(); setTimeout(()=>startLevel(level),700); };
document.getElementById('goHome').onclick=()=>{ showInterstitial(); goToLevels(); };
document.getElementById('halfBtn').onclick=()=> watchRewarded(()=>{ fruits=fruits.sort((a,b)=>b.y-a.y).slice(0,Math.ceil(fruits.length/2)); document.getElementById('overModal').classList.remove('show'); gameOver=false; update(); });
document.getElementById('restartAdBtn').onclick=()=>{ showInterstitial(); setTimeout(()=>{ document.getElementById('overModal').classList.remove('show'); startLevel(level); },700); };
document.getElementById('overHome').onclick=()=>{ document.getElementById('overModal').classList.remove('show'); goToLevels(); };
document.getElementById('lockClose').onclick=()=> document.getElementById('lockModal').classList.remove('show');

history.pushState(null,"",location.href);
window.onpopstate=()=>{ if(gameScreen.classList.contains('show')) goToLevels(); else location.href="index.html"; };
if(window.Telegram?.WebApp){ Telegram.WebApp.BackButton.show(); Telegram.WebApp.BackButton.onClick(()=>{ if(gameScreen.classList.contains('show')) goToLevels(); else location.href="index.html"; }); }

buildGrid();
