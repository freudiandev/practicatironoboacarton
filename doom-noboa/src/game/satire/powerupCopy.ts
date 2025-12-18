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
      return 'Consulta Popular: “inconstitucionaliza” todo en pantalla. (En el juego, claro.)'
    case 'iva_15':
      return 'IVA 15%: más puntos… pero tu vida paga el recargo.'
    case 'apagon_nacional':
      return 'Apagón Nacional: se apagan las luces, queda el neón y el miedo.'
    default:
      return 'Power-Up activado.'
  }
}

/**
 * Titulares satíricos (parodia). Basados en temas públicos/circulación mediática, sin validar como hechos.
 * Usar como “flavor text” del mundo del juego.
 */
export const SATIRE_HEADLINES: string[] = [
  // Nota: Copy de parodia. No pretende ser reportaje ni afirmación verificable.
  'Reforma “exprés”: el NO fue instantáneo… el mensaje oficial entró en “modo silencio”.',
  'Narrativa presidencial: desapareció unos días; reapareció como “post” con filtro y sin conferencia.',
  'Plan “Fénix”: mucha épica… y el mapa sigue con spawn agresivo de violencia.',
  'Seguridad: “vamos ganando”. La calle: “¿en qué server estás jugando?”',
  'Diésel: subsidio OFF. Paro ON. Estado de excepción: parche aplicado sin notas de versión.',
  'Protesta social: cuando el gobierno pone “mute” al diálogo y “max volume” al uniforme.',
  'Convoy presidencial: si hasta la caravana recibe “warning”, el control territorial está en beta.',
  'Regalos “sospechosos”: el guion pidió thriller; el público lo leyó como cortina de humo deluxe.',
  'Video de abuso: el “orden” se ve peor que el caos… incluso en baja resolución.',
  'Energía: “ya no habrá apagones”. Spoiler: el juego se quedó sin luz en medio del boss fight.',
  'Apagones: promesa de fin cercano… y el contador de cortes sigue sumando en segundo plano.',
  'Vicepresidencia (feat. Abad): drama interno en loop infinito, sin botón de “skip cutscene”.',
  'Institucionalidad: cuando la sucesión parece un minijuego… y nadie conoce las reglas.',
  'Austeridad: recortes por aquí, despidos por allá; el DLC de “servicios públicos” se desinstala.',
  'Hospitales/Educación: te dicen “optimización de gasto”; tú ves “nerf” al loot de derechos.',
  'Cárceles: el boss sigue adentro, con respawn ilimitado y chat de banda activo.',
  'Sistema carcelario: “militarizado”. Resultado: el bug sigue abierto y nadie lo hotfixea.'
]

export function randomSatireHeadline(seed: number) {
  const s = Math.abs(Math.floor(seed || 0))
  return SATIRE_HEADLINES[s % SATIRE_HEADLINES.length]
}
