# Diagnóstico de Oportunidades com IA

MVP que coleta informações operacionais de uma empresa, envia para a API da
OpenAI e gera um diagnóstico estruturado de oportunidades de aplicação de IA
e automação, com um score de priorização calculado de forma determinística
no backend.

Fluxo: Landing page → Formulário (5 etapas) → Validação → Backend → OpenAI →
JSON estruturado → Relatório → CTA WhatsApp.

Este projeto segue a especificação em [`SPEC.md`](./SPEC.md). Não há banco de
dados, autenticação ou persistência de dados nesta primeira versão — o
resultado é processado em memória e mantido apenas temporariamente no
navegador (sessionStorage) enquanto o usuário vê o relatório.

## Stack

- Next.js (App Router) + React + TypeScript
- Tailwind CSS
- Zod para validação
- OpenAI API (Responses API)
- Vitest para testes

## Instalação

```bash
npm install
```

## Variáveis de ambiente

Copie `.env.example` para `.env.local` e preencha com sua chave da OpenAI:

```bash
cp .env.example .env.local
```

```env
OPENAI_API_KEY=sua_chave_aqui
OPENAI_MODEL=gpt-5.5
```

- `OPENAI_API_KEY` (obrigatória): chave da API da OpenAI. Nunca é exposta ao
  frontend — só é lida em código de servidor (`src/lib/ai/openai.ts`).
- `OPENAI_MODEL` (opcional): identificador do modelo a usar. Se omitida, usa
  um valor padrão definido no código.

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

Cobre validação (Zod), scoring determinístico, parsing/validação da resposta
da IA (com respostas mockadas) e o endpoint `POST /api/diagnostico` (com a
chamada à OpenAI mockada — nenhum teste chama a API real).

## Arquitetura

```text
src/
├── app/
│   ├── page.tsx                 # Landing page
│   ├── diagnostico/page.tsx     # Formulário de 5 etapas
│   ├── resultado/page.tsx       # Relatório + CTA WhatsApp
│   └── api/diagnostico/route.ts # POST /api/diagnostico
├── components/
│   ├── landing/                 # Seções da landing page
│   ├── diagnostico/             # Etapas do formulário
│   ├── resultado/               # Cards do relatório
│   └── ui/                      # Primitivos reutilizáveis
├── lib/
│   ├── ai/                      # Cliente OpenAI, prompt, schema, análise
│   ├── scoring/                 # Scoring determinístico (0–100)
│   ├── validation/               # Schemas Zod (frontend + backend)
│   ├── whatsapp/                 # Normalização de telefone e link wa.me
│   ├── config/limits.ts          # Constantes centralizadas (limites e custo)
│   ├── rate-limit.ts             # Rate limiting simples em memória
│   └── storage.ts                # Leitura/escrita do resultado em sessionStorage
└── types/diagnostic.ts           # Modelo de dados do formulário
```

## Segurança e privacidade

- A chave da OpenAI só existe em código de servidor, nunca no bundle do
  cliente.
- O backend revalida tudo com Zod, mesmo que o frontend já tenha validado.
- Nenhum dado do formulário é persistido: nada de banco de dados, arquivos ou
  logs com conteúdo das respostas, telefone, e-mail ou chave de API.
- A OpenAI recebe apenas os dados operacionais necessários para a análise —
  telefone e e-mail nunca são enviados à IA.
- Rate limiting simples em memória por IP (ver `src/lib/rate-limit.ts`); como
  é por instância do processo, um limite realmente global entre múltiplas
  instâncias exigiria um armazenamento externo (ex.: Redis), fora do escopo
  deste MVP.

## Deploy (Vercel)

1. Importe o repositório na Vercel.
2. Em **Settings → Environment Variables**, adicione `OPENAI_API_KEY` (e
   opcionalmente `OPENAI_MODEL`) no ambiente de produção (e preview, se
   desejado).
3. Faça o deploy normalmente — o build usa `npm run build`.

Nenhuma configuração adicional de infraestrutura é necessária: não há banco
de dados nem serviços externos além da API da OpenAI.
