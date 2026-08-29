import type { AreaDepth, AreaInterview, DiagnosticRequest } from '@/types/diagnostic'
import { createEmptyAreaInterview } from '@/lib/validation/diagnostic'

/** Entrevista aprofundada de exemplo para a área prioritária (SPEC V3 §6). */
export function makeValidAreaInterview(overrides: Partial<AreaInterview> = {}): AreaInterview {
  return {
    ...createEmptyAreaInterview('Financeiro', 'PRIORITARIA', 'APROFUNDADA'),
    dailyRepetitiveTasks: 'Todos os dias recebemos notas fiscais por e-mail e lançamos manualmente no sistema.',
    weeklyRepetitiveTasks: 'Toda semana conferimos os pagamentos pendentes em uma planilha.',
    monthlyRepetitiveTasks: 'Todo mês fechamos o balancete manualmente.',
    mainTasks: 'Lançamento de notas fiscais e conciliação de pagamentos.',
    mostTimeConsumingTask: 'Lançar notas fiscais recebidas por e-mail no sistema financeiro.',
    taskToEliminate: 'Digitar manualmente os dados das notas fiscais.',
    currentProcessSummary: 'Recebemos a nota por e-mail, abrimos o PDF e digitamos os dados no sistema financeiro.',
    tools: ['E-mail', 'Sistema interno'],
    hasInformationTransfer: 'Sim',
    informationSource: 'E-mail',
    informationDestination: 'Sistema financeiro interno',
    hasDocuments: 'Sim',
    documentTypes: 'Notas fiscais em PDF recebidas por e-mail.',
    documentExtraction: 'Valor, CNPJ do fornecedor e data de vencimento.',
    documentDataEntryAfter: 'Sim',
    keyPersonDependency: 'Sim',
    dependencyProcess: 'Conciliação de pagamentos pendentes.',
    dependencyDescription: 'Só a gerente financeira sabe conciliar os pagamentos pendentes.',
    reworkTasks: 'Lançamentos com o CNPJ do fornecedor errado.',
    errorProcesses: 'Erros de digitação no valor da nota fiscal.',
    risk: {
      personalData: 'Não',
      financialData: 'Sim',
      customerData: 'Não',
      employeeData: 'Não',
      confidentialData: 'Não',
    },
    ...overrides,
  }
}

/** Entrevista complementar de exemplo, rápida ou aprofundada (SPEC V3 §8, §9). */
export function makeValidComplementaryInterview(
  area: string,
  depth: AreaDepth,
  overrides: Partial<AreaInterview> = {},
): AreaInterview {
  const base: AreaInterview = {
    ...createEmptyAreaInterview(area, 'COMPLEMENTAR', depth),
    mainTasks: 'Atendimento a clientes por WhatsApp e telefone.',
    mostTimeConsumingTask: 'Responder dúvidas repetidas sobre o status de pedidos.',
    taskToEliminate: 'Copiar respostas prontas manualmente para cada cliente.',
    currentProcessSummary: 'A equipe responde manualmente cada mensagem recebida no WhatsApp.',
    tools: ['WhatsApp'],
    hasInformationTransfer: 'Não',
    keyPersonDependency: 'Não',
    hasDocuments: 'Não',
  }

  if (depth === 'RAPIDA') {
    return { ...base, hasReworkOrErrors: 'Não', ...overrides }
  }

  return {
    ...base,
    risk: { personalData: 'Não', financialData: 'Não', customerData: 'Sim', employeeData: 'Não', confidentialData: 'Não' },
    ...overrides,
  }
}

export function makeValidRequest(overrides: Partial<DiagnosticRequest> = {}): DiagnosticRequest {
  return {
    company: {
      companyName: 'Padaria Bom Pão',
      segment: 'Alimentação',
      employeeRange: '6–10',
      mainBusinessActivity: 'Produção e venda de pães, bolos e encomendas.',
    },
    areas: ['Financeiro', 'Atendimento', 'Comercial'],
    interviews: [makeValidAreaInterview()],
    contact: {
      responsibleName: 'Maria Silva',
      whatsapp: '11999998888',
      email: 'contato@padaria.com',
      consent: true,
    },
    ...overrides,
  }
}

export function makeValidAIResult(overridesOpportunity: Record<string, unknown> = {}) {
  const opportunity = {
    id: 'op-1',
    title: 'Extração automática de dados de notas fiscais',
    area: 'Financeiro',
    task: 'Lançamento de notas fiscais recebidas por e-mail',
    problem: 'A equipe lê e digita manualmente os dados de cada nota fiscal recebida por e-mail.',
    evidence: 'A empresa informou que recebe notas fiscais por e-mail e lança os dados manualmente todos os dias.',
    category: ['Extração'],
    frequencyScore: 5,
    timeScore: 4,
    repetitionScore: 5,
    standardizationScore: 4,
    impactScore: 4,
    totalScore: 22,
    peopleCount: 1,
    monthlyExecutions: 60,
    minutesPerExecution: 10,
    monthlyHours: 10,
    riskLevel: 'YELLOW',
    solutionLevel: 'N4',
    solutionType: 'AUTOMATION',
    proposedSolution: 'Uma automação pode extrair os dados da nota fiscal e lançá-los no sistema financeiro.',
    justification: 'O processo é repetitivo e estruturado, típico de automação.',
    confidence: 'HIGH',
    ...overridesOpportunity,
  }

  return {
    executiveSummary: 'Resumo executivo com pelo menos algumas palavras sobre a análise realizada.',
    companyMaturity: {
      level: 'Inicial',
      description: 'A empresa ainda não utiliza IA de forma estruturada.',
    },
    areasAnalyzed: ['Financeiro'],
    mainBottlenecks: [{ title: 'Lançamento manual de notas', description: 'Dados são digitados manualmente todos os dias.' }],
    opportunities: [opportunity],
    top3: ['op-1'],
    firstOpportunity: {
      opportunityId: 'op-1',
      problem: opportunity.problem,
      currentProcess: 'A equipe recebe a nota por e-mail, abre o PDF e digita os dados no sistema.',
      task: opportunity.task,
      evidence: opportunity.evidence,
      proposedSolution: opportunity.proposedSolution,
      solutionLevel: 'N4',
      solutionLevelReason: 'O processo tem várias etapas repetitivas, mas não exige decisões complexas.',
      riskLevel: 'YELLOW',
      monthlyHours: 10,
      estimatedImpact: 'Estimativa preliminar de redução de tempo gasto no lançamento manual.',
      successMetric: 'Tempo médio de lançamento por nota fiscal.',
    },
    missingInformation: ['Sistema financeiro utilizado atualmente.'],
    generalRecommendations: ['Avaliar segurança e privacidade dos dados financeiros antes de qualquer teste.'],
  }
}
