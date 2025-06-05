// Sistema de armas completo
window.Weapons = {
  // Estado del arma actual
  currentWeapon: 'pistol',
  ammo: 30,
  maxAmmo: 30,
  lastShot: 0,
  reloading: false,
  reloadStartTime: 0,
  
  // Configuración de armas
  weaponStats: {
    pistol: {
      damage: 25,
      fireRate: 300,
      maxAmmo: 30,
      reloadTime: 1500,
      range: 600,
      spread: 0.02,
      name: 'Pistola'
    },
    shotgun: {
      damage: 50,
      fireRate: 800,
      maxAmmo: 8,
      reloadTime: 2000,
      range: 300,
      spread: 0.1,
      name: 'Escopeta'
    },
    rifle: {
      damage: 35,
      fireRate: 150,
      maxAmmo: 40,
      reloadTime: 2500,
      range: 800,
      spread: 0.01,
      name: 'Rifle'
    }
  },
  
  // Efectos visuales
  muzzleFlashes: [],
  bulletTrails: [],
  
  init() {
    this.setWeapon('pistol');
    console.log('🔫 Weapons system inicializado');
    
    // Controles de armas
    this.setupWeaponControls();
  },
  
  setupWeaponControls() {
    document.addEventListener('keydown', (e) => {
      switch(e.code) {
        case 'KeyR':
          this.reload();
          break;
        case 'Digit1':
          this.setWeapon('pistol');
          break;
        case 'Digit2':
          this.setWeapon('shotgun');
          break;
        case 'Digit3':
          this.setWeapon('rifle');
          break;
      }
    });
  },
  
  setWeapon(weaponType) {
    if (!this.weaponStats[weaponType]) return;
    
    this.currentWeapon = weaponType;
    this.maxAmmo = this.weaponStats[weaponType].maxAmmo;
    this.ammo = this.maxAmmo;
    this.reloading = false;
    
    console.log(`🔫 Cambiado a ${this.weaponStats[weaponType].name}`);
  },
  
  fire() {
    const now = Date.now();
    const weapon = this.weaponStats[this.currentWeapon];
    
    // Verificar si puede disparar
    if (this.reloading) {
      console.log('🔄 Recargando...');
      return false;
    }
    
    if (this.ammo <= 0) {
      console.log('🔫 Sin munición');
      this.reload();
      return false;
    }
    
    if (now - this.lastShot < weapon.fireRate) {
      return false; // Cadencia de fuego
    }
    
    // Disparar
    this.ammo--;
    this.lastShot = now;
    
    console.log(`🔥 Disparando ${weapon.name} - Munición: ${this.ammo}/${this.maxAmmo}`);
    
    // Efectos según tipo de arma
    switch(this.currentWeapon) {
      case 'shotgun':
        this.fireShotgun();
        break;
      case 'rifle':
        this.fireRifle();
        break;
      default:
        this.firePistol();
        break;
    }
    
    // Efectos visuales
    this.createMuzzleFlash();
    
    return true;
  },
  
  firePistol() {
    const hit = this.raycastShot(1, this.weaponStats.pistol.spread);
    this.processHits([hit]);
  },
  
  fireShotgun() {
    // Múltiples perdigones
    const hits = [];
    for (let i = 0; i < 6; i++) {
      const hit = this.raycastShot(0.6, this.weaponStats.shotgun.spread);
      hits.push(hit);
    }
    this.processHits(hits);
  },
  
  fireRifle() {
    const hit = this.raycastShot(1.2, this.weaponStats.rifle.spread);
    this.processHits([hit]);
  },
  
  raycastShot(damageMultiplier = 1, spread = 0) {
    if (!window.player) return { hit: false };
    
    const { x, z, angle } = window.player;
    const weapon = this.weaponStats[this.currentWeapon];
    
    // Añadir dispersión
    const spreadAngle = (Math.random() - 0.5) * spread;
    const shotAngle = angle + spreadAngle;
    
    const rayDirX = Math.cos(shotAngle);
    const rayDirZ = Math.sin(shotAngle);
    
    // Raycasting
    const stepSize = 8;
    const maxDistance = weapon.range;
    
    for (let distance = 0; distance < maxDistance; distance += stepSize) {
      const checkX = x + rayDirX * distance;
      const checkZ = z + rayDirZ * distance;
      
      // Verificar colisión con paredes
      const mapX = Math.floor(checkX / window.GAME_CONFIG.cellSize);
      const mapZ = Math.floor(checkZ / window.GAME_CONFIG.cellSize);
      
      if (mapX < 0 || mapX >= window.GAME_CONFIG.gridCols ||
          mapZ < 0 || mapZ >= window.GAME_CONFIG.gridRows ||
          window.MAZE[mapZ][mapX] === 1) {
        
        // Crear efecto de impacto en pared
        this.createWallImpact(checkX, checkZ);
        return { hit: true, wall: true, x: checkX, z: checkZ, distance };
      }
      
      // Verificar enemigos
      if (window.EnemyManager) {
        const enemy = window.EnemyManager.getEnemyAt(checkX, checkZ, 25);
        if (enemy && enemy.alive) {
          const damage = Math.floor(weapon.damage * damageMultiplier);
          return { 
            hit: true, 
            enemy, 
            x: checkX, 
            z: checkZ, 
            distance, 
            damage 
          };
        }
      }
    }
    
    return { hit: false };
  },
  
  processHits(hits) {
    hits.forEach(hit => {
      if (hit.hit && hit.enemy) {
        hit.enemy.takeDamage(hit.damage);
        this.createBloodEffect(hit.x, hit.z);
        console.log(`🎯 Impacto! Daño: ${hit.damage}`);
      }
    });
  },
  
  reload() {
    if (this.reloading || this.ammo === this.maxAmmo) return;
    
    this.reloading = true;
    this.reloadStartTime = Date.now();
    
    const weapon = this.weaponStats[this.currentWeapon];
    console.log(`🔄 Recargando ${weapon.name}...`);
    
    setTimeout(() => {
      this.ammo = this.maxAmmo;
      this.reloading = false;
      console.log(`✅ ${weapon.name} recargada`);
    }, weapon.reloadTime);
  },
  
  createMuzzleFlash() {
    if (!window.player) return;
    
    const { x, z, angle } = window.player;
    const flashDistance = 30;
    
    this.muzzleFlashes.push({
      x: x + Math.cos(angle) * flashDistance,
      z: z + Math.sin(angle) * flashDistance,
      startTime: Date.now(),
      duration: 100,
      size: 20 + Math.random() * 10
    });
  },
  
  createWallImpact(x, z) {
    // Efecto de impacto en pared
    console.log(`💥 Impacto en pared en (${x.toFixed(1)}, ${z.toFixed(1)})`);
  },
  
  createBloodEffect(x, z) {
    // Efecto de sangre
    console.log(`🩸 Sangre en (${x.toFixed(1)}, ${z.toFixed(1)})`);
  },
  
  update() {
    const now = Date.now();
    
    // Actualizar efectos de fogonazo
    this.muzzleFlashes = this.muzzleFlashes.filter(flash => {
      return now - flash.startTime < flash.duration;
    });
    
    // Actualizar estelas de balas
    this.bulletTrails = this.bulletTrails.filter(trail => {
      return now - trail.startTime < trail.duration;
    });
  },
  
  renderEffects() {
    // Renderizar fogonazos
    this.muzzleFlashes.forEach(flash => {
      const age = (Date.now() - flash.startTime) / flash.duration;
      const alpha = (1 - age) * 255;
      
      // Este efecto sería renderizado por el motor de renderizado
      // Por ahora solo registramos la posición
    });
  },
  
  getWeaponInfo() {
    const weapon = this.weaponStats[this.currentWeapon];
    return {
      name: weapon.name,
      ammo: this.ammo,
      maxAmmo: this.maxAmmo,
      reloading: this.reloading,
      reloadProgress: this.reloading ? 
        (Date.now() - this.reloadStartTime) / weapon.reloadTime : 0
    };
  },
  
  // Método para obtener munición adicional
  addAmmo(amount) {
    this.ammo = Math.min(this.maxAmmo, this.ammo + amount);
    console.log(`🔫 +${amount} munición. Total: ${this.ammo}/${this.maxAmmo}`);
  },
  
  // Verificar si tiene munición
  hasAmmo() {
    return this.ammo > 0 && !this.reloading;
  },
  
  // Obtener estado del arma para UI
  getStatus() {
    const weapon = this.weaponStats[this.currentWeapon];
    let status = `${weapon.name}: ${this.ammo}/${this.maxAmmo}`;
    
    if (this.reloading) {
      const progress = Math.floor(
        ((Date.now() - this.reloadStartTime) / weapon.reloadTime) * 100
      );
      status += ` (Recargando ${progress}%)`;
    }
    
    return status;
  }
};

console.log('🔫 Weapons system cargado');
