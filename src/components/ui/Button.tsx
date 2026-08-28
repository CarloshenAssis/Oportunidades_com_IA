import type { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from 'react'

const BASE_CLASSES =
  'inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3.5 text-base font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60'

const VARIANT_CLASSES = {
  primary: 'bg-accent text-accent-foreground hover:bg-accent-hover',
  secondary: 'bg-primary text-primary-foreground hover:bg-slate-800',
  outline: 'border border-border bg-white text-primary hover:bg-surface',
  ghost: 'text-primary hover:bg-surface',
} as const

type Variant = keyof typeof VARIANT_CLASSES

export function Button({
  variant = 'primary',
  className = '',
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; children: ReactNode }) {
  return (
    <button className={`${BASE_CLASSES} ${VARIANT_CLASSES[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}

export function LinkButton({
  variant = 'primary',
  className = '',
  children,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { variant?: Variant; children: ReactNode }) {
  return (
    <a className={`${BASE_CLASSES} ${VARIANT_CLASSES[variant]} ${className}`} {...props}>
      {children}
    </a>
  )
}
