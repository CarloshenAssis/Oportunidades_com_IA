import { Section, SectionHeading } from '@/components/ui/Section'

/** Prova de método: os pontos concretos observados nas respostas, sem depoimentos ou números. */
const SCOPE = [
  { title: 'Processos', description: 'Como o trabalho é realizado atualmente.' },
  {
    title: 'Retrabalho',
    description: 'Onde informações precisam ser conferidas, refeitas ou transferidas manualmente.',
  },
  { title: 'Tarefas repetitivas', description: 'Atividades que consomem tempo e seguem padrões.' },
  { title: 'Gargalos', description: 'Pontos onde o processo costuma parar ou depender de intervenção.' },
  {
    title: 'Oportunidades',
    description: 'Onde uma automação, integração, melhoria de processo ou IA pode fazer sentido.',
  },
]

export function AnalysisScope() {
  return (
    <Section>
      <SectionHeading
        eyebrow="Escopo da análise"
        title="O que procuramos durante a análise"
        description="Estes são os pontos observados nas suas respostas — a mesma base usada em qualquer diagnóstico, rápido ou completo."
      />

      <div className="mt-14 grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-5">
        {SCOPE.map((item) => (
          <div key={item.title} className="bg-white p-6">
            <h3 className="text-base font-semibold text-primary">{item.title}</h3>
            <p className="mt-2 leading-relaxed text-muted">{item.description}</p>
          </div>
        ))}
      </div>
    </Section>
  )
}
