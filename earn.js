import { initializeApp } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-app.js";
import { getDatabase, ref, get, set, update } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-database.js";

const firebaseConfig = { apiKey: "AIzaSyBBaxVAyNYG6v2Xs6_yF-Z_f1Tm3oftpQk", authDomain: "sfaearn.firebaseapp.com", databaseURL: "https://sfaearn-default-rtdb.asia-southeast1.firebasedatabase.app", projectId: "sfaearn", appId: "1:451152021964:web:cf11961c89b9b7ec0f569" };
const app = initializeApp(firebaseConfig); 
const db = getDatabase(app);

// SIMPLE WEB UID - localStorage se
let uid = localStorage.getItem('sfa_uid');
if(!uid){ uid = 'user_'+Date.now()+'_'+Math.floor(Math.random()*9999); localStorage.setItem('sfa_uid', uid); }

let bal=0, currentLink="";
async function initBalance(){
  try{
    const userRef=ref(db,'users/'+uid);
    const snap=await get(userRef);
    if(snap.exists()){ bal=snap.val().balance||0; } else { bal=0; await set(userRef,{ balance:0, id:uid, createdAt:Date.now() }); }
    document.getElementById('coinBal').innerText=bal;
  }catch(e){ console.log(e) }
  checkAllLocks();
}
initBalance();

function checkLock(key,rightId,subId,cardId,coinText){
  const lock=parseInt(localStorage.getItem(key+'_'+uid)||'0');
  const right=document.getElementById(rightId), sub=document.getElementById(subId), card=document.getElementById(cardId);
  if(lock>Date.now()){
    const h=Math.ceil((lock-Date.now())/3600000);
    if(sub) sub.innerText=`Locked ${h}h left`; if(right) right.innerText=`LOCKED`; if(card) card.style.opacity="0.5"; return true;
  }
  if(card) card.style.opacity="1"; if(sub) sub.innerText=`Tap to earn`; if(right) right.innerText=coinText; return false;
}
function checkAllLocks(){
  checkLock('b2_lock','btn2Right','btn2Sub','btn2Card','UPTO 8500');
  checkLock('b3_lock','btn3Right','btn3Sub','btn3Card','350 COIN');
  checkLock('b4_lock','btn4Right','btn4Sub','btn4Card','UPTO 1750');
}
setInterval(checkAllLocks,3000);

window.handleBtn1=()=>{ alert("Coming Soon 🔜"); }

window.openLink2=()=>{
  if(checkLock('b2_lock','btn2Right','btn2Sub','btn2Card','UPTO 8500')) return;
  
  document.getElementById('popupImg').src='https://srsmhospitalc-collab.github.io/cycle/ifly.jpg';
  
  // YAHAN CHANGE KIYA HAI - Tera Speedy-Links wala Locker
  currentLink='https://speedy-links.com/s?2C4meyXo';
  
  document.getElementById('imgPopup').style.display='flex';
}
window.openLink4=()=>{
  if(checkLock('b4_lock','btn4Right','btn4Sub','btn4Card','UPTO 1750')) return;
  document.getElementById('popupImg').src='https://srsmhospitalc-collab.github.io/cycle/linkver.jpg';
  currentLink='task1750.html?uid='+uid;
  document.getElementById('imgPopup').style.display='flex';
}
window.handlePopupOk=()=>{ document.getElementById('imgPopup').style.display='none'; window.open(currentLink, '_blank'); }

window.handleBtn3=async()=>{
  if(checkLock('b3_lock','btn3Right','btn3Sub','btn3Card','350 COIN')) return;
  try{
    const userRef=ref(db,'users/'+uid); const snap=await get(userRef);
    let realBal=snap.exists()?snap.val().balance||0:0; realBal+=350; bal=realBal;
    document.getElementById('coinBal').innerText=bal;
    await update(userRef,{balance:realBal});
    localStorage.setItem('b3_lock_'+uid,(Date.now()+24*60*60*1000).toString());
    checkAllLocks(); alert('350 Coins Added!');
  }catch(e){}
  window.open('https://uplcm.com/4/10921997', '_blank');
}
