---
name: "@landing_page_gen"
description: "Cria Landing Pages de alta conversão com conteúdo 100% dinâmico (H1, CTA, benefícios, depoimentos) puxado do banco de dados com base no domínio/subdomínio do tenant."
when_to_use: "Use ao criar ou refatorar a Landing Page pública de qualquer tenant. O conteúdo NUNCA deve ser hardcoded — tudo vem do banco de dados identificado pelo subdomínio."
---

# @landing_page_gen — Gerador de Landing Pages de Alta Conversão

## Descrição

Cria Landing Pages (LPs) otimizadas para conversão onde **todo o conteúdo é dinâmico**: headline, subtítulo, CTA, lista de benefícios, depoimentos, FAQ e rodapé são carregados do banco de dados com base no domínio que está acessando a aplicação.

Isso permite que `cliente1.seuapp.com` exiba uma LP completamente diferente de `cliente2.seuapp.com`, sem nenhuma alteração de código.

---

## Instruções Técnicas

### 1. Resolução do Tenant pelo Domínio

```typescript
// src/lib/tenant-resolver.ts
import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';

export interface TenantContext {
  tenantId: string;
  tenantSlug: string;
  customDomain?: string;
  plan: 'free' | 'pro' | 'enterprise';
}

export async function resolveTenantFromRequest(): Promise<TenantContext | null> {
  const headersList = headers();
  const host = headersList.get('host') ?? '';

  // Remove porta (ex: localhost:3000 → localhost)
  const hostname = host.split(':')[0];

  const supabase = createClient();

  // Tenta resolver por domínio customizado primeiro
  const { data: byCustomDomain } = await supabase
    .from('tenants')
    .select('id, slug, custom_domain, plan')
    .eq('custom_domain', hostname)
    .eq('is_active', true)
    .single();

  if (byCustomDomain) {
    return {
      tenantId: byCustomDomain.id,
      tenantSlug: byCustomDomain.slug,
      customDomain: byCustomDomain.custom_domain,
      plan: byCustomDomain.plan,
    };
  }

  // Resolve por subdomínio (ex: "cliente1" de "cliente1.seuapp.com")
  const subdomain = hostname.split('.')[0];
  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN ?? 'seuapp.com';

  if (hostname === baseDomain || hostname === 'localhost') {
    return null; // Domínio raiz — exibe LP de marketing do SaaS
  }

  const { data: bySubdomain } = await supabase
    .from('tenants')
    .select('id, slug, plan')
    .eq('slug', subdomain)
    .eq('is_active', true)
    .single();

  if (!bySubdomain) return null;

  return {
    tenantId: bySubdomain.id,
    tenantSlug: bySubdomain.slug,
    plan: bySubdomain.plan,
  };
}
```

### 2. Schema de Conteúdo da Landing Page

```typescript
// src/types/landing-page.ts
export interface LandingPageContent {
  // Hero Section
  heroTitle: string;
  heroSubtitle: string;
  heroCta: string;
  heroCtaSecondary?: string;
  heroImageUrl?: string;

  // Benefícios
  benefits: Array<{
    icon: string; // Nome do ícone (ex: "shield", "zap", "star")
    title: string;
    description: string;
  }>;

  // Prova Social
  testimonials: Array<{
    name: string;
    role: string;
    avatarUrl?: string;
    quote: string;
    rating: number; // 1-5
  }>;

  // FAQ
  faq: Array<{
    question: string;
    answer: string;
  }>;

  // Rodapé
  footerTagline: string;
  socialLinks?: {
    instagram?: string;
    linkedin?: string;
    whatsapp?: string;
  };
}
```

### 3. Busca do Conteúdo no Banco de Dados

```typescript
// src/lib/get-landing-content.ts
import { createClient } from '@/lib/supabase/server';
import { LandingPageContent } from '@/types/landing-page';

const DEFAULT_CONTENT: LandingPageContent = {
  heroTitle: 'Transforme seu negócio hoje',
  heroSubtitle: 'A plataforma completa para você crescer mais rápido.',
  heroCta: 'Começar Grátis',
  heroCtaSecondary: 'Ver demonstração',
  benefits: [
    { icon: 'zap', title: 'Rápido', description: 'Configure em minutos.' },
    { icon: 'shield', title: 'Seguro', description: 'Seus dados protegidos.' },
    { icon: 'star', title: 'Completo', description: 'Tudo que você precisa.' },
  ],
  testimonials: [],
  faq: [],
  footerTagline: 'Feito com ❤️ para o seu negócio.',
};

export async function getLandingContent(tenantId: string): Promise<LandingPageContent> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('tenant_landing_content')
    .select('*')
    .eq('tenant_id', tenantId)
    .single();

  if (error || !data) {
    console.warn(`[LandingPageGen] Conteúdo não encontrado para tenant "${tenantId}". Usando padrão.`);
    return DEFAULT_CONTENT;
  }

  return {
    heroTitle: data.hero_title ?? DEFAULT_CONTENT.heroTitle,
    heroSubtitle: data.hero_subtitle ?? DEFAULT_CONTENT.heroSubtitle,
    heroCta: data.hero_cta ?? DEFAULT_CONTENT.heroCta,
    heroCtaSecondary: data.hero_cta_secondary,
    heroImageUrl: data.hero_image_url,
    benefits: data.benefits ?? DEFAULT_CONTENT.benefits,
    testimonials: data.testimonials ?? DEFAULT_CONTENT.testimonials,
    faq: data.faq ?? DEFAULT_CONTENT.faq,
    footerTagline: data.footer_tagline ?? DEFAULT_CONTENT.footerTagline,
    socialLinks: data.social_links,
  };
}
```

### 4. Página da Landing Page (Next.js App Router)

```tsx
// src/app/page.tsx (ou src/app/[domain]/page.tsx)
import { resolveTenantFromRequest } from '@/lib/tenant-resolver';
import { getLandingContent } from '@/lib/get-landing-content';
import { getTenantTheme } from '@/lib/get-tenant-theme';
import { HeroSection } from '@/components/landing/HeroSection';
import { BenefitsSection } from '@/components/landing/BenefitsSection';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
import { FaqSection } from '@/components/landing/FaqSection';
import { FooterSection } from '@/components/landing/FooterSection';

export default async function LandingPage() {
  const tenant = await resolveTenantFromRequest();

  if (!tenant) {
    // Exibe LP de marketing do próprio SaaS (domínio raiz)
    return <MarketingLandingPage />;
  }

  const [content, theme] = await Promise.all([
    getLandingContent(tenant.tenantId),
    getTenantTheme(tenant.tenantSlug),
  ]);

  return (
    <main>
      <HeroSection
        title={content.heroTitle}
        subtitle={content.heroSubtitle}
        cta={content.heroCta}
        ctaSecondary={content.heroCtaSecondary}
        imageUrl={content.heroImageUrl}
        companyName={theme.companyName}
      />
      <BenefitsSection benefits={content.benefits} />
      <TestimonialsSection testimonials={content.testimonials} />
      <FaqSection items={content.faq} />
      <FooterSection
        tagline={content.footerTagline}
        socialLinks={content.socialLinks}
        companyName={theme.companyName}
      />
    </main>
  );
}
```

### 5. Estrutura de Conversão Obrigatória

Toda LP gerada DEVE seguir esta ordem de seções:

1. **Hero** — Proposta de valor clara + CTA principal acima da dobra
2. **Prova Social Rápida** — Logos de clientes ou número de usuários
3. **Benefícios** — 3 a 6 cards com ícone, título e descrição curta
4. **Como Funciona** — 3 passos simples (opcional, mas recomendado)
5. **Depoimentos** — Mínimo 3, com foto, nome e cargo
6. **CTA Secundário** — Repetição do CTA com urgência ou garantia
7. **FAQ** — 5 a 8 perguntas frequentes
8. **Rodapé** — Links legais, redes sociais, copyright

### 6. Checklist de Qualidade

- [ ] Nenhum texto hardcoded nos componentes da LP?
- [ ] A resolução de tenant funciona para subdomínio E domínio customizado?
- [ ] O fallback de conteúdo padrão está implementado?
- [ ] A LP carrega em menos de 2s (verificar com Lighthouse)?
- [ ] As meta-tags dinâmicas estão configuradas (ver `@seo_booster`)?
- [ ] O CTA principal está visível sem scroll em mobile?
