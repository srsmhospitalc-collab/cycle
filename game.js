function checkWin() {
    let won = tubes.every(tube =>
        tube.length === 0 || (tube.length === 4 && tube.every(b => b === tube[0]))
    );

    if(won) {
        if(currentLevel === unlockedLevels && unlockedLevels < 100) {
            unlockedLevels++;
            localStorage.setItem('unlockedLevels', unlockedLevels);
        }

        setTimeout(() => {
            Telegram.WebApp.showAlert(`🎉 Level ${currentLevel} Complete!`);

            // HAR 2 LEVEL PE AD - SAB TYPE ROTATE HONGE
            if(currentLevel % 2 === 0) {
                let adType = currentLevel / 2; // Level 2=1, 4=2, 6=3, 8=4...
                
                switch(adType % 6) { // 6 ad type rotate karenge
                    case 1:
                        showInterstitialBanner(); // Level 2,14,26...
                        break;
                    case 2:
                        showInterstitialVideo(); // Level 4,16,28...
                        break;
                    case 3:
                        showEmbeddedBanner(); // Level 6,18,30...
                        break;
                    case 4:
                        showPopsAd(); // Level 8,20,32...
                        break;
                    case 5:
                        showInPageAd(); // Level 10,22,34...
                        break;
                    case 0:
                        showPlayableAd(); // Level 12,24,36...
                        break;
                }
            } else {
                showNativeAd(); // Level 1,3,5,7... = Safe wala
            }

            setTimeout(() => {
                showLevelSelect();
            }, 1000);

        }, 500);
    }
}
