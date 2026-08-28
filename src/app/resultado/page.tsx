import type { Metadata } from 'next'
import { Header } from '@/components/landing/Header'
import { Footer } from '@/components/landing/Footer'
import { ResultView } from '@/components/resultado/ResultView'

export const metadata: Metadata = {
  title: 'Seu Diagnóstico de Oportunidades com IA',
  description: 'Resultado do seu diagnóstico de oportunidades de aplicação de IA.',
  robots: { index: false, follow: false },
}

export default function ResultadoPage() {
  return (
    <>
      <Header />
      <main className="flex-1 bg-white">
        <ResultView />
      </main>
      <Footer />
    </>
  )
}
