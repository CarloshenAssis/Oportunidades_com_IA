import { normalizeText } from './normalize'

/** Banco de gatilhos (SPEC V2 §51) usado para destacar blocos relevantes e alimentar o contexto da IA. */
export const TRIGGER_CATEGORIES = [
  'DOCUMENTS',
  'TEXT',
  'CUSTOMER_SERVICE',
  'SPREADSHEETS',
  'DATA',
  'REPETITION',
  'REWORK',
  'ERRORS',
  'SEARCH',
  'CLASSIFICATION',
  'TRANSFER',
  'DECISION',
] as const

export type TriggerCategory = (typeof TRIGGER_CATEGORIES)[number]

const TRIGGER_KEYWORDS: Record<TriggerCategory, string[]> = {
  DOCUMENTS: ['documento', 'pdf', 'contrato', 'nota fiscal', 'nota', 'relatorio', 'arquivo', 'anexo', 'formulario'],
  TEXT: ['escrever', 'texto', 'proposta', 'email', 'e-mail', 'mensagem', 'redigir', 'redacao', 'comunicado'],
  CUSTOMER_SERVICE: ['whatsapp', 'atendimento', 'cliente', 'duvida', 'suporte', 'chat', 'responder'],
  SPREADSHEETS: ['planilha', 'excel', 'google sheets', 'sheets'],
  DATA: ['sistema', 'cadastro', 'banco de dados', 'informacao', 'dado'],
  REPETITION: ['todos os dias', 'toda semana', 'todo mes', 'sempre', 'repetitiv', 'rotina', 'diariamente'],
  REWORK: ['retrabalho', 'refazer', 'refazemos', 'corrigir de novo', 'revisar novamente'],
  ERRORS: ['erro', 'esquecimento', 'esquece', 'atraso', 'falha'],
  SEARCH: ['procurar', 'buscar', 'pesquisar', 'localizar', 'procura'],
  CLASSIFICATION: ['classificar', 'categorizar', 'triagem', 'triar', 'priorizar', 'direcionar'],
  TRANSFER: ['copiar e colar', 'transferir', 'copiar dados', 'migrar', 'lancar no sistema', 'digitar'],
  DECISION: ['decidir', 'decisao', 'comparar cenarios', 'avaliar opcoes', 'pros e contras'],
}

export function detectTriggersInText(text: string): TriggerCategory[] {
  const normalized = normalizeText(text)
  if (!normalized) return []
  return TRIGGER_CATEGORIES.filter((category) =>
    TRIGGER_KEYWORDS[category].some((keyword) => normalized.includes(keyword)),
  )
}

/** Detecta gatilhos em várias respostas ao mesmo tempo, sem duplicar categorias. */
export function detectTriggersInTexts(texts: Array<string | undefined>): TriggerCategory[] {
  const found = new Set<TriggerCategory>()
  for (const text of texts) {
    if (!text) continue
    for (const category of detectTriggersInText(text)) {
      found.add(category)
    }
  }
  return Array.from(found)
}
