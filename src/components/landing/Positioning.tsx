import { Container } from '@/components/ui/Container'

export function Positioning() {
  return (
    <section className="py-20 sm:py-24">
      <Container className="mx-auto flex max-w-2xl flex-col items-center gap-5 text-center">
        <h2 className="text-2xl font-semibold tracking-tight text-primary sm:text-3xl">
          Não vamos começar pela ferramenta.
        </h2>

        <div className="space-y-4 leading-relaxed text-muted">
          <p>IA não é a resposta para todos os problemas.</p>
          <p>
            Às vezes, o que sua empresa precisa é de uma automação simples.
            <br />
            Às vezes, uma integração.
            <br />
            Às vezes, uma mudança no processo.
          </p>
          <p>E às vezes, IA realmente faz sentido.</p>
          <p>O diagnóstico existe para descobrir qual desses cenários se aplica à sua empresa.</p>
        </div>

        <p className="max-w-md font-medium text-primary">
          Você não precisa entender de IA. Precisa entender onde sua empresa está perdendo tempo.
        </p>
      </Container>
    </section>
  )
}
