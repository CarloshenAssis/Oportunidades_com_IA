import type { DiagnosticRequest } from '@/types/diagnostic'

export function makeValidRequest(overrides: Partial<DiagnosticRequest> = {}): DiagnosticRequest {
  return {
    company: {
      companyName: 'Padaria Bom Pão',
      segment: 'Alimentação',
      employeeRange: '6–10',
    },
    operation: {
      mainActivities: 'Atendimento ao cliente, produção de pães e controle de estoque diário.',
      repetitiveTasks: 'Todos os dias respondemos as mesmas perguntas no WhatsApp sobre horário e encomendas.',
      timeConsumingTasks: 'Organizar pedidos e responder mensagens repetitivas consome grande parte do dia.',
    },
    problems: {
      rework: 'Retrabalho ao refazer pedidos anotados errado no caderno.',
      manualProcesses: 'Anotamos pedidos manualmente no caderno e depois passamos para planilha.',
      errors: 'Às vezes esquecemos encomendas ou erramos o horário de entrega.',
      peopleDependency: 'Sim',
      peopleDependencyDescription: 'Só a dona sabe organizar a agenda de encomendas.',
    },
    technology: {
      tools: ['WhatsApp', 'Excel'],
      aiMaturity: 'Não utilizamos',
    },
    contact: {
      whatsapp: '11999998888',
      email: 'contato@padaria.com',
      consent: true,
    },
    ...overrides,
  }
}

export function makeValidAIResult(overridesOpportunity: Record<string, unknown> = {}) {
  return {
    executiveSummary: 'Resumo executivo com pelo menos algumas palavras sobre a análise realizada.',
    maturity: {
      level: 'Inicial',
      description: 'A empresa ainda não utiliza IA de forma estruturada.',
    },
    mainBottlenecks: [{ title: 'Atendimento manual', description: 'Respostas repetitivas digitadas manualmente.' }],
    opportunities: [
      {
        title: 'Triagem automática de mensagens',
        process: 'Atendimento',
        problem: 'A equipe responde manualmente perguntas repetitivas.',
        evidence: 'A empresa informou que recebe mensagens repetitivas pelo WhatsApp.',
        solution: 'Uma IA pode sugerir respostas para as perguntas mais frequentes.',
        solutionType: 'AI',
        priority: 'HIGH',
        confidence: 'HIGH',
        justification: 'O processo envolve interpretação de linguagem natural variável.',
        ...overridesOpportunity,
      },
    ],
    nextSteps: ['Mapear em detalhe o fluxo de atendimento pelo WhatsApp.'],
  }
}
