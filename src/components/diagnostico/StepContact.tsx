import { FIELD_LIMITS } from '@/lib/config/limits'
import { Field, TextInput, FieldError } from '@/components/ui/FormControls'
import type { StepProps } from './types'

export function StepContact({ data, errors, onChange }: StepProps) {
  return (
    <div className="flex flex-col gap-6">
      <Field
        id="whatsapp"
        label="WhatsApp"
        required
        error={errors['whatsapp']}
        hint="Usaremos apenas para gerar o link de contato ao final do diagnóstico."
      >
        <TextInput
          id="whatsapp"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          value={data.whatsapp}
          onChange={(e) => onChange('whatsapp', e.target.value)}
          error={errors['whatsapp']}
          placeholder="(11) 99999-9999"
          maxLength={FIELD_LIMITS.whatsapp}
        />
      </Field>

      <Field id="email" label="E-mail" error={errors['email']}>
        <TextInput
          id="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          value={data.email ?? ''}
          onChange={(e) => onChange('email', e.target.value)}
          error={errors['email']}
          placeholder="voce@empresa.com"
          maxLength={FIELD_LIMITS.email}
        />
      </Field>

      <div>
        <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-white p-4 text-sm leading-relaxed text-primary">
          <input
            type="checkbox"
            checked={data.consent}
            onChange={(e) => onChange('consent', e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 accent-accent"
            aria-describedby={errors['consent'] ? 'consent-error' : undefined}
            aria-invalid={!!errors['consent']}
          />
          Concordo em receber o diagnóstico e informações relacionadas à análise solicitada.
        </label>
        <FieldError id="consent-error" message={errors['consent']} />
      </div>
    </div>
  )
}
