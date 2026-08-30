import { Container } from '@/components/ui/Container'

const STEPS = [
  {
    number: '01',
    title: 'Você conta como sua empresa funciona',
    description: 'Responda perguntas sobre processos, tarefas, ferramentas e dificuldades do dia a dia.',
  },
  {
    number: '02',
    title: 'Suas respostas são analisadas',
    description: 'Analisamos as informações para identificar problemas, gargalos e possíveis oportunidades.',
  },
  {
    number: '03',
    title: 'Entramos em contato',
    description:
      'Depois da análise, entramos em contato para apresentar os pontos identificados e conversar sobre possíveis soluções.',
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
