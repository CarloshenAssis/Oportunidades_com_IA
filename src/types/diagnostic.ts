// Etapa 1 — Empresa

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

// Etapa 3 — Problemas

export const YES_NO_UNKNOWN = ['Sim', 'Não', 'Não sei'] as const

export type YesNoUnknown = (typeof YES_NO_UNKNOWN)[number]

// Etapa 4 — Tecnologia

export const TOOLS = [
  'WhatsApp',
  'Excel',
  'Google Sheets',
  'Google Drive',
  'Microsoft Office',
  'E-mail',
  'CRM',
  'ERP',
  'Sistema próprio',
  'Outro',
] as const

export type Tool = (typeof TOOLS)[number]

export const AI_MATURITY_OPTIONS = [
  'Não utilizamos',
  'Utilizamos pouco',
  'Utilizamos regularmente',
  'Utilizamos bastante',
  'Não sei',
] as const

export type AIMaturityOption = (typeof AI_MATURITY_OPTIONS)[number]

// Modelo de dados do formulário (SPEC.md §14)

export type DiagnosticFormData = {
  companyName: string
  segment: Segment | ''
  segmentOther?: string
  employeeRange: EmployeeRange | ''

  mainActivities: string
  repetitiveTasks: string
  timeConsumingTasks: string

  rework: string
  manualProcesses: string
  errors: string
  peopleDependency: YesNoUnknown | ''
  peopleDependencyDescription?: string

  tools: Tool[]
  aiMaturity: AIMaturityOption | ''
  technologyNotes?: string

  whatsapp: string
  email?: string
  consent: boolean
}

// Payload agrupado enviado para POST /api/diagnostico (SPEC.md §17)

export type DiagnosticRequest = {
  company: {
    companyName: string
    segment: Segment
    segmentOther?: string
    employeeRange: EmployeeRange
  }
  operation: {
    mainActivities: string
    repetitiveTasks: string
    timeConsumingTasks: string
  }
  problems: {
    rework: string
    manualProcesses: string
    errors: string
    peopleDependency: YesNoUnknown
    peopleDependencyDescription?: string
  }
  technology: {
    tools: Tool[]
    aiMaturity: AIMaturityOption
    technologyNotes?: string
  }
  contact: {
    whatsapp: string
    email?: string
    consent: boolean
  }
}
