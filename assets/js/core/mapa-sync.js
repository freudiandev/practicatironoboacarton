/**
 * 🗺️ SINCRONIZADOR DE MAPA DE COLISIONES
 * 
 * Propósito: Conectar todas las variables de mapa dispersas en una sola fuente
 * Problema solucionado: window.GAME.mapaColisiones no existe
 * 
 * Este archivo DEBE cargar ANTES del sistema de movimiento
 */

console.log('🗺️ [MAPA-SYNC] Iniciando sincronización de mapa de colisiones...');

// ========================================
// MAPA DE EMERGENCIA (por si no hay otros mapas)
// ========================================
const MAPA_EMERGENCIA = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

// ========================================
// FUNCIÓN DE SINCRONIZACIÓN UNIVERSAL
// ========================================
function sincronizarMapa() {
  console.log('🔄 [MAPA-SYNC] Ejecutando sincronización...');
  
  // Asegurar que window.GAME existe
  if (!window.GAME) {
    console.log('📦 [MAPA-SYNC] Creando window.GAME...');
    window.GAME = {};
  }
  
  // Asegurar que tileSize existe y es consistente con el laberinto definitivo
  if (!window.GAME.tileSize) {
    // Usar el valor del laberinto definitivo si está disponible
    if (typeof LABERINTO_DEFINITIVO !== 'undefined' && LABERINTO_DEFINITIVO.WORLD_CONFIG) {
      window.GAME.tileSize = LABERINTO_DEFINITIVO.WORLD_CONFIG.cellSize;
      console.log('📏 [MAPA-SYNC] tileSize sincronizado con LABERINTO_DEFINITIVO:', window.GAME.tileSize);
    } else {
      window.GAME.tileSize = 50; // Valor por defecto actualizado para coincidir con el sistema
      console.log('📏 [MAPA-SYNC] tileSize establecido por defecto:', window.GAME.tileSize);
    }
  }
  
  // PRIORIDAD 1: MAPA_COMPACTO_DEFINITIVO (del laberinto definitivo)
  if (typeof MAPA_COMPACTO_DEFINITIVO !== 'undefined') {
    window.GAME.mapaColisiones = MAPA_COMPACTO_DEFINITIVO.map(fila => [...fila]);
    console.log('✅ [MAPA-SYNC] Mapa asignado desde MAPA_COMPACTO_DEFINITIVO');
    console.log(`📊 [MAPA-SYNC] Tamaño: ${window.GAME.mapaColisiones.length} x ${window.GAME.mapaColisiones[0].length}`);
    return true;
  }
  
  // PRIORIDAD 2: GAME_MAZE (variable global del laberinto)
  if (typeof GAME_MAZE !== 'undefined' && Array.isArray(GAME_MAZE)) {
    window.GAME.mapaColisiones = GAME_MAZE.map(fila => [...fila]);
    console.log('✅ [MAPA-SYNC] Mapa asignado desde GAME_MAZE');
    console.log(`📊 [MAPA-SYNC] Tamaño: ${window.GAME.mapaColisiones.length} x ${window.GAME.mapaColisiones[0].length}`);
    return true;
  }
  
  // PRIORIDAD 3: MAP (variable global del DOOM)
  if (typeof MAP !== 'undefined' && Array.isArray(MAP)) {
    window.GAME.mapaColisiones = MAP.map(fila => [...fila]);
    console.log('✅ [MAPA-SYNC] Mapa asignado desde MAP');
    console.log(`📊 [MAPA-SYNC] Tamaño: ${window.GAME.mapaColisiones.length} x ${window.GAME.mapaColisiones[0].length}`);
    return true;
  }
  
  // PRIORIDAD 4: window.GAME.mapaColisiones ya existe
  if (window.GAME.mapaColisiones && Array.isArray(window.GAME.mapaColisiones)) {
    console.log('✅ [MAPA-SYNC] Mapa ya existe en window.GAME.mapaColisiones');
    console.log(`📊 [MAPA-SYNC] Tamaño: ${window.GAME.mapaColisiones.length} x ${window.GAME.mapaColisiones[0].length}`);
    return true;
  }
  
  // FALLBACK: Usar mapa de emergencia
  console.warn('⚠️ [MAPA-SYNC] No se encontró ningún mapa, usando MAPA_EMERGENCIA');
  window.GAME.mapaColisiones = MAPA_EMERGENCIA.map(fila => [...fila]);
  console.log(`📊 [MAPA-SYNC] Tamaño del mapa de emergencia: ${window.GAME.mapaColisiones.length} x ${window.GAME.mapaColisiones[0].length}`);
  return true;
}

// ========================================
// FUNCIÓN DE VALIDACIÓN DE MAPA
// ========================================
function validarMapa() {
  if (!window.GAME || !window.GAME.mapaColisiones) {
    console.error('❌ [MAPA-SYNC] VALIDACIÓN FALLIDA: No hay mapa');
    return false;
  }
  
  const mapa = window.GAME.mapaColisiones;
  
  // Verificar que sea un array bidimensional
  if (!Array.isArray(mapa) || mapa.length === 0) {
    console.error('❌ [MAPA-SYNC] VALIDACIÓN FALLIDA: Mapa no es array válido');
    return false;
  }
  
  if (!Array.isArray(mapa[0])) {
    console.error('❌ [MAPA-SYNC] VALIDACIÓN FALLIDA: Mapa no es bidimensional');
    return false;
  }
  
  // Verificar contenido numérico
  let celdas0 = 0;
  let celdas1 = 0;
  let celdasInvalidas = 0;
  
  for (let y = 0; y < mapa.length; y++) {
    for (let x = 0; x < mapa[y].length; x++) {
      const celda = mapa[y][x];
      if (celda === 0) celdas0++;
      else if (celda === 1) celdas1++;
      else celdasInvalidas++;
    }
  }
  
  console.log(`✅ [MAPA-SYNC] VALIDACIÓN EXITOSA:`);
  console.log(`   📏 Dimensiones: ${mapa.length} x ${mapa[0].length}`);
  console.log(`   🟢 Celdas libres (0): ${celdas0}`);
  console.log(`   🟫 Celdas pared (1): ${celdas1}`);
  console.log(`   ❓ Celdas inválidas: ${celdasInvalidas}`);
  
  if (celdas0 === 0) {
    console.error('❌ [MAPA-SYNC] PROBLEMA: No hay celdas libres para movimiento');
    return false;
  }
  
  if (celdasInvalidas > 0) {
    console.warn('⚠️ [MAPA-SYNC] ADVERTENCIA: Hay celdas con valores no estándar');
  }
  
  return true;
}

// ========================================
// FUNCIÓN DE MONITORING CONTINUO
// ========================================
function monitorearMapa() {
  const intervalo = setInterval(() => {
    if (!window.GAME || !window.GAME.mapaColisiones) {
      console.warn('🔍 [MAPA-SYNC] MONITOR: Mapa desapareció, intentando resincronización...');
      if (sincronizarMapa()) {
        console.log('✅ [MAPA-SYNC] MONITOR: Resincronización exitosa');
      }
    }
  }, 5000); // Verificar cada 5 segundos
  
  console.log('👁️ [MAPA-SYNC] Monitor de mapa activado');
  
  // Limpiar monitor después de 2 minutos
  setTimeout(() => {
    clearInterval(intervalo);
    console.log('⏰ [MAPA-SYNC] Monitor de mapa desactivado (tiempo límite)');
  }, 120000);
}

// ========================================
// FUNCIÓN DE DEBUG PARA VISUALIZAR MAPA
// ========================================
function mostrarMapa() {
  if (!window.GAME || !window.GAME.mapaColisiones) {
    console.error('❌ [MAPA-SYNC] No hay mapa para mostrar');
    return;
  }
  
  console.log('🗺️ [MAPA-SYNC] === VISUALIZACIÓN DEL MAPA ===');
  const mapa = window.GAME.mapaColisiones;
  
  mapa.forEach((fila, y) => {
    const filaStr = fila.map(celda => {
      if (celda === 0) return '  '; // Espacio libre
      if (celda === 1) return '██'; // Pared
      return celda.toString().padStart(2);
    }).join('');
    console.log(`${y.toString().padStart(2)}: ${filaStr}`);
  });
}

// ========================================
// FUNCIÓN PARA ENCONTRAR SPAWN SEGURO
// ========================================
function encontrarSpawnSeguro() {
  if (!window.GAME || !window.GAME.mapaColisiones) {
    console.error('❌ [MAPA-SYNC] No hay mapa para encontrar spawn');
    return null;
  }
  
  const mapa = window.GAME.mapaColisiones;
  const tileSize = window.GAME.tileSize || 50; // Valor por defecto actualizado
  const celdasLibres = [];
  
  // Encontrar todas las celdas libres
  for (let y = 0; y < mapa.length; y++) {
    for (let x = 0; x < mapa[y].length; x++) {
      if (mapa[y][x] === 0) {
        celdasLibres.push({
          x: x * tileSize + tileSize / 2,
          y: y * tileSize + tileSize / 2,
          gridX: x,
          gridY: y
        });
      }
    }
  }
  
  if (celdasLibres.length === 0) {
    console.error('❌ [MAPA-SYNC] No hay celdas libres para spawn');
    return null;
  }
  
  // Preferir celdas cerca del centro
  const centroX = Math.floor(mapa[0].length / 2);
  const centroY = Math.floor(mapa.length / 2);
  
  celdasLibres.sort((a, b) => {
    const distA = Math.abs(a.gridX - centroX) + Math.abs(a.gridY - centroY);
    const distB = Math.abs(b.gridX - centroX) + Math.abs(b.gridY - centroY);
    return distA - distB;
  });
  
  const spawn = celdasLibres[0];
  console.log(`🎯 [MAPA-SYNC] Spawn seguro encontrado: (${spawn.x}, ${spawn.y}) en grid [${spawn.gridX}, ${spawn.gridY}]`);
  
  return spawn;
}

// ========================================
// EJECUCIÓN AUTOMÁTICA
// ========================================
console.log('🚀 [MAPA-SYNC] Ejecutando sincronización automática...');

// Intentar sincronización inmediata
sincronizarMapa();

// Verificar y reintientar después de otros scripts
setTimeout(() => {
  console.log('🔄 [MAPA-SYNC] Verificación post-carga...');
  if (!window.GAME || !window.GAME.mapaColisiones) {
    console.log('⏳ [MAPA-SYNC] Reintentando sincronización...');
    sincronizarMapa();
  }
  validarMapa();
}, 1000);

// Verificación adicional después de todos los scripts
setTimeout(() => {
  console.log('🔍 [MAPA-SYNC] Verificación final...');
  if (!window.GAME || !window.GAME.mapaColisiones) {
    console.warn('⚠️ [MAPA-SYNC] ÚLTIMA OPORTUNIDAD: Forzando sincronización...');
    sincronizarMapa();
  }
  
  if (validarMapa()) {
    console.log('🎉 [MAPA-SYNC] ¡SINCRONIZACIÓN COMPLETADA EXITOSAMENTE!');
    
    // Mostrar información útil
    mostrarMapa();
    
    // Buscar spawn seguro para el jugador
    const spawn = encontrarSpawnSeguro();
    if (spawn && window.GAME) {
      window.GAME.player = window.GAME.player || { x: spawn.x, y: spawn.y, angle: 0 };
      window.GAME.player.x = spawn.x;
      window.GAME.player.y = spawn.y;
      console.log(`🏃 [MAPA-SYNC] Jugador posicionado en spawn seguro`);
    }
    
    // Activar monitor
    monitorearMapa();
  } else {
    console.error('💥 [MAPA-SYNC] ¡SINCRONIZACIÓN FALLÓ! Revisa los scripts de mapa');
  }
}, 3000);

// Ejecutar verificación automática después de la sincronización
setTimeout(function() {
  if (typeof verificarSincronizacionMinimapa === 'function') {
    verificarSincronizacionMinimapa();
  }
}, 1000); // Esperar 1 segundo para que todo esté cargado

// ========================================
// FUNCIONES GLOBALES PARA DEBUG
// ========================================
window.sincronizarMapa = sincronizarMapa;
window.validarMapa = validarMapa;
window.mostrarMapa = mostrarMapa;
window.encontrarSpawnSeguro = encontrarSpawnSeguro;

// Función de emergencia total
window.arreglarMapa = function() {
  console.log('🆘 [MAPA-SYNC] FUNCIÓN DE EMERGENCIA EJECUTADA');
  window.GAME = window.GAME || {};
  window.GAME.mapaColisiones = MAPA_EMERGENCIA.map(fila => [...fila]);
  window.GAME.tileSize = 50; // Sincronizado con el sistema del laberinto definitivo
  
  const spawn = encontrarSpawnSeguro();
  if (spawn) {
    window.GAME.player = { x: spawn.x, y: spawn.y, angle: 0 };
    console.log('🏃 [MAPA-SYNC] Jugador reposicionado en emergencia');
  }
  
  console.log('✅ [MAPA-SYNC] ¡MAPA DE EMERGENCIA APLICADO!');
  mostrarMapa();
};

// FUNCIÓN DE VERIFICACIÓN DE SINCRONIZACIÓN DEL MINIMAPA
// ======================================================
function verificarSincronizacionMinimapa() {
  console.log('🔍 [VERIFICACIÓN] Revisando sincronización del minimapa...');
  
  if (!window.GAME) {
    console.error('❌ [VERIFICACIÓN] window.GAME no existe');
    return false;
  }
  
  if (!window.GAME.mapaColisiones || !Array.isArray(window.GAME.mapaColisiones)) {
    console.error('❌ [VERIFICACIÓN] window.GAME.mapaColisiones no es válido');
    return false;
  }
  
  const mapaReal = window.GAME.mapaColisiones;
  const alturaReal = mapaReal.length;
  const anchoReal = mapaReal[0] ? mapaReal[0].length : 0;
  
  const alturaConfig = window.GAME.mapHeight;
  const anchoConfig = window.GAME.mapWidth;
  const tileSizeConfig = window.GAME.tileSize;
  
  console.log('📊 [VERIFICACIÓN] Dimensiones reales del mapa:', `${alturaReal} x ${anchoReal}`);
  console.log('📊 [VERIFICACIÓN] Dimensiones configuradas:', `${alturaConfig} x ${anchoConfig}`);
  console.log('📊 [VERIFICACIÓN] TileSize configurado:', tileSizeConfig);
  
  let erroresEncontrados = false;
  
  // Verificar dimensiones
  if (alturaReal !== alturaConfig) {
    console.error(`❌ [VERIFICACIÓN] Altura desincronizada: real=${alturaReal}, config=${alturaConfig}`);
    window.GAME.mapHeight = alturaReal;
    console.log('🔧 [VERIFICACIÓN] Altura corregida automáticamente');
    erroresEncontrados = true;
  }
  
  if (anchoReal !== anchoConfig) {
    console.error(`❌ [VERIFICACIÓN] Ancho desincronizado: real=${anchoReal}, config=${anchoConfig}`);
    window.GAME.mapWidth = anchoReal;
    console.log('🔧 [VERIFICACIÓN] Ancho corregido automáticamente');
    erroresEncontrados = true;
  }
  
  // Verificar tileSize recomendado
  const tileSizeRecomendado = 50;
  if (tileSizeConfig !== tileSizeRecomendado) {
    console.warn(`⚠️ [VERIFICACIÓN] TileSize no coincide con el recomendado: actual=${tileSizeConfig}, recomendado=${tileSizeRecomendado}`);
  }
  
  if (erroresEncontrados) {
    console.log('🔧 [VERIFICACIÓN] Sincronización corregida automáticamente');
  } else {
    console.log('✅ [VERIFICACIÓN] Minimapa perfectamente sincronizado');
  }
  
  return !erroresEncontrados;
}

// Exportar función para uso global
window.verificarSincronizacionMinimapa = verificarSincronizacionMinimapa;

console.log('✅ [MAPA-SYNC] Sincronizador de mapa cargado completamente');
console.log('💡 [MAPA-SYNC] Funciones disponibles: sincronizarMapa(), validarMapa(), mostrarMapa(), arreglarMapa()');
