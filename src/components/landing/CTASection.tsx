import { ArrowRight } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { LinkButton } from '@/components/ui/Button'

export function CTASection() {
  return (
    <section className="bg-primary py-20 sm:py-24">
      <Container className="flex flex-col items-center gap-6 text-center">
        <h2 className="max-w-2xl text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          Antes de contratar uma ferramenta de IA, descubra se ela realmente resolve um problema da
          sua empresa.
        </h2>
        <p className="max-w-xl text-slate-300">
          Conte como sua empresa trabalha. Nós investigamos onde existem oportunidades.
        </p>
        <LinkButton href="/diagnostico" variant="primary" className="text-lg">
          Fazer meu diagnóstico
          <ArrowRight className="h-5 w-5" aria-hidden="true" />
        </LinkButton>
      </Container>
    </section>
  )
}
