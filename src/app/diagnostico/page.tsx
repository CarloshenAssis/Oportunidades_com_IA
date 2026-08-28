import type { Metadata } from 'next'
import { Header } from '@/components/landing/Header'
import { InterviewWizard } from '@/components/diagnostico/InterviewWizard'

export const metadata: Metadata = {
  title: 'Diagnóstico de Oportunidades com IA',
  description: 'Uma entrevista guiada sobre a sua empresa para descobrir onde a IA pode ajudar.',
}

export default function DiagnosticoPage() {
  return (
    <>
      <Header />
      <main className="flex-1 bg-white">
        <InterviewWizard />
      </main>
    </>
  )
}
