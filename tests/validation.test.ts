import { describe, expect, it } from 'vitest'
import { diagnosticRequestSchema } from '@/lib/validation/diagnostic'
import { FIELD_LIMITS } from '@/lib/config/limits'
import { makeValidRequest } from './fixtures'

describe('diagnosticRequestSchema', () => {
  it('aceita um formulário válido', () => {
    const result = diagnosticRequestSchema.safeParse(makeValidRequest())
    expect(result.success).toBe(true)
  })

  it('rejeita quando faltam campos obrigatórios', () => {
    const invalid = makeValidRequest({ company: { companyName: '', segment: 'Alimentação', employeeRange: '6–10' } })
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

  it('rejeita campo de texto acima do limite máximo', () => {
    const invalid = makeValidRequest()
    invalid.operation.mainActivities = 'a'.repeat(FIELD_LIMITS.mainActivities + 1)
    const result = diagnosticRequestSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })

  it('rejeita nome da empresa acima do limite máximo', () => {
    const invalid = makeValidRequest()
    invalid.company.companyName = 'a'.repeat(FIELD_LIMITS.companyName + 1)
    const result = diagnosticRequestSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })

  it('exige a descrição da dependência quando peopleDependency é "Sim"', () => {
    const invalid = makeValidRequest()
    invalid.problems.peopleDependency = 'Sim'
    delete invalid.problems.peopleDependencyDescription
    const result = diagnosticRequestSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })

  it('exige a descrição do segmento quando segment é "Outro"', () => {
    const invalid = makeValidRequest({
      company: { companyName: 'Empresa X', segment: 'Outro', employeeRange: '1–5' },
    })
    const result = diagnosticRequestSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })

  it('rejeita segmento fora da lista de opções permitidas', () => {
    const invalid = makeValidRequest()
    // @ts-expect-error testando enum inválido de propósito
    invalid.company.segment = 'Segmento Inexistente'
    const result = diagnosticRequestSchema.safeParse(invalid)
    expect(result.success).toBe(false)
  })
})
