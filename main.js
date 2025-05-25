// --- Configuración global ---
const cellSize = 50, gridCols = 20, gridRows = 20;
let labyrinth = [
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

let player = { x:1.5*cellSize, z:1.5*cellSize, speed:2, angle:0 };
let enemies = [];

// Un sprite simple
class Enemy {
  constructor(x,z){
    this.x=x; this.z=z;
    const d=random([[1,0],[-1,0],[0,1],[0,-1]]);
    this.dx=d[0]; this.dz=d[1];
    this.speed=random(0.5,1.5);
  }
  update(){
    let nx=this.x+this.dx*this.speed, nz=this.z+this.dz*this.speed;
    if(collides(nx,nz)) { this.dx*=-1; this.dz*=-1; }
    else { this.x=nx; this.z=nz; }
  }
  draw3D(){
    const relX=this.x-player.x, relZ=this.z-player.z;
    const dirX=sin(player.angle), dirZ=-cos(player.angle);
    const planeX=dirZ*0.66, planeZ=-dirX*0.66;
    const inv=1/(planeX*dirZ-dirX*planeZ);
    const tx=inv*(dirZ*relX-dirX*relZ),
          ty=inv*(-planeZ*relX+planeX*relZ);
    if(ty<=0) return;
    const sx = (width/2)*(1+tx/ty);
    const h = constrain(500/ty, 10, height);
    push();
      noStroke(); fill(255,0,0,200);
      ellipse(sx, height/2, h*0.6, h*0.6);
    pop();
  }
}

function collides(x,z){
  let c=floor(x/cellSize), r=floor(z/cellSize);
  return r<0||r>=gridRows||c<0||c>=gridCols||labyrinth[r][c]===1;
}

function setup(){
  createCanvas(800,600).parent('game-container');
  // Generar enemigos
  for(let r=1;r<gridRows-1;r++){
    for(let c=1;c<gridCols-1;c++){
      if(labyrinth[r][c]===0 && random()<0.05){
        enemies.push(new Enemy((c+0.5)*cellSize, (r+0.5)*cellSize));
      }
    }
  }
}

function draw(){
  background(100);
  handleMovement(); handleRotation();
  drawScene();
  for(let e of enemies){ e.update(); e.draw3D(); }
}

// Rotación con flechas únicamente
function handleRotation(){
  const rs = 0.03;
  if (keyIsDown(LEFT_ARROW))  player.angle += rs;
  if (keyIsDown(RIGHT_ARROW)) player.angle -= rs;
}

// Movimiento WASD con A/D como strafe puro
function handleMovement(){
  let dx = 0, dz = 0;

  // Adelante/atrás
  if (keyIsDown(87)) { // W
    dx += sin(player.angle) * player.speed;
    dz += -cos(player.angle) * player.speed;
  }
  if (keyIsDown(83)) { // S
    dx -= sin(player.angle) * player.speed;
    dz -= -cos(player.angle) * player.speed;
  }

  // Strafear correctamente:
  if (keyIsDown(65)) { // A: strafe izquierda
    dx += cos(player.angle) * player.speed;
    dz += sin(player.angle) * player.speed;
  }
  if (keyIsDown(68)) { // D: strafe derecha
    dx -= cos(player.angle) * player.speed;
    dz -= sin(player.angle) * player.speed;
  }

  // Aplicar colisión y actualizar posición
  const nx = player.x + dx;
  const nz = player.z + dz;
  if (!collides(nx, nz)) {
    player.x = nx;
    player.z = nz;
  }
}

function drawScene(){
  noStroke();
  // cielo y suelo
  fill(135,206,235); rect(0,0,width,height/2);
  fill(50); rect(0,height/2,width,height/2);
  // raycasting paredes
  for(let x=0;x<width;x++){
    let camX=2*x/width-1;
    let dirX=sin(player.angle), dirZ=-cos(player.angle);
    let planeX=dirZ*0.66, planeZ=-dirX*0.66;
    let rayX=dirX+planeX*camX, rayZ=dirZ+planeZ*camX;
    let px=player.x/cellSize, pz=player.z/cellSize;
    let mx=floor(px), mz=floor(pz);
    let dX=rayX===0?1e30:abs(1/rayX), dZ=rayZ===0?1e30:abs(1/rayZ);
    let sX, sZ, sdX, sdZ;
    if(rayX<0){sX=-1; sdX=(px-mx)*dX;} else{sX=1; sdX=(mx+1-px)*dX;}
    if(rayZ<0){sZ=-1; sdZ=(pz-mz)*dZ;} else{sZ=1; sdZ=(mz+1-pz)*dZ;}
    let hit=0, side;
    while(!hit){
      if(sdX<sdZ){sdX+=dX; mx+=sX; side=0;}
      else        {sdZ+=dZ; mz+=sZ; side=1;}
      if(mx<0||mx>=gridCols||mz<0||mz>=gridRows){hit=1;break;}
      if(labyrinth[mz][mx]===1) hit=1;
    }
    let perp = side===0
      ? (mx-px+(1-sX)/2)/rayX
      : (mz-pz+(1-sZ)/2)/rayZ;
    perp = perp<=0?0.1:perp;
    let h = floor(height/perp),
        y0 = max(-h/2+height/2, 0),
        y1 = min(h/2+height/2, height);
    let col=color(139,69,19);
    if(side) col=lerpColor(col,color(0),0.5);
    stroke(col); line(x,y0,x,y1);
  }
}
