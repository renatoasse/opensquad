# Opensquad

Crie squads de agentes de IA que trabalham juntos — direto do seu IDE.

## Instalação

**Requisitos:**
- [Node.js](https://nodejs.org/) v20.0.0 ou superior.

1. Clone este repositório e acesse a pasta:
   ```bash
   git clone https://github.com/renatoasse/opensquad.git
   cd opensquad
   ```

2. Instale as dependências essenciais e as ferramentas das habilidades:
   ```bash
   npm install      # Instala dependências principais e o CLI
   ```

3. Configure o Opensquad para a sua máquina:
   ```bash
   npx opensquad init
   ```
   > Responda aos prompts (ex: idioma de saída, qual IDE usa e suas credenciais). O framework gerará suas `rules.md` e configurará as bibliotecas extras (como browsers do Playwright) de forma interativa.

## Como Usar

Abra esta pasta no seu IDE e digite:

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

**Passo 1 — Gere o dashboard** (no seu IDE):

```
/opensquad dashboard
```

**Passo 2 — Sirva localmente** (no terminal):

```bash
npx serve squads/<nome-do-squad>/dashboard
```

**Passo 3 —** Abra `http://localhost:3000` no seu navegador.

---

# Opensquad (English)

Create AI squads that work together — right from your IDE.

## Installation

**Prerequisites:**
- [Node.js](https://nodejs.org/) v20.0.0 or higher.

1. Clone this repository and switch to its directory:
   ```bash
   git clone https://github.com/renatoasse/opensquad.git
   cd opensquad
   ```

2. Install core dependencies and CLI:
   ```bash
   npm install
   ```

3. Setup Opensquad for your local machine:
   ```bash
   npx opensquad init
   ```
   > Follow the prompt wizard (e.g., set your preferred language, IDE, and install browser tools for skills behind the scenes). Once completed, you are ready to go.

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
