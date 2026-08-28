import { YES_NO_UNKNOWN } from '@/types/diagnostic'
import { FIELD_LIMITS } from '@/lib/config/limits'
import { Field, TextAreaInput, TextInput, ChoiceCard } from '@/components/ui/FormControls'
import type { StepProps } from './types'

export function StepProblems({ data, errors, onChange }: StepProps) {
  return (
    <div className="flex flex-col gap-6">
      <Field
        id="rework"
        label="Onde sua empresa percebe mais retrabalho?"
        required
        error={errors['rework']}
        maxLength={FIELD_LIMITS.rework}
        value={data.rework}
      >
        <TextAreaInput
          id="rework"
          value={data.rework}
          maxLength={FIELD_LIMITS.rework}
          onChange={(e) => onChange('rework', e.target.value)}
          error={errors['rework']}
        />
      </Field>

      <Field
        id="manualProcesses"
        label="Quais processos ainda são feitos manualmente?"
        required
        error={errors['manualProcesses']}
        maxLength={FIELD_LIMITS.manualProcesses}
        value={data.manualProcesses}
      >
        <TextAreaInput
          id="manualProcesses"
          value={data.manualProcesses}
          maxLength={FIELD_LIMITS.manualProcesses}
          onChange={(e) => onChange('manualProcesses', e.target.value)}
          error={errors['manualProcesses']}
        />
      </Field>

      <Field
        id="errors"
        label="Em quais atividades costumam acontecer erros, esquecimentos ou atrasos?"
        required
        error={errors['errors']}
        maxLength={FIELD_LIMITS.errors}
        value={data.errors}
      >
        <TextAreaInput
          id="errors"
          value={data.errors}
          maxLength={FIELD_LIMITS.errors}
          onChange={(e) => onChange('errors', e.target.value)}
          error={errors['errors']}
        />
      </Field>

      <Field
        id="peopleDependency"
        label="Existe algum processo que depende muito de uma pessoa específica?"
        required
        error={errors['peopleDependency']}
      >
        <div className="grid grid-cols-3 gap-3">
          {YES_NO_UNKNOWN.map((option) => (
            <ChoiceCard
              key={option}
              type="radio"
              name="peopleDependency"
              value={option}
              label={option}
              checked={data.peopleDependency === option}
              onChange={() => onChange('peopleDependency', option)}
            />
          ))}
        </div>
      </Field>

      {data.peopleDependency === 'Sim' ? (
        <Field
          id="peopleDependencyDescription"
          label="Descreva essa dependência"
          required
          error={errors['peopleDependencyDescription']}
          maxLength={FIELD_LIMITS.peopleDependencyDescription}
          value={data.peopleDependencyDescription ?? ''}
        >
          <TextInput
            id="peopleDependencyDescription"
            value={data.peopleDependencyDescription ?? ''}
            maxLength={FIELD_LIMITS.peopleDependencyDescription}
            onChange={(e) => onChange('peopleDependencyDescription', e.target.value)}
            error={errors['peopleDependencyDescription']}
          />
        </Field>
      ) : null}
    </div>
  )
}
