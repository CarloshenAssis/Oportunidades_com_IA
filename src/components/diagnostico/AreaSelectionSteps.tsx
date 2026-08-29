'use client'

import { YES_NO_UNKNOWN, type AreaDepth, type DiagnosticMode, type YesNoUnknown } from '@/types/diagnostic'
import { Field, ChoiceCard } from '@/components/ui/FormControls'

const ORDINAL_TITLES = ['a primeira', 'a segunda', 'a terceira']

/** Tela para escolher qual área será investigada — a primeira é sempre a prioritária (SPEC V3 §4, §10). */
export function StepSelectArea({
  ordinal,
  diagnosticMode,
  availableAreas,
  selectedArea,
  onSelect,
  error,
}: {
  ordinal: number
  diagnosticMode: DiagnosticMode
  availableAreas: string[]
  selectedArea: string
  onSelect: (area: string) => void
  error?: string
}) {
  const isFirst = ordinal === 0
  const title = isFirst
    ? 'Qual área você quer analisar?'
    : `Qual será ${ORDINAL_TITLES[ordinal] ?? 'a próxima'} área?`
  const hint = isFirst
    ? diagnosticMode === 'quick'
      ? 'Vamos fazer uma entrevista rápida, com as perguntas essenciais sobre essa área.'
      : 'Essa é a área prioritária — vamos investigá-la a fundo, com uma entrevista completa.'
    : 'Uma área não pode ser escolhida duas vezes — só aparecem aqui as que ainda não foram analisadas.'

  return (
    <Field id="selectArea" label={title} required error={error} hint={hint}>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {availableAreas.map((area) => (
          <ChoiceCard
            key={area}
            type="radio"
            name="selectArea"
            value={area}
            label={area}
            checked={selectedArea === area}
            onChange={() => onSelect(area)}
          />
        ))}
      </div>
    </Field>
  )
}

/** Tela para escolher a profundidade da entrevista de uma área complementar (SPEC V3 §4, §9). */
export function StepSelectDepth({
  area,
  depth,
  onSelect,
  error,
}: {
  area: string
  depth: AreaDepth | ''
  onSelect: (depth: AreaDepth) => void
  error?: string
}) {
  return (
    <Field
      id="selectDepth"
      label={`Como você quer investigar "${area}"?`}
      required
      error={error}
      hint="A análise rápida tem 10 perguntas fixas. A aprofundada é uma entrevista completa, como a da área prioritária."
    >
      <div className="flex flex-col gap-3">
        <ChoiceCard
          type="radio"
          name="selectDepth"
          value="RAPIDA"
          label="Análise rápida (10 perguntas)"
          checked={depth === 'RAPIDA'}
          onChange={() => onSelect('RAPIDA')}
        />
        <ChoiceCard
          type="radio"
          name="selectDepth"
          value="APROFUNDADA"
          label="Análise aprofundada (entrevista completa)"
          checked={depth === 'APROFUNDADA'}
          onChange={() => onSelect('APROFUNDADA')}
        />
      </div>
    </Field>
  )
}

/** Tela de decisão "quer analisar mais uma área?" — nunca oferecida junto com outra decisão (SPEC V3 §4). */
export function StepAreaDecision({
  ordinal,
  decision,
  onSelect,
  error,
}: {
  ordinal: number
  decision: YesNoUnknown | ''
  onSelect: (value: YesNoUnknown) => void
  error?: string
}) {
  const ordinalLabel = ordinal === 1 ? 'uma segunda área' : 'uma terceira área'

  return (
    <Field
      id="areaDecision"
      label={`Você quer também analisar ${ordinalLabel}?`}
      required
      error={error}
      hint="Isso é opcional — você já pode finalizar o diagnóstico com o que respondeu até aqui."
    >
      <div className="grid grid-cols-3 gap-3">
        {YES_NO_UNKNOWN.filter((option) => option !== 'Não sei').map((option) => (
          <ChoiceCard
            key={option}
            type="radio"
            name="areaDecision"
            value={option}
            label={option}
            checked={decision === option}
            onChange={() => onSelect(option)}
          />
        ))}
      </div>
    </Field>
  )
}
