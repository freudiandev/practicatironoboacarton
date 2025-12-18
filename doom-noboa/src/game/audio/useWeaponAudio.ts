import { useCallback, useEffect, useRef } from 'react'

type WeaponAudio = {
  unlock: () => Promise<void>
  playShot: () => Promise<void>
  playHit: () => Promise<void>
  playHeadshot: (languageHint?: string) => Promise<void>
}

function createNoiseBuffer(ctx: AudioContext, duration: number, sampleRate = 44100) {
  const length = Math.floor(duration * sampleRate)
  const buffer = ctx.createBuffer(1, length, sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * 0.5
  return buffer
}

export function useWeaponAudio(): WeaponAudio {
  const ctxRef = useRef<AudioContext | null>(null)
  const masterRef = useRef<GainNode | null>(null)

  const ensureContext = useCallback(async () => {
    if (!ctxRef.current) {
      const Ctx = window.AudioContext || (window as any).webkitAudioContext
      ctxRef.current = new Ctx()
      masterRef.current = ctxRef.current.createGain()
      masterRef.current.gain.value = 0.7
      masterRef.current.connect(ctxRef.current.destination)
    }
    if (ctxRef.current.state === 'suspended') {
      await ctxRef.current.resume()
    }
  }, [])

  const unlock = useCallback(async () => {
    await ensureContext()
  }, [ensureContext])

  useEffect(() => {
    // Auto-unlock al primer input (sin obligar al usuario a abrir menú).
    const onFirst = async () => {
      try {
        await unlock()
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
  }, [unlock])

  const playShot = useCallback(async () => {
    await ensureContext()
    const ctx = ctxRef.current!
    const master = masterRef.current!
    const now = ctx.currentTime

    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.001, now)
    gain.gain.linearRampToValueAtTime(0.75, now + 0.008)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32)
    gain.connect(master)

    // click
    const clickOsc = ctx.createOscillator()
    clickOsc.type = 'square'
    clickOsc.frequency.setValueAtTime(1100, now)
    clickOsc.frequency.exponentialRampToValueAtTime(740, now + 0.012)
    clickOsc.connect(gain)
    clickOsc.start(now)
    clickOsc.stop(now + 0.02)

    // noise blast
    const noise = ctx.createBufferSource()
    noise.buffer = createNoiseBuffer(ctx, 0.12)
    const bp = ctx.createBiquadFilter()
    bp.type = 'bandpass'
    bp.frequency.setValueAtTime(720, now)
    bp.frequency.exponentialRampToValueAtTime(220, now + 0.11)
    bp.Q.setValueAtTime(1.4, now)
    noise.connect(bp)
    bp.connect(gain)
    noise.start(now)

    // low resonance
    const low = ctx.createOscillator()
    low.type = 'sawtooth'
    low.frequency.setValueAtTime(120, now + 0.02)
    low.frequency.exponentialRampToValueAtTime(62, now + 0.3)
    const lowGain = ctx.createGain()
    lowGain.gain.setValueAtTime(0.001, now)
    lowGain.gain.linearRampToValueAtTime(0.25, now + 0.03)
    lowGain.gain.exponentialRampToValueAtTime(0.001, now + 0.38)
    low.connect(lowGain)
    lowGain.connect(master)
    low.start(now + 0.02)
    low.stop(now + 0.38)
  }, [ensureContext])

  const playHit = useCallback(async () => {
    await ensureContext()
    const ctx = ctxRef.current!
    const master = masterRef.current!
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'square'
    osc.frequency.setValueAtTime(280, now)
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.12)
    gain.gain.setValueAtTime(0.22, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18)
    osc.connect(gain)
    gain.connect(master)
    osc.start(now)
    osc.stop(now + 0.18)
  }, [ensureContext])

  const playHeadshot = useCallback(
    async (languageHint?: string) => {
      const lang = (languageHint || navigator.language || 'es-ES').toLowerCase()
      const phrase = lang.startsWith('es') ? 'Headshot' : 'Headshot'

      if ('speechSynthesis' in window) {
        try {
          const u = new SpeechSynthesisUtterance(phrase)
          u.lang = lang
          u.rate = 0.9
          u.pitch = 0.85
          u.volume = 1
          window.speechSynthesis.cancel()
          window.speechSynthesis.speak(u)
          return
        } catch {
          // fallback a síntesis simple
        }
      }

      await ensureContext()
      const ctx = ctxRef.current!
      const master = masterRef.current!
      const now = ctx.currentTime

      // “voz” sintética muy simple (2 tonos formantes).
      const formant = (freq: number, t0: number) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        const bp = ctx.createBiquadFilter()
        osc.type = 'sawtooth'
        osc.frequency.setValueAtTime(freq, t0)
        bp.type = 'bandpass'
        bp.frequency.setValueAtTime(freq * 6.5, t0)
        bp.Q.setValueAtTime(7, t0)
        gain.gain.setValueAtTime(0.001, t0)
        gain.gain.linearRampToValueAtTime(0.25, t0 + 0.03)
        gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.28)
        osc.connect(bp)
        bp.connect(gain)
        gain.connect(master)
        osc.start(t0)
        osc.stop(t0 + 0.28)
      }

      formant(150, now)
      formant(220, now + 0.04)
    },
    [ensureContext]
  )

  return { unlock, playShot, playHit, playHeadshot }
}

