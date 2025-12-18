export type NetMode = 'off' | 'host' | 'join'

export type PoseMessage = {
  t: 'pose'
  x: number
  y: number
  z: number
  yaw: number
  pitch: number
  ts: number
}

export type NetMessage = PoseMessage

