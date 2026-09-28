const boardEl=document.getElementById("board"), scoreEl=document.getElementById("score"), nextEl=document.getElementById("next"), levelEl=document.getElementById("level"), targetEl=document.getElementById("target"), target2El=document.getElementById("target2"), progressFillEl=document.getElementById("progress-fill"), levelGridEl=document.getElementById("levelGrid"), levelScreenEl=document.getElementById("levelScreen"), gameScreenEl=document.getElementById("gameScreen");
const unlockBtnEl = document.getElementById("unlockBtn");
let board,score,next,level,target,animating=false;
let unlockedLevel = parseInt(localStorage.getItem("unlockedLevel") || "1");
let levelToUnlock = 0;
let canShowAd = true;
let tg = window.Telegram?.WebApp; try{ tg.ready(); tg.expand(); }catch(e){}

function getMonetag(){
  if(typeof show_11215599 === 'function') return show_11215599;
  try{ if(window.parent && typeof window.parent.show_11215599 === 'function') return window.parent.show_11215599; }catch(e){}
  return null;
}
function getRichAds(){
  if(window.TelegramAdsController) return window.TelegramAdsController;
  try{ if(window.parent && window.parent.TelegramAdsController) return window.parent.TelegramAdsController; }catch(e){}
  return null;
}

function showLevelScreen(){
  gameScreenEl.classList.add("hidden");
  levelScreenEl.classList.remove("hidden");
  renderLevelGrid();
}
function renderLevelGrid(){
  levelGridEl.innerHTML="";
  if(unlockBtnEl) unlockBtnEl.style.display="none";
  for(let i=1;i<=100;i++){
    let btn=document.createElement("div");
    let isLocked = i > unlockedLevel;
    let isCleared = i < unlockedLevel;
    btn.className="level-btn" + (isLocked?" locked":"") + (isCleared?" cleared":"") + (i==unlockedLevel?" active":"");
    btn.style.position = "relative";
    let adTag = (i % 5 === 0)? `<span style="font-size:8px;background:#ff5722;color:#fff;padding:2px 4px;border-radius:4px;position:absolute;top:-6px;right:-6px;">AD</span>` : "";
    btn.innerHTML=`${isLocked?"🔒":i}${adTag}<small>${i*200}</small>`;
    if(!isLocked){ btn.onclick=()=>startLevel(i); }
    else {
      btn.onclick=()=>{
        if(i % 5 === 0){
          levelToUnlock = i;
          if(unlockBtnEl){ unlockBtnEl.style.display="block"; unlockBtnEl.innerHTML=`🔓 Level ${i} Unlock - Ad Dekho`; }
          try{ tg.HapticFeedback.notificationOccurred('warning'); }catch(e){}
        }
      };
    }
    levelGridEl.appendChild(btn);
  }
}
if(unlockBtnEl){
  unlockBtnEl.onclick = function(){
    let btn = this; let tried = 0;
    const doUnlock = () => {
      if(levelToUnlock > unlockedLevel){ unlockedLevel = levelToUnlock; localStorage.setItem("unlockedLevel", unlockedLevel); }
      btn.style.display = 'none'; startLevel(levelToUnlock);
    };
    const tryAd = () => {
      tried++; btn.innerText = tried==1? "Ad Loading..." : "Retry Kar Raha Hu...";
      let monetag = getMonetag();
      if(!monetag){
        if(tried < 2){ btn.innerText = "SDK Not Ready, 3 sec me retry..."; setTimeout(tryAd, 3000); }
        else { alert("Ad SDK Load Nahi Hua. Telegram me dobara try karo."); btn.innerText = "🔄 RETRY AD TO UNLOCK"; }
        return;
      }
      try{ monetag().then(doUnlock).catch(()=>{ if(tried < 2){ btn.innerText = "Ad Load Nahi Hua, 3 sec me retry..."; setTimeout(tryAd, 3000); } else { alert("Ad Not Ready hai. Please UNLOCK button dubara dabao."); btn.innerText = "🔄 RETRY AD TO UNLOCK"; } }); }catch(e){ if(tried < 2) setTimeout(tryAd, 3000); else btn.innerText = "🔄 RETRY AD TO UNLOCK"; }
    };
    tryAd();
  };
}
function startLevel(lv){ level=lv; target=level*200; score=0; animating=false; board=Array.from({length:5},()=>Array(5).fill(0)); levelScreenEl.classList.add("hidden"); gameScreenEl.classList.remove("hidden"); randomNext(); render(); }
function restartLevel(){ startLevel(level); }
function randomNext(){ const vals=[2,2,2,2,4,4,8,16]; next=vals[Math.floor(Math.random()*vals.length)]; nextEl.textContent=next; nextEl.className=`tile c-${next}`; }
function render(){
  boardEl.innerHTML=""; for(let r=0;r<5;r++){ for(let c=0;c<5;c++){ let d=document.createElement("div"); let v=board[r][c]; d.className=v?`cell c-${v}`:"cell"; d.id=`cell-${r}-${c}`; if(r==4) d.className+=" bottom-row"; d.textContent=v||""; d.onclick=()=>{ if(r==4 &&!animating) handleTap(c); }; boardEl.appendChild(d); } }
  scoreEl.innerText=score; targetEl.innerText=target; target2El.innerText=target; levelEl.innerText=level; progressFillEl.style.width=Math.min(100, (score/target)*100)+"%"; if(score>=target) levelComplete();
}
function levelComplete(){
  if(level==100){ alert("🏆 FINAL LEGEND! 100 LEVELS COMPLETE!"); showLevelScreen(); return; }
  if(level >= unlockedLevel){ unlockedLevel = level+1; localStorage.setItem("unlockedLevel", unlockedLevel); }
  if(level % 2 === 0 && canShowAd){
    canShowAd = false; setTimeout(()=>{ canShowAd = true; }, 30000);
    const goNext = () => { setTimeout(()=>{ alert(`🎉 LEVEL ${level} CLEAR! Target ${target} Done!`); showLevelScreen(); }, 100); };
    let interstitialTried = 0;
    const tryInterstitial = () => {
      interstitialTried++;
      let rich = getRichAds();
      if(rich && interstitialTried == 1){
        try{ rich.triggerInterstitialBanner().then(goNext).catch(()=>{ tryMonetag(); }); return; }catch(e){ tryMonetag(); return; }
      } else { tryMonetag(); }
      function tryMonetag(){
        let monetag = getMonetag();
        if(monetag){
          try{ monetag({ type: 'inApp', inAppSettings: { frequency: 2, capping: 0.1 } }).then(goNext).catch(()=>{ if(interstitialTried < 2){ setTimeout(tryInterstitial, 3000); } else { alert("Ad Not Available - 5 sec me next level"); setTimeout(goNext, 5000); } }); }catch(e){ if(interstitialTried < 2) setTimeout(tryInterstitial, 3000); else { alert("Ad Not Available - 5 sec me next level"); setTimeout(goNext, 5000); } }
        } else { if(interstitialTried < 2) setTimeout(tryInterstitial, 3000); else { alert("Ad Not Available - 5 sec me next level"); setTimeout(goNext, 5000); } }
      }
    };
    tryInterstitial();
  } else { setTimeout(()=>{ alert(`🎉 LEVEL ${level} CLEAR! Target ${target} Done!`); showLevelScreen(); },300); }
}
async function handleTap(col){
  if(animating) return; animating=true; let rowToPlace=-1; for(let r=0;r<5;r++){ if(board[r][col]==0){ rowToPlace=r; break; } }
  if(rowToPlace==-1){ animating=false; alert("Column Full!"); return; }
  let startCell=document.getElementById(`cell-4-${col}`); let flying=document.createElement("div"); flying.className=`flying-tile c-${next}`; flying.innerText=next; let sr=startCell.getBoundingClientRect(), br=boardEl.getBoundingClientRect(); flying.style.left=(sr.left-br.left)+"px"; flying.style.top=(sr.top-br.top)+"px"; boardEl.appendChild(flying); let tr=document.getElementById(`cell-${rowToPlace}-${col}`).getBoundingClientRect(); flying.animate([{transform:`translate(0,0)`},{transform:`translate(${tr.left-sr.left}px, ${tr.top-sr.top}px) scale(1.2)`}],{duration:350,easing:"ease-out"}); await new Promise(r=>setTimeout(r,350)); flying.remove(); board[rowToPlace][col]=next; render(); await checkAndMerge(rowToPlace,col); randomNext(); render(); animating=false;
}
async function checkAndMerge(r,c){
  let val=board[r][c]; if(!val) return; let toMerge=[[r,c]], visited=Array.from({length:5},()=>Array(5).fill(false)); visited[r][c]=true; let q=[[r,c]];
  while(q.length){ let [cr,cc]=q.shift(); for(let [dr,dc] of [[0,-1],[0,1],[-1,0],[1,0]]){ let nr=cr+dr, nc=cc+dc; if(nr>=0&&nr<5&&nc>=0&&nc<5&&!visited[nr][nc]&&board[nr][nc]==val){ visited[nr][nc]=true; q.push([nr,nc]); toMerge.push([nr,nc]); } } }
  if(toMerge.length>=2){ toMerge.forEach(([mr,mc])=>{ let el=document.getElementById(`cell-${mr}-${mc}`); if(el) el.classList.add("merge-pop"); }); await new Promise(r=>setTimeout(r,220)); let newVal=val*2; if(toMerge.length==3) newVal=val*4; if(toMerge.length>=4) newVal=val*8; toMerge.forEach(([mr,mc])=> board[mr][mc]=0); let topRow=Math.min(...toMerge.map(p=>p[0])); let avgCol=Math.round(toMerge.reduce((s,p)=>s+p[1],0)/toMerge.length); board[topRow][avgCol]=newVal; score+=newVal; render(); await new Promise(r=>setTimeout(r,150)); await checkAndMerge(topRow,avgCol); }
}
showLevelScreen();
