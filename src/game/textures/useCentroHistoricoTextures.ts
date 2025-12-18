import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { generateCentroHistoricoTextures } from './centroHistoricoGenerator'

export function useCentroHistoricoTextures() {
  const textures = useMemo(() => generateCentroHistoricoTextures(), [])

  useEffect(() => {
    return () => {
      Object.values(textures).forEach((t) => {
        const tex = t as unknown as THREE.Texture
        tex.dispose()
      })
    }
  }, [textures])

  return textures
}
