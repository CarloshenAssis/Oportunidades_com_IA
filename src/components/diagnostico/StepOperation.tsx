import { FIELD_LIMITS } from '@/lib/config/limits'
import { Field, TextAreaInput } from '@/components/ui/FormControls'
import type { StepProps } from './types'

export function StepOperation({ data, errors, onChange }: StepProps) {
  return (
    <div className="flex flex-col gap-6">
      <Field
        id="mainActivities"
        label="Quais são as principais atividades realizadas pela sua equipe?"
        required
        error={errors['mainActivities']}
        maxLength={FIELD_LIMITS.mainActivities}
        value={data.mainActivities}
      >
        <TextAreaInput
          id="mainActivities"
          value={data.mainActivities}
          maxLength={FIELD_LIMITS.mainActivities}
          onChange={(e) => onChange('mainActivities', e.target.value)}
          error={errors['mainActivities']}
        />
      </Field>

      <Field
        id="repetitiveTasks"
        label="Quais tarefas sua equipe realiza todos os dias ou todas as semanas?"
        required
        error={errors['repetitiveTasks']}
        maxLength={FIELD_LIMITS.repetitiveTasks}
        value={data.repetitiveTasks}
      >
        <TextAreaInput
          id="repetitiveTasks"
          value={data.repetitiveTasks}
          maxLength={FIELD_LIMITS.repetitiveTasks}
          onChange={(e) => onChange('repetitiveTasks', e.target.value)}
          error={errors['repetitiveTasks']}
        />
      </Field>

      <Field
        id="timeConsumingTasks"
        label="Quais atividades mais consomem tempo da equipe?"
        required
        error={errors['timeConsumingTasks']}
        maxLength={FIELD_LIMITS.timeConsumingTasks}
        value={data.timeConsumingTasks}
      >
        <TextAreaInput
          id="timeConsumingTasks"
          value={data.timeConsumingTasks}
          maxLength={FIELD_LIMITS.timeConsumingTasks}
          onChange={(e) => onChange('timeConsumingTasks', e.target.value)}
          error={errors['timeConsumingTasks']}
        />
      </Field>
    </div>
  )
}
