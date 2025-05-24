let imgs = {};
let blancos = [];
let balas = [];
let contador = 0;
let tiempoInicio;

function preload() {
  // Carga imágenes de blancos
  imgs.casual     = loadImage(PATH_NOBOA_CASUAL);
  imgs.deportivo  = loadImage(PATH_NOBOA_DEPORTIVO);
  imgs.presidente = loadImage(PATH_NOBOA_PRESIDENTE);
}

function setup() {
  createCanvas(800, 600);
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