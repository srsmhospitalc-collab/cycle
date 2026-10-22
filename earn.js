import { initializeApp } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-app.js";
import { getDatabase, ref, get, set, update } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBBaxVAyNYG6v2Xs6_yF-Z_f1Tm3oftpQk",
  authDomain: "sfaearn.firebaseapp.com",
  databaseURL: "https://sfaearn-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "sfaearn",
  storageBucket: "sfaearn.firebasestorage.app",
  messagingSenderId: "451152021964",
  appId: "1:451152021964:web:cf11961c89b9b7ec0f569"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Telegram User ID lena
const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();
const user = tg.initDataUnsafe.user;
const userId = user ? user.id.toString() : "test_123";
const username = user ? (user.username || user.first_name) : "testuser";

document.getElementById("userInfo").innerText = `ID: ${userId}`;

let taps = 0;
let balance = 0;
let saving = false;

const tapCountEl = document.getElementById("tapCount");
const barEl = document.getElementById("bar");
const coinEl = document.getElementById("coin");
const tapBtn = document.getElementById("tapBtn");

// Pehle ka balance load karo
async function loadData(){
  const userRef = ref(db, 'users/' + userId);
  const snap = await get(userRef);
  if(snap.exists()){
    balance = snap.val().balance || 0;
    coinEl.innerText = balance + " Coins";
  } else {
    await set(userRef, { username, balance: 0 });
  }
}
loadData();

// TAP LOGIC - 100 TAP = 10 COINS
tapBtn.addEventListener("click", async () => {
  taps++;
  tapCountEl.innerText = taps;
  barEl.style.width = taps + "%";
  
  if(tg.HapticFeedback) tg.HapticFeedback.impactOccurred('light');

  if(taps >= 100){
    taps = 0;
    balance += 10;
    
    tapCountEl.innerText = 0;
    barEl.style.width = "0%";
    coinEl.innerText = balance + " Coins";
    
    if(!saving){
      saving = true;
      tapBtn.innerText = "Saving...";
      await update(ref(db, 'users/' + userId), {
        balance: balance,
        username: username
      });
      tapBtn.innerText = "+10 Coins!";
      setTimeout(()=> tapBtn.innerText = "TAP ME", 1000);
      saving = false;
    }
  }
});
