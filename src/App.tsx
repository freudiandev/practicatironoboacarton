import './App.css'
import { Canvas } from '@react-three/fiber'
import { GameScene } from './game/scenes/GameScene'
import { HudOverlay } from './game/ui/HudOverlay'
import { TouchControls } from './game/ui/TouchControls'
import { useEffect } from 'react'
import { useGameStore } from './game/store/useGameStore'
import { MenuOverlay } from './game/ui/MenuOverlay'
import { HelpOverlay } from './game/ui/HelpOverlay'
import { SeoOverlay } from './game/ui/SeoOverlay'

function App() {
  const setIsTouch = useGameStore((s) => s.setIsTouch)
  const setNetJoinId = useGameStore((s) => s.setNetJoinId)
  const setNetMode = useGameStore((s) => s.setNetMode)

  useEffect(() => {
    type NavigatorWithMsTouchPoints = Navigator & { msMaxTouchPoints?: number }
    const nav = typeof navigator !== 'undefined' ? navigator : null
    const touchPoints = nav
      ? (nav.maxTouchPoints || 0) + (((nav as NavigatorWithMsTouchPoints).msMaxTouchPoints || 0))
      : 0
    const coarse = typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia('(pointer: coarse)').matches
      : false
    const isTouch = ('ontouchstart' in window) || touchPoints > 0 || coarse
    setIsTouch(Boolean(isTouch))
  }, [setIsTouch])

  useEffect(() => {
    // Deep-link para P2P: `?join=<peerId>`
    const params = new URLSearchParams(window.location.search)
    const join = (params.get('join') || '').trim()
    if (!join) return
    setNetJoinId(join)
    setNetMode('join')
  }, [setNetJoinId, setNetMode])

  return (
    <div className="app-root">
      <HudOverlay />
      <TouchControls />
      <MenuOverlay />
      <HelpOverlay />
      <SeoOverlay />
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
