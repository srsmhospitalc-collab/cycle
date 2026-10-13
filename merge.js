const canvas=document.getElementById('game'), ctx=canvas.getContext('2d');
const scoreTxt=document.getElementById('scoreTxt'), lvlTxt=document.getElementById('lvlTxt'), bestTxt=document.getElementById('bestTxt');
const progBar=document.getElementById('progBar'), progTxt=document.getElementById('progTxt'), nextEl=document.getElementById('nextFruit');

const FRUITS=[
  {r:15,c:"#ff4d4d",e:"🍒",s:20},{r:20,c:"#ff8a5b",e:"🍓",s:30},{r:27,c:"#a86bff",e:"🍇",s:40},
  {r:32,c:"#ffcc00",e:"🍋",s:50},{r:38,c:"#ff6a00",e:"🍊",s:60},{r:44,c:"#ff2d2d",e:"🍎",s:80},
  {r:51,c:"#ffeb3b",e:"🍍",s:100},{r:60,c:"#4caf50",e:"🍈",s:150},{r:70,c:"#2ecc71",e:"🍉",s:250},
];
let fruits=[], nextType=0, score=0, level=1, gameOver=false, dropX=180, best=localStorage.getItem('merge_best')||0;
bestTxt.innerText=best;

function randomNext(){ nextType=Math.floor(Math.random()*4); nextEl.innerText=FRUITS[nextType].e; }
function spawn(x){ fruits.push({x,y:30,vx:(Math.random()-0.5)*1.5,vy:0,type:nextType,r:FRUITS[nextType].r,stable:0}); randomNext(); }

// ---- ADS LOGIC ----
function showInterstitial(){
  console.log("INTERSTITIAL: RichAds -> Adsbitvex");
  try{ window.TelegramAdsController.show(); }catch(e){}
  setTimeout(()=>{ try{ if(window.AdsBitvex) AdsBitvex.showInterstitial(); }catch(e){} },1000);
}
function watchRewarded(cb){
  console.log("REWARDED: Monetag -> Adsbitvex");
  if(window.show_11215599){
    show_11215599().then(()=>{ cb(); }).catch(()=>{
      try{ AdsBitvex.showRewarded(()=>cb()); }catch(e){ cb(); }
    });
  }else{
    try{ AdsBitvex.showRewarded(()=>cb()); }catch(e){ cb(); }
  }
}

// ---- LEVEL SYSTEM ----
function checkLevel(){
  let targetLevel = Math.floor(score/300)+1;
  if(targetLevel>50) targetLevel=50;
  if(targetLevel>level){
    level=targetLevel;
    lvlTxt.innerText=level;
    // Level Complete Modal
    document.getElementById('lcLvl').innerText=level-1;
    document.getElementById('lcScore').innerText=score;
    document.getElementById('levelModal').classList.add('show');
    gameOver=true;
    showInterstitial(); // HAR LEVEL KE BAAD INTERSTITIAL

    // HAR 5 LEVEL PE LOCK
    if(level%5==1 && level<=50){
      setTimeout(()=>{
        document.getElementById('levelModal').classList.remove('show');
        document.getElementById('lockLvl').innerText=level;
        document.getElementById('lockModal').classList.add('show');
      },1800);
    }
    if(score>best){ best=score; localStorage.setItem('merge_best',best); bestTxt.innerText=best; }
  }
  let cur=score%300;
  progBar.style.width=(cur/300*100)+"%";
  progTxt.innerText=cur+"/300";
}

function update(){
  if(gameOver) return;
  ctx.clearRect(0,0,360,600);
  // glass border
  ctx.fillStyle="#ffffff08"; ctx.fillRect(0,0,360,600);
  ctx.strokeStyle="#333"; ctx.lineWidth=2; ctx.strokeRect(1,1,358,598);

  for(let f of fruits){
    f.vy+=0.28; f.x+=f.vx; f.y+=f.vy; f.vx*=0.99;
    if(f.x-f.r<2){f.x=2+f.r;f.vx*=-0.6} if(f.x+f.r>358){f.x=358-f.r;f.vx*=-0.6}
    if(f.y+f.r>598){f.y=598-f.r;f.vy*=-0.25;f.vx*=0.8; if(Math.abs(f.vy)<0.8)f.vy=0}

    for(let o of fruits){
      if(f==o) continue;
      let dx=o.x-f.x, dy=o.y-f.y, d=Math.hypot(dx,dy), minR=f.r+o.r;
      if(d<minR && d>1){
        if(f.type==o.type && f.type<FRUITS.length-1){
          let nt=f.type+1; score+=FRUITS[nt].s; scoreTxt.innerText=score; checkLevel();
          let mx=(f.x+o.x)/2, my=(f.y+o.y)/2;
          fruits=fruits.filter(p=>p!=f&&p!=o);
          fruits.push({x:mx,y:my,vx:0,vy:-1,type:nt,r:FRUITS[nt].r,stable:0});
          // pop effect
          ctx.beginPath(); ctx.arc(mx,my,20,0,Math.PI*2); ctx.fillStyle="#fff5"; ctx.fill();
          break;
        }else{
          let ov=(minR-d)/2; let nx=dx/d, ny=dy/d;
          f.x-=nx*ov; f.y-=ny*ov; o.x+=nx*ov; o.y+=ny*ov;
        }
      }
    }
  }
  // draw fruits
  for(let f of fruits){
    ctx.shadowColor=FRUITS[f.type].c+"88"; ctx.shadowBlur=10;
    ctx.beginPath(); ctx.arc(f.x,f.y,f.r,0,Math.PI*2); ctx.fillStyle=FRUITS[f.type].c; ctx.fill();
    ctx.shadowBlur=0;
    ctx.beginPath(); ctx.arc(f.x-f.r*0.3,f.y-f.r*0.3,f.r*0.25,0,Math.PI*2); ctx.fillStyle="#ffffffaa"; ctx.fill();
    ctx.fillStyle="#000"; ctx.font=`bold ${f.r*0.75}px sans-serif`; ctx.textAlign="center"; ctx.textBaseline="middle";
    ctx.fillText(FRUITS[f.type].e,f.x,f.y+1);
  }

  // glass full check
  let danger=0;
  for(let f of fruits){
    if(f.y<95 && Math.abs(f.vy)<0.3){ f.stable++; if(f.stable>80) danger++; } else f.stable=0;
  }
  if(danger>=2) endGame();
  requestAnimationFrame(update);
}

function endGame(){
  gameOver=true;
  document.getElementById('overLvl').innerText=level;
  document.getElementById('finalScore').innerText=score;
  document.getElementById('overModal').classList.add('show');
}

canvas.addEventListener('pointermove',e=>{
  let r=canvas.getBoundingClientRect(); dropX=(e.clientX-r.left)*(360/r.width);
});
canvas.addEventListener('pointerdown',()=>{ if(!gameOver) spawn(Math.max(20,Math.min(340,dropX))); });

document.getElementById('undoBtn').onclick=()=> watchRewarded(()=>{ if(fruits.length) fruits.pop(); });
document.getElementById('restartBtn').onclick=()=>{ showInterstitial(); setTimeout(()=>location.reload(),900); };
document.getElementById('nextLvlBtn').onclick=()=>{
  document.getElementById('levelModal').classList.remove('show');
  if(level%5!=1){ gameOver=false; update(); }
};
document.getElementById('unlockBtn').onclick=()=> watchRewarded(()=>{
  document.getElementById('lockModal').classList.remove('show');
  gameOver=false; update();
});
document.getElementById('halfBtn').onclick=()=> watchRewarded(()=>{
  fruits=fruits.sort((a,b)=>b.y-a.y).slice(0,Math.ceil(fruits.length/2));
  document.getElementById('overModal').classList.remove('show');
  gameOver=false; update();
});
document.getElementById('restartAdBtn').onclick=()=>{ showInterstitial(); setTimeout(()=>location.reload(),900); };

// Back to index.html
history.pushState(null,"",location.href);
window.onpopstate=()=> location.href="index.html";
if(window.Telegram?.WebApp){ Telegram.WebApp.BackButton.show(); Telegram.WebApp.BackButton.onClick(()=> location.href="index.html"); }

randomNext(); update(); lvlTxt.innerText=level; scoreTxt.innerText=score;
