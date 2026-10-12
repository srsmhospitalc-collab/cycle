const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const scoreTxt = document.getElementById('scoreTxt');
const nextEl = document.getElementById('nextFruit');

const FRUITS = [
  {r:14, color:"#ff4d4d", emoji:"🍒", score:2},
  {r:20, color:"#ff8a5b", emoji:"🍓", score:4},
  {r:28, color:"#a86bff", emoji:"🍇", score:8},
  {r:32, color:"#ffcc00", emoji:"🍋", score:16},
  {r:38, color:"#ff6a00", emoji:"🍊", score:32},
  {r:44, color:"#ff2d2d", emoji:"🍎", score:64},
  {r:52, color:"#ffeb3b", emoji:"🍍", score:128},
  {r:60, color:"#4caf50", emoji:"🍈", score:256},
  {r:70, color:"#2ecc71", emoji:"🍉", score:512},
];

let fruits = [];
let nextType = 0;
let score = 0;
let gameOver = false;
let dropX = 180;

function randomNext(){ nextType = Math.floor(Math.random()*4); nextEl.innerText = "Next: "+FRUITS[nextType].emoji; }

function spawn(x){
  fruits.push({x:x, y:40, vx:(Math.random()-0.5)*2, vy:0, type:nextType, r:FRUITS[nextType].r});
  randomNext();
  if(fruits.length%5==0) showInterstitial(); // har 5 merge pe ad
}

function showInterstitial(){
  try{ TelegramAdsController.show(); }catch(e){}
  setTimeout(()=>{ try{ if(window.show_11215599) show_11215599(); }catch(e){} },900);
}
function watchRewarded(cb){
  if(window.show_11215599){
    show_11215599().then(cb).catch(()=>{
      try{ AdsBitvex.showRewarded(cb); }catch(e){ cb(); }
    });
  } else { try{ AdsBitvex.showRewarded(cb); }catch(e){ cb(); } }
}

function update(){
  if(gameOver) return;
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.strokeStyle="#333"; ctx.strokeRect(2,2,356,596);
  ctx.fillStyle="#ff000055"; ctx.fillRect(0,0,360,80);

  for(let f of fruits){
    f.vy+=0.25; f.x+=f.vx; f.y+=f.vy;
    f.vx*=0.99;
    if(f.x-f.r<2){ f.x=2+f.r; f.vx*=-0.5; }
    if(f.x+f.r>358){ f.x=358-f.r; f.vx*=-0.5; }
    if(f.y+f.r>598){ f.y=598-f.r; f.vy*=-0.3; f.vx*=0.8; if(Math.abs(f.vy)<0.5) f.vy=0; }

    // collision
    for(let o of fruits){
      if(f==o) continue;
      let dx=o.x-f.x, dy=o.y-f.y, d=Math.hypot(dx,dy);
      let minR = f.r+o.r;
      if(d<minR && d>0){
        if(f.type==o.type && f.type<FRUITS.length-1){
          // merge
          let newType = f.type+1;
          score+=FRUITS[newType].score;
          scoreTxt.innerText=score;
          fruits = fruits.filter(p=>p!=f && p!=o);
          fruits.push({x:(f.x+o.x)/2, y:(f.y+o.y)/2, vx:0, vy:-1, type:newType, r:FRUITS[newType].r});
          break;
        } else {
          let overlap = (minR-d)/2;
          let nx=dx/d, ny=dy/d;
          f.x-=nx*overlap; f.y-=ny*overlap;
          o.x+=nx*overlap; o.y+=ny*overlap;
        }
      }
    }
  }

  // draw
  for(let f of fruits){
    ctx.beginPath();
    ctx.arc(f.x,f.y,f.r,0,Math.PI*2);
    ctx.fillStyle=FRUITS[f.type].color;
    ctx.fill();
    ctx.fillStyle="#000"; ctx.font=(f.r*0.8)+"px serif"; ctx.textAlign="center"; ctx.textBaseline="middle";
    ctx.fillText(FRUITS[f.type].emoji, f.x, f.y+2);
  }

  // game over check
  for(let f of fruits){
    if(f.y<80 && Math.abs(f.vy)<0.1 && fruits.length>8){
      if(Date.now()-f.stableTime>2000){ endGame(); }
      else { if(!f.stableTime) f.stableTime=Date.now(); }
    } else { f.stableTime=null; }
  }

  requestAnimationFrame(update);
}

function endGame(){
  gameOver=true;
  document.getElementById('finalScore').innerText=score;
  document.getElementById('overModal').classList.add('show');
}

// controls
canvas.addEventListener('pointermove', e=>{
  let rect=canvas.getBoundingClientRect();
  dropX = (e.clientX-rect.left)*(canvas.width/rect.width);
});
canvas.addEventListener('pointerdown', ()=>{
  if(gameOver) return;
  spawn(Math.max(20, Math.min(340, dropX)));
});

document.getElementById('undoBtn').onclick=()=> watchRewarded(()=>{
  if(fruits.length){ fruits.pop(); }
});
document.getElementById('restartBtn').onclick=()=> location.reload();
document.getElementById('continueAdBtn').onclick=()=> watchRewarded(()=>{
  fruits = fruits.filter(f=>f.y>150);
  gameOver=false;
  document.getElementById('overModal').classList.remove('show');
  update();
});
document.getElementById('restartAdBtn').onclick=()=> location.reload();

// BACK BUTTON TO INDEX.HTML
history.pushState(null,"",location.href);
window.onpopstate=()=> location.href="index.html";
if(window.Telegram && Telegram.WebApp){
  Telegram.WebApp.BackButton.show();
  Telegram.WebApp.BackButton.onClick(()=> location.href="index.html");
}

randomNext();
update();
