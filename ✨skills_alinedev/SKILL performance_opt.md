# Skill: Performance Optimizer
## Descrição
Engenheiro focado em Core Web Vitals e otimização de renderização React/Next.js.

## Quando usar
Ao criar listas longas, dashboards complexos ou carregar mídias.

## Instruções Técnicas
1. **Code Splitting:** Use `dynamic imports` para componentes pesados (ex: Gráficos, Mapas, Editores de Texto) que não são visíveis na primeira dobra.
2. **Otimização de Imagens:** Force o uso de `next/image` com formatos WebP/AVIF.
   - As logos dos clientes (White Label) devem ter cache agressivo.
3. **Banco de Dados:** Adicione índices compostos no banco de dados para colunas muito buscadas junto com `tenant_id` (ex: Index em `[tenant_id, created_at]`).
4. **Estado de Servidor:** Prefira *Server Components* para buscar dados. Reduza o JavaScript enviado para o cliente.


# @performance_opt — Otimização de Performance White Label

## Descrição

Garante que cada tenant do SaaS White Label tenha uma experiência rápida, independentemente do volume de customizações. Foca em três pilares: **imagens otimizadas**, **carregamento lazy** e **cache inteligente por tenant**.

**Meta:** Lighthouse Score ≥ 90 em Performance para todas as rotas públicas.

---

## Instruções Técnicas

### 1. Otimização de Imagens (WebP + Next.js Image)

```tsx
// src/components/ui/OptimizedImage.tsx
import Image from 'next/image';
import { useState } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean; // true apenas para imagens above-the-fold (LCP)
  className?: string;
  tenantId?: string; // Para logging de erros por tenant
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
  className,
  tenantId,
}: OptimizedImageProps) {
  const [hasError, setHasError] = useState(false);
  const fallbackSrc = '/images/placeholder.webp';

  return (
    <Image
      src={hasError ? fallbackSrc : src}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      loading={priority ? 'eager' : 'lazy'}
      quality={85} // Equilíbrio entre qualidade e tamanho
      formats={['image/webp', 'image/avif']} // Prioriza formatos modernos
      className={className}
      onError={() => {
        console.warn(`[OptimizedImage] Falha ao carregar imagem para tenant ${tenantId}: ${src}`);
        setHasError(true);
      }}
    />
  );
}
```

```typescript
// next.config.ts — Configuração de otimização de imagens
export default {
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 dias de cache
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co', // Storage do Supabase
      },
      {
        protocol: 'https',
        hostname: '**.cloudflare.com', // CDN opcional
      },
    ],
  },
};
```

### 2. Lazy Loading de Componentes

```tsx
// src/components/lazy/index.ts
import dynamic from 'next/dynamic';

// Componentes pesados carregados apenas quando necessários
export const LazyThemeCustomizer = dynamic(
  () => import('@/components/admin/ThemeCustomizer').then(m => m.ThemeCustomizer),
  {
    loading: () => <ComponentSkeleton height={200} />,
    ssr: false, // Painel admin não precisa de SSR
  }
);

export const LazyRichTextEditor = dynamic(
  () => import('@/components/ui/RichTextEditor'),
  {
    loading: () => <ComponentSkeleton height={300} />,
    ssr: false,
  }
);

export const LazyAnalyticsDashboard = dynamic(
  () => import('@/components/dashboard/Analytics'),
  {
    loading: () => <DashboardSkeleton />,
    ssr: false,
  }
);

// Skeleton genérico para loading states
function ComponentSkeleton({ height }: { height: number }) {
  return (
    <div
      className="animate-pulse bg-[var(--color-surface)] rounded-[var(--border-radius)]"
      style={{ height }}
      aria-label="Carregando..."
    />
  );
}
```

### 3. ISR (Incremental Static Regeneration) por Tenant

```typescript
// src/app/[tenant]/page.tsx
import { resolveTenantFromRequest } from '@/lib/tenant-resolver';
import { getLandingContent } from '@/lib/get-landing-content';

// Revalida a página a cada 5 minutos por tenant
export const revalidate = 300;

// Gera páginas estáticas para os tenants mais ativos no build
export async function generateStaticParams() {
  const { createClient } = await import('@/lib/supabase/server');
  const supabase = createClient();

  const { data: activeTenants } = await supabase
    .from('tenants')
    .select('slug')
    .eq('is_active', true)
    .eq('plan', 'pro') // Prioriza tenants pro no build estático
    .order('created_at', { ascending: false })
    .limit(50); // Limita para não explodir o build time

  return (activeTenants ?? []).map(t => ({ tenant: t.slug }));
}

export default async function TenantLandingPage({
  params,
}: {
  params: { tenant: string };
}) {
  const content = await getLandingContent(params.tenant);
  // ... renderiza a LP
}
```

### 4. Cache de Tema por Tenant (Edge Cache)

```typescript
// src/lib/cache/tenant-cache.ts
import { unstable_cache } from 'next/cache';
import { TenantTheme } from '@/lib/theme';

/**
 * Cache do tema por tenant com revalidação automática.
 * Evita buscar o tema do banco a cada request.
 */
export const getCachedTenantTheme = unstable_cache(
  async (tenantSlug: string): Promise<TenantTheme> => {
    const { getTenantTheme } = await import('@/lib/get-tenant-theme');
    return getTenantTheme(tenantSlug);
  },
  ['tenant-theme'], // Cache key prefix
  {
    revalidate: 300, // 5 minutos
    tags: ['tenant-theme'], // Tag para revalidação manual
  }
);

/**
 * Invalida o cache do tema de um tenant específico.
 * Chame após o tenant atualizar o branding.
 */
export async function invalidateTenantThemeCache(tenantSlug: string): Promise<void> {
  const { revalidateTag } = await import('next/cache');
  revalidateTag(`tenant-theme-${tenantSlug}`);
}
```

### 5. Otimização de Bundle

```typescript
// src/lib/utils/bundle-analyzer.ts
// Adicione ao package.json: "analyze": "ANALYZE=true next build"

// next.config.ts
import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

export default withBundleAnalyzer({
  // Divide chunks por rota para reduzir JS inicial
  experimental: {
    optimizePackageImports: [
      'lucide-react',    // Tree-shake ícones
      '@radix-ui/react-*', // Tree-shake componentes Radix
    ],
  },
});
```

### 6. Monitoramento de Performance por Tenant

```typescript
// src/lib/monitoring/performance.ts
export function reportWebVitals(metric: any) {
  const tenantSlug = document.documentElement.dataset.tenant;

  // Envia métricas para analytics com tag do tenant
  if (process.env.NODE_ENV === 'production') {
    fetch('/api/analytics/vitals', {
      method: 'POST',
      body: JSON.stringify({
        name: metric.name,
        value: metric.value,
        tenant: tenantSlug,
        url: window.location.pathname,
      }),
      keepalive: true, // Garante envio mesmo ao navegar
    });
  }

  // Alerta se LCP > 2.5s (threshold do Google)
  if (metric.name === 'LCP' && metric.value > 2500) {
    console.warn(`[Performance] LCP alto para tenant "${tenantSlug}": ${metric.value}ms`);
  }
}
```

### 7. Checklist de Performance

Antes de cada deploy, verifique:

- [ ] Lighthouse Performance Score ≥ 90 nas rotas públicas?
- [ ] LCP (Largest Contentful Paint) < 2.5s?
- [ ] CLS (Cumulative Layout Shift) < 0.1?
- [ ] Imagens do hero usam `priority={true}`?
- [ ] Imagens abaixo da dobra usam `loading="lazy"`?
- [ ] Componentes pesados (editor, analytics) são lazy loaded?
- [ ] ISR configurado para rotas de LP dos tenants?
- [ ] Cache de tema ativo (evita query ao banco por request)?
- [ ] Bundle size do JS inicial < 200KB (gzipped)?
- [ ] Fontes do Google carregadas com `display=swap`?
