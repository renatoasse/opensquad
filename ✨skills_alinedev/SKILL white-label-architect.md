# Skill: White Label Architect
## Descrição
Especialista em arquitetura Multi-Tenant para SaaS. Garante que dados, arquivos e configurações de marca sejam isolados por cliente (tenant) e acessíveis via painel administrativo.

## Quando usar
Ao criar a estrutura do banco de dados, configurar regras de segurança (RLS) ou construir o painel de configurações do cliente (`/admin`).

## Instruções Técnicas

### 1. Modelagem de Dados Multi-Tenant
- **Tabela `tenants`:** Crie SEMPRE uma tabela 'tenants' com:
  - `id` (UUID, Primary Key)
  - `name` (String)
  - `slug` (String, Unique - para subdomínio ex: cliente.seuapp.com)
  - `custom_domain` (String, Unique - para domínio próprio)
  - `brand_config` (JSONB) -> Armazena cores e logo.
  - `subscription_status` (String)

- **Relacionamento Obrigatório:** TODAS as outras tabelas do sistema (ex: `users`, `products`, `orders`) DEVEM ter uma coluna `tenant_id` referenciando `public.tenants(id)`.

### 2. Segurança de Dados (Row Level Security - RLS)
- **Regra de Ouro:** NUNCA permita queries sem filtro de tenant.
- **Supabase/Postgres:** Habilite RLS em todas as tabelas.
  - *Policy:* `auth.uid()` deve pertencer ao `tenant_id` da linha acessada.
  - Crie uma função auxiliar SQL `get_current_tenant_id()` baseada no usuário logado para simplificar as policies.

### 3. Gestão de Marca (The Branding Engine)
- **Armazenamento:** Salve as preferências visuais no campo `brand_config` da tabela `tenants`.
  - Exemplo JSON: `{ "primaryColor": "#FF0000", "logoUrl": "https://...", "font": "Inter" }`
- **Painel Admin:** Gere automaticamente uma rota `/admin/settings` onde o dono do tenant possa:
  1. Fazer upload da Logo (Salvar no Storage em bucket isolado `/tenants/{id}/logo.png`).
  2. Escolher a Cor Principal (usando um Color Picker).
  3. Configurar domínio personalizado (CNAME).

### 4. Integração com Frontend
- Instrua o `@frontend_specialist` a ler `brand_config` no load da aplicação e injetar nas variáveis CSS do `@design_system`.