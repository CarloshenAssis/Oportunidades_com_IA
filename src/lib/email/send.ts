import nodemailer from 'nodemailer'

export class EmailConfigError extends Error {}
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

function readSmtpConfig(): SmtpConfig {
  const host = process.env.SMTP_HOST
  const port = process.env.SMTP_PORT
  const user = process.env.SMTP_USER
  const password = process.env.SMTP_PASSWORD
  const ownerEmail = process.env.DIAGNOSTIC_OWNER_EMAIL

  if (!host || !port || !user || !password || !ownerEmail) {
    throw new EmailConfigError(
      'Configuração de e-mail incompleta. Defina SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD e DIAGNOSTIC_OWNER_EMAIL.',
    )
  }

  return {
    host,
    port: Number(port),
    secure: process.env.SMTP_SECURE === 'true' || Number(port) === 465,
    user,
    password,
    from: process.env.SMTP_FROM?.trim() || user,
    ownerEmail,
  }
}

/** Envia o diagnóstico por e-mail para o dono do produto (SPEC V2 — pivot para coleta manual). */
export async function sendDiagnosticEmail(subject: string, text: string): Promise<void> {
  const config = readSmtpConfig()

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: { user: config.user, pass: config.password },
  })

  try {
    await transporter.sendMail({
      from: config.from,
      to: config.ownerEmail,
      subject,
      text,
    })
  } catch (error) {
    throw new EmailSendError('Falha ao enviar o e-mail do diagnóstico.', error)
  }
}
