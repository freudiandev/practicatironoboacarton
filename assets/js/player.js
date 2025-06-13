// Sistema de jugador simple
window.Player = {
  x: 0, z: 0, angle: 0, pitch: 0,
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
    this.pitch = 0;
    this.health = this.maxHealth;
    
    console.log(`👤 Player spawned at (${this.x}, ${this.z})`);
  },
    setupControls() {
    // DESACTIVADO: Los controles ahora se manejan desde InputSystem y game.js
    // para evitar conflictos entre múltiples listeners de teclado
    console.log('👤 Player controls desactivados - usando InputSystem');
  },
  
  update() {
    this.handleMovement();
    window.player = this; // Mantener referencia global
  },
    handleMovement() {
    // DESACTIVADO: El movimiento ahora se maneja desde game.js con InputSystem
    // para evitar conflictos entre múltiples sistemas de control
    console.log('👤 Player movement desactivado - usando InputSystem');
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
