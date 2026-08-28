/**
 * Cálculo de impacto e custo (SPEC V2 §25–§27). Só produz números quando há
 * dados suficientes — nunca inventa. Todo valor deve ser apresentado como
 * estimativa gerencial, nunca como economia garantida.
 */

export type ImpactInputs = {
  peopleCount?: number
  monthlyExecutions?: number | null
  minutesPerExecution?: number
}

function isValidPositiveNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
}

/** monthlyHours = peopleCount × monthlyExecutions × minutesPerExecution / 60 (SPEC V2 §25). */
export function computeMonthlyHours(inputs: ImpactInputs): number | null {
  const { peopleCount, monthlyExecutions, minutesPerExecution } = inputs

  if (!isValidPositiveNumber(peopleCount) || !isValidPositiveNumber(monthlyExecutions) || !isValidPositiveNumber(minutesPerExecution)) {
    return null
  }

  const hours = (peopleCount * monthlyExecutions * minutesPerExecution) / 60
  return Math.round(hours * 10) / 10
}

/** monthlyEstimatedCost = monthlyHours × hourlyCost (SPEC V2 §26). */
export function computeMonthlyCost(monthlyHours: number | null, hourlyCost: number | undefined): number | null {
  if (monthlyHours === null || !isValidPositiveNumber(hourlyCost)) return null
  return Math.round(monthlyHours * hourlyCost * 100) / 100
}

/** annualEstimatedCost = monthlyEstimatedCost × 12 (SPEC V2 §26). */
export function computeAnnualCost(monthlyCost: number | null): number | null {
  if (monthlyCost === null) return null
  return Math.round(monthlyCost * 12 * 100) / 100
}

export const SCENARIO_PERCENTAGES = [20, 50, 80] as const

export type ImpactScenario = {
  percentage: (typeof SCENARIO_PERCENTAGES)[number]
  hoursSaved: number | null
  costSaved: number | null
}

/**
 * Cenários hipotéticos de dimensionamento (SPEC V2 §27). Sempre acompanhados,
 * na apresentação, do aviso de que não representam promessa de economia.
 */
export function computeScenarios(monthlyHours: number | null, monthlyCost: number | null): ImpactScenario[] {
  return SCENARIO_PERCENTAGES.map((percentage) => ({
    percentage,
    hoursSaved: monthlyHours === null ? null : Math.round(monthlyHours * (percentage / 100) * 10) / 10,
    costSaved: monthlyCost === null ? null : Math.round(monthlyCost * (percentage / 100) * 100) / 100,
  }))
}

export const SCENARIO_DISCLAIMER =
  'Cenário hipotético para dimensionamento. Não representa promessa de economia ou produtividade.'

export const IMPACT_ESTIMATE_DISCLAIMER = 'Estimativa gerencial — não representa economia garantida.'
