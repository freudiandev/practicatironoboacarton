// Sistema de jugador simple
window.Player = {
  x: 0, z: 0, angle: 0,
  health: 100, maxHealth: 100,
  keys: {},
  
  init() {
    this.spawn();
    this.setupControls();
    window.player = this; // Hacer global
    console.log('👤 Player inicializado');
  },
  
  spawn() {
    // Spawn en el centro del mapa
    this.x = 12 * window.GAME_CONFIG.cellSize;
    this.z = 8 * window.GAME_CONFIG.cellSize;
    this.angle = 0;
    this.health = this.maxHealth;
    
    console.log(`👤 Player spawned at (${this.x}, ${this.z})`);
  },
  
  setupControls() {
    document.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
    });
    
    document.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });
    
    document.addEventListener('mousemove', (e) => {
      if (document.pointerLockElement) {
        this.angle += e.movementX * 0.002;
      }
    });
    
    document.addEventListener('click', () => {
      if (!document.pointerLockElement) {
        document.body.requestPointerLock();
      }
    });
  },
  
  update() {
    this.handleMovement();
    window.player = this; // Mantener referencia global
  },
  
  handleMovement() {
    const speed = window.GAME_CONFIG.playerSpeed;
    let moveX = 0, moveZ = 0;
    
    if (this.keys['KeyW']) {
      moveX += Math.cos(this.angle) * speed;
      moveZ += Math.sin(this.angle) * speed;
    }
    if (this.keys['KeyS']) {
      moveX -= Math.cos(this.angle) * speed;
      moveZ -= Math.sin(this.angle) * speed;
    }
    if (this.keys['KeyA']) {
      moveX += Math.cos(this.angle - Math.PI/2) * speed;
      moveZ += Math.sin(this.angle - Math.PI/2) * speed;
    }
    if (this.keys['KeyD']) {
      moveX += Math.cos(this.angle + Math.PI/2) * speed;
      moveZ += Math.sin(this.angle + Math.PI/2) * speed;
    }
    
    // Aplicar movimiento
    if (this.canMoveTo(this.x + moveX, this.z + moveZ)) {
      this.x += moveX;
      this.z += moveZ;
    }
    
    // Rotación con flechas
    if (this.keys['ArrowLeft']) this.angle -= 0.05;
    if (this.keys['ArrowRight']) this.angle += 0.05;
  },
  
  canMoveTo(x, z) {
    const mapX = Math.floor(x / window.GAME_CONFIG.cellSize);
    const mapZ = Math.floor(z / window.GAME_CONFIG.cellSize);
    
    if (mapX < 0 || mapX >= window.GAME_CONFIG.gridCols ||
        mapZ < 0 || mapZ >= window.GAME_CONFIG.gridRows) {
      return false;
    }
    
    return window.MAZE[mapZ][mapX] === 0;
  },
  
  move(deltaX, deltaZ) {
    const newX = this.x + deltaX;
    const newZ = this.z + deltaZ;
    
    if (this.canMoveTo(newX, this.z)) {
      this.x = newX;
    }
    if (this.canMoveTo(this.x, newZ)) {
      this.z = newZ;
    }
  },
  
  updateGlobals() {
    // Mantener compatibilidad con código existente
    window.player = this;
  },
  
  takeDamage(amount) {
    this.health -= amount;
    if (this.health <= 0) {
      this.health = 0;
      this.die();
    }
  },
  
  die() {
    console.log('💀 Player died');
    // Game over logic
  }
};

console.log('👤 Player system cargado');
