document.addEventListener('DOMContentLoaded', () => {
  console.log('🎮 Inicializando aplicación...');
  
  // Verificar que todos los componentes estén cargados
  const requiredComponents = ['CONFIG', 'Utils', 'InputSystem', 'BulletSystem', 'EnemySystem', 'DoomGame'];
  
  for (const component of requiredComponents) {
    if (!window[component]) {
      console.error(`❌ Componente faltante: ${component}`);
      return;
    }
  }
  
  // Inicializar menú
  if (window.MenuManager) {
    window.menuManager = new MenuManager();
    window.menuManager.showMainMenu();
  } else {
    console.error('❌ MenuManager no disponible');
  }
  
  console.log('✅ Aplicación inicializada correctamente');
});

