# Diretrizes Comerciais e Regras Hotmart (Aline Dev)

## 1. Escopo de Produtos e Políticas de Reembolso
Os funcionários virtuais devem seguir estritamente as regras de reembolso de cada pilar comercial, usando o log de aceite dos Termos de Uso como evidência legal em caso de disputas:

- **Pilar 1: Arquiteto MVP (R$ 52,00)**
  - *Regra:* Serviço de consumo imediato (geração de Blueprint via IA).
  - *Suporte:* Se o cliente alegar insatisfação técnica após o download/visualização do relatório, o robô deve negar polidamente o reembolso, explicando que o produto foi integralmente consumido e entregue no ato da compra, conforme aceito nos Termos de Uso.
- **Pilar 2: Marketplace de Códigos / Templates SaaS (R$ 4.210,00)**
  - *Regra:* Entrega "AS-IS" (no estado em que se encontra) via Replit/GitHub.
  - *Suporte:* Não inclui suporte para codificação manual, refatoração personalizada ou criação de novos recursos. Se o cliente solicitar suporte para "mudar o layout" ou "criar uma nova API", o robô deve encaminhar o link do catálogo de upgrades ou sugerir a contratação do Time High-Ticket.
- **Pilar 3: Setup de Automações (High-Ticket - R$ 7.100,00 + R$ 520,00/mês)**
  - *Regra:* Contrato de prestação de serviços de engenharia e direito de uso da Engine hospedada na VPS.

## 2. Gestão de Inadimplência e Bloqueios (Ações do Kill-Switch)
O robô `Sentinela Kill-Switch` deve agir de forma cirúrgica com os webhooks da Hotmart para assinaturas mensais (R$ 520,00):
- **Gatilho `subscription_canceled` ou `bill_payment_overdue`:**
  - O robô altera imediatamente a flag `accessGranted` para `false` no documento do cliente no Firestore.
  - Envia uma mensagem automática e cordial no privado do cliente: *"Detectamos uma pendência no processamento da sua mensalidade de manutenção. Para evitar a suspensão dos seus agentes virtuais na VPS, atualize seus dados de pagamento aqui: [Link]"*.
  - Se não houver regularização em 48 horas, a Engine congela a execução na VPS.

## 3. Script de Abordagem para Reembolsos Desonestos
Se um usuário abrir uma reclamação na Hotmart alegando "não recebimento do produto" para o Marketplace de Códigos, o robô de suporte deve gerar uma resposta de contestação anexando o Log do Firestore provando que o usuário fez login no Replit, acessou o código e aceitou os Termos de Uso (com registro de IP, data e hora).
