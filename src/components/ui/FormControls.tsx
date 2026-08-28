import type { ReactNode, InputHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { AlertCircle } from 'lucide-react'

const INPUT_CLASSES =
  'w-full rounded-lg border border-border bg-white px-4 py-3 text-base text-primary placeholder:text-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent disabled:bg-surface'

export function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null
  return (
    <p id={id} role="alert" className="mt-1.5 flex items-center gap-1.5 text-sm font-medium text-red-600">
      <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
      {message}
    </p>
  )
}

export function FieldLabel({
  htmlFor,
  children,
  required,
}: {
  htmlFor: string
  children: ReactNode
  required?: boolean
}) {
  return (
    <label htmlFor={htmlFor} className="mb-2 block text-sm font-semibold text-primary">
      {children}
      {required ? (
        <span className="ml-0.5 text-accent" aria-hidden="true">
          *
        </span>
      ) : (
        <span className="ml-1.5 font-normal text-muted">(opcional)</span>
      )}
    </label>
  )
}

export function CharCount({ value, max }: { value: string; max: number }) {
  return (
    <p className="mt-1.5 text-right text-xs text-muted">
      {value.length}/{max}
    </p>
  )
}

type FieldWrapperProps = {
  id: string
  label: string
  required?: boolean
  error?: string
  hint?: string
  children: ReactNode
  maxLength?: number
  value?: string
}

export function Field({ id, label, required, error, hint, children, maxLength, value }: FieldWrapperProps) {
  return (
    <div>
      <FieldLabel htmlFor={id} required={required}>
        {label}
      </FieldLabel>
      {hint ? (
        <p id={`${id}-hint`} className="mb-2 text-sm text-muted">
          {hint}
        </p>
      ) : null}
      {children}
      {typeof maxLength === 'number' && typeof value === 'string' ? (
        <CharCount value={value} max={maxLength} />
      ) : null}
      <FieldError id={`${id}-error`} message={error} />
    </div>
  )
}

export function TextInput({
  id,
  error,
  className = '',
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { id: string; error?: string }) {
  return (
    <input
      id={id}
      className={`${INPUT_CLASSES} ${className}`}
      aria-invalid={!!error}
      aria-describedby={error ? `${id}-error` : undefined}
      {...props}
    />
  )
}

export function TextAreaInput({
  id,
  error,
  className = '',
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { id: string; error?: string }) {
  return (
    <textarea
      id={id}
      className={`${INPUT_CLASSES} min-h-32 resize-y ${className}`}
      aria-invalid={!!error}
      aria-describedby={error ? `${id}-error` : undefined}
      {...props}
    />
  )
}

export function SelectInput({
  id,
  error,
  className = '',
  children,
  ...props
}: InputHTMLAttributes<HTMLSelectElement> & { id: string; error?: string; children: ReactNode }) {
  return (
    <select
      id={id}
      className={`${INPUT_CLASSES} ${className}`}
      aria-invalid={!!error}
      aria-describedby={error ? `${id}-error` : undefined}
      {...(props as object)}
    >
      {children}
    </select>
  )
}

export function ChoiceCard({
  type,
  name,
  value,
  label,
  checked,
  onChange,
}: {
  type: 'radio' | 'checkbox'
  name: string
  value: string
  label: string
  checked: boolean
  onChange: () => void
}) {
  return (
    <label
      className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-sm font-medium transition-colors ${
        checked ? 'border-accent bg-accent/5 text-primary' : 'border-border bg-white text-primary hover:bg-surface'
      }`}
    >
      <input
        type={type}
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 shrink-0 accent-accent"
      />
      {label}
    </label>
  )
}
