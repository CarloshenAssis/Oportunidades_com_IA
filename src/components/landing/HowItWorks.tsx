import { Section, SectionHeading } from '@/components/ui/Section'

const STEPS = [
  {
    number: '01',
    title: 'Você responde',
    description: 'Perguntas sobre processos, tarefas, ferramentas e dificuldades do dia a dia.',
  },
  {
    number: '02',
    title: 'Nós analisamos',
    description: 'As respostas são lidas e analisadas individualmente, não por um sistema automático.',
  },
  {
    number: '03',
    title: 'Identificamos oportunidades',
    description: 'Os pontos encontrados são organizados por relevância para a realidade da empresa.',
  },
  {
    number: '04',
    title: 'Entramos em contato',
    description: 'Apresentamos o que foi identificado e conversamos sobre os caminhos possíveis.',
  },
]

export function HowItWorks() {
  return (
    <Section id="como-funciona">
      <SectionHeading
        eyebrow="Como funciona"
        title="Quatro etapas, do preenchimento à conversa"
        description="Suas respostas são analisadas individualmente para identificar problemas e oportunidades relevantes para a realidade da sua empresa."
      />

      <ol className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
        {STEPS.map((step) => (
          <li key={step.number} className="border-t-2 border-border pt-6 transition-colors hover:border-accent">
            <span className="font-mono text-xs font-medium tracking-[0.18em] text-accent">{step.number}</span>
            <h3 className="mt-3 text-base font-semibold text-primary">{step.title}</h3>
            <p className="mt-2 leading-relaxed text-muted">{step.description}</p>
          </li>
        ))}
      </ol>

      <p className="mt-12 max-w-2xl border-l-2 border-border pl-5 leading-relaxed text-muted">
        O diagnóstico não gera automaticamente uma solução fechada. Ele reúne as informações
        necessárias para que a análise seja feita depois, com atenção ao contexto da sua empresa.
      </p>
    </Section>
  )
}
