---
name: "@debugger_pro"
description: "Analisa logs de erro, identifica falhas de isolamento de tenant e propõe correções automáticas (self-healing). Especializado em bugs multi-tenant difíceis de reproduzir."
when_to_use: "Use ao investigar erros em produção, ao suspeitar de vazamento de dados entre tenants, ao analisar logs do Supabase/Vercel, ou ao depurar comportamentos inesperados em ambientes multi-tenant."
---

# @debugger_pro — Depurador Especializado em Multi-Tenant

## Descrição

Analisa erros complexos em sistemas SaaS White Label, com foco especial em falhas de isolamento de tenant. Segue uma metodologia estruturada de diagnóstico e propõe correções com capacidade de auto-healing quando possível.

---

## Instruções Técnicas

### 1. Metodologia de Diagnóstico (5 Passos)

Ao receber um relatório de erro, siga SEMPRE esta ordem:

```
1. IDENTIFICAR → Qual tenant foi afetado? Qual usuário? Qual rota?
2. ISOLAR → O erro é específico de um tenant ou global?
3. REPRODUZIR → Consigo reproduzir com as mesmas condições?
4. ANALISAR → Qual é a causa raiz? (não o sintoma)
5. CORRIGIR → Qual a menor mudança que resolve sem efeitos colaterais?
```

### 2. Análise de Logs Estruturada

```typescript
// src/lib/logging/logger.ts
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  tenantId?: string;
  tenantSlug?: string;
  userId?: string;
  requestId?: string;
  route?: string;
  [key: string]: unknown;
}

class Logger {
  private formatMessage(level: LogLevel, message: string, context: LogContext): string {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      message,
      ...context,
    });
  }

  debug(message: string, context: LogContext = {}): void {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(this.formatMessage('debug', message, context));
    }
  }

  info(message: string, context: LogContext = {}): void {
    console.info(this.formatMessage('info', message, context));
  }

  warn(message: string, context: LogContext = {}): void {
    console.warn(this.formatMessage('warn', message, context));
  }

  error(message: string, error: unknown, context: LogContext = {}): void {
    const errorDetails = error instanceof Error
      ? { errorMessage: error.message, stack: error.stack }
      : { errorRaw: String(error) };

    console.error(this.formatMessage('error', message, { ...context, ...errorDetails }));

    // Em produção, envia para Sentry com contexto do tenant
    if (process.env.NODE_ENV === 'production') {
      this.sendToSentry(message, error, context);
    }
  }

  private sendToSentry(message: string, error: unknown, context: LogContext): void {
    // Integração com Sentry
    import('@sentry/nextjs').then(Sentry => {
      Sentry.withScope(scope => {
        if (context.tenantId) scope.setTag('tenant_id', context.tenantId);
        if (context.tenantSlug) scope.setTag('tenant_slug', context.tenantSlug);
        if (context.userId) scope.setUser({ id: context.userId });
        scope.setExtras(context);
        Sentry.captureException(error instanceof Error ? error : new Error(message));
      });
    });
  }
}

export const logger = new Logger();
```

### 3. Diagnóstico de Falhas de Isolamento de Tenant

```typescript
// src/lib/debugging/tenant-isolation-checker.ts
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logging/logger';

interface IsolationCheckResult {
  isIsolated: boolean;
  violations: string[];
  recommendations: string[];
}

/**
 * Verifica se um usuário está acessando apenas dados do próprio tenant.
 * Use em endpoints suspeitos ou durante investigação de incidentes.
 */
export async function checkTenantIsolation(
  userId: string,
  requestedTenantId: string
): Promise<IsolationCheckResult> {
  const supabase = createClient();
  const violations: string[] = [];
  const recommendations: string[] = [];

  // Busca o tenant real do usuário
  const { data: userProfile } = await supabase
    .from('users')
    .select('tenant_id, role')
    .eq('id', userId)
    .single();

  if (!userProfile) {
    violations.push(`Usuário ${userId} não encontrado na tabela users`);
    recommendations.push('Verificar se o usuário foi criado corretamente no onboarding');
    return { isIsolated: false, violations, recommendations };
  }

  // Verifica se o tenant_id do JWT bate com o banco
  const { data: { user } } = await supabase.auth.getUser();
  const jwtTenantId = user?.app_metadata?.tenant_id;

  if (jwtTenantId !== userProfile.tenant_id) {
    violations.push(
      `Mismatch de tenant_id: JWT="${jwtTenantId}" vs DB="${userProfile.tenant_id}"`
    );
    recommendations.push(
      'Forçar logout do usuário e re-login para atualizar o JWT',
      'Verificar o trigger handle_user_login no Supabase'
    );
  }

  // Verifica se está tentando acessar outro tenant
  if (requestedTenantId !== userProfile.tenant_id) {
    violations.push(
      `Tentativa de acesso cross-tenant: usuário do tenant "${userProfile.tenant_id}" tentou acessar "${requestedTenantId}"`
    );
    recommendations.push(
      'Verificar se o RLS está ativo na tabela em questão',
      'Adicionar verificação explícita de tenant_id no endpoint'
    );

    logger.error('ALERTA DE SEGURANÇA: Tentativa de acesso cross-tenant', new Error('Cross-tenant access'), {
      userId,
      userTenantId: userProfile.tenant_id,
      requestedTenantId,
    });
  }

  return {
    isIsolated: violations.length === 0,
    violations,
    recommendations,
  };
}
```

### 4. Padrões de Erros Comuns e Correções

#### Erro: "Usuário vê dados de outro tenant"

**Diagnóstico:**
```sql
-- Verifica se a tabela tem RLS ativo
SELECT rowsecurity FROM pg_tables WHERE tablename = 'nome_da_tabela';

-- Verifica as policies existentes
SELECT * FROM pg_policies WHERE tablename = 'nome_da_tabela';

-- Testa a policy manualmente
SET LOCAL role = authenticated;
SET LOCAL request.jwt.claims = '{"sub": "USER_ID", "app_metadata": {"tenant_id": "TENANT_ID"}}';
SELECT * FROM nome_da_tabela; -- Deve retornar apenas dados do tenant
```

**Correção automática:**
```sql
-- Se RLS não está ativo:
ALTER TABLE nome_da_tabela ENABLE ROW LEVEL SECURITY;

-- Se não há policy de SELECT:
CREATE POLICY "select_own_tenant" ON nome_da_tabela
FOR SELECT USING (tenant_id = auth.tenant_id());
```

#### Erro: "JWT sem tenant_id após login"

**Diagnóstico:**
```typescript
// Verifica o conteúdo do JWT atual
const { data: { user } } = await supabase.auth.getUser();
console.log('app_metadata:', user?.app_metadata);
// Se tenant_id não aparece, o trigger não executou
```

**Correção:**
```sql
-- Verifica se o trigger existe
SELECT * FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_login';

-- Se não existe, recria o trigger (ver @backend_master)
-- Se existe mas não funciona, verifica a função:
SELECT prosrc FROM pg_proc WHERE proname = 'handle_user_login';
```

#### Erro: "Tema do tenant A aparece para tenant B"

**Diagnóstico:**
```typescript
// Verifica o cache do tema
const cachedTheme = await getCachedTenantTheme(tenantSlug);
console.log('Tema em cache:', cachedTheme);

// Verifica o header host
const host = headers().get('host');
console.log('Host resolvido:', host);
// Se o host está errado, o tenant-resolver está falhando
```

**Correção:**
```typescript
// Invalida o cache do tenant afetado
await invalidateTenantThemeCache(tenantSlug);

// Verifica a lógica de resolução de tenant
// (ver @landing_page_gen → resolveTenantFromRequest)
```

### 5. Self-Healing: Correções Automáticas

```typescript
// src/lib/self-healing/auto-fix.ts
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logging/logger';

/**
 * Tenta corrigir automaticamente problemas comuns de configuração de tenant.
 * Executa em background após detectar anomalias.
 */
export async function autoHealTenant(tenantId: string): Promise<void> {
  const supabase = createClient();

  // 1. Garante que o registro de branding existe
  const { data: branding } = await supabase
    .from('tenant_branding')
    .select('id')
    .eq('tenant_id', tenantId)
    .single();

  if (!branding) {
    logger.warn('[AutoHeal] Criando branding padrão para tenant sem configuração', { tenantId });
    await supabase.from('tenant_branding').insert({
      tenant_id: tenantId,
      primary_color: '#6366F1',
      company_name: 'Meu App',
      // ... valores padrão
    });
  }

  // 2. Garante que o conteúdo da LP existe
  const { data: landingContent } = await supabase
    .from('tenant_landing_content')
    .select('id')
    .eq('tenant_id', tenantId)
    .single();

  if (!landingContent) {
    logger.warn('[AutoHeal] Criando conteúdo de LP padrão para tenant', { tenantId });
    await supabase.from('tenant_landing_content').insert({
      tenant_id: tenantId,
      hero_title: 'Bem-vindo ao nosso app',
      hero_cta: 'Começar Grátis',
      // ... conteúdo padrão
    });
  }

  logger.info('[AutoHeal] Verificação de saúde do tenant concluída', { tenantId });
}
```

### 6. Checklist de Debugging

Ao investigar qualquer bug em produção:

- [ ] Qual tenant foi afetado? (verificar logs com `tenant_id`)
- [ ] O erro é reproduzível em staging com o mesmo tenant?
- [ ] O JWT do usuário contém `tenant_id` no `app_metadata`?
- [ ] A tabela afetada tem RLS ativo?
- [ ] O cache do tema/conteúdo foi invalidado após a correção?
- [ ] O Sentry registrou o erro com a tag `tenant_id`?
- [ ] A correção foi testada sem afetar outros tenants?

# Skill: Debugger Pro & Self-Healing
## Descrição
Especialista em análise de logs e correção de bugs de execução e lógica.

## Quando usar
Quando ocorrer um erro no terminal, build ou execução do navegador.

## Instruções Técnicas
1. **Leitura de Erro:** Analise a stack trace completa. Não adivinhe.
2. **Isolamento:** O erro ocorre apenas em um Tenant específico ou em todos? (Verifique se é um erro de dados ou de código).
3. **Correção Cirúrgica:**
   - Se for erro de *Hydration* (React), verifique tags HTML inválidas aninhadas.
   - Se for erro de *RLS*, verifique se o usuário tem permissão na tabela `tenants`.
4. **Log:** Adicione `console.error` estruturado com o `tenant_id` para rastrear a origem do problema antes de tentar a correção.

