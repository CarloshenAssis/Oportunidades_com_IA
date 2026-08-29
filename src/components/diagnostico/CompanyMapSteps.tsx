'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { AREAS, EMPLOYEE_RANGES, SEGMENTS } from '@/types/diagnostic'
import type { CompanyMap } from '@/types/diagnostic'
import { FIELD_LIMITS } from '@/lib/config/limits'
import { Field, SelectInput, TextInput, TextAreaInput, ChoiceCard } from '@/components/ui/FormControls'
import { Button } from '@/components/ui/Button'

type CompanyMapStepProps = {
  data: CompanyMap
  errors: Record<string, string>
  onChange: <K extends keyof CompanyMap>(field: K, value: CompanyMap[K]) => void
}

export function StepCompanyBasics({ data, errors, onChange }: CompanyMapStepProps) {
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
        <SelectInput id="segment" value={data.segment} onChange={(e) => onChange('segment', e.target.value as typeof data.segment)} error={errors['segment']}>
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

export function StepCompanyActivity({ data, errors, onChange }: CompanyMapStepProps) {
  return (
    <Field
      id="mainBusinessActivity"
      label="Qual é a principal atividade da empresa?"
      required
      error={errors['mainBusinessActivity']}
      maxLength={FIELD_LIMITS.mainBusinessActivity}
      value={data.mainBusinessActivity}
    >
      <TextAreaInput
        id="mainBusinessActivity"
        value={data.mainBusinessActivity}
        maxLength={FIELD_LIMITS.mainBusinessActivity}
        onChange={(e) => onChange('mainBusinessActivity', e.target.value)}
        error={errors['mainBusinessActivity']}
      />
    </Field>
  )
}

const PREDEFINED_AREAS = AREAS.filter((area) => area !== 'Outra')

export function StepAreas({ data, errors, onChange }: CompanyMapStepProps) {
  const [customInput, setCustomInput] = useState('')
  const customAreas = data.areas.filter((area) => !(PREDEFINED_AREAS as readonly string[]).includes(area))

  function toggleArea(area: string) {
    const next = data.areas.includes(area) ? data.areas.filter((a) => a !== area) : [...data.areas, area]
    onChange('areas', next)
  }

  function addCustomArea() {
    const trimmed = customInput.trim().slice(0, FIELD_LIMITS.areaName)
    if (trimmed && !data.areas.includes(trimmed)) {
      onChange('areas', [...data.areas, trimmed])
    }
    setCustomInput('')
  }

  function removeArea(area: string) {
    onChange(
      'areas',
      data.areas.filter((a) => a !== area),
    )
  }

  return (
    <Field id="areas" label="Quais áreas existem atualmente na empresa?" required error={errors['areas']}>
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {PREDEFINED_AREAS.map((area) => (
          <ChoiceCard
            key={area}
            type="checkbox"
            name="areas"
            value={area}
            label={area}
            checked={data.areas.includes(area)}
            onChange={() => toggleArea(area)}
          />
        ))}
      </div>

      {customAreas.length > 0 ? (
        <div className="mb-3 flex flex-wrap gap-2">
          {customAreas.map((area) => (
            <span key={area} className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1.5 text-sm font-medium text-primary">
              {area}
              <button type="button" onClick={() => removeArea(area)} aria-label={`Remover área ${area}`} className="text-muted hover:text-primary">
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </span>
          ))}
        </div>
      ) : null}

      <div className="flex gap-2">
        <TextInput
          id="customArea"
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          placeholder="Adicionar outra área"
          maxLength={FIELD_LIMITS.areaName}
        />
        <Button type="button" variant="outline" onClick={addCustomArea}>
          Adicionar
        </Button>
      </div>
    </Field>
  )
}

