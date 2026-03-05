# opensquad

Crie squads de agentes de IA que trabalham juntos — direto do seu terminal.

opensquad é um framework de orquestração multi-agente. Descreva o que você precisa em linguagem natural, e o opensquad cria uma equipe de agentes especializados que trabalham juntos automaticamente.

## O que é um Squad?

Um squad é uma equipe de agentes de IA que colaboram em uma tarefa. Cada agente tem um papel específico. Eles executam em pipeline — você só intervém nos checkpoints de decisão.

Exemplo:

- **Pesquisador** coleta informações e tendências do setor
- **Estrategista** gera ideias e define a abordagem
- **Redator** produz o conteúdo final
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
| Cursor | Em breve |
| Windsurf | Em breve |
| VS Code + Copilot | Em breve |

## Criando seu Squad

Descreva o que você precisa:

```
/opensquad create "Um squad que escreve posts no LinkedIn sobre tendências de IA"
```

O **Arquiteto** faz algumas perguntas, projeta o squad e configura tudo automaticamente. Você aprova o design antes de qualquer execução.

## Executando um Squad

```
/opensquad run <nome-do-squad>
```

O squad executa automaticamente, pausando apenas nos checkpoints onde sua decisão é necessária.

## Exemplos

```
/opensquad create "Squad que gera carrosséis de Instagram a partir de notícias quentes, cria as imagens e publica automaticamente"
/opensquad create "Squad que produz todos os materiais de lançamento de infoproduto: páginas de vendas, mensagens de WhatsApp, emails e roteiros de CPL"
/opensquad create "Squad que escreve tutoriais completos com prints de tela para treinamento de colaboradores"
/opensquad create "Squad que pega vídeos do YouTube e gera cortes virais automaticamente"
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

Create AI squads that work together — right from your terminal.

opensquad is a multi-agent orchestration framework. Describe what you need in plain language, and opensquad creates a team of specialized agents that work together automatically.

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
| Cursor | Coming soon |
| Windsurf | Coming soon |
| VS Code + Copilot | Coming soon |

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
