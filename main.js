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

// Tamaño del enemigo 
const enemyScale = 12.5;

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

  // Generar enemigos en TODAS las celdas libres
  enemies = [];
  for (let r = 1; r < gridRows-1; r++) {
    for (let c = 1; c < gridCols-1; c++) {
      if (labyrinth[r][c] === 0 && random() < 0.05) {
        enemies.push(new Enemy(
          c*cellSize + cellSize/2,
          r*cellSize + cellSize/2
        ));
      }
    }
  }
}

// Bucle principal: input, render, actualización de enemigos
function draw() {
  // procesa input antes de renderizar
  handleMovement();
  handleRotation();
  background(100);

  drawScene();        // tu raycasting
  enemies.forEach(e => { e.update(); e.draw3D(); });
  drawMinimap();      // siempre al final
}

// Dibuja un minimapa en la esquina superior izquierda
function drawMinimap(){
  const ms = 150;
  const tile = ms / gridCols;   // cada celda en pixeles del minimapa

  push();
    translate(10, 10);
    noStroke();
    fill(30);
    rect(0, 0, ms, ms);

    // dibujar muro/suelo
    for (let r = 0; r < gridRows; r++) {
      for (let c = 0; c < gridCols; c++) {
        fill(labyrinth[r][c] ? 100 : 200);
        rect(c*tile, r*tile, tile, tile);
      }
    }

    // jugador
    fill(0,0,255);
    ellipse(
      (player.x/cellSize)*tile,
      (player.z/cellSize)*tile,
      8,8
    );

    // enemigos sólo si visibles
    fill(255,0,0);
    for (let e of enemies) {
      if (canSee(e.x, e.z)) {
        ellipse(
          (e.x/cellSize)*tile,
          (e.z/cellSize)*tile,
          8, 8
        );
      }
    }
  pop();
}

// Nuevo helper: comprueba línea de visión en la grilla
function canSee(x, z) {
  const r0 = floor(player.z / cellSize),
        c0 = floor(player.x / cellSize),
        r1 = floor(z        / cellSize),
        c1 = floor(x        / cellSize);
  let dr = abs(r1 - r0), dc = abs(c1 - c0);
  let sr = r0 < r1 ? 1 : -1, sc = c0 < c1 ? 1 : -1;
  let err = (dr>dc?dr: -dc)/2;
  let r = r0, c = c0;

  while (!(r === r1 && c === c1)) {
    if (labyrinth[r][c] === 1) return false;
    let e2 = err;
    if (e2 > -dr) { err -= dc; r += sr; }
    if (e2 <  dc) { err += dr; c += sc; }
  }
  return true;
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
    const dx = this.dx * this.speed;
    const dz = this.dz * this.speed;
    // Avanzar solo si no colisiona en la dirección combinada
    if (!collides(this.x + dx, this.z + dz)) {
      this.x += dx;
      this.z += dz;
    } else {
      // Rebotar al chocar contra la pared
      this.dx *= -1;
      this.dz *= -1;
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
    // sólo dibujar si hay visibilidad
    if (!canSee(this.x, this.z)) return;
    const sx = (width/2)*(1+tx/ty);
    // sombreado según distancia (ty)
    const alpha = constrain(map(ty, 0, 5, 200, 50), 50, 200);

    // escala y proporción
    const size = constrain(500/ty, 10, height)*enemyScale;
    const aspect = this.img.width/this.img.height;
    const w = size*aspect, h=size;
    const sy = height - h/2;

    push();
      imageMode(CENTER);
      // elimina tint()
      if (this.img) image(this.img, sx, sy, w, h);
      else {
        noStroke(); fill(255,0,0,200);
        ellipse(sx, sy, h*0.6, h*0.6);
      }
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
  let dx = 0, dz = 0;
  const m = player.speed;

  // W = adelante
  if (keyIsDown(87)) {
    dx += sin(player.angle) * m;
    dz += -cos(player.angle) * m;
  }
  // S = atrás
  if (keyIsDown(83)) {
    dx -= sin(player.angle) * m;
    dz -= -cos(player.angle) * m;
  }

  // A = strafe izquierda (ahora usa + HALF_PI)
  if (keyIsDown(65)) {
    dx += sin(player.angle + HALF_PI) * m;
    dz += -cos(player.angle + HALF_PI) * m;
  }
  // D = strafe derecha (ahora usa - HALF_PI)
  if (keyIsDown(68)) {
    dx += sin(player.angle - HALF_PI) * m;
    dz += -cos(player.angle - HALF_PI) * m;
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
  // cielo y suelo
  fill(135,206,235); rect(0,0,width,height/2);
  fill(50);         rect(0,height/2,width,height/2);
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
