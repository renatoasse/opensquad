---
name: "@dashboard_builder"
description: "Especialista em criar interfaces administrativas modernas (Shadcn/UI + Tailwind) que se adaptam à marca do cliente final (White Label)."
when_to_use: "Para gerar páginas, componentes, sidebars ou formulários."
---

# Skill: Dashboard & UI Builder

## Descrição

Especialista em criar interfaces administrativas modernas (Shadcn/UI + Tailwind) que se adaptam à marca do cliente final (White Label).

## Quando Usar

Para gerar páginas, componentes, sidebars ou formulários.

## Instruções Técnicas

1. **Estrutura Padrão:** Crie sempre um layout com `Sidebar` (navegação), `Header` (perfil/config) e `MainContent`.

2. **Design System Dinâmico (CRÍTICO):**
   - **NUNCA** use cores hexadecimais (ex: `#000` ou `bg-blue-500`).
   - **USE SEMPRE** variáveis CSS semânticas: `bg-primary`, `text-primary-foreground`, `border-border`.
   - Isso permite que o app mude de cor instantaneamente baseado na configuração do banco de dados.

3. **Componentes:** Utilize a biblioteca Shadcn/UI.

4. **Responsividade:** Mobile-first obrigatório.

---

## Estrutura de Pastas Padrão

```
src/
├── app/
│   └── (dashboard)/
│       ├── layout.tsx        ← Sidebar + Header
│       └── dashboard/
│           └── page.tsx      ← MainContent
├── components/
│   ├── layout/
│   │   ├── AppSidebar.tsx
│   │   └── DashboardHeader.tsx
│   └── ui/                   ← Componentes Shadcn/UI
```

## Exemplo de Layout Base

```tsx
// src/app/(dashboard)/layout.tsx
import { AppSidebar } from '@/components/layout/AppSidebar';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <DashboardHeader />
        {/* ✅ Usa variáveis semânticas — nunca hex */}
        <main className="flex-1 p-6 bg-background text-foreground">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
```

## Exemplo de Componente White Label Correto

```tsx
// ✅ CORRETO — usa variáveis semânticas do Shadcn/Tailwind
export function StatusCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="text-2xl font-bold text-card-foreground">{value}</p>
    </div>
  );
}

// ❌ ERRADO — hardcoded, quebra o White Label
export function StatusCardErrado({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
```

## Widgets de Destaque por Nicho

Adapte o `MainContent` conforme o vertical do tenant:

| Nicho | Widget Principal | Métrica em Destaque |
|-------|-----------------|---------------------|
| Delivery (App 3) | Pedidos em Aberto | Total de pedidos hoje |
| Clínicas | Agenda do Dia | Consultas confirmadas |
| GovTech (App 11) | Processos Pendentes | Processos com prazo vencendo |
| Agro | Safras Ativas | Área total em produção (ha) |
| Barbearia | Agendamentos do Dia | Horários disponíveis |

```tsx
// Exemplo: Widget de Pedidos em Aberto (Delivery)
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function PedidosEmAbertoWidget({ count }: { count: number }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Pedidos em Aberto</CardTitle>
        {/* Badge usa variável semântica — muda com o tema do tenant */}
        <Badge variant="destructive">{count}</Badge>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold text-primary">{count}</p>
        <p className="text-sm text-muted-foreground">aguardando preparo</p>
      </CardContent>
    </Card>
  );
}
```

## Checklist de UI

- [ ] Layout tem Sidebar + Header + MainContent?
- [ ] Nenhuma cor hex ou classe Tailwind fixa (ex: `bg-blue-500`) no código?
- [ ] Todos os componentes usam variáveis semânticas (`bg-primary`, `text-foreground`, etc.)?
- [ ] Componentes Shadcn/UI instalados via `npx shadcn@latest add`?
- [ ] Layout responsivo testado em mobile (< 768px)?
- [ ] Widget de destaque correto para o nicho do tenant?
