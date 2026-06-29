let tg = null;
try {
    tg = window.Telegram.WebApp;
    tg.ready(); 
    tg.expand();
    tg.enableClosingConfirmation();
} catch(e) {
    tg = { HapticFeedback: { notificationOccurred: () => {} }, showAlert: (msg) => alert(msg), BackButton: { onClick: () => {}, show: () => {}, hide: () => {} } };
}

let currentLevel = 1, maxUnlocked = 1, canShowAd = true;
let tubes = [], selectedTube = null, moves = 0, moveHistory = [];
let extraTubeUsed = false;

const COLORS = ['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#a855f7', '#ec4899', '#f97316', '#06b6d4', '#84cc16', '#6366f1'];

// Level configs: {tubes: total, colors: unique colors, ballsPerColor: 4}
const LEVEL_CONFIG = {
    1: { tubes: 4, colors: 2 },
    2: { tubes: 4, colors: 2 },
    3: { tubes: 5, colors: 3 },
    4: { tubes: 5, colors: 3 },
    5: { tubes: 6, colors: 4 },
    10: { tubes: 7, colors: 5 },
    15: { tubes: 8, colors: 6 },
    20: { tubes: 9, colors: 7 },
};

function getLevelConfig(lvl) {
    if (LEVEL_CONFIG[lvl]) return LEVEL_CONFIG[lvl];
    // Auto generate: har 5 level pe +1 color
    const colors = Math.min(3 + Math.floor(lvl / 5), 8);
    const tubes = colors + 2;
    return { tubes, colors };
}

function generateLevel(lvl) {
    const config = getLevelConfig(lvl);
    const { tubes: tubeCount, colors: colorCount } = config;
    
    // Balls create karo - har color ki 4 balls
    let balls = [];
    for (let i = 0; i < colorCount; i++) {
        for (let j = 0; j < 4; j++) {
            balls.push(COLORS[i]);
        }
    }
    
    // Shuffle balls
    for (let i = balls.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [balls[i], balls[j]] = [balls[j], balls[i]];
    }
    
    // Tubes me daal do
    tubes = [];
    let ballIndex = 0;
    for (let i = 0; i < tubeCount; i++) {
        const tube = [];
        if (i < tubeCount - 2) { // Last 2 tubes khali
            for (let j = 0; j < 4; j++) {
                tube.push(balls[ballIndex++]);
            }
        }
        tubes.push(tube);
    }
    
    moves = 0;
    moveHistory = [];
    extraTubeUsed = false;
    selectedTube = null;
    updateMoves();
    renderTubes();
}

function renderTubes() {
    const container = document.getElementById('tubesContainer');
    container.innerHTML = '';
    
    tubes.forEach((tube, index) => {
        const tubeEl = document.createElement('div');
        tubeEl.className = 'tube';
        tubeEl.id = 'tube-' + index;
        tubeEl.onclick = () => selectTube(index);
        
        // Check if complete
        if (tube.length === 4 && tube.every(b => b === tube[0])) {
            tubeEl.classList.add('complete');
        }
        
        tube.forEach(color => {
            const ball = document.createElement('div');
            ball.className = 'ball';
            ball.style.background = color;
            tubeEl.appendChild(ball);
        });
        
        container.appendChild(tubeEl);
    });
    
    document.getElementById('levelNum').textContent = currentLevel;
}

function selectTube(index) {
    if (selectedTube === null) {
        // Pehla selection
        if (tubes[index].length === 0) return;
        selectedTube = index;
        document.getElementById('tube-' + index).classList.add('selected');
    } else if (selectedTube === index) {
        // Same tube deselect
        document.getElementById('tube-' + selectedTube).classList.remove('selected');
        selectedTube = null;
    } else {
        // Move ball
        moveBall(selectedTube, index);
        document.getElementById('tube-' + selectedTube).classList.remove('selected');
        selectedTube = null;
    }
}

function moveBall(from, to) {
    const fromTube = tubes[from];
    const toTube = tubes[to];
    
    if (fromTube.length === 0) return;
    if (toTube.length >= 4) return;
    
    const ball = fromTube[fromTube.length - 1];
    
    // Check valid move: empty tube ya same color
    if (toTube.length > 0 && toTube[toTube.length - 1]!== ball) {
        try { tg.HapticFeedback.notificationOccurred('error'); } catch(e) {}
        return;
    }
    
    // Save history for undo
    moveHistory.push({ from, to, ball });
    
    // Move ball
    fromTube.pop();
    toTube.push(ball);
    moves++;
    updateMoves();
    
    renderTubes();
    try { tg.HapticFeedback.notificationOccurred('success'); } catch(e) {}
    
    checkWin();
}

function undoMove() {
    if (moveHistory.length === 0) return;
    
    const lastMove = moveHistory.pop();
    tubes[lastMove.to].pop();
    tubes[lastMove.from].push(lastMove.ball);
    moves--;
    updateMoves();
    renderTubes();
}

function addTube() {
    if (extraTubeUsed) {
        tg.showAlert('Extra tube already used!');
        return;
    }

    // Sirf Monetag ka Rewarded Popup
    try {
        window.TelegramAdsController.showRewardedPopup().then(() => {
            // Ad poora dekha = Tube de do
            tubes.push([]);
            extraTubeUsed = true;
            renderTubes();
            tg.showAlert('Extra tube added! 🎉');
        }).catch(() => {
            // Skip kiya ya fail hua
            tg.showAlert('Ad poora dekho tabhi tube milegi!');
        });
    } catch(e) {
        tg.showAlert('Ads load nahi hue. 5 sec baad try karo!');
    }
}

function updateMoves() {
    document.getElementById('moveCount').textContent = moves;
}

function checkWin() {
    const isWin = tubes.every(tube => 
        tube.length === 0 || (tube.length === 4 && tube.every(b => b === tube[0]))
    );
    
    if (isWin) {
        setTimeout(winLevel, 500);
    }
}

function winLevel() {
    try { tg.HapticFeedback.notificationOccurred('success'); } catch(e) {}

    if (currentLevel === maxUnlocked && currentLevel < 100) {
        maxUnlocked++;
        saveGame();
    }

    // Har 2 level pe ad dikhao
    if (currentLevel % 2 === 0 && canShowAd) {
        canShowAd = false;
        setTimeout(() => { canShowAd = true; }, 30000); // 30 sec cooldown
        
        // 1. Pehle RichAds try karo
        try {
            window.TelegramAdsController.triggerInterstitialBanner()
                .then(() => {
                    console.log('RichAds dikh gaya');
                    showLevelSelect();
                })
                .catch(() => {
                    // 2. RichAds fail → Monetag chalao
                    console.log('RichAds fail, Monetag try kar raha...');
                    try {
                        window.MonetagAds.showInAppInterstitial()
                            .then(() => {
                                console.log('Monetag dikh gaya');
                                showLevelSelect();
                            })
                            .catch(showLevelSelect);
                    } catch(e) {
                        showLevelSelect();
                    }
                });
        } catch(e) {
            // RichAds error → Seedha Monetag
            try {
                window.MonetagAds.showInAppInterstitial()
                    .then(showLevelSelect)
                    .catch(showLevelSelect);
            } catch(e) {
                showLevelSelect();
            }
        }
        
    } else {
        showLevelSelect();
    }
}

function nextLevel() {
    if (currentLevel < 100) { 
        currentLevel++; 
        startLevel(currentLevel); 
    } else { 
        tg.showAlert('🏆 All 100 Levels Complete! You Are A Master!'); 
        showHome(); 
    }
}

function restartLevel() {
    generateLevel(currentLevel);
}

function showHome() {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('homeScreen').classList.add('active');
    try { tg.BackButton.hide(); } catch(e) {}
}

function showLevelSelect() {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('levelScreen').classList.add('active'); 
    renderLevelGrid();
    try { tg.BackButton.show(); } catch(e) {}
}

function renderLevelGrid() {
    const grid = document.getElementById('levelGrid'); 
    grid.innerHTML = '';
    for (let i = 1; i <= 100; i++) {
        const btn = document.createElement('div'); 
        btn.className = 'level-btn'; 
        btn.textContent = i;
        if (i <= maxUnlocked) { 
            btn.className += ' unlocked'; 
            if (i === currentLevel) btn.className += ' current'; 
            btn.onclick = () => startLevel(i); 
        } else { 
            btn.className += ' locked'; 
        }
        grid.appendChild(btn);
    }
}

function startLevel(lvl) {
    currentLevel = lvl; 
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('gameScreen').classList.add('active'); 
    try { tg.BackButton.show(); } catch(e) {}
    setTimeout(() => generateLevel(lvl), 100);
}

function saveGame() {
    try { 
        localStorage.setItem('ballSort100', JSON.stringify({ maxUnlocked })); 
        tg.CloudStorage.setItem('maxLevel', maxUnlocked.toString());
    } catch(e) {}
}

function loadGame() {
    try {
        const saved = localStorage.getItem('ballSort100');
        if (saved) maxUnlocked = JSON.parse(saved).maxUnlocked || 1;
        
        tg.CloudStorage.getItem('maxLevel', (err, val) => {
            if (!err && val) maxUnlocked = Math.max(maxUnlocked, parseInt(val));
        });
    } catch(e) {}
}

loadGame();
try { 
    tg.BackButton.onClick(() => {
        if (document.getElementById('gameScreen').classList.contains('active')) {
            showLevelSelect();
        } else if (document.getElementById('levelScreen').classList.contains('active')) {
            showHome();
        }
    }); 
} catch(e) {}

// Banner ad on start
setTimeout(() => {
    try {
        window.TelegramAdsController.triggerBanner();
    } catch(e) {}
}, 1000);
