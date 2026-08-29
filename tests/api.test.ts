import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { EmailConfigError, EmailSendError, SmtpAuthError, SmtpConnectionError } from '@/lib/email/send'
import { makeValidRequest, makeValidQuickRequest } from './fixtures'

const { sendDiagnosticEmailMock, analyzeDiagnosticMock } = vi.hoisted(() => ({
  sendDiagnosticEmailMock: vi.fn(),
  analyzeDiagnosticMock: vi.fn(),
}))

vi.mock('@/lib/email/send', async () => {
  const actual = await vi.importActual<typeof import('@/lib/email/send')>('@/lib/email/send')
  return { ...actual, sendDiagnosticEmail: sendDiagnosticEmailMock }
})

// Módulo de IA dormente — espiado apenas para provar que o endpoint ativo nunca o chama (SPEC §9.8).
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
    headers: { 'content-type': 'application/json', 'x-forwarded-for': `10.0.1.${ipCounter}` },
    body: rawBody ?? JSON.stringify(body),
  })
}

beforeEach(() => {
  sendDiagnosticEmailMock.mockReset()
  analyzeDiagnosticMock.mockReset()
})

describe('POST /api/diagnostico', () => {
  it('retorna 200 e envia o e-mail para um payload válido', async () => {
    sendDiagnosticEmailMock.mockResolvedValueOnce(undefined)

    const response = await POST(request(makeValidRequest()))
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json.success).toBe(true)
    expect(sendDiagnosticEmailMock).toHaveBeenCalledOnce()
  })

  it('envia o assunto com o nome da empresa e o corpo com as respostas', async () => {
    sendDiagnosticEmailMock.mockResolvedValueOnce(undefined)
    await POST(request(makeValidRequest()))

    const [subject, body] = sendDiagnosticEmailMock.mock.calls[0]
    expect(subject).toContain('Padaria Bom Pão')
    expect(body).toContain('RESPONSÁVEL')
  })

  it('nunca inclui credenciais de e-mail na resposta', async () => {
    sendDiagnosticEmailMock.mockResolvedValueOnce(undefined)
    const response = await POST(request(makeValidRequest()))
    const text = await response.text()
    expect(text).not.toMatch(/SMTP_PASSWORD|SMTP_USER/)
  })

  it('retorna 400 para um payload inválido e não envia e-mail', async () => {
    const invalid = makeValidRequest()
    invalid.contact.whatsapp = '123'

    const response = await POST(request(invalid))
    const json = await response.json()

    expect(response.status).toBe(400)
    expect(json.error).toBeDefined()
    expect(sendDiagnosticEmailMock).not.toHaveBeenCalled()
  })

  it('retorna 400 para um corpo que não é JSON válido', async () => {
    const response = await POST(request(undefined, '{ isso não é json'))
    expect(response.status).toBe(400)
  })

  it('retorna 502 com mensagem que preserva as respostas quando o envio de e-mail falha', async () => {
    sendDiagnosticEmailMock.mockRejectedValueOnce(new EmailSendError('Falha ao enviar o e-mail do diagnóstico.'))

    const response = await POST(request(makeValidRequest()))
    const json = await response.json()

    expect(response.status).toBe(502)
    expect(json.error).toMatch(/suas respostas foram preservadas/i)
  })

  it('retorna 502 genérico em caso de erro inesperado, sem vazar detalhes técnicos', async () => {
    sendDiagnosticEmailMock.mockRejectedValueOnce(new Error('connect ECONNREFUSED smtp.example.com:587'))

    const response = await POST(request(makeValidRequest()))
    const json = await response.json()

    expect(response.status).toBe(502)
    expect(json.error).not.toMatch(/ECONNREFUSED|smtp\.example\.com/)
  })

  it('modo completo envia corretamente, com o assunto identificando o modo', async () => {
    sendDiagnosticEmailMock.mockResolvedValueOnce(undefined)

    const response = await POST(request(makeValidRequest({ diagnosticMode: 'complete' })))
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json.success).toBe(true)
    const [subject] = sendDiagnosticEmailMock.mock.calls[0]
    expect(subject).toContain('[Diagnóstico Completo]')
  })

  it('modo rápido envia corretamente, com o assunto identificando o modo', async () => {
    sendDiagnosticEmailMock.mockResolvedValueOnce(undefined)

    const response = await POST(request(makeValidQuickRequest()))
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json.success).toBe(true)
    const [subject, body] = sendDiagnosticEmailMock.mock.calls[0]
    expect(subject).toContain('[Diagnóstico Rápido]')
    expect(body).toContain('DIAGNÓSTICO RÁPIDO')
  })

  it('nunca chama o módulo de IA (dormente), nem no modo rápido nem no completo', async () => {
    sendDiagnosticEmailMock.mockResolvedValue(undefined)

    await POST(request(makeValidRequest({ diagnosticMode: 'complete' })))
    await POST(request(makeValidQuickRequest()))

    expect(analyzeDiagnosticMock).not.toHaveBeenCalled()
  })

  it.each([
    ['configuração ausente/incompleta', () => new EmailConfigError('Configuração de e-mail incompleta. Defina: SMTP_HOST.')],
    ['falha de conexão SMTP', () => new SmtpConnectionError('Falha ao conectar ao servidor SMTP.')],
    ['falha de autenticação SMTP', () => new SmtpAuthError('Falha de autenticação no servidor SMTP.')],
    ['falha de envio', () => new EmailSendError('Falha ao enviar o e-mail do diagnóstico.')],
  ])('retorna sempre a mesma resposta genérica em caso de %s, sem vazar detalhes técnicos', async (_label, makeError) => {
    sendDiagnosticEmailMock.mockRejectedValueOnce(makeError())

    const response = await POST(request(makeValidRequest()))
    const text = await response.clone().text()
    const json = await response.json()

    expect(response.status).toBe(502)
    expect(json.error).toMatch(/suas respostas foram preservadas/i)
    expect(text).not.toMatch(/SMTP_HOST|SMTP_PASSWORD|SMTP_USER|EAUTH|ECONNECTION/)
  })
})
