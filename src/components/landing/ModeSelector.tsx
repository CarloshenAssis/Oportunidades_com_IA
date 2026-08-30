import { ArrowRight } from 'lucide-react'
import { Section, SectionHeading } from '@/components/ui/Section'
import { LinkButton } from '@/components/ui/Button'

type Mode = {
  href: string
  eyebrow: string
  title: string
  description: string
  /** Escopo real de cada modo — corresponde ao que o formulário efetivamente pergunta. */
  scope: string
  depth: string
  cta: string
  recommended?: boolean
}

const MODES: Mode[] = [
  {
    href: '/diagnostico?mode=quick',
    eyebrow: 'Diagnóstico rápido',
    title: 'Uma primeira leitura da operação',
    description:
      'Uma avaliação inicial para identificar rapidamente onde pode existir uma oportunidade.',
    scope: 'Uma área da empresa',
    depth: 'Perguntas essenciais',
    cta: 'Descobrir onde começar',
  },
  {
    href: '/diagnostico?mode=complete',
    eyebrow: 'Diagnóstico completo',
    title: 'Uma investigação dos processos',
    description:
      'Uma investigação mais detalhada dos processos, gargalos e oportunidades da empresa.',
    scope: 'Até três áreas da empresa',
    depth: 'Entrevista aprofundada',
    cta: 'Investigar minha empresa',
    recommended: true,
  },
]

export function ModeSelector() {
  return (
    <Section id="comecar">
      <SectionHeading
        eyebrow="Dois caminhos"
        title="Como você quer começar?"
        description="Os dois seguem a mesma lógica de análise. A diferença está em quanto do processo você quer detalhar agora."
        align="center"
      />

      <div className="mt-14 grid gap-6 lg:grid-cols-2 lg:gap-8">
        {MODES.map((mode) => (
          <div
            key={mode.href}
            className="flex flex-col rounded-xl border border-border bg-white p-8 transition-colors hover:border-slate-300 sm:p-10"
          >
            <div className="flex items-center justify-between gap-4">
              <span className="font-mono text-xs font-medium uppercase tracking-[0.18em] text-accent">
                {mode.eyebrow}
              </span>
              {mode.recommended ? (
                <span className="rounded border border-border px-2 py-1 font-mono text-[0.625rem] uppercase tracking-[0.14em] text-muted">
                  Recomendado
                </span>
              ) : null}
            </div>

            <h3 className="mt-5 text-xl font-semibold tracking-tight text-primary">{mode.title}</h3>
            <p className="mt-3 leading-relaxed text-muted">{mode.description}</p>

            <dl className="mt-8 flex-1 space-y-3 border-t border-border pt-6 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Abrangência</dt>
                <dd className="text-right font-medium text-primary">{mode.scope}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Profundidade</dt>
                <dd className="text-right font-medium text-primary">{mode.depth}</dd>
              </div>
            </dl>

            <LinkButton
              href={mode.href}
              variant={mode.recommended ? 'primary' : 'outline'}
              className="mt-8 w-full"
            >
              {mode.cta}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </LinkButton>
          </div>
        ))}
      </div>
    </Section>
  )
}
