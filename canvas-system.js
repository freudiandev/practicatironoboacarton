// Sistema de canvas simple - VERSIÓN LIMPIA

console.log('🎨 Iniciando carga de Canvas System...');

window.CanvasSystem = {
  canvas: null,
  ctx: null,
  width: 800,
  height: 600,
  
  init() {
    console.log('🎨 CanvasSystem.init() ejecutándose...');
    
    try {
      const gameContainer = document.getElementById('game-container');
      if (!gameContainer) {
        console.error('❌ No se encontró game-container');
        return false;
      }
      
      // Remover canvas existente
      const existingCanvas = gameContainer.querySelector('canvas');
      if (existingCanvas) {
        existingCanvas.remove();
        console.log('🗑️ Canvas anterior removido');
      }
      
      // Crear nuevo canvas
      this.canvas = document.createElement('canvas');
      this.canvas.id = 'gameCanvas';
      this.canvas.width = this.width;
      this.canvas.height = this.height;
      this.canvas.style.display = 'block';
      this.canvas.style.background = '#000';
      
      gameContainer.appendChild(this.canvas);
      console.log('✅ Canvas agregado al DOM');
      
      this.ctx = this.canvas.getContext('2d');
      if (!this.ctx) {
        console.error('❌ No se pudo obtener contexto 2D');
        return false;
      }
      
      console.log('✅ Contexto 2D obtenido');
      
      // Test visual
      this.drawTestPattern();
      
      console.log('✅ Canvas System inicializado correctamente');
      return true;
      
    } catch (error) {
      console.error('❌ Error en CanvasSystem.init():', error);
      return false;
    }
  },
  
  drawTestPattern() {
    if (!this.ctx) return;
    
    // Fondo negro
    this.ctx.fillStyle = '#222';
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    // Cuadrado rojo de prueba
    this.ctx.fillStyle = '#ff6b6b';
    this.ctx.fillRect(100, 100, 200, 200);
    
    // Texto
    this.ctx.fillStyle = '#fff';
    this.ctx.font = '24px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('DOOM Engine Test', this.width/2, this.height/2);
    
    console.log('🎨 Patrón de prueba dibujado');
  },
  
  clear() {
    if (!this.ctx) return;
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, this.width, this.height);
  },
  
  getContext() {
    return this.ctx;
  },
  
  getCanvas() {
    return this.canvas;
  }
};

console.log('🎨 Canvas System definido en window.CanvasSystem');
console.log('🎨 Verificación inmediata - CanvasSystem disponible:', !!window.CanvasSystem);

// === FUNCIONES DE DIBUJO EXTENDIDAS ===
window.CanvasSystem.fillColor = '#ffffff';
window.CanvasSystem.strokeColor = '#000000';
window.CanvasSystem.strokeEnabled = true;
window.CanvasSystem.strokeWidth = 1;
window.CanvasSystem.transformStack = [];

// Función stroke corregida
window.CanvasSystem.stroke = function(r, g = null, b = null) {
  if (!this.ctx) return;
  this.strokeEnabled = true;
  
  if (g === null) {
    this.strokeColor = `rgb(${r}, ${r}, ${r})`;
  } else {
    this.strokeColor = `rgb(${r}, ${g}, ${b})`;
  }
  this.ctx.strokeStyle = this.strokeColor;
};

// Función background
window.CanvasSystem.background = function(r, g = null, b = null) {
  if (!this.ctx) return;
  
  let color;
  if (g === null) {
    color = `rgb(${r}, ${r}, ${r})`;
  } else {
    color = `rgb(${r}, ${g}, ${b})`;
  }
  
  this.ctx.fillStyle = color;
  this.ctx.fillRect(0, 0, this.width, this.height);
};

// Función fill
window.CanvasSystem.fill = function(r, g = null, b = null) {
  if (!this.ctx) return;
  
  if (g === null) {
    this.fillColor = `rgb(${r}, ${r}, ${r})`;
  } else {
    this.fillColor = `rgb(${r}, ${g}, ${b})`;
  }
  this.ctx.fillStyle = this.fillColor;
};

// Función noStroke
window.CanvasSystem.noStroke = function() {
  this.strokeEnabled = false;
};

// Función strokeWeight
window.CanvasSystem.strokeWeight = function(weight) {
  if (!this.ctx) return;
  this.strokeWidth = weight;
  this.ctx.lineWidth = weight;
};

// Función rect
window.CanvasSystem.rect = function(x, y, w, h) { 
  if (!this.ctx) return;
  
  this.ctx.fillStyle = this.fillColor;
  this.ctx.fillRect(x, y, w, h);
  
    if (this.strokeEnabled) {
      this.ctx.strokeStyle = this.strokeColor;
      this.ctx.lineWidth = this.strokeWidth;
      this.ctx.strokeRect(x, y, w, h);
    }
  };
  
    // Función ellipse
    window.CanvasSystem.ellipse = function(x, y, w, h = null) {
      if (!this.ctx) return;
      if (h === null) h = w;
      
      this.ctx.beginPath();
      this.ctx.ellipse(x, y, w/2, h/2, 0, 0, 2 * Math.PI);
      this.ctx.fillStyle = this.fillColor;
      this.ctx.fill();
      
      if (this.strokeEnabled) {
        this.ctx.strokeStyle = this.strokeColor;
        this.ctx.lineWidth = this.strokeWidth;
        this.ctx.stroke();
      }
    };
  
  // Función line
  window.CanvasSystem.line = function(x1, y1, x2, y2) {
    if (!this.ctx) return;
    if (this.strokeEnabled) {
      this.ctx.beginPath();
      this.ctx.moveTo(x1, y1);
      this.ctx.lineTo(x2, y2);
      this.ctx.strokeStyle = this.strokeColor;
      this.ctx.lineWidth = this.strokeWidth;
      this.ctx.stroke();
    }
  };
  
  // Función loadImage
  window.CanvasSystem.loadImage = function(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        console.log(`✅ Imagen cargada: ${src}`);
        resolve(img);
      };
      img.onerror = () => {
        console.error(`❌ Error cargando imagen: ${src}`);
        reject(new Error(`No se pudo cargar: ${src}`));
      };
      img.src = src;
    });
  };
  
  // Objeto con métodos adicionales
  Object.assign(window.CanvasSystem, {
  
  // === FUNCIONES DE TEXTO ===
  text(str, x, y) {
    this.ctx.fillStyle = this.fillColor;
    this.ctx.fillText(str, x, y);
  },
  
  textAlign(horizontal, vertical) {
    if (!this.ctx) return;
    
    switch (horizontal) {
      case 'left': this.ctx.textAlign = 'left'; break;
      case 'center': this.ctx.textAlign = 'center'; break;
      case 'right': this.ctx.textAlign = 'right'; break;
    }
    
    switch (vertical) {
      case 'top': this.ctx.textBaseline = 'top'; break;
      case 'middle': this.ctx.textBaseline = 'middle'; break;
      case 'bottom': this.ctx.textBaseline = 'bottom'; break;
    }
  },
  
  textSize(size) {
    if (!this.ctx) return;
    this.ctx.font = `${size}px Arial`;
  },
  
  // === FUNCIONES DE IMAGEN ===
  image(img, x, y, w = null, h = null) {
    if (!this.ctx) return;
    if (w !== null && h !== null) {
      this.ctx.drawImage(img, x, y, w, h);
    } else {
      this.ctx.drawImage(img, x, y);
    }
  },
  
  tint(r, g = null, b = null, a = 255) {
    // Simular tint con globalCompositeOperation
    this.ctx.globalAlpha = a / 255;
    if (g === null) {
      this.ctx.fillStyle = `rgb(${r}, ${r}, ${r})`;
    } else {
      this.ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
    }
  },
  
  noTint() {
    this.ctx.globalAlpha = 1;
  },
  
  // === TRANSFORMACIONES ===
  push() {
    this.transformStack.push({
      transform: this.ctx.getTransform(),
      fillStyle: this.ctx.fillStyle,
      strokeStyle: this.ctx.strokeStyle,
      lineWidth: this.ctx.lineWidth,
      globalAlpha: this.ctx.globalAlpha
    });
    this.ctx.save();
  },
  
  pop() {
    if (this.transformStack.length > 0) {
      const state = this.transformStack.pop();
      this.ctx.restore();
    }
  },
  
  translate(x, y) {
    this.ctx.translate(x, y);
  },
  
  scale(sx, sy = null) {
    if (sy === null) sy = sx;
    this.ctx.scale(sx, sy);
  },
  
  rotate(angle) {
    this.ctx.rotate(angle);
  },
  
  // === UTILIDADES ===
  clear() {
    this.ctx.clearRect(0, 0, this.width, this.height);
  },
  
  getCanvas() {
    return this.canvas;
  },
  
  getContext() {
    return this.ctx;
  },
  
  // === CARGA DE IMÁGENES ===
  loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        console.log(`✅ Imagen cargada: ${src}`);
        resolve(img);
      };
      img.onerror = () => {
        console.error(`❌ Error cargando imagen: ${src}`);
        reject(new Error(`No se pudo cargar: ${src}`));
      };
      img.src = src;
    });
  }
});

// Exportar funciones globales para compatibilidad
window.createCanvas = (w, h) => {
  window.CanvasSystem.width = w;
  window.CanvasSystem.height = h;
  return window.CanvasSystem.init();
};

window.background = (...args) => window.CanvasSystem.background(...args);
window.fill = (...args) => window.CanvasSystem.fill(...args);
window.stroke = (...args) => window.CanvasSystem.stroke(...args);
window.noStroke = () => window.CanvasSystem.noStroke();
window.strokeWeight = (w) => window.CanvasSystem.strokeWeight(w);
window.rect = (...args) => window.CanvasSystem.rect(...args);
window.ellipse = (...args) => window.CanvasSystem.ellipse(...args);
window.line = (...args) => window.CanvasSystem.line(...args);
window.text = (...args) => window.CanvasSystem.text(...args);
window.textAlign = (...args) => window.CanvasSystem.textAlign(...args);
window.textSize = (s) => window.CanvasSystem.textSize(s);
window.image = (...args) => window.CanvasSystem.image(...args);
window.tint = (...args) => window.CanvasSystem.tint(...args);
window.noTint = () => window.CanvasSystem.noTint();
window.push = () => window.CanvasSystem.push();
window.pop = () => window.CanvasSystem.pop();
window.translate = (...args) => window.CanvasSystem.translate(...args);
window.scale = (...args) => window.CanvasSystem.scale(...args);
window.rotate = (a) => window.CanvasSystem.rotate(a);
window.loadImage = (src) => window.CanvasSystem.loadImage(src);

// Propiedades globales
Object.defineProperty(window, 'width', {
  get: () => window.CanvasSystem.width
});

Object.defineProperty(window, 'height', {
  get: () => window.CanvasSystem.height
});

console.log('🎨 Canvas System (JavaScript puro) cargado y disponible');
