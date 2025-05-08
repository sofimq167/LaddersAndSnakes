// -------------------------------------------
// Sofia Moreno Quintero y Julian Fuentes

// ------------------- CONFIGURACIÓN INICIAL -------------------
let numPlayers = 2;

const gridSize = 10;
const cellSize = 2;
const totalCells = gridSize * gridSize;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

document.addEventListener('DOMContentLoaded', function() {
  const backgroundMusic = document.getElementById('backgroundMusic');
  backgroundMusic.volume = 0.3;
});

// ------------------- ORBIT CONTROLS -------------------
const controls = new THREE.OrbitControls(camera, renderer.domElement);
const centerX = (gridSize * cellSize) / 2;
const centerZ = -(gridSize * cellSize) / 2;

camera.position.set(10.15, 5.88, 11.15);
controls.target.set(centerX, 0, centerZ);
controls.update();

//Background

const backgroundTexture = new THREE.TextureLoader().load('./src/textures/woods.jpg');
scene.background = backgroundTexture;

// ------------------- ILUMINACIÓN -------------------
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambientLight);
const pointLight = new THREE.PointLight(0xffffff, 1);
pointLight.position.set(10, 20, 10);
scene.add(pointLight);

// ------------------- CREAR TABLERO -------------------
const board = [];

const laddersAndSnakes = {
  // Escaleras
  2: 22,     
  6: 11,     
  14: 53,   
  30: 48, 
  38: 63,
  52: 72,
  70: 92,

  // Serpientes
  19: 3,
  49: 13,
  46: 28,
  61: 45,
  76: 54,
  87: 32,
  98: 41
};

const loader = new THREE.TextureLoader();
const textureStone = loader.load('./src/textures/piso_piedra.jpg');
const textureGrass = loader.load('./src/textures/grass.jpg');

for (let y = 0; y < gridSize; y++) {
  for (let x = 0; x < gridSize; x++) {
    const index = y * gridSize + (y % 2 === 0 ? x : (gridSize - 1 - x));
    const geometry = new THREE.BoxGeometry(cellSize, 0.2, cellSize);

    const selectedTexture = (x + y) % 2 === 0 ? textureStone : textureGrass;
    const material = new THREE.MeshBasicMaterial({ map: selectedTexture });

    const cell = new THREE.Mesh(geometry, material);
    cell.position.set(x * cellSize, 0, -y * cellSize);
    scene.add(cell);
    board[index] = cell.position.clone();
  }
}

// ------------------- FUNCIÓN PARA SONIDOS -------------------
function playWinSound() {
  try {
    const winSound = document.getElementById('winSound');
    if (winSound) {
      winSound.currentTime = 0;
      winSound.play();
    }
  } catch (error) {
    console.warn('No se pudo reproducir el sonido de victoria:', error);
  }
}

function playDiceSound() {
  try {
    const diceSound = document.getElementById('diceSound');
    if (diceSound) {
      diceSound.currentTime = 0;
      diceSound.playbackRate = 0.7;
      diceSound.play();
    }
  } catch (error) {
    console.warn('No se pudo reproducir el sonido de dados:', error);
  }
}

function playLadderSound() {
  try {
    const ladderSound = document.getElementById('ladderSound');
    if (ladderSound) {
      ladderSound.currentTime = 0;
      ladderSound.play();
    }
  } catch (error) {
    console.warn('No se pudo reproducir el sonido de escalera:', error);
  }
}

function playSnakeSound() {
  try {
    const snakeSound = document.getElementById('snakeSound');
    if (snakeSound) {
      snakeSound.currentTime = 0;
      snakeSound.play();
    }
  } catch (error) {
    console.warn('No se pudo reproducir el sonido de serpiente:', error);
  }
}


// ------------------- CREAR MODELOS -------------------
function loadModel(objPath, mtlPath, callback) {
  const objLoader = new THREE.OBJLoader();
  const mtlLoader = new THREE.MTLLoader();
  
  mtlLoader.load(mtlPath, (mtl) => {
    mtl.preload();
    objLoader.setMaterials(mtl);
    objLoader.load(objPath, (model) => {
      callback(model);
    });
  });
}

// ------------------- CARGAR MODELO DEL COFRE -------------------
let treasureChest;
loadModel(
  './src/3d_model/chest.obj',
  './src/3d_model/chest.mtl',
  function(model) {
    model.scale.set(50, 50, 50);
    const finalPosition = board[99];
    if (finalPosition) {
      model.position.set(finalPosition.x, 1.5, finalPosition.z);
    } else {
      model.position.set(0, 1.5, -(gridSize - 1) * cellSize);
    }
    model.rotation.y = Math.PI / 4;
    
    treasureChest = model;
    scene.add(treasureChest);
  }
);
// ------------------- CREAR JUGADORES -------------------
// Cargar player1 (Link)
let player1;
loadModel(
  './src/3d_model/Player/link.obj',
  './src/3d_model/Player/link.mtl',
  function(model) {
    model.scale.set(50, 50, 50);
    model.position.set(0, 1.5, 0.5);
    player1 = model;
    scene.add(player1);
  }
);
// Cargar player2 (Zelda)
let player2;
loadModel(
  './src/3d_model/Player/zelda.obj',
  './src/3d_model/Player/zelda.mtl',
  function(model) {
    model.scale.set(50, 50, 50);
    model.position.set(0, 1.6, 2);
    player2 = model;
    // scene.add(player2);
  }
);

// ------------------- CARGAR MODELO DE SERPIENTE -------------------
let snake1;
loadModel(
  './src/3d_model/snakes/psnake.obj',
  './src/3d_model/snakes/psnake.mtl',
  function(model) {
    model.scale.set(50, 50, 50);
    model.position.set(3.2, 3.4, -1);
    model.rotation.y = Math.PI / 3;
    snake1 = model;
    scene.add(snake1);
  }
);

let snake2;
loadModel(
  './src/3d_model/snakes/asnake.obj',
  './src/3d_model/snakes/asnake.mtl',
  function(model) {
    model.scale.set(50, 50, 50);
    model.position.set(6, 5.5, -10);
    model.rotation.y = Math.PI / 3;
    snake2 = model;
    scene.add(snake2);
  }
);
let snake3;
loadModel(
  './src/3d_model/snakes/asnake.obj',
  './src/3d_model/snakes/asnake.mtl',
  function(model) {
    model.scale.set(50, 50, 50);
    model.position.set(14, 5.5, -11);
    model.rotation.y = Math.PI*2;
    snake3 = model;
    scene.add(snake3);
  }
);

let snake4;
loadModel(
  './src/3d_model/snakes/psnake.obj',
  './src/3d_model/snakes/psnake.mtl',
  function(model) {
    model.scale.set(50, 50, 50);
    model.position.set(14, 3.4, -5.5);
    model.rotation.y = Math.PI / 4;
    snake4 = model;
    scene.add(snake4);
  }
);

let snake5;
loadModel(
  './src/3d_model/snakes/asnake.obj',
  './src/3d_model/snakes/asnake.mtl',
  function(model) {
    model.scale.set(50, 50, 50);
    model.position.set(15, 5.5, -5.3);
    model.rotation.y = Math.PI/-4;
    snake5 = model;
    scene.add(snake5);
  }
);

let snake6;
loadModel(
  './src/3d_model/snakes/asnake.obj',
  './src/3d_model/snakes/asnake.mtl',
  function(model) {
    model.scale.set(50, 50, 50);
    model.position.set(2, 5.5, -12.8);
    model.rotation.y = Math.PI*2;
    snake6 = model;
    scene.add(snake6);
  }
);

let snake7;
loadModel(
  './src/3d_model/snakes/psnake.obj',
  './src/3d_model/snakes/psnake.mtl',
  function(model) {
    model.scale.set(50, 50, 50);
    model.position.set(8, 3.4, -12);
    model.rotation.y = Math.PI / 4;
    snake7 = model;
    scene.add(snake7);
  }
);

// ------------------- CARGAR MODELO DE ESCALERA -------------------
let stairs1;
loadModel(
  './src/3d_model/stairs/stairs.obj',
  './src/3d_model/stairs/stairs.mtl',
  function(model) {
    model.scale.set(12, 13, 13);
    model.position.set(4.1, 0.5, -2);
    model.rotation.y = Math.PI / 2;
    //model.rotation.x = Math.PI / 2;
    stairs1 = model;
    scene.add(stairs1);
  }
);

let stairs2;
loadModel(
  './src/3d_model/stairs/stairs.obj',
  './src/3d_model/stairs/stairs.mtl',
  function(model) {
    model.scale.set(12, 13, 13);
    model.position.set(14, 0.5, -0.7);
    model.rotation.y = Math.PI / 6;
    stairs2 = model;
    scene.add(stairs2);
  }
);

let stairs3;
loadModel(
  './src/3d_model/stairs/mid_stairs.obj',
  './src/3d_model/stairs/mid_stairs.mtl',
  function(model) {
    model.scale.set(24, 24, 24);
    model.position.set(11.4, 0.5, -5.9);
    model.rotation.y = Math.PI / 2.38;
    stairs3 = model;
    scene.add(stairs3);
  }
);

let stairs4;
loadModel(
  './src/3d_model/stairs/stairs.obj',
  './src/3d_model/stairs/stairs.mtl',
  function(model) {
    model.scale.set(9, 13, 13);
    model.position.set(17, 0.5, -7);
    model.rotation.y = Math.PI *2/3;
    stairs4 = model;
    scene.add(stairs4);
  }
);

let stairs5;
loadModel(
  './src/3d_model/stairs/mid_stairs.obj',
  './src/3d_model/stairs/mid_stairs.mtl',
  function(model) {
    model.scale.set(20, 24, 24);
    model.position.set(4.3, 0.5, -9);
    model.rotation.y = Math.PI / 3.3;
    stairs5 = model;
    scene.add(stairs5);
  }
);

let stairs6;
loadModel(
  './src/3d_model/stairs/stairs.obj',
  './src/3d_model/stairs/stairs.mtl',
  function(model) {
    model.scale.set(13, 13, 13);
    model.position.set(14, 0.5, -12);
    model.rotation.y = Math.PI/2;
    stairs6 = model;
    scene.add(stairs6);
  }
);

let stairs7;
loadModel(
  './src/3d_model/stairs/mid_stairs.obj',
  './src/3d_model/stairs/mid_stairs.mtl',
  function(model) {
    model.scale.set(16, 24, 22);
    model.position.set(16, 0.5, -16);
    model.rotation.y = (Math.PI)*(2.3/3);
    stairs7 = model;
    scene.add(stairs7);
  }
);


// ------------------- POSITIONS -------------------

let positions = [0, 0];
let turn = 0;
let isPlaying = false;


// ------------------- DADO 3D -------------------
const geometry = new THREE.BoxGeometry(1, 1, 1);
const textureLoader = new THREE.TextureLoader();
const materialFaces = [
  new THREE.MeshPhongMaterial({ map: textureLoader.load('./src/img/face4.png'), side: THREE.DoubleSide }), 
  new THREE.MeshPhongMaterial({ map: textureLoader.load('./src/img/face3.png'), side: THREE.DoubleSide }), 
  new THREE.MeshPhongMaterial({ map: textureLoader.load('./src/img/face1.png'), side: THREE.DoubleSide }), 
  new THREE.MeshPhongMaterial({ map: textureLoader.load('./src/img/face6.png'), side: THREE.DoubleSide }), 
  new THREE.MeshPhongMaterial({ map: textureLoader.load('./src/img/face5.png'), side: THREE.DoubleSide }), 
  new THREE.MeshPhongMaterial({ map: textureLoader.load('./src/img/face2.png'), side: THREE.DoubleSide })  
];

const dice = new THREE.Mesh(geometry, materialFaces);
dice.scale.set(2, 2, 2);
dice.position.set(15, 5, -10);
scene.add(dice);

let isRolling = false;
let rollStartTime = 0;
let rollDuration = 2000;
let resultNumber = 0;
let resultShown = false;
const initialDicePosition = new THREE.Vector3(15, 5, -10);

function rollDice() {
  if (isRolling) return;
  dice.visible = true;
  dice.position.copy(initialDicePosition);
  isRolling = true;
  rollStartTime = Date.now();
  resultShown = false;
  resultNumber = Math.floor(Math.random() * 6) + 1;
}

function swapDiceFaces(result) {
  const rotations = {
    1: [0, 0, 0],                   
    2: [Math.PI / 2, 0, 0],         
    3: [0, 0, -Math.PI / 2],        
    4: [0, 0, Math.PI / 2],        
    5: [-Math.PI / 2, 0, 0],        
    6: [Math.PI, 0, 0]
  };

  const [rx, ry, rz] = rotations[result];
  dice.rotation.set(rx, ry, rz);
  resultShown = true;
}

  

function esperarResultadoDado() {
  return new Promise((resolve) => {
    function checkResultado() {
      if (!isRolling && resultShown) {
        resolve(resultNumber);
      } else {
        requestAnimationFrame(checkResultado);
      }
    }
    checkResultado();
  });
}
///////
function showDialog(message) {
  return new Promise((resolve) => {
    document.getElementById('dialogMessage').innerText = message;
    document.getElementById('gameDialog').style.display = 'flex';
    
    const okButton = document.getElementById('dialogOkButton');
    const handleOkClick = () => {
      document.getElementById('gameDialog').style.display = 'none';
      okButton.removeEventListener('click', handleOkClick);
      resolve();
    };
    
    okButton.addEventListener('click', handleOkClick);
  });
}
/////
function movePlayer(player, index) {
  const target = board[index];
  const offsetZ = player === player1 ? 0.5 : -0.5;
  return gsap.to(player.position, {
    x: target.x,
    z: target.z + (player === player1 || numPlayers === 1 ? 0 : offsetZ),
    duration: 1,
    ease: "power1.inOut"
  });
}

function updateScores() {
  document.getElementById('score1').innerText = positions[0];
  document.getElementById('score2').innerText = positions[1];
}

function startGame(players = 2) {
  togglePlayerScores(players);
  numPlayers = players;
  document.getElementById("menu").style.display = "none";
  document.getElementById("rollButton").style.display = "inline-block";
  positions = [0, 0];
  scene.add(player1);
  if (players === 2) scene.add(player2);
  movePlayer(player1, 0);
  if (players === 2) movePlayer(player2, 0);
  updateScores();
  isPlaying = true;
}

document.getElementById("rollButton").addEventListener("click", async () => {
  if (!isPlaying || isRolling) return;
  rollDice();
  playDiceSound();
  const roll = await esperarResultadoDado();
  await showDialog(`Jugador ${turn + 1} tiró un ${roll}`);

  let newIndex = positions[turn] + roll;
  if (newIndex >= totalCells - 1) {
    fireworks.start();
    playWinSound();
    await showDialog(`¡Jugador ${turn + 1} ha ganado!`);
    isPlaying = false;
    return;
  }

  positions[turn] = newIndex;
  const player = turn === 0 ? player1 : player2;
  await movePlayer(player, newIndex);

  if (laddersAndSnakes[newIndex] !== undefined) {
    const nextIndex = laddersAndSnakes[newIndex];
    if (nextIndex > newIndex) {
      playLadderSound(); // sonido de escalera
    } else {
      playSnakeSound(); // sonido de serpiente
    }
    await showDialog((nextIndex > newIndex ? '⬆️ Escalera' : '⬇️ Serpiente') + 
      `: Jugador ${turn + 1} va a la casilla ${nextIndex}`);
    positions[turn] = nextIndex;
    await movePlayer(player, nextIndex);
  }

  updateScores();
  if (numPlayers === 2) turn = 1 - turn;
});


//ANIMATE

function animate() {
  if (isRolling) {
    const elapsed = Date.now() - rollStartTime;
    const progress = elapsed / rollDuration;
    if (progress < 1) {
      dice.rotation.x += 0.1;
      dice.rotation.y += 0.15;
    } else {
      isRolling = false;

      swapDiceFaces(resultNumber);
    }
  }
  controls.update();
  //console.log(`Camera position: x=${camera.position.x.toFixed(2)}, y=${camera.position.y.toFixed(2)}, z=${camera.position.z.toFixed(2)}`);
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();



const container = document.querySelector('.fireworks')
const fireworks = new Fireworks.default(container)
