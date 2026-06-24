window.TelegramAdsController = new TelegramAdsController();
window.TelegramAdsController.initialize({
    pubId: "1013423",
    appId: "7744",
    debug: false
});

function showNativeAd() {
    window.TelegramAdsController.triggerNativeNotification().then((result) => {
        console.log('Ad shown');
    }).catch(() => console.log('No ad'));
}

function showRewardedAd(type) {
    Telegram.WebApp.showConfirm(`Watch ad for ${type}?`, (confirmed) => {
        if(confirmed) {
            window.TelegramAdsController.triggerNativeNotification().then(() => {
                if(type === 'hint') {
                    Telegram.WebApp.showAlert('💡 Hint: Sabse upar wali ball ko khali tube me daalo!');
                } else if(type === 'tube') {
                    tubes.push([]);
                    renderTubes();
                    Telegram.WebApp.showAlert('➕ Extra tube added!');
                }
            }).catch(() => {
                Telegram.WebApp.showAlert('Ad failed. Try again.');
            });
        }
    });
}

document.getElementById('hint-btn').onclick = () => showRewardedAd('hint');
document.getElementById('extra-tube-btn').onclick = () => showRewardedAd('tube');
