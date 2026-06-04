---
task: "Create Slides HTML"
order: 2
input:
  - carousel_draft: output/carousel-draft.md (copy final de cada slide)
  - design_system: output/design-system.md (sistema de design definido)
  - anti_patterns: pipeline/data/anti-patterns.md
output:
  - slide_html_files: Arquivos HTML individuais para cada slide em output/slides/
  - slide_preview: Preview do slide 1 verificado visualmente antes do batch
---

# Create Slides HTML

Cria os arquivos HTML auto-suficientes para cada slide do carrossel, seguindo rigorosamente o design system definido. Cada slide é um arquivo HTML independente de 1080×1440px.

## Process

1. **Carregar o design system.** Ler output/design-system.md. Copiar o CSS token block que será incluído no `<style>` de CADA arquivo HTML.

2. **Criar o template base HTML.** O template base inclui:
   - Doctype + meta viewport
   - Import do Google Fonts via @import no CSS
   - CSS reset mínimo (box-sizing, margin:0, padding:0)
   - CSS tokens do design system
   - Container fixo 1080×1440px com overflow:hidden

3. **Criar slide 1 (hook) como protótipo.** Implementar o slide 1 primeiro, com máxima atenção:
   - O dado principal (hero data) em fonte máxima, cor accent
   - Estrutura visual que comunica impacto imediato
   - Indicação visual de scroll (ex: arrow icon SVG ou texto "↓")
   - VERIFICAR VISUALMENTE antes de prosseguir

4. **Verificar slide 1 renderizado.** Usar a skill image-creator para renderizar o slide 1 como imagem. Verificar:
   - Texto legível e fora das bordas?
   - Contraste adequado?
   - Dado âncora em destaque visual máximo?
   - Layout equilibrado sem overflow?
   Se algo estiver errado, corrigir antes de criar os demais slides.

5. **Criar slides 2 a N-1 (conteúdo).** Para cada slide de conteúdo:
   - Reusar o template base e os tokens CSS
   - Variar o layout (não o sistema de design) para manter ritmo visual
   - Garantir que uma ideia por slide seja o princípio guia
   - Fonte body sempre ≥ 28px

6. **Criar slide de reflexão com tratamento especial.** Aplicar o tratamento visual definido no design system para o slide de reflexão (background alternativo ou layout espaçado diferenciado).

7. **Criar slide CTA final.** CTA com elemento visual de destaque e dois ações claras (save + engajamento).

8. **Organizar e nomear arquivos.** Salvar todos em `output/slides/`:
   - `output/slides/slide-01.html`
   - `output/slides/slide-02.html`
   - ...
   - `output/slides/slide-0N.html`

## HTML Template Structure

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=1080">
  <title>Slide [N] — [Título do Carrossel]</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;900&display=swap');
    
    * { box-sizing: border-box; margin: 0; padding: 0; }
    
    :root {
      /* [CSS tokens do design system — copiar do design-system.md] */
    }
    
    body {
      width: 1080px;
      height: 1440px;
      overflow: hidden;
      font-family: var(--font-family);
      background: var(--bg-primary);
      color: var(--text-white);
    }
    
    .slide {
      width: 1080px;
      height: 1440px;
      padding: var(--padding-v) var(--padding-h);
      display: flex;
      flex-direction: column;
      justify-content: center;
      position: relative;
      overflow: hidden;
    }
    
    /* Resto dos estilos específicos do slide */
  </style>
</head>
<body>
  <div class="slide">
    <!-- Conteúdo do slide aqui -->
  </div>
</body>
</html>
```

## Critical Rules for This Task

1. **NUNCA** usar JavaScript de qualquer tipo
2. **NUNCA** referenciar imagens externas que não sejam do Google Fonts CDN
3. **NUNCA** usar CSS frameworks externos (Bootstrap, Tailwind)
4. **NUNCA** usar fontes locais — apenas Google Fonts via @import
5. **SEMPRE** incluir o @import do Google Fonts no `<style>` de CADA arquivo HTML separadamente
6. **SEMPRE** usar o container body de 1080×1440px fixo — nunca responsivo
7. **SEMPRE** garantir que overflow: hidden está no body para evitar elementos cortados

## Quality Criteria

- [ ] Slide 1 renderizado e verificado visualmente antes dos demais
- [ ] Todos os slides usam os mesmos CSS tokens (mesma paleta, mesma fonte)
- [ ] Nenhum texto em nenhum slide ultrapassa os limites do container
- [ ] Font body ≥ 28px em todos os slides
- [ ] Slide de reflexão tem tratamento visual diferenciado conforme design system
- [ ] Nenhum JavaScript presente em nenhum arquivo
- [ ] Todos os arquivos são auto-suficientes (sem dependências relativas entre si)

## Veto Conditions

Rejeitar e corrigir se:
1. JavaScript encontrado em qualquer arquivo HTML
2. Qualquer CDN externo além do Google Fonts
3. Texto ultrapassando os limites do container (overflow visível)
4. Contraste entre texto e fundo < 4.5:1 em qualquer slide
