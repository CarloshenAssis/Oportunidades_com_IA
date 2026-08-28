import type { AreaInterview, QuantitativeSizing } from '@/types/diagnostic'
import { frequencyAnswerToScore, isFollowUpWorthy, minutesToScore, searchTimeToScore } from './normalize'

export type ScoreComponents = {
  frequencyScore: number | null
  timeScore: number | null
  repetitionScore: number | null
  standardizationScore: number | null
  impactScore: number | null
}

export type CandidateTask = {
  area: string
  sourceField: CandidateSourceField
  taskText: string
  scores: ScoreComponents
  totalScore: number | null
  quantitative?: QuantitativeSizing
}

/**
 * Campos de AreaInterview tratados como "tarefas candidatas" (SPEC V2 §18, §35).
 * Cada um vira, no máximo, uma tarefa candidata por área — a consolidação de
 * tarefas semelhantes mencionadas em blocos diferentes é responsabilidade da IA (§36).
 */
export const CANDIDATE_SOURCE_FIELDS = [
  'dailyRepetitiveTasks',
  'weeklyRepetitiveTasks',
  'monthlyRepetitiveTasks',
  'mostTimeConsumingTask',
  'copyPasteTasks',
  'documentTasks',
  'repeatedWritingTasks',
  'informationSearchTasks',
  'reworkProcess',
  'errorProneTasks',
  'manualReviewTasks',
  'taskToEliminate',
] as const

export type CandidateSourceField = (typeof CANDIDATE_SOURCE_FIELDS)[number]

/**
 * Score-base por tipo de bloco (SPEC V2 §23): deriva sinal diretamente da
 * estrutura da pergunta (ex.: uma tarefa diária é, por construção, de alta
 * frequência), nunca inventando valores fora do que a resposta já indica.
 */
const BLOCK_BASELINES: Record<CandidateSourceField, ScoreComponents> = {
  dailyRepetitiveTasks: { frequencyScore: 5, timeScore: null, repetitionScore: 5, standardizationScore: 4, impactScore: null },
  weeklyRepetitiveTasks: { frequencyScore: 3, timeScore: null, repetitionScore: 4, standardizationScore: 4, impactScore: null },
  monthlyRepetitiveTasks: { frequencyScore: 1, timeScore: null, repetitionScore: 3, standardizationScore: 3, impactScore: null },
  mostTimeConsumingTask: { frequencyScore: null, timeScore: 4, repetitionScore: null, standardizationScore: null, impactScore: 4 },
  copyPasteTasks: { frequencyScore: null, timeScore: null, repetitionScore: 4, standardizationScore: 4, impactScore: null },
  documentTasks: { frequencyScore: null, timeScore: null, repetitionScore: 3, standardizationScore: 3, impactScore: null },
  repeatedWritingTasks: { frequencyScore: null, timeScore: null, repetitionScore: 4, standardizationScore: 3, impactScore: null },
  informationSearchTasks: { frequencyScore: null, timeScore: null, repetitionScore: 2, standardizationScore: 2, impactScore: null },
  reworkProcess: { frequencyScore: null, timeScore: null, repetitionScore: 2, standardizationScore: 1, impactScore: 3 },
  errorProneTasks: { frequencyScore: null, timeScore: null, repetitionScore: 2, standardizationScore: 1, impactScore: 3 },
  manualReviewTasks: { frequencyScore: null, timeScore: null, repetitionScore: 3, standardizationScore: 3, impactScore: null },
  taskToEliminate: { frequencyScore: null, timeScore: null, repetitionScore: null, standardizationScore: null, impactScore: 3 },
}

/** Refina o score-base do bloco com sinais mais precisos, quando disponíveis. */
function deriveScoreComponents(sourceField: CandidateSourceField, interview: AreaInterview): ScoreComponents {
  const scores: ScoreComponents = { ...BLOCK_BASELINES[sourceField] }

  if (sourceField === 'copyPasteTasks' && interview.transferFrequency) {
    const frequency = frequencyAnswerToScore(interview.transferFrequency)
    if (frequency !== null) scores.frequencyScore = frequency
  }

  if (sourceField === 'informationSearchTasks' && interview.informationSearchTime) {
    const time = searchTimeToScore(interview.informationSearchTime)
    if (time !== null) scores.timeScore = time
  }

  const sizing = interview.quantitativeSizing
  if (sizing && sizing.sourceField === sourceField) {
    if (typeof sizing.minutesPerExecution === 'number') {
      const time = minutesToScore(sizing.minutesPerExecution)
      if (time !== null) scores.timeScore = time
    }
    if (sizing.executionFrequency) {
      const frequency = frequencyAnswerToScore(sizing.executionFrequency)
      if (frequency !== null) scores.frequencyScore = frequency
    }
  }

  return scores
}

/**
 * Soma os 5 componentes (0–5 cada, máximo 25 — SPEC V2 §21). Quando menos de 3
 * dos 5 componentes têm dado, retorna null em vez de inventar um total (§24).
 * Com 3 ou mais, extrapola a média disponível para a escala de 25 pontos.
 */
export function computeTotalScore(scores: ScoreComponents): number | null {
  const present = Object.values(scores).filter((value): value is number => value !== null && value !== undefined)
  if (present.length < 3) return null
  const average = present.reduce((sum, value) => sum + value, 0) / present.length
  return Math.round(average * 5)
}

export const PRIORITY_BANDS = [
  { min: 20, label: 'Forte candidata' },
  { min: 14, label: 'Candidata promissora' },
  { min: 0, label: 'Menor prioridade' },
] as const

export function getTaskPriorityLabel(totalScore: number | null): string {
  if (totalScore === null) return 'Prioridade indefinida'
  const band = PRIORITY_BANDS.find((entry) => totalScore >= entry.min)
  return band?.label ?? PRIORITY_BANDS[PRIORITY_BANDS.length - 1].label
}

/** Extrai as tarefas candidatas de uma área, com score determinístico (SPEC V2 §18, §23, §35). */
export function extractCandidateTasksFromArea(interview: AreaInterview): CandidateTask[] {
  const tasks: CandidateTask[] = []

  for (const field of CANDIDATE_SOURCE_FIELDS) {
    const text = interview[field] as string | undefined
    if (!isFollowUpWorthy(text)) continue

    const scores = deriveScoreComponents(field, interview)
    tasks.push({
      area: interview.area,
      sourceField: field,
      taskText: text!.trim(),
      scores,
      totalScore: computeTotalScore(scores),
      quantitative: interview.quantitativeSizing?.sourceField === field ? interview.quantitativeSizing : undefined,
    })
  }

  return tasks
}

/** Ordem de preferência para escolher qual tarefa candidata dimensionar quantitativamente (SPEC V2 §18). */
const SIZING_PRIORITY: CandidateSourceField[] = [
  'copyPasteTasks',
  'documentTasks',
  'mostTimeConsumingTask',
  'reworkProcess',
  'repeatedWritingTasks',
  'errorProneTasks',
  'informationSearchTasks',
  'dailyRepetitiveTasks',
  'weeklyRepetitiveTasks',
  'monthlyRepetitiveTasks',
  'manualReviewTasks',
  'taskToEliminate',
]

/** Escolhe, entre as tarefas candidatas de uma área, a mais indicada para dimensionamento quantitativo. */
export function pickTaskForQuantitativeSizing(tasks: CandidateTask[]): CandidateTask | null {
  for (const field of SIZING_PRIORITY) {
    const found = tasks.find((task) => task.sourceField === field)
    if (found) return found
  }
  return tasks[0] ?? null
}
