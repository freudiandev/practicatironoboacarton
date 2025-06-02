// Script temporal de debugging para verificar carga de sistemas

console.log('🔧 DEBUG LOADER - Verificando carga de sistemas...');

// Función para verificar si un sistema está disponible
function checkSystem(name, obj) {
  const available = !!obj;
  console.log(`${available ? '✅' : '❌'} ${name}:`, available ? 'DISPONIBLE' : 'NO DISPONIBLE');
  if (available && typeof obj === 'object') {
    console.log(`   - Métodos disponibles:`, Object.keys(obj).filter(key => typeof obj[key] === 'function'));
  }
  return available;
}

// Verificar sistemas básicos
setTimeout(() => {
  console.log('🔍 === VERIFICACIÓN DE SISTEMAS (1 segundo después) ===');
  
  checkSystem('GAME_CONFIG', window.GAME_CONFIG);
  checkSystem('MAZE', window.MAZE);
  checkSystem('CanvasSystem', window.CanvasSystem);
  checkSystem('DoomEngine', window.DoomEngine);
  checkSystem('Player', window.Player);
  checkSystem('EnemyManager', window.EnemyManager);
  checkSystem('Game', window.Game);
  checkSystem('MenuManager', window.MenuManager);
  
  console.log('🔍 === FIN VERIFICACIÓN ===');
  
  // Test manual de CanvasSystem
  if (window.CanvasSystem) {
    console.log('🧪 Test manual de CanvasSystem...');
    try {
      const result = window.CanvasSystem.init();
      console.log('🧪 CanvasSystem.init() resultado:', result);
    } catch (error) {
      console.error('🧪 Error en test de CanvasSystem:', error);
    }
  }
}, 1000);

console.log('🔧 DEBUG LOADER cargado');
