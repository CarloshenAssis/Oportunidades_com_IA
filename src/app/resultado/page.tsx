import type { Metadata } from 'next'
import { CheckCircle2, MessageCircle } from 'lucide-react'
import { Header } from '@/components/landing/Header'
import { Footer } from '@/components/landing/Footer'
import { Container } from '@/components/ui/Container'
import { LinkButton } from '@/components/ui/Button'
import { buildWhatsAppUrl } from '@/lib/whatsapp/message'

export const metadata: Metadata = {
  title: 'Diagnóstico enviado',
  description: 'Seu diagnóstico foi enviado com sucesso.',
  robots: { index: false, follow: false },
}

export default function ResultadoPage() {
  const whatsappNumber = process.env.WHATSAPP_NUMBER

  return (
    <>
      <Header />
      <main className="flex-1 bg-white">
        <Container className="flex max-w-2xl flex-col items-center gap-6 py-20 text-center sm:py-28">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
            <CheckCircle2 className="h-9 w-9 text-accent" aria-hidden="true" />
          </div>

          <h1 className="text-3xl font-semibold tracking-tight text-primary sm:text-4xl">Diagnóstico enviado.</h1>

          <p className="text-lg text-muted">Obrigado por compartilhar como sua empresa funciona.</p>

          <p className="max-w-xl leading-relaxed text-muted">
            As informações serão analisadas individualmente para identificar processos que podem ser
            simplificados, automatizados ou potencializados com Inteligência Artificial.
          </p>

          <p className="font-medium text-primary">Em breve entraremos em contato com você.</p>

          {whatsappNumber ? (
            <LinkButton
              href={buildWhatsAppUrl(whatsappNumber)}
              target="_blank"
              rel="noopener noreferrer"
              variant="primary"
              className="mt-4"
            >
              <MessageCircle className="h-5 w-5" aria-hidden="true" />
              Falar conosco pelo WhatsApp
            </LinkButton>
          ) : null}

          <LinkButton href="/" variant="ghost" className="text-sm">
            Voltar para a página inicial
          </LinkButton>
        </Container>
      </main>
      <Footer />
    </>
  )
}
