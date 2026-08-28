import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { AIAnalysisError } from '@/lib/ai/analyze'
import { makeValidRequest, makeValidAIResult } from './fixtures'

const { analyzeDiagnosticMock } = vi.hoisted(() => ({ analyzeDiagnosticMock: vi.fn() }))

vi.mock('@/lib/ai/analyze', async () => {
  const actual = await vi.importActual<typeof import('@/lib/ai/analyze')>('@/lib/ai/analyze')
  return { ...actual, analyzeDiagnostic: analyzeDiagnosticMock }
})

const { POST } = await import('@/app/api/diagnostico/route')

let ipCounter = 0

function request(body: unknown, rawBody?: string) {
  ipCounter += 1
  return new NextRequest('http://localhost/api/diagnostico', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': `10.0.0.${ipCounter}` },
    body: rawBody ?? JSON.stringify(body),
  })
}

beforeEach(() => {
  analyzeDiagnosticMock.mockReset()
})

describe('POST /api/diagnostico', () => {
  it('retorna 200 e o resultado para um payload válido', async () => {
    analyzeDiagnosticMock.mockResolvedValueOnce(makeValidAIResult())

    const response = await POST(request(makeValidRequest()))
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json.result).toBeDefined()
    expect(json.result.opportunities).toHaveLength(1)
    expect(analyzeDiagnosticMock).toHaveBeenCalledOnce()
  })

  it('nunca inclui a chave da OpenAI na resposta', async () => {
    analyzeDiagnosticMock.mockResolvedValueOnce(makeValidAIResult())
    const response = await POST(request(makeValidRequest()))
    const text = await response.text()
    expect(text).not.toContain('OPENAI_API_KEY')
    expect(text).not.toContain('sk-')
  })

  it('retorna 400 para um payload inválido e não chama a IA', async () => {
    const invalid = makeValidRequest()
    invalid.contact.whatsapp = '123'

    const response = await POST(request(invalid))
    const json = await response.json()

    expect(response.status).toBe(400)
    expect(json.error).toBeDefined()
    expect(analyzeDiagnosticMock).not.toHaveBeenCalled()
  })

  it('retorna 400 para um corpo que não é JSON válido', async () => {
    const response = await POST(request(undefined, '{ isso não é json'))
    expect(response.status).toBe(400)
  })

  it('retorna 502 com mensagem genérica quando a IA falha', async () => {
    analyzeDiagnosticMock.mockRejectedValueOnce(new AIAnalysisError('Falha ao chamar a API da OpenAI.'))

    const response = await POST(request(makeValidRequest()))
    const json = await response.json()

    expect(response.status).toBe(502)
    expect(json.error).toMatch(/não conseguimos gerar seu diagnóstico/i)
  })

  it('retorna 502 com mensagem genérica em caso de timeout/erro inesperado', async () => {
    analyzeDiagnosticMock.mockRejectedValueOnce(new Error('timeout of 30000ms exceeded'))

    const response = await POST(request(makeValidRequest()))
    const json = await response.json()

    expect(response.status).toBe(502)
    expect(json.error).toMatch(/não conseguimos gerar seu diagnóstico/i)
    expect(json.error).not.toMatch(/timeout/i)
  })
})
