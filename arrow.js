const boardEl = document.getElementById('board');
const levelEl = document.getElementById('level');
const movesEl = document.getElementById('moves');
const winModal = document.getElementById('winModal');

let level = 1, moves = 0;
let arrows = [];

const levels = [
  {walls:[[2,2],[2,3],[3,2]], arrows:[{x:0,y:0,dir:'→'},{x:0,y:5,dir:'↑'}], exit:[5,5]},
  {walls:[[1,1],[1,2],[3,3],[4,3]], arrows:[{x:0,y:2,dir:'→'},{x:5,y:0,dir:'↓'},{x:2,y:5,dir:'→'}], exit:[5,5]},
  {walls:[[2,1],[2,2],[2,4],[4,2]], arrows:[{x:0,y:0,dir:'→'},{x:0,y:3,dir:'→'},{x:5,y:1,dir:'←'}], exit:[5,2]},
  {walls:[[1,3],[2,3],[3,1],[3,2]], arrows:[{x:0,y:0,dir:'↓'},{x:5,y:5,dir:'←'},{x:0,y:4,dir:'→'}], exit:[3,5]}
];

function initLevel(){
  const data = levels[(level-1)%levels.length];
  boardEl.innerHTML='';
  arrows = JSON.parse(JSON.stringify(data.arrows));
  
  for(let y=0;y<6;y++){
    for(let x=0;x<6;x++){
      const cell = document.createElement('div');
      cell.className='cell';
      cell.dataset.x=x; cell.dataset.y=y;
      
      // wall
      if(data.walls.some(([wx,wy])=>wx===x && wy===y)){
        cell.classList.add('wall');
        cell.innerHTML='█';
      }
      // exit
      if(data.exit[0]==x && data.exit[1]==y){
        cell.classList.add('exit');
        cell.innerHTML='◍';
      }
      // arrow
      const arrow = arrows.find(a=>a.x==x && a.y==y);
      if(arrow){
        cell.classList.add('arrow');
        cell.innerHTML=arrow.dir;
      }
      cell.onclick=()=>handleMove(x,y);
      boardEl.appendChild(cell);
    }
  }
  levelEl.innerText=level;
  movesEl.innerText=moves;
}

function handleMove(x,y){
  const arrow = arrows.find(a=>a.x==x && a.y==y);
  if(!arrow) return;
  const dirs = ['→','↓','←','↑'];
  arrow.dir = dirs[(dirs.indexOf(arrow.dir)+1)%4];
  moves++;
  movesEl.innerText=moves;
  refreshBoard();
  checkWin();
}

function refreshBoard(){
  [...boardEl.children].forEach(c=>{
    const isWall = c.classList.contains('wall');
    const isExit = c.classList.contains('exit');
    c.classList.remove('arrow');
    if(!isWall && !isExit) c.innerHTML='';
  });
  arrows.forEach(a=>{
    const cell = [...boardEl.children].find(c=>c.dataset.x==a.x && c.dataset.y==a.y);
    cell.classList.add('arrow');
    cell.innerHTML=a.dir;
  });
}

function checkWin(){
  // Demo win logic - 4 moves ke baad win maan rahe hain, tu apna logic laga sakta hai
  if(moves >= 4){
    winModal.classList.add('show');
    
    // --- AD 1: LEVEL COMPLETE PE - MAIN EARNING ---
    // Har 2 level baad interstitial
    if(level % 2 == 0){
      showAd();
    }
  }
}

// --- AD 2: NEXT LEVEL BUTTON PE ---
document.getElementById('nextBtn').onclick=()=>{
  winModal.classList.remove('show');
  level++; moves=0;
  initLevel();
  if(Math.random() > 0.7){
    showAd(); // 30% chance pe ad
  }
};

// --- AD 3: HINT BUTTON PE ---
document.getElementById('hintBtn').onclick=()=>{
  showAd(); // Hint ke liye ad dikhao
  setTimeout(()=>{ 
    alert("Hint: Arrow ko Exit ki taraf ghumao! → ko ↓ bana ke try kar");
  },600);
};

document.getElementById('resetBtn').onclick=()=>{
  moves=0;
  initLevel();
};

initLevel();
