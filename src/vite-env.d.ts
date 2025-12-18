/// <reference types="vite/client" />

declare module 'qrcode' {
  export type QRCodeToDataURLOptions = {
    width?: number
    margin?: number
    scale?: number
    color?: {
      dark?: string
      light?: string
    }
  }

  export function toDataURL(text: string, options?: QRCodeToDataURLOptions): Promise<string>
}

