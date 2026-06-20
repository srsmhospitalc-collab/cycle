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
let arrows = [], lives = 3, gameArea = null;

const LEVELS = {
    1: [
        {x: 90, y: 150, dir: 0, size: 'small', length: 75},
        {x: 190, y: 130, dir: 90, size: 'small', length: 75},
        {x: 210, y: 230, dir: 180, size: 'small', length: 75},
        {x: 110, y: 250, dir: 270, size: 'small', length: 75}
    ],
    2: [
        {x: 70, y: 120, dir: 0, size: 'medium', length: 110},
        {x: 200, y: 90, dir: 90, size: 'large', length: 150, zigzag: true},
        {x: 180, y: 240, dir: 180, size: 'small', length: 85},
        {x: 100, y: 210, dir: 270, size: 'medium', length: 100},
        {x: 140, y: 170, dir: 45, size: 'small', length: 70}
    ],
    3: [
        {x: 50, y: 80, dir: 0, size: 'large', length: 170, zigzag: true},
        {x: 240, y: 70, dir: 90, size: 'large', length: 180, zigzag: true},
        {x: 200, y: 210, dir: 180, size: 'medium', length: 120},
        {x: 80, y: 190, dir: 270, size: 'medium', length: 115},
        {x: 120, y: 150, dir: 30, size: 'small', length: 75},
        {x: 220, y: 250, dir: 315, size: 'large', length: 160, zigzag: true}
    ],
    4: [
        {x: 60, y: 100, dir: 0, size: 'medium', length: 110},
        {x: 190, y: 80, dir: 90, size: 'large', length: 185, zigzag: true},
        {x: 170, y: 230, dir: 180, size: 'large', length: 155, zigzag: true},
        {x: 70, y: 210, dir: 270, size: 'small', length: 80},
        {x: 130, y: 165, dir: 35, size: 'medium', length: 100},
        {x: 230, y: 185, dir: 125, size: 'small', length: 70},
        {x: 110, y: 250, dir: 215, size: 'large', length: 145, zigzag: true}
    ],
    5: [
        {x: 50, y: 90, dir: 0, size: 'large', length: 175, zigzag: true},
        {x: 250, y: 80, dir: 90, size: 'large', length: 190, zigzag: true},
        {x: 210, y: 240, dir: 180, size: 'large', length: 165, zigzag: true},
        {x: 60, y: 220, dir: 270, size: 'medium', length: 125},
        {x: 120, y: 140, dir: 15, size: 'small', length: 80},
        {x: 200, y: 150, dir: 135, size: 'medium', length: 105},
        {x: 100, y: 200, dir: 225, size: 'small', length: 75},
        {x: 180, y: 100, dir: 300, size: 'large', length: 140, zigzag: true}
    ]
};

function generateLevel(lvl) {
    if(LEVELS[lvl]) {
        arrows = LEVELS[lvl].map((a, i) => ({
           ...a, 
            id: i, 
            removed: false, 
            originalX: a.x, 
            originalY: a.y,
            moving: false
        }));
    } else {
        const count = Math.min(5 + Math.floor(lvl/4), 15);
        arrows = [];
        const sizes = ['small', 'medium', 'large'];
        
        for(let i = 0; i < count; i++) {
            const size = sizes[Math.floor(Math.random()*3)];
            const length = size === 'small'? 65 + Math.random()*35 : 
                          size === 'medium'? 100 + Math.random()*50 : 
                          140 + Math.random()*70;
            
            arrows.push({
                id: i,
                x: 35 + Math.random() * 270,
                y: 35 + Math.random() * 270,
                dir: Math.floor(Math.random() * 12) * 30,
                size: size,
                length: length,
                zigzag: size === 'large' && Math.random() > 0.25,
                removed: false,
                originalX: 0,
                originalY: 0,
                moving: false
            });
            arrows[i].originalX = arrows[i].x;
            arrows[i].originalY = arrows[i].y;
        }
    }
    lives = 3;
    updateLives();
    renderArrows();
}

function renderArrows() {
    gameArea = document.getElementById('gameArea');
    gameArea.innerHTML = '';
    
    arrows.forEach(arrow => {
        if(arrow.removed) return;
        
        const el = document.createElement('div');
        el.className = `arrow ${arrow.size}${arrow.zigzag?' zigzag':''}`;
        el.id = 'arrow-' + arrow.id;
        el.style.left = arrow.x + 'px';
        el.style.top = arrow.y + 'px';
        el.style.width = arrow.length + 'px';
        el.style.transform = `rotate(${arrow.dir}deg)`;
        
        el.onclick = () => shootArrow(arrow.id);
        gameArea.appendChild(el);
    });
    
    document.getElementById('levelNum').textContent = currentLevel;
}

function shootArrow(id) {
    const arrow = arrows.find(a => a.id === id);
    if(!arrow || arrow.removed || arrow.moving) return;
    
    arrow.moving = true;
    const el = document.getElementById('arrow-' + id);
    el.classList.add('moving');
    
    const radians = arrow.dir * Math.PI / 180;
    const moveDistance = 800;
    const newX = arrow.x + Math.cos(radians) * moveDistance;
    const newY = arrow.y + Math.sin(radians) * moveDistance;
    
    el.style.left = newX + 'px';
    el.style.top = newY + 'px';
    
    let collided = false;
    const checkInterval = setInterval(() => {
        if(!arrow.moving) {
            clearInterval(checkInterval);
            return;
        }
        
        const rect = el.getBoundingClientRect();
        const gameRect = gameArea.getBoundingClientRect();
        
        const baseX = rect.left - gameRect.left;
        const baseY = rect.top - gameRect.top + rect.height/2;
        const tipX = baseX + Math.cos(radians) * arrow.length;
        const tipY = baseY + Math.sin(radians) * arrow.length;
        
        for(let other of arrows) {
            if(other.id === arrow.id || other.removed || other.moving) continue;
            
            const oRad = other.dir * Math.PI / 180;
            const ox1 = other.x;
            const oy1 = other.y;
            const ox2 = other.x + Math.cos(oRad) * other.length;
            const oy2 = other.y + Math.sin(oRad) * other.length;
            
            if(linesIntersect(baseX, baseY, tipX, tipY, ox1, oy1, ox2, oy2, 18)) {
                collided = true;
                clearInterval(checkInterval);
                
                el.classList.remove('moving');
                el.classList.add('returning');
                el.style.left = arrow.originalX + 'px';
                el.style.top = arrow.originalY + 'px';
                
                setTimeout(() => {
                    el.classList.remove('returning');
                    arrow.moving = false;
                }, 450);
                
                loseLife();
                try { tg.HapticFeedback.notificationOccurred('error'); } catch(e) {}
                return;
            }
        }
        
        if(rect.left > gameRect.right + 60 || rect.right < gameRect.left - 60 || 
           rect.top > gameRect.bottom + 60 || rect.bottom < gameRect.top - 60) {
            clearInterval(checkInterval);
            if(!collided) {
                arrow.removed = true;
                el.classList.add('removed');
                arrow.moving = false;
                try { tg.HapticFeedback.notificationOccurred('success'); } catch(e) {}
                checkWin();
            }
        }
    }, 16);
    
    setTimeout(() => {
        clearInterval(checkInterval);
        if(arrow.moving &&!arrow.removed &&!collided) {
            arrow.removed = true;
            el.classList.add('removed');
            arrow.moving = false;
            checkWin();
        }
    }, 850);
}

function linesIntersect(x1, y1, x2, y2, x3, y3, x4, y4, threshold) {
    const dx1 = x2 - x1, dy1 = y2 - y1;
    const dx2 = x4 - x3, dy2 = y4 - y3;
    const denominator = dy2 * dx1 - dx2 * dy1;
    
    if(Math.abs(denominator) < 0.01) {
        const dist = pointToSegmentDistance(x1, y1, x3, y3, x4, y4);
        return dist < threshold;
    }
    
    const ua = (dx2 * (y1 - y3) - dy2 * (x1 - x3)) / denominator;
    const ub = (dx1 * (y1 - y3) - dy1 * (x1 - x3)) / denominator;
    
    if(ua >= -0.05 && ua <= 1.05 && ub >= -0.05 && ub <= 1.05) {
        const ix = x1 + ua * dx1;
        const iy = y1 + ua * dy1;
        const dist = pointToSegmentDistance(ix, iy, x3, y3, x4, y4);
        return dist < threshold;
    }
    return false;
}

function pointToSegmentDistance(px, py, x1, y1, x2, y2) {
    const A = px - x1, B = py - y1, C = x2 - x1, D = y2 - y1;
    const dot = A * C + B * D, lenSq = C * C + D * D;
    let param = lenSq!== 0? dot / lenSq : -1;
    let xx, yy;
    if(param < 0) { xx = x1; yy = y1; }
    else if(param > 1) { xx = x2; yy = y2; }
    else { xx = x1 + param * C; yy = y1 + param * D; }
    const dx = px - xx, dy = py - yy;
    return Math.sqrt(dx * dx + dy * dy);
}

function loseLife() {
    lives--;
    updateLives();
    const livesEl = document.getElementById('livesDisplay');
    livesEl.classList.add('lost');
    setTimeout(() => livesEl.classList.remove('lost'), 300);
    
    if(lives <= 0) {
        setTimeout(() => {
            tg.showAlert('Game Over! 💔 Try Again');
            restartLevel();
        }, 500);
    }
}

function updateLives() {
    document.getElementById('livesDisplay').textContent = '❤️'.repeat(Math.max(0, lives));
}

function checkWin() {
    const remaining = arrows.filter(a =>!a.removed).length;
    if(remaining === 0) {
        setTimeout(winLevel, 400);
    }
}

function winLevel() {
    try { tg.HapticFeedback.notificationOccurred('success'); } catch(e) {}
    
    if(currentLevel === maxUnlocked && currentLevel < 100) {
        maxUnlocked++; 
        saveGame();
    }

    if(currentLevel % 2 === 0 && canShowAd) {
        canShowAd = false;
        setTimeout(() => { canShowAd = true; }, 30000);
        try {
            window.TelegramAdsController.triggerInterstitialBanner().then(nextLevelLoad).catch(nextLevelLoad);
        } catch(e) { nextLevelLoad(); }
    } else {
        nextLevelLoad();
    }
}

function nextLevelLoad() {
    if(currentLevel < 100) { 
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

function showHint() {
    const remaining = arrows.filter(a =>!a.removed);
    if(remaining.length === 0) return;
    
    // Rewarded Ad for hint
    try {
        window.TelegramAdsController.triggerRewardedBanner().then(() => {
            tg.showAlert(`Hint: ${remaining.length} arrows left! Find the one that won't collide.`);
        }).catch(() => {
            tg.showAlert(`Hint: ${remaining.length} arrows left! Find the one that won't collide.`);
        });
    } catch(e) {
        tg.showAlert(`Hint: ${remaining.length} arrows left! Find the one that won't collide.`);
    }
}

function showSettings() {
    tg.showAlert('Settings coming soon!');
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
    for(let i = 1; i <= 100; i++) {
        const btn = document.createElement('div'); 
        btn.className = 'level-btn'; 
        btn.textContent = i;
        if(i <= maxUnlocked) { 
            btn.className += ' unlocked'; 
            if(i === currentLevel) btn.className += ' current'; 
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
        localStorage.setItem('arrowEscape100', JSON.stringify({ maxUnlocked: maxUnlocked })); 
        tg.CloudStorage.setItem('maxLevel', maxUnlocked.toString());
    } catch(e) {}
}

function loadGame() {
    try {
        const saved = localStorage.getItem('arrowEscape100');
        if(saved) maxUnlocked = JSON.parse(saved).maxUnlocked || 1;
        
        tg.CloudStorage.getItem('maxLevel', (err, val) => {
            if(!err && val) maxUnlocked = Math.max(maxUnlocked, parseInt(val));
        });
    } catch(e) {}
}

loadGame();
try { 
    tg.BackButton.onClick(() => {
        if(document.getElementById('gameScreen').classList.contains('active')) {
            showLevelSelect();
        } else if(document.getElementById('levelScreen').classList.contains('active')) {
            showHome();
        }
    }); 
} catch(e) {}

// Show banner ad on start
setTimeout(() => {
    try {
        window.TelegramAdsController.triggerBanner();
    } catch(e) {}
}, 1000);
