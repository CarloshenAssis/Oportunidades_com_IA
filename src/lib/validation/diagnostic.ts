import { z } from 'zod'
import { FIELD_LIMITS } from '@/lib/config/limits'
import { normalizePhoneToDigits, isValidPhoneDigits } from '@/lib/whatsapp/message'
import { CANDIDATE_SOURCE_FIELDS } from '@/lib/diagnostic/scoring'
import {
  EMPLOYEE_RANGES,
  INFORMATION_SOURCES,
  MAX_PRIORITY_AREAS,
  REWORK_REASONS,
  SEARCH_TIME_OPTIONS,
  SEGMENTS,
  TRANSFER_FREQUENCY_OPTIONS,
  YES_NO_SOMETIMES,
  YES_NO_UNKNOWN,
  type AreaInterview,
  type CompanyMap,
  type ContactData,
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

/**
 * Campo sempre presente no objeto (tipo `string`, nunca `string | undefined`),
 * mas cujo conteúdo pode ficar em branco — os blocos A–K nunca obrigam o
 * usuário a inventar uma tarefa (SPEC V2 §55).
 */
const blankableText = (max: number) => z.string().trim().max(max, `Máximo de ${max} caracteres.`)

export const companySchema = z
  .object({
    companyName: requiredText(FIELD_LIMITS.companyName),
    segment: z.enum(SEGMENTS, { message: 'Selecione um segmento.' }),
    segmentOther: optionalText(FIELD_LIMITS.segmentOther),
    employeeRange: z.enum(EMPLOYEE_RANGES, { message: 'Selecione a quantidade de funcionários.' }),
    mainBusinessActivity: requiredText(FIELD_LIMITS.mainBusinessActivity),
  })
  .refine((data) => data.segment !== 'Outro' || !!data.segmentOther?.trim(), {
    message: 'Descreva o segmento.',
    path: ['segmentOther'],
  })

export const priorityAreaSchema = z.object({
  area: requiredText(FIELD_LIMITS.areaName),
  reason: requiredText(FIELD_LIMITS.areaReason),
})

const areaRiskSchema = z.object({
  personalData: z.enum(YES_NO_UNKNOWN, { message: 'Selecione uma opção.' }),
  financialData: z.enum(YES_NO_UNKNOWN, { message: 'Selecione uma opção.' }),
  customerData: z.enum(YES_NO_UNKNOWN, { message: 'Selecione uma opção.' }),
  employeeData: z.enum(YES_NO_UNKNOWN, { message: 'Selecione uma opção.' }),
  confidentialData: z.enum(YES_NO_UNKNOWN, { message: 'Selecione uma opção.' }),
})

const quantitativeSizingSchema = z.object({
  sourceField: z.enum(CANDIDATE_SOURCE_FIELDS),
  taskLabel: requiredText(FIELD_LIMITS.longAnswer),
  peopleCount: z.number().positive().max(100_000).optional(),
  executionFrequency: z.enum(TRANSFER_FREQUENCY_OPTIONS).optional().or(z.literal('')),
  minutesPerExecution: z.number().positive().max(100_000).optional(),
  executionVariation: optionalText(FIELD_LIMITS.shortAnswer),
  monthlyExecutions: z.number().nonnegative().max(1_000_000).nullable().optional(),
})

export const areaInterviewSchema = z
  .object({
    area: requiredText(FIELD_LIMITS.areaName),

    dailyRepetitiveTasks: blankableText(FIELD_LIMITS.longAnswer),
    weeklyRepetitiveTasks: blankableText(FIELD_LIMITS.longAnswer),
    monthlyRepetitiveTasks: blankableText(FIELD_LIMITS.longAnswer),

    mostTimeConsumingTask: blankableText(FIELD_LIMITS.longAnswer),
    taskTheyWouldEliminate: blankableText(FIELD_LIMITS.longAnswer),
    taskPainReason: optionalText(FIELD_LIMITS.shortAnswer),

    copyPasteTasks: blankableText(FIELD_LIMITS.longAnswer),
    informationTransfer: optionalText(FIELD_LIMITS.shortAnswer),
    transferFrequency: z.enum(TRANSFER_FREQUENCY_OPTIONS).optional().or(z.literal('')),

    documentTasks: blankableText(FIELD_LIMITS.longAnswer),
    documentExtraction: optionalText(FIELD_LIMITS.shortAnswer),
    documentDataEntry: z.enum(YES_NO_SOMETIMES).optional().or(z.literal('')),

    repeatedWritingTasks: blankableText(FIELD_LIMITS.longAnswer),
    writingVariation: optionalText(FIELD_LIMITS.shortAnswer),

    informationSearchTasks: blankableText(FIELD_LIMITS.longAnswer),
    informationSources: z.array(z.enum(INFORMATION_SOURCES)).optional(),
    informationSearchTime: z.enum(SEARCH_TIME_OPTIONS).optional().or(z.literal('')),

    reworkProcess: blankableText(FIELD_LIMITS.longAnswer),
    reworkReason: z.array(z.enum(REWORK_REASONS)).optional(),

    errorProneTasks: blankableText(FIELD_LIMITS.longAnswer),
    errorConsequence: optionalText(FIELD_LIMITS.shortAnswer),

    manualReviewTasks: blankableText(FIELD_LIMITS.longAnswer),
    reviewCriteria: optionalText(FIELD_LIMITS.shortAnswer),

    keyPersonDependency: z.enum(YES_NO_UNKNOWN, { message: 'Selecione uma opção.' }),
    dependencyDescription: optionalText(FIELD_LIMITS.shortAnswer),

    taskToEliminate: blankableText(FIELD_LIMITS.longAnswer),
    eliminationReason: optionalText(FIELD_LIMITS.shortAnswer),

    risk: areaRiskSchema,

    quantitativeSizing: quantitativeSizingSchema.optional(),
    hourlyCost: z.number().positive().max(1_000_000).optional(),
    additionalNotes: optionalText(FIELD_LIMITS.additionalNotes),
  })
  .refine((data) => data.keyPersonDependency !== 'Sim' || !!data.dependencyDescription?.trim(), {
    message: 'Descreva a dependência.',
    path: ['dependencyDescription'],
  })

export const contactSchema = z
  .object({
    responsibleName: requiredText(FIELD_LIMITS.responsibleName),
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

export const diagnosticRequestSchema = z
  .object({
    company: companySchema,
    areas: z.array(requiredText(FIELD_LIMITS.areaName)).min(1, 'Selecione ao menos uma área.'),
    priorityAreas: z
      .array(priorityAreaSchema)
      .min(1, 'Selecione ao menos uma área prioritária.')
      .max(MAX_PRIORITY_AREAS, `Selecione no máximo ${MAX_PRIORITY_AREAS} áreas.`),
    interviews: z.array(areaInterviewSchema).min(1, 'Nenhuma entrevista foi respondida.'),
    contact: contactSchema,
  })
  .superRefine((data, ctx) => {
    const areaSet = new Set(data.areas)
    data.priorityAreas.forEach((priorityArea, index) => {
      if (!areaSet.has(priorityArea.area)) {
        ctx.addIssue({
          code: 'custom',
          message: 'Área prioritária precisa estar entre as áreas selecionadas.',
          path: ['priorityAreas', index, 'area'],
        })
      }
    })

    if (data.interviews.length !== data.priorityAreas.length) {
      ctx.addIssue({
        code: 'custom',
        message: 'O número de entrevistas precisa corresponder ao número de áreas prioritárias.',
        path: ['interviews'],
      })
    }

    const priorityAreaSet = new Set(data.priorityAreas.map((priorityArea) => priorityArea.area))
    data.interviews.forEach((interview, index) => {
      if (!priorityAreaSet.has(interview.area)) {
        ctx.addIssue({
          code: 'custom',
          message: 'Entrevista associada a uma área que não está entre as prioritárias.',
          path: ['interviews', index, 'area'],
        })
      }
    })
  })

export type DiagnosticRequestInput = z.infer<typeof diagnosticRequestSchema>

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

export function validateCompanyMap(data: CompanyMap): FieldErrors {
  const result = companySchema.safeParse({
    companyName: data.companyName,
    segment: data.segment,
    segmentOther: data.segmentOther,
    employeeRange: data.employeeRange,
    mainBusinessActivity: data.mainBusinessActivity,
  })
  return result.success ? {} : issuesToFieldErrors(result.error.issues)
}

export function validateAreaInterview(interview: AreaInterview): FieldErrors {
  const result = areaInterviewSchema.safeParse(interview)
  return result.success ? {} : issuesToFieldErrors(result.error.issues)
}

export function validateContact(data: ContactData): FieldErrors {
  const result = contactSchema.safeParse(data)
  return result.success ? {} : issuesToFieldErrors(result.error.issues)
}

/** Valida o payload completo e devolve o objeto pronto para POST /api/diagnostico (SPEC V2 §58). */
export function validateFullInterview(
  payload: unknown,
): { success: true; data: DiagnosticRequestInput } | { success: false; errors: FieldErrors } {
  const result = diagnosticRequestSchema.safeParse(payload)
  if (!result.success) {
    return { success: false, errors: issuesToFieldErrors(result.error.issues) }
  }
  return { success: true, data: result.data }
}

export const EMPTY_COMPANY_MAP: CompanyMap = {
  companyName: '',
  segment: '',
  segmentOther: '',
  employeeRange: '',
  areas: [],
  mainBusinessActivity: '',
  priorityAreas: [],
}

export function createEmptyAreaInterview(area: string): AreaInterview {
  return {
    area,
    dailyRepetitiveTasks: '',
    weeklyRepetitiveTasks: '',
    monthlyRepetitiveTasks: '',
    mostTimeConsumingTask: '',
    taskTheyWouldEliminate: '',
    taskPainReason: '',
    copyPasteTasks: '',
    informationTransfer: '',
    transferFrequency: '',
    documentTasks: '',
    documentExtraction: '',
    documentDataEntry: '',
    repeatedWritingTasks: '',
    writingVariation: '',
    informationSearchTasks: '',
    informationSources: [],
    informationSearchTime: '',
    reworkProcess: '',
    reworkReason: [],
    errorProneTasks: '',
    errorConsequence: '',
    manualReviewTasks: '',
    reviewCriteria: '',
    keyPersonDependency: '',
    dependencyDescription: '',
    taskToEliminate: '',
    eliminationReason: '',
    risk: {
      personalData: '',
      financialData: '',
      customerData: '',
      employeeData: '',
      confidentialData: '',
    },
    additionalNotes: '',
  }
}

export const EMPTY_CONTACT: ContactData = {
  responsibleName: '',
  whatsapp: '',
  email: '',
  consent: false,
}
