if(centerWatchBtn){
  centerWatchBtn.onclick=function(){
    if(levelToUnlock%5!==0 && lastCompleted < levelToUnlock-1){ hideCenterModal(); return; }
    let btn=this; btn.innerText="Ad Loading...";

    const onSuccess=()=>{
      // count badhao sirf jab adsbitvex se success hua ho
      let c = parseInt(localStorage.getItem('adsv_count')||'0') + 1;
      localStorage.setItem('adsv_count', c);
      if(c >= 10){
        localStorage.setItem('adsv_block_till', Date.now() + 15*60*60*1000);
      }
      if(!adUnlockedLevels.includes(levelToUnlock)){ adUnlockedLevels.push(levelToUnlock); localStorage.setItem("adUnlockedLevels", JSON.stringify(adUnlockedLevels)); }
      hideCenterModal(); startLevel(levelToUnlock);
    };
    const onFail=()=>{ btn.innerText="🔄 Retry Karo"; };

    const showMonetag = () => {
      if(typeof show_11215599 === 'function'){
        show_11215599().then(onSuccess).catch(onFail);
      } else if(window.TelegramAdsController){
        window.TelegramAdsController.triggerRewardedAd().then(onSuccess).catch(onFail);
      } else onFail();
    };

    // 15 ghante wala check
    let count = parseInt(localStorage.getItem('adsv_count')||'0');
    let blockTill = parseInt(localStorage.getItem('adsv_block_till')||'0');

    if(blockTill && Date.now() < blockTill){
      // Block chal raha hai -> direct Monetag
      showMonetag();
      return;
    }
    // Block khatam hua to reset
    if(blockTill && Date.now() >= blockTill){
      localStorage.setItem('adsv_count','0');
      localStorage.setItem('adsv_block_till','0');
    }

    if(typeof window.showadsbitvex==='function'){
      window.showadsbitvex().then(onSuccess).catch(()=>{
        showMonetag();
      });
    } else {
      showMonetag();
    }
  };
}
