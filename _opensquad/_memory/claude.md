# Instruções Específicas para Modelos Anthropic (Claude)

## Premissas Técnicas Obrigatórias
- **Banco de Dados:** Sempre assuma que o back-end roda estritamente em Google Cloud Firestore.
- **Segurança:** Toda lógica de código gerada para os templates do Marketplace deve respeitar regras rígidas de `Firestore Security Rules` (bloqueando leitura/escrita se a licença do usuário não estiver ativa).
- **Hospedagem:** O Dashboard roda em instâncias Always-On do Replit e as automações principais rodam via Docker na VPS da Hostinger.

## Estilo de Escrita de Código
- Escreva códigos limpos, modulares, com tratamento de erros robusto.
- Toda transição de estado gerada em scripts de automação deve obrigatoriamente disparar um log para a coleção `logs_execucao`.
