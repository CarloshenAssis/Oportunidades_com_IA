import { z } from 'zod'
import { FIELD_LIMITS } from '@/lib/config/limits'
import { normalizePhoneToDigits, isValidPhoneDigits } from '@/lib/whatsapp/message'
import {
  AI_MATURITY_OPTIONS,
  EMPLOYEE_RANGES,
  SEGMENTS,
  TOOLS,
  YES_NO_UNKNOWN,
  type DiagnosticFormData,
} from '@/types/diagnostic'

const requiredText = (max: number) =>
  z
    .string()
    .trim()
    .min(1, 'Campo obrigatório.')
    .max(max, `Máximo de ${max} caracteres.`)

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Máximo de ${max} caracteres.`)
    .optional()
    .or(z.literal(''))

export const companySchema = z
  .object({
    companyName: requiredText(FIELD_LIMITS.companyName),
    segment: z.enum(SEGMENTS, { message: 'Selecione um segmento.' }),
    segmentOther: optionalText(FIELD_LIMITS.segmentOther),
    employeeRange: z.enum(EMPLOYEE_RANGES, { message: 'Selecione a quantidade de funcionários.' }),
  })
  .refine((data) => data.segment !== 'Outro' || !!data.segmentOther?.trim(), {
    message: 'Descreva o segmento.',
    path: ['segmentOther'],
  })

export const operationSchema = z.object({
  mainActivities: requiredText(FIELD_LIMITS.mainActivities),
  repetitiveTasks: requiredText(FIELD_LIMITS.repetitiveTasks),
  timeConsumingTasks: requiredText(FIELD_LIMITS.timeConsumingTasks),
})

export const problemsSchema = z
  .object({
    rework: requiredText(FIELD_LIMITS.rework),
    manualProcesses: requiredText(FIELD_LIMITS.manualProcesses),
    errors: requiredText(FIELD_LIMITS.errors),
    peopleDependency: z.enum(YES_NO_UNKNOWN, { message: 'Selecione uma opção.' }),
    peopleDependencyDescription: optionalText(FIELD_LIMITS.peopleDependencyDescription),
  })
  .refine((data) => data.peopleDependency !== 'Sim' || !!data.peopleDependencyDescription?.trim(), {
    message: 'Descreva a dependência.',
    path: ['peopleDependencyDescription'],
  })

export const technologySchema = z.object({
  tools: z.array(z.enum(TOOLS)).min(1, 'Selecione ao menos uma ferramenta.'),
  aiMaturity: z.enum(AI_MATURITY_OPTIONS, { message: 'Selecione uma opção.' }),
  technologyNotes: optionalText(FIELD_LIMITS.technologyNotes),
})

export const contactSchema = z
  .object({
    whatsapp: requiredText(FIELD_LIMITS.whatsapp),
    email: z
      .string()
      .trim()
      .max(FIELD_LIMITS.email)
      .email('E-mail inválido.')
      .optional()
      .or(z.literal('')),
    consent: z.literal(true, {
      message: 'É necessário concordar para continuar.',
    }),
  })
  .refine((data) => isValidPhoneDigits(normalizePhoneToDigits(data.whatsapp)), {
    message: 'Informe um WhatsApp válido, com DDD.',
    path: ['whatsapp'],
  })

export const diagnosticRequestSchema = z.object({
  company: companySchema,
  operation: operationSchema,
  problems: problemsSchema,
  technology: technologySchema,
  contact: contactSchema,
})

export type DiagnosticRequestInput = z.infer<typeof diagnosticRequestSchema>

export const TOTAL_STEPS = 5

/** Agrupa o estado plano do formulário no formato enviado a POST /api/diagnostico (SPEC.md §17). */
export function groupFormData(data: DiagnosticFormData) {
  return {
    company: {
      companyName: data.companyName,
      segment: data.segment,
      segmentOther: data.segmentOther,
      employeeRange: data.employeeRange,
    },
    operation: {
      mainActivities: data.mainActivities,
      repetitiveTasks: data.repetitiveTasks,
      timeConsumingTasks: data.timeConsumingTasks,
    },
    problems: {
      rework: data.rework,
      manualProcesses: data.manualProcesses,
      errors: data.errors,
      peopleDependency: data.peopleDependency,
      peopleDependencyDescription: data.peopleDependencyDescription,
    },
    technology: {
      tools: data.tools,
      aiMaturity: data.aiMaturity,
      technologyNotes: data.technologyNotes,
    },
    contact: {
      whatsapp: data.whatsapp,
      email: data.email,
      consent: data.consent,
    },
  }
}

const STEP_SCHEMAS = [companySchema, operationSchema, problemsSchema, technologySchema, contactSchema] as const

type FieldErrors = Record<string, string>

function issuesToFieldErrors(issues: z.ZodError['issues']): FieldErrors {
  const errors: FieldErrors = {}
  for (const issue of issues) {
    const key = issue.path.join('.')
    if (!errors[key]) {
      errors[key] = issue.message
    }
  }
  return errors
}

/** Valida apenas a etapa atual do formulário (1 a 5) e retorna erros por campo. */
export function validateStep(step: number, data: DiagnosticFormData): FieldErrors {
  const grouped = groupFormData(data)
  const sections = [grouped.company, grouped.operation, grouped.problems, grouped.technology, grouped.contact]
  const schema = STEP_SCHEMAS[step - 1]
  const result = schema.safeParse(sections[step - 1])
  return result.success ? {} : issuesToFieldErrors(result.error.issues)
}

/** Valida o formulário completo e devolve o payload pronto para POST /api/diagnostico. */
export function validateFullForm(
  data: DiagnosticFormData,
): { success: true; data: DiagnosticRequestInput } | { success: false; errors: FieldErrors } {
  const result = diagnosticRequestSchema.safeParse(groupFormData(data))
  if (!result.success) {
    return { success: false, errors: issuesToFieldErrors(result.error.issues) }
  }
  return { success: true, data: result.data }
}

export const EMPTY_FORM_DATA: DiagnosticFormData = {
  companyName: '',
  segment: '',
  segmentOther: '',
  employeeRange: '',
  mainActivities: '',
  repetitiveTasks: '',
  timeConsumingTasks: '',
  rework: '',
  manualProcesses: '',
  errors: '',
  peopleDependency: '',
  peopleDependencyDescription: '',
  tools: [],
  aiMaturity: '',
  technologyNotes: '',
  whatsapp: '',
  email: '',
  consent: false,
}
