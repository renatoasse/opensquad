# Opensquad

Crie squads de agentes de IA que trabalham juntos — direto do seu IDE.

## Como usar no Cursor

1. **Abra esta pasta** no Cursor (File → Open Folder → pasta do opensquad).
2. **Abra o Chat do Cursor** (Ctrl+L ou ícone de chat).
3. **Digite na caixa de mensagem** um dos comandos abaixo. O assistente passa a seguir as regras do Opensquad e responde com o menu ou a ação pedida.

**Comandos que você pode digitar:**

| O que você digita | O que acontece |
|-------------------|----------------|
| `/opensquad` ou `/opensquad menu` | Abre o menu principal (criar squad, executar, etc.) |
| `/opensquad crie um squad para [descrição]` | O Arquiteto cria um novo squad (perguntas + configuração automática) |
| `/opensquad execute o squad <nome>` ou `/opensquad run <nome>` | Executa o pipeline do squad (pausa em checkpoints) |
| `/opensquad list` | Lista todos os squads na pasta `squads/` |
| `/opensquad dashboard` | Gera/prepara o dashboard do Escritório Virtual |
| `/opensquad skills` | Menu de skills (instalar, criar, gerenciar) |
| `/opensquad help` | Mostra ajuda |

Você também pode **escrever em linguagem natural**, por exemplo: *“crie um squad para posts no LinkedIn sobre IA”* ou *“execute o squad meu-squad”* — o assistente interpreta e encaminha para a ação certa.

Na primeira vez, se a empresa ainda não estiver configurada, o assistente faz um **onboarding**: pergunta seu nome, idioma, nome da empresa e pesquisa o site para montar o perfil em `_opensquad/_memory/company.md`. Depois disso, o menu principal fica disponível.

**Dica:** O projeto inclui o comando em `.cursor/commands/opensquad.md`. Ao digitar `/` no chat do Cursor, **opensquad** deve aparecer nas sugestões; escolha ou digite `/opensquad`. Se não aparecer, digite `/opensquad` manualmente — o assistente segue as regras do Opensquad da mesma forma.

---

## Como Usar (resumo)

Abra esta pasta no seu IDE e digite no chat:

```
/opensquad
```

Isso abre o menu principal. De lá você pode criar squads, executá-los e mais.

Você também pode ser direto — descreva o que quer em linguagem natural:

```
/opensquad crie um squad para escrever posts no LinkedIn sobre IA
/opensquad execute o squad meu-squad
```

## Criar um Squad

Digite `/opensquad` e escolha "Criar squad" no menu, ou seja direto:

```
/opensquad crie um squad para [o que você precisa]
```

O Arquiteto fará algumas perguntas, projetará o squad e configurará tudo automaticamente.

## Executar um Squad

Digite `/opensquad` e escolha "Executar squad" no menu, ou seja direto:

```
/opensquad execute o squad <nome-do-squad>
```

O squad executa automaticamente, pausando apenas nos checkpoints de decisão.

## Escritório Virtual

O Escritório Virtual é uma interface visual 2D que mostra seus agentes trabalhando em tempo real.

**Para ver a lista de squads** (sidebar com todos os squads da pasta `squads/`), execute na **raiz do projeto**:

```bash
npm run dashboard:dev
```

Depois abra no navegador o endereço que o Vite mostrar (ex.: `http://localhost:5173`). O dashboard conecta por WebSocket e lista automaticamente os squads que tiverem `squads/<nome>/squad.yaml`.

**Para servir apenas a prévia estática** (ex.: após build):

```bash
/opensquad dashboard   # no IDE — gera/copia o build
npx serve squads/_preview/dashboard
```

Abra `http://localhost:3000`. Esse modo não mostra a lista de squads (é só a interface estática).

---

# Opensquad (English)

Create AI squads that work together — right from your IDE.

## How to Use

Open this folder in your IDE and type:

```
/opensquad
```

This opens the main menu. From there you can create squads, run them, and more.

You can also be direct — describe what you want in plain language:

```
/opensquad create a squad for writing LinkedIn posts about AI
/opensquad run my-squad
```

## Create a Squad

Type `/opensquad` and choose "Create squad" from the menu, or be direct:

```
/opensquad create a squad for [what you need]
```

The Architect will ask a few questions, design the squad, and set everything up automatically.

## Run a Squad

Type `/opensquad` and choose "Run squad" from the menu, or be direct:

```
/opensquad run the <squad-name> squad
```

The squad runs automatically, pausing only at decision checkpoints.

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
