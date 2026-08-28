'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, Circle, Loader2 } from 'lucide-react'

const STAGES = [
  'Organizando informações',
  'Identificando processos',
  'Analisando oportunidades',
  'Priorizando recomendações',
]

const STAGE_DELAYS_MS = [900, 1800, 2800]

export function LoadingAnalysis() {
  const [activeStage, setActiveStage] = useState(0)

  useEffect(() => {
    const timers = STAGE_DELAYS_MS.map((delay, index) =>
      setTimeout(() => setActiveStage(index + 1), delay),
    )
    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <div
      className="flex flex-col items-center gap-8 py-16 text-center"
      role="status"
      aria-live="polite"
    >
      <Loader2 className="h-10 w-10 animate-spin text-accent" aria-hidden="true" />
      <div>
        <h2 className="text-xl font-semibold text-primary">Analisando os processos da sua empresa...</h2>
        <p className="mt-2 text-muted">Isso leva apenas alguns instantes.</p>
      </div>
      <ul className="flex w-full max-w-sm flex-col gap-3 text-left">
        {STAGES.map((stage, index) => {
          const isDone = index < activeStage
          const isCurrent = index === activeStage
          return (
            <li key={stage} className="flex items-center gap-3 text-sm">
              {isDone ? (
                <CheckCircle2 className="h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
              ) : isCurrent ? (
                <Loader2 className="h-5 w-5 shrink-0 animate-spin text-accent" aria-hidden="true" />
              ) : (
                <Circle className="h-5 w-5 shrink-0 text-border" aria-hidden="true" />
              )}
              <span className={isDone || isCurrent ? 'text-primary' : 'text-muted'}>{stage}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
