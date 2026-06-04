# Skill: Security Auditor
## Descrição
Especialista em blindagem de aplicações SaaS. Foca em prevenir Injeção, XSS e Acesso Indevido (IDOR).

## Quando usar
Antes de qualquer deploy ou ao modificar sistemas de autenticação.

## Instruções Técnicas
1. **Auditoria de IDOR:** Verifique se um usuário logado no Tenant A consegue acessar recursos do Tenant B trocando o ID na URL (ex: `/admin/orders/123`).
   - Se conseguir, BLOQUEIE e corrija a RLS.
2. **Sanitização:** Valide todos os inputs de formulários usando `Zod` no backend.
3. **Proteção de Admin:** Garanta que as rotas `/admin` verifiquem não apenas se o usuário está logado, mas se ele tem a *role* `admin` dentro daquele `tenant_id` específico.
4. **Headers:** Configure headers de segurança (CORS, CSP) no `next.config.js`.]


# @security_guard — Guardião de Segurança Multi-Tenant

## Descrição

Realiza auditorias de segurança focadas em SaaS White Label multi-tenant. Verifica se o isolamento de dados entre tenants é hermético, se os endpoints estão protegidos, e se as vulnerabilidades mais comuns (SQL Injection, XSS, IDOR, broken access control) estão mitigadas.

---

## Instruções Técnicas

### 1. Auditoria de RLS (Row Level Security)

Execute este script para verificar se todas as tabelas têm RLS ativo:

```sql
-- Verifica tabelas SEM RLS habilitado (resultado deve ser vazio)
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND rowsecurity = false;

-- Verifica tabelas COM RLS mas SEM policies definidas (perigoso!)
SELECT t.tablename
FROM pg_tables t
LEFT JOIN pg_policies p ON t.tablename = p.tablename
WHERE t.schemaname = 'public'
  AND t.rowsecurity = true
  AND p.policyname IS NULL;

-- Lista todas as policies ativas
SELECT tablename, policyname, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, cmd;
```

### 2. Teste de Isolamento de Tenant (Simulação de Ataque IDOR)

```typescript
// src/tests/security/tenant-isolation.test.ts
import { createClient } from '@supabase/supabase-js';
import { describe, it, expect, beforeAll } from 'vitest';

/**
 * Teste crítico: verifica que um usuário do Tenant A
 * NÃO consegue acessar dados do Tenant B.
 */
describe('Isolamento de Tenant — Segurança', () => {
  let tenantAClient: ReturnType<typeof createClient>;
  let tenantBClient: ReturnType<typeof createClient>;
  let tenantBId: string;

  beforeAll(async () => {
    // Autentica como usuário do Tenant A
    tenantAClient = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!
    );
    await tenantAClient.auth.signInWithPassword({
      email: process.env.TEST_TENANT_A_EMAIL!,
      password: process.env.TEST_TENANT_A_PASSWORD!,
    });

    // Autentica como usuário do Tenant B
    tenantBClient = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!
    );
    const { data } = await tenantBClient.auth.signInWithPassword({
      email: process.env.TEST_TENANT_B_EMAIL!,
      password: process.env.TEST_TENANT_B_PASSWORD!,
    });
    tenantBId = data.user?.app_metadata?.tenant_id;
  });

  it('Tenant A NÃO deve ver dados do Tenant B', async () => {
    // Tenta buscar dados do Tenant B usando o cliente do Tenant A
    const { data, error } = await tenantAClient
      .from('users')
      .select('*')
      .eq('tenant_id', tenantBId); // Tentativa explícita de acesso cruzado

    // RLS deve bloquear: retorna array vazio, não erro
    expect(data).toHaveLength(0);
    expect(error).toBeNull(); // RLS retorna vazio, não 403
  });

  it('Tenant A NÃO deve modificar branding do Tenant B', async () => {
    const { error } = await tenantAClient
      .from('tenant_branding')
      .update({ primary_color: '#FF0000' })
      .eq('tenant_id', tenantBId);

    // Deve falhar silenciosamente (0 rows afetadas) ou com erro de RLS
    expect(error).toBeTruthy();
  });

  it('Admin do Tenant A NÃO deve acessar painel do Tenant B via API', async () => {
    const response = await fetch(`/api/admin/tenants/${tenantBId}/settings`, {
      headers: {
        Authorization: `Bearer ${(await tenantAClient.auth.getSession()).data.session?.access_token}`,
      },
    });

    expect(response.status).toBe(403);
  });
});
```

### 3. Auditoria de Endpoints de API

Para cada endpoint, verifique:

```typescript
// src/lib/security/audit-endpoint.ts

/**
 * Checklist de segurança para cada API Route.
 * Execute mentalmente (ou via code review) para cada endpoint.
 */
export const ENDPOINT_SECURITY_CHECKLIST = {
  authentication: [
    '✅ Verifica se o usuário está autenticado (getUser() do Supabase)?',
    '✅ Retorna 401 se não autenticado?',
    '✅ Usa getUser() server-side, não getSession() (getSession pode ser forjada)?',
  ],
  authorization: [
    '✅ Verifica se o usuário tem permissão para o recurso específico?',
    '✅ Admin só acessa configurações do próprio tenant?',
    '✅ Retorna 403 (não 404) para recursos de outro tenant?',
  ],
  inputValidation: [
    '✅ Valida e sanitiza todos os inputs com Zod ou similar?',
    '✅ Limita tamanho de strings (evita DoS)?',
    '✅ Valida tipos de arquivo em uploads?',
  ],
  sqlInjection: [
    '✅ Usa apenas queries parametrizadas (Supabase SDK)?',
    '✅ Nunca concatena strings em queries SQL?',
    '✅ Nenhum uso de .rpc() com input não sanitizado?',
  ],
  xss: [
    '✅ Nunca usa dangerouslySetInnerHTML com dados do usuário?',
    '✅ Conteúdo dinâmico é escapado antes de renderizar?',
    '✅ Headers Content-Security-Policy configurados?',
  ],
  rateLimit: [
    '✅ Endpoints de autenticação têm rate limiting?',
    '✅ Endpoints de upload têm limite de tamanho?',
  ],
};

/**
 * Middleware de segurança para API Routes.
 * Aplica verificações padrão de autenticação e logging.
 */
export async function withSecurityMiddleware(
  request: Request,
  handler: (user: any, tenantId: string) => Promise<Response>
): Promise<Response> {
  const { createClient } = await import('@/lib/supabase/server');
  const supabase = createClient();

  // SEMPRE usa getUser() — nunca getSession() em server-side
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return Response.json({ error: 'Não autenticado.' }, { status: 401 });
  }

  const tenantId = user.app_metadata?.tenant_id;
  if (!tenantId) {
    console.error(`[Security] Usuário ${user.id} sem tenant_id no app_metadata`);
    return Response.json({ error: 'Configuração de tenant inválida.' }, { status: 403 });
  }

  // Log de auditoria
  console.info(`[Audit] user=${user.id} tenant=${tenantId} path=${new URL(request.url).pathname}`);

  return handler(user, tenantId);
}
```

### 4. Verificação de XSS

```typescript
// src/lib/security/sanitize.ts
import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitiza HTML antes de renderizar conteúdo dinâmico do banco de dados.
 * Use quando precisar renderizar HTML rico (ex: descrições de produtos).
 */
export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
    FORCE_BODY: true,
  });
}

/**
 * Sanitiza texto puro (remove qualquer HTML).
 * Use para campos como nome, título, etc.
 */
export function sanitizeText(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove < e >
    .trim()
    .slice(0, 1000); // Limita tamanho
}
```

### 5. Headers de Segurança (Next.js)

```typescript
// next.config.ts
const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // Ajuste conforme necessário
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https:",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
    ].join('; '),
  },
];

export default {
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }];
  },
};
```

### 6. Checklist Final de Auditoria

Execute antes de cada deploy:

- [ ] Todas as tabelas têm RLS ativo?
- [ ] Nenhuma policy usa `USING (true)` sem restrição?
- [ ] Todos os endpoints verificam autenticação com `getUser()`?
- [ ] Admin só acessa dados do próprio tenant?
- [ ] Inputs são validados com Zod antes de qualquer operação?
- [ ] `dangerouslySetInnerHTML` não é usado com dados do usuário?
- [ ] Headers de segurança configurados no `next.config.ts`?
- [ ] Testes de isolamento de tenant passam?
- [ ] Logs de auditoria registram `tenant_id` em operações sensíveis?
- [ ] Chave `service_role` do Supabase está apenas no servidor?
