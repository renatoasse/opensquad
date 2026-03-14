# Changelog: Integração Open Notebook no OpenSquad

**Data:** 2026-03-13
**Versão:** 1.0.0
**Autor:** OpenSquad Team
**Status:** Em desenvolvimento

---

## Sumário Executivo

Este changelog documenta a integração completa do **Open Notebook** como base de conhecimento vetorial no OpenSquad. A mudança substitui o carregamento bruto de todos os arquivos `.md` do projeto por busca semântica via embeddings, resultando em **redução de ~97% no consumo de tokens por sessão**.

---

## Índice

1. [Visão Geral da Arquitetura](#visão-geral-da-arquitetura)
2. [Arquivos Modificados](#arquivos-modificados)
3. [Arquivos Criados](#arquivos-criados)
4. [Configuração Docker Compose](#configuração-docker-compose)
5. [Integração MCP](#integração-mcp)
6. [Arquitetura de Embeddings](#arquitetura-de-embeddings)
7. [Fluxo do Indexador](#fluxo-do-indexador)
8. [Scripts PowerShell](#scripts-powershell)
9. [Considerações Windows](#considerações-windows)
10. [Economia de Tokens](#economia-de-tokens)
11. [Integração RTK](#integração-rtk)
12. [Referência de API](#referência-de-api)

---

## Visão Geral da Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                      Máquina do Usuário                     │
│                                                             │
│  ┌───────────────┐     ┌──────────────────────────────────┐ │
│  │  LM Studio    │     │         Docker Desktop           │ │
│  │  (nativo)     │     │                                  │ │
│  │               │     │  ┌────────────┐ ┌─────────────┐  │ │
│  │  nomic-embed  │◄────┼──┤   Open     │ │  SurrealDB  │  │ │
│  │  -text        │     │  │  Notebook  │ │  v2         │  │ │
│  │               │     │  │            │ │             │  │ │
│  │  :1234        │     │  │  UI :8502  │ │  :8000      │  │ │
│  │               │     │  │  API :5055 │ │  RocksDB    │  │ │
│  └───────────────┘     │  └─────┬──────┘ └──────┬──────┘  │ │
│                        │        │               │          │ │
│                        │        └───────┬───────┘          │ │
│                        │                │                  │ │
│                        └────────────────┼──────────────────┘ │
│                                         │                    │
│  ┌──────────────────────────────────────┼──────────────────┐ │
│  │              OpenSquad CLI           │                  │ │
│  │                                     │                  │ │
│  │  ┌──────────┐  ┌──────────┐  ┌─────┴──────┐           │ │
│  │  │ init.js  │  │services  │  │ indexer.js  │           │ │
│  │  │          │  │  .js     │  │             │           │ │
│  │  └──────────┘  └──────────┘  └─────────────┘           │ │
│  │                                                        │ │
│  │  ┌──────────────────────────────────────┐              │ │
│  │  │  open-notebook-mcp (via uvx)         │              │ │
│  │  │  search_sources | add_source | chat  │              │ │
│  │  └──────────────────────────────────────┘              │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Fluxo de Dados

```
Arquivos .md ──► Indexer ──► Open Notebook API ──► Chunking ──► LM Studio
    (projeto)     (POST)       (:5055)         (MarkdownHeader)  (embedding)
                                                      │
                                                      ▼
                                                 SurrealDB
                                                 (vetores)
                                                      │
                                                      ▼
                                              MCP Tool Call
                                            (search_sources)
                                                      │
                                                      ▼
                                              Top 5 chunks
                                             (~500 tokens)
```

---

## Arquivos Modificados

### 1. `src/init.js`

**Descrição:** Adicionada seleção de base de conhecimento durante `npx opensquad init`.

**Mudanças:**

- Nova pergunta interativa no fluxo de inicialização:
  - Opções: `Open Notebook` / `NotebookLM` / `Nenhum`
- Nova função `setupOpenNotebook()` com as seguintes responsabilidades:

| Etapa | Ação | Detalhes |
|-------|------|----------|
| 1 | Criar diretório | `.opensquad-services/` na raiz do projeto |
| 2 | Gerar Docker Compose | `docker-compose.yml` com SurrealDB + Open Notebook |
| 3 | Atualizar MCP | `.mcp.json` com servidor `open-notebook-mcp` |
| 4 | Salvar preferências | Escolha da base de conhecimento em config |

**Exemplo de uso:**

```bash
npx opensquad init

# Saída:
# ? Qual base de conhecimento deseja usar?
#   ❯ Open Notebook (local, Docker)
#     NotebookLM (Google, cloud)
#     Nenhum
#
# ✔ Diretório .opensquad-services/ criado
# ✔ docker-compose.yml gerado
# ✔ .mcp.json atualizado com open-notebook-mcp
# ✔ Preferências salvas
```

**Chave de criptografia gerada automaticamente:**

```javascript
const encryptionKey = crypto.randomUUID();
// Exemplo: "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
// Inserido no docker-compose.yml como ENCRYPTION_KEY
```

---

### 2. `bin/opensquad.js`

**Descrição:** Adicionado comando `services` com quatro subcomandos.

**Novos comandos:**

```bash
npx opensquad services start    # Inicia containers Docker
npx opensquad services stop     # Para containers Docker
npx opensquad services health   # Verifica saúde dos serviços
npx opensquad services index    # Indexa arquivos .md
```

**Tabela de subcomandos:**

| Subcomando | Ação | Comando Docker |
|------------|------|----------------|
| `start` | Inicia SurrealDB + Open Notebook | `docker compose up -d` |
| `stop` | Para todos os containers | `docker compose down` |
| `health` | Verifica endpoints de saúde | HTTP GET em cada serviço |
| `index` | Indexa documentação do projeto | POST via REST API |

**Exemplo de saída do `health`:**

```
┌─────────────────┬────────┬───────────────────────────┐
│ Serviço         │ Status │ Endpoint                  │
├─────────────────┼────────┼───────────────────────────┤
│ SurrealDB       │ ✔ UP   │ http://localhost:8000     │
│ Open Notebook   │ ✔ UP   │ http://localhost:5055     │
│ Open Notebook UI│ ✔ UP   │ http://localhost:8502     │
│ LM Studio       │ ✔ UP   │ http://localhost:1234     │
└─────────────────┴────────┴───────────────────────────┘
```

---

### 3. `templates/.mcp.json`

**Descrição:** Template atualizado para incluir servidor MCP do Open Notebook.

**Antes:**

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@anthropic/mcp-playwright"]
    }
  }
}
```

**Depois:**

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@anthropic/mcp-playwright"]
    },
    "open-notebook-mcp": {
      "command": "uvx",
      "args": ["open-notebook-mcp"],
      "env": {
        "OPEN_NOTEBOOK_URL": "http://localhost:5055"
      }
    }
  }
}
```

---

## Arquivos Criados

### 4. `src/services.js`

**Descrição:** Módulo principal para gerenciamento dos serviços Docker do Open Notebook.

**Funções exportadas:**

| Função | Parâmetros | Descrição |
|--------|------------|-----------|
| `startServices()` | — | Executa `docker compose up -d` no diretório `.opensquad-services/` |
| `stopServices()` | — | Executa `docker compose down` |
| `checkHealth()` | — | Verifica endpoints HTTP de cada serviço |
| `indexDocs()` | `projectDir` | Delega para `indexer.js` a indexação dos `.md` |

**Verificação de saúde (detalhes):**

```javascript
const HEALTH_ENDPOINTS = [
  { name: 'SurrealDB',       url: 'http://localhost:8000/health' },
  { name: 'Open Notebook API', url: 'http://localhost:5055/health' },
  { name: 'Open Notebook UI',  url: 'http://localhost:8502' },
  { name: 'LM Studio',       url: 'http://localhost:1234/v1/models' },
];
```

---

### 5. `src/indexer.js`

**Descrição:** Módulo responsável por localizar, processar e indexar arquivos `.md` no Open Notebook.

**Fluxo completo:**

```
1. Escanear projeto
   └─► glob("**/*.md")
       └─► Excluir: node_modules/, .git/, dashboard/node_modules/
           └─► Filtrar: tamanho > 100 caracteres

2. Criar notebook
   └─► POST /api/notebooks
       └─► Body: { "name": "OpenSquad Docs" }
           └─► Response: { "id": "notebook_abc123" }

3. Indexar cada arquivo
   └─► Para cada .md válido:
       └─► POST /api/sources
           └─► Body: { "notebook_id": "...", "content": "...", "name": "arquivo.md" }
               └─► Open Notebook auto-processa:
                   ├─► MarkdownHeaderTextSplitter
                   ├─► Chunks: 1200 chars, 15% overlap (180 chars)
                   └─► Embedding via LM Studio (nomic-embed-text)
```

**Diretórios excluídos da indexação:**

```javascript
const EXCLUDED_DIRS = [
  'node_modules',
  '.git',
  'dashboard/node_modules',
  '.opensquad-services',
  'dist',
  'build',
  '.next',
];
```

**Critério de inclusão:** Apenas arquivos com mais de 100 caracteres são indexados para evitar noise de arquivos vazios ou stubs.

---

### 6. `templates/.opensquad-services/docker-compose.yml`

**Descrição:** Template do Docker Compose para os serviços de infraestrutura.

**Configuração completa:**

```yaml
version: "3.8"

services:
  surrealdb:
    image: surrealdb/surrealdb:v2
    container_name: opensquad-surrealdb
    command: start --user root --pass root rocksdb://data/database.db
    ports:
      - "8000:8000"
    volumes:
      - surrealdb-data:/data
    restart: always
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 10s
      timeout: 5s
      retries: 3

  open-notebook:
    image: lfnovo/open-notebook:v1-latest
    container_name: opensquad-open-notebook
    ports:
      - "8502:8502"
      - "5055:5055"
    environment:
      - SURREAL_ADDRESS=ws://surrealdb:8000
      - SURREAL_USER=root
      - SURREAL_PASS=root
      - SURREAL_NAMESPACE=open_notebook
      - SURREAL_DATABASE=open_notebook
      - ENCRYPTION_KEY=${ENCRYPTION_KEY}
      - EMBEDDING_PROVIDER=lm_studio
      - EMBEDDING_MODEL=nomic-embed-text
      - LM_STUDIO_BASE_URL=http://host.docker.internal:1234/v1
    depends_on:
      surrealdb:
        condition: service_healthy
    pull_policy: always
    restart: always

volumes:
  surrealdb-data:
    driver: local
```

**Destaques da configuração:**

| Parâmetro | Valor | Justificativa |
|-----------|-------|---------------|
| `surrealdb:v2` | Versão 2.x | Suporte a vetores nativos |
| `rocksdb://` | Engine RocksDB | Persistência eficiente em disco |
| `pull_policy: always` | Auto-update | Garante versão mais recente |
| `restart: always` | Auto-restart | Recuperação automática de falhas |
| `host.docker.internal` | Bridge host | Acesso ao LM Studio nativo no Windows |
| Named volumes | `surrealdb-data` | Melhor performance que bind mounts no Windows |

---

### 7. `scripts/start.ps1`

**Descrição:** Script PowerShell para iniciar todos os serviços com verificação de saúde.

**Funcionalidades:**
- Verifica se Docker Desktop está rodando
- Verifica se LM Studio está acessível na porta 1234
- Executa `docker compose up -d` no diretório `.opensquad-services/`
- Aguarda health check de todos os containers
- Reporta status final

---

### 8. `scripts/stop.ps1`

**Descrição:** Script PowerShell para parar todos os serviços Docker.

**Funcionalidades:**
- Executa `docker compose down` no diretório `.opensquad-services/`
- Confirma que todos os containers foram encerrados

---

### 9. `scripts/health.ps1`

**Descrição:** Script PowerShell para verificação de saúde de todos os serviços.

**Endpoints verificados:**

| Serviço | URL | Método | Resposta Esperada |
|---------|-----|--------|-------------------|
| SurrealDB | `http://localhost:8000/health` | GET | 200 OK |
| Open Notebook API | `http://localhost:5055/health` | GET | 200 OK |
| Open Notebook UI | `http://localhost:8502` | GET | 200 OK |
| LM Studio | `http://localhost:1234/v1/models` | GET | JSON com modelos |

---

### 10. `scripts/index-docs.ps1`

**Descrição:** Script PowerShell para indexação de arquivos `.md` no Open Notebook.

**Fluxo:**
1. Localiza todos os `.md` no projeto (excluindo `node_modules`, `.git`, etc.)
2. Cria notebook "OpenSquad Docs" via API
3. Envia cada arquivo como source via API REST
4. Open Notebook processa chunking e embedding de forma assíncrona

---

## Configuração Docker Compose

### Diagrama de Rede

```
┌─────────────────────────────────────────┐
│          Docker Network (bridge)         │
│                                          │
│  ┌──────────────┐    ┌───────────────┐  │
│  │  SurrealDB   │◄───┤ Open Notebook │  │
│  │  :8000       │    │ :8502 / :5055 │  │
│  │              │    │               │  │
│  │  ws://       │    │  REST API     │  │
│  │  surrealdb   │    │  Streamlit UI │  │
│  │  :8000       │    │               │  │
│  └──────────────┘    └───────┬───────┘  │
│                              │           │
└──────────────────────────────┼───────────┘
                               │
                    host.docker.internal
                               │
                    ┌──────────┴──────────┐
                    │     LM Studio       │
                    │     :1234           │
                    │  nomic-embed-text   │
                    └─────────────────────┘
```

### Variáveis de Ambiente

| Variável | Valor | Descrição |
|----------|-------|-----------|
| `SURREAL_ADDRESS` | `ws://surrealdb:8000` | Conexão interna via nome do serviço |
| `SURREAL_USER` | `root` | Usuário padrão do SurrealDB |
| `SURREAL_PASS` | `root` | Senha padrão do SurrealDB |
| `SURREAL_NAMESPACE` | `open_notebook` | Namespace dedicado |
| `SURREAL_DATABASE` | `open_notebook` | Database dedicado |
| `ENCRYPTION_KEY` | `crypto.randomUUID()` | Chave gerada automaticamente |
| `EMBEDDING_PROVIDER` | `lm_studio` | Provedor de embeddings |
| `EMBEDDING_MODEL` | `nomic-embed-text` | Modelo de embeddings |
| `LM_STUDIO_BASE_URL` | `http://host.docker.internal:1234/v1` | URL do LM Studio no host |

---

## Integração MCP

### Servidor MCP: `open-notebook-mcp`

**Instalação:** Via `uvx` (gerenciador de pacotes Python, parte do `uv`).

**Configuração no `.mcp.json`:**

```json
{
  "open-notebook-mcp": {
    "command": "uvx",
    "args": ["open-notebook-mcp"],
    "env": {
      "OPEN_NOTEBOOK_URL": "http://localhost:5055"
    }
  }
}
```

### Tools Expostas pelo MCP

| Tool | Descrição | Uso Típico |
|------|-----------|------------|
| `search_sources` | Busca semântica nos documentos indexados | Encontrar contexto relevante para uma pergunta |
| `add_source` | Adiciona novo documento à base | Indexar arquivo individual |
| `create_notebook` | Cria novo notebook | Organizar documentação por tema |
| `list_notebooks` | Lista notebooks existentes | Verificar estrutura da base |
| `chat` | Chat com contexto da base de conhecimento | Perguntas sobre a documentação |
| `create_note` | Cria nota dentro de um notebook | Adicionar anotações manuais |

### Exemplo de Uso via Claude

```
Usuário: "Como funciona o sistema de squads?"

Claude (internamente):
  └─► MCP call: search_sources("sistema de squads funcionamento")
      └─► Retorna top 5 chunks relevantes (~500 tokens)
          └─► Claude responde com base no contexto recuperado
```

---

## Arquitetura de Embeddings

### Modelo: nomic-embed-text

| Propriedade | Valor |
|-------------|-------|
| Tamanho do modelo | 548 MB |
| Contexto máximo | 8.192 tokens |
| Dimensão do vetor | 768 |
| Acurácia de retrieval (MTEB) | ~57% |
| Provedor | Nomic AI |
| Execução | Local via LM Studio |

### Pipeline de Embedding

```
Documento .md
    │
    ▼
MarkdownHeaderTextSplitter
    │
    ├─► Respeita hierarquia de headers (#, ##, ###)
    ├─► Chunk size: 1200 caracteres
    └─► Overlap: 15% (180 caracteres)
         │
         ▼
    Chunks individuais
         │
         ▼
    LM Studio API (:1234)
    POST /v1/embeddings
         │
         ├─► Input: texto do chunk
         └─► Output: vetor float[768]
              │
              ▼
         SurrealDB
         (armazenamento vetorial)
```

### Exemplo de Requisição de Embedding

```bash
curl -X POST http://localhost:1234/v1/embeddings \
  -H "Content-Type: application/json" \
  -d '{
    "model": "nomic-embed-text",
    "input": "O sistema de squads permite organizar agentes..."
  }'
```

**Resposta:**

```json
{
  "object": "list",
  "data": [
    {
      "object": "embedding",
      "index": 0,
      "embedding": [0.0234, -0.0156, 0.0891, ...]
    }
  ],
  "model": "nomic-embed-text",
  "usage": {
    "prompt_tokens": 12,
    "total_tokens": 12
  }
}
```

---

## Fluxo do Indexador

### Diagrama de Sequência

```
CLI (index)      Indexer         Open Notebook API     LM Studio
    │               │                   │                  │
    │  indexDocs()   │                   │                  │
    ├──────────────► │                   │                  │
    │               │  glob(**/*.md)     │                  │
    │               │  filter > 100ch   │                  │
    │               │                   │                  │
    │               │  POST /api/       │                  │
    │               │  notebooks        │                  │
    │               ├──────────────────►│                  │
    │               │  { id: "nb_123" } │                  │
    │               │◄──────────────────┤                  │
    │               │                   │                  │
    │               │  POST /api/       │                  │
    │               │  sources (loop)   │                  │
    │               ├──────────────────►│                  │
    │               │                   │  POST /v1/       │
    │               │                   │  embeddings      │
    │               │                   ├─────────────────►│
    │               │                   │  vector[768]     │
    │               │                   │◄─────────────────┤
    │               │  { id: "src_456"}│                  │
    │               │◄──────────────────┤                  │
    │               │                   │                  │
    │  done (count)  │                   │                  │
    │◄──────────────┤                   │                  │
```

### Exemplos de API

**Criar notebook:**

```bash
curl -X POST http://localhost:5055/api/notebooks \
  -H "Content-Type: application/json" \
  -d '{"name": "OpenSquad Docs"}'
```

**Resposta:**

```json
{
  "id": "notebook:abc123",
  "name": "OpenSquad Docs",
  "created_at": "2026-03-13T10:00:00Z"
}
```

**Adicionar source:**

```bash
curl -X POST http://localhost:5055/api/sources \
  -H "Content-Type: application/json" \
  -d '{
    "notebook_id": "notebook:abc123",
    "content": "# Guia de Squads\n\nCada squad possui...",
    "name": "squads-guide.md"
  }'
```

**Buscar sources (via MCP):**

```bash
# Internamente o MCP faz:
curl -X POST http://localhost:5055/api/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "como configurar um squad",
    "top_k": 5
  }'
```

**Resposta da busca:**

```json
{
  "results": [
    {
      "content": "## Configuração de Squads\n\nPara configurar...",
      "score": 0.89,
      "source": "squads-guide.md",
      "chunk_index": 3
    },
    {
      "content": "### Parâmetros do Squad\n\nCada squad aceita...",
      "score": 0.82,
      "source": "squads-guide.md",
      "chunk_index": 4
    }
  ]
}
```

---

## Scripts PowerShell

### Visão Geral

| Script | Arquivo | Uso |
|--------|---------|-----|
| Start | `scripts/start.ps1` | Iniciar Docker + verificar saúde |
| Stop | `scripts/stop.ps1` | Parar todos os containers |
| Health | `scripts/health.ps1` | Verificar status dos serviços |
| Index | `scripts/index-docs.ps1` | Indexar documentação .md |

### Pré-requisitos verificados pelo `start.ps1`

1. Docker Desktop instalado e rodando
2. LM Studio acessível em `localhost:1234`
3. Modelo `nomic-embed-text` carregado
4. Diretório `.opensquad-services/` existente com `docker-compose.yml`

---

## Considerações Windows

### Requisitos do Sistema

| Componente | Requisito | Notas |
|------------|-----------|-------|
| Windows | 11 Pro/Home | WSL2 habilitado |
| Docker Desktop | 4.x+ | Backend WSL2 |
| LM Studio | Última versão | Modo headless: `lms daemon up` |
| Node.js | 18+ | Para CLI do OpenSquad |
| Python/uv | 3.10+ | Para `uvx` (MCP server) |

### Pontos de Atenção

**Docker Compose V2 (com espaço):**

```bash
# Correto (V2, plugin do Docker CLI)
docker compose up -d

# Incorreto (V1, binário standalone legado)
docker-compose up -d
```

**Resolução `host.docker.internal`:**
- Resolve automaticamente no Docker Desktop para Windows
- Permite que containers acessem serviços no host (LM Studio)
- Não necessita configuração adicional

**Named Volumes vs Bind Mounts:**
- Named volumes (`surrealdb-data`) oferecem melhor performance no Windows
- Bind mounts sofrem com overhead de tradução de filesystem NTFS/ext4
- Dados persistidos em `\\wsl$\docker-desktop-data\...`

**LM Studio em modo headless:**

```powershell
# Iniciar LM Studio como daemon (sem UI)
lms daemon up

# Verificar status
lms status

# Carregar modelo de embedding
lms load nomic-embed-text
```

---

## Economia de Tokens

### Comparação: Antes vs Depois

```
ANTES (carregamento bruto)
══════════════════════════════════════════════════
51+ arquivos .md ──► Carregados no contexto
                     ~55.000 tokens/sessão
                     Limite de contexto atingido
                     Informação irrelevante incluída


DEPOIS (busca vetorial)
══════════════════════════════════════════════════
Query do usuário ──► search_sources() ──► Top 5 chunks
                     ~500 tokens/query
                     Apenas contexto relevante
                     Escala para qualquer tamanho de projeto
```

### Métricas de Economia

| Métrica | Antes | Depois | Redução |
|---------|-------|--------|---------|
| Tokens por sessão (contexto) | ~55.000 | ~500 | **99.1%** |
| Tokens CLI (com RTK) | ~1.000 | ~100-400 | **60-90%** |
| Total estimado por sessão | ~56.000 | ~900 | **~97%** |
| Custo estimado (Claude Opus) | ~$0.84/sessão | ~$0.014/sessão | **98.3%** |

### Breakdown da Economia RTK

| Operação | Sem RTK | Com RTK | Economia |
|----------|---------|---------|----------|
| `docker compose up` | ~2.000 tokens | ~300 tokens | 85% |
| `docker compose down` | ~800 tokens | ~120 tokens | 85% |
| `git status` | ~500 tokens | ~125 tokens | 75% |
| `git diff` | ~3.000 tokens | ~600 tokens | 80% |

---

## Integração RTK

### Notas para Windows

- Hooks RTK devem ser configurados manualmente no Windows (Issue #502)
- O hook `PreToolUse` intercepta comandos Bash e prepende `rtk`
- Comandos Docker recebem 85% de redução de tokens
- Comandos Git recebem 75% de redução de tokens

### Comandos RTK Relevantes para Open Notebook

```bash
# Iniciar serviços
rtk docker compose up -d

# Verificar containers
rtk docker ps

# Ver logs dos containers
rtk docker logs opensquad-open-notebook

# Parar serviços
rtk docker compose down

# Status do projeto
rtk git status
```

---

## Referência de API

### Open Notebook REST API (porta 5055)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/health` | Health check |
| POST | `/api/notebooks` | Criar notebook |
| GET | `/api/notebooks` | Listar notebooks |
| POST | `/api/sources` | Adicionar source a um notebook |
| GET | `/api/sources` | Listar sources |
| POST | `/api/search` | Busca semântica vetorial |

### SurrealDB (porta 8000)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/health` | Health check |
| POST | `/sql` | Executar query SurrealQL |
| GET | `/version` | Versão do servidor |

### LM Studio (porta 1234)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/v1/models` | Listar modelos carregados |
| POST | `/v1/embeddings` | Gerar embeddings |
| POST | `/v1/chat/completions` | Chat completion (se necessário) |

---

## Checklist de Implantação

- [ ] Docker Desktop instalado e rodando com WSL2
- [ ] LM Studio instalado com `nomic-embed-text` carregado
- [ ] `uv` / `uvx` instalado para o servidor MCP
- [ ] Executar `npx opensquad init` e selecionar "Open Notebook"
- [ ] Executar `npx opensquad services start`
- [ ] Aguardar health check passar em todos os serviços
- [ ] Executar `npx opensquad services index`
- [ ] Verificar indexação via UI em `http://localhost:8502`
- [ ] Testar busca semântica via MCP tool `search_sources`

---

## Problemas Conhecidos

| Issue | Descrição | Workaround |
|-------|-----------|------------|
| RTK hooks Windows | Configuração manual necessária | Seguir docs do RTK Issue #502 |
| Primeira indexação lenta | Embedding de muitos arquivos demora | Aguardar processamento assíncrono |
| LM Studio memória | `nomic-embed-text` usa ~1GB RAM | Fechar outros modelos antes |
| Docker volumes Windows | Performance I/O inferior | Usar named volumes (já configurado) |
| WSL2 memória | Docker pode consumir muita RAM | Configurar `.wslconfig` com limites |

---

*Documento gerado em 2026-03-13. OpenSquad Team.*
