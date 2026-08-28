import type { DiagnosticRequest } from '@/types/diagnostic'

export type Indicator =
  | 'frequency'
  | 'volume'
  | 'repetitiveness'
  | 'manualWork'
  | 'rework'
  | 'errorRisk'
  | 'standardization'
  | 'implementationEase'

export type IndicatorScores = Record<Indicator, number | null>

export type ScoringResult = {
  indicators: IndicatorScores
  opportunityScore: number
  priorityLabel: string
}

/**
 * Pesos usados para combinar os indicadores (0–5) em um score único de 0–100.
 * Centralizados aqui para evitar números mágicos espalhados pelo projeto (SPEC.md §19).
 * A soma dos pesos deve ser 1.
 */
export const INDICATOR_WEIGHTS: Record<Indicator, number> = {
  frequency: 0.15,
  volume: 0.1,
  repetitiveness: 0.15,
  manualWork: 0.15,
  rework: 0.15,
  errorRisk: 0.1,
  standardization: 0.1,
  implementationEase: 0.1,
}

export const PRIORITY_BANDS = [
  { min: 80, label: 'Alta prioridade' },
  { min: 60, label: 'Média prioridade' },
  { min: 40, label: 'Baixa prioridade' },
  { min: 0, label: 'Muito baixa prioridade' },
] as const

const MANUAL_TOOLS = ['Excel', 'Google Sheets', 'Google Drive', 'Microsoft Office', 'E-mail', 'WhatsApp'] as const
const STRUCTURED_TOOLS = ['CRM', 'ERP', 'Sistema próprio'] as const

const KEYWORDS = {
  frequency: [
    'diariamente',
    'todo dia',
    'todos os dias',
    'diario',
    'diaria',
    'semanalmente',
    'toda semana',
    'todas as semanas',
    'semanal',
    'constantemente',
    'sempre',
    'frequentemente',
    'rotina',
  ],
  volume: [
    'grande quantidade',
    'muitos',
    'muitas',
    'centenas',
    'dezenas',
    'alto volume',
    'diversos',
    'varios',
    'varias',
    'em massa',
    'volume alto',
  ],
  repetitiveness: [
    'repetitiv',
    'mesma tarefa',
    'mesmas tarefas',
    'sempre igual',
    'toda vez',
    'repete',
    'repetimos',
    'rotineir',
  ],
  manualWork: ['manual', 'manualmente', 'planilha', 'digitar', 'copiar e colar', 'preencher', 'no papel'],
  rework: ['retrabalho', 'refazer', 'refazemos', 'corrigir de novo', 'revisar novamente', 'refacao'],
  errorRisk: ['erro', 'erros', 'esquecimento', 'esquece', 'esquecemos', 'atraso', 'atrasos', 'falha', 'falhas'],
} as const

function normalizeText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
}

/** Insuficiente para inferir qualquer coisa: resposta em branco ou trivial demais. */
function hasMeaningfulText(text: string): boolean {
  return text.trim().length >= 3
}

function countKeywordHits(text: string, keywords: readonly string[]): number {
  const normalized = normalizeText(text)
  return keywords.reduce((total, keyword) => (normalized.includes(keyword) ? total + 1 : total), 0)
}

function scoreFromKeywordHits(hits: number): number {
  if (hits === 0) return 1
  if (hits === 1) return 2
  if (hits === 2) return 3
  if (hits === 3) return 4
  return 5
}

function scoreFromText(text: string, keywords: readonly string[]): number | null {
  if (!hasMeaningfulText(text)) return null
  return scoreFromKeywordHits(countKeywordHits(text, keywords))
}

function clampScore(value: number): number {
  return Math.min(5, Math.max(0, Math.round(value)))
}

function average(values: Array<number | null | undefined>): number | null {
  const present = values.filter((value): value is number => value !== null && value !== undefined)
  if (present.length === 0) return null
  return present.reduce((sum, value) => sum + value, 0) / present.length
}

const EMPLOYEE_RANGE_SCORE: Record<string, number> = {
  '1–5': 1,
  '6–10': 2,
  '11–20': 3,
  '21–50': 4,
  '51–100': 5,
  'Mais de 100': 5,
}

const AI_MATURITY_SCORE: Record<string, number | null> = {
  'Não utilizamos': 1,
  'Utilizamos pouco': 2,
  'Utilizamos regularmente': 4,
  'Utilizamos bastante': 5,
  'Não sei': null,
}

function toolsRatioScore(tools: readonly string[], set: readonly string[]): number {
  const hits = tools.filter((tool) => (set as readonly string[]).includes(tool)).length
  if (hits === 0) return 0
  return clampScore((hits / set.length) * 5)
}

export function computeIndicatorScores(request: DiagnosticRequest): IndicatorScores {
  const { operation, problems, technology, company } = request

  const combinedOperationText = `${operation.mainActivities} ${operation.timeConsumingTasks}`
  const manualToolsScore = toolsRatioScore(technology.tools, MANUAL_TOOLS)
  const structuredToolsScore = toolsRatioScore(technology.tools, STRUCTURED_TOOLS)

  const frequency = scoreFromText(
    `${operation.mainActivities} ${operation.repetitiveTasks} ${operation.timeConsumingTasks}`,
    KEYWORDS.frequency,
  )

  const volumeFromText = scoreFromText(combinedOperationText, KEYWORDS.volume)
  const volumeFromHeadcount = EMPLOYEE_RANGE_SCORE[company.employeeRange] ?? null
  const volume = average([volumeFromText, volumeFromHeadcount])

  const repetitiveness = scoreFromText(operation.repetitiveTasks, KEYWORDS.repetitiveness)

  const manualWorkFromText = scoreFromText(problems.manualProcesses, KEYWORDS.manualWork)
  const manualWork = average([manualWorkFromText, manualToolsScore])

  const rework = scoreFromText(problems.rework, KEYWORDS.rework)

  const errorRiskFromText = scoreFromText(problems.errors, KEYWORDS.errorRisk)
  const peopleDependencyRiskBonus =
    problems.peopleDependency === 'Sim' ? 1 : problems.peopleDependency === 'Não sei' ? 0.5 : 0
  const errorRisk =
    errorRiskFromText === null ? null : clampScore(errorRiskFromText + peopleDependencyRiskBonus)

  const peopleDependencyPenalty =
    problems.peopleDependency === 'Sim' ? 1.5 : problems.peopleDependency === 'Não sei' ? 0.5 : 0
  const standardization = clampScore(5 - manualToolsScore + structuredToolsScore * 0.5 - peopleDependencyPenalty)

  const aiMaturityScore = AI_MATURITY_SCORE[technology.aiMaturity] ?? null
  const implementationEasePenalty = problems.peopleDependency === 'Sim' ? 1 : 0
  const implementationEaseRaw = average([aiMaturityScore, structuredToolsScore])
  const implementationEase =
    implementationEaseRaw === null ? null : clampScore(implementationEaseRaw - implementationEasePenalty)

  return {
    frequency: frequency === null ? null : clampScore(frequency),
    volume: volume === null ? null : clampScore(volume),
    repetitiveness: repetitiveness === null ? null : clampScore(repetitiveness),
    manualWork: manualWork === null ? null : clampScore(manualWork),
    rework: rework === null ? null : clampScore(rework),
    errorRisk,
    standardization,
    implementationEase,
  }
}

export function computeOpportunityScore(indicators: IndicatorScores): number {
  let weightedSum = 0
  let weightTotal = 0

  for (const [key, value] of Object.entries(indicators) as Array<[Indicator, number | null]>) {
    if (value === null) continue
    const weight = INDICATOR_WEIGHTS[key]
    weightedSum += value * weight
    weightTotal += weight
  }

  if (weightTotal === 0) return 0

  const averageScore = weightedSum / weightTotal // 0–5
  return Math.round((averageScore / 5) * 100)
}

export function getPriorityLabel(opportunityScore: number): string {
  const band = PRIORITY_BANDS.find((band) => opportunityScore >= band.min)
  return band?.label ?? PRIORITY_BANDS[PRIORITY_BANDS.length - 1].label
}

export function computeScoring(request: DiagnosticRequest): ScoringResult {
  const indicators = computeIndicatorScores(request)
  const opportunityScore = computeOpportunityScore(indicators)
  return {
    indicators,
    opportunityScore,
    priorityLabel: getPriorityLabel(opportunityScore),
  }
}
