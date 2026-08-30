import type { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from 'react'

const BASE_CLASSES =
  'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60'

const VARIANT_CLASSES = {
  primary: 'bg-accent text-accent-foreground hover:bg-accent-hover',
  secondary: 'bg-primary text-primary-foreground hover:bg-slate-800',
  outline: 'border border-border bg-white text-primary hover:border-slate-300 hover:bg-surface',
  ghost: 'text-primary hover:bg-surface',
} as const

/**
 * Tamanhos explícitos em vez de sobrescrever padding/tamanho de fonte via `className`
 * — utilitários conflitantes do Tailwind não têm precedência garantida pela ordem no atributo.
 */
const SIZE_CLASSES = {
  sm: 'px-4 py-2.5 text-sm',
  md: 'px-6 py-3.5 text-base',
  lg: 'px-7 py-4 text-base sm:text-lg',
} as const

type Variant = keyof typeof VARIANT_CLASSES
type Size = keyof typeof SIZE_CLASSES

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size; children: ReactNode }) {
  return (
    <button className={`${BASE_CLASSES} ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`} {...props}>
      {children}
    </button>
  )
}

export function LinkButton({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { variant?: Variant; size?: Size; children: ReactNode }) {
  return (
    <a className={`${BASE_CLASSES} ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`} {...props}>
      {children}
    </a>
  )
}
