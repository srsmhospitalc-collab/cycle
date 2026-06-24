window.TelegramAdsController = new TelegramAdsController();
window.TelegramAdsController.initialize({
    pubId: "1013423",
    appId: "7744",
    debug: false // LIVE MODE - Real paisa
});

// 1. Push-style = Native Notification - SAFE FOR TELEGRAM ✅
function showNativeAd() {
    window.TelegramAdsController.triggerNativeNotification().then((result) => {
        console.log('Native/Push-style ad shown:', result);
    }).catch((err) => {
        console.log('Native ad fail:', err);
    });
}

// 2. Interstitial Banner - BANNABLE IN TELEGRAM ❌
function showInterstitialBanner() {
    window.TelegramAdsController.triggerInterstitialBanner().then((result) => {
        console.log('Interstitial Banner shown:', result);
    }).catch((result) => {
        console.log('Interstitial Banner fail:', result);
    });
}

// 3. Interstitial Video - BANNABLE IN TELEGRAM ❌
function showInterstitialVideo() {
    window.TelegramAdsController.triggerInterstitialVideo().then((result) => {
        console.log('Interstitial Video shown:', result);
    }).catch((result) => {
        console.log('Interstitial Video fail:', result);
    });
}

// 4. Embedded Banner - BANNABLE IN TELEGRAM ❌
function showEmbeddedBanner() {
    // Iske liye HTML me div chahiye: <div id="ad-container"></div>
    window.TelegramAdsController.triggerEmbeddedBanner('ad-container').then((result) => {
        console.log('Embedded Banner shown:', result);
    }).catch((result) => {
        console.log('Embedded Banner fail:', result);
    });
}

// 5. Pops - BANNABLE IN TELEGRAM ❌
function showPopsAd() {
    window.TelegramAdsController.triggerPops().then((result) => {
        console.log('Pops ad triggered:', result);
    }).catch((result) => {
        console.log('Pops ad fail:', result);
    });
}

// 6. In-page - BANNABLE IN TELEGRAM ❌
function showInPageAd() {
    window.TelegramAdsController.triggerInPage().then((result) => {
        console.log('In-page ad shown:', result);
    }).catch((result) => {
        console.log('In-page ad fail:', result);
    });
}

// 7. Playable Ads - BANNABLE IN TELEGRAM ❌
function showPlayableAd() {
    window.TelegramAdsController.triggerPlayableAd().then((result) => {
        console.log('Playable ad shown:', result);
    }).catch((result) => {
        console.log('Playable ad fail:', result);
    });
}

// Rewarded ke liye Native use karo - Safe hai
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
