import nodemailer from 'nodemailer'

/** Uma variável de ambiente obrigatória está ausente ou inválida — nada é enviado. */
export class EmailConfigError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'EmailConfigError'
  }
}

/** Não foi possível abrir uma conexão com o servidor SMTP (host/porta incorretos, rede, firewall, TLS). */
export class SmtpConnectionError extends Error {
  cause?: unknown

  constructor(message: string, cause?: unknown) {
    super(message)
    this.name = 'SmtpConnectionError'
    this.cause = cause
  }
}

/** A conexão foi aberta, mas o servidor rejeitou usuário/senha (ex.: Gmail exige senha de app). */
export class SmtpAuthError extends Error {
  cause?: unknown

  constructor(message: string, cause?: unknown) {
    super(message)
    this.name = 'SmtpAuthError'
    this.cause = cause
  }
}

/** Conexão e autenticação OK, mas o envio da mensagem em si falhou. */
export class EmailSendError extends Error {
  cause?: unknown

  constructor(message: string, cause?: unknown) {
    super(message)
    this.name = 'EmailSendError'
    this.cause = cause
  }
}

type SmtpConfig = {
  host: string
  port: number
  secure: boolean
  user: string
  password: string
  from: string
  ownerEmail: string
}

const REQUIRED_ENV_VARS = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASSWORD', 'DIAGNOSTIC_OWNER_EMAIL'] as const

/** Extrai só o que ajuda a depurar um erro de nodemailer/rede, nunca senha/credencial. */
function describeError(error: unknown): string {
  if (error && typeof error === 'object') {
    const err = error as { code?: unknown; command?: unknown; responseCode?: unknown; message?: unknown }
    const parts = [
      err.code ? `code=${String(err.code)}` : null,
      err.command ? `command=${String(err.command)}` : null,
      err.responseCode ? `responseCode=${String(err.responseCode)}` : null,
      err.message ? `message=${String(err.message)}` : null,
    ].filter(Boolean)
    if (parts.length > 0) return parts.join(' ')
  }
  return error instanceof Error ? error.message : 'erro desconhecido'
}

function getErrorCode(error: unknown): string | undefined {
  if (error && typeof error === 'object' && 'code' in error) {
    const code = (error as { code?: unknown }).code
    return typeof code === 'string' ? code : undefined
  }
  return undefined
}

/**
 * Lê e valida a configuração de e-mail a partir das variáveis de ambiente.
 * Nunca faz fallback silencioso: se algo obrigatório faltar, registra exatamente o que
 * falta (sem valores) e lança EmailConfigError — nada é enviado com configuração parcial.
 */
function readSmtpConfig(): SmtpConfig {
  const missing = REQUIRED_ENV_VARS.filter((name) => !process.env[name]?.trim())

  console.log(`[EMAIL] SMTP configuration detected: ${missing.length === 0 ? 'yes' : 'no'}`)

  if (missing.length > 0) {
    console.error(`[EMAIL] Missing required configuration: ${missing.join(', ')}`)
    throw new EmailConfigError(
      `Configuração de e-mail incompleta. Defina: ${missing.join(', ')}.`,
    )
  }

  const host = process.env.SMTP_HOST!.trim()
  const rawPort = process.env.SMTP_PORT!.trim()
  const port = Number(rawPort)
  const user = process.env.SMTP_USER!.trim()
  const password = process.env.SMTP_PASSWORD!
  const ownerEmail = process.env.DIAGNOSTIC_OWNER_EMAIL!.trim()

  console.log(`[EMAIL] Host: ${host}`)
  console.log(`[EMAIL] Port: ${rawPort}`)
  console.log('[EMAIL] User configured: yes')
  console.log('[EMAIL] Destination configured: yes')

  if (!Number.isFinite(port) || port <= 0) {
    console.error(`[EMAIL] Invalid SMTP_PORT: "${rawPort}" is not a positive number`)
    throw new EmailConfigError('SMTP_PORT inválida — defina um número de porta válido (ex.: 587 ou 465).')
  }

  return {
    host,
    port,
    secure: process.env.SMTP_SECURE === 'true' || port === 465,
    user,
    password,
    from: process.env.SMTP_FROM?.trim() || user,
    ownerEmail,
  }
}

/**
 * Envia o diagnóstico por e-mail para o dono do produto (SPEC V2 — pivot para coleta manual).
 * Compatível com Gmail: host smtp.gmail.com, porta 587 (secure=false, STARTTLS) ou 465
 * (secure=true), autenticando com uma senha de app (não a senha normal da conta — ver README).
 */
export async function sendDiagnosticEmail(subject: string, text: string): Promise<void> {
  const config = readSmtpConfig()

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: { user: config.user, pass: config.password },
  })

  try {
    await transporter.verify()
    console.log('[EMAIL] SMTP connection result: ok')
    console.log('[EMAIL] SMTP authentication result: ok')
  } catch (error) {
    if (getErrorCode(error) === 'EAUTH') {
      console.log('[EMAIL] SMTP connection result: ok')
      console.error('[EMAIL] SMTP authentication result: failed —', describeError(error))
      throw new SmtpAuthError('Falha de autenticação no servidor SMTP.', error)
    }
    console.error('[EMAIL] SMTP connection result: failed —', describeError(error))
    throw new SmtpConnectionError('Falha ao conectar ao servidor SMTP.', error)
  }

  try {
    const info = await transporter.sendMail({
      from: config.from,
      to: config.ownerEmail,
      subject,
      text,
    })
    console.log(`[EMAIL] Send result: ok${info?.messageId ? ` (messageId=${info.messageId})` : ''}`)
  } catch (error) {
    if (getErrorCode(error) === 'EAUTH') {
      console.error('[EMAIL] Send result: failed — SMTP authentication result: failed —', describeError(error))
      throw new SmtpAuthError('Falha de autenticação no servidor SMTP.', error)
    }
    console.error('[EMAIL] Send result: failed —', describeError(error))
    throw new EmailSendError('Falha ao enviar o e-mail do diagnóstico.', error)
  }
}
