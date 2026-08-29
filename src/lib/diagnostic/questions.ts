import type { AreaInterview, AreaRiskAnswers } from '@/types/diagnostic'
import {
  IMPACT_OPTIONS,
  INFORMATION_CONCENTRATION_OPTIONS,
  PREVIOUS_ATTEMPT_OPTIONS,
  REWORK_CAUSES,
  SEARCH_TIME_OPTIONS,
  TOOL_OPTIONS,
  TRANSFER_FREQUENCY_OPTIONS,
  WRITING_STANDARDIZATION_OPTIONS,
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
  /** Perguntas de classificação rápida (rádio/seleção) que devem ser respondidas para avançar. Blocos de texto nunca são obrigatórios (SPEC V3 §24 — só perguntar o que ajuda a análise). */
  required?: boolean
}

export type InterviewStep = {
  id: string
  block: string
  questions: QuestionDef[]
  /** Mostrar esta etapa somente quando a condição sobre as respostas já dadas for verdadeira. */
  condition?: (interview: Partial<AreaInterview>) => boolean
}

const MAX_TEXT = 1500
const MAX_SHORT_TEXT = 500

const isPositiveAttempt = (interview: Partial<AreaInterview>) =>
  !!interview.previousAttempts && interview.previousAttempts !== 'Não' && interview.previousAttempts !== 'Não sei'

/**
 * Entrevista aprofundada — blocos A a O (SPEC V3 §6). Usada sempre para a área
 * prioritária, e para áreas complementares quando o usuário escolhe "análise aprofundada".
 */
export const DEEP_INTERVIEW_STEPS: InterviewStep[] = [
  // Bloco A — Rotina
  {
    id: 'A',
    block: 'Rotina',
    questions: [
      { field: 'dailyRepetitiveTasks', prompt: 'O que essa área faz repetidamente todos os dias?', type: 'textarea', maxLength: MAX_TEXT },
      { field: 'weeklyRepetitiveTasks', prompt: 'O que essa área faz repetidamente toda semana?', type: 'textarea', maxLength: MAX_TEXT },
      { field: 'monthlyRepetitiveTasks', prompt: 'O que essa área faz repetidamente todo mês?', type: 'textarea', maxLength: MAX_TEXT },
      {
        field: 'multipleTimesPerDay',
        prompt: 'Existem atividades que se repetem várias vezes durante o dia?',
        type: 'textarea',
        maxLength: MAX_TEXT,
      },
    ],
  },

  // Bloco B — Principais tarefas
  {
    id: 'B1',
    block: 'Principais tarefas',
    questions: [
      { field: 'mainTasks', prompt: 'Quais são as principais tarefas realizadas nessa área?', type: 'textarea', maxLength: MAX_TEXT },
      { field: 'mostTimeConsumingTask', prompt: 'Qual tarefa mais consome tempo?', type: 'textarea', maxLength: MAX_TEXT },
      {
        field: 'taskToEliminate',
        prompt: 'Se você pudesse eliminar ou simplificar uma tarefa dessa área amanhã, qual seria?',
        type: 'textarea',
        maxLength: MAX_TEXT,
      },
    ],
  },
  {
    id: 'B2',
    block: 'Principais tarefas',
    condition: (interview) => isFollowUpWorthy(interview.taskToEliminate),
    questions: [{ field: 'eliminationReason', prompt: 'Por que justamente essa tarefa?', type: 'textarea', maxLength: MAX_SHORT_TEXT }],
  },

  // Bloco C — Como o processo funciona hoje
  {
    id: 'C1',
    block: 'Como o processo funciona hoje',
    questions: [
      {
        field: 'processStart',
        prompt: 'Como esse processo começa?',
        type: 'textarea',
        maxLength: MAX_TEXT,
        helpText: 'Não precisa explicar de forma técnica — conte o que uma pessoa faz desde o começo até terminar.',
      },
      { field: 'processSteps', prompt: 'Quais são as principais etapas?', type: 'textarea', maxLength: MAX_TEXT },
    ],
  },
  {
    id: 'C2',
    block: 'Como o processo funciona hoje',
    questions: [
      { field: 'processPeople', prompt: 'Quem participa?', type: 'textarea', maxLength: MAX_SHORT_TEXT },
      { field: 'processManualWork', prompt: 'O que precisa ser feito manualmente?', type: 'textarea', maxLength: MAX_TEXT },
      {
        field: 'processDecisions',
        prompt: 'Quais decisões a pessoa precisa tomar durante o processo?',
        type: 'textarea',
        maxLength: MAX_TEXT,
      },
    ],
  },
  {
    id: 'C3',
    block: 'Como o processo funciona hoje',
    questions: [
      { field: 'processEnd', prompt: 'Como o processo termina?', type: 'textarea', maxLength: MAX_SHORT_TEXT },
      { field: 'processResult', prompt: 'Qual é o resultado final esperado?', type: 'textarea', maxLength: MAX_SHORT_TEXT },
    ],
  },

  // Bloco D — Ferramentas e sistemas
  {
    id: 'D1',
    block: 'Ferramentas e sistemas',
    questions: [{ field: 'tools', prompt: 'Quais ferramentas ou sistemas são usados nesse processo?', type: 'multiselect', options: TOOL_OPTIONS }],
  },
  {
    id: 'D2',
    block: 'Ferramentas e sistemas',
    condition: (interview) => !!interview.tools?.includes('Outro'),
    questions: [{ field: 'toolsOther', prompt: 'Qual?', type: 'textarea', maxLength: MAX_SHORT_TEXT }],
  },
  {
    id: 'D3',
    block: 'Ferramentas e sistemas',
    questions: [
      {
        field: 'toolsExchangeInfo',
        prompt: 'Essas ferramentas precisam trocar informações entre si?',
        type: 'radio',
        options: YES_NO_UNKNOWN,
        required: true,
      },
    ],
  },
  {
    id: 'D4',
    block: 'Ferramentas e sistemas',
    condition: (interview) => interview.toolsExchangeInfo === 'Sim',
    questions: [
      {
        field: 'toolsExchangeDescription',
        prompt: 'Quais informações são transferidas e entre quais ferramentas?',
        type: 'textarea',
        maxLength: MAX_SHORT_TEXT,
      },
    ],
  },

  // Bloco E — Transferência de informações
  {
    id: 'E1',
    block: 'Transferência de informações',
    questions: [
      {
        field: 'hasInformationTransfer',
        prompt: 'Existe alguma tarefa em que alguém precisa copiar informações de um lugar para outro?',
        type: 'radio',
        options: YES_NO_UNKNOWN,
        required: true,
      },
    ],
  },
  {
    id: 'E2',
    block: 'Transferência de informações',
    condition: (interview) => interview.hasInformationTransfer === 'Sim',
    questions: [
      { field: 'informationSource', prompt: 'De onde vem a informação?', type: 'textarea', maxLength: MAX_SHORT_TEXT },
      { field: 'informationDestination', prompt: 'Para onde ela vai?', type: 'textarea', maxLength: MAX_SHORT_TEXT },
    ],
  },
  {
    id: 'E3',
    block: 'Transferência de informações',
    condition: (interview) => interview.hasInformationTransfer === 'Sim',
    questions: [
      { field: 'informationTransferWho', prompt: 'Quem faz essa transferência?', type: 'textarea', maxLength: MAX_SHORT_TEXT },
      {
        field: 'informationTransferFrequency',
        prompt: 'Com que frequência isso acontece?',
        type: 'select',
        options: TRANSFER_FREQUENCY_OPTIONS,
      },
    ],
  },
  {
    id: 'E4',
    block: 'Transferência de informações',
    condition: (interview) => interview.hasInformationTransfer === 'Sim',
    questions: [
      { field: 'informationTransferManualEntry', prompt: 'A informação é digitada manualmente?', type: 'radio', options: YES_NO_UNKNOWN },
      { field: 'informationTransferReview', prompt: 'Existe conferência depois?', type: 'radio', options: YES_NO_UNKNOWN },
    ],
  },

  // Bloco F — Documentos
  {
    id: 'F1',
    block: 'Documentos',
    questions: [
      { field: 'hasDocuments', prompt: 'Essa área trabalha com muitos documentos?', type: 'radio', options: YES_NO_UNKNOWN, required: true },
    ],
  },
  {
    id: 'F2',
    block: 'Documentos',
    condition: (interview) => interview.hasDocuments === 'Sim',
    questions: [
      { field: 'documentTypes', prompt: 'Que tipos de documentos?', type: 'textarea', maxLength: MAX_SHORT_TEXT },
      { field: 'documentArrival', prompt: 'Como esses documentos chegam?', type: 'textarea', maxLength: MAX_SHORT_TEXT },
    ],
  },
  {
    id: 'F3',
    block: 'Documentos',
    condition: (interview) => interview.hasDocuments === 'Sim',
    questions: [
      { field: 'someoneReadsDocuments', prompt: 'Alguém precisa ler esses documentos?', type: 'radio', options: YES_NO_UNKNOWN },
      {
        field: 'documentExtraction',
        prompt: 'O que normalmente precisa ser encontrado ou retirado deles?',
        type: 'textarea',
        maxLength: MAX_SHORT_TEXT,
      },
    ],
  },
  {
    id: 'F4',
    block: 'Documentos',
    condition: (interview) => interview.hasDocuments === 'Sim',
    questions: [
      {
        field: 'documentDataEntryAfter',
        prompt: 'Depois alguém precisa digitar ou transferir essas informações?',
        type: 'radio',
        options: YES_NO_UNKNOWN,
      },
      { field: 'documentReview', prompt: 'Existe conferência?', type: 'radio', options: YES_NO_UNKNOWN },
    ],
  },
  {
    id: 'F5',
    block: 'Documentos',
    condition: (interview) => interview.hasDocuments === 'Sim',
    questions: [
      { field: 'documentVolume', prompt: 'Qual é aproximadamente o volume de documentos?', type: 'textarea', maxLength: MAX_SHORT_TEXT },
    ],
  },

  // Bloco G — Escrita repetitiva
  {
    id: 'G1',
    block: 'Escrita repetitiva',
    questions: [
      {
        field: 'hasRepeatedWriting',
        prompt: 'Essa área precisa escrever mensagens, e-mails, relatórios ou documentos parecidos repetidamente?',
        type: 'radio',
        options: YES_NO_UNKNOWN,
        required: true,
      },
    ],
  },
  {
    id: 'G2',
    block: 'Escrita repetitiva',
    condition: (interview) => interview.hasRepeatedWriting === 'Sim',
    questions: [
      { field: 'writingContent', prompt: 'O que normalmente precisa ser escrito?', type: 'textarea', maxLength: MAX_SHORT_TEXT },
      {
        field: 'writingStandardization',
        prompt: 'Esses textos são praticamente iguais ou precisam ser personalizados?',
        type: 'select',
        options: WRITING_STANDARDIZATION_OPTIONS,
      },
    ],
  },
  {
    id: 'G3',
    block: 'Escrita repetitiva',
    condition: (interview) => interview.hasRepeatedWriting === 'Sim',
    questions: [
      { field: 'writingWho', prompt: 'Quem normalmente escreve?', type: 'textarea', maxLength: MAX_SHORT_TEXT },
      { field: 'writingFrequency', prompt: 'Com que frequência?', type: 'select', options: TRANSFER_FREQUENCY_OPTIONS },
    ],
  },

  // Bloco H — Pesquisa e busca de informação
  {
    id: 'H1',
    block: 'Pesquisa e busca de informação',
    questions: [
      {
        field: 'hasInformationSearch',
        prompt: 'Existe alguma tarefa em que alguém precisa procurar informações antes de conseguir responder ou executar algo?',
        type: 'radio',
        options: YES_NO_UNKNOWN,
        required: true,
      },
    ],
  },
  {
    id: 'H2',
    block: 'Pesquisa e busca de informação',
    condition: (interview) => interview.hasInformationSearch === 'Sim',
    questions: [
      { field: 'searchWhat', prompt: 'O que precisa ser procurado?', type: 'textarea', maxLength: MAX_SHORT_TEXT },
      { field: 'searchWhere', prompt: 'Onde essa informação está?', type: 'textarea', maxLength: MAX_SHORT_TEXT },
    ],
  },
  {
    id: 'H3',
    block: 'Pesquisa e busca de informação',
    condition: (interview) => interview.hasInformationSearch === 'Sim',
    questions: [
      { field: 'searchTime', prompt: 'Quanto tempo normalmente é gasto procurando?', type: 'select', options: SEARCH_TIME_OPTIONS },
      { field: 'searchWho', prompt: 'Quem procura?', type: 'textarea', maxLength: MAX_SHORT_TEXT },
    ],
  },
  {
    id: 'H4',
    block: 'Pesquisa e busca de informação',
    condition: (interview) => interview.hasInformationSearch === 'Sim',
    questions: [
      {
        field: 'searchConcentration',
        prompt: 'As informações estão concentradas em um lugar ou espalhadas?',
        type: 'select',
        options: INFORMATION_CONCENTRATION_OPTIONS,
      },
      {
        field: 'searchAskOthers',
        prompt: 'É comum precisar perguntar para outra pessoa onde encontrar determinada informação?',
        type: 'radio',
        options: YES_NO_UNKNOWN,
      },
    ],
  },

  // Bloco I — Retrabalho
  {
    id: 'I1',
    block: 'Retrabalho',
    questions: [{ field: 'reworkTasks', prompt: 'Quais tarefas precisam ser refeitas?', type: 'textarea', maxLength: MAX_TEXT }],
  },
  {
    id: 'I2',
    block: 'Retrabalho',
    condition: (interview) => isFollowUpWorthy(interview.reworkTasks),
    questions: [{ field: 'reworkCause', prompt: 'Por que elas precisam ser refeitas?', type: 'multiselect', options: REWORK_CAUSES }],
  },
  {
    id: 'I3',
    block: 'Retrabalho',
    condition: (interview) => !!interview.reworkCause?.includes('outro'),
    questions: [{ field: 'reworkCauseOther', prompt: 'Explique.', type: 'textarea', maxLength: MAX_SHORT_TEXT }],
  },

  // Bloco J — Erros e conferências
  {
    id: 'J1',
    block: 'Erros e conferências',
    questions: [{ field: 'errorProcesses', prompt: 'Em quais processos costumam acontecer erros?', type: 'textarea', maxLength: MAX_TEXT }],
  },
  {
    id: 'J2',
    block: 'Erros e conferências',
    condition: (interview) => isFollowUpWorthy(interview.errorProcesses),
    questions: [
      { field: 'errorType', prompt: 'Que tipo de erro acontece?', type: 'textarea', maxLength: MAX_SHORT_TEXT },
      { field: 'errorFrequency', prompt: 'Com que frequência?', type: 'select', options: TRANSFER_FREQUENCY_OPTIONS },
    ],
  },
  {
    id: 'J3',
    block: 'Erros e conferências',
    condition: (interview) => isFollowUpWorthy(interview.errorProcesses),
    questions: [
      { field: 'errorDiscovery', prompt: 'Como esses erros são descobertos?', type: 'textarea', maxLength: MAX_SHORT_TEXT },
      {
        field: 'errorConsequence',
        prompt: 'O que acontece depois que o erro é descoberto?',
        type: 'textarea',
        maxLength: MAX_SHORT_TEXT,
      },
    ],
  },
  {
    id: 'J4',
    block: 'Erros e conferências',
    questions: [{ field: 'reviewTasks', prompt: 'Quais tarefas precisam passar por conferência?', type: 'textarea', maxLength: MAX_TEXT }],
  },
  {
    id: 'J5',
    block: 'Erros e conferências',
    condition: (interview) => isFollowUpWorthy(interview.reviewTasks),
    questions: [
      { field: 'reviewWhat', prompt: 'O que é conferido?', type: 'textarea', maxLength: MAX_SHORT_TEXT },
      { field: 'reviewWho', prompt: 'Quem confere?', type: 'textarea', maxLength: MAX_SHORT_TEXT },
    ],
  },

  // Bloco K — Dependência de pessoas
  {
    id: 'K1',
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
    id: 'K2',
    block: 'Dependência de pessoas',
    condition: (interview) => interview.keyPersonDependency === 'Sim',
    questions: [
      { field: 'dependencyProcess', prompt: 'Qual processo depende dessa pessoa?', type: 'textarea', maxLength: MAX_SHORT_TEXT, required: true },
      {
        field: 'dependencyDescription',
        prompt: 'O que essa pessoa sabe ou faz que torna o processo dependente dela?',
        type: 'textarea',
        maxLength: MAX_SHORT_TEXT,
        required: true,
      },
    ],
  },

  // Bloco L — Tentativas anteriores
  {
    id: 'L1',
    block: 'Tentativas anteriores',
    questions: [
      {
        field: 'previousAttempts',
        prompt: 'Vocês já tentaram melhorar, automatizar ou resolver esse processo?',
        type: 'select',
        options: PREVIOUS_ATTEMPT_OPTIONS,
        required: true,
      },
    ],
  },
  {
    id: 'L2',
    block: 'Tentativas anteriores',
    condition: isPositiveAttempt,
    questions: [
      { field: 'previousAttemptsWhat', prompt: 'O que vocês tentaram fazer?', type: 'textarea', maxLength: MAX_SHORT_TEXT },
      {
        field: 'previousAttemptsWhyNotSolved',
        prompt: 'Por que você acha que não resolveu completamente?',
        type: 'textarea',
        maxLength: MAX_SHORT_TEXT,
      },
    ],
  },

  // Bloco M — Impacto
  {
    id: 'M1',
    block: 'Impacto',
    questions: [
      {
        field: 'impact',
        prompt: 'Quando esse processo atrasa, dá erro ou precisa ser refeito, qual é o impacto para a empresa?',
        type: 'multiselect',
        options: IMPACT_OPTIONS,
        required: true,
      },
    ],
  },
  {
    id: 'M2',
    block: 'Impacto',
    condition: (interview) => !!interview.impact?.includes('outro'),
    questions: [{ field: 'impactOther', prompt: 'Explique.', type: 'textarea', maxLength: MAX_SHORT_TEXT }],
  },

  // Bloco N — Resultado final
  {
    id: 'N1',
    block: 'Resultado final',
    questions: [
      {
        field: 'finalResult',
        prompt: 'Quando esse processo termina corretamente, o que precisa estar pronto?',
        type: 'textarea',
        maxLength: MAX_TEXT,
        helpText: 'Pode ser um relatório, pagamento realizado, cadastro atualizado, cliente respondido, documento lançado, informação registrada etc.',
      },
    ],
  },

  // Bloco O — Dados e segurança
  {
    id: 'O1',
    block: 'Dados e segurança',
    questions: [
      { field: 'risk.personalData', prompt: 'Esse processo envolve dados pessoais?', type: 'radio', options: YES_NO_UNKNOWN, required: true },
      { field: 'risk.financialData', prompt: 'Envolve dados financeiros?', type: 'radio', options: YES_NO_UNKNOWN, required: true },
      { field: 'risk.customerData', prompt: 'Envolve dados de clientes?', type: 'radio', options: YES_NO_UNKNOWN, required: true },
      { field: 'risk.employeeData', prompt: 'Envolve dados de funcionários?', type: 'radio', options: YES_NO_UNKNOWN, required: true },
      {
        field: 'risk.confidentialData',
        prompt: 'Envolve informações confidenciais?',
        type: 'radio',
        options: YES_NO_UNKNOWN,
        required: true,
      },
    ],
  },

  // Observações
  {
    id: 'NOTES',
    block: 'Observações',
    questions: [
      { field: 'additionalNotes', prompt: 'Existe alguma observação importante?', type: 'textarea', maxLength: MAX_SHORT_TEXT * 2 },
    ],
  },
]

/**
 * Entrevista rápida — 10 perguntas fixas, sem desdobramentos condicionais
 * (SPEC V3 §8), usada para áreas complementares quando o usuário escolhe
 * "análise rápida".
 */
export const QUICK_INTERVIEW_STEPS: InterviewStep[] = [
  {
    id: 'Q1',
    block: 'Principais tarefas',
    questions: [
      { field: 'mainTasks', prompt: 'Quais são as principais tarefas dessa área?', type: 'textarea', maxLength: MAX_TEXT },
      { field: 'mostTimeConsumingTask', prompt: 'Qual tarefa mais consome tempo?', type: 'textarea', maxLength: MAX_TEXT },
      {
        field: 'taskToEliminate',
        prompt: 'Qual tarefa você gostaria de eliminar ou simplificar?',
        type: 'textarea',
        maxLength: MAX_TEXT,
      },
    ],
  },
  {
    id: 'Q2',
    block: 'Processo atual',
    questions: [
      { field: 'currentProcessSummary', prompt: 'Como essa tarefa é feita atualmente?', type: 'textarea', maxLength: MAX_TEXT },
    ],
  },
  {
    id: 'Q3',
    block: 'Ferramentas',
    questions: [{ field: 'tools', prompt: 'Quais ferramentas ou sistemas são utilizados?', type: 'multiselect', options: TOOL_OPTIONS }],
  },
  {
    id: 'Q3B',
    block: 'Ferramentas',
    condition: (interview) => !!interview.tools?.includes('Outro'),
    questions: [{ field: 'toolsOther', prompt: 'Qual?', type: 'textarea', maxLength: MAX_SHORT_TEXT }],
  },
  {
    id: 'Q4',
    block: 'Sinais rápidos',
    questions: [
      { field: 'hasInformationTransfer', prompt: 'Existe transferência manual de informações?', type: 'radio', options: YES_NO_UNKNOWN },
      { field: 'hasReworkOrErrors', prompt: 'Existe retrabalho ou erro?', type: 'radio', options: YES_NO_UNKNOWN },
      { field: 'keyPersonDependency', prompt: 'Alguma pessoa é indispensável para esse processo?', type: 'radio', options: YES_NO_UNKNOWN },
      { field: 'hasDocuments', prompt: 'Existem documentos envolvidos?', type: 'radio', options: YES_NO_UNKNOWN },
    ],
  },
  {
    id: 'Q5',
    block: 'Observações',
    questions: [{ field: 'additionalNotes', prompt: 'Existe alguma observação importante?', type: 'textarea', maxLength: MAX_SHORT_TEXT * 2 }],
  },
]

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

/** Passos aplicáveis dado o estado atual das respostas e o modo da entrevista (SPEC V3 §6, §8, §9). */
export function getApplicableSteps(interview: Partial<AreaInterview>): InterviewStep[] {
  const steps = interview.depth === 'RAPIDA' ? QUICK_INTERVIEW_STEPS : DEEP_INTERVIEW_STEPS
  return steps.filter((step) => !step.condition || step.condition(interview))
}
