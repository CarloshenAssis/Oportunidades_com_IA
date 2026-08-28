import { Gauge } from 'lucide-react'
import type { DiagnosticResult } from '@/lib/ai/schema'

export function MaturityCard({ maturity }: { maturity: DiagnosticResult['maturity'] }) {
  return (
    <div className="rounded-2xl border border-border bg-white p-6">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted">
        <Gauge className="h-4 w-4 text-accent" aria-hidden="true" />
        Nível de maturidade em IA
      </div>
      <p className="mb-2 text-2xl font-semibold text-primary">Nível: {maturity.level}</p>
      <p className="leading-relaxed text-muted">{maturity.description}</p>
    </div>
  )
}
