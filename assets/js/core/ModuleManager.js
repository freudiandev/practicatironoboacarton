/**
 * GESTOR DE MÓDULOS OPTIMIZADO
 * Sistema central para gestión de todos los módulos del juego
 * Versión: 1.0.0
 */

(function(window) {
  'use strict';

  const ModuleManager = {
    version: '1.0.0',
    modules: new Map(),
    loadOrder: [],
    dependencies: new Map(),
    initialized: false,
    
    /**
     * Registrar un módulo
     */
    register(name, module, dependencies = []) {
      this.modules.set(name, {
        instance: module,
        dependencies: dependencies,
        loaded: false,
        initialized: false,
        errors: []
      });
      
      this.dependencies.set(name, dependencies);
      console.log(`📦 Módulo registrado: ${name}`);
    },
    
    /**
     * Inicializar todos los módulos en orden correcto
     */
    initializeAll() {
      console.log('🚀 === INICIALIZACIÓN DE MÓDULOS ===');
      
      // Calcular orden de carga basado en dependencias
      this.calculateLoadOrder();
      
      // Inicializar en orden
      for (const moduleName of this.loadOrder) {
        this.initializeModule(moduleName);
      }
      
      this.initialized = true;
      console.log('✅ Todos los módulos inicializados');
      
      // Ejecutar verificación post-inicialización
      this.postInitializationCheck();
    },
    
    /**
     * Calcular orden de carga basado en dependencias
     */
    calculateLoadOrder() {
      const visited = new Set();
      const order = [];
      
      const visit = (moduleName) => {
        if (visited.has(moduleName)) return;
        
        const moduleInfo = this.modules.get(moduleName);
        if (!moduleInfo) return;
        
        // Visitar dependencias primero
        for (const dep of moduleInfo.dependencies) {
          visit(dep);
        }
        
        visited.add(moduleName);
        order.push(moduleName);
      };
      
      // Visitar todos los módulos
      for (const moduleName of this.modules.keys()) {
        visit(moduleName);
      }
      
      this.loadOrder = order;
      console.log('📋 Orden de carga calculado:', order);
    },
    
    /**
     * Inicializar módulo específico
     */
    initializeModule(name) {
      const moduleInfo = this.modules.get(name);
      if (!moduleInfo) {
        console.error(`❌ Módulo no encontrado: ${name}`);
        return false;
      }
      
      if (moduleInfo.initialized) {
        console.log(`⏭️ Módulo ya inicializado: ${name}`);
        return true;
      }
      
      try {
        console.log(`🔧 Inicializando: ${name}`);
        
        // Verificar dependencias
        for (const dep of moduleInfo.dependencies) {
          const depInfo = this.modules.get(dep);
          if (!depInfo || !depInfo.initialized) {
            throw new Error(`Dependencia no inicializada: ${dep}`);
          }
        }
        
        // Inicializar módulo
        const module = moduleInfo.instance;
        if (typeof module.initialize === 'function') {
          const result = module.initialize();
          if (result === false) {
            throw new Error('El módulo retornó false en initialize()');
          }
        }
        
        moduleInfo.initialized = true;
        moduleInfo.loaded = true;
        console.log(`✅ ${name} inicializado correctamente`);
        
        return true;
      } catch (error) {
        console.error(`❌ Error inicializando ${name}:`, error);
        moduleInfo.errors.push(error.message);
        return false;
      }
    },
    
    /**
     * Obtener módulo
     */
    get(name) {
      const moduleInfo = this.modules.get(name);
      return moduleInfo ? moduleInfo.instance : null;
    },
    
    /**
     * Verificar si módulo está disponible e inicializado
     */
    isReady(name) {
      const moduleInfo = this.modules.get(name);
      return moduleInfo && moduleInfo.initialized;
    },
    
    /**
     * Verificación post-inicialización
     */
    postInitializationCheck() {
      console.log('🔍 === VERIFICACIÓN POST-INICIALIZACIÓN ===');
      
      const checks = {
        worldPhysics: this.checkWorldPhysics(),
        mapCartographer: this.checkMapCartographer(),
        spawnManager: this.checkSpawnManager(),
        gameCore: this.checkGameCore()
      };
      
      let allGood = true;
      for (const [check, result] of Object.entries(checks)) {
        if (result.status === 'OK') {
          console.log(`✅ ${check}: ${result.message}`);
        } else {
          console.warn(`⚠️ ${check}: ${result.message}`);
          if (result.status === 'ERROR') {
            allGood = false;
          }
        }
      }
      
      if (allGood) {
        console.log('🎉 Sistema completamente operativo');
      } else {
        console.warn('⚠️ Sistema operativo con advertencias');
      }
      
      return checks;
    },
    
    /**
     * Verificar WorldPhysics
     */
    checkWorldPhysics() {
      if (!window.WorldPhysics) {
        return {status: 'ERROR', message: 'WorldPhysics no está cargado'};
      }
      
      if (typeof window.WorldPhysics.checkCollision !== 'function') {
        return {status: 'ERROR', message: 'WorldPhysics.checkCollision no disponible'};
      }
      
      if (typeof window.WorldPhysics.getSafeSpawnPosition === 'function') {
        return {status: 'OK', message: 'WorldPhysics v2.0 con cartografía'};
      }
      
      return {status: 'WARNING', message: 'WorldPhysics básico sin cartografía'};
    },
    
    /**
     * Verificar MapCartographer
     */
    checkMapCartographer() {
      if (!window.MapCartographer) {
        return {status: 'WARNING', message: 'MapCartographer no cargado'};
      }
      
      if (typeof window.MapCartographer.initialize !== 'function') {
        return {status: 'ERROR', message: 'MapCartographer disfuncional'};
      }
      
      return {status: 'OK', message: 'MapCartographer operativo'};
    },
    
    /**
     * Verificar SpawnManager
     */
    checkSpawnManager() {
      if (!window.SpawnManager) {
        return {status: 'WARNING', message: 'SpawnManager no cargado'};
      }
      
      if (typeof window.SpawnManager.buscarCeldaVacia !== 'function') {
        return {status: 'ERROR', message: 'SpawnManager disfuncional'};
      }
      
      return {status: 'OK', message: 'SpawnManager operativo'};
    },
    
    /**
     * Verificar núcleo del juego
     */
    checkGameCore() {
      if (!window.GAME) {
        return {status: 'ERROR', message: 'window.GAME no existe'};
      }
      
      if (!window.GAME.mapaColisiones) {
        return {status: 'ERROR', message: 'Mapa de colisiones no cargado'};
      }
      
      return {status: 'OK', message: 'Núcleo del juego operativo'};
    },
    
    /**
     * Generar reporte de estado
     */
    generateReport() {
      const report = {
        timestamp: new Date().toISOString(),
        version: this.version,
        initialized: this.initialized,
        modules: {},
        loadOrder: this.loadOrder,
        summary: {
          total: this.modules.size,
          loaded: 0,
          initialized: 0,
          errors: 0
        }
      };
      
      for (const [name, info] of this.modules.entries()) {
        report.modules[name] = {
          loaded: info.loaded,
          initialized: info.initialized,
          dependencies: info.dependencies,
          errors: info.errors
        };
        
        if (info.loaded) report.summary.loaded++;
        if (info.initialized) report.summary.initialized++;
        if (info.errors.length > 0) report.summary.errors++;
      }
      
      return report;
    },
    
    /**
     * Reinicializar módulo específico
     */
    reinitialize(name) {
      const moduleInfo = this.modules.get(name);
      if (!moduleInfo) {
        console.error(`❌ Módulo no encontrado: ${name}`);
        return false;
      }
      
      console.log(`🔄 Reinicializando: ${name}`);
      moduleInfo.initialized = false;
      moduleInfo.errors = [];
      
      return this.initializeModule(name);
    },
    
    /**
     * Función de diagnóstico rápido
     */
    quickDiagnosis() {
      console.log('🩺 === DIAGNÓSTICO RÁPIDO ===');
      console.log('Módulos registrados:', this.modules.size);
      console.log('Sistema inicializado:', this.initialized);
      
      const report = this.generateReport();
      console.log('Resumen:', report.summary);
      
      if (!this.initialized) {
        console.log('💡 Ejecuta ModuleManager.initializeAll() para inicializar');
      }
      
      return report;
    }
  };

  // Auto-registrar módulos conocidos cuando se carguen
  const autoRegister = () => {
    // Esperar un poco a que se carguen los módulos
    setTimeout(() => {
      if (window.WorldPhysics) {
        ModuleManager.register('WorldPhysics', window.WorldPhysics);
      }
      
      if (window.MapCartographer) {
        ModuleManager.register('MapCartographer', window.MapCartographer);
      }
      
      if (window.SpawnManager) {
        ModuleManager.register('SpawnManager', window.SpawnManager, ['WorldPhysics', 'MapCartographer']);
      }
      
      console.log('🔄 Auto-registro de módulos completado');
    }, 100);
  };

  // Exponer globalmente
  window.ModuleManager = ModuleManager;
  
  // Auto-registrar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoRegister);
  } else {
    autoRegister();
  }
  
  console.log('📦 ModuleManager v1.0.0 cargado');

})(window);
