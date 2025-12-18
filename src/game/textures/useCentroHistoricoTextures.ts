import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { generateCentroHistoricoTextures } from './centroHistoricoGenerator'

export function useCentroHistoricoTextures(lowRes = false) {
  const textures = useMemo(() => generateCentroHistoricoTextures({ lowRes }), [lowRes])

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
