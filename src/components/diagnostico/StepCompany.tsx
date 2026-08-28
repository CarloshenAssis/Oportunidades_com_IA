import { EMPLOYEE_RANGES, SEGMENTS } from '@/types/diagnostic'
import { FIELD_LIMITS } from '@/lib/config/limits'
import { Field, SelectInput, TextInput, ChoiceCard } from '@/components/ui/FormControls'
import type { StepProps } from './types'

export function StepCompany({ data, errors, onChange }: StepProps) {
  return (
    <div className="flex flex-col gap-6">
      <Field
        id="companyName"
        label="Nome da empresa"
        required
        error={errors['companyName']}
        maxLength={FIELD_LIMITS.companyName}
        value={data.companyName}
      >
        <TextInput
          id="companyName"
          value={data.companyName}
          maxLength={FIELD_LIMITS.companyName}
          onChange={(e) => onChange('companyName', e.target.value)}
          error={errors['companyName']}
          placeholder="Ex.: Comércio Silva Ltda."
        />
      </Field>

      <Field id="segment" label="Segmento" required error={errors['segment']}>
        <SelectInput
          id="segment"
          value={data.segment}
          onChange={(e) => onChange('segment', e.target.value as typeof data.segment)}
          error={errors['segment']}
        >
          <option value="" disabled>
            Selecione um segmento
          </option>
          {SEGMENTS.map((segment) => (
            <option key={segment} value={segment}>
              {segment}
            </option>
          ))}
        </SelectInput>
      </Field>

      {data.segment === 'Outro' ? (
        <Field id="segmentOther" label="Qual segmento?" required error={errors['segmentOther']}>
          <TextInput
            id="segmentOther"
            value={data.segmentOther ?? ''}
            onChange={(e) => onChange('segmentOther', e.target.value)}
            error={errors['segmentOther']}
          />
        </Field>
      ) : null}

      <Field id="employeeRange" label="Quantos funcionários a empresa tem?" required error={errors['employeeRange']}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {EMPLOYEE_RANGES.map((range) => (
            <ChoiceCard
              key={range}
              type="radio"
              name="employeeRange"
              value={range}
              label={range}
              checked={data.employeeRange === range}
              onChange={() => onChange('employeeRange', range)}
            />
          ))}
        </div>
      </Field>
    </div>
  )
}
