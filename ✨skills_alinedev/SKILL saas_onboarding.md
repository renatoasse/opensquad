---
name: "@saas_onboarding"
description: "Gerencia a criação de novos inquilinos (clientes do SaaS) e a injeção da identidade visual deles no app."
when_to_use: "No setup inicial do projeto ou na criação da página de configurações/admin."
---

# Skill: SaaS Onboarding & Tenant Config

## Descrição

Gerencia a criação de novos inquilinos (clientes do SaaS) e a injeção da identidade visual deles no app.

## Quando Usar

No setup inicial do projeto ou na criação da página de configurações/admin.

## Instruções Técnicas

1. **Tabela Mestre:** Garanta que existe uma tabela `public.tenants` com:
   - `id` (uuid, PK)
   - `name` (text)
   - `slug` (text, unique — para subdomínios)
   - `primary_color` (text, ex: `'#ff0000'`)
   - `logo_url` (text)

2. **Provider de Tema:** Crie um componente `ThemeProvider` em React que:
   - Busca as configurações do tenant atual no banco de dados.
   - Injeta a `primary_color` nas variáveis CSS `:root` do navegador em tempo real.

3. **Contexto:** Todo o app deve rodar dentro de um `TenantContext` para que o `tenant_id` esteja disponível para todas as queries do `@domain_modeler`.

---

## SQL: Tabela Mestre de Tenants

```sql
create table public.tenants (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  slug          text unique not null,       -- Ex: "clinica-saude" → clinica-saude.seuapp.com
  primary_color text not null default '#6366F1',
  logo_url      text,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- RLS: apenas o próprio tenant gerencia seus dados
alter table public.tenants enable row level security;

create policy "Tenants: leitura pública por slug"
  on public.tenants for select
  using (true);  -- LP pública pode ler o tema sem autenticação

create policy "Tenants: edição apenas pelo admin"
  on public.tenants for update
  using (id = auth.uid());
```

## TenantContext — Disponibiliza tenant_id para todo o app

```tsx
// src/contexts/TenantContext.tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Tenant {
  id: string;
  name: string;
  slug: string;
  primaryColor: string;
  logoUrl?: string;
}

interface TenantContextValue {
  tenant: Tenant | null;
  isLoading: boolean;
}

const TenantContext = createContext<TenantContextValue>({
  tenant: null,
  isLoading: true,
});

export function TenantProvider({
  children,
  slug,
}: {
  children: React.ReactNode;
  slug: string;
}) {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function loadTenant() {
      const { data } = await supabase
        .from('tenants')
        .select('id, name, slug, primary_color, logo_url')
        .eq('slug', slug)
        .single();

      if (data) {
        setTenant({
          id: data.id,
          name: data.name,
          slug: data.slug,
          primaryColor: data.primary_color,
          logoUrl: data.logo_url ?? undefined,
        });
      }
      setIsLoading(false);
    }

    loadTenant();
  }, [slug, supabase]);

  return (
    <TenantContext.Provider value={{ tenant, isLoading }}>
      {children}
    </TenantContext.Provider>
  );
}

export const useTenant = () => useContext(TenantContext);
```

## ThemeProvider — Injeta primary_color no :root em tempo real

```tsx
// src/components/providers/ThemeProvider.tsx
'use client';

import { useEffect } from 'react';
import { useTenant } from '@/contexts/TenantContext';

/**
 * Injeta as variáveis CSS do tenant no :root do navegador.
 * Deve ser filho direto do TenantProvider.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { tenant } = useTenant();

  useEffect(() => {
    if (!tenant) return;

    const root = document.documentElement;

    // Injeta a cor primária do tenant como variável CSS
    root.style.setProperty('--primary', hexToHsl(tenant.primaryColor));

    // Atualiza o favicon e o título dinamicamente
    const favicon = document.querySelector<HTMLLinkElement>("link[rel='icon']");
    if (favicon && tenant.logoUrl) favicon.href = tenant.logoUrl;

    document.title = tenant.name;
  }, [tenant]);

  return <>{children}</>;
}

/**
 * Converte hex para HSL (formato exigido pelo Shadcn/UI para variáveis CSS).
 * Ex: '#6366F1' → '239 84% 67%'
 */
function hexToHsl(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}
```

## Integração no Layout Raiz

```tsx
// src/app/layout.tsx
import { TenantProvider } from '@/contexts/TenantContext';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { getTenantSlugFromHost } from '@/lib/tenant-resolver';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const slug = await getTenantSlugFromHost();

  return (
    <html lang="pt-BR">
      <body>
        {/* TenantProvider disponibiliza tenant_id para todo o app */}
        <TenantProvider slug={slug}>
          {/* ThemeProvider injeta primary_color no :root */}
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </TenantProvider>
      </body>
    </html>
  );
}
```

## Fluxo de Onboarding (Wizard de 3 Passos)

```
Passo 1: Nome da Empresa + Slug
  → Valida unicidade do slug no banco
  → Salva em public.tenants

Passo 2: Upload de Logo
  → Faz upload para Supabase Storage
  → Atualiza logo_url em public.tenants

Passo 3: Escolha de Cor Primária
  → Color picker com paletas pré-definidas
  → Aplica preview em tempo real via ThemeProvider
  → Salva primary_color em public.tenants
  → Redireciona para /dashboard
```

## Checklist de Onboarding

- [ ] Tabela `public.tenants` criada com todos os campos obrigatórios?
- [ ] RLS habilitado na tabela `tenants`?
- [ ] `TenantProvider` envolve todo o app no `layout.tsx`?
- [ ] `ThemeProvider` injeta `primary_color` no `:root` como variável HSL?
- [ ] `useTenant()` retorna `tenant.id` para uso em todas as queries?
- [ ] Slug validado como único antes de salvar?
- [ ] Preview de tema funciona em tempo real no passo 3?
- [ ] Após onboarding, usuário é redirecionado para `/dashboard`?
