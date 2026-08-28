import OpenAI from 'openai'

const DEFAULT_MODEL = 'gpt-5.5'

let client: OpenAI | null = null

/** Client OpenAI, criado sob demanda para nunca ser instanciado (nem falhar) no build/no bundle do cliente. */
export function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY não está configurada.')
  }

  if (!client) {
    client = new OpenAI({ apiKey })
  }

  return client
}

export function getOpenAIModel(): string {
  return process.env.OPENAI_MODEL?.trim() || DEFAULT_MODEL
}
