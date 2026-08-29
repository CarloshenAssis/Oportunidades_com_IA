import type { Metadata } from 'next'
import { Header } from '@/components/landing/Header'
import { InterviewWizard } from '@/components/diagnostico/InterviewWizard'
import { resolveDiagnosticMode } from '@/lib/diagnostic/mode'

export const metadata: Metadata = {
  title: 'Diagnóstico de Oportunidades com IA',
  description: 'Uma entrevista guiada sobre a sua empresa para descobrir onde a IA pode ajudar.',
}

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function DiagnosticoPage({ searchParams }: PageProps) {
  const params = await searchParams
  const diagnosticMode = resolveDiagnosticMode(params.mode)

  return (
    <>
      <Header />
      <main className="flex-1 bg-white">
        <InterviewWizard diagnosticMode={diagnosticMode} />
      </main>
    </>
  )
}
