import { Section, SectionHeading } from '@/components/ui/Section'

const SITUATIONS = [
  {
    title: 'Tarefas manuais repetitivas',
    description: 'Trabalho que se repete todos os dias e consome horas da equipe sem mudar de forma.',
  },
  {
    title: 'Retrabalho',
    description: 'Atividades que precisam ser refeitas por erro, informação incompleta ou falta de padrão.',
  },
  {
    title: 'Informações espalhadas',
    description: 'Dados que vivem em sistemas, planilhas e mensagens diferentes, e precisam ser reunidos à mão.',
  },
  {
    title: 'Dependência de uma pessoa',
    description: 'Processos que só andam quando uma pessoa específica está disponível.',
  },
]

export function ProblemSection() {
  return (
    <Section>
      <SectionHeading
        eyebrow="O ponto de partida"
        title="Antes de escolher uma tecnologia, é preciso entender o problema."
        description="Muitas empresas sabem que poderiam melhorar processos, mas não sabem exatamente onde começar."
      />

      <div className="mt-14 grid gap-x-12 gap-y-10 sm:grid-cols-2">
        {SITUATIONS.map((situation) => (
          <div key={situation.title} className="border-t border-border pt-6">
            <h3 className="text-base font-semibold text-primary">{situation.title}</h3>
            <p className="mt-2 leading-relaxed text-muted">{situation.description}</p>
          </div>
        ))}
      </div>
    </Section>
  )
}
