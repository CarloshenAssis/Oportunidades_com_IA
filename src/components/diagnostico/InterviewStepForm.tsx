import type { InterviewStep, QuestionDef } from '@/lib/diagnostic/questions'
import { getFieldValue, setFieldValue } from '@/lib/diagnostic/questions'
import type { AreaInterview } from '@/types/diagnostic'
import { Field, TextAreaInput, SelectInput, ChoiceCard } from '@/components/ui/FormControls'

type Props = {
  step: InterviewStep
  interview: AreaInterview
  errors: Record<string, string>
  onChange: (next: AreaInterview) => void
  hints?: string[]
}

export function InterviewStepForm({ step, interview, errors, onChange, hints }: Props) {
  function handleChange(field: QuestionDef['field'], value: unknown) {
    onChange(setFieldValue(interview, field, value))
  }

  return (
    <div className="flex flex-col gap-6">
      {step.id === 'A' && hints && hints.length > 0 ? (
        <div className="rounded-lg border border-border bg-surface p-4 text-sm text-muted">
          <p className="mb-2 font-semibold text-primary">Perguntas que podem ajudar a pensar nessa área:</p>
          <ul className="list-disc space-y-1 pl-5">
            {hints.map((hint) => (
              <li key={hint}>{hint}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {step.questions.map((question) => {
        const value = getFieldValue(interview, question.field)
        const error = errors[question.field]
        const id = question.field

        if (question.type === 'textarea') {
          const stringValue = typeof value === 'string' ? value : ''
          return (
            <Field
              key={id}
              id={id}
              label={question.prompt}
              required={question.required}
              error={error}
              hint={question.helpText}
              maxLength={question.maxLength}
              value={stringValue}
            >
              <TextAreaInput
                id={id}
                value={stringValue}
                maxLength={question.maxLength}
                onChange={(event) => handleChange(question.field, event.target.value)}
                error={error}
              />
            </Field>
          )
        }

        if (question.type === 'select') {
          const stringValue = typeof value === 'string' ? value : ''
          return (
            <Field key={id} id={id} label={question.prompt} required={question.required} error={error}>
              <SelectInput id={id} value={stringValue} onChange={(event) => handleChange(question.field, event.target.value)} error={error}>
                <option value="">Selecione...</option>
                {question.options?.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </SelectInput>
            </Field>
          )
        }

        if (question.type === 'radio') {
          const stringValue = typeof value === 'string' ? value : ''
          return (
            <Field key={id} id={id} label={question.prompt} required={question.required} error={error}>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {question.options?.map((option) => (
                  <ChoiceCard
                    key={option}
                    type="radio"
                    name={id}
                    value={option}
                    label={option}
                    checked={stringValue === option}
                    onChange={() => handleChange(question.field, option)}
                  />
                ))}
              </div>
            </Field>
          )
        }

        const arrayValue = Array.isArray(value) ? (value as string[]) : []
        return (
          <Field key={id} id={id} label={question.prompt} required={question.required} error={error}>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {question.options?.map((option) => (
                <ChoiceCard
                  key={option}
                  type="checkbox"
                  name={id}
                  value={option}
                  label={option}
                  checked={arrayValue.includes(option)}
                  onChange={() => {
                    const next = arrayValue.includes(option)
                      ? arrayValue.filter((entry) => entry !== option)
                      : [...arrayValue, option]
                    handleChange(question.field, next)
                  }}
                />
              ))}
            </div>
          </Field>
        )
      })}
    </div>
  )
}
