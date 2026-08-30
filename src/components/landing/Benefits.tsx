import type { LucideIcon } from 'lucide-react'
import { ListOrdered, Sparkles, Target } from 'lucide-react'
import { Container } from '@/components/ui/Container'

type Benefit = {
  icon: LucideIcon
  title: string
  description: string
}

const BENEFITS: Benefit[] = [
  {
    icon: Target,
    title: 'Encontre o que consome tempo',
    description: 'Identifique tarefas manuais, repetitivas e processos que dependem demais de pessoas.',
  },
  {
    icon: Sparkles,
    title: 'Descubra onde existem oportunidades',
    description:
      'Suas respostas ajudam a identificar processos que podem merecer investigação para IA, automação ou integração.',
  },
  {
    icon: ListOrdered,
    title: 'Entenda por onde começar',
    description: 'Os pontos identificados são organizados para mostrar quais problemas merecem atenção primeiro.',
  },
]

export function Benefits() {
  return (
    <section className="py-20 sm:py-24">
      <Container>
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-primary sm:text-3xl">
            Você não precisa saber onde colocar IA.
          </h2>
          <p className="mt-3 text-muted">O primeiro passo é entender como sua empresa funciona hoje.</p>
        </div>

        <div className="grid gap-8 sm:grid-cols-3">
          {BENEFITS.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="rounded-2xl border border-border bg-white p-8 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
                <Icon className="h-6 w-6 text-accent" aria-hidden="true" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-primary">{title}</h3>
              <p className="leading-relaxed text-muted">{description}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}
