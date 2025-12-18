import './App.css'
import { Canvas } from '@react-three/fiber'
import { GameScene } from './game/scenes/GameScene'
import { HudOverlay } from './game/ui/HudOverlay'
import { TouchControls } from './game/ui/TouchControls'
import { useEffect } from 'react'
import { useGameStore } from './game/store/useGameStore'

function App() {
  const setIsTouch = useGameStore((s) => s.setIsTouch)

  useEffect(() => {
    const nav = typeof navigator !== 'undefined' ? navigator : null
    const touchPoints = nav ? ((nav.maxTouchPoints || 0) + (((nav as any).msMaxTouchPoints as number) || 0)) : 0
    const coarse = typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia('(pointer: coarse)').matches
      : false
    const isTouch = ('ontouchstart' in window) || touchPoints > 0 || coarse
    setIsTouch(Boolean(isTouch))
  }, [setIsTouch])

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <HudOverlay />
      <TouchControls />
      <Canvas
        dpr={[1, 2]}
        gl={{ antialias: false, powerPreference: 'high-performance' }}
        camera={{ fov: 72, position: [0, 1.6, 6], near: 0.05, far: 250 }}
      >
        <GameScene />
      </Canvas>
    </div>
  )
}

export default App
