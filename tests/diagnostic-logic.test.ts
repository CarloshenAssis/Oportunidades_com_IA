import { describe, expect, it } from 'vitest'
import { CATEGORY_DEFINITIONS, OPPORTUNITY_CATEGORIES } from '@/lib/diagnostic/categories'
import {
  SOLUTION_LEVELS,
  SOLUTION_LEVEL_TO_TYPE,
  SOLUTION_TYPES,
  describeSolutionLevel,
  isConsistentSolutionPair,
} from '@/lib/diagnostic/solution-tree'
import { detectTriggersInText } from '@/lib/diagnostic/triggers'
import { classifyRisk } from '@/lib/diagnostic/normalize'

describe('categorias de oportunidade (SPEC V2 §19-20)', () => {
  it('inclui as 7 categorias do material original mais OUTRA', () => {
    expect(OPPORTUNITY_CATEGORIES).toEqual([
      'Criação',
      'Análise',
      'Pesquisa',
      'Classificação',
      'Extração',
      'Atendimento',
      'Apoio à decisão',
      'OUTRA',
    ])
  })

  it('cada categoria (exceto OUTRA) tem verbos e descrição definidos', () => {
    for (const category of OPPORTUNITY_CATEGORIES.filter((c) => c !== 'OUTRA')) {
      const definition = CATEGORY_DEFINITIONS[category as keyof typeof CATEGORY_DEFINITIONS]
      expect(definition.verbs.length).toBeGreaterThan(0)
      expect(definition.description.length).toBeGreaterThan(0)
    }
  })
})

describe('árvore de solução N1–N6 (SPEC V2 §31-32)', () => {
  it('possui os 6 níveis, do mais simples ao mais complexo', () => {
    expect(SOLUTION_LEVELS).toEqual(['N1', 'N2', 'N3', 'N4', 'N5', 'N6'])
  })

  it.each(SOLUTION_LEVELS)('%s tem uma definição com label, pergunta e descrição', (level) => {
    const node = describeSolutionLevel(level)
    expect(node.label.length).toBeGreaterThan(0)
    expect(node.question.length).toBeGreaterThan(0)
    expect(node.description.length).toBeGreaterThan(0)
  })

  it('mapeia cada nível a um tipo de solução consistente', () => {
    for (const level of SOLUTION_LEVELS) {
      const type = SOLUTION_LEVEL_TO_TYPE[level]
      expect(SOLUTION_TYPES).toContain(type)
      expect(isConsistentSolutionPair(level, type)).toBe(true)
    }
  })

  it('detecta um par nível/tipo inconsistente', () => {
    expect(isConsistentSolutionPair('N1', 'CUSTOM_SYSTEM')).toBe(false)
  })
})

describe('gatilhos (SPEC V2 §51)', () => {
  it('detecta o gatilho de documentos', () => {
    expect(detectTriggersInText('Recebemos muitos PDFs e contratos para conferir')).toContain('DOCUMENTS')
  })

  it('detecta o gatilho de planilhas', () => {
    expect(detectTriggersInText('Atualizamos uma planilha no Excel todos os dias')).toContain('SPREADSHEETS')
  })

  it('não detecta gatilhos em texto vazio', () => {
    expect(detectTriggersInText('')).toEqual([])
  })
})

describe('classificação de risco (SPEC V2 §28-29)', () => {
  it('classifica como VERMELHO quando há dados pessoais', () => {
    const risk = classifyRisk({
      personalData: 'Sim',
      financialData: 'Não',
      customerData: 'Não',
      employeeData: 'Não',
      confidentialData: 'Não',
    })
    expect(risk).toBe('RED')
  })

  it('classifica como VERMELHO quando há dados financeiros', () => {
    const risk = classifyRisk({
      personalData: 'Não',
      financialData: 'Sim',
      customerData: 'Não',
      employeeData: 'Não',
      confidentialData: 'Não',
    })
    expect(risk).toBe('RED')
  })

  it('classifica como AMARELO quando há dados de clientes, sem dados sensíveis', () => {
    const risk = classifyRisk({
      personalData: 'Não',
      financialData: 'Não',
      customerData: 'Sim',
      employeeData: 'Não',
      confidentialData: 'Não',
    })
    expect(risk).toBe('YELLOW')
  })

  it('classifica como AMARELO quando há qualquer incerteza ("Não sei")', () => {
    const risk = classifyRisk({
      personalData: 'Não sei',
      financialData: 'Não',
      customerData: 'Não',
      employeeData: 'Não',
      confidentialData: 'Não',
    })
    expect(risk).toBe('YELLOW')
  })

  it('classifica como VERDE somente quando tudo é explicitamente "Não"', () => {
    const risk = classifyRisk({
      personalData: 'Não',
      financialData: 'Não',
      customerData: 'Não',
      employeeData: 'Não',
      confidentialData: 'Não',
    })
    expect(risk).toBe('GREEN')
  })
})
