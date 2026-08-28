import { z } from 'zod'
import { MAX_OPPORTUNITIES } from '@/lib/config/limits'

export const MATURITY_LEVELS = ['Inicial', 'Em desenvolvimento', 'Estruturada', 'Avançada'] as const
export const SOLUTION_TYPES = ['AI', 'AUTOMATION', 'AI_AND_AUTOMATION'] as const
export const PRIORITY_LEVELS = ['HIGH', 'MEDIUM', 'LOW'] as const
export const CONFIDENCE_LEVELS = ['HIGH', 'MEDIUM', 'LOW'] as const

const shortText = z.string().trim().min(1).max(160)
const mediumText = z.string().trim().min(1).max(700)
const longText = z.string().trim().min(1).max(1200)

export const bottleneckSchema = z.object({
  title: shortText,
  description: mediumText,
})

export const opportunitySchema = z.object({
  title: shortText,
  process: shortText,
  problem: mediumText,
  evidence: mediumText,
  solution: mediumText,
  solutionType: z.enum(SOLUTION_TYPES),
  priority: z.enum(PRIORITY_LEVELS),
  confidence: z.enum(CONFIDENCE_LEVELS),
  justification: mediumText,
})

export const diagnosticResultSchema = z.object({
  executiveSummary: longText,
  maturity: z.object({
    level: z.enum(MATURITY_LEVELS),
    description: mediumText,
  }),
  mainBottlenecks: z.array(bottleneckSchema).min(1).max(6),
  opportunities: z.array(opportunitySchema).min(1).max(MAX_OPPORTUNITIES),
  nextSteps: z.array(shortText).min(1).max(6),
})

export type DiagnosticResult = z.infer<typeof diagnosticResultSchema>
export type Opportunity = z.infer<typeof opportunitySchema>
export type Bottleneck = z.infer<typeof bottleneckSchema>

/**
 * Schema JSON escrito à mão (sem minLength/maxLength/minItems) para o modo estrito de
 * saída estruturada da OpenAI, que só suporta um subconjunto do JSON Schema. A validação
 * completa (tamanhos, limite de oportunidades) é sempre refeita no backend com
 * `diagnosticResultSchema`, nunca confiando apenas na saída estruturada da API.
 */
export const AI_OUTPUT_JSON_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    executiveSummary: { type: 'string' },
    maturity: {
      type: 'object',
      additionalProperties: false,
      properties: {
        level: { type: 'string', enum: MATURITY_LEVELS },
        description: { type: 'string' },
      },
      required: ['level', 'description'],
    },
    mainBottlenecks: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
        },
        required: ['title', 'description'],
      },
    },
    opportunities: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          title: { type: 'string' },
          process: { type: 'string' },
          problem: { type: 'string' },
          evidence: { type: 'string' },
          solution: { type: 'string' },
          solutionType: { type: 'string', enum: SOLUTION_TYPES },
          priority: { type: 'string', enum: PRIORITY_LEVELS },
          confidence: { type: 'string', enum: CONFIDENCE_LEVELS },
          justification: { type: 'string' },
        },
        required: [
          'title',
          'process',
          'problem',
          'evidence',
          'solution',
          'solutionType',
          'priority',
          'confidence',
          'justification',
        ],
      },
    },
    nextSteps: {
      type: 'array',
      items: { type: 'string' },
    },
  },
  required: ['executiveSummary', 'maturity', 'mainBottlenecks', 'opportunities', 'nextSteps'],
} as const
