---
execution: web_fetch
method: POST
url: "${APP_API_URL}/api/agent-project/${USER_ID}"
headers:
  Authorization: "Bearer ${FIREBASE_ID_TOKEN}"
  Content-Type: "application/json"
body:
  stage: 2
  status: "architecture"
---

# Step 07: Atualizar Projeto no Firestore

## Objetivo
Registrar o progresso do projeto do cliente na coleção `projects/{userId}` do Firestore, 
sincronizando o painel "Meu Projeto" do app Aline DEV.

## Contexto
Este passo é executado após a conclusão do provisionamento (Step 02) ou entrega do 
Marketplace (Step 03). O documento `projects/{userId} já foi criado pelo webhook da 
Hotmart e contém os dados iniciais.

## Instruções
1. Extrair o `userId` do payload do webhook ou do state.json
2. Obter um Firebase ID Token (via variável de ambiente ou refresh)
3. Fazer POST para `${APP_API_URL}/api/agent-project/${USER_ID}` com:
   - `stage`: número do estágio atual (2 após provisionamento, 3 após engine config, etc.)
   - `status`: descrição textual do estágio
4. Notificar no Telegram sobre a atualização

## Exemplo de Body
```json
{
  "stage": 2,
  "status": "architecture",
  "updatedAt": "SERVER_TIMESTAMP"
}
```

## Quality Criteria
- [ ] Documento `projects/{userId}` atualizado com sucesso no Firestore
- [ ] Painel do cliente reflete o novo estágio
