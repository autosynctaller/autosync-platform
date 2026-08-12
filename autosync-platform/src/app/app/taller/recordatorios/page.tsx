'use client'
import { RecordatoriosWidget } from '@/components/site/TallerWidgets'
import { Bell } from 'lucide-react'

export default function RecordatoriosPage() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Recordatorios</h1><p className="text-sm text-muted-foreground">Trabajos, VTV y GNC por vencer o vencidos.</p></div>
      <div className="rounded-xl border border-border bg-card p-4">
        <RecordatoriosWidget />
      </div>
    </div>
  )
}
