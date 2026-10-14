// === RICHADS INIT ===
window.TelegramAdsController = new TelegramAdsController();
window.TelegramAdsController.initialize({
  pubId: "792361",
  appId: "1396",
  debug: false
});

let coins = 0;
let baseReward = Math.floor(Math.random()*50)+20;
const coinEl = document.getElementById('coinCount');
const car = document.getElementById('car');
const crashBtn = document.getElementById('crashBtn');
const doubleBtn = document.getElementById('doubleBtn');

// Auto In-App Interstitial - Monetag
if(typeof show_11215599 === 'function'){
  show_11215599({
    type: 'inApp',
    inAppSettings: { frequency: 2, capping: 0.1, interval: 30, timeout: 5, everyPage: false }
  });
}

function updateCoins(add){ coins+=add; coinEl.innerText=coins; }

function showCrashAd(){
  if(typeof show_11215599 === 'function'){
    show_11215599().then(()=>{ doCrash(); }).catch(()=>{ showRichInterstitial(); });
  }else{ showRichInterstitial(); }
}
function showRichInterstitial(){
  window.TelegramAdsController.triggerInterstitialBanner().then(()=>{ doCrash(); }).catch(()=>{ doCrash(); });
}
function doCrash(){
  car.style.top="230px";
  setTimeout(()=>{
    document.getElementById('game').classList.add('crash-anim');
    let reward = baseReward;
    updateCoins(reward);
    alert(`💥 CRASHED! +${reward} coins`);
    setTimeout(()=>{car.style.top="20px"; document.getElementById('game').classList.remove('crash-anim'); baseReward=Math.floor(Math.random()*50)+20;},600);
  },600);
}

function showDoubleRewardAd(){
  if(typeof show_11215599 === 'function'){
    show_11215599().then(()=>{
      updateCoins(baseReward);
      alert(`🎬 Double Reward +${baseReward} extra!`);
    }).catch(()=>{ showRichRewarded(); });
  }else{ showRichRewarded(); }
}
function showRichRewarded(){
  window.TelegramAdsController.triggerNativeNotification().then(()=>{
    updateCoins(baseReward);
    alert('RichAds Reward! Double!');
  }).catch(()=>{ alert('No ad right now'); });
}

crashBtn.addEventListener('click', showCrashAd);
doubleBtn.addEventListener('click', showDoubleRewardAd);
