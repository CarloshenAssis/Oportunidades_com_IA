import { Section, SectionHeading } from '@/components/ui/Section'

/** A ordem importa: tecnologia é o último item, avaliado só depois de entender o processo. */
const SCOPE = [
  { index: '01', title: 'Processos', description: 'Como o trabalho é realizado hoje.' },
  { index: '02', title: 'Tempo', description: 'Onde existem tarefas demoradas ou repetitivas.' },
  { index: '03', title: 'Gargalos', description: 'Onde o processo costuma parar ou gerar retrabalho.' },
  { index: '04', title: 'Sistemas', description: 'Onde existem informações ou ferramentas desconectadas.' },
  { index: '05', title: 'Pessoas', description: 'Onde existe dependência de conhecimento individual.' },
  {
    index: '06',
    title: 'Tecnologia',
    description: 'Onde IA, automação ou integração podem realmente ajudar.',
    last: true,
  },
]

export function AnalysisScope() {
  return (
    <Section surface>
      <SectionHeading
        eyebrow="Escopo da análise"
        title="Como identificamos oportunidades"
        description="Seis pontos são observados nas suas respostas, sempre nesta ordem — a tecnologia entra por último, depois que o processo está entendido."
      />

      <div className="mt-14 grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
        {SCOPE.map((item) => (
          <div key={item.index} className="bg-white p-8">
            <span
              className={`font-mono text-xs font-medium tracking-[0.18em] ${
                item.last ? 'text-accent' : 'text-muted'
              }`}
            >
              {item.index}
            </span>
            <h3 className="mt-4 text-base font-semibold text-primary">{item.title}</h3>
            <p className="mt-2 leading-relaxed text-muted">{item.description}</p>
          </div>
        ))}
      </div>
    </Section>
  )
}
