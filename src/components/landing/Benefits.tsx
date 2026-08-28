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
    title: 'Identifique gargalos',
    description: 'Encontre processos que consomem tempo e exigem trabalho manual.',
  },
  {
    icon: Sparkles,
    title: 'Encontre oportunidades',
    description: 'Descubra onde IA ou automação podem fazer sentido.',
  },
  {
    icon: ListOrdered,
    title: 'Saiba por onde começar',
    description: 'Receba uma lista priorizada de oportunidades.',
  },
]

export function Benefits() {
  return (
    <section className="py-20 sm:py-24">
      <Container>
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
