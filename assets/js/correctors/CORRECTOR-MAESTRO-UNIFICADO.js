/**
 * 🎯 CORRECTOR MAESTRO UNIFICADO
 * ================================
 * Sistema que unifica TODOS los correctores y elimina conflictos
 * Solución definitiva para movimiento WASD + mouse + disparos
 */

class CorrectorMaestroUnificado {
  constructor() {
    this.inicializado = false;
    this.sistemaActivo = false;
    this.jugadorMoviendose = false;
    this.ultimaPosicion = { x: 0, y: 0 };
    this.teclasPulsadas = {
      W: false,
      A: false, 
      S: false,
      D: false
    };
    
    console.log('🎯 Inicializando Corrector Maestro Unificado...');
    this.inicializar();
  }

  async inicializar() {
    // 1. DETENER TODOS LOS SISTEMAS CONFLICTIVOS
    this.detenerSistemasConflictivos();
    
    // 2. ESPERAR A QUE EL MOTOR DOOM ESTÉ LISTO
    await this.esperarMotorDoom();
    
    // 3. CONFIGURAR SISTEMA UNIFICADO
    this.configurarSistemaUnificado();
    
    // 4. INICIAR MONITOREO MAESTRO
    this.iniciarMonitoreoMaestro();
    
    this.inicializado = true;
    console.log('✅ Corrector Maestro Unificado inicializado');
  }

  detenerSistemasConflictivos() {
    console.log('🛑 Deteniendo sistemas conflictivos...');
    
    // Detener monitores que causan spam
    if (window.monitorEstadoTiempoReal) {
      window.monitorEstadoTiempoReal.detener?.();
  }
  
  this.limpiarIntervalos();
  
  console.log('✅ Sistemas conflictivos detenidos');
}

limpiarIntervalos() {
  // Limpiar intervalos problemáticos
  var maxIntervalId = setTimeout(() => {}, 0);
  for (let i = 1; i < maxIntervalId; i++) {
      clearInterval(i);
    }
  }
  
    esperarMotorDoom() {
      return new Promise((resolve) => {
      const verificar = () => {
        if (window.doomGame && window.doomGame.player && window.doomGame.keys) {
          console.log('✅ Motor DOOM detectado y listo');
          resolve();
        } else {
          setTimeout(verificar, 100);
        }
      };
      verificar();
    });
  }

  configurarSistemaUnificado() {
  // Listeners y lógica de movimiento eliminados para evitar duplicidad. Control centralizado en INICIALIZADOR-CONTROLES-POST-DOOM.js
    // FIX: No usar variable 'e' no definida
    // Esta función queda vacía para evitar ReferenceError
    // Si necesitas lógica aquí, pásale el evento correctamente como argumento
    // window.doomGame.keys[...] = ...
    // Por ahora, no hace nada
    return;
  }

  aplicarMovimientoInmediato(tecla) {
    if (!window.doomGame || !window.doomGame.player) return;
    
    const player = window.doomGame.player;
    const velocidad = 3; // Velocidad de movimiento
    
    // Calcular movimiento según la tecla
    let deltaX = 0, deltaY = 0;
    
    switch(tecla) {
      case 'W': // Adelante
        deltaX = Math.cos(player.angle) * velocidad;
        deltaY = Math.sin(player.angle) * velocidad;
        break;
      case 'S': // Atrás
        deltaX = -Math.cos(player.angle) * velocidad;
        deltaY = -Math.sin(player.angle) * velocidad;
        break;
      case 'A': // Izquierda
        deltaX = Math.cos(player.angle - Math.PI/2) * velocidad;
        deltaY = Math.sin(player.angle - Math.PI/2) * velocidad;
        break;
      case 'D': // Derecha
        deltaX = Math.cos(player.angle + Math.PI/2) * velocidad;
        deltaY = Math.sin(player.angle + Math.PI/2) * velocidad;
        break;
    }
    
    // Aplicar movimiento con validación de colisiones
    this.moverJugadorSeguro(player, deltaX, deltaY);
    
    console.log(`🎮 Movimiento ${tecla} aplicado: ${player.x.toFixed(1)}, ${player.y.toFixed(1)}`);
  }

  moverJugadorSeguro(player, deltaX, deltaY) {
    const nuevaX = player.x + deltaX;
    const nuevaY = player.y + deltaY;
    
    // Verificar colisiones simples
    if (this.esMovimientoValido(nuevaX, nuevaY)) {
      player.x = nuevaX;
      player.y = nuevaY;
      this.jugadorMoviendose = true;
    }
  }

  esMovimientoValido(x, y) {
    // Verificar límites del mapa
    if (x < 20 || x > 380 || y < 20 || y > 380) {
      return false;
    }
    
    // Verificar colisiones con paredes si existe el mapa
    if (window.doomGame && window.doomGame.maze) {
      const maze = window.doomGame.maze;
      const mapX = Math.floor(x / 40);
      const mapY = Math.floor(y / 40);
      
      if (maze[mapY] && maze[mapY][mapX] === 1) {
        return false; // Hay una pared
      }
    }
    
    return true;
  }

  configurarBucleMovimiento() {
    // Bucle de movimiento continuo
    setInterval(() => {
      if (!this.sistemaActivo) return;
      
      // Aplicar movimiento continuo para teclas mantenidas
      Object.keys(this.teclasPulsadas).forEach(tecla => {
        if (this.teclasPulsadas[tecla]) {
          this.aplicarMovimientoInmediato(tecla);
        }
      });
      
    }, 16); // ~60 FPS
  }

  configurarMouseYDisparo() {
    console.log('🖱️ Configurando mouse y disparo...');
    
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) return;
    
    // Captura de mouse
    canvas.addEventListener('click', () => {
      canvas.requestPointerLock();
    });
    
    // Movimiento de mouse
    document.addEventListener('mousemove', (e) => {
      if (document.pointerLockElement === canvas && window.doomGame && window.doomGame.player) {
        const sensibilidad = 0.002;
        window.doomGame.player.angle += e.movementX * sensibilidad;
      }
    });
    
    // Disparo con clic
    canvas.addEventListener('mousedown', () => {
      this.ejecutarDisparo();
    });
    
    // Escape para liberar mouse
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.exitPointerLock();
      }
    });
  }

  ejecutarDisparo() {
    // Activar sistemas de disparo
    if (window.SistemaDisparo) {
      window.SistemaDisparo.disparar();
    }
    
    if (window.Audio8Bits) {
      window.Audio8Bits.reproducirDisparo();
    }
    
    console.log('💥 Disparo ejecutado');
  }

  iniciarMonitoreoMaestro() {
    this.sistemaActivo = true;
    
    // Monitoreo ligero cada 2 segundos
    setInterval(() => {
      this.verificarEstadoSistema();
    }, 2000);
  }

  verificarEstadoSistema() {
    if (!window.doomGame || !window.doomGame.player) {
      console.log('⚠️ Motor DOOM no disponible, reiniciando...');
      this.reiniciarSistema();
      return;
    }
    
    // Verificar si el jugador se está moviendo
    const player = window.doomGame.player;
    const posicionActual = { x: player.x, y: player.y };
    
    if (posicionActual.x !== this.ultimaPosicion.x || posicionActual.y !== this.ultimaPosicion.y) {
      this.jugadorMoviendose = true;
      this.ultimaPosicion = { ...posicionActual };
    } else {
      this.jugadorMoviendose = false;
    }
  }

  reiniciarSistema() {
    console.log('🔄 Reiniciando sistema maestro...');
    this.sistemaActivo = false;
    
    setTimeout(() => {
      this.inicializar();
    }, 1000);
  }

  obtenerKeyCode(codigo) {
    const mapeo = {
      'KeyW': 87, 'w': 87, 'W': 87,
      'KeyA': 65, 'a': 65, 'A': 65, 
      'KeyS': 83, 's': 83, 'S': 83,
      'KeyD': 68, 'd': 68, 'D': 68,
      'Space': 32
    };
    return mapeo[codigo] || 0;
  }

  // API pública
  obtenerEstado() {
    return {
      inicializado: this.inicializado,
      sistemaActivo: this.sistemaActivo,
      jugadorMoviendose: this.jugadorMoviendose,
      teclasPulsadas: { ...this.teclasPulsadas },
      posicionJugador: window.doomGame?.player ? 
        { x: window.doomGame.player.x, y: window.doomGame.player.y } : null
    };
  }

  testMovimiento() {
    console.log('🧪 Probando movimiento...');
    
    if (!window.doomGame || !window.doomGame.player) {
      console.log('❌ Motor DOOM no disponible');
      return false;
    }
    
    const posicionInicial = { 
      x: window.doomGame.player.x, 
      y: window.doomGame.player.y 
    };
    
    // Simular movimiento
    this.aplicarMovimientoInmediato('W');
    
    setTimeout(() => {
      const posicionFinal = { 
        x: window.doomGame.player.x, 
        y: window.doomGame.player.y 
      };
      
      const seMovio = posicionInicial.x !== posicionFinal.x || 
                     posicionInicial.y !== posicionFinal.y;
      
      console.log(seMovio ? '✅ Test de movimiento EXITOSO' : '❌ Test de movimiento FALLIDO');
      return seMovio;
    }, 100);
  }
}

// Inicializar el corrector maestro
window.correctorMaestro = new CorrectorMaestroUnificado();

// Comandos disponibles
console.log('🎯🔧 Corrector Maestro Unificado cargado');
console.log('💡 Comandos disponibles:');
console.log('   correctorMaestro.obtenerEstado()');
console.log('   correctorMaestro.testMovimiento()');
console.log('   correctorMaestro.reiniciarSistema()');
