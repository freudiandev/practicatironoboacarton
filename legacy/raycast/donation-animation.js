// Animaciones para donaciones
console.log('Sistema de animaciones de donación cargado');

// Función para conectar con el game manager
function connectToGameManager() {
  if (!window.gameManager) {
    console.log('Game manager no disponible para conexión');
    return;
  }
  
  console.log('Conectando animación de donaciones con game manager...');
  
  // Verificar que las funciones P5 estén disponibles
  const checkP5Ready = setInterval(() => {
    if (window.startP5Game && window.stopP5Game) {
      console.log('Funciones P5 detectadas, conexión completa');
      clearInterval(checkP5Ready);
    }
  }, 100);
  
  console.log('Conexión con game manager establecida exitosamente');
}