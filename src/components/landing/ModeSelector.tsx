import { ArrowRight, CheckCircle2, Gauge, Layers } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { LinkButton } from '@/components/ui/Button'

type Mode = {
  href: string
  icon: typeof Gauge
  eyebrow: string
  title: string
  description: string
  bullets: string[]
  cta: string
  badge?: string
}

const MODES: Mode[] = [
  {
    href: '/diagnostico?mode=quick',
    icon: Gauge,
    eyebrow: 'Diagnóstico rápido',
    title: 'Quero uma visão rápida',
    description: 'Responda algumas perguntas essenciais sobre sua empresa e seus processos.',
    bullets: [
      'Menos perguntas',
      'Mais rápido de preencher',
      'Identifica os principais pontos de atenção',
      'Ideal para uma primeira análise',
    ],
    cta: 'Começar diagnóstico rápido',
  },
  {
    href: '/diagnostico?mode=complete',
    icon: Layers,
    eyebrow: 'Diagnóstico completo',
    title: 'Quero uma análise mais profunda',
    description: 'Explore um processo da sua empresa com mais detalhes para identificar oportunidades específicas.',
    bullets: [
      'Mais perguntas',
      'Análise aprofundada',
      'Permite investigar até 3 áreas',
      'Melhor para identificar oportunidades concretas de melhoria',
    ],
    cta: 'Começar diagnóstico completo',
    badge: 'Recomendado para uma análise mais detalhada',
  },
]

export function ModeSelector() {
  return (
    <section className="border-y border-border bg-surface py-20 sm:py-24">
      <Container>
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-primary sm:text-3xl">Como você quer começar?</h2>
        </div>

        <div className="grid gap-8 sm:grid-cols-2">
          {MODES.map(({ href, icon: Icon, eyebrow, title, description, bullets, cta, badge }) => (
            <div
              key={href}
              className="flex flex-col rounded-2xl border border-border bg-white p-8 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
                <Icon className="h-6 w-6 text-accent" aria-hidden="true" />
              </div>

              <span className="mb-2 text-xs font-semibold uppercase tracking-wide text-accent">{eyebrow}</span>
              <h3 className="mb-2 text-xl font-semibold text-primary">{title}</h3>
              <p className="mb-6 leading-relaxed text-muted">{description}</p>

              <ul className="mb-8 flex flex-1 flex-col gap-2.5">
                {bullets.map((bullet) => (
                  <li key={bullet} className="flex items-start gap-2.5 text-sm text-primary">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                    {bullet}
                  </li>
                ))}
              </ul>

              <LinkButton href={href} variant="primary" className="w-full justify-center">
                {cta}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </LinkButton>

              <p className={`mt-3 text-center text-xs text-muted ${badge ? '' : 'invisible'}`}>{badge ?? 'placeholder'}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}
