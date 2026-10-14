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
const debugEl = document.getElementById('debug');

// Telegram Init
if(window.Telegram && window.Telegram.WebApp){
  window.Telegram.WebApp.ready();
  window.Telegram.WebApp.expand();
  debugEl.innerText = "Telegram Mode";
}else{
  debugEl.innerText = "Browser Mode";
}

// Telegram Fix Interstitial
function showInterstitialAd(callback){
  debugEl.innerText = "Ad loading...";
  
  if(typeof show_11215599 === 'function'){
    // Ye type inApp Telegram me zaroori hai
    const adPromise = show_11215599({
      type: 'inApp',
      inAppSettings: {
        frequency: 2,
        capping: 0.1,
        interval: 30,
        timeout: 5,
        everyPage: false
      }
    });

    if(adPromise && adPromise.then){
      adPromise.then(()=>{
        debugEl.innerText = "Ad shown ✓";
        if(callback) callback();
      }).catch((e)=>{
        debugEl.innerText = "Ad failed, continue";
        console.log(e);
        if(callback) callback();
      });
    }else{
      debugEl.innerText = "SDK no promise";
      if(callback) callback();
    }
  }else{
    debugEl.innerText = "SDK not loaded";
    if(callback) callback();
  }
}

function handleTap(){
  tapsInLevel++;
  totalTaps++;
  tapCountEl.innerText = tapsInLevel;
  totalTapsEl.innerText = totalTaps;
  progressEl.style.width = (tapsInLevel / tapsNeeded * 100) + "%";
  if(navigator.vibrate) navigator.vibrate(20);
  if(tapsInLevel >= tapsNeeded) levelComplete();
}

function levelComplete(){
  tapBtn.style.pointerEvents = "none";
  
  if(currentLevel >= maxLevel){
    popupTitle.innerText = `All 10 Levels Complete! 🏆`;
    popup.querySelector('p').innerText = `Total ${totalTaps} Taps!`;
    nextBtn.innerText = "PLAY AGAIN 🔄";
    popup.classList.remove('hidden');
    // Last level ke baad bhi ad
    setTimeout(()=>{ showInterstitialAd(()=>{}); }, 300);
    return;
  }

  popupTitle.innerText = `Level ${currentLevel} Complete! 🎉`;
  popup.querySelector('p').innerText = `Level ${currentLevel + 1} ke liye ad...`;
  popup.classList.remove('hidden');

  // Har level ke baad ad - 500ms delay taaki Telegram click samjhe
  setTimeout(()=>{
    showInterstitialAd(()=>{});
  }, 500);
}

nextBtn.addEventListener('click', ()=>{
  popup.classList.add('hidden');
  if(currentLevel >= maxLevel){
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
  debugEl.innerText = currentLevel > 1 ? `Level ${currentLevel} started` : "Ready";
});

// Tap events
tapBtn.addEventListener('touchstart', (e)=>{ e.preventDefault(); handleTap(); }, {passive:false});
tapBtn.addEventListener('click', handleTap);
