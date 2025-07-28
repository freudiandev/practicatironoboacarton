// Sistema Unificado de Movimiento para el jugador
// Usa el mapa de colisiones (0 = camino, 1 = pared) y movimiento gradual suave
(function() {
  console.log('[MOV-INIT] 🚀 Inicializando Sistema de Movimiento Unificado SUAVE');
  
  // Verificar estado inicial de GAME
  if (!window.GAME) {
    console.error('[MOV-INIT] ❌ ERROR CRÍTICO: window.GAME no existe, creándolo');
    window.GAME = {};
  } else {
    console.log('[MOV-INIT] ✓ window.GAME existe');
    // Verificar componentes esenciales
    console.log('[MOV-INIT] Estado del jugador:', window.GAME.player ? '✓ Existe' : '❌ No existe');
    console.log('[MOV-INIT] Estado del mapa de colisiones:', window.GAME.mapaColisiones ? '✓ Existe' : '❌ No existe');
    console.log('[MOV-INIT] TileSize:', window.GAME.tileSize || 'No definido, se usará valor por defecto (32)');
  }

  // ========================================
  // CONFIGURACIÓN DE VELOCIDAD SUAVE
  // ========================================
  var VELOCIDAD_MOVIMIENTO = 1.0; // 1.0 píxeles por frame (velocidad muy controlable)
  console.log('[MOV-INIT] 🏃 Velocidad de movimiento establecida:', VELOCIDAD_MOVIMIENTO, 'píxeles/frame');

  var teclas = {};
  console.log('[MOV-INIT] ✓ Registrando listeners de teclado WASD');
  
  // SISTEMA DESACTIVADO: Movimiento ahora manejado por sistema-controles-unificado.js
  // para evitar conflictos de movimiento
  /*
  window.addEventListener('keydown', function(e) {
    if (['KeyW','KeyA','KeyS','KeyD'].includes(e.code)) {
      e.preventDefault();
      teclas[e.code] = true;
      console.log('[MOV-TECLA] 🔽 Tecla pulsada:', e.code, '-> teclas activas:', JSON.stringify(teclas));
      // Registrar estado del jugador y mapa al momento de pulsar tecla
      if (!window.GAME.player) {
        console.error('[MOV-TECLA] ❌ ERROR: No se puede mover, window.GAME.player no existe');
      }
      if (!window.GAME.mapaColisiones) {
        console.error('[MOV-TECLA] ❌ ERROR: No se puede verificar colisiones, window.GAME.mapaColisiones no existe');
      }
    }
  });
  
  window.addEventListener('keyup', function(e) {
    if (['KeyW','KeyA','KeyS','KeyD'].includes(e.code)) {
      teclas[e.code] = false;
      console.log('[MOV-TECLA] 🔼 Tecla liberada:', e.code, '-> teclas activas:', JSON.stringify(teclas));
    }
  });
  */
  console.log('[MOV-INIT] ⚠️ Sistema de movimiento grid desactivado para evitar conflictos');

  function puedeMoverCelda(nuevaFila, nuevaCol) {
    var mapa = window.GAME.mapaColisiones;
    if (!mapa) {
      console.error('[MOV-COLISION] ❌ ERROR: mapaColisiones no existe, permitiendo movimiento por defecto');
      return true;
    }
    
    // Verificar límites del mapa
    if (nuevaFila < 0 || nuevaCol < 0 || nuevaFila >= mapa.length || nuevaCol >= mapa[0].length) {
      console.warn('[MOV-COLISION] ⚠️ Movimiento fuera de los límites del mapa:', nuevaFila, nuevaCol);
      return false;
    }
    
    // Verificar si la celda está libre (0) o es pared (1)
    var valorCelda = mapa[nuevaFila][nuevaCol];
    var libre = valorCelda === 0;
    console.log('[MOV-COLISION] 🧮 Verificando celda [' + nuevaFila + '][' + nuevaCol + '] = ' + valorCelda + ' => ' + (libre ? '✓ LIBRE' : '❌ PARED'));
    
    // Debug: mostrar un pequeño fragmento del mapa alrededor de la posición
    console.log('[MOV-COLISION] 🗺️ Fragmento de mapa alrededor:');
    for (var i = Math.max(0, nuevaFila-1); i <= Math.min(mapa.length-1, nuevaFila+1); i++) {
      var fila = '';
      for (var j = Math.max(0, nuevaCol-1); j <= Math.min(mapa[0].length-1, nuevaCol+1); j++) {
        if (i === nuevaFila && j === nuevaCol) {
          fila += '[' + mapa[i][j] + ']'; // Marcar la celda actual
        } else {
          fila += ' ' + mapa[i][j] + ' ';
        }
      }
      console.log('[MOV-COLISION] ' + fila);
    }
    
    return libre;
  }

  function moverJugador() {
    console.log('[MOV-LOOP] 🔄 Loop de movimiento ejecutándose');
    
    // Verificar si existen los objetos necesarios
    var player = window.GAME.player;
    if (!player) {
      console.error('[MOV-LOOP] ❌ ERROR CRÍTICO: window.GAME.player no existe');
      return;
    }
    
    if (!window.GAME.mapaColisiones) {
      console.error('[MOV-LOOP] ❌ ERROR CRÍTICO: window.GAME.mapaColisiones no existe');
      return;
    }
    
    // Obtener tamaño de celda (tileSize) - sincronizado con el laberinto definitivo
    var ts = window.GAME.tileSize || 50; // Valor por defecto actualizado
    console.log('[MOV-LOOP] 📏 Usando tileSize:', ts);
    
    // Calcular la celda actual del jugador
    var fila = Math.floor(player.y / ts);
    var coli = Math.floor(player.x / ts);
    console.log('[MOV-LOOP] 📍 Posición actual - Jugador:', player.x.toFixed(1), player.y.toFixed(1), '| Celda:', '[' + fila + '][' + coli + ']');
    
    // Verificar si hay teclas presionadas
    var hayTeclasActivas = Object.values(teclas).some(v => v);
    if (!hayTeclasActivas) {
      console.log('[MOV-LOOP] ⏸️ No hay teclas de movimiento activas');
      return;
    }
    
    // Calcular nueva posición según teclas presionadas
    var nuevaFila = fila, nuevaCol = coli;
    if (teclas['KeyW']) {
      nuevaFila = fila - 1;
      console.log('[MOV-LOOP] ⬆️ Tecla W: Intentando mover hacia ARRIBA');
    }
    else if (teclas['KeyS']) {
      nuevaFila = fila + 1;
      console.log('[MOV-LOOP] ⬇️ Tecla S: Intentando mover hacia ABAJO');
    }
    else if (teclas['KeyA']) {
      nuevaCol = coli - 1;
      console.log('[MOV-LOOP] ⬅️ Tecla A: Intentando mover hacia IZQUIERDA');
    }
    else if (teclas['KeyD']) {
      nuevaCol = coli + 1;
      console.log('[MOV-LOOP] ➡️ Tecla D: Intentando mover hacia DERECHA');
    }
    
    // Si hay cambio en la posición, intentar mover
    if (nuevaFila !== fila || nuevaCol !== coli) {
      console.log('[MOV-LOOP] 🎯 Destino propuesto: [' + nuevaFila + '][' + nuevaCol + ']');
      
      // Verificar colisión
      var movimientoPermitido = puedeMoverCelda(nuevaFila, nuevaCol);
      
      if (movimientoPermitido) {
        console.log('[MOV-LOOP] ✅ MOVIMIENTO PERMITIDO - Actualizando posición del jugador');
        // Convertir celda a coordenadas de mundo (centradas en la celda)
        var nuevaX = nuevaCol * ts + ts/2;
        var nuevaY = nuevaFila * ts + ts/2;
        console.log('[MOV-LOOP] 📊 Nueva posición:', nuevaX.toFixed(1), nuevaY.toFixed(1));
        
        // Guardar posición anterior para verificar el cambio
        var oldX = player.x, oldY = player.y;
        
        // Actualizar posición
        player.x = nuevaX;
        player.y = nuevaY;
        
        // Verificar que realmente cambió la posición
        console.log('[MOV-LOOP] 🔍 Cambio: [' + oldX.toFixed(1) + ',' + oldY.toFixed(1) + '] -> [' + player.x.toFixed(1) + ',' + player.y.toFixed(1) + ']');
        
        // Registrar en el sistema de aprendizaje
        if (window.learningMemory) {
          learningMemory.registrarEvento('MOVIMIENTO', {
            desde: {x: oldX, y: oldY, fila: fila, col: coli},
            hasta: {x: player.x, y: player.y, fila: nuevaFila, col: nuevaCol}
          });
        }
      } else {
        console.log('[MOV-LOOP] ❌ MOVIMIENTO BLOQUEADO - Hay una pared o límite del mapa');
      }
    }
  }

  // Loop de movimiento
  function loop() {
    try {
      // Verificar estado global en cada iteración
      if (!window.GAME) {
        console.error('[MOV-LOOP] ❌ ERROR CRÍTICO EN LOOP: window.GAME no existe');
        return;
      }
      if (!window.GAME.player) {
        console.error('[MOV-LOOP] ❌ ERROR CRÍTICO EN LOOP: window.GAME.player no existe');
        return;
      }
      
      moverJugador();
    } catch (error) {
      console.error('[MOV-ERROR] ⚠️ ERROR EN SISTEMA DE MOVIMIENTO:', error.message);
      console.error(error.stack);
    }
    
    // Continuar el bucle
    window.requestAnimationFrame(loop);
  }
  
  // SISTEMA DESACTIVADO: Movimiento ahora manejado por sistema-controles-unificado.js
  console.log('[MOV-INIT] ⚠️ Loop de movimiento grid desactivado para evitar conflictos');
  /*
  // Iniciar el bucle de movimiento después de un breve retraso para asegurar que todo esté cargado
  console.log('[MOV-INIT] ⏱️ Esperando 500ms antes de iniciar el loop de movimiento...');
  setTimeout(function() {
    console.log('[MOV-INIT] 🚦 INICIANDO LOOP DE MOVIMIENTO');
    // Imprimir estado de window.GAME antes de empezar
    console.log('[MOV-INIT] 📊 Estado final antes de iniciar loop:');
    console.log('[MOV-INIT] - window.GAME existe:', !!window.GAME);
    if (window.GAME) {
      console.log('[MOV-INIT] - window.GAME.player:', !!window.GAME.player ? 'Existe' : 'No existe');
      console.log('[MOV-INIT] - window.GAME.mapaColisiones:', !!window.GAME.mapaColisiones ? 'Existe' : 'No existe');
      console.log('[MOV-INIT] - window.GAME.tileSize:', window.GAME.tileSize || 'No definido');
    }
    window.requestAnimationFrame(loop);
  }, 500);
  */
  
  // Registrar función de diagnóstico en el ámbito global
  window.diagnosticarMovimiento = function() {
    console.log('🔍 DIAGNÓSTICO DE SISTEMA DE MOVIMIENTO:');
    console.log('- window.GAME existe:', !!window.GAME);
    if (window.GAME) {
      console.log('- window.GAME.player:', window.GAME.player);
      console.log('- window.GAME.mapaColisiones existe:', !!window.GAME.mapaColisiones);
      if (window.GAME.mapaColisiones) {
        console.log('- Tamaño del mapa:', window.GAME.mapaColisiones.length + 'x' + window.GAME.mapaColisiones[0].length);
      }
      console.log('- window.GAME.tileSize:', window.GAME.tileSize);
      console.log('- Estado de teclas:', JSON.stringify(teclas));
    }
    return 'Diagnóstico completado, revisa la consola para más detalles';
  };
  
  // Registrar el sistema en window.GAME para permitir acceso
  window.GAME.movimientoUnificado = {
    diagnosticar: window.diagnosticarMovimiento,
    teclas: teclas
  };
  
  console.log('[MOV-INIT] ✅ Sistema de Movimiento Unificado inicializado correctamente');
})();
