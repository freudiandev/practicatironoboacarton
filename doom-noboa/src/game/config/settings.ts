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
  }
} as const
