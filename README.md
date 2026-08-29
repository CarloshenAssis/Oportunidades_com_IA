# Diagnóstico de Oportunidades com IA

Aplicação que conduz uma entrevista consultiva sobre até 3 áreas de uma
empresa — a primeira é sempre obrigatória e aprofundada; a segunda e a
terceira são opcionais e, quando escolhidas, o usuário decide entre uma
análise rápida (10 perguntas) ou aprofundada (entrevista completa) — e envia
todas as respostas por e-mail para análise manual.

**Esta versão não usa IA para gerar o diagnóstico automaticamente.** O
objetivo é coletar informação suficiente para que um consultor analise a
empresa manualmente e entre em contato pelo WhatsApp ou e-mail. A
arquitetura de IA (OpenAI) permanece no código, desativada, pronta para ser
reativada no futuro — veja [Reativando a IA](#reativando-a-ia-no-futuro).

Fluxo: Landing page → Entrevista (mapa da empresa, área prioritária
aprofundada, até 2 áreas complementares opcionais em modo rápido ou
aprofundado, contato) → Revisão das respostas → Envio → E-mail para o dono
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
  depende de um serviço específico). As cinco variáveis desta seção (as
  quatro acima + `DIAGNOSTIC_OWNER_EMAIL`) são **obrigatórias**: se qualquer
  uma faltar, o endpoint nunca tenta enviar com configuração parcial — ele
  falha de forma controlada e registra no servidor exatamente qual variável
  está ausente (ver `src/lib/email/send.ts`).
- `DIAGNOSTIC_OWNER_EMAIL`: endereço que recebe cada diagnóstico preenchido.
  Nunca fica hardcoded no código.

#### Usando o Gmail como servidor SMTP

O Gmail não aceita mais a senha normal da conta para SMTP. É preciso:

1. Ativar a **verificação em duas etapas** na conta Google.
2. Gerar uma **senha de app** em <https://myaccount.google.com/apppasswords>
   (categoria "Outro", ex.: "Diagnóstico IA") — é uma senha de 16 caracteres,
   diferente da senha normal de login.
3. Configurar:
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=seu_email@gmail.com
   SMTP_PASSWORD=<a senha de app de 16 caracteres, sem espaços>
   SMTP_SECURE=false
   DIAGNOSTIC_OWNER_EMAIL=carloshen.senai@gmail.com
   ```
   Porta `587` usa STARTTLS (`SMTP_SECURE=false`); porta `465` usa TLS
   implícito (`SMTP_SECURE=true`, ou simplesmente omita — a porta 465 já
   ativa `secure` automaticamente). Usar a senha normal da conta em vez da
   senha de app resulta em erro de autenticação (`EAUTH`) do Gmail.

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

Cobre: validação (Zod) — incluindo as regras de área prioritária/
complementar e a proibição de áreas repetidas —, a máquina de estados da
seleção progressiva de áreas (`area-flow.ts`), o dimensionamento manual de
tarefas, impacto/árvore de solução/gatilhos/classificação de risco
(usados pelo módulo de IA dormente), formatação do e-mail do diagnóstico
(incluindo os 6 cenários de combinação de áreas/profundidades do §26 da
spec), o endpoint `POST /api/diagnostico` (com o envio de e-mail mockado —
nenhum teste envia e-mail real) e o parsing/validação da saída da IA
(módulo dormente, mantido testado para facilitar reativação futura).

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
│   ├── diagnostic/               # Lógica pura: perguntas (rápida/aprofundada),
│   │                              # seleção de áreas (area-flow), dimensionamento
│   │                              # manual, gatilhos, categorias, impacto, árvore
│   │                              # de solução (usados pelo módulo de IA dormente)
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

## Diagnosticando falhas no envio do e-mail

Se o usuário vê "Não conseguimos enviar seu diagnóstico...", a causa real
nunca aparece na resposta HTTP (de propósito — ver seção acima), mas fica
registrada nos logs do servidor (`console.log`/`console.error`, nunca com
senha, token ou conteúdo de credencial). `src/lib/email/send.ts` registra
cada etapa com o prefixo `[EMAIL]`:

```
[EMAIL] SMTP configuration detected: yes/no
[EMAIL] Host: <host>
[EMAIL] Port: <porta>
[EMAIL] User configured: yes/no
[EMAIL] Destination configured: yes/no
[EMAIL] SMTP connection result: ok / failed — <code/command/responseCode>
[EMAIL] SMTP authentication result: ok / failed — <code/command/responseCode>
[EMAIL] Send result: ok / failed — <code/command/responseCode>
```

E `src/app/api/diagnostico/route.ts` registra a categoria do erro
(`configuração`, `conexão SMTP`, `autenticação SMTP` ou `envio`). Causas
mais comuns, na ordem em que valem a pena checar:

1. **`SMTP configuration detected: no`** — uma das cinco variáveis
   obrigatórias (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`,
   `DIAGNOSTIC_OWNER_EMAIL`) não está definida no ambiente onde o servidor
   está rodando (ex.: esquecida nas Environment Variables da Vercel). O log
   diz exatamente qual falta.
2. **`SMTP authentication result: failed`** (código `EAUTH`) — usuário ou
   senha rejeitados pelo provedor. No Gmail, isso quase sempre significa que
   foi usada a senha normal da conta em vez de uma senha de app (veja
   [Usando o Gmail como servidor SMTP](#usando-o-gmail-como-servidor-smtp)).
3. **`SMTP connection result: failed`** (códigos como `ECONNECTION`,
   `ETIMEDOUT`, `ENOTFOUND`) — host/porta incorretos, ou a rede onde o
   servidor roda bloqueia a porta SMTP de saída.
4. **`Send result: failed`** — conexão e autenticação OK, mas o próprio
   envio foi rejeitado (ex.: remetente/destinatário inválido).

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
