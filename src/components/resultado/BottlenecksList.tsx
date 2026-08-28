import { AlertTriangle } from 'lucide-react'
import type { DiagnosticResult } from '@/lib/ai/schema'

export function BottlenecksList({ bottlenecks }: { bottlenecks: DiagnosticResult['mainBottlenecks'] }) {
  return (
    <div>
      <h2 className="mb-4 text-xl font-semibold tracking-tight text-primary">Principais gargalos</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {bottlenecks.map((bottleneck) => (
          <div key={bottleneck.title} className="rounded-xl border border-border bg-white p-5">
            <div className="mb-2 flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" aria-hidden="true" />
              <h3 className="font-semibold text-primary">{bottleneck.title}</h3>
            </div>
            <p className="text-sm leading-relaxed text-muted">{bottleneck.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
