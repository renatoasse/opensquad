---
name: firebase_marketplace
description: "Habilidade para listar e gerenciar Apps no marketplace do Aline Builds via Firestore."
type: prompt
version: 1.0.0
categories: [database, marketplace]
env: [FIREBASE_PROJECT_ID]
---

# Firebase Marketplace Skill

## Atuação
Sempre que um App for concluído e estiver pronto para venda, ele deve ser cadastrado na coleção `marketplace` do projeto Firebase `studio-9411389430-61164`.

## Estrutura do Documento (JSON)
```json
{
  "name": "Nome do App",
  "description": "Descrição curta e impactante",
  "github_url": "URL do repositório privado",
  "hotmart_link": "https://pay.hotmart.com/H102919805E",
  "category": "SAAS / AI / etc",
  "status": "available",
  "created_at": "TIMESTAMP",
  "price": "R$ 4.210,00"
}
```

## Protocolo
1. **Verificação:** Antes de listar, confirme com o Atlas se o repo GitHub foi criado com sucesso.
2. **Cadastro:** Use o comando `firebase` ou a ferramenta de gerenciamento de dados para inserir o documento na coleção `marketplace`.
3. **Confirmação:** Retorne o ID do documento gerado e o link da App Store.
