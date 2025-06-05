// Sistema de mira personalizada

class CrosshairCursor {
  constructor() {
    this.crosshair = null;
    this.gameContainer = null;
    this.isActive = false;
    this.init();
  }
  
  init() {
    console.log('🎯 Inicializando mira personalizada...');
    
    // Crear elemento de mira
    this.crosshair = document.createElement('div');
    this.crosshair.className = 'crosshair-cursor';
    this.crosshair.id = 'custom-crosshair';
    document.body.appendChild(this.crosshair);
    
    // Obtener referencia al contenedor del juego
    this.gameContainer = document.getElementById('game-container');
    
    if (this.gameContainer) {
      this.setupEventListeners();
      console.log('✅ Mira personalizada configurada');
    } else {
      console.warn('⚠️ No se encontró game-container');
    }
  }
  
  setupEventListeners() {
    // Mostrar mira cuando el mouse entra al área de juego
    this.gameContainer.addEventListener('mouseenter', () => {
      this.show();
    });
    
    // Ocultar mira cuando el mouse sale del área de juego
    this.gameContainer.addEventListener('mouseleave', () => {
      this.hide();
    });
    
    // Seguir el movimiento del mouse
    this.gameContainer.addEventListener('mousemove', (e) => {
      this.updatePosition(e);
    });
    
    // Animación de disparo simplificada
    this.gameContainer.addEventListener('click', () => {
      if (window.DoomGame && window.DoomGame.player && window.DoomGame.player.ammo > 0) {
        this.shootAnimation();
      }
    });
    
    // Manejar pointer lock
    document.addEventListener('pointerlockchange', () => {
      if (document.pointerLockElement === this.gameContainer) {
        this.enterPointerLock();
      } else {
        this.exitPointerLock();
      }
    });
    
    console.log('🎯 Controles de mira restaurados:');
    console.log('   Mouse funciona normalmente para mirar');
    console.log('   Orificios aparecen donde apunta la mira central');
    
    // Inicialmente oculta
    this.hide();
  }
  
  show() {
    if (!this.isActive) {
      this.crosshair.style.display = 'block';
      this.gameContainer.style.cursor = 'none';
      this.isActive = true;
    }
  }
  
  hide() {
    if (this.isActive && !document.pointerLockElement) {
      this.crosshair.style.display = 'none';
      this.gameContainer.style.cursor = 'default';
      this.isActive = false;
    }
  }
  
  updatePosition(e) {
    if (this.isActive && !document.pointerLockElement) {
      const rect = this.gameContainer.getBoundingClientRect();
      const x = e.clientX;
      const y = e.clientY;
      
      // Verificar que el mouse esté dentro del contenedor
      if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
        this.crosshair.style.left = x + 'px';
        this.crosshair.style.top = y + 'px';
      }
    }
  }
  
  enterPointerLock() {
    // En pointer lock, centrar la mira
    const rect = this.gameContainer.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    this.crosshair.style.left = centerX + 'px';
    this.crosshair.style.top = centerY + 'px';
    this.crosshair.style.display = 'block';
    this.gameContainer.classList.add('game-container-locked');
    this.isActive = true;
  }
  
  exitPointerLock() {
    this.gameContainer.classList.remove('game-container-locked');
    // Mantener la mira visible si el mouse sigue sobre el contenedor
    const mouseOverContainer = this.gameContainer.matches(':hover');
    if (!mouseOverContainer) {
      this.hide();
    }
  }
  
  shootAnimation() {
    if (this.isActive) {
      this.crosshair.classList.add('shooting');
      setTimeout(() => {
        this.crosshair.classList.remove('shooting');
      }, 100);
    }
  }
  
  // Método para cambiar color de la mira (opcional)
  setColor(color) {
    this.crosshair.style.setProperty('--crosshair-color', color);
  }
  
  // Método para cambiar tamaño de la mira (opcional)
  setSize(size) {
    this.crosshair.style.width = size + 'px';
    this.crosshair.style.height = size + 'px';
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  window.crosshairCursor = new CrosshairCursor();
});

console.log('🎯 Sistema de mira personalizada cargado');
