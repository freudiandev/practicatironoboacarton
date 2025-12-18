import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { SETTINGS } from '../config/settings'
import type { NetMode, PoseMessage } from '../net/types'

export type GameState = 'menu' | 'playing' | 'paused' | 'gameover' | 'win'

export type EnemyType = 'casual' | 'deportivo' | 'presidencial'

export type Enemy = {
  id: string
  type: EnemyType
  position: { x: number; y: number; z: number }
  health: number
  maxHealth: number
  alive: boolean
  dissolve: number
  ai?: {
    state: 'target' | 'charging' | 'retreat'
    axis: 'x' | 'z'
    dir: 1 | -1
    min: number
    max: number
    nextResumeAt: number
    nextMeleeAt: number
    chargeUntil: number
    retreatUntil: number
    hideUntil: number
  }
}

export type HighScoreEntry = {
  name: string
  score: number
  kills: number
  time: number
  outcome: 'win' | 'loss'
  savedAt: number
}

export type PowerUpType = 'consulta_popular' | 'iva_15' | 'apagon_nacional' | 'iva_trampa' | 'capsula_salud'

export type PowerUpPickup = {
  id: string
  type: PowerUpType
  position: { x: number; y: number; z: number }
  active: boolean
}

type GameStore = {
  gameState: GameState
  health: number
  maxHealth: number
  ammo: number
  maxAmmo: number
  fireHeld: boolean
  helpOpen: boolean
  score: number
  kills: number
  headshots: number
  startedAt: number | null
  timeSeconds: number
  enemies: Enemy[]
  pickups: PowerUpPickup[]
  blackoutUntil: number
  ivaUntil: number
  scoreMultiplier: number
  banner: { text: string; until: number }
  muzzleUntil: number
  hitMarkerUntil: number
  reloadUntil: number
  lastShotUntil: number
  recoil: number
  hurtUntil: number

  isTouch: boolean
  pointerLocked: boolean
  gamepadActive: boolean
  netMode: NetMode
  netPeerId: string
  netJoinId: string
  netConnected: boolean
  netStatus: string
  netRemotePose: PoseMessage | null
  playerPose: { x: number; y: number; z: number; yaw: number; pitch: number }
  moveAxis: { x: number; z: number }
  lookAxis: { x: number; y: number }

  setGameState: (state: GameState) => void
  setIsTouch: (value: boolean) => void
  setPointerLocked: (locked: boolean) => void
  setGamepadActive: (active: boolean) => void
  setFireHeld: (held: boolean) => void
  setHelpOpen: (open: boolean) => void
  toggleHelp: () => void
  setNetMode: (mode: NetMode) => void
  setNetJoinId: (id: string) => void
  setNetPeerId: (id: string) => void
  setNetConnected: (connected: boolean) => void
  setNetStatus: (status: string) => void
  setNetRemotePose: (pose: PoseMessage | null) => void
  setPlayerPose: (pose: Partial<GameStore['playerPose']>) => void
  setMoveAxis: (axis: Partial<GameStore['moveAxis']>) => void
  setLookAxis: (axis: Partial<GameStore['lookAxis']>) => void
  startRun: () => void
  endRun: (outcome: 'win' | 'loss') => void
  damage: (amount: number) => void
  heal: (amount: number) => void
  spendAmmo: (amount: number) => boolean
  reload: () => void
  setMuzzleUntil: (until: number) => void
  setHitMarkerUntil: (until: number) => void
  setReloadUntil: (until: number) => void
  requestReload: () => void
  addRecoil: (amount: number) => void
  addScore: (amount: number) => void
  addKill: () => void
  setEnemies: (enemies: Enemy[]) => void
  updateEnemy: (id: string, patch: Partial<Enemy>) => void
  killEnemy: (id: string) => void
  removeEnemy: (id: string) => void
  setPickups: (pickups: PowerUpPickup[]) => void
  pickupPowerup: (id: string) => void
  setBlackoutUntil: (until: number) => void
  setIvaUntil: (until: number) => void
  showBanner: (text: string, ms?: number) => void

  highscores: HighScoreEntry[]
  addHighscore: (entry: Omit<HighScoreEntry, 'savedAt'>) => void
  clearHighscores: () => void
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      gameState: 'menu',
      health: 100,
      maxHealth: 100,
      ammo: 30,
      maxAmmo: 30,
      fireHeld: false,
      helpOpen: false,
      score: 0,
      kills: 0,
      headshots: 0,
      startedAt: null,
      timeSeconds: 0,
      enemies: [],
      pickups: [],
      blackoutUntil: 0,
      ivaUntil: 0,
      scoreMultiplier: 1,
      banner: { text: '', until: 0 },
      muzzleUntil: 0,
      hitMarkerUntil: 0,
      reloadUntil: 0,
      lastShotUntil: 0,
      recoil: 0,
      hurtUntil: 0,

      isTouch: false,
      pointerLocked: false,
      gamepadActive: false,
      netMode: 'off',
      netPeerId: '',
      netJoinId: '',
      netConnected: false,
      netStatus: '',
      netRemotePose: null,
      playerPose: { x: 0, y: 1.6, z: 0, yaw: 0, pitch: 0 },
      moveAxis: { x: 0, z: 0 },
      lookAxis: { x: 0, y: 0 },

      setGameState: (state) => set({ gameState: state }),
      setIsTouch: (value) => set({ isTouch: value }),
      setPointerLocked: (locked) => set({ pointerLocked: locked }),
      setGamepadActive: (active) => set({ gamepadActive: active }),
      setFireHeld: (held) => set({ fireHeld: held }),
      setHelpOpen: (open) => set({ helpOpen: open }),
      toggleHelp: () => set((s) => ({ helpOpen: !s.helpOpen })),
      setNetMode: (mode) =>
        set({
          netMode: mode,
          netConnected: false,
          netStatus: '',
          netRemotePose: null
        }),
      setNetJoinId: (id) => set({ netJoinId: id }),
      setNetPeerId: (id) => set({ netPeerId: id }),
      setNetConnected: (connected) => set({ netConnected: connected }),
      setNetStatus: (status) => set({ netStatus: status }),
      setNetRemotePose: (pose) => set({ netRemotePose: pose }),
      setPlayerPose: (pose) =>
        set((s) => ({
          playerPose: {
            x: pose.x ?? s.playerPose.x,
            y: pose.y ?? s.playerPose.y,
            z: pose.z ?? s.playerPose.z,
            yaw: pose.yaw ?? s.playerPose.yaw,
            pitch: pose.pitch ?? s.playerPose.pitch
          }
        })),
      setMoveAxis: (axis) =>
        set((s) => ({ moveAxis: { x: axis.x ?? s.moveAxis.x, z: axis.z ?? s.moveAxis.z } })),
      setLookAxis: (axis) =>
        set((s) => ({ lookAxis: { x: axis.x ?? s.lookAxis.x, y: axis.y ?? s.lookAxis.y } })),
      startRun: () =>
        set((s) => ({
          gameState: 'playing',
          health: s.maxHealth,
          ammo: s.maxAmmo,
          fireHeld: false,
          helpOpen: false,
          score: 0,
          kills: 0,
          headshots: 0,
          startedAt: Date.now(),
          timeSeconds: 0,
          enemies: [],
          pickups: [],
          blackoutUntil: 0,
          ivaUntil: 0,
          scoreMultiplier: 1,
          muzzleUntil: 0,
          hitMarkerUntil: 0,
          reloadUntil: 0,
          lastShotUntil: 0,
          recoil: 0,
          hurtUntil: 0,
          banner: { text: '', until: 0 }
        })),
      endRun: (outcome) => {
        const s = get()
        if (s.gameState !== 'playing') return
        set({ gameState: outcome === 'win' ? 'win' : 'gameover' })
      },
      damage: (amount) =>
        set((s) => ({
          health: Math.max(0, s.health - Math.max(0, amount)),
          hurtUntil: Date.now() + 720
        })),
      heal: (amount) =>
        set((s) => ({ health: Math.min(s.maxHealth, s.health + Math.max(0, amount)) })),
      spendAmmo: (amount) => {
        const a = Math.max(0, amount)
        const current = get().ammo
        if (current < a) return false
        set({ ammo: current - a })
        return true
      },
      reload: () =>
        set((s) => ({
          ammo: s.maxAmmo
        })),
      setMuzzleUntil: (until) => set({ muzzleUntil: until }),
      setHitMarkerUntil: (until) => set({ hitMarkerUntil: until }),
      setReloadUntil: (until) => set({ reloadUntil: until }),
      requestReload: () => {
        const s = get()
        if (s.gameState !== 'playing') return
        if (!SETTINGS.reload.enabled) return
        if (s.reloadUntil && Date.now() < s.reloadUntil) return
        if (s.ammo >= s.maxAmmo) return
        set({ reloadUntil: Date.now() + SETTINGS.reload.reloadMs })
      },
      addRecoil: (amount) =>
        set((s) => ({ recoil: Math.max(0, Math.min(0.2, s.recoil + Math.max(0, amount))) })),
      addScore: (amount) => set((s) => ({ score: s.score + Math.round(amount * (s.scoreMultiplier || 1)) })),
      addKill: () => set((s) => ({ kills: s.kills + 1 })),
      setEnemies: (enemies) => set({ enemies }),
      updateEnemy: (id, patch) =>
        set((s) => ({
          enemies: s.enemies.map((e) => (e.id === id ? { ...e, ...patch } : e))
        })),
      killEnemy: (id) =>
        set((s) => ({
          enemies: s.enemies.map((e) =>
            e.id === id ? { ...e, alive: false, health: 0 } : e
          )
        })),
      removeEnemy: (id) => set((s) => ({ enemies: s.enemies.filter((e) => e.id !== id) })),

      setPickups: (pickups) => set({ pickups }),
      pickupPowerup: (id) =>
        set((s) => ({
          pickups: s.pickups.map((p) => (p.id === id ? { ...p, active: false } : p))
        })),
      setBlackoutUntil: (until) => set({ blackoutUntil: until }),
      setIvaUntil: (until) => set({ ivaUntil: until }),
      showBanner: (text, ms = 2200) => set({ banner: { text, until: Date.now() + ms } }),

      highscores: [],
      addHighscore: (entry) =>
        set((s) => {
          const enriched = { ...entry, savedAt: Date.now() }
          const next = [enriched, ...s.highscores]
            .sort((a, b) => b.score - a.score)
            .slice(0, 20)
          return { highscores: next }
        }),
      clearHighscores: () => set({ highscores: [] })
    }),
    {
      name: 'doomNoboaHighscores_v2',
      partialize: (state) => ({ highscores: state.highscores })
    }
  )
)
