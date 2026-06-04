---
name: Email Sales & Support Sender
description: Habilidade para envio de emails transacionais e de marketing com foco em conversão.
type: prompt
version: 1.0.0
categories: [communication, sales]
env: [EMAIL_SERVICE, EMAIL_API_KEY, EMAIL_FROM]
---

# Email Sender Skill

## Protocolo de Atuação
1. **Templates HTML Premium:** Sempre envie emails em HTML responsivo com fallback em texto puro.
2. **Contexto de Marca:** Utilize as cores e o tom de voz definidos em `company.md`.
3. **Ancoragem e CTAs:** Emails de oferta devem ter CTAs claros e botões destacados para o link de checkout.
4. **Resiliência:** Se o serviço principal falhar, registre o log para tentativa posterior.

## Integração sugerida:
Utilize as credenciais de `EMAIL_SERVICE` (ex: Resend, SendGrid) conforme configurado no `.env`.
