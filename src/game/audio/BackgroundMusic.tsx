import { useEffect, useRef } from 'react'
import { useGameStore } from '../store/useGameStore'

type MusicMode = 'menu' | 'calm' | 'combat' | 'blackout'

function createNoiseBuffer(ctx: AudioContext, duration: number, sampleRate = 44100) {
  const length = Math.floor(duration * sampleRate)
  const buffer = ctx.createBuffer(1, length, sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * 0.6
  return buffer
}

function playTone(ctx: AudioContext, master: GainNode, freq: number, duration: number, gainValue: number, type: OscillatorType = 'sawtooth') {
  const now = ctx.currentTime + 0.02
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, now)
  osc.frequency.linearRampToValueAtTime(freq * 0.96, now + duration * 0.6)
  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.linearRampToValueAtTime(gainValue, now + 0.08)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration)
  osc.connect(gain)
  gain.connect(master)
  osc.start(now)
  osc.stop(now + duration + 0.05)
}

function playPerc(ctx: AudioContext, master: GainNode, freq: number) {
  const now = ctx.currentTime + 0.01
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'triangle'
  osc.frequency.setValueAtTime(freq, now)
  osc.frequency.exponentialRampToValueAtTime(freq * 0.45, now + 0.12)
  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.linearRampToValueAtTime(0.5, now + 0.015)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18)
  osc.connect(gain)
  gain.connect(master)
  osc.start(now)
  osc.stop(now + 0.2)

  const noise = ctx.createBufferSource()
  noise.buffer = createNoiseBuffer(ctx, 0.12, ctx.sampleRate)
  const ngain = ctx.createGain()
  ngain.gain.setValueAtTime(0.0001, now)
  ngain.gain.linearRampToValueAtTime(0.35, now + 0.015)
  ngain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16)
  noise.connect(ngain)
  ngain.connect(master)
  noise.start(now)
}

export function BackgroundMusic() {
  const gameState = useGameStore((s) => s.gameState)
  const blackoutUntil = useGameStore((s) => s.blackoutUntil)
  const enemiesAlive = useGameStore((s) => s.enemies.some((e) => e.alive))
  const health = useGameStore((s) => s.health)

  const ctxRef = useRef<AudioContext | null>(null)
  const masterRef = useRef<GainNode | null>(null)
  const intervalRef = useRef<number | null>(null)
  const modeRef = useRef<MusicMode>('menu')
  const healthRef = useRef<number>(health)

  useEffect(() => {
    healthRef.current = health
  }, [health])

  const ensureContext = async () => {
    if (!ctxRef.current) {
      type WebkitWindow = Window & { webkitAudioContext?: typeof AudioContext }
      const Ctx = window.AudioContext || (window as WebkitWindow).webkitAudioContext
      if (!Ctx) throw new Error('AudioContext not available')
      ctxRef.current = new Ctx()
      masterRef.current = ctxRef.current.createGain()
      masterRef.current.gain.value = 0.12
      masterRef.current.connect(ctxRef.current.destination)
    }
    if (ctxRef.current.state === 'suspended') await ctxRef.current.resume()
  }

  useEffect(() => {
    const onFirst = async () => {
      try {
        await ensureContext()
      } catch {
        // ignore
      } finally {
        window.removeEventListener('pointerdown', onFirst)
        window.removeEventListener('keydown', onFirst)
      }
    }
    window.addEventListener('pointerdown', onFirst, { once: true })
    window.addEventListener('keydown', onFirst, { once: true })
    return () => {
      window.removeEventListener('pointerdown', onFirst)
      window.removeEventListener('keydown', onFirst)
    }
  }, [])

  useEffect(() => {
    const nextMode: MusicMode =
      gameState !== 'playing'
        ? 'menu'
        : blackoutUntil > Date.now()
          ? 'blackout'
          : enemiesAlive
            ? 'combat'
            : 'calm'

    if (nextMode === modeRef.current) return
    modeRef.current = nextMode

    const stopPattern = () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      const ctx = ctxRef.current
      const master = masterRef.current
      if (ctx && master) {
        const now = ctx.currentTime
        master.gain.cancelScheduledValues(now)
        master.gain.exponentialRampToValueAtTime(0.0001, now + 0.4)
      }
    }

    const startPattern = async (mode: MusicMode) => {
      await ensureContext()
      const ctx = ctxRef.current!
      const master = masterRef.current!
      const now = ctx.currentTime
      const baseGain = mode === 'combat' ? 0.22 : mode === 'blackout' ? 0.16 : 0.14
      master.gain.setValueAtTime(baseGain, now)

      if (intervalRef.current) window.clearInterval(intervalRef.current)

      const beatMs = mode === 'combat' ? 520 : mode === 'blackout' ? 900 : mode === 'menu' ? 1100 : 780

      const playPattern = () => {
        if (!ctxRef.current || !masterRef.current) return
        const healthFactor = Math.max(0.6, Math.min(1.15, healthRef.current / 100))
        if (mode === 'combat') {
          // Acordes tensos + percusión rápida
          playTone(ctx, master, 190 * healthFactor, 0.7, 0.12, 'sawtooth')
          playTone(ctx, master, 150, 0.65, 0.1, 'square')
          playPerc(ctx, master, 420)
        } else if (mode === 'blackout') {
          // Drone oscuro
          playTone(ctx, master, 82, 1.6, 0.08, 'sine')
          playTone(ctx, master, 64, 1.2, 0.06, 'triangle')
        } else if (mode === 'calm') {
          // Paseo melancólico por el Centro Histórico
          playTone(ctx, master, 140 * healthFactor, 1.2, 0.08, 'triangle')
          playTone(ctx, master, 210, 0.9, 0.05, 'sine')
          if (Math.random() > 0.6) playPerc(ctx, master, 260)
        } else {
          // Menú: pulso suave
          playTone(ctx, master, 128, 1.3, 0.05, 'sine')
        }
      }

      playPattern()
      intervalRef.current = window.setInterval(playPattern, beatMs)
    }

    stopPattern()
    void startPattern(nextMode)

    return () => {
      stopPattern()
    }
  }, [blackoutUntil, enemiesAlive, gameState])

  return null
}
