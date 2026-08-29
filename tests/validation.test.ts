import { describe, expect, it } from 'vitest'
import { diagnosticRequestSchema } from '@/lib/validation/diagnostic'
import { FIELD_LIMITS } from '@/lib/config/limits'
import { MAX_AREAS } from '@/types/diagnostic'
import { makeValidAreaInterview, makeValidComplementaryInterview, makeValidRequest } from './fixtures'

describe('diagnosticRequestSchema', () => {
  it('aceita um formulário válido', () => {
    const result = diagnosticRequestSchema.safeParse(makeValidRequest())
    expect(result.success).toBe(true)
  })

  it('rejeita quando faltam campos obrigatórios da empresa', () => {
    const invalid = makeValidRequest({
      company: { companyName: '', segment: 'Alimentação', employeeRange: '6–10', mainBusinessActivity: 'x' },
    })
    const result = diagnosticRequestSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })

  it('rejeita e-mail inválido', () => {
    const invalid = makeValidRequest()
    invalid.contact.email = 'nao-e-um-email'
    const result = diagnosticRequestSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })

  it('aceita quando o e-mail não é informado (opcional)', () => {
    const valid = makeValidRequest()
    delete valid.contact.email
    const result = diagnosticRequestSchema.safeParse(valid)
    expect(result.success).toBe(true)
  })

  it('rejeita telefone inválido', () => {
    const invalid = makeValidRequest()
    invalid.contact.whatsapp = '123'
    const result = diagnosticRequestSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })

  it('rejeita quando o consentimento está ausente', () => {
    const invalid = makeValidRequest()
    invalid.contact.consent = false
    const result = diagnosticRequestSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })

  it('rejeita quando falta o nome do responsável', () => {
    const invalid = makeValidRequest()
    invalid.contact.responsibleName = ''
    const result = diagnosticRequestSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })

  it('rejeita campo de texto acima do limite máximo', () => {
    const invalid = makeValidRequest()
    invalid.interviews[0].dailyRepetitiveTasks = 'a'.repeat(FIELD_LIMITS.longAnswer + 1)
    const result = diagnosticRequestSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })

  it('rejeita nome da empresa acima do limite máximo', () => {
    const invalid = makeValidRequest()
    invalid.company.companyName = 'a'.repeat(FIELD_LIMITS.companyName + 1)
    const result = diagnosticRequestSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })

  it('aceita os blocos aprofundados em branco (não obriga a inventar tarefas)', () => {
    const valid = makeValidRequest({
      interviews: [
        makeValidAreaInterview({
          dailyRepetitiveTasks: '',
          weeklyRepetitiveTasks: '',
          monthlyRepetitiveTasks: '',
          mostTimeConsumingTask: '',
          taskToEliminate: '',
          reworkTasks: '',
          errorProcesses: '',
          keyPersonDependency: 'Não',
          dependencyProcess: '',
          dependencyDescription: '',
        }),
      ],
    })
    const result = diagnosticRequestSchema.safeParse(valid)
    expect(result.success).toBe(true)
  })

  it('exige o processo e a descrição da dependência quando keyPersonDependency é "Sim"', () => {
    const invalid = makeValidRequest({
      interviews: [makeValidAreaInterview({ keyPersonDependency: 'Sim', dependencyProcess: '', dependencyDescription: '' })],
    })
    const result = diagnosticRequestSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })

  it('exige a descrição do segmento quando segment é "Outro"', () => {
    const invalid = makeValidRequest({
      company: { companyName: 'Empresa X', segment: 'Outro', employeeRange: '1–5', mainBusinessActivity: 'x' },
    })
    const result = diagnosticRequestSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })

  it('rejeita mais de MAX_AREAS entrevistas', () => {
    const invalid = makeValidRequest({
      areas: ['Financeiro', 'Comercial', 'Atendimento', 'Operações'],
      interviews: [
        makeValidAreaInterview({ area: 'Financeiro' }),
        makeValidComplementaryInterview('Comercial', 'RAPIDA'),
        makeValidComplementaryInterview('Atendimento', 'RAPIDA'),
        makeValidComplementaryInterview('Operações', 'RAPIDA'),
      ],
    })
    expect(invalid.interviews.length).toBeGreaterThan(MAX_AREAS)
    const result = diagnosticRequestSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })

  it('rejeita área de entrevista que não está entre as áreas selecionadas', () => {
    const invalid = makeValidRequest({
      areas: ['Financeiro'],
      interviews: [makeValidAreaInterview({ area: 'Comercial' })],
    })
    const result = diagnosticRequestSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })

  it('rejeita quando não há nenhuma entrevista (a área 1 é obrigatória)', () => {
    const invalid = makeValidRequest({ interviews: [] })
    const result = diagnosticRequestSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })

  it('rejeita quando a primeira entrevista não é prioritária/aprofundada', () => {
    const invalid = makeValidRequest({
      interviews: [makeValidComplementaryInterview('Financeiro', 'RAPIDA')],
    })
    const result = diagnosticRequestSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })

  it('rejeita quando uma área além da primeira é marcada como prioritária', () => {
    const invalid = makeValidRequest({
      interviews: [
        makeValidAreaInterview({ area: 'Financeiro' }),
        { ...makeValidComplementaryInterview('Atendimento', 'RAPIDA'), role: 'PRIORITARIA' },
      ],
    })
    const result = diagnosticRequestSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })

  it('rejeita quando a mesma área é analisada duas vezes', () => {
    const invalid = makeValidRequest({
      interviews: [makeValidAreaInterview({ area: 'Financeiro' }), makeValidComplementaryInterview('Financeiro', 'RAPIDA')],
    })
    const result = diagnosticRequestSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })

  it('aceita 3 áreas distintas, cada uma com sua própria profundidade', () => {
    const valid = makeValidRequest({
      interviews: [
        makeValidAreaInterview({ area: 'Financeiro' }),
        makeValidComplementaryInterview('Atendimento', 'RAPIDA'),
        makeValidComplementaryInterview('Comercial', 'APROFUNDADA'),
      ],
    })
    const result = diagnosticRequestSchema.safeParse(valid)
    expect(result.success).toBe(true)
  })
})
