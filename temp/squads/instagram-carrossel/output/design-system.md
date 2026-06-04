# Design System — Por Que o TSE Fez Isso Agora

## Color Palette
| Token | Value | Usage |
|-------|-------|-------|
| --bg-primary | #0A0E1A | Background principal — todos os slides |
| --bg-reflection | #0D1B35 | Background alternativo — slide de reflexão |
| --text-white | #FFFFFF | Texto principal |
| --text-secondary | #8899AA | Textos de suporte, fontes, slide numbers |
| --accent | #1E90FF | Dados em destaque, bordas, elementos vibrantes (electric blue) |
| --accent-light | rgba(30,144,255,0.15) | Background de destaques sutis, cards |

## Typography
| Element | Size | Weight | Color |
|---------|------|--------|-------|
| Hero question (slide 1) | 56px | 700 | #FFFFFF |
| Hero data / accent text | 64px | 900 | #1E90FF |
| Slide title | 44px | 700 | #FFFFFF |
| Body text | 30px | 400 | #FFFFFF |
| Emphasis body | 30px | 700 | #1E90FF |
| Source / caption | 22px | 400 | #8899AA |
| Slide number | 22px | 500 | #8899AA |

## Font Import
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;900&display=swap');
```

## Spacing
| Token | Value |
|-------|-------|
| --padding-h | 72px |
| --padding-v | 80px |
| --gap-sm | 16px |
| --gap-md | 24px |
| --gap-lg | 48px |
| --gap-xl | 72px |

## Slide Dimensions
- Largura: 1080px
- Altura: 1440px
- Aspect ratio: 3:4
- Safe area: 936×1280px (após padding)

## Special Treatments
- **Slide 1 (Hook)**: pergunta em 56px bold branco, "A resposta revela..." em accent blue, swipe arrow em accent
- **Slides de conteúdo**: título em topo (accent blue uppercase, 22px), corpo central em branco 30px, fonte em secondary 22px
- **Slide de reflexão (Slide 7)**: background #0D1B35 mais azulado, linha horizontal accent antes do texto, layout mais espaçado e centrado
- **Slide CTA (Slide 8)**: opções numeradas em accent blue, divisor horizontal accent, destaque em save/share

## CSS Token Block
```css
:root {
  --bg-primary: #0A0E1A;
  --bg-reflection: #0D1B35;
  --text-white: #FFFFFF;
  --text-secondary: #8899AA;
  --accent: #1E90FF;
  --accent-light: rgba(30,144,255,0.15);
  --font-family: 'Inter', sans-serif;
  --padding-h: 72px;
  --padding-v: 80px;
  --gap-sm: 16px;
  --gap-md: 24px;
  --gap-lg: 48px;
  --gap-xl: 72px;
}
```

## Rationale
Electric blue (#1E90FF) como accent conecta o tema tech/IA com a autoridade institucional do TSE. O deep navy (#0A0E1A) garante contraste máximo com texto branco (ratio 19:1). O slide de reflexão usa um azul ligeiramente mais claro (#0D1B35) para criar pausa visual sem quebrar o sistema.
