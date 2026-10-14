let currentLevel = 1, maxLevel = 10, tapsInLevel = 0, totalTaps = 0;
const tapsNeeded = 100;

const tapBtn = document.getElementById('tapBtn');
const tapCountEl = document.getElementById('tapCount');
const totalTapsEl = document.getElementById('totalTaps');
const levelCountEl = document.getElementById('levelCount');
const progressEl = document.getElementById('progress');
const popup = document.getElementById('levelPopup');
const popupTitle = document.getElementById('popupTitle');
const nextBtn = document.getElementById('nextBtn');
const rewardBtn = document.getElementById('rewardBtn');
const debugEl = document.getElementById('debug');

if(window.Telegram && window.Telegram.WebApp){
  window.Telegram.WebApp.ready();
  window.Telegram.WebApp.expand();
}

// 1. INTERSTITIAL - Har Level ke baad (Tera wala)
function showInterstitialAd(){
  debugEl.innerText = "Interstitial loading...";
  if(typeof show_11215599 === 'function'){
    show_11215599({type:'inApp', inAppSettings:{frequency:2,capping:0.1,interval:30,timeout:5,everyPage:false}})
    .then(()=>{ debugEl.innerText = "Interstitial done ✓"; })
    .catch(()=>{ debugEl.innerText = "Interstitial fail"; });
  }
}

// 2. REWARDED - 50 Taps Free - Yahi tera wala code hai
function showRewardedAd(){
  rewardBtn.disabled = true;
  rewardBtn.innerText = "Loading Ad...";
  debugEl.innerText = "Rewarded loading...";

  if(typeof show_11215599 === 'function'){
    // Monetag rewarded me yahi function reward deta hai agar user pura dekhe
    show_11215599().then(()=>{
      // User ne ad pura dekha = 50 tap reward
      tapsInLevel += 50;
      if(tapsInLevel > 100) tapsInLevel = 100;
      totalTaps += 50;
      
      tapCountEl.innerText = tapsInLevel;
      totalTapsEl.innerText = totalTaps;
      progressEl.style.width = (tapsInLevel / tapsNeeded * 100) + "%";
      
      debugEl.innerText = "+50 Taps Added! 🎉";
      rewardBtn.innerText = "📺 Watch Ad +50 Taps FREE";
      rewardBtn.disabled = false;

      if(tapsInLevel >= tapsNeeded) levelComplete();

    }).catch(()=>{
      debugEl.innerText = "Rewarded fail";
      rewardBtn.innerText = "📺 Watch Ad +50 Taps FREE";
      rewardBtn.disabled = false;
    });
  }else{
    debugEl.innerText = "SDK not loaded";
    rewardBtn.disabled = false;
    rewardBtn.innerText = "📺 Watch Ad +50 Taps FREE";
  }
}

function handleTap(){
  tapsInLevel++; totalTaps++;
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
    popup.classList.remove('hidden');
    setTimeout(()=>{ showInterstitialAd(); }, 300);
    return;
  }
  popupTitle.innerText = `Level ${currentLevel} Complete! 🎉`;
  popup.classList.remove('hidden');
  setTimeout(()=>{ showInterstitialAd(); }, 500);
}

nextBtn.addEventListener('click', ()=>{
  popup.classList.add('hidden');
  if(currentLevel >= maxLevel){ currentLevel = 1; totalTaps = 0; totalTapsEl.innerText = 0; }
  else currentLevel++;
  tapsInLevel = 0; tapCountEl.innerText = 0; levelCountEl.innerText = currentLevel;
  progressEl.style.width = "0%"; tapBtn.style.pointerEvents = "auto";
});

// Events
tapBtn.addEventListener('touchstart', (e)=>{ e.preventDefault(); handleTap(); }, {passive:false});
tapBtn.addEventListener('click', handleTap);
rewardBtn.addEventListener('click', showRewardedAd);
