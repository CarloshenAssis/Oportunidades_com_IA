import { z } from 'zod'
import { FIELD_LIMITS } from '@/lib/config/limits'
import { normalizePhoneToDigits, isValidPhoneDigits } from '@/lib/whatsapp/message'
import {
  EMPLOYEE_RANGES,
  IMPACT_OPTIONS,
  INFORMATION_CONCENTRATION_OPTIONS,
  MAX_AREAS,
  PREVIOUS_ATTEMPT_OPTIONS,
  REWORK_CAUSES,
  SEARCH_TIME_OPTIONS,
  SEGMENTS,
  TOOL_OPTIONS,
  TRANSFER_FREQUENCY_OPTIONS,
  WRITING_STANDARDIZATION_OPTIONS,
  YES_NO_UNKNOWN,
  type AreaDepth,
  type AreaInterview,
  type AreaRole,
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
 * mas cujo conteúdo pode ficar em branco — a entrevista nunca obriga o
 * usuário a inventar uma tarefa (SPEC V3 §24).
 */
const blankableText = (max: number) => z.string().trim().max(max, `Máximo de ${max} caracteres.`)

/** Pergunta de sim/não/não sei opcional no schema — a obrigatoriedade real é aplicada por etapa (ver questions.ts). */
const optionalGate = () => z.enum(YES_NO_UNKNOWN).optional().or(z.literal(''))

/**
 * Pergunta de sim/não/não sei presente nos dois modos (rápido e aprofundado) — o campo em si
 * nunca fica ausente no tipo `AreaInterview` (pode ficar `''`, mas a chave sempre existe).
 */
const requiredGate = () => z.enum(YES_NO_UNKNOWN).or(z.literal(''))

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

const areaRiskSchema = z.object({
  personalData: z.enum(YES_NO_UNKNOWN, { message: 'Selecione uma opção.' }),
  financialData: z.enum(YES_NO_UNKNOWN, { message: 'Selecione uma opção.' }),
  customerData: z.enum(YES_NO_UNKNOWN, { message: 'Selecione uma opção.' }),
  employeeData: z.enum(YES_NO_UNKNOWN, { message: 'Selecione uma opção.' }),
  confidentialData: z.enum(YES_NO_UNKNOWN, { message: 'Selecione uma opção.' }),
})

const quantitativeSizingSchema = z.object({
  // Escolher uma tarefa é opcional (SPEC V3 §7) — o usuário pode preencher outros
  // campos de dimensionamento (ex.: pico sazonal) sem ter escolhido uma tarefa.
  taskLabel: blankableText(FIELD_LIMITS.longAnswer),
  sourceField: optionalText(FIELD_LIMITS.areaName),
  peopleCount: z.number().positive().max(100_000).optional(),
  executionFrequency: z.enum(TRANSFER_FREQUENCY_OPTIONS).optional().or(z.literal('')),
  minutesPerExecution: z.number().positive().max(100_000).optional(),
  monthlyExecutions: z.number().nonnegative().max(1_000_000).nullable().optional(),
  executionVariation: optionalText(FIELD_LIMITS.shortAnswer),
  hasSeasonalPeak: optionalGate(),
  seasonalPeakDescription: optionalText(FIELD_LIMITS.shortAnswer),
})

export const areaInterviewSchema = z
  .object({
    area: requiredText(FIELD_LIMITS.areaName),
    role: z.enum(['PRIORITARIA', 'COMPLEMENTAR']),
    depth: z.enum(['RAPIDA', 'APROFUNDADA']),

    // Campos comuns (rápido + aprofundado)
    mainTasks: blankableText(FIELD_LIMITS.longAnswer),
    mostTimeConsumingTask: blankableText(FIELD_LIMITS.longAnswer),
    taskToEliminate: blankableText(FIELD_LIMITS.longAnswer),
    eliminationReason: optionalText(FIELD_LIMITS.shortAnswer),

    currentProcessSummary: blankableText(FIELD_LIMITS.longAnswer),

    tools: z.array(z.enum(TOOL_OPTIONS)),
    toolsOther: optionalText(FIELD_LIMITS.shortAnswer),
    toolsExchangeInfo: optionalGate(),
    toolsExchangeDescription: optionalText(FIELD_LIMITS.shortAnswer),

    hasInformationTransfer: requiredGate(),
    informationSource: optionalText(FIELD_LIMITS.shortAnswer),
    informationDestination: optionalText(FIELD_LIMITS.shortAnswer),
    informationTransferWho: optionalText(FIELD_LIMITS.shortAnswer),
    informationTransferFrequency: z.enum(TRANSFER_FREQUENCY_OPTIONS).optional().or(z.literal('')),
    informationTransferManualEntry: optionalGate(),
    informationTransferReview: optionalGate(),

    hasReworkOrErrors: optionalGate(),

    keyPersonDependency: requiredGate(),
    dependencyProcess: optionalText(FIELD_LIMITS.shortAnswer),
    dependencyDescription: optionalText(FIELD_LIMITS.shortAnswer),

    hasDocuments: requiredGate(),
    documentTypes: optionalText(FIELD_LIMITS.shortAnswer),
    documentArrival: optionalText(FIELD_LIMITS.shortAnswer),
    someoneReadsDocuments: optionalGate(),
    documentExtraction: optionalText(FIELD_LIMITS.shortAnswer),
    documentDataEntryAfter: optionalGate(),
    documentReview: optionalGate(),
    documentVolume: optionalText(FIELD_LIMITS.shortAnswer),

    additionalNotes: optionalText(FIELD_LIMITS.additionalNotes),

    // Somente modo aprofundado
    dailyRepetitiveTasks: optionalText(FIELD_LIMITS.longAnswer),
    weeklyRepetitiveTasks: optionalText(FIELD_LIMITS.longAnswer),
    monthlyRepetitiveTasks: optionalText(FIELD_LIMITS.longAnswer),
    multipleTimesPerDay: optionalText(FIELD_LIMITS.longAnswer),

    processStart: optionalText(FIELD_LIMITS.longAnswer),
    processSteps: optionalText(FIELD_LIMITS.longAnswer),
    processPeople: optionalText(FIELD_LIMITS.shortAnswer),
    processManualWork: optionalText(FIELD_LIMITS.longAnswer),
    processDecisions: optionalText(FIELD_LIMITS.longAnswer),
    processEnd: optionalText(FIELD_LIMITS.shortAnswer),
    processResult: optionalText(FIELD_LIMITS.shortAnswer),

    hasRepeatedWriting: optionalGate(),
    writingContent: optionalText(FIELD_LIMITS.shortAnswer),
    writingStandardization: z.enum(WRITING_STANDARDIZATION_OPTIONS).optional().or(z.literal('')),
    writingWho: optionalText(FIELD_LIMITS.shortAnswer),
    writingFrequency: z.enum(TRANSFER_FREQUENCY_OPTIONS).optional().or(z.literal('')),

    hasInformationSearch: optionalGate(),
    searchWhat: optionalText(FIELD_LIMITS.shortAnswer),
    searchWhere: optionalText(FIELD_LIMITS.shortAnswer),
    searchTime: z.enum(SEARCH_TIME_OPTIONS).optional().or(z.literal('')),
    searchWho: optionalText(FIELD_LIMITS.shortAnswer),
    searchConcentration: z.enum(INFORMATION_CONCENTRATION_OPTIONS).optional().or(z.literal('')),
    searchAskOthers: optionalGate(),

    reworkTasks: optionalText(FIELD_LIMITS.longAnswer),
    reworkCause: z.array(z.enum(REWORK_CAUSES)).optional(),
    reworkCauseOther: optionalText(FIELD_LIMITS.shortAnswer),

    errorProcesses: optionalText(FIELD_LIMITS.longAnswer),
    errorType: optionalText(FIELD_LIMITS.shortAnswer),
    errorFrequency: z.enum(TRANSFER_FREQUENCY_OPTIONS).optional().or(z.literal('')),
    errorDiscovery: optionalText(FIELD_LIMITS.shortAnswer),
    errorConsequence: optionalText(FIELD_LIMITS.shortAnswer),
    reviewTasks: optionalText(FIELD_LIMITS.longAnswer),
    reviewWhat: optionalText(FIELD_LIMITS.shortAnswer),
    reviewWho: optionalText(FIELD_LIMITS.shortAnswer),

    previousAttempts: z.enum(PREVIOUS_ATTEMPT_OPTIONS).optional().or(z.literal('')),
    previousAttemptsWhat: optionalText(FIELD_LIMITS.shortAnswer),
    previousAttemptsWhyNotSolved: optionalText(FIELD_LIMITS.shortAnswer),

    impact: z.array(z.enum(IMPACT_OPTIONS)).optional(),
    impactOther: optionalText(FIELD_LIMITS.shortAnswer),

    finalResult: optionalText(FIELD_LIMITS.longAnswer),

    risk: areaRiskSchema.optional(),

    quantitativeSizing: quantitativeSizingSchema.optional(),
    hourlyCost: z.number().positive().max(1_000_000).optional(),
  })
  .refine((data) => data.keyPersonDependency !== 'Sim' || !!data.dependencyProcess?.trim(), {
    message: 'Descreva qual processo depende dessa pessoa.',
    path: ['dependencyProcess'],
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
    interviews: z
      .array(areaInterviewSchema)
      .min(1, 'A área prioritária é obrigatória.')
      .max(MAX_AREAS, `No máximo ${MAX_AREAS} áreas podem ser investigadas.`),
    contact: contactSchema,
  })
  .superRefine((data, ctx) => {
    const areaSet = new Set(data.areas)
    data.interviews.forEach((interview, index) => {
      if (!areaSet.has(interview.area)) {
        ctx.addIssue({
          code: 'custom',
          message: 'A área da entrevista precisa estar entre as áreas selecionadas.',
          path: ['interviews', index, 'area'],
        })
      }
    })

    const [first, ...rest] = data.interviews
    if (first && (first.role !== 'PRIORITARIA' || first.depth !== 'APROFUNDADA')) {
      ctx.addIssue({
        code: 'custom',
        message: 'A primeira área precisa ser a prioritária, sempre com entrevista aprofundada.',
        path: ['interviews', 0, 'role'],
      })
    }
    rest.forEach((interview, index) => {
      if (interview.role !== 'COMPLEMENTAR') {
        ctx.addIssue({
          code: 'custom',
          message: 'Áreas além da primeira precisam ser complementares.',
          path: ['interviews', index + 1, 'role'],
        })
      }
    })

    const areaNames = data.interviews.map((interview) => interview.area)
    const hasDuplicate = areaNames.some((area, index) => areaNames.indexOf(area) !== index)
    if (hasDuplicate) {
      ctx.addIssue({ code: 'custom', message: 'Uma área não pode ser analisada duas vezes.', path: ['interviews'] })
    }
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

/** Valida o payload completo e devolve o objeto pronto para POST /api/diagnostico (SPEC V3 §6, §11). */
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
}

export function createEmptyAreaInterview(area: string, role: AreaRole, depth: AreaDepth): AreaInterview {
  return {
    area,
    role,
    depth,

    mainTasks: '',
    mostTimeConsumingTask: '',
    taskToEliminate: '',
    eliminationReason: '',

    currentProcessSummary: '',

    tools: [],
    toolsOther: '',
    toolsExchangeInfo: '',
    toolsExchangeDescription: '',

    hasInformationTransfer: '',
    informationSource: '',
    informationDestination: '',
    informationTransferWho: '',
    informationTransferFrequency: '',
    informationTransferManualEntry: '',
    informationTransferReview: '',

    hasReworkOrErrors: '',

    keyPersonDependency: '',
    dependencyProcess: '',
    dependencyDescription: '',

    hasDocuments: '',
    documentTypes: '',
    documentArrival: '',
    someoneReadsDocuments: '',
    documentExtraction: '',
    documentDataEntryAfter: '',
    documentReview: '',
    documentVolume: '',

    additionalNotes: '',

    dailyRepetitiveTasks: '',
    weeklyRepetitiveTasks: '',
    monthlyRepetitiveTasks: '',
    multipleTimesPerDay: '',

    processStart: '',
    processSteps: '',
    processPeople: '',
    processManualWork: '',
    processDecisions: '',
    processEnd: '',
    processResult: '',

    hasRepeatedWriting: '',
    writingContent: '',
    writingStandardization: '',
    writingWho: '',
    writingFrequency: '',

    hasInformationSearch: '',
    searchWhat: '',
    searchWhere: '',
    searchTime: '',
    searchWho: '',
    searchConcentration: '',
    searchAskOthers: '',

    reworkTasks: '',
    reworkCause: [],
    reworkCauseOther: '',

    errorProcesses: '',
    errorType: '',
    errorFrequency: '',
    errorDiscovery: '',
    errorConsequence: '',
    reviewTasks: '',
    reviewWhat: '',
    reviewWho: '',

    previousAttempts: '',
    previousAttemptsWhat: '',
    previousAttemptsWhyNotSolved: '',

    impact: [],
    impactOther: '',

    finalResult: '',

    risk:
      depth === 'APROFUNDADA'
        ? {
            personalData: '',
            financialData: '',
            customerData: '',
            employeeData: '',
            confidentialData: '',
          }
        : undefined,
  }
}

export const EMPTY_CONTACT: ContactData = {
  responsibleName: '',
  whatsapp: '',
  email: '',
  consent: false,
}
