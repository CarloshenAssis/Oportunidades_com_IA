import { beforeEach, describe, expect, it, vi } from 'vitest'

const { createTransportMock, verifyMock, sendMailMock } = vi.hoisted(() => ({
  createTransportMock: vi.fn(),
  verifyMock: vi.fn(),
  sendMailMock: vi.fn(),
}))

vi.mock('nodemailer', () => ({
  default: { createTransport: createTransportMock },
}))

const { sendDiagnosticEmail, EmailConfigError, SmtpAuthError, SmtpConnectionError, EmailSendError } = await import(
  '@/lib/email/send'
)

const REQUIRED_KEYS = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASSWORD', 'DIAGNOSTIC_OWNER_EMAIL'] as const

const SECRET_PASSWORD = 'super-secret-app-password-do-not-log'

const VALID_ENV: Record<(typeof REQUIRED_KEYS)[number], string> = {
  SMTP_HOST: 'smtp.gmail.com',
  SMTP_PORT: '587',
  SMTP_USER: 'diagnostico@gmail.com',
  SMTP_PASSWORD: SECRET_PASSWORD,
  DIAGNOSTIC_OWNER_EMAIL: 'carloshen.senai@gmail.com',
}

let logSpy: ReturnType<typeof vi.spyOn>
let errorSpy: ReturnType<typeof vi.spyOn>

function allLoggedText(): string {
  return [...logSpy.mock.calls, ...errorSpy.mock.calls].flat().map(String).join('\n')
}

beforeEach(() => {
  for (const key of REQUIRED_KEYS) delete process.env[key]
  delete process.env.SMTP_SECURE
  delete process.env.SMTP_FROM
  Object.assign(process.env, VALID_ENV)

  createTransportMock.mockReset()
  createTransportMock.mockReturnValue({ verify: verifyMock, sendMail: sendMailMock })
  verifyMock.mockReset()
  verifyMock.mockResolvedValue(true)
  sendMailMock.mockReset()
  sendMailMock.mockResolvedValue({ messageId: '<msg-1@localhost>' })

  logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined)
  errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
})

describe('sendDiagnosticEmail — SMTP configurado corretamente', () => {
  it('envia com sucesso (1) e usa DIAGNOSTIC_OWNER_EMAIL como destinatário', async () => {
    await expect(sendDiagnosticEmail('Assunto', 'Corpo')).resolves.toBeUndefined()

    expect(createTransportMock).toHaveBeenCalledWith(
      expect.objectContaining({ host: 'smtp.gmail.com', port: 587, secure: false }),
    )
    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'carloshen.senai@gmail.com', subject: 'Assunto', text: 'Corpo' }),
    )
  })

  it('usa secure=true automaticamente na porta 465 (compatibilidade Gmail)', async () => {
    process.env.SMTP_PORT = '465'
    await sendDiagnosticEmail('a', 'b')
    expect(createTransportMock).toHaveBeenCalledWith(expect.objectContaining({ port: 465, secure: true }))
  })

  it('registra os passos de diagnóstico [EMAIL] no formato esperado, sem valores sensíveis', async () => {
    await sendDiagnosticEmail('a', 'b')
    const text = allLoggedText()

    expect(text).toContain('[EMAIL] SMTP configuration detected: yes')
    expect(text).toContain('[EMAIL] Host: smtp.gmail.com')
    expect(text).toContain('[EMAIL] Port: 587')
    expect(text).toContain('[EMAIL] User configured: yes')
    expect(text).toContain('[EMAIL] Destination configured: yes')
    expect(text).toContain('[EMAIL] SMTP connection result: ok')
    expect(text).toContain('[EMAIL] SMTP authentication result: ok')
    expect(text).toContain('[EMAIL] Send result: ok')

    // nem o usuário nem o destinatário reais aparecem nos logs — só a confirmação "yes"
    expect(text).not.toContain('diagnostico@gmail.com')
    expect(text).not.toContain('carloshen.senai@gmail.com')
  })
})

describe('sendDiagnosticEmail — configuração ausente (nunca há fallback silencioso)', () => {
  it('SMTP_HOST ausente (2): lança EmailConfigError e não chega a criar o transporte', async () => {
    delete process.env.SMTP_HOST
    await expect(sendDiagnosticEmail('a', 'b')).rejects.toBeInstanceOf(EmailConfigError)
    expect(createTransportMock).not.toHaveBeenCalled()
    expect(allLoggedText()).toContain('[EMAIL] Missing required configuration: SMTP_HOST')
  })

  it('SMTP_USER ausente (3): lança EmailConfigError', async () => {
    delete process.env.SMTP_USER
    await expect(sendDiagnosticEmail('a', 'b')).rejects.toBeInstanceOf(EmailConfigError)
    expect(allLoggedText()).toContain('SMTP_USER')
  })

  it('SMTP_PASSWORD ausente (4): lança EmailConfigError', async () => {
    delete process.env.SMTP_PASSWORD
    await expect(sendDiagnosticEmail('a', 'b')).rejects.toBeInstanceOf(EmailConfigError)
    expect(allLoggedText()).toContain('SMTP_PASSWORD')
  })

  it('DIAGNOSTIC_OWNER_EMAIL ausente (5): lança EmailConfigError', async () => {
    delete process.env.DIAGNOSTIC_OWNER_EMAIL
    await expect(sendDiagnosticEmail('a', 'b')).rejects.toBeInstanceOf(EmailConfigError)
    expect(allLoggedText()).toContain('DIAGNOSTIC_OWNER_EMAIL')
  })

  it('SMTP_PORT inválida: lança EmailConfigError sem tentar conectar', async () => {
    process.env.SMTP_PORT = 'not-a-number'
    await expect(sendDiagnosticEmail('a', 'b')).rejects.toBeInstanceOf(EmailConfigError)
    expect(createTransportMock).not.toHaveBeenCalled()
  })

  it('registra "SMTP configuration detected: no" quando falta configuração', async () => {
    delete process.env.SMTP_HOST
    await expect(sendDiagnosticEmail('a', 'b')).rejects.toThrow()
    expect(allLoggedText()).toContain('[EMAIL] SMTP configuration detected: no')
  })
})

describe('sendDiagnosticEmail — falhas de conexão e autenticação SMTP', () => {
  it('falha de autenticação (6): lança SmtpAuthError e nunca tenta enviar a mensagem', async () => {
    const authError = Object.assign(new Error('Invalid login: 535-5.7.8 Username and Password not accepted'), {
      code: 'EAUTH',
      responseCode: 535,
    })
    verifyMock.mockRejectedValueOnce(authError)

    await expect(sendDiagnosticEmail('a', 'b')).rejects.toBeInstanceOf(SmtpAuthError)
    expect(sendMailMock).not.toHaveBeenCalled()
    expect(allLoggedText()).toContain('[EMAIL] SMTP authentication result: failed')
  })

  it('falha de conexão (7): lança SmtpConnectionError e nunca tenta enviar a mensagem', async () => {
    const connError = Object.assign(new Error('connect ECONNREFUSED 127.0.0.1:587'), { code: 'ECONNECTION' })
    verifyMock.mockRejectedValueOnce(connError)

    await expect(sendDiagnosticEmail('a', 'b')).rejects.toBeInstanceOf(SmtpConnectionError)
    expect(sendMailMock).not.toHaveBeenCalled()
    expect(allLoggedText()).toContain('[EMAIL] SMTP connection result: failed')
  })

  it('conexão e autenticação OK, mas o envio falha: lança EmailSendError', async () => {
    sendMailMock.mockRejectedValueOnce(new Error('Message rejected by server'))
    await expect(sendDiagnosticEmail('a', 'b')).rejects.toBeInstanceOf(EmailSendError)
    expect(allLoggedText()).toContain('[EMAIL] Send result: failed')
  })

  it('nenhuma credencial aparece nos logs, mesmo quando o erro traz a mensagem do servidor (8/9)', async () => {
    const authError = Object.assign(new Error('Invalid login: 535-5.7.8 Username and Password not accepted'), {
      code: 'EAUTH',
    })
    verifyMock.mockRejectedValueOnce(authError)

    await expect(sendDiagnosticEmail('a', 'b')).rejects.toThrow()

    const text = allLoggedText()
    expect(text).not.toContain(SECRET_PASSWORD)
  })
})
