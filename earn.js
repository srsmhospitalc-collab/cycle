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

let bal=0, currentLink="";

async function initBalance(){
  try{
    const snap = await get(ref(db,'users/'+uid));
    if(snap.exists()) bal = snap.val().balance || 0;
    document.getElementById('coinBal').innerText = bal;
  }catch(e){}
}
initBalance();

// BUTTON 1 - COMING SOON
window.handleBtn1 = () => {
  tg.showPopup({ title: "Coming Soon", message: "This feature coming soon 🔜", buttons: [{type: "ok"}] });
}

// BUTTON 2 - Image popup
window.openLink2 = () => {
  document.getElementById('popupImg').src = 'https://srsmhospitalc-collab.github.io/cycle/ifly.jpg';
  currentLink = 'https://iflylink.com/3haKwFw';
  document.getElementById('imgPopup').style.display = 'flex';
}

// BUTTON 4 - Image popup
window.openLink4 = () => {
  document.getElementById('popupImg').src = 'https://srsmhospitalc-collab.github.io/cycle/linkver.jpg';
  currentLink = 'https://direct-link.net/6173303/pStP7x9ElxQj';
  document.getElementById('imgPopup').style.display = 'flex';
}

// OK pe link khulega
window.handlePopupOk = () => {
  document.getElementById('imgPopup').style.display = 'none';
  tg.openLink(currentLink, {try_instant_view: false});
}

// BUTTON 3 - SECURE
function b3State(){
  const lock=parseInt(localStorage.getItem('b3_lock')||'0');
  const right = document.getElementById('btn3Right');
  const sub = document.getElementById('btn3Sub');
  const card = document.getElementById('btn3Card');
  if(lock>Date.now()){
    const h = Math.ceil((lock-Date.now())/3600000);
    if(sub) sub.innerText=`Locked ${h}h left`;
    if(right) right.innerText=`LOCKED`;
    if(card) card.style.opacity="0.5";
    return true;
  }
  if(card) card.style.opacity="1";
  if(sub) sub.innerText=`Tap to earn`;
  if(right) right.innerText=`350 COIN`;
  return false;
}
setInterval(b3State,1000); b3State();

window.handleBtn3 = async () => {
  if(b3State()) return;
  try{
    // SECURE LOGIC: Real balance Firebase se lo
    const snap = await get(ref(db,'users/'+uid));
    let realBal = 0;
    if(snap.exists()) realBal = snap.val().balance || 0;
    
    realBal += 350;
    bal = realBal;
    
    document.getElementById('coinBal').innerText = bal;
    await update(ref(db, 'users/' + uid), { balance: realBal });
    
    localStorage.setItem('b3_lock', (Date.now() + 24*60*60*1000).toString());
    b3State();
    tg.showPopup({ message: '350 Coins Added!' });
  }catch(e){}
  
  tg.openLink('https://uplcm.com/4/10921997', {try_instant_view: false});
}
