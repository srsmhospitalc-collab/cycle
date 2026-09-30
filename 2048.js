const boardEl=document.getElementById("board"), scoreEl=document.getElementById("score"), nextEl=document.getElementById("next"), levelEl=document.getElementById("level"), targetEl=document.getElementById("target"), target2El=document.getElementById("target2"), progressFillEl=document.getElementById("progress-fill"), levelGridEl=document.getElementById("levelGrid"), levelScreenEl=document.getElementById("levelScreen"), gameScreenEl=document.getElementById("gameScreen");
const centerModal = document.getElementById("centerAdModal");
const centerTitle = document.getElementById("centerAdTitle");
const centerDesc = document.getElementById("centerAdDesc");
const centerWatchBtn = document.getElementById("centerWatchBtn");
const centerCancelBtn = document.getElementById("centerCancelBtn");

let board,score,next,level,target,animating=false;
let lastCompleted = parseInt(localStorage.getItem("lastCompleted")||"0");
let adUnlockedLevels = JSON.parse(localStorage.getItem("adUnlockedLevels")||"[]");
let levelToUnlock = 0;
let levelFinished = false;
let isAdShowing = false;
let tg = window.Telegram?.WebApp; try{ tg.ready(); tg.expand(); }catch(e){}

function showLevelScreen(){
  levelFinished=false;
  isAdShowing=false;
  gameScreenEl.classList.add("hidden");
  levelScreenEl.classList.remove("hidden");
  renderLevelGrid();
}
function hideCenterModal(){ centerModal.classList.add("hidden"); if(centerWatchBtn) centerWatchBtn.innerText="▶️ WATCH AD"; }

function isLevelUnlocked(i){
  if(i===1) return true;
  if(lastCompleted < i-1) return false;
  if(i%5===0){ return adUnlockedLevels.includes(i); }
  return true;
}

function renderLevelGrid(){
  levelGridEl.innerHTML="";
  for(let i=1;i<=100;i++){
    let unlocked = isLevelUnlocked(i);
    let isCleared = lastCompleted >= i;
    let btn=document.createElement("div");
    btn.className="level-btn" + (!unlocked?" locked":"") + (isCleared?" cleared":"") + (lastCompleted+1===i?" active":"");
    btn.style.position="relative";
    let adTag = (i%5==0)? `<span style="font-size:8px;background:#ff5722;color:#fff;padding:2px 5px;border-radius:5px;position:absolute;top:-7px;right:-7px;">AD</span>` : "";
    btn.innerHTML=`${!unlocked?"🔒":i}${adTag}<small>${i*200}</small>`;
    if(unlocked){ btn.onclick=()=>startLevel(i); }
    else {
      btn.onclick=()=>{
        levelToUnlock=i;
        if(centerTitle) centerTitle.innerText = `Level ${i} Locked`;
        if(i%5===0 && lastCompleted >= i-1){
          if(centerDesc) centerDesc.innerText = `Level ${i} unlock karne ke liye Rewarded Ad dekho!`;
        } else if (lastCompleted < i-1) {
          if(centerDesc) centerDesc.innerText = `Pehle Level ${i-1} complete karo!`;
        }
        centerModal.classList.remove("hidden");
      };
    }
    levelGridEl.appendChild(btn);
  }
}

if(centerWatchBtn){
  centerWatchBtn.onclick = function(){
    if(levelToUnlock%5!==0 && lastCompleted < levelToUnlock-1){ hideCenterModal(); return; }
    let btn=this; btn.innerText="Ad Loading...";
    const onSuccess = ()=>{
      if(!adUnlockedLevels.includes(levelToUnlock)){
        adUnlockedLevels.push(levelToUnlock);
        localStorage.setItem("adUnlockedLevels", JSON.stringify(adUnlockedLevels));
      }
      hideCenterModal(); startLevel(levelToUnlock);
    };
    const onFail = ()=>{ btn.innerText="🔄 Retry Karo"; };
    if(typeof window.showadsbitvex==='function'){
      window.showadsbitvex().then(onSuccess).catch(()=>{
        if(window.TelegramAdsController){
          window.TelegramAdsController.triggerRewardedAd().then(onSuccess).catch(onFail);
        } else onFail();
      });
    } else if(window.TelegramAdsController){
      window.TelegramAdsController.triggerRewardedAd().then(onSuccess).catch(onFail);
    } else { onFail(); }
  };
}
if(centerCancelBtn) centerCancelBtn.onclick = hideCenterModal;

function shouldShowInterstitial(lv){
  if(lv<=10) return lv%2===0;
  else return true;
}

function showInterstitialCascade(cb){
  if(isAdShowing) return;
  isAdShowing=true;
  let done=false;
  const finish=()=>{ if(done) return; done=true; isAdShowing=false; cb(); };
  if(window.TelegramAdsController){
    window.TelegramAdsController.triggerInterstitial().then(finish).catch(()=>{
      if(typeof window.showadsbitvex_init==='function'){ window.showadsbitvex_init().then(finish).catch(finish); } else finish();
    });
  } else if(typeof window.showadsbitvex_init==='function'){
    window.showadsbitvex_init().then(finish).catch(finish);
  } else { finish(); }
}

function startLevel(lv){ level=lv; target=level*200; score=0; animating=false; levelFinished=false; isAdShowing=false; board=Array.from({length:5},()=>Array(5).fill(0)); levelScreenEl.classList.add("hidden"); gameScreenEl.classList.remove("hidden"); randomNext(); render(); }
function restartLevel(){ startLevel(level); }
function randomNext(){ const vals=[2,2,2,2,4,4,8,16]; next=vals[Math.floor(Math.random()*vals.length)]; nextEl.textContent=next; nextEl.className=`tile c-${next}`; }

function render(){
  boardEl.innerHTML="";
  for(let r=0;r<5;r++){
    for(let c=0;c<5;c++){
      let d=document.createElement("div");
      let v=board[r][c];
      d.className=v?`cell c-${v}`:"cell";
      d.id=`cell-${r}-${c}`;
      if(r==4) d.className+=" bottom-row";
      d.textContent=v||"";
      d.onclick=()=>{ if(r==4&&!animating&&!levelFinished) handleTap(c); };
      boardEl.appendChild(d);
    }
  }
  scoreEl.innerText=score; targetEl.innerText=target; target2El.innerText=target; levelEl.innerText=level;
  progressFillEl.style.width=Math.min(100,(score/target)*100)+"%";

  // YAHAN FIX HAI - 3 BAAR NAHI, 1 BAAR
  if(!levelFinished && score>=target){
    levelFinished=true;
    levelComplete();
  }
}

function levelComplete(){
  if(level>lastCompleted){ lastCompleted=level; localStorage.setItem("lastCompleted", lastCompleted); }
  if(level==100){ showLevelScreen(); return; }
  const goNext = ()=>{ showLevelScreen(); }; // NO ALERT
  if(shouldShowInterstitial(level)){ showInterstitialCascade(goNext); } else { setTimeout(goNext, 200); }
}

async function handleTap(col){
  if(animating||levelFinished) return; animating=true; let rowToPlace=-1; for(let r=0;r<5;r++){ if(board[r][col]==0){ rowToPlace=r; break; } }
  if(rowToPlace==-1){ animating=false; return; }
  let startCell=document.getElementById(`cell-4-${col}`); let flying=document.createElement("div"); flying.className=`flying-tile c-${next}`; flying.innerText=next; let sr=startCell.getBoundingClientRect(), br=boardEl.getBoundingClientRect(); flying.style.left=(sr.left-br.left)+"px"; flying.style.top=(sr.top-br.top)+"px"; boardEl.appendChild(flying); let tr=document.getElementById(`cell-${rowToPlace}-${col}`).getBoundingClientRect(); flying.animate([{transform:`translate(0,0)`},{transform:`translate(${tr.left-sr.left}px, ${tr.top-sr.top}px) scale(1.2)`}],{duration:350,easing:"ease-out"}); await new Promise(r=>setTimeout(r,350)); flying.remove(); board[rowToPlace][col]=next; render(); await checkAndMerge(rowToPlace,col); randomNext(); render(); animating=false;
}
async function checkAndMerge(r,c){
  let val=board[r][c]; if(!val||levelFinished) return; let toMerge=[[r,c]], visited=Array.from({length:5},()=>Array(5).fill(false)); visited[r][c]=true; let q=[[r,c]];
  while(q.length){ let [cr,cc]=q.shift(); for(let [dr,dc] of [[0,-1],[0,1],[-1,0],[1,0]]){ let nr=cr+dr, nc=cc+dc; if(nr>=0&&nr<5&&nc>=0&&nc<5&&!visited[nr][nc]&&board[nr][nc]==val){ visited[nr][nc]=true; q.push([nr,nc]); toMerge.push([nr,nc]); } } }
  if(toMerge.length>=2){ toMerge.forEach(([mr,mc])=>{ let el=document.getElementById(`cell-${mr}-${mc}`); if(el) el.classList.add("merge-pop"); }); await new Promise(r=>setTimeout(r,220)); let newVal=val*2; if(toMerge.length==3) newVal=val*4; if(toMerge.length>=4) newVal=val*8; toMerge.forEach(([mr,mc])=> board[mr][mc]=0); let topRow=Math.min(...toMerge.map(p=>p[0])); let avgCol=Math.round(toMerge.reduce((s,p)=>s+p[1],0)/toMerge.length); board[topRow][avgCol]=newVal; score+=newVal; render(); await new Promise(r=>setTimeout(r,150)); await checkAndMerge(topRow,avgCol); }
}
showLevelScreen();
