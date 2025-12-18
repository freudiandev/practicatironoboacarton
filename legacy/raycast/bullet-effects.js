/**
 * SISTEMA DE BALAS Y EFECTOS VISUALES
 * Maneja renderizado de balas, chispas, humo y orificios en paredes
 */

class BulletEffectsSystem {
  constructor() {
    this.bullets = [];
    this.wallHoles = [];
    this.particles = [];
    this.muzzleFlashes = [];
    
    // Configuración de efectos
    this.config = {
      bulletSpeed: 15,
      bulletSize: 3,
      bulletColor: '#FFD700', // Dorado brillante
      bulletTrail: '#FFA500', // Naranja para estela
      sparkCount: 14,
      smokeParticles: 18,
      muzzleFlashDuration: 100,
      wallHoleSize: 8
    };

    this.sharedOverlay = this.getSharedOverlayContext();
    this.visualState = this.sharedOverlay.state;
    this.overlayElement = this.sharedOverlay.container || null;
    this.p5Instance = this.sharedOverlay.instance || null;
    this.overlayInitScheduled = false;
    this.ensureP5Overlay();
  }

  // Crear una nueva bala desde el jugador
  createBullet(startX, startZ, angle, verticalLook = 0, screenData = null) {
    const finalAngle = (screenData && typeof screenData.aimAdjustment === 'number')
      ? angle + screenData.aimAdjustment
      : angle;

    const bullet = {
      id: Date.now() + Math.random(),
      x: startX,
      z: startZ,
      y: 64 + (verticalLook * 100), // Altura ajustada por mirada vertical
      angle: finalAngle,
      speed: this.config.bulletSpeed,
      distance: 0,
      maxDistance: 1000,
      active: true,
      trail: [], // Estela de la bala
      size: this.config.bulletSize,
      startTime: Date.now()
    };
    
    this.bullets.push(bullet);
    
    // Crear efectos sutiles de disparo
    this.createShotEffects(startX, startZ);

    // Disparar capa visual p5 si está disponible
    this.spawnVisualShot(screenData);
    
    console.log(`🔫 Bala creada en (${startX.toFixed(1)}, ${startZ.toFixed(1)}) ángulo: ${(angle * 180 / Math.PI).toFixed(1)}°`);
    return bullet;
  }

  // Actualizar todas las balas
  updateBullets(game) {
    this.bullets = this.bullets.filter(bullet => {
      if (!bullet.active) return false;
      
      // Guardar posición anterior para la estela
      bullet.trail.push({ x: bullet.x, z: bullet.z });
      if (bullet.trail.length > 5) {
        bullet.trail.shift(); // Mantener solo las últimas 5 posiciones
      }
      
      // Mover bala
      const deltaX = Math.cos(bullet.angle) * bullet.speed;
      const deltaZ = Math.sin(bullet.angle) * bullet.speed;
      
      bullet.x += deltaX;
      bullet.z += deltaZ;
      bullet.distance += bullet.speed;
      
      // Verificar colisión con pared
      if (this.checkWallCollision(bullet, game)) {
        this.createWallHole(bullet);
        this.createWallImpactEffects(bullet);
        bullet.active = false;
        return false;
      }
      
      // Verificar rango máximo
      if (bullet.distance >= bullet.maxDistance) {
        bullet.active = false;
        return false;
      }
      
      return true;
    });

    // Actualizar partículas asociadas (texto, sangre, etc.)
    this.updateParticles();
  }

  // Verificar colisión con paredes
  checkWallCollision(bullet, game) {
    const cellSize = game.GAME_CONFIG?.cellSize || 128;
    const gridX = Math.floor(bullet.x / cellSize);
    const gridZ = Math.floor(bullet.z / cellSize);
    
    if (game.MAZE && game.MAZE[gridZ] && game.MAZE[gridZ][gridX] === 1) {
      return true;
    }
    return false;
  }

  // Verificar colisión con enemigos
  checkEnemyCollision(bullet, game) {
    if (!game.enemies || typeof game.getEnemyHitZone !== 'function') return false;

    for (let enemyIndex = 0; enemyIndex < game.enemies.length; enemyIndex++) {
      const enemy = game.enemies[enemyIndex];
      if (!enemy || enemy.health <= 0 || enemy.hidden) continue;

      const dx = bullet.x - enemy.x;
      const dz = bullet.z - enemy.z;
      const distance = Math.sqrt(dx * dx + dz * dz);

      const threshold = (typeof game.getEnemyHitDistanceThreshold === 'function')
        ? game.getEnemyHitDistanceThreshold(enemy)
        : 55;
      if (distance > threshold) continue;

      const hitInfo = game.getEnemyHitZone(enemy, 6);
      if (!hitInfo) continue;

      if (typeof game.registerEnemyHit === 'function') {
        game.registerEnemyHit(enemy, hitInfo.zone, {
          enemyIndex,
          bullet,
          source: 'effects'
        });
      }

      return true;
    }
    return false;
  }

  // Crear efectos sutiles de disparo (humo y chispas)
  createShotEffects(x, z) {
    // Crear humo sutil
    for (let i = 0; i < 3; i++) {
      this.particles.push({
        type: 'smoke',
        x: x + (Math.random() - 0.5) * 20,
        z: z + (Math.random() - 0.5) * 20,
        y: 60 + Math.random() * 20,
        vx: (Math.random() - 0.5) * 2,
        vz: (Math.random() - 0.5) * 2,
        vy: Math.random() * 3 + 1,
        size: Math.random() * 8 + 4,
        life: 1.0,
        decay: 0.02,
        color: `rgba(100, 100, 100, 0.3)`
      });
    }
    
    // Crear chispas sutiles
    for (let i = 0; i < 5; i++) {
      this.particles.push({
        type: 'spark',
        x: x + (Math.random() - 0.5) * 15,
        z: z + (Math.random() - 0.5) * 15,
        y: 55 + Math.random() * 15,
        vx: (Math.random() - 0.5) * 4,
        vz: (Math.random() - 0.5) * 4,
        vy: Math.random() * 2 + 0.5,
        size: Math.random() * 3 + 1,
        life: 1.0,
        decay: 0.05,
        color: '#FFD700'
      });
    }
  }

  // Crear explosión de sangre cuando se golpea un enemigo
  createBloodBurst(x, z, y = 64) {
    // Crear múltiples partículas de sangre
    for (let i = 0; i < 8; i++) {
      this.particles.push({
        type: 'blood-burst',
        x: x + (Math.random() - 0.5) * 30,
        z: z + (Math.random() - 0.5) * 30,
        y: y + (Math.random() - 0.5) * 20,
        vx: (Math.random() - 0.5) * 6,
        vz: (Math.random() - 0.5) * 6,
        vy: Math.random() * 4 + 1,
        size: Math.random() * 6 + 2,
        life: 1.0,
        decay: 0.03,
        color: '#8B0000' // Rojo sangre oscuro
      });
    }
    console.log(`🩸 Efectos de sangre creados en (${x.toFixed(1)}, ${z.toFixed(1)})`);
  }

  // Crear orificio en la pared
  createWallHole(bullet) {
    const hole = {
      x: bullet.x,
      z: bullet.z,
      size: this.config.wallHoleSize,
      created: Date.now()
    };
    
    this.wallHoles.push(hole);
    console.log(`🕳️ Orificio creado en pared (${bullet.x.toFixed(1)}, ${bullet.z.toFixed(1)})`);
  }

  // Crear efectos de impacto en pared
  createWallImpactEffects(bullet) {
    // Chispas
    for (let i = 0; i < this.config.sparkCount; i++) {
      this.particles.push({
        type: 'spark',
        x: bullet.x,
        z: bullet.z,
        y: bullet.y,
        vx: (Math.random() - 0.5) * 8,
        vz: (Math.random() - 0.5) * 8,
        vy: Math.random() * 4,
        life: 1.0,
        decay: 0.02,
        color: `hsl(${30 + Math.random() * 20}, 100%, ${60 + Math.random() * 40}%)`
      });
    }
    
    // Humo
    for (let i = 0; i < this.config.smokeParticles; i++) {
      this.particles.push({
        type: 'smoke',
        x: bullet.x + (Math.random() - 0.5) * 10,
        z: bullet.z + (Math.random() - 0.5) * 10,
        y: bullet.y,
        vx: (Math.random() - 0.5) * 2,
        vz: (Math.random() - 0.5) * 2,
        vy: Math.random() * 2,
        life: 1.0,
        decay: 0.008,
        size: 2 + Math.random() * 4,
        color: `rgba(128, 128, 128, ${0.3 + Math.random() * 0.4})`
      });
    }
  }

  // Crear destello del cañón
  createMuzzleFlash(x, z) {
    this.muzzleFlashes.push({
      x: x,
      z: z,
      life: 1.0,
      decay: 0.05,
      size: 20 + Math.random() * 15,
      created: Date.now()
    });
  }

  // Crear efecto de sangre
  createBloodEffect(x, z) {
    for (let i = 0; i < 15; i++) {
      this.particles.push({
        type: 'blood',
        x: x + (Math.random() - 0.5) * 20,
        z: z + (Math.random() - 0.5) * 20,
        y: 50 + Math.random() * 30,
        vx: (Math.random() - 0.5) * 6,
        vz: (Math.random() - 0.5) * 6,
        vy: Math.random() * 3,
        life: 1.0,
        decay: 0.01,
        size: 1 + Math.random() * 3,
        color: `hsl(0, ${80 + Math.random() * 20}%, ${20 + Math.random() * 30}%)`
      });
    }
  }

  // Crear efecto de headshot
  createHeadshotEffect() {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2 - 80;
    const now = Date.now();

    this.particles.push({
      type: 'headshot-text',
      text: 'HEADSHOT',
      x: centerX,
      y: centerY,
      life: 1.0,
      decay: 0.03,
      size: 64,
      color: '#b30000',
      strokeColor: 'rgba(0,0,0,0.85)',
      shadow: true,
      jitter: 2.2,
      dripDelay: 80,
      created: now
    });

    this.particles.push({
      type: 'headshot-splash',
      x: centerX,
      y: centerY + 40,
      radius: Math.max(window.innerWidth, window.innerHeight) * 0.35,
      life: 0.6,
      decay: 0.05,
      color: 'rgba(120,0,0,0.8)',
      created: now
    });

    for (let i = 0; i < 28; i++) {
      this.particles.push({
        type: 'blood-burst',
        x: centerX + (Math.random() - 0.5) * 220,
        y: centerY + (Math.random() - 0.5) * 120,
        vx: (Math.random() - 0.5) * 12,
        vy: Math.random() * 4,
        life: 1.0,
        decay: 0.025,
        size: 3 + Math.random() * 6,
        color: `hsl(0, 100%, ${18 + Math.random() * 20}%)`
      });
    }

    for (let i = 0; i < 18; i++) {
      this.particles.push({
        type: 'headshot-drip',
        x: centerX + (Math.random() - 0.5) * 160,
        y: centerY + Math.random() * 40,
        vx: (Math.random() - 0.5) * 1.5,
        vy: Math.random() * 1.5 + 1.2,
        width: Math.random() * 6 + 2,
        height: Math.random() * 18 + 14,
        life: 1.0,
        decay: 0.04,
        color: 'rgba(120,0,0,0.85)'
      });
    }
  }

  // Actualizar partículas
  updateParticles() {
    this.particles = this.particles.filter(particle => {
      particle.life -= particle.decay;
      
      if (particle.type === 'spark' || particle.type === 'smoke' || particle.type === 'blood') {
        particle.x += particle.vx;
        particle.z += particle.vz;
        particle.y += particle.vy;
        particle.vy -= 0.1; // Gravedad
      }
      
      if (particle.type === 'blood-burst') {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vy += 0.2; // Gravedad inversa para efecto dramático
      }

      if (particle.type === 'headshot-drip') {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vy += 0.45;
        particle.width *= 0.98;
      }

      if (particle.type === 'headshot-text') {
        particle.y += Math.sin(Date.now() * 0.01) * 0.3;
      }
      
      return particle.life > 0;
    });
    
    // Actualizar destellos del cañón
    this.muzzleFlashes = this.muzzleFlashes.filter(flash => {
      flash.life -= flash.decay;
      return flash.life > 0;
    });
  }

  // Renderizar todo el sistema en 2D (para HUD y efectos de pantalla)
  render2D(ctx) {
    // Renderizar partículas 2D (como el texto de headshot)
    this.particles.forEach(particle => {
      if (particle.type === 'headshot-text') {
        ctx.save();
        const alpha = Math.max(0, Math.min(1, particle.life));
        ctx.globalAlpha = alpha;
        const gradient = ctx.createLinearGradient(particle.x, particle.y - particle.size, particle.x, particle.y + particle.size);
        gradient.addColorStop(0, 'rgba(255, 80, 80, 1)');
        gradient.addColorStop(0.5, 'rgba(168, 0, 0, 1)');
        gradient.addColorStop(1, 'rgba(80, 0, 0, 0.95)');

        ctx.fillStyle = gradient;
        ctx.strokeStyle = particle.strokeColor || 'rgba(0,0,0,0.9)';
        ctx.lineWidth = 4;
        ctx.font = `900 ${particle.size}px Impact, Arial Black, sans-serif`;
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(180,0,0,0.8)';
        ctx.shadowBlur = 18;
        ctx.shadowOffsetY = 4;

        const jitterX = (Math.random() - 0.5) * particle.jitter;
        ctx.strokeText(particle.text, particle.x + jitterX, particle.y);
        ctx.fillText(particle.text, particle.x + jitterX, particle.y);
        ctx.restore();
      }
      
      if (particle.type === 'blood-burst') {
        ctx.save();
        ctx.globalAlpha = particle.life * 0.8;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      if (particle.type === 'headshot-drip') {
        ctx.save();
        ctx.globalAlpha = particle.life;
        ctx.fillStyle = particle.color;
        const radius = Math.min(4, particle.width * 0.5);
        ctx.beginPath();
        ctx.moveTo(particle.x + radius, particle.y);
        ctx.lineTo(particle.x + particle.width - radius, particle.y);
        ctx.quadraticCurveTo(particle.x + particle.width, particle.y, particle.x + particle.width, particle.y + radius);
        ctx.lineTo(particle.x + particle.width, particle.y + particle.height - radius);
        ctx.quadraticCurveTo(
          particle.x + particle.width,
          particle.y + particle.height,
          particle.x + particle.width - radius,
          particle.y + particle.height
        );
        ctx.lineTo(particle.x + radius, particle.y + particle.height);
        ctx.quadraticCurveTo(particle.x, particle.y + particle.height, particle.x, particle.y + particle.height - radius);
        ctx.lineTo(particle.x, particle.y + radius);
        ctx.quadraticCurveTo(particle.x, particle.y, particle.x + radius, particle.y);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

      if (particle.type === 'headshot-splash') {
        ctx.save();
        ctx.globalAlpha = particle.life * 0.5;
        const splashGradient = ctx.createRadialGradient(
          particle.x,
          particle.y,
          particle.radius * 0.1,
          particle.x,
          particle.y,
          particle.radius
        );
        splashGradient.addColorStop(0, 'rgba(90,0,0,0.6)');
        splashGradient.addColorStop(1, 'rgba(120,0,0,0)');
        ctx.fillStyle = splashGradient;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      
      if (particle.type === 'smoke') {
        ctx.save();
        ctx.globalAlpha = particle.life * 0.4;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      
      if (particle.type === 'spark') {
        ctx.save();
        ctx.globalAlpha = particle.life;
        ctx.fillStyle = particle.color;
        ctx.shadowColor = particle.color;
        ctx.shadowBlur = 3;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    });
  }

  // Método principal para actualizar todo
  update(game) {
    this.updateBullets(game);
    this.updateParticles();
  }

  normalizeScreenData(screenData = null) {
    const data = screenData || {};

    const toNumber = (value) => {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : null;
    };

    const fallbackWidth =
      (this.sharedOverlay && Number.isFinite(this.sharedOverlay.viewportWidth) && this.sharedOverlay.viewportWidth) ||
      (typeof window !== 'undefined' && window.DoomGame && Number.isFinite(window.DoomGame.width) && window.DoomGame.width) ||
      (typeof window !== 'undefined' && Number.isFinite(window.innerWidth) && window.innerWidth) ||
      1280;

    const fallbackHeight =
      (this.sharedOverlay && Number.isFinite(this.sharedOverlay.viewportHeight) && this.sharedOverlay.viewportHeight) ||
      (typeof window !== 'undefined' && window.DoomGame && Number.isFinite(window.DoomGame.height) && window.DoomGame.height) ||
      (typeof window !== 'undefined' && Number.isFinite(window.innerHeight) && window.innerHeight) ||
      720;

    const widthCandidate = toNumber(data.canvasWidth);
    const heightCandidate = toNumber(data.canvasHeight);
    const width = widthCandidate !== null ? widthCandidate : fallbackWidth;
    const height = heightCandidate !== null ? heightCandidate : fallbackHeight;

    const crosshairCandidateX = data.crosshair ? toNumber(data.crosshair.x) : null;
    const crosshairCandidateY = data.crosshair ? toNumber(data.crosshair.y) : null;
    const muzzleCandidateX = data.muzzle ? toNumber(data.muzzle.x) : null;
    const muzzleCandidateY = data.muzzle ? toNumber(data.muzzle.y) : null;

    return {
      width,
      height,
      crosshair: {
        x: crosshairCandidateX !== null ? crosshairCandidateX : width / 2,
        y: crosshairCandidateY !== null ? crosshairCandidateY : height / 2
      },
      muzzle: {
        x: muzzleCandidateX !== null ? muzzleCandidateX : width * 0.82,
        y: muzzleCandidateY !== null ? muzzleCandidateY : height * 0.78
      },
      aimAdjustment: toNumber(data.aimAdjustment) || 0
    };
  }

  createOverlayState() {
    const now = (typeof performance !== 'undefined' && typeof performance.now === 'function')
      ? performance.now()
      : Date.now();
    return {
      bullets: [],
      particles: [],
      lastFrameTime: now
    };
  }

  getSharedOverlayContext() {
    if (typeof window === 'undefined') {
      if (!BulletEffectsSystem.__overlayContext) {
        BulletEffectsSystem.__overlayContext = {
          state: this.createOverlayState(),
          container: null,
          instance: null,
          viewportWidth: 1280,
          viewportHeight: 720
        };
      }
      return BulletEffectsSystem.__overlayContext;
    }

    const global = window.__BulletEffectsP5Overlay || {};
    if (!global.state) {
      global.state = this.createOverlayState();
    }
    if (!Number.isFinite(global.viewportWidth)) {
      global.viewportWidth = 1280;
    }
    if (!Number.isFinite(global.viewportHeight)) {
      global.viewportHeight = 720;
    }
    if (!global.container) {
      global.container = null;
    }
    if (!global.instance) {
      global.instance = null;
    }
    window.__BulletEffectsP5Overlay = global;
    return global;
  }

  ensureP5Overlay() {
    if (typeof window === 'undefined') return;

    if (this.sharedOverlay.instance && !this.p5Instance) {
      this.p5Instance = this.sharedOverlay.instance;
    }
    if (this.sharedOverlay.container && !this.overlayElement) {
      this.overlayElement = this.sharedOverlay.container;
    }
    if (this.p5Instance && this.overlayElement) {
      return;
    }
    if (this.overlayInitScheduled) {
      return;
    }

    this.overlayInitScheduled = true;
    const attemptInit = () => {
      if (this.sharedOverlay.instance) {
        this.p5Instance = this.sharedOverlay.instance;
        this.overlayElement = this.sharedOverlay.container;
        this.overlayInitScheduled = false;
        return;
      }
      if (window.p5 && typeof window.p5 === 'function') {
        this.initP5Overlay();
        this.overlayInitScheduled = false;
        return;
      }
      setTimeout(attemptInit, 120);
    };
    attemptInit();
  }

  initP5Overlay() {
    if (typeof window === 'undefined' || !window.p5) {
      return;
    }

    if (this.sharedOverlay.instance) {
      this.p5Instance = this.sharedOverlay.instance;
      this.overlayElement = this.sharedOverlay.container;
      return;
    }

    const host = document.getElementById('game-container') || document.body;
    if (!host) {
      return;
    }

    if (!this.sharedOverlay.container || !this.sharedOverlay.container.isConnected) {
      const wrapper = document.createElement('div');
      wrapper.className = 'bullet-effects-overlay';
      wrapper.style.position = 'absolute';
      wrapper.style.top = '0';
      wrapper.style.left = '0';
      wrapper.style.width = '100%';
      wrapper.style.height = '100%';
      wrapper.style.pointerEvents = 'none';
      wrapper.style.zIndex = '6';
      wrapper.style.display = 'flex';
      wrapper.style.alignItems = 'center';
      wrapper.style.justifyContent = 'center';
      host.appendChild(wrapper);
      this.sharedOverlay.container = wrapper;
    }

    const overlay = this.sharedOverlay.container;
    const self = this;

    const sketch = function(p) {
      p.setup = function() {
        const width = self.sharedOverlay.viewportWidth || 1280;
        const height = self.sharedOverlay.viewportHeight || 720;
        const canvas = p.createCanvas(width, height);
        canvas.elt.style.pointerEvents = 'none';
        canvas.elt.style.display = 'block';
        canvas.elt.style.width = width + 'px';
        canvas.elt.style.height = height + 'px';
        p.pixelDensity(1);
        p.clear();
      };

      p.draw = function() {
        self.drawP5Overlay(p);
      };

      p.windowResized = function() {
        self.handleOverlayResize(p);
      };
    };

    const instance = new window.p5(sketch, overlay);
    this.sharedOverlay.instance = instance;
    this.p5Instance = instance;
    this.overlayElement = overlay;
    this.syncOverlaySize(this.sharedOverlay.viewportWidth, this.sharedOverlay.viewportHeight);
  }

  drawP5Overlay(p) {
    if (!this.sharedOverlay || !this.sharedOverlay.state) {
      return;
    }

    const state = this.sharedOverlay.state;
    const now = (typeof performance !== 'undefined' && typeof performance.now === 'function')
      ? performance.now()
      : Date.now();
    const last = state.lastFrameTime || now;
    const deltaMs = Math.min(120, Math.max(2, now - last));
    const deltaSec = deltaMs / 1000;
    state.lastFrameTime = now;

    p.clear();

    const nextParticles = [];
    for (let i = 0; i < state.particles.length; i++) {
      const particle = state.particles[i];
      if (!particle) continue;

      particle.life -= deltaSec;
      if (particle.life <= 0) {
        continue;
      }

      particle.x += particle.vx * deltaSec;
      particle.y += particle.vy * deltaSec;

      if (particle.type === 'smoke') {
        particle.vx *= 0.96;
        particle.vy *= 0.9;
        particle.y -= 22 * deltaSec;
        const alpha = Math.max(0, Math.min(180, (particle.life / particle.maxLife) * 180));
        p.noStroke();
        p.fill(120, 120, 120, alpha);
        p.circle(particle.x, particle.y, particle.size);
      } else if (particle.type === 'spark') {
        particle.vy += 320 * deltaSec;
        const alpha = Math.max(0, Math.min(255, (particle.life / particle.maxLife) * 255));
        p.noStroke();
        p.fill(255, 200, 80, alpha);
        p.circle(particle.x, particle.y, particle.size);
      }

      nextParticles.push(particle);
    }
    state.particles = nextParticles;

    const nextBullets = [];
    for (let i = 0; i < state.bullets.length; i++) {
      const bullet = state.bullets[i];
      if (!bullet) continue;

      bullet.elapsed = (bullet.elapsed || 0) + deltaSec;
      const travelTime = bullet.travelTime || 0.12;
      const progress = travelTime > 0 ? Math.min(1, bullet.elapsed / travelTime) : 1;
      const x = p.lerp(bullet.startX, bullet.targetX, progress);
      const y = p.lerp(bullet.startY, bullet.targetY, progress);

      bullet.trail = bullet.trail || [];
      bullet.trail.push({ x, y, life: 0.22 });
      if (bullet.trail.length > 14) {
        bullet.trail.shift();
      }

      for (let t = bullet.trail.length - 1; t >= 0; t--) {
        const segment = bullet.trail[t];
        segment.life -= deltaSec * 1.8;
        if (segment.life <= 0) {
          bullet.trail.splice(t, 1);
          continue;
        }
        const alpha = Math.max(0, Math.min(1, segment.life / 0.22));
        const size = bullet.radius * (0.35 + (t / Math.max(1, bullet.trail.length)) * 0.75);
        p.noStroke();
        p.fill(255, 160, 40, alpha * 220);
        p.circle(segment.x, segment.y, size);
      }

      if (progress < 1) {
        p.noStroke();
        p.fill(255, 220, 140, 240);
        p.circle(x, y, bullet.radius);
        p.fill(255, 255, 255, 220);
        p.circle(x, y, bullet.radius * 0.5);
      } else {
        const fadeWindow = bullet.fadeOut || 0.18;
        const fadeElapsed = bullet.elapsed - bullet.travelTime;
        const fade = Math.max(0, 1 - (fadeElapsed / fadeWindow));
        if (fade > 0.02) {
          p.noStroke();
          p.fill(255, 210, 140, fade * 200);
          p.circle(x, y, bullet.radius * fade);
        }
      }

      if (bullet.elapsed < travelTime + (bullet.fadeOut || 0.18)) {
        nextBullets.push(bullet);
      }
    }
    state.bullets = nextBullets;

    if (state.particles.length > 360) {
      state.particles.splice(0, state.particles.length - 360);
    }
    if (state.bullets.length > 24) {
      state.bullets.splice(0, state.bullets.length - 24);
    }
  }

  spawnVisualShot(screenData) {
    if (screenData === false) {
      return;
    }
    if (!this.sharedOverlay || !this.sharedOverlay.state) {
      return;
    }

    const normalized = this.normalizeScreenData(screenData);
    this.sharedOverlay.viewportWidth = normalized.width;
    this.sharedOverlay.viewportHeight = normalized.height;

    const dx = normalized.crosshair.x - normalized.muzzle.x;
    const dy = normalized.crosshair.y - normalized.muzzle.y;
    const distance = Math.sqrt(dx * dx + dy * dy) || 1;
    const travelTime = Math.max(0.08, Math.min(0.22, distance / 2000));

    const bullet = {
      startX: normalized.muzzle.x,
      startY: normalized.muzzle.y,
      targetX: normalized.crosshair.x,
      targetY: normalized.crosshair.y,
      distance,
      travelTime,
      elapsed: 0,
      radius: 9,
      fadeOut: 0.16,
      trail: []
    };

    this.sharedOverlay.state.bullets.push(bullet);
    this.spawnVisualParticles(normalized.muzzle, normalized.crosshair);
  }

  spawnVisualParticles(origin, target) {
    if (!this.sharedOverlay || !this.sharedOverlay.state) {
      return;
    }

    const state = this.sharedOverlay.state;
    const angle = Math.atan2(target.y - origin.y, target.x - origin.x);

    const smokeCount = 8;
    for (let i = 0; i < smokeCount; i++) {
      const spread = (Math.random() - 0.5) * 0.7;
      const life = 0.9 + Math.random() * 0.45;
      state.particles.push({
        type: 'smoke',
        x: origin.x + (Math.random() - 0.5) * 20,
        y: origin.y + (Math.random() - 0.5) * 20,
        vx: Math.cos(angle + spread) * (40 + Math.random() * 32),
        vy: Math.sin(angle + spread) * (40 + Math.random() * 32) - 18,
        size: 18 + Math.random() * 20,
        life,
        maxLife: life
      });
    }

    const sparkCount = 12;
    for (let i = 0; i < sparkCount; i++) {
      const spread = (Math.random() - 0.5) * 0.85;
      const speed = 140 + Math.random() * 220;
      const life = 0.28 + Math.random() * 0.14;
      state.particles.push({
        type: 'spark',
        x: origin.x,
        y: origin.y,
        vx: Math.cos(angle + spread) * speed,
        vy: Math.sin(angle + spread) * speed - 70,
        size: 3 + Math.random() * 2.5,
        life,
        maxLife: life
      });
    }
  }

  syncOverlaySize(width, height) {
    const widthNumber = Number(width);
    const heightNumber = Number(height);
    if (!Number.isFinite(widthNumber) || !Number.isFinite(heightNumber)) {
      return;
    }
    if (!this.sharedOverlay) {
      return;
    }

    this.sharedOverlay.viewportWidth = widthNumber;
    this.sharedOverlay.viewportHeight = heightNumber;

    if (!this.p5Instance || !this.p5Instance.canvas) {
      this.ensureP5Overlay();
      return;
    }

    if (this.p5Instance.width !== widthNumber || this.p5Instance.height !== heightNumber) {
      this.p5Instance.resizeCanvas(widthNumber, heightNumber);
    }

    if (this.p5Instance.canvas && this.p5Instance.canvas.elt) {
      const canvasEl = this.p5Instance.canvas.elt;
      canvasEl.style.width = `${widthNumber}px`;
      canvasEl.style.height = `${heightNumber}px`;
    }

    if (this.overlayElement) {
      this.overlayElement.style.minWidth = `${widthNumber}px`;
      this.overlayElement.style.minHeight = `${heightNumber}px`;
    }
  }

  handleOverlayResize(p) {
    if (!this.sharedOverlay) return;

    const width = this.sharedOverlay.viewportWidth || (p ? p.width : 1280);
    const height = this.sharedOverlay.viewportHeight || (p ? p.height : 720);
    this.syncOverlaySize(width, height);
  }

  // Método principal de renderizado para el juego 3D
  render(ctx, canvasWidth, canvasHeight) {
    this.syncOverlaySize(canvasWidth, canvasHeight);

    // Renderizar efectos 2D sobre el juego 3D
    this.render2D(ctx);
    
    // Renderizar efectos adicionales si es necesario
    // (partículas de muzzle flash, etc.)
    this.renderMuzzleFlash(ctx, canvasWidth, canvasHeight);
  }

  // Renderizar destello del cañón
  renderMuzzleFlash(ctx, canvasWidth, canvasHeight) {
    // TEMPORALMENTE DESHABILITADO para evitar el "orificio extraño"
    // El muzzle flash se estaba dibujando en una posición fija molesta
    
    /*
    this.muzzleFlashes.forEach(flash => {
      ctx.save();
      ctx.globalAlpha = flash.life;
      ctx.fillStyle = flash.color;
      
      // Posición en el centro-inferior de la pantalla (donde estaría el arma)
      const x = canvasWidth * 0.85;
      const y = canvasHeight * 0.85;
      
      ctx.beginPath();
      ctx.arc(x, y, flash.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
    */
  }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
  window.BulletEffectsSystem = BulletEffectsSystem;
}
