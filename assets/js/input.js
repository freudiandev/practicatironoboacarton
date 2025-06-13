// Como los oídos y ojos del juego que escuchan teclado y mouse
class InputSystem {
  constructor(canvas) {
    this.canvas = canvas; // El área donde jugamos
    this.mouse = {
      x: canvas.width / 2, // Dónde está el mouse (lado a lado)
      y: canvas.height / 2, // Dónde está el mouse (arriba/abajo)
      active: false, // Si estamos usando el mouse
      clicked: false, // Si acabamos de hacer clic
      insideCanvas: false, // Si el mouse está dentro del juego
      locked: false, // Si el mouse está "atrapado" en el juego
      lastX: canvas.width / 2, // Dónde estaba antes (lado a lado)
      lastY: canvas.height / 2 // Dónde estaba antes (arriba/abajo)
    };
    this.keys = {}; // Lista de qué teclas están presionadas
    this.pointerLocked = false; // Si el mouse está bloqueado para FPS
    this.showEscapeMessage = false; // Si mostrar mensaje de escape
    this.mouseMovement = { x: 0, y: 0 }; // Cuánto se movió el mouse
    this.setupEvents(); // Empezar a escuchar
  }

  setupEvents() {
    // Escuchar cuando se mueve el mouse como seguir una pelota con los ojos
    this.canvas.addEventListener('mousemove', (e) => {
      if (this.pointerLocked) {
        // Si el mouse está "atrapado", usar movimiento especial para FPS
        this.handleLockedMouseMove(e);
      } else {
        // Mouse normal, calcular dónde está
        const rect = this.canvas.getBoundingClientRect();
        const newX = e.clientX - rect.left;
        const newY = e.clientY - rect.top;

        // Calcular cuánto se movió el mouse (como medir pasos)
        this.mouseMovement.x = newX - this.mouse.lastX;
        this.mouseMovement.y = newY - this.mouse.lastY;

        // Guardar la nueva posición
        this.mouse.x = newX;
        this.mouse.y = newY;
        this.mouse.lastX = newX;
        this.mouse.lastY = newY;
        this.mouse.active = true; // El mouse está activo
      }
    });

    // Cuando el mouse entra al área de juego (como entrar a una habitación)
    this.canvas.addEventListener('mouseenter', () => {
      this.mouse.insideCanvas = true; // Estamos dentro
      this.mouse.active = true; // El mouse está activo
      // Si es la primera vez, poner el mouse en el centro
      const rect = this.canvas.getBoundingClientRect();
      if (this.mouse.lastX === this.canvas.width / 2 && this.mouse.lastY === this.canvas.height / 2) {
        this.mouse.lastX = this.mouse.x;
        this.mouse.lastY = this.mouse.y;
      }
      
      if (!this.pointerLocked) {
        this.canvas.style.cursor = 'none';
      }
    });this.canvas.addEventListener('mouseleave', () => {
      if (!this.pointerLocked) {
        this.mouse.insideCanvas = false;
        this.mouse.active = false;
        this.canvas.style.cursor = 'default';
        this.mouseMovement.x = 0;
        this.mouseMovement.y = 0;
      }
    });

    // Click para activar pointer lock
    this.canvas.addEventListener('click', (e) => {
      e.preventDefault();
      this.mouse.clicked = true;
      if (!this.pointerLocked && CONFIG.controls?.enablePointerLock) {
        this.requestPointerLock();
      }
    });

    this.canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });

    // Eventos de pointer lock
    document.addEventListener('pointerlockchange', () => {
      this.pointerLocked = document.pointerLockElement === this.canvas;
      this.showEscapeMessage = this.pointerLocked;
      
      if (this.pointerLocked) {
        this.mouse.locked = true;
        this.mouse.active = true;
        this.mouse.insideCanvas = true;
        this.mouse.x = this.canvas.width / 2;
        this.mouse.y = this.canvas.height / 2;
      } else {
        this.mouse.locked = false;
        this.canvas.style.cursor = 'default';
      }
    });    // Eventos de teclado para movimiento WASD y flechas
    window.addEventListener('keydown', (e) => {
      // Tecla Escape para salir del pointer lock
      if (e.code === 'Escape' && this.pointerLocked) {
        this.exitPointerLock();
        return;
      }
      // Mapeo universal
      this.keys[e.key.toLowerCase()] = true;
      this.keys[e.code.toLowerCase()] = true;
      this.keys[e.code] = true;

      // Flechas: mapeo explícito y log visible
      if (e.code === 'ArrowUp') {
        this.keys['arrowup'] = true;
        this.keys['ArrowUp'] = true;
      }
      if (e.code === 'ArrowDown') {
        this.keys['arrowdown'] = true;
        this.keys['ArrowDown'] = true;
      }
      if (e.code === 'ArrowLeft') {
        this.keys['arrowleft'] = true;
        this.keys['ArrowLeft'] = true;
      }
      if (e.code === 'ArrowRight') {
        this.keys['arrowright'] = true;
        this.keys['ArrowRight'] = true;
      }
    });

    document.addEventListener('keyup', (e) => {
      // Mapeo múltiple para keyup también
      this.keys[e.key.toLowerCase()] = false;
      this.keys[e.code.toLowerCase()] = false;
      this.keys[e.code] = false;
      
      // Mapeo específico para flechas
      if (e.code === 'ArrowUp') {
        this.keys['arrowup'] = false;
        this.keys['ArrowUp'] = false;
      }
      if (e.code === 'ArrowDown') {
        this.keys['arrowdown'] = false;
        this.keys['ArrowDown'] = false;
      }
      if (e.code === 'ArrowLeft') {
        this.keys['arrowleft'] = false;
        this.keys['ArrowLeft'] = false;
      }
      if (e.code === 'ArrowRight') {
        this.keys['arrowright'] = false;
        this.keys['ArrowRight'] = false;
      }
    });
  }// Obtener posición del crosshair - SIEMPRE en la posición exacta del mouse
  getCrosshairPosition() {
    // SIEMPRE retornar la posición del mouse si está dentro del canvas
    if (this.mouse.insideCanvas) {
      return { 
        x: this.mouse.x, 
        y: this.mouse.y 
      };
    }
    
    // Si no hay mouse dentro del canvas, mostrar en el centro como fallback
    return { 
      x: this.canvas.width / 2, 
      y: this.canvas.height / 2 
    };
  }
  // Calcular ángulo de disparo basado en mouse - EXACTO desde jugador hacia mouse
  getShootingAngle() {
    if (!this.mouse.active || !this.mouse.insideCanvas || !window.player) {
      return window.player ? window.player.angle : 0;
    }
    
    // Calcular ángulo EXACTO desde la posición del jugador hacia la posición del mouse
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    
    // Offset del mouse respecto al centro de la pantalla
    const deltaX = this.mouse.x - centerX;
    const deltaY = this.mouse.y - centerY;
    
    // Convertir offset de pantalla a ángulo de mundo
    // El mouse controla hacia dónde mira/dispara el jugador
    const mouseAngle = Math.atan2(deltaY, deltaX);
      // El ángulo de disparo es la combinación del ángulo del jugador + offset del mouse
    // Esto permite que el mouse funcione como la mira de la pistola
    const sensitivity = window.CONFIG ? window.CONFIG.controls.mouseSensitivity : 0.3;
    return window.player.angle + mouseAngle * sensitivity; // Usar sensibilidad configurable
  }

  // Obtener movimiento del jugador WASD
  getMovement() {
    let moveX = 0, moveZ = 0;
    
    if (this.keys['w'] || this.keys['keyW']) moveZ -= 1;
    if (this.keys['s'] || this.keys['keyS']) moveZ += 1;
    if (this.keys['a'] || this.keys['keyA']) moveX -= 1;
    if (this.keys['d'] || this.keys['keyD']) moveX += 1;
    
    return { x: moveX, z: moveZ };
  }  // Obtener rotación de cámara con flechas
  getCameraRotation() {
    let rotateH = 0, pitchV = 0;
      // Debug completo: mostrar todas las teclas disponibles (comentado para evitar saturación)    // Debug: mostrar teclas presionadas (comentado para evitar spam)
    // if (Object.keys(this.keys).length > 0) {
    //   const pressedKeys = Object.keys(this.keys).filter(key => this.keys[key]);
    //   if (pressedKeys.length > 0) {
    //     console.log('🎯 Teclas presionadas:', pressedKeys);
    //   }
    // }// Definir variables para las flechas direccionales
    const arrowUpPressed = this.keys['arrowup'] || this.keys['ArrowUp'];
    const arrowDownPressed = this.keys['arrowdown'] || this.keys['ArrowDown'];
    const arrowLeftPressed = this.keys['arrowleft'] || this.keys['ArrowLeft'];
    const arrowRightPressed = this.keys['arrowright'] || this.keys['ArrowRight'];
      // Debug adicional para ArrowUp específicamente (comentado para evitar spam)
    // if (this.keys['ArrowUp'] || this.keys['arrowup']) {
    //   console.log('🚨 DEBUG: ArrowUp detectado en keys:', {
    //     'ArrowUp': this.keys['ArrowUp'],
    //     'arrowup': this.keys['arrowup'],
    //     'arrowUpPressed': arrowUpPressed
    //   });
    // }
      // Flecha izquierda - girar a la izquierda
    if (arrowLeftPressed) {
      rotateH -= 1;
      // console.log('◀️ Flecha IZQUIERDA presionada');
    }
    
    // Flecha derecha - girar a la derecha  
    if (arrowRightPressed) {
      rotateH += 1;
      // console.log('▶️ Flecha DERECHA presionada');
    }      // Flecha arriba - mirar hacia ARRIBA (cielo)
    if (arrowUpPressed) {
      pitchV += 1;
      // console.log('🔼 Flecha ARRIBA presionada - mirando al cielo');
    }
      // Flecha abajo - mirar hacia ABAJO (suelo)
    if (arrowDownPressed) {
      pitchV -= 1;
      // console.log('🔽 Flecha ABAJO presionada - mirando al suelo');
    }
    
    // Debug: mostrar valores de retorno si hay movimiento (comentado para evitar spam)
    // if (rotateH !== 0 || pitchV !== 0) {
    //   console.log(`📊 getCameraRotation() retornando: horizontal=${rotateH}, pitch=${pitchV}`);
    // }
      return { horizontal: rotateH, pitch: pitchV };
  }  // Obtener rotación de mouse para cámara - INMEDIATO sin arrastre
  getMouseRotation(player) {
    // Debug temporal para verificar llamadas
    // console.log(`🔍 getMouseRotation llamado: active=${this.mouse.active}, inside=${this.mouse.insideCanvas}, movX=${this.mouseMovement.x}, movY=${this.mouseMovement.y}`);
    
    if (!this.mouse.active || !this.mouse.insideCanvas) {
      return { horizontal: 0, pitch: 0 };
    }
    
    const config = window.CONFIG || {};
    const horizontalSensitivity = config.controls?.mouseRotationSensitivity || 0.002;
    const pitchSensitivity = config.controls?.mousePitchSensitivity || 0.001;
    
    let horizontal = 0, pitch = 0;
    
    // Usar siempre los valores de movimiento almacenados
    horizontal = this.mouseMovement.x * horizontalSensitivity * 2.0; // Sensibilidad aumentada
    pitch = -this.mouseMovement.y * pitchSensitivity * 2.0;         // Invertida: arriba = positivo
    
    // Debug para mouse rotation (temporal para diagnosticar)
    if (Math.abs(horizontal) > 0.001 || Math.abs(pitch) > 0.001) {
      console.log(`🖱️ Mouse rotation: H=${horizontal.toFixed(4)}, P=${pitch.toFixed(4)} (movX=${this.mouseMovement.x}, movY=${this.mouseMovement.y})`);
    }
    
    // Resetear movimiento después de usarlo para evitar acumulación
    this.mouseMovement.x = 0;
    this.mouseMovement.y = 0;
    
    return { horizontal, pitch };
  }

  isKeyPressed(key) {
    return this.keys[key.toLowerCase()];
  }

  isMouseActive() {
    return this.mouse.active && this.mouse.insideCanvas;
  }
  consumeMouseClick() {
    if (this.mouse.clicked) {
      this.mouse.clicked = false;
      return true;
    }
    return false;
  }

  // Métodos para pointer lock
  requestPointerLock() {
    if (this.canvas.requestPointerLock) {
      this.canvas.requestPointerLock();
    }
  }

  exitPointerLock() {
    if (document.exitPointerLock) {
      document.exitPointerLock();
    }
  }  handleLockedMouseMove(e) {
    const sensitivity = CONFIG.controls?.mouseRotationSensitivity || 0.002;
    
    // Capturar movimiento inmediato del mouse para rotación
    this.mouseMovement.x = e.movementX || 0;
    this.mouseMovement.y = e.movementY || 0;
      // Debug temporal (comentado)
    // if (Math.abs(this.mouseMovement.x) > 0 || Math.abs(this.mouseMovement.y) > 0) {
    //   console.log(`🔒 LockedMouseMove: movX=${this.mouseMovement.x}, movY=${this.mouseMovement.y}`);
    // }
    
    // Mantener el crosshair centrado cuando está bloqueado
    this.mouse.x = this.canvas.width / 2;
    this.mouse.y = this.canvas.height / 2;
  }

  isPointerLocked() {
    return this.pointerLocked;
  }

  shouldShowEscapeMessage() {
    return this.showEscapeMessage;
  }
}

window.InputSystem = InputSystem;
console.log('✅ InputSystem con controles WASD + flechas + mouse cargado');
