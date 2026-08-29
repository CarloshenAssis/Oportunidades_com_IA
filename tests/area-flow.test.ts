import { describe, expect, it } from 'vitest'
import {
  addAreaPlan,
  availableAreasFor,
  canAddMoreAreas,
  nextAreaOrdinalLabel,
  nextStepAfterAreaDecision,
  nextStepAfterAreaInterview,
} from '@/lib/diagnostic/area-flow'

describe('addAreaPlan (SPEC V3 §4)', () => {
  it('a primeira área adicionada é sempre prioritária e aprofundada, mesmo pedindo rápida', () => {
    const plans = addAreaPlan([], 'Financeiro', 'RAPIDA')
    expect(plans).toEqual([{ area: 'Financeiro', role: 'PRIORITARIA', depth: 'APROFUNDADA' }])
  })

  it('a segunda área é complementar, com a profundidade escolhida pelo usuário', () => {
    const first = addAreaPlan([], 'Financeiro')
    const plans = addAreaPlan(first, 'Atendimento', 'RAPIDA')
    expect(plans[1]).toEqual({ area: 'Atendimento', role: 'COMPLEMENTAR', depth: 'RAPIDA' })
  })

  it('a terceira área também é complementar', () => {
    const plans = addAreaPlan(addAreaPlan(addAreaPlan([], 'Financeiro'), 'Atendimento', 'RAPIDA'), 'Comercial', 'APROFUNDADA')
    expect(plans[2]).toEqual({ area: 'Comercial', role: 'COMPLEMENTAR', depth: 'APROFUNDADA' })
  })
})

describe('nextStepAfterAreaInterview (SPEC V3 §4)', () => {
  it('pergunta pela segunda área depois que a primeira termina', () => {
    const plans = addAreaPlan([], 'Financeiro')
    expect(nextStepAfterAreaInterview(plans)).toBe('ask-second')
  })

  it('pergunta pela terceira área depois que a segunda termina', () => {
    const plans = addAreaPlan(addAreaPlan([], 'Financeiro'), 'Atendimento', 'RAPIDA')
    expect(nextStepAfterAreaInterview(plans)).toBe('ask-third')
  })

  it('segue para o contato depois que a terceira área termina (limite máximo)', () => {
    const plans = addAreaPlan(addAreaPlan(addAreaPlan([], 'Financeiro'), 'Atendimento', 'RAPIDA'), 'Comercial', 'APROFUNDADA')
    expect(nextStepAfterAreaInterview(plans)).toBe('contact')
  })
})

describe('nextStepAfterAreaDecision (SPEC V3 §4)', () => {
  it('segue para a escolha da área quando o usuário aceita analisar mais uma', () => {
    expect(nextStepAfterAreaDecision(true)).toBe('select-area')
  })

  it('pula direto para o contato quando o usuário recusa — a próxima área nunca é oferecida', () => {
    expect(nextStepAfterAreaDecision(false)).toBe('contact')
  })
})

describe('availableAreasFor (SPEC V3 §10)', () => {
  it('nunca repete uma área já escolhida', () => {
    const plans = addAreaPlan([], 'Financeiro')
    const available = availableAreasFor(['Financeiro', 'Atendimento', 'Comercial'], plans)
    expect(available).toEqual(['Atendimento', 'Comercial'])
  })

  it('devolve todas as áreas quando nenhuma foi escolhida ainda', () => {
    expect(availableAreasFor(['Financeiro', 'Atendimento'], [])).toEqual(['Financeiro', 'Atendimento'])
  })
})

describe('canAddMoreAreas (SPEC V3 §4)', () => {
  it('permite adicionar até o máximo de 3 áreas, e bloqueia a partir daí', () => {
    const one = addAreaPlan([], 'Financeiro')
    expect(canAddMoreAreas(one)).toBe(true)
    const two = addAreaPlan(one, 'Atendimento', 'RAPIDA')
    expect(canAddMoreAreas(two)).toBe(true)
    const three = addAreaPlan(two, 'Comercial', 'RAPIDA')
    expect(canAddMoreAreas(three)).toBe(false)
  })
})

describe('nextAreaOrdinalLabel', () => {
  it('rotula a próxima área a ser adicionada', () => {
    expect(nextAreaOrdinalLabel([])).toBe('primeira')
    expect(nextAreaOrdinalLabel(addAreaPlan([], 'Financeiro'))).toBe('segunda')
    expect(nextAreaOrdinalLabel(addAreaPlan(addAreaPlan([], 'Financeiro'), 'Atendimento'))).toBe('terceira')
  })
})
