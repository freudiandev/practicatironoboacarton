import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { MAZE } from '../config/maze'
import { SETTINGS } from '../config/settings'
import { WORLD } from '../config/world'
import { cellToWorldCenter } from '../config/mazeMath'
import { moveWithGridCollision } from '../physics/gridCollision'
import { useKeyboard } from '../input/useKeyboard'
import { usePointerLock } from '../input/usePointerLock'
import { useGameStore } from '../store/useGameStore'

export function PlayerController() {
  const keys = useKeyboard()
  const { gl, camera } = useThree()
  const { locked, request } = usePointerLock()
  const setPointerLocked = useGameStore((s) => s.setPointerLocked)

  const yaw = useRef(0)
  const pitch = useRef(0)
  const velocity = useRef(new THREE.Vector3())

  const tmpForward = useMemo(() => new THREE.Vector3(), [])
  const tmpRight = useMemo(() => new THREE.Vector3(), [])
  const tmpUp = useMemo(() => new THREE.Vector3(0, 1, 0), [])

  // Spawn inicial: usar el mismo cell del legacy (10,7) pero convertido al mundo centrado.
  useEffect(() => {
    const { x, z } = cellToWorldCenter(MAZE, WORLD.cellSize, SETTINGS.player.spawnCell.x, SETTINGS.player.spawnCell.z)
    camera.position.set(x, SETTINGS.player.eyeHeight, z)
    camera.rotation.set(0, 0, 0)
    yaw.current = 0
    pitch.current = 0
  }, [camera])

  useEffect(() => {
    setPointerLocked(locked)
  }, [locked, setPointerLocked])

  useEffect(() => {
    const handleClick = () => request(gl.domElement)
    gl.domElement.addEventListener('click', handleClick)
    return () => gl.domElement.removeEventListener('click', handleClick)
  }, [gl.domElement, request])

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!locked) return
      yaw.current -= e.movementX * SETTINGS.player.mouseSensitivity
      pitch.current -= e.movementY * SETTINGS.player.mouseSensitivity
      pitch.current = Math.max(-SETTINGS.player.pitchClamp, Math.min(SETTINGS.player.pitchClamp, pitch.current))
    }
    window.addEventListener('mousemove', onMouseMove)
    return () => window.removeEventListener('mousemove', onMouseMove)
  }, [locked])

  useFrame((_, delta) => {
    // Siempre actualizar rotación (para que se “sienta” inmediato en pointer lock).
    camera.rotation.set(pitch.current, yaw.current, 0, 'YXZ')

    if (!locked) return

    const speed = SETTINGS.player.moveSpeed * (keys.ShiftLeft ? SETTINGS.player.sprintMultiplier : 1)
    const desired = velocity.current
    desired.set(0, 0, 0)

    // forward en el plano XZ (sin pitch).
    tmpForward.set(0, 0, -1).applyAxisAngle(tmpUp, yaw.current).normalize()
    tmpRight.copy(tmpForward).cross(tmpUp).normalize()

    if (keys.KeyW) desired.add(tmpForward)
    if (keys.KeyS) desired.sub(tmpForward)
    if (keys.KeyD) desired.add(tmpRight)
    if (keys.KeyA) desired.sub(tmpRight)

    if (desired.lengthSq() > 0) desired.normalize()
    desired.multiplyScalar(speed * delta)

    const moved = moveWithGridCollision({
      maze: MAZE,
      cellSize: WORLD.cellSize,
      position: { x: camera.position.x, z: camera.position.z },
      delta: { x: desired.x, z: desired.z },
      radius: SETTINGS.player.radius
    })

    camera.position.x = moved.x
    camera.position.z = moved.z

    useGameStore.getState().setPlayerPose({
      x: camera.position.x,
      y: camera.position.y,
      z: camera.position.z,
      yaw: yaw.current,
      pitch: pitch.current
    })
  })

  return null
}

