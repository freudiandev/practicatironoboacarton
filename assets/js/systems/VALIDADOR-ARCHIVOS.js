// VALIDADOR DE ARCHIVOS - SISTEMA DE VERIFICACIÓN POST-REORGANIZACIÓN
// Desarrollado por Learning Memory System v4.0
// Función: Verificar que todos los archivos referenciados existen

console.log('🔍 VALIDADOR DE ARCHIVOS - INICIANDO VERIFICACIÓN...');

function validarArchivosJS() {
    console.log('📋 Verificando existencia de todos los archivos JS...');
    
    const scripts = document.querySelectorAll('script[src]');
    const archivosNoEncontrados = [];
    const archivosEncontrados = [];
    
    scripts.forEach((script, index) => {
        const src = script.getAttribute('src');
        if (src && src.endsWith('.js')) {
            // Crear una petición para verificar si el archivo existe
            const xhr = new XMLHttpRequest();
            xhr.open('HEAD', src, false); // Síncrono para simplificar
            
            try {
                xhr.send();
                if (xhr.status === 200) {
                    archivosEncontrados.push(src);
                    console.log(`✅ ENCONTRADO: ${src}`);
                } else {
                    archivosNoEncontrados.push(src);
                    console.error(`❌ NO ENCONTRADO: ${src} (Status: ${xhr.status})`);
                }
            } catch (error) {
                archivosNoEncontrados.push(src);
                console.error(`❌ ERROR AL VERIFICAR: ${src} - ${error.message}`);
            }
        }
    });
    
    console.log(`\n📊 RESUMEN DE VALIDACIÓN:`);
    console.log(`✅ Archivos encontrados: ${archivosEncontrados.length}`);
    console.log(`❌ Archivos faltantes: ${archivosNoEncontrados.length}`);
    
    if (archivosNoEncontrados.length > 0) {
        console.warn('\n⚠️ ARCHIVOS FALTANTES:');
        archivosNoEncontrados.forEach(archivo => {
            console.warn(`   - ${archivo}`);
        });
        
        // Registrar en learning memory si está disponible
        if (window.learningMemory) {
            window.learningMemory.registrarEvento('VALIDACION_ARCHIVOS_FALLIDA', {
                archivosFaltantes: archivosNoEncontrados,
                archivosEncontrados: archivosEncontrados.length,
                totalVerificados: scripts.length
            });
        }
        
        return false;
    } else {
        console.log('🎉 VALIDACIÓN COMPLETADA - TODOS LOS ARCHIVOS EXISTEN');
        
        // Registrar éxito en learning memory
        if (window.learningMemory) {
            window.learningMemory.registrarEvento('VALIDACION_ARCHIVOS_EXITOSA', {
                totalArchivos: archivosEncontrados.length,
                reorganizacionCompleta: true
            });
        }
        
        return true;
    }
}

// Función para generar reporte de estructura
function generarReporteEstructura() {
    console.log('\n📁 ESTRUCTURA ACTUAL DE ARCHIVOS:');
    
    const estructuras = {
        'assets/js/core/': 'Núcleo del juego DOOM',
        'assets/js/ai/': 'Inteligencia Artificial y Learning Memory',
        'assets/js/correctors/': 'Correctores y validadores',
        'assets/js/systems/': 'Sistemas de juego (audio, disparo, efectos)',
        'assets/js/deprecated/': 'Archivos obsoletos (si existen)'
    };
    
    Object.entries(estructuras).forEach(([carpeta, descripcion]) => {
        console.log(`📂 ${carpeta}`);
        console.log(`   └── ${descripcion}`);
    });
    
    return estructuras;
}

// Auto-ejecutar validación cuando se carga el script
setTimeout(() => {
    try {
        const validacionExitosa = validarArchivosJS();
        generarReporteEstructura();
        
        if (validacionExitosa) {
            console.log('\n🚀 SISTEMA LISTO PARA FUNCIONAR - REORGANIZACIÓN COMPLETADA');
        } else {
            console.warn('\n⚠️ REQUIERE CORRECCIONES ANTES DE USAR');
        }
    } catch (error) {
        console.error('💥 ERROR EN VALIDACIÓN:', error);
        if (window.learningMemory) {
            window.learningMemory.registrarEvento('ERROR_VALIDACION_CRITICO', {
                error: error.message,
                stack: error.stack
            });
        }
    }
}, 2000); // Esperar 2 segundos para que otros scripts se carguen

// Exportar funciones para uso manual
window.validadorArchivos = {
    validar: validarArchivosJS,
    reporte: generarReporteEstructura
};

console.log('✅ Validador de archivos cargado correctamente');
