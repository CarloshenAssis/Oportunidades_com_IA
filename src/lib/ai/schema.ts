import { z } from 'zod'
import { MAX_OPPORTUNITIES, TOP_OPPORTUNITIES } from '@/lib/config/limits'
import { OPPORTUNITY_CATEGORIES } from '@/lib/diagnostic/categories'
import { SOLUTION_LEVELS, SOLUTION_TYPES } from '@/lib/diagnostic/solution-tree'

export const MATURITY_LEVELS = ['Inicial', 'Em desenvolvimento', 'Estruturada', 'Avançada'] as const
export const RISK_LEVELS = ['GREEN', 'YELLOW', 'RED'] as const
export const CONFIDENCE_LEVELS = ['HIGH', 'MEDIUM', 'LOW'] as const

const shortText = z.string().trim().min(1).max(160)
const mediumText = z.string().trim().min(1).max(700)
const longText = z.string().trim().min(1).max(1400)

const score0to5 = z.number().min(0).max(5).nullable()

export const bottleneckSchema = z.object({
  title: shortText,
  description: mediumText,
})

/** Uma oportunidade (SPEC V2 §40). */
export const opportunitySchema = z.object({
  id: z.string().trim().min(1).max(60),
  title: shortText,
  area: shortText,
  task: mediumText,
  problem: mediumText,
  evidence: mediumText,
  category: z.array(z.enum(OPPORTUNITY_CATEGORIES)).min(1).max(3),
  frequencyScore: score0to5,
  timeScore: score0to5,
  repetitionScore: score0to5,
  standardizationScore: score0to5,
  impactScore: score0to5,
  totalScore: z.number().min(0).max(25).nullable(),
  peopleCount: z.number().positive().nullable(),
  monthlyExecutions: z.number().nonnegative().nullable(),
  minutesPerExecution: z.number().positive().nullable(),
  monthlyHours: z.number().nonnegative().nullable(),
  riskLevel: z.enum(RISK_LEVELS),
  solutionLevel: z.enum(SOLUTION_LEVELS),
  solutionType: z.enum(SOLUTION_TYPES),
  proposedSolution: mediumText,
  justification: mediumText,
  confidence: z.enum(CONFIDENCE_LEVELS),
})

/** Aprofundamento da oportunidade #1 a testar (SPEC V2 §45). */
export const firstOpportunitySchema = z.object({
  opportunityId: z.string().trim().min(1).max(60),
  problem: mediumText,
  currentProcess: mediumText,
  task: mediumText,
  evidence: mediumText,
  proposedSolution: mediumText,
  solutionLevel: z.enum(SOLUTION_LEVELS),
  solutionLevelReason: mediumText,
  riskLevel: z.enum(RISK_LEVELS),
  monthlyHours: z.number().nonnegative().nullable(),
  estimatedImpact: mediumText,
  successMetric: mediumText,
})

export const diagnosticResultSchema = z
  .object({
    executiveSummary: longText,
    companyMaturity: z.object({
      level: z.enum(MATURITY_LEVELS),
      description: mediumText,
    }),
    areasAnalyzed: z.array(shortText).min(1).max(3),
    mainBottlenecks: z.array(bottleneckSchema).min(1).max(5),
    opportunities: z.array(opportunitySchema).min(1).max(MAX_OPPORTUNITIES),
    top3: z.array(z.string().trim().min(1)).min(1).max(TOP_OPPORTUNITIES),
    firstOpportunity: firstOpportunitySchema,
    missingInformation: z.array(shortText).max(10),
    generalRecommendations: z.array(shortText).min(1).max(6),
  })
  .superRefine((data, ctx) => {
    const ids = new Set(data.opportunities.map((opportunity) => opportunity.id))

    data.top3.forEach((id, index) => {
      if (!ids.has(id)) {
        ctx.addIssue({
          code: 'custom',
          message: 'top3 referencia uma oportunidade que não existe em opportunities.',
          path: ['top3', index],
        })
      }
    })

    if (!ids.has(data.firstOpportunity.opportunityId)) {
      ctx.addIssue({
        code: 'custom',
        message: 'firstOpportunity referencia uma oportunidade que não existe em opportunities.',
        path: ['firstOpportunity', 'opportunityId'],
      })
    }
  })

export type DiagnosticResult = z.infer<typeof diagnosticResultSchema>
export type Opportunity = z.infer<typeof opportunitySchema>
export type Bottleneck = z.infer<typeof bottleneckSchema>
export type FirstOpportunity = z.infer<typeof firstOpportunitySchema>

/**
 * Schema JSON escrito à mão (sem minLength/maxLength/minItems) para o modo
 * estrito de saída estruturada da OpenAI, que só suporta um subconjunto do
 * JSON Schema. A validação completa é sempre refeita no backend com
 * `diagnosticResultSchema`, nunca confiando apenas na saída estruturada da API.
 */
const numberOrNull = { type: ['number', 'null'] } as const

const opportunityJsonSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    id: { type: 'string' },
    title: { type: 'string' },
    area: { type: 'string' },
    task: { type: 'string' },
    problem: { type: 'string' },
    evidence: { type: 'string' },
    category: { type: 'array', items: { type: 'string', enum: OPPORTUNITY_CATEGORIES } },
    frequencyScore: numberOrNull,
    timeScore: numberOrNull,
    repetitionScore: numberOrNull,
    standardizationScore: numberOrNull,
    impactScore: numberOrNull,
    totalScore: numberOrNull,
    peopleCount: numberOrNull,
    monthlyExecutions: numberOrNull,
    minutesPerExecution: numberOrNull,
    monthlyHours: numberOrNull,
    riskLevel: { type: 'string', enum: RISK_LEVELS },
    solutionLevel: { type: 'string', enum: SOLUTION_LEVELS },
    solutionType: { type: 'string', enum: SOLUTION_TYPES },
    proposedSolution: { type: 'string' },
    justification: { type: 'string' },
    confidence: { type: 'string', enum: CONFIDENCE_LEVELS },
  },
  required: [
    'id',
    'title',
    'area',
    'task',
    'problem',
    'evidence',
    'category',
    'frequencyScore',
    'timeScore',
    'repetitionScore',
    'standardizationScore',
    'impactScore',
    'totalScore',
    'peopleCount',
    'monthlyExecutions',
    'minutesPerExecution',
    'monthlyHours',
    'riskLevel',
    'solutionLevel',
    'solutionType',
    'proposedSolution',
    'justification',
    'confidence',
  ],
} as const

export const AI_OUTPUT_JSON_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    executiveSummary: { type: 'string' },
    companyMaturity: {
      type: 'object',
      additionalProperties: false,
      properties: {
        level: { type: 'string', enum: MATURITY_LEVELS },
        description: { type: 'string' },
      },
      required: ['level', 'description'],
    },
    areasAnalyzed: { type: 'array', items: { type: 'string' } },
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
    opportunities: { type: 'array', items: opportunityJsonSchema },
    top3: { type: 'array', items: { type: 'string' } },
    firstOpportunity: {
      type: 'object',
      additionalProperties: false,
      properties: {
        opportunityId: { type: 'string' },
        problem: { type: 'string' },
        currentProcess: { type: 'string' },
        task: { type: 'string' },
        evidence: { type: 'string' },
        proposedSolution: { type: 'string' },
        solutionLevel: { type: 'string', enum: SOLUTION_LEVELS },
        solutionLevelReason: { type: 'string' },
        riskLevel: { type: 'string', enum: RISK_LEVELS },
        monthlyHours: numberOrNull,
        estimatedImpact: { type: 'string' },
        successMetric: { type: 'string' },
      },
      required: [
        'opportunityId',
        'problem',
        'currentProcess',
        'task',
        'evidence',
        'proposedSolution',
        'solutionLevel',
        'solutionLevelReason',
        'riskLevel',
        'monthlyHours',
        'estimatedImpact',
        'successMetric',
      ],
    },
    missingInformation: { type: 'array', items: { type: 'string' } },
    generalRecommendations: { type: 'array', items: { type: 'string' } },
  },
  required: [
    'executiveSummary',
    'companyMaturity',
    'areasAnalyzed',
    'mainBottlenecks',
    'opportunities',
    'top3',
    'firstOpportunity',
    'missingInformation',
    'generalRecommendations',
  ],
} as const
