// Script para identificar archivos innecesarios - ejecutar y luego eliminar este archivo también

console.log('🧹 Archivos que se pueden eliminar del proyecto:');
console.log('');

const unnecessaryFiles = [
  'icon-generator.js',
  'create-icon.js', 
  'apple-touch-icon.png',
  'favicon.ico',
  '.htaccess',
  'cleanup.js' // Este mismo archivo después de ejecutarlo
];

console.log('📁 Archivos innecesarios:');
unnecessaryFiles.forEach(file => {
  console.log(`❌ ${file}`);
});

console.log('');
console.log('✅ Archivos principales del proyecto (mantener):');
const essentialFiles = [
  'index.html',
  'game-all-in-one.js',
  'enemy-system.js', 
  'mouse-controller.js',
  'sound-system.js',
  'menu-manager.js',
  'assets/placeholder-sprites.js'
];

essentialFiles.forEach(file => {
  console.log(`✅ ${file}`);
});

console.log('');
console.log('🗑️ Para limpiar el proyecto, elimina manualmente los archivos marcados con ❌');
