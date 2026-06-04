# Skill: Landing Page Generator
## Descrição
Especialista em criar Landing Pages de alta conversão (H1, Benefícios, Prova Social, CTA) que são geradas dinamicamente.

## Quando usar
Ao criar a rota `/` (home) ou páginas de marketing do SaaS.

## Instruções Técnicas
1. **Conteúdo Dinâmico:** Todo texto (Título, Subtítulo) deve vir do banco de dados (`tenants` table), não hardcoded.
   - Exemplo: `<h1>{tenant.landing_page_title}</h1>`
2. **Componentes:** Use seções modulares: `HeroSection`, `FeaturesGrid`, `PricingTable` (conectada ao Stripe/Pagar.me), `Footer`.
3. **SEO Local:** Prepare a estrutura para injetar meta-tags baseadas no nicho do cliente (ex: "Clínica em São Paulo").