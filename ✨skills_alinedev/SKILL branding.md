# Skill: Branding & Design System
## Descrição
Gerencia a identidade visual dinâmica. Garante que o app possa mudar de "cara" baseando-se nas configurações do banco de dados.

## Quando usar
Ao configurar temas, CSS ou criar novos componentes visuais.

## Instruções Técnicas
1. **Zero Hex Codes:** PROIBIDO usar cores fixas (ex: `#000` ou `bg-blue-500`) no código.
2. **Tokens Semânticos:** Use apenas variáveis CSS ou classes utilitárias mapeadas (ex: `bg-primary`, `text-primary-foreground`).
3. **Gerador de Tema:** Crie scripts para converter uma cor base (ex: enviada pelo cliente no admin) em uma paleta completa (50 a 900) usando HSL.
4. **Tipografia:** Use `inter` como padrão, mas permita injeção de fontes via Google Fonts se configurado no `tenant`.