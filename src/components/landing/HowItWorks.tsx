import { Container } from '@/components/ui/Container'

const STEPS = [
  {
    number: '01',
    title: 'Responda ao diagnóstico',
    description: 'Uma entrevista guiada sobre as áreas, processos e tarefas da sua empresa.',
  },
  {
    number: '02',
    title: 'Um especialista analisa',
    description: 'Suas respostas são analisadas individualmente para identificar oportunidades reais.',
  },
  {
    number: '03',
    title: 'Fale com um especialista',
    description: 'Entraremos em contato para conversar sobre as oportunidades identificadas.',
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
