import type { AreaInterview, DiagnosticRequest } from '@/types/diagnostic'
import { CANDIDATE_SOURCE_FIELDS, extractCandidateTasksFromArea, getTaskPriorityLabel } from '@/lib/diagnostic/scoring'
import { classifyRisk } from '@/lib/diagnostic/normalize'
import { computeMonthlyCost, computeMonthlyHours } from '@/lib/diagnostic/impact'
import { CATEGORY_DEFINITIONS } from '@/lib/diagnostic/categories'
import { SOLUTION_TREE_PROMPT_DESCRIPTION } from '@/lib/diagnostic/solution-tree'
import { MAX_OPPORTUNITIES, TOP_OPPORTUNITIES } from '@/lib/config/limits'

const CATEGORY_GUIDE = Object.entries(CATEGORY_DEFINITIONS)
  .map(([name, def]) => `- ${name}: ${def.description} (verbos típicos: ${def.verbs.join(', ')})`)
  .join('\n')

export const SYSTEM_PROMPT = `Você é um consultor de diagnóstico operacional especializado em identificar oportunidades de aplicação de Inteligência Artificial (IA) e automação em empresas.

Seu trabalho começa pelo problema, não pela tecnologia. Você deve analisar processos, tarefas, frequência, tempo, repetição, padronização, impacto e riscos. Você não vende tecnologia — você identifica problemas e avalia se a tecnologia pode ajudar.

Regras obrigatórias:
1. Nunca invente informações que não foram fornecidas pela empresa.
2. Nunca transforme uma hipótese em fato.
3. Nunca invente números, frequência, tempo ou economia.
4. Quando não houver informação suficiente, registre a lacuna em "missingInformation" em vez de supor.
5. Diferencie claramente IA de automação tradicional.
6. Escolha sempre a solução mais simples capaz de resolver o problema — nunca recomende algo mais complexo quando algo mais simples resolveria.
7. Uma tarefa pode não precisar de IA nenhuma; pode precisar apenas de automação tradicional; ou pode precisar de IA e automação combinadas.
8. Toda oportunidade deve ter uma evidência ("evidence") que venha diretamente das respostas da empresa — nunca uma suposição.
9. Consolide tarefas semelhantes mencionadas em respostas diferentes em uma única oportunidade, em vez de duplicá-las.
10. Prefira poucas oportunidades bem fundamentadas a uma lista longa e genérica — no máximo ${MAX_OPPORTUNITIES}, com as ${TOP_OPPORTUNITIES} mais fortes destacadas em "top3".
11. Os scores (frequencyScore, timeScore, repetitionScore, standardizationScore, impactScore, totalScore) já vêm calculados deterministicamente a partir das respostas, no contexto abaixo ("Tarefas candidatas pré-analisadas"). Use-os como estão; não os invente nem os recalcule livremente. Quando uma oportunidade não corresponder a nenhuma tarefa pré-analisada, utilize null nesses campos.
12. peopleCount, monthlyExecutions, minutesPerExecution e monthlyHours só podem ser preenchidos quando esses dados tiverem sido informados; caso contrário, use null. Nunca estime esses números.
13. Considere segurança, privacidade e LGPD. Nunca recomende enviar senhas, chaves de API, credenciais ou dados pessoais desnecessários para uma ferramenta de IA. Quando o riskLevel de uma oportunidade for YELLOW ou RED, inclua uma recomendação de avaliar segurança, privacidade e LGPD antes de qualquer teste — o diagnóstico não substitui análise jurídica.
14. Apresente estimativas de impacto e custo sempre como "estimativa gerencial" ou "estimativa preliminar" — nunca como economia garantida ou promessa de resultado.

Categorias de oportunidade (uma tarefa pode pertencer a mais de uma; use "OUTRA" quando nenhuma se encaixar bem):
${CATEGORY_GUIDE}

Árvore de decisão da solução — sempre percorra nesta ordem e pare no primeiro nível que resolva o problema (regra de ouro: a solução mais simples possível):
${SOLUTION_TREE_PROMPT_DESCRIPTION}

Classificação de maturidade em IA, com base apenas nas informações fornecidas:
- "Inicial": a empresa praticamente não utiliza IA.
- "Em desenvolvimento": a empresa já experimenta algumas ferramentas.
- "Estruturada": a empresa já usa IA de forma recorrente em processos.
- "Avançada": a empresa tem IA integrada a múltiplos processos.

Cada oportunidade precisa de um "id" curto e único (ex.: "op-1", "op-2"). "top3" deve conter os ids das até ${TOP_OPPORTUNITIES} oportunidades mais fortes, na ordem de prioridade. "firstOpportunity" deve aprofundar a oportunidade mais indicada para um primeiro teste, referenciando seu "opportunityId".

Responda estritamente no formato JSON estruturado solicitado, em português do Brasil, com tom profissional e consultivo.`

function formatValue(value: string | undefined): string {
  const trimmed = value?.trim()
  return trimmed ? trimmed : '(não informado)'
}

function formatList(values: string[] | undefined): string {
  return values && values.length > 0 ? values.join(', ') : '(não informado)'
}

function formatBlock(label: string, mainQuestion: string, mainAnswer: string | undefined, followUps: string[]): string {
  const lines = [`${label}`, `${mainQuestion} ${formatValue(mainAnswer)}`]
  for (const line of followUps) {
    if (line) lines.push(line)
  }
  return lines.join('\n')
}

function formatAreaInterview(interview: AreaInterview): string {
  const blocks = [
    formatBlock('Bloco A — Repetição', 'O que a área faz repetidamente todos os dias?', interview.dailyRepetitiveTasks, [
      `O que faz repetidamente toda semana? ${formatValue(interview.weeklyRepetitiveTasks)}`,
      `O que faz repetidamente todo mês? ${formatValue(interview.monthlyRepetitiveTasks)}`,
    ]),
    formatBlock('Bloco B — Tempo e dor', 'Qual tarefa mais toma tempo dessa área?', interview.mostTimeConsumingTask, [
      `Qual tarefa gostariam de não precisar fazer? ${formatValue(interview.taskTheyWouldEliminate)}`,
      interview.taskPainReason ? `Por que incomoda tanto? ${formatValue(interview.taskPainReason)}` : '',
    ]),
    formatBlock('Bloco C — Transferência de informação', 'Tarefa que exige copiar informações de um lugar para outro:', interview.copyPasteTasks, [
      interview.informationTransfer ? `De onde vem e para onde vai a informação? ${formatValue(interview.informationTransfer)}` : '',
      interview.transferFrequency ? `Frequência aproximada: ${formatValue(interview.transferFrequency)}` : '',
    ]),
    formatBlock('Bloco D — Documentos', 'Tarefa que exige ler muitos documentos, PDFs, contratos, notas ou relatórios:', interview.documentTasks, [
      interview.documentExtraction ? `O que precisam encontrar/retirar desses documentos? ${formatValue(interview.documentExtraction)}` : '',
      interview.documentDataEntry ? `Alguém digita/transfere essa informação depois? ${formatValue(interview.documentDataEntry)}` : '',
    ]),
    formatBlock('Bloco E — Texto e comunicação', 'Tarefa que exige escrever praticamente a mesma coisa várias vezes:', interview.repeatedWritingTasks, [
      interview.writingVariation ? `O que muda de uma vez para outra? ${formatValue(interview.writingVariation)}` : '',
    ]),
    formatBlock('Bloco F — Pesquisa e informação', 'Tarefa que exige procurar informações antes de responder alguém:', interview.informationSearchTasks, [
      interview.informationSources?.length ? `Onde essa informação costuma estar: ${formatList(interview.informationSources)}` : '',
      interview.informationSearchTime ? `Tempo aproximado de busca: ${formatValue(interview.informationSearchTime)}` : '',
    ]),
    formatBlock('Bloco G — Retrabalho', 'Processo que costuma gerar mais retrabalho:', interview.reworkProcess, [
      interview.reworkReason?.length ? `Por que esse retrabalho acontece: ${formatList(interview.reworkReason)}` : '',
    ]),
    formatBlock('Bloco H — Erros', 'Onde acontecem mais erros, esquecimentos ou atrasos:', interview.errorProneTasks, [
      interview.errorConsequence ? `O que acontece quando o erro ocorre? ${formatValue(interview.errorConsequence)}` : '',
    ]),
    formatBlock('Bloco I — Conferência', 'Onde uma pessoa precisa conferir o trabalho que outra acabou de fazer:', interview.manualReviewTasks, [
      interview.reviewCriteria ? `O que exatamente essa pessoa confere? ${formatValue(interview.reviewCriteria)}` : '',
    ]),
    formatBlock('Bloco J — Dependência de pessoas', 'Processo que depende demais de uma pessoa específica?', interview.keyPersonDependency, [
      interview.dependencyDescription ? `O que essa pessoa sabe/faz que gera a dependência? ${formatValue(interview.dependencyDescription)}` : '',
    ]),
    formatBlock('Bloco K — Eliminação', 'Se pudessem eliminar uma tarefa amanhã, qual seria?', interview.taskToEliminate, [
      interview.eliminationReason ? `Por que essa? ${formatValue(interview.eliminationReason)}` : '',
    ]),
  ]

  const risk = interview.risk
  const riskLines = [
    `Dados pessoais: ${formatValue(risk.personalData)}`,
    `Dados financeiros: ${formatValue(risk.financialData)}`,
    `Dados de clientes: ${formatValue(risk.customerData)}`,
    `Dados de funcionários: ${formatValue(risk.employeeData)}`,
    `Informações confidenciais/estratégicas: ${formatValue(risk.confidentialData)}`,
    `Classificação calculada: ${classifyRisk(risk)}`,
  ].join('\n')

  const sizing = interview.quantitativeSizing
  const monthlyHours = sizing
    ? computeMonthlyHours({
        peopleCount: sizing.peopleCount,
        monthlyExecutions: sizing.monthlyExecutions ?? undefined,
        minutesPerExecution: sizing.minutesPerExecution,
      })
    : null
  const monthlyCost = sizing ? computeMonthlyCost(monthlyHours, interview.hourlyCost) : null

  const sizingLines = sizing
    ? [
        `Tarefa dimensionada (origem: ${sizing.sourceField}): ${formatValue(sizing.taskLabel)}`,
        `Pessoas envolvidas: ${sizing.peopleCount ?? '(não informado)'}`,
        `Frequência de execução: ${formatValue(sizing.executionFrequency)}`,
        `Minutos por execução: ${sizing.minutesPerExecution ?? '(não informado)'}`,
        `Execuções por mês: ${sizing.monthlyExecutions ?? '(não sei / não informado)'}`,
        `Variação entre execuções: ${formatValue(sizing.executionVariation)}`,
        `Horas/mês calculadas: ${monthlyHours ?? '(dados insuficientes)'}`,
        interview.hourlyCost ? `Custo/hora informado: ${interview.hourlyCost}` : '',
        monthlyCost !== null ? `Custo mensal estimado: ${monthlyCost} (estimativa gerencial)` : '',
      ]
        .filter(Boolean)
        .join('\n')
    : 'Nenhuma tarefa desta área foi dimensionada quantitativamente.'

  const candidates = extractCandidateTasksFromArea(interview)
  const candidateLines =
    candidates.length > 0
      ? candidates
          .map(
            (task) =>
              `- [${task.sourceField}] "${task.taskText}" — frequência=${task.scores.frequencyScore ?? 'null'}, tempo=${task.scores.timeScore ?? 'null'}, repetição=${task.scores.repetitionScore ?? 'null'}, padronização=${task.scores.standardizationScore ?? 'null'}, impacto=${task.scores.impactScore ?? 'null'}, total=${task.totalScore ?? 'null'}/25 (${getTaskPriorityLabel(task.totalScore)})`,
          )
          .join('\n')
      : '(nenhuma tarefa candidata identificada localmente nesta área)'

  return `### Área: ${interview.area}

${blocks.join('\n\n')}

Risco de dados desta área:
${riskLines}

Dimensionamento quantitativo:
${sizingLines}

Tarefas candidatas pré-analisadas nesta área (métricas internas calculadas deterministicamente — use como estão, não invente novos números; os campos entre colchetes indicam o bloco de origem, campos possíveis: ${CANDIDATE_SOURCE_FIELDS.join(', ')}):
${candidateLines}`
}

export function buildUserPrompt(request: DiagnosticRequest): string {
  const { company, priorityAreas, interviews } = request

  const companySection = `## Empresa
- Nome: ${company.companyName}
- Segmento: ${company.segment}${company.segment === 'Outro' && company.segmentOther ? ` (${company.segmentOther})` : ''}
- Número de funcionários: ${company.employeeRange}
- Atividade principal: ${company.mainBusinessActivity}
- Áreas prioritárias investigadas (no máximo 3): ${priorityAreas
    .map((priorityArea) => `${priorityArea.area} (motivo: ${priorityArea.reason})`)
    .join('; ')}`

  const interviewsSection = interviews.map(formatAreaInterview).join('\n\n---\n\n')

  return `Analise o diagnóstico operacional abaixo, estruturado como uma entrevista profunda em até 3 áreas prioritárias, e produza a saída estruturada solicitada.

${companySection}

## Entrevistas por área

${interviewsSection}

Gere a análise seguindo exatamente o schema JSON fornecido. Consolide tarefas semelhantes entre blocos e entre áreas em oportunidades únicas, mantendo evidências rastreáveis às respostas acima.`
}
