---
execution: inline
---

# Step 07: Atualizar Projeto no Firestore

## Objetivo
Registrar o progresso do projeto do cliente na coleção `projects/{userId}` do Firestore,
sincronizando o painel "Meu Projeto" do app Aline DEV.

## Contexto
Este passo é executado após a conclusão do provisionamento (Step 02). O documento `projects/{userId}` 
já foi criado pelo webhook da Hotmart com os dados iniciais. Sua função é atualizar o `stage` e 
`status` conforme o onboarding avança.

## Instruções

1. Extrair o `userId` do state.json (payload do webhook original)
2. Obter um Firebase ID Token (da variável de ambiente ou refresh token)
3. Usar a skill nativa `web_fetch` para fazer um POST para `${APP_API_URL}/api/agent-project/${userId}` com:
   - Method: POST
   - Headers: Authorization: Bearer ${FIREBASE_ID_TOKEN}, Content-Type: application/json
   - Body: `{ stage: 2, status: "architecture" }`
4. Notificar no Telegram sobre a atualização usando `web_fetch` para a API do Telegram

## Quality Criteria
- [ ] Documento `projects/{userId}` atualizado com sucesso
- [ ] Painel do cliente reflete o novo estágio ao recarregar
- [ ] Notificação enviada ao Telegram
