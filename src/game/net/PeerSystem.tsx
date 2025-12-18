import Peer, { type DataConnection } from 'peerjs'
import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGameStore } from '../store/useGameStore'
import type { NetMessage, PoseMessage } from './types'

function isPoseMessage(v: unknown): v is PoseMessage {
  if (!v || typeof v !== 'object') return false
  const m = v as Record<string, unknown>
  return (
    m.t === 'pose' &&
    typeof m.x === 'number' &&
    typeof m.y === 'number' &&
    typeof m.z === 'number' &&
    typeof m.yaw === 'number' &&
    typeof m.pitch === 'number' &&
    typeof m.ts === 'number'
  )
}

export function PeerSystem() {
  const mode = useGameStore((s) => s.netMode)
  const joinId = useGameStore((s) => s.netJoinId)
  const setPeerId = useGameStore((s) => s.setNetPeerId)
  const setConnected = useGameStore((s) => s.setNetConnected)
  const setStatus = useGameStore((s) => s.setNetStatus)
  const setRemotePose = useGameStore((s) => s.setNetRemotePose)

  const peerRef = useRef<Peer | null>(null)
  const connRef = useRef<DataConnection | null>(null)
  const lastSentAt = useRef(0)

  const sendHz = useMemo(() => 18, [])
  const sendEveryMs = useMemo(() => Math.round(1000 / sendHz), [sendHz])

  useEffect(() => {
    // Cleanup helper
    const cleanup = () => {
      try {
        connRef.current?.close()
      } catch {
        // ignore
      }
      connRef.current = null

      try {
        peerRef.current?.destroy()
      } catch {
        // ignore
      }
      peerRef.current = null

      setPeerId('')
      setConnected(false)
      setRemotePose(null)
    }

    if (mode === 'off') {
      cleanup()
      setStatus('')
      return
    }

    cleanup()
    setStatus(mode === 'host' ? 'Creando sala…' : 'Conectando…')

    const peer = new Peer()
    peerRef.current = peer

    const attachConn = (conn: DataConnection) => {
      // Solo 1 conexión activa (MVP).
      try {
        connRef.current?.close()
      } catch {
        // ignore
      }
      connRef.current = conn
      setConnected(false)
      setRemotePose(null)

      conn.on('open', () => {
        setConnected(true)
        setStatus('Conectado ✔')
      })
      conn.on('close', () => {
        setConnected(false)
        setRemotePose(null)
        setStatus('Desconectado')
      })
      conn.on('error', (err) => {
        setConnected(false)
        setRemotePose(null)
        const t = (err as { type?: unknown } | null)?.type
        setStatus(`Error: ${String(typeof t === 'string' ? t : err)}`)
      })
      conn.on('data', (data: unknown) => {
        if (isPoseMessage(data)) {
          setRemotePose(data)
          return
        }
        // ignore unknown messages (forward-compatible)
      })
    }

    peer.on('open', (id) => {
      setPeerId(id)
      setStatus(mode === 'host' ? 'Sala lista (esperando)…' : 'Peer listo…')

      if (mode === 'join') {
        const target = (joinId || '').trim()
        if (!target) {
          setStatus('Ingresa un código para unirte.')
          return
        }
        const conn = peer.connect(target, { reliable: false })
        attachConn(conn)
      }
    })

    peer.on('connection', (conn) => {
      if (mode !== 'host') return
      setStatus('Cliente conectando…')
      attachConn(conn)
    })

    peer.on('error', (err) => {
      const t = (err as { type?: unknown } | null)?.type
      setStatus(`Error PeerJS: ${String(typeof t === 'string' ? t : err)}`)
      setConnected(false)
    })

    return () => {
      cleanup()
    }
  }, [joinId, mode, setConnected, setPeerId, setRemotePose, setStatus])

  useFrame(() => {
    if (mode === 'off') return
    const conn = connRef.current
    if (!conn || !conn.open) return
    if (useGameStore.getState().gameState !== 'playing') return

    const now = performance.now()
    if (now - lastSentAt.current < sendEveryMs) return
    lastSentAt.current = now

    const pose = useGameStore.getState().playerPose
    const msg: NetMessage = {
      t: 'pose',
      x: pose.x,
      y: pose.y,
      z: pose.z,
      yaw: pose.yaw,
      pitch: pose.pitch,
      ts: Date.now()
    }
    try {
      conn.send(msg)
    } catch {
      // ignore burst errors; on 'error' handler will handle state.
    }
  })

  return null
}
