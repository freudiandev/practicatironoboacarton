import './App.css'
import { Canvas } from '@react-three/fiber'
import { GameScene } from './game/scenes/GameScene'

function App() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
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
