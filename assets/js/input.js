class InputSystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.mouse = {
      x: canvas.width / 2,
      y: canvas.height / 2,
      active: false,
      clicked: false,
      insideCanvas: false
    };
    this.keys = {};
    this.setupEvents();
  }

  setupEvents() {
    // Eventos de mouse mejorados
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;
      this.mouse.active = true;
    });

    this.canvas.addEventListener('mouseenter', () => {
      this.mouse.insideCanvas = true;
      this.mouse.active = true;
      this.canvas.style.cursor = 'none'; // Ocultar cursor del mouse para mostrar solo la cruz roja
    });

    this.canvas.addEventListener('mouseleave', () => {
      this.mouse.insideCanvas = false;
      this.mouse.active = false;
      this.canvas.style.cursor = 'default';
    });

    this.canvas.addEventListener('click', (e) => {
      e.preventDefault();
      if (this.mouse.insideCanvas) {
        this.mouse.clicked = true;
      }
    });

    this.canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });    // Eventos de teclado para movimiento WASD y flechas
    document.addEventListener('keydown', (e) => {
      this.keys[e.key.toLowerCase()] = true;
      this.keys[e.code.toLowerCase()] = true; // Para las flechas
      
      // Debug para las flechas (temporal)
      if (e.key.includes('Arrow')) {
        console.log('Flecha detectada:', e.key, e.code);
      }
    });

    document.addEventListener('keyup', (e) => {
      this.keys[e.key.toLowerCase()] = false;
      this.keys[e.code.toLowerCase()] = false;
    });
  }

  // Obtener posición del crosshair - SOLO en la posición del mouse
  getCrosshairPosition() {
    if (this.mouse.active && this.mouse.insideCanvas) {
      return { x: this.mouse.x, y: this.mouse.y };
    }
    return null; // NO mostrar crosshair si el mouse no está activo
  }

  // Calcular ángulo de disparo basado en mouse
  getShootingAngle() {
    if (!this.mouse.active || !this.mouse.insideCanvas) {
      return 0;
    }
    
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    return Math.atan2(this.mouse.y - centerY, this.mouse.x - centerX);
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
    let rotateH = 0, rotateV = 0;
    
    // Flecha izquierda - girar a la izquierda
    if (this.keys['arrowleft'] || this.keys['keyleft'] || this.keys['left']) rotateH -= 1;
    
    // Flecha derecha - girar a la derecha  
    if (this.keys['arrowright'] || this.keys['keyright'] || this.keys['right']) rotateH += 1;
    
    // Flecha arriba - mirar arriba (opcional para el futuro)
    if (this.keys['arrowup'] || this.keys['keyup'] || this.keys['up']) rotateV -= 1;
    
    // Flecha abajo - mirar abajo (opcional para el futuro)
    if (this.keys['arrowdown'] || this.keys['keydown'] || this.keys['down']) rotateV += 1;
    
    return { horizontal: rotateH, vertical: rotateV };
  }

  // Obtener rotación de mouse
  getMouseRotation(player) {
    if (!this.mouse.active || !this.mouse.insideCanvas) {
      return { horizontal: 0, vertical: 0 };
    }
    
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    
    const deltaX = (this.mouse.x - centerX) / this.canvas.width;
    const deltaY = (this.mouse.y - centerY) / this.canvas.height;
    
    return { 
      horizontal: deltaX * 2, // Sensibilidad horizontal
      vertical: deltaY * 1    // Sensibilidad vertical
    };
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
}

window.InputSystem = InputSystem;
console.log('✅ InputSystem con controles WASD + flechas + mouse cargado');
