// Sistema de controles
window.Controls = {
  keys: {},
  mouse: {
    x: 0,
    y: 0,
    sensitivity: 0.002
  },
  
  init() {
    console.log('🎮 Controls inicializando...');
    this.setupKeyboardListeners();
    this.setupMouseListeners();
  },
  
  setupKeyboardListeners() {
    // Detectar teclas presionadas
    document.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
      
      // Prevenir comportamiento por defecto para teclas del juego
      if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyR', 'Space', 'Escape'].includes(e.code)) {
        e.preventDefault();
      }
      
      // Acciones inmediatas
      if (e.code === 'KeyR') {
        this.reloadWeapon();
      }
      if (e.code === 'Escape') {
        this.pauseGame();
      }
    });
    
    // Detectar teclas liberadas
    document.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });
    
    console.log('✅ Listeners de teclado configurados');
  },
  
  setupMouseListeners() {
    const canvas = document.getElementById('game-container');
    if (!canvas) {
      console.warn('⚠️ Canvas no encontrado para mouse listeners');
      return;
    }
    
    // Bloquear pointer para control de mouse
    canvas.addEventListener('click', () => {
      canvas.requestPointerLock();
    });
    
    // Movimiento del mouse
    document.addEventListener('mousemove', (e) => {
      if (document.pointerLockElement === canvas) {
        this.handleMouseMove(e.movementX, e.movementY);
      }
    });
    
    // Click para disparar
    document.addEventListener('mousedown', (e) => {
      if (document.pointerLockElement === canvas && e.button === 0) {
        this.handleShoot();
      }
    });
    
    console.log('✅ Listeners de mouse configurados');
  },
  
  handleInput() {
    if (!window.player) return;
    
    const player = window.player;
    const moveSpeed = player.speed || 3;
    const rotateSpeed = 0.05;
    
    // Movimiento con WASD
    let moveX = 0;
    let moveZ = 0;
    
    // Adelante/Atrás
    if (this.keys['KeyW']) {
      moveX += Math.cos(player.angle) * moveSpeed;
      moveZ += Math.sin(player.angle) * moveSpeed;
    }
    if (this.keys['KeyS']) {
      moveX -= Math.cos(player.angle) * moveSpeed;
      moveZ -= Math.sin(player.angle) * moveSpeed;
    }
    
    // Izquierda/Derecha (strafe)
    if (this.keys['KeyA']) {
      moveX += Math.cos(player.angle - Math.PI/2) * moveSpeed;
      moveZ += Math.sin(player.angle - Math.PI/2) * moveSpeed;
    }
    if (this.keys['KeyD']) {
      moveX += Math.cos(player.angle + Math.PI/2) * moveSpeed;
      moveZ += Math.sin(player.angle + Math.PI/2) * moveSpeed;
    }
    
    // Aplicar movimiento con verificación de colisiones
    if (moveX !== 0 || moveZ !== 0) {
      this.movePlayer(moveX, moveZ);
    }
    
    // Rotación con teclas de flecha (backup)
    if (this.keys['ArrowLeft']) {
      player.angle -= rotateSpeed;
    }
    if (this.keys['ArrowRight']) {
      player.angle += rotateSpeed;
    }
    
    // Pitch con flechas arriba/abajo
    if (this.keys['ArrowUp']) {
      player.pitch = Math.max(player.pitch - 2, -100);
    }
    if (this.keys['ArrowDown']) {
      player.pitch = Math.min(player.pitch + 2, 100);
    }
    
    // Disparar con espacio
    if (this.keys['Space']) {
      this.handleShoot();
    }
  },
  
  movePlayer(deltaX, deltaZ) {
    const player = window.player;
    const newX = player.x + deltaX;
    const newZ = player.z + deltaZ;
    
    // Verificar colisiones
    const radius = player.radius || 15;
    
    // Mover en X si no hay colisión
    if (!window.Utils || !window.Utils.collides(newX, player.z, radius)) {
      player.x = newX;
    }
    
    // Mover en Z si no hay colisión
    if (!window.Utils || !window.Utils.collides(player.x, newZ, radius)) {
      player.z = newZ;
    }
  },
  
  handleMouseMove(movementX, movementY) {
    if (!window.player) return;
    
    const player = window.player;
    
    // Rotación horizontal (yaw)
    player.angle += movementX * this.mouse.sensitivity;
    
    // Rotación vertical (pitch)
    if (!player.pitch) player.pitch = 0;
    player.pitch += movementY * this.mouse.sensitivity * 100;
    player.pitch = Math.max(-100, Math.min(100, player.pitch));
  },
  
  handleShoot() {
    if (window.Weapons) {
      window.Weapons.fire();
    } else {
      console.log('🔫 ¡PUM! (sistema de armas no disponible)');
    }
  },
  
  reloadWeapon() {
    if (window.Weapons) {
      window.Weapons.reload();
    } else {
      console.log('🔄 Recargando... (sistema de armas no disponible)');
    }
  },
  
  pauseGame() {
    if (window.GameCore) {
      window.GameCore.gameStarted = !window.GameCore.gameStarted;
      console.log(window.GameCore.gameStarted ? '▶️ Juego reanudado' : '⏸️ Juego pausado');
    }
  },
  
  // Métodos de utilidad
  isKeyPressed(keyCode) {
    return !!this.keys[keyCode];
  },
  
  resetKeys() {
    this.keys = {};
  }
};

console.log('🎮 Controls cargado y disponible');
