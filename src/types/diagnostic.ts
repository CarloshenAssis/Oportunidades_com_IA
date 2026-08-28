// Etapa 1 — Mapa da empresa (SPEC V2 §5)

export const SEGMENTS = [
  'Comércio',
  'Serviços',
  'Indústria',
  'Contabilidade',
  'Imobiliária',
  'Saúde',
  'Educação',
  'Construção',
  'Automotivo',
  'Alimentação',
  'Logística',
  'Tecnologia',
  'Consultoria',
  'Outro',
] as const

export type Segment = (typeof SEGMENTS)[number]

export const EMPLOYEE_RANGES = ['1–5', '6–10', '11–20', '21–50', '51–100', 'Mais de 100'] as const

export type EmployeeRange = (typeof EMPLOYEE_RANGES)[number]

export const AREAS = [
  'Administrativo',
  'Financeiro',
  'Comercial',
  'Marketing',
  'Atendimento',
  'RH',
  'Operações',
  'Compras',
  'Logística',
  'Contabilidade',
  'Jurídico',
  'Gestão',
  'Tecnologia',
  'Pós-venda',
  'Outra',
] as const

export type PredefinedArea = (typeof AREAS)[number]

/** Máximo de áreas prioritárias investigadas em profundidade (SPEC V2 §6). */
export const MAX_PRIORITY_AREAS = 3

export const YES_NO_UNKNOWN = ['Sim', 'Não', 'Não sei'] as const
export type YesNoUnknown = (typeof YES_NO_UNKNOWN)[number]

export const YES_NO_SOMETIMES = ['Sim', 'Não', 'Às vezes'] as const
export type YesNoSometimes = (typeof YES_NO_SOMETIMES)[number]

export const TRANSFER_FREQUENCY_OPTIONS = [
  'algumas vezes por mês',
  'algumas vezes por semana',
  'diariamente',
  'várias vezes ao dia',
  'não sei',
] as const
export type TransferFrequency = (typeof TRANSFER_FREQUENCY_OPTIONS)[number]

export const SEARCH_TIME_OPTIONS = [
  'menos de 5 minutos',
  '5–15 minutos',
  '15–30 minutos',
  'mais de 30 minutos',
  'não sei',
] as const
export type SearchTime = (typeof SEARCH_TIME_OPTIONS)[number]

export const INFORMATION_SOURCES = [
  'Excel',
  'Google Drive',
  'sistema interno',
  'ERP',
  'CRM',
  'e-mail',
  'WhatsApp',
  'documentos PDF',
  'site',
  'conhecimento de uma pessoa',
  'outro',
] as const
export type InformationSource = (typeof INFORMATION_SOURCES)[number]

export const REWORK_REASONS = [
  'informação incompleta',
  'erro de digitação',
  'falta de padronização',
  'comunicação',
  'sistema',
  'conferência',
  'mudança de informação',
  'outro',
] as const
export type ReworkReason = (typeof REWORK_REASONS)[number]

export type PriorityAreaSelection = {
  area: string
  /** SPEC V2 §5.6 — areaReason: por que essa área consome tanto tempo. */
  reason: string
}

/** Mapa da empresa — Etapa 1 da entrevista (SPEC V2 §5). */
export type CompanyMap = {
  companyName: string
  segment: Segment | ''
  segmentOther?: string
  employeeRange: EmployeeRange | ''
  /** Áreas existentes na empresa, incluindo rótulos personalizados. */
  areas: string[]
  mainBusinessActivity: string
  /** No máximo MAX_PRIORITY_AREAS (SPEC V2 §6). */
  priorityAreas: PriorityAreaSelection[]
}

/** Dimensionamento quantitativo de uma tarefa candidata (SPEC V2 §18). */
export type QuantitativeSizing = {
  /** Campo do bloco de origem da tarefa dimensionada, para rastreabilidade. */
  sourceField: string
  taskLabel: string
  peopleCount?: number
  executionFrequency?: TransferFrequency | ''
  minutesPerExecution?: number
  executionVariation?: string
  /** number, null quando o usuário não sabe, undefined quando não perguntado. */
  monthlyExecutions?: number | null
}

/** Sinalização de risco de dados de uma área (SPEC V2 §28). */
export type AreaRiskAnswers = {
  personalData: YesNoUnknown | ''
  financialData: YesNoUnknown | ''
  customerData: YesNoUnknown | ''
  employeeData: YesNoUnknown | ''
  confidentialData: YesNoUnknown | ''
}

/** Entrevista profunda de uma área prioritária — blocos A a K (SPEC V2 §7-§17). */
export type AreaInterview = {
  area: string

  // Bloco A — Repetição
  dailyRepetitiveTasks: string
  weeklyRepetitiveTasks: string
  monthlyRepetitiveTasks: string

  // Bloco B — Tempo e dor
  mostTimeConsumingTask: string
  taskTheyWouldEliminate: string
  taskPainReason?: string

  // Bloco C — Transferência de informação
  copyPasteTasks: string
  informationTransfer?: string
  transferFrequency?: TransferFrequency | ''

  // Bloco D — Documentos
  documentTasks: string
  documentExtraction?: string
  documentDataEntry?: YesNoSometimes | ''

  // Bloco E — Texto e comunicação
  repeatedWritingTasks: string
  writingVariation?: string

  // Bloco F — Pesquisa e informação
  informationSearchTasks: string
  informationSources?: InformationSource[]
  informationSearchTime?: SearchTime | ''

  // Bloco G — Retrabalho
  reworkProcess: string
  reworkReason?: ReworkReason[]

  // Bloco H — Erros
  errorProneTasks: string
  errorConsequence?: string

  // Bloco I — Conferência
  manualReviewTasks: string
  reviewCriteria?: string

  // Bloco J — Dependência de pessoas
  keyPersonDependency: YesNoUnknown | ''
  dependencyDescription?: string

  // Bloco K — Eliminação
  taskToEliminate: string
  eliminationReason?: string

  // Risco de dados da área (SPEC V2 §28)
  risk: AreaRiskAnswers

  // Dimensionamento quantitativo da tarefa candidata mais forte da área (SPEC V2 §18, §25)
  quantitativeSizing?: QuantitativeSizing
  /** Custo aproximado da hora, opcional, para estimativa gerencial (SPEC V2 §26). */
  hourlyCost?: number
  /** Observações adicionais sobre esta área, opcional. */
  additionalNotes?: string
}

export type ContactData = {
  responsibleName: string
  whatsapp: string
  email?: string
  consent: boolean
}

/** Payload agrupado enviado para POST /api/diagnostico (SPEC V2 §58). */
export type DiagnosticRequest = {
  company: {
    companyName: string
    segment: Segment
    segmentOther?: string
    employeeRange: EmployeeRange
    mainBusinessActivity: string
  }
  areas: string[]
  priorityAreas: PriorityAreaSelection[]
  interviews: AreaInterview[]
  contact: ContactData
}
