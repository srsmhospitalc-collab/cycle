// Native Ad - Level 1,3,5,7... ke liye - SAFE ✅
function showNativeAd() {
    window.TelegramAdsController.triggerNativeNotification().then((result) => {
        console.log('Live Native ad shown:', result);
    }).catch((err) => {
        console.log('Live Native ad fail:', err);
    });
}

// Interstitial Banner - Level 2,14... ke liye - BAN RISK ❌
function showInterstitialBanner() {
    window.TelegramAdsController.triggerInterstitialBanner().then((result) => {
        console.log('Interstitial Banner shown:', result);
    }).catch((result) => {
        console.log('Interstitial Banner fail:', result);
    });
}

// Interstitial Video - Level 4,16... ke liye - BAN RISK ❌
function showInterstitialVideo() {
    window.TelegramAdsController.triggerInterstitialVideo().then((result) => {
        console.log('Interstitial Video shown:', result);
    }).catch((result) => {
        console.log('Interstitial Video fail:', result);
    });
}

// Embedded Banner - Level 6,18... ke liye - BAN RISK ❌
function showEmbeddedBanner() {
    window.TelegramAdsController.triggerEmbeddedBanner('ad-container').then((result) => {
        console.log('Embedded Banner shown:', result);
    }).catch((result) => {
        console.log('Embedded Banner fail:', result);
    });
}

// Pops - Level 8,20... ke liye - BAN RISK ❌
function showPopsAd() {
    window.TelegramAdsController.triggerPops().then((result) => {
        console.log('Pops ad triggered:', result);
    }).catch((result) => {
        console.log('Pops ad fail:', result);
    });
}

// In-page - Level 10,22... ke liye - BAN RISK ❌
function showInPageAd() {
    window.TelegramAdsController.triggerInPage().then((result) => {
        console.log('In-page ad shown:', result);
    }).catch((result) => {
        console.log('In-page ad fail:', result);
    });
}

// Playable Ads - Level 12,24... ke liye - BAN RISK ❌
function showPlayableAd() {
    window.TelegramAdsController.triggerPlayableAd().then((result) => {
        console.log('Playable ad shown:', result);
    }).catch((result) => {
        console.log('Playable ad fail:', result);
    });
}

// Rewarded Ads - Hint/Tube ke liye - SAFE ✅
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
