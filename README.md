# opensquad

Crie squads de agentes de IA que trabalham juntos — direto da sua IDE.

opensquad é um framework de orquestração multi-agente. Descreva o que você precisa em linguagem natural, e o opensquad cria uma equipe de agentes especializados que trabalham juntos automaticamente.

## Veja em ação

[![Assista ao vídeo de lançamento](https://img.youtube.com/vi/CL1ppI4qHeU/maxresdefault.jpg)](https://www.youtube.com/watch?v=CL1ppI4qHeU)

## O que é um Squad?

Um squad é uma equipe de agentes de IA que colaboram em uma tarefa. Cada agente tem um papel específico. Eles executam em pipeline com checkpoints onde o agente pausa e pede sua aprovação antes de continuar. Os checkpoints são instruções no pipeline do agente — o enforcement real de permissões depende da IDE host (ex: Claude Code, Cursor).

Exemplo:

- **Pesquisador** coleta informações e tendências do setor
- **Estrategista** gera ideias e define a abordagem
- **Redator** produz o conteúdo final
- **Designer** cria as imagens para redes sociais
- **Revisor** garante qualidade antes da entrega

## Para quem?

Para qualquer pessoa ou equipe que queira automatizar trabalho operacional e repetitivo com agentes de IA.

- **Criadores de conteúdo** — automatize pesquisa, redação e design para redes sociais, blogs e newsletters
- **Agências e freelancers** — crie pipelines reutilizáveis para atender múltiplos clientes
- **Times de marketing** — produza conteúdo consistente com aprovação humana nos checkpoints
- **Times de RH** — automatize triagem de currículos, comunicações internas e onboarding
- **Times de gestão** — gere relatórios, apresentações e dashboards a partir de dados brutos

## O que dá pra fazer?

- **Produção de conteúdo** — carrosséis, posts estáticos, artigos de blog, LinkedIn, com publicação automática inclusa
- **Refatoração de conteúdo** — transformar um vídeo em carrossel, artigo, thread ou qualquer outro formato
- **Criação e edição de vídeos** — cortar vídeos longos em reels, montar vídeos do zero
- **Análise de dados** — transformar planilhas em apresentações, sites ou dashboards
- **Planejamento de campanhas** — gerar roteiros, e-mails, mensagens de WhatsApp, cronogramas de lançamento, tudo de uma vez
- **Roteiros de vídeos longos** — VSLs, webinars, aulas
- **Radar de tendências** — monitorar notícias e tendências do nicho e alimentar automaticamente outros squads, como o de produção de conteúdo
- **Tutoriais e manuais** — o agente navega na internet, bate prints e monta um documento completo passo a passo (ideal para manuais de SaaS)
- E muito mais — qualquer fluxo de trabalho que envolva pesquisa, criação ou automação

## Instalação

**Pré-requisito:** Node.js 20+

```bash
npx opensquad init
```

Para atualizar uma instalação existente:

```bash
npx opensquad update
```

## IDEs Suportadas

| IDE | Status |
|-----|--------|
| Claude Code | Disponível |
| Cursor | Disponível |
| VS Code + Copilot | Disponível |
| Codex (OpenAI) | Disponível |
| Open Code | Disponível |
| Antigravity | Disponível |
| Gemini CLI | Disponível |
| Qwen Code | Disponível |
| Trae | Disponível |

## Escritório Virtual

O Escritório Virtual é uma interface visual 2D que mostra seus agentes trabalhando em tempo real.

**Passo 1 — Gere o dashboard** (na sua IDE):

```
/opensquad dashboard
```

**Passo 2 — Sirva localmente** (no terminal):

```bash
npx serve squads/<nome-do-squad>/dashboard
```

**Passo 3 —** Abra `http://localhost:3000` no seu navegador.

## Criando seu Squad

Abra o menu:

```
/opensquad
```

O **Opensquad** vai te mostrar todas as opções disponíveis. 

Para criar um novo squad, basta selecionar a opção, e o **Arquiteto** faz algumas perguntas, projeta o squad e configura tudo automaticamente. Você aprova o design antes de qualquer execução.

## Executando um Squad

Você pode executar o squad novamente com /opensquad, ou pedindo diretamente:

```
/opensquad rode o squad <nome-do-squad>
```

O squad executa automaticamente, pausando nos checkpoints onde o agente pede sua aprovação.

## Exemplos

```
/opensquad
/opensquad crie um Squad que gera carrosséis de Instagram a partir de notícias quentes, cria as imagens e publica automaticamente
/opensquad quero um Squad que produz todos os materiais de lançamento de infoproduto: páginas de vendas, mensagens de WhatsApp, emails e roteiros de CPL
/opensquad crie um Squad que escreve tutoriais completos com prints de tela para treinamento de colaboradores
/opensquad crie um "Squad que pega vídeos do YouTube e gera cortes virais automaticamente"
/opensquad roda o squad carrosseis-instagram

```

## Comandos

| Comando | O que faz |
|---------|-----------|
| `/opensquad` | Abre o menu principal |
| `/opensquad help` | Mostra todos os comandos |
| `/opensquad create` | Cria um novo squad |
| `/opensquad run <nome>` | Executa um squad |
| `/opensquad list` | Lista seus squads |
| `/opensquad edit <nome>` | Modifica um squad |
| `/opensquad skills` | Navega pelas skills instaladas |
| `/opensquad install <nome>` | Instala uma skill do catálogo |
| `/opensquad uninstall <nome>` | Remove uma skill instalada |

## Custo de Tokens

O opensquad é open source e gratuito como software. É possível usá-lo de forma 100% gratuita com stacks como Google Antigravity (free tier com Gemini) ou OpenCode com LLMs locais (Ollama, LM Studio, etc.).

Porém, stacks como Claude Code (Claude Pro/Max) e API da OpenAI consomem tokens pagos:

- Cada execução de squad consome tokens — a quantidade depende do número de agentes, da complexidade do pipeline e do modelo escolhido.
- Investigações com Sherlock (navegação de perfis) e geração de imagens são operações especialmente intensivas.
- O framework carrega prompts de sistema, best practices e instruções de agentes no contexto — o que contribui para o consumo base de cada execução.

Se estiver usando uma stack paga, recomendamos monitorar seu consumo de tokens na sua IDE ou no dashboard do provedor de IA.

## Sessões de Navegador e Privacidade

Quando você fornece URLs de referência durante a criação de um squad (ex: "siga o estilo do @fulano"), o opensquad usa um navegador headless (Playwright) para visitar essas páginas e extrair padrões de conteúdo.

- **Login manual:** na primeira vez que uma plataforma exige login, o opensquad pede para você entrar manualmente e **pergunta se deseja salvar a sessão** para investigações futuras.
- **Cookies persistentes:** se você autorizar, os cookies ficam salvos localmente em `_opensquad/_browser_profile/`. Esse diretório nunca é commitado no git (`.gitignore`).
- **Escopo de acesso:** o navegador tem acesso a qualquer URL — não apenas às referências fornecidas. As ações do navegador (navegação, cliques, execução de JavaScript) são controladas pelo agente investigador.
- **Revogar sessões:** delete a pasta `_opensquad/_browser_profile/` para remover todos os cookies e dados de sessão salvos. Na próxima investigação, um novo login manual será necessário.

## Sobre

O opensquad é um projeto open source criado e mantido por [Renato Asse](https://github.com/renatoasse), fundador da [Comunidade Sem Codar](https://semcodar.com.br), uma Escola de IA com mais de 25 mil alunos focada em ensinar pessoas não-técnicas a usar inteligência artificial no trabalho.

O projeto nasceu da necessidade real de automatizar processos de conteúdo e marketing usando agentes de IA — e é disponibilizado gratuitamente para que qualquer pessoa possa usar, estudar e contribuir.

Contribuições da comunidade são bem-vindas. Veja o [CONTRIBUTING.md](CONTRIBUTING.md) para saber como participar.

## Licença

MIT — use como quiser.

---

# opensquad (English)

Create AI squads that work together — right from your IDE.

opensquad is a multi-agent orchestration framework. Describe what you need in plain language, and opensquad creates a team of specialized agents that work together automatically.

## See it in action

[![Watch the launch video](https://img.youtube.com/vi/CL1ppI4qHeU/maxresdefault.jpg)](https://www.youtube.com/watch?v=CL1ppI4qHeU)

## What is a Squad?

A squad is a team of AI agents that collaborate on a task. Each agent has a specific role. They run in a pipeline with checkpoints where the agent pauses and asks for your approval before continuing. Checkpoints are instructions in the agent pipeline — actual permission enforcement depends on the host IDE (e.g., Claude Code, Cursor).

Example:

- **Researcher** gathers information and industry trends
- **Strategist** generates ideas and defines the approach
- **Writer** produces the final content
- **Reviewer** ensures quality before delivery

## Installation

**Prerequisite:** Node.js 20+

```bash
npx opensquad init
```

> **Note:** Always run your AI IDE from inside the project directory where you ran `npx opensquad init`. The `/opensquad` command is only available when the IDE is opened in that folder.

To update an existing installation:

```bash
npx opensquad update
```

## Supported IDEs

| IDE | Status |
|-----|--------|
| Claude Code | Available |
| Cursor | Available |
| VS Code + Copilot | Available |
| Codex (OpenAI) | Available |
| Open Code | Available |
| Antigravity | Available |
| Gemini CLI | Available |
| Qwen Code | Available |
| Trae | Available |

## Virtual Office

The Virtual Office is a 2D visual interface that shows your agents working in real time.

**Step 1 — Generate the dashboard** (in your IDE):

```
/opensquad dashboard
```

**Step 2 — Serve it locally** (in terminal):

```bash
npx serve squads/<squad-name>/dashboard
```

**Step 3 —** Open `http://localhost:3000` in your browser.

## Creating your Squad

Describe what you need:

```
/opensquad create "A squad that writes LinkedIn posts about AI trends"
```

The **Architect** asks a few questions, designs the squad, and sets everything up automatically. You approve the design before any execution begins.

## Running a Squad

```
/opensquad run <squad-name>
```

The squad runs automatically, pausing at checkpoints where the agent asks for your approval.

## Examples

```
/opensquad create "Squad that generates Instagram carousels from trending news, creates the images, and publishes automatically"
/opensquad create "Squad that produces all infoproduct launch materials: sales pages, WhatsApp messages, emails, and CPL scripts"
/opensquad create "Squad that writes complete tutorials with screenshots for employee training"
/opensquad create "Squad that takes YouTube videos and automatically generates viral clips"
```

## Commands

| Command | What it does |
|---------|-------------|
| `/opensquad` | Open the main menu |
| `/opensquad help` | Show all commands |
| `/opensquad create` | Create a new squad |
| `/opensquad run <name>` | Run a squad |
| `/opensquad list` | See all your squads |
| `/opensquad edit <name>` | Modify a squad |
| `/opensquad skills` | Browse installed skills |
| `/opensquad install <name>` | Install a skill from catalog |
| `/opensquad uninstall <name>` | Remove an installed skill |

## Token Cost

opensquad is open source and free as software. You can use it completely free with stacks like Google Antigravity (free tier with Gemini) or OpenCode with local LLMs (Ollama, LM Studio, etc.).

However, stacks like Claude Code (Claude Pro/Max) and OpenAI API consume paid tokens:

- Every squad run consumes tokens — the amount depends on the number of agents, pipeline complexity, and the model chosen.
- Sherlock investigations (profile browsing) and image generation are especially token-intensive operations.
- The framework loads system prompts, best practices, and agent instructions into context — contributing to the base token consumption of every run.

If using a paid stack, we recommend monitoring your token usage in your IDE or your AI provider's dashboard.

## Browser Sessions & Privacy

When you provide reference URLs during squad creation (e.g., "follow the style of @someone"), opensquad uses a headless browser (Playwright) to visit those pages and extract content patterns.

- **Manual login:** the first time a platform requires login, opensquad asks you to log in manually and **asks whether you want to save the session** for future investigations.
- **Persistent cookies:** if you agree, cookies are saved locally in `_opensquad/_browser_profile/`. This directory is never committed to git (`.gitignore`).
- **Access scope:** the browser can access any URL — not just the references you provided. Browser actions (navigation, clicks, JavaScript execution) are controlled by the investigator agent.
- **Revoking sessions:** delete the `_opensquad/_browser_profile/` folder to remove all saved cookies and session data. The next investigation will require a fresh manual login.

## About

opensquad is an open source project created and maintained by [Renato Asse](https://github.com/renatoasse), founder of [Comunidade Sem Codar](https://semcodar.com.br) (No-Code Community), an AI School with over 25,000 students focused on teaching non-technical people how to use artificial intelligence at work.

The project was born from the real need to automate content and marketing workflows using AI agents — and is made freely available so anyone can use, study, and contribute.

Community contributions are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) to learn how to participate.

## License

MIT — use it however you want.
