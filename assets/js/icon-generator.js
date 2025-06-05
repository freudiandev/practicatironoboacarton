class IconGenerator {
  static createAppleTouchIcon() {
    const canvas = document.createElement('canvas');
    canvas.width = 180;
    canvas.height = 180;
    const ctx = canvas.getContext('2d');
    
    // Fondo degradado
    const gradient = ctx.createLinearGradient(0, 0, 180, 180);
    gradient.addColorStop(0, '#FF6600');
    gradient.addColorStop(1, '#FF3300');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 180, 180);
    
    // Borde redondeado (simulado)
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 60px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🎯', 90, 90);
    
    // Texto del juego
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 16px Arial';
    ctx.fillText('DOOM NOBOA', 90, 140);
    
    return canvas;
  }
  
  static createFavicon() {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    
    // Fondo
    ctx.fillStyle = '#FF6600';
    ctx.fillRect(0, 0, 32, 32);
    
    // Crosshair
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(16, 8);
    ctx.lineTo(16, 24);
    ctx.moveTo(8, 16);
    ctx.lineTo(24, 16);
    ctx.stroke();
    
    return canvas;
  }
}

// Generar íconos automáticamente cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
  // Crear y agregar apple-touch-icon
  const appleTouchIcon = IconGenerator.createAppleTouchIcon();
  const appleTouchLink = document.createElement('link');
  appleTouchLink.rel = 'apple-touch-icon';
  appleTouchLink.href = appleTouchIcon.toDataURL('image/png');
  document.head.appendChild(appleTouchLink);
  
  // Crear y agregar favicon
  const favicon = IconGenerator.createFavicon();
  const faviconLink = document.createElement('link');
  faviconLink.rel = 'icon';
  faviconLink.type = 'image/png';
  faviconLink.href = favicon.toDataURL('image/png');
  document.head.appendChild(faviconLink);
  
  console.log('✅ Íconos generados y agregados');
});
