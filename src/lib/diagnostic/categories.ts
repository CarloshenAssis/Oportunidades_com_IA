/** As 7 categorias de oportunidade do material original (SPEC V2 §19), mais "OUTRA" como escape hatch (§20). */
export const OPPORTUNITY_CATEGORIES = [
  'Criação',
  'Análise',
  'Pesquisa',
  'Classificação',
  'Extração',
  'Atendimento',
  'Apoio à decisão',
  'OUTRA',
] as const

export type OpportunityCategory = (typeof OPPORTUNITY_CATEGORIES)[number]

type CategoryDefinition = {
  verbs: string[]
  description: string
}

export const CATEGORY_DEFINITIONS: Record<Exclude<OpportunityCategory, 'OUTRA'>, CategoryDefinition> = {
  Criação: {
    verbs: ['escrever', 'revisar', 'adaptar', 'resumir', 'gerar'],
    description: 'Produção ou adaptação de conteúdo: textos, propostas, respostas, resumos.',
  },
  Análise: {
    verbs: ['comparar', 'interpretar', 'encontrar padrões', 'transformar dados em conclusões'],
    description: 'Interpretar dados ou informações para chegar a uma conclusão.',
  },
  Pesquisa: {
    verbs: ['buscar', 'organizar', 'sintetizar informações'],
    description: 'Buscar e organizar informações espalhadas em diferentes fontes.',
  },
  Classificação: {
    verbs: ['categorizar', 'priorizar', 'triar', 'direcionar'],
    description: 'Organizar, triar ou direcionar itens segundo critérios.',
  },
  Extração: {
    verbs: ['retirar dados de documentos', 'PDFs', 'contratos', 'notas', 'formulários'],
    description: 'Retirar informações estruturadas de documentos não estruturados.',
  },
  Atendimento: {
    verbs: ['responder', 'direcionar', 'padronizar respostas'],
    description: 'Responder ou direcionar solicitações de clientes ou colegas.',
  },
  'Apoio à decisão': {
    verbs: ['comparar cenários', 'organizar riscos', 'levantar prós e contras'],
    description: 'Organizar informações para apoiar uma decisão humana.',
  },
}
