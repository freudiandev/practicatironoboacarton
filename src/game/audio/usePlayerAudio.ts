import { useCallback, useEffect, useRef } from 'react'

type PlayerAudio = {
  playHurt: () => Promise<void>
}

function createNoiseBuffer(ctx: AudioContext, duration: number, sampleRate = 44100) {
  const length = Math.floor(duration * sampleRate)
  const buffer = ctx.createBuffer(1, length, sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * 0.6
  return buffer
}

export function usePlayerAudio(): PlayerAudio {
  const ctxRef = useRef<AudioContext | null>(null)
  const masterRef = useRef<GainNode | null>(null)

  const ensureContext = useCallback(async () => {
    if (!ctxRef.current) {
      type WebkitWindow = Window & { webkitAudioContext?: typeof AudioContext }
      const Ctx = window.AudioContext || (window as WebkitWindow).webkitAudioContext
      if (!Ctx) throw new Error('AudioContext not available')
      ctxRef.current = new Ctx()
      masterRef.current = ctxRef.current.createGain()
      masterRef.current.gain.value = 0.65
      masterRef.current.connect(ctxRef.current.destination)
    }
    if (ctxRef.current.state === 'suspended') {
      await ctxRef.current.resume()
    }
  }, [])

  useEffect(() => {
    const onFirst = async () => {
      try {
        await ensureContext()
      } catch {
        // ignore unlock errors
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
  }, [ensureContext])

  const playHurt = useCallback(async () => {
    await ensureContext()
    const ctx = ctxRef.current!
    const master = masterRef.current!
    const now = ctx.currentTime + 0.005

    // Body hit thump
    const thump = ctx.createOscillator()
    thump.type = 'sine'
    thump.frequency.setValueAtTime(95, now)
    thump.frequency.exponentialRampToValueAtTime(52, now + 0.35)
    const thumpGain = ctx.createGain()
    thumpGain.gain.setValueAtTime(0.001, now)
    thumpGain.gain.linearRampToValueAtTime(0.6, now + 0.04)
    thumpGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45)
    thump.connect(thumpGain)
    thumpGain.connect(master)
    thump.start(now)
    thump.stop(now + 0.5)

    // Grit noise for pain
    const noise = ctx.createBufferSource()
    noise.buffer = createNoiseBuffer(ctx, 0.2)
    const band = ctx.createBiquadFilter()
    band.type = 'bandpass'
    band.frequency.setValueAtTime(720, now)
    band.Q.setValueAtTime(0.8, now)
    const noiseGain = ctx.createGain()
    noiseGain.gain.setValueAtTime(0.001, now)
    noiseGain.gain.linearRampToValueAtTime(0.4, now + 0.02)
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25)
    noise.connect(band)
    band.connect(noiseGain)
    noiseGain.connect(master)
    noise.start(now)
  }, [ensureContext])

  return { playHurt }
}
