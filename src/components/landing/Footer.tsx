import { Container } from '@/components/ui/Container'

export function Footer() {
  return (
    <footer className="border-t border-border py-10">
      <Container className="flex flex-col items-center gap-2 text-center text-sm text-muted sm:flex-row sm:justify-between sm:text-left">
        <p>Diagnóstico de Oportunidades com IA</p>
        <p>Um diagnóstico é uma primeira análise, não uma proposta de implementação.</p>
      </Container>
    </footer>
  )
}
