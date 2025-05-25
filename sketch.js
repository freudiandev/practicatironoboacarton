let imgs = {};
let blancos = [];
let balas = [];
let contador = 0;
let tiempoInicio;

const cellSize = 50, gridCols = 20, gridRows = 20;
let labyrinth = [];
let player = { x:1.5*cellSize, z:1.5*cellSize, speed:2, angle:0 };
let targets = [];

// Laberinto 20×20 (0 = libre, 1 = pared)
const rawLabyrinth = [
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

// Clase Enemy que recorre pasillos
class Enemy {
  constructor(x,z){
    this.x=x; this.z=z; this.speed=1;
    const d = random([[1,0],[-1,0],[0,1],[0,-1]]);
    this.dx=d[0]; this.dz=d[1];
  }
  update(){
    let nx=this.x+this.dx*this.speed, nz=this.z+this.dz*this.speed;
    if(collides(nx,nz)) { this.dx*=-1; this.dz*=-1; }
    else { this.x=nx; this.z=nz; }
  }
  draw2D(){
    push();
      translate(this.x, this.z);
      fill(255,0,0); noStroke();
      ellipse(0,0, cellSize*0.6);
    pop();
  }
}

function preload() {
  // Carga imágenes de blancos
  imgs.casual     = loadImage(PATH_NOBOA_CASUAL);
  imgs.deportivo  = loadImage(PATH_NOBOA_DEPORTIVO);
  imgs.presidente = loadImage(PATH_NOBOA_PRESIDENTE);
}

function setup() {
  // cargar labyrinth
  labyrinth = rawLabyrinth;
  // inyectar canvas en div#game
  createCanvas(800,600).parent('game');
  // generar enemigos en pasillos
  for(let r=1;r<gridRows-1;r++){
    for(let c=1;c<gridCols-1;c++){
      if(labyrinth[r][c]===0){
        targets.push(new Enemy(c*cellSize+cellSize/2, r*cellSize+cellSize/2));
      }
    }
  }
  tiempoInicio = millis();
  // Genera algunos blancos iniciales si quieres
}

function draw() {
  background(50);
  let elapsed = (millis() - tiempoInicio) / 1000;
  if (elapsed >= 180) {
    mostrarFin(); 
    noLoop(); 
    return;
  }
  // 1) actualizar y dibujar blancos
  for (let b of blancos) b.update(), b.draw();
  // 2) dibujar balas (marcas)
  for (let m of balas) m.draw();
  // 3) UI: contador y temporizador
  drawUI(elapsed);
  // dibujo top-down de debug
  for(let e of targets){ e.update(); e.draw2D(); }
  // minimapa
  drawMinimap();
}

function mousePressed() {
  if (mouseButton === LEFT) {
    disparar();
  }
}

// Clase Blanco: posición, dirección, movimiento en carril, vida, daño y muerte
class Blanco {
  constructor(img) {
    // ...existing code...
  }
  update() {
    // lógica de aparición, desplazamiento pegado a pared,
    // rebote o teletransporte opuesto
  }
  draw() {
    // dibuja this.img en this.x,this.y
  }
  recibirDisparo(px, py) {
    // calcula región (cabeza/tórax/piernas),
    // acumula daño, marca texto y anima muerte
  }
}

// Funciones auxiliares
function disparar() {
  // raycast 2D o simple hit test por distancia
  // si hit -> b.recibirDisparo(...)
  // sino -> crear marca de bala en cursor
}

function drawUI(elapsed) {
  fill(255);
  textSize(20);
  text(`Blancos: ${contador}`, 10, 25);
  let rem = nf(180 - elapsed, 0, 1);
  text(`Tiempo: ${rem}s`, width - 120, 25);
}

function mostrarFin() {
  background(0, 180);
  fill(255);
  textSize(36);
  textAlign(CENTER, CENTER);
  text(`Juego terminado\nMataste ${contador} blancos\nComparte tu score`, width/2, height/2);
}

function collides(x,z){
  let c = floor(x/cellSize), r = floor(z/cellSize);
  return r<0||r>=gridRows||c<0||c>=gridCols||labyrinth[r][c]===1;
}

function drawMinimap(){
  const ms=150, sc=ms/(gridCols*cellSize);
  push(); translate(10,10); noStroke();
  fill(220); rect(0,0,ms,ms);
  for(let r=0;r<gridRows;r++){
    for(let c=0;c<gridCols;c++){
      fill(labyrinth[r][c]?50:200);
      rect(c*cellSize*sc, r*cellSize*sc, cellSize*sc, cellSize*sc);
    }
  }
  fill(0,0,255);
  ellipse(player.x*sc, player.z*sc,6);
  fill(255,0,0);
  for(let e of targets) ellipse(e.x*sc,e.z*sc,6);
  pop();
}