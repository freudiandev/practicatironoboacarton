window.GameState = {
  score: 0,
  kills: 0,
  timeRemaining: 180, // 3 minutos
  
  init() {
    console.log('📊 GameState inicializado');
  },
  
  addKill() {
    this.kills++;
    this.score += 100;
    console.log(`💀 Kill! Total: ${this.kills}`);
  },
  
  updateTimer() {
    if (this.timeRemaining > 0) {
      this.timeRemaining--;
    }
  }
};

console.log('📊 GameState cargado y disponible');
