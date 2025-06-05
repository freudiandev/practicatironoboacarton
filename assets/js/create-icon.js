// Script para crear apple-touch-icon.png - ejecutar una vez y luego eliminar

const fs = require('fs');
const canvas = document.createElement('canvas');
canvas.width = 180;
canvas.height = 180;
const ctx = canvas.getContext('2d');

// Crear ícono simple
ctx.fillStyle = '#FF6600';
ctx.fillRect(0, 0, 180, 180);

ctx.fillStyle = '#FFFFFF';
ctx.font = 'bold 60px Arial';
ctx.textAlign = 'center';
ctx.fillText('🎯', 90, 90);

// Convertir a blob y descargar
canvas.toBlob((blob) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'apple-touch-icon.png';
  a.click();
});
