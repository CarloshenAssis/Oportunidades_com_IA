import { AI_MATURITY_OPTIONS, TOOLS } from '@/types/diagnostic'
import { FIELD_LIMITS } from '@/lib/config/limits'
import { Field, TextAreaInput, ChoiceCard } from '@/components/ui/FormControls'
import type { StepProps } from './types'

export function StepTechnology({ data, errors, onChange }: StepProps) {
  function toggleTool(tool: (typeof TOOLS)[number]) {
    const isSelected = data.tools.includes(tool)
    onChange('tools', isSelected ? data.tools.filter((t) => t !== tool) : [...data.tools, tool])
  }

  return (
    <div className="flex flex-col gap-6">
      <Field id="tools" label="Quais ferramentas sua empresa utiliza hoje?" required error={errors['tools']}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {TOOLS.map((tool) => (
            <ChoiceCard
              key={tool}
              type="checkbox"
              name="tools"
              value={tool}
              label={tool}
              checked={data.tools.includes(tool)}
              onChange={() => toggleTool(tool)}
            />
          ))}
        </div>
      </Field>

      <Field id="aiMaturity" label="Sua empresa já utiliza IA hoje?" required error={errors['aiMaturity']}>
        <div className="flex flex-col gap-3">
          {AI_MATURITY_OPTIONS.map((option) => (
            <ChoiceCard
              key={option}
              type="radio"
              name="aiMaturity"
              value={option}
              label={option}
              checked={data.aiMaturity === option}
              onChange={() => onChange('aiMaturity', option)}
            />
          ))}
        </div>
      </Field>

      <Field
        id="technologyNotes"
        label="Observações sobre ferramentas ou tecnologia (opcional)"
        error={errors['technologyNotes']}
        maxLength={FIELD_LIMITS.technologyNotes}
        value={data.technologyNotes ?? ''}
      >
        <TextAreaInput
          id="technologyNotes"
          value={data.technologyNotes ?? ''}
          maxLength={FIELD_LIMITS.technologyNotes}
          onChange={(e) => onChange('technologyNotes', e.target.value)}
          error={errors['technologyNotes']}
        />
      </Field>
    </div>
  )
}
