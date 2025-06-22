// SISTEMA IA SIMPLIFICADO Y SEGURO - SIN BUCLES INFINITOS
// Este reemplaza temporalmente al sistema complejo hasta que se resuelvan los conflictos

console.log('🤖🛡️ Cargando Sistema IA Seguro...');

// Sistema IA simplificado que NO causa bucles infinitos
class SafeAISystem {
  constructor() {
    this.active = true;
    this.errorCount = 0;
    this.maxErrors = 5;
    this.errorTimeout = null;
    
    // Protección anti-bucles
    this.reportingError = false;
    
    console.log('🤖✅ Sistema IA Seguro inicializado');
  }
  
  reportGenericError(system, error, context = {}) {
    // Prevenir bucles infinitos
    if (this.reportingError) return;
    if (this.errorCount >= this.maxErrors) return;
    if (!this.active) return;
    
    this.reportingError = true;
    this.errorCount++;
    
    try {
      console.log(`🤖📝 IA registra error [${system}]: ${error.substring(0, 50)}...`);
      
      // Auto-reparaciones básicas
      if (system === 'CANVAS') {
        this.repairCanvas();
      } else if (system === 'COORDINATES') {
        this.repairCoordinates();
      }
      
      // Reset contador después de un tiempo
      if (this.errorTimeout) clearTimeout(this.errorTimeout);
      this.errorTimeout = setTimeout(() => {
        this.errorCount = 0;
        console.log('🤖🔄 IA: Contador de errores reseteado');
      }, 10000);
      
    } catch (e) {
      console.log('🤖❌ Error en sistema IA seguro:', e.message);
    } finally {
      this.reportingError = false;
    }
  }
  
  reportSuccess(system, message, context = {}) {
    if (!this.active) return;
    console.log(`🤖✅ IA registra éxito [${system}]: ${message.substring(0, 50)}...`);
  }
  
  repairCanvas() {
    try {
      const canvas = document.getElementById('gameCanvas');
      if (canvas) {
        canvas.style.display = 'block';
        canvas.style.visibility = 'visible';
        console.log('🤖🎨 IA: Canvas reparado');
      }
    } catch (e) {
      // Silenciar errores de reparación
    }
  }
  
  repairCoordinates() {
    try {
      if (window.game && window.game.player) {
        const player = window.game.player;
        if (isNaN(player.x) || isNaN(player.y)) {
          player.x = 12.5;
          player.y = 12.5;
          console.log('🤖📍 IA: Coordenadas del jugador reparadas');
        }
      }
    } catch (e) {
      // Silenciar errores de reparación
    }
  }
  
  // Diagnóstico seguro
  diagnosticoCompleto() {
    console.log('🤖🔍 === DIAGNÓSTICO IA SEGURO ===');
    console.log(`Estado IA: ${this.active ? 'Activo' : 'Inactivo'}`);
    console.log(`Errores registrados: ${this.errorCount}/${this.maxErrors}`);
    
    // Verificar canvas
    const canvas = document.getElementById('gameCanvas');
    console.log(`Canvas: ${canvas ? 'Encontrado' : 'No encontrado'}`);
    if (canvas) {
      console.log(`Canvas visible: ${canvas.style.display !== 'none'}`);
    }
    
    // Verificar juego
    console.log(`Juego: ${window.game ? 'Cargado' : 'No cargado'}`);
    if (window.game && window.game.player) {
      console.log(`Jugador: (${window.game.player.x}, ${window.game.player.y})`);
    }
    
    console.log('🤖✅ Diagnóstico completado');
  }
}

// Reemplazar sistema existente con versión segura
window.memorySystem = new SafeAISystem();

// Comandos de emergencia globales
window.diagnosticoIA = () => window.memorySystem.diagnosticoCompleto();
window.emergenciaIA = () => {
  console.log('🚨🤖 Protocolo de emergencia IA');
  window.memorySystem.repairCanvas();
  window.memorySystem.repairCoordinates();
  if (window.reparacionRapida) window.reparacionRapida();
};

console.log('🤖🛡️ Sistema IA Seguro cargado - Sin riesgo de bucles infinitos');
console.log('📋 Comandos: diagnosticoIA(), emergenciaIA()');
