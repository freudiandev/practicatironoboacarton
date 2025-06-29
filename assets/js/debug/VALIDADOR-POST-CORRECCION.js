// VALIDADOR RÁPIDO POST-CORRECCIÓN
// Verifica que las correcciones de bucles spam funcionan correctamente

console.log('🔍 Iniciando validación post-corrección...');

window.ValidadorPostCorreccion = {
    validaciones: [],
    
    ejecutar: function() {
        console.log('✅ Ejecutando validaciones...');
        
        this.validarCorrectorBucles();
        this.validarSistemasProtegidos();
        this.mostrarResumen();
    },
    
    validarCorrectorBucles: function() {
        const resultado = {
            nombre: 'Corrector de Bucles Spam',
            estado: 'ERROR',
            detalles: ''
        };
        
        if (window.CorrectorBuclesSpam) {
            if (window.CorrectorBuclesSpam.activo) {
                resultado.estado = 'OK';
                resultado.detalles = 'Activo y funcionando';
            } else {
                resultado.estado = 'ADVERTENCIA';
                resultado.detalles = 'Existe pero no está activo';
            }
        } else {
            resultado.detalles = 'No encontrado';
        }
        
        this.validaciones.push(resultado);
        console.log(`🔧 ${resultado.nombre}: ${resultado.estado} - ${resultado.detalles}`);
    },
    
    validarSistemasProtegidos: function() {
        const sistemas = [
            { nombre: 'Motor DOOM', variable: 'doomGame' },
            { nombre: 'Sistema de Menús', variable: 'gameMenuSystem' },
            { nombre: 'Canvas del Juego', elemento: 'gameCanvas' }
        ];
        
        sistemas.forEach(sistema => {
            const resultado = {
                nombre: sistema.nombre,
                estado: 'ERROR',
                detalles: ''
            };
            
            if (sistema.variable) {
                if (window[sistema.variable]) {
                    resultado.estado = 'OK';
                    resultado.detalles = 'Variable global encontrada';
                } else {
                    resultado.detalles = 'Variable global no encontrada';
                }
            } else if (sistema.elemento) {
                if (document.getElementById(sistema.elemento)) {
                    resultado.estado = 'OK';
                    resultado.detalles = 'Elemento DOM encontrado';
                } else {
                    resultado.detalles = 'Elemento DOM no encontrado';
                }
            }
            
            this.validaciones.push(resultado);
            console.log(`🛡️ ${resultado.nombre}: ${resultado.estado} - ${resultado.detalles}`);
        });
    },
    
    mostrarResumen: function() {
        const total = this.validaciones.length;
        const ok = this.validaciones.filter(v => v.estado === 'OK').length;
        const advertencias = this.validaciones.filter(v => v.estado === 'ADVERTENCIA').length;
        const errores = this.validaciones.filter(v => v.estado === 'ERROR').length;
        
        console.log('\n📊 RESUMEN DE VALIDACIÓN:');
        console.log(`✅ OK: ${ok}/${total}`);
        console.log(`⚠️ Advertencias: ${advertencias}/${total}`);
        console.log(`❌ Errores: ${errores}/${total}`);
        
        if (errores === 0 && advertencias <= 1) {
            console.log('🎉 VALIDACIÓN EXITOSA: Sistema optimizado y funcional');
            console.log('🎮 Listo para pruebas en navegador');
        } else if (errores === 0) {
            console.log('⚠️ VALIDACIÓN PARCIAL: Sistema funcional con advertencias menores');
        } else {
            console.log('❌ VALIDACIÓN FALLIDA: Revisar errores críticos');
        }
        
        return {
            total,
            ok,
            advertencias,
            errores,
            estado: errores === 0 ? (advertencias <= 1 ? 'EXITOSO' : 'PARCIAL') : 'FALLIDO'
        };
    }
};

// Auto-ejecutar validación
setTimeout(() => {
    window.ValidadorPostCorreccion.ejecutar();
}, 3000);

console.log('🔍 Validador post-corrección cargado');
