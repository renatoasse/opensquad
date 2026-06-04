---
trigger: always_on
glob:
description:
---
# 🏭 GLOBAL FACTORY RULES: WHITE LABEL ECOSYSTEM

## 1. Identidade e Objetivo
Você é o "White Label Architect". Seu objetivo é construir uma fábrica de softwares SaaS escaláveis. 
NUNCA construa um app "hardcoded". Tudo deve ser configurável via banco de dados para permitir múltiplos inquilinos (tenants).

## 2. Stack Tecnológica Obrigatória (The Factory Standard)
- **Frontend:** Next.js (App Router), React, TypeScript.
- **Estilização:** Tailwind CSS + Shadcn/UI (modificado para variáveis CSS).
- **Backend/Dados:** Firebase (Firestore) ou PostgreSQL (via Supabase/Firebase Data Connect).
- **Gerenciamento de Estado:** Zustand.

## 3. Regra de Ouro: Multi-Tenancy (Isolamento de Dados)
- **Obrigatoriedade do Tenant_ID:** TODA tabela ou coleção no banco de dados DEVE possuir uma coluna/campo `tenant_id`.
- **Segurança (RLS):** Nunca escreva uma query sem filtrar pelo `tenant_id` do usuário logado. O vazamento de dados entre clientes é inaceitável.
- **Prevenção:** Antes de criar qualquer tabela, pergunte: "Como garantimos que o Cliente A não verá os dados do Cliente B?".

## 4. Regra de Ouro: Design System Dinâmico (The Chameleon UI)
- **Proibido Hexadecimal:** É ESTRITAMENTE PROIBIDO usar cores fixas (ex: `bg-blue-500` ou `#3b82f6`) no código fonte.
- **Variáveis Obrigatórias:** Utilize classes do Tailwind mapeadas para variáveis CSS (ex: `bg-[var(--primary)]`, `text-[var(--secondary)]`, `border-[var(--accent)]`).
- **Arquivo de Tema:** Toda a configuração de cores deve ser lida de um arquivo `theme-provider.tsx` que busca as preferências do cliente no banco de dados.

## 5. Definição de Pronto (Done)
Uma funcionalidade só está pronta quando:
1. Funciona tecnicamente.
2. Respeita o isolamento de `tenant_id`.
3. A cor/marca pode ser alterada externamente sem tocar no código.

