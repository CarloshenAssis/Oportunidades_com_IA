import { getOpenAIClient, getOpenAIModel } from '@/lib/ai/openai'
import { SYSTEM_PROMPT, buildUserPrompt } from '@/lib/ai/prompt'
import { AI_OUTPUT_JSON_SCHEMA, diagnosticResultSchema, type DiagnosticResult } from '@/lib/ai/schema'
import type { DiagnosticRequest } from '@/types/diagnostic'
import { AI_TIMEOUT_MS, MAX_OPPORTUNITIES, MAX_OUTPUT_TOKENS } from '@/lib/config/limits'

export class AIAnalysisError extends Error {
  cause?: unknown

  constructor(message: string, cause?: unknown) {
    super(message)
    this.name = 'AIAnalysisError'
    this.cause = cause
  }
}

/** Garante o limite de oportunidades antes da validação, sem descartar uma resposta boa por excesso de itens. */
function trimOpportunities(json: unknown): unknown {
  if (
    json !== null &&
    typeof json === 'object' &&
    'opportunities' in json &&
    Array.isArray((json as Record<string, unknown>).opportunities)
  ) {
    const record = json as Record<string, unknown>
    record.opportunities = (record.opportunities as unknown[]).slice(0, MAX_OPPORTUNITIES)
  }
  return json
}

/** Faz o parsing e a validação da resposta da IA. Nunca confia no formato sem revalidar. */
export function parseAIOutput(raw: string): DiagnosticResult {
  let json: unknown
  try {
    json = JSON.parse(raw)
  } catch (error) {
    throw new AIAnalysisError('Resposta da IA não é um JSON válido.', error)
  }

  const trimmed = trimOpportunities(json)
  const result = diagnosticResultSchema.safeParse(trimmed)

  if (!result.success) {
    throw new AIAnalysisError('Resposta da IA não segue o formato esperado.', result.error)
  }

  return result.data
}

export async function analyzeDiagnostic(request: DiagnosticRequest): Promise<DiagnosticResult> {
  const client = getOpenAIClient()
  const model = getOpenAIModel()

  let outputText: string | null | undefined
  try {
    const response = await client.responses.create(
      {
        model,
        instructions: SYSTEM_PROMPT,
        input: buildUserPrompt(request),
        max_output_tokens: MAX_OUTPUT_TOKENS,
        text: {
          format: {
            type: 'json_schema',
            name: 'diagnostic_result',
            strict: true,
            schema: AI_OUTPUT_JSON_SCHEMA,
          },
        },
      },
      { timeout: AI_TIMEOUT_MS },
    )
    outputText = response.output_text
  } catch (error) {
    throw new AIAnalysisError('Falha ao chamar a API da OpenAI.', error)
  }

  if (!outputText) {
    throw new AIAnalysisError('A OpenAI não retornou conteúdo.')
  }

  return parseAIOutput(outputText)
}
