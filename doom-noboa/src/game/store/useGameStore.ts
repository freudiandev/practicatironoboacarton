import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type GameState = 'menu' | 'playing' | 'paused' | 'gameover' | 'win'

export type EnemyType = 'casual' | 'deportivo' | 'presidencial'

export type Enemy = {
  id: string
  type: EnemyType
  position: { x: number; y: number; z: number }
  health: number
  maxHealth: number
  alive: boolean
}

export type HighScoreEntry = {
  name: string
  score: number
  kills: number
  time: number
  outcome: 'win' | 'loss'
  savedAt: number
}

type GameStore = {
  gameState: GameState
  health: number
  maxHealth: number
  ammo: number
  maxAmmo: number
  score: number
  kills: number
  enemies: Enemy[]

  isTouch: boolean
  pointerLocked: boolean
  playerPose: { x: number; y: number; z: number; yaw: number; pitch: number }
  moveAxis: { x: number; z: number }
  lookAxis: { x: number; y: number }

  setGameState: (state: GameState) => void
  setIsTouch: (value: boolean) => void
  setPointerLocked: (locked: boolean) => void
  setPlayerPose: (pose: Partial<GameStore['playerPose']>) => void
  setMoveAxis: (axis: Partial<GameStore['moveAxis']>) => void
  setLookAxis: (axis: Partial<GameStore['lookAxis']>) => void
  damage: (amount: number) => void
  heal: (amount: number) => void
  spendAmmo: (amount: number) => boolean
  addScore: (amount: number) => void
  addKill: () => void
  setEnemies: (enemies: Enemy[]) => void
  killEnemy: (id: string) => void

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
      score: 0,
      kills: 0,
      enemies: [],

      isTouch: false,
      pointerLocked: false,
      playerPose: { x: 0, y: 1.6, z: 0, yaw: 0, pitch: 0 },
      moveAxis: { x: 0, z: 0 },
      lookAxis: { x: 0, y: 0 },

      setGameState: (state) => set({ gameState: state }),
      setIsTouch: (value) => set({ isTouch: value }),
      setPointerLocked: (locked) => set({ pointerLocked: locked }),
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
      damage: (amount) =>
        set((s) => ({ health: Math.max(0, s.health - Math.max(0, amount)) })),
      heal: (amount) =>
        set((s) => ({ health: Math.min(s.maxHealth, s.health + Math.max(0, amount)) })),
      spendAmmo: (amount) => {
        const a = Math.max(0, amount)
        const current = get().ammo
        if (current < a) return false
        set({ ammo: current - a })
        return true
      },
      addScore: (amount) => set((s) => ({ score: s.score + amount })),
      addKill: () => set((s) => ({ kills: s.kills + 1 })),
      setEnemies: (enemies) => set({ enemies }),
      killEnemy: (id) =>
        set((s) => ({
          enemies: s.enemies.map((e) =>
            e.id === id ? { ...e, alive: false, health: 0 } : e
          )
        })),

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
