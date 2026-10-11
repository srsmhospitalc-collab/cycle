const tg = window.Telegram?.WebApp; tg?.expand();
let currentLevel = parseInt(localStorage.getItem('sol_level')||'1');
let maxUnlocked = parseInt(localStorage.getItem('sol_max')||'1');
let moves = 0;
let history = [];

// --- AD FUNCTIONS WITH FALLBACK ---
async function showInterstitialAds() {
  document.getElementById('adStatus') && (document.getElementById('adStatus').innerText='Loading ad...');
  try {
    console.log('Trying RichAds Interstitial');
    if(window.TelegramAdsController?.triggerInterstitialBanner){
      await window.TelegramAdsController.triggerInterstitialBanner();
      return true;
    } else if(window.TelegramAdsController?.triggerNativeNotification){
      // some RichAds builds use this for interstitial too
      await window.TelegramAdsController.triggerNativeNotification(false);
      return true;
    } else throw new Error('RichAds not ready');
  } catch(e){
    console.log('RichAds Interstitial failed, fallback Adsbitvex', e);
    try{
      await window.showadsbitvex_init();
      return true;
    }catch(e2){ console.log('Adsbitvex_init failed', e2); return false; }
  }
}

async function showRewardedAds() {
  const statusEl = document.getElementById('adStatus');
  if(statusEl) statusEl.innerText='Loading rewarded ad...';
  try{
    console.log('Trying Monetag Rewarded');
    await window.show_11215599();
    return true;
  }catch(e){
    console.log('Monetag failed, trying RichAds Rewarded', e);
    try{
      await window.TelegramAdsController.triggerNativeNotification(true);
      return true;
    }catch(e2){
      console.log('RichAds Rewarded failed, fallback Adsbitvex', e2);
      try{
        await window.showadsbitvex();
        return true;
      }catch(e3){ 
        console.log('All rewarded failed', e3); 
        return false; 
      }
    }
  }
}

// --- LEVEL GRID ---
function renderGrid(){
  const grid = document.getElementById('levelGrid');
  grid.innerHTML='';
  for(let i=1;i<=100;i++){
    const div=document.createElement('div');
    div.className='level-cell '+(i<=maxUnlocked ? (i<maxUnlocked?'completed':'unlocked') : 'locked');
    div.innerText=i;
    div.onclick=()=> tryOpenLevel(i);
    grid.appendChild(div);
  }
  document.getElementById('levelLabel').innerText='LEVEL '+currentLevel;
}
function tryOpenLevel(lvl){
  if(lvl>maxUnlocked){
    document.getElementById('lockedLevelText').innerText=`Level ${lvl} Locked`;
    document.getElementById('adUnlockModal').classList.add('show');
    document.getElementById('watchAdBtn').onclick=async()=>{
      document.getElementById('watchAdBtn').innerText='LOADING...';
      const ok = await showRewardedAds();
      document.getElementById('watchAdBtn').innerText='📺 WATCH AD & UNLOCK';
      if(ok){
        maxUnlocked = lvl;
        localStorage.setItem('sol_max', maxUnlocked);
        document.getElementById('adUnlockModal').classList.remove('show');
        startLevel(lvl);
      } else {
        document.getElementById('adStatus').innerText='Ad not available, try again';
      }
    };
    return;
  }
  startLevel(lvl);
}
function startLevel(lvl){
  currentLevel=lvl;
  localStorage.setItem('sol_level', lvl);
  document.getElementById('levelModal').classList.remove('show');
  initSolitaireGame(lvl);
  renderGrid();
}

// --- CLASSIC SOLITAIRE CORE (Simplified Klondike) ---
const suits = ['♠','♥','♦','♣'];
const ranks = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
function createDeck(){
  let deck=[];
  for(let s=0;s<4;s++) for(let r=0;r<13;r++) deck.push({suit:suits[s], rank:ranks[r], rankVal:r, color: (s==1||s==2)?'red':'black', faceUp:false});
  return deck.sort(()=>Math.random()-0.5);
}
function initSolitaireGame(level){
  moves=0; document.getElementById('moves').innerText='Moves: 0';
  const deck = createDeck();
  // Difficulty: higher level = more face down cards + shuffle penalty
  const difficultyFactor = Math.min(level, 20);
  const tableauEl = document.getElementById('tableau');
  tableauEl.innerHTML='';
  const tableau = [];
  let idx=0;
  for(let i=0;i<7;i++){
    const pileEl=document.createElement('div'); pileEl.className='pile';
    const pile=[];
    for(let j=0;j<=i;j++){
      const card=deck[idx++];
      card.faceUp = (j===i) || (Math.random() < 0.2 - difficultyFactor*0.01);
      if(level>50 && j<i-1) card.faceUp=false; // harder
      pile.push(card);
    }
    tableau.push(pile);
    renderPile(pile, pileEl);
    tableauEl.appendChild(pileEl);
  }
  // Stock & Foundations minimal for demo (win condition simplified)
  document.getElementById('stock').innerHTML=`<div class="card back"></div>`;
  document.getElementById('foundations').innerHTML='';
  for(let i=0;i<4;i++){ 
    const f=document.createElement('div'); f.className='pile'; f.innerHTML=`<span style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:28px;opacity:.3">${suits[i]}</span>`;
    document.getElementById('foundations').appendChild(f);
  }
  // Auto win for demo after X moves (to test ad flow) - Replace with real win check
  window._checkWin = ()=>{
    if(moves> (15 - Math.floor(level/10))){ // difficulty = less moves needed? actually more
      onLevelWin();
    }
  };
}
function renderPile(pile, container){
  container.innerHTML='';
  pile.forEach((card, k)=>{
    const el=document.createElement('div');
    el.className=`card ${card.color} ${card.faceUp?'':'back'}`;
    el.style.top = k*26+'px';
    el.style.zIndex=k;
    if(card.faceUp){
      el.innerHTML=`<span>${card.rank} ${card.suit}</span><span style="align-self:center;font-size:24px">${card.suit}</span><span style="transform:rotate(180deg)">${card.rank} ${card.suit}</span>`;
    }
    el.onclick=()=>{
      moves++; document.getElementById('moves').innerText='Moves: '+moves;
      window._checkWin();
    };
    container.appendChild(el);
  });
}
async function onLevelWin(){
  const winModal=document.getElementById('winModal');
  document.getElementById('winStats').innerText=`Level ${currentLevel} completed in ${moves} moves`;
  winModal.classList.add('show');
  // Interstitial after level
  await showInterstitialAds();
  document.getElementById('nextLevelBtn').onclick=()=>{
    winModal.classList.remove('show');
    const next = currentLevel+1;
    if(next<=100){
      if(next>maxUnlocked){
        maxUnlocked=next;
        localStorage.setItem('sol_max', maxUnlocked);
      }
      startLevel(next);
    }
  };
}

// Init
renderGrid();
document.getElementById('gridBtn').onclick=()=>{ renderGrid(); document.getElementById('levelModal').classList.add('show'); };
document.getElementById('closeModal').onclick=()=> document.getElementById('levelModal').classList.remove('show');
document.getElementById('cancelAdBtn').onclick=()=> document.getElementById('adUnlockModal').classList.remove('show');
document.getElementById('newGameBtn').onclick=()=> initSolitaireGame(currentLevel);
startLevel(currentLevel);
