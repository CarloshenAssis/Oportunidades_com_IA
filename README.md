# Diagnóstico de Oportunidades com IA

Aplicação que conduz uma entrevista guiada e profunda sobre até 3 áreas
prioritárias de uma empresa, e envia todas as respostas por e-mail para
análise manual.

**Esta versão não usa IA para gerar o diagnóstico automaticamente.** O
objetivo é coletar informação suficiente para que um consultor analise a
empresa manualmente e entre em contato pelo WhatsApp ou e-mail. A
arquitetura de IA (OpenAI) permanece no código, desativada, pronta para ser
reativada no futuro — veja [Reativando a IA](#reativando-a-ia-no-futuro).

Fluxo: Landing page → Entrevista (mapa da empresa, até 3 áreas em
profundidade, contato) → Revisão das respostas → Envio → E-mail para o dono
do produto → Tela de confirmação.

Este projeto segue a especificação em [`SPEC.md`](./SPEC.md). Não há banco de
dados, autenticação ou persistência de dados — nada do formulário é
armazenado pelo backend; ele só é validado e encaminhado por e-mail.

## Stack

- Next.js (App Router) + React + TypeScript
- Tailwind CSS
- Zod para validação
- Nodemailer (SMTP) para o envio do diagnóstico por e-mail
- Vitest para testes
- OpenAI API — código presente, mas **não usado** no fluxo ativo

## Instalação

```bash
npm install
```

## Variáveis de ambiente

Copie `.env.example` para `.env.local` e preencha:

```bash
cp .env.example .env.local
```

### Envio do diagnóstico por e-mail (obrigatórias nesta versão)

```env
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=seu_usuario_smtp
SMTP_PASSWORD=sua_senha_smtp
SMTP_FROM=diagnostico@suaempresa.com   # opcional; padrão = SMTP_USER
SMTP_SECURE=false                       # opcional; "true" força TLS implícito (porta 465)

DIAGNOSTIC_OWNER_EMAIL=voce@suaempresa.com
```

- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`: credenciais de
  qualquer provedor SMTP (Gmail, Outlook, SendGrid, Amazon SES etc. — não
  depende de um serviço específico).
- `DIAGNOSTIC_OWNER_EMAIL`: endereço que recebe cada diagnóstico preenchido.
  Nunca fica hardcoded no código.

### Opcional

```env
WHATSAPP_NUMBER=5511999998888
```

Número (com DDI + DDD) usado pelo botão "Falar conosco pelo WhatsApp" na
tela de confirmação. Se omitido, o botão simplesmente não aparece. Esse link
abre o WhatsApp do dono do produto — diferente do WhatsApp que a empresa
informa no formulário, que só é usado internamente para o dono entrar em
contato depois de analisar o diagnóstico.

### IA (desativada, ver abaixo)

```env
OPENAI_API_KEY=your_api_key_here
OPENAI_MODEL=your_model_here
```

Não são lidas por nenhum código no fluxo ativo hoje. Mantidas apenas para
quando a IA for reativada.

`.env.local` nunca deve ser versionado (já está no `.gitignore`, que ignora
`.env*` preservando apenas `.env.example`).

## Desenvolvimento

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

## Build de produção

```bash
npm run build
npm start
```

## Lint e checagem de tipos

```bash
npm run lint
npx tsc --noEmit
```

## Testes

```bash
npm test
```

Cobre: validação (Zod), scoring/impacto/árvore de solução determinísticos,
gatilhos e classificação de risco, formatação do e-mail do diagnóstico, o
endpoint `POST /api/diagnostico` (com o envio de e-mail mockado — nenhum
teste envia e-mail real) e o parsing/validação da saída da IA (módulo
dormente, mantido testado para facilitar reativação futura).

## Arquitetura

```text
src/
├── app/
│   ├── page.tsx                 # Landing page
│   ├── diagnostico/page.tsx     # Entrevista guiada (motor data-driven)
│   ├── resultado/page.tsx       # Tela de confirmação estática + CTA WhatsApp
│   └── api/diagnostico/route.ts # POST /api/diagnostico — valida e envia e-mail
├── components/
│   ├── landing/                 # Seções da landing page
│   ├── diagnostico/             # Motor da entrevista (mapa, blocos, revisão)
│   └── ui/                      # Primitivos reutilizáveis
├── lib/
│   ├── diagnostic/               # Lógica pura: perguntas, gatilhos, categorias,
│   │                              # scoring (0–25), impacto, árvore de solução
│   ├── email/                    # Template e envio do e-mail do diagnóstico (ativo)
│   ├── ai/                       # Cliente OpenAI, prompt, schema, análise (dormente)
│   ├── validation/                # Schemas Zod (frontend + backend)
│   ├── whatsapp/                  # Normalização de telefone e link wa.me
│   ├── config/limits.ts           # Constantes centralizadas (limites e custo)
│   └── rate-limit.ts              # Rate limiting simples em memória
└── types/diagnostic.ts            # Modelo de dados da entrevista
```

## Segurança e privacidade

- O backend revalida tudo com Zod, mesmo que o frontend já tenha validado.
- Nenhum dado do formulário é persistido: sem banco de dados, sem arquivos,
  sem logs com conteúdo das respostas ou credenciais.
- Se o envio do e-mail falhar, as respostas permanecem na tela (nada é
  apagado) e o usuário pode tentar novamente.
- Credenciais SMTP e o e-mail de destino só existem em código de servidor,
  nunca no bundle do cliente.
- Rate limiting simples em memória por IP (ver `src/lib/rate-limit.ts`); como
  é por instância do processo, um limite realmente global entre múltiplas
  instâncias exigiria um armazenamento externo (ex.: Redis), fora do escopo
  deste projeto.

## Reativando a IA no futuro

O código da integração com a OpenAI (`src/lib/ai/`) não foi apagado — ele só
não é chamado pelo endpoint ativo. Para reativar:

1. Configure `OPENAI_API_KEY` (e opcionalmente `OPENAI_MODEL`).
2. Em `src/app/api/diagnostico/route.ts`, chame `analyzeDiagnostic` (de
   `@/lib/ai/analyze`) com os dados validados, no lugar do envio de e-mail —
   ou em conjunto com ele.
3. Decida onde exibir o resultado (ex.: reintroduzir uma página de
   relatório) ou continue enviando por e-mail, agora enriquecido pela IA.

Nenhuma mudança no formulário/entrevista é necessária: a estrutura de dados
coletada (`DiagnosticInterview`) já foi desenhada para alimentar a IA.

## Deploy (Vercel)

1. Importe o repositório na Vercel.
2. Em **Settings → Environment Variables**, adicione `SMTP_HOST`,
   `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `DIAGNOSTIC_OWNER_EMAIL` (e
   opcionalmente `SMTP_FROM`, `SMTP_SECURE`, `WHATSAPP_NUMBER`) no ambiente
   de produção (e preview, se desejado).
3. Faça o deploy normalmente — o build usa `npm run build`.

Nenhuma configuração adicional de infraestrutura é necessária: não há banco
de dados nem serviços externos além do provedor SMTP escolhido.
