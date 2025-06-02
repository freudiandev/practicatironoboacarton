// Sistema de jugador
window.PlayerSystem = {
  player: null,
  
  init() {
    console.log('👤 PlayerSystem inicializando...');
    this.createPlayer();
  },
  
  createPlayer() {
    if (!window.player) {
      window.player = {
        x: 200,
        z: 200,
        y: 0,
        health: 100,
        maxHealth: 100,
        angle: 0,
        pitch: 0,
        speed: 3,
        radius: 15,
        
        // Stats
        kills: 0,
        score: 0
      };
      
      console.log('👤 Jugador creado en posición:', window.player.x, window.player.z);
    } else {
      console.log('👤 Jugador ya existe');
    }
  },
  
  respawnPlayer() {
    if (window.player) {
      window.player.x = 200;
      window.player.z = 200;
      window.player.health = window.player.maxHealth;
      window.player.angle = 0;
      window.player.pitch = 0;
      
      console.log('👤 Jugador reposicionado');
    }
  },
  
  takeDamage(damage) {
    if (!window.player) return;
    
    window.player.health -= damage;
    window.player.health = Math.max(0, window.player.health);
    
    console.log(`💔 Jugador recibe ${damage} daño! Vida: ${window.player.health}`);
    
    if (window.player.health <= 0) {
      this.playerDeath();
    }
  },
  
  heal(amount) {
    if (!window.player) return;
    
    window.player.health += amount;
    window.player.health = Math.min(window.player.maxHealth, window.player.health);
    
    console.log(`💚 Jugador se cura ${amount}! Vida: ${window.player.health}`);
  },
  
  playerDeath() {
    console.log('💀 ¡Jugador muerto!');
    
    if (window.GameCore) {
      window.GameCore.gameOver();
    }
  }
};

console.log('👤 PlayerSystem cargado y disponible');
