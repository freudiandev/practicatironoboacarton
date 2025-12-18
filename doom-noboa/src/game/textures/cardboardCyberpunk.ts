import * as THREE from 'three'

function setPixelFilters(tex: THREE.Texture) {
  tex.colorSpace = THREE.SRGBColorSpace
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.RepeatWrapping
  tex.magFilter = THREE.NearestFilter
  tex.minFilter = THREE.NearestMipmapNearestFilter
  tex.generateMipmaps = true
  tex.anisotropy = 1
  tex.needsUpdate = true
}

function setNormalFilters(tex: THREE.Texture) {
  tex.colorSpace = THREE.NoColorSpace
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.RepeatWrapping
  tex.magFilter = THREE.NearestFilter
  tex.minFilter = THREE.NearestMipmapNearestFilter
  tex.generateMipmaps = true
  tex.anisotropy = 1
  tex.needsUpdate = true
}

function createCanvas(size: number) {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) throw new Error('No se pudo crear canvas 2D para texturas')
  ctx.imageSmoothingEnabled = false
  return { canvas, ctx }
}

export function createCardboardAlbedo(size = 128) {
  const { canvas, ctx } = createCanvas(size)

  ctx.fillStyle = '#b38352'
  ctx.fillRect(0, 0, size, size)

  // Fibra/papel: ruido discreto.
  for (let i = 0; i < size * 24; i++) {
    const x = (Math.random() * size) | 0
    const y = (Math.random() * size) | 0
    const v = 140 + ((Math.random() * 70) | 0)
    ctx.fillStyle = `rgba(${v}, ${v - 22}, ${v - 45}, 0.12)`
    ctx.fillRect(x, y, 1, 1)
  }

  // Corrugado: bandas verticales (ilusión de cartón).
  const period = 10
  for (let x = 0; x < size; x++) {
    const t = (x % period) / period
    const shade = t < 0.5 ? 0.09 : 0.0
    if (shade <= 0) continue
    ctx.fillStyle = `rgba(40, 20, 10, ${shade})`
    ctx.fillRect(x, 0, 1, size)
  }

  // “Cinta” y marcas cyberpunk
  ctx.fillStyle = 'rgba(10, 10, 18, 0.35)'
  ctx.fillRect(0, (size * 0.72) | 0, size, 4)
  ctx.fillStyle = 'rgba(255, 0, 170, 0.42)'
  ctx.fillRect((size * 0.08) | 0, (size * 0.18) | 0, (size * 0.55) | 0, 2)
  ctx.fillStyle = 'rgba(0, 255, 240, 0.35)'
  ctx.fillRect((size * 0.2) | 0, (size * 0.42) | 0, (size * 0.68) | 0, 1)

  const texture = new THREE.CanvasTexture(canvas)
  setPixelFilters(texture)
  texture.repeat.set(2, 2)
  return texture
}

export function createCardboardEmissive(size = 128) {
  const { canvas, ctx } = createCanvas(size)
  ctx.clearRect(0, 0, size, size)

  const drawNeon = (color: string, alpha: number, y: number, height = 1) => {
    ctx.fillStyle = `rgba(${color}, ${alpha})`
    ctx.fillRect(0, y, size, height)
  }

  // Líneas neon “scanline” (se animan desde el material/luz, no desde la textura).
  drawNeon('255,0,170', 0.55, (size * 0.12) | 0, 1)
  drawNeon('0,255,240', 0.42, (size * 0.32) | 0, 1)
  drawNeon('255,214,0', 0.28, (size * 0.56) | 0, 1)

  // Puntos “led”
  for (let i = 0; i < 22; i++) {
    const x = (Math.random() * size) | 0
    const y = (Math.random() * size) | 0
    const c = i % 2 === 0 ? '255,0,170' : '0,255,240'
    ctx.fillStyle = `rgba(${c}, ${0.65 + Math.random() * 0.25})`
    ctx.fillRect(x, y, 1, 1)
  }

  const texture = new THREE.CanvasTexture(canvas)
  setNormalFilters(texture)
  texture.repeat.set(2, 2)
  return texture
}

export function createCorrugationNormalMap(size = 128) {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) throw new Error('No se pudo crear normalMap (canvas 2D)')

  const img = ctx.createImageData(size, size)
  const data = img.data

  // Altura sinusoidal en X (corrugado), con un poco de jitter por fila.
  const freq = (Math.PI * 2) / 10
  const strength = 1.4

  for (let y = 0; y < size; y++) {
    const jitter = (Math.sin(y * 0.2) + Math.random() * 0.25) * 0.25
    for (let x = 0; x < size; x++) {
      const h = Math.sin(x * freq + jitter)
      const dhdx = Math.cos(x * freq + jitter) * freq
      const nx = -dhdx * strength
      const ny = 0
      const nz = 1
      const len = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1

      const r = ((nx / len) * 0.5 + 0.5) * 255
      const g = ((ny / len) * 0.5 + 0.5) * 255
      const b = ((nz / len) * 0.5 + 0.5) * 255

      const idx = (y * size + x) * 4
      data[idx] = r
      data[idx + 1] = g
      data[idx + 2] = b
      data[idx + 3] = 255
    }
  }

  ctx.putImageData(img, 0, 0)

  const texture = new THREE.CanvasTexture(canvas)
  setNormalFilters(texture)
  texture.repeat.set(2, 2)
  return texture
}

export function createCardboardWallMaterial() {
  const map = createCardboardAlbedo(128)
  const normalMap = createCorrugationNormalMap(128)
  const emissiveMap = createCardboardEmissive(128)

  const material = new THREE.MeshStandardMaterial({
    map,
    normalMap,
    normalScale: new THREE.Vector2(0.7, 0.7),
    emissive: new THREE.Color('#ff00aa'),
    emissiveIntensity: 0.35,
    emissiveMap,
    roughness: 0.95,
    metalness: 0.02
  })

  return { material, textures: { map, normalMap, emissiveMap } }
}

