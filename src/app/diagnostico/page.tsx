import type { Metadata } from 'next'
import { Header } from '@/components/landing/Header'
import { DiagnosticWizard } from '@/components/diagnostico/DiagnosticWizard'

export const metadata: Metadata = {
  title: 'Diagnóstico de Oportunidades com IA',
  description: 'Responda 5 etapas rápidas sobre a sua empresa e descubra onde a IA pode ajudar.',
}

export default function DiagnosticoPage() {
  return (
    <>
      <Header />
      <main className="flex-1 bg-white">
        <DiagnosticWizard />
      </main>
    </>
  )
}
