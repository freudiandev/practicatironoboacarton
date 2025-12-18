export const SETTINGS = {
  player: {
    // Cerca de la plaza central (Centro Histórico).
    spawnCell: { x: 13, z: 10 },
    eyeHeight: 1.6,
    radius: 0.25,
    moveSpeed: 3.1, // world units / second
    sprintMultiplier: 1.35,
    mouseSensitivity: 0.0022,
    pitchClamp: 1.25 // radians
  },
  combat: {
    fireRateMs: 220,
    damageBody: 20,
    damageHead: 100,
    muzzleFlashMs: 55,
    hitMarkerMs: 85,
    recoilKick: 0.045,
    recoilReturn: 11.5
  },
  reload: {
    enabled: true,
    key: 'KeyR',
    reloadMs: 650
  },
  enemyAI: {
    // Inspirado en el legacy: “blanco de tiro” con pausas y pequeños engaños.
    targetTrack: {
      edgePauseMs: [800, 1500] as const,
      hideAtEdgesChance: 0.15,
      hideMs: [380, 760] as const
    },
    separation: {
      minDistance: 2.2
    },
    melee: {
      range: 1.2,
      cooldownMs: 1200,
      damage: 15
    },
    charge: {
      range: 2.8,
      speedMultiplier: 3.25,
      durationMs: 720
    },
    retreat: {
      speedMultiplier: 2.1,
      durationMs: 640
    }
  }
} as const
