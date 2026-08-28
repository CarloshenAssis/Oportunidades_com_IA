import type { Opportunity } from '@/lib/ai/schema'
import { CONFIDENCE_LABELS, PRIORITY_BADGE_CLASSES, PRIORITY_LABELS, SOLUTION_TYPE_LABELS } from './labels'

function Section({ title, children }: { title: string; children: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">{title}</p>
      <p className="mt-1 leading-relaxed text-primary">{children}</p>
    </div>
  )
}

export function OpportunityCard({ opportunity, index }: { opportunity: Opportunity; index: number }) {
  return (
    <article className="rounded-2xl border border-border bg-white p-6 sm:p-8">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <span className="text-sm font-semibold text-accent">{String(index + 1).padStart(2, '0')}</span>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">{opportunity.process}</p>
          <h3 className="mt-1 text-lg font-semibold text-primary">{opportunity.title}</h3>
        </div>
        <span
          className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${PRIORITY_BADGE_CLASSES[opportunity.priority]}`}
        >
          Prioridade {PRIORITY_LABELS[opportunity.priority]}
        </span>
      </div>

      <div className="flex flex-col gap-4">
        <Section title="Problema">{opportunity.problem}</Section>
        <Section title="Evidência">{opportunity.evidence}</Section>
        <Section title="Como a IA pode ajudar">{opportunity.solution}</Section>
        <Section title="Por que essa recomendação">{opportunity.justification}</Section>
      </div>

      <dl className="mt-6 grid grid-cols-3 gap-4 border-t border-border pt-4 text-sm">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Tipo</dt>
          <dd className="mt-1 font-medium text-primary">{SOLUTION_TYPE_LABELS[opportunity.solutionType]}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Prioridade</dt>
          <dd className="mt-1 font-medium text-primary">{PRIORITY_LABELS[opportunity.priority]}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Confiança</dt>
          <dd className="mt-1 font-medium text-primary">{CONFIDENCE_LABELS[opportunity.confidence]}</dd>
        </div>
      </dl>
    </article>
  )
}
