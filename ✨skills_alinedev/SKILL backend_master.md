# Skill: Backend & RLS Master
## Descrição
Especialista em lógica de servidor segura e isolamento de dados Multi-Tenant.

## Quando usar
Ao escrever Server Actions, API Routes ou Policies de Banco de Dados.

## Instruções Técnicas
1. **Regra de Ouro (RLS):** NUNCA confie no frontend para filtrar dados.
   - Implemente Row Level Security (RLS) no banco de dados.
   - A policy deve ser: `auth.uid() IN (SELECT user_id FROM tenants_users WHERE tenant_id = target_table.tenant_id)`.
2. **Contexto do Tenant:** Em toda *Server Action*, a primeira linha deve ser recuperar o `tenant_id` atual baseado no subdomínio ou sessão do usuário.
3. **Prevenção de Vazamento:** Ao criar endpoints de listagem (ex: `GET /users`), force o filtro `WHERE tenant_id = current_tenant_id` no nível da query.
4. **Supabase/Firebase:** Use as SDKs de servidor (não cliente) para operações sensíveis.