import { describe, expect, it } from 'vitest'
import { computeAnnualCost, computeMonthlyCost, computeMonthlyHours, computeScenarios } from '@/lib/diagnostic/impact'

describe('computeMonthlyHours', () => {
  it('calcula 40 horas/mês para 3 pessoas, 40 execuções e 20 minutos (SPEC V2 §63)', () => {
    const hours = computeMonthlyHours({ peopleCount: 3, monthlyExecutions: 40, minutesPerExecution: 20 })
    expect(hours).toBe(40)
  })

  it('retorna null quando falta algum dado', () => {
    expect(computeMonthlyHours({ peopleCount: 3, monthlyExecutions: undefined, minutesPerExecution: 20 })).toBeNull()
    expect(computeMonthlyHours({ peopleCount: 3, monthlyExecutions: null, minutesPerExecution: 20 })).toBeNull()
    expect(computeMonthlyHours({})).toBeNull()
  })
})

describe('computeMonthlyCost e computeAnnualCost', () => {
  it('calcula custo mensal e anual a partir das horas e do custo/hora', () => {
    const monthlyCost = computeMonthlyCost(40, 50)
    expect(monthlyCost).toBe(2000)
    expect(computeAnnualCost(monthlyCost)).toBe(24000)
  })

  it('retorna null quando não há horas ou custo/hora suficientes', () => {
    expect(computeMonthlyCost(null, 50)).toBeNull()
    expect(computeMonthlyCost(40, undefined)).toBeNull()
    expect(computeAnnualCost(null)).toBeNull()
  })
})

describe('computeScenarios', () => {
  it('gera cenários de 20%, 50% e 80% quando há dados suficientes', () => {
    const scenarios = computeScenarios(40, 2000)
    expect(scenarios).toHaveLength(3)
    expect(scenarios[0]).toMatchObject({ percentage: 20, hoursSaved: 8, costSaved: 400 })
    expect(scenarios[2]).toMatchObject({ percentage: 80, hoursSaved: 32, costSaved: 1600 })
  })

  it('retorna cenários com valores null quando não há dados suficientes', () => {
    const scenarios = computeScenarios(null, null)
    expect(scenarios.every((scenario) => scenario.hoursSaved === null && scenario.costSaved === null)).toBe(true)
  })
})
