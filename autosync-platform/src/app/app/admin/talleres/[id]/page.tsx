'use client'
import { useState, useEffect, use } from 'react'
import { Loader2, ArrowLeft, Save, Wrench, Mail, Phone, MapPin, Car, FileText, Calendar, Check, Edit } from 'lucide-react'
import Link from 'next/link'

export default function TallerDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [taller, setTaller] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<any>({})

  useEffect(() => {
    fetch(`/api/admin/talleres/${id}`, { credentials: 'include' }).then(r => r.json()).then(d => {
      setTaller(d.taller); setForm(d.taller || {}); setLoading(false)
    })
  }, [id])

  const guardar = async () => {
    setSaving(true)
    await fetch(`/api/admin/talleres/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    setSaving(false); setEditing(false)
    fetch(`/api/admin/talleres/${id}`, { credentials: 'include' }).then(r => r.json()).then(d => setTaller(d.taller))
  }

  if (loading) return <Loader2 className="h-8 w-8 animate-spin text-primary" />
  if (!taller) return <p>No encontrado</p>

  return (
    <div className="space-y-6">
      <Link href="/app/admin/talleres" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" />Volver</Link>
      
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10 text-primary text-xl font-bold">{taller.nombre?.charAt(0)}</div>
            <div>
              <h1 className="text-xl font-bold">{taller.nombre}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${taller.plan === 'PREMIUM' ? 'bg-amber-100 text-amber-700' : 'bg-zinc-100 text-zinc-600'}`}>{taller.plan}</span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${taller.estado === 'ACTIVO' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{taller.estado}</span>
                {taller.verificado && <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700">Verificado</span>}
              </div>
            </div>
          </div>
          <button onClick={() => setEditing(!editing)} className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-muted"><Edit className="mr-1 inline h-3 w-3" />{editing ? 'Cancelar' : 'Editar'}</button>
        </div>

        {!editing ? (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Info label="Email" value={taller.email || '—'} icon={Mail} />
            <Info label="Teléfono" value={taller.telefono || '—'} icon={Phone} />
            <Info label="WhatsApp" value={taller.whatsapp || '—'} icon={Phone} />
            <Info label="Ciudad" value={taller.ciudad || '—'} icon={MapPin} />
            <Info label="Provincia" value={taller.provincia || '—'} icon={MapPin} />
            <Info label="Ofrece turnos" value={taller.ofreceTurnos ? 'Sí' : 'No'} icon={Calendar} />
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Field label="Nombre"><input value={form.nombre || ''} onChange={e => setForm({...form, nombre: e.target.value})} className="w-full rounded-lg border border-border px-3 py-2 text-sm" /></Field>
            <Field label="Email"><input value={form.email || ''} onChange={e => setForm({...form, email: e.target.value})} className="w-full rounded-lg border border-border px-3 py-2 text-sm" /></Field>
            <Field label="Teléfono"><input value={form.telefono || ''} onChange={e => setForm({...form, telefono: e.target.value})} className="w-full rounded-lg border border-border px-3 py-2 text-sm" /></Field>
            <Field label="WhatsApp"><input value={form.whatsapp || ''} onChange={e => setForm({...form, whatsapp: e.target.value})} className="w-full rounded-lg border border-border px-3 py-2 text-sm" /></Field>
            <Field label="Ciudad"><input value={form.ciudad || ''} onChange={e => setForm({...form, ciudad: e.target.value})} className="w-full rounded-lg border border-border px-3 py-2 text-sm" /></Field>
            <Field label="Plan"><select value={form.plan || 'GRATIS'} onChange={e => setForm({...form, plan: e.target.value})} className="w-full rounded-lg border border-border px-3 py-2 text-sm"><option value="GRATIS">Gratis</option><option value="PREMIUM">Premium</option></select></Field>
            <Field label="Estado"><select value={form.estado || 'ACTIVO'} onChange={e => setForm({...form, estado: e.target.value})} className="w-full rounded-lg border border-border px-3 py-2 text-sm"><option value="ACTIVO">Activo</option><option value="SUSPENDIDO">Suspendido</option><option value="PENDIENTE">Pendiente</option></select></Field>
            <Field label="Verificado"><select value={form.verificado ? 'true' : 'false'} onChange={e => setForm({...form, verificado: e.target.value === 'true'})} className="w-full rounded-lg border border-border px-3 py-2 text-sm"><option value="false">No</option><option value="true">Sí</option></select></Field>
            <Field label="Ofrece turnos"><select value={form.ofreceTurnos ? 'true' : 'false'} onChange={e => setForm({...form, ofreceTurnos: e.target.value === 'true'})} className="w-full rounded-lg border border-border px-3 py-2 text-sm"><option value="false">No</option><option value="true">Sí</option></select></Field>
          </div>
        )}
        {editing && <button onClick={guardar} disabled={saving} className="mt-3 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Guardar'}</button>}
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat icon={Car} label="Trabajos" value={taller._count?.trabajos || 0} />
        <Stat icon={Wrench} label="Servicios" value={taller._count?.servicios || 0} />
        <Stat icon={Calendar} label="Turnos" value={taller._count?.turnos || 0} />
        <Stat icon={FileText} label="Productos" value={taller._count?.productos || 0} />
      </div>

      {/* Datos de la cuenta */}
      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="mb-3 text-sm font-semibold">Cuenta de usuario</h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div><span className="text-muted-foreground">Nombre:</span> {taller.user?.nombre}</div>
          <div><span className="text-muted-foreground">Email:</span> {taller.user?.email}</div>
          <div><span className="text-muted-foreground">Teléfono:</span> {taller.user?.telefono || '—'}</div>
          <div><span className="text-muted-foreground">Registrado:</span> {new Date(taller.user?.creadoEn).toLocaleDateString('es-AR')}</div>
        </div>
      </div>
    </div>
  )
}

function Info({ label, value, icon: Icon }: any) {
  return <div className="rounded-lg border border-border/40 p-2"><div className="flex items-center gap-1 text-[10px] uppercase text-muted-foreground"><Icon className="h-3 w-3" />{label}</div><p className="text-sm font-medium">{value}</p></div>
}
function Field({ label, children }: any) {
  return <div><label className="text-xs font-medium">{label}</label>{children}</div>
}
function Stat({ icon: Icon, label, value }: any) {
  return <div className="rounded-xl border border-border bg-card p-3"><div className="mb-1 flex h-7 w-7 items-center justify-center rounded bg-primary/10 text-primary"><Icon className="h-3.5 w-3.5" /></div><p className="text-xl font-bold">{value}</p><p className="text-xs text-muted-foreground">{label}</p></div>
}
