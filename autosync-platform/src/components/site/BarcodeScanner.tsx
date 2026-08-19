'use client'

import { useState, useRef, useEffect } from 'react'
import { Camera, X, Loader2, ScanLine } from 'lucide-react'
import { BrowserMultiFormatReader } from '@zxing/browser'

interface BarcodeScannerProps {
  onScan: (codigo: string) => void
  onClose: () => void
}

export default function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedDevice, setSelectedDevice] = useState<string | undefined>(undefined)
  const readerRef = useRef<BrowserMultiFormatReader | null>(null)
  const controlsRef = useRef<{ stop: () => void } | null>(null)

  // Inicializar y pedir permisos de cámara
  useEffect(() => {
    let mounted = true

    async function init() {
      try {
        // Pedir permisos primero (necesario para listar dispositivos con labels)
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        stream.getTracks().forEach(t => t.stop()) // liberar

        const devices = await BrowserMultiFormatReader.listVideoInputDevices()
        if (!mounted) return
        setDevices(devices)

        // Preferir cámara trasera
        const back = devices.find(d => /back|rear|environment|trasera/i.test(d.label)) || devices[devices.length - 1]
        setSelectedDevice(back?.deviceId)
        setLoading(false)
      } catch (err) {
        console.error('Error accediendo a cámara:', err)
        setError('No se pudo acceder a la cámara. Verificá los permisos del navegador.')
        setLoading(false)
      }
    }

    init()

    return () => {
      mounted = false
      if (controlsRef.current) {
        controlsRef.current.stop()
        controlsRef.current = null
      }
    }
  }, [])

  // Iniciar scaneo cuando se selecciona un dispositivo
  useEffect(() => {
    if (!selectedDevice || !videoRef.current || loading || error) return

    const reader = new BrowserMultiFormatReader()
    readerRef.current = reader

    reader
      .decodeFromVideoDevice(selectedDevice, videoRef.current, (result, err) => {
        if (result) {
          const text = result.getText()
          console.log('[scanner] Código detectado:', text)
          // Vibración si está disponible
          if (navigator.vibrate) navigator.vibrate(200)
          onScan(text)
        }
      })
      .then(controls => {
        controlsRef.current = controls
      })
      .catch(err => {
        console.error('[scanner] Error al iniciar:', err)
        setError('Error al iniciar la cámara: ' + (err?.message || 'desconocido'))
      })

    return () => {
      if (controlsRef.current) {
        controlsRef.current.stop()
        controlsRef.current = null
      }
    }
  }, [selectedDevice, loading, error, onScan])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="w-full max-w-md rounded-xl bg-card p-4 shadow-2xl">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="flex items-center gap-2 font-semibold">
            <ScanLine className="h-5 w-5 text-primary" />
            Escanear código
          </h3>
          <button onClick={onClose} className="rounded p-1 hover:bg-muted">
            <X className="h-5 w-5" />
          </button>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-2 text-sm text-muted-foreground">Iniciando cámara...</p>
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">
            {error}
            <button
              onClick={onClose}
              className="mt-2 block rounded bg-red-600 px-3 py-1 text-xs font-semibold text-white"
            >
              Cerrar
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="relative overflow-hidden rounded-lg border-2 border-primary/40 bg-black">
              <video
                ref={videoRef}
                className="h-64 w-full object-cover"
                playsInline
                muted
              />
              {/* Marco de guía */}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="h-32 w-3/4 rounded-lg border-2 border-white/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.4)]" />
              </div>
              {/* Línea animada */}
              <div className="pointer-events-none absolute inset-x-8 top-1/2 h-0.5 animate-pulse bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
            </div>

            {devices.length > 1 && (
              <div className="mt-3">
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  Cámara:
                </label>
                <select
                  value={selectedDevice}
                  onChange={e => setSelectedDevice(e.target.value)}
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm"
                >
                  {devices.map(d => (
                    <option key={d.deviceId} value={d.deviceId}>
                      {d.label || `Cámara ${d.deviceId.slice(0, 8)}`}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <p className="mt-3 text-center text-xs text-muted-foreground">
              Enfocá el código de barras dentro del marco
            </p>
          </>
        )}
      </div>
    </div>
  )
}
