// Sistema de controles mejorado
window.InputHandler = {
  keys: {},
  mousePressed: false,
  mouseLocked: false,
  
  init() {
    console.log('🎮 InputHandler inicializado');
    this.setupKeyboardEvents();
    this.setupMouseEvents();
  },
  
  setupKeyboardEvents() {
    // Eventos de teclado
    document.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
      this.handleKeyDown(e);
    });
    
    document.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });
    
    // Prevenir comportamiento por defecto de ciertas teclas
    document.addEventListener('keydown', (e) => {
      if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }
    });
  },
  
  setupMouseEvents() {
    // Click para capturar el mouse
    document.addEventListener('click', () => {
      if (!this.mouseLocked) {
        document.body.requestPointerLock();
      }
    });
    
    // Cambios en el bloqueo del mouse
    document.addEventListener('pointerlockchange', () => {
      this.mouseLocked = document.pointerLockElement === document.body;
      console.log('🖱️ Mouse lock:', this.mouseLocked);
    });
    
    // Movimiento del mouse
    document.addEventListener('mousemove', (e) => {
      if (this.mouseLocked && window.player) {
        const sensitivity = 0.003;
        window.player.angle += e.movementX * sensitivity;
        window.player.pitch = Math.max(-50, Math.min(50, window.player.pitch - e.movementY * sensitivity * 20));
      }
    });
    
    // Disparo con click
    document.addEventListener('mousedown', (e) => {
      if (e.button === 0 && this.mouseLocked) { // Click izquierdo
        this.mousePressed = true;
        if (window.Weapons && typeof window.Weapons.fire === 'function') {
          window.Weapons.fire();
        }
      }
    });
    
    document.addEventListener('mouseup', (e) => {
      if (e.button === 0) {
        this.mousePressed = false;
      }
    });
  },
  
  handleKeyDown(e) {
    switch (e.code) {
      case 'Escape':
        if (this.mouseLocked) {
          document.exitPointerLock();
        }
        break;
        
      case 'KeyR':
        if (window.Weapons && typeof window.Weapons.reload === 'function') {
          window.Weapons.reload();
        }
        break;
        
      case 'Space':
        if (window.Weapons && typeof window.Weapons.fire === 'function') {
          window.Weapons.fire();
        }
        break;
    }
  },
  
  update() {
    if (!window.player) return;
    
    const moveSpeed = 2.0; // Reducir velocidad para debug
    const rotSpeed = 0.03;
    
    let moveX = 0;
    let moveZ = 0;
    
    // Debug: mostrar qué teclas están presionadas
    const pressedKeys = Object.keys(this.keys).filter(key => this.keys[key]);
    if (pressedKeys.length > 0) {
      console.log('Teclas presionadas:', pressedKeys);
    }
    
    // Movimiento WASD
    if (this.keys['KeyW']) {
      moveX += Math.cos(window.player.angle) * moveSpeed;
      moveZ += Math.sin(window.player.angle) * moveSpeed;
      console.log('Moviendo hacia adelante');
    }
    if (this.keys['KeyS']) {
      moveX -= Math.cos(window.player.angle) * moveSpeed;
      moveZ -= Math.sin(window.player.angle) * moveSpeed;
      console.log('Moviendo hacia atrás');
    }
    if (this.keys['KeyA']) {
      moveX += Math.cos(window.player.angle - Math.PI/2) * moveSpeed;
      moveZ += Math.sin(window.player.angle - Math.PI/2) * moveSpeed;
      console.log('Moviendo a la izquierda');
    }
    if (this.keys['KeyD']) {
      moveX += Math.cos(window.player.angle + Math.PI/2) * moveSpeed;
      moveZ += Math.sin(window.player.angle + Math.PI/2) * moveSpeed;
      console.log('Moviendo a la derecha');
    }
    
    // Rotación con flechas
    if (this.keys['ArrowLeft']) {
      window.player.angle -= rotSpeed;
      console.log('Rotando izquierda, nuevo ángulo:', window.player.angle);
    }
    if (this.keys['ArrowRight']) {
      window.player.angle += rotSpeed;
      console.log('Rotando derecha, nuevo ángulo:', window.player.angle);
    }
    
    // Aplicar movimiento si hay alguno
    if (moveX !== 0 || moveZ !== 0) {
      console.log(`Intentando mover: deltaX=${moveX}, deltaZ=${moveZ}`);
      this.movePlayerSimple(moveX, moveZ);
    }
  },
  
  movePlayerSimple(deltaX, deltaZ) {
    if (!window.player) return;
    
    const oldX = window.player.x;
    const oldZ = window.player.z;
    
    // Intentar movimiento en X
    let newX = window.player.x + deltaX;
    if (this.isPositionValid(newX, window.player.z)) {
      window.player.x = newX;
    }
    
    // Intentar movimiento en Z
    let newZ = window.player.z + deltaZ;
    if (this.isPositionValid(window.player.x, newZ)) {
      window.player.z = newZ;
    }
    
    // Debug: mostrar si hubo movimiento
    if (window.player.x !== oldX || window.player.z !== oldZ) {
      console.log(`Jugador movido de (${oldX}, ${oldZ}) a (${window.player.x}, ${window.player.z})`);
    } else {
      console.log('Movimiento bloqueado por colisión');
    }
  },
  
  isPositionValid(x, z) {
    const buffer = 15; // Margen de colisión
    
    // Verificar las cuatro esquinas del jugador
    const positions = [
      [x - buffer, z - buffer],
      [x + buffer, z - buffer],
      [x - buffer, z + buffer],
      [x + buffer, z + buffer]
    ];
    
    for (const [checkX, checkZ] of positions) {
      const gridX = Math.floor(checkX / window.GAME_CONFIG.cellSize);
      const gridZ = Math.floor(checkZ / window.GAME_CONFIG.cellSize);
      
      // Verificar límites del mapa
      if (gridX < 0 || gridX >= window.GAME_CONFIG.gridCols || 
          gridZ < 0 || gridZ >= window.GAME_CONFIG.gridRows) {
        return false;
      }
      
      // Verificar si hay pared
      if (window.labyrinth[gridZ][gridX] === 1) {
        return false;
      }
    }
    
    return true;
  },
  
  isKeyPressed(keyCode) {
    return this.keys[keyCode] || false;
  }
};

console.log('🎮 Input Handler cargado');
