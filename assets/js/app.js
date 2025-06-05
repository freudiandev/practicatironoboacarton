document.addEventListener('DOMContentLoaded', () => {
  console.log('🎮 Inicializando aplicación...');
  
  // Verificar que todos los componentes estén cargados
  const requiredComponents = ['CONFIG', 'Utils', 'InputSystem', 'SpriteSystem', 'BulletSystem'];
  
  for (const component of requiredComponents) {
    if (!window[component]) {
      console.error(`❌ Componente faltante: ${component}`);
      return;
    }
  }
  
  // Inicializar menú
  window.menuManager = new MenuManager();
  window.menuManager.showMainMenu();
  
  console.log('✅ Aplicación inicializada correctamente');
});
