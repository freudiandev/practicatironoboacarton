// El traductor de movimientos del mouse - como un intérprete que convierte gestos en órdenes

class MouseController {
  // El constructor es como instalar el sistema de mouse
  constructor(canvas) {
    this.canvas = canvas;          // El área donde detectamos el mouse
    this.mouseX = canvas.width / 2;  // Posición X inicial (centro)
    this.mouseY = canvas.height / 2; // Posición Y inicial (centro)
    this.isActive = false;         // ¿Está el mouse dentro del área de juego?
    
    // Configurar los sensores del mouse, como instalar detectores de movimiento
    this.setupEventListeners();
  }
  
  // Función que instala todos los detectores, como poner cámaras de seguridad
  setupEventListeners() {
    // Detector de movimiento - cuando el mouse se mueve como una sombra que sigue
    this.canvas.addEventListener('mousemove', (e) => {
      // Calcular dónde está el mouse relativo al canvas, como GPS en un mapa
      const rect = this.canvas.getBoundingClientRect();
      this.mouseX = e.clientX - rect.left; // Posición X en el canvas
      this.mouseY = e.clientY - rect.top;  // Posición Y en el canvas
      
      // Mantener el mouse dentro de los límites, como una cerca invisible
      this.mouseX = Math.max(10, Math.min(this.canvas.width - 10, this.mouseX));
      this.mouseY = Math.max(10, Math.min(this.canvas.height - 10, this.mouseY));
    });
    
    // Detector de entrada - cuando el mouse entra al área de juego
    this.canvas.addEventListener('mouseenter', () => {
      this.isActive = true; // Activar el sistema, como encender una luz
    });
    
    // Detector de salida - cuando el mouse sale del área de juego
    this.canvas.addEventListener('mouseleave', () => {
      this.isActive = false; // Desactivar el sistema, como apagar una luz
    });
    
    // Detector de click - cuando presionas el botón del mouse para disparar
    this.canvas.addEventListener('click', (e) => {
      e.preventDefault(); // Evitar comportamientos raros del navegador
      // Si existe el juego y puede disparar, disparar como apretar el gatillo
      if (window.DoomGame && typeof window.DoomGame.shoot === 'function') {
        window.DoomGame.shoot();
      }
    });
    
    // Evitar el menú que aparece con click derecho, como bloquear interrupciones
    this.canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });
  }
  
  // Función que dice dónde está la mira, como preguntar "¿dónde apuntas?"
  getCrosshairPosition() {
    return {
      x: this.mouseX, // Posición horizontal
      y: this.mouseY  // Posición vertical
    };
  }
  
  // Función que calcula hacia dónde disparar, como calcular la trayectoria de una flecha
  getShootingAngle(player) {
    // Encontrar el centro de la pantalla, como el ombligo del juego
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    
    // Calcular la distancia del mouse al centro, como medir qué tan lejos apuntas
    const deltaX = this.mouseX - centerX; // Distancia horizontal
    const deltaY = this.mouseY - centerY; // Distancia vertical
    
    // Convertir la posición en un ángulo de disparo, como usar una brújula
    return Math.atan2(deltaY, deltaX); // Función matemática que calcula ángulos
  }
  
  // Función que pregunta si el mouse está activo, como "¿estás ahí?"
  isMouseActive() {
    return this.isActive;
  }
}
