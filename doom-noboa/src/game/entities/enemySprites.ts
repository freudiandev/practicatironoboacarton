export type EnemySpriteType = 'casual' | 'deportivo' | 'presidencial'

export function getEnemySpriteUrl(type: EnemySpriteType) {
  switch (type) {
    case 'casual':
      return '/sprites/noboa-casual.png'
    case 'deportivo':
      return '/sprites/noboa-deportivo.png'
    case 'presidencial':
      return '/sprites/noboa-presidencial.png'
    default:
      return '/sprites/noboa-casual.png'
  }
}

