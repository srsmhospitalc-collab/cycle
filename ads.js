window.TelegramAdsController = new TelegramAdsController();
window.TelegramAdsController.initialize({
    pubId: "1013423",
    appId: "7744",
    debug: false // LIVE MODE ON - Real ads + Real paisa
});

// Native Ad - Level 1,3,5,7... ke liye - SAFE
function showNativeAd() {
    window.TelegramAdsController.triggerNativeNotification().then((result) => {
        console.log('Live Native ad shown:', result);
    }).catch((err) => {
        console.log('Live Native ad fail:', err);
    });
}

// Interstitial Ad - Level 2,4,6,8... ke liye - BANNABLE
function showInterstitialAd() {
    window.TelegramAdsController.triggerInterstitialBanner().then((result) => {
        console.log('Live Interstitial shown:', result);
    }).catch((result) => {
        console.log('Live Interstitial fail/skip:', result);
    });
}

// Rewarded Ads - Hint/Tube ke liye - SAFE + HIGH CPM
function showRewardedAd(type) {
    Telegram.WebApp.showConfirm(`Watch ad for ${type}?`, (confirmed) => {
        if(confirmed) {
            window.TelegramAdsController.triggerNativeNotification().then(() => {
                if(type === 'hint') {
                    Telegram.WebApp.showAlert('💡 Hint: Khali tube me same color daalo!');
                } else if(type === 'tube') {
                    tubes.push([]);
                    renderTubes();
                    Telegram.WebApp.showAlert('➕ Extra tube added!');
                }
            }).catch(() => {
                Telegram.WebApp.showAlert('Ad load nahi hua. Baad me try karo.');
            });
        }
    });
}

document.getElementById('hint-btn').onclick = () => showRewardedAd('hint');
document.getElementById('extra-tube-btn').onclick = () => showRewardedAd('tube');
