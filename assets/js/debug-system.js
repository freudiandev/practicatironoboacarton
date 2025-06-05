// Sistema de debug para verificar carga de scripts

console.log('🔧 === SISTEMA DE DEBUG ACTIVADO ===');

// Función para verificar estado de carga
function checkSystemStatus() {
  const systems = {
    'DoomGame': window.DoomGame,
    'MenuManager': window.MenuManager,
    'GAME_CONFIG': window.GAME_CONFIG,
    'MAZE': window.MAZE
  };
  
  console.log('🔍 === ESTADO DE SISTEMAS ===');
  Object.keys(systems).forEach(name => {
    const available = !!systems[name];
    console.log(`${available ? '✅' : '❌'} ${name}: ${available ? 'DISPONIBLE' : 'NO DISPONIBLE'}`);
    
    if (available && typeof systems[name] === 'object') {
      const methods = Object.keys(systems[name]).filter(key => typeof systems[name][key] === 'function');
      if (methods.length > 0) {
        console.log(`   📋 Métodos: ${methods.join(', ')}`);
      }
    }
  });
  console.log('🔍 === FIN ESTADO ===');
}

// Verificar inmediatamente
checkSystemStatus();

// Verificar después de 1 segundo
setTimeout(checkSystemStatus, 1000);

// Verificar cuando la página termine de cargar
window.addEventListener('load', () => {
  console.log('📄 === VERIFICACIÓN POST-LOAD ===');
  checkSystemStatus();
});

console.log('🔧 Debug system cargado');
