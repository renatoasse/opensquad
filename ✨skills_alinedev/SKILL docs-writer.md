# Skill: Documentation Writer & Manual Generator
## Descrição
Especialista em ler a estrutura do projeto e gerar documentação técnica (README) e manuais de uso para o cliente final (White Label).

## Quando usar
No final do desenvolvimento (Fase 4), antes do deploy, ou quando solicitado "Gere a documentação".

## Instruções Técnicas

### 1. Análise de Contexto
- Leia o `package.json` para listar as dependências.
- Leia o arquivo `schema.sql` ou a estrutura do Supabase para documentar o Banco de Dados.
- Identifique as rotas principais em `src/app`.

### 2. Geração do README.md (Técnico)
Crie um arquivo `README.md` na raiz contendo:
- **Stack:** (Next.js, Tailwind, Supabase).
- **Setup:** Como rodar `npm install` e `npm run dev`.
- **Variáveis de Ambiente:** Liste as chaves necessárias no `.env`.
- **Estrutura de Pastas:** Explicação breve.

### 3. Geração do MANUAL_CLIENTE.md (White Label)
Crie um arquivo `docs/MANUAL_CLIENTE.md` focado no seu assinante:
- **Como Personalizar:** Passo a passo para acessar `/admin`, subir a Logo e alterar a Cor Principal.
- **Domínio Próprio:** Instruções de como configurar o CNAME (se aplicável).
- **Gestão de Usuários:** Como convidar membros para o time dele.

### 4. Atualização Automática
- Se os arquivos já existirem, leia-os primeiro e apenas adicione as novas funcionalidades detectadas, mantendo o histórico.
