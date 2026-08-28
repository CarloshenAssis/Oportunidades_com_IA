// Constantes centralizadas de limites e custo (SPEC V2 §32, §59, mantendo o espírito da V1 §32).
// Não espalhar estes números pelo restante do projeto — importar deste arquivo.

export const FIELD_LIMITS = {
  companyName: 100,
  segmentOther: 100,
  mainBusinessActivity: 1000,
  areaName: 60,
  areaReason: 500,
  /** Respostas principais dos blocos A–K (perguntas abertas de investigação). */
  longAnswer: 1500,
  /** Respostas de acompanhamento condicionais (mais curtas por natureza). */
  shortAnswer: 500,
  additionalNotes: 1000,
  responsibleName: 100,
  whatsapp: 20,
  email: 254,
} as const

/** Tamanho máximo aceito para o corpo da requisição do endpoint de diagnóstico, em bytes. */
export const MAX_REQUEST_BYTES = 60_000

/** Número máximo de oportunidades identificadas no diagnóstico (SPEC V2 §38). */
export const MAX_OPPORTUNITIES = 10

/** Número de oportunidades destacadas como prioridade máxima (SPEC V2 §38, §44). */
export const TOP_OPPORTUNITIES = 3

/** Limite de tokens de saída na chamada à OpenAI, para controle de custo. */
export const MAX_OUTPUT_TOKENS = 6000

/** Tempo máximo de espera pela resposta da OpenAI antes de desistir. */
export const AI_TIMEOUT_MS = 45_000

/** Janela e limite usados pelo rate limiting simples em memória do endpoint. */
export const RATE_LIMIT = {
  windowMs: 60_000,
  maxRequests: 5,
} as const
