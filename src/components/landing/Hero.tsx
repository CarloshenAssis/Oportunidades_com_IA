import { ArrowRight, ShieldCheck, Zap } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { LinkButton } from '@/components/ui/Button'

export function Hero() {
  return (
    <section className="border-b border-border bg-surface">
      <Container className="flex flex-col items-center gap-8 py-20 text-center sm:py-28">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-1.5 text-sm font-medium text-muted">
          <ShieldCheck className="h-4 w-4 text-accent" aria-hidden="true" />
          Diagnóstico consultivo, não uma ferramenta genérica de IA
        </div>

        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-primary sm:text-5xl sm:leading-[1.1]">
          Descubra onde sua empresa pode usar IA
        </h1>

        <p className="max-w-2xl text-lg leading-relaxed text-muted sm:text-xl">
          Identifique tarefas repetitivas, processos manuais e oportunidades de automação em poucos
          minutos.
        </p>

        <div className="flex flex-col items-center gap-3 sm:flex-row">
          <LinkButton href="/diagnostico?mode=quick" variant="outline" className="text-lg">
            <Zap className="h-5 w-5" aria-hidden="true" />
            Diagnóstico rápido
          </LinkButton>

          <LinkButton href="/diagnostico?mode=complete" variant="primary" className="text-lg">
            Fazer meu diagnóstico
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </LinkButton>
        </div>

        <p className="text-sm text-muted">Leva de 8 a 15 minutos. Sem cadastro.</p>
      </Container>
    </section>
  )
}
