export type EnemySpriteType = 'casual' | 'deportivo' | 'presidencial'

function withBase(path: string) {
  const base = import.meta.env.BASE_URL || '/'
  return `${base}${path.replace(/^\//, '')}`
}

export function getEnemySpriteUrl(type: EnemySpriteType) {
  switch (type) {
    case 'casual':
      return withBase('sprites/noboa-casual.png')
    case 'deportivo':
      return withBase('sprites/noboa-deportivo.png')
    case 'presidencial':
      return withBase('sprites/noboa-presidencial.png')
    default:
      return withBase('sprites/noboa-casual.png')
  }
}
