import Link from 'next/link'
import { Container } from '@/components/ui/Container'
import { LinkButton } from '@/components/ui/Button'

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-white/90 backdrop-blur supports-backdrop-blur:bg-white/75">
      <Container className="flex h-16 items-center justify-between gap-6">
        <Link href="/" className="text-base font-semibold tracking-tight text-primary">
          Diagnóstico<span className="text-accent">IA</span>
        </Link>

        <div className="flex items-center gap-6">
          <Link
            href="/#como-funciona"
            className="hidden text-sm font-medium text-muted transition-colors hover:text-primary sm:block"
          >
            Como funciona
          </Link>
          <LinkButton href="/diagnostico" variant="primary" size="sm">
            Fazer meu diagnóstico
          </LinkButton>
        </div>
      </Container>
    </header>
  )
}
