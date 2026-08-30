import { ArrowRight } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { LinkButton } from '@/components/ui/Button'

export function CTASection() {
  return (
    <section className="border-t border-border py-20 sm:py-28">
      <Container className="flex flex-col items-center gap-6 text-center">
        <h2 className="max-w-2xl text-2xl font-semibold tracking-tight text-primary sm:text-3xl sm:leading-tight">
          Descubra onde sua empresa pode começar.
        </h2>

        <p className="max-w-xl leading-relaxed text-muted">
          Você não precisa implementar IA em tudo. Primeiro, descubra onde existe uma oportunidade
          real.
        </p>

        <LinkButton href="/diagnostico" variant="primary" size="lg" className="mt-2">
          Fazer meu diagnóstico
          <ArrowRight className="h-5 w-5" aria-hidden="true" />
        </LinkButton>

        <p className="text-sm text-muted">Gratuito • Sem compromisso</p>
      </Container>
    </section>
  )
}
