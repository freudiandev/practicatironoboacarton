import type { PowerUpType } from '../store/useGameStore'

export function powerupLabel(type: PowerUpType) {
  switch (type) {
    case 'consulta_popular':
      return 'La Consulta Popular'
    case 'iva_15':
      return 'El IVA al 15%'
    case 'apagon_nacional':
      return 'Apagón Nacional'
    default:
      return 'Power-Up'
  }
}

/**
 * Copy satírico (in-game). Evita afirmaciones verificables; se mantiene como crítica general/ficción.
 */
export function powerupBanner(type: PowerUpType) {
  switch (type) {
    case 'consulta_popular':
      return 'Consulta Popular: “inconstitucionaliza” todo en pantalla.'
    case 'iva_15':
      return 'IVA 15%: más puntos… pero tu vida paga el recargo.'
    case 'apagon_nacional':
      return 'Apagón Nacional: se apagan las luces, queda el neón y el miedo.'
    default:
      return 'Power-Up activado.'
  }
}

