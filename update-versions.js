/**
 * SCRIPT DE VERSIONADO AUTOMÁTICO
 * Actualiza automáticamente las versiones de todos los archivos CSS, JS y otros recursos
 * para evitar problemas de caché del navegador
 */

const fs = require('fs');
const path = require('path');

// Generar timestamp único para esta versión
const version = new Date().toISOString().replace(/[-:]/g, '').replace(/\..+/, '').slice(0, 14);
console.log(`🔄 Generando nueva versión: ${version}`);

// Archivos a actualizar con sus rutas
const filesToUpdate = [
  'index.html',
  // Agregar más archivos HTML si los hay
];

// Función para actualizar versiones en un archivo
function updateVersionsInFile(filePath) {
  try {
    console.log(`📝 Actualizando: ${filePath}`);
    
    let content = fs.readFileSync(filePath, 'utf8');
    let changes = 0;
    
    // Actualizar referencias a CSS
    content = content.replace(/\.css\?v=\d+/g, (match) => {
      changes++;
      return `.css?v=${version}`;
    });
    
    // Actualizar referencias a JS
    content = content.replace(/\.js\?v=\d+/g, (match) => {
      changes++;
      return `.js?v=${version}`;
    });
    
    // Actualizar referencias a imágenes PNG
    content = content.replace(/\.png\?v=\d+/g, (match) => {
      changes++;
      return `.png?v=${version}`;
    });
    
    // Actualizar variable global de versión
    content = content.replace(/window\.__ASSET_VERSION__\s*=\s*['"`]\d+['"`]/g, () => {
      changes++;
      return `window.__ASSET_VERSION__ = '${version}'`;
    });
    
    // Escribir archivo actualizado
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`   ✅ ${changes} referencias actualizadas`);
    
    return changes;
  } catch (error) {
    console.error(`   ❌ Error actualizando ${filePath}:`, error.message);
    return 0;
  }
}

// Función para listar todos los archivos CSS y JS en el proyecto
function listProjectFiles() {
  const cssFiles = [];
  const jsFiles = [];
  
  // Función recursiva para buscar archivos
  function scanDirectory(dir) {
    try {
      const files = fs.readdirSync(dir);
      
      for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
          scanDirectory(fullPath);
        } else if (stat.isFile()) {
          const ext = path.extname(file).toLowerCase();
          const relativePath = path.relative('.', fullPath).replace(/\\/g, '/');
          
          if (ext === '.css') {
            cssFiles.push(relativePath);
          } else if (ext === '.js' && !file.includes('update-versions')) {
            jsFiles.push(relativePath);
          }
        }
      }
    } catch (error) {
      // Ignorar errores de permisos
    }
  }
  
  scanDirectory('.');
  
  return { cssFiles, jsFiles };
}

// Función principal
function main() {
  console.log('🚀 === ACTUALIZADOR DE VERSIONES AUTOMÁTICO ===\n');
  
  // Listar archivos del proyecto
  const { cssFiles, jsFiles } = listProjectFiles();
  
  console.log('📂 Archivos encontrados:');
  console.log(`   CSS: ${cssFiles.length} archivos`);
  cssFiles.forEach(file => console.log(`     - ${file}`));
  
  console.log(`   JS: ${jsFiles.length} archivos`);
  jsFiles.forEach(file => console.log(`     - ${file}`));
  
  console.log(`\n🔄 Iniciando actualización con versión: ${version}\n`);
  
  // Actualizar archivos
  let totalChanges = 0;
  
  for (const file of filesToUpdate) {
    if (fs.existsSync(file)) {
      totalChanges += updateVersionsInFile(file);
    } else {
      console.log(`⚠️  Archivo no encontrado: ${file}`);
    }
  }
  
  console.log(`\n✅ === ACTUALIZACIÓN COMPLETADA ===`);
  console.log(`📊 Total de cambios: ${totalChanges}`);
  console.log(`🔖 Nueva versión: ${version}`);
  console.log(`\n💡 Los navegadores ahora cargarán las versiones más recientes de todos los archivos.`);
  
  // Crear archivo de versión para referencia
  const versionInfo = {
    version: version,
    timestamp: new Date().toISOString(),
    files: {
      css: cssFiles,
      js: jsFiles
    },
    totalChanges: totalChanges
  };
  
  fs.writeFileSync('version-info.json', JSON.stringify(versionInfo, null, 2));
  console.log(`📄 Información de versión guardada en: version-info.json`);
}

// Ejecutar si se llama directamente
if (require.main === module) {
  main();
}

module.exports = { updateVersionsInFile, version };
