// Etapa 1 — Mapa da empresa (SPEC V3 §6, mantendo a base da V2 §5)

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

/** Máximo de áreas investigadas: 1 prioritária + até 2 complementares (SPEC V3 §4). */
export const MAX_AREAS = 3

export const YES_NO_UNKNOWN = ['Sim', 'Não', 'Não sei'] as const
export type YesNoUnknown = (typeof YES_NO_UNKNOWN)[number]

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

export const TOOL_OPTIONS = [
  'Excel',
  'Google Planilhas',
  'Word',
  'E-mail',
  'WhatsApp',
  'Google Drive',
  'ERP',
  'CRM',
  'Sistema interno',
  'Sistema específico da empresa',
  'Documentos físicos',
  'Outro',
] as const
export type ToolOption = (typeof TOOL_OPTIONS)[number]

export const REWORK_CAUSES = [
  'erro',
  'informação incompleta',
  'informação alterada',
  'falta de padrão',
  'comunicação',
  'conferência',
  'outro',
] as const
export type ReworkCause = (typeof REWORK_CAUSES)[number]

export const PREVIOUS_ATTEMPT_OPTIONS = [
  'Não',
  'Sim, mas não funcionou',
  'Sim, parcialmente',
  'Já funciona, mas ainda apresenta problemas',
  'Não sei',
] as const
export type PreviousAttemptOption = (typeof PREVIOUS_ATTEMPT_OPTIONS)[number]

export const IMPACT_OPTIONS = [
  'retrabalho',
  'atraso',
  'perda de prazo',
  'atraso para cliente',
  'reclamações',
  'perda de produtividade',
  'necessidade de conferência',
  'impacto financeiro',
  'outro',
  'pouco impacto',
] as const
export type ImpactOption = (typeof IMPACT_OPTIONS)[number]

export const WRITING_STANDARDIZATION_OPTIONS = [
  'Praticamente sempre iguais',
  'Precisam ser personalizados',
  'Uma mistura dos dois',
] as const
export type WritingStandardizationOption = (typeof WRITING_STANDARDIZATION_OPTIONS)[number]

export const INFORMATION_CONCENTRATION_OPTIONS = [
  'Concentradas em um só lugar',
  'Espalhadas em vários lugares',
] as const
export type InformationConcentrationOption = (typeof INFORMATION_CONCENTRATION_OPTIONS)[number]

/** Mapa da empresa — Etapa 1 (SPEC V3 §6). */
export type CompanyMap = {
  companyName: string
  segment: Segment | ''
  segmentOther?: string
  employeeRange: EmployeeRange | ''
  /** Áreas existentes na empresa, incluindo rótulos personalizados — pool para a escolha das áreas a investigar. */
  areas: string[]
  mainBusinessActivity: string
}

/** Papel da área na entrevista: a primeira é sempre a prioritária (SPEC V3 §4). */
export type AreaRole = 'PRIORITARIA' | 'COMPLEMENTAR'

/** Profundidade da entrevista de uma área complementar. A prioritária é sempre APROFUNDADA (SPEC V3 §4). */
export type AreaDepth = 'RAPIDA' | 'APROFUNDADA'

/** Dimensionamento quantitativo da tarefa escolhida pelo próprio usuário (SPEC V3 §7). */
export type QuantitativeSizing = {
  /** Rótulo da tarefa escolhida para dimensionar (texto livre ou copiado de uma resposta anterior). */
  taskLabel: string
  /** Campo de origem, quando a tarefa veio de uma resposta anterior — para rastreabilidade. */
  sourceField?: string
  peopleCount?: number
  executionFrequency?: TransferFrequency | ''
  minutesPerExecution?: number
  /** number, null quando o usuário não sabe, undefined quando não perguntado. */
  monthlyExecutions?: number | null
  executionVariation?: string
  hasSeasonalPeak?: YesNoUnknown | ''
  seasonalPeakDescription?: string
}

/** Sinalização de risco de dados de uma área (SPEC V3 §6, Bloco O — somente no modo aprofundado). */
export type AreaRiskAnswers = {
  personalData: YesNoUnknown | ''
  financialData: YesNoUnknown | ''
  customerData: YesNoUnknown | ''
  employeeData: YesNoUnknown | ''
  confidentialData: YesNoUnknown | ''
}

/**
 * Entrevista de uma área (SPEC V3 §6, §8, §9). O mesmo tipo cobre os dois modos:
 * modo rápido preenche apenas um subconjunto de campos (10 perguntas fixas);
 * modo aprofundado preenche os blocos A–O completos. `depth` indica qual foi usado.
 */
export type AreaInterview = {
  area: string
  role: AreaRole
  depth: AreaDepth

  // ---- Campos comuns aos dois modos ----

  /** "Quais são as principais tarefas realizadas nessa área?" — Q1 rápido / Bloco B aprofundado. */
  mainTasks: string
  /** "Qual tarefa mais consome tempo?" — Q2 rápido / Bloco B aprofundado. */
  mostTimeConsumingTask: string
  /** "Se você pudesse eliminar ou simplificar uma tarefa amanhã, qual seria?" — Q3 rápido / Bloco B aprofundado (pergunta unificada, SPEC V3 §5). */
  taskToEliminate: string
  /** "Por que justamente essa tarefa?" — somente aprofundado. */
  eliminationReason?: string

  /** "Como essa tarefa é feita atualmente?" — Q4 rápido (versão resumida do Bloco C). */
  currentProcessSummary: string

  /** "Quais ferramentas ou sistemas são utilizados?" — Q5 rápido / Bloco D aprofundado. */
  tools: ToolOption[]
  toolsOther?: string
  /** Somente aprofundado. */
  toolsExchangeInfo?: YesNoUnknown | ''
  toolsExchangeDescription?: string

  /** "Existe transferência manual de informações?" — Q6 rápido (gate) / Bloco E aprofundado (gate + desdobramentos). */
  hasInformationTransfer: YesNoUnknown | ''
  informationSource?: string
  informationDestination?: string
  informationTransferWho?: string
  informationTransferFrequency?: TransferFrequency | ''
  informationTransferManualEntry?: YesNoUnknown | ''
  informationTransferReview?: YesNoUnknown | ''

  /** "Existe retrabalho ou erro?" — Q7 rápido (gate combinado, não usado no modo aprofundado). */
  hasReworkOrErrors?: YesNoUnknown | ''

  /** "Alguma pessoa é indispensável para esse processo?" — Q8 rápido (gate) / Bloco K aprofundado (gate + desdobramentos). */
  keyPersonDependency: YesNoUnknown | ''
  dependencyProcess?: string
  dependencyDescription?: string

  /** "Existem documentos envolvidos?" — Q9 rápido (gate) / Bloco F aprofundado (gate + desdobramentos). */
  hasDocuments: YesNoUnknown | ''
  documentTypes?: string
  documentArrival?: string
  someoneReadsDocuments?: YesNoUnknown | ''
  documentExtraction?: string
  documentDataEntryAfter?: YesNoUnknown | ''
  documentReview?: YesNoUnknown | ''
  documentVolume?: string

  /** "Existe alguma observação importante?" — Q10 rápido / campo comum. */
  additionalNotes?: string

  // ---- Somente modo aprofundado ----

  // Bloco A — Rotina
  dailyRepetitiveTasks?: string
  weeklyRepetitiveTasks?: string
  monthlyRepetitiveTasks?: string
  multipleTimesPerDay?: string

  // Bloco C — Como o processo funciona hoje
  processStart?: string
  processSteps?: string
  processPeople?: string
  processManualWork?: string
  processDecisions?: string
  processEnd?: string
  processResult?: string

  // Bloco G — Escrita repetitiva
  hasRepeatedWriting?: YesNoUnknown | ''
  writingContent?: string
  writingStandardization?: WritingStandardizationOption | ''
  writingWho?: string
  writingFrequency?: TransferFrequency | ''

  // Bloco H — Pesquisa e busca de informação
  hasInformationSearch?: YesNoUnknown | ''
  searchWhat?: string
  searchWhere?: string
  searchTime?: SearchTime | ''
  searchWho?: string
  searchConcentration?: InformationConcentrationOption | ''
  searchAskOthers?: YesNoUnknown | ''

  // Bloco I — Retrabalho
  reworkTasks?: string
  reworkCause?: ReworkCause[]
  reworkCauseOther?: string

  // Bloco J — Erros e conferências
  errorProcesses?: string
  errorType?: string
  errorFrequency?: TransferFrequency | ''
  errorDiscovery?: string
  errorConsequence?: string
  reviewTasks?: string
  reviewWhat?: string
  reviewWho?: string

  // Bloco L — Tentativas anteriores
  previousAttempts?: PreviousAttemptOption | ''
  previousAttemptsWhat?: string
  previousAttemptsWhyNotSolved?: string

  // Bloco M — Impacto
  impact?: ImpactOption[]
  impactOther?: string

  // Bloco N — Resultado final
  finalResult?: string

  // Bloco O — Dados e segurança
  risk?: AreaRiskAnswers

  // Dimensionamento (SPEC V3 §7) — escolhido pelo usuário, não automático
  quantitativeSizing?: QuantitativeSizing
  hourlyCost?: number
}

export type ContactData = {
  responsibleName: string
  whatsapp: string
  email?: string
  consent: boolean
}

/**
 * Modo de diagnóstico escolhido na landing page (SPEC — Escolha do tipo de diagnóstico).
 * "quick": uma única área, entrevista rápida, sem dimensionamento, sem oferecer área 2/3.
 * "complete": fluxo já existente — área 1 obrigatória e aprofundada, até 2 áreas complementares
 * opcionais (rápida ou aprofundada), com dimensionamento.
 */
export type DiagnosticMode = 'quick' | 'complete'

/** Payload agrupado enviado para POST /api/diagnostico (SPEC V3 §6, §11). */
export type DiagnosticRequest = {
  diagnosticMode: DiagnosticMode
  company: {
    companyName: string
    segment: Segment
    segmentOther?: string
    employeeRange: EmployeeRange
    mainBusinessActivity: string
  }
  /** Todas as áreas existentes na empresa (pool de escolha). */
  areas: string[]
  /** 1 entrevista no modo rápido; 1 a 3 no modo completo — a primeira é sempre role="PRIORITARIA". */
  interviews: AreaInterview[]
  contact: ContactData
}
