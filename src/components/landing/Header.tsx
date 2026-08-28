import Link from 'next/link'
import { Container } from '@/components/ui/Container'
import { LinkButton } from '@/components/ui/Button'

export function Header() {
  return (
    <header className="border-b border-border bg-white/90 backdrop-blur supports-backdrop-blur:bg-white/60 sticky top-0 z-40">
      <Container className="flex h-16 items-center justify-between">
        <Link href="/" className="text-base font-semibold tracking-tight text-primary">
          Diagnóstico<span className="text-accent">IA</span>
        </Link>
        <LinkButton href="/diagnostico" variant="primary" className="px-4 py-2.5 text-sm">
          Fazer meu diagnóstico
        </LinkButton>
      </Container>
    </header>
  )
}
