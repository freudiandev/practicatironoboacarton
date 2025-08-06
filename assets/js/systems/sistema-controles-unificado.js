/**
 * SISTEMA DE CONTROLES UNIFICADO
 * Unifica toda la lógica de controles que estaba dispersa en el HTML
 * Aprendido del learning-memory: centralizar controles en un solo lugar
 */

window.SistemaControlesUnificado = {
  // Configuración
  config: {
    version: '1.0.0',
    debug: true,
    velocidadJugador: 1.0, // Velocidad muy reducida para movimiento mucho más controlable
    velocidadEnemigo: 1.2
  },

  // Estado
  initialized: false,
  teclas: {},
  verificacionInterval: null,

  /**
   * Inicializar el sistema
   */
  init() {
    console.log('🎮 Inicializando Sistema de Controles Unificado v' + this.config.version);
    
    this.setupEventListeners();
    this.initializeMovementLoop();
    this.initializeEnemyMovement();
    this.initializeShootingSystem();
    this.initializeEmergencyControls();
    this.initializeFloatingButton();
    this.startVerificationLoop();
    
    this.initialized = true;
    console.log('✅ Sistema de Controles Unificado inicializado');
    return this;
  },

  /**
   * Configurar event listeners - MEJORADO para múltiples formatos de tecla
   */
  setupEventListeners() {
    // Captura de teclas - sistema mejorado para compatibilidad
    window.addEventListener('keydown', (e) => {
      // Guardar tanto el código de tecla como el keyCode para máxima compatibilidad
      this.teclas[e.code] = true;
      this.teclas[e.keyCode] = true;
      
      // Para teclas WASD específicas, asegurarnos que se registren correctamente
      switch(e.code) {
        case 'KeyW': 
          this.teclas['KeyW'] = true; 
          this.teclas['87'] = true; 
          break;
        case 'KeyA': 
          this.teclas['KeyA'] = true; 
          this.teclas['65'] = true; 
          break;
        case 'KeyS': 
          this.teclas['KeyS'] = true; 
          this.teclas['83'] = true; 
          break;
        case 'KeyD': 
          this.teclas['KeyD'] = true; 
          this.teclas['68'] = true; 
          break;
      }
      
      // Debug para ver qué tecla se presionó
      console.log(`Tecla presionada: ${e.code} (${e.keyCode})`);
    });

    window.addEventListener('keyup', (e) => {
      // Liberar tanto el código de tecla como el keyCode
      this.teclas[e.code] = false;
      this.teclas[e.keyCode] = false;
      
      // Para teclas WASD específicas, asegurarnos que se liberen correctamente
      switch(e.code) {
        case 'KeyW': 
          this.teclas['KeyW'] = false; 
          this.teclas['87'] = false; 
          break;
        case 'KeyA': 
          this.teclas['KeyA'] = false; 
          this.teclas['65'] = false; 
          break;
        case 'KeyS': 
          this.teclas['KeyS'] = false; 
          this.teclas['83'] = false; 
          break;
        case 'KeyD': 
          this.teclas['KeyD'] = false; 
          this.teclas['68'] = false; 
          break;
      }
    });

    console.log('🎯 Event listeners mejorados configurados para múltiples formatos de tecla');
  },

  /**
   * Inicializar loop de movimiento del jugador
   */
  initializeMovementLoop() {
    const movePlayer = () => {
      if (window.GAME && window.GAME.player) {
        const p = window.GAME.player;
        const vel = this.config.velocidadJugador;
        const ang = p.angle || 0;
        let dx = 0, dy = 0;

        // Movimiento mejorado para teclas WASD - FPS estándar
        // Comprobar tanto keyCodes como códigos de tecla directos para mayor compatibilidad
        const wKey = this.teclas['KeyW'] || this.teclas['ArrowUp'] || this.teclas['87'];
        const sKey = this.teclas['KeyS'] || this.teclas['ArrowDown'] || this.teclas['83'];
        const aKey = this.teclas['KeyA'] || this.teclas['ArrowLeft'] || this.teclas['65'];
        const dKey = this.teclas['KeyD'] || this.teclas['ArrowRight'] || this.teclas['68'];
        
        // Movimiento adelante/atrás - WASD clásico
        if (wKey) { 
          // W = Adelante (en dirección de la mirada)
          dx += Math.cos(ang) * vel;
          dy += Math.sin(ang) * vel;
        }
        
        if (sKey) { 
          // S = Atrás (opuesto a la dirección de la mirada)
          dx -= Math.cos(ang) * vel;
          dy -= Math.sin(ang) * vel;
        }
        
        // Movimiento lateral (strafe) - WASD clásico
        if (aKey) { 
          // A = Izquierda (perpendicular a la dirección de la mirada)
          dx -= Math.sin(ang) * vel;
          dy += Math.cos(ang) * vel;
        }
        
        if (dKey) { 
          // D = Derecha (perpendicular a la dirección de la mirada)
          dx += Math.sin(ang) * vel;
          dy -= Math.cos(ang) * vel;
        }

        if (dx !== 0 || dy !== 0) {
          // Movimiento por eje para evitar quedarse atascado en esquinas
          const nuevoX = p.x + dx;
          const nuevoY = p.y;
          
          if (this.puedeMoverJugador(nuevoX, p.y)) {
            p.x = nuevoX;
          }
          
          const finalY = p.y + dy;
          if (this.puedeMoverJugador(p.x, finalY)) {
            p.y = finalY;
          }
          
          // Verificación extra para detectar si el jugador quedó atrapado
          // La función verificarYReposicionarJugador en index.html se encargará de reposicionarlo si está atrapado
          if (window.WorldPhysics && window.WorldPhysics.checkCollision(p.x, p.y)) {
            console.warn('⚠️ Posible colisión detectada después del movimiento');
          }
        }
      }
      
      window.requestAnimationFrame(movePlayer);
    };

    window.requestAnimationFrame(movePlayer);
    console.log('🚶 Loop de movimiento del jugador inicializado');
  },

  /**
   * Verificar si el jugador puede moverse a una posición
   */
  puedeMoverJugador(nuevoX, nuevoY) {
    // Usar la función isWalkable del sistema DOOM para consistencia
    if (typeof isWalkable === 'function') {
      return isWalkable(nuevoX, nuevoY);
    }
    
    // Fallback: usar WorldPhysics si está disponible
    if (window.WorldPhysics && typeof window.WorldPhysics.checkCollision === 'function') {
      return !window.WorldPhysics.checkCollision(nuevoX, nuevoY);
    }
    
    // Fallback manual: verificar colisión contra mapa
    if (window.GAME_MAZE) {
      const mapa = window.GAME_MAZE;
      const tileSize = window.GAME.tileSize || 50;
      const mapX = Math.floor(nuevoX / tileSize);
      const mapY = Math.floor(nuevoY / tileSize);
      
      // Verificar límites del mapa
      if (mapX < 0 || mapY < 0 || mapY >= mapa.length || mapX >= mapa[0].length) {
        return false;
      }
      
      // Verificar si es una pared (valor 1)
      return mapa[mapY][mapX] !== 1;
    }
    
    return true;
  },

  /**
   * Verificar si un enemigo puede moverse a una posición
   */
  puedeMoverEnemigo(nuevoX, nuevoY) {
    // Usar la función isWalkable del sistema DOOM para consistencia
    if (typeof isWalkable === 'function') {
      return isWalkable(nuevoX, nuevoY);
    }
    
    // Fallback: usar WorldPhysics si está disponible
    if (window.WorldPhysics && typeof window.WorldPhysics.checkCollision === 'function') {
      return !window.WorldPhysics.checkCollision(nuevoX, nuevoY);
    }
    
    // Fallback manual: verificar colisión contra mapa
    if (window.GAME_MAZE) {
      const mapa = window.GAME_MAZE;
      const tileSize = window.GAME.tileSize || 50;
      const mapX = Math.floor(nuevoX / tileSize);
      const mapY = Math.floor(nuevoY / tileSize);
      
      // Verificar límites del mapa
      if (mapX < 0 || mapY < 0 || mapY >= mapa.length || mapX >= mapa[0].length) {
        return false;
      }
      
      // Verificar si es una pared (valor 1)
      return mapa[mapY][mapX] !== 1;
    }
    
    return true;
  },

  /**
   * Inicializar movimiento de enemigos
   */
  initializeEnemyMovement() {
    const moveEnemies = () => {
      if (!window.GAME || !window.GAME.enemies || !window.GAME.player) {
        window.requestAnimationFrame(moveEnemies);
        return;
      }

      const p = window.GAME.player;
      window.GAME.enemies.forEach((enemy) => {
        if (!enemy.active) return;
        
        // Mantener enemigos en el suelo
        enemy.z = 0;
        
        // Calcular dirección hacia el jugador ocasionalmente
        if (Math.random() < 0.01) {
          const dx = p.x - enemy.x;
          const dy = p.y - enemy.y;
          enemy.dir = Math.atan2(dy, dx);
          
          // Añadir un poco de aleatoriedad para que no sea totalmente predecible
          enemy.dir += (Math.random() - 0.5) * Math.PI / 4;
        }

        const dist = Math.sqrt((p.x - enemy.x) * (p.x - enemy.x) + (p.y - enemy.y) * (p.y - enemy.y));
        
        if (dist > 24 && dist < 800) {
          const vel = this.config.velocidadEnemigo;
          
          // Calcular siguiente posición usando la dirección del enemigo
          const nextX = enemy.x + Math.cos(enemy.dir) * vel;
          const nextY = enemy.y + Math.sin(enemy.dir) * vel;
          
          // Comprobar colisión con paredes - verificar cada componente de movimiento por separado
          // Verificar movimiento en X
          if (this.puedeMoverEnemigo(nextX, enemy.y)) {
            enemy.x = nextX;
          } else {
            // Cambiar dirección si choca en X
            enemy.dir = Math.random() * 2 * Math.PI;
          }
          
          // Verificar movimiento en Y
          if (this.puedeMoverEnemigo(enemy.x, nextY)) {
            enemy.y = nextY;
          } else {
            // Cambiar dirección si choca en Y
            enemy.dir = Math.random() * 2 * Math.PI;
          }
          
          // Cambiar dirección aleatoriamente a veces
          if (Math.random() < 0.005) {
            enemy.dir = Math.random() * 2 * Math.PI;
          }
        }
      });
      
      window.requestAnimationFrame(moveEnemies);
    };

    window.requestAnimationFrame(moveEnemies);
    console.log('👾 Movimiento de enemigos inicializado');
  },
      
      window.requestAnimationFrame(moveEnemies);
    };

    window.requestAnimationFrame(moveEnemies);
    console.log('👾 Movimiento de enemigos inicializado');
  },

  /**
   * Inicializar sistema de disparo
   */
  initializeShootingSystem() {
    // Disparo con ESPACIO
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space') {
        this.handleShoot(e);
      }
    });

    // Disparo con clic del mouse
    window.addEventListener('mousedown', (e) => {
      if (e.button === 0) { // Botón izquierdo
        this.handleShoot(e);
      }
    });

    console.log('🔫 Sistema de disparo inicializado');
  },

  /**
   * Manejar disparo
   */
  handleShoot(e) {
    const mainMenu = document.getElementById('mainMenu');
    const menuVisible = mainMenu && mainMenu.style.display !== 'none' && mainMenu.style.display !== '';
    
    if (!menuVisible) {
      this.dispararConCruz();
    }
  },

  /**
   * Detectar impacto en enemigo con la cruz
   */
  detectarImpactoEnemigoConCruz() {
    if (!window.GAME || !window.GAME.enemies) return null;
    
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) return null;

    const FOV = Math.PI / 3;
    const player = window.GAME.player || { x: 0, y: 0, angle: 0 };
    let mejorEnemigo = null;
    let mejorDistancia = 99999;

    window.GAME.enemies.forEach((enemy) => {
      if (enemy.active === false) return;
      
      const dx = enemy.x - player.x;
      const dy = enemy.y - player.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < 40 || dist > 1200) return;
      
      const angleToEnemy = Math.atan2(dy, dx);
      let relAngle = angleToEnemy - player.angle;
      
      while (relAngle < -Math.PI) relAngle += 2 * Math.PI;
      while (relAngle > Math.PI) relAngle -= 2 * Math.PI;
      
      // Solo permite disparar si el ángulo relativo es cercano a 0 (apuntando directo)
      if (Math.abs(relAngle) < 0.15) { // 0.15 radianes ~8.6 grados
        if (dist < mejorDistancia) {
          mejorDistancia = dist;
          mejorEnemigo = enemy;
        }
      }
    });

    return mejorEnemigo;
  },

  /**
   * Disparar con la cruz
   */
  dispararConCruz() {
    const enemigo = this.detectarImpactoEnemigoConCruz();
    if (enemigo) {
      // Marca como inactivo
      enemigo.active = false;
      
      // Efecto visual
      this.aplicarEfectoDisparo(enemigo);
    }
  },

  /**
   * Aplicar efecto visual de disparo
   */
  aplicarEfectoDisparo(enemigo) {
    const layer = document.getElementById('enemyLayer');
    if (!layer) return;

    const imgs = layer.getElementsByTagName('img');
    for (let i = 0; i < imgs.length; i++) {
      if (imgs[i].alt === (enemigo.type || 'casual')) {
        imgs[i].style.filter = 'brightness(2) drop-shadow(0 0 8px #ff0)';
        setTimeout(() => {
          imgs[i].style.filter = '';
        }, 120);
        break;
      }
    }
  },

  /**
   * Inicializar controles de emergencia
   */
  initializeEmergencyControls() {
    document.addEventListener('keydown', (e) => {
      if (e.code === 'KeyS' && e.ctrlKey) {
        e.preventDefault();
        this.handleEmergencyReposition();
      }
    });

    console.log('🆘 Controles de emergencia inicializados');
  },

  /**
   * Manejar reposicionamiento de emergencia
   */
  handleEmergencyReposition() {
    console.log('🆘 Comando de emergencia Ctrl+S activado');
    
    if (window.SistemaSpawnUnificado) {
      window.SistemaSpawnUnificado.reposicionarJugador();
    } else if (window.buscarCeldaVacia) {
      const nuevaPos = window.buscarCeldaVacia();
      if (window.GAME && window.GAME.player) {
        window.GAME.player.x = nuevaPos.x;
        window.GAME.player.y = nuevaPos.y;
        console.log('✅ Jugador reposicionado a:', nuevaPos);
      }
    }
  },

  /**
   * Inicializar botón flotante
   */
  initializeFloatingButton() {
    const btnRespawn = document.getElementById('respawnEnemiesBtnFloating');
    const canvas = document.getElementById('gameCanvas');
    const mainMenu = document.getElementById('mainMenu');

    if (!btnRespawn) return;

    // Toggle visibility
    const toggleButton = () => {
      if (!canvas) return;
      const menuVisible = mainMenu && mainMenu.style.display !== 'none' && mainMenu.style.display !== '';
      btnRespawn.style.display = (canvas.style.display !== 'none' && !menuVisible) ? 'block' : 'none';
    };

    // Click handler
    btnRespawn.addEventListener('click', () => {
      if (window.doomGame && typeof window.doomGame.respawnEnemies === 'function') {
        try {
          window.doomGame.respawnEnemies();
          btnRespawn.innerHTML = '<span style="font-size:1.3em;">✅</span> ENEMIGOS REINICIADOS';
          setTimeout(() => {
            btnRespawn.innerHTML = '<span style="font-size:1.3em;">👾</span> REINICIAR ENEMIGOS';
          }, 1200);
        } catch (e) {
          console.warn('Error al reiniciar enemigos:', e);
        }
      }
    });

    // Loop para visibilidad
    const buttonLoop = () => {
      toggleButton();
      window.requestAnimationFrame(buttonLoop);
    };
    window.requestAnimationFrame(buttonLoop);

    console.log('🔘 Botón flotante inicializado');
  },

  /**
   * Inicializar loop de verificación
   */
  startVerificationLoop() {
    let contador = 0;
    let diagCounter = 0;
    
    const verify = () => {
      contador++;
      diagCounter++;
      
      // Verificar cada 60 frames (~1 segundo)
      if (contador >= 60) {
        this.verificarYReposicionarJugador();
        contador = 0;
      }
      
      // Diagnóstico de teclas cada 300 frames (~5 segundos)
      if (diagCounter >= 300) {
        this.mostrarDiagnosticoTeclas();
        diagCounter = 0;
      }
      
      window.requestAnimationFrame(verify);
    };

    // Crear función de diagnóstico disponible globalmente
    window.diagnosticoControles = () => {
      this.mostrarDiagnosticoTeclas(true);
      return "Diagnóstico completo. Ver consola para detalles.";
    };

    window.requestAnimationFrame(verify);
    console.log('🔍 Loop de verificación y diagnóstico iniciado');
    console.log('💡 AYUDA: Escribe "diagnosticoControles()" en consola para ver estado de teclas');
  },
  
  /**
   * Muestra diagnóstico de teclas para ayudar a depurar problemas de control
   */
  mostrarDiagnosticoTeclas(detallado = false) {
    // Comprobar estado de teclas principales
    const teclaW = this.teclas['KeyW'] || this.teclas['87'] || false;
    const teclaA = this.teclas['KeyA'] || this.teclas['65'] || false;
    const teclaS = this.teclas['KeyS'] || this.teclas['83'] || false;
    const teclaD = this.teclas['KeyD'] || this.teclas['68'] || false;
    
    if (detallado) {
      console.group('📊 DIAGNÓSTICO DETALLADO DE CONTROLES');
      console.log(`W (adelante): ${teclaW ? '✅ ACTIVA' : '❌ INACTIVA'}`);
      console.log(`A (izquierda): ${teclaA ? '✅ ACTIVA' : '❌ INACTIVA'}`);
      console.log(`S (atrás): ${teclaS ? '✅ ACTIVA' : '❌ INACTIVA'}`);
      console.log(`D (derecha): ${teclaD ? '✅ ACTIVA' : '❌ INACTIVA'}`);
      
      console.log('Estado completo de teclas:');
      let teclasActivas = 0;
      for (const key in this.teclas) {
        if (this.teclas[key]) {
          console.log(`  - Tecla "${key}" activa`);
          teclasActivas++;
        }
      }
      if (teclasActivas === 0) {
        console.log('  No hay teclas activas actualmente');
      }
      console.groupEnd();
    } else if (teclaW || teclaA || teclaS || teclaD) {
      // Solo muestra diagnóstico rápido si hay teclas WASD activas
      console.log(`🎮 Teclas activas: ${teclaW?'W':''} ${teclaA?'A':''} ${teclaS?'S':''} ${teclaD?'D':''}`);
    }
  },

  /**
   * Verificar y reposicionar jugador
   */
  verificarYReposicionarJugador() {
    if (!window.GAME || !window.GAME.player || !window.WorldPhysics) return;
    
    const estaEnPared = window.WorldPhysics.checkCollision(window.GAME.player.x, window.GAME.player.y);
    
    if (estaEnPared) {
      console.error('🚨 ¡JUGADOR EN PARED DETECTADO!');
      this.handleEmergencyReposition();
    }
  },
  
  /**
   * Maneja el reposicionamiento de emergencia cuando el jugador queda atrapado
   */
  handleEmergencyReposition() {
    if (!window.GAME || !window.GAME.player) return;
    
    console.log('🚑 Iniciando reposicionamiento de emergencia...');
    
    // Registrar posición anterior
    const posAnterior = { x: window.GAME.player.x, y: window.GAME.player.y };
    
    // Intentar usar la función global buscarCeldaVacia si existe
    if (typeof window.buscarCeldaVacia === 'function') {
      const nuevaPos = window.buscarCeldaVacia();
      window.GAME.player.x = nuevaPos.x;
      window.GAME.player.y = nuevaPos.y;
      
      console.log('🔄 Reposicionamiento:', posAnterior, '->', nuevaPos);
      
      // Verificar si sigue en pared
      if (window.WorldPhysics.checkCollision(window.GAME.player.x, window.GAME.player.y)) {
        console.error('⚠️ Nueva posición también en pared, usando coordenadas de emergencia');
        window.GAME.player.x = 128;
        window.GAME.player.y = 128;
      }
      
      // Mostrar mensaje al usuario
      this.mostrarMensajeReposicionamiento();
    } else {
      // Plan B: mover a coordenadas de emergencia fijas
      console.error('❌ Función buscarCeldaVacia no encontrada, usando coordenadas fijas');
      window.GAME.player.x = 128;
      window.GAME.player.y = 128;
    }
  },
  
  /**
   * Muestra un mensaje temporal para informar al jugador sobre el reposicionamiento
   */
  mostrarMensajeReposicionamiento() {
    // Crear o actualizar el div de mensaje
    let mensajeDiv = document.getElementById('mensajeReposicionamiento');
    if (!mensajeDiv) {
      mensajeDiv = document.createElement('div');
      mensajeDiv.id = 'mensajeReposicionamiento';
      mensajeDiv.style.position = 'absolute';
      mensajeDiv.style.top = '100px';
      mensajeDiv.style.left = '50%';
      mensajeDiv.style.transform = 'translateX(-50%)';
      mensajeDiv.style.background = 'rgba(255,0,0,0.7)';
      mensajeDiv.style.color = 'white';
      mensajeDiv.style.padding = '10px 20px';
      mensajeDiv.style.borderRadius = '5px';
      mensajeDiv.style.fontWeight = 'bold';
      mensajeDiv.style.fontSize = '16px';
      mensajeDiv.style.zIndex = '9999';
      document.body.appendChild(mensajeDiv);
    }
    
    mensajeDiv.textContent = '⚠️ ¡Atrapado en pared! Reposicionando...';
    mensajeDiv.style.display = 'block';
    
    // Ocultar mensaje después de 2 segundos
    setTimeout(() => {
      mensajeDiv.style.display = 'none';
    }, 2000);
  },

  /**
   * Diagnóstico del sistema
   */
  diagnosticar() {
    console.log('🔍 === DIAGNÓSTICO SISTEMA DE CONTROLES ===');
    console.log('Inicializado:', this.initialized);
    console.log('Configuración:', this.config);
    console.log('Teclas presionadas:', Object.keys(this.teclas).filter(key => this.teclas[key]));
    console.log('Jugador disponible:', !!(window.GAME && window.GAME.player));
    console.log('WorldPhysics disponible:', !!window.WorldPhysics);
    
    if (window.GAME && window.GAME.player) {
      console.log('Posición del jugador:', window.GAME.player.x, window.GAME.player.y);
    }
    
    if (window.GAME && window.GAME.enemies) {
      console.log('Enemigos activos:', window.GAME.enemies.filter(e => e.active).length);
    }
  }
};

// Auto-inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.SistemaControlesUnificado.init();
    configurarComandosGlobales();
  });
} else {
  // DOM ya está listo
  setTimeout(() => {
    window.SistemaControlesUnificado.init();
    configurarComandosGlobales();
  }, 200);
}

// Agregar comandos globales para diagnóstico
function configurarComandosGlobales() {
  window.diagnosticoControles = function() {
    console.clear();
    console.log('🎮 === DIAGNÓSTICO DE CONTROLES ===');
    if (window.SistemaControlesUnificado) {
      window.SistemaControlesUnificado.mostrarDiagnosticoTeclas(true);
      console.log('Estado del sistema de controles:', window.SistemaControlesUnificado.initialized ? 'Inicializado ✅' : 'No inicializado ❌');
    }
    
    console.log('\n📋 === INSTRUCCIONES PRUEBA TECLAS ===');
    console.log('Para probar si tus teclas WASD funcionan:');
    console.log('1. Presiona cada tecla individualmente (W, A, S, D)');
    console.log('2. Mientras presionas, ejecuta "diagnosticoControles()" en consola');
    console.log('3. Verifica que cada tecla aparezca como ACTIVA al presionarla');
    
    console.log('\n🔧 === REPARACIÓN DE TECLAS ===');
    console.log('Si alguna tecla no responde, prueba lo siguiente:');
    console.log('1. Ejecuta "repararControles()" en consola');
    console.log('2. Recarga la página (F5) si es necesario');
    
    return '✅ Diagnóstico completado. Ver consola para más detalles.';
  };
  
  window.repararControles = function() {
    console.log('🔧 === REPARANDO CONTROLES ===');
    
    // Reinicializar sistema de controles
    if (window.SistemaControlesUnificado) {
      console.log('Reiniciando sistema de controles...');
      window.SistemaControlesUnificado.teclas = {};
      window.SistemaControlesUnificado.setupEventListeners();
      
      // Asegurar configuración correcta
      window.SistemaControlesUnificado.config.velocidadJugador = 1.0;
      
      console.log('✅ Sistema reiniciado');
    }
    
    // Crear un listener directo para asegurar captura de teclas
    console.log('Creando listener de emergencia...');
    window.addEventListener('keydown', function(e) {
      const tecla = e.code || e.key || e.keyCode;
      console.log(`Tecla presionada: ${tecla}`);
      
      if (window.SistemaControlesUnificado) {
        switch(e.code) {
          case 'KeyW':
            window.SistemaControlesUnificado.teclas['KeyW'] = true;
            window.SistemaControlesUnificado.teclas['87'] = true;
            break;
          case 'KeyA':
            window.SistemaControlesUnificado.teclas['KeyA'] = true;
            window.SistemaControlesUnificado.teclas['65'] = true;
            break;
          case 'KeyS':
            window.SistemaControlesUnificado.teclas['KeyS'] = true;
            window.SistemaControlesUnificado.teclas['83'] = true;
            break;
          case 'KeyD':
            window.SistemaControlesUnificado.teclas['KeyD'] = true;
            window.SistemaControlesUnificado.teclas['68'] = true;
            break;
        }
      }
    });
    
    return '✅ Controles reparados. Prueba moverte con WASD ahora.';
  };
  
  console.log('💡 COMANDOS DISPONIBLES:');
  console.log('   diagnosticoControles() - Muestra estado de teclas');
  console.log('   repararControles() - Intenta reparar teclas que no responden');
}

console.log('📦 Módulo Sistema de Controles Unificado cargado');
