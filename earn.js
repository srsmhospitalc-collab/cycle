import { initializeApp } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-app.js";
import { getDatabase, ref, get, update } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBBaxVAyNYG6v2Xs6_yF-Z_f1Tm3oftpQk",
  authDomain: "sfaearn.firebaseapp.com",
  databaseURL: "https://sfaearn-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "sfaearn",
  appId: "1:451152021964:web:cf11961c89b9b7ec0f569"
};
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const tg = window.Telegram.WebApp;
const uid = tg.initDataUnsafe?.user?.id?.toString() || "test_123";

// --- UNIVERSAL FIX: Future me bhi Chrome me nahi jayega ---
window.open = function(url) {
  tg.openLink(url, {try_instant_view: false});
};

let bal=0, taps=0, gameDone=false;

async function initBalance(){
  const snap = await get(ref(db,'users/'+uid));
  if(snap.exists()) bal = snap.val().balance || 0;
  document.getElementById('coinBal').innerText = bal;
}
initBalance();

function b1State(){
  const today = new Date().toDateString();
  if(localStorage.getItem('b1_date')!==today){
    localStorage.setItem('b1_date',today);
    localStorage.setItem('b1_count','0');
    localStorage.removeItem('b1_lock');
  }
  const cnt = parseInt(localStorage.getItem('b1_count')||'0');
  const lock = parseInt(localStorage.getItem('b1_lock')||'0');
  const now = Date.now();
  const card = document.getElementById('btn1Card');
  const title = document.getElementById('btn1Title');
  const right = document.getElementById('btn1Right');
  const sub = document.getElementById('btn1Sub');

  if(cnt>=5){
    let mid=new Date(); mid.setHours(24,0,0,0);
    title.innerText=`Locked Till 12 AM`;
    sub.innerText=`${Math.ceil((mid-now)/60000)}m left`;
    card.classList.add('locked'); return true;
  }
  if(lock>now){
    title.innerText=`Watch Ads and Collect 1750 Coin`;
    right.innerText=`WAIT`;
    sub.innerText=`${Math.ceil((lock-now)/60000)} min`;
    card.classList.add('locked'); return true;
  }
  card.classList.remove('locked');
  if(gameDone){title.innerText=`Watch Ads and Collect 1750 Coin`; right.innerText=`WATCH AD`; sub.innerText=`Claim 1750`;}
  else{title.innerText=`Play & Earn 1750 Coin`; right.innerText=`1750 COIN`; sub.innerText=`Tap to start`;}
  return false;
}
setInterval(b1State,1000); b1State();

window.handleBtn1=()=>{
  if(b1State()) return;
  if(!gameDone) document.getElementById('tapModal').style.display='flex';
  else showRewarded();
}
window.doTap=()=>{
  taps++; 
  document.getElementById('tapNum').innerText=taps+"/100";
  document.getElementById('tapBar').style.width=taps+"%";
  if(taps>=100){ taps=0; showCongratsAndInterstitial(); }
}
window.closeTap=()=>{ document.getElementById('tapModal').style.display='none'; taps=0; document.getElementById('tapBar').style.width='0%'; }

function showCongratsAndInterstitial(){
  document.getElementById('tapModal').style.display='none';
  document.getElementById('congratsModal').style.display='flex';
  try{
    window.TelegramAdsController.triggerInterstitialBanner().catch(()=>{
      show_11215599({type:'inApp',inAppSettings:{frequency:2,capping:0.1,interval:30,timeout:5,everyPage:false}});
    });
  }catch(e){
    show_11215599({type:'inApp',inAppSettings:{frequency:2,capping:0.1,interval:30,timeout:5,everyPage:false}});
  }
  setTimeout(()=>{ document.getElementById('congratsModal').style.display='none'; gameDone=true; b1State(); },5000);
}

window.showRewarded=()=>{
  show_11215599().then(async()=>{
    bal+=1750;
    document.getElementById('coinBal').innerText=bal;
    await update(ref(db,'users/'+uid),{balance:bal});
    let c=parseInt(localStorage.getItem('b1_count')||'0')+1;
    localStorage.setItem('b1_count',c.toString());
    if(c>=5){
      let mid=new Date(); mid.setHours(24,0,0,0);
      localStorage.setItem('b1_lock',mid.getTime().toString());
    }else{
      localStorage.setItem('b1_lock',(Date.now()+5*60*1000).toString());
    }
    gameDone=false; b1State();
    tg.showPopup?.({message:'1750 Coins Added!'});
  }).catch(()=>{});
}

// --- FIXED BUTTON 2 & 4 - Ab Chrome me nahi jayega ---
window.openLink2=()=>{ 
  tg.openLink('https://iflylink.com/bLlr235', {try_instant_view: false});
}
window.openLink4=()=>{ 
  tg.openLink('https://direct-link.net/6173303/pStP7x9ElxQj', {try_instant_view: false});
}

function b3State(){
  const lock=parseInt(localStorage.getItem('b3_lock')||'0');
  if(lock>Date.now()){
    document.getElementById('btn3Sub').innerText=`Locked ${Math.ceil((lock-Date.now())/3600000)}h left`;
    document.getElementById('btn3Card').classList.add('locked'); return true;
  }
  document.getElementById('btn3Card').classList.remove('locked');
  document.getElementById('btn3Sub').innerText=`Tap to earn`; return false;
}
setInterval(b3State,1000); b3State();

// --- FIXED BUTTON 3 ---
window.handleBtn3=()=>{
  if(b3State()) return;
  localStorage.setItem('b3_start',Date.now().toString());
  tg.openLink('https://uplcm.com/4/10921997', {try_instant_view: false});
}

document.addEventListener('visibilitychange', async()=>{
  if(document.visibilityState==='visible'){
    const start=parseInt(localStorage.getItem('b3_start')||'0');
    if(!start) return;
    const diff=(Date.now()-start)/1000;
    localStorage.removeItem('b3_start');
    if(diff<10){
      tg.showPopup?.({message:`Too fast! ${Math.floor(diff)}s only. Stay 10 sec for 350 coin.`});
    }else{
      if(parseInt(localStorage.getItem('b3_lock')||'0')>Date.now()) return;
      bal+=350;
      document.getElementById('coinBal').innerText=bal;
      await update(ref(db,'users/'+uid),{balance:bal});
      localStorage.setItem('b3_lock',(Date.now()+24*60*60*1000).toString());
      b3State();
      tg.showPopup?.({message:'350 Coins Added!'});
    }
  }
});

window.comingSoon=()=>{ 
  tg.showPopup({message: 'Coming Soon 🔜'});
}
