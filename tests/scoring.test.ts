import { describe, expect, it } from 'vitest'
import {
  computeTotalScore,
  extractCandidateTasksFromArea,
  getTaskPriorityLabel,
  pickTaskForQuantitativeSizing,
} from '@/lib/diagnostic/scoring'
import { createEmptyAreaInterview } from '@/lib/validation/diagnostic'
import { makeValidAreaInterview } from './fixtures'

describe('computeTotalScore', () => {
  it('nunca ultrapassa a escala de 0 a 25', () => {
    const total = computeTotalScore({
      frequencyScore: 5,
      timeScore: 5,
      repetitionScore: 5,
      standardizationScore: 5,
      impactScore: 5,
    })
    expect(total).toBe(25)
  })

  it('produz 0 quando todos os componentes disponíveis são 0', () => {
    const total = computeTotalScore({
      frequencyScore: 0,
      timeScore: 0,
      repetitionScore: 0,
      standardizationScore: null,
      impactScore: null,
    })
    expect(total).toBe(0)
  })

  it('retorna null (score incompleto) quando há menos de 3 componentes disponíveis', () => {
    const total = computeTotalScore({
      frequencyScore: 5,
      timeScore: 5,
      repetitionScore: null,
      standardizationScore: null,
      impactScore: null,
    })
    expect(total).toBeNull()
  })

  it('retorna null quando não há nenhum dado (dados ausentes)', () => {
    const total = computeTotalScore({
      frequencyScore: null,
      timeScore: null,
      repetitionScore: null,
      standardizationScore: null,
      impactScore: null,
    })
    expect(total).toBeNull()
  })
})

describe('getTaskPriorityLabel', () => {
  it('classifica scores altos como "Forte candidata"', () => {
    expect(getTaskPriorityLabel(22)).toBe('Forte candidata')
  })

  it('classifica scores médios como "Candidata promissora"', () => {
    expect(getTaskPriorityLabel(16)).toBe('Candidata promissora')
  })

  it('classifica scores baixos como "Menor prioridade"', () => {
    expect(getTaskPriorityLabel(5)).toBe('Menor prioridade')
  })

  it('retorna "Prioridade indefinida" quando o score é null', () => {
    expect(getTaskPriorityLabel(null)).toBe('Prioridade indefinida')
  })
})

describe('extractCandidateTasksFromArea', () => {
  it('identifica tarefas candidatas a partir de respostas preenchidas', () => {
    const interview = makeValidAreaInterview()
    const tasks = extractCandidateTasksFromArea(interview)
    expect(tasks.length).toBeGreaterThan(0)
    expect(tasks.every((task) => task.taskText.length > 0)).toBe(true)
  })

  it('não gera tarefas candidatas quando a área está totalmente em branco', () => {
    const interview = createEmptyAreaInterview('Financeiro')
    const tasks = extractCandidateTasksFromArea(interview)
    expect(tasks).toHaveLength(0)
  })

  it('ignora respostas negativas explícitas como "não temos"', () => {
    const interview = makeValidAreaInterview({
      reworkProcess: 'não temos',
      errorProneTasks: 'Não',
    })
    const tasks = extractCandidateTasksFromArea(interview)
    expect(tasks.find((task) => task.sourceField === 'reworkProcess')).toBeUndefined()
    expect(tasks.find((task) => task.sourceField === 'errorProneTasks')).toBeUndefined()
  })

  it('deriva score de frequência alto para tarefas diárias', () => {
    const interview = makeValidAreaInterview()
    const daily = extractCandidateTasksFromArea(interview).find((task) => task.sourceField === 'dailyRepetitiveTasks')
    expect(daily?.scores.frequencyScore).toBe(5)
  })
})

describe('pickTaskForQuantitativeSizing', () => {
  it('prioriza tarefas de transferência de informação (copiar/colar) quando disponíveis', () => {
    const interview = makeValidAreaInterview()
    const tasks = extractCandidateTasksFromArea(interview)
    const picked = pickTaskForQuantitativeSizing(tasks)
    expect(picked?.sourceField).toBe('copyPasteTasks')
  })

  it('retorna null quando não há tarefas candidatas', () => {
    expect(pickTaskForQuantitativeSizing([])).toBeNull()
  })
})
