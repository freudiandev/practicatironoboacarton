import { useCallback, useEffect, useState } from 'react'

export function usePointerLock() {
  const [locked, setLocked] = useState(false)

  useEffect(() => {
    const onChange = () => setLocked(Boolean(document.pointerLockElement))
    document.addEventListener('pointerlockchange', onChange)
    return () => document.removeEventListener('pointerlockchange', onChange)
  }, [])

  const request = useCallback((element: HTMLElement | null) => {
    if (!element) return
    if (document.pointerLockElement === element) return
    element.requestPointerLock()
  }, [])

  const exit = useCallback(() => {
    if (!document.pointerLockElement) return
    document.exitPointerLock()
  }, [])

  return { locked, request, exit }
}

