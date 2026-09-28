const boardEl=document.getElementById("board"), scoreEl=document.getElementById("score"), nextEl=document.getElementById("next"), levelEl=document.getElementById("level"), targetEl=document.getElementById("target"), target2El=document.getElementById("target2"), progressFillEl=document.getElementById("progress-fill"), levelGridEl=document.getElementById("levelGrid"), levelScreenEl=document.getElementById("levelScreen"), gameScreenEl=document.getElementById("gameScreen");
const unlockBtnEl = document.getElementById("unlockBtn");
let board,score,next,level,target,animating=false;
let unlockedLevel = parseInt(localStorage.getItem("unlockedLevel") || "1");
let levelToUnlock = 0;
let canShowAd = true;

let tg = window.Telegram?.WebApp; try{ tg.ready(); tg.expand(); }catch(e){}

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

    // HAR 5 BUTTON PE AD TAG
    let adTag = (i % 5 === 0)? `<span style="font-size:8px;background:#ff5722;color:#fff;padding:2px 4px;border-radius:4px;position:absolute;top:-6px;right:-6px;">AD</span>` : "";
    btn.innerHTML=`${isLocked?"🔒":i}${adTag}<small>${i*200}</small>`;

    if(!isLocked){
      btn.onclick=()=>startLevel(i);
    } else {
      // LOCKED PE CLICK
      btn.onclick=()=>{
        if(i % 5 === 0){
          levelToUnlock = i;
          if(unlockBtnEl){
            unlockBtnEl.style.display="block";
            unlockBtnEl.innerHTML=`🔓 Level ${i} Unlock - Ad Dekho`;
          }
          try{ tg.HapticFeedback.notificationOccurred('warning'); }catch(e){}
        }
      };
    }
    levelGridEl.appendChild(btn);
  }
}

// HAR 5 LEVEL UNLOCK PE MONETAG REWARDED - FAIL HUA TO DIRECT UNLOCK
if(unlockBtnEl){
  unlockBtnEl.onclick = function(){
    let btn = this;
    btn.innerText = "Ad Loading...";
    let doUnlock = () => {
      if(levelToUnlock > unlockedLevel){
        unlockedLevel = levelToUnlock;
        localStorage.setItem("unlockedLevel", unlockedLevel);
      }
      btn.style.display = 'none';
      startLevel(levelToUnlock);
    };

    if(typeof show_11215599!== 'function'){
      // SDK load nahi hua to direct
      doUnlock(); return;
    }
    try{
      show_11215599().then(doUnlock).catch(()=>{ doUnlock(); });
    }catch(e){ doUnlock(); }
  };
}

function startLevel(lv){
  level=lv; target=level*200; score=0; animating=false;
  board=Array.from({length:5},()=>Array(5).fill(0));
  levelScreenEl.classList.add("hidden");
  gameScreenEl.classList.remove("hidden");
  randomNext(); render();
}
function restartLevel(){ startLevel(level); }
function randomNext(){
  const vals=[2,2,2,2,4,4,8,16];
  next=vals[Math.floor(Math.random()*vals.length)];
  nextEl.textContent=next; nextEl.className=`tile c-${next}`;
}
function render(){
  boardEl.innerHTML="";
  for(let r=0;r<5;r++){
    for(let c=0;c<5;c++){
      let d=document.createElement("div");
      let v=board[r][c];
      d.className=v?`cell c-${v}`:"cell"; d.id=`cell-${r}-${c}`;
      if(r==4) d.className+=" bottom-row";
      d.textContent=v||"";
      d.onclick=()=>{ if(r==4 &&!animating) handleTap(c); };
      boardEl.appendChild(d);
    }
  }
  scoreEl.innerText=score; targetEl.innerText=target; target2El.innerText=target;
  levelEl.innerText=level;
  progressFillEl.style.width=Math.min(100, (score/target)*100)+"%";
  if(score>=target) levelComplete();
}

function levelComplete(){
  if(level==100){ alert("🏆 FINAL LEGEND! 100 LEVELS COMPLETE!"); showLevelScreen(); return; }
  if(level >= unlockedLevel){
    unlockedLevel = level+1;
    localStorage.setItem("unlockedLevel", unlockedLevel);
  }

  // HAR 2 LEVEL KE BAAD RICHADS INTERSTITIAL
  if(level % 2 === 0 && canShowAd){
    canShowAd = false;
    setTimeout(()=>{ canShowAd = true; }, 30000);

    const goNext = () => {
      setTimeout(()=>{
        alert(`🎉 LEVEL ${level} CLEAR! Target ${target} Done!`);
        showLevelScreen();
      }, 100);
    };

    if(window.TelegramAdsController){
      try{
        window.TelegramAdsController.triggerInterstitialBanner().then(goNext).catch(()=>{ tryMonetag(); });
        return;
      }catch(e){ tryMonetag(); }
    } else { tryMonetag(); }

    function tryMonetag(){
      if(typeof show_11215599 === 'function'){
        try{
          show_11215599({ type: 'inApp', inAppSettings: { frequency: 2, capping: 0.1 } }).then(goNext).catch(goNext);
        }catch(e){ goNext(); }
      } else { goNext(); }
    }

  } else {
    setTimeout(()=>{
      alert(`🎉 LEVEL ${level} CLEAR! Target ${target} Done!`);
      showLevelScreen();
    },300);
  }
}

async function handleTap(col){
  if(animating) return; animating=true;
  let rowToPlace=-1;
  for(let r=0;r<5;r++){ if(board[r][col]==0){ rowToPlace=r; break; } }
  if(rowToPlace==-1){ animating=false; alert("Column Full!"); return; }
  let startCell=document.getElementById(`cell-4-${col}`);
  let flying=document.createElement("div");
  flying.className=`flying-tile c-${next}`; flying.innerText=next;
  let sr=startCell.getBoundingClientRect(), br=boardEl.getBoundingClientRect();
  flying.style.left=(sr.left-br.left)+"px"; flying.style.top=(sr.top-br.top)+"px";
  boardEl.appendChild(flying);
  let tr=document.getElementById(`cell-${rowToPlace}-${col}`).getBoundingClientRect();
  flying.animate([{transform:`translate(0,0)`},{transform:`translate(${tr.left-sr.left}px, ${tr.top-sr.top}px) scale(1.2)`}],{duration:350,easing:"ease-out"});
  await new Promise(r=>setTimeout(r,350)); flying.remove();
  board[rowToPlace][col]=next; render();
  await checkAndMerge(rowToPlace,col);
  randomNext(); render(); animating=false;
}
async function checkAndMerge(r,c){
  let val=board[r][c]; if(!val) return;
  let toMerge=[[r,c]], visited=Array.from({length:5},()=>Array(5).fill(false));
  visited[r][c]=true; let q=[[r,c]];
  while(q.length){
    let [cr,cc]=q.shift();
    for(let [dr,dc] of [[0,-1],[0,1],[-1,0],[1,0]]){
      let nr=cr+dr, nc=cc+dc;
      if(nr>=0&&nr<5&&nc>=0&&nc<5&&!visited[nr][nc]&&board[nr][nc]==val){
        visited[nr][nc]=true; q.push([nr,nc]); toMerge.push([nr,nc]);
      }
    }
  }
  if(toMerge.length>=2){
    toMerge.forEach(([mr,mc])=>{ let el=document.getElementById(`cell-${mr}-${mc}`); if(el) el.classList.add("merge-pop"); });
    await new Promise(r=>setTimeout(r,220));
    let newVal=val*2; if(toMerge.length==3) newVal=val*4; if(toMerge.length>=4) newVal=val*8;
    toMerge.forEach(([mr,mc])=> board[mr][mc]=0);
    let topRow=Math.min(...toMerge.map(p=>p[0]));
    let avgCol=Math.round(toMerge.reduce((s,p)=>s+p[1],0)/toMerge.length);
    board[topRow][avgCol]=newVal; score+=newVal; render();
    await new Promise(r=>setTimeout(r,150)); await checkAndMerge(topRow,avgCol);
  }
}
showLevelScreen();
