import { NextRequest, NextResponse } from 'next/server'
import { diagnosticRequestSchema } from '@/lib/validation/diagnostic'
import { buildDiagnosticEmail } from '@/lib/email/template'
import { EmailConfigError, SmtpAuthError, SmtpConnectionError, sendDiagnosticEmail } from '@/lib/email/send'
import { checkRateLimit } from '@/lib/rate-limit'
import { MAX_REQUEST_BYTES } from '@/lib/config/limits'

export const runtime = 'nodejs'

const GENERIC_ERROR_MESSAGE =
  'Não conseguimos enviar seu diagnóstico. Suas respostas foram preservadas nesta página. Tente novamente.'

function getClientKey(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }
  return request.headers.get('x-real-ip') ?? 'unknown'
}

export async function POST(request: NextRequest) {
  const clientKey = getClientKey(request)
  if (!checkRateLimit(clientKey)) {
    return NextResponse.json(
      { error: 'Muitas solicitações. Aguarde um instante antes de tentar novamente.' },
      { status: 429 },
    )
  }

  const rawBody = await request.text()
  if (new TextEncoder().encode(rawBody).length > MAX_REQUEST_BYTES) {
    return NextResponse.json({ error: 'Requisição excede o tamanho máximo permitido.' }, { status: 413 })
  }

  let body: unknown
  try {
    body = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'JSON inválido.' }, { status: 400 })
  }

  const parsed = diagnosticRequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: 'Dados inválidos.',
        issues: parsed.error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        })),
      },
      { status: 400 },
    )
  }

  try {
    const { subject, text } = buildDiagnosticEmail(parsed.data)
    await sendDiagnosticEmail(subject, text)
    return NextResponse.json({ success: true })
  } catch (error) {
    // A categoria (config/conexão/autenticação/envio) só é usada para o log do servidor —
    // o cliente sempre recebe a mesma mensagem genérica, sem detalhes técnicos ou credenciais.
    const category =
      error instanceof EmailConfigError
        ? 'configuração'
        : error instanceof SmtpConnectionError
          ? 'conexão SMTP'
          : error instanceof SmtpAuthError
            ? 'autenticação SMTP'
            : 'envio'
    console.error(
      `[api/diagnostico] falha ao enviar e-mail (categoria: ${category}):`,
      error instanceof Error ? error.message : 'erro desconhecido',
    )
    return NextResponse.json({ error: GENERIC_ERROR_MESSAGE }, { status: 502 })
  }
}
