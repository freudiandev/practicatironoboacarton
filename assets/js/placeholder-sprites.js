// El artista del juego - crea dibujos cuando no tenemos fotos reales
// Es como un dibujante que hace bocetos rápidos

class PlaceholderSprites {
  // Función que crea diferentes versiones de Noboa, como un sastre que hace trajes
  static createNoboaSprite(variant = 1) {
    // Crear un lienzo en blanco, como conseguir un papel para dibujar
    const canvas = document.createElement('canvas');
    canvas.width = 64;  // Ancho del dibujo
    canvas.height = 64; // Alto del dibujo
    const ctx = canvas.getContext('2d'); // El pincel para dibujar
    
    // Paleta de colores, como tubos de pintura en una caja
    const colors = {
      1: '#FF6600', // Naranja - Noboa casual
      2: '#0066FF', // Azul - Noboa deportivo
      3: '#6600FF'  // Morado - Noboa presidencial
    };
    
    // Dibujar el cuerpo, como pintar un rectángulo para el torso
    ctx.fillStyle = colors[variant] || '#FF6600'; // Elegir color o usar naranja por defecto
    ctx.fillRect(16, 20, 32, 32); // Dibujar rectángulo (x, y, ancho, alto)
    
    // Dibujar la cabeza, como pintar la cara
    ctx.fillStyle = '#FFCCAA'; // Color piel
    ctx.fillRect(20, 8, 24, 20); // Rectángulo para la cabeza
    
    // Dibujar los ojos, como poner dos puntitos negros
    ctx.fillStyle = '#000000'; // Negro para los ojos
    ctx.fillRect(24, 12, 4, 4); // Ojo izquierdo
    ctx.fillRect(36, 12, 4, 4); // Ojo derecho
    
    // Escribir una etiqueta, como poner un nombre en una foto
    ctx.fillStyle = '#FFFFFF'; // Letra blanca
    ctx.font = '12px Arial';    // Tamaño y tipo de letra
    ctx.textAlign = 'center';   // Centrar el texto
    ctx.fillText(`N${variant}`, 32, 58); // Escribir "N1", "N2", etc.
    
    // Devolver el dibujo terminado, como entregar una obra de arte
    return canvas;
  }
  
  // Función para crear un Noboa muerto, como dibujar una lápida
  static createDeadSprite() {
    // Nuevo lienzo para el dibujo de muerte
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    
    // Dibujar el cuerpo caído, como una persona acostada
    ctx.fillStyle = '#666666'; // Color gris oscuro
    ctx.fillRect(8, 40, 48, 16); // Rectángulo horizontal (acostado)
    
    // Dibujar una calavera, como el símbolo de muerte
    ctx.fillStyle = '#FFFFFF'; // Blanco para la calavera
    ctx.font = '20px Arial';    // Letra más grande
    ctx.textAlign = 'center';   // Centrar
    ctx.fillText('💀', 32, 35); // Emoji de calavera
    
    // Devolver el dibujo de muerte
    return canvas;
  }
}
