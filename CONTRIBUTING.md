# Contributing to Opensquad

Você está contribuindo para algo maior que código.

Opensquad existe para liberar empresas do trabalho repetitivo. Cada skill que você cria, cada melhoria que você faz, permite que empreendedores e times dediquem seu tempo àquilo que máquinas não conseguem fazer: criatividade, relacionamento, decisão humana.

Você não está apenas desenvolvendo um framework. Você está mudando a forma como as pessoas trabalham.

---

## Bem-vindo

Queremos contribuidores que entendem nossa missão: **liberar tempo para trabalho humano**.

### Quem somos

Opensquad é um framework de orquestração multi-agente. Ajudamos empreendedores e profissionais não-técnicos a criar times de agentes de IA que trabalham juntos automaticamente.

### Quem queremos como contribuidor

- Designers de IA (entendem prompts, orquestração de agentes)
- Desenvolvedores (podem implementar integrações técnicas)
- Qualquer mix de skill — desde que entenda nossa visão

Antes de começar, assista ao [vídeo de lançamento](https://www.youtube.com/watch?v=CL1ppI4qHeU) e leia o [README](README.md) para entender o projeto.

---

## A Regra de Ouro: Verticalize, Não Complique

A maneira certa de contribuir é **verticalizando**: criando novas skills, agents, squads e guias de best practices que expandem o que o opensquad pode fazer para empresas e criadores de conteúdo.

O opensquad roda com `npx opensquad init` e pronto. Um gerente de equipe, um dono de empresa, um criador de conteúdo precisa conseguir usar sem ser técnico. Queremos manter essa simplicidade.

O framework é intencionalmente baseado em arquivos e leve em dependências.

**Isso é design, não limitação.**

## O que aceitamos

- **Novas skills** - Integrações com plataformas, APIs, serviços (o principal tipo de contribuição)
- **Novos guias de best practices** - Expertise de domínio: copywriting, design, SEO, email marketing, redes sociais, análise de dados...
- **Novos agents** - Definições reutilizáveis de agentes especializados
- **Templates de squads** - Squads prontos para casos de uso comuns que a comunidade pode importar e usar
- **Bug fixes** - Correções de comportamento quebrado
- **Melhorias de performance** - Tornar funcionalidades existentes mais rápidas
- **Documentação** - Melhorias no README, exemplos, guias
- **Internacionalização (i18n)** - Novos locales ou melhorias de tradução (`src/locales/`)
- **Testes** - Cobertura de testes para funcionalidades existentes

### Impacto no consumo de tokens

Cada skill, guia de best practices ou agent adicionado ao projeto aumenta o tamanho do contexto carregado em cada execução — e, consequentemente, o consumo de tokens dos usuários. Ao contribuir com conteúdo novo, tenha consciência desse impacto. Prefira instruções concisas e objetivas a textos longos.

## O que não se encaixa

Antes de começar a codar, vale se perguntar: **"Isso ajuda um empreendedor fazer mais em menos tempo, ou adiciona fricção?"**

O opensquad roda com `npx opensquad init` e pronto. Essa simplicidade é intencional. Contribuições que vão em outra direção provavelmente não serão incorporadas - mas a gente sempre pode conversar. Abra uma [issue](https://github.com/renatoasse/opensquad/issues) antes para alinhar.

Exemplos do que geralmente não se encaixa:

- Trocar o sistema baseado em arquivos por bancos de dados (SQLite, Postgres, etc.) - o filesystem é a fonte de verdade por design
- Adicionar dependências de infraestrutura (Docker, vector databases, servidores adicionais) - queremos zero setup além do Node.js
- Reescrever `_opensquad/core/` - prefira estender via skills e agents
- Aumentar significativamente a árvore de dependências - cada dependência nova é uma barreira a mais
- Funcionalidades de desenvolvimento de software - o opensquad é para automatizar processos de negócio, não para criar apps

> Tem uma ideia que não se encaixa aqui mas que você acha valiosa? Abre uma issue e vamos conversar. As melhores ideias nem sempre seguem as regras.

## Ideias de contribuição

Não sabe por onde começar? Aqui estão algumas ideias de skills e squads que a comunidade adoraria ter:

**Skills:**
- `tiktok-publisher` - Publicar vídeos no TikTok via API
- `linkedin-publisher` - Publicar posts e artigos no LinkedIn
- `twitter-publisher` - Publicar tweets e threads no X/Twitter
- `youtube-uploader` - Upload de vídeos no YouTube
- `thumbnail-creator` - Gerar thumbnails para YouTube
- `email-sender` - Disparar campanhas de email (Brevo, Mailchimp, etc.)
- `whatsapp-sender` - Enviar mensagens via WhatsApp Business API
- `spreadsheet-analyzer` - Análise de planilhas e relatórios
- `video-clipper` - Cortar vídeos longos em cortes curtos verticais com legenda
- `seo-auditor` - Auditoria de SEO para blogs e sites
- `podcast-transcriber` - Transcrever e resumir episódios de podcast

**Guias de best practices:**
- Copy para páginas de vendas
- Planejamento de lançamento de infoprodutos
- Storytelling para redes sociais
- Copy para anúncios (Meta Ads, Google Ads)
- Roteiros para podcasts
- Apresentações e pitch decks

**Squads prontos:**
- Squad de produção de conteúdo para LinkedIn
- Squad de geração de leads por email
- Squad de análise de métricas de redes sociais
- Squad de criação de materiais de treinamento

## Primeira contribuição

Novo por aqui? Comece por aqui:

1. Assista ao [vídeo de lançamento](https://www.youtube.com/watch?v=CL1ppI4qHeU) para entender a visão do projeto
2. Rode `npx opensquad init` em uma pasta de teste para experimentar o fluxo
3. Explore as skills existentes em `skills/` - veja como cada `SKILL.md` é estruturado
4. Procure issues com a label **`good first issue`** - são tarefas simples e bem definidas
5. Escolha uma issue (ou uma ideia da [lista acima](#ideias-de-contribuição)), comente que vai trabalhar nela, e mãos à obra

Não precisa ser expert - curiosidade e vontade de aprender são o que importa.

## Como contribuir

### Criando uma Skill

Skills são o principal ponto de extensão do opensquad. É a melhor forma de contribuir. Use a skill `opensquad-skill-creator` para criar e iterar:

```
/opensquad install opensquad-skill-creator
```

Estrutura de diretório:

```
skills/sua-skill/
  SKILL.md          (obrigatório - frontmatter YAML + instruções Markdown)
  scripts/          (opcional - scripts locais)
  references/       (opcional - arquivos de referência)
  assets/           (opcional - recursos visuais)
```

O formato completo do `SKILL.md` está documentado em [`skills/opensquad-skill-creator/references/skill-format.md`](skills/opensquad-skill-creator/references/skill-format.md).

Tipos de skill: `mcp`, `script`, `hybrid`, `prompt`.

Ao submeter uma nova skill, atualize a tabela do catálogo em [`skills/README.md`](skills/README.md).

#### Segurança de Skills

Skills são injetadas diretamente no contexto do agente em tempo de execução. Não existe verificação criptográfica (hash, assinatura digital) no momento da instalação. Isso significa que:

- Skills do tipo `script` executam comandos bash com as **permissões integrais do usuário local**
- Skills do tipo `mcp` podem se conectar a servidores externos e recebem tokens do `.env`
- Skills do tipo `prompt` e `hybrid` influenciam diretamente o comportamento do agente

**Ao submeter uma skill, garanta que:**

- Não inclui credenciais hardcoded ou tokens de acesso
- Não executa comandos destrutivos sem confirmação explícita do usuário
- Não faz upload de dados do usuário para serviços externos sem avisar claramente no `SKILL.md`
- Não modifica arquivos fora do escopo do squad (`squads/<nome>/output/`)
- Documenta no `SKILL.md` quais serviços externos são acessados e quais dados são transmitidos

Skills submetidas pela comunidade passam por review de código antes de serem aceitas no catálogo oficial.

### Criando um Guia de Best Practices

O opensquad já vem com guias de copywriting, design de carrosséis, SEO e mais. Mas tem muito mais a ser coberto. Use a skill `opensquad-agent-creator`:

```
/opensquad install opensquad-agent-creator
```

Após criar, registre o guia no [`_opensquad/core/best-practices/_catalog.yaml`](_opensquad/core/best-practices/_catalog.yaml). Verifique se já não existe um guia similar antes de criar.

### Criando um Squad Template

Squads prontos que a comunidade pode importar e usar direto. Para contribuir com um squad template:

1. Crie o squad usando `/opensquad create`
2. Teste-o pelo menos 2-3 vezes para garantir que funciona bem
3. Coloque na pasta `squads/` do seu PR com uma descrição no `squad.yaml`

### Bug Fixes & Performance

1. Fork o repositório
2. Crie uma branch (`feat/minha-feature` ou `fix/meu-fix`)
3. Faça suas alterações
4. Rode os testes: `node --test`
5. Abra um PR

Para melhorias de performance, inclua benchmarks antes/depois no PR.

### Documentação & i18n

- Locales ficam em `src/locales/` (en, pt-BR, es)
- O README é bilíngue (PT-BR + English) - mantenha ambas as versões ao editar
- Descrições de skills suportam i18n: `description_pt-BR`, `description_es`

## Reportando bugs

Abra uma [issue](https://github.com/renatoasse/opensquad/issues) com:

- **Descrição clara** do problema
- **Passos para reproduzir** (passo a passo)
- **Comportamento esperado** vs **comportamento atual**
- **Ambiente**: OS, versão do Node.js, IDE utilizada

## Sugerindo features

Antes de abrir um PR com uma feature nova, abra uma [issue](https://github.com/renatoasse/opensquad/issues) para discutir a ideia. Isso evita trabalho duplicado e garante alinhamento com a direção do projeto.

Lembre-se da [Regra de Ouro](#a-regra-de-ouro-verticalize-não-complique): prefira criar skills, agents e guias - não mudar a arquitetura.

## Setup de Desenvolvimento

```bash
git clone https://github.com/renatoasse/opensquad.git
cd opensquad
npm install
node --test
```

Requisito: **Node.js 20+**

## Convenções de Commit

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

| Prefixo | Uso |
|---------|-----|
| `feat:` | Nova skill, agent, guia ou funcionalidade |
| `fix:` | Correção de bug |
| `docs:` | Documentação |
| `chore:` | Manutenção |
| `refactor:` | Reestruturação sem mudança de comportamento |
| `perf:` | Melhoria de performance |
| `test:` | Testes |

Exemplos:
```
feat: add tiktok-publisher skill
feat: add linkedin copywriting best-practice guide
fix: correct init copy for nested directories
docs: add Spanish translation for apify skill
```

## Pull Requests

### O que faz um bom PR?

| Faça | Evite |
|------|-------|
| Uma mudança por PR | Misturar mudanças não relacionadas |
| Título e descrição claros | Explicação vaga ou ausente |
| Referenciar issues relacionadas | Reformatar arquivos inteiros |
| Commits pequenos e focados | Commits gigantes com tudo junto |
| Trabalhar em uma branch | Trabalhar direto na `main` |

**Tamanho ideal:** 200-400 linhas de código. PRs acima de 800 linhas devem ser divididos em partes menores para facilitar a revisão.

### Descrição do PR

Inclua na descrição:
- **O quê** - 1-2 frases sobre o que muda
- **Por quê** - motivação ou issue relacionada
- **Como testar** - como validar a mudança

### Checklist

- [ ] `node --test` passa
- [ ] Se adicionando uma skill, atualizei `skills/README.md`
- [ ] Se adicionando um best-practice guide, atualizei `_catalog.yaml`
- [ ] Inclui exemplo de uso na descrição (se aplicável)

## Precisa de ajuda?

- Abra uma [issue](https://github.com/renatoasse/opensquad/issues) com sua dúvida

Tentaremos responder PRs e issues em até **5 dias úteis**.

## Código de Conduta

Seja respeitoso, construtivo e colaborativo. Estamos aqui para construir algo incrível juntos.

---

# Contributing to opensquad (English)

Thanks for your interest in contributing! opensquad is a multi-agent orchestration framework **focused on automating real business work** - generating social media content, creating carousels, turning long videos into short clips, writing tutorials, planning product launches. It is not a software development framework.

opensquad's strength comes from the **ecosystem** - skills, agents, squads, and best-practice guides - not from framework complexity.

Before you start, watch the [launch video](https://www.youtube.com/watch?v=CL1ppI4qHeU) and read the [README](README.md) to understand the project.

## The Golden Rule: Verticalize, Don't Complicate

The right way to contribute is by **verticalizing**: creating new skills, agents, squads, and best-practice guides that expand what opensquad can do for businesses and content creators.

opensquad runs with `npx opensquad init` and that's it.

A team manager, a business owner, a content creator needs to be able to use it without being technical. We want to keep that simplicity.

The framework is intentionally file-based and dependency-light. **This is by design, not a limitation.**

## What We Welcome

- **New skills** - Platform integrations, APIs, services (the primary contribution type)
- **New best-practice guides** - Domain expertise: copywriting, design, SEO, email marketing, social media, data analysis...
- **New agents** - Reusable specialized agent definitions
- **Squad templates** - Ready-to-use squads for common use cases that the community can import and use
- **Bug fixes** - Fixing actual broken behavior
- **Performance improvements** - Making existing features faster
- **Documentation** - README improvements, examples, guides
- **Internationalization (i18n)** - New locale files or translation improvements (`src/locales/`)
- **Tests** - Adding test coverage for existing functionality

### Token Consumption Impact

Every skill, best-practice guide, or agent added to the project increases the context size loaded on every run — and therefore the token consumption for users. When contributing new content, be mindful of this impact. Prefer concise, focused instructions over lengthy text.

## What Doesn't Fit

Before you start coding, ask yourself: **"Does this change keep opensquad simple for non-technical users?"**

opensquad runs with `npx opensquad init` and that's it. That simplicity is intentional. Contributions that go in a different direction probably won't be merged - but we can always talk. Open an [issue](https://github.com/renatoasse/opensquad/issues) first to align.

Examples of what generally doesn't fit:

- Replacing the file-based system with databases (SQLite, Postgres, etc.) - the filesystem is the source of truth by design
- Adding infrastructure dependencies (Docker, vector databases, additional servers) - we want zero setup beyond Node.js
- Rewriting `_opensquad/core/` - prefer extending via skills and agents
- Significantly increasing the dependency tree - every new dependency is one more barrier
- Software development features - opensquad is for automating business processes, not for building apps

> Have an idea that doesn't fit here but you think is valuable? Open an issue and let's talk. The best ideas don't always follow the rules.

## Contribution Ideas

Not sure where to start? Here are some skills and squads the community would love to have:

**Skills:**
- `tiktok-publisher` - Publish videos to TikTok via API
- `linkedin-publisher` - Publish posts and articles to LinkedIn
- `twitter-publisher` - Publish tweets and threads to X/Twitter
- `youtube-uploader` - Upload videos to YouTube
- `thumbnail-creator` - Generate YouTube thumbnails
- `email-sender` - Send email campaigns (Brevo, Mailchimp, etc.)
- `whatsapp-sender` - Send messages via WhatsApp Business API
- `spreadsheet-analyzer` - Spreadsheet analysis and reporting
- `video-clipper` - Cut long videos into short vertical clips with subtitles
- `seo-auditor` - SEO audit for blogs and websites
- `podcast-transcriber` - Transcribe and summarize podcast episodes

**Best-practice guides:**
- Sales page copy
- Infoproduct launch planning
- Social media storytelling
- Ad copy (Meta Ads, Google Ads)
- Podcast scripts
- Presentations and pitch decks

**Ready-to-use squads:**
- LinkedIn content production squad
- Email lead generation squad
- Social media metrics analysis squad
- Training materials creation squad

## First Contribution

New here? Start here:

1. Watch the [launch video](https://www.youtube.com/watch?v=CL1ppI4qHeU) to understand the project vision
2. Run `npx opensquad init` in a test folder to experience the flow
3. Explore existing skills in `skills/` - see how each `SKILL.md` is structured
4. Look for issues labeled **`good first issue`** - these are simple, well-defined tasks
5. Pick an issue (or an idea from the [list above](#contribution-ideas)), comment that you'll work on it, and get started

You don't need to be an expert - curiosity and willingness to learn is what matters.

## How to Contribute

### Creating a Skill

Skills are opensquad's primary extension point. This is the best way to contribute. Use the `opensquad-skill-creator` skill to create and iterate:

```
/opensquad install opensquad-skill-creator
```

Directory structure:

```
skills/your-skill/
  SKILL.md          (required - YAML frontmatter + Markdown instructions)
  scripts/          (optional - local scripts)
  references/       (optional - reference files)
  assets/           (optional - visual assets)
```

The full `SKILL.md` format is documented in [`skills/opensquad-skill-creator/references/skill-format.md`](skills/opensquad-skill-creator/references/skill-format.md).

Skill types: `mcp`, `script`, `hybrid`, `prompt`.

When submitting a new skill, update the catalog table in [`skills/README.md`](skills/README.md).

#### Skill Security

Skills are injected directly into the agent context at runtime. There is no cryptographic verification (hash, digital signature) at install time. This means:

- `script` skills execute bash commands with the **full permissions of the local user**
- `mcp` skills can connect to external servers and receive tokens from `.env`
- `prompt` and `hybrid` skills directly influence agent behavior

**When submitting a skill, ensure that:**

- It does not include hardcoded credentials or access tokens
- It does not execute destructive commands without explicit user confirmation
- It does not upload user data to external services without clearly stating so in `SKILL.md`
- It does not modify files outside the squad scope (`squads/<name>/output/`)
- It documents in `SKILL.md` which external services are accessed and what data is transmitted

Community-submitted skills go through code review before being accepted into the official catalog.

### Creating a Best-Practice Guide

opensquad ships with guides for copywriting, carousel design, SEO, and more. But there's much more to cover. Use the `opensquad-agent-creator` skill:

```
/opensquad install opensquad-agent-creator
```

After creating, register the guide in [`_opensquad/core/best-practices/_catalog.yaml`](_opensquad/core/best-practices/_catalog.yaml). Check for overlap with existing guides before creating a new one.

### Creating a Squad Template

Ready-to-use squads that the community can import and use right away. To contribute a squad template:

1. Create the squad using `/opensquad create`
2. Test it at least 2-3 times to make sure it works well
3. Place it in the `squads/` folder of your PR with a description in `squad.yaml`

### Bug Fixes & Performance

1. Fork the repository
2. Create a branch (`feat/my-feature` or `fix/my-fix`)
3. Make your changes
4. Run tests: `node --test`
5. Open a PR

For performance improvements, include before/after benchmarks in the PR.

### Documentation & i18n

- Locale files live in `src/locales/` (en, pt-BR, es)
- The README is bilingual (PT-BR + English) - maintain both versions when editing
- Skill descriptions support i18n: `description_pt-BR`, `description_es`

## Reporting Bugs

Open an [issue](https://github.com/renatoasse/opensquad/issues) with:

- **Clear description** of the problem
- **Steps to reproduce** (step by step)
- **Expected behavior** vs **actual behavior**
- **Environment**: OS, Node.js version, IDE used

## Suggesting Features

Before opening a PR with a new feature, open an [issue](https://github.com/renatoasse/opensquad/issues) to discuss the idea. This avoids duplicate work and ensures alignment with the project direction.

Remember the [Golden Rule](#the-golden-rule-verticalize-dont-complicate): prefer creating skills, agents, and guides - not changing the architecture.

## Development Setup

```bash
git clone https://github.com/renatoasse/opensquad.git
cd opensquad
npm install
node --test
```

Requirement: **Node.js 20+**

## Commit Conventions

We use [Conventional Commits](https://www.conventionalcommits.org/):

| Prefix | Usage |
|--------|-------|
| `feat:` | New skill, agent, guide, or feature |
| `fix:` | Bug fix |
| `docs:` | Documentation |
| `chore:` | Maintenance |
| `refactor:` | Code restructuring without behavior change |
| `perf:` | Performance improvement |
| `test:` | Tests |

Examples:
```
feat: add tiktok-publisher skill
feat: add linkedin copywriting best-practice guide
fix: correct init copy for nested directories
docs: add Spanish translation for apify skill
```

## Pull Requests

### What Makes a Good PR?

| Do | Avoid |
|----|-------|
| One change per PR | Mixing unrelated changes |
| Clear title and description | Vague or missing explanation |
| Reference related issues | Reformatting entire files |
| Small, focused commits | Giant commits with everything |
| Work on a branch | Work directly on `main` |

**Ideal size:** 200-400 lines of code. PRs over 800 lines should be split into smaller parts to make review easier.

### PR Description

Include in your description:
- **What** - 1-2 sentences about what changes
- **Why** - motivation or related issue
- **How to test** - how to validate the change

### Checklist

- [ ] `node --test` passes
- [ ] If adding a skill, updated `skills/README.md`
- [ ] If adding a best-practice guide, updated `_catalog.yaml`
- [ ] Included usage example in description (if applicable)

## Need Help?

- Open an [issue](https://github.com/renatoasse/opensquad/issues) with your question

We respond to PRs and issues within **5 business days**.

## Code of Conduct

Be respectful, constructive, and collaborative. We're here to build something great together.
