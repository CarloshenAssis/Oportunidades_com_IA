'use client'

import { useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import type { AreaInterview, CompanyMap, ContactData } from '@/types/diagnostic'
import {
  EMPTY_COMPANY_MAP,
  EMPTY_CONTACT,
  createEmptyAreaInterview,
  validateAreaInterview,
  validateContact,
  validateFullInterview,
} from '@/lib/validation/diagnostic'
import { extractCandidateTasksFromArea, pickTaskForQuantitativeSizing } from '@/lib/diagnostic/scoring'
import { getApplicableSteps, getAreaHints, validateStepAnswers } from '@/lib/diagnostic/questions'
import { ProgressBar } from './ProgressBar'
import { StepCompanyActivity, StepAreas, StepCompanyBasics, StepPriorityAreas } from './CompanyMapSteps'
import { InterviewStepForm } from './InterviewStepForm'
import { QuantitativeSizingStep } from './QuantitativeSizingStep'
import { StepContact } from './StepContact'
import { ReviewStep } from './ReviewStep'
import { SendingState } from './SendingState'

type Phase =
  | { type: 'company-basics' }
  | { type: 'company-activity' }
  | { type: 'company-areas' }
  | { type: 'company-priority' }
  | { type: 'area-interview'; areaIndex: number }
  | { type: 'contact' }
  | { type: 'review' }

function getPhaseLabel(phase: Phase, companyMap: CompanyMap): string {
  switch (phase.type) {
    case 'company-basics':
      return 'Sobre a empresa'
    case 'company-activity':
      return 'Atividade principal'
    case 'company-areas':
      return 'Áreas da empresa'
    case 'company-priority':
      return 'Áreas prioritárias'
    case 'area-interview':
      return `Entrevista: ${companyMap.priorityAreas[phase.areaIndex]?.area ?? ''}`
    case 'contact':
      return 'Contato'
    case 'review':
      return 'Revisão das respostas'
  }
}

const GENERIC_ERROR_MESSAGE =
  'Não conseguimos enviar seu diagnóstico. Suas respostas foram preservadas nesta página. Tente novamente.'

export function InterviewWizard() {
  const router = useRouter()

  const [companyMap, setCompanyMap] = useState<CompanyMap>(EMPTY_COMPANY_MAP)
  const [interviews, setInterviews] = useState<AreaInterview[]>([])
  const [contact, setContact] = useState<ContactData>(EMPTY_CONTACT)

  const [phaseIndex, setPhaseIndex] = useState(0)
  const [interviewStepIndex, setInterviewStepIndex] = useState(0)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const headingRef = useRef<HTMLHeadingElement>(null)

  const phases: Phase[] = useMemo(() => {
    const base: Phase[] = [{ type: 'company-basics' }, { type: 'company-activity' }, { type: 'company-areas' }, { type: 'company-priority' }]
    const areaPhases: Phase[] = companyMap.priorityAreas.map((_, index) => ({ type: 'area-interview', areaIndex: index }))
    return [...base, ...areaPhases, { type: 'contact' }, { type: 'review' }]
  }, [companyMap.priorityAreas])

  const currentPhase = phases[phaseIndex]

  function focusHeading() {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    headingRef.current?.focus()
  }

  function updateCompanyMap<K extends keyof CompanyMap>(field: K, value: CompanyMap[K]) {
    setCompanyMap((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => {
      if (!(field in prev)) return prev
      const next = { ...prev }
      delete next[field as string]
      return next
    })
  }

  function updateContact<K extends keyof ContactData>(field: K, value: ContactData[K]) {
    setContact((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => {
      if (!(field in prev)) return prev
      const next = { ...prev }
      delete next[field as string]
      return next
    })
  }

  function updateInterview(areaIndex: number, next: AreaInterview) {
    setInterviews((prev) => {
      const copy = [...prev]
      copy[areaIndex] = next
      return copy
    })
    setErrors({})
  }

  function goToNextPhase() {
    setPhaseIndex((prev) => Math.min(prev + 1, phases.length - 1))
    setInterviewStepIndex(0)
    setErrors({})
    focusHeading()
  }

  function handleBack() {
    if (currentPhase.type === 'area-interview' && interviewStepIndex > 0) {
      setInterviewStepIndex((prev) => prev - 1)
      setErrors({})
      focusHeading()
      return
    }

    if (phaseIndex === 0) return

    const prevPhaseIndex = phaseIndex - 1
    const prevPhase = phases[prevPhaseIndex]
    setPhaseIndex(prevPhaseIndex)
    setErrors({})

    if (prevPhase.type === 'area-interview') {
      const prevInterview = interviews[prevPhase.areaIndex]
      const applicable = prevInterview ? getApplicableSteps(prevInterview) : []
      setInterviewStepIndex(Math.max(0, applicable.length - 1))
    } else {
      setInterviewStepIndex(0)
    }
    focusHeading()
  }

  function validateCompanyBasics(): Record<string, string> {
    const next: Record<string, string> = {}
    if (!companyMap.companyName.trim()) next.companyName = 'Campo obrigatório.'
    if (!companyMap.segment) next.segment = 'Selecione um segmento.'
    if (companyMap.segment === 'Outro' && !companyMap.segmentOther?.trim()) next.segmentOther = 'Descreva o segmento.'
    if (!companyMap.employeeRange) next.employeeRange = 'Selecione a quantidade de funcionários.'
    return next
  }

  function handleAreaInterviewNext(areaIndex: number) {
    const interview = interviews[areaIndex]
    const applicableSteps = getApplicableSteps(interview)
    const isSizingStep = interviewStepIndex >= applicableSteps.length

    function finishAreaInterview() {
      const areaErrors = validateAreaInterview(interview)
      if (Object.keys(areaErrors).length > 0) {
        setErrors(areaErrors)
        return
      }
      goToNextPhase()
    }

    if (isSizingStep) {
      finishAreaInterview()
      return
    }

    const step = applicableSteps[interviewStepIndex]
    const stepErrors = validateStepAnswers(step, interview)
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors)
      return
    }
    setErrors({})

    const isLastBlockStep = interviewStepIndex + 1 >= applicableSteps.length
    if (!isLastBlockStep) {
      setInterviewStepIndex(interviewStepIndex + 1)
      focusHeading()
      return
    }

    const candidateTask = pickTaskForQuantitativeSizing(extractCandidateTasksFromArea(interview))
    if (candidateTask) {
      setInterviewStepIndex(applicableSteps.length)
      focusHeading()
      return
    }

    finishAreaInterview()
  }

  async function handleSubmit() {
    const payload = {
      company: {
        companyName: companyMap.companyName,
        segment: companyMap.segment,
        segmentOther: companyMap.segmentOther,
        employeeRange: companyMap.employeeRange,
        mainBusinessActivity: companyMap.mainBusinessActivity,
      },
      areas: companyMap.areas,
      priorityAreas: companyMap.priorityAreas,
      interviews,
      contact,
    }

    const validation = validateFullInterview(payload)
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

      const responseBody = await response.json().catch(() => null)

      if (!response.ok || !responseBody?.success) {
        setSubmitError(responseBody?.error ?? GENERIC_ERROR_MESSAGE)
        setSubmitting(false)
        return
      }

      router.push('/resultado')
    } catch {
      setSubmitError(GENERIC_ERROR_MESSAGE)
      setSubmitting(false)
    }
  }

  function handleNext() {
    switch (currentPhase.type) {
      case 'company-basics': {
        const stepErrors = validateCompanyBasics()
        if (Object.keys(stepErrors).length > 0) {
          setErrors(stepErrors)
          return
        }
        goToNextPhase()
        return
      }
      case 'company-activity': {
        if (!companyMap.mainBusinessActivity.trim()) {
          setErrors({ mainBusinessActivity: 'Campo obrigatório.' })
          return
        }
        goToNextPhase()
        return
      }
      case 'company-areas': {
        if (companyMap.areas.length === 0) {
          setErrors({ areas: 'Selecione ao menos uma área.' })
          return
        }
        goToNextPhase()
        return
      }
      case 'company-priority': {
        if (companyMap.priorityAreas.length === 0) {
          setErrors({ priorityAreas: 'Selecione ao menos uma área.' })
          return
        }
        const reasonErrors: Record<string, string> = {}
        companyMap.priorityAreas.forEach((priorityArea, index) => {
          if (!priorityArea.reason.trim()) {
            reasonErrors[`priorityAreas.${index}.reason`] = 'Campo obrigatório.'
          }
        })
        if (Object.keys(reasonErrors).length > 0) {
          setErrors(reasonErrors)
          return
        }
        setInterviews(companyMap.priorityAreas.map((priorityArea) => createEmptyAreaInterview(priorityArea.area)))
        goToNextPhase()
        return
      }
      case 'area-interview':
        handleAreaInterviewNext(currentPhase.areaIndex)
        return
      case 'contact': {
        const contactErrors = validateContact(contact)
        if (Object.keys(contactErrors).length > 0) {
          setErrors(contactErrors)
          return
        }
        goToNextPhase()
        return
      }
      case 'review':
        void handleSubmit()
        return
    }
  }

  if (submitting) {
    return (
      <Container className="max-w-2xl py-16">
        <SendingState />
      </Container>
    )
  }

  const isLastPhase = phaseIndex === phases.length - 1
  const currentInterview = currentPhase.type === 'area-interview' ? interviews[currentPhase.areaIndex] : undefined
  const applicableSteps = currentInterview ? getApplicableSteps(currentInterview) : []
  const isSizingStep = currentInterview ? interviewStepIndex >= applicableSteps.length : false
  const candidateTaskForSizing = currentInterview && isSizingStep ? pickTaskForQuantitativeSizing(extractCandidateTasksFromArea(currentInterview)) : null

  return (
    <Container className="max-w-2xl py-12 sm:py-16">
      <div className="mb-8">
        <ProgressBar label={getPhaseLabel(currentPhase, companyMap)} step={phaseIndex + 1} totalSteps={phases.length} />
      </div>

      <h1 ref={headingRef} tabIndex={-1} className="mb-2 text-2xl font-semibold tracking-tight text-primary outline-none">
        {getPhaseLabel(currentPhase, companyMap)}
      </h1>

      {currentPhase.type === 'area-interview' && !isSizingStep ? (
        <p className="mb-6 text-sm text-muted">
          Bloco {interviewStepIndex + 1} de {applicableSteps.length}
        </p>
      ) : (
        <div className="mb-6" />
      )}

      {currentPhase.type === 'company-basics' ? <StepCompanyBasics data={companyMap} errors={errors} onChange={updateCompanyMap} /> : null}
      {currentPhase.type === 'company-activity' ? <StepCompanyActivity data={companyMap} errors={errors} onChange={updateCompanyMap} /> : null}
      {currentPhase.type === 'company-areas' ? <StepAreas data={companyMap} errors={errors} onChange={updateCompanyMap} /> : null}
      {currentPhase.type === 'company-priority' ? <StepPriorityAreas data={companyMap} errors={errors} onChange={updateCompanyMap} /> : null}

      {currentPhase.type === 'area-interview' && currentInterview ? (
        isSizingStep ? (
          candidateTaskForSizing ? (
            <QuantitativeSizingStep
              task={candidateTaskForSizing}
              interview={currentInterview}
              onChange={(next) => updateInterview(currentPhase.areaIndex, next)}
            />
          ) : (
            <p className="text-muted">Entrevista desta área concluída.</p>
          )
        ) : (
          <InterviewStepForm
            step={applicableSteps[interviewStepIndex]}
            interview={currentInterview}
            errors={errors}
            onChange={(next) => updateInterview(currentPhase.areaIndex, next)}
            hints={getAreaHints(currentInterview.area)}
          />
        )
      ) : null}

      {currentPhase.type === 'contact' ? <StepContact data={contact} errors={errors} onChange={updateContact} /> : null}

      {currentPhase.type === 'review' ? <ReviewStep companyMap={companyMap} interviews={interviews} contact={contact} /> : null}

      {submitError ? (
        <p role="alert" className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {submitError}
        </p>
      ) : null}

      <div className="mt-10 flex items-center justify-between gap-4">
        {phaseIndex > 0 || (currentPhase.type === 'area-interview' && interviewStepIndex > 0) ? (
          <Button type="button" variant="outline" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Voltar
          </Button>
        ) : (
          <span />
        )}

        <Button type="button" variant="primary" onClick={handleNext}>
          {isLastPhase ? 'Enviar meu diagnóstico' : 'Avançar'}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </Container>
  )
}
