const canvas=document.getElementById('game'), ctx=canvas.getContext('2d');
const scoreTxt=document.getElementById('scoreTxt'), lvlTxt=document.getElementById('lvlTxt');
const progBar=document.getElementById('progBar'), nextEl=document.getElementById('nextFruit');

const FRUITS=[
  {r:14,c:"#ff4d4d",e:"🍒",s:2},{r:20,c:"#ff8a5b",e:"🍓",s:4},{r:28,c:"#a86bff",e:"🍇",s:8},
  {r:32,c:"#ffcc00",e:"🍋",s:16},{r:38,c:"#ff6a00",e:"🍊",s:32},{r:44,c:"#ff2d2d",e:"🍎",s:64},
  {r:52,c:"#ffeb3b",e:"🍍",s:128},{r:60,c:"#4caf50",e:"🍈",s:256},{r:70,c:"#2ecc71",e:"🍉",s:512},
];

let fruits=[], nextType=0, score=0, level=1, gameOver=false, dropX=180;
let levelScoreBase=0; // is level ka starting score

function randomNext(){ nextType=Math.floor(Math.random()*4); nextEl.innerText="Next: "+FRUITS[nextType].e; }
function spawn(x){ fruits.push({x,y:40,vx:(Math.random()-0.5)*2,vy:0,type:nextType,r:FRUITS[nextType].r}); randomNext(); }

// --- ADS ---
function showInterstitial(){
  try{ TelegramAdsController.show(); }catch(e){}
  setTimeout(()=>{ try{ AdsBitvex.showInterstitial(); }catch(e){} },900);
}
function watchRewarded(cb){
  if(window.show_11215599){
    show_11215599().then(cb).catch(()=>{
      try{ AdsBitvex.showRewarded(cb); }catch(e){ cb(); }
    });
  }else{ try{ AdsBitvex.showRewarded(cb); }catch(e){ cb(); } }
}

// --- LEVEL LOGIC ---
function checkLevel(){
  let newLevel = Math.floor(score/300)+1;
  if(newLevel>100) newLevel=100;
  if(newLevel>level){
    level=newLevel;
    lvlTxt.innerText=level;
    // Level complete popup
    document.getElementById('lcLvl').innerText=level-1;
    document.getElementById('lcScore').innerText=score;
    document.getElementById('levelModal').classList.add('show');
    gameOver=true;
    showInterstitial(); // Level ending pe interstitial

    // Har 5 level pe unlock rewarded
    if(level%5==1 && level>1){
      setTimeout(()=>{
        document.getElementById('levelModal').classList.remove('show');
        document.getElementById('lockLvl').innerText=level;
        document.getElementById('lockModal').classList.add('show');
      },1500);
    }
  }
  // progress bar
  let cur = score%300;
  progBar.style.width=(cur/300*100)+"%";
  levelScoreBase = (level-1)*300;
}

function update(){
  if(gameOver) return;
  ctx.clearRect(0,0,360,600);
  ctx.strokeStyle="#333"; ctx.strokeRect(2,2,356,596);
  ctx.fillStyle="#ff000033"; ctx.fillRect(0,0,360,90); // danger zone
  ctx.fillStyle="#fff5"; ctx.font="10px sans-serif"; ctx.fillText("DANGER - GLASS FULL = GAME OVER",10,20);

  for(let f of fruits){
    f.vy+=0.25; f.x+=f.vx; f.y+=f.vy; f.vx*=0.99;
    if(f.x-f.r<2){f.x=2+f.r;f.vx*=-0.5} if(f.x+f.r>358){f.x=358-f.r;f.vx*=-0.5}
    if(f.y+f.r>598){f.y=598-f.r;f.vy*=-0.3;f.vx*=0.8; if(Math.abs(f.vy)<0.5)f.vy=0}
    for(let o of fruits){
      if(f==o) continue;
      let dx=o.x-f.x, dy=o.y-f.y, d=Math.hypot(dx,dy), minR=f.r+o.r;
      if(d<minR && d>0){
        if(f.type==o.type && f.type<FRUITS.length-1){
          let nt=f.type+1; score+=FRUITS[nt].s; scoreTxt.innerText=score; checkLevel();
          fruits=fruits.filter(p=>p!=f&&p!=o);
          fruits.push({x:(f.x+o.x)/2,y:(f.y+o.y)/2,vx:0,vy:-1,type:nt,r:FRUITS[nt].r}); break;
        }else{ let ov=(minR-d)/2, nx=dx/d, ny=dy/d; f.x-=nx*ov; f.y-=ny*ov; o.x+=nx*ov; o.y+=ny*ov; }
      }
    }
  }
  for(let f of fruits){
    ctx.beginPath(); ctx.arc(f.x,f.y,f.r,0,Math.PI*2); ctx.fillStyle=FRUITS[f.type].c; ctx.fill();
    ctx.fillStyle="#000"; ctx.font=(f.r*0.8)+"px serif"; ctx.textAlign="center"; ctx.textBaseline="middle";
    ctx.fillText(FRUITS[f.type].e,f.x,f.y+2);
  }
  // game over check - 2 sec upar rahe to over
  let overCount=0;
  for(let f of fruits){ if(f.y<90 && Math.abs(f.vy)<0.2){ if(!f.st) f.st=Date.now(); if(Date.now()-f.st>1500) overCount++; } else f.st=null; }
  if(overCount>=2) endGame();

  requestAnimationFrame(update);
}

function endGame(){
  gameOver=true;
  document.getElementById('finalScore').innerText=score;
  document.getElementById('overModal').classList.add('show');
}

// Controls
canvas.addEventListener('pointermove',e=>{
  let r=canvas.getBoundingClientRect(); dropX=(e.clientX-r.left)*(canvas.width/r.width);
});
canvas.addEventListener('pointerdown',()=>{ if(!gameOver) spawn(Math.max(20,Math.min(340,dropX))); });

document.getElementById('undoBtn').onclick=()=> watchRewarded(()=>{ if(fruits.length) fruits.pop(); });
document.getElementById('restartBtn').onclick=()=>{ showInterstitial(); setTimeout(()=>location.reload(),800); };
document.getElementById('nextLvlBtn').onclick=()=>{
  document.getElementById('levelModal').classList.remove('show');
  if(level%5!=1){ gameOver=false; update(); }
};
document.getElementById('unlockBtn').onclick=()=> watchRewarded(()=>{
  document.getElementById('lockModal').classList.remove('show');
  gameOver=false; update();
});
document.getElementById('halfBtn').onclick=()=> watchRewarded(()=>{
  fruits = fruits.slice().sort((a,b)=>b.y-a.y).slice(0, Math.floor(fruits.length/2)); // half clear
  document.getElementById('overModal').classList.remove('show');
  gameOver=false; update();
});
document.getElementById('restartAdBtn').onclick=()=>{ showInterstitial(); setTimeout(()=>location.reload(),800); };

// Back
history.pushState(null,"",location.href);
window.onpopstate=()=> location.href="index.html";
if(window.Telegram && Telegram.WebApp){ Telegram.WebApp.BackButton.show(); Telegram.WebApp.BackButton.onClick(()=> location.href="index.html"); }

randomNext(); update(); lvlTxt.innerText=level;
