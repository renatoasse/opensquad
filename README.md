# opensquad

Crie squads de agentes de IA que trabalham juntos — direto da sua IDE.

opensquad é um framework de orquestração multi-agente. Descreva o que você precisa em linguagem natural, e o opensquad cria uma equipe de agentes especializados que trabalham juntos automaticamente.

## Veja em ação

[![Assista ao vídeo de lançamento](https://img.youtube.com/vi/CL1ppI4qHeU/maxresdefault.jpg)](https://www.youtube.com/watch?v=CL1ppI4qHeU)

## O que é um Squad?

Um squad é uma equipe de agentes de IA que colaboram em uma tarefa. Cada agente tem um papel específico. Eles executam em pipeline — você só intervém nos checkpoints de decisão.

Exemplo:

- **Pesquisador** coleta informações e tendências do setor
- **Estrategista** gera ideias e define a abordagem
- **Redator** produz o conteúdo final
- **Designer** cria as imagens para redes sociais
- **Revisor** garante qualidade antes da entrega

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
| Antigravity | Disponível |
| Claude Code | Disponível |
| Codex (OpenAI) | Disponível |
| Open Code | Disponível |
| Cursor | Disponível |
| VS Code + Copilot | Disponível |

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

O squad executa automaticamente, pausando apenas nos checkpoints onde sua decisão é necessária.

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

## Licença

MIT — use como quiser.

---

# opensquad (English)

Create AI squads that work together — right from your IDE.

opensquad is a multi-agent orchestration framework. Describe what you need in plain language, and opensquad creates a team of specialized agents that work together automatically.

## See it in action

[![Watch the launch video](https://img.youtube.com/vi/CL1ppI4qHeU/maxresdefault.jpg)](https://www.youtube.com/watch?v=CL1ppI4qHeU)

## What is a Squad?

A squad is a team of AI agents that collaborate on a task. Each agent has a specific role. They run in a pipeline — you only step in at decision checkpoints.

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

To update an existing installation:

```bash
npx opensquad update
```

## Supported IDEs

| IDE | Status |
|-----|--------|
| Antigravity | Available |
| Claude Code | Available |
| Codex (OpenAI) | Available |
| Open Code | Available |
| Cursor | Available |
| VS Code + Copilot | Available |

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

The squad runs automatically, pausing only at checkpoints where your decision is needed.

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

## License

MIT — use it however you want.
