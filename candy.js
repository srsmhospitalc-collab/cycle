const BOARD_SIZE = 8;
const CANDY_TYPES = 6;
const CANDY_EMOJIS = ['🍓','🍏','💎','🍋','🍇','💧'];
let board = [], selected = null, score = 0, level = 1, moves = 25, target = 800, isSwapping = false;
const boardEl = document.getElementById('board');
const scoreTxt = document.getElementById('scoreTxt'), movesTxt = document.getElementById('movesTxt'), levelTxt = document.getElementById('levelTxt'), targetTxt = document.getElementById('targetTxt'), progressFill = document.getElementById('progressFill'), levelModal = document.getElementById('levelModal'), lockedModal = document.getElementById('lockedModal');

function initGame(){score=0;moves=25+(level-1)*2;target=800+(level-1)*400;targetTxt.textContent=target;levelTxt.textContent=level;updateUI();createBoard();renderBoard();showToast(`Level ${level} - Galaxy ${level}`);}
function createBoard(){board=[];for(let r=0;r<BOARD_SIZE;r++){let row=[];for(let c=0;c<BOARD_SIZE;c++){let type;do{type=Math.floor(Math.random()*CANDY_TYPES);}while((c>=2&&row[c-1]==type&&row[c-2]==type)||(r>=2&&board[r-1][c]==type&&board[r-2][c]==type));row.push(type);}board.push(row);}}
function renderBoard(){boardEl.innerHTML='';for(let r=0;r<BOARD_SIZE;r++)for(let c=0;c<BOARD_SIZE;c++){let div=document.createElement('div');div.className=`candy type-${board[r][c]}`;div.textContent=CANDY_EMOJIS[board[r][c]];div.dataset.r=r;div.dataset.c=c;div.onclick=()=>onCandyClick(r,c);if(selected&&selected.r==r&&selected.c==c)div.classList.add('selected');boardEl.appendChild(div);}}
function onCandyClick(r,c){if(isSwapping)return;if(!selected){selected={r,c};renderBoard();return;}let dr=Math.abs(selected.r-r),dc=Math.abs(selected.c-c);if((dr==1&&dc==0)||(dr==0&&dc==1)){swapAndCheck(selected.r,selected.c,r,c);selected=null;}else{selected={r,c};renderBoard();}}
async function swapAndCheck(r1,c1,r2,c2){isSwapping=true;swap(r1,c1,r2,c2);renderBoard();await sleep(200);let matches=findAllMatches();if(matches.length==0){swap(r1,c1,r2,c2);renderBoard();isSwapping=false;showToast('No match!');return;}moves--;updateUI();await processMatches(matches);while(true){let m=findAllMatches();if(m.length==0)break;await processMatches(m);}checkGameState();isSwapping=false;}
function swap(r1,c1,r2,c2){let t=board[r1][c1];board[r1][c1]=board[r2][c2];board[r2][c2]=t;}
function findAllMatches(){let matched=new Set();for(let r=0;r<BOARD_SIZE;r++){let count=1;for(let c=1;c<BOARD_SIZE;c++){if(board[r][c]==board[r][c-1])count++;else{if(count>=3)for(let k=c-count;k<c;k++)matched.add(`${r},${k}`);count=1;} }if(count>=3)for(let k=BOARD_SIZE-count;k<BOARD_SIZE;k++)matched.add(`${r},${k}`);}for(let c=0;c<BOARD_SIZE;c++){let count=1;for(let r=1;r<BOARD_SIZE;r++){if(board[r][c]==board[r-1][c])count++;else{if(count>=3)for(let k=r-count;k<r;k++)matched.add(`${k},${c}`);count=1;}}if(count>=3)for(let k=BOARD_SIZE-count;k<BOARD_SIZE;k++)matched.add(`${k},${c}`);}return Array.from(matched).map(s=>{let [r,c]=s.split(',').map(Number);return {r,c}});}
async function processMatches(matches){if(matches.length>=4)showCombo(matches.length);score+=matches.length*40*level;matches.forEach(({r,c})=>{let el=boardEl.children[r*BOARD_SIZE+c];if(el)el.classList.add('matched');});await sleep(350);let cols={};matches.forEach(({r,c})=>{if(!cols[c])cols[c]=[];cols[c].push(r);});for(let c in cols){let col=parseInt(c);let rows=cols[col].sort((a,b)=>b-a);for(let r of rows){for(let k=r;k>0;k--)board[k][col]=board[k-1][col];board[0][col]=Math.floor(Math.random()*CANDY_TYPES);}}updateUI();renderBoard();await sleep(100);}
function checkGameState(){if(score>=target){if(level%2==0){triggerAd('interstitial',`Level ${level} Complete`);}showLevelComplete();}else if(moves<=0){showToast('Out of moves! Try again');setTimeout(()=>{initGame();},1200);}}
function showLevelComplete(){document.getElementById('modalTitle').textContent=`Level ${level} Complete!`;document.getElementById('modalScore').textContent=`Score: ${score} / ${target}`;document.getElementById('adInfo').textContent=level%2==0?'🎬 Interstitial Ad shown':'✨ Bonus ready';levelModal.classList.remove('hidden');}
function showLockedLevel(nextLevel){document.getElementById('lockedLevel').textContent=nextLevel;lockedModal.classList.remove('hidden');}
function updateUI(){scoreTxt.textContent=score;movesTxt.textContent=moves;let pct=Math.min(100,Math.floor((score/target)*100));progressFill.style.width=pct+'%';}

// === FINAL AD LOGIC WITH PARENT FALLBACK ===
function getMonetagFn(){ return window.show_11215599 || (window.parent && window.parent.show_11215599); }
function getRichAdsCtrl(){ return window.TelegramAdsController || (window.parent && window.parent.TelegramAdsController); }

function showMonetagInterstitial(){
  let fn=getMonetagFn();
  if(typeof fn === 'function'){
    try{ fn({ type: 'inApp', inAppSettings: { frequency: 2, capping: 0.1, interval: 30, timeout: 5, everyPage: false } }); }catch(e){}
  }
}
function showMonetagRewarded(){
  return new Promise((resolve, reject)=>{
    let fn=getMonetagFn();
    if(typeof fn === 'function'){ fn().then(resolve).catch(reject); } else { reject('Monetag not loaded'); }
  });
}
function triggerAd(type){
  try{
    if(type==='interstitial'){
      let ctrl=getRichAdsCtrl();
      if(ctrl && ctrl.triggerInterstitialBanner){
        ctrl.triggerInterstitialBanner().catch(()=>{ showMonetagInterstitial(); });
      } else { showMonetagInterstitial(); }
    } else if(type==='rewarded'){
      showMonetagRewarded().then(()=>{ onRewardedSuccess(); }).catch(()=>{});
    }
  }catch(e){}
}

function onRewardedSuccess(){lockedModal.classList.add('hidden');level++;initGame();showToast('🔓 Galaxy Unlocked! +50 Moves');moves+=50;updateUI();}
function showToast(msg){let t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2000);}
function showCombo(count){let el=document.getElementById('combo');el.textContent=count>=5?`GALAXY COMBO x${count}!`:`COMBO x${count}!`;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),800);}
function sleep(ms){return new Promise(r=>setTimeout(r,ms));}
document.getElementById('nextBtn').onclick=()=>{levelModal.classList.add('hidden');let next=level+1;if(next%5==0){showLockedLevel(next);}else{level=next;initGame();}};
document.getElementById('unlockBtn').onclick=()=>{
  let btn=document.getElementById('unlockBtn'); btn.textContent='Loading Ad...';
  showMonetagRewarded().then(()=>{
    onRewardedSuccess(); btn.textContent='🎥 Watch & Unlock';
  }).catch(()=>{ btn.textContent='🔄 Retry'; showToast('Ad not ready, try again'); });
};
document.getElementById('hintBtn').onclick=()=>{let hints=findHint();if(hints){let [a,b]=hints;let el1=boardEl.children[a.r*BOARD_SIZE+a.c];let el2=boardEl.children[b.r*BOARD_SIZE+b.c];el1.classList.add('hint');el2.classList.add('hint');setTimeout(()=>{el1.classList.remove('hint');el2.classList.remove('hint');},1600);}else{showToast('No hints, shuffling...');shuffleBoard();}triggerAd('interstitial');};
document.getElementById('shuffleBtn').onclick=()=>{shuffleBoard();triggerAd('interstitial');};
function findHint(){for(let r=0;r<BOARD_SIZE;r++)for(let c=0;c<BOARD_SIZE;c++){let dirs=[[0,1],[1,0]];for(let [dr,dc]of dirs){let nr=r+dr,nc=c+dc;if(nr>=BOARD_SIZE||nc>=BOARD_SIZE)continue;swap(r,c,nr,nc);if(findAllMatches().length>0){swap(r,c,nr,nc);return[{r,c},{r:nr,c:nc}];}swap(r,c,nr,nc);}}return null;}
function shuffleBoard(){createBoard();renderBoard();showToast('Board Shuffled');}
setInterval(()=>{let ad=document.getElementById('embedAd');if(ad)ad.querySelector('.ad-content').textContent=['🎁 Play & Earn - RichAds','🚀 New Galaxy Bonus!','💎 500 Coins Free!'][Math.floor(Math.random()*3)];},8000);
initGame();
