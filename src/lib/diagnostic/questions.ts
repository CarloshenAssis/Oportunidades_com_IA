import type { AreaInterview, AreaRiskAnswers } from '@/types/diagnostic'
import {
  INFORMATION_SOURCES,
  REWORK_REASONS,
  SEARCH_TIME_OPTIONS,
  TRANSFER_FREQUENCY_OPTIONS,
  YES_NO_SOMETIMES,
  YES_NO_UNKNOWN,
} from '@/types/diagnostic'
import { isFollowUpWorthy } from './normalize'

export type QuestionFieldType = 'textarea' | 'select' | 'multiselect' | 'radio'

/** Campo simples de AreaInterview, ou caminho aninhado dentro de `risk` (ex.: "risk.personalData"). */
export type QuestionFieldPath = keyof AreaInterview | `risk.${keyof AreaRiskAnswers}`

export type QuestionDef = {
  field: QuestionFieldPath
  prompt: string
  type: QuestionFieldType
  options?: readonly string[]
  placeholder?: string
  helpText?: string
  maxLength?: number
  /** Perguntas de classificação rápida (rádio) que devem ser respondidas para avançar. Blocos de texto nunca são obrigatórios (SPEC V2 §55). */
  required?: boolean
}

export type InterviewStep = {
  id: string
  block: string
  questions: QuestionDef[]
  /** Mostrar esta etapa somente quando a condição sobre as respostas já dadas for verdadeira (SPEC V2 §50). */
  condition?: (interview: Partial<AreaInterview>) => boolean
}

const MAX_TEXT = 1500
const MAX_SHORT_TEXT = 500

/** Entrevista de processos por área — blocos A a K + risco de dados (SPEC V2 §7–§17, §28). */
export const AREA_INTERVIEW_STEPS: InterviewStep[] = [
  {
    id: 'A',
    block: 'Repetição',
    questions: [
      {
        field: 'dailyRepetitiveTasks',
        prompt: 'O que essa área faz repetidamente todos os dias?',
        type: 'textarea',
        maxLength: MAX_TEXT,
      },
      {
        field: 'weeklyRepetitiveTasks',
        prompt: 'O que essa área faz repetidamente toda semana?',
        type: 'textarea',
        maxLength: MAX_TEXT,
      },
      {
        field: 'monthlyRepetitiveTasks',
        prompt: 'O que essa área faz repetidamente todo mês?',
        type: 'textarea',
        maxLength: MAX_TEXT,
      },
    ],
  },
  {
    id: 'B1',
    block: 'Tempo e dor',
    questions: [
      { field: 'mostTimeConsumingTask', prompt: 'Qual tarefa mais toma tempo dessa área?', type: 'textarea', maxLength: MAX_TEXT },
      {
        field: 'taskTheyWouldEliminate',
        prompt: 'Qual tarefa você gostaria de não precisar fazer?',
        type: 'textarea',
        maxLength: MAX_TEXT,
      },
    ],
  },
  {
    id: 'B2',
    block: 'Tempo e dor',
    condition: (interview) => isFollowUpWorthy(interview.taskTheyWouldEliminate),
    questions: [
      { field: 'taskPainReason', prompt: 'Por que essa tarefa incomoda tanto?', type: 'textarea', maxLength: MAX_SHORT_TEXT },
    ],
  },
  {
    id: 'C1',
    block: 'Transferência de informação',
    questions: [
      {
        field: 'copyPasteTasks',
        prompt: 'Qual tarefa exige copiar informações de um lugar para outro?',
        type: 'textarea',
        maxLength: MAX_TEXT,
        helpText: 'Exemplos: Excel → sistema, e-mail → planilha, WhatsApp → CRM, PDF → sistema.',
      },
    ],
  },
  {
    id: 'C2',
    block: 'Transferência de informação',
    condition: (interview) => isFollowUpWorthy(interview.copyPasteTasks),
    questions: [
      {
        field: 'informationTransfer',
        prompt: 'De onde a informação vem e para onde ela precisa ir?',
        type: 'textarea',
        maxLength: MAX_SHORT_TEXT,
      },
      {
        field: 'transferFrequency',
        prompt: 'Quantas vezes aproximadamente isso acontece?',
        type: 'select',
        options: TRANSFER_FREQUENCY_OPTIONS,
      },
    ],
  },
  {
    id: 'D1',
    block: 'Documentos',
    questions: [
      {
        field: 'documentTasks',
        prompt: 'Qual tarefa exige ler muitos documentos, PDFs, contratos, notas ou relatórios?',
        type: 'textarea',
        maxLength: MAX_TEXT,
      },
    ],
  },
  {
    id: 'D2',
    block: 'Documentos',
    condition: (interview) => isFollowUpWorthy(interview.documentTasks),
    questions: [
      {
        field: 'documentExtraction',
        prompt: 'O que vocês precisam encontrar ou retirar desses documentos?',
        type: 'textarea',
        maxLength: MAX_SHORT_TEXT,
      },
      {
        field: 'documentDataEntry',
        prompt: 'Depois de encontrar essa informação, alguém precisa digitá-la ou transferi-la para outro lugar?',
        type: 'radio',
        options: YES_NO_SOMETIMES,
      },
    ],
  },
  {
    id: 'E1',
    block: 'Texto e comunicação',
    questions: [
      {
        field: 'repeatedWritingTasks',
        prompt: 'Qual tarefa exige escrever praticamente a mesma coisa várias vezes?',
        type: 'textarea',
        maxLength: MAX_TEXT,
        helpText: 'Exemplos: propostas, e-mails, mensagens, relatórios, comunicados, respostas.',
      },
    ],
  },
  {
    id: 'E2',
    block: 'Texto e comunicação',
    condition: (interview) => isFollowUpWorthy(interview.repeatedWritingTasks),
    questions: [
      {
        field: 'writingVariation',
        prompt: 'O que muda de uma vez para outra e o que permanece igual?',
        type: 'textarea',
        maxLength: MAX_SHORT_TEXT,
      },
    ],
  },
  {
    id: 'F1',
    block: 'Pesquisa e informação',
    questions: [
      {
        field: 'informationSearchTasks',
        prompt: 'Qual tarefa exige procurar informações antes de responder alguém?',
        type: 'textarea',
        maxLength: MAX_TEXT,
      },
    ],
  },
  {
    id: 'F2',
    block: 'Pesquisa e informação',
    condition: (interview) => isFollowUpWorthy(interview.informationSearchTasks),
    questions: [
      {
        field: 'informationSources',
        prompt: 'Onde essa informação costuma estar?',
        type: 'multiselect',
        options: INFORMATION_SOURCES,
      },
      {
        field: 'informationSearchTime',
        prompt: 'Quanto tempo aproximadamente é gasto procurando essa informação?',
        type: 'select',
        options: SEARCH_TIME_OPTIONS,
      },
    ],
  },
  {
    id: 'G1',
    block: 'Retrabalho',
    questions: [
      { field: 'reworkProcess', prompt: 'Qual processo costuma gerar mais retrabalho?', type: 'textarea', maxLength: MAX_TEXT },
    ],
  },
  {
    id: 'G2',
    block: 'Retrabalho',
    condition: (interview) => isFollowUpWorthy(interview.reworkProcess),
    questions: [
      { field: 'reworkReason', prompt: 'Por que esse retrabalho acontece?', type: 'multiselect', options: REWORK_REASONS },
    ],
  },
  {
    id: 'H1',
    block: 'Erros',
    questions: [
      {
        field: 'errorProneTasks',
        prompt: 'Onde acontecem mais erros, esquecimentos ou atrasos?',
        type: 'textarea',
        maxLength: MAX_TEXT,
      },
    ],
  },
  {
    id: 'H2',
    block: 'Erros',
    condition: (interview) => isFollowUpWorthy(interview.errorProneTasks),
    questions: [
      {
        field: 'errorConsequence',
        prompt: 'O que normalmente acontece quando esse erro ocorre?',
        type: 'textarea',
        maxLength: MAX_SHORT_TEXT,
      },
    ],
  },
  {
    id: 'I1',
    block: 'Conferência',
    questions: [
      {
        field: 'manualReviewTasks',
        prompt: 'Onde uma pessoa precisa conferir o trabalho que outra acabou de fazer?',
        type: 'textarea',
        maxLength: MAX_TEXT,
      },
    ],
  },
  {
    id: 'I2',
    block: 'Conferência',
    condition: (interview) => isFollowUpWorthy(interview.manualReviewTasks),
    questions: [
      { field: 'reviewCriteria', prompt: 'O que exatamente essa pessoa confere?', type: 'textarea', maxLength: MAX_SHORT_TEXT },
    ],
  },
  {
    id: 'J1',
    block: 'Dependência de pessoas',
    questions: [
      {
        field: 'keyPersonDependency',
        prompt: 'Qual processo depende demais de uma pessoa específica?',
        type: 'radio',
        options: YES_NO_UNKNOWN,
        required: true,
      },
    ],
  },
  {
    id: 'J2',
    block: 'Dependência de pessoas',
    condition: (interview) => interview.keyPersonDependency === 'Sim',
    questions: [
      {
        field: 'dependencyDescription',
        prompt: 'O que essa pessoa sabe ou faz que torna o processo dependente dela?',
        type: 'textarea',
        maxLength: MAX_SHORT_TEXT,
        required: true,
      },
    ],
  },
  {
    id: 'K1',
    block: 'Eliminação',
    questions: [
      {
        field: 'taskToEliminate',
        prompt: 'Se você pudesse eliminar uma tarefa dessa área amanhã, qual seria?',
        type: 'textarea',
        maxLength: MAX_TEXT,
      },
    ],
  },
  {
    id: 'K2',
    block: 'Eliminação',
    condition: (interview) => isFollowUpWorthy(interview.taskToEliminate),
    questions: [
      { field: 'eliminationReason', prompt: 'Por que escolheria justamente essa?', type: 'textarea', maxLength: MAX_SHORT_TEXT },
    ],
  },
  {
    id: 'RISK',
    block: 'Dados e risco',
    questions: [
      { field: 'risk.personalData', prompt: 'Essa área lida com dados pessoais?', type: 'radio', options: YES_NO_UNKNOWN, required: true },
      { field: 'risk.financialData', prompt: 'Lida com dados financeiros?', type: 'radio', options: YES_NO_UNKNOWN, required: true },
      { field: 'risk.customerData', prompt: 'Lida com dados de clientes?', type: 'radio', options: YES_NO_UNKNOWN, required: true },
      { field: 'risk.employeeData', prompt: 'Lida com dados de funcionários?', type: 'radio', options: YES_NO_UNKNOWN, required: true },
      {
        field: 'risk.confidentialData',
        prompt: 'Lida com informações confidenciais ou estratégicas?',
        type: 'radio',
        options: YES_NO_UNKNOWN,
        required: true,
      },
    ],
  },
  {
    id: 'NOTES',
    block: 'Observações',
    questions: [
      {
        field: 'additionalNotes',
        prompt: 'Alguma observação adicional sobre esta área? (opcional)',
        type: 'textarea',
        maxLength: MAX_SHORT_TEXT * 2,
      },
    ],
  },
]

/** Dicas por área, adaptadas do banco de perguntas do material original (SPEC V2 §52). */
export const AREA_HINTS: Record<string, string[]> = {
  Financeiro: [
    'Quais lançamentos são feitos manualmente?',
    'Onde há conferência entre sistemas?',
    'Quais relatórios são montados manualmente?',
    'Onde existem erros de digitação?',
    'Que informação é buscada antes de responder à gestão?',
  ],
  Comercial: [
    'Quantas propostas parecidas são feitas?',
    'Onde o vendedor procura informações?',
    'Quais dados são preenchidos manualmente?',
    'Quais follow-ups são repetitivos?',
    'Onde existe retrabalho entre vendas e outras áreas?',
  ],
  Atendimento: [
    'Quais perguntas mais se repetem?',
    'Quais respostas são praticamente iguais?',
    'Quais solicitações precisam ser direcionadas?',
    'Quanto tempo se perde procurando informação?',
    'Onde há retrabalho por respostas incompletas?',
  ],
  Operações: [
    'Quais tarefas manuais se repetem diariamente?',
    'Onde existe transcrição de dados?',
    'Quais conferências são manuais?',
    'Quais relatórios são montados manualmente?',
    'Onde o conhecimento está concentrado?',
  ],
  Administrativo: [
    'Quais documentos são organizados manualmente?',
    'Onde há preenchimento repetitivo?',
    'Quais e-mails são padronizados?',
    'Que informação é procurada repetidamente?',
    'Onde existe falta de padronização?',
  ],
  Compras: [
    'Quais cotações são comparadas manualmente?',
    'Onde há transcrição de pedidos?',
    'Que informações de fornecedores são buscadas?',
    'Quais aprovações dependem de conferência?',
    'Onde ocorrem erros?',
  ],
  Logística: [
    'Quais planilhas são atualizadas manualmente?',
    'Onde há conferência de entregas?',
    'Quais relatórios de status são repetitivos?',
    'Onde há cópia entre sistemas?',
    'Quais tarefas dependem de uma pessoa?',
  ],
  Gestão: [
    'Que informações são reunidas manualmente para decisões?',
    'Onde dados demoram para virar informação?',
    'Quais materiais são preparados repetidamente?',
    'Quais análises são refeitas?',
    'Onde falta visibilidade?',
  ],
}

export function getAreaHints(area: string): string[] {
  return AREA_HINTS[area] ?? []
}

function isRiskField(field: QuestionFieldPath): field is `risk.${keyof AreaRiskAnswers}` {
  return field.startsWith('risk.')
}

export function getFieldValue(interview: Partial<AreaInterview>, field: QuestionFieldPath): unknown {
  if (isRiskField(field)) {
    const key = field.slice('risk.'.length) as keyof AreaRiskAnswers
    return interview.risk?.[key]
  }
  return (interview as Record<string, unknown>)[field]
}

export function setFieldValue<T extends Partial<AreaInterview>>(interview: T, field: QuestionFieldPath, value: unknown): T {
  if (isRiskField(field)) {
    const key = field.slice('risk.'.length) as keyof AreaRiskAnswers
    return { ...interview, risk: { ...(interview.risk ?? {}), [key]: value } }
  }
  return { ...interview, [field]: value }
}

function isAnswerPresent(value: unknown): boolean {
  if (Array.isArray(value)) return value.length > 0
  if (typeof value === 'string') return value.trim().length > 0
  return value !== undefined && value !== null
}

/** Determina se uma etapa da entrevista já tem tudo que é obrigatório para avançar. */
export function validateStepAnswers(step: InterviewStep, interview: Partial<AreaInterview>): Record<string, string> {
  const errors: Record<string, string> = {}
  for (const question of step.questions) {
    if (question.required && !isAnswerPresent(getFieldValue(interview, question.field))) {
      errors[question.field] = question.type === 'textarea' ? 'Campo obrigatório.' : 'Selecione uma opção.'
    }
  }
  return errors
}

/** Passos aplicáveis dado o estado atual das respostas (SPEC V2 §50 — perguntas condicionais). */
export function getApplicableSteps(interview: Partial<AreaInterview>): InterviewStep[] {
  return AREA_INTERVIEW_STEPS.filter((step) => !step.condition || step.condition(interview))
}
