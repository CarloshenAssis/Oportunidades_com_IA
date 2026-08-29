import { describe, expect, it } from 'vitest'
import { diagnosticRequestSchema } from '@/lib/validation/diagnostic'
import { buildDiagnosticEmail } from '@/lib/email/template'
import { nextStepAfterAreaDecision, nextStepAfterAreaInterview } from '@/lib/diagnostic/area-flow'
import { makeValidAreaInterview, makeValidComplementaryInterview, makeValidRequest } from './fixtures'
import type { AreaInterview } from '@/types/diagnostic'

/**
 * Os 6 cenários obrigatórios (SPEC V3 §26): toda combinação de número de áreas
 * (1, 2 ou 3) e de profundidade (rápida/aprofundada) para as áreas complementares.
 */

function expectValidPayload(interviews: AreaInterview[]) {
  const result = diagnosticRequestSchema.safeParse(makeValidRequest({ interviews }))
  expect(result.success).toBe(true)
}

describe('Cenário 1 — apenas a Área 1 (obrigatória, aprofundada)', () => {
  const interviews = [makeValidAreaInterview({ area: 'Financeiro' })]

  it('é um payload válido sozinho — o usuário pode finalizar respondendo só a área 1', () => {
    expectValidPayload(interviews)
  })

  it('a área 1 é sempre prioritária e aprofundada', () => {
    expect(interviews[0].role).toBe('PRIORITARIA')
    expect(interviews[0].depth).toBe('APROFUNDADA')
  })

  it('a máquina de estados oferece a segunda área, mas nada obriga o usuário a aceitar', () => {
    expect(nextStepAfterAreaInterview(interviews)).toBe('ask-second')
  })

  it('o e-mail inclui a área como ÁREA PRIORITÁRIA e não menciona nenhuma área complementar', () => {
    const { text } = buildDiagnosticEmail(makeValidRequest({ interviews }))
    expect(text).toContain('ÁREA PRIORITÁRIA')
    expect(text).not.toContain('ÁREA COMPLEMENTAR')
  })
})

describe('Cenário 2 — Área 1 + Área 2 rápida (sem Área 3)', () => {
  const interviews = [makeValidAreaInterview({ area: 'Financeiro' }), makeValidComplementaryInterview('Atendimento', 'RAPIDA')]

  it('é um payload válido', () => {
    expectValidPayload(interviews)
  })

  it('a área 2 é complementar e rápida', () => {
    expect(interviews[1].role).toBe('COMPLEMENTAR')
    expect(interviews[1].depth).toBe('RAPIDA')
  })

  it('a área rápida não carrega avaliação de risco — bloco O é exclusivo do modo aprofundado', () => {
    expect(interviews[1].risk).toBeUndefined()
  })

  it('depois da área 2, a máquina de estados pergunta pela terceira', () => {
    expect(nextStepAfterAreaInterview(interviews)).toBe('ask-third')
  })

  it('recusar a terceira área pula direto para o contato', () => {
    expect(nextStepAfterAreaDecision(false)).toBe('contact')
  })

  it('o e-mail mostra a área 2 como ÁREA COMPLEMENTAR 1 com Nível: RÁPIDA', () => {
    const { text } = buildDiagnosticEmail(makeValidRequest({ interviews }))
    expect(text).toContain('ÁREA COMPLEMENTAR 1')
    expect(text).toContain('Nível: RÁPIDA')
    expect(text).not.toContain('ÁREA COMPLEMENTAR 2')
  })
})

describe('Cenário 3 — Área 1 + Área 2 aprofundada (sem Área 3)', () => {
  const interviews = [makeValidAreaInterview({ area: 'Financeiro' }), makeValidComplementaryInterview('Atendimento', 'APROFUNDADA')]

  it('é um payload válido', () => {
    expectValidPayload(interviews)
  })

  it('a área 2 aprofundada carrega avaliação de risco (bloco O)', () => {
    expect(interviews[1].risk).toBeDefined()
  })

  it('o e-mail mostra Nível: APROFUNDADA para a área complementar', () => {
    const { text } = buildDiagnosticEmail(makeValidRequest({ interviews }))
    const complementarSection = text.split('ÁREA COMPLEMENTAR 1')[1]
    expect(complementarSection).toContain('Nível: APROFUNDADA')
  })
})

describe('Cenário 4 — Área 1 + Área 2 rápida + Área 3 rápida', () => {
  const interviews = [
    makeValidAreaInterview({ area: 'Financeiro' }),
    makeValidComplementaryInterview('Atendimento', 'RAPIDA'),
    makeValidComplementaryInterview('Comercial', 'RAPIDA'),
  ]

  it('é um payload válido com as 3 áreas', () => {
    expectValidPayload(interviews)
  })

  it('nenhuma área se repete', () => {
    const names = interviews.map((interview) => interview.area)
    expect(new Set(names).size).toBe(names.length)
  })

  it('depois da terceira área, a máquina de estados segue direto para o contato', () => {
    expect(nextStepAfterAreaInterview(interviews)).toBe('contact')
  })

  it('o e-mail inclui as 3 áreas, na mesma ordem das entrevistas', () => {
    const { text } = buildDiagnosticEmail(makeValidRequest({ interviews }))
    expect(text.indexOf('ÁREA PRIORITÁRIA')).toBeLessThan(text.indexOf('ÁREA COMPLEMENTAR 1'))
    expect(text.indexOf('ÁREA COMPLEMENTAR 1')).toBeLessThan(text.indexOf('ÁREA COMPLEMENTAR 2'))
  })
})

describe('Cenário 5 — Área 1 + Área 2 rápida + Área 3 aprofundada', () => {
  const interviews = [
    makeValidAreaInterview({ area: 'Financeiro' }),
    makeValidComplementaryInterview('Atendimento', 'RAPIDA'),
    makeValidComplementaryInterview('Comercial', 'APROFUNDADA'),
  ]

  it('é um payload válido', () => {
    expectValidPayload(interviews)
  })

  it('cada área complementar mantém a própria profundidade, independente da outra', () => {
    expect(interviews[1].depth).toBe('RAPIDA')
    expect(interviews[2].depth).toBe('APROFUNDADA')
  })

  it('o e-mail mostra níveis diferentes para as duas áreas complementares', () => {
    const { text } = buildDiagnosticEmail(makeValidRequest({ interviews }))
    const area2Section = text.split('ÁREA COMPLEMENTAR 1')[1].split('ÁREA COMPLEMENTAR 2')[0]
    const area3Section = text.split('ÁREA COMPLEMENTAR 2')[1]
    expect(area2Section).toContain('Nível: RÁPIDA')
    expect(area3Section).toContain('Nível: APROFUNDADA')
  })
})

describe('Cenário 6 — Área 1 + Área 2 aprofundada + Área 3 aprofundada (limite máximo)', () => {
  const interviews = [
    makeValidAreaInterview({ area: 'Financeiro' }),
    makeValidComplementaryInterview('Atendimento', 'APROFUNDADA'),
    makeValidComplementaryInterview('Comercial', 'APROFUNDADA'),
  ]

  it('é um payload válido no limite máximo de 3 áreas', () => {
    expectValidPayload(interviews)
  })

  it('uma quarta área nunca é permitida (MAX_AREAS = 3)', () => {
    const withFourth = [...interviews, makeValidComplementaryInterview('Marketing', 'RAPIDA')]
    const result = diagnosticRequestSchema.safeParse(
      makeValidRequest({ interviews: withFourth, areas: ['Financeiro', 'Atendimento', 'Comercial', 'Marketing'] }),
    )
    expect(result.success).toBe(false)
  })

  it('todas as áreas aprofundadas carregam avaliação de risco', () => {
    expect(interviews.every((interview) => interview.risk !== undefined)).toBe(true)
  })
})
