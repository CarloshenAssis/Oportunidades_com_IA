'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { EMPTY_FORM_DATA, TOTAL_STEPS, validateFullForm, validateStep } from '@/lib/validation/diagnostic'
import type { DiagnosticFormData } from '@/types/diagnostic'
import { ProgressBar } from './ProgressBar'
import { StepCompany } from './StepCompany'
import { StepOperation } from './StepOperation'
import { StepProblems } from './StepProblems'
import { StepTechnology } from './StepTechnology'
import { StepContact } from './StepContact'
import { LoadingAnalysis } from './LoadingAnalysis'
import { RESULT_STORAGE_KEY } from '@/lib/storage'

const STEP_TITLES = [
  'Sobre a sua empresa',
  'Como funciona a operação',
  'Problemas e gargalos',
  'Ferramentas e tecnologia',
  'Como podemos falar com você',
]

export function DiagnosticWizard() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [data, setData] = useState<DiagnosticFormData>(EMPTY_FORM_DATA)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)

  function handleChange<K extends keyof DiagnosticFormData>(field: K, value: DiagnosticFormData[K]) {
    setData((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => {
      if (!(field in prev)) return prev
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  function focusHeading() {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    headingRef.current?.focus()
  }

  function handleNext() {
    const stepErrors = validateStep(step, data)
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors)
      return
    }
    setErrors({})
    setStep((prev) => Math.min(prev + 1, TOTAL_STEPS))
    focusHeading()
  }

  function handleBack() {
    setErrors({})
    setStep((prev) => Math.max(prev - 1, 1))
    focusHeading()
  }

  async function handleSubmit() {
    const validation = validateFullForm(data)
    if (!validation.success) {
      setErrors(validation.errors)
      return
    }

    setSubmitting(true)
    setSubmitError(null)

    try {
      const response = await fetch('/api/diagnostico', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validation.data),
      })

      const payload = await response.json().catch(() => null)

      if (!response.ok || !payload?.result) {
        setSubmitError(
          payload?.error ?? 'Não conseguimos gerar seu diagnóstico agora. Tente novamente em alguns instantes.',
        )
        setSubmitting(false)
        return
      }

      sessionStorage.setItem(
        RESULT_STORAGE_KEY,
        JSON.stringify({ result: payload.result, whatsapp: data.whatsapp }),
      )
      router.push('/resultado')
    } catch {
      setSubmitError('Não conseguimos gerar seu diagnóstico agora. Tente novamente em alguns instantes.')
      setSubmitting(false)
    }
  }

  if (submitting) {
    return (
      <Container className="max-w-2xl py-16">
        <LoadingAnalysis />
      </Container>
    )
  }

  return (
    <Container className="max-w-2xl py-12 sm:py-16">
      <div className="mb-8">
        <ProgressBar step={step} totalSteps={TOTAL_STEPS} />
      </div>

      <h1 ref={headingRef} tabIndex={-1} className="mb-6 text-2xl font-semibold tracking-tight text-primary outline-none">
        {STEP_TITLES[step - 1]}
      </h1>

      {step === 1 ? <StepCompany data={data} errors={errors} onChange={handleChange} /> : null}
      {step === 2 ? <StepOperation data={data} errors={errors} onChange={handleChange} /> : null}
      {step === 3 ? <StepProblems data={data} errors={errors} onChange={handleChange} /> : null}
      {step === 4 ? <StepTechnology data={data} errors={errors} onChange={handleChange} /> : null}
      {step === 5 ? <StepContact data={data} errors={errors} onChange={handleChange} /> : null}

      {submitError ? (
        <p role="alert" className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {submitError}
        </p>
      ) : null}

      <div className="mt-10 flex items-center justify-between gap-4">
        {step > 1 ? (
          <Button type="button" variant="outline" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Voltar
          </Button>
        ) : (
          <span />
        )}

        {step < TOTAL_STEPS ? (
          <Button type="button" variant="primary" onClick={handleNext}>
            Avançar
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        ) : (
          <Button type="button" variant="primary" onClick={handleSubmit}>
            Concluir diagnóstico
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        )}
      </div>
    </Container>
  )
}
