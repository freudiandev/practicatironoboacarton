// Sistema de juego todo-en-uno - VERSIÓN COMPLETA

console.log('🎮 === INICIANDO CARGA DE DOOM GAME ===');

// ===== CONFIGURACIÓN EXPANDIDA =====
window.GAME_CONFIG = {
  cellSize: 128, // Aumentado de 64 a 128 para espacios más grandes
  gridCols: 20, // Ajustado para el nuevo tamaño
  gridRows: 15,
  defaultFov: Math.PI / 3,
  fov: Math.PI / 3,
  renderDistance: 1000, // Aumentado para el mapa más grande
  wallHeight: 128, // Aumentado proporcionalmente
  playerSpeed: 2.0, // Reducido para menos sensibilidad
  rotationSpeed: 0.03, // Reducido de 0.05 para menos sensibilidad
  playerRadius: 20,
  maxEnemies: 4,         // Reducido de 8 a 4 para menos densidad
  enemySpeed: 1.0,
  spawnCooldown: 5000,   // Aumentado de 3000 a 5000ms para spawns más espaciados
  fireRate: 300,
  maxAmmo: 30,
  damage: 25,
  bulletSpeed: 10,
  mouseSensitivity: 0.001, // Reducido para menos sensibilidad
  enemyHealth: 100,
  maxWallDepth: 3,
  verticalLookSensitivity: 0.02, // Nueva configuración para mirar arriba/abajo
  enemyMinDistanceFromPlayer: 240, // Distancia mínima para que no se "pegue" al jugador
  showEnemyFallbackMarkers: false, // No mostrar marcadores de cuadrados rojos
  renderQuality: 'high',
  autoQuality: true,
  qualityProfiles: {
    ultra: {
      columnStep: 1,
      samplesPerColumn: 3,
      enableTemporalJitter: false,
      temporalJitterStrength: 0,
      fov: Math.PI * 0.52,
      distanceFade: 950,
      maxDistance: 1100,
      stepSize: 1.6,
      maxLayers: 4
    },
    high: {
      columnStep: 2,
      samplesPerColumn: 2,
      enableTemporalJitter: false,
      temporalJitterStrength: 0,
      fov: Math.PI * 0.45,
      distanceFade: 900,
      maxDistance: 1000,
      stepSize: 1.8,
      maxLayers: 3
    },
    medium: {
      columnStep: 3,
      samplesPerColumn: 1,
      enableTemporalJitter: false,
      temporalJitterStrength: 0,
      fov: Math.PI * 0.4,
      distanceFade: 820,
      maxDistance: 900,
      stepSize: 2.2,
      maxLayers: 3
    },
    low: {
      columnStep: 4,
      samplesPerColumn: 1,
      enableTemporalJitter: false,
      temporalJitterStrength: 0,
      fov: Math.PI * 0.33,
      distanceFade: 750,
      maxDistance: 800,
      stepSize: 2.5,
      maxLayers: 2
    }
  },
  // Ajustes de movimiento tipo "blanco de tiro"
  targetTrack: {
    amplitudeMinCells: 1.2,     // amplitud mínima en múltiplos de cellSize - aumentada para más recorrido
    amplitudeFallbackCells: 0.8, // amplitud fallback para pasillos cortos
    lateralSpeed: 0.7,          // factor de velocidad lateral base - reducida para más control
    advanceSpeed: 0.15,         // factor de avance frontal base - reducida
    edgePauseMs: [800, 1500],   // rango de pausa en borde - aumentada para más tiempo visible
    hideAtEdgesChance: 0.15,    // probabilidad de ocultarse en bordes - reducida
    predictablePattern: true,   // Nuevo: activar patrones predecibles
    rhythmicMovement: true      // Nuevo: movimiento rítmico como blanco de tiro
  },
  // Push-back suave para mantener distancia
  separation: {
    minDistance: 240,           // distancia objetivo mínima (px)
    pushSpeed: 0.32,            // velocidad base de separación (px por tick aprox)
    damping: 0.85               // amortiguación para suavizar
  },
  // Ataques cuerpo a cuerpo
  enemyMeleeRange: 180,
  enemyMeleeCooldown: 1400,
  enemyMeleeDamage: 15,
  enemyBackstabAngle: 0.65
};

// Nuevo mapa tipo casa más espacioso
window.MAZE = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,1],
  [1,0,1,1,1,0,0,1,0,1,1,1,1,0,1,0,1,1,0,1],
  [1,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1,0,1],
  [1,0,1,0,1,1,1,1,1,1,1,0,1,1,1,1,0,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,1,1,0,1,1,0,1,1,0,1,1,0,1,1,0,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,1,0,1,1,1,0,1,1,1,0,1,1,1,0,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,0,1,1,1,0,1,1,1,0,1,1,1,0,1,0,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,0,1,1,1,0,1,1,0,1,1,1,0,1,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

// ===== SISTEMA UNIFICADO EXPANDIDO =====
window.DoomGame = {
  canvas: null,
  ctx: null,
  width: 1280,
  height: 720,
  running: false,
  animationId: null,
  frameId: 0,
  raycastSettings: null,
  temporalJitterPhase: 0,
  performanceStats: null,
  qualitySequence: ['ultra', 'high', 'medium', 'low'],
  
  // Game state
  score: 0,
  kills: 0,
  gameTime: 0,
  level: 1,
  
  // Player data expandido con cámara vertical
  player: {
    x: 10 * 128, // Ajustado al nuevo cellSize
    z: 7 * 128,
    angle: 0,
    verticalLook: 0, // Nueva propiedad para mirar arriba/abajo
    health: 100,
    maxHealth: 100,
  fov: GAME_CONFIG.fov,
    keys: {},
    keysPressTime: {}, // Para controlar sensibilidad
    ammo: 30,
    maxAmmo: 30,
    lastShot: 0,
    weapon: 'pistol'
  },
  
  // Enemies system
  enemies: [],
  enemySpawnTimer: 0,
  nextEnemyTypeIndex: 0,
  
  // Bullets system
  bullets: [],
  
  // Items system
  items: [],

  // Feedback visual/kinético del jugador
  damageOverlayAlpha: 0,
  damageOverlayText: '',
  damageOverlayTimer: 0,
  cameraShakePower: 0,
  cameraShakeDuration: 0,
  cameraShakeDecay: 0.85,
  lastUpdateTimestamp: 0,

  // HUD data cache
  hud: {},
  
  // Sound system
  sounds: {
    shoot: null,
    hit: null,
    enemyDeath: null,
    footstep: null,
    reload: null
  },
  
  // Textures (simple patterns)
  textures: {
    wall1: null,
    wall2: null,
    floor: null
  },
  isTouch: false,
  hasShownControlHints: false,
  controlHints: null,
  audioContext: null,
  backgroundMusic: {
    enabled: true,
    playing: false,
    gainNode: null,
    cleanupTimer: null,
    pendingStart: false,
    tempo: 122 / 60,
    sequence: [
      { note: ['A3', 'E4', 'A4'], beats: 0.5, wave: 'sawtooth' },
      { note: ['A3', 'C5', 'E5'], beats: 0.5, wave: 'sawtooth' },
      { note: ['F3', 'C4', 'A4'], beats: 0.5, wave: 'sawtooth' },
      { note: ['F3', 'C4', 'G4'], beats: 0.5, wave: 'sawtooth' },
      { note: ['D3', 'A3', 'F4'], beats: 0.5, wave: 'sawtooth' },
      { note: ['E3', 'B3', 'G4'], beats: 0.5, wave: 'sawtooth' },
      { note: ['C3', 'G3', 'E4'], beats: 0.5, wave: 'sawtooth' },
      { note: ['E3', 'B3', 'F#4'], beats: 0.5, wave: 'sawtooth' },
      { note: ['A3', 'E4', 'A4'], beats: 0.5, wave: 'sawtooth', detune: 6 },
      { note: ['A3', 'C5', 'E5'], beats: 0.5, wave: 'sawtooth', detune: -6 },
      { note: ['F3', 'C4', 'A4'], beats: 0.5, wave: 'sawtooth' },
      { note: ['F3', 'D4', 'A4'], beats: 0.5, wave: 'sawtooth' },
      { note: ['D3', 'A3', 'F4'], beats: 0.5, wave: 'sawtooth' },
      { note: ['E3', 'B3', 'G4'], beats: 0.5, wave: 'sawtooth' },
      { note: ['C3', 'G3', 'E4'], beats: 0.5, wave: 'sawtooth' },
      { note: ['G2', 'D3', 'A3'], beats: 0.5, wave: 'sawtooth' }
    ]
  },
  centroTexturesApplied: false,
  skyBackdrop: null,
  
  init() {
    console.log('🎮 Inicializando DoomGame completo...');
    
    try {
      // Crear canvas
      const gameContainer = document.getElementById('game-container');
      if (!gameContainer) {
        throw new Error('No se encontró game-container');
      }
      
      const existingCanvas = gameContainer.querySelector('canvas');
      if (existingCanvas) {
        existingCanvas.remove();
      }
      
      this.canvas = document.createElement('canvas');
      this.canvas.id = 'gameCanvas';
      this.canvas.width = this.width;
      this.canvas.height = this.height;
      this.canvas.style.display = 'block';
      this.canvas.style.background = '#000';
      
      gameContainer.appendChild(this.canvas);
      
      this.ctx = this.canvas.getContext('2d');
      if (!this.ctx) {
        throw new Error('No se pudo obtener contexto 2D');
      }

      this.ctx.imageSmoothingEnabled = false;

      this.isTouch = this.isTouchDevice();
      this.initControlHints();
      
      // Inicializar sistemas
  this.initSounds();
  this.initTextures();
  this.initWeaponSystems();
  this.setupControls();
  this.initHUDPanel();
  // Spawnear enemigos SOLO cuando los sprites PNG estén listos
  this.spawnInitialEnemies();
  this.spawnItems();
  // Configurar raycaster y FOV según perfil
  this.configureRaycaster();

      if (this.controlHints) {
        this.showControlHints({ mode: this.isTouch ? 'touch' : 'desktop', autoHide: false, delay: 300 });
      }
      
      // Hacer player global
      window.player = this.player;
      
      // Reset game state
      this.score = 0;
      this.kills = 0;
      this.gameTime = 0;
      
      console.log('✅ DoomGame completo inicializado');
      return true;
      
    } catch (error) {
      console.error('❌ Error inicializando DoomGame:', error);
      throw error;
    }
  },
  
  getQualityProfile(name) {
    if (!GAME_CONFIG.qualityProfiles) return null;
    return GAME_CONFIG.qualityProfiles[name] || null;
  },

  configureRaycaster(overrides = {}) {
    const defaults = {
      columnStep: 4,
      samplesPerColumn: 1,
      enableTemporalJitter: false,
      temporalJitterStrength: 0,
      wallHeightConstant: 150,
      distanceFade: 800,
      maxDistance: 800,
      stepSize: 2,
      maxLayers: 3,
      sampleSpread: null,
      fov: GAME_CONFIG.fov || GAME_CONFIG.defaultFov || (Math.PI / 3)
    };

    const profile = this.getQualityProfile(GAME_CONFIG.renderQuality) || {};
    const merged = Object.assign({}, defaults, profile, overrides || {});

    if (!Number.isFinite(merged.fov) || merged.fov <= 0) {
      merged.fov = GAME_CONFIG.defaultFov || (Math.PI / 3);
    }

    if (!Number.isFinite(merged.columnStep) || merged.columnStep <= 0) {
      merged.columnStep = defaults.columnStep;
    }

    if (!Number.isFinite(merged.samplesPerColumn) || merged.samplesPerColumn < 1) {
      merged.samplesPerColumn = defaults.samplesPerColumn;
    }

    if (!Number.isFinite(merged.distanceFade) || merged.distanceFade <= 0) {
      merged.distanceFade = defaults.distanceFade;
    }

    if (!Number.isFinite(merged.maxDistance) || merged.maxDistance <= 0) {
      merged.maxDistance = defaults.maxDistance;
    }

    if (!Number.isFinite(merged.stepSize) || merged.stepSize <= 0) {
      merged.stepSize = defaults.stepSize;
    }

    if (!Number.isFinite(merged.maxLayers) || merged.maxLayers < 1) {
      merged.maxLayers = defaults.maxLayers;
    }

    if (!Number.isFinite(merged.wallHeightConstant) || merged.wallHeightConstant <= 0) {
      merged.wallHeightConstant = defaults.wallHeightConstant;
    }

    // Calcular spread angular para supersampling (radianes por muestra)
    if (!Number.isFinite(merged.sampleSpread) || merged.sampleSpread <= 0) {
      const baseWidth = merged.columnStep / Math.max(1, this.width);
      merged.sampleSpread = baseWidth * merged.fov;
    }

    this.raycastSettings = merged;
    this.player.fov = merged.fov;
    GAME_CONFIG.fov = merged.fov;
    this.temporalJitterPhase = 0;

    return this.raycastSettings;
  },

  setRenderQuality(name, overrides = {}) {
    if (!GAME_CONFIG.qualityProfiles || !GAME_CONFIG.qualityProfiles[name]) {
      console.warn(`⚠️ Perfil de calidad '${name}' no encontrado. Se mantiene '${GAME_CONFIG.renderQuality}'.`);
      return this.raycastSettings;
    }

    GAME_CONFIG.renderQuality = name;
    return this.configureRaycaster(overrides);
  },

  updatePerformanceStats(deltaMs, currentTime) {
    if (GAME_CONFIG.autoQuality === false || !Array.isArray(this.qualitySequence)) {
      return;
    }

    if (!this.performanceStats) {
      this.performanceStats = {
        avgFrame: deltaMs,
        smoothing: 0.12,
        lastAdjust: currentTime,
        cooldown: 3500,
        samples: 1
      };
      return;
    }

    const stats = this.performanceStats;
    stats.samples++;
    stats.avgFrame += (deltaMs - stats.avgFrame) * (stats.smoothing || 0.12);

    if (currentTime - stats.lastAdjust < (stats.cooldown || 3500)) {
      return;
    }

    const avg = stats.avgFrame;
    const qualityList = this.qualitySequence;
    const currentQuality = GAME_CONFIG.renderQuality;
    const currentIndex = qualityList.indexOf(currentQuality);

    if (currentIndex === -1) return;

    let targetQuality = null;

    if (avg > 28 && currentIndex < qualityList.length - 1) {
      targetQuality = qualityList[currentIndex + 1];
    } else if (avg < 16 && currentIndex > 0) {
      targetQuality = qualityList[currentIndex - 1];
    }

    if (targetQuality && targetQuality !== currentQuality) {
      this.setRenderQuality(targetQuality);
      stats.lastAdjust = currentTime;
      stats.samples = 0;
      stats.avgFrame = deltaMs;
      if (window.console) {
        console.log(`⚙️ Auto ajuste de calidad: ${currentQuality} → ${targetQuality} (avg ${avg.toFixed(1)} ms)`);
      }
    }
  },

  getWallTextureId(mapX, mapZ, cellValue) {
    if (!this.wallTextureIds || this.wallTextureIds.length === 0) {
      return 'wall_brick';
    }

    if (typeof cellValue === 'number' && cellValue >= 1 && cellValue < this.wallTextureIds.length) {
      return this.wallTextureIds[cellValue] || this.wallTextureIds[0];
    }

    const index = Math.abs((mapX || 0) + (mapZ || 0)) % this.wallTextureIds.length;
    return this.wallTextureIds[index] || this.wallTextureIds[0] || 'wall_brick';
  },

  initSounds() {
    // Crear sonidos simples usando Web Audio API
    try {
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      }

      const ctx = this.audioContext;

      this.sounds = {
        shoot: () => this.playTone(ctx, 400, 0.1),
        hit: () => this.playTone(ctx, 200, 0.2),
        enemyDeath: () => this.playTone(ctx, 150, 0.3),
        footstep: () => this.playTone(ctx, 100, 0.05),
        reload: () => this.playTone(ctx, 300, 0.3),
        pickup: () => this.playTone(ctx, 800, 0.2)
      };

      this.initBackgroundMusic();

      console.log('🔊 Sistema de sonidos inicializado');
    } catch (error) {
      console.warn('⚠️ No se pudo inicializar audio:', error);
      // Sonidos silenciosos como fallback
      Object.keys(this.sounds).forEach(key => {
        this.sounds[key] = () => {};
      });
    }
  },
  
  playTone(audioContext, frequency, duration) {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = 'square';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
  },
  
  initTextures() {
    this.textures = this.textures || {};

    const fallback = {
      wall_brick: this.createBrickTexture('#814030', '#c4774c'),
      wall_stone: this.createBrickTexture('#3f3632', '#6a5b56'),
      floor_cobble: this.createFloorTexture('#46332c')
    };

    this.textures.fallback = fallback;
    this.wallTextureIds = ['wall_brick', 'wall_stone'];
    this.floorTextureId = 'floor_cobble';

    if (typeof TextureAtlas !== 'undefined') {
      try {
        this.textureAtlas = new TextureAtlas({
          palette: {
            deepTerracotta: '#7f3526',
            warmClay: '#c0623c',
            paleStucco: '#f4d9ba',
            basaltStone: '#413532',
            mossGreen: '#6f7b3d',
            dawnBlue: '#9ab0c8',
            brassAccent: '#d4a44b',
            darkGrout: '#2d211e'
          }
        });

        if (!this.textureAtlas.ready) {
          this.textureAtlas.generateDefaultAtlas();
        }
      } catch (error) {
        console.warn('⚠️ No se pudo iniciar TextureAtlas, usando fallbacks:', error);
        this.textureAtlas = null;
      }
    } else {
      console.warn('⚠️ TextureAtlas no disponible, usando texturas procedurales');
    }

    if (this.textureAtlas && this.textureAtlas.ready) {
      console.log('🎨 Texturas inicializadas con atlas pixel art');
    } else {
      console.log('🎨 Texturas inicializadas con patrones procedurales');
    }

    this.attachCentroHistoricoTextures();
  },

  attachCentroHistoricoTextures() {
    if (this.centroTexturesApplied) {
      return;
    }

    const provider = typeof window !== 'undefined' ? window.CentroHistoricoTextures : null;
    if (!provider) {
      console.info('ℹ️ CentroHistoricoTextures no disponible en esta sesión; se usará el skybox genérico.');
      return;
    }

    const apply = (assets) => {
      if (!assets || this.centroTexturesApplied) {
        return;
      }

      if (assets.sky) {
        this.skyBackdrop = assets.sky;
      }

      if (!this.textures) {
        this.textures = {};
      }

      if (assets.wallColonial) {
        this.textures.wall_colonial = assets.wallColonial;
      }
      if (assets.wallArchway) {
        this.textures.wall_archway = assets.wallArchway;
      }
      if (assets.floorStones) {
        this.textures.floor_stones = assets.floorStones;
        this.floorTextureId = 'floor_stones';
      }

      const baseWalls = ['wall_colonial', 'wall_archway', 'wall_stone', 'wall_brick'];
      this.wallTextureIds = baseWalls.filter((key, idx) => baseWalls.indexOf(key) === idx);

      this.centroTexturesApplied = true;
      console.log('🏙️ Texturas del Centro Histórico aplicadas');
    };

    if (provider.isReady()) {
      apply(provider.getTextures());
    } else {
      provider.whenReady(apply);
    }
  },
  
  createBrickTexture(color1, color2) {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    
    // Colores más oscuros para mejor contraste
    ctx.fillStyle = '#5a3317'; // Marrón más oscuro
    ctx.fillRect(0, 0, 64, 64);
    
    ctx.fillStyle = '#6b4423'; // Marrón ligeramente más claro
    for (let y = 0; y < 64; y += 16) {
      for (let x = 0; x < 64; x += 32) {
        ctx.fillRect(x + (y % 32 ? 16 : 0), y, 30, 14);
      }
    }
    
    return canvas;
  },
  
  createFloorTexture(color) {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = '#2a1f15'; // Suelo más oscuro
    ctx.fillRect(0, 0, 64, 64);
    
    // Patrón de piedras más sutil
    ctx.fillStyle = '#1f1611';
    for (let i = 0; i < 15; i++) {
      const x = Math.random() * 64;
      const y = Math.random() * 64;
      ctx.fillRect(x, y, 2, 2);
    }
    
    return canvas;
  },
  
  initWeaponSystems() {
    console.log('🔫 Inicializando sistemas de armas...');
    
    // Verificar disponibilidad de clases
    console.log('BulletEffectsSystem disponible:', typeof BulletEffectsSystem !== 'undefined');
    console.log('WeaponAudioSystem disponible:', typeof WeaponAudioSystem !== 'undefined');
    
    // Inicializar sistema de efectos de balas
    if (typeof BulletEffectsSystem !== 'undefined') {
      try {
        this.bulletEffects = new BulletEffectsSystem();
        console.log('✅ Sistema de efectos de balas cargado');
        
        // Verificar métodos críticos
        if (typeof this.bulletEffects.render === 'function') {
          console.log('✅ Método render disponible');
        } else {
          console.error('❌ Método render NO disponible');
        }
        
        if (typeof this.bulletEffects.createBullet === 'function') {
          console.log('✅ Método createBullet disponible');
        } else {
          console.error('❌ Método createBullet NO disponible');
        }
        
      } catch (error) {
        console.error('❌ Error instanciando BulletEffectsSystem:', error);
      }
    } else {
      console.error('❌ BulletEffectsSystem no disponible - verificar carga de bullet-effects.js');
    }
    
    // Inicializar sistema de audio de armas
    if (typeof WeaponAudioSystem !== 'undefined') {
      try {
        this.weaponAudio = new WeaponAudioSystem();
        console.log('✅ Sistema de audio de armas cargado');
        
        // Verificar métodos críticos
        if (typeof this.weaponAudio.playShotgunSound === 'function') {
          console.log('✅ Método playShotgunSound disponible');
        } else {
          console.error('❌ Método playShotgunSound NO disponible');
        }
        
      } catch (error) {
        console.error('❌ Error instanciando WeaponAudioSystem:', error);
      }
    } else {
      console.error('❌ WeaponAudioSystem no disponible - verificar carga de weapon-audio.js');
    }
    
    // Contador de headshots
    this.headshots = 0;
    
    // Estado de depuración
    console.log('🎯 Estado final de sistemas de armas:');
    console.log('- bulletEffects:', !!this.bulletEffects);
    console.log('- weaponAudio:', !!this.weaponAudio);
  },
  
  setupControls() {
    const isTouch = this.isTouchDevice();
    this.isTouch = isTouch;
    document.addEventListener('keydown', (e) => {
      if (!this.player.keysPressTime[e.code]) {
        this.player.keysPressTime[e.code] = Date.now();
      }
      this.player.keys[e.code] = true;
      
      // Teclas especiales
      if (e.code === 'KeyR') {
        this.reload();
      }
      
      // Salir del pointer lock con ESC
      if (e.code === 'Escape' && document.pointerLockElement) {
        document.exitPointerLock();
        e.preventDefault();
      }
    });
    
    document.addEventListener('keyup', (e) => {
      this.player.keys[e.code] = false;
      this.player.keysPressTime[e.code] = 0;
    });
    
    // Sistema de captura de mouse mejorado
    this.setupMouseCapture();
    
    document.addEventListener('mousemove', (e) => {
      if (document.pointerLockElement) {
        this.player.angle += e.movementX * GAME_CONFIG.mouseSensitivity;
        
        // Movimiento vertical del mouse - CORREGIDO: mouse arriba = cámara arriba
        this.player.verticalLook -= e.movementY * GAME_CONFIG.mouseSensitivity;
        this.player.verticalLook = Math.max(-0.5, Math.min(0.5, this.player.verticalLook));
      }
    });
  },

  initHUDPanel() {
    const panel = {
      timer: document.getElementById('hud-timer'),
      kills: document.getElementById('hud-kills'),
      headshots: document.getElementById('hud-headshots'),
      healthValue: document.getElementById('player-health-value'),
  healthMax: document.querySelector('#hud-panel .life-max') || document.querySelector('#hud-panel-left .life-max'),
      healthBar: document.getElementById('player-health-bar'),
      ammo: document.getElementById('player-ammo'),
      magazines: document.getElementById('player-magazines'),
      coordinates: document.getElementById('player-coordinates'),
      minimapCanvas: document.getElementById('hud-minimap')
    };

    if (panel.minimapCanvas && panel.minimapCanvas.getContext) {
      panel.minimapCtx = panel.minimapCanvas.getContext('2d');
      panel.minimapPadding = 14;
      panel.minimapCellSpan = 12;
    }

    this.hud = panel;
  },
  
  // Configurar sistema de captura de mouse
  setupMouseCapture() {
    const popup = document.getElementById('mouse-capture-popup');
    const canvas = this.canvas;
    
    // Evento específico para clic en el canvas
    canvas.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const isTouch = this.isTouch;
      
      if (isTouch) {
        // En móvil, disparar directamente
        if (popup) popup.style.display = 'none';
        this.hideControlHints();
        this.resumeAudioContext();
        this.shoot();
        return;
      }
      
      if (!document.pointerLockElement) {
        console.log('🖱️ Solicitando captura de mouse en canvas...');
        canvas.requestPointerLock();
      } else {
        this.shoot();
      }
    });
    
    // Eventos de pointer lock
    document.addEventListener('pointerlockchange', () => {
      if (document.pointerLockElement === canvas) {
        // Mouse capturado - ocultar popup
        if (popup) popup.style.display = 'none';
        if (canvas) canvas.classList.add('mouse-captured');
        if (!this.hasShownControlHints && this.controlHints) {
          this.showControlHints({ mode: 'desktop', autoHide: true });
        }
        this.resumeAudioContext();
        console.log('🎯 Mouse capturado - Modo juego activado');
      } else {
        // Mouse liberado - mostrar popup
        if (popup) popup.style.display = 'block';
        if (canvas) canvas.classList.remove('mouse-captured');
        console.log('🖱️ Mouse liberado - Mostrar popup');
      }
    });
    
    // Error de pointer lock
    document.addEventListener('pointerlockerror', () => {
      console.error('❌ Error al capturar el pointer lock');
    });
    
    // Inicializar estado - mostrar popup al inicio
    if (popup) popup.style.display = 'block';
  },

  isTouchDevice() {
    return (
      typeof window !== 'undefined' && (
        'ontouchstart' in window ||
        (typeof navigator !== 'undefined' && (navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0))
      )
    );
  },

  initControlHints() {
    const overlay = document.getElementById('control-hints-overlay');
    const content = document.getElementById('control-hints-content');
    const closeBtn = overlay ? overlay.querySelector('[data-control-hints-dismiss]') : null;

    if (!overlay || !content) {
      console.warn('⚠️ Control hints overlay no encontrado');
      return;
    }

    this.controlHints = {
      overlay,
      content,
      closeBtn,
      autoHideTimer: null,
      mode: this.isTouch ? 'touch' : 'desktop'
    };

    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) {
        this.hideControlHints();
      }
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.hideControlHints());
    }

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && this.controlHints && !this.controlHints.overlay.classList.contains('hidden')) {
        this.hideControlHints();
      }
    });
  },

  initBackgroundMusic() {
    if (!this.audioContext || !this.backgroundMusic.enabled) {
      return;
    }

    if (!this.backgroundMusic.gainNode) {
      const gainNode = this.audioContext.createGain();
      gainNode.gain.setValueAtTime(0.08, this.audioContext.currentTime);
      gainNode.connect(this.audioContext.destination);
      this.backgroundMusic.gainNode = gainNode;
    }

    if (!this.backgroundMusic.playing) {
      if (this.audioContext.state === 'running') {
        this.scheduleHymnLoop();
      } else {
        this.backgroundMusic.pendingStart = true;
      }
    }
  },

  noteToFrequency(note) {
    const A4 = 440;
    const noteMap = { C: -9, D: -7, E: -5, F: -4, G: -2, A: 0, B: 2 };
    const match = /^([A-G])([b#]?)(\d)$/.exec(note);
    if (!match) return A4;
    const [, letter, accidental, octaveStr] = match;
    const octave = parseInt(octaveStr, 10);
    let semitoneOffset = noteMap[letter] + (octave - 4) * 12;
    if (accidental === '#') semitoneOffset += 1;
    if (accidental === 'b') semitoneOffset -= 1;
    return A4 * Math.pow(2, semitoneOffset / 12);
  },

  scheduleHymnLoop(startTime = null) {
    if (!this.audioContext || !this.backgroundMusic.gainNode || !this.backgroundMusic.enabled) return;

    const ctx = this.audioContext;
    if (ctx.state !== 'running') {
      this.backgroundMusic.pendingStart = true;
      return;
    }
    const { sequence, tempo } = this.backgroundMusic;
    const beatDuration = 1 / tempo;
    const now = ctx.currentTime;
    let begin = startTime !== null ? startTime : now + 0.1;

    const oscGainPairs = [];

    sequence.forEach(entry => {
      const duration = entry.beats * beatDuration;
      const notes = Array.isArray(entry.note) ? entry.note : [entry.note];
      const playableNotes = notes.filter(n => n && n !== 'REST');

      if (playableNotes.length === 0) {
        begin += duration;
        return;
      }

      const baseGain = typeof entry.gain === 'number' ? entry.gain : 0.24;
      const perVoiceGain = Math.max(0.04, baseGain / playableNotes.length);
      const attack = Math.min(0.05, duration * 0.35);
      const release = Math.min(0.12, duration * 0.45);
      const sustainStart = Math.max(begin + attack, begin + duration - release);

      playableNotes.forEach((noteName, voiceIndex) => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        const frequency = this.noteToFrequency(noteName);

        const waveConfig = entry.wave;
        if (Array.isArray(waveConfig)) {
          oscillator.type = waveConfig[voiceIndex % waveConfig.length];
        } else {
          oscillator.type = waveConfig || (voiceIndex % 2 === 0 ? 'sawtooth' : 'square');
        }

        oscillator.frequency.setValueAtTime(frequency, begin);

        if (typeof entry.detune === 'number') {
          const detuneDirection = voiceIndex % 2 === 0 ? 1 : -1;
          oscillator.detune.setValueAtTime(entry.detune * detuneDirection, begin);
        }

        gainNode.gain.setValueAtTime(0.001, begin);
        gainNode.gain.linearRampToValueAtTime(perVoiceGain, begin + attack);
        gainNode.gain.linearRampToValueAtTime(perVoiceGain * 0.55, sustainStart);
        gainNode.gain.setTargetAtTime(0.0001, begin + duration, 0.04);

        oscillator.connect(gainNode);
        gainNode.connect(this.backgroundMusic.gainNode);

        oscillator.start(begin);
        oscillator.stop(begin + duration + 0.04);

        oscGainPairs.push({ oscillator, gainNode });
      });

      begin += duration;
    });

    const totalDuration = sequence.reduce((sum, entry) => sum + entry.beats, 0) * beatDuration;
    this.backgroundMusic.playing = true;

    const rescheduleDelay = Math.max(0, (begin - now) * 1000 - 20);
    this.backgroundMusic.cleanupTimer = setTimeout(() => {
      oscGainPairs.splice(0, oscGainPairs.length);
      if (this.backgroundMusic.enabled) {
        this.scheduleHymnLoop(begin);
      }
    }, rescheduleDelay);
  },

  toggleBackgroundMusic(forceState = null) {
    if (!this.audioContext || !this.backgroundMusic.gainNode) return;

    if (forceState === true || (forceState === null && !this.backgroundMusic.enabled)) {
      this.backgroundMusic.enabled = true;
      this.backgroundMusic.playing = false;
      this.backgroundMusic.pendingStart = false;
      this.scheduleHymnLoop();
      return;
    }

    if (forceState === false || (forceState === null && this.backgroundMusic.enabled)) {
      this.backgroundMusic.enabled = false;
      this.backgroundMusic.playing = false;
      this.backgroundMusic.gainNode.gain.setTargetAtTime(0.0001, this.audioContext.currentTime, 0.6);
      if (this.backgroundMusic.cleanupTimer) {
        clearTimeout(this.backgroundMusic.cleanupTimer);
        this.backgroundMusic.cleanupTimer = null;
      }
      this.backgroundMusic.pendingStart = false;
    }
  },

  resumeAudioContext() {
    if (!this.audioContext) return;

    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume().then(() => {
        if (this.backgroundMusic.enabled && !this.backgroundMusic.playing) {
          this.scheduleHymnLoop();
          this.backgroundMusic.pendingStart = false;
        }
      }).catch(err => {
        console.warn('⚠️ No se pudo reanudar el contexto de audio:', err);
      });
    } else if (this.backgroundMusic.pendingStart && this.backgroundMusic.enabled && !this.backgroundMusic.playing) {
      this.scheduleHymnLoop();
      this.backgroundMusic.pendingStart = false;
    }
  },

  updateControlHintsContent(mode = 'desktop') {
    if (!this.controlHints) return;

    const desktopHints = [
      { action: 'W / A / S / D', detail: 'Moverte por el Centro Histórico' },
      { action: 'Ratón', detail: 'Apuntar y mirar alrededor' },
      { action: 'Click izquierdo', detail: 'Disparar' },
      { action: 'R', detail: 'Recargar arma' },
      { action: 'ESC', detail: 'Liberar mouse o abrir menú' }
    ];

    const touchHints = [
      { action: 'Pad virtual', detail: 'Moverte por las calles de Quito' },
      { action: '☝️ Toque y arrastre', detail: 'Apuntar y girar la cámara' },
      { action: 'Botón rojo', detail: 'Disparar' },
      { action: 'Icono recargar', detail: 'Recargar arma' },
      { action: 'Botón menú', detail: 'Pausa o salir' }
    ];

    const data = mode === 'touch' ? touchHints : desktopHints;
    const introText = mode === 'touch'
      ? 'Toca la pantalla para iniciar la partida; la mira roja aparecerá al disparar.'
      : 'Haz clic en el canvas para capturar el mouse. Presiona ESC para liberarlo cuando lo necesites.';

    this.controlHints.mode = mode;
    this.controlHints.content.innerHTML = [
      `<p class="control-hints-intro">${introText}</p>`,
      ...data.map(item => `<div class="control-hints-row"><span>${item.action}</span><span>${item.detail}</span></div>`)
    ].join('');
  },

  showControlHints({ mode = this.isTouch ? 'touch' : 'desktop', autoHide = false, delay = 0 } = {}) {
    if (!this.controlHints) return;

    this.updateControlHintsContent(mode);
    const { overlay } = this.controlHints;
    if (!overlay) return;

    clearTimeout(this.controlHints.autoHideTimer);

    const reveal = () => {
      overlay.classList.remove('hidden');
      overlay.setAttribute('aria-hidden', 'false');
      this.hasShownControlHints = true;

      if (autoHide) {
        this.controlHints.autoHideTimer = setTimeout(() => this.hideControlHints(), 6000);
      }
    };

    if (delay > 0) {
      setTimeout(reveal, delay);
    } else {
      reveal();
    }
  },

  hideControlHints() {
    if (!this.controlHints) return;
    const { overlay } = this.controlHints;
    if (!overlay) return;

    overlay.classList.add('hidden');
    overlay.setAttribute('aria-hidden', 'true');
    clearTimeout(this.controlHints.autoHideTimer);
    this.controlHints.autoHideTimer = null;
  },
  
  spawnInitialEnemies() {
    console.log('🎯 SPAWNING ENEMIES - DISTRIBUTED MODE');
    console.log(`Player position: (${this.player.x}, ${this.player.z})`);

    const desiredCount = Math.max(1, Math.min(GAME_CONFIG.maxEnemies ?? 4, 6));
    const spawnPoints = this.generateDistributedSpawnPoints(desiredCount, {
      minDistanceFromPlayer: GAME_CONFIG.enemyMinDistanceFromPlayer ?? 240,
      minDistanceBetweenEnemies: (GAME_CONFIG.cellSize ?? 128) * 6,
      relaxAttempts: 4,
      relaxFactor: 0.8
    });

    if (!spawnPoints.length) {
      console.warn('⚠️ No se pudieron generar puntos distribuidos, usando fallback de pasillos');
      for (let i = 0; i < desiredCount; i++) {
        this.spawnEnemyInCorridor();
      }
      console.log(`👾 ${this.enemies.length} enemigos spawneados (fallback)`);
      return;
    }

    const types = ['casual', 'deportivo', 'presidencial'];
    const speedByType = { casual: 0.9, deportivo: 1.4, presidencial: 1.1 };

    spawnPoints.forEach((point, index) => {
      const type = types[(this.nextEnemyTypeIndex + index) % types.length];
      const enemy = {
        id: Date.now() + index,
        x: point.x,
        z: point.z,
        health: GAME_CONFIG.enemyHealth,
        angle: Math.random() * Math.PI * 2,
        speed: speedByType[type] || GAME_CONFIG.enemySpeed,
        lastMove: 0,
        target: null,
        state: 'target',
        type,
        trackAxis: null,
        trackMin: 0,
        trackMax: 0,
        trackDir: Math.random() < 0.5 ? -1 : 1,
        pauseAtEdge: true,
        edgePauseRange: GAME_CONFIG.targetTrack.edgePauseMs || [800, 1500],
        nextResumeTime: 0,
        hideAtEdges: Math.random() < (GAME_CONFIG.targetTrack.hideAtEdgesChance ?? 0.15),
        hidden: false,
        hideDuration: 300,
        sepVX: 0,
        sepVZ: 0
      };

      this.setupTargetTrack(enemy);
      this.enemies.push(enemy);
      console.log(`✅ Spawning ${type} at (${point.x.toFixed(0)}, ${point.z.toFixed(0)})`);
    });

    this.nextEnemyTypeIndex = (this.nextEnemyTypeIndex + spawnPoints.length) % types.length;
    console.log(`👾 ${this.enemies.length} enemigos spawneados (distribuidos)`);
  },
  
  isValidSpawnPoint(x, z) {
    const mapX = Math.floor(x / GAME_CONFIG.cellSize);
    const mapZ = Math.floor(z / GAME_CONFIG.cellSize);
    
    if (mapX < 0 || mapX >= GAME_CONFIG.gridCols ||
        mapZ < 0 || mapZ >= GAME_CONFIG.gridRows) {
      return false;
    }
    
    return MAZE[mapZ][mapX] === 0;
  },

  generateDistributedSpawnPoints(count, options = {}) {
    const cellSize = GAME_CONFIG.cellSize ?? 128;
    const cols = GAME_CONFIG.gridCols ?? MAZE[0].length;
    const rows = GAME_CONFIG.gridRows ?? MAZE.length;

    const minDistanceFromPlayer = options.minDistanceFromPlayer ?? (GAME_CONFIG.enemyMinDistanceFromPlayer ?? cellSize * 3);
    const baseMinDistanceBetween = options.minDistanceBetweenEnemies ?? cellSize * 6;
    const relaxAttempts = Math.max(1, options.relaxAttempts ?? 3);
    const relaxFactor = Math.min(0.95, options.relaxFactor ?? 0.8);

    const isFreeCell = (cx, cz) => (
      cz >= 0 && cz < rows && cx >= 0 && cx < cols && MAZE[cz] && MAZE[cz][cx] === 0
    );

    const playerCellX = Math.floor(this.player.x / cellSize);
    const playerCellZ = Math.floor(this.player.z / cellSize);

    const candidates = [];
    for (let z = 0; z < rows; z++) {
      for (let x = 0; x < cols; x++) {
        if (!isFreeCell(x, z)) continue;

        const worldX = x * cellSize + cellSize / 2;
        const worldZ = z * cellSize + cellSize / 2;
        const distPlayer = Math.hypot(worldX - this.player.x, worldZ - this.player.z);
        if (distPlayer < minDistanceFromPlayer) continue;

        const freeL = isFreeCell(x - 1, z);
        const freeR = isFreeCell(x + 1, z);
        const freeU = isFreeCell(x, z - 1);
        const freeD = isFreeCell(x, z + 1);

        const horizontalCorridor = (freeL || freeR) && !(freeU || freeD);
        const verticalCorridor = (freeU || freeD) && !(freeL || freeR);
        const openRoom = [freeL, freeR, freeU, freeD].filter(Boolean).length >= 3;

        const corridorScore = horizontalCorridor || verticalCorridor ? 2 : openRoom ? 1 : 0;
        const distanceBonus = Math.min(1.5, distPlayer / (cellSize * 4));

        candidates.push({
          x: worldX,
          z: worldZ,
          cellX: x,
          cellZ: z,
          score: corridorScore + distanceBonus,
          distPlayer
        });
      }
    }

    if (!candidates.length) {
      console.warn('⚠️ No hay celdas candidatas para spawnear enemigos');
      return [];
    }

    // Preferir corredores, pero mantener variedad
    let filtered = candidates.filter(c => c.score >= 2.5);
    if (!filtered.length) filtered = candidates.filter(c => c.score >= 1.5);
    if (!filtered.length) filtered = candidates.slice();

    const shuffle = array => {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
    };

    let bestSelection = [];
    let currentMinSpacing = baseMinDistanceBetween;

    for (let attempt = 0; attempt < relaxAttempts; attempt++) {
      const pool = filtered.slice();
      shuffle(pool);

      const selection = [];
      for (const candidate of pool) {
        const isFarEnough = selection.every(other => Math.hypot(candidate.x - other.x, candidate.z - other.z) >= currentMinSpacing);
        if (!isFarEnough) continue;
        selection.push(candidate);
        if (selection.length >= count) break;
      }

      if (selection.length > bestSelection.length) {
        bestSelection = selection;
        if (bestSelection.length >= count) break;
      }

      currentMinSpacing *= relaxFactor;
    }

    if (!bestSelection.length) {
      console.warn('⚠️ No se logró una selección distribuida, devolviendo mejor esfuerzo');
      return filtered.slice(0, Math.min(count, filtered.length));
    }

    if (bestSelection.length < count) {
      console.warn(`⚠️ Solo se pudieron ubicar ${bestSelection.length} enemigos distribuidos de ${count} solicitados`);
    }

    return bestSelection.slice(0, count);
  },
  
  spawnItems() {
    const itemTypes = [
      {type: 'ammo', x: 4 * 128, z: 4 * 128, color: '#FFD700'},
      {type: 'health', x: 15 * 128, z: 10 * 128, color: '#FF0000'},
      {type: 'ammo', x: 12 * 128, z: 6 * 128, color: '#FFD700'},
      {type: 'health', x: 7 * 128, z: 11 * 128, color: '#FF0000'},
      {type: 'ammo', x: 18 * 128, z: 3 * 128, color: '#FFD700'}
    ];
    
    itemTypes.forEach((item, index) => {
      if (this.isValidSpawnPoint(item.x, item.z)) {
        this.items.push({
          id: index,
          type: item.type,
          x: item.x,
          z: item.z,
          color: item.color,
          collected: false,
          bobOffset: Math.random() * Math.PI * 2
        });
      }
    });
    
    console.log(`📦 ${this.items.length} items spawneados`);
  },
  
  start() {
    this.running = true;
    this.gameStartTime = Date.now();
    this.gameLoop();
    console.log('🚀 Juego completo iniciado');
  },
  
  stop() {
    this.running = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    console.log('🛑 Juego detenido');
  },
  
  update() {
    if (!this.running) return;
    
    const currentTime = Date.now();
    const deltaMs = this.lastUpdateTimestamp ? (currentTime - this.lastUpdateTimestamp) : 16;
    this.lastUpdateTimestamp = currentTime;
    this.gameTime = Math.floor((currentTime - this.gameStartTime) / 1000);
    this.frameId = (this.frameId || 0) + 1;

    this.updatePerformanceStats(deltaMs, currentTime);
    
    // Update player
    this.updatePlayer();
    
    // Update enemies
    this.updateEnemies(currentTime);

    // Spawn gradual en pasillos SOLO si los sprites están listos
    if (
      this.enemies.length < GAME_CONFIG.maxEnemies &&
      currentTime - this.enemySpawnTimer > GAME_CONFIG.spawnCooldown
    ) {
      this.spawnEnemyInCorridor();
      this.enemySpawnTimer = currentTime;
    }
    
    // Update bullets
    this.updateBullets();
    
    // Update bullet effects system
    if (this.bulletEffects) {
      this.bulletEffects.updateBullets(this);
    }
    
    // Check collisions
    this.checkCollisions();
    
    // Update items
    this.updateItems();

  // Feedback visual de daño
  this.updateDamageFeedback(deltaMs);
    
    // Update HUD
    this.updateHUD();
    
    // Check win/lose conditions
    this.checkGameState();
    
    window.player = this.player;
  },
  
  updatePlayer() {
    const speed = GAME_CONFIG.playerSpeed;
    const rotSpeed = GAME_CONFIG.rotationSpeed;
    const verticalSpeed = GAME_CONFIG.verticalLookSensitivity;
    
    let moveX = 0, moveZ = 0;
    let moved = false;
    
    // Movimiento con menos sensibilidad
    if (this.player.keys['KeyW']) {
      moveX += Math.cos(this.player.angle) * speed;
      moveZ += Math.sin(this.player.angle) * speed;
      moved = true;
    }
    if (this.player.keys['KeyS']) {
      moveX -= Math.cos(this.player.angle) * speed;
      moveZ -= Math.sin(this.player.angle) * speed;
      moved = true;
    }
    if (this.player.keys['KeyA']) {
      moveX += Math.cos(this.player.angle - Math.PI/2) * speed;
      moveZ += Math.sin(this.player.angle - Math.PI/2) * speed;
      moved = true;
    }
    if (this.player.keys['KeyD']) {
      moveX += Math.cos(this.player.angle + Math.PI/2) * speed;
      moveZ += Math.sin(this.player.angle + Math.PI/2) * speed;
      moved = true;
    }
    
    // Aplicar movimiento con colisiones
    if (this.canMoveTo(this.player.x + moveX, this.player.z + moveZ)) {
      this.player.x += moveX;
      this.player.z += moveZ;
      
      // Sonido de pasos ocasional
      if (moved && Math.random() < 0.02) {
        this.sounds.footstep();
      }
    }
    
    // Rotación horizontal con menos sensibilidad
    if (this.player.keys['ArrowLeft']) {
      this.player.angle -= rotSpeed;
    }
    if (this.player.keys['ArrowRight']) {
      this.player.angle += rotSpeed;
    }
    
    // NUEVO: Rotación vertical con flechas arriba/abajo
    if (this.player.keys['ArrowUp']) {
      this.player.verticalLook -= verticalSpeed;
    }
    if (this.player.keys['ArrowDown']) {
      this.player.verticalLook += verticalSpeed;
    }
    
    // Limitar el rango de mirada vertical
    this.player.verticalLook = Math.max(-0.8, Math.min(0.8, this.player.verticalLook));
    
    // Actualizar referencia global
    window.player = this.player;
  },
  
  updateEnemies(currentTime) {
    this.enemies.forEach(enemy => {
      if (enemy.health <= 0) return;

      if (!enemy.baseSpeed) {
        enemy.baseSpeed = enemy.speed;
      }
      if (!enemy.state) {
        enemy.state = 'target';
      }
      if (!enemy.trackAxis) {
        this.setupTargetTrack(enemy);
      }

      this.handleEnemyMeleeBehavior(enemy, currentTime);
    });
  },
  
  enemyAttack(enemy, options = {}) {
    const damage = Math.max(1, options.damage ?? GAME_CONFIG.enemyMeleeDamage ?? 15);
    this.player.health = Math.max(0, this.player.health - damage);

    if (this.sounds && typeof this.sounds.hit === 'function') {
      this.sounds.hit();
    }

    const backstab = options.backstab ?? this.isEnemyBehindPlayer(enemy);
    this.player.lastDamageTime = options.currentTime ?? Date.now();
    this.triggerPlayerDamageFeedback({ damage, backstab });

    if (this.player.health <= 0) {
      this.gameOver();
    }
  },
  
  updateBullets() {
    this.bullets = this.bullets.filter(bullet => {
      bullet.x += Math.cos(bullet.angle) * bullet.speed;
      bullet.z += Math.sin(bullet.angle) * bullet.speed;
      
      // Check wall collision
      if (!this.canMoveTo(bullet.x, bullet.z)) {
        return false;
      }
      
      // Check range
      bullet.distance += bullet.speed;
      return bullet.distance < 500;
    });
  },

  getCrosshairPosition() {
    return {
      x: this.width / 2,
      y: this.height / 2
    };
  },

  computeAimTowardsCrosshair() {
    const crosshair = this.getCrosshairPosition();
    const fallbackWidth = (typeof window !== 'undefined' && Number.isFinite(window.innerWidth)) ? window.innerWidth : 1280;
    const screenWidth = this.width || (this.canvas ? this.canvas.width : 0) || fallbackWidth;
    const halfWidth = screenWidth / 2;
    const horizontalOffset = crosshair.x - halfWidth;
    const fov = this.player.fov || GAME_CONFIG.fov || (Math.PI / 3);
    const offsetRatio = halfWidth !== 0 ? horizontalOffset / halfWidth : 0;
    const aimOffset = Math.atan(offsetRatio * Math.tan(fov / 2));
    return {
      angle: this.player.angle + aimOffset,
      aimOffset,
      crosshair
    };
  },

  getWeaponMuzzleScreenPosition() {
    const weaponBaseX = this.width - 100;
    const weaponBaseY = this.height - 80;
    return {
      x: weaponBaseX + 56,
      y: weaponBaseY + 20
    };
  },

  getEnemyHitZone(enemy, tolerance = 0) {
    if (!enemy || !enemy.renderBounds || !enemy.isVisibleOnScreen) return null;

    const bounds = enemy.renderBounds;
    if (!bounds) return null;

    const now = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
    if (bounds.updatedAt && Math.abs(now - bounds.updatedAt) > 250) {
      return null;
    }

    const { x, y } = this.getCrosshairPosition();
    const pad = Math.max(0, tolerance);
    const left = bounds.left - pad;
    const right = bounds.right + pad;
    const top = bounds.top - pad;
    const bottom = bounds.bottom + pad;

    if (x < left || x > right || y < top || y > bottom) {
      return null;
    }

    const headTop = (bounds.headTop ?? bounds.top) - pad;
    const headBottom = (bounds.headBottom ?? bounds.top) + pad;
    const zone = (y >= headTop && y <= headBottom) ? 'head' : 'body';
    return { zone, bounds };
  },

  getEnemyHitDistanceThreshold(enemy) {
    if (enemy && enemy.renderBounds) {
      const widthBased = Math.max(28, enemy.renderBounds.width * 0.45);
      return Math.min(90, Math.max(widthBased, 45));
    }
    return 55;
  },

  applyKnockbackFromHit(enemy, angle, force = 15) {
    if (!enemy) return;
    const pushX = Math.cos(angle) * force;
    const pushZ = Math.sin(angle) * force;
    const newX = enemy.x + pushX;
    const newZ = enemy.z + pushZ;
    if (this.canMoveTo(newX, newZ)) {
      enemy.x = newX;
      enemy.z = newZ;
    }
  },

  registerEnemyHit(enemy, zone = 'body', context = {}) {
    if (!enemy) return;

    const currentFrame = this.frameId || 0;
    if (!context.force && enemy.__lastHitFrame === currentFrame) {
      return;
    }
    enemy.__lastHitFrame = currentFrame;

    if (!enemy.maxHealth || enemy.maxHealth < enemy.health) {
      enemy.maxHealth = GAME_CONFIG.enemyHealth || enemy.health || 100;
    }

    const enemyIndex = (context.enemyIndex !== undefined) ? context.enemyIndex : this.enemies.indexOf(enemy);
    const damage = zone === 'head' ? 100 : 20;
    enemy.health -= damage;

    if (zone === 'head') {
      console.log(`💀 HEADSHOT registrado. Daño ${damage}. Vida restante: ${enemy.health}`);
    } else {
      console.log(`🎯 Impacto registrado (${zone}). Daño ${damage}. Vida restante: ${enemy.health}`);
    }

    if (this.sounds && typeof this.sounds.hit === 'function') {
      try {
        this.sounds.hit();
      } catch (error) {
        console.error('❌ Error reproduciendo sonido de impacto:', error);
      }
    }

    if (this.bulletEffects) {
      if (zone === 'head' && typeof this.bulletEffects.createBloodBurst === 'function') {
        this.bulletEffects.createBloodBurst(enemy.x, enemy.z, enemy.y || 64);
      } else if (typeof this.bulletEffects.createBloodEffect === 'function') {
        this.bulletEffects.createBloodEffect(enemy.x, enemy.z);
      }
    }

    const knockbackAngle = (context.knockbackAngle !== undefined)
      ? context.knockbackAngle
      : (context.bullet && typeof context.bullet.angle === 'number')
        ? context.bullet.angle
        : this.player.angle;
    const knockbackForce = (context.knockbackForce !== undefined)
      ? context.knockbackForce
      : (zone === 'head' ? 22 : 15);

    this.applyKnockbackFromHit(enemy, knockbackAngle, knockbackForce);

    if (zone === 'head') {
      this.headshots = (this.headshots || 0) + 1;
      if (typeof this.updateHeadshotCounter === 'function') {
        this.updateHeadshotCounter();
      }
      if (this.weaponAudio && typeof this.weaponAudio.playHeadshotSound === 'function') {
        try {
          this.weaponAudio.playHeadshotSound();
        } catch (error) {
          console.error('❌ Error reproduciendo voz de headshot:', error);
        }
      }
      if (this.bulletEffects && typeof this.bulletEffects.createHeadshotEffect === 'function') {
        this.bulletEffects.createHeadshotEffect();
      }
    }

    if (enemy.health <= 0) {
      if (typeof this.enemyDeath === 'function') {
        this.enemyDeath(enemy, enemyIndex);
      }
    }
  },
  
  checkCollisions() {
    // Bullet vs Enemy collisions usando bounding boxes proyectados
    for (let bulletIndex = this.bullets.length - 1; bulletIndex >= 0; bulletIndex--) {
      const bullet = this.bullets[bulletIndex];
      if (!bullet) continue;

      let bulletConsumed = false;

      for (let enemyIndex = 0; enemyIndex < this.enemies.length; enemyIndex++) {
        const enemy = this.enemies[enemyIndex];
        if (!enemy || enemy.health <= 0 || enemy.hidden) continue;

        const dx = bullet.x - enemy.x;
        const dz = bullet.z - enemy.z;
        const distance = Math.sqrt(dx * dx + dz * dz);
        if (distance > this.getEnemyHitDistanceThreshold(enemy)) continue;

        const hitInfo = this.getEnemyHitZone(enemy, 6);
        if (!hitInfo) continue;

        this.registerEnemyHit(enemy, hitInfo.zone, {
          enemyIndex,
          bullet,
          knockbackAngle: bullet.angle
        });

        bulletConsumed = true;
        break;
      }

      if (bulletConsumed) {
        bullet.active = false;
        this.bullets.splice(bulletIndex, 1);
      }
    }
    
    // Player vs Item collisions
    this.items.forEach((item, index) => {
      if (item.collected) return;
      
      const dx = this.player.x - item.x;
      const dz = this.player.z - item.z;
      const distance = Math.sqrt(dx * dx + dz * dz);
      
      if (distance < 30) {
        this.collectItem(item, index);
      }
    });
  },
  
  collectItem(item, index) {
    item.collected = true;
    this.sounds.pickup();
    
    switch (item.type) {
      case 'ammo':
        this.player.ammo = Math.min(this.player.maxAmmo, this.player.ammo + 10);
        break;
      case 'health':
        this.player.health = Math.min(this.player.maxHealth, this.player.health + 25);
        break;
    }
    
    this.score += 50;
  },
  
  updateItems() {
    this.items.forEach(item => {
      if (!item.collected) {
        item.bobOffset += 0.1;
      }
    });
  },

  updateDamageFeedback(deltaMs) {
    if (this.damageOverlayAlpha > 0) {
      const fade = deltaMs / 700;
      this.damageOverlayAlpha = Math.max(0, this.damageOverlayAlpha - fade);
    }

    if (this.damageOverlayTimer > 0) {
      this.damageOverlayTimer = Math.max(0, this.damageOverlayTimer - deltaMs);
      if (this.damageOverlayTimer === 0) {
        this.damageOverlayText = '';
      }
    }

    if (this.cameraShakeDuration > 0) {
      this.cameraShakeDuration = Math.max(0, this.cameraShakeDuration - deltaMs);
      if (this.cameraShakeDuration === 0) {
        this.cameraShakePower = 0;
      }
    }
  },

  renderMinimap() {
    const hud = this.hud || {};
    const canvas = hud.minimapCanvas;
    const ctx = hud.minimapCtx;
    if (!canvas || !ctx || !window.MAZE || !window.GAME_CONFIG) {
      return;
    }

  const { gridCols, gridRows, cellSize } = window.GAME_CONFIG;
  const padding = hud.minimapPadding ?? 14;
  const width = canvas.width;
  const height = canvas.height;
  const usableWidth = width - padding * 2;
  const usableHeight = height - padding * 2;
  const viewCells = hud.minimapCellSpan ?? 12;
  const viewWorldWidth = cellSize * viewCells;
  const halfViewWorld = viewWorldWidth / 2;
  const scale = Math.min(usableWidth / viewWorldWidth, usableHeight / viewWorldWidth);
  const mapSide = viewWorldWidth * scale;
  const mapLeft = (width - mapSide) / 2;
  const mapTop = (height - mapSide) / 2;

    ctx.clearRect(0, 0, width, height);

    const bgGradient = ctx.createLinearGradient(0, 0, width, height);
    bgGradient.addColorStop(0, '#12043a');
    bgGradient.addColorStop(0.5, '#230d5a');
    bgGradient.addColorStop(1, '#360b67');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = 'rgba(12, 18, 42, 0.88)';
    ctx.fillRect(mapLeft, mapTop, mapSide, mapSide);

    const centerX = width / 2;
    const centerY = height / 2;

  ctx.save();
  ctx.beginPath();
  ctx.rect(mapLeft, mapTop, mapSide, mapSide);
  ctx.clip();

  const minWorldX = this.player.x - halfViewWorld;
  const maxWorldX = this.player.x + halfViewWorld;
  const minWorldZ = this.player.z - halfViewWorld;
  const maxWorldZ = this.player.z + halfViewWorld;

  const startCol = Math.max(0, Math.floor(minWorldX / cellSize) - 1);
  const endCol = Math.min(gridCols - 1, Math.ceil(maxWorldX / cellSize) + 1);
  const startRow = Math.max(0, Math.floor(minWorldZ / cellSize) - 1);
  const endRow = Math.min(gridRows - 1, Math.ceil(maxWorldZ / cellSize) + 1);

    ctx.fillStyle = 'rgba(255, 0, 170, 0.55)';
    for (let z = startRow; z <= endRow; z++) {
      if (z < 0 || z >= gridRows) continue;
      for (let x = startCol; x <= endCol; x++) {
        if (x < 0 || x >= gridCols) continue;
        if (window.MAZE[z][x] !== 1) continue;
        const worldX = x * cellSize;
        const worldZ = z * cellSize;
        const screenX = centerX + (worldX - this.player.x) * scale;
        const screenY = centerY + (worldZ - this.player.z) * scale;
        ctx.fillRect(screenX, screenY, cellSize * scale, cellSize * scale);
      }
    }

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    const firstGridX = Math.floor((minWorldX - cellSize) / cellSize) * cellSize;
    const lastGridX = Math.ceil((maxWorldX + cellSize) / cellSize) * cellSize;
    for (let worldX = firstGridX; worldX <= lastGridX; worldX += cellSize) {
      const screenX = centerX + (worldX - this.player.x) * scale;
      ctx.beginPath();
      ctx.moveTo(screenX, centerY - halfViewWorld * scale - cellSize * scale);
      ctx.lineTo(screenX, centerY + halfViewWorld * scale + cellSize * scale);
      ctx.stroke();
    }

    const firstGridZ = Math.floor((minWorldZ - cellSize) / cellSize) * cellSize;
    const lastGridZ = Math.ceil((maxWorldZ + cellSize) / cellSize) * cellSize;
    for (let worldZ = firstGridZ; worldZ <= lastGridZ; worldZ += cellSize) {
      const screenY = centerY + (worldZ - this.player.z) * scale;
      ctx.beginPath();
      ctx.moveTo(centerX - halfViewWorld * scale - cellSize * scale, screenY);
      ctx.lineTo(centerX + halfViewWorld * scale + cellSize * scale, screenY);
      ctx.stroke();
    }

    // Jugador en centro
    const playerRadius = Math.max(5, Math.min(12, 0.35 * cellSize * scale));
    ctx.fillStyle = '#00fff5';
    ctx.beginPath();
    ctx.arc(centerX, centerY, playerRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#00fff5';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(
      centerX + Math.cos(this.player.angle) * 32 * scale,
      centerY + Math.sin(this.player.angle) * 32 * scale
    );
    ctx.stroke();

    this.enemies.forEach(enemy => {
      if (!enemy || enemy.health <= 0 || enemy.hidden) return;
      const dx = enemy.x - this.player.x;
      const dz = enemy.z - this.player.z;
      if (Math.abs(dx) > halfViewWorld || Math.abs(dz) > halfViewWorld) return;
      const ex = centerX + dx * scale;
      const ez = centerY + dz * scale;
      const radius = Math.max(4, Math.min(10, 0.28 * cellSize * scale));
      ctx.fillStyle = 'rgba(255, 64, 144, 0.9)';
      ctx.beginPath();
      ctx.arc(ex, ez, radius, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();

    ctx.strokeStyle = 'rgba(0, 255, 255, 0.6)';
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, width - 2, height - 2);
  },

  triggerPlayerDamageFeedback({ damage = 15, backstab = false } = {}) {
    const baseAlpha = 0.55;
    const bonusAlpha = backstab ? 0.2 : 0.1;
    const scaledAlpha = Math.min(0.25, damage / 120);
    this.damageOverlayAlpha = Math.min(1, baseAlpha + bonusAlpha + scaledAlpha);

    const baseText = 'El cartón Noboa te está golpeando';
    this.damageOverlayText = backstab ? `${baseText} por la espalda` : baseText;
    this.damageOverlayTimer = 900 + (backstab ? 400 : 0);

    const shakeBase = backstab ? 6 : 4;
    this.cameraShakePower = Math.max(this.cameraShakePower, shakeBase);
    this.cameraShakeDuration = Math.max(this.cameraShakeDuration, 320 + (backstab ? 180 : 0));
  },
  
  enemyDeath(enemy, index) {
    this.sounds.enemyDeath();
    this.kills++;
    this.score += 100;
    
    // Remove enemy
    this.enemies.splice(index, 1);
    
    console.log(`💀 Enemigo eliminado. Kills: ${this.kills}`);
  },
  
  shoot() {
    const currentTime = Date.now();
    
    console.log('🔫 Intento de disparo...');
    
    if (this.player.ammo <= 0) {
      console.log('🚫 Sin munición');
      return;
    }
    
    if (currentTime - this.player.lastShot < GAME_CONFIG.fireRate) {
      console.log('🚫 Demasiado rápido - esperando cooldown');
      return;
    }
    
    this.player.ammo--;
    this.player.lastShot = currentTime;
    
    console.log(`💥 ¡DISPARO! Munición restante: ${this.player.ammo}`);
    
    // Calcular dirección exacta hacia el centro de la cruz (crosshair)
    const aimData = this.computeAimTowardsCrosshair();
    const shootAngle = aimData.angle; // Ángulo ajustado hacia la cruz
    const crosshair = aimData.crosshair;
    const verticalLook = this.player.verticalLook; // Mirada vertical
    
    // Usar el nuevo sistema de efectos de balas
    if (this.bulletEffects) {
      console.log('🎯 Usando BulletEffectsSystem');
      try {
        const result = this.bulletEffects.createBullet(
          this.player.x,
          this.player.z,
          shootAngle,
          verticalLook,
          {
            canvasWidth: this.width,
            canvasHeight: this.height,
            crosshair,
            muzzle: this.getWeaponMuzzleScreenPosition(),
            fov: this.player.fov,
            timestamp: currentTime
          }
        );
        console.log('✅ Bala creada (nuevo sistema):', result);
      } catch (error) {
        console.error('❌ Error creando bala:', error);
      }
    } 
    
    // SIEMPRE usar también el sistema principal para garantizar funcionalidad
    console.log('🎯 Usando sistema principal de balas');
    const newBullet = {
      x: this.player.x,
      z: this.player.z,
      y: 64 + (verticalLook * 100), // Altura basada en mirada vertical
      angle: shootAngle,
      speed: GAME_CONFIG.bulletSpeed,
      distance: 0,
      active: true,
      startTime: currentTime
    };
    this.bullets.push(newBullet);
    console.log('✅ Bala creada (sistema principal)');
    
    // Reproducir sonido de disparo
    if (this.weaponAudio) {
      console.log('🔊 Usando WeaponAudioSystem');
      try {
        this.weaponAudio.playShotgunSound();
        console.log('✅ Sonido de escopeta reproducido');
      } catch (error) {
        console.error('❌ Error reproduciendo sonido:', error);
      }
    } else {
      console.log('⚠️ Usando sonido fallback');
      this.sounds.shoot();
    }
  },
  
  reload() {
    if (this.player.ammo < this.player.maxAmmo) {
      this.player.ammo = this.player.maxAmmo;
      this.sounds.reload();
    }
  },
  
  updateHUD() {
    const hud = this.hud || {};

    if (hud.healthValue) {
      const hp = Math.max(0, Math.round(this.player.health));
      hud.healthValue.textContent = hp.toString();
    }

    if (hud.healthMax) {
      hud.healthMax.textContent = `/${this.player.maxHealth}`;
    }

    if (hud.healthBar) {
      const ratio = Math.max(0, Math.min(1, this.player.health / this.player.maxHealth));
      hud.healthBar.style.width = `${Math.max(6, ratio * 100)}%`;
      hud.healthBar.classList.toggle('low', ratio < 0.35);
    }

    if (hud.ammo) {
      hud.ammo.textContent = `${this.player.ammo}/${this.player.maxAmmo}`;
    }

    if (hud.magazines) {
      const reserve = Math.max(0, this.player.maxAmmo - this.player.ammo);
      hud.magazines.textContent = reserve.toString();
    }

    if (hud.timer) {
      const minutes = Math.floor(this.gameTime / 60);
      const seconds = this.gameTime % 60;
      hud.timer.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    if (hud.kills) {
      hud.kills.textContent = this.kills.toString();
    }

    if (hud.headshots) {
      hud.headshots.textContent = (this.headshots || 0).toString();
    }

    if (hud.coordinates) {
      const cell = GAME_CONFIG.cellSize || 128;
      const coordX = (this.player.x / cell).toFixed(1);
      const coordZ = (this.player.z / cell).toFixed(1);
      hud.coordinates.textContent = `${coordX}, ${coordZ}`;
    }

    this.renderMinimap();
  },
  
  updateHeadshotCounter() {
    if (this.hud && this.hud.headshots) {
      this.hud.headshots.textContent = this.headshots.toString();
    }
  },
  
  checkGameState() {
    // Win condition: all enemies dead
    const aliveEnemies = this.enemies.filter(e => e.health > 0).length;
    if (aliveEnemies === 0) {
      this.gameWin();
    }
    
    // Lose condition: player dead
    if (this.player.health <= 0) {
      this.gameOver();
    }
  },
  
  gameWin() {
    this.running = false;
    const playerName = this.promptForPlayerName(false);
    this.showGameEnd('¡VICTORIA!', `Puntuación: ${this.score}`, '#00FF00', playerName, 'win');
  },
  
  gameOver() {
    this.running = false;
    const playerName = this.promptForPlayerName(true);
    this.showGameEnd('GAME OVER', `Puntuación: ${this.score}`, '#FF0000', playerName, 'loss');
  },
  
  showGameEnd(title, subtitle, color, playerName = null, outcome = 'loss') {
    const safeName = playerName || this.promptForPlayerName(false);
    this.saveScore(safeName, outcome);
    
    setTimeout(() => {
      const summary = [
        title,
        subtitle,
        `Jugador: ${safeName}`,
        `Kills: ${this.kills}`,
        `Tiempo: ${this.gameTime}s`
      ].join('\n');
      alert(summary);
      if (window.MenuManager) {
        window.MenuManager.showMainMenu();
      }
    }, 100);
  },
  
  promptForPlayerName(forcePrompt = true) {
    const storageKey = 'doomLastPlayerName';
    let lastName = '';
    try {
      lastName = localStorage.getItem(storageKey) || '';
    } catch (error) {
      console.warn('No se pudo leer el nombre previo del jugador:', error);
      lastName = '';
    }

    let resolvedName = lastName;
    if (forcePrompt) {
      const fallback = lastName || 'Corredor Ciber';
      let inputName = null;
      try {
        inputName = prompt('Ingresa tu nombre para registrar tu puntaje:', fallback);
      } catch (error) {
        console.warn('No se pudo solicitar el nombre del jugador:', error);
      }

      if (inputName !== null && typeof inputName === 'string') {
        resolvedName = inputName.trim();
      } else if (!lastName) {
        resolvedName = '';
      }
    }

    if (!resolvedName) {
      resolvedName = forcePrompt ? 'Anónimo' : (lastName || 'Anónimo');
    }

    if (resolvedName.length > 24) {
      resolvedName = resolvedName.slice(0, 24);
    }

    try {
      localStorage.setItem(storageKey, resolvedName);
    } catch (error) {
      console.warn('No se pudo guardar el nombre del jugador:', error);
    }

    return resolvedName;
  },
  
  saveScore(playerName, outcome = 'loss') {
    try {
      const scores = JSON.parse(localStorage.getItem('doomHighscores') || '[]');
      const safeName = (playerName || 'Anónimo').toString();
      const entry = {
        score: this.score,
        kills: this.kills,
        time: this.gameTime,
        date: new Date().toLocaleDateString(),
        savedAt: Date.now(),
        name: safeName,
        outcome
      };

      scores.push(entry);
      scores.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        if ((b.kills || 0) !== (a.kills || 0)) return (b.kills || 0) - (a.kills || 0);
        if ((a.time || 0) !== (b.time || 0)) return (a.time || 0) - (b.time || 0);
        return (a.savedAt || 0) - (b.savedAt || 0);
      });

      localStorage.setItem('doomHighscores', JSON.stringify(scores.slice(0, 20)));
    } catch (error) {
      console.warn('No se pudo guardar puntuación:', error);
    }
  },
  
  canMoveTo(x, z) {
    // Verificar que MAZE esté disponible
    if (!window.MAZE || !window.GAME_CONFIG) {
      return false;
    }
    
    const mapX = Math.floor(x / window.GAME_CONFIG.cellSize);
    const mapZ = Math.floor(z / window.GAME_CONFIG.cellSize);
    
    if (mapX < 0 || mapX >= window.GAME_CONFIG.gridCols ||
        mapZ < 0 || mapZ >= window.GAME_CONFIG.gridRows ||
        !window.MAZE[mapZ]) {
      return false;
    }
    
    return window.MAZE[mapZ][mapX] === 0;
  },
  
  render() {
    if (!this.running || !this.ctx) return;
    
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, this.width, this.height);

    let shakeX = 0;
    let shakeY = 0;
    if (this.cameraShakePower > 0) {
      const shakeAngle = Math.random() * Math.PI * 2;
      shakeX = Math.cos(shakeAngle) * this.cameraShakePower;
      shakeY = Math.sin(shakeAngle) * this.cameraShakePower;
      this.cameraShakePower *= this.cameraShakeDecay;
      if (this.cameraShakePower < 0.2 && this.cameraShakeDuration <= 0) {
        this.cameraShakePower = 0;
      }
    }

    this.ctx.save();
    this.ctx.translate(shakeX, shakeY);

    this.renderSky();
    this.renderFloor();
    this.renderWalls();
    this.renderSprites();
    this.renderBullets();

    if (this.bulletEffects) {
      try {
        this.bulletEffects.render(this.ctx, this.width, this.height);
      } catch (error) {
        console.error('❌ Error renderizando efectos de balas:', error);
      }
    }

    this.ctx.restore();

    this.renderCrosshair();
    this.renderDebugInfo();
    this.renderWeapon();
    this.renderDamageOverlay();
  },
  
  renderSky() {
    // NUEVO: Cielo que se mueve con verticalLook
    const verticalOffset = this.player.verticalLook * this.height * 0.6;
    const skyHeight = this.height / 2 + verticalOffset;
    const skyTexture = this.skyBackdrop || (this.textures ? this.textures.sky_quito : null);

    if (skyTexture && skyHeight > 0) {
      const ctx = this.ctx;
      const baseHeight = Math.max(this.height * 0.52, skyHeight);
      const aspect = skyTexture.width / skyTexture.height;
      const targetHeight = Math.min(this.height, baseHeight * 1.05);
      const targetWidth = targetHeight * aspect;

      const twoPi = Math.PI * 2;
      const normalizedAngle = ((this.player.angle % twoPi) + twoPi) % twoPi;
      let offsetX = -(normalizedAngle / twoPi) * targetWidth;
      const destY = -verticalOffset * 0.45;

      ctx.imageSmoothingEnabled = false;

      while (offsetX > 0) {
        offsetX -= targetWidth;
      }

      for (let x = offsetX; x < this.width; x += targetWidth) {
        ctx.drawImage(
          skyTexture,
          Math.round(x),
          Math.round(destY),
          Math.round(targetWidth),
          Math.round(targetHeight)
        );
      }

      return;
    }

    if (skyHeight > 0) {
      const gradient = this.ctx.createLinearGradient(0, 0, 0, skyHeight);
      gradient.addColorStop(0, '#2a3d5a');
      gradient.addColorStop(1, '#1a2a3a');

      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(0, 0, this.width, Math.max(0, skyHeight));
    }
  },
  
  renderFloor() {
    // NUEVO: Suelo que se mueve con verticalLook
    const verticalOffset = this.player.verticalLook * this.height * 0.6;
    const floorTop = this.height / 2 + verticalOffset;
    const floorHeight = this.height - floorTop;
    const floorTexture = this.textures ? (this.textures.floor_stones || this.textures.floor_cobble) : null;

    if (floorTexture && floorHeight > 0 && floorTop < this.height) {
      const ctx = this.ctx;
      const pattern = ctx.createPattern(floorTexture, 'repeat');
      ctx.save();
      ctx.translate(0, Math.max(0, floorTop));
      ctx.fillStyle = pattern;
      ctx.fillRect(0, 0, this.width, floorHeight);
      ctx.restore();
      return;
    }

    if (floorHeight > 0 && floorTop < this.height) {
      const gradient = this.ctx.createLinearGradient(0, floorTop, 0, this.height);
      gradient.addColorStop(0, '#2a1f15');
      gradient.addColorStop(1, '#1a120c');

      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(0, Math.max(0, floorTop), this.width, floorHeight);
    }
  },
  
  castMultipleRays(startX, startZ, angle) {
    const settings = this.raycastSettings || {};
    const stepSize = settings.stepSize || 2;
    const maxDistance = settings.maxDistance || 800;
    const maxLayers = settings.maxLayers || 3;
    const gameConfig = window.GAME_CONFIG;
    const maze = window.MAZE;

    if (!maze || !gameConfig) {
      console.warn('MAZE o GAME_CONFIG no disponible');
      return [{ distance: maxDistance, hit: false, side: null }];
    }

    const cellSize = gameConfig.cellSize || 128;
    const gridCols = gameConfig.gridCols || (maze[0] ? maze[0].length : 0);
    const gridRows = gameConfig.gridRows || maze.length;

    const hits = [];
    const cosAngle = Math.cos(angle);
    const sinAngle = Math.sin(angle);

    let distance = 0;
    let x = startX;
    let z = startZ;

    const stepForward = () => {
      distance += stepSize;
      x += cosAngle * stepSize;
      z += sinAngle * stepSize;
    };

    const modulo = (value) => {
      if (!Number.isFinite(value)) return 0;
      return ((value % 1) + 1) % 1;
    };

    while (distance < maxDistance && hits.length < maxLayers) {
      let hitDetected = false;

      while (distance < maxDistance) {
        stepForward();

        const mapX = Math.floor(x / cellSize);
        const mapZ = Math.floor(z / cellSize);

        const outOfBounds = mapX < 0 || mapX >= gridCols || mapZ < 0 || mapZ >= gridRows;
        const cellRow = outOfBounds ? null : maze[mapZ];
        const cellValue = outOfBounds || !cellRow ? 1 : cellRow[mapX];
        const isWall = outOfBounds || cellValue === 1;

        if (isWall) {
          const prevX = x - cosAngle * stepSize;
          const prevZ = z - sinAngle * stepSize;
          const prevMapX = Math.floor(prevX / cellSize);
          const prevMapZ = Math.floor(prevZ / cellSize);
          const side = (mapX !== prevMapX) ? 'vertical' : 'horizontal';

          const textureSource = side === 'vertical' ? prevZ / cellSize : prevX / cellSize;
          const textureU = modulo(textureSource);
          const textureId = this.getWallTextureId(mapX, mapZ, cellValue);

          hits.push({
            distance,
            hit: true,
            side,
            mapX,
            mapZ,
            cellValue,
            textureId,
            textureU
          });

          let foundOpening = false;
          let skipDistance = distance;
          const maxSkip = distance + cellSize * 2;

          while (skipDistance < maxSkip && skipDistance < maxDistance) {
            skipDistance += cellSize * 0.5;
            const skipX = startX + cosAngle * skipDistance;
            const skipZ = startZ + sinAngle * skipDistance;
            const skipMapX = Math.floor(skipX / cellSize);
            const skipMapZ = Math.floor(skipZ / cellSize);

            if (
              skipMapX >= 0 && skipMapX < gridCols &&
              skipMapZ >= 0 && skipMapZ < gridRows &&
              maze[skipMapZ] && maze[skipMapZ][skipMapX] === 0
            ) {
              distance = skipDistance;
              x = skipX;
              z = skipZ;
              foundOpening = true;
              break;
            }
          }

          if (!foundOpening) {
            distance = maxDistance;
          }

          hitDetected = true;
          break;
        }
      }

      if (!hitDetected) {
        break;
      }
    }

    if (hits.length === 0) {
      hits.push({ distance: maxDistance, hit: false, side: null });
    }

    return hits;
  },

  renderWalls() {
    const ctx = this.ctx;
    if (!ctx) return;

    const settings = this.raycastSettings || this.configureRaycaster();
    const columnStep = settings.columnStep || 4;
    const samplesPerColumn = Math.max(1, Math.round(settings.samplesPerColumn || 1));
    const fov = this.player.fov || GAME_CONFIG.fov || (Math.PI / 3);
    const tanHalfFov = Math.tan(fov / 2);
    const invWidth = 1 / this.width;
    const temporalJitter = (settings.enableTemporalJitter && settings.temporalJitterStrength)
      ? ((this.frameId || 0) % 2 ? 1 : -1) * settings.temporalJitterStrength
      : 0;

    const previousSmoothing = ctx.imageSmoothingEnabled;
    ctx.imageSmoothingEnabled = false;

    for (let screenX = 0; screenX < this.width; screenX += columnStep) {
      const remaining = this.width - screenX;
      const columnWidth = Math.min(columnStep, remaining);
      const sampleWidth = columnWidth / samplesPerColumn;

      for (let sampleIndex = 0; sampleIndex < samplesPerColumn; sampleIndex++) {
        const sampleCenter = screenX + sampleWidth * (sampleIndex + 0.5);
        const cameraX = (2 * sampleCenter * invWidth) - 1;
        const viewAngle = Math.atan(cameraX * tanHalfFov);
        const rayAngle = this.player.angle + viewAngle + temporalJitter;
        const sampleStart = sampleCenter - sampleWidth / 2;

        this.renderWallSample(sampleStart, sampleWidth, rayAngle, settings);
      }
    }

    ctx.imageSmoothingEnabled = previousSmoothing;
  },

  drawWallTextureColumn({ screenX, width, top, height, textureId, textureU, brightness, hit }) {
    const ctx = this.ctx;
    if (height <= 0 || !ctx) return false;

    const clampBrightness = Number.isFinite(brightness) ? Math.max(0, Math.min(1, brightness)) : 1;
    const shade = 1 - clampBrightness;
    const alphaShade = Math.min(0.95, Math.max(0, shade));

    const drawShade = () => {
      if (alphaShade <= 0) return;
      ctx.fillStyle = `rgba(0, 0, 0, ${alphaShade})`;
      ctx.fillRect(screenX, top, width, height);
    };

    const normalizedU = ((textureU % 1) + 1) % 1;

    if (this.textureAtlas && typeof this.textureAtlas.getSlice === 'function') {
      const slice = this.textureAtlas.getSlice(textureId, normalizedU);
      if (slice) {
        try {
          ctx.drawImage(
            this.textureAtlas.canvas,
            slice.sx,
            slice.sy,
            slice.sw,
            slice.sh,
            screenX,
            top,
            width,
            height
          );
          drawShade();
          return true;
        } catch (error) {
          console.warn('Error dibujando textura desde atlas:', error);
        }
      }
    }

    const fallback = this.textures && this.textures.fallback;
    const fallbackTexture = fallback && (fallback[textureId] || fallback.wall_brick || fallback.wall_stone);
    if (fallbackTexture) {
      try {
        const sx = Math.floor(normalizedU * (fallbackTexture.width - 1));
        ctx.drawImage(
          fallbackTexture,
          sx,
          0,
          1,
          fallbackTexture.height,
          screenX,
          top,
          width,
          height
        );
        drawShade();
        return true;
      } catch (error) {
        console.warn('Error dibujando textura de respaldo:', error);
      }
    }

    return false;
  },

  renderWallSample(screenXStart, columnWidth, rayAngle, settings) {
    const ctx = this.ctx;
    if (!ctx) return;

    try {
      const hits = this.castMultipleRays(this.player.x, this.player.z, rayAngle);
      if (!hits || !hits.length) return;

      const verticalOffset = this.player.verticalLook * this.height * 0.6;
      const wallConstant = settings.wallHeightConstant || 150;
      const distanceFade = settings.distanceFade || settings.maxDistance || 800;

      const layers = hits.slice().reverse();
      layers.forEach((hit, index) => {
        if (!hit || !hit.hit || !Number.isFinite(hit.distance) || hit.distance <= 0) return;

        const distance = Math.max(1, hit.distance);
        const wallHeight = (this.height * wallConstant) / distance;
        const wallTop = (this.height - wallHeight) / 2 + verticalOffset;
        const wallBottom = wallTop + wallHeight;

        const clampedTop = Math.max(0, wallTop);
        const clampedBottom = Math.min(this.height, wallBottom);
        const clampedHeight = clampedBottom - clampedTop;

        if (clampedHeight <= 0) return;

        const depthFactor = Math.max(0.1, 1 - index * 0.3);
        const distanceFactor = Math.max(0.18, 1 - distance / distanceFade);
        const brightness = Math.min(1, depthFactor * distanceFactor);

        const textureId = hit.textureId || this.getWallTextureId(hit.mapX, hit.mapZ, hit.cellValue);
        const textureU = Number.isFinite(hit.textureU) ? hit.textureU : 0;

        const drawn = this.drawWallTextureColumn({
          screenX: screenXStart,
          width: columnWidth,
          top: clampedTop,
          height: clampedHeight,
          textureId,
          textureU,
          brightness,
          hit
        });

        if (!drawn) {
          const baseColor = hit.side === 'horizontal'
            ? (index === 0 ? [139, 69, 19] : [100, 50, 15])
            : (index === 0 ? [101, 67, 33] : [70, 45, 20]);

          const r = Math.floor(baseColor[0] * brightness);
          const g = Math.floor(baseColor[1] * brightness);
          const b = Math.floor(baseColor[2] * brightness);

          ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
          ctx.fillRect(screenXStart, clampedTop, columnWidth, clampedHeight);
        }

        if (index === layers.length - 1 && distance < 200) {
          const highlightHeight = Math.min(4, clampedHeight);
          ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
          ctx.fillRect(screenXStart, clampedTop, columnWidth * 0.6, highlightHeight);
          if (clampedHeight > 8) {
            ctx.fillRect(screenXStart, clampedBottom - highlightHeight, columnWidth * 0.6, highlightHeight);
          }
        }
      });
    } catch (error) {
      console.warn('Error en renderWalls para ángulo:', rayAngle, error);
      ctx.fillStyle = '#000';
      ctx.fillRect(screenXStart, 0, columnWidth, this.height);
    }
  },

  renderDebugInfo() {
    if (!window.__DEBUG_MODE__) {
      return;
    }
    this.ctx.fillStyle = '#00FF00';
    this.ctx.font = '12px monospace';
    this.ctx.textAlign = 'left';
    
    const info = [
      `Pos: ${Math.floor(this.player.x)}, ${Math.floor(this.player.z)}`,
      `Ángulo H: ${(this.player.angle * 180 / Math.PI).toFixed(0)}°`,
      `Ángulo V: ${(this.player.verticalLook * 180 / Math.PI).toFixed(0)}°`, // NUEVO
      `Vida: ${this.player.health}/${this.player.maxHealth}`,
      `Munición: ${this.player.ammo}/${this.player.maxAmmo}`,
      `Puntuación: ${this.score}`,
      `Enemigos: ${this.enemies.filter(e => e.health > 0).length}`,
      `Balas: ${this.bullets.length}`
    ];

    if (this.raycastSettings) {
      info.push(
        `Calidad: ${GAME_CONFIG.renderQuality} | step ${this.raycastSettings.columnStep}px | muestras ${this.raycastSettings.samplesPerColumn}`,
        `FOV: ${(this.player.fov * 180 / Math.PI).toFixed(0)}°`
      );
    }
      
    info.forEach((line, index) => {
      this.ctx.fillText(line, 10, 20 + index * 15);
    });
  },

  renderWeapon() {
    // Dibujar arma simple en la parte inferior
    const weaponX = this.width - 100;
    const weaponY = this.height - 80;
    
    // Pistola simple
    this.ctx.fillStyle = '#444';
    this.ctx.fillRect(weaponX, weaponY, 80, 60);
    
    this.ctx.fillStyle = '#666';
    this.ctx.fillRect(weaponX + 10, weaponY + 10, 60, 40);
    
    // Indicador de munición
    this.ctx.fillStyle = '#FFD700';
    this.ctx.font = '14px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(`${this.player.ammo}`, weaponX + 40, weaponY + 35);
  },

  renderDamageOverlay() {
    if (this.damageOverlayAlpha > 0) {
      this.ctx.save();
      this.ctx.fillStyle = `rgba(128, 0, 255, ${Math.min(0.85, this.damageOverlayAlpha)})`;
      this.ctx.fillRect(0, 0, this.width, this.height);
      this.ctx.restore();
    }

    if (this.damageOverlayTimer > 0 && this.damageOverlayText) {
      this.ctx.save();
      this.ctx.font = 'bold 32px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      const percent = Math.min(1, this.damageOverlayTimer / 900);
      const yOffset = (1 - percent) * 40;
      this.ctx.fillText(this.damageOverlayText, this.width / 2, this.height * 0.32 + yOffset);
      this.ctx.restore();
    }
  },
  
  renderSprites() {
    // Renderizar enemigos con sprites PNG a escala humana si el sistema existe
    if (window.EnemySpriteSystem) {
      // Log ocasional para no saturar la consola
      if (Math.random() < 0.02) {
        console.log(`🎮 Rendering ${this.enemies.length} enemies with EnemySpriteSystem`);
      }
      // Dibujar usando el sistema de sprites; no ocultar por loading
      this.enemies.forEach((enemy, index) => {
        if (enemy.health <= 0 || enemy.hidden) return;
        try {
          window.EnemySpriteSystem.renderEnemySprite(this.ctx, enemy, this.player);
        } catch (err) {
          // No dibujar fallback rojo si existe el sistema de sprites; solo registrar
          console.error('Sprite render failed:', err);
          if (window.console && console.warn) {
            console.warn('Sprite render falló, se omite fallback para evitar cuadros rojos:', err);
          }
        }
      });
    } else {
      console.log('❌ EnemySpriteSystem not found, using fallback');
      // Fallback a marcadores simples solo si no hay sistema de sprites
      this.enemies.forEach(enemy => this.renderEnemyFallbackMarker(enemy));
    }
    
    // Renderizar items (distancia menor y formas sin confusión visual)
    this.items.forEach(item => {
      if (item.collected) return;
      
      const dx = item.x - this.player.x;
      const dz = item.z - this.player.z;
      const distance = Math.sqrt(dx * dx + dz * dz);

      // Reducir rango para evitar que se vean como píxeles lejanos
      if (distance < 220) {
        const angle = Math.atan2(dz, dx) - this.player.angle;
        const screenX = (this.width / 2) + Math.tan(angle) * (this.width / 2);
        
        if (screenX >= 0 && screenX < this.width) {
          const size = Math.max(8, 110 / distance);
          const bobHeight = Math.sin(item.bobOffset) * 5;
          const screenY = this.height / 2 - size / 2 + bobHeight;

          // Dibujar ítems con formas claras para no confundir con enemigos
          if (item.type === 'ammo') {
            // Círculo dorado con borde
            const grd = this.ctx.createRadialGradient(screenX - size*0.2, screenY + size*0.2, size*0.2, screenX, screenY + size*0.1, size*0.7);
            grd.addColorStop(0, '#ffe680');
            grd.addColorStop(1, '#d4a017');
            this.ctx.fillStyle = grd;
            this.ctx.beginPath();
            this.ctx.arc(screenX, screenY + size/2, size/2, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.strokeStyle = 'rgba(255,255,255,0.8)';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
          } else if (item.type === 'health') {
            // Ícono de corazón rojo estilizado (sin rectángulos)
            const cx = screenX;
            const cy = screenY + size*0.55;
            const w = size * 0.9;
            const h = size * 0.9;
            this.ctx.save();
            this.ctx.translate(cx, cy);
            this.ctx.scale(w/100, h/100);
            this.ctx.beginPath();
            this.ctx.moveTo(0, 20);
            this.ctx.bezierCurveTo(0, 0, -30, 0, -30, 20);
            this.ctx.bezierCurveTo(-30, 40, -10, 55, 0, 70);
            this.ctx.bezierCurveTo(10, 55, 30, 40, 30, 20);
            this.ctx.bezierCurveTo(30, 0, 0, 0, 0, 20);
            this.ctx.closePath();
            this.ctx.fillStyle = '#e53935';
            this.ctx.fill();
            this.ctx.lineWidth = 2.2;
            this.ctx.strokeStyle = 'rgba(255,255,255,0.9)';
            this.ctx.stroke();
            this.ctx.restore();
          } else {
            // Otros: pequeño rombo verde
            this.ctx.fillStyle = '#66bb6a';
            this.ctx.beginPath();
            this.ctx.moveTo(screenX, screenY);
            this.ctx.lineTo(screenX + size/2, screenY + size/2);
            this.ctx.lineTo(screenX, screenY + size);
            this.ctx.lineTo(screenX - size/2, screenY + size/2);
            this.ctx.closePath();
            this.ctx.fill();
          }
        }
      }
    });
  },

  // Dibuja un marcador simple si no hay sprite disponible
  renderEnemyFallbackMarker(enemy) {
  if (!GAME_CONFIG.showEnemyFallbackMarkers) return; // Desactivado por configuración
    if (enemy.health <= 0 || enemy.hidden) return;
    const dx = enemy.x - this.player.x;
    const dz = enemy.z - this.player.z;
    const distance = Math.sqrt(dx * dx + dz * dz);
    if (distance >= 500) return;
    const angle = Math.atan2(dz, dx) - this.player.angle;
    const screenX = (this.width / 2) + Math.tan(angle) * (this.width / 2);
    if (screenX < 0 || screenX >= this.width) return;
    const size = Math.max(10, 200 / distance);
    const screenY = this.height / 2 - size / 2;
    // Marcador alternativo no rojo y no cuadrado (triángulo semitransparente)
    this.ctx.fillStyle = 'rgba(0, 150, 255, 0.5)';
    this.ctx.beginPath();
    this.ctx.moveTo(screenX, screenY);
    this.ctx.lineTo(screenX + size/2, screenY + size);
    this.ctx.lineTo(screenX - size/2, screenY + size);
    this.ctx.closePath();
    this.ctx.fill();
  },

  // Renderizar balas como puntos 3D
  renderBullets() {
    if (!this.bullets || this.bullets.length === 0) return;
    
    this.bullets.forEach(bullet => {
      if (!bullet.active) return;
      
      // Calcular posición relativa al jugador
      const dx = bullet.x - this.player.x;
      const dz = bullet.z - this.player.z;
      const distance = Math.sqrt(dx * dx + dz * dz);
      
      // No renderizar balas muy lejas o muy cerca
      if (distance > 800 || distance < 5) return;
      
      // Calcular ángulo relativo al jugador
      const angle = Math.atan2(dz, dx) - this.player.angle;
      
      // Verificar que la bala esté en el campo de visión
      if (Math.abs(angle) > Math.PI / 2) return;
      
      // Proyección 3D a 2D con perspectiva correcta
      const fov = GAME_CONFIG.fov;
      const screenX = (this.width / 2) + (Math.tan(angle) / Math.tan(fov / 2)) * (this.width / 2);
      
      // Verificar si está en pantalla
      if (screenX < -20 || screenX >= this.width + 20) return;
      
      // Calcular altura en pantalla (considerando mirada vertical)
      const baseY = this.height / 2;
      const verticalOffset = this.player.verticalLook * 200;
      const bulletVerticalOffset = (bullet.y - 64) * (200 / distance); // Perspectiva vertical
      const screenY = baseY + verticalOffset + bulletVerticalOffset;
      
      // Tamaño basado en distancia para perspectiva realista
      const baseSize = 4;
      const size = Math.max(1, baseSize * (100 / distance));
      
      // Renderizar la bala como un punto brillante con estela
      this.ctx.save();
      
      // Estela de la bala (múltiples puntos para crear efecto de velocidad)
      const trailLength = 3;
      for (let i = 0; i < trailLength; i++) {
        const trailAlpha = (trailLength - i) / trailLength * 0.6;
        const trailSize = size * (trailLength - i) / trailLength;
        const trailOffset = i * 8; // Separación entre puntos de estela
        
        this.ctx.globalAlpha = trailAlpha;
        this.ctx.fillStyle = '#FFA500'; // Naranja para estela
        this.ctx.beginPath();
        this.ctx.arc(screenX - Math.cos(bullet.angle) * trailOffset, 
                    screenY, trailSize, 0, Math.PI * 2);
        this.ctx.fill();
      }
      
      // Bala principal con efecto brillante
      this.ctx.globalAlpha = 1.0;
      this.ctx.fillStyle = '#FFD700'; // Dorado brillante
      this.ctx.shadowColor = '#FFD700';
      this.ctx.shadowBlur = 8;
      this.ctx.beginPath();
      this.ctx.arc(screenX, screenY, size, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Núcleo blanco brillante
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.shadowBlur = 4;
      this.ctx.beginPath();
      this.ctx.arc(screenX, screenY, size * 0.4, 0, Math.PI * 2);
      this.ctx.fill();
      
      this.ctx.restore();
    });
  },

  

  // Configura una pista de movimiento lateral para un enemigo en función del laberinto
  setupTargetTrack(enemy) {
    if (!window.MAZE || !window.GAME_CONFIG) return;
    const cell = window.GAME_CONFIG.cellSize;
    const gx = Math.floor(enemy.x / cell);
    const gz = Math.floor(enemy.z / cell);
  const margin = Math.max(12, Math.floor(cell * 0.15));

    const isFree = (x, z) => (
      x >= 0 && x < window.GAME_CONFIG.gridCols &&
      z >= 0 && z < window.GAME_CONFIG.gridRows &&
      window.MAZE[z] && window.MAZE[z][x] === 0
    );

    // Explorar horizontalmente (a lo largo de X)
    let minGX = gx, maxGX = gx;
    while (isFree(minGX - 1, gz)) minGX--;
    while (isFree(maxGX + 1, gz)) maxGX++;
    const minX = minGX * cell + margin;
    const maxX = (maxGX + 1) * cell - margin;
    const lenX = Math.max(0, maxX - minX);

    // Explorar verticalmente (a lo largo de Z)
    let minGZ = gz, maxGZ = gz;
    while (isFree(gx, minGZ - 1)) minGZ--;
    while (isFree(gx, maxGZ + 1)) maxGZ++;
    const minZ = minGZ * cell + margin;
    const maxZ = (maxGZ + 1) * cell - margin;
    const lenZ = Math.max(0, maxZ - minZ);

    // Elegir el eje más largo para moverse de lado a lado
    if (lenX >= lenZ && lenX > cell * 0.6) {
      enemy.trackAxis = 'x';
      // Forzar una amplitud mínima de oscilación configurable
      const minAmp = Math.max(cell * (GAME_CONFIG.targetTrack?.amplitudeMinCells ?? 0.8), 160);
      const center = (minX + maxX) / 2;
      const half = Math.max(minAmp / 2, (maxX - minX) / 2);
      enemy.trackMin = Math.max(minX, center - half);
      enemy.trackMax = Math.min(maxX, center + half);
      // Centrar al enemigo en el corredor sobre Z
      enemy.z = (gz + 0.5) * cell;
      // Ajustar posición a límites
      enemy.x = Math.min(Math.max(enemy.x, enemy.trackMin), enemy.trackMax);
    } else if (lenZ > cell * 0.75) {
      enemy.trackAxis = 'z';
      const minAmp = Math.max(cell * (GAME_CONFIG.targetTrack?.amplitudeMinCells ?? 0.8), 160);
      const center = (minZ + maxZ) / 2;
      const half = Math.max(minAmp / 2, (maxZ - minZ) / 2);
      enemy.trackMin = Math.max(minZ, center - half);
      enemy.trackMax = Math.min(maxZ, center + half);
      // Centrar al enemigo en el corredor sobre X
      enemy.x = (gx + 0.5) * cell;
      enemy.z = Math.min(Math.max(enemy.z, enemy.trackMin), enemy.trackMax);
    } else {
      // Fallback: pequeña oscilación local en X
      enemy.trackAxis = (lenZ > lenX) ? 'z' : 'x';
      const amp = Math.max(cell * (GAME_CONFIG.targetTrack?.amplitudeFallbackCells ?? 0.6), 140);
      if (enemy.trackAxis === 'x') {
        enemy.trackMin = enemy.x - amp / 2;
        enemy.trackMax = enemy.x + amp / 2;
      } else {
        enemy.trackMin = enemy.z - amp / 2;
        enemy.trackMax = enemy.z + amp / 2;
      }
    }
  },

  handleEnemyMeleeBehavior(enemy, currentTime) {
    if (enemy.health <= 0) return;

    if (enemy.hidden) {
      this.updateTargetBehavior(enemy, currentTime);
      return;
    }

  const meleeRange = GAME_CONFIG.enemyMeleeRange || 92;
  const chargeRange = meleeRange + Math.max(60, meleeRange * 0.25);
    const cooldown = GAME_CONFIG.enemyMeleeCooldown || 1400;
    const dx = this.player.x - enemy.x;
    const dz = this.player.z - enemy.z;
    const distance = Math.hypot(dx, dz);

    enemy.nextMeleeTime = enemy.nextMeleeTime || 0;

    if (enemy.state === 'retreating') {
      if (!enemy.retreatVector || !Number.isFinite(enemy.retreatVector.x) || !Number.isFinite(enemy.retreatVector.z)) {
        const norm = Math.max(distance, 0.0001);
        enemy.retreatVector = { x: -dx / norm, z: -dz / norm };
      }

      const retreatSpeed = (enemy.baseSpeed || enemy.speed || 1) * 1.8 + 0.4;
      this.moveEnemyWithCollision(enemy, enemy.retreatVector.x * retreatSpeed, enemy.retreatVector.z * retreatSpeed);
      enemy.angle = Math.atan2(-enemy.retreatVector.z, -enemy.retreatVector.x);

      if (currentTime >= (enemy.retreatUntil || 0) || distance >= meleeRange * 1.8) {
        enemy.state = 'target';
        enemy.retreatVector = null;
      }
      return;
    }

    if (enemy.state === 'charging') {
      if (!enemy.chargeDirection || !Number.isFinite(enemy.chargeDirection)) {
        enemy.chargeDirection = Math.atan2(dz, dx);
      }

      const dirX = Math.cos(enemy.chargeDirection);
      const dirZ = Math.sin(enemy.chargeDirection);
      const chargeSpeed = (enemy.baseSpeed || enemy.speed || 1) * 3.2 + 0.6;
      this.moveEnemyWithCollision(enemy, dirX * chargeSpeed, dirZ * chargeSpeed);
      enemy.angle = enemy.chargeDirection;

      const newDx = this.player.x - enemy.x;
      const newDz = this.player.z - enemy.z;
      const newDistance = Math.hypot(newDx, newDz);

      if (newDistance <= meleeRange) {
        const backstab = this.isEnemyBehindPlayer(enemy);
        this.enemyAttack(enemy, {
          damage: GAME_CONFIG.enemyMeleeDamage || 15,
          backstab,
          currentTime
        });

        enemy.nextMeleeTime = currentTime + cooldown;
        enemy.state = 'retreating';
        const norm = Math.max(newDistance, 0.0001);
        enemy.retreatVector = { x: -newDx / norm, z: -newDz / norm };
        enemy.retreatUntil = currentTime + 600;
        return;
      }

      if ((currentTime - (enemy.chargeStart || currentTime) > 650) || newDistance > chargeRange * 1.6) {
        enemy.state = 'target';
      }

      return;
    }

    // Comportamiento base de blanco de tiro
    this.updateTargetBehavior(enemy, currentTime);

    if (distance <= chargeRange && currentTime >= enemy.nextMeleeTime) {
      enemy.state = 'charging';
      enemy.chargeStart = currentTime;
      enemy.chargeDirection = Math.atan2(dz, dx);
    }
  },

  moveEnemyWithCollision(enemy, moveX, moveZ) {
    let moved = false;

    if (Number.isFinite(moveX) && moveX !== 0) {
      const nextX = enemy.x + moveX;
      if (this.canMoveTo(nextX, enemy.z)) {
        enemy.x = nextX;
        moved = true;
      }
    }

    if (Number.isFinite(moveZ) && moveZ !== 0) {
      const nextZ = enemy.z + moveZ;
      if (this.canMoveTo(enemy.x, nextZ)) {
        enemy.z = nextZ;
        moved = true;
      }
    }

    if (moved) {
      const skipClamp = enemy.state === 'charging' || enemy.state === 'retreating';
      if (!skipClamp) {
        this.clampEnemyToTrack(enemy);
      }
    }

    return moved;
  },

  clampEnemyToTrack(enemy) {
    if (!enemy || !enemy.trackAxis) return;

    if (enemy.trackAxis === 'x') {
      if (Number.isFinite(enemy.trackMin)) {
        enemy.x = Math.max(enemy.trackMin, enemy.x);
      }
      if (Number.isFinite(enemy.trackMax)) {
        enemy.x = Math.min(enemy.trackMax, enemy.x);
      }
    } else {
      if (Number.isFinite(enemy.trackMin)) {
        enemy.z = Math.max(enemy.trackMin, enemy.z);
      }
      if (Number.isFinite(enemy.trackMax)) {
        enemy.z = Math.min(enemy.trackMax, enemy.z);
      }
    }
  },

  isEnemyBehindPlayer(enemy) {
    if (!enemy) return false;

    const dx = enemy.x - this.player.x;
    const dz = enemy.z - this.player.z;
    const distance = Math.hypot(dx, dz);
    if (distance === 0) return true;

    const forwardX = Math.cos(this.player.angle);
    const forwardZ = Math.sin(this.player.angle);
    const dot = (dx / distance) * forwardX + (dz / distance) * forwardZ;
    const threshold = (GAME_CONFIG.enemyBackstabAngle !== undefined) ? GAME_CONFIG.enemyBackstabAngle : 0.65;
    return dot < -Math.abs(threshold);
  },

  // Actualiza el movimiento tipo "blanco de tiro" con pausas y posible ocultamiento en extremos
  updateTargetBehavior(enemy, currentTime) {
    // Si está en pausa/oculto, esperar
    if (enemy.nextResumeTime && currentTime < enemy.nextResumeTime) {
      return;
    }
    if (enemy.hidden && currentTime >= enemy.nextResumeTime) {
      enemy.hidden = false;
      enemy.nextResumeTime = 0;
    }

  const speed = Math.max(0.3, enemy.speed * (GAME_CONFIG.targetTrack?.lateralSpeed ?? 0.7));
  const slowAdvance = Math.max(0.04, enemy.speed * (GAME_CONFIG.targetTrack?.advanceSpeed ?? 0.15));

    // Inicializar propiedades de movimiento rítmico si no existen
    if (!enemy.rhythmTimer) {
      enemy.rhythmTimer = 0;
      enemy.rhythmCycle = 2000 + Math.random() * 1000; // Ciclo de 2-3 segundos
      enemy.movePhase = Math.random() * Math.PI * 2;   // Fase inicial aleatoria
    }

    // Actualizar timer rítmico
    enemy.rhythmTimer += 16; // Aproximadamente 60fps
    if (enemy.rhythmTimer >= enemy.rhythmCycle) {
      enemy.rhythmTimer = 0;
      // Pausar en cambio de dirección para comportamiento de blanco
      if (Math.random() < 0.7) { // 70% probabilidad de pausa
        this.scheduleEdgePause(enemy, currentTime);
      }
      enemy.trackDir *= -1;
    }

    // Mantener distancia del jugador: no cruzar un radio mínimo
    const dxP = enemy.x - this.player.x;
    const dzP = enemy.z - this.player.z;
    const distP = Math.hypot(dxP, dzP);
  const minDist = (GAME_CONFIG.separation?.minDistance ?? GAME_CONFIG.enemyMinDistanceFromPlayer) || 240;

  if (enemy.trackAxis === 'x') {
      // Movimiento rítmico para blancos de tiro
      const rhythmFactor = Math.sin((enemy.rhythmTimer / enemy.rhythmCycle) * Math.PI * 2);
      const adjustedSpeed = speed * (0.2 + 0.8 * Math.abs(rhythmFactor)); // Varía entre 20% y 100% de velocidad
      
      // elegir dirección que aumenta distancia si estamos cerca
      if (distP <= minDist + 10) {
        const dPlus = Math.hypot((enemy.x + adjustedSpeed) - this.player.x, enemy.z - this.player.z);
        const dMinus = Math.hypot((enemy.x - adjustedSpeed) - this.player.x, enemy.z - this.player.z);
        enemy.trackDir = dPlus >= dMinus ? 1 : -1;
      }
      const nextX = enemy.x + enemy.trackDir * adjustedSpeed;
      const dNext = Math.hypot(nextX - this.player.x, enemy.z - this.player.z);
      if (dNext >= minDist) {
        enemy.x = nextX;
      }
  if (enemy.x <= enemy.trackMin) {
        enemy.x = enemy.trackMin; enemy.trackDir = 1; this.scheduleEdgePause(enemy, currentTime);
      }
  if (enemy.x >= enemy.trackMax) {
        enemy.x = enemy.trackMax; enemy.trackDir = -1; this.scheduleEdgePause(enemy, currentTime);
      }
      // Avance frontal ocasional lento si está lejos del jugador
      if (distP > minDist * 1.3 && Math.random() < 0.006) {
        const step = slowAdvance;
        const nextZ = enemy.z + (Math.random() < 0.5 ? step : -step);
        const cell = GAME_CONFIG.cellSize;
        const centerZ = Math.floor(enemy.z / cell) * cell + cell / 2;
        const dNextZ = Math.hypot(enemy.x - this.player.x, nextZ - this.player.z);
        if (dNextZ >= minDist * 1.05) {
          enemy.z = Math.max(centerZ - cell * 0.3, Math.min(centerZ + cell * 0.3, nextZ));
        }
      }
      // Mantener distancia mínima: push-back suave con amortiguación
      if (distP < minDist) {
        const dirX = (enemy.x - this.player.x) / Math.max(0.0001, distP);
        const dirZ = (enemy.z - this.player.z) / Math.max(0.0001, distP);
        const push = (GAME_CONFIG.separation?.pushSpeed ?? 0.32);
        enemy.sepVX = (enemy.sepVX || 0) * (GAME_CONFIG.separation?.damping ?? 0.85) + dirX * push;
        enemy.sepVZ = (enemy.sepVZ || 0) * (GAME_CONFIG.separation?.damping ?? 0.85) + dirZ * push;
        const cell = GAME_CONFIG.cellSize;
        const centerZ = Math.floor(enemy.z / cell) * cell + cell / 2;
        enemy.x = Math.min(Math.max(enemy.x + enemy.sepVX, enemy.trackMin), enemy.trackMax);
        const targetZ = enemy.z + enemy.sepVZ;
        enemy.z = Math.max(centerZ - cell * 0.3, Math.min(centerZ + cell * 0.3, targetZ));
      } else {
        // Desacelerar la separación cuando ya no está cerca
        enemy.sepVX = (enemy.sepVX || 0) * (GAME_CONFIG.separation?.damping ?? 0.85);
        enemy.sepVZ = (enemy.sepVZ || 0) * (GAME_CONFIG.separation?.damping ?? 0.85);
      }
      enemy.angle = enemy.trackDir > 0 ? 0 : Math.PI;
  } else {
      // Movimiento rítmico para blancos de tiro (eje Z)
      const rhythmFactor = Math.sin((enemy.rhythmTimer / enemy.rhythmCycle) * Math.PI * 2);
      const adjustedSpeed = speed * (0.2 + 0.8 * Math.abs(rhythmFactor)); // Varía entre 20% y 100% de velocidad
      
      if (distP <= minDist + 10) {
        const dPlus = Math.hypot(enemy.x - this.player.x, (enemy.z + adjustedSpeed) - this.player.z);
        const dMinus = Math.hypot(enemy.x - this.player.x, (enemy.z - adjustedSpeed) - this.player.z);
        enemy.trackDir = dPlus >= dMinus ? 1 : -1;
      }
      const nextZ = enemy.z + enemy.trackDir * adjustedSpeed;
      const dNext = Math.hypot(enemy.x - this.player.x, nextZ - this.player.z);
      if (dNext >= minDist) {
        enemy.z = nextZ;
      }
  if (enemy.z <= enemy.trackMin) {
        enemy.z = enemy.trackMin; enemy.trackDir = 1; this.scheduleEdgePause(enemy, currentTime);
      }
  if (enemy.z >= enemy.trackMax) {
        enemy.z = enemy.trackMax; enemy.trackDir = -1; this.scheduleEdgePause(enemy, currentTime);
      }
      // Avance frontal ocasional lento si está lejos del jugador (eje X)
      if (distP > minDist * 1.3 && Math.random() < 0.006) {
        const step = slowAdvance;
        const nextX = enemy.x + (Math.random() < 0.5 ? step : -step);
        const cell = GAME_CONFIG.cellSize;
        const centerX = Math.floor(enemy.x / cell) * cell + cell / 2;
        const dNextX = Math.hypot(nextX - this.player.x, enemy.z - this.player.z);
        if (dNextX >= minDist * 1.05) {
          enemy.x = Math.max(centerX - cell * 0.3, Math.min(centerX + cell * 0.3, nextX));
        }
      }
      // Mantener distancia mínima: push-back suave con amortiguación
      if (distP < minDist) {
        const dirX = (enemy.x - this.player.x) / Math.max(0.0001, distP);
        const dirZ = (enemy.z - this.player.z) / Math.max(0.0001, distP);
        const push = (GAME_CONFIG.separation?.pushSpeed ?? 0.32);
        enemy.sepVX = (enemy.sepVX || 0) * (GAME_CONFIG.separation?.damping ?? 0.85) + dirX * push;
        enemy.sepVZ = (enemy.sepVZ || 0) * (GAME_CONFIG.separation?.damping ?? 0.85) + dirZ * push;
        const cell = GAME_CONFIG.cellSize;
        const centerX = Math.floor(enemy.x / cell) * cell + cell / 2;
        const targetX = enemy.x + enemy.sepVX;
        enemy.x = Math.max(centerX - cell * 0.3, Math.min(centerX + cell * 0.3, targetX));
        enemy.z = Math.min(Math.max(enemy.z + enemy.sepVZ, enemy.trackMin), enemy.trackMax);
      } else {
        enemy.sepVX = (enemy.sepVX || 0) * (GAME_CONFIG.separation?.damping ?? 0.85);
        enemy.sepVZ = (enemy.sepVZ || 0) * (GAME_CONFIG.separation?.damping ?? 0.85);
      }
      enemy.angle = enemy.trackDir > 0 ? Math.PI/2 : -Math.PI/2;
    }
  },

  scheduleEdgePause(enemy, currentTime) {
    if (!enemy.pauseAtEdge) return;
    const [minP, maxP] = enemy.edgePauseRange || [800, 1500]; // Usar los nuevos valores de configuración
    const pause = Math.floor(minP + Math.random() * (maxP - minP));
    const hideChance = GAME_CONFIG.targetTrack?.hideAtEdgesChance ?? 0.15;
    
    if (enemy.hideAtEdges && Math.random() < hideChance) {
      enemy.hidden = true;
    }
    // Pausas más largas para comportamiento de blanco de tiro
    enemy.nextResumeTime = currentTime + (enemy.hidden ? Math.max(400, Math.min(800, Math.floor(pause * 0.6))) : pause);
  },

  // Spawnea un enemigo en una celda que califique como pasillo
  spawnEnemyInCorridor() {
    const cell = GAME_CONFIG.cellSize;
    const spot = this.findRandomCorridorCell(60);
    if (!spot) {
      console.log('⚠️ No se pudo encontrar una posición válida para spawn de enemigo');
      return;
    }

    const types = ['casual', 'deportivo', 'presidencial'];
    const type = types[this.nextEnemyTypeIndex++ % types.length];
    const speedByType = { casual: 0.9, deportivo: 1.4, presidencial: 1.1 };

    const worldX = spot.x * cell + cell / 2;
    const worldZ = spot.z * cell + cell / 2;

    const baseHealth = GAME_CONFIG.enemyHealth || 100;
    const enemy = {
      id: Date.now(),
      x: worldX,
      z: worldZ,
      health: baseHealth,
      maxHealth: baseHealth,
      angle: 0,
      speed: speedByType[type] || GAME_CONFIG.enemySpeed,
      lastMove: 0,
      target: null,
      state: 'target',
      type,
      trackAxis: null,
      trackMin: 0,
      trackMax: 0,
      trackDir: Math.random() < 0.5 ? -1 : 1,
      // comportamiento de blanco de tiro
      pauseAtEdge: true,
      edgePauseRange: GAME_CONFIG.targetTrack.edgePauseMs || [800, 1500],
      nextResumeTime: 0,
      hideAtEdges: Math.random() < (GAME_CONFIG.targetTrack.hideAtEdgesChance ?? 0.15),
      hidden: false,
      hideDuration: 300,
      nextMeleeTime: 0,
      chargeStart: 0,
      chargeDirection: 0,
      retreatUntil: 0,
      retreatVector: null
    };
    
    this.setupTargetTrack(enemy);
    this.enemies.push(enemy);
    
    console.log(`🎯 Spawned ${type} enemy at (${spot.x}, ${spot.z}) - World: (${worldX.toFixed(0)}, ${worldZ.toFixed(0)}) - Total: ${this.enemies.length}/${GAME_CONFIG.maxEnemies}`);
  },

  // Busca aleatoriamente una celda pasillo bien dispersa y lejos de otros enemigos
  findRandomCorridorCell(attempts = 60) {
    const cols = GAME_CONFIG.gridCols;
    const rows = GAME_CONFIG.gridRows;
    const cell = GAME_CONFIG.cellSize;
    
    const isFree = (x, z) => (
      x >= 0 && x < cols && z >= 0 && z < rows && MAZE[z] && MAZE[z][x] === 0
    );
    
    const farFromPlayer = (x, z) => {
      const px = Math.floor(this.player.x / cell);
      const pz = Math.floor(this.player.z / cell);
      const dx = x - px, dz = z - pz;
      return (dx*dx + dz*dz) >= 36; // Aumentado de 25 a 36 (mínimo 6 celdas de distancia)
    };
    
    const farFromOtherEnemies = (x, z) => {
      const worldX = x * cell + cell / 2;
      const worldZ = z * cell + cell / 2;
      
      for (let enemy of this.enemies) {
        const dx = worldX - enemy.x;
        const dz = worldZ - enemy.z;
        const distance = Math.sqrt(dx * dx + dz * dz);
        // Mínimo 8 celdas de distancia entre enemigos (1024 pixels)
        if (distance < cell * 8) {
          return false;
        }
      }
      return true;
    };

    // Intentar primero en las esquinas del mapa para máxima dispersión
    const preferredZones = [
      { minX: 1, maxX: Math.floor(cols/3), minZ: 1, maxZ: Math.floor(rows/3) },          // Esquina superior izquierda
      { minX: Math.floor(cols*2/3), maxX: cols-1, minZ: 1, maxZ: Math.floor(rows/3) },    // Esquina superior derecha
      { minX: 1, maxX: Math.floor(cols/3), minZ: Math.floor(rows*2/3), maxZ: rows-1 },    // Esquina inferior izquierda
      { minX: Math.floor(cols*2/3), maxX: cols-1, minZ: Math.floor(rows*2/3), maxZ: rows-1 } // Esquina inferior derecha
    ];

    // Primero intentar en zonas preferidas
    for (let zone of preferredZones) {
      for (let i = 0; i < attempts/4; i++) {
        const x = zone.minX + Math.floor(Math.random() * (zone.maxX - zone.minX));
        const z = zone.minZ + Math.floor(Math.random() * (zone.maxZ - zone.minZ));
        
        if (!isFree(x, z) || !farFromPlayer(x, z) || !farFromOtherEnemies(x, z)) continue;

        const freeL = isFree(x - 1, z);
        const freeR = isFree(x + 1, z);
        const freeU = isFree(x, z - 1);
        const freeD = isFree(x, z + 1);

        const horizontalCorridor = (freeL || freeR) && !(freeU || freeD);
        const verticalCorridor = (freeU || freeD) && !(freeL || freeR);

        if (horizontalCorridor || verticalCorridor) {
          return { x, z };
        }
      }
    }

    // Si no encontró en zonas preferidas, buscar en todo el mapa
    for (let i = 0; i < attempts; i++) {
      const x = 1 + Math.floor(Math.random() * (cols - 2));
      const z = 1 + Math.floor(Math.random() * (rows - 2));
      
      if (!isFree(x, z) || !farFromPlayer(x, z) || !farFromOtherEnemies(x, z)) continue;

      const freeL = isFree(x - 1, z);
      const freeR = isFree(x + 1, z);
      const freeU = isFree(x, z - 1);
      const freeD = isFree(x, z + 1);

      const horizontalCorridor = (freeL || freeR) && !(freeU || freeD);
      const verticalCorridor = (freeU || freeD) && !(freeL || freeR);

      if (horizontalCorridor || verticalCorridor) {
        return { x, z };
      }
    }
    return null;
  },
  
  renderCrosshair() {
    // Solo renderizar la cruz si el mouse está capturado
    if (!document.pointerLockElement) return;
    
    const centerX = this.width / 2;
    const centerY = this.height / 2;
    const size = 12;
    
    // Cruz con borde para mejor visibilidad
    this.ctx.lineWidth = 3;
    this.ctx.strokeStyle = '#000000'; // Borde negro
    this.ctx.beginPath();
    this.ctx.moveTo(centerX - size, centerY);
    this.ctx.lineTo(centerX + size, centerY);
    this.ctx.moveTo(centerX, centerY - size);
    this.ctx.lineTo(centerX, centerY + size);
    this.ctx.stroke();
    
    // Cruz principal roja
    this.ctx.lineWidth = 2;
    this.ctx.strokeStyle = '#FF0000'; // Rojo brillante
    this.ctx.beginPath();
    this.ctx.moveTo(centerX - size, centerY);
    this.ctx.lineTo(centerX + size, centerY);
    this.ctx.moveTo(centerX, centerY - size);
    this.ctx.lineTo(centerX, centerY + size);
    this.ctx.stroke();
    
    // Punto central - SOLO cuando el mouse está capturado
    this.ctx.fillStyle = '#FF0000';
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, 2, 0, Math.PI * 2);
    this.ctx.fill();
  },
  
  gameLoop() {
    if (!this.running) return;
    
    this.update();
    this.render();
    
    this.animationId = requestAnimationFrame(() => this.gameLoop());
  }
};

console.log('✅ DoomGame completo cargado y definido en window.DoomGame');
console.log('🔍 Verificación inmediata - window.DoomGame:', !!window.DoomGame);
console.log('🔍 Métodos disponibles:', window.DoomGame ? Object.keys(window.DoomGame).filter(key => typeof window.DoomGame[key] === 'function') : 'N/A');

// Verificación adicional
if (typeof window.DoomGame === 'undefined') {
  console.error('❌ CRÍTICO: DoomGame no se definió correctamente');
} else {
  console.log('✅ DoomGame se definió correctamente');
  
  // Verificar que métodos críticos existan
  const criticalMethods = ['init', 'start', 'stop', 'update', 'render'];
  criticalMethods.forEach(method => {
    if (typeof window.DoomGame[method] === 'function') {
      console.log(`✅ ${method} disponible`);
    } else {
      console.error(`❌ ${method} NO disponible`);
    }
  });
}
