let currentLevel = 1;
const maxLevel = 10;
let tapsInLevel = 0;
let totalTaps = 0;
const tapsNeeded = 100;

const tapBtn = document.getElementById('tapBtn');
const tapCountEl = document.getElementById('tapCount');
const totalTapsEl = document.getElementById('totalTaps');
const levelCountEl = document.getElementById('levelCount');
const progressEl = document.getElementById('progress');
const popup = document.getElementById('levelPopup');
const popupTitle = document.getElementById('popupTitle');
const nextBtn = document.getElementById('nextBtn');

// Monetag Interstitial Function - Har Level ke Baad
function showInterstitialAd(callback){
  if(typeof show_11215599 === 'function'){
    show_11215599().then(()=>{
      console.log("Interstitial shown");
      if(callback) callback();
    }).catch(()=>{
      console.log("Ad fail, continue");
      if(callback) callback();
    });
  }else{
    if(callback) callback();
  }
}

function handleTap(){
  tapsInLevel++;
  totalTaps++;
  tapCountEl.innerText = tapsInLevel;
  totalTapsEl.innerText = totalTaps;
  progressEl.style.width = (tapsInLevel / tapsNeeded * 100) + "%";

  // Vibration effect
  if(navigator.vibrate) navigator.vibrate(30);

  if(tapsInLevel >= tapsNeeded){
    levelComplete();
  }
}

function levelComplete(){
  tapBtn.style.pointerEvents = "none";
  
  if(currentLevel >= maxLevel){
    popupTitle.innerText = `All 10 Levels Complete! 🏆`;
    popup.querySelector('p').innerText = `Total ${totalTaps} Taps!`;
    nextBtn.innerText = "PLAY AGAIN 🔄";
    popup.classList.remove('hidden');
    
    // Last level ke baad bhi ad
    showInterstitialAd(()=>{});
    return;
  }

  popupTitle.innerText = `Level ${currentLevel} Complete! 🎉`;
  popup.classList.remove('hidden');

  // Level complete hote hi interstitial dikhao
  showInterstitialAd(()=>{});
}

nextBtn.addEventListener('click', ()=>{
  popup.classList.add('hidden');
  if(currentLevel >= maxLevel){
    // Reset game
    currentLevel = 1;
    totalTaps = 0;
    totalTapsEl.innerText = 0;
  }else{
    currentLevel++;
  }
  tapsInLevel = 0;
  tapCountEl.innerText = 0;
  levelCountEl.innerText = currentLevel;
  progressEl.style.width = "0%";
  tapBtn.style.pointerEvents = "auto";
});

// Tap events - mobile + desktop
tapBtn.addEventListener('touchstart', (e)=>{ e.preventDefault(); handleTap(); });
tapBtn.addEventListener('click', handleTap);
