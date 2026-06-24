const COLORS = ['#ff4757', '#2ed573', '#1e90ff', '#ffa502', '#be2edd', '#ff6b81', '#3742fa', '#ffa502'];
let currentLevel = 1, moves = 0, selectedTube = null, tubes = [];
let unlockedLevels = parseInt(localStorage.getItem('unlockedLevels') || '1');

function init() {
    Telegram.WebApp.ready();
    Telegram.WebApp.expand();
    showScreen('start-screen');

    document.getElementById('play-btn').onclick = () => showLevelSelect();
    document.getElementById('back-btn').onclick = () => showScreen('start-screen');
    document.getElementById('home-btn').onclick = () => showLevelSelect();
    document.getElementById('restart-btn').onclick = () => startLevel(currentLevel);
}

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

function showLevelSelect() {
    showScreen('level-screen');
    renderLevelGrid();
}

function renderLevelGrid() {
    const grid = document.getElementById('levels-grid');
    grid.innerHTML = '';
    document.getElementById('unlocked-count').textContent = `${unlockedLevels}/100`;

    for(let i = 1; i <= 100; i++) {
        const card = document.createElement('div');
        card.className = 'level-card';
        card.textContent = i;

        if(i <= unlockedLevels) {
            card.classList.add('unlocked');
            if(i === currentLevel) card.classList.add('current');
            card.onclick = () => startLevel(i);
        } else {
            card.classList.add('locked');
            card.textContent = '🔒';
        }
        grid.appendChild(card);
    }
}

function startLevel(level) {
    currentLevel = level;
    moves = 0;
    selectedTube = null;
    showScreen('game-screen');
    generateLevel(level);
    renderTubes();
    updateStats();
}

function generateLevel(level) {
    tubes = [];
    let numColors = Math.min(3 + Math.floor(level / 10), 8);
    let ballsPerColor = 4;
    let allBalls = [];

    for(let i = 0; i < numColors; i++) {
        for(let j = 0; j < ballsPerColor; j++) {
            allBalls.push(COLORS[i % COLORS.length]);
        }
    }

    allBalls.sort(() => Math.random() - 0.5);

    for(let i = 0; i < numColors; i++) {
        tubes.push(allBalls.slice(i * ballsPerColor, (i + 1) * ballsPerColor));
    }

    // Extra empty tubes based on level
    let emptyTubes = level < 10 ? 2 : 1;
    for(let i = 0; i < emptyTubes; i++) tubes.push([]);
}

function renderTubes() {
    const container = document.getElementById('tubes-container');
    container.innerHTML = '';

    tubes.forEach((tube, idx) => {
        const tubeEl = document.createElement('div');
        tubeEl.className = 'tube';
        tubeEl.onclick = () => selectTube(idx);

        tube.forEach(color => {
            const ball = document.createElement('div');
            ball.className = 'ball';
            ball.style.backgroundColor = color;
            tubeEl.appendChild(ball);
        });
        container.appendChild(tubeEl);
    });
}

function selectTube(idx) {
    const tubesEl = document.querySelectorAll('.tube');

    if(selectedTube === null) {
        if(tubes[idx].length === 0) return;
        selectedTube = idx;
        tubesEl[idx].classList.add('selected');
    } else {
        if(selectedTube === idx) {
            tubesEl[selectedTube].classList.remove('selected');
            selectedTube = null;
            return;
        }
        moveBall(selectedTube, idx);
        tubesEl[selectedTube].classList.remove('selected');
        selectedTube = null;
    }
}

function moveBall(from, to) {
    if(tubes[from].length === 0) return;
    if(tubes[to].length >= 4) return;

    let ball = tubes[from][tubes[from].length - 1];
    if(tubes[to].length > 0 && tubes[to][tubes[to].length - 1]!== ball) return;

    tubes[from].pop();
    tubes[to].push(ball);
    moves++;
    updateStats();
    renderTubes();
    checkWin();
}

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
            showNativeAd(); // Ad dikhao
            showLevelSelect();
        }, 500);
    }
}

function updateStats() {
    document.getElementById('current-level').textContent = currentLevel;
    document.getElementById('moves').textContent = moves;
}

init();
