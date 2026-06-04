---
trigger: always_on
---

Autenticação & Sessão

Autenticação entre frontend e backend SEMPRE via iron-session (cookie httpOnly, secure, sameSite=lax)
SESSION_SECRET com 32+ caracteres, armazenado exclusivamente em variável de ambiente
Frontend NUNCA se comunica diretamente com o backend — todo request passa pelo proxy autenticado (Next.js API Routes)
O proxy decripta o cookie, extrai o user_id e repassa via header X-User-Id para o backend
Backend valida o header X-User-Id em TODAS as rotas protegidas via dependency injection
Tokens, session IDs e refresh tokens NUNCA são expostos no frontend (nem em localStorage, nem em sessionStorage, nem em cookies acessíveis por JS)

Row Level Security (RLS)

TODAS as tabelas do Supabase DEVEM ter RLS habilitado, sem exceção
Toda tabela com dados de usuário DEVE ter coluna user_id com policy de isolamento
Policies obrigatórias por tabela: SELECT, INSERT, UPDATE, DELETE filtrados por auth.uid() = user_id
Tabelas públicas (ex: plans) DEVEM ter policy explícita de somente leitura
Operações de escrita em tabelas públicas SOMENTE via service_role no backend
Testar isolamento: User A NUNCA deve acessar dados do User B

APIs & Endpoints

TODAS as rotas de API DEVEM ser autenticadas (exceto health check e rotas públicas explícitas)
Input validation obrigatória em TODAS as rotas via Pydantic models
Rate limiting por user_id em rotas sensíveis (auth, geração de conteúdo, billing)
CORS restritivo: aceitar requests APENAS dos domínios do frontend
Stripe webhooks DEVEM validar assinatura antes de processar
File upload: validar tipo MIME, extensão e tamanho máximo antes de aceitar

Proteção de Dados no Frontend

NUNCA expor IDs internos (user_id, session_id, empresa_id, subscription_id) no console do browser
NUNCA logar dados sensíveis em console.log (tokens, emails, senhas, IDs internos)
NUNCA incluir IDs internos em URLs visíveis do frontend — usar slugs ou UUIDs curtos quando necessário
Variáveis de ambiente sensíveis NUNCA devem ter prefixo NEXT_PUBLIC_
Error messages retornadas ao frontend NUNCA devem expor stack traces, queries SQL ou estrutura interna

Código Assíncrono

TODAS as routes e services do FastAPI DEVEM ser async
TODAS as chamadas a APIs externas (Supabase, Stripe, LLMs, Fal.ai) DEVEM ser await — nunca bloqueantes
Streaming de respostas de IA via SSE (Server-Sent Events) — nunca aguardar resposta completa para enviar
Conexões com banco e APIs externas DEVEM ter timeout configurado

Agentes de IA (LangGraph)

Agentes DEVEM ser implementados com LangGraph (state machine com nós e transições)
Cada nó do grafo DEVE ter responsabilidade única e saída tipada
Respostas do agente DEVEM usar Structured Output (Pydantic models) — nunca texto livre para dados estruturados
Tools do agente DEVEM ter error handling individual — falha de uma tool não deve derrubar o grafo
Prompts do agente DEVEM ficar em arquivos separados, nunca hardcoded dentro da lógica

Qualidade de Código
Funções & Métodos

Funções DEVEM fazer UMA coisa só — se precisa de "e" pra descrever, quebre em duas
Máximo 20 linhas por função. Acima disso, extrair subfunções
Máximo 3 argumentos por função — acima disso, agrupar em objeto/dataclass/Pydantic model
Funções NÃO devem ter side effects ocultos (alterar estado global, modificar argumento mutável sem avisar)
Nomes de funções DEVEM ser verbos descritivos: create_subscription(), validate_input() — nunca process(), handle(), do()

Nomes & Legibilidade

Nomes DEVEM revelar intenção: elapsed_time_in_days em vez de d, is_active_subscription em vez de flag
Classes/models com nomes substantivos: Subscription, UserProfile — evitar Manager, Helper, Data, Info
Sem abreviações ambíguas: usr, mgr, tmp — escreva por extenso
Nomes consistentes: se usou get_user em um módulo, não use fetch_user em outro sem motivo

Error Handling

Usar exceptions em vez de return codes — manter lógica limpa
NUNCA retornar None/null para indicar erro — levantar exception com mensagem clara
NUNCA passar None/null como argumento padrão mutável
Try/except DEVE ser específico: capturar ValueError, HTTPException — NUNCA except Exception genérico (exceto em catch-all de último nível)
Erros de domínio DEVEM usar exceptions customizadas: SubscriptionExpiredError, QuotaExceededError

Estrutura & Organização

Lei de Demeter: NUNCA encadear acessos a.get_b().get_c().do_something() — criar método direto
Um arquivo, uma responsabilidade: não misturar routes + service + schemas no mesmo arquivo
Imports organizados: stdlib → third-party → local (Python) / react → libs → components → utils (TypeScript)
Código morto (funções não usadas, imports não usados, variáveis comentadas) DEVE ser removido, não comentado

Documentação no README

Toda feature nova finalizada DEVE ser documentada no README.md com: nome da feature, descrição curta e fluxo (passo a passo de como funciona)
Todo fix relevante DEVE ser documentado no README.md com: o que foi corrigido e o comportamento esperado após a correção
Documentar APENAS funcionalidades — não documentar refatorações internas, mudanças de config ou ajustes de estilo
O README DEVE ter uma seção ## Features com a lista atualizada de funcionalidades e seus fluxos

Padrões de Código

Python: type hints obrigatórios em todas as funções e variáveis. Sem Any genérico.
TypeScript: strict mode habilitado. Sem any, sem @ts-ignore, sem as unknown as.
Sempre usar bibliotecas e componentes padrão do ecossistema (shadcn/ui, Pydantic, Supabase client) — código customizado somente se o usuário solicitar explicitamente
Organização por domínio: cada módulo com seus routes, service, schemas — nunca misturar domínios
Secrets e chaves de API exclusivamente em .env — NUNCA hardcoded, NUNCA commitados no git
.env.example DEVE existir com todas as variáveis necessárias, sem valores reais