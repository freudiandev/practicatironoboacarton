import { useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGameStore } from '../store/useGameStore'

export function TimeSystem() {
  const gameState = useGameStore((s) => s.gameState)
  const startedAt = useGameStore((s) => s.startedAt)

  useFrame(() => {
    if (gameState !== 'playing') return
    if (!startedAt) return
    const seconds = Math.floor((Date.now() - startedAt) / 1000)
    const current = useGameStore.getState().timeSeconds
    if (seconds !== current) {
      useGameStore.setState({ timeSeconds: seconds })
    }
  })

  useEffect(() => {
    if (gameState !== 'playing') return
    // En playing, asegura startedAt.
    if (!startedAt) {
      useGameStore.setState({ startedAt: Date.now() })
    }
  }, [gameState, startedAt])

  return null
}

