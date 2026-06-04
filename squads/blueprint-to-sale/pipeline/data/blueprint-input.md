# Blueprint Input — Auto-Fetch do Firebase

<!-- 
  MODO DE OPERAÇÃO: AUTOMÁTICO
  O Sage busca o último blueprint diretamente do Firestore.
  Este arquivo NÃO precisa ser preenchido manualmente.
-->

## Fonte de Dados

| Parâmetro | Valor |
|-----------|-------|
| **Firebase Project** | `studio-9411389430-61164` |
| **Coleção** | `blueprints` |
| **Query** | `orderBy('createdAt', 'desc').limit(1)` |
| **Autenticação** | via Firebase CLI (conta: contatoalinedev@gmail.com) |

## Schema Esperado (Firestore Document)

```typescript
interface Blueprint {
  userId: string;          // UID do Firebase Auth
  userEmail: string;       // Email do usuário (para oferta)
  userName: string;        // Nome do usuário
  userGithub?: string;     // GitHub username (para entrega)
  idea: string;            // Ideia de negócio completa
  appName?: string;        // Nome sugerido para o app
  problem?: string;        // Problema que resolve
  audience?: string;       // Público-alvo
  features?: string[];     // Features sugeridas
  createdAt: Timestamp;    // Data de criação
  status?: string;         // 'new' → 'processing' → 'offered' → 'sold'
}
```

## Fluxo de Status no Firestore

```
'new'        → Blueprint recém-criado (pronto para processar)
'processing' → Sage capturou e está analisando
'offered'    → Mercury enviou o email de oferta
'followup'   → Oracle enviou o email de follow-up
'sold'       → Compra confirmada
'delivered'  → Keeper entregou o repo
```

## Como Criar a Coleção (se não existir)

No Console Firebase ou via código, crie um documento de teste:
```javascript
await db.collection('blueprints').add({
  userId: 'test-user-001',
  userEmail: 'test@example.com',
  userName: 'Teste',
  idea: 'App de gestão financeira pessoal com IA',
  appName: 'FinBot',
  problem: 'Pessoas não controlam suas finanças',
  audience: 'Jovens adultos 25-35 anos',
  features: ['Dashboard', 'Categorização automática', 'Metas', 'Relatórios'],
  createdAt: new Date(),
  status: 'new'
});
```
