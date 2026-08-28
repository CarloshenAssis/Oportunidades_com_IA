// Constantes centralizadas de limites e custo (SPEC.md §32).
// Não espalhar estes números pelo restante do projeto — importar deste arquivo.

export const FIELD_LIMITS = {
  companyName: 100,
  segmentOther: 100,
  mainActivities: 2000,
  repetitiveTasks: 2000,
  timeConsumingTasks: 2000,
  rework: 2000,
  manualProcesses: 2000,
  errors: 2000,
  peopleDependencyDescription: 500,
  technologyNotes: 1000,
  whatsapp: 20,
  email: 254,
} as const

/** Tamanho máximo aceito para o corpo da requisição do endpoint de diagnóstico, em bytes. */
export const MAX_REQUEST_BYTES = 20_000

/** Número máximo de oportunidades retornadas no diagnóstico. */
export const MAX_OPPORTUNITIES = 5

/** Número mínimo recomendado de oportunidades fortes. */
export const RECOMMENDED_OPPORTUNITIES = 3

/** Limite de tokens de saída na chamada à OpenAI, para controle de custo. */
export const MAX_OUTPUT_TOKENS = 2500

/** Tempo máximo de espera pela resposta da OpenAI antes de desistir. */
export const AI_TIMEOUT_MS = 30_000

/** Janela e limite usados pelo rate limiting simples em memória do endpoint. */
export const RATE_LIMIT = {
  windowMs: 60_000,
  maxRequests: 5,
} as const
