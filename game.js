let tg = null;
try {
    tg = window.Telegram.WebApp;
    tg.ready(); tg.expand(); tg.enableClosingConfirmation();
} catch(e) {
    tg = { HapticFeedback: { notificationOccurred: () => {} }, showAlert: (msg) => alert(msg), BackButton: { onClick: () => {}, show: () => {}, hide: () => {} } };
}

let currentLevel = 1, maxUnlocked = 1, canShowAd = true;
let tubes = [], selectedTube = null, moves = 0, moveHistory = [];
let extraTubeUsed = false;
const COLORS = ['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#a855f7', '#ec4899', '#f97316', '#06b6d4', '#84cc16', '#6366f1'];
const LEVEL_CONFIG = { 1:{tubes:4,colors:2},2:{tubes:4,colors:2},3:{tubes:5,colors:3},4:{tubes:5,colors:3},5:{tubes:6,colors:4},10:{tubes:7,colors:5},15:{tubes:8,colors:6},20:{tubes:9,colors:7} };

// === AD LOGIC: OnClicka -> Adsbitvex -> Monetag ===
function showInterstitialFallback(onDone){
    if(typeof window.showInpageOnClicka === 'function'){
        console.log('Trying OnClicka Inpage 6152854');
        window.showInpageOnClicka().then(()=>{ console.log('OnClicka Inpage OK'); onDone(); }).catch(()=>{
            console.log('OnClicka Inpage fail -> Adsbitvex Init');
            tryFallbackInit(onDone);
        });
        return;
    }
    tryFallbackInit(onDone);
    function tryFallbackInit(cb){
        if(typeof window.showadsbitvex_init === 'function'){
            window.showadsbitvex_init().then(cb).catch(()=>cb());
        } else { cb(); }
    }
}

function showRewardedWithFallback(onReward){
    if(typeof show_11215599 === 'function'){
        console.log('Trying Monetag Rewarded 11215599');
        show_11215599().then(onReward).catch(()=>{
            console.log('Monetag Rewarded fail -> Adsbitvex');
            tryFallbackRewarded(onReward);
        });
        return;
    }
    tryFallbackRewarded(onReward);
}

function tryFallbackRewarded(onReward){
    if(typeof window.showadsbitvex === 'function'){
        console.log('Trying Adsbitvex Rewarded');
        window.showadsbitvex().then(()=>{ console.log('Adsbitvex OK'); onReward(); }).catch(()=>{
            console.log('Adsbitvex fail');
            tg.showAlert('Ad pura dekho tabhi reward milega');
        });
        return;
    }
    tg.showAlert('No Ad Available');
}

function getLevelConfig(lvl){ if(LEVEL_CONFIG[lvl]) return LEVEL_CONFIG[lvl]; const colors=Math.min(3+Math.floor(lvl/5),8); return {tubes:colors+2, colors}; }
function generateLevel(lvl){
    const config=getLevelConfig(lvl); const {tubes:tubeCount,colors:colorCount}=config;
    let balls=[]; for(let i=0;i<colorCount;i++) for(let j=0;j<4;j++) balls.push(COLORS[i]);
    for(let i=balls.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [balls[i],balls[j]]=[balls[j],balls[i]]; }
    tubes=[]; let ballIndex=0;
    for(let i=0;i<tubeCount;i++){ const tube=[]; if(i<tubeCount-2) for(let j=0;j<4;j++) tube.push(balls[ballIndex++]); tubes.push(tube); }
    moves=0; moveHistory=[]; extraTubeUsed=false; selectedTube=null; updateMoves(); renderTubes();
}
function renderTubes(){
    const container=document.getElementById('tubesContainer'); container.innerHTML='';
    tubes.forEach((tube,index)=>{
        const tubeEl=document.createElement('div'); tubeEl.className='tube'; tubeEl.id='tube-'+index; tubeEl.onclick=()=>selectTube(index);
        if(tube.length===4 && tube.every(b=>b===tube[0])) tubeEl.classList.add('complete');
        tube.forEach(color=>{ const ball=document.createElement('div'); ball.className='ball'; ball.style.background=color; tubeEl.appendChild(ball); });
        container.appendChild(tubeEl);
    });
    document.getElementById('levelNum').textContent=currentLevel;
}
function selectTube(index){
    if(selectedTube===null){ if(tubes[index].length===0) return; selectedTube=index; document.getElementById('tube-'+index).classList.add('selected'); }
    else if(selectedTube===index){ document.getElementById('tube-'+selectedTube).classList.remove('selected'); selectedTube=null; }
    else { moveBall(selectedTube,index); document.getElementById('tube-'+selectedTube).classList.remove('selected'); selectedTube=null; }
}
function moveBall(from,to){
    const fromTube=tubes[from], toTube=tubes[to];
    if(fromTube.length===0) return; if(toTube.length>=4) return;
    const ball=fromTube[fromTube.length-1];
    if(toTube.length>0 && toTube[toTube.length-1]!==ball){ try{tg.HapticFeedback.notificationOccurred('error');}catch(e){} return; }
    moveHistory.push({from,to,ball}); fromTube.pop(); toTube.push(ball); moves++; updateMoves(); renderTubes();
    try{tg.HapticFeedback.notificationOccurred('success');}catch(e){} checkWin();
}
function undoMove(){
    if(moveHistory.length===0) return;
    showRewardedWithFallback(()=>{
        const lastMove=moveHistory.pop(); tubes[lastMove.to].pop(); tubes[lastMove.from].push(lastMove.ball);
        moves--; updateMoves(); renderTubes(); tg.showAlert('Undo ho gaya!');
    });
}
function addTube(){
    if(extraTubeUsed){ tg.showAlert('Extra tube already used!'); return; }
    showRewardedWithFallback(()=>{
        tubes.push([]); extraTubeUsed=true; renderTubes(); tg.showAlert('Extra tube added! 🎉');
    });
}
function updateMoves(){ document.getElementById('moveCount').textContent=moves; }
function checkWin(){ const isWin=tubes.every(tube=> tube.length===0 || (tube.length===4 && tube.every(b=>b===tube[0]))); if(isWin) setTimeout(winLevel,500); }

function winLevel(){
    saveGame();
    if(currentLevel>=maxUnlocked){ maxUnlocked=currentLevel+1; saveGame(); }

    let shouldShowAd = false;

    // 2,4,6...20 tak
    if(currentLevel <= 20 && currentLevel % 2 === 0){
        shouldShowAd = true;
    }
    // 21 se har level pe
    else if(currentLevel >= 21){
        shouldShowAd = true;
    }

    if(shouldShowAd){
        console.log('Level Win Ad - ' + currentLevel);
        if(canShowAd){
            canShowAd=false;
            setTimeout(()=>{canShowAd=true;},30000);
            showInterstitialFallback(()=>{
                showLevelSelect();
            });
        } else {
            showLevelSelect();
        }
    } else {
        // 1,3,5...19 pe no ad
        showLevelSelect();
    }
}

function showHome(){ document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active')); document.getElementById('homeScreen').classList.add('active'); try{tg.BackButton.hide();}catch(e){} }
function showLevelSelect(){ document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active')); document.getElementById('levelScreen').classList.add('active'); renderLevelGrid(); try{tg.BackButton.show();}catch(e){} }
function renderLevelGrid(){ const grid=document.getElementById('levelGrid'); grid.innerHTML=''; for(let i=1;i<=100;i++){ const btn=document.createElement('div'); btn.className='level-btn'; btn.textContent=i; if(i<=maxUnlocked){ btn.className+=' unlocked'; if(i===currentLevel) btn.className+=' current'; btn.onclick=()=>startLevel(i); } else { btn.className+=' locked'; } grid.appendChild(btn); } }
function startLevel(lvl){ currentLevel=lvl; document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active')); document.getElementById('gameScreen').classList.add('active'); try{tg.BackButton.show();}catch(e){} setTimeout(()=>generateLevel(lvl),100); }
function saveGame(){ try{ localStorage.setItem('ballSort100', JSON.stringify({maxUnlocked})); tg.CloudStorage.setItem('maxLevel', maxUnlocked.toString()); }catch(e){} }
function loadGame(){ try{ const saved=localStorage.getItem('ballSort100'); if(saved) maxUnlocked=JSON.parse(saved).maxUnlocked||1; tg.CloudStorage.getItem('maxLevel',(err,val)=>{ if(!err&&val) maxUnlocked=Math.max(maxUnlocked, parseInt(val)); }); }catch(e){} }
loadGame();
try{ tg.BackButton.onClick(()=>{ if(document.getElementById('gameScreen').classList.contains('active')){ showLevelSelect(); } else if(document.getElementById('levelScreen').classList.contains('active')){ showHome(); } }); }catch(e){}
