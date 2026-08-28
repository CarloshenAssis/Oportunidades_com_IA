import { describe, expect, it } from 'vitest'
import { diagnosticRequestSchema } from '@/lib/validation/diagnostic'
import { FIELD_LIMITS } from '@/lib/config/limits'
import { MAX_PRIORITY_AREAS } from '@/types/diagnostic'
import { makeValidAreaInterview, makeValidRequest } from './fixtures'

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

  it('aceita blocos A–K em branco (não obriga a inventar tarefas)', () => {
    const valid = makeValidRequest({
      interviews: [
        makeValidAreaInterview({
          dailyRepetitiveTasks: '',
          weeklyRepetitiveTasks: '',
          monthlyRepetitiveTasks: '',
          mostTimeConsumingTask: '',
          taskTheyWouldEliminate: '',
          copyPasteTasks: '',
          documentTasks: '',
          keyPersonDependency: 'Não',
          dependencyDescription: '',
        }),
      ],
    })
    const result = diagnosticRequestSchema.safeParse(valid)
    expect(result.success).toBe(true)
  })

  it('exige a descrição da dependência quando keyPersonDependency é "Sim"', () => {
    const invalid = makeValidRequest({
      interviews: [makeValidAreaInterview({ keyPersonDependency: 'Sim', dependencyDescription: '' })],
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

  it('rejeita mais de MAX_PRIORITY_AREAS áreas prioritárias', () => {
    const invalid = makeValidRequest({
      areas: ['Financeiro', 'Comercial', 'Atendimento', 'Operações'],
      priorityAreas: [
        { area: 'Financeiro', reason: 'x' },
        { area: 'Comercial', reason: 'x' },
        { area: 'Atendimento', reason: 'x' },
        { area: 'Operações', reason: 'x' },
      ],
    })
    expect(invalid.priorityAreas.length).toBeGreaterThan(MAX_PRIORITY_AREAS)
    const result = diagnosticRequestSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })

  it('rejeita área prioritária que não está entre as áreas selecionadas', () => {
    const invalid = makeValidRequest({
      areas: ['Financeiro'],
      priorityAreas: [{ area: 'Comercial', reason: 'x' }],
      interviews: [makeValidAreaInterview({ area: 'Comercial' })],
    })
    const result = diagnosticRequestSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })

  it('rejeita quando o número de entrevistas não bate com as áreas prioritárias', () => {
    const invalid = makeValidRequest({ interviews: [] })
    const result = diagnosticRequestSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })
})
