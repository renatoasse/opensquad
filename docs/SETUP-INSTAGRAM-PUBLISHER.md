# Como obter as chaves do Instagram Publisher

O skill **instagram-publisher** usa três variáveis no `.env` na raiz do projeto. Siga os passos abaixo para conseguir cada uma.

---

## 1. IMGBB_API_KEY (mais fácil)

O imgbb hospeda as imagens do carrossel temporariamente para o Instagram conseguir acessá-las.

1. Acesse **https://api.imgbb.com/**
2. Clique em **"Get API Key"**
3. Crie uma conta gratuita (e-mail e senha; não precisa de cartão)
4. Depois do login, a chave aparece na **página inicial** do painel
5. Copie e cole no `.env`:
   ```env
   IMGBB_API_KEY=sua_chave_aqui
   ```

---

## 2. INSTAGRAM_ACCESS_TOKEN e INSTAGRAM_USER_ID (Instagram Business + Facebook)

**Pré-requisitos:**

- Conta **Instagram Business** (ou Creator) vinculada a uma **Página do Facebook**
- Um **app** no [Facebook for Developers](https://developers.facebook.com/) (tipo **Empresa**)

### 2.1 Criar o app no Facebook (se ainda não tiver)

1. Acesse **https://developers.facebook.com/** e entre com sua conta Facebook
2. **Meus Apps** → **Criar App** → tipo **Empresa**
3. Dê um nome (ex.: "In100tiva Publisher") e crie
4. No painel do app: **Configurações** → **Básico** — anote o **ID do app** e o **Chave secreta do app** (clique em "Mostrar")

### 2.2 Vincular Instagram à Página do Facebook

1. Crie uma **Página do Facebook** (ou use uma existente): [facebook.com/pages/create](https://www.facebook.com/pages/create)
2. No **Instagram**: **Configurações** → **Conta** → **Vincular à Página do Facebook** e associe à página
3. Confirme que o perfil está como **Conta profissional** (Creator ou Empresa)

### 2.3 Adicionar produto "Instagram Graph API" ao app

1. No painel do app no Facebook for Developers: **Adicionar produto**
2. Em **Instagram**, clique em **Configurar** no **Instagram Graph API**
3. Não é obrigatório preencher "Token de usuário do Instagram" para o fluxo abaixo; você vai gerar o token pelo Graph API Explorer

### 2.4 Gerar o token de acesso (INSTAGRAM_ACCESS_TOKEN)

1. No painel do app: menu **Ferramentas** → **Graph API Explorer** (ou acesse [developers.facebook.com/tools/explorer](https://developers.facebook.com/tools/explorer))
2. No topo, no dropdown **Meta App**, selecione **seu app**
3. Clique em **"Gerar token de acesso"**
4. Na tela de permissões, marque:
   - **instagram_content_publish**
   - **instagram_basic**
   - **pages_read_engagement**
   - **pages_show_list** (se aparecer)
5. Clique em **Gerar token** e autorize quando o Facebook pedir — você receberá um token **curta duração** (cerca de 1 hora)

### 2.5 Trocar o token por um de longa duração (60 dias)

O token que você acabou de gerar expira em ~1 h. Para um token de **longa duração** (60 dias):

1. Abra esta URL no navegador (substitua os placeholders):
   ```
   https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=SEU_APP_ID&client_secret=SEU_APP_SECRET&fb_exchange_token=TOKEN_CURTO_QUE_VOCE_COPIOU
   ```
   - **SEU_APP_ID**: ID do app (Configurações → Básico)
   - **SEU_APP_SECRET**: Chave secreta do app (Configurações → Básico)
   - **TOKEN_CURTO_QUE_VOCE_COPIOU**: o token do passo 2.4

2. A resposta vem em JSON. Copie o valor de **`access_token`**
3. Cole no `.env`:
   ```env
   INSTAGRAM_ACCESS_TOKEN=token_longo_aqui
   ```

**Importante:** esse token expira em **60 dias**. Repita o processo (2.4 e 2.5) para renovar.

### 2.6 Descobrir o INSTAGRAM_USER_ID

O "User ID" que o skill usa é o **ID da conta de negócios do Instagram** (não o @ do perfil).

1. No **Graph API Explorer**, com o mesmo app e um token que tenha permissão `pages_read_engagement`:
2. No campo de pedido (GET), coloque:
   ```
   me/accounts
   ```
   Clique em **Enviar**
3. Na resposta, localize a **Página do Facebook** vinculada ao seu Instagram e anote o **`id`** dessa página (ex.: `123456789012345`)
4. Faça um novo GET (substitua `{page-id}` pelo id da página):
   ```
   {page-id}?fields=instagram_business_account
   ```
   Exemplo: `123456789012345?fields=instagram_business_account`
5. Na resposta, dentro de **`instagram_business_account`**, há um **`id`** — esse número é o **INSTAGRAM_USER_ID**
6. Cole no `.env`:
   ```env
   INSTAGRAM_USER_ID=id_numero_aqui
   ```

---

## Resumo do .env

Depois de preencher, o `.env` deve estar assim (com seus valores reais):

```env
IMGBB_API_KEY=abc123...
INSTAGRAM_ACCESS_TOKEN=EAAx...
INSTAGRAM_USER_ID=17841...
```

- **Nunca** commite o `.env` com as chaves preenchidas (coloque `.env` no `.gitignore`).
- Use sempre o `.env.example` como modelo sem valores sensíveis.

---

## Testar sem publicar (dry-run)

No passo de publicação do squad, escolha **"Fazer dry-run primeiro"**. O script fará todo o fluxo (upload no imgbb, criação dos containers no Instagram) **sem** publicar de fato. Assim você confere se as chaves e a conta estão corretas.
