---
name: "@branding_engine"
description: "Gera tokens de design, variáveis CSS e um arquivo theme.ts configurável via banco de dados. Proibido usar cores hexadecimais hardcoded em qualquer componente."
when_to_use: "Use ao iniciar o sistema de design de um SaaS White Label, ao criar o arquivo de tema global, ou ao implementar a lógica de troca de tema em tempo real por tenant."
---

# @branding_engine — Motor de Branding Dinâmico

## Descrição

Responsável por toda a camada de identidade visual do SaaS White Label. Garante que **100% das cores, fontes e espaçamentos** venham de variáveis CSS injetadas dinamicamente a partir do banco de dados do tenant.

**Regra de Ouro:** Nenhum componente do sistema pode conter uma cor hexadecimal, RGB ou HSL hardcoded. Toda cor DEVE referenciar uma variável CSS (`var(--nome-da-variavel)`).

---

## Instruções Técnicas

### 1. Arquivo `theme.ts` — Fonte da Verdade

Crie o arquivo `src/lib/theme.ts`:

```typescript
// src/lib/theme.ts
// NUNCA importe cores diretamente aqui. Este arquivo é um contrato de tipos.

export interface TenantTheme {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textPrimary: string;
  textSecondary: string;
  borderColor: string;
  errorColor: string;
  successColor: string;
  warningColor: string;
  fontFamily: string;
  fontFamilyHeading: string;
  borderRadius: string;
  logoUrl: string;
  faviconUrl: string;
  companyName: string;
}

// Tema padrão (fallback quando o tenant não tem tema configurado)
export const DEFAULT_THEME: TenantTheme = {
  primaryColor: '#6366F1',      // Indigo
  secondaryColor: '#8B5CF6',    // Violet
  accentColor: '#06B6D4',       // Cyan
  backgroundColor: '#0F0F1A',   // Dark
  surfaceColor: '#1A1A2E',      // Dark Surface
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  borderColor: '#334155',
  errorColor: '#EF4444',
  successColor: '#22C55E',
  warningColor: '#F59E0B',
  fontFamily: "'Inter', sans-serif",
  fontFamilyHeading: "'Inter', sans-serif",
  borderRadius: '0.75rem',
  logoUrl: '/logo-default.svg',
  faviconUrl: '/favicon.ico',
  companyName: 'Meu SaaS',
};

/**
 * Converte um TenantTheme em variáveis CSS e as injeta no :root do documento.
 * Deve ser chamado no layout raiz após buscar o tema do banco de dados.
 */
export function applyTheme(theme: Partial<TenantTheme>): void {
  const merged = { ...DEFAULT_THEME, ...theme };
  const root = document.documentElement;

  root.style.setProperty('--color-primary', merged.primaryColor);
  root.style.setProperty('--color-secondary', merged.secondaryColor);
  root.style.setProperty('--color-accent', merged.accentColor);
  root.style.setProperty('--color-background', merged.backgroundColor);
  root.style.setProperty('--color-surface', merged.surfaceColor);
  root.style.setProperty('--color-text-primary', merged.textPrimary);
  root.style.setProperty('--color-text-secondary', merged.textSecondary);
  root.style.setProperty('--color-border', merged.borderColor);
  root.style.setProperty('--color-error', merged.errorColor);
  root.style.setProperty('--color-success', merged.successColor);
  root.style.setProperty('--color-warning', merged.warningColor);
  root.style.setProperty('--font-family', merged.fontFamily);
  root.style.setProperty('--font-family-heading', merged.fontFamilyHeading);
  root.style.setProperty('--border-radius', merged.borderRadius);

  // Atualiza favicon dinamicamente
  const favicon = document.querySelector<HTMLLinkElement>("link[rel='icon']");
  if (favicon) favicon.href = merged.faviconUrl;
}

/**
 * Gera o bloco de CSS para injeção server-side (SSR/SSG).
 * Use no <style> tag do layout para evitar FOUC (Flash of Unstyled Content).
 */
export function generateThemeCSS(theme: Partial<TenantTheme>): string {
  const merged = { ...DEFAULT_THEME, ...theme };
  return `
    :root {
      --color-primary: ${merged.primaryColor};
      --color-secondary: ${merged.secondaryColor};
      --color-accent: ${merged.accentColor};
      --color-background: ${merged.backgroundColor};
      --color-surface: ${merged.surfaceColor};
      --color-text-primary: ${merged.textPrimary};
      --color-text-secondary: ${merged.textSecondary};
      --color-border: ${merged.borderColor};
      --color-error: ${merged.errorColor};
      --color-success: ${merged.successColor};
      --color-warning: ${merged.warningColor};
      --font-family: ${merged.fontFamily};
      --font-family-heading: ${merged.fontFamilyHeading};
      --border-radius: ${merged.borderRadius};
    }
  `.trim();
}
```

### 2. Variáveis CSS Globais (`globals.css`)

```css
/* src/app/globals.css */
/* ⚠️ NUNCA use cores hex diretamente em componentes. Use sempre var(--nome) */

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

/* Tokens de Design — Injetados dinamicamente via theme.ts */
:root {
  --color-primary: #6366F1;
  --color-secondary: #8B5CF6;
  --color-accent: #06B6D4;
  --color-background: #0F0F1A;
  --color-surface: #1A1A2E;
  --color-text-primary: #F8FAFC;
  --color-text-secondary: #94A3B8;
  --color-border: #334155;
  --color-error: #EF4444;
  --color-success: #22C55E;
  --color-warning: #F59E0B;
  --font-family: 'Inter', sans-serif;
  --font-family-heading: 'Inter', sans-serif;
  --border-radius: 0.75rem;

  /* Tokens derivados (não sobrescrever via banco de dados) */
  --color-primary-hover: color-mix(in srgb, var(--color-primary) 85%, white);
  --color-primary-alpha-10: color-mix(in srgb, var(--color-primary) 10%, transparent);
  --color-primary-alpha-20: color-mix(in srgb, var(--color-primary) 20%, transparent);
  --shadow-glow: 0 0 20px var(--color-primary-alpha-20);
  --transition-default: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  background-color: var(--color-background);
  color: var(--color-text-primary);
  font-family: var(--font-family);
  -webkit-font-smoothing: antialiased;
}
```

### 3. Integração com Supabase (busca do tema por tenant)

```typescript
// src/lib/get-tenant-theme.ts
import { createClient } from '@/lib/supabase/server';
import { TenantTheme, DEFAULT_THEME } from './theme';

export async function getTenantTheme(tenantSlug: string): Promise<TenantTheme> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('tenant_branding')
    .select('*')
    .eq('tenant_slug', tenantSlug)
    .single();

  if (error || !data) {
    console.warn(`[BrandingEngine] Tema não encontrado para "${tenantSlug}". Usando padrão.`);
    return DEFAULT_THEME;
  }

  return {
    primaryColor: data.primary_color ?? DEFAULT_THEME.primaryColor,
    secondaryColor: data.secondary_color ?? DEFAULT_THEME.secondaryColor,
    accentColor: data.accent_color ?? DEFAULT_THEME.accentColor,
    backgroundColor: data.background_color ?? DEFAULT_THEME.backgroundColor,
    surfaceColor: data.surface_color ?? DEFAULT_THEME.surfaceColor,
    textPrimary: data.text_primary ?? DEFAULT_THEME.textPrimary,
    textSecondary: data.text_secondary ?? DEFAULT_THEME.textSecondary,
    borderColor: data.border_color ?? DEFAULT_THEME.borderColor,
    errorColor: DEFAULT_THEME.errorColor,
    successColor: DEFAULT_THEME.successColor,
    warningColor: DEFAULT_THEME.warningColor,
    fontFamily: data.font_family ?? DEFAULT_THEME.fontFamily,
    fontFamilyHeading: data.font_family_heading ?? DEFAULT_THEME.fontFamilyHeading,
    borderRadius: data.border_radius ?? DEFAULT_THEME.borderRadius,
    logoUrl: data.logo_url ?? DEFAULT_THEME.logoUrl,
    faviconUrl: data.favicon_url ?? DEFAULT_THEME.faviconUrl,
    companyName: data.company_name ?? DEFAULT_THEME.companyName,
  };
}
```

### 4. Injeção SSR no Layout (Next.js App Router)

```tsx
// src/app/layout.tsx
import { generateThemeCSS } from '@/lib/theme';
import { getTenantTheme } from '@/lib/get-tenant-theme';
import { getTenantSlugFromHeaders } from '@/lib/tenant-resolver';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const tenantSlug = await getTenantSlugFromHeaders();
  const theme = await getTenantTheme(tenantSlug);
  const themeCSS = generateThemeCSS(theme);

  return (
    <html lang="pt-BR">
      <head>
        {/* Injeção SSR para evitar FOUC */}
        <style dangerouslySetInnerHTML={{ __html: themeCSS }} />
        <link rel="icon" href={theme.faviconUrl} />
        <title>{theme.companyName}</title>
      </head>
      <body>{children}</body>
    </html>
  );
}
```

### 5. Checklist de Auditoria de Branding

Antes de fazer commit, verifique:

- [ ] Nenhum arquivo `.tsx`, `.ts` ou `.css` contém cores hex hardcoded fora de `theme.ts`?
- [ ] Todos os componentes usam `var(--color-*)` para cores?
- [ ] O `generateThemeCSS` é chamado no layout raiz (SSR)?
- [ ] O `applyTheme` é chamado no cliente após mudanças de tema em tempo real?
- [ ] A tabela `tenant_branding` tem RLS ativo no Supabase?
- [ ] O fallback para `DEFAULT_THEME` está implementado em caso de erro?
