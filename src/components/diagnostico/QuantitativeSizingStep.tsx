import { TRANSFER_FREQUENCY_OPTIONS, YES_NO_UNKNOWN } from '@/types/diagnostic'
import type { AreaInterview, QuantitativeSizing } from '@/types/diagnostic'
import type { DimensioningCandidate } from '@/lib/diagnostic/dimensioning'
import { Field, SelectInput, TextAreaInput, TextInput, ChoiceCard } from '@/components/ui/FormControls'

type Props = {
  candidates: DimensioningCandidate[]
  interview: AreaInterview
  onChange: (next: AreaInterview) => void
  error?: string
}

function toNumberOrUndefined(raw: string): number | undefined {
  if (raw.trim() === '') return undefined
  const value = Number(raw)
  return Number.isFinite(value) ? value : undefined
}

const CUSTOM_TASK_VALUE = '__outra__'

export function QuantitativeSizingStep({ candidates, interview, onChange, error }: Props) {
  const sizing: QuantitativeSizing = interview.quantitativeSizing ?? { taskLabel: '' }
  const isCustomTask = !!sizing.taskLabel && !candidates.some((c) => c.label === sizing.taskLabel)
  const selectedValue = sizing.taskLabel ? (isCustomTask ? CUSTOM_TASK_VALUE : sizing.taskLabel) : ''

  function updateSizing(patch: Partial<QuantitativeSizing>) {
    onChange({ ...interview, quantitativeSizing: { ...sizing, ...patch } })
  }

  function selectCandidate(candidate: DimensioningCandidate) {
    updateSizing({ taskLabel: candidate.label, sourceField: candidate.sourceField })
  }

  function selectCustomTask() {
    updateSizing({ taskLabel: isCustomTask ? sizing.taskLabel : '', sourceField: undefined })
  }

  return (
    <div className="flex flex-col gap-6">
      <Field
        id="quantitativeTask"
        label="Qual dessas tarefas você gostaria que fosse analisada com mais atenção? (opcional)"
        error={error}
      >
        <div className="flex flex-col gap-3">
          {candidates.map((candidate) => (
            <ChoiceCard
              key={candidate.sourceField}
              type="radio"
              name="quantitativeTask"
              value={candidate.label}
              label={candidate.label}
              checked={selectedValue === candidate.label}
              onChange={() => selectCandidate(candidate)}
            />
          ))}
          <ChoiceCard
            type="radio"
            name="quantitativeTask"
            value={CUSTOM_TASK_VALUE}
            label="Outra tarefa"
            checked={selectedValue === CUSTOM_TASK_VALUE}
            onChange={selectCustomTask}
          />
        </div>
        {selectedValue === CUSTOM_TASK_VALUE ? (
          <div className="mt-3">
            <TextInput
              id="quantitativeTaskCustom"
              value={isCustomTask ? sizing.taskLabel : ''}
              onChange={(e) => updateSizing({ taskLabel: e.target.value, sourceField: undefined })}
              placeholder="Descreva a tarefa"
            />
          </div>
        ) : null}
      </Field>

      <p className="text-sm text-muted">Não precisa de números exatos — estimativas ajudam bastante.</p>

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

      <Field id="minutesPerExecution" label="Quanto tempo leva cada execução? (minutos)">
        <TextInput
          id="minutesPerExecution"
          type="number"
          min={1}
          inputMode="numeric"
          value={sizing.minutesPerExecution ?? ''}
          onChange={(e) => updateSizing({ minutesPerExecution: toNumberOrUndefined(e.target.value) })}
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

      <Field id="executionVariation" label="Existe variação de volume? (opcional)" hint='Ex.: "Algumas execuções levam 5 minutos e outras 30."'>
        <TextAreaInput
          id="executionVariation"
          value={sizing.executionVariation ?? ''}
          onChange={(e) => updateSizing({ executionVariation: e.target.value })}
        />
      </Field>

      <Field id="hasSeasonalPeak" label="Existe alguma época em que o volume aumenta?">
        <div className="grid grid-cols-3 gap-3">
          {YES_NO_UNKNOWN.map((option) => (
            <ChoiceCard
              key={option}
              type="radio"
              name="hasSeasonalPeak"
              value={option}
              label={option}
              checked={sizing.hasSeasonalPeak === option}
              onChange={() => updateSizing({ hasSeasonalPeak: option })}
            />
          ))}
        </div>
      </Field>

      {sizing.hasSeasonalPeak === 'Sim' ? (
        <Field id="seasonalPeakDescription" label="Quando, e o que costuma acontecer nessa época?">
          <TextAreaInput
            id="seasonalPeakDescription"
            value={sizing.seasonalPeakDescription ?? ''}
            onChange={(e) => updateSizing({ seasonalPeakDescription: e.target.value })}
          />
        </Field>
      ) : null}

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
