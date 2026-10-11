const tg = window.Telegram?.WebApp; tg?.expand();
const SIZE = 40;
const COLORS = ["#FFFFFF","#000000","#FF0000","#00FF00","#0000FF","#FFFF00","#FF00FF","#00FFFF","#FFA500","#800080","#008000","#FFC0CB","#A52A2A","#808080","#C0C0C0","#00FF88"];
const PREMIUM = ["#FF073A","#39FF14","#00FFFF","#FF00FF","#FFFF00","#7FFF00","#FF1493","#00BFFF","#FF4500","#ADFF2F","#FF69B4","#7B68EE","#FFD700","#00FA9A","#FF6347","#40E0D0"];

let board = JSON.parse(localStorage.getItem('np_board')||'null') || Array(SIZE*SIZE).fill("#111111");
let myPixels = +localStorage.getItem('np_mypix')||0;
let selectedColor = COLORS[0];
let selectedIndex = 0;
let cooldown = 0, cooldownInt=null;
let placeCount = 0;
let premiumUnlocked = localStorage.getItem('np_premium')==='1';

// --- ADS FALLBACK ---
async function showInterstitial(){
  try{
    if(window.TelegramAdsController?.triggerInterstitialBanner) await window.TelegramAdsController.triggerInterstitialBanner();
    else if(window.TelegramAdsController?.triggerNativeNotification) await window.TelegramAdsController.triggerNativeNotification(false);
    else throw 0;
  } catch{ try{ await window.showadsbitvex_init(); }catch{} }
}
async function showRewarded(){
  const s=document.getElementById('adStatus'); if(s) s.innerText='Loading ad...';
  try{ await window.show_11215599(); if(s) s.innerText='Reward granted!'; return true; }
  catch{
    try{ await window.TelegramAdsController.triggerNativeNotification(true); return true; }
    catch{ try{ await window.showadsbitvex(); return true; } catch{ if(s) s.innerText='Ad failed, try again'; return false; } }
  }
}

// --- RENDER GRID ---
const gridEl=document.getElementById('pixelGrid');
function renderGrid(){
  gridEl.innerHTML='';
  board.forEach((col,i)=>{
    const d=document.createElement('div');
    d.className='pixel'+(i===selectedIndex?' selected':'');
    d.style.background=col;
    d.onclick=()=>{ selectedIndex=i; renderGrid(); updatePlaceBtn(); };
    gridEl.appendChild(d);
  });
}
function renderPalette(){
  const p=document.getElementById('palette'); p.innerHTML='';
  [...COLORS,...PREMIUM].forEach((c,i)=>{
    const d=document.createElement('div');
    d.className='color'+(c===selectedColor?' active':'')+(i>=COLORS.length &&!premiumUnlocked?' locked':'');
    d.style.background=c;
    d.onclick=()=>{
      if(i>=COLORS.length &&!premiumUnlocked){ document.getElementById('premiumModal').classList.add('show'); return; }
      selectedColor=c; renderPalette();
    };
    p.appendChild(d);
  });
}

// --- COOLDOWN LOGIC ---
function startCooldown(sec=15){
  cooldown=sec;
  document.getElementById('skipBtn').style.display='block';
  document.getElementById('cooldownFill').style.width='100%';
  clearInterval(cooldownInt);
  cooldownInt=setInterval(()=>{
    cooldown--;
    const pct=(cooldown/sec)*100;
    document.getElementById('cooldownFill').style.width=pct+'%';
    document.getElementById('cooldownText').innerText=cooldown>0?`COOLDOWN ${cooldown}s`:'READY TO PAINT';
    if(cooldown<=0){ clearInterval(cooldownInt); document.getElementById('skipBtn').style.display='none'; document.getElementById('cooldownFill').style.width='100%'; }
  },1000);
}
function updatePlaceBtn(){
  document.getElementById('placeBtn').innerText = cooldown>0? `WAIT ${cooldown}s` : `PLACE PIXEL`;
  document.getElementById('placeBtn').disabled = cooldown>0;
}

// --- PLACE PIXEL ---
async function placePixel(){
  if(cooldown>0) return;
  board[selectedIndex]=selectedColor;
  myPixels++; localStorage.setItem('np_board', JSON.stringify(board)); localStorage.setItem('np_mypix', myPixels);
  document.getElementById('myPixels').innerText=myPixels+' PX';
  renderGrid(); startCooldown(10+Math.floor(myPixels/20)); // difficulty increases
  placeCount++;
  if(placeCount%4===0){ showInterstitial(); } // best ad spot - every 4th paint
  simulateActivity();
}

// --- FAKE LIVE ACTIVITY (makes it feel real) ---
function simulateActivity(){
  setInterval(()=>{
    const idx=Math.floor(Math.random()*board.length);
    const col=[...COLORS,...PREMIUM][Math.floor(Math.random()* (premiumUnlocked?32:16))];
    board[idx]=col; if(Math.random()<0.3) renderGrid();
  }, 1800);
}
function fakeOnlineCounter(){
  let c=12400; setInterval(()=>{ c+=Math.floor(Math.random()*10-4); document.getElementById('online').innerText='● '+(c/1000).toFixed(1)+'k online'; },2000);
}

// --- EVENTS ---
document.getElementById('placeBtn').onclick=placePixel;
document.getElementById('skipBtn').onclick=async()=>{
  const btn=document.getElementById('skipBtn'); btn.innerText='LOADING...';
  const ok=await showRewarded();
  btn.innerText='SKIP AD 📺';
  if(ok){ clearInterval(cooldownInt); cooldown=0; document.getElementById('cooldownText').innerText='READY TO PAINT'; document.getElementById('cooldownFill').style.width='100%'; btn.style.display='none'; updatePlaceBtn(); }
};
document.getElementById('bonusBtn').onclick=async()=>{
  const ok=await showRewarded();
  if(ok){ myPixels+=10; localStorage.setItem('np_mypix',myPixels); document.getElementById('myPixels').innerText=myPixels+' PX'; startCooldown(0); }
};
document.getElementById('unlockPremiumBtn').onclick=async()=>{
  const ok=await showRewarded();
  if(ok){ premiumUnlocked=true; localStorage.setItem('np_premium','1'); document.getElementById('premiumModal').classList.remove('show'); renderPalette(); }
};
document.getElementById('closePremium').onclick=()=> document.getElementById('premiumModal').classList.remove('show');
document.getElementById('leaderBtn').onclick=()=>{
  const list=document.getElementById('leaderList');
  list.innerHTML=`<div>🥇 @pixelking - 4321 px</div><div>🥈 You - ${myPixels} px</div><div>🥉 @artlover - 892 px</div><div>4. @notfan - 743 px</div><div>5. @tguser - 621 px</div>`;
  document.getElementById('leaderModal').classList.add('show');
};
document.getElementById('closeLeader').onclick=()=> document.getElementById('leaderModal').classList.remove('show');

// Init
renderGrid(); renderPalette(); document.getElementById('myPixels').innerText=myPixels+' PX'; fakeOnlineCounter(); simulateActivity(); startCooldown(0);
