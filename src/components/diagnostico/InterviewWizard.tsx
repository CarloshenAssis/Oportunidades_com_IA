'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import type { AreaDepth, AreaInterview, CompanyMap, ContactData, DiagnosticMode, YesNoUnknown } from '@/types/diagnostic'
import {
  EMPTY_COMPANY_MAP,
  EMPTY_CONTACT,
  createEmptyAreaInterview,
  validateAreaInterview,
  validateContact,
  validateFullInterview,
} from '@/lib/validation/diagnostic'
import { extractDimensioningCandidates } from '@/lib/diagnostic/dimensioning'
import { availableAreasFor, nextStepAfterAreaDecision, nextStepAfterAreaInterview } from '@/lib/diagnostic/area-flow'
import { getApplicableSteps, validateStepAnswers } from '@/lib/diagnostic/questions'
import { ProgressBar } from './ProgressBar'
import { StepCompanyActivity, StepAreas, StepCompanyBasics } from './CompanyMapSteps'
import { StepSelectArea, StepSelectDepth, StepAreaDecision } from './AreaSelectionSteps'
import { InterviewStepForm } from './InterviewStepForm'
import { QuantitativeSizingStep } from './QuantitativeSizingStep'
import { StepContact } from './StepContact'
import { ReviewStep } from './ReviewStep'
import { SendingState } from './SendingState'

type Phase =
  | { type: 'company-basics' }
  | { type: 'company-activity' }
  | { type: 'company-areas' }
  | { type: 'select-area'; ordinal: number }
  | { type: 'select-depth'; ordinal: number }
  | { type: 'area-interview'; areaIndex: number }
  | { type: 'area-decision'; ordinal: number }
  | { type: 'contact' }
  | { type: 'review' }

function getPhaseLabel(phase: Phase, interviews: AreaInterview[]): string {
  switch (phase.type) {
    case 'company-basics':
      return 'Sobre a empresa'
    case 'company-activity':
      return 'Atividade principal'
    case 'company-areas':
      return 'Áreas da empresa'
    case 'select-area':
      return phase.ordinal === 0 ? 'Área prioritária' : `Área complementar ${phase.ordinal}`
    case 'select-depth':
      return 'Profundidade da entrevista'
    case 'area-interview':
      return `Entrevista: ${interviews[phase.areaIndex]?.area ?? ''}`
    case 'area-decision':
      return 'Mais uma área?'
    case 'contact':
      return 'Contato'
    case 'review':
      return 'Revisão das respostas'
  }
}

const GENERIC_ERROR_MESSAGE =
  'Não conseguimos enviar seu diagnóstico. Suas respostas foram preservadas nesta página. Tente novamente.'

type Props = {
  diagnosticMode: DiagnosticMode
}

export function InterviewWizard({ diagnosticMode }: Props) {
  const router = useRouter()
  const hasSizingStep = diagnosticMode === 'complete'

  const [companyMap, setCompanyMap] = useState<CompanyMap>(EMPTY_COMPANY_MAP)
  const [interviews, setInterviews] = useState<AreaInterview[]>([])
  const [contact, setContact] = useState<ContactData>(EMPTY_CONTACT)

  const [phase, setPhase] = useState<Phase>({ type: 'company-basics' })
  const [history, setHistory] = useState<Phase[]>([])
  const [interviewStepIndex, setInterviewStepIndex] = useState(0)

  const [pendingArea, setPendingArea] = useState('')
  const [pendingDepth, setPendingDepth] = useState<AreaDepth | ''>('')
  const [decision, setDecision] = useState<YesNoUnknown | ''>('')

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const headingRef = useRef<HTMLHeadingElement>(null)

  function focusHeading() {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    headingRef.current?.focus()
  }

  function goTo(next: Phase) {
    setHistory((prev) => [...prev, phase])
    setPhase(next)
    setInterviewStepIndex(0)
    setErrors({})
    focusHeading()
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

  function handleBack() {
    if (phase.type === 'area-interview' && interviewStepIndex > 0) {
      setInterviewStepIndex((prev) => prev - 1)
      setErrors({})
      focusHeading()
      return
    }

    if (history.length === 0) return

    const prevHistory = [...history]
    const prevPhase = prevHistory.pop() as Phase
    setHistory(prevHistory)
    setErrors({})

    if (prevPhase.type === 'area-interview') {
      const prevInterview = interviews[prevPhase.areaIndex]
      const applicable = prevInterview ? getApplicableSteps(prevInterview) : []
      setInterviewStepIndex(hasSizingStep ? applicable.length : Math.max(0, applicable.length - 1))
    } else {
      setInterviewStepIndex(0)
    }
    setPhase(prevPhase)
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

  function advanceAfterAreaInterview(finishedInterviews: AreaInterview[]) {
    const next = nextStepAfterAreaInterview(finishedInterviews)
    if (next === 'ask-second') {
      goTo({ type: 'area-decision', ordinal: 1 })
    } else if (next === 'ask-third') {
      goTo({ type: 'area-decision', ordinal: 2 })
    } else {
      goTo({ type: 'contact' })
    }
  }

  function handleAreaInterviewNext(areaIndex: number) {
    const interview = interviews[areaIndex]
    const applicableSteps = getApplicableSteps(interview)
    const isSizingStep = hasSizingStep && interviewStepIndex >= applicableSteps.length

    if (isSizingStep) {
      const areaErrors = validateAreaInterview(interview)
      if (Object.keys(areaErrors).length > 0) {
        setErrors(areaErrors)
        return
      }
      advanceAfterAreaInterview(interviews)
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
    if (!hasSizingStep && isLastBlockStep) {
      // Diagnóstico rápido: sem tela de dimensionamento e sem oferecer mais áreas — segue direto ao contato.
      const areaErrors = validateAreaInterview(interview)
      if (Object.keys(areaErrors).length > 0) {
        setErrors(areaErrors)
        return
      }
      goTo({ type: 'contact' })
      return
    }

    setInterviewStepIndex(interviewStepIndex + 1)
    focusHeading()
  }

  async function handleSubmit() {
    const payload = {
      diagnosticMode,
      company: {
        companyName: companyMap.companyName,
        segment: companyMap.segment,
        segmentOther: companyMap.segmentOther,
        employeeRange: companyMap.employeeRange,
        mainBusinessActivity: companyMap.mainBusinessActivity,
      },
      areas: companyMap.areas,
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
    switch (phase.type) {
      case 'company-basics': {
        const stepErrors = validateCompanyBasics()
        if (Object.keys(stepErrors).length > 0) {
          setErrors(stepErrors)
          return
        }
        goTo({ type: 'company-activity' })
        return
      }
      case 'company-activity': {
        if (!companyMap.mainBusinessActivity.trim()) {
          setErrors({ mainBusinessActivity: 'Campo obrigatório.' })
          return
        }
        goTo({ type: 'company-areas' })
        return
      }
      case 'company-areas': {
        if (companyMap.areas.length === 0) {
          setErrors({ areas: 'Selecione ao menos uma área.' })
          return
        }
        goTo({ type: 'select-area', ordinal: 0 })
        return
      }
      case 'select-area': {
        if (!pendingArea) {
          setErrors({ selectArea: 'Selecione uma área.' })
          return
        }
        if (phase.ordinal === 0) {
          const newIndex = interviews.length
          const depth: AreaDepth = diagnosticMode === 'quick' ? 'RAPIDA' : 'APROFUNDADA'
          const newInterview = createEmptyAreaInterview(pendingArea, 'PRIORITARIA', depth)
          setInterviews((prev) => [...prev, newInterview])
          setPendingArea('')
          goTo({ type: 'area-interview', areaIndex: newIndex })
        } else {
          goTo({ type: 'select-depth', ordinal: phase.ordinal })
        }
        return
      }
      case 'select-depth': {
        if (!pendingDepth) {
          setErrors({ selectDepth: 'Selecione uma opção.' })
          return
        }
        const newIndex = interviews.length
        const newInterview = createEmptyAreaInterview(pendingArea, 'COMPLEMENTAR', pendingDepth)
        setInterviews((prev) => [...prev, newInterview])
        setPendingArea('')
        setPendingDepth('')
        goTo({ type: 'area-interview', areaIndex: newIndex })
        return
      }
      case 'area-interview':
        handleAreaInterviewNext(phase.areaIndex)
        return
      case 'area-decision': {
        if (!decision) {
          setErrors({ areaDecision: 'Selecione uma opção.' })
          return
        }
        const ordinal = phase.ordinal
        const wantsMore = decision === 'Sim'
        const next = nextStepAfterAreaDecision(wantsMore)
        setDecision('')
        if (next === 'select-area') {
          goTo({ type: 'select-area', ordinal })
        } else {
          goTo({ type: 'contact' })
        }
        return
      }
      case 'contact': {
        const contactErrors = validateContact(contact)
        if (Object.keys(contactErrors).length > 0) {
          setErrors(contactErrors)
          return
        }
        goTo({ type: 'review' })
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

  const isLastPhase = phase.type === 'review'
  const currentInterview = phase.type === 'area-interview' ? interviews[phase.areaIndex] : undefined
  const applicableSteps = currentInterview ? getApplicableSteps(currentInterview) : []
  const isSizingStep = currentInterview ? hasSizingStep && interviewStepIndex >= applicableSteps.length : false

  const stepNumber = history.length + 1
  const totalStepsEstimate = isLastPhase ? stepNumber : stepNumber + 3

  const canGoBack = history.length > 0 || (phase.type === 'area-interview' && interviewStepIndex > 0)

  return (
    <Container className="max-w-2xl py-12 sm:py-16">
      <div className="mb-8">
        <ProgressBar label={getPhaseLabel(phase, interviews)} step={stepNumber} totalSteps={totalStepsEstimate} />
      </div>

      <h1 ref={headingRef} tabIndex={-1} className="mb-2 text-2xl font-semibold tracking-tight text-primary outline-none">
        {getPhaseLabel(phase, interviews)}
      </h1>

      {phase.type === 'area-interview' && !isSizingStep ? (
        <p className="mb-6 text-sm text-muted">
          Bloco {interviewStepIndex + 1} de {applicableSteps.length}
        </p>
      ) : (
        <div className="mb-6" />
      )}

      {phase.type === 'company-basics' ? <StepCompanyBasics data={companyMap} errors={errors} onChange={updateCompanyMap} /> : null}
      {phase.type === 'company-activity' ? <StepCompanyActivity data={companyMap} errors={errors} onChange={updateCompanyMap} /> : null}
      {phase.type === 'company-areas' ? <StepAreas data={companyMap} errors={errors} onChange={updateCompanyMap} /> : null}

      {phase.type === 'select-area' ? (
        <StepSelectArea
          ordinal={phase.ordinal}
          diagnosticMode={diagnosticMode}
          availableAreas={availableAreasFor(companyMap.areas, interviews)}
          selectedArea={pendingArea}
          onSelect={(area) => {
            setPendingArea(area)
            setErrors({})
          }}
          error={errors['selectArea']}
        />
      ) : null}

      {phase.type === 'select-depth' ? (
        <StepSelectDepth
          area={pendingArea}
          depth={pendingDepth}
          onSelect={(depth) => {
            setPendingDepth(depth)
            setErrors({})
          }}
          error={errors['selectDepth']}
        />
      ) : null}

      {phase.type === 'area-decision' ? (
        <StepAreaDecision
          ordinal={phase.ordinal}
          decision={decision}
          onSelect={(value) => {
            setDecision(value)
            setErrors({})
          }}
          error={errors['areaDecision']}
        />
      ) : null}

      {phase.type === 'area-interview' && currentInterview ? (
        isSizingStep ? (
          <QuantitativeSizingStep
            candidates={extractDimensioningCandidates(currentInterview)}
            interview={currentInterview}
            onChange={(next) => updateInterview(phase.areaIndex, next)}
            error={errors['quantitativeTask']}
          />
        ) : (
          <InterviewStepForm
            step={applicableSteps[interviewStepIndex]}
            interview={currentInterview}
            errors={errors}
            onChange={(next) => updateInterview(phase.areaIndex, next)}
          />
        )
      ) : null}

      {phase.type === 'contact' ? <StepContact data={contact} errors={errors} onChange={updateContact} /> : null}

      {phase.type === 'review' ? (
        <ReviewStep diagnosticMode={diagnosticMode} companyMap={companyMap} interviews={interviews} contact={contact} />
      ) : null}

      {submitError ? (
        <p role="alert" className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {submitError}
        </p>
      ) : null}

      <div className="mt-10 flex items-center justify-between gap-4">
        {canGoBack ? (
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
