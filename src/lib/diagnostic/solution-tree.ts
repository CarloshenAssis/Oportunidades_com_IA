/**
 * Árvore de solução (SPEC V2 §31–§32): sempre escolher a solução mais simples
 * capaz de resolver o problema. A decisão de qual nível se aplica a uma tarefa
 * específica exige entender o problema (tarefa da IA, SPEC V2 §34.8) — este
 * módulo fornece a estrutura canônica que orienta o prompt, valida a saída da
 * IA e alimenta a apresentação no relatório.
 */

export const SOLUTION_LEVELS = ['N1', 'N2', 'N3', 'N4', 'N5', 'N6'] as const
export type SolutionLevel = (typeof SOLUTION_LEVELS)[number]

export const SOLUTION_TYPES = [
  'PROMPT',
  'ASSISTANT',
  'KNOWLEDGE_BASE',
  'AUTOMATION',
  'AGENT',
  'CUSTOM_SYSTEM',
] as const
export type SolutionType = (typeof SOLUTION_TYPES)[number]

export const SOLUTION_LEVEL_TO_TYPE: Record<SolutionLevel, SolutionType> = {
  N1: 'PROMPT',
  N2: 'ASSISTANT',
  N3: 'KNOWLEDGE_BASE',
  N4: 'AUTOMATION',
  N5: 'AGENT',
  N6: 'CUSTOM_SYSTEM',
}

export const SOLUTION_TYPE_TO_LEVEL: Record<SolutionType, SolutionLevel> = {
  PROMPT: 'N1',
  ASSISTANT: 'N2',
  KNOWLEDGE_BASE: 'N3',
  AUTOMATION: 'N4',
  AGENT: 'N5',
  CUSTOM_SYSTEM: 'N6',
}

type SolutionNodeDefinition = {
  level: SolutionLevel
  type: SolutionType
  label: string
  question: string
  description: string
}

/** Ordem da árvore, do mais simples ao mais complexo (SPEC V2 §31). */
export const SOLUTION_TREE: SolutionNodeDefinition[] = [
  {
    level: 'N1',
    type: 'PROMPT',
    label: 'Prompt',
    question: 'É resolvido com uma instrução simples?',
    description: 'Uma instrução (prompt) pontual já resolve o problema, sem necessidade de configuração adicional.',
  },
  {
    level: 'N2',
    type: 'ASSISTANT',
    label: 'Assistente personalizado',
    question: 'É repetitivo e usa sempre as mesmas instruções?',
    description: 'A tarefa se repete com o mesmo tipo de instrução, o que justifica um assistente configurado uma vez e reutilizado.',
  },
  {
    level: 'N3',
    type: 'KNOWLEDGE_BASE',
    label: 'Base de conhecimento',
    question: 'Precisa consultar documentos internos?',
    description: 'A tarefa depende de consultar documentos ou informações internas específicas da empresa.',
  },
  {
    level: 'N4',
    type: 'AUTOMATION',
    label: 'Automação',
    question: 'Possui várias etapas repetitivas?',
    description: 'A tarefa é composta por várias etapas estruturadas e repetitivas, adequadas para automação.',
  },
  {
    level: 'N5',
    type: 'AGENT',
    label: 'Agente + ferramentas',
    question: 'Precisa consultar/executar ações em outros sistemas?',
    description: 'A tarefa exige tomar decisões e executar ações em múltiplos sistemas de forma encadeada.',
  },
  {
    level: 'N6',
    type: 'CUSTOM_SYSTEM',
    label: 'Sistema personalizado',
    question: 'Precisa de aplicação própria?',
    description: 'Nenhuma das soluções anteriores é suficiente; é necessário construir uma aplicação sob medida.',
  },
]

export function describeSolutionLevel(level: SolutionLevel): SolutionNodeDefinition {
  const node = SOLUTION_TREE.find((entry) => entry.level === level)
  if (!node) {
    throw new Error(`Nível de solução desconhecido: ${level}`)
  }
  return node
}

/** Verifica se o par nível/tipo é consistente com a árvore canônica (SPEC V2 §40). */
export function isConsistentSolutionPair(level: SolutionLevel, type: SolutionType): boolean {
  return SOLUTION_LEVEL_TO_TYPE[level] === type
}

/** Índice de complexidade (0 = mais simples). Útil para checar a "regra de ouro" (§32) em revisões futuras. */
export function solutionComplexityRank(level: SolutionLevel): number {
  return SOLUTION_LEVELS.indexOf(level)
}

export const SOLUTION_TREE_PROMPT_DESCRIPTION = SOLUTION_TREE.map(
  (node, index) => `${index + 1}. ${node.question} → se sim: ${node.level} — ${node.label} (${node.description})`,
).join('\n')
