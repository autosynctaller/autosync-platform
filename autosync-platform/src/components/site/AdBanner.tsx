'use client'

import { useState, useEffect } from 'react'
import { ExternalLink } from 'lucide-react'

interface Anuncio {
  id: string
  titulo: string
  descripcion: string | null
  imagen: string | null
  url: string
  cta: string | null
  anunciante: { nombre: string; logo: string | null; web: string | null }
}

export function AdBanner({ tipo, ciudad, marca }: { tipo: string; ciudad?: string; marca?: string }) {
  const [anuncios, setAnuncios] = useState<Anuncio[]>([])

  useEffect(() => {
    const params = new URLSearchParams({ tipo })
    if (ciudad) params.set('ciudad', ciudad)
    if (marca) params.set('marca', marca)
    fetch(`/api/anuncios?${params}`)
      .then(r => r.json())
      .then(data => setAnuncios(data.anuncios || []))
      .catch(() => {})
  }, [tipo, ciudad, marca])

  if (anuncios.length === 0) return null

  const anuncio = anuncios[0] // mostrar el primero (ya priorizado)

  const handleClick = () => {
    fetch('/api/anuncios/click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ anuncioId: anuncio.id }),
    }).catch(() => {})
  }

  return (
    <a
      href={anuncio.url}
      target="_blank"
      rel="noopener noreferrer sponsored"
      onClick={handleClick}
      className="block rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-4 transition-all hover:shadow-md"
    >
      <div className="flex items-center gap-3">
        {anuncio.imagen ? (
          <img src={anuncio.imagen} alt={anuncio.titulo} className="h-12 w-12 rounded-lg object-cover" />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-500 text-lg font-bold text-white">
            {anuncio.anunciante.nombre.charAt(0)}
          </div>
        )}
        <div className="flex-1">
          <div className="flex items-center gap-1">
            <p className="font-semibold text-sm text-zinc-800">{anuncio.titulo}</p>
            <span className="rounded bg-amber-200 px-1.5 py-0.5 text-[9px] font-bold uppercase text-amber-700">Publicidad</span>
          </div>
          {anuncio.descripcion && <p className="text-xs text-zinc-600">{anuncio.descripcion}</p>}
        </div>
        {anuncio.cta && (
          <span className="flex items-center gap-1 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white">
            {anuncio.cta} <ExternalLink className="h-3 w-3" />
          </span>
        )}
      </div>
    </a>
  )
}

// Componente para el directorio: taller/autoparte patrocinada
export function SponsoredListing({ ciudad }: { ciudad?: string }) {
  const [anuncios, setAnuncios] = useState<Anuncio[]>([])

  useEffect(() => {
    const params = new URLSearchParams({ tipo: 'SPONSORED_LISTING' })
    if (ciudad) params.set('ciudad', ciudad)
    fetch(`/api/anuncios?${params}`)
      .then(r => r.json())
      .then(data => setAnuncios(data.anuncios || []))
      .catch(() => {})
  }, [ciudad])

  if (anuncios.length === 0) return null

  return (
    <div className="space-y-2">
      {anuncios.map(a => (
        <a
          key={a.id}
          href={a.url}
          target="_blank"
          rel="noopener noreferrer sponsored"
          onClick={() => fetch('/api/anuncios/click', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ anuncioId: a.id }) }).catch(() => {})}
          className="block rounded-xl border-2 border-amber-300 bg-amber-50 p-4 transition-colors hover:bg-amber-100"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500 text-white">
              {a.anunciante.nombre.charAt(0)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-sm">{a.titulo}</p>
                <span className="rounded bg-amber-200 px-1.5 py-0.5 text-[9px] font-bold uppercase text-amber-700">Sponsor</span>
              </div>
              {a.descripcion && <p className="text-xs text-zinc-600">{a.descripcion}</p>}
            </div>
          </div>
        </a>
      ))}
    </div>
  )
}
