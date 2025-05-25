// --- Configuración global y laberinto 20×20 (0 = libre, 1 = pared) ---
const cellSize = 50, gridCols = 20, gridRows = 20;
const labyrinth = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1],
  [1,0,1,1,1,0,0,1,0,1,1,1,0,1,0,1,1,1,0,1],
  [1,0,1,0,0,0,1,1,0,1,0,1,0,1,0,0,0,1,0,1],
  [1,0,1,0,1,0,0,0,0,1,0,1,0,1,1,1,0,1,0,1],
  [1,0,1,0,1,1,1,1,0,1,0,1,0,0,0,1,0,1,0,1],
  [1,0,0,0,0,0,0,1,0,0,0,1,1,1,0,1,0,0,0,1],
  [1,1,1,1,1,1,0,1,1,1,0,0,0,1,0,1,1,1,0,1],
  [1,0,0,0,0,1,0,0,0,1,0,1,0,1,0,0,0,1,0,1],
  [1,0,1,1,0,1,1,1,0,1,0,1,0,1,1,1,0,1,0,1],
  [1,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1],
  [1,1,0,1,1,1,0,1,1,1,0,1,1,1,0,1,0,1,1,1],
  [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,1],
  [1,0,1,1,1,1,1,1,0,1,1,1,1,1,0,1,1,1,0,1],
  [1,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,1,0,1],
  [1,1,1,1,1,1,0,1,1,1,1,1,0,1,1,1,0,1,0,1],
  [1,0,0,0,0,1,0,0,0,0,0,1,0,0,0,1,0,0,0,1],
  [1,0,1,1,0,1,1,1,1,1,0,1,1,1,0,1,1,1,0,1],
  [1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

// --- Estado del jugador ---
let player = { x: 1.5 * cellSize, z: 1.5 * cellSize, speed: 2, angle: 0 };

// --- Enemigos/Sprites ---
let enemies = [];

// --- Rutas a imágenes de enemigos ---
const ASSETS = {
  casual:      'noboa-casual.png',
  deportivo:   'noboa-deportivo.png',
  presidencial:'noboa-presidencial.png'
};
let images = {};

// Precarga de PNGs
function preload() {
  for (let key in ASSETS) {
    images[key] = loadImage(ASSETS[key]);
  }
}

// Inicialización: canvas y generación de enemigos
function setup() {
  createCanvas(800, 600).parent('game-container');
  imageMode(CENTER);

  // Genera enemigos en celdas libres con probabilidad 5%
  for (let r = 1; r < gridRows - 1; r++) {
    for (let c = 1; c < gridCols - 1; c++) {
      if (labyrinth[r][c] === 0 && random() < 0.05) {
        enemies.push(new Enemy((c + 0.5) * cellSize, (r + 0.5) * cellSize));
      }
    }
  }
}

// Bucle principal: input, render, actualización de enemigos
function draw() {
  handleMovement();   // WASD + strafing
  handleRotation();   // ←/→ flechas
  background(100);
  drawScene();        // Raycasting de paredes

  // Actualiza y dibuja cada enemigo en 3D
  for (let e of enemies) {
    e.update();
    e.draw3D();
  }
}

// --- Clase Enemy: movimiento y dibujo de sprite --- 
class Enemy {
  constructor(x, z) {
    this.x = x;
    this.z = z;
    // Dirección y velocidad aleatorias
    const d = random([[1,0],[-1,0],[0,1],[0,-1]]);
    this.dx = d[0];
    this.dz = d[1];
    this.speed = random(0.5, 1.5);
    // Tipo e imagen asignada aleatoriamente
    const tipos = Object.keys(images);
    this.tipo = random(tipos);
    this.img = images[this.tipo];
  }
  update() {
    // Mueve y rebota con colisiones
    const nx = this.x + this.dx * this.speed;
    const nz = this.z + this.dz * this.speed;
    if (collides(nx, nz)) {
      this.dx *= -1;
      this.dz *= -1;
    } else {
      this.x = nx;
      this.z = nz;
    }
  }
  draw3D() {
    // Proyección pseudo‐3D tipo billboard
    const relX = this.x - player.x;
    const relZ = this.z - player.z;
    const dirX = sin(player.angle), dirZ = -cos(player.angle);
    const planeX = dirZ * 0.66, planeZ = -dirX * 0.66;
    const inv = 1 / (planeX * dirZ - dirX * planeZ);
    const tx = inv * (dirZ * relX - dirX * relZ);
    const ty = inv * (-planeZ * relX + planeX * relZ);
    if (ty <= 0) return;
    const sx = (width / 2) * (1 + tx / ty);
    const size = constrain(500 / ty, 20, height);

    push();
      imageMode(CENTER);
      image(this.img, sx, height / 2, size, size);
    pop();
  }
}

// --- Colisión con paredes ---
function collides(x, z) {
  const c = floor(x / cellSize),
        r = floor(z / cellSize);
  return r < 0 || r >= gridRows || c < 0 || c >= gridCols || labyrinth[r][c] === 1;
}

// --- Input: WASD con strafing ---
function handleMovement() {
  const m = player.speed;
  let dx = 0, dz = 0;
  if (keyIsDown(87)) { dx += sin(player.angle) * m; dz += -cos(player.angle) * m; } // W
  if (keyIsDown(83)) { dx -= sin(player.angle) * m; dz -= -cos(player.angle) * m; } // S
  if (keyIsDown(65)) { // A strafe izquierda
    dx += sin(player.angle - HALF_PI) * m;
    dz += -cos(player.angle - HALF_PI) * m;
  }
  if (keyIsDown(68)) { // D strafe derecha
    dx += sin(player.angle + HALF_PI) * m;
    dz += -cos(player.angle + HALF_PI) * m;
  }
  const nx = player.x + dx,
        nz = player.z + dz;
  if (!collides(nx, nz)) {
    player.x = nx;
    player.z = nz;
  }
}

// --- Input: rotación con flechas ---
function handleRotation() {
  const r = 0.03;
  if (keyIsDown(LEFT_ARROW))  player.angle += r;
  if (keyIsDown(RIGHT_ARROW)) player.angle -= r;
}

// --- Raycasting: dibujar paredes en pseudo‐3D ---
function drawScene() {
  noStroke();
  // Cielo y suelo
  fill(135,206,235); rect(0, 0, width, height/2);
  fill(50); rect(0, height/2, width, height/2);

  for (let x = 0; x < width; x++) {
    const camX = 2 * x / width - 1;
    const dirX = sin(player.angle), dirZ = -cos(player.angle);
    const planeX = dirZ * 0.66, planeZ = -dirX * 0.66;
    let rayX = dirX + planeX * camX,
        rayZ = dirZ + planeZ * camX;
    let px = player.x / cellSize, pz = player.z / cellSize;
    let mx = floor(px), mz = floor(pz);
    const dX = rayX === 0 ? 1e30 : abs(1 / rayX),
          dZ = rayZ === 0 ? 1e30 : abs(1 / rayZ);
    let sX, sZ, sdX, sdZ;
    if (rayX < 0) { sX = -1; sdX = (px - mx) * dX; }
    else          { sX = 1;  sdX = (mx + 1 - px) * dX; }
    if (rayZ < 0) { sZ = -1; sdZ = (pz - mz) * dZ; }
    else          { sZ = 1;  sdZ = (mz + 1 - pz) * dZ; }

    let hit = 0, side;
    while (!hit) {
      if (sdX < sdZ) { sdX += dX; mx += sX; side = 0; }
      else            { sdZ += dZ; mz += sZ; side = 1; }
      if (mx < 0 || mx >= gridCols || mz < 0 || mz >= gridRows) { hit = 1; break; }
      if (labyrinth[mz][mx] === 1) hit = 1;
    }

    let perp = side === 0
      ? (mx - px + (1 - sX) / 2) / rayX
      : (mz - pz + (1 - sZ) / 2) / rayZ;
    perp = perp <= 0 ? 0.1 : perp;
    const h = floor(height / perp),
          y0 = max(-h/2 + height/2, 0),
          y1 = min(h/2 + height/2, height),
          col = side 
              ? lerpColor(color(139,69,19), color(0), 0.5) 
              : color(139,69,19);
    stroke(col);
    line(x, y0, x, y1);
  }
}
