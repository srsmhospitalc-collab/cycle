const boardEl = document.getElementById('board');
const levelEl = document.getElementById('level');
const movesEl = document.getElementById('moves');

let level = 1, moves = 0;
let grid = [];
let arrows = [];

const levels = [
  {walls:[[2,2],[2,3],[3,2]], arrows:[{x:0,y:0,dir:'→'},{x:0,y:5,dir:'↑'}], exit:[5,5]},
  {walls:[[1,1],[1,2],[3,3],[4,3]], arrows:[{x:0,y:2,dir:'→'},{x:5,y:0,dir:'↓'},{x:2,y:5,dir:'→'}], exit:[5,5]},
  {walls:[[2,1],[2,2],[2,4],[4,2]], arrows:[{x:0,y:0,dir:'→'},{x:0,y:3,dir:'→'},{x:5,y:1,dir:'←'}], exit:[5,2]}
];

function initLevel(){
  const data = levels[(level-1)%levels.length];
  grid = Array(6).fill().map(()=>Array(6).fill(0));
  boardEl.innerHTML='';
  data.walls.forEach(([x,y])=>grid[y][x]=1);
  arrows = JSON.parse(JSON.stringify(data.arrows));
  
  for(let y=0;y<6;y++){
    for(let x=0;x<6;x++){
      const cell = document.createElement('div');
      cell.className='cell';
      cell.dataset.x=x; cell.dataset.y=y;
      if(grid[y][x]==1){cell.classList.add('wall'); cell.innerHTML='█'}
      if(data.exit[0]==x && data.exit[1]==y){cell.classList.add('exit'); cell.innerHTML='◍'}
      const arrow = arrows.find(a=>a.x==x && a.y==y);
      if(arrow){cell.classList.add('arrow'); cell.innerHTML=arrow.dir}
      cell.onclick=()=>handleMove(x,y);
      boardEl.appendChild(cell);
    }
  }
  levelEl.innerText=level; movesEl.innerText=moves;
}

function handleMove(x,y){
  const arrow = arrows.find(a=>a.x==x && a.y==y);
  if(!arrow) return;
  // rotate arrow
  const dirs = ['→','↓','←','↑'];
  arrow.dir = dirs[(dirs.indexOf(arrow.dir)+1)%4];
  moves++; movesEl.innerText=moves;
  initBoardStateOnly();
  checkWin();
}

function initBoardStateOnly(){
  [...boardEl.children].forEach(c=>{
    c.classList.remove('arrow','path');
    c.innerHTML=c.classList.contains('wall')?'█': c.classList.contains('exit')?'◍':'';
  });
  arrows.forEach(a=>{
    const cell = [...boardEl.children].find(c=>c.dataset.x==a.x && c.dataset.y==a.y);
    cell.classList.add('arrow'); cell.innerHTML=a.dir;
  });
}

function checkWin(){
  // simple win check - all arrows pointing to exit path
  if(moves>=3){ // demo win logic
    document.getElementById('winModal').classList.add('show');
    
    // --- AD TRIGGER 1 : LEVEL COMPLETE PE ---
    if(level % 2 == 0){ showAdexiumAd(); } // Har 2 level baad Interstitial
  }
}

document.getElementById('nextBtn').onclick=()=>{
  document.getElementById('winModal').classList.remove('show');
  level++; moves=0;
  initLevel();
  // --- AD TRIGGER 2 : NEXT LEVEL START PE 30% chance ---
  if(Math.random() > 0.7) showAdexiumAd();
}

document.getElementById('hintBtn').onclick=()=>{
  // --- AD TRIGGER 3 : HINT KE LIYE REWARDED JAISE ---
  showAdexiumAd(); // User hint chahta hai toh ad dikhao
  setTimeout(()=>{ alert("Hint: Ek arrow ko neeche ghumao"); },500);
}

document.getElementById('resetBtn').onclick=()=>{
  moves=0; initLevel();
}

initLevel();
