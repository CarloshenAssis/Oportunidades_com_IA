SPEC.md — Diagnóstico de Oportunidades com IA
Projeto: Diagnóstico de Oportunidades com IA
Versão: 1.0.0
Status: MVP
Executor: Claude Code
Objetivo: Construir uma aplicação web que coleta informações operacionais de uma empresa, utiliza a API da OpenAI para analisar os processos e gera um diagnóstico estruturado de oportunidades de aplicação de IA.
1. REGRA PRINCIPAL DO PROJETO
O sistema deve ser construído como um MVP funcional, simples e confiável.
Não implementar funcionalidades que não sejam necessárias para validar a hipótese comercial.
O fluxo principal deve ser:

```text
Landing Page
    ↓
Formulário
    ↓
Validação
    ↓
Backend
    ↓
OpenAI API
    ↓
JSON estruturado
    ↓
Relatório
    ↓
CTA WhatsApp

```

Não implementar inicialmente:

* autenticação;
* cadastro de usuários;
* dashboard;
* banco de dados;
* pagamentos;
* assinatura;
* painel administrativo;
* CRM;
* upload de arquivos;
* integração com WhatsApp API;
* múltiplos usuários;
* histórico de diagnósticos.

2. OBJETIVO COMERCIAL
O sistema não deve parecer uma ferramenta genérica de IA.
Seu posicionamento é:
Diagnóstico de Oportunidades com IA
O objetivo é descobrir onde uma empresa pode aplicar IA ou automação para melhorar processos.
O diagnóstico é o mecanismo de geração de leads.
O serviço comercial posterior será:

```text
Diagnóstico
↓
Análise humana
↓
Consultoria
↓
Proposta
↓
Implementação

```

3. STACK
Utilizar:

* Next.js
* React
* TypeScript
* Tailwind CSS
* API Routes ou Route Handlers
* OpenAI API
* Zod para validação
* Lucide Icons, se necessário

Evitar bibliotecas desnecessárias.
O projeto deve funcionar em ambiente de desenvolvimento local e estar preparado para deploy em Vercel.
4. ARQUITETURA
Estrutura esperada:

```text
src/
├── app/
│   ├── page.tsx
│   ├── diagnostico/
│   │   └── page.tsx
│   ├── resultado/
│   │   └── page.tsx
│   └── api/
│       └── diagnostico/
│           └── route.ts
│
├── components/
│   ├── landing/
│   ├── diagnostico/
│   ├── resultado/
│   └── ui/
│
├── lib/
│   ├── ai/
│   │   ├── openai.ts
│   │   ├── prompt.ts
│   │   ├── schema.ts
│   │   └── analyze.ts
│   ├── scoring/
│   │   └── scoring.ts
│   ├── validation/
│   │   └── diagnostic.ts
│   └── whatsapp/
│       └── message.ts
│
├── types/
│   └── diagnostic.ts
│
└── ...

```

A estrutura pode ser adaptada à versão do Next.js instalada, desde que mantenha separação clara entre:

* frontend;
* backend;
* IA;
* validação;
* scoring;
* apresentação.

5. BANCO DE DADOS
NÃO utilizar banco de dados nesta primeira versão.
O resultado deve ser processado em memória e enviado ao frontend.
O sistema deve, porém, ser estruturado de maneira que posteriormente seja possível adicionar:

* Supabase;
* PostgreSQL;
* CRM.

Não criar abstrações desnecessárias apenas para preparar isso.
6. LANDING PAGE
Criar uma landing page profissional.
Headline
Descubra onde sua empresa pode usar IA
Subheadline
Identifique tarefas repetitivas, processos manuais e oportunidades de automação em poucos minutos.
CTA
Fazer meu diagnóstico
Benefícios
Mostrar três benefícios:
Identifique gargalos
Encontre processos que consomem tempo e exigem trabalho manual.
Encontre oportunidades
Descubra onde IA ou automação podem fazer sentido.
Saiba por onde começar
Receba uma lista priorizada de oportunidades.
7. DESIGN
Visual:

* profissional;
* moderno;
* limpo;
* empresarial;
* sem aparência de "site de IA genérico".

Priorizar:

* excelente tipografia;
* espaçamento;
* hierarquia visual;
* cards;
* responsividade;
* boa experiência mobile.

Não exagerar em:

* gradientes;
* animações;
* efeitos;
* elementos 3D;
* excesso de ícones.

A interface deve transmitir:
consultoria + tecnologia + confiança.
8. FORMULÁRIO
O diagnóstico deve ter 5 etapas.
Mostrar progresso:

```text
Etapa 1 de 5

```

Permitir:

* voltar;
* avançar;
* salvar estado enquanto o usuário navega entre etapas.

Não enviar dados à API enquanto o usuário ainda estiver preenchendo o formulário.
Apenas enviar após conclusão.
9. ETAPA 1 — EMPRESA
Campos:
Nome da empresa

```text
companyName

```

Tipo:
string
Obrigatório.
Máximo:
100 caracteres.
Segmento

```text
segment

```

Opções:

* Comércio
* Serviços
* Indústria
* Contabilidade
* Imobiliária
* Saúde
* Educação
* Construção
* Automotivo
* Alimentação
* Logística
* Tecnologia
* Consultoria
* Outro

Se Outro:

```text
segmentOther

```

Funcionários

```text
employeeRange

```

Opções:

* 1–5
* 6–10
* 11–20
* 21–50
* 51–100
* Mais de 100

10. ETAPA 2 — OPERAÇÃO
Principais atividades

```text
mainActivities

```

Pergunta:
Quais são as principais atividades realizadas pela sua equipe?
Máximo:
2.000 caracteres.
Tarefas repetitivas

```text
repetitiveTasks

```

Pergunta:
Quais tarefas sua equipe realiza todos os dias ou todas as semanas?
Máximo:
2.000 caracteres.
Tarefas demoradas

```text
timeConsumingTasks

```

Pergunta:
Quais atividades mais consomem tempo da equipe?
Máximo:
2.000 caracteres.
11. ETAPA 3 — PROBLEMAS
Retrabalho

```text
rework

```

Pergunta:
Onde sua empresa percebe mais retrabalho?
Processos manuais

```text
manualProcesses

```

Pergunta:
Quais processos ainda são feitos manualmente?
Erros

```text
errors

```

Pergunta:
Em quais atividades costumam acontecer erros, esquecimentos ou atrasos?
Dependência de pessoas

```text
peopleDependency

```

Pergunta:
Existe algum processo que depende muito de uma pessoa específica?
Opções:

* Sim
* Não
* Não sei

Se Sim:

```text
peopleDependencyDescription

```

12. ETAPA 4 — TECNOLOGIA
Ferramentas

```text
tools

```

Checkbox:

* WhatsApp
* Excel
* Google Sheets
* Google Drive
* Microsoft Office
* E-mail
* CRM
* ERP
* Sistema próprio
* Outro

Uso atual de IA

```text
aiMaturity

```

Opções:

* Não utilizamos
* Utilizamos pouco
* Utilizamos regularmente
* Utilizamos bastante
* Não sei

Observações

```text
technologyNotes

```

Opcional.
13. ETAPA 5 — CONTATO
WhatsApp

```text
whatsapp

```

Obrigatório.
Normalizar número para geração do link.
Não armazenar.
E-mail

```text
email

```

Opcional.
Validar formato.
Consentimento

```text
consent

```

Obrigatório.
Texto:
Concordo em receber o diagnóstico e informações relacionadas à análise solicitada.
Não permitir envio sem consentimento.
14. MODELO DE DADOS
Criar TypeScript type:

```ts
type DiagnosticFormData = {
  companyName: string
  segment: string
  segmentOther?: string
  employeeRange: string

  mainActivities: string
  repetitiveTasks: string
  timeConsumingTasks: string

  rework: string
  manualProcesses: string
  errors: string
  peopleDependency: string
  peopleDependencyDescription?: string

  tools: string[]
  aiMaturity: string
  technologyNotes?: string

  whatsapp: string
  email?: string
  consent: boolean
}

```

15. VALIDAÇÃO COM ZOD
Criar schema Zod.
Validar:

* tipo;
* tamanho;
* obrigatoriedade;
* e-mail;
* telefone;
* consentimento;
* valores permitidos nos enums.

Nunca confiar somente na validação do frontend.
O backend deve validar novamente.
16. SEGURANÇA DA API
A chave da OpenAI NUNCA pode aparecer:

* no frontend;
* no código client-side;
* em componentes React;
* no HTML;
* em logs;
* no Git.

Utilizar:

```env
OPENAI_API_KEY=

```

E opcionalmente:

```env
OPENAI_MODEL=

```

Criar `.env.example`.
Nunca criar `.env` versionado.
Adicionar `.env*` ao `.gitignore`, preservando `.env.example`.
17. ENDPOINT
Criar:

```text
POST /api/diagnostico

```

Request:

```json
{
  "company": {},
  "operation": {},
  "problems": {},
  "technology": {},
  "contact": {}
}

```

O backend deve:

1. validar;
2. normalizar;
3. calcular indicadores;
4. construir prompt;
5. chamar OpenAI;
6. validar resposta;
7. retornar JSON;
8. nunca retornar a API key.

18. SCORING
Criar scoring determinístico.
O scoring não deve depender exclusivamente da IA.
Indicadores:

```text
frequency
volume
repetitiveness
manualWork
rework
errorRisk
standardization
implementationEase

```

Escala:

```text
0 = inexistente/desconhecido
1 = muito baixo
2 = baixo
3 = médio
4 = alto
5 = muito alto

```

Quando não houver informação suficiente:

```text
null

```

Não inventar valores.
19. INTERPRETAÇÃO DO SCORE
Criar score interno de oportunidade.
O score serve para priorização, não para prometer resultados.
Exemplo:

```text
80–100 = Alta prioridade
60–79 = Média prioridade
40–59 = Baixa prioridade
0–39 = Muito baixa

```

Os pesos devem ser configuráveis em:

```text
src/lib/scoring/scoring.ts

```

Não espalhar números mágicos pelo projeto.
20. PROMPT DA IA
Criar:

```text
src/lib/ai/prompt.ts

```

O prompt deve ter duas partes:
System prompt
A IA atua como:
Consultor de oportunidades de aplicação de IA em empresas.
Regras:

1. Não inventar informações.
2. Utilizar apenas informações fornecidas.
3. Identificar oportunidades reais.
4. Diferenciar IA de automação tradicional.
5. Não recomendar IA apenas porque é possível.
6. Priorizar problemas relevantes.
7. Preferir poucas oportunidades fortes.
8. Explicar cada recomendação.
9. Não prometer economia financeira.
10. Não inventar ROI.
11. Não inventar horas economizadas.
12. Não inventar quantidade de funcionários ou volume.
13. Quando não houver dados suficientes, declarar isso.
14. Considerar segurança e privacidade.
15. Não recomendar aplicações inadequadas para informações sensíveis sem ressalvas.

21. CATEGORIAS DE OPORTUNIDADE
A IA deve procurar oportunidades em:

* atendimento;
* comunicação;
* documentos;
* relatórios;
* análise de dados;
* organização de informações;
* geração de conteúdo;
* classificação;
* triagem;
* cobrança;
* follow-up;
* propostas;
* tarefas administrativas;
* processamento de informações;
* transferência de dados;
* processos repetitivos.

Também pode identificar:

```text
AUTOMAÇÃO SEM IA

```

quando uma automação tradicional for mais adequada.
22. SAÍDA ESTRUTURADA
A resposta da IA deve ser validada com schema.
Formato:

```json
{
  "executiveSummary": "",
  "maturity": {
    "level": "",
    "description": ""
  },
  "mainBottlenecks": [
    {
      "title": "",
      "description": ""
    }
  ],
  "opportunities": [
    {
      "title": "",
      "process": "",
      "problem": "",
      "evidence": "",
      "solution": "",
      "solutionType": "AI|AUTOMATION|AI_AND_AUTOMATION",
      "priority": "HIGH|MEDIUM|LOW",
      "confidence": "HIGH|MEDIUM|LOW",
      "justification": ""
    }
  ],
  "nextSteps": []
}

```

Máximo:
5 oportunidades.
Recomendado:
3 oportunidades fortes.
23. REGRA DE EVIDÊNCIA
Toda oportunidade deve possuir:

```text
evidence

```

A evidência deve derivar diretamente das respostas do empresário.
Exemplo válido:
"A empresa informou que recebe grande quantidade de mensagens repetitivas pelo WhatsApp."
Exemplo inválido:
"A empresa provavelmente recebe 100 mensagens por dia."
Não inventar.
24. REGRA DE IA VS AUTOMAÇÃO
A IA deve decidir entre:
IA
Quando existe:

* linguagem;
* interpretação;
* classificação;
* geração;
* análise;
* contexto variável.

Automação tradicional
Quando o processo é:

* determinístico;
* baseado em regras;
* transferência de dados;
* cálculo;
* alteração de campos;
* notificações simples.

IA + automação
Quando ambas são necessárias.
25. NÍVEL DE MATURIDADE
A IA deve classificar:
Inicial
Empresa praticamente não utiliza IA.
Em desenvolvimento
Algumas ferramentas ou experimentos.
Estruturada
Uso recorrente em processos.
Avançada
IA integrada a múltiplos processos.
A classificação deve considerar apenas as informações fornecidas.
26. RESULTADO
Após a API responder, redirecionar para:

```text
/resultado

```

O resultado pode ser mantido temporariamente no client state/session storage.
Não colocar dados sensíveis em URL.
Não colocar respostas completas do formulário em query parameters.
27. PÁGINA DE RESULTADO
Título:
Seu Diagnóstico de Oportunidades com IA
Mostrar:
Resumo executivo
Texto gerado pela IA.
Maturidade
Exibir:

```text
Nível: Inicial

```

Principais gargalos
Cards.
Oportunidades
Para cada oportunidade:

```text
01
ATENDIMENTO

Problema
...

Evidência
...

Como IA pode ajudar
...

Tipo
IA + Automação

Prioridade
ALTA

Confiança
ALTA

```

28. CTA
Final do relatório:
Encontramos oportunidades. Agora podemos analisar quais realmente fazem sentido para sua empresa.
Subtexto:
O diagnóstico é uma primeira análise. A implementação depende de uma avaliação mais detalhada do processo, ferramentas utilizadas e requisitos da empresa.
Botão:
Quero conversar sobre meu diagnóstico
29. WHATSAPP
Gerar URL usando o WhatsApp fornecido pelo usuário.
Mensagem pré-preenchida:

```text
Olá! Acabei de fazer o Diagnóstico de Oportunidades com IA e gostaria de entender melhor as oportunidades identificadas na minha empresa.

```

Não utilizar API oficial do WhatsApp.
Apenas gerar link `wa.me`.
30. PRIVACIDADE
Como o MVP não terá banco de dados:

* não persistir formulário;
* não persistir telefone;
* não persistir e-mail;
* não criar cookies desnecessários;
* não enviar dados para serviços que não sejam necessários.

A API da IA recebe somente os dados necessários para análise.
Não enviar:

* IP;
* localização;
* informações técnicas desnecessárias;
* dados pessoais adicionais.

31. PROTEÇÃO CONTRA ABUSO
Criar proteção básica no endpoint.
Implementar:

* limite de tamanho do request;
* validação;
* tratamento de erro;
* timeout da API;
* rate limiting simples quando possível no ambiente escolhido.

Se rate limiting exigir infraestrutura externa, deixar uma abstração simples e documentar.
O MVP não deve criar infraestrutura complexa apenas para isso.
32. CONTROLE DE CUSTO
O sistema deve ser projetado para minimizar consumo da API.
Regras:

1. Limitar caracteres dos campos.
2. Não reenviar a mesma solicitação várias vezes.
3. Não chamar IA enquanto o formulário é preenchido.
4. Utilizar saída estruturada.
5. Limitar oportunidades a 5.
6. Limitar tamanho da resposta.
7. Usar modelo configurável.
8. Não realizar chamadas adicionais desnecessárias.

Criar constantes:

```ts
MAX_OPPORTUNITIES = 5
MAX_INPUT_CHARS = ...
MAX_OUTPUT_TOKENS = ...

```

Valores devem ficar centralizados.
33. TRATAMENTO DE ERROS
Se a OpenAI falhar:
Não mostrar erro técnico ao usuário.
Mostrar:
Não conseguimos gerar seu diagnóstico agora. Tente novamente em alguns instantes.
Registrar no servidor apenas informações técnicas necessárias.
Nunca registrar:

* API key;
* telefone;
* e-mail;
* conteúdo completo das respostas.

34. LOADING
Durante análise:
Mostrar:
Analisando os processos da sua empresa...
Etapas visuais:

```text
✓ Organizando informações
✓ Identificando processos
● Analisando oportunidades
○ Priorizando recomendações

```

Não fingir que cada etapa representa uma chamada real à API.
É apenas feedback visual.
35. RESPONSIVIDADE
O sistema deve funcionar perfeitamente em:

* desktop;
* tablet;
* celular.

Prioridade:
mobile-first.
O formulário deve ser confortável em celular.
Botões grandes.
Campos fáceis de preencher.
36. ACESSIBILIDADE
Implementar:

* labels;
* foco visível;
* navegação por teclado;
* contraste adequado;
* mensagens de erro associadas aos campos;
* `aria-*` quando necessário;
* não depender apenas de cor para indicar estado.

37. SEO
Adicionar:
Title:
Diagnóstico de Oportunidades com IA | Descubra onde sua empresa pode usar IA
Description:
Identifique tarefas repetitivas, processos manuais e oportunidades de aplicação de Inteligência Artificial na sua empresa.
Adicionar Open Graph básico.
38. ANALYTICS
NÃO implementar analytics inicialmente.
O MVP deve permanecer simples.
Posteriormente poderão ser adicionados eventos:

```text
landing_view
diagnostic_started
diagnostic_completed
diagnostic_generated
whatsapp_clicked

```

39. TESTES
Criar testes para:
Validação

* formulário válido;
* formulário inválido;
* e-mail inválido;
* telefone inválido;
* consentimento ausente;
* campo acima do limite.

Scoring

* score mínimo;
* score máximo;
* dados ausentes;
* oportunidades de alta prioridade.

IA
Mockar resposta da OpenAI.
Testar:

* JSON válido;
* JSON inválido;
* campo obrigatório ausente;
* mais de 5 oportunidades;
* enum inválido.

API
Testar:

```text
POST válido
POST inválido
erro da OpenAI
timeout

```

40. CRITÉRIOS DE ACEITE
O projeto só deve ser considerado concluído quando:
Landing

* Landing page funcionando.
* CTA inicia diagnóstico.
* Responsividade funcionando.

Formulário

* 5 etapas.
* Validação client-side.
* Validação server-side.
* Navegação entre etapas.
* Campos obrigatórios funcionando.

IA

* OpenAI configurada por variável de ambiente.
* API key não exposta.
* Endpoint funcionando.
* Prompt estruturado.
* JSON validado.
* Máximo de 5 oportunidades.

Resultado

* Relatório renderizado.
* Prioridades exibidas.
* Evidências exibidas.
* CTA WhatsApp funcionando.

Segurança

* Nenhum segredo no frontend.
* `.env.example` criado.
* `.gitignore` correto.
* Dados não persistidos.

Qualidade

* TypeScript sem erros.
* Linter sem erros.
* Build de produção funcionando.
* Testes passando.

41. VARIÁVEIS DE AMBIENTE
Criar:

```env
OPENAI_API_KEY=
OPENAI_MODEL=

```

Criar `.env.example`:

```env
OPENAI_API_KEY=your_api_key_here
OPENAI_MODEL=your_model_here

```

Nunca preencher o `.env.example` com uma chave real.
42. README
Criar documentação contendo:
Instalação

```bash
npm install

```

Desenvolvimento

```bash
npm run dev

```

Variáveis
Explicar:

```text
OPENAI_API_KEY
OPENAI_MODEL

```

Build

```bash
npm run build

```

Testes

```bash
npm test

```

Deploy
Explicar configuração das variáveis de ambiente na Vercel.
43. REGRAS PARA O CLAUDE CODE
Antes de implementar:

1. Inspecionar o repositório atual.
2. Verificar stack existente.
3. Não destruir funcionalidades existentes sem necessidade.
4. Verificar `package.json`.
5. Verificar estrutura de pastas.
6. Verificar arquivos de configuração.
7. Verificar se existe SPEC.md.
8. Identificar conflitos antes de alterar arquitetura.

Se o projeto estiver vazio:
→ criar a aplicação do zero.
Se já existir aplicação:
→ adaptar à arquitetura existente.
44. EXECUÇÃO
Implementar em fases.
FASE 1
Scaffold e arquitetura.
FASE 2
Landing page.
FASE 3
Formulário.
FASE 4
Validação.
FASE 5
Scoring.
FASE 6
OpenAI API.
FASE 7
Relatório.
FASE 8
WhatsApp.
FASE 9
Testes.
FASE 10
Build e revisão final.
Após cada fase:

* verificar TypeScript;
* verificar lint;
* corrigir erros;
* continuar somente após a fase estar funcional.

45. REGRA DE NÃO-OVERENGINEERING
Não criar:

* microserviços;
* filas;
* Redis;
* Kubernetes;
* banco de dados;
* autenticação;
* arquitetura distribuída;
* sistema de agentes;
* RAG;
* embeddings;
* vector database.

Nada disso é necessário para o MVP.
A primeira versão precisa provar:
Uma empresa responde perguntas → a IA identifica oportunidades → o empresário percebe valor → o empresário entra em contato.
46. RESULTADO ESPERADO
Ao final, deve existir uma aplicação em que:

1. Uma empresa acessa a landing page.
2. Clica em "Fazer meu diagnóstico".
3. Responde às perguntas.
4. Informa WhatsApp/e-mail.
5. Envia o formulário.
6. O backend chama a OpenAI.
7. A IA analisa as informações.
8. O JSON é validado.
9. O relatório é exibido.
10. O usuário pode iniciar uma conversa pelo WhatsApp.

O sistema deve estar pronto para receber uma chave da OpenAI e funcionar sem banco de dados.
47. VISÃO FUTURA — NÃO IMPLEMENTAR AGORA
Após validação do MVP, considerar:
V2

* armazenamento de leads;
* dashboard;
* histórico;
* PDF;
* envio automático por e-mail;
* CRM;
* classificação por segmento;
* comparação de diagnósticos;
* análise humana;
* área do consultor.

V3

* diagnóstico aprofundado;
* plano de implementação;
* orçamento automático;
* agentes especializados;
* integração com WhatsApp;
* automações;
* acompanhamento pós-implementação.

Essas funcionalidades NÃO fazem parte do MVP.
48. PRINCÍPIO DO PRODUTO
O sistema não vende tecnologia.
Ele identifica problemas empresariais.
A tecnologia é consequência.
A lógica deve ser:

```text
PROBLEMA
   ↓
PROCESSO
   ↓
GARGALO
   ↓
OPORTUNIDADE
   ↓
IA / AUTOMAÇÃO
   ↓
IMPLEMENTAÇÃO

```

Não:

```text
IA
↓
procurar problema para colocar IA

```

Esse princípio deve orientar todo o produto.
