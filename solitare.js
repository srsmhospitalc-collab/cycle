const tg = window.Telegram?.WebApp; tg?.expand();
let currentLevel = +localStorage.getItem('sol_level')||1;
let maxUnlocked = +localStorage.getItem('sol_max')||1;
let moves=0, timerInt, seconds=0;
let history=[];
let stock=[], waste=[], foundations=[[],[],[],[]], tableau=[[],[],[],[],[],[],[]];
let draggedStack=null, dragOrigin=null;

// --- ADS WITH FALLBACK ---
async function showInterstitialAds(){
  try{
    if(window.TelegramAdsController?.triggerInterstitialBanner) await window.TelegramAdsController.triggerInterstitialBanner();
    else if(window.TelegramAdsController?.triggerNativeNotification) await window.TelegramAdsController.triggerNativeNotification(false);
    else throw 0;
    return true;
  }catch{
    try{ await window.showadsbitvex_init(); return true; }catch{ return false; }
  }
}
async function showRewardedAds(){
  const s=document.getElementById('adStatus'); if(s) s.innerText='Loading ad...';
  try{ await window.show_11215599(); return true; }catch{
    try{ await window.TelegramAdsController.triggerNativeNotification(true); return true; }catch{
      try{ await window.showadsbitvex(); return true; }catch{ return false; }
    }
  }
}

// --- DECK ---
const suits=['♠','♥','♦','♣'], ranks=['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
function newDeck(){
  let d=[]; for(let s=0;s<4;s++) for(let r=0;r<13;r++) d.push({suit:suits[s],suitIdx:s,rank:ranks[r],rankVal:r,color:(s==1||s==2?'red':'black'),faceUp:false,id:Math.random()});
  return d.sort(()=>Math.random()-0.5);
}
function canPlaceOnTableau(card, destPile){
  if(!destPile.length) return card.rankVal===12; // King only on empty
  const top=destPile[destPile.length-1];
  if(!top.faceUp) return false;
  return top.color!==card.color && top.rankVal===card.rankVal+1;
}
function canPlaceOnFoundation(card, fPile){
  if(!fPile.length) return card.rankVal===0;
  const top=fPile[fPile.length-1];
  return top.suitIdx===card.suitIdx && card.rankVal===top.rankVal+1;
}

// --- GAME INIT WITH DIFFICULTY ---
function initSolitaireGame(lvl){
  const deck=newDeck();
  tableau=[[],[],[],[],[],[],[]]; foundations=[[],[],[],[]]; waste=[]; stock=[]; history=[]; moves=0; seconds=0;
  let idx=0;
  for(let i=0;i<7;i++){
    for(let j=0;j<=i;j++){
      const c=deck[idx++];
      // Difficulty: higher level = more face down
      if(j===i) c.faceUp=true;
      else c.faceUp = lvl<=5? false : Math.random() < 0.15;
      if(lvl>20) c.faceUp=false;
      if(lvl>40 && j===i) c.faceUp = Math.random()<0.7;
      tableau[i].push(c);
    }
  }
  stock=deck.slice(idx);
  // For very hard levels, limit stock recycling
  window._stockRecycles = lvl>30? 1 : lvl>15? 2 : 999;
  renderAll();
  startTimer();
  checkWin();
}

// --- RENDER ---
function cardEl(card, top){
  const d=document.createElement('div');
  d.className=`card ${card.color} ${card.faceUp?'':'back'}`;
  d.style.top=top+'px';
  if(card.faceUp){
    d.innerHTML=`<span>${card.rank}<small>${card.suit}</small></span><span style="align-self:center;font-size:22px">${card.suit}</span><span style="transform:rotate(180deg)">${card.rank}<small>${card.suit}</small></span>`;
  }
  d.dataset.id=card.id;
  return d;
}
function renderAll(){
  document.getElementById('moves').innerText=moves+' Moves';
  document.getElementById('levelLabel').innerText='LEVEL '+currentLevel;
  // stock
  const stockEl=document.getElementById('stock'); stockEl.innerHTML='';
  if(stock.length) stockEl.appendChild(cardEl({faceUp:false},0));
  stockEl.onclick=handleStockClick;
  // waste
  const wasteEl=document.getElementById('waste'); wasteEl.innerHTML='';
  if(waste.length){
    const top=waste[waste.length-1];
    const el=cardEl(top,0); el.addEventListener('pointerdown', e=> startDrag(e, [{pile:'waste',idx:waste.length-1}], waste.slice(-1)));
    wasteEl.appendChild(el);
  }
  // foundations
  const fEl=document.getElementById('foundations'); fEl.innerHTML='';
  foundations.forEach((pile,i)=>{
    const slot=document.createElement('div'); slot.className='pile-slot';
    const p=document.createElement('div'); p.className='pile'; p.dataset.f=i;
    if(pile.length){ const c=cardEl(pile[pile.length-1],0); p.appendChild(c); }
    else p.innerHTML=`<span style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:26px;opacity:.25">${suits[i]}</span>`;
    slot.appendChild(p); fEl.appendChild(slot);
    p.addEventListener('pointerup', e=> handleDrop(e, 'foundation', i));
  });
  // tableau
  const tabEl=document.getElementById('tableau'); tabEl.innerHTML='';
  tableau.forEach((pile,pi)=>{
    const slot=document.createElement('div'); slot.className='pile-slot'; slot.dataset.t=pi;
    const p=document.createElement('div'); p.className='pile';
    pile.forEach((card,ci)=>{
      const el=cardEl(card, ci*28);
      if(card.faceUp){
        el.addEventListener('pointerdown', e=> startDrag(e, [{pile:'tableau',p:pi,i:ci}], pile.slice(ci)));
      } else {
        if(ci===pile.length-1){ el.onclick=()=>{ card.faceUp=true; saveHistory(); renderAll(); } }
      }
      p.appendChild(el);
    });
    slot.appendChild(p); tabEl.appendChild(slot);
    slot.addEventListener('pointerup', e=> handleDrop(e, 'tableau', pi));
  });
}
function saveHistory(){
  history.push(JSON.stringify({stock,waste,foundations,tableau,moves}));
  if(history.length>50) history.shift();
}

// --- STOCK CLICK ---
let recycles=0;
function handleStockClick(){
  saveHistory();
  if(stock.length){
    const c=stock.pop(); c.faceUp=true; waste.push(c);
  } else {
    if(recycles < (window._stockRecycles||999)){
      stock=waste.reverse().map(c=>{c.faceUp=false;return c}); waste=[]; recycles++;
    }
  }
  moves++; renderAll(); checkWin();
}

// --- DRAG DROP ---
function startDrag(e, originMeta, stack){
  e.preventDefault();
  draggedStack=stack; dragOrigin=originMeta;
  const layer=document.getElementById('dragLayer'); layer.innerHTML='';
  stack.forEach((card,i)=>{
    const el=cardEl(card, i*28);
    el.classList.add('dragging'); el.style.position='absolute';
    el.style.left=e.clientX-36+'px'; el.style.top=e.clientY-50+i*28+'px';
    layer.appendChild(el);
  });
  const move=(ev)=>{
    const els=layer.children;
    for(let i=0;i<els.length;i++){ els[i].style.left=ev.clientX-36+'px'; els[i].style.top=ev.clientY-50+i*28+'px'; }
  };
  const up=(ev)=>{
    document.removeEventListener('pointermove',move);
    document.removeEventListener('pointerup',up);
    layer.innerHTML='';
    // hit test
    const target=document.elementFromPoint(ev.clientX, ev.clientY);
    const tSlot=target?.closest('[data-t]'); const fSlot=target?.closest('[data-f]');
    if(tSlot){ handleDrop(ev,'tableau',+tSlot.dataset.t,true); }
    else if(fSlot || target?.closest('#foundations.pile')){ const idx=+(fSlot?.dataset.f?? target.closest('[data-f]')?.dataset.f?? target.closest('.pile')?.dataset.f); if(!isNaN(idx)) handleDrop(ev,'foundation',idx,true); }
    else { draggedStack=null; renderAll(); }
  };
  document.addEventListener('pointermove',move); document.addEventListener('pointerup',up);
}
function handleDrop(e, type, idx, fromDrag){
  if(!draggedStack) return;
  const card=draggedStack[0];
  let ok=false;
  if(type==='tableau'){
    if(canPlaceOnTableau(card, tableau[idx])){ ok=true; saveHistory(); tableau[idx].push(...draggedStack); removeOrigin(); }
  } else if(type==='foundation'){
    if(draggedStack.length===1 && canPlaceOnFoundation(card, foundations[idx])){ ok=true; saveHistory(); foundations[idx].push(card); removeOrigin(); }
  }
  draggedStack=null; dragOrigin=null;
  if(ok){ moves++; renderAll(); checkWin(); } else { renderAll(); }
}
function removeOrigin(){
  const o=dragOrigin[0];
  if(o.pile==='tableau'){ tableau[o.p].splice(o.i); const pile=tableau[o.p]; if(pile.length &&!pile[pile.length-1].faceUp) pile[pile.length-1].faceUp=true; }
  if(o.pile==='waste'){ waste.pop(); }
}

// --- WIN ---
function checkWin(){
  if(foundations.every(f=>f.length===13) || (tableau.flat().every(c=>c.faceUp) && stock.length===0 && waste.length===0 && foundations.flat().length===52)){
    onWin();
  }
  // also auto win if all tableau faceUp for demo simplicity
  if(foundations.flat().length + tableau.flat().filter(c=>c.faceUp).length===52 && stock.length===0 && waste.length===0){
    // check actually
  }
}
async function onWin(){
  clearInterval(timerInt);
  document.getElementById('winStats').innerText=`Level ${currentLevel} cleared in ${moves} moves • ${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;
  document.getElementById('winModal').classList.add('show');
  await showInterstitialAds();
}

// --- TIMER & GRID ---
function startTimer(){ clearInterval(timerInt); seconds=0; timerInt=setInterval(()=>{ seconds++; document.getElementById('timer').innerText=`${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`; },1000); }
function renderGrid(){
  const g=document.getElementById('levelGrid'); g.innerHTML='';
  for(let i=1;i<=100;i++){ const d=document.createElement('div'); d.className='level-cell '+(i<=maxUnlocked?(i<maxUnlocked?'completed':'unlocked'):'locked'); d.innerText=i; d.onclick=()=> tryOpenLevel(i); g.appendChild(d); }
  document.getElementById('modalLevel').innerText=currentLevel;
}
function tryOpenLevel(lvl){
  if(lvl>maxUnlocked){
    document.getElementById('lockedLevelText').innerText=`Level ${lvl} Locked`;
    document.getElementById('adUnlockModal').classList.add('show');
    document.getElementById('watchAdBtn').onclick=async()=>{
      const btn=document.getElementById('watchAdBtn'); btn.innerText='LOADING...';
      const ok=await showRewardedAds(); btn.innerText='📺 WATCH AD & UNLOCK';
      if(ok){ maxUnlocked=lvl; localStorage.setItem('sol_max',maxUnlocked); document.getElementById('adUnlockModal').classList.remove('show'); startLevel(lvl); }
      else document.getElementById('adStatus').innerText='Ad not available, try again';
    }; return;
  }
  startLevel(lvl);
}
function startLevel(lvl){ currentLevel=lvl; localStorage.setItem('sol_level',lvl); document.getElementById('levelModal').classList.remove('show'); recycles=0; initSolitaireGame(lvl); renderGrid(); }

// --- CONTROLS ---
document.getElementById('gridBtn').onclick=()=>{ renderGrid(); document.getElementById('levelModal').classList.add('show'); };
document.getElementById('closeModal').onclick=()=> document.getElementById('levelModal').classList.remove('show');
document.getElementById('cancelAdBtn').onclick=()=> document.getElementById('adUnlockModal').classList.remove('show');
document.getElementById('newGameBtn').onclick=()=> initSolitaireGame(currentLevel);
document.getElementById('undoBtn').onclick=()=>{ if(!history.length) return; const s=JSON.parse(history.pop()); stock=s.stock; waste=s.waste; foundations=s.foundations; tableau=s.tableau; moves=s.moves; renderAll(); };
document.getElementById('autoBtn').onclick=()=>{ // auto move to foundation
  for(let pi=0;pi<7;pi++){ const pile=tableau[pi]; if(!pile.length) continue; const card=pile[pile.length-1]; if(!card.faceUp) continue; for(let fi=0;fi<4;fi++) if(canPlaceOnFoundation(card, foundations[fi])){ saveHistory(); foundations[fi].push(card); tableau[pi].pop(); if(tableau[pi].length &&!tableau[pi][tableau[pi].length-1].faceUp) tableau[pi][tableau[pi].length-1].faceUp=true; moves++; renderAll(); checkWin(); return; } }
};
document.getElementById('nextLevelBtn').onclick=()=>{ document.getElementById('winModal').classList.remove('show'); const n=currentLevel+1; if(n<=100){ if(n>maxUnlocked){ maxUnlocked=n; localStorage.setItem('sol_max',maxUnlocked);} startLevel(n);} };

renderGrid(); startLevel(currentLevel);
