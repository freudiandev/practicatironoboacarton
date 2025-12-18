import { useFrame } from '@react-three/fiber'
import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { MAZE } from '../config/maze'
import { WORLD } from '../config/world'
import { cellToWorldCenter, getMazeMetrics, isWallCell } from '../config/mazeMath'
import { randomSatireHeadline, powerupBanner, powerupLabel } from '../satire/powerupCopy'
import { useGameStore } from '../store/useGameStore'
import { createSatirePosterTexture } from '../textures/satirePosterGenerator'

type PosterPlacement = {
  matrix: THREE.Matrix4
  textureIndex: number
}

function mulberry32(seed: number) {
  let t = seed >>> 0
  return () => {
    t += 0x6d2b79f5
    let x = Math.imul(t ^ (t >>> 15), 1 | t)
    x ^= x + Math.imul(x ^ (x >>> 7), 61 | x)
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296
  }
}

function generatePlacements(seed: number, maxPosters: number) {
  const rand = mulberry32(seed)
  const { rows, cols } = getMazeMetrics(MAZE, WORLD.cellSize)

  const placements: PosterPlacement[] = []
  const m = new THREE.Matrix4()
  const pos = new THREE.Vector3()
  const quat = new THREE.Quaternion()
  const tmpTilt = new THREE.Quaternion()
  const scale = new THREE.Vector3()
  const forward = new THREE.Vector3(0, 0, 1)
  const up = new THREE.Vector3(0, 1, 0)

  // Candidatos: paredes internas visibles desde celdas libres.
  const candidates: { cx: number; cz: number; dx: number; dz: number }[] = []
  for (let z = 0; z < rows; z++) {
    for (let x = 0; x < cols; x++) {
      if (isWallCell(MAZE, x, z)) continue
      // Si hay pared adyacente, se puede pegar un cartel ahí.
      if (isWallCell(MAZE, x, z - 1)) candidates.push({ cx: x, cz: z, dx: 0, dz: -1 })
      if (isWallCell(MAZE, x, z + 1)) candidates.push({ cx: x, cz: z, dx: 0, dz: 1 })
      if (isWallCell(MAZE, x - 1, z)) candidates.push({ cx: x, cz: z, dx: -1, dz: 0 })
      if (isWallCell(MAZE, x + 1, z)) candidates.push({ cx: x, cz: z, dx: 1, dz: 0 })
    }
  }

  // Shuffle determinístico (Fisher-Yates).
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    const tmp = candidates[i]
    candidates[i] = candidates[j]
    candidates[j] = tmp
  }

  const used = new Set<string>()
  const epsilon = 0.006

  for (const c of candidates) {
    if (placements.length >= maxPosters) break

    const key = `${c.cx},${c.cz},${c.dx},${c.dz}`
    if (used.has(key)) continue
    used.add(key)

    // Dispersión (evita saturar el HUD visual en móvil).
    if (rand() < 0.6) continue

    const center = cellToWorldCenter(MAZE, WORLD.cellSize, c.cx, c.cz)
    pos.set(
      center.x + c.dx * (WORLD.cellSize / 2 - epsilon),
      WORLD.floorY + 1.02 + (rand() - 0.5) * 0.18,
      center.z + c.dz * (WORLD.cellSize / 2 - epsilon)
    )

    // Orientación: que el plano mire hacia la celda libre.
    const normal = new THREE.Vector3(-c.dx, 0, -c.dz).normalize()
    quat.setFromUnitVectors(forward, normal)
    tmpTilt.setFromAxisAngle(up, (rand() - 0.5) * 0.08)
    quat.multiply(tmpTilt)

    const w = 0.62 + rand() * 0.16
    const h = 0.52 + rand() * 0.22
    scale.set(w, h, 1)

    m.compose(pos, quat, scale)
    const textureIndex = Math.floor(rand() * 6) // 0..5
    placements.push({ matrix: m.clone(), textureIndex })
  }

  return placements
}

export function PostersInstanced() {
  const meshesRef = useRef<THREE.InstancedMesh[]>([])
  const materialsRef = useRef<THREE.MeshStandardMaterial[]>([])

  const { textures, placementsByTexture } = useMemo(() => {
    const seed = 1337

    const t: THREE.Texture[] = []

    // 4 titulares + 2 “propagandas” de power-ups.
    for (let i = 0; i < 4; i++) {
      t.push(
        createSatirePosterTexture({
          seed: seed + i * 97,
          headline: randomSatireHeadline(seed + i * 31),
          subtitle: 'Centro Histórico · Cartón Cyberpunk'
        })
      )
    }

    t.push(
      createSatirePosterTexture({
        seed: seed + 701,
        headline: powerupLabel('apagon_nacional').toUpperCase(),
        subtitle: powerupBanner('apagon_nacional')
      })
    )
    t.push(
      createSatirePosterTexture({
        seed: seed + 911,
        headline: powerupLabel('iva_15').toUpperCase(),
        subtitle: powerupBanner('iva_15')
      })
    )

    const placements = generatePlacements(seed, 18)
    const byTexture: PosterPlacement[][] = Array.from({ length: t.length }, () => [])
    for (const p of placements) byTexture[p.textureIndex % t.length].push(p)

    return { textures: t, placementsByTexture: byTexture }
  }, [])

  const materials = useMemo(() => {
    const mats = textures.map((tex) => {
      const mat = new THREE.MeshStandardMaterial({
        map: tex,
        roughness: 0.92,
        metalness: 0.05,
        emissive: new THREE.Color('#170018'),
        emissiveIntensity: 0.24
      })
      return mat
    })
    materialsRef.current = mats
    return mats
  }, [textures])

  useLayoutEffect(() => {
    // Reset refs array to match mesh count.
    meshesRef.current = []
  }, [materials.length])

  useLayoutEffect(() => {
    // Cargar matrices.
    for (let tIndex = 0; tIndex < placementsByTexture.length; tIndex++) {
      const mesh = meshesRef.current[tIndex]
      if (!mesh) continue

      const list = placementsByTexture[tIndex]
      for (let i = 0; i < list.length; i++) {
        mesh.setMatrixAt(i, list[i].matrix)
      }
      mesh.instanceMatrix.needsUpdate = true
      mesh.computeBoundingSphere()
    }
  }, [placementsByTexture])

  useFrame(({ clock }) => {
    void clock
    const blackoutUntil = useGameStore.getState().blackoutUntil
    const blackout = blackoutUntil && Date.now() < blackoutUntil

    // Blackout “real”: posters casi invisibles (solo algo de emissive en modo normal).
    for (const mat of materialsRef.current) {
      mat.emissiveIntensity = blackout ? 0 : 0.24
    }
  })

  return (
    <group name="posters">
      {materials.map((mat, idx) => {
        const count = placementsByTexture[idx]?.length ?? 0
        if (count <= 0) return null
        return (
          <instancedMesh
            // eslint-disable-next-line react/no-array-index-key
            key={`poster_${idx}`}
            ref={(m) => {
              if (!m) return
              meshesRef.current[idx] = m
            }}
            args={[undefined, mat, count]}
            frustumCulled
          >
            <planeGeometry args={[1, 1]} />
          </instancedMesh>
        )
      })}
    </group>
  )
}
