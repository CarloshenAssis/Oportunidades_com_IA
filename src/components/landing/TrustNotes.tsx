import type { LucideIcon } from 'lucide-react'
import { Lock, MessageCircle, UserCheck } from 'lucide-react'
import { Container } from '@/components/ui/Container'

type Note = {
  icon: LucideIcon
  title: string
  description: string
}

/**
 * Transparência sobre o que acontece com as respostas e por que o contato é pedido — sem link de
 * política de privacidade porque o projeto ainda não tem uma página dedicada a isso.
 */
const NOTES: Note[] = [
  {
    icon: UserCheck,
    title: 'Análise individual',
    description:
      'Suas respostas não são apenas processadas por uma ferramenta — depois do preenchimento, elas são analisadas individualmente.',
  },
  {
    icon: MessageCircle,
    title: 'Por que pedimos seu contato',
    description:
      'Para retornar caso a análise identifique oportunidades relevantes para sua empresa. O retorno é feito pelo WhatsApp.',
  },
  {
    icon: Lock,
    title: 'Privacidade',
    description: 'Suas informações são utilizadas para realizar o diagnóstico e para esse contato.',
  },
]

export function TrustNotes() {
  return (
    <div className="border-t border-border py-14">
      <Container>
        <div className="grid gap-8 sm:grid-cols-3">
          {NOTES.map(({ icon: Icon, title, description }) => (
            <div key={title} className="flex gap-3">
              <Icon className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
              <div>
                <p className="text-sm font-semibold text-primary">{title}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </div>
  )
}
