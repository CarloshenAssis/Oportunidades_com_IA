import { ArrowRight } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { LinkButton } from '@/components/ui/Button'
import { Eyebrow } from '@/components/ui/Section'

/** Etapas reais do serviço — o processo é analisado antes de qualquer decisão de tecnologia. */
const FLOW_STAGES = [
  { index: '01', label: 'Processo', description: 'Como o trabalho acontece hoje' },
  { index: '02', label: 'Análise', description: 'Onde o tempo é consumido' },
  { index: '03', label: 'Oportunidade', description: 'O que pode ser melhorado' },
  { index: '04', label: 'Solução', description: 'Qual tecnologia faz sentido' },
]

function DiagnosticFlow() {
  return (
    <div className="rounded-xl border border-border bg-white p-6 shadow-sm sm:p-8">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <Eyebrow>Fluxo do diagnóstico</Eyebrow>
        <span className="font-mono text-xs text-muted">4 etapas</span>
      </div>

      <ol className="mt-2">
        {FLOW_STAGES.map((stage, index) => {
          const isLast = index === FLOW_STAGES.length - 1
          return (
            <li key={stage.index} className="relative flex gap-4 pt-6">
              <div className="flex flex-col items-center">
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md border font-mono text-xs font-medium ${
                    isLast ? 'border-accent bg-accent text-accent-foreground' : 'border-border bg-surface text-muted'
                  }`}
                >
                  {stage.index}
                </span>
                {!isLast ? <span className="mt-2 w-px flex-1 bg-border" aria-hidden="true" /> : null}
              </div>

              <div className={isLast ? '' : 'pb-1'}>
                <p className="text-sm font-semibold text-primary">{stage.label}</p>
                <p className="mt-0.5 text-sm leading-relaxed text-muted">{stage.description}</p>
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

export function Hero() {
  return (
    <section className="border-b border-border bg-surface">
      <Container className="grid items-center gap-12 py-20 sm:py-24 lg:grid-cols-12 lg:gap-16 lg:py-28">
        <div className="lg:col-span-7">
          <Eyebrow>Diagnóstico de processos</Eyebrow>

          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-primary sm:text-5xl sm:leading-[1.08]">
            Você sabe onde sua empresa está perdendo tempo — e onde a tecnologia poderia ajudar?
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
            Responda algumas perguntas sobre como sua empresa trabalha hoje. A partir das suas
            respostas, identificamos processos, gargalos e oportunidades onde IA, automação ou outras
            tecnologias podem fazer sentido — sem precisar entender de tecnologia.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <LinkButton href="/diagnostico" variant="primary" size="lg">
              Fazer meu diagnóstico
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </LinkButton>

            <LinkButton href="#como-funciona" variant="outline" size="lg">
              Como funciona
            </LinkButton>
          </div>

          <p className="mt-6 text-sm text-muted">Gratuito • Sem compromisso • Análise individual</p>
        </div>

        <div className="lg:col-span-5">
          <DiagnosticFlow />
        </div>
      </Container>
    </section>
  )
}
