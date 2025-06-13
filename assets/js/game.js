// Como el cerebro del juego - guarda si está funcionando o no
window.GameState = {
  isActive: false,

  init() {
    console.log('GameState inicializado');
  },

  setActive(active) {
    this.isActive = active;
    console.log(`GameState.isActive = ${this.isActive}`);
  },

  // Como preguntar si la máquina está encendida
  getActive() {
    return this.isActive;
  }
};
// El director de orquesta que hace que todo funcione como un gran juego de DOOM
class DoomGame {
  constructor() {
    this.canvas = null; // Como el papel donde dibujamos todo
    this.ctx = null; // Como los lápices de colores para dibujar
    this.running = false; // Si el juego está funcionando o parado
    this.player = null; // El héroe que controlamos
    this.inputSystem = null; // Como los oídos que escuchan las teclas
    this.audioSystem = null; // Como una radio que toca sonidos
    this.raycasting = null; // Como ojos láser que ven las paredes 3D
    this.bulletSystem = null; // El administrador de todas las balas
    this.enemySystem = null; // El jefe de todos los enemigos malos
    this.particleSystem = null; // Como fuegos artificiales y efectos mágicos
    this.lastShot = 0; // Reloj que cuenta cuándo disparamos por última vez
    this.score = 0; // Los puntos que ganamos
    this.kills = 0; // Cuántos enemigos hemos derrotado
  }

  init() {
    this.canvas = document.getElementById('gameCanvas');
    if (!this.canvas) {
      console.error('❌ No se encontró el canvas del juego');
      return false;
    }
    
    this.ctx = this.canvas.getContext('2d'); // Conseguir los lápices para dibujar
    this.initPlayer(); // Crear nuestro héroe
    this.initSystems(); // Preparar todas las máquinas del juego
    
    // Como poner el juego en un lugar donde todos lo puedan ver
    window.game = this;    
    console.log('✅ DoomGame inicializado correctamente');
    return true;
  }

  initPlayer() {
    // Crear nuestro héroe con sus poderes iniciales
    this.player = {
      x: CONFIG.player.startX, // Dónde empieza en el mapa (lado a lado)
      y: CONFIG.player.startY, // Qué tan alto está del suelo
      z: CONFIG.player.startZ, // Dónde empieza en el mapa (adelante/atrás)
      angle: 0, // Hacia dónde está mirando (como un reloj)
      pitch: 0, // Si mira hacia arriba o hacia abajo (como asentir)
      health: CONFIG.player.health, // Cuánta vida tiene
      ammo: CONFIG.player.maxAmmo, // Cuántas balas tiene
      speed: CONFIG.player.speed // Qué tan rápido puede correr
    };
    
    // Compartir el héroe con todo el juego para que todos lo conozcan
    window.player = this.player;
  }

  initSystems() {
    // Crear todas las máquinas que hacen funcionar el juego
    this.inputSystem = new InputSystem(this.canvas); // Los oídos que escuchan teclado y mouse
    this.audioSystem = new AudioSystem(); // La radio que toca sonidos
    this.raycasting = new RaycastingEngine(this.canvas, this.ctx); // Los ojos láser que crean el mundo 3D
    this.bulletSystem = new BulletSystem(); // El administrador de balas
    this.enemySystem = new EnemySystem(); // El jefe de los enemigos malos
    
    // Crear la máquina de fuegos artificiales si está disponible
    if (window.ParticleSystem) {
      this.particleSystem = new ParticleSystem(); // Como una caja de fuegos artificiales
      // Compartir los fuegos artificiales para que otros los puedan usar
      window.particleSystemInstance = this.particleSystem;
    } else {
      console.error('❌ ParticleSystem no está disponible');
      this.particleSystem = null;
    }
    
    this.setupControls(); // Enseñar al juego cómo escuchar nuestros comandos
  }
  setupControls() {
    // Cuando hacemos clic, disparamos como en un videojuego de vaqueros
    this.canvas.addEventListener('click', (e) => {
      e.preventDefault();
      this.shoot();
    });

    // Cuando presionamos Escape, paramos el juego como pausar un video
    document.addEventListener('keydown', (e) => {
      if (e.key.toLowerCase() === 'escape') {
        this.stop();
        if (window.menuManager) window.menuManager.showMainMenu();
      } else if (e.key === ' ') {
        e.preventDefault();
        this.shoot(); // Cuando presionamos espacio, también disparamos
      }
    });
  }

  start() {
    this.running = true; // Encender el motor del juego
    this.gameLoop(); // Empezar el bucle mágico que nunca para
  }

  stop() {
    this.running = false; // Apagar el motor del juego
  }

  gameLoop() {
    if (!this.running) return; // Si está apagado, no hacer nada
    
    const currentTime = Date.now(); // Mirar qué hora es ahora
    this.update(currentTime); // Actualizar todo en el mundo
    this.render(); // Dibujar todo en la pantalla
    requestAnimationFrame(() => this.gameLoop()); // Preparar el próximo frame como un flipbook
  }

  update(currentTime) {
    const deltaTime = 0.016; // Como el tick de un reloj (60 veces por segundo)
    
    this.updatePlayer(); // Mover a nuestro héroe
    this.bulletSystem.update(currentTime); // Hacer volar las balas
    this.enemySystem.update(currentTime, this.player); // Hacer que los enemigos se muevan
    
    // Solo actualizar los fuegos artificiales si los tenemos
    if (this.particleSystem) {
      this.particleSystem.update(deltaTime);
    }
    
    this.checkCollisions(); // Ver si las balas tocan a los enemigos
    this.updateUI(); // Actualizar la información en pantalla
  }

  updatePlayer() {
    // Recoger todos los comandos del jugador
    const movement = this.inputSystem.getMovement(); // Hacia dónde quiere caminar
    const cameraRotation = this.inputSystem.getCameraRotation(); // Cómo quiere girar la cabeza
    const mouseRotation = this.inputSystem.getMouseRotation(this.player); // Cómo mueve el mouse
    const dt = 0.016; // El tiempo que pasó (como un tic del reloj)    
    // Movimiento con las teclas WASD como caminar
    const speed = this.player.speed * dt; // Qué tan rápido caminamos
    let newX = this.player.x; // Nueva posición hacia los lados
    let newZ = this.player.z; // Nueva posición hacia adelante/atrás
    
    // W = caminar hacia adelante (como seguir la nariz)
    if (movement.z < 0) { 
      newX += Math.cos(this.player.angle) * speed; 
      newZ += Math.sin(this.player.angle) * speed; 
    }
    // S = caminar hacia atrás (como retroceder)
    if (movement.z > 0) { 
      newX -= Math.cos(this.player.angle) * speed; 
      newZ -= Math.sin(this.player.angle) * speed; 
    }
    // A = caminar hacia la izquierda (como dar pasos de cangrejo)
    if (movement.x < 0) { 
      newX += Math.cos(this.player.angle - Math.PI/2) * speed; 
      newZ += Math.sin(this.player.angle - Math.PI/2) * speed; 
    }
    // D = caminar hacia la derecha (como dar pasos de cangrejo al otro lado)
    if (movement.x > 0) { 
      newX += Math.cos(this.player.angle + Math.PI/2) * speed; 
      newZ += Math.sin(this.player.angle + Math.PI/2) * speed; 
    }
    
    // Solo movernos si no hay pared (como no chocar contra una puerta cerrada)
    if (Utils.canMoveTo(newX, this.player.z)) this.player.x = newX;
    if (Utils.canMoveTo(this.player.x, newZ)) this.player.z = newZ;
    
    // Girar la cabeza hacia los lados (como mirar a izquierda y derecha)
    const rotSpeed = CONFIG.controls?.rotationSpeed || 2.5;
    this.player.angle += cameraRotation.horizontal * rotSpeed * dt; // Con las flechas
    this.player.angle += mouseRotation.horizontal; // Con el mouse
    
    // Mantener el ángulo en el rango correcto (como no dar vueltas infinitas)
    while (this.player.angle > Math.PI) this.player.angle -= 2 * Math.PI;
    while (this.player.angle < -Math.PI) this.player.angle += 2 * Math.PI;
    
    // Mirar hacia arriba y abajo (como asentir o negar)
    const pitchSpeed = CONFIG.controls?.pitchSpeed || 1.5;
    this.player.pitch += cameraRotation.pitch * pitchSpeed * dt; // Con las flechas
    this.player.pitch += mouseRotation.pitch; // Con el mouse
    
    // No dejar que mire demasiado arriba o abajo (como no romper el cuello)
    this.player.pitch = Math.max(CONFIG.player.minPitch, Math.min(CONFIG.player.maxPitch, this.player.pitch));
  }  checkCollisions() {
    // Como un detective que revisa si las balas tocaron a los enemigos
    console.log(`🔄 === DIAGNÓSTICO COMPLETO ===`);
    console.log(`🔫 Balas en bulletSystem: ${this.bulletSystem.bullets.length}`);
    console.log(`👾 Enemigos en enemySystem: ${this.enemySystem.enemies.length}`);
    console.log(`🎯 ¿bulletSystem existe?: ${!!this.bulletSystem}`);
    console.log(`🎯 ¿enemySystem existe?: ${!!this.enemySystem}`);
    console.log(`🎯 ¿enemies array existe?: ${!!this.enemySystem.enemies}`);
    
    // Mostrar cómo están todas las balas volando
    this.bulletSystem.bullets.forEach((bullet, i) => {
      console.log(`🔫 Bala ${i}: x=${bullet.x}, z=${bullet.z}, shooter=${bullet.shooter}`);
    });
    
    // Mostrar estado de cada enemigo
    this.enemySystem.enemies.forEach((enemy, i) => {
      console.log(`👾 Enemigo ${i}: x=${enemy.x}, z=${enemy.z}, vida=${enemy.health}, vivo=${enemy.alive}`);
    });
    
    const hits = this.bulletSystem.checkCollisions(this.enemySystem.enemies);
    
    console.log(`🔄 Procesando ${hits.length} impactos detectados`);
    
    // Ordenar hits por índice de bala en orden descendente para eliminar correctamente
    hits.sort((a, b) => b.bulletIndex - a.bulletIndex);
    
    hits.forEach((hit, index) => {
      console.log(`🎯 Procesando impacto ${index + 1}: daño=${hit.damage}, headshot=${hit.isHeadshot}, vida enemigo=${hit.enemy.health}`);
      
      const died = this.enemySystem.takeDamage(hit.enemy, hit.damage, hit.isHeadshot);
      
      console.log(`⚰️ ¿Enemigo murió? ${died}`);
      
      // Crear efectos de chispas en el impacto
      if (this.particleSystem) {
        if (hit.isHeadshot) {
          // Chispas rojas para headshots
          this.createBloodSparks(hit.impact.x, hit.impact.z, hit.impact.y, 'headshot');
        } else {
          // Chispas normales para impactos corporales
          this.createBloodSparks(hit.impact.x, hit.impact.z, hit.impact.y, 'body');
        }
      }
      
      if (hit.isHeadshot) {
        this.showHeadshotIndicator();
        this.audioSystem.playHeadshot();
        this.score += 100;
      } else {
        this.audioSystem.playHit();
        this.score += 25;
      }
      
      if (died) {
        this.audioSystem.playDeath();
        this.kills++;
        this.score += 200;
      }
      
      // Eliminar la bala que impactó
      this.bulletSystem.removeBullet(hit.bulletIndex);
    });
  }

  // Crear chispas de sangre/impacto en enemigos
  createBloodSparks(x, z, y, type) {
    const sparkCount = type === 'headshot' ? 12 : 8;
    const colors = type === 'headshot' ? ['#FF0000', '#CC0000', '#990000', '#FF3333'] : ['#FF6666', '#FF9999', '#CC6666'];
    
    for (let i = 0; i < sparkCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = (type === 'headshot' ? 120 : 80) + Math.random() * 60;
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      this.particleSystem.sparks.push({
        x: x,
        z: z,
        y: y || 30,
        vx: Math.cos(angle) * speed,
        vz: Math.sin(angle) * speed,
        vy: 40 + Math.random() * 80,
        life: 0.8,
        maxLife: 0.8,
        decay: 0.025 + Math.random() * 0.015,
        size: 2 + Math.random() * 3,
        color: color,
        glowSize: 6 + Math.random() * 4,
        trail: [],
        trailIntensity: 0.7,
        sparkType: type === 'headshot' ? 'blood_critical' : 'blood_normal'
      });
    }
  }
  shoot() {
    // Verificar munición y cooldown
    if (this.player.ammo <= 0) {
      console.log('❌ Sin munición');
      return;
    }
    
    const currentTime = Date.now();
    if (currentTime - this.lastShot < CONFIG.bullet.cooldown) {
      console.log('❌ Disparo en cooldown');
      return;
    }
    
    // NUEVO: Calcular dirección exacta hacia donde apunta el crosshair/mouse
    const mouseX = this.inputSystem.mouse.x;
    const mouseY = this.inputSystem.mouse.y;
    
    // Usar raycasting para encontrar el punto 3D hacia donde apunta el mouse
    const rayAngle = ((mouseX / this.canvas.width) - 0.5) * CONFIG.world.fov;
    const shootAngle = this.player.angle + rayAngle;
    
    // Calcular altura basada en la posición Y del mouse y el pitch
    const normalizedMouseY = (mouseY / this.canvas.height) - 0.5; // -0.5 a 0.5
    const pitchFromMouse = normalizedMouseY * (CONFIG.player.maxPitch - CONFIG.player.minPitch);
    
    // Posición inicial de la bala: desde el centro del jugador hacia la dirección del mouse
    const bulletStartX = this.player.x + Math.cos(shootAngle) * 20;
    const bulletStartZ = this.player.z + Math.sin(shootAngle) * 20;
    const bulletStartY = this.player.y + pitchFromMouse * 20; // Ajuste de altura basado en mouse
    
    // Guardar posición de disparo para detección de headshot
    this.player.shootY = mouseY;
      console.log(`🎯 Disparo hacia mouse: mouseX=${mouseX.toFixed(1)}, mouseY=${mouseY.toFixed(1)}, ángulo=${shootAngle.toFixed(3)}`);
    
    // Crear la bala con la dirección exacta (incluyendo pitch)
    this.bulletSystem.addBullet(bulletStartX, bulletStartZ, bulletStartY, shootAngle, 'player', pitchFromMouse);
    
    // Reducir munición
    this.player.ammo--;
    this.lastShot = currentTime;
    
    // Efectos de sonido
    if (this.audioSystem && this.audioSystem.playShoot) {
      this.audioSystem.playShoot();
    }
    
    // Efectos visuales en la posición correcta
    if (this.particleSystem) {
      this.particleSystem.createMuzzleSparks(bulletStartX, bulletStartZ, shootAngle);
    }
    
    console.log(`🔥 Disparo ejecutado hacia crosshair! Munición restante: ${this.player.ammo}`);
  }
  showHeadshotIndicator() {
    // Mostrar indicador de headshot en el DOM si existe
    const indicator = document.getElementById('headshotIndicator');
    if (indicator) {
      indicator.textContent = CONFIG.ui.headshotText;
      indicator.style.display = 'block';
      
      setTimeout(() => {
        indicator.style.display = 'none';
      }, CONFIG.ui.headshotDuration);
    }
    
    // Mostrar headshot en canvas directamente (más espectacular)
    this.headshotDisplay = {
      text: CONFIG.ui.headshotText,
      startTime: Date.now(),
      duration: CONFIG.ui.headshotDuration,
      fontSize: CONFIG.ui.headshotFontSize,
      color: CONFIG.ui.headshotColor
    };
  }
  render() {
    this.raycasting.render(this.player);
    this.bulletSystem.render(this.ctx, this.player);
    this.enemySystem.render(this.ctx, this.player, this.raycasting);
    
    // Solo renderizar partículas si el sistema existe
    if (this.particleSystem) {
      this.particleSystem.render(this.ctx, this.player);
      this.particleSystem.renderBulletHoles(this.ctx, this.player);
    }
    
    this.renderCrosshair();
    this.renderHeadshotDisplay();
  }

  renderCrosshair() {
    const pos = this.inputSystem.getCrosshairPosition();
    if (!pos) return;
    
    this.ctx.save();
    
    // Cruz roja brillante con sombra para mejor visibilidad
    this.ctx.strokeStyle = CONFIG.ui.crosshairColor;
    this.ctx.lineWidth = 3;
    this.ctx.lineCap = 'round';
    this.ctx.shadowColor = '#000000';
    this.ctx.shadowBlur = 3;
    this.ctx.shadowOffsetX = 1;
    this.ctx.shadowOffsetY = 1;
    
    const size = CONFIG.ui.crosshairSize;
    const gap = 8;
    
    // Dibujar cruz perfectamente centrada en el mouse
    this.ctx.beginPath();
    // Línea horizontal
    this.ctx.moveTo(pos.x - size, pos.y);
    this.ctx.lineTo(pos.x - gap, pos.y);
    this.ctx.moveTo(pos.x + gap, pos.y);
    this.ctx.lineTo(pos.x + size, pos.y);
    // Línea vertical
    this.ctx.moveTo(pos.x, pos.y - size);
    this.ctx.lineTo(pos.x, pos.y - gap);
    this.ctx.moveTo(pos.x, pos.y + gap);
    this.ctx.lineTo(pos.x, pos.y + size);
    this.ctx.stroke();
    
    // Punto central más grande y visible
    this.ctx.shadowBlur = 0;
    this.ctx.shadowOffsetX = 0;
    this.ctx.shadowOffsetY = 0;
    this.ctx.fillStyle = CONFIG.ui.crosshairColor;
    this.ctx.beginPath();
    this.ctx.arc(pos.x, pos.y, 3, 0, Math.PI * 2);
    this.ctx.fill();
    
    this.ctx.restore();
  }

  renderHeadshotDisplay() {
    if (!this.headshotDisplay) return;
    
    const currentTime = Date.now();
    const elapsed = currentTime - this.headshotDisplay.startTime;
    
    if (elapsed > this.headshotDisplay.duration) {
      this.headshotDisplay = null;
      return;
    }
    
    const ctx = this.ctx;
    const progress = elapsed / this.headshotDisplay.duration;
    
    // Efecto de desvanecimiento
    const alpha = 1 - (progress * 0.7); // Se desvanece gradualmente
    
    // Efecto de escala (crece y luego se reduce)
    const scale = 1 + (Math.sin(progress * Math.PI) * 0.3);
    
    ctx.save();
    ctx.globalAlpha = alpha;
    
    // Configurar texto
    const fontSize = this.headshotDisplay.fontSize * scale;
    ctx.font = `bold ${fontSize}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Posición central de la pantalla
    const x = ctx.canvas.width / 2;
    const y = ctx.canvas.height / 2 - 100; // Ligeramente arriba del centro
    
    // Sombra del texto
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillText(this.headshotDisplay.text, x + 3, y + 3);
    
    // Texto principal en rojo
    ctx.fillStyle = this.headshotDisplay.color;
    ctx.fillText(this.headshotDisplay.text, x, y);
    
    // Borde del texto
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.strokeText(this.headshotDisplay.text, x, y);
    
    ctx.restore();
  }

  updateUI() {
    document.getElementById('health').textContent = this.player.health;
    document.getElementById('ammo').textContent = this.player.ammo;
    document.getElementById('enemies').textContent = this.enemySystem.getAliveCount();
    document.getElementById('score').textContent = this.score;
  }
}

window.DoomGame = DoomGame;

// 🧪 FUNCIÓN DE DEBUG TEMPORAL PARA PROBAR PITCH
window.debugPitch = function(direction) {
  if (!window.player) {
    console.log('❌ Player no disponible para debug');
    return;
  }
  
  const oldPitch = window.player.pitch || 0;
  
  if (direction === 'up') {
    window.player.pitch = (window.player.pitch || 0) + 0.1;
    console.log(`🔼 DEBUG: Forzando pitch ARRIBA - Antes: ${oldPitch.toFixed(3)}, Después: ${window.player.pitch.toFixed(3)}`);
  } else if (direction === 'down') {
    window.player.pitch = (window.player.pitch || 0) - 0.1;
    console.log(`🔽 DEBUG: Forzando pitch ABAJO - Antes: ${oldPitch.toFixed(3)}, Después: ${window.player.pitch.toFixed(3)}`);
  } else if (direction === 'reset') {
    window.player.pitch = 0;
    console.log(`↩️ DEBUG: Reseteando pitch a 0`);
  }
  
  // Aplicar límites
  const minPitch = CONFIG.player?.minPitch || -Math.PI/3;
  const maxPitch = CONFIG.player?.maxPitch || Math.PI/3;
  window.player.pitch = Math.max(minPitch, Math.min(maxPitch, window.player.pitch));
  
  console.log(`🎯 Pitch final después de límites: ${window.player.pitch.toFixed(3)}`);
};

console.log('🎮 Game manager cargado');
console.log('🧪 Debug functions loaded - Use debugPitch("up"), debugPitch("down"), debugPitch("reset")');