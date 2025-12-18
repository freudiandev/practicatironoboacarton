import { useEffect, useMemo, useState } from 'react'

export type KeyState = {
  KeyW: boolean
  KeyA: boolean
  KeyS: boolean
  KeyD: boolean
  ShiftLeft: boolean
}

const DEFAULT_KEYS: KeyState = {
  KeyW: false,
  KeyA: false,
  KeyS: false,
  KeyD: false,
  ShiftLeft: false
}

export function useKeyboard() {
  const [keys, setKeys] = useState<KeyState>(DEFAULT_KEYS)

  const pressed = useMemo(() => keys, [keys])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!(e.code in DEFAULT_KEYS)) return
      setKeys((prev) => ({ ...prev, [e.code]: true }))
    }
    const onKeyUp = (e: KeyboardEvent) => {
      if (!(e.code in DEFAULT_KEYS)) return
      setKeys((prev) => ({ ...prev, [e.code]: false }))
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [])

  return pressed
}

