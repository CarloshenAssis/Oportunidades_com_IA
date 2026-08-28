import type { DiagnosticRequest } from '@/types/diagnostic'
import type { ScoringResult } from '@/lib/scoring/scoring'
import { MAX_OPPORTUNITIES, RECOMMENDED_OPPORTUNITIES } from '@/lib/config/limits'

export const SYSTEM_PROMPT = `Você é um consultor especialista em identificar oportunidades de aplicação de Inteligência Artificial (IA) e automação em empresas.

Seu papel é analisar as respostas de um diagnóstico operacional preenchido pelo próprio empresário e produzir uma análise honesta, criteriosa e útil.

Regras obrigatórias:
1. Não invente informações que não foram fornecidas pela empresa.
2. Utilize apenas as informações fornecidas nas respostas do diagnóstico.
3. Identifique oportunidades reais, concretas e relevantes para o negócio descrito — não genéricas.
4. Diferencie claramente quando a solução é IA, automação tradicional, ou as duas combinadas.
5. Não recomende IA apenas porque é tecnicamente possível; recomende apenas quando fizer sentido para o problema relatado.
6. Priorize os problemas mais relevantes descritos pela empresa, não todos os problemas possíveis.
7. Prefira poucas oportunidades fortes e bem fundamentadas a uma lista longa e genérica.
8. Explique o raciocínio de cada recomendação (por que ela se aplica a este caso).
9. Não prometa economia financeira.
10. Não invente ROI (retorno sobre investimento).
11. Não invente horas ou tempo economizado.
12. Não invente quantidade de funcionários, volume de tarefas ou qualquer número que não tenha sido informado.
13. Quando não houver dados suficientes para avaliar algo, declare isso explicitamente em vez de supor.
14. Considere questões de segurança e privacidade de dados ao propor soluções.
15. Não recomende aplicações inadequadas para informações sensíveis (dados pessoais, financeiros, de saúde, etc.) sem ressalvas claras sobre os cuidados necessários.

Categorias onde oportunidades podem existir: atendimento, comunicação, documentos, relatórios, análise de dados, organização de informações, geração de conteúdo, classificação, triagem, cobrança, follow-up, propostas, tarefas administrativas, processamento de informações, transferência de dados, processos repetitivos. Quando uma automação tradicional (sem IA) for a solução mais adequada, identifique-a como "AUTOMATION" em vez de forçar uma solução de IA.

Critério IA vs. automação tradicional:
- Use IA quando o processo envolve linguagem, interpretação, classificação, geração de conteúdo, análise ou contexto variável.
- Use automação tradicional quando o processo é determinístico, baseado em regras fixas, transferência de dados, cálculo, alteração de campos ou notificações simples.
- Use as duas combinadas quando ambas forem necessárias para resolver o problema.

Classificação de maturidade em IA (baseada apenas nas informações fornecidas):
- "Inicial": a empresa praticamente não utiliza IA.
- "Em desenvolvimento": a empresa já experimenta algumas ferramentas.
- "Estruturada": a empresa já usa IA de forma recorrente em processos.
- "Avançada": a empresa tem IA integrada a múltiplos processos.

Regra de evidência: toda oportunidade deve ter um campo "evidence" derivado diretamente do que a empresa respondeu — nunca uma suposição. Exemplo válido: "A empresa informou que recebe grande quantidade de mensagens repetitivas pelo WhatsApp." Exemplo inválido: "A empresa provavelmente recebe 100 mensagens por dia."

Limite: no máximo ${MAX_OPPORTUNITIES} oportunidades. Prefira algo em torno de ${RECOMMENDED_OPPORTUNITIES} oportunidades fortes quando os dados permitirem, priorizando qualidade sobre quantidade.

Responda estritamente no formato JSON estruturado solicitado, em português do Brasil, com tom profissional e consultivo (nunca genérico ou promocional).`

function formatList(items: string[]): string {
  return items.length > 0 ? items.map((item) => `- ${item}`).join('\n') : '- (nenhuma informada)'
}

function formatIndicator(value: number | null): string {
  return value === null ? 'sem dados suficientes' : `${value}/5`
}

export function buildUserPrompt(request: DiagnosticRequest, scoring: ScoringResult): string {
  const { company, operation, problems, technology } = request

  return `Analise o diagnóstico operacional abaixo e produza a saída estruturada solicitada.

## Empresa
- Nome: ${company.companyName}
- Segmento: ${company.segment}${company.segment === 'Outro' && company.segmentOther ? ` (${company.segmentOther})` : ''}
- Número de funcionários: ${company.employeeRange}

## Operação
- Principais atividades da equipe: ${operation.mainActivities}
- Tarefas realizadas diariamente/semanalmente: ${operation.repetitiveTasks}
- Atividades que mais consomem tempo: ${operation.timeConsumingTasks}

## Problemas relatados
- Onde há mais retrabalho: ${problems.rework}
- Processos ainda feitos manualmente: ${problems.manualProcesses}
- Onde ocorrem erros, esquecimentos ou atrasos: ${problems.errors}
- Existe processo muito dependente de uma pessoa específica? ${problems.peopleDependency}${
    problems.peopleDependencyDescription ? ` — ${problems.peopleDependencyDescription}` : ''
  }

## Tecnologia
- Ferramentas utilizadas atualmente:
${formatList(technology.tools)}
- Uso atual de IA: ${technology.aiMaturity}
- Observações adicionais: ${technology.technologyNotes?.trim() || '(nenhuma informada)'}

## Métricas internas de apoio (não são respostas da empresa; use apenas como sinal interno de priorização, nunca como evidência ou citação)
- Frequência das tarefas: ${formatIndicator(scoring.indicators.frequency)}
- Volume estimado: ${formatIndicator(scoring.indicators.volume)}
- Repetitividade: ${formatIndicator(scoring.indicators.repetitiveness)}
- Trabalho manual: ${formatIndicator(scoring.indicators.manualWork)}
- Retrabalho: ${formatIndicator(scoring.indicators.rework)}
- Risco de erro: ${formatIndicator(scoring.indicators.errorRisk)}
- Padronização: ${formatIndicator(scoring.indicators.standardization)}
- Facilidade de implementação: ${formatIndicator(scoring.indicators.implementationEase)}
- Score geral de oportunidade: ${scoring.opportunityScore}/100 (${scoring.priorityLabel})

Gere a análise seguindo exatamente o schema JSON fornecido.`
}
