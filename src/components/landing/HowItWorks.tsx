import { Container } from '@/components/ui/Container'

const STEPS = [
  {
    number: '01',
    title: 'Responda o diagnóstico',
    description: 'Cinco etapas rápidas sobre a operação, os problemas e as ferramentas da sua empresa.',
  },
  {
    number: '02',
    title: 'Receba a análise',
    description: 'A IA cruza suas respostas e aponta gargalos e oportunidades reais, com evidências.',
  },
  {
    number: '03',
    title: 'Fale com um especialista',
    description: 'Use o relatório como ponto de partida para uma conversa sobre implementação.',
  },
]

export function HowItWorks() {
  return (
    <section className="border-y border-border bg-surface py-20 sm:py-24">
      <Container>
        <h2 className="mb-12 text-center text-2xl font-semibold tracking-tight text-primary sm:text-3xl">
          Como funciona
        </h2>
        <div className="grid gap-10 sm:grid-cols-3">
          {STEPS.map((step) => (
            <div key={step.number}>
              <span className="text-sm font-semibold text-accent">{step.number}</span>
              <h3 className="mt-2 mb-2 text-lg font-semibold text-primary">{step.title}</h3>
              <p className="leading-relaxed text-muted">{step.description}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}
