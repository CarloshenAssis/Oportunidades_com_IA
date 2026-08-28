import { NextRequest, NextResponse } from 'next/server'
import { diagnosticRequestSchema } from '@/lib/validation/diagnostic'
import { analyzeDiagnostic } from '@/lib/ai/analyze'
import { checkRateLimit } from '@/lib/rate-limit'
import { MAX_REQUEST_BYTES } from '@/lib/config/limits'

export const runtime = 'nodejs'

const GENERIC_ERROR_MESSAGE =
  'Não conseguimos gerar seu diagnóstico agora. Tente novamente em alguns instantes.'

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
    const result = await analyzeDiagnostic(parsed.data)
    return NextResponse.json({ result })
  } catch (error) {
    console.error('[api/diagnostico] falha ao gerar diagnóstico:', error instanceof Error ? error.message : 'erro desconhecido')
    return NextResponse.json({ error: GENERIC_ERROR_MESSAGE }, { status: 502 })
  }
}
