'use client'

import { useEffect, useMemo, useSyncExternalStore } from 'react'
import { useRouter } from 'next/navigation'
import { Container } from '@/components/ui/Container'
import { LinkButton } from '@/components/ui/Button'
import { RESULT_STORAGE_KEY, type StoredDiagnosticResult } from '@/lib/storage'
import { ExecutiveSummary } from './ExecutiveSummary'
import { MaturityCard } from './MaturityCard'
import { BottlenecksList } from './BottlenecksList'
import { OpportunityCard } from './OpportunityCard'
import { ResultCTA } from './ResultCTA'

function subscribe() {
  return () => {}
}

function getSnapshot(): string | null {
  return sessionStorage.getItem(RESULT_STORAGE_KEY)
}

function getServerSnapshot(): string | null {
  return null
}

function parseStored(raw: string | null): StoredDiagnosticResult | null {
  if (!raw) return null
  try {
    return JSON.parse(raw) as StoredDiagnosticResult
  } catch {
    return null
  }
}

export function ResultView() {
  const router = useRouter()
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const stored = useMemo(() => parseStored(raw), [raw])

  useEffect(() => {
    if (stored === null) {
      router.replace('/diagnostico')
    }
  }, [stored, router])

  if (stored === null) {
    return (
      <Container className="max-w-3xl py-24 text-center text-muted" role="status" aria-live="polite">
        Carregando seu diagnóstico...
      </Container>
    )
  }

  const { result, whatsapp } = stored

  return (
    <Container className="max-w-3xl py-12 sm:py-16">
      <div className="mb-10 text-center">
        <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-accent">Diagnóstico concluído</p>
        <h1 className="text-3xl font-semibold tracking-tight text-primary sm:text-4xl">
          Seu Diagnóstico de Oportunidades com IA
        </h1>
      </div>

      <div className="flex flex-col gap-10">
        <ExecutiveSummary summary={result.executiveSummary} />
        <MaturityCard maturity={result.maturity} />
        <BottlenecksList bottlenecks={result.mainBottlenecks} />

        <div>
          <h2 className="mb-4 text-xl font-semibold tracking-tight text-primary">Oportunidades identificadas</h2>
          <div className="flex flex-col gap-6">
            {result.opportunities.map((opportunity, index) => (
              <OpportunityCard key={opportunity.title} opportunity={opportunity} index={index} />
            ))}
          </div>
        </div>

        <div>
          <h2 className="mb-4 text-xl font-semibold tracking-tight text-primary">Próximos passos</h2>
          <ul className="flex flex-col gap-2">
            {result.nextSteps.map((step) => (
              <li key={step} className="flex items-start gap-2 rounded-lg border border-border bg-white p-4 text-sm text-primary">
                {step}
              </li>
            ))}
          </ul>
        </div>

        <ResultCTA whatsapp={whatsapp} />

        <div className="text-center">
          <LinkButton href="/" variant="ghost" className="text-sm">
            Voltar para a página inicial
          </LinkButton>
        </div>
      </div>
    </Container>
  )
}
