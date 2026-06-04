---
name: "@seo_booster"
description: "Gera meta-tags dinâmicas por tenant/subdomínio. Título, descrição, OG tags e dados estruturados mudam automaticamente com base no domínio que acessa o app."
when_to_use: "Use ao configurar o SEO de qualquer rota pública, ao criar o layout raiz do Next.js, ou ao garantir que cada tenant tenha sua identidade de marca nos resultados de busca."
---

# @seo_booster — SEO Dinâmico por Tenant

## Descrição

Implementa uma estratégia de SEO onde **cada tenant tem sua própria identidade nos mecanismos de busca**: título, descrição, Open Graph, Twitter Cards e dados estruturados (Schema.org) são gerados dinamicamente com base no subdomínio ou domínio customizado que acessa o app.

---

## Instruções Técnicas

### 1. Schema de SEO no Banco de Dados

```sql
-- Adicione à tabela tenant_branding ou crie uma tabela separada
ALTER TABLE tenant_branding ADD COLUMN IF NOT EXISTS seo_title TEXT;
ALTER TABLE tenant_branding ADD COLUMN IF NOT EXISTS seo_description TEXT;
ALTER TABLE tenant_branding ADD COLUMN IF NOT EXISTS seo_keywords TEXT[];
ALTER TABLE tenant_branding ADD COLUMN IF NOT EXISTS og_image_url TEXT;
ALTER TABLE tenant_branding ADD COLUMN IF NOT EXISTS twitter_handle TEXT;
ALTER TABLE tenant_branding ADD COLUMN IF NOT EXISTS schema_type TEXT DEFAULT 'LocalBusiness';
```

### 2. Gerador de Metadata (Next.js App Router)

```typescript
// src/lib/seo/generate-metadata.ts
import { Metadata } from 'next';
import { TenantTheme } from '@/lib/theme';

interface TenantSEO {
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  ogImageUrl?: string;
  twitterHandle?: string;
  companyName: string;
  logoUrl: string;
  customDomain?: string;
  tenantSlug: string;
}

/**
 * Gera o objeto Metadata do Next.js para um tenant específico.
 * Use no generateMetadata() de cada page.tsx pública.
 */
export function generateTenantMetadata(
  seo: TenantSEO,
  pagePath: string = '/'
): Metadata {
  const baseUrl = seo.customDomain
    ? `https://${seo.customDomain}`
    : `https://${seo.tenantSlug}.${process.env.NEXT_PUBLIC_BASE_DOMAIN}`;

  const title = seo.seoTitle ?? seo.companyName;
  const description = seo.seoDescription ?? `Bem-vindo ao ${seo.companyName}. Conheça nossas soluções.`;
  const ogImage = seo.ogImageUrl ?? seo.logoUrl;

  return {
    title: {
      default: title,
      template: `%s | ${seo.companyName}`,
    },
    description,
    keywords: seo.seoKeywords ?? [],
    authors: [{ name: seo.companyName }],
    creator: seo.companyName,
    publisher: seo.companyName,
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: `${baseUrl}${pagePath}`,
    },
    openGraph: {
      type: 'website',
      locale: 'pt_BR',
      url: `${baseUrl}${pagePath}`,
      siteName: seo.companyName,
      title,
      description,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${seo.companyName} — ${title}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
      creator: seo.twitterHandle ? `@${seo.twitterHandle}` : undefined,
      site: seo.twitterHandle ? `@${seo.twitterHandle}` : undefined,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    icons: {
      icon: seo.logoUrl,
      shortcut: seo.logoUrl,
      apple: seo.logoUrl,
    },
  };
}
```

### 3. Integração no Layout e Pages

```tsx
// src/app/layout.tsx
import { generateTenantMetadata } from '@/lib/seo/generate-metadata';
import { resolveTenantFromRequest } from '@/lib/tenant-resolver';
import { getTenantTheme } from '@/lib/get-tenant-theme';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const tenant = await resolveTenantFromRequest();

  if (!tenant) {
    // Metadata do domínio raiz (marketing do SaaS)
    return {
      title: {
        default: 'SaaS White Label — Crie seu App em Minutos',
        template: '%s | SaaS White Label',
      },
      description: 'A plataforma mais completa para criar seu SaaS White Label.',
    };
  }

  const theme = await getTenantTheme(tenant.tenantSlug);

  return generateTenantMetadata(
    {
      seoTitle: theme.companyName,
      seoDescription: `Bem-vindo ao ${theme.companyName}`,
      companyName: theme.companyName,
      logoUrl: theme.logoUrl,
      tenantSlug: tenant.tenantSlug,
    },
    '/'
  );
}

// src/app/[tenant]/blog/[slug]/page.tsx — Metadata por post
export async function generateMetadata({
  params,
}: {
  params: { tenant: string; slug: string };
}): Promise<Metadata> {
  const [theme, post] = await Promise.all([
    getTenantTheme(params.tenant),
    getBlogPost(params.tenant, params.slug),
  ]);

  return generateTenantMetadata(
    {
      seoTitle: post.title,
      seoDescription: post.excerpt,
      seoKeywords: post.tags,
      ogImageUrl: post.coverImageUrl,
      companyName: theme.companyName,
      logoUrl: theme.logoUrl,
      tenantSlug: params.tenant,
    },
    `/blog/${params.slug}`
  );
}
```

### 4. Dados Estruturados (Schema.org)

```tsx
// src/components/seo/StructuredData.tsx
interface LocalBusinessSchema {
  name: string;
  description: string;
  url: string;
  logo: string;
  telephone?: string;
  address?: {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
}

export function LocalBusinessStructuredData({
  name,
  description,
  url,
  logo,
  telephone,
  address,
}: LocalBusinessSchema) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name,
    description,
    url,
    logo: {
      '@type': 'ImageObject',
      url: logo,
    },
    ...(telephone && { telephone }),
    ...(address && {
      address: {
        '@type': 'PostalAddress',
        ...address,
      },
    }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Uso na Landing Page do tenant:
// <LocalBusinessStructuredData
//   name={theme.companyName}
//   description={content.heroSubtitle}
//   url={`https://${tenant.tenantSlug}.seuapp.com`}
//   logo={theme.logoUrl}
// />
```

### 5. Sitemap Dinâmico por Tenant

```typescript
// src/app/sitemap.ts
import { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/server';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient();
  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN!;

  const { data: tenants } = await supabase
    .from('tenants')
    .select('slug, updated_at')
    .eq('is_active', true);

  const tenantUrls = (tenants ?? []).map(tenant => ({
    url: `https://${tenant.slug}.${baseDomain}`,
    lastModified: new Date(tenant.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [
    {
      url: `https://${baseDomain}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...tenantUrls,
  ];
}
```

### 6. Robots.txt Dinâmico

```typescript
// src/app/robots.ts
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN!;

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard/', '/api/', '/admin/'],
      },
    ],
    sitemap: `https://${baseDomain}/sitemap.xml`,
  };
}
```

### 7. Checklist de SEO

- [ ] `generateMetadata()` implementado em todas as pages públicas?
- [ ] Título e descrição são únicos por tenant (não genéricos)?
- [ ] Open Graph image tem 1200x630px?
- [ ] Dados estruturados (Schema.org) implementados na LP?
- [ ] Sitemap inclui URLs de todos os tenants ativos?
- [ ] Canonical URL aponta para o domínio correto do tenant?
- [ ] Rotas de dashboard e API estão em `disallow` no robots.txt?
- [ ] Lighthouse SEO Score ≥ 95 nas rotas públicas?
- [ ] Favicon dinâmico por tenant está configurado?

# Skill: SEO Booster & Programmatic SEO
## Descrição
Especialista em otimização para motores de busca (SEO) focado em arquitetura Multi-Tenant e Next.js Metadata API.

## Quando usar
Ao criar páginas públicas, blogs ou configurar o domínio do cliente.

## Instruções Técnicas
1. **Metadados Dinâmicos:** No `layout.tsx`, implemente a função `generateMetadata`.
   - O `title` e `description` DEVEM ser buscados no banco de dados baseados no subdomínio atual.
   - Ex: Se o subdomínio for "oficina-do-ze", o título deve ser "Oficina do Zé | Agendamento Online".
2. **Sitemaps Isolados:** Gere um `sitemap.xml` dinâmico para cada tenant, listando apenas as páginas públicas dele.
3. **Schema Markup:** Injete JSON-LD estruturado para "LocalBusiness" com os dados do cliente (Endereço, Telefone) para ajudar no SEO local dele.