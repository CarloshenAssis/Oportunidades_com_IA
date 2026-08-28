import { MessageCircle } from 'lucide-react'
import { LinkButton } from '@/components/ui/Button'
import { buildWhatsAppUrl } from '@/lib/whatsapp/message'

export function ResultCTA({ whatsapp }: { whatsapp: string }) {
  return (
    <section className="rounded-2xl border border-border bg-primary p-8 text-center sm:p-12">
      <h2 className="mx-auto max-w-xl text-2xl font-semibold tracking-tight text-white sm:text-3xl">
        Encontramos oportunidades. Agora podemos analisar quais realmente fazem sentido para sua empresa.
      </h2>
      <p className="mx-auto mt-4 max-w-xl text-slate-300">
        O diagnóstico é uma primeira análise. A implementação depende de uma avaliação mais detalhada do
        processo, ferramentas utilizadas e requisitos da empresa.
      </p>
      <LinkButton
        href={buildWhatsAppUrl(whatsapp)}
        target="_blank"
        rel="noopener noreferrer"
        variant="primary"
        className="mt-8 text-lg"
      >
        <MessageCircle className="h-5 w-5" aria-hidden="true" />
        Quero conversar sobre meu diagnóstico
      </LinkButton>
    </section>
  )
}
