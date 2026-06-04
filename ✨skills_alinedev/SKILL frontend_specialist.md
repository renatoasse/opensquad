---
name: "@frontend_specialist"
description: "Especialista em React/Next.js com Tailwind CSS para SaaS White Label. Todo componente recebe props de estilo. Implementa lógica de troca de tema em tempo real por tenant."
when_to_use: "Use ao criar qualquer componente de UI, página ou layout. Garante que os componentes sejam reutilizáveis, estilizáveis via props e integrados ao sistema de temas dinâmicos."
---

# @frontend_specialist — Especialista em Frontend White Label

## Descrição

Constrói componentes React/Next.js que são **completamente agnósticos ao tenant**: recebem props de estilo, consomem variáveis CSS do `@branding_engine` e suportam troca de tema em tempo real sem reload de página.

**Stack obrigatória:** Next.js 14+ (App Router) + Tailwind CSS + TypeScript.

---

## Instruções Técnicas

### 1. Padrão de Componente White Label

Todo componente deve seguir este contrato:

```tsx
// src/components/ui/Button.tsx
import { cn } from '@/lib/utils';
import { ButtonHTMLAttributes, forwardRef } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: [
    'bg-[var(--color-primary)] text-white',
    'hover:bg-[var(--color-primary-hover)]',
    'shadow-[var(--shadow-glow)]',
  ].join(' '),
  secondary: [
    'bg-[var(--color-surface)] text-[var(--color-text-primary)]',
    'border border-[var(--color-border)]',
    'hover:border-[var(--color-primary)]',
  ].join(' '),
  ghost: 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-primary-alpha-10)]',
  danger: 'bg-[var(--color-error)] text-white hover:opacity-90',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-base',
  lg: 'px-8 py-3.5 text-lg',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', isLoading, leftIcon, rightIcon, children, className, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center gap-2 font-medium',
          'rounded-[var(--border-radius)] transition-[var(--transition-default)]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {isLoading ? <Spinner size={size} /> : leftIcon}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';

function Spinner({ size }: { size: ButtonSize }) {
  const sizeMap = { sm: 'w-3 h-3', md: 'w-4 h-4', lg: 'w-5 h-5' };
  return (
    <svg className={cn('animate-spin', sizeMap[size])} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
```

### 2. Context de Tema em Tempo Real

```tsx
// src/contexts/ThemeContext.tsx
'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { TenantTheme, DEFAULT_THEME, applyTheme } from '@/lib/theme';
import { createClient } from '@/lib/supabase/client';

interface ThemeContextValue {
  theme: TenantTheme;
  updateTheme: (updates: Partial<TenantTheme>) => Promise<void>;
  isUpdating: boolean;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: DEFAULT_THEME,
  updateTheme: async () => {},
  isUpdating: false,
});

export function ThemeProvider({
  children,
  initialTheme,
  tenantId,
}: {
  children: React.ReactNode;
  initialTheme: TenantTheme;
  tenantId: string;
}) {
  const [theme, setTheme] = useState<TenantTheme>(initialTheme);
  const [isUpdating, setIsUpdating] = useState(false);
  const supabase = createClient();

  // Aplica o tema inicial (client-side, após SSR)
  useEffect(() => {
    applyTheme(initialTheme);
  }, [initialTheme]);

  const updateTheme = useCallback(async (updates: Partial<TenantTheme>) => {
    setIsUpdating(true);
    const newTheme = { ...theme, ...updates };

    // Aplica imediatamente no DOM (feedback visual instantâneo)
    applyTheme(newTheme);
    setTheme(newTheme);

    try {
      const { error } = await supabase
        .from('tenant_branding')
        .update({
          primary_color: newTheme.primaryColor,
          secondary_color: newTheme.secondaryColor,
          background_color: newTheme.backgroundColor,
          // ... demais campos
        })
        .eq('tenant_id', tenantId);

      if (error) throw error;
    } catch (err) {
      // Rollback em caso de erro
      applyTheme(theme);
      setTheme(theme);
      console.error('[ThemeContext] Falha ao salvar tema:', err);
      throw err;
    } finally {
      setIsUpdating(false);
    }
  }, [theme, tenantId, supabase]);

  return (
    <ThemeContext.Provider value={{ theme, updateTheme, isUpdating }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
```

### 3. Componente de Preview de Tema (Painel Admin)

```tsx
// src/components/admin/ThemeCustomizer.tsx
'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { useState } from 'react';

export function ThemeCustomizer() {
  const { theme, updateTheme, isUpdating } = useTheme();
  const [localColor, setLocalColor] = useState(theme.primaryColor);

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setLocalColor(color);
    // Debounce: aplica preview em tempo real sem salvar
    document.documentElement.style.setProperty('--color-primary', color);
  };

  const handleSave = async () => {
    await updateTheme({ primaryColor: localColor });
  };

  return (
    <div className="p-6 bg-[var(--color-surface)] rounded-[var(--border-radius)] border border-[var(--color-border)]">
      <h3 className="text-[var(--color-text-primary)] font-semibold mb-4">
        Personalizar Tema
      </h3>
      <div className="flex items-center gap-4">
        <label className="text-[var(--color-text-secondary)] text-sm">
          Cor Primária
        </label>
        <input
          type="color"
          value={localColor}
          onChange={handleColorChange}
          className="w-10 h-10 rounded cursor-pointer border-0"
        />
        <span className="text-[var(--color-text-secondary)] text-sm font-mono">
          {localColor}
        </span>
      </div>
      <button
        onClick={handleSave}
        disabled={isUpdating}
        className="mt-4 px-4 py-2 bg-[var(--color-primary)] text-white rounded-[var(--border-radius)] disabled:opacity-50"
      >
        {isUpdating ? 'Salvando...' : 'Salvar Tema'}
      </button>
    </div>
  );
}
```

### 4. Regras de Componentes

- **Props sobre classes**: Prefira props tipadas a `className` arbitrário para variações de estilo.
- **Variáveis CSS sobre valores Tailwind fixos**: Use `bg-[var(--color-primary)]` em vez de `bg-indigo-500`.
- **Sem cores hardcoded**: Nenhum valor hex, rgb ou hsl diretamente em componentes.
- **`forwardRef` obrigatório** em todos os componentes de input/button para compatibilidade com formulários.
- **Acessibilidade**: Todo elemento interativo deve ter `aria-label` ou texto visível. Use `focus-visible` para outline de foco.
- **Server Components por padrão**: Só adicione `'use client'` quando necessário (eventos, hooks de estado, contextos).

### 5. Estrutura de Pastas

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Layout raiz (injeta tema SSR)
│   └── [slug]/             # Rotas dinâmicas por tenant
├── components/
│   ├── ui/                 # Componentes base (Button, Input, Card, Modal)
│   ├── landing/            # Seções da Landing Page
│   ├── dashboard/          # Componentes do painel do tenant
│   └── admin/              # Painel de administração do SaaS
├── contexts/
│   └── ThemeContext.tsx
├── lib/
│   ├── theme.ts
│   ├── tenant-resolver.ts
│   └── utils.ts            # cn() e utilitários
└── types/
    └── tenant.ts
```
