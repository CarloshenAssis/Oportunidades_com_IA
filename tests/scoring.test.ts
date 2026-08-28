import { describe, expect, it } from 'vitest'
import { computeIndicatorScores, computeOpportunityScore, computeScoring, getPriorityLabel } from '@/lib/scoring/scoring'
import { makeValidRequest } from './fixtures'

describe('scoring', () => {
  it('produz um score baixo quando os sinais textuais são mínimos', () => {
    const request = makeValidRequest({
      operation: { mainActivities: 'ok', repetitiveTasks: 'ok', timeConsumingTasks: 'ok' },
      problems: {
        rework: 'ok',
        manualProcesses: 'ok',
        errors: 'ok',
        peopleDependency: 'Não sei',
      },
      technology: { tools: ['WhatsApp'], aiMaturity: 'Não sei' },
      company: { companyName: 'Empresa', segment: 'Serviços', employeeRange: '1–5' },
    })

    const { opportunityScore } = computeScoring(request)
    expect(opportunityScore).toBeGreaterThanOrEqual(0)
    expect(opportunityScore).toBeLessThan(40)
    expect(getPriorityLabel(opportunityScore)).toBe('Muito baixa prioridade')
  })

  it('produz um score alto quando há muitos sinais explícitos de frequência, volume e manualidade', () => {
    const request = makeValidRequest({
      company: { companyName: 'Empresa', segment: 'Serviços', employeeRange: 'Mais de 100' },
      operation: {
        mainActivities: 'Atendemos clientes diariamente, com grande quantidade de mensagens.',
        repetitiveTasks:
          'Todos os dias fazemos as mesmas tarefas repetitivas, sempre igual, toda semana também.',
        timeConsumingTasks: 'Muitos processos manuais consomem tempo, com centenas de solicitações.',
      },
      problems: {
        rework: 'Há muito retrabalho, sempre precisamos refazer e revisar novamente.',
        manualProcesses: 'Preenchemos planilhas manualmente, digitamos tudo no papel, copiar e colar direto.',
        errors: 'Erros e esquecimentos são comuns, gerando atrasos e falhas constantes.',
        peopleDependency: 'Sim',
        peopleDependencyDescription: 'Depende do gerente.',
      },
      technology: { tools: ['Excel', 'Google Sheets', 'WhatsApp', 'E-mail'], aiMaturity: 'Não utilizamos' },
    })

    const { opportunityScore } = computeScoring(request)
    expect(opportunityScore).toBeGreaterThan(60)
  })

  it('retorna null para indicadores quando não há informação suficiente', () => {
    const request = makeValidRequest({
      operation: { mainActivities: 'ok', repetitiveTasks: 'ok', timeConsumingTasks: 'ok' },
      problems: {
        rework: 'ok',
        manualProcesses: 'ok',
        errors: 'ok',
        peopleDependency: 'Não sei',
      },
    })

    const indicators = computeIndicatorScores(request)
    expect(indicators.repetitiveness).toBeNull()
    expect(indicators.rework).toBeNull()
  })

  it('nunca gera indicadores fora da faixa de 0 a 5', () => {
    const request = makeValidRequest()
    const indicators = computeIndicatorScores(request)
    for (const value of Object.values(indicators)) {
      if (value !== null) {
        expect(value).toBeGreaterThanOrEqual(0)
        expect(value).toBeLessThanOrEqual(5)
      }
    }
  })

  it('computeOpportunityScore retorna 0 quando todos os indicadores são null', () => {
    const score = computeOpportunityScore({
      frequency: null,
      volume: null,
      repetitiveness: null,
      manualWork: null,
      rework: null,
      errorRisk: null,
      standardization: null,
      implementationEase: null,
    })
    expect(score).toBe(0)
  })

  it('computeOpportunityScore retorna 100 quando todos os indicadores são máximos', () => {
    const score = computeOpportunityScore({
      frequency: 5,
      volume: 5,
      repetitiveness: 5,
      manualWork: 5,
      rework: 5,
      errorRisk: 5,
      standardization: 5,
      implementationEase: 5,
    })
    expect(score).toBe(100)
  })

  it('classifica scores altos como alta prioridade', () => {
    expect(getPriorityLabel(85)).toBe('Alta prioridade')
    expect(getPriorityLabel(65)).toBe('Média prioridade')
    expect(getPriorityLabel(45)).toBe('Baixa prioridade')
    expect(getPriorityLabel(10)).toBe('Muito baixa prioridade')
  })
})
