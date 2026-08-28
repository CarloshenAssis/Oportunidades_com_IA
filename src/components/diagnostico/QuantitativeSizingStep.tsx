import { TRANSFER_FREQUENCY_OPTIONS } from '@/types/diagnostic'
import type { AreaInterview, QuantitativeSizing } from '@/types/diagnostic'
import type { CandidateTask } from '@/lib/diagnostic/scoring'
import { Field, SelectInput, TextAreaInput, TextInput } from '@/components/ui/FormControls'

type Props = {
  task: CandidateTask
  interview: AreaInterview
  onChange: (next: AreaInterview) => void
}

function toNumberOrUndefined(raw: string): number | undefined {
  if (raw.trim() === '') return undefined
  const value = Number(raw)
  return Number.isFinite(value) ? value : undefined
}

export function QuantitativeSizingStep({ task, interview, onChange }: Props) {
  const sizing: QuantitativeSizing = interview.quantitativeSizing ?? {
    sourceField: task.sourceField,
    taskLabel: task.taskText,
  }

  function updateSizing(patch: Partial<QuantitativeSizing>) {
    onChange({ ...interview, quantitativeSizing: { ...sizing, ...patch } })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border border-accent/30 bg-accent/5 p-4 text-sm text-primary">
        Vamos dimensionar melhor esta tarefa: <strong>&ldquo;{task.taskText}&rdquo;</strong>. Se não souber algum
        número, pode deixar em branco.
      </div>

      <Field id="peopleCount" label="Quantas pessoas executam essa tarefa?">
        <TextInput
          id="peopleCount"
          type="number"
          min={1}
          inputMode="numeric"
          value={sizing.peopleCount ?? ''}
          onChange={(e) => updateSizing({ peopleCount: toNumberOrUndefined(e.target.value) })}
        />
      </Field>

      <Field id="executionFrequency" label="Quantas vezes ela acontece?">
        <SelectInput
          id="executionFrequency"
          value={sizing.executionFrequency ?? ''}
          onChange={(e) => updateSizing({ executionFrequency: e.target.value as QuantitativeSizing['executionFrequency'] })}
        >
          <option value="">Selecione...</option>
          {TRANSFER_FREQUENCY_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </SelectInput>
      </Field>

      <Field id="minutesPerExecution" label="Quanto tempo aproximadamente leva cada execução? (minutos)">
        <TextInput
          id="minutesPerExecution"
          type="number"
          min={1}
          inputMode="numeric"
          value={sizing.minutesPerExecution ?? ''}
          onChange={(e) => updateSizing({ minutesPerExecution: toNumberOrUndefined(e.target.value) })}
        />
      </Field>

      <Field id="executionVariation" label="Existe variação? (opcional)" hint='Ex.: "Algumas execuções levam 5 minutos e outras 30."'>
        <TextAreaInput
          id="executionVariation"
          value={sizing.executionVariation ?? ''}
          onChange={(e) => updateSizing({ executionVariation: e.target.value })}
        />
      </Field>

      <Field id="monthlyExecutions" label="Aproximadamente quantas execuções acontecem por mês?">
        <TextInput
          id="monthlyExecutions"
          type="number"
          min={0}
          inputMode="numeric"
          placeholder="Deixe em branco se não souber"
          value={sizing.monthlyExecutions ?? ''}
          onChange={(e) => updateSizing({ monthlyExecutions: e.target.value.trim() === '' ? null : toNumberOrUndefined(e.target.value) })}
        />
      </Field>

      <Field id="hourlyCost" label="Custo aproximado da hora dessa pessoa (opcional)">
        <TextInput
          id="hourlyCost"
          type="number"
          min={0}
          inputMode="numeric"
          value={interview.hourlyCost ?? ''}
          onChange={(e) => onChange({ ...interview, hourlyCost: toNumberOrUndefined(e.target.value) })}
        />
      </Field>
    </div>
  )
}
