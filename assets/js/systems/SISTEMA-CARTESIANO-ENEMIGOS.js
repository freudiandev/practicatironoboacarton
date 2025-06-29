// assets/js/systems/SISTEMA-CARTESIANO-ENEMIGOS.js
// Sistema de referencia cartesiano y movimiento independiente para enemigos
// v1.0 - 2025-06-29

(function(window) {
  'use strict';

  // Sistema de referencia cartesiano para enemigos
  class EnemyPhysicsSystem {
    constructor() {
      this.enemies = [];
      this.lastUpdate = Date.now();
      this.gravity = 0; // Si quieres eje z dinámico, cambia aquí
    }

    // Inicializa enemigos con coordenadas independientes
    setEnemies(enemiesArray) {
      this.enemies = enemiesArray.map(e => ({
        ...e,
        x: e.x ?? 0,
        y: e.y ?? 0,
        z: e.z ?? 0,
        vx: e.vx ?? 0,
        vy: e.vy ?? 0,
        vz: e.vz ?? 0,
        ax: e.ax ?? 0,
        ay: e.ay ?? 0,
        az: e.az ?? 0,
        estado: e.estado ?? 'idle',
        objetivo: e.objetivo ?? null
      }));
    }

    // Actualiza la física de todos los enemigos (llamar en cada frame)
    update(dt = null) {
      const now = Date.now();
      if (!dt) dt = (now - this.lastUpdate) / 1000;
      this.lastUpdate = now;
      for (let enemy of this.enemies) {
        // Movimiento simple: velocidad + aceleración
        enemy.vx += enemy.ax * dt;
        enemy.vy += enemy.ay * dt;
        enemy.vz += (enemy.az - this.gravity) * dt;
        enemy.x += enemy.vx * dt;
        enemy.y += enemy.vy * dt;
        enemy.z += enemy.vz * dt;
        // Limitar z al suelo
        if (enemy.z < 0) { enemy.z = 0; enemy.vz = 0; }
        // Aquí puedes agregar IA: patrulla, persecución, etc.
        if (typeof this.behavior === 'function') {
          this.behavior(enemy, dt);
        }
      }
    }

    // Permite definir una función de IA personalizada
    setBehavior(fn) {
      this.behavior = fn;
    }

    // Devuelve snapshot de coordenadas para renderizado
    getEnemyStates() {
      return this.enemies.map(e => ({ x: e.x, y: e.y, z: e.z, tipo: e.tipo, estado: e.estado }));
    }
  }

  // Instancia global
  window.EnemyPhysicsSystem = EnemyPhysicsSystem;

  // Integración automática si existe window.GAME
  if (window.GAME && Array.isArray(window.GAME.enemies)) {
    window.enemyPhysics = new EnemyPhysicsSystem();
    window.enemyPhysics.setEnemies(window.GAME.enemies);
    // Hook al bucle principal
    const oldUpdate = window.GAME.update;
    window.GAME.update = function() {
      if (typeof oldUpdate === 'function') oldUpdate();
      window.enemyPhysics.update();
    };
    // Ejemplo de IA: patrulla aleatoria
    window.enemyPhysics.setBehavior(function(enemy, dt) {
      // Si está idle, elige dirección aleatoria cada 2s
      if (!enemy._nextChange || Date.now() > enemy._nextChange) {
        const angle = Math.random() * 2 * Math.PI;
        const speed = 40 + Math.random() * 30;
        enemy.vx = Math.cos(angle) * speed;
        enemy.vy = Math.sin(angle) * speed;
        enemy._nextChange = Date.now() + 2000 + Math.random() * 2000;
      }
      // Opcional: evitar salir del mapa
      if (window.GAME && window.GAME.isWalkable) {
        if (!window.GAME.isWalkable(enemy.x + enemy.vx * dt, enemy.y + enemy.vy * dt)) {
          enemy.vx *= -1; enemy.vy *= -1;
        }
      }
    });
    console.log('[SISTEMA-CARTESIANO-ENEMIGOS] Integrado y activo');
  }

})(window);
