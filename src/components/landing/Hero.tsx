import { ArrowRight, Zap } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { LinkButton } from '@/components/ui/Button'

export function Hero() {
  return (
    <section className="border-b border-border bg-surface">
      <Container className="flex flex-col items-center gap-8 py-20 text-center sm:py-28">
        <p className="max-w-md text-sm font-medium leading-relaxed text-muted sm:text-base">
          IA não começa com uma ferramenta.
          <br />
          Começa descobrindo onde sua empresa perde tempo.
        </p>

        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-primary sm:text-5xl sm:leading-[1.1]">
          Sua empresa provavelmente tem tarefas que poderiam ser automatizadas.
          <br className="hidden sm:block" /> Você sabe quais são?
        </h1>

        <p className="max-w-2xl text-lg leading-relaxed text-muted sm:text-xl">
          Responda ao diagnóstico e descubra onde existem oportunidades reais para usar IA e
          automação nos seus processos — sem precisar entender de tecnologia.
        </p>

        <div className="flex flex-col items-center gap-3 sm:flex-row">
          <LinkButton href="/diagnostico?mode=quick" variant="outline" className="text-lg">
            <Zap className="h-5 w-5" aria-hidden="true" />
            Diagnóstico rápido
          </LinkButton>

          <LinkButton href="/diagnostico?mode=complete" variant="primary" className="text-lg">
            Descobrir onde posso aplicar IA
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </LinkButton>
        </div>

        <p className="text-sm text-muted">Gratuito • Sem cadastro • Análise individual</p>
      </Container>
    </section>
  )
}
