import { Section, SectionHeading } from '@/components/ui/Section'

const STEPS = [
  {
    number: '01',
    title: 'Você responde',
    description: 'Conta como sua empresa trabalha hoje.',
  },
  {
    number: '02',
    title: 'Nós analisamos',
    description: 'As respostas são avaliadas para identificar processos, gargalos e oportunidades.',
  },
  {
    number: '03',
    title: 'Identificamos possibilidades',
    description: 'IA, automação, integração ou melhorias de processo — somente quando fizerem sentido.',
  },
  {
    number: '04',
    title: 'Entramos em contato',
    description: 'Se identificarmos uma oportunidade relevante, conversamos com você pelo WhatsApp.',
  },
]

export function HowItWorks() {
  return (
    <Section id="como-funciona" surface>
      <SectionHeading
        eyebrow="Depois do preenchimento"
        title="O que acontece depois?"
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
        O diagnóstico não gera automaticamente uma solução fechada. Nem todo diagnóstico resulta em
        uma oportunidade identificada — a análise é feita com atenção ao contexto real da sua
        empresa.
      </p>
    </Section>
  )
}
