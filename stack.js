const emojis = ["🍎","🍌","🍇","🍓","🍒","🍕","⚽","🎯","🚀","💎","🐶","🐱"];
let tray = [];
let boardData = [];
let level = 1;

const boardEl = document.getElementById('board');
const trayEl = document.getElementById('tray');
const countEl = document.getElementById('count');
const levelInfo = document.getElementById('levelInfo');

// --- ADS FUNCTIONS ---
function showInterstitial(){
  try { window.TelegramAdsController.show(); } catch(e){}
  setTimeout(()=>{
    try { if(window.show_11215599) show_11215599(); } catch(e){}
    try { if(window.AdsBitvex) AdsBitvex.showInterstitial(); } catch(e){}
  }, 800);
}

function watchRewarded(type){
  // Monetag first
  if(window.show_11215599){
    show_11215599().then(()=> giveReward(type))
   .catch(()=>{
      try{ AdsBitvex.showRewarded(()=>giveReward(type)); }
      catch(e){ giveReward(type); }
    });
  } else {
    try{ AdsBitvex.showRewarded(()=>giveReward(type)); }
    catch(e){ giveReward(type); }
  }
}

function giveReward(type){
  if(type=='undo' && tray.length>0){ tray.pop(); updateTray(); }
  if(type=='shuffle'){ createBoard(); }
  if(type=='hint'){ alert("3 same emoji dhundo, wo auto clear ho jayenge!"); }
}

function createBoard(){
  if(level>1) showInterstitial();
  boardEl.innerHTML = "";
  let items = [...emojis.slice(0,6),...emojis.slice(0,6)];
  items.sort(()=>Math.random()-0.5);
  boardData = items;
  items.forEach((em, i)=>{
    let d = document.createElement('div');
    d.className = "card";
    d.innerText = em;
    d.onclick = ()=> pick(i, d);
    boardEl.appendChild(d);
  });
}

function pick(i, el){
  if(el.classList.contains('hide')) return;
  if(tray.length>=7) return fullHandle();
  tray.push(boardData[i]);
  el.classList.add('hide');

  // check 3 same
  let map = {};
  tray.forEach(e=> map[e]=(map[e]||0)+1);
  for(let k in map){
    if(map[k]>=3){
      let r=0;
      tray = tray.filter(e=>{ if(e==k && r<3){ r++; return false; } return true; });
      break;
    }
  }
  updateTray();
  if(document.querySelectorAll('.card.hide').length==12){
    level++; levelInfo.innerText = "LVL "+level;
    setTimeout(createBoard, 400);
  }
}

function updateTray(){
  trayEl.innerHTML = tray.map(e=>`<div class="tray-item">${e}</div>`).join('');
  countEl.innerText = tray.length+"/7";
  if(tray.length>=7) fullHandle();
}

function fullHandle(){
  setTimeout(()=>{
    if(confirm("Tray Full! Ad dekh kar Undo karna hai?")){
      watchRewarded('undo');
    } else {
      tray=[]; updateTray();
    }
  },150);
}

document.getElementById('undoBtn').onclick = ()=> watchRewarded('undo');
document.getElementById('shuffleBtn').onclick = ()=> watchRewarded('shuffle');
document.getElementById('hintBtn').onclick = ()=> watchRewarded('hint');

// --- BACK BUTTON TO INDEX.HTML ---
history.pushState(null, "", location.href);
window.onpopstate = () => location.href = "index.html";
if(window.Telegram && Telegram.WebApp){
  Telegram.WebApp.BackButton.show();
  Telegram.WebApp.BackButton.onClick(()=> location.href="index.html");
}

// Start
createBoard();
