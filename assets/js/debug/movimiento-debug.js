// Módulo de diagnóstico para el sistema de movimiento
// Se debe incluir DESPUÉS de SISTEMA-MOVIMIENTO-UNIFICADO.js pero antes de game-initialization.js

(function() {
  console.log('[DEBUG-MOV] 🔍 Sistema de diagnóstico de movimiento cargado');
  
  // Verificar el estado de los componentes esenciales para el movimiento
  function diagnosticarSistemaMovimiento() {
    console.log('[DEBUG-MOV] 📝 DIAGNÓSTICO COMPLETO DEL SISTEMA DE MOVIMIENTO:');
    
    // 1. Verificar el objeto window.GAME
    if (!window.GAME) {
      console.error('[DEBUG-MOV] ❌ ERROR CRÍTICO: window.GAME no existe');
      return false;
    } else {
      console.log('[DEBUG-MOV] ✓ window.GAME existe');
    }
    
    // 2. Verificar existencia del jugador
    if (!window.GAME.player) {
      console.error('[DEBUG-MOV] ❌ ERROR: window.GAME.player no existe');
      return false;
    } else {
      console.log('[DEBUG-MOV] ✓ window.GAME.player existe:', 
                  JSON.stringify({x: window.GAME.player.x, y: window.GAME.player.y, angle: window.GAME.player.angle}));
    }
    
    // 3. Verificar mapa de colisiones
    if (!window.GAME.mapaColisiones) {
      console.error('[DEBUG-MOV] ❌ ERROR: window.GAME.mapaColisiones no existe');
      return false;
    } else {
      console.log('[DEBUG-MOV] ✓ window.GAME.mapaColisiones existe (dimensiones:', 
                 window.GAME.mapaColisiones.length + 'x' + window.GAME.mapaColisiones[0].length + ')');
    }
    
    // 4. Verificar tamaño de celda
    if (!window.GAME.tileSize) {
      console.warn('[DEBUG-MOV] ⚠️ window.GAME.tileSize no definido, se usará valor por defecto (32)');
    } else {
      console.log('[DEBUG-MOV] ✓ window.GAME.tileSize =', window.GAME.tileSize);
    }
    
    // 5. Verificar sistema de movimiento unificado
    if (typeof window.diagnosticarMovimiento !== 'function') {
      console.error('[DEBUG-MOV] ❌ ERROR: Sistema de movimiento unificado no inicializado correctamente');
      console.log('[DEBUG-MOV] 💡 La función diagnosticarMovimiento() debería estar disponible');
      return false;
    } else {
      console.log('[DEBUG-MOV] ✓ Sistema de movimiento unificado inicializado correctamente');
    }
    
    // 6. Verificar eventos de teclado
    console.log('[DEBUG-MOV] ℹ️ Para probar eventos de teclado, presiona cualquier tecla WASD');
    
    return true;
  }
  
  // Función para probar el movimiento manualmente
  function probarMovimientoManual() {
    if (!window.GAME || !window.GAME.player) {
      console.error('[DEBUG-MOV] ❌ No se puede probar el movimiento: jugador no existe');
      return;
    }
    
    // Guardar posición original
    const posOriginal = {x: window.GAME.player.x, y: window.GAME.player.y};
    console.log('[DEBUG-MOV] 📍 Posición original:', posOriginal);
    
    // Intentar mover en las 4 direcciones cardinales
    const direcciones = ['ARRIBA', 'DERECHA', 'ABAJO', 'IZQUIERDA'];
    const movimientos = [
      {dx: 0, dy: -32}, // Arriba
      {dx: 32, dy: 0},  // Derecha
      {dx: 0, dy: 32},  // Abajo
      {dx: -32, dy: 0}  // Izquierda
    ];
    
    // Realizar pruebas de movimiento en cada dirección
    movimientos.forEach((mov, i) => {
      // Calcular nueva posición
      const nuevaX = window.GAME.player.x + mov.dx;
      const nuevaY = window.GAME.player.y + mov.dy;
      
      // Verificar colisión
      let puedeMover = true;
      if (window.WorldPhysics && typeof window.WorldPhysics.checkCollision === 'function') {
        puedeMover = !window.WorldPhysics.checkCollision(nuevaX, nuevaY);
      }
      
      // Verificar celda en el mapa
      let valorCelda = '?';
      if (window.GAME.mapaColisiones) {
        const ts = window.GAME.tileSize || 32;
        const fila = Math.floor(nuevaY / ts);
        const col = Math.floor(nuevaX / ts);
        if (fila >= 0 && col >= 0 && 
            fila < window.GAME.mapaColisiones.length && 
            col < window.GAME.mapaColisiones[0].length) {
          valorCelda = window.GAME.mapaColisiones[fila][col];
        }
      }
      
      console.log(`[DEBUG-MOV] Test ${direcciones[i]}: ${puedeMover ? '✓ PERMITIDO' : '❌ BLOQUEADO'} (celda = ${valorCelda})`);
    });
    
    // Restaurar posición original
    window.GAME.player.x = posOriginal.x;
    window.GAME.player.y = posOriginal.y;
    console.log('[DEBUG-MOV] 📍 Posición restaurada a original');
  }
  
  // Monitor de eventos de teclado
  function monitorTeclado() {
    window.addEventListener('keydown', function(e) {
      if (['KeyW','KeyA','KeyS','KeyD'].includes(e.code)) {
        console.log(`[DEBUG-MOV] 🔑 Tecla detectada: ${e.code} (${e.key})`);
        // Verificar si el handler del sistema de movimiento está funcionando
        if (e.defaultPrevented) {
          console.log('[DEBUG-MOV] ✓ El evento fue manejado por el sistema de movimiento (preventDefault() llamado)');
        } else {
          console.warn('[DEBUG-MOV] ⚠️ El sistema de movimiento NO manejó este evento (preventDefault() no llamado)');
        }
      }
    }, true); // Usar fase de captura para ejecutarse antes
  }
  
  // Realizar diagnóstico inicial
  setTimeout(function() {
    console.log('[DEBUG-MOV] ⏱️ Realizando diagnóstico inicial...');
    diagnosticarSistemaMovimiento();
    monitorTeclado();
  }, 1000); // Esperar 1 segundo para asegurar que todo esté cargado
  
  // Guardar estos métodos para llamadas manuales
  window.debugMov = {
    diagnosticar: diagnosticarSistemaMovimiento,
    probarMovimientoManual: probarMovimientoManual
  };
  
  console.log('[DEBUG-MOV] 🛠️ Para diagnóstico manual, ejecuta en consola: debugMov.diagnosticar()');
  console.log('[DEBUG-MOV] 🧪 Para prueba de movimiento manual: debugMov.probarMovimientoManual()');
  
})();
