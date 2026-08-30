import type { ReactNode } from 'react'
import { Container } from '@/components/ui/Container'

type SectionProps = {
  id?: string
  /** Fundo off-white, usado para alternar o ritmo entre seções. */
  surface?: boolean
  className?: string
  children: ReactNode
}

/** Espaçamento vertical e largura consistentes para todas as seções da landing. */
export function Section({ id, surface = false, className = '', children }: SectionProps) {
  return (
    <section
      id={id}
      className={`${surface ? 'border-y border-border bg-surface' : ''} py-20 sm:py-28 ${className}`}
    >
      <Container>{children}</Container>
    </section>
  )
}

type SectionHeadingProps = {
  eyebrow?: string
  title: ReactNode
  description?: ReactNode
  align?: 'left' | 'center'
  className?: string
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  className = '',
}: SectionHeadingProps) {
  const isCentered = align === 'center'

  return (
    <div className={`${isCentered ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'} ${className}`}>
      {eyebrow ? <Eyebrow className="mb-4">{eyebrow}</Eyebrow> : null}
      <h2 className="text-2xl font-semibold tracking-tight text-primary sm:text-3xl sm:leading-tight">{title}</h2>
      {description ? <p className="mt-4 leading-relaxed text-muted">{description}</p> : null}
    </div>
  )
}

/** Rótulo técnico em monoespaçada — detalhe discreto que dá o tom institucional. */
export function Eyebrow({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <p className={`font-mono text-xs font-medium uppercase tracking-[0.18em] text-accent ${className}`}>
      {children}
    </p>
  )
}
